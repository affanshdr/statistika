'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ComputedStats, formatDistance, validateAnswer } from '../data/level2StatData'

interface QuartileDeviationMissionPanelProps {
  stats: ComputedStats
  onComplete: () => void
  onMistake: () => void
  playSound: (type: 'chime' | 'error' | 'pop') => void
}

export default function QuartileDeviationMissionPanel({
  stats,
  onComplete,
  onMistake,
  playSound,
}: QuartileDeviationMissionPanelProps) {
  const [stage, setStage] = useState<'CALCULATE' | 'QUIZ'>('CALCULATE')
  const [qdInput, setQdInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [selectedQuizIdx, setSelectedQuizIdx] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isWrong, setIsWrong] = useState(false)

  const displayedQ1 = Math.round(stats.q1)
  const displayedQ3 = Math.round(stats.q3)
  const expectedIQR = displayedQ3 - displayedQ1
  const expectedQD = stats.qd

  const quizOptions = [
    {
      text: 'Setengah dari jangkauan kuartil, mengukur rata-rata penyebaran data di sekitar median tanpa terpengaruh pencilan.',
      correct: true,
      explanation: 'Tepat sekali! Simpangan Kuartil (Qd = ½(Q3 − Q1)) kebal terhadap pencilan karena hanya mengukur separuh sebaran data tengah.',
    },
    {
      text: 'Selisih antara lemparan paling jauh dan paling dekat seluruh kelas.',
      correct: false,
      explanation: 'Itu adalah Jangkauan (Range = Nilai Terbesar − Nilai Terkecil), bukan Simpangan Kuartil.',
    },
    {
      text: 'Nilai tengah dari 10 lemparan setelah diurutkan dari yang terdekat hingga terjauh.',
      correct: false,
      explanation: 'Itu adalah Kuartil Tengah atau Median (Q2), bukan Simpangan Kuartil.',
    },
  ]

  const handleVerifyQD = () => {
    const isValid =
      validateAnswer(qdInput, expectedQD, 0.75) ||
      validateAnswer(qdInput, expectedIQR / 2, 0.75) ||
      validateAnswer(qdInput, Math.round(expectedQD), 0.75)

    if (isValid) {
      playSound('chime')
      setErrorMsg('')
      setStage('QUIZ')
    } else {
      playSound('error')
      onMistake()
      setErrorMsg(
        `Jawaban belum tepat. Rumus Qd = ½ × (Q3 − Q1) = ½ × (${displayedQ3} − ${displayedQ1}) = ½ × ${expectedIQR} = ${expectedQD} m`
      )
    }
  }

  const handleAnswerQuiz = (idx: number) => {
    setSelectedQuizIdx(idx)
    if (quizOptions[idx].correct) {
      playSound('chime')
      setIsCorrect(true)
      setIsWrong(false)
      setErrorMsg('')
      setTimeout(() => {
        onComplete()
      }, 1600)
    } else {
      playSound('error')
      onMistake()
      setIsWrong(true)
      setIsCorrect(false)
      setErrorMsg(quizOptions[idx].explanation)
      setTimeout(() => {
        setIsWrong(false)
      }, 800)
    }
  }

  return (
    <>
      {/* ── 1. BOTTOM HUD DOCK (STAGE 1: CALCULATE QD) ── */}
      {stage !== 'QUIZ' && (
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
            border: '2px solid #EC4899',
            padding: '12px 18px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 25px rgba(236, 72, 153, 0.35)',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Top Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '22px' }}>📐</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#F472B6' }}>
                    Misi 4: Simpangan Kuartil (Qd)
                  </h3>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#CBD5E1' }}>
                  Simpangan kuartil bernilai setengah dari jangkauan kuartil: Qd = ½(Q3 − Q1) = ½ × IQR.
                </p>
              </div>
            </div>

            {/* Progress Step Pill */}
            <div
              style={{
                background: 'rgba(236, 72, 153, 0.18)',
                border: '1.5px solid #EC4899',
                borderRadius: '12px',
                padding: '4px 12px',
                fontSize: '11.5px',
                fontWeight: 900,
                color: '#FBCFE8',
                whiteSpace: 'nowrap',
              }}
            >
              Langkah 1: Hitung Qd
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
            {/* Formula & Values Tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
              <div
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: 'rgba(236, 72, 153, 0.14)',
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                  fontSize: '11px',
                  color: '#FBCFE8',
                  whiteSpace: 'nowrap',
                }}
              >
                📐 Rumus: <b>Qd = ½ × IQR = ½ × ({displayedQ3} − {displayedQ1})</b>
              </div>

              {errorMsg && (
                <span style={{ fontSize: '10.5px', color: '#FECDD3', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {errorMsg}
                </span>
              )}
            </div>

            {/* Input & Verify */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Nilai Qd..."
                value={qdInput}
                onChange={e => {
                  setQdInput(e.target.value)
                  setErrorMsg('')
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleVerifyQD()
                }}
                style={{
                  width: '100px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1.5px solid #EC4899',
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
                onClick={handleVerifyQD}
                disabled={!qdInput.trim()}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: qdInput.trim() ? 'linear-gradient(135deg, #EC4899, #DB2777)' : '#475569',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '11.5px',
                  cursor: qdInput.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: qdInput.trim() ? '0 4px 15px rgba(236, 72, 153, 0.4)' : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Cek Nilai Qd ▶
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. ENTRANCE-QUIZ STYLE MODAL (STAGE 2: PEMAHAMAN KONSEP QD) ── */}
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
                maxHeight: 'calc(100vh - 40px)',
                overflowY: 'auto',
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {/* Header Badges */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span className="astu-name-badge">
                  <span>📐</span> Misi 4: Simpangan Kuartil (Qd)
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
                  LANGKAH 2: PEMAHAMAN KONSEP
                </span>
              </div>

              {/* Subtitle / Topic Category */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: '#EC4899',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}
                >
                  ANALISIS SEBARAN SEMI-INTERKUARTIL
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
                Setelah menghitung nilai Simpangan Kuartil (Qd = {expectedQD} meter), buktikan pemahamanmu mengenai keunggulan ukuran ini:
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
                  &quot;Mengapa Simpangan Kuartil (Qd) penting dalam menganalisis kestabilan data lemparan siswa?&quot;
                </div>
              </div>

              {/* Choice Selection Grid / Vertical List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {quizOptions.map((opt, idx) => {
                  const isSelected = selectedQuizIdx === idx
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
                  ✓ {selectedQuizIdx !== null ? quizOptions[selectedQuizIdx].explanation : ''}
                </motion.div>
              )}

              {isWrong && errorMsg && (
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
                  ✕ {errorMsg}
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
                  <span>SELESAIKAN MISI 4</span> ▶
                </motion.button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
