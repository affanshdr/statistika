'use client'

import React, { useState, useEffect, useRef } from 'react'

import { motion } from 'framer-motion'

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
  gender?: 'male' | 'female'
  avatarUrl?: string
  spriteUrl?: string
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
  gender = 'male',
  avatarUrl,
  spriteUrl,
  onReleaseBall,
  onThrowComplete,
  showBallInHand = true,
}: FieldStudentAthleteProps) {
  const safeId = React.useId().replace(/:/g, '')
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
  let spritesheetUrl = '/Assets/Building/field/walk_down_clean.png'
  let bgX = 0
  let bgY = 0
  let flipX = 'scaleX(1)'
  let bgCols = 5
  let bgRows = 5

  if (mode === 'throw' || mode === 'aim') {
    spritesheetUrl = '/Assets/Building/field/user-throw-trimmed.png'
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
      spritesheetUrl = '/Assets/Building/field/walk_up_clean.png'
      flipX = 'scaleX(1)'
    } else if (facing === 'down') {
      spritesheetUrl = '/Assets/Building/field/walk_down_clean.png'
      flipX = 'scaleX(1)'
    } else if (facing === 'left') {
      spritesheetUrl = '/Assets/Building/field/walk_right_clean.png'
      flipX = 'scaleX(-1)'
    } else {
      spritesheetUrl = '/Assets/Building/field/walk_right_clean.png'
      flipX = 'scaleX(1)'
    }
  } else {
    // Idle
    spritesheetUrl = '/Assets/Building/field/walk_down_clean.png'
    bgCols = 5
    bgRows = 5
    bgX = 0
    bgY = 0
    flipX = 'scaleX(1)'
  }

  const defaultSprite = gender === 'female' ? '/Assets/Building/field/avatars/siswi_ponytail.png' : '/Assets/Building/field/avatars/siswa_default.png'
  const finalSprite = spriteUrl || defaultSprite
  const defaultAvatar = gender === 'female' ? '/Assets/Building/field/avatars/face_siswi_ponytail.png' : '/Assets/Building/field/avatars/face_siswa_default.png'
  const finalAvatar = avatarUrl || defaultAvatar

  const posX = x - size / 2
  const posY = y - size * 0.9
  const charWidth = size * 0.44
  const charHeight = size * 0.9

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

      {/* ── 1. IDLE MODE: High-quality full-body pixel-art student avatar ── */}
      {mode === 'idle' && (
        <image
          href={finalSprite}
          x={x - charWidth / 2}
          y={posY}
          width={charWidth}
          height={charHeight}
          preserveAspectRatio="xMidYMax meet"
          style={{
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.55))',
          }}
        />
      )}

      {/* ── 2. WALK MODE: Pixel-art avatar with walking bounce ── */}
      {mode === 'walk' && (
        <motion.g
          animate={{ y: [0, -4, 0], rotate: [-2.5, 2.5, -2.5] }}
          transition={{ duration: 0.35, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        >
          <image
            href={finalSprite}
            x={x - charWidth / 2}
            y={posY}
            width={charWidth}
            height={charHeight}
            preserveAspectRatio="xMidYMax meet"
            style={{
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.55))',
            }}
          />
        </motion.g>
      )}

      {/* ── 3. AIM & THROW MODE: Throw animation spritesheet ── */}
      {(mode === 'aim' || mode === 'throw') && (
        <>
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
                backgroundImage: `url("${spritesheetUrl}")`,
                backgroundSize: `${bgCols * 100}% ${bgRows * 100}%`,
                backgroundPosition: `${bgX}% ${bgY}%`,
                backgroundRepeat: 'no-repeat',
                transform: flipX,
                transformOrigin: 'center center',
                imageRendering: 'pixelated',
                filter: gender === 'female'
                  ? 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.5)) hue-rotate(290deg) saturate(1.25)'
                  : 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.5))',
                willChange: 'transform, background-position',
              }}
            />
          </foreignObject>

          {/* Female Athlete Hair Ribbon / Accessory */}
          {gender === 'female' && (
            <g transform={`translate(${x + size * 0.08}, ${posY + size * 0.3})`} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))">
              <circle cx={0} cy={0} r={4.5} fill="#EC4899" stroke="#FFF" strokeWidth={1} />
              <path d="M -4,-2 C -8,-6 -10,-2 -7,1 Z" fill="#F472B6" />
              <path d="M 4,-2 C 8,-6 10,-2 7,1 Z" fill="#F472B6" />
            </g>
          )}
        </>
      )}

      {/* ── 4. STUDENT NAME & AVATAR BADGE PILL ── */}
      {label && (() => {
        const hasAvatar = Boolean(finalAvatar)
        const textLen = label.length
        const pillWidth = hasAvatar ? Math.max(104, textLen * 7.2 + 32) : Math.max(76, textLen * 7.2)
        const halfW = pillWidth / 2
        return (
          <g transform={`translate(${x}, ${posY - 12})`}>
            {/* Pill Container */}
            <rect
              x={-halfW}
              y={-12}
              width={pillWidth}
              height={24}
              rx={12}
              fill="rgba(15, 23, 42, 0.94)"
              stroke={gender === 'female' ? '#EC4899' : '#38BDF8'}
              strokeWidth={1.5}
              filter="drop-shadow(0 2px 6px rgba(0,0,0,0.65))"
            />

            {/* Circular Avatar Face Icon */}
            {hasAvatar && (
              <g transform={`translate(${-halfW + 13}, 0)`}>
                <circle cx={0} cy={0} r={10} fill="#1E293B" stroke={gender === 'female' ? '#F472B6' : '#60A5FA'} strokeWidth={1} />
                <clipPath id={`avatar-clip-${safeId}`}>
                  <circle cx={0} cy={0} r={9.5} />
                </clipPath>
                <image
                  href={finalAvatar}
                  x={-9.5}
                  y={-9.5}
                  width={19}
                  height={19}
                  clipPath={`url(#avatar-clip-${safeId})`}
                  style={{ imageRendering: 'pixelated' }}
                />
              </g>
            )}

            {/* Student Label Text */}
            <text
              x={hasAvatar ? 8 : 0}
              y={4}
              textAnchor="middle"
              fontSize={Math.max(10, Math.min(12, size * 0.082))}
              fontWeight="900"
              fill="#FFFFFF"
              fontFamily="var(--font-ui, sans-serif)"
              letterSpacing="0.3px"
            >
              {label}
            </text>
          </g>
        )
      })()}
    </g>
  )
}
