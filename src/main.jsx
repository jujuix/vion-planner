import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './v2/AppV2.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)