'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useGameStore } from '@/lib/store/gameStore'
import DiRA from '../../../_components/DiRA'
import BadgeUnlock from '../../../_components/BadgeUnlock'
import MythBustedStamp from '../../../_components/MythBustedStamp'
import DetektivBooklet from '../../../_components/DetektivBooklet'
import VerdictScreen from '../../../_components/VerdictScreen'
import { BADGES, STATS } from '../../../_data/level1'
import { useRouter } from 'next/navigation'

const DraggableHistogram = dynamic(() => import('../../../_components/DraggableHistogram'), { ssr: false })

// Steps: 0=Histogram(guided), 1=Hasil Analisis, 1.5=Verifikasi Berita, 2=MythBusted, 3=Materi
type GameStep = 0 | 1 | 1.5 | 2 | 3

interface PendingBadge { icon: string; name: string; desc: string; id: string }

export default function FDPath() {
  const router = useRouter()
  const { addXP, isCompleted, completeLevel, unlockBadge, incrementMistake, mistakeCount, sessionStartTime } = useGameStore()

  const [step, setStep] = useState<GameStep>(0)
  const [pendingBadges, setPendingBadges] = useState<PendingBadge[]>([])
  // Track if isCompleted came from this active session (not stale persist)
  const sessionActiveRef = useRef(false)
  useEffect(() => { sessionActiveRef.current = true }, [])

  // DiRA state
  const [diraMsg, setDiraMsg] = useState<string | null>('Yuk pindahkan data screen time 35 siswa ke histogram! Aku sudah bantu masukkan beberapa data dari tiap kelas sebagai contoh. Tinggal drag 26 data tersisa ke kelas yang sesuai ya! 😉')
  const [showDira, setShowDira] = useState(false)

  // Flash wrong overlay (FD only — no life lost)
  const [flashWrong, setFlashWrong] = useState(false)

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
      addXP(25, 'Menyusun histogram terbimbing dengan benar', 0)
      setDiraMsg('Luar biasa! Kamu berhasil menyusun histogram dengan benar. 📊 Sekarang, yuk kita amati statistik dasar dari data tersebut di Tahap B ini! Rata-rata waktu bermain siswa ternyata hanya 7.06 jam, yang membuktikan klaim rata-rata > 8 jam adalah tidak benar! 😉')
      setShowDira(true)
      setStep(1)
    } else {
      // FD: hanya red flash, tanpa life lost — eksplorasi mandiri
      setFlashWrong(true)
      setTimeout(() => setFlashWrong(false), 600)
      setDiraMsg('Oops, ada data yang masuk ke kelas yang salah nih! Coba periksa lagi — ingat interval: 1-4, 5-8, 9-12, 13-16, 17-20 jam. Angka yang terlalu besar atau terlalu kecil berarti harus masuk ke kelas yang berbeda. Semangat! 💪')
      setShowDira(true)
    }
  }

  // ── STEP 1: Analisis selesai → ke Verifikasi Berita ──
  const handleProceedToVerification = () => {
    if (submitting) return
    setSubmitting(true)
    addXP(20, 'Analisis distribusi FD tepat', 1)
    setShowDira(false)
    setTimeout(() => {
      setStep(1.5)
      setSubmitting(false)
    }, 300)
  }

  // ── STEP 1.5: Verifikasi benar → ke MythBusted ──
  const handleVerificationCorrect = () => {
    addXP(15, 'Verifikasi berita benar', 1)
    awardBadge(BADGES.DETECTIVE)
    if (mistakeCount === 0) awardBadge(BADGES.PERFECT)

    const initialTime = 900
    const elapsed = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : initialTime
    if (elapsed < initialTime * 0.5) awardBadge(BADGES.SPEED)

    awardBadge(BADGES.MYTHBUST)
    setTimeout(() => setStep(2), 400)
  }

  // ── STEP 1.5: Verifikasi salah → hint dari DiRA ──
  const handleVerificationWrong = () => {
    incrementMistake()
    setDiraMsg(`Hmm, perhatikan mean = ${STATS.mean} jam. Apakah itu lebih dari 8 jam? 🤔`)
    setShowDira(true)
  }

  // ── STEP 2: MythBusted complete → Booklet ──
  const handleMythBustedComplete = () => setStep(3)

  // ── STEP 3: Booklet complete → finish level ──
  const handleBookletComplete = () => {
    addXP(15, 'Menyelesaikan Buku Saku Detektif', 3)
    completeLevel(1)
  }

  useEffect(() => {
    if (isCompleted && sessionActiveRef.current) {
      const t = setTimeout(() => router.push('/siswa/game/results/1'), 1200)
      return () => clearTimeout(t)
    }
  }, [isCompleted, router])

  const STEP_LABELS = ['Histogram', 'Analisis', 'Verifikasi', 'Selesai']
  const displayStep = step === 0 ? 0 : step === 1 ? 1 : step === 1.5 ? 2 : 3

  return (
    <div
      className={step === 0 ? 'tahap-a-fullscreen tahap-a-container' : undefined}
      style={step === 0 
        ? undefined
        : { maxWidth: '820px', margin: '0 auto', padding: '24px 16px', paddingBottom: '120px' }}
    >

      {/* Step indicator */}
      <div className="step-indicator" style={{ marginBottom: step === 0 ? '8px' : '24px', flexShrink: 0 }}>
        {STEP_LABELS.map((label, i) => (
          <div
            key={i}
            className={`step-dot ${i === displayStep ? 'active' : i < displayStep ? 'done' : ''}`}
            title={label}
          />
        ))}
      </div>

      {/* Red flash overlay — FD only, no life lost */}
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

      <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <AnimatePresence mode="wait">

        {/* ── STEP 0: Histogram Terbimbing ── */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div className="game-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minHeight: 0 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>Lengkapi histogram</h2>
                </div>
                <DraggableHistogram mode="FD" onSubmit={handleHistogramSubmit} />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 1: Text Analysis (FD) ── */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>
                  TAHAP B — ANALISIS DISTRIBUSI &amp; VERDICT
                </div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Hasil Analisis &amp; Statistik Dasar</h2>
              </div>

              {/* Mentor dialog */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '16px', borderRadius: '14px', background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.2)' }}>
                <div style={{ fontSize: '36px', flexShrink: 0 }}>🕵️</div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 800, marginBottom: '6px' }}>DIALOG MENTOR:</div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                    &quot;Luar biasa, Detektif! Berdasarkan histogram hasil rekonstruksimu dan data statistik dasar di bawah, kita dapat melihat bahwa rata-rata (Mean) penggunaan media sosial siswa adalah <strong style={{ color: 'var(--accent)' }}>{STATS.mean} jam</strong>, bukan lebih dari 8 jam seperti klaim viral tersebut.&quot;
                  </p>
                  <p style={{ margin: '10px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                    💡 Terlihat bahwa mayoritas siswa (<strong style={{ color: '#3b82f6' }}>25 dari 35 siswa atau 71.4%</strong>) menggunakannya selama <strong>8 jam atau kurang</strong> sehari. Nilai ekstrim seperti 17 &amp; 18 jam (outlier) lah yang menarik nilai rata-rata menjadi naik.
                  </p>
                </div>
              </div>

              {/* Histogram & Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', alignItems: 'stretch' }} className="tahap-b-reference-grid">
                {/* Left: Histogram */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--game-border)', borderRadius: '14px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>📊 HISTOGRAM HASIL TAHAP A</div>
                  <DraggableHistogram mode="FD" readOnly={true} />
                </div>

                {/* Right: Pre-computed stats */}
                <div style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid var(--game-border-accent)', borderRadius: '14px', padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
                      <div key={label} style={{ textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
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

        {/* ── STEP 1.5: Verifikasi Berita (FD — guided) ── */}
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
                guidedMode={true}
              />
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
      </div>{/* /flex-fill wrapper */}

      {/* ── STEP 2: Myth Busted Stamp (overlay) ── */}
      <AnimatePresence>
        {step === 2 && (
          <MythBustedStamp onComplete={handleMythBustedComplete} />
        )}
      </AnimatePresence>

      {/* DiRA guide for step 0 & 1 */}
      {(step === 0 || step === 1) && showDira && diraMsg && (
        <DiRA message={diraMsg} onDismiss={() => setShowDira(false)} />
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
