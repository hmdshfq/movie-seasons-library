import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CineMatch from './CineMatch.jsx'
import './global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CineMatch />
  </StrictMode>,
)
