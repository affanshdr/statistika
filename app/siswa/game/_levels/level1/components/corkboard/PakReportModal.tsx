'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gameAudio } from '@/lib/utils/gameAudio'
import { useGameStore } from '@/lib/store/gameStore'
import { getLevel1Data } from '@/app/siswa/game/_data/level1'
import DeskCalculator from './DeskCalculator'
import StageTutorialModal from './StageTutorialModal'
import { SortToken, useFitGrid, STAGE_TUTORIALS } from './corkboardData'

export default function PakReportModal({ dataset, onProceed }: { dataset: number[]; onProceed: () => void }) {
  const [stage, setStage] = useState<'sort' | 'modus' | 'median' | 'mean'>('sort')
  const [isSorted, setIsSorted] = useState<boolean>(false)
  const [seenTutorials, setSeenTutorials] = useState<Record<string, boolean>>({})
  const [showTutorialModal, setShowTutorialModal] = useState<boolean>(true)

  // Otomatis tampilkan tutorial saat masuk tahap baru jika belum pernah dilihat
  useEffect(() => {
    if (!seenTutorials[stage]) {
      setShowTutorialModal(true)
    }
  }, [stage])

  const handleCloseTutorial = () => {
    setSeenTutorials(prev => ({ ...prev, [stage]: true }))
    setShowTutorialModal(false)
    gameAudio.playClick()
  }

  // Grid adaptif untuk pool data acak, slot target, dan data terurut (tahap 2–4)
  const [poolGridRef, poolGrid] = useFitGrid(24)
  const [slotGridRef, slotGrid] = useFitGrid(24)
  const [sortedGridRef, sortedGrid] = useFitGrid(24)

  const sortedDataset = useMemo(() => [...dataset].sort((a, b) => a - b), [dataset])
  const unsortedDataset = useMemo(() => {
    // Jika dataset kebetulan sudah terurut, acak deterministik agar puzzle urutkan data berfungsi
    const isAlreadySorted = dataset.every((v, i, arr) => i === 0 || arr[i - 1] <= v)
    if (!isAlreadySorted) return dataset
    const perm = [7, 19, 2, 14, 22, 0, 11, 17, 5, 20, 9, 3, 15, 23, 6, 12, 1, 18, 10, 4, 21, 8, 16, 13]
    return perm.map(idx => dataset[idx] ?? dataset[0])
  }, [dataset])

  // ── Tahap 1: Urutkan Data State ──
  const initialTokens: SortToken[] = useMemo(() => {
    return unsortedDataset.map((val, idx) => ({
      id: `tok-${idx}`,
      val,
    }))
  }, [unsortedDataset])

  interface HeldTokenInfo {
    token: SortToken
    sourceSlotIdx: number | null
  }

  const [placedSlots, setPlacedSlots] = useState<(SortToken | null)[]>(() => Array(24).fill(null))
  const [heldToken, setHeldToken] = useState<HeldTokenInfo | null>(null)
  const [sortIsCorrect, setSortIsCorrect] = useState<boolean | null>(null)
  const [wrongSlots, setWrongSlots] = useState<Set<number>>(new Set())
  const [draggedTokenInfo, setDraggedTokenInfo] = useState<{
    tokenId: string
    sourceSlotIdx: number | null
  } | null>(null)
  const [draggedTokenId, setDraggedTokenId] = useState<string | null>(null)
  const [dragOverSlotIdx, setDragOverSlotIdx] = useState<number | null>(null)

  const placedTokenIds = useMemo(() => {
    const ids = new Set<string>()
    placedSlots.forEach(s => {
      if (s) ids.add(s.id)
    })
    return ids
  }, [placedSlots])

  const validateSlots = (currentSlots = placedSlots) => {
    const filledCount = currentSlots.filter(s => s !== null).length
    if (filledCount < 24) {
      setSortIsCorrect(false)
      gameAudio.playError()
      return
    }

    const wrong = new Set<number>()
    let correct = true
    for (let i = 0; i < 24; i++) {
      if (currentSlots[i]?.val !== sortedDataset[i]) {
        wrong.add(i)
        correct = false
      }
    }

    setWrongSlots(wrong)
    if (correct) {
      setSortIsCorrect(true)
      setIsSorted(true)
      gameAudio.playSuccess()
    } else {
      setSortIsCorrect(false)
      gameAudio.playError()
    }
  }

  // ── Mekanisme Hold & Switch (Tap / Click untuk Mobile & Desktop) ──
  const handleTokenClick = (token: SortToken) => {
    if (placedTokenIds.has(token.id)) return

    if (heldToken) {
      if (heldToken.token.id === token.id) {
        // Klik token yang sama dengan yang dipegang: lepas hold
        handleCancelHold()
      } else {
        // Klik token lain di pool: ganti token yang dipegang
        setHeldToken({ token, sourceSlotIdx: null })
        gameAudio.playClick()
      }
      return
    }

    // Ambil token dari pool ke tangan
    setHeldToken({ token, sourceSlotIdx: null })
    gameAudio.playClick()
  }

  const handleCancelHold = () => {
    if (!heldToken) return
    if (heldToken.sourceSlotIdx !== null && placedSlots[heldToken.sourceSlotIdx] === null) {
      const next = [...placedSlots]
      next[heldToken.sourceSlotIdx] = heldToken.token
      setPlacedSlots(next)
    }
    setHeldToken(null)
    gameAudio.playClick()
  }

  const handleSlotClick = (slotIdx: number) => {
    const currentSlotToken = placedSlots[slotIdx]

    if (heldToken) {
      // Sedang memegang angka di tangan
      const next = [...placedSlots]

      if (currentSlotToken) {
        // ── MEKANISME SWITCH: Meletakkan angka yang di-hold & mengambil angka yang posisinya sudah ada ke tangan ──
        next[slotIdx] = heldToken.token
        setPlacedSlots(next)
        setHeldToken({ token: currentSlotToken, sourceSlotIdx: slotIdx })
        setSortIsCorrect(null)
        setWrongSlots(new Set())
        gameAudio.playClick()
      } else {
        // Slot kosong: letakkan angka yang di-hold
        next[slotIdx] = heldToken.token
        setPlacedSlots(next)
        setHeldToken(null)
        setSortIsCorrect(null)
        setWrongSlots(new Set())
        gameAudio.playClick()
      }

      if (next.every(s => s !== null)) {
        validateSlots(next)
      }
    } else {
      // Belum memegang angka: klik slot yang terisi untuk mengangkatnya ke tangan (slot jadi kosong)
      if (currentSlotToken) {
        const next = [...placedSlots]
        next[slotIdx] = null
        setPlacedSlots(next)
        setHeldToken({ token: currentSlotToken, sourceSlotIdx: slotIdx })
        setSortIsCorrect(null)
        setWrongSlots(new Set())
        gameAudio.playClick()
      }
    }
  }

  // ── Mekanisme Drag & Drop (Mouse & Re-positioning) ──
  const handleDragStartFromPool = (e: React.DragEvent, tokenId: string) => {
    e.dataTransfer.setData('text/plain', tokenId)
    try {
      e.dataTransfer.setData('application/json', JSON.stringify({ tokenId, sourceSlotIdx: null }))
    } catch {}
    setDraggedTokenId(tokenId)
    setDraggedTokenInfo({ tokenId, sourceSlotIdx: null })
  }

  const handleDragStartFromSlot = (e: React.DragEvent, slotIdx: number, tokenId: string) => {
    e.dataTransfer.setData('text/plain', tokenId)
    try {
      e.dataTransfer.setData('application/json', JSON.stringify({ tokenId, sourceSlotIdx: slotIdx }))
    } catch {}
    setDraggedTokenId(tokenId)
    setDraggedTokenInfo({ tokenId, sourceSlotIdx: slotIdx })
  }

  const handleDropOnSlot = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault()
    setDragOverSlotIdx(null)

    let tokenId = draggedTokenInfo?.tokenId || draggedTokenId
    let sourceSlotIdx = draggedTokenInfo?.sourceSlotIdx ?? null

    try {
      const raw = e.dataTransfer.getData('application/json')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.tokenId) {
          tokenId = parsed.tokenId
          sourceSlotIdx = parsed.sourceSlotIdx ?? null
        }
      } else {
        const plain = e.dataTransfer.getData('text/plain')
        if (plain) {
          tokenId = plain
          const foundIdx = placedSlots.findIndex(s => s?.id === plain)
          if (foundIdx !== -1) sourceSlotIdx = foundIdx
        }
      }
    } catch {
      // fallback
    }

    if (!tokenId) return
    const token = initialTokens.find(t => t.id === tokenId)
    if (!token) return

    const next = [...placedSlots]

    if (sourceSlotIdx !== null && sourceSlotIdx >= 0) {
      if (sourceSlotIdx === targetIdx) return
      // SWAP / TUKAR posisi kedua slot jika targetIdx terisi, atau pindahkan jika kosong
      const targetToken = next[targetIdx]
      next[targetIdx] = next[sourceSlotIdx]
      next[sourceSlotIdx] = targetToken
    } else {
      // Dari Pool ke Slot
      next[targetIdx] = token
    }

    if (heldToken?.token.id === tokenId) {
      setHeldToken(null)
    }

    setPlacedSlots(next)
    setSortIsCorrect(null)
    setWrongSlots(new Set())
    setDraggedTokenInfo(null)
    setDraggedTokenId(null)
    gameAudio.playClick()

    if (next.every(s => s !== null)) {
      validateSlots(next)
    }
  }

  const handleDropOnPool = (e: React.DragEvent) => {
    e.preventDefault()
    let sourceSlotIdx = draggedTokenInfo?.sourceSlotIdx ?? null
    const tokenId = draggedTokenInfo?.tokenId || e.dataTransfer.getData('text/plain')
    if (sourceSlotIdx === null && tokenId) {
      const foundIdx = placedSlots.findIndex(s => s?.id === tokenId)
      if (foundIdx !== -1) sourceSlotIdx = foundIdx
    }

    if (sourceSlotIdx !== null && sourceSlotIdx >= 0) {
      const next = [...placedSlots]
      next[sourceSlotIdx] = null
      setPlacedSlots(next)
      setSortIsCorrect(null)
      setWrongSlots(new Set())
      setDraggedTokenInfo(null)
      setDraggedTokenId(null)
      if (heldToken?.sourceSlotIdx === sourceSlotIdx) {
        setHeldToken(null)
      }
      gameAudio.playClick()
    }
  }

  const handleAutoSort = useCallback(() => {
    const sortedTokens = [...initialTokens].sort((a, b) => a.val - b.val)
    setPlacedSlots(sortedTokens)
    setSortIsCorrect(true)
    setWrongSlots(new Set())
    setIsSorted(true)
    setHeldToken(null)
    setDraggedTokenInfo(null)
    setDraggedTokenId(null)
    gameAudio.playSuccess()
  }, [initialTokens])

  const handleResetSort = () => {
    setPlacedSlots(Array(24).fill(null))
    setSortIsCorrect(null)
    setWrongSlots(new Set())
    setIsSorted(false)
    setHeldToken(null)
    setDraggedTokenInfo(null)
    setDraggedTokenId(null)
    gameAudio.playClick()
  }

  const handleReset = () => {
    if (stage === 'sort') {
      handleResetSort()
    } else if (stage === 'modus') {
      setSelectedMode(null)
      setModeIsCorrect(null)
      gameAudio.playClick()
    } else if (stage === 'median') {
      setSelectedMedian(null)
      setMedianIsCorrect(null)
      gameAudio.playClick()
    } else if (stage === 'mean') {
      setSelectedMean(null)
      setMeanIsCorrect(null)
      gameAudio.playClick()
    }
  }

  // Stage 2: Modus state
  const [selectedMode, setSelectedMode] = useState<number | null>(null)
  const [modeIsCorrect, setModeIsCorrect] = useState<boolean | null>(null)
  const [shakeMode, setShakeMode] = useState<number>(0)

  // Stage 3: Median state
  const [selectedMedian, setSelectedMedian] = useState<number | null>(null)
  const [medianIsCorrect, setMedianIsCorrect] = useState<boolean | null>(null)
  const [shakeMedian, setShakeMedian] = useState<number>(0)

  // Stage 4: Mean state
  const [selectedMean, setSelectedMean] = useState<number | null>(null)
  const [meanIsCorrect, setMeanIsCorrect] = useState<boolean | null>(null)
  const [shakeMean, setShakeMean] = useState<number>(0)

  // Dev Tool State
  const [showDevTools, setShowDevTools] = useState<boolean>(false)

  const { STATS } = getLevel1Data(dataset)
  const totalSum = STATS.sum
  const meanVal = STATS.mean
  const medianVal = STATS.median

  const displayedData = isSorted ? sortedDataset : unsortedDataset
  const mid1Val = sortedDataset[11]
  const mid2Val = sortedDataset[12]

  const { modeVal, modeCount } = useMemo(() => {
    const counts: Record<number, number> = {}
    let maxCount = 0
    let bestVal = dataset[0] || 3
    for (const v of dataset) {
      counts[v] = (counts[v] || 0) + 1
      if (counts[v] > maxCount) {
        maxCount = counts[v]
        bestVal = v
      }
    }
    return { modeVal: bestVal, modeCount: maxCount }
  }, [dataset])

  // Multiple choice options for Modus
  const modeChoices = useMemo(() => {
    const pool = new Set<number>([modeVal])
    const candidates = [modeVal - 1, modeVal + 1, modeVal + 2, modeVal - 2, 6, 7]
    for (const c of candidates) {
      if (pool.size >= 4) break
      if (c >= 1 && !pool.has(c)) pool.add(c)
    }
    return Array.from(pool).sort((a, b) => a - b)
  }, [modeVal])

  // Multiple choice options for Median
  const medianChoices = useMemo(() => {
    const pool = new Set<number>([medianVal])
    const offsets = [-1, -0.5, 0.5, 1, 1.5, -1.5]
    for (const off of offsets) {
      if (pool.size >= 4) break
      const cand = Number((medianVal + off).toFixed(2))
      if (cand >= 1 && !pool.has(cand)) pool.add(cand)
    }
    return Array.from(pool).sort((a, b) => a - b)
  }, [medianVal])

  // Multiple choice options for Mean
  const meanChoices = useMemo(() => {
    const pool = new Set<number>([meanVal])
    const candidateOffsets = [-1.0, 0.5, -0.5, 1.2, 1.5, -1.5]
    for (const off of candidateOffsets) {
      if (pool.size >= 4) break
      const cand = Number((meanVal + off).toFixed(2))
      if (cand > 0 && !pool.has(cand)) pool.add(cand)
    }
    return Array.from(pool).sort((a, b) => a - b)
  }, [meanVal])

  const handleChooseMode = (val: number) => {
    setSelectedMode(val)
    if (val === modeVal) {
      setModeIsCorrect(true)
      gameAudio.playSuccess()
    } else {
      setModeIsCorrect(false)
      setShakeMode(prev => prev + 1)
      gameAudio.playError()
    }
  }

  const handleChooseMedian = (val: number) => {
    setSelectedMedian(val)
    if (Math.abs(val - medianVal) < 0.05) {
      setMedianIsCorrect(true)
      gameAudio.playSuccess()
    } else {
      setMedianIsCorrect(false)
      setShakeMedian(prev => prev + 1)
      gameAudio.playError()
    }
  }

  const handleChooseMean = (val: number) => {
    setSelectedMean(val)
    if (Math.abs(val - meanVal) < 0.05) {
      setMeanIsCorrect(true)
      gameAudio.playSuccess()
    } else {
      setMeanIsCorrect(false)
      setShakeMean(prev => prev + 1)
      gameAudio.playError()
    }
  }

  // ─── DEV TOOLS: SKIP STEP & SHORTCUTS ─────────────────────────────────────────
  const handleSkipToStage = useCallback((targetStage: 'sort' | 'modus' | 'median' | 'mean') => {
    const sortedTokens = [...initialTokens].sort((a, b) => a.val - b.val)
    if (targetStage === 'sort') {
      setStage('sort')
    } else if (targetStage === 'modus') {
      setPlacedSlots(sortedTokens)
      setSortIsCorrect(true)
      setWrongSlots(new Set())
      setIsSorted(true)
      setHeldToken(null)
      setDraggedTokenInfo(null)
      setDraggedTokenId(null)
      setStage('modus')
    } else if (targetStage === 'median') {
      setPlacedSlots(sortedTokens)
      setSortIsCorrect(true)
      setWrongSlots(new Set())
      setIsSorted(true)
      setHeldToken(null)
      setDraggedTokenInfo(null)
      setDraggedTokenId(null)
      setSelectedMode(modeVal)
      setModeIsCorrect(true)
      setStage('median')
    } else if (targetStage === 'mean') {
      setPlacedSlots(sortedTokens)
      setSortIsCorrect(true)
      setWrongSlots(new Set())
      setIsSorted(true)
      setHeldToken(null)
      setDraggedTokenInfo(null)
      setDraggedTokenId(null)
      setSelectedMode(modeVal)
      setModeIsCorrect(true)
      setSelectedMedian(medianVal)
      setMedianIsCorrect(true)
      setStage('mean')
    }
    gameAudio.playClick()
  }, [initialTokens, modeVal, medianVal])

  const handleAutoCompleteAll = useCallback(() => {
    const sortedTokens = [...initialTokens].sort((a, b) => a.val - b.val)
    setPlacedSlots(sortedTokens)
    setSortIsCorrect(true)
    setWrongSlots(new Set())
    setIsSorted(true)
    setHeldToken(null)
    setDraggedTokenInfo(null)
    setDraggedTokenId(null)
    setSelectedMode(modeVal)
    setModeIsCorrect(true)
    setSelectedMedian(medianVal)
    setMedianIsCorrect(true)
    setSelectedMean(meanVal)
    setMeanIsCorrect(true)
    setStage('mean')
    gameAudio.playSuccess()
  }, [initialTokens, modeVal, medianVal, meanVal])

  const handleResetAllStages = useCallback(() => {
    setPlacedSlots(Array(24).fill(null))
    setSortIsCorrect(null)
    setWrongSlots(new Set())
    setIsSorted(false)
    setHeldToken(null)
    setDraggedTokenInfo(null)
    setDraggedTokenId(null)
    setSelectedMode(null)
    setModeIsCorrect(null)
    setSelectedMedian(null)
    setMedianIsCorrect(null)
    setSelectedMean(null)
    setMeanIsCorrect(null)
    setStage('sort')
    gameAudio.playClick()
  }, [])

  // Keyboard Shortcuts (Dev tools commented out for players)
  /*
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase()
      if (activeTag === 'input' || activeTag === 'textarea') return

      if (e.key === 'u' || e.key === 'U') {
        if (stage === 'sort') handleAutoSort()
      } else if (e.key === '1') {
        handleSkipToStage('sort')
      } else if (e.key === '2') {
        handleSkipToStage('modus')
      } else if (e.key === '3') {
        handleSkipToStage('median')
      } else if (e.key === '4') {
        handleSkipToStage('mean')
      } else if (e.key === '0' || e.key.toLowerCase() === 'w') {
        handleAutoCompleteAll()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [stage, handleAutoSort, handleSkipToStage, handleAutoCompleteAll])
  */

  const renderPushPin = (color: string) => (
    <div style={{
      position: 'absolute',
      top: 'clamp(-16px, -2.5vh, -12px)',
      left: '50%',
      transform: 'translateX(-50%) rotate(8deg)',
      zIndex: 12,
      filter: 'drop-shadow(0px 3px 3px rgba(0,0,0,0.35))',
      pointerEvents: 'none',
    }}>
      <svg width="28" height="34" viewBox="0 0 24 28" fill="none" style={{ width: 'clamp(22px, 3vw, 32px)', height: 'clamp(26px, 3.5vh, 38px)' }}>
        <ellipse cx="10" cy="22" rx="4" ry="2" fill="rgba(0,0,0,0.22)" transform="rotate(-15 10 22)" />
        <path d="M12 14L10 24" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M6 6C6 4.89543 6.89543 4 8 4H16C17.1046 4 18 4.89543 18 6V11C18 11.85 17.3 12.5 16.5 12.8L12.5 14.5L8.5 12.8C7.7 12.5 7 11.8 7 11V6Z" fill={color} />
        <path d="M9 5H15V6H9V5Z" fill="rgba(255,255,255,0.35)" />
        <circle cx="10" cy="8" r="1.5" fill="rgba(255,255,255,0.45)" />
      </svg>
    </div>
  )

  const renderCornerBrackets = () => (
    <>
      <div style={{ position: 'absolute', top: '4px', left: '4px', width: 'clamp(7px, 1vw, 10px)', height: 'clamp(7px, 1vw, 10px)', borderTop: '2px solid #5C4033', borderLeft: '2px solid #5C4033', borderTopLeftRadius: '2px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '4px', right: '4px', width: 'clamp(7px, 1vw, 10px)', height: 'clamp(7px, 1vw, 10px)', borderTop: '2px solid #5C4033', borderRight: '2px solid #5C4033', borderTopRightRadius: '2px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '4px', left: '4px', width: 'clamp(7px, 1vw, 10px)', height: 'clamp(7px, 1vw, 10px)', borderBottom: '2px solid #5C4033', borderLeft: '2px solid #5C4033', borderBottomLeftRadius: '2px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: 'clamp(7px, 1vw, 10px)', height: 'clamp(7px, 1vw, 10px)', borderBottom: '2px solid #5C4033', borderRight: '2px solid #5C4033', borderBottomRightRadius: '2px', pointerEvents: 'none' }} />
    </>
  )

  const currentStageSolved =
    (stage === 'sort' && sortIsCorrect === true) ||
    (stage === 'modus' && modeIsCorrect === true) ||
    (stage === 'median' && medianIsCorrect === true) ||
    (stage === 'mean' && meanIsCorrect === true)

  return (
    <div
      data-testid="pak-report-corkboard"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 650,
        background: '#1A0F08',
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        userSelect: 'none',
        boxSizing: 'border-box',
        border: 'clamp(6px, 1.2vw, 14px) solid #5a3825',
        outline: 'clamp(1.5px, 0.3vw, 3px) solid #362014',
        outlineOffset: 'calc(-1 * clamp(7px, 1.5vw, 17px))',
        boxShadow: 'inset 0 8px 24px rgba(0,0,0,0.65), inset 0 -8px 24px rgba(0,0,0,0.65)',
        padding: 'clamp(7px, 1.2vh, 14px) clamp(8px, 1.6vw, 18px) clamp(6px, 1.2vh, 12px)',
      }}
    >
      <style>{`
        .corkboard-scroll-area::-webkit-scrollbar {
          width: 5px;
        }
        .corkboard-scroll-area::-webkit-scrollbar-track {
          background: rgba(54, 32, 20, 0.15);
          border-radius: 999px;
        }
        .corkboard-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(140, 98, 57, 0.5);
          border-radius: 999px;
        }
        .corkboard-scroll-area::-webkit-scrollbar-thumb:hover {
          background: rgba(140, 98, 57, 0.8);
        }
      `}</style>

      {/* Corkboard SVG Texture Defs */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <pattern id="rgCorkTexture" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="#C9A876" />
            <circle cx="8" cy="6" r="1.2" fill="#A8895F" opacity="0.5" />
            <circle cx="22" cy="14" r="0.9" fill="#8A6E45" opacity="0.4" />
            <circle cx="34" cy="4" r="1.4" fill="#B5966B" opacity="0.5" />
            <circle cx="15" cy="24" r="1.1" fill="#8A6E45" opacity="0.4" />
            <circle cx="30" cy="28" r="0.8" fill="#A8895F" opacity="0.5" />
            <circle cx="4" cy="33" r="1.3" fill="#8A6E45" opacity="0.4" />
            <circle cx="38" cy="20" r="1.0" fill="#B5966B" opacity="0.5" />
            <circle cx="19" cy="37" r="0.9" fill="#A8895F" opacity="0.4" />
          </pattern>
          <radialGradient id="rgBoardSpotlight" cx="50%" cy="35%" r="72%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.38" />
          </radialGradient>
        </defs>
      </svg>

      {/* Background Cork Texture & Spotlight */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        <rect width="100%" height="100%" fill="url(#rgCorkTexture)" />
        <rect width="100%" height="100%" fill="url(#rgBoardSpotlight)" />
      </svg>

      {/* Warm Lamp Highlight */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 20% 15%, rgba(254, 240, 138, 0.22) 0%, rgba(254, 240, 138, 0.05) 45%, rgba(254, 240, 138, 0) 75%)',
        pointerEvents: 'none',
        zIndex: 1,
        mixBlendMode: 'screen',
      }} />

      {/* ── TOP HEADER BAR: STEPPER & DEV TOOLS ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          flexShrink: 0,
          position: 'relative',
          zIndex: 30,
          marginBottom: 'clamp(3px, 0.6vh, 7px)',
          gap: 'clamp(4px, 0.8vw, 10px)',
        }}
      >
        {/* Kiri: Spacer penyeimbang layout header (Dev Tool Skip Step commented out for player) */}
        <div style={{ width: 'clamp(80px, 9vw, 120px)', flexShrink: 0 }} />
        {/*
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <button
            data-testid="btn-dev-tools-toggle"
            onClick={() => {
              setShowDevTools(prev => !prev)
              gameAudio.playClick()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 'clamp(2.5px, 0.4vh, 5px) clamp(6px, 0.8vw, 11px)',
              borderRadius: '999px',
              fontSize: 'clamp(8px, 1vw, 10.5px)',
              fontWeight: 900,
              cursor: 'pointer',
              border: showDevTools ? '1.5px solid #F59E0B' : '1.5px solid rgba(245, 158, 11, 0.45)',
              background: showDevTools
                ? 'linear-gradient(180deg, #92400E 0%, #78350F 100%)'
                : 'linear-gradient(180deg, rgba(60, 25, 5, 0.85) 0%, rgba(30, 12, 2, 0.95) 100%)',
              color: '#FDE68A',
              boxShadow: '0 2px 8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            title="Buka / Tutup Dev Tool Skip Step untuk kemudahan debugging"
          >
            <span>🛠️</span>
            <span>DEV SKIP</span>
            <span style={{ fontSize: '9px', opacity: 0.85 }}>{showDevTools ? '▲' : '▼'}</span>
          </button>
        </div>
        */}

        {/* Tengah: Stepper 4 Tahap (Klik tab mana saja untuk langsung lompat ke tahap tersebut) */}
        <div
          data-testid="corkboard-stage-stepper"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(4px, 0.7vw, 8px)',
            flexShrink: 0,
            flexWrap: 'nowrap',
            overflowX: 'auto',
            alignSelf: 'center',
            background: 'linear-gradient(180deg, #3E2415 0%, #27150B 100%)',
            border: '1.5px solid #B48C50',
            borderRadius: '999px',
            padding: 'clamp(2px, 0.35vh, 5px) clamp(8px, 1.2vw, 16px)',
            boxShadow: '0 3px 10px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          {[
            { id: 'sort', num: 1, label: '1. Urutkan Data', done: sortIsCorrect === true },
            { id: 'modus', num: 2, label: '2. Modus', done: modeIsCorrect === true },
            { id: 'median', num: 3, label: '3. Median', done: medianIsCorrect === true },
            { id: 'mean', num: 4, label: '4. Rata-Rata', done: meanIsCorrect === true },
          ].map((st, i) => {
            const isActive = stage === st.id
            return (
              <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(2px, 0.4vw, 5px)', flexShrink: 0 }}>
                <div
                  data-testid={`stepper-tab-${st.id}`}
                  onClick={() => {
                    // Hanya izinkan navigasi untuk tahap yang sudah diselesaikan (review)
                    if (st.done) {
                      setStage(st.id as any)
                      gameAudio.playClick()
                    }
                  }}
                  style={{
                    padding: 'clamp(2px, 0.4vh, 4px) clamp(6px, 0.9vw, 11px)',
                    borderRadius: '999px',
                    fontSize: 'clamp(8.5px, 1.1vw, 11px)',
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                    cursor: st.done ? 'pointer' : 'default',
                    background: st.done
                      ? '#059669'
                      : isActive
                      ? '#5a3825'
                      : 'rgba(255, 255, 255, 0.08)',
                    color: st.done || isActive ? '#FFFDF9' : '#D1B89D',
                    border: isActive
                      ? '2px solid #FDE68A'
                      : st.done
                      ? '1.5px solid #34D399'
                      : '1.5px solid rgba(180, 140, 80, 0.35)',
                    boxShadow: isActive ? '0 0 8px rgba(253, 230, 138, 0.4)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                    opacity: !st.done && !isActive ? 0.65 : 1,
                  }}
                  title={st.done ? `Buka kembali ${st.label}` : st.label}
                >
                  <span>{st.done ? '✓' : ''}</span>
                  <span>{st.label}</span>
                </div>
                {i < 3 && (
                  <span style={{ color: '#FDE68A', fontWeight: 900, fontSize: 'clamp(9px, 1.1vw, 11px)' }}>→</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Kanan: Tombol Cepat Auto Win (Selesaikan Semua 4 Tahap) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 0.7vw, 8px)', flexShrink: 0 }}>
          {/* Tombol Panduan Materi / Tutorial untuk Tahap Aktif */}
          <button
            data-testid="btn-open-tutorial-header"
            onClick={() => {
              setShowTutorialModal(true)
              gameAudio.playClick()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 'clamp(2.5px, 0.4vh, 5px) clamp(7px, 1vw, 12px)',
              borderRadius: '999px',
              fontSize: 'clamp(8px, 1vw, 10.5px)',
              fontWeight: 900,
              cursor: 'pointer',
              border: '1.5px solid #60A5FA',
              background: 'linear-gradient(180deg, #1E3A8A 0%, #172554 100%)',
              color: '#EFF6FF',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            title="Buka Panel Panduan & Tutorial Konsep Belajar"
          >
            <span style={{ fontSize: 'clamp(9px, 1.1vw, 12px)' }}>💡</span>
            <span>Panduan Materi</span>
          </button>

          {/* Auto Win Dev Button (Commented out for player) */}
          {/*
          <button
            data-testid="btn-dev-instant-win"
            onClick={handleAutoCompleteAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 'clamp(2.5px, 0.4vh, 5px) clamp(6px, 0.8vw, 11px)',
              borderRadius: '999px',
              fontSize: 'clamp(8px, 1vw, 10.5px)',
              fontWeight: 900,
              cursor: 'pointer',
              border: '1.5px solid #10B981',
              background: 'linear-gradient(180deg, #059669 0%, #047857 100%)',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            title="Selesaikan semua 4 tahap secara instan (Auto Win / Dev)"
          >
            <span>⚡</span>
            <span>Auto Win</span>
          </button>
          */}
        </div>
      </div>

      {/* Collapsible Dev Toolbar (commented out for players)
      <AnimatePresence>
        {showDevTools && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 'clamp(3px, 0.6vw, 6px)',
              background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
              border: '1.5px solid #8C6239',
              borderRadius: '8px',
              padding: 'clamp(3px, 0.5vh, 6px) clamp(6px, 1vw, 12px)',
              marginBottom: 'clamp(4px, 0.6vh, 8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6)',
              position: 'relative',
              zIndex: 35,
              alignSelf: 'center',
              overflow: 'hidden',
            }}
          >
            <span style={{
              fontSize: 'clamp(8px, 1vw, 10.5px)',
              fontWeight: 900,
              color: '#9A3412',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              marginRight: '2px',
            }}>
              🛠️ SKIP:
            </span>

            <button
              data-testid="dev-btn-stage-1"
              onClick={() => handleSkipToStage('sort')}
              style={{
                padding: 'clamp(2px, 0.35vh, 4px) clamp(5px, 0.7vw, 9px)',
                borderRadius: '5px',
                border: stage === 'sort' ? '1.5px solid #78350F' : '1px solid #8C6239',
                background: stage === 'sort' ? '#B45309' : '#FFFDF7',
                color: stage === 'sort' ? '#FFFFFF' : '#362014',
                fontSize: 'clamp(8px, 0.95vw, 10px)',
                fontWeight: 800,
                cursor: 'pointer',
              }}
              title="Lompat ke Tahap 1 (Urutkan Data)"
            >
              [1] Urutkan
            </button>

            <button
              data-testid="dev-btn-stage-2"
              onClick={() => handleSkipToStage('modus')}
              style={{
                padding: 'clamp(2px, 0.35vh, 4px) clamp(5px, 0.7vw, 9px)',
                borderRadius: '5px',
                border: stage === 'modus' ? '1.5px solid #78350F' : '1px solid #8C6239',
                background: stage === 'modus' ? '#B45309' : '#FFFDF7',
                color: stage === 'modus' ? '#FFFFFF' : '#362014',
                fontSize: 'clamp(8px, 0.95vw, 10px)',
                fontWeight: 800,
                cursor: 'pointer',
              }}
              title="Lompat ke Tahap 2 (Modus) + Auto-Sort"
            >
              [2] Modus
            </button>

            <button
              data-testid="dev-btn-stage-3"
              onClick={() => handleSkipToStage('median')}
              style={{
                padding: 'clamp(2px, 0.35vh, 4px) clamp(5px, 0.7vw, 9px)',
                borderRadius: '5px',
                border: stage === 'median' ? '1.5px solid #78350F' : '1px solid #8C6239',
                background: stage === 'median' ? '#B45309' : '#FFFDF7',
                color: stage === 'median' ? '#FFFFFF' : '#362014',
                fontSize: 'clamp(8px, 0.95vw, 10px)',
                fontWeight: 800,
                cursor: 'pointer',
              }}
              title="Lompat ke Tahap 3 (Median) + Auto-Modus"
            >
              [3] Median
            </button>

            <button
              data-testid="dev-btn-stage-4"
              onClick={() => handleSkipToStage('mean')}
              style={{
                padding: 'clamp(2px, 0.35vh, 4px) clamp(5px, 0.7vw, 9px)',
                borderRadius: '5px',
                border: stage === 'mean' ? '1.5px solid #78350F' : '1px solid #8C6239',
                background: stage === 'mean' ? '#B45309' : '#FFFDF7',
                color: stage === 'mean' ? '#FFFFFF' : '#362014',
                fontSize: 'clamp(8px, 0.95vw, 10px)',
                fontWeight: 800,
                cursor: 'pointer',
              }}
              title="Lompat ke Tahap 4 (Rata-Rata) + Auto-Median"
            >
              [4] Rata-Rata
            </button>

            <button
              data-testid="dev-btn-auto-all"
              onClick={handleAutoCompleteAll}
              style={{
                padding: 'clamp(2px, 0.35vh, 4px) clamp(5px, 0.7vw, 9px)',
                borderRadius: '5px',
                border: '1.5px solid #065F46',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#FFFFFF',
                fontSize: 'clamp(8px, 0.95vw, 10px)',
                fontWeight: 900,
                cursor: 'pointer',
              }}
              title="Selesaikan semua 4 tahap sekaligus"
            >
              ⚡ Selesai Semua
            </button>

            <button
              data-testid="dev-btn-reset-all"
              onClick={handleResetAllStages}
              style={{
                padding: 'clamp(2px, 0.35vh, 4px) clamp(5px, 0.7vw, 9px)',
                borderRadius: '5px',
                border: '1px solid #DC2626',
                background: '#FEE2E2',
                color: '#991B1B',
                fontSize: 'clamp(8px, 0.95vw, 10px)',
                fontWeight: 800,
                cursor: 'pointer',
              }}
              title="Reset seluruh progres papan ke awal"
            >
              🔄 Reset Semua
            </button>

            <span style={{
              fontSize: 'clamp(7px, 0.85vw, 9px)',
              color: '#78350F',
              fontWeight: 700,
              marginLeft: '2px',
            }}>
              (Hotkey: [1-4], [U], [0])
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      */}

      {/* ── MAIN CONTENT AREA: 3:1 SPLIT (KIRI: ANALISIS, KANAN: KALKULATOR) ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 'clamp(8px, 1.2vw, 16px)',
        flex: 1,
        minHeight: 0,
        position: 'relative',
        zIndex: 5,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
      }}>

        {/* ── BAGIAN KIRI (RASIO 3): DATA 24 BULATAN + INDIKATOR + KARTU TAHAP ── */}
        <div
          className="corkboard-scroll-area"
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(3px, 0.6vh, 6px)',
            minHeight: 0,
            height: '100%',
            overflowY: 'auto',
            paddingRight: '2px',
            paddingBottom: '2px',
            boxSizing: 'border-box',
          }}
        >

          {/* ── TAHAP 1: URUTKAN DATA (50% ATAS / 50% BAWAH) ── */}
          {stage === 'sort' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(4px, 0.7vh, 8px)',
              flex: '1 1 0',
              minHeight: 0,
              height: '100%',
            }}>
              
              {/* BAGIAN ATAS (50%): 24 DATA ACAK POOL */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleDropOnPool}
                style={{
                  flex: '1 1 0',
                  minHeight: 0,
                  position: 'relative',
                  background: 'rgba(54, 32, 20, 0.35)',
                  border: '1.5px dashed rgba(90, 56, 37, 0.65)',
                  borderRadius: 'clamp(8px, 1.2vw, 12px)',
                  padding: 'clamp(4px, 0.7vh, 8px) clamp(8px, 1.2vw, 12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                }}
              >
                {/* Indikator Memegang Angka (Hanya muncul jika sedang hold angka) */}
                {heldToken && (
                  <div
                    data-testid="held-token-banner"
                    style={{
                      position: 'absolute',
                      top: 'clamp(3px, 0.6vh, 6px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'clamp(4px, 0.7vw, 8px)',
                      background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
                      border: '1.5px solid #8C6239',
                      borderRadius: '999px',
                      padding: '1px clamp(8px, 1vw, 12px) 1px 6px',
                      boxShadow: '0 2px 8px rgba(140, 98, 57, 0.35)',
                      whiteSpace: 'nowrap',
                      zIndex: 10,
                    }}
                  >
                    <span style={{ fontSize: 'clamp(11px, 1.3vw, 13px)' }}>✋</span>
                    <span style={{ fontSize: 'clamp(8px, 0.95vw, 10px)', fontWeight: 900, color: '#FEF3C7' }}>
                      Memegang:
                    </span>
                    <div style={{
                      width: 'clamp(18px, 2.2vw, 24px)',
                      height: 'clamp(18px, 2.2vw, 24px)',
                      borderRadius: '50%',
                      background: '#FFFDF7',
                      border: '1.5px solid #8C6239',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'clamp(9.5px, 1.2vw, 12px)',
                      fontWeight: 900,
                      color: '#FEF3C7',
                    }}>
                      {heldToken.token.val}
                    </div>
                    <button
                      data-testid="btn-cancel-hold"
                      onClick={handleCancelHold}
                      style={{
                        padding: '1px 5px',
                        borderRadius: '4px',
                        fontSize: 'clamp(7.5px, 0.85vw, 9px)',
                        fontWeight: 800,
                        cursor: 'pointer',
                        border: '1px solid #8C6239',
                        background: '#F5E8C7',
                        color: '#FEF3C7',
                      }}
                    >
                      ✕ Batal
                    </button>
                  </div>
                )}

                {/* Grid 24 Bulatan Acak (2 baris x 12) - Fills 50% Top cleanly */}
                <div ref={poolGridRef} style={{
                  flex: 1,
                  minHeight: 0,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${poolGrid.cols}, minmax(0, 1fr))`,
                  columnGap: 'clamp(4px, 1.2%, 12px)',
                  justifyItems: 'center',
                  alignItems: 'center',
                  alignContent: 'space-evenly',
                  padding: '2px 0',
                }}>
                  {initialTokens.map((token, idx) => {
                    const isHeld = heldToken?.token.id === token.id
                    const isPlaced = placedTokenIds.has(token.id) && !isHeld
                    return (
                      <div
                        key={token.id}
                        data-testid={`pool-token-${idx}`}
                        draggable={!isPlaced && !isHeld}
                        onDragStart={e => handleDragStartFromPool(e, token.id)}
                        onClick={() => handleTokenClick(token)}
                        style={{
                          position: 'relative',
                          width: poolGrid.size,
                          height: poolGrid.size,
                          maxWidth: '100%',
                          borderRadius: '50%',
                          background: isHeld
                            ? 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #FEF3C7 70%, #FDE68A 100%)'
                            : isPlaced
                            ? 'rgba(0,0,0,0.06)'
                            : 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #F5EFE6 75%, #E2D5C1 100%)',
                          border: isHeld
                            ? '2.5px solid #F59E0B'
                            : isPlaced
                            ? '1.5px dashed rgba(90, 56, 37, 0.35)'
                            : '2px solid #5C4033',
                          boxShadow: isHeld
                            ? '0 0 10px rgba(245, 158, 11, 0.9), 0 2px 4px rgba(0,0,0,0.25)'
                            : isPlaced
                            ? 'none'
                            : '0 2px 4px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: Math.round(poolGrid.size * 0.42),
                          fontWeight: 900,
                          color: isHeld ? '#78350F' : isPlaced ? 'rgba(62, 36, 21, 0.25)' : '#1E1B18',
                          fontFamily: 'var(--font-data)',
                          cursor: isPlaced ? 'default' : isHeld ? 'pointer' : 'grab',
                          transition: 'all 0.15s',
                          transform: isHeld ? 'scale(1.12)' : 'scale(1)',
                          zIndex: isHeld ? 2 : 1,
                        }}
                      >
                        {isPlaced ? '·' : token.val}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* BAGIAN BAWAH (50%): 24 TARGET SLOT URUTAN */}
              <div style={{
                flex: '1 1 0',
                minHeight: 0,
                position: 'relative',
                background: '#FFFDF9',
                border: '1.5px solid rgba(140, 98, 57, 0.45)',
                borderRadius: 'clamp(8px, 1.2vw, 12px)',
                padding: 'clamp(4px, 0.7vh, 8px) clamp(10px, 1.4vw, 16px)',
                boxShadow: '0 6px 18px rgba(0,0,0,0.28)',
                color: '#1E293B',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 'clamp(2px, 0.4vh, 4px)',
                boxSizing: 'border-box',
              }}>
                {renderPushPin(sortIsCorrect ? '#059669' : '#DC2626')}
                {renderCornerBrackets()}

                {/* Fallback hidden check button for automated test suites */}
                <button
                  data-testid="btn-check-sort"
                  onClick={() => validateSlots()}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'auto', width: 1, height: 1, zIndex: -1 }}
                  aria-hidden="true"
                />

                {/* Grid 24 Target Slots (2 baris x 12) - Fills 50% Bottom cleanly */}
                <div ref={slotGridRef} style={{
                  flex: 1,
                  minHeight: 0,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${slotGrid.cols}, minmax(0, 1fr))`,
                  columnGap: 'clamp(4px, 1.2%, 12px)',
                  justifyItems: 'center',
                  alignItems: 'center',
                  alignContent: 'space-evenly',
                  padding: '2px 0',
                }}>
                  {placedSlots.map((token, idx) => {
                    const isOccupied = !!token
                    const isWrong = wrongSlots.has(idx)
                    const isOver = dragOverSlotIdx === idx
                    const isSwitchCandidate = heldToken !== null && isOccupied

                    return (
                      <div
                        key={`slot-${idx}`}
                        data-testid={`target-slot-${idx}`}
                        draggable={isOccupied}
                        onDragStart={e => {
                          if (isOccupied && token) {
                            handleDragStartFromSlot(e, idx, token.id)
                          }
                        }}
                        onDragOver={e => {
                          e.preventDefault()
                          setDragOverSlotIdx(idx)
                        }}
                        onDragLeave={() => {
                          if (dragOverSlotIdx === idx) setDragOverSlotIdx(null)
                        }}
                        onDrop={e => handleDropOnSlot(e, idx)}
                        onClick={() => handleSlotClick(idx)}
                        style={{
                          position: 'relative',
                          width: slotGrid.size,
                          height: slotGrid.size,
                          maxWidth: '100%',
                          borderRadius: '50%',
                          background: isOccupied
                            ? isWrong
                              ? 'radial-gradient(circle at 35% 30%, #FEE2E2 0%, #EF4444 100%)'
                              : sortIsCorrect
                              ? 'radial-gradient(circle at 35% 30%, #A7F3D0 0%, #10B981 100%)'
                              : 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #F5EFE6 75%, #E2D5C1 100%)'
                            : isOver
                            ? 'rgba(56, 189, 248, 0.25)'
                            : heldToken
                            ? 'rgba(254, 240, 138, 0.2)'
                            : 'rgba(241, 245, 249, 0.7)',
                          border: isOccupied
                            ? isWrong
                              ? '2px solid #DC2626'
                              : sortIsCorrect
                              ? '2px solid #047857'
                              : isOver
                              ? '2.5px solid #0284C7'
                              : isSwitchCandidate
                              ? '2px dashed #D97706'
                              : '2px solid #5C4033'
                            : isOver
                            ? '2.5px solid #0284C7'
                            : heldToken
                            ? '1.5px dashed #D97706'
                            : '1.5px dashed #CBD5E1',
                          boxShadow: isOccupied
                            ? isSwitchCandidate
                              ? '0 0 8px rgba(217, 119, 6, 0.6)'
                              : '0 2px 4px rgba(0,0,0,0.2)'
                            : isOver
                            ? '0 0 8px rgba(2, 132, 199, 0.5)'
                            : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: isOccupied ? Math.round(slotGrid.size * 0.42) : Math.round(slotGrid.size * 0.27),
                          fontWeight: 900,
                          color: isOccupied
                            ? isWrong
                              ? '#FFFFFF'
                              : sortIsCorrect
                              ? '#064E3B'
                              : '#1E1B18'
                            : '#94A3B8',
                          fontFamily: 'var(--font-data)',
                          cursor: isOccupied ? 'grab' : heldToken ? 'pointer' : 'default',
                          transition: 'all 0.15s',
                        }}
                      >
                        {isOccupied ? token.val : `#${idx + 1}`}
                        {isOccupied && (
                          <span style={{
                            position: 'absolute',
                            bottom: '-4px',
                            background: isSwitchCandidate
                              ? '#B45309'
                              : isWrong
                              ? '#991B1B'
                              : sortIsCorrect
                              ? '#065F46'
                              : '#475569',
                            color: '#FFFFFF',
                            fontSize: Math.max(7, Math.round(slotGrid.size * 0.17)),
                            fontWeight: 900,
                            padding: '0px 3px',
                            borderRadius: '3px',
                            lineHeight: 1.1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1px',
                          }}>
                            {isSwitchCandidate ? '⇄' : `#${idx + 1}`}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Feedback Error jika belum benar */}

                {sortIsCorrect === false && (
                  <motion.div
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: '#FEF2F2',
                      border: '1.5px solid #EF4444',
                      borderRadius: '5px',
                      padding: 'clamp(2px, 0.4vh, 4px) clamp(6px, 1vw, 10px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 'clamp(10px, 1.2vw, 13px)' }}>⚠️</span>
                    <span style={{ fontSize: 'clamp(8px, 0.95vw, 10px)', fontWeight: 800, color: '#991B1B' }}>
                      {placedTokenIds.size < 24
                        ? 'Isi semua 24 slot terlebih dahulu sebelum diperiksa!'
                        : 'Urutan belum tepat! Periksa angka bertanda merah atau klik untuk switch/tukar.'}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* ── TAHAP 2, 3, 4: DATA TERURUT (50%) & KARTU PENGERJAAN (50%) ── */}
          {stage !== 'sort' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(4px, 0.7vh, 8px)',
              flex: '1 1 0',
              minHeight: 0,
              height: '100%',
            }}>
              {/* BAGIAN ATAS (50%): 24 Bulatan Angka Data Terurut */}
              <div style={{
                flex: '1 1 0',
                minHeight: 0,
                background: 'rgba(54, 32, 20, 0.28)',
                border: '1.5px dashed rgba(90, 56, 37, 0.6)',
                borderRadius: 'clamp(8px, 1.2vw, 12px)',
                padding: 'clamp(4px, 0.7vh, 8px) clamp(8px, 1.2vw, 12px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}>
                {/* 24 Circular Data Tokens Grid - Fills 50% Top cleanly */}
                <div ref={sortedGridRef} style={{
                  flex: 1,
                  minHeight: 0,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${sortedGrid.cols}, minmax(0, 1fr))`,
                  columnGap: 'clamp(4px, 1.2%, 12px)',
                  justifyItems: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                  padding: '2px 0',
                }}>
                  {sortedDataset.map((val, idx) => {
                    const isModeHighlight = stage === 'modus' && modeIsCorrect === true && val === modeVal
                    // Jangan beri tahu nilai tengah sebelum dijawab! Hanya sorot setelah jawaban terkonfirmasi benar
                    const isMedianHighlight = stage === 'median' && medianIsCorrect === true && (idx === 11 || idx === 12)
                    return (
                      <motion.div
                        key={`sorted-${idx}`}
                        layout
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.18, delay: idx * 0.008 }}
                        style={{
                          position: 'relative',
                          width: sortedGrid.size,
                          height: sortedGrid.size,
                          maxWidth: '100%',
                          borderRadius: '50%',
                          background: isModeHighlight
                            ? 'radial-gradient(circle at 35% 30%, #A7F3D0 0%, #10B981 100%)'
                            : isMedianHighlight
                            ? 'radial-gradient(circle at 35% 30%, #FEF08A 0%, #F59E0B 100%)'
                            : 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #F5EFE6 75%, #E2D5C1 100%)',
                          border: isModeHighlight
                            ? '2px solid #047857'
                            : isMedianHighlight
                            ? '2px solid #B45309'
                            : '2px solid #5C4033',
                          boxShadow: (isModeHighlight || isMedianHighlight)
                            ? '0 0 8px rgba(245, 158, 11, 0.6), 0 2px 4px rgba(0,0,0,0.2)'
                            : '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: Math.round(sortedGrid.size * 0.42),
                          fontWeight: 900,
                          color: isModeHighlight ? '#064E3B' : isMedianHighlight ? '#451A03' : '#1E1B18',
                          fontFamily: 'var(--font-data)',
                        }}
                      >
                        {val}
                        {/* Label nomor urut #1 sampai #24 di bawah setiap bulatan data */}
                        <span style={{
                          position: 'absolute',
                          bottom: '-5px',
                          background: isMedianHighlight
                            ? '#B45309'
                            : isModeHighlight
                            ? '#065F46'
                            : 'rgba(54, 32, 20, 0.88)',
                          border: '1px solid rgba(140, 98, 57, 0.55)',
                          color: '#FEF3C7',
                          fontSize: Math.max(7, Math.round(sortedGrid.size * 0.17)),
                          fontWeight: 900,
                          padding: '0px 3px',
                          borderRadius: '3px',
                          lineHeight: 1.1,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                        }}>
                          #{idx + 1}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* BAGIAN BAWAH (50%): Kartu Kertas Tahap Aktif (Modus, Median, Mean) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    flex: '1 1 0',
                    minHeight: 0,
                    position: 'relative',
                    background: '#FFFDF9',
                    border: '1.5px solid rgba(140, 98, 57, 0.45)',
                    borderRadius: 'clamp(8px, 1.2vw, 10px)',
                    padding: 'clamp(5px, 0.8vh, 10px) clamp(10px, 1.4vw, 16px)',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.28)',
                    color: '#1E293B',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 'clamp(3px, 0.5vh, 6px)',
                    boxSizing: 'border-box',
                  }}
                >
                  {renderPushPin(currentStageSolved ? '#059669' : '#DC2626')}
                  {renderCornerBrackets()}

                  {/* TAHAP 2: MODUS */}
                  {stage === 'modus' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(5px, 0.8vh, 8px)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 900, fontFamily: 'monospace', color: '#FFFFFF', background: '#362014', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                            TAHAP 2 DARI 4
                          </span>
                          <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 800, color: '#0284C7', background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.3)', padding: '1px 6px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                            MODUS (NILAI TERBANYAK)
                          </span>
                        </div>
                        <button
                          data-testid="btn-open-tutorial-modus"
                          onClick={() => {
                            setShowTutorialModal(true)
                            gameAudio.playClick()
                          }}
                          style={{
                            background: 'rgba(2, 132, 199, 0.1)',
                            border: '1px solid rgba(2, 132, 199, 0.35)',
                            color: '#0284C7',
                            fontSize: 'clamp(8px, 1vw, 9.5px)',
                            fontWeight: 800,
                            cursor: 'pointer',
                            borderRadius: '4px',
                            padding: '1px 7px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <span>💡 Panduan Materi</span>
                        </button>
                      </div>

                      <div>
                        <h4 style={{ margin: '0 0 2px', fontSize: 'clamp(12px, 1.5vw, 14.5px)', fontWeight: 900, color: '#1E1B18' }}>
                          🎯 Tentukan Modus dari 24 Data Terurut di Atas
                        </h4>
                        <p style={{ margin: 0, fontSize: 'clamp(9px, 1.1vw, 11px)', color: '#475569', lineHeight: 1.3 }}>
                          <strong>Modus</strong> adalah nilai yang paling sering muncul. Karena data sudah kamu urutkan dari terkecil ke terbesar, deretan angka yang sama kini berjejer rapat. Perhatikan label nomor urut di bawah setiap angka untuk membantumu menghitung frekuensi. Pilih angka yang paling sering muncul!
                        </p>
                      </div>

                      <motion.div
                        key={shakeMode}
                        animate={modeIsCorrect === false ? { x: [-5, 5, -4, 4, 0] } : {}}
                        transition={{ duration: 0.3 }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'clamp(4px, 0.8vw, 8px)' }}
                      >
                        {modeChoices.map(choice => {
                          const isSelected = selectedMode === choice
                          const isSelectedCorrect = isSelected && modeIsCorrect === true
                          const isSelectedWrong = isSelected && modeIsCorrect === false
                          return (
                            <button
                              key={choice}
                              data-testid={`modus-choice-${choice}`}
                              disabled={modeIsCorrect === true}
                              onClick={() => handleChooseMode(choice)}
                              style={{
                                padding: 'clamp(5px, 0.8vh, 8px) clamp(4px, 0.6vw, 8px)',
                                borderRadius: 'clamp(5px, 0.8vw, 7px)',
                                fontSize: 'clamp(11px, 1.3vw, 13px)',
                                fontWeight: 900,
                                cursor: modeIsCorrect === true ? 'default' : 'pointer',
                                border: isSelectedCorrect
                                  ? '2px solid #059669'
                                  : isSelectedWrong
                                  ? '2px solid #DC2626'
                                  : '1.5px solid #CBD5E1',
                                background: isSelectedCorrect
                                  ? '#D1FAE5'
                                  : isSelectedWrong
                                  ? '#FEE2E2'
                                  : '#F8FAFC',
                                color: isSelectedCorrect ? '#065F46' : isSelectedWrong ? '#991B1B' : '#1E293B',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                transition: 'all 0.15s',
                              }}
                            >
                              Angka {choice} {isSelectedCorrect ? '✓' : isSelectedWrong ? '✕' : ''}
                            </button>
                          )
                        })}
                      </motion.div>

                      {modeIsCorrect === false && (
                        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '5px', padding: 'clamp(4px, 0.6vh, 6px) clamp(6px, 1vw, 10px)', fontSize: 'clamp(9px, 1.1vw, 10.5px)', color: '#991B1B', fontWeight: 700 }}>
                          💡 Belum tepat! Perhatikan deretan data di atas dan hitung angka mana yang kelompoknya paling panjang.
                        </div>
                      )}

                      {modeIsCorrect === true && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: '#D1FAE5', border: '1.5px solid #059669', borderRadius: '6px', padding: 'clamp(4px, 0.7vh, 7px) clamp(8px, 1.2vw, 12px)', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 'clamp(9.5px, 1.1vw, 11.5px)', fontWeight: 900, color: '#065F46' }}>
                            ✓ Benar! Modus data adalah {modeVal} (muncul sebanyak {modeCount} kali).
                          </span>
                          <button
                            data-testid="btn-next-to-median"
                            onClick={() => {
                              setStage('median')
                              gameAudio.playClick()
                            }}
                            style={{
                              padding: 'clamp(4px, 0.7vh, 6px) clamp(10px, 1.4vw, 14px)',
                              borderRadius: '5px',
                              border: 'none',
                              background: '#059669',
                              color: '#FFFFFF',
                              fontSize: 'clamp(10px, 1.2vw, 11.5px)',
                              fontWeight: 900,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.35)',
                            }}
                          >
                            Lanjut ke Tahap 3: Median →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAHAP 3: MEDIAN */}
                  {stage === 'median' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(5px, 0.8vh, 8px)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 900, fontFamily: 'monospace', color: '#FFFFFF', background: '#362014', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                            TAHAP 3 DARI 4
                          </span>
                          <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 800, color: '#D97706', background: 'rgba(217, 119, 6, 0.12)', border: '1px solid rgba(217, 119, 6, 0.35)', padding: '1px 6px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                            MEDIAN (NILAI TENGAH)
                          </span>
                        </div>
                        <button
                          data-testid="btn-open-tutorial-median"
                          onClick={() => {
                            setShowTutorialModal(true)
                            gameAudio.playClick()
                          }}
                          style={{
                            background: 'rgba(217, 119, 6, 0.1)',
                            border: '1px solid rgba(217, 119, 6, 0.35)',
                            color: '#B45309',
                            fontSize: 'clamp(8px, 1vw, 9.5px)',
                            fontWeight: 800,
                            cursor: 'pointer',
                            borderRadius: '4px',
                            padding: '1px 7px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <span>💡 Panduan Materi</span>
                        </button>
                      </div>

                      <div>
                        <h4 style={{ margin: '0 0 2px', fontSize: 'clamp(12px, 1.5vw, 14.5px)', fontWeight: 900, color: '#1E1B18' }}>
                          ⚖️ Tentukan Median dari 24 Data Terurut
                        </h4>
                        <p style={{ margin: 0, fontSize: 'clamp(9px, 1.1vw, 11px)', color: '#475569', lineHeight: 1.3 }}>
                          <strong>Median</strong> adalah nilai tengah dari data yang telah diurutkan. Karena ada <strong>24 data (genap)</strong>, temukan dua nilai tengah pada nomor urut <strong>#12</strong> dan <strong>#13</strong> dengan bantuan label urutan di bawah bulatan, lalu hitung nilai rata-ratanya. Kamu juga bisa memakai kalkulator di sebelah kanan!
                        </p>
                      </div>

                      <motion.div
                        key={shakeMedian}
                        animate={medianIsCorrect === false ? { x: [-5, 5, -4, 4, 0] } : {}}
                        transition={{ duration: 0.3 }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'clamp(4px, 0.8vw, 8px)' }}
                      >
                        {medianChoices.map(choice => {
                          const isSelected = selectedMedian === choice
                          const isSelectedCorrect = isSelected && medianIsCorrect === true
                          const isSelectedWrong = isSelected && medianIsCorrect === false
                          return (
                            <button
                              key={choice}
                              data-testid={`median-choice-${choice}`}
                              disabled={medianIsCorrect === true}
                              onClick={() => handleChooseMedian(choice)}
                              style={{
                                padding: 'clamp(5px, 0.8vh, 8px) clamp(4px, 0.6vw, 8px)',
                                borderRadius: 'clamp(5px, 0.8vw, 7px)',
                                fontSize: 'clamp(11px, 1.3vw, 13px)',
                                fontWeight: 900,
                                cursor: medianIsCorrect === true ? 'default' : 'pointer',
                                border: isSelectedCorrect
                                  ? '2px solid #059669'
                                  : isSelectedWrong
                                  ? '2px solid #DC2626'
                                  : '1.5px solid #CBD5E1',
                                background: isSelectedCorrect
                                  ? '#D1FAE5'
                                  : isSelectedWrong
                                  ? '#FEE2E2'
                                  : '#F8FAFC',
                                color: isSelectedCorrect ? '#065F46' : isSelectedWrong ? '#991B1B' : '#1E293B',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                transition: 'all 0.15s',
                              }}
                            >
                              {choice} {isSelectedCorrect ? '✓' : isSelectedWrong ? '✕' : ''}
                            </button>
                          )
                        })}
                      </motion.div>

                      {medianIsCorrect === false && (
                        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '5px', padding: 'clamp(4px, 0.6vh, 6px) clamp(6px, 1vw, 10px)', fontSize: 'clamp(9px, 1.1vw, 10.5px)', color: '#991B1B', fontWeight: 700 }}>
                          💡 Belum tepat. Cek angka pada bulatan berlabel urutan #12 dan #13, lalu jumlahkan kedua angka tersebut dan bagi 2.
                        </div>
                      )}

                      {medianIsCorrect === true && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: '#D1FAE5', border: '1.5px solid #059669', borderRadius: '6px', padding: 'clamp(4px, 0.7vh, 7px) clamp(8px, 1.2vw, 12px)', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 'clamp(9.5px, 1.1vw, 11.5px)', fontWeight: 900, color: '#065F46' }}>
                            ✓ Tepat! Median data adalah ({mid1Val} + {mid2Val}) ÷ 2 = {medianVal}.
                          </span>
                          <button
                            data-testid="btn-next-to-mean"
                            onClick={() => {
                              setStage('mean')
                              gameAudio.playClick()
                            }}
                            style={{
                              padding: 'clamp(4px, 0.7vh, 6px) clamp(10px, 1.4vw, 14px)',
                              borderRadius: '5px',
                              border: 'none',
                              background: '#059669',
                              color: '#FFFFFF',
                              fontSize: 'clamp(10px, 1.2vw, 11.5px)',
                              fontWeight: 900,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.35)',
                            }}
                          >
                            Lanjut ke Tahap 4: Rata-Rata →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAHAP 4: RATA-RATA */}
                  {stage === 'mean' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(5px, 0.8vh, 8px)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 900, fontFamily: 'monospace', color: '#FFFFFF', background: '#362014', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                            TAHAP 4 DARI 4
                          </span>
                          <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 800, color: '#059669', background: 'rgba(5, 150, 105, 0.12)', border: '1px solid rgba(5, 150, 105, 0.35)', padding: '1px 6px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                            RATA-RATA (MEAN)
                          </span>
                        </div>
                        <button
                          data-testid="btn-open-tutorial-mean"
                          onClick={() => {
                            setShowTutorialModal(true)
                            gameAudio.playClick()
                          }}
                          style={{
                            background: 'rgba(5, 150, 105, 0.1)',
                            border: '1px solid rgba(5, 150, 105, 0.35)',
                            color: '#059669',
                            fontSize: 'clamp(8px, 1vw, 9.5px)',
                            fontWeight: 800,
                            cursor: 'pointer',
                            borderRadius: '4px',
                            padding: '1px 7px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <span>💡 Panduan Materi</span>
                        </button>
                      </div>

                      <div>
                        <h4 style={{ margin: '0 0 2px', fontSize: 'clamp(12px, 1.5vw, 14.5px)', fontWeight: 900, color: '#1E1B18' }}>
                          🧮 Hitung Rata-Rata (Mean) dari 24 Data
                        </h4>
                        <p style={{ margin: 0, fontSize: 'clamp(9px, 1.1vw, 11px)', color: '#475569', lineHeight: 1.3 }}>
                          Jumlah seluruh 24 bulatan angka di atas adalah <strong>Σx = {totalSum}</strong>. Bagi jumlah tersebut dengan banyaknya data (<strong>n = 24</strong>): <strong>x̄ = {totalSum} ÷ 24 = ?</strong> Gunakan kalkulator di samping jika perlu!
                        </p>
                      </div>

                      <motion.div
                        key={shakeMean}
                        animate={meanIsCorrect === false ? { x: [-5, 5, -4, 4, 0] } : {}}
                        transition={{ duration: 0.3 }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'clamp(4px, 0.8vw, 8px)' }}
                      >
                        {meanChoices.map(choice => {
                          const isSelected = selectedMean === choice
                          const isSelectedCorrect = isSelected && meanIsCorrect === true
                          const isSelectedWrong = isSelected && meanIsCorrect === false
                          return (
                            <button
                              key={choice}
                              data-testid={`mean-choice-${choice}`}
                              disabled={meanIsCorrect === true}
                              onClick={() => handleChooseMean(choice)}
                              style={{
                                padding: 'clamp(5px, 0.8vh, 8px) clamp(4px, 0.6vw, 8px)',
                                borderRadius: 'clamp(5px, 0.8vw, 7px)',
                                fontSize: 'clamp(11px, 1.3vw, 13px)',
                                fontWeight: 900,
                                cursor: meanIsCorrect === true ? 'default' : 'pointer',
                                border: isSelectedCorrect
                                  ? '2px solid #059669'
                                  : isSelectedWrong
                                  ? '2px solid #DC2626'
                                  : '1.5px solid #CBD5E1',
                                background: isSelectedCorrect
                                  ? '#D1FAE5'
                                  : isSelectedWrong
                                  ? '#FEE2E2'
                                  : '#F8FAFC',
                                color: isSelectedCorrect ? '#065F46' : isSelectedWrong ? '#991B1B' : '#1E293B',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                transition: 'all 0.15s',
                              }}
                            >
                              {choice} {isSelectedCorrect ? '✓' : isSelectedWrong ? '✕' : ''}
                            </button>
                          )
                        })}
                      </motion.div>

                      {meanIsCorrect === false && (
                        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '5px', padding: 'clamp(4px, 0.6vh, 6px) clamp(6px, 1vw, 10px)', fontSize: 'clamp(9px, 1.1vw, 10.5px)', color: '#991B1B', fontWeight: 700 }}>
                          💡 Kurang tepat! Coba hitung {totalSum} ÷ 24 pada kalkulator di sebelah kanan.
                        </div>
                      )}

                      {meanIsCorrect === true && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: '#D1FAE5', border: '1.5px solid #059669', borderRadius: '6px', padding: 'clamp(4px, 0.7vh, 7px) clamp(8px, 1.2vw, 12px)', flexWrap: 'wrap' }}>
                          <div style={{ fontSize: 'clamp(9.5px, 1.1vw, 11.5px)', fontWeight: 900, color: '#065F46' }}>
                            ✓ Lengkap! Modus = {modeVal} • Median = {medianVal} • Rata-rata = {meanVal}
                          </div>
                          <button
                            data-testid="btn-finish-level1-board"
                            onClick={onProceed}
                            style={{
                              padding: 'clamp(4px, 0.7vh, 7px) clamp(10px, 1.4vw, 15px)',
                              borderRadius: '5px',
                              border: 'none',
                              background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                              color: '#FFFFFF',
                              fontSize: 'clamp(10px, 1.2vw, 11.5px)',
                              fontWeight: 900,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.4)',
                            }}
                          >
                            🏆 SELESAIKAN KASUS #01 →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── BAGIAN KANAN (RASIO 1): TOOLBAR (RESET + INFORMASI) + KALKULATOR MEJA ── */}
        <div style={{
          flex: '0 0 clamp(165px, 24vw, 290px)',
          width: 'clamp(165px, 24vw, 290px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'stretch',
          height: '100%',
          minHeight: 0,
          gap: 'clamp(6px, 1.2vh, 12px)',
        }}>
          {/* Top Bar Di Atas Kalkulator: [🔄 Reset Urutan / Reset Jawaban] */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            flexShrink: 0,
          }}>
            <button
              data-testid="btn-reset-sort"
              onClick={handleReset}
              style={{
                width: '100%',
                padding: 'clamp(3px, 0.5vh, 6px) clamp(8px, 1vw, 12px)',
                borderRadius: '6px',
                fontSize: 'clamp(8.5px, 1.1vw, 11px)',
                fontWeight: 800,
                cursor: 'pointer',
                border: '1.5px solid #CBD5E1',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
              }}
              title="Reset pilihan atau susunan pada tahapan ini"
            >
              <span>🔄</span>
              <span>Reset {stage === 'sort' ? 'Urutan Data' : 'Jawaban'}</span>
            </button>
          </div>

          <DeskCalculator dataset={dataset} />
        </div>

      </div>

      {/* ── POPUP SELESAI TAHAP 1: URUTKAN DATA (POPUP DI TENGAH) ── */}
      <AnimatePresence>
        {stage === 'sort' && sortIsCorrect === true && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 750,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'clamp(16px, 3vw, 28px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              data-testid="sort-success-popup"
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 'clamp(320px, 45vw, 460px)',
                background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
                border: '2.5px solid #F59E0B',
                borderRadius: 'clamp(14px, 2vw, 22px)',
                padding: 'clamp(20px, 3vh, 28px) clamp(18px, 2.5vw, 26px)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 'clamp(10px, 1.8vh, 16px)',
                color: '#FEF3C7',
                boxSizing: 'border-box',
              }}
            >
              {/* Decorative Viewfinder Brackets */}
              <div style={{ position: 'absolute', top: '8px', left: '8px', width: '12px', height: '12px', borderTop: '2.5px solid #F59E0B', borderLeft: '2.5px solid #F59E0B', borderRadius: '2px 0 0 0' }} />
              <div style={{ position: 'absolute', top: '8px', right: '8px', width: '12px', height: '12px', borderTop: '2.5px solid #F59E0B', borderRight: '2.5px solid #F59E0B', borderRadius: '0 2px 0 0' }} />
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '12px', height: '12px', borderBottom: '2.5px solid #F59E0B', borderLeft: '2.5px solid #F59E0B', borderRadius: '0 0 0 2px' }} />
              <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '12px', height: '12px', borderBottom: '2.5px solid #F59E0B', borderRight: '2.5px solid #F59E0B', borderRadius: '0 0 2px 0' }} />

              <button
                data-testid="btn-close-sort-success"
                onClick={() => setSortIsCorrect(null)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '12px',
                  background: 'rgba(140, 98, 57, 0.1)',
                  border: '1px solid rgba(140, 98, 57, 0.3)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  color: '#FEF3C7',
                  fontSize: 'clamp(12px, 1.5vw, 15px)',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  transition: 'all 0.15s',
                }}
                title="Tutup popup untuk melihat hasil urutan"
              >
                ✕
              </button>
              <div style={{
                width: 'clamp(50px, 6vw, 64px)',
                height: 'clamp(50px, 6vw, 64px)',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #FEF08A 0%, #F59E0B 100%)',
                border: '2px solid #B45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(26px, 3.2vw, 34px)',
                boxShadow: '0 4px 14px rgba(180, 83, 9, 0.3)',
              }}>
                🎉
              </div>

              <div>
                <div style={{ fontSize: 'clamp(10px, 1.2vw, 11px)', color: '#9A3412', fontWeight: 900, letterSpacing: '1.5px', marginBottom: '4px', textTransform: 'uppercase' }}>
                  URUTAN DATA SELESAI
                </div>
                <h3 style={{
                  margin: '0 0 6px 0',
                  fontSize: 'clamp(18px, 2.4vw, 24px)',
                  fontWeight: 900,
                  color: '#FEF3C7',
                  letterSpacing: '0.3px',
                }}>
                  Hebat Sekali!
                </h3>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid #F59E0B',
                  borderRadius: '12px',
                  padding: 'clamp(10px, 1.5vh, 14px) clamp(12px, 2vw, 16px)',
                  boxShadow: 'inset 0 1px 3px rgba(140, 98, 57, 0.08)',
                  marginTop: '8px',
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: 'clamp(11.5px, 1.35vw, 13.5px)',
                    color: '#FEF3C7',
                    lineHeight: 1.55,
                  }}>
                    Semua <b>24 data</b> berhasil diurutkan dengan benar dari nilai terkecil ke terbesar (<span style={{ color: '#065F46', fontWeight: 800 }}>{sortedDataset[0]}</span> ➔ <span style={{ color: '#065F46', fontWeight: 800 }}>{sortedDataset[23]}</span>).
                  </p>
                </div>
              </div>

              <button
                data-testid="btn-next-to-modus"
                onClick={() => {
                  setStage('modus')
                  gameAudio.playClick()
                }}
                style={{
                  width: '100%',
                  padding: 'clamp(10px, 1.6vh, 14px) clamp(16px, 2vw, 24px)',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: 'clamp(12px, 1.4vw, 15px)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(14, 131, 136, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span>Lanjut ke Tahap 2: Modus</span>
                <span style={{ fontSize: '1.1em' }}>➔</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📘 MODAL PANDUAN TUTORIAL EDUKASI PER TAHAP */}
      <AnimatePresence>
        {showTutorialModal && STAGE_TUTORIALS[stage] && (
          <StageTutorialModal stage={stage} onClose={handleCloseTutorial} />
        )}
      </AnimatePresence>

    </div>
  )
}