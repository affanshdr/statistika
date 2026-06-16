'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { screenTimeData, STATS } from '../_data/level1'
import { useGameStore } from '@/lib/store/gameStore'
import DiraPopup, { DiraPopupStep } from './DiraPopup'

// ─── Constants ───────────────────────────────────────────────────────────────
const CORRECT_MAX = Math.max(...screenTimeData)  // 18
const CORRECT_MIN = Math.min(...screenTimeData)  // 1
const CORRECT_R   = CORRECT_MAX - CORRECT_MIN   // 17
const CORRECT_N   = STATS.n                     // 35
const CORRECT_K   = 6                           // 1 + 3.3 * log10(35) ≈ 6.09 → 6
const ACC         = '#6366F1'
const GREEN       = '#4ade80'
const RED         = '#EF4444'

// Shuffled unique values for chip pool (deterministic shuffle per mount)
const CHIP_POOL = (() => {
  const arr = Array.from(new Set(screenTimeData))
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
})()

type SubScreen = 'intro' | 'rentang' | 'banyak-kelas' | 'panjang-kelas'
type SlotKey   = 'terbesar' | 'terkecil'
interface Chip  { id: string; val: number; placed: SlotKey | null }
interface Props { onComplete: () => void }

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

// ─── Formula slot (drop zone) ─────────────────────────────────────────────────
function FormulaSlot({
  slotKey, chip, isError, isTargeted, onTap,
}: {
  slotKey: SlotKey
  chip: Chip | undefined
  isError: boolean
  isTargeted: boolean
  onTap: () => void
}) {
  return (
    <motion.div
      data-formula-slot={slotKey}
      animate={isError ? { x: [-6, 6, -6, 6, 0] } : {}}
      transition={{ duration: 0.35 }}
      onClick={onTap}
      style={{
        minWidth: 'clamp(48px, 9vw, 72px)', height: 'clamp(38px, 7vh, 56px)', borderRadius: '8px', cursor: isTargeted ? 'pointer' : 'default',
        border: isError
          ? `2px dashed ${RED}`
          : chip
            ? `2px solid ${ACC}99`
            : isTargeted ? `2px dashed ${ACC}88` : '2px dashed rgba(255,255,255,0.18)',
        background: isError
          ? 'rgba(239,68,68,0.1)'
          : chip ? `${ACC}1a` : isTargeted ? `${ACC}08` : 'rgba(255,255,255,0.02)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s', padding: '0 8px', position: 'relative',
      }}
    >
      <AnimatePresence mode="wait">
        {chip ? (
          <motion.span
            key={chip.id + '-placed'}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            style={{ fontSize: 'clamp(15px, 2.8vh, 22px)', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-data)' }}
          >
            {chip.val}
          </motion.span>
        ) : (
          <motion.span
            key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ fontSize: 'clamp(12px, 2vh, 16px)', opacity: 0.2 }}
          >
            ?
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
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

  // ── DiRA Popup state ─────────────────────────────────────────────────────
  const [diraPopupStep, setDiraPopupStep] = useState<DiraPopupStep | null>(null)
  // Track which steps have already shown popup (show only once each)
  // 'intro' excluded — the new Agent dialog handles intro messaging
  const shownSteps = useRef<Set<SubScreen>>(new Set(['intro']))

  const navigateTo = useCallback((next: SubScreen) => {
    setSub(next)
    if (!shownSteps.current.has(next)) {
      shownSteps.current.add(next)
      // Small delay so the screen transition plays first
      setTimeout(() => setDiraPopupStep(next as DiraPopupStep), 350)
    }
  }, [])

  // ── Flash overlay (FI error) ─────────────────────────────────────────────
  const [flashScreen, setFlashScreen] = useState(false)
  const triggerFlash = useCallback(() => {
    setFlashScreen(true)
    setTimeout(() => setFlashScreen(false), 500)
  }, [])

  // ── Rentang state ────────────────────────────────────────────────────────
  const [chips, setChips] = useState<Chip[]>(() =>
    CHIP_POOL.map((v, i) => ({ id: `fchip-${i}`, val: v, placed: null }))
  )
  const [selectedChip, setSelectedChip]   = useState<Chip | null>(null)
  const [draggingId, setDraggingId]       = useState<string | null>(null)
  const [resetKeys, setResetKeys]         = useState<Record<string, number>>({})
  const [slotError, setSlotError]         = useState<SlotKey | null>(null)
  const [rentangHint, setRentangHint]     = useState('')
  const [rentangDone, setRentangDone]     = useState(false)
  const [rentangSubmitted, setRentangSubmitted] = useState(false)

  const terbesar  = chips.find(c => c.placed === 'terbesar')
  const terkecil  = chips.find(c => c.placed === 'terkecil')
  const pool      = chips.filter(c => c.placed === null)
  const isDraggingAny = !!draggingId

  const triggerSlotError = useCallback((slot: SlotKey, fdHint: string) => {
    setSlotError(slot)
    if (isFD) {
      setRentangHint(fdHint)
      setTimeout(() => { setSlotError(null); setRentangHint('') }, 2800)
    } else {
      triggerFlash()
      setTimeout(() => setSlotError(null), 350)
    }
  }, [isFD, triggerFlash])

  const placeChip = useCallback((chip: Chip, slot: SlotKey): boolean => {
    const correct =
      (slot === 'terbesar' && chip.val === CORRECT_MAX) ||
      (slot === 'terkecil' && chip.val === CORRECT_MIN)

    if (!correct) {
      triggerSlotError(
        slot,
        slot === 'terbesar'
          ? `💡 Lihat kembali mana angka yang paling besar dari semua data. Angka ${chip.val} bukan yang terbesar!`
          : `💡 Lihat kembali mana angka yang paling kecil dari semua data. Angka ${chip.val} bukan yang terkecil!`,
      )
      return false
    }

    setChips(prev => prev.map(c => {
      if (c.id === chip.id)  return { ...c, placed: slot }
      if (c.placed === slot) return { ...c, placed: null }
      return c
    }))
    setSelectedChip(null)
    return true
  }, [triggerSlotError])

  const handleDragEnd = useCallback((chip: Chip) => (
    e: MouseEvent | TouchEvent | PointerEvent,
    _info: PanInfo,
  ) => {
    let cx: number, cy: number
    if ('changedTouches' in e && e.changedTouches.length > 0) {
      cx = e.changedTouches[0].clientX; cy = e.changedTouches[0].clientY
    } else {
      cx = (e as MouseEvent).clientX; cy = (e as MouseEvent).clientY
    }
    const el = document.getElementById(chip.id)
    const savedPE = el?.style.pointerEvents ?? ''
    if (el) el.style.pointerEvents = 'none'
    const target = document.elementFromPoint(cx, cy)
    if (el) el.style.pointerEvents = savedPE

    let placed = false
    if (target) {
      const slotEl = target.closest('[data-formula-slot]')
      if (slotEl) {
        const slot = slotEl.getAttribute('data-formula-slot') as SlotKey
        placed = placeChip(chip, slot)
      }
    }
    if (!placed) setResetKeys(p => ({ ...p, [chip.id]: (p[chip.id] ?? 0) + 1 }))
    setDraggingId(null)
  }, [placeChip])

  const onTapChip = (chip: Chip) => {
    if (draggingId) return
    setSelectedChip(prev => prev?.id === chip.id ? null : chip)
  }

  const onTapSlot = (slot: SlotKey) => {
    if (!selectedChip) return
    placeChip(selectedChip, slot)
  }

  const handleSubmitRentang = () => {
    if (!terbesar || !terkecil) return
    setRentangSubmitted(true)
    setRentangDone(true)
  }

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

  const checkPK = () => {
    const r = parseInt(pkR.trim(), 10)
    const k = parseInt(pkK.trim(), 10)
    if (r === CORRECT_R && k === CORRECT_K) {
      setPkDone(true); setPkErr(false); setPkHint('')
    } else {
      setPkErr(true); setPkShake(v => v + 1)
      if (isFD) {
        const parts: string[] = []
        if (r !== CORRECT_R) parts.push(`Rentang R = ${CORRECT_R}`)
        if (k !== CORRECT_K) parts.push(`Banyak Kelas K = ${CORRECT_K}`)
        setPkHint(`💡 Gunakan nilai yang sudah kamu hitung sebelumnya: ${parts.join(', ')}`)
        setTimeout(() => { setPkErr(false); setPkHint('') }, 3500)
      } else {
        triggerFlash()
        setTimeout(() => setPkErr(false), 500)
      }
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



          {/* ══ RENTANG ════════════════════════════════════════════════════════ */}
          {sub === 'rentang' && (
            <>
              <StepHeader step={1} title="Rentang (R)" subtitle="Langkah 1 dari 3" />

              {/* Workspace */}
              <div style={{
                flex: 1, minHeight: 0, display: 'flex', gap: '8px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.012)',
                border: '1px solid rgba(255,255,255,0.07)',
                overflow: isDraggingAny ? 'visible' : 'hidden',
              }}>
                {/* Left: chip pool */}
                <div style={{
                  flex: '0 0 52%', display: 'flex', flexDirection: 'column',
                  padding: '8px', borderRight: '1px solid rgba(255,255,255,0.06)',
                  overflow: isDraggingAny ? 'visible' : 'hidden',
                }}>
                  <div style={{
                    fontSize: 'clamp(9px, 1.5vh, 12px)', fontWeight: 800, color: pool.length === 0 ? GREEN : 'rgba(255,255,255,0.3)',
                    letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '5px', flexShrink: 0, transition: 'color 0.3s',
                  }}>
                    {pool.length === 0 ? '✅ Semua nilai digunakan!' : '📍 Data Screen Time — ketuk atau seret'}
                  </div>
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '4px', alignContent: 'flex-start',
                    flex: 1, minHeight: 0, overflow: isDraggingAny ? 'visible' : 'auto', padding: '1px',
                  }}>
                    <AnimatePresence>
                      {pool.length === 0 ? (
                        <motion.div key="pool-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1 1 100%', color: GREEN, fontSize: 'clamp(12px, 2.2vh, 17px)', fontWeight: 700, gap: '6px' }}>
                          <span>🎯</span> Siap dikonfirmasi!
                        </motion.div>
                      ) : (
                        pool.map(chip => {
                          const isSelected   = selectedChip?.id === chip.id
                          const isThisDrag   = draggingId === chip.id
                          const chipKey      = `${chip.id}-${resetKeys[chip.id] ?? 0}`
                          return (
                            <motion.div
                              key={chipKey}
                              id={chip.id}
                              drag
                              dragMomentum={false}
                              dragElastic={0.08}
                              onDragStart={() => { setSelectedChip(null); setDraggingId(chip.id) }}
                              onDragEnd={handleDragEnd(chip)}
                              onClick={() => onTapChip(chip)}
                              layout
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0, transition: { duration: 0.1 } }}
                              whileDrag={{ scale: 1.3, rotate: 3, zIndex: 9999, boxShadow: `0 12px 30px ${ACC}66` }}
                              whileHover={!isDraggingAny ? { scale: 1.1, y: -1 } : {}}
                              style={{
                                padding: 'clamp(4px, 0.8vh, 7px) clamp(10px, 1.8vw, 16px)', borderRadius: '50px',
                                cursor: 'grab', userSelect: 'none', touchAction: 'none',
                                background: isSelected
                                  ? `linear-gradient(135deg, ${ACC} 0%, #fff 150%)`
                                  : `linear-gradient(135deg, ${ACC}dd 0%, ${ACC}88 100%)`,
                                border: isSelected ? '2px solid #fff' : `1.5px solid ${ACC}55`,
                                color: isSelected ? '#000' : '#fff',
                                fontSize: 'clamp(11px, 2.1vh, 16px)', fontWeight: 800,
                                fontFamily: 'var(--font-data)', whiteSpace: 'nowrap',
                                boxShadow: isSelected ? `0 0 14px ${ACC}` : `0 2px 6px rgba(0,0,0,0.4)`,
                                zIndex: isThisDrag ? 1000 : isSelected ? 50 : 1,
                                transition: 'box-shadow 0.15s, background 0.15s, border 0.15s',
                              }}
                            >
                              {chip.val}
                            </motion.div>
                          )
                        })
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Right: formula */}
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '10px', padding: '10px',
                }}>
                  <div style={{ fontSize: 'clamp(9px, 1.5vh, 12px)', fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    📐 Rumus Rentang
                  </div>

                  {/* Formula card */}
                  <div style={{
                    background: `${ACC}0c`, border: `1px solid ${ACC}2a`, borderRadius: '12px',
                    padding: '12px 14px', width: '100%', display: 'flex', flexDirection: 'column', gap: '10px',
                  }}>
                    <div style={{ fontSize: 'clamp(10px, 1.8vh, 14px)', fontWeight: 700, color: '#a5b4fc', textAlign: 'center' }}>
                      R = data terbesar − data terkecil
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1vh, 10px)', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <span style={{ fontSize: 'clamp(14px, 2.5vh, 20px)', fontWeight: 900, color: '#a5b4fc', fontFamily: 'var(--font-data)' }}>R =</span>

                      <FormulaSlot
                        slotKey="terbesar"
                        chip={terbesar}
                        isError={slotError === 'terbesar'}
                        isTargeted={!!selectedChip}
                        onTap={() => onTapSlot('terbesar')}
                      />

                      <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-data)' }}>−</span>

                      <FormulaSlot
                        slotKey="terkecil"
                        chip={terkecil}
                        isError={slotError === 'terkecil'}
                        isTargeted={!!selectedChip}
                        onTap={() => onTapSlot('terkecil')}
                      />

                      {terbesar && terkecil && !rentangDone && (
                        <>
                          <span style={{ fontSize: 'clamp(14px, 2.5vh, 20px)', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-data)' }}>=</span>
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                            style={{ fontSize: 'clamp(18px, 3.2vh, 24px)', fontWeight: 900, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-data)' }}
                          >
                            {terbesar.val - terkecil.val}
                          </motion.span>
                        </>
                      )}
                    </div>

                    {/* Slot labels */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', marginTop: '-4px' }}>
                      {[
                        { label: 'Terbesar', filled: !!terbesar },
                        { label: 'Terkecil', filled: !!terkecil },
                      ].map(({ label, filled }) => (
                        <div key={label} style={{ fontSize: 'clamp(8px, 1.3vh, 11px)', fontWeight: 700, color: filled ? '#a5b4fc' : 'rgba(255,255,255,0.2)', letterSpacing: '0.5px' }}>
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Result (after submit) */}
                  {rentangDone && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <ResultBadge value={`R = ${CORRECT_R}`} />
                      <div style={{ fontSize: 'clamp(10px, 1.8vh, 14px)', color: `${GREEN}99` }}>
                        = {CORRECT_MAX} − {CORRECT_MIN} = {CORRECT_R}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <HintToast hint={rentangHint} />

              {/* Action */}
              {rentangDone ? (
                <button
                  className="game-btn game-btn-primary"
                  onClick={() => navigateTo('banyak-kelas')}
                  style={{ flexShrink: 0, width: '100%', padding: '8px', fontSize: '12px', boxShadow: 'var(--accent-glow)' }}
                >
                  Lanjut: Banyak Kelas (K) →
                </button>
              ) : (
                <button
                  className="game-btn game-btn-primary"
                  onClick={handleSubmitRentang}
                  disabled={!terbesar || !terkecil || rentangSubmitted}
                  style={{
                    flexShrink: 0, width: '100%', padding: '8px', fontSize: '12px',
                    opacity: terbesar && terkecil && !rentangSubmitted ? 1 : 0.4,
                    cursor: terbesar && terkecil && !rentangSubmitted ? 'pointer' : 'not-allowed',
                  }}
                >
                  {terbesar && terkecil ? 'Konfirmasi Rentang →' : 'Seret / ketuk nilai terbesar & terkecil ke rumus'}
                </button>
              )}
            </>
          )}

          {/* ══ BANYAK KELAS ═══════════════════════════════════════════════════ */}
          {sub === 'banyak-kelas' && (
            <>
              <StepHeader step={2} title="Banyak Kelas (K)" subtitle="Langkah 2 dari 3" />

              <div style={{
                flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '8px',
              }}>
                {/* Formula card */}
                <div style={{
                  background: `${ACC}0c`, border: `1px solid ${ACC}2a`, borderRadius: '14px',
                  padding: '16px 20px', width: '100%', maxWidth: '380px',
                  display: 'flex', flexDirection: 'column', gap: '12px',
                }}>
                  <div style={{ fontSize: 'clamp(10px, 1.8vh, 14px)', fontWeight: 700, color: '#a5b4fc', textAlign: 'center' }}>
                    K = 1 + 3,3 × log n
                  </div>

                  {/* Input row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 'clamp(13px, 2.4vh, 18px)', fontWeight: 900, color: '#a5b4fc', fontFamily: 'var(--font-data)' }}>K = 1 + 3,3 × log</span>

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
                          width: 'clamp(60px, 8vw, 90px)', padding: 'clamp(6px, 1vh, 9px) 8px', borderRadius: '8px', textAlign: 'center',
                          background: nErr ? 'rgba(239,68,68,0.12)' : nDone ? `${GREEN}12` : 'rgba(255,255,255,0.06)',
                          border: nErr ? `1.5px solid ${RED}` : nDone ? `1.5px solid ${GREEN}55` : `1.5px solid rgba(255,255,255,0.18)`,
                          color: nDone ? GREEN : '#fff', fontFamily: 'var(--font-data)', fontSize: 'clamp(14px, 2.5vh, 19px)', fontWeight: 800,
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

              <div style={{
                flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '8px',
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
                          background: pkErr ? 'rgba(239,68,68,0.12)' : pkDone ? `${GREEN}12` : 'rgba(255,255,255,0.06)',
                          border: pkErr ? `1.5px solid ${RED}` : pkDone ? `1.5px solid ${GREEN}55` : `1.5px solid rgba(255,255,255,0.18)`,
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
                          background: pkErr ? 'rgba(239,68,68,0.12)' : pkDone ? `${GREEN}12` : 'rgba(255,255,255,0.06)',
                          border: pkErr ? `1.5px solid ${RED}` : pkDone ? `1.5px solid ${GREEN}55` : `1.5px solid rgba(255,255,255,0.18)`,
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
