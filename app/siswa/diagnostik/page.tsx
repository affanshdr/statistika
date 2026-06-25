'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'

const QUESTIONS = [
  {
    id: 1,
    text: 'Sebuah diagram batang menunjukkan data tinggi badan siswa. Jika batang untuk tinggi 150 cm menunjuk ke angka 8 pada sumbu tegak, apa arti dari informasi tersebut?',
    options: [
      'Ada 8 siswa yang memiliki tinggi badan 150 cm.',
      'Tinggi badan rata-rata siswa adalah 150 cm.',
      'Siswa yang paling tinggi berukuran 158 cm.',
      'Selisih tinggi badan siswa adalah 8 cm.',
    ],
    correct: 0,
  },
  {
    id: 2,
    text: 'Perhatikan data nilai tugas beberapa siswa berikut: 70, 85, 60, 90, 75. Berapakah selisih antara nilai tertinggi dan nilai terendah dari data tersebut?',
    options: ['20', '25', '30', '35'],
    correct: 2,
  },
  {
    id: 3,
    text: 'Mengapa data yang jumlahnya sangat banyak dan bervariasi (misalnya nilai ujian 100 siswa dari angka 35 sampai 100) kurang cocok jika langsung dibuat diagram batang tunggal satu per satu nilainya?',
    options: [
      'Karena diagram batang tidak bisa digambar di kertas.',
      'Karena diagram batang akan menjadi terlalu panjang, penuh, dan sulit untuk disimpulkan secara cepat.',
      'Karena diagram batang hanya boleh digunakan untuk data di bawah 10 sampel.',
      'Karena diagram batang hanya boleh digunakan untuk data nama orang.',
    ],
    correct: 1,
  },
  {
    id: 4,
    text: 'Jika kita mengelompokkan nilai matematika menjadi beberapa bagian, manakah di bawah ini yang menunjukkan pengelompokkan yang adil dan tidak tumpang tindih?',
    options: [
      'Kelompok A: 60-70, Kelompok B: 70-80, Kelompok C: 80-90',
      'Kelompok A: 61-70, Kelompok B: 71-80, Kelompok C: 81-90',
      'Kelompok A: 60-65, Kelompok B: 66-70, Kelompok C: 71-85',
      'Kelompok A: Kurang dari 70, Kelompok B: Lebih dari 65',
    ],
    correct: 1,
  },
  {
    id: 5,
    text: 'Dalam diagram batang yang biasa kalian pelajari di SMP, terdapat jarak atau celah yang memisahkan antar batang. Jarak tersebut menunjukkan bahwa...',
    options: [
      'Data yang satu dengan data yang lain bersifat terpisah (kategori berbeda).',
      'Guru salah membuat gambar grafik.',
      'Nilai frekuensi data tersebut bernilai nol.',
      'Data tersebut merupakan data yang berlanjut terus-menerus.',
    ],
    correct: 0,
  },
]

export default function DiagnostikPage() {
  const router = useRouter()
  const { startLevel, resetLevel } = useGameStore()
  const [targetLevel, setTargetLevel] = useState<string>('1')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null))
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro')
  const [saving, setSaving] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [scoreStats, setScoreStats] = useState({ correct: 0, wrong: 0 })
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const processingRef = useRef(false)

  useEffect(() => {
    processingRef.current = false
  }, [currentQ])

  const hasRedirectedRef = useRef(false)

  useEffect(() => {
    if (hasRedirectedRef.current) return

    const data = localStorage.getItem('student')
    if (!data) { router.push('/'); return }
    const s = JSON.parse(data)

    // Redirect if already completed diagnostic
    if (s.diagnosticLevel) {
      hasRedirectedRef.current = true
      const activeStyle = s.geftResult?.cognitiveStyle || 'FI'
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const lvl = params.get('level') || '1'
        resetLevel()
        startLevel(parseInt(lvl), activeStyle)
        router.push(`/siswa/game/level/${lvl}`)
        return
      }
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const lvl = params.get('level')
      if (lvl && lvl !== targetLevel) {
        setTargetLevel(lvl)
      }
    }
  }, [router, resetLevel, startLevel, targetLevel])

  const handleAnswer = (optIdx: number) => {
    if (submitted) return
    setSelected(optIdx)
  }



  const handleNext = useCallback(() => {
    if (processingRef.current) return
    processingRef.current = true

    const newAnswers = [...answers]
    newAnswers[currentQ] = selected
    setAnswers(newAnswers)
    setSelected(null)
    setSubmitted(false)

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(prev => Math.min(prev + 1, QUESTIONS.length - 1))
    } else {
      // Hitung skor
      const totalScore = newAnswers.reduce<number>((acc, ans, i) => {
        return acc + (ans === QUESTIONS[i].correct ? 1 : 0)
      }, 0)
      const wrongCount = QUESTIONS.length - totalScore

      setScoreStats({ correct: totalScore, wrong: wrongCount })
      setShowPopup(true)
      setPhase('result')

      // Simpan ke API
      setSaving(true)
      let student: any = {}
      let activeStudentId = ''
      try {
        const stored = localStorage.getItem('student')
        if (stored) {
          student = JSON.parse(stored) || {}
          activeStudentId = student.id || ''
        }
      } catch (e) {
        console.error('Failed to parse student from localStorage', e)
      }

      if (!activeStudentId) {
        alert('Sesi siswa tidak ditemukan. Silakan login kembali.')
        localStorage.removeItem('student')
        router.push('/')
        processingRef.current = false
        setSaving(false)
        return
      }

      fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: activeStudentId, score: totalScore }),
      }).then(async res => {
        if (res.status === 404) {
          alert('Data siswa Anda tidak ditemukan di server. Silakan masuk kembali.')
          localStorage.removeItem('student')
          router.push('/')
          return
        }
        const data = await res.json()
        if (!res.ok) {
          alert(data.error || 'Gagal menyimpan hasil diagnostik')
          processingRef.current = false
          return
        }
        // Update localStorage
        const updated = { ...student, diagnosticScore: data.diagnosticScore, diagnosticLevel: data.diagnosticLevel }
        localStorage.setItem('student', JSON.stringify(updated))
      }).catch(err => {
        console.error(err)
        alert('Gagal terhubung ke server untuk menyimpan hasil.')
        processingRef.current = false
      }).finally(() => setSaving(false))
    }
  }, [selected, currentQ, answers, router])

  const q = QUESTIONS[currentQ]

  const renderNavbar = () => (
    <header style={{
      width: '100%',
      background: 'rgba(250,246,238, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(217,119,6, 0.08)',
      margin: '-24px -16px 24px -16px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1040px',
        margin: '0 auto',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div
          onClick={() => {
            if (phase === 'test') {
              setShowExitConfirm(true)
            } else {
              router.push('/siswa')
            }
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <motion.div
            animate={{ filter: ['drop-shadow(0 0 6px #D97706)', 'drop-shadow(0 0 14px #D97706)', 'drop-shadow(0 0 6px #D97706)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{ fontSize: '24px', lineHeight: 1 }}
          >
            🕵️
          </motion.div>
          <div>
            <div style={{
              fontWeight: 900, fontSize: '16px', letterSpacing: '0.5px',
              background: 'linear-gradient(90deg, #D97706, #EA580C)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-heading), sans-serif',
            }}>
              Skeptikos
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', fontWeight: 700, marginTop: '1px' }}>
              INVESTIGASI DATA
            </div>
          </div>
        </div>
      </div>
    </header>
  )

  return (
    <main style={{
      minHeight: '100vh',
      background: '#FAF6EE',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans, sans-serif)',
    }}>
      {/* Background grid + glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(217,119,6,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(217,119,6,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,119,6,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      {renderNavbar()}

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}>
        <AnimatePresence mode="wait">
          {/* ── INTRO ── */}
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              style={{
                width: '100%', maxWidth: '560px',
                background: 'rgba(217,119,6,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(180,140,80,0.12)',
                borderRadius: '24px',
                padding: 'clamp(24px, 5vw, 40px) clamp(20px, 5vw, 36px)',
                zIndex: 10,
                textAlign: 'center',
                color: '#1C1917',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                style={{ fontSize: '64px', marginBottom: '20px' }}
              >
                🕵️
              </motion.div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '2px', color: '#D97706', marginBottom: '12px' }}>
                TES DIAGNOSTIK LEVEL {targetLevel}
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2 }}>
                Ukur Kemampuan Statistika Awalmu!
              </h1>
              <p style={{ fontSize: '14px', color: '#78716C', lineHeight: 1.7, margin: '0 0 28px' }}>
                Sebelum memulai petualangan sebagai Detektif Data di Level {targetLevel}, kami perlu mengetahui kemampuan awal statistika kamu. Jawab <strong style={{ color: '#D97706' }}>{QUESTIONS.length} pertanyaan</strong> singkat dengan jujur — tidak ada yang benar atau salah!
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', textAlign: 'left' }}>
                {[
                  { icon: '⏱', text: `${QUESTIONS.length} soal pilihan ganda — tidak ada batas waktu` },
                  { icon: '📊', text: 'Hasil menentukan tingkat pemahaman awalmu' },
                  { icon: '🔒', text: 'Tes ini wajib dikerjakan sebelum memulai level' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 14px', background: 'rgba(217,119,6,0.04)', borderRadius: '12px', border: '1px solid rgba(217,119,6,0.12)' }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <span style={{ fontSize: '13px', color: '#57534E' }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setPhase('test')}
                style={{
                  width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
                  background: 'linear-gradient(90deg, #D97706, #EA580C)',
                  color: '#fff', fontSize: '15px', fontWeight: 800,
                  cursor: 'pointer', letterSpacing: '0.5px',
                  boxShadow: '0 4px 20px rgba(217,119,6,0.35)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
              >
                Mulai Tes Diagnostik 🚀
              </button>
            </motion.div>
          )}

          {/* ── TEST ── */}
          {phase === 'test' && (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              style={{
                width: '100%', maxWidth: '680px', zIndex: 10,
                display: 'flex', flexDirection: 'column', gap: '20px',
              }}
            >
              {/* Progress */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ flex: 1, height: '6px', background: 'rgba(180,140,80,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', background: 'linear-gradient(90deg, #D97706, #00cc6a)', borderRadius: '3px', boxShadow: '0 0 8px rgba(217,119,6,0.4)' }}
                    animate={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#78716C', whiteSpace: 'nowrap' }}>
                  {currentQ + 1} / {QUESTIONS.length}
                </span>
              </div>

              {/* Question card */}
              <div style={{
                background: 'rgba(217,119,6,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(180,140,80,0.12)',
                borderRadius: '24px',
                padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 28px)',
                color: '#1C1917',
              }}>
                <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '2px', color: '#D97706', marginBottom: '14px' }}>
                  SOAL {currentQ + 1} / {QUESTIONS.length}
                </div>
                <p style={{ fontSize: '16px', lineHeight: 1.7, margin: '0 0 24px', fontWeight: 600 }}>
                  {q.text}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {q.options.map((opt, i) => {
                    const isSelected = selected === i
                    
                    let bg = 'rgba(217,119,6,0.04)'
                    let border = '1px solid rgba(180,140,80,0.12)'
                    let color = '#44403C'
                    let boxShadow = 'none'
                    let showIcon: 'correct' | 'wrong' | 'check' | null = null

                    if (!submitted) {
                      if (isSelected) {
                        bg = 'rgba(217,119,6, 0.12)'
                        border = '2px solid #D97706'
                        color = '#1C1917'
                        boxShadow = '0 0 16px rgba(217,119,6, 0.35)'
                      }
                    } else {
                      const isCorrectAnswer = i === q.correct
                      if (isSelected) {
                        if (isCorrectAnswer) {
                          bg = 'rgba(217,119,6, 0.18)'
                          border = '2px solid #D97706'
                          color = '#D97706'
                          showIcon = 'correct'
                          boxShadow = '0 0 16px rgba(217,119,6, 0.25)'
                        } else {
                          bg = 'rgba(255, 51, 102, 0.18)'
                          border = '2px solid #FF3366'
                          color = '#ff8f8f'
                          showIcon = 'wrong'
                          boxShadow = '0 0 16px rgba(255, 51, 102, 0.25)'
                        }
                      } else if (isCorrectAnswer) {
                        bg = 'rgba(217,119,6, 0.08)'
                        border = '1px dashed #D97706'
                        color = '#6ee7b7'
                        showIcon = 'check'
                      } else {
                        bg = 'rgba(180,140,80,0.04)'
                        border = '1px solid rgba(180,140,80,0.08)'
                        color = '#A8A29E'
                      }
                    }

                    return (
                      <motion.button
                        key={i}
                        whileHover={!submitted ? { scale: 1.01, x: 4 } : {}}
                        whileTap={!submitted ? { scale: 0.99 } : {}}
                        onClick={() => handleAnswer(i)}
                        disabled={submitted}
                        style={{
                          width: '100%', padding: '12px 16px', borderRadius: '14px',
                          border, background: bg, color, boxShadow,
                          fontSize: '14px', fontWeight: 600, textAlign: 'left',
                          cursor: !submitted ? 'pointer' : 'default',
                          transition: 'all 0.2s', display: 'flex', gap: '12px', alignItems: 'center',
                          minHeight: '52px', touchAction: 'manipulation',
                        }}
                      >
                        <span style={{
                          minWidth: '26px', height: '26px', borderRadius: '50%',
                          background: isSelected && !submitted
                            ? '#D97706'
                            : submitted && isSelected && i === q.correct
                              ? '#D97706'
                              : submitted && isSelected && i !== q.correct
                                ? '#FF3366'
                                : 'rgba(180,140,80,0.12)',
                          color: (isSelected && !submitted) || (submitted && isSelected)
                            ? '#000'
                            : 'inherit',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 800, flexShrink: 0,
                          transition: 'all 0.2s'
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

                {!submitted ? (
                  <button
                    disabled={selected === null}
                    onClick={() => setSubmitted(true)}
                    style={{
                      width: '100%', marginTop: '20px', padding: '14px', borderRadius: '14px',
                      border: 'none', background: selected === null ? 'rgba(180,140,80,0.1)' : 'linear-gradient(90deg, #D97706, #EA580C)',
                      color: selected === null ? '#A8A29E' : '#fff',
                      fontSize: '14px', fontWeight: 800, cursor: selected === null ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s', boxShadow: selected === null ? 'none' : '0 4px 20px rgba(217,119,6,0.3)',
                    }}
                  >
                    Submit Jawaban
                  </button>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleNext}
                    style={{
                      width: '100%', marginTop: '20px', padding: '14px', borderRadius: '14px',
                      border: 'none', background: 'linear-gradient(90deg, #D97706, #EA580C)',
                      color: '#fff', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                      transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(217,119,6,0.3)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                  >
                    {currentQ < QUESTIONS.length - 1 ? 'Lanjut Soal Berikutnya →' : 'Lihat Hasil →'}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── RESULT ── */}
          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{
                width: '100%', maxWidth: '560px', zIndex: 10,
                background: 'rgba(217,119,6,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(180,140,80,0.15)',
                borderRadius: '28px',
                padding: 'clamp(24px, 5vw, 40px) clamp(20px, 5vw, 36px)',
                textAlign: 'center', color: '#1C1917',
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                style={{ fontSize: '72px', marginBottom: '16px' }}
              >
                🎉
              </motion.div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '2px', color: '#D97706', marginBottom: '10px' }}>
                TES DIAGNOSTIK SELESAI
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px' }}>
                Terima kasih sudah mengerjakan!
              </h2>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  margin: '20px 0',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  background: 'rgba(217,119,6,0.06)',
                  border: '1px solid rgba(217,119,6,0.2)',
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '10px' }}>🕵️</div>
                <p style={{ margin: 0, fontSize: '14px', color: '#44403C', lineHeight: 1.7 }}>
                  Jawabanmu sudah direkam dan akan digunakan untuk menyesuaikan <strong style={{ color: '#D97706' }}>pengalaman belajarmu</strong> secara personal. Setiap detektif punya kekuatan yang berbeda — dan kamu punya potensimu sendiri!
                </p>
              </motion.div>

              <p style={{ fontSize: '13px', color: '#78716C', margin: '0 0 24px', lineHeight: 1.6 }}>
                Persiapan selesai! Klik tombol di bawah ini untuk memulai misi penyelidikan detektif data.
              </p>

              <button
                onClick={() => {
                  const studentData = localStorage.getItem('student')
                  let activeStyle: 'FI' | 'FD' = 'FI'
                  if (studentData) {
                    try {
                      const s = JSON.parse(studentData)
                      activeStyle = s.geftResult?.cognitiveStyle || 'FI'
                    } catch (e) {
                      console.error(e)
                    }
                  }
                  resetLevel()
                  startLevel(parseInt(targetLevel), activeStyle)
                  window.location.href = `/siswa/game/level/${targetLevel}`
                }}
                disabled={saving}
                style={{
                  width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
                  background: saving ? 'rgba(217,119,6,0.3)' : 'linear-gradient(90deg, #D97706, #EA580C)',
                  color: '#fff', fontSize: '15px', fontWeight: 800,
                  cursor: saving ? 'wait' : 'pointer',
                  boxShadow: '0 4px 20px rgba(217,119,6,0.3)',
                  transition: 'all 0.2s',
                }}
              >
                {saving ? 'Menyimpan...' : 'Mulai Penyelidikan Misi →'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Result Popup Modal */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(250,246,238,0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              style={{
                width: '100%',
                maxWidth: '400px',
                background: '#FFFFFF',
                border: '1px solid rgba(180,140,80,0.15)',
                boxShadow: '0 8px 30px rgba(180,120,40,0.1)',
                borderRadius: '24px',
                padding: '32px 24px',
                textAlign: 'center',
                color: '#1C1917',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800 }}>Hasil Tes Diagnostik</h3>
              <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#78716C' }}>
                Berikut adalah rangkuman hasil pengerjaan tes diagnostik awal Anda:
              </p>

              {/* Stats Box */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '28px'
              }}>
                <div style={{
                  background: 'rgba(217,119,6, 0.05)',
                  border: '1px solid rgba(217,119,6, 0.15)',
                  borderRadius: '16px',
                  padding: '16px',
                }}>
                  <div style={{ fontSize: '11px', color: '#78716C', fontWeight: 700, marginBottom: '4px' }}>BENAR</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#D97706', fontFamily: 'var(--font-data)' }}>
                    {scoreStats.correct}
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255, 51, 102, 0.05)',
                  border: '1px solid rgba(255, 51, 102, 0.15)',
                  borderRadius: '16px',
                  padding: '16px',
                }}>
                  <div style={{ fontSize: '11px', color: '#78716C', fontWeight: 700, marginBottom: '4px' }}>SALAH</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#FF3366', fontFamily: 'var(--font-data)' }}>
                    {scoreStats.wrong}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowPopup(false)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(90deg, #D97706, #EA580C)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(217,119,6,0.3)',
                  transition: 'all 0.2s',
                }}
              >
                Lanjutkan
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(250,246,238, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(180,140,80,0.15)',
              borderRadius: '24px',
              padding: '28px',
              width: '380px',
              maxWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 20px 40px rgba(180,120,40,0.08)',
              color: '#1C1917',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#DC2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ Konfirmasi Keluar
              </h3>
              <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#78716C', lineHeight: 1.55, textAlign: 'left' }}>
                Apakah Anda yakin ingin keluar dari tes? Kemajuan Anda saat ini tidak akan disimpan.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowExitConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(180,140,80,0.2)',
                  background: 'transparent',
                  color: '#78716C',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(217,119,6,0.06)'
                  e.currentTarget.style.borderColor = 'rgba(217,119,6,0.3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'rgba(180,140,80,0.2)'
                }}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false)
                  router.push('/siswa')
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
              >
                Keluar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  )
}
