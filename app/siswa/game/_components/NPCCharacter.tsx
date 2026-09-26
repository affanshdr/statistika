'use client'

import React, { useState, useEffect } from 'react'

interface NPCCharacterProps {
  x: number
  y: number
  size?: number
  label?: string
  spriteUrl: string
  glowColor?: string
  flipX?: boolean
  cols?: number
  rows?: number
  pingPong?: boolean
  speedMs?: number
  onClick?: () => void
}

export default function NPCCharacter({
  x,
  y,
  size = 145,
  label = 'Pak Sutrisno',
  spriteUrl = '/Assets/Character/pak Sutrisno-iso_idle_right-trimmed.png',
  glowColor = '#38BDF8',
  flipX = false,
  cols = 5,
  rows = 4,
  pingPong = true,
  speedMs = 100,
  onClick
}: NPCCharacterProps) {
  const [seqIndex, setSeqIndex] = useState(0)
  const totalFrames = cols * rows
  const seqLength = pingPong ? Math.max(1, 2 * totalFrames - 2) : totalFrames

  useEffect(() => {
    const interval = setInterval(() => {
      setSeqIndex(prev => (prev + 1) % seqLength)
    }, speedMs)

    return () => clearInterval(interval)
  }, [seqLength, speedMs])

  const frame = pingPong
    ? (seqIndex < totalFrames ? seqIndex : Math.max(0, 2 * totalFrames - 2 - seqIndex))
    : seqIndex

  const col = frame % cols
  const row = Math.floor(frame / cols)

  // According to W3C CSS Spec: position% = index / (total - 1) * 100%
  const bgX = cols > 1 ? (col / (cols - 1)) * 100 : 0
  const bgY = rows > 1 ? (row / (rows - 1)) * 100 : 0
  const bgSizeX = cols * 100
  const bgSizeY = rows * 100

  const width = size
  const height = size
  const posX = x - width / 2
  const posY = y - height * 0.85

  return (
    <g style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
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
        rx={size * 0.16}
        ry={size * 0.065}
        fill={glowColor}
        opacity={0.35}
      />

      {/* Sprite HTML element embedded inside SVG */}
      <foreignObject
        x={posX}
        y={posY}
        width={width}
        height={height}
        style={{ overflow: 'visible', pointerEvents: 'none' }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url("${encodeURI(spriteUrl)}")`,
            backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
            backgroundPosition: `${bgX}% ${bgY}%`,
            backgroundRepeat: 'no-repeat',
            transform: flipX ? 'scaleX(-1)' : 'scaleX(1)',
            transformOrigin: 'center center',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0px 2px 5px rgba(0, 0, 0, 0.6))',
          }}
        />
      </foreignObject>

      {/* Name Tag Badge */}
      {label && (
        <g style={{ pointerEvents: 'none' }}>
          <rect
            x={x - 48}
            y={posY - 18}
            width={96}
            height={18}
            rx={9}
            fill="rgba(15, 23, 42, 0.9)"
            stroke={glowColor}
            strokeWidth={1.5}
          />
          <text
            x={x}
            y={posY - 5}
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
