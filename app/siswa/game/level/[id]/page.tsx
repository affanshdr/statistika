'use client'

import { use, useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'
import GameHeader from '../../_components/GameHeader'
import OrientationGuard from '../../_components/OrientationGuard'
import Level1Main from '../../_levels/level1/Level1Main'
import Level2Main from '../../_levels/level2/Level2Main'
import Level3Main from '../../_levels/level3/Level3Main'
import '../../game.css'

function LevelPageInner({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const demoMode = searchParams.get('demoMode') === 'true'
  const demoStep = searchParams.get('demoStep')

  const { cognitiveStyle, resetLevel } = useGameStore()
  const [hydrated, setHydrated] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [studentInfo, setStudentInfo] = useState<{ id: string; name: string } | null>(null)
  const didResetRef = useRef(false)

  const handleSkip = () => {
    window.dispatchEvent(new CustomEvent('skip-game-step'))
  }

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

  // Unsupported level fallback
  if (id !== '1' && id !== '2' && id !== '3') {
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
      <div className="game-root game-level-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0B1E2C', color: '#F8FAFC' }}>
        <GameHeader isBlurred={false} onSkip={handleSkip} />
        <div className="game-level-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {id === '1' && (
            <Level1Main
              cognitiveStyle={resolvedStyle}
              studentId={studentInfo?.id}
              studentName={studentInfo?.name}
              demoMode={demoMode}
              demoStep={demoStep}
            />
          )}

          {id === '2' && (
            <Level2Main
              cognitiveStyle={resolvedStyle}
              teamId={null}
              studentId={studentInfo?.id}
              studentName={studentInfo?.name}
              demoMode={demoMode}
            />
          )}

          {id === '3' && (
            <Level3Main
              cognitiveStyle={resolvedStyle}
              studentId={studentInfo?.id}
              studentName={studentInfo?.name}
              demoMode={demoMode}
            />
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
