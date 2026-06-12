'use client'

import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/lib/store/gameStore'

interface GameHeaderProps {
  timerRunning?: boolean
}

export default function GameHeader({ timerRunning = true }: GameHeaderProps) {
  const { xp, lives, cognitiveStyle, currentLevel, timeRemaining, setTimeRemaining } = useGameStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)

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
    <header className="game-header">
      {/* Left: logo + level */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

      {/* Center: XP + Lives */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* XP */}
        <div className="game-header-xp">
          <span style={{ fontSize: '13px' }}>⚡</span>
          <span className="game-header-xp-value">{xp} XP</span>
        </div>

        {/* Lives */}
        <div className="game-header-lives">
          {Array.from({ length: maxLives }).map((_, i) => (
            <span key={i} style={{ 
              opacity: i < lives ? 1 : 0.2,
              filter: i < lives ? 'drop-shadow(0 0 6px rgba(255,100,100,0.8))' : 'none',
              transition: 'all 0.3s'
            }}>❤️</span>
          ))}
        </div>
      </div>

      {/* Right: Timer */}
      <div className={`game-header-timer ${isUrgent ? 'urgent' : ''}`}>
        ⏱ {mins}:{secs}
      </div>
    </header>
  )
}
