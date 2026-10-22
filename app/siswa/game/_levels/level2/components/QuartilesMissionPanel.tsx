'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ComputedStats, formatDistance, validateAnswer } from '../data/level2StatData'

interface QuartilesMissionPanelProps {
  stats: ComputedStats
  q1Post: number | null
  q2Post: number | null
  q3Post: number | null
  currentPositionLabel: string
  canPlaceHere: boolean
  onPlacePostAtCurrentPos: (quartile: 'Q1' | 'Q2' | 'Q3') => void
  onComplete: () => void
  onMistake: () => void
  playSound: (type: 'chime' | 'error' | 'pop') => void
}

export default function QuartilesMissionPanel({
  stats,
  q1Post,
  q2Post,
  q3Post,
  currentPositionLabel,
  canPlaceHere,
  onPlacePostAtCurrentPos,
  onComplete,
  onMistake,
  playSound,
}: QuartilesMissionPanelProps) {
  const [activeTab, setActiveTab] = useState<'POSTS' | 'VALUES'>(() => {
    return q1Post !== null && q2Post !== null && q3Post !== null ? 'VALUES' : 'POSTS'
  })

  const [q1Input, setQ1Input] = useState('')
  const [q2Input, setQ2Input] = useState('')
  const [q3Input, setQ3Input] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const allPostsPlaced = q1Post !== null && q2Post !== null && q3Post !== null
  const placedCount = (q1Post !== null ? 1 : 0) + (q2Post !== null ? 1 : 0) + (q3Post !== null ? 1 : 0)

  const handleVerifyValues = () => {
    const q1Valid =
      validateAnswer(q1Input, stats.q1, 0.75) ||
      validateAnswer(q1Input, Math.round(stats.q1), 0.75)
    const q2Valid =
      validateAnswer(q2Input, stats.q2, 0.75) ||
      validateAnswer(q2Input, Math.round(stats.q2), 0.75)
    const q3Valid =
      validateAnswer(q3Input, stats.q3, 0.75) ||
      validateAnswer(q3Input, Math.round(stats.q3), 0.75)

    if (q1Valid && q2Valid && q3Valid) {
      playSound('chime')
      setErrorMsg('')
      onComplete()
    } else {
      playSound('error')
      onMistake()
      setErrorMsg(
        `Nilai belum tepat. Periksa kembali: Q1 urutan ke-3 (${formatDistance(stats.q1)}m), Q2 rata-rata urutan ke-5 & 6 (${stats.q2}m), dan Q3 urutan ke-8 (${formatDistance(stats.q3)}m).`
      )
    }
  }

  return (
    <>
      {/* ── BOTTOM HUD BANNER (DOCKING DI BAWAH BENDERA SEPERTI SORTING HUD) ── */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(92%, 800px)',
          zIndex: 135,
          background: 'rgba(15, 23, 42, 0.96)',
          backdropFilter: 'blur(16px)',
          borderRadius: '18px',
          border: '2px solid #8B5CF6',
          padding: '12px 18px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 25px rgba(139, 92, 246, 0.35)',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Top Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>📊</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#C084FC' }}>
                  Misi 2: Kuartil (Q1, Q2, Q3)
                </h3>
                {allPostsPlaced && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => setActiveTab('POSTS')}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        background: activeTab === 'POSTS' ? '#8B5CF6' : 'rgba(255,255,255,0.08)',
                        color: '#FFF',
                        fontSize: '9.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      1. Tiang ✓
                    </button>
                    <button
                      onClick={() => setActiveTab('VALUES')}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        background: activeTab === 'VALUES' ? '#8B5CF6' : 'rgba(255,255,255,0.08)',
                        color: '#FFF',
                        fontSize: '9.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      2. Nilai Kuartil
                    </button>
                  </div>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#CBD5E1' }}>
                {activeTab === 'POSTS'
                  ? 'Kuartil membagi 10 data menjadi 4 bagian. Dekati bendera di atas lalu tentukan letak tiang Q1, Q2, atau Q3.'
                  : 'Bagus! Seluruh tiang terpasang. Sekarang masukkan nilai jarak lemparan untuk masing-masing kuartil.'}
              </p>
            </div>
          </div>

          {/* Progress Pill */}
          <div
            style={{
              background: placedCount === 3 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(139, 92, 246, 0.15)',
              border: `1.5px solid ${placedCount === 3 ? '#10B981' : '#8B5CF6'}`,
              borderRadius: '12px',
              padding: '4px 12px',
              fontSize: '11.5px',
              fontWeight: 900,
              color: placedCount === 3 ? '#34D399' : '#C084FC',
              whiteSpace: 'nowrap',
            }}
          >
            {activeTab === 'POSTS'
              ? `${placedCount} / 3 Tiang Terpasang`
              : 'Langkah 2: Nilai Kuartil'}
          </div>
        </div>

        {/* Action Controls Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '8px',
            gap: '12px',
          }}
        >
          {activeTab === 'POSTS' ? (
            <>
              {/* Stevunt's Live Detected Position */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                <span style={{ color: '#94A3B8', fontSize: '11px', whiteSpace: 'nowrap' }}>Status:</span>
                <div
                  style={{
                    padding: '3px 10px',
                    borderRadius: '8px',
                    background: canPlaceHere ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                    border: `1.5px solid ${canPlaceHere ? '#10B981' : 'rgba(255, 255, 255, 0.12)'}`,
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <span style={{ color: '#94A3B8' }}>📍 Posisi Stevunt: </span>
                  <strong style={{ color: canPlaceHere ? '#6EE7B7' : '#FCD34D' }}>
                    {currentPositionLabel}
                  </strong>
                </div>
              </div>

              {/* Three Quartile Action Buttons */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {/* Q1 Button */}
                <button
                  onClick={() => onPlacePostAtCurrentPos('Q1')}
                  disabled={q1Post !== null || !canPlaceHere}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: `1.5px solid ${q1Post ? '#10B981' : canPlaceHere ? '#34D399' : '#334155'}`,
                    background: q1Post ? 'rgba(16, 185, 129, 0.25)' : canPlaceHere ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: '#FFF',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: q1Post !== null || !canPlaceHere ? 'not-allowed' : 'pointer',
                    opacity: q1Post !== null ? 0.9 : canPlaceHere ? 1 : 0.45,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>🟢 Q1 (Bawah)</span>
                  <span>{q1Post !== null ? '✓' : canPlaceHere ? '➔' : ''}</span>
                </button>

                {/* Q2 Button */}
                <button
                  onClick={() => onPlacePostAtCurrentPos('Q2')}
                  disabled={q2Post !== null || !canPlaceHere}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: `1.5px solid ${q2Post ? '#8B5CF6' : canPlaceHere ? '#A78BFA' : '#334155'}`,
                    background: q2Post ? 'rgba(139, 92, 246, 0.25)' : canPlaceHere ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: '#FFF',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: q2Post !== null || !canPlaceHere ? 'not-allowed' : 'pointer',
                    opacity: q2Post !== null ? 0.9 : canPlaceHere ? 1 : 0.45,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>🟣 Q2 (Median)</span>
                  <span>{q2Post !== null ? '✓' : canPlaceHere ? '➔' : ''}</span>
                </button>

                {/* Q3 Button */}
                <button
                  onClick={() => onPlacePostAtCurrentPos('Q3')}
                  disabled={q3Post !== null || !canPlaceHere}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: `1.5px solid ${q3Post ? '#EC4899' : canPlaceHere ? '#F472B6' : '#334155'}`,
                    background: q3Post ? 'rgba(236, 72, 153, 0.25)' : canPlaceHere ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: '#FFF',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: q3Post !== null || !canPlaceHere ? 'not-allowed' : 'pointer',
                    opacity: q3Post !== null ? 0.9 : canPlaceHere ? 1 : 0.45,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>🔴 Q3 (Atas)</span>
                  <span>{q3Post !== null ? '✓' : canPlaceHere ? '➔' : ''}</span>
                </button>

                {/* Next Step Button when all placed */}
                {allPostsPlaced && (
                  <motion.button
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveTab('VALUES')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      border: 'none',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    🎯 ISI NILAI KUARTIL ▶
                  </motion.button>
                )}
              </div>
            </>
          ) : (
            /* Values Input Phase Row */
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#34D399', fontWeight: 900 }}>Q1:</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Nilai Q1..."
                    value={q1Input}
                    onChange={e => {
                      setQ1Input(e.target.value)
                      setErrorMsg('')
                    }}
                    style={{
                      width: '75px',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1.5px solid #10B981',
                      background: '#0F172A',
                      color: '#FFF',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#C084FC', fontWeight: 900 }}>Q2:</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Nilai Q2..."
                    value={q2Input}
                    onChange={e => {
                      setQ2Input(e.target.value)
                      setErrorMsg('')
                    }}
                    style={{
                      width: '75px',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1.5px solid #8B5CF6',
                      background: '#0F172A',
                      color: '#FFF',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#F472B6', fontWeight: 900 }}>Q3:</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Nilai Q3..."
                    value={q3Input}
                    onChange={e => {
                      setQ3Input(e.target.value)
                      setErrorMsg('')
                    }}
                    style={{
                      width: '75px',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1.5px solid #EC4899',
                      background: '#0F172A',
                      color: '#FFF',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      outline: 'none',
                    }}
                  />
                </div>

                {errorMsg && (
                  <span style={{ fontSize: '10px', color: '#EF4444', fontWeight: 800, marginLeft: '4px' }}>
                    ⚠️ {errorMsg}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setActiveTab('POSTS')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#CBD5E1',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ◀ Tiang
                </button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleVerifyValues}
                  disabled={!q1Input || !q2Input || !q3Input}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: q1Input && q2Input && q3Input ? 'linear-gradient(135deg, #10B981, #059669)' : '#475569',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '11.5px',
                    cursor: q1Input && q2Input && q3Input ? 'pointer' : 'not-allowed',
                    boxShadow: q1Input && q2Input && q3Input ? '0 4px 15px rgba(16, 185, 129, 0.4)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  🏁 SELESAIKAN MISI 2 ▶
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
