import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import useDocumentTitle from '../hooks/useDocumentTitle'

function ItemDetail() {
  const [item, setItem] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  useDocumentTitle(
    item ? `${item.title} - Details` : 'Item Details',
    'View reported item details and AI semantic matches on TraceIt.'
  )

  useEffect(() => {
    const fetch = async () => {
      try {
        let response
        let isLost = true
        try {
          response = await api.get('/lost/' + id)
        } catch (err) {
          response = await api.get('/found/' + id)
          isLost = false
        }
        
        setItem({ ...response.data.item, type: isLost ? 'Lost' : 'Found' })
        
        if (isLost) {
          const matchResponse = await api.get('/lost/match/' + id)
          setMatches(matchResponse.data.matches || [])
        }
      } catch (error) {
        setError("Item not found or an error occurred.")
      }
      setLoading(false)
    }
    fetch()
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this reported item? This action cannot be undone.")) return
    
    try {
      const endpoint = item.type === 'Lost' ? `/lost/delete/${id}` : `/found/delete/${id}`
      await api.delete(endpoint)
      alert("Item deleted successfully!")
      navigate('/my-items')
    } catch (error) {
      alert("Failed to delete item. Please try again.")
    }
  }

  const getMatchQuality = (score) => {
    if (score > 0.7) return 'match-high'
    if (score > 0.5) return 'match-medium'
    return 'match-low'
  }

  const getMatchLabel = (score) => {
    if (score > 0.7) return 'Strong AI Match'
    if (score > 0.5) return 'Possible AI Match'
    return 'Weak Match'
  }

  const calculateCircleOffset = (percentage) => {
    const circumference = 251.2
    return circumference - (percentage / 100) * circumference
  }

  if (loading) {
    return (
      <div className='page-container' style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div className='loading-indicator'>
          <span className='spinner' aria-hidden="true" />
          Finding AI semantic matches...
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className='page-container' style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>Item Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '16px 0 24px' }}>
          The item you are looking for may have been deleted by the owner or resolved.
        </p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    )
  }

  return (
    <div className='page-container'>
      <div className='detail-grid'>

        {/* Left Column: Item Details */}
        <div className='detail-card'>
          <div className='detail-header'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: 16 }}>
              <div>
                <span className={`card-badge ${item && item.type === 'Found' ? 'card-badge-green' : ''}`}>
                  {item && item.type} Item
                </span>
                <h1 style={{ marginTop: 8 }}>{item && item.title}</h1>
              </div>
              {item && user && user.id === item.reportedBy && (
                <button 
                  type="button"
                  className="btn-primary" 
                  style={{ backgroundColor: '#dc2626', borderColor: '#b91c1c' }} 
                  onClick={handleDelete}
                  aria-label="Delete this reported item"
                >
                  Delete Item
                </button>
              )}
            </div>
          </div>

          {/* Item Image with Descriptive Alt Text */}
          {item && item.image ? (
            <img 
              src={item.image} 
              alt={`Photograph of ${item.type.toLowerCase()} item: ${item.title}`} 
              className='detail-image' 
            />
          ) : (
            <div className='card-image-placeholder' style={{ height: 240, margin: '16px 0' }} aria-hidden="true">
              <span style={{ fontSize: 48 }}>{item.type === 'Lost' ? '🔍' : '📦'}</span>
            </div>
          )}

          {/* Item Details */}
          <div className='detail-fields'>
            <div className='detail-field'>
              <span className='field-label'>Description</span>
              <span className='field-value'>{item && item.description}</span>
            </div>
            <div className='detail-field'>
              <span className='field-label'>Location</span>
              <span className='field-value'>📍 {item && item.location}</span>
            </div>
            <div className='detail-field'>
              <span className='field-label'>Category</span>
              <span className='field-value'>{item && item.category}</span>
            </div>
            <div className='detail-field'>
              <span className='field-label'>Status</span>
              <span className={`status-badge ${item && item.status === 'Open' ? 'status-open' : 'status-closed'}`}>
                {item && item.status}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Matches */}
        <div className='matches-section'>
          <h2 className='section-title'>AI Semantic Matches</h2>
          <p className='matches-subtitle'>Ranked by NLP cosine similarity score</p>

          {item.type === 'Found' ? (
            <div className='no-matches'>
              📦 This item was reported as <strong>Found</strong>. Matching is executed from Lost item reports.
            </div>
          ) : matches.length === 0 ? (
            <div className='no-matches'>
              📭 No matches found yet. Check back when more items are reported on campus.
            </div>
          ) : (
            matches.map((match, index) => {
              const percentage = Math.round(match.score * 100)
              const qualityClass = getMatchQuality(match.score)
              const qualityLabel = getMatchLabel(match.score)
              const circleOffset = calculateCircleOffset(percentage)

              return (
                <div 
                  className={`match-card ${qualityClass}`} 
                  key={index}
                  data-match-percentage={percentage}
                >
                  <div className='circular-progress-container' aria-hidden="true">
                    <svg className='circular-progress' viewBox='0 0 100 100'>
                      <circle className='progress-bg' cx='50' cy='50' r='40' />
                      <circle 
                        className='progress-bar animate' 
                        cx='50' 
                        cy='50' 
                        r='40'
                        style={{ strokeDashoffset: circleOffset }}
                      />
                    </svg>
                    <div className='match-score-text'>
                      <div className='score-percent'>{percentage}</div>
                      <div className='score-label'>%</div>
                    </div>
                  </div>

                  <div className='match-content'>
                    <div className='match-header'>
                      <span className='match-rank'>#{index + 1} Best Match</span>
                    </div>
                    <p className='match-desc'>{match.description}</p>
                    <span className={`match-quality ${qualityClass}`}>
                      {qualityLabel} ({percentage}% match)
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}

export default ItemDetail