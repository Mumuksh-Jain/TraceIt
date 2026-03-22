import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

function ItemDetail() {
  const [item, setItem] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        // Try fetching as lost item first
        let response
        let isLost = true
        try {
          response = await api.get('/lost/' + id)
        } catch (err) {
          // If not lost, try found
          response = await api.get('/found/' + id)
          isLost = false
        }
        
        setItem({ ...response.data.item, type: isLost ? 'Lost' : 'Found' })
        
        if (isLost) {
          const matchResponse = await api.get('/lost/match/' + id)
          setMatches(matchResponse.data.matches)
        }
      } catch (error) {
        console.error(error)
        setError("Item not found or an error occurred.")
      }
      setLoading(false)
    }
    fetch()
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this item?")) return
    
    try {
      const endpoint = item.type === 'Lost' ? `/lost/delete/${id}` : `/found/delete/${id}`
      await api.delete(endpoint)
      alert("Item deleted successfully!")
      navigate('/')
    } catch (error) {
      console.error(error)
      alert("Failed to delete item.")
    }
  }

  /**
   * Get quality tier based on match score
   * High: > 0.7 (70%)
   * Medium: 0.5 - 0.7 (50-70%)
   * Low: < 0.5 (< 50%)
   */
  const getMatchQuality = (score) => {
    if (score > 0.7) return 'match-high'
    if (score > 0.5) return 'match-medium'
    return 'match-low'
  }

  const getMatchLabel = (score) => {
    if (score > 0.7) return 'Strong Match'
    if (score > 0.5) return 'Possible Match'
    return 'Weak Match'
  }

  /**
   * Calculate circular progress bar offset
   * Circumference = 2πr = 2π(40) ≈ 251.2
   */
  const calculateCircleOffset = (percentage) => {
    const circumference = 251.2
    return circumference - (percentage / 100) * circumference
  }

  if (loading) return <div className='loading'>Finding matches...</div>

  return (
    <div className='page-container'>
      <div className='detail-grid'>

        {/* Left Column: Item Details */}
        <div className='detail-card'>
          <div className='detail-header'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
              <div>
                <span className={`card-badge ${item && item.type === 'Found' ? 'card-badge-green' : ''}`}>
                  {item && item.type} Item
                </span>
                <h1>{item && item.title}</h1>
              </div>
              {item && user && user.id === item.reportedBy && (
                <button className="btn-primary" style={{ backgroundColor: '#dc2626' }} onClick={handleDelete}>
                  Delete Item
                </button>
              )}
            </div>
          </div>

          {/* Item Image */}
          {item && item.image && (
            <img src={item.image} alt={item.title} className='detail-image' />
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

        {/* Right Column: AI Matches with Circular Progress */}
        <div className='matches-section'>
          <h2 className='section-title'>AI Matches</h2>
          <p className='matches-subtitle'>Ranked by semantic similarity score</p>

          {/* No Matches State */}
          {matches.length === 0 && (
            <div className='no-matches'>
              📭 No matches found yet. Check back when more items are reported.
            </div>
          )}

          {/* Match Cards with Circular Progress Bars */}
          {matches.map((match, index) => {
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
                {/* Circular Progress Bar */}
                <div className='circular-progress-container'>
                  <svg className='circular-progress' viewBox='0 0 100 100'>
                    {/* Background circle */}
                    <circle className='progress-bg' cx='50' cy='50' r='40' />
                    {/* Progress bar */}
                    <circle 
                      className='progress-bar animate' 
                      cx='50' 
                      cy='50' 
                      r='40'
                      style={{ strokeDashoffset: circleOffset }}
                    />
                  </svg>
                  {/* Score text in center */}
                  <div className='match-score-text'>
                    <div className='score-percent'>{percentage}</div>
                    <div className='score-label'>%</div>
                  </div>
                </div>

                {/* Match Details */}
                <div className='match-content'>
                  {/* Rank */}
                  <div className='match-header'>
                    <span className='match-rank'>#{index + 1}</span>
                  </div>

                  {/* Description */}
                  <p className='match-desc'>
                    {match.description}
                  </p>

                  {/* Quality Badge */}
                  <span className={`match-quality ${qualityClass}`}>
                    {qualityLabel}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

export default ItemDetail