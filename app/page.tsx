'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import OrientationGuard from './siswa/game/_components/OrientationGuard'
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
  }, [])

  const handleStartGame = () => {
    setIsStarting(true)
    const finalName = studentName.trim() || 'Detektif'
    const studentData = {
      id: 'detektif-guest',
      name: finalName,
      nisn: '-',
      classroom: { name: 'Kelas XII' }
    }
    localStorage.setItem('student', JSON.stringify(studentData))

    setTimeout(() => {
      // Direct launch into Level 1
      router.push('/siswa/game/level/1')
    }, 600)
  }

  const handleGoToLobby = () => {
    const finalName = studentName.trim() || 'Detektif'
    const studentData = {
      id: 'detektif-guest',
      name: finalName,
      nisn: '-',
      classroom: { name: 'Kelas XII' }
    }
    localStorage.setItem('student', JSON.stringify(studentData))
    router.push('/siswa/game/lobby')
  }

  const handleGoToDashboard = () => {
    router.push('/siswa')
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
          backgroundImage: 'url("/Assets/Building/Splash Screen/Splash Screen.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: '42px',
          color: '#F8FAFC',
          fontFamily: "'Outfit', 'Inter', sans-serif",
          userSelect: 'none',
        }}
      >
        {/* Subtle Ambient Vignette Bottom Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(7, 19, 30, 0.88) 0%, rgba(7, 19, 30, 0.4) 35%, rgba(0, 0, 0, 0.1) 70%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* TOP BAR / BRAND HEADER */}
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
          {/* Subtle Logo Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🕵️</span>
            <div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: '14px',
                  letterSpacing: '1px',
                  color: '#00ADB5',
                  textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                }}
              >
                SKEPTIKOS
              </div>
              <div style={{ fontSize: '9px', color: '#CBD5E1', letterSpacing: '2px', fontWeight: 700, textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
                INVESTIGASI DATA
              </div>
            </div>
          </div>

          {/* Student Dashboard Button */}
          <button
            onClick={handleGoToDashboard}
            style={{
              background: 'rgba(15, 35, 53, 0.75)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0, 173, 181, 0.4)',
              borderRadius: '50px',
              padding: '8px 18px',
              color: '#F8FAFC',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#00ADB5'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 173, 181, 0.5)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(0, 173, 181, 0.4)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)'
            }}
          >
            <span>🏫</span> Dashboard Siswa
          </button>
        </header>

        {/* ── ACTION CONTAINER (INPUT & PLAY BUTTON) ── */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '360px',
            padding: '24px 20px',
            borderRadius: '24px',
            background: 'rgba(11, 26, 40, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 173, 181, 0.35)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 173, 181, 0.2)',
            gap: '14px',
          }}
        >
          {/* Input Nama Detektif */}
          <div style={{ width: '100%' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: '#00ADB5',
                letterSpacing: '1.5px',
                marginBottom: '6px',
                textAlign: 'center',
                textTransform: 'uppercase',
              }}
            >
              NAMA DETEKTIF
            </label>
            <input
              type="text"
              placeholder="Masukkan nama panggilanmu..."
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStartGame()}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 18px',
                borderRadius: '14px',
                background: 'rgba(7, 19, 30, 0.85)',
                border: '1px solid rgba(0, 173, 181, 0.4)',
                color: '#FFFFFF',
                fontSize: '14px',
                textAlign: 'center',
                outline: 'none',
                fontWeight: 600,
                transition: 'all 0.2s',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#00ADB5'
                e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 173, 181, 0.4)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(0, 173, 181, 0.4)'
                e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.5)'
              }}
            />
          </div>

          {/* TOMBOL PLAY UTAMA */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleStartGame}
            disabled={isStarting}
            style={{
              width: '100%',
              padding: '16px 32px',
              fontSize: '22px',
              fontWeight: 900,
              letterSpacing: '3px',
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #00ADB5 0%, #2563EB 100%)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '16px',
              cursor: 'pointer',
              boxShadow: '0 0 35px rgba(0, 173, 181, 0.6), 0 8px 24px rgba(0,0,0,0.6)',
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

          {/* TOMBOL PILIH KASUS (LOBBY) */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoToLobby}
            style={{
              width: '100%',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#CBD5E1',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
              e.currentTarget.style.color = '#FFFFFF'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
              e.currentTarget.style.color = '#CBD5E1'
            }}
          >
            🗂️ Pilih Kasus (Lobby)
          </motion.button>
        </motion.div>
      </main>
    </OrientationGuard>
  )
}