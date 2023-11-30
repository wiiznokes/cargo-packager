/* tslint:disable */
/* eslint-disable */

/* auto-generated by NAPI-RS */

export const enum WindowsUpdateInstallMode {
  /** Specifies there's a basic UI during the installation process, including a final dialog box at the end. */
  BasicUi = 0,
  /**
   * The quiet mode means there's no user interaction required.
   * Requires admin privileges if the installer does.
   */
  Quiet = 1,
  /** Specifies unattended mode, which means the installation only shows a progress bar. */
  Passive = 2
}
export interface UpdaterWindowsOptions {
  /** Additional arguments given to the NSIS or WiX installer. */
  installerArgs?: Array<string>
  /** The installation mode for the update on Windows. Defaults to `passive`. */
  installMode?: WindowsUpdateInstallMode
}
export interface Options {
  /** The updater endpoints. */
  endpoints: Array<string>
  /** Signature public key. */
  pubkey: string
  /** The Windows options for the updater. */
  windows?: UpdaterWindowsOptions
  /** The target of the executable. */
  target?: string
  /** Path to the executable file. */
  executablePath?: string
  /** Headers to use when checking and when downloading the update. */
  headers?: Record<string, string>
  /** Request timeout in milliseconds. */
  timeout?: number
}
/** Supported update format */
export const enum UpdateFormat {
  /** The NSIS installer (.exe). */
  Nsis = 0,
  /** The Microsoft Software Installer (.msi) through WiX Toolset. */
  Wix = 1,
  /** The Linux AppImage package (.AppImage). */
  AppImage = 2,
  /** The macOS application bundle (.app). */
  App = 3
}
export function checkUpdate(currentVersion: string, options: Options): Promise<Update | null>
export class Update {
  /** Signing public key */
  pubkey: string
  /** Version used to check for update */
  currentVersion: string
  /** Version announced */
  version: string
  /** Target */
  target: string
  /** Extract path */
  extractPath: string
  /** Download URL announced */
  downloadUrl: string
  /** Signature announced */
  signature: string
  /** Request headers */
  headers: Record<string, string>
  /** Update format */
  format: UpdateFormat
  /** The Windows options for the updater. */
  windows: UpdaterWindowsOptions
  /** Update description */
  body?: string
  /** Update publish date */
  date?: string
  /** Request timeout */
  timeout?: number
  download(onChunk?: (chunkLength: number, contentLength: number | null) => void, onDownloadFinished?: () => void): Promise<Array<number>>
  install(bytes: Array<number>): Promise<void>
  downloadAndInstall(onChunk?: (chunkLength: number, contentLength?: number) => void, onDownloadFinished?: () => void): Promise<void>
}
