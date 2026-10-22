'use client'

import React from 'react'
import type { StudentThrowData, ComputedStats } from '../data/level2StatData'
import { formatDistance } from '../data/level2StatData'

export const SORTED_FLAGS_Y = 300
export const SORTED_FLAGS_X_START = 238
export const SORTED_FLAGS_X_STEP = 100

export const Q1_TARGET_X = SORTED_FLAGS_X_START + 2 * SORTED_FLAGS_X_STEP // 438 (Data ke-3)
export const Q2_TARGET_X = (SORTED_FLAGS_X_START + 4 * SORTED_FLAGS_X_STEP + SORTED_FLAGS_X_START + 5 * SORTED_FLAGS_X_STEP) / 2 // 688 (Tepat di tengah lapangan)
export const Q3_TARGET_X = SORTED_FLAGS_X_START + 7 * SORTED_FLAGS_X_STEP // 938 (Data ke-8)

interface FieldSortedFlagsRowProps {
  students: StudentThrowData[]
  stats: ComputedStats
  playerPos: { x: number; y: number }
  q1Post: number | null
  q2Post: number | null
  q3Post: number | null
  selectedPosition?: number | null
  onFlagClick?: (index: number) => void
  onMidpointClick?: () => void
}

export default function FieldSortedFlagsRow({
  students,
  stats,
  playerPos,
  q1Post,
  q2Post,
  q3Post,
  selectedPosition,
  onFlagClick,
  onMidpointClick,
}: FieldSortedFlagsRowProps) {
  // Find which flag or slot Stevunt is closest to
  let nearestFlagIdx: number | null = null
  let minDistance = 65

  students.forEach((_, idx) => {
    const fx = SORTED_FLAGS_X_START + idx * SORTED_FLAGS_X_STEP
    const d = Math.hypot(playerPos.x - fx, playerPos.y - SORTED_FLAGS_Y)
    if (d < minDistance) {
      minDistance = d
      nearestFlagIdx = idx
    }
  })

  // Check if near median midpoint (between #5 and #6)
  const isNearMedianGap = Math.hypot(playerPos.x - Q2_TARGET_X, playerPos.y - SORTED_FLAGS_Y) < 55

  return (
    <g id="field-sorted-flags-row">
      <defs>
        <linearGradient id="sortedTrackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0.8" />
        </linearGradient>
        <filter id="sortedPostGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Runway Background Ribbon */}
      <rect
        x={SORTED_FLAGS_X_START - 40}
        y={SORTED_FLAGS_Y - 14}
        width={9 * SORTED_FLAGS_X_STEP + 80}
        height={28}
        rx={14}
        fill="rgba(15, 23, 42, 0.85)"
        stroke="url(#sortedTrackGrad)"
        strokeWidth={2}
      />

      {/* Baseline Dashed Track */}
      <line
        x1={SORTED_FLAGS_X_START - 25}
        y1={SORTED_FLAGS_Y}
        x2={SORTED_FLAGS_X_START + 9 * SORTED_FLAGS_X_STEP + 25}
        y2={SORTED_FLAGS_Y}
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeDasharray="6 4"
        strokeOpacity={0.5}
      />

      {/* Runway Header Title - Placed distinctly higher above the flags */}
      {q2Post === null && (
        <g transform={`translate(${SORTED_FLAGS_X_START + 4.5 * SORTED_FLAGS_X_STEP}, ${SORTED_FLAGS_Y - 170})`}>
          <rect
            x={-175}
            y={-16}
            width={350}
            height={32}
            rx={16}
            fill="rgba(15, 23, 42, 0.96)"
            stroke="#F59E0B"
            strokeWidth={2}
            filter="drop-shadow(0 6px 16px rgba(0,0,0,0.7))"
          />
          <text
            x={0}
            y={5.5}
            textAnchor="middle"
            fill="#FDE68A"
            fontSize={12}
            fontWeight="900"
            fontFamily="var(--font-ui)"
            letterSpacing="0.8px"
          >
            🏁 10 DATA LEMPARAN TERURUT (1 s/d 10)
          </text>
        </g>
      )}

      {/* Median Divider Line (Only appears after Q2 is placed to keep mystery) */}
      {q2Post !== null && (
        <g id="median-divider-line">
          <line
            x1={Q2_TARGET_X}
            y1={SORTED_FLAGS_Y - 80}
            x2={Q2_TARGET_X}
            y2={SORTED_FLAGS_Y + 70}
            stroke="#8B5CF6"
            strokeWidth={2.5}
            strokeDasharray="6 4"
          />
          <text
            x={Q2_TARGET_X - 16}
            y={SORTED_FLAGS_Y + 65}
            textAnchor="end"
            fill="#C084FC"
            fontSize={10}
            fontWeight="800"
            fontFamily="var(--font-ui)"
          >
            ◀ 5 Data Pertama
          </text>
          <text
            x={Q2_TARGET_X + 16}
            y={SORTED_FLAGS_Y + 65}
            textAnchor="start"
            fill="#C084FC"
            fontSize={10}
            fontWeight="800"
            fontFamily="var(--font-ui)"
          >
            5 Data Terakhir ▶
          </text>
        </g>
      )}

      {/* Interactive Midpoint Gap between #5 and #6 (Clickable to walk Stevunt there) */}
      <g
        transform={`translate(${Q2_TARGET_X}, ${SORTED_FLAGS_Y})`}
        style={{ cursor: 'pointer' }}
        onClick={onMidpointClick}
      >
        {/* Subtle ground target if Stevunt is near */}
        {isNearMedianGap && q2Post === null && (
          <ellipse
            cx={0}
            cy={0}
            rx={28}
            ry={12}
            fill="rgba(139, 92, 246, 0.3)"
            stroke="#A855F7"
            strokeWidth={2}
            strokeDasharray="4 3"
          />
        )}
      </g>

      {/* ── 10 SORTED MEASUREMENT FLAGS (UNIFORM STYLING, NO ANSWER SPOILERS) ── */}
      {students.map((student, idx) => {
        const flagX = SORTED_FLAGS_X_START + idx * SORTED_FLAGS_X_STEP
        const isMin = idx === 0
        const isMax = idx === students.length - 1
        const isSelectedByStevunt = nearestFlagIdx === idx

        // Uniform styling: all regular flags have neutral amber/gold until quartile posts are placed!
        let flagColor = '#FBBF24'
        if (idx === 2 && q1Post !== null) flagColor = '#10B981'
        else if (idx === 7 && q3Post !== null) flagColor = '#EC4899'

        return (
          <g
            key={`sorted-flag-${student.studentId}-${idx}`}
            transform={`translate(${flagX}, ${SORTED_FLAGS_Y})`}
            style={{ cursor: 'pointer' }}
            onClick={() => onFlagClick?.(idx)}
          >
            {/* Ground Shadow */}
            <ellipse cx={0} cy={3} rx={18} ry={6} fill="rgba(0, 0, 0, 0.4)" filter="blur(1px)" />

            {/* Stevunt Active Selection Aura */}
            {isSelectedByStevunt && (
              <ellipse
                cx={0}
                cy={2}
                rx={24}
                ry={10}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={2.5}
                strokeDasharray="4 3"
              />
            )}

            {/* Flagpole */}
            <line x1={0} y1={2} x2={0} y2={-50} stroke="#E2E8F0" strokeWidth={2.5} strokeLinecap="round" />
            <circle cx={0} cy={-51} r={3} fill="#FDE047" />

            {/* Pennant Flag */}
            <polygon
              points="0,-49 26,-39 0,-29"
              fill={flagColor}
              stroke="#FFFFFF"
              strokeWidth={1}
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.45))"
            />

            {/* Distance Card Above Flag */}
            <g transform="translate(0, -66)">
              <rect
                x={-24}
                y={-10}
                width={48}
                height={20}
                rx={6}
                fill="rgba(15, 23, 42, 0.95)"
                stroke={isSelectedByStevunt ? '#F59E0B' : flagColor}
                strokeWidth={isSelectedByStevunt ? 2 : 1.5}
                filter="drop-shadow(0 2px 5px rgba(0,0,0,0.5))"
              />
              <text
                x={0}
                y={3.5}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize={11}
                fontWeight="900"
                fontFamily="var(--font-mono)"
              >
                {Math.round(student.distance)}m
              </text>
            </g>

            {/* Rank Badge Below Flag (#1 .. #10) */}
            <g transform="translate(0, 18)">
              <rect
                x={-16}
                y={-7}
                width={32}
                height={15}
                rx={5}
                fill={isSelectedByStevunt ? '#B45309' : 'rgba(30, 41, 59, 0.9)'}
                stroke={isSelectedByStevunt ? '#F59E0B' : flagColor}
                strokeWidth={1}
              />
              <text
                x={0}
                y={4}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize={9}
                fontWeight="900"
                fontFamily="var(--font-mono)"
              >
                #{idx + 1}
              </text>
            </g>

          </g>
        )
      })}

      {/* ── PLACED TALL TIANG KUARTIL (ONLY VISIBLE ONCE SUCCESSFULLY DETERMINED) ── */}
      {/* Tall Tiang Q1 */}
      {q1Post !== null && (
        <g transform={`translate(${Q1_TARGET_X}, ${SORTED_FLAGS_Y})`} filter="url(#sortedPostGlow)">
          <ellipse cx={0} cy={4} rx={24} ry={8} fill="rgba(16, 185, 129, 0.5)" />
          <ellipse cx={0} cy={2} rx={16} ry={5} fill="#064E3B" stroke="#10B981" strokeWidth={1.5} />

          <line x1={0} y1={2} x2={0} y2={-135} stroke="#10B981" strokeWidth={4} strokeLinecap="round" />
          <circle cx={0} cy={-137} r={6} fill="#FBBF24" stroke="#FFFFFF" strokeWidth={1.5} />

          <polygon points="0,-134 46,-116 0,-98" fill="#10B981" stroke="#A7F3D0" strokeWidth={1.5} />
          <text x={14} y={-112} fill="#FFFFFF" fontSize={11} fontWeight="900" fontFamily="var(--font-ui)">
            Q1
          </text>

          <g transform="translate(0, -152)">
            <rect
              x={-72}
              y={-14}
              width={144}
              height={28}
              rx={14}
              fill="rgba(6, 78, 59, 0.98)"
              stroke="#34D399"
              strokeWidth={2}
              filter="drop-shadow(0 4px 10px rgba(0,0,0,0.6))"
            />
            <text x={0} y={4} textAnchor="middle" fill="#FFFFFF" fontSize={12} fontWeight="900" fontFamily="var(--font-ui)">
              🏆 Q1 = {formatDistance(stats.q1)}m
            </text>
          </g>
          <g transform="translate(0, -82)">
            <rect x={-52} y={-8} width={104} height={16} rx={5} fill="rgba(15, 23, 42, 0.9)" stroke="#10B981" strokeWidth={1} />
            <text x={0} y={3.5} textAnchor="middle" fill="#6EE7B7" fontSize={8.5} fontWeight="800">
              Urutan ke-3 (Kuartil Bawah)
            </text>
          </g>
        </g>
      )}

      {/* Tall Tiang Q2 (Median) */}
      {q2Post !== null && (
        <g transform={`translate(${Q2_TARGET_X}, ${SORTED_FLAGS_Y})`} filter="url(#sortedPostGlow)">
          <ellipse cx={0} cy={4} rx={26} ry={9} fill="rgba(139, 92, 246, 0.5)" />
          <ellipse cx={0} cy={2} rx={18} ry={6} fill="#4C1D95" stroke="#8B5CF6" strokeWidth={1.5} />

          <line x1={0} y1={2} x2={0} y2={-150} stroke="#8B5CF6" strokeWidth={4.5} strokeLinecap="round" />
          <circle cx={0} cy={-152} r={7} fill="#F59E0B" stroke="#FFFFFF" strokeWidth={1.5} />
          <polygon points="-5,-155 0,-162 5,-155" fill="#FDE68A" />

          <polygon points="0,-148 50,-128 0,-108" fill="#8B5CF6" stroke="#DDD6FE" strokeWidth={1.5} />
          <text x={16} y={-124} fill="#FFFFFF" fontSize={12} fontWeight="900" fontFamily="var(--font-ui)">
            Q2
          </text>

          <g transform="translate(0, -170)">
            <rect
              x={-85}
              y={-15}
              width={170}
              height={30}
              rx={15}
              fill="rgba(76, 29, 149, 0.98)"
              stroke="#A78BFA"
              strokeWidth={2}
              filter="drop-shadow(0 4px 12px rgba(0,0,0,0.65))"
            />
            <text x={0} y={4.5} textAnchor="middle" fill="#FFFFFF" fontSize={13} fontWeight="900" fontFamily="var(--font-ui)">
              👑 Q2 = {stats.q2}m (Median)
            </text>
          </g>
          <g transform="translate(0, -92)">
            <rect x={-64} y={-8} width={128} height={16} rx={5} fill="rgba(15, 23, 42, 0.9)" stroke="#8B5CF6" strokeWidth={1} />
            <text x={0} y={3.5} textAnchor="middle" fill="#DDD6FE" fontSize={8.5} fontWeight="800">
              Nilai Tengah (Antara ke-5 & 6)
            </text>
          </g>
        </g>
      )}

      {/* Tall Tiang Q3 */}
      {q3Post !== null && (
        <g transform={`translate(${Q3_TARGET_X}, ${SORTED_FLAGS_Y})`} filter="url(#sortedPostGlow)">
          <ellipse cx={0} cy={4} rx={24} ry={8} fill="rgba(236, 72, 153, 0.5)" />
          <ellipse cx={0} cy={2} rx={16} ry={5} fill="#831843" stroke="#EC4899" strokeWidth={1.5} />

          <line x1={0} y1={2} x2={0} y2={-135} stroke="#EC4899" strokeWidth={4} strokeLinecap="round" />
          <circle cx={0} cy={-137} r={6} fill="#FBBF24" stroke="#FFFFFF" strokeWidth={1.5} />

          <polygon points="0,-134 46,-116 0,-98" fill="#EC4899" stroke="#FBCFE8" strokeWidth={1.5} />
          <text x={14} y={-112} fill="#FFFFFF" fontSize={11} fontWeight="900" fontFamily="var(--font-ui)">
            Q3
          </text>

          <g transform="translate(0, -152)">
            <rect
              x={-72}
              y={-14}
              width={144}
              height={28}
              rx={14}
              fill="rgba(131, 24, 67, 0.98)"
              stroke="#F472B6"
              strokeWidth={2}
              filter="drop-shadow(0 4px 10px rgba(0,0,0,0.6))"
            />
            <text x={0} y={4} textAnchor="middle" fill="#FFFFFF" fontSize={12} fontWeight="900" fontFamily="var(--font-ui)">
              🏆 Q3 = {formatDistance(stats.q3)}m
            </text>
          </g>
          <g transform="translate(0, -82)">
            <rect x={-50} y={-8} width={100} height={16} rx={5} fill="rgba(15, 23, 42, 0.9)" stroke="#EC4899" strokeWidth={1} />
            <text x={0} y={3.5} textAnchor="middle" fill="#FBCFE8" fontSize={8.5} fontWeight="800">
              Urutan ke-8 (Kuartil Atas)
            </text>
          </g>
        </g>
      )}
    </g>
  )
}
