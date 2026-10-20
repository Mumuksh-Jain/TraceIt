import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getConsentSettings, initAnalytics } from '../services/siteMetrics'

const STORAGE_KEY = 'traceit_cookie_consent_v1'

export default function PrivacyNotice() {
  const [visible, setVisible] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false)

  useEffect(() => {
    const existing = getConsentSettings()
    if (!existing) {
      // Small timeout for smooth slide-in after initial paint
      const timer = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(timer)
    } else {
      setAnalyticsAllowed(existing.analytics || false)
      if (existing.analytics) {
        initAnalytics()
      }
    }

    // Listen for manual request to open preferences from footer
    const handleOpen = () => {
      setShowPreferences(true)
      setVisible(true)
    }
    window.addEventListener('openCookieSettings', handleOpen)
    return () => window.removeEventListener('openCookieSettings', handleOpen)
  }, [])

  const saveConsent = (analyticsVal) => {
    const consent = {
      essential: true,
      analytics: analyticsVal,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
    setAnalyticsAllowed(analyticsVal)
    setVisible(false)
    setShowPreferences(false)

    // Notify listeners (analytics service, etc.)
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: consent }))
  }

  const handleAcceptAll = () => {
    saveConsent(true)
  }

  const handleDeclineAll = () => {
    saveConsent(false)
  }

  const handleSavePreferences = () => {
    saveConsent(analyticsAllowed)
  }

  if (!visible) return null

  return (
    <aside className="cookie-banner-overlay" role="dialog" aria-modal="true" aria-label="Cookie consent banner">
      <div className="cookie-banner-card">
        {!showPreferences ? (
          <div className="cookie-banner-simple">
            <div className="cookie-banner-text">
              <span className="cookie-icon" aria-hidden="true">🍪</span>
              <div>
                <h3>We Value Your Campus Privacy</h3>
                <p>
                  TraceIt uses essential cookies for secure login sessions and optional privacy-friendly analytics to improve AI item matching. We never sell your personal data. Read our{' '}
                  <Link to="/privacy" onClick={() => setVisible(false)} className="cookie-privacy-link">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>
            <div className="cookie-banner-actions">
              <button 
                type="button" 
                className="btn-cookie-outline"
                onClick={() => setShowPreferences(true)}
              >
                Customize
              </button>
              <button 
                type="button" 
                className="btn-cookie-decline"
                onClick={handleDeclineAll}
              >
                Essential Only
              </button>
              <button 
                type="button" 
                className="btn-cookie-accept"
                onClick={handleAcceptAll}
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="cookie-preferences-drawer">
            <div className="cookie-pref-header">
              <h3>Cookie Preferences</h3>
              <button 
                type="button" 
                className="cookie-close-btn"
                onClick={() => setShowPreferences(false)}
                aria-label="Close preferences"
              >
                ✕
              </button>
            </div>
            <p className="cookie-pref-intro">
              Customize which cookies and data processing you permit while using TraceIt.
            </p>

            <div className="cookie-pref-item">
              <div className="cookie-pref-info">
                <div className="cookie-pref-title">
                  <strong>Strictly Necessary Cookies</strong>
                  <span className="badge-required">Always Active</span>
                </div>
                <p>
                  Essential for core platform functionality such as authenticating your login token, maintaining CSRF protection, and securely saving item reports.
                </p>
              </div>
            </div>

            <div className="cookie-pref-item">
              <div className="cookie-pref-info">
                <div className="cookie-pref-title">
                  <strong>Performance &amp; Analytics</strong>
                  <label className="switch-toggle" aria-label="Toggle analytics cookies">
                    <input 
                      type="checkbox" 
                      checked={analyticsAllowed} 
                      onChange={(e) => setAnalyticsAllowed(e.target.checked)} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
                <p>
                  Helps us analyze aggregate item recovery rates, identify search bottlenecks, and measure speed improvements without collecting personal identifying information.
                </p>
              </div>
            </div>

            <div className="cookie-pref-footer">
              <button 
                type="button" 
                className="btn-cookie-decline"
                onClick={() => setShowPreferences(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-cookie-accept"
                onClick={handleSavePreferences}
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
