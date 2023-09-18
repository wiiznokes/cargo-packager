use std::{
    collections::{BTreeMap, BTreeSet, HashMap},
    path::{Path, PathBuf},
    process::Command,
};

use handlebars::{to_json, Handlebars};

#[cfg(windows)]
use crate::sign;
use crate::{
    config::{Config, ConfigExt, ConfigExtInternal, LogLevel, NSISInstallerMode},
    util::{self, download, download_and_verify, extract_zip, HashAlgorithm},
};

// URLS for the NSIS toolchain.
#[cfg(target_os = "windows")]
const NSIS_URL: &str =
    "https://github.com/tauri-apps/binary-releases/releases/download/nsis-3.9/nsis-3.09.zip";
#[cfg(target_os = "windows")]
const NSIS_SHA1: &str = "586855a743a6e0ade203d8758af303a48ee0716b";
const NSIS_APPLICATIONID_URL: &str = "https://github.com/tauri-apps/binary-releases/releases/download/nsis-plugins-v0/NSIS-ApplicationID.zip";
const NSIS_TAURI_UTILS: &str =
  "https://github.com/tauri-apps/nsis-tauri-utils/releases/download/nsis_tauri_utils-v0.2.1/nsis_tauri_utils.dll";
const NSIS_TAURI_UTILS_SHA1: &str = "53A7CFAEB6A4A9653D6D5FBFF02A3C3B8720130A";

#[cfg(target_os = "windows")]
const NSIS_REQUIRED_FILES: &[&str] = &[
    "makensis.exe",
    "Bin/makensis.exe",
    "Stubs/lzma-x86-unicode",
    "Stubs/lzma_solid-x86-unicode",
    "Plugins/x86-unicode/ApplicationID.dll",
    "Plugins/x86-unicode/nsis_tauri_utils.dll",
    "Include/MUI2.nsh",
    "Include/FileFunc.nsh",
    "Include/x64.nsh",
    "Include/nsDialogs.nsh",
    "Include/WinMessages.nsh",
];
#[cfg(not(target_os = "windows"))]
const NSIS_REQUIRED_FILES: &[&str] = &[
    "Plugins/x86-unicode/ApplicationID.dll",
    "Plugins/x86-unicode/nsis_tauri_utils.dll",
];

type DirectoriesSet = BTreeSet<PathBuf>;
type ResourcesMap = Vec<(PathBuf, PathBuf)>;
fn generate_resource_data(config: &Config) -> crate::Result<(DirectoriesSet, ResourcesMap)> {
    let mut directories = BTreeSet::new();
    let mut resources_map = Vec::new();
    for r in config.resources()? {
        directories.insert(
            r.target
                .parent()
                .unwrap_or_else(|| Path::new(""))
                .to_path_buf(),
        );
        resources_map.push((r.src, r.target))
    }
    Ok((directories, resources_map))
}

/// BTreeMap<OriginalPath, TargetFileName>
type BinariesMap = BTreeMap<PathBuf, String>;
fn generate_binaries_data(config: &Config) -> crate::Result<BinariesMap> {
    let mut binaries = BinariesMap::new();
    let cwd = std::env::current_dir()?;

    if let Some(external_binaries) = &config.external_binaries {
        for src in external_binaries {
            let binary_path = dunce::canonicalize(cwd.join(src))?;
            let dest_filename = binary_path
                .file_name()
                .expect("failed to extract external binary filename")
                .to_string_lossy()
                .replace(&format!("-{}", config.target_triple()), "");
            binaries.insert(binary_path, dest_filename);
        }
    }

    for bin in &config.binaries {
        if !bin.main {
            let bin_path = config.binary_path(bin);
            let dest_filename = bin_path
                .file_name()
                .expect("failed to extract binary filename")
                .to_string_lossy()
                .to_string();
            binaries.insert(bin_path, dest_filename);
        }
    }

    Ok(binaries)
}

fn get_lang_data(
    lang: &str,
    custom_lang_files: Option<&HashMap<String, PathBuf>>,
) -> crate::Result<Option<(PathBuf, Option<&'static str>)>> {
    if let Some(path) = custom_lang_files.and_then(|h| h.get(lang)) {
        return Ok(Some((dunce::canonicalize(path)?, None)));
    }

    let lang_path = PathBuf::from(format!("{lang}.nsh"));
    let lang_content = match lang.to_lowercase().as_str() {
        "arabic" => Some(include_str!("./languages/Arabic.nsh")),
        "bulgarian" => Some(include_str!("./languages/Bulgarian.nsh")),
        "dutch" => Some(include_str!("./languages/Dutch.nsh")),
        "english" => Some(include_str!("./languages/English.nsh")),
        "japanese" => Some(include_str!("./languages/Japanese.nsh")),
        "korean" => Some(include_str!("./languages/Korean.nsh")),
        "portuguesebr" => Some(include_str!("./languages/PortugueseBR.nsh")),
        "tradchinese" => Some(include_str!("./languages/TradChinese.nsh")),
        "simpchinese" => Some(include_str!("./languages/SimpChinese.nsh")),
        "french" => Some(include_str!("./languages/French.nsh")),
        "spanish" => Some(include_str!("./languages/Spanish.nsh")),
        "spanishinternational" => Some(include_str!("./languages/SpanishInternational.nsh")),
        "persian" => Some(include_str!("./languages/Persian.nsh")),
        "turkish" => Some(include_str!("./languages/Turkish.nsh")),
        "swedish" => Some(include_str!("./languages/Swedish.nsh")),
        _ => return Ok(None),
    };

    Ok(Some((lang_path, lang_content)))
}

fn write_ut16_le_with_bom<P: AsRef<Path>>(path: P, content: &str) -> crate::Result<()> {
    use std::fs::File;
    use std::io::{BufWriter, Write};

    let file = File::create(path)?;
    let mut output = BufWriter::new(file);
    output.write_all(&[0xFF, 0xFE])?; // the BOM part
    for utf16 in content.encode_utf16() {
        output.write_all(&utf16.to_le_bytes())?;
    }
    Ok(())
}

fn handlebars_or(
    h: &handlebars::Helper<'_, '_>,
    _: &Handlebars<'_>,
    _: &handlebars::Context,
    _: &mut handlebars::RenderContext<'_, '_>,
    out: &mut dyn handlebars::Output,
) -> handlebars::HelperResult {
    let param1 = h.param(0).unwrap().render();
    let param2 = h.param(1).unwrap();

    out.write(&if param1.is_empty() {
        param2.render()
    } else {
        param1
    })?;
    Ok(())
}

fn association_description(
    h: &handlebars::Helper<'_, '_>,
    _: &Handlebars<'_>,
    _: &handlebars::Context,
    _: &mut handlebars::RenderContext<'_, '_>,
    out: &mut dyn handlebars::Output,
) -> handlebars::HelperResult {
    let description = h.param(0).unwrap().render();
    let ext = h.param(1).unwrap();

    out.write(&if description.is_empty() {
        format!("{} File", ext.render().to_uppercase())
    } else {
        description
    })?;
    Ok(())
}

fn unescape_newlines(
    h: &handlebars::Helper<'_, '_>,
    _: &Handlebars<'_>,
    _: &handlebars::Context,
    _: &mut handlebars::RenderContext<'_, '_>,
    out: &mut dyn handlebars::Output,
) -> handlebars::HelperResult {
    let s = h.param(0).unwrap().render();
    out.write(&s.replace("$\\n", "\n"))?;
    Ok(())
}

fn add_build_number_if_needed(version_str: &str) -> crate::Result<String> {
    let version = semver::Version::parse(version_str)?;
    if !version.build.is_empty() {
        let build = version.build.parse::<u64>();
        if build.is_ok() {
            return Ok(format!(
                "{}.{}.{}.{}",
                version.major, version.minor, version.patch, version.build
            ));
        } else {
            return Err(crate::Error::NonNumericBuildMetadata(None));
        }
    }

    Ok(format!(
        "{}.{}.{}.0",
        version.major, version.minor, version.patch,
    ))
}

fn get_and_extract_nsis(
    nsis_toolset_path: &Path,
    _packager_tools_path: &Path,
) -> crate::Result<()> {
    #[cfg(target_os = "windows")]
    {
        let data = download_and_verify("nsis-3.09.zip", NSIS_URL, NSIS_SHA1, HashAlgorithm::Sha1)?;
        log::info!(action = "Extracting"; "nsis-3.09.zip");
        extract_zip(&data, _packager_tools_path)?;
        std::fs::rename(_packager_tools_path.join("nsis-3.09"), nsis_toolset_path)?;
    }

    let nsis_plugins = nsis_toolset_path.join("Plugins");

    let data = download(NSIS_APPLICATIONID_URL)?;
    log::info!(action = "Extracting"; "NSIS ApplicationID plugin");
    extract_zip(&data, &nsis_plugins)?;

    std::fs::create_dir_all(nsis_plugins.join("x86-unicode"))?;

    std::fs::copy(
        nsis_plugins
            .join("ReleaseUnicode")
            .join("ApplicationID.dll"),
        nsis_plugins.join("x86-unicode").join("ApplicationID.dll"),
    )?;

    let data = download_and_verify(
        "nsis_tauri_utils.dll",
        NSIS_TAURI_UTILS,
        NSIS_TAURI_UTILS_SHA1,
        HashAlgorithm::Sha1,
    )?;
    std::fs::write(
        nsis_plugins
            .join("x86-unicode")
            .join("nsis_tauri_utils.dll"),
        data,
    )?;

    Ok(())
}

fn build_nsis_app_installer(
    config: &Config,
    _nsis_toolset_path: &Path,
    _packager_tools_path: &Path,
) -> crate::Result<Vec<PathBuf>> {
    let arch = match config.target_arch()? {
        "x86_64" => "x64",
        "x86" => "x86",
        "aarch64" => "arm64",
        target => return Err(crate::Error::UnsupportedArch("nsis".into(), target.into())),
    };

    #[cfg(target_os = "windows")]
    {
        let main_binary = config.main_binary()?;
        let app_exe_source = config.binary_path(main_binary);
        sign::try_sign(&app_exe_source.with_extension("exe"), config)?;
    }

    #[cfg(not(target_os = "windows"))]
    log::warn!("Code signing is currently only supported on Windows hosts, skipping signing the main binary...");

    let output_path = config.out_dir().join("nsis").join(arch);
    if output_path.exists() {
        std::fs::remove_dir_all(&output_path)?;
    }
    std::fs::create_dir_all(&output_path)?;

    let mut data = BTreeMap::new();

    #[cfg(not(target_os = "windows"))]
    {
        let mut dir = dirs::cache_dir().unwrap();
        dir.extend(["cargo-packager", "NSIS", "Plugins", "x86-unicode"]);
        data.insert("additional_plugins_path", to_json(dir));
    }

    let bundle_id = config.identifier();
    let manufacturer = config.publisher();

    data.insert("arch", to_json(arch));
    data.insert("bundle_id", to_json(bundle_id));
    data.insert("manufacturer", to_json(manufacturer));
    data.insert("product_name", to_json(&config.product_name));
    data.insert("short_description", to_json(&config.description));
    data.insert("copyright", to_json(&config.copyright));
    data.insert("version", to_json(&config.version));
    data.insert(
        "version_with_build",
        to_json(add_build_number_if_needed(&config.version)?),
    );
    data.insert(
        "allow_downgrades",
        to_json(config.windows().map(|w| w.allow_downgrades)),
    );

    #[cfg(target_os = "windows")]
    {
        use sign::ConfigSignExt;
        if config.can_sign() {
            data.insert(
                "uninstaller_sign_cmd",
                to_json(format!(
                    "{:?}",
                    sign::sign_command("%1", &config.sign_params())?.0
                )),
            );
        }
    }

    if let Some(license) = &config.license_file {
        data.insert("license", to_json(dunce::canonicalize(license)?));
    }

    let mut install_mode = NSISInstallerMode::CurrentUser;
    let mut languages = vec!["English".into()];
    let mut custom_template_path = None;
    let mut custom_language_files = None;
    if let Some(nsis) = config.nsis() {
        custom_template_path = nsis.template.clone();
        custom_language_files = nsis.custom_language_files.clone();
        install_mode = nsis.install_mode;
        if let Some(langs) = &nsis.languages {
            languages.clear();
            languages.extend_from_slice(langs);
        }
        data.insert(
            "display_language_selector",
            to_json(nsis.display_language_selector && languages.len() > 1),
        );
        if let Some(installer_icon) = &nsis.installer_icon {
            data.insert(
                "installer_icon",
                to_json(dunce::canonicalize(installer_icon)?),
            );
        }
        if let Some(header_image) = &nsis.header_image {
            data.insert("header_image", to_json(dunce::canonicalize(header_image)?));
        }
        if let Some(sidebar_image) = &nsis.sidebar_image {
            data.insert(
                "sidebar_image",
                to_json(dunce::canonicalize(sidebar_image)?),
            );
        }
        if let Some(preinstall_section) = &nsis.preinstall_section {
            data.insert("preinstall_section", to_json(preinstall_section));
        }
    }

    data.insert("install_mode", to_json(install_mode));

    let mut languages_data = Vec::new();
    for lang in &languages {
        if let Some(data) = get_lang_data(lang, custom_language_files.as_ref())? {
            languages_data.push(data);
        } else {
            log::warn!("Custom cargo-packager messages for {lang} are not translated.\nIf it is a valid language listed on <https://github.com/kichik/nsis/tree/9465c08046f00ccb6eda985abbdbf52c275c6c4d/Contrib/Language%20files>, please open a cargo-packager feature request\n or you can provide a custom language file for it in ` nsis.custom_language_files`");
        }
    }
    data.insert("languages", to_json(languages.clone()));
    data.insert(
        "language_files",
        to_json(
            languages_data
                .iter()
                .map(|d| d.0.clone())
                .collect::<Vec<_>>(),
        ),
    );

    let main_binary = config
        .binaries
        .iter()
        .find(|bin| bin.main)
        .ok_or_else(|| crate::Error::MainBinaryNotFound)?;
    data.insert("main_binary_name", to_json(&main_binary.filename));
    data.insert(
        "main_binary_path",
        to_json(config.binary_path(main_binary).with_extension("exe")),
    );

    if let Some(file_associations) = &config.file_associations {
        data.insert("file_associations", to_json(file_associations));
    }

    let out_file = "nsis-output.exe";
    data.insert("out_file", to_json(out_file));

    let (resources_dirs, resources) = generate_resource_data(config)?;
    data.insert("resources_dirs", to_json(resources_dirs));
    data.insert("resources", to_json(resources));

    let binaries = generate_binaries_data(config)?;
    data.insert("binaries", to_json(binaries));

    let mut handlebars = Handlebars::new();
    handlebars.register_helper("or", Box::new(handlebars_or));
    handlebars.register_helper("association-description", Box::new(association_description));
    handlebars.register_helper("unescape_newlines", Box::new(unescape_newlines));
    handlebars.register_escape_fn(|s| {
        let mut output = String::new();
        for c in s.chars() {
            match c {
                '\"' => output.push_str("$\\\""),
                '$' => output.push_str("$$"),
                '`' => output.push_str("$\\`"),
                '\n' => output.push_str("$\\n"),
                '\t' => output.push_str("$\\t"),
                '\r' => output.push_str("$\\r"),
                _ => output.push(c),
            }
        }
        output
    });
    if let Some(path) = custom_template_path {
        handlebars
            .register_template_string("installer.nsi", std::fs::read_to_string(path)?)
            .map_err(|e| e.to_string())
            .expect("Failed to setup custom handlebar template");
    } else {
        handlebars
            .register_template_string("installer.nsi", include_str!("./installer.nsi"))
            .map_err(|e| e.to_string())
            .expect("Failed to setup handlebar template");
    }

    write_ut16_le_with_bom(
        &output_path.join("FileAssociation.nsh"),
        include_str!("./FileAssociation.nsh"),
    )?;

    let installer_nsi_path = output_path.join("installer.nsi");
    write_ut16_le_with_bom(
        &installer_nsi_path,
        handlebars.render("installer.nsi", &data)?.as_str(),
    )?;

    for (lang, data) in languages_data.iter() {
        if let Some(content) = data {
            write_ut16_le_with_bom(output_path.join(lang).with_extension("nsh"), content)?;
        }
    }

    let nsis_output_path = output_path.join(out_file);
    let nsis_installer_path = config.out_dir().join(format!(
        "{}_{}_{}-setup.exe",
        main_binary.filename, config.version, arch
    ));
    std::fs::create_dir_all(nsis_installer_path.parent().unwrap())?;

    log::info!(action = "Running"; "makensis.exe to produce {}", util::display_path(&nsis_installer_path));

    #[cfg(target_os = "windows")]
    let mut nsis_cmd = Command::new(_nsis_toolset_path.join("makensis.exe"));
    #[cfg(not(target_os = "windows"))]
    let mut nsis_cmd = Command::new("makensis");

    let log_level = config.log_level.unwrap_or_default();

    let output = nsis_cmd
        .arg(match log_level {
            LogLevel::Error => "/V1",
            LogLevel::Warn => "/V2",
            LogLevel::Info => "/V3",
            LogLevel::Debug => "/V3",
            _ => "/V4",
        })
        .arg(installer_nsi_path)
        .current_dir(output_path)
        .output()
        .map_err(|e| crate::Error::NsisFailed(e.to_string()))?;

    util::log_if_needed_and_error_out(log_level, output)?;

    std::fs::rename(nsis_output_path, &nsis_installer_path)?;

    #[cfg(target_os = "windows")]
    sign::try_sign(&nsis_installer_path, config)?;
    #[cfg(not(target_os = "windows"))]
    log::warn!("Code signing is currently only supported on Windows hosts, skipping signing the installer...");

    Ok(vec![nsis_installer_path])
}

pub fn package(config: &Config) -> crate::Result<Vec<PathBuf>> {
    let packager_tools_path = dirs::cache_dir().unwrap().join("cargo-packager");
    let nsis_toolset_path = packager_tools_path.join("NSIS");

    if !nsis_toolset_path.exists() {
        get_and_extract_nsis(&nsis_toolset_path, &packager_tools_path)?;
    } else if NSIS_REQUIRED_FILES
        .iter()
        .any(|p| !nsis_toolset_path.join(p).exists())
    {
        log::warn!("NSIS directory is missing some files. Recreating it.");
        std::fs::remove_dir_all(&nsis_toolset_path)?;
        get_and_extract_nsis(&nsis_toolset_path, &packager_tools_path)?;
    }

    build_nsis_app_installer(config, &nsis_toolset_path, &packager_tools_path)
}
