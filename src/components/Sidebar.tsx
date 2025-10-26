import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Sidebar.css'

const Sidebar: React.FC = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="figma-sidebar">
      {/* Chiils Logo */}
      <div className="sidebar-logo">
        <div className="logo-container">
          <img alt="Chiils" className="logo-img" src="/src/assets/chiils-logo.svg" />
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
        
        <NavLink to="/lesson-order" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Lesson builder
        </NavLink>
        
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



