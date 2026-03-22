import React from 'react'
import SplineBackground from './SplineBackground'

function AnimatedBackground({ theme = 'home', children }) {
  // We use SplineBackground for all themes now to give that 3D look globally.
  // We keep the wrapper so that existing pages using AnimatedBackground don't break.
  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#030712', // Night sky gradient for abstract ribbons
        overflow: 'hidden',
        minHeight: '100vh',
      }}
    >
      <SplineBackground theme={theme} />
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  )
}

export default AnimatedBackground
