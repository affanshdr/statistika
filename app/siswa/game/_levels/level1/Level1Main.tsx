'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store/gameStore'
import Cutscene from './components/Cutscene'
import PregameFormula from './components/PregameFormula'
import NPath from './components/NPath'
import IntervalKelasPhase from './components/IntervalKelasPhase'
import VerdictScreen from './components/VerdictScreen'
import MythBustedStamp from './components/MythBustedStamp'
import BadgeUnlock from '@/app/siswa/game/_components/BadgeUnlock'
import { BADGES, getLevel1Data } from '@/app/siswa/game/_data/level1'

const DraggableHistogram = dynamic(() => import('./components/DraggableHistogram'), { ssr: false })

type GameStep = 0 | 1 | 2 | 3 | 4
interface PendingBadge { icon: string; name: string; desc: string; id: string }

interface Level1MainProps {
  studentId?: string
  studentName?: string
  demoMode?: boolean
  demoStep?: string | null
  onHeaderSkip?: () => void
}

export default function Level1Main({
  studentId,
  studentName,
  demoMode = false,
  demoStep = null,
}: Level1MainProps) {
  const router = useRouter()
  const {
    addXP,
    isCompleted,
    completeLevel,
    unlockBadge,
    incrementMistake,
    mistakeCount,
    sessionStartTime,
    xp,
    level1Dataset,
  } = useGameStore()

  const { STATS } = getLevel1Data(level1Dataset)

  const [phase, setPhase] = useState<'cutscene' | 'formula' | 'game'>(
    demoMode ? (demoStep === 'interval' || demoStep === 'histogram' ? 'game' : 'formula') : 'cutscene'
  )
  const [pregameStep, setPregameStep] = useState<'exploration' | 'minmax' | 'panjangkelas'>(
    demoMode ? (demoStep === 'minmax' ? 'minmax' : 'exploration') : 'exploration'
  )

  const [step, setStep] = useState<GameStep>(
    demoMode ? (demoStep === 'histogram' ? 1 : 0) : 0
  )
  const [pendingBadges, setPendingBadges] = useState<PendingBadge[]>([])
  const [submitting, setSubmitting] = useState(false)
  const sessionActiveRef = useRef(false)

  useEffect(() => { sessionActiveRef.current = true }, [])

  useEffect(() => {
    const handleSkipGameStep = () => {
      setStep(prev => (prev < 4 ? (prev + 1) as GameStep : prev))
    }
    window.addEventListener('skip-game-step', handleSkipGameStep)
    return () => window.removeEventListener('skip-game-step', handleSkipGameStep)
  }, [])

  const awardBadge = useCallback((badge: typeof BADGES[keyof typeof BADGES]) => {
    unlockBadge(badge.id)
    setPendingBadges(prev => [...prev, badge])
  }, [unlockBadge])

  const dismissBadge = () => setPendingBadges(prev => prev.slice(1))

  const handleIntervalSubmit = () => {
    setStep(1)
  }

  const handleHistogramSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      addXP(30, 'Menyusun histogram dengan benar', 1)
      setStep(2)
    } else {
      incrementMistake()
    }
  }

  const handleProceedToVerification = () => {
    addXP(20, 'Analisis distribusi tepat', 2)
    setStep(3)
  }

  const handleVerificationCorrect = () => {
    addXP(15, 'Verifikasi berita benar', 3)
    awardBadge(BADGES.CRITICAL)
    if (mistakeCount === 0) awardBadge(BADGES.PERFECT)

    const initialTime = 600
    const elapsed = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : initialTime
    if (elapsed < initialTime * 0.5) awardBadge(BADGES.SPEED)

    awardBadge(BADGES.MYTHBUST)

    setTimeout(() => {
      setStep(4)
      setSubmitting(false)
    }, 400)
  }

  const handleVerificationWrong = () => {
    incrementMistake()
  }

  const handleMythBustedComplete = () => {
    addXP(15, 'Menyelesaikan Level 1', 4)
    completeLevel(1)
  }

  useEffect(() => {
    if (isCompleted && sessionActiveRef.current) {
      const timer = setTimeout(() => router.push('/siswa/game/results/1'), 1200)
      return () => clearTimeout(timer)
    }
  }, [isCompleted, router])

  const STEP_LABELS = ['Batas Kelas', 'Histogram', 'Analisis', 'Verifikasi', 'Selesai']
  const displayStep = step

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Phase 1: Cutscene */}
      <AnimatePresence>
        {phase === 'cutscene' && (
          <Cutscene
            teamId={null}
            studentId={studentId}
            onComplete={() => setPhase('formula')}
          />
        )}
      </AnimatePresence>

      {/* Phase 1.5: Pregame Formula */}
      {phase === 'formula' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            background: 'var(--game-bg)', color: 'var(--text-primary)',
            padding: '16px 20px', height: '100%', overflow: pregameStep === 'exploration' ? 'hidden' : 'auto',
          }}
        >
          {pregameStep === 'exploration' && (
            <NPath
              isFD={false}
              onComplete={() => setPregameStep('minmax')}
              demoMode={demoMode}
            />
          )}

          {pregameStep === 'minmax' && (
            <PregameFormula
              teamId={null}
              studentId={studentId}
              initialSub={demoMode && demoStep === 'rentang' ? 'rentang' : 'intro'}
              onComplete={() => setPregameStep('panjangkelas')}
            />
          )}

          {pregameStep === 'panjangkelas' && (
            <PregameFormula
              teamId={null}
              studentId={studentId}
              initialSub="panjang-kelas"
              onComplete={async () => {
                setPhase('game')
              }}
            />
          )}
        </motion.div>
      )}

      {/* Phase 2: Game UI */}
      {phase === 'game' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '820px',
            margin: '0 auto',
            padding: '24px 16px',
            paddingBottom: '40px',
            width: '100%',
          }}
        >
          <div className="step-indicator" style={{ marginBottom: step === 0 ? '8px' : '24px', flexShrink: 0 }}>
            {STEP_LABELS.map((label, i) => (
              <div
                key={i}
                className={`step-dot ${i === displayStep ? 'active' : i < displayStep ? 'done' : ''}`}
                title={label}
                style={{ position: 'relative' }}
              />
            ))}
          </div>

          <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <AnimatePresence mode="wait">

              {/* STEP 0: Menyusun Interval Kelas */}
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <IntervalKelasPhase isFD={false} onSubmit={handleIntervalSubmit} demoMode={demoMode} />
                </motion.div>
              )}

              {/* STEP 1: Histogram Builder */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <div className="game-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minHeight: 0 }}>
                      <div>
                        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>Lengkapi histogram</h2>
                      </div>
                      <DraggableHistogram onSubmit={handleHistogramSubmit} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Text Analysis */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>
                        TAHAP B — ANALISIS DISTRIBUSI &amp; VERDICT
                      </div>
                      <h2 style={{ margin: 0, fontSize: '20px' }}>Hasil Analisis &amp; Statistik Dasar</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', alignItems: 'stretch' }} className="tahap-b-reference-grid">
                      <div style={{ background: 'rgba(217,119,6,0.03)', border: '1px solid var(--game-border)', borderRadius: '14px', padding: '12px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>📊 HISTOGRAM HASIL TAHAP A</div>
                        <DraggableHistogram readOnly={true} />
                      </div>

                      <div style={{ background: 'rgba(217,119,6,0.04)', border: '1px solid var(--game-border-accent)', borderRadius: '14px', padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, marginBottom: '10px', letterSpacing: '1px' }}>📈 STATISTIK DASAR DISTRIBUSI</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                          {[
                            { label: 'Mean (Rata-rata)', val: `${STATS.mean} jam` },
                            { label: 'Median', val: `${STATS.median} jam` },
                            { label: 'Min', val: `${STATS.min} jam` },
                            { label: 'Max', val: `${STATS.max} jam` },
                            { label: 'Range (Jangkauan)', val: `${STATS.range} jam` },
                            { label: 'n (Sampel)', val: `${STATS.n} siswa` },
                          ].map(({ label, val }) => (
                            <div key={label} style={{ textAlign: 'center', padding: '8px', background: 'rgba(217,119,6,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>{label}</div>
                              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-data)', marginTop: '4px' }}>{val}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      className="game-btn game-btn-primary"
                      onClick={handleProceedToVerification}
                      disabled={submitting}
                      style={{ width: '100%', marginTop: '8px' }}
                    >
                      Lanjut: Verifikasi Berita →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Verifikasi Berita */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>
                        TAHAP C — VERIFIKASI BERITA
                      </div>
                      <h2 style={{ margin: 0, fontSize: '20px' }}>Berdasarkan Datamu — Benar atau Hoaks?</h2>
                    </div>
                    <VerdictScreen
                      onCorrect={handleVerificationCorrect}
                      onWrong={handleVerificationWrong}
                      guidedMode={true}
                    />
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          <AnimatePresence>
            {step === 4 && (
              <MythBustedStamp onComplete={handleMythBustedComplete} />
            )}
          </AnimatePresence>

          {pendingBadges.length > 0 && (
            <BadgeUnlock
              icon={pendingBadges[0].icon}
              name={pendingBadges[0].name}
              desc={pendingBadges[0].desc}
              onDone={dismissBadge}
            />
          )}
        </motion.div>
      )}
    </div>
  )
}
