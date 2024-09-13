import { ElectronAPI } from '@electron-toolkit/preload'

interface api{
  startFolders: () => Promise<void>
  openFileDialog: () => Promise<string>
  copyFile: (filePath: string) => Promise<string>
  getStoredFiles: () => Promise<{ name: string; path: string }[]>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: api
  }
}
