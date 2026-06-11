'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { screenTimeData } from '../_data/level1'

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
}

function getClassIndex(val: number): number {
  if (val >= 3.5 && val <= 4.4) return 0
  if (val >= 4.5 && val <= 5.4) return 1
  if (val >= 5.5 && val <= 6.4) return 2
  if (val >= 6.5 && val <= 7.4) return 3
  if (val >= 7.5 && val <= 8.4) return 4
  if (val >= 8.5 && val <= 9.4) return 5
  return -1
}

const CLASS_LABELS = [
  '3.5 – 4.4',
  '4.5 – 5.4',
  '5.5 – 6.4',
  '6.5 – 7.4',
  '7.5 – 8.4',
  '8.5 – 9.4',
]

const SCATTERED_POSITIONS = [
  { top: '20%', left: '15%' },
  { top: '35%', left: '40%' },
  { top: '15%', left: '65%' },
  { top: '50%', left: '18%' },
  { top: '75%', left: '25%' },
  { top: '48%', left: '55%' },
  { top: '25%', left: '82%' },
  { top: '80%', left: '72%' },
  { top: '55%', left: '85%' },
  { top: '78%', left: '48%' },
]

export default function DraggableHistogram({ mode, onSubmit, readOnly = false }: DraggableHistogramProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Initialize data points (pre-placed first 3 classes for FD scaffolding, or all if readOnly)
  const [dataPoints, setDataPoints] = useState<DataPoint[]>(() => {
    return screenTimeData.map((val, idx) => {
      const cIdx = getClassIndex(val)
      const isPreplaced = readOnly || (mode === 'FD' && (cIdx === 0 || cIdx === 1 || cIdx === 2))
      return {
        id: `dp-${idx}`,
        val,
        classIdx: cIdx,
        placed: isPreplaced,
        originalIdx: idx,
      }
    })
  })

  const [draggingPoint, setDraggingPoint] = useState<DataPoint | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null) // mobile
  const [flashError, setFlashError] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  // Drag handlers
  const onDragStart = (dp: DataPoint) => {
    setDraggingPoint(dp)
  }

  const onDragEnd = () => {
    setDraggingPoint(null)
  }

  const onDropSlot = useCallback((slotIdx: number) => {
    if (!draggingPoint) return

    if (draggingPoint.classIdx === slotIdx) {
      setDataPoints(prev =>
        prev.map(dp => (dp.id === draggingPoint.id ? { ...dp, placed: true } : dp))
      )
    } else {
      setFlashError(slotIdx)
      setTimeout(() => setFlashError(null), 500)
    }
    setDraggingPoint(null)
  }, [draggingPoint])

  // Mobile Tap Handlers
  const onTapPoint = (dp: DataPoint) => {
    if (selectedPoint?.id === dp.id) {
      setSelectedPoint(null)
    } else {
      setSelectedPoint(dp)
    }
  }

  const onTapSlot = useCallback((slotIdx: number) => {
    if (!selectedPoint) return

    if (selectedPoint.classIdx === slotIdx) {
      setDataPoints(prev =>
        prev.map(dp => (dp.id === selectedPoint.id ? { ...dp, placed: true } : dp))
      )
      setSelectedPoint(null)
    } else {
      setFlashError(slotIdx)
      setTimeout(() => setFlashError(null), 500)
    }
  }, [selectedPoint])

  const handleSubmit = () => {
    const allPlaced = dataPoints.every(dp => dp.placed)
    if (!allPlaced) return
    setSubmitted(true)
    if (onSubmit) onSubmit(true)
  }

  const allPlaced = dataPoints.every(dp => dp.placed)
  const activePool = dataPoints.filter(dp => !dp.placed)

  // Render a static reference histogram when readOnly is true
  if (readOnly) {
    return (
      <div className="histogram-canvas" style={{ padding: '24px 20px 12px', height: '280px', position: 'relative' }}>
        {/* Y axis label */}
        <div style={{
          position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%) rotate(-90deg)',
          fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px',
          whiteSpace: 'nowrap', zIndex: 5
        }}>
          FREKUENSI (JUMLAH SISWA)
        </div>

        {/* Columns & Stacked Bars */}
        <div style={{ 
          display: 'flex', gap: '8px', alignItems: 'flex-end', 
          height: '100%', paddingLeft: '28px', paddingBottom: '24px'
        }}>
          {CLASS_LABELS.map((label, i) => {
            const placedPoints = dataPoints.filter(dp => dp.placed && dp.classIdx === i)

            return (
              <div
                key={i}
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  height: '100%', 
                  justifyContent: 'flex-end',
                  borderRadius: '6px',
                  padding: '2px'
                }}
              >
                {/* Stacked Blocks container */}
                <div style={{ 
                  width: '100%', 
                  display: 'flex', 
                  flexDirection: 'column-reverse', 
                  gap: '3px', 
                  alignItems: 'center',
                  minHeight: '36px',
                  justifyContent: 'flex-start',
                  paddingBottom: '6px',
                  borderBottom: '2px solid rgba(255,255,255,0.1)'
                }}>
                  {placedPoints.map((dp) => (
                    <div
                      key={dp.id}
                      style={{
                        width: '100%',
                        height: '34px',
                        background: mode === 'FD' && (i === 0 || i === 1 || i === 2)
                          ? 'linear-gradient(180deg, rgba(0,255,136,0.5) 0%, rgba(0,200,255,0.3) 100%)'
                          : 'linear-gradient(180deg, #00FF88 0%, #00cc88 100%)',
                        border: '1px solid rgba(0,0,0,0.2)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 800,
                        color: '#000',
                        boxShadow: '0 2px 6px rgba(0,255,136,0.3)',
                      }}
                    >
                      {dp.val.toFixed(1)}
                    </div>
                  ))}
                </div>

                {/* X axis interval label */}
                <div style={{ 
                  fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center',
                  fontFamily: 'var(--font-data)', marginTop: '6px', lineHeight: 1.35,
                  fontWeight: 700
                }}>
                  {label.replace('–', '–\n')}
                </div>
              </div>
            )
          })}
        </div>

        {/* X axis title */}
        <div style={{ 
          textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', 
          fontWeight: 800, letterSpacing: '1.5px', marginTop: '-14px',
          textTransform: 'uppercase'
        }}>
          KELAS INTERVAL (SCREEN TIME JAM/HARI)
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        
        {/* LEFT SECTION: Scattered Data Points Pool */}
        <div className="game-card" style={{ 
          flex: 1, 
          padding: '16px 20px', 
          background: 'rgba(255,255,255,0.02)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: isMobile ? '240px' : '320px'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>
            {allPlaced 
              ? '✅ DATA SELESAI DIKELOMPOKKAN!' 
              : `📍 KOLAM DATA ACAK (${activePool.length} data):`
            }
          </div>

          <div style={{
            position: 'relative',
            flex: 1,
            background: 'rgba(255,255,255,0.01)',
            border: '1px dashed rgba(255,255,255,0.06)',
            borderRadius: '12px',
            overflow: 'hidden',
            minHeight: '260px'
          }}>
            <AnimatePresence>
              {activePool.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ 
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontSize: '13px', 
                    color: 'var(--accent)', 
                    fontWeight: 700,
                    padding: '20px'
                  }}
                >
                  Hebat! Semua data berhasil masuk ke dalam histogram. Klik submit di bawah! 🚀
                </motion.div>
              ) : (
                activePool.map(dp => {
                  const pos = SCATTERED_POSITIONS[dp.originalIdx]
                  return (
                    <motion.div
                      key={dp.id}
                      layout
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      draggable
                      onDragStart={() => onDragStart(dp)}
                      onDragEnd={onDragEnd}
                      onClick={() => onTapPoint(dp)}
                      style={{
                        position: 'absolute',
                        top: pos.top,
                        left: pos.left,
                        transform: 'translate(-50%, -50%)',
                        padding: '8px 16px',
                        borderRadius: '50px',
                        background: selectedPoint?.id === dp.id
                          ? 'linear-gradient(135deg, #00FF88 0%, #06B6D4 100%)'
                          : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                        border: selectedPoint?.id === dp.id ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                        color: selectedPoint?.id === dp.id ? '#000' : '#fff',
                        fontSize: '13px',
                        fontWeight: 800,
                        cursor: 'grab',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: selectedPoint?.id === dp.id 
                          ? '0 0 15px rgba(0,255,136,0.6)' 
                          : '0 4px 10px rgba(0,0,0,0.3)',
                        fontFamily: 'var(--font-data)',
                        touchAction: 'none'
                      }}
                    >
                      {dp.val.toFixed(1)}
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT SECTION: Histogram Canvas */}
        <div className="histogram-canvas" style={{ 
          flex: 1.2, 
          padding: '24px 20px 12px', 
          minHeight: '320px', 
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Y axis label */}
          <div style={{
            position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%) rotate(-90deg)',
            fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px',
            whiteSpace: 'nowrap', zIndex: 5
          }}>
            FREKUENSI (JUMLAH SISWA)
          </div>

          {/* Columns & Stacked Bars */}
          <div style={{ 
            display: 'flex', gap: '8px', alignItems: 'flex-end', 
            height: '100%', paddingLeft: '28px', paddingBottom: '24px',
            flex: 1
          }}>
            {CLASS_LABELS.map((label, i) => {
              const placedPoints = dataPoints.filter(dp => dp.placed && dp.classIdx === i)
              const isError = flashError === i

              return (
                <motion.div
                  key={i}
                  animate={isError ? { x: [-6, 6, -6, 6, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  onDragOver={e => { e.preventDefault() }}
                  onDrop={() => onDropSlot(i)}
                  onClick={() => onTapSlot(i)}
                  style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    height: '100%', 
                    justifyContent: 'flex-end',
                    cursor: selectedPoint ? 'pointer' : 'default',
                    borderRadius: '6px',
                    background: isError 
                      ? 'rgba(255,51,102,0.1)' 
                      : selectedPoint && selectedPoint.classIdx === i
                        ? 'rgba(0,255,136,0.03)'
                        : 'transparent',
                    transition: 'background 0.2s',
                    padding: '2px'
                  }}
                >
                  {/* Stacked Blocks container */}
                  <div style={{ 
                    width: '100%', 
                    display: 'flex', 
                    flexDirection: 'column-reverse', 
                    gap: '3px', 
                    alignItems: 'center',
                    minHeight: '36px',
                    justifyContent: 'flex-start',
                    paddingBottom: '6px',
                    borderBottom: isError
                      ? '2px solid var(--danger)'
                      : selectedPoint && selectedPoint.classIdx === i
                        ? '2px solid var(--accent)'
                        : '2px solid rgba(255,255,255,0.1)'
                  }}>
                    <AnimatePresence>
                      {placedPoints.map((dp) => (
                        <motion.div
                          key={dp.id}
                          initial={{ scale: 0.5, y: -20, opacity: 0 }}
                          animate={{ scale: 1, y: 0, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          style={{
                            width: '100%',
                            height: '34px',
                            background: mode === 'FD' && (i === 0 || i === 1 || i === 2)
                              ? 'linear-gradient(180deg, rgba(0,255,136,0.5) 0%, rgba(0,200,255,0.3) 100%)'
                              : 'linear-gradient(180deg, #00FF88 0%, #00cc88 100%)',
                            border: '1px solid rgba(0,0,0,0.2)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 800,
                            color: '#000',
                            boxShadow: '0 2px 6px rgba(0,255,136,0.3)',
                            transformOrigin: 'bottom',
                          }}
                        >
                          {dp.val.toFixed(1)}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Highlight box if slot is empty & mobile item is selected to show drop zone */}
                    {placedPoints.length === 0 && (
                      <div style={{
                        width: '100%',
                        height: '34px',
                        border: isError 
                          ? '2px dashed var(--danger)'
                          : selectedPoint && selectedPoint.classIdx === i
                            ? '2px dashed var(--accent)'
                            : '1px dashed rgba(255,255,255,0.06)',
                        borderRadius: '6px',
                        background: selectedPoint && selectedPoint.classIdx === i
                          ? 'rgba(0,255,136,0.05)'
                          : 'rgba(255,255,255,0.01)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.15)',
                        transition: 'all 0.2s'
                      }}>
                        +
                      </div>
                    )}
                  </div>

                  {/* X axis interval label */}
                  <div style={{ 
                    fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center',
                    fontFamily: 'var(--font-data)', marginTop: '6px', lineHeight: 1.35,
                    fontWeight: 700
                  }}>
                    {label.replace('–', '–\n')}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* X axis title */}
          <div style={{ 
            textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', 
            fontWeight: 800, letterSpacing: '1.5px', marginTop: '6px',
            textTransform: 'uppercase'
          }}>
            KELAS INTERVAL (SCREEN TIME JAM/HARI)
          </div>
        </div>

      </div>

      {/* Submit Button */}
      <button
        className="game-btn game-btn-primary"
        onClick={handleSubmit}
        disabled={!allPlaced}
        style={{ 
          width: '100%', 
          opacity: allPlaced ? 1 : 0.5,
          cursor: allPlaced ? 'pointer' : 'not-allowed',
          boxShadow: allPlaced ? 'var(--accent-glow)' : 'none'
        }}
      >
        {allPlaced ? 'Submit Histogram →' : `Kelompokkan semua data (${activePool.length} data lagi)`}
      </button>
    </div>
  )
}
