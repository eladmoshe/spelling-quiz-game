import React from 'react'
import ReactDOM from 'react-dom/client'
import SpellingApp from './spelling-app'
import TestComponent from './test'
import './index.css'

const App = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <TestComponent />
        <div className="mt-4">
          <SpellingApp />
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
