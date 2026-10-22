'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StudentThrowData, ComputedStats, formatDistance } from '../data/level2StatData'

// ──────────────────────────────────────────────────────
// BOX COORDINATES ON THE FIELD (INSIDE TOP OF FIELD)
// ──────────────────────────────────────────────────────
export const SORTING_BOX_POSITIONS: { x: number; y: number }[] = Array.from({ length: 10 }).map((_, idx) => ({
  x: 180 + idx * 113,
  y: 215,
}))

// ──────────────────────────────────────────────────────
// SVG FIELD BOXES GROUP COMPONENT
// ──────────────────────────────────────────────────────
interface FieldSortingBoxesGroupProps {
  boxes: (StudentThrowData | null)[]
  playerPos: { x: number; y: number }
  carryingFlag: StudentThrowData | null
  onBoxClick: (boxIndex: number) => void
}

export function FieldSortingBoxesGroup({
  boxes,
  playerPos,
  carryingFlag,
  onBoxClick,
}: FieldSortingBoxesGroupProps) {
  return (
    <g id="sorting-boxes-field-group">
      {/* Track base platform for the 10 boxes inside the top section of the field */}
      <rect
        x={110}
        y={168}
        width={1156}
        height={94}
        rx={16}
        fill="rgba(15, 23, 42, 0.88)"
        stroke="rgba(245, 158, 11, 0.55)"
        strokeWidth={1.5}
        filter="drop-shadow(0 8px 24px rgba(0,0,0,0.6))"
      />

      {/* Header title on track */}
      <g transform="translate(688, 156)">
        <rect
          x={-180}
          y={-14}
          width={360}
          height={28}
          rx={8}
          fill="rgba(15, 23, 42, 0.98)"
          stroke="#F59E0B"
          strokeWidth={1.5}
        />
        <text
          x={0}
          y={5}
          textAnchor="middle"
          fill="#FDE68A"
          fontSize={11}
          fontWeight="900"
          fontFamily="var(--font-ui)"
        >
          📦 10 KOTAK TERURUT (NILAI TERKECIL KE TERBESAR)
        </text>
      </g>

      {/* Render 10 Sorting Boxes */}
      {(() => {
        let closestBoxIdx = -1
        let minBoxDist = 85
        SORTING_BOX_POSITIONS.forEach((p, i) => {
          const d = Math.hypot(playerPos.x - p.x, playerPos.y - p.y)
          if (d < minBoxDist) {
            minBoxDist = d
            closestBoxIdx = i
          }
        })

        return SORTING_BOX_POSITIONS.map((pos, idx) => {
          const item = boxes[idx]
          const isNear = idx === closestBoxIdx

          const isMin = idx === 0
          const isMax = idx === 9

          const borderColor = isNear
            ? '#F59E0B'
            : item
            ? isMin
              ? '#38BDF8'
              : isMax
              ? '#EF4444'
              : '#10B981'
            : '#64748B'

        const boxLabel = isMin
          ? '🔒 Kotak #1 (Min)'
          : isMax
          ? '🔒 Kotak #10 (Max)'
          : `Kotak #${idx + 1}`

        return (
          <g
            key={`sorting-box-${idx}`}
            transform={`translate(${pos.x}, ${pos.y})`}
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onClick={() => onBoxClick(idx)}
          >
            {/* Ground glow if nearby */}
            {isNear && (
              <ellipse
                cx={0}
                cy={0}
                rx={60}
                ry={40}
                fill="#F59E0B"
                opacity={0.35}
                filter="blur(5px)"
              />
            )}

            {/* Box Body */}
            <rect
              x={-50}
              y={-32}
              width={100}
              height={64}
              rx={10}
              fill={item ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.65)'}
              stroke={borderColor}
              strokeWidth={isNear ? 3 : item ? 2 : 1.5}
              strokeDasharray={item ? 'none' : '4 3'}
              filter={isNear ? 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.7))' : 'none'}
            />

            {/* Box Number Tag */}
            <rect
              x={-46}
              y={-30}
              width={92}
              height={16}
              rx={5}
              fill={
                isMin
                  ? 'rgba(56, 189, 248, 0.25)'
                  : isMax
                  ? 'rgba(239, 68, 68, 0.25)'
                  : 'rgba(245, 158, 11, 0.2)'
              }
            />
            <text
              x={0}
              y={-18}
              textAnchor="middle"
              fill={isMin ? '#38BDF8' : isMax ? '#F87171' : '#FDE68A'}
              fontSize={8.5}
              fontWeight="900"
              fontFamily="var(--font-ui)"
            >
              {boxLabel}
            </text>

            {/* Box Slot Content */}
            {item ? (
              <g transform="translate(0, 10)">
                {item.avatarUrl ? (
                  <g transform="translate(-32, -4)">
                    <circle cx={0} cy={0} r={8} fill="#1E293B" stroke={item.gender === 'female' ? '#EC4899' : '#38BDF8'} strokeWidth={1} />
                    <clipPath id={`box-avatar-clip-${idx}`}>
                      <circle cx={0} cy={0} r={7.5} />
                    </clipPath>
                    <image
                      href={item.avatarUrl}
                      x={-7.5}
                      y={-7.5}
                      width={15}
                      height={15}
                      clipPath={`url(#box-avatar-clip-${idx})`}
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </g>
                ) : (
                  <text
                    x={-28}
                    y={-2}
                    fontSize={14}
                  >
                    🚩
                  </text>
                )}
                <text
                  x={item.avatarUrl ? 5 : 4}
                  y={-3}
                  textAnchor="middle"
                  fill="#E2E8F0"
                  fontSize={8.5}
                  fontWeight="800"
                >
                  {item.studentLabel}
                </text>
                {/* Distance Badge */}
                <rect
                  x={isMin || isMax ? -35 : -28}
                  y={3}
                  width={isMin || isMax ? 70 : 56}
                  height={15}
                  rx={4}
                  fill={isMin ? '#0284C7' : isMax ? '#DC2626' : '#10B981'}
                />
                <text
                  x={0}
                  y={14}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize={isMin || isMax ? 9 : 10}
                  fontWeight="900"
                >
                  {isMin || isMax ? '🔒 ' : ''}{formatDistance(item.distance)} m
                </text>
              </g>
            ) : (
              <g transform="translate(0, 10)">
                <text
                  x={0}
                  y={-2}
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize={9}
                  fontWeight="700"
                >
                  📥 Kosong
                </text>
                <text
                  x={0}
                  y={10}
                  textAnchor="middle"
                  fill="#475569"
                  fontSize={7.5}
                >
                  {carryingFlag ? 'Tekan [SPASI]' : 'Belum diisi'}
                </text>
              </g>
            )}

            {/* Prompt tooltip if nearby */}
            {isNear && (
              <g transform="translate(0, -44)">
                <rect
                  x={-55}
                  y={-10}
                  width={110}
                  height={20}
                  rx={10}
                  fill="#F59E0B"
                  filter="drop-shadow(0 2px 6px rgba(0,0,0,0.6))"
                />
                <text
                  x={0}
                  y={3.5}
                  textAnchor="middle"
                  fill="#000000"
                  fontSize={8.5}
                  fontWeight="900"
                >
                  {carryingFlag ? '⎵ [SPASI] Taruh' : item ? '⎵ [SPASI] Ambil' : 'Dekati Kotak'}
                </text>
              </g>
            )}
          </g>
        )
      })
    })()}
  </g>
  )
}

// ──────────────────────────────────────────────────────
// HUD OVERLAY & 60FPS SMOOTH MOVEMENT CONTROLLER
// ──────────────────────────────────────────────────────
interface LeaderBoxSortingHUDProps {
  students: StudentThrowData[]
  stats: ComputedStats
  boxes: (StudentThrowData | null)[]
  carryingFlag: StudentThrowData | null
  playerPos: { x: number; y: number }
  interactionPrompt: string | null
  onBoxesChange: (newBoxes: (StudentThrowData | null)[]) => void
  onCarryingFlagChange: (flag: StudentThrowData | null) => void
  onPlayerMove: (pos: { x: number; y: number }, dir: { x: number; y: number }) => void
  onInteract: () => void
  onComplete: () => void
  onMistake: () => void
  playSound: (type: 'chime' | 'error' | 'pop') => void
  showFeedback: (msg: string, duration?: number) => void
}

export function LeaderBoxSortingHUD({
  students,
  stats,
  boxes,
  carryingFlag,
  playerPos,
  interactionPrompt,
  onBoxesChange,
  onCarryingFlagChange,
  onPlayerMove,
  onInteract,
  onComplete,
  onMistake,
  playSound,
  showFeedback,
}: LeaderBoxSortingHUDProps) {
  const [errorMessage, setErrorMessage] = useState('')
  const pressedKeysRef = useRef<Set<string>>(new Set())
  const playerPosRef = useRef(playerPos)
  const animFrameRef = useRef<number | null>(null)
  const isMovingRef = useRef(false)
  const onPlayerMoveRef = useRef(onPlayerMove)
  const onInteractRef = useRef(onInteract)

  useEffect(() => {
    onPlayerMoveRef.current = onPlayerMove
  }, [onPlayerMove])

  useEffect(() => {
    onInteractRef.current = onInteract
  }, [onInteract])

  // Keep ref synchronized
  useEffect(() => {
    playerPosRef.current = playerPos
  }, [playerPos])

  const filledCount = boxes.filter(b => b !== null).length

  // ── 60FPS SMOOTH MOVEMENT LOOP (MATCHING LEVEL 1 NPath) ──────────
  useEffect(() => {
    const KEY_VECTORS: Record<string, { x: number; y: number }> = {
      KeyW: { x: 0, y: -1 },
      ArrowUp: { x: 0, y: -1 },
      w: { x: 0, y: -1 },
      W: { x: 0, y: -1 },

      KeyS: { x: 0, y: 1 },
      ArrowDown: { x: 0, y: 1 },
      s: { x: 0, y: 1 },
      S: { x: 0, y: 1 },

      KeyA: { x: -1, y: 0 },
      ArrowLeft: { x: -1, y: 0 },
      a: { x: -1, y: 0 },
      A: { x: -1, y: 0 },

      KeyD: { x: 1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      d: { x: 1, y: 0 },
      D: { x: 1, y: 0 },
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        onInteractRef.current()
        return
      }

      if (KEY_VECTORS[e.code] || KEY_VECTORS[e.key]) {
        pressedKeysRef.current.add(e.code)
        pressedKeysRef.current.add(e.key)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeysRef.current.delete(e.code)
      pressedKeysRef.current.delete(e.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // 60FPS requestAnimationFrame movement tick
    let lastTime = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      let nx = 0
      let ny = 0
      pressedKeysRef.current.forEach(k => {
        const v = KEY_VECTORS[k]
        if (v) {
          nx += v.x
          ny += v.y
        }
      })

      const len = Math.hypot(nx, ny)
      if (len > 0) {
        isMovingRef.current = true
        const dir = { x: nx / len, y: ny / len }
        const speed = 280
        const cur = playerPosRef.current
        const nextX = Math.max(130, Math.min(1240, cur.x + dir.x * speed * dt))
        const nextY = Math.max(172, Math.min(665, cur.y + dir.y * speed * dt))
        playerPosRef.current = { x: nextX, y: nextY }
        onPlayerMoveRef.current({ x: nextX, y: nextY }, dir)
      } else if (isMovingRef.current) {
        isMovingRef.current = false
        onPlayerMoveRef.current(playerPosRef.current, { x: 0, y: 0 })
      }

      animFrameRef.current = requestAnimationFrame(tick)
    }

    animFrameRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      pressedKeysRef.current.clear()
      if (isMovingRef.current) {
        isMovingRef.current = false
        onPlayerMoveRef.current(playerPosRef.current, { x: 0, y: 0 })
      }
    }
  }, [])

  // ── QUICK AUTO-SORT HELPER ────────────────────
  const handleAutoSort = () => {
    playSound('chime')
    onBoxesChange([...stats.sortedStudents])
    onCarryingFlagChange(null)
    setErrorMessage('')
    showFeedback('⚡ Bantuan: Seluruh 10 bendera berhasil dimasukkan ke kotak secara berurutan!', 3000)
  }

  // ── RESET ALL BOXES BACK TO FIELD ────────────
  const handleResetBoxes = () => {
    playSound('pop')
    // Keep Min (#1) and Max (#10) from Range mission intact, only empty boxes 2 through 9
    const minStudent = students.find(s => s.studentId === stats.minStudentId) || null
    const maxStudent = students.find(s => s.studentId === stats.maxStudentId) || null
    const reset = Array(10).fill(null)
    if (minStudent) reset[0] = minStudent
    if (maxStudent) reset[9] = maxStudent
    onBoxesChange(reset)
    onCarryingFlagChange(null)
    setErrorMessage('')
    showFeedback('🔄 Kotak #2 s/d #9 dikosongkan. Bendera Min (#1) dan Max (#10) tetap terpasang dari Misi Jangkauan!', 3000)
  }

  // ── VERIFY BOXES ASCENDING ORDER ─────────────
  const handleVerify = () => {
    setErrorMessage('')

    // 1. Check if all 10 are filled
    const emptyIndices: number[] = []
    boxes.forEach((b, idx) => {
      if (b === null) emptyIndices.push(idx + 1)
    })

    if (emptyIndices.length > 0) {
      playSound('error')
      onMistake()
      const msg = `Masih ada ${emptyIndices.length} kotak yang belum terisi (Kotak: ${emptyIndices.slice(0, 4).join(', ')}${emptyIndices.length > 4 ? '...' : ''})!`
      setErrorMessage(msg)
      showFeedback(msg, 3500)
      return
    }

    // 2. Check ascending order
    for (let i = 0; i < 9; i++) {
      const cur = boxes[i]!
      const next = boxes[i + 1]!
      if (Math.round(cur.distance) > Math.round(next.distance)) {
        playSound('error')
        onMistake()
        const msg = `Urutan belum tepat! Kotak #${i + 1} (${formatDistance(cur.distance)}m) lebih besar dari Kotak #${i + 2} (${formatDistance(next.distance)}m).`
        setErrorMessage(msg)
        showFeedback(msg, 4000)
        return
      }
    }

    // 3. SUCCESS!
    playSound('chime')
    setErrorMessage('')
    showFeedback('🎉 Sempurna! Seluruh 10 kotak terisi berurutan dari nilai terkecil hingga terbesar!', 2500)
    setTimeout(() => {
      onComplete()
    }, 600)
  }

  return (
    <>
      {/* ── BOTTOM HUD BANNER (POSITIONED AT BOTTOM TO KEEP TOP BOXES VISIBLE) ── */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(88%, 680px)',
          zIndex: 135,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          borderRadius: '18px',
          border: '2px solid #F59E0B',
          padding: '10px 16px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 25px rgba(245, 158, 11, 0.3)',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📦</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#FCD34D' }}>
                Misi Pengurutan: Lengkapi Kotak #2 s/d #9 (Kotak #1 Min & #10 Max Tetap)
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#CBD5E1' }}>
                Bendera Min (#1) dan Max (#10) dari Misi Jangkauan tetap tersimpan di kotak. Ambil 8 bendera di lapangan dengan <b>[SPASI]</b> lalu masukkan ke kotak yang tepat.
              </p>
            </div>
          </div>

          {/* Progress Pill */}
          <div
            style={{
              background: filledCount === 10 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.15)',
              border: `1.5px solid ${filledCount === 10 ? '#10B981' : '#F59E0B'}`,
              borderRadius: '12px',
              padding: '4px 12px',
              fontSize: '11.5px',
              fontWeight: 900,
              color: filledCount === 10 ? '#34D399' : '#FCD34D',
              whiteSpace: 'nowrap',
            }}
          >
            {filledCount} / 10 Kotak Terisi
          </div>
        </div>

        {/* Action Controls Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '8px',
            fontSize: '11.5px',
          }}
        >
          {/* Status of Carried Flag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#94A3B8' }}>Status:</span>
            {carryingFlag ? (
              <span
                style={{
                  background: '#EF4444',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '8px',
                  fontWeight: 900,
                  fontSize: '11px',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
                }}
              >
                🚩 Membawa: {carryingFlag.studentLabel} ({formatDistance(carryingFlag.distance)}m)
              </span>
            ) : (
              <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>
                Tangan Kosong — Dekati bendera lalu tekan <b>[SPASI]</b>
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleResetBoxes}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#CBD5E1',
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🔄 Reset
            </button>

            <button
              onClick={handleAutoSort}
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid #F59E0B',
                borderRadius: '8px',
                color: '#FCD34D',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              ⚡ Bantuan Auto-Urut
            </button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleVerify}
              style={{
                background: filledCount === 10
                  ? 'linear-gradient(135deg, #10B981, #059669)'
                  : '#475569',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                padding: '6px 14px',
                fontSize: '11.5px',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: filledCount === 10 ? '0 4px 15px rgba(16, 185, 129, 0.4)' : 'none',
              }}
            >
              🏁 CEK URUTAN KOTAK ▶
            </motion.button>
          </div>
        </div>

        {/* Error message if verification fails */}
        {errorMessage && (
          <div style={{ fontSize: '11px', color: '#EF4444', fontWeight: 800 }}>
            ⚠️ {errorMessage}
          </div>
        )}
      </div>
    </>
  )
}
