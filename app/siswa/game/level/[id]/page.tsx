'use client'

import { use, useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'
import GameHeader from '../../_components/GameHeader'
import Cutscene from '../../_components/Cutscene'
import FIPath from './_fi/FIPath'
import FDPath from './_fd/FDPath'
import OrientationGuard from '../../_components/OrientationGuard'
import PregameFormula from '../../_components/PregameFormula'
import NPath from '../../_components/NPath'
import TeamLobby from '../../_components/TeamLobby'
import InfographicReader from '../../_components/InfographicReader'
import '../../game.css'

function LevelPageInner({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const levelId = parseInt(id) || 1
  const router = useRouter()
  const searchParams = useSearchParams()
  const demoMode = searchParams.get('demoMode') === 'true'
  const demoStep = searchParams.get('demoStep')

  const { cognitiveStyle, resetLevel, teamId, setTeamId } = useGameStore()
  const [phase, setPhase] = useState<'cutscene' | 'formula' | 'lobby' | 'game'>(
    demoMode ? (demoStep === 'interval' || demoStep === 'histogram' ? 'game' : 'formula') : 'cutscene'
  )
  const [pregameStep, setPregameStep] = useState<'infographic' | 'exploration' | 'minmax' | 'panjangkelas'>(
    demoMode ? (demoStep === 'minmax' ? 'minmax' : 'exploration') : (levelId === 2 ? 'infographic' : 'exploration')
  )
  const [cutscenePhase, setCutscenePhase] = useState<'comments' | 'mentor'>('comments')
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
    if (demoMode) return 'FI' // Force FI for screenshot capture stability
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

  // ── Rejoin check (Bypassed for single-player & demo mode) ───────────────────────────────
  useEffect(() => {
    if (!hydrated) return
    if (demoMode) {
      setInitializing(false)
      return
    }
    if (!studentInfo) return
    setInitializing(false)
  }, [hydrated, studentInfo, demoMode])

  // Show spinner while store is hydrating OR rejoin check is running
  if (!hydrated || initializing) {
    return (
      <div className="game-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '12px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '40px' }}
        >⚙️</motion.div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>
          Memuat sesi tim...
        </p>
      </div>
    )
  }

  // Only Level 1 & 2 exists
  if (id !== '1' && id !== '2') {
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
          isBlurred={phase === 'cutscene' && cutscenePhase === 'mentor'}
        />

        <div className="game-level-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Phase 1: Cutscene */}
          <AnimatePresence>
            {phase === 'cutscene' && (
              <Cutscene
                onPhaseChange={setCutscenePhase}
                teamId={null}
                studentId={studentInfo?.id}
                teamMembers={undefined}
                onComplete={() => setPhase('formula')}
                levelId={levelId}
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
                background: 'var(--game-bg)', color: 'var(--text-primary)',
                padding: '16px 20px', height: '100%', overflow: pregameStep === 'exploration' ? 'hidden' : 'auto',
              }}
            >
              {pregameStep === 'infographic' && (
                <InfographicReader
                  studentId={studentInfo?.id ?? ''}
                  levelId={levelId}
                  onComplete={() => setPregameStep('exploration')}
                />
              )}

              {pregameStep === 'exploration' && (
                <NPath
                  isFD={resolvedStyle === 'FD'}
                  onComplete={() => setPregameStep('minmax')}
                  demoMode={demoMode}
                  levelId={parseInt(id)}
                />
              )}

              {pregameStep === 'minmax' && (
                <PregameFormula
                  teamId={null}
                  studentId={studentInfo?.id}
                  teamMembers={undefined}
                  initialSub={demoMode && demoStep === 'rentang' ? 'rentang' : 'intro'}
                  onComplete={() => setPregameStep('panjangkelas')}
                  levelId={parseInt(id)}
                />
              )}

              {pregameStep === 'panjangkelas' && (
                <PregameFormula
                  teamId={null}
                  studentId={studentInfo?.id}
                  teamMembers={undefined}
                  initialSub="panjang-kelas"
                  onComplete={async () => {
                    setPhase('game')
                  }}
                  levelId={parseInt(id)}
                />
              )}
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
                <FIPath demoMode={demoMode} demoStep={demoStep} levelId={parseInt(id)} />
              ) : (
                <FDPath teamId={null} studentId={studentInfo?.id} studentName={studentInfo?.name} levelId={parseInt(id)} />
              )}
            </motion.div>
          )}
        </div>
      </div>
    </OrientationGuard>
  )
}

export default function LevelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense fallback={
      <div className="game-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '12px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>Loading...</p>
      </div>
    }>
      <LevelPageInner params={params} />
    </Suspense>
  )
}
