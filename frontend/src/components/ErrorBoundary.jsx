import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Silently capture or log to telemetry
    if (import.meta.env.DEV) {
      console.warn('TraceIt ErrorBoundary caught an issue:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 15 }}>
            A client-side extension or network filter may have interrupted the page load.
          </p>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={() => {
              this.setState({ hasError: false })
              window.location.reload()
            }}
          >
            ↻ Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
