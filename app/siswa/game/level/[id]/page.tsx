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
import TeamLobby from '../../_components/TeamLobby'
import '../../game.css'

export default function LevelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { cognitiveStyle, resetLevel, teamId, setTeamId } = useGameStore()
  const [phase, setPhase] = useState<'cutscene' | 'formula' | 'lobby' | 'game'>('cutscene')
  const [cutscenePhase, setCutscenePhase] = useState<'comments' | 'mentor'>('comments')
  const [timerRunning, setTimerRunning] = useState(false)
  // Track whether we've finished waiting for Zustand hydration
  const [hydrated, setHydrated] = useState(false)
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string }[]>([])
  const [studentInfo, setStudentInfo] = useState<{ id: string; name: string } | null>(null)
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

    // Load student info from localStorage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('student')
        if (raw) {
          const s = JSON.parse(raw)
          setStudentInfo({ id: s.id, name: s.name })
        }
      } catch { /* ignore */ }
    }
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
                teamId={resolvedStyle === 'FD' ? teamId : null}
                studentId={studentInfo?.id}
                teamMembers={teamMembers.length > 0 ? teamMembers : undefined}
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
                background: '#FAF6EE',
                color: '#1C1917',
                padding: '16px 20px',
                height: '100%',
                overflow: 'auto',
              }}
            >


              {/* Formula Component — FD: gate-voted, FI: langsung ke game */}
              <PregameFormula
                teamId={resolvedStyle === 'FD' ? teamId : null}
                studentId={studentInfo?.id}
                teamMembers={teamMembers.length > 0 ? teamMembers : undefined}
                onComplete={async () => {
                if (resolvedStyle === 'FD' && studentInfo) {
                  // teamId should already be set from matchmaking in siswa/page.
                  // Fall back to calling match here only if it wasn't set (e.g. direct navigation).
                  if (!teamId) {
                    try {
                      const res = await fetch('/api/game/team/match', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ studentId: studentInfo.id, levelId: 1 }),
                      })
                      if (res.ok) {
                        const data = await res.json()
                        setTeamId(data.teamId)
                      }
                    } catch { /* ignore */ }
                  }
                  setPhase('lobby')
                } else {
                  setPhase('game')
                  setTimerRunning(true)
                }
              }} />
            </motion.div>
          )}

          {/* Phase 1.8: Team Lobby (FD Only) */}
          {phase === 'lobby' && resolvedStyle === 'FD' && studentInfo && teamId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: '#FAF6EE',
                height: '100%',
                overflow: 'auto',
              }}
            >
              <TeamLobby
                studentId={studentInfo.id}
                studentName={studentInfo.name}
                teamId={teamId}
                onComplete={(members) => {
                  setTeamMembers(members)
                  setPhase('game')
                  setTimerRunning(true)
                }}
                onBack={() => router.push('/siswa')}
              />
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
              {resolvedStyle === 'FI' ? (
                <FIPath />
              ) : (
                <FDPath teamId={teamId} studentId={studentInfo?.id} studentName={studentInfo?.name} />
              )}
            </motion.div>
          )}
        </div>
      </div>
    </OrientationGuard>
  )
}
