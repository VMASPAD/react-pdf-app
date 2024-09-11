import './assets/index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Editor from './components/Editor'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/editor',
    element: <Editor />
  },
  {
    path: '/view/:filename',
    element: <Editor />,
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RouterProvider router={router} />
)
