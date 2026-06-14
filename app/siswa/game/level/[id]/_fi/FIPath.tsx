'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useGameStore } from '@/lib/store/gameStore'
import BadgeUnlock from '../../../_components/BadgeUnlock'
import MythBustedStamp from '../../../_components/MythBustedStamp'
import DetektivBooklet from '../../../_components/DetektivBooklet'
import { BADGES, CRITICAL_KEYWORDS_POSITIVE, CRITICAL_KEYWORDS_EVIDENCE, STATS } from '../../../_data/level1'
import { useRouter } from 'next/navigation'

const DraggableHistogram = dynamic(() => import('../../../_components/DraggableHistogram'), { ssr: false })

// Steps: 0 = Histogram, 1 = Text Analysis (Tahap B), 2 = MythBusted, 3 = Materi Booklet
type GameStep = 0 | 1 | 2 | 3

interface PendingBadge { icon: string; name: string; desc: string; id: string }

function checkAnalysisAnswer(text: string): { pass: boolean; missingPositive: boolean; missingEvidence: boolean } {
  const lower = text.toLowerCase()
  const hasPositive = CRITICAL_KEYWORDS_POSITIVE.some(kw => lower.includes(kw))
  const hasEvidence = CRITICAL_KEYWORDS_EVIDENCE.some(kw => lower.includes(kw))
  return { pass: hasPositive && hasEvidence, missingPositive: !hasPositive, missingEvidence: !hasEvidence }
}

export default function FIPath() {
  const router = useRouter()
  const { addXP, isCompleted, completeLevel, unlockBadge, incrementMistake, mistakeCount, sessionStartTime, xp } = useGameStore()

  const [step, setStep] = useState<GameStep>(0)
  const [pendingBadges, setPendingBadges] = useState<PendingBadge[]>([])
  // Track if isCompleted came from this active session (not stale persist)
  const sessionActiveRef = useRef(false)
  useEffect(() => { sessionActiveRef.current = true }, [])

  // Tahap B state
  const [analysisText, setAnalysisText] = useState('')
  const [analysisResult, setAnalysisResult] = useState<null | { pass: boolean; missingPositive: boolean; missingEvidence: boolean }>(null)
  const [analysisAttempts, setAnalysisAttempts] = useState(0)

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

  // ── STEP 1: Text analysis submit ──
  const handleAnalysisSubmit = () => {
    if (analysisText.trim().length < 20) return
    const result = checkAnalysisAnswer(analysisText)
    setAnalysisResult(result)
    setAnalysisAttempts(prev => prev + 1)

    if (result.pass) {
      addXP(30, 'Analisis distribusi tepat', 1)
      awardBadge(BADGES.CRITICAL)
      if (mistakeCount === 0) awardBadge(BADGES.PERFECT)

      // Speed bonus
      const initialTime = 600
      const elapsed = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : initialTime
      if (elapsed < initialTime * 0.5) awardBadge(BADGES.SPEED)

      // FI ×1.5 multiplier: add 50% of XP earned so far
      const currentXP = xp + 60 // 30 histogram + 30 analysis = 60 before bonus
      const bonus = Math.floor(currentXP * 0.5)
      addXP(bonus, 'FI Multiplier ×1.5', 1)

      awardBadge(BADGES.MYTHBUST)

      // Show MYTH BUSTED after brief pause
      setTimeout(() => setStep(2), 500)
    }
    // If wrong: stay on step 1 (FI: no life lost, just try again)
  }

  // ── STEP 2: Myth Busted complete → go to materi ──
  const handleMythBustedComplete = () => {
    setStep(3)
  }

  // ── STEP 3: Booklet complete → finish level ──
  const handleBookletComplete = () => {
    addXP(15, 'Menyelesaikan Buku Saku Detektif', 3)
    completeLevel(1)
  }

  useEffect(() => {
    if (isCompleted && sessionActiveRef.current) {
      const timer = setTimeout(() => router.push('/siswa/game/results/1'), 1200)
      return () => clearTimeout(timer)
    }
  }, [isCompleted, router])

  const STEP_LABELS = ['Histogram', 'Analisis', 'Buku Saku']
  const displayStep = step >= 2 ? 2 : step // steps 2 & 3 both map to visual step 2 (materi)

  return (
    <div className={step === 0 ? 'tahap-a-fullscreen' : undefined} style={step !== 0 ? { maxWidth: '820px', margin: '0 auto', padding: '24px 16px', paddingBottom: '40px' } : undefined}>

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

      <div style={{ width: '100%' }}>
      <AnimatePresence mode="wait">

        {/* ── STEP 0: Histogram Builder ── */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} style={{ width: '100%' }}>
            <div className="game-card">
              <div className="tahap-a-grid">
                {/* Left Column: Description & Metadata */}
                <div className="tahap-a-left-col">
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>
                      TAHAP A — HISTOGRAM BUILDER
                    </div>
                    <h2 style={{ margin: 0, fontSize: '20px' }}>Kelompokkan 35 Data Screen Time</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px', lineHeight: 1.6 }}>
                      Drag atau klik data dari kolam kiri ke kelas interval yang tepat pada histogram kanan. Data dikelompokkan dalam interval lebar 4 jam.
                    </p>
                  </div>

                  {/* Context: viral claim */}
                  <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                    🚨 <strong style={{ color: '#f87171' }}>Klaim Viral:</strong> &quot;Remaja Indonesia rata-rata &gt;8 jam/hari di medsos!&quot; — Buktikan dengan data!
                  </div>

                  {/* FI tip about histogram */}
                  <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                    📊 <strong style={{ color: '#60a5fa' }}>Ingat:</strong> Histogram berbeda dari diagram batang! Balok-balok histogram harus{' '}
                    <strong>saling berdempetan</strong> (tanpa celah) karena datanya kontinu (menyambung).
                  </div>
                </div>

                {/* Right Column: Challenge */}
                <div className="tahap-a-right-col">
                  <DraggableHistogram mode="FI" onSubmit={handleHistogramSubmit} />
                </div>
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
                <h2 style={{ margin: 0, fontSize: '20px' }}>The Verdict: Apakah Klaim Ini Valid?</h2>
              </div>

              {/* Mentor dialog */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '16px', borderRadius: '14px', background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.2)' }}>
                <div style={{ fontSize: '36px', flexShrink: 0 }}>🕵️</div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 800, marginBottom: '6px' }}>DIALOG MENTOR:</div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                    &quot;Detektif, perhatikan baik-baik histogram yang sudah kamu bangun dari data 35 siswa nyata ini. Sekarang, bandingkan dengan postingan viral yang mengklaim bahwa &apos;Remaja Indonesia rata-rata menghabiskan{' '}
                    <strong style={{ color: '#f87171' }}>lebih dari 8 jam sehari</strong> di medsos&apos;.&quot;
                  </p>
                  <p style={{ margin: '10px 0 0', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                    ❓ Apakah klaim postingan viral tersebut <strong style={{ color: '#f87171' }}>valid</strong> dan didukung oleh data? Berikan alasan analisis statistikamu secara singkat!
                  </p>
                </div>
              </div>

              {/* Histogram & Mini Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', alignItems: 'stretch' }} className="tahap-b-reference-grid">
                {/* Left: Histogram */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--game-border)', borderRadius: '14px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>📊 HISTOGRAM HASIL TAHAP A</div>
                  <DraggableHistogram mode="FI" readOnly={true} />
                </div>

                {/* Right: Mini-stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--game-border)', borderRadius: '14px', padding: '14px', justifyContent: 'center' }}>
                  {[
                    { label: 'Mean', val: `${STATS.mean} jam`, color: '#F59E0B' },
                    { label: 'Median', val: `${STATS.median} jam`, color: '#00FF88' },
                    { label: '8 Jam atau Kurang', val: '25/35 = 71.4%', color: '#3B82F6' },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>{label}</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color, fontFamily: 'var(--font-data)' }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text input */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                  ANALISIS JAWABANMU:
                </label>
                <textarea
                  value={analysisText}
                  onChange={e => { setAnalysisText(e.target.value); setAnalysisResult(null) }}
                  placeholder={`Contoh: "Tidak valid, karena mayoritas siswa (24 orang) hanya bermain 1-4 jam sehari. Angka 8 jam ke atas hanya beberapa orang saja (outlier/pencilan), jadi tidak bisa mewakili rata-rata seluruh remaja..."`}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    minHeight: '120px', padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '14px', lineHeight: 1.6, resize: 'vertical',
                    outline: 'none', transition: 'border-color 0.2s',
                    fontFamily: 'var(--font-sans, sans-serif)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  {analysisText.length} karakter — minimal ~20 karakter
                </div>
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {analysisResult && !analysisResult.pass && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', fontSize: '13px', lineHeight: 1.6 }}
                  >
                    <div style={{ fontWeight: 800, color: '#f87171', marginBottom: '8px' }}>
                      ⚠️ Jawabanmu belum lengkap — coba lagi!
                    </div>
                    {analysisResult.missingPositive && (
                      <p style={{ margin: '0 0 6px', color: 'rgba(255,255,255,0.7)' }}>
                        💡 <strong>Petunjuk 1:</strong> Sertakan penilaian apakah klaim tersebut &quot;tidak valid&quot;, &quot;salah&quot;, &quot;misleading&quot;, atau &quot;tidak benar&quot;.
                      </p>
                    )}
                    {analysisResult.missingEvidence && (
                      <p style={{ margin: '0 0 6px', color: 'rgba(255,255,255,0.7)' }}>
                        💡 <strong>Petunjuk 2:</strong> Dukung dengan bukti data: kata kunci seperti &quot;mayoritas&quot;, &quot;outlier&quot;, &quot;menceng&quot;, &quot;71%&quot;, atau &quot;distribusi&quot; akan memperkuat analisismu.
                      </p>
                    )}
                    {analysisAttempts >= 2 && (
                      <p style={{ margin: '6px 0 0', color: 'rgba(0,255,136,0.8)', fontStyle: 'italic' }}>
                        🔍 Contoh jawaban: &quot;Tidak valid, karena mayoritas (13 siswa / 37.1%) hanya bermain 1-4 jam. Nilai 17 dan 18 jam adalah outlier yang membuat mean tampak lebih tinggi. Distribusi data menceng kanan.&quot;
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                className="game-btn game-btn-primary"
                onClick={handleAnalysisSubmit}
                disabled={analysisText.trim().length < 20}
                style={{ opacity: analysisText.trim().length >= 20 ? 1 : 0.5 }}
              >
                Submit Analisis →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Booklet ── */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <DetektivBooklet mode="FI" onComplete={handleBookletComplete} />
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
