'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useGameStore } from '@/lib/store/gameStore'
import DataTable from '../../../_components/DataTable'
import FrequencyTable from '../../../_components/FrequencyTable'
import VerdictScreen from '../../../_components/VerdictScreen'
import BadgeUnlock from '../../../_components/BadgeUnlock'
import { STATS, CRITICAL_KEYWORDS, BADGES } from '../../../_data/level1'
import { useRouter } from 'next/navigation'

const DraggableHistogram = dynamic(() => import('../../../_components/DraggableHistogram'), { ssr: false })

const TOTAL_STEPS = 6
const STEP_LABELS = [
  'Data Mentah', 'Parameter', 'Tabel Distribusi',
  'Histogram', 'Analisis Kritis', 'Verdict',
]

interface PendingBadge { icon: string; name: string; desc: string; id: string }

export default function FIPath() {
  const router = useRouter()
  const {
    currentStep, setStep, addXP, loseLife, lives, isCompleted,
    completeLevel, unlockBadge, setVerdict, incrementMistake,
    mistakeCount, setTimeRemaining, timeRemaining, sessionStartTime,
  } = useGameStore()

  const [timerStarted, setTimerStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [pendingBadges, setPendingBadges] = useState<PendingBadge[]>([])
  const [analysis, setAnalysis] = useState('')
  const [analysisSubmitted, setAnalysisSubmitted] = useState(false)

  // Parameter step state
  const [params, setParams] = useState({ numClasses: '', classWidth: '', min: '', max: '' })
  const [paramError, setParamError] = useState<string | null>(null)
  const [paramDone, setParamDone] = useState(false)

  // Track lives → game over
  useEffect(() => {
    if (lives <= 0) setGameOver(true)
  }, [lives])

  // Start timer when user clicks "Mulai Analisis"
  const startTimer = () => setTimerStarted(true)

  const awardBadge = useCallback((badge: typeof BADGES[keyof typeof BADGES]) => {
    unlockBadge(badge.id)
    setPendingBadges(prev => [...prev, badge])
  }, [unlockBadge])

  const dismissBadge = () => setPendingBadges(prev => prev.slice(1))

  // ── STEP 2: Validate parameters ──
  const handleParamSubmit = () => {
    const { numClasses, classWidth, min, max } = params
    const ok =
      parseInt(numClasses) === STATS.numClasses &&
      parseFloat(classWidth) === STATS.classWidth &&
      parseFloat(min) === STATS.min &&
      parseFloat(max) === STATS.max

    if (ok) {
      addXP(10, 'Parameter benar', 2)
      setParamDone(true)
      setParamError(null)
    } else {
      loseLife()
      incrementMistake()
      setParamError('Parameter tidak tepat. Periksa kembali dan coba lagi.')
    }
  }

  // ── STEP 3: Freq table ──
  const handleFreqTableSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      addXP(10, 'Tabel distribusi benar', 3)
    } else {
      loseLife()
      incrementMistake()
    }
  }

  // ── STEP 4: Histogram ──
  const handleHistogramSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      addXP(10, 'Histogram benar', 4)
    } else {
      loseLife()
      incrementMistake()
    }
  }

  // ── STEP 5: Analysis ──
  const handleAnalysisSubmit = () => {
    const lower = analysis.toLowerCase()
    const words = analysis.trim().split(/\s+/).length
    if (words < 50) {
      setParamError('Tulisan terlalu singkat. Minimal 50 kata.')
      return
    }
    const matchedKw = CRITICAL_KEYWORDS.filter((kw: string) => lower.includes(kw))
    setAnalysisSubmitted(true)
    if (matchedKw.length >= 3) {
      addXP(10, 'Analisis kritis mendalam', 5)
      awardBadge(BADGES.CRITICAL)
    }
    setParamError(null)
  }

  // ── STEP 6: Verdict ──
  const handleVerdictSubmit = (_verdict: string, isCorrect: boolean) => {
    setVerdict(_verdict)
    if (isCorrect) {
      addXP(10, 'Verdict benar', 6)
      awardBadge(BADGES.DETECTIVE)
      if (mistakeCount === 0) awardBadge(BADGES.PERFECT)

      // Speed bonus: check if < 50% time used
      const initialTime = 600
      const elapsed = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : initialTime
      if (elapsed < initialTime * 0.5) awardBadge(BADGES.SPEED)

      // Apply FI ×1.5 multiplier — add 50% of current total xp
      const currentXP = useGameStore.getState().xp
      const bonus = Math.floor(currentXP * 0.5)
      addXP(bonus, 'FI multiplier ×1.5', 6)

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

  const goNext = () => setStep(Math.min(currentStep + 1, TOTAL_STEPS - 1))

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

          {/* ── STEP 0: Raw Data ── */}
          {currentStep === 0 && (
            <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>STEP 1 — DATA MENTAH</div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Analisis Data Screen Time Siswa</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                  Data screen time (jam/hari) dari <strong>40 siswa</strong>. Sebuah postingan viral mengklaim rata-rata lebih dari 8 jam — pelajari datanya, lalu buktikan!
                </p>
              </div>
              <DataTable />
              {!timerStarted ? (
                <button className="game-btn game-btn-primary" onClick={() => { startTimer(); setStep(1) }}>
                  ⏱ Mulai Investigasi →
                </button>
              ) : (
                <button className="game-btn game-btn-secondary" onClick={() => setStep(1)}>Lihat Parameter →</button>
              )}
            </div>
          )}

          {/* ── STEP 1: Parameters ── */}
          {currentStep === 1 && (
            <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>STEP 2 — PARAMETER</div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Tentukan Parameter Distribusi</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                  Gunakan Sturges Rule: k = 1 + 3.3 × log₁₀(n), lebar = Range / k (boleh dibulatkan)
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  { label: 'Nilai Minimum (jam)', key: 'min', placeholder: 'min data' },
                  { label: 'Nilai Maksimum (jam)', key: 'max', placeholder: 'max data' },
                  { label: 'Jumlah Kelas (k)', key: 'numClasses', placeholder: 'Sturges rule' },
                  { label: 'Lebar Kelas (jam)', key: 'classWidth', placeholder: 'Range / k' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                      {label}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="freq-table-input"
                      placeholder={placeholder}
                      value={(params as Record<string, string>)[key]}
                      onChange={e => setParams(p => ({ ...p, [key]: e.target.value }))}
                      disabled={paramDone}
                      style={{ textAlign: 'left', padding: '10px 14px' }}
                    />
                  </div>
                ))}
              </div>

              {paramError && (
                <div style={{ color: 'var(--danger)', fontSize: '13px', padding: '10px 14px', background: 'var(--danger-dim)', borderRadius: '8px', border: '1px solid rgba(255,51,102,0.3)' }}>
                  ❌ {paramError}
                </div>
              )}

              {!paramDone ? (
                <button className="game-btn game-btn-primary" onClick={handleParamSubmit}>
                  Konfirmasi Parameter →
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '14px' }}>✅ +10 XP — Parameter benar!</div>
                  <button className="game-btn game-btn-primary" onClick={goNext}>Lanjut ke Tabel →</button>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Frequency Table ── */}
          {currentStep === 2 && (
            <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>STEP 3 — TABEL DISTRIBUSI</div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Isi Tabel Distribusi Frekuensi</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                  Isi semua cell secara manual berdasarkan data screen time 40 siswa. Submit untuk validasi.
                </p>
              </div>
              <FrequencyTable
                mode="FI"
                onSubmit={(isCorrect: boolean) => {
                  handleFreqTableSubmit(isCorrect)
                  if (isCorrect) setTimeout(goNext, 800)
                }}
              />
            </div>
          )}

          {/* ── STEP 3: Histogram ── */}
          {currentStep === 3 && (
            <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>STEP 4 — HISTOGRAM</div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Bangun Histogram Screen Time</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                  Drag batang dari pool ke posisi yang tepat pada histogram berdasarkan frekuensinya.
                </p>
              </div>
              <DraggableHistogram
                mode="FI"
                onSubmit={(isCorrect: boolean) => {
                  handleHistogramSubmit(isCorrect)
                  if (isCorrect) setTimeout(goNext, 800)
                }}
              />
            </div>
          )}

          {/* ── STEP 4: Critical Analysis ── */}
          {currentStep === 4 && (
            <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>STEP 5 — ANALISIS KRITIS</div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Analisis Pola & Validasi Klaim</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                  Apa pola distribusi yang kamu temukan? Apakah mean screen time siswa membuktikan klaim "rata-rata 8+ jam"? Jelaskan secara kritis. (min. 50 kata)
                </p>
              </div>

              <textarea
                value={analysis}
                onChange={e => setAnalysis(e.target.value)}
                placeholder="Tuliskan analisismu di sini... (contoh: distribusi menunjukkan, rata-rata sebenarnya, klaim tersebut...)"
                disabled={analysisSubmitted}
                style={{
                  width: '100%', minHeight: '160px', padding: '14px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--game-border)',
                  borderRadius: '12px', color: '#fff', fontSize: '14px', lineHeight: 1.6,
                  resize: 'vertical', fontFamily: 'var(--font-ui)', boxSizing: 'border-box'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>{analysis.trim().split(/\s+/).filter(Boolean).length} / 50 kata minimum</span>
                {analysisSubmitted && <span style={{ color: 'var(--accent)' }}>✅ Analisis diterima!</span>}
              </div>

              {paramError && <div style={{ color: 'var(--danger)', fontSize: '13px' }}>❌ {paramError}</div>}

              {!analysisSubmitted ? (
                <button className="game-btn game-btn-primary" onClick={handleAnalysisSubmit}>
                  Submit Analisis →
                </button>
              ) : (
                <button className="game-btn game-btn-primary" onClick={goNext}>Tentukan Verdict →</button>
              )}
            </div>
          )}

          {/* ── STEP 5: Verdict ── */}
          {currentStep === 5 && (
            <div className="game-card">
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>STEP 6 — VERDICT</div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Tetapkan Verdict</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                  Berdasarkan histogram dan analisismu — apakah klaim "rata-rata 8+ jam" itu VALID, MISLEADING, atau HOAKS?
                </p>
              </div>
              <VerdictScreen onSubmit={handleVerdictSubmit} />
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Game Over overlay */}
      {gameOver && (
        <div className="game-over-screen">
          <div style={{ fontSize: '64px' }}>💀</div>
          <h2 style={{ fontSize: '28px', margin: 0 }}>Game Over</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Nyawa habis. Lanjutkan dari step terakhir?</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="game-btn game-btn-primary"
              onClick={() => {
                useGameStore.setState({ lives: useGameStore.getState().cognitiveStyle === 'FD' ? 4 : 3 })
                setGameOver(false)
              }}
            >
              Coba Lagi dari Step {currentStep + 1}
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
