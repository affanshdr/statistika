'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'
import { POST_TEST_QUESTIONS } from '../game/_data/postTestQuestions'

import dynamic from 'next/dynamic'
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false })

// Helper: cek apakah jawaban isian mengandung semua keyword kunci
function checkEssayAnswer(input: string, keywords: string[]): boolean {
  const normalized = input.toLowerCase().replace(/\s+/g, ' ').trim()
  return keywords.every(kw => normalized.includes(kw.toLowerCase()))
}

export default function PostTestPage() {
  const router = useRouter()
  const { resetLevel } = useGameStore()

  // Per-question state
  const [currentQ, setCurrentQ] = useState(0)
  const [mcSelected, setMcSelected] = useState<number | null>(null)      // pilihan ganda
  const [essayInput, setEssayInput] = useState('')                        // isian
  const [submitted, setSubmitted] = useState(false)
  const [essayCorrect, setEssayCorrect] = useState<boolean | null>(null) // null = belum dicek

  // Score tracking — parallel arrays for each question
  const [scores, setScores] = useState<(boolean | null)[]>(
    Array(POST_TEST_QUESTIONS.length).fill(null)
  )

  // Page-level state
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro')
  const [saving, setSaving] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [scoreStats, setScoreStats] = useState({ correct: 0, wrong: 0 })
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [showConfetti, setShowConfetti] = useState(false)

  const processingRef = useRef(false)
  const hasRedirectedRef = useRef(false)

  const q = POST_TEST_QUESTIONS[currentQ]
  const isEssay = q.type === 'essay'

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Reset per-question state when moving to next question
  useEffect(() => {
    processingRef.current = false
    setMcSelected(null)
    setEssayInput('')
    setSubmitted(false)
    setEssayCorrect(null)
  }, [currentQ])

  useEffect(() => {
    if (hasRedirectedRef.current) return
    const data = localStorage.getItem('student')
    if (!data) { router.push('/'); return }
    const s = JSON.parse(data)
    if (s.postTestScore !== undefined && s.postTestScore !== null) {
      hasRedirectedRef.current = true
      router.replace('/siswa')
    }
  }, [router])

  // ── Submit current answer (show feedback) ──────────────────────────────────
  const handleSubmit = () => {
    if (submitted) return
    if (isEssay) {
      const hasKeywords = q.answerKeywords && q.answerKeywords.length > 0
      const correct = hasKeywords
        ? checkEssayAnswer(essayInput, q.answerKeywords!)
        : true // tidak ada kunci → dianggap perlu review manual (tidak dikurangi)
      setEssayCorrect(correct)
    }
    setSubmitted(true)
  }

  // ── Move to next question or finish ────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (processingRef.current) return
    processingRef.current = true

    // Determine correctness of current question
    let isCorrect = false
    if (isEssay) {
      const hasKeywords = q.answerKeywords && q.answerKeywords.length > 0
      isCorrect = hasKeywords
        ? checkEssayAnswer(essayInput, q.answerKeywords!)
        : true
    } else {
      isCorrect = mcSelected === q.correct
    }

    const newScores = [...scores]
    newScores[currentQ] = isCorrect
    setScores(newScores)

    if (currentQ < POST_TEST_QUESTIONS.length - 1) {
      setCurrentQ(prev => prev + 1)
    } else {
      // Finish — calculate final score
      const totalCorrect = newScores.filter(Boolean).length
      const totalWrong = POST_TEST_QUESTIONS.length - totalCorrect

      setScoreStats({ correct: totalCorrect, wrong: totalWrong })
      setShowPopup(true)
      setPhase('result')
      if (totalCorrect >= 4) setShowConfetti(true)

      // Save to API
      setSaving(true)
      let student: any = {}
      let activeStudentId = ''
      try {
        const stored = localStorage.getItem('student')
        if (stored) {
          student = JSON.parse(stored) || {}
          activeStudentId = student.id || ''
        }
      } catch (e) { console.error(e) }

      if (!activeStudentId) {
        alert('Sesi siswa tidak ditemukan. Silakan login kembali.')
        localStorage.removeItem('student')
        router.push('/')
        processingRef.current = false
        setSaving(false)
        return
      }

      fetch('/api/post-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: activeStudentId, score: totalCorrect }),
      }).then(async res => {
        if (res.status === 404) {
          alert('Data siswa tidak ditemukan. Silakan masuk kembali.')
          localStorage.removeItem('student')
          router.push('/')
          return
        }
        const data = await res.json()
        if (!res.ok) { alert(data.error || 'Gagal menyimpan hasil post-test'); return }
        localStorage.setItem('student', JSON.stringify({ ...student, postTestScore: data.postTestScore }))
      }).catch(err => {
        console.error(err)
        alert('Gagal terhubung ke server.')
      }).finally(() => setSaving(false))
    }
  }, [currentQ, isEssay, essayInput, mcSelected, scores, q, router])

  // ── Can submit? ────────────────────────────────────────────────────────────
  const canSubmit = isEssay ? essayInput.trim().length > 0 : mcSelected !== null

  // ──────────────────────────────────────────────────────────────────────────
  const renderNavbar = () => (
    <header style={{
      width: '100%', background: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(0, 255, 136, 0.08)', margin: '-24px -16px 24px -16px',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          onClick={() => {
            if (phase === 'test') {
              if (confirm('Apakah Anda yakin ingin keluar? Progress pengerjaan saat ini tidak akan disimpan.')) router.push('/siswa')
            } else router.push('/siswa')
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <motion.div
            animate={{ filter: ['drop-shadow(0 0 6px #00FF88)', 'drop-shadow(0 0 14px #00FF88)', 'drop-shadow(0 0 6px #00FF88)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{ fontSize: '24px', lineHeight: 1 }}
          >🕵️</motion.div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '16px', letterSpacing: '0.5px', background: 'linear-gradient(90deg, #00FF88, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>
              Skeptikos
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', fontWeight: 700, marginTop: '1px' }}>POST TEST LEVEL 1</div>
          </div>
        </div>
      </div>
    </header>
  )

  // ── Render table ───────────────────────────────────────────────────────────
  const renderTable = () => q.tableData && (
    <div style={{ overflowX: 'auto', marginBottom: '20px', borderRadius: '12px', border: '1px solid rgba(0, 255, 136, 0.12)', background: 'rgba(0,255,136,0.02)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center' }}>
        <thead>
          <tr style={{ background: 'rgba(0, 255, 136, 0.06)', borderBottom: '1px solid rgba(0, 255, 136, 0.12)' }}>
            {q.tableData.headers.map((h, idx) => (
              <th key={idx} style={{ padding: '10px 16px', color: '#00FF88', fontWeight: 800, letterSpacing: '0.5px' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {q.tableData.rows.map((row, rIdx) => (
            <tr key={rIdx} style={{ borderBottom: rIdx < q.tableData!.rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: rIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} style={{ padding: '10px 16px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: cIdx === 0 ? 600 : 400 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  // ── Render Multiple-Choice options ─────────────────────────────────────────
  const renderMCOptions = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {(q.options ?? []).map((opt, i) => {
        const isSelected = mcSelected === i
        let bg = 'rgba(255,255,255,0.03)'
        let border = '1px solid rgba(255,255,255,0.08)'
        let color = 'rgba(255,255,255,0.8)'
        let boxShadow = 'none'
        let showIcon: 'correct' | 'wrong' | 'check' | null = null

        if (!submitted) {
          if (isSelected) { bg = 'rgba(0,255,136,0.12)'; border = '2px solid #00FF88'; color = '#fff'; boxShadow = '0 0 16px rgba(0,255,136,0.35)' }
        } else {
          const isCorrectAnswer = i === q.correct
          if (isSelected) {
            if (isCorrectAnswer) { bg = 'rgba(0,255,136,0.18)'; border = '2px solid #00FF88'; color = '#00FF88'; showIcon = 'correct'; boxShadow = '0 0 16px rgba(0,255,136,0.25)' }
            else { bg = 'rgba(255,51,102,0.18)'; border = '2px solid #FF3366'; color = '#ff8f8f'; showIcon = 'wrong'; boxShadow = '0 0 16px rgba(255,51,102,0.25)' }
          } else if (isCorrectAnswer) { bg = 'rgba(0,255,136,0.08)'; border = '1px dashed #00FF88'; color = '#6ee7b7'; showIcon = 'check' }
          else { bg = 'rgba(255,255,255,0.01)'; border = '1px solid rgba(255,255,255,0.04)'; color = 'rgba(255,255,255,0.3)' }
        }

        return (
          <motion.button
            key={i}
            whileHover={!submitted ? { scale: 1.01, x: 4 } : {}}
            whileTap={!submitted ? { scale: 0.99 } : {}}
            onClick={() => !submitted && setMcSelected(i)}
            disabled={submitted}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border, background: bg, color, boxShadow, fontSize: '14px', fontWeight: 600, textAlign: 'left', cursor: !submitted ? 'pointer' : 'default', transition: 'all 0.2s', display: 'flex', gap: '12px', alignItems: 'center', minHeight: '52px' }}
          >
            <span style={{
              minWidth: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
              background: isSelected && !submitted ? '#00FF88' : submitted && isSelected && i === q.correct ? '#00FF88' : submitted && isSelected && i !== q.correct ? '#FF3366' : 'rgba(255,255,255,0.06)',
              color: (isSelected && !submitted) || (submitted && isSelected) ? '#000' : 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, transition: 'all 0.2s'
            }}>
              {['A', 'B', 'C', 'D'][i]}
            </span>
            <span style={{ lineHeight: 1.5 }}>{opt}</span>
            {showIcon === 'correct' && <span style={{ marginLeft: 'auto', fontSize: '18px' }}>✅</span>}
            {showIcon === 'wrong' && <span style={{ marginLeft: 'auto', fontSize: '18px' }}>❌</span>}
            {showIcon === 'check' && <span style={{ marginLeft: 'auto', fontSize: '14px' }}>✓</span>}
          </motion.button>
        )
      })}
    </div>
  )

  // ── Render Essay input ─────────────────────────────────────────────────────
  const renderEssayInput = () => {
    const hasKeywords = q.answerKeywords && q.answerKeywords.length > 0
    const showResult = submitted && hasKeywords

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {q.hint && (
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.06)', border: '1px solid rgba(251, 191, 36, 0.2)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '16px' }}>💡</span>
            <span style={{ fontSize: '13px', color: 'rgba(251, 191, 36, 0.9)', lineHeight: 1.6 }}>{q.hint}</span>
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={essayInput}
            onChange={e => !submitted && setEssayInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canSubmit && !submitted && handleSubmit()}
            disabled={submitted}
            placeholder="Ketikkan jawaban Anda di sini..."
            style={{
              width: '100%', boxSizing: 'border-box', padding: '14px 48px 14px 16px', borderRadius: '14px', fontSize: '15px', fontWeight: 600, outline: 'none', transition: 'all 0.2s',
              background: submitted
                ? essayCorrect ? 'rgba(0,255,136,0.08)' : 'rgba(255,51,102,0.08)'
                : 'rgba(255,255,255,0.04)',
              border: submitted
                ? essayCorrect ? '2px solid #00FF88' : '2px solid #FF3366'
                : '1.5px solid rgba(255,255,255,0.1)',
              color: submitted ? (essayCorrect ? '#00FF88' : '#ff8f8f') : '#fff',
              boxShadow: submitted ? (essayCorrect ? '0 0 16px rgba(0,255,136,0.2)' : '0 0 16px rgba(255,51,102,0.2)') : 'none',
            }}
            onFocus={e => { if (!submitted) e.currentTarget.style.borderColor = '#00FF88' }}
            onBlur={e => { if (!submitted) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          />
          {submitted && (
            <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px' }}>
              {essayCorrect ? '✅' : '❌'}
            </span>
          )}
        </div>

        {/* Show correct answer after wrong submission */}
        {showResult && !essayCorrect && q.correctAnswerLabel && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(0,255,136,0.06)', border: '1px dashed rgba(0,255,136,0.3)', display: 'flex', gap: '10px', alignItems: 'center' }}
          >
            <span style={{ fontSize: '16px' }}>💬</span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
              Jawaban yang benar: <strong style={{ color: '#00FF88' }}>{q.correctAnswerLabel}</strong>
            </span>
          </motion.div>
        )}

        {showResult && essayCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)' }}
          >
            <span style={{ fontSize: '13px', color: '#6ee7b7', lineHeight: 1.6 }}>🎉 Tepat! Jawaban kamu benar.</span>
          </motion.div>
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-sans, sans-serif)' }}>
      {showConfetti && <ReactConfetti width={windowSize.width} height={windowSize.height} colors={['#00FF88', '#00ccff', '#FFD700', '#FF6B35', '#fff']} recycle={false} numberOfPieces={150} />}

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      {renderNavbar()}

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <AnimatePresence mode="wait">

          {/* ── INTRO ── */}
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
              style={{ width: '100%', maxWidth: '560px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px', padding: 'clamp(24px, 5vw, 40px) clamp(20px, 5vw, 36px)', zIndex: 10, textAlign: 'center', color: '#fff' }}
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.2 }} style={{ fontSize: '64px', marginBottom: '20px' }}>🏆</motion.div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '2px', color: '#00FF88', marginBottom: '12px' }}>POST TEST: LEVEL 1 COMPLETED</div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2 }}>Uji Pemahaman Analisis Datamu!</h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 28px' }}>
                Selamat! Untuk melengkapi misimu sebagai Detektif Data, mari tunjukkan pemahaman konsep analisismu melalui <strong style={{ color: '#00FF88' }}>{POST_TEST_QUESTIONS.length} pertanyaan post-test</strong> ini.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', textAlign: 'left' }}>
                {[
                  { icon: '📝', text: `${POST_TEST_QUESTIONS.filter(q => q.type !== 'essay').length} soal pilihan ganda + ${POST_TEST_QUESTIONS.filter(q => q.type === 'essay').length} soal isian singkat` },
                  { icon: '🎯', text: 'Menguji konsep histogram, distribusi frekuensi, dan literasi data' },
                  { icon: '💾', text: 'Skor akhir disimpan secara permanen di database' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 14px', background: 'rgba(0,255,136,0.04)', borderRadius: '12px', border: '1px solid rgba(0,255,136,0.12)' }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setPhase('test')} style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: 'linear-gradient(90deg, #00FF88, #06b6d4)', color: '#000', fontSize: '15px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,255,136,0.35)', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
              >Mulai Post Test 🚀</button>
            </motion.div>
          )}

          {/* ── TEST ── */}
          {phase === 'test' && (
            <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}
              style={{ width: '100%', maxWidth: '720px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <motion.div style={{ height: '100%', background: 'linear-gradient(90deg, #00FF88, #00cc6a)', borderRadius: '3px', boxShadow: '0 0 8px rgba(0,255,136,0.4)' }}
                    animate={{ width: `${((currentQ + 1) / POST_TEST_QUESTIONS.length) * 100}%` }} transition={{ duration: 0.4 }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>{currentQ + 1} / {POST_TEST_QUESTIONS.length}</span>
              </div>

              {/* Question card */}
              <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 28px)', color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '2px', color: '#00FF88' }}>SOAL {currentQ + 1} / {POST_TEST_QUESTIONS.length}</div>
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: isEssay ? 'rgba(251,191,36,0.1)' : 'rgba(0,255,136,0.08)', border: isEssay ? '1px solid rgba(251,191,36,0.25)' : '1px solid rgba(0,255,136,0.2)', color: isEssay ? '#fbbf24' : '#00FF88' }}>
                    {isEssay ? '✏️ ISIAN' : '🔘 PILIHAN GANDA'}
                  </span>
                </div>

                <p style={{ fontSize: '16px', lineHeight: 1.75, margin: '0 0 20px', fontWeight: 600 }}>{q.text}</p>

                {renderTable()}

                {isEssay ? renderEssayInput() : renderMCOptions()}

                <div style={{ marginTop: '20px' }}>
                  {!submitted ? (
                    <button disabled={!canSubmit} onClick={handleSubmit}
                      style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: !canSubmit ? 'rgba(255,255,255,0.05)' : 'linear-gradient(90deg, #00FF88, #06b6d4)', color: !canSubmit ? 'rgba(255,255,255,0.3)' : '#000', fontSize: '14px', fontWeight: 800, cursor: !canSubmit ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: !canSubmit ? 'none' : '0 4px 20px rgba(0,255,136,0.3)' }}
                    >
                      Submit Jawaban
                    </button>
                  ) : (
                    <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={handleNext}
                      style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: 'linear-gradient(90deg, #00FF88, #06b6d4)', color: '#000', fontSize: '14px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,255,136,0.3)' }}
                      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                      onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                    >
                      {currentQ < POST_TEST_QUESTIONS.length - 1 ? 'Lanjut Soal Berikutnya →' : 'Lihat Hasil →'}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── RESULT ── */}
          {phase === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
              style={{ width: '100%', maxWidth: '560px', zIndex: 10, background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px', padding: 'clamp(24px, 5vw, 40px) clamp(20px, 5vw, 36px)', textAlign: 'center', color: '#fff' }}
            >
              <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, delay: 0.1 }} style={{ fontSize: '72px', marginBottom: '16px' }}>🎓</motion.div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '2px', color: '#00FF88', marginBottom: '10px' }}>POST TEST SELESAI</div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px' }}>Selamat, Detektif!</h2>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ margin: '20px 0', padding: '16px 20px', borderRadius: '16px', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)' }}
              >
                <div style={{ fontSize: '20px', marginBottom: '10px' }}>🕵️‍♂️</div>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
                  Kamu telah menyelesaikan Post Test Level 1. Hasil tes ini mencerminkan kemampuanmu dalam literasi data dan statistika!
                </p>
              </motion.div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '0 0 24px', lineHeight: 1.6 }}>
                Klik tombol di bawah untuk kembali ke Dashboard dan lanjutkan misi berikutnya.
              </p>
              <button onClick={() => { resetLevel(); router.push('/siswa') }} disabled={saving}
                style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: saving ? 'rgba(0,255,136,0.3)' : 'linear-gradient(90deg, #00FF88, #06b6d4)', color: '#000', fontSize: '15px', fontWeight: 800, cursor: saving ? 'wait' : 'pointer', boxShadow: '0 4px 20px rgba(0,255,136,0.3)', transition: 'all 0.2s' }}
              >{saving ? 'Menyimpan...' : 'Kembali ke Dashboard'}</button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Score Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
          >
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              style={{ width: '100%', maxWidth: '400px', background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(0,255,136,0.2)', boxShadow: '0 0 30px rgba(0,255,136,0.1)', borderRadius: '24px', padding: '32px 24px', textAlign: 'center', color: '#fff' }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800 }}>Hasil Post Test</h3>
              <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Rangkuman skor pengerjaan Post Test kamu:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
                <div style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: '16px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 700, marginBottom: '4px' }}>BENAR</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#00FF88' }}>{scoreStats.correct}</div>
                </div>
                <div style={{ background: 'rgba(255,51,102,0.05)', border: '1px solid rgba(255,51,102,0.15)', borderRadius: '16px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 700, marginBottom: '4px' }}>SALAH</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#FF3366' }}>{scoreStats.wrong}</div>
                </div>
              </div>
              <button onClick={() => setShowPopup(false)}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(90deg, #00FF88, #06b6d4)', color: '#000', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,255,136,0.3)', transition: 'all 0.2s' }}
              >Lanjutkan</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
