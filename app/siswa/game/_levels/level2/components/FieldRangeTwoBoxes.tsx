'use client'

import React from 'react'
import { StudentThrowData, formatDistance } from '../data/level2StatData'

export const RANGE_MIN_BOX_POS = { x: 450, y: 215 }
export const RANGE_MAX_BOX_POS = { x: 926, y: 215 }

interface FieldRangeTwoBoxesProps {
  minBox: StudentThrowData | null
  maxBox: StudentThrowData | null
  playerPos: { x: number; y: number }
  carryingFlag: StudentThrowData | null
  onBoxClick?: (type: 'min' | 'max') => void
}

export default function FieldRangeTwoBoxes({
  minBox,
  maxBox,
  playerPos,
  carryingFlag,
  onBoxClick,
}: FieldRangeTwoBoxesProps) {
  const distToMin = Math.hypot(playerPos.x - RANGE_MIN_BOX_POS.x, playerPos.y - RANGE_MIN_BOX_POS.y)
  const distToMax = Math.hypot(playerPos.x - RANGE_MAX_BOX_POS.x, playerPos.y - RANGE_MAX_BOX_POS.y)

  const isNearMin = distToMin < 95
  const isNearMax = distToMax < 95

  return (
    <g id="range-two-boxes-group">
      {/* Platform background bar connecting both boxes */}
      <rect
        x={310}
        y={168}
        width={756}
        height={94}
        rx={16}
        fill="rgba(15, 23, 42, 0.88)"
        stroke="rgba(245, 158, 11, 0.55)"
        strokeWidth={1.5}
        filter="drop-shadow(0 8px 24px rgba(0,0,0,0.6))"
      />

      {/* Header title badge */}
      <g transform="translate(688, 156)">
        <rect
          x={-220}
          y={-14}
          width={440}
          height={28}
          rx={8}
          fill="rgba(15, 23, 42, 0.98)"
          stroke="#F59E0B"
          strokeWidth={1.5}
        />
        <text
          x={0}
          y={5}
          textAnchor="middle"
          fill="#FDE68A"
          fontSize={11}
          fontWeight="900"
          fontFamily="var(--font-ui)"
        >
          🎯 2 KOTAK MISI 1: NILAI TERKECIL (MIN) & NILAI TERBESAR (MAX)
        </text>
      </g>

      {/* ── 1. KOTAK NILAI TERKECIL (MIN) ── */}
      <g
        transform={`translate(${RANGE_MIN_BOX_POS.x}, ${RANGE_MIN_BOX_POS.y})`}
        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
        onClick={() => onBoxClick?.('min')}
      >
        {isNearMin && (
          <ellipse cx={0} cy={0} rx={120} ry={45} fill="#38BDF8" opacity={0.35} filter="blur(6px)" />
        )}

        <rect
          x={-110}
          y={-32}
          width={220}
          height={64}
          rx={10}
          fill={minBox ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.7)'}
          stroke={isNearMin ? '#F59E0B' : '#38BDF8'}
          strokeWidth={isNearMin ? 3 : 2}
          strokeDasharray={minBox ? 'none' : '4 3'}
          filter={isNearMin ? 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.7))' : 'none'}
        />

        {/* Tag Header */}
        <rect x={-104} y={-29} width={208} height={18} rx={5} fill="rgba(56, 189, 248, 0.25)" />
        <text
          x={0}
          y={-16}
          textAnchor="middle"
          fill="#38BDF8"
          fontSize={9.5}
          fontWeight="900"
          fontFamily="var(--font-ui)"
        >
          📦 KOTAK #1: NILAI TERKECIL (MIN)
        </text>

        {/* Box Value / Flag Content */}
        {minBox ? (
          <g>
            <text
              x={0}
              y={5}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize={11.5}
              fontWeight="900"
              fontFamily="var(--font-ui)"
            >
              🚩 {minBox.studentLabel}
            </text>
            <text
              x={0}
              y={20}
              textAnchor="middle"
              fill="#38BDF8"
              fontSize={12}
              fontWeight="900"
              fontFamily="var(--font-ui)"
            >
              Jarak: {formatDistance(minBox.distance)} m
            </text>
          </g>
        ) : (
          <g>
            <text
              x={0}
              y={3}
              textAnchor="middle"
              fill="#94A3B8"
              fontSize={10}
              fontWeight="700"
              fontFamily="var(--font-ui)"
            >
              {carryingFlag ? '⎵ Tekan [SPASI] Taruh' : 'Belum diisi'}
            </text>
            <text
              x={0}
              y={18}
              textAnchor="middle"
              fill="#64748B"
              fontSize={8.5}
              fontStyle="italic"
            >
              Bawa bendera terdekat ke sini
            </text>
          </g>
        )}

        {/* Tooltip prompt when player is nearby */}
        {isNearMin && (
          <g transform="translate(0, -45)">
            <rect
              x={-85}
              y={-10}
              width={170}
              height={20}
              rx={10}
              fill="#F59E0B"
              filter="drop-shadow(0 2px 6px rgba(0,0,0,0.6))"
            />
            <text x={0} y={4} textAnchor="middle" fill="#000000" fontSize={9} fontWeight="900">
              {carryingFlag
                ? '⎵ [SPASI] Taruh Bendera Min'
                : minBox
                ? '⎵ [SPASI] Ambil Kembali'
                : 'Dekati Kotak Min'}
            </text>
          </g>
        )}
      </g>

      {/* ── 2. KOTAK NILAI TERBESAR (MAX) ── */}
      <g
        transform={`translate(${RANGE_MAX_BOX_POS.x}, ${RANGE_MAX_BOX_POS.y})`}
        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
        onClick={() => onBoxClick?.('max')}
      >
        {isNearMax && (
          <ellipse cx={0} cy={0} rx={120} ry={45} fill="#EF4444" opacity={0.35} filter="blur(6px)" />
        )}

        <rect
          x={-110}
          y={-32}
          width={220}
          height={64}
          rx={10}
          fill={maxBox ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.7)'}
          stroke={isNearMax ? '#F59E0B' : '#EF4444'}
          strokeWidth={isNearMax ? 3 : 2}
          strokeDasharray={maxBox ? 'none' : '4 3'}
          filter={isNearMax ? 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.7))' : 'none'}
        />

        {/* Tag Header */}
        <rect x={-104} y={-29} width={208} height={18} rx={5} fill="rgba(239, 68, 68, 0.25)" />
        <text
          x={0}
          y={-16}
          textAnchor="middle"
          fill="#EF4444"
          fontSize={9.5}
          fontWeight="900"
          fontFamily="var(--font-ui)"
        >
          📦 KOTAK #2: NILAI TERBESAR (MAX)
        </text>

        {/* Box Value / Flag Content */}
        {maxBox ? (
          <g>
            <text
              x={0}
              y={5}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize={11.5}
              fontWeight="900"
              fontFamily="var(--font-ui)"
            >
              🚩 {maxBox.studentLabel}
            </text>
            <text
              x={0}
              y={20}
              textAnchor="middle"
              fill="#EF4444"
              fontSize={12}
              fontWeight="900"
              fontFamily="var(--font-ui)"
            >
              Jarak: {formatDistance(maxBox.distance)} m
            </text>
          </g>
        ) : (
          <g>
            <text
              x={0}
              y={3}
              textAnchor="middle"
              fill="#94A3B8"
              fontSize={10}
              fontWeight="700"
              fontFamily="var(--font-ui)"
            >
              {carryingFlag ? '⎵ Tekan [SPASI] Taruh' : 'Belum diisi'}
            </text>
            <text
              x={0}
              y={18}
              textAnchor="middle"
              fill="#64748B"
              fontSize={8.5}
              fontStyle="italic"
            >
              Bawa bendera terjauh ke sini
            </text>
          </g>
        )}

        {/* Tooltip prompt when player is nearby */}
        {isNearMax && (
          <g transform="translate(0, -45)">
            <rect
              x={-85}
              y={-10}
              width={170}
              height={20}
              rx={10}
              fill="#F59E0B"
              filter="drop-shadow(0 2px 6px rgba(0,0,0,0.6))"
            />
            <text x={0} y={4} textAnchor="middle" fill="#000000" fontSize={9} fontWeight="900">
              {carryingFlag
                ? '⎵ [SPASI] Taruh Bendera Max'
                : maxBox
                ? '⎵ [SPASI] Ambil Kembali'
                : 'Dekati Kotak Max'}
            </text>
          </g>
        )}
      </g>
    </g>
  )
}
