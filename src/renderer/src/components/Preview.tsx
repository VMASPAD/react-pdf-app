import { Viewer, Worker } from '@react-pdf-viewer/core'
import React from 'react'

function Preview() {
  return (
    <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
    <Viewer fileUrl={'./entrada2.pdf'} />
  </Worker>
  )
}

export default Preview
