'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PlayerCharacter from '@/app/siswa/game/_components/PlayerCharacter'
import FieldTeacher from './FieldTeacher'
import { gameAudio } from '@/lib/utils/gameAudio'
import { playSound } from '@/app/siswa/game/_levels/level2/config/level2Config'
import { DEFAULT_STUDENT_PROFILES } from '@/app/siswa/game/_levels/level2/data/level2StatData'

// ─── CANVAS WORLD DIMENSIONS (MATCHES VII-B.webp 1376 x 768 NATIVE) ──
const WORLD_VW = 1376
const WORLD_VH = 768

// Walkable floor area inside Ruang VII-B (between desks, front podium, and doorway)
function checkClassroomWalkable(x: number, y: number): boolean {
  if (x < 110 || x > 1250) return false
  if (y < 435 || y > 715) return false
  // Avoid clipping inside the center teacher podium desk
  if (x >= 650 && x <= 840 && y < 490) return false
  return true
}

// ─── JOYSTICK COMPONENT FOR TOUCH / MOBILE ─────────────────────────
function Joystick({ onDir }: { onDir: (x: number, y: number) => void }) {
  const outer = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const on = useRef(false)

  const compute = (cx: number, cy: number) => {
    const el = outer.current
    if (!el) return
    const b = el.getBoundingClientRect()
    const R = b.width / 2
    const dx = cx - (b.left + R)
    const dy = cy - (b.top + R)
    const d = Math.sqrt(dx * dx + dy * dy)
    onDir(
      Math.max(-1, Math.min(1, d > 0 ? dx / Math.max(d, R) : 0)),
      Math.max(-1, Math.min(1, d > 0 ? dy / Math.max(d, R) : 0))
    )
    if (knob.current) {
      knob.current.style.transform = `translate(calc(-50% + ${(dx / Math.max(d, 1)) * Math.min(d, R)}px), calc(-50% + ${(dy / Math.max(d, 1)) * Math.min(d, R)}px))`
    }
  }

  const reset = () => {
    on.current = false
    onDir(0, 0)
    if (knob.current) knob.current.style.transform = 'translate(-50%, -50%)'
  }

  return (
    <div
      ref={outer}
      style={{
        width: 'clamp(62px, 9vw, 84px)',
        height: 'clamp(62px, 9vw, 84px)',
        borderRadius: '50%',
        background: 'rgba(14, 131, 136, 0.25)',
        border: '2.5px solid rgba(0, 173, 181, 0.5)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 173, 181, 0.3)',
        position: 'relative',
        touchAction: 'none',
        userSelect: 'none',
        backdropFilter: 'blur(4px)',
      }}
      onPointerDown={e => {
        on.current = true
        compute(e.clientX, e.clientY)
      }}
      onPointerMove={e => {
        if (on.current) compute(e.clientX, e.clientY)
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
    >
      <div
        ref={knob}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '38%',
          height: '38%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00ADB5 0%, #818cf8 100%)',
          boxShadow: '0 0 12px #00ADB5',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

// ─── TYPEWRITER EFFECT ─────────────────────────────────────────────
function Typewriter({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    setDisplayed('')
    let idx = 0
    const timer = setInterval(() => {
      if (idx < text.length) {
        setDisplayed(text.slice(0, idx + 1))
        idx++
      } else {
        clearInterval(timer)
        onDoneRef.current?.()
      }
    }, 18)
    return () => clearInterval(timer)
  }, [text])

  return <span>{displayed}</span>
}

// ─── CLASSROOM DIALOGUE LINES (NATURAL & CRISP) ───────────────────
interface ClassroomChatLine {
  speaker: 'teacher' | 'player' | 'dira'
  speakerName: string
  text: string
  actionLabel: string
}

const CLASSROOM_SCRIPT: ClassroomChatLine[] = [
  {
    speaker: 'teacher',
    speakerName: 'Pak Bambang (Guru Olahraga)',
    text: 'Halo Stevunt! Selamat datang di Ruang VII-B. Hari ini kita punya misi penting di lapangan sekolah: mengukur sebaran lemparan bola dari 10 siswa kita!',
    actionLabel: 'Lanjut ▶',
  },
  {
    speaker: 'player',
    speakerName: 'Stevunt',
    text: 'Siap Pak Bambang! Tapi kenapa kita harus mengukur sebaran lemparan dan bukan cuma mencari nilai rata-ratanya (mean) saja, Pak?',
    actionLabel: 'Lanjut ▶',
  },
  {
    speaker: 'teacher',
    speakerName: 'Pak Bambang (Guru Olahraga)',
    text: 'Pertanyaan cerdas! Angka rata-rata saja bisa menipu. Misalnya ada dua tim dengan rata-rata 20 meter, tapi tim pertama konsisten di 19–21 meter sedangkan tim kedua tidak stabil di 6 meter dan 34 meter!',
    actionLabel: 'Lanjut ▶',
  },
  {
    speaker: 'teacher',
    speakerName: 'Pak Bambang (Guru Olahraga)',
    text: 'Untuk mengukur kestabilan dan sebaran data tersebut, kita butuh Ukuran Penyebaran Data: Jangkauan (Range), Tiga Kuartil (Q1, Q2, Q3), IQR, dan Simpangan Kuartil (Qd). Ini berkas 10 siswa kita, mari bawa ke lapangan!',
    actionLabel: '📋 Buka Berkas Siswa ▶',
  },
]

// ─── COMPONENT PROPS ───────────────────────────────────────────────
interface Level2ClassroomWalkProps {
  studentName?: string
  onProceedToField: () => void
}

export default function Level2ClassroomWalk({
  studentName = 'Stevunt',
  onProceedToField,
}: Level2ClassroomWalkProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Character movement states: spawn near the classroom entrance doorway on the right
  const [charPos, setCharPos] = useState({ x: 1160, y: 570 })
  const charPosRef = useRef(charPos)
  charPosRef.current = charPos

  const [moveDir, setMoveDir] = useState({ x: 0, y: 0 })
  const dirRef = useRef({ x: 0, y: 0 })
  const pressedKeysRef = useRef<Set<string>>(new Set())
  const animRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(performance.now())

  // Click / Tap to move destination
  const [targetDestination, setTargetDestination] = useState<{ x: number; y: number } | null>(null)
  const targetDestRef = useRef(targetDestination)
  targetDestRef.current = targetDestination

  // Precise positions matching VII-B.webp (1376 x 768 native resolution)
  const teacherPos = useMemo(() => ({ x: 740, y: 460 }), []) // Pak Bambang standing at teacher desk
  const exitDoorPos = useMemo(() => ({ x: 1220, y: 570 }), []) // Classroom doorway leading to field

  // Student desk positions for interactive cheering
  const studentDesks = useMemo(
    () => [
      { id: 'desk-left', x: 330, y: 590, label: 'Meja Siswa Kiri' },
      { id: 'desk-right', x: 970, y: 640, label: 'Meja Siswa Kanan' },
    ],
    []
  )

  // Interaction proximity states
  const [nearTeacher, setNearTeacher] = useState(false)
  const [nearExitDoor, setNearExitDoor] = useState(false)

  // Classroom Progress States
  const [isDataCollected, setIsDataCollected] = useState(false)
  const [showDataModal, setShowDataModal] = useState(false)
  const [showChalkboardModal, setShowChalkboardModal] = useState(false)
  const [dialogueStage, setDialogueStage] = useState<number | null>(null)
  const [studentReaction, setStudentReaction] = useState<{ text: string; x: number; y: number } | null>(null)
  const [doorAlert, setDoorAlert] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Toast feedback helper
  const showToast = useCallback((msg: string, duration = 3000) => {
    setToastMessage(msg)
    const t = setTimeout(() => setToastMessage(null), duration)
    return () => clearTimeout(t)
  }, [])

  // ── Keyboard Controls ────────────────────────────────────────────
  const KEY_MAP: Record<string, { x: number; y: number }> = {
    w: { x: 0, y: -1 },
    arrowup: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    arrowdown: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    arrowleft: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
    arrowright: { x: 1, y: 0 },
  }

  const updateDirFromKeys = useCallback(() => {
    let nx = 0
    let ny = 0
    pressedKeysRef.current.forEach(k => {
      const d = KEY_MAP[k]
      if (d) {
        nx += d.x
        ny += d.y
      }
    })
    const len = Math.sqrt(nx * nx + ny * ny)
    const nextDir = len > 0 ? { x: nx / len, y: ny / len } : { x: 0, y: 0 }
    dirRef.current = nextDir
    setMoveDir(nextDir)
    if (len > 0) {
      setTargetDestination(null)
    }
  }, [])

  // Advance dialogue step
  const handleAdvanceDialogue = useCallback(() => {
    if (dialogueStage === null) return
    playSound('chime')
    if (dialogueStage < CLASSROOM_SCRIPT.length - 1) {
      setDialogueStage(prev => (prev !== null ? prev + 1 : 0))
    } else {
      // Completed conversation -> Open Data Modal
      setDialogueStage(null)
      setShowDataModal(true)
    }
  }, [dialogueStage])

  // Interaction trigger
  const handleInteract = useCallback(() => {
    if (showDataModal || showChalkboardModal) return

    // If currently in conversation cutscene, advance it
    if (dialogueStage !== null) {
      handleAdvanceDialogue()
      return
    }

    if (nearTeacher) {
      gameAudio.playClick()
      if (!isDataCollected) {
        setDialogueStage(0)
      } else {
        // Already collected: open roster modal to review
        setShowDataModal(true)
      }
    } else if (nearExitDoor) {
      if (!isDataCollected) {
        gameAudio.playError()
        setDoorAlert('⚠️ Temui Pak Bambang terlebih dahulu untuk mengambil berkas 10 siswa VII-B!')
        setTimeout(() => setDoorAlert(null), 3500)
      } else {
        gameAudio.playDoorOpen()
        onProceedToField()
      }
    }
  }, [
    showDataModal,
    showChalkboardModal,
    dialogueStage,
    handleAdvanceDialogue,
    nearTeacher,
    nearExitDoor,
    isDataCollected,
    onProceedToField,
  ])

  const handleInteractRef = useRef(handleInteract)
  useEffect(() => {
    handleInteractRef.current = handleInteract
  }, [handleInteract])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (showDataModal || showChalkboardModal) {
        if (k === 'escape') {
          setShowDataModal(false)
          setShowChalkboardModal(false)
        }
        return
      }

      if (KEY_MAP[k]) {
        e.preventDefault()
        pressedKeysRef.current.add(k)
        updateDirFromKeys()
      } else if (k === 'e' || k === ' ' || k === 'enter') {
        e.preventDefault()
        handleInteractRef.current()
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      pressedKeysRef.current.delete(k)
      updateDirFromKeys()
    }

    const onBlur = () => {
      pressedKeysRef.current.clear()
      dirRef.current = { x: 0, y: 0 }
      setMoveDir({ x: 0, y: 0 })
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [showDataModal, showChalkboardModal, updateDirFromKeys])

  // ── Physics & Movement Loop (Smooth 60fps) ───────────────────────
  useEffect(() => {
    const tick = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = now

      const isModalOpen = showDataModal || showChalkboardModal
      if (!isModalOpen) {
        let { x: dx, y: dy } = dirRef.current

        // Check if moving toward tap-to-walk destination
        const dest = targetDestRef.current
        if (dest && dx === 0 && dy === 0) {
          const distX = dest.x - charPosRef.current.x
          const distY = dest.y - charPosRef.current.y
          const remainingDist = Math.hypot(distX, distY)

          if (remainingDist < 8) {
            setTargetDestination(null)
            setMoveDir({ x: 0, y: 0 })
          } else {
            dx = distX / remainingDist
            dy = distY / remainingDist
            setMoveDir({ x: dx, y: dy })
          }
        }

        if (dx !== 0 || dy !== 0) {
          const moveSpeed = 260 // px/s smooth fluid walking
          const step = moveSpeed * dt

          setCharPos(prev => {
            const nextX = prev.x + dx * step
            const nextY = prev.y + dy * step

            // Check full walkable boundary
            if (checkClassroomWalkable(nextX, nextY)) {
              return { x: nextX, y: nextY }
            }

            // Horizontal slide
            if (checkClassroomWalkable(nextX, prev.y)) {
              return { x: nextX, y: prev.y }
            }

            // Vertical slide
            if (checkClassroomWalkable(prev.x, nextY)) {
              return { x: prev.x, y: nextY }
            }

            return prev
          })
        }
      }

      // Proximity checks
      const c = charPosRef.current
      const distTeacher = Math.hypot(c.x - teacherPos.x, c.y - teacherPos.y)
      const isNearT = distTeacher < 170
      setNearTeacher(prev => (prev !== isNearT ? isNearT : prev))

      const distExit = Math.hypot(c.x - exitDoorPos.x, c.y - exitDoorPos.y)
      const isNearE = distExit < 120
      setNearExitDoor(prev => (prev !== isNearE ? isNearE : prev))

      animRef.current = requestAnimationFrame(tick)
    }

    lastTimeRef.current = performance.now()
    animRef.current = requestAnimationFrame(tick)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [showDataModal, showChalkboardModal, teacherPos, exitDoorPos])

  // Handle floor click for Tap-to-Move
  const handleSvgFloorClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (showDataModal || showChalkboardModal) return
    const svgEl = svgRef.current
    if (!svgEl) return

    const rect = svgEl.getBoundingClientRect()
    const clickX = ((e.clientX - rect.left) / rect.width) * WORLD_VW
    const clickY = ((e.clientY - rect.top) / rect.height) * WORLD_VH

    if (checkClassroomWalkable(clickX, clickY)) {
      setTargetDestination({ x: clickX, y: clickY })
    }
  }

  // Student desk click reaction
  const handleDeskClick = (x: number, y: number) => {
    const reactions = [
      'Kami siap melempar sekuat tenaga, Pak Bambang! 🏃‍♂️',
      'Baju olahraga VII-B sudah rapi dan siap! 🏅',
      'Penasaran siapa lemparan paling jauh di kelas kita! 🎯',
      'Semoga lemparanku masuk kuartil atas (Q3)! ⚡',
      'Mean sama tapi sebarannya beda, keren banget logikanya! 💡',
      'Jangkauan lemparan kita pasti seru untuk dihitung! 📐',
    ]
    const randomReac = reactions[Math.floor(Math.random() * reactions.length)]
    setStudentReaction({ text: randomReac, x, y })
    playSound('chime')
    setTimeout(() => setStudentReaction(null), 3200)
  }

  // Collect data action
  const handleCollectData = () => {
    try {
      gameAudio.playSuccess()
      playSound('whistle')
    } catch {
      // Audio fallback
    }
    setIsDataCollected(true)
    setShowDataModal(false)
    setDialogueStage(null)
    showToast('🎉 Berkas 10 Siswa Berhasil Diambil! Ayo keluar lewat pintu ke lapangan olahraga!', 4000)
  }

  // ── Realistic Proportional Avatar Sizing ─────────────────────────
  // Pak Bambang (baju olahraga) is rendered with size=270 (visual height ~235px).
  // Stevunt occupies 62.9% of sprite cell, so size=310..410 gives visual height ~195px..258px!
  // Perfectly matches the seated students (280px with chair) and desks in Ruang VII-B!
  const depthRatio = Math.max(0, Math.min(1, (charPos.y - 440) / (720 - 440)))
  const charSize = 310 + depthRatio * 100

  const currentChatLine = dialogueStage !== null ? CLASSROOM_SCRIPT[dialogueStage] : null

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: '#07131E',
        userSelect: 'none',
      }}
    >
      {/* ── TOP HUD HEADER (LEVEL 1 / RETRO ASTU DESIGN) ── */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          right: 14,
          zIndex: 80,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* Left Mission Badge */}
        <div
          className="astu-dialogue-card"
          style={{
            marginLeft: 'clamp(80px, 9vw, 115px)',
            padding: '8px 16px',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            pointerEvents: 'auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          }}
        >
          <span className="astu-name-badge" style={{ fontSize: 11, padding: '3px 10px' }}>
            🏫 RUANG VII-B
          </span>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)' }} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: isDataCollected ? 'var(--astu-emerald)' : 'var(--astu-gold-bright)',
              fontFamily: 'var(--font-data)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>{isDataCollected ? '✅' : '📋'}</span>
            <span>
              {isDataCollected
                ? 'Data 10 Siswa Siap! Lanjut ke Pintu Lapangan'
                : 'Temui Pak Bambang untuk Ambil Data Siswa'}
            </span>
          </span>
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', gap: 10, pointerEvents: 'auto' }}>
          <button
            onClick={() => {
              playSound('chime')
              setShowChalkboardModal(true)
            }}
            className="astu-menu-btn"
            style={{
              padding: '7px 14px',
              fontSize: 11.5,
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1.5px solid #10B981',
              color: '#34D399',
            }}
          >
            📐 Catatan Rumus
          </button>

          {isDataCollected && (
            <button
              onClick={() => {
                gameAudio.playClick()
                setShowDataModal(true)
              }}
              className="astu-menu-btn"
              style={{
                padding: '7px 14px',
                fontSize: 11.5,
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1.5px solid #F59E0B',
                color: '#FCD34D',
              }}
            >
              📋 Berkas 10 Siswa
            </button>
          )}

          <button
            onClick={() => {
              playSound('whistle')
              onProceedToField()
            }}
            className="astu-menu-btn"
            style={{
              padding: '7px 14px',
              fontSize: 11.5,
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(14, 131, 136, 0.35) 100%)',
              border: '1.5px solid #38BDF8',
              color: '#38BDF8',
            }}
          >
            Lewati ke Lapangan ⏩
          </button>
        </div>
      </div>

      {/* ── SVG CLASSROOM WORLD (1376 x 768 NATIVE RESOLUTION) ── */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WORLD_VW} ${WORLD_VH}`}
        preserveAspectRatio="xMidYMid meet"
        onClick={handleSvgFloorClick}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          willChange: 'transform',
          cursor: 'pointer',
        }}
      >
        <defs>
          {/* Sunbeam Light Rays Gradient from Left Windows */}
          <linearGradient id="sunbeam-light-1" x1="0" y1="0" x2="0.65" y2="1">
            <stop offset="0%" stopColor="rgba(254, 240, 138, 0.25)" />
            <stop offset="45%" stopColor="rgba(254, 240, 138, 0.10)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="sunbeam-light-2" x1="0" y1="0.1" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(254, 240, 138, 0.16)" />
            <stop offset="60%" stopColor="rgba(254, 240, 138, 0.04)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* 1. Authentic Classroom Background (Ruang VII-B) */}
        <image
          href="/Assets/Building/Ruang VII-B/VII-B.webp"
          x={0}
          y={0}
          width={WORLD_VW}
          height={WORLD_VH}
          preserveAspectRatio="none"
        />

        {/* 2. Atmospheric Sunbeam Lighting */}
        <polygon points="0,0 320,0 560,768 140,768" fill="url(#sunbeam-light-1)" opacity={0.65} pointerEvents="none" />
        <polygon points="0,90 210,0 440,768 60,768" fill="url(#sunbeam-light-2)" opacity={0.45} pointerEvents="none" />

        {/* 3. Floating Ambient Sparkles / Dust Particles */}
        {[
          { x: 260, y: 440, size: 4 },
          { x: 420, y: 510, size: 3 },
          { x: 560, y: 420, size: 5 },
          { x: 740, y: 530, size: 3.5 },
          { x: 910, y: 450, size: 4 },
          { x: 1080, y: 540, size: 3 },
          { x: 1220, y: 490, size: 4.5 },
        ].map((mote, i) => (
          <circle
            key={`dust-mote-${i}`}
            cx={mote.x}
            cy={mote.y}
            r={mote.size}
            fill={i % 2 === 0 ? '#FDE047' : '#38BDF8'}
            opacity={0.45}
            pointerEvents="none"
          />
        ))}

        {/* ── 4. SEATED STUDENT DESKS HOTSPOTS ── */}
        {studentDesks.map(desk => (
          <g
            key={desk.id}
            style={{ cursor: 'pointer' }}
            onClick={e => {
              e.stopPropagation()
              handleDeskClick(desk.x, desk.y)
            }}
          >
            <ellipse cx={desk.x} cy={desk.y} rx={110} ry={50} fill="transparent" />
            <g transform={`translate(${desk.x}, ${desk.y - 50})`}>
              <rect
                x={-90}
                y={-15}
                width={180}
                height={28}
                rx={14}
                fill="rgba(15, 23, 42, 0.88)"
                stroke="rgba(245, 158, 11, 0.65)"
                strokeWidth={1.5}
              />
              <text
                x={0}
                y={4}
                textAnchor="middle"
                fill="#FCD34D"
                fontSize={10.5}
                fontWeight="800"
                fontFamily="var(--font-ui)"
              >
                👥 Siswa VII-B (Sapa)
              </text>
            </g>
          </g>
        ))}

        {/* Floating Student Reaction Speech Bubble */}
        {studentReaction && (
          <g transform={`translate(${studentReaction.x}, ${studentReaction.y - 85})`}>
            <rect
              x={-150}
              y={-22}
              width={300}
              height={44}
              rx={12}
              fill="rgba(15, 23, 42, 0.96)"
              stroke="#F59E0B"
              strokeWidth={2}
              style={{ filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.8))' }}
            />
            <polygon points="-8,22 8,22 0,32" fill="rgba(15, 23, 42, 0.96)" stroke="#F59E0B" strokeWidth={1} />
            <text
              x={0}
              y={5}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize={11}
              fontWeight="800"
              fontFamily="var(--font-ui)"
            >
              💬 {studentReaction.text}
            </text>
          </g>
        )}

        {/* ── 5. PAK BAMBANG (GURU OLAHRAGA - BAJU OLAHRAGA) ── */}
        <g
          id="teacher-pak-bambang"
          style={{ cursor: 'pointer' }}
          onClick={e => {
            e.stopPropagation()
            if (!isDataCollected) {
              setDialogueStage(0)
            } else {
              setShowDataModal(true)
            }
          }}
        >
          {/* Pak Bambang wearing Sports Jersey (baju olahraga) */}
          <FieldTeacher
            x={teacherPos.x}
            y={teacherPos.y}
            size={270}
            pose={dialogueStage !== null ? 'point' : isDataCollected ? 'cheer' : 'idle'}
            label=""
            showGlow={!isDataCollected}
            onClick={() => {
              if (!isDataCollected) {
                setDialogueStage(0)
              } else {
                setShowDataModal(true)
              }
            }}
          />

          {/* Interactive Speech Prompt above Pak Bambang (No chalkboard overlapping) */}
          {dialogueStage === null && (
            <g transform={`translate(${teacherPos.x}, ${teacherPos.y - 250})`}>
              <rect
                x={-120}
                y={-18}
                width={240}
                height={36}
                rx={18}
                fill="rgba(15, 23, 42, 0.95)"
                stroke={isDataCollected ? '#10B981' : '#F59E0B'}
                strokeWidth={2}
                style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.6))' }}
              />
              <polygon
                points="-8,18 8,18 0,26"
                fill="rgba(15, 23, 42, 0.95)"
                stroke={isDataCollected ? '#10B981' : '#F59E0B'}
                strokeWidth={1}
              />
              <text
                x={0}
                y={5}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize={11}
                fontWeight="900"
                fontFamily="var(--font-ui)"
              >
                {isDataCollected
                  ? '📋 [KLIK] Lihat Berkas 10 Siswa'
                  : '💬 [KLIK / SPASI] Ambil Data Siswa'}
              </text>
            </g>
          )}

          {/* Waypoint Arrow pointing to Pak Bambang */}
          {!isDataCollected && !nearTeacher && dialogueStage === null && (
            <g transform={`translate(${teacherPos.x}, ${teacherPos.y - 295})`}>
              <circle cx={0} cy={0} r={15} fill="rgba(245, 158, 11, 0.3)" stroke="#F59E0B" strokeWidth={2} />
              <text x={0} y={6} textAnchor="middle" fill="#FCD34D" fontSize={18} fontWeight="900">
                ↓
              </text>
            </g>
          )}
        </g>

        {/* ── 6. CLASSROOM EXIT DOOR (DOORWAY TO SPORTS FIELD) ── */}
        <g
          id="exit-door-to-field"
          style={{ cursor: 'pointer' }}
          onClick={e => {
            e.stopPropagation()
            if (!isDataCollected) {
              gameAudio.playError()
              setDoorAlert('⚠️ Temui Pak Bambang terlebih dahulu untuk mengambil berkas 10 siswa VII-B!')
              setTimeout(() => setDoorAlert(null), 3500)
            } else {
              gameAudio.playDoorOpen()
              onProceedToField()
            }
          }}
        >
          {/* Doorway interactive boundary */}
          <rect
            x={exitDoorPos.x - 60}
            y={exitDoorPos.y - 140}
            width={120}
            height={180}
            fill="transparent"
            stroke={isDataCollected ? '#10B981' : 'transparent'}
            strokeWidth={2}
            strokeDasharray={isDataCollected ? '6,6' : 'none'}
            rx={8}
          />

          {/* Doorway Prompt */}
          <g transform={`translate(${exitDoorPos.x}, ${exitDoorPos.y - 140})`}>
            <rect
              x={-115}
              y={-16}
              width={230}
              height={34}
              rx={17}
              fill="rgba(15, 23, 42, 0.95)"
              stroke={isDataCollected ? '#10B981' : 'rgba(255,255,255,0.3)'}
              strokeWidth={2}
              style={{
                filter: isDataCollected
                  ? 'drop-shadow(0 0 16px rgba(16, 185, 129, 0.6))'
                  : 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
              }}
            />
            <text
              x={0}
              y={5}
              textAnchor="middle"
              fill={isDataCollected ? '#34D399' : '#CBD5E1'}
              fontSize={11}
              fontWeight="900"
              fontFamily="var(--font-ui)"
            >
              {isDataCollected ? '🏃‍♂️ Menuju Lapangan Olahraga ►' : '🚪 Pintu ke Lapangan Olahraga'}
            </text>
          </g>

          {/* Pulsing Waypoint Arrow over Door when ready */}
          {isDataCollected && (
            <g transform={`translate(${exitDoorPos.x}, ${exitDoorPos.y - 185})`}>
              <circle cx={0} cy={0} r={16} fill="rgba(16, 185, 129, 0.35)" stroke="#10B981" strokeWidth={2.5} />
              <text x={0} y={6} textAnchor="middle" fill="#34D399" fontSize={18} fontWeight="900">
                ↓
              </text>
            </g>
          )}
        </g>

        {/* ── 7. TAP-TO-MOVE TARGET PULSE INDICATOR ── */}
        {targetDestination && (
          <g transform={`translate(${targetDestination.x}, ${targetDestination.y})`}>
            <ellipse rx={22} ry={11} fill="rgba(56, 189, 248, 0.25)" stroke="#38BDF8" strokeWidth={2} />
            <circle r={4} fill="#38BDF8" />
          </g>
        )}

        {/* ── 8. STEVUNT PLAYER CHARACTER (WELL-PROPORTIONED) ── */}
        <PlayerCharacter
          x={charPos.x}
          y={charPos.y}
          dir={moveDir}
          size={charSize}
          label=""
          glowColor="#00ADB5"
        />

        {/* Floating Door Alert Warning */}
        {doorAlert && (
          <g transform={`translate(${exitDoorPos.x - 70}, ${exitDoorPos.y - 195})`}>
            <rect
              x={-180}
              y={-18}
              width={360}
              height={38}
              rx={12}
              fill="rgba(239, 68, 68, 0.95)"
              stroke="#FCA5A5"
              strokeWidth={1.5}
              style={{ filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.8))' }}
            />
            <text
              x={0}
              y={5}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize={10.5}
              fontWeight="900"
              fontFamily="var(--font-ui)"
            >
              {doorAlert}
            </text>
          </g>
        )}

        {/* ── 9. ANCHORED IN-ROOM SPEECH BUBBLE (ANCHORED DIRECTLY OVER SPEAKER HEAD) ── */}
        {currentChatLine && (() => {
          const isTeacher = currentChatLine.speaker === 'teacher'
          const isPlayer = currentChatLine.speaker === 'player'
          const isDira = currentChatLine.speaker === 'dira'
          const themeColor = isTeacher ? '#F59E0B' : isPlayer ? '#38BDF8' : '#A78BFA'
          const badgeIcon = isTeacher ? '👨‍🏫' : isPlayer ? '🏃‍♂️' : '🤖'
          const isLastLine = dialogueStage === CLASSROOM_SCRIPT.length - 1

          // Anchored position directly above speaker head in native SVG coordinates (1376 x 768)
          const anchorX = isTeacher
            ? teacherPos.x
            : isPlayer
            ? charPos.x
            : WORLD_VW / 2

          // Head top coordinate in SVG world
          const anchorY = isTeacher
            ? teacherPos.y - 235
            : isPlayer
            ? charPos.y - charSize * 0.68
            : 160

          const bW = 520
          const bH = 125

          // Center bubble on character, clamped within room boundaries
          const bX = isDira
            ? (WORLD_VW - bW) / 2
            : Math.max(25, Math.min(WORLD_VW - bW - 25, anchorX - bW / 2))

          const bY = isDira
            ? 70
            : Math.max(25, anchorY - bH - 18)

          // Pointer connects smoothly to bubble bottom and points directly to speaker's head
          const pointerBaseX = Math.max(bX + 32, Math.min(bX + bW - 32, anchorX))

          return (
            <g
              key={`classroom-chat-${dialogueStage}`}
              style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            >
              {/* Downward Pointer Polygon connecting bubble bottom directly to character head */}
              {!isDira && (
                <polygon
                  points={`${pointerBaseX - 10},${bY + bH} ${pointerBaseX + 10},${bY + bH} ${anchorX},${anchorY}`}
                  fill="rgba(12, 26, 42, 0.97)"
                  stroke={themeColor}
                  strokeWidth={2}
                />
              )}

              <foreignObject
                x={bX}
                y={bY}
                width={bW}
                height={bH + 30}
                style={{ overflow: 'visible' }}
              >
                <div
                  onClick={handleAdvanceDialogue}
                  style={{
                    position: 'relative',
                    width: `${bW}px`,
                    minHeight: `${bH}px`,
                    background: 'rgba(12, 26, 42, 0.97)',
                    border: `2px solid ${themeColor}`,
                    borderRadius: '16px',
                    boxShadow: `0 14px 36px rgba(0,0,0,0.85), 0 0 20px ${themeColor}44`,
                    padding: '12px 18px',
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {/* Speaker Avatar Icon */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      background: `${themeColor}22`,
                      border: `1.5px solid ${themeColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    }}
                  >
                    {isTeacher ? (
                      <img
                        src="/Assets/Building/field/pak_bambang_sport_avatar.png"
                        alt="Pak Bambang"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : isDira ? (
                      <span style={{ fontSize: '32px' }}>🤖</span>
                    ) : (
                      <img
                        src="/Assets/Building/field/karakter_olahraga.png"
                        alt="Stevunt"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                      />
                    )}
                  </div>

                  {/* Dialog Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 900,
                          color: themeColor,
                          fontFamily: 'var(--font-ui)',
                          letterSpacing: '0.3px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>{badgeIcon}</span>
                        <span>{currentChatLine.speakerName}</span>
                      </span>

                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: isLastLine ? '#FDE68A' : themeColor,
                          fontFamily: 'var(--font-ui)',
                          background: isLastLine ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                          padding: isLastLine ? '2px 8px' : '0',
                          borderRadius: '6px',
                          letterSpacing: '0.3px',
                        }}
                      >
                        [ {currentChatLine.actionLabel} ]
                      </span>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: '13px',
                        fontWeight: 700,
                        lineHeight: 1.5,
                        color: '#FFFFFF',
                        fontFamily: 'var(--font-ui)',
                      }}
                    >
                      <Typewriter text={currentChatLine.text} />
                    </p>
                  </div>

                  {/* Skip Dialogue Button */}
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      playSound('chime')
                      setDialogueStage(null)
                      setShowDataModal(true)
                    }}
                    style={{
                      position: 'absolute',
                      top: -12,
                      right: 14,
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1.5px solid rgba(245, 158, 11, 0.5)',
                      borderRadius: '8px',
                      color: '#FCD34D',
                      fontSize: '9.5px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    Lewati ⏩
                  </button>
                </div>
              </foreignObject>
            </g>
          )
        })()}
      </svg>

      {/* ── 10. DATA SISWA KELAS VII-B MODAL (WALI KELAS ASTU DESIGN) ── */}
      <AnimatePresence>
        {showDataModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 900,
              background: 'rgba(8, 16, 26, 0.88)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 24 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="astu-dialogue-card"
              style={{
                maxWidth: 620,
                width: '100%',
                maxHeight: 'calc(100vh - 40px)',
                overflowY: 'auto',
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 25px rgba(245, 158, 11, 0.25)',
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid rgba(245, 158, 11, 0.3)', paddingBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="astu-name-badge" style={{ fontSize: 11, padding: '3px 10px' }}>
                      👨‍🏫 Pak Bambang
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#FCD34D', letterSpacing: '0.4px' }}>
                      BERKAS PENGUKURAN 10 SISWA VII-B
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                    Daftar 10 siswa yang akan diukur lemparan bolanya di lapangan sekolah
                  </div>
                </div>

                <button
                  onClick={() => setShowDataModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    fontSize: 20,
                    cursor: 'pointer',
                    padding: '4px 8px',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* 10 Students Responsive Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxHeight: '320px', overflowY: 'auto', paddingRight: 4 }}>
                {DEFAULT_STUDENT_PROFILES.map((student, idx) => (
                  <motion.div
                    key={`student-profile-${idx}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.025 }}
                    style={{
                      background: 'rgba(15, 30, 48, 0.85)',
                      border: '1.5px solid rgba(0, 173, 181, 0.3)',
                      borderRadius: 10,
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid #38BDF8',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 800, fontSize: 12.5, color: '#F8FAFC' }}>
                          {idx + 1}. {student.name}
                        </span>
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: 6,
                            background: student.gender === 'male' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(236, 72, 153, 0.2)',
                            color: student.gender === 'male' ? '#38BDF8' : '#F472B6',
                          }}
                        >
                          {student.gender === 'male' ? 'L' : 'P'}
                        </span>
                      </div>
                      <div style={{ fontSize: 10, color: '#34D399', fontWeight: 700, marginTop: 2 }}>
                        ⚡ Atlet Pelempar Siap
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Field Missions Summary */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1.5px dashed rgba(245, 158, 11, 0.4)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  fontSize: 11.5,
                  lineHeight: 1.5,
                  color: '#CBD5E1',
                }}
              >
                <div style={{ fontWeight: 900, color: '#FCD34D', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🎯</span>
                  <span>Rencana Investigasi Statistika di Lapangan:</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                  <div>• <b>Misi 1</b>: Hitung Jangkauan (Range = X_maks - X_min)</div>
                  <div>• <b>Misi 2</b>: Urutkan bendera 1 - 10</div>
                  <div>• <b>Misi 3</b>: Tentukan Kuartil Q1, Q2, Q3</div>
                  <div>• <b>Misi 4</b>: Hitung IQR & Simpangan Kuartil (Qd)</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button
                  className="astu-menu-btn"
                  style={{ flex: 1 }}
                  onClick={() => setShowDataModal(false)}
                >
                  ← Kembali ke Kelas
                </button>
                <button
                  className="astu-menu-btn astu-menu-btn-gold"
                  style={{
                    flex: 1.8,
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: '#0B1726',
                    fontWeight: 900,
                  }}
                  onClick={handleCollectData}
                >
                  📥 Ambil Berkas & Bawa ke Lapangan ►
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 11. PAPAN TULIS CHALKBOARD MODAL (ACCESSIBLE VIA TOP BAR) ── */}
      <AnimatePresence>
        {showChalkboardModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 950,
              background: 'rgba(5, 12, 20, 0.88)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setShowChalkboardModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                maxWidth: 620,
                width: '100%',
                background: 'linear-gradient(135deg, #132E27 0%, #0F231D 100%)',
                border: '4px solid #8B5A2B',
                borderRadius: 18,
                padding: '24px 28px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.9), inset 0 0 40px rgba(0,0,0,0.6)',
                color: '#F0FDF4',
                fontFamily: 'var(--font-ui, sans-serif)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed #10B981', paddingBottom: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#FCD34D', letterSpacing: '0.5px' }}>
                  📐 CATATAN PAPAN TULIS PAK BAMBANG
                </span>
                <button
                  onClick={() => setShowChalkboardModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: 20, cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13.5, lineHeight: 1.6 }}>
                <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 14px', borderRadius: 10, borderLeft: '4px solid #F59E0B' }}>
                  <div style={{ fontWeight: 900, color: '#FBBF24', marginBottom: 4 }}>1. Jangkauan / Range (R)</div>
                  <div>Selisih antara lemparan paling jauh (maksimum) dan paling dekat (minimum):</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 900, color: '#38BDF8', marginTop: 4 }}>
                    R = X_maks - X_min
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 14px', borderRadius: 10, borderLeft: '4px solid #38BDF8' }}>
                  <div style={{ fontWeight: 900, color: '#38BDF8', marginBottom: 4 }}>2. Tiga Kuartil (Q1, Q2, Q3)</div>
                  <div>Nilai pembagi yang memecah seluruh lemparan terurut menjadi 4 kelompok sama banyak:</div>
                  <div style={{ fontSize: 12.5, color: '#CBD5E1', marginTop: 4 }}>
                    • <b>Q1 (Kuartil Bawah)</b>: Batas 25% data pertama<br />
                    • <b>Q2 (Median)</b>: Nilai tengah (50% data)<br />
                    • <b>Q3 (Kuartil Atas)</b>: Batas 75% data
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 14px', borderRadius: 10, borderLeft: '4px solid #10B981' }}>
                  <div style={{ fontWeight: 900, color: '#34D399', marginBottom: 4 }}>3. Jangkauan Kuartil / IQR</div>
                  <div>Rentang sebaran 50% data yang berada tepat di bagian tengah:</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 900, color: '#FCD34D', marginTop: 4 }}>
                    IQR = Q3 - Q1
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 14px', borderRadius: 10, borderLeft: '4px solid #EC4899' }}>
                  <div style={{ fontWeight: 900, color: '#F472B6', marginBottom: 4 }}>4. Simpangan Kuartil (Qd)</div>
                  <div>Setengah dari jangkauan kuartil (mengukur rata-rata penyebaran data di sekitar median):</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 900, color: '#FCD34D', marginTop: 4 }}>
                    Qd = ½(Q3 - Q1) = ½ × IQR
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button
                  onClick={() => {
                    playSound('chime')
                    setShowChalkboardModal(false)
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: 13,
                    padding: '9px 20px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  OK, Paham Pak Bambang! 👍
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 12. FLOATING TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: 'absolute',
              top: 70,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 200,
              background: 'rgba(15, 23, 42, 0.96)',
              border: '2px solid #10B981',
              borderRadius: 14,
              padding: '12px 24px',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 800,
              boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(16, 185, 129, 0.4)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 13. JOYSTICK CONTROLS (BOTTOM-LEFT) ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 22,
          left: 22,
          zIndex: 90,
          touchAction: 'none',
        }}
      >
        <Joystick
          onDir={(x, y) => {
            const nextDir = { x, y }
            dirRef.current = nextDir
            setMoveDir(nextDir)
            if (x !== 0 || y !== 0) {
              setTargetDestination(null)
            }
          }}
        />
      </div>

      {/* ── 14. BOTTOM-RIGHT ACTION BUTTON (PROCEED TO FIELD) ── */}
      {isDataCollected && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            gameAudio.playDoorOpen()
            onProceedToField()
          }}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            zIndex: 90,
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            border: '2px solid #A7F3D0',
            borderRadius: 16,
            padding: '12px 22px',
            color: '#FFFFFF',
            fontSize: 13.5,
            fontWeight: 900,
            fontFamily: 'var(--font-ui)',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.5)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>🏃‍♂️</span>
          <span>Ke Lapangan Olahraga ►</span>
        </motion.button>
      )}
    </div>
  )
}
