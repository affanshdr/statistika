'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { gameAudio } from '@/lib/utils/gameAudio'

interface MarbleBowlsChallengeProps {
  onSuccess: () => void
  isSolved: boolean
}

interface BowlConfig {
  id: string
  label: string
  initialCount: number
}

// Ke-4 mangkuk seragam berwarna orange (oranye)
const BOWL_CONFIGS: BowlConfig[] = [
  { id: 'A', label: 'Mangkuk A', initialCount: 15 },
  { id: 'B', label: 'Mangkuk B', initialCount: 7 },
  { id: 'C', label: 'Mangkuk C', initialCount: 18 },
  { id: 'D', label: 'Mangkuk D', initialCount: 4 },
]

const TARGET_PER_BOWL = 11

interface HeldMarbleInfo {
  sourceIdx: number
  x: number
  y: number
}

export default function MarbleBowlsChallenge({ onSuccess, isSolved }: MarbleBowlsChallengeProps) {
  const [counts, setCounts] = useState<number[]>([15, 7, 18, 4])
  const [heldMarble, setHeldMarble] = useState<HeldMarbleInfo | null>(null)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const [bouncedIndex, setBouncedIndex] = useState<number | null>(null)

  const countsRef = useRef<number[]>(counts)
  countsRef.current = counts

  const heldMarbleRef = useRef<HeldMarbleInfo | null>(heldMarble)
  heldMarbleRef.current = heldMarble

  const hoverIdxRef = useRef<number | null>(hoverIdx)
  hoverIdxRef.current = hoverIdx

  const dragStartPos = useRef<{ x: number; y: number } | null>(null)
  const isDragging = useRef<boolean>(false)
  const bowlRefs = useRef<(HTMLDivElement | null)[]>([])

  // Check if all bowls are balanced
  const allBalanced = counts.every(c => c === TARGET_PER_BOWL)

  useEffect(() => {
    if (allBalanced && !isSolved) {
      gameAudio.playSuccess()
      onSuccess()
    }
  }, [allBalanced, isSolved, onSuccess])

  // Reset bowls to initial state
  const handleReset = useCallback(() => {
    setCounts([15, 7, 18, 4])
    setHeldMarble(null)
    setHoverIdx(null)
    dragStartPos.current = null
    isDragging.current = false
    gameAudio.playClick()
  }, [])

  // Transfer 1 marble from source to destination
  const transferMarble = useCallback((fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return
    setCounts(prev => {
      if (prev[fromIdx] <= 0) return prev
      const next = [...prev]
      next[fromIdx] -= 1
      next[toIdx] += 1
      return next
    })
    setBouncedIndex(toIdx)
    setTimeout(() => setBouncedIndex(null), 300)
    gameAudio.playClick()
  }, [])

  // Global Pointer Handlers for Click & Hold Drag
  const handlePointerDown = (bowlIdx: number, e: React.PointerEvent) => {
    if (allBalanced) return

    // If already holding a marble and user clicks on a different bowl -> drop it!
    if (heldMarbleRef.current) {
      const src = heldMarbleRef.current.sourceIdx
      if (src !== bowlIdx) {
        transferMarble(src, bowlIdx)
      }
      setHeldMarble(null)
      setHoverIdx(null)
      dragStartPos.current = null
      isDragging.current = false
      return
    }

    if (countsRef.current[bowlIdx] <= 0) return

    // Pick up / lift 1 marble from this bowl
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    isDragging.current = false
    setHeldMarble({
      sourceIdx: bowlIdx,
      x: e.clientX,
      y: e.clientY,
    })
    gameAudio.playClick()

    const onPointerMove = (moveEvt: PointerEvent) => {
      if (dragStartPos.current) {
        const dist = Math.hypot(moveEvt.clientX - dragStartPos.current.x, moveEvt.clientY - dragStartPos.current.y)
        if (dist > 6) {
          isDragging.current = true
        }
      }

      setHeldMarble(prev => prev ? { ...prev, x: moveEvt.clientX, y: moveEvt.clientY } : null)

      // Find which bowl is under pointer
      let found: number | null = null
      bowlRefs.current.forEach((el, bIdx) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        if (
          moveEvt.clientX >= rect.left &&
          moveEvt.clientX <= rect.right &&
          moveEvt.clientY >= rect.top &&
          moveEvt.clientY <= rect.bottom
        ) {
          found = bIdx
        }
      })
      setHoverIdx(found)
    }

    const onPointerUp = (upEvt: PointerEvent) => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)

      const curHeld = heldMarbleRef.current
      if (!curHeld) return

      // Find bowl under pointer on drop
      let target: number | null = null
      bowlRefs.current.forEach((el, bIdx) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        if (
          upEvt.clientX >= rect.left &&
          upEvt.clientX <= rect.right &&
          upEvt.clientY >= rect.top &&
          upEvt.clientY <= rect.bottom
        ) {
          target = bIdx
        }
      })

      const dist = dragStartPos.current
        ? Math.hypot(upEvt.clientX - dragStartPos.current.x, upEvt.clientY - dragStartPos.current.y)
        : 0

      if (dist > 10) {
        // Drag gesture release
        if (target !== null && target !== curHeld.sourceIdx) {
          transferMarble(curHeld.sourceIdx, target)
        }
        // Release hold (if dropped on same bowl or outside, returns to bowl)
        setHeldMarble(null)
        setHoverIdx(null)
      } else {
        // Tap / Click gesture: keep marble lifted in hand for tap-to-place
        // unless already at destination
        if (target !== null && target !== curHeld.sourceIdx) {
          transferMarble(curHeld.sourceIdx, target)
          setHeldMarble(null)
          setHoverIdx(null)
        }
      }

      dragStartPos.current = null
      isDragging.current = false
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      {/* BARIS 1: Teks Tantangan */}
      <div
        style={{
          fontSize: '13.5px',
          fontWeight: 900,
          color: '#FDE047',
          lineHeight: 1.4,
          letterSpacing: '0.2px',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
        }}
      >
        Tantangan: Pindahkan kelereng agar ke-4 mangkuk memiliki jumlah yang sama banyak!
      </div>

      {/* BARIS 2: Teks Tata Cara + Tombol Reset */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '11.5px',
          color: '#FEF3C7',
          lineHeight: 1.35,
        }}
      >
        <div>
          {heldMarble ? (
            <span style={{ color: '#FDE047', fontWeight: 800 }}>
              Tata Cara: Mengangkat 1 kelereng dari <strong>Mangkuk {BOWL_CONFIGS[heldMarble.sourceIdx].id}</strong>. Lepas atau klik pada mangkuk tujuan.
            </span>
          ) : (
            <span>
              Tata Cara: Klik & hold untuk mengangkat kelereng, lalu geser ke mangkuk tujuan.
            </span>
          )}
        </div>

        <button
          type="button"
          data-testid="btn-reset-bowls"
          onClick={handleReset}
          style={{
            padding: '2px 8px',
            borderRadius: '6px',
            border: '1px solid #F59E0B',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#FDE68A',
            fontSize: '10px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          title="Kembalikan kelereng ke posisi awal (15, 7, 18, 4)"
        >
          <span>↺</span> Reset
        </button>
      </div>

      {/* 4 MANGKUK KELERENG (Konsisten Orange, Bersih tanpa Noise) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          position: 'relative',
        }}
      >
        {BOWL_CONFIGS.map((config, idx) => {
          const rawCount = counts[idx]
          const isSource = heldMarble?.sourceIdx === idx
          // When lifted, display count decreases by 1 in the source bowl
          const displayCount = isSource ? rawCount - 1 : rawCount
          const isHovered = hoverIdx === idx && !isSource
          const isBounced = bouncedIndex === idx

          return (
            <div
              key={config.id}
              ref={el => { bowlRefs.current[idx] = el }}
              data-bowl-index={idx}
              data-testid={`bowl-container-${config.id}`}
              onPointerDown={e => handlePointerDown(idx, e)}
              style={{
                position: 'relative',
                background: isHovered
                  ? 'rgba(234, 88, 12, 0.38)'
                  : isSource
                  ? 'rgba(234, 88, 12, 0.28)'
                  : 'linear-gradient(180deg, rgba(234, 88, 12, 0.22) 0%, rgba(154, 52, 18, 0.12) 100%)',
                border: isHovered
                  ? '2px dashed #FDBA74'
                  : isSource
                  ? '2px solid #FDE047'
                  : '1.5px solid #EA580C',
                borderRadius: '14px',
                padding: '10px 6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isHovered
                  ? '0 0 16px rgba(249, 115, 22, 0.7)'
                  : isSource
                  ? '0 0 12px rgba(253, 224, 71, 0.5)'
                  : '0 4px 10px rgba(0, 0, 0, 0.35)',
                cursor: (rawCount > 0 || heldMarble) && !allBalanced ? 'grab' : 'default',
                transform: isBounced
                  ? 'scale(1.06)'
                  : isHovered
                  ? 'scale(1.04)'
                  : isSource
                  ? 'scale(0.98)'
                  : 'scale(1)',
                transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              {/* Nama Mangkuk */}
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 900,
                  color: isSource ? '#FDE047' : '#FED7AA',
                  textAlign: 'center',
                }}
              >
                {config.label}
              </div>

              {/* Mangkuk Keramik Pixel Art Orange + Kelereng & Jumlah Angka */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '92px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                }}
              >
                {/* Layer 1: Gambar Belakang & Rongga Mangkuk */}
                <img
                  src="/Assets/Bowls/bowl_A.png"
                  alt={config.label}
                  style={{
                    position: 'absolute',
                    bottom: '0px',
                    width: '92px',
                    height: 'auto',
                    imageRendering: 'pixelated',
                    filter: isHovered
                      ? 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.8))'
                      : 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.6))',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }}
                />

                {/* Layer 2: Butiran Kelereng Bersarang di Rongga Dalam Mangkuk */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '28px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2,
                    display: 'flex',
                    flexWrap: 'wrap-reverse',
                    justifyContent: 'center',
                    alignContent: 'flex-end',
                    gap: '2px',
                    maxWidth: '56px',
                    maxHeight: '36px',
                    pointerEvents: 'none',
                  }}
                >
                  {Array.from({ length: Math.min(displayCount, 18) }).map((_, mIdx) => (
                    <div
                      key={mIdx}
                      style={{
                        width: '9.5px',
                        height: '9.5px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 35% 35%, #FEF08A 0%, #FB923C 50%, #C2410C 100%)',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.8), inset 1px 1px 2px rgba(255, 255, 255, 0.5)',
                        border: '0.5px solid rgba(255, 255, 255, 0.4)',
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>

                {/* Layer 3: Bibir & Dinding Depan Mangkuk (Menutup bagian bawah kelereng agar seolah-olah di dalam) */}
                <img
                  src="/Assets/Bowls/bowl_front_rim.png"
                  alt=""
                  style={{
                    position: 'absolute',
                    bottom: '0px',
                    width: '92px',
                    height: 'auto',
                    imageRendering: 'pixelated',
                    pointerEvents: 'none',
                    zIndex: 3,
                  }}
                />

                {/* Layer 4: Angka Jumlah Kelereng di Dalam Mangkuk */}
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    fontSize: '16px',
                    fontWeight: 900,
                    color: isSource ? '#FDE047' : '#FFFFFF',
                    textShadow: '0 2px 6px rgba(0, 0, 0, 0.95), 0 0 4px rgba(0,0,0,0.8)',
                    pointerEvents: 'none',
                    zIndex: 4,
                  }}
                >
                  {displayCount}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating Lifted Marble Avatar (Mengangkat Kelereng) */}
      {heldMarble && (
        <div
          style={{
            position: 'fixed',
            left: heldMarble.x,
            top: heldMarble.y,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {/* Glowing 3D Shiny Glass Marble */}
          <motion.div
            initial={{ scale: 0.8, y: 8 }}
            animate={{ scale: [1.1, 1.25, 1.15], y: 0 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #FFFBEB 0%, #FDE047 30%, #FB923C 70%, #9A3412 100%)',
              boxShadow: '0 10px 25px rgba(249, 115, 22, 0.85), 0 0 16px rgba(253, 224, 71, 0.9), inset 2px 2px 4px rgba(255, 255, 255, 0.8)',
              border: '2px solid #FFFFFF',
            }}
          />
          <span
            style={{
              fontSize: '9.5px',
              fontWeight: 900,
              color: '#FFFFFF',
              background: 'rgba(0, 0, 0, 0.85)',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid #F59E0B',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            Lepas di mangkuk tujuan
          </span>
        </div>
      )}
    </div>
  )
}
