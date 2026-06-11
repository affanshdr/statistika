'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useGameStore } from '@/lib/store/gameStore'
import DiRA from '../../../_components/DiRA'
import BadgeUnlock from '../../../_components/BadgeUnlock'
import { BADGES } from '../../../_data/level1'
import { useRouter } from 'next/navigation'

const DraggableHistogram = dynamic(() => import('../../../_components/DraggableHistogram'), { ssr: false })

const TOTAL_STEPS = 1
const STEP_LABELS = ['Data & Histogram Terbimbing']

const DIRA_MESSAGES: Record<number, string> = {
  0: "Yuk pindahkan data screen time 10 siswa ke histogram di sebelah kanan. Aku udah masukkan 7 data secara otomatis sebagai bantuan buat kamu lho! Tinggal masukkan 3 data acak tersisa ya. 😉",
}

interface PendingBadge { icon: string; name: string; desc: string; id: string }

export default function FDPath() {
  const router = useRouter()
  const {
    currentStep, addXP, loseLife, lives, isCompleted,
    completeLevel, unlockBadge, incrementMistake, mistakeCount,
    sessionStartTime,
  } = useGameStore()

  const [gameOver, setGameOver] = useState(false)
  const [pendingBadges, setPendingBadges] = useState<PendingBadge[]>([])
  const [diraMsg, setDiraMsg] = useState(DIRA_MESSAGES[0])
  const [showDira, setShowDira] = useState(true)

  useEffect(() => {
    if (lives <= 0) setGameOver(true)
  }, [lives])

  const awardBadge = useCallback((badge: typeof BADGES[keyof typeof BADGES]) => {
    unlockBadge(badge.id)
    setPendingBadges(prev => [...prev, badge])
  }, [unlockBadge])

  const dismissBadge = () => setPendingBadges(prev => prev.slice(1))

  const handleHistogramSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      addXP(50, 'Menyusun histogram terbimbing dengan benar', 1)
      awardBadge(BADGES.DETECTIVE)
      if (mistakeCount === 0) awardBadge(BADGES.PERFECT)

      const initialTime = 900
      const elapsed = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : initialTime
      if (elapsed < initialTime * 0.5) awardBadge(BADGES.SPEED)

      completeLevel(1)
    } else {
      loseLife()
      incrementMistake()
      setDiraMsg('Psst, periksa kembali penempatan data bubble acak kamu ya! Coba lagi! 😊')
      setShowDira(true)
    }
  }

  useEffect(() => {
    if (isCompleted) {
      const t = setTimeout(() => router.push('/siswa/game/results/1'), 1500)
      return () => clearTimeout(t)
    }
  }, [isCompleted, router])

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '24px 16px', paddingBottom: '120px' }}>

      {/* Step indicator */}
      <div className="step-indicator">
        {STEP_LABELS.map((_, i) => (
          <div key={i} className={`step-dot ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`} />
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
          {/* ── STEP 0: Data & Histogram Terbimbing ── */}
          {currentStep === 0 && (
            <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>STEP 1 — DATA & HISTOGRAM TERBIMBING</div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Lengkapi Histogram Screen Time</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                  Ada 10 data screen time remaja. 7 data sudah dimasukkan otomatis sebagai bantuan. Silakan drag/click 3 data acak tersisa di sebelah kiri ke kelas interval yang tepat di grafik sebelah kanan.
                </p>
              </div>

              {/* Pre-computed stats */}
              <div style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid var(--game-border-accent)', borderRadius: '14px', padding: '16px 20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginBottom: '12px', letterSpacing: '1px' }}>📊 STATISTIK DASAR (DIHITUNG OTOMATIS)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                  {[
                    { label: 'Mean', val: '5.93 jam' },
                    { label: 'Median', val: '5.95 jam' },
                    { label: 'Min', val: '3.7 jam' },
                    { label: 'Max', val: '8.8 jam' },
                    { label: 'Range', val: '5.1 jam' },
                    { label: 'n', val: '10 siswa' },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>{label}</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-data)' }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <DraggableHistogram mode="FD" onSubmit={handleHistogramSubmit} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* DiRA guide */}
      {showDira && (
        <DiRA
          message={diraMsg}
          onDismiss={() => setShowDira(false)}
        />
      )}

      {/* Game Over */}
      {gameOver && (
        <div className="game-over-screen">
          <div style={{ fontSize: '64px' }}>💀</div>
          <h2 style={{ fontSize: '28px', margin: 0 }}>Game Over</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Dira: &quot;Jangan menyerah! Kamu pasti bisa 💪&quot;
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="game-btn game-btn-primary"
              onClick={() => {
                useGameStore.setState({ lives: 4 })
                setGameOver(false)
              }}
            >
              Coba Lagi
            </button>
            <button className="game-btn game-btn-secondary" onClick={() => router.push('/siswa/game/lobby')}>
              Lobby
            </button>
          </div>
        </div>
      )}

      {/* Badge queue */}
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
