import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

function MyItems() {
  useDocumentTitle(
    'My Reported Items',
    'Manage your reported lost and found items on campus, check status, and review AI matches.'
  )

  const [lostItems, setLostItems] = useState([])
  const [foundItems, setFoundItems] = useState([])
  const [activeTab, setActiveTab] = useState('lost')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const [lost, found] = await Promise.all([
          api.get('/lost/my-items'),
          api.get('/found/my-items')
        ])
        setLostItems(lost.data.items || [])
        setFoundItems(found.data.items || [])
      } catch (error) {
        // Handle error gracefully
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  return (
    <div className='page-container'>
      <div className="section-header-row" style={{ marginTop: 24 }}>
        <h1 className='page-title' style={{ margin: 0 }}>My Reported Items</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/report-lost" className="btn-primary btn-sm">+ Report Lost</Link>
          <Link to="/report-found" className="btn-secondary btn-sm">+ Report Found</Link>
        </div>
      </div>

      <div className='tabs' role="tablist" aria-label="Item Types">
        <button 
          role="tab"
          aria-selected={activeTab === 'lost'}
          className={`tab tab-enhanced ${activeTab === 'lost' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('lost')}
        >
          🔍 Lost Items ({lostItems.length})
        </button>
        <button 
          role="tab"
          aria-selected={activeTab === 'found'}
          className={`tab tab-enhanced ${activeTab === 'found' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('found')}
        >
          📦 Found Items ({foundItems.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-indicator">
          <span className="spinner" aria-hidden="true"></span>
          Loading your items...
        </div>
      ) : (
        <>
          {activeTab === 'lost' && (
            <div className='cards-grid'>
              {lostItems.length === 0 && (
                <div className='empty-state' style={{ gridColumn: '1 / -1' }}>
                  <p>You haven&apos;t reported any lost items yet.</p>
                  <Link to="/report-lost" className="btn-primary btn-sm" style={{ marginTop: 12 }}>
                    Report a Lost Item Now
                  </Link>
                </div>
              )}
              {lostItems.map((item) => (
                <article className='card' key={item._id}>
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={`Photo of your reported lost item: ${item.title}`} 
                      className='card-image' 
                      loading="lazy"
                    />
                  ) : (
                    <div className="card-image-placeholder" aria-label="No photograph">
                      <span aria-hidden="true">🔍</span>
                    </div>
                  )}
                  <div className='card-body'>
                    <span className='card-badge'>Lost</span>
                    <h3 className='card-title'>{item.title}</h3>
                    <p className='card-desc'>{item.description}</p>
                    <p className='card-location'>📍 {item.location}</p>
                    <div className='card-footer'>
                      <span className={`status-badge ${item.status === 'Open' ? 'status-open' : 'status-closed'}`}>
                        {item.status}
                      </span>
                      <Link className='btn-primary btn-sm' to={`/item/${item._id}`}>
                        View Matches →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {activeTab === 'found' && (
            <div className='cards-grid'>
              {foundItems.length === 0 && (
                <div className='empty-state' style={{ gridColumn: '1 / -1' }}>
                  <p>You haven&apos;t reported any found items yet.</p>
                  <Link to="/report-found" className="btn-secondary btn-sm" style={{ marginTop: 12 }}>
                    Report a Found Item
                  </Link>
                </div>
              )}
              {foundItems.map((item) => (
                <article className='card' key={item._id}>
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={`Photo of your reported found item: ${item.title}`} 
                      className='card-image' 
                      loading="lazy"
                    />
                  ) : (
                    <div className="card-image-placeholder" aria-label="No photograph">
                      <span aria-hidden="true">📦</span>
                    </div>
                  )}
                  <div className='card-body'>
                    <span className='card-badge card-badge-green'>Found</span>
                    <h3 className='card-title'>{item.title}</h3>
                    <p className='card-desc'>{item.description}</p>
                    <p className='card-location'>📍 {item.location}</p>
                    <div className='card-footer'>
                      <span className={`status-badge ${item.status === 'Open' ? 'status-open' : 'status-closed'}`}>
                        {item.status}
                      </span>
                      <Link className='btn-primary btn-sm' to={`/item/${item._id}`}>
                        View Details →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default MyItems