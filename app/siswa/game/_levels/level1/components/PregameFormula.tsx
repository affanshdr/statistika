'use client'

import { useState, useCallback, useRef, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { screenTimeData, STATS } from '@/app/siswa/game/_data/level1'
import { useGameStore } from '@/lib/store/gameStore'
import DiraPopup, { DiraPopupStep } from '@/app/siswa/game/_components/DiraPopup'
import NPath from './NPath'
import PlayerCharacter from '@/app/siswa/game/_components/PlayerCharacter'
import { useGameRealtime, type PlayerPresence } from '@/lib/hooks/useGameRealtime'

// ─── Constants ───────────────────────────────────────────────────────────────
const CORRECT_MAX = Math.max(...screenTimeData)  // 18
const CORRECT_MIN = Math.min(...screenTimeData)  // 1
const CORRECT_R = CORRECT_MAX - CORRECT_MIN   // 17
const CORRECT_N = STATS.n                     // 35
const CORRECT_K = 6                           // 1 + 3.3 * log10(35) lock to 6
const ACC = '#6366F1'
const GREEN = '#00ADB5'
const RED = '#EF4444'
const MAZE_SPEED = 0.22 // SVG units per frame

const RENTANG_CELL = 11
const RENTANG_COLS = 26
const RENTANG_ROWS = 15
const RENTANG_VW = RENTANG_COLS * RENTANG_CELL // 286
const RENTANG_VH = RENTANG_ROWS * RENTANG_CELL // 165

const RENTANG_CX = (c: number) => c * RENTANG_CELL + RENTANG_CELL / 2
const RENTANG_CY = (r: number) => r * RENTANG_CELL + RENTANG_CELL / 2

// Synthesizes a digital crunch sound programmatically on collision
const playGlitchSound = () => {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(140, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3)

    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.35)

    const bufferSize = ctx.sampleRate * 0.08
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 800

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.12, ctx.currentTime)
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(ctx.destination)

    noise.start()
    noise.stop(ctx.currentTime + 0.15)
  } catch (e) {
    console.error('AudioContext error:', e)
  }
}

// 12 maze nodes — strategically placed, includes min=1 and max=18, using grid coordinates (col, row)
const RENTANG_MAZE_NODES = [
  { val: 1, col: 3, row: 3 },
  { val: 3, col: 13, row: 1 },
  { val: 4, col: 24, row: 1 },
  { val: 5, col: 1, row: 9 },
  { val: 7, col: 9, row: 5 },
  { val: 9, col: 1, row: 13 },
  { val: 11, col: 24, row: 5 },
  { val: 13, col: 24, row: 9 },
  { val: 15, col: 11, row: 11 },
  { val: 17, col: 24, row: 13 },
  { val: 18, col: 21, row: 13 },
  { val: 10, col: 11, row: 7 },
] as const

const RENTANG_MAZE: readonly (readonly number[])[] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // r0
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], // r1
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1], // r2
  [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1], // r3
  [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1], // r4
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // r5
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1], // r6
  [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], // r7
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1], // r8
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1], // r9
  [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1], // r10
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1], // r11
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1], // r12
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], // r13
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // r14
]

function isRentangWalkable(sx: number, sy: number): boolean {
  const col = Math.floor(sx / RENTANG_CELL)
  const row = Math.floor(sy / RENTANG_CELL)
  if (row < 0 || row >= RENTANG_ROWS || col < 0 || col >= RENTANG_COLS) return false
  return (RENTANG_MAZE[row]?.[col] ?? 1) === 0
}

function chooseMonsterDirection(m: { x: number; y: number; dirX: number; dirY: number; lastChange: number; moveInterval: number; recentCells: string[] }) {
  const dirs = [
    { x: 0, y: -1 }, // Up
    { x: 0, y: 1 },  // Down
    { x: -1, y: 0 }, // Left
    { x: 1, y: 0 }   // Right
  ]
  const testStep = 6.0
  const validDirs = dirs.filter(d => {
    const nx = m.x + d.x * testStep
    const ny = m.y + d.y * testStep
    return isRentangWalkable(nx, ny)
  })

  if (validDirs.length === 0) {
    m.dirX = 0
    m.dirY = 0
    m.lastChange = Date.now()
    return
  }

  // 1. Exclude reverse direction from options unless it's the only valid way (dead-end)
  let nonReverseDirs = validDirs.filter(d => {
    if (m.dirX === 0 && m.dirY === 0) return true
    const isMundur = d.x === -m.dirX && d.y === -m.dirY
    return !isMundur
  })

  if (nonReverseDirs.length === 0) {
    nonReverseDirs = validDirs
  }

  // 2. Anti-monoton: filter out options that lead to recently visited cells to prevent bouncing loops
  let finalDirs = nonReverseDirs.filter(d => {
    const nextCol = Math.floor((m.x + d.x * RENTANG_CELL) / RENTANG_CELL)
    const nextRow = Math.floor((m.y + d.y * RENTANG_CELL) / RENTANG_CELL)
    const nextCellKey = `${nextRow},${nextCol}`
    return !m.recentCells || !m.recentCells.includes(nextCellKey)
  })

  if (finalDirs.length === 0) {
    finalDirs = nonReverseDirs
  }

  // 3. Select randomly with equal weight from final prioritized options
  const randIdx = Math.floor(Math.random() * finalDirs.length)
  const selectedDir = finalDirs[randIdx]

  const col = Math.floor(m.x / RENTANG_CELL)
  const row = Math.floor(m.y / RENTANG_CELL)

  if (selectedDir.y !== 0) {
    m.x = RENTANG_CX(col)
  } else if (selectedDir.x !== 0) {
    m.y = RENTANG_CY(row)
  }

  m.dirX = selectedDir.x
  m.dirY = selectedDir.y
  m.lastChange = Date.now()
}

type SubScreen = 'intro' | 'rentang' | 'banyak-kelas' | 'panjang-kelas'
type SlotKey = 'terbesar' | 'terkecil'
interface Props {
  onComplete: () => void
  teamId?: string | null
  studentId?: string
  teamMembers?: { id: string; name: string }[]
  initialSub?: SubScreen
}

// Colors for team members on the maze
const PLAYER_COLORS = ['#00ADB5', '#3B82F6', '#10B981']

// ─── Agent Sidebar (left panel for step 2 & 3) ──────────────────────────────
function AgentSidebar({ message, isMobile }: { message: string; isMobile?: boolean }) {
  return (
    <div
      style={{
        width: isMobile ? '100%' : 'clamp(140px, 38%, 230px)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '4px',
        boxSizing: 'border-box',
        position: 'relative',
        marginTop: isMobile ? '12px' : '0px',
      }}
    >
      {/* Speech bubble */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          background: 'var(--game-card)',
          border: '1px solid var(--game-border-accent)',
          borderRadius: '16px 16px 16px 4px',
          padding: '44px 16px 16px 16px',
          fontSize: 'clamp(12px, 1.8vh, 14.5px)',
          lineHeight: 1.5,
          color: 'var(--text-primary)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          position: 'relative',
        }}
      >
        {/* Avatar placed at the top-left corner, overlapping the bubble border */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            position: 'absolute',
            top: '-16px',
            left: '12px',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            border: '2px solid var(--accent)',
            boxShadow: 'var(--accent-glow)',
            overflow: 'hidden',
            background: '#0B1E2C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <img
            src="/dira-avatar.png"
            alt="Dira"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          />
        </motion.div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '-4px' }}>
          <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1.2px' }}>
            DIRA
          </span>
        </div>
        <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          {message}
        </p>
      </motion.div>
    </div>
  )
}

// ─── Progress dots ───────────────────────────────────────────────────────────
function ProgressDots({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {([1, 2, 3] as const).map(i => (
        <motion.div
          key={i}
          animate={{
            width: i === step ? 20 : 8,
            background:
              i < step ? GREEN :
                i === step ? '#a5b4fc' :
                  'rgba(217,119,6,0.15)',
          }}
          transition={{ duration: 0.3 }}
          style={{ height: 'clamp(6px, 1.2vh, 9px)', borderRadius: '3px' }}
        />
      ))}
    </div>
  )
}

// ─── Step header ──────────────────────────────────────────────────────────────
function StepHeader({
  step, title, subtitle,
}: { step: 1 | 2 | 3; title: string; subtitle: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.8vh, 16px)', flexShrink: 0 }}>
      <div style={{
        width: 'clamp(32px, 5.5vh, 46px)', height: 'clamp(32px, 5.5vh, 46px)', borderRadius: '50%', flexShrink: 0,
        background: `${ACC}33`, border: `1.5px solid ${ACC}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 'clamp(14px, 2.2vh, 18px)', fontWeight: 900, color: '#a5b4fc',
      }}>{step}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'clamp(16px, 2.8vh, 22px)', fontWeight: 800, color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontSize: 'clamp(11px, 1.8vh, 14px)', color: '#A8A29E', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>{subtitle}</div>
      </div>
      <ProgressDots step={step} />
    </div>
  )
}




// ─── Result badge ─────────────────────────────────────────────────────────────
function ResultBadge({ value, suffix = '' }: { value: string; suffix?: string }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.15 }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: 'clamp(6px, 1.2vh, 10px) clamp(14px, 2.5vw, 22px)', borderRadius: '50px',
        background: `${GREEN}1a`, border: `1.5px solid ${GREEN}55`,
        boxShadow: `0 0 14px ${GREEN}33`,
      }}
    >
      <span style={{ fontSize: 'clamp(18px, 3.5vh, 26px)', fontWeight: 900, color: GREEN, fontFamily: 'var(--font-data)' }}>{value}</span>
      {suffix && <span style={{ fontSize: 'clamp(10px, 1.8vh, 14px)', fontWeight: 700, color: `${GREEN}99` }}>{suffix}</span>}
    </motion.div>
  )
}

// ─── Hint toast ───────────────────────────────────────────────────────────────
function HintToast({ hint }: { hint: string }) {
  return (
    <AnimatePresence>
      {hint && (
        <motion.div
          key="hint"
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
          style={{
            flexShrink: 0, padding: 'clamp(7px, 1.2vh, 11px) clamp(12px, 2vw, 18px)',
            borderRadius: '9px', fontSize: 'clamp(11px, 2vh, 14px)', lineHeight: 1.5,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            color: 'rgba(255,255,255,0.88)',
          }}
        >
          {hint}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── D-Pad arrow button ──────────────────────────────────────────────────────
function DPadBtn({ label, onActivate, onRelease }: { label: string; onActivate: () => void; onRelease: () => void }) {
  return (
    <div
      style={{
        width: '26px', height: '26px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '12px', fontWeight: 700,
        background: 'rgba(217,119,6,0.1)',
        border: '1px solid rgba(255,255,255,0.22)',
        cursor: 'pointer', userSelect: 'none', touchAction: 'none',
        color: '#44403C',
        transition: 'background 0.1s',
      }}
      onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.style.background = 'rgba(99,102,241,0.4)'; onActivate() }}
      onPointerUp={e => { e.currentTarget.style.background = 'rgba(217,119,6,0.1)'; onRelease() }}
      onPointerCancel={e => { e.currentTarget.style.background = 'rgba(217,119,6,0.1)'; onRelease() }}
    >
      {label}
    </div>
  )
}

// ─── Virtual Joystick ────────────────────────────────────────────────────────
function MazeJoystick({ onDir }: { onDir: (x: number, y: number) => void }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const active = useRef(false)
  const OUTER_R = 36

  const compute = (clientX: number, clientY: number) => {
    const outer = outerRef.current
    if (!outer) return
    const rect = outer.getBoundingClientRect()
    const dx = clientX - (rect.left + rect.width / 2)
    const dy = clientY - (rect.top + rect.height / 2)
    const dist = Math.sqrt(dx * dx + dy * dy)
    const nx = Math.max(-1, Math.min(1, dist > 0 ? dx / Math.max(dist, OUTER_R) : 0))
    const ny = Math.max(-1, Math.min(1, dist > 0 ? dy / Math.max(dist, OUTER_R) : 0))
    onDir(nx, ny)
    if (knobRef.current) {
      const clampX = (dx / Math.max(dist, 1)) * Math.min(dist, OUTER_R)
      const clampY = (dy / Math.max(dist, 1)) * Math.min(dist, OUTER_R)
      knobRef.current.style.transform = `translate(calc(-50% + ${clampX}px), calc(-50% + ${clampY}px))`
    }
  }

  const reset = () => {
    active.current = false
    onDir(0, 0)
    if (knobRef.current) knobRef.current.style.transform = 'translate(-50%, -50%)'
  }

  return (
    <div
      ref={outerRef}
      style={{
        position: 'absolute', bottom: '12px', left: '12px',
        width: `${OUTER_R * 2}px`, height: `${OUTER_R * 2}px`,
        borderRadius: '50%',
        background: 'rgba(180,140,80,0.1)',
        border: '2px solid rgba(255,255,255,0.18)',
        touchAction: 'none', zIndex: 20,
      }}
      onPointerDown={e => { active.current = true; outerRef.current?.setPointerCapture(e.pointerId); compute(e.clientX, e.clientY) }}
      onPointerMove={e => { if (active.current) compute(e.clientX, e.clientY) }}
      onPointerUp={reset}
      onPointerCancel={reset}
    >
      <div
        ref={knobRef}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '26px', height: '26px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent) 0%, #6366F1 100%)',
          boxShadow: '0 0 10px var(--accent)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

// ─── Intro typewriter ─────────────────────────────────────────────────────────
const INTRO_TEXT = 'Jujurly, sebelum kita spill tabel frekuensinya, lo wajib banget nih ngitung 3 hal krusial dulu — Rentang, Banyak Kelas, sama Panjang Kelas. Gas kita beresin satu-satu, no cap! 🧮'

const INTRO_HIGHLIGHTS: Record<string, string> = {
  'Rentang': 'var(--accent)',
  'Banyak Kelas': 'var(--accent)',
  'Panjang Kelas': 'var(--accent)',
  '3 hal penting': 'var(--accent)',
}

function IntroTypewriter({ onDone }: { onDone: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)
  const onDoneRef = useRef(onDone)

  useEffect(() => { onDoneRef.current = onDone }, [onDone])

  useEffect(() => {
    setDisplayed('')
    indexRef.current = 0
    const id = setInterval(() => {
      if (indexRef.current < INTRO_TEXT.length) {
        setDisplayed(INTRO_TEXT.slice(0, indexRef.current + 1))
        indexRef.current++
      } else {
        clearInterval(id)
        setTimeout(() => onDoneRef.current(), 200)
      }
    }, 20)
    return () => clearInterval(id)
  }, [])

  // Highlight keywords in displayed text
  const parts: React.ReactNode[] = []
  let remaining = displayed
  let key = 0
  while (remaining.length > 0) {
    let foundAt = -1
    let foundWord = ''
    for (const word of Object.keys(INTRO_HIGHLIGHTS)) {
      const idx = remaining.indexOf(word)
      if (idx !== -1 && (foundAt === -1 || idx < foundAt)) {
        foundAt = idx
        foundWord = word
      }
    }
    if (foundAt === -1) {
      parts.push(<span key={key++}>{remaining}</span>)
      break
    }
    if (foundAt > 0) parts.push(<span key={key++}>{remaining.slice(0, foundAt)}</span>)
    parts.push(<strong key={key++} style={{ color: INTRO_HIGHLIGHTS[foundWord] }}>{foundWord}</strong>)
    remaining = remaining.slice(foundAt + foundWord.length)
  }

  return (
    <span>
      {parts}
      <span style={{ animation: 'blink-cursor 1s infinite', color: 'var(--accent)' }}>|</span>
      <style>{`@keyframes blink-cursor { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </span>
  )
}

// Memoized static background component to prevent lag during movement updates
const MazeBackground = memo(({ visitedCells }: { visitedCells: Set<string> }) => {
  return (
    <>
      {/* Background (walls) */}
      <rect width={RENTANG_VW} height={RENTANG_VH} fill="#060709" />

      {/* Floor tiles */}
      {RENTANG_MAZE.flatMap((row, r) => row.map((cell, c) => {
        if (cell === 1) return null
        const isVisited = visitedCells.has(`${r},${c}`)
        return (
          <rect
            key={`f${r}-${c}`}
            x={c * RENTANG_CELL + 0.5}
            y={r * RENTANG_CELL + 0.5}
            width={RENTANG_CELL - 1}
            height={RENTANG_CELL - 1}
            fill={isVisited ? 'rgba(0, 173, 181, 0.25)' : 'rgba(0, 173, 181, 0.08)'}
            stroke={isVisited ? 'rgba(0, 173, 181, 0.85)' : 'rgba(0, 173, 181, 0.35)'}
            strokeWidth={0.5}
            rx={0.5}
            style={{
              transition: 'fill 0.4s ease, stroke 0.4s ease'
            }}
          />
        )
      }))}
    </>
  )
})
MazeBackground.displayName = 'MazeBackground'

// ─── Main component ───────────────────────────────────────────────────────────
export default function PregameFormula({ onComplete, teamId, studentId, teamMembers, initialSub = 'intro' }: Props) {
  const cognitiveStyle = useGameStore(s => s.cognitiveStyle)
  const isFD = cognitiveStyle === 'FD'

  const [sub, setSub] = useState<SubScreen>(initialSub)
  const [introDone, setIntroDone] = useState(false)

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const [mazeMax, setMazeMax] = useState<number | null>(null)
  const [mazeMin, setMazeMin] = useState<number | null>(null)

  // Multiplayer gate/sync state
  const [myVotedGates, setMyVotedGates] = useState<Set<string>>(new Set())
  const [gateVotes, setGateVotes] = useState<Record<string, string[]>>({})
  // Real-time presence from Supabase Broadcast (replaces polling-based positions)
  const [rtPlayers, setRtPlayers] = useState<Record<string, PlayerPresence>>({})
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const charPosRef = useRef({ x: RENTANG_CX(1), y: RENTANG_CY(1) })

  // Glitch monsters patrol path definitions
  const monstersRef = useRef([
    { id: 'm1', x: RENTANG_CX(1), y: RENTANG_CY(11), dirX: 1, dirY: 0, lastChange: 0, moveInterval: 1800, recentCells: [] as string[] },
    { id: 'm2', x: RENTANG_CX(19), y: RENTANG_CY(7), dirX: 1, dirY: 0, lastChange: 0, moveInterval: 1800, recentCells: [] as string[] },
    { id: 'm3', x: RENTANG_CX(13), y: RENTANG_CY(1), dirX: 0, dirY: 1, lastChange: 0, moveInterval: 1800, recentCells: [] as string[] },
  ])

  // My display name from teamMembers
  const myName = teamMembers?.find(m => m.id === studentId)?.name

  // ── Multiplayer: poll team sync (stable callback) ─────────────────────────
  const mazeMaxRef = useRef<number | null>(null)
  const mazeMinRef = useRef<number | null>(null)
  const subRef = useRef<SubScreen>('intro')
  mazeMaxRef.current = mazeMax
  mazeMinRef.current = mazeMin
  subRef.current = sub

  const poll = useCallback(async () => {
    if (!teamId) return
    try {
      const res = await fetch(`/api/game/team/sync?teamId=${teamId}${studentId ? `&studentId=${studentId}` : ''}`)
      if (!res.ok) return
      const data = await res.json()
      const fs = (data.formulaState ?? {}) as Record<string, any>
      setGateVotes(data.readyVotes ?? {})

      // Sync found maze values (once found by anyone, fill everyone)
      if (fs.mazeMax !== null && fs.mazeMax !== undefined && mazeMaxRef.current !== fs.mazeMax) {
        setMazeMax(fs.mazeMax)
      }
      if (fs.mazeMin !== null && fs.mazeMin !== undefined && mazeMinRef.current !== fs.mazeMin) {
        setMazeMin(fs.mazeMin)
      }

      // Sync current sub-screen
      if (fs.sub && fs.sub !== subRef.current) {
        setSub(fs.sub as SubScreen)
      }

      // Detect formula_done gate cleared (server auto-advanced gamePhase)
      const serverPhase: string = data.gamePhase ?? ''
      if (serverPhase === 'lobby' || serverPhase === 'game') {
        onCompleteRef.current()
      }
    } catch { /* ignore */ }
  }, [teamId])

  // ── Supabase Realtime: positions + presence across all sub-screens ──────────
  const { broadcastPos, broadcastSub, broadcastSyncTrigger } = useGameRealtime(
    isFD ? teamId : null,
    studentId,
    myName,
    (players) => setRtPlayers(players),
    poll // triggers immediate fetch when someone else broadcasts sync_trigger
  )

  // Teammate maze positions — only entries that have x,y set
  const teammatePositions: Record<string, { x: number; y: number }> = Object.fromEntries(
    Object.entries(rtPlayers)
      .filter(([, p]) => p.x !== undefined && p.y !== undefined)
      .map(([id, p]) => [id, { x: p.x!, y: p.y! }])
  )

  // ── DiRA Popup state ─────────────────────────────────────────────────────
  const [diraPopupStep, setDiraPopupStep] = useState<DiraPopupStep | null>(null)
  const [showFDIntroPopup, setShowFDIntroPopup] = useState(false)
  // Track which steps have already shown popup (show only once each)
  // 'intro' excluded — the new Agent dialog handles intro messaging
  const shownSteps = useRef<Set<SubScreen>>(new Set(['intro']))

  const navigateTo = useCallback((next: SubScreen) => {
    setSub(next)
    broadcastSub(next) // tell teammates which sub-screen I'm on (real-time)
    if (!shownSteps.current.has(next)) {
      shownSteps.current.add(next)
      // Small delay so the screen transition plays first
      if (next === 'rentang' && isFD) {
        setShowFDIntroPopup(true)
      } else {
        setTimeout(() => setDiraPopupStep(next as DiraPopupStep), 350)
      }
    }
  }, [isFD, broadcastSub])

  // ── Flash overlay (FI error) ─────────────────────────────────────────────
  const [flashScreen, setFlashScreen] = useState(false)
  const triggerFlash = useCallback(() => {
    setFlashScreen(true)
    setTimeout(() => setFlashScreen(false), 500)
  }, [])

  // ── Maze / Labirin state (Rentang step) ──────────────────────────────────
  const [charPos, setCharPos] = useState({ x: RENTANG_CX(1), y: RENTANG_CY(1) })
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set(['1,1']))

  useEffect(() => {
    if (sub !== 'rentang') return
    const col = Math.floor(charPos.x / RENTANG_CELL)
    const row = Math.floor(charPos.y / RENTANG_CELL)
    const cellKey = `${row},${col}`

    setVisitedCells(prev => {
      if (prev.has(cellKey)) return prev
      const next = new Set(prev)
      next.add(cellKey)
      return next
    })
  }, [charPos.x, charPos.y, sub])


  // Monster visual positions and feedback overlays
  const [monsterPositions, setMonsterPositions] = useState([
    { id: 'm1', x: RENTANG_CX(1), y: RENTANG_CY(11) },
    { id: 'm2', x: RENTANG_CX(19), y: RENTANG_CY(7) },
    { id: 'm3', x: RENTANG_CX(13), y: RENTANG_CY(1) },
  ])
  const [collisionFlash, setCollisionFlash] = useState(false)
  const [isShaking, setIsShaking] = useState(false)

  const [nearNode, setNearNode] = useState<number | null>(null)
  const [assignPopup, setAssignPopup] = useState<number | null>(null)
  const [wrongSelectedValue, setWrongSelectedValue] = useState<number | null>(null)
  const [wrongAssignType, setWrongAssignType] = useState<'terbesar' | 'terkecil' | null>(null)
  const nearNodeRef = useRef<number | null>(null)
  nearNodeRef.current = nearNode
  const assignPopupRef = useRef<number | null>(null)
  assignPopupRef.current = assignPopup
  const showFDIntroPopupRef = useRef(showFDIntroPopup)
  showFDIntroPopupRef.current = showFDIntroPopup
  const [rentangDone, setRentangDone] = useState(false)
  const dirRef = useRef({ x: 0, y: 0 })
  const [moveDir, setMoveDir] = useState({ x: 0, y: 0 })
  const animRef = useRef<number | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const slotRRef = useRef<HTMLDivElement>(null)
  const slotKRef = useRef<HTMLDivElement>(null)

  const [popupSelection, setPopupSelection] = useState<'terbesar' | 'terkecil'>('terbesar')
  const popupSelectionRef = useRef<'terbesar' | 'terkecil'>('terbesar')
  popupSelectionRef.current = popupSelection

  useEffect(() => {
    if (assignPopup !== null) {
      dirRef.current = { x: 0, y: 0 }
      setPopupSelection('terbesar')
    }
  }, [assignPopup])

  // RAF movement loop dengan collision
  useEffect(() => {
    if (sub !== 'rentang' || rentangDone) {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current)
      return
    }
    const tick = () => {
      // Update monster positions
      const now = Date.now()
      monstersRef.current.forEach(m => {
        const speed = MAZE_SPEED * 0.75

        // Track current cell coordinates to avoid bouncing in recent cells
        const col = Math.floor(m.x / RENTANG_CELL)
        const row = Math.floor(m.y / RENTANG_CELL)
        const cellKey = `${row},${col}`

        if (!m.recentCells) {
          m.recentCells = []
        }

        if (m.recentCells.length === 0 || m.recentCells[m.recentCells.length - 1] !== cellKey) {
          m.recentCells.push(cellKey)
          if (m.recentCells.length > 4) {
            m.recentCells.shift()
          }
        }

        // Initialize direction if first frame
        if (m.lastChange === 0) {
          chooseMonsterDirection(m)
        }

        const testStep = 6.0
        const isBlocked = (m.dirX === 0 && m.dirY === 0)
          ? true
          : !isRentangWalkable(m.x + m.dirX * testStep, m.y + m.dirY * testStep)

        const isTimeElapsed = now - m.lastChange >= m.moveInterval

        if (isBlocked || isTimeElapsed) {
          chooseMonsterDirection(m)
        }

        m.x += m.dirX * speed
        m.y += m.dirY * speed
      })
      setMonsterPositions(monstersRef.current.map(m => ({ id: m.id, x: m.x, y: m.y })))

      // Check collision
      let collided = false
      const currentPos = charPosRef.current
      monstersRef.current.forEach(m => {
        const dx = Math.abs(m.x - currentPos.x)
        const dy = Math.abs(m.y - currentPos.y)
        if (dx < 8.5 && dy < 8.5) { // collision box blocks the entire RENTANG_CELL width of the hallway
          collided = true
        }
      })

      if (collided) {
        playGlitchSound()
        setCollisionFlash(true)
        setIsShaking(true)
        setTimeout(() => setCollisionFlash(false), 200)
        setTimeout(() => setIsShaking(false), 450)
        setCharPos({ x: RENTANG_CX(1), y: RENTANG_CY(1) })
        charPosRef.current = { x: RENTANG_CX(1), y: RENTANG_CY(1) }
      } else {
        const { x: dx, y: dy } = dirRef.current
        if (dx !== 0 || dy !== 0) {
          setCharPos(prev => {
            const nx = Math.max(RENTANG_CELL * 0.5, Math.min(RENTANG_VW - RENTANG_CELL * 0.5, prev.x + dx * MAZE_SPEED))
            const ny = Math.max(RENTANG_CELL * 0.5, Math.min(RENTANG_VH - RENTANG_CELL * 0.5, prev.y + dy * MAZE_SPEED))
            let nextPos = prev
            if (isRentangWalkable(nx, ny)) nextPos = { x: nx, y: ny }
            else if (isRentangWalkable(nx, prev.y)) nextPos = { x: nx, y: prev.y }
            else if (isRentangWalkable(prev.x, ny)) nextPos = { x: prev.x, y: ny }
            charPosRef.current = nextPos
            return nextPos
          })
        }
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current !== null) cancelAnimationFrame(animRef.current) }
  }, [sub, rentangDone])

  // Keyboard controls (Arrow keys)
  useEffect(() => {
    if (sub !== 'rentang') return
    const KEYS: Record<string, { x: number; y: number }> = {
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
    }
    const held = new Set<string>()
    const update = () => {
      let nx = 0, ny = 0
      held.forEach(k => { const d = KEYS[k]; if (d) { nx += d.x; ny += d.y } })
      const len = Math.sqrt(nx * nx + ny * ny)
      const nextDir = len > 0 ? { x: nx / len, y: ny / len } : { x: 0, y: 0 }
      dirRef.current = nextDir
      setMoveDir(nextDir)
    }
    const down = (e: KeyboardEvent) => {
      if (showFDIntroPopupRef.current) {
        if (e.key === 'Enter') {
          e.preventDefault()
          setShowFDIntroPopup(false)
          setWrongSelectedValue(null)
          setWrongAssignType(null)
        }
        return
      }

      if (assignPopupRef.current !== null) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault()
          setPopupSelection('terbesar')
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault()
          setPopupSelection('terkecil')
        } else if (e.key === 'Enter') {
          e.preventDefault()
          handleAssignRef.current(popupSelectionRef.current)
        } else if (e.key === 'Escape') {
          e.preventDefault()
          setAssignPopup(null)
        }
        return
      }

      if (KEYS[e.key]) {
        e.preventDefault()
        held.add(e.key)
        update()
      } else if (e.key === 'Enter') {
        if (nearNodeRef.current !== null && assignPopupRef.current === null) {
          e.preventDefault()
          setAssignPopup(nearNodeRef.current)
        }
      }
    }
    const up = (e: KeyboardEvent) => { held.delete(e.key); update() }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      dirRef.current = { x: 0, y: 0 }
    }
  }, [sub])

  // Proximity detection (pure SVG units — no getBoundingClientRect)
  useEffect(() => {
    if (rentangDone) return
    const { x: cx, y: cy } = charPos
    let closest: number | null = null
    let minDist = Infinity
    for (const n of RENTANG_MAZE_NODES) {
      const px = RENTANG_CX(n.col)
      const py = RENTANG_CY(n.row)
      const d = Math.hypot(px - cx, py - cy)
      if (d < 8 && d < minDist) {
        minDist = d
        closest = n.val
      }
    }
    setNearNode(closest)
  }, [charPos, rentangDone])

  const handleAssign = useCallback((type: 'terbesar' | 'terkecil') => {
    const val = assignPopup
    if (val === null) return
    setAssignPopup(null)
    const correct =
      (type === 'terbesar' && val === CORRECT_MAX) ||
      (type === 'terkecil' && val === CORRECT_MIN)
    if (!correct) {
      // Show feedback popup; ONLY reset the specific slot that was wrong.
      // Use functional form to protect a slot that was already correctly found
      // (e.g., if mazeMax=18 is already correct, a wrong 'terbesar' attempt must NOT clear it).
      setWrongSelectedValue(val)
      setWrongAssignType(type)
      if (type === 'terbesar') {
        setMazeMax(prev => prev === CORRECT_MAX ? prev : null)
      } else {
        setMazeMin(prev => prev === CORRECT_MIN ? prev : null)
      }
      setShowFDIntroPopup(true)
    } else {
      if (type === 'terbesar') setMazeMax(val)
      else setMazeMin(val)
    }
  }, [assignPopup])

  const handleAssignRef = useRef(handleAssign)
  handleAssignRef.current = handleAssign

  const handleConfirmRentang = useCallback(() => {
    if (mazeMax !== null && mazeMin !== null) setRentangDone(true)
  }, [mazeMax, mazeMin])

  useEffect(() => {
    if (!teamId) return
    poll()
    const interval = setInterval(poll, 1000) // Kurangi polling interval dari 2s ke 1s
    return () => clearInterval(interval)
  }, [teamId, poll])

  // ── Broadcast position via Supabase Realtime every 50ms (replaces 2s DB push) ──
  useEffect(() => {
    if (!teamId || !studentId || sub !== 'rentang') return
    // Broadcast immediately on entering maze
    broadcastPos(charPosRef.current.x, charPosRef.current.y)
    // Then broadcast at 20fps (50ms) — Supabase allows 20 events/s per client
    const interval = setInterval(() => {
      broadcastPos(charPosRef.current.x, charPosRef.current.y)
    }, 50)
    return () => clearInterval(interval)
  }, [teamId, studentId, sub, broadcastPos])

  // ── Sync mazeMax/mazeMin when found ─────────────────────────────────────
  useEffect(() => {
    if (!teamId || mazeMax === null) return
    fetch('/api/game/team/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, formulaStateUpdate: { mazeMax } }),
    }).catch(() => { })
  }, [teamId, mazeMax])

  useEffect(() => {
    if (!teamId || mazeMin === null) return
    fetch('/api/game/team/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, formulaStateUpdate: { mazeMin } }),
    }).catch(() => { })
  }, [teamId, mazeMin])

  // ── Sync sub-screen when navigating ─────────────────────────────────────
  useEffect(() => {
    if (!teamId || sub === 'intro') return
    fetch('/api/game/team/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, formulaStateUpdate: { sub } }),
    }).catch(() => { })
  }, [teamId, sub])

  // ── Cast gate_formula_done vote ──────────────────────────────────────────
  const castFormulaDoneVote = useCallback(async () => {
    if (!teamId || !studentId) { onCompleteRef.current(); return }
    setMyVotedGates(prev => new Set(prev).add('gate_formula_done'))
    try {
      const res = await fetch('/api/game/team/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, castVote: { gate: 'gate_formula_done', studentId } }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.team) {
          setGateVotes(data.team.readyVotes ?? {})
          broadcastSyncTrigger() // tell other team members to sync instantly!
          const serverPhase = data.team.gamePhase ?? ''
          if (serverPhase === 'lobby' || serverPhase === 'game') {
            onCompleteRef.current()
          }
        }
      }
    } catch { /* ignore */ }
  }, [teamId, studentId, broadcastSyncTrigger])

  // ── Banyak kelas state ───────────────────────────────────────────────────
  const [nVal, setNVal] = useState('')
  const [nDone, setNDone] = useState(false)
  const [nHint, setNHint] = useState('')
  const [nShake, setNShake] = useState(0)
  const [nErr, setNErr] = useState(false)

  const checkBK = () => {
    const n = parseInt(nVal.trim(), 10)
    if (n === CORRECT_N) {
      setNDone(true); setNErr(false); setNHint('')
    } else {
      setNErr(true); setNShake(k => k + 1)
      if (isFD) {
        setNHint(`💡 n adalah banyaknya data. Hitung jumlah data screen time yang ada — ada ${CORRECT_N} data!`)
        setTimeout(() => { setNErr(false); setNHint('') }, 3000)
      } else {
        triggerFlash()
        setTimeout(() => setNErr(false), 500)
      }
    }
  }

  // ── Panjang kelas state ──────────────────────────────────────────────────
  const [pkR, setPkR] = useState('')
  const [pkK, setPkK] = useState('')
  const [pkDone, setPkDone] = useState(false)
  const [pkHint, setPkHint] = useState('')
  const [pkShake, setPkShake] = useState(0)
  const [pkErr, setPkErr] = useState(false)
  const [pkRErr, setPkRErr] = useState(false)   // only R input is wrong
  const [pkKErr, setPkKErr] = useState(false)   // only K input is wrong

  const checkPK = useCallback(() => {
    const r = parseInt(pkR.trim(), 10)
    const k = parseInt(pkK.trim(), 10)
    const rOk = r === CORRECT_R
    const kOk = k === CORRECT_K
    if (rOk && kOk) {
      setPkDone(true); setPkErr(false); setPkRErr(false); setPkKErr(false); setPkHint('')
    } else {
      setPkErr(true); setPkShake(v => v + 1)
      setPkRErr(!rOk); setPkKErr(!kOk)
      if (!isFD) triggerFlash()
      // Build specific per-field hint shown for EVERYONE
      const parts: string[] = []
      if (!rOk) parts.push(`Rentang R = ${CORRECT_R} (dari Langkah 1)`)
      if (!kOk) parts.push(`Banyak Kelas K = ${CORRECT_K} (dari Langkah 2)`)
      setPkHint(`💡 Nilai yang benar: ${parts.join(' | ')}`)
      setTimeout(() => { setPkErr(false); setPkRErr(false); setPkKErr(false); setPkHint('') }, 4500)
    }
  }, [pkR, pkK, isFD, triggerFlash])

  useEffect(() => {
    if (pkR !== '' && pkK !== '' && !pkDone) {
      checkPK()
    }
  }, [pkR, pkK, pkDone, checkPK])

  const handleDragEndR = (event: any, info: any) => {
    const slotEl = slotRRef.current
    if (!slotEl) return
    const rect = slotEl.getBoundingClientRect()
    let clientX: number, clientY: number
    if (event && 'changedTouches' in event && event.changedTouches && event.changedTouches.length > 0) {
      clientX = event.changedTouches[0].clientX
      clientY = event.changedTouches[0].clientY
    } else if (event && 'clientX' in event) {
      clientX = event.clientX
      clientY = event.clientY
    } else {
      clientX = info.point.x
      clientY = info.point.y
    }
    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
      setPkR(String(CORRECT_R))
    }
  }

  const handleDragEndK = (event: any, info: any) => {
    const slotEl = slotKRef.current
    if (!slotEl) return
    const rect = slotEl.getBoundingClientRect()
    let clientX: number, clientY: number
    if (event && 'changedTouches' in event && event.changedTouches && event.changedTouches.length > 0) {
      clientX = event.changedTouches[0].clientX
      clientY = event.changedTouches[0].clientY
    } else if (event && 'clientX' in event) {
      clientX = event.clientX
      clientY = event.clientY
    } else {
      clientX = info.point.x
      clientY = info.point.y
    }
    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
      setPkK(String(CORRECT_K))
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0, position: 'relative' }}>

      {/* ── DiRA Popup overlay — muncul di setiap tahap ── */}
      {diraPopupStep && (
        <DiraPopup
          step={diraPopupStep}
          autoDismissMs={7000}
          onDismiss={() => setDiraPopupStep(null)}
        />
      )}

      {/* Centered Dira Tutorial Popup — FD intro & wrong-answer feedback */}
      <AnimatePresence>
        {showFDIntroPopup && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 30, 44, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 500,
            padding: '12px',
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              style={isFD ? {
                maxWidth: '700px',
                width: '100%',
                background: 'var(--game-card)',
                border: '2px solid var(--accent)',
                borderRadius: '20px',
                padding: 'clamp(12px, 2vh, 20px) clamp(12px, 2vw, 24px)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 173, 181, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(10px, 1.8vh, 16px)',
                position: 'relative',
              } : {
                maxWidth: '360px',
                width: '90%',
                background: 'var(--game-card)',
                border: '2px solid #ef4444',
                borderRadius: '22px',
                padding: '24px 20px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 0 30px rgba(239,68,68,0.15)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              {isFD ? (
                <>
                  <style>{`
                    @media (max-width: 768px) {
                      .fd-popup-body { flex-direction: column !important; }
                      .fd-popup-right { display: none !important; }
                    }
                  `}</style>

                  {/* Title & Formula Header */}
                  <div style={{ textAlign: 'center', width: '100%', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: 'clamp(8px, 1.5vh, 14px)' }}>
                    <div style={{
                      fontSize: 'clamp(9px, 1.6vh, 11px)',
                      fontWeight: 800,
                      letterSpacing: '2px',
                      color: 'var(--accent)',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                    }}>
                      Petunjuk Asisten Dira
                    </div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: 'clamp(15px, 2.8vh, 20px)', fontWeight: 900, color: 'var(--text-primary)' }}>
                      Mencari Nilai Rentang (R) 📏
                    </h3>
                    <p style={{ margin: 0, fontSize: 'clamp(11px, 2vh, 13px)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                      Untuk mencari <strong>Rentang</strong>, rumusnya adalah:{' '}
                      <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 'clamp(11px, 2vh, 14px)', marginLeft: '4px' }}>
                        R = data terbesar − data terkecil
                      </span>
                    </p>
                  </div>

                  {/* Main columns */}
                  <div className="fd-popup-body" style={{
                    display: 'flex',
                    gap: 'clamp(10px, 2vw, 20px)',
                    width: '100%',
                    alignItems: 'stretch',
                  }}>
                    {/* Left Column: Content (Ratio 3) */}
                    <div className="fd-popup-left" style={{
                      flex: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'clamp(8px, 1.5vh, 14px)',
                    }}>
                      {/* Row 1: Largest Value Example */}
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '14px',
                        padding: 'clamp(10px, 1.8vh, 14px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'clamp(6px, 1.2vh, 10px)',
                        textAlign: 'left',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 'clamp(11px, 1.9vh, 13px)', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: 'var(--accent)' }}>📈</span> Contoh 1: Mencari Nilai Terbesar
                          </span>
                          <span style={{ fontSize: 'clamp(9px, 1.6vh, 11px)', color: 'rgba(255, 255, 255, 0.5)' }}>(10 Angka)</span>
                        </div>
                        <div style={{ display: 'flex', gap: 'clamp(4px, 0.8vw, 7px)', flexWrap: 'wrap' }}>
                          {[12, 8, 15, 6, 21, 14, 9, 17, 11, 13].map((num, idx) => {
                            const isTarget = num === 21;
                            return (
                              <div key={idx} style={{
                                width: 'clamp(24px, 4vw, 32px)', height: 'clamp(24px, 4vw, 32px)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 'clamp(10px, 1.8vh, 13px)',
                                fontWeight: isTarget ? 900 : 500,
                                background: isTarget ? 'var(--accent)' : 'rgba(180,140,80,0.1)',
                                color: isTarget ? '#000' : 'rgba(255,255,255,0.7)',
                                border: isTarget ? '2px solid #fff' : '1px solid rgba(180,140,80,0.1)',
                                boxShadow: isTarget ? '0 0 10px var(--accent)' : 'none',
                              }}>
                                {num}
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ fontSize: 'clamp(10px, 1.7vh, 12px)', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5 }}>
                          Angka <span style={{ color: 'var(--accent)', fontWeight: 800 }}>21</span> ditebalkan karena merupakan angka <strong style={{ color: 'var(--accent)' }}>terbesar</strong> dari kumpulan data tersebut.
                        </div>
                      </div>

                      {/* Row 2: Smallest Value Example */}
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '14px',
                        padding: 'clamp(10px, 1.8vh, 14px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'clamp(6px, 1.2vh, 10px)',
                        textAlign: 'left',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 'clamp(11px, 1.9vh, 13px)', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: '#D97706' }}>📉</span> Contoh 2: Mencari Nilai Terkecil
                          </span>
                          <span style={{ fontSize: 'clamp(9px, 1.6vh, 11px)', color: 'rgba(255, 255, 255, 0.5)' }}>(10 Angka)</span>
                        </div>
                        <div style={{ display: 'flex', gap: 'clamp(4px, 0.8vw, 7px)', flexWrap: 'wrap' }}>
                          {[18, 25, 11, 30, 14, 22, 9, 16, 27, 13].map((num, idx) => {
                            const isTarget = num === 9;
                            return (
                              <div key={idx} style={{
                                width: 'clamp(24px, 4vw, 32px)', height: 'clamp(24px, 4vw, 32px)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 'clamp(10px, 1.8vh, 13px)',
                                fontWeight: isTarget ? 900 : 500,
                                background: isTarget ? '#D97706' : 'rgba(180,140,80,0.1)',
                                color: isTarget ? '#000' : 'rgba(255,255,255,0.7)',
                                border: isTarget ? '2px solid #fff' : '1px solid rgba(180,140,80,0.1)',
                                boxShadow: isTarget ? '0 0 10px #D97706' : 'none',
                              }}>
                                {num}
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ fontSize: 'clamp(10px, 1.7vh, 12px)', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5 }}>
                          Angka <span style={{ color: '#D97706', fontWeight: 800 }}>9</span> ditebalkan karena merupakan angka <strong style={{ color: '#D97706' }}>terkecil</strong> dari kumpulan data tersebut.
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Agent Dira (Ratio 1) — hidden on mobile */}
                    <div className="fd-popup-right" style={{
                      flex: 1.1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      background: 'rgba(99, 102, 241, 0.05)',
                      border: '1px solid rgba(99, 102, 241, 0.15)',
                      borderRadius: '14px',
                      padding: '14px',
                      boxSizing: 'border-box',
                    }}>
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        border: '2px solid var(--accent)',
                        boxShadow: 'var(--accent-glow)',
                        background: 'var(--game-card)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                      }}>
                        <img
                          src="/dira-avatar.png"
                          alt="Dira"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{
                        textAlign: 'center',
                        fontSize: 'clamp(10px, 1.8vh, 12px)',
                        lineHeight: 1.55,
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                      }}>
                        <p style={{ margin: '0 0 6px 0', color: 'var(--accent)', fontWeight: 800, fontSize: 'clamp(9px, 1.5vh, 11px)', letterSpacing: '0.5px' }}>
                          TIPS DARI DIRA
                        </p>
                        "Biar nggak fomo dan salpok, coba deh lo scan datanya dari kiri ke kanan biar cepet dapet nilai tertinggi sama terendah! Vibenya dapet banget."
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    className="game-btn game-btn-primary"
                    onClick={() => setShowFDIntroPopup(false)}
                    style={{
                      width: '100%',
                      padding: 'clamp(8px, 1.5vh, 12px)',
                      fontSize: 'clamp(12px, 2vh, 14px)',
                      fontWeight: 800,
                      boxShadow: 'var(--accent-glow)',
                    }}
                  >
                    Mengerti {!isMobile && '(Enter)'}
                  </button>
                </>
              ) : (
                <>
                  {/* FI Error Popup */}
                  <div style={{ fontSize: '32px' }}>⚠️</div>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    border: '2px solid #ef4444',
                    boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)',
                    background: 'var(--game-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    <img
                      src="/dira-avatar.png"
                      alt="Dira"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: 'var(--text-primary)' }}>
                    Nilai Tidak Sesuai!
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.6 }}>
                    Waduh riil no cap! Nilai <strong style={{ color: '#ef4444', fontSize: '15px' }}>{wrongSelectedValue}</strong> yang lo pick bukan nilai <strong style={{ color: '#ef4444' }}>{wrongAssignType || 'terkecil atau terbesar'}</strong> dari data yang ada di labirin. Coba lebih teliti lagi, jangan salpok ya! 🔍
                  </p>
                  <button
                    className="game-btn game-btn-primary"
                    onClick={() => {
                      setShowFDIntroPopup(false)
                      setWrongSelectedValue(null)
                      setWrongAssignType(null)
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '13px',
                      fontWeight: 800,
                      background: '#ef4444',
                      border: 'none',
                      boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)',
                    }}
                  >
                    Mengerti {!isMobile && '(Enter)'}
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FI Flash overlay */}
      <AnimatePresence>
        {flashScreen && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 300, borderRadius: '14px',
              background: 'rgba(239,68,68,0.26)', border: '2px solid rgba(239,68,68,0.55)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Sub-screens */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sub}
          initial={{ opacity: 0, x: sub === 'intro' ? 0 : 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0 }}
        >

          {/* ══ INTRO ══════════════════════════════════════════════════════════ */}
          {sub === 'intro' && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(180deg, #080d0a 0%, #0a0f0d 60%, #0c120e 100%)',
              borderRadius: '14px',
            }}>
              {/* Subtle grid overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(217,119,6,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(217,119,6,0.03) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                pointerEvents: 'none',
              }} />

              {/* Bottom gradient vignette */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(8,13,10,0) 0%, rgba(8,13,10,0.8) 70%)',
                pointerEvents: 'none',
              }} />

              {/* ── Dialogue panel (Cutscene style) ── */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ width: '100%', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column' }}
              >
                {/* Name tag tab */}
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
                  fontSize: 'clamp(11px, 1.8vh, 13px)',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 -4px 10px rgba(0,0,0,0.15)',
                }}>
                  <span>👤</span>
                  <span>ASISTEN DIRA</span>
                </div>

                {/* Dialog text box */}
                <div style={{
                  background: 'rgba(10, 20, 18, 0.95)',
                  border: '2px solid rgba(0, 173, 181, 0.4)',
                  borderRadius: '0px 14px 14px 14px',
                  padding: 'clamp(14px, 2.5vh, 20px) clamp(16px, 3vw, 24px) clamp(12px, 2vh, 18px)',
                  boxShadow: '0 10px 25px rgba(0, 173, 181, 0.1), inset 0 0 20px rgba(0, 173, 181, 0.03)',
                  display: 'flex', flexDirection: 'column', gap: '12px',
                  boxSizing: 'border-box', position: 'relative',
                  minHeight: 'clamp(95px, 18vh, 130px)',
                }}>

                  {/* ── Agent Image (Cutscene style) ── */}
                  <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% - 2px)',
                    right: 'clamp(12px, 3vw, 28px)',
                    height: 'clamp(110px, 22vh, 190px)',
                    zIndex: 5,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    pointerEvents: 'none',
                  }}>
                    <motion.img
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.3 }}
                      src="/dira-avatar.png"
                      alt="Agent DIRA"
                      style={{ height: '100%', objectFit: 'contain' }}
                    />
                    {/* "Go!" speech bubble removed */}
                  </div>

                  {/* Dialog text */}
                  <p style={{
                    margin: 0,
                    fontSize: 'clamp(12px, 2vh, 15px)',
                    color: '#F8FAFC',
                    fontWeight: 600,
                    lineHeight: 1.65,
                    paddingRight: 'clamp(80px, 15vw, 140px)',
                  }}>
                    <IntroTypewriter onDone={() => setIntroDone(true)} />
                  </p>

                  {/* Footer */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderTop: '1px solid rgba(180,140,80,0.12)', paddingTop: '10px',
                  }}>
                    <span style={{ fontSize: 'clamp(10px, 1.6vh, 12px)', color: '#94A3B8', fontWeight: 600 }}>
                      Persiapan Statistik — Level 1
                    </span>
                    <motion.button
                      className="game-btn game-btn-primary"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: introDone ? 1 : 0.4, x: 0 }}
                      transition={{ delay: 0.45 }}
                      onClick={() => introDone && navigateTo('rentang')}
                      style={{
                        fontSize: 'clamp(11px, 1.8vh, 13px)',
                        padding: 'clamp(6px, 1vh, 8px) clamp(16px, 2.5vw, 22px)',
                        borderRadius: '7px', fontWeight: 800,
                        display: 'flex', alignItems: 'center', gap: '6px',
                        minHeight: 'auto',
                        boxShadow: introDone ? 'var(--accent-glow)' : 'none',
                        cursor: introDone ? 'pointer' : 'not-allowed',
                      }}
                    >
                      MULAI SEKARANG →
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              <style>{`
                @keyframes pulse-go-pregame {
                  0%, 100% { transform: rotate(12deg) scale(1); }
                  50% { transform: rotate(12deg) scale(1.12); }
                }
              `}</style>
            </div>
          )}



          {/* ══ RENTANG — Maze Exploration ══════════════════════════════════ */}
          {sub === 'rentang' && (
            <>
              <StepHeader step={2} title="Rentang (R)" subtitle="Langkah 2 dari 3" />

              {/* ── Assign popup (terbesar / terkecil) ── */}
              <AnimatePresence>
                {assignPopup !== null && (
                  <div style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11, 30, 44, 0.8)', backdropFilter: 'blur(6px)' }}>
                    <motion.div
                      initial={{ scale: 0.88, opacity: 0, y: 16 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.88, opacity: 0, y: 16 }}
                      transition={{ type: 'spring', damping: 22, stiffness: 350 }}
                      style={{ background: 'rgba(10,10,22,0.98)', border: '2px solid var(--accent)', borderRadius: '22px', padding: '28px 24px', maxWidth: '320px', width: '90%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 0 30px rgba(99,102,241,0.15)' }}
                    >
                      <div style={{ fontSize: '32px' }}>🎯</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC' }}>
                        Jadikan nilai{' '}
                        <span style={{ color: 'var(--accent)', fontSize: '24px', fontWeight: 900, fontFamily: 'var(--font-data)' }}>{assignPopup}</span>{' '}
                        sebagai...
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleAssign('terbesar')}
                          style={{
                            flex: 1,
                            padding: '10px 6px',
                            fontSize: '12px',
                            fontWeight: 800,
                            borderRadius: '12px',
                            minHeight: 'auto',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            background: popupSelection === 'terbesar' ? ACC : `${ACC}1a`,
                            border: popupSelection === 'terbesar' ? `2.5px solid #fff` : `1.5px solid ${ACC}44`,
                            color: popupSelection === 'terbesar' ? '#000' : '#a5b4fc',
                            boxShadow: popupSelection === 'terbesar' ? `0 0 15px ${ACC}` : 'none',
                          }}
                        >
                          📈 Nilai Terbesar
                        </button>
                        <button
                          onClick={() => handleAssign('terkecil')}
                          style={{
                            flex: 1,
                            padding: '10px 6px',
                            fontSize: '12px',
                            fontWeight: 800,
                            borderRadius: '12px',
                            minHeight: 'auto',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            background: popupSelection === 'terkecil' ? GREEN : `${GREEN}1a`,
                            border: popupSelection === 'terkecil' ? `2.5px solid #fff` : `1.5px solid ${GREEN}44`,
                            color: popupSelection === 'terkecil' ? '#000' : GREEN,
                            boxShadow: popupSelection === 'terkecil' ? `0 0 15px ${GREEN}` : 'none',
                          }}
                        >
                          📉 Nilai Terkecil
                        </button>
                      </div>
                      <button
                        onClick={() => setAssignPopup(null)}
                        style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        ← Lanjut eksplorasi dulu {!isMobile && '(Esc)'}
                      </button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>


              {/* ── Main workspace: Responsive split ── */}
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '8px', borderRadius: '12px', border: '1px solid rgba(180,140,80,0.1)', overflow: 'hidden' }}>

                {/* ─── LEFT: Maze canvas ─── */}
                <div
                  ref={mapRef}
                  style={{ flex: isMobile ? 'none' : 4, height: isMobile ? '230px' : '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 12, border: '1px solid rgba(180,140,80,0.08)', minHeight: 0, position: 'relative' }}
                >
                  {/* Legend Panel */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(6, 7, 9, 0.9)',
                    border: '1.5px solid rgba(0, 173, 181, 0.25)',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    fontSize: '9.5px',
                    color: '#E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    zIndex: 25,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.65), 0 0 10px rgba(0, 173, 181, 0.1)',
                    pointerEvents: 'none',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                  }}>
                    <div style={{ fontWeight: 800, color: '#00ADB5', fontSize: '9px', letterSpacing: '0.5px', borderBottom: '1px solid rgba(0,173,181,0.2)', paddingBottom: '3px', marginBottom: '2px', textTransform: 'uppercase' }}>
                      📋 LEGENDA NODE
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(180,140,80,0.05)' }}></span>
                      <span>Belum Dipilih</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ display: 'inline-flex', width: '7.5px', height: '7.5px', borderRadius: '50%', background: '#00ADB5', alignItems: 'center', justifyContent: 'center', color: '#060709', fontSize: '5.5px', fontWeight: 'bold' }}>✓</span>
                      <span>Nilai Terkecil (Min)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ display: 'inline-flex', width: '7.5px', height: '7.5px', borderRadius: '50%', background: '#6366F1', alignItems: 'center', justifyContent: 'center', color: '#060709', fontSize: '5.5px', fontWeight: 'bold' }}>✓</span>
                      <span>Nilai Terbesar (Max)</span>
                    </div>
                  </div>

                  {/* Collision Red Flash Overlay */}
                  <AnimatePresence>
                    {collisionFlash && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(239, 68, 68, 0.25)',
                          zIndex: 30,
                          pointerEvents: 'none',
                          borderRadius: 12,
                        }}
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    animate={isShaking ? {
                      x: [-4, 4, -3, 3, -1, 1, 0],
                      y: [-2, 2, -1, 1, 0]
                    } : {}}
                    transition={{ duration: 0.35 }}
                    style={{ width: '100%', maxHeight: '100%', aspectRatio: `${RENTANG_VW}/${RENTANG_VH}`, position: 'relative' }}
                  >
                    <svg viewBox={`0 0 ${RENTANG_VW} ${RENTANG_VH}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', display: 'block' }}>
                      {/* Static Maze Background */}
                      <MazeBackground visitedCells={visitedCells} />

                      {/* Avatar glow light overlay (Revisi 2) */}
                      <defs>
                        <radialGradient id="avatar-light" cx={charPos.x} cy={charPos.y} r={33} fx={charPos.x} fy={charPos.y} gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
                          <stop offset="35%" stopColor="#000000" stopOpacity="0.1" />
                          <stop offset="70%" stopColor="#060709" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#060709" stopOpacity="0.85" />
                        </radialGradient>
                      </defs>
                      <rect width={RENTANG_VW} height={RENTANG_VH} fill="url(#avatar-light)" pointerEvents="none" />

                      {/* Data nodes */}
                      {RENTANG_MAZE_NODES.map(node => {
                        const isTakenMax = node.val === mazeMax
                        const isTakenMin = node.val === mazeMin
                        const isTaken = isTakenMax || isTakenMin
                        const isNear = nearNode === node.val && !isTaken && assignPopup === null
                        const nx = RENTANG_CX(node.col)
                        const ny = RENTANG_CY(node.row)

                        return (
                          <g key={node.val} style={{ cursor: isTaken ? 'default' : 'pointer' }}
                            onClick={() => { if (!isTaken && assignPopup === null) setAssignPopup(node.val) }}>
                            {/* Glow if near */}
                            {isNear && (
                              <circle cx={nx} cy={ny} r={8} fill={`${ACC}18`} stroke={`${ACC}55`} strokeWidth={0.5} />
                            )}

                            {/* Node circle */}
                            <circle
                              cx={nx}
                              cy={ny}
                              r={3.8}
                              fill={isTakenMax ? `${ACC}33` : isTakenMin ? `${GREEN}22` : isNear ? `${ACC}1f` : 'rgba(180,140,80,0.1)'}
                              stroke={isTakenMax ? ACC : isTakenMin ? GREEN : isNear ? '#fff' : 'rgba(255,255,255,0.2)'}
                              strokeWidth={isNear ? 0.7 : 0.5}
                              opacity={isTaken ? 0.45 : 1}
                              style={{ transition: 'all 0.25s' }}
                            />

                            {/* Node text / solved checkmark badge */}
                            {isTaken ? (
                              <g>
                                <circle cx={nx} cy={ny} r={2.8} fill={isTakenMax ? ACC : GREEN} />
                                <text
                                  x={nx}
                                  y={ny + 0.4}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fontSize={3.6}
                                  fontWeight="900"
                                  fill="#060709"
                                  fontFamily="var(--font-data)"
                                >
                                  ✓
                                </text>
                              </g>
                            ) : (
                              <text
                                x={nx}
                                y={ny + 0.4}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={3.2}
                                fontWeight="bold"
                                fill={isNear ? '#fff' : 'rgba(255,255,255,0.7)'}
                                fontFamily="var(--font-data)"
                              >
                                {node.val}
                              </text>
                            )}
                          </g>
                        )
                      })}

                      {/* Player character (self) */}
                      <PlayerCharacter
                        x={charPos.x}
                        y={charPos.y}
                        dir={moveDir}
                        size={14}
                        label="Kamu"
                      />

                      {/* Teammate characters — one per member, colored distinctly */}
                      {teamMembers && teamMembers.filter(m => m.id !== studentId).map((m, idx) => {
                        const pos = teammatePositions[m.id]
                        if (!pos) return null
                        const color = PLAYER_COLORS[(idx + 1) % PLAYER_COLORS.length]
                        return (
                          <g key={m.id}>
                            <defs>
                              <radialGradient id={`cg-tm-${m.id}`} cx="35%" cy="35%" r="65%">
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="60%" stopColor={color} />
                                <stop offset="100%" stopColor={color} />
                              </radialGradient>
                              <filter id={`glow-tm-${m.id}`} x="-80%" y="-80%" width="260%" height="260%">
                                <feGaussianBlur stdDeviation="1.0" result="b" />
                                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                              </filter>
                            </defs>
                            <circle cx={pos.x} cy={pos.y} r={2.2} fill={`url(#cg-tm-${m.id})`} filter={`url(#glow-tm-${m.id})`} opacity={0.85} />
                            <text x={pos.x} y={pos.y - 4} textAnchor="middle" fontSize={2.4} fill={color} fontFamily="var(--font-data)" opacity={0.9}>
                              {m.name.split(' ')[0]}
                            </text>
                          </g>
                        )
                      })}

                      {/* Monsters / Glitch obstacles */}
                      {monsterPositions.map(m => (
                        <g key={m.id}>
                          {/* Outer glowing noise block */}
                          <rect x={m.x - 4.8} y={m.y - 4.8} width={9.6} height={9.6} fill="#ff007f" opacity={0.3} />
                          {/* Inner dark glitch core */}
                          <rect x={m.x - 2.8} y={m.y - 2.8} width={5.6} height={5.6} fill="#ff0000" />
                          {/* Central pixel spike */}
                          <rect x={m.x - 1.5} y={m.y - 1.5} width={3} height={3} fill="#ffffff" />
                          {/* Glitch noise particles */}
                          <rect x={m.x - 5.5 + Math.sin(m.x * 2) * 0.5} y={m.y - 1.5} width={1} height={1} fill="#ff007f" />
                          <rect x={m.x + 4.5 + Math.cos(m.x * 2) * 0.5} y={m.y + 1.5} width={1} height={1} fill="#ff0000" />
                        </g>
                      ))}

                      {/* Start marker */}
                      {charPos.x === RENTANG_CX(1) && charPos.y === RENTANG_CY(1) && (
                        <text x={RENTANG_CX(1)} y={RENTANG_CY(1) - 5} textAnchor="middle" fontSize={2.8} fill="rgba(255,255,255,0.4)" fontFamily="monospace">START</text>
                      )}
                    </svg>

                    {/* Mobile node pickup button overlay */}
                    <AnimatePresence>
                      {nearNode !== null && assignPopup === null && (
                        <motion.button
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          onClick={() => setAssignPopup(nearNode)}
                          style={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            zIndex: 20,
                            background: ACC,
                            color: '#fff',
                            border: 'none',
                            borderRadius: 20,
                            padding: '6px 12px',
                            fontSize: 10,
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: `0 0 10px ${ACC}`,
                          }}
                        >
                          📥 Ambil Angka {nearNode}
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {/* Top-right: control hint */}
                    <div style={{ position: 'absolute', top: '8px', right: '10px', fontSize: '11px', color: '#A8A29E', fontWeight: 700, lineHeight: 1.5, textAlign: 'right' }}>
                      ⌨ Arrow keys<br />🕹 Joystick
                    </div>

                    {/* Joystick (bottom-left, touch) */}
                    <MazeJoystick onDir={(x, y) => { dirRef.current = { x, y } }} />

                    {/* D-Pad (bottom-right, desktop) */}
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'grid', gridTemplateColumns: 'repeat(3, 28px)', gridTemplateRows: 'repeat(2, 28px)', gap: '3px', zIndex: 20 }}>
                      <div />
                      <DPadBtn label="↑" onActivate={() => { dirRef.current = { x: 0, y: -1 } }} onRelease={() => { dirRef.current = { x: 0, y: 0 } }} />
                      <div />
                      <DPadBtn label="←" onActivate={() => { dirRef.current = { x: -1, y: 0 } }} onRelease={() => { dirRef.current = { x: 0, y: 0 } }} />
                      <DPadBtn label="↓" onActivate={() => { dirRef.current = { x: 0, y: 1 } }} onRelease={() => { dirRef.current = { x: 0, y: 0 } }} />
                      <DPadBtn label="→" onActivate={() => { dirRef.current = { x: 1, y: 0 } }} onRelease={() => { dirRef.current = { x: 0, y: 0 } }} />
                    </div>
                  </motion.div>
                </div>

                {/* ─── RIGHT: Formula panel ─── */}
                <div style={{
                  flex: isMobile ? 'none' : 1.2,
                  width: '100%',
                  display: 'flex',
                  flexDirection: isMobile ? 'row' : 'column',
                  alignItems: 'center',
                  justifyContent: isMobile ? 'space-around' : 'center',
                  gap: '10px',
                  padding: '12px',
                  minWidth: 0,
                  background: isMobile ? 'rgba(10, 10, 22, 0.4)' : 'transparent',
                  borderTop: isMobile ? '1px solid rgba(180,140,80,0.1)' : 'none'
                }}>
                  {!isMobile && (
                    <div style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      background: 'rgba(11, 30, 44, 0.4)',
                      border: '1px solid rgba(180,140,80,0.15)',
                      borderRadius: '16px',
                      padding: '12px 10px',
                      maxHeight: '230px',
                      boxSizing: 'border-box',
                      marginBottom: '4px'
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: '#00ADB5', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        📊 DATA TERKUMPUL (35)
                      </div>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        overflowY: 'auto',
                        flex: 1,
                        paddingRight: '2px'
                      }}>
                        {screenTimeData.map((val: number, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: 'rgba(0, 173, 181, 0.08)',
                              border: '1px solid rgba(0, 173, 181, 0.35)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: 800,
                              color: '#FFFFFF',
                              fontFamily: 'var(--font-data)',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {val}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isMobile && (
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                      📐 RUMUS RENTANG
                    </div>
                  )}

                  <div style={{
                    background: isMobile ? 'transparent' : `${ACC}0c`,
                    border: isMobile ? 'none' : `1px solid ${ACC}2a`,
                    borderRadius: '14px',
                    padding: isMobile ? '0px' : '12px 10px',
                    width: isMobile ? 'auto' : '100%',
                    flex: isMobile ? 1 : 'none',
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: isMobile ? '12px' : '10px'
                  }}>
                    {!isMobile && (
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#a5b4fc', textAlign: 'center' }}>
                        R = terbesar − terkecil
                      </div>
                    )}

                    {/* Terbesar slot */}
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: 'center', gap: '6px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>
                        {isMobile ? 'MAX:' : 'NILAI TERBESAR'}
                      </div>
                      <motion.div
                        animate={mazeMax !== null ? { scale: [1, 1.12, 1] } : {}}
                        transition={{ duration: 0.35 }}
                        style={{
                          width: isMobile ? '48px' : '100%', height: isMobile ? '32px' : '42px', borderRadius: '10px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: mazeMax !== null ? `${ACC}1f` : 'rgba(217,119,6,0.06)',
                          border: mazeMax !== null ? `2.5px solid ${ACC}66` : '2px dashed rgba(255,255,255,0.14)',
                          fontSize: isMobile ? '16px' : 'clamp(18px, 3vh, 24px)', fontWeight: 900,
                          color: mazeMax !== null ? '#fff' : 'rgba(255,255,255,0.22)',
                          fontFamily: 'var(--font-data)',
                        }}
                      >
                        {mazeMax ?? '?'}
                      </motion.div>
                    </div>

                    {!isMobile && <div style={{ textAlign: 'center', fontSize: '16px', color: '#78716C', fontFamily: 'var(--font-data)', lineHeight: 1 }}>−</div>}

                    {/* Terkecil slot */}
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: 'center', gap: '6px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>
                        {isMobile ? 'MIN:' : 'NILAI TERKECIL'}
                      </div>
                      <motion.div
                        animate={mazeMin !== null ? { scale: [1, 1.12, 1] } : {}}
                        transition={{ duration: 0.35 }}
                        style={{
                          width: isMobile ? '48px' : '100%', height: isMobile ? '32px' : '42px', borderRadius: '10px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: mazeMin !== null ? `${GREEN}18` : 'rgba(217,119,6,0.06)',
                          border: mazeMin !== null ? `2px solid ${GREEN}55` : '2px dashed rgba(255,255,255,0.14)',
                          fontSize: isMobile ? '16px' : 'clamp(18px, 3vh, 24px)', fontWeight: 900,
                          color: mazeMin !== null ? GREEN : 'rgba(255,255,255,0.22)',
                          fontFamily: 'var(--font-data)',
                        }}
                      >
                        {mazeMin ?? '?'}
                      </motion.div>
                    </div>

                    {/* = R (live preview) */}
                    <AnimatePresence>
                      {mazeMax !== null && mazeMin !== null && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: 'center', gap: '4px' }}
                        >
                          <div style={{ fontSize: '14px', color: '#78716C', fontFamily: 'var(--font-data)' }}>=</div>
                          <div style={{ fontSize: isMobile ? '18px' : 'clamp(22px, 3.8vh, 32px)', fontWeight: 900, color: rentangDone ? GREEN : '#fff', fontFamily: 'var(--font-data)', textShadow: rentangDone ? `0 0 12px ${GREEN}` : 'none', transition: 'color 0.3s' }}>
                            {isMobile ? `R: ${mazeMax - mazeMin}` : (mazeMax - mazeMin)}
                          </div>
                          {!isMobile && rentangDone && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: '13px', color: GREEN, fontWeight: 800 }}>✅ R = {CORRECT_R}</motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action Button moved here */}
                  <div style={{ width: isMobile ? 'auto' : '100%', minWidth: isMobile ? '120px' : 'auto' }}>
                    {rentangDone ? (
                      <button
                        className="game-btn game-btn-primary"
                        onClick={() => {
                          if (initialSub === 'intro') {
                            onComplete()
                          } else {
                            navigateTo('banyak-kelas')
                          }
                        }}
                        style={{ width: '100%', padding: '10px 14px', fontSize: '13px', fontWeight: 800, boxShadow: 'var(--accent-glow)', marginTop: isMobile ? 0 : '4px' }}
                      >
                        Lanjut →
                      </button>
                    ) : (
                      <button
                        className="game-btn game-btn-primary"
                        onClick={handleConfirmRentang}
                        disabled={mazeMax === null || mazeMin === null}
                        style={{
                          width: '100%', padding: '10px 14px', fontSize: '13px', fontWeight: 800,
                          opacity: mazeMax !== null && mazeMin !== null ? 1 : 0.45,
                          cursor: mazeMax !== null && mazeMin !== null ? 'pointer' : 'not-allowed',
                          marginTop: isMobile ? 0 : '4px'
                        }}
                      >
                        {mazeMax !== null && mazeMin !== null
                          ? 'Konfirmasi →'
                          : 'Eksplorasi...'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ══ BANYAK KELAS — NPath Game ══════════════════════════════════════ */}
          {sub === 'banyak-kelas' && (
            <>
              <StepHeader step={1} title="Mencari Nilai n" subtitle="Langkah 1 dari 3 — Eksplorasi Ruangan" />
              {/* Real-time teammate presence */}
              {isFD && Object.values(rtPlayers).length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  {Object.values(rtPlayers).map(p => (
                    <span key={p.studentId} style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '50px',
                      background: `${p.color}20`, border: `1px solid ${p.color}50`, color: p.color,
                    }}>
                      👤 {p.name.split(' ')[0]} · {p.sub === 'banyak-kelas' ? '📍 Halaman ini' : `📌 ${p.sub ?? '...'}`}
                    </span>
                  ))}
                </div>
              )}

              {/* NPath game fills remaining space */}
              <div style={{
                flex: 1, minHeight: 0,
                borderRadius: '14px',
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
              }}>
                <NPath
                  isFD={isFD}
                  onComplete={() => {
                    setNVal(String(CORRECT_N))
                    setNDone(true)
                    setTimeout(() => navigateTo('panjang-kelas'), 400)
                  }}
                />
              </div>
            </>
          )}

          {/* ══ PANJANG KELAS ══════════════════════════════════════════════════ */}
          {sub === 'panjang-kelas' && (
            <>
              <StepHeader step={3} title="Panjang Kelas (P)" subtitle="Langkah 3 dari 3" />
              {/* Real-time teammate presence */}
              {isFD && Object.values(rtPlayers).length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  {Object.values(rtPlayers).map(p => (
                    <span key={p.studentId} style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '50px',
                      background: `${p.color}20`, border: `1px solid ${p.color}50`, color: p.color,
                    }}>
                      👤 {p.name.split(' ')[0]} · {p.sub === 'panjang-kelas' ? '📍 Halaman ini' : `📌 ${p.sub ?? '...'}`}
                    </span>
                  ))}
                </div>
              )}

              {/* Two-column layout: agent left, formula right */}
              <div style={{
                flex: 1, minHeight: 0, display: 'flex', flexDirection: 'row', gap: '10px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.012)',
                border: '1px solid rgba(180,140,80,0.1)',
                padding: '10px',
                overflow: 'hidden',
              }}>
                {/* Left: Agent Sidebar */}
                <AgentSidebar
                  message={`Keren! Tadi kita sudah dapat Rentang R = ${CORRECT_R} dan Banyak Kelas K = ${CORRECT_K}. Sekarang tinggal bagi keduanya untuk dapat Panjang Kelas P! 📐`}
                  isMobile={isMobile}
                />

                {/* Right: Formula area */}
                <div style={{
                  flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '14px',
                  minWidth: 0,
                }}>
                  {/* Formula card */}
                  <div style={{
                    background: `${ACC}0c`, border: `1px solid ${ACC}2a`, borderRadius: '14px',
                    padding: '18px 22px', width: '100%', maxWidth: '440px',
                    display: 'flex', flexDirection: 'column', gap: '14px',
                  }}>
                    <div style={{ fontSize: 'clamp(14px, 2.2vh, 18px)', fontWeight: 800, color: '#a5b4fc', textAlign: 'center' }}>
                      P = Rentang (R) ÷ Banyak Kelas (K)
                    </div>

                    {/* Input row with drag slots */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 'clamp(16px, 2.8vh, 22px)', fontWeight: 900, color: '#a5b4fc', fontFamily: 'var(--font-data)' }}>P =</span>

                      {/* Slot R (Rentang) */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }} title={`R = ${CORRECT_R}: Rentang (didapat dari hasil Langkah 2)`}>
                        <div
                          ref={slotRRef}
                          style={{
                            width: 'clamp(54px, 7vw, 76px)',
                            height: '42px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: pkDone ? `${GREEN}12` : pkR ? 'rgba(14, 131, 136, 0.12)' : 'rgba(255,255,255,0.03)',
                            border: pkDone ? `1.5px solid ${GREEN}55` : pkR ? `1.5px solid var(--accent)` : '2px dashed rgba(255,255,255,0.18)',
                            color: pkDone ? GREEN : pkR ? '#fff' : 'rgba(255,255,255,0.22)',
                            fontFamily: 'var(--font-data)',
                            fontSize: '20px',
                            fontWeight: 800,
                            boxShadow: pkR && !pkDone ? '0 0 10px rgba(0, 173, 181, 0.2)' : 'none',
                            transition: 'all 0.2s',
                            cursor: 'help',
                          }}
                        >
                          {pkR || 'R'}
                        </div>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rentang</span>
                      </div>

                      <span style={{ fontSize: 'clamp(22px, 3.8vh, 32px)', color: '#78716C', fontFamily: 'var(--font-data)' }}>÷</span>

                      {/* Slot K (Banyak Kelas) */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }} title={`K = ${CORRECT_K}: Banyak Kelas (didapat dari hasil Langkah 1)`}>
                        <div
                          ref={slotKRef}
                          style={{
                            width: 'clamp(54px, 7vw, 76px)',
                            height: '42px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: pkDone ? `${GREEN}12` : pkK ? 'rgba(129, 140, 248, 0.12)' : 'rgba(255,255,255,0.03)',
                            border: pkDone ? `1.5px solid ${GREEN}55` : pkK ? `1.5px solid #818cf8` : '2px dashed rgba(255,255,255,0.18)',
                            color: pkDone ? GREEN : pkK ? '#fff' : 'rgba(255,255,255,0.22)',
                            fontFamily: 'var(--font-data)',
                            fontSize: '20px',
                            fontWeight: 800,
                            boxShadow: pkK && !pkDone ? '0 0 10px rgba(129, 140, 248, 0.2)' : 'none',
                            transition: 'all 0.2s',
                            cursor: 'help',
                          }}
                        >
                          {pkK || 'K'}
                        </div>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Banyak Kelas</span>
                      </div>
                    </div>

                    {/* Explanatory notes removed - replaced by tooltips on slot dropzones */}

                    {/* Computed breakdown */}
                    {pkDone && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' }}
                      >
                        {[
                          `= ${CORRECT_R} ÷ ${CORRECT_K}`,
                          `= 2,833...`,
                          `≈ 3`,
                        ].map((line, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{ fontSize: '14px', color: i < 2 ? '#78716C' : 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-data)', fontWeight: 800 }}
                          >
                            {line}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Draggable source badges container */}
                  {!pkDone && (
                    <div style={{
                      display: 'flex', gap: '16px', justifyContent: 'center',
                      padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)',
                      borderRadius: '14px', width: '100%', maxWidth: '440px', boxSizing: 'border-box',
                      touchAction: 'none'
                    }}>
                      {/* Draggable R card */}
                      {!pkR ? (
                        <motion.div
                          drag
                          dragSnapToOrigin
                          dragMomentum={false}
                          dragElastic={0.08}
                          onDragEnd={handleDragEndR}
                          animate={{
                            boxShadow: [
                              '0 4px 14px rgba(0, 173, 181, 0.25)',
                              '0 4px 22px rgba(0, 173, 181, 0.6)',
                              '0 4px 14px rgba(0, 173, 181, 0.25)'
                            ],
                            y: [0, -3, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            repeatType: "mirror",
                            duration: 2,
                            ease: "easeInOut"
                          }}
                          style={{
                            width: '130px', height: '60px', borderRadius: '10px',
                            background: 'var(--accent)', color: '#fff',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            cursor: 'grab', zIndex: 30, position: 'relative',
                            border: '1.5px solid rgba(255,255,255,0.2)',
                          }}
                          whileHover={{ scale: 1.06, cursor: 'grab', boxShadow: '0 8px 24px rgba(0, 173, 181, 0.5)' }}
                          whileTap={{ scale: 0.94, cursor: 'grabbing' }}
                        >
                          <div style={{ position: 'absolute', left: '10px', fontSize: '14px', opacity: 0.6, userSelect: 'none' }}>⠿</div>
                          <div style={{ paddingLeft: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-data)' }}>{CORRECT_R}</span>
                            <span style={{ fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.85, letterSpacing: '0.3px' }}>Rentang (R)</span>
                          </div>
                        </motion.div>
                      ) : (
                        <div style={{ width: '130px', height: '60px', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>R Terpasang</div>
                      )}

                      {/* Draggable K card */}
                      {!pkK ? (
                        <motion.div
                          drag
                          dragSnapToOrigin
                          dragMomentum={false}
                          dragElastic={0.08}
                          onDragEnd={handleDragEndK}
                          animate={{
                            boxShadow: [
                              '0 4px 14px rgba(129, 140, 248, 0.25)',
                              '0 4px 22px rgba(129, 140, 248, 0.6)',
                              '0 4px 14px rgba(129, 140, 248, 0.25)'
                            ],
                            y: [0, -3, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            repeatType: "mirror",
                            duration: 2,
                            ease: "easeInOut",
                            delay: 0.5
                          }}
                          style={{
                            width: '130px', height: '60px', borderRadius: '10px',
                            background: '#818cf8', color: '#fff',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            cursor: 'grab', zIndex: 30, position: 'relative',
                            border: '1.5px solid rgba(255,255,255,0.2)',
                          }}
                          whileHover={{ scale: 1.06, cursor: 'grab', boxShadow: '0 8px 24px rgba(129, 140, 248, 0.5)' }}
                          whileTap={{ scale: 0.94, cursor: 'grabbing' }}
                        >
                          <div style={{ position: 'absolute', left: '10px', fontSize: '14px', opacity: 0.6, userSelect: 'none' }}>⠿</div>
                          <div style={{ paddingLeft: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-data)' }}>{CORRECT_K}</span>
                            <span style={{ fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.85, letterSpacing: '0.3px' }}>Banyak Kelas (K)</span>
                          </div>
                        </motion.div>
                      ) : (
                        <div style={{ width: '130px', height: '60px', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>K Terpasang</div>
                      )}
                    </div>
                  )}

                  {/* Result */}
                  {pkDone && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <ResultBadge value="P ≈ 3" />
                      <div style={{ fontSize: '13px', color: `${GREEN}bb`, fontWeight: 700 }}>
                        {CORRECT_R}/{CORRECT_K} = 2,833 → dibulatkan ke atas menjadi <strong style={{ color: GREEN, fontSize: '15px' }}>3</strong>
                      </div>
                    </div>
                  )}

                  {/* Summary row (after done) */}
                  {pkDone && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      style={{
                        display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center',
                      }}
                    >
                      {[
                        { label: 'R', value: String(CORRECT_R), icon: '📏' },
                        { label: 'K', value: String(CORRECT_K), icon: '📊' },
                        { label: 'P', value: '≈ 3', icon: '📐' },
                      ].map(({ label, value, icon }) => (
                        <div key={label} style={{
                          padding: '8px 16px', borderRadius: '12px',
                          background: `${GREEN}0f`, border: `1.5px solid ${GREEN}33`,
                          display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                          <span style={{ fontSize: '14px' }}>{icon}</span>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: `${GREEN}bb` }}>{label} =</span>
                          <span style={{ fontSize: '16px', fontWeight: 900, color: GREEN, fontFamily: 'var(--font-data)' }}>{value}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              <HintToast hint={pkHint} />

              {/* Action */}
              {pkDone ? (
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Ready indicator (FD only) */}
                  {teamId && teamMembers && myVotedGates.has('gate_formula_done') && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {teamMembers.map(m => {
                        const voted = (gateVotes['gate_formula_done'] ?? []).includes(m.id) || (m.id === studentId && myVotedGates.has('gate_formula_done'))
                        return (
                          <span key={m.id} style={{
                            fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '50px',
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
                    onClick={castFormulaDoneVote}
                    style={{ width: '100%', padding: '11px 16px', fontSize: '14px', fontWeight: 800, boxShadow: 'var(--accent-glow)', opacity: (teamId && myVotedGates.has('gate_formula_done')) ? 0.6 : 1 }}
                  >
                    {teamId && myVotedGates.has('gate_formula_done')
                      ? `⏳ Menunggu ${Math.max(0, 2 - (gateVotes['gate_formula_done']?.length ?? 1))} anggota lagi...`
                      : '🎯 Selesai — Mulai Investigasi →'
                    }
                  </button>
                </div>

              ) : (
                <button
                  className="game-btn game-btn-primary"
                  onClick={checkPK}
                  disabled={!pkR.trim() || !pkK.trim()}
                  style={{
                    flexShrink: 0, width: '100%', padding: '11px 16px', fontSize: '14px', fontWeight: 800,
                    opacity: pkR.trim() && pkK.trim() ? 1 : 0.4,
                    cursor: pkR.trim() && pkK.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Cek Jawaban →
                </button>
              )}
            </>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}
