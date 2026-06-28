'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useGameStore } from '@/lib/store/gameStore'
import DiRA from '../../../_components/DiRA'
import BadgeUnlock from '../../../_components/BadgeUnlock'
import MythBustedStamp from '../../../_components/MythBustedStamp'
import VerdictScreen from '../../../_components/VerdictScreen'
import TeamGateButton from '../../../_components/TeamGateButton'
import { BADGES, STATS } from '../../../_data/level1'
import { useRouter } from 'next/navigation'
import { useGameRealtime } from '@/lib/hooks/useGameRealtime'

const DraggableHistogram = dynamic(() => import('../../../_components/DraggableHistogram'), { ssr: false })

// Steps: 0=Histogram(guided), 1=Hasil Analisis, 1.5=Verifikasi Berita, 2=MythBusted, 3=Materi
type GameStep = 0 | 1 | 1.5 | 2 | 3

interface PendingBadge { icon: string; name: string; desc: string; id: string }

interface Member {
  id: string
  name: string
}

interface ChatMessage {
  id: string
  studentId: string
  senderName: string
  content: string
  createdAt: string
}

interface FDPathProps {
  teamId?: string | null
  studentId?: string
  studentName?: string
}

export default function FDPath({ teamId = null, studentId, studentName }: FDPathProps) {
  const router = useRouter()
  const { addXP, isCompleted, completeLevel, unlockBadge, incrementMistake, mistakeCount, sessionStartTime } = useGameStore()

  const [step, setStep] = useState<GameStep>(0)
  const [pendingBadges, setPendingBadges] = useState<PendingBadge[]>([])
  
  // Multiplayer states
  const [placedIndices, setPlacedIndices] = useState<number[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [teamMembers, setTeamMembers] = useState<Member[]>([])
  const [syncLoading, setSyncLoading] = useState(true)
  const [histogramCorrect, setHistogramCorrect] = useState(false) // true setelah histogram benar disubmit
  const [teamReadyVotes, setTeamReadyVotes] = useState<Record<string, string[]>>({}) // votes dari polling

  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const sessionActiveRef = useRef(false)

  useEffect(() => { sessionActiveRef.current = true }, [])

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // DiRA state
  const [diraMsg, setDiraMsg] = useState<string | null>(null)
  const [showDira, setShowDira] = useState(false)

  // Flash wrong overlay (FD only — no life lost)
  const [flashWrong, setFlashWrong] = useState(false)

  // Tahap B state
  const [submitting, setSubmitting] = useState(false)

  // Initial DiRA Message
  useEffect(() => {
    if (teamId) {
      setDiraMsg('Halo Detektif! Lo sekarang udah join bareng tim lo nih. Bisa langsung mabar diskusikan di chat kanan buat susun histogram bareng! Drag 26 data sisa ke kolom yang valid ya! 😉')
    } else {
      setDiraMsg('Yuk pindahin data screen time 35 siswa ke histogram! Gue udah bantu masukin beberapa data di kelas-kelasnya sebagai contoh. Tinggal drag 26 data sisa ke kelas yang pas ya! 😉')
    }
    setShowDira(true)
  }, [teamId])

  const fetchTeamState = useCallback(async () => {
    if (!teamId) return
    try {
      const res = await fetch(`/api/game/team/sync?teamId=${teamId}${studentId ? `&studentId=${studentId}` : ''}`)
      if (!res.ok) return
      const data = await res.json()

      // 1. Sync current step
      if (data.currentStep !== undefined && data.currentStep !== step) {
        setStep(data.currentStep as GameStep)
        // Show DiRA hint for new steps
        if (data.currentStep === 1) {
          setDiraMsg('Mantap banget! Tim lo sukses bikin histogramnya valid 100%. 📊\nSekarang, yuk kita spill bareng statistik dasarnya!')
          setShowDira(true)
        } else if (data.currentStep === 1.5) {
          setShowDira(false)
        }
      }

      // 2. Sync histogram state
      if (data.histogramState) {
        const remoteIndices = data.histogramState as number[]
        if (JSON.stringify(remoteIndices) !== JSON.stringify(placedIndices)) {
          setPlacedIndices(remoteIndices)
        }
      }

      // 3. Sync members
      if (data.members) {
        setTeamMembers(data.members)
      }

      // 4. Sync chat
      if (data.chatMessages) {
        setChatMessages(data.chatMessages)
      }

      // 5. Sync ready votes (for TeamGateButton UI)
      if (data.readyVotes) {
        setTeamReadyVotes(data.readyVotes as Record<string, string[]>)
      }

      // 6. Sync completion (verdict answered correctly)
      if (data.status === 'COMPLETED' || data.isCorrect) {
        if (data.verdictAnswer) {
          useGameStore.getState().setVerdict(data.verdictAnswer)
        }
        if (step !== 2 && step !== 3) {
          setStep(2)
        }
      }
    } catch (error) {
      console.error('Error fetching team state:', error)
    } finally {
      setSyncLoading(false)
    }
  }, [teamId, step, placedIndices])

  // ── Supabase Realtime: presence across game steps ────────────────────────
  const { broadcastStep, broadcastSyncTrigger } = useGameRealtime(
    teamId,
    studentId,
    studentName,
    undefined,
    fetchTeamState // triggers immediate sync on WebSocket message
  )

  useEffect(() => {
    if (!teamId) {
      setSyncLoading(false)
      return
    }
    fetchTeamState() // initial
    const interval = setInterval(fetchTeamState, 1000) // Kurangi polling interval dari 2s ke 1s
    return () => clearInterval(interval)
  }, [teamId, fetchTeamState])

  const awardBadge = useCallback((badge: typeof BADGES[keyof typeof BADGES]) => {
    unlockBadge(badge.id)
    setPendingBadges(prev => [...prev, badge])
  }, [unlockBadge])

  const dismissBadge = () => setPendingBadges(prev => prev.slice(1))

  // ── STEP 0: Histogram placed change (multiplayer) ──
  const handlePlacedChange = async (newIndices: number[]) => {
    setPlacedIndices(newIndices)
    if (teamId) {
      try {
        await fetch('/api/game/team/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamId, histogramState: newIndices }),
        })
      } catch (e) {
        console.error('Failed to sync placed change:', e)
      }
    }
  }

  // ── STEP 0: Histogram submitted ──
  const handleHistogramSubmit = async (isCorrect: boolean) => {
    if (isCorrect) {
      addXP(25, 'Menyusun histogram terbimbing dengan benar', 0)
      setHistogramCorrect(true)

      if (teamId && studentId) {
        // Team mode: cast gate vote — advance when 2/3 have submitted correctly
        setDiraMsg('Histogram valid! 🎉 Lo udah vote buat lanjut. Tunggu konfirmasi tim lo ya — minimal 1 member lagi wajib setuju!')
        setShowDira(true)
        try {
          const res = await fetch('/api/game/team/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              teamId,
              histogramState: placedIndices,
              castVote: { gate: 'gate_step0_done', studentId },
            }),
          })
          if (res.ok) {
            const data = await res.json()
            if (data.team) {
              setTeamReadyVotes(data.team.readyVotes ?? {})
              broadcastSyncTrigger() // tell other group members to fetch immediately!
              if (data.team.currentStep !== undefined && data.team.currentStep !== step) {
                setStep(data.team.currentStep as GameStep)
              }
            }
          }
        } catch (e) { console.error(e) }
        // Step advance is handled by polling/instant response when server sets currentStep = 1
      } else {
        // Solo/FI mode: advance immediately
        setDiraMsg('Gokil! Lo sukses bikin histogramnya bener semua. 📊\nSekarang, yuk kita spill bareng statistik dasarnya di Tahap B ini!')
        setShowDira(true)
        broadcastStep(1)
        setTimeout(() => setStep(1), 400)
      }
    } else {
      // FD: hanya red flash, tanpa life lost — eksplorasi mandiri
      setFlashWrong(true)
      setTimeout(() => setFlashWrong(false), 600)
      setDiraMsg('Oops, ada data yang nyasar masuk ke kelas yang salah nih! Coba recheck lagi — inget intervalnya: 1-4, 5-8, 9-12, 13-16, 17-20 jam. Angka yang kegedean atau kekecilan musti ditaruh di kelas yang beda ya. Semangat lo pasti bisa! 💪')
      setShowDira(true)
    }
  }

  // ── STEP 1: Analisis selesai → ke Verifikasi Berita ──
  // Hanya dipakai di solo/FI mode. Team mode pakai TeamGateButton gate_step1_done.
  const handleProceedToVerification = async () => {
    if (submitting) return
    setSubmitting(true)
    addXP(20, 'Analisis distribusi FD tepat', 1)
    setShowDira(false)
    setTimeout(() => {
      setStep(1.5)
      setSubmitting(false)
    }, 300)
  }

  // ── STEP 1.5: Verifikasi benar → cast vote gate_verdict_done ──
  const handleVerificationCorrect = async () => {
    addXP(15, 'Verifikasi berita benar', 1)
    awardBadge(BADGES.DETECTIVE)
    if (mistakeCount === 0) awardBadge(BADGES.PERFECT)

    const initialTime = 900
    const elapsed = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : initialTime
    if (elapsed < initialTime * 0.5) awardBadge(BADGES.SPEED)

    awardBadge(BADGES.MYTHBUST)

    if (teamId && studentId) {
      // Team mode: cast gate vote — server advances all when 2/3 answer correctly
      try {
        const res = await fetch('/api/game/team/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamId,
            castVote: { gate: 'gate_verdict_done', studentId },
          }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.team) {
            setTeamReadyVotes(data.team.readyVotes ?? {})
            broadcastSyncTrigger() // tell other group members to fetch immediately!
            if (data.team.currentStep !== undefined && data.team.currentStep !== step) {
              setStep(data.team.currentStep as GameStep)
            }
          }
        }
      } catch (e) { console.error(e) }
      // Step advance is handled by polling/instant response when server sets currentStep = 2
    } else {
      // Solo/FI mode: advance immediately
      setTimeout(() => setStep(2), 400)
    }
  }

  // ── STEP 1.5: Verifikasi salah → hint dari DiRA ──
  const handleVerificationWrong = () => {
    incrementMistake()
    setDiraMsg(`Hmm, coba perhatiin deh, mean = ${STATS.mean} jam. Masa itu lebih dari 8 jam? Gak riil kan? 🤔`)
    setShowDira(true)
  }

  // ── STEP 2: MythBusted complete → finish level ──
  const handleMythBustedComplete = () => {
    addXP(15, 'Menyelesaikan Level 1', 2)
    completeLevel(1)
  }

  // Chat sending handler
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !teamId || !studentId || !studentName) return
    const content = chatInput.trim()
    setChatInput('')

    try {
      await fetch('/api/game/team/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          studentId,
          senderName: studentName,
          content,
        }),
      })
      fetchTeamState() // Refresh local messages instantly
    } catch (err) {
      console.error('Gagal mengirim chat:', err)
    }
  }

  useEffect(() => {
    if (isCompleted && sessionActiveRef.current) {
      const t = setTimeout(() => router.push('/siswa/game/results/1'), 1200)
      return () => clearTimeout(t)
    }
  }, [isCompleted, router])

  const STEP_LABELS = ['Histogram', 'Analisis', 'Verifikasi', 'Selesai']
  const displayStep = step === 0 ? 0 : step === 1 ? 1 : step === 1.5 ? 2 : 3

  if (teamId && syncLoading && chatMessages.length === 0 && teamMembers.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '40px' }}
        >⚙️</motion.div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>Menyinkronkan sesi permainan...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', width: '100%', flex: 1, minHeight: 0, position: 'relative' }}>
      
      {/* ── LEFT SIDE: Main Gameplay Content ── */}
      <div
        className={step === 0 ? 'tahap-a-fullscreen tahap-a-container' : undefined}
        style={step === 0 
          ? { position: 'relative', flex: 1 }
          : { flex: 1, maxWidth: '820px', margin: '0 auto', padding: '24px 16px', paddingBottom: '120px', position: 'relative' }}
      >
        {/* Step indicator */}
        <div className="step-indicator" style={{ marginBottom: step === 0 ? '8px' : '24px', flexShrink: 0 }}>
          {STEP_LABELS.map((label, i) => (
            <div
              key={i}
              className={`step-dot ${i === displayStep ? 'active' : i < displayStep ? 'done' : ''}`}
              title={label}
            />
          ))}
        </div>

        {/* Red flash overlay — FD only, no life lost */}
        <AnimatePresence>
          {flashWrong && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(239,68,68,0.15)', zIndex: 500, pointerEvents: 'none' }}
            />
          )}
        </AnimatePresence>

        <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <AnimatePresence mode="wait">

            {/* ── STEP 0: Histogram Terbimbing ── */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div className="game-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minHeight: 0 }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>Lengkapi histogram</h2>
                    </div>
                    <DraggableHistogram
                      mode="FD"
                      onSubmit={handleHistogramSubmit}
                      placedIndices={teamId ? placedIndices : undefined}
                      onPlacedChange={teamId ? handlePlacedChange : undefined}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 1: Text Analysis (FD) ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>
                      TAHAP B — ANALISIS DISTRIBUSI &amp; VERDICT
                    </div>
                    <h2 style={{ margin: 0, fontSize: '20px' }}>Hasil Analisis &amp; Statistik Dasar</h2>
                  </div>

                  {/* Histogram & Stats Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', alignItems: 'stretch' }} className="tahap-b-reference-grid">
                    {/* Left: Histogram */}
                    <div style={{ background: 'rgba(217,119,6,0.03)', border: '1px solid var(--game-border)', borderRadius: '14px', padding: '12px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>📊 HISTOGRAM HASIL TAHAP A</div>
                      <DraggableHistogram
                        mode="FD"
                        readOnly={true}
                        placedIndices={teamId ? placedIndices : undefined}
                      />
                    </div>

                    {/* Right: Pre-computed stats */}
                    <div style={{ background: 'rgba(217,119,6,0.04)', border: '1px solid var(--game-border-accent)', borderRadius: '14px', padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, marginBottom: '10px', letterSpacing: '1px' }}>📈 STATISTIK DASAR DISTRIBUSI</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        {[
                          { label: 'Mean (Rata-rata)', val: `${STATS.mean} jam` },
                          { label: 'Median', val: `${STATS.median} jam` },
                          { label: 'Min', val: `${STATS.min} jam` },
                          { label: 'Max', val: `${STATS.max} jam` },
                          { label: 'Range (Jangkauan)', val: `${STATS.range} jam` },
                          { label: 'n (Sampel)', val: `${STATS.n} siswa` },
                        ].map(({ label, val }) => (
                          <div key={label} style={{ textAlign: 'center', padding: '8px', background: 'rgba(217,119,6,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>{label}</div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-data)', marginTop: '4px' }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tombol lanjut — TeamGateButton untuk FD team, biasa untuk FI solo */}
                  {teamId ? (
                    <TeamGateButton
                      gate="gate_step1_done"
                      teamId={teamId}
                      studentId={studentId}
                      members={teamMembers}
                      readyVotes={teamReadyVotes}
                      label="Lanjut: Verifikasi Berita →"
                      onVote={() => { addXP(20, 'Analisis distribusi FD tepat', 1); setShowDira(false) }}
                      onVoteSuccess={(votes, stepVal) => {
                        setTeamReadyVotes(votes)
                        broadcastSyncTrigger() // tell others to sync immediately!
                        if (stepVal !== undefined && stepVal !== step) {
                          setStep(stepVal as GameStep)
                        }
                      }}
                      onComplete={() => setStep(1.5)}
                    />
                  ) : (
                    <button
                      className="game-btn game-btn-primary"
                      onClick={handleProceedToVerification}
                      disabled={submitting}
                      style={{ width: '100%', marginTop: '8px' }}
                    >
                      Lanjut: Verifikasi Berita →
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── STEP 1.5: Verifikasi Berita (FD — guided) ── */}
            {step === 1.5 && (
              <motion.div key="step15" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                <div className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>
                      TAHAP C — VERIFIKASI BERITA
                    </div>
                    <h2 style={{ margin: 0, fontSize: '20px' }}>Berdasarkan Datamu — Benar atau Hoaks?</h2>
                  </div>
                  <VerdictScreen
                    onCorrect={handleVerificationCorrect}
                    onWrong={handleVerificationWrong}
                    guidedMode={true}
                  />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── STEP 2: Myth Busted Stamp (overlay) ── */}
        <AnimatePresence>
          {step === 2 && (
            <MythBustedStamp onComplete={handleMythBustedComplete} />
          )}
        </AnimatePresence>

        {/* DiRA guide for step 0 & 1 */}
        {(step === 0 || step === 1) && showDira && diraMsg && (
          <DiRA message={diraMsg} onDismiss={() => setShowDira(false)} />
        )}

        {/* Badge queue */}
        {pendingBadges.length > 0 && (
          <BadgeUnlock
            icon={pendingBadges[0].icon}
            name={pendingBadges[0].name}
            desc={pendingBadges[0].desc}
            onDone={dismissBadge}
          />
        )}
      </div>

      {/* ── RIGHT SIDE: Multiplayer Chat & Teammate Sidebar ── */}
      {teamId && (
        <div
          style={{
            width: '300px',
            background: 'rgba(25, 23, 21, 0.85)',
            borderLeft: '1px solid rgba(180, 140, 80, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 60px)',
            backdropFilter: 'blur(10px)',
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          {/* Teammates List */}
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(180, 140, 80, 0.12)' }}>
            <h3 style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
              👥 KELOMPOK DETEKTIF
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {teamMembers.map((m) => {
                const isMe = m.id === studentId
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px' }}>🕵️</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: isMe ? 'var(--accent)' : '#fff' }}>
                        {m.name} {isMe ? '(Anda)' : ''}
                      </span>
                    </div>
                    {isMe ? (
                      <span style={{ fontSize: '9px', color: 'var(--accent)', fontWeight: 700 }}>
                        {['Histogram', 'Analisis', 'Verifikasi', 'Selesai'][step === 0 ? 0 : step === 1 ? 1 : step === 1.5 ? 2 : 3]}
                      </span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Chat Messages Log */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {chatMessages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
                <span style={{ fontSize: '20px' }}>💬</span>
                <p style={{ fontSize: '11px', margin: 0 }}>Belum ada obrolan kelompok.<br/>Yuk sapa teman satu timmu!</p>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMe = msg.studentId === studentId
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '100%',
                    }}
                  >
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '3px', padding: '0 4px' }}>
                      {msg.senderName}
                    </span>
                    <div
                      style={{
                        background: isMe ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
                        color: isMe ? '#1C1917' : '#fff',
                        padding: '8px 12px',
                        borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        border: isMe ? 'none' : '1px solid rgba(180, 140, 80, 0.1)',
                        fontSize: '12px',
                        lineHeight: 1.45,
                        wordBreak: 'break-word',
                        boxShadow: isMe ? '0 2px 8px rgba(217,119,6,0.2)' : 'none',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Form */}
          <form
            onSubmit={handleSendChatMessage}
            style={{
              padding: '12px',
              borderTop: '1px solid rgba(180, 140, 80, 0.12)',
              background: 'rgba(15, 13, 11, 0.5)',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ketik pesan diskusi..."
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(180, 140, 80, 0.25)',
                borderRadius: '10px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '12px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(180, 140, 80, 0.25)'}
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="game-btn game-btn-primary"
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                borderRadius: '10px',
                flexShrink: 0,
                opacity: chatInput.trim() ? 1 : 0.5,
                cursor: chatInput.trim() ? 'pointer' : 'default',
              }}
            >
              Kirim
            </button>
          </form>
        </div>
      )}

    </div>
  )
}
