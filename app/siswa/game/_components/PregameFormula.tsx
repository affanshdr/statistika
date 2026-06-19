'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { screenTimeData, STATS } from '../_data/level1'
import { useGameStore } from '@/lib/store/gameStore'
import DiraPopup, { DiraPopupStep } from './DiraPopup'

// ─── Constants ───────────────────────────────────────────────────────────────
const CORRECT_MAX = Math.max(...screenTimeData)  // 18
const CORRECT_MIN = Math.min(...screenTimeData)  // 1
const CORRECT_R   = CORRECT_MAX - CORRECT_MIN   // 17
const CORRECT_N   = STATS.n                     // 35
const CORRECT_K   = 6                           // 1 + 3.3 * log10(35) ≈ 6.09 → 6
const ACC        = '#6366F1'
const GREEN      = '#4ade80'
const RED        = '#EF4444'
const MAZE_SPEED = 0.32 // % per frame at ~60fps

// 12 maze nodes — strategically placed, includes min=1 and max=18
const MAZE_NODES = [
  { val: 1,  x: 7,  y: 35 },
  { val: 3,  x: 23, y: 55 },
  { val: 4,  x: 39, y: 83 },
  { val: 5,  x: 13, y: 27 },
  { val: 7,  x: 51, y: 68 },
  { val: 9,  x: 27, y: 13 },
  { val: 11, x: 57, y: 37 },
  { val: 13, x: 73, y: 73 },
  { val: 15, x: 62, y: 19 },
  { val: 17, x: 82, y: 48 },
  { val: 18, x: 88, y: 14 },
  { val: 10, x: 44, y: 46 },
] as const

type SubScreen = 'intro' | 'rentang' | 'banyak-kelas' | 'panjang-kelas'
type SlotKey   = 'terbesar' | 'terkecil'
interface Props { onComplete: () => void }

// ─── Agent Sidebar (left panel for step 2 & 3) ──────────────────────────────
function AgentSidebar({ message }: { message: string }) {
  return (
    <div
      style={{
        width: 'clamp(110px, 32%, 180px)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px',
        padding: '6px',
        boxSizing: 'border-box',
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
          borderRadius: '18px 18px 4px 18px',
          padding: 'clamp(10px, 1.8vh, 14px) clamp(12px, 2vw, 16px)',
          fontSize: 'clamp(11px, 1.85vh, 13px)',
          lineHeight: 1.55,
          color: 'var(--text-primary)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px' }}>
            DIRA
          </span>
        </div>
        <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>
          {message}
        </p>
      </motion.div>

      {/* Avatar */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 400, damping: 20 }}
        style={{
          width: 'clamp(44px, 8vh, 60px)',
          height: 'clamp(44px, 8vh, 60px)',
          borderRadius: '50%',
          border: '2px solid var(--accent)',
          boxShadow: 'var(--accent-glow)',
          overflow: 'hidden',
          background: 'var(--game-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '8px',
        }}
      >
        <img
          src="https://tmdbqikqflbeqaqllxge.supabase.co/storage/v1/object/public/Asset/Agent.png"
          onError={(e) => { e.currentTarget.src = '/dira-avatar.png' }}
          alt="Dira"
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
        />
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
              i < step  ? GREEN :
              i === step ? '#a5b4fc' :
              'rgba(255,255,255,0.15)',
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vh, 14px)', flexShrink: 0 }}>
      <div style={{
        width: 'clamp(26px, 5vh, 40px)', height: 'clamp(26px, 5vh, 40px)', borderRadius: '50%', flexShrink: 0,
        background: `${ACC}33`, border: `1.5px solid ${ACC}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 'clamp(11px, 2vh, 16px)', fontWeight: 900, color: '#a5b4fc',
      }}>{step}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'clamp(13px, 2.6vh, 20px)', fontWeight: 800, color: '#fff' }}>{title}</div>
        <div style={{ fontSize: 'clamp(9px, 1.5vh, 12px)', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase' }}>{subtitle}</div>
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
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.22)',
        cursor: 'pointer', userSelect: 'none', touchAction: 'none',
        color: 'rgba(255,255,255,0.8)',
        transition: 'background 0.1s',
      }}
      onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.style.background = 'rgba(99,102,241,0.4)'; onActivate() }}
      onPointerUp={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; onRelease() }}
      onPointerCancel={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; onRelease() }}
    >
      {label}
    </div>
  )
}

// ─── Virtual Joystick ────────────────────────────────────────────────────────
function MazeJoystick({ onDir }: { onDir: (x: number, y: number) => void }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const knobRef  = useRef<HTMLDivElement>(null)
  const active   = useRef(false)
  const OUTER_R  = 36

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
        background: 'rgba(255,255,255,0.07)',
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
const INTRO_TEXT = 'Sebelum membuat tabel frekuensi, kamu perlu menghitung 3 hal penting terlebih dahulu — Rentang, Banyak Kelas, dan Panjang Kelas. Kita selesaikan satu per satu, yuk! 🧮'

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

// ─── Main component ───────────────────────────────────────────────────────────
export default function PregameFormula({ onComplete }: Props) {
  const cognitiveStyle = useGameStore(s => s.cognitiveStyle)
  const isFD = cognitiveStyle === 'FD'

  const [sub, setSub] = useState<SubScreen>('intro')
  const [introDone, setIntroDone] = useState(false)

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── DiRA Popup state ─────────────────────────────────────────────────────
  const [diraPopupStep, setDiraPopupStep] = useState<DiraPopupStep | null>(null)
  const [showFDIntroPopup, setShowFDIntroPopup] = useState(false)
  // Track which steps have already shown popup (show only once each)
  // 'intro' excluded — the new Agent dialog handles intro messaging
  const shownSteps = useRef<Set<SubScreen>>(new Set(['intro']))

  const navigateTo = useCallback((next: SubScreen) => {
    setSub(next)
    if (!shownSteps.current.has(next)) {
      shownSteps.current.add(next)
      // Small delay so the screen transition plays first
      if (next === 'rentang' && isFD) {
        setShowFDIntroPopup(true)
      } else {
        setTimeout(() => setDiraPopupStep(next as DiraPopupStep), 350)
      }
    }
  }, [isFD])

  // ── Flash overlay (FI error) ─────────────────────────────────────────────
  const [flashScreen, setFlashScreen] = useState(false)
  const triggerFlash = useCallback(() => {
    setFlashScreen(true)
    setTimeout(() => setFlashScreen(false), 500)
  }, [])

  // ── Maze / Labirin state (Rentang step) ──────────────────────────────────
  const [charPos, setCharPos]     = useState({ x: 12, y: 50 })
  const [mazeMax, setMazeMax]     = useState<number | null>(null)
  const [mazeMin, setMazeMin]     = useState<number | null>(null)
  const [nearNode, setNearNode]   = useState<number | null>(null)
  const [assignPopup, setAssignPopup] = useState<number | null>(null)
  const nearNodeRef = useRef<number | null>(null)
  nearNodeRef.current = nearNode
  const assignPopupRef = useRef<number | null>(null)
  assignPopupRef.current = assignPopup
  const showFDIntroPopupRef = useRef(showFDIntroPopup)
  showFDIntroPopupRef.current = showFDIntroPopup
  const [rentangDone, setRentangDone] = useState(false)
  const dirRef  = useRef({ x: 0, y: 0 })
  const animRef = useRef<number | null>(null)
  const mapRef  = useRef<HTMLDivElement>(null)

  const [popupSelection, setPopupSelection] = useState<'terbesar' | 'terkecil'>('terbesar')
  const popupSelectionRef = useRef<'terbesar' | 'terkecil'>('terbesar')
  popupSelectionRef.current = popupSelection

  useEffect(() => {
    if (assignPopup !== null) {
      dirRef.current = { x: 0, y: 0 }
      setPopupSelection('terbesar')
    }
  }, [assignPopup])

  // RAF movement loop
  useEffect(() => {
    if (sub !== 'rentang' || rentangDone) {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current)
      return
    }
    const tick = () => {
      const { x: dx, y: dy } = dirRef.current
      if (dx !== 0 || dy !== 0) {
        setCharPos(prev => ({
          x: Math.max(2, Math.min(98, prev.x + dx * MAZE_SPEED)),
          y: Math.max(2, Math.min(98, prev.y + dy * MAZE_SPEED)),
        }))
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
      ArrowUp:    { x: 0, y: -1 }, ArrowDown:  { x: 0, y: 1 },
      ArrowLeft:  { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
    }
    const held = new Set<string>()
    const update = () => {
      let nx = 0, ny = 0
      held.forEach(k => { const d = KEYS[k]; if (d) { nx += d.x; ny += d.y } })
      const len = Math.sqrt(nx * nx + ny * ny)
      dirRef.current = len > 0 ? { x: nx / len, y: ny / len } : { x: 0, y: 0 }
    }
    const down = (e: KeyboardEvent) => {
      if (showFDIntroPopupRef.current) {
        if (e.key === 'Enter') {
          e.preventDefault()
          setShowFDIntroPopup(false)
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
    const up   = (e: KeyboardEvent) => { held.delete(e.key); update() }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      dirRef.current = { x: 0, y: 0 }
    }
  }, [sub])

  // Proximity detection (runs after every position update)
  useEffect(() => {
    if (rentangDone || !mapRef.current) return
    const { width, height } = mapRef.current.getBoundingClientRect()
    if (!width || !height) return
    let closest: number | null = null
    let minDist = Infinity
    for (const n of MAZE_NODES) {
      const px = (n.x / 100) * width
      const py = (n.y / 100) * height
      const cx = (charPos.x / 100) * width
      const cy = (charPos.y / 100) * height
      const d = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2)
      if (d < 44 && d < minDist) { minDist = d; closest = n.val }
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
      // Re-show the tutorial popup as feedback; reset both slots
      setMazeMax(null)
      setMazeMin(null)
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

  // ── Banyak kelas state ───────────────────────────────────────────────────
  const [nVal, setNVal]       = useState('')
  const [nDone, setNDone]     = useState(false)
  const [nHint, setNHint]     = useState('')
  const [nShake, setNShake]   = useState(0)
  const [nErr, setNErr]       = useState(false)

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
  const [pkR, setPkR]       = useState('')
  const [pkK, setPkK]       = useState('')
  const [pkDone, setPkDone] = useState(false)
  const [pkHint, setPkHint] = useState('')
  const [pkShake, setPkShake] = useState(0)
  const [pkErr, setPkErr]   = useState(false)
  const [pkRErr, setPkRErr] = useState(false)   // only R input is wrong
  const [pkKErr, setPkKErr] = useState(false)   // only K input is wrong

  const checkPK = () => {
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
            background: 'rgba(3, 7, 18, 0.85)',
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
              style={{
                maxWidth: '700px',
                width: '100%',
                background: 'rgba(12, 12, 20, 0.98)',
                border: '2px solid var(--accent)',
                borderRadius: '20px',
                padding: 'clamp(12px, 2vh, 20px) clamp(12px, 2vw, 24px)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 255, 136, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(10px, 1.8vh, 16px)',
                position: 'relative',
              }}
            >
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
                <h3 style={{ margin: '0 0 6px 0', fontSize: 'clamp(15px, 2.8vh, 20px)', fontWeight: 900, color: '#fff' }}>
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
                      <span style={{ fontSize: 'clamp(11px, 1.9vh, 13px)', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '5px' }}>
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
                            background: isTarget ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                            color: isTarget ? '#000' : 'rgba(255,255,255,0.7)',
                            border: isTarget ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
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
                      <span style={{ fontSize: 'clamp(11px, 1.9vh, 13px)', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ color: '#4ade80' }}>📉</span> Contoh 2: Mencari Nilai Terkecil
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
                            background: isTarget ? '#4ade80' : 'rgba(255,255,255,0.05)',
                            color: isTarget ? '#000' : 'rgba(255,255,255,0.7)',
                            border: isTarget ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                            boxShadow: isTarget ? '0 0 10px #4ade80' : 'none',
                          }}>
                            {num}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: 'clamp(10px, 1.7vh, 12px)', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5 }}>
                      Angka <span style={{ color: '#4ade80', fontWeight: 800 }}>9</span> ditebalkan karena merupakan angka <strong style={{ color: '#4ade80' }}>terkecil</strong> dari kumpulan data tersebut.
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
                      src="https://tmdbqikqflbeqaqllxge.supabase.co/storage/v1/object/public/Asset/Agent.png"
                      onError={(e) => { e.currentTarget.src = '/dira-avatar.png' }}
                      alt="Dira"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{
                    textAlign: 'center',
                    fontSize: 'clamp(10px, 1.8vh, 12px)',
                    lineHeight: 1.55,
                    color: '#e2e8f0',
                    fontWeight: 600,
                  }}>
                    <p style={{ margin: '0 0 6px 0', color: 'var(--accent)', fontWeight: 800, fontSize: 'clamp(9px, 1.5vh, 11px)', letterSpacing: '0.5px' }}>
                      TIPS DARI DIRA
                    </p>
                    "Urutkan atau scan data dari kiri ke kanan untuk menemukan nilai tertinggi dan terendah secara cepat!"
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
                backgroundImage: 'linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)',
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
                  borderTop: '2px solid rgba(0, 255, 136, 0.3)',
                  borderLeft: '2px solid rgba(0, 255, 136, 0.3)',
                  borderRight: '2px solid rgba(0, 255, 136, 0.3)',
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
                  border: '2px solid rgba(0, 255, 136, 0.4)',
                  borderRadius: '0px 14px 14px 14px',
                  padding: 'clamp(14px, 2.5vh, 20px) clamp(16px, 3vw, 24px) clamp(12px, 2vh, 18px)',
                  boxShadow: '0 10px 25px rgba(0, 255, 136, 0.1), inset 0 0 20px rgba(0, 255, 136, 0.03)',
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
                      src="https://tmdbqikqflbeqaqllxge.supabase.co/storage/v1/object/public/Asset/Agent.png"
                      onError={(e) => { e.currentTarget.src = '/dira-avatar.png' }}
                      alt="Agent DIRA"
                      style={{ height: '100%', objectFit: 'contain' }}
                    />
                    {/* "Go!" speech bubble */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9, type: 'spring' }}
                      style={{
                        position: 'absolute',
                        top: '8%',
                        right: 'clamp(-28px, -4vw, -38px)',
                        background: 'rgba(10, 20, 15, 0.95)',
                        border: '2px solid var(--accent)',
                        borderRadius: '50%',
                        padding: 'clamp(4px, 0.8vh, 6px) clamp(8px, 1.5vw, 12px)',
                        fontWeight: 900,
                        fontSize: 'clamp(11px, 1.8vh, 15px)',
                        color: 'var(--accent)',
                        transform: 'rotate(12deg)',
                        boxShadow: '3px 3px 0px rgba(0, 255, 136, 0.3)',
                        fontFamily: '"Impact", "Arial Black", sans-serif',
                        letterSpacing: '0.5px',
                        zIndex: 6,
                        animation: 'pulse-go-pregame 1s infinite alternate',
                      }}
                    >
                      Go!
                    </motion.div>
                  </div>

                  {/* Dialog text */}
                  <p style={{
                    margin: 0,
                    fontSize: 'clamp(12px, 2vh, 15px)',
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 600,
                    lineHeight: 1.65,
                    paddingRight: 'clamp(80px, 15vw, 140px)',
                  }}>
                    <IntroTypewriter onDone={() => setIntroDone(true)} />
                  </p>

                  {/* Footer */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px',
                  }}>
                    <span style={{ fontSize: 'clamp(10px, 1.6vh, 12px)', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
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
              <StepHeader step={1} title="Rentang (R)" subtitle="Langkah 1 dari 3" />

              {/* ── Assign popup (terbesar / terkecil) ── */}
              <AnimatePresence>
                {assignPopup !== null && (
                  <div style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(3,7,18,0.75)', backdropFilter: 'blur(6px)' }}>
                    <motion.div
                      initial={{ scale: 0.88, opacity: 0, y: 16 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.88, opacity: 0, y: 16 }}
                      transition={{ type: 'spring', damping: 22, stiffness: 350 }}
                      style={{ background: 'rgba(10,10,22,0.98)', border: '2px solid var(--accent)', borderRadius: '22px', padding: '28px 24px', maxWidth: '320px', width: '90%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 0 30px rgba(99,102,241,0.15)' }}
                    >
                      <div style={{ fontSize: '32px' }}>🎯</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
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


              {/* ── Main workspace: 4 : 1 split ── */}
              <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: '8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>

                {/* ─── LEFT: Maze canvas (flex 4) ─── */}
                <div
                  ref={mapRef}
                  style={{ flex: 4, position: 'relative', background: 'linear-gradient(145deg, #08090f 0%, #0d0f1c 100%)', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {/* Grid overlay */}
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

                  {/* Maze wall segments */}
                  {[
                    { top: '28%', left: '16%', width: '40%', height: '2px' },
                    { top: '28%', left: '16%', width: '2px', height: '34%' },
                    { top: '62%', left: '36%', width: '42%', height: '2px' },
                    { top: '14%', left: '66%', width: '2px', height: '30%' },
                    { top: '14%', left: '66%', width: '23%', height: '2px' },
                  ].map((s, i) => (
                    <div key={i} style={{ position: 'absolute', ...s, background: 'rgba(99,102,241,0.28)', borderRadius: '1px', pointerEvents: 'none' }} />
                  ))}

                  {/* Data nodes */}
                  {MAZE_NODES.map(node => {
                    const isTakenMax = node.val === mazeMax
                    const isTakenMin = node.val === mazeMin
                    const isTaken    = isTakenMax || isTakenMin
                    const isNear     = nearNode === node.val && !isTaken && assignPopup === null

                    return (
                      <div
                        key={node.val}
                        style={{ position: 'absolute', left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', zIndex: 5 }}
                      >
                        {/* Confirm button */}
                        <AnimatePresence>
                          {isNear && (
                            <motion.button
                              key="pickup"
                              initial={{ opacity: 0, y: 6, scale: 0.8 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.8 }}
                              className="game-btn game-btn-primary"
                              onClick={() => setAssignPopup(node.val)}
                              style={{ fontSize: '9px', padding: '3px 7px', borderRadius: '20px', fontWeight: 800, minHeight: 'auto', whiteSpace: 'nowrap', boxShadow: '0 0 10px var(--accent)' }}
                            >
                              Ambil ✓ {!isMobile && '(Enter)'}
                            </motion.button>
                          )}
                        </AnimatePresence>

                        {/* Node circle */}
                        <motion.div
                          animate={isNear
                            ? { scale: [1, 1.18, 1], boxShadow: ['0 0 6px rgba(99,102,241,0.3)', '0 0 18px rgba(99,102,241,0.85)', '0 0 6px rgba(99,102,241,0.3)'] }
                            : {}
                          }
                          transition={{ repeat: Infinity, duration: 1.1 }}
                          style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '13px', fontFamily: 'var(--font-data)',
                            background: isTakenMax ? `${ACC}1f` : isTakenMin ? `${GREEN}1a` : isNear ? `${ACC}1f` : 'rgba(255,255,255,0.05)',
                            border: isTakenMax ? `2px solid ${ACC}66` : isTakenMin ? `2px solid ${GREEN}55` : isNear ? `2px solid ${ACC}` : '1.5px solid rgba(255,255,255,0.13)',
                            color: isTakenMax ? ACC : isTakenMin ? GREEN : isNear ? '#fff' : 'rgba(255,255,255,0.62)',
                            opacity: isTaken ? 0.55 : 1,
                            transition: 'all 0.25s',
                          }}
                        >
                          {isTaken ? '✓' : node.val}
                        </motion.div>
                      </div>
                    )
                  })}

                  {/* Player character */}
                  <motion.div
                    style={{
                      position: 'absolute',
                      left: `${charPos.x}%`,
                      top: `${charPos.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, var(--accent) 65%, #4f46e5 100%)',
                      zIndex: 10, pointerEvents: 'none',
                    }}
                    animate={{ boxShadow: [
                      '0 0 8px var(--accent), 0 0 16px rgba(99,102,241,0.35)',
                      '0 0 16px var(--accent), 0 0 28px rgba(99,102,241,0.6)',
                      '0 0 8px var(--accent), 0 0 16px rgba(99,102,241,0.35)',
                    ] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />

                  {/* Top-right: control hint */}
                  <div style={{ position: 'absolute', top: '7px', right: '8px', fontSize: '9px', color: 'rgba(255,255,255,0.25)', fontWeight: 600, lineHeight: 1.4, textAlign: 'right' }}>
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
                </div>

                {/* ─── RIGHT: Formula panel (flex 1) ─── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', minWidth: 0 }}>
                  <div style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    📐 Rumus
                  </div>

                  <div style={{ background: `${ACC}0c`, border: `1px solid ${ACC}2a`, borderRadius: '12px', padding: '10px 8px', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#a5b4fc', textAlign: 'center' }}>
                      R = terbesar − terkecil
                    </div>

                    {/* Terbesar slot */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                      <div style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.5px' }}>TERBESAR</div>
                      <motion.div
                        animate={mazeMax !== null ? { scale: [1, 1.12, 1] } : {}}
                        transition={{ duration: 0.35 }}
                        style={{
                          width: '100%', height: '38px', borderRadius: '8px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: mazeMax !== null ? `${ACC}1f` : 'rgba(255,255,255,0.04)',
                          border: mazeMax !== null ? `2px solid ${ACC}66` : '2px dashed rgba(255,255,255,0.14)',
                          fontSize: 'clamp(16px, 2.8vh, 22px)', fontWeight: 900,
                          color: mazeMax !== null ? '#fff' : 'rgba(255,255,255,0.18)',
                          fontFamily: 'var(--font-data)',
                        }}
                      >
                        {mazeMax ?? '?'}
                      </motion.div>
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-data)', lineHeight: 1 }}>−</div>

                    {/* Terkecil slot */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                      <div style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.5px' }}>TERKECIL</div>
                      <motion.div
                        animate={mazeMin !== null ? { scale: [1, 1.12, 1] } : {}}
                        transition={{ duration: 0.35 }}
                        style={{
                          width: '100%', height: '38px', borderRadius: '8px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: mazeMin !== null ? `${GREEN}18` : 'rgba(255,255,255,0.04)',
                          border: mazeMin !== null ? `2px solid ${GREEN}55` : '2px dashed rgba(255,255,255,0.14)',
                          fontSize: 'clamp(16px, 2.8vh, 22px)', fontWeight: 900,
                          color: mazeMin !== null ? GREEN : 'rgba(255,255,255,0.18)',
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
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
                        >
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-data)' }}>=</div>
                          <div style={{ fontSize: 'clamp(20px, 3.5vh, 28px)', fontWeight: 900, color: rentangDone ? GREEN : '#fff', fontFamily: 'var(--font-data)', textShadow: rentangDone ? `0 0 12px ${GREEN}` : 'none', transition: 'color 0.3s' }}>
                            {mazeMax - mazeMin}
                          </div>
                          {rentangDone && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: '10px', color: GREEN, fontWeight: 700 }}>✅ R = {CORRECT_R}</motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action Button moved here */}
                  {rentangDone ? (
                    <button
                      className="game-btn game-btn-primary"
                      onClick={() => navigateTo('banyak-kelas')}
                      style={{ width: '100%', padding: '8px', fontSize: '11px', boxShadow: 'var(--accent-glow)', marginTop: '4px' }}
                    >
                      Lanjut →
                    </button>
                  ) : (
                    <button
                      className="game-btn game-btn-primary"
                      onClick={handleConfirmRentang}
                      disabled={mazeMax === null || mazeMin === null}
                      style={{
                        width: '100%', padding: '8px', fontSize: '11px',
                        opacity: mazeMax !== null && mazeMin !== null ? 1 : 0.45,
                        cursor: mazeMax !== null && mazeMin !== null ? 'pointer' : 'not-allowed',
                        marginTop: '4px'
                      }}
                    >
                      {mazeMax !== null && mazeMin !== null
                        ? 'Konfirmasi →'
                        : 'Eksplorasi Labirin...'}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ══ BANYAK KELAS ═══════════════════════════════════════════════════ */}
          {sub === 'banyak-kelas' && (
            <>
              <StepHeader step={2} title="Banyak Kelas (K)" subtitle="Langkah 2 dari 3" />

              {/* Two-column layout: agent left, formula right */}
              <div style={{
                flex: 1, minHeight: 0, display: 'flex', flexDirection: 'row', gap: '10px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.012)',
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '10px',
                overflow: 'hidden',
              }}>
                {/* Left: Agent Sidebar */}
                <AgentSidebar message={`Data screen time kita semuanya berjumlah ${CORRECT_N} siswa. Jadi nilai n = ${CORRECT_N} ya! 🔢`} />

                {/* Right: Formula area (wider now) */}
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '14px',
                  minWidth: 0,
                }}>
                  {/* Formula card */}
                  <div style={{
                    background: `${ACC}0c`, border: `1px solid ${ACC}2a`, borderRadius: '14px',
                    padding: '16px 20px', width: '100%',
                    display: 'flex', flexDirection: 'column', gap: '12px',
                  }}>
                    <div style={{ fontSize: 'clamp(10px, 1.8vh, 14px)', fontWeight: 700, color: '#a5b4fc', textAlign: 'center' }}>
                      K = 1 + 3,3 × log n
                    </div>

                    {/* Input row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 'clamp(12px, 2.2vh, 17px)', fontWeight: 900, color: '#a5b4fc', fontFamily: 'var(--font-data)' }}>K = 1 + 3,3 × log</span>

                      <motion.div
                        key={nShake}
                        animate={!isFD && nShake > 0 ? {
                          x: [-6, 6, -5, 5, -3, 3, 0],
                          transition: { duration: 0.4 },
                        } : {}}
                      >
                        <input
                          type="number"
                          value={nVal}
                          onChange={e => setNVal(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !nDone && checkBK()}
                          disabled={nDone}
                          placeholder="n"
                          style={{
                            width: 'clamp(70px, 10vw, 110px)', padding: 'clamp(7px, 1.2vh, 11px) 10px', borderRadius: '8px', textAlign: 'center',
                            background: nErr ? 'rgba(239,68,68,0.12)' : nDone ? `${GREEN}12` : 'rgba(255,255,255,0.06)',
                            border: nErr ? `2px solid ${RED}` : nDone ? `2px solid ${GREEN}55` : `2px solid rgba(255,255,255,0.22)`,
                            color: nDone ? GREEN : '#fff', fontFamily: 'var(--font-data)', fontSize: 'clamp(16px, 3vh, 22px)', fontWeight: 800,
                            outline: 'none', transition: 'border 0.2s, background 0.2s',
                          }}
                        />
                      </motion.div>
                    </div>

                    {/* Computed breakdown (shown after correct) */}
                    {nDone && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'center' }}
                      >
                        {[
                          `= 1 + 3,3 × log ${CORRECT_N}`,
                          `= 1 + 3,3 × 1,544`,
                          `= 1 + 5,095`,
                          `= 6,095`,
                        ].map((line, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{ fontSize: 'clamp(11px, 2vh, 15px)', color: i < 3 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-data)', fontWeight: 700 }}
                          >
                            {line}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Result */}
                  {nDone && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <ResultBadge value={`K = ${CORRECT_K}`} suffix="kelas" />
                      <div style={{ fontSize: 'clamp(10px, 1.8vh, 14px)', color: `${GREEN}88` }}>
                        6,095 → dibulatkan menjadi <strong style={{ color: GREEN }}>6 kelas</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <HintToast hint={nHint} />

              {/* Action */}
              {nDone ? (
                <button
                  className="game-btn game-btn-primary"
                  onClick={() => navigateTo('panjang-kelas')}
                  style={{ flexShrink: 0, width: '100%', padding: '8px', fontSize: '12px', boxShadow: 'var(--accent-glow)' }}
                >
                  Lanjut: Panjang Kelas (P) →
                </button>
              ) : (
                <button
                  className="game-btn game-btn-primary"
                  onClick={checkBK}
                  disabled={!nVal.trim()}
                  style={{
                    flexShrink: 0, width: '100%', padding: '8px', fontSize: '12px',
                    opacity: nVal.trim() ? 1 : 0.4, cursor: nVal.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Cek Jawaban →
                </button>
              )}
            </>
          )}

          {/* ══ PANJANG KELAS ══════════════════════════════════════════════════ */}
          {sub === 'panjang-kelas' && (
            <>
              <StepHeader step={3} title="Panjang Kelas (P)" subtitle="Langkah 3 dari 3" />

              {/* Two-column layout: agent left, formula right */}
              <div style={{
                flex: 1, minHeight: 0, display: 'flex', flexDirection: 'row', gap: '10px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.012)',
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '10px',
                overflow: 'hidden',
              }}>
                {/* Left: Agent Sidebar */}
                <AgentSidebar message={`Keren! Tadi kita sudah dapat Rentang R = ${CORRECT_R} dan Banyak Kelas K = ${CORRECT_K}. Sekarang tinggal bagi keduanya untuk dapat Panjang Kelas P! 📐`} />

                {/* Right: Formula area */}
                <div style={{
                  flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '14px',
                  minWidth: 0,
                }}>
                {/* Formula card */}
                <div style={{
                  background: `${ACC}0c`, border: `1px solid ${ACC}2a`, borderRadius: '14px',
                  padding: '16px 20px', width: '100%', maxWidth: '400px',
                  display: 'flex', flexDirection: 'column', gap: '12px',
                }}>
                  <div style={{ fontSize: 'clamp(10px, 1.8vh, 14px)', fontWeight: 700, color: '#a5b4fc', textAlign: 'center' }}>
                    P = Rentang (R) ÷ Banyak Kelas (K)
                  </div>

                  {/* Input row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 'clamp(13px, 2.4vh, 18px)', fontWeight: 900, color: '#a5b4fc', fontFamily: 'var(--font-data)' }}>P =</span>

                    <motion.div
                      key={`pkR-${pkShake}`}
                      animate={!isFD && pkShake > 0 ? { x: [-6, 6, -5, 5, 0], transition: { duration: 0.4 } } : {}}
                    >
                      <input
                        type="number"
                        value={pkR}
                        onChange={e => setPkR(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !pkDone && checkPK()}
                        disabled={pkDone}
                        placeholder="R"
                        style={{
                          width: 'clamp(54px, 7vw, 80px)', padding: 'clamp(6px, 1vh, 9px) 6px', borderRadius: '8px', textAlign: 'center',
                          background: pkRErr ? 'rgba(239,68,68,0.12)' : pkDone ? `${GREEN}12` : 'rgba(255,255,255,0.06)',
                          border: pkRErr ? `1.5px solid ${RED}` : pkDone ? `1.5px solid ${GREEN}55` : `1.5px solid rgba(255,255,255,0.18)`,
                          color: pkDone ? GREEN : '#fff', fontFamily: 'var(--font-data)', fontSize: 'clamp(14px, 2.5vh, 19px)', fontWeight: 800,
                          outline: 'none', transition: 'border 0.2s, background 0.2s',
                        }}
                      />
                    </motion.div>

                    <span style={{ fontSize: 'clamp(18px, 3.2vh, 26px)', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-data)' }}>÷</span>

                    <motion.div
                      key={`pkK-${pkShake}`}
                      animate={!isFD && pkShake > 0 ? { x: [-6, 6, -5, 5, 0], transition: { duration: 0.4 } } : {}}
                    >
                      <input
                        type="number"
                        value={pkK}
                        onChange={e => setPkK(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !pkDone && checkPK()}
                        disabled={pkDone}
                        placeholder="K"
                        style={{
                          width: 'clamp(54px, 7vw, 80px)', padding: 'clamp(6px, 1vh, 9px) 6px', borderRadius: '8px', textAlign: 'center',
                          background: pkKErr ? 'rgba(239,68,68,0.12)' : pkDone ? `${GREEN}12` : 'rgba(255,255,255,0.06)',
                          border: pkKErr ? `1.5px solid ${RED}` : pkDone ? `1.5px solid ${GREEN}55` : `1.5px solid rgba(255,255,255,0.18)`,
                          color: pkDone ? GREEN : '#fff', fontFamily: 'var(--font-data)', fontSize: 'clamp(14px, 2.5vh, 19px)', fontWeight: 800,
                          outline: 'none', transition: 'border 0.2s, background 0.2s',
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Computed breakdown */}
                  {pkDone && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'center' }}
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
                          style={{ fontSize: '11px', color: i < 2 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-data)', fontWeight: 700 }}
                        >
                          {line}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Result */}
                {pkDone && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <ResultBadge value="P ≈ 3" />
                    <div style={{ fontSize: '10px', color: `${GREEN}88` }}>
                      {CORRECT_R}/{CORRECT_K} = 2,833 → dibulatkan menjadi <strong style={{ color: GREEN }}>3</strong>
                    </div>
                  </div>
                )}

                {/* Summary row (after done) */}
                {pkDone && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                      display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center',
                    }}
                  >
                    {[
                      { label: 'R', value: String(CORRECT_R), icon: '📏' },
                      { label: 'K', value: String(CORRECT_K), icon: '📊' },
                      { label: 'P', value: '≈ 3', icon: '📐' },
                    ].map(({ label, value, icon }) => (
                      <div key={label} style={{
                        padding: '6px 12px', borderRadius: '10px',
                        background: `${GREEN}0f`, border: `1px solid ${GREEN}33`,
                        display: 'flex', alignItems: 'center', gap: '5px',
                      }}>
                        <span style={{ fontSize: '12px' }}>{icon}</span>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: `${GREEN}bb` }}>{label} =</span>
                        <span style={{ fontSize: '13px', fontWeight: 900, color: GREEN, fontFamily: 'var(--font-data)' }}>{value}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
                </div>
              </div>

              <HintToast hint={pkHint} />

              {/* Action */}
              {pkDone ? (
                <button
                  className="game-btn game-btn-primary"
                  onClick={onComplete}
                  style={{ flexShrink: 0, width: '100%', padding: '8px', fontSize: '12px', boxShadow: 'var(--accent-glow)' }}
                >
                  🎯 Lanjut: Cari Nilai Min & Max →
                </button>
              ) : (
                <button
                  className="game-btn game-btn-primary"
                  onClick={checkPK}
                  disabled={!pkR.trim() || !pkK.trim()}
                  style={{
                    flexShrink: 0, width: '100%', padding: '8px', fontSize: '12px',
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
