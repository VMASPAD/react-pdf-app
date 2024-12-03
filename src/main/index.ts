import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
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
            nameArchive: file,
            contentArchive: content
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
            nameArchive: file,
            contentArchive: content
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

  ipcMain.handle('open-file-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'HTML Files', extensions: ['html'] },
        { name: 'PDF Files', extensions: ['pdf'] }
      ]
    })
    return result.filePaths
  })

  // Guardar archivos localmente
  ipcMain.handle('save-file', async (event, filePath, destination) => {
    const fileName = path.basename(filePath)
    const destPath = path.join(destination, fileName)

    try {
      // Ensure the destination folder exists
      await ensureDirectoryExists(destination)

      // Copy file to the destination directory
      await fs.promises.copyFile(filePath, destPath)

      console.log(`File copied to ${destPath}`)
      return destPath
    } catch (error) {
      console.error(`Error copying file: ${error}`)
      throw error
    } // Aca tendria que haber un result para notificar al usuario con una notificacion de que el archivo se subio correctamente. Ver cual libreria usamos para ese componente.
  })

  //Funcion para enviar archivo, esperar conversion remota y guardarlo localmente

  const handleFileConversion = async (fileName: { fileName: string }): Promise<void> => {


    const html = 'http://localhost:4000/convertHtml' // Remote server URL
    const pdf = 'http://localhost:4000/convertPdf' // Remote server URL

    // Determine the URL based on file extension
    const fileExtension = fileName.fileName.split('.').pop()?.toLowerCase()
    const conversionUrl = fileExtension === 'html' ? pdf : html
    console.log(conversionUrl)

    // Send request to the server
    const response = await fetch(conversionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: fileName.fileName }) // Send filename
    })

    // Check response status
    if (!response.ok) {
      console.log('Response:', await response.text())
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('Response:', result)

    if (!response.ok) {
      throw new Error('Conversion failed')
    }

    /*    // Get the response data
    const convertedFile = await response.json() // Assuming the server sends back the same format

    // Log the converted content for debugging
    console.log('Converted File:', convertedFile)

    // Now save the converted file (assuming convertedFile contains both the new content and filename)
    const { filePath: newFilePath, fileName: newFileName } = convertedFile

    // Determine where to save the file based on the new file extension
    const fileExtension = newFileName.split('.').pop() // Extract the file extension

    let newFullPath
    if (fileExtension === 'pdf') {
      // Save in the PDF folder
      newFullPath = `C:/data/pdf/${newFileName}`
    } else if (fileExtension === 'html') {
      // Save in the HTML folder
      newFullPath = `C:/data/html/${newFileName}`
    } else {
      throw new Error('Unsupported file type')
    }

    // Save the file
    fs.writeFileSync(newFullPath, newFilePath, 'utf8')
    console.log(`File saved at ${newFullPath}`) */
  }

  // IPC handler para accionar conversion de archivo
  ipcMain.handle('convert-file', async (event, filePath, fileName) => {
    console.log('estoy en el ipc handler')

    try {
      const convertedFilePath = await handleFileConversion(filePath)
      return { success: true, convertedFilePath }
    } catch (error) {
      console.error('File conversion error:', error)
      return { success: false, error: error.message }
    }
  })

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
