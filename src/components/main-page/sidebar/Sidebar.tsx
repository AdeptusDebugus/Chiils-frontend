import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext.tsx'
import { useLessonBuilder } from '../../../contexts/LessonBuilderContext.tsx'
import { useAuthPrompt } from '../../../contexts/AuthPromptContext.tsx'
import { useUpgradePrompt } from '../../../contexts/UpgradePromptContext.tsx'
import './Sidebar.css'

const Sidebar: React.FC = () => {
  const { isAuthenticated, user } = useAuth()
  const { openAuthPrompt } = useAuthPrompt()
  const { openUpgradePrompt } = useUpgradePrompt()
  const { openLessonBuilder, isOpen } = useLessonBuilder()

  const handleLessonBuilderClick = () => {
    if (!isAuthenticated) {
      openAuthPrompt()
      return
    }

    if (user?.permissions && !user.permissions.can_use_builder) {
      openUpgradePrompt()
      return
    }

    openLessonBuilder()
  }

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
        <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Home
        </NavLink>

        <NavLink to="/open-library" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Open library
        </NavLink>

        <div
          className={`nav-item ${isOpen ? 'active' : ''}`}
          onClick={handleLessonBuilderClick}
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



