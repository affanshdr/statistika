'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateRandomLevel1Data } from '@/app/siswa/game/_data/level1'

export interface XPBreakdown {
  step: number
  label: string
  xp: number
}

export interface GameStore {
  // Persistent game state
  currentLevel: number
  completedLevels: number[]   // levels fully completed by the student
  completedPostTests: number[] // post tests completed by the student
  xp: number
  lives: number
  badges: string[]

  // Team matching
  teamId: string | null

  // Level-specific state (reset between levels)
  level1Dataset: number[] | null
  currentStep: number
  answers: Record<string, unknown>
  timeRemaining: number
  isCompleted: boolean
  sessionStartTime: number | null
  xpBreakdown: XPBreakdown[]
  mistakeCount: number
  verdictAnswer: string | null

  // Actions
  setTeamId: (id: string | null) => void
  addXP: (amount: number, label?: string, step?: number) => void
  loseLife: () => void
  setStep: (step: number) => void
  setAnswer: (key: string, value: unknown) => void
  setTimeRemaining: (seconds: number) => void
  completeLevel: (levelId: number) => void
  completePostTest: (levelId: number) => void
  unlockBadge: (badgeId: string) => void
  setVerdict: (verdict: string) => void
  incrementMistake: () => void
  resetLevel: () => void
  startLevel: (levelId: number) => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      // Initial state
      teamId: null,
      currentLevel: 0,
      completedLevels: [],
      completedPostTests: [],
      xp: 0,
      lives: 3,
      badges: [],
      level1Dataset: null,
      currentStep: 0,
      answers: {},
      timeRemaining: 600,
      isCompleted: false,
      sessionStartTime: null,
      xpBreakdown: [],
      mistakeCount: 0,
      verdictAnswer: null,

      // Actions
      setTeamId: (id) => set({ teamId: id }),

      addXP: (amount, label = '', step = 0) =>
        set((state) => ({
          xp: state.xp + amount,
          xpBreakdown: [
            ...state.xpBreakdown,
            { step, label, xp: amount },
          ],
        })),

      loseLife: () =>
        set((state) => ({ lives: Math.max(0, state.lives - 1) })),

      setStep: (step) => set({ currentStep: step }),

      setAnswer: (key, value) =>
        set((state) => ({
          answers: { ...state.answers, [key]: value },
        })),

      setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),

      completeLevel: (levelId) =>
        set((state) => ({
          isCompleted: true,
          currentLevel: levelId,
          completedLevels: state.completedLevels.includes(levelId)
            ? state.completedLevels
            : [...state.completedLevels, levelId],
        })),

      completePostTest: (levelId) =>
        set((state) => ({
          completedPostTests: state.completedPostTests.includes(levelId)
            ? state.completedPostTests
            : [...state.completedPostTests, levelId],
        })),

      unlockBadge: (badgeId) =>
        set((state) => ({
          badges: state.badges.includes(badgeId)
            ? state.badges
            : [...state.badges, badgeId],
        })),

      setVerdict: (verdict) => set({ verdictAnswer: verdict }),

      incrementMistake: () =>
        set((state) => ({ mistakeCount: state.mistakeCount + 1 })),

      resetLevel: () =>
        set((state) => ({
          currentStep: 0,
          answers: {},
          lives: 3,
          timeRemaining: 600,
          isCompleted: false,
          sessionStartTime: null,
          xpBreakdown: [],
          mistakeCount: 0,
          verdictAnswer: null,
          level1Dataset: state.currentLevel === 1 ? generateRandomLevel1Data() : state.level1Dataset,
        })),

      startLevel: (levelId) => {
        set({
          currentLevel: levelId,
          teamId: null,
          currentStep: 0,
          answers: {},
          lives: 3,
          timeRemaining: 600,
          isCompleted: false,
          sessionStartTime: Date.now(),
          xpBreakdown: [],
          mistakeCount: 0,
          verdictAnswer: null,
          level1Dataset: levelId === 1 ? generateRandomLevel1Data() : null,
        })
      },
    }),
    {
      name: 'ar-cognistats-game',
      partialize: (state) => ({
        teamId: state.teamId,
        xp: state.xp,
        badges: state.badges,
        currentLevel: state.currentLevel,
        completedLevels: state.completedLevels,
        completedPostTests: state.completedPostTests,
        level1Dataset: state.level1Dataset,
        // level state (backup on refresh)
        currentStep: state.currentStep,
        answers: state.answers,
        lives: state.lives,
        timeRemaining: state.timeRemaining,
        isCompleted: state.isCompleted,
        sessionStartTime: state.sessionStartTime,
        xpBreakdown: state.xpBreakdown,
        mistakeCount: state.mistakeCount,
        verdictAnswer: state.verdictAnswer,
      }),
    }
  )
)
