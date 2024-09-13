import express from 'express'
import * as fs from 'fs'
import * as path from 'path'
import cors from 'cors'
import { srcApp } from '.'

export default function Server() {
  const server = express()
  const port = 1000
  server.use(cors())


  server.get('/view/:filename', (req, res) => {
    const { filename } = req.params
    console.log(filename)
    const filePath = path.join(srcApp, 'data/html', filename)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      console.log(content)
      res.send(content)
    } else {
      res.status(404).send('Archivo no encontrado')
    }
  })
  server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}
