import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import path from 'path'
import Server from './server'

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
  Server()
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

  ipcMain.handle('start-folders', async () => {
    const userDataPath = app.getPath('userData')
    const data = path.join(userDataPath, 'data')
    srcApp = userDataPath
    const pdf = path.join(data, 'pdf')
    const html = path.join(data, 'html')
    if (!fs.existsSync(data)) {
      fs.mkdirSync(data)
      fs.mkdirSync(pdf)
      fs.mkdirSync(html)
      const contenido = 'Hola, este es el contenido del archivo.';

      // Crear y escribir en el archivo
      fs.writeFile(`${html}/archivo.html`, contenido, (err) => {
        if (err) {
          console.error('Error al crear el archivo:', err);
        } else {
          console.log('Archivo creado exitosamente.');
        }
      });

      console.log(`Carpeta 'data' creada exitosamente.`)
    } else {
      console.log(`La carpeta 'data' ya existe.`)
    }
    return ['PDF', 'HTML']
  })

  ipcMain.handle('open-file-dialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'HTML Files', extensions: ['html'] }]
    })

    if (canceled) return null
    return filePaths[0] // Return the selected file path to the renderer
  })

  // Handle the file copying logic
  ipcMain.handle('copy-file', async (event, originalPath) => {
    if (!originalPath) return null

    // Get the user data path for storing the copied file
    const userDataPath = app.getPath('userData')
    const storageDir = path.join(userDataPath, 'PDFEditor')

    // Ensure the storage directory exists
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true })
    }

    const fileName = path.basename(originalPath)
    const destPath = path.join(storageDir, fileName)

    try {
      // Copy the file and return the new path
      fs.copyFileSync(originalPath, destPath)
      return destPath
    } catch (error) {
      console.error('Error copying file:', error)
      return null
    }
  })

  ipcMain.handle('get-stored-files', async () => {
    const userDataPath = app.getPath('userData')
    const storageDir = path.join(userDataPath, 'data')
    console.log(storageDir)
    // Ensure the storage directory exists
    if (!fs.existsSync(storageDir)) {
      return []
    }

    const files = fs.readdirSync(storageDir)
    return files.map((file) => ({
      name: file,
      path: path.join(storageDir, file)
    }))
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
