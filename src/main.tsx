import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { StudentProvider } from './components/contexts/providers/StudentProvider.tsx'
import { DeviceProvider } from './components/contexts/providers/DeviceProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StudentProvider>
        <DeviceProvider>
          <App />
        </DeviceProvider>
      </StudentProvider>
    </BrowserRouter>
  </StrictMode>,
)
