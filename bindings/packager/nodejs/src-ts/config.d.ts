/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Describes a shell command to be executed when a CLI hook is triggered.
 */
export type HookCommand =
  | string
  | {
      /**
       * The script to execute.
       */
      script: string;
      /**
       * The working directory.
       */
      dir?: string | null;
      [k: string]: unknown;
    };
/**
 * An enum representing the available verbosity levels of the logger.
 */
export type LogLevel = "error" | "warn" | "info" | "debug" | "trace";
/**
 * The type of the package we're packaging.
 */
export type PackageFormat = "all" | "default" | "app" | "dmg" | "wix" | "nsis" | "deb" | "appimage";
/**
 * The possible app categories. Corresponds to `LSApplicationCategoryType` on macOS and the GNOME desktop categories on Debian.
 */
export type AppCategory =
  | "Business"
  | "DeveloperTool"
  | "Education"
  | "Entertainment"
  | "Finance"
  | "Game"
  | "ActionGame"
  | "AdventureGame"
  | "ArcadeGame"
  | "BoardGame"
  | "CardGame"
  | "CasinoGame"
  | "DiceGame"
  | "EducationalGame"
  | "FamilyGame"
  | "KidsGame"
  | "MusicGame"
  | "PuzzleGame"
  | "RacingGame"
  | "RolePlayingGame"
  | "SimulationGame"
  | "SportsGame"
  | "StrategyGame"
  | "TriviaGame"
  | "WordGame"
  | "GraphicsAndDesign"
  | "HealthcareAndFitness"
  | "Lifestyle"
  | "Medical"
  | "Music"
  | "News"
  | "Photography"
  | "Productivity"
  | "Reference"
  | "SocialNetworking"
  | "Sports"
  | "Travel"
  | "Utility"
  | "Video"
  | "Weather";
/**
 * *macOS-only**. Corresponds to CFBundleTypeRole
 */
export type BundleTypeRole = "editor" | "viewer" | "shell" | "qLGenerator" | "none";
/**
 * A path to a resource (with optional glob pattern) or an object of `src` and `target` paths.
 */
export type Resource =
  | string
  | {
      /**
       * The src file or directory, supports glob patterns.
       */
      src: string;
      /**
       * A relative path from the root of the final package.
       *
       * If `src` is a glob, this will always be treated as a directory where all globbed files will be placed under.
       */
      target: string;
      [k: string]: unknown;
    };
/**
 * A wix language.
 */
export type WixLanguage =
  | string
  | {
      /**
       * Idenitifier of this language, for example `en-US`
       */
      identifier: string;
      /**
       * The path to a locale (`.wxl`) file. See <https://wixtoolset.org/documentation/manual/v3/howtos/ui_and_localization/build_a_localized_version.html>.
       */
      path?: string | null;
      [k: string]: unknown;
    };
/**
 * Compression algorithms used in the NSIS installer.
 *
 * See <https://nsis.sourceforge.io/Reference/SetCompressor>
 */
export type NsisCompression = "zlib" | "bzip2" | "lzma" | "off";
/**
 * Install Modes for the NSIS installer.
 */
export type NSISInstallerMode = "currentUser" | "perMachine" | "both";

/**
 * The packaging config.
 */
export interface Config {
  /**
   * The JSON schema for the config.
   *
   * Setting this field has no effect, this just exists so we can parse the JSON correctly when it has `$schema` field set.
   */
  $schema?: string | null;
  /**
   * The app name, this is just an identifier that could be used to filter which app to package using `--packages` cli arg when there is multiple apps in the workspace or in the same config.
   *
   * This field resembles, the `name` field in `Cargo.toml` or `package.json`
   *
   * If `unset`, the CLI will try to auto-detect it from `Cargo.toml` or `package.json` otherwise, it will keep it unset.
   */
  name?: string | null;
  /**
   * Whether this config is enabled or not. Defaults to `true`.
   */
  enabled?: boolean;
  /**
   * The package's product name, for example "My Awesome App".
   */
  productName?: string;
  /**
   * The package's version.
   */
  version?: string;
  /**
   * The binaries to package.
   */
  binaries?: Binary[];
  /**
   * The application identifier in reverse domain name notation (e.g. `com.packager.example`). This string must be unique across applications since it is used in some system configurations. This string must contain only alphanumeric characters (A–Z, a–z, and 0–9), hyphens (-), and periods (.).
   */
  identifier?: string | null;
  /**
   * The command to run before starting to package an application.
   *
   * This runs only once.
   */
  beforePackagingCommand?: HookCommand | null;
  /**
   * The command to run before packaging each format for an application.
   *
   * This will run multiple times depending on the formats specifed.
   */
  beforeEachPackageCommand?: HookCommand | null;
  /**
   * The logging level.
   */
  logLevel?: LogLevel | null;
  /**
   * The packaging formats to create, if not present, [`PackageFormat::platform_default`] is used.
   */
  formats?: PackageFormat[] | null;
  /**
   * The directory where the [`Config::binaries`] exist and where the generated packages will be placed.
   */
  outDir?: string;
  /**
   * The target triple we are packaging for. This mainly affects [`Config::external_binaries`].
   *
   * Defaults to the current OS target triple.
   */
  targetTriple?: string | null;
  /**
   * The package's description.
   */
  description?: string | null;
  /**
   * The app's long description.
   */
  longDescription?: string | null;
  /**
   * The package's homepage.
   */
  homepage?: string | null;
  /**
   * The package's authors.
   */
  authors?: string[] | null;
  /**
   * The app's publisher. Defaults to the second element in [`Config::identifier`](Config::identifier) string. Currently maps to the Manufacturer property of the Windows Installer.
   */
  publisher?: string | null;
  /**
   * A path to the license file.
   */
  licenseFile?: string | null;
  /**
   * The app's copyright.
   */
  copyright?: string | null;
  /**
   * The app's category.
   */
  category?: AppCategory | null;
  /**
   * The app's icon list.
   */
  icons?: string[] | null;
  /**
   * The file associations
   */
  fileAssociations?: FileAssociation[] | null;
  /**
   * The app's resources to package. This a list of either a glob pattern, path to a file, path to a directory or an object of `src` and `target` paths. In the case of using an object, the `src` could be either a glob pattern, path to a file, path to a directory, and the `target` is a path inside the final resources folder in the installed package.
   *
   * ## Format-specific:
   *
   * - **[PackageFormat::Nsis] / [PackageFormat::Wix]**: The resources are placed next to the executable in the root of the packager. - **[PackageFormat::Deb]**: The resources are placed in `usr/lib` of the package.
   */
  resources?: Resource[] | null;
  /**
   * Paths to external binaries to add to the package.
   *
   * The path specified should not include `-<target-triple><.exe>` suffix, it will be auto-added when by the packager when reading these paths, so the actual binary name should have the target platform's target triple appended, as well as `.exe` for Windows.
   *
   * For example, if you're packaging an external binary called `sqlite3`, the packager expects a binary named `sqlite3-x86_64-unknown-linux-gnu` on linux, and `sqlite3-x86_64-pc-windows-gnu.exe` on windows.
   *
   * If you are building a universal binary for MacOS, the packager expects your external binary to also be universal, and named after the target triple, e.g. `sqlite3-universal-apple-darwin`. See <https://developer.apple.com/documentation/apple-silicon/building-a-universal-macos-binary>
   */
  externalBinaries?: string[] | null;
  /**
   * Windows-specific configuration.
   */
  windows?: WindowsConfig | null;
  /**
   * MacOS-specific configuration.
   */
  macos?: MacOsConfig | null;
  /**
   * Debian-specific configuration.
   */
  deb?: DebianConfig | null;
  /**
   * AppImage configuration.
   */
  appimage?: AppImageConfig | null;
  /**
   * WiX configuration.
   */
  wix?: WixConfig | null;
  /**
   * Nsis configuration.
   */
  nsis?: NsisConfig | null;
  /**
   * Dmg configuration.
   */
  dmg?: DmgConfig | null;
}
/**
 * A binary to package within the final package.
 */
export interface Binary {
  /**
   * Path to the binary (without `.exe` on Windows). If it's relative, it will be resolved from [`Config::out_dir`].
   */
  path: string;
  /**
   * Whether this is the main binary or not
   */
  main?: boolean;
}
/**
 * A file association configuration.
 */
export interface FileAssociation {
  /**
   * File extensions to associate with this app. e.g. 'png'
   */
  extensions: string[];
  /**
   * The mime-type e.g. 'image/png' or 'text/plain'. **Linux-only**.
   */
  mimeType?: string | null;
  /**
   * The association description. **Windows-only**. It is displayed on the `Type` column on Windows Explorer.
   */
  description?: string | null;
  /**
   * The name. Maps to `CFBundleTypeName` on macOS. Defaults to the first item in `ext`
   */
  name?: string | null;
  /**
   * The app’s role with respect to the type. Maps to `CFBundleTypeRole` on macOS. Defaults to [`BundleTypeRole::Editor`]
   */
  role?: BundleTypeRole & string;
}
/**
 * The Windows configuration.
 */
export interface WindowsConfig {
  /**
   * The file digest algorithm to use for creating file signatures. Required for code signing. SHA-256 is recommended.
   */
  digestAlgorithm?: string | null;
  /**
   * The SHA1 hash of the signing certificate.
   */
  certificateThumbprint?: string | null;
  /**
   * Whether to use Time-Stamp Protocol (TSP, a.k.a. RFC 3161) for the timestamp server. Your code signing provider may use a TSP timestamp server, like e.g. SSL.com does. If so, enable TSP by setting to true.
   */
  tsp?: boolean;
  /**
   * Server to use during timestamping.
   */
  timestampUrl?: string | null;
  /**
   * Whether to validate a second app installation, blocking the user from installing an older version if set to `false`.
   *
   * For instance, if `1.2.1` is installed, the user won't be able to install app version `1.2.0` or `1.1.5`.
   *
   * The default value of this flag is `true`.
   */
  allowDowngrades?: boolean;
}
/**
 * The macOS configuration.
 */
export interface MacOsConfig {
  /**
   * MacOS frameworks that need to be packaged with the app.
   *
   * Each string can either be the name of a framework (without the `.framework` extension, e.g. `"SDL2"`), in which case we will search for that framework in the standard install locations (`~/Library/Frameworks/`, `/Library/Frameworks/`, and `/Network/Library/Frameworks/`), or a path to a specific framework bundle (e.g. `./data/frameworks/SDL2.framework`).  Note that this setting just makes cargo-packager copy the specified frameworks into the OS X app bundle (under `Foobar.app/Contents/Frameworks/`); you are still responsible for:
   *
   * - arranging for the compiled binary to link against those frameworks (e.g. by emitting lines like `cargo:rustc-link-lib=framework=SDL2` from your `build.rs` script)
   *
   * - embedding the correct rpath in your binary (e.g. by running `install_name_tool -add_rpath "@executable_path/../Frameworks" path/to/binary` after compiling)
   */
  frameworks?: string[] | null;
  /**
   * A version string indicating the minimum MacOS version that the packaged app supports (e.g. `"10.11"`). If you are using this config field, you may also want have your `build.rs` script emit `cargo:rustc-env=MACOSX_DEPLOYMENT_TARGET=10.11`.
   */
  minimumSystemVersion?: string | null;
  /**
   * The exception domain to use on the macOS .app package.
   *
   * This allows communication to the outside world e.g. a web server you're shipping.
   */
  exceptionDomain?: string | null;
  /**
   * Code signing identity.
   */
  signingIdentity?: string | null;
  /**
   * Provider short name for notarization.
   */
  providerShortName?: string | null;
  /**
   * Path to the entitlements.plist file.
   */
  entitlements?: string | null;
  /**
   * Path to the Info.plist file for the package.
   */
  infoPlistPath?: string | null;
}
/**
 * The Linux debian configuration.
 */
export interface DebianConfig {
  /**
   * The list of debian dependencies.
   */
  depends?: string[] | null;
  /**
   * Path to a custom desktop file Handlebars template.
   *
   * Available variables: `categories`, `comment` (optional), `exec`, `icon` and `name`.
   *
   * Default file contents: ```text [Desktop Entry] Categories={{categories}} {{#if comment}} Comment={{comment}} {{/if}} Exec={{exec}} Icon={{icon}} Name={{name}} Terminal=false Type=Application {{#if mime_type}} MimeType={{mime_type}} {{/if}} ```
   */
  desktopTemplate?: string | null;
  /**
   * List of custom files to add to the deb package. Maps a dir/file to a dir/file inside the debian package.
   */
  files?: {
    [k: string]: string;
  } | null;
}
/**
 * The Linux AppImage configuration.
 */
export interface AppImageConfig {
  /**
   * List of libs that exist in `/usr/lib*` to be include in the final AppImage. The libs will be searched for, using the command `find -L /usr/lib* -name <libname>`
   */
  libs?: string[] | null;
  /**
   * List of binary paths to include in the final AppImage. For example, if you want `xdg-open`, you'd specify `/usr/bin/xdg-open`
   */
  bins?: string[] | null;
  /**
   * List of custom files to add to the appimage package. Maps a dir/file to a dir/file inside the appimage package.
   */
  files?: {
    [k: string]: string;
  } | null;
  /**
   * A map of [`linuxdeploy`](https://github.com/linuxdeploy/linuxdeploy) plugin name and its URL to be downloaded and executed while packaing the appimage. For example, if you want to use the [`gtk`](https://raw.githubusercontent.com/linuxdeploy/linuxdeploy-plugin-gtk/master/linuxdeploy-plugin-gtk.sh) plugin, you'd specify `gtk` as the key and its url as the value.
   */
  linuxdeployPlugins?: {
    [k: string]: string;
  } | null;
}
/**
 * The wix format configuration
 */
export interface WixConfig {
  /**
   * The app languages to build. See <https://docs.microsoft.com/en-us/windows/win32/msi/localizing-the-error-and-actiontext-tables>.
   */
  languages?: WixLanguage[] | null;
  /**
   * By default, the packager uses an internal template. This option allows you to define your own wix file.
   */
  template?: string | null;
  /**
   * List of merge modules to include in your installer. For example, if you want to include [C++ Redis merge modules]
   *
   * [C++ Redis merge modules]: https://wixtoolset.org/docs/v3/howtos/redistributables_and_install_checks/install_vcredist/
   */
  mergeModules?: string[] | null;
  /**
   * A list of paths to .wxs files with WiX fragments to use.
   */
  fragmentPaths?: string[] | null;
  /**
   * List of WiX fragments as strings. This is similar to `config.wix.fragments_paths` but is a string so you can define it inline in your config.
   *
   * ```text <?xml version="1.0" encoding="utf-8"?> <Wix xmlns="http://schemas.microsoft.com/wix/2006/wi"> <Fragment> <CustomAction Id="OpenNotepad" Directory="INSTALLDIR" Execute="immediate" ExeCommand="cmd.exe /c notepad.exe" Return="check" /> <InstallExecuteSequence> <Custom Action="OpenNotepad" After="InstallInitialize" /> </InstallExecuteSequence> </Fragment> </Wix> ```
   */
  fragments?: string[] | null;
  /**
   * The ComponentGroup element ids you want to reference from the fragments.
   */
  componentGroupRefs?: string[] | null;
  /**
   * The Component element ids you want to reference from the fragments.
   */
  componentRefs?: string[] | null;
  /**
   * The CustomAction element ids you want to reference from the fragments.
   */
  customActionRefs?: string[] | null;
  /**
   * The FeatureGroup element ids you want to reference from the fragments.
   */
  featureGroupRefs?: string[] | null;
  /**
   * The Feature element ids you want to reference from the fragments.
   */
  featureRefs?: string[] | null;
  /**
   * The Merge element ids you want to reference from the fragments.
   */
  mergeRefs?: string[] | null;
  /**
   * Path to a bitmap file to use as the installation user interface banner. This bitmap will appear at the top of all but the first page of the installer.
   *
   * The required dimensions are 493px × 58px.
   */
  bannerPath?: string | null;
  /**
   * Path to a bitmap file to use on the installation user interface dialogs. It is used on the welcome and completion dialogs. The required dimensions are 493px × 312px.
   */
  dialogImagePath?: string | null;
  /**
   * Enables FIPS compliant algorithms.
   */
  fipsCompliant?: boolean;
}
/**
 * The NSIS format configuration.
 */
export interface NsisConfig {
  /**
   * Set the compression algorithm used to compress files in the installer.
   *
   * See <https://nsis.sourceforge.io/Reference/SetCompressor>
   */
  compression?: NsisCompression | null;
  /**
   * A custom `.nsi` template to use.
   *
   * See the default template here <https://github.com/crabnebula-dev/cargo-packager/blob/main/crates/packager/src/nsis/installer.nsi>
   */
  template?: string | null;
  /**
   * Logic of an NSIS section that will be ran before the install section.
   *
   * See the available libraries, dlls and global variables here <https://github.com/crabnebula-dev/cargo-packager/blob/main/crates/packager/src/nsis/installer.nsi>
   *
   * ### Example ```toml [package.metadata.packager.nsis] preinstall-section = """ ; Setup custom messages LangString webview2AbortError ${LANG_ENGLISH} "Failed to install WebView2! The app can't run without it. Try restarting the installer." LangString webview2DownloadError ${LANG_ARABIC} "خطأ: فشل تنزيل WebView2 - $0"
   *
   * Section PreInstall ; <section logic here> SectionEnd
   *
   * Section AnotherPreInstall ; <section logic here> SectionEnd """ ```
   */
  preinstallSection?: string | null;
  /**
   * The path to a bitmap file to display on the header of installers pages.
   *
   * The recommended dimensions are 150px x 57px.
   */
  headerImage?: string | null;
  /**
   * The path to a bitmap file for the Welcome page and the Finish page.
   *
   * The recommended dimensions are 164px x 314px.
   */
  sidebarImage?: string | null;
  /**
   * The path to an icon file used as the installer icon.
   */
  installerIcon?: string | null;
  /**
   * Whether the installation will be for all users or just the current user.
   */
  installMode?: NSISInstallerMode & string;
  /**
   * A list of installer languages. By default the OS language is used. If the OS language is not in the list of languages, the first language will be used. To allow the user to select the language, set `display_language_selector` to `true`.
   *
   * See <https://github.com/kichik/nsis/tree/9465c08046f00ccb6eda985abbdbf52c275c6c4d/Contrib/Language%20files> for the complete list of languages.
   */
  languages?: string[] | null;
  /**
   * An key-value pair where the key is the language and the value is the path to a custom `.nsi` file that holds the translated text for cargo-packager's custom messages.
   *
   * See <https://github.com/crabnebula-dev/cargo-packager/blob/main/crates/packager/src/nsis/languages/English.nsh> for an example `.nsi` file.
   *
   * **Note**: the key must be a valid NSIS language and it must be added to [`NsisConfig`]languages array,
   */
  customLanguageFiles?: {
    [k: string]: string;
  } | null;
  /**
   * Whether to display a language selector dialog before the installer and uninstaller windows are rendered or not. By default the OS language is selected, with a fallback to the first language in the `languages` array.
   */
  displayLanguageSelector?: boolean;
  /**
   * List of paths where your app stores data. This options tells the uninstaller to provide the user with an option (disabled by default) whether they want to rmeove your app data or keep it.
   *
   * The path should use a constant from <https://nsis.sourceforge.io/Docs/Chapter4.html#varconstant> in addition to `$IDENTIFIER`, `$PUBLISHER` and `$PRODUCTNAME`, for example, if you store your app data in `C:\\Users\\<user>\\AppData\\Local\\<your-company-name>\\<your-product-name>` you'd need to specify ```toml [package.metadata.packager.nsis] appdata-paths = ["$LOCALAPPDATA/$PUBLISHER/$PRODUCTNAME"] ```
   */
  appdataPaths?: string[] | null;
}
/**
 * The Apple Disk Image (.dmg) configuration.
 */
export interface DmgConfig {
  /**
   * Image to use as the background in dmg file. Accepted formats: `png`/`jpg`/`gif`.
   */
  background?: string | null;
  /**
   * Position of volume window on screen.
   */
  windowPosition?: Position | null;
  /**
   * Size of volume window.
   */
  windowSize?: Size | null;
  /**
   * Position of application file on window.
   */
  appPosition?: Position | null;
  /**
   * Position of application folder on window.
   */
  appFolderPosition?: Position | null;
}
/**
 * Position coordinates struct.
 */
export interface Position {
  /**
   * X coordinate.
   */
  x: number;
  /**
   * Y coordinate.
   */
  y: number;
}
/**
 * Size struct.
 */
export interface Size {
  /**
   * Width.
   */
  width: number;
  /**
   * Height.
   */
  height: number;
}
