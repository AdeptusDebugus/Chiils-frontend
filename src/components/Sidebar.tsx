import React from 'react'

const Sidebar: React.FC = () => {
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
          <div className="sidebar-item active">
            <div className="sidebar-item-icon">📝</div>
            <span>Order Lesson</span>
          </div>
          <div className="sidebar-item">
            <div className="sidebar-item-icon">📚</div>
            <span>My Lessons</span>
          </div>
          <div className="sidebar-item">
            <div className="sidebar-item-icon">⚙️</div>
            <span>Settings</span>
          </div>
        </div>

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

        <div className="sidebar-section">
          <div className="sidebar-section-title">Account</div>
          <div className="sidebar-item">
            <div className="sidebar-item-icon">👤</div>
            <span>Profile</span>
          </div>
          <div className="sidebar-item">
            <div className="sidebar-item-icon">💳</div>
            <span>Billing</span>
          </div>
          <div className="sidebar-item">
            <div className="sidebar-item-icon">❓</div>
            <span>Help & Support</span>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">U</div>
          <div className="user-details">
            <div className="user-name">User</div>
            <div className="user-email">user@example.com</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

