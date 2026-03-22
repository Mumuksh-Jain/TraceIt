import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'
import SplineBackground from '../components/SplineBackground'

function Home() {
  const [lostItems, setLostItems] = useState([])
  const [foundItems, setFoundItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const params = {}
        if (searchQuery) params.q = searchQuery
        if (category) params.category = category

        const lost = await api.get('/lost/', { params })
        const found = await api.get('/found/', { params })
        setLostItems(lost.data.items)
        setFoundItems(found.data.items)
      } catch (error) {
        console.error(error)
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchItems()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, category])

  const categories = ["Electronics", "Documents", "Accessories", "Clothing", "Books", "Other"]

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <SplineBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* ===== Hero Section ===== */}
        <div className="page-container" style={{ paddingTop: 32, paddingBottom: 0 }}>
          <div className="hero">
            <div className="hero-content">
              <div className="hero-text">
                <h1>Lost Something<br />On Campus?<br />Let's Find It.</h1>
                <p>Post, search, or report lost and found items in minutes. Our AI-powered semantic matching reconnects you with what matters.</p>
                <div className="hero-stat">
                  <span className="hero-stat-dot"></span>
                  500+ Items Recovered
                </div>
                <div className="hero-buttons">
                  <Link className="btn-primary" to="/report-lost">Report Lost Item</Link>
                  <Link className="btn-secondary" to="/report-found">Report Found Item</Link>
                </div>
              </div>
              <div className="hero-illustration">
                <img src="/hero_illustration.png" alt="TraceIt Illustration" />
              </div>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="stats-strip">
            <div className="stat-item">
              <div className="stat-number">500<span>+</span></div>
              <div className="stat-label">Items Recovered</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">AI<span>⚡</span></div>
              <div className="stat-label">Semantic Matching</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24<span>/7</span></div>
              <div className="stat-label">Always Active</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100<span>%</span></div>
              <div className="stat-label">Campus-wide</div>
            </div>
          </div>
        </div>

        {/* ===== How It Works ===== */}
       
          <div className="section-heading">
            <h2>How TraceIt Works</h2>
            <p>Three simple steps powered by AI semantic matching</p>
          </div>
          <div className="how-cards">
            <div className="how-card">
              <span className="how-card-icon">📝</span>
              <h3>Report Your Item</h3>
              <p>Fill out a quick form with your item's title, description, location and category. Upload a photo for better identification.</p>
            </div>
            <div className="how-card">
              <span className="how-card-icon">🤖</span>
              <h3>AI Finds Matches</h3>
              <p>Our NLP engine uses sentence-transformers to compare your description semantically — even different words with similar meaning get matched.</p>
            </div>
            <div className="how-card">
              <span className="how-card-icon">🤝</span>
              <h3>Reconnect & Recover</h3>
              <p>Get ranked match results with similarity scores. Contact the finder or claimant and recover what's yours.</p>
            </div>
          </div>


        {/* ===== Browse Items ===== */}
        <div className="page-container" style={{ paddingTop: 40, paddingBottom: 80 }}>

          {/* Search & Filter */}
          <div className="search-filter-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search items by title or description..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Lost Items */}
          <section className="section">
            <h2 className="section-title">Lost Items</h2>
            <div className="cards-grid">
              {(lostItems || []).map((item) => (
                <div className="card" key={item._id}>
                  {item.image && <img src={item.image} alt={item.title} className="card-image" />}
                  <div className="card-body">
                    <span className="card-badge">Lost</span>
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-desc">{item.description}</p>
                    <p className="card-location">📍 {item.location}</p>
                    <Link className="btn-primary btn-sm" to={`/item/${item._id}`}>View Matches</Link>
                  </div>
                </div>
              ))}
              {lostItems.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No lost items found matching your search.</p>
              )}
            </div>
          </section>

          {/* Found Items */}
          <section className="section">
            <h2 className="section-title">Found Items</h2>
            <div className="cards-grid">
              {(foundItems || []).map((item) => (
                <div className="card" key={item._id}>
                  {item.image && <img src={item.image} alt={item.title} className="card-image" />}
                  <div className="card-body">
                    <span className="card-badge card-badge-green">Found</span>
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-desc">{item.description}</p>
                    <p className="card-location">📍 {item.location}</p>
                    <Link className="btn-primary btn-sm" to={`/item/${item._id}`}>Details</Link>
                  </div>
                </div>
              ))}
              {foundItems.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No found items matching your search.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Home