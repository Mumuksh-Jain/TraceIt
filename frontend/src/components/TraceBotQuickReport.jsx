import React, { useState } from 'react'
import { parseNaturalReport } from '../services/traceBotParser'

export default function TraceBotQuickReport({ onApply, mode = 'lost' }) {
  const [prompt, setPrompt] = useState('')
  const [success, setSuccess] = useState(false)

  const handleQuickFill = (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    const parsed = parseNaturalReport(prompt)
    if (parsed) {
      onApply(parsed)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    }
  }

  const examplePlaceholder = mode === 'lost'
    ? 'e.g. Lost my black Dell laptop with stickers in the library 2nd floor around 2 PM'
    : 'e.g. Found a blue Hydro Flask water bottle on a bench near the cafeteria'

  return (
    <div className="tracebot-container">
      <div className="tracebot-header">
        <div className="tracebot-badge">
          <span className="tracebot-icon" aria-hidden="true">✨</span>
          <strong>One-Sentence Fast Fill</strong>
        </div>
        <span className="tracebot-pill">Quick Helper</span>
      </div>

      <p className="tracebot-desc">
        In a rush between classes? Describe what happened in one sentence and we&apos;ll fill in the fields below for you.
      </p>

      <form onSubmit={handleQuickFill} className="tracebot-form">
        <input
          type="text"
          className="tracebot-input"
          placeholder={examplePlaceholder}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          aria-label="Describe item in plain words"
        />
        <button
          type="submit"
          className="tracebot-btn"
          disabled={!prompt.trim()}
        >
          Auto-Fill Form
        </button>
      </form>

      {success && (
        <div className="tracebot-success-msg" role="status">
          ✓ Details filled in below! Review and make any quick adjustments.
        </div>
      )}
    </div>
  )
}
