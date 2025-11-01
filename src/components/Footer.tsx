import React, { useEffect, useState } from 'react'
import { footerService, FooterContent } from '../services/footerService'
import './Footer.css'

const Footer: React.FC = () => {
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

  // Don't render if content hasn't loaded yet
  if (!footerContent) {
    return null
  }

  return (
    <div className="figma-footer">
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
            {footerContent.legal.map((legalLink, index) => (
              <a
                key={index}
                href={legalLink.path}
                className="footer-bottom-item"
              >
                {legalLink.label}
              </a>
            ))}
            <span className="copyright-text">
              Copyright © {footerContent.company.legalName}, {footerContent.company.year}
            </span>
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


