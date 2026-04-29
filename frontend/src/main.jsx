import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SnackbarProvider } from './components/SnackbarProvider'
import SnackbarContainer from './components/SnackbarContainer'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error("No se encontró el elemento raíz de la app")
}

createRoot(rootElement).render(
  <StrictMode>
    <SnackbarProvider>
      <App />
      <SnackbarContainer />
    </SnackbarProvider>
  </StrictMode>,
)
