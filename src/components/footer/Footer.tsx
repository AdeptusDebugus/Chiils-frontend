import React, { useEffect, useState } from 'react'
import './Footer.css'

const footerLogo = "/assets/chiils-white-logo.svg"

const footerContent = {
  navigation: [
    {
      label: 'Home',
      path: '/',
      requiresAuth: false,
    },
    {
      label: 'Open library',
      path: '/open-library',
      requiresAuth: false,
    },
    {
      label: 'Lesson builder',
      path: '/lesson-order',
      requiresAuth: false,
    },
    {
      label: 'Profile',
      path: '/profile',
      requiresAuth: true,
    },
    {
      label: 'Contacts',
      path: '/contacts',
      requiresAuth: false,
    },
  ],
  company: {
    name: 'Chiils',
    legalName: 'Koala Station DOO Beograd',
    year: new Date().getFullYear(),
  },
  contact: {
    email: 'team@chiils.com',
    emailLabel: 'team@chiils.com',
  },
  legal: [
    {
      label: 'Privacy policy',
      path: '/privacypolicy',
    },
    {
      label: 'Terms & Conditions',
      path: '/termsofservice',
    },
    {
      label: 'Refund policy',
      path: '/refundpolicy',
    },
  ],
  logo: {
    src: '/assets/chiils-footer-logo.svg',
    alt: 'Chiils',
  },
}

const Footer: React.FC = () => {

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
          <a
            href="https://tally.so/r/KYlp6V"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-support-btn"
          >
            Contact support
          </a>
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


          {footerContent.logo && (
            <div className="footer-logo-container">
              <img
                src={footerLogo}
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


