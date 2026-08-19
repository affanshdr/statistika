'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { screenTimeData, STATS } from '@/app/siswa/game/_data/level1'

const CHIP_COLOR = '#6366F1'

const CORRECT_MIN = Math.min(...screenTimeData) // 1
const CORRECT_MAX = Math.max(...screenTimeData) // 18

// Unique values only, shuffled once at module load
const UNIQUE_VALS: number[] = (Array.from(new Set(screenTimeData)) as number[]).sort(() => Math.random() - 0.5)

interface Chip {
  id: string
  val: number
  placed: 'min' | 'max' | null
}

interface PregameMinMaxDropProps {
  onComplete?: (isCorrect: boolean) => void
}

// ── Reading material ──────────────────────────────────────────────────────────
function ReadingCard({ minVal, maxVal, onNext }: { minVal: number; maxVal: number; onNext: () => void }) {
  const range = maxVal - minVal
  const kUsed = 5
  const width = Math.ceil(range / kUsed)
  const rows = [
    { kelas: '1 – 4',   tb: '0,5',  ta: '4,5',  f: 13 },
    { kelas: '5 – 8',   tb: '4,5',  ta: '8,5',  f: 12 },
    { kelas: '9 – 12',  tb: '8,5',  ta: '12,5', f: 4  },
    { kelas: '13 – 16', tb: '12,5', ta: '16,5', f: 4  },
    { kelas: '17 – 20', tb: '16,5', ta: '20,5', f: 2  },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}
    >
      {/* Congrats */}
      <div style={{
        background: 'linear-gradient(135deg, #10B98120 0%, #6366F120 100%)',
        border: '1px solid #10B98144', borderRadius: '12px',
        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0,
      }}>
        <span style={{ fontSize: '22px' }}>🎉</span>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#00ADB5' }}>
            Tepat! Nilai terkecil = {minVal}, Nilai terbesar = {maxVal}
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
            Sekarang kita gunakan keduanya untuk membuat tabel distribusi frekuensi!
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{
        background: 'rgba(14, 131, 136, 0.05)', border: '1px solid rgba(14, 131, 136, 0.15)',
        borderRadius: '12px', padding: '12px 14px', flexShrink: 0,
        display: 'flex', flexDirection: 'column', gap: '8px',
      }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '1px', textTransform: 'uppercase' }}>
          📖 Cara Membuat Tabel Distribusi Frekuensi
        </div>
        {[
          { label: 'Rentang (R)', formula: '= Data terbesar − Data terkecil', calc: `= ${maxVal} − ${minVal} = ${range}` },
          { label: 'Banyak Kelas (k)', formula: '= 1 + 3,3 × log n', calc: `= 1 + 3,3 × log ${STATS.n} = 1 + 3,3 × 1,54 ≈ 6 → dibulatkan ${kUsed} kelas` },
          { label: 'Panjang Kelas (p)', formula: '= Rentang ÷ Banyak Kelas', calc: `= ${range} ÷ ${kUsed} = ${(range / kUsed).toFixed(1)} → dibulatkan ${width}` },
          { label: 'Tepi Kelas', formula: 'Tepi bawah = Batas bawah − 0,5', calc: 'Tepi atas  = Batas atas + 0,5' },
        ].map((step, i, arr) => (
          <div key={i} style={{
            display: 'flex', gap: '10px', alignItems: 'flex-start',
            borderBottom: i < arr.length - 1 ? '1px solid rgba(14, 131, 136, 0.12)' : 'none',
            paddingBottom: i < arr.length - 1 ? '8px' : 0,
          }}>
            <div style={{
              flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%',
              background: `${CHIP_COLOR}33`, border: `1px solid ${CHIP_COLOR}66`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 900, color: '#00ADB5',
            }}>{i + 1}</div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#00ADB5', marginBottom: '2px' }}>{step.label}</div>
              <div style={{ fontSize: '10px', color: '#94A3B8', lineHeight: 1.5 }}>{step.formula}</div>
              <div style={{ fontSize: '10px', color: '#E2E8F0', fontWeight: 700, lineHeight: 1.5, fontFamily: 'var(--font-data)' }}>{step.calc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(14, 131, 136, 0.04)', border: '1px solid rgba(14, 131, 136, 0.15)', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ padding: '8px 12px', fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid rgba(14, 131, 136, 0.12)' }}>
          📊 Tabel Distribusi Frekuensi
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: `${CHIP_COLOR}18` }}>
              {['Kelas Interval', 'Tepi Bawah', 'Tepi Atas', 'Frekuensi (f)'].map(h => (
                <th key={h} style={{ padding: '6px 8px', fontSize: '9px', fontWeight: 800, color: '#00ADB5', textAlign: 'center', letterSpacing: '0.3px', borderBottom: '1px solid rgba(14, 131, 136, 0.15)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(14, 131, 136, 0.08)' }}>
                <td style={{ padding: '5px 8px', fontSize: '10px', fontWeight: 700, color: '#F8FAFC', textAlign: 'center', fontFamily: 'var(--font-data)' }}>{row.kelas}</td>
                <td style={{ padding: '5px 8px', fontSize: '10px', color: '#94A3B8', textAlign: 'center', fontFamily: 'var(--font-data)' }}>{row.tb}</td>
                <td style={{ padding: '5px 8px', fontSize: '10px', color: '#94A3B8', textAlign: 'center', fontFamily: 'var(--font-data)' }}>{row.ta}</td>
                <td style={{ padding: '5px 8px', fontSize: '11px', fontWeight: 900, color: '#00ADB5', textAlign: 'center', fontFamily: 'var(--font-data)' }}>{row.f}</td>
              </tr>
            ))}
            <tr style={{ background: `${CHIP_COLOR}0f` }}>
              <td colSpan={3} style={{ padding: '5px 8px', fontSize: '10px', fontWeight: 800, color: '#00ADB5', textAlign: 'right' }}>Total</td>
              <td style={{ padding: '5px 8px', fontSize: '11px', fontWeight: 900, color: '#00ADB5', textAlign: 'center', fontFamily: 'var(--font-data)' }}>{rows.reduce((s, r) => s + r.f, 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button
        className="game-btn game-btn-primary"
        onClick={onNext}
        style={{ flexShrink: 0, width: '100%', padding: '10px 20px', fontSize: '13px', boxShadow: 'var(--accent-glow)' }}
      >
        Siap! Mulai Lengkapi Histogram →
      </button>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PregameMinMaxDrop({ onComplete }: PregameMinMaxDropProps) {
  const [chips, setChips] = useState<Chip[]>(() =>
    UNIQUE_VALS.map((val, idx) => ({ id: `chip-${idx}`, val, placed: null }))
  )
  const [selectedChip, setSelectedChip] = useState<Chip | null>(null)
  const [draggingId, setDraggingId]     = useState<string | null>(null)
  const [flashError, setFlashError]     = useState<'min' | 'max' | null>(null)
  const [flashHint, setFlashHint]       = useState<string | null>(null)
  const [submitted, setSubmitted]       = useState(false)
  const [showReading, setShowReading]   = useState(false)

  // Key map: incrementing a chip's key forces it to remount at its original flex
  // position (drag offset is reset). Used when drag ends without a valid placement.
  const [resetKeys, setResetKeys] = useState<Record<string, number>>({})

  const resetChipPos = useCallback((chipId: string) => {
    setResetKeys(prev => ({ ...prev, [chipId]: (prev[chipId] ?? 0) + 1 }))
  }, [])

  const triggerError = useCallback((slot: 'min' | 'max', hint: string) => {
    setFlashError(slot)
    setFlashHint(hint)
    setTimeout(() => { setFlashError(null); setFlashHint(null) }, 2500)
  }, [])

  // Returns true if placement was made (correct value), false otherwise
  const placeChipInSlot = useCallback((chip: Chip, slot: 'min' | 'max'): boolean => {
    const isCorrect =
      (slot === 'min' && chip.val === CORRECT_MIN) ||
      (slot === 'max' && chip.val === CORRECT_MAX)

    if (!isCorrect) {
      triggerError(slot, `💡 Angka ${chip.val} bukan nilai ${slot === 'min' ? 'terendah' : 'tertinggi'}. Coba lagi!`)
      return false
    }

    setChips(prev => prev.map(c => {
      if (c.id === chip.id) return { ...c, placed: slot }
      if (c.placed === slot) return { ...c, placed: null }
      return c
    }))
    setSelectedChip(null)
    return true
  }, [triggerError])

  const handleDragStart = useCallback((chip: Chip) => () => {
    setSelectedChip(null)
    setDraggingId(chip.id)
  }, [])

  const handleDragEnd = useCallback((chip: Chip) => (
    event: MouseEvent | TouchEvent | PointerEvent,
    _info: PanInfo,
  ) => {
    // Extract coordinates BEFORE hiding the dragged element
    let clientX: number, clientY: number
    if ('changedTouches' in event && event.changedTouches.length > 0) {
      clientX = event.changedTouches[0].clientX
      clientY = event.changedTouches[0].clientY
    } else {
      clientX = (event as MouseEvent | PointerEvent).clientX
      clientY = (event as MouseEvent | PointerEvent).clientY
    }

    // Temporarily hide chip so elementFromPoint sees what's beneath
    const dragEl = document.getElementById(chip.id)
    const savedPE = dragEl?.style.pointerEvents ?? ''
    if (dragEl) dragEl.style.pointerEvents = 'none'
    const elem = document.elementFromPoint(clientX, clientY)
    if (dragEl) dragEl.style.pointerEvents = savedPE

    let placed = false
    if (elem) {
      const slotEl = elem.closest('[data-minmax-slot]')
      if (slotEl) {
        const slot = slotEl.getAttribute('data-minmax-slot') as 'min' | 'max'
        placed = placeChipInSlot(chip, slot)
      }
    }

    // If not correctly placed, force-remount the chip to snap it back to
    // its original flex position (avoids chip floating at wrong location)
    if (!placed) {
      resetChipPos(chip.id)
    }

    // Clear dragging state AFTER all placement logic so overflow stays
    // visible during the entire gesture (prevents mid-animation clipping)
    setDraggingId(null)
  }, [placeChipInSlot, resetChipPos])

  const onTapChip = (chip: Chip) => {
    if (draggingId) return
    setSelectedChip(prev => prev?.id === chip.id ? null : chip)
  }

  const onTapSlot = (slot: 'min' | 'max') => {
    if (!selectedChip) return
    placeChipInSlot(selectedChip, slot)
  }

  const handleSubmit = () => {
    const minChip = chips.find(c => c.placed === 'min')
    const maxChip = chips.find(c => c.placed === 'max')
    if (!minChip || !maxChip) return
    const correct = minChip.val === CORRECT_MIN && maxChip.val === CORRECT_MAX
    setSubmitted(true)
    if (correct) {
      setShowReading(true)
    } else {
      onComplete?.(false)
    }
  }

  const minChip    = chips.find(c => c.placed === 'min')
  const maxChip    = chips.find(c => c.placed === 'max')
  const activePool = chips.filter(c => c.placed === null)
  const bothPlaced = !!minChip && !!maxChip
  const isDraggingAny = !!draggingId

  if (showReading) {
    return <ReadingCard minVal={CORRECT_MIN} maxVal={CORRECT_MAX} onNext={() => onComplete?.(true)} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: 0 }}>

      {/* Workspace */}
      <div style={{
        display: 'flex', flexDirection: 'row',
        flex: 1, minHeight: 0,
        borderRadius: '14px',
        background: 'rgba(14, 131, 136, 0.04)',
        border: '1px solid rgba(14, 131, 136, 0.15)',
        // Keep overflow visible during drag so chip is never clipped mid-gesture
        overflow: isDraggingAny ? 'visible' : 'hidden',
      }}>

        {/* LEFT: Chip pool */}
        <div style={{
          flex: '0 0 55%',
          display: 'flex', flexDirection: 'column',
          padding: '8px 10px 6px',
          borderRight: '1px solid rgba(14, 131, 136, 0.1)',
          // Must also be visible during drag — otherwise chip is clipped
          // as it crosses the panel boundary toward the drop zone.
          overflow: isDraggingAny ? 'visible' : 'hidden',
        }}>
          <div style={{
            fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase',
            color: activePool.length === 0 ? '#00ADB5' : '#94A3B8',
            transition: 'color 0.3s', marginBottom: '6px', flexShrink: 0,
          }}>
            {activePool.length === 0 ? '✅ Kedua nilai ditemukan!' : `📍 Data (nilai unik) — ketuk atau seret`}
          </div>

          {/* Flex-wrap chip grid — no absolute positioning, works in any viewport */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '5px',
            alignContent: 'flex-start', flex: 1, minHeight: 0,
            // Keep overflow visible during drag; otherwise clip scrollable content
            overflow: isDraggingAny ? 'visible' : 'auto',
            padding: '2px 0',
          }}>
            <AnimatePresence>
              {activePool.length === 0 ? (
                <motion.div
                  key="empty-pool"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: '4px', textAlign: 'center',
                    fontSize: '11px', color: '#00ADB5', fontWeight: 700,
                    flex: '1 1 100%', minHeight: '60px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>🎯</span>
                  Siap untuk dikonfirmasi!
                </motion.div>
              ) : (
                activePool.map(chip => {
                  const isSelected     = selectedChip?.id === chip.id
                  const isThisDragging = draggingId === chip.id
                  // Incrementing the key forces Framer Motion to remount the element,
                  // which resets its internal drag offset back to (0,0).
                  const chipKey = `${chip.id}-${resetKeys[chip.id] ?? 0}`

                  return (
                    <motion.div
                      key={chipKey}
                      id={chip.id}
                      // ─── NO dragSnapToOrigin ───
                      // dragSnapToOrigin would try to animate the chip back to its
                      // origin while AnimatePresence simultaneously runs the exit
                      // animation → chip appears to vanish mid-air. Instead we use
                      // the resetKeys trick to force-remount incorrectly-placed chips.
                      drag
                      dragMomentum={false}
                      dragElastic={0.08}
                      onDragStart={handleDragStart(chip)}
                      onDragEnd={handleDragEnd(chip)}
                      onClick={() => onTapChip(chip)}
                      layout
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0, transition: { duration: 0.1 } }}
                      whileHover={!isDraggingAny ? { scale: 1.12, y: -1 } : {}}
                      whileDrag={{
                        scale: 1.3, rotate: 3, zIndex: 9999, cursor: 'grabbing',
                        boxShadow: `0 14px 36px ${CHIP_COLOR}66, 0 0 0 2px ${CHIP_COLOR}`,
                        opacity: 0.97,
                      }}
                      style={{
                        padding: '5px 11px', borderRadius: '50px',
                        background: isSelected
                          ? `linear-gradient(135deg, ${CHIP_COLOR} 0%, #fff 130%)`
                          : `linear-gradient(135deg, ${CHIP_COLOR}dd 0%, ${CHIP_COLOR}88 100%)`,
                        border: isSelected ? '2px solid #fff' : `1.5px solid ${CHIP_COLOR}66`,
                        color: isSelected ? '#000' : '#fff',
                        fontSize: '11px', fontWeight: 800,
                        cursor: 'grab', userSelect: 'none', touchAction: 'none',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: isThisDragging ? 1000 : isSelected ? 50 : 1,
                        boxShadow: isSelected
                          ? `0 0 14px ${CHIP_COLOR}`
                          : `0 2px 8px rgba(0,0,0,0.5), 0 0 4px ${CHIP_COLOR}44`,
                        fontFamily: 'var(--font-data)',
                        whiteSpace: 'nowrap', flexShrink: 0,
                        transition: 'box-shadow 0.15s, background 0.15s, border 0.15s',
                        minWidth: '30px', textAlign: 'center',
                      }}
                    >
                      {chip.val}
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: Drop zones */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: '8px 10px 6px', gap: '8px', justifyContent: 'center',
        }}>
          <div style={{
            fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px',
            color: '#A8A29E', textTransform: 'uppercase',
          }}>
            🎯 Seret ke sini
          </div>

          {(['min', 'max'] as const).map(slot => {
            const slotChip  = slot === 'min' ? minChip : maxChip
            const isError   = flashError === slot
            const isTarget  = !!selectedChip
            const slotLabel = slot === 'min' ? '📉 Nilai Terendah' : '📈 Nilai Tertinggi'

            return (
              <motion.div
                key={slot}
                data-minmax-slot={slot}
                animate={isError ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.35 }}
                onClick={() => onTapSlot(slot)}
                style={{
                  flex: 1, minHeight: 0, borderRadius: '12px',
                  border: isError
                    ? '2px dashed #EF4444'
                    : slotChip
                      ? `2px solid ${CHIP_COLOR}99`
                      : isTarget ? `2px dashed ${CHIP_COLOR}88` : '2px dashed rgba(14, 131, 136, 0.3)',
                  background: isError
                    ? 'rgba(239,68,68,0.08)'
                    : slotChip ? `${CHIP_COLOR}18` : isTarget ? `${CHIP_COLOR}06` : 'rgba(14, 131, 136, 0.02)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '4px',
                  cursor: selectedChip ? 'pointer' : 'default',
                  transition: 'all 0.2s', position: 'relative', padding: '8px',
                }}
              >
                <div style={{
                  fontSize: '9px', fontWeight: 800,
                  color: slotChip ? '#00ADB5' : '#94A3B8',
                  letterSpacing: '0.5px',
                }}>
                  {slotLabel}
                </div>

                <AnimatePresence mode="wait">
                  {slotChip ? (
                    <motion.div
                      key={slotChip.id + '-placed'}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                      style={{
                        padding: '6px 18px', borderRadius: '50px',
                        background: `linear-gradient(135deg, ${CHIP_COLOR}dd 0%, ${CHIP_COLOR}88 100%)`,
                        border: `2px solid ${CHIP_COLOR}99`,
                        color: '#000000', fontSize: '16px', fontWeight: 900,
                        fontFamily: 'var(--font-data)',
                        boxShadow: `0 0 14px ${CHIP_COLOR}44`,
                      }}
                    >
                      {slotChip.val}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty-slot"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ fontSize: '18px', opacity: 0.18 }}
                    >
                      ?
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Error hint toast */}
      <AnimatePresence>
        {flashHint && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            style={{
              flexShrink: 0, padding: '6px 12px', borderRadius: '10px', fontSize: '11px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#E2E8F0', lineHeight: 1.4,
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
        disabled={!bothPlaced || submitted}
        style={{
          flexShrink: 0, width: '100%', padding: '8px 20px', fontSize: '12px',
          opacity: bothPlaced && !submitted ? 1 : 0.45,
          cursor: bothPlaced && !submitted ? 'pointer' : 'not-allowed',
          boxShadow: bothPlaced && !submitted ? 'var(--accent-glow)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        {submitted ? '⏳ Memeriksa...' : bothPlaced ? 'Konfirmasi Jawaban →' : 'Ketuk atau seret nilai min & max ke kotak'}
      </button>
    </div>
  )
}
