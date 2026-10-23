'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LEVEL2_FINAL_EVALUATION_QUESTIONS,
  EvaluationQuestion,
} from '../data/level2EvaluationQuestions'

interface Level2FinalEvaluationModalProps {
  sessionStartTime: number | null
  onPass: (stars: 1 | 2 | 3, score: number) => void
  onRestart: () => void
  playSound?: (type: 'chime' | 'throw' | 'whistle' | 'error' | 'pop') => void
}


// ─────────────────────────────────────────────────────────────
// INTERACTIVE STAR CELEBRATION PANEL
// ─────────────────────────────────────────────────────────────
interface InteractiveStarCelebrationProps {
  currentStars: 1 | 2 | 3
  elapsedTime: number
  isPassed: boolean
  totalCorrect: number
  totalQuestions: number
  passingThreshold: number
  formatTime: (sec: number) => string
  playSound?: (type: 'chime' | 'throw' | 'whistle' | 'error' | 'pop') => void
  onPass: (stars: 1 | 2 | 3, score: number) => void
  onRestart: () => void
}

function InteractiveStarCelebration({
  currentStars,
  elapsedTime,
  isPassed,
  totalCorrect,
  totalQuestions,
  passingThreshold,
  formatTime,
  playSound,
  onPass,
  onRestart,
}: InteractiveStarCelebrationProps) {
  const [revealedStars, setRevealedStars] = useState(0)
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; char: string }[]>([])
  const [clickedStar, setClickedStar] = useState<number | null>(null)
  const [showCheerText, setShowCheerText] = useState('')

  // Staggered star reveal animation with sound
  useEffect(() => {
    if (!isPassed) return
    const t1 = setTimeout(() => {
      setRevealedStars(1)
      playSound?.('chime')
    }, 300)

    const t2 = setTimeout(() => {
      if (currentStars >= 2) {
        setRevealedStars(2)
        playSound?.('chime')
      }
    }, 650)

    const t3 = setTimeout(() => {
      if (currentStars >= 3) {
        setRevealedStars(3)
        playSound?.('chime')
      }
    }, 1000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [isPassed, currentStars, playSound])

  const handleStarClick = (starIdx: number) => {
    if (starIdx > currentStars) return
    setClickedStar(starIdx)
    playSound?.('pop')
    setShowCheerText(
      starIdx === 3
        ? '🌟 Bintang Kecepatan Sempurna!'
        : starIdx === 2
        ? '⚡ Bintang Investigasi Kilat!'
        : '🎯 Bintang Analisis Tepat!'
    )
    
    // Add burst sparkles
    const newSparkles = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 80,
      y: (Math.random() - 0.5) * 80,
      char: ['✨', '⭐', '💫', '🎉', '🌟'][Math.floor(Math.random() * 5)],
    }))
    setSparkles(prev => [...prev.slice(-12), ...newSparkles])

    setTimeout(() => {
      setClickedStar(null)
    }, 400)
    setTimeout(() => {
      setShowCheerText('')
    }, 1800)
  }

  const rankInfo = currentStars === 3
    ? {
        badge: '👑 DETEKTIF KELAS SPRINT S+',
        color: '#FCD34D',
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        desc: 'Kecepatan Analisis Sempurna! Selesai dalam ≤ 10 Menit!',
      }
    : currentStars === 2
    ? {
        badge: '🎖️ DETEKTIF TAKTIS KELAS UTAMA',
        color: '#38BDF8',
        gradient: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
        desc: 'Investigasi Tangkas & Cermat! Selesai dalam ≤ 15 Menit!',
      }
    : {
        badge: '🏅 DETEKTIF GIGIH & TUNTAS',
        color: '#34D399',
        gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        desc: 'Penyelidikan Lapangan Diselesaikan dengan Tekun!',
      }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: 'clamp(4px, 1vh, 10px) 0',
        width: '100%',
      }}
    >
      {/* ── HEADER BADGE ── */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: isPassed ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: isPassed ? '1.5px solid #F59E0B' : '1.5px solid #EF4444',
          borderRadius: '999px',
          padding: '4px 14px',
          marginBottom: '6px',
        }}
      >
        <span style={{ fontSize: '15px' }}>{isPassed ? '🏆' : '⚠️'}</span>
        <span style={{ fontSize: '11px', fontWeight: 900, color: isPassed ? '#FCD34D' : '#FCA5A5', letterSpacing: '0.5px' }}>
          {isPassed ? 'HASIL EVALUASI INVESTIGASI' : 'EVALUASI PERLU DIULANG'}
        </span>
      </motion.div>

      <h3
        style={{
          fontSize: 'clamp(17px, 2.2vw, 22px)',
          fontWeight: 900,
          margin: '0 0 4px',
          color: isPassed ? '#FFFFFF' : '#EF4444',
        }}
      >
        {isPassed ? 'Selamat! Kamu Berhasil Lulus!' : 'Evaluasi Belum Memenuhi Syarat'}
      </h3>

      <p
        style={{
          fontSize: 'clamp(11px, 1.2vw, 12.5px)',
          color: '#94A3B8',
          maxWidth: '520px',
          lineHeight: '1.4',
          margin: '0 0 12px',
        }}
      >
        {isPassed
          ? `Kamu berhasil menjawab ${totalCorrect} dari ${totalQuestions} soal dengan benar! Berikut perolehan bintang penyelidikanmu:`
          : `Kamu menjawab ${totalCorrect} dari ${totalQuestions} soal dengan benar. Syarat minimal adalah ${passingThreshold} soal benar.`}
      </p>

      {/* ── INTERACTIVE STAR PODIUM STAGE (IF PASSED) ── */}
      {isPassed ? (
        <div
          style={{
            width: '100%',
            maxWidth: '490px',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
            border: '2px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '20px',
            padding: 'clamp(12px, 2vh, 18px)',
            marginBottom: '14px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(245, 158, 11, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '180px',
              height: '100px',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, transparent 70%)',
              pointerEvents: 'none',
              filter: 'blur(20px)',
            }}
          />

          {/* Floating Sparkles when stars are clicked */}
          <AnimatePresence>
            {sparkles.map(sp => (
              <motion.span
                key={sp.id}
                initial={{ opacity: 1, scale: 0.6, x: sp.x, y: sp.y }}
                animate={{ opacity: 0, scale: 1.4, y: sp.y - 40 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '35%',
                  pointerEvents: 'none',
                  fontSize: '18px',
                  zIndex: 10,
                }}
              >
                {sp.char}
              </motion.span>
            ))}
          </AnimatePresence>

          {/* Large Interactive Star Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(12px, 3vw, 22px)',
              margin: '6px 0 10px',
              position: 'relative',
            }}
          >
            {[1, 2, 3].map((starIdx) => {
              const isEarned = starIdx <= currentStars
              const isRevealed = starIdx <= revealedStars
              const isClicked = clickedStar === starIdx

              return (
                <div
                  key={starIdx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    position: 'relative',
                  }}
                >
                  <motion.button
                    type="button"
                    onClick={() => handleStarClick(starIdx)}
                    initial={{ scale: 0, rotate: -30, opacity: 0 }}
                    animate={
                      isRevealed
                        ? {
                            scale: isClicked ? [1, 1.35, 1] : 1,
                            rotate: isClicked ? [0, -12, 12, 0] : 0,
                            opacity: 1,
                          }
                        : { scale: 0.8, rotate: 0, opacity: 0.3 }
                    }
                    whileHover={
                      isEarned
                        ? { scale: 1.2, filter: 'drop-shadow(0 0 16px rgba(245, 158, 11, 0.9))' }
                        : {}
                    }
                    whileTap={isEarned ? { scale: 0.9 } : {}}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 15,
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: isEarned ? 'pointer' : 'default',
                      fontSize: 'clamp(36px, 5.5vw, 48px)',
                      lineHeight: 1,
                      color: isEarned && isRevealed ? '#F59E0B' : '#475569',
                      filter:
                        isEarned && isRevealed
                          ? 'drop-shadow(0 4px 12px rgba(245, 158, 11, 0.6))'
                          : 'none',
                      padding: '4px',
                      userSelect: 'none',
                      position: 'relative',
                    }}
                    title={
                      isEarned
                        ? `Bintang ke-${starIdx} berhasil diraih! Klik untuk efek!`
                        : starIdx === 3
                        ? 'Perlu durasi ≤ 10 Menit untuk bintang ke-3'
                        : 'Perlu durasi ≤ 15 Menit untuk bintang ke-2'
                    }
                  >
                    {isEarned && isRevealed ? '★' : '☆'}
                  </motion.button>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: isEarned && isRevealed ? '#FCD34D' : '#64748B',
                      fontFamily: 'monospace',
                    }}
                  >
                    BINTANG {starIdx}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Interactive Click Cheer Message */}
          <div style={{ minHeight: '18px', marginBottom: '6px' }}>
            {showCheerText ? (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: '11px',
                  fontWeight: 900,
                  color: '#FCD34D',
                  letterSpacing: '0.4px',
                }}
              >
                {showCheerText}
              </motion.div>
            ) : (
              <span style={{ fontSize: '10px', color: '#64748B' }}>
                (💡 Ketuk/klik bintang untuk memicu perayaan!)
              </span>
            )}
          </div>

          {/* Detective Title Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: `1.5px solid ${rankInfo.color}`,
              borderRadius: '14px',
              padding: '10px 14px',
              margin: '4px 0 10px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 900, color: rankInfo.color, letterSpacing: '0.5px' }}>
              {rankInfo.badge}
            </div>
            <div style={{ fontSize: '11px', color: '#E2E8F0', marginTop: '2px', lineHeight: 1.4 }}>
              {rankInfo.desc}
            </div>
          </motion.div>

          {/* ── TIME-TO-STAR INTERACTIVE TRACKER ── */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '12px',
              padding: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8' }}>
                KATEGORI WAKTU PENYELESAIAN:
              </span>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#38BDF8', fontFamily: 'monospace' }}>
                ⏱️ Waktumu: {formatTime(elapsedTime)}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {/* Segment 1: <= 10m */}
              <div
                style={{
                  padding: '6px 4px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  background: currentStars === 3 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: currentStars === 3 ? '1.5px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: currentStars === 3 ? '0 0 10px rgba(245, 158, 11, 0.35)' : 'none',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 900, color: currentStars === 3 ? '#FCD34D' : '#94A3B8' }}>
                  ≤ 10 Menit
                </div>
                <div style={{ fontSize: '11px', color: '#FCD34D', marginTop: '2px' }}>
                  ⭐⭐⭐
                </div>
                {currentStars === 3 && (
                  <div style={{ fontSize: '8.5px', color: '#10B981', fontWeight: 800, marginTop: '2px' }}>
                    ✓ Tercapai!
                  </div>
                )}
              </div>

              {/* Segment 2: 10-15m */}
              <div
                style={{
                  padding: '6px 4px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  background: currentStars === 2 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: currentStars === 2 ? '1.5px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: currentStars === 2 ? '0 0 10px rgba(56, 189, 248, 0.35)' : 'none',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 900, color: currentStars === 2 ? '#38BDF8' : '#94A3B8' }}>
                  10 – 15 Menit
                </div>
                <div style={{ fontSize: '11px', color: '#FCD34D', marginTop: '2px' }}>
                  ⭐⭐
                </div>
                {currentStars === 2 && (
                  <div style={{ fontSize: '8.5px', color: '#38BDF8', fontWeight: 800, marginTop: '2px' }}>
                    ✓ Tercapai!
                  </div>
                )}
              </div>

              {/* Segment 3: > 15m */}
              <div
                style={{
                  padding: '6px 4px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  background: currentStars === 1 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: currentStars === 1 ? '1.5px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: currentStars === 1 ? '0 0 10px rgba(16, 185, 129, 0.35)' : 'none',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 900, color: currentStars === 1 ? '#34D399' : '#94A3B8' }}>
                  &gt; 15 Menit
                </div>
                <div style={{ fontSize: '11px', color: '#FCD34D', marginTop: '2px' }}>
                  ⭐
                </div>
                {currentStars === 1 && (
                  <div style={{ fontSize: '8.5px', color: '#34D399', fontWeight: 800, marginTop: '2px' }}>
                    ✓ Tercapai!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Failed State Card */
        <div
          style={{
            width: '100%',
            maxWidth: '480px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '16px',
            padding: '14px',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#FCA5A5', marginBottom: '6px' }}>
            ⚠️ Skor Minimal Belum Terpenuhi
          </div>
          <div style={{ fontSize: '11.5px', color: '#CBD5E1', lineHeight: 1.5 }}>
            Kamu menjawab <b>{totalCorrect}</b> dari <b>{totalQuestions}</b> soal evaluasi dengan benar.
            <br />
            Untuk lulus dan meraih bintang, kamu harus menjawab minimal <b>{passingThreshold} soal benar</b>.
          </div>
        </div>
      )}

      {/* ── ACTION BUTTON ── */}
      {isPassed ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onPass(currentStars, totalCorrect)}
          style={{
            width: '100%',
            maxWidth: '490px',
            padding: 'clamp(12px, 2vh, 16px)',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            border: 'none',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: 'clamp(13px, 1.4vw, 15px)',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.45)',
            letterSpacing: '0.4px',
          }}
        >
          BUKA LAPORAN AKHIR & KEMBALI KE MARKAS ▶
        </motion.button>
      ) : (
        <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRestart}
            style={{
              width: '100%',
              padding: 'clamp(12px, 2vh, 16px)',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: 'clamp(13px, 1.4vw, 15px)',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
            }}
          >
            🔄 ULANGI PERMAINAN DARI AWAL
          </motion.button>
          <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>
            Kamu akan mengulang penyelidikan dari koridor sekolah untuk memperbaiki hasil evaluasimu.
          </span>
        </div>
      )}
    </div>
  )
}

export const Level2FinalEvaluationModal: React.FC<Level2FinalEvaluationModalProps> = ({
  sessionStartTime,
  onPass,
  onRestart,
  playSound,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [answersRecord, setAnswersRecord] = useState<{ [qId: number]: { selected: number; isCorrect: boolean } }>({})
  const [showResultScreen, setShowResultScreen] = useState(false)
  const [elapsedTime, setElapsedTime] = useState<number>(() => {
    return sessionStartTime ? Math.max(0, Math.floor((Date.now() - sessionStartTime) / 1000)) : 480
  })

  // Timer update
  useEffect(() => {
    if (showResultScreen) return
    const interval = setInterval(() => {
      if (sessionStartTime) {
        setElapsedTime(Math.max(0, Math.floor((Date.now() - sessionStartTime) / 1000)))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [sessionStartTime, showResultScreen])

  const currentQ: EvaluationQuestion = LEVEL2_FINAL_EVALUATION_QUESTIONS[currentIndex]
  const totalQuestions = LEVEL2_FINAL_EVALUATION_QUESTIONS.length

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Calculate current star rating based on time rules:
  // <= 10 min (600s) -> 3 stars
  // <= 15 min (900s) -> 2 stars
  // > 15 min -> 1 star
  const getStarsForTime = (seconds: number): 1 | 2 | 3 => {
    if (seconds <= 600) return 3
    if (seconds <= 900) return 2
    return 1
  }

  const currentStars = getStarsForTime(elapsedTime)

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return
    setSelectedOption(index)
  }

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return
    const isCorrect = selectedOption === currentQ.correctIndex
    if (isCorrect) {
      playSound?.('chime')
    } else {
      playSound?.('error')
    }
    setAnswersRecord((prev) => ({
      ...prev,
      [currentQ.id]: { selected: selectedOption, isCorrect },
    }))
    setIsAnswerSubmitted(true)
  }

  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setIsAnswerSubmitted(false)
    } else {
      // Finished all 5 questions
      setShowResultScreen(true)
    }
  }

  const totalCorrect = Object.values(answersRecord).filter((a) => a.isCorrect).length
  const passingThreshold = totalQuestions <= 3 ? 2 : 4
  const isPassed = totalCorrect >= passingThreshold

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 950,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(2, 6, 23, 0.88)',
        backdropFilter: 'blur(12px)',
        padding: 'clamp(8px, 2vh, 16px)',
        userSelect: 'none',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: 'min(94vh, 620px)',
          background: 'linear-gradient(145deg, #0B132B 0%, #1C2541 100%)',
          borderRadius: '24px',
          border: isPassed && showResultScreen ? '2px solid #F59E0B' : '2px solid #3B82F6',
          boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(59, 130, 246, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#FFFFFF',
        }}
      >
        {/* ── TOP HEADER BAR ── */}
        <div
          style={{
            padding: 'clamp(10px, 1.8vh, 14px) clamp(14px, 2.5vw, 22px)',
            background: 'rgba(15, 23, 42, 0.75)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: 'clamp(18px, 2.5vw, 24px)' }}>🎯</span>
            <div>
              <div style={{ fontSize: 'clamp(12px, 1.4vw, 15px)', fontWeight: 900, color: '#60A5FA', letterSpacing: '0.5px' }}>
                UJIAN EVALUASI DETEKTIF AKHIR
              </div>
              <div style={{ fontSize: 'clamp(10px, 1.1vw, 11px)', color: '#94A3B8' }}>
                Syarat Lulus: Minimal {passingThreshold} dari {totalQuestions} Soal Benar
              </div>
            </div>
          </div>

          {/* Time & Star Preview Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(0, 0, 0, 0.45)',
              padding: '6px 12px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>Waktu Bermain</div>
              <div style={{ fontSize: '13px', fontWeight: 900, color: '#38BDF8', fontFamily: 'monospace' }}>
                ⏱️ {formatTime(elapsedTime)}
              </div>
            </div>
            <div
              style={{
                borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
                paddingLeft: '10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '10px', color: '#FCD34D', fontWeight: 600 }}>Potensi Bintang</div>
              <div style={{ fontSize: '13px' }}>
                {'⭐'.repeat(currentStars)}
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT AREA ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'clamp(12px, 2vh, 20px) clamp(14px, 2.5vw, 24px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {!showResultScreen ? (
            <>
              {/* Question Navigation Tracker */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'clamp(10px, 1.8vh, 16px)',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: 'clamp(11px, 1.2vw, 13px)', fontWeight: 700, color: '#94A3B8' }}>
                  SOAL <span style={{ color: '#FCD34D', fontWeight: 900 }}>{currentIndex + 1}</span> DARI {totalQuestions}
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {LEVEL2_FINAL_EVALUATION_QUESTIONS.map((q, idx) => {
                    const record = answersRecord[q.id]
                    const isCurrent = idx === currentIndex
                    let bg = 'rgba(255, 255, 255, 0.12)'
                    let border = '1px solid rgba(255, 255, 255, 0.2)'
                    let text = String(idx + 1)

                    if (record) {
                      if (record.isCorrect) {
                        bg = '#10B981'
                        border = '1px solid #34D399'
                        text = '✓'
                      } else {
                        bg = '#EF4444'
                        border = '1px solid #F87171'
                        text = '✗'
                      }
                    } else if (isCurrent) {
                      bg = '#3B82F6'
                      border = '2px solid #60A5FA'
                    }

                    return (
                      <div
                        key={q.id}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '8px',
                          background: bg,
                          border: border,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 900,
                          color: '#FFFFFF',
                          boxShadow: isCurrent ? '0 0 10px rgba(59, 130, 246, 0.6)' : 'none',
                        }}
                      >
                        {text}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Question Text Box */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  padding: 'clamp(12px, 2vh, 18px)',
                  marginBottom: 'clamp(12px, 2vh, 16px)',
                  boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(12px, 1.35vw, 14.5px)',
                    lineHeight: '1.6',
                    fontWeight: 600,
                    color: '#F1F5F9',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {currentQ.question}
                </div>
              </div>

              {/* Multiple Choice Options */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 'clamp(8px, 1.4vh, 12px)',
                  marginBottom: 'clamp(12px, 2vh, 16px)',
                }}
              >
                {currentQ.options.map((opt, oIdx) => {
                  const optionLabel = String.fromCharCode(65 + oIdx) // 'A', 'B', 'C', 'D'
                  const isSelected = selectedOption === oIdx
                  const isCorrect = oIdx === currentQ.correctIndex

                  let btnBg = 'rgba(30, 41, 59, 0.7)'
                  let btnBorder = '1.5px solid rgba(255, 255, 255, 0.12)'
                  let labelBg = 'rgba(255, 255, 255, 0.1)'
                  let labelColor = '#94A3B8'

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      btnBg = 'rgba(16, 185, 129, 0.25)'
                      btnBorder = '2px solid #10B981'
                      labelBg = '#10B981'
                      labelColor = '#FFFFFF'
                    } else if (isSelected && !isCorrect) {
                      btnBg = 'rgba(239, 68, 68, 0.25)'
                      btnBorder = '2px solid #EF4444'
                      labelBg = '#EF4444'
                      labelColor = '#FFFFFF'
                    }
                  } else if (isSelected) {
                    btnBg = 'rgba(59, 130, 246, 0.25)'
                    btnBorder = '2px solid #3B82F6'
                    labelBg = '#3B82F6'
                    labelColor = '#FFFFFF'
                  }

                  return (
                    <motion.button
                      key={oIdx}
                      whileHover={!isAnswerSubmitted ? { scale: 1.015 } : {}}
                      whileTap={!isAnswerSubmitted ? { scale: 0.985 } : {}}
                      onClick={() => handleSelectOption(oIdx)}
                      disabled={isAnswerSubmitted}
                      style={{
                        padding: 'clamp(10px, 1.6vh, 14px) clamp(12px, 2vw, 16px)',
                        borderRadius: '14px',
                        background: btnBg,
                        border: btnBorder,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: isAnswerSubmitted ? 'default' : 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: labelBg,
                          color: labelColor,
                          fontWeight: 900,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {optionLabel}
                      </div>
                      <div
                        style={{
                          fontSize: 'clamp(12px, 1.3vw, 14px)',
                          fontWeight: 700,
                          color: '#F8FAFC',
                          flex: 1,
                        }}
                      >
                        {opt}
                      </div>
                      {isAnswerSubmitted && isCorrect && (
                        <span style={{ fontSize: '16px', color: '#34D399' }}>✓</span>
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <span style={{ fontSize: '16px', color: '#F87171' }}>✗</span>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Feedback and Explanation Box (Shown after submitting) */}
              <AnimatePresence>
                {isAnswerSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background:
                        selectedOption === currentQ.correctIndex
                          ? 'rgba(16, 185, 129, 0.12)'
                          : 'rgba(239, 68, 68, 0.12)',
                      border:
                        selectedOption === currentQ.correctIndex
                          ? '1.5px solid rgba(16, 185, 129, 0.4)'
                          : '1.5px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '16px',
                      padding: 'clamp(10px, 1.8vh, 14px) clamp(12px, 2vw, 16px)',
                      marginBottom: 'clamp(12px, 2vh, 16px)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '16px' }}>
                        {selectedOption === currentQ.correctIndex ? '🎉' : '💡'}
                      </span>
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: 'clamp(11.5px, 1.3vw, 13.5px)',
                          color:
                            selectedOption === currentQ.correctIndex
                              ? '#34D399'
                              : '#F87171',
                        }}
                      >
                        {selectedOption === currentQ.correctIndex
                          ? 'Jawaban Kamu Benar!'
                          : `Jawaban Belum Tepat. Kunci Jawaban: ${String.fromCharCode(
                              65 + currentQ.correctIndex
                            )}. ${currentQ.options[currentQ.correctIndex]}`}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 'clamp(11px, 1.15vw, 12.5px)',
                        color: '#CBD5E1',
                        lineHeight: '1.55',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {currentQ.explanation}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    style={{
                      padding: 'clamp(10px, 1.8vh, 12px) clamp(20px, 3vw, 28px)',
                      borderRadius: '12px',
                      background:
                        selectedOption !== null
                          ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                          : 'rgba(51, 65, 85, 0.5)',
                      border: 'none',
                      color: selectedOption !== null ? '#FFFFFF' : '#64748B',
                      fontWeight: 900,
                      fontSize: 'clamp(12px, 1.3vw, 14px)',
                      cursor: selectedOption !== null ? 'pointer' : 'not-allowed',
                      boxShadow:
                        selectedOption !== null
                          ? '0 4px 15px rgba(59, 130, 246, 0.4)'
                          : 'none',
                    }}
                  >
                    Kunci Jawaban ▶
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    style={{
                      padding: 'clamp(10px, 1.8vh, 12px) clamp(20px, 3vw, 28px)',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      border: 'none',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      fontSize: 'clamp(12px, 1.3vw, 14px)',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    {currentIndex < totalQuestions - 1 ? 'Soal Berikutnya ▶' : 'Lihat Hasil Evaluasi ▶'}
                  </button>
                )}
              </div>
            </>
          ) : (
            <InteractiveStarCelebration
              currentStars={currentStars}
              elapsedTime={elapsedTime}
              isPassed={isPassed}
              totalCorrect={totalCorrect}
              totalQuestions={totalQuestions}
              passingThreshold={passingThreshold}
              formatTime={formatTime}
              playSound={playSound}
              onPass={onPass}
              onRestart={onRestart}
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}
export default Level2FinalEvaluationModal
