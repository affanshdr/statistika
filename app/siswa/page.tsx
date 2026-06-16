'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'
import DetektivBooklet from './game/_components/DetektivBooklet'

type Student = {
  id: string
  name: string
  nisn: string
  geftStatus: 'not_taken' | 'completed'
  classroom: { name: string }
  diagnosticScore?: number | null
  diagnosticLevel?: string | null
  geftResult?: {
    score: number
    cognitiveStyle: 'FI' | 'FD'
  }
}

const COGNITIVE_INFO = {
  FI: {
    label: 'Field Independent (FI)',
    icon: '🧠',
    color: '#60a5fa',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.3)',
    traits: [
      { icon: '🔍', title: 'Analitis & Mandiri', desc: 'Kamu cenderung menganalisis masalah secara mandiri tanpa bergantung pada konteks sekitar.' },
      { icon: '📐', title: 'Terstruktur', desc: 'Kamu menyukai struktur yang jelas, definisi formal, dan penjelasan berbasis logika.' },
      { icon: '⚡', title: 'Eksplorer', desc: 'Kamu lebih suka mengeksplorasi tanpa banyak petunjuk — tantangan adalah motivasimu!' },
      { icon: '📖', title: 'Deep Learning', desc: 'Kamu cenderung menggali lebih dalam suatu konsep sebelum pindah ke materi berikutnya.' },
    ],
    gameStyle: 'Mode FI memberikan kebebasan penuh untuk bereksperimen. Kamu akan menghadapi soal yang lebih terbuka dan menantang kemampuan berpikir kritismu.',
  },
  FD: {
    label: 'Field Dependent (FD)',
    icon: '👥',
    color: '#34d399',
    bg: 'rgba(6,182,212,0.1)',
    border: 'rgba(6,182,212,0.3)',
    traits: [
      { icon: '🤝', title: 'Kolaboratif', desc: 'Kamu belajar paling baik lewat interaksi dan konteks sosial yang kaya.' },
      { icon: '🗺️', title: 'Kontekstual', desc: 'Kamu memahami konsep lebih baik saat diberikan gambaran besar dan contoh nyata.' },
      { icon: '💡', title: 'Berbasis Panduan', desc: 'Kamu merespons baik pada scaffold dan petunjuk bertahap dari mentor.' },
      { icon: '🌐', title: 'Holistik', desc: 'Kamu memproses informasi secara menyeluruh sebelum masuk ke detail.' },
    ],
    gameStyle: 'Mode FD memberikan dukungan DiRA (asisten AI) dan langkah-langkah terbimbing. Kamu tidak akan sendirian dalam memecahkan misteri data!',
  },
}

const LEVELS = [
  {
    id: 1,
    icon: '📊',
    title: 'Level 1 (The Viral Myth)',
    desc: 'Topik Materi: Statistika Deskriptif (Histogram, Distribusi Data, Outlier, & Ukuran Pemusatan Data)',
    tags: ['Distribusi Frekuensi', 'Histogram', 'Analisis Kritis'],
    locked: false,
    xpMax: 75,
    locationName: 'Sekolah Harapan',
  },
  {
    id: 2,
    icon: '🗳️',
    title: 'Kasus: Polling Pilkada',
    desc: 'Segera hadir di lokasi ini. Pelajari sampling & representasi data populasi.',
    tags: [],
    locked: true,
    xpMax: 0,
    locationName: 'Kantor KPU Kota',
  },
  {
    id: 3,
    icon: '🌡️',
    title: 'Kasus: Anomali Cuaca',
    desc: 'Segera hadir di stasiun meteorologi. Analisis tren & data deret waktu.',
    tags: [],
    locked: true,
    xpMax: 0,
    locationName: 'Stasiun BMKG',
  },
]

export default function SiswaPage() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [showCognitiveModal, setShowCognitiveModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showGreeting, setShowGreeting] = useState(false)
  
  // Navigation & Study Modals State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showBookletModal, setShowBookletModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showGatingModal, setShowGatingModal] = useState(false)
  const [gatingLevelId, setGatingLevelId] = useState<number | null>(null)
  
  // Game store variables
  const { cognitiveStyle, setCognitiveStyle, startLevel, resetLevel } = useGameStore()

  useEffect(() => {
    const data = localStorage.getItem('student')
    if (!data) { router.push('/'); return }
    const s = JSON.parse(data) as Student
    setStudent(s)

    if (s.geftStatus === 'not_taken') {
      router.push('/siswa/geft')
    } else if (s.geftResult?.cognitiveStyle) {
      setCognitiveStyle(s.geftResult.cognitiveStyle)
    }

    // Show greeting once per browser session (right after login).
    // sessionStorage resets when the tab is closed, so a new login always shows it again.
    if (s.diagnosticLevel && s.geftResult?.cognitiveStyle) {
      const alreadyShown = sessionStorage.getItem('greeting_shown')
      const justFinishedGeft = sessionStorage.getItem('show_cognitive_style_first_time')
      if (!alreadyShown) {
        setShowGreeting(true)
        sessionStorage.setItem('greeting_shown', '1')
      } else if (justFinishedGeft) {
        setShowCognitiveModal(true)
        sessionStorage.removeItem('show_cognitive_style_first_time')
      }
    }
  }, [router, setCognitiveStyle])

  // Detect mobile/portrait orientation
  useEffect(() => {
    const checkMobile = () => {
      const isLandscapePhone = window.innerHeight < 500 && window.innerWidth > window.innerHeight
      const mobile = window.innerWidth < 768 || isLandscapePhone
      setIsMobile(mobile)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!student) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0F' }}>
      <p style={{ color: '#fff' }}>Loading...</p>
    </main>
  )

  const proceedToGame = (levelId: number, activeStyle: 'FI' | 'FD') => {
    resetLevel()
    startLevel(levelId, activeStyle)
    router.push(`/siswa/game/level/${levelId}`)
  }

  const handlePlayLevel = (levelId: number) => {
    if (student?.diagnosticLevel) {
      const activeStyle = student.geftResult?.cognitiveStyle || cognitiveStyle || 'FI'
      
      // Check cognitive style specific preparation gating
      if (activeStyle === 'FI') {
        const hasRead = localStorage.getItem('has_read_booklet') === 'true'
        if (!hasRead) {
          setGatingLevelId(levelId)
          setShowGatingModal(true)
          return
        }
      } else {
        const hasWatched = localStorage.getItem('has_watched_video') === 'true'
        if (!hasWatched) {
          setGatingLevelId(levelId)
          setShowGatingModal(true)
          return
        }
      }
      
      proceedToGame(levelId, activeStyle)
    } else {
      router.push(`/siswa/diagnostik?level=${levelId}`)
    }
  }

  const handleBookletComplete = () => {
    localStorage.setItem('has_read_booklet', 'true')
    setShowBookletModal(false)
    if (showGatingModal && gatingLevelId) {
      setShowGatingModal(false)
      const activeStyle = student?.geftResult?.cognitiveStyle || cognitiveStyle || 'FI'
      proceedToGame(gatingLevelId, activeStyle)
      setGatingLevelId(null)
    }
  }

  const handleVideoComplete = () => {
    localStorage.setItem('has_watched_video', 'true')
    setShowVideoModal(false)
    if (showGatingModal && gatingLevelId) {
      setShowGatingModal(false)
      const activeStyle = student?.geftResult?.cognitiveStyle || cognitiveStyle || 'FI'
      proceedToGame(gatingLevelId, activeStyle)
      setGatingLevelId(null)
    }
  }

  const handleSkipGating = () => {
    setShowGatingModal(false)
    if (gatingLevelId) {
      const activeStyle = student?.geftResult?.cognitiveStyle || cognitiveStyle || 'FI'
      proceedToGame(gatingLevelId, activeStyle)
      setGatingLevelId(null)
    }
  }

  const handleCloseGreeting = () => {
    setShowGreeting(false)
    const justFinishedGeft = sessionStorage.getItem('show_cognitive_style_first_time')
    if (justFinishedGeft) {
      setShowCognitiveModal(true)
      sessionStorage.removeItem('show_cognitive_style_first_time')
    }
  }

  const resolvedStyle = student?.geftResult?.cognitiveStyle || cognitiveStyle || 'FI'
  const isFI = resolvedStyle === 'FI'

  return (
    <main style={{
      width: '100%',
      minHeight: '100vh',
      position: 'relative',
      background: '#0A0A0F',
      color: '#f3f4f6',
      fontFamily: 'var(--font-sans), sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      
      {/* Header Bar */}
      <header style={{
        width: '100%',
        background: 'rgba(10, 10, 15, 0.75)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 255, 136, 0.12)',
        padding: isMobile ? '12px 16px' : '16px 32px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: '12px',
        zIndex: 100,
        position: 'sticky',
        top: 0,
      }}>
        {/* Left: Brand / Title and Profile info */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{
            width: isMobile ? '36px' : '44px',
            height: isMobile ? '36px' : '44px',
            borderRadius: '50%',
            background: isFI
              ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
              : 'linear-gradient(135deg, #06b6d4 0%, #00FF88 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '14px' : '18px',
            fontWeight: 800,
            color: '#fff',
            boxShadow: isFI ? '0 0 14px rgba(59,130,246,0.4)' : '0 0 14px rgba(0,255,136,0.3)',
            flexShrink: 0,
          }}>
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h2 style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 800, margin: 0, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {student.name}
              </h2>
              {/* 👋 Greeting wave button beside the name */}
              {student.diagnosticLevel && student.geftResult?.cognitiveStyle && (
                <button
                  onClick={() => setShowGreeting(true)}
                  title="Buka Greeting"
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '16px',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  👋
                </button>
              )}
            </div>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'block', marginTop: '2px' }}>
              Kelas: <strong style={{ color: '#fff' }}>{student.classroom?.name}</strong> • Detektif Aktif
            </span>
          </div>
        </div>

        {/* Right: Hamburger Menu, Cognitive Style Badge & Exit Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
        }}>
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: '#fff',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              marginRight: '4px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              e.currentTarget.style.borderColor = isFI ? 'rgba(59,130,246,0.5)' : 'rgba(0, 255, 136, 0.5)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            }}
            title="Buka Menu"
          >
            ☰
          </button>

          {student.geftResult?.cognitiveStyle && (
            <button
              onClick={() => setShowCognitiveModal(true)}
              title="Detail gaya belajar"
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                background: isFI ? 'rgba(59,130,246,0.12)' : 'rgba(6,182,212,0.12)',
                border: `1px solid ${isFI ? 'rgba(59,130,246,0.25)' : 'rgba(6,182,212,0.25)'}`,
                fontSize: '11px',
                color: isFI ? '#93c5fd' : '#a7f3d0',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.25)' }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
            >
              <span>{isFI ? '🧠 FI' : '👥 FD'} Path</span>
              <span style={{ opacity: 0.5, fontSize: '9px' }}>ℹ️</span>
            </button>
          )}

          <button
            onClick={() => setShowExitConfirm(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.05)',
              color: '#ff6b6b',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'
              e.currentTarget.style.color = '#ff4d4d'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'
              e.currentTarget.style.color = '#ff6b6b'
            }}
          >
            Keluar Sesi
          </button>
        </div>
      </header>

      {/* Main Section */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '24px 16px' : '40px 32px',
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto',
      }}>
        {/* Title Area */}
        <div style={{
          textAlign: 'center',
          marginBottom: isMobile ? '24px' : '36px',
          maxWidth: '600px',
        }}>
          <div style={{
            fontSize: '10px',
            color: '#00FF88',
            fontWeight: 800,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '8px',
            textShadow: '0 0 10px rgba(0, 255, 136, 0.3)',
          }}>
            Misi Investigasi
          </div>
          <h1 style={{
            fontSize: isMobile ? '24px' : '36px',
            fontWeight: 900,
            color: '#fff',
            margin: 0,
            letterSpacing: '-0.5px',
          }}>
            Skeptikos
          </h1>
          <p style={{
            fontSize: isMobile ? '13px' : '14.5px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: '10px',
            lineHeight: 1.6,
          }}>
            Selamat datang di pusat investigasi. Pilih salah satu lokasi di bawah ini untuk memulai analisis kasus dan kumpulkan bukti statistik!
          </p>
        </div>

        {/* Level Cards Scroll Container */}
        <div className="cards-scroll-container" style={{
          width: '100%',
          overflowX: isMobile ? 'visible' : 'auto',
          padding: isMobile ? '0' : '10px 0 20px',
          display: 'flex',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '24px',
            padding: isMobile ? '16px 4px' : '12px 24px',
            alignItems: 'stretch',
            minWidth: isMobile ? 'none' : 'min-content',
            width: isMobile ? '100%' : 'auto',
            margin: '0 auto',
          }}>
            {LEVELS.map(level => {
              const isUnlocked = !level.locked
              
              return (
                <div
                  key={level.id}
                  className={`level-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                  onClick={() => isUnlocked && handlePlayLevel(level.id)}
                  style={{
                    width: isMobile ? '100%' : '300px',
                    maxWidth: isMobile ? '400px' : 'none',
                    margin: isMobile ? '0 auto' : '0',
                    background: 'linear-gradient(135deg, rgba(16, 22, 40, 0.6) 0%, rgba(8, 12, 24, 0.75) 100%)',
                    backdropFilter: 'blur(16px)',
                    border: isUnlocked 
                      ? '1.5px solid rgba(0, 255, 136, 0.25)' 
                      : '1.5px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '20px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isUnlocked 
                      ? '0 8px 24px rgba(0, 255, 136, 0.06)' 
                      : 'none',
                    position: 'relative',
                    minHeight: '380px',
                  }}
                >
                  {/* Card Header Info */}
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px',
                    }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 900,
                        fontFamily: 'monospace',
                        color: isUnlocked ? '#00FF88' : 'rgba(255, 255, 255, 0.3)',
                        letterSpacing: '1px',
                      }}>
                        LEVEL 0{level.id}
                      </span>
                      <span style={{
                        fontSize: isUnlocked ? '11px' : '9px',
                        fontWeight: 700,
                        color: isUnlocked ? '#60a5fa' : '#ef4444',
                        background: isUnlocked ? 'transparent' : 'rgba(239, 68, 68, 0.1)',
                        border: isUnlocked ? 'none' : '1px solid rgba(239, 68, 68, 0.2)',
                        padding: isUnlocked ? '0' : '2px 8px',
                        borderRadius: isUnlocked ? '0' : '6px',
                        textTransform: 'uppercase',
                        letterSpacing: isUnlocked ? 'normal' : '0.5px',
                      }}>
                        {isUnlocked ? `🎁 +${level.xpMax} XP` : '⏳ COMING SOON'}
                      </span>
                    </div>

                    {/* Emoji representation icon */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: '20px',
                      position: 'relative',
                    }}>
                      {/* Pulse rings for unlocked level */}
                      {isUnlocked && (
                        <>
                          <div style={{
                            position: 'absolute',
                            width: '64px', height: '64px', borderRadius: '50%',
                            background: 'rgba(0,255,136,0.12)',
                            animation: 'ripple 2.2s infinite',
                            pointerEvents: 'none'
                          }} />
                        </>
                      )}
                      
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: isUnlocked
                          ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 136, 0.02) 100%)'
                          : 'rgba(255,255,255,0.02)',
                        border: `1.5px solid ${isUnlocked ? 'rgba(0, 255, 136, 0.35)' : 'rgba(255, 255, 255, 0.05)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        zIndex: 2,
                        boxShadow: isUnlocked ? '0 0 15px rgba(0, 255, 136, 0.1)' : 'none',
                      }}>
                        {level.icon}
                      </div>
                    </div>

                    {/* Case Details */}
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: isUnlocked ? '#d1fae5' : 'rgba(255, 255, 255, 0.35)',
                        letterSpacing: '0.4px',
                        display: 'block',
                        marginBottom: '4px',
                      }}>
                        {level.locationName}
                      </span>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        color: '#fff',
                        margin: '0 0 8px 0',
                        lineHeight: '1.35',
                      }}>
                        {level.title}
                      </h3>
                      <p style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.5)',
                        margin: 0,
                        lineHeight: '1.5',
                      }}>
                        {level.desc}
                      </p>
                    </div>

                    {/* Case Tags (if unlocked) */}
                    {isUnlocked && level.tags.length > 0 && (
                      <div style={{
                        display: 'flex',
                        gap: '6px',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        marginBottom: '24px',
                      }}>
                        {level.tags.map(tag => (
                          <span
                            key={tag}
                            style={{
                              fontSize: '9px',
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.07)',
                              borderRadius: '6px',
                              padding: '3px 8px',
                              color: 'rgba(255, 255, 255, 0.6)',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Play Action Button */}
                  <div>
                    {isUnlocked ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePlayLevel(level.id)
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '12px',
                          border: 'none',
                          background: isFI ? 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)' : 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: isFI ? '0 4px 15px rgba(37,99,235,0.25)' : '0 4px 15px rgba(16,185,129,0.25)',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
                        onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                      >
                        <span>Mulai Penyelidikan</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <div style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        color: 'rgba(255, 255, 255, 0.25)',
                        fontSize: '13px',
                        fontWeight: 700,
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}>
                        <span>🔒</span>
                        <span>Segera Hadir (Coming Soon)</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200
        }}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="modal-scrollbar"
            style={{
              background: 'rgba(10, 15, 30, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '28px',
              width: '380px',
              maxHeight: 'calc(100vh - 40px)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ Konfirmasi Keluar
              </h3>
              <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.55 }}>
                Apakah Anda yakin ingin mengakhiri sesi belajar statistika ini? Progress pengerjaan Anda akan tetap tersimpan dengan aman.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowExitConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('student')
                  sessionStorage.removeItem('greeting_shown')
                  router.push('/')
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#fff',
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

      {/* Cognitive Style Modal */}
      {showCognitiveModal && student?.geftResult?.cognitiveStyle && (() => {
        const style = student.geftResult!.cognitiveStyle
        const info = COGNITIVE_INFO[style]
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowCognitiveModal(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 300,
              background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              onClick={e => e.stopPropagation()}
              className="modal-scrollbar"
              style={{
                background: 'rgba(10,15,30,0.95)',
                border: `1px solid ${info.border}`,
                borderRadius: '24px', padding: '32px 28px',
                width: '100%', maxWidth: '440px',
                maxHeight: 'calc(100vh - 40px)',
                overflowY: 'auto',
                boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 40px ${info.bg}`,
                color: '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: info.color, fontWeight: 800, letterSpacing: '1.5px', marginBottom: '6px' }}>
                    GAYA KOGNITIF KAMU
                  </div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>
                    {info.icon} {info.label}
                  </h3>
                </div>
                <button
                  onClick={() => setShowCognitiveModal(false)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '20px', cursor: 'pointer', padding: '4px' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {info.traits.map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{
                      display: 'flex', gap: '12px', alignItems: 'flex-start',
                      padding: '12px 14px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '3px' }}>{t.title}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{t.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div style={{
                padding: '14px 16px', borderRadius: '14px',
                background: info.bg, border: `1px solid ${info.border}`,
                fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6,
              }}>
                <strong style={{ color: info.color }}>🎮 Di Game: </strong>{info.gameStyle}
              </div>

              <button
                onClick={() => setShowCognitiveModal(false)}
                style={{
                  marginTop: '20px', width: '100%', padding: '14px',
                  borderRadius: '14px',
                  background: `linear-gradient(90deg, ${info.color}22, ${info.color}44)`,
                  border: `1px solid ${info.border}`,
                  color: info.color, fontSize: '14px', fontWeight: 800,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
              >
                Mengerti! Siap Investigasi 🔍
              </button>
            </motion.div>
          </motion.div>
        )
      })()}

      {/* Greeting Center Modal */}
      {showGreeting && student && student.diagnosticLevel && student.geftResult?.cognitiveStyle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowGreeting(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            onClick={e => e.stopPropagation()}
            className="modal-scrollbar"
            style={{
              background: 'rgba(10,15,30,0.95)',
              border: '1px solid rgba(0, 255, 136, 0.25)',
              borderRadius: '24px', padding: '32px 28px',
              width: '100%', maxWidth: '440px',
              maxHeight: 'calc(100vh - 40px)',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(0, 255, 136, 0.1)',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#00FF88', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '6px' }}>
                  LAPORAN MASUK
                </div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900 }}>
                  👋 Halo, {student.name.split(' ')[0]}!
                </h3>
              </div>
              <button
                onClick={handleCloseGreeting}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '20px', cursor: 'pointer', padding: '4px', lineHeight: 1 }}
                onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >✕</button>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: '16px',
              background: 'rgba(0, 255, 136, 0.04)',
              border: '1px solid rgba(0, 255, 136, 0.15)',
              fontSize: '13.5px',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.85)',
              marginBottom: '20px'
            }}>
              {student.diagnosticLevel === 'tinggi'
                ? 'Kemampuan statistikamu sudah mantap! Langsung terjun ke investigasi kasus yang menantang.'
                : student.diagnosticLevel === 'sedang'
                ? 'Dasar statistikamu sudah oke. Siap perkuat dengan investigasi data nyata!'
                : 'Tenang, kita mulai dari dasar bareng-bareng. Setiap detektif besar dimulai dari sini!'
              }
            </div>

            <button
              onClick={handleCloseGreeting}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                background: isFI ? '#2563eb' : '#10b981',
                color: '#fff', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                boxShadow: isFI ? '0 4px 15px rgba(37,99,235,0.3)' : '0 4px 15px rgba(16,185,129,0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              Mulai Penyelidikan 🕵️‍♂️
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(3, 7, 18, 0.6)',
                backdropFilter: 'blur(8px)',
                zIndex: 150,
              }}
            />
            {/* Sidebar panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '320px',
                background: 'rgba(10, 15, 30, 0.95)',
                backdropFilter: 'blur(20px)',
                borderLeft: `1px solid ${isFI ? 'rgba(59,130,246,0.3)' : 'rgba(0, 255, 136, 0.25)'}`,
                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                zIndex: 160,
              }}
            >
              {/* Sidebar Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>☰</span>
                  <span style={{ fontWeight: 800, fontSize: '16px', color: '#fff' }}>Menu Navigasi</span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '4px',
                    lineHeight: 1,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >
                  ✕
                </button>
              </div>

              {/* Sidebar Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                {/* Tanya DiRA */}
                <button
                  onClick={() => {
                    setIsSidebarOpen(false)
                    window.dispatchEvent(new Event('open-dira-chat'))
                  }}
                  className="sidebar-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>💬</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>Tanya DiRA</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Chatbot AI Asisten Belajar</div>
                  </div>
                </button>

                {/* Buku Saku */}
                <button
                  onClick={() => {
                    setIsSidebarOpen(false)
                    setShowBookletModal(true)
                  }}
                  className="sidebar-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>📖</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>Buku Saku Detektif</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Ringkasan Materi & Teori</div>
                  </div>
                </button>

                {/* Video Pembelajaran */}
                <button
                  onClick={() => {
                    setIsSidebarOpen(false)
                    setShowVideoModal(true)
                  }}
                  className="sidebar-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>🎥</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>Video Pembelajaran</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Penjelasan Audio-Visual</div>
                  </div>
                </button>
              </div>

              {/* Sidebar Footer */}
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                Skeptikos v1.0.0
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal Buku Saku */}
      {showBookletModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '20px',
        }}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="modal-scrollbar"
            style={{
              background: 'rgba(10, 15, 30, 0.95)',
              border: `1px solid ${isFI ? 'rgba(59,130,246,0.3)' : 'rgba(0, 255, 136, 0.25)'}`,
              borderRadius: '24px',
              padding: '28px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: 'calc(100vh - 40px)',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(0, 255, 136, 0.08)',
            }}
          >
            <button
              onClick={() => setShowBookletModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '20px',
                cursor: 'pointer',
                zIndex: 10,
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
            >
              ✕
            </button>
            <DetektivBooklet mode={resolvedStyle} onComplete={handleBookletComplete} />
          </motion.div>
        </div>
      )}

      {/* Modal Video Pembelajaran */}
      {showVideoModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '20px',
        }}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'rgba(10, 15, 30, 0.95)',
              border: `1px solid ${isFI ? 'rgba(59,130,246,0.3)' : 'rgba(0, 255, 136, 0.25)'}`,
              borderRadius: '24px',
              padding: '28px',
              width: '100%',
              maxWidth: '640px',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(0, 255, 136, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>🎥</span>
                <div>
                  <div style={{ fontSize: '11px', color: isFI ? '#60a5fa' : '#00FF88', fontWeight: 800, letterSpacing: '1px' }}>VIDEO PEMBELAJARAN</div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Mean, Median, & Modus Data Kelompok</h3>
                </div>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
              >
                ✕
              </button>
            </div>

            <div style={{ width: '100%', position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}
                src="https://www.youtube.com/embed/kYJv-n9f5Wc"
                title="Video Pembelajaran Statistika"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>

            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
              Tonton video pembelajaran dari channel Matematika Hebat di atas untuk memahami dasar-dasar perhitungan statistika deskriptif pada data kelompok sebelum kamu memulai investigasi kasus!
            </div>

            <button
              onClick={handleVideoComplete}
              style={{
                padding: '14px',
                borderRadius: '14px',
                background: isFI ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' : 'linear-gradient(90deg, #00FF88, #06B6D4)',
                border: 'none',
                color: isFI ? '#fff' : '#000',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isFI ? '0 4px 20px rgba(59,130,246,0.3)' : '0 4px 20px rgba(0,255,136,0.3)',
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              ✅ Selesai Menonton & Simpan Progress
            </button>
          </motion.div>
        </div>
      )}

      {/* Gating / Direction Modal */}
      {showGatingModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '20px',
        }}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'rgba(10, 15, 30, 0.95)',
              border: `1px solid ${resolvedStyle === 'FI' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(6, 182, 212, 0.3)'}`,
              borderRadius: '24px',
              padding: '28px',
              width: '420px',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{
                  fontSize: '10px',
                  color: resolvedStyle === 'FI' ? '#60a5fa' : '#22d3ee',
                  fontWeight: 800,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                }}>
                  REKOMENDASI BELAJAR ({resolvedStyle})
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 800 }}>
                  🕵️‍♂️ Persiapan Detektif
                </h3>
              </div>
              <button
                onClick={() => setShowGatingModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '13.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
              {resolvedStyle === 'FI' ? (
                <>
                  Sebelum memulai penyelidikan, detektif dengan gaya kognitif <strong>Field Independent (FI)</strong> diarahkan untuk mempelajari <strong>Buku Saku Detektif</strong> terlebih dahulu guna memperkuat kemampuan analisis mandiri Anda.
                </>
              ) : (
                <>
                  Sebelum memulai penyelidikan, detektif dengan gaya kognitif <strong>Field Dependent (FD)</strong> diarahkan untuk menonton <strong>Video Pembelajaran</strong> terlebih dahulu untuk mendapatkan gambaran besar secara visual.
                </>
              )}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {resolvedStyle === 'FI' ? (
                <button
                  onClick={() => {
                    setShowGatingModal(false)
                    setShowBookletModal(true)
                  }}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <span>📖 Buka Buku Saku Detektif</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowGatingModal(false)
                    setShowVideoModal(true)
                  }}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(90deg, #06b6d4, #0891b2)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <span>🎥 Tonton Video Pembelajaran</span>
                </button>
              )}

              <button
                onClick={handleSkipGating}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                }}
              >
                🎮 Lewati & Mulai Game
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Scrollbar & Card Hover Styles */}
      <style>{`
        @keyframes ripple {
          0% {
            transform: scale(0.8);
            opacity: 0.7;
            box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.35);
          }
          70% {
            transform: scale(1.8);
            opacity: 0.2;
            box-shadow: 0 0 0 12px rgba(0, 255, 136, 0);
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
            box-shadow: 0 0 0 0 rgba(0, 255, 136, 0);
          }
        }

        .cards-scroll-container::-webkit-scrollbar {
          height: 6px;
        }
        .cards-scroll-container::-webkit-scrollbar-track {
          background: rgba(10, 15, 30, 0.3);
          border-radius: 10px;
        }
        .cards-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 136, 0.25);
          border-radius: 10px;
        }
        .cards-scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 136, 0.45);
        }

        .modal-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .modal-scrollbar::-webkit-scrollbar-track {
          background: rgba(10, 15, 30, 0.3);
          border-radius: 10px;
        }
        .modal-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
        }
        .modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.35);
        }

        .level-card {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .level-card.unlocked:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(0, 255, 136, 0.65) !important;
          box-shadow: 0 12px 30px rgba(0, 255, 136, 0.18), 0 0 20px rgba(0, 255, 136, 0.08) !important;
        }
        .level-card.locked {
          opacity: 0.65;
        }

        .sidebar-btn {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sidebar-btn:hover {
          background: ${isFI ? 'rgba(59,130,246,0.06)' : 'rgba(0,255,136,0.05)'} !important;
          border-color: ${isFI ? 'rgba(59,130,246,0.35)' : 'rgba(0,255,136,0.3)'} !important;
          box-shadow: 0 0 15px ${isFI ? 'rgba(59,130,246,0.1)' : 'rgba(0,255,136,0.08)'};
          transform: translateY(-2px);
        }
      `}</style>
    </main>
  )
}