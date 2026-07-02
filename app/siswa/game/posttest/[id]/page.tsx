'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion as motionClient, AnimatePresence as AnimatePresenceClient } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'
import '../../game.css'

const QUESTIONS = [
  {
    id: 1,
    text: 'Jika sebuah kumpulan data memiliki nilai rata-rata (mean) yang jauh lebih besar daripada median-nya, bentuk distribusi data tersebut kemungkinan adalah...',
    options: [
      'Menjulur ke kiri (skewed left)',
      'Menjulur ke kanan (skewed right)',
      'Simetris sempurna (normal)',
      'Seragam dan datar (uniform)',
    ],
    correct: 1,
  },
  {
    id: 2,
    text: 'Mengapa median sering kali dianggap lebih representatif dibandingkan rata-rata (mean) untuk mendeskripsikan pusat data yang memiliki outlier ekstrem?',
    options: [
      'Karena median selalu memiliki nilai yang lebih besar daripada rata-rata.',
      'Karena median tidak terpengaruh oleh nilai ekstrem (outlier), sedangkan rata-rata sangat sensitif terhadap outlier.',
      'Karena median hanya menghitung nilai yang paling sering muncul di dalam data.',
      'Karena median lebih mudah digambarkan pada diagram lingkaran.',
    ],
    correct: 1,
  },
  {
    id: 3,
    text: 'Dalam diagram histogram, sumbu mendatar (horizontal) dan sumbu tegak (vertical) masing-masing mewakili...',
    options: [
      'Frekuensi kelas interval dan Nilai data individu',
      'Nilai individu dan Rentang data total',
      'Kelas interval data dan Frekuensi (jumlah data)',
      'Nama kategori data dan Persentase kumulatif',
    ],
    correct: 2,
  },
  {
    id: 4,
    text: 'Jika kita mendeteksi dan menghapus sebuah pencilan (outlier) yang nilainya sangat tinggi dari dataset kita, bagaimana dampaknya pada nilai rata-rata (mean)?',
    options: [
      'Nilai mean akan menurun.',
      'Nilai mean akan meningkat.',
      'Nilai mean akan tetap sama.',
      'Nilai mean akan langsung menjadi nol.',
    ],
    correct: 0,
  },
  {
    id: 5,
    text: 'Sebuah artikel berita daring mengklaim: "Rata-rata uang jajan siswa di sekolah X adalah Rp100.000/hari". Kenyataannya, 1 anak pejabat memiliki jajan Rp2.000.000/hari, sedangkan 29 anak lainnya hanya Rp20.000/hari. Bentuk distorsi data apa yang terjadi pada klaim berita tersebut?',
    options: [
      'Bias pengukuran karena kesalahan input hitungan.',
      'Outlier distortion, di mana rata-rata (mean) terdistorsi oleh nilai ekstrem tunggal sehingga tidak mewakili mayoritas.',
      'Bias seleksi sampel karena jumlah responden kurang dari 10.',
      'Tidak ada distorsi, klaim berita tersebut adil karena rata-rata aritmatika memang Rp100.000.',
    ],
    correct: 1,
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
      <div className="game-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading student session...</p>
      </div>
    )
  }

  const q = QUESTIONS[currentQ]
  const progressPercent = ((currentQ + (phase === 'quiz' ? 0 : 0)) / QUESTIONS.length) * 100

  return (
    <div className="game-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--game-border)', background: 'rgba(250,246,238,0.95)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ fontWeight: 900, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1C1917' }}>
          🕵️‍♂️ Post Test Investigasi
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>
          Kasus 1: The Viral Myth
        </div>
      </header>

      {/* Main Content Container */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
        <AnimatePresenceClient mode="wait">
          {/* PHASE 1: INTRO */}
          {phase === 'intro' && (
            <motionClient.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                width: '100%', maxWidth: '580px',
                background: '#FFFFFF',
                borderRadius: '24px',
                border: '1px solid rgba(180,140,80,0.2)',
                boxShadow: '0 8px 32px rgba(180,120,40,0.08)',
                padding: '40px 32px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1C1917', margin: '0 0 12px' }}>
                Evaluasi Akhir Misi (Post Test)
              </h2>
              <p style={{ color: '#57534E', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px' }}>
                Selamat, Detektif! Kamu telah menyelesaikan penyelidikan data screen time. Sekarang saatnya menguji kembali pemahaman konsep statistika deskriptif yang telah kamu pelajari selama investigasi.
              </p>
              <div style={{
                background: 'rgba(217,119,6,0.05)',
                border: '1px solid rgba(217,119,6,0.15)',
                borderRadius: '16px',
                padding: '16px',
                textAlign: 'left',
                marginBottom: '32px',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#D97706', marginBottom: '8px', letterSpacing: '0.5px' }}>INFO EVALUASI:</div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#44403C', lineHeight: 1.6 }}>
                  <li>Jumlah soal: <strong>5 Pilihan Ganda</strong></li>
                  <li>Materi: Histogram, Outlier, dan Ukuran Pemusatan (Mean/Median)</li>
                  <li>Hadiah: <strong>+10 XP</strong> untuk setiap jawaban yang benar</li>
                </ul>
              </div>
              <motionClient.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPhase('quiz')}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(90deg, #D97706, #EA580C)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(217,119,6,0.25)',
                }}
              >
                Mulai Evaluasi →
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
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span>PERTANYAAN {currentQ + 1} DARI {QUESTIONS.length}</span>
                  <span>{Math.round(progressPercent)}% SELESAI</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(180,140,80,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                  <motionClient.div
                    style={{ height: '100%', background: 'linear-gradient(90deg, #D97706, #EA580C)' }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                border: '1px solid rgba(180,140,80,0.2)',
                boxShadow: '0 8px 32px rgba(180,120,40,0.06)',
                padding: '32px',
                marginBottom: '20px',
              }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1C1917', lineHeight: 1.6, margin: '0 0 24px' }}>
                  {q.text}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {q.options.map((option, idx) => {
                    const isSelected = selected === idx
                    return (
                      <motionClient.button
                        key={idx}
                        onClick={() => setSelected(idx)}
                        whileHover={{ scale: 1.01, borderColor: isSelected ? '#D97706' : 'rgba(217,119,6,0.3)' }}
                        style={{
                          textAlign: 'left',
                          padding: '16px 20px',
                          borderRadius: '14px',
                          border: isSelected ? '2px solid #D97706' : '1px solid rgba(180,140,80,0.25)',
                          background: isSelected ? 'rgba(217,119,6,0.04)' : '#FAFAF8',
                          color: '#292524',
                          fontWeight: isSelected ? 800 : 500,
                          fontSize: '14px',
                          cursor: 'pointer',
                          outline: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          transition: 'background-color 0.2s, border-color 0.2s',
                        }}
                      >
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          border: isSelected ? '2px solid #D97706' : '1px solid rgba(180,140,80,0.4)',
                          background: isSelected ? '#D97706' : '#FFFFFF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: 900,
                          color: isSelected ? '#FFFFFF' : '#78716C',
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
                    padding: '12px 36px',
                    borderRadius: '12px',
                    border: 'none',
                    background: selected === null ? '#E7E5E4' : 'linear-gradient(90deg, #D97706, #EA580C)',
                    color: selected === null ? '#A8A29E' : '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: selected === null ? 'not-allowed' : 'pointer',
                    boxShadow: selected === null ? 'none' : '0 4px 16px rgba(217,119,6,0.2)',
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
                background: '#FFFFFF',
                borderRadius: '24px',
                border: '1px solid rgba(180,140,80,0.2)',
                boxShadow: '0 12px 48px rgba(180,120,40,0.1)',
                padding: '40px 32px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '72px', marginBottom: '16px' }}>🏆</div>
              <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#1C1917', margin: '0 0 4px' }}>
                Evaluasi Selesai!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 24px' }}>
                Hasil Post Test untuk <strong>Kasus 1: The Viral Myth</strong>
              </p>

              {/* Score display */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '20px',
                marginBottom: '32px',
              }}>
                <div style={{
                  padding: '16px 24px',
                  background: 'rgba(217,119,6,0.06)',
                  border: '1px solid rgba(217,119,6,0.15)',
                  borderRadius: '16px',
                  minWidth: '120px',
                }}>
                  <div style={{ fontSize: '10px', color: '#78716C', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '4px' }}>SKOR KAMU</div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#D97706' }}>
                    {score * 20} <span style={{ fontSize: '14px', fontWeight: 500, color: '#78716C' }}>/100</span>
                  </div>
                </div>

                <div style={{
                  padding: '16px 24px',
                  background: 'rgba(37,99,235,0.06)',
                  border: '1px solid rgba(37,99,235,0.15)',
                  borderRadius: '16px',
                  minWidth: '120px',
                }}>
                  <div style={{ fontSize: '10px', color: '#475569', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '4px' }}>XP DIPEROLEH</div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#2563EB' }}>
                    +{xpGained} <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>XP</span>
                  </div>
                </div>
              </div>

              {/* Performance description */}
              <div style={{
                background: '#FAFAF8',
                borderRadius: '16px',
                border: '1px solid rgba(180,140,80,0.12)',
                padding: '16px',
                fontSize: '13px',
                lineHeight: 1.6,
                color: '#44403C',
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
                onClick={() => router.push('/')}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(90deg, #D97706, #EA580C)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(217,119,6,0.25)',
                }}
              >
                Kembali ke Beranda
              </motionClient.button>
            </motionClient.div>
          )}
        </AnimatePresenceClient>
      </div>
    </div>
  )
}
