'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'
import '../game.css'

type Student = {
  id: string
  name: string
  nisn: string
  geftStatus: string
  classroom: { name: string }
  geftResult?: { cognitiveStyle: 'FI' | 'FD'; score: number }
}

type LeaderEntry = { username: string; totalXp: number; badges: string[]; studentId: string }

const LEVELS = [
  {
    id: 1,
    icon: '🎬',
    title: 'Kasus: Video Viral yang Mencurigakan',
    desc: 'Selidiki klaim viral di TikTok menggunakan distribusi frekuensi & histogram.',
    tags: ['Distribusi Frekuensi', 'Histogram', 'Analisis Kritis'],
    locked: false,
    xpMax: 75,
  },
  { id: 2, icon: '📈', title: 'Kasus: Polling Pilkada', desc: 'Segera hadir', tags: [], locked: true, xpMax: 0 },
  { id: 3, icon: '🌡️', title: 'Kasus: Anomali Cuaca', desc: 'Segera hadir', tags: [], locked: true, xpMax: 0 },
  { id: 4, icon: '🏥', title: 'Kasus: Data Kesehatan', desc: 'Segera hadir', tags: [], locked: true, xpMax: 0 },
  { id: 5, icon: '📊', title: 'Kasus: Survei Ekonomi', desc: 'Segera hadir', tags: [], locked: true, xpMax: 0 },
]

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32', '#8888AA', '#8888AA']
const RANK_EMOJIS = ['🥇', '🥈', '🥉', '4', '5']

export default function LobbyPage() {
  const router = useRouter()
  const { cognitiveStyle, setCognitiveStyle, xp, badges, startLevel, resetLevel } = useGameStore()
  const [student, setStudent] = useState<Student | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = localStorage.getItem('student')
    if (!data) { router.push('/'); return }
    const s = JSON.parse(data) as Student
    setStudent(s)

    if (s.geftStatus !== 'completed') {
      router.push('/siswa/geft'); return
    }

    // Fetch cognitive style from API
    const fetchStyle = async () => {
      try {
        if (cognitiveStyle) { setLoading(false); return }
        const res = await fetch(`/api/game/cognitive-style?studentId=${s.id}`)
        if (!res.ok) { router.push('/siswa/geft'); return }
        const data = await res.json()
        setCognitiveStyle(data.cognitiveStyle)
      } catch {
        // fallback to local geftResult
        if (s.geftResult) setCognitiveStyle(s.geftResult.cognitiveStyle)
      } finally {
        setLoading(false)
      }
    }
    fetchStyle()

    // Fetch leaderboard
    fetch('/api/game/leaderboard')
      .then(r => r.json())
      .then(setLeaderboard)
      .catch(() => {})
  }, [router, cognitiveStyle, setCognitiveStyle])

  const handlePlayLevel = (levelId: number) => {
    if (!cognitiveStyle || !student) return
    resetLevel()
    startLevel(levelId, cognitiveStyle)
    router.push(`/siswa/game/level/${levelId}`)
  }

  const isFI = cognitiveStyle === 'FI'
  const xpMax = 500 // arbitrary max for bar display
  const xpPct = Math.min(100, (xp / xpMax) * 100)
  const maxLives = isFI ? 3 : 4

  if (loading) return (
    <div className="game-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ fontSize: '40px' }}
      >⚙️</motion.div>
    </div>
  )

  return (
    <div className="game-root">
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--game-border)',
        padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🕵️</span>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '2px' }}>DIGITAL TRUTH SQUAD</div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>AR-COGNISTATS Game</div>
          </div>
        </div>
        <button
          className="game-btn game-btn-secondary"
          style={{ fontSize: '13px', padding: '8px 16px' }}
          onClick={() => router.push('/siswa')}
        >
          ← Dashboard
        </button>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px', position: 'relative', zIndex: 1 }}>

        {/* ── Greeting + Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="game-card"
          style={{ marginBottom: '28px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}
        >
          {/* Avatar */}
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
            background: isFI
              ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)'
              : 'linear-gradient(135deg, #06B6D4, #00FF88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', fontWeight: 800, color: '#fff',
            boxShadow: isFI ? '0 0 20px rgba(59,130,246,0.4)' : '0 0 20px rgba(0,255,136,0.4)'
          }}>
            {student?.name?.charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>SELAMAT DATANG KEMBALI</div>
            <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 800 }}>{student?.name}</h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: isFI ? 'rgba(59,130,246,0.12)' : 'rgba(0,255,136,0.1)', border: `1px solid ${isFI ? 'rgba(59,130,246,0.3)' : 'var(--game-border-accent)'}`, borderRadius: '50px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, color: isFI ? '#60A5FA' : 'var(--accent)' }}>
              {isFI ? '🧠 Field Independent' : '👥 Field Dependent'}
            </div>
          </div>

          {/* XP + Lives */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL XP</span>
                <span style={{ fontFamily: 'var(--font-data)', color: 'var(--accent)', fontWeight: 700, fontSize: '14px' }}>{xp} / {xpMax}</span>
              </div>
              <div className="xp-bar-track">
                <motion.div className="xp-bar-fill" initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 1, delay: 0.3 }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>NYAWA:</span>
              <div className="game-header-lives">
                {Array.from({ length: maxLives }).map((_, i) => (
                  <span key={i} style={{ fontSize: '16px' }}>❤️</span>
                ))}
              </div>
            </div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {badges.map(b => (
                <div key={b} style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid var(--game-border-accent)', borderRadius: '50px', padding: '4px 10px', fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>
                  {b.includes('detective') ? '🔍' : b.includes('speed') ? '⚡' : b.includes('perfect') ? '🎯' : '🧠'} +1
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Main layout: levels + leaderboard ── */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Levels grid */}
          <div style={{ flex: 1.8, minWidth: '300px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              🗂️ Pilih Kasus Investigasi
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {LEVELS.map((level, i) => (
                <motion.div
                  key={level.id}
                  className={`level-card ${level.locked ? 'locked' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => !level.locked && handlePlayLevel(level.id)}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '36px', padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', flexShrink: 0 }}>
                      {level.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px' }}>LEVEL {level.id}</div>
                        {!level.locked && <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>Max {level.xpMax} XP</div>}
                      </div>
                      <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 800, color: level.locked ? 'var(--text-muted)' : '#fff' }}>
                        {level.title}
                      </h4>
                      <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {level.desc}
                      </p>
                      {level.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {level.tags.map(tag => (
                            <span key={tag} style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--game-border)', borderRadius: '50px', padding: '3px 8px', fontWeight: 700 }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {!level.locked && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--game-border)' }}>
                      <button className="game-btn game-btn-primary" style={{ fontSize: '13px', padding: '10px 20px' }}>
                        {cognitiveStyle === 'FI' ? '🧠 Mulai (FI Path)' : '👥 Mulai (FD Path)'} →
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div style={{ flex: 1, minWidth: '260px', position: 'sticky', top: '80px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              🏆 Leaderboard Top 5
            </h3>
            <div className="game-card" style={{ padding: '16px' }}>
              {leaderboard.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Belum ada data. Jadilah yang pertama! 🚀
                </div>
              ) : (
                leaderboard.map((entry, i) => (
                  <motion.div
                    key={entry.studentId}
                    className="leaderboard-item"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{ background: entry.studentId === student?.id ? 'rgba(0,255,136,0.06)' : undefined }}
                  >
                    <span className="leaderboard-rank" style={{ color: RANK_COLORS[i] }}>{RANK_EMOJIS[i]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: entry.studentId === student?.id ? 'var(--accent)' : '#fff' }}>
                        {entry.username} {entry.studentId === student?.id && '(Kamu)'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {entry.badges.length} badge{entry.badges.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-data)', fontWeight: 800, color: 'var(--accent)', fontSize: '14px' }}>
                      {entry.totalXp} XP
                    </span>
                  </motion.div>
                ))
              )}
            </div>

            {/* Quick stats */}
            <div className="game-card" style={{ marginTop: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px' }}>STATUS KAMU</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>XP</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-data)' }}>{xp}</div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>BADGES</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFD700', fontFamily: 'var(--font-data)' }}>{badges.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
