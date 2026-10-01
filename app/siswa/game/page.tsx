'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import OrientationGuard from './_components/OrientationGuard'
import './game.css'

type Student = {
  id: string
  name: string
  nisn: string
  classroom: { name: string }
}

export default function NumeriaTitlePage() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [frame, setFrame] = useState(0)
  const [isStarting, setIsStarting] = useState(false)

  // Floating math symbols for background
  const bgSymbols = [
    { symbol: '📊', left: '10%', top: '20%', size: '32px', duration: 6 },
    { symbol: '∑</symbol', left: '82%', top: '15%', size: '28px', duration: 7 },
    { symbol: 'x̄', left: '15%', top: '70%', size: '36px', duration: 8 },
    { symbol: 'fᵢ', left: '75%', top: '65%', size: '30px', duration: 5 },
    { symbol: '%', left: '88%', top: '40%', size: '26px', duration: 9 },
    { symbol: 'σ', left: '8%', top: '45%', size: '30px', duration: 7.5 },
    { symbol: '📈', left: '68%', top: '80%', size: '34px', duration: 6.5 },
    { symbol: '🔍', left: '25%', top: '82%', size: '32px', duration: 8.5 },
  ]

  useEffect(() => {
    const data = localStorage.getItem('student')
    if (data) {
      try {
        setStudent(JSON.parse(data) as Student)
      } catch (e) {
        console.error(e)
      }
    }

    // Animate sprite frame cycle for Stevunt idle
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % 25)
    }, 120)

    return () => clearInterval(interval)
  }, [])

  const handlePlayClick = () => {
    setIsStarting(true)
    setTimeout(() => {
      // Direct transition to Level 1 or Lobby
      router.push('/siswa/game/level/1')
    }, 600)
  }

  const handleLobbyClick = () => {
    router.push('/siswa/game/lobby')
  }

  // Sprite animation calculations (5x5 grid)
  const col = frame % 5
  const row = Math.floor(frame / 5)
  const bgX = col * 25
  const bgY = row * 25

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
          background: 'radial-gradient(circle at 50% 40%, #0F2A3F 0%, #07131E 60%, #03080D 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F8FAFC',
          fontFamily: 'var(--font-ui, sans-serif)',
        }}
      >
        {/* Animated Cyber Grid Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(0, 173, 181, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 173, 181, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        {/* Ambient Glowing Orbs */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '30%',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 173, 181, 0.25) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '25%',
            width: '360px',
            height: '360px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        {/* Floating Math & Detective Background Icons */}
        {bgSymbols.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ y: 0, opacity: 0.2 }}
            animate={{ y: [-10, 10, -10], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: item.duration, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              left: item.left,
              top: item.top,
              fontSize: item.size,
              color: 'rgba(0, 173, 181, 0.4)',
              fontWeight: 800,
              userSelect: 'none',
              pointerEvents: 'none',
              textShadow: '0 0 12px rgba(0, 173, 181, 0.5)',
            }}
          >
            {item.symbol}
          </motion.div>
        ))}

        {/* Header HUD / Student Profile Info */}
        <header
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
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
              background: 'rgba(15, 35, 53, 0.75)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0, 173, 181, 0.3)',
              borderRadius: '50px',
              padding: '8px 18px',
              color: '#94A3B8',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#FFFFFF'
              e.currentTarget.style.borderColor = '#00ADB5'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#94A3B8'
              e.currentTarget.style.borderColor = 'rgba(0, 173, 181, 0.3)'
            }}
          >
            ← Kembali ke Dashboard
          </button>

          {/* Student Tag */}
          {student && (
            <div
              style={{
                background: 'rgba(15, 35, 53, 0.75)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0, 173, 181, 0.3)',
                borderRadius: '50px',
                padding: '6px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '14px' }}>🕵️</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#F8FAFC' }}>
                {student.name}
              </span>
            </div>
          )}
        </header>

        {/* ── MAIN TITLE CONTENT CONTAINER ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '600px',
            padding: '20px',
          }}
        >
          {/* Subtitle Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0, 173, 181, 0.12)',
              border: '1px solid rgba(0, 173, 181, 0.4)',
              borderRadius: '50px',
              padding: '6px 18px',
              marginBottom: '16px',
              boxShadow: '0 0 20px rgba(0, 173, 181, 0.2)',
            }}
          >
            <span style={{ fontSize: '14px' }}>🔍</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '2.5px',
                color: '#00ADB5',
                textTransform: 'uppercase',
              }}
            >
              Game Investigasi Statistik
            </span>
          </motion.div>

          {/* MAIN GAME TITLE: NUMERIA */}
          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: 'clamp(52px, 8vw, 84px)',
              fontWeight: 900,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #7DD3FC 45%, #00ADB5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 35px rgba(0, 173, 181, 0.6)) drop-shadow(0 6px 10px rgba(0,0,0,0.8))',
              lineHeight: 1,
              position: 'relative',
            }}
          >
            NUMERIA
          </h1>

          <p
            style={{
              margin: '0 0 24px 0',
              fontSize: 'clamp(14px, 2.5vw, 17px)',
              color: '#CBD5E1',
              fontWeight: 500,
              maxWidth: '460px',
              lineHeight: 1.6,
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            Ungkap Kebenaran di Balik Mitos & Data Viral Bersama Detektif Statistik!
          </p>

          {/* CHARACTER SHOWCASE (Stevunt Sprite Animation) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
            style={{
              position: 'relative',
              width: '180px',
              height: '180px',
              margin: '10px 0 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Glowing Aura Ring */}
            <div
              style={{
                position: 'absolute',
                inset: '10px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 173, 181, 0.3) 0%, transparent 70%)',
                border: '2px dashed rgba(0, 173, 181, 0.4)',
                animation: 'spin 20s linear infinite',
              }}
            />

            {/* Ground Shadow */}
            <div
              style={{
                position: 'absolute',
                bottom: '15px',
                width: '100px',
                height: '24px',
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '50%',
                filter: 'blur(6px)',
              }}
            />

            {/* Stevunt Animated Character Sprite */}
            <div
              style={{
                width: '140px',
                height: '140px',
                backgroundImage: `url("/Assets/Character/Stevunt-idle.png")`,
                backgroundSize: '500% 500%',
                backgroundPosition: `${bgX}% ${bgY}%`,
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.7))',
                zIndex: 2,
              }}
            />

            {/* Floating Character Badge */}
            <div
              style={{
                position: 'absolute',
                bottom: '0',
                background: 'rgba(11, 30, 44, 0.9)',
                border: '1px solid #00ADB5',
                borderRadius: '50px',
                padding: '4px 14px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#38BDF8',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                zIndex: 3,
                whiteSpace: 'nowrap',
              }}
            >
              🕵️ Agent Stevunt
            </div>
          </motion.div>

          {/* ── BUTTON CONTROLS ── */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              width: '100%',
              maxWidth: '280px',
            }}
          >
            {/* PLAY BUTTON */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={handlePlayClick}
              disabled={isStarting}
              style={{
                width: '100%',
                padding: '16px 32px',
                fontSize: '20px',
                fontWeight: 900,
                letterSpacing: '2px',
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #00ADB5 0%, #2563EB 100%)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '16px',
                cursor: 'pointer',
                boxShadow: '0 0 30px rgba(0, 173, 181, 0.5), 0 8px 24px rgba(0,0,0,0.5)',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <span>▶</span> {isStarting ? 'MEMUAT...' : 'PLAY'}
            </motion.button>

            {/* LOBBY / LEVEL SELECT BUTTON */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLobbyClick}
              style={{
                width: '100%',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#CBD5E1',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.color = '#FFFFFF'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.color = '#CBD5E1'
              }}
            >
              🗂️ Pilih Kasus (Lobby)
            </motion.button>
          </div>
        </motion.div>

        {/* Global Keyframe CSS Animations */}
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </OrientationGuard>
  )
}
