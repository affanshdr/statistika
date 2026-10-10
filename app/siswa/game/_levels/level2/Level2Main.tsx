'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store/gameStore'
import BadgeUnlock from '@/app/siswa/game/_components/BadgeUnlock'

// Level 2 modules
import {
  pickRandomDataSet,
  computeStats,
  generateQuestions,
  validateAnswer,
  getLearningMaterials,
  calculateCandidateScores,
} from './data/level2StatData'
import type { DataSet, ComputedStats, QuestionConfig, LearningMaterial } from './data/level2StatData'
import type { Level2State, TrialSession, QuestionResult, DialogLine } from './config/level2Config'
import {
  TEACHER_ANNOUNCEMENT_DIALOGS,
  DIRA_ENCOURAGEMENT,
  TEACHER_WILLING_RESPONSE,
  TEACHER_UNWILLING_RESPONSE,
  TEACHER_DATA_INTRO,
  DIRA_DATA_EXPLAIN,
  TEACHER_NAME,
  QUESTION_TIME_LIMIT,
  TOTAL_QUESTIONS,
} from './config/level2Config'

// Level 2 Components
import { TeacherDialog, ChoicePanel, ClassroomScene, DataDisplay, CandidateStatus } from './components/ClassroomUI'
import DiraLearningPanel from './components/DiraLearningPanel'
import QuizPanel from './components/QuizPanel'
import ResultsPanel from './components/ResultsPanel'

// ──────────────────────────────────────────────────────
// BADGES
// ──────────────────────────────────────────────────────

const LEVEL2_BADGES = {
  OLYMPIAD: { id: 'olympiad-champion', icon: '🏆', name: 'Juara Olimpiade', desc: 'Terpilih menjadi perwakilan sekolah' },
  PERFECT: { id: 'perfect-stats-l2', icon: '🎯', name: 'Statistisi Sempurna', desc: '4/4 benar di Level 2' },
  SPEED: { id: 'speed-stats-l2', icon: '⚡', name: 'Kalkulator Cepat', desc: 'Selesai di bawah 50% waktu' },
}

// ──────────────────────────────────────────────────────
// PROPS
// ──────────────────────────────────────────────────────

interface Level2MainProps {
  studentId?: string
  studentName?: string
  demoMode?: boolean
}

// ──────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────

interface PendingBadge { icon: string; name: string; desc: string; id: string }

export default function Level2Main({
  studentId,
  studentName,
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
    xp,
    isCompleted,
  } = useGameStore()

  // ── STATE MACHINE ────────────────────────────
  const [gameState, setGameState] = useState<Level2State>('ENTER_CLASS')
  const [pendingBadges, setPendingBadges] = useState<PendingBadge[]>([])
  const sessionActiveRef = useRef(false)

  // ── DIALOG STATE ─────────────────────────────
  const [dialogIndex, setDialogIndex] = useState(0)
  const [currentDialog, setCurrentDialog] = useState<DialogLine | null>(null)
  const [showDiraEncouragement, setShowDiraEncouragement] = useState(false)

  // ── TRIAL SESSION ────────────────────────────
  const [trial, setTrial] = useState<TrialSession | null>(null)
  const [learningMaterials, setLearningMaterials] = useState<LearningMaterial[]>([])
  const [showDiraPanel, setShowDiraPanel] = useState(false)

  // ── TRANSITION FLAGS ─────────────────────────
  const [isTransitioning, setIsTransitioning] = useState(false)
  const prevDataSetIdRef = useRef<string | undefined>(undefined)

  // ── LIFECYCLE ────────────────────────────────
  useEffect(() => {
    sessionActiveRef.current = true
    useGameStore.getState().startLevel(2)
  }, [])

  // Auto-start classroom entry sequence
  useEffect(() => {
    if (gameState === 'ENTER_CLASS') {
      const timer = setTimeout(() => {
        setGameState('TEACHER_ANNOUNCEMENT')
        setDialogIndex(0)
        setCurrentDialog(TEACHER_ANNOUNCEMENT_DIALOGS[0])
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [gameState])

  // ── BADGE HELPERS ────────────────────────────
  const awardBadge = useCallback((badge: typeof LEVEL2_BADGES[keyof typeof LEVEL2_BADGES]) => {
    unlockBadge(badge.id)
    setPendingBadges(prev => [...prev, badge])
  }, [unlockBadge])

  const dismissBadge = () => setPendingBadges(prev => prev.slice(1))

  // ── TRIAL INITIALIZATION ─────────────────────
  const initTrial = useCallback(() => {
    const dataSet = pickRandomDataSet(prevDataSetIdRef.current)
    prevDataSetIdRef.current = dataSet.id
    const stats = computeStats(dataSet)
    const questions = generateQuestions(stats, stats.sortedValues)
    const materials = getLearningMaterials(stats)

    const newTrial: TrialSession = {
      id: `trial-${Date.now()}`,
      dataSet,
      computedStats: stats,
      questions,
      currentQuestionIndex: 0,
      results: [],
      playerScore: 0,
      candidate1Score: 3,
      candidate2Score: 2,
      isComplete: false,
      isPassed: false,
    }

    setTrial(newTrial)
    setLearningMaterials(materials)
    return newTrial
  }, [])

  // ── DIALOG PROGRESSION ───────────────────────
  const handleDialogNext = useCallback(() => {
    if (gameState === 'TEACHER_ANNOUNCEMENT') {
      const nextIdx = dialogIndex + 1
      if (nextIdx < TEACHER_ANNOUNCEMENT_DIALOGS.length) {
        setDialogIndex(nextIdx)
        setCurrentDialog(TEACHER_ANNOUNCEMENT_DIALOGS[nextIdx])
      } else {
        // Show DiRA encouragement, then show choice
        setCurrentDialog(null)
        setShowDiraEncouragement(true)
      }
    }
  }, [gameState, dialogIndex])

  const handleDiraEncouragementDismiss = useCallback(() => {
    setShowDiraEncouragement(false)
    setGameState('CHOICE_PENDING')
  }, [])

  // ── CHOICE HANDLERS ──────────────────────────
  const handleAccept = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)

    // Show teacher response
    setCurrentDialog(TEACHER_WILLING_RESPONSE)
    setGameState('MOVING_TO_SELECTION')

    setTimeout(() => {
      // Init trial & show preparation
      initTrial()
      setGameState('SELECTION_PREPARATION')
      setCurrentDialog(TEACHER_DATA_INTRO)
      setIsTransitioning(false)
    }, 2500)
  }, [isTransitioning, initTrial])

  const handleDecline = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)

    setCurrentDialog(TEACHER_UNWILLING_RESPONSE)
    setGameState('LEAVING_CLASS')

    setTimeout(() => {
      setCurrentDialog(null)
      setGameState('RETURNING_TO_CLASS')
      setIsTransitioning(false)
    }, 3000)
  }, [isTransitioning])

  const handleReturnToClass = useCallback(() => {
    // Player re-enters classroom: directly open selection choice per prompt §4
    setGameState('CHOICE_PENDING')
    setCurrentDialog(null)
  }, [])

  // ── SELECTION PREPARATION ────────────────────
  const handleTeacherIntroNext = useCallback(() => {
    setCurrentDialog(DIRA_DATA_EXPLAIN)
    setTimeout(() => {
      setCurrentDialog(null)
    }, 3500)
  }, [])

  const handlePreparationNext = useCallback(() => {
    setCurrentDialog(null)
    setGameState('DIRA_EXPLANATION')
    setShowDiraPanel(true)
  }, [])

  // ── DIRA LEARNING COMPLETE ───────────────────
  const handleDiraLearningComplete = useCallback(() => {
    setShowDiraPanel(false)
    setGameState('QUESTION_ACTIVE')
  }, [])

  // ── ANSWER SUBMISSION ────────────────────────
  const handleAnswerSubmit = useCallback((answer: string, isTimeout: boolean, timeSpent: number) => {
    if (!trial) return

    const currentQ = trial.questions[trial.currentQuestionIndex]
    const isCorrect = !isTimeout && validateAnswer(answer, currentQ.answerKey, currentQ.tolerance)

    const result: QuestionResult = {
      questionId: currentQ.id,
      topic: currentQ.topicLabel,
      playerAnswer: answer,
      isCorrect,
      isTimeout,
      timeSpent,
    }

    if (!isCorrect) {
      incrementMistake()
    }

    const updatedResults = [...trial.results, result]
    const newScore = updatedResults.filter(r => r.isCorrect).length
    const nextIndex = trial.currentQuestionIndex + 1

    if (nextIndex >= TOTAL_QUESTIONS) {
      // All questions answered — evaluate
      const { candidate1Score, candidate2Score } = calculateCandidateScores(newScore)
      const isPassed = newScore === TOTAL_QUESTIONS

      setTrial(prev => prev ? {
        ...prev,
        results: updatedResults,
        playerScore: newScore,
        candidate1Score,
        candidate2Score,
        currentQuestionIndex: nextIndex,
        isComplete: true,
        isPassed,
      } : null)

      // Short delay before showing results
      setGameState('QUESTION_RESULT')
      setTimeout(() => {
        if (isPassed) {
          addXP(50, 'Menyelesaikan seleksi olimpiade dengan sempurna', 4)
          awardBadge(LEVEL2_BADGES.OLYMPIAD)
          awardBadge(LEVEL2_BADGES.PERFECT)

          // Speed check
          const elapsed = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 600
          if (elapsed < 300) awardBadge(LEVEL2_BADGES.SPEED)

          setGameState('SUCCESS')
        } else {
          setGameState('FAILURE')
        }
      }, 1500)
    } else {
      // More questions remain
      setTrial(prev => prev ? {
        ...prev,
        results: updatedResults,
        playerScore: newScore,
        currentQuestionIndex: nextIndex,
      } : null)

      // Brief result display then move to next
      setGameState('QUESTION_RESULT')
      setTimeout(() => {
        setGameState('DIRA_EXPLANATION')
        setShowDiraPanel(true)
      }, 1500)
    }
  }, [trial, incrementMistake, addXP, awardBadge, sessionStartTime])

  // ── RETRY ────────────────────────────────────
  const handleRetry = useCallback(() => {
    setGameState('RETRY')
    setTrial(null)
    setLearningMaterials([])
    setDialogIndex(0)
    setCurrentDialog(null)
    setShowDiraEncouragement(false)
    setShowDiraPanel(false)
    setIsTransitioning(false)
    setPendingBadges([])

    // Reset game store for this level
    useGameStore.getState().resetLevel()

    // Small delay then restart with clean state
    setTimeout(() => {
      useGameStore.getState().startLevel(2)
      setGameState('ENTER_CLASS')
    }, 500)
  }, [])

  // ── CONTINUE (after success) ─────────────────
  const handleContinue = useCallback(() => {
    addXP(20, 'Menyelesaikan Level 2', 5)
    completeLevel(2)
    router.push('/siswa/game/results/2')
  }, [addXP, completeLevel, router])

  // ── RENDER HELPERS ───────────────────────────
  const currentQuestion = trial?.questions[trial.currentQuestionIndex] ?? null
  const currentMaterial = trial ? learningMaterials[trial.currentQuestionIndex] ?? null : null

  // ──────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      height: '100%',
      overflow: 'hidden',
    }}>
      <ClassroomScene
        showBlackboard={
          gameState === 'SELECTION_PREPARATION' ||
          gameState === 'DIRA_EXPLANATION' ||
          gameState === 'QUESTION_ACTIVE' ||
          gameState === 'QUESTION_RESULT'
        }
        blackboardContent={trial ? (
          <DataDisplay values={trial.computedStats.sortedValues} />
        ) : undefined}
      >
        <AnimatePresence mode="wait">
          {/* ──── ENTER CLASS ──── */}
          {gameState === 'ENTER_CLASS' && (
            <motion.div
              key="enter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ fontSize: '48px' }}
              >
                🏫
              </motion.div>
              <p style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 600 }}>
                Memasuki ruang kelas...
              </p>
            </motion.div>
          )}

          {/* ──── MOVING TO SELECTION ──── */}
          {gameState === 'MOVING_TO_SELECTION' && (
            <motion.div
              key="moving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Candidate Status */}
              <CandidateStatus
                playerScore={0}
                candidate1Score={0}
                candidate2Score={0}
              />
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 600 }}
              >
                Menuju area seleksi...
              </motion.div>
            </motion.div>
          )}

          {/* ──── SELECTION PREPARATION ──── */}
          {gameState === 'SELECTION_PREPARATION' && (
            <motion.div
              key="prep"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                padding: '20px',
              }}
            >
              <CandidateStatus
                playerScore={0}
                candidate1Score={0}
                candidate2Score={0}
              />

              <div className="game-card" style={{
                maxWidth: '560px',
                width: '100%',
                padding: '24px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '1.5px',
                  color: '#00ADB5',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                }}>
                  📋 PERSIAPAN SELEKSI
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>
                  Data Sudah Tersedia di Papan Tulis
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#94A3B8', lineHeight: 1.6 }}>
                  Seleksi terdiri dari <strong style={{ color: '#F8FAFC' }}>4 pertanyaan</strong> statistika.
                  Setiap pertanyaan memiliki batas waktu <strong style={{ color: '#FBBF24' }}>60 detik</strong>.
                  DiRA akan menjelaskan materi sebelum setiap soal.
                </p>
                <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#94A3B8', lineHeight: 1.6 }}>
                  Kamu harus menjawab <strong style={{ color: '#10B981' }}>keempat pertanyaan dengan benar</strong> untuk terpilih menjadi perwakilan sekolah.
                </p>
                <motion.button
                  className="game-btn game-btn-primary"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePreparationNext}
                  style={{
                    padding: '12px 28px',
                    fontSize: '14px',
                    fontWeight: 800,
                    borderRadius: '12px',
                  }}
                >
                  Siap, Mulai Seleksi! →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ──── QUESTION ACTIVE ──── */}
          {gameState === 'QUESTION_ACTIVE' && trial && currentQuestion && (
            <motion.div
              key={`q-${currentQuestion.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '16px',
              }}
            >
              <QuizPanel
                question={currentQuestion}
                questionIndex={trial.currentQuestionIndex}
                dataValues={trial.computedStats.sortedValues}
                onSubmitAnswer={handleAnswerSubmit}
              />
            </motion.div>
          )}

          {/* ──── QUESTION RESULT (brief flash) ──── */}
          {gameState === 'QUESTION_RESULT' && trial && (
            <motion.div
              key="qresult"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {trial.results.length > 0 && (() => {
                const lastResult = trial.results[trial.results.length - 1]
                return (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      style={{ fontSize: '64px' }}
                    >
                      {lastResult.isCorrect ? '✅' : lastResult.isTimeout ? '⏱️' : '❌'}
                    </motion.div>
                    <p style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: lastResult.isCorrect ? '#10B981' : '#EF4444',
                    }}>
                      {lastResult.isCorrect ? 'Benar!' : lastResult.isTimeout ? 'Waktu Habis!' : 'Salah!'}
                    </p>
                    <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                      {trial.currentQuestionIndex < TOTAL_QUESTIONS
                        ? 'Melanjutkan ke soal berikutnya...'
                        : 'Menghitung hasil akhir...'
                      }
                    </p>
                  </>
                )
              })()}
            </motion.div>
          )}

          {/* ──── LEAVING CLASS ──── */}
          {gameState === 'LEAVING_CLASS' && (
            <motion.div
              key="leaving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <motion.div
                animate={{ x: [0, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ fontSize: '40px' }}
              >
                🚶
              </motion.div>
              <p style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 600 }}>
                Meninggalkan ruang kelas...
              </p>
            </motion.div>
          )}

          {/* ──── RETURNING TO CLASS ──── */}
          {gameState === 'RETURNING_TO_CLASS' && (
            <motion.div
              key="returning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ fontSize: '48px' }}>🚪</div>
              <p style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 600, textAlign: 'center' }}>
                Kamu berada di luar kelas.<br />Apakah kamu ingin masuk kembali?
              </p>
              <motion.button
                className="game-btn game-btn-primary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReturnToClass}
                style={{
                  padding: '12px 28px',
                  fontSize: '14px',
                  fontWeight: 800,
                  borderRadius: '12px',
                }}
              >
                🏫 Masuk Kelas Kembali
              </motion.button>
            </motion.div>
          )}

          {/* ──── SUCCESS ──── */}
          {gameState === 'SUCCESS' && trial && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
                padding: '16px 0',
              }}
            >
              <ResultsPanel
                results={trial.results}
                playerScore={trial.playerScore}
                candidate1Score={trial.candidate1Score}
                candidate2Score={trial.candidate2Score}
                isPassed={true}
                onRetry={handleRetry}
                onContinue={handleContinue}
              />
            </motion.div>
          )}

          {/* ──── FAILURE ──── */}
          {gameState === 'FAILURE' && trial && (
            <motion.div
              key="failure"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
                padding: '16px 0',
              }}
            >
              <ResultsPanel
                results={trial.results}
                playerScore={trial.playerScore}
                candidate1Score={trial.candidate1Score}
                candidate2Score={trial.candidate2Score}
                isPassed={false}
                onRetry={handleRetry}
                onContinue={handleContinue}
              />
            </motion.div>
          )}

          {/* ──── RETRY TRANSITION ──── */}
          {gameState === 'RETRY' && (
            <motion.div
              key="retry"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ fontSize: '40px' }}
              >
                🔄
              </motion.div>
              <p style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 600 }}>
                Menyiapkan percobaan baru...
              </p>
            </motion.div>
          )}

          {/* ──── TEACHER ANNOUNCEMENT / generic dialog state ──── */}
          {(gameState === 'TEACHER_ANNOUNCEMENT' || gameState === 'CHOICE_PENDING') && !currentDialog && !showDiraEncouragement && gameState === 'CHOICE_PENDING' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          )}
        </AnimatePresence>
      </ClassroomScene>

      {/* ── OVERLAY LAYERS ────────────────────── */}

      {/* Teacher Dialog Overlay */}
      <AnimatePresence>
        {currentDialog && currentDialog.speaker === 'teacher' && gameState === 'TEACHER_ANNOUNCEMENT' && (
          <TeacherDialog
            dialog={currentDialog}
            onNext={handleDialogNext}
            isLast={dialogIndex === TEACHER_ANNOUNCEMENT_DIALOGS.length - 1 && gameState === 'TEACHER_ANNOUNCEMENT'}
          />
        )}
      </AnimatePresence>

      {/* Teacher dialog during moving (auto-dismiss) */}
      <AnimatePresence>
        {currentDialog && gameState === 'MOVING_TO_SELECTION' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '24px',
              right: '24px',
              zIndex: 501,
              maxWidth: '600px',
              margin: '0 auto',
              padding: '16px 20px',
              background: 'rgba(10, 20, 18, 0.95)',
              border: '2px solid rgba(251, 191, 36, 0.35)',
              borderRadius: '14px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <span>👨‍🏫</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#FBBF24' }}>{TEACHER_NAME}</span>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#F8FAFC', lineHeight: 1.5 }}>
              {currentDialog.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection preparation teacher dialog */}
      <AnimatePresence>
        {currentDialog && gameState === 'SELECTION_PREPARATION' && currentDialog.speaker === 'teacher' && (
          <TeacherDialog
            dialog={currentDialog}
            onNext={handleTeacherIntroNext}
          />
        )}
      </AnimatePresence>

      {/* DiRA data explain auto-dismiss / tap-to-dismiss */}
      <AnimatePresence>
        {currentDialog && currentDialog.speaker === 'dira' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => setCurrentDialog(null)}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '24px',
              right: '24px',
              zIndex: 501,
              maxWidth: '600px',
              margin: '0 auto',
              padding: '16px 20px',
              background: 'rgba(10, 20, 18, 0.95)',
              border: '2px solid rgba(14, 131, 136, 0.4)',
              borderRadius: '14px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #00ADB5',
              flexShrink: 0,
            }}>
              <img
                src="/dira-avatar.webp"
                alt="DiRA"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#F8FAFC', lineHeight: 1.5 }}>
                {currentDialog.text}
              </p>
              <span style={{ fontSize: '11px', color: '#00ADB5', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                (Ketuk untuk lanjut)
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DiRA encouragement overlay */}
      <AnimatePresence>
        {showDiraEncouragement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 500,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{
                maxWidth: '700px',
                width: '100%',
                padding: '20px 24px',
                background: 'rgba(10, 20, 18, 0.95)',
                border: '2px solid rgba(14, 131, 136, 0.4)',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid #00ADB5',
                  flexShrink: 0,
                }}>
                  <img
                    src="/dira-avatar.webp"
                    alt="DiRA"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#00ADB5', letterSpacing: '1px' }}>ASISTEN DiRA</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#F8FAFC', lineHeight: 1.65 }}>
                {DIRA_ENCOURAGEMENT.text}
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(14, 131, 136, 0.15)', paddingTop: '10px' }}>
                <motion.button
                  className="game-btn game-btn-primary"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDiraEncouragementDismiss}
                  style={{ fontSize: '13px', padding: '8px 22px', borderRadius: '7px', fontWeight: 800 }}
                >
                  Paham, lanjut! →
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Choice panel */}
      <AnimatePresence>
        {gameState === 'CHOICE_PENDING' && (
          <ChoicePanel
            onAccept={handleAccept}
            onDecline={handleDecline}
            disabled={isTransitioning}
          />
        )}
      </AnimatePresence>

      {/* DiRA Learning Panel */}
      <AnimatePresence>
        {showDiraPanel && gameState === 'DIRA_EXPLANATION' && trial && currentMaterial && (
          <DiraLearningPanel
            material={currentMaterial}
            stats={trial.computedStats}
            questionNumber={trial.currentQuestionIndex + 1}
            totalQuestions={TOTAL_QUESTIONS}
            onComplete={handleDiraLearningComplete}
          />
        )}
      </AnimatePresence>

      {/* Badge unlock popup queue */}
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
