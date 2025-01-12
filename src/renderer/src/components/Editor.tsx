// Paso 1: Instalar las dependencias
// npm install grapesjs @types/grapesjs

import { useEffect, useRef } from 'react'
import grapesjs from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import { useLocation } from 'react-router-dom'
export default function Editor(): JSX.Element {
  const editorRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const { content } = location.state?.content || { content: '' }
  // Función para obtener el parámetro 'data' de la URL
  const getQueryParam = (param: string): string | null => {
    const searchParams = new URLSearchParams(location.search)
    return searchParams.get(param)
  }

  const data = getQueryParam('data')
  console.log(data)
  useEffect(() => {
    if (editorRef.current) {
      const editor = grapesjs.init({
        container: editorRef.current,
        fromElement: true,
        width: 'auto',
        storageManager: false,
        plugins: []
      })

      // Opcional: cargar contenido HTML inicial
      editor.setComponents(localStorage.getItem('archive') || '')
      return (): void => {
        editor.destroy()
      }
    }
  }, [data])

  return (
    <div ref={editorRef} style={{ height: '500px', border: '1px solid #ccc' }} id="gjss">
      {content}
    </div>
  )
}
