'use client'

import { use, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'
import GameHeader from '../../_components/GameHeader'
import Cutscene from '../../_components/Cutscene'
import FIPath from './_fi/FIPath'
import FDPath from './_fd/FDPath'
import OrientationGuard from '../../_components/OrientationGuard'
import PregameFormula from '../../_components/PregameFormula'
import '../../game.css'

export default function LevelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { cognitiveStyle, resetLevel } = useGameStore()
  const [phase, setPhase] = useState<'cutscene' | 'formula' | 'game'>('cutscene')
  const [cutscenePhase, setCutscenePhase] = useState<'comments' | 'mentor'>('comments')
  const [timerRunning, setTimerRunning] = useState(false)
  // Track whether we've finished waiting for Zustand hydration
  const [hydrated, setHydrated] = useState(false)
  const didResetRef = useRef(false)

  // Wait one tick for Zustand persist to rehydrate from localStorage.
  // Also always reset level state on fresh mount so that a back-navigation
  // into this page always starts from scratch (no stale isCompleted/lives).
  useEffect(() => {
    if (!didResetRef.current) {
      resetLevel()
      didResetRef.current = true
    }
    setHydrated(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Read cognitive style: prefer persisted Zustand value, fall back to localStorage
  const resolvedStyle: 'FI' | 'FD' | null = (() => {
    if (cognitiveStyle) return cognitiveStyle
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('student')
        if (raw) {
          const s = JSON.parse(raw)
          return s?.geftResult?.cognitiveStyle ?? null
        }
      } catch { /* ignore */ }
    }
    return null
  })()

  // Guard: only redirect after we've confirmed hydration finished and still no style
  useEffect(() => {
    if (hydrated && !resolvedStyle) {
      router.replace('/siswa/game/lobby')
    }
  }, [hydrated, resolvedStyle, router])

  // Show loading spinner while Zustand is still hydrating
  if (!hydrated) {
    return (
      <div className="game-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '40px' }}
        >⚙️</motion.div>
      </div>
    )
  }

  // Only Level 1 exists
  if (id !== '1') {
    return (
      <div className="game-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>🚧</div>
        <h2>Level {id} belum tersedia</h2>
        <button className="game-btn game-btn-primary" onClick={() => router.push('/siswa')}>
          Kembali ke Dashboard
        </button>
      </div>
    )
  }

  if (!resolvedStyle) return null

  return (
    <OrientationGuard lockScreen={true}>
      <div className="game-root game-level-root">
        <GameHeader
          timerRunning={timerRunning && phase === 'game'}
          isBlurred={phase === 'cutscene' && cutscenePhase === 'mentor'}
        />

        <div className="game-level-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Phase 1: Cutscene */}
          <AnimatePresence>
            {phase === 'cutscene' && (
              <Cutscene
                onPhaseChange={setCutscenePhase}
                onComplete={() => {
                  setPhase('formula')
                }}
              />
            )}
          </AnimatePresence>

          {/* Phase 1.5: Pregame Formula — Rentang / Banyak Kelas / Panjang Kelas */}
          {phase === 'formula' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: '#0a0a0f',
                color: '#fff',
                padding: '16px 20px',
                height: '100%',
                overflow: 'hidden',
              }}
            >


              {/* Formula Component — langsung ke game setelah selesai */}
              <PregameFormula onComplete={() => {
                setPhase('game')
                setTimerRunning(true)
              }} />
            </motion.div>
          )}

          {/* Phase 2: Game UI */}
          {phase === 'game' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              {resolvedStyle === 'FI' ? <FIPath /> : <FDPath />}
            </motion.div>
          )}
        </div>
      </div>
    </OrientationGuard>
  )
}
