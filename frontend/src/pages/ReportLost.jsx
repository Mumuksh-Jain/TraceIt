import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import AnimatedBackground from '../components/AnimatedBackground'

function ReportLost() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("")
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const navigate = useNavigate()

  const handleImage = (e) => {
    const file = e.target.files[0]
    setImage(file)
    if (file) setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('location', location)
    formData.append('category', category)
    formData.append('image', image)
    try {
      await api.post('/lost/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      navigate('/my-items')
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  return (
    <AnimatedBackground theme="lost">
      <div className='form-container-3d'>
        <div className='form-card-3d card-lost'>
          <div className='form-progress'>
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
            <span className='form-icon-3d'>🔍</span>
            <h1>Report Lost Item</h1>
            <p>Describe your lost item and our AI will find matches</p>
          </div>
          <form className='report-form'>
            <div className='form-group'>
              <label>Title</label>
              <input type="text" placeholder='e.g. Black Nike Backpack'
                value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className='form-group'>
              <label>Description</label>
              <textarea placeholder='Describe your item in detail — color, size, brand, distinguishing features...'
                value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div className='form-row'>
              <div className='form-group'>
                <label>Location Lost</label>
                <input type="text" placeholder='e.g. Library Block A'
                  value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className='form-group'>
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Select category</option>
                  <option value="Bags">Bags</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Documents">Documents</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className='form-group'>
              <label>Image</label>
              <div className='file-upload'>
                <input type="file" id='file-input' onChange={handleImage} accept='image/*' />
                <label htmlFor='file-input' className='file-label-glass'>
                  <span className='file-upload-icon'>{preview ? '✅' : '📷'}</span>
                  {preview ? 'Image selected — click to change' : 'Click to upload an image'}
                </label>
              </div>
              {preview && <img src={preview} alt="preview" className='image-preview' />}
            </div>
            <button className='btn-primary btn-full btn-submit-shine' onClick={handleSubmit} disabled={loading}>
              {loading
                ? <span className='btn-loading'><span className='spinner' />Submitting...</span>
                : '🔍 Report Lost Item'}
            </button>
          </form>
        </div>
      </div>
    </AnimatedBackground>
  )
}

export default ReportLost