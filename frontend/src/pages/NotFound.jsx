import React from 'react'
import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle(
    '404 Page Not Found',
    'The requested page on TraceIt could not be found. Return home or search for lost campus items.'
  )

  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <div className="not-found-icon-wrapper" aria-hidden="true">
          <span className="not-found-number">4</span>
          <span className="not-found-compass">🧭</span>
          <span className="not-found-number">4</span>
        </div>

        <span className="card-badge" style={{ marginBottom: 16 }}>Error 404</span>
        <h1 className="not-found-title">Looks Like This Page Got Lost</h1>
        <p className="not-found-desc">
          Even our AI semantic matching couldn&apos;t track down the page you are looking for. It might have been moved, renamed, or never existed in the first place.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="btn-primary">
            🏠 Back to Homepage
          </Link>
          <Link to="/report-lost" className="btn-secondary">
            🔍 Report Lost Item
          </Link>
          <Link to="/report-found" className="btn-secondary">
            📦 Report Found Item
          </Link>
        </div>

        <div className="not-found-help">
          <p>Need assistance finding a lost item?</p>
          <div className="not-found-links">
            <Link to="/about">About TraceIt</Link>
            <span className="dot-sep">•</span>
            <Link to="/privacy">Privacy Policy</Link>
            <span className="dot-sep">•</span>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
