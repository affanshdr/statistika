'use client'

import { use, useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'
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

  const { resetLevel } = useGameStore()
  const [hydrated, setHydrated] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [studentInfo, setStudentInfo] = useState<{ id: string; name: string } | null>(null)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
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
        } else {
          setStudentInfo({ id: 'detektif-guest', name: 'Detektif' })
        }
      } catch {
        setStudentInfo({ id: 'detektif-guest', name: 'Detektif' })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (demoMode) {
      setInitializing(false)
      return
    }
    if (!studentInfo) return
    setInitializing(false)
  }, [hydrated, studentInfo, demoMode])

  // Show spinner while store is hydrating
  if (!hydrated || initializing) {
    return (
      <div className="game-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '12px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '40px' }}
        >⚙️</motion.div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>
          Memuat permainan...
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

  return (
    <OrientationGuard lockScreen={true}>
      <div className="game-root game-level-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh', overflow: 'hidden', background: '#0B1E2C', color: '#F8FAFC' }}>
        <div className="game-level-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100%', overflow: 'hidden' }}>
          {/* Floating In-Camera Kembali Button */}
          <button
            onClick={() => setShowExitConfirm(true)}
            style={{
              position: 'absolute',
              top: 'clamp(6px, 1.5vh, 12px)',
              left: 'clamp(6px, 1.2vw, 10px)',
              zIndex: 100,
              background: 'rgba(11, 30, 44, 0.88)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(14, 131, 136, 0.4)',
              borderRadius: '12px',
              color: '#F8FAFC',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(4px, 0.6vw, 6px)',
              padding: 'clamp(4px, 0.7vw, 6px) clamp(8px, 1vw, 14px)',
              fontSize: 'clamp(10.5px, 1.1vw, 12px)',
              fontWeight: 800,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(14, 131, 136, 0.3)'
              e.currentTarget.style.borderColor = 'rgba(0, 173, 181, 0.8)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(11, 30, 44, 0.88)'
              e.currentTarget.style.borderColor = 'rgba(14, 131, 136, 0.4)'
            }}
          >
            <span>←</span>
            <span>Kembali</span>
          </button>

          {id === '1' && (
            <Level1Main
              studentId={studentInfo?.id}
              studentName={studentInfo?.name}
              demoMode={demoMode}
              demoStep={demoStep}
            />
          )}

          {id === '2' && (
            <Level2Main
              studentId={studentInfo?.id}
              studentName={studentInfo?.name}
              demoMode={demoMode}
            />
          )}

          {id === '3' && (
            <Level3Main
              studentId={studentInfo?.id}
              studentName={studentInfo?.name}
              demoMode={demoMode}
            />
          )}
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11, 30, 44, 0.85)',
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
            background: '#0F2338',
            border: '1px solid rgba(14, 131, 136, 0.25)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), var(--accent-glow)',
            borderRadius: '24px',
            padding: '28px',
            textAlign: 'center',
            color: '#F8FAFC',
            fontFamily: 'var(--font-sans), sans-serif',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>
                Keluar dari Level?
              </h3>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#94A3B8', lineHeight: 1.55 }}>
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
                  border: '1px solid rgba(14, 131, 136, 0.25)',
                  background: 'transparent',
                  color: '#94A3B8',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  resetLevel()
                  router.push('/siswa')
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s'
                }}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
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
