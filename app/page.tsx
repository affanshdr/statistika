'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import OrientationGuard from './siswa/game/_components/OrientationGuard'
import AboutGameModal from '@/components/AboutGameModal'
import { gameAudio } from '@/lib/utils/gameAudio'
import './siswa/game/game.css'

type Student = {
  id: string
  name: string
  nisn: string
  classroom: { name: string }
}

export default function RootHomePage() {
  const router = useRouter()
  const [studentName, setStudentName] = useState('')
  const [isStarting, setIsStarting] = useState(false)
  const [isNameModalOpen, setIsNameModalOpen] = useState(false)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [loadStatus, setLoadStatus] = useState('Menginisialisasi Sistem...')
  const [initialLoadingProgress, setInitialLoadingProgress] = useState(0)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(() => gameAudio.getMuted())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const unsub = gameAudio.subscribeMute(setIsMuted)
    gameAudio.playBGM('menu')
    return () => unsub()
  }, [])

  useEffect(() => {
    // Check if student data exists in localStorage
    const data = localStorage.getItem('student')
    if (data) {
      try {
        const parsed = JSON.parse(data) as Student
        if (parsed?.name && parsed.name !== 'Detektif') {
          setStudentName(parsed.name)
        }
      } catch (e) {
        console.error(e)
      }
    }

    // Prefetch routes in background to avoid navigation delay
    router.prefetch('/siswa')
    router.prefetch('/siswa/game/level/1')

    // Initial asset preloading for splash screen background and icons
    const splashBg = new Image()
    splashBg.src = '/Assets/Building/Splash Screen/Splash Screen.webp'

    const startTime = performance.now()
    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime
      const pct = Math.min(100, Math.floor((elapsed / 500) * 100))
      setInitialLoadingProgress(pct)
      if (pct >= 100) {
        clearInterval(interval)
        setTimeout(() => setIsInitialLoading(false), 150)
      }
    }, 20)

    return () => clearInterval(interval)
  }, [router])

  useEffect(() => {
    if (isNameModalOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isNameModalOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isNameModalOpen && !isStarting) {
        gameAudio.playClick()
        setIsNameModalOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isNameModalOpen, isStarting])

  const handleOpenPlayModal = () => {
    gameAudio.playClick()
    setIsNameModalOpen(true)
  }

  const handleStartGame = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const finalName = studentName.trim()
    if (!finalName) return
    gameAudio.playUnlockJingle()
    setIsStarting(true)
    setLoadProgress(0)
    setLoadStatus('Menginisialisasi Profil Siswa...')

    let studentData: Student = {
      id: 'siswa-guest',
      name: finalName,
      nisn: '-',
      classroom: { name: 'Kelas VII-A' }
    }

    // Preload dashboard, classroom background & character assets so /siswa and game load instantly without delay
    const assetsToPreload = [
      '/backgr.webp',
      '/Assets/Building/Kelas.webp',
      '/Assets/Building/field/lapangan_saja.png',
      '/avatarbaru.webp',
      '/dira-avatar.webp',
      '/teen_silhouette.png',
      '/Assets/Character/Stevunt-idle.png',
      '/Assets/Character/Stevunt-iso_walk_down.png',
      '/Assets/Character/Stevunt-iso_walk_right.png',
      '/Assets/Character/Stevunt-iso_walk_up-trimmed.png',
      '/Assets/Character/Pak Sutrisno.webp',
      '/Assets/Character/pak Sutrisno-iso_idle_right-trimmed.png',
      '/Assets/Building/Ruang VII-B/Pak Bambang.png',
      '/Assets/Building/Ruang VII-B/VII-B.png',
      '/Assets/Building/Ruang VII-A/Bu Sari.png',
      '/Assets/Building/Ruang VII-A/VII-A.webp'
    ]

    let loadedCount = 0
    assetsToPreload.forEach(src => {
      const img = new Image()
      img.onload = img.onerror = () => {
        loadedCount++
      }
      img.src = src
    })

    // Perform database sync in parallel
    const dbPromise = (async () => {
      try {
        const classRes = await fetch('/api/classrooms')
        if (classRes.ok) {
          const classrooms = await classRes.json()
          const defaultClass = classrooms[0]
          if (defaultClass?.id) {
            const studentRes = await fetch('/api/students', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: finalName, classroomId: defaultClass.id }),
            })
            if (studentRes.ok) {
              const dbStudent = await studentRes.json()
              if (dbStudent?.id) {
                studentData = dbStudent
              }
            }
          }
        }
      } catch (err) {
        console.warn('DB Sync fallback to local guest session:', err)
      }
    })()

    // Smooth progress bar animation over minDuration (e.g. 1200ms)
    const startTime = performance.now()
    const minDuration = 1200

    const progressInterval = setInterval(() => {
      const elapsed = performance.now() - startTime
      const timePercent = Math.min(100, Math.floor((elapsed / minDuration) * 100))
      const assetPercent = Math.floor((loadedCount / assetsToPreload.length) * 100)
      const combinedPercent = Math.min(100, Math.max(timePercent, Math.floor((timePercent + assetPercent) / 2)))

      setLoadProgress(combinedPercent)

      if (combinedPercent < 25) {
        setLoadStatus('Menginisialisasi Profil Siswa...')
      } else if (combinedPercent < 50) {
        setLoadStatus('Menghubungkan Server & Data Kelas...')
      } else if (combinedPercent < 80) {
        setLoadStatus('Memuat Pak Bambang, Stevunt & Karakter 2D...')
      } else if (combinedPercent < 95) {
        setLoadStatus('Memuat Ruang Kelas & Papan Tantangan...')
      } else {
        setLoadStatus('Menyiapkan Arena Petualangan Sekolah...')
      }

      if (elapsed >= minDuration && combinedPercent >= 100) {
        clearInterval(progressInterval)
        dbPromise.finally(() => {
          localStorage.setItem('student', JSON.stringify(studentData))
          router.push('/siswa')
        })
      }
    }, 25)
  }

  return (
    <OrientationGuard lockScreen={true}>
      <main
        style={{
          minHeight: '100dvh',
          height: '100dvh',
          width: '100vw',
          overflow: 'hidden',
          position: 'relative',
          backgroundImage: 'url("/Assets/Building/Splash Screen/Splash Screen.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: '0',
          color: '#F8FAFC',
          fontFamily: "'Outfit', 'Inter', sans-serif",
          userSelect: 'none',
        }}
      >
        {/* Top Slim Loading Bar during Initial Page Load */}
        <AnimatePresence>
          {isInitialLoading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'rgba(7, 19, 30, 0.6)',
                zIndex: 200,
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${initialLoadingProgress}%`,
                  background: 'linear-gradient(90deg, #00ADB5 0%, #38BDF8 50%, #34D399 100%)',
                  boxShadow: '0 0 10px rgba(0, 173, 181, 0.8)',
                  transition: 'width 0.1s linear',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dark Ambient Vignette Overlay - Protects eyes from glare & enhances button contrast */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, rgba(7, 19, 30, 0.12) 0%, rgba(7, 19, 30, 0.42) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Floating Audio Toggle Button (Top-Right) */}
        <button
          onClick={() => gameAudio.toggleMute()}
          title={isMuted ? 'Nyalakan Musik & Suara' : 'Matikan Musik & Suara'}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 30,
            background: isMuted ? 'rgba(239, 68, 68, 0.22)' : 'rgba(11, 23, 38, 0.85)',
            backdropFilter: 'blur(8px)',
            border: `2px solid ${isMuted ? '#EF4444' : '#00ADB5'}`,
            borderRadius: '999px',
            color: isMuted ? '#FCA5A5' : '#38BDF8',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
            transition: 'all 0.2s',
          }}
        >
          <span>{isMuted ? '🔇' : '🔊'}</span>
          <span style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
            {isMuted ? 'Suara Mati' : 'Backsound'}
          </span>
        </button>

        {/* ── MAIN TITLE & PLAY BUTTON CONTAINER ── */}
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '680px',
            padding: '24px 16px',
            marginTop: '-20px',
          }}
        >
          {/* DYNAMIC PIXEL TITLE: CASECODE */}
          <h1
            style={{
              margin: '0 0 10px 0',
              fontFamily: "'Pixelify Sans', 'Press Start 2P', monospace, sans-serif",
              fontSize: 'clamp(46px, 7.5vw, 80px)',
              fontWeight: 700,
              letterSpacing: '3px',
              color: '#FFFFFF',
              textShadow: `
                3px 3px 0 #0284C7,
                6px 6px 0 #034870,
                9px 9px 0 #071E33,
                0 0 35px rgba(56, 189, 248, 0.65)
              `,
              lineHeight: 1.05,
              textTransform: 'uppercase',
            }}
          >
            Casecode
          </h1>

          {/* Subtitle / Tagline */}
          <p
            style={{
              margin: '0 0 26px 0',
              fontSize: 'clamp(14px, 2.2vw, 17px)',
              color: '#F1F5F9',
              fontWeight: 600,
              maxWidth: '520px',
              lineHeight: 1.5,
              textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.7)',
            }}
          >
            Petualangan Siswa SMP Memecahkan Masalah Data & Fakta di Sekolah!
          </p>

          {/* Play Button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95, y: 2 }}
            onClick={handleOpenPlayModal}
            style={{
              width: '100%',
              maxWidth: '280px',
              padding: '16px 36px',
              fontSize: '22px',
              fontFamily: "'Pixelify Sans', 'Press Start 2P', monospace, sans-serif",
              fontWeight: 700,
              letterSpacing: '3px',
              color: '#FFFFFF',
              background: 'linear-gradient(180deg, #0284C7 0%, #0369A1 50%, #075985 100%)',
              border: '3px solid #38BDF8',
              borderRadius: '16px',
              cursor: 'pointer',
              boxShadow: '0 6px 0 #082F49, 0 14px 28px rgba(0,0,0,0.6)',
              textShadow: '2px 2px 0 #082F49',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'filter 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.filter = 'brightness(1.15)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.filter = 'brightness(1)'
            }}
          >
            <span style={{ fontSize: '20px' }}>▶</span> MAIN
          </motion.button>

          {/* About / Tentang Button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95, y: 2 }}
            onClick={() => setIsAboutModalOpen(true)}
            style={{
              marginTop: '12px',
              width: '100%',
              maxWidth: '280px',
              padding: '16px 36px',
              fontSize: '22px',
              fontFamily: "'Pixelify Sans', 'Press Start 2P', monospace, sans-serif",
              fontWeight: 700,
              letterSpacing: '3px',
              color: '#FFFFFF',
              background: 'linear-gradient(180deg, #0284C7 0%, #0369A1 50%, #075985 100%)',
              border: '3px solid #38BDF8',
              borderRadius: '16px',
              cursor: 'pointer',
              boxShadow: '0 6px 0 #082F49, 0 14px 28px rgba(0,0,0,0.6)',
              textShadow: '2px 2px 0 #082F49',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'filter 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.filter = 'brightness(1.15)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.filter = 'brightness(1)'
            }}
          >
            TENTANG
          </motion.button>

          {/* Quick Key Hint */}
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'rgba(241, 245, 249, 0.85)',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              fontWeight: 600,
            }}
          >
            <kbd
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: 700,
                color: '#38BDF8',
              }}
            >
              ENTER
            </kbd>
            <span>Tekan untuk mulai bermain</span>
          </div>
        </motion.div>

        {/* ── POPUP MODAL (WARM DETECTIVE CREAM / CORKBOARD PAPER THEME) ── */}
        <AnimatePresence>
          {isNameModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isStarting && setIsNameModalOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                background: 'rgba(7, 19, 30, 0.82)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '390px',
                  background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
                  border: '2.5px solid #8C6239',
                  borderRadius: '24px',
                  padding: '30px 24px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), inset 0 0 25px rgba(180, 140, 80, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                {/* Decorative Viewfinder Brackets */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', width: '14px', height: '14px', borderTop: '3px solid #8C6239', borderLeft: '3px solid #8C6239', borderRadius: '3px 0 0 0' }} />
                <div style={{ position: 'absolute', top: '10px', right: '10px', width: '14px', height: '14px', borderTop: '3px solid #8C6239', borderRight: '3px solid #8C6239', borderRadius: '0 3px 0 0' }} />
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '14px', height: '14px', borderBottom: '3px solid #8C6239', borderLeft: '3px solid #8C6239', borderRadius: '0 0 0 3px' }} />
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '14px', height: '14px', borderBottom: '3px solid #8C6239', borderRight: '3px solid #8C6239', borderRadius: '0 0 3px 0' }} />

                {/* Close Button */}
                <button
                  onClick={() => setIsNameModalOpen(false)}
                  disabled={isStarting}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(140, 98, 57, 0.1)',
                    border: '1px solid rgba(140, 98, 57, 0.3)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    color: '#6B4226',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: isStarting ? 'not-allowed' : 'pointer',
                    opacity: isStarting ? 0.4 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    zIndex: 10,
                  }}
                  onMouseEnter={e => {
                    if (!isStarting) {
                      e.currentTarget.style.color = '#362014'
                      e.currentTarget.style.borderColor = '#8C6239'
                      e.currentTarget.style.background = 'rgba(140, 98, 57, 0.2)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isStarting) {
                      e.currentTarget.style.color = '#6B4226'
                      e.currentTarget.style.borderColor = 'rgba(140, 98, 57, 0.3)'
                      e.currentTarget.style.background = 'rgba(140, 98, 57, 0.1)'
                    }
                  }}
                >
                  ✕
                </button>

                {/* Title & Description */}
                <h3
                  style={{
                    margin: '0 0 6px 0',
                    fontSize: '22px',
                    fontWeight: 900,
                    letterSpacing: '0.5px',
                    color: '#362014',
                    textAlign: 'center',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  Identitas Siswa
                </h3>
                <p
                  style={{
                    margin: '0 0 22px 0',
                    fontSize: '13px',
                    color: '#524336',
                    textAlign: 'center',
                    lineHeight: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Masukkan nama panggilanmu untuk memulai petualangan statistika di sekolah.
                </p>

                {/* Form Input */}
                <form onSubmit={handleStartGame} style={{ width: '100%' }}>
                  <div style={{ marginBottom: '22px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 900,
                        color: '#9A3412',
                        letterSpacing: '1.5px',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                      }}
                    >
                      NAMA LENGKAP / PANGGILAN
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Contoh: Stevunt"
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      disabled={isStarting}
                      required
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '14px 18px',
                        borderRadius: '16px',
                        background: '#FFFDF7',
                        border: '2px solid #B48C50',
                        color: '#2C1A10',
                        fontSize: '15px',
                        textAlign: 'center',
                        outline: 'none',
                        fontWeight: 800,
                        transition: 'all 0.2s',
                        boxShadow: 'inset 0 2px 5px rgba(140, 98, 57, 0.15), 0 2px 6px rgba(0,0,0,0.04)',
                        opacity: isStarting ? 0.7 : 1,
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = '#0E8388'
                        e.currentTarget.style.boxShadow = '0 0 16px rgba(14, 131, 136, 0.35)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = '#B48C50'
                        e.currentTarget.style.boxShadow = 'inset 0 2px 5px rgba(140, 98, 57, 0.15), 0 2px 6px rgba(0,0,0,0.04)'
                      }}
                    />
                  </div>

                  {/* Confirm & Loading Bar Section */}
                  {isStarting ? (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', fontWeight: 800 }}>
                        <span style={{ color: '#8C6239', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                          {loadStatus}
                        </span>
                        <span style={{ color: '#0E8388', fontFamily: 'monospace', fontWeight: 900, fontSize: '13px' }}>
                          {loadProgress}%
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '16px',
                        background: 'rgba(54, 32, 20, 0.12)',
                        border: '2px solid #B48C50',
                        borderRadius: '10px',
                        padding: '2px',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.2)'
                      }}>
                        <motion.div
                          style={{
                            height: '100%',
                            borderRadius: '6px',
                            background: 'linear-gradient(90deg, #0E8388 0%, #00ADB5 50%, #38BDF8 100%)',
                            boxShadow: '0 0 12px rgba(14, 131, 136, 0.7)',
                            width: `${loadProgress}%`
                          }}
                          transition={{ ease: 'easeOut', duration: 0.05 }}
                        />
                      </div>
                    </div>

                  ) : (
                    <motion.button
                      whileHover={studentName.trim() ? { scale: 1.02, boxShadow: '0 8px 25px rgba(14, 131, 136, 0.45)' } : {}}
                      whileTap={studentName.trim() ? { scale: 0.97 } : {}}
                      type="submit"
                      disabled={!studentName.trim()}
                      style={{
                        width: '100%',
                        padding: '15px 24px',
                        fontSize: '16px',
                        fontWeight: 900,
                        letterSpacing: '2px',
                        color: '#FFFFFF',
                        background: studentName.trim()
                          ? 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)'
                          : 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
                        border: '1.5px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: '16px',
                        cursor: !studentName.trim() ? 'not-allowed' : 'pointer',
                        opacity: !studentName.trim() ? 0.7 : 1,
                        boxShadow: studentName.trim() ? '0 6px 20px rgba(14, 131, 136, 0.35)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                      }}
                    >
                      MULAI PETUALANGAN ▶
                    </motion.button>
                  )}
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ABOUT GAME & CURRICULUM MODAL ── */}
        <AboutGameModal
          isOpen={isAboutModalOpen}
          onClose={() => setIsAboutModalOpen(false)}
        />
      </main>
    </OrientationGuard>
  )
}