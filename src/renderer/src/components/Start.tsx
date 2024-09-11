import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import previewImage from '../assets/hmtl_logo.png'
import { Link, useNavigate } from 'react-router-dom'

function Start(): JSX.Element {
  const [data, setData] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [storedFiles, setStoredFiles] = useState<{ name: string; path: string }[]>([])
  const [fileContent, setFileContent] = useState<string>('')
  const navigate = useNavigate()
  useEffect(() => {
    const fetchStoredFiles = async () => {
      const files = await window.api.getStoredFiles()
      setStoredFiles(files)
    }

    fetchStoredFiles()
  }, [])

  const handleFileBrowse = async () => {
    const filePath = await window.api.openFileDialog()
    if (filePath) {
      setSelectedFile(filePath)
      const copiedPath = await window.api.copyFile(filePath)
      if (copiedPath) {
        const fileName = copiedPath.split(/[\\/]/).pop() || copiedPath // Handle both \ and /
        setStoredFiles((prevFiles) => [...prevFiles, { name: fileName, path: copiedPath }])
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:1000/getFolders')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const getDataArchive = async (filename: string) => {
    try {
      const response = await fetch(`http://localhost:1000/view/${filename}`)
      const content = await response.text()
      setFileContent(content)
      navigate('/editor', { state: { content } }) // Navegar y pasar el contenido del archivo
    } catch (error) {
      console.error('Error fetching file content:', error)
    }
  }
  return (
    <div className="flex h-screen">
      <div className="border-r-green-600 border-2 w-52 flex flex-col items-center">
        <ul className="flex flex-col items-center w-full overflow-auto">
          <li className="mb-10 bg-slate-400 w-full text-center">Recientes</li>
          <li className="mb-10 w-full text-center">Herramientas</li>
          <li className="mb-10 w-full text-center">Preferencias</li>
          <li className="mb-10 w-full text-center">Anotaciones</li>
        </ul>
      </div>

      <div className="flex flex-col w-full h-full">
        <div className="flex flex-row border-b-green-600 border-2 p-10 gap-10 w-full">
          <Input className="w-60" />
          <Button onClick={handleFileBrowse}>Abrir archivo</Button>
          <Button>2</Button>
        </div>

        <div className="p-10">
          <Collapsible className="w-[350px] space-y-2">
            {data.map((item, index) => (
              <div key={index}>
                <CollapsibleTrigger>
                  <p className="text-red-400">{item.toUpperCase()}</p>
                </CollapsibleTrigger>
                <br />
                <CollapsibleContent>
                  {item}
                  <div
                    className="p-10 flex-grow overflow-y-auto"
                    style={{ maxHeight: 'calc(100vh - 200px)' }}
                  >
                    <div className="grid grid-cols-4 gap-4">
                      {storedFiles.map((file, index) => (
                        <div key={index} className="border p-4 text-center">
                          <p>{file.name}</p>
                          <img src={previewImage} alt="File Preview" className="w-full h-auto" />
                          <button onClick={() => getDataArchive(file.name)}>Ver</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            ))}
          </Collapsible>
        </div>
      </div>
    </div>
  )
}

export default Start
