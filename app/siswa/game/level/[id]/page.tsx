'use client'

import { use, useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'
import { gameAudio } from '@/lib/utils/gameAudio'
import OrientationGuard from '../../_components/OrientationGuard'
import '../../game.css'

// Dynamic level loading for optimal code-splitting and reduced initial JS bundle
const Level1Main = dynamic(() => import('../../_levels/level1/Level1Main'), {
  ssr: false,
})
const Level2Main = dynamic(() => import('../../_levels/level2/Level2Main'), {
  ssr: false,
})
const Level3Main = dynamic(() => import('../../_levels/level3/Level3Main'), {
  ssr: false,
})

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
  const [isMuted, setIsMuted] = useState(() => gameAudio.getMuted())
  const didResetRef = useRef(false)

  // Ensure Level BGM starts immediately when entering Level
  useEffect(() => {
    const unsub = gameAudio.subscribeMute(setIsMuted)
    if (id === '1') {
      gameAudio.playBGM('level1')
    } else if (id === '2') {
      gameAudio.playBGM('level2')
    }
    return () => unsub()
  }, [id])

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
        const rawPlayer = localStorage.getItem('player')
        if (rawPlayer) {
          const p = JSON.parse(rawPlayer)
          setStudentInfo({ id: p.id, name: p.username || p.displayName || p.name })
        } else {
          const raw = localStorage.getItem('student')
          if (raw) {
            const s = JSON.parse(raw)
            setStudentInfo({ id: s.id, name: s.username || s.name || s.displayName })
          } else {
            setStudentInfo({ id: 'guest', name: 'Pemain' })
          }
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
      <div className="game-root" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px',
        background: '#1A0D08',
      }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3D2419 0%, #2D1A12 100%)',
            border: '2px solid #F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6), inset 0 0 12px rgba(245,158,11,0.25)'
          }}
        >
          🕵️‍♂️
        </motion.div>
        <p style={{ color: '#FEF3C7', fontSize: '13px', fontWeight: 800, margin: 0, letterSpacing: '0.5px' }}>
          Mempersiapkan Berkas Permainan...
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
      <div className="game-root game-level-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh', overflow: 'hidden', background: '#1A0F0A', color: '#F8FAFC' }}>
        <div className="game-level-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100%', overflow: 'hidden' }}>
          {/* Floating In-Camera Kembali Button */}
          <button
            onClick={() => {
              gameAudio.playClick()
              setShowExitConfirm(true)
            }}
            style={{
              position: 'absolute',
              top: 'clamp(6px, 1.5vh, 12px)',
              left: 'clamp(6px, 1.2vw, 10px)',
              zIndex: 100,
              background: 'linear-gradient(135deg, #FFFDF7 0%, #F5E8C7 100%)',
              border: '2px solid #8C6239',
              borderRadius: '12px',
              color: '#362014',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(4px, 0.6vw, 6px)',
              padding: 'clamp(4px, 0.7vw, 6px) clamp(10px, 1.2vw, 14px)',
              fontSize: 'clamp(10.5px, 1.1vw, 12px)',
              fontWeight: 900,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#FAF3E0'
              e.currentTarget.style.borderColor = '#B45309'
              e.currentTarget.style.transform = 'scale(1.04)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #FFFDF7 0%, #F5E8C7 100%)'
              e.currentTarget.style.borderColor = '#8C6239'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <span style={{ fontSize: '13px' }}>←</span>
            <span>Kembali</span>
          </button>

          {/* Floating Audio Toggle Button (Top-Left beside Kembali) */}
          <button
            onClick={() => gameAudio.toggleMute()}
            title={isMuted ? 'Nyalakan Musik & Suara' : 'Matikan Musik & Suara'}
            style={{
              position: 'absolute',
              top: 'clamp(6px, 1.5vh, 12px)',
              left: 'clamp(98px, 11vw, 126px)',
              zIndex: 100,
              background: isMuted ? 'rgba(239, 68, 68, 0.22)' : 'linear-gradient(135deg, #FFFDF7 0%, #F5E8C7 100%)',
              border: `2px solid ${isMuted ? '#EF4444' : '#8C6239'}`,
              borderRadius: '12px',
              color: isMuted ? '#EF4444' : '#362014',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(3px, 0.5vw, 5px)',
              padding: 'clamp(4px, 0.7vw, 6px) clamp(8px, 1vw, 12px)',
              fontSize: 'clamp(10.5px, 1.1vw, 12px)',
              fontWeight: 900,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '13px' }}>{isMuted ? '🔇' : '🔊'}</span>
            <span style={{ fontSize: '10.5px', letterSpacing: '0.4px' }}>
              {isMuted ? 'Muted' : 'Musik'}
            </span>
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
          background: 'rgba(20, 10, 5, 0.8)',
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
            background: 'linear-gradient(145deg, #FFFDF7 0%, #FAF3E0 100%)',
            border: '2.5px solid #8C6239',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(180, 140, 80, 0.15)',
            borderRadius: '24px',
            padding: '28px',
            textAlign: 'center',
            color: '#362014',
            fontFamily: 'var(--font-sans), sans-serif',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 900, color: '#991B1B' }}>
                Keluar dari Level?
              </h3>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#5C4033', lineHeight: 1.55 }}>
                Apakah kamu yakin ingin kembali ke halaman pilih level? Progres pengerjaan level ini akan di-reset dari awal.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  gameAudio.playClick()
                  setShowExitConfirm(false)
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1.5px solid #8C6239',
                  background: '#F5E8C7',
                  color: '#5C4033',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#EED9AC'}
                onMouseLeave={e => e.currentTarget.style.background = '#F5E8C7'}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  gameAudio.playClick()
                  resetLevel()
                  router.push('/siswa')
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(220, 38, 38, 0.35)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
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
