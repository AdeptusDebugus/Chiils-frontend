import React, { useState, useEffect } from 'react'
import { footerService, FooterContent } from '../services/footerService'
import './Footer.css'

const Footer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [footerContent, setFooterContent] = useState<FooterContent | null>(null)

  // Fetch footer content from MCP service
  useEffect(() => {
    // Initialize and subscribe to content updates
    footerService.initialize().then((content) => {
      setFooterContent(content)
    })

    const unsubscribe = footerService.subscribe((content) => {
      setFooterContent(content)
    })

    return () => {
      unsubscribe()
    }
  }, [])

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

  // Don't render if content hasn't loaded yet
  if (!footerContent) {
    return null
  }

  return (
    <div className={`figma-footer ${isVisible ? 'footer-visible' : 'footer-hidden'}`}>
      {/* Main Footer Background */}
      <div className="footer-background">
        {/* Email Contact - From MCP service */}
        <div className="footer-email-container">
          <div className="email-pill">
            <span className="email-text">
              {footerContent.contact.emailLabel || footerContent.contact.email}
            </span>
          </div>
        </div>
        
        {/* Bottom section with logo and links aligned at bottom */}
        <div className="footer-bottom-section">
          {/* Bottom Links - From MCP service */}
          <div className="footer-bottom-links">
            <span className="copyright-text">
              Copyright © {footerContent.company.legalName}, {footerContent.company.year}
            </span>
            <div className="legal-links-column">
              {footerContent.legal.map((legalLink, index) => (
                <a 
                  key={index}
                  href={legalLink.path} 
                  className="footer-bottom-item"
                >
                  {legalLink.label}
                </a>
              ))}
            </div>
          </div>
          
          {/* Chiils Logo - From MCP service */}
          {footerContent.logo && (
            <div className="footer-logo-container">
              <img 
                src={footerContent.logo.src}
                alt={footerContent.logo.alt} 
                className="footer-logo-svg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Footer


