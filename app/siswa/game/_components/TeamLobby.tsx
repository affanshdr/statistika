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
  const [readyVotes, setReadyVotes] = useState<string[]>([]) // studentIds who clicked Siap
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [voting, setVoting] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<number | null>(null) // mirror countdown for use inside setInterval closure

  // Polling team status
  const pollTeamStatus = async () => {
    // Don't poll when countdown is already running
    if (countdownRef.current !== null) return
    try {
      const res = await fetch(`/api/game/team/sync?teamId=${teamId}`)
      if (!res.ok) throw new Error('Gagal memuat status tim')
      const data = await res.json()

      setMembers(data.members || [])
      setStatus(data.status)

      // Update who has voted ready
      const lobbyReadyVotes: string[] = (data.readyVotes as Record<string, string[]>)?.lobby_ready ?? []
      setReadyVotes(lobbyReadyVotes)
      if (lobbyReadyVotes.includes(studentId)) setHasVoted(true)

      // When status becomes PLAYING → start countdown
      if (data.status === 'PLAYING' && countdownRef.current === null) {
        countdownRef.current = 3
        setCountdown(3)
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat polling status tim')
    } finally {
      setLoading(false)
    }
  }

  // Polling effect — runs once on mount, re-runs only if teamId changes
  useEffect(() => {
    pollTeamStatus()

    pollIntervalRef.current = setInterval(() => {
      pollTeamStatus()
    }, 2000)

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId])

  // Countdown timer
  useEffect(() => {
    if (countdown !== null) {
      countdownRef.current = countdown
      // Stop polling when countdown starts
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      if (countdown > 0) {
        countdownTimerRef.current = setTimeout(() => setCountdown(countdown - 1), 1000)
      } else {
        onComplete(members)
      }
    }
    return () => { if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current) }
  }, [countdown, members, onComplete])

  // Cast "Siap" vote
  const handleReady = async () => {
    if (hasVoted || voting) return
    setVoting(true)
    setError(null)
    try {
      const res = await fetch('/api/game/team/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          castVote: { gate: 'lobby_ready', studentId },
        }),
      })
      if (!res.ok) throw new Error('Gagal mengirim vote')
      setHasVoted(true)
      await pollTeamStatus() // Refresh immediately
    } catch (err: any) {
      setError(err.message)
    } finally {
      setVoting(false)
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

  const readyCount = readyVotes.length
  const totalMembers = members.length
  const READY_THRESHOLD = 2 // harus sesuai dengan server

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Lobby Title */}
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
          Tim Anda sudah terbentuk! Klik <strong>Saya Siap</strong> untuk mulai bermain.
          Game dimulai otomatis saat <strong>{READY_THRESHOLD} dari {totalMembers} anggota</strong> siap.
        </p>
      </motion.div>

      {/* Status Bar / Countdown */}
      <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(217,119,6,0.05)', borderRadius: '14px', border: '1px solid var(--game-border-accent)' }}>
        {countdown !== null ? (
          <motion.div
            key="countdown"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '1.5px' }}>
              MEMULAI PERMAINAN...
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-data)' }}>
              {countdown} ...
            </div>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: readyCount >= READY_THRESHOLD ? '#10B981' : '#EF4444',
                display: 'inline-block',
                animation: 'pulse 1.5s infinite alternate',
              }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                {readyCount} / {totalMembers} anggota siap
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {readyCount >= READY_THRESHOLD
                ? 'Threshold terpenuhi! Menunggu konfirmasi server...'
                : `Butuh ${READY_THRESHOLD - readyCount} anggota lagi untuk mulai`}
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '12px', textAlign: 'center' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Member Slots */}
      <div className="game-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1.5px', margin: '0 0 16px', textTransform: 'uppercase' }}>
          📋 Anggota Tim
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[0, 1, 2].map((idx) => {
            const member = members[idx]
            const isMe = member?.id === studentId
            const isReady = member ? readyVotes.includes(member.id) : false

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
                    ? `1px solid ${isReady ? 'rgba(16,185,129,0.4)' : isMe ? 'var(--game-border-accent)' : 'var(--game-border)'}`
                    : '1px dashed rgba(180,140,80,0.15)',
                  borderRadius: '12px',
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Avatar with ready indicator */}
                  <div style={{ position: 'relative' }}>
                    <span style={{ fontSize: '20px' }}>{member ? '🕵️' : '❓'}</span>
                    {member && (
                      <span style={{
                        position: 'absolute', bottom: -2, right: -2,
                        width: '9px', height: '9px', borderRadius: '50%',
                        background: isReady ? '#10B981' : '#6B7280',
                        border: '1.5px solid rgba(0,0,0,0.5)',
                      }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: member ? '#fff' : 'var(--text-muted)' }}>
                      {member ? member.name : `Slot ${idx + 1} (kosong)`}
                    </div>
                    {member && (
                      <div style={{ fontSize: '10px', color: isMe ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600 }}>
                        {isMe ? 'Anda' : 'Anggota Tim'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status chip */}
                {member && (
                  <span style={{
                    fontSize: '10px', fontWeight: 700,
                    color: isReady ? '#10B981' : '#6B7280',
                    background: isReady ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.1)',
                    border: `1px solid ${isReady ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.2)'}`,
                    padding: '3px 10px', borderRadius: '50px',
                    transition: 'all 0.3s',
                  }}>
                    {isReady ? '✓ Siap' : '⏳ Menunggu'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* "Saya Siap" CTA button */}
      <AnimatePresence>
        {countdown === null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}
          >
            <motion.button
              whileHover={!hasVoted ? { scale: 1.02 } : {}}
              whileTap={!hasVoted ? { scale: 0.98 } : {}}
              disabled={hasVoted || voting}
              onClick={handleReady}
              className="game-btn"
              style={{
                width: '100%',
                maxWidth: '360px',
                padding: '14px 24px',
                fontSize: '14px',
                fontWeight: 800,
                borderRadius: '14px',
                border: 'none',
                background: hasVoted
                  ? 'rgba(16,185,129,0.15)'
                  : 'linear-gradient(90deg, #D97706, #F59E0B)',
                color: hasVoted ? '#10B981' : '#fff',
                cursor: hasVoted ? 'default' : 'pointer',
                boxShadow: hasVoted ? 'none' : '0 4px 20px rgba(217,119,6,0.35)',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                outline: hasVoted ? `1px solid rgba(16,185,129,0.3)` : 'none',
              }}
            >
              {voting ? (
                <>
                  <span style={{ width: '14px', height: '14px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                  Mengirim...
                </>
              ) : hasVoted ? (
                '✓ Anda Sudah Siap!'
              ) : (
                '🚀 Saya Siap Mulai'
              )}
            </motion.button>

            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
              {hasVoted
                ? `Menunggu ${Math.max(0, READY_THRESHOLD - readyCount)} anggota lagi...`
                : 'Klik tombol di atas untuk menyatakan siap bermain'}

            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
        <button
          className="game-btn game-btn-secondary"
          style={{ fontSize: '13px', padding: '8px 24px' }}
          onClick={onBack}
        >
          ← Kembali ke Dashboard
        </button>
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          from { opacity: 0.4; transform: scale(0.9); }
          to   { opacity: 1;   transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}
