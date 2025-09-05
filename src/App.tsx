import React from 'react'
import LessonOrderForm from './components/LessonOrderForm'
import Sidebar from './components/Sidebar'
import './App.css'

function App() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <LessonOrderForm />
      </div>
    </div>
  )
}

export default App
