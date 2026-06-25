'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useGameStore } from '@/lib/store/gameStore'
import BadgeUnlock from '../../../_components/BadgeUnlock'
import MythBustedStamp from '../../../_components/MythBustedStamp'
import VerdictScreen from '../../../_components/VerdictScreen'
import { BADGES, STATS } from '../../../_data/level1'
import { useRouter } from 'next/navigation'

const DraggableHistogram = dynamic(() => import('../../../_components/DraggableHistogram'), { ssr: false })

// Steps: 0=Histogram, 1=Hasil Analisis, 1.5=Verifikasi Berita, 2=MythBusted, 3=Materi Booklet
// Gunakan number karena ada step 1.5
type GameStep = 0 | 1 | 1.5 | 2 | 3

interface PendingBadge { icon: string; name: string; desc: string; id: string }

export default function FIPath() {
  const router = useRouter()
  const { addXP, isCompleted, completeLevel, unlockBadge, incrementMistake, mistakeCount, sessionStartTime, xp } = useGameStore()

  const [step, setStep] = useState<GameStep>(0)
  const [pendingBadges, setPendingBadges] = useState<PendingBadge[]>([])
  // Track if isCompleted came from this active session (not stale persist)
  const sessionActiveRef = useRef(false)
  useEffect(() => { sessionActiveRef.current = true }, [])

  // Tahap B state
  const [submitting, setSubmitting] = useState(false)

  const awardBadge = useCallback((badge: typeof BADGES[keyof typeof BADGES]) => {
    unlockBadge(badge.id)
    setPendingBadges(prev => [...prev, badge])
  }, [unlockBadge])

  const dismissBadge = () => setPendingBadges(prev => prev.slice(1))

  // ── STEP 0: Histogram submitted ──
  const handleHistogramSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      addXP(30, 'Menyusun histogram dengan benar', 0)
      setStep(1)
    } else {
      incrementMistake()
    }
  }

  // ── STEP 1: Analisis selesai → ke Verifikasi Berita ──
  const handleProceedToVerification = () => {
    addXP(20, 'Analisis distribusi tepat', 1)
    setStep(1.5)
  }

  // ── STEP 1.5: Verifikasi benar → ke MythBusted ──
  const handleVerificationCorrect = () => {
    addXP(15, 'Verifikasi berita benar', 1)
    awardBadge(BADGES.CRITICAL)
    if (mistakeCount === 0) awardBadge(BADGES.PERFECT)

    // Speed bonus
    const initialTime = 600
    const elapsed = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : initialTime
    if (elapsed < initialTime * 0.5) awardBadge(BADGES.SPEED)

    // FI ×1.5 multiplier
    const currentXP = xp + 35
    const bonus = Math.floor(currentXP * 0.5)
    addXP(bonus, 'FI Multiplier ×1.5', 1)
    awardBadge(BADGES.MYTHBUST)

    setTimeout(() => {
      setStep(2)
      setSubmitting(false)
    }, 400)
  }

  // ── STEP 1.5: Verifikasi salah → coba lagi (tidak kembali ke step sebelumnya) ──
  const handleVerificationWrong = () => {
    incrementMistake()
  }

  // ── STEP 2: Myth Busted complete → finish level ──
  const handleMythBustedComplete = () => {
    addXP(15, 'Menyelesaikan Level 1', 2)
    completeLevel(1)
  }

  useEffect(() => {
    if (isCompleted && sessionActiveRef.current) {
      const timer = setTimeout(() => router.push('/siswa/game/results/1'), 1200)
      return () => clearTimeout(timer)
    }
  }, [isCompleted, router])

  const STEP_LABELS = ['Histogram', 'Analisis', 'Verifikasi', 'Selesai']
  const displayStep = step === 0 ? 0 : step === 1 ? 1 : step === 1.5 ? 2 : 3

  return (
    <div
      className={step === 0 ? 'tahap-a-fullscreen tahap-a-container' : undefined}
      style={step === 0 
        ? { position: 'relative' }
        : { maxWidth: '820px', margin: '0 auto', padding: '24px 16px', paddingBottom: '40px', position: 'relative' }}
    >

      {/* Step indicator */}
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

        {/* ── STEP 0: Histogram Builder ── */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div className="game-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minHeight: 0 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>Lengkapi histogram</h2>
                </div>
                <DraggableHistogram mode="FI" onSubmit={handleHistogramSubmit} />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 1: Text Analysis ── */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>
                  TAHAP B — ANALISIS DISTRIBUSI &amp; VERDICT
                </div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Hasil Analisis &amp; Statistik Dasar</h2>
              </div>


              {/* Histogram & Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', alignItems: 'stretch' }} className="tahap-b-reference-grid">
                {/* Left: Histogram */}
                <div style={{ background: 'rgba(217,119,6,0.03)', border: '1px solid var(--game-border)', borderRadius: '14px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>📊 HISTOGRAM HASIL TAHAP A</div>
                  <DraggableHistogram mode="FI" readOnly={true} />
                </div>

                {/* Right: Pre-computed stats */}
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

        {/* ── STEP 1.5: Verifikasi Berita ── */}
        {step === 1.5 && (
          <motion.div key="step15" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
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
                guidedMode={false}
              />
            </div>
          </motion.div>
        )}


      </AnimatePresence>
      </div>{/* /flex-fill wrapper */}

      {/* ── STEP 2: Myth Busted Stamp (fullscreen overlay) ── */}
      <AnimatePresence>
        {step === 2 && (
          <MythBustedStamp onComplete={handleMythBustedComplete} />
        )}
      </AnimatePresence>



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
