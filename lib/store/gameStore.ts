'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface XPBreakdown {
  step: number
  label: string
  xp: number
}

export interface GameStore {
  // GEFT result (fetched from API on lobby entry)
  cognitiveStyle: 'FI' | 'FD' | null

  // Persistent game state
  currentLevel: number
  xp: number
  lives: number
  badges: string[]

  // Level-specific state (reset between levels)
  currentStep: number
  answers: Record<string, unknown>
  timeRemaining: number
  isCompleted: boolean
  sessionStartTime: number | null
  xpBreakdown: XPBreakdown[]
  mistakeCount: number
  verdictAnswer: string | null

  // Actions
  setCognitiveStyle: (style: 'FI' | 'FD') => void
  addXP: (amount: number, label?: string, step?: number) => void
  loseLife: () => void
  setStep: (step: number) => void
  setAnswer: (key: string, value: unknown) => void
  setTimeRemaining: (seconds: number) => void
  completeLevel: (levelId: number) => void
  unlockBadge: (badgeId: string) => void
  setVerdict: (verdict: string) => void
  incrementMistake: () => void
  resetLevel: () => void
  startLevel: (levelId: number, cognitiveStyle: 'FI' | 'FD') => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      cognitiveStyle: null,
      currentLevel: 0,
      xp: 0,
      lives: 3,
      badges: [],
      currentStep: 0,
      answers: {},
      timeRemaining: 600,
      isCompleted: false,
      sessionStartTime: null,
      xpBreakdown: [],
      mistakeCount: 0,
      verdictAnswer: null,

      // Actions
      setCognitiveStyle: (style) => set({ cognitiveStyle: style }),

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
        set({ isCompleted: true, currentLevel: levelId }),

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
        set({
          currentStep: 0,
          answers: {},
          isCompleted: false,
          sessionStartTime: null,
          xpBreakdown: [],
          mistakeCount: 0,
          verdictAnswer: null,
        }),

      startLevel: (levelId, cognitiveStyle) => {
        const isFD = cognitiveStyle === 'FD'
        set({
          currentLevel: levelId,
          cognitiveStyle,
          currentStep: 0,
          answers: {},
          lives: isFD ? 4 : 3,
          timeRemaining: isFD ? 900 : 600, // 15min FD, 10min FI
          isCompleted: false,
          sessionStartTime: Date.now(),
          xpBreakdown: [],
          mistakeCount: 0,
          verdictAnswer: null,
        })
      },
    }),
    {
      name: 'ar-cognistats-game',
      partialize: (state) => ({
        cognitiveStyle: state.cognitiveStyle,
        xp: state.xp,
        badges: state.badges,
        currentLevel: state.currentLevel,
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
