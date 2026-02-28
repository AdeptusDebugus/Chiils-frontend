import React from 'react'
import { NavLink, Link } from 'react-router-dom'
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
        <Link to="/" className="logo-container">
          <img alt="Chiils" className="logo-img" src="/assets/chiils-black-logo.svg" />
        </Link>
      </div>

      {/* Navigation Items - Text Only */}
      <div className="sidebar-nav">
        <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Home
        </NavLink>

        <NavLink to="/open-library" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Open library
        </NavLink>

        {user?.role !== 'STUDENT' && (
          <div
            className={`nav-item ${isOpen ? 'active' : ''}`}
            onClick={handleLessonBuilderClick}
            style={{ cursor: 'pointer' }}
          >
            Lesson builder
          </div>
        )}



        <a
          href="https://tally.so/r/KYlp6V"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-item support-link"
        >
          Support
        </a>
      </div>
    </div>
  )
}

export default Sidebar



