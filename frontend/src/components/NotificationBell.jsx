import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function NotificationBell() {
  const { isLoggedIn } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const fetchNotifications = async () => {
    if (!isLoggedIn) return
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch (err) {
      // User may not be logged in yet
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications()
      // Poll every 25 seconds for real-time match updates
      const interval = setInterval(fetchNotifications, 25000)
      return () => clearInterval(interval)
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [isLoggedIn])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation()
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark read', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      setLoading(true)
      await api.put('/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all read', err)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      handleMarkAsRead(notif._id)
    }
    setIsOpen(false)
    if (notif.lostItem?._id) {
      navigate(`/item/${notif.lostItem._id}`)
    } else if (notif.foundItem?._id) {
      navigate(`/item/${notif.foundItem._id}`)
    }
  }

  return (
    <div className="notif-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="notif-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <span className="notif-icon" aria-hidden="true">🔔</span>
        {unreadCount > 0 && (
          <span className="notif-badge" aria-label={`${unreadCount} unread alerts`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown" role="menu">
          <div className="notif-header">
            <div className="notif-title-row">
              <h3>Match Updates</h3>
              {unreadCount > 0 && (
                <span className="notif-unread-pill">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="notif-mark-all-btn"
                onClick={handleMarkAllRead}
                disabled={loading}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {!isLoggedIn ? (
              <div className="notif-empty">
                <span className="notif-empty-icon" aria-hidden="true">🔔</span>
                <p>Campus Match Updates</p>
                <small>Log in to get notified the moment someone reports an item that matches what you lost.</small>
                <button
                  type="button"
                  className="btn-primary btn-sm"
                  style={{ marginTop: 14 }}
                  onClick={() => {
                    setIsOpen(false)
                    navigate('/login')
                  }}
                >
                  Log In to View Alerts
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">
                <span className="notif-empty-icon" aria-hidden="true">✨</span>
                <p>You&apos;re all caught up!</p>
                <small>We&apos;re constantly checking new campus posts and will alert you right here when a match is found.</small>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notif-item ${!notif.read ? 'notif-item-unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                  role="menuitem"
                  tabIndex={0}
                >
                  <div className="notif-item-header">
                    <span className="notif-score-badge">
                      {notif.score}% Match
                    </span>
                    <span className="notif-time">
                      {new Date(notif.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <h4 className="notif-item-title">{notif.title}</h4>
                  <p className="notif-item-desc">{notif.message}</p>

                  <div className="notif-item-footer">
                    <span className="notif-cta-link">View Details →</span>
                    {!notif.read && (
                      <button
                        type="button"
                        className="notif-dismiss-btn"
                        onClick={(e) => handleMarkAsRead(notif._id, e)}
                        title="Mark as read"
                        aria-label="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
