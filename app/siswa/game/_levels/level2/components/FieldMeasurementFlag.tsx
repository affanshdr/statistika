'use client'

import React from 'react'

interface FieldMeasurementFlagProps {
  x: number
  y: number
  studentId: number
  studentLabel: string
  distance: number
  isMin?: boolean
  isMax?: boolean
  isQ1?: boolean
  isQ2?: boolean
  isQ3?: boolean
  isSelected?: boolean
  isClickable?: boolean
  onClick?: () => void
}

export default function FieldMeasurementFlag({
  x,
  y,
  studentId,
  studentLabel,
  distance,
  isMin = false,
  isMax = false,
  isQ1 = false,
  isQ2 = false,
  isQ3 = false,
  isSelected = false,
  isClickable = false,
  onClick,
}: FieldMeasurementFlagProps) {
  // Flag color determination
  let flagColor = '#FBBF24' // default gold
  let badgeLabel = ''

  if (isMin) {
    flagColor = '#38BDF8' // cyan min
    badgeLabel = 'MIN'
  } else if (isMax) {
    flagColor = '#EF4444' // red max
    badgeLabel = 'MAX'
  } else if (isQ1) {
    flagColor = '#10B981' // green Q1
    badgeLabel = 'Q1'
  } else if (isQ2) {
    flagColor = '#8B5CF6' // purple Q2
    badgeLabel = 'Q2'
  } else if (isQ3) {
    flagColor = '#EC4899' // pink Q3
    badgeLabel = 'Q3'
  }

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{
        cursor: isClickable ? 'pointer' : 'default',
        pointerEvents: isClickable ? 'auto' : 'none',
      }}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Ground shadow */}
      <ellipse cx={0} cy={2} rx={16} ry={6} fill="rgba(0, 0, 0, 0.45)" filter="blur(1px)" />

      {/* Selected highlight ring */}
      {isSelected && (
        <ellipse
          cx={0}
          cy={2}
          rx={26}
          ry={10}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={3}
          strokeDasharray="6 4"
        />
      )}

      {/* Flagpole */}
      <line x1={0} y1={2} x2={0} y2={-52} stroke="#CBD5E1" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={0} cy={-53} r={3.5} fill="#FBBF24" />

      {/* Pennant Flag */}
      <polygon
        points={`0,-51 28,-40 0,-29`}
        fill={flagColor}
        stroke="#FFFFFF"
        strokeWidth={1}
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
      />

      {/* Distance Label Card */}
      <g transform="translate(0, -68)">
        <rect
          x={-42}
          y={-14}
          width={84}
          height={22}
          rx={6}
          fill="#FDF8EC"
          stroke={isSelected ? '#B45309' : '#8C6239'}
          strokeWidth={isSelected ? 2 : 1.5}
          style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))' }}
        />
        <text
          x={0}
          y={1}
          textAnchor="middle"
          fill="#362014"
          fontSize={10.5}
          fontWeight="900"
          fontFamily="var(--font-ui, sans-serif)"
        >
          {badgeLabel ? `${badgeLabel}: ` : ''}{distance.toFixed(1)}m
        </text>
      </g>
    </g>
  )
}
