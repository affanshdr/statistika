'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'
import { gameAudio } from '@/lib/utils/gameAudio'
import { syncPlayerProgressFromCloud, getActivePlayer } from '@/lib/utils/playerSync'
import DetektivBooklet from './game/_levels/level2/components/DetektivBooklet'
import OrientationGuard from './game/_components/OrientationGuard'
import GamePreloader from './game/_components/GamePreloader'
import AboutGameModal from '@/components/AboutGameModal'

type Student = {
  id: string
  name: string
  nisn: string
  classroom: { name: string }
  diagnosticScore?: number | null
  diagnosticLevel?: string | null
}



const LEVELS = [
  {
    id: 1,
    code: 'CASE #01',
    category: 'Pemusatan Data',
    icon: '📊',
    thumbnail: '/Assets/Building/Kelas.webp',
    npcAvatar: '/Assets/Character/pak-sutrisno-avatar.png',
    npcName: 'Pak Sutrisno',
    title: 'Kasus 1: Misteri Jam Layar',
    desc: 'Wawancarai 24 siswa di berbagai kelas & fasilitas sekolah bersama Pak Sutrisno untuk membuktikan klaim jam layar.',
    tags: ['Mean', 'Median', 'Modus'],
    locked: false,
    xpMax: 100,
    locationName: 'Gedung & Kelas SMP',
  },
  {
    id: 2,
    code: 'CASE #02',
    category: 'Penyebaran Data',
    icon: '🎯',
    thumbnail: '/Assets/Building/field/lapangan_saja.png',
    npcAvatar: '/Assets/Building/Ruang VII-B/Pak Bambang.webp',
    npcName: 'Pak Bambang',
    title: 'Kasus 2: Pengukuran Lemparan',
    desc: 'Kumpulkan 15 data lemparan bola siswa di lapangan bersama Pak Bambang untuk menganalisis sebaran jarak lemparan.',
    tags: ['Jangkauan', 'Kuartil (Q1-Q3)', 'Simpangan Kuartil'],
    locked: false,
    xpMax: 100,
    locationName: 'Lapangan Olahraga SMP',
  },
]

export default function SiswaPage() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [showCognitiveModal, setShowCognitiveModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showGreeting, setShowGreeting] = useState(false)
  const [isMuted, setIsMuted] = useState(() => gameAudio.getMuted())

  // Corkboard and Detective elements tracking
  const boardRef = useRef<HTMLDivElement>(null)
  const cardRef1 = useRef<HTMLDivElement>(null)
  const cardRef2 = useRef<HTMLDivElement>(null)
  const cardRefs = [cardRef1, cardRef2]
  const [cardPositions, setCardPositions] = useState<{ x: number; y: number }[]>([])
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  // Navigation & Study Modals State
  const [showBookletModal, setShowBookletModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [showGatingModal, setShowGatingModal] = useState(false)
  const [gatingLevelId, setGatingLevelId] = useState<number | null>(null)
  const [gatingStep, setGatingStep] = useState<1 | 2>(1)

  // Game store variables
  const { startLevel, resetLevel, completedLevels, completedPostTests = [], levelStars: storeStars, syncFromProgress, resetPlayerSession } = useGameStore()

  const effectiveStars: Record<number, number> = storeStars || {}

  useEffect(() => {
    const unsub = gameAudio.subscribeMute(setIsMuted)
    gameAudio.playBGM('menu')
    return () => unsub()
  }, [])

  useEffect(() => {
    // 1. Ambil data profil pemain aktif (Username & Display Name)
    const activePlayer = getActivePlayer()
    if (activePlayer) {
      setStudent({
        id: activePlayer.id,
        name: activePlayer.displayName || activePlayer.username,
        nisn: '-',
        classroom: { name: `@${activePlayer.username}` }
      })
    } else {
      const data = localStorage.getItem('student')
      if (!data) {
        setStudent({
          id: 'detektif-guest',
          name: 'Pemain',
          nisn: '-',
          classroom: { name: 'Pemain Mandiri' }
        })
      } else {
        const s = JSON.parse(data) as Student
        setStudent(s)
      }
    }

    // 2. Sinkronkan progres bintang & XP dari database Supabase
    syncPlayerProgressFromCloud().then((cloudProgress: any) => {
      if (cloudProgress) {
        resetPlayerSession(cloudProgress)
      } else {
        const rawLocal = localStorage.getItem('player_progress')
        if (rawLocal) {
          try {
            resetPlayerSession(JSON.parse(rawLocal))
          } catch (e) {
            console.error('Error parsing player_progress:', e)
            resetPlayerSession()
          }
        } else {
          resetPlayerSession()
        }
      }
    })

    const alreadyShown = sessionStorage.getItem('greeting_shown')
    if (!alreadyShown) {
      setShowGreeting(true)
      sessionStorage.setItem('greeting_shown', '1')
    }
  }, [router, resetPlayerSession])


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
        return {
          // Center of the card where the push-pin is anchored
          x: rect.left + rect.width / 2 - boardRect.left,
          // Push-pin needle point coordinate relative to the board container
          y: rect.top - boardRect.top + (window.innerWidth < 768 ? -3 : -5),
        }
      })
      setCardPositions(positions)
    }

    updatePositions()
    window.addEventListener('resize', updatePositions)

    // Fallback timer to guarantee correct calculation after images/marquee/layouts render
    const timer = setTimeout(updatePositions, 350)

    return () => {
      window.removeEventListener('resize', updatePositions)
      clearTimeout(timer)
    }
  }, [student, isMobile])

  const getSaggingPath = (p1: { x: number; y: number }, p2: { x: number; y: number }, sag = 45) => {
    const midX = (p1.x + p2.x) / 2
    const midY = (p1.y + p2.y) / 2 + sag
    return `M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`
  }

  const [loadingLevel, setLoadingLevel] = useState<{
    id: number
    title: string
    code: string
    imagesToPreload: string[]
  } | null>(null)

  useEffect(() => {
    setLoadingLevel(null)
  }, [])

  if (!student) return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
      background: 'radial-gradient(ellipse at center, #26160E 0%, #120A06 100%)',
      color: '#FDE047',
      fontFamily: 'var(--font-sans), sans-serif'
    }}>
      <motion.div
        animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3D2419 0%, #2D1A12 100%)',
          border: '2px solid #F59E0B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6), inset 0 0 12px rgba(245,158,11,0.25)'
        }}
      >
        🕵️‍♂️
      </motion.div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, color: '#FBBF24', letterSpacing: '2px', textTransform: 'uppercase' }}>
          MEMVERIFIKASI DETEKTIF...
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', fontWeight: 800, color: '#FEF3C7' }}>
          Menyiapkan Papan Kasus...
        </p>
      </div>
    </main>
  )

  const proceedToGame = (levelId: number) => {
    const levelInfo = LEVELS.find(l => l.id === levelId)
    const imagesToPreload = levelId === 1
      ? [
          '/Assets/Building/Gerbang.jpg',
          '/Assets/Building/Kelas.webp',
          '/Assets/Building/Fasilitas.webp',
          '/Assets/Character/pak-sutrisno-avatar.png',
          '/Assets/Character/pak-joko-satpam.png',
        ]
      : [
          '/Assets/Building/field/lapangan_saja.png',
          '/Assets/Building/Ruang VII-B/Pak Bambang.webp',
        ]

    setLoadingLevel({
      id: levelId,
      title: levelInfo?.title || `Kasus ${levelId}`,
      code: levelInfo?.code || `CASE #0${levelId}`,
      imagesToPreload,
    })

    resetLevel()
    startLevel(levelId)
    try {
      router.prefetch(`/siswa/game/level/${levelId}`)
    } catch {
      // prefetch fallback
    }
  }

  const handlePlayLevel = async (levelId: number) => {
    if (loadingLevel) return
    gameAudio.playClick()
    proceedToGame(levelId)
  }

  const handleBookletComplete = async () => {
    localStorage.setItem('has_read_booklet', 'true')
    setShowBookletModal(false)
    if (gatingLevelId) {
      setShowGatingModal(false)
      proceedToGame(gatingLevelId)
      setGatingLevelId(null)
    }
  }

  const handleCloseGreeting = () => {
    gameAudio.playClick()
    setShowGreeting(false)
  }

  const handleCloseCognitive = () => {
    setShowCognitiveModal(false)
  }

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
        background: '#1A0F0A',
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
              <rect width="40" height="40" fill="#C9A876" />
              <circle cx="8" cy="6" r="1.2" fill="#A8895F" opacity="0.5" />
              <circle cx="22" cy="14" r="0.9" fill="#8A6E45" opacity="0.4" />
              <circle cx="34" cy="4" r="1.4" fill="#B5966B" opacity="0.5" />
              <circle cx="15" cy="24" r="1.1" fill="#8A6E45" opacity="0.4" />
              <circle cx="30" cy="28" r="0.8" fill="#A8895F" opacity="0.5" />
              <circle cx="4" cy="33" r="1.3" fill="#8A6E45" opacity="0.4" />
              <circle cx="38" cy="20" r="1.0" fill="#B5966B" opacity="0.5" />
              <circle cx="19" cy="37" r="0.9" fill="#A8895F" opacity="0.4" />
            </pattern>

            {/* Vignette for spotlight effect over the board */}
            <radialGradient id="boardSpotlight" cx="50%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0" />
              <stop offset="70%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
            </radialGradient>

            {/* Torn paper edge filter for cards */}
            <filter id="tornEdge" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" result="noise" seed="7" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
            </filter>

            {/* Slight paper grain */}
            <filter id="paperGrain">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="grain" />
              <feColorMatrix in="grain" type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.03 0" />
              <feComposite operator="over" in2="SourceGraphic" />
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
            backgroundImage: 'linear-gradient(rgba(44, 26, 16, 0.4), rgba(44, 26, 16, 0.65)), url("/backgr.webp")',
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
              background: 'linear-gradient(135deg, rgba(28, 18, 13, 0.92) 0%, rgba(44, 27, 18, 0.94) 100%)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(212, 175, 55, 0.45)',
              borderRadius: '14px',
              padding: isMobile ? '6px 10px' : '8px 16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(254, 240, 138, 0.2), 0 0 14px rgba(212, 175, 55, 0.15)',
            }}>
              {/* Avatar Profile (Detective Gold Badge) */}
              <div style={{
                width: isMobile ? '28px' : '34px',
                height: isMobile ? '28px' : '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)',
                border: '1.5px solid #FDE68A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '11px' : '14px',
                fontWeight: 900,
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), 0 0 10px rgba(245, 158, 11, 0.35)',
                cursor: 'pointer',
              }}
                onClick={() => setShowGreeting(true)}
                title="Halo Detektif!"
              >
                {student.name.charAt(0).toUpperCase()}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: isMobile ? '10px' : '11.5px', fontWeight: 800, color: '#FEF3C7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: isMobile ? '80px' : '120px', letterSpacing: '0.2px' }}>
                  {student.name.split(' ')[0]}
                </span>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#FDE68A', opacity: 0.85, whiteSpace: 'nowrap' }}>
                  {student.classroom?.name || 'Detektif SMP'}
                </span>
              </div>

              {/* Audio Mute/Unmute button */}
              <button
                onClick={() => gameAudio.toggleMute()}
                title={isMuted ? 'Nyalakan Musik & Suara' : 'Matikan Musik & Suara'}
                style={{
                  background: isMuted ? 'rgba(239, 68, 68, 0.18)' : 'rgba(217, 119, 6, 0.18)',
                  border: `1px solid ${isMuted ? 'rgba(239, 68, 68, 0.45)' : 'rgba(245, 158, 11, 0.45)'}`,
                  borderRadius: '8px',
                  color: isMuted ? '#FCA5A5' : '#FDE68A',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <span>{isMuted ? '🔇' : '🔊'}</span>
              </button>

              {/* Exit button */}
              <button
                onClick={() => {
                  gameAudio.playClick()
                  setShowExitConfirm(true)
                }}
                title="Keluar / Ganti Siswa"
                style={{
                  background: 'rgba(220, 38, 38, 0.16)',
                  border: '1px solid rgba(220, 38, 38, 0.35)',
                  borderRadius: '8px',
                  color: '#F87171',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
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
            background: 'linear-gradient(135deg, rgba(28, 18, 13, 0.92) 0%, rgba(44, 27, 18, 0.94) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(212, 175, 55, 0.45)',
            borderRadius: '14px',
            padding: isMobile ? '6px 12px' : '8px 18px',
            textAlign: 'right',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(254, 240, 138, 0.2), 0 0 14px rgba(212, 175, 55, 0.15)',
          }}>
            <div style={{
              fontSize: isMobile ? '7.5px' : '9px',
              color: '#FDE68A',
              fontWeight: 900,
              letterSpacing: '1.8px',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '4px',
            }}>
              <span>🔍</span>
              <span>Papan Kasus Sekolah</span>
            </div>
            <h1 style={{
              fontFamily: "'Pixelify Sans', 'Outfit', sans-serif",
              fontSize: isMobile ? '15px' : '20px',
              fontWeight: 900,
              color: '#FFFFFF',
              margin: '1px 0 0',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              textShadow: '2px 2px 0 #92400E, 3px 3px 0 #451A03, 0 0 14px rgba(245, 158, 11, 0.4)',
            }}>
              Casecode
            </h1>
          </div>

          {/* Papan Corkboard (Board Frame) wrapping only the cards and thread */}
          <div
            ref={boardRef}
            style={{
              width: isMobile ? '98%' : '96%',
              maxWidth: '1200px',
              height: isMobile ? '390px' : '545px',
              position: 'relative',
              borderRadius: '10px',

              // Beveled wooden frame borders
              border: isMobile ? '8px solid #5a3825' : '14px solid #5a3825',
              outline: '2.5px solid #362014',
              outlineOffset: isMobile ? '-8px' : '-16px',
              boxShadow: 'inset 0 12px 36px rgba(0,0,0,0.65), inset 0 -12px 36px rgba(0,0,0,0.65), 0 16px 36px rgba(0,0,0,0.7)',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              marginTop: isMobile ? '20px' : '28px',
            }}
          >
            {/* SVG Corkboard Texture Fill & Vignette Spotlight Overlay */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
              <rect width="100%" height="100%" fill="url(#corkTexture)" />
              <rect width="100%" height="100%" fill="url(#boardSpotlight)" />
            </svg>

            {/* Top Center Corkboard Label Plaque */}
            <div style={{
              position: 'absolute',
              top: isMobile ? '8px' : '14px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 6,
              background: 'linear-gradient(180deg, #3E2415 0%, #27150B 100%)',
              border: '1.5px solid #B48C50',
              borderRadius: '999px',
              padding: isMobile ? '3px 12px' : '5px 18px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}>
              <span style={{ fontSize: isMobile ? '10px' : '12px' }}>🕵️‍♂️</span>
              <span style={{
                fontSize: isMobile ? '8.5px' : '10.5px',
                fontWeight: 800,
                letterSpacing: '1.8px',
                color: '#FDE68A',
                textTransform: 'uppercase',
              }}>
                Papan Bukti & Kasus Statistika SMP
              </span>
            </div>

            {/* Warm spotlight highlight simulating a yellow desk lamp focused on the top-left */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 15% 15%, rgba(254, 240, 138, 0.28) 0%, rgba(254, 240, 138, 0.08) 35%, rgba(254, 240, 138, 0) 65%)',
              pointerEvents: 'none',
              zIndex: 4,
              mixBlendMode: 'screen',
            }} />

            {/* Red string detective connector layer */}
            {cardPositions.length >= 2 && (
              <svg className="red-string-layer" style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 4,
              }}>
                {cardPositions[0] && cardPositions[1] && cardPositions[0].x > 0 && cardPositions[1].x > 0 && (
                  <>
                    <path
                      d={getSaggingPath(cardPositions[0], cardPositions[1], isMobile ? 22 : 42)}
                      stroke="#DC2626"
                      strokeWidth={isMobile ? "2" : "2.5"}
                      strokeDasharray="none"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.88"
                      style={{ filter: 'drop-shadow(0px 3px 3px rgba(0,0,0,0.45))' }}
                    />
                    <circle cx={cardPositions[0].x} cy={cardPositions[0].y} r="3.5" fill="#7F1D1D" />
                    <circle cx={cardPositions[1].x} cy={cardPositions[1].y} r="3.5" fill="#7F1D1D" />
                  </>
                )}
              </svg>
            )}

            {/* Level Cards Container */}
            <div className="cards-scroll-container" style={{
              width: '100%',
              overflowX: 'auto',
              overflowY: 'hidden',
              padding: isMobile ? '28px 0 16px' : '54px 0 36px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 5,
              flex: 1,
              minHeight: 0,
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: isMobile ? '22px' : '56px',
                padding: isMobile ? '8px 12px' : '12px 32px',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                {LEVELS.map(level => {
                  const isCompleted = completedLevels.includes(level.id)
                  const isUnlocked = !level.locked
                  const isHovered = hoveredCard === level.id
                  const rotation = level.id === 1 ? -2.2 : level.id === 2 ? 1.8 : -1

                  // Custom vertical scattering offset to simulate pinned notes on corkboard
                  const verticalOffset = level.id === 1 ? -16 : level.id === 2 ? 18 : -10;
                  const mobileVerticalOffset = level.id === 1 ? -6 : level.id === 2 ? 8 : -4;
                  const currentOffset = isMobile ? mobileVerticalOffset : verticalOffset;
                  const cardTransform = `translateY(${currentOffset}px)`;
                  const categoryAccent = level.id === 1 ? '#0284C7' : '#D97706';

                  return (
                    <div
                      key={level.id}
                      ref={cardRefs[level.id - 1]}
                      className={`board-level-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                      onClick={() => isUnlocked && handlePlayLevel(level.id)}
                      onMouseEnter={() => isUnlocked && setHoveredCard(level.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        width: isMobile ? '210px' : '284px',
                        height: isMobile ? '305px' : '405px',
                        margin: '0',
                        position: 'relative',
                        transform: isMobile
                          ? cardTransform
                          : `${cardTransform} rotate(${isHovered
                            ? rotation + (level.id % 2 === 0 ? 0.5 : -0.5)
                            : rotation * 0.5
                          }deg) translateY(${isHovered ? -8 : 0}px)`,
                        transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        flexShrink: 0,
                        cursor: isUnlocked ? 'pointer' : 'default',
                      }}
                    >
                      {/* 1. Paper Background with Ripped Edges (Filtered, containing corner brackets) */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: isUnlocked ? '#FFFDF9' : '#F1F5F9',
                        border: '1px solid rgba(140, 98, 57, 0.22)',
                        borderRadius: '6px',
                        boxShadow: isHovered
                          ? '0 16px 32px rgba(0,0,0,0.32)'
                          : '0 8px 18px rgba(0,0,0,0.22)',
                        transition: 'box-shadow 0.3s',
                        filter: 'url(#tornEdge) url(#paperGrain)',
                        zIndex: 1,
                      }}>
                        {/* Viewfinder Corner Brackets */}
                        <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '12px', height: '12px', borderTop: `2.5px solid ${isUnlocked ? '#5C4033' : '#8C7A6B'}`, borderLeft: `2.5px solid ${isUnlocked ? '#5C4033' : '#8C7A6B'}`, borderTopLeftRadius: '3px', pointerEvents: 'none', zIndex: 2 }} />
                        <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '12px', height: '12px', borderTop: `2.5px solid ${isUnlocked ? '#5C4033' : '#8C7A6B'}`, borderRight: `2.5px solid ${isUnlocked ? '#5C4033' : '#8C7A6B'}`, borderTopRightRadius: '3px', pointerEvents: 'none', zIndex: 2 }} />
                        <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '12px', height: '12px', borderBottom: `2.5px solid ${isUnlocked ? '#5C4033' : '#8C7A6B'}`, borderLeft: `2.5px solid ${isUnlocked ? '#5C4033' : '#8C7A6B'}`, borderBottomLeftRadius: '3px', pointerEvents: 'none', zIndex: 2 }} />
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', borderBottom: `2.5px solid ${isUnlocked ? '#5C4033' : '#8C7A6B'}`, borderRight: `2.5px solid ${isUnlocked ? '#5C4033' : '#8C7A6B'}`, borderBottomRightRadius: '3px', pointerEvents: 'none', zIndex: 2 }} />
                      </div>

                      {/* 2. Push-pin on top center */}
                      <div style={{
                        position: 'absolute',
                        top: isMobile ? '-20px' : '-28px',
                        left: '50%',
                        transform: 'translateX(-50%) rotate(12deg)',
                        zIndex: 10,
                        filter: 'drop-shadow(0px 8px 6px rgba(0,0,0,0.3))',
                        pointerEvents: 'none',
                      }}>
                        <svg width={isMobile ? "44" : "54"} height={isMobile ? "50" : "66"} viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <ellipse cx="10" cy="22" rx="4" ry="2" fill="rgba(0,0,0,0.2)" transform="rotate(-15 10 22)" />
                          <path d="M12 14L10 24" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M6 6C6 4.89543 6.89543 4 8 4H16C17.1046 4 18 4.89543 18 6V11C18 11.85 17.3 12.5 16.5 12.8L12.5 14.5L8.5 12.8C7.7 12.5 7 11.8 7 11V6Z" fill={isUnlocked ? '#DC2626' : '#64748B'} />
                          <path d="M9 5H15V6H9V5Z" fill={isUnlocked ? '#EF4444' : '#94A3B8'} />
                          <path d="M12 4C13.1 4 14 3.1 14 2H10C10 3.1 10.9 4 12 4Z" fill={isUnlocked ? '#991B1B' : '#475569'} />
                          <circle cx="10" cy="8" r="1.5" fill="rgba(255,255,255,0.4)" />
                        </svg>
                      </div>

                      {/* 3. Card Content Layer (Renders on top, zIndex: 5) */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        padding: isMobile ? '10px 11px 11px' : '14px 16px 15px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        zIndex: 5,
                      }}>
                        {/* Top Case File Header Bar */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          marginTop: '2px',
                        }}>
                          <span style={{
                            fontSize: isMobile ? '8px' : '9.5px',
                            fontWeight: 900,
                            fontFamily: 'monospace',
                            color: '#FFFFFF',
                            background: isUnlocked ? '#362014' : '#64748B',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            letterSpacing: '0.8px',
                          }}>
                            {level.code}
                          </span>

                          <span style={{
                            fontSize: isMobile ? '8px' : '9.5px',
                            fontWeight: 800,
                            color: isUnlocked ? categoryAccent : '#64748B',
                            background: isUnlocked ? `${categoryAccent}14` : 'rgba(100,116,139,0.1)',
                            border: `1px solid ${isUnlocked ? `${categoryAccent}40` : 'rgba(100,116,139,0.25)'}`,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}>
                            {!isUnlocked ? '🔒 TERKUNCI' : level.category}
                          </span>
                        </div>

                        {/* Photo Viewport (Polaroid Frame) */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          position: 'relative',
                          width: '100%',
                          marginTop: '4px',
                        }}>
                          <div style={{
                            width: '100%',
                            height: isMobile ? '88px' : '126px',
                            borderRadius: '5px',
                            overflow: 'hidden',
                            border: '2px solid #E2D5C1',
                            background: '#0F172A',
                            zIndex: 2,
                            position: 'relative',
                            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.12)',
                          }}>
                            <img
                              src={level.thumbnail}
                              alt={level.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                filter: isUnlocked ? 'contrast(1.04)' : 'grayscale(100%) opacity(0.45)',
                                transition: 'transform 0.35s ease',
                                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                              }}
                            />

                            {/* Subtle dark gradient at bottom of photo for location & mentor badge */}
                            <div style={{
                              position: 'absolute',
                              inset: 'auto 0 0 0',
                              height: '50%',
                              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0) 100%)',
                              pointerEvents: 'none',
                            }} />

                            {/* Location & Mentor Overlay inside Photo */}
                            <div style={{
                              position: 'absolute',
                              bottom: '5px',
                              left: '6px',
                              right: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '4px',
                              pointerEvents: 'none',
                            }}>
                              <span style={{
                                fontSize: isMobile ? '8px' : '9.5px',
                                color: '#F8FAFC',
                                fontWeight: 700,
                                textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}>
                                📍 {level.locationName}
                              </span>
                              <span style={{
                                fontSize: isMobile ? '7.5px' : '9px',
                                color: '#FDE68A',
                                background: 'rgba(15, 23, 42, 0.75)',
                                border: '1px solid rgba(253, 230, 138, 0.35)',
                                borderRadius: '999px',
                                padding: '1px 6px',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                              }}>
                                {level.npcName}
                              </span>
                            </div>

                            {/* Completed Case Stamp */}
                            {isCompleted && (
                              <div style={{
                                position: 'absolute',
                                top: '6px',
                                right: '6px',
                                background: 'rgba(5, 150, 105, 0.92)',
                                border: '1.5px solid #A7F3D0',
                                color: '#FFFFFF',
                                fontSize: isMobile ? '7.5px' : '9px',
                                fontWeight: 900,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                letterSpacing: '0.8px',
                                transform: 'rotate(-4deg)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                                textTransform: 'uppercase',
                              }}>
                                ✓ Terpecahkan
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Polaroid Caption & Brief Mission Summary */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          margin: '2px 0',
                        }}>
                          <h3 style={{
                            fontFamily: 'var(--font-caveat), cursive',
                            fontSize: isMobile ? '17.5px' : '22px',
                            fontWeight: 700,
                            color: isUnlocked ? '#1E293B' : '#64748B',
                            margin: '0 0 3px 0',
                            lineHeight: '1.15',
                            textAlign: 'center',
                          }}>
                            {level.title}
                          </h3>

                          {level.desc && (
                            <p style={{
                              margin: 0,
                              fontSize: isMobile ? '9px' : '11px',
                              color: isUnlocked ? '#475569' : '#94A3B8',
                              fontWeight: 600,
                              lineHeight: 1.35,
                              textAlign: 'center',
                              display: '-webkit-box',
                              WebkitLineClamp: isMobile ? 2 : 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}>
                              {level.desc}
                            </p>
                          )}
                        </div>

                        {/* Case Curriculum Tags */}
                        {isUnlocked && level.tags.length > 0 && (
                          <div style={{
                            display: 'flex',
                            gap: '4px',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            margin: '2px 0',
                          }}>
                            {level.tags.map(tag => (
                              <span
                                key={tag}
                                style={{
                                  fontSize: isMobile ? '8px' : '9.5px',
                                  background: level.id === 1 ? 'rgba(2, 132, 199, 0.08)' : 'rgba(217, 119, 6, 0.08)',
                                  border: `1px solid ${level.id === 1 ? 'rgba(2, 132, 199, 0.3)' : 'rgba(217, 119, 6, 0.3)'}`,
                                  borderRadius: '4px',
                                  padding: '2px 6px',
                                  color: level.id === 1 ? '#0369A1' : '#B45309',
                                  fontWeight: 800,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Star Rating (1 clean container: 3 grey stars when unplayed/unearned, yellow/gold when earned) */}
                        <div
                          data-testid={`level-${level.id}-stars`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: isMobile ? '3px' : '4px',
                            margin: '3px 0',
                            padding: isMobile ? '2px 8px' : '3px 10px',
                            background: (effectiveStars[level.id] || 0) > 0
                              ? 'linear-gradient(135deg, rgba(254, 243, 199, 0.95) 0%, rgba(253, 230, 138, 0.85) 100%)'
                              : 'rgba(0, 0, 0, 0.04)',
                            border: `1px solid ${(effectiveStars[level.id] || 0) > 0 ? 'rgba(217, 119, 6, 0.45)' : 'rgba(0, 0, 0, 0.08)'}`,
                            borderRadius: '20px',
                            boxShadow: (effectiveStars[level.id] || 0) > 0 ? '0 1px 4px rgba(217, 119, 6, 0.15)' : 'none',
                          }}
                        >
                          {[1, 2, 3].map((s) => {
                            const earned = (effectiveStars[level.id] || 0) >= s
                            return (
                              <span
                                key={s}
                                style={{
                                  fontSize: isMobile ? '12px' : '15px',
                                  color: earned ? '#F59E0B' : '#D1D5DB',
                                  filter: earned ? 'drop-shadow(0 1px 2px rgba(245, 158, 11, 0.5))' : 'none',
                                  lineHeight: 1,
                                  transition: 'color 0.2s ease',
                                }}
                              >
                                ★
                              </span>
                            )
                          })}
                        </div>

                        {/* Action Button */}
                        <div style={{ width: '100%', marginTop: '2px' }}>
                          {isUnlocked ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePlayLevel(level.id)
                              }}
                              style={{
                                width: '100%',
                                padding: isMobile ? '7px' : '9px',
                                borderRadius: '5px',
                                border: 'none',
                                background: '#B84A39',
                                color: '#FFFFFF',
                                fontSize: isMobile ? '10px' : '12px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 3px 10px rgba(184, 74, 57, 0.32)',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.filter = 'brightness(1.15)';
                                e.currentTarget.style.background = '#A23E2F';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.filter = 'none';
                                e.currentTarget.style.background = '#B84A39';
                              }}
                            >
                              <span>🔍 Mulai Investigasi</span>
                              <span>→</span>
                            </button>
                          ) : (
                            <div style={{
                              width: '100%',
                              padding: '8px',
                              borderRadius: '5px',
                              background: 'rgba(148, 163, 184, 0.08)',
                              border: '1px solid rgba(148, 163, 184, 0.2)',
                              color: 'rgba(0, 0, 0, 0.35)',
                              fontSize: isMobile ? '10px' : '12px',
                              fontWeight: 700,
                              textAlign: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '3px',
                            }}>
                              <span>🔒 Terkunci</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>


        </div>

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
                    localStorage.removeItem('player')
                    localStorage.removeItem('student')
                    localStorage.removeItem('player_progress')
                    localStorage.removeItem('stat_casecode_level_stars')
                    localStorage.removeItem('ar-cognistats-game')
                    resetPlayerSession()
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

        {/* Greeting Center Modal */}
        {showGreeting && student && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowGreeting(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 300,
              background: 'rgba(7, 19, 30, 0.82)', backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
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
                position: 'relative',
                background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
                border: '2.5px solid #8C6239',
                borderRadius: '24px', padding: '30px 24px',
                width: '100%', maxWidth: '420px',
                maxHeight: 'calc(100vh - 40px)',
                overflowY: 'auto',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), inset 0 0 25px rgba(180, 140, 80, 0.25)',
                color: '#2C1A10',
              }}
            >
              {/* Decorative Viewfinder Brackets */}
              <div style={{ position: 'absolute', top: '10px', left: '10px', width: '14px', height: '14px', borderTop: '3px solid #8C6239', borderLeft: '3px solid #8C6239', borderRadius: '3px 0 0 0' }} />
              <div style={{ position: 'absolute', top: '10px', right: '10px', width: '14px', height: '14px', borderTop: '3px solid #8C6239', borderRight: '3px solid #8C6239', borderRadius: '0 3px 0 0' }} />
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '14px', height: '14px', borderBottom: '3px solid #8C6239', borderLeft: '3px solid #8C6239', borderRadius: '0 0 0 3px' }} />
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '14px', height: '14px', borderBottom: '3px solid #8C6239', borderRight: '3px solid #8C6239', borderRadius: '0 0 3px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#9A3412', fontWeight: 900, letterSpacing: '1.5px', marginBottom: '6px', textTransform: 'uppercase' }}>
                    LAPORAN MASUK
                  </div>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#362014', fontFamily: "'Outfit', sans-serif" }}>
                    👋 Halo, {student.name.split(' ')[0]}!
                  </h3>
                </div>
                <button
                  onClick={handleCloseGreeting}
                  style={{
                    background: 'rgba(140, 98, 57, 0.1)',
                    border: '1px solid rgba(140, 98, 57, 0.3)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    color: '#6B4226',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#362014'
                    e.currentTarget.style.borderColor = '#8C6239'
                    e.currentTarget.style.background = 'rgba(140, 98, 57, 0.2)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#6B4226'
                    e.currentTarget.style.borderColor = 'rgba(140, 98, 57, 0.3)'
                    e.currentTarget.style.background = 'rgba(140, 98, 57, 0.1)'
                  }}
                >✕</button>
              </div>

              <div style={{
                padding: '16px 18px',
                borderRadius: '16px',
                background: '#FFFDF7',
                border: '1.5px solid #B48C50',
                fontSize: '13.5px',
                lineHeight: 1.6,
                color: '#362014',
                fontWeight: 600,
                marginBottom: '20px',
                boxShadow: 'inset 0 2px 5px rgba(140, 98, 57, 0.12), 0 2px 6px rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>📂</span>
                <div>
                  Selamat datang kembali! Mari kita pecahkan kasus investigasi data bersama.
                </div>
              </div>

              <button
                onClick={handleCloseGreeting}
                style={{
                  width: '100%', padding: '14px 20px', borderRadius: '16px', border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                  color: '#FFFFFF',
                  fontSize: '15px', fontWeight: 900, letterSpacing: '1px', cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(14, 131, 136, 0.35)',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'scale(1.02)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'scale(1)' }}
              >
                Mulai Penyelidikan 🕵️‍♂️
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Modal Buku Saku */}
        {showBookletModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 30, 44, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 200,
            padding: '20px',
            overflowY: 'auto',
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
                width: '100%',
                maxWidth: '600px',
                margin: 'auto',
                position: 'relative',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), var(--accent-glow)',
                color: '#F8FAFC',
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
                    color: '#94A3B8',
                    fontSize: '20px',
                    cursor: 'pointer',
                    zIndex: 10,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                >
                  ✕
                </button>

              )}
              <DetektivBooklet onComplete={handleBookletComplete} unlockedLevelIds={unlockedLevelIds} />
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
                border: '1.5px solid rgba(14, 131, 136, 0.3)',
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
                    src="/dira-avatar.webp"
                    alt="DiRA"
                    style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1.5px solid #00ADB5' }}
                  />
                </div>
                <div>
                  <span style={{
                    fontSize: '9px',
                    color: '#00ADB5',
                    fontWeight: 800,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                  }}>
                    ARAHAN TUTOR DiRA
                  </span>
                  <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 900, color: '#F8FAFC' }}>
                    🕵️‍♂️ Persiapan Misi
                  </h3>
                </div>
              </div>

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
                    Halo, <strong>{student?.name.split(' ')[0]}</strong>! Sebelum terjun ke lokasi investigasi, pelajari Buku Saku Detektif terlebih dahulu untuk memperkuat dasar analisismu!
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setShowGatingModal(false)
                      setShowBookletModal(true)
                    }}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'linear-gradient(90deg, #0E8388, #00ADB5)',
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

                  <button
                    onClick={() => {
                      setShowGatingModal(false)
                      if (gatingLevelId) {
                        proceedToGame(gatingLevelId)
                        setGatingLevelId(null)
                      }
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#94A3B8',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    🚀 Langsung Mulai Misi
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Detective Loading Bar Transition Screen */}
        {loadingLevel && (
          <GamePreloader
            title={`MEMBUKA BERKAS ${loadingLevel.code}`}
            subtitle={loadingLevel.title}
            imagesToPreload={loadingLevel.imagesToPreload}
            minDurationMs={1200}
            onComplete={() => {
              router.push(`/siswa/game/level/${loadingLevel.id}?preloaded=true`)
            }}
          />
        )}

        {/* Tentang Game & Kurikulum Modal */}
        <AboutGameModal
          isOpen={showAboutModal}
          onClose={() => setShowAboutModal(false)}
        />

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

        .board-level-card {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .board-level-card.locked {
          opacity: 0.65;
        }

      `}</style>
      </main>
    </OrientationGuard>
  )
}