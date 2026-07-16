'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'
import DiRA from './DiRA'

interface IntervalKelasPhaseProps {
  isFD: boolean
  teamId?: string | null
  studentId?: string
  studentName?: string
  onSubmit: () => void
  hasVotedInterval?: boolean
  teamMembers?: { id: string; name: string }[]
  teamReadyVotes?: Record<string, string[]>
  demoMode?: boolean
  levelId?: number
}

interface PoolItem {
  id: string
  val: number
}

export default function IntervalKelasPhase({
  isFD,
  teamId = null,
  studentId,
  studentName,
  onSubmit,
  hasVotedInterval = false,
  teamMembers = [],
  teamReadyVotes = {},
  demoMode = false,
  levelId = 1
}: IntervalKelasPhaseProps) {
  const { setAnswer, addXP, incrementMistake } = useGameStore()

  // Define components dynamically based on levelId
  const CLASSES = levelId === 2
    ? [
        { label: '2-4', tb: 1.5, ta: 4.5, color: '#3B82F6' },
        { label: '5-7', tb: 4.5, ta: 7.5, color: '#10B981' },
        { label: '8-10', tb: 7.5, ta: 10.5, color: '#F59E0B' },
        { label: '11-13', tb: 10.5, ta: 13.5, color: '#EF4444' },
        { label: '14-16', tb: 13.5, ta: 16.5, color: '#EC4899' }
      ]
    : [
        { label: '1-3', tb: 0.5, ta: 3.5, color: '#3B82F6' },
        { label: '4-6', tb: 3.5, ta: 6.5, color: '#10B981' },
        { label: '7-9', tb: 6.5, ta: 9.5, color: '#F59E0B' },
        { label: '10-12', tb: 9.5, ta: 12.5, color: '#EF4444' },
        { label: '13-15', tb: 12.5, ta: 15.5, color: '#EC4899' },
        { label: '16-18', tb: 15.5, ta: 18.5, color: '#8B5CF6' }
      ]

  const CORRECT_VALUES = levelId === 2
    ? [1.5, 4.5, 4.5, 7.5, 7.5, 10.5, 10.5, 13.5, 13.5, 16.5]
    : [0.5, 3.5, 3.5, 6.5, 6.5, 9.5, 9.5, 12.5, 12.5, 15.5, 15.5, 18.5]

  const CORRECT_POOL = levelId === 2
    ? [1.5, 4.5, 4.5, 7.5, 7.5, 10.5, 10.5, 13.5, 13.5, 16.5]
    : [0.5, 3.5, 3.5, 6.5, 6.5, 9.5, 9.5, 12.5, 12.5, 15.5, 15.5, 18.5]

  const DISTRACTORS = levelId === 2
    ? [2.0, 5.0, 8.0, 11.0, 14.0]
    : [1.0, 4.0, 7.0, 10.0, 13.0, 16.0]
  
  // Game state
  const [stage, setStage] = useState<1 | 2>(demoMode ? 2 : 1)
  const [isOpened, setIsOpened] = useState(demoMode ? true : false)
  const [animationFinished, setAnimationFinished] = useState(demoMode ? true : false)
  const [showDiraExpl, setShowDiraExpl] = useState(false)
  const [diraExplMessage, setDiraExplMessage] = useState('')

  // Drag and drop states
  const [pool, setPool] = useState<PoolItem[]>([])
  const [filledSlots, setFilledSlots] = useState<(number | null)[]>(() =>
    levelId === 2
      ? [1.5, 4.5, 4.5, 7.5, 7.5, 10.5, null, null, null, null]
      : [0.5, 3.5, 3.5, 6.5, 6.5, 9.5, null, null, null, null, null, null]
  )
  const [shakeSlotIdx, setShakeSlotIdx] = useState<number | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  // Shuffle correct values and distractors for the pool
  useEffect(() => {
    let initialItems: PoolItem[] = [
      ...CORRECT_POOL.map((v, i) => ({ id: `correct-${i}-${v}`, val: v })),
      ...DISTRACTORS.map((v, i) => ({ id: `distractor-${i}-${v}`, val: v }))
    ]
    const prefilled = levelId === 2
      ? [1.5, 4.5, 4.5, 7.5, 7.5, 10.5]
      : [0.5, 3.5, 3.5, 6.5, 6.5, 9.5]
    prefilled.forEach(val => {
      const idx = initialItems.findIndex(item => item.val === val)
      if (idx !== -1) {
        initialItems.splice(idx, 1)
      }
    })
    // Simple shuffle
    const shuffled = [...initialItems].sort(() => Math.random() - 0.5)
    setPool(shuffled)
  }, [levelId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle stage 1 separation click
  const handleSeparateClasses = () => {
    setIsOpened(true)
    setTimeout(() => {
      setAnimationFinished(true)
      setDiraExplMessage(
        'Karena datanya bilangan bulat (diskrit), kita perlu memberi jarak 0.5 di setiap batas kelas agar saat digambar nanti, batang histogram-nya saling menempel (kontinu) tanpa celah kosong! 😉'
      )
      setShowDiraExpl(true)
    }, 900) // matches transition duration
  }

  // Toast triggers
  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    const t = setTimeout(() => setToastMsg(null), 3000)
    return () => clearTimeout(t)
  }

  // Framer motion drag event handlers
  const handleDragStart = (id: string) => () => {
    setDraggingId(id)
  }

  const handleDragEnd = useCallback((item: PoolItem) => (
    event: MouseEvent | TouchEvent | PointerEvent,
    _info: PanInfo
  ) => {
    setDraggingId(null)

    // Viewport coordinates
    let clientX: number, clientY: number
    if ('changedTouches' in event && event.changedTouches && event.changedTouches.length > 0) {
      clientX = event.changedTouches[0].clientX
      clientY = event.changedTouches[0].clientY
    } else {
      clientX = (event as MouseEvent | PointerEvent).clientX
      clientY = (event as MouseEvent | PointerEvent).clientY
    }

    // Hide item temp
    const dragEl = document.getElementById(item.id)
    const savedPE = dragEl?.style.pointerEvents ?? ''
    if (dragEl) dragEl.style.pointerEvents = 'none'

    const elem = document.elementFromPoint(clientX, clientY)
    if (dragEl) dragEl.style.pointerEvents = savedPE

    if (elem) {
      const slotEl = elem.closest('[data-slot-idx]')
      if (slotEl) {
        const slotIdx = parseInt(slotEl.getAttribute('data-slot-idx') ?? '-1', 10)
        if (slotIdx !== -1) {
          const expectedVal = CORRECT_VALUES[slotIdx]
          
          if (item.val === expectedVal) {
            // Correct placement!
            setFilledSlots(prev => {
              const next = [...prev]
              next[slotIdx] = item.val
              return next
            })
            // Remove from pool
            setPool(prev => prev.filter(p => p.id !== item.id))
          } else {
            // Wrong placement!
            setShakeSlotIdx(slotIdx)
            setTimeout(() => setShakeSlotIdx(null), 500)
            incrementMistake()
            triggerToast(
              DISTRACTORS.includes(item.val) 
                ? 'Coba cek lagi, apakah ini sudah dikurangi/ditambah 0.5? Ingat batas kelas harus kontinu!'
                : 'Coba re-check, letak tepi bawah/atas di slot ini kurang tepat.'
            )
          }
        }
      }
    }
  }, [incrementMistake, CORRECT_VALUES, DISTRACTORS])

  // Completed check
  const allCorrect = filledSlots.every((val, idx) => val === CORRECT_VALUES[idx])

  const handleFinish = () => {
    if (!allCorrect) return

    // Build the final array of 6 objects
    const finalIntervals = CLASSES.map((c, idx) => ({
      kelasInterval: c.label,
      tepiBawah: CORRECT_VALUES[idx * 2],
      tepiAtas: CORRECT_VALUES[idx * 2 + 1]
    }))

    // Save under zustand answers
    setAnswer('intervalKelas', finalIntervals)
    addXP(20, 'Menyusun tepi interval kelas dengan benar', 0)
    onSubmit()
  }

  const countCorrect = filledSlots.filter((v, i) => v === CORRECT_VALUES[i]).length

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0, minWidth: 0, position: 'relative', width: '100%' }}>
      
      {/* Title block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📐 Menyusun Interval Kelas
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Level 1 — Video Viral Investigation
          </p>
        </div>

        {/* Progress Bar "SUSUN BATAS KELAS" */}
        {stage === 2 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 12px',
            background: 'rgba(14, 131, 136, 0.04)',
            border: '1px solid rgba(14, 131, 136, 0.15)',
            borderRadius: '10px',
            width: '260px'
          }}>
            <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '1px', color: 'var(--accent)' }}>SUSUN BATAS KELAS</div>
            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(countCorrect / 12) * 100}%`, background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', width: '32px', textAlign: 'right', fontFamily: 'var(--font-data)' }}>
              {countCorrect}/12
            </div>
          </div>
        )}
      </div>

      {/* Main card */}
      <div className="game-card game-card-accent" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, padding: '20px', gap: '20px', justifyContent: 'space-between', width: '100%' }}>
        
        {stage === 1 ? (
          /* ============================================================
             STAGE 1: BUKA CELAH
             ============================================================ */
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '24px' }}>
            
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: '#fff' }}>Tahap 1 — Buka Celah Interval</h3>
              <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Interval kelas awal disusun dari data bulat diskrit: <strong>1-3, 4-6, 7-9, 10-12, 13-15, dan 16-18</strong>. 
                Secara visual, kelas interval ini terlihat menumpuk tanpa ada penghubung. Klik alat di bawah untuk membuka celah antar kelas!
              </p>
            </div>

            {/* Interactive horizontal blocks representation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%', margin: 'auto 0', minWidth: 0 }}>
              
              <div style={{
                width: '100%',
                overflowX: 'auto',
                padding: '4px 0',
                display: 'flex',
                minWidth: 0
              }}>
                <div style={{
                  display: 'flex',
                  gap: isOpened ? '32px' : '0px',
                  transition: 'gap 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: '100%',
                  minWidth: isOpened ? '640px' : '480px',
                  maxWidth: '760px',
                  margin: '0 auto',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.03)',
                  borderRadius: '16px',
                  position: 'relative'
                }}>
                  {CLASSES.map((c, idx) => (
                    <motion.div
                      key={idx}
                      layout
                      style={{
                        flex: 1,
                        height: '72px',
                        background: `linear-gradient(135deg, ${c.color}25 0%, ${c.color}0a 100%)`,
                        border: `1.5px solid ${c.color}77`,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                        fontWeight: 800,
                        color: '#fff',
                        position: 'relative',
                        boxShadow: `0 4px 12px ${c.color}15`
                      }}
                    >
                      {c.label}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Number line representation */}
              <div style={{ width: '100%', maxWidth: '760px', padding: '0 16px', position: 'relative', height: '36px' }}>
                {/* Horizontal axis line */}
                <div style={{ position: 'absolute', top: '10px', left: '32px', right: '32px', height: '2px', background: 'rgba(255,255,255,0.15)' }} />
                
                {/* Axis ticks */}
                {[1, 3, 4, 6, 7, 9, 10, 12, 13, 15, 16, 18].map((num, i) => {
                  const leftPercentage = 32 + (i / 11) * (100 - 64)
                  return (
                    <div
                      key={num}
                      style={{
                        position: 'absolute',
                        left: `${leftPercentage}%`,
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <div style={{ width: '2px', height: '6px', background: 'rgba(255,255,255,0.3)', marginTop: '8px' }} />
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-data)' }}>
                        {num}
                      </span>
                    </div>
                  )
                })}
              </div>

            </div>

            {/* Bottom action button */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              {!isOpened ? (
                <button
                  className="game-btn game-btn-primary"
                  onClick={handleSeparateClasses}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--accent-glow)' }}
                >
                  🔍 Pisahkan Kelas (Buka Celah)
                </button>
              ) : (
                <button
                  className="game-btn game-btn-primary"
                  disabled={!animationFinished}
                  onClick={() => setStage(2)}
                  style={{ opacity: animationFinished ? 1 : 0.5, cursor: animationFinished ? 'pointer' : 'not-allowed' }}
                >
                  Lanjut ke Labeling →
                </button>
              )}
            </div>

          </div>
        ) : (
          /* ============================================================
             STAGE 2: PASANG LABEL (DRAG TO SLOT)
             ============================================================ */
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '20px', minHeight: 0 }}>
            
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto', flexShrink: 0 }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#fff' }}>Tahap 2 — Pasang Label Batas Tepi</h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Seret nilai batas tepi ($Tb$ atau $Ta$) dari pool bawah ke slot kosong di tepi kiri/kanan kelas. 
                Gunakan rumus: Tepi Bawah = Batas Bawah Kelas − 0.5, Tepi Atas = Batas Atas Kelas + 0.5.
              </p>
            </div>

            {/* Layout with blocks and empty slots */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: 'auto 0', flexShrink: 0, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                maxWidth: '820px',
                padding: '12px 6px',
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.03)',
                borderRadius: '16px',
                overflowX: 'auto',
                minWidth: 0
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  minWidth: '780px',
                  margin: '0 auto'
                }}>
                  
                  {CLASSES.map((c, idx) => {
                    const tbIdx = idx * 2
                    const taIdx = idx * 2 + 1
                    
                    const tbVal = filledSlots[tbIdx]
                    const taVal = filledSlots[taIdx]

                    const tbCorrect = tbVal !== null
                    const taCorrect = taVal !== null

                    const tbShaking = shakeSlotIdx === tbIdx
                    const taShaking = shakeSlotIdx === taIdx

                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        
                        {/* Tepi Bawah Slot */}
                        <div
                          data-slot-idx={tbIdx}
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '8px',
                            border: tbCorrect ? '2px solid var(--accent)' : '1.5px dashed rgba(255,255,255,0.2)',
                            background: tbCorrect ? 'rgba(14, 131, 136, 0.15)' : 'rgba(255,255,255,0.02)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: tbCorrect ? 900 : 500,
                            color: tbCorrect ? '#fff' : 'rgba(255,255,255,0.3)',
                            fontFamily: 'var(--font-data)',
                            boxShadow: tbCorrect ? '0 0 10px rgba(0, 173, 181, 0.15)' : 'none',
                            transform: tbShaking ? 'translateX(-5px)' : 'none',
                            transition: 'all 0.15s ease',
                            cursor: tbCorrect ? 'default' : 'pointer'
                          }}
                        >
                          {tbCorrect ? tbVal : <span style={{ fontSize: '9px', opacity: 0.6 }}>Tb</span>}
                        </div>

                        {/* Class block */}
                        <div style={{
                          width: '68px',
                          height: '56px',
                          background: `linear-gradient(180deg, ${c.color}15 0%, ${c.color}05 100%)`,
                          border: `1.5px solid ${c.color}44`,
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 800,
                          color: '#fff',
                          opacity: 0.85
                        }}>
                          {c.label}
                        </div>

                        {/* Tepi Atas Slot */}
                        <div
                          data-slot-idx={taIdx}
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '8px',
                            border: taCorrect ? '2px solid var(--accent)' : '1.5px dashed rgba(255,255,255,0.2)',
                            background: taCorrect ? 'rgba(14, 131, 136, 0.15)' : 'rgba(255,255,255,0.02)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: taCorrect ? 900 : 500,
                            color: taCorrect ? '#fff' : 'rgba(255,255,255,0.3)',
                            fontFamily: 'var(--font-data)',
                            boxShadow: taCorrect ? '0 0 10px rgba(0, 173, 181, 0.15)' : 'none',
                            transform: taShaking ? 'translateX(-5px)' : 'none',
                            transition: 'all 0.15s ease',
                            cursor: taCorrect ? 'default' : 'pointer'
                          }}
                        >
                          {taCorrect ? taVal : <span style={{ fontSize: '9px', opacity: 0.6 }}>Ta</span>}
                        </div>

                      </div>
                    )
                  })}

                </div>
              </div>
            </div>

            {/* Draggable Values Pool */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1.2px' }}>
                  PILILIHAN TEPI KELAS (POOL)
                </span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)' }}>
                  {allCorrect ? '✅ Semua terisi!' : `SLOT KOSONG — ${12 - countCorrect} tersisa`}
                </span>
              </div>

              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                padding: '12px',
                background: 'rgba(255,255,255,0.01)',
                border: '1px dashed rgba(14, 131, 136, 0.25)',
                borderRadius: '12px',
                minHeight: '66px',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: draggingId ? 'visible' : 'hidden'
              }}>
                <AnimatePresence>
                  {pool.map(item => {
                    const isDragging = draggingId === item.id
                    return (
                      <motion.div
                        key={item.id}
                        id={item.id}
                        drag
                        dragSnapToOrigin
                        dragMomentum={false}
                        dragElastic={0.08}
                        onDragStart={handleDragStart(item.id)}
                        onDragEnd={handleDragEnd(item)}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0, transition: { duration: 0.15 } }}
                        whileHover={{ scale: 1.1 }}
                        whileDrag={{
                          scale: 1.25,
                          zIndex: 9999,
                          boxShadow: '0 8px 24px rgba(0,173,181,0.4)',
                          opacity: 0.9
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '24px',
                          background: 'linear-gradient(135deg, var(--accent) 0%, #1c2e3d 100%)',
                          border: '1px solid rgba(0, 173, 181, 0.3)',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 800,
                          fontFamily: 'var(--font-data)',
                          cursor: 'grab',
                          touchAction: 'none',
                          userSelect: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                          zIndex: isDragging ? 1000 : 1
                        }}
                      >
                        {item.val.toFixed(1)}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {pool.length === 0 && !allCorrect && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Menunggu pengisian...
                  </div>
                )}
              </div>
            </div>

            {/* Bottom action */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', flexShrink: 0 }}>
              {teamId && teamMembers.length > 0 && hasVotedInterval && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '4px' }}>
                  {teamMembers.map(m => {
                    const voted = (teamReadyVotes['gate_interval_done'] ?? []).includes(m.id) || (m.id === studentId)
                    return (
                      <span key={m.id} style={{
                        fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '50px',
                        background: voted ? 'rgba(16,185,129,0.12)' : 'rgba(180,140,80,0.08)',
                        border: `1px solid ${voted ? 'rgba(16,185,129,0.3)' : 'rgba(180,140,80,0.15)'}`,
                        color: voted ? '#10B981' : '#78716C',
                      }}>
                        {voted ? '✅' : '⏳'} {m.name.split(' ')[0]}
                      </span>
                    )
                  })}
                </div>
              )}
              <button
                className="game-btn game-btn-primary"
                disabled={!allCorrect || !!(teamId && hasVotedInterval)}
                onClick={handleFinish}
                style={{
                  width: '100%',
                  opacity: (allCorrect && !(teamId && hasVotedInterval)) ? 1 : 0.45,
                  cursor: (allCorrect && !(teamId && hasVotedInterval)) ? 'pointer' : 'not-allowed',
                  boxShadow: (allCorrect && !(teamId && hasVotedInterval)) ? 'var(--accent-glow)' : 'none'
                }}
              >
                {teamId && hasVotedInterval
                  ? `⏳ Menunggu ${Math.max(0, 2 - (teamReadyVotes['gate_interval_done']?.length ?? 1))} anggota lagi...`
                  : allCorrect
                  ? 'Selesai & Lanjut ke Histogram →'
                  : 'Isi Semua Batas dengan Benar'}
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Floating feedback toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            style={{
              position: 'fixed',
              bottom: '90px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(239, 68, 68, 0.95)',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: '12px',
              border: '1px solid #ef4444',
              fontSize: '12.5px',
              fontWeight: 700,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 12px rgba(239,68,68,0.2)',
              zIndex: 9999,
              textAlign: 'center',
              maxWidth: '360px',
              pointerEvents: 'none'
            }}
          >
            ⚠️ {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dira Explanation overlay (Portal) */}
      {showDiraExpl && (
        <DiRA
          message={diraExplMessage}
          onDismiss={() => setShowDiraExpl(false)}
        />
      )}

    </div>
  )
}
