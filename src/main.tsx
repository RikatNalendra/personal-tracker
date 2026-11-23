import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ToastProvider } from './context/ToastContext'
import { DashboardProvider } from './context/DashboardContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <DashboardProvider>
        <App />
      </DashboardProvider>
    </ToastProvider>
  </React.StrictMode>,
)
