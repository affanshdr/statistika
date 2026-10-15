'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import OrientationGuard from './_components/OrientationGuard'
import './game.css'

type Student = {
  id: string
  name: string
  nisn: string
  classroom: { name: string }
}

export default function CasecodeTitlePage() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [isStarting, setIsStarting] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem('student')
    if (data) {
      try {
        setStudent(JSON.parse(data) as Student)
      } catch (e) {
        console.error(e)
      }
    }

    // Keyboard shortcut: Press Enter to Play
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handlePlayClick()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handlePlayClick = () => {
    if (isStarting) return
    setIsStarting(true)
    setTimeout(() => {
      router.push('/siswa/game/level/1')
    }, 450)
  }

  const handleLobbyClick = () => {
    router.push('/siswa/game/lobby')
  }

  return (
    <OrientationGuard lockScreen={true}>
      <div
        className="game-root"
        style={{
          minHeight: '100dvh',
          height: '100dvh',
          width: '100vw',
          overflow: 'hidden',
          position: 'relative',
          backgroundImage: "url('/Assets/Building/Splash Screen/Splash Screen.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F8FAFC',
          fontFamily: 'var(--font-ui, sans-serif)',
          userSelect: 'none',
        }}
      >
        {/* Soft Cinematic Vignette Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(8, 20, 36, 0.42) 0%, rgba(8, 20, 36, 0.12) 40%, rgba(8, 20, 36, 0.58) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Scanline CRT Subtle Texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.04) 0px, rgba(0, 0, 0, 0.04) 1px, transparent 1px, transparent 3px)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* ── HEADER HUD ── */}
        <header
          style={{
            position: 'absolute',
            top: '20px',
            left: '24px',
            right: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 30,
          }}
        >
          {/* Dashboard Back Link */}
          <button
            onClick={() => router.push('/siswa')}
            style={{
              background: 'rgba(11, 23, 38, 0.82)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '12px',
              padding: '10px 20px',
              color: '#CBD5E1',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#FFFFFF'
              e.currentTarget.style.borderColor = '#38BDF8'
              e.currentTarget.style.background = 'rgba(14, 131, 136, 0.9)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#CBD5E1'
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)'
              e.currentTarget.style.background = 'rgba(11, 23, 38, 0.82)'
            }}
          >
            ← Kembali ke Dashboard
          </button>

          {/* Student Profile Info */}
          {student && (
            <div
              style={{
                background: 'rgba(11, 23, 38, 0.82)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(56, 189, 248, 0.35)',
                borderRadius: '12px',
                padding: '8px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              }}
            >
              <span style={{ fontSize: '16px' }}>🎒</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#F8FAFC' }}>
                  {student.name}
                </span>
                <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 600 }}>
                  {student.classroom?.name || 'Siswa SMP'}
                </span>
              </div>
            </div>
          )}
        </header>

        {/* ── MAIN TITLE & MENU CONTAINER ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '680px',
            padding: '24px',
            marginTop: '-10px',
          }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(11, 23, 38, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '2px solid #00ADB5',
              borderRadius: '999px',
              padding: '6px 20px',
              marginBottom: '14px',
              boxShadow: '0 4px 16px rgba(0, 173, 181, 0.35)',
            }}
          >
            <span style={{ fontSize: '13px' }}>🏫</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '2.5px',
                color: '#38BDF8',
                textTransform: 'uppercase',
              }}
            >
              SMP NEGERI • GAME EDUKASI STATISTIKA
            </span>
          </motion.div>

          {/* DYNAMIC TITLE: CASECODE (Pixel-Art Styled) */}
          <h1
            style={{
              margin: '0 0 10px 0',
              fontFamily: "'Pixelify Sans', 'Press Start 2P', monospace, sans-serif",
              fontSize: 'clamp(44px, 7vw, 76px)',
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
              margin: '0 0 28px 0',
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

          {/* ── ACTION BUTTONS ── */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              width: '100%',
              maxWidth: '300px',
            }}
          >
            {/* PRIMARY PLAY BUTTON */}
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97, y: 2 }}
              onClick={handlePlayClick}
              disabled={isStarting}
              style={{
                width: '100%',
                padding: '16px 28px',
                fontSize: '20px',
                fontFamily: "'Pixelify Sans', 'Press Start 2P', monospace, sans-serif",
                fontWeight: 700,
                letterSpacing: '2px',
                color: '#FFFFFF',
                background: 'linear-gradient(180deg, #0284C7 0%, #0369A1 50%, #075985 100%)',
                border: '3px solid #38BDF8',
                borderRadius: '14px',
                cursor: 'pointer',
                boxShadow: '0 6px 0 #082F49, 0 14px 28px rgba(0,0,0,0.6)',
                textShadow: '2px 2px 0 #082F49',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'filter 0.2s',
                outline: 'none',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.filter = 'brightness(1.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.filter = 'brightness(1)'
              }}
            >
              <span>▶</span> {isStarting ? 'MEMUAT...' : 'MAIN'}
            </motion.button>

            {/* SECONDARY LOBBY BUTTON */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLobbyClick}
              style={{
                width: '100%',
                padding: '13px 22px',
                fontSize: '14px',
                fontWeight: 800,
                color: '#E2E8F0',
                background: 'rgba(11, 23, 38, 0.85)',
                border: '2px solid rgba(56, 189, 248, 0.45)',
                borderRadius: '12px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(15, 35, 53, 0.95)'
                e.currentTarget.style.borderColor = '#38BDF8'
                e.currentTarget.style.color = '#FFFFFF'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(11, 23, 38, 0.85)'
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.45)'
                e.currentTarget.style.color = '#E2E8F0'
              }}
            >
              🗂️ Pilih Kasus / Level
            </motion.button>
          </div>

          {/* Quick Key Hint */}
          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'rgba(241, 245, 249, 0.8)',
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
            <span>Tekan untuk langsung bermain</span>
          </div>
        </motion.div>

        {/* Bottom Credits / School Life Flavor */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '11px',
            color: 'rgba(226, 232, 240, 0.75)',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            fontWeight: 600,
            zIndex: 10,
          }}
        >
          <span>SMP Negeri Edition</span>
          <span>•</span>
          <span>Kurikulum Merdeka</span>
          <span>•</span>
          <span>Casecode v2.0</span>
        </div>
      </div>
    </OrientationGuard>
  )
}
