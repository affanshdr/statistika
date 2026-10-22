'use client'

import React from 'react'

export type TeacherPose = 'idle' | 'whistle' | 'point' | 'cheer'

interface FieldTeacherProps {
  x: number
  y: number
  size?: number
  pose?: TeacherPose
  label?: string
  showGlow?: boolean
  onClick?: () => void
  facing?: 'left' | 'right'
}

export default function FieldTeacher({
  x,
  y,
  size = 190,
  pose = 'idle',
  label = 'Pak Bambang',
  showGlow = false,
  onClick,
  facing = 'left',
}: FieldTeacherProps) {
  // 5x5 sprite sheet
  let frame = 0
  if (pose === 'whistle') frame = 5
  else if (pose === 'point') frame = 6
  else if (pose === 'cheer') frame = 11
  else frame = 0 // idle clipboard

  const col = frame % 5
  const row = Math.floor(frame / 5)
  const bgX = (col / 4) * 100
  const bgY = (row / 4) * 100

  const posX = x - size / 2
  const posY = y - size * 0.9

  return (
    <g
      style={{ cursor: onClick ? 'pointer' : 'default', pointerEvents: onClick ? 'auto' : 'none' }}
      onClick={onClick}
    >
      {/* Ground drop shadow */}
      <ellipse
        cx={x}
        cy={y}
        rx={size * 0.22}
        ry={size * 0.08}
        fill="rgba(0, 0, 0, 0.45)"
        filter="blur(2px)"
      />

      {/* Teacher Aura Glow */}
      {showGlow && (
        <ellipse
          cx={x}
          cy={y}
          rx={size * 0.26}
          ry={size * 0.1}
          fill="#F59E0B"
          opacity={0.35}
        />
      )}

      {/* Teacher Sprite */}
      <foreignObject
        x={posX}
        y={posY}
        width={size}
        height={size}
        style={{ overflow: 'visible', willChange: 'transform' }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'url("/Assets/Building/field/GuruOlahraga.png")',
            backgroundSize: '500% 500%',
            backgroundPosition: `${bgX}% ${bgY}%`,
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated',
            filter: showGlow
              ? 'drop-shadow(0px 0px 10px rgba(245, 158, 11, 0.75))'
              : 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.5))',
            transform: facing === 'left' ? 'scaleX(-1)' : 'none',
            transition: 'filter 0.2s',
          }}
        />
      </foreignObject>

      {/* Teacher Name Label */}
      <text
        x={x}
        y={posY - 10}
        textAnchor="middle"
        fontSize={Math.max(13, size * 0.08)}
        fontWeight="900"
        fill="#FCD34D"
        stroke="rgba(0, 0, 0, 0.85)"
        strokeWidth={3}
        paintOrder="stroke fill"
        fontFamily="var(--font-ui, sans-serif)"
        letterSpacing="0.5px"
      >
        {label}
      </text>
    </g>
  )
}
