import express from 'express'
import * as fs from 'fs'
import * as path from 'path'

export default function Server() {
  const server = express()
  const port = 1000
  const createFolder = (): void => {
    const data = path.join(__dirname, 'data')
    const pdf = path.join(data, 'pdf')
    const html = path.join(data, 'html')
    if (!fs.existsSync(data)) {
      fs.mkdirSync(data)
      fs.mkdirSync(pdf)
      fs.mkdirSync(html)
      console.log(`Carpeta 'data' creada exitosamente.`)
    } else {
      console.log(`La carpeta 'data' ya existe.`)
    }
  }

  server.get('/getArchives', (req, res) => {
    createFolder()
    const getFolders = (): string[] => {
      return fs.readdirSync(path.join(__dirname, 'data')).filter((file) => {
        return fs.statSync(path.join(path.join(__dirname, 'data'), file)).isDirectory()
      })
    }
    const folders = getFolders()
    res.send(folders)
  })

  server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}
