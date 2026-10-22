'use client'

import React, { useState, useEffect } from 'react'

export type LeaderAction = 'idle' | 'run' | 'gather' | 'cheer' | 'salute'

interface FieldClassLeaderProps {
  x: number
  y: number
  action?: LeaderAction
  size?: number
  label?: string
  carryingCount?: number
  carriedFlag?: { studentLabel: string; distance: number; studentId: number } | null
  facing?: 'left' | 'right'
  showGlow?: boolean
  onClick?: () => void
}

export default function FieldClassLeader({
  x,
  y,
  action = 'idle',
  size = 145,
  label = 'Aditya (Ketua Kelas)',
  carryingCount = 0,
  carriedFlag = null,
  facing = 'right',
  showGlow = true,
  onClick,
}: FieldClassLeaderProps) {
  const [frame, setFrame] = useState(0)

  // Running / walking animation loop
  useEffect(() => {
    if (action !== 'run' && action !== 'gather') {
      setFrame(0)
      return
    }
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % 25)
    }, 40)
    return () => clearInterval(interval)
  }, [action])

  // Calculate 5x5 sprite sheet position
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
        rx={size * 0.24}
        ry={size * 0.09}
        fill="rgba(0, 0, 0, 0.5)"
        filter="blur(2px)"
      />

      {/* Gold Leader Aura Glow */}
      {showGlow && (
        <ellipse
          cx={x}
          cy={y}
          rx={size * 0.28}
          ry={size * 0.11}
          fill="#F59E0B"
          opacity={0.4}
        />
      )}

      {/* Leader Character Sprite */}
      <foreignObject
        x={posX}
        y={posY}
        width={size}
        height={size}
        style={{ overflow: 'visible', willChange: 'transform' }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundImage: 'url("/Assets/Building/field/walk_down_clean.png")',
            backgroundSize: '500% 500%',
            backgroundPosition: `${bgX}% ${bgY}%`,
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated',
            filter: showGlow
              ? 'drop-shadow(0px 0px 10px rgba(245, 158, 11, 0.8))'
              : 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.5))',
            transition: 'filter 0.2s',
            transform: facing === 'left' ? 'scaleX(-1)' : 'none',
          }}
        >
          {/* Captain Armband Badge Icon Overlay */}
          <div
            style={{
              position: 'absolute',
              top: '42%',
              left: '26%',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              border: '1.5px solid #FFFFFF',
              boxShadow: '0 0 8px #F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              fontWeight: 900,
              color: '#FFFFFF',
            }}
          >
            C
          </div>

          {/* Carrying Bundle of Flags Indicator */}
          {carryingCount > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '20%',
                right: '18%',
                background: '#EF4444',
                color: '#FFFFFF',
                borderRadius: '12px',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: 900,
                border: '1.5px solid #FFFFFF',
                boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                animation: 'bounce 0.8s infinite alternate',
              }}
            >
              🚩 x{carryingCount}
            </div>
          )}
        </div>
      </foreignObject>

      {/* Leader Title & Name Badge */}
      <g transform={`translate(${x}, ${posY - 12})`}>
        <rect
          x={-68}
          y={-14}
          width={136}
          height={24}
          rx={12}
          fill="rgba(15, 23, 42, 0.95)"
          stroke="#F59E0B"
          strokeWidth={2}
          filter="drop-shadow(0 4px 10px rgba(0, 0, 0, 0.7))"
        />
        <text
          x={0}
          y={3}
          textAnchor="middle"
          fontSize={10.5}
          fontWeight="900"
          fill="#FDE68A"
          fontFamily="var(--font-ui, sans-serif)"
        >
          ⭐ {label}
        </text>
      </g>
    </g>
  )
}
