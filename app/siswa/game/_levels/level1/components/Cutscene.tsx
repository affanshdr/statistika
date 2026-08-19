'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameRealtime } from '@/lib/hooks/useGameRealtime'

interface CutsceneProps {
  onComplete: () => void
  onPhaseChange?: (phase: 'comments' | 'mentor') => void
  teamId?: string | null
  studentId?: string
  teamMembers?: { id: string; name: string }[]
}

const NARASI = [
  'Sebuah postingan viral meledak di Instagram: "BREAKING: Remaja Indonesia rata-rata habiskan >8 jam sehari di medsos! Generasi cemas kecanduan HP!"',
  'Kolom komentar meledak dengan kemarahan dan kekhawatiran netizen dari berbagai penjuru Indonesia...',
]

const CUTSCENE_COMMENTS = [
  { user: '@yyu', text: 'Pantesan nilai TKA jeblok!' },
  { user: '@t1ki', text: 'Pemerintah harus sita HP' },
  { user: '@Rakyat_Skeptis', text: 'Pantesan nilai rapor anak zaman sekarang jeblok semua. Isinya cuma joget-joget di TikTok doang!' },
  { user: '@Bunda_Khawatir99', text: 'Zaman dulu remaja sibuk OSIS sama belajar, zaman sekarang dari bangun tidur sampai merem lagi matanya lengket sama layar. Miris 😢' },
  { user: '@Dedy_Brader', text: '8 jam? Itu mah minimal. Malah ada yang sampai begadang demi nge-game sama scroll feed gak jelas. Generasi cemas kecanduan gadget!' },
  { user: '@Andi_Tech_Savy', text: 'Efek dopamin instan. Otak remaja sekarang udah rusak sama algoritma video pendek.' },
  { user: '@Fitri_Zzz', text: 'Wkwk pantesan kalau diajak ngomong langsung gak nyambung, fokusnya cuma bertahan 5 detik gara-gara keseringan nonton short video.' },
]

const playCommentPopSound = (muted: boolean) => {
  if (muted) return
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    // A quick ascending frequency sweep that sounds like a notification pop
    osc.frequency.setValueAtTime(320, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.12)

    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.14)
  } catch (err) {
    console.error('Failed to play comment pop sound:', err)
  }
}


function TypewriterText({ text, onDone }: { text: string; onDone: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)
  const onDoneRef = useRef(onDone)

  // Update ref when onDone changes without triggering the typewriter effect
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    setDisplayed('')
    indexRef.current = 0
    const id = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1))
        indexRef.current++
      } else {
        clearInterval(id)
        setTimeout(() => {
          onDoneRef.current()
        }, 200)
      }
    }, 22)
    return () => clearInterval(id)
  }, [text])

  return (
    <span>{displayed}<span style={{ animation: 'blink 1s infinite', color: 'var(--accent)' }}>|</span></span>
  )
}

export default function Cutscene({ onComplete, onPhaseChange, teamId, studentId, teamMembers }: CutsceneProps) {
  const [phase, setPhase] = useState<'comments' | 'mentor'>('comments')
  const [visibleComments, setVisibleComments] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mentorTypingDone, setMentorTypingDone] = useState(false)

  // Ready-vote state (FD multiplayer)
  const [myVotedGates, setMyVotedGates] = useState<Set<string>>(new Set())
  const [gateVotes, setGateVotes] = useState<Record<string, string[]>>({})
  const [isVoting, setIsVoting] = useState(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Notify parent of phase changes
  useEffect(() => {
    onPhaseChange?.(phase)
  }, [phase, onPhaseChange])

  // Move poll to useCallback so it's stable and can be triggered by realtime WebSocket
  const poll = useCallback(async () => {
    if (!teamId) return
    try {
      const res = await fetch(`/api/game/team/sync?teamId=${teamId}${studentId ? `&studentId=${studentId}` : ''}`)
      if (!res.ok) return
      const data = await res.json()
      const serverPhase: string = data.gamePhase ?? 'cutscene_comments'
      setGateVotes(data.readyVotes ?? {})

      if (serverPhase === 'cutscene_mentor' && phase === 'comments') {
        setPhase('mentor')
      } else if (serverPhase === 'formula' || serverPhase === 'lobby' || serverPhase === 'game') {
        onCompleteRef.current()
      }
    } catch { /* ignore */ }
  }, [teamId, phase])

  // ── Supabase Realtime for instant synchronization ────────────────────────
  const { broadcastSyncTrigger } = useGameRealtime(
    teamId,
    studentId,
    teamMembers?.find(m => m.id === studentId)?.name ?? 'Detektif',
    undefined,
    poll // triggers immediate fetch when someone else broadcasts sync_trigger
  )

  // ── Multiplayer: Poll gamePhase every 1s ─────────────────────────────────
  const castVote = useCallback(async (gate: string) => {
    if (!teamId || !studentId || isVoting) return
    setIsVoting(true)
    setMyVotedGates(prev => new Set(prev).add(gate))
    try {
      const res = await fetch('/api/game/team/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, castVote: { gate, studentId } }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.team) {
          setGateVotes(data.team.readyVotes ?? {})
          broadcastSyncTrigger() // Tell other group members to fetch immediately!
          const serverPhase = data.team.gamePhase ?? 'cutscene_comments'
          if (serverPhase === 'cutscene_mentor' && phase === 'comments') {
            setPhase('mentor')
          } else if (serverPhase === 'formula' || serverPhase === 'lobby' || serverPhase === 'game') {
            onCompleteRef.current()
          }
        }
      }
    } catch { /* ignore */ } finally {
      setIsVoting(false)
    }
  }, [teamId, studentId, isVoting, phase, broadcastSyncTrigger])

  useEffect(() => {
    if (!teamId) return
    poll()
    const interval = setInterval(poll, 1000)
    return () => clearInterval(interval)
  }, [teamId, poll])

  const commentsEndRef = useRef<HTMLDivElement | null>(null)

  // Track window size for responsiveness
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Auto scroll to bottom when a new comment appears and play sound
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (visibleComments > 1) {
      playCommentPopSound(isMuted)
    }
  }, [visibleComments, isMuted])

  // Display comments one-by-one
  useEffect(() => {
    if (phase === 'comments') {
      const interval = setInterval(() => {
        setVisibleComments((prev) => {
          if (prev < CUTSCENE_COMMENTS.length) {
            return prev + 1
          }
          clearInterval(interval)
          return prev
        })
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [phase])



  return (
    <motion.div
      className="cutscene-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? 'auto' : 'calc(100vh - 68px)',
        minHeight: isMobile ? 'calc(100vh - 68px)' : 'none',
        background: 'var(--game-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '20px 16px' : '24px',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Header controls (Mute) */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '12px', zIndex: 210 }}>
        <button
          className="game-btn game-btn-secondary"
          style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', zIndex: 220 }}
          onClick={() => setIsMuted(prev => !prev)}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Main Container with optional blur */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '20px' : '32px',
          alignItems: isMobile ? 'center' : 'stretch',
          justifyContent: 'center',
          maxWidth: '960px',
          width: '100%',
          height: isMobile ? 'auto' : '100%',
          maxHeight: isMobile ? 'none' : '480px',
          margin: '0 auto',
          zIndex: 10,
          filter: phase === 'mentor' ? 'blur(10px)' : 'none',
          pointerEvents: phase === 'mentor' ? 'none' : 'auto',
          transition: 'filter 0.5s ease',
        }}
      >
        {/* Left Column: Instagram/Social Media Mockup Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <div className="instagram-card" style={{
            width: '100%',
            maxWidth: '320px',
            height: isMobile ? 'auto' : '100%',
            maxHeight: isMobile ? '360px' : '440px',
            background: 'var(--game-card)',
            border: '1px solid var(--game-border)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            color: 'var(--text-primary)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderBottom: '1px solid var(--game-border)',
              background: 'var(--game-card)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '12px',
                    color: '#000'
                  }}>
                    P
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>pinterpolitik</span>
                  <svg viewBox="0 0 24 24" width="12" height="12" style={{ fill: '#3897f0', marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }}>
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
              </div>
              <div style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>•••</div>
            </div>

            {/* Post Image Body */}
            <div style={{
              background: '#fff',
              position: 'relative',
              height: isMobile ? '260px' : '280px',
              overflow: 'hidden',
              display: 'flex',
              color: '#000',
              flexShrink: 0,
            }}>
              {/* Left Text */}
              <div style={{
                flex: 1,
                padding: '24px 0px 24px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                zIndex: 2,
                lineHeight: 1.1,
              }}>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: '#c90000',
                  fontFamily: 'Impact, "Arial Black", sans-serif',
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                }}>
                  BREAKING:
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#000',
                  fontFamily: '"Arial Narrow", Arial, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.5px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}>
                  <span>Remaja Indonesia</span>
                  <span>rata-rata</span>
                  <span>habiskan</span>
                  <span style={{ color: '#c90000' }}>&gt;8 jam</span>
                  <span style={{ color: '#c90000' }}>sehari di</span>
                  <span style={{ color: '#c90000' }}>medsos!</span>
                  <span style={{ marginTop: '6px', fontSize: '15px', fontWeight: 800 }}>Generasi cemas</span>
                  <span style={{ fontSize: '15px', fontWeight: 800 }}>kecanduan HP!</span>
                </div>
              </div>

              {/* Right Silhouette Image */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60%',
                height: '100%',
                zIndex: 1,
              }}>
                <img
                  src="/teen_silhouette.png"
                  alt="Teen Silhouette"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 14px 8px',
            }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span style={{ cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ❤️ <span style={{ fontSize: '11px', fontWeight: 600, color: '#F8FAFC' }}>12,9rb</span>
                </span>
                <span style={{
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  💬 <span style={{ fontSize: '11px', fontWeight: 600, color: '#F8FAFC' }}>1.134</span>
                </span>
                <span style={{ cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ✈️ <span style={{ fontSize: '11px', fontWeight: 600, color: '#F8FAFC' }}>3.560</span>
                </span>
              </div>
              <span style={{ cursor: 'pointer', fontSize: '16px' }}>🔖</span>
            </div>

            {/* Caption Info */}
            <div style={{
              padding: '0 14px 14px',
              fontSize: '12px',
              lineHeight: 1.4,
              color: '#F8FAFC',
            }}>
              <div style={{ marginBottom: '6px', color: '#F8FAFC' }}>
                Disukai oleh <strong>edukasi.kompas</strong> dan <strong>lainnya</strong>
              </div>
              <div>
                <strong>pinterpolitik</strong> Sebuah studi terbaru mengungkap fakta mencengangkan: remaja Indonesia rata-rata menghabiskan lebih dari 8 jam sehari di media sosial!... <span style={{ color: '#F8FAFC', cursor: 'pointer' }}>selengkapnya</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Comments Feed */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            flex: 1.2,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '440px',
            height: isMobile ? 'auto' : '100%',
            background: 'var(--game-card)',
            border: '1px solid var(--game-border)',
            borderRadius: '20px',
            padding: isMobile ? '16px 20px' : '20px 24px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 30px rgba(0, 173, 181, 0.08)',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 60px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--game-border)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>💬</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '0.5px' }}>
                Komentar Netizen
              </span>
              <span style={{
                background: '#ef4444',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '12px',
                marginLeft: 'auto',
                animation: 'pulse-live 1.5s infinite'
              }}>
                LIVE
              </span>
            </div>

            {/* Comments list container */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              overflowY: 'auto',
              flex: 1,
              maxHeight: isMobile ? '240px' : '300px',
              paddingRight: '6px',
            }}>
              {CUTSCENE_COMMENTS.slice(0, visibleComments).map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{
                    background: 'rgba(14, 131, 136, 0.04)',
                    border: '1px solid rgba(14, 131, 136, 0.12)',
                    borderRadius: '14px',
                    padding: '12px 16px',
                    boxShadow: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: `hsl(${(i * 75) % 360}, 70%, 60%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      fontWeight: 'bold',
                      color: '#1C1917',
                    }}>
                      {c.user[1]?.toUpperCase() || 'U'}
                    </div>
                    <span style={{ color: '#3897f0', fontWeight: 700, fontSize: '12px' }}>{c.user}</span>
                  </div>
                  <span style={{ color: '#E2E8F0', fontSize: '13px', lineHeight: 1.4 }}>{c.text}</span>
                </motion.div>
              ))}
              <div ref={commentsEndRef} />
            </div>
          </div>

          {/* Selanjutnya Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            {/* Ready indicator (FD only) */}
            {teamId && teamMembers && myVotedGates.has('gate_cutscene_next') && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {teamMembers.map(m => {
                  const voted = (gateVotes['gate_cutscene_next'] ?? []).includes(m.id) || (m.id === studentId && myVotedGates.has('gate_cutscene_next'))
                  return (
                    <span key={m.id} style={{
                      fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '50px',
                      background: voted ? 'rgba(16,185,129,0.12)' : 'rgba(180,140,80,0.08)',
                      border: `1px solid ${voted ? 'rgba(16,185,129,0.3)' : 'rgba(180,140,80,0.15)'}`,
                      color: voted ? '#10B981' : '#78716C',
                    }}>
                      {voted ? '✅' : '⏳'} {m.name.split(' ')[0]}
                    </span>
                  )
                })}
              </div>
            )}
            <button
              className="game-btn game-btn-primary"
              style={{
                fontSize: '14px',
                padding: '10px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: (teamId && myVotedGates.has('gate_cutscene_next')) ? 0.6 : 1,
              }}
              onClick={() => {
                if (teamId && studentId) {
                  castVote('gate_cutscene_next')
                } else {
                  setPhase('mentor')
                }
              }}
            >
              {teamId && myVotedGates.has('gate_cutscene_next')
                ? `Menunggu ${Math.max(0, 2 - (gateVotes['gate_cutscene_next']?.length ?? 1))} lagi...`
                : 'Selanjutnya'
              }
              {!myVotedGates.has('gate_cutscene_next') && <span>→</span>}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Mentor Dialogue Overlay */}
      <AnimatePresence>
        {phase === 'mentor' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 150,
            padding: '20px',
          }}>
            {/* Bottom Dialogue Box Panel */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                position: 'absolute',
                bottom: isMobile ? '12px' : '24px',
                left: isMobile ? '12px' : '24px',
                right: isMobile ? '12px' : '24px',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '800px',
                width: 'calc(100% - 48px)',
                margin: '0 auto',
              }}
            >
              {/* Tag Name */}
              <div style={{
                alignSelf: 'flex-start',
                background: 'rgba(10, 20, 15, 0.95)',
                borderTop: '2px solid rgba(0, 173, 181, 0.3)',
                borderLeft: '2px solid rgba(0, 173, 181, 0.3)',
                borderRight: '2px solid rgba(0, 173, 181, 0.3)',
                borderBottom: 'none',
                borderRadius: '6px 14px 0 0',
                padding: '4px 16px',
                color: 'var(--accent)',
                fontSize: isMobile ? '11px' : '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 -4px 10px rgba(0,0,0,0.15)',
              }}>
                <span style={{ fontSize: '13px' }}>👤</span>
                <span>ASISTEN DIRA</span>
              </div>

              {/* Dialog Text Box */}
              <div style={{
                background: 'rgba(10, 20, 18, 0.95)',
                border: '2px solid rgba(0, 173, 181, 0.4)',
                borderRadius: '0px 14px 14px 14px',
                padding: isMobile ? '14px 18px' : '20px 24px',
                boxShadow: '0 10px 25px rgba(0, 173, 181, 0.1), inset 0 0 20px rgba(0, 173, 181, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: isMobile ? '95px' : '115px',
                boxSizing: 'border-box',
                position: 'relative',
              }}>
                {/* Agent Sprite Character */}
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(100% - 2px)',
                  right: isMobile ? '8px' : '24px',
                  height: isMobile ? '120px' : '190px',
                  zIndex: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}>
                  <motion.img
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                    src="/dira-avatar.png"
                    alt="Agent"
                    style={{
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </div>
                <p style={{
                  margin: 0,
                  fontSize: isMobile ? '13px' : '15px',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  lineHeight: 1.6,
                  fontFamily: 'var(--font-ui)',
                }}>
                  <TypewriterText
                    text="Wait a minute... Benar nggak sih klaim viral ini? Jangan langsung kemakan emosi netizen di komen deh. Kita ada data riil screen time dari 35 siswa acak. Yuk, kita uji biar valid no cap!"
                    onDone={() => setMentorTypingDone(true)}
                  />
                </p>

                {/* Footer Control Buttons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '12px',
                  borderTop: '1px solid rgba(0, 173, 181, 0.15)',
                  paddingTop: '8px',
                }}>
                  <button
                    className="game-btn game-btn-secondary"
                    style={{
                      fontSize: isMobile ? '10px' : '11px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      minHeight: 'auto',
                    }}
                    onClick={() => {
                      setMentorTypingDone(false)
                      setPhase('comments')
                    }}
                  >
                    KEMBALI
                  </button>

                  <button
                    className="game-btn game-btn-primary"
                    disabled={!mentorTypingDone}
                    style={{
                      fontSize: isMobile ? '11px' : '12px',
                      padding: isMobile ? '6px 16px' : '8px 24px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: mentorTypingDone ? 'pointer' : 'not-allowed',
                      minHeight: 'auto',
                      opacity: mentorTypingDone ? 1 : 0.5,
                      boxShadow: mentorTypingDone ? 'var(--accent-glow)' : 'none',
                    }}
                    onClick={() => {
                      if (!mentorTypingDone) return
                      if (teamId && studentId) {
                        castVote('gate_cutscene_start')
                      } else {
                        onComplete()
                      }
                    }}
                  >
                    {teamId && myVotedGates.has('gate_cutscene_start')
                      ? `Menunggu ${Math.max(0, 2 - (gateVotes['gate_cutscene_start']?.length ?? 1))} lagi...`
                      : 'MULAI INVESTIGASI'
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulse-live {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.95); }
        }
        @keyframes pulse-go {
          0%, 100% { transform: rotate(12deg) scale(1); }
          50% { transform: rotate(12deg) scale(1.12); }
        }
      `}</style>
    </motion.div>
  )
}
