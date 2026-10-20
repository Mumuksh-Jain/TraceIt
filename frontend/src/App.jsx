import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PrivacyNotice from './components/PrivacyNotice'
import ScrollToTop from './components/ScrollToTop'
import ErrorBoundary from './components/ErrorBoundary'
import SmoothScroll from './components/SmoothScroll'
import ScrollProgressBar from './components/ScrollProgressBar'
import { trackPageView, initAnalytics } from './services/siteMetrics'

// Static imports for policy pages prevent ad-blockers from blocking dynamic script fetches
import CampusPolicy from './pages/CampusPolicy'
import CampusTerms from './pages/CampusTerms'

// Lazy-loaded routes for code splitting
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ReportLost = lazy(() => import('./pages/ReportLost'))
const ReportFound = lazy(() => import('./pages/ReportFound'))
const ItemDetail = lazy(() => import('./pages/ItemDetail'))
const MyItems = lazy(() => import('./pages/MyItems'))
const About = lazy(() => import('./pages/About'))
const NotFound = lazy(() => import('./pages/NotFound'))

function RouteTracker() {
  const location = useLocation()

  useEffect(() => {
    // Record page view on route transitions (strictly checks cookie consent)
    trackPageView(location.pathname + location.search)
  }, [location.pathname, location.search])

  return null
}

function PageFallback() {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true"></div>
      <span>Loading TraceIt...</span>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  const { loading } = useAuth()

  if (loading) {
    return <PageFallback />
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/report-lost' element={<ReportLost />} />
          <Route path='/report-found' element={<ReportFound />} />
          <Route path='/item/:id' element={<ItemDetail />} />
          <Route path='/my-items' element={<MyItems />} />
          <Route path='/about' element={<About />} />
          <Route path='/privacy' element={<CampusPolicy />} />
          <Route path='/terms' element={<CampusTerms />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

function App() {
  useEffect(() => {
    initAnalytics()
  }, [])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <SmoothScroll />
          <ScrollProgressBar />
          <ScrollToTop />
          <RouteTracker />
          <Navbar />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <AnimatedRoutes />
          </main>
          <Footer />
          <PrivacyNotice />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
