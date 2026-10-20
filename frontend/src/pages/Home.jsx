import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useScrollReveal from '../hooks/useScrollReveal'
import { trackEvent } from '../services/siteMetrics'

// Animated rolling counter for statistics
function useAnimatedCounter(targetNumber, duration = 1800) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp = null
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * targetNumber))
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    const anim = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(anim)
  }, [targetNumber, duration])

  return count
}

function Home() {
  useDocumentTitle(
    'Campus Lost & Found',
    'TraceIt is the campus-wide lost and found platform powered by AI semantic matching. Report, search, and recover lost belongings fast.'
  )

  const [lostItems, setLostItems] = useState([])
  const [foundItems, setFoundItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)

  const recoveredCount = useAnimatedCounter(542, 1800)
  useScrollReveal(loading)

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      try {
        const params = {}
        if (searchQuery.trim()) {
          params.q = searchQuery.trim()
          trackEvent('search_query', { query: searchQuery.trim(), category })
        }
        if (category) params.category = category

        const [lost, found] = await Promise.all([
          api.get('/lost/', { params }),
          api.get('/found/', { params })
        ])
        setLostItems(lost.data.items || [])
        setFoundItems(found.data.items || [])
      } catch (error) {
        // Keep UI resilient on backend cold-starts
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchItems()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, category])

  const categories = ["Electronics", "Documents", "Accessories", "Clothing", "Books", "Bags", "Other"]

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ===== Hero Section ===== */}
        <header className="page-container" style={{ paddingTop: 32, paddingBottom: 0 }}>
          <div className="hero">
            <div className="hero-content">
              <div className="hero-text">
                <span className="hero-badge">🎓 Campus Lost &amp; Found Community</span>
                <h1>
                  Left Something Behind<br />
                  On Campus?<br />
                  <span className="hero-highlight">We&apos;ll Help You Find It.</span>
                </h1>
                <p>
                  Misplaced your notes, water bottle, or earphones? Report what you lost in seconds, search campus finds, and let smart matching connect you with whoever picked it up.
                </p>

                <div className="hero-stat" aria-label={`${recoveredCount} items recovered`}>
                  <span className="hero-stat-dot" aria-hidden="true"></span>
                  <strong style={{ color: 'var(--primary-orange)', marginRight: 4 }}>{recoveredCount}+</strong> Items Reunited Across Campus
                </div>

                {/* Primary & Secondary Action CTAs */}
                <div className="hero-buttons">
                  <Link 
                    className="btn-primary btn-cta-primary" 
                    to="/report-lost"
                    onClick={() => trackEvent('cta_hero_report_lost')}
                  >
                    🔍 Report Lost Item
                  </Link>
                  <Link 
                    className="btn-secondary" 
                    to="/report-found"
                    onClick={() => trackEvent('cta_hero_report_found')}
                  >
                    📦 Report Found Item
                  </Link>
                </div>
              </div>

              {/* Hero Illustration */}
              <div className="hero-illustration">
                <picture>
                  <source srcSet="/hero_illustration.webp" type="image/webp" />
                  <img 
                    src="/hero_illustration.png" 
                    alt="Illustration of campus students searching and recovering lost belongings using TraceIt platform" 
                    width="640"
                    height="640"
                    loading="eager"
                  />
                </picture>
              </div>
            </div>
          </div>

          {/* Stats Strip */}
          <section className="stats-strip reveal-on-scroll" aria-label="Platform Statistics">
            <div className="stat-item">
              <div className="stat-number">{recoveredCount}<span>+</span></div>
              <div className="stat-label">Items Reunited</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">Smart<span>⚡</span></div>
              <div className="stat-label">Item Matching</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24<span>/7</span></div>
              <div className="stat-label">Campus Coverage</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100<span>%</span></div>
              <div className="stat-label">Free For Students</div>
            </div>
          </section>
        </header>

        {/* ===== How It Works ===== */}
        <section className="how-it-works-section" aria-labelledby="how-it-works-title">
          <div className="section-heading reveal-on-scroll">
            <h2 id="how-it-works-title">How TraceIt Works</h2>
            <p>Three simple steps to recover what belongs to you</p>
          </div>
          <div className="how-cards">
            <div className="how-card reveal-on-scroll reveal-delay-1">
              <span className="how-card-icon" aria-hidden="true">📝</span>
              <h3>1. Describe Your Item</h3>
              <p>Share what you lost or found, where you last saw it, and an optional photo to help classmates identify it.</p>
            </div>
            <div className="how-card reveal-on-scroll reveal-delay-2">
              <span className="how-card-icon" aria-hidden="true">🔍</span>
              <h3>2. Smart Matching</h3>
              <p>TraceIt continuously compares lost and found reports across campus, even if they were phrased in different words.</p>
            </div>
            <div className="how-card reveal-on-scroll reveal-delay-3">
              <span className="how-card-icon" aria-hidden="true">🤝</span>
              <h3>3. Safe Campus Hand-Off</h3>
              <p>Confirm private ownership details safely, arrange a convenient campus meetup, and get your item back.</p>
            </div>
          </div>
        </section>

        {/* ===== Helpful Tools Section ===== */}
        <section className="page-container ai-features-section reveal-on-scroll" style={{ paddingTop: 30, paddingBottom: 20 }}>
          <div className="section-heading" style={{ marginBottom: 28 }}>
            <span className="hero-badge">💡 Made For Campus Life</span>
            <h2>Simple Tools To Find Things Faster</h2>
            <p>Helpful features designed to save you time and hassle between classes</p>
          </div>
          <div className="ai-features-grid">
            <div className="ai-feature-card">
              <div className="ai-feature-icon-wrap" aria-hidden="true">✏️</div>
              <h3>One-Sentence Quick Fill</h3>
              <p>Rushing to class? Write one quick sentence like <em>&quot;lost my blue bottle in CS Lab&quot;</em> and our assistant will fill out the report form automatically.</p>
              <Link to="/report-lost" className="ai-feature-link">
                Report a lost item →
              </Link>
            </div>
            <div className="ai-feature-card">
              <div className="ai-feature-icon-wrap" aria-hidden="true">📸</div>
              <h3>Smart Photo Helper</h3>
              <p>Found something? Snap a quick photo. It automatically notes the color and item type so you don&apos;t have to spend time typing out details.</p>
              <Link to="/report-found" className="ai-feature-link">
                Report a found item →
              </Link>
            </div>
            <div className="ai-feature-card">
              <div className="ai-feature-icon-wrap" aria-hidden="true">🔔</div>
              <h3>Friendly Match Alerts</h3>
              <p>No need to refresh the page all day. We&apos;ll notify you in your notification bell whenever someone finds an item that matches your description.</p>
              <span className="ai-feature-badge">Active in notification bell</span>
            </div>
          </div>
        </section>

        {/* ===== Browse Items Section ===== */}
        <main className="page-container" style={{ paddingTop: 20, paddingBottom: 60 }}>

          {/* Quick Search Helper Bar */}
          <div className="home-tracebot-card reveal-on-scroll">
            <div className="home-tracebot-header">
              <span className="home-tracebot-badge">🔍 Quick Search Helper</span>
              <span className="home-tracebot-hint">Click a sample to search or type any keyword below</span>
            </div>
            <div className="home-tracebot-pills">
              <button 
                type="button" 
                className="tracebot-sample-pill"
                onClick={() => {
                  setSearchQuery('Dell laptop')
                  setCategory('Electronics')
                }}
              >
                💻 &quot;Dell laptop in Library&quot;
              </button>
              <button 
                type="button" 
                className="tracebot-sample-pill"
                onClick={() => {
                  setSearchQuery('AirPods')
                  setCategory('Electronics')
                }}
              >
                🎧 &quot;AirPods in Cafeteria&quot;
              </button>
              <button 
                type="button" 
                className="tracebot-sample-pill"
                onClick={() => {
                  setSearchQuery('water bottle')
                  setCategory('Accessories')
                }}
              >
                🧴 &quot;Blue water bottle in CS Lab&quot;
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="search-filter-container reveal-on-scroll">
            <div className="search-input-wrapper">
              <span className="search-icon" aria-hidden="true">🔍</span>
              <input
                type="text"
                placeholder="Search by item, building, color, or brand (e.g. water bottle, library, macbook)..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search lost and found items"
              />
            </div>
            <select
              className="filter-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter items by category"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {loading && (
            <div className="loading-indicator" aria-live="polite">
              <span className="spinner" aria-hidden="true"></span>
              Searching campus items...
            </div>
          )}

          {/* Lost Items Grid */}
          <section className="section reveal-on-scroll" aria-labelledby="lost-items-title">
            <div className="section-header-row">
              <h2 id="lost-items-title" className="section-title">Lost Items</h2>
              <Link to="/report-lost" className="section-action-link">+ Report Lost</Link>
            </div>
            <div className="cards-grid">
              {(lostItems || []).map((item) => (
                <article className="card" key={item._id}>
                  <div className="card-image-wrap">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={`Photo of lost ${item.title || 'item'} on campus`}
                        className="card-image" 
                        loading="lazy" 
                      />
                    ) : (
                      <div className="card-image-placeholder" aria-label="No photograph provided">
                        <span aria-hidden="true">🔍</span>
                      </div>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="card-tags-row">
                      <span className="card-badge">Lost</span>
                      {item.category && <span className="card-category-pill">{item.category}</span>}
                    </div>
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-desc">{item.description}</p>
                    <p className="card-location">📍 {item.location}</p>
                    <Link className="btn-primary btn-sm" to={`/item/${item._id}`}>
                      View AI Matches →
                    </Link>
                  </div>
                </article>
              ))}
              {lostItems.length === 0 && !loading && (
                <div className="empty-state">
                  <p>No lost items found matching your search.</p>
                  <Link to="/report-lost" className="btn-secondary btn-sm" style={{ marginTop: 8 }}>
                    Report a Lost Item
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Found Items Grid */}
          <section className="section reveal-on-scroll" aria-labelledby="found-items-title">
            <div className="section-header-row">
              <h2 id="found-items-title" className="section-title">Found Items</h2>
              <Link to="/report-found" className="section-action-link" style={{ color: '#10b981' }}>+ Report Found</Link>
            </div>
            <div className="cards-grid">
              {(foundItems || []).map((item) => (
                <article className="card" key={item._id}>
                  <div className="card-image-wrap">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={`Photo of found ${item.title || 'item'} on campus`}
                        className="card-image" 
                        loading="lazy" 
                      />
                    ) : (
                      <div className="card-image-placeholder" aria-label="No photograph provided">
                        <span aria-hidden="true">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="card-tags-row">
                      <span className="card-badge card-badge-green">Found</span>
                      {item.category && <span className="card-category-pill">{item.category}</span>}
                    </div>
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-desc">{item.description}</p>
                    <p className="card-location">📍 {item.location}</p>
                    <Link className="btn-primary btn-sm" to={`/item/${item._id}`}>
                      Details →
                    </Link>
                  </div>
                </article>
              ))}
              {foundItems.length === 0 && !loading && (
                <div className="empty-state">
                  <p>No found items matching your search.</p>
                  <Link to="/report-found" className="btn-secondary btn-sm" style={{ marginTop: 8 }}>
                    Report a Found Item
                  </Link>
                </div>
              )}
            </div>
          </section>

        </main>

        {/* ===== Dedicated Bottom Call to Action Banner ===== */}
        <aside className="conversion-cta-strip reveal-on-scroll" aria-label="Campus Community Call to Action">
          <div className="conversion-cta-inner">
            <div className="conversion-cta-text">
              <h2>Spotted Something Left Behind?</h2>
              <p>A quick 60-second post can make a classmate&apos;s day and return what they lost.</p>
            </div>
            <div className="conversion-cta-button">
              <Link 
                to="/report-found" 
                className="btn-primary btn-large btn-cta-glow"
                onClick={() => trackEvent('cta_bottom_banner_report_found')}
              >
                📦 Report Found Item →
              </Link>
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}

export default Home
