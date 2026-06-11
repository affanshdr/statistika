'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useGameStore } from '@/lib/store/gameStore'
import BadgeUnlock from '../../../_components/BadgeUnlock'
import { BADGES } from '../../../_data/level1'
import { useRouter } from 'next/navigation'

const DraggableHistogram = dynamic(() => import('../../../_components/DraggableHistogram'), { ssr: false })

const TOTAL_STEPS = 1
const STEP_LABELS = ['Data & Histogram']

interface PendingBadge { icon: string; name: string; desc: string; id: string }

export default function FIPath() {
  const router = useRouter()
  const {
    currentStep, addXP, loseLife, lives, isCompleted,
    completeLevel, unlockBadge, incrementMistake,
    mistakeCount, sessionStartTime,
  } = useGameStore()

  const [gameOver, setGameOver] = useState(false)
  const [pendingBadges, setPendingBadges] = useState<PendingBadge[]>([])

  // Track lives → game over
  useEffect(() => {
    if (lives <= 0) setGameOver(true)
  }, [lives])

  const awardBadge = useCallback((badge: typeof BADGES[keyof typeof BADGES]) => {
    unlockBadge(badge.id)
    setPendingBadges(prev => [...prev, badge])
  }, [unlockBadge])

  const dismissBadge = () => setPendingBadges(prev => prev.slice(1))

  // ── STEP 1: Histogram ──
  const handleHistogramSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      addXP(50, 'Menyusun histogram dengan benar', 1)
      awardBadge(BADGES.DETECTIVE)
      if (mistakeCount === 0) awardBadge(BADGES.PERFECT)

      // Speed bonus: check if < 50% time used
      const initialTime = 600
      const elapsed = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : initialTime
      if (elapsed < initialTime * 0.5) awardBadge(BADGES.SPEED)

      // Apply FI ×1.5 multiplier
      const currentXP = useGameStore.getState().xp
      const bonus = Math.floor(currentXP * 0.5)
      addXP(bonus, 'FI multiplier ×1.5', 1)

      completeLevel(1)
    } else {
      loseLife()
      incrementMistake()
    }
  }

  // Navigate to results after completing
  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => router.push('/siswa/game/results/1'), 1500)
      return () => clearTimeout(timer)
    }
  }, [isCompleted, router])

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '24px 16px' }}>

      {/* Step indicator */}
      <div className="step-indicator">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className={`step-dot ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`} title={label} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >

          {/* ── STEP 0: Data & Histogram ── */}
          {currentStep === 0 && (
            <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>STEP 1 — DATA & HISTOGRAM</div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Kelompokkan Data Screen Time</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                  Susun histogram dengan memindahkan (drag/click) data screen time acak dari kolam di sebelah kiri ke kelas interval yang tepat di grafik sebelah kanan.
                </p>
              </div>
              <DraggableHistogram
                mode="FI"
                onSubmit={handleHistogramSubmit}
              />
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Game Over overlay */}
      {gameOver && (
        <div className="game-over-screen">
          <div style={{ fontSize: '64px' }}>💀</div>
          <h2 style={{ fontSize: '28px', margin: 0 }}>Game Over</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Nyawa habis. Coba lagi?</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="game-btn game-btn-primary"
              onClick={() => {
                useGameStore.setState({ lives: 3 })
                setGameOver(false)
              }}
            >
              Coba Lagi
            </button>
            <button className="game-btn game-btn-secondary" onClick={() => router.push('/siswa/game/lobby')}>
              Kembali ke Lobby
            </button>
          </div>
        </div>
      )}

      {/* Badge unlock queue */}
      {pendingBadges.length > 0 && (
        <BadgeUnlock
          icon={pendingBadges[0].icon}
          name={pendingBadges[0].name}
          desc={pendingBadges[0].desc}
          onDone={dismissBadge}
        />
      )}
    </div>
  )
}
