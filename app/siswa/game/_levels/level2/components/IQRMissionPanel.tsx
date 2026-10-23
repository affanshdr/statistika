'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ComputedStats, formatDistance, validateAnswer } from '../data/level2StatData'

interface IQRMissionPanelProps {
  stats: ComputedStats
  greenRibbonPlaced: boolean
  onPlaceGreenRibbon: () => void
  onComplete: () => void
  onMistake: () => void
  playSound: (type: 'chime' | 'error' | 'pop') => void
}

export default function IQRMissionPanel({
  stats,
  greenRibbonPlaced,
  onPlaceGreenRibbon,
  onComplete,
  onMistake,
  playSound,
}: IQRMissionPanelProps) {
  const [iqrInput, setIqrInput] = useState('')
  const [iqrError, setIqrError] = useState('')
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isWrong, setIsWrong] = useState(false)
  const [quizError, setQuizError] = useState('')
  const [stage, setStage] = useState<'RIBBON' | 'CALCULATE' | 'QUIZ'>(() => {
    return greenRibbonPlaced ? 'CALCULATE' : 'RIBBON'
  })

  const quizOptions = [
    {
      text: 'Rentang sebaran jarak dari 50% data lemparan siswa di bagian tengah, tidak rentan terpengaruh nilai ekstrem.',
      correct: true,
      explanation: 'Tepat sekali! IQR fokus pada 50% data di tengah sehingga kebal terhadap nilai pencilan (outliers).',
    },
    {
      text: 'Selisih mutlak antara lemparan terpendek dan lemparan terjauh seluruh kelas.',
      correct: false,
      explanation: 'Itu adalah definisi Jangkauan biasa (Range), bukan Jangkauan Kuartil.',
    },
    {
      text: 'Nilai rata-rata jarak lemparan yang diperoleh seluruh 10 siswa.',
      correct: false,
      explanation: 'Itu adalah Mean (Rata-rata), bukan Jangkauan Kuartil.',
    },
  ]

  const displayedQ1 = Math.round(stats.q1)
  const displayedQ3 = Math.round(stats.q3)
  const expectedDisplayedIQR = displayedQ3 - displayedQ1
  const expectedRawIQR = stats.iqr

  const handleCalculateIQR = () => {
    const isCorrectAns =
      validateAnswer(iqrInput, expectedDisplayedIQR, 0.75) ||
      validateAnswer(iqrInput, expectedRawIQR, 0.75)

    if (isCorrectAns) {
      playSound('chime')
      setIqrError('')
      setStage('QUIZ')
    } else {
      playSound('error')
      onMistake()
      setIqrError(
        `Jawaban belum tepat. Rumus IQR = Q3 (${displayedQ3}m) − Q1 (${displayedQ1}m) = ${expectedDisplayedIQR}m`
      )
    }
  }

  const handleAnswerQuiz = (idx: number) => {
    setSelectedQuizIndex(idx)
    if (quizOptions[idx].correct) {
      playSound('chime')
      setIsCorrect(true)
      setIsWrong(false)
      setQuizError('')
      setTimeout(() => {
        onComplete()
      }, 1600)
    } else {
      playSound('error')
      onMistake()
      setIsWrong(true)
      setIsCorrect(false)
      setQuizError(quizOptions[idx].explanation)
      setTimeout(() => {
        setIsWrong(false)
      }, 800)
    }
  }

  return (
    <>
      {/* ── 1. BOTTOM HUD DOCK (STAGE 1: RIBBON & STAGE 2: CALCULATE) ── */}
      {stage !== 'QUIZ' && (
        <div
          style={{
            position: 'absolute',
            bottom: 'clamp(10px, 2.2vh, 22px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(94%, 880px)',
            zIndex: 135,
            background: 'rgba(11, 18, 33, 0.97)',
            backdropFilter: 'blur(20px)',
            borderRadius: '18px',
            border: '2px solid #EF4444',
            padding: 'clamp(8px, 1.4vh, 12px) clamp(12px, 1.8vw, 18px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.92), 0 0 35px rgba(239, 68, 68, 0.45)',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(6px, 1vh, 9px)',
          }}
        >
          {/* Top Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', lineHeight: 1 }}>🎗️</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: 'clamp(13.5px, 1.6vw, 16.5px)', fontWeight: 900, color: '#F87171', letterSpacing: '0.4px', textShadow: '0 2px 8px rgba(239, 68, 68, 0.6)' }}>
                    Misi 3: Jangkauan Kuartil (IQR)
                  </h3>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 'clamp(10.5px, 1.15vw, 12.5px)', color: '#E2E8F0', lineHeight: 1.5 }}>
                  {stage === 'RIBBON'
                    ? 'Bentangkan pita merah di bawah barisan bendera dari tiang Q1 ke Q3 untuk menyorot rentang 50% data di tengah.'
                    : 'Pita merah telah terbentang di bawah bendera! Hitung selisih antara Kuartil Atas (Q3) dan Kuartil Bawah (Q1).'}
                </p>
              </div>
            </div>

            {/* Progress Step Pill */}
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.25)',
                border: '2px solid #EF4444',
                borderRadius: '16px',
                padding: 'clamp(6px, 1vh, 10px) clamp(14px, 1.8vw, 22px)',
                fontSize: 'clamp(13px, 1.5vw, 16px)',
                fontWeight: 900,
                color: '#FCA5A5',
                whiteSpace: 'nowrap',
                boxShadow: '0 0 16px rgba(239, 68, 68, 0.35)',
              }}
            >
              {stage === 'RIBBON' ? 'Langkah 1: Bentangkan Pita' : 'Langkah 2: Hitung IQR'}
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
            {stage === 'RIBBON' ? (
              <>
                {/* Target Poles Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <div
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      fontSize: '11px',
                      color: '#E2E8F0',
                    }}
                  >
                    📍 Tiang Q1: <b style={{ color: '#34D399' }}>{displayedQ1} m</b>
                  </div>
                  <span style={{ color: '#EF4444', fontWeight: 900 }}>➔</span>
                  <div
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      fontSize: '11px',
                      color: '#E2E8F0',
                    }}
                  >
                    📍 Tiang Q3: <b style={{ color: '#F472B6' }}>{displayedQ3} m</b>
                  </div>
                </div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onPlaceGreenRibbon()
                    playSound('chime')
                    setStage('CALCULATE')
                  }}
                  style={{
                    padding: '7px 18px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.5)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  🎗️ BENTANGKAN PITA MERAH IQR ▶
                </motion.button>
              </>
            ) : (
              <>
                {/* Formula & Values Tag */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.14)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      fontSize: '11px',
                      color: '#FECDD3',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    📐 Rumus: <b>IQR = Q3 ({displayedQ3}m) − Q1 ({displayedQ1}m)</b>
                  </div>

                  {iqrError && (
                    <span style={{ fontSize: '10.5px', color: '#EF4444', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {iqrError}
                    </span>
                  )}
                </div>

                {/* Input & Verify */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Nilai IQR..."
                    value={iqrInput}
                    onChange={e => {
                      setIqrInput(e.target.value)
                      setIqrError('')
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleCalculateIQR()
                    }}
                    style={{
                      width: '100px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1.5px solid #EF4444',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 800,
                      outline: 'none',
                      textAlign: 'center',
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCalculateIQR}
                    disabled={!iqrInput.trim()}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: iqrInput.trim() ? 'linear-gradient(135deg, #EF4444, #DC2626)' : '#475569',
                      border: 'none',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      fontSize: '11.5px',
                      cursor: iqrInput.trim() ? 'pointer' : 'not-allowed',
                      boxShadow: iqrInput.trim() ? '0 4px 15px rgba(239, 68, 68, 0.4)' : 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Cek Hasil ▶
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── 2. ENTRANCE-QUIZ STYLE MODAL (STAGE 3: PEMAHAMAN KONSEP IQR) ── */}
      <AnimatePresence>
        {stage === 'QUIZ' && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 900,
              background: 'rgba(8, 16, 26, 0.88)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            {/* CSS Shake Animation for Wrong Answer */}
            <style>{`
              @keyframes astu-card-shake {
                0%, 100% { transform: translate3d(0, 0, 0); }
                15% { transform: translate3d(-10px, 0, 0); }
                30% { transform: translate3d(10px, 0, 0); }
                45% { transform: translate3d(-8px, 0, 0); }
                60% { transform: translate3d(8px, 0, 0); }
                75% { transform: translate3d(-4px, 0, 0); }
                90% { transform: translate3d(4px, 0, 0); }
              }
              .astu-card-shake {
                animation: astu-card-shake 0.45s ease-in-out !important;
              }
            `}</style>

            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`astu-dialogue-card ${isWrong ? 'astu-card-shake' : ''}`}
              style={{
                maxWidth: 540,
                width: '100%',
                maxHeight: 'min(94vh, 480px)',
                overflowY: 'auto',
                padding: 'clamp(12px, 2.5vh, 22px) clamp(14px, 2vw, 22px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(8px, 1.8vh, 14px)',
              }}
            >
              {/* Header Badges */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span className="astu-name-badge">
                  <span>🎗️</span> Misi 3: Jangkauan Kuartil
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: 'var(--astu-gold-bright, #FCD34D)',
                    fontFamily: 'var(--font-data)',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    padding: '3px 10px',
                    borderRadius: 6,
                  }}
                >
                  LANGKAH 3: PEMAHAMAN KONSEP
                </span>
              </div>

              {/* Subtitle / Topic Category */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: '#38BDF8',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}
                >
                  ANALISIS ARTI PENTING IQR
                </span>
                <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700 }}>
                  Kuis Pemahaman Konsep
                </span>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-secondary, #94A3B8)',
                  lineHeight: 1.5,
                }}
              >
                Setelah berhasil menghitung selisih Kuartil Atas dan Bawah, buktikan pemahaman analisismu mengenai arti dan fungsi nilai IQR ini:
              </p>

              {/* Question Box (Golden framed box like entrance quiz) */}
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1.5px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: 12,
                  padding: '16px 14px',
                  textAlign: 'center',
                  boxShadow: 'inset 0 0 15px rgba(245, 158, 11, 0.05)',
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: '#FFFFFF',
                    lineHeight: 1.55,
                  }}
                >
                  &quot;Apa arti penting dari nilai Jangkauan Kuartil (IQR) sebesar {formatDistance(stats.iqr)} meter ini?&quot;
                </div>
              </div>

              {/* Choice Selection Grid / Vertical List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {quizOptions.map((opt, idx) => {
                  const isSelected = selectedQuizIndex === idx
                  const isOptionCorrect = isSelected && isCorrect
                  const isOptionWrong = isSelected && isWrong

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerQuiz(idx)}
                      disabled={isCorrect}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 12,
                        background: isOptionCorrect
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(5, 150, 105, 0.35))'
                          : isOptionWrong
                          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.35), rgba(220, 38, 38, 0.35))'
                          : 'rgba(20, 42, 66, 0.85)',
                        border: isOptionCorrect
                          ? '2px solid #6EE7B7'
                          : isOptionWrong
                          ? '2px solid #FCA5A5'
                          : '1.5px solid rgba(0, 173, 181, 0.35)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: 12.5,
                        cursor: isCorrect ? 'default' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 4px 14px rgba(0,0,0,0.5)' : 'none',
                        display: 'flex',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        gap: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          background: isOptionCorrect
                            ? '#10B981'
                            : isOptionWrong
                            ? '#EF4444'
                            : 'rgba(245, 158, 11, 0.2)',
                          border: `1.5px solid ${isOptionCorrect ? '#6EE7B7' : isOptionWrong ? '#FCA5A5' : '#F59E0B'}`,
                          color: isOptionCorrect ? '#FFFFFF' : isOptionWrong ? '#FFFFFF' : 'var(--astu-gold-bright, #FCD34D)',
                          fontSize: 12,
                          fontWeight: 900,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span style={{ flex: 1 }}>{opt.text}</span>
                    </button>
                  )
                })}
              </div>

              {/* Feedback Message */}
              {isCorrect && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '12px 14px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1.5px solid #10B981',
                    borderRadius: 10,
                    color: '#6EE7B7',
                    fontSize: 12.5,
                    fontWeight: 800,
                    textAlign: 'center',
                    lineHeight: 1.45,
                  }}
                >
                  ✓ {selectedQuizIndex !== null ? quizOptions[selectedQuizIndex].explanation : ''}
                </motion.div>
              )}

              {isWrong && quizError && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1.5px solid #EF4444',
                    borderRadius: 10,
                    color: '#FCA5A5',
                    fontSize: 12,
                    fontWeight: 800,
                    textAlign: 'center',
                    lineHeight: 1.45,
                  }}
                >
                  ✕ {quizError}
                </motion.div>
              )}

              {/* Action Button on Complete */}
              {isCorrect && (
                <motion.button
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onComplete}
                  style={{
                    marginTop: 4,
                    padding: '12px 24px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: 13.5,
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    letterSpacing: '0.5px',
                  }}
                >
                  <span>SELESAIKAN MISI 3</span> ▶
                </motion.button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
