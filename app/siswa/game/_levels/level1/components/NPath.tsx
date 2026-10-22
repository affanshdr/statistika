'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PlayerCharacter from '@/app/siswa/game/_components/PlayerCharacter'
import NPCCharacter from '@/app/siswa/game/_components/NPCCharacter'
import GamePreloader from '@/app/siswa/game/_components/GamePreloader'
import {
  LEVEL1_MAPS,
  WORLD_VW,
  WORLD_VH,
  RED_LINE_POINTS,
  PAK_SUTRISNO_POS,
  getRedLineY,
  checkHallwayWalkable,
  checkClassroomWalkable,
  checkFacilityWalkable,
  checkGateWalkable
} from '@/app/siswa/game/_levels/level1/config/level1MapConfig'
import Level1HUD from '@/app/siswa/game/_levels/level1/components/Level1HUD'
import QuizModal from '@/app/siswa/game/_levels/level1/components/modals/QuizModal'
import WaliKelasModal from '@/app/siswa/game/_levels/level1/components/modals/WaliKelasModal'
import OutlierSimulator from './OutlierSimulator'
import { gameAudio } from '@/lib/utils/gameAudio'
import { MotherCatModal, KittenRescueModal } from '@/app/siswa/game/_levels/level1/components/modals/CatQuestModal'

export const KITTEN_SPAWN_SPOTS = [
  { zone: 'Perpustakaan', x: 800, y: 535, label: 'Pojok Depan Rak Perpustakaan' },
  { zone: 'LabKomputer', x: 620, y: 460, label: 'Lorong Meja Lab Komputer' },
  { zone: 'facility_courtyard', x: 270, y: 460, label: 'Halaman Depan Fasilitas' },
  { zone: 'hallway', x: 880, y: 530, label: 'Halaman Depan Kelas VIII' },
] as const

export type CatQuestStage = 'untriggered' | 'cat_spawned' | 'quest_active' | 'kitten_rescued' | 'completed'

const VIEW_VW = 640
const VIEW_VH = 360
const SPEED = 1.0
const TOTAL_N = 24

import {
  CLASS_DOORS,
  CLASS_STUDENTS,
  getClassDoors,
  getClassStudents,
  DATA_CIRCLES,
  AMBIENT_PARTICLES,
  QuizDoor
} from '@/app/siswa/game/_levels/level1/data/level1Data'
import { getLevel1Data, generateRandomLevel1Data, screenTimeData } from '@/app/siswa/game/_data/level1'
import { useGameStore } from '@/lib/store/gameStore'

import { DoorId } from '@/app/siswa/game/_levels/level1/data/level1Data'

const DOORS: readonly QuizDoor[] = []

import { FacilityModal, LibraryBookModal, LabTerminalModal, FACILITY_DOORS, type FacilityDoor } from '@/app/siswa/game/_levels/level1/components/modals/FacilityModal'
import { type SatpamTimeQuiz, type SatpamChatStage, SATPAM_WRONG_TEASES, generateSatpamTimeQuiz } from '@/app/siswa/game/_levels/level1/utils/satpamQuizGenerator'
import { type SutrisnoClaimQuiz, generatePakSutrisnoClaimQuiz } from '@/app/siswa/game/_levels/level1/utils/sutrisnoQuizGenerator'
import { getSpeechBubblePath } from '@/app/siswa/game/_levels/level1/utils/bubbleUtils'
import Joystick from '@/app/siswa/game/_levels/level1/components/ui/Joystick'
import PakSanctionModal from '@/app/siswa/game/_levels/level1/components/modals/PakSanctionModal'
import PakReportModal from '@/app/siswa/game/_levels/level1/components/corkboard/PakReportModal'
import MissionCompleteModal from '@/app/siswa/game/_levels/level1/components/modals/MissionCompleteModal'

import CounterResult from '@/app/siswa/game/_levels/level1/components/modals/CounterResult'

export default function NPath({
  onComplete,
  isFD = true,
  demoMode = false,
  demoStep = null,
  studentName,
}: {
  onComplete: (starsEarned?: number) => void
  isFD?: boolean
  demoMode?: boolean
  demoStep?: string | null
  studentName?: string
}) {
  const level1Dataset = useGameStore(s => s.level1Dataset)
  const sessionStartTime = useGameStore(s => s.sessionStartTime)
  const mistakeCount = useGameStore(s => s.mistakeCount)
  const incrementMistake = useGameStore(s => s.incrementMistake)
  const [showMissionCompleteModal, setShowMissionCompleteModal] = useState(false)
  const [earnedStarsState, setEarnedStarsState] = useState(3)
  const [elapsedSecondsState, setElapsedSecondsState] = useState(0)

  useEffect(() => {
    gameAudio.playBGM('level1')
    if (!level1Dataset || level1Dataset.length !== 24) {
      useGameStore.setState({ level1Dataset: generateRandomLevel1Data() })
    }
  }, [level1Dataset])

  const activeDataset = useMemo(() => {
    return (level1Dataset && level1Dataset.length === 24) ? level1Dataset : screenTimeData
  }, [level1Dataset])

  const doors = useMemo(() => getClassDoors(activeDataset), [activeDataset])
  const currentClassStudents = useMemo(() => getClassStudents(activeDataset), [activeDataset])

  const [isLoadingAssets, setIsLoadingAssets] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('preloaded') === 'true') return false
    }
    return true
  })
  const isDemoExploration = demoMode && (demoStep === 'exploration' || demoStep === 'interval' || demoStep === 'histogram')
  const [charPos, setCharPos] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('x') && p.get('y')) return { x: Number(p.get('x')), y: Number(p.get('y')) }
      if (p.get('zone') === 'gate') return { x: 615, y: 575 }
      if (p.get('spawn') === 'rg') return { x: 618, y: 400 }
    }
    return isDemoExploration ? { x: 180, y: 585 } : { x: 615, y: 575 }
  })
  const [cinematicStage, setCinematicStage] = useState<'gate_intro' | 'player_intro' | 'panning_to_pak' | 'pak_shouting' | 'pak_shouting_2' | 'panning_to_player' | 'quest_meet_pak' | 'pak_sanction_1' | 'pak_sanction_2' | 'pak_sanction_3' | 'player_reply_pak' | 'sanction_received'>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      const forcedCinematic = p.get('cinematic')
      if (forcedCinematic) return forcedCinematic as any
      if (p.get('zone') === 'gate') return 'gate_intro'
    }
    return isDemoExploration ? 'sanction_received' : 'gate_intro'
  })
  const cinematicStageRef = useRef(cinematicStage)
  cinematicStageRef.current = cinematicStage

  const [showPakSanctionModal, setShowPakSanctionModal] = useState(false)
  const [showPakReportModal, setShowPakReportModal] = useState(false)
  const smoothCamPos = useRef(
    (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('zone') === 'gate')
      ? { x: 615, y: 575 }
      : (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('spawn') === 'rg')
      ? { x: 618, y: 400 }
      : isDemoExploration ? { x: 180, y: 585 } : { x: 615, y: 575 }
  )
  const [unlocked, setUnlocked] = useState<Set<string>>(() => {
    return new Set(['A', 'B', 'RG', 'A1', 'A2', 'B1', 'B2'])
  })
  const [savedClasses, setSavedClasses] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('demoData') === 'full') {
        return new Set(['A1', 'A2', 'B1', 'B2'])
      }
    }
    return new Set()
  })
  const [justCompletedClassId, setJustCompletedClassId] = useState<string | null>(null)
  const [activeDoor, setActiveDoor] = useState<typeof DOORS[number] | null>(null)
  const [nearDoor, setNearDoor] = useState<typeof DOORS[number] | null>(null)
  const [activeClass, setActiveClass] = useState<QuizDoor | null>(null)
  const [nearClass, setNearClass] = useState<QuizDoor | null>(null)
  const [insideRoom, setInsideRoom] = useState<QuizDoor | null>(null)
  const insideRoomR = useRef(insideRoom); insideRoomR.current = insideRoom
  const lastHallwayPosRef = useRef<{ x: number; y: number }>({ x: 650, y: 550 })
  const [visitedRooms, setVisitedRooms] = useState<Set<DoorId>>(new Set())
  const [showWaliKelasPopup, setShowWaliKelasPopup] = useState<QuizDoor | null>(null)
  const [teacherCutsceneStage, setTeacherCutsceneStage] = useState<'anim_wait' | 'teacher_ask' | 'player_explain' | 'teacher_reply' | 'post_stevunt_report' | 'post_pak_thanks' | 'post_pak_quiz' | 'post_conclusion' | null>(null)
  const [sutrisnoQuiz, setSutrisnoQuiz] = useState<SutrisnoClaimQuiz | null>(null)
  const [sutrisnoQuizWrong, setSutrisnoQuizWrong] = useState(false)
  const [sutrisnoWrongCount, setSutrisnoWrongCount] = useState(0)
  const teacherCutsceneStageRef = useRef(teacherCutsceneStage)
  teacherCutsceneStageRef.current = teacherCutsceneStage
  const teacherTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ── Multi-Zone State (Zona 0: Gerbang, Zona 1: Kelas, Zona 2: Fasilitas) ──
  const [currentZone, setCurrentZone] = useState<'gate' | 'main' | 'facility'>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      const forcedZone = p.get('zone')
      if (forcedZone === 'main' || forcedZone === 'facility' || forcedZone === 'gate') return forcedZone
    }
    return isDemoExploration ? 'main' : 'gate'
  })
  const currentZoneR = useRef(currentZone); currentZoneR.current = currentZone
  const [gateBubbleStep, setGateBubbleStep] = useState(0)
  const [satpamChatStage, setSatpamChatStage] = useState<SatpamChatStage>('idle')
  const satpamChatStageR = useRef(satpamChatStage); satpamChatStageR.current = satpamChatStage
  const [satpamQuiz, setSatpamQuiz] = useState<SatpamTimeQuiz>(() => generateSatpamTimeQuiz())
  const satpamQuizR = useRef(satpamQuiz); satpamQuizR.current = satpamQuiz
  const [satpamWrongCount, setSatpamWrongCount] = useState(0)
  const [satpamTeaseText, setSatpamTeaseText] = useState<string>(SATPAM_WRONG_TEASES[0])
  const [hasPassedSatpamQuiz, setHasPassedSatpamQuiz] = useState(false)
  const hasPassedSatpamQuizR = useRef(hasPassedSatpamQuiz); hasPassedSatpamQuizR.current = hasPassedSatpamQuiz
  const [activeFacility, setActiveFacility] = useState<FacilityDoor | null>(null)
  const activeFacilityR = useRef(activeFacility); activeFacilityR.current = activeFacility
  const [nearFacility, setNearFacility] = useState<FacilityDoor | null>(null)
  const nearFacilityR = useRef(nearFacility); nearFacilityR.current = nearFacility
  const [zoneTransitionPrompt, setZoneTransitionPrompt] = useState<'to_facility' | 'to_main' | null>(null)

  // ── Screen Fade Transition State (Layar Gelap -> Jeda -> Terang Kembali) ──
  const [screenFade, setScreenFade] = useState<'idle' | 'out' | 'blackout' | 'in'>('idle')
  const isTransitioningRef = useRef(false)

  // Facility Room Learning Hotspot Modals & Proximity States
  const [showLibraryBookModal, setShowLibraryBookModal] = useState(false)
  const showLibraryBookModalR = useRef(showLibraryBookModal); showLibraryBookModalR.current = showLibraryBookModal
  const [showLabTerminalModal, setShowLabTerminalModal] = useState(false)
  const showLabTerminalModalR = useRef(showLabTerminalModal); showLabTerminalModalR.current = showLabTerminalModal
  const [nearLibraryShelf, setNearLibraryShelf] = useState(false)
  const nearLibraryShelfR = useRef(nearLibraryShelf); nearLibraryShelfR.current = nearLibraryShelf
  const [nearLabTerminal, setNearLabTerminal] = useState(false)
  const nearLabTerminalR = useRef(nearLabTerminal); nearLabTerminalR.current = nearLabTerminal

  // ── Cat Quest Mini-Game States ──
  const [catTargetClassId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      const forced = p.get('catClass')
      if (forced && ['A1', 'A2', 'B1', 'B2'].includes(forced)) return forced
    }
    const eligibleIds = ['A1', 'A2', 'B1', 'B2']
    return eligibleIds[Math.floor(Math.random() * eligibleIds.length)]
  })
  const catTargetClassIdR = useRef(catTargetClassId); catTargetClassIdR.current = catTargetClassId
  const [catQuestStage, setCatQuestStage] = useState<CatQuestStage>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      const stageParam = p.get('catStage') as CatQuestStage
      if (['untriggered', 'cat_spawned', 'quest_active', 'kitten_rescued', 'completed'].includes(stageParam)) {
        return stageParam
      }
    }
    return 'untriggered'
  })
  const catQuestStageR = useRef(catQuestStage); catQuestStageR.current = catQuestStage
  const [motherCatPos, setMotherCatPos] = useState<{ x: number; y: number; classLabel: string; classId?: string }>({ x: 380, y: 550, classLabel: 'Kelas VII-A', classId: 'A1' })
  const motherCatPosR = useRef(motherCatPos); motherCatPosR.current = motherCatPos
  const [kittenLocation, setKittenLocation] = useState<{ zone: string; x: number; y: number; label: string }>(KITTEN_SPAWN_SPOTS[0])
  const kittenLocationR = useRef(kittenLocation); kittenLocationR.current = kittenLocation
  const [nearMotherCat, setNearMotherCat] = useState(false)
  const nearMotherCatR = useRef(nearMotherCat); nearMotherCatR.current = nearMotherCat
  const [nearKitten, setNearKitten] = useState(false)
  const nearKittenR = useRef(nearKitten); nearKittenR.current = nearKitten
  const [showMotherCatModal, setShowMotherCatModal] = useState(false)
  const showMotherCatModalR = useRef(showMotherCatModal); showMotherCatModalR.current = showMotherCatModal
  const [showKittenRescueModal, setShowKittenRescueModal] = useState(false)
  const showKittenRescueModalR = useRef(showKittenRescueModal); showKittenRescueModalR.current = showKittenRescueModal

  const dirRef = useRef({ x: 0, y: 0 })
  const pressedKeysRef = useRef<Set<string>>(new Set())

  const resetMovement = useCallback(() => {
    pressedKeysRef.current.clear()
    dirRef.current = { x: 0, y: 0 }
    setMoveDir(prev => (prev.x === 0 && prev.y === 0 ? prev : { x: 0, y: 0 }))
  }, [])

  const enterFacilityRoom = useCallback((fac: FacilityDoor) => {
    if (!fac.roomId) return
    gameAudio.playDoorOpen()
    resetMovement()
    lastHallwayPosRef.current = { x: fac.x, y: fac.y + 20 }
    setInsideRoom({
      id: fac.roomId,
      label: fac.label,
      color: fac.color,
      x: fac.x,
      y: fac.y,
      roomId: fac.roomId as any,
      quizQ: '',
      quizA: '',
      hint: '',
      count: 0
    })
    setCharPos(LEVEL1_MAPS[fac.roomId]?.spawn || { x: 1050, y: 510 })
  }, [resetMovement])

  const triggerFadeTransition = useCallback((onMidpoint: () => void, onComplete?: () => void) => {
    if (isTransitioningRef.current) return
    isTransitioningRef.current = true
    resetMovement()
    setScreenFade('out')

    setTimeout(() => {
      setScreenFade('blackout')
      onMidpoint()

      // Jeda di layar gelap (250ms) sebelum terang kembali
      setTimeout(() => {
        setScreenFade('in')

        setTimeout(() => {
          setScreenFade('idle')
          isTransitioningRef.current = false
          if (onComplete) onComplete()
        }, 400)
      }, 250)
    }, 400)
  }, [resetMovement])

  const goToFacilityZone = useCallback(() => {
    const isTaskGiven = cinematicStageRef.current === 'sanction_received' || demoMode || collectedR.current.size > 0 || savedClassesR.current.size > 0
    if (currentZoneR.current === 'main' && !isTaskGiven) {
      gameAudio.playError()
      setRgLockedToast('🔒 Area Fasilitas belum dibuka! Jumpai Pak Sutrisno di depan Ruang Guru terlebih dahulu untuk melapor.')
      setTimeout(() => setRgLockedToast(null), 2500)
      return
    }
    triggerFadeTransition(() => {
      gameAudio.playDoorOpen()
      resetMovement()
      setCurrentZone('facility')
      setCharPos({ x: 625, y: 550 })
      smoothCamPos.current = { x: 625, y: 550 }
      setZoneTransitionPrompt(null)
    })
  }, [triggerFadeTransition, resetMovement, demoMode])

  const goToMainZone = useCallback(() => {
    triggerFadeTransition(() => {
      gameAudio.playDoorOpen()
      resetMovement()
      setCurrentZone('main')
      setCharPos({ x: 625, y: 575 })
      smoothCamPos.current = { x: 625, y: 575 }
      setZoneTransitionPrompt(null)
    })
  }, [triggerFadeTransition, resetMovement])

  const enterSchoolFromGate = useCallback(() => {
    triggerFadeTransition(() => {
      gameAudio.playDoorOpen()
      resetMovement()
      setSatpamChatStage('idle')
      satpamChatStageR.current = 'idle'
      setCurrentZone('main')
      // Stevunt tiba di halaman utama depan gerbang dalam
      const spawnX = 480
      const spawnY = 560
      setCharPos({ x: spawnX, y: spawnY })
      smoothCamPos.current = { x: spawnX, y: spawnY }
      if (cinematicStageRef.current === 'gate_intro') {
        setCinematicStage('player_intro')
      }
    })
  }, [triggerFadeTransition, resetMovement])

  const attemptEnterSchoolFromGate = useCallback(() => {
    if (!hasPassedSatpamQuizR.current) {
      resetMovement()
      setGateBubbleStep(prev => (prev === 2 ? prev : 2))
      if (satpamChatStageR.current === 'idle') {
        satpamChatStageR.current = 'pak_stop_1'
        gameAudio.playDoorOpen()
        setSatpamChatStage('pak_stop_1')
      }
      return
    }
    enterSchoolFromGate()
  }, [enterSchoolFromGate, resetMovement])

  const advanceSatpamChat = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const st = satpamChatStageR.current
    if (st === 'pak_stop_1') {
      satpamChatStageR.current = 'player_excuse_1'
      setSatpamChatStage('player_excuse_1')
    } else if (st === 'player_excuse_1') {
      satpamChatStageR.current = 'pak_stop_2'
      setSatpamChatStage('pak_stop_2')
    } else if (st === 'pak_stop_2') {
      satpamChatStageR.current = 'pak_quiz'
      setSatpamChatStage('pak_quiz')
    } else if (st === 'pak_wrong') {
      setSatpamQuiz(prev => {
        const nextQ = generateSatpamTimeQuiz(prev.templateIdx)
        satpamQuizR.current = nextQ
        return nextQ
      })
      satpamChatStageR.current = 'pak_quiz'
      setSatpamChatStage('pak_quiz')
    } else if (st === 'pak_pass_1') {
      satpamChatStageR.current = 'pak_pass_2'
      setSatpamChatStage('pak_pass_2')
    } else if (st === 'pak_pass_2') {
      satpamChatStageR.current = 'player_thanks'
      setSatpamChatStage('player_thanks')
    } else if (st === 'player_thanks') {
      satpamChatStageR.current = 'idle'
      setSatpamChatStage('idle')
      enterSchoolFromGate()
    }
  }, [enterSchoolFromGate])

  const handleSelectSatpamOption = useCallback((idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (satpamChatStageR.current !== 'pak_quiz') return
    if (idx === satpamQuizR.current.correctIndex) {
      gameAudio.playSuccess()
      setHasPassedSatpamQuiz(true)
      hasPassedSatpamQuizR.current = true
      satpamChatStageR.current = 'pak_pass_1'
      setSatpamChatStage('pak_pass_1')
    } else {
      gameAudio.playError()
      setSatpamWrongCount(prev => {
        const next = prev + 1
        setSatpamTeaseText(SATPAM_WRONG_TEASES[(next - 1) % SATPAM_WRONG_TEASES.length])
        return next
      })
      satpamChatStageR.current = 'pak_wrong'
      setSatpamChatStage('pak_wrong')
    }
  }, [])

  const resolvePlayerName = useCallback(() => {
    if (studentName && studentName.trim() && studentName.toLowerCase() !== 'detektif' && studentName.toLowerCase() !== 'kamu') {
      return studentName.trim()
    }
    if (typeof window !== 'undefined') {
      try {
        const rawPlayer = localStorage.getItem('player')
        if (rawPlayer) {
          const p = JSON.parse(rawPlayer)
          const name = p.username || p.displayName || p.name
          if (name && name.toLowerCase() !== 'detektif' && name.toLowerCase() !== 'kamu') return name
        }
        const rawStudent = localStorage.getItem('student')
        if (rawStudent) {
          const s = JSON.parse(rawStudent)
          const name = s.username || s.name || s.displayName
          if (name && name.toLowerCase() !== 'detektif' && name.toLowerCase() !== 'kamu') return name
        }
      } catch {}
    }
    return 'Stevunt'
  }, [studentName])

  const [playerName, setPlayerName] = useState<string>(resolvePlayerName)
  useEffect(() => {
    setPlayerName(resolvePlayerName())
  }, [resolvePlayerName])
  const isGateZone = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('zone') === 'gate'
  const [collected, setCollected] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('demoData') === 'full') {
        const fullSet = new Set<string>()
        const demoClassIds = ['A1', 'A2', 'B1', 'B2']
        const classCircles = DATA_CIRCLES.filter(c => demoClassIds.includes(c.classId))
        classCircles.forEach(c => fullSet.add(c.id))
        return fullSet
      }
    }
    if (demoMode && demoStep !== 'exploration' && !isGateZone) {
      const initialSet = new Set<string>()
      const demoClassIds = ['A1', 'A2', 'B1', 'B2']
      const classCircles = DATA_CIRCLES.filter(c => demoClassIds.includes(c.classId))
      classCircles.forEach(c => initialSet.add(c.id))
      return initialSet
    }
    return new Set()
  })
  const [showCounter, setShowCounter] = useState(demoMode && demoStep !== 'exploration' && !isGateZone ? true : false)
  const [roomMilestoneText, setRoomMilestoneText] = useState<string | null>(null)
  const [rgLockedToast, setRgLockedToast] = useState<string | null>(null)
  const [milestoneGlow, setMilestoneGlow] = useState<'50%' | '100%' | null>(null)
  const [moveDir, setMoveDir] = useState({ x: 0, y: 0 })
  const [showDebug, setShowDebug] = useState(false)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [showStudentDetails, setShowStudentDetails] = useState(false)
  const [inventoryTab, setInventoryTab] = useState<'ALL' | 'A1' | 'A2' | 'B1' | 'B2'>('ALL')

  const charPosRef = useRef({ x: 650, y: 550 })

  // Dynamic Container ResizeObserver for 100% Edge-to-Edge Responsive Viewport
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerDim, setContainerDim] = useState({ w: 640, h: 360 })

  useEffect(() => {
    if (!containerRef.current) return
    const updateDim = () => {
      if (containerRef.current) {
        const clientWidth = Math.round(containerRef.current.clientWidth)
        const clientHeight = Math.round(containerRef.current.clientHeight)
        if (clientWidth > 0 && clientHeight > 0) {
          setContainerDim(prev => (Math.abs(prev.w - clientWidth) <= 1 && Math.abs(prev.h - clientHeight) <= 1 ? prev : { w: clientWidth, h: clientHeight }))
        }
      }
    }
    updateDim()
    const ro = new ResizeObserver(updateDim)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const animRef = useRef<number | null>(null)
  const unlockedR = useRef(unlocked); unlockedR.current = unlocked
  const savedClassesR = useRef(savedClasses); savedClassesR.current = savedClasses
  const collectedR = useRef(collected); collectedR.current = collected
  const activeDoorR = useRef(activeDoor); activeDoorR.current = activeDoor
  const nearDoorR = useRef(nearDoor); nearDoorR.current = nearDoor
  const activeClassR = useRef(activeClass); activeClassR.current = activeClass
  const nearClassR = useRef(nearClass); nearClassR.current = nearClass
  const showWaliKelasPopupR = useRef(showWaliKelasPopup); showWaliKelasPopupR.current = showWaliKelasPopup

  // Sync charPosRef with charPos
  useEffect(() => {
    charPosRef.current = charPos
  }, [charPos.x, charPos.y])

  // Proximity to class doors (calculated smoothly from player position, only in main zone)
  useEffect(() => {
    if (currentZone !== 'main' || insideRoom) {
      setNearClass(prev => (prev === null ? prev : null))
      return
    }
    const { x: cx, y: cy } = charPos
    let closest: QuizDoor | null = null
    let minDist = Infinity
    for (const d of doors) {
      if (d.roomId !== 'RG' && !unlockedR.current.has(d.roomId)) continue
      const dist = Math.hypot(d.x - cx, d.y - cy)
      const threshold = d.roomId === 'RG' ? 95 : 85
      if (dist < threshold && dist < minDist) {
        minDist = dist
        closest = d
      }
    }
    setNearClass(prev => (prev?.id === closest?.id ? prev : closest))
  }, [charPos.x, charPos.y, doors, currentZone, insideRoom])

  // Proximity to facility doors (when in facility zone)
  useEffect(() => {
    if (currentZone !== 'facility' || insideRoom) {
      setNearFacility(prev => (prev === null ? prev : null))
      return
    }
    const { x: cx, y: cy } = charPos
    let closest: FacilityDoor | null = null
    let minDist = Infinity
    for (const fac of FACILITY_DOORS) {
      const dist = Math.hypot(fac.x - cx, fac.y - cy)
      if (dist < 75 && dist < minDist) {
        minDist = dist
        closest = fac
      }
    }
    setNearFacility(prev => (prev?.id === closest?.id ? prev : closest))
  }, [charPos.x, charPos.y, currentZone, insideRoom])

  // Proximity to facility room learning stations (Bookshelf in Perpustakaan, Terminal in Lab Komputer)
  useEffect(() => {
    if (!insideRoom) {
      setNearLibraryShelf(prev => (!prev ? prev : false))
      setNearLabTerminal(prev => (!prev ? prev : false))
      return
    }
    if (insideRoom.id === 'Perpustakaan') {
      const isNear = Math.hypot(charPos.x - 280, charPos.y - 440) < 90
      setNearLibraryShelf(prev => (prev === isNear ? prev : isNear))
      setNearLabTerminal(prev => (!prev ? prev : false))
    } else if (insideRoom.id === 'LabKomputer') {
      const isNear = Math.hypot(charPos.x - 300, charPos.y - 440) < 90
      setNearLabTerminal(prev => (prev === isNear ? prev : isNear))
      setNearLibraryShelf(prev => (!prev ? prev : false))
    } else {
      setNearLibraryShelf(prev => (!prev ? prev : false))
      setNearLabTerminal(prev => (!prev ? prev : false))
    }
  }, [charPos.x, charPos.y, insideRoom])

  // Proximity to Mother Cat & Direct Interaction
  useEffect(() => {
    if (insideRoom || currentZone !== 'main' || catQuestStage === 'untriggered') {
      setNearMotherCat(prev => (!prev ? prev : false))
      return
    }
    const dist = Math.hypot(charPos.x - motherCatPos.x, charPos.y - motherCatPos.y)
    const isNear = dist < 80
    setNearMotherCat(prev => (prev === isNear ? prev : isNear))

    // Trigger reunion modal when returning near Mother Cat with rescued kitten Mochi
    if (isNear && catQuestStage === 'kitten_rescued' && !showMotherCatModalR.current) {
      gameAudio.playCatMeow()
      setShowMotherCatModal(true)
    }
  }, [charPos.x, charPos.y, insideRoom, currentZone, catQuestStage, motherCatPos])

  // Proximity to Kitten in Box & Unavoidable Direct Rescue (Cannot ignore)
  useEffect(() => {
    if (catQuestStage !== 'quest_active') {
      setNearKitten(prev => (!prev ? prev : false))
      return
    }
    const isPlayerInKittenZone =
      (kittenLocation.zone === 'Perpustakaan' && insideRoom?.id === 'Perpustakaan') ||
      (kittenLocation.zone === 'LabKomputer' && insideRoom?.id === 'LabKomputer') ||
      (kittenLocation.zone === 'facility_courtyard' && currentZone === 'facility' && !insideRoom) ||
      (kittenLocation.zone === 'hallway' && currentZone === 'main' && !insideRoom)

    if (!isPlayerInKittenZone) {
      setNearKitten(prev => (!prev ? prev : false))
      return
    }

    const dist = Math.hypot(charPos.x - kittenLocation.x, charPos.y - kittenLocation.y)
    const isNear = dist < 80
    setNearKitten(prev => (prev === isNear ? prev : isNear))

    // Directly trigger rescue when reaching Mochi's box
    if (isNear && !showKittenRescueModalR.current) {
      resetMovement()
      gameAudio.playCatMeow()
      setShowKittenRescueModal(true)
    }
  }, [charPos.x, charPos.y, catQuestStage, kittenLocation, insideRoom, currentZone, resetMovement])

  // Proximity to Zone Transition Gateway & Auto-step transition
  useEffect(() => {
    if (insideRoom) {
      setZoneTransitionPrompt(prev => (prev === null ? prev : null))
      return
    }

    // Auto-step transition or Satpam interception when walking through open school front gate
    if (currentZone === 'gate' && charPos.y <= 468 && charPos.x >= 480 && charPos.x <= 755) {
      if (!hasPassedSatpamQuiz) {
        attemptEnterSchoolFromGate()
        return
      }
      if (charPos.y <= 425) {
        enterSchoolFromGate()
        return
      }
    }

    const isTaskGiven = cinematicStageRef.current === 'sanction_received' || demoMode || collectedR.current.size > 0 || savedClassesR.current.size > 0
    const isAtGateway = charPos.y >= 590 && Math.abs(charPos.x - 625) < 220
    const targetPrompt = isAtGateway ? (currentZone === 'main' && !isTaskGiven ? null : currentZone === 'main' ? 'to_facility' : 'to_main') : null
    setZoneTransitionPrompt(prev => (prev === targetPrompt ? prev : targetPrompt))

    // Auto-step transition when walking to the very edge (y >= 635)
    if (charPos.y >= 635 && Math.abs(charPos.x - 625) < 220) {
      if (currentZone === 'main') {
        if (!isTaskGiven) {
          setCharPos(p => (p.y >= 635 ? { ...p, y: 628 } : p))
          gameAudio.playError()
          setRgLockedToast('🔒 Area Fasilitas belum dibuka! Jumpai Pak Sutrisno di depan Ruang Guru terlebih dahulu untuk melapor.')
          setTimeout(() => setRgLockedToast(null), 2500)
        } else {
          goToFacilityZone()
        }
      } else {
        goToMainZone()
      }
    }
  }, [charPos.x, charPos.y, currentZone, insideRoom, hasPassedSatpamQuiz, goToFacilityZone, goToMainZone, enterSchoolFromGate, attemptEnterSchoolFromGate, demoMode])

  // Preload background image of classroom dynamically when player approaches its door
  useEffect(() => {
    if (!nearClass) return
    const bgUrl = LEVEL1_MAPS[nearClass.id]?.bgImage
    if (bgUrl) {
      const img = new Image()
      img.src = bgUrl
    }
  }, [nearClass])

  // Finish trigger once all 24 data points are collected
  useEffect(() => {
    if (collected.size >= TOTAL_N && !showCounter && !showPakReportModal) {
      // Waypoint arrow points to Pak Sutrisno to report back
    }
  }, [collected.size, showCounter, showPakReportModal])

  // Auto-clamp player Y position if ever above boundaries
  useEffect(() => {
    if (insideRoom) return
    if (currentZone === 'gate') {
      const minGateY = (charPos.x >= 490 && charPos.x <= 745) ? 330 : 445
      if (charPos.y < minGateY - 1) {
        setCharPos(prev => (prev.y < minGateY - 1 ? { ...prev, y: minGateY } : prev))
      }
    } else if (currentZone === 'facility') {
      if (charPos.y < 380 - 1) {
        setCharPos(prev => (prev.y < 380 - 1 ? { ...prev, y: 380 } : prev))
      }
    } else {
      const redLineY = getRedLineY(charPos.x)
      if (charPos.y < redLineY - 1) {
        setCharPos(prev => (prev.y < redLineY - 1 ? { ...prev, y: redLineY } : prev))
      }
    }
  }, [charPos.x, charPos.y, insideRoom, currentZone])

  const lastTimeRef = useRef<number>(0)

  // Main game tick: movement animation loop with delta-time smoothing & camera lerp
  useEffect(() => {
    lastTimeRef.current = performance.now()
    const tick = () => {
      const now = performance.now()
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = now

      const isInside = !!insideRoomR.current
      let targetFocusX = isInside ? 600 : charPosRef.current.x
      let targetFocusY = isInside ? 580 : charPosRef.current.y

      if (!isInside && currentZoneR.current === 'main') {
        if (cinematicStageRef.current === 'panning_to_pak' || cinematicStageRef.current === 'pak_shouting' || cinematicStageRef.current === 'pak_shouting_2') {
          targetFocusX = PAK_SUTRISNO_POS.x
          targetFocusY = PAK_SUTRISNO_POS.y - 45
        } else if (['pak_sanction_1', 'pak_sanction_2', 'pak_sanction_3', 'player_reply_pak'].includes(cinematicStageRef.current)) {
          targetFocusX = (PAK_SUTRISNO_POS.x + charPosRef.current.x) / 2
          targetFocusY = PAK_SUTRISNO_POS.y - 45
        }
      } else if (!isInside && currentZoneR.current === 'gate' && satpamChatStageR.current !== 'idle') {
        if (satpamChatStageR.current === 'player_excuse_1' || satpamChatStageR.current === 'player_thanks') {
          targetFocusX = charPosRef.current.x
          targetFocusY = charPosRef.current.y
        } else {
          targetFocusX = 820
          targetFocusY = satpamChatStageR.current === 'pak_quiz' ? 392 : 440
        }
      }

      // Smooth camera lerp
      smoothCamPos.current.x += (targetFocusX - smoothCamPos.current.x) * 0.075
      smoothCamPos.current.y += (targetFocusY - smoothCamPos.current.y) * 0.075

      // Automatic transitions for camera pan
      if (cinematicStageRef.current === 'panning_to_pak') {
        const distToPak = Math.hypot(smoothCamPos.current.x - PAK_SUTRISNO_POS.x, smoothCamPos.current.y - (PAK_SUTRISNO_POS.y - 45))
        if (distToPak < 40) {
          setCinematicStage('pak_shouting')
        }
      } else if (cinematicStageRef.current === 'panning_to_player') {
        const distToPlayer = Math.hypot(smoothCamPos.current.x - charPosRef.current.x, smoothCamPos.current.y - charPosRef.current.y)
        if (distToPlayer < 35) {
          setCinematicStage('quest_meet_pak')
        }
      } else if (cinematicStageRef.current === 'quest_meet_pak') {
        const distToPak = Math.hypot(charPosRef.current.x - PAK_SUTRISNO_POS.x, charPosRef.current.y - PAK_SUTRISNO_POS.y)
        if (distToPak < 110) {
          setCinematicStage('pak_sanction_1')
        }
      }

      const isCinematicActive = cinematicStageRef.current === 'player_intro' ||
                                cinematicStageRef.current === 'panning_to_pak' || 
                                cinematicStageRef.current === 'pak_shouting' || 
                                cinematicStageRef.current === 'pak_shouting_2' || 
                                cinematicStageRef.current === 'panning_to_player' ||
                                cinematicStageRef.current === 'pak_sanction_1' ||
                                cinematicStageRef.current === 'pak_sanction_2' ||
                                cinematicStageRef.current === 'pak_sanction_3' ||
                                cinematicStageRef.current === 'player_reply_pak'

      const isClassroomConversation = !!(insideRoomR.current && ['A1', 'A2', 'B1', 'B2'].includes(insideRoomR.current.id))

      if (
        !activeDoor &&
        !activeClass &&
        !showWaliKelasPopup &&
        !activeFacilityR.current &&
        !showLibraryBookModalR.current &&
        !showLabTerminalModalR.current &&
        satpamChatStageR.current === 'idle' &&
        !isCinematicActive &&
        !isTransitioningRef.current &&
        !isClassroomConversation
      ) {
        const { x: dx, y: dy } = dirRef.current
        if (dx || dy) {
          const currentMapKey = insideRoomR.current?.id || (currentZoneR.current === 'gate' ? 'gate' : currentZoneR.current === 'facility' ? 'facility_courtyard' : 'hallway')
          const activeMap = LEVEL1_MAPS[currentMapKey] || LEVEL1_MAPS['hallway']
          const moveSpeed = activeMap.character.speed * 40
          const dist = moveSpeed * dt

          setCharPos(p => {
            const isInsideClass = !!insideRoomR.current
            const isFacility = currentZoneR.current === 'facility'
            const isGate = currentZoneR.current === 'gate'

            let minX = 70
            let maxX = 1165
            let maxY = 640

            if (isInsideClass) {
              minX = 50
              maxX = WORLD_VW - 50
              maxY = WORLD_VH - 40 // 610
            } else if (isFacility) {
              minX = 60
              maxX = WORLD_VW - 60
              maxY = 640
            } else if (isGate) {
              minX = 60
              maxX = WORLD_VW - 60
              maxY = 630
            }

            // 1. Sanitize current position p so it is NEVER outside valid bounds
            const clampedX = Math.max(minX, Math.min(maxX, p.x))
            const currentMinY = isInsideClass ? 380 : isFacility ? 380 : isGate ? (clampedX >= 490 && clampedX <= 745 ? 330 : 445) : getRedLineY(clampedX)
            const clampedY = Math.max(currentMinY, Math.min(maxY, p.y))

            // Desired target coordinates
            const targetX = Math.max(minX, Math.min(maxX, clampedX + dx * dist))
            const targetMinY = isInsideClass ? 380 : isFacility ? 380 : isGate ? (targetX >= 490 && targetX <= 745 ? 330 : 445) : getRedLineY(targetX)
            const targetY = Math.max(targetMinY, Math.min(maxY, clampedY + dy * dist))

            // Clamp at y=468 when approaching gate before passing Satpam quiz (useEffect will trigger interception)
            if (isGate && targetY <= 468 && targetX >= 480 && targetX <= 755 && !hasPassedSatpamQuizR.current) {
              return { x: targetX, y: 468 }
            }

            // Option A: Direct diagonal move
            if (activeMap.isWalkable(targetX, targetY, unlockedR.current)) {
              return { x: targetX, y: targetY }
            }

            // Option B: Slide horizontally (with slope adaptation for hallway)
            if (!isInsideClass && !isFacility && !isGate) {
              const slopeY = Math.max(getRedLineY(targetX), clampedY)
              if (slopeY <= maxY && activeMap.isWalkable(targetX, slopeY, unlockedR.current)) {
                return { x: targetX, y: slopeY }
              }
            } else {
              if (activeMap.isWalkable(targetX, clampedY, unlockedR.current)) {
                return { x: targetX, y: clampedY }
              }
            }

            // Option C: Slide vertically
            if (activeMap.isWalkable(clampedX, targetY, unlockedR.current)) {
              return { x: clampedX, y: targetY }
            }

            // Option D: Fallback to sanitized position (prevents out-of-bounds trap)
            return { x: clampedX, y: clampedY }
          })
        }
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [activeDoor, activeClass, showWaliKelasPopup, activeFacility])

  const handleExitClassroom = useCallback(() => {
    const exitingRoom = insideRoomR.current
    gameAudio.playDoorOpen()
    resetMovement()
    if (teacherTimerRef.current) clearTimeout(teacherTimerRef.current)
    setTeacherCutsceneStage(null)
    insideRoomR.current = null
    setInsideRoom(null)
    const fallbackExitY = exitingRoom && ['A1', 'A2', 'B1', 'B2', 'RG'].includes(exitingRoom.id) ? 480 : 550
    const exitPos = lastHallwayPosRef.current
      ? {
          x: lastHallwayPosRef.current.x,
          y: Math.max(450, Math.min(580, lastHallwayPosRef.current.y)),
        }
      : { x: 650, y: fallbackExitY }
    setCharPos(exitPos)
    charPosRef.current = exitPos
    smoothCamPos.current = { ...exitPos }

    // Cat Quest: Spawn Mother Cat (Mimi) upon exiting the randomly chosen classroom (VII-A, VII-B, VIII-A, or VIII-B), right in front of the player
    if (
      exitingRoom &&
      ['A1', 'A2', 'B1', 'B2'].includes(exitingRoom.id) &&
      catQuestStageR.current === 'untriggered' &&
      (exitingRoom.id === catTargetClassIdR.current || savedClassesR.current.size >= 4)
    ) {
      const classDoor = doors.find(d => d.id === exitingRoom.id) || exitingRoom
      const spawnX = exitPos.x + 38
      const spawnY = Math.min(610, Math.max(getRedLineY(spawnX) + 15, exitPos.y + 25))
      let randomSpot: { zone: string; x: number; y: number; label: string } =
        KITTEN_SPAWN_SPOTS[Math.floor(Math.random() * KITTEN_SPAWN_SPOTS.length)]
      if ((exitingRoom.id === 'B1' || exitingRoom.id === 'B2') && randomSpot.zone === 'hallway') {
        randomSpot = { zone: 'hallway', x: 280, y: 530, label: 'Halaman Depan Kelas VII' }
      }

      const nextMotherPos = { x: spawnX, y: spawnY, classLabel: classDoor.label, classId: classDoor.id }
      motherCatPosR.current = nextMotherPos
      setMotherCatPos(nextMotherPos)
      kittenLocationR.current = randomSpot
      setKittenLocation(randomSpot)
      catQuestStageR.current = 'cat_spawned'
      setCatQuestStage('cat_spawned')
      setTimeout(() => {
        gameAudio.playCatMeow()
        setShowMotherCatModal(true)
      }, 450)
    }
  }, [resetMovement, doors])

  const enterClassroom = useCallback((room: QuizDoor) => {
    const isTaskGiven = cinematicStageRef.current === 'sanction_received' || demoMode || collectedR.current.size > 0 || savedClassesR.current.size > 0
    if (!isTaskGiven && room.id !== 'RG') {
      gameAudio.playError()
      setRgLockedToast('🔒 Temui Pak Sutrisno terlebih dahulu untuk melapor dan menerima tugas!')
      setTimeout(() => setRgLockedToast(null), 2500)
      return
    }

    // Intercept if entering the room where Mother Cat is stationed before talking to the cat
    if (catQuestStageR.current === 'cat_spawned' && room.id === motherCatPosR.current.classId) {
      resetMovement()
      gameAudio.playCatMeow()
      setShowMotherCatModal(true)
      return
    }

    gameAudio.playDoorOpen()
    resetMovement()
    lastHallwayPosRef.current = {
      x: room.x,
      y: Math.max(460, Math.min(580, charPosRef.current.y || 480)),
    }
    const isClassroom = ['A1', 'A2', 'B1', 'B2'].includes(room.id)
    const spawnPos = LEVEL1_MAPS[room.id]?.spawn || (isClassroom ? { x: 930, y: 540 } : { x: 1050, y: 510 })
    setInsideRoom(room)
    insideRoomR.current = room
    setCharPos(spawnPos)
    charPosRef.current = spawnPos
    

    if (savedClassesR.current.has(room.id)) return

    const mapConfig = LEVEL1_MAPS[room.id]
    if (teacherTimerRef.current) clearTimeout(teacherTimerRef.current)

    // Snappy 400ms auto cutscene in conversation mode
    teacherTimerRef.current = setTimeout(() => {
      setTeacherCutsceneStage('teacher_ask')
    }, 400)
  }, [resetMovement])

  const teleportToPakSutrisno = useCallback(() => {
    // 1. Lengkapi 24 data (4 kelas)
    const fullSet = new Set<string>()
    DATA_CIRCLES.forEach(c => fullSet.add(c.id))
    collectedR.current = fullSet
    setCollected(fullSet)

    const fullSaved = new Set(['A1', 'A2', 'B1', 'B2'])
    savedClassesR.current = fullSaved
    setSavedClasses(fullSaved)

    // 2. Tandai misi kucing selesai & buka akses Ruang Guru
    catQuestStageR.current = 'completed'
    setCatQuestStage('completed')
    unlockedR.current = new Set([...unlockedR.current, 'A', 'B', 'RG', 'A1', 'A2', 'B1', 'B2'])
    setUnlocked(prev => new Set([...prev, 'A', 'B', 'RG', 'A1', 'A2', 'B1', 'B2']))
    hasPassedSatpamQuizR.current = true
    setHasPassedSatpamQuiz(true)
    cinematicStageRef.current = 'sanction_received'
    setCinematicStage('sanction_received')

    // 3. Teleportasi ke dalam Ruang Guru tepat di hadapan Pak Sutrisno
    currentZoneR.current = 'main'
    setCurrentZone('main')

    const rgDoor = doors.find(d => d.id === 'RG') || {
      id: 'RG',
      roomId: 'RG',
      label: 'Ruang Guru',
      x: 618,
      y: 355,
      color: '#F59E0B',
      image: '/Assets/Building/Ruang Guru/Ruang Guru.webp'
    } as QuizDoor

    insideRoomR.current = rgDoor
    setInsideRoom(rgDoor)
    const rgSpawn = LEVEL1_MAPS['RG']?.spawn || { x: 260, y: 595 }
    setCharPos(rgSpawn)
    charPosRef.current = rgSpawn
    resetMovement()

    // 4. Langsung buka Papan Analisis Data (PakReportModal)
    setShowPakReportModal(true)
    gameAudio.playUnlockJingle()
  }, [resetMovement, doors])

  const teleportToPakSutrisnoRef = useRef(teleportToPakSutrisno)
  teleportToPakSutrisnoRef.current = teleportToPakSutrisno

  const handleClassCorrect = useCallback(() => {
    if (!activeClass) return
    const roomToEnter = activeClass
    setUnlocked(p => new Set([...p, roomToEnter.id]))
    setActiveClass(null)
    enterClassroom(roomToEnter)
  }, [activeClass, enterClassroom])

  const handleInteractTeacher = useCallback((room: QuizDoor) => {
    if (room.id === 'Perpustakaan' || room.id === 'LabKomputer') {
      return
    }

    const mapConfig = LEVEL1_MAPS[room.id]
    const hasTeacherSprite = !!mapConfig?.teacher?.spriteUrl

    const currentStage = teacherCutsceneStageRef.current
    if (!currentStage) {
      if (room.id === 'RG') {
        setShowPakReportModal(true)
        return
      }
      if (hasTeacherSprite) {
        if (teacherTimerRef.current) clearTimeout(teacherTimerRef.current)
        setTeacherCutsceneStage('anim_wait')
        const animDuration = (mapConfig.teacher?.totalFrames || 24) * (mapConfig.teacher?.speedMs || 90)
        teacherTimerRef.current = setTimeout(() => {
          setTeacherCutsceneStage('teacher_ask')
        }, animDuration)
      } else {
        setTeacherCutsceneStage('teacher_ask')
      }
    } else if (currentStage === 'anim_wait') {
      if (teacherTimerRef.current) clearTimeout(teacherTimerRef.current)
      setTeacherCutsceneStage('teacher_ask')
    } else if (currentStage === 'teacher_ask') {
      setTeacherCutsceneStage('player_explain')
    } else if (currentStage === 'player_explain') {
      setTeacherCutsceneStage('teacher_reply')
    } else if (currentStage === 'teacher_reply') {
      setTeacherCutsceneStage(null)
      if (room.id === 'RG') {
        setShowPakReportModal(true)
      } else {
        setShowWaliKelasPopup(room)
      }
    } else if (currentStage === 'post_stevunt_report') {
      gameAudio.playClick()
      setTeacherCutsceneStage('post_pak_thanks')
    } else if (currentStage === 'post_pak_thanks') {
      gameAudio.playClick()
      // Generate randomized claim quiz from active dataset
      const quiz = generatePakSutrisnoClaimQuiz(activeDataset)
      setSutrisnoQuiz(quiz)
      setSutrisnoQuizWrong(false)
      setTeacherCutsceneStage('post_pak_quiz')
    } else if (currentStage === 'post_pak_quiz') {
      // During quiz stage, clicking bubble does not advance; student must click option button
      return
    } else if (currentStage === 'post_conclusion') {
      gameAudio.playUnlockJingle()
      setTeacherCutsceneStage(null)
      const latestStartTime = useGameStore.getState().sessionStartTime || sessionStartTime || (Date.now() - 240000)
      const elapsed = Math.max(1, Math.floor((Date.now() - latestStartTime) / 1000))
      const stars = elapsed <= 360 ? 3 : elapsed <= 600 ? 2 : 1
      setElapsedSecondsState(elapsed)
      setEarnedStarsState(stars)
      setShowMissionCompleteModal(true)
    }
  }, [activeDataset])

  const handleSelectSutrisnoQuizOption = useCallback((isCorrect: boolean, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isCorrect) {
      gameAudio.playUnlockJingle()
      setTeacherCutsceneStage(null)
      const latestStartTime = useGameStore.getState().sessionStartTime || sessionStartTime || (Date.now() - 240000)
      const elapsed = Math.max(1, Math.floor((Date.now() - latestStartTime) / 1000))
      const stars = elapsed <= 360 ? 3 : elapsed <= 600 ? 2 : 1
      setElapsedSecondsState(elapsed)
      setEarnedStarsState(stars)
      setShowMissionCompleteModal(true)
    } else {
      gameAudio.playError()
      setSutrisnoQuizWrong(true)
      setSutrisnoWrongCount(prev => prev + 1)
      incrementMistake()
    }
  }, [sessionStartTime, incrementMistake])

  // Keyboard navigation listeners
  useEffect(() => {
    const KEY_MAP: Record<string, { x: number; y: number }> = {
      ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
    }

    const updateDir = () => {
      let nx = 0, ny = 0
      pressedKeysRef.current.forEach(k => {
        const d = KEY_MAP[k]
        if (d) { nx += d.x; ny += d.y }
      })
      const len = Math.sqrt(nx * nx + ny * ny)
      const nextDir = len > 0 ? { x: nx / len, y: ny / len } : { x: 0, y: 0 }
      dirRef.current = nextDir
      setMoveDir(nextDir)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const activeDoorVal = activeDoorR.current
      const activeClassVal = activeClassR.current
      const nearDoorVal = nearDoorR.current
      const nearClassVal = nearClassR.current
      const activeFacilityVal = activeFacilityR.current
      const nearFacilityVal = nearFacilityR.current
      if (showMotherCatModalR.current) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
          e.preventDefault()
          if (catQuestStageR.current === 'cat_spawned') {
            setCatQuestStage('quest_active')
          } else if (catQuestStageR.current === 'kitten_rescued') {
            setCatQuestStage('completed')
          }
          setShowMotherCatModal(false)
          resetMovement()
        }
        return
      }

      if (showKittenRescueModalR.current) {
        if (e.key === 'Escape') {
          e.preventDefault()
          setShowKittenRescueModal(false)
          resetMovement()
        }
        return
      }

      if (showLibraryBookModalR.current) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setShowLibraryBookModal(false)
          resetMovement()
        }
        return
      }

      if (showLabTerminalModalR.current) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setShowLabTerminalModal(false)
          resetMovement()
        }
        return
      }

      if (activeFacilityVal) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setActiveFacility(null)
          resetMovement()
        }
        return
      }

      if (satpamChatStageR.current !== 'idle') {
        resetMovement()
        if (e.key === 'Escape') {
          e.preventDefault()
          satpamChatStageR.current = 'idle'
          setSatpamChatStage('idle')
          if (!hasPassedSatpamQuizR.current) {
            setCharPos(prev => (prev.y <= 445 ? { ...prev, y: 455 } : prev))
          }
          return
        }
        if (satpamChatStageR.current === 'pak_quiz') {
          if (e.key === '1' || e.key === 'a' || e.key === 'A') {
            e.preventDefault()
            handleSelectSatpamOption(0)
          } else if (e.key === '2' || e.key === 'b' || e.key === 'B') {
            e.preventDefault()
            handleSelectSatpamOption(1)
          } else if (e.key === '3' || e.key === 'c' || e.key === 'C') {
            e.preventDefault()
            handleSelectSatpamOption(2)
          } else if (e.key === '4' || e.key === 'd' || e.key === 'D') {
            e.preventDefault()
            handleSelectSatpamOption(3)
          }
          return
        }
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
          e.preventDefault()
          advanceSatpamChat()
        }
        return
      }

      if (activeDoorVal || activeClassVal || showWaliKelasPopupR.current) {
        if (e.key === 'Escape') {
          e.preventDefault()
          setActiveDoor(null)
          setActiveClass(null)
          resetMovement()
        }
        return
      }
      if (insideRoomR.current && e.key === 'Escape') {
        e.preventDefault()
        handleExitClassroom()
        return
      }

      const keyNormalized = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (KEY_MAP[keyNormalized]) {
        e.preventDefault()
        if (insideRoomR.current && ['A1', 'A2', 'B1', 'B2'].includes(insideRoomR.current.id)) {
          // Strictly conversation mode inside classrooms: player cannot walk around
          return
        }
        pressedKeysRef.current.add(keyNormalized)
        updateDir()
      }

      // ── Quick Teleport & Classroom Dev Keys (Commented out for player) ──
      /*
      if (keyNormalized === 't' && !showPakReportModal) {
        e.preventDefault()
        teleportToPakSutrisnoRef.current()
        return
      }

      if (keyNormalized === 'k' && !showPakReportModal) {
        e.preventDefault()
        const roomA1 = doors.find(d => d.id === 'A1')
        if (roomA1) {
          currentZoneR.current = 'main'
          setCurrentZone('main')
          cinematicStageRef.current = 'sanction_received'
          setCinematicStage('sanction_received')
          insideRoomR.current = roomA1
          setInsideRoom(roomA1)
          setShowWaliKelasPopup(roomA1)
        }
        return
      }
      */

      // ── Gate Zone Entry or Satpam Interaction via Key ──
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && !insideRoomR.current && currentZoneR.current === 'gate') {
        // Pak Joko is only triggered when attempting to enter the gate
        const isNearGateOpening = charPosRef.current.y <= 490 && charPosRef.current.x >= 450 && charPosRef.current.x <= 780
        if (isNearGateOpening) {
          e.preventDefault()
          attemptEnterSchoolFromGate()
          return
        }
        if (cinematicStageRef.current === 'gate_intro') {
          setGateBubbleStep(p => p + 1)
        }
      }

      // ── Gateway Zone Transition via Key ──
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && !insideRoomR.current && currentZoneR.current !== 'gate') {
        const isAtGateway = charPosRef.current.y >= 590 && Math.abs(charPosRef.current.x - 625) < 220
        if (isAtGateway) {
          e.preventDefault()
          if (currentZoneR.current === 'main') {
            goToFacilityZone()
          } else {
            goToMainZone()
          }
          return
        }
      }

      // ── Cat Quest Interaction via Key ──
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E')) {
        if (nearMotherCatR.current && !insideRoomR.current && currentZoneR.current === 'main') {
          e.preventDefault()
          gameAudio.playCatMeow()
          setShowMotherCatModal(true)
          resetMovement()
          return
        }
        if (nearKittenR.current && catQuestStageR.current === 'quest_active') {
          e.preventDefault()
          gameAudio.playCatMeow()
          setShowKittenRescueModal(true)
          resetMovement()
          return
        }
      }

      // ── Facility Interaction via Key ──
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && currentZoneR.current === 'facility' && nearFacilityVal && !insideRoomR.current) {
        e.preventDefault()
        if (nearFacilityVal.roomId) {
          enterFacilityRoom(nearFacilityVal)
        } else {
          setActiveFacility(nearFacilityVal)
          resetMovement()
          gameAudio.playDoorOpen()
        }
        return
      }

      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && nearDoorVal && !unlockedR.current.has(nearDoorVal.id)) {
        e.preventDefault()
        setUnlocked(p => new Set([...p, nearDoorVal.id]))
      } else if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && nearClassVal) {
        e.preventDefault()
        if (nearClassVal.id === 'RG') {
          const isDataComplete = collectedR.current.size >= TOTAL_N || savedClassesR.current.size >= 4
          const isKittenFound = catQuestStageR.current === 'kitten_rescued' || catQuestStageR.current === 'completed'
          const isRGUnlocked = isDataComplete && isKittenFound
          if (isRGUnlocked) {
            enterClassroom(nearClassVal)
          } else {
            gameAudio.playError()
            if (!isDataComplete && !isKittenFound) {
              setRgLockedToast(`🔒 Ruang Guru Terkunci! Kumpulkan data 4 kelas (${collectedR.current.size}/${TOTAL_N}) dan temukan anak kucing yang hilang terlebih dahulu!`)
            } else if (!isKittenFound) {
              setRgLockedToast(`🔒 Ruang Guru Terkunci! Kamu harus menemukan anak kucing yang hilang terlebih dahulu sebelum melapor ke Pak Sutrisno!`)
            } else {
              setRgLockedToast(`🔒 Ruang Guru Terkunci! Kumpulkan seluruh data dari 4 kelas terlebih dahulu (${collectedR.current.size}/${TOTAL_N}).`)
            }
            setTimeout(() => setRgLockedToast(null), 2500)
          }
          return
        }
        if (savedClassesR.current.has(nearClassVal.id)) {
          return
        }
        enterClassroom(nearClassVal)
      } else if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && insideRoomR.current) {
        if (insideRoomR.current.id === 'Perpustakaan' && nearLibraryShelfR.current) {
          e.preventDefault()
          setShowLibraryBookModal(true)
          resetMovement()
          return
        }
        if (insideRoomR.current.id === 'LabKomputer' && nearLabTerminalR.current) {
          e.preventDefault()
          setShowLabTerminalModal(true)
          resetMovement()
          return
        }

        const currentMap = LEVEL1_MAPS[insideRoomR.current.id]
        const teacherX = currentMap?.teacher?.x ?? 617
        const teacherY = currentMap?.teacher?.y ?? 415
        const isClass = ['A1', 'A2', 'B1', 'B2'].includes(insideRoomR.current.id)
        const distToTeacher = Math.hypot(charPosRef.current.x - teacherX, charPosRef.current.y - teacherY)
        if (isClass || distToTeacher < 350 || teacherCutsceneStageRef.current) {
          if (teacherCutsceneStageRef.current === 'post_pak_quiz') {
            return
          }
          e.preventDefault()
          handleInteractTeacher(insideRoomR.current)
        }
      } else if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && !insideRoomR.current && cinematicStageRef.current !== 'sanction_received') {
        if (cinematicStageRef.current === 'player_intro') {
          e.preventDefault()
          setCinematicStage('panning_to_pak')
          return
        } else if (cinematicStageRef.current === 'pak_shouting') {
          e.preventDefault()
          setCinematicStage('pak_shouting_2')
          return
        } else if (cinematicStageRef.current === 'pak_shouting_2') {
          e.preventDefault()
          setCinematicStage('panning_to_player')
          return
        }

        const pakX = PAK_SUTRISNO_POS.x
        const pakY = PAK_SUTRISNO_POS.y
        const distToPak = Math.hypot(charPosRef.current.x - pakX, charPosRef.current.y - pakY)
        if (distToPak < 135) {
          e.preventDefault()
          if (cinematicStageRef.current === 'quest_meet_pak') {
            setCinematicStage('pak_sanction_1')
          } else if (cinematicStageRef.current === 'pak_sanction_1') {
            setCinematicStage('pak_sanction_2')
          } else if (cinematicStageRef.current === 'pak_sanction_2') {
            setCinematicStage('pak_sanction_3')
          } else if (cinematicStageRef.current === 'pak_sanction_3') {
            setCinematicStage('player_reply_pak')
          } else if (cinematicStageRef.current === 'player_reply_pak') {
            setCinematicStage('sanction_received')
            gameAudio.playUnlockJingle()
            setRoomMilestoneText('TUGAS DITERIMA! 📋 AREA FASILITAS & KELAS TERBUKA!')
            setTimeout(() => setRoomMilestoneText(null), 3000)
          }
        }
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      const keyNormalized = e.key.length === 1 ? e.key.toLowerCase() : e.key
      pressedKeysRef.current.delete(keyNormalized)
      updateDir()
    }

    const onBlur = () => {
      resetMovement()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      resetMovement()
    }
  }, [resetMovement, goToFacilityZone, goToMainZone, enterClassroom, enterFacilityRoom, handleInteractTeacher, handleExitClassroom])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__DEV_ENTER_ROOM__ = (targetId: string) => {
        cinematicStageRef.current = 'sanction_received'
        setCinematicStage('sanction_received')
        currentZoneR.current = 'main'
        setCurrentZone('main')
        const classDoor = doors.find(d => d.id === targetId)
        if (classDoor) {
          enterClassroom(classDoor)
          return
        }
        const facDoor = FACILITY_DOORS.find(f => f.id === targetId || f.roomId === targetId)
        if (facDoor) {
          enterFacilityRoom(facDoor)
          return
        }
      }
      (window as any).__DEV_OPEN_WALI__ = (id: any) => {
        const r = doors.find(d => d.id === id);
        if (r) { insideRoomR.current = r; setInsideRoom(r); setShowWaliKelasPopup(r); }
      };
      (window as any).__DEV_EXIT_ROOM__ = () => {
        handleExitClassroom()
      }
      // Dev/test helper: teleport Stevunt to a world position
      ;(window as any).__DEV_SET_POS__ = (x: number, y: number) => {
        const p = { x, y }
        charPosRef.current = p
        setCharPos(p)
      }
      ;(window as any).__DEV_SET_SESSION_TIME__ = (secondsAgo: number) => {
        useGameStore.setState({ sessionStartTime: Date.now() - (secondsAgo * 1000) })
      }
      ;(window as any).__DEV_SET_CINEMATIC__ = (stage: any) => {
        cinematicStageRef.current = stage
        setCinematicStage(stage)
      }
      ;(window as any).__DEV_SET_ZONE__ = (z: any) => {
        currentZoneR.current = z
        setCurrentZone(z)
      }
      ;(window as any).__DEV_GET_STATE__ = () => ({
        insideRoom: insideRoomR.current,
        insideRoomState: insideRoom,
        catStage: catQuestStageR.current,
        pos: charPosRef.current,
        dir: dirRef.current,
        nearClass: nearClassR.current,
        isCinematic: cinematicStageRef.current,
        pressedKeys: Array.from(pressedKeysRef.current),
        showWaliKelasPopup: !!showWaliKelasPopup,
        activeClass: !!activeClass,
        activeDoor: !!activeDoor,
        animFrameRunning: !!animRef.current,
      })
    }
  }, [doors, enterClassroom, enterFacilityRoom, handleExitClassroom])

  const handleCorrect = useCallback(() => {
    if (!activeDoor) return
    gameAudio.playSuccess()
    setUnlocked(p => new Set([...p, activeDoor.id]))
    setActiveDoor(null)
  }, [activeDoor])

  const handleCloseWaliKelas = useCallback(() => {
    if (!showWaliKelasPopup) return
    const cid = showWaliKelasPopup.id
    const roomId = showWaliKelasPopup.roomId

    const nextSaved = new Set([...savedClassesR.current, cid])
    savedClassesR.current = nextSaved
    setSavedClasses(nextSaved)

    // 1. Add class ID to unlocked & check room completion
    setUnlocked(prev => {
      const next = new Set(prev)
      next.add(cid)

      const roomClasses = doors.filter(cd => cd.roomId === roomId)
      const completed = roomClasses.every(cd => next.has(cd.id))
      if (completed) {
        setRoomMilestoneText(`RUANG ${roomId} SELESAI! 🚀`)
        setTimeout(() => {
          setRoomMilestoneText(null)
        }, 2200)
      }

      return next
    })

    // 2. Add class data circles to collected & check total milestones
    const classCircles = DATA_CIRCLES.filter(c => c.classId === cid)
    setCollected(prev => {
      const next = new Set(prev)
      classCircles.forEach(c => next.add(c.id))

      const oldSize = prev.size
      const newSize = next.size

      if (oldSize < 12 && newSize >= 12) {
        gameAudio.playItemCollect()
        setMilestoneGlow('50%')
        setTimeout(() => setMilestoneGlow(null), 1800)
      } else if (oldSize < 24 && newSize >= 24) {
        gameAudio.playUnlockJingle()
        setMilestoneGlow('100%')
        setRoomMilestoneText('DATA TERKUMPUL 24/24! 🎉 TELEPORTASI KE PAK SUTRISNO...')
        setTimeout(() => {
          setMilestoneGlow(null)
          setRoomMilestoneText(null)
          teleportToPakSutrisnoRef.current()
        }, 1600)
      } else {
        gameAudio.playItemCollect()
      }

      return next
    })

    setJustCompletedClassId(cid)
    setTimeout(() => {
      setJustCompletedClassId(null)
    }, 1500)

    setShowWaliKelasPopup(null)
    handleExitClassroom()
  }, [showWaliKelasPopup, handleExitClassroom])

  const n = collected.size
  const isTaskGiven = cinematicStage === 'sanction_received' || demoMode || collected.size > 0 || savedClasses.size > 0
  const isRoomACompleted = doors.filter(cd => cd.roomId === 'A').every(cd => unlocked.has(cd.id))
  const isRoomBCompleted = doors.filter(cd => cd.roomId === 'B').every(cd => unlocked.has(cd.id))

  const collectedStudents = doors
    .filter(cd => unlocked.has(cd.id))
    .flatMap(cd => {
      const info = currentClassStudents[cd.id]
      return info ? info.students.map(s => ({ classId: cd.id, name: s.name, time: s.time })) : []
    })

  const scrollRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: 'smooth'
      })
    }
  }, [unlocked, collectedStudents.length])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Main Game Viewport Container */}
      <div
        ref={containerRef}
        style={{ flex: 1, width: '100%', minHeight: 0, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 0, overflow: 'hidden', background: '#04070a', border: 'none' }}
      >

        {/* Floating Top Game HUD Overlay inside Viewport (Shortcut Teleport - Commented out for player) */}
        {/*
        <div style={{
          position: 'absolute',
          top: 'clamp(6px, 1.5vh, 12px)',
          right: 'clamp(8px, 1.5vw, 14px)',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          pointerEvents: 'none'
        }}>
          <motion.button
            data-testid="btn-teleport-pak-sutrisno"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={teleportToPakSutrisno}
            title="Klik atau tekan [T] di keyboard untuk langsung teleportasi ke Pak Sutrisno dengan data terkumpul lengkap"
            style={{
              pointerEvents: 'auto',
              background: n >= TOTAL_N
                ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.95) 0%, rgba(4, 120, 87, 0.98) 100%)'
                : 'linear-gradient(135deg, rgba(217, 119, 6, 0.95) 0%, rgba(180, 83, 9, 0.98) 100%)',
              border: n >= TOTAL_N ? '1.5px solid #34D399' : '1.5px solid #FCD34D',
              borderRadius: 12,
              padding: 'clamp(4px, 0.6vw, 6px) clamp(8px, 1vw, 14px)',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: 'clamp(10px, 1vw, 12px)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(4px, 0.6vw, 8px)',
              boxShadow: n >= TOTAL_N
                ? '0 4px 16px rgba(16, 185, 129, 0.45)'
                : '0 4px 16px rgba(245, 158, 11, 0.4)',
              transition: 'all 0.2s',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '13px' }}>⚡</span>
            <span>{n >= TOTAL_N ? 'Lapor ke Pak Sutrisno' : 'Teleport ke Pak Sutrisno'}</span>
            <span style={{
              background: 'rgba(0, 0, 0, 0.3)',
              color: '#FEF08A',
              fontSize: '9px',
              padding: '1px 5px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontWeight: 900,
              letterSpacing: '0.5px',
            }}>
              [T]
            </span>
          </motion.button>
        </div>
        */}

        {/* Floating Vertical RPG Quest Button (Right Side) */}
        <motion.button
          data-testid="quest-log-trigger"
          whileHover={{ scale: 1.08, boxShadow: n >= TOTAL_N ? '0 0 25px rgba(16, 185, 129, 0.65)' : '0 0 25px rgba(0, 173, 181, 0.55)' }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsInventoryOpen(true)}
          style={{
            position: 'absolute',
            right: 'clamp(8px, 1.2vw, 14px)',
            top: '42%',
            transform: 'translateY(-50%)',
            zIndex: 45,
            background: n >= TOTAL_N 
              ? 'linear-gradient(180deg, #064E3B 0%, #022C22 100%)' 
              : 'linear-gradient(180deg, rgba(45, 26, 18, 0.95) 0%, rgba(26, 13, 8, 0.98) 100%)',
            border: n >= TOTAL_N ? '2.5px solid #10B981' : '2.5px solid #F59E0B',
            borderRadius: 16,
            padding: 'clamp(6px, 1vw, 10px) clamp(4px, 0.8vw, 8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            width: 'clamp(48px, 5.2vw, 60px)',
            cursor: 'pointer',
            boxShadow: n >= TOTAL_N ? '0 6px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(16, 185, 129, 0.35)' : '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(251, 191, 36, 0.35)',
            pointerEvents: 'auto',
            transition: 'all 0.2s',
          }}
        >
          {/* Icon Container with Floating Badge */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 'clamp(18px, 2.2vw, 24px)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}>📜</span>
            {/* Counter Mini Badge */}
            <span style={{
              position: 'absolute',
              top: -6,
              right: -12,
              background: n >= TOTAL_N ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: n >= TOTAL_N ? '#FFFFFF' : '#1F130B',
              borderRadius: 10,
              padding: '1px 5px',
              fontSize: 'clamp(8px, 0.8vw, 9px)',
              fontWeight: 900,
              fontFamily: 'var(--font-data)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              lineHeight: 1.2,
              whiteSpace: 'nowrap'
            }}>
              {n >= TOTAL_N ? '⚡ 24/24' : (cinematicStage === 'sanction_received' || demoMode) ? `${n}/${TOTAL_N}` : 'Temui Pak'}
            </span>
          </div>
          {/* Vertical Label */}
          <span style={{
            fontSize: 'clamp(8px, 0.85vw, 9.5px)',
            fontWeight: 900,
            color: n >= TOTAL_N ? '#34D399' : '#FDE047',
            marginTop: 2
          }}>
            Misi
          </span>
        </motion.button>

        <div style={{ flex: 1, width: '100%', minHeight: 0, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {(() => {
            const aspect = containerDim.w / Math.max(containerDim.h, 1)
            let viewVH: number, viewVW: number, camX: number, camY: number

            if (insideRoom) {
              // Full-screen fixed camera for classroom view
              viewVW = WORLD_VW
              viewVH = WORLD_VH
              camX = 0
              camY = 0
            } else {
              // Scrolling follow-camera for hallway
              viewVH = 380
              viewVW = 380 * aspect
              if (viewVW > WORLD_VW) {
                viewVW = WORLD_VW
                viewVH = WORLD_VW / aspect
              }
              if (currentZone === 'gate' && satpamChatStage !== 'idle') {
                camX = Math.max(0, Math.min(WORLD_VW - viewVW, 770 - viewVW / 2))
                camY = 162
              } else {
                const camCenterX = currentZone === 'gate' ? Math.max(smoothCamPos.current.x, (smoothCamPos.current.x + 840) / 2) : smoothCamPos.current.x
                camX = Math.max(0, Math.min(WORLD_VW - viewVW, camCenterX - viewVW / 2))
                camY = Math.max(0, Math.min(WORLD_VH - viewVH, smoothCamPos.current.y - viewVH * 0.65))
              }
            }
            return (
              <svg viewBox={`${camX} ${camY} ${viewVW} ${viewVH}`} preserveAspectRatio={insideRoom ? "xMidYMid meet" : "none"} style={{ width: '100%', height: '100%', display: 'block', willChange: 'transform' }}>
                <defs>
                  <filter id="avatar-super-glow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComponentTransfer in="blur" result="boost">
                      <feFuncA type="linear" slope="1.5" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode in="boost" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Main Classroom / Map Background Image */}
                <image
                  href={encodeURI(
                    insideRoom 
                      ? (LEVEL1_MAPS[insideRoom.id]?.bgImage || (insideRoom as any).image || currentClassStudents[insideRoom.id]?.image || '/Assets/Building/Kelas.webp')
                      : (currentZone === 'gate' ? '/Assets/Building/Gerbang.jpg' : currentZone === 'facility' ? '/Assets/Building/Fasilitas.webp' : (LEVEL1_MAPS['hallway']?.bgImage || '/Assets/Building/Kelas.webp'))
                  )}
                  x={0}
                  y={0}
                  width={WORLD_VW}
                  height={WORLD_VH}
                  preserveAspectRatio="none"
                  opacity={showDebug ? 0.45 : 1}
                />

                {/* Atmospheric Classroom Overlay */}
                {insideRoom && (
                  <g style={{ pointerEvents: 'none' }}>
                    {/* Warm ambient tint */}
                    <rect x={0} y={0} width={WORLD_VW} height={WORLD_VH} fill="rgba(255, 200, 100, 0.04)" />

                    {/* Cinematic vignette effect */}
                    <defs>
                      <radialGradient id="classroom-vignette" cx="50%" cy="45%" r="65%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="85%" stopColor="rgba(10, 5, 2, 0.15)" />
                        <stop offset="100%" stopColor="rgba(10, 5, 2, 0.35)" />
                      </radialGradient>
                      <linearGradient id="light-ray-1" x1="0.2" y1="0" x2="0.35" y2="1">
                        <stop offset="0%" stopColor="rgba(255, 240, 200, 0.12)" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    <rect x={0} y={0} width={WORLD_VW} height={WORLD_VH} fill="url(#classroom-vignette)" />

                    {/* Subtle window light ray */}
                    <polygon
                      points="0,0 280,0 420,750 100,750"
                      fill="url(#light-ray-1)"
                      opacity={0.6}
                    />
                  </g>
                )}

                {/* Dark Vignette Tint Overlay for Hallway */}
                {!insideRoom && <rect x={0} y={0} width={WORLD_VW} height={WORLD_VH} fill="rgba(4, 7, 10, 0.15)" />}

                {/* ─── VISUAL COLLISION DEBUGGER OVERLAY (Only visible when showDebug === true) ─── */}
                {showDebug && (
                  <g style={{ pointerEvents: 'none' }}>
                    {insideRoom ? (
                      /* ── Inside Classroom Walkable Area Highlight (Green) ── */
                      <g>
                        <rect
                          x={50}
                          y={380}
                          width={WORLD_VW - 100}
                          height={WORLD_VH - 420}
                          fill="rgba(16, 185, 129, 0.35)"
                          stroke="#10b981"
                          strokeWidth={3}
                          strokeDasharray="6,6"
                        />
                        <rect
                          x={WORLD_VW / 2 - 180}
                          y={390}
                          width={360}
                          height={28}
                          rx={8}
                          fill="rgba(15, 23, 42, 0.9)"
                          stroke="#10b981"
                          strokeWidth={1.5}
                        />
                        <text
                          x={WORLD_VW / 2}
                          y={409}
                          textAnchor="middle"
                          fill="#34d399"
                          fontSize={12}
                          fontWeight="900"
                          fontFamily="sans-serif"
                        >
                          🟢 AREA BERJALAN KELAS ({insideRoom.label || insideRoom.id})
                        </text>
                      </g>
                    ) : (
                      /* ── Outdoor / Hallway Walkable Area Highlight (Green) ── */
                      <g>
                        {/* 1. Walkable Area Polygon */}
                        <polygon
                          points={[
                            ...RED_LINE_POINTS.map(p => `${p.x},${p.y}`),
                            `${RED_LINE_POINTS[RED_LINE_POINTS.length - 1].x},640`,
                            `${RED_LINE_POINTS[0].x},640`
                          ].join(' ')}
                          fill="rgba(16, 185, 129, 0.32)"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          strokeDasharray="6,6"
                        />

                        {/* 2. Red Line Wall Base Boundary */}
                        <polyline
                          points={RED_LINE_POINTS.map(p => `${p.x},${p.y}`).join(' ')}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth={3.5}
                        />

                        {/* 5. VISUAL NODE DECORATORS FOR RED_LINE_POINTS */}
                        {RED_LINE_POINTS.map((pt, idx) => (
                          <g key={`red-node-${idx}`}>
                            <circle cx={pt.x} cy={pt.y} r={7} fill="rgba(239, 68, 68, 0.4)" stroke="#ef4444" strokeWidth={1.5} />
                            <circle cx={pt.x} cy={pt.y} r={3} fill="#ffffff" />
                            <rect
                              x={pt.x - 30}
                              y={pt.y - 23}
                              width={60}
                              height={15}
                              rx={4}
                              fill="rgba(15, 23, 42, 0.92)"
                              stroke="#ef4444"
                              strokeWidth={1}
                            />
                            <text
                              x={pt.x}
                              y={pt.y - 12}
                              textAnchor="middle"
                              fill="#f87171"
                              fontSize={8.5}
                              fontWeight="900"
                              fontFamily="monospace"
                            >
                              P{idx + 1}: {pt.x},{pt.y}
                            </text>
                          </g>
                        ))}

                        {/* Zone Boundary Grid Lines */}
                        <line x1={450} y1={410} x2={450} y2={680} stroke="rgba(129, 140, 248, 0.25)" strokeWidth={1.5} strokeDasharray="6,6" />
                        <line x1={800} y1={410} x2={800} y2={680} stroke="rgba(0, 173, 181, 0.25)" strokeWidth={1.5} strokeDasharray="6,6" />
                      </g>
                    )}

                    {/* Player Feet Ground Collision Base Line */}
                    <ellipse cx={charPos.x} cy={charPos.y} rx={22} ry={6} fill="rgba(244, 63, 94, 0.4)" stroke="#f43f5e" strokeWidth={2} />
                    <line x1={charPos.x - 24} y1={charPos.y} x2={charPos.x + 24} y2={charPos.y} stroke="#f43f5e" strokeWidth={2.5} />
                    <text x={charPos.x} y={charPos.y + 18} textAnchor="middle" fill="#f43f5e" fontSize={9} fontWeight="bold">
                      ({Math.round(charPos.x)}, {Math.round(charPos.y)})
                    </text>
                  </g>
                )}

                {/* Map Hotspots: Render Teacher NPC inside room OR Class Doors in hallway */}
                {insideRoom ? (() => {
                  const info = currentClassStudents[insideRoom.id]
                  const teacherName = info?.teacher || LEVEL1_MAPS[insideRoom.id]?.teacher?.name || 'Wali Kelas'
                  const currentMap = LEVEL1_MAPS[insideRoom.id]
                  const teacherConfig = currentMap?.teacher
                  const teacherX = teacherConfig?.x ?? 617
                  const teacherY = teacherConfig?.y ?? 415
                  const hotspotW = teacherConfig?.hotspotW || 140
                  const hotspotH = teacherConfig?.hotspotH || 220
                  const isCompleted = savedClasses.has(insideRoom.id)

                  // Computer Vision & Aspect Ratio accurate character head anchoring
                  const teacherHeight = teacherConfig?.size
                    ? (teacherConfig.size * ((teacherConfig as any).aspectRatio ?? (teacherConfig.cols === 1 ? 2.0 : 1)))
                    : 160
                  const teacherHeadY = teacherConfig?.spriteUrl
                    ? (teacherConfig.cols === 1 ? teacherY - teacherHeight * 0.85 : teacherY - (teacherConfig?.size ? teacherConfig.size * 0.65 : 160))
                    : teacherY - 60
                  const bubbleY = teacherHeadY - 4

                  return (
                    <g key={`room-objects-${insideRoom.id}`}>
                      <g
                        key={`teacher-${insideRoom.id}`}
                        style={{ cursor: 'pointer' }}
                        onClick={e => {
                          e.stopPropagation()
                          handleInteractTeacher(insideRoom)
                        }}
                      >
                      {teacherConfig?.spriteUrl ? (
                        <NPCCharacter
                          key={`teacher-sprite-${insideRoom.id}`}
                          x={teacherX}
                          y={teacherY}
                          size={teacherConfig.size || 250}
                          aspectRatio={(teacherConfig as any)?.aspectRatio}
                          label=""
                          spriteUrl={teacherConfig.spriteUrl}
                          cols={teacherConfig.cols || 5}
                          rows={teacherConfig.rows || 5}
                          totalFrames={teacherConfig.totalFrames || 24}
                          pingPong={teacherConfig.pingPong ?? false}
                          speedMs={teacherConfig.speedMs || 90}
                          glowColor={isCompleted ? "#10B981" : "#F59E0B"}
                          showGlow={teacherConfig.showGlow ?? true}
                          flipX={(teacherConfig as any)?.flipX ?? false}
                          loop={false}
                          onClick={() => handleInteractTeacher(insideRoom)}
                        />
                      ) : (
                        <rect
                          x={teacherX - hotspotW / 2}
                          y={teacherY - hotspotH / 2}
                          width={hotspotW}
                          height={hotspotH}
                          fill="transparent"
                          stroke={showDebug ? '#ff0' : 'none'}
                          strokeWidth={showDebug ? 2 : 0}
                        />
                      )}

                      {/* 1. Default Hover/Interaction Prompt (when no cutscene is active) */}
                      {!teacherCutsceneStage && (
                        <g>
                          <motion.g
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: [0, -4, 0] }}
                            transition={{ y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.3 } }}
                          >
                            <rect
                              x={teacherX - 90}
                              y={bubbleY - 48}
                              width={180}
                              height={38}
                              rx={8}
                              fill="#2D1A12"
                              stroke={isCompleted ? '#10B981' : '#F59E0B'}
                              strokeWidth={2}
                              style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6))' }}
                            />
                            <polygon
                              points={`${teacherX - 7},${bubbleY - 10} ${teacherX + 7},${bubbleY - 10} ${teacherX},${bubbleY}`}
                              fill="#2D1A12"
                              stroke={isCompleted ? '#10B981' : '#F59E0B'}
                              strokeWidth={2}
                              strokeLinejoin="round"
                            />
                            <rect
                              x={teacherX - 8}
                              y={bubbleY - 12}
                              width={16}
                              height={4}
                              fill="#2D1A12"
                            />
                            <text
                              x={teacherX}
                              y={bubbleY - 34}
                              textAnchor="middle"
                              fill="#FDE047"
                              fontSize={11}
                              fontWeight="900"
                              fontFamily="var(--font-ui)"
                              style={{ letterSpacing: '0.3px' }}
                            >
                              {(teacherName.startsWith('Bu') ? '👩‍🏫 ' : '👨‍🏫 ') + teacherName}
                            </text>
                            <text
                              x={teacherX}
                              y={bubbleY - 19}
                              textAnchor="middle"
                              fill={isCompleted ? '#34D399' : '#FBBF24'}
                              fontSize={9}
                              fontWeight="800"
                              fontFamily="var(--font-ui)"
                            >
                              {insideRoom.id === 'Perpustakaan' || insideRoom.id === 'LabKomputer'
                                ? '💬 Klik / Tekan E untuk Berdiskusi'
                                : isCompleted ? '✓ Data Telah Diperoleh' : '💬 Klik / Tekan E untuk Bicara'}
                            </text>
                          </motion.g>
                        </g>
                      )}

                      {/* (Classroom dialogue speech bubbles rendered in top-level Dialogue Overlay Layer below for correct z-index) */}

                    </g>

                    {/* Perpustakaan Bookshelf Learning Station Hotspot */}
                    {insideRoom.id === 'Perpustakaan' && (
                      <g
                        key="library-bookshelf-hotspot"
                        id="hotspot-library-bookshelf"
                        style={{ cursor: 'pointer' }}
                        onClick={e => {
                          e.stopPropagation()
                          setShowLibraryBookModal(true)
                        }}
                      >
                        {/* Interactive Click Hitbox */}
                        <rect
                          x={280 - 80}
                          y={440 - 50}
                          width={160}
                          height={100}
                          fill="transparent"
                          pointerEvents="all"
                        />
                        <motion.circle
                          cx={280}
                          cy={440}
                          r={24}
                          fill="rgba(16, 185, 129, 0.2)"
                          animate={{ scale: [1, 1.4, 1], fill: ['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.45)', 'rgba(16, 185, 129, 0.2)'] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <circle cx={280} cy={440} r={14} fill="#10B981" stroke="#FFFFFF" strokeWidth={1.5} />
                        <text x={280} y={444} textAnchor="middle" fontSize={11} style={{ userSelect: 'none', pointerEvents: 'none' }}>
                          📖
                        </text>
                        <rect
                          x={280 - 75}
                          y={440 - 42}
                          width={150}
                          height={22}
                          rx={6}
                          fill="#2D1A12"
                          stroke={nearLibraryShelf ? '#059669' : '#8C6239'}
                          strokeWidth={nearLibraryShelf ? 2 : 1.5}
                          style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
                        />
                        <text
                          x={280}
                          y={440 - 27}
                          textAnchor="middle"
                          fill="#362014"
                          fontSize={9.5}
                          fontWeight="900"
                          fontFamily="var(--font-ui)"
                        >
                          {nearLibraryShelf ? '[ E ] 📖 Baca Buku Statistika' : '📖 Rak Buku Statistika'}
                        </text>
                      </g>
                    )}

                    {/* Lab Komputer Terminal Learning Station Hotspot */}
                    {insideRoom.id === 'LabKomputer' && (
                      <g
                        key="lab-terminal-hotspot"
                        id="hotspot-lab-terminal"
                        style={{ cursor: 'pointer' }}
                        onClick={e => {
                          e.stopPropagation()
                          setShowLabTerminalModal(true)
                        }}
                      >
                        {/* Interactive Click Hitbox */}
                        <rect
                          x={300 - 85}
                          y={440 - 50}
                          width={170}
                          height={100}
                          fill="transparent"
                          pointerEvents="all"
                        />
                        <motion.circle
                          cx={300}
                          cy={440}
                          r={24}
                          fill="rgba(56, 189, 248, 0.2)"
                          animate={{ scale: [1, 1.4, 1], fill: ['rgba(56, 189, 248, 0.2)', 'rgba(56, 189, 248, 0.45)', 'rgba(56, 189, 248, 0.2)'] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <circle cx={300} cy={440} r={14} fill="#0284C7" stroke="#F59E0B" strokeWidth={1.5} />
                        <text x={300} y={444} textAnchor="middle" fontSize={11} style={{ userSelect: 'none', pointerEvents: 'none' }}>
                          💻
                        </text>
                        <rect
                          x={300 - 80}
                          y={440 - 42}
                          width={160}
                          height={22}
                          rx={6}
                          fill="#2D1A12"
                          stroke={nearLabTerminal ? '#0284C7' : '#8C6239'}
                          strokeWidth={nearLabTerminal ? 2 : 1.5}
                          style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
                        />
                        <text
                          x={300}
                          y={440 - 27}
                          textAnchor="middle"
                          fill="#362014"
                          fontSize={9.5}
                          fontWeight="900"
                          fontFamily="var(--font-ui)"
                        >
                          {nearLabTerminal ? '[ E ] 💻 Buka Terminal Digital' : '💻 Terminal Literasi Digital'}
                        </text>
                      </g>
                    )}
                  </g>
                )
              })() : currentZone === 'facility' ? (
                FACILITY_DOORS.map(fac => {
                  const isNear = nearFacility?.id === fac.id
                  return (
                    <g
                      key={fac.id}
                      id={`facility-door-${fac.id}`}
                      style={{ cursor: 'pointer' }}
                      onClick={e => {
                        e.stopPropagation()
                        if (fac.roomId) {
                          enterFacilityRoom(fac)
                        } else {
                          setActiveFacility(fac)
                          gameAudio.playDoorOpen()
                        }
                      }}
                    >
                        {/* Non-interactive guard post scenery */}

                        {/* Hotspot Icon Badge */}
                        <circle
                          cx={fac.x}
                          cy={fac.y}
                          r={14}
                          fill="#FFFDF7"
                          stroke={isNear ? '#8C6239' : fac.color}
                          strokeWidth={isNear ? 2.5 : 1.5}
                          style={{ filter: `drop-shadow(0 2px 6px rgba(0,0,0,0.25))` }}
                        />
                        <text
                          x={fac.x}
                          y={fac.y + 1}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={12}
                          style={{ userSelect: 'none', pointerEvents: 'none' }}
                        >
                          {fac.icon}
                        </text>

                        {/* Hotspot Title Card */}
                        <rect
                          x={fac.x - 65}
                          y={fac.y - 38}
                          width={130}
                          height={22}
                          rx={6}
                          fill="#2D1A12"
                          stroke={isNear ? '#B45309' : '#8C6239'}
                          strokeWidth={isNear ? 2 : 1.5}
                          style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
                        />
                        <text
                          x={fac.x}
                          y={fac.y - 24}
                          textAnchor="middle"
                          fill="#FEF3C7" fontSize={10}
                          fontWeight="bold"
                          fontFamily="var(--font-ui)"
                        >
                          {fac.label}
                        </text>
                      </g>
                    )
                  })
                ) : ((cinematicStage === 'sanction_received' || demoMode) ? doors.map(door => {
                  const isRG = door.id === 'RG'
                  const isDataComplete = collected.size >= TOTAL_N || savedClasses.size >= 4
                  const isKittenFound = catQuestStage === 'kitten_rescued' || catQuestStage === 'completed'
                  const isRGUnlocked = isRG && isDataComplete && isKittenFound
                  const isSaved = !isRG && savedClasses.has(door.id)
                  const open = isRG ? isRGUnlocked : unlocked.has(door.id)
                  const near = nearClass?.id === door.id
                  const isJustCompleted = justCompletedClassId === door.id

                  return (
                    <g
                      key={door.id}
                      id={`class-door-${door.id}`}
                      style={{ cursor: isSaved ? 'default' : 'pointer' }}
                      onClick={e => {
                        e.stopPropagation()
                        if (isRG) {
                          if (isRGUnlocked) {
                            enterClassroom(door)
                          } else {
                            gameAudio.playError()
                            if (!isDataComplete && !isKittenFound) {
                              setRgLockedToast(`🔒 Ruang Guru Terkunci! Kumpulkan data 4 kelas (${collected.size}/${TOTAL_N}) dan temukan anak kucing yang hilang terlebih dahulu!`)
                            } else if (!isKittenFound) {
                              setRgLockedToast(`🔒 Ruang Guru Terkunci! Kamu harus menemukan anak kucing yang hilang terlebih dahulu sebelum melapor ke Pak Sutrisno!`)
                            } else {
                              setRgLockedToast(`🔒 Ruang Guru Terkunci! Kumpulkan seluruh data dari 4 kelas terlebih dahulu (${collected.size}/${TOTAL_N}).`)
                            }
                            setTimeout(() => setRgLockedToast(null), 2500)
                          }
                          return
                        }
                        if (isSaved) return
                                                enterClassroom(door)
                      }}
                    >
                      {/* Interactive Pulse Radar Glow */}
                      {isRG ? (
                        isRGUnlocked ? (
                          <motion.circle
                            cx={door.x}
                            cy={door.y}
                            r={24}
                            fill="#10B98133"
                            animate={{ scale: [1, 1.45, 1], fill: ['#10B98133', '#10B98177', '#10B98133'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        ) : (
                          <circle cx={door.x} cy={door.y} r={14} fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth={1} />
                        )
                      ) : !isSaved && (!open || isJustCompleted) ? (
                        <motion.circle
                          cx={door.x}
                          cy={door.y}
                          r={20}
                          fill={`${door.color}22`}
                          animate={isJustCompleted
                            ? { scale: [1, 1.8, 1], fill: [`${door.color}33`, '#10B981', `${door.color}22`] }
                            : near
                              ? { scale: [1, 1.4, 1], fill: [`${door.color}33`, `${door.color}77`, `${door.color}33`] }
                              : { scale: [0.95, 1.15, 0.95] }
                          }
                          transition={{ duration: isJustCompleted ? 1.2 : 1.5, repeat: isJustCompleted ? 0 : Infinity, ease: 'easeInOut' }}
                        />
                      ) : (
                        <circle cx={door.x} cy={door.y} r={12} fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth={1} />
                      )}

                      {/* Hotspot Icon Badge */}
                      <circle
                        cx={door.x}
                        cy={door.y}
                        r={12}
                        fill={isRG ? (isRGUnlocked ? '#059669' : '#B45309') : isSaved ? '#059669' : open ? '#0284C7' : '#8C6239'}
                        stroke={near ? '#FEF3C7' : '#8C6239'}
                        strokeWidth={near ? 2 : 1.5}
                      />
                      <text
                        x={door.x}
                        y={door.y + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={10}
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                      >
                        {isRG ? (isRGUnlocked ? '🔓' : '🔒') : isSaved ? '✓' : open ? '🔓' : '📍'}
                      </text>

                      {/* Hotspot Title Card */}
                      <rect
                        x={door.x - (isRG ? 52 : 45)}
                        y={door.y - 36}
                        width={isRG ? 104 : 90}
                        height={20}
                        rx={6}
                        fill="#2D1A12"
                        stroke={near ? '#B45309' : isRG ? (isRGUnlocked ? '#059669' : '#B45309') : isSaved ? '#059669' : '#8C6239'}
                        strokeWidth={near ? 2 : 1.5}
                        style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
                      />
                      <text
                        x={door.x}
                        y={door.y - 23}
                        textAnchor="middle"
                        fill={isRG ? (isRGUnlocked ? '#34D399' : '#FBBF24') : isSaved ? '#34D399' : '#FEF3C7'}
                        fontSize={9.5}
                        fontWeight="bold"
                        fontFamily="var(--font-ui)"
                      >
                        {isRG ? (isRGUnlocked ? 'Ruang Guru (Buka)' : 'Ruang Guru 🔒') : isSaved ? `${door.label} (Selesai)` : door.label}
                      </text>
                    </g>
                  )
                }) : null)}

                {/* Zone Transition Gateway Marker (Rendered in outdoor courtyard in both zones) */}
                {!insideRoom && currentZone !== 'gate' && (() => {
                  const isMainLocked = currentZone === 'main' && !isTaskGiven
                  const markerColor = isMainLocked ? '#F59E0B' : currentZone === 'main' ? '#38BDF8' : '#10B981'
                  const markerBg = isMainLocked ? 'rgba(245, 158, 11, 0.12)' : currentZone === 'main' ? 'rgba(56, 189, 248, 0.16)' : 'rgba(16, 185, 129, 0.16)'
                  const markerText = isMainLocked
                    ? '🔒 AREA FASILITAS TERKUNCI (Lapor ke Pak Sutrisno Dahulu)'
                    : currentZone === 'main'
                    ? '🚶‍♂️ ▼ KE AREA FASILITAS (Kantin, Lab, Perpus)'
                    : '🚶‍♂️ ▲ KE HALAMAN UTAMA (Kelas & Ruang Guru)'
                  const boxWidth = isMainLocked ? 336 : 290
                  // Realistic interaction: marker is only a signpost until Stevunt walks near the bottom edge
                  const isNearGateway = charPos.y >= 590 && Math.abs(charPos.x - 625) < 220

                  return (
                    <g
                      key={`gateway-${currentZone}`}
                      id={`gateway-${currentZone}`}
                      data-testid="gateway-marker"
                      data-near={isNearGateway ? 'true' : 'false'}
                      style={{
                        cursor: isNearGateway ? 'pointer' : 'default',
                        pointerEvents: isNearGateway ? 'auto' : 'none',
                        opacity: isNearGateway ? 1 : 0.7,
                        transition: 'opacity 0.25s ease',
                      }}
                      onClick={isNearGateway ? (currentZone === 'main' ? goToFacilityZone : goToMainZone) : undefined}
                    >
                      {/* Ground pulsing elliptical carpet */}
                      <motion.ellipse
                        cx={625}
                        cy={628}
                        rx={isMainLocked ? 140 : 125}
                        ry={16}
                        fill={markerBg}
                        stroke={markerColor}
                        strokeWidth={1.5}
                        strokeDasharray={isMainLocked ? "4,4" : "6,4"}
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <rect
                        x={625 - boxWidth / 2}
                        y={608}
                        width={boxWidth}
                        height={26}
                        rx={13}
                        fill="#2D1A12"
                        stroke={isMainLocked ? '#F59E0B' : '#F59E0B'}
                        strokeWidth={1.5}
                        style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.3))' }}
                      />
                      <text
                        x={625}
                        y={624}
                        textAnchor="middle"
                        fill={isMainLocked ? '#FBBF24' : '#FEF3C7'}
                        fontSize={9.6}
                        fontWeight="900"
                        fontFamily="var(--font-ui)"
                        style={{ userSelect: 'none', pointerEvents: 'none', letterSpacing: '0.4px' }}
                      >
                        {markerText}
                      </text>
                    </g>
                  )
                })()}

                {/* Gate Entry Gateway Marker & Pos Satpam Hotspot (When in Gate Zone) */}
                {!insideRoom && currentZone === 'gate' && (
                  <>
                    <g
                      key="gateway-gate"
                      style={{ cursor: 'pointer' }}
                      onClick={attemptEnterSchoolFromGate}
                    >
                      {/* Subtle ground guide ellipse on the open driveway */}
                      <motion.ellipse
                        cx={617}
                        cy={410}
                        rx={75}
                        ry={12}
                        fill="rgba(16, 185, 129, 0.12)"
                        stroke="#10B981"
                        strokeWidth={1.2}
                        strokeDasharray="4,4"
                        animate={{ opacity: [0.35, 0.75, 0.35] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </g>

                    {/* Pak Joko (Satpam Sekolah) Standing NPC - Animated Sprite Sheet (23 frames, non-glitch) */}
                    <NPCCharacter
                      key="pak-joko-npc"
                      x={930}
                      y={475}
                      size={170}
                      anchorRatioY={0.914}
                      label=""
                      spriteUrl="/Assets/Character/Joko-iso_idle_southwest-trimmed.png"
                      cols={5}
                      rows={5}
                      totalFrames={23}
                      pingPong={true}
                      speedMs={90}
                      showGlow={true}
                      glowColor="#38BDF8"
                      onClick={() => {
                        if (satpamChatStage === 'idle') {
                          attemptEnterSchoolFromGate()
                        }
                      }}
                    />
                  </>
                )}

                {/* Dynamic Perspective Depth Scaling Calculation */}
                {(() => {
                  const depthRatio = Math.max(0, Math.min(1, (charPos.y - 410) / (650 - 410)))
                  // Proportional character size: when inside rooms, student Stevunt scales ~310px-430px (visual height ~195px-270px) matching classroom perspective
                  const baseCharSize = insideRoom ? (310 + depthRatio * 120) : 145 + depthRatio * 65
                  const charSize = baseCharSize
                  const btnY = charPos.y - (insideRoom ? charSize * 0.72 : charSize * 0.95)
                  const btnTextY = btnY + 14

                  return (
                    <>
                      {/* Pak Sutrisno NPC (Only in Hallway / Lapangan BEFORE sanction_received AND in main zone) */}
                      {!insideRoom && currentZone === 'main' && cinematicStage !== 'sanction_received' && (() => {
                        const pakX = PAK_SUTRISNO_POS.x
                        const pakY = PAK_SUTRISNO_POS.y
                        const pakDepth = Math.max(0, Math.min(1, (pakY - 410) / (650 - 410)))
                        const pakSize = 145 + pakDepth * 65
                        const distToPak = Math.hypot(charPos.x - pakX, charPos.y - pakY)
                        const isNearPak = distToPak < 135

                        const handleTalkToPak = (e?: React.MouseEvent) => {
                          if (e) e.stopPropagation()
                          if (cinematicStage === 'player_intro') {
                            setCinematicStage('panning_to_pak')
                          } else if (cinematicStage === 'pak_shouting') {
                            setCinematicStage('pak_shouting_2')
                          } else if (cinematicStage === 'pak_shouting_2') {
                            setCinematicStage('panning_to_player')
                          } else if (cinematicStage === 'quest_meet_pak' || cinematicStage === 'pak_sanction_1') {
                            setCinematicStage('pak_sanction_2')
                          } else if (cinematicStage === 'pak_sanction_2') {
                            setCinematicStage('pak_sanction_3')
                          } else if (cinematicStage === 'pak_sanction_3') {
                            setCinematicStage('player_reply_pak')
                          } else if (cinematicStage === 'player_reply_pak') {
                            setCinematicStage('sanction_received')
                            gameAudio.playUnlockJingle()
                            setRoomMilestoneText('TUGAS DITERIMA! 📋 AREA FASILITAS & KELAS TERBUKA!')
                            setTimeout(() => setRoomMilestoneText(null), 3000)
                          }
                        }

                        const renderPak = (
                          <NPCCharacter
                            key="pak-sutrisno-npc"
                            x={pakX}
                            y={pakY}
                            size={pakSize}
                            label=""
                            spriteUrl="/Assets/Character/pak Sutrisno-iso_idle_right-trimmed.png"
                            cols={5}
                            rows={4}
                            flipX={true}
                            glowColor="#38BDF8"
                            onClick={handleTalkToPak}
                          />
                        )

                        const isSpeechActive = ['pak_shouting', 'pak_shouting_2', 'pak_sanction_1', 'pak_sanction_2', 'pak_sanction_3', 'player_reply_pak'].includes(cinematicStage)
                        const isSanctionStage = ['pak_sanction_1', 'pak_sanction_2', 'pak_sanction_3'].includes(cinematicStage)

                        {/* Speech bubble for Pak Sutrisno */}
                        const renderShoutBubble = isSpeechActive && cinematicStage !== 'player_reply_pak' && (() => {
                          const isSanctionStage = ['pak_sanction_1', 'pak_sanction_2', 'pak_sanction_3'].includes(cinematicStage)
                          const bubbleW = isSanctionStage ? 390 : 260
                          const bubbleH = isSanctionStage ? 88 : 58
                          const pakHeadTop = pakY - pakSize * 0.78
                          const bBottomY = pakHeadTop - 12
                          const bubbleLeft = Math.max(camX + 12, Math.min(camX + VIEW_VW - bubbleW - 24, pakX - bubbleW / 2))
                          const bubbleTop = Math.max(camY + 8, bBottomY - bubbleH)
                          const tailTipY = pakHeadTop + 2

                          const bubblePath = getSpeechBubblePath(bubbleLeft, bubbleTop, bubbleW, bubbleH, 14, pakX, tailTipY, 22)

                          return (
                            <g
                              key="pak-shout-bubble"
                              style={{ cursor: 'pointer' }}
                              onClick={handleTalkToPak}
                            >
                              {/* 1. Seamless Comic Vector Balloon (Body + Pointer Tail) */}
                              <path
                                d={bubblePath}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                style={{ filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.75))' }}
                              />

                              {/* 2. Text Content inside ForeignObject */}
                              <foreignObject x={bubbleLeft} y={bubbleTop} width={bubbleW} height={bubbleH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  boxSizing: 'border-box',
                                  padding: '8px 14px 6px 14px',
                                  background: 'transparent',
                                  border: 'none',
                                  boxShadow: 'none',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  userSelect: 'none',
                                }}>
                                  <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#FDE047', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                    Pak Sutrisno
                                  </div>
                                  <div style={{
                                    fontSize: '10.2px',
                                    fontWeight: 800,
                                    color: '#FEF3C7',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.34,
                                    margin: '2px 0',
                                  }}>
                                    {cinematicStage === 'pak_shouting' && '"Hey kamu! Baru jam segini sampai sekolah?!"'}
                                    {cinematicStage === 'pak_shouting_2' && '"Kamu kesini!"'}
                                    {cinematicStage === 'pak_sanction_1' && (
                                      <>
                                        "Kamu terlambat lagi! Bel sekolah sudah lama berbunyi,"
                                        <br />
                                        "dan kamu baru nongol di lapangan sekarang!"
                                        <br />
                                        <span style={{ color: '#FDE68A' }}>"Pasti semalam keasyikan mantengin layar HP sampai lupa waktu, kan?!"</span>
                                      </>
                                    )}
                                    {cinematicStage === 'pak_sanction_2' && (
                                      <>
                                        "Tapi pas sekali! Pak Guru sedang memimpin <span style={{ color: '#38BDF8', fontWeight: 900 }}>proyek riset penelitian</span>"
                                        <br />
                                        "tentang <span style={{ color: '#F59E0B', fontWeight: 900 }}>durasi screen time siswa SMP</span> untuk menguji isu viral di media!"
                                      </>
                                    )}
                                    {cinematicStage === 'pak_sanction_3' && (
                                      <>
                                        "Sebagai sanksinya, kamu jadi <span style={{ color: '#34D399', fontWeight: 900 }}>asisten peneliti dadakan</span>!"
                                        <br />
                                        "Kumpulkan <span style={{ color: '#38BDF8', fontWeight: 900 }}>24 sampel data</span> dari Wali Kelas VII-A, VII-B, VIII-A, &amp; VIII-B,"
                                        <br />
                                        "lalu bawa ke <span style={{ color: '#F59E0B', fontWeight: 900 }}>Ruang Guru</span> untuk kita analisis bersama!"
                                      </>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9.5px', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                      [ Klik / Tap ▶ ]
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                            </g>
                          )
                        })()

                        {/* Player Opening Monologue Speech Bubble */}
                        const renderPlayerIntroBubble = cinematicStage === 'player_intro' && (() => {
                          const pW = 250
                          const pH = 64
                          const playerHeadTop = charPos.y - charSize * 0.78
                          const pBottomY = playerHeadTop - 12
                          const pY = Math.max(camY + 8, pBottomY - pH)
                          const pLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - pW - 10, charPos.x - pW / 2))
                          const playerBubblePath = getSpeechBubblePath(pLeft, pY, pW, pH, 14, charPos.x, playerHeadTop + 2, 20)

                          return (
                            <g
                              key="player-intro-bubble"
                              style={{ cursor: 'pointer' }}
                              onClick={handleTalkToPak}
                            >
                              <path
                                d={playerBubblePath}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                style={{ filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.75))' }}
                              />
                              <foreignObject x={pLeft} y={pY} width={pW} height={pH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  boxSizing: 'border-box',
                                  padding: '8px 12px 6px 12px',
                                  background: 'transparent',
                                  border: 'none',
                                  boxShadow: 'none',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  userSelect: 'none',
                                }}>
                                  <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#FDE047', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                    {playerName.toUpperCase()}
                                  </div>
                                  <div style={{
                                    fontSize: '10.5px',
                                    fontWeight: 800,
                                    color: '#FEF3C7',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                  }}>
                                    "Duh... aku terlambat lagi ke sekolah!"
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                      [ Klik / Tap ▶ ]
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                            </g>
                          )
                        })()

                        {/* Player Reply Speech Bubble */}
                        const renderPlayerReplyBubble = cinematicStage === 'player_reply_pak' && (() => {
                          const pW = 320
                          const pH = 74
                          const playerHeadTop = charPos.y - charSize * 0.78
                          const pBottomY = playerHeadTop - 12
                          const pY = Math.max(camY + 8, pBottomY - pH)
                          const pLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - pW - 10, charPos.x - pW / 2))
                          const playerBubblePath = getSpeechBubblePath(pLeft, pY, pW, pH, 14, charPos.x, playerHeadTop + 2, 20)

                          return (
                            <g
                              key="player-reply-bubble"
                              style={{ cursor: 'pointer' }}
                              onClick={handleTalkToPak}
                            >
                              <path
                                d={playerBubblePath}
                                fill="#2D1A12"
                                stroke="#10B981"
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                style={{ filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.75))' }}
                              />
                              <foreignObject x={pLeft} y={pY} width={pW} height={pH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  boxSizing: 'border-box',
                                  padding: '8px 12px 6px 12px',
                                  background: 'transparent',
                                  border: 'none',
                                  boxShadow: 'none',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  userSelect: 'none',
                                }}>
                                  <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#34D399', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                                    Kamu
                                  </div>
                                  <div style={{
                                    fontSize: '10.5px',
                                    fontWeight: 800,
                                    color: '#FEF3C7',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                  }}>
                                    "Siap Pak Sutrisno! Demi proyek riset ini, saya keliling kumpulkan 24 data sekarang juga!"
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#34D399', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                      [ 📝 Mulai Investigasi ▶ ]
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                            </g>
                          )
                        })()

                        {/* Glowing Waypoint Arrow towards Pak Sutrisno during intro quest */}
                        const renderWaypointArrow = (cinematicStage === 'quest_meet_pak' && !isNearPak) && (
                          <g key="waypoint-arrow" style={{ pointerEvents: 'none' }}>
                            <circle cx={pakX} cy={pakY - 120} r={16} fill="rgba(56, 189, 248, 0.2)" stroke="#38BDF8" strokeWidth={2} />
                            <text x={pakX} y={pakY - 115} textAnchor="middle" fill="#38BDF8" fontSize={18} fontWeight="900">
                              ↓
                            </text>
                          </g>
                        )

                        const buttonW = 200
                        const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                        const textX = buttonLeft + buttonW / 2

                        const renderPrompt = isNearPak && !isSpeechActive && (
                          <motion.g
                            key="btn-talk-pak-sutrisno"
                            initial={{ opacity: 0, scale: 0.8, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 5 }}
                            onClick={handleTalkToPak}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ cursor: 'pointer' }}
                          >
                            <rect
                                x={buttonLeft}
                                y={btnY}
                                width={buttonW}
                                height={26}
                                rx={13}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#FEF3C7"
                              fontSize={10}
                              fontWeight="bold"
                              fontFamily="var(--font-ui)"
                            >
                              💬 Bicara dengan Pak Sutrisno
                            </text>
                          </motion.g>
                        )

                        return (
                          <g key="pak-sutrisno-group">
                            {renderPak}
                            {renderShoutBubble}
                            {renderPlayerIntroBubble}
                            {renderPlayerReplyBubble}
                            {renderWaypointArrow}
                            {renderPrompt}
                          </g>
                        )
                      })()}

                      {/* Glowing Waypoint Arrow pointing to Ruang Guru when all 24 data points collected */}
                      {(collected.size >= TOTAL_N || savedClasses.size >= 4) && !insideRoom && currentZone === 'main' && (
                        <g key="waypoint-arrow-rg" style={{ pointerEvents: 'none' }}>
                          <motion.circle
                            cx={625}
                            cy={280}
                            r={16}
                            fill="rgba(16, 185, 129, 0.25)"
                            stroke="#10B981"
                            strokeWidth={2}
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                          />
                          <motion.text
                            x={625}
                            y={285}
                            textAnchor="middle"
                            fill="#059669"
                            fontSize={18}
                            fontWeight="900"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            ↓
                          </motion.text>
                          <rect
                            x={625 - 75}
                            y={240}
                            width={150}
                            height={22}
                            rx={6}
                            fill="#2D1A12"
                            stroke="#059669"
                            strokeWidth={2}
                            style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
                          />
                          <text
                            x={625}
                            y={254}
                            textAnchor="middle"
                            fill="#059669"
                            fontSize={9.5}
                            fontWeight="900"
                            fontFamily="var(--font-ui)"
                          >
                            ✨ Temui Pak Sutrisno di Ruang Guru!
                          </text>
                        </g>
                      )}

                      {/* ── Player Character & Cat Quest Depth-Sorted Rendering ── */}
                      {(() => {
                        const renderMotherCat = !insideRoom && currentZone === 'main' && catQuestStage !== 'untriggered' ? (
                          <g
                            key="mother-cat-group"
                            id="mother-cat-group"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              if (catQuestStage === 'completed') {
                                gameAudio.playCatPurr()
                              } else {
                                gameAudio.playCatMeow()
                              }
                              setShowMotherCatModal(true)
                            }}
                          >
                            <NPCCharacter
                              key="mother-cat-npc"
                              x={motherCatPos.x}
                              y={motherCatPos.y}
                              size={52}
                              label=""
                              spriteUrl="/Assets/CatPack/Idle.png"
                              cols={10}
                              rows={1}
                              totalFrames={10}
                              speedMs={140}
                              pingPong={true}
                              glowColor={catQuestStage === 'completed' ? '#10B981' : '#F59E0B'}
                              onClick={() => {
                                gameAudio.playCatMeow()
                                setShowMotherCatModal(true)
                              }}
                            />
                            {/* If quest completed, Kitten Mochi is reunited happily beside Mimi */}
                            {catQuestStage === 'completed' && (
                              <NPCCharacter
                                key="reunited-kitten-npc"
                                x={motherCatPos.x + 36}
                                y={motherCatPos.y + 4}
                                size={46}
                                label=""
                                spriteUrl="/Assets/CatPack/Box3.png"
                                cols={4}
                                rows={1}
                                totalFrames={4}
                                speedMs={180}
                                pingPong={true}
                                glowColor="#10B981"
                                onClick={() => {
                                  gameAudio.playCatPurr()
                                  setShowMotherCatModal(true)
                                }}
                              />
                            )}
                            {/* Name Tag */}
                            <g
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                gameAudio.playCatMeow()
                                setShowMotherCatModal(true)
                              }}
                            >
                              <rect
                                x={motherCatPos.x - 45}
                                y={motherCatPos.y - 48}
                                width={90}
                                height={20}
                                rx={10}
                                fill="#2D1A12"
                                stroke={catQuestStage === 'completed' ? '#10B981' : '#F59E0B'}
                                strokeWidth={1.5}
                                style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
                              />
                              <text
                                x={motherCatPos.x}
                                y={motherCatPos.y - 34}
                                textAnchor="middle"
                                fill={catQuestStage === 'completed' ? '#34D399' : '#FEF3C7'}
                                fontSize={9.5}
                                fontWeight="900"
                                fontFamily="var(--font-ui)"
                              >
                                {catQuestStage === 'completed' ? '🐾 Mimi & Mochi' : '🐱 Mimi'}
                              </text>

                              {/* Bouncing Quest Indicator */}
                              {catQuestStage === 'cat_spawned' && (
                                <g style={{ pointerEvents: 'none' }}>
                                  <circle cx={motherCatPos.x} cy={motherCatPos.y - 62} r={9} fill="#F59E0B" stroke="#FFFFFF" strokeWidth={1.5} />
                                  <text x={motherCatPos.x} y={motherCatPos.y - 58.5} textAnchor="middle" fill="#091322" fontSize={11} fontWeight="900" fontFamily="var(--font-ui)">!</text>
                                </g>
                              )}
                              {catQuestStage === 'kitten_rescued' && (
                                <g style={{ pointerEvents: 'none' }}>
                                  <circle cx={motherCatPos.x} cy={motherCatPos.y - 62} r={9} fill="#10B981" stroke="#FFFFFF" strokeWidth={1.5} />
                                  <text x={motherCatPos.x} y={motherCatPos.y - 59} textAnchor="middle" fill="#FFFFFF" fontSize={9} fontWeight="900">❤️</text>
                                </g>
                              )}
                            </g>
                          </g>
                        ) : null

                        const isKittenVisible =
                          catQuestStage === 'quest_active' && (
                            (kittenLocation.zone === 'Perpustakaan' && insideRoom?.id === 'Perpustakaan') ||
                            (kittenLocation.zone === 'LabKomputer' && insideRoom?.id === 'LabKomputer') ||
                            (kittenLocation.zone === 'facility_courtyard' && currentZone === 'facility' && !insideRoom) ||
                            (kittenLocation.zone === 'hallway' && currentZone === 'main' && !insideRoom)
                          )

                        const renderKittenBox = isKittenVisible ? (
                          <g
                            key="kitten-in-box-group"
                            id="kitten-in-box-group"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              gameAudio.playCatMeow()
                              setShowKittenRescueModal(true)
                            }}
                          >
                            <NPCCharacter
                              key="kitten-box-npc"
                              x={kittenLocation.x}
                              y={kittenLocation.y}
                              size={60}
                              label=""
                              spriteUrl="/Assets/CatPack/Box3.png"
                              cols={4}
                              rows={1}
                              totalFrames={4}
                              speedMs={180}
                              pingPong={true}
                              glowColor="#10B981"
                              onClick={() => {
                                gameAudio.playCatMeow()
                                setShowKittenRescueModal(true)
                              }}
                            />
                            {/* Animated Rescue Indicator */}
                            <motion.g
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                gameAudio.playCatMeow()
                                setShowKittenRescueModal(true)
                              }}
                            >
                              <rect
                                x={kittenLocation.x - 60}
                                y={kittenLocation.y - 54}
                                width={120}
                                height={22}
                                rx={11}
                                fill="#2D1A12"
                                stroke="#059669"
                                strokeWidth={1.5}
                                style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
                              />
                              <text
                                x={kittenLocation.x}
                                y={kittenLocation.y - 39}
                                textAnchor="middle"
                                fill="#059669"
                                fontSize={9.5}
                                fontWeight="900"
                                fontFamily="var(--font-ui)"
                              >
                                📦 Mochi (Kucing dlm Kardus)
                              </text>
                            </motion.g>
                          </g>
                        ) : null

                        return (
                          <>
                            {motherCatPos.y < charPos.y && renderMotherCat}
                            {kittenLocation.y < charPos.y && renderKittenBox}
                            <PlayerCharacter
                              x={charPos.x}
                              y={charPos.y}
                              dir={moveDir}
                              size={charSize}
                              facing={insideRoom && ['A1', 'A2', 'B1', 'B2'].includes(insideRoom.id) ? 'left' : (insideRoom?.id === 'RG' ? 'right' : undefined)}
                            />
                            {motherCatPos.y >= charPos.y && renderMotherCat}
                            {kittenLocation.y >= charPos.y && renderKittenBox}
                          </>
                        )
                      })()}

                      {/* Floating Interactive Prompt Buttons */}
                      <AnimatePresence>
                        {/* 0A. Gate Player Monologue Speech Bubble */}
                        {currentZone === 'gate' && cinematicStage === 'gate_intro' && gateBubbleStep < 2 && satpamChatStage === 'idle' && (() => {
                          const pW = 270
                          const pH = 68
                          const playerHeadTop = charPos.y - charSize * 0.78
                          const pBottomY = playerHeadTop - 12
                          const pY = Math.max(camY + 8, pBottomY - pH)
                          const pLeft = Math.max(camX + 10, Math.min(camX + viewVW - pW - 10, charPos.x - pW / 2))
                          const bubblePath = getSpeechBubblePath(pLeft, pY, pW, pH, 14, charPos.x, playerHeadTop + 2, 20)
                          const bubbleText = gateBubbleStep === 0
                            ? '"Waduh, gawat! Bel sekolah udah bunyi dari tadi, aku telat nih!"'
                            : '"Harus cepat lari masuk sebelum gerbang dikunci!"'

                          return (
                            <motion.g
                              key={`gate-intro-bubble-${gateBubbleStep}`}
                              id="gate-intro-bubble"
                              initial={{ opacity: 0, scale: 0.9, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 5 }}
                              style={{ cursor: 'pointer' }}
                              onClick={() => setGateBubbleStep(p => p + 1)}
                            >
                              <path
                                d={bubblePath}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                style={{ filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.75))' }}
                              />
                              <foreignObject x={pLeft} y={pY} width={pW} height={pH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  boxSizing: 'border-box',
                                  padding: '8px 12px 6px 12px',
                                  background: 'transparent',
                                  border: 'none',
                                  boxShadow: 'none',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  userSelect: 'none',
                                }}>
                                  <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#FDE047', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                    {playerName.toUpperCase()}
                                  </div>
                                  <div style={{
                                    fontSize: '10.5px',
                                    fontWeight: 800,
                                    color: '#FEF3C7',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                  }}>
                                    {bubbleText}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                      {gateBubbleStep === 0 ? '[ Klik / Spasi ▶ ]' : '[ 🏃 Ayo Masuk! ▶ ]'}
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                            </motion.g>
                          )
                        })()}

                        {/* 0A-2. Pak Joko (Satpam) Multi-Step Cloud Chat Bubbles (Like Pak Sutrisno) */}
                        {currentZone === 'gate' && !insideRoom && (
                          satpamChatStage === 'pak_stop_1' ||
                          satpamChatStage === 'pak_stop_2' ||
                          satpamChatStage === 'pak_wrong' ||
                          satpamChatStage === 'pak_pass_1' ||
                          satpamChatStage === 'pak_pass_2'
                        ) && (() => {
                          const jokoX = 930
                          const jokoHeadTop = 328
                          const bW = 345
                          const bH = 88
                          const bLeft = Math.max(camX + 10, Math.min(camX + viewVW - bW - 20, jokoX - bW * 0.58))
                          const bBottomY = jokoHeadTop - 12
                          const bTop = Math.max(camY + 8, bBottomY - bH)
                          const tailTipY = jokoHeadTop + 6
                          const bubblePath = getSpeechBubblePath(bLeft, bTop, bW, bH, 14, jokoX, tailTipY, 22)

                          const borderColor =
                            satpamChatStage === 'pak_wrong'
                              ? '#DC2626'
                              : satpamChatStage === 'pak_pass_1' || satpamChatStage === 'pak_pass_2'
                            ? '#10B981'
                            : '#F59E0B'

                          return (
                            <motion.g
                              key={`satpam-cloud-${satpamChatStage}-${satpamWrongCount}`}
                              id={`satpam-cloud-${satpamChatStage}`}
                              initial={{ opacity: 0, scale: 0.92, y: 6 }}
                              animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                x: satpamChatStage === 'pak_wrong' ? [0, -8, 8, -5, 5, 0] : 0
                              }}
                              exit={{ opacity: 0, scale: 0.92, y: 6 }}
                              transition={{ duration: 0.28 }}
                              style={{ cursor: 'pointer' }}
                              onClick={advanceSatpamChat}
                            >
                              <path
                                d={bubblePath}
                                fill="#2D1A12"
                                stroke={borderColor}
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                style={{ filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.75))' }}
                              />
                              <foreignObject x={bLeft} y={bTop} width={bW} height={bH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                <div
                                  data-testid="satpam-cloud-bubble"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    boxSizing: 'border-box',
                                    padding: '8px 14px 6px 14px',
                                    background: 'transparent',
                                    border: 'none',
                                    boxShadow: 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    userSelect: 'none',
                                  }}
                                >
                                  <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#FDE047', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                    👮 Pak Joko (Satpam)
                                  </div>
                                  <div style={{
                                    fontSize: '10.2px',
                                    fontWeight: 800,
                                    color: '#FEF3C7',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                    margin: '2px 0',
                                  }}>
                                    {satpamChatStage === 'pak_stop_1' && (
                                      <>
                                        "PRIIIT! 📢 Eits, berhenti dulu le! Mau nyelonong masuk aja kamu?!"
                                        <br />
                                        <span style={{ color: '#FDE68A' }}>"Jam segini baru nongol di gerbang, dari mana aja?!"</span>
                                      </>
                                    )}
                                    {satpamChatStage === 'pak_stop_2' && (
                                      <>
                                        {satpamQuiz.pakGreeting}
                                        <br />
                                        <span style={{ color: '#7DD3FC' }}>"Buktikan dulu otakmu sudah bangun! Jawab hitungan waktu ini!"</span>
                                      </>
                                    )}
                                    {satpamChatStage === 'pak_wrong' && (
                                      <>
                                        <span style={{ color: '#F87171', fontWeight: 900 }}>❌ "{satpamTeaseText}"</span>
                                      </>
                                    )}
                                    {satpamChatStage === 'pak_pass_1' && (
                                      <>
                                        <span style={{ color: '#34D399', fontWeight: 900 }}>🎉 "Hahaha, mantap betul! ({satpamQuiz.explanation})"</span>
                                        <br />
                                        "Otakmu ternyata masih encer walau bangun kesiangan!"
                                      </>
                                    )}
                                    {satpamChatStage === 'pak_pass_2' && (
                                      <>
                                        "Ya sudah, gerbang Pak Joko buka! Sana lekas lari ke lapangan,"
                                        <br />
                                        "itu <span style={{ color: '#F87171', fontWeight: 900 }}>Pak Sutrisno</span> sudah berdiri memantau di depan kelas!"
                                      </>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                      {satpamChatStage === 'pak_wrong'
                                        ? '[ 🔄 Coba Soal Baru ▶ ]'
                                        : satpamChatStage === 'pak_stop_2'
                                        ? '[ ⏱️ Lihat Soal ▶ ]'
                                        : '[ Klik / Tap ▶ ]'}
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                            </motion.g>
                          )
                        })()}

                        {/* 0A-3. Pak Joko Interactive Time-Math Quiz Cloud Chat Bubble */}
                        {currentZone === 'gate' && !insideRoom && satpamChatStage === 'pak_quiz' && (() => {
                          const jokoX = 930
                          const jokoHeadTop = 328
                          const bW = 390
                          const bH = 152
                          const bLeft = Math.max(camX + 10, Math.min(camX + viewVW - bW - 20, jokoX - bW * 0.62))
                          const bBottomY = jokoHeadTop - 12
                          const bTop = Math.max(camY + 8, bBottomY - bH)
                          const tailTipY = jokoHeadTop + 6
                          const bubblePath = getSpeechBubblePath(bLeft, bTop, bW, bH, 14, jokoX, tailTipY, 22)
                          const optionLabels = ['A', 'B', 'C', 'D']

                          return (
                            <motion.g
                              key={`satpam-quiz-cloud-${satpamQuiz.templateIdx}-${satpamWrongCount}`}
                              id="satpam-quiz-cloud"
                              initial={{ opacity: 0, scale: 0.92, y: 6 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.92, y: 6 }}
                              transition={{ duration: 0.25 }}
                            >
                              <path
                                d={bubblePath}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                style={{ filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.75))' }}
                              />
                              <foreignObject x={bLeft} y={bTop} width={bW} height={bH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                <div
                                  data-testid="satpam-quiz-bubble"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    boxSizing: 'border-box',
                                    padding: '8px 12px 8px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    boxShadow: 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    userSelect: 'none',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '9.5px', fontWeight: 900, color: '#FDE047', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                      👮 Pak Joko — Teka-Teki Waktu {satpamWrongCount > 0 ? `(Percobaan #${satpamWrongCount + 1})` : ''}
                                    </span>
                                    <span style={{ fontSize: '8.5px', fontWeight: 800, color: '#FDE68A', fontFamily: 'var(--font-ui)' }}>
                                      Pilih A/B/C/D
                                    </span>
                                  </div>

                                  <div
                                    data-testid="satpam-quiz-question"
                                    style={{
                                      fontSize: '9.8px',
                                      fontWeight: 800,
                                      color: '#FEF3C7',
                                      fontFamily: 'var(--font-ui)',
                                      lineHeight: 1.32,
                                      margin: '3px 0',
                                    }}
                                  >
                                    {satpamQuiz.questionText}
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', pointerEvents: 'auto' }}>
                                    {satpamQuiz.options.map((opt, idx) => (
                                      <button
                                        key={`cloud-opt-${idx}`}
                                        data-testid={`satpam-opt-${idx}`}
                                        onClick={e => handleSelectSatpamOption(idx, e)}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          padding: '4px 8px',
                                          borderRadius: '8px',
                                          background: 'rgba(255, 255, 255, 0.08)',
                                          border: '1.5px solid #F59E0B',
                                          color: '#FEF3C7',
                                          fontSize: '9.5px',
                                          fontWeight: 800,
                                          fontFamily: 'var(--font-ui)',
                                          cursor: 'pointer',
                                          textAlign: 'left',
                                          boxShadow: '0 1px 3px rgba(140, 98, 57, 0.1)',
                                        }}
                                      >
                                        <span style={{
                                          width: '16px',
                                          height: '16px',
                                          borderRadius: '4px',
                                          background: '#F59E0B',
                                          border: '1px solid #FDE047',
                                          color: '#1F130B',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '8.5px',
                                          fontWeight: 900,
                                          flexShrink: 0,
                                        }}>
                                          {optionLabels[idx]}
                                        </span>
                                        <span data-testid={`satpam-opt-text-${idx}`}>{opt}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </foreignObject>
                            </motion.g>
                          )
                        })()}

                        {/* 0A-4. Stevunt Reply Cloud Chat Bubbles to Pak Joko */}
                        {currentZone === 'gate' && !insideRoom && (
                          satpamChatStage === 'player_excuse_1' ||
                          satpamChatStage === 'player_thanks'
                        ) && (() => {
                          const pW = 300
                          const pH = 78
                          const playerHeadTop = charPos.y - charSize * 0.78
                          const pBottomY = playerHeadTop - 12
                          const pY = Math.max(camY + 8, pBottomY - pH)
                          const pLeft = Math.max(camX + 10, Math.min(camX + viewVW - pW - 10, charPos.x - pW / 2))
                          const borderColor = satpamChatStage === 'player_thanks' ? '#10B981' : '#F59E0B'
                          const bubblePath = getSpeechBubblePath(pLeft, pY, pW, pH, 14, charPos.x, playerHeadTop + 2, 20)

                          return (
                            <motion.g
                              key={`player-satpam-cloud-${satpamChatStage}`}
                              id={`player-satpam-cloud-${satpamChatStage}`}
                              initial={{ opacity: 0, scale: 0.92, y: 6 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.92, y: 6 }}
                              transition={{ duration: 0.25 }}
                              style={{ cursor: 'pointer' }}
                              onClick={advanceSatpamChat}
                            >
                              <path
                                d={bubblePath}
                                fill="#2D1A12"
                                stroke={borderColor}
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                style={{ filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.75))' }}
                              />
                              <foreignObject x={pLeft} y={pY} width={pW} height={pH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                <div
                                  data-testid="player-satpam-cloud-bubble"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    boxSizing: 'border-box',
                                    padding: '8px 12px 6px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    boxShadow: 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    userSelect: 'none',
                                  }}
                                >
                                  <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#FDE047', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                    {playerName.toUpperCase()}
                                  </div>
                                  <div style={{
                                    fontSize: '10.2px',
                                    fontWeight: 800,
                                    color: '#FEF3C7',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                  }}>
                                    {satpamChatStage === 'player_excuse_1'
                                      ? '"Eh, pagi Pak Joko! Ampun Pak, tadi alarm HP saya gak bunyi... Jangan dikunci dulu Pak gerbangnya!"'
                                      : '"Siap, terima kasih banyak Pak Joko! Saya lari masuk ke halaman sekarang!"'}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                      {satpamChatStage === 'player_thanks' ? '[ 🏃 Masuk Gerbang ▶ ]' : '[ Klik / Tap ▶ ]'}
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                            </motion.g>
                          )
                        })()}

                        {/* 0B. Gate Entrance Prompt Button (Shown only when approaching open school gate) */}
                        {currentZone === 'gate' && !insideRoom && satpamChatStage === 'idle' && (() => {
                          const isNearGate = charPos.y <= 490 && charPos.x >= 450 && charPos.x <= 780
                          if (!isNearGate) return null

                          const buttonW = 200
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + viewVW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2

                          return (
                            <motion.g
                              key="btn-gate-enter"
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={attemptEnterSchoolFromGate}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ cursor: 'pointer' }}
                            >
                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#FEF3C7"
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                [ E ] 🏫 Masuk Gerbang Sekolah
                              </text>
                            </motion.g>
                          )
                        })()}

                        {/* 1. Inside Room Teacher Interaction Prompt */}
                        {insideRoom && (() => {
                          if (insideRoom.id === 'Perpustakaan') {
                            if (nearLibraryShelf && !showLibraryBookModal) {
                              const buttonW = 210
                              const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                              const textX = buttonLeft + buttonW / 2
                              return (
                                <motion.g
                                  key="btn-shelf-perpustakaan"
                                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, y: 5 }}
                                  onClick={() => setShowLibraryBookModal(true)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <rect x={buttonLeft - 10} y={btnY} width={buttonW + 20} height={28} rx={6} fill="#2D1A12" stroke="#059669" strokeWidth={2} style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.25))' }} />
                                  <text x={textX} y={btnTextY + 2} textAnchor="middle" dominantBaseline="middle" fill="#059669" fontSize={10.5} fontWeight="900" style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}>
                                    [ E ] 📖 Baca Buku Statistika
                                  </text>
                                </motion.g>
                              )
                            }
                            return null
                          }

                          if (insideRoom.id === 'LabKomputer') {
                            if (nearLabTerminal && !showLabTerminalModal) {
                              const buttonW = 210
                              const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                              const textX = buttonLeft + buttonW / 2
                              return (
                                <motion.g
                                  key="btn-terminal-lab"
                                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, y: 5 }}
                                  onClick={() => setShowLabTerminalModal(true)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <rect x={buttonLeft - 10} y={btnY} width={buttonW + 20} height={28} rx={6} fill="#2D1A12" stroke="#38BDF8" strokeWidth={2} style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.6))' }} />
                                  <text x={textX} y={btnTextY + 2} textAnchor="middle" dominantBaseline="middle" fill="#BAE6FD" fontSize={10.5} fontWeight="900" style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}>
                                    [ E ] 💻 Buka Terminal Digital
                                  </text>
                                </motion.g>
                              )
                            }
                            return null
                          }

                                                    if (showWaliKelasPopup || teacherCutsceneStage !== null) return null
                          const isSaved = savedClasses.has(insideRoom.id)
                          const buttonW = 200
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2

                          return (
                            <motion.g
                              key={`btn-talk-${insideRoom.id}`}
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={() => {
                                if (isSaved) {
                                  setShowWaliKelasPopup(insideRoom)
                                } else {
                                  handleInteractTeacher(insideRoom)
                                }
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ cursor: 'pointer' }}
                            >
                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke={isSaved ? '#10B981' : '#F59E0B'}
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={isSaved ? '#34D399' : '#FEF3C7'}
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                {isSaved ? `✓ Buka Data ${insideRoom.label}` : `[ E ] 🗣️ Bicara dgn Wali Kelas`}
                              </text>
                            </motion.g>
                          )
                        })()}

                        {/* 2. Hallway Door Interaction Prompt (Locked door -> Kuis; Unlocked door -> Masuk Kelas; Saved -> Completed) */}
                        {!insideRoom && currentZone === 'main' && nearClass && !activeClass && !nearDoor && (cinematicStage === 'sanction_received' || demoMode) && (() => {
                          const isRG = nearClass.id === 'RG'
                          const isDataComplete = collected.size >= TOTAL_N || savedClasses.size >= 4
                          const isKittenFound = catQuestStage === 'kitten_rescued' || catQuestStage === 'completed'
                          const isRGUnlocked = isRG && isDataComplete && isKittenFound
                          const isSaved = !isRG && savedClasses.has(nearClass.id)
                          const isUnlocked = isRG ? isRGUnlocked : unlocked.has(nearClass.id)
                          const buttonW = isRG ? (isRGUnlocked ? 220 : 260) : isSaved ? 180 : 160
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2
                          return (
                            <motion.g
                              key={`btn-class-${nearClass.id}`}
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={() => {
                                if (isRG) {
                                  if (isRGUnlocked) {
                                    enterClassroom(nearClass)
                                  } else {
                                    gameAudio.playError()
                                    if (!isDataComplete && !isKittenFound) {
                                      setRgLockedToast(`🔒 Ruang Guru Terkunci! Kumpulkan data 4 kelas (${Math.max(collected.size, savedClasses.size * 6)}/${TOTAL_N}) dan temukan anak kucing yang hilang terlebih dahulu!`)
                                    } else if (!isKittenFound) {
                                      setRgLockedToast(`🔒 Ruang Guru Terkunci! Kamu harus menemukan anak kucing yang hilang terlebih dahulu sebelum melapor ke Pak Sutrisno!`)
                                    } else {
                                      setRgLockedToast(`🔒 Ruang Guru Terkunci! Kumpulkan seluruh data dari 4 kelas terlebih dahulu (${Math.max(collected.size, savedClasses.size * 6)}/${TOTAL_N}).`)
                                    }
                                    setTimeout(() => setRgLockedToast(null), 2500)
                                  }
                                  return
                                }
                                if (isSaved) return
                                enterClassroom(nearClass)
                              }}
                              whileHover={{ scale: isSaved ? 1 : 1.05 }}
                              whileTap={{ scale: isSaved ? 1 : 0.95 }}
                              style={{ cursor: isSaved ? 'default' : 'pointer' }}
                            >
                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke={isRG ? (isRGUnlocked ? '#10B981' : '#F59E0B') : isSaved ? '#10B981' : '#F59E0B'}
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.25))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={isRG ? (isRGUnlocked ? '#34D399' : '#FBBF24') : isSaved ? '#34D399' : '#FEF3C7'}
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                {isRG
                                  ? isRGUnlocked
                                    ? `[ E ] ✨ Masuk ke Ruang Guru ►`
                                    : !isDataComplete && !isKittenFound
                                      ? `[ E ] 🔒 Kumpulkan Data & Temukan Kucing`
                                      : !isKittenFound
                                        ? `[ E ] 🔒 Temukan Anak Kucing Terlebih Dahulu`
                                        : `[ E ] 🔒 Ruang Guru Terkunci (${Math.max(collected.size, savedClasses.size * 6)}/${TOTAL_N})`
                                  : isSaved
                                    ? `✓ Data ${nearClass.label} Selesai`
                                    : `[ E ] 🚪 Masuk ke ${nearClass.label} ►`}
                              </text>
                            </motion.g>
                          )
                        })()}

                        {/* 3. Facility Interaction Prompt (In Facility Zone) */}
                        {!insideRoom && currentZone === 'facility' && nearFacility && !activeFacility && (() => {
                          const buttonW = nearFacility.roomId ? 210 : 230
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2
                          return (
                            <motion.g
                              key={`btn-facility-${nearFacility.id}`}
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={() => {
                                if (nearFacility.roomId) {
                                  enterFacilityRoom(nearFacility)
                                } else {
                                  setActiveFacility(nearFacility)
                                  gameAudio.playDoorOpen()
                                }
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ cursor: 'pointer' }}
                            >
                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#FEF3C7"
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                {nearFacility.roomId ? `[ E ] 🚪 Masuk ke ${nearFacility.label} ►` : `[ E ] 💬 Bicara di ${nearFacility.label} ►`}
                              </text>
                            </motion.g>
                          )
                        })()}

                        {/* 4. Zone Transition Gateway Prompt */}
                        {!insideRoom && zoneTransitionPrompt && !nearFacility && !nearClass && (() => {
                          const isToFacility = zoneTransitionPrompt === 'to_facility'
                          const buttonW = 260
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2
                          return (
                            <motion.g
                              key="btn-zone-transition"
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={isToFacility ? goToFacilityZone : goToMainZone}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ cursor: 'pointer' }}
                            >
                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#FEF3C7"
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                {isToFacility ? '[ E ] 🚶‍♂️ Ke Area Fasilitas (Kantin/Lab) ▼' : '[ E ] 🚶‍♂️ Ke Halaman Kelas & Ruang Guru ▲'}
                              </text>
                            </motion.g>
                          )
                        })()}

                        {/* 5. Cat Quest: Mother Cat Prompt */}
                        {nearMotherCat && !insideRoom && currentZone === 'main' && (() => {
                          const buttonW = catQuestStage === 'completed' ? 220 : catQuestStage === 'kitten_rescued' ? 230 : 210
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2
                          return (
                            <motion.g
                              key="btn-mother-cat-interact"
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={() => {
                                gameAudio.playCatMeow()
                                setShowMotherCatModal(true)
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ cursor: 'pointer' }}
                            >
                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke={catQuestStage === 'completed' || catQuestStage === 'kitten_rescued' ? '#10B981' : '#F59E0B'}
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={catQuestStage === 'completed' || catQuestStage === 'kitten_rescued' ? '#34D399' : '#FEF3C7'}
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                {catQuestStage === 'completed'
                                  ? '🐾 [ E ] Bicara dgn Mimi & Mochi'
                                  : catQuestStage === 'kitten_rescued'
                                  ? '❤️ [ E ] Serahkan Mochi ke Mimi!'
                                  : '🐱 [ E ] Meoow? (Bicara dgn Mimi)'}
                              </text>
                            </motion.g>
                          )
                        })()}

                        {/* 6. Cat Quest: Kitten Rescue Prompt */}
                        {nearKitten && catQuestStage === 'quest_active' && (() => {
                          const buttonW = 250
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2
                          return (
                            <motion.g
                              key="btn-kitten-box-rescue"
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={() => {
                                gameAudio.playCatMeow()
                                setShowKittenRescueModal(true)
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ cursor: 'pointer' }}
                            >
                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#FEF3C7"
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                📦 [ E ] Buka Kardus & Selamatkan Mochi!
                              </text>
                            </motion.g>
                          )
                        })()}

                        {/* 1B. Unified Comic Speech Bubble (Cutscenes for Teacher & Player inside Classroom) */}
                        {insideRoom && teacherCutsceneStage && (() => {
                          const currentMap = LEVEL1_MAPS[insideRoom.id]
                          const teacherConfig = currentMap?.teacher
                          const teacherX = teacherConfig?.x ?? 617
                          const teacherY = teacherConfig?.y ?? 415
                          const teacherName = currentClassStudents[insideRoom.id]?.teacher || teacherConfig?.name || 'Wali Kelas'
                          const classStudentCount = currentClassStudents[insideRoom.id]?.students?.length || 0

                          // Accurate visual head position of the Teacher
                          const teacherAspect = (teacherConfig as any)?.aspectRatio ?? (teacherConfig?.cols === 1 && teacherConfig?.rows === 1 ? 2.0 : 1)
                          const teacherHeight = teacherConfig?.size ? (teacherConfig.size * teacherAspect) : 160
                          // NPCCharacter renders with posY = teacherY - teacherHeight * 0.85
                          // Visual top of head is ~78% of height above feet
                          const teacherHeadTop = teacherConfig?.spriteUrl
                            ? (teacherConfig.cols === 1 && teacherConfig.rows === 1 ? teacherY - teacherHeight * 0.78 : teacherY - (teacherConfig.size || 160) * 0.78)
                            : teacherY - 60

                          // Accurate visual head position of the Player (Stevunt)
                          const playerHeadTop = charPos.y - charSize * 0.65
                          const playerHeadX = charPos.x

                          const isPlayerSpeaking = teacherCutsceneStage === 'player_explain' || teacherCutsceneStage === 'post_stevunt_report'
                          const speakerX = isPlayerSpeaking ? playerHeadX : teacherX
                          const speakerHeadTop = isPlayerSpeaking ? playerHeadTop : teacherHeadTop

                          // Bubble dimensions based on content
                          let bW = 380
                          let bH = 88
                          let borderColor = '#F59E0B'
                          let speakerTitle = ''
                          let speakerBadgeColor = '#FDE047'
                          let dialogueText: React.ReactNode = null
                          let actionText = '[ Klik / Spasi ▶ ]'
                          let actionColor = '#FBBF24'
                          const teacherPrefix = (teacherName.startsWith('Bu') || teacherName.startsWith('Ibu')) ? '👩‍🏫 ' : '👨‍🏫 '

                          if (teacherCutsceneStage === 'anim_wait') {
                            bW = 240
                            bH = 46
                            speakerTitle = `${teacherPrefix}${teacherName}`
                            dialogueText = <span style={{ color: '#FDE68A', fontWeight: 800 }}>Sedang menyapa...</span>
                            actionText = '...'
                          } else if (teacherCutsceneStage === 'teacher_ask') {
                            bW = 380
                            bH = 90
                            speakerTitle = `${teacherPrefix}${teacherName}`
                            speakerBadgeColor = '#FDE047'
                            if (insideRoom.id === 'RG') {
                              dialogueText = (
                                <>
                                  <span style={{ color: '#34D399', fontWeight: 900 }}>{`"${playerName}! Bagaimana perkembangan tugasmu?"`}</span>
                                  <br />
                                  "Apakah 24 sampel data screen time dari 4 kelas sudah siap?"
                                </>
                              )
                            } else if (insideRoom.id === 'A2') {
                              dialogueText = (
                                <>
                                  <span style={{ color: '#F87171', fontWeight: 900 }}>{`"LOH?! ${playerName.toUpperCase()}?! Kamu kan murid kelas ini!"`}</span>
                                  <br />
                                  "Kenapa jam pelajaran malah keluyuran di luar?!"
                                </>
                              )
                            } else {
                              dialogueText = `"Halo! Ada perlu apa kamu datang ke ${insideRoom.label}?"`
                            }
                          } else if (teacherCutsceneStage === 'player_explain') {
                            bW = 400
                            bH = 92
                            speakerTitle = `🎒 ${playerName.toUpperCase()}`
                            speakerBadgeColor = '#38BDF8'
                            if (insideRoom.id === 'RG') {
                              dialogueText = (
                                <>
                                  "Sudah lengkap, Pak Sutrisno! Seluruh 24 data sampel"
                                  <br />
                                  "screen time dari Kelas VII-A, VII-B, VIII-A, dan VIII-B sudah saya kumpulkan!"
                                </>
                              )
                            } else if (insideRoom.id === 'A2') {
                              dialogueText = (
                                <>
                                  "A-ampun Pak Bambang! Saya tadi kena sanksi Pak Sutrisno"
                                  <br />
                                  "untuk ngumpulin 24 data screen time sekolah, Pak!"
                                </>
                              )
                            } else {
                              dialogueText = (
                                <>
                                  "Saya sedang menjalankan tugas sanksi Pak Sutrisno untuk"
                                  <br />
                                  {`mengumpulkan sampel data ${classStudentCount} siswa di kelas ini!`}
                                </>
                              )
                            }
                          } else if (teacherCutsceneStage === 'teacher_reply') {
                            bW = 390
                            bH = 96
                            borderColor = '#10B981'
                            speakerTitle = `${teacherPrefix}${teacherName}`
                            speakerBadgeColor = '#34D399'
                            actionColor = '#34D399'
                            actionText = insideRoom.id === 'RG' ? '[ Buka Papan Analisis ➔ ]' : '[ Buka Tantangan ➔ ]'
                            if (insideRoom.id === 'RG') {
                              dialogueText = (
                                <>
                                  <span style={{ color: '#34D399', fontWeight: 900 }}>{`"Kerja luar biasa, ${playerName}!"`}</span>
                                  <br />
                                  "Mari kita olah seluruh data ini di Papan Analisis untuk memeriksa klaim viral tersebut!"
                                </>
                              )
                            } else if (insideRoom.id === 'A1') {
                              dialogueText = (
                                <>
                                  "Ini data screen time 5 siswa Kelas VII-A."
                                  <br />
                                  <span style={{ color: '#FDE047', fontWeight: 900 }}>"Tapi sebelum Ibu serahkan datanya, coba jawab dulu tantangan ini!"</span>
                                </>
                              )
                            } else if (insideRoom.id === 'A2') {
                              dialogueText = (
                                <>
                                  "Oalah Sutrisno... Ya sudah, ini data 7 teman sekelasmu."
                                  <br />
                                  <span style={{ color: '#93C5FD', fontWeight: 800 }}>"Tapi sebelum kamu ambil, selesaikan dulu tantangan Bapak ini ya!"</span>
                                </>
                              )
                            } else {
                              dialogueText = (
                                <>
                                  {`Ini data screen time ${classStudentCount} siswa dari ${insideRoom.label}.`}
                                  <br />
                                  <span style={{ color: '#FDE047', fontWeight: 900 }}>"Tapi sebelum Ibu serahkan, selesaikan dulu tantangan ini ya!"</span>
                                </>
                              )
                            }
                          } else if (teacherCutsceneStage === 'post_stevunt_report') {
                            bW = 415
                            bH = 92
                            borderColor = '#38BDF8'
                            speakerTitle = `🎒 ${playerName.toUpperCase()} (Detektif Siswa)`
                            speakerBadgeColor = '#38BDF8'
                            actionColor = '#38BDF8'
                            actionText = '[ Dengarkan Pak Sutrisno ➔ ]'
                            dialogueText = (
                              <>
                                <span style={{ color: '#38BDF8', fontWeight: 900 }}>"Ini Pak, saya sudah mencari median, modus, dan rata-ratanya."</span>
                                <br />
                                "Semua perhitungannya sudah siap digunakan!"
                              </>
                            )
                          } else if (teacherCutsceneStage === 'post_pak_thanks') {
                            bW = 430
                            bH = 96
                            borderColor = '#10B981'
                            speakerTitle = `👨‍🏫 Pak Sutrisno (Guru BK)`
                            speakerBadgeColor = '#34D399'
                            actionColor = '#34D399'
                            actionText = '[ Mulai Kuis Evaluasi ➔ ]'
                            dialogueText = (
                              <>
                                <span style={{ color: '#34D399', fontWeight: 900 }}>{`"Wah, terima kasih banyak ya ${playerName} sudah membantu Bapak!"`}</span>
                                <br />
                                "Sebelum selesai, coba jawab satu pertanyaan evaluasi klaim ini ya."
                              </>
                            )
                          } else if (teacherCutsceneStage === 'post_pak_quiz' && sutrisnoQuiz) {
                            bW = 470
                            bH = sutrisnoQuizWrong ? 165 : 150
                            borderColor = sutrisnoQuizWrong ? '#EF4444' : '#F59E0B'
                            speakerTitle = `👨‍🏫 Pak Sutrisno (Guru BK)`
                            speakerBadgeColor = '#FDE047'
                          } else if (teacherCutsceneStage === 'post_conclusion') {
                            bW = 425
                            bH = 96
                            borderColor = '#10B981'
                            speakerTitle = `👨‍🏫 Pak Sutrisno (Guru BK)`
                            speakerBadgeColor = '#34D399'
                            actionColor = '#34D399'
                            actionText = '[ Selesai & Buka Hasil Misi 🏆 ]'
                            dialogueText = (
                              <>
                                <span style={{ color: '#34D399', fontWeight: 900 }}>{`"Wah, terima kasih banyak ya ${playerName} sudah membantu Bapak!"`}</span>
                                <br />
                                "Hasil analisismu sangat rapi dan teliti. Kerja bagus sekali, Nak!"
                              </>
                            )
                          }

                          // Anchor bubble cleanly centered horizontally above the speaker's head
                          const bX = Math.max(20, Math.min(WORLD_VW - bW - 20, speakerX - bW / 2))
                          const bBottomY = speakerHeadTop - 14
                          const bY = Math.max(16, bBottomY - bH)
                          const tailTipY = speakerHeadTop + 2

                          const bubblePath = getSpeechBubblePath(bX, bY, bW, bH, 14, speakerX, tailTipY, 22)

                          return (
                            <motion.g
                              key={`room-cutscene-bubble-${teacherCutsceneStage}-${insideRoom.id}`}
                              id={`room-cutscene-bubble-${teacherCutsceneStage}`}
                              initial={{ opacity: 0, scale: 0.94, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.94, y: 5 }}
                              transition={{ duration: 0.22, ease: 'easeOut' }}
                              style={{ cursor: 'pointer' }}
                              onClick={e => {
                                e.stopPropagation()
                                if (teacherCutsceneStage === 'post_pak_quiz') return
                                handleInteractTeacher(insideRoom)
                              }}
                            >
                              {/* 1. Single Seamless Comic Speech Bubble Shape (Body + Tail) */}
                              <path
                                d={bubblePath}
                                fill="#2D1A12"
                                stroke={borderColor}
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                style={{ filter: 'drop-shadow(0 12px 30px rgba(0, 0, 0, 0.75))' }}
                              />

                              {/* 2. Text and Interactive Elements inside ForeignObject */}
                              <foreignObject x={bX} y={bY} width={bW} height={bH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                {teacherCutsceneStage === 'post_pak_quiz' && sutrisnoQuiz ? (
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    boxSizing: 'border-box',
                                    padding: '8px 12px 6px 12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    userSelect: 'none',
                                    pointerEvents: 'auto',
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '10px', fontWeight: 900, color: '#FDE047', fontFamily: 'var(--font-ui)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        👨‍🏫 Pak Sutrisno — Uji Klaim Rata-Rata
                                      </span>
                                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#FDE68A', fontFamily: 'var(--font-ui)' }}>
                                        Pilih A / B / C / D
                                      </span>
                                    </div>

                                    <div
                                      data-testid="sutrisno-quiz-question"
                                      style={{
                                        fontSize: '10.2px',
                                        fontWeight: 800,
                                        color: '#FEF3C7',
                                        fontFamily: 'var(--font-ui)',
                                        lineHeight: 1.32,
                                        margin: '2px 0',
                                        textAlign: 'left',
                                      }}
                                    >
                                      "{sutrisnoQuiz.questionText}"
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', pointerEvents: 'auto' }}>
                                      {sutrisnoQuiz.options.map((opt, idx) => (
                                        <button
                                          key={`sutrisno-opt-${idx}`}
                                          data-testid={`sutrisno-opt-${idx}`}
                                          onClick={(e) => handleSelectSutrisnoQuizOption(opt.isCorrect, e)}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            padding: '4px 7px',
                                            borderRadius: '7px',
                                            background: 'rgba(255, 255, 255, 0.08)',
                                            border: '1.5px solid #F59E0B',
                                            color: '#FEF3C7',
                                            fontSize: '9px',
                                            fontWeight: 800,
                                            fontFamily: 'var(--font-ui)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            boxShadow: '0 1px 3px rgba(140, 98, 57, 0.1)',
                                            transition: 'all 0.15s ease',
                                          }}
                                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.25)' }}
                                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)' }}
                                        >
                                          <span style={{
                                            width: '15px',
                                            height: '15px',
                                            borderRadius: '4px',
                                            background: '#F59E0B',
                                            border: '1px solid #FDE047',
                                            color: '#1F130B',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '8.5px',
                                            fontWeight: 900,
                                            flexShrink: 0,
                                          }}>
                                            {opt.label}
                                          </span>
                                          <span style={{ flex: 1, lineHeight: 1.2 }}>{opt.text}</span>
                                        </button>
                                      ))}
                                    </div>

                                    {sutrisnoQuizWrong && (
                                      <div style={{ fontSize: '8.5px', fontWeight: 800, color: '#FCA5A5', textAlign: 'center', marginTop: '1px' }}>
                                        ⚠️ Kurang tepat! Bandingkan rata-rata {sutrisnoQuiz.actualMean} jam dengan klaim &gt; {sutrisnoQuiz.claimThreshold} jam ya.
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    boxSizing: 'border-box',
                                    padding: '8px 14px 6px 14px',
                                    background: 'transparent',
                                    border: 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    userSelect: 'none',
                                    pointerEvents: 'auto',
                                  }}>
                                    <div style={{
                                      fontSize: '11px',
                                      fontWeight: 900,
                                      color: speakerBadgeColor,
                                      fontFamily: 'var(--font-ui)',
                                      letterSpacing: '0.5px',
                                      textTransform: 'uppercase',
                                      textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                    }}>
                                      {speakerTitle}
                                    </div>

                                    <div style={{
                                      fontSize: '10.8px',
                                      fontWeight: 800,
                                      color: '#FEF3C7',
                                      fontFamily: 'var(--font-ui)',
                                      textAlign: 'center',
                                      lineHeight: 1.35,
                                      textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                                      margin: '2px 0',
                                    }}>
                                      {dialogueText}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                      <span style={{
                                        fontSize: '9.5px',
                                        fontWeight: 900,
                                        color: actionColor,
                                        fontFamily: 'var(--font-ui)',
                                        letterSpacing: '0.3px',
                                        background: 'rgba(0, 0, 0, 0.4)',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        border: `1px solid ${actionColor}55`,
                                      }}>
                                        {actionText}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </foreignObject>
                            </motion.g>
                          )
                        })()}
                      </AnimatePresence>
                    </>
                  )
                })()}
              </svg>
            )
          })()}

          {/* Vignette Overlay (Revisi 5) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            boxShadow: 'inset 0 0 35px rgba(0, 0, 0, 0.82)',
            borderRadius: 0,
            zIndex: 30,
          }} />

          {/* Floating Exit Button at Bottom Right inside Room */}
          <AnimatePresence>
            {insideRoom && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                whileHover={{ scale: 1.06, boxShadow: '0 0 25px rgba(239, 68, 68, 0.6)' }}
                whileTap={{ scale: 0.94 }}
                onClick={handleExitClassroom}
                style={{
                  position: 'absolute',
                  bottom: 'clamp(14px, 3vh, 22px)',
                  right: 'clamp(14px, 3vw, 22px)',
                  zIndex: 55,
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(185, 28, 28, 0.98) 100%)',
                  backdropFilter: 'blur(12px)',
                  border: '1.5px solid #FCA5A5',
                  borderRadius: 14,
                  padding: 'clamp(8px, 1vw, 10px) clamp(14px, 1.5vw, 18px)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: 'clamp(11.5px, 1.1vw, 13px)',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(239, 68, 68, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  pointerEvents: 'auto',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '16px' }}>🚪</span>
                <span>Keluar Ruang {insideRoom.label}</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Joystick (Hidden when inside classrooms for conversation mode) */}
          {(!insideRoom || !['A1', 'A2', 'B1', 'B2'].includes(insideRoom.id)) && (
            <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 50, touchAction: 'none' }}>
              <Joystick onDir={(x, y) => { const nextDir = { x, y }; dirRef.current = nextDir; setMoveDir(nextDir); }} />
            </div>
          )}

          {/* Blackout Screen Fade Transition Overlay (Jeda Transisi Layar Gelap -> Terang) */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#04070A',
              pointerEvents: screenFade !== 'idle' ? 'all' : 'none',
              zIndex: 999,
            }}
            initial={false}
            animate={{ opacity: (screenFade === 'out' || screenFade === 'blackout') ? 1 : 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
      </div>

      <AnimatePresence>
        {activeDoor && (
          <QuizModal
            door={activeDoor}
            isFD={isFD}
            onCorrect={handleCorrect}
            onClose={() => setActiveDoor(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeClass && (
          <QuizModal
            door={activeClass}
            isFD={isFD}
            onCorrect={handleClassCorrect}
            onClose={() => setActiveClass(null)}
          />
        )}
      </AnimatePresence>

      {/* Pak Sutrisno Report Modal */}
      <AnimatePresence>
        {showPakReportModal && (
          <PakReportModal
            dataset={activeDataset}
            onProceed={() => {
              setShowPakReportModal(false)
              gameAudio.playUnlockJingle()
              // Alur kembali ke chit-chat dengan Pak Sutrisno di Ruang Guru
              setTimeout(() => {
                setTeacherCutsceneStage('post_stevunt_report')
              }, 300)
            }}
          />
        )}
      </AnimatePresence>

      
      {/* Misi Selesai Modal (Popup Bintang 1-3 & Hasil Investigasi) */}
      <AnimatePresence>
        {showMissionCompleteModal && (
          <MissionCompleteModal
            stars={earnedStarsState}
            elapsedSeconds={elapsedSecondsState}
            mistakeCount={mistakeCount}
            onFinish={() => {
              setShowMissionCompleteModal(false)
              if (onComplete) {
                onComplete(earnedStarsState)
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Wali Kelas Data Dialogue Modal */}
      <AnimatePresence>
        {showWaliKelasPopup && (
          <WaliKelasModal
            door={showWaliKelasPopup}
            studentsData={currentClassStudents}
            onCollectData={handleCloseWaliKelas}
            onClose={() => {
              setShowWaliKelasPopup(null)
              handleExitClassroom()
            }}
          />
        )}
      </AnimatePresence>

      {/* Facility Dialogue Modal (Kantin, Lab Komputer, Perpustakaan) */}
      <AnimatePresence>
        {activeFacility && (
          <FacilityModal
            facility={activeFacility}
            onClose={() => setActiveFacility(null)}
          />
        )}
      </AnimatePresence>

      {/* Library Bookshelf Learning Modal (Pojok Baca Statistika SMP) */}
      <AnimatePresence>
        {showLibraryBookModal && (
          <LibraryBookModal onClose={() => setShowLibraryBookModal(false)} />
        )}
      </AnimatePresence>

      {/* Lab Terminal Learning Modal (Terminal Literasi & Analisis Digital) */}
      <AnimatePresence>
        {showLabTerminalModal && (
          <LabTerminalModal onClose={() => setShowLabTerminalModal(false)} />
        )}
      </AnimatePresence>

      {/* Cat Quest: Mother Cat Dialogue Modal */}
      <AnimatePresence>
        {showMotherCatModal && (
          <MotherCatModal
            stage={
              catQuestStage === 'cat_spawned'
                ? 'ask_help'
                : catQuestStage === 'kitten_rescued' || catQuestStage === 'completed'
                ? 'reward'
                : 'reminder'
            }
            classLabel={motherCatPos.classLabel}
            onAccept={() => {
              if (catQuestStage === 'cat_spawned') {
                setCatQuestStage('quest_active')
                gameAudio.playCatPurr()
              } else if (catQuestStage === 'kitten_rescued') {
                setCatQuestStage('completed')
                gameAudio.playCatPurr()
              }
              setShowMotherCatModal(false)
            }}
            onClose={() => {
              if (catQuestStage === 'cat_spawned') {
                setCatQuestStage('quest_active')
              } else if (catQuestStage === 'kitten_rescued') {
                setCatQuestStage('completed')
                gameAudio.playCatPurr()
              }
              setShowMotherCatModal(false)
            }}
          />
        )}
      </AnimatePresence>

      {/* Cat Quest: Kitten Rescue Modal */}
      <AnimatePresence>
        {showKittenRescueModal && (
          <KittenRescueModal
            locationLabel={kittenLocation.label}
            onRescue={() => {
              setCatQuestStage('kitten_rescued')
              setShowKittenRescueModal(false)
              gameAudio.playCatPurr()
            }}
            onClose={() => setShowKittenRescueModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Room Milestone Overlay */}
      <AnimatePresence>
        {roomMilestoneText && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, pointerEvents: 'none' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              style={{
                position: 'relative',
                maxWidth: 380,
                width: '100%',
                background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
                border: '2.5px solid #F59E0B',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
                borderRadius: 22,
                padding: '24px 22px',
                textAlign: 'center'
              }}
            >
              {/* Corner brackets */}
              <div style={{ position: 'absolute', top: '8px', left: '8px', width: '12px', height: '12px', borderTop: '2.5px solid #F59E0B', borderLeft: '2.5px solid #F59E0B', borderRadius: '2px 0 0 0' }} />
              <div style={{ position: 'absolute', top: '8px', right: '8px', width: '12px', height: '12px', borderTop: '2.5px solid #F59E0B', borderRight: '2.5px solid #F59E0B', borderRadius: '0 2px 0 0' }} />
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '12px', height: '12px', borderBottom: '2.5px solid #F59E0B', borderLeft: '2.5px solid #F59E0B', borderRadius: '0 0 0 2px' }} />
              <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '12px', height: '12px', borderBottom: '2.5px solid #F59E0B', borderRight: '2.5px solid #F59E0B', borderRadius: '0 0 2px 0' }} />

              <div style={{ fontSize: '11px', color: '#9A3412', fontWeight: 900, letterSpacing: '1.5px', marginBottom: 6, textTransform: 'uppercase' }}>
                ⭐ PENCAPAIAN RUANGAN ⭐
              </div>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontSize: '20px', fontWeight: 900, color: '#FEF3C7', letterSpacing: '1px', marginBottom: 8 }}
              >
                {roomMilestoneText}
              </motion.div>
              <div style={{ fontSize: '12.5px', color: '#FEF3C7', fontWeight: 700 }}>
                Semua kelas di ruangan ini telah dibuka!
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ruang Guru Locked Toast Overlay */}
      <AnimatePresence>
        {rgLockedToast && (
          <div style={{ position: 'fixed', top: 'clamp(55px, 8vh, 75px)', left: '50%', transform: 'translateX(-50%)', zIndex: 750, pointerEvents: 'none' }}>
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              style={{
                position: 'relative',
                background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
                border: '2.5px solid #F59E0B',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4), inset 0 0 16px rgba(180, 140, 80, 0.2)',
                borderRadius: 16,
                padding: '10px 18px',
                color: '#FEF3C7',
                fontSize: '12.5px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                backdropFilter: 'blur(8px)',
              }}
            >
              <span style={{ fontSize: 18 }}>🔒</span>
              <span>{rgLockedToast}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inventory Side Drawer Modal Overlay (Misi & Target Tugas) */}
      <AnimatePresence>
        {isInventoryOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 600,
              background: 'rgba(40, 25, 15, 0.65)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
            onClick={() => setIsInventoryOpen(false)}
          >
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                width: '100%',
                maxWidth: 450,
                height: '100%',
                background: 'linear-gradient(180deg, #2D1A12 0%, #1A0D08 100%)',
                borderLeft: '3px solid #F59E0B',
                boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7), inset 0 0 30px rgba(251, 191, 36, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 20px',
                gap: 16,
                overflowY: 'auto',
                color: '#FEF3C7',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid rgba(245, 158, 11, 0.3)', paddingBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: '#FBBF24', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    📜 QUEST LOG • LEVEL 1
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#FDE047', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span>📜</span> Misi Investigasi
                  </h3>
                </div>
                <button
                  id="quest-log-close-btn"
                  onClick={() => setIsInventoryOpen(false)}
                  style={{
                    background: 'rgba(140, 98, 57, 0.1)',
                    border: '1px solid rgba(140, 98, 57, 0.3)',
                    color: '#FEF3C7',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: 16
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Dynamic Quest Status Card */}
              {(() => {
                const isTaskGiven = cinematicStage === 'sanction_received' || demoMode
                const isAllCollected = n >= TOTAL_N || savedClasses.size >= 4
                const isKittenFound = catQuestStage === 'kitten_rescued' || catQuestStage === 'completed'

                let badgeColor = '#0E8388'
                let badgeText = '📍 MISI UTAMA'
                let questTitle = 'Jumpai Pak Sutrisno'
                let questDesc = 'Kamu datang terlambat ke sekolah! Cari dan bicara dengan Pak Sutrisno di depan Ruang Guru Lorong Utama untuk melapor.'

                if (isAllCollected && isKittenFound) {
                  badgeColor = '#059669'
                  badgeText = '⚡ SELESAI — SIAP DILAPORKAN'
                  questTitle = 'Laporkan 24 Data ke Pak Sutrisno di Ruang Guru'
                  questDesc = 'Semua 24 sampel data screen time siswa telah berhasil terkumpul dari 4 kelas dan anak kucing telah ditemukan! Masuklah ke Ruang Guru di Gedung Tengah untuk menyerahkan data kepada Pak Sutrisno.'
                } else if (isAllCollected && !isKittenFound) {
                  badgeColor = '#D97706'
                  badgeText = '🐾 MISI ANAK KUCING BELUM SELESAI'
                  questTitle = 'Data Lengkap! Temukan Anak Kucing Terlebih Dahulu'
                  questDesc = 'Semua 24 sampel data screen time siswa telah berhasil terkumpul dari 4 kelas! Namun Ruang Guru masih terkunci. Temukan anak kucing yang hilang terlebih dahulu agar kamu bisa melapor ke Pak Sutrisno.'
                } else if (isTaskGiven) {
                  badgeColor = '#0E8388'
                  badgeText = '🟢 SEDANG BERLANGSUNG'
                  questTitle = 'Proyek Riset Pak Sutrisno: Kumpulkan 24 Data'
                  questDesc = 'Pak Sutrisno sedang memimpin riset statistika tentang durasi screen time siswa SMP untuk menguji isu viral. Sebagai sanksi keterlambatan, kamu ditugaskan menjadi asisten peneliti untuk mengumpulkan 24 sampel data dari Wali Kelas VII-A, VII-B, VIII-A, dan VIII-B.'
                } else if (cinematicStage === 'gate_intro') {
                  badgeColor = '#D97706'
                  badgeText = '🏃 MASUK GERBANG'
                  questTitle = 'Waduh, Telat Masuk Sekolah!'
                  questDesc = 'Bel sekolah sudah berbunyi! Segera lari masuk melewati pintu gerbang sekolah sebelum dikunci oleh Pak Joko (Satpam).'
                }

                return (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid #F59E0B',
                    borderRadius: 16,
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    boxShadow: '0 3px 12px rgba(140, 98, 57, 0.12)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 900,
                        color: badgeColor,
                        background: '#FEF3C7',
                        border: `1.5px solid ${badgeColor}`,
                        borderRadius: 20,
                        padding: '3px 10px',
                        letterSpacing: '0.8px'
                      }}>
                        {badgeText}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#FEF3C7' }}>
                        Target: 24 Sampel Data
                      </span>
                    </div>

                    <div>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#FEF3C7' }}>
                        {questTitle}
                      </h4>
                      <p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#FEF3C7', lineHeight: 1.5 }}>
                        {questDesc}
                      </p>
                    </div>

                    {/* Progress Bar Component */}
                    <div style={{ marginTop: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#FEF3C7' }}>Progress Pengumpulan Data</span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: badgeColor, fontFamily: 'var(--font-data)' }}>
                          {n} / {TOTAL_N} Siswa ({Math.round((n / TOTAL_N) * 100)}%)
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: 14,
                        background: '#EAD6B5',
                        borderRadius: 10,
                        overflow: 'hidden',
                        border: '1.5px solid #8C6239',
                        padding: 2
                      }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (n / TOTAL_N) * 100)}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          style={{
                            height: '100%',
                            background: isAllCollected
                              ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                              : 'linear-gradient(90deg, #0E8388 0%, #0284C7 100%)',
                            borderRadius: 8,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Cat Quest Mini-Game Side Quest Log Card */}
              {catQuestStage !== 'untriggered' && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid #F59E0B',
                  borderRadius: 16,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  boxShadow: '0 3px 12px rgba(140, 98, 57, 0.12)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 900,
                      color: catQuestStage === 'completed' ? '#065F46' : '#9A3412',
                      background: catQuestStage === 'completed' ? '#D1FAE5' : '#FEF3C7',
                      border: catQuestStage === 'completed' ? '1px solid #10B981' : '1px solid #F59E0B',
                      borderRadius: 20,
                      padding: '2px 8px',
                      letterSpacing: '0.6px',
                    }}>
                      {catQuestStage === 'completed' ? '🎉 MISI SELESAI' : '🐾 MISI SAMPINGAN'}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#FEF3C7' }}>
                      Depan {motherCatPos.classLabel}
                    </span>
                  </div>

                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#FEF3C7' }}>
                      {catQuestStage === 'cat_spawned' && '🐱 Kucing Mimi Mengeong Memanggilmu'}
                      {catQuestStage === 'quest_active' && '📦 Cari Anak Kucing Mochi di Dalam Kardus'}
                      {catQuestStage === 'kitten_rescued' && '❤️ Bawa Pulang Mochi ke Induknya (Mimi)'}
                      {catQuestStage === 'completed' && '🏅 Sahabat Kucing SMP (Tuntas)'}
                    </h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#FEF3C7', lineHeight: 1.5 }}>
                      {catQuestStage === 'cat_spawned' && `Bicara dengan Induk Kucing (Mimi) di lorong depan ${motherCatPos.classLabel}.`}
                      {catQuestStage === 'quest_active' && `Mochi bersembunyi di dalam kardus! Petunjuk lokasi: ${kittenLocation.label}.`}
                      {catQuestStage === 'kitten_rescued' && `Mochi sudah aman bersamamu! Kembalikan Mochi ke Mimi di depan ${motherCatPos.classLabel}.`}
                      {catQuestStage === 'completed' && `Mimi dan Mochi kini hidup tenang bersama. Kamu mendapatkan lencana Sahabat Kucing SMP!`}
                    </p>
                  </div>
                </div>
              )}

              {/* Collapsible Student Data Details Button */}
              {collectedStudents.length > 0 && (
                <div style={{ marginTop: 8, borderTop: '1.5px solid rgba(140, 98, 57, 0.25)', paddingTop: 14 }}>
                  <button
                    onClick={() => setShowStudentDetails(prev => !prev)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: showStudentDetails ? '#3D2419' : 'rgba(255, 255, 255, 0.08)',
                      border: '1.5px solid #F59E0B',
                      color: '#FEF3C7',
                      fontSize: 11.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <span>{showStudentDetails ? '🔼 Sembunyikan' : '👁️ Tampilkan'} Detail Catatan Data Siswa ({collectedStudents.length})</span>
                  </button>

                  {showStudentDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}
                    >
                      {/* Class Filter Tabs */}
                      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }} className="scrollbar-hidden">
                        {[
                          { id: 'ALL', label: 'Semua' },
                          { id: 'A1', label: 'VII-A', color: '#B45309' },
                          { id: 'A2', label: 'VII-B', color: '#0369A1' },
                          { id: 'B1', label: 'VIII-A', color: '#0E8388' },
                          { id: 'B2', label: 'VIII-B', color: '#059669' },
                        ].map(tab => {
                          const active = inventoryTab === tab.id
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setInventoryTab(tab.id as any)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: 8,
                                fontSize: 10.5,
                                fontWeight: 800,
                                border: active ? '1.5px solid #FDE047' : '1.5px solid #F59E0B',
                                background: active ? '#F59E0B' : 'rgba(255, 255, 255, 0.08)',
                                color: active ? '#1F130B' : '#FEF3C7',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.15s',
                              }}
                            >
                              {tab.label}
                            </button>
                          )
                        })}
                      </div>

                      {/* Student Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                        {collectedStudents
                          .filter(st => inventoryTab === 'ALL' || st.classId === inventoryTab)
                          .map((st, idx) => {
                            const doorMeta = doors.find(cd => cd.id === st.classId)
                            const themeColor = doorMeta?.color || '#8C6239'
                            return (
                              <div
                                key={`${st.classId}-${st.name}-${idx}`}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid #F59E0B',
                                  borderRadius: 10,
                                  padding: '8px 10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  boxShadow: '0 2px 6px rgba(140, 98, 57, 0.08)',
                                }}
                              >
                                <div style={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: '50%',
                                  background: '#FEF3C7',
                                  border: `1.5px solid ${themeColor}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 12,
                                  flexShrink: 0
                                }}>
                                  👤
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ fontSize: 11, fontWeight: 800, color: '#FEF3C7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {st.name}
                                  </div>
                                  <div style={{ fontSize: 9.5, color: '#9A3412', fontWeight: 800, marginTop: 1 }}>
                                    ⏱️ {st.time} Jam/hari
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showCounter && <CounterResult onDone={onComplete} />}

      {isLoadingAssets && (
        <GamePreloader
          title="MEMUAT INVESTIGASI LEVEL 1"
          subtitle="Peta Lorong Sekolah & Aset Misi"
          imagesToPreload={[
            '/Assets/Building/Gerbang.jpg',
            '/Assets/Building/Kelas.webp',
            '/Assets/Building/Fasilitas.webp',
            '/Assets/Building/Perpustakaan/Perpustakaan.webp',
            '/Assets/Building/Lab Komputer/Lab.webp',
            '/Assets/Building/Ruang VII-A/VII-A.webp',
            '/Assets/Building/Ruang VII-B/VII-B.webp',
            '/Assets/Building/Ruang VIII-A/VIII-A.webp',
            '/Assets/Building/Ruang VIII-B/VIII-B.webp',
            '/Assets/Building/Ruang Guru/Ruang Guru.webp',
            '/Assets/Building/Ruang VII-B/Pak Bambang.png',
            '/Assets/Building/Ruang VII-A/Bu Sari.webp',
            '/Assets/Building/Ruang VIII-A/Bu Rina.webp',
            '/Assets/Building/Ruang VIII-B/Pak Setiawan.webp',
            '/Assets/Character/Stevunt-idle.png',
            '/Assets/Character/pak Sutrisno-iso_idle_right-trimmed.png',
            '/Assets/CatPack/Idle.png',
            '/Assets/CatPack/Box3.png'
          ]}
          minDurationMs={1200}
          onComplete={() => setIsLoadingAssets(false)}
        />
      )}
    </div>
  )
}
