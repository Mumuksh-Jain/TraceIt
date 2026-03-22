import React, { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import AnimatedBackground from '../components/AnimatedBackground'

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/auth/login', { email, password })
      login(response.data.user)
      navigate('/')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <AnimatedBackground theme="auth">
      <div className='auth-container' style={{ background: 'transparent' }}>
        <div className='auth-card-glass'>
          <div className='auth-header'>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 12, animation: 'icon3dFloat 4s ease-in-out infinite', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))' }}>🔐</span>
            <h1>Welcome Back</h1>
            <p>Login to your TraceIt account</p>
          </div>
          <form className='auth-form'>
            <div className='form-group'>
              <label>Email</label>
              <input type='email' placeholder='Enter your email'
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className='form-group'>
              <label>Password</label>
              <input type='password' placeholder='Enter your password'
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className='btn-primary btn-full btn-submit-shine' onClick={handleLogin}>
              Login →
            </button>
          </form>
          <p className='auth-switch'>
            Don't have an account? <Link to='/register'>Register here</Link>
          </p>
        </div>
      </div>
    </AnimatedBackground>
  )
}

export default Login