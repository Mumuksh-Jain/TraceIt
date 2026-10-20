import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

function Navbar() {
  const { isLoggedIn, logOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Auto-close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logOut()
    setMobileMenuOpen(false)
    navigate('/login')
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="navbar-inner">
        <Link className="navbar-brand" to="/" aria-label="TraceIt Home">
          <span className="brand-icon" aria-hidden="true">🔍</span>
          <span>Trace<span className="brand-accent">It</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links desktop-nav">
          {isLoggedIn ? (
            <>
              <Link className={`nav-link ${location.pathname === '/report-lost' ? 'nav-link-active' : ''}`} to="/report-lost">Report Lost</Link>
              <Link className={`nav-link ${location.pathname === '/report-found' ? 'nav-link-active' : ''}`} to="/report-found">Report Found</Link>
              <Link className={`nav-link ${location.pathname === '/my-items' ? 'nav-link-active' : ''}`} to="/my-items">My Items</Link>
              <Link className={`nav-link ${location.pathname === '/about' ? 'nav-link-active' : ''}`} to="/about">About</Link>
              <NotificationBell />
              <button type="button" className="btn-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link className={`nav-link ${location.pathname === '/about' ? 'nav-link-active' : ''}`} to="/about">About</Link>
              <NotificationBell />
              <Link className={`nav-link ${location.pathname === '/login' ? 'nav-link-active' : ''}`} to="/login">Login</Link>
              <Link className="btn-primary btn-nav-cta" to="/register">Register</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" role="menu">
          {isLoggedIn ? (
            <>
              <Link className="mobile-nav-link" to="/report-lost">🔍 Report Lost</Link>
              <Link className="mobile-nav-link" to="/report-found">📦 Report Found</Link>
              <Link className="mobile-nav-link" to="/my-items">📋 My Reported Items</Link>
              <Link className="mobile-nav-link" to="/about">ℹ️ About TraceIt</Link>
              <button type="button" className="btn-logout mobile-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="mobile-nav-link" to="/about">ℹ️ About TraceIt</Link>
              <Link className="mobile-nav-link" to="/login">🔐 Login</Link>
              <Link className="btn-primary mobile-cta" to="/register">
                Register Free ✨
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar