import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PDFViewer } from './PDFViewer'

export const ViewPDF = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { pdfUrl } = location.state || {}
  const completePdfUrl = 'http://localhost:4000/previewPdf/' + pdfUrl
  console.log(completePdfUrl)
  if (!pdfUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No PDF Selected</h2>
          <button onClick={() => navigate('/')} className="text-blue-500 hover:text-blue-600">
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Documents
        </button>
        <PDFViewer pdfUrl={completePdfUrl} />
      </div>
    </div>
  )
}
