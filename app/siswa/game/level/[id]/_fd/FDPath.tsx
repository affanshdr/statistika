'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useGameStore } from '@/lib/store/gameStore'
import DiRA from '../../../_components/DiRA'
import BadgeUnlock from '../../../_components/BadgeUnlock'
import MythBustedStamp from '../../../_components/MythBustedStamp'
import DetektivBooklet from '../../../_components/DetektivBooklet'
import { BADGES, CRITICAL_KEYWORDS_POSITIVE, FD_CRITICAL_KEYWORDS_EVIDENCE, STATS } from '../../../_data/level1'
import { useRouter } from 'next/navigation'

const DraggableHistogram = dynamic(() => import('../../../_components/DraggableHistogram'), { ssr: false })

// Steps: 0 = Histogram (guided), 1 = Text Analysis, 2 = MythBusted, 3 = Materi Booklet
type GameStep = 0 | 1 | 2 | 3

interface PendingBadge { icon: string; name: string; desc: string; id: string }

function checkAnalysisFD(text: string): { pass: boolean; missingPositive: boolean; missingEvidence: boolean } {
  const lower = text.toLowerCase()
  const hasPositive = CRITICAL_KEYWORDS_POSITIVE.some(kw => lower.includes(kw))
  // FD: threshold lebih rendah — cukup 1 kata bukti dari daftar yang lebih luas
  const hasEvidence = FD_CRITICAL_KEYWORDS_EVIDENCE.some(kw => lower.includes(kw))
  return { pass: hasPositive && hasEvidence, missingPositive: !hasPositive, missingEvidence: !hasEvidence }
}

export default function FDPath() {
  const router = useRouter()
  const { addXP, isCompleted, completeLevel, unlockBadge, incrementMistake, mistakeCount, sessionStartTime } = useGameStore()

  const [step, setStep] = useState<GameStep>(0)
  const [pendingBadges, setPendingBadges] = useState<PendingBadge[]>([])
  // Track if isCompleted came from this active session (not stale persist)
  const sessionActiveRef = useRef(false)
  useEffect(() => { sessionActiveRef.current = true }, [])

  // DiRA state (step 0)
  const [diraMsg, setDiraMsg] = useState<string | null>('Yuk pindahkan data screen time 35 siswa ke histogram! Data kelas 1–4 (13 siswa) sudah aku masukkan otomatis sebagai bantuan. Tinggal drag 22 data tersisa ya! 😉')
  const [showDira, setShowDira] = useState(false)

  // Flash wrong overlay (FD only — no life lost)
  const [flashWrong, setFlashWrong] = useState(false)

  // Text analysis state (step 1)
  const [analysisText, setAnalysisText] = useState('')
  const [analysisResult, setAnalysisResult] = useState<null | { pass: boolean; missingPositive: boolean; missingEvidence: boolean }>(null)
  const [analysisAttempts, setAnalysisAttempts] = useState(0)
  // DiRA hint for step 1
  const [showAnalysisDira, setShowAnalysisDira] = useState(false)

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
      // FD: hanya red flash, tanpa life lost — eksplorasi mandiri
      setFlashWrong(true)
      setTimeout(() => setFlashWrong(false), 600)
      setDiraMsg('Oops, ada data yang masuk ke kelas yang salah nih! Coba periksa lagi — ingat interval: 1-4, 5-8, 9-12, 13-16, 17-20 jam. Angka yang terlalu besar atau terlalu kecil berarti harus masuk ke kelas yang berbeda. Semangat! 💪')
      setShowDira(true)
    }
  }

  // ── STEP 1: Text Analysis ──
  const handleAnalysisSubmit = () => {
    if (analysisText.trim().length < 15) return
    const result = checkAnalysisFD(analysisText)
    setAnalysisResult(result)
    const attempts = analysisAttempts + 1
    setAnalysisAttempts(attempts)

    if (result.pass) {
      addXP(25, 'Analisis distribusi FD tepat', 1)
      awardBadge(BADGES.DETECTIVE)
      if (mistakeCount === 0) awardBadge(BADGES.PERFECT)

      // Speed bonus
      const initialTime = 900
      const elapsed = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : initialTime
      if (elapsed < initialTime * 0.5) awardBadge(BADGES.SPEED)

      awardBadge(BADGES.MYTHBUST)
      setTimeout(() => setStep(2), 500)
    } else {
      // FD: setelah gagal pertama, DiRA langsung aktif memberi hint
      if (attempts >= 1) setShowAnalysisDira(true)
      incrementMistake()
    }
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

  const STEP_LABELS = ['Histogram', 'Analisis', 'Buku Saku']
  const displayStep = step >= 2 ? 2 : step

  return (
    <div className={step === 0 ? 'tahap-a-fullscreen' : undefined} style={step !== 0 ? { maxWidth: '820px', margin: '0 auto', padding: '24px 16px', paddingBottom: '120px' } : undefined}>

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

      <div style={{ width: '100%' }}>
      <AnimatePresence mode="wait">

        {/* ── STEP 0: Histogram Terbimbing ── */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} style={{ width: '100%' }}>
            <div className="game-card">
              <div className="tahap-a-grid">
                {/* Left Column: Description & Agent Dialogue */}
                <div className="tahap-a-left-col">
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>
                      TAHAP A — HISTOGRAM TERBIMBING
                    </div>
                    <h2 style={{ margin: 0, fontSize: '20px' }}>Lengkapi Histogram</h2>
                  </div>

                  {/* DiRA Agent Speech Bubble Card */}
                  <div style={{ 
                    display: 'flex', gap: '14px', alignItems: 'flex-start', 
                    padding: '16px', borderRadius: '16px', 
                    background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.2)',
                    boxShadow: '0 4px 20px rgba(0,255,136,0.02)'
                  }}>
                    {/* DiRA Avatar */}
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: '50%', 
                      border: '2px solid var(--accent)', boxShadow: 'var(--accent-glow)',
                      overflow: 'hidden', background: 'var(--game-card)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <img
                        src="/dira-avatar.png"
                        alt="Dira"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, marginBottom: '6px', letterSpacing: '0.5px' }}>
                        ASISTEN DIRA:
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                        &quot;Halo Detektif! Ada <strong>35 data screen time</strong> remaja yang harus kita kelompokkan. Sebagai bantuan awal, data kelas 1–4 jam (<strong>13 siswa</strong>) sudah aku masukkan otomatis ya. 
                      Sekarang, silakan drag atau klik <strong>22 data tersisa</strong> ke kelas interval yang tepat pada histogram!&quot;
                      </p>
                    </div>
                  </div>

                  {/* Klaim viral reminder */}
                  <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                    🚨 <strong style={{ color: '#f87171' }}>Klaim Viral:</strong> &quot;Remaja Indonesia rata-rata &gt;8 jam/hari di medsos!&quot; — Buktikan dengan data!
                  </div>
                </div>

                {/* Right Column: Challenge */}
                <div className="tahap-a-right-col">
                  <DraggableHistogram mode="FD" onSubmit={handleHistogramSubmit} />
                </div>
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

              {/* Histogram & Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', alignItems: 'stretch' }} className="tahap-b-reference-grid">
                {/* Left: Histogram */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--game-border)', borderRadius: '14px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>📊 HISTOGRAM HASIL TAHAP A</div>
                  <DraggableHistogram mode="FD" readOnly={true} />
                </div>

                {/* Right: Pre-computed stats */}
                <div style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid var(--game-border-accent)', borderRadius: '14px', padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, marginBottom: '10px', letterSpacing: '1px' }}>📈 STATISTIK DASAR (SUDAH DIHITUNG)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {[
                      { label: 'Mean', val: `${STATS.mean} jam` },
                      { label: 'Median', val: `${STATS.median} jam` },
                      { label: 'Min', val: `${STATS.min} jam` },
                      { label: 'Max', val: `${STATS.max} jam` },
                      { label: 'Range', val: `${STATS.range} jam` },
                      { label: 'n', val: '35 siswa' },
                    ].map(({ label, val }) => (
                      <div key={label} style={{ textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>{label}</div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-data)' }}>{val}</div>
                      </div>
                    ))}
                  </div>
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
                  placeholder={`Contoh: "Tidak valid, karena mayoritas siswa (25 orang) hanya bermain 1-4 jam sehari. Angka 8 jam ke atas hanya beberapa orang saja (outlier/pencilan), jadi tidak bisa mewakili rata-rata seluruh remaja..."`}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    minHeight: '110px', padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '14px', lineHeight: 1.6, resize: 'vertical',
                    outline: 'none', transition: 'border-color 0.2s',
                    fontFamily: 'var(--font-sans, sans-serif)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  {analysisText.length} karakter — minimal ~15 karakter
                </div>
              </div>

              {/* DiRA hint (FD — proaktif setelah gagal pertama) */}
              <AnimatePresence>
                {showAnalysisDira && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', borderRadius: '12px', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)' }}
                  >
                    <img src="/dira-avatar.png" alt="Dira" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
                      <strong style={{ color: 'var(--accent)' }}>DiRA: </strong>
                      Coba sebutkan apakah klaim itu &quot;<strong>valid</strong>&quot; atau &quot;<strong>tidak valid</strong>&quot;. Kemudian, dukung dengan menyebut kata seperti &quot;mayoritas&quot;, &quot;outlier&quot;, atau &quot;histogram&quot;. Kamu pasti bisa! 💪
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Feedback on wrong answer */}
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
                        💡 <strong>Petunjuk 1:</strong> Sebutkan apakah klaim tersebut &quot;tidak valid&quot;, &quot;salah&quot;, atau &quot;menyesatkan&quot;.
                      </p>
                    )}
                    {analysisResult.missingEvidence && (
                      <p style={{ margin: '0 0 6px', color: 'rgba(255,255,255,0.7)' }}>
                        💡 <strong>Petunjuk 2:</strong> Gunakan kata bukti seperti &quot;mayoritas&quot;, &quot;outlier&quot;, &quot;histogram&quot;, atau &quot;kebanyakan&quot;.
                      </p>
                    )}
                    {analysisAttempts >= 2 && (
                      <p style={{ margin: '6px 0 0', color: 'rgba(0,255,136,0.8)', fontStyle: 'italic' }}>
                        🔍 Contoh jawaban: &quot;Tidak valid, karena mayoritas (13 siswa / 37.1%) hanya bermain 1-4 jam. Nilai 17 dan 18 jam adalah outlier yang membuat mean tampak lebih tinggi.&quot;
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                className="game-btn game-btn-primary"
                onClick={handleAnalysisSubmit}
                disabled={analysisText.trim().length < 15}
                style={{ opacity: analysisText.trim().length >= 15 ? 1 : 0.5 }}
              >
                Submit Analisis →
              </button>
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

      {/* DiRA guide for step 0 */}
      {step === 0 && showDira && diraMsg && (
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
