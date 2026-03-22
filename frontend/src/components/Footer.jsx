import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className='footer'>
      <div className='footer-inner'>

        {/* Brand Column */}
        <div className='footer-brand'>
          <span className='footer-logo'>
            Trace<span className='brand-accent'>It</span>
          </span>
          <p>AI-Powered Campus Lost &amp; Found Platform.<br />Report, search, and recover lost items with the power of semantic AI matching.</p>
          <div className='footer-social'>
            <a
              className='footer-social-btn'
              href='https://github.com/Mumuksh-Jain'
              target='_blank'
              rel='noreferrer'
              title='GitHub'
            >
              ⌥
            </a>
            <a
              className='footer-social-btn'
              href='https://github.com/Mumuksh-Jain'
              target='_blank'
              rel='noreferrer'
              title='Portfolio'
            >
              🔗
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className='footer-col'>
          <h4>Quick Links</h4>
          <div className='footer-links'>
            <Link to='/'>Home</Link>
            <Link to='/report-lost'>Report Lost Item</Link>
            <Link to='/report-found'>Report Found Item</Link>
            <Link to='/my-items'>My Items</Link>
            <Link to='/about'>About</Link>
          </div>
        </div>

        {/* Credits */}
        <div className='footer-col'>
          <h4>Built By</h4>
          <div className='footer-credit'>
            <p style={{ marginBottom: '8px', fontSize: '15px', fontWeight: 700, color: 'white' }}>Mumukshu Jain</p>
            <p style={{ marginBottom: '4px' }}>B.Tech CSE (AI &amp; ML)</p>
            <p style={{ marginBottom: '16px' }}>Full Stack &amp; AI Engineer</p>
            <a href='https://github.com/Mumuksh-Jain' target='_blank' rel='noreferrer'>
              GitHub Profile →
            </a>
          </div>
        </div>

      </div>

      <div className='footer-bottom'>
        © 2026 TraceIt. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer