'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { screenTimeData, CLASS_LABELS, getClassIndex } from '../_data/level1'

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

// Scattered positions pool for 35 data points
const SCATTERED_POSITIONS = [
  { top: '12%', left: '8%' }, { top: '28%', left: '22%' }, { top: '18%', left: '42%' },
  { top: '45%', left: '10%' }, { top: '60%', left: '28%' }, { top: '30%', left: '58%' },
  { top: '72%', left: '15%' }, { top: '55%', left: '45%' }, { top: '80%', left: '38%' },
  { top: '65%', left: '62%' }, { top: '20%', left: '72%' }, { top: '40%', left: '80%' },
  { top: '75%', left: '72%' }, { top: '85%', left: '55%' }, { top: '10%', left: '55%' },
  { top: '50%', left: '70%' }, { top: '35%', left: '35%' }, { top: '88%', left: '20%' },
  { top: '22%', left: '88%' }, { top: '62%', left: '85%' }, { top: '48%', left: '90%' },
  { top: '8%', left: '30%' },  { top: '38%', left: '68%' }, { top: '70%', left: '50%' },
  { top: '15%', left: '18%' }, { top: '52%', left: '32%' }, { top: '78%', left: '85%' },
  { top: '25%', left: '78%' }, { top: '90%', left: '70%' }, { top: '42%', left: '50%' },
  { top: '5%', left: '65%' },  { top: '68%', left: '38%' }, { top: '33%', left: '12%' },
  { top: '82%', left: '60%' }, { top: '58%', left: '78%' },
]

const CLASS_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

// FD: pre-place all data in class 0 (1-4), leaving classes 1-3 for student to fill
function initDataPoints(mode: Mode, readOnly: boolean): DataPoint[] {
  return screenTimeData.map((val, idx) => {
    const cIdx = getClassIndex(val)
    const isPreplaced = readOnly || (mode === 'FD' && cIdx === 0)
    return {
      id: `dp-${idx}`,
      val,
      classIdx: cIdx,
      placed: isPreplaced,
      originalIdx: idx,
    }
  })
}

export default function DraggableHistogram({ mode, onSubmit, readOnly = false }: DraggableHistogramProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const [dataPoints, setDataPoints] = useState<DataPoint[]>(() => initDataPoints(mode, readOnly))
  const [draggingPoint, setDraggingPoint] = useState<DataPoint | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null)
  const [flashError, setFlashError] = useState<number | null>(null)
  const [flashHint, setFlashHint] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const triggerError = (slotIdx: number, hint: string) => {
    setFlashError(slotIdx)
    setFlashHint(hint)
    setTimeout(() => { setFlashError(null); setFlashHint(null) }, 2500)
  }

  // Drag handlers
  const onDragStart = (dp: DataPoint) => setDraggingPoint(dp)
  const onDragEnd = () => setDraggingPoint(null)

  const onDropSlot = useCallback((slotIdx: number) => {
    if (!draggingPoint) return
    if (draggingPoint.classIdx === slotIdx) {
      setDataPoints(prev => prev.map(dp => dp.id === draggingPoint.id ? { ...dp, placed: true } : dp))
    } else {
      const correctLabel = CLASS_LABELS[draggingPoint.classIdx]
      // GDD Kasus Salah 1: angka masuk ke kelas yang salah
      triggerError(slotIdx, `💡 Eh, tunggu dulu! Angka ${draggingPoint.val} sudah melewati batas kelas ini. Dia harus masuk ke rumah berikutnya: kelas ${correctLabel}!`)
    }
    setDraggingPoint(null)
  }, [draggingPoint])

  // Mobile tap handlers
  const onTapPoint = (dp: DataPoint) => {
    setSelectedPoint(prev => prev?.id === dp.id ? null : dp)
  }

  const onTapSlot = useCallback((slotIdx: number) => {
    if (!selectedPoint) return
    if (selectedPoint.classIdx === slotIdx) {
      setDataPoints(prev => prev.map(dp => dp.id === selectedPoint.id ? { ...dp, placed: true } : dp))
      setSelectedPoint(null)
    } else {
      const correctLabel = CLASS_LABELS[selectedPoint.classIdx]
      // GDD Kasus Salah 1: angka masuk ke kelas yang salah (tap/klik)
      triggerError(slotIdx, `💡 Periksa lagi batas kelasnya! Angka ${selectedPoint.val} seharusnya masuk ke kelas ${correctLabel}.`)
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

  // ── READ ONLY (reference histogram) ──
  if (readOnly) {
    const maxF = 25
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '160px', gap: '6px', borderLeft: '2px solid rgba(255,255,255,0.15)', borderBottom: '2px solid rgba(255,255,255,0.15)', paddingLeft: '8px', paddingBottom: '4px' }}>
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

  // How many data remain by class
  const remainByClass = CLASS_LABELS.map((_, ci) => dataPoints.filter(dp => !dp.placed && dp.classIdx === ci).length)
  const placedByClass = CLASS_LABELS.map((_, ci) => dataPoints.filter(dp => dp.placed && dp.classIdx === ci))
  const maxPlaced = Math.max(...placedByClass.map(p => p.length), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* FD info bar */}
      {mode === 'FD' && (
        <div style={{
          padding: '10px 14px', borderRadius: '12px', fontSize: '12px', lineHeight: 1.5,
          background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)',
          color: 'rgba(255,255,255,0.75)',
        }}>
          🤖 <strong style={{ color: '#00FF88' }}>DiRA:</strong> Data kelas 1–4 (25 siswa) sudah dimasukkan otomatis sebagai bantuan. Tinggal drag/klik 10 data tersisa ke kelas yang tepat ya! 😉
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px', alignItems: 'stretch' }}>

        {/* LEFT: Data Pool */}
        <div
          className="game-card"
          style={{ flex: 1, padding: '16px 20px', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', minHeight: isMobile ? '160px' : '300px' }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>
            {allPlaced
              ? '✅ SEMUA DATA BERHASIL DIKELOMPOKKAN!'
              : `📍 KOLAM DATA (${activePool.length} data tersisa):`
            }
          </div>
          {mode === 'FD' && (
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
              Sisa per kelas: {CLASS_LABELS.map((l, i) => remainByClass[i] > 0 ? `${l}: ${remainByClass[i]}` : null).filter(Boolean).join(' | ') || '—'}
            </div>
          )}
          <div style={{
            position: 'relative', flex: 1,
            background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.06)',
            borderRadius: '12px', overflow: 'hidden', minHeight: '220px',
          }}>
            <AnimatePresence>
              {activePool.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '13px', color: 'var(--accent)', fontWeight: 700, padding: '20px' }}
                >
                  Hebat! Semua data berhasil masuk ke histogram 🚀<br/>Klik Submit di bawah!
                </motion.div>
              ) : (
                activePool.map(dp => {
                  const pos = SCATTERED_POSITIONS[dp.originalIdx % SCATTERED_POSITIONS.length]
                  const isSelected = selectedPoint?.id === dp.id
                  const classColor = CLASS_COLORS[dp.classIdx] || '#3B82F6'
                  return (
                    <motion.div
                      key={dp.id}
                      layout
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.95 }}
                      draggable
                      onDragStart={() => onDragStart(dp)}
                      onDragEnd={onDragEnd}
                      onClick={() => onTapPoint(dp)}
                      style={{
                        position: 'absolute', top: pos.top, left: pos.left,
                        transform: 'translate(-50%, -50%)',
                        padding: '7px 14px', borderRadius: '50px',
                        background: isSelected
                          ? `linear-gradient(135deg, ${classColor} 0%, #fff 100%)`
                          : `linear-gradient(135deg, ${classColor}cc 0%, ${classColor}88 100%)`,
                        border: isSelected ? '2px solid #fff' : `1px solid ${classColor}66`,
                        color: isSelected ? '#000' : '#fff',
                        fontSize: '13px', fontWeight: 800, cursor: 'grab',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: isSelected ? `0 0 16px ${classColor}` : `0 3px 8px rgba(0,0,0,0.4)`,
                        fontFamily: 'var(--font-data)', touchAction: 'none', zIndex: isSelected ? 10 : 1,
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

        {/* RIGHT: Histogram Canvas */}
        <div
          className="histogram-canvas"
          style={{ flex: 1.3, padding: '20px 16px 12px', minHeight: isMobile ? '220px' : '300px', position: 'relative', display: 'flex', flexDirection: 'column' }}
        >
          {/* Y-axis label */}
          <div style={{ position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontSize: '9px', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px', whiteSpace: 'nowrap' }}>
            FREKUENSI
          </div>

          {/* Bars area */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', flex: 1, paddingLeft: '22px', paddingBottom: '24px' }}>
            {CLASS_LABELS.map((label, i) => {
              const placed = placedByClass[i]
              const isError = flashError === i
              const isTarget = selectedPoint && selectedPoint.classIdx === i
              const barH = maxPlaced > 0 ? (placed.length / maxPlaced) * 100 : 0

              return (
                <motion.div
                  key={i}
                  animate={isError ? { x: [-5, 5, -5, 5, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => onDropSlot(i)}
                  onClick={() => onTapSlot(i)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                    height: '100%', justifyContent: 'flex-end',
                    cursor: selectedPoint ? 'pointer' : 'default',
                    borderRadius: '6px', padding: '2px',
                    background: isError ? 'rgba(239,68,68,0.08)' : isTarget ? `${CLASS_COLORS[i]}08` : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  {/* Stacked data blocks */}
                  <div style={{
                    width: '100%', display: 'flex', flexDirection: 'column-reverse', gap: '2px',
                    alignItems: 'center', paddingBottom: '4px',
                    borderBottom: isError ? '2px solid var(--danger)' : isTarget ? `2px solid ${CLASS_COLORS[i]}` : '2px solid rgba(255,255,255,0.1)',
                    minHeight: isMobile ? '140px' : '200px', justifyContent: 'flex-start',
                  }}>
                    <AnimatePresence>
                      {placed.map((dp) => (
                        <motion.div
                          key={dp.id}
                          initial={{ scale: 0.5, y: -20, opacity: 0 }}
                          animate={{ scale: 1, y: 0, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          style={{
                            width: '100%', height: '22px',
                            background: mode === 'FD' && i === 0
                              ? `linear-gradient(180deg, ${CLASS_COLORS[i]}55 0%, ${CLASS_COLORS[i]}33 100%)`
                              : `linear-gradient(180deg, ${CLASS_COLORS[i]}cc 0%, ${CLASS_COLORS[i]}88 100%)`,
                            border: `1px solid ${CLASS_COLORS[i]}44`,
                            borderRadius: '3px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '9px', fontWeight: 800,
                            color: mode === 'FD' && i === 0 ? 'rgba(255,255,255,0.5)' : '#fff',
                            boxShadow: `0 1px 4px ${CLASS_COLORS[i]}33`,
                          }}
                        >
                          {dp.val}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {/* Empty drop zone */}
                    {placed.length === 0 && (
                      <div style={{
                        width: '100%', height: '28px', borderRadius: '4px',
                        border: isError ? '2px dashed var(--danger)' : isTarget ? `2px dashed ${CLASS_COLORS[i]}` : '1px dashed rgba(255,255,255,0.08)',
                        background: isTarget ? `${CLASS_COLORS[i]}08` : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', color: 'rgba(255,255,255,0.12)', transition: 'all 0.2s',
                      }}>+</div>
                    )}
                    {/* Frequency label */}
                    {placed.length > 0 && (
                      <div style={{ fontSize: '11px', fontWeight: 800, color: CLASS_COLORS[i], marginBottom: '2px' }}>
                        f = {placed.length}
                      </div>
                    )}
                  </div>
                  {/* X-label */}
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px', fontWeight: 700, lineHeight: 1.3, fontFamily: 'var(--font-data)' }}>
                    {label}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* X-axis title */}
          <div style={{ textAlign: 'center', fontSize: '9px', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px', marginTop: '-16px' }}>
            SCREEN TIME (JAM/HARI)
          </div>
        </div>
      </div>

      {/* Hint toast */}
      <AnimatePresence>
        {flashHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              padding: '12px 16px', borderRadius: '12px', fontSize: '13px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              color: 'rgba(255,255,255,0.85)', lineHeight: 1.5,
            }}
          >
            {flashHint}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        className="game-btn game-btn-primary"
        onClick={handleSubmit}
        disabled={!allPlaced || submitted}
        style={{ width: '100%', opacity: allPlaced && !submitted ? 1 : 0.5, cursor: allPlaced && !submitted ? 'pointer' : 'not-allowed', boxShadow: allPlaced ? 'var(--accent-glow)' : 'none' }}
      >
        {submitted ? '✅ Histogram Tersubmit!' : allPlaced ? 'Submit Histogram →' : `Kelompokkan semua data (${activePool.length} data lagi)`}
      </button>
    </div>
  )
}

// Re-export for readOnly histogram reference
const CORRECT_TABLE = [
  { kelas: '1 – 4',   f: 25 },
  { kelas: '5 – 8',   f: 8  },
  { kelas: '9 – 12',  f: 1  },
  { kelas: '13 – 16', f: 1  },
]
