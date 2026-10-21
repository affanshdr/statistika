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
  CLASSROOM_DIALOGS,
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
// FIELD COORDINATES & CONSTANTS (2171 x 724 NATIVE RESOLUTION)
// ──────────────────────────────────────────────────────
const FIELD_WIDTH = 2171
const FIELD_HEIGHT = 724
const THROW_ORIGIN = { x: 520, y: 645 }
const PAK_BAMBANG_POS = { x: 280, y: 635 }

export const LEVEL2_BADGES = {
  FIELD_MASTER: { id: 'field-master-l2', icon: '🏅', name: 'Ahli Lapangan', desc: 'Menyelesaikan semua misi pengukuran lemparan' },
  PERFECT: { id: 'perfect-stats-l2', icon: '🎯', name: 'Statistisi Sempurna', desc: 'Meraih 3 bintang di Level 2' },
  SPEED: { id: 'speed-stats-l2', icon: '⚡', name: 'Pengukur Cepat', desc: 'Selesai di bawah 5 menit' },
}

// ──────────────────────────────────────────────────────
// AUDIO SYNTHESIS
// ──────────────────────────────────────────────────────
function playSound(type: 'chime' | 'throw' | 'whistle' | 'error') {
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
function getFieldCoordinate(distance: number, studentId: number) {
  const y = distanceToFieldY(distance)
  const bounds = getCourtBoundsAtY(y)
  const laneIndex = (studentId * 2.7) % 10
  const lateralSpan = (bounds.xRight - bounds.xLeft) * 0.42
  const x = bounds.xCenter + ((laneIndex - 4.5) / 5) * lateralSpan
  return { x, y }
}

// ──────────────────────────────────────────────────────
// HINT HELPER
// ──────────────────────────────────────────────────────
function getHint(mission: 1 | 2 | 3, level: HintLevel, stats?: ComputedStats): string {
  if (mission === 1) {
    if (level === 1) return 'Perhatikan jarak yang paling kecil (terdekat) dan paling besar (terjauh) pada Papan Catatan Lapangan.'
    if (level === 2) return 'Tentukan bendera nilai maksimum (terjauh) dan minimum (terdekat). Jangkauan = Nilai Maksimum − Nilai Minimum.'
    if (level === 3 && stats) return `Nilai maksimum adalah ${formatDistance(stats.max)} m, dan nilai minimum adalah ${formatDistance(stats.min)} m. Hitung: ${formatDistance(stats.max)} − ${formatDistance(stats.min)}.`
  }
  if (mission === 2) {
    if (level === 1) return 'Urutkan seluruh 15 jarak lemparan dari terdekat (terkecil) sampai terjauh (terbesar).'
    if (level === 2) return 'Untuk n=15: Q1 adalah data ke-4, Q2 (median) data ke-8, dan Q3 data ke-12.'
    if (level === 3 && stats) return `Data urutan ke-4 = ${formatDistance(stats.q1)} m (Q1), urutan ke-8 = ${formatDistance(stats.q2)} m (Q2), dan urutan ke-12 = ${formatDistance(stats.q3)} m (Q3).`
  }
  if (mission === 3) {
    if (level === 1) return 'Perhatikan rentang 50% data di tengah antara tiang Q1 dan tiang Q3.'
    if (level === 2) return 'Jangkauan Kuartil (IQR) adalah selisih antara kuartil atas dan kuartil bawah: IQR = Q3 − Q1.'
    if (level === 3 && stats) return `Nilai Q1 = ${formatDistance(stats.q1)} m dan Q3 = ${formatDistance(stats.q3)} m. Hitung: ${formatDistance(stats.q3)} − ${formatDistance(stats.q1)}.`
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
  const [gameState, setGameState] = useState<Level2State>('LEVEL_START')
  const [session, setSession] = useState<ThrowSessionData | null>(null)
  const [stats, setStats] = useState<ComputedStats | null>(null)
  const [scoring, setScoring] = useState<SessionScoring>(createInitialScoring())
  const [pendingBadges, setPendingBadges] = useState<PendingBadge[]>([])

  // ── CLASSROOM PROLOGUE STATE ─────────────────
  const [classroomIndex, setClassroomIndex] = useState(0)
  const currentClassroomDialog = CLASSROOM_DIALOGS[classroomIndex]

  // ── PLAYER (DETECTIVE) & TEACHER STATE ────────
  const [playerPos, setPlayerPos] = useState({ x: 480, y: 645 })
  const [playerDir, setPlayerDir] = useState({ x: 0, y: 0 })
  const [playerMode, setPlayerMode] = useState<'idle' | 'walk'>('idle')

  const distToPak = Math.hypot(playerPos.x - PAK_BAMBANG_POS.x, playerPos.y - PAK_BAMBANG_POS.y)
  const isNearPak = distToPak < 240

  // ── DIALOG STATE ─────────────────────────────
  const [dialogIndex, setDialogIndex] = useState(0)
  const [currentDialog, setCurrentDialog] = useState<DialogLine | null>(null)
  const [showDiraBriefing, setShowDiraBriefing] = useState(false)

  // ── THROWING & ATHLETE STATE ─────────────────
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null)
  const [athleteMode, setAthleteMode] = useState<'idle' | 'aim' | 'throw'>('idle')
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
  const [selectedMinFlag, setSelectedMinFlag] = useState<number | null>(null)
  const [selectedMaxFlag, setSelectedMaxFlag] = useState<number | null>(null)
  const [ribbonPlaced, setRibbonPlaced] = useState(false)
  const [rangeAnswer, setRangeAnswer] = useState('')
  const [rangeError, setRangeError] = useState('')

  // ── MISSION 2: QUARTILES STATE ───────────────
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

  // ── MISSION 3: IQR STATE ─────────────────────
  const [m3Phase, setM3Phase] = useState<MissionIQRPhase>('PLACE_RIBBON')
  const [greenRibbonQ1, setGreenRibbonQ1] = useState(false)
  const [greenRibbonQ3, setGreenRibbonQ3] = useState(false)
  const [iqrAnswer, setIqrAnswer] = useState('')
  const [iqrError, setIqrError] = useState('')

  // ── HINTS & FEEDBACK ─────────────────────────
  const [currentMissionHint, setCurrentMissionHint] = useState<1 | 2 | 3>(1)
  const [hintLevel, setHintLevel] = useState<HintLevel>(0)
  const [showHintPanel, setShowHintPanel] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)
  const feedbackTimer = useRef<NodeJS.Timeout | null>(null)

  // ── INITIALIZATION ───────────────────────────
  useEffect(() => {
    useGameStore.getState().startLevel(2)
    const newSession = createThrowSession()
    setSession(newSession)

    const timer = setTimeout(() => {
      setGameState('CLASSROOM_PROLOGUE')
    }, 400)

    return () => clearTimeout(timer)
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
      showFeedback('📢 Pak Bambang meniup peluit! 15 Siswa bersiap di pinggir lapangan...', 2500)
      setTimeout(() => {
        setGameState('COLLECTING_DATA')
        showFeedback('👥 Pilih siswa di Zona Siswa atau mulai lemparan!', 2500)
      }, 1800)
    }, 1800)
  }, [showFeedback])

  const handleClassroomNext = useCallback(() => {
    playSound('chime')
    if (classroomIndex < CLASSROOM_DIALOGS.length - 1) {
      setClassroomIndex(prev => prev + 1)
    } else {
      handleTransitionToField()
    }
  }, [classroomIndex, handleTransitionToField])

  // Space / Enter shortcut for classroom dialogue
  useEffect(() => {
    if (gameState !== 'CLASSROOM_PROLOGUE') return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        handleClassroomNext()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [gameState, handleClassroomNext])

  const awardBadge = useCallback((badge: typeof LEVEL2_BADGES[keyof typeof LEVEL2_BADGES]) => {
    unlockBadge(badge.id)
    setPendingBadges(prev => [...prev, badge])
  }, [unlockBadge])

  const dismissBadge = () => setPendingBadges(prev => prev.slice(1))

  // ── CAMERA ZOOM FRAMING STATE (FIT / FOCUS) ──
  const [cameraZoom, setCameraZoom] = useState<'fit' | 'focus'>('fit')

  // ── PLAYER MOVEMENT WITH WASD / ARROW KEYS ───
  useEffect(() => {
    if (gameState !== 'MEET_TEACHER' && gameState !== 'COLLECTING_DATA') return

    const activeKeys = new Set<string>()

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      activeKeys.add(key)

      if (key === 'e' || key === ' ' || key === 'enter') {
        if (isNearPak && gameState === 'MEET_TEACHER') {
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
        setPlayerMode('walk')
        setPlayerPos(prev => ({
          x: Math.max(160, Math.min(2010, prev.x + dx * 14)),
          y: Math.max(400, Math.min(675, prev.y + dy * 10)),
        }))
      } else {
        setPlayerDir({ x: 0, y: 0 })
        setPlayerMode('idle')
      }
    }, 30)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      clearInterval(moveLoop)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState, isNearPak])

  // ── TEACHER BRIEFING ─────────────────────────
  const handleStartTeacherBriefing = useCallback(() => {
    playSound('chime')
    setGameState('BRIEFING')
    setDialogIndex(0)
    setCurrentDialog(BRIEFING_DIALOGS[0])
  }, [])

  const handleDialogNext = useCallback(() => {
    if (gameState === 'BRIEFING') {
      const nextIdx = dialogIndex + 1
      if (nextIdx < BRIEFING_DIALOGS.length) {
        setDialogIndex(nextIdx)
        setCurrentDialog(BRIEFING_DIALOGS[nextIdx])
      } else {
        setCurrentDialog(null)
        setShowDiraBriefing(true)
      }
    }
  }, [gameState, dialogIndex])

  const handleGatherStudents = useCallback(() => {
    setShowDiraBriefing(false)
    playSound('whistle')
    setGameState('GATHER_STUDENTS')
    showFeedback('📢 Pak Bambang meniup peluit! 15 Siswa bersiap di lapangan...', 2500)

    setTimeout(() => {
      setGameState('COLLECTING_DATA')
      showFeedback('👥 Pilih siswa di Zona Siswa atau mulai lemparan!', 2500)
    }, 1800)
  }, [showFeedback])

  // ── CALLING STUDENT TO THROW LINE ────────────
  const handleCallStudent = useCallback((studentId: number) => {
    if (!session) return
    const student = session.students.find(s => s.studentId === studentId)
    if (!student || student.measured) return
    if (activeStudentId !== null) return

    setActiveStudentId(studentId)
    setAthleteMode('aim')
    setGameState('READY_TO_THROW')
    showFeedback(`🏃 ${student.studentLabel} bersiap di garis lempar. Bidik & tarik lemparan!`, 2000)
  }, [session, activeStudentId, showFeedback])

  // ── ARCHERY-STYLE PROJECTILE LAUNCH ──────────
  const handleLaunchThrow = useCallback((throwParams: { angle: number; power: number; distance: number }) => {
    if (!session || activeStudentId === null) return
    const student = session.students.find(s => s.studentId === activeStudentId)
    if (!student) return

    playSound('throw')
    setGameState('THROW_IN_PROGRESS')
    setAthleteMode('throw')

    // Calculated target position on the 2D field
    // Blend target distance from user's power with student's assigned variance
    const actualDistance = student.distance
    const targetCoord = getFieldCoordinate(actualDistance, student.studentId)
    const startCoord = { x: THROW_ORIGIN.x + 35, y: THROW_ORIGIN.y - 110 }

    // Animation progress
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

        // Landing impact & dust puff
        setDustEffect({ x: targetCoord.x, y: targetCoord.y })
        setTimeout(() => setDustEffect(null), 700)
        playSound('whistle')

        // Record measurement into session
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

        // Move detective Stevunt over to inspect landing
        setPlayerPos({ x: Math.max(160, targetCoord.x - 70), y: Math.min(670, targetCoord.y + 30) })

        setTimeout(() => {
          setActiveStudentId(null)

          if (newMeasuredCount >= TOTAL_STUDENTS) {
            playSound('whistle')
            setGameState('DATA_COLLECTION_COMPLETE')
            setCurrentDialog(DATA_COMPLETE_DIALOG)

            const computed = computeStats(updatedSession)
            setStats(computed)

            setTimeout(() => {
              setCurrentDialog(null)
              setGameState('MISSION_RANGE')
              setM1Phase('SELECT_FLAGS')
              setCurrentDialog(MISSION1_INTRO)
              setCurrentMissionHint(1)
              setHintLevel(0)
            }, 3000)
          } else {
            setGameState('COLLECTING_DATA')
          }
        }, 1200)
      }
    }, 30)
  }, [session, activeStudentId, showFeedback])

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

    showFeedback('⚡ Seluruh 15 data lemparan berhasil dicatat di lapangan!', 2500)

    setGameState('DATA_COLLECTION_COMPLETE')
    setCurrentDialog(DATA_COMPLETE_DIALOG)

    setTimeout(() => {
      setCurrentDialog(null)
      setGameState('MISSION_RANGE')
      setM1Phase('SELECT_FLAGS')
      setCurrentDialog(MISSION1_INTRO)
      setCurrentMissionHint(1)
      setHintLevel(0)
    }, 2800)
  }, [session, showFeedback])

  // ── MISSION 1: RANGE HANDLERS ────────────────
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
      showFeedback('❌ Pilihan bendera belum tepat. Periksa kembali nilai terkecil dan terbesar pada papan catatan.', 3000)
      setSelectedMinFlag(null)
      setSelectedMaxFlag(null)
    }
  }, [stats, selectedMinFlag, selectedMaxFlag, showFeedback, incrementMistake])

  const handleSubmitRange = useCallback(() => {
    if (!stats) return

    if (validateAnswer(rangeAnswer, stats.range, 0.05)) {
      playSound('chime')
      setM1Phase('COMPLETE')
      setScoring(prev => {
        const updated = { ...prev }
        updated.missions[0] = { ...updated.missions[0], completed: true }
        return updated
      })
      addXP(25, 'Menyelesaikan Misi 1: Jangkauan', 1)
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
      setRangeError('Jawaban belum tepat. Jangkauan = Nilai Terbesar − Nilai Terkecil')
      setScoring(prev => {
        const updated = { ...prev }
        updated.missions[0] = { ...updated.missions[0], answerErrors: updated.missions[0].answerErrors + 1, firstAttemptCorrect: false }
        return updated
      })
      incrementMistake()
    }
  }, [stats, rangeAnswer, showFeedback, addXP, incrementMistake])

  // ── MISSION 2: QUARTILES HANDLERS ────────────
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
    }

    if (isCorrect) {
      playSound('chime')
      setM2Phase('PLACE_POSTS')
      setSortError('')
      showFeedback('✅ Urutan data benar! Sekarang pasang tiang kuartil Q1, Q2, dan Q3.', 3000)
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

    const q1Valid = validateAnswer(q1Answer, stats.q1, 0.05)
    const q2Valid = validateAnswer(q2Answer, stats.q2, 0.05)
    const q3Valid = validateAnswer(q3Answer, stats.q3, 0.05)

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
      setQuartileError('Nilai kuartil belum tepat. Periksa nilai jarak pada urutan ke-4, ke-8, dan ke-12.')
      setScoring(prev => {
        const updated = { ...prev }
        updated.missions[1] = { ...updated.missions[1], answerErrors: updated.missions[1].answerErrors + 1, firstAttemptCorrect: false }
        return updated
      })
      incrementMistake()
    }
  }, [stats, q1Answer, q2Answer, q3Answer, showFeedback, addXP, incrementMistake])

  // ── MISSION 3: IQR HANDLERS ──────────────────
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

    if (validateAnswer(iqrAnswer, stats.iqr, 0.05)) {
      playSound('chime')
      setM3Phase('COMPLETE')
      setScoring(prev => {
        const updated = { ...prev }
        updated.missions[2] = { ...updated.missions[2], completed: true }
        return updated
      })
      addXP(35, 'Menyelesaikan Misi 3: IQR', 3)
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

  // Min and Max Flag coordinates for Mission 1 Ribbon
  const minFlagCoord = useMemo(() => {
    if (!stats) return null
    return getFieldCoordinate(stats.min, stats.minStudentId)
  }, [stats])

  const maxFlagCoord = useMemo(() => {
    if (!stats) return null
    return getFieldCoordinate(stats.max, stats.maxStudentId)
  }, [stats])

  // Q1 and Q3 Flag coordinates for Mission 3 Ribbon
  const q1FlagCoord = useMemo(() => {
    if (!stats) return null
    return getFieldCoordinate(stats.q1, stats.q1StudentId)
  }, [stats])

  const q3FlagCoord = useMemo(() => {
    if (!stats) return null
    return getFieldCoordinate(stats.q3, stats.q3StudentId)
  }, [stats])

  const activeStudent = session?.students.find(s => s.studentId === activeStudentId)

  const currentViewBox = cameraZoom === 'fit' ? `0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}` : `120 120 1930 580`

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
          backgroundImage: 'url("/Assets/Building/field/lapangan_saja.png")',
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
            background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid #8C6239',
            borderRadius: '12px',
            color: '#362014',
            cursor: 'pointer',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 900,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
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
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          maxHeight: '100vh',
          maxWidth: '100vw',
          zIndex: 2,
          filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.8))',
        }}
      >
        {/* Field background placed directly inside SVG so field and characters scale 1:1 together */}
        <image
          href="/Assets/Building/field/lapangan_saja.png"
          x="0"
          y="0"
          width={FIELD_WIDTH}
          height={FIELD_HEIGHT}
          preserveAspectRatio="none"
        />


        {/* ── 1. MISSION 1 RED RIBBON (Between Min and Max Flags) ── */}
        {ribbonPlaced && minFlagCoord && maxFlagCoord && (
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
              <rect x={-65} y={-14} width={130} height={26} rx={13} fill="#FDF8EC" stroke="#8C6239" strokeWidth={2} style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))' }} />
              <text x={0} y={4} textAnchor="middle" fill="#362014" fontSize={12} fontWeight="900" fontFamily="var(--font-ui)">
                📏 R: {stats ? formatDistance(stats.range) : ''} m
              </text>
            </g>
          </g>
        )}

        {/* ── 2. MISSION 3 GREEN RIBBON (Between Q1 and Q3) ── */}
        {greenRibbonQ1 && greenRibbonQ3 && q1FlagCoord && q3FlagCoord && (
          <g>
            <line
              x1={q1FlagCoord.x}
              y1={q1FlagCoord.y}
              x2={q3FlagCoord.x}
              y2={q3FlagCoord.y}
              stroke="#10B981"
              strokeWidth={6}
              filter="drop-shadow(0 0 10px rgba(16, 185, 129, 0.9))"
            />
            {/* IQR midpoint badge */}
            <g transform={`translate(${(q1FlagCoord.x + q3FlagCoord.x) / 2}, ${(q1FlagCoord.y + q3FlagCoord.y) / 2 - 18})`}>
              <rect x={-75} y={-14} width={150} height={28} rx={14} fill="rgba(6, 78, 59, 0.95)" stroke="#10B981" strokeWidth={2} />
              <text x={0} y={5} textAnchor="middle" fill="#FFFFFF" fontSize={13} fontWeight="900" fontFamily="var(--font-ui)">
                ✨ IQR: {stats ? formatDistance(stats.iqr) : ''} m
              </text>
            </g>
          </g>
        )}

        {/* ── 3. MEASUREMENT FLAGS ON THE FIELD ── */}
        {session?.students.filter(s => s.measured).map(student => {
          const coord = getFieldCoordinate(student.distance, student.studentId)
          const isMin = stats ? student.studentId === stats.minStudentId : false
          const isMax = stats ? student.studentId === stats.maxStudentId : false
          const isQ1 = stats ? student.studentId === stats.q1StudentId : false
          const isQ2 = stats ? student.studentId === stats.q2StudentId : false
          const isQ3 = stats ? student.studentId === stats.q3StudentId : false

          const isClickableM1 = m1Phase === 'SELECT_FLAGS' && gameState === 'MISSION_RANGE'
          const isSelected = selectedMinFlag === student.studentId || selectedMaxFlag === student.studentId

          return (
            <FieldMeasurementFlag
              key={`flag-${student.studentId}`}
              x={coord.x}
              y={coord.y}
              studentId={student.studentId}
              studentLabel={student.studentLabel}
              distance={student.distance}
              isMin={isMin}
              isMax={isMax}
              isQ1={isQ1}
              isQ2={isQ2}
              isQ3={isQ3}
              isSelected={isSelected}
              isClickable={isClickableM1}
              onClick={() => {
                if (!isClickableM1) return
                if (selectedMinFlag === null) handleSelectFlag(student.studentId, 'min')
                else if (selectedMaxFlag === null && student.studentId !== selectedMinFlag) handleSelectFlag(student.studentId, 'max')
              }}
            />
          )
        })}

        {/* ── 4. PAK BAMBANG TEACHER NPC ── */}
        <FieldTeacher
          x={PAK_BAMBANG_POS.x}
          y={PAK_BAMBANG_POS.y}
          size={195}
          pose={gameState === 'GATHER_STUDENTS' ? 'whistle' : gameState === 'BRIEFING' ? 'point' : 'idle'}
          label="👨‍🏫 Pak Bambang"
          showGlow={isNearPak && gameState === 'MEET_TEACHER'}
          onClick={isNearPak && gameState === 'MEET_TEACHER' ? handleStartTeacherBriefing : undefined}
        />

        {/* Speech Bubble Prompt over Pak Bambang */}
        {isNearPak && gameState === 'MEET_TEACHER' && (
          <g
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onClick={handleStartTeacherBriefing}
          >
            <rect
              x={PAK_BAMBANG_POS.x - 105}
              y={PAK_BAMBANG_POS.y - 210}
              width={210}
              height={44}
              rx={12}
              fill="#FDF8EC"
              stroke="#8C6239"
              strokeWidth={2}
              filter="drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35))"
            />
            <polygon
              points={`${PAK_BAMBANG_POS.x - 10},${PAK_BAMBANG_POS.y - 166} ${PAK_BAMBANG_POS.x + 10},${PAK_BAMBANG_POS.y - 166} ${PAK_BAMBANG_POS.x},${PAK_BAMBANG_POS.y - 156}`}
              fill="#FDF8EC"
              stroke="#8C6239"
              strokeWidth={1}
            />
            <text x={PAK_BAMBANG_POS.x} y={PAK_BAMBANG_POS.y - 183} textAnchor="middle" fill="#362014" fontSize={13} fontWeight="900" fontFamily="var(--font-ui)">
              💬 Klik / [ E ] untuk Bicara
            </text>
          </g>
        )}

        {/* ── 5. ACTIVE STUDENT AT THROW LINE ── */}
        {activeStudent && (gameState === 'READY_TO_THROW' || gameState === 'THROW_IN_PROGRESS') && (
          <FieldStudentAthlete
            x={THROW_ORIGIN.x}
            y={THROW_ORIGIN.y}
            size={200}
            mode={athleteMode}
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

        {/* ── 9. PLAYER (DETECTIVE STEVUNT) ── */}
        <FieldStudentAthlete
          x={playerPos.x}
          y={playerPos.y}
          dir={playerDir}
          mode={playerMode}
          size={195}
          label={`${studentName} 🕵️`}
          glowColor="#00ADB5"
        />
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
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 600,
              padding: '10px 24px',
              borderRadius: '16px',
              border: '2px solid #8C6239',
              boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
              background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
              backdropFilter: 'blur(8px)',
              maxWidth: '520px',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: '13px', color: '#362014', fontWeight: 800 }}>{feedbackMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── IN-GAME DIALOGUE OVERLAY ── */}
      <AnimatePresence>
        {currentDialog && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 500,
              width: '90%',
              maxWidth: '720px',
              background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
              borderRadius: '24px',
              border: '2.5px solid #8C6239',
              padding: '22px 26px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
              color: '#362014',
            }}
          >
            {/* Corner brackets */}
            <div style={{ position: 'absolute', top: 8, left: 8, width: 14, height: 14, borderTop: '3px solid #8C6239', borderLeft: '3px solid #8C6239', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 8, right: 8, width: 14, height: 14, borderTop: '3px solid #8C6239', borderRight: '3px solid #8C6239', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 8, left: 8, width: 14, height: 14, borderBottom: '3px solid #8C6239', borderLeft: '3px solid #8C6239', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 8, right: 8, width: 14, height: 14, borderBottom: '3px solid #8C6239', borderRight: '3px solid #8C6239', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#9A3412', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {currentDialog.speakerName}
              </span>
              <button
                onClick={handleDialogNext}
                style={{
                  background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '11px',
                  padding: '5px 14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(14, 131, 136, 0.3)',
                }}
              >
                Lanjut ▶
              </button>
            </div>
            <p style={{ margin: 0, fontSize: '14.5px', lineHeight: 1.65, color: '#362014', fontWeight: 650 }}>
              <Typewriter text={currentDialog.text} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DIRA BRIEFING MODAL ── */}
      <AnimatePresence>
        {showDiraBriefing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(20, 10, 5, 0.65)',
              backdropFilter: 'blur(8px)',
              padding: '16px',
            }}
          >
            <div style={{
              position: 'relative',
              background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
              borderRadius: '24px',
              border: '2.5px solid #8C6239',
              padding: '32px 36px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
              color: '#362014',
              textAlign: 'center',
            }}>
              {/* Corner brackets */}
              <div style={{ position: 'absolute', top: 10, left: 10, width: 14, height: 14, borderTop: '3px solid #8C6239', borderLeft: '3px solid #8C6239', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: 10, right: 10, width: 14, height: 14, borderTop: '3px solid #8C6239', borderRight: '3px solid #8C6239', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: 10, left: 10, width: 14, height: 14, borderBottom: '3px solid #8C6239', borderLeft: '3px solid #8C6239', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: 10, right: 10, width: 14, height: 14, borderBottom: '3px solid #8C6239', borderRight: '3px solid #8C6239', pointerEvents: 'none' }} />

              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🤖</div>
              <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '2px', color: '#9A3412', textTransform: 'uppercase', marginBottom: '6px' }}>
                INSTRUKSI MISI DARI DIRA
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#362014', margin: '0 0 14px' }}>
                Uji Ketangkasan Lemparan Bola
              </h2>
              <div style={{
                background: '#FFFDF7',
                border: '1.5px solid #B48C50',
                borderRadius: '16px',
                padding: '18px 20px',
                fontSize: '14px',
                lineHeight: 1.7,
                color: '#362014',
                fontWeight: 600,
                textAlign: 'left',
                margin: '0 0 24px',
                boxShadow: 'inset 0 2px 5px rgba(140, 98, 57, 0.08)',
              }}>
                {DIRA_BRIEFING.text}
              </div>
              <button
                onClick={handleGatherStudents}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(14, 131, 136, 0.4)',
                }}
              >
                SIAP, KUMPULKAN SISWA DI LAPANGAN! ▶
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DATA COLLECTION HUD (ZONA SISWA & PAPAN CATATAN) ── */}
      {(gameState === 'COLLECTING_DATA' || gameState === 'READY_TO_THROW' || gameState === 'THROW_IN_PROGRESS') && session && (
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
          {/* Zona Siswa Waiting List */}
          <div style={{
            background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
            borderRadius: '16px',
            border: '2px solid #8C6239',
            padding: '14px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            color: '#362014',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#9A3412', letterSpacing: '0.5px' }}>
                🏫 ZONA SISWA ({session.measuredCount}/{TOTAL_STUDENTS})
              </span>
            </div>

            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {session.students.map(student => {
                const isMeasured = student.measured
                const isActive = student.studentId === activeStudentId
                return (
                  <button
                    key={student.studentId}
                    onClick={() => !isMeasured && activeStudentId === null && handleCallStudent(student.studentId)}
                    disabled={isMeasured || activeStudentId !== null}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: isActive ? '#FEF3C7' : isMeasured ? '#ECFDF5' : '#FFFDF7',
                      border: `1.5px solid ${isActive ? '#D97706' : isMeasured ? '#10B981' : '#B48C50'}`,
                      color: '#362014',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: isMeasured || activeStudentId !== null ? 'default' : 'pointer',
                    }}
                  >
                    <span>{student.studentLabel}</span>
                    <span style={{ color: isMeasured ? '#059669' : isActive ? '#D97706' : '#0284C7', fontWeight: 900 }}>
                      {isMeasured ? `${formatDistance(student.distance)}m ✓` : isActive ? 'Membidik 🏹' : 'Panggil ▶'}
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
                  marginTop: '10px',
                  width: '100%',
                  padding: '7px',
                  borderRadius: '8px',
                  background: '#FFFDF7',
                  border: '1.5px solid #0E8388',
                  color: '#0E8388',
                  fontSize: '10.5px',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                ⚡ Kumpulkan Sisa Lemparan Otomatis
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── MISSION PANELS (RANGE, QUARTILES, IQR) ── */}
      {/* ── MISSION 1: JANGKAUAN (RANGE) ── */}
      {gameState === 'MISSION_RANGE' && stats && (
        <div style={{
          position: 'absolute',
          top: '72px',
          right: '16px',
          zIndex: 100,
          background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
          borderRadius: '20px',
          border: '2.5px solid #8C6239',
          padding: '18px 20px',
          maxWidth: '340px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.35), inset 0 0 20px rgba(180, 140, 80, 0.2)',
          color: '#362014',
        }}>
          <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 900, color: '#991B1B' }}>
            🎯 Misi 1: Jangkauan (Range)
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#5C3D1E', lineHeight: 1.5 }}>
            {m1Phase === 'SELECT_FLAGS'
              ? 'Klik bendera jarak terdekat (Min) dan bendera jarak terjauh (Max) di lapangan untuk membentangkan pita merah!'
              : 'Hitung nilai Jangkauan: R = Nilai Terbesar − Nilai Terkecil'}
          </p>

          {m1Phase === 'SELECT_FLAGS' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: '#362014', fontWeight: 700 }}>
                🚩 Terdekat (Min): <span style={{ color: '#0284C7', fontWeight: 900 }}>{selectedMinFlag ? `Siswa #${selectedMinFlag}` : 'Belum dipilih'}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#362014', fontWeight: 700 }}>
                🚩 Terjauh (Max): <span style={{ color: '#DC2626', fontWeight: 900 }}>{selectedMaxFlag ? `Siswa #${selectedMaxFlag}` : 'Belum dipilih'}</span>
              </div>
              <button
                onClick={handleConfirmRibbon}
                disabled={selectedMinFlag === null || selectedMaxFlag === null}
                style={{
                  marginTop: '6px',
                  padding: '10px',
                  borderRadius: '10px',
                  background: selectedMinFlag && selectedMaxFlag ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' : '#D6D3D1',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '12.5px',
                  cursor: selectedMinFlag && selectedMaxFlag ? 'pointer' : 'not-allowed',
                  boxShadow: selectedMinFlag && selectedMaxFlag ? '0 4px 12px rgba(220, 38, 38, 0.35)' : 'none',
                }}
              >
                PASANG PITA PEMBATAS ▶
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: '#5C3D1E', fontWeight: 650 }}>
                Maksimum: <b style={{ color: '#991B1B' }}>{formatDistance(stats.max)} m</b> | Minimum: <b style={{ color: '#0369A1' }}>{formatDistance(stats.min)} m</b>
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="Masukkan Jangkauan (R)..."
                value={rangeAnswer}
                onChange={e => setRangeAnswer(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #8C6239',
                  background: '#FFFDF7',
                  color: '#362014',
                  fontSize: '14px',
                  fontWeight: 800,
                  outline: 'none',
                }}
              />
              {rangeError && <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: 800 }}>{rangeError}</div>}
              <button
                onClick={handleSubmitRange}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(14, 131, 136, 0.35)',
                }}
              >
                VERIFIKASI JAWABAN ▶
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MISSION 2: KUARTIL (Q1, Q2, Q3) ── */}
      {gameState === 'MISSION_QUARTILES' && stats && (
        <div style={{
          position: 'absolute',
          top: '72px',
          right: '16px',
          zIndex: 100,
          background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
          borderRadius: '20px',
          border: '2.5px solid #8C6239',
          padding: '18px 20px',
          maxWidth: '360px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.35), inset 0 0 20px rgba(180, 140, 80, 0.2)',
          color: '#362014',
        }}>
          <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 900, color: '#6B21A8' }}>
            📊 Misi 2: Kuartil (Q1, Q2, Q3)
          </h3>
          <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#5C3D1E', lineHeight: 1.5 }}>
            {m2Phase === 'SORT_STUDENTS'
              ? 'Urutkan data 15 lemparan dari terdekat ke terjauh.'
              : m2Phase === 'PLACE_POSTS'
              ? 'Pasang tiang kuartil pada urutan data: Q1 (ke-4), Q2 (ke-8), Q3 (ke-12).'
              : 'Masukkan nilai jarak untuk Q1, Q2 (median), dan Q3.'}
          </p>

          {m2Phase === 'SORT_STUDENTS' ? (
            <div>
              <button
                onClick={() => {
                  if (stats) setSortedSlots(stats.sortedStudents.map(s => s.studentId))
                }}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  background: '#FFFDF7',
                  border: '1.5px solid #7C3AED',
                  color: '#7C3AED',
                  fontSize: '11px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  marginBottom: '8px',
                  width: '100%',
                }}
              >
                ⚡ Urutkan Cepat dari Nilai Terkecil
              </button>
              {sortError && <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: 800, marginBottom: '6px' }}>{sortError}</div>}
              <button
                onClick={handleSortConfirm}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                }}
              >
                KONFIRMASI URUTAN DATA ▶
              </button>
            </div>
          ) : m2Phase === 'PLACE_POSTS' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: '#362014', fontWeight: 700 }}>
                Q1: {q1Post ? `Urutan ke-${q1Post} ✓` : <button onClick={() => handlePlacePost(4, 'Q1')} style={{ marginLeft: '6px', padding: '4px 10px', borderRadius: '6px', background: '#059669', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>Pasang Q1 (Urutan 4)</button>}
              </div>
              <div style={{ fontSize: '12px', color: '#362014', fontWeight: 700 }}>
                Q2: {q2Post ? `Urutan ke-${q2Post} ✓` : <button onClick={() => handlePlacePost(8, 'Q2')} style={{ marginLeft: '6px', padding: '4px 10px', borderRadius: '6px', background: '#7C3AED', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>Pasang Q2 (Urutan 8)</button>}
              </div>
              <div style={{ fontSize: '12px', color: '#362014', fontWeight: 700 }}>
                Q3: {q3Post ? `Urutan ke-${q3Post} ✓` : <button onClick={() => handlePlacePost(12, 'Q3')} style={{ marginLeft: '6px', padding: '4px 10px', borderRadius: '6px', background: '#DB2777', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>Pasang Q3 (Urutan 12)</button>}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="number"
                step="0.01"
                placeholder={`Nilai Q1 (urutan ke-4, ~${formatDistance(stats.q1)}m)`}
                value={q1Answer}
                onChange={e => setQ1Answer(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '8px', background: '#FFFDF7', border: '1.5px solid #059669', color: '#362014', fontSize: '13px', fontWeight: 700, outline: 'none' }}
              />
              <input
                type="number"
                step="0.01"
                placeholder={`Nilai Q2 (urutan ke-8, ~${formatDistance(stats.q2)}m)`}
                value={q2Answer}
                onChange={e => setQ2Answer(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '8px', background: '#FFFDF7', border: '1.5px solid #7C3AED', color: '#362014', fontSize: '13px', fontWeight: 700, outline: 'none' }}
              />
              <input
                type="number"
                step="0.01"
                placeholder={`Nilai Q3 (urutan ke-12, ~${formatDistance(stats.q3)}m)`}
                value={q3Answer}
                onChange={e => setQ3Answer(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '8px', background: '#FFFDF7', border: '1.5px solid #DB2777', color: '#362014', fontSize: '13px', fontWeight: 700, outline: 'none' }}
              />
              {quartileError && <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: 800 }}>{quartileError}</div>}
              <button
                onClick={handleSubmitQuartiles}
                style={{
                  marginTop: '4px',
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                }}
              >
                VERIFIKASI SEMUA KUARTIL ▶
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MISSION 3: JANGKAUAN KUARTIL (IQR) ── */}
      {gameState === 'MISSION_IQR' && stats && (
        <div style={{
          position: 'absolute',
          top: '72px',
          right: '16px',
          zIndex: 100,
          background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
          borderRadius: '20px',
          border: '2.5px solid #8C6239',
          padding: '18px 20px',
          maxWidth: '340px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.35), inset 0 0 20px rgba(180, 140, 80, 0.2)',
          color: '#362014',
        }}>
          <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 900, color: '#065F46' }}>
            🌿 Misi 3: Jangkauan Kuartil (IQR)
          </h3>
          <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#5C3D1E', lineHeight: 1.5 }}>
            {m3Phase === 'PLACE_RIBBON'
              ? 'Pasang pita hijau dari tiang Q1 ke tiang Q3!'
              : 'Hitung nilai Jangkauan Kuartil: IQR = Q3 − Q1'}
          </p>

          {m3Phase === 'PLACE_RIBBON' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => { handlePlaceGreenRibbon('Q1'); handlePlaceGreenRibbon('Q3'); }}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                }}
              >
                BENTANGKAN PITA HIJAU Q1 KE Q3 ▶
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: '#5C3D1E', fontWeight: 650 }}>
                Q3: <b style={{ color: '#DB2777' }}>{formatDistance(stats.q3)} m</b> | Q1: <b style={{ color: '#059669' }}>{formatDistance(stats.q1)} m</b>
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="Masukkan nilai IQR (Q3 − Q1)..."
                value={iqrAnswer}
                onChange={e => setIqrAnswer(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #059669',
                  background: '#FFFDF7',
                  color: '#362014',
                  fontSize: '14px',
                  fontWeight: 800,
                  outline: 'none',
                }}
              />
              {iqrError && <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: 800 }}>{iqrError}</div>}
              <button
                onClick={handleSubmitIQR}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                }}
              >
                VERIFIKASI IQR ▶
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── FINAL REPORT MODAL ── */}
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
              background: 'rgba(20, 10, 5, 0.65)',
              backdropFilter: 'blur(10px)',
              padding: '16px',
            }}
          >
            <div style={{
              position: 'relative',
              background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
              borderRadius: '24px',
              border: '2.5px solid #8C6239',
              padding: '32px 36px',
              maxWidth: '620px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
              color: '#362014',
              textAlign: 'center',
            }}>
              {/* Corner brackets */}
              <div style={{ position: 'absolute', top: 10, left: 10, width: 14, height: 14, borderTop: '3px solid #8C6239', borderLeft: '3px solid #8C6239', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: 10, right: 10, width: 14, height: 14, borderTop: '3px solid #8C6239', borderRight: '3px solid #8C6239', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: 10, left: 10, width: 14, height: 14, borderBottom: '3px solid #8C6239', borderLeft: '3px solid #8C6239', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: 10, right: 10, width: 14, height: 14, borderBottom: '3px solid #8C6239', borderRight: '3px solid #8C6239', pointerEvents: 'none' }} />

              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆 🌟</div>
              <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '2px', color: '#9A3412', textTransform: 'uppercase', marginBottom: '4px' }}>
                INVESTIGASI DATA BERHASIL
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#362014', margin: '0 0 6px' }}>
                Laporan Investigasi Selesai!
              </h2>
              <div style={{ fontSize: '22px', margin: '0 0 14px' }}>
                {'⭐'.repeat(scoring.stars)}
              </div>

              <div style={{
                background: '#FFFDF7',
                border: '1.5px solid #B48C50',
                borderRadius: '16px',
                padding: '18px 20px',
                margin: '0 0 22px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                textAlign: 'left',
                fontSize: '13px',
                color: '#362014',
                boxShadow: 'inset 0 2px 5px rgba(140, 98, 57, 0.08)',
              }}>
                <div>📍 Jarak Terjauh: <b>{formatDistance(stats.max)} m</b></div>
                <div>📍 Jarak Terdekat: <b>{formatDistance(stats.min)} m</b></div>
                <div>📏 Jangkauan (Range): <b style={{ color: '#DC2626' }}>{formatDistance(stats.range)} m</b></div>
                <div>📊 Kuartil Bawah (Q1): <b style={{ color: '#059669' }}>{formatDistance(stats.q1)} m</b></div>
                <div>📊 Median (Q2): <b style={{ color: '#7C3AED' }}>{formatDistance(stats.q2)} m</b></div>
                <div>📊 Kuartil Atas (Q3): <b style={{ color: '#DB2777' }}>{formatDistance(stats.q3)} m</b></div>
                <div style={{ gridColumn: 'span 2', paddingTop: '8px', borderTop: '1px solid rgba(140, 98, 57, 0.2)' }}>
                  🌿 Jangkauan Kuartil (IQR = Q3 − Q1): <b style={{ color: '#059669', fontSize: '14.5px' }}>{formatDistance(stats.iqr)} m</b>
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
                  background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '15px',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(14, 131, 136, 0.4)',
                }}
              >
                KEMBALI KE MARKAS DETEKTIF ▶
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CLASSROOM PROLOGUE MODAL / SCENE ── */}
      <AnimatePresence>
        {gameState === 'CLASSROOM_PROLOGUE' && currentClassroomDialog && (
          <motion.div
            key="classroom-prologue-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 850,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundImage: 'url("/Assets/Building/field/kelas.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Ambient Dark Gradient Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.4) 0%, rgba(7, 19, 30, 0.85) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* ── TOP HEADER (TITLE & SKIP) ── */}
            <div
              style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'clamp(12px, 2vh, 20px) clamp(16px, 3vw, 32px)',
                background: 'linear-gradient(180deg, rgba(20, 10, 5, 0.65) 0%, transparent 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
                    border: '1.5px solid #8C6239',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 900,
                    color: '#362014',
                    letterSpacing: '0.5px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  🏫 RUANG KELAS VII-B
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#FFFDF7',
                    textShadow: '0 2px 4px rgba(0,0,0,0.6)',
                  }}
                >
                  Pengantar Ukuran Penyebaran Data
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 900,
                    color: '#362014',
                    background: '#FDF8EC',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1.5px solid #8C6239',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  💬 {classroomIndex + 1} / {CLASSROOM_DIALOGS.length}
                </span>

                <button
                  onClick={handleTransitionToField}
                  style={{
                    background: '#F5E8C7',
                    border: '1.5px solid #8C6239',
                    borderRadius: '10px',
                    color: '#6B4226',
                    cursor: 'pointer',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 900,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                    transition: 'all 0.2s',
                  }}
                >
                  Lewati Pengantar ⏩
                </button>
              </div>
            </div>

            {/* ── CHARACTERS VISUAL PRESENTATION ── */}
            <div
              style={{
                position: 'relative',
                zIndex: 5,
                flex: 1,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: '0 clamp(16px, 6vw, 80px)',
                pointerEvents: 'none',
              }}
            >
              {/* Pak Bambang */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                  transform:
                    currentClassroomDialog.speaker === 'teacher'
                      ? 'scale(1.05) translateY(-6px)'
                      : 'scale(0.96) translateY(0)',
                  opacity: currentClassroomDialog.speaker === 'teacher' ? 1 : 0.65,
                }}
              >
                <img
                  src="/Assets/Character/Pak Bambang.png"
                  alt="Pak Bambang"
                  style={{
                    height: 'clamp(240px, 45vh, 440px)',
                    objectFit: 'contain',
                    filter:
                      currentClassroomDialog.speaker === 'teacher'
                        ? 'drop-shadow(0 0 25px rgba(245, 158, 11, 0.7)) brightness(1.05)'
                        : 'drop-shadow(0 6px 16px rgba(0,0,0,0.6)) grayscale(0.2)',
                  }}
                />
              </div>

              {/* DiRA Floating Avatar */}
              <AnimatePresence>
                {currentClassroomDialog.speaker === 'dira' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -15 }}
                    style={{
                      position: 'absolute',
                      top: '18%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
                      padding: '14px 24px',
                      borderRadius: '18px',
                      border: '2px solid #8C6239',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div style={{ fontSize: '38px', marginBottom: '4px' }}>🤖</div>
                    <span style={{ fontSize: '12px', fontWeight: 900, color: '#0E8388', letterSpacing: '0.5px' }}>
                      DiRA — ASISTEN ANALITIK AI
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stevunt */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                  transform:
                    currentClassroomDialog.speaker === 'player'
                      ? 'scale(1.05) translateY(-6px)'
                      : 'scale(0.96) translateY(0)',
                  opacity: currentClassroomDialog.speaker === 'player' ? 1 : 0.65,
                }}
              >
                <img
                  src="/Assets/Character/Stevunt-idle.png"
                  alt="Stevunt"
                  style={{
                    height: 'clamp(210px, 40vh, 400px)',
                    objectFit: 'contain',
                    filter:
                      currentClassroomDialog.speaker === 'player'
                        ? 'drop-shadow(0 0 25px rgba(0, 173, 181, 0.75)) brightness(1.05)'
                        : 'drop-shadow(0 6px 16px rgba(0,0,0,0.6)) grayscale(0.2)',
                  }}
                />
              </div>
            </div>

            {/* ── DIALOGUE BUBBLE BOX (BOTTOM) ── */}
            <div
              style={{
                position: 'relative',
                zIndex: 20,
                width: '100%',
                padding: '0 clamp(16px, 4vw, 36px) clamp(16px, 3vh, 28px)',
                display: 'flex',
                justifyContent: 'center',
              }}
              onClick={handleClassroomNext}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '840px',
                  background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
                  borderRadius: '24px',
                  border: '2.5px solid #8C6239',
                  padding: '22px 28px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
                  color: '#362014',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                {/* Corner brackets */}
                <div style={{ position: 'absolute', top: 8, left: 8, width: 14, height: 14, borderTop: '3px solid #8C6239', borderLeft: '3px solid #8C6239', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 8, right: 8, width: 14, height: 14, borderTop: '3px solid #8C6239', borderRight: '3px solid #8C6239', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: 8, left: 8, width: 14, height: 14, borderBottom: '3px solid #8C6239', borderLeft: '3px solid #8C6239', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: 8, right: 8, width: 14, height: 14, borderBottom: '3px solid #8C6239', borderRight: '3px solid #8C6239', pointerEvents: 'none' }} />

                {/* Header row in bubble */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 900,
                        color:
                          currentClassroomDialog.speaker === 'teacher'
                            ? '#9A3412'
                            : currentClassroomDialog.speaker === 'dira'
                            ? '#0369A1'
                            : '#0E8388',
                      }}
                    >
                      {currentClassroomDialog.speaker === 'teacher'
                        ? '👨‍🏫 Pak Bambang'
                        : currentClassroomDialog.speaker === 'dira'
                        ? '🤖 DiRA'
                        : '🕵️ Stevunt'}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#6B4226',
                        background: '#FFFDF7',
                        border: '1px solid #B48C50',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 800,
                      }}
                    >
                      {currentClassroomDialog.speaker === 'teacher'
                        ? 'Guru Olahraga'
                        : currentClassroomDialog.speaker === 'dira'
                        ? 'Asisten Analitik'
                        : 'Detektif Siswa'}
                    </span>
                  </div>

                  <span style={{ fontSize: '11px', color: '#8C6239', fontWeight: 700 }}>
                    Klik / Tekan [Spasi]
                  </span>
                </div>

                {/* Dialog Text */}
                <p
                  style={{
                    margin: '0 0 16px',
                    fontSize: '15px',
                    lineHeight: 1.65,
                    color: '#362014',
                    fontWeight: 650,
                    minHeight: '48px',
                  }}
                >
                  <Typewriter text={currentClassroomDialog.text} />
                </p>

                {/* Bottom button row */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
                  {classroomIndex < CLASSROOM_DIALOGS.length - 1 ? (
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        handleClassroomNext()
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                        border: '1.5px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: '10px',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '12.5px',
                        padding: '8px 20px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(14, 131, 136, 0.35)',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      Lanjut ▶
                    </button>
                  ) : (
                    <motion.button
                      animate={{ scale: [1, 1.04, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      onClick={e => {
                        e.stopPropagation()
                        handleTransitionToField()
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                        border: '1.5px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: '12px',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '14px',
                        padding: '10px 24px',
                        cursor: 'pointer',
                        boxShadow: '0 6px 20px rgba(14, 131, 136, 0.45)',
                        letterSpacing: '0.5px',
                      }}
                    >
                      AYO MENUJU LAPANGAN! 🏃‍♂️💨
                    </motion.button>
                  )}
                </div>
              </div>
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
              background: 'rgba(20, 10, 5, 0.75)',
              backdropFilter: 'blur(10px)',
              color: '#362014',
              textAlign: 'center',
              padding: '24px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                position: 'relative',
                background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
                border: '2.5px solid #8C6239',
                borderRadius: '24px',
                padding: '36px 40px',
                maxWidth: '480px',
                width: '90%',
                boxShadow: '0 20px 50px rgba(0,0,0,0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Corner brackets */}
              <div style={{ position: 'absolute', top: 10, left: 10, width: 14, height: 14, borderTop: '3px solid #8C6239', borderLeft: '3px solid #8C6239', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: 10, right: 10, width: 14, height: 14, borderTop: '3px solid #8C6239', borderRight: '3px solid #8C6239', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: 10, left: 10, width: 14, height: 14, borderBottom: '3px solid #8C6239', borderLeft: '3px solid #8C6239', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: 10, right: 10, width: 14, height: 14, borderBottom: '3px solid #8C6239', borderRight: '3px solid #8C6239', pointerEvents: 'none' }} />

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                style={{ fontSize: '56px', marginBottom: '14px' }}
              >
                🏃‍♂️ 💨 ⚽
              </motion.div>
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#362014',
                  margin: '0 0 10px',
                  letterSpacing: '0.5px',
                }}
              >
                Menuju Lapangan Sekolah...
              </h2>
              <p style={{ fontSize: '14px', color: '#5C3D1E', maxWidth: '400px', lineHeight: 1.65, margin: 0 }}>
                Pak Bambang dan 15 siswa kelas VII-B telah bersiap di pinggir lapangan untuk agenda pengukuran lemparan!
              </p>

              <div
                style={{
                  marginTop: '24px',
                  width: '60px',
                  height: '4px',
                  borderRadius: '2px',
                  background: 'linear-gradient(90deg, #8C6239, #0E8388)',
                  animation: 'pulse 1.5s infinite',
                }}
              />
            </motion.div>
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
