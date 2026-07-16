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

const LEVELS = [
  {
    id: 1,
    icon: '📊',
    title: 'Level 1 (The Viral Myth)',
    desc: 'Sebuah postingan viral mengklaim remaja Indonesia rata-rata >8 jam/hari di medsos. Selidiki kebenarannya.',
    tags: ['Distribusi Frekuensi', 'Histogram', 'Analisis Kritis'],
    locked: false,
    xpMax: 100,
  },
  {
    id: 2,
    icon: '🛡️',
    title: 'Level 2 (Kasus: Cyberbullying)',
    desc: 'Investigasi kasus perundungan siber di sekolah. Kumpulkan data korban, bimbing pelaku siber, dan analisis pemusatan data.',
    tags: ['Mean', 'Median', 'Modus', 'Ukuran Pemusatan'],
    locked: false,
    xpMax: 0,
  },
  { id: 3, icon: '🌡️', title: 'Kasus: Anomali Cuaca', desc: 'Segera hadir', tags: [], locked: true, xpMax: 0 },
]

export default function LobbyPage() {
  const router = useRouter()
  const { cognitiveStyle, setCognitiveStyle, startLevel, resetLevel, completedLevels } = useGameStore()
  const [student, setStudent] = useState<Student | null>(null)
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
  }, [router, cognitiveStyle, setCognitiveStyle])

  const handlePlayLevel = (levelId: number) => {
    router.push(`/siswa/diagnostik?level=${levelId}`)
  }

  const isFI = (student?.geftResult?.cognitiveStyle || cognitiveStyle) === 'FI'

  if (loading) return (
    <div className="game-root" style={{ display: 'flex', alignItems: 'center', justifycontent: 'center', minHeight: '100vh' }}>
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
        background: 'rgba(11, 30, 44, 0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--game-border)',
        padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🕵️</span>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '2px' }}>SKEPTIKOS</div>
            <div style={{ fontSize: '14px', fontWeight: 700 }} className="desktop-only">Skeptikos</div>
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

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 20px', position: 'relative', zIndex: 1 }}>

        {/* ── Greeting + Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="game-card"
          style={{ marginBottom: '28px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}
        >
          {/* Avatar */}
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
            background: isFI
              ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)'
              : 'linear-gradient(135deg, #EA580C, #D97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: 800, color: '#FFFFFF',
            boxShadow: isFI ? '0 0 20px rgba(59,130,246,0.4)' : '0 0 20px rgba(217,119,6,0.4)'
          }}>
            {student?.name?.charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>SELAMAT DATANG KEMBALI</div>
            <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800 }}>{student?.name}</h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: isFI ? 'rgba(59,130,246,0.12)' : 'rgba(217,119,6,0.1)', border: `1px solid ${isFI ? 'rgba(59,130,246,0.3)' : 'var(--game-border-accent)'}`, borderRadius: '50px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, color: isFI ? '#60A5FA' : 'var(--accent)' }}>
              {isFI ? '🧠 Field Independent (FI)' : '👥 Field Dependent (FD)'}
            </div>
          </div>
        </motion.div>

        {/* ── Main layout: levels only ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🗂️ Kasus Investigasi Aktif
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {LEVELS.filter(level => level.id <= 2).map((level, i) => {
              const isUnlocked = level.id === 1 || completedLevels.includes(level.id - 1)
              return (
                <motion.div
                  key={level.id}
                  className={`level-card ${!isUnlocked ? 'locked' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => isUnlocked && handlePlayLevel(level.id)}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '36px', padding: '12px', background: 'rgba(217,119,6,0.06)', borderRadius: '14px', flexShrink: 0 }}>
                      {level.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px' }}>LEVEL {level.id}</div>
                        {isUnlocked && level.xpMax > 0 && <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>Max {level.xpMax} XP</div>}
                      </div>
                      <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 800, color: !isUnlocked ? 'var(--text-muted)' : '#fff' }}>
                        {level.title}
                      </h4>
                      {level.desc && (
                        <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {level.desc}
                        </p>
                      )}
                      {level.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {level.tags.map(tag => (
                            <span key={tag} style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(180,140,80,0.1)', border: '1px solid var(--game-border)', borderRadius: '50px', padding: '3px 8px', fontWeight: 700 }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {isUnlocked && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--game-border)' }}>
                      <button
                        className="game-btn game-btn-primary"
                        style={{ fontSize: '13px', padding: '10px 20px' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePlayLevel(level.id)
                        }}
                      >
                        {cognitiveStyle === 'FI' ? '🧠 Mulai (FI Path)' : '👥 Mulai (FD Path)'} →
                      </button>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
