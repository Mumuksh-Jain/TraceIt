import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  const handleOpenCookies = (e) => {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('openCookieSettings'))
  }

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">

        {/* Brand Column */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo" aria-label="TraceIt Home">
            Trace<span className="brand-accent">It</span>
          </Link>
          <p>
            AI-Powered Campus Lost &amp; Found Platform.<br />
            Report, search, and recover lost items using semantic sentence-transformer AI matching.
          </p>
          <div className="footer-social">
            <a
              className="footer-social-btn"
              href="https://github.com/Mumuksh-Jain"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub Profile"
              aria-label="Developer GitHub Profile"
            >
              ⌥
            </a>
            <a
              className="footer-social-btn"
              href="https://github.com/Mumuksh-Jain/TraceIt"
              target="_blank"
              rel="noopener noreferrer"
              title="TraceIt Repository"
              aria-label="TraceIt Source Repository"
            >
              🔗
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4>Navigation</h4>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/report-lost">Report Lost Item</Link>
            <Link to="/report-found">Report Found Item</Link>
            <Link to="/my-items">My Reported Items</Link>
            <Link to="/about">About TraceIt</Link>
          </div>
        </div>

        {/* Legal & Privacy */}
        <div className="footer-col">
          <h4>Legal &amp; Trust</h4>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms &amp; Conditions</Link>
            <a href="#cookie-settings" onClick={handleOpenCookies}>
              Cookie Preferences
            </a>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">
              Sitemap
            </a>
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer">
              Robots.txt
            </a>
          </div>
        </div>

        {/* Credits */}
        <div className="footer-col">
          <h4>Built By</h4>
          <div className="footer-credit">
            <p style={{ marginBottom: '8px', fontSize: '15px', fontWeight: 700, color: 'white' }}>Mumukshu Jain</p>
            <p style={{ marginBottom: '4px' }}>B.Tech CSE (AI &amp; ML)</p>
            <p style={{ marginBottom: '16px' }}>Full Stack &amp; AI Engineer</p>
            <a 
              href="https://github.com/Mumuksh-Jain" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-profile-link"
            >
              GitHub Profile →
            </a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>© 2026 TraceIt. All rights reserved. Built for campus item recovery.</p>
          <p className="footer-ssl-badge">
            <span aria-hidden="true">🔒</span> TLS 1.3 End-to-End Encrypted
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer