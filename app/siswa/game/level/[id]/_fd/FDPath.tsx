'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useGameStore } from '@/lib/store/gameStore'
import DiRA from '../../../_components/DiRA'
import BadgeUnlock from '../../../_components/BadgeUnlock'
import MythBustedStamp from '../../../_components/MythBustedStamp'
import DetektivBooklet from '../../../_components/DetektivBooklet'
import { BADGES, FD_MC_QUESTIONS } from '../../../_data/level1'
import { useRouter } from 'next/navigation'

const DraggableHistogram = dynamic(() => import('../../../_components/DraggableHistogram'), { ssr: false })

// Steps: 0 = Histogram (guided), 1 = MC Questions, 2 = MythBusted, 3 = Materi Booklet
type GameStep = 0 | 1 | 2 | 3

interface PendingBadge { icon: string; name: string; desc: string; id: string }

export default function FDPath() {
  const router = useRouter()
  const { addXP, loseLife, lives, isCompleted, completeLevel, unlockBadge, incrementMistake, mistakeCount, sessionStartTime } = useGameStore()

  const [step, setStep] = useState<GameStep>(0)
  const [gameOver, setGameOver] = useState(false)
  const [pendingBadges, setPendingBadges] = useState<PendingBadge[]>([])

  // DiRA state
  const [diraMsg, setDiraMsg] = useState<string | null>('Yuk pindahkan data screen time 35 siswa ke histogram! Data kelas 1–4 (25 siswa) sudah aku masukkan otomatis sebagai bantuan. Tinggal drag 10 data tersisa ya! 😉')
  const [showDira, setShowDira] = useState(true)

  // MC state
  const [mcAnswers, setMcAnswers] = useState<(number | null)[]>(Array(FD_MC_QUESTIONS.length).fill(null))
  const [mcSubmitted, setMcSubmitted] = useState<boolean[]>(Array(FD_MC_QUESTIONS.length).fill(false))
  const [mcCurrentQ, setMcCurrentQ] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [flashWrong, setFlashWrong] = useState(false)

  useEffect(() => {
    if (lives <= 0) setGameOver(true)
  }, [lives])

  const awardBadge = useCallback((badge: typeof BADGES[keyof typeof BADGES]) => {
    unlockBadge(badge.id)
    setPendingBadges(prev => [...prev, badge])
  }, [unlockBadge])

  const dismissBadge = () => setPendingBadges(prev => prev.slice(1))

  // ── STEP 0: Histogram submitted ──
  const handleHistogramSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      addXP(25, 'Menyusun histogram terbimbing dengan benar', 0)
      setShowDira(false)
      setStep(1)
    } else {
      // FD: only red flash, no life lost — but show DiRA
      setFlashWrong(true)
      setTimeout(() => setFlashWrong(false), 600)
      setDiraMsg('Oops, ada data yang masuk ke kelas yang salah nih! Coba periksa lagi — ingat interval: 1-4, 5-8, 9-12, 13-16 jam. Semangat! 💪')
      setShowDira(true)
    }
  }

  // ── STEP 1: MC Questions ──
  const handleMCSelect = (optIdx: number) => {
    if (mcSubmitted[mcCurrentQ]) return
    const newAnswers = [...mcAnswers]
    newAnswers[mcCurrentQ] = optIdx
    setMcAnswers(newAnswers)
  }

  const handleMCSubmit = () => {
    const q = FD_MC_QUESTIONS[mcCurrentQ]
    const selected = mcAnswers[mcCurrentQ]
    if (selected === null) return

    const newSubmitted = [...mcSubmitted]
    newSubmitted[mcCurrentQ] = true
    setMcSubmitted(newSubmitted)

    const isCorrect = selected === q.correct
    if (!isCorrect) {
      // FD: red flash only, show hint, no life lost — explore mandiri
      setFlashWrong(true)
      setTimeout(() => setFlashWrong(false), 600)
      setShowHint(true)
    } else {
      addXP(5, `MC Q${mcCurrentQ + 1} benar`, 1)
      setShowHint(false)
    }
  }

  const handleMCNext = () => {
    setShowHint(false)
    if (mcCurrentQ < FD_MC_QUESTIONS.length - 1) {
      setMcCurrentQ(prev => prev + 1)
    } else {
      // All MC done — award badges and go to MYTH BUSTED
      awardBadge(BADGES.DETECTIVE)
      if (mistakeCount === 0) awardBadge(BADGES.PERFECT)
      const initialTime = 900
      const elapsed = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : initialTime
      if (elapsed < initialTime * 0.5) awardBadge(BADGES.SPEED)
      awardBadge(BADGES.MYTHBUST)
      setTimeout(() => setStep(2), 400)
    }
  }

  // ── STEP 2: Myth Busted complete → go to materi ──
  const handleMythBustedComplete = () => setStep(3)

  // ── STEP 3: Booklet complete → finish level ──
  const handleBookletComplete = () => {
    addXP(15, 'Menyelesaikan Buku Saku Detektif', 3)
    completeLevel(1)
  }

  useEffect(() => {
    if (isCompleted) {
      const t = setTimeout(() => router.push('/siswa/game/results/1'), 1200)
      return () => clearTimeout(t)
    }
  }, [isCompleted, router])

  const STEP_LABELS = ['Histogram', 'Analisis MC', 'Buku Saku']
  const displayStep = step >= 2 ? 2 : step

  const currentQ = FD_MC_QUESTIONS[mcCurrentQ]
  const isCurrentSubmitted = mcSubmitted[mcCurrentQ]
  const selectedAnswer = mcAnswers[mcCurrentQ]

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '24px 16px', paddingBottom: '120px' }}>

      {/* Step indicator */}
      <div className="step-indicator" style={{ marginBottom: '24px' }}>
        {STEP_LABELS.map((label, i) => (
          <div
            key={i}
            className={`step-dot ${i === displayStep ? 'active' : i < displayStep ? 'done' : ''}`}
            title={label}
          />
        ))}
      </div>

      {/* Red flash overlay */}
      <AnimatePresence>
        {flashWrong && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(239,68,68,0.15)', zIndex: 500, pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* ── STEP 0: Histogram Terbimbing ── */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>
                  TAHAP A — HISTOGRAM TERBIMBING
                </div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Lengkapi Histogram Screen Time</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px', lineHeight: 1.6 }}>
                  Ada 35 data screen time remaja. Data kelas 1–4 jam (25 siswa) sudah dimasukkan otomatis. Silakan drag/klik <strong>10 data tersisa</strong> ke kelas yang tepat!
                </p>
              </div>

              {/* Pre-computed stats */}
              <div style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid var(--game-border-accent)', borderRadius: '14px', padding: '14px 18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, marginBottom: '10px', letterSpacing: '1px' }}>📊 STATISTIK DASAR (SUDAH DIHITUNG)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { label: 'Mean', val: '4.23 jam' },
                    { label: 'Median', val: '4 jam' },
                    { label: 'Min', val: '1 jam' },
                    { label: 'Max', val: '16 jam' },
                    { label: 'Range', val: '15 jam' },
                    { label: 'n', val: '35 siswa' },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>{label}</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-data)' }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <DraggableHistogram mode="FD" onSubmit={handleHistogramSubmit} />
            </div>
          </motion.div>
        )}

        {/* ── STEP 1: Multiple Choice Questions ── */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>
                  TAHAP B — ANALISIS DATA ({mcCurrentQ + 1}/{FD_MC_QUESTIONS.length})
                </div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Uji Pemahamanmu dari Histogram</h2>
              </div>

              {/* Progress */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {FD_MC_QUESTIONS.map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: '4px', borderRadius: '2px',
                    background: i < mcCurrentQ ? 'rgba(0,255,136,0.6)' : i === mcCurrentQ ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.3s',
                  }} />
                ))}
              </div>

              {/* Question */}
              <motion.div
                key={mcCurrentQ}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.7, fontWeight: 600, color: '#fff' }}>
                  {currentQ.question}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentQ.options.map((opt, i) => {
                    const isSelected = selectedAnswer === i
                    const isCorrect = isCurrentSubmitted && i === currentQ.correct
                    const isWrong = isCurrentSubmitted && isSelected && i !== currentQ.correct

                    let bg = 'rgba(255,255,255,0.03)'
                    let border = '1px solid rgba(255,255,255,0.08)'
                    let color = 'rgba(255,255,255,0.8)'
                    if (isCorrect) { bg = 'rgba(0,255,136,0.1)'; border = '1px solid rgba(0,255,136,0.4)'; color = '#00FF88' }
                    else if (isWrong) { bg = 'rgba(239,68,68,0.1)'; border = '1px solid rgba(239,68,68,0.35)'; color = '#f87171' }
                    else if (isSelected) { bg = 'rgba(59,130,246,0.1)'; border = '1px solid rgba(59,130,246,0.35)'; color = '#60a5fa' }

                    return (
                      <motion.button
                        key={i}
                        whileHover={!isCurrentSubmitted ? { scale: 1.01, x: 4 } : {}}
                        whileTap={!isCurrentSubmitted ? { scale: 0.99 } : {}}
                        onClick={() => handleMCSelect(i)}
                        disabled={isCurrentSubmitted}
                        style={{
                          width: '100%', padding: '12px 16px', borderRadius: '12px',
                          border, background: bg, color,
                          fontSize: '13px', fontWeight: 600, textAlign: 'left',
                          cursor: isCurrentSubmitted ? 'default' : 'pointer',
                          transition: 'all 0.2s', display: 'flex', gap: '10px', alignItems: 'center',
                        }}
                      >
                        <span style={{ minWidth: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>
                          {['A', 'B', 'C', 'D'][i]}
                        </span>
                        <span>{opt}</span>
                        {isCorrect && <span style={{ marginLeft: 'auto' }}>✅</span>}
                        {isWrong && <span style={{ marginLeft: 'auto' }}>❌</span>}
                      </motion.button>
                    )
                  })}
                </div>

                {/* Hint for FD on wrong */}
                <AnimatePresence>
                  {showHint && isCurrentSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)', fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}
                    >
                      <strong style={{ color: 'var(--accent)' }}>💡 DiRA: </strong>{currentQ.hint}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {!isCurrentSubmitted ? (
                    <button
                      className="game-btn game-btn-primary"
                      onClick={handleMCSubmit}
                      disabled={selectedAnswer === null}
                      style={{ flex: 1, opacity: selectedAnswer !== null ? 1 : 0.5 }}
                    >
                      Submit Jawaban →
                    </button>
                  ) : (
                    <button
                      className="game-btn game-btn-primary"
                      onClick={handleMCNext}
                      style={{ flex: 1 }}
                    >
                      {mcCurrentQ < FD_MC_QUESTIONS.length - 1 ? 'Lanjut Soal Berikutnya →' : '✅ Selesaikan Analisis →'}
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Booklet ── */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <DetektivBooklet mode="FD" onComplete={handleBookletComplete} />
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── STEP 2: Myth Busted Stamp (overlay) ── */}
      <AnimatePresence>
        {step === 2 && (
          <MythBustedStamp onComplete={handleMythBustedComplete} />
        )}
      </AnimatePresence>

      {/* DiRA guide for step 0 */}
      {step === 0 && showDira && diraMsg && (
        <DiRA message={diraMsg} onDismiss={() => setShowDira(false)} />
      )}

      {/* Game Over */}
      {gameOver && (
        <div className="game-over-screen">
          <div style={{ fontSize: '64px' }}>💀</div>
          <h2 style={{ fontSize: '28px', margin: 0 }}>Game Over</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            DiRA: "Jangan menyerah! Kamu pasti bisa 💪"
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="game-btn game-btn-primary"
              onClick={() => { useGameStore.setState({ lives: 4 }); setGameOver(false) }}
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
