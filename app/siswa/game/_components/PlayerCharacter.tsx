'use client'

import React, { useState, useEffect, useRef } from 'react'

interface PlayerCharacterProps {
  x: number
  y: number
  dir?: { x: number; y: number }
  size?: number
  label?: string
  glowColor?: string
}

export type FacingDirection = 'right' | 'left' | 'up' | 'down'

export default function PlayerCharacter({
  x,
  y,
  dir = { x: 0, y: 0 },
  size = 28,
  label = 'Kamu',
  glowColor = '#00ADB5',
}: PlayerCharacterProps) {
  const [frame, setFrame] = useState(0)
  const lastFacingRef = useRef<FacingDirection>('down')

  const isMoving = Math.abs(dir.x) > 0.05 || Math.abs(dir.y) > 0.05

  // Determine current facing direction based on movement vector
  let facing: FacingDirection = lastFacingRef.current
  if (Math.abs(dir.y) > Math.abs(dir.x) * 0.7) {
    if (dir.y < -0.2) facing = 'up'
    else if (dir.y > 0.2) facing = 'down'
  } else {
    if (dir.x < -0.1) facing = 'left'
    else if (dir.x > 0.1) facing = 'right'
  }
  lastFacingRef.current = facing

  // Cycle animation frames: faster cycle when walking (55ms), subtle idle cycle when stationary (120ms)
  useEffect(() => {
    const speed = isMoving ? 55 : 120
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % 25)
    }, speed)

    return () => clearInterval(interval)
  }, [isMoving])

  // Select sprite URL based on movement state and facing direction
  let spriteUrl = '/Assets/Character/Stevunt-idle.png'
  if (isMoving) {
    if (facing === 'up') {
      spriteUrl = '/Assets/Character/Stevunt-iso_walk_up-trimmed.png'
    } else if (facing === 'down') {
      spriteUrl = '/Assets/Character/Stevunt-iso_walk_down.png'
    } else {
      spriteUrl = '/Assets/Character/Stevunt-iso_walk_right.png'
    }
  } else {
    // When idle (stationary), transition cleanly to front-facing idle animation
    spriteUrl = '/Assets/Character/Stevunt-idle.png'
  }

  // Grid coordinates for 5x5 sprite sheet (5 columns, 5 rows)
  const currentFrame = frame
  const col = currentFrame % 5
  const row = Math.floor(currentFrame / 5)
  const bgX = col * 25
  const bgY = row * 25

  const flipX = facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)'

  const width = size
  const height = size
  const posX = x - width / 2
  const posY = y - height * 0.85

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Ground drop-shadow & aura glow */}
      <ellipse
        cx={x}
        cy={y}
        rx={size * 0.175}
        ry={size * 0.075}
        fill="rgba(0, 0, 0, 0.45)"
        filter="blur(1px)"
      />
      <ellipse
        cx={x}
        cy={y}
        rx={size * 0.15}
        ry={size * 0.06}
        fill={glowColor}
        opacity={isMoving ? 0.45 : 0.25}
        style={{ transition: 'opacity 0.2s' }}
      />

      {/* Sprite HTML element embedded inside SVG */}
      <foreignObject
        x={posX}
        y={posY}
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url("${spriteUrl}")`,
            backgroundSize: '500% 500%',
            backgroundPosition: `${bgX}% ${bgY}%`,
            backgroundRepeat: 'no-repeat',
            transform: flipX,
            transformOrigin: 'center center',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.6))',
          }}
        />
      </foreignObject>

      {/* Name Label */}
      {label && (
        <text
          x={x}
          y={posY - 6}
          textAnchor="middle"
          fontSize={Math.max(12, Math.min(16, size * 0.07))}
          fontWeight="bold"
          fill="#FFFFFF"
          fontFamily="var(--font-ui, sans-serif)"
          style={{
            letterSpacing: '0.4px',
            filter: 'drop-shadow(0px 1px 3px rgba(0,0,0,0.9))',
          }}
        >
          {label}
        </text>
      )}
    </g>
  )
}
