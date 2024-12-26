import { pdfjs } from 'react-pdf';

// Set the worker source using the correct path
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();
