import React, { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { trackEvent } from '../services/siteMetrics'

function Login() {
  useDocumentTitle(
    'Login',
    'Sign in to your TraceIt campus lost and found account to track reported items and review AI matches.'
  )

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState("")
  const [loading, setLoading] = useState(false)
  const [honeypot, setHoneypot] = useState("")

  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const errs = {}
    if (!email.trim()) {
      errs.email = "Email address is required."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address."
    }

    if (!password) {
      errs.password = "Password is required."
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters."
    }

    return errs
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setFormError("")

    // Honeypot anti-spam
    if (honeypot) {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        navigate('/')
      }, 1000)
      return
    }

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/login', { 
        email: email.trim().toLowerCase(), 
        password 
      })
      login(response.data.user)
      trackEvent('login_success')
      navigate('/')
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        setFormError(error.response.data?.message || "Invalid email or password. Please try again.")
      } else if (error.response?.status === 429) {
        setFormError("Too many login attempts. Please wait 15 minutes before trying again.")
      } else {
        setFormError("Login failed. Please check your internet connection and try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='auth-container'>
      <div className='auth-card-glass'>
        <div className='auth-header'>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 12, animation: 'icon3dFloat 4s ease-in-out infinite', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))' }}>🔐</span>
          <h1>Welcome Back</h1>
          <p>Login to your TraceIt campus account</p>
        </div>

        {formError && (
          <div className='alert alert-error' role="alert">
            <span>{formError}</span>
          </div>
        )}

        <form className='auth-form' onSubmit={handleLogin} noValidate>
          {/* Honeypot field */}
          <div style={{ position: 'absolute', opacity: 0, zIndex: -1, width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
            <input
              type="text"
              name="_gotcha"
              tabIndex="-1"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className='form-group'>
            <label htmlFor='login-email'>Email Address</label>
            <input 
              id='login-email'
              type='email' 
              placeholder='student@university.edu'
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: "" })
              }}
              className={errors.email ? 'input-error' : ''}
              disabled={loading}
              autoComplete='email'
              aria-required="true"
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && <span className='error-message'>{errors.email}</span>}
          </div>

          <div className='form-group'>
            <label htmlFor='login-password'>Password</label>
            <input 
              id='login-password'
              type='password' 
              placeholder='Enter your password'
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors({ ...errors, password: "" })
              }}
              className={errors.password ? 'input-error' : ''}
              disabled={loading}
              autoComplete='current-password'
              aria-required="true"
              aria-invalid={errors.password ? "true" : "false"}
            />
            {errors.password && <span className='error-message'>{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className='btn-primary btn-full btn-submit-shine' 
            disabled={loading}
          >
            {loading ? (
              <span className='btn-loading'>
                <span className='spinner' aria-hidden="true" />
                Signing in...
              </span>
            ) : (
              'Login →'
            )}
          </button>
        </form>

        <p className='auth-switch'>
          Don&apos;t have an account? <Link to='/register'>Register here</Link>
        </p>
      </div>
    </div>
  )
}

export default Login