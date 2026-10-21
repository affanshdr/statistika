'use client'

import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/lib/store/gameStore'

interface GameHeaderProps {
  isBlurred?: boolean
  onSkip?: () => void
}

export default function GameHeader({ isBlurred = false, onSkip }: GameHeaderProps) {
  const { currentLevel, resetLevel } = useGameStore()
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowExitConfirm(true)}
            className="astu-menu-btn"
            style={{
              padding: '5px 12px',
              fontSize: '11.5px',
              borderRadius: '8px',
            }}
          >
            <span>←</span>
            {!isMobile && <span>Menu</span>}
          </button>

          <span style={{ fontSize: isLandscape ? '14px' : '18px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>🕵️</span>
          <div>
            <div className="astu-name-badge" style={{ fontSize: '9.5px', padding: '2px 8px', borderRadius: '4px' }}>
              LEVEL {currentLevel}
            </div>
            {!isMobile && !isLandscape && (
              <div style={{ fontSize: '11.5px', color: 'var(--astu-cyan-bright)', fontWeight: 800, marginTop: 2, letterSpacing: '0.4px' }}>
                Video Viral Investigation
              </div>
            )}
          </div>
        </div>

        {/* Temporary Dev/Skip button */}
        {onSkip && (
          <button
            onClick={onSkip}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              color: '#f87171',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              gap: '6px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.8)'
              e.currentTarget.style.color = '#ef4444'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'
              e.currentTarget.style.color = '#f87171'
            }}
          >
            ⏭️ Skip
          </button>
        )}

      </header>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20, 10, 5, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            maxWidth: '390px',
            width: '100%',
            background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
            border: '2.5px solid #F59E0B',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), inset 0 0 25px rgba(251, 191, 36, 0.25)',
            borderRadius: '24px',
            padding: '28px 24px',
            textAlign: 'center',
            color: '#FEF3C7',
            position: 'relative',
            fontFamily: 'var(--font-sans), sans-serif',
          }}>
            {/* Viewfinder Corner Brackets */}
            <div style={{ position: 'absolute', top: '8px', left: '8px', width: '12px', height: '12px', borderTop: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '2px 0 0 0', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '8px', right: '8px', width: '12px', height: '12px', borderTop: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 2px 0 0', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '12px', height: '12px', borderBottom: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '0 0 0 2px', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '12px', height: '12px', borderBottom: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 0 2px 0', pointerEvents: 'none' }} />

            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#FBBF24', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
                KONFIRMASI NAVIGASI
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '19px', fontWeight: 900, color: '#FDE047' }}>
                Keluar dari Level?
              </h3>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#FEF3C7', lineHeight: 1.55 }}>
                Apakah kamu yakin ingin kembali ke halaman pilih level? Progres pengerjaan level ini akan di-reset dari awal.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowExitConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1.5px solid #F59E0B',
                  background: '#F5E8C7',
                  color: '#6B4226',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
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
                  border: '1.5px solid #991B1B',
                  background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
                  transition: 'all 0.2s'
                }}
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
