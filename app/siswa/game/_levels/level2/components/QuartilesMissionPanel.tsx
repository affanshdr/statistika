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
      {/* ── BOTTOM HUD BANNER (DOCKING DI BAWAH BENDERA - UKURAN PAS & RAPI) ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(8px, 1.8vh, 16px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(94%, 880px)',
          zIndex: 135,
          background: 'rgba(11, 18, 33, 0.97)',
          backdropFilter: 'blur(20px)',
          borderRadius: '18px',
          border: '2px solid #A855F7',
          padding: 'clamp(8px, 1.4vh, 12px) clamp(12px, 1.8vw, 18px)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.9), 0 0 25px rgba(168, 85, 247, 0.35)',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(6px, 1vh, 9px)',
        }}
      >
        {/* Top Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', lineHeight: 1 }}>📊</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 'clamp(13.5px, 1.6vw, 16.5px)',
                    fontWeight: 900,
                    color: '#F3E8FF',
                    letterSpacing: '0.3px',
                    textShadow: '0 2px 6px rgba(168, 85, 247, 0.5)',
                  }}
                >
                  Misi 2: Kuartil (Q1, Q2, Q3)
                </h3>
                {allPostsPlaced && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => setActiveTab('POSTS')}
                      style={{
                        padding: '3px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeTab === 'POSTS' ? '#A855F7' : 'rgba(255,255,255,0.12)',
                        color: '#FFF',
                        fontSize: 'clamp(10.5px, 1.15vw, 12px)',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      1. Tiang ✓
                    </button>
                    <button
                      onClick={() => setActiveTab('VALUES')}
                      style={{
                        padding: '3px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeTab === 'VALUES' ? '#A855F7' : 'rgba(255,255,255,0.12)',
                        color: '#FFF',
                        fontSize: 'clamp(10.5px, 1.15vw, 12px)',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      2. Nilai Kuartil
                    </button>
                  </div>
                )}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 'clamp(10.5px, 1.15vw, 12.5px)', color: '#E2E8F0', lineHeight: 1.4, fontWeight: 500 }}>
                {activeTab === 'POSTS'
                  ? 'Kuartil membagi 10 data menjadi 4 bagian. Dekati bendera di atas lalu tentukan tiang Q1, Q2, atau Q3.'
                  : 'Bagus! Seluruh tiang terpasang. Sekarang masukkan nilai jarak lemparan masing-masing kuartil.'}
              </p>
            </div>
          </div>

          {/* Progress Pill */}
          <div
            style={{
              background: placedCount === 3 ? 'rgba(16, 185, 129, 0.28)' : 'rgba(168, 85, 247, 0.22)',
              border: `1.5px solid ${placedCount === 3 ? '#10B981' : '#A855F7'}`,
              borderRadius: '12px',
              padding: 'clamp(4px, 0.8vh, 6px) clamp(10px, 1.4vw, 14px)',
              fontSize: 'clamp(11.5px, 1.25vw, 13px)',
              fontWeight: 900,
              color: placedCount === 3 ? '#34D399' : '#F3E8FF',
              whiteSpace: 'nowrap',
              boxShadow: placedCount === 3 ? '0 0 12px rgba(16, 185, 129, 0.35)' : '0 0 10px rgba(168, 85, 247, 0.25)',
            }}
          >
            {activeTab === 'POSTS'
              ? `${placedCount} / 3 Tiang`
              : 'Isi Nilai Kuartil'}
          </div>
        </div>

        {/* Action Controls Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            borderTop: '1px solid rgba(255,255,255,0.14)',
            paddingTop: '8px',
            gap: '8px',
          }}
        >
          {activeTab === 'POSTS' ? (
            <>
              {/* Stevunt Live Detected Position */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
                <span style={{ color: '#CBD5E1', fontSize: 'clamp(11.5px, 1.2vw, 13px)', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Status:
                </span>
                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: '10px',
                    background: canPlaceHere ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255, 255, 255, 0.08)',
                    border: `1.5px solid ${canPlaceHere ? '#10B981' : 'rgba(255, 255, 255, 0.18)'}`,
                    fontSize: 'clamp(11.5px, 1.2vw, 13px)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    boxShadow: canPlaceHere ? '0 0 12px rgba(16, 185, 129, 0.35)' : 'none',
                  }}
                >
                  <span style={{ color: '#E2E8F0', fontWeight: 600 }}>📍 Posisi Stevunt: </span>
                  <strong style={{ color: canPlaceHere ? '#6EE7B7' : '#FDE047', fontWeight: 900 }}>
                    {currentPositionLabel}
                  </strong>
                </div>
              </div>

              {/* Three Quartile Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Q1 Button */}
                <button
                  onClick={() => onPlacePostAtCurrentPos('Q1')}
                  disabled={q1Post !== null || !canPlaceHere}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: 'clamp(6px, 1vh, 8px) clamp(10px, 1.3vw, 14px)',
                    borderRadius: '10px',
                    border: `1.5px solid ${
                      q1Post !== null
                        ? '#10B981'
                        : canPlaceHere
                        ? '#34D399'
                        : 'rgba(52, 211, 153, 0.45)'
                    }`,
                    background:
                      q1Post !== null
                        ? 'rgba(16, 185, 129, 0.3)'
                        : canPlaceHere
                        ? 'rgba(16, 185, 129, 0.25)'
                        : 'rgba(16, 185, 129, 0.12)',
                    color: q1Post !== null ? '#A7F3D0' : canPlaceHere ? '#FFFFFF' : '#D1FAE5',
                    fontSize: 'clamp(11.5px, 1.2vw, 13px)',
                    fontWeight: 900,
                    cursor: q1Post !== null || !canPlaceHere ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: canPlaceHere && q1Post === null ? '0 0 14px rgba(52, 211, 153, 0.55)' : 'none',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <span style={{ fontSize: '13px' }}>🟢</span>
                  <span>Q1 (Bawah)</span>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#34D399' }}>
                    {q1Post !== null ? ' ✓' : canPlaceHere ? ' ➔' : ''}
                  </span>
                </button>

                {/* Q2 Button */}
                <button
                  onClick={() => onPlacePostAtCurrentPos('Q2')}
                  disabled={q2Post !== null || !canPlaceHere}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: 'clamp(6px, 1vh, 8px) clamp(10px, 1.3vw, 14px)',
                    borderRadius: '10px',
                    border: `1.5px solid ${
                      q2Post !== null
                        ? '#8B5CF6'
                        : canPlaceHere
                        ? '#C084FC'
                        : 'rgba(168, 85, 247, 0.45)'
                    }`,
                    background:
                      q2Post !== null
                        ? 'rgba(139, 92, 246, 0.3)'
                        : canPlaceHere
                        ? 'rgba(139, 92, 246, 0.25)'
                        : 'rgba(139, 92, 246, 0.12)',
                    color: q2Post !== null ? '#DDD6FE' : canPlaceHere ? '#FFFFFF' : '#EDE9FE',
                    fontSize: 'clamp(11.5px, 1.2vw, 13px)',
                    fontWeight: 900,
                    cursor: q2Post !== null || !canPlaceHere ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: canPlaceHere && q2Post === null ? '0 0 14px rgba(192, 132, 252, 0.55)' : 'none',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <span style={{ fontSize: '13px' }}>🟣</span>
                  <span>Q2 (Median)</span>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#C084FC' }}>
                    {q2Post !== null ? ' ✓' : canPlaceHere ? ' ➔' : ''}
                  </span>
                </button>

                {/* Q3 Button */}
                <button
                  onClick={() => onPlacePostAtCurrentPos('Q3')}
                  disabled={q3Post !== null || !canPlaceHere}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: 'clamp(6px, 1vh, 8px) clamp(10px, 1.3vw, 14px)',
                    borderRadius: '10px',
                    border: `1.5px solid ${
                      q3Post !== null
                        ? '#EC4899'
                        : canPlaceHere
                        ? '#F472B6'
                        : 'rgba(236, 72, 153, 0.45)'
                    }`,
                    background:
                      q3Post !== null
                        ? 'rgba(236, 72, 153, 0.3)'
                        : canPlaceHere
                        ? 'rgba(236, 72, 153, 0.25)'
                        : 'rgba(236, 72, 153, 0.12)',
                    color: q3Post !== null ? '#FBCFE8' : canPlaceHere ? '#FFFFFF' : '#FCE7F3',
                    fontSize: 'clamp(11.5px, 1.2vw, 13px)',
                    fontWeight: 900,
                    cursor: q3Post !== null || !canPlaceHere ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: canPlaceHere && q3Post === null ? '0 0 14px rgba(244, 114, 182, 0.55)' : 'none',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <span style={{ fontSize: '13px' }}>🔴</span>
                  <span>Q3 (Atas)</span>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#F472B6' }}>
                    {q3Post !== null ? ' ✓' : canPlaceHere ? ' ➔' : ''}
                  </span>
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
                      padding: 'clamp(6px, 1vh, 8px) clamp(12px, 1.5vw, 16px)',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      border: 'none',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      fontSize: 'clamp(11.5px, 1.2vw, 13px)',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.45)',
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: 'clamp(12px, 1.3vw, 13.5px)', color: '#34D399', fontWeight: 900 }}>Q1:</span>
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
                      width: '80px',
                      padding: '5px 8px',
                      borderRadius: '8px',
                      border: '1.5px solid #10B981',
                      background: '#0F172A',
                      color: '#FFF',
                      fontSize: 'clamp(11.5px, 1.2vw, 13px)',
                      fontWeight: 800,
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: 'clamp(12px, 1.3vw, 13.5px)', color: '#C084FC', fontWeight: 900 }}>Q2:</span>
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
                      width: '80px',
                      padding: '5px 8px',
                      borderRadius: '8px',
                      border: '1.5px solid #8B5CF6',
                      background: '#0F172A',
                      color: '#FFF',
                      fontSize: 'clamp(11.5px, 1.2vw, 13px)',
                      fontWeight: 800,
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: 'clamp(12px, 1.3vw, 13.5px)', color: '#F472B6', fontWeight: 900 }}>Q3:</span>
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
                      width: '80px',
                      padding: '5px 8px',
                      borderRadius: '8px',
                      border: '1.5px solid #EC4899',
                      background: '#0F172A',
                      color: '#FFF',
                      fontSize: 'clamp(11.5px, 1.2vw, 13px)',
                      fontWeight: 800,
                      outline: 'none',
                    }}
                  />
                </div>

                {errorMsg && (
                  <span style={{ fontSize: 'clamp(10.5px, 1.1vw, 12px)', color: '#EF4444', fontWeight: 800, marginLeft: '4px' }}>
                    ⚠️ {errorMsg}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActiveTab('POSTS')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1.5px solid rgba(255,255,255,0.22)',
                    color: '#E2E8F0',
                    fontSize: 'clamp(11px, 1.2vw, 12.5px)',
                    fontWeight: 800,
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
                    padding: '7px 16px',
                    borderRadius: '10px',
                    background: q1Input && q2Input && q3Input ? 'linear-gradient(135deg, #10B981, #059669)' : '#475569',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: 'clamp(11.5px, 1.2vw, 13px)',
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
