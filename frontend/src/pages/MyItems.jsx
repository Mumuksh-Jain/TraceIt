import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'
import AnimatedBackground from '../components/AnimatedBackground'

function MyItems() {
  const [lostItems, setLostItems] = useState([])
  const [foundItems, setFoundItems] = useState([])
  const [activeTab, setActiveTab] = useState('lost')

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const lost = await api.get('/lost/my-items')
        const found = await api.get('/found/my-items')
        setLostItems(lost.data.items)
        setFoundItems(found.data.items)
      } catch (error) {
        console.error(error)
      }
    }
    fetchItems()
  }, [])

  return (
    <AnimatedBackground theme="myitems">
      <div className='page-container'>
        <h1 className='page-title'>My Items</h1>
        <div className='tabs'>
          <button className={`tab tab-enhanced ${activeTab === 'lost' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('lost')}>🔍 Lost Items ({lostItems.length})</button>
          <button className={`tab tab-enhanced ${activeTab === 'found' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('found')}>📦 Found Items ({foundItems.length})</button>
        </div>
        {activeTab === 'lost' && (
          <div className='cards-grid'>
            {lostItems.length === 0 && <p className='empty-msg'>No lost items reported yet.</p>}
            {lostItems.map((item) => (
              <div className='card' key={item._id}>
                {item.image && <img src={item.image} alt={item.title} className='card-image' />}
                <div className='card-body'>
                  <span className='card-badge'>Lost</span>
                  <h3 className='card-title'>{item.title}</h3>
                  <p className='card-desc'>{item.description}</p>
                  <p className='card-location'>📍 {item.location}</p>
                  <div className='card-footer'>
                    <span className={`status-badge ${item.status === 'Open' ? 'status-open' : 'status-closed'}`}>{item.status}</span>
                    <Link className='btn-primary btn-sm' to={`/item/${item._id}`}>View Matches</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'found' && (
          <div className='cards-grid'>
            {foundItems.length === 0 && <p className='empty-msg'>No found items reported yet.</p>}
            {foundItems.map((item) => (
              <div className='card' key={item._id}>
                {item.image && <img src={item.image} alt={item.title} className='card-image' />}
                <div className='card-body'>
                  <span className='card-badge card-badge-green'>Found</span>
                  <h3 className='card-title'>{item.title}</h3>
                  <p className='card-desc'>{item.description}</p>
                  <p className='card-location'>📍 {item.location}</p>
                  <span className={`status-badge ${item.status === 'Open' ? 'status-open' : 'status-closed'}`}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AnimatedBackground>
  )
}

export default MyItems