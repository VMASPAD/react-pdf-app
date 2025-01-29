import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Link } from 'react-router-dom'
import { FaFilePdf, FaHtml5 } from 'react-icons/fa'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

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

  // Funcion para manejar seleccion de archivos (Mostrar html en archivos html y pdf en archivos pdf en la interfaz home)
  const handleFileSelect = async () => {

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
  useEffect(() => {
    handleGetHtmlFiles()
    handleGetPdfFiles()
  }, [])
  return (
    <div>
      <div className="flex h-screen">
        {/* Sidebar Izquierda */}
        <div className="mt-12 fixed top-0 left-0 h-screen border-r-gray-200 border-2 w-52 flex flex-col items-center bg-white z-10">
          <ul className="flex flex-col items-center w-full overflow-auto">
            <li className="mb-10 rounded-lg p-2 text-center hover:bg-slate-300 transition-colors duration-300">
              <Link to={'/notes'}>Anotaciones</Link>
            </li>
          </ul>
        </div>

        {/* Sidebar Arriba */}
        <div className="ml-52 flex flex-col w-full h-full">
          <div className="mt-12 fixed top-0 left-52 right-0 h-16 border-b-2 border-gray-200 bg-white z-10 p-4 flex items-center gap-4">
            <Input className="w-60" />
            <Button onClick={handleFileSelect}>Subir archivo</Button>
          </div>
          {/* Contenido */}

          <div className="p-10 mt-14 grid grid-rows-2 gap-5">
            <Accordion type="single" collapsible>
              <AccordionItem value="HTML">
                <AccordionTrigger>HTML</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-row gap-5 items-center">
                    {htmlFiles.map((file, index) => (
                      <div key={index} className="flex flex-col gap-2 items-center">
                        <FaHtml5 className="fill-orange-500" size={50} />

                        <Dialog>
                          <DialogTrigger>View {file.nameArchive}</DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                <p className="text-2xl">{file.nameArchive}</p>
                              </DialogTitle>
                              <DialogDescription>
                                <p>Que desea hacer?</p>
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button>Ver {file.nameArchive}</Button>
                              <Link to={`/editor?data=${selectedFile?.contentArchive}`}>
                                <Button> Abrir en el editor</Button>
                              </Link>
                              <Button onClick={() => handleFileClickConvert(selectedFile!)}>
                                Convertir HTML a PDF
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible>
              <AccordionItem value="PDF">
                <AccordionTrigger>PDF</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-row gap-5 items-center">
                    {pdfFiles.map((file, index) => (
                      <div key={index} className="flex flex-col gap-2 items-center">
                        <FaFilePdf className="fill-red-500" size={50} />
                        <Dialog>
                          <DialogTrigger>View {file.nameArchive}</DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{file.nameArchive}</DialogTitle>
                              <DialogDescription>
                                This action cannot be undone. This will permanently delete your
                                account and remove your data from our servers.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Link
                                to={
                                  `/editor?data=${selectedFile?.contentArchive}` &&
                                  localStorage.setItem('archive', selectedFile?.contentArchive)
                                }
                              >
                                <Button className="modal-button">Abrir en el editor</Button>
                              </Link>
                              <Link
                                to={`/preview/${selectedFile?.nameArchive}`}
                                key={selectedFile?.nameArchive}
                                state={{ pdfUrl: selectedFile?.nameArchive }}
                              >
                                <Button>Preview</Button>
                              </Link>
                              <Button onClick={() => handleFileClickConvert(selectedFile!)}>
                                Convertir PDF a HTML
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Basic styles for the modal */}
    </div>
  )
}

export default Start
