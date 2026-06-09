'use client'

import { use, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'
import { BADGES, CORRECT_VERDICT, VERDICT_EXPLANATION, LEVEL1_CONFIG } from '../../_data/level1'
import '../../game.css'

// Dynamic confetti
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
  const [showBadges, setShowBadges] = useState(false)

  const isCorrect = store.verdictAnswer === CORRECT_VERDICT

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    if (isCorrect) setConfetti(true)
    setTimeout(() => { setConfetti(false); setShowBadges(true) }, 4000)
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

    // Save game session
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

    // Update leaderboard
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

  // Compute metrics
  const timeTotalSec = store.cognitiveStyle === 'FD' ? 900 : 600
  const elapsedSec = store.sessionStartTime
    ? Math.floor((Date.now() - store.sessionStartTime) / 1000)
    : 0
  const elapsedMin = Math.floor(elapsedSec / 60)
  const elapsedSecs = elapsedSec % 60
  const limitMin = Math.floor(timeTotalSec / 60)

  // Calculate accuracy (steps where xpBreakdown has entries = correct steps)
  const totalSteps = 6
  const correctSteps = store.xpBreakdown.filter(e => e.xp === 10).length
  const accuracy = Math.round((correctSteps / totalSteps) * 100)

  const newBadges = store.badges.map(id => BADGE_DEFS.find(b => b.id === id)).filter(Boolean)

  return (
    <div className="game-root" style={{ minHeight: '100vh' }}>
      {/* Confetti */}
      {confetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          colors={['#00FF88', '#00ccff', '#FFD700', '#FF6B35', '#fff']}
          numberOfPieces={200}
          gravity={0.15}
        />
      )}

      {/* Header */}
      <header style={{
        padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--game-border)', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ fontWeight: 800, fontSize: '16px' }}>🕵️ Mission Report</div>
        <button className="game-btn game-btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={() => router.push('/siswa/game/lobby')}>
          Lobby
        </button>
      </header>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 20px', position: 'relative', zIndex: 1 }}>

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '32px' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
            style={{ fontSize: '72px', marginBottom: '16px' }}
          >
            {isCorrect ? '🏆' : '📋'}
          </motion.div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px' }}>
            {isCorrect ? 'Investigasi Selesai!' : 'Level Selesai'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
            {LEVEL1_CONFIG.title}
          </p>
        </motion.div>

        {/* ── Stats grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'XP Diperoleh', val: `${store.xp} XP`, icon: '⚡', color: 'var(--accent)' },
            { label: 'Akurasi', val: `${accuracy}%`, icon: '🎯', color: accuracy >= 80 ? 'var(--accent)' : 'var(--warning)' },
            { label: 'Nyawa Tersisa', val: `${store.lives} / ${store.cognitiveStyle === 'FD' ? 4 : 3}`, icon: '❤️', color: '#FF6B35' },
            { label: 'Waktu', val: `${elapsedMin}:${elapsedSecs.toString().padStart(2,'0')} / ${limitMin}:00`, icon: '⏱', color: 'var(--info)' },
          ].map(({ label, val, icon, color }, i) => (
            <motion.div
              key={label}
              className="game-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              style={{ textAlign: 'center', padding: '20px' }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', marginBottom: '6px' }}>{label}</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color, fontFamily: 'var(--font-data)' }}>{val}</div>
            </motion.div>
          ))}
        </div>

        {/* ── XP Breakdown ── */}
        {store.xpBreakdown.length > 0 && (
          <motion.div
            className="game-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ marginBottom: '24px' }}
          >
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>
              ⚡ RINCIAN XP
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {store.xpBreakdown.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Step {item.step}: {item.label}</span>
                  <span style={{ fontFamily: 'var(--font-data)', color: 'var(--accent)', fontWeight: 700, fontSize: '13px' }}>+{item.xp} XP</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(0,255,136,0.08)', borderRadius: '8px', borderTop: '1px solid var(--game-border-accent)', marginTop: '4px' }}>
                <span style={{ fontWeight: 800 }}>TOTAL</span>
                <span style={{ fontFamily: 'var(--font-data)', color: 'var(--accent)', fontWeight: 800, fontSize: '16px' }}>{store.xp} XP</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Badges ── */}
        <AnimatePresence>
          {showBadges && newBadges.length > 0 && (
            <motion.div
              className="game-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: '24px' }}
            >
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>
                🏅 BADGE YANG DIPEROLEH
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {newBadges.map((badge, i) => badge && (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.15, type: 'spring', stiffness: 300 }}
                    style={{ textAlign: 'center', padding: '16px', background: 'var(--accent-dim)', border: '1px solid var(--game-border-accent)', borderRadius: '16px', minWidth: '100px' }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '6px' }}>{badge.icon}</div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent)' }}>{badge.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{badge.desc}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Verdict analysis ── */}
        <motion.div
          className="game-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ marginBottom: '24px' }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>
            🔍 ANALISIS VERDICT
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', minWidth: '140px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>VERDICTMU</div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: isCorrect ? 'var(--accent)' : 'var(--danger)' }}>
                {store.verdictAnswer ?? '—'} {isCorrect ? '✅' : '❌'}
              </div>
            </div>
            <div style={{ flex: 1, padding: '14px', background: 'rgba(0,255,136,0.06)', borderRadius: '12px', border: '1px solid var(--game-border-accent)', minWidth: '140px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>VERDICT BENAR</div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--accent)' }}>MISLEADING ⚠️</div>
            </div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(0,255,136,0.04)', border: '1px solid var(--game-border-accent)', borderRadius: '12px', fontSize: '14px', lineHeight: 1.7, color: 'rgba(255,255,255,0.8)' }}
            dangerouslySetInnerHTML={{ __html: `<strong>Penjelasan:</strong> ${VERDICT_EXPLANATION}` }}
          />
        </motion.div>

        {/* ── Summary text ── */}
        <motion.div
          className="game-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ marginBottom: '32px' }}
        >
          <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px' }}>
            📌 RINGKASAN INVESTIGASI
          </div>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
            Kamu berhasil mengungkap bahwa klaim &quot;95% siswa SMA setuju sekolah diliburkan&quot; adalah <strong style={{ color: 'var(--warning)' }}>MISLEADING</strong> karena data yang dianalisis adalah jumlah <em>share per jam</em>, bukan hasil survei opini siswa. Ini adalah contoh nyata <strong>sampling bias</strong> dalam klaim statistik yang viral di media sosial.
          </p>
        </motion.div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="game-btn game-btn-primary" onClick={() => router.push('/siswa/game/lobby')}>
            ← Kembali ke Lobby
          </button>
          <button className="game-btn game-btn-secondary" onClick={() => { store.resetLevel(); router.push('/siswa/game/level/1') }}>
            🔄 Main Lagi
          </button>
          <button className="game-btn game-btn-secondary" onClick={() => router.push('/siswa')}>
            Dashboard
          </button>
        </div>

      </div>
    </div>
  )
}
