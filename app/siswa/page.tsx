'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'
import DetektivBooklet from './game/_components/DetektivBooklet'
import OrientationGuard from './game/_components/OrientationGuard'

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

type ActiveTeam = {
  teamId: string
  levelId: number
  status: 'WAITING' | 'PLAYING'
  classroomName: string
  members: { id: string; name: string; isOnline?: boolean }[]
}

const COGNITIVE_INFO = {
  FI: {
    label: 'Field Independent (FI)',
    icon: '🧠',
    color: '#2563EB',
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
    desc: '',
    tags: ['Distribusi Frekuensi', 'Histogram', 'Analisis Kritis'],
    locked: false,
    xpMax: 0,
    locationName: '',
  },
  {
    id: 2,
    icon: '🛡️',
    title: 'Level 2 (Kasus: Cyberbullying)',
    desc: 'Investigasi kasus perundungan siber di sekolah. Kumpulkan data korban, bimbing pelaku, dan analisis pemusatan data.',
    tags: ['Mean', 'Median', 'Modus', 'Ukuran Pemusatan'],
    locked: false,
    xpMax: 0,
    locationName: 'Sekolah Menengah',
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

  // Corkboard and Detective elements tracking
  const boardRef = useRef<HTMLDivElement>(null)
  const cardRef1 = useRef<HTMLDivElement>(null)
  const cardRef2 = useRef<HTMLDivElement>(null)
  const cardRef3 = useRef<HTMLDivElement>(null)
  const cardRefs = [cardRef1, cardRef2, cardRef3]
  const [cardPositions, setCardPositions] = useState<{ x: number; y: number }[]>([])
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  // Navigation & Study Modals State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showBookletModal, setShowBookletModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showGatingModal, setShowGatingModal] = useState(false)
  const [gatingLevelId, setGatingLevelId] = useState<number | null>(null)
  const [gatingStep, setGatingStep] = useState<1 | 2>(1)

  // FD Team state
  const [activeTeam, setActiveTeam] = useState<ActiveTeam | null>(null)
  const [teamLoading, setTeamLoading] = useState(false)
  const [teamRefreshing, setTeamRefreshing] = useState(false)

  // Game store variables
  const { cognitiveStyle, setCognitiveStyle, startLevel, resetLevel, completedLevels, setTeamId } = useGameStore()

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

  // Fetch active FD team on mount & whenever studentId changes
  const fetchActiveTeam = async (studentId: string, quiet = false) => {
    if (!quiet) setTeamLoading(true)
    else setTeamRefreshing(true)
    try {
      const res = await fetch(`/api/game/team/my-team?studentId=${studentId}`)
      if (res.ok) {
        const data = await res.json()
        setActiveTeam(data.team ?? null)
      }
    } catch { /* silently ignore */ } finally {
      setTeamLoading(false)
      setTeamRefreshing(false)
    }
  }

  // Auto-group ALL FD students in the class into teams on page load,
  // then send heartbeats every 30s so team members can see who's online.
  useEffect(() => {
    const resolvedStudent = student
    const isFDStudent = resolvedStudent?.geftResult?.cognitiveStyle === 'FD'
    if (!resolvedStudent || !isFDStudent) return

    const initTeam = async () => {
      setTeamLoading(true)
      try {
        // auto-group groups ALL FD students in the class (even offline ones)
        const res = await fetch('/api/game/team/auto-group', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: resolvedStudent.id, levelId: 1 }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.team) {
            setActiveTeam(data.team)
            if (data.team.teamId) setTeamId(data.team.teamId)
          }
        }
      } catch { /* ignore */ } finally {
        setTeamLoading(false)
      }
    }

    initTeam()

    // Heartbeat: update lastSeenAt every 30s so teammates can see we're online
    const sendHeartbeat = () => {
      fetch('/api/students/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: resolvedStudent.id }),
      }).catch(() => { })
    }
    sendHeartbeat() // immediate on mount
    const heartbeatInterval = setInterval(sendHeartbeat, 30_000)

    // Poll every 10s to refresh team status and online indicators
    const pollInterval = setInterval(() => {
      fetchActiveTeam(resolvedStudent.id, true)
    }, 10_000)

    return () => {
      clearInterval(heartbeatInterval)
      clearInterval(pollInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student])


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

  // Calculate card coordinates relative to the board container for SVG thread
  useEffect(() => {
    const updatePositions = () => {
      const boardEl = boardRef.current
      if (!boardEl) return
      const boardRect = boardEl.getBoundingClientRect()

      const positions = cardRefs.map(ref => {
        const el = ref.current
        if (!el) return { x: 0, y: 0 }
        const rect = el.getBoundingClientRect()
        // The camera frame is the left child of the card row layout, taking fixed width (140px on mobile, 170px on desktop)
        const frameWidth = window.innerWidth < 768 ? 140 : 170;
        return {
          x: rect.left + frameWidth / 2 - boardRect.left,
          // Push pin top coordinate relative to the board container
          y: rect.top - boardRect.top + (window.innerWidth < 768 ? -2 : -6),
        }
      })
      setCardPositions(positions)
    }

    updatePositions()
    window.addEventListener('resize', updatePositions)

    // Fallback timer to guarantee correct calculation after images/marquee/layouts render
    const timer = setTimeout(updatePositions, 500)

    return () => {
      window.removeEventListener('resize', updatePositions)
      clearTimeout(timer)
    }
  }, [student])

  const getSaggingPath = (p1: { x: number; y: number }, p2: { x: number; y: number }, sag = 45) => {
    const midX = (p1.x + p2.x) / 2
    const midY = (p1.y + p2.y) / 2 + sag
    return `M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`
  }

  // Prevent background scroll when sidebar drawer is open
  useEffect(() => {
    if (isSidebarOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isSidebarOpen])

  if (!student) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1E2C' }}>
      <p style={{ color: '#F8FAFC' }}>Loading...</p>
    </main>
  )

  const proceedToGame = (levelId: number, activeStyle: 'FI' | 'FD', resolvedTeamId?: string) => {
    resetLevel()
    startLevel(levelId, activeStyle)
    if (resolvedTeamId) setTeamId(resolvedTeamId)
    router.push(`/siswa/game/level/${levelId}`)
  }

  const matchFDTeam = async (studentId: string, levelId: number): Promise<string | null> => {
    try {
      const res = await fetch('/api/game/team/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, levelId }),
      })
      if (res.ok) {
        const data = await res.json()
        // Refresh the team widget on the dashboard
        fetchActiveTeam(studentId, true)
        return data.teamId as string
      }
    } catch { /* silently ignore */ }
    return null
  }

  const handlePlayLevel = async (levelId: number) => {
    if (student?.diagnosticLevel) {
      const activeStyle = student.geftResult?.cognitiveStyle || cognitiveStyle || 'FI'

      // Check cognitive style specific preparation gating
      if (activeStyle === 'FI') {
        const hasRead = localStorage.getItem('has_read_booklet') === 'true'
        if (!hasRead) {
          setGatingLevelId(levelId)
          setGatingStep(1)
          setShowGatingModal(true)
          return
        }
      } else {
        const hasWatched = localStorage.getItem('has_watched_video') === 'true'
        if (!hasWatched) {
          setGatingLevelId(levelId)
          setGatingStep(1)
          setShowGatingModal(true)
          return
        }
      }

      // FD matching bypassed to run as single-player
      proceedToGame(levelId, activeStyle)
    } else {
      router.push(`/siswa/diagnostik?level=${levelId}`)
    }
  }

  const handleBookletComplete = async () => {
    localStorage.setItem('has_read_booklet', 'true')
    setShowBookletModal(false)
    if (gatingLevelId) {
      setShowGatingModal(false)
      const activeStyle = student?.geftResult?.cognitiveStyle || cognitiveStyle || 'FI'
      // FD matching bypassed to run as single-player
      proceedToGame(gatingLevelId, activeStyle)
      setGatingLevelId(null)
    }
  }

  const handleVideoComplete = async () => {
    localStorage.setItem('has_watched_video', 'true')
    setShowVideoModal(false)
    if (gatingLevelId) {
      setShowGatingModal(false)
      const activeStyle = student?.geftResult?.cognitiveStyle || cognitiveStyle || 'FI'
      // FD matching bypassed to run as single-player
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

  // Booklet unlock logic:
  // - Level 1 is always available
  // - Level N (N >= 2) unlocks when Level N-1 has been completed
  const unlockedLevelIds = LEVELS
    .filter(l => l.id === 1 || completedLevels.includes(l.id - 1))
    .map(l => l.id)

  return (
    <OrientationGuard lockScreen={false}>
      <main style={{
        width: '100%',
        height: '100dvh',
        maxHeight: '100dvh',
        minHeight: '100dvh',
        overflow: 'hidden',
        position: 'relative',
        background: '#0b1e2c',
        color: '#F8FAFC',
        fontFamily: 'var(--font-sans), sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* SVG Assets and Filters (cork texture, vignette spotlight, torn paper edge, paper grain) */}
        <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
          <defs>
            {/* Cork texture pattern */}
            <pattern id="corkTexture" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="#C9A876"/>
              <circle cx="8" cy="6" r="1.2" fill="#A8895F" opacity="0.5"/>
              <circle cx="22" cy="14" r="0.9" fill="#8A6E45" opacity="0.4"/>
              <circle cx="34" cy="4" r="1.4" fill="#B5966B" opacity="0.5"/>
              <circle cx="15" cy="24" r="1.1" fill="#8A6E45" opacity="0.4"/>
              <circle cx="30" cy="28" r="0.8" fill="#A8895F" opacity="0.5"/>
              <circle cx="4" cy="33" r="1.3" fill="#8A6E45" opacity="0.4"/>
              <circle cx="38" cy="20" r="1.0" fill="#B5966B" opacity="0.5"/>
              <circle cx="19" cy="37" r="0.9" fill="#A8895F" opacity="0.4"/>
            </pattern>

            {/* Vignette for spotlight effect over the board */}
            <radialGradient id="boardSpotlight" cx="50%" cy="35%" r="70%">
              <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
              <stop offset="70%" stop-color="#000000" stop-opacity="0"/>
              <stop offset="100%" stop-color="#000000" stop-opacity="0.35"/>
            </radialGradient>

            {/* Torn paper edge filter for cards */}
            <filter id="tornEdge" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" result="noise" seed="7"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="6"/>
            </filter>

            {/* Slight paper grain */}
            <filter id="paperGrain">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="grain"/>
              <feColorMatrix in="grain" type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.03 0"/>
              <feComposite operator="over" in2="SourceGraphic"/>
            </filter>
          </defs>
        </svg>

        {/* Main Section Viewport Wrapper */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '12px' : '24px 32px',
            width: '100%',
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), url("/backgr.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'top',
            position: 'relative',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Floating Profile & Toolbar HUD (Top-Left) */}
          {student && (
            <div style={{
              position: 'absolute',
              top: isMobile ? '12px' : '20px',
              left: isMobile ? '12px' : '20px',
              zIndex: 110,
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '6px' : '10px',
              background: 'rgba(15, 32, 48, 0.82)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(14, 131, 136, 0.25)',
              borderRadius: '12px',
              padding: isMobile ? '6px 10px' : '8px 16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            }}>
              {/* Avatar Profile */}
              <div style={{
                width: isMobile ? '28px' : '34px',
                height: isMobile ? '28px' : '34px',
                borderRadius: '50%',
                background: isFI
                  ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                  : 'linear-gradient(135deg, #0E8388 0%, #00ADB5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '11px' : '14px',
                fontWeight: 800,
                color: '#FFFFFF',
                boxShadow: isFI ? '0 0 10px rgba(59,130,246,0.3)' : '0 0 10px rgba(14, 131, 136, 0.3)',
                cursor: 'pointer',
              }}
                onClick={() => setShowGreeting(true)}
                title="Halo!"
              >
                {student.name.charAt(0).toUpperCase()}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: isMobile ? '10px' : '11px', fontWeight: 800, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: isMobile ? '80px' : '120px' }}>
                  {student.name.split(' ')[0]}
                </span>
                <span style={{ fontSize: '9px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                  {student.classroom?.name}
                </span>
              </div>

              <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />

              {/* Path button */}
              {student.geftResult?.cognitiveStyle && (
                <button
                  onClick={() => setShowCognitiveModal(true)}
                  title="Gaya Belajar"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: isFI ? 'rgba(59,130,246,0.15)' : 'rgba(14, 131, 136, 0.15)',
                    border: `1px solid ${isFI ? 'rgba(59,130,246,0.3)' : 'rgba(14, 131, 136, 0.3)'}`,
                    fontSize: '9.5px',
                    color: isFI ? '#60A5FA' : '#00ADB5',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isFI ? '🧠 FI' : '👥 FD'}
                </button>
              )}

              {/* Hamburger button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#FFF',
                  padding: '4px 8px',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>☰</span> {!isMobile && "Menu"}
              </button>

              {/* Exit button */}
              <button
                onClick={() => setShowExitConfirm(true)}
                style={{
                  background: 'rgba(220, 38, 38, 0.1)',
                  border: '1px solid rgba(220, 38, 38, 0.25)',
                  borderRadius: '6px',
                  color: '#EF4444',
                  padding: '4px 8px',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Floating Title Panel HUD (Top-Right) */}
          <div style={{
            position: 'absolute',
            top: isMobile ? '12px' : '20px',
            right: isMobile ? '12px' : '20px',
            zIndex: 100,
            background: 'rgba(15, 32, 48, 0.82)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(14, 131, 136, 0.25)',
            borderRadius: '12px',
            padding: isMobile ? '6px 12px' : '8px 16px',
            textAlign: 'right',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          }}>
            <div style={{
              fontSize: isMobile ? '7px' : '8px',
              color: '#00ADB5',
              fontWeight: 800,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}>
              Misi Investigasi
            </div>
            <h1 style={{
              fontSize: isMobile ? '13px' : '18px',
              fontWeight: 900,
              color: '#FFFFFF',
              margin: '2px 0 0',
              letterSpacing: '-0.2px',
            }}>
              Skeptikos
            </h1>
          </div>

          {/* Papan Corkboard (Board Frame) wrapping only the cards and thread */}
          <div 
            ref={boardRef}
            style={{
              width: isMobile ? '98%' : '96%',
              maxWidth: '1200px',
              height: isMobile ? '250px' : '460px',
              position: 'relative',
              borderRadius: '8px',
              
              // Beveled wooden frame borders
              border: isMobile ? '8px solid #5a3825' : '14px solid #5a3825',
              outline: '2.5px solid #362014',
              outlineOffset: isMobile ? '-8px' : '-16px',
              boxShadow: 'inset 0 12px 36px rgba(0,0,0,0.65), inset 0 -12px 36px rgba(0,0,0,0.65), 0 16px 36px rgba(0,0,0,0.7)',
              
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              marginTop: isMobile ? '20px' : '30px',
            }}
          >
            {/* SVG Corkboard Texture Fill & Vignette Spotlight Overlay */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
              <rect width="100%" height="100%" fill="url(#corkTexture)" />
              <rect width="100%" height="100%" fill="url(#boardSpotlight)" />
            </svg>

            {/* Warm spotlight highlight simulating a yellow desk lamp focused on the top-left */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 15% 15%, rgba(254, 240, 138, 0.28) 0%, rgba(254, 240, 138, 0.08) 35%, rgba(254, 240, 138, 0) 65%)',
              pointerEvents: 'none',
              zIndex: 4,
              mixBlendMode: 'screen',
            }} />

            {/* Red string connector layer - Disabled for now */}
            {/*
            {cardPositions.length >= 2 && (
              <svg className="red-string-layer" style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 5, // Rendered on top layer
              }}>
                {cardPositions[0] && cardPositions[1] && (
                  <>
                    <path
                      d={getSaggingPath(cardPositions[0], cardPositions[1], isMobile ? 25 : 50)}
                      stroke="#B91C1C"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.85"
                      style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.4))' }}
                    />
                    <circle cx={cardPositions[0].x} cy={cardPositions[0].y} r="4" fill="#7F1D1D" />
                    <circle cx={cardPositions[1].x} cy={cardPositions[1].y} r="4" fill="#7F1D1D" />
                  </>
                )}
                {cardPositions[1] && cardPositions[2] && (
                  <>
                    <path
                      d={getSaggingPath(cardPositions[1], cardPositions[2], isMobile ? 25 : 50)}
                      stroke="#B91C1C"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.85"
                      style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.4))' }}
                    />
                    <circle cx={cardPositions[1].x} cy={cardPositions[1].y} r="4" fill="#7F1D1D" />
                    <circle cx={cardPositions[2].x} cy={cardPositions[2].y} r="4" fill="#7F1D1D" />
                  </>
                )}
              </svg>
            )}
            */}

            {/* Level Cards Container */}
            <div className="cards-scroll-container" style={{
              width: '100%',
              overflowX: 'auto',
              overflowY: 'hidden',
              padding: isMobile ? '24px 0' : '64px 0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2,
              flex: 1,
              minHeight: 0,
            }}>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: isMobile ? '24px' : '48px',
              padding: isMobile ? '8px 12px' : '12px 32px',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              {LEVELS.map(level => {
                const isUnlocked = !level.locked
                const isHovered = hoveredCard === level.id
                const rotation = level.id === 1 ? -2.5 : level.id === 2 ? 2 : -1

                // Custom vertical scattering offset to simulate pinned notes on corkboard
                const verticalOffset = level.id === 1 ? -28 : level.id === 2 ? 28 : -14;
                const mobileVerticalOffset = level.id === 1 ? -10 : level.id === 2 ? 10 : -5;
                const currentOffset = isMobile ? mobileVerticalOffset : verticalOffset;

                // Base translation is static to anchor both frame and text labels consistently
                const cardTransform = `translateY(${currentOffset}px)`;

                const accentColor = isFI ? '#3b82f6' : '#0e8388';
                const lockedColor = '#64748B';
                const frameAccent = isUnlocked ? accentColor : lockedColor;

                return (
                  <div
                    key={level.id}
                    ref={cardRefs[level.id - 1]}
                    className={`level-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                    onClick={() => isUnlocked && handlePlayLevel(level.id)}
                    onMouseEnter={() => isUnlocked && setHoveredCard(level.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      width: isMobile ? '240px' : '310px',
                      height: isMobile ? '150px' : '180px',
                      margin: '0',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      position: 'relative',
                      transform: cardTransform,
                      flexShrink: 0,
                      cursor: isUnlocked ? 'pointer' : 'default',
                    }}
                  >
                    {/* Left Child: Camera Viewfinder Frame */}
                    <div style={{
                      width: isMobile ? '140px' : '170px',
                      height: isMobile ? '140px' : '170px',
                      position: 'relative',
                      // Hover animation only affects the card frame container
                      transform: isMobile
                        ? 'none'
                        : isHovered
                          ? `rotate(${rotation + (level.id % 2 === 0 ? 0.5 : -0.5)}deg) translateY(-8px)`
                          : `rotate(${rotation * 0.5}deg)`,
                      transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    }}>
                      {/* 1. Paper Background with Ripped Edges (Filtered, containing corner brackets) */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: isUnlocked ? '#FFFFFF' : '#F1F5F9', // Solid white background
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        borderRadius: '4px',
                        boxShadow: isHovered 
                          ? '0 12px 28px rgba(0,0,0,0.18)' 
                          : '0 4px 12px rgba(0,0,0,0.1)',
                        transition: 'box-shadow 0.3s',
                        filter: 'url(#tornEdge) url(#paperGrain)', // Apply torn edge & paper grain only to the background paper
                        zIndex: 1,
                      }}>
                        {/* Viewfinder Corner Brackets (Warped/torn together with the paper) */}
                        {/* Top-Left Corner */}
                        <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '12px', height: '12px', borderTop: `2.5px solid ${frameAccent}`, borderLeft: `2.5px solid ${frameAccent}`, borderTopLeftRadius: '3px', pointerEvents: 'none', zIndex: 2 }} />
                        {/* Top-Right Corner */}
                        <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '12px', height: '12px', borderTop: `2.5px solid ${frameAccent}`, borderRight: `2.5px solid ${frameAccent}`, borderTopRightRadius: '3px', pointerEvents: 'none', zIndex: 2 }} />
                        {/* Bottom-Left Corner */}
                        <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '12px', height: '12px', borderBottom: `2.5px solid ${frameAccent}`, borderLeft: `2.5px solid ${frameAccent}`, borderBottomLeftRadius: '3px', pointerEvents: 'none', zIndex: 2 }} />
                        {/* Bottom-Right Corner */}
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', borderBottom: `2.5px solid ${frameAccent}`, borderRight: `2.5px solid ${frameAccent}`, borderBottomRightRadius: '3px', pointerEvents: 'none', zIndex: 2 }} />
                      </div>

                      {/* 2. Push-pin on top center (Sits outside of the torn filter so it remains perfectly crisp) */}
                      <div style={{
                        position: 'absolute',
                        top: isMobile ? '-24px' : '-32px',
                        left: '50%',
                        transform: 'translateX(-50%) rotate(12deg)',
                        zIndex: 10,
                        filter: 'drop-shadow(0px 8px 6px rgba(0,0,0,0.3))',
                        pointerEvents: 'none',
                      }}>
                        <svg width={isMobile ? "48" : "60"} height={isMobile ? "54" : "72"} viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <ellipse cx="10" cy="22" rx="4" ry="2" fill="rgba(0,0,0,0.2)" transform="rotate(-15 10 22)" />
                          <path d="M12 14L10 24" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M6 6C6 4.89543 6.89543 4 8 4H16C17.1046 4 18 4.89543 18 6V11C18 11.85 17.3 12.5 16.5 12.8L12.5 14.5L8.5 12.8C7.7 12.5 7 11.8 7 11V6Z" fill={isUnlocked ? '#DC2626' : '#64748B'} />
                          <path d="M9 5H15V6H9V5Z" fill={isUnlocked ? '#EF4444' : '#94A3B8'} />
                          <path d="M12 4C13.1 4 14 3.1 14 2H10C10 3.1 10.9 4 12 4Z" fill={isUnlocked ? '#991B1B' : '#475569'} />
                          <circle cx="10" cy="8" r="1.5" fill="rgba(255,255,255,0.4)" />
                        </svg>
                      </div>

                      {/* 3. Card Content Layer (Renders on top, zIndex: 5, NO filter so icons, tags, buttons & text remain sharp) */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        padding: isMobile ? '10px' : '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        zIndex: 5,
                      }}>
                        {/* Frame Inner Header - LOCK tag */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', height: '10px' }}>
                          {!isUnlocked && (
                            <span style={{
                              fontSize: '8px',
                              fontWeight: 800,
                              color: '#EF4444',
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              padding: '1px 4px',
                              borderRadius: '3px',
                              textTransform: 'uppercase',
                            }}>
                              🔒 LOCK
                            </span>
                          )}
                        </div>

                        {/* Central Icon inside frame */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          position: 'relative',
                        }}>
                          <div style={{
                            width: isMobile ? '32px' : '44px',
                            height: isMobile ? '32px' : '44px',
                            borderRadius: '50%',
                            background: isUnlocked
                              ? 'rgba(0, 0, 0, 0.04)' // subtle contrast background
                              : 'rgba(148, 163, 184, 0.1)',
                            border: `1.5px solid ${frameAccent}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: isMobile ? '16px' : '22px',
                            zIndex: 2,
                          }}>
                            {level.icon}
                          </div>
                        </div>

                        {/* Case Tags (Badges inside frame) */}
                        {isUnlocked && level.tags.length > 0 && (
                          <div style={{
                            display: 'flex',
                            gap: '4px',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                          }}>
                            {level.tags.slice(0, 2).map(tag => (
                              <span
                                key={tag}
                                style={{
                                  fontSize: '7.5px',
                                  background: 'rgba(0, 0, 0, 0.03)',
                                  border: `1px solid ${frameAccent}33`,
                                  borderRadius: '3px',
                                  padding: '2px 4px',
                                  color: frameAccent,
                                  fontWeight: 700,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Frame Action Button (Mulai Penyelidikan) */}
                        <div style={{ marginTop: '4px' }}>
                          {isUnlocked ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePlayLevel(level.id)
                              }}
                              style={{
                                width: '100%',
                                padding: '6px',
                                borderRadius: '4px',
                                border: 'none',
                                background: frameAccent,
                                color: '#FFFFFF',
                                fontSize: '9.5px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: `0 2px 8px ${frameAccent}44`,
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '3px',
                              }}
                              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
                              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                            >
                              <span>Investigasi</span>
                              <span>→</span>
                            </button>
                          ) : (
                            <div style={{
                              width: '100%',
                              padding: '6px',
                              borderRadius: '4px',
                              background: 'rgba(148, 163, 184, 0.05)',
                              border: '1px solid rgba(148, 163, 184, 0.15)',
                              color: 'rgba(0, 0, 0, 0.3)',
                              fontSize: '9.5px',
                              fontWeight: 700,
                              textAlign: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '3px',
                            }}>
                              <span>🔒 Locked</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Child: HUD Labels Outside Frame (Dark Slate / Black Ink look on Corkboard) */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      marginLeft: isMobile ? '8px' : '14px',
                      maxWidth: isMobile ? '90px' : '120px',
                      flexShrink: 0,
                      textAlign: 'left',
                      pointerEvents: 'none',
                    }}>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 900,
                        fontFamily: 'monospace',
                        color: isUnlocked ? frameAccent : '#64748B',
                        letterSpacing: '1px',
                      }}>
                        GALLERY 0{level.id}
                      </span>
                      <h3 style={{
                        fontSize: isMobile ? '10px' : '12px',
                        fontWeight: 800,
                        color: isUnlocked ? '#0F172A' : '#64748B', // Black/dark slate color for active level titles
                        margin: '3px 0 1px 0',
                        lineHeight: '1.2',
                      }}>
                        {level.title}
                      </h3>
                      {level.locationName && (
                        <span style={{
                          fontSize: '8.5px',
                          color: isUnlocked ? '#475569' : '#8290A6', // Dark gray color for active locations
                          fontWeight: 600,
                        }}>
                          📍 {level.locationName}
                        </span>
                      )}
                    </div>
                  </div>
                )
            })}
          </div>
        </div>
      </div>


        </div>

        {/* ── FD: Tim Investigasi Saya Widget (Hidden for single-player fallback) ──
      {!isFI && student?.geftResult?.cognitiveStyle === 'FD' && (
        <div id="team-widget" style={{
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          padding: isMobile ? '0 16px 32px' : '0 32px 40px',
        }}>
          <div style={{
            borderRadius: '20px',
            border: '1.5px solid rgba(6,182,212,0.25)',
            background: 'linear-gradient(135deg, rgba(6,182,212,0.04) 0%, rgba(255,255,255,0.8) 100%)',
            backdropFilter: 'blur(10px)',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(6,182,212,0.08)',
          }}>
            <div style={{ display: 'flex', justifyStyle: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '22px' }}>👥</span>
                <div>
                  <div style={{ fontSize: '11px', color: '#0e7490', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '2px' }}>TIM INVESTIGASI SAYA</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C1917' }}>
                    {activeTeam ? `Level ${activeTeam.levelId} · ${activeTeam.classroomName}` : 'Kelompok Kelas Saya'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => student && fetchActiveTeam(student.id, true)}
                disabled={teamRefreshing || teamLoading}
                title="Refresh status tim"
                style={{
                  width: '34px', height: '34px',
                  borderRadius: '10px',
                  border: '1px solid rgba(6,182,212,0.25)',
                  background: 'rgba(6,182,212,0.06)',
                  color: '#0e7490',
                  fontSize: '14px',
                  cursor: teamRefreshing ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  opacity: teamRefreshing ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!teamRefreshing) e.currentTarget.style.background = 'rgba(6,182,212,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.06)' }}
              >
                {teamRefreshing ? '⏳' : '🔄'}
              </button>
            </div>

            {teamLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#78716C', fontSize: '13px', padding: '12px 0' }}>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span>
                Memuat data tim...
              </div>
            ) : activeTeam ? (
              <>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '4px 12px', borderRadius: '50px',
                  fontSize: '11px', fontWeight: 700, marginBottom: '16px',
                  background: activeTeam.status === 'PLAYING' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                  border: `1px solid ${activeTeam.status === 'PLAYING' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                  color: activeTeam.status === 'PLAYING' ? '#059669' : '#D97706',
                }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: activeTeam.status === 'PLAYING' ? '#10B981' : '#F59E0B',
                    display: 'inline-block',
                    animation: activeTeam.status === 'WAITING' ? 'teamPulse 1.5s infinite alternate' : 'none',
                  }} />
                  {activeTeam.status === 'PLAYING'
                    ? '🎮 Permainan Berlangsung'
                    : `👥 Tim Terbentuk · ${activeTeam.members.filter(m => m.isOnline).length}/${activeTeam.members.length} Online`
                  }
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {[0, 1, 2].map((idx) => {
                    const member = activeTeam.members[idx]
                    const isMe = member?.id === student?.id
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          background: member
                            ? isMe ? 'rgba(6,182,212,0.08)' : 'rgba(255,255,255,0.6)'
                            : 'transparent',
                          border: member
                            ? `1px solid ${isMe ? 'rgba(6,182,212,0.3)' : 'rgba(180,140,80,0.15)'}` 
                            : '1px dashed rgba(180,140,80,0.2)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <span style={{ fontSize: '18px' }}>{member ? '🕵️' : '❓'}</span>
                            {member && (
                              <span style={{
                                position: 'absolute', bottom: -1, right: -1,
                                width: '8px', height: '8px', borderRadius: '50%',
                                background: member.isOnline ? '#10B981' : '#94A3B8',
                                border: '1.5px solid #fff',
                                display: 'block',
                              }} />
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: member ? '#1C1917' : '#A8A29E' }}>
                              {member ? member.name : `Slot ${idx + 1} (kosong)`}
                            </div>
                            {member && (
                              <div style={{ fontSize: '10px', color: isMe ? '#0e7490' : '#78716C', fontWeight: 600 }}>
                                {isMe ? 'Anda' : 'Anggota Tim'}
                              </div>
                            )}
                          </div>
                        </div>
                        {member && (
                          <span style={{
                            fontSize: '10px', fontWeight: 700,
                            color: member.isOnline ? '#10B981' : '#94A3B8',
                            background: member.isOnline ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)',
                            border: `1px solid ${member.isOnline ? 'rgba(16,185,129,0.3)' : 'rgba(148,163,184,0.2)'}`,
                            padding: '2px 8px', borderRadius: '50px',
                          }}>{member.isOnline ? '🟢 Online' : '⚫ Offline'}</span>
                        )}
                        {!member && (
                          <span style={{
                            fontSize: '10px', fontWeight: 600,
                            color: '#A8A29E',
                          }}>—</span>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyStyle: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#78716C', fontWeight: 600 }}>Anggota Bergabung</span>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#0e7490' }}>{activeTeam.members.length} / 3</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(6,182,212,0.12)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      borderRadius: '3px',
                      background: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                      width: `${(activeTeam.members.length / 3) * 100}%`,
                      transition: 'width 0.6s ease',
                      boxShadow: '0 0 8px rgba(6,182,212,0.4)',
                    }} />
                  </div>
                </div>

                {activeTeam.status === 'PLAYING' || activeTeam.members.length === 3 ? (
                  <button
                    onClick={() => handlePlayLevel(activeTeam.levelId)}
                    style={{
                      width: '100%', padding: '12px',
                      borderRadius: '12px', border: 'none',
                      background: 'linear-gradient(90deg, #0891b2, #06b6d4)',
                      color: '#fff', fontSize: '13px', fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(6,182,212,0.3)',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                  >
                    <span>{activeTeam.status === 'PLAYING' ? '🎮 Lanjutkan Permainan' : '👥 Masuk Lobi Permainan'}</span>
                    <span>→</span>
                  </button>
                ) : (
                  <div style={{
                    textAlign: 'center', fontSize: '12px',
                    color: '#78716C', padding: '8px',
                    background: 'rgba(245,158,11,0.04)',
                    borderRadius: '10px',
                    border: '1px dashed rgba(245,158,11,0.2)',
                  }}>
                    ⏳ Menunggu {3 - activeTeam.members.length} anggota lagi untuk memulai permainan...
                  </div>
                )}
              </>
            ) : (
              <div style={{
                textAlign: 'center', padding: '20px',
                color: '#78716C', fontSize: '13px', lineHeight: 1.6,
              }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔍</div>
                <div style={{ fontWeight: 700, marginBottom: '4px', color: '#1C1917' }}>Belum Ada Tim Aktif</div>
                <div style={{ fontSize: '12px' }}>
                  Klik <strong>Mulai Penyelidikan</strong> pada Level 1 di atas untuk bergabung ke kelompok kelas kamu secara otomatis.
                </div>
              </div>
            )}
          </div>
          <style>{`
            @keyframes teamPulse {
              from { opacity: 0.5; }
              to { opacity: 1; }
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      */
        }

        {/* Exit Confirmation Modal */}
        {showExitConfirm && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 30, 44, 0.85)',
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
                background: '#0F2338',
                border: '1px solid rgba(14, 131, 136, 0.25)',
                borderRadius: '24px',
                padding: '28px',
                width: '380px',
                maxHeight: 'calc(100vh - 40px)',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), var(--accent-glow)'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ⚠️ Konfirmasi Keluar
                </h3>
                <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#94A3B8', lineHeight: 1.55 }}>
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
                    border: '1px solid rgba(14, 131, 136, 0.25)',
                    background: 'transparent',
                    color: '#94A3B8',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(14, 131, 136, 0.1)'
                    e.currentTarget.style.borderColor = 'var(--game-border-accent)'
                    e.currentTarget.style.color = '#FFFFFF'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'rgba(14, 131, 136, 0.25)'
                    e.currentTarget.style.color = '#94A3B8'
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
                background: 'rgba(11, 30, 44, 0.85)', backdropFilter: 'blur(12px)',
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
                  background: 'rgba(15, 35, 56, 0.95)',
                  border: `1px solid ${info.border}`,
                  borderRadius: '24px', padding: '32px 28px',
                  width: '100%', maxWidth: '440px',
                  maxHeight: 'calc(100vh - 40px)',
                  overflowY: 'auto',
                  boxShadow: `0 8px 30px rgba(14, 131, 136, 0.1)`,
                  color: '#F8FAFC',
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
                    style={{ background: 'none', border: 'none', color: '#A8A29E', fontSize: '20px', cursor: 'pointer', padding: '4px' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                    onMouseLeave={e => e.currentTarget.style.color = '#A8A29E'}
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
                        background: 'rgba(14, 131, 136, 0.04)',
                        border: '1px solid rgba(14, 131, 136, 0.1)',
                      }}
                    >
                      <span style={{ fontSize: '20px', flexShrink: 0 }}>{t.icon}</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '3px' }}>{t.title}</div>
                        <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>{t.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div style={{
                  padding: '14px 16px', borderRadius: '14px',
                  background: info.bg, border: `1px solid ${info.border}`,
                  fontSize: '13px', color: '#E2E8F0', lineHeight: 1.6,
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
              background: 'rgba(11, 30, 44, 0.85)', backdropFilter: 'blur(12px)',
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
                background: 'rgba(15, 35, 56, 0.95)',
                border: '1px solid rgba(14, 131, 136, 0.25)',
                borderRadius: '24px', padding: '32px 28px',
                width: '100%', maxWidth: '440px',
                maxHeight: 'calc(100vh - 40px)',
                overflowY: 'auto',
                boxShadow: '0 8px 30px rgba(14, 131, 136, 0.1)',
                color: '#F8FAFC',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#00ADB5', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '6px' }}>
                    LAPORAN MASUK
                  </div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900 }}>
                    👋 Halo, {student.name.split(' ')[0]}!
                  </h3>
                </div>
                <button
                  onClick={handleCloseGreeting}
                  style={{ background: 'none', border: 'none', color: '#A8A29E', fontSize: '20px', cursor: 'pointer', padding: '4px', lineHeight: 1 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >✕</button>
              </div>

              <div style={{
                padding: '16px',
                borderRadius: '16px',
                background: 'rgba(14, 131, 136, 0.04)',
                border: '1px solid rgba(14, 131, 136, 0.15)',
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
                  background: isFI ? '#2563eb' : '#0E8388',
                  color: '#FFFFFF',
                  fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                  boxShadow: isFI ? '0 4px 15px rgba(37,99,235,0.3)' : '0 4px 15px rgba(0,173,181,0.3)',
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
                  background: 'rgba(11, 30, 44, 0.7)',
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
                  height: '100dvh',
                  maxHeight: '100dvh',
                  background: 'rgba(15, 35, 56, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderLeft: `1px solid ${isFI ? 'rgba(59,130,246,0.3)' : 'rgba(14, 131, 136, 0.25)'}`,
                  boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  zIndex: 160,
                  overflowY: 'auto',
                }}
              >
                {/* Sidebar Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>☰</span>
                    <span style={{ fontWeight: 800, fontSize: '16px', color: '#F8FAFC' }}>Menu Navigasi</span>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#A8A29E',
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
                      router.push('/siswa/chat')
                    }}
                    className="sidebar-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      borderRadius: '16px',
                      background: 'rgba(14, 131, 136, 0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: '#F8FAFC',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      outline: 'none',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>💬</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px' }}>Tanya DiRA</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Chatbot AI Asisten Belajar</div>
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
                      background: 'rgba(14, 131, 136, 0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: '#F8FAFC',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      outline: 'none',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>📖</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px' }}>Buku Saku Detektif</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Ringkasan Materi & Teori</div>
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
                      background: 'rgba(14, 131, 136, 0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: '#F8FAFC',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      outline: 'none',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>🎥</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px' }}>Video Pembelajaran</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Penjelasan Audio-Visual</div>
                    </div>
                  </button>

                  {/* Tim Saya — hanya untuk FD */}
                  {false && !isFI && student?.geftResult?.cognitiveStyle === 'FD' && (
                    <button
                      onClick={() => {
                        setIsSidebarOpen(false)
                        setTimeout(() => {
                          const el = document.getElementById('team-widget')
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }, 200)
                      }}
                      className="sidebar-btn"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        borderRadius: '16px',
                        background: 'rgba(14,131,136,0.06)',
                        border: '1px solid rgba(14,131,136,0.2)',
                        color: '#F8FAFC',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: 'none',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(14,131,136,0.12)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(14,131,136,0.06)' }}
                    >
                      <span style={{ fontSize: '24px' }}>👥</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#00ADB5' }}>Tim Investigasi Saya</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                          {activeTeam ? `${activeTeam?.members?.length ?? 0}/3 anggota · ${activeTeam?.status === 'PLAYING' ? 'Sedang Bermain' : 'Menunggu'}` : 'Lihat status tim kamu'}
                        </div>
                      </div>
                    </button>
                  )}



                  {isMobile && (
                    <button
                      onClick={() => {
                        setIsSidebarOpen(false)
                        setShowExitConfirm(true)
                      }}
                      className="sidebar-btn"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        borderRadius: '16px',
                        background: 'rgba(220, 38, 38, 0.05)',
                        border: '1px solid rgba(220, 38, 38, 0.2)',
                        color: '#DC2626',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: 'none',
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>🚪</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '14px' }}>Keluar Sesi</div>
                        <div style={{ fontSize: '11px', color: '#EF4444', opacity: 0.8, marginTop: '2px' }}>Akhiri Sesi Investigasi</div>
                      </div>
                    </button>
                  )}
                </div>

                {/* Sidebar Footer */}
                <div style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
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
            background: 'rgba(250,246,238, 0.85)',
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
                background: 'rgba(255,255,255, 0.95)',
                border: `1px solid ${isFI ? 'rgba(59,130,246,0.3)' : 'rgba(217,119,6, 0.25)'}`,
                borderRadius: '24px',
                padding: '28px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: 'calc(100vh - 40px)',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(217,119,6, 0.08)',
              }}
            >
              {!gatingLevelId && (
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
              )}
              <DetektivBooklet mode={resolvedStyle} onComplete={handleBookletComplete} unlockedLevelIds={unlockedLevelIds} />
            </motion.div>
          </div>
        )}

        {/* Modal Video Pembelajaran */}
        {showVideoModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(250,246,238, 0.85)',
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
                background: 'rgba(255,255,255, 0.95)',
                border: `1px solid ${isFI ? 'rgba(59,130,246,0.3)' : 'rgba(217,119,6, 0.25)'}`,
                borderRadius: '24px',
                padding: '28px',
                width: '100%',
                maxWidth: '640px',
                position: 'relative',
                boxShadow: '0 8px 30px rgba(180,120,40,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px' }}>🎥</span>
                  <div>
                    <div style={{ fontSize: '11px', color: isFI ? '#2563EB' : '#D97706', fontWeight: 800, letterSpacing: '1px' }}>VIDEO PEMBELAJARAN</div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Mean, Median, & Modus Data Kelompok</h3>
                  </div>
                </div>
                {!gatingLevelId && (
                  <button
                    onClick={() => setShowVideoModal(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#78716C',
                      fontSize: '20px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                    onMouseLeave={e => e.currentTarget.style.color = '#78716C'}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div style={{ width: '100%', position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px', border: '1px solid rgba(180,140,80,0.15)' }}
                  src="https://www.youtube.com/embed/UqWLcTirNjU"
                  title="Video Pembelajaran Statistika"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>

              <div style={{ fontSize: '13px', color: '#78716C', lineHeight: 1.5 }}>
                Tonton video pembelajaran dari channel Matematika Hebat di atas untuk memahami dasar-dasar perhitungan statistika deskriptif pada data kelompok sebelum kamu memulai investigasi kasus!
              </div>

              <button
                onClick={handleVideoComplete}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  background: isFI ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' : 'linear-gradient(90deg, #D97706, #EA580C)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isFI ? '0 4px 20px rgba(59,130,246,0.3)' : '0 4px 20px rgba(217,119,6,0.3)',
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
            background: 'rgba(11, 30, 44, 0.85)',
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
                background: '#0F2338',
                border: `1.5px solid ${resolvedStyle === 'FI' ? '#3b82f6' : '#D97706'}`,
                borderRadius: '24px',
                padding: '32px',
                width: '100%',
                maxWidth: '460px',
                position: 'relative',
                boxShadow: `0 20px 40px rgba(0, 0, 0, 0.6), var(--accent-glow)`,
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                color: '#F8FAFC',
              }}
            >
              {/* Gating Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(14, 131, 136, 0.15)', paddingBottom: '16px' }}>
                <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
                  <img
                    src="/dira-avatar.png"
                    alt="DiRA"
                    style={{ width: '40px', height: '40px', borderRadius: '50%', border: `1.5px solid ${resolvedStyle === 'FI' ? '#3b82f6' : '#D97706'}` }}
                  />
                </div>
                <div>
                  <span style={{
                    fontSize: '9px',
                    color: resolvedStyle === 'FI' ? '#2563EB' : '#D97706',
                    fontWeight: 800,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                  }}>
                    ARAHAN TUTOR DiRA • LANGKAH {gatingStep} DARI 2
                  </span>
                  <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 900, color: '#F8FAFC' }}>
                    🕵️‍♂️ Persiapan Misi
                  </h3>
                </div>
              </div>

              {/* Step 1: Penjelasan Gaya Kognitif */}
              {gatingStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    background: 'rgba(14, 131, 136, 0.04)',
                    border: '1px solid rgba(14, 131, 136, 0.25)',
                    borderRadius: '16px',
                    padding: '20px',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: '#e5e7eb',
                  }}>
                    <p style={{ margin: '0 0 12px 0' }}>
                      Halo, <strong>{student?.name.split(' ')[0]}</strong>! Sebelum terjun ke lokasi investigasi, kita perlu mempersiapkan bekal analisismu.
                    </p>
                    <p style={{ margin: 0 }}>
                      Berdasarkan hasil tes GEFT kamu, gaya kognitifmu teridentifikasi sebagai <strong style={{ color: resolvedStyle === 'FI' ? '#2563EB' : '#34d399', fontSize: '15px' }}>{resolvedStyle === 'FI' ? '🧠 Field Independent (FI)' : '👥 Field Dependent (FD)'}</strong>.
                    </p>
                  </div>

                  <button
                    onClick={() => setGatingStep(2)}
                    className={resolvedStyle === 'FI' ? 'pulsing-btn-blue' : 'pulsing-btn-green'}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      background: resolvedStyle === 'FI' ? 'linear-gradient(90deg, #2563eb, #1d4ed8)' : 'linear-gradient(90deg, #D97706, #B45309)',
                      border: 'none',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                  >
                    Lanjut ke Arahan Misi →
                  </button>
                </div>
              )}

              {/* Step 2: Insting & Perintah Belajar */}
              {gatingStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    background: 'rgba(14, 131, 136, 0.04)',
                    border: '1px solid rgba(14, 131, 136, 0.25)',
                    borderRadius: '16px',
                    padding: '20px',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: '#e5e7eb',
                  }}>
                    {resolvedStyle === 'FI' ? (
                      <>
                        Sebagai detektif bertipe <strong>Field Independent (FI)</strong>, kamu cenderung sangat hebat dalam menganalisis detail secara mandiri.
                        <p style={{ margin: '12px 0 0 0', fontWeight: 600, color: '#2563EB' }}>
                          👉 Kamu diinstruksikan untuk mempelajari BUKU SAKU DETEKTIF terlebih dahulu untuk memperkuat dasar teorimu!
                        </p>
                      </>
                    ) : (
                      <>
                        Sebagai detektif bertipe <strong>Field Dependent (FD)</strong>, kamu belajar paling baik melalui interaksi visual dan penjelasan kontekstual.
                        <p style={{ margin: '12px 0 0 0', fontWeight: 600, color: '#34d399' }}>
                          👉 Kamu diinstruksikan untuk menonton VIDEO PEMBELAJARAN terlebih dahulu untuk memahami visualisasi konsep statistika!
                        </p>
                      </>
                    )}
                  </div>

                  {resolvedStyle === 'FI' ? (
                    <button
                      onClick={() => {
                        setShowGatingModal(false)
                        setShowBookletModal(true)
                      }}
                      className="pulsing-btn-blue"
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
                        border: 'none',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
                      onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                    >
                      <span>📖 Buka Buku Saku Detektif</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowGatingModal(false)
                        setShowVideoModal(true)
                      }}
                      className="pulsing-btn-green"
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        background: 'linear-gradient(90deg, #D97706, #B45309)',
                        border: 'none',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
                      onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                    >
                      <span>🎥 Tonton Video Pembelajaran</span>
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Scrollbar & Card Hover Styles */}
        <style>{`
        @keyframes ripple {
          0% {
            transform: scale(0.8);
            opacity: 0.7;
            box-shadow: 0 0 0 0 rgba(14, 131, 136, 0.35);
          }
          70% {
            transform: scale(1.8);
            opacity: 0.2;
            box-shadow: 0 0 0 12px rgba(14, 131, 136, 0);
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
            box-shadow: 0 0 0 0 rgba(14, 131, 136, 0);
          }
        }

        @keyframes buttonPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(14, 131, 136, 0.4);
          }
          70% {
            box-shadow: 0 0 0 12px rgba(14, 131, 136, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(14, 131, 136, 0);
          }
        }

        @keyframes buttonPulseBlue {
          0% {
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
          }
          70% {
            box-shadow: 0 0 0 12px rgba(37, 99, 235, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
          }
        }

        .pulsing-btn-green {
          animation: buttonPulse 1.8s infinite;
        }

        .pulsing-btn-blue {
          animation: buttonPulseBlue 1.8s infinite;
        }

        .cards-scroll-container::-webkit-scrollbar {
          height: 6px;
        }
        .cards-scroll-container::-webkit-scrollbar-track {
          background: rgba(10, 15, 30, 0.3);
          border-radius: 10px;
        }
        .cards-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(14, 131, 136, 0.25);
          border-radius: 10px;
        }
        .cards-scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(14, 131, 136, 0.45);
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
        .level-card.locked {
          opacity: 0.65;
        }

        .sidebar-btn {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sidebar-btn:hover {
          background: ${isFI ? 'rgba(59,130,246,0.06)' : 'rgba(217,119,6,0.05)'} !important;
          border-color: ${isFI ? 'rgba(59,130,246,0.35)' : 'rgba(217,119,6,0.3)'} !important;
          box-shadow: 0 0 15px ${isFI ? 'rgba(59,130,246,0.1)' : 'rgba(217,119,6,0.08)'};
          transform: translateY(-2px);
        }
      `}</style>
      </main>
    </OrientationGuard>
  )
}