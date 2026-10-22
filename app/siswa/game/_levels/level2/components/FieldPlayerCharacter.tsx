'use client'

import React, { useState, useEffect, useRef } from 'react'
import { formatDistance } from '../data/level2StatData'

export type PlayerFacing = 'right' | 'left' | 'up' | 'down'

interface FieldPlayerCharacterProps {
  x: number
  y: number
  dir?: { x: number; y: number }
  size?: number
  label?: string
  glowColor?: string
  carriedFlag?: { studentLabel: string; distance: number; studentId: number } | null
  interactionPrompt?: string | null
  onClick?: () => void
}

export default function FieldPlayerCharacter({
  x,
  y,
  dir = { x: 0, y: 0 },
  size = 120,
  label = 'Stevunt',
  glowColor = '#00ADB5',
  carriedFlag = null,
  interactionPrompt = null,
  onClick,
}: FieldPlayerCharacterProps) {
  const [frame, setFrame] = useState(0)
  const lastFacingRef = useRef<PlayerFacing>('down')

  const isMoving = Math.abs(dir.x) > 0.05 || Math.abs(dir.y) > 0.05

  // Determine current facing direction based on movement vector (Level 1 algorithm)
  let facing: PlayerFacing = lastFacingRef.current
  if (Math.abs(dir.y) > Math.abs(dir.x) * 0.7) {
    if (dir.y < -0.2) facing = 'up'
    else if (dir.y > 0.2) facing = 'down'
  } else {
    if (dir.x < -0.1) facing = 'left'
    else if (dir.x > 0.1) facing = 'right'
  }
  lastFacingRef.current = facing

  // Cycle animation frames: 55ms only when moving. When stopped, instantly reset to idle frame 0
  useEffect(() => {
    if (!isMoving) {
      setFrame(0)
      return
    }
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % 25)
    }, 55)

    return () => clearInterval(interval)
  }, [isMoving])

  // Select sports uniform sprite sheet URL based on movement state and facing direction
  let spriteUrl = '/Assets/Building/field/walk_down_clean.png'
  if (facing === 'up') {
    spriteUrl = '/Assets/Building/field/walk_up_clean.png'
  } else if (facing === 'down') {
    spriteUrl = '/Assets/Building/field/walk_down_clean.png'
  } else {
    spriteUrl = '/Assets/Building/field/walk_right_clean.png'
  }

  // 5x5 sprite sheet coordinates: 25 frames (col * 25%, row * 25%)
  // When idle, keep crisp frame 0; when moving, cycle smoothly through all 25 frames
  const col = isMoving ? frame % 5 : 0
  const row = isMoving ? Math.floor(frame / 5) : 0
  const bgX = col * 25
  const bgY = row * 25

  const flipX = facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)'

  const width = size
  const height = size

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ cursor: onClick ? 'pointer' : 'default', pointerEvents: onClick ? 'auto' : 'none', willChange: 'transform' }}
      onClick={onClick}
    >
      {/* Ground drop-shadow & soft aura glow centered at local origin (0, 0) */}
      <ellipse
        cx={0}
        cy={0}
        rx={size * 0.24}
        ry={size * 0.09}
        fill="rgba(0, 0, 0, 0.45)"
        filter="blur(2px)"
      />
      <ellipse
        cx={0}
        cy={0}
        rx={size * 0.22}
        ry={size * 0.08}
        fill={glowColor}
        opacity={isMoving ? 0.45 : 0.25}
        style={{ transition: 'opacity 0.2s' }}
      />

      {/* Sprite HTML element embedded inside SVG with hardware transform */}
      <foreignObject
        x={-width / 2}
        y={-height * 0.85}
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundImage: `url("${spriteUrl}")`,
            backgroundSize: '500% 500%',
            backgroundPosition: `${bgX}% ${bgY}%`,
            backgroundRepeat: 'no-repeat',
            transform: flipX,
            transformOrigin: 'center center',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.6))',
          }}
        />
      </foreignObject>

      {/* Carried Flag icon over player head */}
      {carriedFlag && (
        <g transform={`translate(0, ${-height * 0.85 - 28})`}>
          <rect
            x={-60}
            y={-14}
            width={120}
            height={26}
            rx={13}
            fill="rgba(15, 23, 42, 0.94)"
            stroke="#EF4444"
            strokeWidth={2}
            filter="drop-shadow(0 0 10px rgba(239, 68, 68, 0.6))"
          />
          <text
            x={0}
            y={4}
            textAnchor="middle"
            fontSize={11}
            fontWeight="900"
            fill="#FCA5A5"
            fontFamily="var(--font-ui, sans-serif)"
          >
            🚩 {formatDistance(carriedFlag.distance)} m
          </text>
        </g>
      )}

      {/* Interaction Key Prompt (e.g. "[SPASI] Ambil Bendera" or "[SPASI] Masukkan ke Kotak") */}
      {interactionPrompt && (
        <g transform={`translate(0, ${-height * 0.85 - 32})`}>
          <rect
            x={-90}
            y={-14}
            width={180}
            height={26}
            rx={13}
            fill="rgba(15, 23, 42, 0.96)"
            stroke="#F59E0B"
            strokeWidth={2}
            filter="drop-shadow(0 0 12px rgba(245, 158, 11, 0.8))"
          />
          <text
            x={0}
            y={4}
            textAnchor="middle"
            fontSize={10.5}
            fontWeight="900"
            fill="#FDE68A"
            fontFamily="var(--font-ui, sans-serif)"
          >
            ⭐ {interactionPrompt}
          </text>
        </g>
      )}

      {/* Player Name Badge (Level 1 style) */}
      {!carriedFlag && !interactionPrompt && label && (
        <g transform={`translate(0, ${-height * 0.85 - 10})`}>
          <rect
            x={-44}
            y={-12}
            width={88}
            height={20}
            rx={10}
            fill="rgba(15, 23, 42, 0.85)"
            stroke="#00ADB5"
            strokeWidth={1.5}
          />
          <text
            x={0}
            y={2}
            textAnchor="middle"
            fontSize={10}
            fontWeight="900"
            fill="#FFFFFF"
            fontFamily="var(--font-ui, sans-serif)"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  )
}
