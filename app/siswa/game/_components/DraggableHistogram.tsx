'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { screenTimeData, CLASS_LABELS, getClassIndex, CORRECT_TABLE } from '../_data/level1'

interface DataPoint {
  id: string
  val: number
  classIdx: number
  placed: boolean
  originalIdx: number
}

type Mode = 'FI' | 'FD'

interface DraggableHistogramProps {
  mode: Mode
  onSubmit?: (isCorrect: boolean) => void
  readOnly?: boolean
  forceStack?: boolean
}

// Scattered positions pool — percentage-based so they adapt to container size
const SCATTERED_POSITIONS = [
  { top: '12%', left: '8%' },  { top: '28%', left: '22%' }, { top: '18%', left: '42%' },
  { top: '45%', left: '10%' }, { top: '60%', left: '28%' }, { top: '30%', left: '58%' },
  { top: '72%', left: '15%' }, { top: '55%', left: '45%' }, { top: '80%', left: '38%' },
  { top: '65%', left: '62%' }, { top: '20%', left: '72%' }, { top: '40%', left: '80%' },
  { top: '75%', left: '72%' }, { top: '85%', left: '55%' }, { top: '10%', left: '55%' },
  { top: '50%', left: '70%' }, { top: '35%', left: '35%' }, { top: '88%', left: '20%' },
  { top: '22%', left: '88%' }, { top: '62%', left: '85%' }, { top: '48%', left: '90%' },
  { top: '8%',  left: '30%' }, { top: '38%', left: '68%' }, { top: '70%', left: '50%' },
  { top: '15%', left: '18%' }, { top: '52%', left: '32%' }, { top: '78%', left: '85%' },
  { top: '25%', left: '78%' }, { top: '90%', left: '70%' }, { top: '42%', left: '50%' },
  { top: '5%',  left: '65%' }, { top: '68%', left: '38%' }, { top: '33%', left: '12%' },
  { top: '82%', left: '60%' }, { top: '58%', left: '78%' },
]

const CLASS_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899']

// FD: pre-place class 0 data (1–4 jam) to scaffold student
function initDataPoints(mode: Mode, readOnly: boolean): DataPoint[] {
  return screenTimeData.map((val, idx) => {
    const cIdx = getClassIndex(val)
    const isPreplaced = readOnly || (mode === 'FD' && cIdx === 0)
    return { id: `dp-${idx}`, val, classIdx: cIdx, placed: isPreplaced, originalIdx: idx }
  })
}

export default function DraggableHistogram({
  mode, onSubmit, readOnly = false, forceStack = false,
}: DraggableHistogramProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const stackLayout = isMobile || forceStack

  const [dataPoints, setDataPoints] = useState<DataPoint[]>(() => initDataPoints(mode, readOnly))
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null)
  const [flashError, setFlashError] = useState<number | null>(null)
  const [flashHint, setFlashHint] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  // Unified Drag and Drop State (Mouse and Touch)
  const [dragState, setDragState] = useState<{
    point: DataPoint
    startX: number
    startY: number
    offsetX: number
    offsetY: number
  } | null>(null)

  const triggerError = (slotIdx: number, hint: string) => {
    setFlashError(slotIdx)
    setFlashHint(hint)
    setTimeout(() => { setFlashError(null); setFlashHint(null) }, 2500)
  }

  const startDrag = (e: React.MouseEvent | React.TouchEvent, dp: DataPoint) => {
    // Clear selected point to avoid conflicting states
    setSelectedPoint(null)

    const isTouch = 'touches' in e
    const clientX = isTouch ? e.touches[0].clientX : e.clientX
    const clientY = isTouch ? e.touches[0].clientY : e.clientY

    setDragState({
      point: dp,
      startX: clientX,
      startY: clientY,
      offsetX: 0,
      offsetY: 0
    })
  };

  useEffect(() => {
    if (!dragState) return

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      // Prevent scrolling on touch devices while dragging a point
      if ('touches' in e && e.cancelable) {
        e.preventDefault()
      }
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      
      const dx = clientX - dragState.startX
      const dy = clientY - dragState.startY
      
      setDragState(prev => prev ? { ...prev, offsetX: dx, offsetY: dy } : null)
    }

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      const isTouch = 'changedTouches' in e
      const clientX = isTouch ? e.changedTouches[0].clientX : (e as MouseEvent).clientX
      const clientY = isTouch ? isTouch ? e.changedTouches[0].clientY : (e as MouseEvent).clientY : (e as MouseEvent).clientY

      // Find drop element under the cursor position
      const activeEl = document.getElementById(dragState.point.id)
      let originalPointerEvents = ''
      if (activeEl) {
        originalPointerEvents = activeEl.style.pointerEvents
        activeEl.style.pointerEvents = 'none'
      }

      const elem = document.elementFromPoint(clientX, clientY)

      if (activeEl) {
        activeEl.style.pointerEvents = originalPointerEvents
      }

      if (elem) {
        const slotEl = elem.closest('[data-slot-idx]')
        if (slotEl) {
          const slotIdx = parseInt(slotEl.getAttribute('data-slot-idx') ?? '-1')
          if (slotIdx !== -1) {
            if (dragState.point.classIdx === slotIdx) {
              setDataPoints(prev => prev.map(item => item.id === dragState.point.id ? { ...item, placed: true } : item))
            } else {
              const correctLabel = CLASS_LABELS[dragState.point.classIdx]
              triggerError(slotIdx, `💡 Angka ${dragState.point.val} seharusnya masuk ke kelas ${correctLabel}!`)
            }
          }
        }
      }

      setDragState(null)
    }

    // Add window level event listeners for mouse and touch movements
    window.addEventListener('mousemove', handlePointerMove, { passive: false })
    window.addEventListener('mouseup', handlePointerUp)
    window.addEventListener('touchmove', handlePointerMove, { passive: false })
    window.addEventListener('touchend', handlePointerUp)

    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('touchend', handlePointerUp)
    }
  }, [dragState])

  const onTapPoint = (dp: DataPoint) => {
    // Only select point if it was not dragged
    setSelectedPoint(prev => prev?.id === dp.id ? null : dp)
  }

  const onTapSlot = useCallback((slotIdx: number) => {
    if (!selectedPoint) return
    if (selectedPoint.classIdx === slotIdx) {
      setDataPoints(prev => prev.map(dp => dp.id === selectedPoint.id ? { ...dp, placed: true } : dp))
      setSelectedPoint(null)
    } else {
      const correctLabel = CLASS_LABELS[selectedPoint.classIdx]
      triggerError(slotIdx, `💡 Angka ${selectedPoint.val} seharusnya masuk ke kelas ${correctLabel}.`)
    }
  }, [selectedPoint])

  const handleSubmit = () => {
    const allPlaced = dataPoints.every(dp => dp.placed)
    if (!allPlaced) return
    setSubmitted(true)
    if (onSubmit) onSubmit(true)
  }

  const allPlaced   = dataPoints.every(dp => dp.placed)
  const activePool  = dataPoints.filter(dp => !dp.placed)
  const remainByClass = CLASS_LABELS.map((_, ci) => dataPoints.filter(dp => !dp.placed && dp.classIdx === ci).length)
  const placedByClass = CLASS_LABELS.map((_, ci) => dataPoints.filter(dp => dp.placed && dp.classIdx === ci))

  // ── READ ONLY: reference histogram ──
  if (readOnly) {
    const maxF = Math.max(...CORRECT_TABLE.map(row => row.f))
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 8px' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', height: '160px', gap: '6px',
          borderLeft: '2px solid rgba(255,255,255,0.15)', borderBottom: '2px solid rgba(255,255,255,0.15)',
          paddingLeft: '8px', paddingBottom: '4px',
        }}>
          {CORRECT_TABLE.map((row, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(row.f / maxF) * 100}%` }}
                transition={{ delay: i * 0.15, duration: 0.7, ease: 'easeOut' }}
                style={{
                  width: '90%', borderRadius: '4px 4px 0 0',
                  background: `linear-gradient(180deg, ${CLASS_COLORS[i]}99 0%, ${CLASS_COLORS[i]}55 100%)`,
                  border: `1px solid ${CLASS_COLORS[i]}88`,
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '4px',
                  boxShadow: `0 0 8px ${CLASS_COLORS[i]}44`,
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>f={row.f}</span>
              </motion.div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: '6px', fontWeight: 700 }}>
                {row.kelas}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '1px' }}>
          SCREEN TIME (JAM/HARI)
        </div>
      </div>
    )
  }

  // ── INTERACTIVE: drag-and-drop histogram ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

      {/* Main interactive row: Data Pool ← | → Histogram Canvas */}
      <div style={{
        display: 'flex',
        flexDirection: stackLayout ? 'column' : 'row',
        gap: '12px',
      }}>

        {/* ── LEFT: Data Pool ── */}
        <div
          className="game-card"
          style={{
            flex: stackLayout ? 'none' : '0 0 42%',
            height: stackLayout ? '200px' : '440px',
            display: 'flex', flexDirection: 'column',
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.015)',
            position: 'relative',
          }}
        >
          {/* Pool header */}
          <div style={{ flexShrink: 0, marginBottom: '6px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
              {allPlaced ? '✅ SEMUA DATA TERKELOMPOKKAN!' : `📍 KOLAM DATA — ${activePool.length} tersisa`}
            </div>
            {mode === 'FD' && !allPlaced && (
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.28)', marginTop: '3px' }}>
                {CLASS_LABELS.map((l, i) => remainByClass[i] > 0 ? `${l}: ${remainByClass[i]}` : null).filter(Boolean).join(' · ') || '—'}
              </div>
            )}
          </div>

          {/* Scatter zone — fills remaining height */}
          <div style={{
            position: 'relative', flex: 1, minHeight: 0,
            background: 'rgba(255,255,255,0.008)',
            border: '1px dashed rgba(255,255,255,0.07)',
            borderRadius: '10px', overflow: 'hidden',
          }}>
            <AnimatePresence>
              {activePool.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: '6px',
                    textAlign: 'center', fontSize: '13px',
                    color: 'var(--accent)', fontWeight: 700, padding: '16px',
                  }}
                >
                  <span style={{ fontSize: '28px' }}>🚀</span>
                  Semua data masuk!<br />
                  <span style={{ fontSize: '11px', opacity: 0.7 }}>Klik Submit di bawah ↓</span>
                </motion.div>
              ) : (
                activePool.map(dp => {
                  const pos = SCATTERED_POSITIONS[dp.originalIdx % SCATTERED_POSITIONS.length]
                  const isSelected = selectedPoint?.id === dp.id
                  const col = CLASS_COLORS[dp.classIdx] ?? '#3B82F6'
                  return (
                    <motion.div
                      key={dp.id}
                      id={dp.id}
                      layout
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseDown={(e) => startDrag(e, dp)}
                      onTouchStart={(e) => startDrag(e, dp)}
                      onClick={() => onTapPoint(dp)}
                      style={{
                        position: 'absolute', top: pos.top, left: pos.left,
                        transform: dragState && dragState.point.id === dp.id 
                          ? `translate3d(${dragState.offsetX}px, ${dragState.offsetY}px, 0) translate(-50%, -50%)`
                          : 'translate(-50%, -50%)',
                        padding: '5px 11px', borderRadius: '50px',
                        background: isSelected
                          ? `linear-gradient(135deg, ${col} 0%, #fff 100%)`
                          : `linear-gradient(135deg, ${col}cc 0%, ${col}88 100%)`,
                        border: isSelected ? '2px solid #fff' : `1px solid ${col}55`,
                        color: isSelected ? '#000' : '#fff',
                        fontSize: '12px', fontWeight: 800,
                        cursor: 'grab', userSelect: 'none',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: isSelected ? `0 0 12px ${col}` : `0 2px 6px rgba(0,0,0,0.5)`,
                        fontFamily: 'var(--font-data)', touchAction: 'none',
                        zIndex: (dragState && dragState.point.id === dp.id) || isSelected ? 100 : 1,
                        transition: 'box-shadow 0.15s',
                      }}
                    >
                      {dp.val}
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT: Histogram Canvas ── */}
        <div
          className="histogram-canvas"
          style={{
            flex: 1,
            height: stackLayout ? '320px' : '440px',
            display: 'flex', flexDirection: 'column',
            padding: '12px 12px 6px 32px',
            position: 'relative',
          }}
        >
          {/* Y-axis label */}
          <div style={{
            position: 'absolute', left: 2, top: '50%',
            transform: 'translateY(-50%) rotate(-90deg)',
            fontSize: '8px', color: 'var(--text-muted)',
            fontWeight: 800, letterSpacing: '1.5px', whiteSpace: 'nowrap',
          }}>
            FREKUENSI
          </div>

          {/* Bars row — fills remaining height */}
          <div style={{
            display: 'flex', gap: '3px', alignItems: 'flex-end',
            flex: 1, minHeight: 0,
            borderLeft: '2px solid rgba(255,255,255,0.15)',
            borderBottom: '2px solid rgba(255,255,255,0.15)',
            paddingBottom: '4px',
          }}>
            {CLASS_LABELS.map((label, i) => {
              const placed  = placedByClass[i]
              const isError = flashError === i
              const isTarget = selectedPoint && selectedPoint.classIdx === i

              return (
                <motion.div
                  key={i}
                  data-slot-idx={i}
                  animate={isError ? { x: [-5, 5, -5, 5, 0] } : {}}
                  transition={{ duration: 0.35 }}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => onTapSlot(i)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', height: '100%', justifyContent: 'flex-end',
                    cursor: selectedPoint ? 'pointer' : 'default',
                    borderRadius: '4px', padding: '1px',
                    background: isError
                      ? 'rgba(239,68,68,0.08)'
                      : isTarget ? `${CLASS_COLORS[i]}0A` : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  {/* Stacked data blocks (grow from bottom) */}
                  <div style={{
                    width: '100%',
                    display: 'flex', flexDirection: 'column-reverse', gap: '2px',
                    alignItems: 'center',
                    flex: 1, justifyContent: 'flex-start',
                    borderBottom: isError
                      ? '2px solid var(--danger)'
                      : isTarget
                        ? `2px solid ${CLASS_COLORS[i]}`
                        : '2px solid rgba(255,255,255,0.1)',
                  }}>
                    <AnimatePresence>
                      {placed.map(dp => (
                        <motion.div
                          key={dp.id}
                          initial={{ scale: 0.5, opacity: 0, y: -10 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                          style={{
                            width: '88%', height: '18px', flexShrink: 0,
                            background: mode === 'FD' && i === 0
                              ? `linear-gradient(180deg, ${CLASS_COLORS[i]}44 0%, ${CLASS_COLORS[i]}22 100%)`
                              : `linear-gradient(180deg, ${CLASS_COLORS[i]}cc 0%, ${CLASS_COLORS[i]}88 100%)`,
                            border: `1px solid ${CLASS_COLORS[i]}44`,
                            borderRadius: '3px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '8px', fontWeight: 800,
                            color: mode === 'FD' && i === 0 ? 'rgba(255,255,255,0.35)' : '#fff',
                          }}
                        >
                          {dp.val}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Empty drop zone */}
                    {placed.length === 0 && (
                      <div style={{
                        width: '75%', height: '26px', borderRadius: '4px', flexShrink: 0,
                        border: isError
                          ? '2px dashed var(--danger)'
                          : isTarget
                            ? `2px dashed ${CLASS_COLORS[i]}`
                            : '1px dashed rgba(255,255,255,0.1)',
                        background: isTarget ? `${CLASS_COLORS[i]}08` : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', color: 'rgba(255,255,255,0.15)',
                        transition: 'all 0.2s',
                      }}>+</div>
                    )}

                    {/* Frequency label inside bar stack */}
                    {placed.length > 0 && (
                      <div style={{
                        fontSize: '10px', fontWeight: 800, color: CLASS_COLORS[i],
                        marginBottom: '2px', flexShrink: 0,
                      }}>
                        f = {placed.length}
                      </div>
                    )}
                  </div>

                  {/* X-axis label */}
                  <div style={{
                    fontSize: '7.5px', color: 'var(--text-muted)',
                    textAlign: 'center', marginTop: '3px',
                    fontWeight: 700, lineHeight: 1.2,
                    fontFamily: 'var(--font-data)', flexShrink: 0,
                  }}>
                    {label}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* X-axis title */}
          <div style={{
            textAlign: 'center', fontSize: '8px',
            color: 'var(--text-muted)', fontWeight: 800,
            letterSpacing: '1px', marginTop: '3px', flexShrink: 0,
          }}>
            SCREEN TIME (JAM/HARI)
          </div>
        </div>
      </div>

      {/* Hint toast — shrinks from bottom, doesn't push canvas */}
      <AnimatePresence>
        {flashHint && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            style={{
              flexShrink: 0,
              padding: '7px 12px', borderRadius: '10px', fontSize: '12px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              color: 'rgba(255,255,255,0.85)', lineHeight: 1.4,
            }}
          >
            {flashHint}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <button
        className="game-btn game-btn-primary"
        onClick={handleSubmit}
        disabled={!allPlaced || submitted}
        style={{
          flexShrink: 0, width: '100%',
          padding: '9px 20px', fontSize: '13px',
          opacity: allPlaced && !submitted ? 1 : 0.45,
          cursor: allPlaced && !submitted ? 'pointer' : 'not-allowed',
          boxShadow: allPlaced && !submitted ? 'var(--accent-glow)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        {submitted
          ? '✅ Histogram Tersubmit!'
          : allPlaced
          ? 'Submit Histogram →'
          : `Seret semua data ke histogram (${activePool.length} tersisa)`}
      </button>
    </div>
  )
}
