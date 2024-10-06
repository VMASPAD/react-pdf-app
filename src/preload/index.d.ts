import { ElectronAPI } from '@electron-toolkit/preload'

interface api{
  getListArchiveHTML: () => Promise<void>
  getListArchivePDF: () => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: api
  }
}
