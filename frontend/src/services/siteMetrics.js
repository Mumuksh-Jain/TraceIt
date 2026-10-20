/**
 * TraceIt Site Metrics & Telemetry Service
 * 
 * Named 'siteMetrics' to prevent ad-blockers (uBlock, Brave Shields, AdBlock)
 * from blocking Vite module loading via 'analytics.js' regex filters.
 *
 * Privacy & Consent Compliant:
 * Only initializes and records metrics when the user has granted explicit consent.
 */

const STORAGE_KEY = 'traceit_cookie_consent_v1'

export const getConsentSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null
    return JSON.parse(saved)
  } catch (e) {
    return null
  }
}

export const hasAnalyticsConsent = () => {
  const consent = getConsentSettings()
  return Boolean(consent && consent.analytics === true)
}

let isInitialized = false

/**
 * Initializes metrics safely if configured and consented
 */
export const initAnalytics = () => {
  if (typeof window === 'undefined') return
  if (!hasAnalyticsConsent()) return

  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID

  if (gaId && !isInitialized) {
    try {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
      
      // Silently catch ad-blocker prevention
      script.onerror = () => {
        // Silently handled - ad blocker prevented external tracker
      }
      
      document.head.appendChild(script)

      window.dataLayer = window.dataLayer || []
      function gtag() {
        window.dataLayer.push(arguments)
      }
      window.gtag = gtag
      gtag('js', new Date())
      gtag('config', gaId, {
        anonymize_ip: true,
        send_page_view: false
      })

      isInitialized = true
    } catch (err) {
      // Prevent any unhandled crash if blocked
    }
  }
}

/**
 * Track a page view
 * @param {string} path - Current pathname
 * @param {string} title - Page title
 */
export const trackPageView = (path, title) => {
  if (!hasAnalyticsConsent()) return

  try {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID
    if (window.gtag && gaId) {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title
      })
    }
  } catch (e) {
    // Suppress ad-blocker errors
  }
}

/**
 * Track user conversion and engagement events
 * @param {string} action - Event name
 * @param {object} params - Optional event parameters
 */
export const trackEvent = (action, params = {}) => {
  if (!hasAnalyticsConsent()) return

  try {
    if (window.gtag) {
      window.gtag('event', action, params)
    }
  } catch (e) {
    // Suppress ad-blocker errors
  }
}

// Listen for consent changes dynamically
if (typeof window !== 'undefined') {
  window.addEventListener('cookieConsentChanged', (e) => {
    if (e.detail?.analytics) {
      initAnalytics()
    }
  })
}

export default {
  initAnalytics,
  trackPageView,
  trackEvent,
  hasAnalyticsConsent,
  getConsentSettings
}
