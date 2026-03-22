import React, { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import AnimatedBackground from '../components/AnimatedBackground'

function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}
    if (!username.trim()) newErrors.username = "Username is required"
    else if (username.trim().length < 3) newErrors.username = "Username must be at least 3 characters"
    else if (username.trim().length > 20) newErrors.username = "Username must not exceed 20 characters"
    else if (!/^[a-zA-Z0-9_-]+$/.test(username)) newErrors.username = "Only letters, numbers, hyphens, underscores"
    if (!email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email"
    else if (email.trim().length > 100) newErrors.email = "Email must not exceed 100 characters"
    if (!password) newErrors.password = "Password is required"
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters"
    else if (password.length > 50) newErrors.password = "Password must not exceed 50 characters"
    else if (!/(?=.*[a-z])/.test(password)) newErrors.password = "Must contain a lowercase letter"
    else if (!/(?=.*[A-Z])/.test(password)) newErrors.password = "Must contain an uppercase letter"
    else if (!/(?=.*[0-9])/.test(password)) newErrors.password = "Must contain a number"
    else if (!/(?=.*[@$!%*?&])/.test(password)) newErrors.password = "Must contain a special character (@$!%*?&)"
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password"
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    return newErrors
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setSuccessMessage("")
    const newErrors = validateForm()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    setLoading(true)
    try {
      await api.post('/auth/register', { username: username.trim(), email: email.trim().toLowerCase(), password })
      setSuccessMessage("Registration successful! Redirecting to login...")
      setEmail(""); setPassword(""); setUsername(""); setConfirmPassword(""); setErrors({})
      setTimeout(() => navigate('/login'), 1500)
    } catch (error) {
      console.log(error)
      if (error.response?.status === 400) {
        if (error.response.data?.message?.includes('email')) setErrors({ email: "Email already registered." })
        else if (error.response.data?.message?.includes('username')) setErrors({ username: "Username already taken." })
        else setErrors({ form: error.response.data?.message || "Registration failed." })
      } else if (error.response?.status === 409) setErrors({ form: "User already exists." })
      else setErrors({ form: "Registration failed. Check your connection." })
    } finally { setLoading(false) }
  }

  const handleInputChange = (field, value) => {
    if (field === 'username') setUsername(value)
    if (field === 'email') setEmail(value)
    if (field === 'password') setPassword(value)
    if (field === 'confirmPassword') setConfirmPassword(value)
    if (errors[field]) setErrors({ ...errors, [field]: "" })
  }

  return (
    <AnimatedBackground theme="auth">
      <div className='auth-container' style={{ background: 'transparent' }}>
        <div className='auth-card-glass'>
          <div className='auth-header'>
 
            <h1>Create Account</h1>
            <p>Join TraceIt and start finding lost items</p>
          </div>
          {errors.form && <div className='alert alert-error'><span>{errors.form}</span></div>}
          {successMessage && <div className='alert alert-success'><span>{successMessage}</span></div>}
          <form className='auth-form' onSubmit={handleRegister} noValidate>
            <div className='form-group'>
              <label htmlFor='username'>Username <span className='required'>*</span></label>
              <input id='username' type='text' placeholder='Username (3–20 chars)' value={username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={errors.username ? 'input-error' : ''} disabled={loading} autoComplete='username' />
              {errors.username && <span className='error-message'>{errors.username}</span>}
              <small className='char-count'>{username.length}/20</small>
            </div>
            <div className='form-group'>
              <label htmlFor='email'>Email <span className='required'>*</span></label>
              <input id='email' type='email' placeholder='Enter your email' value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'input-error' : ''} disabled={loading} autoComplete='email' />
              {errors.email && <span className='error-message'>{errors.email}</span>}
            </div>
            <div className='form-group'>
              <label htmlFor='password'>Password <span className='required'>*</span></label>
              <input id='password' type='password' placeholder='Enter password' value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={errors.password ? 'input-error' : ''} disabled={loading} autoComplete='new-password' />
              {errors.password && <span className='error-message'>{errors.password}</span>}
              {password && (
                <div className='password-requirements'>
                  <p className='requirements-title'>Password must contain:</p>
                  <ul className='requirements-list'>
                    <li className={password.length >= 6 ? 'valid' : ''}>✓ At least 6 characters</li>
                    <li className={/(?=.*[a-z])/.test(password) ? 'valid' : ''}>✓ One lowercase letter</li>
                    <li className={/(?=.*[A-Z])/.test(password) ? 'valid' : ''}>✓ One uppercase letter</li>
                    <li className={/(?=.*[0-9])/.test(password) ? 'valid' : ''}>✓ One number</li>
                    <li className={/(?=.*[@$!%*?&])/.test(password) ? 'valid' : ''}>✓ One special character</li>
                  </ul>
                </div>
              )}
            </div>
            <div className='form-group'>
              <label htmlFor='confirmPassword'>Confirm Password <span className='required'>*</span></label>
              <input id='confirmPassword' type='password' placeholder='Confirm your password' value={confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={errors.confirmPassword ? 'input-error' : ''} disabled={loading} autoComplete='new-password' />
              {errors.confirmPassword && <span className='error-message'>{errors.confirmPassword}</span>}
              {confirmPassword && password === confirmPassword && <span className='success-message'>✓ Passwords match</span>}
            </div>
            <button className='btn-primary btn-full btn-submit-shine' type='submit' disabled={loading}>
              {loading ? <span className='btn-loading'><span className='spinner' />Creating...</span> : 'Create Account ✨'}
            </button>
          </form>
          <p className='auth-switch'>Already have an account? <Link to='/login'>Login here</Link></p>
        </div>
      </div>
    </AnimatedBackground>
  )
}

export default Register