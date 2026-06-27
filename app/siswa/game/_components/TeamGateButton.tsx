'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Member {
  id: string
  name: string
}

interface TeamGateButtonProps {
  /** Nama gate, misal 'gate_step1_done' */
  gate: string
  /** null = solo/FI — langsung memanggil onComplete tanpa vote */
  teamId: string | null
  studentId?: string
  /** Daftar anggota tim dari polling parent */
  members: Member[]
  /** readyVotes dari polling parent — { [gate]: string[] } */
  readyVotes: Record<string, string[]>
  /** Teks tombol sebelum vote */
  label: string
  /** Teks tombol setelah vote (default: '✓ Setuju · Menunggu X lagi...') */
  labelVoted?: string
  /**
   * Dipanggil saat solo mode (FI) — langsung advance.
   * Pada team mode, advance terjadi via polling parent yang mendeteksi perubahan currentStep.
   */
  onComplete: () => void
  /**
   * Opsional: dipanggil sekali saat pengguna berhasil cast vote (atau di solo mode saat klik).
   * Berguna untuk award XP / badge di parent sebelum advance.
   */
  onVote?: () => void
  disabled?: boolean
  style?: React.CSSProperties
  className?: string
}

const THRESHOLD = 2

export default function TeamGateButton({
  gate,
  teamId,
  studentId,
  members,
  readyVotes,
  label,
  labelVoted,
  onComplete,
  onVote,
  disabled = false,
  style,
  className,
}: TeamGateButtonProps) {
  const [localVoted, setLocalVoted] = useState(false)
  const [voting, setVoting] = useState(false)
  const [voteError, setVoteError] = useState<string | null>(null)

  const gateVotes: string[] = readyVotes[gate] ?? []
  const readyCount = gateVotes.length
  // Consider voted if local state OR server already has this user's vote
  const isVotedByMe = localVoted || (studentId ? gateVotes.includes(studentId) : false)

  // ── Solo (FI) mode ─────────────────────────────────────────────────────────
  if (!teamId) {
    return (
      <button
        className={className ?? 'game-btn game-btn-primary'}
        onClick={() => { onVote?.(); onComplete() }}
        disabled={disabled}
        style={{ width: '100%', marginTop: '8px', ...style }}
      >
        {label}
      </button>
    )
  }

  // ── Team (FD) mode ─────────────────────────────────────────────────────────
  const handleClick = async () => {
    if (isVotedByMe || voting || disabled) return
    setVoting(true)
    setVoteError(null)
    try {
      const res = await fetch('/api/game/team/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, castVote: { gate, studentId } }),
      })
      if (!res.ok) throw new Error('Gagal mengirim vote')
      setLocalVoted(true)
      onVote?.()
    } catch (err: unknown) {
      setVoteError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setVoting(false)
    }
  }

  const waitingCount = Math.max(0, THRESHOLD - readyCount)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '8px' }}>

      {/* Member vote badge row — muncul setelah user vote */}
      <AnimatePresence>
        {isVotedByMe && members.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', overflow: 'hidden' }}
          >
            {members.map(m => {
              const voted = gateVotes.includes(m.id) || (m.id === studentId && isVotedByMe)
              return (
                <motion.span
                  key={m.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '50px',
                    background: voted ? 'rgba(16,185,129,0.12)' : 'rgba(180,140,80,0.08)',
                    border: `1px solid ${voted ? 'rgba(16,185,129,0.3)' : 'rgba(180,140,80,0.2)'}`,
                    color: voted ? '#10B981' : '#78716C',
                    transition: 'all 0.3s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {voted ? '✅' : '⏳'} {m.name.split(' ')[0]}
                </motion.span>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        whileHover={!isVotedByMe && !disabled ? { scale: 1.01 } : {}}
        whileTap={!isVotedByMe && !disabled ? { scale: 0.98 } : {}}
        className={className ?? 'game-btn game-btn-primary'}
        onClick={handleClick}
        disabled={isVotedByMe || voting || disabled}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: isVotedByMe ? 0.72 : 1,
          cursor: isVotedByMe ? 'default' : disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.25s',
          ...style,
        }}
      >
        {voting ? (
          <>
            <span style={{
              width: '12px', height: '12px',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              display: 'inline-block',
              flexShrink: 0,
            }} />
            Mengirim...
          </>
        ) : isVotedByMe ? (
          labelVoted ?? `✓ Setuju · Menunggu ${waitingCount} anggota lagi...`
        ) : (
          label
        )}
      </motion.button>

      {/* Vote progress pill */}
      <AnimatePresence>
        {isVotedByMe && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ textAlign: 'center', overflow: 'hidden' }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              background: readyCount >= THRESHOLD ? 'rgba(16,185,129,0.1)' : 'rgba(217,119,6,0.08)',
              border: `1px solid ${readyCount >= THRESHOLD ? 'rgba(16,185,129,0.3)' : 'rgba(217,119,6,0.2)'}`,
              color: readyCount >= THRESHOLD ? '#10B981' : 'var(--accent)',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: readyCount >= THRESHOLD ? '#10B981' : 'var(--accent)',
                animation: 'pulse 1.5s infinite alternate',
                flexShrink: 0,
              }} />
              {readyCount} / {Math.max(members.length, THRESHOLD)} setuju
              {readyCount >= THRESHOLD && ' · Memulai...'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {voteError && (
        <div style={{
          fontSize: '11px', color: '#EF4444', textAlign: 'center',
          padding: '4px 10px', borderRadius: '6px',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
        }}>
          ⚠️ {voteError}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          from { opacity: 0.5; transform: scale(0.9); }
          to   { opacity: 1;   transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}
