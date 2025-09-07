import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LessonOrderForm from './components/LessonOrderForm'
import LessonPage from './components/LessonPage'
import MyLessons from './components/MyLessons'
import Sidebar from './components/Sidebar'
import './App.css'

function App() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<LessonOrderForm />} />
          <Route path="/my-lessons" element={<MyLessons />} />
          <Route path="/my-lessons/:idx" element={<LessonPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
