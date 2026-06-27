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
  const [hydrated, setHydrated] = useState(false)
  /** true while the async rejoin check is running */
  const [initializing, setInitializing] = useState(true)
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string }[]>([])
  const [studentInfo, setStudentInfo] = useState<{ id: string; name: string } | null>(null)
  const didResetRef = useRef(false)

  // Hydrate store + load student info from localStorage
  useEffect(() => {
    if (!didResetRef.current) {
      resetLevel()
      didResetRef.current = true
    }
    setHydrated(true)

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

  // Read cognitive style: prefer persisted Zustand, fall back to localStorage
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

  // Guard: only redirect after hydration confirmed and still no style
  useEffect(() => {
    if (hydrated && !resolvedStyle) {
      router.replace('/siswa/game/lobby')
    }
  }, [hydrated, resolvedStyle, router])

  // ── Rejoin check (FD only) ──────────────────────────────────────────────────
  // After store hydrates + studentInfo is ready, fetch team's current state
  // and jump directly to the right phase so "back" → "mulai" doesn't restart.
  useEffect(() => {
    if (!hydrated || !studentInfo) return

    if (resolvedStyle !== 'FD') {
      // FI: solo player, always starts from cutscene
      setInitializing(false)
      return
    }

    const checkRejoin = async () => {
      try {
        let currentTeamId = teamId

        // If teamId not in store, try fetching from my-team API
        if (!currentTeamId) {
          const res = await fetch(`/api/game/team/my-team?studentId=${studentInfo.id}`)
          if (res.ok) {
            const data = await res.json()
            if (data.team?.teamId) {
              currentTeamId = data.team.teamId
              setTeamId(currentTeamId)
            }
          }
        }

        if (!currentTeamId) {
          // No team yet — start from cutscene
          setInitializing(false)
          return
        }

        // Fetch team's current synced state
        const syncRes = await fetch(`/api/game/team/sync?teamId=${currentTeamId}${studentInfo?.id ? `&studentId=${studentInfo.id}` : ''}`)
        if (!syncRes.ok) { setInitializing(false); return }
        const data = await syncRes.json()

        // ── Jump to the phase the team is currently on ────────────────────────
        if (data.status === 'PLAYING') {
          // Team is in-game (histogram, etc.) — skip all pre-game phases
          setTeamMembers(data.members || [])
          setPhase('game')
          setTimerRunning(true)
        } else if (data.gamePhase === 'lobby') {
          // Team finished formula — waiting for ready votes in lobby
          setPhase('lobby')
        } else if (data.gamePhase === 'formula') {
          // Team is working through the formula step
          setPhase('formula')
        } else if (data.gamePhase === 'cutscene_mentor') {
          // Team is on the second cutscene screen
          setCutscenePhase('mentor')
          setPhase('cutscene')
        }
        // else: cutscene_comments / undefined → stay at cutscene start (default)
      } catch { /* network error → fall through to cutscene start */ }

      setInitializing(false)
    }

    checkRejoin()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, studentInfo])

  // Show spinner while store is hydrating OR rejoin check is running
  if (!hydrated || initializing) {
    return (
      <div className="game-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '12px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '40px' }}
        >⚙️</motion.div>
        <p style={{ color: '#78716C', fontSize: '13px', fontWeight: 600 }}>
          Memuat sesi tim...
        </p>
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
                onComplete={() => setPhase('formula')}
              />
            )}
          </AnimatePresence>

          {/* Phase 1.5: Pregame Formula */}
          {phase === 'formula' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                background: '#FAF6EE', color: '#1C1917',
                padding: '16px 20px', height: '100%', overflow: 'auto',
              }}
            >
              <PregameFormula
                teamId={resolvedStyle === 'FD' ? teamId : null}
                studentId={studentInfo?.id}
                teamMembers={teamMembers.length > 0 ? teamMembers : undefined}
                onComplete={async () => {
                  if (resolvedStyle === 'FD' && studentInfo) {
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
                }}
              />
            </motion.div>
          )}

          {/* Phase 1.8: Team Lobby (FD Only) */}
          {phase === 'lobby' && resolvedStyle === 'FD' && studentInfo && teamId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                background: '#FAF6EE', height: '100%', overflow: 'auto',
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
