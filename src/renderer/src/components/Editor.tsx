// Paso 1: Instalar las dependencias
// npm install grapesjs @types/grapesjs

import React, { useEffect, useRef } from 'react'
import grapesjs from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'

export default function Editor(html: string): JSX.Element {
  const editorRef = useRef<HTMLDivElement>(null)

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
      editor.setComponents(html)
      editor.addComponents({
        type: 'text',
        content: html,
        style: { color: 'black', fontSize: '20px' }
      })
      return () => {
        editor.destroy()
      }
    }
  }, [html])

  return (
    <div ref={editorRef} style={{ height: '500px', border: '1px solid #ccc' }} id="gjss">
      <p>Editor</p>
    </div>
  )
}
