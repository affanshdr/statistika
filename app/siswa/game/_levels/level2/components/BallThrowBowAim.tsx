'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BallThrowBowAimProps {
  origin: { x: number; y: number }
  isActive: boolean
  targetDistanceHint?: number
  studentName?: string
  studentLabel?: string
  onLaunch: (throwParams: { angle: number; power: number; distance: number }) => void
  disabled?: boolean
}

// Convert distance in meters (10m to 100m) to field SVG Y coordinate (225px to 630px)
export function distanceToFieldY(meters: number): number {
  const clamped = Math.max(10, Math.min(100, meters))
  const t = (clamped - 10) / 90
  return 630 - Math.pow(t, 0.72) * (630 - 225)
}

// Convert field Y coordinate to distance in meters
export function fieldYToDistance(y: number): number {
  const clampedY = Math.max(225, Math.min(630, y))
  const normY = (630 - clampedY) / (630 - 225)
  const t = Math.pow(normY, 1 / 0.72)
  return 10 + t * 90
}

// Get court boundaries at Y coordinate for perspective
export function getCourtBoundsAtY(y: number): { xLeft: number; xRight: number; xCenter: number } {
  const normDepth = (630 - y) / (630 - 225)
  const xLeft = 110 + normDepth * 490
  const xRight = 2060 - normDepth * 480
  return { xLeft, xRight, xCenter: (xLeft + xRight) / 2 }
}

export default function BallThrowBowAim({
  origin,
  isActive,
  targetDistanceHint,
  studentName = 'Siswa',
  studentLabel = 'Siswa 01',
  onLaunch,
  disabled = false,
}: BallThrowBowAimProps) {
  // Drag state for pulling back like bow / slingshot
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 }) // vector pulled BACKWARDS from origin
  const [power, setPower] = useState(60) // 0 to 100
  const [angleDeg, setAngleDeg] = useState(0) // -35 to +35 degrees
  const dragStartRef = useRef<{ clientX: number; clientY: number } | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Calculate projected landing coordinates from power and angle
  // Power 0-100 maps to distance ~12m to ~85m
  const estimatedDistance = Math.round((12 + (power / 100) * 72) * 10) / 10
  const projectedTargetY = distanceToFieldY(estimatedDistance)
  const bounds = getCourtBoundsAtY(projectedTargetY)
  // Angle deflects X along court lane
  const maxLateralOffset = (bounds.xRight - bounds.xLeft) * 0.38
  const projectedTargetX = bounds.xCenter + (angleDeg / 35) * maxLateralOffset

  // Calculate trajectory arc points (14 sample points)
  const trajectoryPoints: { x: number; y: number; baseY: number; t: number }[] = []
  const steps = 14
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const curX = origin.x + (projectedTargetX - origin.x) * t
    const baseY = origin.y + (projectedTargetY - origin.y) * t
    const arcHeight = Math.sin(t * Math.PI) * (70 + (power / 100) * 60)
    const curY = baseY - arcHeight
    trajectoryPoints.push({ x: curX, y: curY, baseY, t })
  }

  // Pointer drag event handlers on the SVG overlay
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || !isActive) return
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    dragStartRef.current = { clientX: e.clientX, clientY: e.clientY }
  }

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return
    const dx = e.clientX - dragStartRef.current.clientX
    const dy = e.clientY - dragStartRef.current.clientY

    // Pulling down/backwards charges power
    // Clamp pull distance to max 180px
    const rawPullDist = Math.max(0, dy) + Math.abs(dx) * 0.3
    const maxPull = 160
    const clampedPull = Math.min(maxPull, rawPullDist)
    const calculatedPower = Math.round((clampedPull / maxPull) * 100)
    setPower(Math.max(15, calculatedPower))

    // Horizontal deflection calculates angle (-35 to +35 deg)
    const rawAngle = (dx / 120) * 35
    const clampedAngle = Math.max(-35, Math.min(35, rawAngle))
    setAngleDeg(Math.round(clampedAngle))

    setDragOffset({ x: -dx * 0.6, y: -dy * 0.6 })
  }, [isDragging])

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
    dragStartRef.current = null

    // Execute launch if power is sufficient
    if (power >= 20 && !disabled) {
      onLaunch({
        angle: angleDeg,
        power,
        distance: estimatedDistance,
      })
    }
  }, [isDragging, power, disabled, angleDeg, estimatedDistance, onLaunch])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('pointercancel', handlePointerUp)
      return () => {
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
        window.removeEventListener('pointercancel', handlePointerUp)
      }
    }
  }, [isDragging, handlePointerMove, handlePointerUp])

  // Direct throw button trigger
  const handleDirectThrow = () => {
    if (disabled) return
    onLaunch({
      angle: angleDeg,
      power,
      distance: estimatedDistance,
    })
  }

  if (!isActive) return null

  // Slingshot / bow anchor points near student's hands
  const anchorLeft = { x: origin.x - 30, y: origin.y - 120 }
  const anchorRight = { x: origin.x + 30, y: origin.y - 120 }
  const pullBallPos = {
    x: origin.x + dragOffset.x,
    y: origin.y - 120 + dragOffset.y + (isDragging ? (power / 100) * 30 : 0),
  }

  return (
    <g style={{ userSelect: 'none' }}>
      {/* ── 1. ARCHERY / SLINGSHOT ELASTIC BOWSTRINGS ── */}
      {isDragging && (
        <g>
          {/* Glowing elastic bands */}
          <line
            x1={anchorLeft.x}
            y1={anchorLeft.y}
            x2={pullBallPos.x}
            y2={pullBallPos.y}
            stroke="#00ADB5"
            strokeWidth={4}
            strokeLinecap="round"
            filter="drop-shadow(0 0 6px #00ADB5)"
          />
          <line
            x1={anchorRight.x}
            y1={anchorRight.y}
            x2={pullBallPos.x}
            y2={pullBallPos.y}
            stroke="#00ADB5"
            strokeWidth={4}
            strokeLinecap="round"
            filter="drop-shadow(0 0 6px #00ADB5)"
          />
          {/* Pulled ball indicator */}
          <circle
            cx={pullBallPos.x}
            cy={pullBallPos.y}
            r={14}
            fill="#FBBF24"
            stroke="#FFFFFF"
            strokeWidth={2.5}
            filter="drop-shadow(0 0 10px #F59E0B)"
          />
        </g>
      )}

      {/* ── 2. TRAJECTORY ARC (Dotted Parabola) ── */}
      <g>
        {trajectoryPoints.map((pt, i) => {
          if (i === 0) return null
          const prev = trajectoryPoints[i - 1]
          const opacity = 0.3 + (pt.t * 0.6)
          return (
            <g key={`traj-${i}`}>
              <line
                x1={prev.x}
                y1={prev.y}
                x2={pt.x}
                y2={pt.y}
                stroke={i % 2 === 0 ? '#38BDF8' : '#FBBF24'}
                strokeWidth={3.5 - pt.t * 1.5}
                strokeDasharray="6 4"
                strokeLinecap="round"
                opacity={opacity}
                filter="drop-shadow(0 0 4px rgba(56, 189, 248, 0.6))"
              />
              {/* Shadow arc on the ground */}
              <circle
                cx={pt.x}
                cy={pt.baseY}
                r={2 + (1 - pt.t) * 2}
                fill="rgba(0, 0, 0, 0.25)"
              />
            </g>
          )
        })}
      </g>

      {/* ── 3. PROJECTED LANDING TARGET RETICLE ── */}
      <g transform={`translate(${projectedTargetX}, ${projectedTargetY})`}>
        {/* Pulsing ground rings */}
        <ellipse cx={0} cy={0} rx={42} ry={16} fill="none" stroke="#F59E0B" strokeWidth={2.5} strokeDasharray="8 6" opacity={0.8} />
        <ellipse cx={0} cy={0} rx={22} ry={8} fill="rgba(245, 158, 11, 0.25)" stroke="#FBBF24" strokeWidth={2} />
        <circle cx={0} cy={0} r={4} fill="#EF4444" />

        {/* Crosshair indicator */}
        <line x1={-18} y1={0} x2={18} y2={0} stroke="#FBBF24" strokeWidth={1.5} />
        <line x1={0} y1={-8} x2={0} y2={8} stroke="#FBBF24" strokeWidth={1.5} />

        {/* Estimated Distance Badge on Ground */}
        <rect
          x={-60}
          y={-38}
          width={120}
          height={26}
          rx={13}
          fill="#FDF8EC"
          stroke="#8C6239"
          strokeWidth={1.5}
          style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))' }}
        />
        <text
          x={0}
          y={-21}
          textAnchor="middle"
          fill="#362014"
          fontSize={12}
          fontWeight="900"
          fontFamily="var(--font-ui, sans-serif)"
        >
          🎯 ~{estimatedDistance.toFixed(1)} m
        </text>
      </g>

      {/* ── 4. INTERACTIVE DRAG-TO-AIM TOUCHPAD AREA (Around student) ── */}
      <g
        onPointerDown={handlePointerDown}
        style={{ cursor: 'grab', pointerEvents: 'auto' }}
      >
        <circle
          cx={origin.x}
          cy={origin.y - 60}
          r={90}
          fill="rgba(0, 173, 181, 0.08)"
          stroke="#00ADB5"
          strokeWidth={2}
          strokeDasharray="6 6"
        />
        <text
          x={origin.x}
          y={origin.y + 35}
          textAnchor="middle"
          fill="#38BDF8"
          fontSize={12}
          fontWeight="900"
          fontFamily="var(--font-ui, sans-serif)"
          filter="drop-shadow(0 1px 3px rgba(0,0,0,0.8))"
        >
          {isDragging ? '⚡ Lepaskan untuk Lempar!' : '🏹 Tarik & Tahan untuk Membidik'}
        </text>
      </g>

      {/* ── 5. HUD CONTROL PANEL (ABOVE STUDENT IN FIELD) ── */}
      <foreignObject
        x={Math.max(40, origin.x - 170)}
        y={Math.max(20, origin.y - 250)}
        width={340}
        height={150}
        style={{ overflow: 'visible', pointerEvents: 'auto' }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
          borderRadius: '18px',
          border: '2.5px solid #8C6239',
          padding: '14px 18px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45), inset 0 0 20px rgba(180, 140, 80, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          color: '#362014',
          position: 'relative',
          fontFamily: 'var(--font-ui, sans-serif)',
        }}>
          {/* Viewfinder Corner Brackets */}
          <div style={{ position: 'absolute', top: '6px', left: '6px', width: '10px', height: '10px', borderTop: '2px solid #8C6239', borderLeft: '2px solid #8C6239', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '6px', right: '6px', width: '10px', height: '10px', borderTop: '2px solid #8C6239', borderRight: '2px solid #8C6239', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '6px', left: '6px', width: '10px', height: '10px', borderBottom: '2px solid #8C6239', borderLeft: '2px solid #8C6239', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '10px', height: '10px', borderBottom: '2px solid #8C6239', borderRight: '2px solid #8C6239', pointerEvents: 'none' }} />

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#9A3412', letterSpacing: '0.5px' }}>
              🎯 {studentLabel} ({studentName})
            </span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#362014', fontFamily: 'monospace' }}>
              {estimatedDistance.toFixed(1)} m
            </span>
          </div>

          {/* Power Bar / Tension Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#6B4226', width: '48px' }}>Kekuatan</span>
            <input
              type="range"
              min={15}
              max={100}
              value={power}
              onChange={e => setPower(Number(e.target.value))}
              disabled={disabled}
              style={{
                flex: 1,
                accentColor: '#D97706',
                cursor: 'pointer',
                height: '6px',
              }}
            />
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#B45309', width: '32px', textAlign: 'right' }}>
              {power}%
            </span>
          </div>

          {/* Angle / Direction Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#6B4226', width: '48px' }}>Sudut</span>
            <input
              type="range"
              min={-35}
              max={35}
              value={angleDeg}
              onChange={e => setAngleDeg(Number(e.target.value))}
              disabled={disabled}
              style={{
                flex: 1,
                accentColor: '#0E8388',
                cursor: 'pointer',
                height: '6px',
              }}
            />
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#0369A1', width: '32px', textAlign: 'right' }}>
              {angleDeg > 0 ? `+${angleDeg}°` : `${angleDeg}°`}
            </span>
          </div>

          {/* Launch Throw Button */}
          <button
            onClick={handleDirectThrow}
            disabled={disabled}
            style={{
              marginTop: '4px',
              padding: '8px 14px',
              background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '10px',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '13px',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(14, 131, 136, 0.4)',
              transition: 'transform 0.1s',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <span>🏹</span> LEMPAR BOLA SEKARANG ▶
          </button>
        </div>
      </foreignObject>
    </g>
  )
}
