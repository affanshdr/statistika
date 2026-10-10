/**
 * Level 2 — State Machine Types & Configuration
 * 
 * Defines the game state machine, trial session, and all type definitions
 * for the classroom olympiad selection flow.
 */

import type { ComputedStats, QuestionConfig, DataSet } from '../data/level2StatData'

// ──────────────────────────────────────────────────────
// STATE MACHINE
// ──────────────────────────────────────────────────────

export type Level2State =
  | 'ENTER_CLASS'
  | 'TEACHER_ANNOUNCEMENT'
  | 'CHOICE_PENDING'
  | 'LEAVING_CLASS'
  | 'RETURNING_TO_CLASS'
  | 'MOVING_TO_SELECTION'
  | 'SELECTION_PREPARATION'
  | 'DIRA_EXPLANATION'
  | 'QUESTION_ACTIVE'
  | 'QUESTION_RESULT'
  | 'NEXT_QUESTION'
  | 'FINAL_EVALUATION'
  | 'SUCCESS'
  | 'FAILURE'
  | 'RETRY'

// ──────────────────────────────────────────────────────
// CHARACTER STATES
// ──────────────────────────────────────────────────────

export type CharacterState =
  | 'idle'
  | 'walking'
  | 'sitting'
  | 'standing'
  | 'talking'
  | 'answering'
  | 'correct_reaction'
  | 'incorrect_reaction'
  | 'leaving_classroom'

// ──────────────────────────────────────────────────────
// QUESTION RESULT
// ──────────────────────────────────────────────────────

export interface QuestionResult {
  questionId: number
  topic: string
  playerAnswer: string
  isCorrect: boolean
  isTimeout: boolean
  timeSpent: number // seconds used
}

// ──────────────────────────────────────────────────────
// TRIAL SESSION
// A single attempt at the selection process
// ──────────────────────────────────────────────────────

export interface TrialSession {
  id: string // unique trial ID
  dataSet: DataSet
  computedStats: ComputedStats
  questions: QuestionConfig[]
  currentQuestionIndex: number // 0-3
  results: QuestionResult[]
  playerScore: number
  candidate1Score: number
  candidate2Score: number
  isComplete: boolean
  isPassed: boolean // true only if 4/4
}

// ──────────────────────────────────────────────────────
// DIALOG SEQUENCES
// ──────────────────────────────────────────────────────

export interface DialogLine {
  speaker: 'teacher' | 'dira' | 'system'
  speakerName: string
  text: string
}

export const TEACHER_NAME = 'Pak Bambang'

export const TEACHER_ANNOUNCEMENT_DIALOGS: DialogLine[] = [
  {
    speaker: 'teacher',
    speakerName: TEACHER_NAME,
    text: 'Anak-anak, sekolah kita akan memilih satu siswa untuk menjadi perwakilan dalam olimpiade matematika tingkat kota!',
  },
  {
    speaker: 'teacher',
    speakerName: TEACHER_NAME,
    text: 'Seleksi kali ini akan menguji pemahaman kalian mengenai statistika, khususnya: Jangkauan, Kuartil, Jangkauan Kuartil, dan Simpangan Baku.',
  },
  {
    speaker: 'teacher',
    speakerName: TEACHER_NAME,
    text: 'Seleksi akan terdiri dari 4 pertanyaan, masing-masing dengan batas waktu 60 detik. Siapa yang bersedia mengikuti seleksi?',
  },
]

export const DIRA_ENCOURAGEMENT: DialogLine = {
  speaker: 'dira',
  speakerName: 'DiRA',
  text: 'Ayo, kamu punya kesempatan untuk menjadi perwakilan sekolah! Jangan khawatir jika materinya terasa sulit. Aku akan membantumu memahami konsep dan rumus yang diperlukan sebelum menjawab setiap pertanyaan.',
}

export const TEACHER_WILLING_RESPONSE: DialogLine = {
  speaker: 'teacher',
  speakerName: TEACHER_NAME,
  text: 'Bagus! Kamu bersedia mengikuti seleksi. Mari kita menuju area seleksi bersama kandidat lainnya.',
}

export const TEACHER_UNWILLING_RESPONSE: DialogLine = {
  speaker: 'teacher',
  speakerName: TEACHER_NAME,
  text: 'Baiklah, tidak apa-apa. Jika berubah pikiran, kamu bisa kembali ke kelas untuk mendaftar.',
}

export const TEACHER_DATA_INTRO: DialogLine = {
  speaker: 'teacher',
  speakerName: TEACHER_NAME,
  text: 'Perhatikan data berikut ini. Kalian bertiga akan menjawab 4 pertanyaan berdasarkan data yang sama.',
}

export const DIRA_DATA_EXPLAIN: DialogLine = {
  speaker: 'dira',
  speakerName: 'DiRA',
  text: 'Data di papan tulis ini akan digunakan untuk keempat soal seleksi. Perhatikan baik-baik setiap angkanya!',
}

// ──────────────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────────────

export const QUESTION_TIME_LIMIT = 60 // seconds
export const TOTAL_QUESTIONS = 4
