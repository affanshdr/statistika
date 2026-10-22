'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store/gameStore'
import BadgeUnlock from '@/app/siswa/game/_components/BadgeUnlock'
import FieldStudentAthlete from './components/FieldStudentAthlete'
import FieldTeacher from './components/FieldTeacher'
import BallThrowBowAim, { distanceToFieldY, getCourtBoundsAtY } from './components/BallThrowBowAim'
import FieldMeasurementFlag from './components/FieldMeasurementFlag'
import FieldClassLeader, { LeaderAction } from './components/FieldClassLeader'
import FieldPlayerCharacter from './components/FieldPlayerCharacter'
import {
  FieldSortingBoxesGroup,
  LeaderBoxSortingHUD,
  SORTING_BOX_POSITIONS,
} from './components/LeaderBoxSortingSystem'
import FieldRangeTwoBoxes, {
  RANGE_MIN_BOX_POS,
  RANGE_MAX_BOX_POS,
} from './components/FieldRangeTwoBoxes'
import RangeDifferenceModal from './components/RangeDifferenceModal'
import SortingCelebrationOverlay from './components/SortingCelebrationOverlay'
import RangeMissionPanel from './components/RangeMissionPanel'
import QuartilesMissionPanel from './components/QuartilesMissionPanel'
import IQRMissionPanel from './components/IQRMissionPanel'
import QuartileDeviationMissionPanel from './components/QuartileDeviationMissionPanel'
import Level2HallwayWalk from './components/Level2HallwayWalk'
import Level2ClassroomWalk from './components/Level2ClassroomWalk'
import FieldSortedFlagsRow, {
  Q1_TARGET_X,
  Q2_TARGET_X,
  Q3_TARGET_X,
  SORTED_FLAGS_Y,
  SORTED_FLAGS_X_START,
  SORTED_FLAGS_X_STEP,
} from './components/FieldSortedFlagsRow'

// Level 2 data engine
import {
  createThrowSession,
  computeStats,
  formatDistance,
} from './data/level2StatData'
import type { ThrowSessionData, StudentThrowData, ComputedStats } from './data/level2StatData'

// Level 2 config
import {
  BRIEFING_DIALOGS,
  DATA_COMPLETE_DIALOG,
  KETUA_KELAS_CALL_DIALOG,
  KETUA_KELAS_SORT_INTRO,
  TEACHER_NAME,
  TOTAL_STUDENTS,
  createInitialScoring,
  calculateStars,
  generateReportNarrative,
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
// FIELD COORDINATES & CONSTANTS (1376 x 768 NATIVE RESOLUTION)
// ──────────────────────────────────────────────────────
const FIELD_WIDTH = 1376
const FIELD_HEIGHT = 768
const THROW_ORIGIN = { x: 410, y: 625 }
const PAK_BAMBANG_POS = { x: 680, y: 625 }

export const LEVEL2_BADGES = {
  FIELD_MASTER: { id: 'field-master-l2', icon: '🏅', name: 'Ahli Lapangan', desc: 'Menyelesaikan semua misi pengukuran lemparan' },
  PERFECT: { id: 'perfect-stats-l2', icon: '🎯', name: 'Statistisi Sempurna', desc: 'Meraih 3 bintang di Level 2' },
  SPEED: { id: 'speed-stats-l2', icon: '⚡', name: 'Pengukur Cepat', desc: 'Selesai di bawah 5 menit' },
}


// ──────────────────────────────────────────────────────
// AUDIO SYNTHESIS
// ──────────────────────────────────────────────────────
function playSound(type: 'chime' | 'throw' | 'whistle' | 'error' | 'pop') {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
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
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.42)
    } else if (type === 'throw') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(160, now)
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.28)
      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.38)
    } else if (type === 'pop') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(450, now)
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.08)
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.12)
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
    // Ignore audio errors
  }
}

// ──────────────────────────────────────────────────────
// TYPEWRITER COMPONENT
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
        <span style={{ animation: 'blink 0.8s infinite', color: '#FBBF24', marginLeft: 2 }}>|</span>
      )}
    </span>
  )
}

// ──────────────────────────────────────────────────────
// FIELD COORDINATE CALCULATOR
// ──────────────────────────────────────────────────────
const LANE_PERMUTATION = [0, 5, 2, 7, 9, 4, 1, 6, 8, 3]

function getFieldCoordinate(distance: number, studentId: number) {
  const y = distanceToFieldY(distance)
  const bounds = getCourtBoundsAtY(y)
  const laneIndex = LANE_PERMUTATION[(studentId - 1) % 10]
  const usableWidth = (bounds.xRight - bounds.xLeft) * 0.74
  const margin = (bounds.xRight - bounds.xLeft) * 0.13
  const x = bounds.xLeft + margin + (laneIndex / 9) * usableWidth
  return { x, y }
}

// ──────────────────────────────────────────────────────
function getHint(mission: 0 | 1 | 2 | 3 | 4, level: HintLevel, stats?: ComputedStats): string {
  if (mission === 0) {
    if (level === 1) return 'Perhatikan angka jarak meter pada bendera dari angka paling kecil ke angka paling besar.'
    if (level === 2) return 'Letakkan bendera terdekat di Kotak 1, hingga yang terjauh di Kotak 10.'
    if (level === 3) return 'Gunakan tombol "⚡ Bantuan Auto-Urut" untuk menyusun secara instan ke dalam 10 kotak.'
  }
  if (mission === 1) {
    if (level === 1) return 'Perhatikan jarak yang paling kecil (terdekat) dan paling besar (terjauh) pada barisan bendera di kotak.'
    if (level === 2) return 'Tentukan bendera nilai maksimum (terjauh) dan minimum (terdekat). Jangkauan = Nilai Maksimum − Nilai Minimum.'
    if (level === 3 && stats) return `Nilai maksimum adalah ${formatDistance(stats.max)} m, dan nilai minimum adalah ${formatDistance(stats.min)} m. Hitung: ${formatDistance(stats.max)} − ${formatDistance(stats.min)}.`
  }
  if (mission === 2) {
    if (level === 1) return 'Kuartil membagi 10 data menjadi 4 bagian. Q2 = median (tengah), Q1 = bawah, Q3 = atas.'
    if (level === 2) return 'Untuk n=10: Q1 adalah data ke-3, Q2 (median) rata-rata data ke-5 dan ke-6, dan Q3 data ke-8.'
    if (level === 3 && stats) return `Data urutan ke-3 = ${formatDistance(stats.q1)} m (Q1), Q2 median = ${stats.q2} m, dan urutan ke-8 = ${formatDistance(stats.q3)} m (Q3).`
  }
  if (mission === 3) {
    if (level === 1) return 'Perhatikan rentang 50% data di tengah antara tiang Q1 dan tiang Q3.'
    if (level === 2) return 'Jangkauan Kuartil (IQR) adalah selisih antara kuartil atas dan kuartil bawah: IQR = Q3 − Q1.'
    if (level === 3 && stats) return `Nilai Q1 = ${formatDistance(stats.q1)} m dan Q3 = ${formatDistance(stats.q3)} m. Hitung: ${formatDistance(stats.q3)} − ${formatDistance(stats.q1)}.`
  }
  if (mission === 4) {
    if (level === 1) return 'Simpangan kuartil (Qd) adalah setengah dari jangkauan kuartil: Qd = ½(Q3 − Q1).'
    if (level === 2 && stats) return `Gunakan rumus: Qd = ½ × IQR = ½ × (${formatDistance(stats.q3)} − ${formatDistance(stats.q1)}). Nilai IQR = ${formatDistance(stats.iqr)} m.`
    if (level === 3 && stats) return `Simpangan kuartil Qd = ½ × ${formatDistance(stats.iqr)} = ${stats.qd} m.`
  }
  return ''
}

// ──────────────────────────────────────────────────────
// PROPS & INTERFACES
// ──────────────────────────────────────────────────────
interface Level2MainProps {
  studentId?: string
  studentName?: string
  demoMode?: boolean
}

interface PendingBadge { icon: string; name: string; desc: string; id: string }

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
  const [gameState, setGameState] = useState<Level2State>('HALLWAY_EXPLORATION')
  const [session, setSession] = useState<ThrowSessionData | null>(null)
  const [stats, setStats] = useState<ComputedStats | null>(null)
  const [scoring, setScoring] = useState<SessionScoring>(createInitialScoring())
  const [pendingBadges, setPendingBadges] = useState<PendingBadge[]>([])

  // ── DIALOG STATE ─────────────────────────────
  const [dialogIndex, setDialogIndex] = useState(0)
  const [currentDialog, setCurrentDialog] = useState<DialogLine | null>(null)

  // ── THROWING & ATHLETE STATE ─────────────────
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null)
  const [athleteMode, setAthleteMode] = useState<'idle' | 'aim' | 'throw'>('idle')
  const [walkingStudent, setWalkingStudent] = useState<{
    studentId: number
    x: number
    y: number
  } | null>(null)
  const walkAnimRef = useRef<NodeJS.Timeout | null>(null)

  // 2x5 Grid Queue Positions (2 rows x 5 columns = 10 positions)
  // Row 0 (front row, y = 565): spots 0..4 (col 0..4) -> Siswa 1 s/d 5
  // Row 1 (back row, y = 490): spots 5..9 (col 0..4) -> Siswa 6 s/d 10
  const getQueuePosition = useCallback((queueIndex: number) => {
    const cols = [145, 190, 235, 280, 325]
    const rows = [565, 490]
    const clamped = Math.max(0, Math.min(9, queueIndex))
    const r = Math.floor(clamped / 5)
    const c = clamped % 5
    return { x: cols[c], y: rows[r] }
  }, [])

  useEffect(() => {
    return () => {
      if (walkAnimRef.current) clearInterval(walkAnimRef.current)
    }
  }, [])
  const [ballFlight, setBallFlight] = useState<{
    x: number
    y: number
    baseY: number
    progress: number
    targetX: number
    targetY: number
  } | null>(null)
  const [dustEffect, setDustEffect] = useState<{ x: number; y: number } | null>(null)
  const [lastThrowResult, setLastThrowResult] = useState<{ distance: number; studentLabel: string } | null>(null)

  // ── MISSION 1: RANGE STATE ───────────────────
  const [m1Phase, setM1Phase] = useState<MissionRangePhase>('SELECT_FLAGS')
  const [rangeMinBox, setRangeMinBox] = useState<StudentThrowData | null>(null)
  const [rangeMaxBox, setRangeMaxBox] = useState<StudentThrowData | null>(null)
  const [showRangeCalculationModal, setShowRangeCalculationModal] = useState(false)
  const [selectedMinFlag, setSelectedMinFlag] = useState<number | null>(null)
  const [selectedMaxFlag, setSelectedMaxFlag] = useState<number | null>(null)
  const [ribbonPlaced, setRibbonPlaced] = useState(false)
  const [rangeAnswer, setRangeAnswer] = useState('')
  const [rangeError, setRangeError] = useState('')

  // ── MISSION 2: QUARTILES STATE ───────────────
  const [m2Phase, setM2Phase] = useState<MissionQuartilePhase>('PLACE_POSTS')
  const [q1Post, setQ1Post] = useState<number | null>(null)
  const [q2Post, setQ2Post] = useState<number | null>(null)
  const [q3Post, setQ3Post] = useState<number | null>(null)
  const [q1Answer, setQ1Answer] = useState('')
  const [q2Answer, setQ2Answer] = useState('')
  const [q3Answer, setQ3Answer] = useState('')
  const [quartileError, setQuartileError] = useState('')
  const [showQuartileChoiceModal, setShowQuartileChoiceModal] = useState(false)

  // ── MISSION 3: IQR STATE ─────────────────────
  const [m3Phase, setM3Phase] = useState<MissionIQRPhase>('PLACE_RIBBON')
  const [greenRibbonQ1, setGreenRibbonQ1] = useState(false)
  const [greenRibbonQ3, setGreenRibbonQ3] = useState(false)
  const [iqrAnswer, setIqrAnswer] = useState('')
  const [iqrError, setIqrError] = useState('')

  // ── PLAYER CHARACTER & BOX SORTING STATES ──
  const [playerPos, setPlayerPos] = useState({ x: 300, y: 520 })
  const [playerDir, setPlayerDir] = useState({ x: 0, y: 0 })
  const [carryingFlag, setCarryingFlag] = useState<StudentThrowData | null>(null)
  const [sortingBoxes, setSortingBoxes] = useState<(StudentThrowData | null)[]>(() => Array(10).fill(null))
  const [targetMovePos, setTargetMovePos] = useState<{ x: number; y: number } | null>(null)
  const [leaderPos, setLeaderPos] = useState({ x: 130, y: 220 })
  const [leaderAction, setLeaderAction] = useState<LeaderAction>('idle')
  const [leaderFacing, setLeaderFacing] = useState<'left' | 'right'>('right')
  const [carryingFlagsCount, setCarryingFlagsCount] = useState(0)
  const [greenRibbonPlaced, setGreenRibbonPlaced] = useState(false)

  // ── HINTS & FEEDBACK ─────────────────────────
  const [currentMissionHint, setCurrentMissionHint] = useState<0 | 1 | 2 | 3 | 4>(0)
  const [hintLevel, setHintLevel] = useState<HintLevel>(0)
  const [showHintPanel, setShowHintPanel] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)
  const feedbackTimer = useRef<NodeJS.Timeout | null>(null)

  // ── INITIALIZATION ───────────────────────────
  useEffect(() => {
    useGameStore.getState().startLevel(2)
    const newSession = createThrowSession()
    setSession(newSession)
  }, [])

  const showFeedback = useCallback((msg: string, duration = 2500) => {
    setFeedbackMsg(msg)
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    feedbackTimer.current = setTimeout(() => setFeedbackMsg(null), duration)
  }, [])

  // ── CLASSROOM DIALOG HANDLERS ────────────────
  const handleTransitionToField = useCallback(() => {
    playSound('whistle')
    setGameState('TRANSITION_TO_FIELD')
    showFeedback('🏃 Berpindah dari ruang kelas menuju lapangan sekolah...', 2500)

    setTimeout(() => {
      setGameState('GATHER_STUDENTS')
      showFeedback('📢 Pak Bambang meniup peluit! 10 Siswa bersiap di pinggir lapangan...', 2500)
      setTimeout(() => {
        setGameState('COLLECTING_DATA')
        showFeedback('👥 Pilih siswa di Zona Siswa atau mulai lemparan!', 2500)
      }, 1800)
    }, 1800)
  }, [showFeedback])

  const awardBadge = useCallback((badge: typeof LEVEL2_BADGES[keyof typeof LEVEL2_BADGES]) => {
    unlockBadge(badge.id)
    setPendingBadges(prev => [...prev, badge])
  }, [unlockBadge])

  const dismissBadge = () => setPendingBadges(prev => prev.slice(1))

  // ── CAMERA ZOOM FRAMING STATE (FIT / FOCUS) ──
  const [cameraZoom, setCameraZoom] = useState<'fit' | 'focus'>('fit')

  // ── TEACHER BRIEFING ─────────────────────────
  const handleStartTeacherBriefing = useCallback(() => {
    playSound('chime')
    setGameState('BRIEFING')
    setDialogIndex(0)
    setCurrentDialog(BRIEFING_DIALOGS[0])
  }, [])

  // ── KEYBOARD SHORTCUT TO START BRIEFING ───
  useEffect(() => {
    if (gameState !== 'MEET_TEACHER') return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === 'e' || key === ' ' || key === 'enter') {
        e.preventDefault()
        handleStartTeacherBriefing()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, handleStartTeacherBriefing])

  const handleGatherStudents = useCallback(() => {
    playSound('whistle')
    setGameState('GATHER_STUDENTS')
    showFeedback('📢 Pak Bambang meniup peluit! 10 Siswa bersiap di lapangan...', 2500)

    setTimeout(() => {
      setGameState('COLLECTING_DATA')
      showFeedback('👥 Pilih siswa di Zona Siswa atau mulai lemparan!', 2500)
    }, 1800)
  }, [showFeedback])

  const handleDialogNext = useCallback(() => {
    if (gameState === 'BRIEFING') {
      const nextIdx = dialogIndex + 1
      if (nextIdx < BRIEFING_DIALOGS.length) {
        setDialogIndex(nextIdx)
        setCurrentDialog(BRIEFING_DIALOGS[nextIdx])
      } else {
        setCurrentDialog(null)
        handleGatherStudents()
      }
    } else if (currentDialog === KETUA_KELAS_CALL_DIALOG) {
      setCurrentDialog(KETUA_KELAS_SORT_INTRO)
    } else {
      setCurrentDialog(null)
    }
  }, [gameState, dialogIndex, currentDialog, handleGatherStudents])

  // Spacebar & Enter keyboard shortcut for advancing in-game speech bubbles
  useEffect(() => {
    if (!currentDialog) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        handleDialogNext()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentDialog, handleDialogNext])

  // ── CALLING STUDENT TO THROW LINE & WALKING ANIMATION ──
  const handleCallStudent = useCallback((studentId: number) => {
    if (!session || activeStudentId !== null || walkingStudent !== null) return
    const student = session.students.find(s => s.studentId === studentId)
    if (!student || student.measured) return

    const startPos = getQueuePosition(student.studentId - 1)

    playSound('whistle')
    showFeedback(`📢 Pak Bambang: "${student.studentLabel}, giliranmu maju ke garis lempar!"`, 2400)

    setGameState('STUDENT_CALLED')
    setWalkingStudent({ studentId, x: startPos.x, y: startPos.y })

    const targetX = THROW_ORIGIN.x
    const targetY = THROW_ORIGIN.y
    const startTime = Date.now()
    const duration = 1200 // 1.2s smooth walk

    if (walkAnimRef.current) clearInterval(walkAnimRef.current)
    walkAnimRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / duration)
      // Smooth ease
      const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
      const curX = startPos.x + (targetX - startPos.x) * ease
      const curY = startPos.y + (targetY - startPos.y) * ease

      setWalkingStudent({ studentId, x: curX, y: curY })

      if (progress >= 1) {
        if (walkAnimRef.current) clearInterval(walkAnimRef.current)
        walkAnimRef.current = null
        setWalkingStudent(null)
        setActiveStudentId(studentId)
        setAthleteMode('aim')
        setGameState('READY_TO_THROW')
        playSound('chime')
        showFeedback(`🎯 ${student.studentLabel} telah bersiap di garis lempar! Tarik busur & lepaskan untuk melempar!`, 2500)
      }
    }, 25)
  }, [session, activeStudentId, walkingStudent, getQueuePosition, showFeedback])

  const nextWaitingStudent = useMemo(() => {
    if (!session) return null
    return session.students.find(s => !s.measured && s.studentId !== activeStudentId && s.studentId !== walkingStudent?.studentId) || null
  }, [session, activeStudentId, walkingStudent])

  const handleCallNextStudent = useCallback(() => {
    if (nextWaitingStudent && activeStudentId === null && walkingStudent === null) {
      handleCallStudent(nextWaitingStudent.studentId)
    }
  }, [nextWaitingStudent, activeStudentId, walkingStudent, handleCallStudent])

  // ── SEQUENCE 1: MISSION 1 - JANGKAUAN (RANGE) FIRST ─────
  const handleStartMissionRange = useCallback((computedStats: ComputedStats) => {
    playSound('whistle')
    setGameState('MISSION_RANGE')
    setM1Phase('SELECT_FLAGS')
    setRangeMinBox(null)
    setRangeMaxBox(null)
    setCarryingFlag(null)
    setPlayerPos({ x: 688, y: 380 })
    setPlayerDir({ x: 0, y: 0 })
    setSelectedMinFlag(null)
    setSelectedMaxFlag(null)
    setRibbonPlaced(false)
    setShowRangeCalculationModal(false)
    setCurrentMissionHint(1)
    setHintLevel(0)
    showFeedback('🎯 10 Lemparan selesai! Misi 1: Gerakkan Stevunt untuk membawa bendera terdekat (Min) dan terjauh (Max) ke 2 kotak di atas!', 4500)
  }, [showFeedback])

  // ── SEQUENCE 2: STARTING PLAYER SORTING INTO TOP BOXES ──
  const handleStartSortingSequence = useCallback((preservedMin?: StudentThrowData | null, preservedMax?: StudentThrowData | null) => {
    playSound('whistle')
    setRibbonPlaced(false)

    // Preserve Min and Max flags from Mission 1 Range so user doesn't need to repeat them!
    const minStudent = preservedMin || rangeMinBox || session?.students.find(s => s.studentId === stats?.minStudentId) || null
    const maxStudent = preservedMax || rangeMaxBox || session?.students.find(s => s.studentId === stats?.maxStudentId) || null

    const initialBoxes: (StudentThrowData | null)[] = Array(10).fill(null)
    if (minStudent) initialBoxes[0] = minStudent
    if (maxStudent) initialBoxes[9] = maxStudent

    setSortingBoxes(initialBoxes)
    setCarryingFlag(null)
    setGameState('KETUA_KELAS_ENTRANCE')
    setCurrentDialog(KETUA_KELAS_CALL_DIALOG)
    setPlayerPos({ x: 688, y: 380 })
    setPlayerDir({ x: 0, y: 0 })
    setCurrentMissionHint(0)
    setHintLevel(0)
    showFeedback('🏃 Stevunt bersiap! Bendera Min dan Max dari Misi Jangkauan tetap berada di Kotak #1 dan #10.', 3500)

    setTimeout(() => {
      setCurrentDialog(null)
      setGameState('KETUA_KELAS_SORTING')
      showFeedback('🚩 Bendera Min (#1) dan Max (#10) sudah terpasang. Lengkapi 8 bendera lainnya ke Kotak #2 s/d #9!', 4500)
    }, 2200)
  }, [playSound, rangeMinBox, rangeMaxBox, session, stats, showFeedback])

  // ── ARCHERY-STYLE PROJECTILE LAUNCH ──────────
  const handleLaunchThrow = useCallback((throwParams: { angle: number; power: number; distance: number }) => {
    if (!session || activeStudentId === null) return
    const student = session.students.find(s => s.studentId === activeStudentId)
    if (!student) return

    playSound('throw')
    setGameState('THROW_IN_PROGRESS')
    setAthleteMode('throw')

    const actualDistance = student.distance
    const targetCoord = getFieldCoordinate(actualDistance, student.studentId)
    const startCoord = { x: THROW_ORIGIN.x + 20, y: THROW_ORIGIN.y - 75 }

    const startTime = Date.now()
    const flightDuration = 1350

    const animInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / flightDuration)

      const curX = startCoord.x + (targetCoord.x - startCoord.x) * progress
      const baseY = startCoord.y + (targetCoord.y - startCoord.y) * progress
      const arcHeight = Math.sin(progress * Math.PI) * 140
      const curY = baseY - arcHeight

      setBallFlight({
        x: curX,
        y: curY,
        baseY,
        progress,
        targetX: targetCoord.x,
        targetY: targetCoord.y,
      })

      if (progress >= 1) {
        clearInterval(animInterval)
        setBallFlight(null)
        setAthleteMode('idle')

        setDustEffect({ x: targetCoord.x, y: targetCoord.y })
        setTimeout(() => setDustEffect(null), 700)
        playSound('whistle')

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
        setLastThrowResult({ distance: actualDistance, studentLabel: student.studentLabel })

        showFeedback(`🎯 ${student.studentLabel}: ${formatDistance(actualDistance)} m tercatat! (${newMeasuredCount}/${TOTAL_STUDENTS})`, 2500)

        setTimeout(() => {
          setActiveStudentId(null)

          if (newMeasuredCount >= TOTAL_STUDENTS) {
            const computed = computeStats(updatedSession)
            setStats(computed)
            handleStartMissionRange(computed)
          } else {
            setGameState('COLLECTING_DATA')
          }
        }, 1200)
      }
    }, 30)
  }, [session, activeStudentId, showFeedback, handleStartMissionRange])

  // Quick simulate / auto-complete all remaining throws (convenience for testing & player choice)
  const handleSimulateRemaining = useCallback(() => {
    if (!session) return
    playSound('chime')

    const updatedStudents = session.students.map(s => ({ ...s, measured: true }))
    const updatedSession: ThrowSessionData = {
      ...session,
      students: updatedStudents,
      measuredCount: TOTAL_STUDENTS,
      isComplete: true,
    }
    setSession(updatedSession)
    setActiveStudentId(null)

    const computed = computeStats(updatedSession)
    setStats(computed)

    showFeedback(`⚡ Seluruh ${TOTAL_STUDENTS} data lemparan berhasil dicatat di lapangan!`, 2500)
    handleStartMissionRange(computed)
  }, [session, showFeedback, handleStartMissionRange])

  // ── STAGE 1: PLAYER BOX SORTING INTERACTION & MOVEMENT ──
  const handlePlayerMove = useCallback((pos: { x: number; y: number }, dir: { x: number; y: number }) => {
    setPlayerPos(pos)
    setPlayerDir(dir)
  }, [])

  // Tap on SVG field ground to move player (Stevunt)
  const handleFieldSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (gameState !== 'KETUA_KELAS_SORTING' && gameState !== 'MISSION_RANGE' && gameState !== 'MISSION_QUARTILES') return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = ((e.clientX - rect.left) / rect.width) * 1376
    const clickY = ((e.clientY - rect.top) / rect.height) * 768
    const targetX = Math.max(130, Math.min(1240, clickX))
    const targetY = Math.max(172, Math.min(665, clickY))
    setTargetMovePos({ x: targetX, y: targetY })
  }, [gameState])

  // Smooth tap-to-walk loop (60FPS Delta-Time)
  useEffect(() => {
    if (!targetMovePos || (gameState !== 'KETUA_KELAS_SORTING' && gameState !== 'MISSION_RANGE' && gameState !== 'MISSION_QUARTILES')) return
    let animId: number
    let lastTime = performance.now()
    const speed = 280

    const step = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      const cur = rangePlayerPosRef.current
      const dx = targetMovePos.x - cur.x
      const dy = targetMovePos.y - cur.y
      const dist = Math.hypot(dx, dy)

      if (dist <= 6) {
        setTargetMovePos(null)
        setPlayerDir({ x: 0, y: 0 })
        return
      }

      const dir = { x: dx / dist, y: dy / dist }
      const moveDist = Math.min(dist, speed * dt)
      const nextX = Math.max(130, Math.min(1240, cur.x + dir.x * moveDist))
      const nextY = Math.max(172, Math.min(665, cur.y + dir.y * moveDist))

      rangePlayerPosRef.current = { x: nextX, y: nextY }
      setPlayerPos({ x: nextX, y: nextY })
      setPlayerDir(dir)

      animId = requestAnimationFrame(step)
    }

    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [targetMovePos, gameState])

  // ── STAGE 3: QUARTILES PLACEMENT & AVATAR NAVIGATION ──
  const stevuntPositionInfo = useMemo(() => {
    if (!stats || gameState !== 'MISSION_QUARTILES') {
      return { pos: null, label: 'Di luar barisan bendera', canPlace: false }
    }

    // Avatar is walking near Y = 570 (flags row). Allow range Y in [480, 665]
    const dy = Math.abs(playerPos.y - SORTED_FLAGS_Y)
    if (dy > 95) {
      return {
        pos: null,
        label: 'Dekati barisan bendera...',
        canPlace: false,
      }
    }

    // 1. Check if near median midpoint (between 5 and 6)
    if (Math.abs(playerPos.x - Q2_TARGET_X) <= 35) {
      return {
        pos: 5.5,
        label: 'Antara Urutan ke-5 & 6 (Titik Tengah)',
        canPlace: true,
      }
    }

    // 2. Check closest flag
    let closestIdx: number | null = null
    let minDiffX = 48
    stats.sortedStudents.forEach((_, idx) => {
      const fx = SORTED_FLAGS_X_START + idx * SORTED_FLAGS_X_STEP
      const diffX = Math.abs(playerPos.x - fx)
      if (diffX < minDiffX) {
        minDiffX = diffX
        closestIdx = idx
      }
    })

    if (closestIdx !== null) {
      const sf = stats.sortedStudents[closestIdx]
      return {
        pos: closestIdx + 1,
        label: `Urutan ke-${closestIdx + 1} (${sf ? formatDistance(sf.distance) : ''}m)`,
        canPlace: true,
      }
    }

    return {
      pos: null,
      label: 'Dekati salah satu bendera...',
      canPlace: false,
    }
  }, [stats, gameState, playerPos])

  const handlePlacePostAtCurrentPos = useCallback((quartile: 'Q1' | 'Q2' | 'Q3') => {
    if (!stats) return
    if (!stevuntPositionInfo.canPlace || stevuntPositionInfo.pos === null) {
      showFeedback('🚶 Gerakkan Stevunt mendekati salah satu bendera atau titik tengah di antara bendera terlebih dahulu!', 2500)
      return
    }

    const currentPos = stevuntPositionInfo.pos
    const isCorrect =
      (quartile === 'Q1' && currentPos === 3) ||
      (quartile === 'Q2' && currentPos === 5.5) ||
      (quartile === 'Q3' && currentPos === 8)

    if (isCorrect) {
      playSound('chime')
      if (quartile === 'Q1') setQ1Post(3)
      if (quartile === 'Q2') setQ2Post(5.5)
      if (quartile === 'Q3') setQ3Post(8)
      showFeedback(`🎉 Tepat sekali! Tiang ${quartile} berhasil dipasang pada ${quartile === 'Q2' ? 'antara urutan ke-5 & 6' : `urutan ke-${currentPos}`}!`, 2500)
    } else {
      playSound('error')
      incrementMistake()
      setScoring(prev => {
        const updated = { ...prev }
        if (updated.missions[2]) {
          updated.missions[2] = {
            ...updated.missions[2],
            objectErrors: updated.missions[2].objectErrors + 1,
            firstAttemptCorrect: false,
          }
        }
        return updated
      })

      if (quartile === 'Q1') {
        showFeedback(`❌ Tiang Q1 belum tepat di ${stevuntPositionInfo.label}. Kuartil Bawah adalah nilai tengah dari 5 data pertama (setengah bawah).`, 3500)
      } else if (quartile === 'Q2') {
        showFeedback(`❌ Tiang Q2 belum tepat di ${stevuntPositionInfo.label}. Karena n=10 (genap), Median berada tepat di tengah antara 2 data terpusat!`, 3500)
      } else {
        showFeedback(`❌ Tiang Q3 belum tepat di ${stevuntPositionInfo.label}. Kuartil Atas adalah nilai tengah dari 5 data terakhir (setengah atas).`, 3500)
      }
    }
  }, [stats, stevuntPositionInfo, playSound, showFeedback, incrementMistake])

  // Active nearest interaction target (Spacebar prompt)
  type InteractionTarget =
    | { type: 'PICKUP_FLAG'; flag: StudentThrowData; prompt: string }
    | { type: 'PICKUP_BOX'; boxIdx: number; item: StudentThrowData; prompt: string }
    | { type: 'PLACE_BOX'; boxIdx: number; prompt: string }
    | { type: 'PLACE_RANGE_MIN'; prompt: string }
    | { type: 'PLACE_RANGE_MAX'; prompt: string }
    | { type: 'PICKUP_RANGE_MIN'; item: StudentThrowData; prompt: string }
    | { type: 'PICKUP_RANGE_MAX'; item: StudentThrowData; prompt: string }
    | { type: 'CHOOSE_QUARTILE'; prompt: string }

  const nearestInteraction = useMemo<InteractionTarget | null>(() => {
    if (!session) return null

    // ── CASE A: MISSION 1 (RANGE: MIN & MAX BOXES) ──
    if (gameState === 'MISSION_RANGE') {
      const distToMinBox = Math.hypot(playerPos.x - RANGE_MIN_BOX_POS.x, playerPos.y - RANGE_MIN_BOX_POS.y)
      const distToMaxBox = Math.hypot(playerPos.x - RANGE_MAX_BOX_POS.x, playerPos.y - RANGE_MAX_BOX_POS.y)

      if (!carryingFlag) {
        // 1. Look for closest flag on field (not in min or max box) within 85px
        let closestFlag: StudentThrowData | null = null
        let minFlagDist = 85
        session.students.forEach(s => {
          if (!s.measured) return
          if (rangeMinBox?.studentId === s.studentId || rangeMaxBox?.studentId === s.studentId) return
          const coord = getFieldCoordinate(s.distance, s.studentId)
          const dist = Math.hypot(playerPos.x - coord.x, playerPos.y - coord.y)
          if (dist < minFlagDist) {
            minFlagDist = dist
            closestFlag = s
          }
        })

        if (closestFlag) {
          return {
            type: 'PICKUP_FLAG',
            flag: closestFlag as StudentThrowData,
            prompt: `[SPASI] Ambil Bendera (${formatDistance((closestFlag as StudentThrowData).distance)}m)`,
          }
        }

        // 2. Proximity to Min Box to retrieve flag
        if (distToMinBox < 95 && rangeMinBox) {
          return {
            type: 'PICKUP_RANGE_MIN',
            item: rangeMinBox,
            prompt: `[SPASI] Ambil dari Kotak Min (${formatDistance(rangeMinBox.distance)}m)`,
          }
        }

        // 3. Proximity to Max Box to retrieve flag
        if (distToMaxBox < 95 && rangeMaxBox) {
          return {
            type: 'PICKUP_RANGE_MAX',
            item: rangeMaxBox,
            prompt: `[SPASI] Ambil dari Kotak Max (${formatDistance(rangeMaxBox.distance)}m)`,
          }
        }
      } else {
        // Carrying flag -> proximity to Min or Max box
        if (distToMinBox < 95) {
          return {
            type: 'PLACE_RANGE_MIN',
            prompt: `[SPASI] Taruh di Kotak Min (${formatDistance(carryingFlag.distance)}m)`,
          }
        }
        if (distToMaxBox < 95) {
          return {
            type: 'PLACE_RANGE_MAX',
            prompt: `[SPASI] Taruh di Kotak Max (${formatDistance(carryingFlag.distance)}m)`,
          }
        }
      }
      return null
    }

    // ── CASE B: KETUA KELAS SORTING (10 BOXES) ──
    if (gameState === 'KETUA_KELAS_SORTING') {
      if (!carryingFlag) {
        // 1. Look for closest uncollected flag on field within proximity (80px)
        let closestFlag: StudentThrowData | null = null
        let minFlagDist = 80
        session.students.forEach(s => {
          if (!s.measured) return
          if (sortingBoxes.some(b => b?.studentId === s.studentId)) return
          const coord = getFieldCoordinate(s.distance, s.studentId)
          const dist = Math.hypot(playerPos.x - coord.x, playerPos.y - coord.y)
          if (dist < minFlagDist) {
            minFlagDist = dist
            closestFlag = s
          }
        })

        if (closestFlag) {
          return {
            type: 'PICKUP_FLAG',
            flag: closestFlag as StudentThrowData,
            prompt: `[SPASI] Ambil Bendera (${formatDistance((closestFlag as StudentThrowData).distance)}m)`,
          }
        }

        // 2. Look for closest filled box within proximity (85px) to retrieve flag (Box #1 and #10 are locked)
        let closestFilledBoxIdx = -1
        let minFilledBoxDist = 85
        SORTING_BOX_POSITIONS.forEach((pos, idx) => {
          if (sortingBoxes[idx] === null || idx === 0 || idx === 9) return
          const dist = Math.hypot(playerPos.x - pos.x, playerPos.y - pos.y)
          if (dist < minFilledBoxDist) {
            minFilledBoxDist = dist
            closestFilledBoxIdx = idx
          }
        })

        if (closestFilledBoxIdx !== -1) {
          return {
            type: 'PICKUP_BOX',
            boxIdx: closestFilledBoxIdx,
            item: sortingBoxes[closestFilledBoxIdx]!,
            prompt: `[SPASI] Ambil dari Kotak #${closestFilledBoxIdx + 1}`,
          }
        }
      } else {
        // Carrying flag -> look for closest box to drop into (within 85px, Box #1 and #10 are locked)
        let closestBoxIdx = -1
        let minBoxDist = 85
        SORTING_BOX_POSITIONS.forEach((pos, idx) => {
          if (idx === 0 || idx === 9) return
          const dist = Math.hypot(playerPos.x - pos.x, playerPos.y - pos.y)
          if (dist < minBoxDist) {
            minBoxDist = dist
            closestBoxIdx = idx
          }
        })

        if (closestBoxIdx !== -1) {
          return {
            type: 'PLACE_BOX',
            boxIdx: closestBoxIdx,
            prompt: `[SPASI] Masukkan ke Kotak #${closestBoxIdx + 1}`,
          }
        }
      }
    }

    // ── CASE C: MISSION 2 (QUARTILES: USER DETERMINES) ──
    if (gameState === 'MISSION_QUARTILES' && stats) {
      if (stevuntPositionInfo.canPlace) {
        return {
          type: 'CHOOSE_QUARTILE',
          prompt: `[SPASI] Tentukan Kuartil di ${stevuntPositionInfo.label}`,
        }
      }
      return null
    }

    return null
  }, [gameState, session, carryingFlag, sortingBoxes, playerPos, rangeMinBox, rangeMaxBox, stats, stevuntPositionInfo])

  const interactionPrompt = nearestInteraction?.prompt || null

  // Check Range Selection correctness when both Min and Max boxes are filled
  const checkRangeSelection = useCallback((minFlag: StudentThrowData | null, maxFlag: StudentThrowData | null) => {
    if (!stats || !minFlag || !maxFlag) return

    const isMinCorrect = minFlag.distance === stats.min
    const isMaxCorrect = maxFlag.distance === stats.max

    if (isMinCorrect && isMaxCorrect) {
      playSound('chime')
      setRibbonPlaced(true)
      showFeedback('🎉 Hebat! Bendera Terkecil dan Terbesar sudah tepat! Masukkan selisih keduanya pada pop-up perhitungan.', 3500)
      setTimeout(() => {
        setShowRangeCalculationModal(true)
      }, 700)
    } else {
      playSound('error')
      incrementMistake()
      if (!isMinCorrect && !isMaxCorrect) {
        showFeedback(`❌ Kedua bendera belum tepat. Terkecil bukan ${formatDistance(minFlag.distance)}m dan terbesar bukan ${formatDistance(maxFlag.distance)}m. Ambil dan tukar dengan bendera lain!`, 4000)
      } else if (!isMinCorrect) {
        showFeedback(`❌ Bendera ${minFlag.studentLabel} (${formatDistance(minFlag.distance)}m) bukan yang terdekat. Cari bendera dengan jarak lebih kecil!`, 3500)
      } else {
        showFeedback(`❌ Bendera ${maxFlag.studentLabel} (${formatDistance(maxFlag.distance)}m) bukan yang terjauh. Cari bendera dengan jarak lebih besar!`, 3500)
      }
    }
  }, [stats, playSound, incrementMistake, showFeedback])

  // Spacebar Interaction Handler
  const handleInteract = useCallback(() => {
    if (!nearestInteraction) return

    if (nearestInteraction.type === 'PICKUP_FLAG') {
      setCarryingFlag(nearestInteraction.flag)
      playSound('pop')
      if (gameState === 'MISSION_RANGE') {
        showFeedback(`🚩 Mengambil bendera ${nearestInteraction.flag.studentLabel} (${formatDistance(nearestInteraction.flag.distance)}m)! Bawa ke Kotak Min atau Kotak Max di atas.`, 2500)
      } else {
        showFeedback(`🚩 Mengambil bendera ${nearestInteraction.flag.studentLabel} (${formatDistance(nearestInteraction.flag.distance)}m)! Bawa ke kotak yang sesuai.`, 2200)
      }
    } else if (nearestInteraction.type === 'PLACE_BOX') {
      if (!carryingFlag) return
      const boxIdx = nearestInteraction.boxIdx
      const existing = sortingBoxes[boxIdx]
      const nextBoxes = [...sortingBoxes]
      nextBoxes[boxIdx] = carryingFlag
      setSortingBoxes(nextBoxes)
      setCarryingFlag(existing)
      playSound('chime')
      showFeedback(`Bendera ${carryingFlag.studentLabel} (${formatDistance(carryingFlag.distance)}m) dimasukkan ke Kotak #${boxIdx + 1}!`, 2000)
    } else if (nearestInteraction.type === 'PICKUP_BOX') {
      const boxIdx = nearestInteraction.boxIdx
      const item = sortingBoxes[boxIdx]
      const nextBoxes = [...sortingBoxes]
      nextBoxes[boxIdx] = null
      setSortingBoxes(nextBoxes)
      setCarryingFlag(item)
      playSound('pop')
      showFeedback(`Mengambil kembali ${item?.studentLabel} dari Kotak #${boxIdx + 1}!`, 2000)
    } else if (nearestInteraction.type === 'PLACE_RANGE_MIN') {
      if (!carryingFlag) return
      const existing = rangeMinBox
      setRangeMinBox(carryingFlag)
      setCarryingFlag(existing)
      playSound('chime')
      showFeedback(`Bendera ${carryingFlag.studentLabel} (${formatDistance(carryingFlag.distance)}m) diletakkan di Kotak Nilai Terkecil (Min)!`, 2200)
      checkRangeSelection(carryingFlag, rangeMaxBox)
    } else if (nearestInteraction.type === 'PLACE_RANGE_MAX') {
      if (!carryingFlag) return
      const existing = rangeMaxBox
      setRangeMaxBox(carryingFlag)
      setCarryingFlag(existing)
      playSound('chime')
      showFeedback(`Bendera ${carryingFlag.studentLabel} (${formatDistance(carryingFlag.distance)}m) diletakkan di Kotak Nilai Terbesar (Max)!`, 2200)
      checkRangeSelection(rangeMinBox, carryingFlag)
    } else if (nearestInteraction.type === 'PICKUP_RANGE_MIN') {
      const item = rangeMinBox
      setRangeMinBox(null)
      setCarryingFlag(item)
      playSound('pop')
      showFeedback(`Mengambil kembali ${item?.studentLabel} dari Kotak Min!`, 2000)
    } else if (nearestInteraction.type === 'PICKUP_RANGE_MAX') {
      const item = rangeMaxBox
      setRangeMaxBox(null)
      setCarryingFlag(item)
      playSound('pop')
      showFeedback(`Mengambil kembali ${item?.studentLabel} dari Kotak Max!`, 2000)
    } else if (nearestInteraction.type === 'CHOOSE_QUARTILE') {
      setShowQuartileChoiceModal(true)
    }
  }, [nearestInteraction, carryingFlag, sortingBoxes, rangeMinBox, rangeMaxBox, gameState, playSound, showFeedback, checkRangeSelection, setShowQuartileChoiceModal])

  // Direct Click on a 10-box sorting box
  const handleBoxClick = useCallback((boxIdx: number) => {
    if (gameState !== 'KETUA_KELAS_SORTING') return
    // Kotak #1 (Min) dan Kotak #10 (Max) tetap dari Misi Jangkauan
    if (boxIdx === 0 || boxIdx === 9) {
      playSound('pop')
      showFeedback(`🔒 Kotak #${boxIdx + 1} (${boxIdx === 0 ? 'Min' : 'Max'}) tetap terpasang dari Misi Jangkauan dan tidak perlu diubah!`, 2500)
      return
    }
    if (carryingFlag) {
      const existing = sortingBoxes[boxIdx]
      const nextBoxes = [...sortingBoxes]
      nextBoxes[boxIdx] = carryingFlag
      setSortingBoxes(nextBoxes)
      setCarryingFlag(existing)
      playSound('chime')
      showFeedback(`Bendera ${carryingFlag.studentLabel} (${formatDistance(carryingFlag.distance)}m) dimasukkan ke Kotak #${boxIdx + 1}!`, 2000)
    } else if (sortingBoxes[boxIdx]) {
      const item = sortingBoxes[boxIdx]
      const nextBoxes = [...sortingBoxes]
      nextBoxes[boxIdx] = null
      setSortingBoxes(nextBoxes)
      setCarryingFlag(item)
      playSound('pop')
      showFeedback(`Mengambil kembali ${item?.studentLabel} dari Kotak #${boxIdx + 1}!`, 2000)
    }
  }, [gameState, carryingFlag, sortingBoxes, playSound, showFeedback])

  // Direct Click on Min or Max box in Mission 1
  const handleBoxClickRange = useCallback((type: 'min' | 'max') => {
    if (gameState !== 'MISSION_RANGE') return

    if (type === 'min') {
      if (carryingFlag) {
        const existing = rangeMinBox
        setRangeMinBox(carryingFlag)
        setCarryingFlag(existing)
        playSound('chime')
        showFeedback(`Bendera ${carryingFlag.studentLabel} (${formatDistance(carryingFlag.distance)}m) diletakkan di Kotak Nilai Terkecil (Min)!`, 2200)
        checkRangeSelection(carryingFlag, rangeMaxBox)
      } else if (rangeMinBox) {
        const item = rangeMinBox
        setRangeMinBox(null)
        setCarryingFlag(item)
        playSound('pop')
        showFeedback(`Mengambil kembali ${item.studentLabel} dari Kotak Min!`, 2000)
      }
    } else {
      if (carryingFlag) {
        const existing = rangeMaxBox
        setRangeMaxBox(carryingFlag)
        setCarryingFlag(existing)
        playSound('chime')
        showFeedback(`Bendera ${carryingFlag.studentLabel} (${formatDistance(carryingFlag.distance)}m) diletakkan di Kotak Nilai Terbesar (Max)!`, 2200)
        checkRangeSelection(rangeMinBox, carryingFlag)
      } else if (rangeMaxBox) {
        const item = rangeMaxBox
        setRangeMaxBox(null)
        setCarryingFlag(item)
        playSound('pop')
        showFeedback(`Mengambil kembali ${item.studentLabel} dari Kotak Max!`, 2000)
      }
    }
  }, [gameState, carryingFlag, rangeMinBox, rangeMaxBox, playSound, showFeedback, checkRangeSelection])

  // Direct Click on a Flag on the field
  const handlePickupFlag = useCallback((student: StudentThrowData) => {
    if (gameState !== 'KETUA_KELAS_SORTING' && gameState !== 'MISSION_RANGE') return
    if (!carryingFlag) {
      setCarryingFlag(student)
      playSound('pop')
      if (gameState === 'MISSION_RANGE') {
        showFeedback(`🚩 Mengambil bendera ${student.studentLabel} (${formatDistance(student.distance)}m)! Bawa ke Kotak Min atau Kotak Max di atas.`, 2200)
      } else {
        showFeedback(`🚩 Mengambil bendera ${student.studentLabel} (${formatDistance(student.distance)}m)! Bawa ke kotak yang sesuai.`, 2200)
      }
    } else {
      const coord = getFieldCoordinate(student.distance, student.studentId)
      setTargetMovePos(coord)
    }
  }, [gameState, carryingFlag, playSound, showFeedback])

  // ── KEYBOARD CONTROLS FOR MISSION_RANGE & MISSION_QUARTILES (60FPS SMOOTH) ──
  const rangePressedKeysRef = useRef<Set<string>>(new Set())
  const rangePlayerPosRef = useRef(playerPos)
  const isRangeMovingRef = useRef(false)
  const handleInteractRef = useRef(handleInteract)

  useEffect(() => {
    handleInteractRef.current = handleInteract
  }, [handleInteract])

  useEffect(() => {
    rangePlayerPosRef.current = playerPos
  }, [playerPos])

  useEffect(() => {
    if (gameState !== 'MISSION_RANGE' && gameState !== 'MISSION_QUARTILES') return

    const KEY_VECTORS: Record<string, { x: number; y: number }> = {
      KeyW: { x: 0, y: -1 },
      ArrowUp: { x: 0, y: -1 },
      w: { x: 0, y: -1 },
      W: { x: 0, y: -1 },

      KeyS: { x: 0, y: 1 },
      ArrowDown: { x: 0, y: 1 },
      s: { x: 0, y: 1 },
      S: { x: 0, y: 1 },

      KeyA: { x: -1, y: 0 },
      ArrowLeft: { x: -1, y: 0 },
      a: { x: -1, y: 0 },
      A: { x: -1, y: 0 },

      KeyD: { x: 1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      d: { x: 1, y: 0 },
      D: { x: 1, y: 0 },
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        handleInteractRef.current()
        return
      }

      if (KEY_VECTORS[e.code] || KEY_VECTORS[e.key]) {
        rangePressedKeysRef.current.add(e.code)
        rangePressedKeysRef.current.add(e.key)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      rangePressedKeysRef.current.delete(e.code)
      rangePressedKeysRef.current.delete(e.key)
    }

    let animId: number
    let lastTime = performance.now()

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      let vx = 0
      let vy = 0
      rangePressedKeysRef.current.forEach(k => {
        const v = KEY_VECTORS[k]
        if (v) {
          vx += v.x
          vy += v.y
        }
      })

      if (vx !== 0 || vy !== 0) {
        isRangeMovingRef.current = true
        const len = Math.hypot(vx, vy)
        const dir = { x: vx / len, y: vy / len }
        const speed = 280
        const cur = rangePlayerPosRef.current
        const nextX = Math.max(130, Math.min(1240, cur.x + dir.x * speed * dt))
        const nextY = Math.max(172, Math.min(665, cur.y + dir.y * speed * dt))
        rangePlayerPosRef.current = { x: nextX, y: nextY }
        setPlayerPos({ x: nextX, y: nextY })
        setPlayerDir(dir)
      } else if (isRangeMovingRef.current) {
        isRangeMovingRef.current = false
        setPlayerDir({ x: 0, y: 0 })
      }

      animId = requestAnimationFrame(loop)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    animId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      cancelAnimationFrame(animId)
      rangePressedKeysRef.current.clear()
      if (isRangeMovingRef.current) {
        isRangeMovingRef.current = false
        setPlayerDir({ x: 0, y: 0 })
      }
    }
  }, [gameState])

  // ── RANGE DIFFERENCE CALCULATION SUCCESS ─────
  const handleRangeDifferenceSuccess = useCallback((answer: number) => {
    if (!stats) return
    playSound('chime')
    setShowRangeCalculationModal(false)
    setRibbonPlaced(false)
    addXP(30, 'Menyelesaikan Perhitungan Jangkauan (Range)', 2)
    setScoring(prev => {
      const updated = { ...prev }
      if (updated.missions[1]) {
        updated.missions[1] = { ...updated.missions[1], completed: true }
      }
      return updated
    })
    showFeedback(`🎉 JANGKAUAN (RANGE) = ${formatDistance(stats.range)} m BERHASIL DIHITUNG! Bendera Min & Max tetap tersimpan di kotak untuk pengurutan.`, 4000)

    const preservedMin = rangeMinBox || session?.students.find(s => s.studentId === stats.minStudentId) || null
    const preservedMax = rangeMaxBox || session?.students.find(s => s.studentId === stats.maxStudentId) || null

    setTimeout(() => {
      setCarryingFlag(null)
      setRibbonPlaced(false)
      handleStartSortingSequence(preservedMin, preservedMax)
    }, 2200)
  }, [stats, session, rangeMinBox, rangeMaxBox, playSound, addXP, showFeedback, handleStartSortingSequence])

  // Quick auto-select assistant for Mission 1
  const handleAutoSelectRange = useCallback(() => {
    if (!stats || !session) return
    playSound('chime')
    const minStudent = session.students.find(s => s.studentId === stats.minStudentId) || null
    const maxStudent = session.students.find(s => s.studentId === stats.maxStudentId) || null
    setRangeMinBox(minStudent)
    setRangeMaxBox(maxStudent)
    setCarryingFlag(null)
    setRibbonPlaced(true)
    showFeedback('⚡ Bantuan: Bendera Min dan Max berhasil ditempatkan di kedua kotak! Sekarang masukkan selisihnya.', 3500)
    setTimeout(() => {
      setShowRangeCalculationModal(true)
    }, 600)
  }, [stats, session, playSound, showFeedback])

  // ── STAGE 1: SORTING HANDLERS ────────────────
  const handleCompleteSorting = useCallback(() => {
    playSound('chime')
    addXP(30, 'Menyelesaikan Pengurutan Kotak bersama Ketua Kelas', 1)
    setScoring(prev => {
      const updated = { ...prev }
      if (updated.missions[0]) {
        updated.missions[0] = { ...updated.missions[0], completed: true }
      }
      return updated
    })
    setGameState('SORTING_SUCCESS_ANIMATION')
  }, [addXP])

  const handleProceedFromSortingAnimation = useCallback(() => {
    playSound('chime')
    setGameState('MISSION_QUARTILES')
    setM2Phase('PLACE_POSTS')
    setPlayerPos({ x: SORTED_FLAGS_X_START, y: SORTED_FLAGS_Y + 50 })
    setPlayerDir({ x: 0, y: 0 })
    setTargetMovePos(null)
    setCurrentMissionHint(2)
    setHintLevel(0)
    showFeedback('📊 10 Bendera telah berbaris sejajar di tengah lapangan! Gerakkan Stevunt untuk menentukan letak Kuartil Q1, Q2, dan Q3!', 4000)
  }, [showFeedback])

  const handleCompleteQuartiles = useCallback(() => {
    if (!stats) return
    playSound('chime')
    setM2Phase('COMPLETE')
    setScoring(prev => {
      const updated = { ...prev }
      if (updated.missions[2]) {
        updated.missions[2] = { ...updated.missions[2], completed: true }
      }
      return updated
    })
    addXP(30, 'Menyelesaikan Misi 2: Kuartil', 3)
    showFeedback('🎉 Misi 2 selesai! Seluruh posisi dan nilai kuartil benar!', 3000)

    setTimeout(() => {
      setGameState('MISSION_IQR')
      setM3Phase('PLACE_RIBBON')
      setCurrentMissionHint(3)
      setHintLevel(0)
    }, 1800)
  }, [stats, showFeedback, addXP])

  // ── STAGE 4: IQR HANDLERS ────────────────────
  const handlePlaceGreenRibbon = useCallback(() => {
    playSound('chime')
    setGreenRibbonPlaced(true)
    setGreenRibbonQ1(true)
    setGreenRibbonQ3(true)
  }, [])

  const handleCompleteIQR = useCallback(() => {
    if (!stats) return
    playSound('chime')
    setM3Phase('COMPLETE')
    setScoring(prev => {
      const updated = { ...prev }
      if (updated.missions[3]) {
        updated.missions[3] = { ...updated.missions[3], completed: true }
      }
      return updated
    })
    addXP(35, 'Menyelesaikan Misi 3: Jangkauan Kuartil (IQR)', 4)
    showFeedback('🎉 Misi 3 selesai! Analisis Jangkauan Kuartil tuntas!', 3000)
    setGreenRibbonPlaced(false)
    setGreenRibbonQ1(false)
    setGreenRibbonQ3(false)

    setTimeout(() => {
      setGreenRibbonPlaced(false)
      setGreenRibbonQ1(false)
      setGreenRibbonQ3(false)
      setGameState('MISSION_QD')
      setCurrentMissionHint(4)
      setHintLevel(0)
    }, 1800)
  }, [stats, showFeedback, addXP])

  // ── STAGE 5: SIMPANGAN KUARTIL (QD) HANDLERS ─────────
  const handleCompleteQD = useCallback(() => {
    if (!stats) return
    playSound('chime')
    addXP(40, 'Menyelesaikan Misi 4: Simpangan Kuartil (Qd)', 5)
    showFeedback('🎉 Misi 4 selesai! Analisis Simpangan Kuartil sempurna!', 3000)

    setScoring(prev => {
      const updated = { ...prev }
      if (updated.missions[4]) {
        updated.missions[4] = { ...updated.missions[4], completed: true }
      }
      updated.stars = calculateStars(updated)
      return updated
    })

    awardBadge(LEVEL2_BADGES.FIELD_MASTER)
    const elapsed = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 600
    if (elapsed < 300) awardBadge(LEVEL2_BADGES.SPEED)

    setVerdict('MEASUREMENT_COMPLETE')
    setTimeout(() => {
      setGameState('FINAL_REPORT')
    }, 1500)
  }, [stats, addXP, showFeedback, awardBadge, sessionStartTime, setVerdict])

  // Min and Max Flag coordinates for Mission 1 Ribbon
  const minFlagCoord = useMemo(() => {
    if (!stats) return null
    if (rangeMinBox) return RANGE_MIN_BOX_POS
    return getFieldCoordinate(stats.min, stats.minStudentId)
  }, [stats, rangeMinBox])

  const maxFlagCoord = useMemo(() => {
    if (!stats) return null
    if (rangeMaxBox) return RANGE_MAX_BOX_POS
    return getFieldCoordinate(stats.max, stats.maxStudentId)
  }, [stats, rangeMaxBox])

  // Q1 and Q3 Flag coordinates for Mission 3 Ribbon
  const q1FlagCoord = useMemo(() => {
    if (!stats) return null
    return { x: Q1_TARGET_X, y: SORTED_FLAGS_Y }
  }, [stats])

  const q3FlagCoord = useMemo(() => {
    if (!stats) return null
    return { x: Q3_TARGET_X, y: SORTED_FLAGS_Y }
  }, [stats])

  const activeStudent = session?.students.find(s => s.studentId === activeStudentId)

  const currentViewBox = cameraZoom === 'fit' ? `0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}` : `60 60 1256 648`

  if (gameState === 'HALLWAY_EXPLORATION') {
    return (
      <Level2HallwayWalk
        studentName={studentName}
        onEnterClassroom={() => setGameState('CLASSROOM_PROLOGUE')}
      />
    )
  }

  if (gameState === 'CLASSROOM_PROLOGUE') {
    return (
      <Level2ClassroomWalk
        studentName={studentName}
        onProceedToField={handleTransitionToField}
      />
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        background: '#07131E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      {/* ── AMBIENT BLURRED BACKDROP TO SOFTLY FILL WIDESCREEN / VERTICAL EDGES ── */}
      <div
        style={{
          position: 'absolute',
          inset: -25,
          backgroundImage: 'url("/Assets/Building/field/lapangan_pixel_level2.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(32px) brightness(0.28)',
          transform: 'scale(1.15)',
          pointerEvents: 'none',
        }}
      />

      {/* ── FLOATING TOP CAMERA / ZOOM TOGGLE ── */}
      <div
        style={{
          position: 'absolute',
          top: 'clamp(6px, 1.5vh, 12px)',
          right: 'clamp(10px, 1.5vw, 16px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >

        <button
          onClick={() => setCameraZoom(prev => (prev === 'fit' ? 'focus' : 'fit'))}
          style={{
            background: 'rgba(11, 30, 44, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(245, 158, 11, 0.5)',
            borderRadius: '12px',
            color: '#FCD34D',
            cursor: 'pointer',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 800,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.2s',
          }}
        >
          {cameraZoom === 'fit' ? '🔍 Mode: Lapangan Penuh (Fit)' : '🔍 Mode: Fokus Lapangan'}
        </button>
      </div>

      {/* ── SVG GAME CANVAS (UNZOOMED & PROPORTIONALLY FITTED) ── */}
      <svg
        viewBox={currentViewBox}
        preserveAspectRatio="xMidYMid meet"
        onClick={handleFieldSvgClick}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          maxHeight: '100vh',
          maxWidth: '100vw',
          zIndex: 2,
          filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.8))',
          imageRendering: 'pixelated',
        }}
      >
        <defs>
          {/* Atmospheric Retro Vignette Overlay matching Level 1 */}
          <radialGradient id="field-pixel-vignette" cx="50%" cy="50%" r="72%">
            <stop offset="65%" stopColor="transparent" />
            <stop offset="92%" stopColor="rgba(4, 7, 10, 0.28)" />
            <stop offset="100%" stopColor="rgba(4, 7, 10, 0.52)" />
          </radialGradient>
        </defs>

        {/* Field background placed directly inside SVG with pixelated rendering matching Level 1 */}
        {(gameState === 'SORTING_SUCCESS_ANIMATION' ||
          gameState === 'MISSION_QUARTILES' ||
          gameState === 'MISSION_IQR' ||
          gameState === 'MISSION_QD' ||
          gameState === 'FINAL_REPORT') ? (
          <g id="pure-green-field">
            {/* Base Grass */}
            <rect x="0" y="0" width={FIELD_WIDTH} height={FIELD_HEIGHT} fill="#389B45" />
            {/* Alternating Mowed Lawn Stripes */}
            {Array.from({ length: 14 }).map((_, i) => (
              <rect
                key={`lawn-stripe-${i}`}
                x={i * (FIELD_WIDTH / 14)}
                y="0"
                width={FIELD_WIDTH / 14}
                height={FIELD_HEIGHT}
                fill={i % 2 === 0 ? '#328E3E' : '#3E9E4B'}
              />
            ))}
            {/* Outer Boundary White Line */}
            <rect
              x="50"
              y="30"
              width={FIELD_WIDTH - 100}
              height={FIELD_HEIGHT - 60}
              fill="none"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth={3}
              rx={10}
            />
            {/* Halfway Division Line */}
            <line
              x1={FIELD_WIDTH / 2}
              y1="30"
              x2={FIELD_WIDTH / 2}
              y2={FIELD_HEIGHT - 30}
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth={2}
              strokeDasharray="8 6"
            />
          </g>
        ) : (
          <image
            href="/Assets/Building/field/lapangan_pixel_level2.webp"
            x="0"
            y="0"
            width={FIELD_WIDTH}
            height={FIELD_HEIGHT}
            preserveAspectRatio="none"
            style={{ imageRendering: 'pixelated' }}
          />
        )}

        {/* Vignette Layer */}
        <rect
          x="0"
          y="0"
          width={FIELD_WIDTH}
          height={FIELD_HEIGHT}
          fill="url(#field-pixel-vignette)"
          style={{ pointerEvents: 'none' }}
        />

        {/* ── THROWING FIELD SECTOR LINES & DISTANCE ARCS ── */}
        {gameState !== 'KETUA_KELAS_ENTRANCE' &&
          gameState !== 'KETUA_KELAS_SORTING' &&
          gameState !== 'SORTING_SUCCESS_ANIMATION' &&
          gameState !== 'MISSION_QUARTILES' &&
          gameState !== 'MISSION_IQR' &&
          gameState !== 'MISSION_QD' &&
          gameState !== 'FINAL_REPORT' && (
          <g id="field-court-sector-lines" style={{ pointerEvents: 'none' }}>
          {/* Base Throwing Foul Line / Arc */}
          <path
            d="M 355 635 Q 410 620 465 635"
            fill="none"
            stroke="rgba(255, 255, 255, 0.85)"
            strokeWidth={4}
          />
          {/* Left Sector Boundary Line */}
          <line
            x1={360}
            y1={625}
            x2={280}
            y2={260}
            stroke="rgba(255, 255, 255, 0.75)"
            strokeWidth={3}
          />
          {/* Right Sector Boundary Line */}
          <line
            x1={460}
            y1={625}
            x2={1220}
            y2={260}
            stroke="rgba(255, 255, 255, 0.75)"
            strokeWidth={3}
          />

          {/* Distance Arcs (20m, 30m, 40m, 50m, 60m, 70m, 80m) */}
          {[20, 30, 40, 50, 60, 70, 80].map(dist => {
            const y = distanceToFieldY(dist)
            const bounds = getCourtBoundsAtY(y)
            const midX = (bounds.xLeft + bounds.xRight) / 2
            const arcBow = (dist / 80) * 12
            return (
              <g key={`dist-arc-${dist}`}>
                {/* Arc Line */}
                <path
                  d={`M ${bounds.xLeft} ${y} Q ${midX} ${y + arcBow} ${bounds.xRight} ${y}`}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeWidth={2}
                  strokeDasharray="8 6"
                />
                {/* Left Distance Tag */}
                <g transform={`translate(${bounds.xLeft + 26}, ${y + 4})`}>
                  <rect
                    x={-18}
                    y={-10}
                    width={36}
                    height={18}
                    rx={6}
                    fill="rgba(15, 23, 42, 0.88)"
                    stroke="rgba(255, 255, 255, 0.6)"
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={3}
                    textAnchor="middle"
                    fill="#FDE68A"
                    fontSize={9.5}
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    {dist}m
                  </text>
                </g>
                {/* Right Distance Tag */}
                <g transform={`translate(${bounds.xRight - 26}, ${y + 4})`}>
                  <rect
                    x={-18}
                    y={-10}
                    width={36}
                    height={18}
                    rx={6}
                    fill="rgba(15, 23, 42, 0.88)"
                    stroke="rgba(255, 255, 255, 0.6)"
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={3}
                    textAnchor="middle"
                    fill="#FDE68A"
                    fontSize={9.5}
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    {dist}m
                  </text>
                </g>
              </g>
            )
          })}
        </g>
      )}


        {/* ── 1. MISSION 1 RED RIBBON (Between Min and Max Flags) ── */}
        {gameState === 'MISSION_RANGE' && ribbonPlaced && minFlagCoord && maxFlagCoord && (
          <g>
            <line
              x1={minFlagCoord.x}
              y1={minFlagCoord.y}
              x2={maxFlagCoord.x}
              y2={maxFlagCoord.y}
              stroke="#EF4444"
              strokeWidth={5}
              strokeDasharray="10 6"
              filter="drop-shadow(0 0 8px rgba(239, 68, 68, 0.8))"
            />
            {/* Range midpoint badge */}
            <g transform={`translate(${(minFlagCoord.x + maxFlagCoord.x) / 2}, ${(minFlagCoord.y + maxFlagCoord.y) / 2 - 16})`}>
              <rect x={-65} y={-14} width={130} height={26} rx={13} fill="rgba(15, 23, 42, 0.94)" stroke="#EF4444" strokeWidth={2} />
              <text x={0} y={4} textAnchor="middle" fill="#FFFFFF" fontSize={12} fontWeight="900" fontFamily="var(--font-ui)">
                📏 R: {stats ? formatDistance(stats.range) : ''} m
              </text>
            </g>
          </g>
        )}

        {/* ── 2. MISSION 3 RED RIBBON (Between Q1 and Q3 - BELOW FLAGS WITH SPACING) ── */}
        {gameState === 'MISSION_IQR' && greenRibbonQ1 && greenRibbonQ3 && (
          <g id="iqr-red-ribbon-group">
            {/* Vertical Guide Lines from Q1 and Q3 posts down to ribbon track */}
            <line
              x1={Q1_TARGET_X}
              y1={SORTED_FLAGS_Y + 14}
              x2={Q1_TARGET_X}
              y2={SORTED_FLAGS_Y + 115}
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="4 4"
              strokeOpacity={0.75}
            />
            <line
              x1={Q3_TARGET_X}
              y1={SORTED_FLAGS_Y + 14}
              x2={Q3_TARGET_X}
              y2={SORTED_FLAGS_Y + 115}
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="4 4"
              strokeOpacity={0.75}
            />

            {/* Glowing Anchor Points at bottom of guide drop-lines */}
            <circle cx={Q1_TARGET_X} cy={SORTED_FLAGS_Y + 115} r={6} fill="#EF4444" stroke="#FFFFFF" strokeWidth={2} />
            <circle cx={Q3_TARGET_X} cy={SORTED_FLAGS_Y + 115} r={6} fill="#EF4444" stroke="#FFFFFF" strokeWidth={2} />

            {/* Main Glowing Red Ribbon */}
            <line
              x1={Q1_TARGET_X}
              y1={SORTED_FLAGS_Y + 115}
              x2={Q3_TARGET_X}
              y2={SORTED_FLAGS_Y + 115}
              stroke="#EF4444"
              strokeWidth={7}
              strokeLinecap="round"
              filter="drop-shadow(0 0 12px rgba(239, 68, 68, 0.95))"
            />
            {/* Inner Ribbon Highlight */}
            <line
              x1={Q1_TARGET_X}
              y1={SORTED_FLAGS_Y + 115}
              x2={Q3_TARGET_X}
              y2={SORTED_FLAGS_Y + 115}
              stroke="#FCA5A5"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </g>
        )}

        {/* ── 2B. MISSION 4 SIMPANGAN KUARTIL (QD) VISUAL MARKER (BELOW FLAGS) ── */}
        {gameState === 'MISSION_QD' && stats && (
          <g id="qd-visual-marker">
            {/* Vertical Guide Lines from Q1 and Q3 */}
            <line
              x1={Q1_TARGET_X}
              y1={SORTED_FLAGS_Y + 14}
              x2={Q1_TARGET_X}
              y2={SORTED_FLAGS_Y + 115}
              stroke="rgba(236, 72, 153, 0.6)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <line
              x1={Q3_TARGET_X}
              y1={SORTED_FLAGS_Y + 14}
              x2={Q3_TARGET_X}
              y2={SORTED_FLAGS_Y + 115}
              stroke="rgba(236, 72, 153, 0.6)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            {/* Full IQR track (dashed) */}
            <line
              x1={Q1_TARGET_X}
              y1={SORTED_FLAGS_Y + 115}
              x2={Q3_TARGET_X}
              y2={SORTED_FLAGS_Y + 115}
              stroke="rgba(236, 72, 153, 0.35)"
              strokeWidth={4}
              strokeDasharray="6 4"
            />
            {/* Glowing half-ribbon representing Qd (between Q1 and Q2/midpoint) */}
            <line
              x1={Q1_TARGET_X}
              y1={SORTED_FLAGS_Y + 115}
              x2={Q2_TARGET_X}
              y2={SORTED_FLAGS_Y + 115}
              stroke="#EC4899"
              strokeWidth={7}
              strokeLinecap="round"
              filter="drop-shadow(0 0 12px rgba(236, 72, 153, 0.95))"
            />
            {/* Anchors at Q1, Q2, Q3 */}
            <circle cx={Q1_TARGET_X} cy={SORTED_FLAGS_Y + 115} r={5} fill="#EC4899" stroke="#FFFFFF" strokeWidth={1.5} />
            <circle cx={Q2_TARGET_X} cy={SORTED_FLAGS_Y + 115} r={6} fill="#FDE047" stroke="#EC4899" strokeWidth={2} />
            <circle cx={Q3_TARGET_X} cy={SORTED_FLAGS_Y + 115} r={4} fill="rgba(236, 72, 153, 0.5)" />
          </g>
        )}

        {/* ── 3. MEASUREMENT FLAGS ON THE FIELD (SCATTERED THROW FLAGS) ── */}
        {gameState !== 'MISSION_QUARTILES' &&
          gameState !== 'MISSION_IQR' &&
          gameState !== 'MISSION_QD' &&
          gameState !== 'FINAL_REPORT' &&
          session?.students.filter(s => s.measured).map(student => {
            const isSortingPhase = gameState === 'KETUA_KELAS_SORTING' || gameState === 'KETUA_KELAS_ENTRANCE'
            const isRangePhase = gameState === 'MISSION_RANGE'
            const isPlacedInSortingBox = sortingBoxes.some(b => b?.studentId === student.studentId)
            const isPlacedInRangeBox = rangeMinBox?.studentId === student.studentId || rangeMaxBox?.studentId === student.studentId
            const isBeingCarried = carryingFlag?.studentId === student.studentId

            if ((isSortingPhase && isPlacedInSortingBox) || (isRangePhase && isPlacedInRangeBox) || isBeingCarried) {
              return null
            }

            const coord = getFieldCoordinate(student.distance, student.studentId)
            const isMin = stats ? student.studentId === stats.minStudentId : false
            const isMax = stats ? student.studentId === stats.maxStudentId : false
            const isQ1 = stats ? student.studentId === stats.q1StudentId : false
            const isQ2 = stats ? student.studentId === stats.q2StudentId : false
            const isQ3 = stats ? student.studentId === stats.q3StudentId : false

            return (
              <FieldMeasurementFlag
                key={`flag-${student.studentId}`}
                x={coord.x}
                y={coord.y}
                studentId={student.studentId}
                studentLabel={student.studentLabel}
                distance={student.distance}
                isMin={false}
                isMax={false}
                isQ1={false}
                isQ2={false}
                isQ3={false}
                isSelected={false}
                isClickable={isSortingPhase || isRangePhase}
                onClick={() => handlePickupFlag(student)}
              />
            )
          })}

        {/* ── 3A. MIDDLE FIELD SORTED FLAGS & QUARTILE POSTS (MISSION 2, 3, & 4) ── */}
        {(gameState === 'MISSION_QUARTILES' || gameState === 'MISSION_IQR' || gameState === 'MISSION_QD') && stats && (
          <FieldSortedFlagsRow
            students={stats.sortedStudents}
            stats={stats}
            playerPos={playerPos}
            q1Post={q1Post}
            q2Post={q2Post}
            q3Post={q3Post}
            onFlagClick={idx => {
              const targetX = SORTED_FLAGS_X_START + idx * SORTED_FLAGS_X_STEP
              setTargetMovePos({ x: targetX, y: SORTED_FLAGS_Y + 50 })
            }}
            onMidpointClick={() => {
              setTargetMovePos({ x: Q2_TARGET_X, y: SORTED_FLAGS_Y + 50 })
            }}
          />
        )}

        {/* ── 3B. MISSION 1 TWO BOXES (MIN & MAX) ── */}
        {gameState === 'MISSION_RANGE' && (
          <FieldRangeTwoBoxes
            minBox={rangeMinBox}
            maxBox={rangeMaxBox}
            playerPos={playerPos}
            carryingFlag={carryingFlag}
            onBoxClick={handleBoxClickRange}
          />
        )}

        {/* ── 3C. SORTING BOXES ON FIELD (DURING KETUA KELAS SORTING ONLY) ── */}
        {gameState === 'KETUA_KELAS_SORTING' && (
          <FieldSortingBoxesGroup
            boxes={sortingBoxes}
            playerPos={playerPos}
            carryingFlag={carryingFlag}
            onBoxClick={handleBoxClick}
          />
        )}

        {/* ── 4. PAK BAMBANG TEACHER NPC (Hidden during analysis missions) ── */}
        {gameState !== 'KETUA_KELAS_ENTRANCE' &&
          gameState !== 'KETUA_KELAS_SORTING' &&
          gameState !== 'SORTING_SUCCESS_ANIMATION' &&
          gameState !== 'MISSION_RANGE' &&
          gameState !== 'MISSION_QUARTILES' &&
          gameState !== 'MISSION_IQR' &&
          gameState !== 'MISSION_QD' &&
          gameState !== 'FINAL_REPORT' && (
          <FieldTeacher
            x={PAK_BAMBANG_POS.x}
            y={PAK_BAMBANG_POS.y}
            size={155}
            pose={walkingStudent ? 'point' : gameState === 'GATHER_STUDENTS' ? 'whistle' : gameState === 'BRIEFING' ? 'point' : 'idle'}
            label="👨‍🏫 Pak Bambang"
            showGlow={gameState === 'MEET_TEACHER'}
            onClick={gameState === 'MEET_TEACHER' ? handleStartTeacherBriefing : undefined}
            facing="left"
          />
        )}

        {/* ── 4B. PLAYER CHARACTER (STEVUNT PIXEL ART - LEVEL 1 SMOOTH MOVEMENT) ── */}
        {(gameState === 'KETUA_KELAS_SORTING' ||
          gameState === 'MISSION_RANGE' ||
          gameState === 'MISSION_QUARTILES') && (
          <FieldPlayerCharacter
            x={playerPos.x}
            y={playerPos.y}
            dir={playerDir}
            size={130}
            label="Stevunt"
            carriedFlag={carryingFlag}
            interactionPrompt={interactionPrompt}
          />
        )}

        {/* ── 4C. KETUA KELAS (CLASS LEADER) NPC ── */}
        {(gameState === 'SORTING_SUCCESS_ANIMATION' ||
          gameState === 'FINAL_REPORT') && (
          <FieldClassLeader
            x={leaderPos.x}
            y={leaderPos.y}
            size={140}
            action={leaderAction}
            facing={leaderFacing}
            carriedFlag={null}
            carryingCount={sortingBoxes.filter(b => b !== null).length}
            label="Aditya (Ketua Kelas)"
            showGlow={gameState === 'SORTING_SUCCESS_ANIMATION'}
          />
        )}

        {/* Speech Bubble Prompt over Pak Bambang */}
        {gameState === 'MEET_TEACHER' && (
          <g
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onClick={handleStartTeacherBriefing}
          >
            <rect
              x={PAK_BAMBANG_POS.x - 90}
              y={PAK_BAMBANG_POS.y - 170}
              width={180}
              height={38}
              rx={10}
              fill="rgba(15, 23, 42, 0.96)"
              stroke="#F59E0B"
              strokeWidth={2}
              filter="drop-shadow(0 6px 16px rgba(245, 158, 11, 0.5))"
            />
            <polygon
              points={`${PAK_BAMBANG_POS.x - 8},${PAK_BAMBANG_POS.y - 132} ${PAK_BAMBANG_POS.x + 8},${PAK_BAMBANG_POS.y - 132} ${PAK_BAMBANG_POS.x},${PAK_BAMBANG_POS.y - 124}`}
              fill="rgba(15, 23, 42, 0.96)"
              stroke="#F59E0B"
              strokeWidth={1}
            />
            <text x={PAK_BAMBANG_POS.x} y={PAK_BAMBANG_POS.y - 146} textAnchor="middle" fill="#FCD34D" fontSize={12} fontWeight="900" fontFamily="var(--font-ui)">
              💬 Klik untuk Mulai Pengarahan
            </text>
          </g>
        )}

        {/* ── THROWING STATION & CEKUNGAN LEMPAR HIGHLIGHT ── */}
        {gameState !== 'KETUA_KELAS_ENTRANCE' &&
          gameState !== 'KETUA_KELAS_SORTING' &&
          gameState !== 'SORTING_SUCCESS_ANIMATION' &&
          gameState !== 'MISSION_QUARTILES' &&
          gameState !== 'MISSION_IQR' &&
          gameState !== 'MISSION_QD' &&
          gameState !== 'FINAL_REPORT' && (
          <g id="throwing-station-markings">
            {/* Active Throwing Ring Glow */}
            <ellipse
              cx={THROW_ORIGIN.x}
              cy={THROW_ORIGIN.y}
              rx={58}
              ry={20}
              fill="rgba(245, 158, 11, 0.12)"
              stroke="#F59E0B"
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />

            {/* Center stance mark */}
            <circle cx={THROW_ORIGIN.x} cy={THROW_ORIGIN.y} r={4} fill="#FCD34D" />
            <line x1={THROW_ORIGIN.x - 12} y1={THROW_ORIGIN.y} x2={THROW_ORIGIN.x + 12} y2={THROW_ORIGIN.y} stroke="#FCD34D" strokeWidth={2} />

            {/* Ground Station Label */}
            <text
              x={THROW_ORIGIN.x}
              y={THROW_ORIGIN.y + 22}
              textAnchor="middle"
              fill="#FDE68A"
              fontSize={11}
              fontWeight="900"
              letterSpacing={0.8}
              fontFamily="var(--font-ui)"
              opacity={0.9}
            >
              GARIS BATAS LEMPARAN
            </text>

            {/* Prompt if station is vacant and student waiting */}
            {gameState === 'COLLECTING_DATA' && activeStudentId === null && walkingStudent === null && nextWaitingStudent && (
              <g
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                onClick={handleCallNextStudent}
              >
                <ellipse
                  cx={THROW_ORIGIN.x}
                  cy={THROW_ORIGIN.y}
                  rx={50}
                  ry={16}
                  fill="rgba(56, 189, 248, 0.24)"
                  stroke="#38BDF8"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                />
                <text
                  x={THROW_ORIGIN.x}
                  y={THROW_ORIGIN.y - 30}
                  textAnchor="middle"
                  fill="#38BDF8"
                  fontSize={12}
                  fontWeight="900"
                  filter="drop-shadow(0 2px 6px rgba(0,0,0,0.8))"
                >
                  📍 Tempat Lempar Bola (Klik / [Spasi] untuk Panggil)
                </text>
              </g>
            )}
          </g>
        )}

        {/* ── DESIGNATED QUEUE ZONE / LANE ON RED RUNNING TRACK (FORMASI 10 ATLET) ── */}
        {(gameState === 'COLLECTING_DATA' || gameState === 'STUDENT_CALLED' || gameState === 'READY_TO_THROW' || gameState === 'THROW_IN_PROGRESS') && (
          <g id="queue-lane-demarcation">
            {/* Queue Lane Signpost / Header */}
            <g transform="translate(235, 350)">
              <rect x={-95} y={-13} width={190} height={26} rx={8} fill="rgba(15, 23, 42, 0.94)" stroke="#F59E0B" strokeWidth={1.5} />
              <text x={0} y={4} textAnchor="middle" fill="#FCD34D" fontSize={11} fontWeight="900" fontFamily="var(--font-ui)">
                🏁 FORMASI 10 ATLET KELAS
              </text>
            </g>

            {/* Standing numbered floor pads in 2x5 grid (2 rows x 5 columns = 10 spots) */}
            {Array.from({ length: 10 }).map((_, padIdx) => {
              const padPos = getQueuePosition(padIdx)
              return (
                <g key={`queue-pad-${padIdx}`} transform={`translate(${padPos.x}, ${padPos.y + 4})`}>
                  <ellipse cx={0} cy={0} rx={18} ry={7} fill="rgba(15, 23, 42, 0.7)" stroke="#F59E0B" strokeWidth={1} strokeDasharray="3 3" />
                  <text x={0} y={3} textAnchor="middle" fill="#CBD5E1" fontSize={8} fontWeight="800">
                    #{padIdx + 1}
                  </text>
                </g>
              )
            })}
          </g>
        )}

        {/* ── 2×5 AVATAR FORMATION (DEPTH-SORTED: ROW 1 (BACK), ROW 0 (FRONT)) ── */}
        {(gameState === 'COLLECTING_DATA' || gameState === 'STUDENT_CALLED' || gameState === 'READY_TO_THROW' || gameState === 'THROW_IN_PROGRESS') && session && (() => {
          const nextStudent = session.students.find(s => !s.measured && s.studentId !== activeStudentId && s.studentId !== walkingStudent?.studentId)

          return (
            <g id="students-waiting-10-queue">
              {/* 1. ROW 1 (BACK ROW: spots 5 to 9 - Students 6 to 10) */}
              {session.students
                .filter(s => s.studentId >= 6 && s.studentId <= 10 && !s.measured && s.studentId !== activeStudentId && s.studentId !== walkingStudent?.studentId)
                .map(student => {
                  const pos = getQueuePosition(student.studentId - 1)
                  const isNext = student.studentId === nextStudent?.studentId
                  return (
                    <g
                      key={`queue-student-${student.studentId}`}
                      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                      onClick={() => activeStudentId === null && walkingStudent === null && handleCallStudent(student.studentId)}
                    >
                      <FieldStudentAthlete
                        x={pos.x}
                        y={pos.y}
                        dir={{ x: 1, y: 0 }}
                        mode="idle"
                        size={isNext ? 118 : 100}
                        gender={student.gender || 'male'}
                        avatarUrl={student.avatarUrl}
                        spriteUrl={student.spriteUrl}
                        label={isNext ? `${student.studentLabel} (Berikutnya 📢)` : student.studentLabel}
                        glowColor={isNext ? '#F59E0B' : 'rgba(255,255,255,0.3)'}
                      />
                      {isNext && (
                        <g transform={`translate(${pos.x}, ${pos.y - 110})`}>
                          <rect x={-48} y={-10} width={96} height={20} rx={6} fill="#F59E0B" stroke="#FFFFFF" strokeWidth={1.5} />
                          <text x={0} y={4} textAnchor="middle" fill="#000000" fontSize={10} fontWeight="900">
                            📢 PANGGIL
                          </text>
                        </g>
                      )}
                    </g>
                  )
                })}

              {/* 3. ROW 0 (FRONT ROW: spots 0 to 4 - Students 1 to 5) */}
              {session.students
                .filter(s => s.studentId >= 1 && s.studentId <= 5 && !s.measured && s.studentId !== activeStudentId && s.studentId !== walkingStudent?.studentId)
                .map(student => {
                  const pos = getQueuePosition(student.studentId - 1)
                  const isNext = student.studentId === nextStudent?.studentId
                  return (
                    <g
                      key={`queue-student-${student.studentId}`}
                      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                      onClick={() => activeStudentId === null && walkingStudent === null && handleCallStudent(student.studentId)}
                    >
                      <FieldStudentAthlete
                        x={pos.x}
                        y={pos.y}
                        dir={{ x: 1, y: 0 }}
                        mode="idle"
                        size={isNext ? 124 : 108}
                        gender={student.gender || 'male'}
                        avatarUrl={student.avatarUrl}
                        spriteUrl={student.spriteUrl}
                        label={isNext ? `${student.studentLabel} (Berikutnya 📢)` : student.studentLabel}
                        glowColor={isNext ? '#F59E0B' : 'rgba(255,255,255,0.3)'}
                      />
                      {isNext && (
                        <g transform={`translate(${pos.x}, ${pos.y - 115})`}>
                          <rect x={-48} y={-10} width={96} height={20} rx={6} fill="#F59E0B" stroke="#FFFFFF" strokeWidth={1.5} />
                          <text x={0} y={4} textAnchor="middle" fill="#000000" fontSize={10} fontWeight="900">
                            📢 PANGGIL
                          </text>
                        </g>
                      )}
                    </g>
                  )
                })}
            </g>
          )
        })()}

        {/* ── WALKING STUDENT (FROM QUEUE TO THROW ORIGIN) ── */}
        {walkingStudent && (() => {
          const wStudent = session?.students.find(s => s.studentId === walkingStudent.studentId)
          return (
            <FieldStudentAthlete
              x={walkingStudent.x}
              y={walkingStudent.y}
              dir={{ x: 1, y: 0 }}
              mode="walk"
              size={135}
              gender={wStudent?.gender || 'male'}
              avatarUrl={wStudent?.avatarUrl}
              spriteUrl={wStudent?.spriteUrl}
              label={`${wStudent?.studentLabel || 'Siswa'} 🏃`}
              glowColor="#38BDF8"
            />
          )
        })()}

        {/* ── COMPLETED STUDENTS (CHEERING GROUP AT RIGHT SIDELINE) ── */}
        {(gameState === 'COLLECTING_DATA' || gameState === 'STUDENT_CALLED' || gameState === 'READY_TO_THROW' || gameState === 'THROW_IN_PROGRESS') && session && (
          <g id="students-completed-cheering">
            <g transform="translate(1210, 395)">
              <rect x={-60} y={-12} width={120} height={24} rx={8} fill="rgba(15, 23, 42, 0.92)" stroke="#10B981" strokeWidth={1.5} />
              <text x={0} y={4} textAnchor="middle" fill="#A7F3D0" fontSize={10} fontWeight="900" fontFamily="var(--font-ui)">
                👏 ZONA PENONTON
              </text>
            </g>
            {session.students
              .filter(s => s.measured)
              .map((student, cIdx) => {
                const col = cIdx % 2
                const row = Math.floor(cIdx / 2)
                const x = 1175 + col * 55
                const y = 435 + row * 45
                return (
                  <FieldStudentAthlete
                    key={`completed-student-${student.studentId}`}
                    x={x}
                    y={y}
                    dir={{ x: -1, y: 0 }}
                    mode="idle"
                    size={95}
                    gender={student.gender || 'male'}
                    avatarUrl={student.avatarUrl}
                    spriteUrl={student.spriteUrl}
                    label={`✓ ${student.studentLabel}`}
                    glowColor="#10B981"
                  />
                )
              })}
          </g>
        )}

        {/* ── 5. ACTIVE STUDENT AT THROW LINE ── */}
        {activeStudent && (gameState === 'READY_TO_THROW' || gameState === 'THROW_IN_PROGRESS') && (
          <FieldStudentAthlete
            x={THROW_ORIGIN.x}
            y={THROW_ORIGIN.y}
            size={145}
            mode={athleteMode}
            gender={activeStudent.gender || 'male'}
            avatarUrl={activeStudent.avatarUrl}
            spriteUrl={activeStudent.spriteUrl}
            label={activeStudent.studentLabel}
            glowColor="#F59E0B"
          />
        )}

        {/* ── 6. ARCHERY-STYLE AIMING GUIDE ── */}
        {gameState === 'READY_TO_THROW' && activeStudent && (
          <BallThrowBowAim
            origin={THROW_ORIGIN}
            isActive={true}
            studentLabel={activeStudent.studentLabel}
            studentName={`Siswa #${activeStudent.studentId}`}
            studentAvatar={activeStudent.avatarUrl}
            studentGender={activeStudent.gender}
            onLaunch={handleLaunchThrow}
            disabled={athleteMode === 'throw'}
          />
        )}

        {/* ── 7. FLYING BALL IN AIR ── */}
        {ballFlight && (
          <g>
            {/* Ground shadow beneath flying ball */}
            <ellipse
              cx={ballFlight.x}
              cy={ballFlight.baseY}
              rx={16 * (1 - ballFlight.progress * 0.45)}
              ry={6 * (1 - ballFlight.progress * 0.45)}
              fill="rgba(0, 0, 0, 0.45)"
              filter="blur(2px)"
            />
            {/* High-visibility golden sport ball */}
            <circle
              cx={ballFlight.x}
              cy={ballFlight.y}
              r={15 * (1 - ballFlight.progress * 0.45)}
              fill="#FBBF24"
              stroke="#FFFFFF"
              strokeWidth={2}
              filter="drop-shadow(0 2px 8px rgba(0,0,0,0.6))"
            />
            <circle
              cx={ballFlight.x - 3}
              cy={ballFlight.y - 3}
              r={4}
              fill="#FFFBEB"
              opacity={0.8}
            />

          </g>
        )}

        {/* ── 8. DUST PUFF EFFECT ON IMPACT ── */}
        {dustEffect && (
          <g transform={`translate(${dustEffect.x}, ${dustEffect.y})`}>
            <ellipse cx={0} cy={0} rx={36} ry={14} fill="none" stroke="#FDE68A" strokeWidth={3} opacity={0.8} />
            <ellipse cx={0} cy={0} rx={22} ry={9} fill="rgba(253, 230, 138, 0.4)" />
            <text x={0} y={-10} textAnchor="middle" fontSize={20}>💥</text>
          </g>
        )}


        {/* ── 9. ACTIVE IN-GAME SPEECH BUBBLE (ANCHORED LIKE LEVEL 1) ── */}
        {currentDialog && (() => {
          const isTeacher = currentDialog.speaker === 'teacher'
          const isPlayer = currentDialog.speaker === 'player'
          const isDira = currentDialog.speaker === 'dira'

          const anchorX = isTeacher
            ? PAK_BAMBANG_POS.x
            : isPlayer
            ? (gameState === 'KETUA_KELAS_SORTING' || gameState === 'MISSION_RANGE' || gameState === 'MISSION_QUARTILES' ? playerPos.x : THROW_ORIGIN.x)
            : FIELD_WIDTH / 2

          const anchorY = isTeacher
            ? PAK_BAMBANG_POS.y - 120
            : isPlayer
            ? ((gameState === 'KETUA_KELAS_SORTING' || gameState === 'MISSION_RANGE' || gameState === 'MISSION_QUARTILES' ? playerPos.y : THROW_ORIGIN.y) - 105)
            : 160

          const bW = isDira ? 460 : 380
          const bH = 92
          const bX = Math.max(30, Math.min(FIELD_WIDTH - bW - 30, anchorX - (isTeacher ? bW * 0.35 : bW / 2)))
          const bY = isDira ? 75 : Math.max(25, anchorY - bH - 16)

          const themeColor = isTeacher ? '#F59E0B' : isPlayer ? '#38BDF8' : isDira ? '#A78BFA' : '#10B981'
          const badgeIcon = isTeacher ? '👨‍🏫' : isPlayer ? '🏃‍♂️' : isDira ? '🤖' : '📢'

          return (
            <g
              style={{ cursor: 'pointer', pointerEvents: 'auto' }}
              onClick={handleDialogNext}
            >
              {/* Downward pointer polygon connecting bubble to character head */}
              {!isDira && currentDialog.speaker !== 'system' && (
                <polygon
                  points={`${anchorX - 9},${bY + bH} ${anchorX + 9},${bY + bH} ${anchorX},${anchorY}`}
                  fill="rgba(15, 35, 56, 0.96)"
                  stroke={themeColor}
                  strokeWidth={1.5}
                />
              )}

              <foreignObject
                x={bX}
                y={bY}
                width={bW}
                height={bH}
                style={{ overflow: 'visible' }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 14px 7px 14px',
                    background: 'rgba(15, 35, 56, 0.96)',
                    border: `2px solid ${themeColor}`,
                    borderRadius: '14px',
                    boxShadow: `0 8px 26px rgba(0,0,0,0.8), 0 0 16px ${themeColor}44`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    userSelect: 'none',
                  }}
                >
                  {/* Top Bar: Speaker Badge & Hint */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 900,
                        color: themeColor,
                        fontFamily: 'var(--font-ui)',
                        letterSpacing: '0.4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <span>{badgeIcon}</span>
                      <span>{currentDialog.speakerName}</span>
                    </span>
                    <span
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        color: themeColor,
                        fontFamily: 'var(--font-ui)',
                        opacity: 0.9,
                        letterSpacing: '0.3px',
                      }}
                    >
                      [ Klik / Spasi ▶ ]
                    </span>
                  </div>

                  {/* Body Text: Level 1 Typewriter style */}
                  <div
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-ui)',
                      textAlign: isDira ? 'center' : 'left',
                      lineHeight: 1.4,
                      margin: '2px 0',
                    }}
                  >
                    <Typewriter text={currentDialog.text} />
                  </div>

                  {/* Bottom subtle progress line */}
                  <div style={{ width: '100%', height: '2px', background: `${themeColor}33`, borderRadius: '2px' }} />
                </div>
              </foreignObject>
            </g>
          )
        })()}

      </svg>

      {/* ── FLOATING BANNER NOTIFICATION ── */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{
              position: 'fixed',
              top: '68px',
              left: '30%',
              transform: 'translateX(-50%)',
              zIndex: 600,
              padding: '10px 24px',
              borderRadius: '14px',
              border: '1.5px solid #F59E0B',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 15px rgba(245, 158, 11, 0.4)',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(8px)',
              maxWidth: '520px',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: '13px', color: '#F8FAFC', fontWeight: 700 }}>{feedbackMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ── DATA COLLECTION HUD (ZONA SISWA & PAPAN CATATAN) ── */}
      {(gameState === 'COLLECTING_DATA' || gameState === 'STUDENT_CALLED' || gameState === 'READY_TO_THROW' || gameState === 'THROW_IN_PROGRESS') && session && (
        <div style={{
          position: 'absolute',
          top: '72px',
          left: '16px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '260px',
        }}>
          {/* Call Next Student Quick Action */}
          {nextWaitingStudent && activeStudentId === null && walkingStudent === null && (
            <button
              onClick={handleCallNextStudent}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                border: '1.5px solid #FDE68A',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.45)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>📢</span> Panggil: {nextWaitingStudent.studentLabel} [Spasi]
            </button>
          )}

          {walkingStudent && (
            <div
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1.5px solid #38BDF8',
                color: '#38BDF8',
                fontSize: '11px',
                fontWeight: 800,
                textAlign: 'center',
              }}
            >
              🏃 {session.students.find(s => s.studentId === walkingStudent.studentId)?.studentLabel} sedang menuju garis lempar...
            </div>
          )}

          {/* Zona Siswa Waiting List */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.94)',
            borderRadius: '14px',
            border: '1.5px solid #F59E0B',
            padding: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            color: '#FFFFFF',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#FCD34D', letterSpacing: '0.5px' }}>
                🏫 ANTREAN SISWA ({session.measuredCount}/{TOTAL_STUDENTS})
              </span>
            </div>

            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {session.students.map(student => {
                const isMeasured = student.measured
                const isActive = student.studentId === activeStudentId
                const isWalking = student.studentId === walkingStudent?.studentId
                return (
                  <button
                    key={student.studentId}
                    onClick={() => !isMeasured && activeStudentId === null && walkingStudent === null && handleCallStudent(student.studentId)}
                    disabled={isMeasured || activeStudentId !== null || walkingStudent !== null}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      background: isActive ? 'rgba(245, 158, 11, 0.25)' : isMeasured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                      border: `1px solid ${isActive ? '#F59E0B' : isMeasured ? '#10B981' : 'transparent'}`,
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: isMeasured || activeStudentId !== null ? 'default' : 'pointer',
                    }}
                  >
                    <span>{student.studentLabel}</span>
                    <span style={{ color: isMeasured ? '#10B981' : isWalking ? '#38BDF8' : '#FCD34D' }}>
                      {isMeasured ? `${formatDistance(student.distance)}m ✓` : isWalking ? 'Berjalan 🏃' : isActive ? 'Membidik 🏹' : 'Panggil ▶'}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Quick Simulate Option */}
            {session.measuredCount > 0 && session.measuredCount < TOTAL_STUDENTS && (
              <button
                onClick={handleSimulateRemaining}
                style={{
                  marginTop: '8px',
                  width: '100%',
                  padding: '6px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid #38BDF8',
                  color: '#38BDF8',
                  fontSize: '10.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                ⚡ Kumpulkan Sisa Lemparan Otomatis
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── STAGE 1: KETUA KELAS BOX SORTING MINI-GAME HUD ── */}
      {gameState === 'KETUA_KELAS_SORTING' && session && stats && (
        <LeaderBoxSortingHUD
          students={session.students}
          stats={stats}
          boxes={sortingBoxes}
          carryingFlag={carryingFlag}
          playerPos={playerPos}
          interactionPrompt={interactionPrompt}
          onBoxesChange={setSortingBoxes}
          onCarryingFlagChange={setCarryingFlag}
          onPlayerMove={handlePlayerMove}
          onInteract={handleInteract}
          onComplete={handleCompleteSorting}
          onMistake={incrementMistake}
          playSound={playSound}
          showFeedback={showFeedback}
        />
      )}

      {/* ── STAGE 1: SORTING SUCCESS CELEBRATION ANIMATION ── */}
      <AnimatePresence>
        {gameState === 'SORTING_SUCCESS_ANIMATION' && stats && (
          <SortingCelebrationOverlay
            stats={stats}
            onProceed={handleProceedFromSortingAnimation}
            playSound={playSound}
          />
        )}
      </AnimatePresence>

      {/* ── STAGE 2: MISSION 1 - JANGKAUAN (RANGE) TOP HUD ── */}
      {gameState === 'MISSION_RANGE' && stats && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            maxWidth: '720px',
            width: '92%',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '100%',
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(10px)',
              border: '2px solid #F59E0B',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(245, 158, 11, 0.35)',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              pointerEvents: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1.5px solid #F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                📏
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#FCD34D', letterSpacing: '0.4px' }}>
                  MISI 1: JANGKAUAN LEMPARAN (RANGE)
                </div>
                <div style={{ fontSize: '11px', color: '#CBD5E1' }}>
                  Bawa bendera <b>terdekat</b> ke Kotak Min dan bendera <b>terjauh</b> ke Kotak Max
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleAutoSelectRange}
                style={{
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: '1.5px solid #38BDF8',
                  borderRadius: '10px',
                  color: '#38BDF8',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s',
                }}
              >
                <span>⚡</span>
                <span>Bantuan Auto-Pilih</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RANGE DIFFERENCE CALCULATION MODAL ── */}
      <AnimatePresence>
        {showRangeCalculationModal && stats && rangeMinBox && rangeMaxBox && (
          <RangeDifferenceModal
            minVal={rangeMinBox.distance}
            maxVal={rangeMaxBox.distance}
            rangeVal={stats.range}
            onSuccess={handleRangeDifferenceSuccess}
            onMistake={incrementMistake}
            playSound={playSound}
          />
        )}
      </AnimatePresence>

      {/* ── STAGE 3: MISSION 2 - KUARTIL (Q1, Q2, Q3) MINI-GAME ── */}
      {gameState === 'MISSION_QUARTILES' && stats && (
        <QuartilesMissionPanel
          stats={stats}
          q1Post={q1Post}
          q2Post={q2Post}
          q3Post={q3Post}
          currentPositionLabel={stevuntPositionInfo.label}
          canPlaceHere={stevuntPositionInfo.canPlace}
          onPlacePostAtCurrentPos={handlePlacePostAtCurrentPos}
          onComplete={handleCompleteQuartiles}
          onMistake={incrementMistake}
          playSound={playSound}
        />
      )}

      {/* ── QUARTILE SELECTION MODAL (Triggered when pressing Spacebar near a flag / midpoint) ── */}
      <AnimatePresence>
        {showQuartileChoiceModal && stevuntPositionInfo.canPlace && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 120,
              background: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => setShowQuartileChoiceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'rgba(15, 23, 42, 0.96)',
                border: '2px solid #8B5CF6',
                borderRadius: '16px',
                padding: '20px',
                maxWidth: '380px',
                width: '90%',
                boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 25px rgba(139, 92, 246, 0.3)',
                color: '#FFF',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 900, color: '#C084FC', marginBottom: '6px' }}>
                📍 TENTUKAN KUARTIL
              </div>
              <div style={{ fontSize: '12px', color: '#CBD5E1', marginBottom: '14px' }}>
                Stevunt berada di: <strong style={{ color: '#FDE68A' }}>{stevuntPositionInfo.label}</strong>.
                <br />Pilih tiang kuartil yang sesuai untuk posisi ini:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => {
                    handlePlacePostAtCurrentPos('Q1')
                    setShowQuartileChoiceModal(false)
                  }}
                  disabled={q1Post !== null}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #10B981',
                    background: q1Post !== null ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                    color: '#FFF',
                    fontWeight: 800,
                    fontSize: '12px',
                    cursor: q1Post !== null ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    opacity: q1Post !== null ? 0.6 : 1,
                  }}
                >
                  <span>🟢 Jadikan Tiang Q1 (Kuartil Bawah)</span>
                  <span>{q1Post !== null ? '✓ Terpasang' : 'PILIH'}</span>
                </button>

                <button
                  onClick={() => {
                    handlePlacePostAtCurrentPos('Q2')
                    setShowQuartileChoiceModal(false)
                  }}
                  disabled={q2Post !== null}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #A855F7',
                    background: q2Post !== null ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.15)',
                    color: '#FFF',
                    fontWeight: 800,
                    fontSize: '12px',
                    cursor: q2Post !== null ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    opacity: q2Post !== null ? 0.6 : 1,
                  }}
                >
                  <span>🟣 Jadikan Tiang Q2 (Median / Tengah)</span>
                  <span>{q2Post !== null ? '✓ Terpasang' : 'PILIH'}</span>
                </button>

                <button
                  onClick={() => {
                    handlePlacePostAtCurrentPos('Q3')
                    setShowQuartileChoiceModal(false)
                  }}
                  disabled={q3Post !== null}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #F43F5E',
                    background: q3Post !== null ? 'rgba(244, 63, 94, 0.2)' : 'rgba(244, 63, 94, 0.15)',
                    color: '#FFF',
                    fontWeight: 800,
                    fontSize: '12px',
                    cursor: q3Post !== null ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    opacity: q3Post !== null ? 0.6 : 1,
                  }}
                >
                  <span>🔴 Jadikan Tiang Q3 (Kuartil Atas)</span>
                  <span>{q3Post !== null ? '✓ Terpasang' : 'PILIH'}</span>
                </button>
              </div>

              <button
                onClick={() => setShowQuartileChoiceModal(false)}
                style={{
                  marginTop: '12px',
                  width: '100%',
                  padding: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#94A3B8',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Batal / Lanjut Jalan
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── STAGE 4: MISSION 3 - JANGKAUAN KUARTIL (IQR) QUESTION & MINI-GAME ── */}
      {gameState === 'MISSION_IQR' && stats && (
        <IQRMissionPanel
          stats={stats}
          greenRibbonPlaced={greenRibbonPlaced}
          onPlaceGreenRibbon={handlePlaceGreenRibbon}
          onComplete={handleCompleteIQR}
          onMistake={incrementMistake}
          playSound={playSound}
        />
      )}

      {/* ── STAGE 5: MISSION 4 - SIMPANGAN KUARTIL (QD) MINI-GAME ── */}
      {gameState === 'MISSION_QD' && stats && (
        <QuartileDeviationMissionPanel
          stats={stats}
          onComplete={handleCompleteQD}
          onMistake={incrementMistake}
          playSound={playSound}
        />
      )}

      {/* ── FINAL COMPREHENSIVE REPORT MODAL ── */}
      <AnimatePresence>
        {gameState === 'FINAL_REPORT' && stats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              padding: '16px',
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              borderRadius: '24px',
              border: '2px solid #F59E0B',
              padding: '28px 32px',
              maxWidth: '650px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(245, 158, 11, 0.4)',
              color: '#FFFFFF',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆 🌟</div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#FCD34D', margin: '0 0 4px' }}>
                Laporan Investigasi Lemparan Selesai!
              </h2>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#94A3B8' }}>
                Seluruh tahapan statistika lapangan berhasil diselesaikan bersama Ketua Kelas Aditya!
              </p>
              <div style={{ fontSize: '22px', margin: '0 0 14px' }}>
                {'⭐'.repeat(scoring.stars || 3)}
              </div>

              {/* Comprehensive Stats Grid */}
              <div style={{
                background: 'rgba(0,0,0,0.35)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '16px',
                margin: '0 0 20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                textAlign: 'left',
                fontSize: '12px',
              }}>
                <div>📍 Lemparan Terpendek: <b>{formatDistance(stats.min)} m</b></div>
                <div>📍 Lemparan Terjauh: <b>{formatDistance(stats.max)} m</b></div>
                <div>📏 Jangkauan (Range): <b style={{ color: '#EF4444' }}>{formatDistance(stats.range)} m</b></div>
                <div>📊 Kuartil Bawah (Q1): <b style={{ color: '#34D399' }}>{formatDistance(stats.q1)} m</b></div>
                <div>📊 Median (Q2): <b style={{ color: '#C084FC' }}>{formatDistance(stats.q2)} m</b></div>
                <div>📊 Kuartil Atas (Q3): <b style={{ color: '#F472B6' }}>{formatDistance(stats.q3)} m</b></div>
                <div>🌿 Jangkauan Kuartil (IQR): <b style={{ color: '#10B981' }}>{formatDistance(stats.iqr)} m</b></div>
                <div style={{ gridColumn: 'span 2', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  📐 Simpangan Kuartil (Qd = ½(Q3 − Q1)):{' '}
                  <b style={{ color: '#F472B6', fontSize: '14px' }}>{stats.qd} m</b>
                  <span style={{ fontSize: '10.5px', color: '#94A3B8', display: 'block', marginTop: '2px' }}>
                    Setengah dari jangkauan kuartil: Qd = ½ × (Q3 − Q1) = ½ × {formatDistance(stats.iqr)} m = {stats.qd} m.
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  completeLevel(2)
                  router.push('/siswa')
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '15px',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
                }}
              >
                KEMBALI KE MARKAS DETEKTIF ▶
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CINEMATIC TRANSITION TO FIELD SCREEN ── */}
      <AnimatePresence>
        {gameState === 'TRANSITION_TO_FIELD' && (
          <motion.div
            key="transition-to-field"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 900,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(ellipse at center, #0F172A 0%, #020617 100%)',
              color: '#FFFFFF',
              textAlign: 'center',
              padding: '24px',
            }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
              style={{ fontSize: '56px', marginBottom: '16px' }}
            >
              🏃‍♂️ 💨 ⚽
            </motion.div>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#FCD34D',
                margin: '0 0 10px',
                letterSpacing: '0.5px',
              }}
            >
              Menuju Lapangan Sekolah...
            </h2>
            <p style={{ fontSize: '14px', color: '#94A3B8', maxWidth: '440px', lineHeight: 1.6, margin: 0 }}>
              Pak Bambang dan 10 siswa kelas VII-B telah bersiap di pinggir lapangan untuk agenda pengukuran lemparan!
            </p>

            <div
              style={{
                marginTop: '28px',
                width: '60px',
                height: '4px',
                borderRadius: '2px',
                background: 'linear-gradient(90deg, #F59E0B, #10B981)',
                animation: 'pulse 1.5s infinite',
              }}
            />
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
