'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useMotionValue } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'

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
    icon: '🎬',
    title: 'Kasus: Postingan Viral Screen Time',
    desc: 'Selidiki klaim viral di TikTok menggunakan distribusi frekuensi & histogram.',
    tags: ['Distribusi Frekuensi', 'Histogram', 'Analisis Kritis'],
    locked: false,
    xpMax: 75,
    locationName: 'Sekolah Harapan',
    x: 350,
    y: 320
  },
  {
    id: 2,
    icon: '📈',
    title: 'Kasus: Polling Pilkada',
    desc: 'Segera hadir di lokasi ini.',
    tags: [],
    locked: true,
    xpMax: 0,
    locationName: 'Kantor KPU Kota',
    x: 920,
    y: 240
  },
  {
    id: 3,
    icon: '🌡️',
    title: 'Kasus: Anomali Cuaca',
    desc: 'Segera hadir di stasiun meteorologi.',
    tags: [],
    locked: true,
    xpMax: 0,
    locationName: 'Stasiun Meteorologi BMKG',
    x: 1450,
    y: 460
  },
  {
    id: 4,
    icon: '🏥',
    title: 'Kasus: Data Kesehatan',
    desc: 'Segera hadir di rumah sakit.',
    tags: [],
    locked: true,
    xpMax: 0,
    locationName: 'RSU Sentosa',
    x: 620,
    y: 720
  },
  {
    id: 5,
    icon: '📊',
    title: 'Kasus: Survei Ekonomi',
    desc: 'Segera hadir di pasar pusat.',
    tags: [],
    locked: true,
    xpMax: 0,
    locationName: 'Pusat Pasar',
    x: 1180,
    y: 810
  },
]

export default function SiswaPage() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [showCognitiveModal, setShowCognitiveModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Game state
  const { cognitiveStyle, setCognitiveStyle, startLevel, resetLevel } = useGameStore()
  const [selectedLevel, setSelectedLevel] = useState<typeof LEVELS[0] | null>(null)
  const [zoomScale, setZoomScale] = useState(1.0)
  const [mapTheme, setMapTheme] = useState<'blueprint' | 'satellite'>('blueprint')
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  
  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewportSize, setViewportSize] = useState({ width: 1536, height: 730 })
  const [hasCentered, setHasCentered] = useState(false)
  const mapX = useMotionValue(0)
  const mapY = useMotionValue(0)

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
  }, [router, setCognitiveStyle])

  // Detect mobile & set initial scale-to-fit zoom
  useEffect(() => {
    const checkMobile = () => {
      const isLandscapePhone = window.innerHeight < 500 && window.innerWidth > window.innerHeight
      const mobile = window.innerWidth < 768 || isLandscapePhone
      setIsMobile(mobile)
      if (mobile) {
        const fitScale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080)
        setZoomScale(Math.max(fitScale, 0.18))
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleResize = () => {
      if (viewportRef.current) {
        setViewportSize({
          width: viewportRef.current.clientWidth,
          height: viewportRef.current.clientHeight
        })
      }
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    const t = setTimeout(handleResize, 100)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    if (viewportSize.width > 0 && !hasCentered) {
      mapX.set((viewportSize.width - 1920) / 2)
      mapY.set((viewportSize.height - 1080) / 2)
      setHasCentered(true)
    }
  }, [viewportSize, hasCentered, mapX, mapY])

  useEffect(() => {
    const minX = viewportSize.width - 1920 * zoomScale
    const minY = viewportSize.height - 1080 * zoomScale
    
    if (mapX.get() < minX) mapX.set(minX)
    if (mapX.get() > 0) mapX.set(0)
    
    if (mapY.get() < minY) mapY.set(minY)
    if (mapY.get() > 0) mapY.set(0)
  }, [zoomScale, viewportSize, mapX, mapY])

  if (!student) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0F' }}>
      <p style={{ color: '#fff' }}>Loading...</p>
    </main>
  )

  const handlePlayLevel = (levelId: number) => {
    if (!cognitiveStyle || !student) return
    resetLevel()
    startLevel(levelId, cognitiveStyle)
    router.push(`/siswa/game/level/${levelId}`)
  }

  const isFI = cognitiveStyle === 'FI'

  // Map limits
  const zoomIn = () => setZoomScale(prev => Math.min(prev + 0.2, 1.8))
  const zoomOut = () => setZoomScale(prev => Math.max(prev - 0.2, 0.8))

  return (
    <main style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      background: '#0A0A0F',
      color: '#f3f4f6',
      fontFamily: 'var(--font-sans), sans-serif'
    }}>
      
      {/* Map Viewport Container */}
      <div
        ref={viewportRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: '#0A0A0F',
          cursor: 'grab'
        }}
        onMouseDown={e => { e.currentTarget.style.cursor = 'grabbing' }}
        onMouseUp={e => { e.currentTarget.style.cursor = 'grab' }}
      >
        {/* Draggable Map Canvas */}
        <motion.div
          drag
          dragConstraints={{
            left: viewportSize.width - 1920 * zoomScale,
            right: 0,
            top: viewportSize.height - 1080 * zoomScale,
            bottom: 0
          }}
          dragElastic={0.02}
          dragMomentum={true}
          animate={{ scale: zoomScale }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          style={{
            width: '1920px',
            height: '1080px',
            position: 'absolute',
            left: 0,
            top: 0,
            transformOrigin: 'top left',
            x: mapX,
            y: mapY,
            backgroundImage: mapTheme === 'blueprint'
              ? 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)'
              : 'radial-gradient(circle at 1px 1px, rgba(16,185,129,0.02) 1px, transparent 0)',
            backgroundSize: '24px 24px',
            backgroundPosition: 'center',
            background: mapTheme === 'satellite' ? '#040b15' : undefined
          }}
        >
          {/* SVG Graphics Layer (illustrated city details) */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {/* Neon Blueprint Grid Lines */}
            {mapTheme === 'blueprint' && (
              <>
                <line x1="0" y1="540" x2="1920" y2="540" stroke="rgba(59,130,246,0.05)" strokeWidth="1" />
                <line x1="960" y1="0" x2="960" y2="1080" stroke="rgba(59,130,246,0.05)" strokeWidth="1" />
                <circle cx="960" cy="540" r="300" fill="none" stroke="rgba(59,130,246,0.02)" strokeWidth="1.5" strokeDasharray="5 5" />
                <circle cx="960" cy="540" r="500" fill="none" stroke="rgba(59,130,246,0.015)" strokeWidth="1" />
              </>
            )}

            {/* Glowing River winding through city */}
            <path
              d="M-50,300 C600,150 500,800 1100,650 C1500,550 1700,950 1980,900"
              fill="none"
              stroke={mapTheme === 'satellite' ? 'rgba(6, 95, 120, 0.15)' : 'rgba(33, 150, 243, 0.08)'}
              strokeWidth="70"
              strokeLinecap="round"
            />
            <path
              d="M-50,300 C600,150 500,800 1100,650 C1500,550 1700,950 1980,900"
              fill="none"
              stroke={mapTheme === 'satellite' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(59, 130, 246, 0.15)'}
              strokeWidth="16"
              strokeLinecap="round"
            />

            {/* Main highway network */}
            <path d="M150,0 L150,1080 M1750,0 L1750,1080 M0,400 L1920,400 M0,850 L1920,850" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="8" />
            <path d="M150,0 L150,1080 M1750,0 L1750,1080 M0,400 L1920,400 M0,850 L1920,850" fill="none" stroke="rgba(255,255,255,0.01)" strokeWidth="1" strokeDasharray="6 4" />

            {/* Faint Parks (Translucent green polygons) */}
            <polygon
              points="200,150 500,100 450,300 250,280"
              fill={mapTheme === 'satellite' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)'}
              stroke="rgba(16, 185, 129, 0.12)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <polygon
              points="1100,300 1400,250 1500,500 1300,550"
              fill={mapTheme === 'satellite' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)'}
              stroke="rgba(16, 185, 129, 0.12)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Faint Cybernetic City Sectors Labels */}
            <text x="320" y="220" fill="rgba(255,255,255,0.15)" fontSize="10" fontWeight="800" letterSpacing="2px" fontFamily="monospace">SEKTOR PENDIDIKAN</text>
            <text x="850" y="120" fill="rgba(255,255,255,0.15)" fontSize="10" fontWeight="800" letterSpacing="2px" fontFamily="monospace">DISTRIK PEMERINTAHAN</text>
            <text x="1350" y="300" fill="rgba(255,255,255,0.15)" fontSize="10" fontWeight="800" letterSpacing="2px" fontFamily="monospace">STASIUN UTARA</text>
            <text x="500" y="900" fill="rgba(255,255,255,0.15)" fontSize="10" fontWeight="800" letterSpacing="2px" fontFamily="monospace">KAWASAN RESIDENSIAL</text>
            <text x="1200" y="950" fill="rgba(255,255,255,0.15)" fontSize="10" fontWeight="800" letterSpacing="2px" fontFamily="monospace">ZONA INDUSTRI & PASAR</text>
          </svg>

          {/* Level Pins */}
          {LEVELS.map(level => {
            const isSelected = selectedLevel?.id === level.id
            const isUnlocked = !level.locked

            return (
              <div
                key={level.id}
                onClick={(e) => { e.stopPropagation(); setSelectedLevel(level) }}
                style={{
                  position: 'absolute',
                  left: level.x,
                  top: level.y,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: isSelected ? 30 : 20,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {/* Pulse Circle for Unlocked levels */}
                {isUnlocked && (
                  <div
                    style={{
                      position: 'absolute',
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: isFI ? 'rgba(59,130,246,0.3)' : 'rgba(16,185,129,0.3)',
                      animation: 'ripple 2s infinite',
                      pointerEvents: 'none'
                    }}
                  />
                )}

                {/* Map Pin Container */}
                <motion.div
                  whileHover={{ scale: 1.15, y: -2 }}
                  animate={{
                    scale: isSelected ? 1.2 : 1,
                    boxShadow: isSelected
                      ? `0 0 24px ${isFI ? '#2563eb' : '#10b981'}`
                      : '0 4px 15px rgba(0,0,0,0.5)'
                  }}
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: !isUnlocked
                      ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                      : isFI
                        ? 'linear-gradient(135deg, #3B82F6 0%, #1d4ed8 100%)'
                        : 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                    border: `2px solid ${
                      !isUnlocked
                        ? 'rgba(255,255,255,0.1)'
                        : isFI
                          ? '#93c5fd'
                          : '#a7f3d0'
                    }`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    position: 'relative'
                  }}
                >
                  {isUnlocked ? level.icon : '🔒'}

                  {/* Level number badge */}
                  <span style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    fontSize: '9px',
                    fontWeight: 800,
                    color: '#fff',
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    width: '15px',
                    height: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {level.id}
                  </span>
                </motion.div>

                {/* Location Name Label */}
                <span style={{
                  background: 'rgba(7, 12, 27, 0.85)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '9px',
                  fontWeight: 700,
                  color: isUnlocked ? '#fff' : 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                }}>
                  {level.locationName}
                </span>
              </div>
            )
          })}
        </motion.div>

        {/* Floating Brand and Profile Card (Top Left) */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: isMobile ? '50%' : '320px',
          maxWidth: isMobile ? '50%' : '320px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{
            background: 'rgba(12, 12, 20, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 136, 0.15)',
            borderRadius: isMobile ? '14px' : '20px',
            padding: isMobile ? '10px 14px' : '16px 20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(0, 255, 136, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '8px' : '12px'
          }}>
            {/* Profile details */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: 0, flex: 1 }}>
                <div style={{
                  width: isMobile ? '34px' : '42px', height: isMobile ? '34px' : '42px', borderRadius: '50%', flexShrink: 0,
                  background: isFI
                    ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                    : 'linear-gradient(135deg, #06b6d4 0%, #00FF88 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isMobile ? '13px' : '16px', fontWeight: 800, color: '#fff',
                  boxShadow: isFI ? '0 0 12px rgba(59,130,246,0.4)' : '0 0 12px rgba(0,255,136,0.3)'
                }}>
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {!isMobile && (
                    <span style={{ display: 'block', fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '1px' }}>
                      DETEKTIF AKTIF
                    </span>
                  )}
                  <h2 style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: 800, margin: '1px 0', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {student.name}
                  </h2>
                  {!isMobile && (
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                      Kelas: <strong style={{ color: '#fff' }}>{student.classroom?.name}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Cognitive Style Badge — Clickable */}
            {student.geftResult?.cognitiveStyle && (
              <button
                onClick={() => setShowCognitiveModal(true)}
                title="Klik untuk lihat detail gaya belajar"
                style={{
                  padding: isMobile ? '5px 10px' : '7px 12px', borderRadius: '8px',
                  background: isFI ? 'rgba(59,130,246,0.12)' : 'rgba(6,182,212,0.12)',
                  border: `1px solid ${isFI ? 'rgba(59,130,246,0.25)' : 'rgba(6,182,212,0.25)'}`,
                  fontSize: isMobile ? '10px' : '11px', color: isFI ? '#93c5fd' : '#a7f3d0',
                  fontWeight: 700, cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'all 0.2s', minHeight: '36px',
                  touchAction: 'manipulation',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.2)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
              >
                <span>{isFI ? '🧠 FI' : '👥 FD'} — {student.geftResult.cognitiveStyle === 'FI' ? 'Field Independent' : 'Field Dependent'}</span>
                <span style={{ fontSize: '9px', opacity: 0.6 }}>Tap ℹ️</span>
              </button>
            )}
          </div>

          {/* Greeting card — desktop only */}
          {!isMobile && student.diagnosticLevel && student.geftResult?.cognitiveStyle && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(10, 15, 30, 0.65)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '14px 16px',
                fontSize: '12px',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              <span style={{ color: '#fff', fontWeight: 700 }}>Halo, {student.name.split(' ')[0]}! 👋</span>{' '}
              {student.diagnosticLevel === 'tinggi'
                ? 'Kemampuan statistikamu sudah mantap! Langsung terjun ke investigasi kasus yang menantang.'
                : student.diagnosticLevel === 'sedang'
                ? 'Dasar statistikamu sudah oke. Siap perkuat dengan investigasi data nyata!'
                : 'Tenang, kita mulai dari dasar bareng-bareng. Setiap detektif besar dimulai dari sini!'
              }
            </motion.div>
          )}
        </div>

        {/* Floating Map Theme Controls — Desktop only (Top Left Center) */}
        {!isMobile && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '360px',
          zIndex: 100,
          display: 'flex',
          gap: '8px',
          background: 'rgba(10, 15, 30, 0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '6px'
        }}>
          <button
            onClick={() => setMapTheme('blueprint')}
            style={{
              padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
              border: 'none',
              background: mapTheme === 'blueprint' ? 'rgba(59,130,246,0.2)' : 'transparent',
              color: mapTheme === 'blueprint' ? '#60a5fa' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Blueprint 📐
          </button>
          <button
            onClick={() => setMapTheme('satellite')}
            style={{
              padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
              border: 'none',
              background: mapTheme === 'satellite' ? 'rgba(16,185,129,0.2)' : 'transparent',
              color: mapTheme === 'satellite' ? '#34d399' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Satelit 🛰️
          </button>
        </div>
        )}

        {/* Floating Keluar Sesi Button (Top Right) */}
        <button
          onClick={() => setShowExitConfirm(true)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            background: 'rgba(239, 68, 68, 0.05)',
            backdropFilter: 'blur(10px)',
            color: '#ff6b6b',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            cursor: 'pointer',
            zIndex: 110,
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(239, 68, 68, 0.25)'
            e.currentTarget.style.color = '#ff4d4d'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.1)'
            e.currentTarget.style.color = '#ff6b6b'
          }}
        >
          Keluar
        </button>

        {/* Floating Case Details Panel — Desktop: Right Side / Mobile: Bottom Sheet */}
        {selectedLevel && (
          <div style={{
            position: 'fixed',
            ...(isMobile ? {
              bottom: 0,
              left: 0,
              right: 0,
              top: 'auto',
              width: '100%',
              maxHeight: '78vh',
              borderRadius: '24px 24px 0 0',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.7)',
            } : {
              top: '74px',
              right: '20px',
              width: '340px',
              maxHeight: 'calc(100vh - 94px)',
              borderRadius: '20px',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
            }),
            background: 'rgba(10, 15, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: isMobile ? '20px 20px 32px' : '20px',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            color: '#fff',
            overflowY: 'auto'
          }}>
            {/* Close Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 800, letterSpacing: '1px' }}>
                LEVEL {selectedLevel.id}
              </div>
              <button
                onClick={() => setSelectedLevel(null)}
                style={{
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                  fontSize: '18px', cursor: 'pointer', transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >
                ✕
              </button>
            </div>

            {/* Thumbnail / Header */}
            <div style={{
              display: 'flex', gap: '12px', alignItems: 'center',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', padding: '12px'
            }}>
              <div style={{ fontSize: '32px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                {selectedLevel.icon}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>{selectedLevel.locationName}</h4>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Tempat Kejadian Perkara</span>
              </div>
            </div>

            {/* Content details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>{selectedLevel.title}</h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                {selectedLevel.desc}
              </p>
            </div>

            {selectedLevel.locked ? (
              <div style={{
                padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.15)', color: '#f87171',
                fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                🔒 Kasus ini masih terkunci. Selesaikan level sebelumnya terlebih dahulu.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Hadiah Kasus:</span>
                  <strong style={{ color: '#60a5fa' }}>{selectedLevel.xpMax} XP</strong>
                </div>
                
                {selectedLevel.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    {selectedLevel.tags.map(tag => (
                      <span key={tag} style={{ fontSize: '9px', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => handlePlayLevel(selectedLevel.id)}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                    background: isFI ? '#2563eb' : '#10b981',
                    color: '#fff', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                    boxShadow: isFI ? '0 4px 15px rgba(37,99,235,0.3)' : '0 4px 15px rgba(16,185,129,0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                >
                  {isFI ? '🧠 Mulai Investigasi (FI Path)' : '👥 Mulai Investigasi (FD Path)'} →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Floating Map Zoom Controls — Desktop only (Bottom Right) */}
        {!isMobile && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 100
        }}>
          <button
            onClick={zoomIn}
            title="Perbesar"
            style={{
              width: '36px', height: '36px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', color: '#fff',
              fontSize: '18px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(15,23,42,0.85)'}
          >
            ＋
          </button>
          <button
            onClick={zoomOut}
            title="Perkecil"
            style={{
              width: '36px', height: '36px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', color: '#fff',
              fontSize: '18px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(15,23,42,0.85)'}
          >
            －
          </button>
        </div>
        )}

        {/* Mobile Bottom Control Bar */}
        {isMobile && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 150,
            background: 'rgba(7, 12, 27, 0.92)',
            backdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '10px 16px 16px',
            display: selectedLevel ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}>
            {/* Theme switcher */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px' }}>
              <button
                onClick={() => setMapTheme('blueprint')}
                style={{
                  padding: '6px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 700,
                  border: 'none', minHeight: '36px', touchAction: 'manipulation',
                  background: mapTheme === 'blueprint' ? 'rgba(59,130,246,0.25)' : 'transparent',
                  color: mapTheme === 'blueprint' ? '#60a5fa' : 'rgba(255,255,255,0.45)',
                  cursor: 'pointer',
                }}
              >📐</button>
              <button
                onClick={() => setMapTheme('satellite')}
                style={{
                  padding: '6px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 700,
                  border: 'none', minHeight: '36px', touchAction: 'manipulation',
                  background: mapTheme === 'satellite' ? 'rgba(16,185,129,0.25)' : 'transparent',
                  color: mapTheme === 'satellite' ? '#34d399' : 'rgba(255,255,255,0.45)',
                  cursor: 'pointer',
                }}
              >🛰️</button>
            </div>

            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>DRAG TO EXPLORE</span>

            {/* Zoom controls */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={zoomIn}
                style={{
                  width: '38px', height: '38px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(15,23,42,0.85)', color: '#fff',
                  fontSize: '18px', fontWeight: 700, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation',
                }}
              >+</button>
              <button
                onClick={zoomOut}
                style={{
                  width: '38px', height: '38px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(15,23,42,0.85)', color: '#fff',
                  fontSize: '18px', fontWeight: 700, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation',
                }}
              >−</button>
            </div>
          </div>
        )}

        {/* Blueprint / Satellite legend label (Bottom Left) — Desktop only */}
        {!isMobile && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(7, 12, 27, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          padding: '4px 10px',
          fontSize: '9px',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.4)',
          fontFamily: 'monospace',
          pointerEvents: 'none',
          letterSpacing: '1px',
          zIndex: 100
        }}>
          MAP: DIGITAL_TRUTH_METROPOLIS [DRAG TO PAN]
        </div>
        )}
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
            style={{
              background: 'rgba(10, 15, 30, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '28px',
              width: '380px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
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
              style={{
                background: 'rgba(10,15,30,0.95)',
                border: `1px solid ${info.border}`,
                borderRadius: '24px', padding: '32px 28px',
                width: '100%', maxWidth: '440px',
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

      {/* Ripple Animation and Responsive styles */}
      <style>{`
        @keyframes ripple {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
            box-shadow: 0 0 0 0 rgba(37,99,235, 0.4);
          }
          70% {
            transform: scale(1.6);
            opacity: 0.3;
            box-shadow: 0 0 0 10px rgba(37,99,235, 0);
          }
          100% {
            transform: scale(2.0);
            opacity: 0;
            box-shadow: 0 0 0 0 rgba(37,99,235, 0);
          }
        }
        /* Bottom sheet backdrop for mobile */
        @media (max-width: 767px) {
          .map-bottom-sheet-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 199;
          }
        }
      `}</style>
    </main>
  )
}