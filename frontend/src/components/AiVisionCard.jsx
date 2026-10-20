import React, { useState, useEffect } from 'react'
import { analyzeImageFile } from '../services/aiVisionService'

export default function AiVisionCard({ file, onApplyVision }) {
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    if (!file) {
      setAnalysis(null)
      setApplied(false)
      return
    }

    let isMounted = true
    setAnalyzing(true)

    analyzeImageFile(file)
      .then((res) => {
        if (isMounted) {
          setAnalysis(res)
          setAnalyzing(false)
        }
      })
      .catch(() => {
        if (isMounted) setAnalyzing(false)
      })

    return () => {
      isMounted = false
    }
  }, [file])

  if (!file) return null

  if (analyzing) {
    return (
      <div className="ai-vision-card ai-vision-loading">
        <span className="spinner" aria-hidden="true"></span>
        <span>Analyzing photo details...</span>
      </div>
    )
  }

  if (!analysis) return null

  const handleApply = () => {
    onApplyVision(analysis)
    setApplied(true)
    setTimeout(() => setApplied(false), 3000)
  }

  return (
    <div className="ai-vision-card">
      <div className="ai-vision-header">
        <div className="ai-vision-title">
          <span className="ai-vision-icon" aria-hidden="true">📸</span>
          <strong>Photo Suggestions</strong>
        </div>
        <span className="ai-vision-confidence">Auto-Detected</span>
      </div>

      <div className="ai-vision-details">
        <div className="ai-vision-item">
          <span className="ai-vision-label">Item:</span>
          <span className="ai-vision-val">{analysis.detectedObject}</span>
        </div>
        <div className="ai-vision-item">
          <span className="ai-vision-label">Color:</span>
          <span className="ai-vision-val">{analysis.dominantColor}</span>
        </div>
        <div className="ai-vision-item">
          <span className="ai-vision-label">Category:</span>
          <span className="ai-vision-val">{analysis.suggestedCategory}</span>
        </div>
      </div>

      <button
        type="button"
        className="ai-vision-apply-btn"
        onClick={handleApply}
      >
        {applied ? '✓ Photo details applied to form!' : 'Apply photo suggestions to form'}
      </button>
    </div>
  )
}
