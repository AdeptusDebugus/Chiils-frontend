import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Sidebar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">RT</div>
          <span className="logo-text">Real Talk</span>
        </div>
      </div>
      
      <div className="sidebar-content">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Getting Started</div>
          <NavLink to="/lesson-order" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="sidebar-item-icon">📝</div>
            <span>Order Lesson</span>
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/my-lessons" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <div className="sidebar-item-icon">📚</div>
              <span>My Lessons</span>
            </NavLink>
          )}
        </div>

        {isAuthenticated && (
          <div className="sidebar-section">
            <div className="sidebar-section-title">Account</div>
            <NavLink to="/profile" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <div className="sidebar-item-icon">👤</div>
              <span>Profile</span>
            </NavLink>
          </div>
        )}

        <div className="sidebar-section">
          <div className="sidebar-section-title">Resources</div>
          <div className="sidebar-item">
            <div className="sidebar-item-icon">🎥</div>
            <span>Video Library</span>
          </div>
          <div className="sidebar-item">
            <div className="sidebar-item-icon">📖</div>
            <span>Grammar Guide</span>
          </div>
          <div className="sidebar-item">
            <div className="sidebar-item-icon">💬</div>
            <span>Community</span>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        {isAuthenticated ? (
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-email">{user?.email || ''}</div>
            </div>
          </div>
        ) : (
          <NavLink to="/login" className="sidebar-item">
            <div className="sidebar-item-icon">🔑</div>
            <span>Login</span>
          </NavLink>
        )}
      </div>
    </div>
  )
}

export default Sidebar



