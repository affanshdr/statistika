'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useGameStore } from '@/lib/store/gameStore'
import DataTable from '../../../_components/DataTable'
import FrequencyTable from '../../../_components/FrequencyTable'
import VerdictScreen from '../../../_components/VerdictScreen'
import DiRA from '../../../_components/DiRA'
import BadgeUnlock from '../../../_components/BadgeUnlock'
import { STATS, CORRECT_TABLE, FD_MC_QUESTIONS, BADGES } from '../../../_data/level1'
import { useRouter } from 'next/navigation'

const DraggableHistogram = dynamic(() => import('../../../_components/DraggableHistogram'), { ssr: false })

const TOTAL_STEPS = 6
const STEP_LABELS = ['Konteks', 'Data + Statistik', 'Tabel Terbimbing', 'Histogram', 'MC + Simpulan', 'Verdict']

interface PendingBadge { icon: string; name: string; desc: string; id: string }

const DIRA_MESSAGES: Record<number, string> = {
  0: "Hei! Ada kasus seru nih, yuk kita selidiki bareng! 🔍",
  1: "Aku udah hitung statistik dasarnya. Sekarang kita bagi datanya ke dalam kelompok yuk!",
  2: "Bagus! Tinggal isi sel yang kosong ya. Klik ❓ di header kolom kalau perlu bantuan rumus.",
  3: "Keren, tinggal 3 batang lagi! Drag batang ke posisi yang tepat.",
  4: "Hampir selesai! Jawab 3 soal pilihan ganda, lalu tulis kesimpulan singkat.",
  5: "Berdasarkan analisismu... data share ini membuktikan klaim '95%' nggak? 🤔",
}

const TIKTOK_COMMENTS = [
  { user: '@dimas_rpl', text: 'Setuju banget!!! Sekolah libur 😭🙏' },
  { user: '@nisa_mipa', text: 'ini viral karena beneran 95% siswa ngerasa gitu' },
  { user: '@budi_senyum', text: 'Data valid ga nih? sumbernya mana ya 🤔' },
]

export default function FDPath() {
  const router = useRouter()
  const {
    currentStep, setStep, addXP, loseLife, lives, isCompleted,
    completeLevel, unlockBadge, setVerdict, incrementMistake, mistakeCount,
    sessionStartTime,
  } = useGameStore()

  const [gameOver, setGameOver] = useState(false)
  const [pendingBadges, setPendingBadges] = useState<PendingBadge[]>([])
  const [diraMsg, setDiraMsg] = useState(DIRA_MESSAGES[0])
  const [showDira, setShowDira] = useState(true)

  // MC state
  const [mcAnswers, setMcAnswers] = useState<(number | null)[]>([null, null, null])
  const [mcResults, setMcResults] = useState<(boolean | null)[]>([null, null, null])
  const [mcDone, setMcDone] = useState(false)
  const [summary, setSummary] = useState('')
  const [summaryDone, setSummaryDone] = useState(false)

  useEffect(() => {
    if (lives <= 0) setGameOver(true)
  }, [lives])

  const awardBadge = useCallback((badge: typeof BADGES[keyof typeof BADGES]) => {
    unlockBadge(badge.id)
    setPendingBadges(prev => [...prev, badge])
  }, [unlockBadge])

  const dismissBadge = () => setPendingBadges(prev => prev.slice(1))

  const goNext = (step?: number) => {
    const next = step ?? Math.min(currentStep + 1, TOTAL_STEPS - 1)
    setStep(next)
    setDiraMsg(DIRA_MESSAGES[next])
    setShowDira(true)
  }

  const handleFreqTableSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      addXP(10, 'Tabel distribusi benar', 3)
      setTimeout(() => goNext(), 800)
    } else {
      loseLife()
      incrementMistake()
      setDiraMsg('Psst, coba cek rumusnya lagi ya! Frekuensi relatif = (f/n) × 100% 😊')
      setShowDira(true)
    }
  }

  const handleHistogramSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      addXP(10, 'Histogram benar', 4)
      setTimeout(() => goNext(), 800)
    } else {
      loseLife()
      incrementMistake()
    }
  }

  const handleMCAnswer = (qIdx: number, optIdx: number) => {
    if (mcResults[qIdx] !== null) return
    const isCorrect = optIdx === FD_MC_QUESTIONS[qIdx].correct
    const newResults = [...mcResults]
    newResults[qIdx] = isCorrect
    const newAnswers = [...mcAnswers]
    newAnswers[qIdx] = optIdx
    setMcAnswers(newAnswers)
    setMcResults(newResults)

    if (!isCorrect) {
      loseLife()
      incrementMistake()
    }

    if (newResults.every(r => r === true)) {
      addXP(10, 'Semua MC benar', 5)
      awardBadge(BADGES.CRITICAL)
      setDiraMsg('Keren! Sekarang tulis kesimpulanmu dalam 2 kalimat ya 📝')
      setShowDira(true)
      setMcDone(true)
    }
  }

  const handleSummarySubmit = () => {
    if (summary.trim().split(/\s+/).length < 20) return
    setSummaryDone(true)
    setDiraMsg('Mantap! Kamu udah jago banget nih. Sekarang saatnya verdict terakhir! 🎯')
    setShowDira(true)
    setTimeout(() => goNext(5), 1200)
  }

  const handleVerdictSubmit = (_verdict: string, isCorrect: boolean) => {
    setVerdict(_verdict)
    if (isCorrect) {
      addXP(10, 'Verdict benar', 6)
      awardBadge(BADGES.DETECTIVE)
      setDiraMsg('Yess! Kamu berhasil! 🎉 Klaim tersebut MISLEADING karena data share ≠ data opini!')
      setShowDira(true)
      if (mistakeCount === 0) awardBadge(BADGES.PERFECT)

      const initialTime = 900
      const elapsed = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : initialTime
      if (elapsed < initialTime * 0.5) awardBadge(BADGES.SPEED)

      completeLevel(1)
    } else {
      loseLife()
      incrementMistake()
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
          {/* ── STEP 0: Konteks ── */}
          {currentStep === 0 && (
            <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>STEP 1 — KONTEKS KASUS</div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Video Viral TikTok 📱</h2>
              </div>

              {/* TikTok mockup */}
              <div className="tiktok-card">
                <div className="tiktok-video">
                  <div>
                    <div style={{ fontSize: '48px', textAlign: 'center' }}>📊</div>
                    <div style={{ fontSize: '14px', color: '#eee', textAlign: 'center', marginTop: '8px' }}>
                      95% Siswa SMA<br/>Setuju Sekolah Libur!
                    </div>
                  </div>
                  {/* Viral badge */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#ff0050', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                    VIRAL 🔥 2.4M
                  </div>
                </div>
                <div className="tiktok-caption">
                  <strong>@dataviral.id</strong> Berdasarkan data share terakhir, <strong>95% siswa SMA</strong> setuju sekolah harus diliburkan! #viral #siswa #sekolah
                </div>
                {TIKTOK_COMMENTS.map((c, i) => (
                  <motion.div
                    key={i}
                    className="tiktok-comment"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.3 }}
                  >
                    <span style={{ color: '#fff', fontWeight: 700 }}>{c.user}</span>
                    <span>{c.text}</span>
                  </motion.div>
                ))}
              </div>

              <button className="game-btn game-btn-primary" onClick={() => goNext(1)} style={{ width: '100%' }}>
                Lihat Datanya 📊
              </button>
            </div>
          )}

          {/* ── STEP 1: Data + Stats ── */}
          {currentStep === 1 && (
            <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>STEP 2 — DATA & STATISTIK DASAR</div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Dataset yang Diterima</h2>
              </div>

              <DataTable />

              {/* Pre-computed stats */}
              <div style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid var(--game-border-accent)', borderRadius: '14px', padding: '16px 20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginBottom: '12px', letterSpacing: '1px' }}>📊 STATISTIK DASAR (SUDAH DIHITUNG OTOMATIS)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                  {[
                    { label: 'Mean', val: '56.9' },
                    { label: 'Median', val: '56.5' },
                    { label: 'Min', val: '12' },
                    { label: 'Max', val: '98' },
                    { label: 'Range', val: '86' },
                    { label: 'n', val: '30' },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>{label}</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-data)' }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="game-btn game-btn-primary" onClick={() => goNext(2)}>
                Bagi ke Kelompok →
              </button>
            </div>
          )}

          {/* ── STEP 2: Guided Table ── */}
          {currentStep === 2 && (
            <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>STEP 3 — TABEL TERBIMBING</div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Lengkapi Tabel Distribusi</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                  Sel <span style={{ color: '#ffdd00' }}>kuning</span> = perlu diisi. Klik ❓ untuk rumus.
                </p>
              </div>
              <FrequencyTable mode="FD" onSubmit={handleFreqTableSubmit} />
            </div>
          )}

          {/* ── STEP 3: Histogram ── */}
          {currentStep === 3 && (
            <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>STEP 4 — HISTOGRAM TERBIMBING</div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Lengkapi Histogram</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                  3 batang sudah ada. Drag 3 batang lainnya ke posisi yang tepat.
                </p>
              </div>
              <DraggableHistogram mode="FD" onSubmit={handleHistogramSubmit} />
            </div>
          )}

          {/* ── STEP 4: MC + Summary ── */}
          {currentStep === 4 && (
            <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>STEP 5 — PILIHAN GANDA & SIMPULAN</div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Uji Pemahamanmu</h2>
              </div>

              {FD_MC_QUESTIONS.map((q: typeof FD_MC_QUESTIONS[number], qIdx: number) => (
                <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: mcResults[qIdx] === true ? 'var(--accent)' : mcResults[qIdx] === false ? 'var(--danger)' : '#fff' }}>
                    {qIdx + 1}. {q.question}
                    {mcResults[qIdx] === true && <span style={{ marginLeft: '8px' }}>✅</span>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {q.options.map((opt: string, optIdx: number) => (
                      <button
                        key={optIdx}
                        className={`mc-option ${
                          mcResults[qIdx] !== null && mcAnswers[qIdx] === optIdx
                            ? mcResults[qIdx] ? 'correct' : 'wrong'
                            : mcResults[qIdx] !== null && optIdx === q.correct
                              ? 'correct'
                              : ''
                        }`}
                        onClick={() => handleMCAnswer(qIdx, optIdx)}
                        disabled={mcResults[qIdx] !== null}
                      >
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '20px' }}>
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Summary textarea (show after all MC done) */}
              {mcDone && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 700 }}>
                    Tulis kesimpulanmu dalam 2 kalimat: (min. 20 kata)
                  </label>
                  <textarea
                    value={summary}
                    onChange={e => setSummary(e.target.value)}
                    disabled={summaryDone}
                    placeholder="Dari analisis data di atas, saya menyimpulkan..."
                    style={{
                      width: '100%', minHeight: '100px', padding: '12px 14px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid var(--game-border)',
                      borderRadius: '12px', color: '#fff', fontSize: '14px', lineHeight: 1.6,
                      resize: 'vertical', fontFamily: 'var(--font-ui)', boxSizing: 'border-box'
                    }}
                  />
                  {!summaryDone && (
                    <button
                      className="game-btn game-btn-primary"
                      onClick={handleSummarySubmit}
                      disabled={summary.trim().split(/\s+/).length < 20}
                      style={{ opacity: summary.trim().split(/\s+/).length >= 20 ? 1 : 0.5 }}
                    >
                      Submit Simpulan →
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {/* ── STEP 5: Verdict ── */}
          {currentStep === 5 && (
            <div className="game-card">
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>STEP 6 — VERDICT</div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Keputusan Akhir</h2>
              </div>
              <VerdictScreen
                onSubmit={handleVerdictSubmit}
                guidedMode={true}
                onDiraHint={(msg: string) => { setDiraMsg(msg); setShowDira(true) }}
              />
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
            Dira: "Jangan menyerah! Kamu hampir berhasil 💪"
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="game-btn game-btn-primary"
              onClick={() => {
                useGameStore.setState({ lives: 4 })
                setGameOver(false)
              }}
            >
              Coba Lagi dari Step {currentStep + 1}
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
