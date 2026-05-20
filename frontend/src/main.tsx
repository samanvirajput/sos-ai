import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'

// Cursor blink keyframe (used by streaming indicator in MessageBubble)
const style = document.createElement('style')
style.textContent = `@keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }`
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
