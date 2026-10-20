import React, { useState, useEffect } from 'react'

export default function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight <= 0) {
        setScrollProgress(0)
        return
      }
      const currentScroll = window.scrollY
      const progress = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100))
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="scroll-progress-track" aria-hidden="true">
      <div 
        className="scroll-progress-fill" 
        style={{ width: `${scrollProgress}%` }}
      >
        <span className="scroll-progress-glow"></span>
      </div>
    </div>
  )
}
