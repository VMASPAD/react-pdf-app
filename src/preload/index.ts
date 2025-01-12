import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
const fs = require('fs')

// Custom APIs for renderer
const api = {
  openFileDialog: (): Promise<string[]> => ipcRenderer.invoke('open-file-dialog'),
  openFileInEditor: (filePath: string): Promise<void> => ipcRenderer.invoke('open-file-in-editor', filePath),

  saveFile: (filePath: string, content: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, content, (err) => {
        if (err) {
          console.error('File saving error:', err)
          reject(err)
        } else {
          console.log('File saved successfully:', filePath)
          resolve(true)
        }
      })
    })
  },
  convertFile: (
    filePath: string
  ): Promise<{ success: boolean; convertedFilePath?: string; error?: string }> =>
    ipcRenderer.invoke('convert-file', filePath)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
