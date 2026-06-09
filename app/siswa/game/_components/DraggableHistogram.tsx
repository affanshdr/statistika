'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HISTOGRAM_BARS } from '../_data/level1'

type Bar = typeof HISTOGRAM_BARS[number] & { placed?: boolean }

type Mode = 'FI' | 'FD'

interface DraggableHistogramProps {
  mode: Mode
  onSubmit: (isCorrect: boolean) => void
}

// FD: pre-placed first 3 bars (indices 0,1,2), need to place 3,4,5
const FD_PREPLACED = new Set([0, 1, 2])

export default function DraggableHistogram({ mode, onSubmit }: DraggableHistogramProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Slots: 6 histogram positions
  const [slots, setSlots] = useState<(Bar | null)[]>(() => {
    if (mode === 'FD') {
      return HISTOGRAM_BARS.map((bar, i) => FD_PREPLACED.has(i) ? bar : null)
    }
    return Array(6).fill(null)
  })

  // Pool of draggable bars
  const [pool, setPool] = useState<Bar[]>(() => {
    if (mode === 'FD') return HISTOGRAM_BARS.filter((_, i) => !FD_PREPLACED.has(i))
    return [...HISTOGRAM_BARS]
  })

  const [dragging, setDragging] = useState<Bar | null>(null)
  const [slotStates, setSlotStates] = useState<Record<number, 'idle' | 'correct' | 'wrong'>>({})
  const [selectedFromPool, setSelectedFromPool] = useState<Bar | null>(null) // mobile
  const [submitted, setSubmitted] = useState(false)
  const dragOver = useRef<number | null>(null)

  // ── DRAG HANDLERS (desktop) ──
  const onDragStart = (bar: Bar) => setDragging(bar)
  const onDragEnd = () => { setDragging(null); dragOver.current = null }
  const onDragOverSlot = (slotIdx: number) => { dragOver.current = slotIdx }

  const onDropSlot = useCallback((slotIdx: number) => {
    if (!dragging) return
    const existingInSlot = slots[slotIdx]
    const sourceFromPool = pool.find(b => b.label === dragging.label)

    // Place in slot
    const newSlots = [...slots]
    newSlots[slotIdx] = dragging

    // If slot already had something, return it to pool
    const newPool = pool.filter(b => b.label !== dragging.label)
    if (existingInSlot && mode !== 'FD' && !FD_PREPLACED.has(slotIdx)) {
      newPool.push(existingInSlot)
    }

    setSlots(newSlots)
    setPool(newPool)
    setDragging(null)

    // Check if placed correctly
    const correctBar = HISTOGRAM_BARS[slotIdx]
    const isCorrect = correctBar.label === dragging.label
    setSlotStates(prev => ({ ...prev, [slotIdx]: isCorrect ? 'correct' : 'wrong' }))
    setTimeout(() => {
      setSlotStates(prev => { const n = {...prev}; if (!isCorrect) delete n[slotIdx]; return n })
      if (!isCorrect) {
        // Return to pool if wrong
        setSlots(prev => { const n = [...prev]; n[slotIdx] = existingInSlot; return n })
        if (sourceFromPool) setPool(prev => [...prev, dragging!])
      }
    }, 600)
  }, [dragging, slots, pool, mode])

  // ── TAP HANDLERS (mobile) ──
  const onTapPool = (bar: Bar) => {
    if (selectedFromPool?.label === bar.label) { setSelectedFromPool(null); return }
    setSelectedFromPool(bar)
  }

  const onTapSlot = useCallback((slotIdx: number) => {
    if (!selectedFromPool) return
    const existingInSlot = slots[slotIdx]
    if (mode === 'FD' && FD_PREPLACED.has(slotIdx)) return

    const newSlots = [...slots]
    newSlots[slotIdx] = selectedFromPool
    const newPool = pool.filter(b => b.label !== selectedFromPool.label)
    if (existingInSlot) newPool.push(existingInSlot)

    setSlots(newSlots)
    setPool(newPool)
    setSelectedFromPool(null)

    const isCorrect = HISTOGRAM_BARS[slotIdx].label === selectedFromPool.label
    setSlotStates(prev => ({ ...prev, [slotIdx]: isCorrect ? 'correct' : 'wrong' }))
    setTimeout(() => {
      setSlotStates(prev => { const n = {...prev}; if (!isCorrect) delete n[slotIdx]; return n })
      if (!isCorrect) {
        setSlots(prev => { const n = [...prev]; n[slotIdx] = existingInSlot; return n })
        setPool(prev => [...prev, selectedFromPool])
      }
    }, 600)
  }, [selectedFromPool, slots, pool, mode])

  const handleSubmit = () => {
    if (slots.some(s => s === null)) return
    const isCorrect = slots.every((bar, i) => bar?.label === HISTOGRAM_BARS[i].label)
    setSubmitted(true)
    onSubmit(isCorrect)
  }

  const allFilled = slots.every(s => s !== null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Histogram canvas */}
      <div className="histogram-canvas" style={{ padding: '24px 24px 8px', height: '280px', position: 'relative' }}>
        {/* Y axis label */}
        <div style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%) rotate(-90deg)',
          fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px',
          whiteSpace: 'nowrap'
        }}>FREKUENSI</div>

        {/* Bars area */}
        <div style={{ 
          display: 'flex', gap: '6px', alignItems: 'flex-end', 
          height: '100%', paddingLeft: '32px', paddingBottom: '32px'
        }}>
          {slots.map((bar, i) => {
            const isPreplaced = mode === 'FD' && FD_PREPLACED.has(i)
            const state = slotStates[i]
            const barHeight = bar ? `${bar.heightPct}%` : '0%'
            const correctBar = HISTOGRAM_BARS[i]

            return (
              <div
                key={i}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}
                onDragOver={e => { e.preventDefault(); onDragOverSlot(i) }}
                onDrop={() => onDropSlot(i)}
                onClick={() => !isPreplaced && onTapSlot(i)}
              >
                <AnimatePresence>
                  {bar ? (
                    <motion.div
                      key={bar.label}
                      className={`histogram-bar bar-animate ${
                        state === 'correct' ? 'placed-correct' : 
                        state === 'wrong' ? 'placed-wrong' : ''
                      }`}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      style={{
                        width: '100%',
                        height: barHeight,
                        background: isPreplaced 
                          ? 'linear-gradient(180deg, rgba(0,255,136,0.6) 0%, rgba(0,255,136,0.3) 100%)'
                          : state === 'correct'
                            ? 'linear-gradient(180deg, #00FF88 0%, rgba(0,255,136,0.6) 100%)'
                            : 'linear-gradient(180deg, #3B82F6 0%, rgba(59,130,246,0.5) 100%)',
                        transformOrigin: 'bottom',
                        position: 'relative',
                        borderRadius: '4px 4px 0 0',
                        cursor: isPreplaced ? 'default' : 'pointer',
                      }}
                      draggable={!isPreplaced}
                      onDragStart={() => !isPreplaced && onDragStart(bar)}
                      onDragEnd={onDragEnd}
                    >
                      {/* Frequency value on bar */}
                      <div style={{ 
                        position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)',
                        fontSize: '11px', fontWeight: 700, color: '#00FF88',
                        fontFamily: 'var(--font-data)'
                      }}>
                        {bar.f}
                      </div>
                    </motion.div>
                  ) : (
                    <div style={{
                      width: '100%', height: '50%', minHeight: '40px',
                      border: '2px dashed rgba(0,255,136,0.2)',
                      borderRadius: '4px 4px 0 0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(0,255,136,0.3)', fontSize: '18px',
                      cursor: 'pointer',
                      background: selectedFromPool ? 'rgba(0,255,136,0.05)' : 'transparent',
                      transition: 'all 0.2s'
                    }}>
                      +
                    </div>
                  )}
                </AnimatePresence>

                {/* X-axis label */}
                <div style={{ 
                  fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center',
                  fontFamily: 'var(--font-data)', marginTop: '4px', lineHeight: 1.3
                }}>
                  {correctBar.label.replace('–', '–\n')}
                </div>
              </div>
            )
          })}
        </div>

        {/* X axis label */}
        <div style={{ 
          textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', 
          fontWeight: 700, letterSpacing: '1px', marginTop: '-20px'
        }}>
          KELAS INTERVAL (JUMLAH SHARE)
        </div>
      </div>

      {/* Pool */}
      {pool.length > 0 && (
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700 }}>
            BATANG TERSEDIA — {isMobile ? 'TAP untuk pilih, lalu tap slot' : 'DRAG ke histogram'}:
          </div>
          <div className="histogram-pool">
            {pool.map(bar => (
              <motion.div
                key={bar.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                draggable
                onDragStart={() => onDragStart(bar)}
                onDragEnd={onDragEnd}
                onClick={() => onTapPool(bar)}
                style={{
                  background: selectedFromPool?.label === bar.label
                    ? 'linear-gradient(180deg, #00FF88 0%, rgba(0,255,136,0.5) 100%)'
                    : 'linear-gradient(180deg, #3B82F6 0%, rgba(59,130,246,0.4) 100%)',
                  width: '48px',
                  height: `${Math.max(30, (bar.heightPct / 100) * 80)}px`,
                  borderRadius: '4px 4px 0 0',
                  cursor: 'grab',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                  paddingTop: '4px',
                  border: selectedFromPool?.label === bar.label ? '2px solid #00FF88' : '1px solid transparent',
                  boxShadow: selectedFromPool?.label === bar.label ? '0 0 12px rgba(0,255,136,0.5)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-data)' }}>
                  {bar.f}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      {!submitted && (
        <button
          className="game-btn game-btn-primary"
          onClick={handleSubmit}
          disabled={!allFilled}
          style={{ width: '100%', opacity: allFilled ? 1 : 0.5 }}
        >
          {allFilled ? 'Submit Histogram →' : `Isi ${slots.filter(s => s === null).length} slot lagi`}
        </button>
      )}
    </div>
  )
}
