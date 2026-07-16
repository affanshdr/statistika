import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { getLevelData } from '../_data'
import { useGameStore } from '@/lib/store/gameStore'

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
  placedIndices?: number[]
  onPlacedChange?: (indices: number[]) => void
  levelId?: number
}

// Scattered positions — percentage-based so they adapt to container size
const SCATTERED_POSITIONS = [
  { top: '10%', left: '12%' }, { top: '25%', left: '28%' }, { top: '15%', left: '52%' },
  { top: '42%', left: '8%'  }, { top: '58%', left: '32%' }, { top: '28%', left: '68%' },
  { top: '70%', left: '18%' }, { top: '52%', left: '52%' }, { top: '78%', left: '40%' },
  { top: '63%', left: '68%' }, { top: '18%', left: '78%' }, { top: '38%', left: '85%' },
  { top: '73%', left: '78%' }, { top: '83%', left: '58%' }, { top: '8%',  left: '60%' },
  { top: '48%', left: '75%' }, { top: '33%', left: '38%' }, { top: '85%', left: '22%' },
  { top: '20%', left: '90%' }, { top: '60%', left: '88%' }, { top: '46%', left: '94%' },
  { top: '6%',  left: '35%' }, { top: '36%', left: '72%' }, { top: '68%', left: '55%' },
  { top: '13%', left: '20%' }, { top: '50%', left: '35%' }, { top: '76%', left: '88%' },
  { top: '23%', left: '82%' }, { top: '88%', left: '72%' }, { top: '40%', left: '55%' },
  { top: '4%',  left: '68%' }, { top: '66%', left: '42%' }, { top: '31%', left: '14%' },
  { top: '80%', left: '62%' }, { top: '56%', left: '80%' },
]

const CLASS_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6']

function initDataPoints(
  rawData: number[],
  getClassIndex: (val: number) => number,
  preplacedSet: Set<number>,
  readOnly: boolean
): DataPoint[] {
  return rawData.map((val, idx) => {
    const cIdx = getClassIndex(val)
    const isPreplaced = readOnly || preplacedSet.has(idx)
    return { id: `dp-${idx}`, val, classIdx: cIdx, placed: isPreplaced, originalIdx: idx }
  })
}

export default function DraggableHistogram({
  mode, onSubmit, readOnly = false, forceStack = false,
  placedIndices, onPlacedChange, levelId = 1,
}: DraggableHistogramProps) {
  const answers = useGameStore(state => state.answers)
  const intervalKelas = answers?.intervalKelas as { kelasInterval: string, tepiBawah: number, tepiAtas: number }[] | undefined

  const levelData = getLevelData(levelId)
  const screenTimeData = levelData.rawData
  const CLASS_LABELS = levelData.classLabels
  const getClassIndex = levelData.getClassIndex
  const CORRECT_TABLE = levelData.correctTable

  const PREPLACED_INDICES = levelId === 2
    ? new Set([0, 1, 3, 4, 6, 7, 9, 11, 13, 14, 16, 17, 19, 20, 22, 24, 25, 27, 29])
    : new Set([
        0, 1, 2, 4, 5, 6,       // class 0 (1-3): val=1,2,2,3,3,3 (leaves 2,3,3 to drag)
        9, 10, 11, 13, 14, 15, 17, 18, // class 1 (4-6): val=4,4,4,5,5,5,6,6 (leaves 4,5,6 to drag)
        20, 21, 23, 24,         // class 2 (7-9): val=7,7,7,8 (leaves 7,9 to drag)
        26, 28,                 // class 3 (10-12): val=10,12 (leaves 11 to drag)
        29, 31,                 // class 4 (13-15): val=13,15 (leaves 14 to drag)
        32, 34,                 // class 5 (16-18): val=16,18 (leaves 17 to drag)
      ])

  const defaultTicks = levelId === 2
    ? ['1.5', '4.5', '7.5', '10.5', '13.5', '16.5']
    : ['0.5', '3.5', '6.5', '9.5', '12.5', '15.5', '18.5']

  const ticks = intervalKelas && intervalKelas.length === (levelId === 2 ? 5 : 6)
    ? [
        intervalKelas[0].tepiBawah.toFixed(1),
        ...intervalKelas.map(item => item.tepiAtas.toFixed(1))
      ]
    : defaultTicks

  const [isNarrow, setIsNarrow] = useState(false)
  const [isShortViewport, setIsShortViewport] = useState(false)

  useEffect(() => {
    const check = () => {
      setIsNarrow(window.innerWidth < 768)
      // "Short" catches landscape phones (~350-450px height) even though width > 768
      setIsShortViewport(window.innerHeight < 520)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // stackLayout → column direction: pool on top, histogram below (portrait phones only)
  const stackLayout = isNarrow || forceStack

  // isCompact → small bars + chip pool: any small screen (portrait OR landscape phone)
  const isCompact = isNarrow || isShortViewport || forceStack

  // isUltraCompact → landscape phone specifically (short & wide)
  const isUltraCompact = !isNarrow && isShortViewport && !forceStack

  const [dataPoints, setDataPoints] = useState<DataPoint[]>(() =>
    initDataPoints(screenTimeData, getClassIndex, PREPLACED_INDICES, readOnly)
  )

  useEffect(() => {
    if (placedIndices) {
      setDataPoints(prev =>
        prev.map(item => ({
          ...item,
          placed: placedIndices.includes(item.originalIdx) || PREPLACED_INDICES.has(item.originalIdx) || readOnly
        }))
      )
    }
  }, [placedIndices, readOnly])

  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null)
  const [flashError, setFlashError] = useState<number | null>(null)
  const [lastFailedVal, setLastFailedVal] = useState<number | null>(null)
  const [failedCount, setFailedCount] = useState<number>(0)
  const [submitted, setSubmitted] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const isFD = mode === 'FD'
  let showTextHint = false
  let showVisualHighlight = false

  if (lastFailedVal !== null) {
    if (isFD) {
      if (failedCount === 1) {
        showTextHint = true
      } else if (failedCount >= 2) {
        showVisualHighlight = true
      }
    } else {
      if (failedCount === 2) {
        showTextHint = true
      } else if (failedCount >= 3) {
        showVisualHighlight = true
      }
    }
  }

  const correctSlotIdx = lastFailedVal !== null ? getClassIndex(lastFailedVal) : null

  const handleWrongAttempt = useCallback((val: number, slotIdx: number) => {
    setFlashError(slotIdx)
    setTimeout(() => { setFlashError(null) }, 500)

    setLastFailedVal(prevVal => {
      if (prevVal === val) {
        setFailedCount(prevCount => prevCount + 1)
        return prevVal
      } else {
        setFailedCount(1)
        return val
      }
    })
  }, [])

  // Called when Framer Motion starts a drag gesture on a data point
  const handleDragStart = useCallback((dp: DataPoint) => () => {
    setSelectedPoint(null)
    setDraggingId(dp.id)
  }, [])

  // Called when Framer Motion ends a drag gesture
  // Uses the native PointerEvent / MouseEvent for accurate client coords,
  // then elementFromPoint to detect which histogram slot is under the cursor.
  const handleDragEnd = useCallback((dp: DataPoint) => (
    event: MouseEvent | TouchEvent | PointerEvent,
    _info: PanInfo,
  ) => {
    setDraggingId(null)

    // Extract client (viewport) coordinates from the native event
    let clientX: number, clientY: number
    if ('changedTouches' in event && event.changedTouches.length > 0) {
      clientX = event.changedTouches[0].clientX
      clientY = event.changedTouches[0].clientY
    } else {
      clientX = (event as MouseEvent | PointerEvent).clientX
      clientY = (event as MouseEvent | PointerEvent).clientY
    }

    // Temporarily hide the dragged badge so elementFromPoint sees what's beneath it
    const dragEl = document.getElementById(dp.id)
    const savedPE = dragEl?.style.pointerEvents ?? ''
    if (dragEl) dragEl.style.pointerEvents = 'none'

    const elem = document.elementFromPoint(clientX, clientY)

    if (dragEl) dragEl.style.pointerEvents = savedPE

    if (elem) {
      const slotEl = elem.closest('[data-slot-idx]')
      if (slotEl) {
        const slotIdx = parseInt(slotEl.getAttribute('data-slot-idx') ?? '-1')
        if (slotIdx !== -1) {
          if (dp.classIdx === slotIdx) {
            setDataPoints(prev => {
              const updated = prev.map(item => item.id === dp.id ? { ...item, placed: true } : item)
              if (onPlacedChange) {
                const placedIdxs = updated.filter(item => item.placed).map(item => item.originalIdx)
                onPlacedChange(placedIdxs)
              }
              return updated
            })
            setLastFailedVal(prev => {
              if (prev === dp.val) {
                setFailedCount(0)
                return null
              }
              return prev
            })
          } else {
            handleWrongAttempt(dp.val, slotIdx)
          }
        }
      }
    }
  }, [onPlacedChange, handleWrongAttempt])

  // Tap-to-select then tap-slot to place (alternative to drag)
  const onTapPoint = (dp: DataPoint) => {
    if (draggingId) return
    setSelectedPoint(prev => prev?.id === dp.id ? null : dp)
  }

  const onTapSlot = useCallback((slotIdx: number) => {
    if (!selectedPoint) return
    if (selectedPoint.classIdx === slotIdx) {
      setDataPoints(prev => {
        const updated = prev.map(dp => dp.id === selectedPoint.id ? { ...dp, placed: true } : dp)
        if (onPlacedChange) {
          const placedIdxs = updated.filter(item => item.placed).map(item => item.originalIdx)
          onPlacedChange(placedIdxs)
        }
        return updated
      })
      setLastFailedVal(prev => {
        if (prev === selectedPoint.val) {
          setFailedCount(0)
          return null
        }
        return prev
      })
      setSelectedPoint(null)
    } else {
      handleWrongAttempt(selectedPoint.val, slotIdx)
    }
  }, [selectedPoint, onPlacedChange, handleWrongAttempt])

  const handleSubmit = () => {
    if (!dataPoints.every(dp => dp.placed)) return
    setSubmitted(true)
    onSubmit?.(true)
  }

  const allPlaced     = dataPoints.every(dp => dp.placed)
  const activePool    = dataPoints.filter(dp => !dp.placed)
  const remainByClass = CLASS_LABELS.map((_, ci) => dataPoints.filter(dp => !dp.placed && dp.classIdx === ci).length)
  const placedByClass = CLASS_LABELS.map((_, ci) => dataPoints.filter(dp => dp.placed && dp.classIdx === ci))
  const isDraggingAny = !!draggingId
  // The DataPoint currently being dragged — used to highlight the matching histogram column
  const draggingPoint = isDraggingAny
    ? dataPoints.find(dp => dp.id === draggingId) ?? null
    : null

  // ── READ-ONLY: reference histogram ──────────────────────────────────────────
  if (readOnly) {
    const maxF = Math.max(...CORRECT_TABLE.map(r => r.f))
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 8px' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', height: '160px', gap: '0px',
          borderLeft: '2px solid rgba(14, 131, 136, 0.15)',
          borderBottom: '2px solid rgba(14, 131, 136, 0.15)',
          paddingLeft: '0px', paddingBottom: '0px',
          position: 'relative',
        }}>
          {CORRECT_TABLE.map((row, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(row.f / maxF) * 100}%` }}
                transition={{ delay: i * 0.15, duration: 0.7, ease: 'easeOut' }}
                style={{
                  width: '100%', borderRadius: '0px',
                  background: `linear-gradient(180deg, ${CLASS_COLORS[i]}99 0%, ${CLASS_COLORS[i]}55 100%)`,
                  border: `1px solid ${CLASS_COLORS[i]}88`,
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '4px',
                  boxShadow: `0 0 8px ${CLASS_COLORS[i]}44`,
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#000000' }}>f={row.f}</span>
              </motion.div>
            </div>
          ))}
        </div>
        {/* Tepi Kelas ticks at boundaries */}
        <div style={{
          width: '100%',
          marginTop: '4px',
          height: '14px',
          position: 'relative',
          flexShrink: 0,
        }}>
          {ticks.map((tick, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '8px',
                color: '#78716C',
                fontWeight: 700,
                fontFamily: 'var(--font-data)',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                position: 'absolute',
                left: `calc(2px + ${(idx / 6)} * (100% - 2px))`,
                textAlign: 'center',
              }}
            >
              
              {tick}
            </span>
          ))}
        </div>
        <div style={{ textAlign: 'center', fontSize: '10px', color: '#A8A29E', fontWeight: 700, letterSpacing: '1px', marginTop: '6px' }}>
          SCREEN TIME (JAM/HARI)
        </div>
      </div>
    )
  }

  // ── INTERACTIVE ──────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: 0 }}>

      {/* Unified workspace card — pool + histogram as one surface */}
      <div style={{
        display: 'flex',
        flexDirection: stackLayout ? 'column' : 'row',
        flex: 1,
        minHeight: 0,
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.012)',
        border: '1px solid rgba(14, 131, 136, 0.15)',
        // overflow: 'visible' during drag so the chip is not clipped when crossing
        // from the pool side into the histogram side.
        overflow: isDraggingAny ? 'visible' : 'hidden',
      }}>

        {/* ── LEFT: Data Pool ─────────────────────────────────────────────────── */}
        {/*
          Width/height logic:
          - Portrait phone (stackLayout): full width, fixed 160px (chips don't need scatter height)
          - Landscape phone (!stackLayout, isCompact): 36% – histogram needs more room
          - Desktop (!stackLayout, !isCompact): 40% (scatter needs breathing room)
        */}
        <div style={{
        flex: stackLayout ? 'none' : isUltraCompact ? '0 0 28%' : isCompact ? '0 0 36%' : '0 0 40%',
          height: stackLayout ? '160px' : '100%',
          display: 'flex', flexDirection: 'column',
          padding: isUltraCompact ? '4px 6px 4px' : isCompact ? '6px 8px 6px' : '10px 12px 8px',
          position: 'relative',
          borderRight: stackLayout ? 'none' : '1px solid rgba(14, 131, 136, 0.08)',
          borderBottom: stackLayout ? '1px solid rgba(14, 131, 136, 0.08)' : 'none',
        }}>

          {/* Pool header */}
          <div style={{ flexShrink: 0, marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{
              fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase',
              color: allPlaced ? '#00ADB5' : '#94A3B8',
              transition: 'color 0.3s',
            }}>
              {allPlaced ? '✅ Semua terkelompokkan' : `📍 Data — ${activePool.length} tersisa`}
            </div>

          </div>

          {/* Pool zone — two layouts:
              Desktop: absolute-scatter (scattered across 2D space, looks premium)
              Compact: flex-wrap chips (never overlap, works at any size) */}
          <div style={{
            position: 'relative',
            flex: 1,
            minHeight: 0,
            // During drag: visible so chip is not clipped outside pool bounds.
            overflow: isDraggingAny ? 'visible' : (isCompact ? 'auto' : 'hidden'),
            // In chip mode we switch to flex layout
            display: isCompact ? 'flex' : 'block',
            flexWrap: isCompact ? 'wrap' : undefined,
            gap: isUltraCompact ? '3px' : isCompact ? '4px' : undefined,
            alignContent: isCompact ? 'flex-start' : undefined,
            padding: isCompact ? '2px 0' : undefined,
          }}>
            <AnimatePresence>
              {activePool.length === 0 ? (
                <motion.div
                  key="empty-pool"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    // Works for both block (scatter) and flex (chip) parent
                    position: isCompact ? 'static' : 'absolute',
                    inset: isCompact ? undefined : 0,
                    flex: isCompact ? '1 1 100%' : undefined,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: '6px', textAlign: 'center',
                    fontSize: '12px', color: '#00ADB5', fontWeight: 700,
                    minHeight: isCompact ? '40px' : undefined,
                  }}
                >
                  <span style={{ fontSize: '22px' }}>🎯</span>
                  Semua data masuk!
                  <span style={{ fontSize: '10px', opacity: 0.6 }}>Klik Submit ↓</span>
				</motion.div>
              ) : isCompact ? (
                // ── COMPACT MODE: flex-wrap chips ──────────────────────────────
                // Each chip is a draggable pill in normal flow. No overlapping.
                activePool.map(dp => {
                  const col = '#00ADB5'
                  const isSelected = selectedPoint?.id === dp.id
                  const isThisDragging = draggingId === dp.id

                  return (
                    <motion.div
                      key={dp.id}
                      id={dp.id}
                      layout
                      drag
                      dragSnapToOrigin
                      dragMomentum={false}
                      dragElastic={0.08}
                      onDragStart={handleDragStart(dp)}
                      onDragEnd={handleDragEnd(dp)}
                      onClick={() => onTapPoint(dp)}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0, transition: { duration: 0.12 } }}
                      whileHover={!isDraggingAny ? { scale: 1.12, y: -1 } : {}}
                      whileDrag={{
                        scale: 1.3,
                        rotate: 3,
                        zIndex: 9999,
                        cursor: 'grabbing',
                        boxShadow: `0 14px 36px ${col}66, 0 0 0 2px ${col}`,
                        opacity: 0.97,
                      }}

                      style={{
                        // flex-item sizing
                        flexShrink: 0,
                        padding: isUltraCompact ? '3px 7px' : '4px 10px',
                        borderRadius: '50px',
                        background: isSelected
                          ? `linear-gradient(135deg, ${col} 0%, #fff 130%)`
                          : `linear-gradient(135deg, ${col}dd 0%, ${col}88 100%)`,
                        border: isSelected ? '2px solid #fff' : `1.5px solid ${col}66`,
                        color: isSelected ? '#000' : '#fff',
                        fontSize: isUltraCompact ? '10px' : '11px',
                        fontWeight: 800,
                        cursor: 'grab',
                        userSelect: 'none',
                        touchAction: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // Elevate when selected or dragging
                        zIndex: isThisDragging ? 1000 : isSelected ? 50 : 1,
                        boxShadow: isSelected
                          ? `0 0 14px ${col}`
                          : `0 2px 8px rgba(0,0,0,0.5), 0 0 4px ${col}44`,
                        fontFamily: 'var(--font-data)',
                        whiteSpace: 'nowrap',
                        transition: 'box-shadow 0.15s, background 0.15s, border 0.15s',
                        minWidth: isUltraCompact ? '24px' : '28px',
                        textAlign: 'center',
                      }}
                    >
                      {dp.val}
                    </motion.div>
                  )
                })
              ) : (
                // ── DESKTOP MODE: absolute scatter ─────────────────────────────
                activePool.map(dp => {
                  const pos = SCATTERED_POSITIONS[dp.originalIdx % SCATTERED_POSITIONS.length]
                  const col = '#00ADB5'
                  const isSelected  = selectedPoint?.id === dp.id
                  const isThisDragging = draggingId === dp.id

                  return (
                    // Outer wrapper: static absolute position & centering transform.
                    // The inner motion.div handles the drag offset separately.
                    <div
                      key={dp.id}
                      style={{
                        position: 'absolute',
                        top: pos.top,
                        left: pos.left,
                        transform: 'translate(-50%, -50%)',
                        zIndex: isThisDragging ? 1000 : isSelected ? 50 : 1,
                        pointerEvents: 'none',
                      }}
                    >
                      <motion.div
                        id={dp.id}
                        drag
                        dragSnapToOrigin
                        dragMomentum={false}
                        dragElastic={0.08}
                        onDragStart={handleDragStart(dp)}
                        onDragEnd={handleDragEnd(dp)}
                        onClick={() => onTapPoint(dp)}
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0, transition: { duration: 0.15 } }}
                        whileHover={!isDraggingAny ? { scale: 1.15 } : {}}
                        whileDrag={{
                          scale: 1.35,
                          rotate: 4,
                          zIndex: 9999,
                          cursor: 'grabbing',
                          boxShadow: `0 18px 44px ${col}66, 0 0 0 3px ${col}`,
                          opacity: 0.97,
                        }}
                        style={{
                          pointerEvents: 'auto',
                          padding: '5px 12px',
                          borderRadius: '50px',
                          background: isSelected
                            ? `linear-gradient(135deg, ${col} 0%, #fff 130%)`
                            : `linear-gradient(135deg, ${col}dd 0%, ${col}88 100%)`,
                          border: isSelected
                            ? '2px solid #fff'
                            : `1.5px solid ${col}66`,
                          color: isSelected ? '#000' : '#fff',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'grab',
                          userSelect: 'none',
                          touchAction: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isSelected
                            ? `0 0 18px ${col}`
                            : `0 3px 12px rgba(0,0,0,0.6), 0 0 6px ${col}44`,
                          fontFamily: 'var(--font-data)',
                          whiteSpace: 'nowrap',
                          transition: 'box-shadow 0.15s, background 0.15s, border 0.15s',
                        }}
                      >
                        {dp.val}
                      </motion.div>
                    </div>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT: Histogram Canvas ──────────────────────────────────────────── */}
        {/*
          Height: stacked portrait = 330px fixed; side-by-side = 100% of workspace
          In compact (landscape phone) side-by-side mode, height = 100% of the
          workspace card which is itself constrained by the viewport.
        */}
        <div style={{
          flex: 1,
          height: stackLayout ? '330px' : '100%',
          display: 'flex', flexDirection: 'column',
          padding: isUltraCompact ? '4px 4px 2px 8px' : isCompact ? '6px 6px 3px 24px' : '10px 10px 4px 30px',
          position: 'relative',
        }}>

          {/* Y-axis label — hidden on ultraCompact (landscape phone) to save space */}
          {!isUltraCompact && (
            <div style={{
              position: 'absolute', left: 2, top: '50%',
              transform: 'translateY(-50%) rotate(-90deg)',
              fontSize: '7px', color: '#A8A29E',
              fontWeight: 800, letterSpacing: '1.5px', whiteSpace: 'nowrap',
            }}>
              FREKUENSI
            </div>
          )}

          {/* Bar columns */}
          <div style={{
            display: 'flex', gap: '0px', alignItems: 'flex-end',
            flex: 1, minHeight: 0,
            borderLeft: '2px solid rgba(255,255,255,0.12)',
            borderBottom: '2px solid rgba(255,255,255,0.12)',
            paddingBottom: '0px',
          }}>
            {CLASS_LABELS.map((label, i) => {
              const placed      = placedByClass[i]
              const isError     = flashError === i
              const isTarget    = selectedPoint?.classIdx === i
              const col         = CLASS_COLORS[i]
              const isMatchDrag = false
              const shouldHighlightColumn = showVisualHighlight && correctSlotIdx === i

              return (
                <motion.div
                  key={i}
                  data-slot-idx={i}
                  animate={
                    isError 
                      ? { x: [-5, 5, -5, 5, 0] } 
                      : shouldHighlightColumn
                        ? {
                            boxShadow: [
                              '0 0 4px rgba(0, 173, 181, 0.25), inset 0 0 3px rgba(0, 173, 181, 0.1)',
                              '0 0 16px rgba(0, 173, 181, 0.8), inset 0 0 8px rgba(0, 173, 181, 0.4)',
                              '0 0 4px rgba(0, 173, 181, 0.25), inset 0 0 3px rgba(0, 173, 181, 0.1)'
                            ]
                          }
                        : {}
                  }
                  transition={
                    isError 
                      ? { duration: 0.35 } 
                      : shouldHighlightColumn
                        ? { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }
                        : {}
                  }
                  onClick={() => onTapSlot(i)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', height: '100%', justifyContent: 'flex-end',
                    cursor: selectedPoint ? 'pointer' : 'default',
                    borderRadius: '0px', padding: '0px',
                    position: 'relative', // needed for the drop indicator badge
                    background: isError
                      ? 'rgba(239,68,68,0.12)'
                      : isMatchDrag
                        // Matching class: bright glow in that class colour
                        ? `${col}28`
                        : isTarget
                          ? `${col}12`
                          : isDraggingAny
                            // Non-matching: dim out so the correct column stands out
                            ? 'rgba(14, 131, 136, 0.03)'
                            : 'transparent',
                    border: '2px solid transparent',
                    borderColor: shouldHighlightColumn ? '#00ADB5' : 'transparent',
                    outline: isMatchDrag && !isError
                      ? `2px dashed ${col}99`
                      : isDraggingAny && !isError
                        ? `1px dashed ${col}20`
                        : 'none',
                    outlineOffset: '-2px',
                    transition: 'background 0.18s, outline 0.18s, border-color 0.18s',
                    // Scale up the matching column slightly for extra affordance
                    transform: isMatchDrag ? 'scaleY(1.018)' : 'scaleY(1)',
                  }}
                >
                  {/* No drag hint overlay badge */}

                  <div style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    gap: isCompact ? '1px' : '2px',
                    alignItems: 'center',
                    flex: 1,
                    height: '100%',
                    justifyContent: 'flex-start',
                    borderBottom: isError
                      ? '2px solid #EF4444'
                      : isTarget || (isDraggingAny && !isError)
                        ? `2px solid ${col}${isTarget ? 'ff' : '55'}`
                        : '2px solid rgba(14, 131, 136, 0.1)',
                    transition: 'border-color 0.2s',
                  }}>
                    <AnimatePresence>
                      {placed.map(dp => (
                        <motion.div
                          key={dp.id}
                          initial={{ scale: 0.5, opacity: 0, y: -10 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                          style={{
                            width: '100%',
                            height: isUltraCompact ? 'calc((100% - 16px) / 13)' : isCompact ? 'calc((100% - 22px) / 13)' : 'calc((100% - 38px) / 13)',
                            flexShrink: 0,
                            background: `linear-gradient(180deg, ${col}cc 0%, ${col}88 100%)`,
                            border: `1px solid ${col}44`,
                            borderRadius: '0px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: isUltraCompact ? '6.5px' : isCompact ? '7.5px' : '8px',
                            fontWeight: 800,
                            color: '#000000',
                          }}
                        >
                          {dp.val}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Empty drop-zone placeholder */}
                    {placed.length === 0 && (
                      <div style={{
                        width: '100%', height: '26px', borderRadius: '0px', flexShrink: 0,
                        border: isError
                          ? '2px dashed #EF4444'
                          : isTarget
                            ? `2px dashed ${col}`
                            : isDraggingAny
                              ? `1px dashed ${col}45`
                              : '1px dashed rgba(14, 131, 136, 0.12)',
                        background: isTarget ? `${col}08` : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '15px', color: 'rgba(255,255,255,0.12)',
                        transition: 'all 0.2s',
                      }}>+</div>
                    )}

                    {placed.length > 0 && (
                      <div style={{
                        fontSize: '10px', fontWeight: 800, color: col,
                        marginBottom: '2px', flexShrink: 0,
                      }}>
                        f = {placed.length}
                      </div>
                    )}
                  </div>

                </motion.div>
              )
            })}
          </div>

          {/* Tepi Kelas ticks at boundaries */}
          <div style={{
            width: '100%',
            marginTop: '4px',
            height: '14px',
            position: 'relative',
            flexShrink: 0,
          }}>
            {ticks.map((tick, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '8px',
                  color: '#94A3B8',
                  fontWeight: 700,
                  fontFamily: 'var(--font-data)',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  position: 'absolute',
                  left: `calc(2px + ${(idx / 6)} * (100% - 2px))`,
                  textAlign: 'center',
                }}
              >
                {tick}
              </span>
            ))}
          </div>

          {/* X-axis title */}
          <div style={{
            textAlign: 'center', fontSize: '7.5px',
            color: '#94A3B8', fontWeight: 800,
            letterSpacing: '1px', marginTop: '3px', flexShrink: 0,
          }}>
            SCREEN TIME (JAM/HARI)
          </div>
        </div>
      </div>

      {/* Hint toast */}
      <AnimatePresence>
        {showTextHint && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            style={{
              flexShrink: 0,
              padding: '7px 12px', borderRadius: '10px', fontSize: '12px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#E2E8F0', lineHeight: 1.4,
            }}
          >
            Lihat nilai angkanya dulu, kira-kira masuk di rentang interval yang mana? 🤔
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
