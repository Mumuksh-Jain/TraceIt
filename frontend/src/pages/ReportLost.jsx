import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { trackEvent } from '../services/siteMetrics'
import TraceBotQuickReport from '../components/TraceBotQuickReport'
import AiVisionCard from '../components/AiVisionCard'

function ReportLost() {
  useDocumentTitle(
    'Report Lost Item',
    'Submit a lost item report on TraceIt. Our AI semantic engine matches your description against campus found items.'
  )

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("")
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState("")
  
  // Anti-spam honeypot & time-trap
  const [honeypot, setHoneypot] = useState("")
  const renderTimeRef = useRef(Date.now())

  const navigate = useNavigate()

  useEffect(() => {
    renderTimeRef.current = Date.now()
  }, [])

  const handleImage = (e) => {
    const file = e.target.files[0]
    setErrors(prev => ({ ...prev, image: "" }))

    if (!file) {
      setImage(null)
      setPreview(null)
      return
    }

    // Validate image format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: "Please upload a valid image (JPEG, PNG, WebP, or GIF)." }))
      setImage(null)
      setPreview(null)
      return
    }

    // Validate image size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: "Image size must not exceed 5MB." }))
      setImage(null)
      setPreview(null)
      return
    }

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Title validation
    if (!title.trim()) {
      newErrors.title = "Item title is required."
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters."
    } else if (title.trim().length > 80) {
      newErrors.title = "Title must not exceed 80 characters."
    }

    // Description validation
    if (!description.trim()) {
      newErrors.description = "Detailed description is required."
    } else if (description.trim().length < 10) {
      newErrors.description = "Please provide at least 10 characters so our AI can match accurately."
    } else if (description.trim().length > 1000) {
      newErrors.description = "Description cannot exceed 1000 characters."
    }

    // Location validation
    if (!location.trim()) {
      newErrors.location = "Campus location is required."
    } else if (location.trim().length < 3) {
      newErrors.location = "Please enter a specific campus location (min 3 characters)."
    } else if (location.trim().length > 100) {
      newErrors.location = "Location cannot exceed 100 characters."
    }

    // Category validation
    const validCategories = ["Bags", "Electronics", "Clothing", "Documents", "Accessories", "Books", "Other"]
    if (!category) {
      newErrors.category = "Please select an item category."
    } else if (!validCategories.includes(category)) {
      newErrors.category = "Please select a valid category."
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")

    // Anti-spam check 1: Honeypot trap
    if (honeypot) {
      // Bot caught in honeypot field - fake success and exit
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        navigate('/my-items')
      }, 1000)
      return
    }

    // Anti-spam check 2: Time-gate (< 1.5 seconds is unnatural for human input)
    const elapsedSeconds = (Date.now() - renderTimeRef.current) / 1000
    if (elapsedSeconds < 1.5) {
      setFormError("Submission flagged by spam protection. Please take a moment to review your report.")
      return
    }

    // Validate fields
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      // Focus on first error element
      const firstKey = Object.keys(validationErrors)[0]
      const el = document.getElementById(`lost-${firstKey}`)
      if (el) el.focus()
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('description', description.trim())
    formData.append('location', location.trim())
    formData.append('category', category)
    if (image) {
      formData.append('image', image)
    }

    try {
      await api.post('/lost/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      trackEvent('report_lost_success', { category })
      navigate('/my-items')
    } catch (error) {
      if (error.response?.status === 429) {
        setFormError("Rate limit reached. Please wait a few minutes before submitting another report.")
      } else if (error.response?.data?.message) {
        setFormError(error.response.data.message)
      } else {
        setFormError("Failed to submit lost item report. Please check your internet connection.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='form-container-3d'>
      <div className='form-card-3d card-lost'>
        <div className='form-progress' aria-hidden="true">
          <div className='form-progress-step active'>
            <div className='form-progress-dot'>1</div>
            <span className='form-progress-label'>Describe</span>
          </div>
          <div className='form-progress-step active'>
            <div className='form-progress-dot'>2</div>
            <span className='form-progress-label'>Location</span>
          </div>
          <div className='form-progress-step active'>
            <div className='form-progress-dot'>3</div>
            <span className='form-progress-label'>Submit</span>
          </div>
        </div>

        <div className='form-header'>
          <span className='form-icon-3d' aria-hidden="true">🔍</span>
          <h1>Report Lost Item</h1>
          <p>Describe your lost item so fellow students and campus staff can help locate and return it</p>
        </div>

        {formError && (
          <div className='alert alert-error' role="alert">
            <span>{formError}</span>
          </div>
        )}

        {/* TraceBot Natural Language Assistant */}
        <TraceBotQuickReport 
          mode="lost"
          onApply={(parsed) => {
            if (parsed.title) setTitle(parsed.title)
            if (parsed.category) setCategory(parsed.category)
            if (parsed.location) setLocation(parsed.location)
            if (parsed.description) setDescription(parsed.description)
            setErrors({})
          }}
        />

        <form className='report-form' onSubmit={handleSubmit} noValidate>
          {/* Honeypot field (hidden from humans, trapped by spam bots) */}
          <div style={{ position: 'absolute', opacity: 0, zIndex: -1, width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
            <label htmlFor="lost-gotcha">Do not fill this field</label>
            <input
              type="text"
              id="lost-gotcha"
              name="_gotcha"
              tabIndex="-1"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
            />
          </div>

          {/* Title */}
          <div className='form-group'>
            <label htmlFor='lost-title'>
              Item Title <span className='required'>*</span>
            </label>
            <input 
              id='lost-title'
              type="text" 
              placeholder='e.g. Navy Blue HydroFlask Water Bottle'
              value={title} 
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) setErrors({ ...errors, title: "" })
              }}
              className={errors.title ? 'input-error' : ''}
              maxLength={80}
              disabled={loading}
              aria-required="true"
              aria-invalid={errors.title ? "true" : "false"}
            />
            {errors.title && <span className='error-message'>{errors.title}</span>}
            <small className='char-count'>{title.length}/80 characters</small>
          </div>

          {/* Description */}
          <div className='form-group'>
            <label htmlFor='lost-description'>
              Description <span className='required'>*</span>
            </label>
            <textarea 
              id='lost-description'
              placeholder='Describe color, brand, distinct marks, stickers, engravings, contents, or case details...'
              value={description} 
              onChange={(e) => {
                setDescription(e.target.value)
                if (errors.description) setErrors({ ...errors, description: "" })
              }} 
              rows={4} 
              className={errors.description ? 'input-error' : ''}
              maxLength={1000}
              disabled={loading}
              aria-required="true"
              aria-invalid={errors.description ? "true" : "false"}
            />
            {errors.description && <span className='error-message'>{errors.description}</span>}
            <small className='char-count'>{description.length}/1000 characters</small>
          </div>

          <div className='form-row'>
            {/* Location */}
            <div className='form-group'>
              <label htmlFor='lost-location'>
                Location Lost <span className='required'>*</span>
              </label>
              <input 
                id='lost-location'
                type="text" 
                placeholder='e.g. Central Library 2nd Floor Reading Room'
                value={location} 
                onChange={(e) => {
                  setLocation(e.target.value)
                  if (errors.location) setErrors({ ...errors, location: "" })
                }} 
                className={errors.location ? 'input-error' : ''}
                maxLength={100}
                disabled={loading}
                aria-required="true"
                aria-invalid={errors.location ? "true" : "false"}
              />
              {errors.location && <span className='error-message'>{errors.location}</span>}
            </div>

            {/* Category */}
            <div className='form-group'>
              <label htmlFor='lost-category'>
                Category <span className='required'>*</span>
              </label>
              <select 
                id='lost-category'
                value={category} 
                onChange={(e) => {
                  setCategory(e.target.value)
                  if (errors.category) setErrors({ ...errors, category: "" })
                }}
                className={errors.category ? 'input-error' : ''}
                disabled={loading}
                aria-required="true"
                aria-invalid={errors.category ? "true" : "false"}
              >
                <option value="">Select category...</option>
                <option value="Electronics">Electronics (Laptop, Phone, Headphones)</option>
                <option value="Bags">Bags &amp; Backpacks</option>
                <option value="Documents">Documents &amp; Student IDs</option>
                <option value="Accessories">Accessories (Watches, Keys, Glasses)</option>
                <option value="Clothing">Clothing &amp; Jackets</option>
                <option value="Books">Books &amp; Notebooks</option>
                <option value="Other">Other Miscellaneous</option>
              </select>
              {errors.category && <span className='error-message'>{errors.category}</span>}
            </div>
          </div>

          {/* Image Upload */}
          <div className='form-group'>
            <label htmlFor='lost-image-input'>Item Photograph (Optional)</label>
            <div className='file-upload'>
              <input 
                type="file" 
                id='lost-image-input' 
                onChange={handleImage} 
                accept='image/jpeg,image/png,image/webp,image/gif'
                disabled={loading}
              />
              <label htmlFor='lost-image-input' className='file-label-glass'>
                <span className='file-upload-icon' aria-hidden="true">{preview ? '✅' : '📷'}</span>
                {preview ? 'Photo selected — click to change' : 'Upload photo (JPEG, PNG, WebP — max 5MB)'}
              </label>
            </div>
            {errors.image && <span className='error-message'>{errors.image}</span>}
            {preview && (
              <>
                <img 
                  src={preview} 
                  alt="Selected preview of lost item for report submission" 
                  className='image-preview' 
                />
                <AiVisionCard 
                  file={image}
                  onApplyVision={(analysis) => {
                    if (!title.trim() && analysis.suggestedTitle) {
                      setTitle(analysis.suggestedTitle)
                    }
                    if (!category && analysis.suggestedCategory) {
                      setCategory(analysis.suggestedCategory)
                    }
                    if (description.trim()) {
                      setDescription(prev => `${prev}\n[Visual Analysis: ${analysis.detectedObject}, Color: ${analysis.dominantColor}]`)
                    } else {
                      setDescription(`Item appears to be a ${analysis.detectedObject.toLowerCase()} in ${analysis.dominantColor.toLowerCase()} finish.`)
                    }
                  }}
                />
              </>
            )}
          </div>

          {/* Privacy Note */}
          <p className="form-privacy-note">
            By reporting, you agree to TraceIt&apos;s{' '}
            <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms</Link> and{' '}
            <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>.
          </p>

          {/* Submit Button */}
          <button 
            type="submit" 
            className='btn-primary btn-full btn-submit-shine' 
            disabled={loading}
          >
            {loading ? (
              <span className='btn-loading'>
                <span className='spinner' aria-hidden="true" />
                Submitting Report...
              </span>
            ) : (
              '🔍 Report Lost Item'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ReportLost