import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLessonBuilder } from '../contexts/LessonBuilderContext'
import './Sidebar.css'

const Sidebar: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const { openLessonBuilder, isOpen } = useLessonBuilder()

  return (
    <div className="figma-sidebar">
      {/* Chiils Logo */}
      <div className="sidebar-logo">
        <div className="logo-container">
          <img alt="Chiils" className="logo-img" src="/assets/chiils-black-logo.svg" />
        </div>
      </div>

      {/* Navigation Items - Text Only */}
      <div className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Home
        </NavLink>

        <NavLink to="/open-library" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Open library
        </NavLink>

        <div
          className={`nav-item ${isOpen ? 'active' : ''}`}
          onClick={openLessonBuilder}
          style={{ cursor: 'pointer' }}
        >
          Lesson builder
        </div>



        {isAuthenticated && (
          <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Profile
          </NavLink>
        )}
      </div>
    </div>
  )
}

export default Sidebar



