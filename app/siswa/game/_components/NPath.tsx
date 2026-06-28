'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Vertical Hallway dimensions ──────────────────────────────────────────────
const VW = 800
const VH = 350
const SPEED = 1.35
const TOTAL_N = 35

type DoorId = 'A' | 'B' | 'C'

const DOORS = [
  { id: 'A' as DoorId, label: 'Pintu A (Kiri)', x: 175, y: 220,
    color: '#818cf8', quizQ: '3 × 3 = ?', quizA: 9, hint: '3 dikali 3 sama dengan 9', count: 9 },
  { id: 'B' as DoorId, label: 'Pintu B (Tengah)', x: 400, y: 180,
    color: '#00ADB5', quizQ: '3 × 5 = ?', quizA: 15, hint: '3 dikali 5 sama dengan 15', count: 15 },
  { id: 'C' as DoorId, label: 'Pintu C (Kanan)', x: 625, y: 220,
    color: '#f472b6', quizQ: '8 + 3 = ?', quizA: 11, hint: '8 ditambah 3 sama dengan 11', count: 11 },
] as const

// 35 data points strategically placed inside the rooms
const DATA_CIRCLES = [
  // Zone A (9 circles) - Ruang A (Left, x: 20..260, y: 45..200)
  { id: 'a1', d: 'A', x: 50, y: 80 },  { id: 'a2', d: 'A', x: 130, y: 80 },  { id: 'a3', d: 'A', x: 210, y: 80 },
  { id: 'a4', d: 'A', x: 70, y: 130 },  { id: 'a5', d: 'A', x: 150, y: 130 },  { id: 'a6', d: 'A', x: 230, y: 130 },
  { id: 'a7', d: 'A', x: 90, y: 180 },  { id: 'a8', d: 'A', x: 170, y: 180 },  { id: 'a9', d: 'A', x: 250, y: 180 },

  // Zone B (15 circles) - Ruang B (Center hallway, x: 290..510, y: 45..175)
  { id: 'b1', d: 'B', x: 330, y: 60 },  { id: 'b2', d: 'B', x: 400, y: 60 },  { id: 'b3', d: 'B', x: 470, y: 60 },
  { id: 'b4', d: 'B', x: 330, y: 85 },  { id: 'b5', d: 'B', x: 400, y: 85 },  { id: 'b6', d: 'B', x: 470, y: 85 },
  { id: 'b7', d: 'B', x: 330, y: 110 }, { id: 'b8', d: 'B', x: 400, y: 110 }, { id: 'b9', d: 'B', x: 470, y: 110 },
  { id: 'b10', d: 'B', x: 330, y: 135 }, { id: 'b11', d: 'B', x: 400, y: 135 }, { id: 'b12', d: 'B', x: 470, y: 135 },
  { id: 'b13', d: 'B', x: 330, y: 160 }, { id: 'b14', d: 'B', x: 400, y: 160 }, { id: 'b15', d: 'B', x: 470, y: 160 },

  // Zone C (11 circles) - Ruang C (Right, x: 540..785, y: 45..220)
  { id: 'c1', d: 'C', x: 550, y: 80 },  { id: 'c2', d: 'C', x: 630, y: 80 },  { id: 'c3', d: 'C', x: 710, y: 80 },
  { id: 'c4', d: 'C', x: 570, y: 130 }, { id: 'c5', d: 'C', x: 650, y: 130 }, { id: 'c6', d: 'C', x: 730, y: 130 },
  { id: 'c7', d: 'C', x: 590, y: 180 }, { id: 'c8', d: 'C', x: 670, y: 180 }, { id: 'c9', d: 'C', x: 750, y: 180 },
  { id: 'c10', d: 'C', x: 610, y: 200 }, { id: 'c11', d: 'C', x: 690, y: 200 }
]

// Walkability: check if character is inside the vertical hallway or unlocked rooms
function isWalkable(x: number, y: number, unlocked: Set<DoorId>): boolean {
  const R = 6.0 // player radius padding for landscape map

  // Screen boundaries check
  if (x < 10 + R || x > 790 - R || y < 30 + R || y > 330 - R) return false

  // Left diagonal line value at x
  const leftDiagY = 260 - (x - 10) * (8/27)
  // Right diagonal line value at x
  const rightDiagY = 180 + (x - 520) * (8/27)

  // Check if player is in Left Room (above left diagonal wall)
  if (x < 280 && y < leftDiagY) {
    if (!unlocked.has('A')) return false
    // Must not collide with vertical wall at X = 280
    if (x > 280 - R) return false
    // Must not collide with left diagonal wall except at door gap (X in [160, 190])
    const atDoorA = x >= 160 && x <= 190
    if (!atDoorA && y > leftDiagY - R) return false
    return true
  }

  // Check if player is in Right Room (above right diagonal wall)
  if (x > 520 && y < rightDiagY) {
    if (!unlocked.has('C')) return false
    if (x < 520 + R) return false
    const atDoorC = x >= 610 && x <= 640
    if (!atDoorC && y > rightDiagY - R) return false
    return true
  }

  // Check if player is in Center Room (above center horizontal wall)
  if (x >= 280 && x <= 520 && y < 180) {
    if (!unlocked.has('B')) return false
    // Must stay inside vertical walls
    if (x < 280 + R || x > 520 - R) return false
    // Must not collide with center horizontal wall except at door gap (X in [385, 415])
    const atDoorB = x >= 385 && x <= 415
    if (!atDoorB && y > 180 - R) return false
    return true
  }

  // Otherwise, player is in Starting Hub (below the wall lines)
  if (x < 280) {
    const atDoorA = unlocked.has('A') && x >= 160 && x <= 190
    if (!atDoorA && y < leftDiagY + R) return false
  } else if (x > 520) {
    const atDoorC = unlocked.has('C') && x >= 610 && x <= 640
    if (!atDoorC && y < rightDiagY + R) return false
  } else {
    // X between 280 and 520
    const atDoorB = unlocked.has('B') && x >= 385 && x <= 415
    if (!atDoorB && y < 180 + R) return false
  }

  return true
}

// ─── Joystick ─────────────────────────────────────────────────────────────────
function Joystick({ onDir }: { onDir: (x: number, y: number) => void }) {
  const outer = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const on = useRef(false)
  const R = 34

  const compute = (cx: number, cy: number) => {
    const el = outer.current; if (!el) return
    const b = el.getBoundingClientRect()
    const dx = cx - (b.left + b.width / 2)
    const dy = cy - (b.top + b.height / 2)
    const d = Math.sqrt(dx * dx + dy * dy)
    onDir(Math.max(-1, Math.min(1, d > 0 ? dx / Math.max(d, R) : 0)), Math.max(-1, Math.min(1, d > 0 ? dy / Math.max(d, R) : 0)))
    if (knob.current) knob.current.style.transform =
      `translate(calc(-50% + ${(dx / Math.max(d, 1)) * Math.min(d, R)}px),calc(-50% + ${(dy / Math.max(d, 1)) * Math.min(d, R)}px))`
  }

  const reset = () => { on.current = false; onDir(0, 0); if (knob.current) knob.current.style.transform = 'translate(-50%,-50%)' }

  return (
    <div ref={outer} style={{ width: R * 2, height: R * 2, borderRadius: '50%', background: 'rgba(14, 131, 136, 0.12)', border: '2px solid rgba(255,255,255,0.15)', position: 'relative', touchAction: 'none', userSelect: 'none' }}
      onPointerDown={e => { on.current = true; outer.current?.setPointerCapture(e.pointerId); compute(e.clientX, e.clientY) }}
      onPointerMove={e => { if (on.current) compute(e.clientX, e.clientY) }}
      onPointerUp={reset} onPointerCancel={reset}>
      <div ref={knob} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#00ADB5 0%,#818cf8 100%)', boxShadow: '0 0 8px #00ADB5', pointerEvents: 'none' }} />
    </div>
  )
}

// ─── Quiz popup ───────────────────────────────────────────────────────────────
function QuizPopup({ door, isFD, onCorrect, onClose }:
  { door: typeof DOORS[number]; isFD: boolean; onCorrect: () => void; onClose: () => void }) {
  const [val, setVal] = useState('')
  const [shake, setShake] = useState(0)
  const [hint, setHint] = useState(false)

  const submit = () => {
    if (parseInt(val.trim(), 10) === door.quizA) { onCorrect() }
    else { setShake(k => k + 1); if (isFD) { setHint(true); setTimeout(() => setHint(false), 3500) } }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(11, 30, 44, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.88, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 18 }}
          transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          style={{ maxWidth: 420, width: '100%', background: 'rgba(15, 35, 56, 0.95)', border: `2.5px solid ${door.color}66`, borderRadius: 24, padding: '32px 28px', boxShadow: '0 10px 35px rgba(14, 131, 136, 0.15)', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '2px', color: door.color, marginBottom: 8 }}>🔐 {door.label} — Jawab untuk membuka!</div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#E2E8F0', lineHeight: 1.6 }}>Di dalam pintu ini tersimpan <strong style={{ color: '#00ADB5', fontSize: 17 }}>{door.count} data</strong>. Jawab soal berikut:</p>
          </div>
          <div style={{ background: `${door.color}11`, border: `1.5px solid ${door.color}33`, borderRadius: 16, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-data)' }}>{door.quizQ}</div>
          </div>
          <motion.div key={shake} animate={shake > 0 ? { x: [-8, 8, -5, 5, 0] } : {}} transition={{ duration: 0.35 }}>
            <input type="number" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
              autoFocus placeholder="Jawaban kamu..."
              style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(14, 131, 136, 0.1)', border: `2px solid ${door.color}77`, borderRadius: 14, padding: '14px 18px', color: '#FFFFFF', fontSize: 24, fontWeight: 900, textAlign: 'center', fontFamily: 'var(--font-data)', outline: 'none' }} />
          </motion.div>
          <AnimatePresence>
            {hint && <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', fontSize: 15, fontWeight: 600, color: '#ff8080', lineHeight: 1.6 }}>
              💡 {door.hint}
            </motion.div>}
          </AnimatePresence>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="game-btn game-btn-secondary" style={{ flex: 1, fontSize: 15, fontWeight: 800, padding: '10px 14px' }} onClick={onClose}>Kembali</button>
            <button className="game-btn game-btn-primary" style={{ flex: 2, fontSize: 15, fontWeight: 800, padding: '10px 14px' }} onClick={submit}>Buka Pintu →</button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Counter overlay ──────────────────────────────────────────────────────────
function CounterResult({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)
  const [btn, setBtn] = useState(false)

  useEffect(() => {
    let c = 0
    const id = setInterval(() => {
      c++
      setCount(c)
      if (c >= TOTAL_N) {
        clearInterval(id)
        setTimeout(() => setDone(true), 300)
        setTimeout(() => setBtn(true), 1100)
      }
    }, 45)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(11, 30, 44, 0.92)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{ maxWidth: 460, width: '100%', background: 'rgba(15, 35, 56, 0.95)', border: '2px solid rgba(14, 131, 136, 0.5)', borderRadius: 26, padding: '36px 32px', textAlign: 'center', boxShadow: '0 10px 35px rgba(14, 131, 136, 0.15)', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '2px', color: '#00ADB5', marginBottom: 8 }}>⚙️ MESIN PENGHITUNG DATA</div>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#FFFFFF' }}>Mengagregasikan total sampel...</h3>
          </div>
          <div style={{ background: 'rgba(14, 131, 136, 0.06)', border: '2px solid rgba(14, 131, 136, 0.3)', borderRadius: 20, padding: '28px 20px' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 800, marginBottom: 10, letterSpacing: '0.8px' }}>JUMLAH SAMPEL (n)</div>
            <motion.div style={{ fontSize: 84, fontWeight: 900, color: '#00ADB5', fontFamily: 'var(--font-data)', lineHeight: 1 }}
              animate={done ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.6 }}>{count}</motion.div>
          </div>
          <AnimatePresence>{done && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '16px 20px', borderRadius: 16, background: 'rgba(14, 131, 136, 0.04)', border: '1px solid rgba(14, 131, 136, 0.2)', fontSize: 15, fontWeight: 600, color: '#E2E8F0', lineHeight: 1.7, textAlign: 'left' }}>
                Kamu telah mengumpulkan seluruh data dari 3 ruangan.<br />
                Ukuran sampel yang terkumpul adalah <strong style={{ color: '#00ADB5', fontSize: 19 }}>n = {TOTAL_N}</strong>.
              </div>
              {btn && <button className="game-btn game-btn-primary" style={{ width: '100%', fontSize: 16, fontWeight: 800, padding: '12px 18px' }} onClick={onDone}>Lanjut ke Banyak Kelas (K) →</button>}
            </motion.div>
          )}</AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

// ─── NPath main ───────────────────────────────────────────────────────────────
export default function NPath({ onComplete, isFD = true }: { onComplete: () => void; isFD?: boolean }) {
  const [charPos, setCharPos] = useState({ x: 400, y: 310 })
  const [unlocked, setUnlocked] = useState<Set<DoorId>>(new Set())
  const [activeDoor, setActiveDoor] = useState<typeof DOORS[number] | null>(null)
  const [nearDoor, setNearDoor] = useState<typeof DOORS[number] | null>(null)
  const [collected, setCollected] = useState<Set<string>>(new Set())
  const [showCounter, setShowCounter] = useState(false)

  const dirRef = useRef({ x: 0, y: 0 })
  const animRef = useRef<number | null>(null)
  const unlockedR = useRef(unlocked); unlockedR.current = unlocked
  const activeDoorR = useRef(activeDoor); activeDoorR.current = activeDoor
  const nearDoorR = useRef(nearDoor); nearDoorR.current = nearDoor

  // Proximity to doors (calculated smoothly from player position)
  useEffect(() => {
    const { x: cx, y: cy } = charPos
    let closest: typeof DOORS[number] | null = null
    let minDist = Infinity
    for (const d of DOORS) {
      if (unlockedR.current.has(d.id)) continue
      const dist = Math.hypot(d.x - cx, d.y - cy)
      if (dist < 26 && dist < minDist) {
        minDist = dist
        closest = d
      }
    }
    setNearDoor(closest)
  }, [charPos])

  // Sequential data point collection: pulls data circles one-by-one from the unlocked room
  useEffect(() => {
    const { x: cx, y: cy } = charPos
    const nc = new Set(collected)
    let changed = false

    // Detect which room the player has walked into
    let currentRoom: DoorId | null = null
    const leftDiagY = 260 - (cx - 10) * (8/27)
    const rightDiagY = 180 + (cx - 520) * (8/27)

    if (unlocked.has('A') && cx < 280 && cy < leftDiagY) currentRoom = 'A'
    if (unlocked.has('B') && cx >= 280 && cx <= 520 && cy < 180) currentRoom = 'B'
    if (unlocked.has('C') && cx > 520 && cy < rightDiagY) currentRoom = 'C'

    if (currentRoom) {
      const roomCircles = DATA_CIRCLES.filter(c => c.d === currentRoom && !nc.has(c.id))
      if (roomCircles.length > 0) {
        const nextCircle = roomCircles[0]
        nc.add(nextCircle.id)
        changed = true
      }
    }

    if (changed) {
      const timer = setTimeout(() => {
        setCollected(new Set(nc))
      }, 70)
      return () => clearTimeout(timer)
    }
  }, [charPos, unlocked, collected])

  // Finish trigger once all 35 data points are collected
  useEffect(() => {
    if (collected.size >= TOTAL_N && !showCounter) {
      setTimeout(() => setShowCounter(true), 600)
    }
  }, [collected.size, showCounter])

  // Main game tick: movement animation loop
  useEffect(() => {
    const tick = () => {
      if (!activeDoor) {
        const { x: dx, y: dy } = dirRef.current
        if (dx || dy) {
          setCharPos(p => {
            const nx = Math.max(10, Math.min(VW - 10, p.x + dx * SPEED))
            const ny = Math.max(10, Math.min(VH - 10, p.y + dy * SPEED))
            if (isWalkable(nx, ny, unlockedR.current)) return { x: nx, y: ny }
            if (isWalkable(nx, p.y, unlockedR.current)) return { x: nx, y: p.y }
            if (isWalkable(p.x, ny, unlockedR.current)) return { x: p.x, y: ny }
            return p
          })
        }
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [activeDoor])

  // Keyboard navigation listeners
  useEffect(() => {
    const KEY_MAP: Record<string, { x: number; y: number }> = {
      ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
    }
    const pressedKeys = new Set<string>()

    const updateDir = () => {
      let nx = 0, ny = 0
      pressedKeys.forEach(k => {
        const d = KEY_MAP[k]
        if (d) { nx += d.x; ny += d.y }
      })
      const len = Math.sqrt(nx * nx + ny * ny)
      dirRef.current = len > 0 ? { x: nx / len, y: ny / len } : { x: 0, y: 0 }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const activeDoorVal = activeDoorR.current
      const nearDoorVal = nearDoorR.current
      if (activeDoorVal) {
        if (e.key === 'Escape') { e.preventDefault(); setActiveDoor(null) }
        return
      }
      if (KEY_MAP[e.key]) {
        e.preventDefault()
        pressedKeys.add(e.key)
        updateDir()
      }
      if ((e.key === 'Enter' || e.key === ' ') && nearDoorVal && !unlockedR.current.has(nearDoorVal.id)) {
        e.preventDefault()
        setActiveDoor(nearDoorVal)
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      pressedKeys.delete(e.key)
      updateDir()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      dirRef.current = { x: 0, y: 0 }
    }
  }, [])

  const handleCorrect = useCallback(() => {
    if (!activeDoor) return
    setUnlocked(p => new Set([...p, activeDoor.id]))
    setActiveDoor(null)
  }, [activeDoor])

  const n = collected.size

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, minHeight: 0 }}>
      {/* Top Header info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>Eksplorasi Ruangan 🕵️‍♂️</h2>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>Hubungkan pintu-pintu dari bawah ke atas dan kumpulkan {TOTAL_N} sampel screen time.</p>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: 'rgba(14, 131, 136, 0.04)', border: '1px solid rgba(14, 131, 136, 0.15)', borderRadius: 14, flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '1.2px', color: '#00ADB5' }}>SCAN DATA</div>
        <div style={{ flex: 1, height: 6, background: 'rgba(14, 131, 136, 0.15)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div style={{ height: '100%', background: '#00ADB5', borderRadius: 3 }} animate={{ width: `${(n / TOTAL_N) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 900, color: '#00ADB5', fontFamily: 'var(--font-data)', minWidth: 44, textAlign: 'right' }}>{n}/{TOTAL_N}</div>
        {DOORS.map(d => (
          <div key={d.id} style={{ width: 8, height: 8, borderRadius: '50%', background: unlocked.has(d.id) ? d.color : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
        ))}
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', borderRadius: 16, border: '1px solid rgba(14, 131, 136, 0.08)', minHeight: 0, position: 'relative', background: '#04070a' }}>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', display: 'block' }}>

            {/* Facility Outer boundary */}
            <rect x={10} y={30} width={780} height={300} fill="rgba(14, 131, 136, 0.01)" stroke="rgba(14, 131, 136, 0.15)" strokeWidth={1.5} rx={12} />

            {/* Glowing lines for wall boundaries */}
            {/* Left diagonal wall */}
            <line x1={10} y1={260} x2={280} y2={180} stroke="rgba(255, 255, 255, 0.15)" strokeWidth={1.5} />
            {/* Right diagonal wall */}
            <line x1={520} y1={180} x2={790} y2={260} stroke="rgba(255, 255, 255, 0.15)" strokeWidth={1.5} />
            {/* Center horizontal wall */}
            <line x1={280} y1={180} x2={520} y2={180} stroke="rgba(255, 255, 255, 0.15)" strokeWidth={1.5} />
            {/* Left vertical hallway wall */}
            <line x1={280} y1={30} x2={280} y2={180} stroke="rgba(255, 255, 255, 0.15)" strokeWidth={1.5} />
            {/* Right vertical hallway wall */}
            <line x1={520} y1={30} x2={520} y2={180} stroke="rgba(255, 255, 255, 0.15)" strokeWidth={1.5} />

            {/* Start & Exit Pads */}
            <circle cx={400} cy={310} r={13} fill="rgba(14, 131, 136, 0.08)" stroke="rgba(14, 131, 136, 0.3)" strokeWidth={1} />
            <text x={400} y={312.5} textAnchor="middle" fill="#00ADB5" fontSize={6} fontWeight="900" fontFamily="monospace">MULAI</text>

            <circle cx={400} cy={50} r={13} fill="rgba(129, 140, 248, 0.08)" stroke="rgba(129, 140, 248, 0.3)" strokeWidth={1} />
            <text x={400} y={52.5} textAnchor="middle" fill="#818cf8" fontSize={6} fontWeight="900" fontFamily="monospace">SELESAI</text>

            {/* Room Labels */}
            {/* Ruang A (Kiri) */}
            <text x={145} y={65} textAnchor="middle" fill={unlocked.has('A') ? '#818cf8' : 'rgba(255,255,255,0.2)'} fontSize={8} fontFamily="monospace" fontWeight="bold">RUANG A (n=9)</text>
            {/* Ruang B (Tengah) */}
            <text x={400} y={75} textAnchor="middle" fill={unlocked.has('B') ? '#00ADB5' : 'rgba(255,255,255,0.2)'} fontSize={8} fontFamily="monospace" fontWeight="bold">RUANG B (n=15)</text>
            {/* Ruang C (Kanan) */}
            <text x={655} y={65} textAnchor="middle" fill={unlocked.has('C') ? '#f472b6' : 'rgba(255,255,255,0.2)'} fontSize={8} fontFamily="monospace" fontWeight="bold">RUANG C (n=11)</text>

            {/* Connecting doors */}
            {DOORS.map(door => {
              const open = unlocked.has(door.id)
              const near = nearDoor?.id === door.id && !open
              const rx = door.x - 15
              const ry = door.y - 9

              return (
                <g key={door.id} style={{ cursor: open ? 'default' : 'pointer' }}
                  onClick={e => { e.stopPropagation(); if (!open && !activeDoor) setActiveDoor(door) }}>
                  {near && <circle cx={door.x} cy={door.y} r={14} fill={`${door.color}15`} stroke={`${door.color}44`} strokeWidth={0.6} />}
                  <rect x={rx} y={ry} width={30} height={18} rx={4}
                    fill={open ? `${door.color}25` : '#111827'} stroke={near ? '#FFFFFF' : door.color} strokeWidth={1} />
                  <text x={door.x} y={door.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={9.5}>{open ? '🔓' : '🔒'}</text>
                  <text x={door.x} y={door.y - 14} textAnchor="middle" fontSize={6.5} fontWeight="bold" fill={door.color} fontFamily="monospace">{door.label}</text>
                </g>
              )
            })}

            {/* Glowing Data Circles (fly on unmount exit) */}
            <AnimatePresence>
              {DATA_CIRCLES.map(circle => {
                if (!unlocked.has(circle.d as DoorId) || collected.has(circle.id)) return null
                const col = DOORS.find(d => d.id === circle.d as DoorId)?.color ?? '#00ADB5'
                return (
                  <motion.circle
                    key={circle.id}
                    cx={circle.x}
                    cy={circle.y}
                    r={2.2}
                    fill={`${col}77`}
                    stroke={col}
                    strokeWidth={0.6}
                    opacity={1}
                    exit={{
                      cx: charPos.x,
                      cy: charPos.y,
                      r: 0.6,
                      opacity: 0,
                      transition: { duration: 0.35, ease: 'easeOut' }
                    }}
                  />
                )
              })}
            </AnimatePresence>

            {/* Player Character */}
            <defs>
              <radialGradient id="char-grad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#00ADB5" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </radialGradient>
              <filter id="char-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="1.6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx={charPos.x} cy={charPos.y} r={3.6} fill="url(#char-grad)" filter="url(#char-glow)" />

          </svg>

          {/* Joystick */}
          <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 20 }}>
            <Joystick onDir={(x, y) => { dirRef.current = { x, y } }} />
          </div>

          {/* Quick Click helper overlay button */}
          <AnimatePresence>
            {nearDoor && !unlocked.has(nearDoor.id) && !activeDoor && (
              <motion.button initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                onClick={() => setActiveDoor(nearDoor)}
                style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 20, background: nearDoor.color, color: '#fff', border: 'none', borderRadius: 20, padding: '8px 14px', fontSize: 11, fontWeight: 800, cursor: 'pointer', boxShadow: `0 0 10px ${nearDoor.color}` }}>
                🔓 Buka {nearDoor.id}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Control instruction banner */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textAlign: 'center', flexShrink: 0, lineHeight: 1.5 }}>
        Tekan WASD / Arrow Keys / Joystick untuk menggerakkan detektif.<br />
        Gunakan pintu dan masuklah ke ruangan untuk memindai data secara otomatis.
      </div>

      <AnimatePresence>
        {activeDoor && <QuizPopup door={activeDoor} isFD={isFD} onCorrect={handleCorrect} onClose={() => setActiveDoor(null)} />}
      </AnimatePresence>
      {showCounter && <CounterResult onDone={onComplete} />}
    </div>
  )
}
