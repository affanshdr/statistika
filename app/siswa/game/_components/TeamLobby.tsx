'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Member {
  id: string
  name: string
}

interface TeamLobbyProps {
  studentId: string
  studentName: string
  teamId: string
  onComplete: (members: Member[]) => void
  onBack: () => void
}

export default function TeamLobby({
  studentId,
  studentName,
  teamId,
  onComplete,
  onBack,
}: TeamLobbyProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [status, setStatus] = useState<string>('WAITING')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [simulating, setSimulating] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Polling team status
  const pollTeamStatus = async () => {
    try {
      const res = await fetch(`/api/game/team/sync?teamId=${teamId}`)
      if (!res.ok) {
        throw new Error('Gagal memuat status tim')
      }
      const data = await res.json()
      setMembers(data.members || [])
      setStatus(data.status)

      if (data.status === 'PLAYING' || (data.members && data.members.length >= 3)) {
        // Start countdown if not already started
        if (countdown === null && !countdownTimerRef.current) {
          setCountdown(3)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat polling status tim')
    } finally {
      setLoading(false)
    }
  }

  // Effect for polling
  useEffect(() => {
    pollTeamStatus() // Initial check

    pollIntervalRef.current = setInterval(() => {
      // Only keep polling if we aren't in countdown phase
      if (countdown === null) {
        pollTeamStatus()
      }
    }, 2000)

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
    }
  }, [teamId, countdown])

  // Countdown timer logic
  useEffect(() => {
    if (countdown !== null) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }

      if (countdown > 0) {
        countdownTimerRef.current = setTimeout(() => {
          setCountdown(countdown - 1)
        }, 1000)
      } else {
        onComplete(members)
      }
    }
    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current)
    }
  }, [countdown, members, onComplete])

  // Simulate teammates joining (Dev Mode Bypass)
  const handleSimulateTeammates = async () => {
    if (simulating) return
    setSimulating(true)
    setError(null)
    try {
      const res = await fetch('/api/game/team/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      })
      if (!res.ok) {
        throw new Error('Gagal mensimulasikan partner')
      }
      const data = await res.json()
      setMembers(data.members || [])
      setStatus(data.status)
      setCountdown(3) // Start countdown immediately after simulation completes
    } catch (err: any) {
      setError(err.message || 'Gagal mensimulasikan partner')
    } finally {
      setSimulating(false)
    }
  }

  if (loading && members.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '40px' }}
        >⚙️</motion.div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>Menghubungkan ke server tim...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Lobby Title Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="game-card"
        style={{ textAlign: 'center', padding: '32px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(180,140,80,0.15)' }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>
          Lobi Kolaborasi Tim
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 auto', maxWidth: '460px', lineHeight: 1.6 }}>
          Selamat datang di mode kolaborasi! Karena Anda memiliki gaya belajar <strong>Field Dependent (FD)</strong>, 
          Anda akan bekerja sama dengan 2 agen dari kelas Anda untuk menyelesaikan kasus Level 1.
        </p>
      </motion.div>

      {/* Connection Status & Countdown */}
      <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(217,119,6,0.05)', borderRadius: '14px', border: '1px solid var(--game-border-accent)' }}>
        {countdown !== null ? (
          <motion.div
            key="countdown"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '1.5px' }}>
              TIM LENGKAP! MEMULAI PERMAINAN
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-data)' }}>
              {countdown} ...
            </div>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                Mencari Agen Detektif Lain ({members.length} / 3 Terhubung)
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Menunggu teman sekelas Anda bergabung...
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '12px', textAlign: 'center' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Connected Members Card */}
      <div className="game-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1.5px', margin: '0 0 16px', textTransform: 'uppercase' }}>
          📋 Daftar Agen Terkoneksi
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Member slots */}
          {[0, 1, 2].map((idx) => {
            const member = members[idx]
            const isMe = member?.id === studentId

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: member 
                    ? (isMe ? 'rgba(217,119,6,0.06)' : 'rgba(255,255,255,0.02)') 
                    : 'transparent',
                  border: member 
                    ? `1px solid ${isMe ? 'var(--game-border-accent)' : 'var(--game-border)'}` 
                    : '1px dashed rgba(180,140,80,0.15)',
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>{member ? '🕵️' : '❓'}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: member ? '#fff' : 'var(--text-muted)' }}>
                      {member ? member.name : `Menunggu Agen ${idx + 1}...`}
                    </div>
                    {member && (
                      <div style={{ fontSize: '10px', color: isMe ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600 }}>
                        {isMe ? 'Anda (Agen Aktif)' : 'Agen Partner'}
                      </div>
                    )}
                  </div>
                </div>
                {member && (
                  <span style={{ fontSize: '10px', color: '#10B981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '2px 8px', borderRadius: '50px', fontWeight: 700 }}>
                    Siap
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Dev Bypass Section */}
      <AnimatePresence>
        {countdown === null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '16px',
              borderRadius: '14px',
              border: '1px solid rgba(217,119,6,0.15)',
              background: 'linear-gradient(135deg, rgba(217,119,6,0.03) 0%, rgba(0,0,0,0.2) 100%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '1px', marginBottom: '2px' }}>
                🔧 MENU SIMULASI TESTING (DEV MODE)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, maxWidth: '480px' }}>
                Gunakan tombol di bawah untuk mensimulasikan siswa kelas lain masuk ke lobi. Tim Anda akan langsung terisi penuh dan game akan otomatis dimulai.
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={simulating}
              onClick={handleSimulateTeammates}
              className="game-btn game-btn-primary"
              style={{
                fontSize: '12px',
                padding: '10px 24px',
                width: '100%',
                maxWidth: '320px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(217,119,6,0.2)',
              }}
            >
              {simulating ? (
                <>
                  <span className="spinner" style={{ width: '12px', height: '12px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                  Menghubungkan Simulasi...
                </>
              ) : (
                '👥 Simulasikan Partner (Demo) →'
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
        <button
          className="game-btn game-btn-secondary"
          style={{ fontSize: '13px', padding: '8px 24px' }}
          onClick={onBack}
        >
          ← Kembali ke Dashboard
        </button>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .pulse-dot {
          animation: pulse 1.5s infinite alternate;
        }
        @keyframes pulse {
          from { opacity: 0.4; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}
