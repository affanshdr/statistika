'use client'

import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/lib/store/gameStore'

interface GameHeaderProps {
  timerRunning?: boolean
  isBlurred?: boolean
}

export default function GameHeader({ timerRunning = true, isBlurred = false }: GameHeaderProps) {
  const { xp, lives, cognitiveStyle, currentLevel, timeRemaining, setTimeRemaining, resetLevel } = useGameStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 480)
      setIsLandscape(window.innerHeight < 500 && window.innerWidth > window.innerHeight)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!timerRunning) return
    intervalRef.current = setInterval(() => {
      setTimeRemaining(Math.max(0, useGameStore.getState().timeRemaining - 1))
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerRunning, setTimeRemaining])

  const mins = Math.floor(timeRemaining / 60).toString().padStart(2, '0')
  const secs = (timeRemaining % 60).toString().padStart(2, '0')
  const isUrgent = timeRemaining > 0 && timeRemaining <= 60
  const maxLives = cognitiveStyle === 'FD' ? 4 : 3

  return (
    <>
      <header
        className="game-header"
        style={{
          filter: isBlurred ? 'blur(10px)' : 'none',
          pointerEvents: isBlurred ? 'none' : 'auto',
          transition: 'filter 0.5s ease',
        }}
      >
        {/* Left: back button + logo + level */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowExitConfirm(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 700,
              gap: '6px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
            }}
          >
            <span>←</span>
            {!isMobile && <span>Kembali</span>}
          </button>

          <span style={{ fontSize: isLandscape ? '14px' : '18px' }}>🕵️</span>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px' }}>
              LVL {currentLevel}
            </div>
            {!isMobile && !isLandscape && (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Video Viral Investigation
              </div>
            )}
          </div>
        </div>


        {/* Right: Timer */}
        <div className={`game-header-timer ${isUrgent ? 'urgent' : ''}`}>
          ⏱ {mins}:{secs}
        </div>
      </header>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            maxWidth: '380px',
            width: '100%',
            background: 'rgba(15, 15, 25, 0.95)',
            border: '1px solid rgba(255, 51, 102, 0.2)',
            boxShadow: '0 0 30px rgba(255, 51, 102, 0.1)',
            borderRadius: '24px',
            padding: '28px',
            textAlign: 'center',
            color: '#fff',
            fontFamily: 'var(--font-sans), sans-serif',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#f3f4f6', fontFamily: 'var(--font-heading), sans-serif' }}>
                Keluar dari Level?
              </h3>
              <p style={{ margin: 0, fontSize: '13.5px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.55 }}>
                Apakah kamu yakin ingin kembali ke halaman pilih level? Progres penyelidikan level ini akan di-reset dari awal.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
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
                  resetLevel()
                  window.location.href = '/siswa'
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#ff3366',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(255, 51, 102, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
