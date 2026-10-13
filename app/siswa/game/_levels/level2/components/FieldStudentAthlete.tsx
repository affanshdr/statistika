'use client'

import React, { useState, useEffect, useRef } from 'react'

export type AthleteMode = 'idle' | 'walk' | 'aim' | 'throw'
export type FacingDirection = 'right' | 'left' | 'up' | 'down'

interface FieldStudentAthleteProps {
  x: number
  y: number
  dir?: { x: number; y: number }
  mode?: AthleteMode
  size?: number
  label?: string
  glowColor?: string
  onReleaseBall?: () => void
  onThrowComplete?: () => void
  showBallInHand?: boolean
}

export default function FieldStudentAthlete({
  x,
  y,
  dir = { x: 0, y: 0 },
  mode = 'idle',
  size = 180,
  label = '',
  glowColor = '#00ADB5',
  onReleaseBall,
  onThrowComplete,
  showBallInHand = true,
}: FieldStudentAthleteProps) {
  const [walkFrame, setWalkFrame] = useState(0)
  const [throwFrame, setThrowFrame] = useState(0)
  const lastFacingRef = useRef<FacingDirection>('down')
  const releaseFiredRef = useRef(false)
  const completeFiredRef = useRef(false)

  // Facing direction detection for walking
  let facing: FacingDirection = lastFacingRef.current
  if (Math.abs(dir.y) > Math.abs(dir.x) * 0.7) {
    if (dir.y < -0.15) facing = 'up'
    else if (dir.y > 0.15) facing = 'down'
  } else {
    if (dir.x < -0.1) facing = 'left'
    else if (dir.x > 0.1) facing = 'right'
  }
  lastFacingRef.current = facing

  // Walk animation frame loop (25 frames, 5x5 grid)
  useEffect(() => {
    if (mode !== 'walk') return
    const interval = setInterval(() => {
      setWalkFrame(prev => (prev + 1) % 25)
    }, 45)
    return () => clearInterval(interval)
  }, [mode])

  // Throw animation frame loop (user-throw-trimmed: 20 frames, 5 cols x 4 rows)
  useEffect(() => {
    if (mode !== 'throw') {
      setThrowFrame(0)
      releaseFiredRef.current = false
      completeFiredRef.current = false
      return
    }

    releaseFiredRef.current = false
    completeFiredRef.current = false
    setThrowFrame(0)

    // Sequence through frames 0 to 14
    let currentF = 0
    const interval = setInterval(() => {
      currentF++
      if (currentF >= 14) {
        clearInterval(interval)
        if (!completeFiredRef.current) {
          completeFiredRef.current = true
          onThrowComplete?.()
        }
        return
      }

      setThrowFrame(currentF)

      // Release point is frame 7-8 when arm swings forward!
      if (currentF === 7 && !releaseFiredRef.current) {
        releaseFiredRef.current = true
        onReleaseBall?.()
      }
    }, 65)

    return () => clearInterval(interval)
  }, [mode, onReleaseBall, onThrowComplete])

  // Calculate sprite and background coordinates
  let spriteUrl = '/Assets/Building/field/walk_down_clean.png'
  let bgX = 0
  let bgY = 0
  let flipX = 'scaleX(1)'
  let bgCols = 5
  let bgRows = 5

  if (mode === 'throw' || mode === 'aim') {
    spriteUrl = '/Assets/Building/field/user-throw-trimmed.png'
    bgCols = 5
    bgRows = 4

    let f = 0
    if (mode === 'aim') {
      // Frame 3 or 4: student raising ball high to aim!
      f = 4
    } else {
      f = Math.min(19, throwFrame)
    }

    const col = f % 5
    const row = Math.floor(f / 5)
    bgX = (col / 4) * 100
    bgY = (row / 3) * 100
    flipX = 'scaleX(1)'
  } else if (mode === 'walk') {
    bgCols = 5
    bgRows = 5
    const col = walkFrame % 5
    const row = Math.floor(walkFrame / 5)
    bgX = (col / 4) * 100
    bgY = (row / 4) * 100

    if (facing === 'up') {
      spriteUrl = '/Assets/Building/field/walk_up_clean.png'
      flipX = 'scaleX(1)'
    } else if (facing === 'down') {
      spriteUrl = '/Assets/Building/field/walk_down_clean.png'
      flipX = 'scaleX(1)'
    } else if (facing === 'left') {
      spriteUrl = '/Assets/Building/field/walk_right_clean.png'
      flipX = 'scaleX(-1)'
    } else {
      spriteUrl = '/Assets/Building/field/walk_right_clean.png'
      flipX = 'scaleX(1)'
    }
  } else {
    // Idle
    spriteUrl = '/Assets/Building/field/walk_down_clean.png'
    bgCols = 5
    bgRows = 5
    bgX = 0
    bgY = 0
    flipX = 'scaleX(1)'
  }

  const posX = x - size / 2
  const posY = y - size * 0.9

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Ground shadow */}
      <ellipse
        cx={x}
        cy={y}
        rx={size * 0.22}
        ry={size * 0.08}
        fill="rgba(0, 0, 0, 0.45)"
        filter="blur(2px)"
      />

      {/* Aura glow */}
      {glowColor && (
        <ellipse
          cx={x}
          cy={y}
          rx={size * 0.18}
          ry={size * 0.07}
          fill={glowColor}
          opacity={mode === 'aim' || mode === 'throw' ? 0.5 : 0.25}
          style={{ transition: 'opacity 0.2s' }}
        />
      )}

      {/* Character Sprite */}
      <foreignObject
        x={posX}
        y={posY}
        width={size}
        height={size}
        style={{ overflow: 'visible', pointerEvents: 'none', willChange: 'transform' }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url("${spriteUrl}")`,
            backgroundSize: `${bgCols * 100}% ${bgRows * 100}%`,
            backgroundPosition: `${bgX}% ${bgY}%`,
            backgroundRepeat: 'no-repeat',
            transform: flipX,
            transformOrigin: 'center center',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.5))',
            willChange: 'transform, background-position',
          }}
        />
      </foreignObject>

      {/* Name Label */}
      {label && (
        <text
          x={x}
          y={posY - 10}
          textAnchor="middle"
          fontSize={Math.max(13, size * 0.085)}
          fontWeight="900"
          fill="#FFFFFF"
          stroke="rgba(0, 0, 0, 0.85)"
          strokeWidth={3}
          paintOrder="stroke fill"
          fontFamily="var(--font-ui, sans-serif)"
          letterSpacing="0.5px"
        >
          {label}
        </text>
      )}
    </g>
  )
}
