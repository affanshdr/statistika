'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion as motionClient, AnimatePresence as AnimatePresenceClient } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'
import '../../game.css'

interface Question {
  id: number
  text: string
  table?: { range: string; freq: number }[]
  options: string[]
  correct: number
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Tepi bawah dan tepi atas pada kelas keempat adalah....',
    table: [
      { range: '35-41', freq: 3 },
      { range: '42-48', freq: 8 },
      { range: '49-55', freq: 6 },
      { range: '56-62', freq: 12 },
      { range: '63-69', freq: 9 },
      { range: '70-76', freq: 2 },
    ],
    options: [
      '55,5 dan 61,5',
      '55,5 dan 62,5',
      '56,5 dan 62,5',
      '56,5 dan 61,5',
    ],
    correct: 1,
  },
  {
    id: 2,
    text: 'Selisih banyak siswa yang berat badannya kurang dari 56 dan lebih dari 62 adalah... orang.',
    table: [
      { range: '35-41', freq: 3 },
      { range: '42-48', freq: 8 },
      { range: '49-55', freq: 6 },
      { range: '56-62', freq: 12 },
      { range: '63-69', freq: 9 },
      { range: '70-76', freq: 2 },
    ],
    options: [
      '4 orang',
      '6 orang',
      '8 orang',
      '10 orang',
    ],
    correct: 1,
  },
  {
    id: 3,
    text: 'Dari hasil sensus tahun 2017 di sebuah desa terpencil, didapatkan data jumlah penduduk 80 orang dengan usia termuda 1 tahun dan usia tertua 57 tahun. Jika data tersebut dibuat daftar distribusi frekuensi kelompok dengan menggunakan aturan Sturges, panjang kelas yang mungkin adalah... (petunjuk : log 80 = 1,9)',
    options: [
      '6',
      '7',
      '8',
      '9',
    ],
    correct: 2,
  },
  {
    id: 4,
    text: 'Di era digital, setiap orang bisa menjadi pembuat sekaligus penyebar informasi (produsen data). Mengapa pemahaman yang baik tentang cara membaca rentang interval kelas pada tabel data kelompok sangat penting bagi seorang remaja?',
    options: [
      'Agar bisa memenangkan setiap perdebatan di kolom komentar media sosial dengan kata-kata yang rumit.',
      'Agar mampu menyaring informasi secara kritis dan tidak mudah terprovokasi oleh kesimpulan sepihak yang dibuat konten kreator.',
      'Agar bisa mendapatkan penghasilan tambahan sebagai komentator statistik di internet.',
      'Agar akun media sosialnya terhindar dari pemblokiran atau peretasan oleh pihak lain.',
    ],
    correct: 1,
  },
  {
    id: 5,
    text: 'Di media sosial, jika ada seseorang membagikan histogram hasil game yang bentuk batangnya sengaja dibuat sangat lebar untuk satu kelompok tertentu agar terlihat paling banyak, kemampuan digital apa yang kita gunakan jika kita berhasil menyadari kesalahan rentang kelas tersebut?',
    options: [
      'Literasi data dan media digital',
      'Keamanan sandi digital',
      'Etika berkomentar di internet',
      'Desain grafis modern',
    ],
    correct: 0,
  },
]

export default function PostTestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: levelIdStr } = use(params)
  const levelId = parseInt(levelIdStr) || 1
  const router = useRouter()
  const store = useGameStore()

  const [student, setStudent] = useState<any>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro')
  const [saving, setSaving] = useState(false)
  const [score, setScore] = useState(0)
  const [xpGained, setXpGained] = useState(0)

  useEffect(() => {
    const data = localStorage.getItem('student')
    if (!data) {
      router.push('/')
      return
    }
    setStudent(JSON.parse(data))
  }, [router])

  const handleNext = () => {
    if (selected === null) return
    const newAnswers = [...answers, selected]
    setAnswers(newAnswers)
    setSelected(null)

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      // Calculate final score
      const finalScore = newAnswers.reduce((acc, ans, index) => {
        return acc + (ans === QUESTIONS[index].correct ? 1 : 0)
      }, 0)
      setScore(finalScore)
      const earnedXp = finalScore * 10
      setXpGained(earnedXp)
      setPhase('result')

      // Save results
      if (student?.id) {
        setSaving(true)
        fetch('/api/game/posttest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: student.id,
            levelId,
            score: finalScore,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            // Update local Zustand store
            store.completePostTest(levelId)
            if (earnedXp > 0) {
              store.addXP(earnedXp, 'Post Test Level 1', 5)
            }
          })
          .catch(console.error)
          .finally(() => setSaving(false))
      }
    }
  }

  if (!student) {
    return (
      <div className="game-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1E2C' }}>
        <p style={{ color: '#94A3B8' }}>Loading student session...</p>
      </div>
    )
  }

  const q = QUESTIONS[currentQ]
  const progressPercent = ((currentQ + (phase === 'quiz' ? 0 : 0)) / QUESTIONS.length) * 100

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0B1E2C',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans, sans-serif)',
    }}>
      {/* Background grid + glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(14,131,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(14,131,136,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,131,136,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      {/* Header */}
      <header style={{
        width: '100%',
        background: 'rgba(11, 30, 44, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(14, 131, 136, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: '1040px',
          margin: '0 auto',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <motionClient.div
              animate={{ filter: ['drop-shadow(0 0 6px #00ADB5)', 'drop-shadow(0 0 14px #00ADB5)', 'drop-shadow(0 0 6px #00ADB5)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ fontSize: '24px', lineHeight: 1 }}
            >
              🕵️
            </motionClient.div>
            <div>
              <div style={{
                fontWeight: 900, fontSize: '16px', letterSpacing: '0.5px',
                background: 'linear-gradient(90deg, #00ADB5, #0E8388)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-heading), sans-serif',
              }}>
                Skeptikos
              </div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', fontWeight: 700, marginTop: '1px' }}>
                EVALUASI AKHIR MISI
              </div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 800, letterSpacing: '1px' }}>
            KASUS 1: THE VIRAL MYTH
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', zIndex: 10 }}>
        <AnimatePresenceClient mode="wait">
          {/* PHASE 1: INTRO */}
          {phase === 'intro' && (
            <motionClient.div
              key="intro"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              style={{
                width: '100%', maxWidth: '560px',
                background: 'rgba(15, 35, 56, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(14,131,136,0.25)',
                borderRadius: '24px',
                padding: '40px 32px',
                color: '#F8FAFC',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              }}
            >
              {/* Header section with badge & title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', textAlign: 'left' }}>
                <div style={{ flexShrink: 0 }}>
                  <svg width="100" height="100" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="60" cy="60" r="54" fill="url(#bg-grad)" stroke="rgba(14, 131, 136, 0.25)" strokeWidth="2" />
                    {/* Document */}
                    <rect x="38" y="30" width="44" height="60" rx="6" fill="#F8FAFC" />
                    <rect x="46" y="42" width="28" height="3" rx="1.5" fill="#CBD5E1" />
                    <rect x="46" y="50" width="28" height="3" rx="1.5" fill="#CBD5E1" />
                    <rect x="46" y="58" width="18" height="3" rx="1.5" fill="#CBD5E1" />
                    <rect x="46" y="66" width="22" height="3" rx="1.5" fill="#CBD5E1" />
                    {/* Pencil */}
                    <g transform="translate(72, 60) rotate(-45)">
                      <rect x="0" y="0" width="8" height="36" rx="2" fill="#FB923C" />
                      <rect x="0" y="32" width="8" height="4" rx="1" fill="#F43F5E" />
                      <rect x="0" y="30" width="8" height="2" fill="#E2E8F0" />
                      <path d="M 0 0 L 4 -8 L 8 0 Z" fill="#FDE047" />
                      <path d="M 3 -6 L 4 -8 L 5 -6 Z" fill="#1E293B" />
                    </g>
                    <defs>
                      <radialGradient id="bg-grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" transform="translate(60 60) rotate(90) scale(54)">
                        <stop stopColor="rgba(14, 131, 136, 0.4)"/>
                        <stop offset="1" stopColor="rgba(15, 35, 56, 0.6)"/>
                      </radialGradient>
                    </defs>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '2px', color: '#00ADB5', marginBottom: '8px' }}>
                    EVALUASI AKHIR MISI (POST TEST)
                  </div>
                  <h1 style={{ fontSize: '26px', fontWeight: 900, margin: 0, lineHeight: 1.2, color: '#F8FAFC' }}>
                    Evaluasi Akhir Misi<br />
                    <span style={{ color: '#00ADB5' }}>(Post Test)</span>
                  </h1>
                </div>
              </div>

              {/* Welcome box (Top box) */}
              <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                background: 'rgba(14, 131, 136, 0.04)',
                border: '1px solid rgba(14, 131, 136, 0.15)',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'left',
                marginBottom: '24px',
              }}>
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="15" fill="rgba(16, 185, 129, 0.1)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.5" />
                    <path d="M11 16L14.5 19.5L22 12" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#94A3B8' }}>
                  Selamat, <span style={{ color: '#00ADB5', fontWeight: 700 }}>Detektif!</span><br />
                  Kamu telah menyelesaikan penyelidikan data screen time. Sekarang saatnya menguji kembali pemahaman konsep statistika deskriptif yang telah kamu pelajari selama investigasi.
                </div>
              </div>

              {/* Side-by-side details */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                {/* Left detail card */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'rgba(14, 131, 136, 0.02)',
                  border: '1px solid rgba(14, 131, 136, 0.12)',
                  borderRadius: '16px',
                  padding: '24px 16px',
                  textAlign: 'center',
                }}>
                  <div style={{ marginBottom: '14px' }}>
                    <svg width="52" height="52" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="32" cy="32" r="28" fill="url(#cyan-grad)" />
                      <rect x="24" y="21" width="16" height="22" rx="3" fill="#FFFFFF" />
                      <path d="M28 21H36V19C36 17.8954 35.1046 17 34 17H30C28.8954 17 28 17.8954 28 19V21Z" fill="#00ADB5" />
                      <rect x="28" y="26" width="8" height="2" rx="1" fill="#E2E8F0" />
                      <rect x="28" y="31" width="8" height="2" rx="1" fill="#E2E8F0" />
                      <rect x="28" y="36" width="5" height="2" rx="1" fill="#E2E8F0" />
                      <defs>
                        <linearGradient id="cyan-grad" x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#00ADB5" />
                          <stop offset="1" stopColor="#0E8388" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#F8FAFC', marginBottom: '8px' }}>5 Soal Pilihan Ganda</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>Menguji pemahaman akhirmu.</div>
                </div>

                {/* Right detail card */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'rgba(14, 131, 136, 0.02)',
                  border: '1px solid rgba(14, 131, 136, 0.12)',
                  borderRadius: '16px',
                  padding: '24px 16px',
                  textAlign: 'center',
                }}>
                  <div style={{ marginBottom: '14px' }}>
                    <svg width="52" height="52" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="32" cy="32" r="28" fill="url(#purple-grad)" />
                      <rect x="22" y="32" width="4" height="12" rx="1" fill="#FFFFFF" />
                      <rect x="29" y="24" width="4" height="20" rx="1" fill="#FFFFFF" />
                      <rect x="36" y="28" width="4" height="16" rx="1" fill="#FFFFFF" />
                      <rect x="43" y="35" width="4" height="9" rx="1" fill="#FFFFFF" />
                      <defs>
                        <linearGradient id="purple-grad" x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#6366F1" />
                          <stop offset="1" stopColor="#4F46E5" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#F8FAFC', marginBottom: '8px' }}>Materi</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>Distribusi frekuensi dan histogram.</div>
                </div>
              </div>

              {/* Start button */}
              <motionClient.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPhase('quiz')}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(90deg, #00ADB5, #00cc6a)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 20px rgba(0, 173, 181, 0.35)',
                }}
              >
                {/* Rocket Icon */}
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5h5.5c2.31 0 4.24-1 5.5-2.5" />
                    <path d="m12.5 7.5 3 3L22 4l-3.5 6.5 3 3L13.5 22l-4-4 4-4-1-1H7.5l-3-3 8-7.5Z" />
                  </svg>
                </div>
                <span>Mulai Evaluasi</span>
                <span style={{ fontSize: '18px', fontWeight: 600 }}>→</span>
              </motionClient.button>
            </motionClient.div>
          )}

          {/* PHASE 2: QUIZ */}
          {phase === 'quiz' && (
            <motionClient.div
              key="quiz"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              style={{ width: '100%', maxWidth: '640px' }}
            >
              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', marginBottom: '24px' }}>
                <div style={{ flex: 1, height: '6px', background: 'rgba(14, 131, 136, 0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                  <motionClient.div
                    style={{ height: '100%', background: 'linear-gradient(90deg, #0E8388, #00cc6a)', borderRadius: '3px', boxShadow: '0 0 8px rgba(0, 173, 181, 0.4)' }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8', whiteSpace: 'nowrap' }}>
                  {currentQ + 1} / {QUESTIONS.length}
                </span>
              </div>

              {/* Question Card */}
              <div style={{
                background: 'rgba(15, 35, 56, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(14, 131, 136, 0.25)',
                borderRadius: '24px',
                padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 28px)',
                color: '#F8FAFC',
                marginBottom: '20px',
              }}>
                <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '2px', color: '#00ADB5', marginBottom: '14px' }}>
                  SOAL {currentQ + 1} / {QUESTIONS.length}
                </div>
                <h3 style={{ fontSize: '16px', lineHeight: 1.7, margin: '0 0 24px', fontWeight: 600, color: '#F8FAFC' }}>
                  {q.text}
                </h3>

                {q.table && (
                  <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      border: '1px solid rgba(14, 131, 136, 0.2)',
                      fontSize: '13px',
                      background: 'rgba(15, 35, 56, 0.5)',
                    }}>
                      <thead>
                        <tr style={{ background: 'rgba(14, 131, 136, 0.1)' }}>
                          <th style={{ border: '1px solid rgba(14, 131, 136, 0.2)', padding: '10px', fontWeight: 800, color: '#00ADB5', textAlign: 'center' }}>Berat Badan (kg)</th>
                          <th style={{ border: '1px solid rgba(14, 131, 136, 0.2)', padding: '10px', fontWeight: 800, color: '#00ADB5', textAlign: 'center' }}>Frekuensi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {q.table.map((row, idx) => (
                          <tr key={idx} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(14, 131, 136, 0.04)' }}>
                            <td style={{ border: '1px solid rgba(14, 131, 136, 0.2)', padding: '8px 10px', color: '#E2E8F0', textAlign: 'center', fontWeight: 600 }}>{row.range}</td>
                            <td style={{ border: '1px solid rgba(14, 131, 136, 0.2)', padding: '8px 10px', color: '#E2E8F0', textAlign: 'center', fontWeight: 600 }}>{row.freq}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {q.options.map((option, idx) => {
                    const isSelected = selected === idx
                    return (
                      <motionClient.button
                        key={idx}
                        onClick={() => setSelected(idx)}
                        whileHover={{ scale: 1.01, x: 4 }}
                        whileTap={{ scale: 0.99 }}
                        style={{
                          textAlign: 'left',
                          padding: '16px 20px',
                          borderRadius: '14px',
                          border: isSelected ? '2px solid #00ADB5' : '1px solid rgba(14, 131, 136, 0.15)',
                          background: isSelected ? 'rgba(14, 131, 136, 0.12)' : 'rgba(14, 131, 136, 0.04)',
                          color: isSelected ? '#FFFFFF' : '#E2E8F0',
                          fontWeight: isSelected ? 800 : 500,
                          fontSize: '14px',
                          cursor: 'pointer',
                          outline: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          boxShadow: isSelected ? '0 0 16px rgba(0, 173, 181, 0.25)' : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          border: isSelected ? '2px solid #00ADB5' : '1px solid rgba(14, 131, 136, 0.3)',
                          background: isSelected ? '#00ADB5' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: 900,
                          color: isSelected ? '#FFFFFF' : '#94A3B8',
                          flexShrink: 0,
                        }}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span style={{ lineHeight: 1.5 }}>{option}</span>
                      </motionClient.button>
                    )
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <motionClient.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={selected === null}
                  onClick={handleNext}
                  style={{
                    padding: '14px 36px',
                    borderRadius: '12px',
                    border: 'none',
                    background: selected === null ? 'rgba(14, 131, 136, 0.1)' : 'linear-gradient(90deg, #0E8388, #00ADB5)',
                    color: selected === null ? '#5F7D95' : '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: selected === null ? 'not-allowed' : 'pointer',
                    boxShadow: selected === null ? 'none' : '0 4px 16px rgba(0, 173, 181, 0.3)',
                    transition: 'all 0.2s',
                  }}
                >
                  {currentQ === QUESTIONS.length - 1 ? 'Selesai Evaluasi' : 'Selanjutnya →'}
                </motionClient.button>
              </div>
            </motionClient.div>
          )}

          {/* PHASE 3: RESULT */}
          {phase === 'result' && (
            <motionClient.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                width: '100%', maxWidth: '580px',
                background: 'rgba(15, 35, 56, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(14, 131, 136, 0.25)',
                borderRadius: '24px',
                padding: '40px 32px',
                textAlign: 'center',
                color: '#F8FAFC',
              }}
            >
              <div style={{ fontSize: '72px', marginBottom: '16px' }}>🏆</div>
              <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#F8FAFC', margin: '0 0 4px' }}>
                Evaluasi Selesai!
              </h2>
              <p style={{ color: '#94A3B8', fontSize: '14px', margin: '0 0 24px' }}>
                Hasil Post Test untuk <strong>Kasus 1: The Viral Myth</strong>
              </p>

              {/* Score display */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '20px',
                marginBottom: '32px',
              }}>
                <div style={{
                  padding: '16px 24px',
                  background: 'rgba(0, 173, 181, 0.06)',
                  border: '1px solid rgba(0, 173, 181, 0.15)',
                  borderRadius: '16px',
                  minWidth: '120px',
                }}>
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '4px' }}>SKOR KAMU</div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#00ADB5' }}>
                    {score * 20} <span style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>/100</span>
                  </div>
                </div>

                <div style={{
                  padding: '16px 24px',
                  background: 'rgba(0, 204, 106, 0.06)',
                  border: '1px solid rgba(0, 204, 106, 0.15)',
                  borderRadius: '16px',
                  minWidth: '120px',
                }}>
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '4px' }}>XP DIPEROLEH</div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#00cc6a' }}>
                    +{xpGained} <span style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>XP</span>
                  </div>
                </div>
              </div>

              {/* Performance description */}
              <div style={{
                background: 'rgba(14, 131, 136, 0.04)',
                borderRadius: '16px',
                border: '1px solid rgba(14, 131, 136, 0.15)',
                padding: '16px',
                fontSize: '13px',
                lineHeight: 1.6,
                color: '#E2E8F0',
                textAlign: 'left',
                marginBottom: '32px',
              }}>
                {score === 5 && 'Luar biasa, Detektif! Kamu menjawab semua pertanyaan dengan benar. Pemahaman konsep statistikamu sudah sangat kokoh. Level berikutnya telah terbuka!'}
                {score >= 3 && score < 5 && 'Kerja bagus! Kamu berhasil melewati evaluasi dengan baik. Ada beberapa poin kecil yang bisa diperbaiki, tetapi kamu siap untuk maju ke level berikutnya!'}
                {score < 3 && 'Evaluasi selesai. Kamu sebaiknya membaca ulang Buku Saku Detektif untuk memperkuat pemahaman mengenai mean, median, dan outlier. Namun, petualanganmu tetap berlanjut!'}
              </div>

              <motionClient.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/siswa/game/results/${levelId}`)}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(90deg, #0E8388, #00ADB5)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 20px rgba(0, 173, 181, 0.35)',
                }}
              >
                Lihat Hasil Penyelidikan & Lencana →
              </motionClient.button>
            </motionClient.div>
          )}
        </AnimatePresenceClient>
      </div>
    </main>
  )
}
