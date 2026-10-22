'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BallThrowBowAimProps {
  origin: { x: number; y: number }
  isActive: boolean
  targetDistanceHint?: number
  studentName?: string
  studentLabel?: string
  studentAvatar?: string
  studentGender?: 'male' | 'female'
  onLaunch: (throwParams: { angle: number; power: number; distance: number }) => void
  disabled?: boolean
}

// Convert distance in meters (10m to 100m) to field SVG Y coordinate (270px to 580px)
export function distanceToFieldY(meters: number): number {
  const clamped = Math.max(10, Math.min(100, meters))
  const t = (clamped - 10) / 90
  return 580 - Math.pow(t, 0.78) * (580 - 270)
}

// Convert field Y coordinate to distance in meters
export function fieldYToDistance(y: number): number {
  const clampedY = Math.max(270, Math.min(580, y))
  const normY = (580 - clampedY) / (580 - 270)
  const t = Math.pow(normY, 1 / 0.78)
  return 10 + t * 90
}

// Get court boundaries at Y coordinate for perspective on field
export function getCourtBoundsAtY(y: number): { xLeft: number; xRight: number; xCenter: number } {
  const normDepth = Math.max(0, Math.min(1, (625 - y) / (625 - 260)))
  const xLeft = 360 - normDepth * 80
  const xRight = 460 + normDepth * 760
  return { xLeft, xRight, xCenter: (xLeft + xRight) / 2 }
}

export default function BallThrowBowAim({
  origin,
  isActive,
  targetDistanceHint,
  studentName = 'Siswa',
  studentLabel = 'Siswa 01',
  studentAvatar,
  studentGender = 'male',
  onLaunch,
  disabled = false,
}: BallThrowBowAimProps) {
  // Pure drag tension state (No sliders, no landing prediction)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [power, setPower] = useState(0) // 0 to 100% based purely on drag pull distance
  const dragStartRef = useRef<{ clientX: number; clientY: number } | null>(null)

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
    const dy = e.clientY - dragStartRef.current.clientY

    // Pulling downwards/backwards charges tension power (Pure drag)
    const rawPullDist = Math.max(0, dy)
    const maxPull = 150
    const clampedPull = Math.min(maxPull, rawPullDist)
    const calculatedPower = Math.round((clampedPull / maxPull) * 100)
    setPower(calculatedPower)

    setDragOffset({ x: 0, y: clampedPull * 0.75 })
  }, [isDragging])

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    const finalPower = power
    setDragOffset({ x: 0, y: 0 })
    dragStartRef.current = null
    setPower(0)

    // Execute launch if tension power is sufficient (at least 15% pull)
    // Distance is pure integer (bilangan bulat)
    if (finalPower >= 15 && !disabled) {
      const integerDistance = Math.round(16 + (finalPower / 100) * 66)
      onLaunch({
        angle: 0,
        power: finalPower,
        distance: integerDistance,
      })
    }
  }, [isDragging, power, disabled, onLaunch])

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

  if (!isActive) return null

  // Slingshot / bow anchor points near student's hands
  const anchorLeft = { x: origin.x - 24, y: origin.y - 90 }
  const anchorRight = { x: origin.x + 24, y: origin.y - 90 }
  const pullBallPos = {
    x: origin.x,
    y: origin.y - 88 + dragOffset.y,
  }

  return (
    <g style={{ userSelect: 'none' }}>
      {/* ── 1. ARCHERY / SLINGSHOT ELASTIC BOWSTRINGS (PULL TENSION VISUAL) ── */}
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
            filter="drop-shadow(0 0 8px #00ADB5)"
          />
          <line
            x1={anchorRight.x}
            y1={anchorRight.y}
            x2={pullBallPos.x}
            y2={pullBallPos.y}
            stroke="#00ADB5"
            strokeWidth={4}
            strokeLinecap="round"
            filter="drop-shadow(0 0 8px #00ADB5)"
          />

          {/* Dynamic Tension Energy Aura around Ball */}
          <circle
            cx={pullBallPos.x}
            cy={pullBallPos.y}
            r={18 + (power / 100) * 14}
            fill="none"
            stroke={power > 70 ? '#EF4444' : power > 40 ? '#F59E0B' : '#38BDF8'}
            strokeWidth={2}
            strokeDasharray="4 3"
            opacity={0.85}
          />

          {/* Pulled ball indicator */}
          <circle
            cx={pullBallPos.x}
            cy={pullBallPos.y}
            r={13 + (power / 100) * 3}
            fill={power > 70 ? '#EF4444' : power > 40 ? '#F59E0B' : '#FBBF24'}
            stroke="#FFFFFF"
            strokeWidth={2.5}
            filter="drop-shadow(0 0 12px #F59E0B)"
          />

          {/* Dynamic Tension Percentage Label Following Ball */}
          <g transform={`translate(${pullBallPos.x}, ${pullBallPos.y + 36})`}>
            <rect
              x={-55}
              y={-14}
              width={110}
              height={24}
              rx={12}
              fill="rgba(15, 23, 42, 0.94)"
              stroke={power > 70 ? '#EF4444' : '#F59E0B'}
              strokeWidth={1.5}
              filter="drop-shadow(0 4px 10px rgba(0,0,0,0.6))"
            />
            <text
              x={0}
              y={3}
              textAnchor="middle"
              fill={power > 70 ? '#FCA5A5' : '#FDE047'}
              fontSize={11.5}
              fontWeight="900"
              fontFamily="var(--font-ui, sans-serif)"
            >
              ⚡ Tarikan: {power}%
            </text>
          </g>
        </g>
      )}

      {/* ── 2. INTERACTIVE DRAG-TO-PULL TOUCHPAD AREA (Around Student) ── */}
      <g
        onPointerDown={handlePointerDown}
        style={{ cursor: 'grab', pointerEvents: 'auto' }}
      >
        {/* Soft interactive touch aura */}
        <circle
          cx={origin.x}
          cy={origin.y - 70}
          r={90}
          fill={isDragging ? 'rgba(245, 158, 11, 0.08)' : 'rgba(0, 173, 181, 0.08)'}
          stroke={isDragging ? '#F59E0B' : '#00ADB5'}
          strokeWidth={2}
          strokeDasharray="6 6"
        />

        {/* Floating guidance banner above student */}
        <g transform={`translate(${origin.x}, ${origin.y - 128})`}>
          <rect
            x={studentAvatar ? -145 : -125}
            y={-16}
            width={studentAvatar ? 290 : 250}
            height={32}
            rx={16}
            fill="rgba(15, 23, 42, 0.95)"
            stroke={isDragging ? '#F59E0B' : studentGender === 'female' ? '#EC4899' : '#38BDF8'}
            strokeWidth={1.5}
            filter="drop-shadow(0 4px 14px rgba(0,0,0,0.7))"
          />

          {studentAvatar && (
            <g transform="translate(-126, 0)">
              <circle cx={0} cy={0} r={12} fill="#1E293B" stroke={studentGender === 'female' ? '#F472B6' : '#60A5FA'} strokeWidth={1} />
              <clipPath id="throw-aim-student-avatar-clip">
                <circle cx={0} cy={0} r={11} />
              </clipPath>
              <image
                href={studentAvatar}
                x={-11}
                y={-11}
                width={22}
                height={22}
                clipPath="url(#throw-aim-student-avatar-clip)"
                style={{ imageRendering: 'pixelated' }}
              />
            </g>
          )}

          <text
            x={studentAvatar ? 12 : 0}
            y={5}
            textAnchor="middle"
            fill={isDragging ? '#FCD34D' : studentGender === 'female' ? '#F472B6' : '#38BDF8'}
            fontSize={12}
            fontWeight="900"
            fontFamily="var(--font-ui, sans-serif)"
          >
            {isDragging ? '⚡ Lepaskan untuk Melempar!' : `🏹 Tarik ${studentLabel} ke Bawah!`}
          </text>
        </g>
      </g>
    </g>
  )
}
