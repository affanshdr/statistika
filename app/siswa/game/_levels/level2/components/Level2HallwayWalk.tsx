'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PlayerCharacter from '@/app/siswa/game/_components/PlayerCharacter'
import NPCCharacter from '@/app/siswa/game/_components/NPCCharacter'
import { gameAudio } from '@/lib/utils/gameAudio'
import {
  WORLD_VW,
  WORLD_VH,
  RED_LINE_POINTS,
  PAK_SUTRISNO_POS,
  getRedLineY,
  checkHallwayWalkable,
} from '@/app/siswa/game/_levels/level1/config/level1MapConfig'

// ─── HALLWAY DOORS DATA ──────────────────────────────────────────
interface HallwayDoor {
  id: string
  label: string
  subLabel: string
  x: number
  y: number
  color: string
  isTarget?: boolean
}

const HALLWAY_DOORS: HallwayDoor[] = [
  {
    id: 'A1',
    label: 'Kelas VII-A',
    subLabel: 'Wali Kelas: Bu Sari',
    x: 135,
    y: 475,
    color: '#818cf8',
  },
  {
    id: 'A2',
    label: 'Kelas VII-B',
    subLabel: 'Pak Bambang (Tujuan Misi)',
    x: 250,
    y: 385,
    color: '#F59E0B',
    isTarget: true,
  },
  {
    id: 'RG',
    label: 'Ruang Guru',
    subLabel: 'Pak Sutrisno',
    x: 625,
    y: 345,
    color: '#10B981',
  },
  {
    id: 'B1',
    label: 'Kelas VIII-A',
    subLabel: 'Bu Rina',
    x: 985,
    y: 385,
    color: '#00ADB5',
  },
  {
    id: 'B2',
    label: 'Kelas VIII-B',
    subLabel: 'Pak Setiawan',
    x: 1100,
    y: 475,
    color: '#0e8388',
  },
]

// ─── ENTRANCE QUIZ DATA (JANGKAUAN, KUARTIL, SIMPANGAN KUARTIL) ──
interface QuizQuestion {
  category: string
  badgeText: string
  question: string
  hints: string[]
  choices: string[]
  correctIndex: number
  explanation: string
}

const ENTRANCE_QUIZ: QuizQuestion[] = [
  {
    category: 'JANGKAUAN (RANGE)',
    badgeText: '📊 1. Jangkauan Data',
    question: 'Dalam statistika, apa yang dimaksud dengan Jangkauan (Range) dari sekumpulan data?',
    hints: [
      '💡 Petunjuk 1: Jangkauan (Range) mengukur bentangan sebaran dari data paling kecil sampai data paling besar.',
      '💡 Petunjuk 2: Rumus: Jangkauan (R) = Nilai Terbesar (X_maks) − Nilai Terkecil (X_min).',
    ],
    choices: [
      'Selisih antara nilai terbesar dan nilai terkecil',
      'Rata-rata dari seluruh nilai data',
      'Nilai tengah data setelah diurutkan',
      'Nilai data yang frekuensinya paling banyak',
    ],
    correctIndex: 0,
    explanation: 'Tepat sekali! Jangkauan (Range) mengukur bentangan sebaran dengan mengurangkan nilai terkecil dari nilai terbesar: R = X_maks − X_min.',
  },
  {
    category: 'KUARTIL DATA',
    badgeText: '📊 2. Kuartil (Q1, Q2, Q3)',
    question: 'Nilai-nilai Kuartil (Q1, Q2, Q3) membagi sekumpulan data yang telah diurutkan menjadi...',
    hints: [
      '💡 Petunjuk 1: Awalan kata "Kuartil" berasal dari kata kuarter (quarter / seperempat bagian).',
      '💡 Petunjuk 2: Tiga nilai kuartil (Q1, Q2, Q3) membagi seluruh data terurut menjadi 4 kelompok sama banyak (masing-masing 25% data).',
    ],
    choices: [
      '4 bagian yang sama banyak',
      '2 bagian yang sama besar',
      '3 bagian kelompok terpisah',
      '10 bagian secara berurutan',
    ],
    correctIndex: 0,
    explanation: 'Benar! Tiga nilai kuartil (Q1, Q2, Q3) membagi seluruh data terurut menjadi 4 bagian sama banyak, di mana setiap bagian memuat 25% data.',
  },
  {
    category: 'SIMPANGAN KUARTIL',
    badgeText: '📊 3. Simpangan Kuartil (Qd)',
    question: 'Simpangan kuartil (Qd) adalah setengah dari jangkauan interkuartil: Qd = 1/2 × (Q3 − Q1). Jika diketahui Q1 = 14 dan Q3 = 26, berapakah nilai simpangan kuartilnya?',
    hints: [
      '💡 Petunjuk 1: Hitung jangkauan interkuartil terlebih dahulu dengan mengurangkan Q3 − Q1 (26 − 14 = 12).',
      '💡 Petunjuk 2: Simpangan Kuartil: Qd = ½ × (Q3 − Q1) = ½ × (26 − 14) = ½ × 12 = 6.',
    ],
    choices: [
      '6',
      '12',
      '14',
      '20',
    ],
    correctIndex: 0,
    explanation: 'Luar biasa! Jangkauan interkuartilnya adalah 26 − 14 = 12. Maka simpangan kuartilnya adalah Qd = 1/2 × 12 = 6.',
  },
]

// ─── JOYSTICK COMPONENT (IDENTICAL TO LEVEL 1) ───────────────────
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
        outer.current?.setPointerCapture(e.pointerId)
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

// ─── MAIN LEVEL 2 HALLWAY COMPONENT ──────────────────────────────
interface Level2HallwayWalkProps {
  studentName?: string
  onEnterClassroom: () => void
}

export default function Level2HallwayWalk({
  studentName = 'Stevunt',
  onEnterClassroom,
}: Level2HallwayWalkProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ w: 900, h: 500 })

  // Character movement states
  // Start player in the right-center hallway, walking toward Kelas VII-B on the left
  const [charPos, setCharPos] = useState({ x: 560, y: 520 })
  const charPosRef = useRef(charPos)
  charPosRef.current = charPos

  const [moveDir, setMoveDir] = useState({ x: 0, y: 0 })
  const dirRef = useRef({ x: 0, y: 0 })
  const pressedKeysRef = useRef<Set<string>>(new Set())
  const smoothCamPos = useRef({ x: 560, y: 520 })
  const animRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(performance.now())

  // Proximity & Interaction states
  const targetDoor = HALLWAY_DOORS.find(d => d.id === 'A2')! // Kelas VII-B
  const [nearDoor, setNearDoor] = useState(false)
  const [nearPakSutrisno, setNearPakSutrisno] = useState(false)
  const [npcDialog, setNpcDialog] = useState<string | null>(null)

  const nearDoorRef = useRef(nearDoor)
  useEffect(() => {
    nearDoorRef.current = nearDoor
  }, [nearDoor])

  // Quiz Modal states
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [quizIndex, setQuizIndex] = useState(0)
  const [placedChoice, setPlacedChoice] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isWrong, setIsWrong] = useState(false)
  const [shake, setShake] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)

  // Track container size for dynamic responsive viewport
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const updateSize = () => {
      setContainerSize({ w: el.clientWidth || 900, h: el.clientHeight || 500 })
    }
    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // ── Keyboard Controls ──────────────────────────────────────────
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
  }, [])

  const handleOpenDoorQuiz = useCallback(() => {
    gameAudio.playClick()
    setShowQuizModal(true)
    setQuizIndex(0)
    setPlacedChoice(null)
    setIsCorrect(false)
    setIsWrong(false)
    setQuizCompleted(false)
    setWrongAttempts(0)
  }, [])

  const handleOpenDoorQuizRef = useRef(handleOpenDoorQuiz)
  useEffect(() => {
    handleOpenDoorQuizRef.current = handleOpenDoorQuiz
  }, [handleOpenDoorQuiz])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (showQuizModal) return
      const k = e.key.toLowerCase()
      if (KEY_MAP[k]) {
        e.preventDefault()
        pressedKeysRef.current.add(k)
        updateDirFromKeys()
      } else if (k === 'e' || k === ' ' || k === 'enter') {
        if (nearDoorRef.current) {
          e.preventDefault()
          handleOpenDoorQuizRef.current()
        }
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
  }, [showQuizModal, updateDirFromKeys])

  // ── Physics & Movement Loop (Smooth 60fps) ─────────────────────
  useEffect(() => {
    const tick = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = now

      if (!showQuizModal) {
        const { x: dx, y: dy } = dirRef.current
        if (dx !== 0 || dy !== 0) {
          const moveSpeed = 4.5 * 40 // 180px/s smooth fluid walking
          const dist = moveSpeed * dt

          setCharPos(prev => {
            const minX = 70
            const maxX = 1165
            const maxY = 640

            const clampedX = Math.max(minX, Math.min(maxX, prev.x))
            const clampedY = Math.max(getRedLineY(clampedX), Math.min(maxY, prev.y))

            const targetX = Math.max(minX, Math.min(maxX, clampedX + dx * dist))
            const targetMinY = getRedLineY(targetX)
            const targetY = Math.max(targetMinY, Math.min(maxY, clampedY + dy * dist))

            // Direct move check
            if (checkHallwayWalkable(targetX, targetY)) {
              return { x: targetX, y: targetY }
            }

            // Slide horizontally with slope adaptation
            const slopeY = Math.max(getRedLineY(targetX), clampedY)
            if (slopeY <= maxY && checkHallwayWalkable(targetX, slopeY)) {
              return { x: targetX, y: slopeY }
            }

            // Slide vertically
            if (checkHallwayWalkable(clampedX, targetY)) {
              return { x: clampedX, y: targetY }
            }

            return { x: clampedX, y: clampedY }
          })
        }
      }

      // Smooth camera interpolation
      smoothCamPos.current.x += (charPosRef.current.x - smoothCamPos.current.x) * 0.1
      smoothCamPos.current.y += (charPosRef.current.y - smoothCamPos.current.y) * 0.1

      // Proximity checks (guarded against redundant state updates)
      const distToVIIB = Math.hypot(charPosRef.current.x - targetDoor.x, charPosRef.current.y - targetDoor.y)
      const isNearVIIB = distToVIIB < 85
      setNearDoor(prev => (prev !== isNearVIIB ? isNearVIIB : prev))

      const distToPakSutrisno = Math.hypot(
        charPosRef.current.x - PAK_SUTRISNO_POS.x,
        charPosRef.current.y - PAK_SUTRISNO_POS.y
      )
      const isNearPak = distToPakSutrisno < 95
      setNearPakSutrisno(prev => (prev !== isNearPak ? isNearPak : prev))

      animRef.current = requestAnimationFrame(tick)
    }

    lastTimeRef.current = performance.now()
    animRef.current = requestAnimationFrame(tick)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [showQuizModal, targetDoor])

  // ── Quiz Answering Logic ───────────────────────────────────────
  const currentQ = ENTRANCE_QUIZ[quizIndex]

  const handleSelectChoice = (choiceIdx: number) => {
    if (placedChoice !== null) return
    setPlacedChoice(choiceIdx)

    if (choiceIdx === currentQ.correctIndex) {
      try {
        gameAudio.playSuccess()
      } catch (err) {
        console.error('Audio error:', err)
      }
      setIsCorrect(true)
      setIsWrong(false)

      setTimeout(() => {
        if (quizIndex < ENTRANCE_QUIZ.length - 1) {
          setQuizIndex(prev => prev + 1)
          setPlacedChoice(null)
          setIsCorrect(false)
          setIsWrong(false)
          setWrongAttempts(0)
        } else {
          // Completed all 3 questions!
          setQuizCompleted(true)
          try {
            gameAudio.playUnlockJingle()
          } catch (err) {
            console.error('Audio error:', err)
          }
        }
      }, 1000)
    } else {
      try {
        gameAudio.playError()
      } catch (err) {
        console.error('Audio error:', err)
      }
      setIsWrong(true)
      setIsCorrect(false)
      setWrongAttempts(prev => prev + 1)
      setShake(k => k + 1)
      setTimeout(() => {
        setPlacedChoice(null)
        setIsWrong(false)
      }, 850)
    }
  }

  const handleFinishQuizAndEnterClass = () => {
    gameAudio.playDoorOpen()
    setShowQuizModal(false)
    onEnterClassroom()
  }

  // ── Camera calculations ────────────────────────────────────────
  const aspect = containerSize.w / Math.max(containerSize.h, 1)
  let viewVW = 380
  let viewVH = 380
  if (aspect > 1) {
    viewVW = 380 * aspect
    viewVH = 380
  } else {
    viewVW = 380
    viewVH = 380 / aspect
  }
  if (viewVW > WORLD_VW) {
    viewVW = WORLD_VW
    viewVH = WORLD_VW / aspect
  }

  const camX = Math.max(0, Math.min(WORLD_VW - viewVW, smoothCamPos.current.x - viewVW / 2))
  const camY = Math.max(0, Math.min(WORLD_VH - viewVH, smoothCamPos.current.y - viewVH * 0.65))

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
      {/* ── TOP HUD HEADER (MATCHES LEVEL 1 HUD DESIGN) ── */}
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
            marginLeft: 'clamp(85px, 10vw, 115px)',
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
            🏫 KELAS VII-B
          </span>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)' }} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: 'var(--astu-gold-bright)',
              fontFamily: 'var(--font-data)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>🏃</span>
            <span>Jalan menuju Ruang Kelas VII-B (Pak Bambang)</span>
          </span>
        </div>

        {/* Right Skip Button */}
        <button
          onClick={onEnterClassroom}
          className="astu-menu-btn"
          style={{
            pointerEvents: 'auto',
            padding: '7px 14px',
            fontSize: 11.5,
            background: 'rgba(15, 23, 42, 0.88)',
            border: '1.5px solid rgba(56, 189, 248, 0.5)',
            color: '#38BDF8',
          }}
        >
          Lewati ke Kelas ⏩
        </button>
      </div>

      {/* ── SVG GAME WORLD ── */}
      <svg
        viewBox={`${camX} ${camY} ${viewVW} ${viewVH}`}
        preserveAspectRatio="none"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          willChange: 'transform',
        }}
      >
        {/* Hallway Background Image */}
        <image
          href="/Assets/Building/Kelas.webp"
          x={0}
          y={0}
          width={WORLD_VW}
          height={WORLD_VH}
          preserveAspectRatio="none"
        />

        {/* Dark Vignette Tint Overlay for Atmospheric Depth */}
        <rect x={0} y={0} width={WORLD_VW} height={WORLD_VH} fill="rgba(4, 7, 10, 0.16)" pointerEvents="none" />

        {/* Floating Ambient Sparkles / Dust Motes */}
        {[
          { x: 220, y: 440, size: 4, dur: 4 },
          { x: 380, y: 390, size: 3, dur: 5 },
          { x: 580, y: 460, size: 4.5, dur: 4.2 },
          { x: 780, y: 420, size: 3.5, dur: 5.5 },
          { x: 920, y: 480, size: 4, dur: 4.8 },
          { x: 1040, y: 440, size: 3, dur: 5.2 },
        ].map((mote, i) => (
          <circle
            key={`dust-${i}`}
            cx={mote.x}
            cy={mote.y}
            r={mote.size}
            fill="#FDE047"
            opacity={0.4}
            style={{ pointerEvents: 'none' }}
          />
        ))}

        {/* ── CLASSROOM DOORS & HOTSPOTS ── */}
        {HALLWAY_DOORS.map(door => {
          const isTarget = door.isTarget
          const isNear = isTarget && nearDoor

          return (
            <g
              key={door.id}
              id={`door-${door.id}`}
              style={{ cursor: isTarget ? 'pointer' : 'pointer' }}
              onClick={() => {
                if (isTarget) {
                  handleOpenDoorQuiz()
                } else {
                  setNpcDialog(`Ini ${door.label}. Pak Bambang sudah menunggumu di Ruang Kelas VII-B! 🏃‍♂️`)
                  setTimeout(() => setNpcDialog(null), 3000)
                }
              }}
            >
              {/* Pulsing Radar Glow */}
              {isTarget ? (
                <>
                  <motion.circle
                    cx={door.x}
                    cy={door.y}
                    r={24}
                    fill="rgba(245, 158, 11, 0.25)"
                    animate={{
                      scale: [1, 1.55, 1],
                      fill: ['rgba(245, 158, 11, 0.25)', 'rgba(245, 158, 11, 0.65)', 'rgba(245, 158, 11, 0.25)'],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <circle cx={door.x} cy={door.y} r={14} fill="#F59E0B" stroke="#FFFFFF" strokeWidth={2} />
                  <text
                    x={door.x}
                    y={door.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={11}
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    🚪
                  </text>
                </>
              ) : (
                <>
                  <circle cx={door.x} cy={door.y} r={12} fill="rgba(15, 23, 42, 0.85)" stroke={door.color} strokeWidth={1.5} />
                  <text
                    x={door.x}
                    y={door.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9}
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    📍
                  </text>
                </>
              )}

              {/* Title Card Badge */}
              <rect
                x={door.x - (isTarget ? 65 : 44)}
                y={door.y - (isTarget ? 46 : 36)}
                width={isTarget ? 130 : 88}
                height={isTarget ? 34 : 20}
                rx={6}
                fill="rgba(15, 23, 42, 0.94)"
                stroke={isNear ? '#FFFFFF' : isTarget ? '#F59E0B' : door.color}
                strokeWidth={isNear ? 2 : 1.5}
                style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.7))' }}
              />
              <text
                x={door.x}
                y={door.y - (isTarget ? 30 : 22)}
                textAnchor="middle"
                fill={isTarget ? '#FCD34D' : door.color}
                fontSize={isTarget ? 10.5 : 9}
                fontWeight="900"
                fontFamily="var(--font-ui)"
              >
                {door.label}
              </text>
              {isTarget && (
                <text
                  x={door.x}
                  y={door.y - 18}
                  textAnchor="middle"
                  fill="#6EE7B7"
                  fontSize={8}
                  fontWeight="800"
                  fontFamily="var(--font-ui)"
                >
                  📍 MASUK KE SINI
                </text>
              )}
            </g>
          )
        })}

        {/* ── PAK SUTRISNO NPC (HALLWAY ATMOSPHERE MATCHING LEVEL 1) ── */}
        <g
          id="npc-pak-sutrisno"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setNpcDialog('Pak Sutrisno: "Halo Stevunt! Ayo lekas masuk ke Ruang Kelas VII-B, Pak Bambang sudah menunggumu untuk materi Ukuran Penyebaran Data!"')
            setTimeout(() => setNpcDialog(null), 4000)
          }}
        >
          <NPCCharacter
            x={PAK_SUTRISNO_POS.x}
            y={PAK_SUTRISNO_POS.y}
            size={145}
            label="Pak Sutrisno"
            spriteUrl="/Assets/Character/pak Sutrisno-iso_idle_right-trimmed.png"
            cols={5}
            rows={4}
            totalFrames={20}
            speedMs={120}
            glowColor="#38BDF8"
            showGlow={true}
          />

          {/* Dialogue balloon if clicked */}
          {npcDialog && (
            <g>
              <rect
                x={PAK_SUTRISNO_POS.x - 140}
                y={PAK_SUTRISNO_POS.y - 130}
                width={280}
                height={52}
                rx={10}
                fill="rgba(15, 35, 56, 0.96)"
                stroke="#38BDF8"
                strokeWidth={1.5}
                style={{ filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.8))' }}
              />
              <polygon
                points={`${PAK_SUTRISNO_POS.x - 8},${PAK_SUTRISNO_POS.y - 78} ${PAK_SUTRISNO_POS.x + 8},${PAK_SUTRISNO_POS.y - 78} ${PAK_SUTRISNO_POS.x},${PAK_SUTRISNO_POS.y - 68}`}
                fill="rgba(15, 35, 56, 0.96)"
                stroke="#38BDF8"
                strokeWidth={1}
              />
              <text
                x={PAK_SUTRISNO_POS.x}
                y={PAK_SUTRISNO_POS.y - 106}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize={10}
                fontWeight="700"
                fontFamily="var(--font-ui)"
              >
                {npcDialog.slice(0, 48)}
              </text>
              <text
                x={PAK_SUTRISNO_POS.x}
                y={PAK_SUTRISNO_POS.y - 92}
                textAnchor="middle"
                fill="#FCD34D"
                fontSize={9.5}
                fontWeight="700"
                fontFamily="var(--font-ui)"
              >
                {npcDialog.slice(48)}
              </text>
            </g>
          )}
        </g>

        {/* ── PLAYER CHARACTER (STEVUNT) ── */}
        <PlayerCharacter
          x={charPos.x}
          y={charPos.y}
          dir={moveDir}
          size={145}
          label={studentName || 'Stevunt'}
          glowColor="#00ADB5"
        />

        {/* ── FLOATING ACTION PROMPT OVER PLAYER HEAD (WHEN NEAR DOOR) ── */}
        {nearDoor && !showQuizModal && (
          <motion.g
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: [0, -5, 0] }}
            transition={{ y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } }}
            style={{ cursor: 'pointer' }}
            onClick={handleOpenDoorQuiz}
          >
            <rect
              x={charPos.x - 85}
              y={charPos.y - 170}
              width={170}
              height={36}
              rx={10}
              fill="rgba(15, 23, 42, 0.96)"
              stroke="#F59E0B"
              strokeWidth={2}
              style={{ filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.85))' }}
            />
            <polygon
              points={`${charPos.x - 8},${charPos.y - 134} ${charPos.x + 8},${charPos.y - 134} ${charPos.x},${charPos.y - 124}`}
              fill="rgba(15, 23, 42, 0.96)"
              stroke="#F59E0B"
              strokeWidth={1.5}
            />
            <text
              x={charPos.x}
              y={charPos.y - 152}
              textAnchor="middle"
              fill="#FCD34D"
              fontSize={11.5}
              fontWeight="900"
              fontFamily="var(--font-ui)"
            >
              [ E ] 🚪 Masuk Kelas VII-B
            </text>
            <text
              x={charPos.x}
              y={charPos.y - 140}
              textAnchor="middle"
              fill="#A7F3D0"
              fontSize={8.5}
              fontWeight="800"
              fontFamily="var(--font-ui)"
            >
              Ketuk untuk Menjawab Soal
            </text>
          </motion.g>
        )}
      </svg>

      {/* ── JOYSTICK CONTROLS (BOTTOM-LEFT) ── */}
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
          }}
        />
      </div>

      {/* ── MOBILE QUICK ACTION BUTTON (BOTTOM-RIGHT WHEN NEAR DOOR) ── */}
      {nearDoor && !showQuizModal && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleOpenDoorQuiz}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            zIndex: 90,
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            border: '2px solid #FDE68A',
            borderRadius: 16,
            padding: '12px 20px',
            color: '#0B1726',
            fontSize: 14,
            fontWeight: 900,
            fontFamily: 'var(--font-ui)',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.5)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>🚪</span>
          <span>Buka Pintu Kelas</span>
        </motion.button>
      )}

      {/* ── ENTRANCE QUIZ MODAL (EXACT LEVEL 1 ASTU DESIGN) ── */}
      <AnimatePresence>
        {showQuizModal && (
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
              padding: 20,
            }}
          >
            {/* CSS Shake Animation for Wrong Answer */}
            <style>{`
              @keyframes astu-card-shake {
                0%, 100% { transform: translate3d(0, 0, 0); }
                15% { transform: translate3d(-10px, 0, 0); }
                30% { transform: translate3d(10px, 0, 0); }
                45% { transform: translate3d(-8px, 0, 0); }
                60% { transform: translate3d(8px, 0, 0); }
                75% { transform: translate3d(-4px, 0, 0); }
                90% { transform: translate3d(4px, 0, 0); }
              }
              .astu-card-shake {
                animation: astu-card-shake 0.45s ease-in-out !important;
              }
            `}</style>

            <motion.div
              key={`quiz-card-${quizIndex}`}
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{ opacity: 0, scale: 0.88, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`astu-dialogue-card ${isWrong ? 'astu-card-shake' : ''}`}
              style={{
                maxWidth: 480,
                width: '100%',
                maxHeight: 'calc(100vh - 40px)',
                overflowY: 'auto',
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {!quizCompleted ? (
                <>
                  {/* ASTU Retro Speaker Badge & Progress */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span className="astu-name-badge">
                      <span>📍</span> Ruang Kelas VII-B
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        color: 'var(--astu-gold-bright)',
                        fontFamily: 'var(--font-data)',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        padding: '3px 8px',
                        borderRadius: 6,
                      }}
                    >
                      SOAL {quizIndex + 1} / {ENTRANCE_QUIZ.length}
                    </span>
                  </div>

                  {/* Topic Category Tag */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        color: '#38BDF8',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {currentQ.badgeText}
                    </span>
                    <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700 }}>
                      Kuis Prasyarat Masuk
                    </span>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    Sebelum masuk dan berdiskusi dengan Pak Bambang, buktikan pemahamanmu mengenai materi ini:
                  </p>

                  {/* Question Box */}
                  <div
                    style={{
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1.5px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: 12,
                      padding: '16px 14px',
                      textAlign: 'center',
                      boxShadow: 'inset 0 0 15px rgba(245, 158, 11, 0.05)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14.5,
                        fontWeight: 900,
                        color: '#FFFFFF',
                        lineHeight: 1.55,
                      }}
                    >
                      &quot;{currentQ.question}&quot;
                    </div>

                    {wrongAttempts > 0 && currentQ.hints && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          marginTop: 10,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: '#FDE68A',
                          background: 'rgba(245, 158, 11, 0.16)',
                          border: '1px solid #F59E0B',
                          padding: '6px 10px',
                          borderRadius: 8,
                          textAlign: 'center',
                          lineHeight: 1.45,
                        }}
                      >
                        {wrongAttempts === 1
                          ? currentQ.hints[0]
                          : currentQ.hints[1] || currentQ.hints[0]}
                      </motion.div>
                    )}
                  </div>

                  {/* Choice Selection Grid (2 Columns, ASTU Style) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {currentQ.choices.map((choiceText, idx) => {
                      const isSelected = placedChoice === idx
                      const isOptionCorrect = isSelected && isCorrect
                      const isOptionWrong = isSelected && isWrong

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectChoice(idx)}
                          disabled={placedChoice !== null}
                          style={{
                            padding: '12px 10px',
                            borderRadius: 10,
                            background: isOptionCorrect
                              ? 'linear-gradient(135deg, #10B981, #059669)'
                              : isOptionWrong
                              ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                              : 'rgba(20, 42, 66, 0.85)',
                            border: isOptionCorrect
                              ? '2px solid #6EE7B7'
                              : isOptionWrong
                              ? '2px solid #FCA5A5'
                              : '1.5px solid rgba(0, 173, 181, 0.35)',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: 12.5,
                            cursor: placedChoice !== null ? 'default' : 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: isSelected ? '0 4px 14px rgba(0,0,0,0.5)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            gap: 6,
                            minHeight: 52,
                          }}
                        >
                          <span style={{ color: 'var(--astu-gold-bright)', fontSize: 11 }}>►</span>
                          <span>{choiceText}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Feedback Message */}
                  {isCorrect && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1.5px solid #10B981',
                        borderRadius: 10,
                        color: '#6EE7B7',
                        fontSize: 12,
                        fontWeight: 800,
                        textAlign: 'center',
                      }}
                    >
                      ✓ {currentQ.explanation}
                    </motion.div>
                  )}

                  {isWrong && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1.5px solid #EF4444',
                        borderRadius: 10,
                        color: '#FCA5A5',
                        fontSize: 11.5,
                        fontWeight: 800,
                        textAlign: 'center',
                      }}
                    >
                      ✕ Jawaban belum tepat! Cermati petunjuk rumusnya di atas ya.
                    </motion.div>
                  )}

                  {/* Action Footer */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button
                      className="astu-menu-btn"
                      style={{ flex: 1 }}
                      onClick={() => setShowQuizModal(false)}
                    >
                      ← Batal
                    </button>
                    <button
                      className="astu-menu-btn"
                      style={{ flex: 1, background: 'rgba(56, 189, 248, 0.15)', border: '1.5px solid #38BDF8', color: '#38BDF8' }}
                      onClick={handleFinishQuizAndEnterClass}
                    >
                      Lewati Soal ⏩
                    </button>
                  </div>
                </>
              ) : (
                /* Celebration Card when all 3 completed */
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.25, 1] }}
                    transition={{ duration: 0.5 }}
                    style={{ fontSize: 48 }}
                  >
                    🎉✨🚪
                  </motion.div>
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 900, color: '#FCD34D' }}>
                      Akses Masuk Terbuka!
                    </h3>
                    <p style={{ margin: 0, fontSize: 13, color: '#CBD5E1', lineHeight: 1.5 }}>
                      Kamu berhasil menjawab 3 tantangan konsep: <b>Jangkauan</b>, <b>Kuartil</b>, dan <b>Simpangan Kuartil</b> dengan sangat baik!
                    </p>
                  </div>
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1.5px solid #10B981',
                      borderRadius: 12,
                      padding: '10px 14px',
                      color: '#6EE7B7',
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    Pak Bambang dan teman-teman kelas VII-B sudah siap di dalam kelas!
                  </div>
                  <button
                    className="astu-menu-btn astu-menu-btn-gold"
                    style={{ padding: '12px 20px', fontSize: 13.5, fontWeight: 900 }}
                    onClick={handleFinishQuizAndEnterClass}
                  >
                    🚪 Masuk ke Ruang Kelas Sekarang ►
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
