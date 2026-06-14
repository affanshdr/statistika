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
import { screenTimeData } from '../../_data/level1'
import '../../game.css'

export default function LevelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { cognitiveStyle, resetLevel } = useGameStore()
  const [phase, setPhase] = useState<'cutscene' | 'pregame' | 'game'>('cutscene')
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
      <div className="game-root" style={{ height: '100vh', overflow: 'hidden' }}>
        <GameHeader
          timerRunning={timerRunning && phase === 'game'}
          isBlurred={phase === 'cutscene' && cutscenePhase === 'mentor'}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          {/* Phase 1: Cutscene */}
          <AnimatePresence>
            {phase === 'cutscene' && (
              <Cutscene
                onPhaseChange={setCutscenePhase}
                onComplete={() => {
                  setPhase('pregame')
                }}
              />
            )}
          </AnimatePresence>

          {/* Phase 1.5: Pregame Transition Page (2-column layout) */}
          {phase === 'pregame' && (
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
                padding: '20px 24px',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              {/* Header with Title and Lanjut Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>Tahap Pra-Game: Analisis Data Awal</h2>
                <button
                  className="game-btn game-btn-primary"
                  onClick={() => {
                    setPhase('game')
                    setTimerRunning(true)
                  }}
                  style={{ padding: '8px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  Lanjut ke Histogram
                  <span>→</span>
                </button>
              </div>

              {/* Two Column Content */}
              <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
                {/* LEFT Column: 3 Blank Questions */}
                <div className="game-card" style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', overflowY: 'auto' }}>
                  <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px' }}>🎯 PERTANYAAN ANALISIS</div>
                  
                  {/* Soal 1 */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)', marginBottom: '8px' }}>Pertanyaan 1</div>
                    <div style={{ height: '36px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '0 12px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                      (Soal blank...)
                    </div>
                  </div>

                  {/* Soal 2 */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)', marginBottom: '8px' }}>Pertanyaan 2</div>
                    <div style={{ height: '36px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '0 12px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                      (Soal blank...)
                    </div>
                  </div>

                  {/* Soal 3 */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)', marginBottom: '8px' }}>Pertanyaan 3</div>
                    <div style={{ height: '36px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '0 12px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                      (Soal blank...)
                    </div>
                  </div>
                </div>

                {/* RIGHT Column: Scattered Data Points */}
                <div className="game-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', minHeight: 0, position: 'relative' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '10px', flexShrink: 0 }}>
                    📊 SEBARAN DATA SCREEN TIME (N = 35)
                  </div>
                  
                  {/* Scatter Zone */}
                  <div style={{
                    position: 'relative',
                    flex: 1,
                    minHeight: 0,
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px dashed rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                  }}>
                    {screenTimeData.map((val, idx) => {
                      const pos = [
                        { top: '10%', left: '8%' },  { top: '25%', left: '22%' }, { top: '15%', left: '42%' },
                        { top: '42%', left: '10%' }, { top: '55%', left: '28%' }, { top: '27%', left: '58%' },
                        { top: '70%', left: '15%' }, { top: '52%', left: '45%' }, { top: '78%', left: '38%' },
                        { top: '62%', left: '62%' }, { top: '18%', left: '72%' }, { top: '35%', left: '80%' },
                        { top: '72%', left: '72%' }, { top: '82%', left: '55%' }, { top: '8%',  left: '55%' },
                        { top: '48%', left: '70%' }, { top: '32%', left: '35%' }, { top: '85%', left: '20%' },
                        { top: '20%', left: '88%' }, { top: '60%', left: '85%' }, { top: '45%', left: '90%' },
                        { top: '8%',  left: '28%' }, { top: '35%', left: '68%' }, { top: '68%', left: '50%' },
                        { top: '13%', left: '18%' }, { top: '50%', left: '32%' }, { top: '75%', left: '85%' },
                        { top: '23%', left: '78%' }, { top: '88%', left: '70%' }, { top: '40%', left: '50%' },
                        { top: '5%',  left: '65%' }, { top: '65%', left: '38%' }, { top: '30%', left: '12%' },
                        { top: '80%', left: '60%' }, { top: '55%', left: '78%' },
                      ][idx % 35]

                      let col = '#3B82F6'
                      if (val >= 5 && val <= 8) col = '#10B981'
                      else if (val >= 9 && val <= 12) col = '#F59E0B'
                      else if (val >= 13 && val <= 16) col = '#EF4444'
                      else if (val >= 17) col = '#EC4899'

                      return (
                        <div
                          key={idx}
                          style={{
                            position: 'absolute',
                            top: pos.top,
                            left: pos.left,
                            transform: 'translate(-50%, -50%)',
                            padding: '4px 10px',
                            borderRadius: '50px',
                            background: `linear-gradient(135deg, ${col}cc 0%, ${col}66 100%)`,
                            border: `1px solid ${col}44`,
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 800,
                            boxShadow: `0 2px 4px rgba(0,0,0,0.3)`,
                            fontFamily: 'var(--font-data)',
                            userSelect: 'none',
                          }}
                        >
                          {val}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
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
