import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { debugConfig } from './lib/config'

// Debug configuration on app start (only in development)
if (import.meta.env.DEV) {
  debugConfig();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
