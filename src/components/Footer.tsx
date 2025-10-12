import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

// Local logo asset
const footerLogoPath = "/assets/chiils-footer-logo.svg"

const Footer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Get the total scrollable height
      const scrollHeight = document.documentElement.scrollHeight
      // Get the current scroll position
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      // Get the viewport height
      const clientHeight = window.innerHeight
      
      // If content is shorter than viewport, always show footer
      if (scrollHeight <= clientHeight) {
        setIsVisible(true)
        return
      }
      
      // Check if user has scrolled to the bottom (with a small threshold for better UX)
      const threshold = 50 // pixels from bottom
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold
      
      setIsVisible(isAtBottom)
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Add resize event listener to handle viewport changes
    window.addEventListener('resize', handleScroll, { passive: true })
    
    // Check initial state
    handleScroll()

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])
  return (
    <div className={`figma-footer ${isVisible ? 'footer-visible' : 'footer-hidden'}`}>
      {/* Main Footer Background */}
      <div className="footer-background">
        {/* Navigation Links - Exact Figma positioning */}
        <div className="footer-nav-links">
          <Link to="/" className="footer-nav-item">Home</Link>
          <Link to="/library" className="footer-nav-item">Open library</Link>
          <Link to="/lesson-order" className="footer-nav-item">Lesson builder</Link>
          <Link to="/profile" className="footer-nav-item">Profile</Link>
        </div>
        
        {/* Email Contact - Exact Figma positioning */}
        <div className="footer-email-container">
          <div className="email-pill">
            <span className="email-text">team@chiils.com</span>
          </div>
        </div>
        
        {/* Bottom section with logo and links aligned at bottom */}
        <div className="footer-bottom-section">
          {/* Bottom Links - Aligned at bottom */}
          <div className="footer-bottom-links">
            <span className="copyright-text">
              Copyright © Koala Station DOO Belgrade, {new Date().getFullYear()}
            </span>
            <a href="#" className="footer-bottom-item">Public offer</a>
            <a href="#" className="footer-bottom-item">Privacy policy</a>
          </div>
          
          {/* Chiils Logo - Aligned at bottom */}
          <div className="footer-logo-container">
            <img 
              src={footerLogoPath} 
              alt="Chiils" 
              className="footer-logo-svg"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer


