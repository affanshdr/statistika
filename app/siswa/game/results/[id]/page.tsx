'use client'

import { use, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'
import { BADGES, CORRECT_VERDICT, VERDICT_EXPLANATION, LEVEL1_CONFIG } from '../../_data/level1'
import '../../game.css'

import dynamic from 'next/dynamic'
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false })

const BADGE_DEFS = Object.values(BADGES)

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const store = useGameStore()
  const savedRef = useRef(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [confetti, setConfetti] = useState(false)
  const [showContent, setShowContent] = useState(false)

  const isCorrect = store.verdictAnswer === CORRECT_VERDICT

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    if (isCorrect) setConfetti(true)
    setTimeout(() => { setConfetti(false); setShowContent(true) }, 2500)
  }, [isCorrect])

  // Save session to DB + update leaderboard once
  useEffect(() => {
    if (savedRef.current) return
    savedRef.current = true

    const student = JSON.parse(localStorage.getItem('student') ?? '{}')
    if (!student.id) return

    const elapsed = store.sessionStartTime
      ? Math.floor((Date.now() - store.sessionStartTime) / 1000)
      : 0

    fetch('/api/game/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        levelId: 1,
        cognitiveStyle: store.cognitiveStyle,
        xpEarned: store.xp,
        livesRemaining: store.lives,
        timeTaken: elapsed,
        verdictAnswer: store.verdictAnswer ?? '',
        isCorrect,
      }),
    }).catch(console.error)

    fetch('/api/game/leaderboard', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        username: student.name,
        xpToAdd: store.xp,
        newBadges: store.badges,
      }),
    }).catch(console.error)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const newBadges = store.badges.map(id => BADGE_DEFS.find(b => b.id === id)).filter(Boolean)

  const handleDownloadBukuSaku = async () => {
    try {
      const url = 'https://tmdbqikqflbeqaqllxge.supabase.co/storage/v1/object/public/Asset/Buku%20Saku.jpeg'
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = 'Buku Saku Level 1.jpeg'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      // Fallback: open in new tab
      window.open('https://tmdbqikqflbeqaqllxge.supabase.co/storage/v1/object/public/Asset/Buku%20Saku.jpeg', '_blank')
    }
  }

  return (
    <div className="game-root" style={{ minHeight: '100vh' }}>
      {confetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          colors={['#D97706', '#EA580C', '#FFD700', '#FF6B35', '#fff']}
          numberOfPieces={200}
          gravity={0.15}
        />
      )}

      {/* Header */}
      <header style={{
        padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--game-border)', background: 'rgba(250,246,238,0.8)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <motion.img
            src="https://tmdbqikqflbeqaqllxge.supabase.co/storage/v1/object/public/Asset/Agent.png"
            onError={(e) => { e.currentTarget.src = '/dira-avatar.png' }}
            alt="DiRA"
            style={{ height: '32px', objectFit: 'contain' }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          />
          Mission Report
        </div>
        <button
          className="game-btn game-btn-secondary"
          style={{ fontSize: '13px', padding: '8px 16px' }}
          onClick={() => router.push('/siswa')}
        >
          ← Dashboard
        </button>
      </header>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px 48px', position: 'relative', zIndex: 1 }}>

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '36px' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
            style={{ fontSize: '72px', marginBottom: '12px', lineHeight: 1 }}
          >
            {isCorrect ? '🏆' : '📋'}
          </motion.div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px' }}>
            {isCorrect ? 'Investigasi Selesai!' : 'Level Selesai'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 4px' }}>
            {LEVEL1_CONFIG.title}
          </p>
        </motion.div>

        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >

              {/* ── Badge yang diperoleh ── */}
              {newBadges.length > 0 && (
                <motion.div
                  className="game-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '16px' }}>
                    🏅 BADGE YANG DIPEROLEH
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {newBadges.map((badge, i) => badge && (
                      <motion.div
                        key={badge.id}
                        initial={{ scale: 0, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 300 }}
                        style={{
                          textAlign: 'center', padding: '16px 20px',
                          background: 'var(--accent-dim)',
                          border: '1px solid var(--game-border-accent)',
                          borderRadius: '16px', minWidth: '110px',
                          flex: '1 1 110px', maxWidth: '160px',
                        }}
                      >
                        <div style={{ fontSize: '34px', marginBottom: '6px' }}>{badge.icon}</div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)' }}>{badge.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.4 }}>{badge.desc}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Analisis Verdict ── */}
              <motion.div
                className="game-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '4px' }}>
                  🔍 ANALISIS VERDICT
                </div>
                {/* Apa itu verdict */}
                <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#A8A29E', lineHeight: 1.5 }}>
                  <strong style={{ color: '#78716C' }}>Verdict</strong> adalah kesimpulan akhir dari analisis data — apakah klaim berita bisa dipercaya, menyesatkan, atau hoaks berdasarkan bukti statistik yang kamu temukan.
                </p>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  {/* Verdictmu */}
                  <div style={{
                    flex: 1, padding: '12px 16px',
                    background: isCorrect ? 'rgba(217,119,6,0.06)' : 'rgba(239,68,68,0.06)',
                    border: `1px solid ${isCorrect ? 'rgba(217,119,6,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    borderRadius: '12px', minWidth: '130px',
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '6px', letterSpacing: '1px' }}>VERDICTMU</div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: isCorrect ? 'var(--accent)' : 'var(--danger)' }}>
                      {store.verdictAnswer ?? '—'} {isCorrect ? '✅' : '❌'}
                    </div>
                  </div>
                  {/* Verdict benar */}
                  <div style={{
                    flex: 1, padding: '12px 16px',
                    background: 'rgba(217,119,6,0.06)',
                    border: '1px solid rgba(217,119,6,0.25)',
                    borderRadius: '12px', minWidth: '130px',
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '6px', letterSpacing: '1px' }}>VERDICT BENAR</div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--accent)' }}>MISLEADING ⚠️</div>
                  </div>
                </div>

                <div style={{
                  padding: '14px', background: 'rgba(217,119,6,0.04)',
                  border: '1px solid var(--game-border-accent)', borderRadius: '10px',
                  fontSize: '13px', lineHeight: 1.7, color: '#44403C',
                }}
                  dangerouslySetInnerHTML={{ __html: `<strong>Penjelasan:</strong> ${VERDICT_EXPLANATION}` }}
                />
              </motion.div>

              {/* ── Ringkasan Investigasi ── */}
              <motion.div
                className="game-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '12px' }}>
                  📌 RINGKASAN INVESTIGASI
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '13px', lineHeight: 1.75, color: '#44403C' }}>
                  Dalam investigasi ini, kamu menganalisis data <em>screen time</em> dari <strong>35 siswa</strong> untuk memverifikasi klaim viral:{' '}
                  <em>&quot;Remaja Indonesia rata-rata habiskan &gt;8 jam/hari di medsos.&quot;</em>
                </p>
                <p style={{ margin: '0 0 10px', fontSize: '13px', lineHeight: 1.75, color: '#44403C' }}>
                  Setelah menyusun <strong>histogram distribusi frekuensi</strong> dan menghitung statistik dasar, ditemukan bahwa nilai mean sebenarnya jauh di bawah 8 jam. Klaim tersebut terbukti{' '}
                  <strong style={{ color: 'var(--warning)' }}>MISLEADING</strong> — angka yang digunakan dalam berita distorsi oleh data ekstrem (outlier).
                </p>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.75, color: '#44403C' }}>
                  Ini adalah contoh nyata <strong>sampling bias</strong> dan manipulasi statistik dalam berita viral. Kemampuan membaca data seperti ini adalah senjata utama seorang detektif literasi digital!
                </p>
              </motion.div>

              {/* ── Download Buku Saku ── */}
              <motion.div
                className="game-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(217,119,6,0.06) 0%, rgba(0,180,200,0.06) 100%)',
                  border: '1px solid rgba(217,119,6,0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '6px' }}>
                      📖 BUKU SAKU DETEKTIF
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#57534E', lineHeight: 1.5 }}>
                      Simpan rangkuman konsep statistika, rumus kunci, dan tips membaca data sebagai referensimu!
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleDownloadBukuSaku}
                    style={{
                      flexShrink: 0,
                      padding: '12px 22px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(90deg, #D97706, #EA580C)',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(217,119,6,0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    ⬇ Download PNG
                  </motion.button>
                </div>
              </motion.div>

              {/* ── Action — Kembali ke Lobby ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ display: 'flex', justifyContent: 'center', paddingTop: '8px' }}
              >
                <motion.button
                  className="game-btn game-btn-primary"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/siswa')}
                  style={{ padding: '14px 40px', fontSize: '15px', fontWeight: 800, borderRadius: '14px' }}
                >
                  ← Kembali ke Dashboard
                </motion.button>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
