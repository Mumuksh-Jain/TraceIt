import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float } from '@react-three/drei'

// Vibrant, energetic colors matching each page's theme
const waveColors = {
  lost: '#dd6610ff', // bright orange
  found: '#09ca8aff', // vibrant emerald
  auth: '#200363ff', // luminous purple
  about: 'rgba(4, 55, 79, 1)ff', // deep cerulean
  myitems: '#f8b238ff', // glowing amber
   home: '#89eedaff',// intense cyan (matching the user's uploaded image exactly)
}

function AbstractGlassRibbon({ theme, position, rotation, scale, speedOffset }) {
  const meshRef = useRef()
  const initialPositions = useRef(null)
  
  // High segment count for super smooth fluid folding
  const geometry = useMemo(() => new THREE.PlaneGeometry(35, 20, 128, 64), [])
  let themeColor = waveColors[theme] || waveColors.home
  
  // Three.js fails to parse 8-digit hex codes (like #ff0000ff), so we strip the alpha channel
  if (themeColor && themeColor.length === 9) {
    themeColor = themeColor.substring(0, 7)
  }

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime() * 0.15 + speedOffset // Slower wave morphing
    const pos = geometry.attributes.position.array
    
    // Cache original positions once
    if (!initialPositions.current) {
      initialPositions.current = new Float32Array(pos.length)
      for (let i = 0; i < pos.length; i++) {
        initialPositions.current[i] = pos[i]
      }
    }

    // Map cursor to roughly the local plane coordinates, accounting for transforms
    const pointerX = state.pointer.x * 20 - position[0]
    const pointerY = state.pointer.y * -15 - position[1]

    // Morph vertices to create deep glass folds
    for (let i = 0; i < pos.length; i += 3) {
      const x = initialPositions.current[i]
      const y = initialPositions.current[i + 1]
      
      const waveX = Math.sin(x * 0.15 + time) * 1.5
      const waveY = Math.cos(y * 0.2 - time * 0.8) * 2.0
      // Twisting creates the overlapping ribbon appearance
      const twist = Math.sin(x * 0.05 + y * 0.05) * 3.0
      
      // Calculate responsive interactive cursor ripples
      const dx = x - pointerX
      const dy = y - pointerY
      // Distorted distance calculation to account for the heavy X-axis rotation
      const dist = Math.sqrt(dx * dx + (dy * dy) * 0.5)
      
      let ripple = 0
      if (dist < 5) {
        // High frequency ripple packed tightly, creating a very strong, small visible wake
        // The multiplier (5 - dist) * 0.5 creates a sharp physical distortion on the glass
        ripple = Math.sin(dist * 4.0 - time * 15) * ((5 - dist) * 0.5)
      }
      
      pos[i + 2] = waveX + waveY + twist + ripple
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale} geometry={geometry}>
      <meshPhysicalMaterial 
        color={themeColor} 
        emissive={themeColor}
        emissiveIntensity={1.2} // Strongly boosted glow so the color blasts through the glass
        metalness={0.1} // More glassy than metallic
        roughness={0.05} // Ultra smooth surface
        transmission={0.8} // Frosted glass transparency
        thickness={2.0} // Thick glass refraction
        clearcoat={1.0} // High gloss reflection // Highly polished
        clearcoatRoughness={0.0}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function SceneContents({ theme }) {
  let themeColor = waveColors[theme] || waveColors.home
  if (themeColor && themeColor.length === 9) {
    themeColor = themeColor.substring(0, 7)
  }

  return (
    <group>
      {/* 3 massive overlapping glass ribbons, like the abstract fluid in the image */}
      <Float speed={0.4} rotationIntensity={0.1} floatIntensity={0.2}>
        <AbstractGlassRibbon theme={theme} position={[0, -2, -5]} rotation={[-Math.PI / 3, 0.1, 0]} scale={1} speedOffset={0} />
      </Float>
      
      <Float speed={0.3} rotationIntensity={0.1} floatIntensity={0.3}>
        <AbstractGlassRibbon theme={theme} position={[2, -4, -8]} rotation={[-Math.PI / 3 + 0.3, 0.2, 0.1]} scale={1.2} speedOffset={100} />
      </Float>

      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <AbstractGlassRibbon theme={theme} position={[-2, 1, -12]} rotation={[-Math.PI / 4, -0.2, -0.1]} scale={1.5} speedOffset={200} />
      </Float>

      {/* Extreme bright studio lighting for pure gloss */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 10]} intensity={3} color="#ffffff" />
      {/* Tint the shadow-side lighting with the theme color to immerse the scene */}
      <directionalLight position={[-10, 10, -10]} intensity={2.5} color={themeColor} />
      <pointLight position={[0, -5, 5]} intensity={8} color={themeColor} />
    </group>
  )
}

export default function SplineBackground({ theme = 'home' }) {
  // Use `pointerEvents: none` because these are just background visuals
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'transparent' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <SceneContents theme={theme} />
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
