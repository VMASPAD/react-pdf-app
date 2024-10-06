import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Link } from 'react-router-dom'

type File = {
  contentArchive: string
  nameArchive: string
}
function Start(): JSX.Element {
  const [htmlFiles, setHtmlFiles] = useState<File[]>([])
  const [pdfFiles, setPdfFiles] = useState<File[]>([])

  const handleGetHtmlFiles = async (): Promise<void> => {
    const files = await window.electron.ipcRenderer.invoke('getListArchiveHTML')
    setHtmlFiles(files)
  }

  const handleGetPdfFiles = async (): Promise<void> => {
    const files = await window.electron.ipcRenderer.invoke('getListArchivePDF')
    setPdfFiles(files)
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
          <Button>2</Button>
        </div>

        <div className="p-10">
          <Collapsible>
            <CollapsibleTrigger>HTML</CollapsibleTrigger>
            <CollapsibleContent>
              <Button onClick={handleGetHtmlFiles}>Obtener Archivos HTML</Button>
              <ul>
                {htmlFiles.map((file, index) => (
                  <>
                    <Link to={'/editor?data=' + file.contentArchive} key={index}>
                      {file.nameArchive}
                    </Link>
                    <br />
                  </>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
          <Collapsible>
            <CollapsibleTrigger>PDF</CollapsibleTrigger>
            <CollapsibleContent>
              <Button onClick={handleGetPdfFiles}>Obtener Archivos PDF</Button>
              <ul>
                {pdfFiles.map((file, index) => (
                  <>
                    <Link to={'/editor?data=' + file.contentArchive} key={index}>
                      {file.nameArchive}
                    </Link>
                    <br />
                  </>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}

export default Start
