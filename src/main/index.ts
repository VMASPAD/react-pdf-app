import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import path from 'path'

export let srcApp: string

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer based on electron-vite CLI.
  // Load the remote URL for development or the local HTML file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']!)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for Windows
  electronApp.setAppUserModelId('com.reactpdf')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Handle the file dialog
  const directoryPath = path.join('C:\\', 'data')
  console.log(directoryPath)

  async function ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.promises.access(dirPath)
    } catch (error) {
      await fs.promises.mkdir(dirPath, { recursive: true })
    }
  }

  // Asegurarse de que la carpeta 'data' exista
  ensureDirectoryExists(directoryPath).catch(console.error)

  ipcMain.handle('getListArchiveHTML', async () => {
    const htmlDir = path.join(directoryPath, 'html')
    await ensureDirectoryExists(htmlDir)

    try {
      const files = await fs.promises.readdir(htmlDir)
      const htmlFiles = files.filter((file) => path.extname(file) === '.html')

      const result = await Promise.all(
        htmlFiles.map(async (file) => {
          const filePath = path.join(htmlDir, file)
          const content = await fs.promises.readFile(filePath, 'utf-8')
          return {
            'nameArchive': file,
            'contentArchive': content
          }
        })
      )

      return result
    } catch (error) {
      console.error('Error reading directory:', error)
      throw error
    }
  })

  ipcMain.handle('getListArchivePDF', async () => {
    const pdfDir = path.join(directoryPath, 'pdf')
    await ensureDirectoryExists(pdfDir)

    try {
      const files = await fs.promises.readdir(pdfDir)
      const pdfFiles = files.filter((file) => path.extname(file) === '.pdf')

      const result = await Promise.all(
        pdfFiles.map(async (file) => {
          const filePath = path.join(pdfDir, file)
          const content = await fs.promises.readFile(filePath, 'utf-8')
          return {
            'nameArchive': file,
            'contentArchive': content
          }
        })
      )

      return result
    } catch (error) {
      console.error('Error reading directory:', error)
      throw error
    }
  })
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
