'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store/gameStore'
import BadgeUnlock from '@/app/siswa/game/_components/BadgeUnlock'
import PlayerCharacter from '@/app/siswa/game/_components/PlayerCharacter'
import NPCCharacter from '@/app/siswa/game/_components/NPCCharacter'
import dynamic from 'next/dynamic'
import { distanceTo3DCoord, svgPlayerTo3D, FIELD_HALF_D } from './components/FieldScene3D'
import type { Flag3DData, BallFlight3D, Player3DPos } from './components/FieldScene3D'

// Dynamic import for Three.js scene (client-only, no SSR)
const FieldScene3D = dynamic(() => import('./components/FieldScene3D'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(10,15,26,0.95)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏟️</div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#FBBF24' }}>
          Memuat Lapangan 3D...
        </div>
      </div>
    </div>
  ),
})

// Level 2 data engine
import {
  createThrowSession,
  computeStats,
  validateAnswer,
  formatDistance,
  roundTo2,
} from './data/level2StatData'
import type { ThrowSessionData, StudentThrowData, ComputedStats } from './data/level2StatData'

// Level 2 config
import {
  BRIEFING_DIALOGS,
  DIRA_BRIEFING,
  DATA_COMPLETE_DIALOG,
  MISSION1_INTRO,
  MISSION2_INTRO,
  MISSION3_INTRO,
  TEACHER_NAME,
  TOTAL_STUDENTS,
  createInitialScoring,
  calculateStars,
  generateReportNarrative,
  getDiraClosing,
} from './config/level2Config'
import type {
  Level2State,
  MissionRangePhase,
  MissionQuartilePhase,
  MissionIQRPhase,
  DialogLine,
  HintLevel,
  SessionScoring,
} from './config/level2Config'

// ──────────────────────────────────────────────────────
// CONSTANTS & BADGES
// ──────────────────────────────────────────────────────

const SVG_WIDTH = 1024
const SVG_HEIGHT = 576
const THROW_ORIGIN = { x: 220, y: 440 }
const THROW_LINE_Z_3D = FIELD_HALF_D - 4

const LEVEL2_BADGES = {
  FIELD_MASTER: { id: 'field-master-l2', icon: '🏅', name: 'Ahli Lapangan', desc: 'Menyelesaikan semua misi pengukuran' },
  PERFECT: { id: 'perfect-stats-l2', icon: '🎯', name: 'Statistisi Sempurna', desc: '3 bintang di Level 2' },
  SPEED: { id: 'speed-stats-l2', icon: '⚡', name: 'Pengukur Cepat', desc: 'Selesai di bawah 50% waktu' },
}

// ──────────────────────────────────────────────────────
// AUDIO SYNTHESIS (LEVEL 1 WEB AUDIO SYSTEM)
// ──────────────────────────────────────────────────────

function playSound(type: 'chime' | 'throw' | 'whistle' | 'error') {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    if (type === 'chime') {
      const notes = [523.25, 659.25, 783.99, 1046.5]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.frequency.setValueAtTime(freq, now + i * 0.08)
        gain.gain.setValueAtTime(0.12, now + i * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.08)
        osc.stop(now + i * 0.08 + 0.35)
      })
    } else if (type === 'whistle') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(2200, now)
      osc.frequency.linearRampToValueAtTime(2600, now + 0.1)
      osc.frequency.setValueAtTime(2400, now + 0.15)
      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.42)
    } else if (type === 'throw') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(180, now)
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.25)
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.32)
    } else if (type === 'error') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(140, now)
      osc.frequency.linearRampToValueAtTime(80, now + 0.25)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.3)
    }
  } catch {
    // ignore
  }
}

// ──────────────────────────────────────────────────────
// TYPEWRITER COMPONENT (LEVEL 1 STYLE)
// ──────────────────────────────────────────────────────

function Typewriter({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayedText, setDisplayedText] = useState('')
  const indexRef = useRef(0)

  useEffect(() => {
    setDisplayedText('')
    indexRef.current = 0
    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1))
        indexRef.current++
      } else {
        clearInterval(timer)
        onDone?.()
      }
    }, 20)
    return () => clearInterval(timer)
  }, [text, onDone])

  return (
    <span>
      {displayedText}
      {displayedText.length < text.length && (
        <span style={{ animation: 'blink 0.8s infinite', color: 'var(--astu-gold-bright)', marginLeft: 2 }}>|</span>
      )}
    </span>
  )
}

// ──────────────────────────────────────────────────────
// FIELD POSITION CALCULATOR (SVG COORDINATE SYSTEM)
// ──────────────────────────────────────────────────────
function getFieldCoordinate(distance: number, studentId: number) {
  const normDist = Math.max(10, Math.min(100, distance)) / 100
  // Perspective: 10m is around y=425, 100m is around y=250
  const y = 430 - normDist * 180
  // Horizontal spread across the field lanes (x: 260 to 780)
  const laneIndex = (studentId * 3) % 8
  const x = 260 + (laneIndex / 7) * 480 + normDist * 30
  return { x, y }
}

// ──────────────────────────────────────────────────────
// HINT HELPER
// ──────────────────────────────────────────────────────
function getHint(mission: 1 | 2 | 3, level: HintLevel, stats?: ComputedStats): string {
  if (mission === 1) {
    if (level === 1) return 'Coba perhatikan jarak yang paling kecil dan yang paling besar pada Papan Catatan Lapangan.'
    if (level === 2) return 'Cari nilai maksimum dan minimum terlebih dahulu. Setelah itu, kurangkan nilai minimum dari nilai maksimum.'
    if (level === 3 && stats) return `Nilai terbesarnya adalah ${formatDistance(stats.max)} m, sedangkan nilai terkecilnya ${formatDistance(stats.min)} m. Sekarang hitung ${formatDistance(stats.max)} − ${formatDistance(stats.min)}. Berapa hasilnya?`
  }
  if (mission === 2) {
    if (level === 1) return 'Pastikan kamu mengurutkan berdasarkan jarak lemparan, dari yang terdekat sampai terjauh.'
    if (level === 2) return 'Urutkan semua 15 jarak dari terkecil ke terbesar. Ambil data urutan ke-4 untuk Q1, urutan ke-8 untuk Q2 (median), dan urutan ke-12 untuk Q3.'
    if (level === 3 && stats) return `Setelah diurutkan: urutan ke-4 adalah ${formatDistance(stats.q1)} m, urutan ke-8 adalah ${formatDistance(stats.q2)} m, dan urutan ke-12 adalah ${formatDistance(stats.q3)} m. Masukkan nilai-nilai tersebut.`
  }
  if (mission === 3) {
    if (level === 1) return 'Perhatikan rentang antara posisi tiang Q1 dan tiang Q3.'
    if (level === 2) return 'Jangkauan Kuartil (IQR) diperoleh dengan mengurangkan Q1 dari Q3: IQR = Q3 − Q1.'
    if (level === 3 && stats) return `Kita sudah mendapatkan Q1 = ${formatDistance(stats.q1)} m dan Q3 = ${formatDistance(stats.q3)} m. Sekarang hitung ${formatDistance(stats.q3)} − ${formatDistance(stats.q1)}.`
  }
  return ''
}

// ──────────────────────────────────────────────────────
// PROPS
// ──────────────────────────────────────────────────────
interface Level2MainProps {
  studentId?: string
  studentName?: string
  demoMode?: boolean
}

interface PendingBadge { icon: string; name: string; desc: string; id: string }

// ──────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────
export default function Level2Main({
  studentId,
  studentName = 'Detektif',
  demoMode = false,
}: Level2MainProps) {
  const router = useRouter()
  const {
    addXP,
    completeLevel,
    unlockBadge,
    incrementMistake,
    mistakeCount,
    sessionStartTime,
    isCompleted,
    setVerdict,
  } = useGameStore()

  // ── CORE GAME STATE ───────────────────────────
  const [gameState, setGameState] = useState<Level2State>('LEVEL_START')
  const [session, setSession] = useState<ThrowSessionData | null>(null)
  const [stats, setStats] = useState<ComputedStats | null>(null)
  const [scoring, setScoring] = useState<SessionScoring>(createInitialScoring())
  const [pendingBadges, setPendingBadges] = useState<PendingBadge[]>([])
  const sessionActiveRef = useRef(false)

  // ── PLAYER & TEACHER POSITIONS (SVG PIXELS) ────
  const [playerPos, setPlayerPos] = useState({ x: 300, y: 510 })
  const [playerDir, setPlayerDir] = useState({ x: 0, y: 0 })
  const PAK_BAMBANG_POS = useMemo(() => ({ x: 570, y: 475 }), [])

  // Depth-based sizing exactly like Level 1
  const playerDepth = Math.max(0, Math.min(1, (playerPos.y - 410) / (550 - 410)))
  const playerSize = 140 + playerDepth * 45

  const pakDepth = Math.max(0, Math.min(1, (PAK_BAMBANG_POS.y - 410) / (550 - 410)))
  const pakSize = 145 + pakDepth * 40

  const distToPak = Math.hypot(playerPos.x - PAK_BAMBANG_POS.x, playerPos.y - PAK_BAMBANG_POS.y)
  const isNearPak = distToPak < 140

  // ── DIALOG STATE ─────────────────────────────
  const [dialogIndex, setDialogIndex] = useState(0)
  const [currentDialog, setCurrentDialog] = useState<DialogLine | null>(null)
  const [showDiraBriefing, setShowDiraBriefing] = useState(false)

  // ── COLLECTION STATE ────────────────────────
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null)
  const [throwAnimating, setThrowAnimating] = useState(false)
  const [ballFlightPos, setBallFlightPos] = useState<{ x: number; y: number } | null>(null)
  const [showMeasurePrompt, setShowMeasurePrompt] = useState(false)
  const [justMeasuredId, setJustMeasuredId] = useState<number | null>(null)

  // ── MISSION 1 STATE ─────────────────────────
  const [m1Phase, setM1Phase] = useState<MissionRangePhase>('SELECT_FLAGS')
  const [selectedMinFlag, setSelectedMinFlag] = useState<number | null>(null)
  const [selectedMaxFlag, setSelectedMaxFlag] = useState<number | null>(null)
  const [ribbonPlaced, setRibbonPlaced] = useState(false)
  const [rangeAnswer, setRangeAnswer] = useState('')
  const [rangeError, setRangeError] = useState('')

  // ── MISSION 2 STATE ─────────────────────────
  const [m2Phase, setM2Phase] = useState<MissionQuartilePhase>('SORT_STUDENTS')
  const [sortedSlots, setSortedSlots] = useState<(number | null)[]>(new Array(15).fill(null))
  const [sortError, setSortError] = useState('')
  const [q1Post, setQ1Post] = useState<number | null>(null)
  const [q2Post, setQ2Post] = useState<number | null>(null)
  const [q3Post, setQ3Post] = useState<number | null>(null)
  const [q1Answer, setQ1Answer] = useState('')
  const [q2Answer, setQ2Answer] = useState('')
  const [q3Answer, setQ3Answer] = useState('')
  const [quartileError, setQuartileError] = useState('')

  // ── MISSION 3 STATE ─────────────────────────
  const [m3Phase, setM3Phase] = useState<MissionIQRPhase>('PLACE_RIBBON')
  const [greenRibbonQ1, setGreenRibbonQ1] = useState(false)
  const [greenRibbonQ3, setGreenRibbonQ3] = useState(false)
  const [iqrAnswer, setIqrAnswer] = useState('')
  const [iqrError, setIqrError] = useState('')

  // ── HINT STATE ───────────────────────────────
  const [currentMissionHint, setCurrentMissionHint] = useState<1 | 2 | 3>(1)
  const [hintLevel, setHintLevel] = useState<HintLevel>(0)
  const [showHintPanel, setShowHintPanel] = useState(false)

  // ── CAMERA STATE ────────────────────────────
  const [cameraMode, setCameraMode] = useState<'normal' | 'overhead'>('normal')

  // ── FEEDBACK STATE ──────────────────────────
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)
  const feedbackTimer = useRef<NodeJS.Timeout | null>(null)

  // ── LIFECYCLE ────────────────────────────────
  useEffect(() => {
    sessionActiveRef.current = true
    useGameStore.getState().startLevel(2)

    const newSession = createThrowSession()
    setSession(newSession)

    const timer = setTimeout(() => {
      setGameState('MEET_TEACHER')
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // ── FEEDBACK HELPER ──────────────────────────
  const showFeedback = useCallback((msg: string, duration = 2500) => {
    setFeedbackMsg(msg)
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    feedbackTimer.current = setTimeout(() => setFeedbackMsg(null), duration)
  }, [])

  // ── BADGE HELPERS ────────────────────────────
  const awardBadge = useCallback((badge: typeof LEVEL2_BADGES[keyof typeof LEVEL2_BADGES]) => {
    unlockBadge(badge.id)
    setPendingBadges(prev => [...prev, badge])
  }, [unlockBadge])

  const dismissBadge = () => setPendingBadges(prev => prev.slice(1))

  // ── PLAYER MOVEMENT CONTROLS (WASD & ARROWS) ──
  useEffect(() => {
    if (gameState !== 'MEET_TEACHER') return

    const activeKeys = new Set<string>()

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      activeKeys.add(key)

      if (key === 'e' || key === ' ' || key === 'enter') {
        const dist = Math.hypot(playerPos.x - PAK_BAMBANG_POS.x, playerPos.y - PAK_BAMBANG_POS.y)
        if (dist < 140) {
          e.preventDefault()
          handleStartTeacherBriefing()
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      activeKeys.delete(e.key.toLowerCase())
    }

    const moveLoop = setInterval(() => {
      let dx = 0
      let dy = 0
      if (activeKeys.has('arrowup') || activeKeys.has('w')) dy -= 1
      if (activeKeys.has('arrowdown') || activeKeys.has('s')) dy += 1
      if (activeKeys.has('arrowleft') || activeKeys.has('a')) dx -= 1
      if (activeKeys.has('arrowright') || activeKeys.has('d')) dx += 1

      if (dx !== 0 || dy !== 0) {
        setPlayerDir({ x: dx, y: dy })
        setPlayerPos(prev => ({
          x: Math.max(120, Math.min(900, prev.x + dx * 8)),
          y: Math.max(410, Math.min(545, prev.y + dy * 6)),
        }))
      } else {
        setPlayerDir({ x: 0, y: 0 })
      }
    }, 30)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      clearInterval(moveLoop)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState, playerPos, PAK_BAMBANG_POS])

  // Click on SVG world to move
  const handleSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (gameState !== 'MEET_TEACHER') return
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const clickX = ((e.clientX - rect.left) / rect.width) * SVG_WIDTH
    const clickY = ((e.clientY - rect.top) / rect.height) * SVG_HEIGHT

    const targetX = Math.max(120, Math.min(900, clickX))
    const targetY = Math.max(410, Math.min(545, clickY))

    setPlayerDir({ x: targetX > playerPos.x ? 1 : -1, y: targetY > playerPos.y ? 1 : -1 })
    setPlayerPos({ x: targetX, y: targetY })

    if (Math.hypot(targetX - PAK_BAMBANG_POS.x, targetY - PAK_BAMBANG_POS.y) < 140) {
      setTimeout(() => {
        handleStartTeacherBriefing()
      }, 250)
    }
  }, [gameState, playerPos, PAK_BAMBANG_POS])

  // ── TEACHER INTERACTION ──────────────────────
  const handleStartTeacherBriefing = useCallback(() => {
    playSound('chime')
    setPlayerDir({ x: 1, y: 0 })
    setPlayerPos({ x: PAK_BAMBANG_POS.x - 110, y: PAK_BAMBANG_POS.y + 10 })
    setGameState('BRIEFING')
    setDialogIndex(0)
    setCurrentDialog(BRIEFING_DIALOGS[0])
  }, [PAK_BAMBANG_POS])

  // Gathering students
  const handleGatherStudents = useCallback(() => {
    playSound('whistle')
    setShowDiraBriefing(false)
    setCurrentDialog(null)
    setGameState('GATHER_STUDENTS')
    showFeedback('📢 Pak Bambang meniup peluit! 15 Siswa berkumpul di lapangan...', 2800)

    setTimeout(() => {
      setGameState('COLLECTING_DATA')
      showFeedback('👥 15 Siswa siap di Zona Tunggu. Panggil siswa satu per satu!', 3000)
    }, 2000)
  }, [showFeedback])

  const handleDialogNext = useCallback(() => {
    if (gameState === 'BRIEFING') {
      const nextIdx = dialogIndex + 1
      if (nextIdx < BRIEFING_DIALOGS.length) {
        setDialogIndex(nextIdx)
        setCurrentDialog(BRIEFING_DIALOGS[nextIdx])
      } else {
        handleGatherStudents()
      }
    }
  }, [gameState, dialogIndex, handleGatherStudents])

  // Advance dialog on Space / Enter during briefing
  useEffect(() => {
    if (gameState !== 'BRIEFING') return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (dialogIndex >= BRIEFING_DIALOGS.length - 1) {
          handleGatherStudents()
        } else {
          handleDialogNext()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [gameState, dialogIndex, handleDialogNext, handleGatherStudents])

  // ── CALLING & THROWING ONE BY ONE ────────────
  const handleCallStudent = useCallback((studentId: number) => {
    if (!session) return
    const student = session.students.find(s => s.studentId === studentId)
    if (!student || student.measured) return
    if (activeStudentId !== null) return

    setActiveStudentId(studentId)
    setGameState('STUDENT_CALLED')

    setPlayerPos({ x: THROW_ORIGIN.x - 60, y: THROW_ORIGIN.y + 20 })
    showFeedback(`🏃 ${student.studentLabel} melangkah menuju garis lemparan...`, 1500)

    setTimeout(() => {
      setGameState('READY_TO_THROW')
    }, 900)
  }, [session, activeStudentId, showFeedback])

  const handleThrow = useCallback(() => {
    if (!session || activeStudentId === null) return
    const student = session.students.find(s => s.studentId === activeStudentId)
    if (!student) return

    playSound('throw')
    setGameState('THROW_IN_PROGRESS')
    setThrowAnimating(true)

    const targetCoord = getFieldCoordinate(student.distance, student.studentId)
    const startCoord = { x: THROW_ORIGIN.x + 20, y: THROW_ORIGIN.y - 20 }

    setBallFlightPos(startCoord)
    const startTime = Date.now()
    const flightDuration = 1400

    const animInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / flightDuration)

      const curX = startCoord.x + (targetCoord.x - startCoord.x) * progress
      const baseY = startCoord.y + (targetCoord.y - startCoord.y) * progress
      const arcHeight = Math.sin(progress * Math.PI) * 110
      const curY = baseY - arcHeight

      setBallFlightPos({ x: curX, y: curY })

      if (progress >= 1) {
        clearInterval(animInterval)
        setThrowAnimating(false)
        setBallFlightPos(targetCoord)
        setGameState('LOCATING_LANDING_POINT')
        showFeedback(`⚾ Bola mendarat! Berlari menghampiri titik jatuh bendera...`, 2000)

        setTimeout(() => {
          setPlayerPos({ x: Math.max(120, targetCoord.x - 45), y: targetCoord.y + 20 })
          setShowMeasurePrompt(true)
          setGameState('MEASURING_DISTANCE')
        }, 1100)
      }
    }, 30)
  }, [session, activeStudentId, showFeedback])

  const handleMeasure = useCallback(() => {
    if (!session || activeStudentId === null) return

    playSound('chime')
    setShowMeasurePrompt(false)
    setGameState('SAVING_MEASUREMENT')

    const updatedStudents = session.students.map(s =>
      s.studentId === activeStudentId ? { ...s, measured: true } : s
    )
    const newMeasuredCount = updatedStudents.filter(s => s.measured).length

    const updatedSession: ThrowSessionData = {
      ...session,
      students: updatedStudents,
      measuredCount: newMeasuredCount,
      isComplete: newMeasuredCount >= TOTAL_STUDENTS,
    }

    setSession(updatedSession)
    setJustMeasuredId(activeStudentId)

    const measuredStudent = updatedStudents.find(s => s.studentId === activeStudentId)!
    showFeedback(`✅ ${measuredStudent.studentLabel}: ${formatDistance(measuredStudent.distance)} m tercatat! (${newMeasuredCount}/${TOTAL_STUDENTS})`, 2800)

    setTimeout(() => {
      setActiveStudentId(null)
      setJustMeasuredId(null)
      setBallFlightPos(null)

      if (newMeasuredCount >= TOTAL_STUDENTS) {
        playSound('whistle')
        setGameState('DATA_COLLECTION_COMPLETE')
        setCurrentDialog(DATA_COMPLETE_DIALOG)

        const computed = computeStats(updatedSession)
        setStats(computed)

        setTimeout(() => {
          setCurrentDialog(null)
          setGameState('CAMERA_TRANSITION')
          setCameraMode('overhead')

          setTimeout(() => {
            setGameState('MISSION_RANGE')
            setM1Phase('SELECT_FLAGS')
            setCurrentDialog(MISSION1_INTRO)
            setCurrentMissionHint(1)
            setHintLevel(0)
          }, 2400)
        }, 2800)
      } else {
        setGameState('COLLECTING_DATA')
      }
    }, 1500)
  }, [session, activeStudentId, showFeedback])

  // ── MISSION 1: RANGE ─────────────────────────
  const handleSelectFlag = useCallback((studentId: number, type: 'min' | 'max') => {
    if (!stats || m1Phase !== 'SELECT_FLAGS') return
    if (type === 'min') setSelectedMinFlag(studentId)
    else setSelectedMaxFlag(studentId)
  }, [stats, m1Phase])

  const handleConfirmRibbon = useCallback(() => {
    if (!stats || selectedMinFlag === null || selectedMaxFlag === null) return

    const isMinCorrect = selectedMinFlag === stats.minStudentId
    const isMaxCorrect = selectedMaxFlag === stats.maxStudentId

    if (isMinCorrect && isMaxCorrect) {
      playSound('chime')
      setRibbonPlaced(true)
      setM1Phase('CALCULATE_RANGE')
      showFeedback('✅ Pita merah terpasang dari bendera terdekat ke terjauh! Sekarang hitung jangkauannya.', 3000)
    } else {
      playSound('error')
      setScoring(prev => {
        const updated = { ...prev }
        updated.missions[0] = { ...updated.missions[0], objectErrors: updated.missions[0].objectErrors + 1, firstAttemptCorrect: false }
        return updated
      })
      incrementMistake()

      if (!isMinCorrect && !isMaxCorrect) {
        showFeedback('❌ Kedua bendera belum tepat. Periksa kembali Papan Catatan.', 3000)
      } else if (!isMinCorrect) {
        showFeedback('❌ Bendera jarak terdekat belum benar. Coba periksa lagi.', 3000)
      } else {
        showFeedback('❌ Bendera jarak terjauh belum benar. Coba periksa lagi.', 3000)
      }
      setSelectedMinFlag(null)
      setSelectedMaxFlag(null)
    }
  }, [stats, selectedMinFlag, selectedMaxFlag, showFeedback, incrementMistake])

  const handleSubmitRange = useCallback(() => {
    if (!stats) return

    if (validateAnswer(rangeAnswer, stats.range, 0.02)) {
      playSound('chime')
      setM1Phase('COMPLETE')
      setScoring(prev => {
        const updated = { ...prev }
        updated.missions[0] = { ...updated.missions[0], completed: true }
        return updated
      })
      addXP(20, 'Menyelesaikan Misi 1: Jangkauan', 1)
      showFeedback('🎉 Misi 1 selesai! Perhitungan Jangkauan benar!', 3000)
      setRangeError('')

      setTimeout(() => {
        setGameState('MISSION_QUARTILES')
        setM2Phase('SORT_STUDENTS')
        setCurrentDialog(MISSION2_INTRO)
        setCurrentMissionHint(2)
        setHintLevel(0)
      }, 2500)
    } else {
      playSound('error')
      setRangeError(`Jawaban belum tepat. Jangkauan = Nilai Terbesar − Nilai Terkecil`)
      setScoring(prev => {
        const updated = { ...prev }
        updated.missions[0] = { ...updated.missions[0], answerErrors: updated.missions[0].answerErrors + 1, firstAttemptCorrect: false }
        return updated
      })
      incrementMistake()
    }
  }, [stats, rangeAnswer, showFeedback, addXP, incrementMistake])

  // ── MISSION 2: QUARTILES ─────────────────────
  const handleSortConfirm = useCallback(() => {
    if (!stats || !session) return

    if (sortedSlots.some(s => s === null)) {
      playSound('error')
      setSortError('Semua 15 slot harus diisi terlebih dahulu.')
      return
    }

    const slotDistances = sortedSlots.map(id => {
      const student = session.students.find(s => s.studentId === id)
      return student?.distance ?? 0
    })

    let isCorrect = true
    for (let i = 1; i < slotDistances.length; i++) {
      if (slotDistances[i] < slotDistances[i - 1]) {
        isCorrect = false
        break
      }
      if (slotDistances[i] === slotDistances[i - 1]) {
        const prevId = sortedSlots[i - 1]!
        const currId = sortedSlots[i]!
        if (currId < prevId) {
          isCorrect = false
          break
        }
      }
    }

    if (isCorrect) {
      playSound('chime')
      setM2Phase('PLACE_POSTS')
      setSortError('')
      showFeedback('✅ Urutan data benar! Sekarang pasang tiang kuartil.', 3000)
    } else {
      playSound('error')
      setSortError('Urutan belum tepat. Urutkan berdasarkan jarak lemparan dari terdekat ke terjauh.')
      setScoring(prev => {
        const updated = { ...prev }
        updated.missions[1] = { ...updated.missions[1], objectErrors: updated.missions[1].objectErrors + 1, firstAttemptCorrect: false }
        return updated
      })
      incrementMistake()
    }
  }, [stats, session, sortedSlots, showFeedback, incrementMistake])

  const handlePlacePost = useCallback((position: number, quartile: 'Q1' | 'Q2' | 'Q3') => {
    if (!stats) return
    const correctPos = quartile === 'Q1' ? 4 : quartile === 'Q2' ? 8 : 12

    if (position === correctPos) {
      playSound('chime')
      if (quartile === 'Q1') setQ1Post(position)
      if (quartile === 'Q2') setQ2Post(position)
      if (quartile === 'Q3') setQ3Post(position)
      showFeedback(`✅ Tiang ${quartile} terpasang pada urutan ke-${position}!`, 2000)
    } else {
      playSound('error')
      showFeedback(`❌ Tiang ${quartile} belum tepat. ${quartile} berada pada urutan ke-${correctPos}.`, 3000)
      setScoring(prev => {
        const updated = { ...prev }
        updated.missions[1] = { ...updated.missions[1], objectErrors: updated.missions[1].objectErrors + 1, firstAttemptCorrect: false }
        return updated
      })
      incrementMistake()
    }
  }, [stats, showFeedback, incrementMistake])

  useEffect(() => {
    if (m2Phase === 'PLACE_POSTS' && q1Post !== null && q2Post !== null && q3Post !== null) {
      setTimeout(() => {
        setM2Phase('FILL_VALUES')
        showFeedback('✅ Semua tiang kuartil terpasang! Masukkan nilai jarak Q1, Q2, dan Q3.', 3000)
      }, 1000)
    }
  }, [m2Phase, q1Post, q2Post, q3Post, showFeedback])

  const handleSubmitQuartiles = useCallback(() => {
    if (!stats) return

    const q1Valid = validateAnswer(q1Answer, stats.q1, 0.02)
    const q2Valid = validateAnswer(q2Answer, stats.q2, 0.02)
    const q3Valid = validateAnswer(q3Answer, stats.q3, 0.02)

    if (q1Valid && q2Valid && q3Valid) {
      playSound('chime')
      setM2Phase('COMPLETE')
      setScoring(prev => {
        const updated = { ...prev }
        updated.missions[1] = { ...updated.missions[1], completed: true }
        return updated
      })
      addXP(30, 'Menyelesaikan Misi 2: Kuartil', 2)
      setQuartileError('')
      showFeedback('🎉 Misi 2 selesai! Seluruh nilai kuartil benar!', 3000)

      setTimeout(() => {
        setGameState('MISSION_IQR')
        setM3Phase('PLACE_RIBBON')
        setCurrentDialog(MISSION3_INTRO)
        setCurrentMissionHint(3)
        setHintLevel(0)
      }, 2500)
    } else {
      playSound('error')
      const errs: string[] = []
      if (!q1Valid) errs.push('Q1')
      if (!q2Valid) errs.push('Q2')
      if (!q3Valid) errs.push('Q3')
      setQuartileError(`Nilai ${errs.join(', ')} belum tepat. Q1=urutan ke-4, Q2=urutan ke-8, Q3=urutan ke-12.`)
      setScoring(prev => {
        const updated = { ...prev }
        updated.missions[1] = { ...updated.missions[1], answerErrors: updated.missions[1].answerErrors + 1, firstAttemptCorrect: false }
        return updated
      })
      incrementMistake()
    }
  }, [stats, q1Answer, q2Answer, q3Answer, showFeedback, addXP, incrementMistake])

  // ── MISSION 3: IQR ───────────────────────────
  const handlePlaceGreenRibbon = useCallback((end: 'Q1' | 'Q3') => {
    playSound('chime')
    if (end === 'Q1') setGreenRibbonQ1(true)
    if (end === 'Q3') setGreenRibbonQ3(true)
  }, [])

  useEffect(() => {
    if (m3Phase === 'PLACE_RIBBON' && greenRibbonQ1 && greenRibbonQ3) {
      setTimeout(() => {
        setM3Phase('CALCULATE_IQR')
        showFeedback('✅ Pita hijau terpasang! Sekarang hitung jangkauan kuartil (IQR).', 3000)
      }, 1000)
    }
  }, [m3Phase, greenRibbonQ1, greenRibbonQ3, showFeedback])

  const handleSubmitIQR = useCallback(() => {
    if (!stats) return

    if (validateAnswer(iqrAnswer, stats.iqr, 0.02)) {
      playSound('chime')
      setM3Phase('COMPLETE')
      setScoring(prev => {
        const updated = { ...prev }
        updated.missions[2] = { ...updated.missions[2], completed: true }
        return updated
      })
      addXP(30, 'Menyelesaikan Misi 3: IQR', 3)
      setIqrError('')
      showFeedback('🎉 Misi 3 selesai! Nilai IQR tepat!', 3000)

      setTimeout(() => {
        const finalScoring = { ...scoring }
        finalScoring.missions[2] = { ...finalScoring.missions[2], completed: true }
        finalScoring.stars = calculateStars(finalScoring)
        setScoring(finalScoring)

        awardBadge(LEVEL2_BADGES.FIELD_MASTER)
        if (finalScoring.stars === 3) awardBadge(LEVEL2_BADGES.PERFECT)

        const elapsed = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 600
        if (elapsed < 300) awardBadge(LEVEL2_BADGES.SPEED)

        setVerdict('MEASUREMENT_COMPLETE')
        setGameState('FINAL_REPORT')
      }, 2500)
    } else {
      playSound('error')
      setIqrError('Jawaban belum tepat. IQR = Q3 − Q1')
      setScoring(prev => {
        const updated = { ...prev }
        updated.missions[2] = { ...updated.missions[2], answerErrors: updated.missions[2].answerErrors + 1, firstAttemptCorrect: false }
        return updated
      })
      incrementMistake()
    }
  }, [stats, iqrAnswer, scoring, showFeedback, addXP, incrementMistake, awardBadge, sessionStartTime, setVerdict])

  // ── HINT HANDLER ─────────────────────────────
  const handleRequestHint = useCallback(() => {
    const nextLevel = Math.min(hintLevel + 1, 3) as HintLevel
    setHintLevel(nextLevel)
    setShowHintPanel(true)

    const missionIdx = currentMissionHint - 1
    setScoring(prev => {
      const updated = { ...prev }
      if (nextLevel > updated.missions[missionIdx].hintLevelUsed) {
        updated.missions[missionIdx] = { ...updated.missions[missionIdx], hintLevelUsed: nextLevel as HintLevel }
      }
      return updated
    })
  }, [hintLevel, currentMissionHint])

  // ── COMPLETE & RETRY ─────────────────────────
  const handleComplete = useCallback(() => {
    addXP(20, 'Menyelesaikan Level 2', 4)
    completeLevel(2)
    router.push('/siswa/game/results/2')
  }, [addXP, completeLevel, router])

  const handleRetry = useCallback(() => {
    const newSession = createThrowSession()
    setSession(newSession)
    setStats(null)
    setScoring(createInitialScoring())
    setPendingBadges([])
    setDialogIndex(0)
    setCurrentDialog(null)
    setShowDiraBriefing(false)
    setActiveStudentId(null)
    setThrowAnimating(false)
    setBallFlightPos(null)
    setShowMeasurePrompt(false)
    setJustMeasuredId(null)
    setM1Phase('SELECT_FLAGS')
    setSelectedMinFlag(null)
    setSelectedMaxFlag(null)
    setRibbonPlaced(false)
    setRangeAnswer('')
    setRangeError('')
    setM2Phase('SORT_STUDENTS')
    setSortedSlots(new Array(15).fill(null))
    setSortError('')
    setQ1Post(null)
    setQ2Post(null)
    setQ3Post(null)
    setQ1Answer('')
    setQ2Answer('')
    setQ3Answer('')
    setQuartileError('')
    setM3Phase('PLACE_RIBBON')
    setGreenRibbonQ1(false)
    setGreenRibbonQ3(false)
    setIqrAnswer('')
    setIqrError('')
    setHintLevel(0)
    setShowHintPanel(false)
    setCameraMode('normal')
    setFeedbackMsg(null)
    setCurrentMissionHint(1)
    setPlayerPos({ x: 300, y: 510 })

    useGameStore.getState().resetLevel()

    setTimeout(() => {
      useGameStore.getState().startLevel(2)
      setGameState('MEET_TEACHER')
    }, 500)
  }, [])

  // ── Derived data ──────────────────────────────
  const measuredStudents = useMemo(() =>
    session?.students.filter(s => s.measured) ?? [],
  [session])

  const activeStudent = useMemo(() =>
    session?.students.find(s => s.studentId === activeStudentId) ?? null,
  [session, activeStudentId])

  const finalStars = useMemo(() => {
    if (gameState !== 'FINAL_REPORT') return 0
    return scoring.stars
  }, [gameState, scoring.stars])

  // ── 3D Scene Data Computation ─────────────────
  const flags3D = useMemo((): Flag3DData[] => {
    if (!session) return []
    return session.students.filter(s => s.measured).map(s => {
      const coord = distanceTo3DCoord(s.distance, s.studentId, THROW_LINE_Z_3D)
      const isMin = selectedMinFlag === s.studentId
      const isMax = selectedMaxFlag === s.studentId
      const isLockedMin = ribbonPlaced && stats?.minStudentId === s.studentId
      const isLockedMax = ribbonPlaced && stats?.maxStudentId === s.studentId
      const flagColor = isLockedMin || isLockedMax ? '#EF4444' : isMin ? '#38BDF8' : isMax ? '#FBBF24' : '#10B981'

      return {
        studentId: s.studentId,
        studentLabel: s.studentLabel,
        distance: s.distance,
        x: coord.x,
        z: coord.z,
        color: flagColor,
        isMin,
        isMax,
        isLockedMin: isLockedMin || false,
        isLockedMax: isLockedMax || false,
      }
    })
  }, [session, selectedMinFlag, selectedMaxFlag, ribbonPlaced, stats])

  const ballFlight3D = useMemo((): BallFlight3D | null => {
    if (!throwAnimating || !ballFlightPos || !activeStudent) return null
    const startCoord = distanceTo3DCoord(0, activeStudent.studentId, THROW_LINE_Z_3D)
    const endCoord = distanceTo3DCoord(activeStudent.distance, activeStudent.studentId, THROW_LINE_Z_3D)
    const targetCoord = getFieldCoordinate(activeStudent.distance, activeStudent.studentId)
    const startSvg = { x: THROW_ORIGIN.x + 20, y: THROW_ORIGIN.y - 20 }
    const totalDist = Math.hypot(targetCoord.x - startSvg.x, targetCoord.y - startSvg.y)
    const currentDist = Math.hypot(ballFlightPos.x - startSvg.x, ballFlightPos.y - startSvg.y)
    const progress = totalDist > 0 ? Math.min(1, currentDist / totalDist) : 0

    return {
      startX: startCoord.x,
      startZ: THROW_LINE_Z_3D,
      endX: endCoord.x,
      endZ: endCoord.z,
      progress,
    }
  }, [throwAnimating, ballFlightPos, activeStudent])

  const playerPos3D = useMemo((): Player3DPos | null => {
    const p3d = svgPlayerTo3D(playerPos.x, playerPos.y)
    return {
      x: p3d.x,
      z: p3d.z,
      dirX: playerDir.x,
      dirZ: playerDir.y,
    }
  }, [playerPos, playerDir])

  const ribbonLine3D = useMemo(() => {
    if (!ribbonPlaced || !stats) return null
    const minCoord = distanceTo3DCoord(stats.min, stats.minStudentId, THROW_LINE_Z_3D)
    const maxCoord = distanceTo3DCoord(stats.max, stats.maxStudentId, THROW_LINE_Z_3D)
    return {
      startX: minCoord.x,
      startZ: minCoord.z,
      endX: maxCoord.x,
      endZ: maxCoord.z,
      color: '#EF4444',
    }
  }, [ribbonPlaced, stats])

  const greenRibbon3D = useMemo(() => {
    if (!greenRibbonQ1 || !greenRibbonQ3 || !stats) return null
    const q1Student = stats.sortedStudents[3]
    const q3Student = stats.sortedStudents[11]
    if (!q1Student || !q3Student) return null
    const q1Coord = distanceTo3DCoord(q1Student.distance, q1Student.studentId, THROW_LINE_Z_3D)
    const q3Coord = distanceTo3DCoord(q3Student.distance, q3Student.studentId, THROW_LINE_Z_3D)
    return {
      startX: q1Coord.x,
      startZ: q1Coord.z,
      endX: q3Coord.x,
      endZ: q3Coord.z,
    }
  }, [greenRibbonQ1, greenRibbonQ3, stats])

  const handleFieldClick3D = useCallback((worldX: number, worldZ: number) => {
    if (gameState !== 'MEET_TEACHER') return
    // Convert 3D world coords back to SVG coords for game logic
    const svgX = (worldX / (FIELD_HALF_D)) * 390 + 510
    const svgY = Math.max(410, Math.min(545, ((worldZ - (FIELD_HALF_D - 4)) / 8) * (545 - 410) + 410))

    const targetX = Math.max(120, Math.min(900, svgX))
    const targetY = Math.max(410, Math.min(545, svgY))

    setPlayerDir({ x: targetX > playerPos.x ? 1 : -1, y: targetY > playerPos.y ? 1 : -1 })
    setPlayerPos({ x: targetX, y: targetY })

    if (Math.hypot(targetX - PAK_BAMBANG_POS.x, targetY - PAK_BAMBANG_POS.y) < 140) {
      setTimeout(() => {
        handleStartTeacherBriefing()
      }, 250)
    }
  }, [gameState, playerPos, PAK_BAMBANG_POS, handleStartTeacherBriefing])

  // ══════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* ── 3D FIELD SCENE (THREE.JS) ── */}
      <FieldScene3D
        cameraMode={cameraMode}
        flags={flags3D}
        ballFlight={ballFlight3D}
        playerPos={playerPos3D}
        showPlayer={(gameState === 'MEET_TEACHER' || gameState === 'BRIEFING' || gameState === 'COLLECTING_DATA' || gameState === 'STUDENT_CALLED' || gameState === 'READY_TO_THROW' || gameState === 'LOCATING_LANDING_POINT' || gameState === 'MEASURING_DISTANCE' || gameState === 'SAVING_MEASUREMENT')}
        teacherPos={svgPlayerTo3D(PAK_BAMBANG_POS.x, PAK_BAMBANG_POS.y)}
        showTeacher={true}
        ribbonLine={ribbonLine3D}
        greenRibbon={greenRibbon3D}
        throwLineZ={THROW_LINE_Z_3D}
        onFieldClick={gameState === 'MEET_TEACHER' ? handleFieldClick3D : undefined}
      />

      {/* ── SVG OVERLAY FOR CHARACTERS & INTERACTION UI ── */}
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        onClick={handleSvgClick}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          cursor: gameState === 'MEET_TEACHER' ? 'crosshair' : 'default',
          pointerEvents: gameState === 'MEET_TEACHER' ? 'auto' : 'none',
          zIndex: 2,
        }}
      >
        {/* 1. Pak Bambang Teacher NPC (Level 1 NPCCharacter) */}
        <NPCCharacter
          x={PAK_BAMBANG_POS.x}
          y={PAK_BAMBANG_POS.y}
          size={pakSize}
          aspectRatio={2.068}
          label="Pak Bambang"
          spriteUrl="/Assets/Building/Ruang VII-B/Pak Bambang.png"
          cols={1}
          rows={1}
          totalFrames={1}
          glowColor="#FBBF24"
          showGlow={isNearPak && gameState === 'MEET_TEACHER'}
          onClick={handleStartTeacherBriefing}
        />

        {/* Waypoint Arrow towards Pak Bambang (Level 1 style) */}
        {!isNearPak && gameState === 'MEET_TEACHER' && (
          <g key="waypoint-pak" style={{ pointerEvents: 'none' }}>
            <circle
              cx={PAK_BAMBANG_POS.x}
              cy={PAK_BAMBANG_POS.y - pakSize * 1.15}
              r={16}
              fill="rgba(251, 191, 36, 0.25)"
              stroke="#FBBF24"
              strokeWidth={2}
            />
            <text
              x={PAK_BAMBANG_POS.x}
              y={PAK_BAMBANG_POS.y - pakSize * 1.15 + 6}
              textAnchor="middle"
              fill="#FBBF24"
              fontSize={18}
              fontWeight="900"
            >
              ↓
            </text>
            <rect
              x={PAK_BAMBANG_POS.x - 75}
              y={PAK_BAMBANG_POS.y - pakSize * 1.15 - 28}
              width={150}
              height={22}
              rx={11}
              fill="rgba(15, 23, 42, 0.92)"
              stroke="#FBBF24"
              strokeWidth={1.5}
            />
            <text
              x={PAK_BAMBANG_POS.x}
              y={PAK_BAMBANG_POS.y - pakSize * 1.15 - 13}
              textAnchor="middle"
              fill="#FCD34D"
              fontSize={10}
              fontWeight="900"
              fontFamily="var(--font-ui)"
              letterSpacing="0.5px"
            >
              TEMUI PAK BAMBANG
            </text>
          </g>
        )}

        {/* Floating Interaction Speech Bubble over Pak Bambang */}
        {isNearPak && gameState === 'MEET_TEACHER' && (
          <g
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onClick={e => {
              e.stopPropagation()
              handleStartTeacherBriefing()
            }}
          >
            <rect
              x={PAK_BAMBANG_POS.x - 105}
              y={PAK_BAMBANG_POS.y - pakSize * 1.12}
              width={210}
              height={38}
              rx={8}
              fill="rgba(12, 26, 42, 0.95)"
              stroke="#FBBF24"
              strokeWidth={2}
              style={{ filter: 'drop-shadow(0 4px 12px rgba(245, 158, 11, 0.5))' }}
            />
            <polygon
              points={`${PAK_BAMBANG_POS.x - 8},${PAK_BAMBANG_POS.y - pakSize * 1.12 + 38} ${PAK_BAMBANG_POS.x + 8},${PAK_BAMBANG_POS.y - pakSize * 1.12 + 38} ${PAK_BAMBANG_POS.x},${PAK_BAMBANG_POS.y - pakSize * 1.12 + 46}`}
              fill="rgba(12, 26, 42, 0.95)"
              stroke="#FBBF24"
              strokeWidth={1}
            />
            <text
              x={PAK_BAMBANG_POS.x}
              y={PAK_BAMBANG_POS.y - pakSize * 1.12 + 16}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize={11}
              fontWeight="800"
              fontFamily="var(--font-ui)"
            >
              👨‍🏫 Pak Bambang (Wali Kelas VII-B)
            </text>
            <text
              x={PAK_BAMBANG_POS.x}
              y={PAK_BAMBANG_POS.y - pakSize * 1.12 + 30}
              textAnchor="middle"
              fill="#FCD34D"
              fontSize={10}
              fontWeight="700"
              fontFamily="var(--font-ui)"
            >
              💬 Klik / Tekan [ E ] untuk Bicara
            </text>
          </g>
        )}

        {/* In-game Cutscene Speech Bubble during BRIEFING */}
        {gameState === 'BRIEFING' && currentDialog && (
          currentDialog.speaker === 'teacher' ? (
            <g style={{ pointerEvents: 'none' }}>
              <rect
                x={PAK_BAMBANG_POS.x - 115}
                y={PAK_BAMBANG_POS.y - pakSize * 1.14}
                width={230}
                height={38}
                rx={10}
                fill="rgba(15, 35, 56, 0.96)"
                stroke="#F59E0B"
                strokeWidth={2}
                style={{ filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.7))' }}
              />
              <polygon
                points={`${PAK_BAMBANG_POS.x - 8},${PAK_BAMBANG_POS.y - pakSize * 1.14 + 38} ${PAK_BAMBANG_POS.x + 8},${PAK_BAMBANG_POS.y - pakSize * 1.14 + 38} ${PAK_BAMBANG_POS.x},${PAK_BAMBANG_POS.y - pakSize * 1.14 + 46}`}
                fill="rgba(15, 35, 56, 0.96)"
                stroke="#F59E0B"
                strokeWidth={1}
              />
              <text x={PAK_BAMBANG_POS.x} y={PAK_BAMBANG_POS.y - pakSize * 1.14 + 23} textAnchor="middle" fill="#FCD34D" fontSize={11} fontWeight="900" fontFamily="var(--font-ui)">
                👨‍🏫 Pak Bambang sedang berbicara...
              </text>
            </g>
          ) : currentDialog.speaker === 'player' ? (
            <g style={{ pointerEvents: 'none' }}>
              <rect
                x={playerPos.x - 105}
                y={playerPos.y - playerSize * 1.05}
                width={210}
                height={38}
                rx={10}
                fill="rgba(15, 35, 56, 0.96)"
                stroke="#38BDF8"
                strokeWidth={2}
                style={{ filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.7))' }}
              />
              <polygon
                points={`${playerPos.x - 8},${playerPos.y - playerSize * 1.05 + 38} ${playerPos.x + 8},${playerPos.y - playerSize * 1.05 + 38} ${playerPos.x},${playerPos.y - playerSize * 1.05 + 46}`}
                fill="rgba(15, 35, 56, 0.96)"
                stroke="#38BDF8"
                strokeWidth={1}
              />
              <text x={playerPos.x} y={playerPos.y - playerSize * 1.05 + 23} textAnchor="middle" fill="#38BDF8" fontSize={11} fontWeight="900" fontFamily="var(--font-ui)">
                🏃 Stevunt sedang berbicara...
              </text>
            </g>
          ) : null
        )}

        {/* 2. Player Character (Stevunt) (Level 1 PlayerCharacter) */}
        {(gameState === 'MEET_TEACHER' || gameState === 'BRIEFING' || gameState === 'COLLECTING_DATA' || gameState === 'STUDENT_CALLED' || gameState === 'READY_TO_THROW' || gameState === 'LOCATING_LANDING_POINT' || gameState === 'MEASURING_DISTANCE' || gameState === 'SAVING_MEASUREMENT') && (
          <PlayerCharacter
            x={playerPos.x}
            y={playerPos.y}
            dir={playerDir}
            size={playerSize}
            label={studentName || 'Detektif'}
            glowColor="#00ADB5"
          />
        )}

        {/* 3. Active Student at the Throw Line */}
        {activeStudent && (gameState === 'STUDENT_CALLED' || gameState === 'READY_TO_THROW' || gameState === 'THROW_IN_PROGRESS') && (
          <g transform={`translate(${THROW_ORIGIN.x}, ${THROW_ORIGIN.y})`}>
            <ellipse cx={0} cy={0} rx={16} ry={6} fill="rgba(0,0,0,0.5)" />
            <foreignObject x={-22} y={-54} width={44} height={54} style={{ overflow: 'visible' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #FBBF24',
                background: 'rgba(15,23,42,0.9)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
              }}>
                <img
                  src="/teen_silhouette.png"
                  alt="Siswa"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </foreignObject>
            <rect x={-40} y={-68} width={80} height={14} rx={7} fill="rgba(15,23,42,0.9)" stroke="#FBBF24" strokeWidth={1} />
            <text x={0} y={-58} textAnchor="middle" fill="#FBBF24" fontSize={9} fontWeight="900" fontFamily="var(--font-data)">
              {activeStudent.studentLabel}
            </text>
          </g>
        )}
      </svg>

      {/* ── LEVEL 1 HUD TOP BAR ── */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 120, display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'none' }}>
        <div className="astu-dialogue-card" style={{ padding: '6px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'auto' }}>
          <span className="astu-name-badge" style={{ fontSize: 10, padding: '2px 8px' }}>
            🏟️ LAPANGAN SEKOLAH
          </span>
          <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.2)' }} />
          <span style={{ fontSize: 11.5, fontWeight: 900, color: 'var(--astu-gold-bright)', fontFamily: 'var(--font-data)' }}>
            DATA LEMPARAN: {session?.measuredCount ?? 0} / {TOTAL_STUDENTS}
          </span>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 120, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          className="astu-menu-btn astu-menu-btn-gold"
          style={{ padding: '6px 14px', fontSize: 11.5 }}
          onClick={() => setShowHintPanel(true)}
        >
          📜 Panduan Misi ({session?.measuredCount ?? 0}/{TOTAL_STUDENTS}) ►
        </button>
      </div>

      {/* ── QUEST BANNER (MEET_TEACHER) ── */}
      {gameState === 'MEET_TEACHER' && (
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            position: 'absolute',
            top: '64px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 150,
            background: 'var(--astu-card-bg)',
            border: '1.5px solid var(--astu-gold)',
            boxShadow: 'var(--astu-gold-glow)',
            borderRadius: '24px',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ fontSize: '20px' }}>📍</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 900, color: 'var(--astu-gold-bright)' }}>
              Misi: Temui Pak Bambang di Dekat Tiang Bendera
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              Gunakan tombol panah / WASD / klik Pak Bambang untuk mendekat.
            </div>
          </div>
          {isNearPak && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartTeacherBriefing}
              className="astu-menu-btn astu-menu-btn-gold"
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              Bicara 💬
            </motion.button>
          )}
        </motion.div>
      )}

      {/* ── GATHER STUDENTS CINEMATIC BANNER ── */}
      <AnimatePresence>
        {gameState === 'GATHER_STUDENTS' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 300,
              background: 'var(--astu-card-bg)',
              border: '2px solid var(--astu-gold)',
              borderRadius: '18px',
              padding: '24px 36px',
              textAlign: 'center',
              boxShadow: 'var(--astu-pixel-shadow)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ fontSize: '44px', marginBottom: '8px' }}>📢 🏃‍♂️🏃‍♀️</div>
            <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 900, color: 'var(--astu-gold-bright)' }}>
              Siswa Berkumpul di Lapangan!
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#E2E8F0', lineHeight: 1.6 }}>
              Pak Bambang telah mengumpulkan 15 siswa di pinggir lapangan.<br />
              Mari kita panggil mereka satu per satu ke garis lemparan!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DATA COLLECTION HUD & SIDEBAR ── */}
      {(gameState === 'COLLECTING_DATA' || gameState === 'STUDENT_CALLED' || gameState === 'READY_TO_THROW' || gameState === 'THROW_IN_PROGRESS' || gameState === 'LOCATING_LANDING_POINT' || gameState === 'MEASURING_DISTANCE' || gameState === 'SAVING_MEASUREMENT') && session && (
        <div style={{
          position: 'absolute',
          inset: '12px',
          top: '64px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          pointerEvents: 'none',
          gap: '8px',
        }}>
          {/* Middle: Waiting list (left) & Throw controls (center) */}
          <div style={{ flex: 1, display: 'flex', gap: '10px', minHeight: 0 }}>
            {/* Siswa Waiting Zone with Level 1 /teen_silhouette.png */}
            <div className="astu-dialogue-card" style={{
              width: '230px',
              borderRadius: '14px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              pointerEvents: 'auto',
              overflowY: 'auto',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--astu-gold-bright)', letterSpacing: '1px', marginBottom: '4px' }}>
                🏫 ZONA SISWA ({TOTAL_STUDENTS} SISWA)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {session.students.map(student => {
                  const isMeasured = student.measured
                  const isActive = student.studentId === activeStudentId
                  const status = isMeasured ? 'Selesai' : isActive ? 'Siap Lempar' : 'Menunggu'
                  const statusColor = isMeasured ? 'var(--astu-emerald)' : isActive ? 'var(--astu-gold-bright)' : '#64748B'

                  return (
                    <motion.button
                      key={student.studentId}
                      whileHover={!isMeasured && !isActive ? { scale: 1.02 } : {}}
                      whileTap={!isMeasured && !isActive ? { scale: 0.98 } : {}}
                      onClick={() => !isMeasured && !isActive && activeStudentId === null && handleCallStudent(student.studentId)}
                      disabled={isMeasured || isActive || activeStudentId !== null}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        borderRadius: '8px',
                        background: isActive ? 'rgba(245,158,11,0.2)' : isMeasured ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isActive ? 'var(--astu-gold)' : isMeasured ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        cursor: isMeasured || isActive || activeStudentId !== null ? 'default' : 'pointer',
                        opacity: isMeasured ? 0.65 : 1,
                        color: '#F8FAFC',
                        fontSize: '11px',
                        fontWeight: 700,
                        textAlign: 'left',
                      }}
                    >
                      <img
                        src="/teen_silhouette.png"
                        alt="Siswa"
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.studentLabel}</div>
                        <div style={{ fontSize: '9px', color: statusColor }}>{status}</div>
                      </div>
                      {isMeasured && (
                        <span style={{ fontSize: '10px', color: 'var(--astu-emerald)', fontFamily: 'var(--font-data)' }}>
                          {formatDistance(student.distance)}m
                        </span>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Action Card overlay (Center-right) */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Ready to throw card */}
              {gameState === 'READY_TO_THROW' && activeStudent && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="astu-dialogue-card"
                  style={{
                    borderRadius: '16px',
                    padding: '20px 32px',
                    textAlign: 'center',
                    pointerEvents: 'auto',
                    border: '2px solid var(--astu-gold)',
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎯</div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 900, color: 'var(--astu-gold-bright)' }}>
                    {activeStudent.studentLabel} siap di garis lempar!
                  </h3>
                  <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#94A3B8' }}>
                    Klik tombol untuk melakukan lemparan ke arah lapangan.
                  </p>
                  <motion.button
                    className="astu-menu-btn astu-menu-btn-gold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleThrow}
                    style={{
                      padding: '12px 28px',
                      fontSize: '15px',
                      borderRadius: '12px',
                    }}
                  >
                    🎯 Siap, Lempar!
                  </motion.button>
                </motion.div>
              )}

              {/* Measuring Distance prompt */}
              {gameState === 'MEASURING_DISTANCE' && showMeasurePrompt && activeStudent && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="astu-dialogue-card"
                  style={{
                    borderRadius: '16px',
                    padding: '20px 32px',
                    textAlign: 'center',
                    pointerEvents: 'auto',
                    border: '2px solid var(--astu-emerald)',
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>🚩 📏</div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 900, color: '#F8FAFC' }}>
                    Titik Jatuh {activeStudent.studentLabel}
                  </h3>
                  <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#94A3B8' }}>
                    Bentangkan meteran dari garis lempar untuk mengukur jarak akurat.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMeasure}
                    style={{
                      padding: '12px 28px',
                      fontSize: '15px',
                      fontWeight: 900,
                      borderRadius: '12px',
                      background: 'var(--astu-emerald)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    📏 Ukur Jarak Lemparan
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Bottom Papan Catatan Lapangan */}
          {measuredStudents.length > 0 && (
            <div style={{ pointerEvents: 'auto' }}>
              <PapanHasil students={measuredStudents} />
            </div>
          )}
        </div>
      )}

      {/* ── MISSION 1: RANGE ── */}
      {gameState === 'MISSION_RANGE' && stats && session && (
        <div style={{
          position: 'absolute',
          inset: '12px',
          top: '64px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          gap: '10px',
          overflowY: 'auto',
        }}>
          <MissionHeader
            title="Misi 1: Jangkauan (Range)"
            subtitle="Pilih bendera terdekat (MIN) dan terjauh (MAX), lalu hitung jangkauannya."
            icon="📏"
            phase={m1Phase === 'SELECT_FLAGS' ? 'A' : m1Phase === 'CALCULATE_RANGE' ? 'B' : '✅'}
          />

          <div className="astu-dialogue-card" style={{ padding: '14px', borderRadius: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--astu-gold-bright)', letterSpacing: '1px', marginBottom: '8px' }}>
              🚩 15 BENDERA DATA LAPANGAN
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
              {session.students.map(student => {
                const isMin = selectedMinFlag === student.studentId
                const isMax = selectedMaxFlag === student.studentId
                const isLockedMin = ribbonPlaced && student.studentId === stats.minStudentId
                const isLockedMax = ribbonPlaced && student.studentId === stats.maxStudentId

                return (
                  <motion.button
                    key={student.studentId}
                    whileHover={m1Phase === 'SELECT_FLAGS' ? { scale: 1.04 } : {}}
                    whileTap={m1Phase === 'SELECT_FLAGS' ? { scale: 0.96 } : {}}
                    onClick={() => {
                      if (m1Phase !== 'SELECT_FLAGS') return
                      if (selectedMinFlag === student.studentId) setSelectedMinFlag(null)
                      else if (selectedMaxFlag === student.studentId) setSelectedMaxFlag(null)
                      else if (selectedMinFlag === null) handleSelectFlag(student.studentId, 'min')
                      else if (selectedMaxFlag === null) handleSelectFlag(student.studentId, 'max')
                    }}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '10px',
                      textAlign: 'center',
                      background: isLockedMin || isLockedMax ? 'rgba(239,68,68,0.25)' : isMin ? 'rgba(56,189,248,0.2)' : isMax ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)',
                      border: `1.5px solid ${isLockedMin || isLockedMax ? '#EF4444' : isMin ? '#38BDF8' : isMax ? '#FBBF24' : 'rgba(255,255,255,0.12)'}`,
                      color: '#F8FAFC',
                      cursor: m1Phase === 'SELECT_FLAGS' ? 'pointer' : 'default',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    <div style={{ fontSize: '16px' }}>🚩</div>
                    <div>{student.studentLabel.replace('Siswa ', 'S')}</div>
                    <div style={{ fontSize: '9px', color: '#94A3B8', fontFamily: 'var(--font-data)' }}>
                      {formatDistance(student.distance)}m
                    </div>
                    {isMin && <div style={{ fontSize: '8px', color: '#38BDF8', fontWeight: 900 }}>MIN</div>}
                    {isMax && <div style={{ fontSize: '8px', color: '#FBBF24', fontWeight: 900 }}>MAX</div>}
                    {(isLockedMin || isLockedMax) && <div style={{ fontSize: '8px', color: '#EF4444', fontWeight: 900 }}>🎗️ PITA</div>}
                  </motion.button>
                )
              })}
            </div>

            {m1Phase === 'SELECT_FLAGS' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '12px', color: '#CBD5E1' }}>
                  {selectedMinFlag === null && selectedMaxFlag === null ? 'Pilih bendera MIN (terdekat), lalu MAX (terjauh)' :
                   selectedMinFlag !== null && selectedMaxFlag === null ? '✅ MIN dipilih. Sekarang pilih MAX (terjauh)' :
                   '✅ Bendera MIN & MAX siap dipasangkan pita.'}
                </span>
                {selectedMinFlag !== null && selectedMaxFlag !== null && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirmRibbon}
                    style={{
                      padding: '8px 20px',
                      fontSize: '12px',
                      fontWeight: 900,
                      borderRadius: '10px',
                      background: '#EF4444',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    🎗️ Pasang Pita Merah
                  </motion.button>
                )}
              </div>
            )}
          </div>

          {/* Calculate Range Form */}
          {m1Phase === 'CALCULATE_RANGE' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="astu-dialogue-card"
              style={{ padding: '16px', borderRadius: '14px', border: '1.5px solid rgba(239,68,68,0.4)' }}
            >
              <div style={{ fontSize: '12px', fontWeight: 900, color: '#EF4444', letterSpacing: '1px', marginBottom: '12px' }}>
                🎗️ PERHITUNGAN JANGKAUAN (RANGE)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <div style={{ padding: '8px 16px', background: 'rgba(56,189,248,0.15)', borderRadius: '10px', border: '1px solid #38BDF8' }}>
                  <div style={{ fontSize: '9px', color: '#38BDF8', fontWeight: 800 }}>JARAK TERPENDEK (MIN)</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#38BDF8', fontFamily: 'var(--font-data)' }}>{formatDistance(stats.min)} m</div>
                </div>
                <span style={{ fontSize: '20px', color: '#94A3B8' }}>→</span>
                <div style={{ padding: '8px 16px', background: 'rgba(251,191,36,0.15)', borderRadius: '10px', border: '1px solid #FBBF24' }}>
                  <div style={{ fontSize: '9px', color: '#FBBF24', fontWeight: 800 }}>JARAK TERJAUH (MAX)</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-data)' }}>{formatDistance(stats.max)} m</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#F8FAFC', fontWeight: 700 }}>Jangkauan =</span>
                <input
                  type="text"
                  value={rangeAnswer}
                  onChange={e => { setRangeAnswer(e.target.value); setRangeError('') }}
                  placeholder="0.00"
                  style={{
                    flex: 1,
                    maxWidth: '180px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: '#F8FAFC',
                    fontSize: '16px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-data)',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>m</span>
                <motion.button
                  className="astu-menu-btn astu-menu-btn-gold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmitRange}
                  style={{ padding: '10px 22px', fontSize: '13px', borderRadius: '10px' }}
                >
                  Periksa ✓
                </motion.button>
              </div>
              {rangeError && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#EF4444', fontWeight: 700 }}>{rangeError}</p>}
            </motion.div>
          )}

          <PapanHasil students={session.students.filter(s => s.measured)} />
        </div>
      )}

      {/* ── MISSION 2: QUARTILES ── */}
      {gameState === 'MISSION_QUARTILES' && stats && session && (
        <div style={{
          position: 'absolute',
          inset: '12px',
          top: '64px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          gap: '10px',
          overflowY: 'auto',
        }}>
          <MissionHeader
            title="Misi 2: Kuartil (Q1, Q2, Q3)"
            subtitle="Urutkan data lemparan, tempatkan tiang kuartil, dan isi nilainya."
            icon="📊"
            phase={m2Phase === 'SORT_STUDENTS' ? 'A' : m2Phase === 'PLACE_POSTS' ? 'B' : m2Phase === 'FILL_VALUES' ? 'C' : '✅'}
          />

          {m2Phase === 'SORT_STUDENTS' && (
            <SortingPhase
              students={session.students.filter(s => s.measured)}
              sortedSlots={sortedSlots}
              onUpdateSlots={setSortedSlots}
              onConfirm={handleSortConfirm}
              error={sortError}
            />
          )}

          {m2Phase === 'PLACE_POSTS' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="astu-dialogue-card"
              style={{ padding: '16px', borderRadius: '14px', border: '1.5px solid rgba(139,92,246,0.3)' }}
            >
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#8B5CF6', letterSpacing: '1px', marginBottom: '8px' }}>
                🏗️ TEMPATKAN TIANG KUARTIL PADA URUTAN DATA
              </div>
              <p style={{ fontSize: '12px', color: '#CBD5E1', margin: '0 0 12px' }}>
                Pasang tiang Q1 (urutan ke-4), Q2 (urutan ke-8 / median), dan Q3 (urutan ke-12).
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '12px' }}>
                {Array.from({ length: 15 }, (_, i) => {
                  const pos = i + 1
                  const isQ1 = q1Post === pos
                  const isQ2 = q2Post === pos
                  const isQ3 = q3Post === pos
                  const student = stats.sortedStudents[i]

                  return (
                    <div key={pos} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        background: isQ1 ? 'rgba(56,189,248,0.25)' : isQ2 ? 'rgba(16,185,129,0.25)' : isQ3 ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.06)',
                        border: `1.5px solid ${isQ1 ? '#38BDF8' : isQ2 ? '#10B981' : isQ3 ? '#FBBF24' : 'rgba(255,255,255,0.12)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 900,
                        color: '#F8FAFC',
                      }}>
                        {isQ1 ? 'Q1' : isQ2 ? 'Q2' : isQ3 ? 'Q3' : pos}
                      </div>
                      <span style={{ fontSize: '9px', color: '#94A3B8', fontFamily: 'var(--font-data)' }}>
                        {student ? formatDistance(student.distance) : ''}
                      </span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {q1Post === null && (
                          <button onClick={() => handlePlacePost(pos, 'Q1')}
                            style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '4px', background: 'rgba(56,189,248,0.15)', border: '1px solid #38BDF8', color: '#38BDF8', cursor: 'pointer', fontWeight: 800 }}>
                            Q1
                          </button>
                        )}
                        {q1Post !== null && q2Post === null && (
                          <button onClick={() => handlePlacePost(pos, 'Q2')}
                            style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', border: '1px solid #10B981', color: '#10B981', cursor: 'pointer', fontWeight: 800 }}>
                            Q2
                          </button>
                        )}
                        {q1Post !== null && q2Post !== null && q3Post === null && (
                          <button onClick={() => handlePlacePost(pos, 'Q3')}
                            style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '4px', background: 'rgba(251,191,36,0.15)', border: '1px solid #FBBF24', color: '#FBBF24', cursor: 'pointer', fontWeight: 800 }}>
                            Q3
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {m2Phase === 'FILL_VALUES' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="astu-dialogue-card"
              style={{ padding: '16px', borderRadius: '14px', border: '1.5px solid rgba(139,92,246,0.3)' }}
            >
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#8B5CF6', letterSpacing: '1px', marginBottom: '12px' }}>
                📝 MASUKKAN NILAI JARAK KUARTIL (METER)
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {[
                  { label: 'Q1 (Urutan ke-4)', value: q1Answer, onChange: setQ1Answer, color: '#38BDF8' },
                  { label: 'Q2 (Urutan ke-8)', value: q2Answer, onChange: setQ2Answer, color: '#10B981' },
                  { label: 'Q3 (Urutan ke-12)', value: q3Answer, onChange: setQ3Answer, color: '#FBBF24' },
                ].map(q => (
                  <div key={q.label} style={{ flex: 1, minWidth: '130px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: q.color, display: 'block', marginBottom: '4px' }}>{q.label}</label>
                    <input
                      type="text"
                      value={q.value}
                      onChange={e => { q.onChange(e.target.value); setQuartileError('') }}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.08)',
                        border: `1px solid ${q.color}50`,
                        color: '#F8FAFC',
                        fontSize: '15px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-data)',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <motion.button
                  className="astu-menu-btn astu-menu-btn-gold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmitQuartiles}
                  style={{ padding: '10px 24px', fontSize: '13px', borderRadius: '10px' }}
                >
                  Periksa Kuartil ✓
                </motion.button>
              </div>
              {quartileError && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#EF4444', fontWeight: 700 }}>{quartileError}</p>}
            </motion.div>
          )}

          <PapanHasil students={session.students.filter(s => s.measured)} />
        </div>
      )}

      {/* ── MISSION 3: IQR ── */}
      {gameState === 'MISSION_IQR' && stats && session && (
        <div style={{
          position: 'absolute',
          inset: '12px',
          top: '64px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          gap: '10px',
          overflowY: 'auto',
        }}>
          <MissionHeader
            title="Misi 3: Jangkauan Kuartil (IQR)"
            subtitle="Pasang pita hijau dari Q1 ke Q3 dan hitung jangkauan kuartilnya."
            icon="📐"
            phase={m3Phase === 'PLACE_RIBBON' ? 'A' : m3Phase === 'CALCULATE_IQR' ? 'B' : '✅'}
          />

          {m3Phase === 'PLACE_RIBBON' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="astu-dialogue-card"
              style={{ padding: '16px', borderRadius: '14px', border: '1.5px solid rgba(16,185,129,0.3)' }}
            >
              <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--astu-emerald)', letterSpacing: '1px', marginBottom: '8px' }}>
                🎗️ PASANG PITA HIJAU PADA TIANG KUARTIL
              </div>
              <p style={{ fontSize: '12px', color: '#CBD5E1', margin: '0 0 14px' }}>
                Pasangkan kedua ujung pita hijau pada tiang Q1 dan Q3 untuk merentangkan jangkauan kuartil.
              </p>

              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
                <motion.button
                  whileHover={!greenRibbonQ1 ? { scale: 1.05 } : {}}
                  whileTap={!greenRibbonQ1 ? { scale: 0.95 } : {}}
                  onClick={() => handlePlaceGreenRibbon('Q1')}
                  disabled={greenRibbonQ1}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    background: greenRibbonQ1 ? 'rgba(16,185,129,0.2)' : 'rgba(56,189,248,0.15)',
                    border: `1.5px solid ${greenRibbonQ1 ? '#10B981' : '#38BDF8'}`,
                    color: greenRibbonQ1 ? '#10B981' : '#38BDF8',
                    fontSize: '13px',
                    fontWeight: 900,
                    cursor: greenRibbonQ1 ? 'default' : 'pointer',
                  }}
                >
                  {greenRibbonQ1 ? '✅ Q1 Terpasang' : '🎗️ Pasang di Tiang Q1'}
                </motion.button>
                <motion.button
                  whileHover={!greenRibbonQ3 ? { scale: 1.05 } : {}}
                  whileTap={!greenRibbonQ3 ? { scale: 0.95 } : {}}
                  onClick={() => handlePlaceGreenRibbon('Q3')}
                  disabled={greenRibbonQ3}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    background: greenRibbonQ3 ? 'rgba(16,185,129,0.2)' : 'rgba(251,191,36,0.15)',
                    border: `1.5px solid ${greenRibbonQ3 ? '#10B981' : '#FBBF24'}`,
                    color: greenRibbonQ3 ? '#10B981' : '#FBBF24',
                    fontSize: '13px',
                    fontWeight: 900,
                    cursor: greenRibbonQ3 ? 'default' : 'pointer',
                  }}
                >
                  {greenRibbonQ3 ? '✅ Q3 Terpasang' : '🎗️ Pasang di Tiang Q3'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {m3Phase === 'CALCULATE_IQR' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="astu-dialogue-card"
              style={{ padding: '16px', borderRadius: '14px', border: '1.5px solid rgba(16,185,129,0.3)' }}
            >
              <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--astu-emerald)', letterSpacing: '1px', marginBottom: '12px' }}>
                📐 PERHITUNGAN JANGKAUAN KUARTIL (IQR)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <div style={{ padding: '8px 16px', background: 'rgba(56,189,248,0.15)', borderRadius: '10px', border: '1px solid #38BDF8' }}>
                  <div style={{ fontSize: '9px', color: '#38BDF8', fontWeight: 800 }}>Q1</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#38BDF8', fontFamily: 'var(--font-data)' }}>{formatDistance(stats.q1)} m</div>
                </div>
                <span style={{ fontSize: '20px', color: '#94A3B8' }}>→</span>
                <div style={{ padding: '8px 16px', background: 'rgba(251,191,36,0.15)', borderRadius: '10px', border: '1px solid #FBBF24' }}>
                  <div style={{ fontSize: '9px', color: '#FBBF24', fontWeight: 800 }}>Q3</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-data)' }}>{formatDistance(stats.q3)} m</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#F8FAFC', fontWeight: 700 }}>IQR = Q3 − Q1 =</span>
                <input
                  type="text"
                  value={iqrAnswer}
                  onChange={e => { setIqrAnswer(e.target.value); setIqrError('') }}
                  placeholder="0.00"
                  style={{
                    flex: 1,
                    maxWidth: '180px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: '#F8FAFC',
                    fontSize: '16px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-data)',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>m</span>
                <motion.button
                  className="astu-menu-btn astu-menu-btn-gold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmitIQR}
                  style={{ padding: '10px 22px', fontSize: '13px', borderRadius: '10px' }}
                >
                  Periksa ✓
                </motion.button>
              </div>
              {iqrError && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#EF4444', fontWeight: 700 }}>{iqrError}</p>}
            </motion.div>
          )}

          <PapanHasil students={session.students.filter(s => s.measured)} />
        </div>
      )}

      {/* ── FINAL REPORT ── */}
      {gameState === 'FINAL_REPORT' && stats && session && (
        <div style={{
          position: 'absolute',
          inset: '12px',
          top: '64px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          gap: '12px',
          overflowY: 'auto',
        }}>
          {/* Stars animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
            style={{ textAlign: 'center', padding: '16px' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '6px' }}>
              {Array.from({ length: 3 }, (_, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.25 }}
                  style={{ fontSize: '48px' }}
                >
                  {i < finalStars ? '⭐' : '☆'}
                </motion.span>
              ))}
            </div>
            <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 900, color: '#F8FAFC' }}>
              Level 2 Selesai!
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#94A3B8' }}>
              {finalStars === 3 ? 'Luar Biasa! Pencapaian Sempurna 3 Bintang!' : finalStars === 2 ? 'Bagus Sekali! 2 Bintang diraih!' : 'Kerja Bagus! Terus tingkatkan kemampuan statistikamu!'}
            </p>
          </motion.div>

          {/* Results Summary Box */}
          <div className="astu-dialogue-card" style={{
            borderRadius: '16px',
            padding: '18px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--astu-gold-bright)', letterSpacing: '1px', marginBottom: '12px' }}>
              📋 LAPORAN STATISTIKA LEMPARAN LAPANGAN
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {[
                { label: 'Data Terkumpul', value: '15 Siswa', color: 'var(--astu-emerald)' },
                { label: 'Jarak Terpendek', value: `${formatDistance(stats.min)} m`, color: 'var(--astu-cyan-bright)' },
                { label: 'Jarak Terjauh', value: `${formatDistance(stats.max)} m`, color: 'var(--astu-gold-bright)' },
                { label: 'Jangkauan (Range)', value: `${formatDistance(stats.range)} m`, color: 'var(--danger)' },
                { label: 'Q1 (Kuartil Bawah)', value: `${formatDistance(stats.q1)} m`, color: 'var(--astu-cyan-bright)' },
                { label: 'Q2 (Median)', value: `${formatDistance(stats.q2)} m`, color: 'var(--astu-emerald)' },
                { label: 'Q3 (Kuartil Atas)', value: `${formatDistance(stats.q3)} m`, color: 'var(--astu-gold-bright)' },
                { label: 'Jangkauan Kuartil (IQR)', value: `${formatDistance(stats.iqr)} m`, color: '#8B5CF6' },
              ].map(item => (
                <div key={item.label} style={{
                  padding: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 800, marginBottom: '2px' }}>{item.label}</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: item.color, fontFamily: 'var(--font-data)' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Narrative explanation */}
            <div style={{
              padding: '14px',
              background: 'rgba(14,131,136,0.12)',
              borderRadius: '12px',
              border: '1px solid rgba(14,131,136,0.25)',
              marginBottom: '12px',
            }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#E2E8F0', lineHeight: 1.7 }}>
                {generateReportNarrative(stats)}
              </p>
            </div>

            {/* DiRA reflection */}
            <div style={{
              padding: '14px',
              background: 'rgba(0,173,181,0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(0,173,181,0.25)',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #00ADB5', flexShrink: 0 }}>
                <img src="/dira-avatar.webp" alt="DiRA" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.currentTarget.style.display = 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#00ADB5', marginBottom: '2px' }}>ASISTEN DiRA</div>
                <p style={{ margin: 0, fontSize: '13px', color: '#E2E8F0', lineHeight: 1.6 }}>
                  {getDiraClosing(finalStars)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', padding: '10px 0' }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRetry}
              style={{
                padding: '14px 28px',
                borderRadius: '14px',
                border: '1.5px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.08)',
                color: '#94A3B8',
                fontSize: '14px',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              🔄 Mainkan Ulang
            </motion.button>
            <motion.button
              className="astu-menu-btn astu-menu-btn-gold"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleComplete}
              style={{ padding: '14px 32px', fontSize: '14px', borderRadius: '14px' }}
            >
              Selesai →
            </motion.button>
          </div>
        </div>
      )}

      {/* ── TEACHER / STORY DIALOG OVERLAY (PAK BAMBANG & STEVUNT) WITH ASTU CARD DESIGN ── */}
      <AnimatePresence>
        {currentDialog && (
          <TeacherDialogOverlay
            dialog={currentDialog}
            isLast={dialogIndex === BRIEFING_DIALOGS.length - 1}
            onNext={handleDialogNext}
            onGather={handleGatherStudents}
          />
        )}
      </AnimatePresence>

      {/* ── DIRA BRIEFING MODAL ── */}
      <AnimatePresence>
        {showDiraBriefing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 500,
              background: 'rgba(8, 16, 26, 0.88)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="astu-dialogue-card"
              style={{
                maxWidth: '700px',
                width: '100%',
                padding: '20px 24px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                border: '2px solid rgba(14,131,136,0.4)',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #00ADB5', flexShrink: 0 }}>
                  <img src="/dira-avatar.webp" alt="DiRA" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.currentTarget.style.display = 'none' }} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: 900, color: '#00ADB5', letterSpacing: '1px' }}>ASISTEN DiRA</div>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#F8FAFC', lineHeight: 1.65 }}>
                <Typewriter text={DIRA_BRIEFING.text} />
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(14,131,136,0.2)', paddingTop: '12px' }}>
                <motion.button
                  className="astu-menu-btn astu-menu-btn-gold"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGatherStudents}
                  style={{
                    fontSize: '13px',
                    padding: '10px 24px',
                    borderRadius: '10px',
                  }}
                >
                  📣 Ajak Siswa Berkumpul di Lapangan!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HINT PANEL OVERLAY ── */}
      <AnimatePresence>
        {showHintPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 502,
              background: 'rgba(8, 16, 26, 0.88)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: '24px',
            }}
            onClick={() => setShowHintPanel(false)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={e => e.stopPropagation()}
              className="astu-dialogue-card"
              style={{
                maxWidth: '600px',
                width: '100%',
                padding: '20px 24px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                border: '2px solid rgba(14,131,136,0.4)',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #00ADB5', flexShrink: 0 }}>
                  <img src="/dira-avatar.webp" alt="DiRA" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.currentTarget.style.display = 'none' }} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 900, color: '#00ADB5', letterSpacing: '1px' }}>PETUNJUK DiRA</div>
                  <div style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 700 }}>
                    Tingkat {hintLevel}: {hintLevel === 1 ? 'Arah' : hintLevel === 2 ? 'Langkah' : 'Hitung Bersama'}
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#F8FAFC', lineHeight: 1.65 }}>
                {getHint(currentMissionHint, hintLevel, stats ?? undefined)}
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(14,131,136,0.15)', paddingTop: '10px' }}>
                <motion.button
                  className="astu-menu-btn"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowHintPanel(false)}
                  style={{ fontSize: '13px', padding: '8px 22px', borderRadius: '8px', fontWeight: 900 }}
                >
                  Tutup
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOAST FEEDBACK ── */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="astu-dialogue-card"
            style={{
              position: 'fixed',
              top: '68px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 600,
              padding: '10px 24px',
              borderRadius: '14px',
              border: '1.5px solid var(--astu-gold)',
              boxShadow: 'var(--astu-gold-glow)',
              backdropFilter: 'blur(8px)',
              maxWidth: '520px',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: '13px', color: '#F8FAFC', fontWeight: 700 }}>{feedbackMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BADGE POPUP ── */}
      {pendingBadges.length > 0 && (
        <BadgeUnlock
          icon={pendingBadges[0].icon}
          name={pendingBadges[0].name}
          desc={pendingBadges[0].desc}
          onDone={dismissBadge}
        />
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════

function MissionHeader({ title, subtitle, icon, phase }: { title: string; subtitle: string; icon: string; phase: string }) {
  return (
    <div className="astu-dialogue-card" style={{
      borderRadius: '14px',
      padding: '12px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexShrink: 0,
      backdropFilter: 'blur(8px)',
    }}>
      <span style={{ fontSize: '28px' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#F8FAFC' }}>{title}</h3>
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94A3B8' }}>{subtitle}</p>
      </div>
      <div style={{
        padding: '5px 14px',
        borderRadius: '8px',
        background: phase === '✅' ? 'rgba(16,185,129,0.2)' : 'rgba(251,191,36,0.15)',
        border: `1px solid ${phase === '✅' ? 'rgba(16,185,129,0.4)' : 'rgba(251,191,36,0.3)'}`,
        fontSize: '11px',
        fontWeight: 900,
        color: phase === '✅' ? 'var(--astu-emerald)' : 'var(--astu-gold-bright)',
      }}>
        {phase === '✅' ? '✅ Selesai' : `Tahap ${phase}`}
      </div>
    </div>
  )
}

function PapanHasil({ students }: { students: StudentThrowData[] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="astu-dialogue-card"
      style={{
        borderRadius: '12px',
        padding: '10px 16px',
        backdropFilter: 'blur(8px)',
        flexShrink: 0,
        maxHeight: expanded ? '280px' : '90px',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
        cursor: 'pointer',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--astu-gold-bright)', letterSpacing: '1px' }}>
          📋 PAPAN HASIL LEMPARAN ({students.length}/{TOTAL_STUDENTS})
        </span>
        <span style={{ fontSize: '10px', color: '#94A3B8' }}>{expanded ? '▲ Perkecil' : '▼ Buka Rincian'}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {students.map(s => (
          <div key={s.studentId} style={{
            padding: '3px 8px',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '10px',
            fontWeight: 800,
            color: '#E2E8F0',
            fontFamily: 'var(--font-data)',
          }}>
            S{String(s.studentId).padStart(2, '0')}: {formatDistance(s.distance)}m
          </div>
        ))}
      </div>
    </div>
  )
}

function TeacherDialogOverlay({
  dialog,
  isLast = false,
  onNext,
  onGather,
}: {
  dialog: DialogLine
  isLast?: boolean
  onNext: () => void
  onGather?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        right: '24px',
        zIndex: 510,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '16px',
        maxWidth: '920px',
        margin: '0 auto',
      }}
    >
      {/* Character / Speaker Illustration (Pak Bambang, Stevunt, DiRA) */}
      <motion.div
        key={dialog.speaker}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        style={{
          width: '130px',
          height: '210px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        {dialog.speaker === 'teacher' ? (
          <img
            src="/Assets/Building/Ruang VII-B/Pak Bambang.png"
            alt="Pak Bambang"
            style={{
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.7))',
            }}
          />
        ) : dialog.speaker === 'player' ? (
          <div
            style={{
              width: '110px',
              height: '150px',
              backgroundImage: 'url("/Assets/Character/Stevunt-idle.png")',
              backgroundSize: '500% 500%',
              backgroundPosition: '0% 0%',
              backgroundRepeat: 'no-repeat',
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0 8px 20px rgba(0, 173, 181, 0.7))',
            }}
          />
        ) : (
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #38BDF8',
              boxShadow: '0 0 25px rgba(56, 189, 248, 0.6)',
              marginBottom: '40px',
            }}
          >
            <img
              src="/dira-avatar.webp"
              alt="DiRA"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        )}
      </motion.div>

      {/* ASTU Dialogue Card */}
      <div className="astu-dialogue-card" style={{
        flex: 1,
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        border: dialog.speaker === 'player'
          ? '2px solid var(--astu-cyan-bright)'
          : dialog.speaker === 'dira'
            ? '2px solid #38BDF8'
            : '2px solid var(--astu-gold)',
        boxShadow: 'var(--astu-pixel-shadow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <motion.span
            className="astu-name-badge"
            style={{
              background: dialog.speaker === 'player'
                ? 'rgba(0, 173, 181, 0.25)'
                : dialog.speaker === 'dira'
                  ? 'rgba(56, 189, 248, 0.25)'
                  : undefined,
              borderColor: dialog.speaker === 'player'
                ? 'var(--astu-cyan-bright)'
                : dialog.speaker === 'dira'
                  ? '#38BDF8'
                  : undefined,
              color: dialog.speaker === 'player'
                ? 'var(--astu-cyan-bright)'
                : dialog.speaker === 'dira'
                  ? '#38BDF8'
                  : undefined,
            }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {dialog.speaker === 'teacher' && <span>👨‍🏫 {dialog.speakerName} (Wali Kelas VII-B)</span>}
            {dialog.speaker === 'player' && <span>🏃 {dialog.speakerName || 'Stevunt'} (Detektif Siswa)</span>}
            {dialog.speaker === 'dira' && <span>🤖 DiRA (Asisten Analisis Data)</span>}
            {dialog.speaker === 'system' && <span>📢 {dialog.speakerName}</span>}
          </motion.span>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--astu-cyan-bright)', fontFamily: 'var(--font-data)' }}>
            MISI PENGUKURAN LEMPARAN
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '15px', color: '#F8FAFC', fontWeight: 600, lineHeight: 1.65 }}>
          <Typewriter text={dialog.text} />
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(251,191,36,0.15)', paddingTop: '10px' }}>
          {isLast ? (
            <motion.button
              className="astu-menu-btn astu-menu-btn-gold"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onGather ?? onNext}
              style={{
                fontSize: '13px',
                padding: '9px 24px',
                borderRadius: '8px',
              }}
            >
              📣 Ajak Siswa Berkumpul di Lapangan!
            </motion.button>
          ) : (
            <motion.button
              className="astu-menu-btn astu-menu-btn-gold"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onNext}
              style={{
                fontSize: '13px',
                padding: '8px 22px',
                borderRadius: '8px',
              }}
            >
              Lanjut →
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function SortingPhase({
  students,
  sortedSlots,
  onUpdateSlots,
  onConfirm,
  error,
}: {
  students: StudentThrowData[]
  sortedSlots: (number | null)[]
  onUpdateSlots: (slots: (number | null)[]) => void
  onConfirm: () => void
  error: string
}) {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null)

  const placedIds = new Set(sortedSlots.filter(s => s !== null))
  const unplacedStudents = students.filter(s => !placedIds.has(s.studentId))

  const handlePlaceStudent = (studentId: number, slotIndex: number) => {
    const newSlots = [...sortedSlots]
    const currentIdx = newSlots.indexOf(studentId)
    if (currentIdx !== -1) newSlots[currentIdx] = null

    const existing = newSlots[slotIndex]
    if (existing !== null && currentIdx !== -1) {
      newSlots[currentIdx] = existing
    }
    newSlots[slotIndex] = studentId
    onUpdateSlots(newSlots)
  }

  const handleRemoveFromSlot = (slotIndex: number) => {
    const newSlots = [...sortedSlots]
    newSlots[slotIndex] = null
    onUpdateSlots(newSlots)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="astu-dialogue-card"
      style={{
        borderRadius: '14px',
        padding: '16px',
        border: '1.5px solid rgba(139,92,246,0.3)',
      }}
    >
      <div style={{ fontSize: '11px', fontWeight: 900, color: '#8B5CF6', letterSpacing: '1px', marginBottom: '4px' }}>
        📊 URUTKAN 15 DATA LEMPARAN (DARI TERKECIL KE TERBESAR)
      </div>
      <p style={{ fontSize: '12px', color: '#CBD5E1', margin: '0 0 10px' }}>
        Klik siswa pada daftar, lalu klik slot urutan yang diinginkan.
      </p>

      {/* Unplaced students list with /teen_silhouette.png */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', marginBottom: '6px' }}>SISWA BELUM DITEMPATKAN:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {unplacedStudents.map(s => (
            <motion.button
              key={s.studentId}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedStudent(selectedStudent === s.studentId ? null : s.studentId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                borderRadius: '8px',
                background: selectedStudent === s.studentId ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${selectedStudent === s.studentId ? '#8B5CF6' : 'rgba(255,255,255,0.12)'}`,
                color: '#F8FAFC',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <img
                src="/teen_silhouette.png"
                alt="Siswa"
                style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
              />
              {s.studentLabel.replace('Siswa ', 'S')} ({formatDistance(s.distance)}m)
            </motion.button>
          ))}
          {unplacedStudents.length === 0 && (
            <span style={{ fontSize: '11px', color: 'var(--astu-emerald)', fontWeight: 700 }}>✅ Seluruh 15 siswa telah ditempatkan pada slot</span>
          )}
        </div>
      </div>

      {/* 15 Slots */}
      <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '10px' }}>
        {sortedSlots.map((studentId, idx) => {
          const student = studentId !== null ? students.find(s => s.studentId === studentId) : null
          const isFirst = idx === 0
          const isLast = idx === 14

          return (
            <div
              key={idx}
              onClick={() => {
                if (selectedStudent !== null) {
                  handlePlaceStudent(selectedStudent, idx)
                  setSelectedStudent(null)
                } else if (studentId !== null) {
                  handleRemoveFromSlot(idx)
                }
              }}
              style={{
                minWidth: '56px',
                padding: '6px 4px',
                borderRadius: '8px',
                textAlign: 'center',
                background: student ? 'rgba(139,92,246,0.15)' : selectedStudent !== null ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.04)',
                border: `1.5px ${student ? 'solid' : 'dashed'} ${student ? '#8B5CF6' : selectedStudent !== null ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.12)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '8px', color: isFirst ? '#38BDF8' : isLast ? '#FBBF24' : '#94A3B8', fontWeight: 800, marginBottom: '2px' }}>
                {isFirst ? 'Terdekat' : isLast ? 'Terjauh' : `#${idx + 1}`}
              </div>
              {student ? (
                <>
                  <div style={{ fontSize: '10px', color: '#F8FAFC', fontWeight: 800 }}>{student.studentLabel.replace('Siswa ', 'S')}</div>
                  <div style={{ fontSize: '9px', color: '#CBD5E1', fontFamily: 'var(--font-data)' }}>{formatDistance(student.distance)}m</div>
                </>
              ) : (
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.2)' }}>+</div>
              )}
            </div>
          )
        })}
      </div>

      {error && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#EF4444', fontWeight: 700 }}>{error}</p>}

      <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onUpdateSlots(new Array(15).fill(null))}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#94A3B8',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          🔄 Kosongkan
        </button>
        <motion.button
          className="astu-menu-btn astu-menu-btn-gold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onConfirm}
          disabled={sortedSlots.some(s => s === null)}
          style={{
            padding: '8px 24px',
            fontSize: '12px',
            borderRadius: '10px',
            opacity: sortedSlots.some(s => s === null) ? 0.5 : 1,
          }}
        >
          Konfirmasi Urutan ✓
        </motion.button>
      </div>
    </motion.div>
  )
}
