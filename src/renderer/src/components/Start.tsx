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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleGetHtmlFiles = async (): Promise<void> => {
    const files = await window.electron.ipcRenderer.invoke('getListArchiveHTML')
    console.log(files)
    setHtmlFiles(files)
  }

  const handleGetPdfFiles = async (): Promise<void> => {
    const files = await window.electron.ipcRenderer.invoke('getListArchivePDF')
    setPdfFiles(files)
  }

  // Abrir modal con el archivo seleccionado
  const handleFileClick = (file: File) => {
    setSelectedFile(file)
    setIsModalOpen(true)
  }

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedFile(null)
  }

  // Funcion para manejar seleccion de archivos (Mostrar html en archivos html y pdf en archivos pdf en la interfaz home)
  const handleFileSelect = async () => {
    console.log('estoy en la funcion de seleccion')

    // Open the file dialog
    const selectedFiles: string[] = await window.electron.ipcRenderer.invoke('open-file-dialog')

    // Ordena archivos en html o pdf
    const sortedHtmlFiles: File[] = []
    const sortedPdfFiles: File[] = []

    selectedFiles.forEach((filePath) => {
      if (filePath.endsWith('.html')) {
        sortedHtmlFiles.push({
          contentArchive: filePath,
          nameArchive: filePath.split('/').pop() || ''
        })
      } else if (filePath.endsWith('.pdf')) {
        sortedPdfFiles.push({
          contentArchive: filePath,
          nameArchive: filePath.split('/').pop() || ''
        })
      }
    })

    // Save files to the appropriate directories
    await Promise.all([
      saveFiles(sortedHtmlFiles, 'C:/data/html'),
      saveFiles(sortedPdfFiles, 'C:/data/pdf')
    ])

    // Refresh the file lists
    await handleGetHtmlFiles()
    await handleGetPdfFiles()
  }

  // Funcion para guardar archivos en directorios de pdf o html localmente
  const saveFiles = async (files: File[], destination: string) => {
    for (const file of files) {
      await window.electron.ipcRenderer.invoke('save-file', file.contentArchive, destination)
    }
  }

  // Funcion para conversion de archivos
  const handleFileClickConvert = async (file: File) => {
    try {
      // Extract file path from the clicked file
      const filePath = file.contentArchive // File content or path
      const fileName = file.nameArchive
      if (!filePath || !fileName) {
        alert('Invalid file selected.')
        return
      }

      // Send the file path to the backend for conversion
      const result = await window.electron.ipcRenderer.invoke('convert-file', {
        filePath: filePath,
        fileName: fileName
      })
      // Check if the conversion was successful
      if (result.success) {
        alert(`Archivo convertido exitosamente!`)
      } else {
        console.log(result.error)
        alert(`Conversion fallida: ${result.error}`)
      }
    } catch (error) {
      console.error('Error de conversion:', error)
      alert('Un error ocurrio durante la conversion.')
    }
  }

  return (
    <div>
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
            <Button onClick={handleFileSelect}>Subir archivo</Button>
          </div>

          <div className="p-10">
            <Collapsible>
              <CollapsibleTrigger>HTML</CollapsibleTrigger>
              <CollapsibleContent>
                <Button onClick={handleGetHtmlFiles}>Obtener Archivos HTML</Button>
                <ul>
                  {htmlFiles.map((file, index) => (
                    <li
                      key={index}
                      onClick={() => handleFileClick(file)}
                      style={{ cursor: 'pointer' }}
                    >
                      {file.nameArchive}
                    </li>
                  ))}
                </ul>

                {/* Pop-up Modal */}
                {isModalOpen && selectedFile && (
                  <div className="modal">
                    <div className="modal-content">
                      <h3>¿Qué deseas hacer con el archivo {selectedFile.nameArchive}?</h3>
                      <Link to={`/editor?data=${selectedFile.contentArchive}`}>
                        <button className="modal-button">Abrir en el editor</button>
                      </Link>
                      <button
                        className="modal-button"
                        onClick={() => handleFileClickConvert(selectedFile!)}
                      >
                        Convertir HTML a PDF
                      </button>
                      <button className="close-button" onClick={closeModal}>
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger>PDF</CollapsibleTrigger>
              <CollapsibleContent>
                <Button onClick={handleGetPdfFiles}>Obtener Archivos PDF</Button>
                <ul>
                  {pdfFiles.map((file, index) => (
                    <li
                      key={index}
                      onClick={() => handleFileClick(file)}
                      style={{ cursor: 'pointer' }}
                    >
                      {file.nameArchive}
                    </li>
                  ))}
                </ul>

                {/* Pop-up Modal */}
                {isModalOpen && selectedFile && (
                  <div className="modal">
                    <div className="modal-content">
                      <h3>¿Qué deseas hacer con el archivo {selectedFile.nameArchive}?</h3>
                      <Link
                        to={
                          `/editor?data=${selectedFile.contentArchive}` &&
                          localStorage.setItem('archive', selectedFile.contentArchive)
                        }
                      >
                        <button className="modal-button">Abrir en el editor</button>
                      </Link>
                      <button
                        className="modal-button"
                        onClick={() => handleFileClickConvert(selectedFile!)}
                      >
                        Convertir PDF a HTML
                      </button>
                      <button className="close-button" onClick={closeModal}>
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Basic styles for the modal */}
      <style jsx>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          text-align: center;
          border: 1px solid black; /* 1px border for modal */
        }
        .modal-button {
          padding: 5px;
          margin: 5px;
          border: 1px solid black; /* 1px border for buttons */
        }
        .close-button {
          padding: 5px;
          margin: 5px;
          background-color: red; /* Red background for the close button */
          color: white; /* White text for contrast */
          border: 1px solid black; /* 1px border for the close button */
        }
      `}</style>
    </div>
  )
}

export default Start
