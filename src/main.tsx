import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { TimelineProvider } from './context/TimelineContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TimelineProvider>
      <App />
    </TimelineProvider>
  </React.StrictMode>,
)
