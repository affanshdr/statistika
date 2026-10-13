/**
 * Level 2 — State Machine & Configuration
 * 
 * Throw Measurement Activity on the school field.
 * Flow: Briefing → Collect 15 throws → Data Map → Mission 1 (Range) →
 *       Mission 2 (Quartiles) → Mission 3 (IQR) → Final Report
 */

// ──────────────────────────────────────────────────────
// STATE MACHINE
// ──────────────────────────────────────────────────────

export type Level2State =
  | 'LEVEL_START'
  | 'MEET_TEACHER'
  | 'BRIEFING'
  | 'GATHER_STUDENTS'
  | 'COLLECTING_DATA'
  | 'STUDENT_CALLED'
  | 'READY_TO_THROW'
  | 'THROW_IN_PROGRESS'
  | 'LOCATING_LANDING_POINT'
  | 'MEASURING_DISTANCE'
  | 'SAVING_MEASUREMENT'
  | 'DATA_COLLECTION_COMPLETE'
  | 'CAMERA_TRANSITION'
  | 'MISSION_RANGE'
  | 'MISSION_QUARTILES'
  | 'MISSION_IQR'
  | 'FINAL_REPORT'
  | 'LEVEL_COMPLETE'

// ──────────────────────────────────────────────────────
// MISSION SUB-STATES
// ──────────────────────────────────────────────────────

export type MissionRangePhase = 'SELECT_FLAGS' | 'CALCULATE_RANGE' | 'COMPLETE'
export type MissionQuartilePhase = 'SORT_STUDENTS' | 'PLACE_POSTS' | 'FILL_VALUES' | 'COMPLETE'
export type MissionIQRPhase = 'PLACE_RIBBON' | 'CALCULATE_IQR' | 'COMPLETE'

// ──────────────────────────────────────────────────────
// STUDENT STATUS
// ──────────────────────────────────────────────────────

export type StudentStatus = 'Menunggu' | 'Siap Melempar' | 'Selesai Diukur'

// ──────────────────────────────────────────────────────
// DIALOG TYPES
// ──────────────────────────────────────────────────────

export interface DialogLine {
  speaker: 'teacher' | 'player' | 'dira' | 'system'
  speakerName: string
  text: string
}

// ──────────────────────────────────────────────────────
// HINT LEVELS
// ──────────────────────────────────────────────────────

export type HintLevel = 0 | 1 | 2 | 3  // 0=none, 1=Arah, 2=Langkah, 3=Hitung Bersama
export const HINT_LABELS: Record<number, string> = {
  0: 'Tanpa Petunjuk',
  1: 'Arah',
  2: 'Langkah',
  3: 'Hitung Bersama',
}

// ──────────────────────────────────────────────────────
// SCORING TRACKING
// ──────────────────────────────────────────────────────

export interface MissionScoring {
  missionId: 1 | 2 | 3
  completed: boolean
  hintLevelUsed: HintLevel     // highest hint level used
  objectErrors: number         // wrong flag/post selections
  answerErrors: number         // wrong numeric answers
  firstAttemptCorrect: boolean // all answers correct on first try
}

export interface SessionScoring {
  missions: [MissionScoring, MissionScoring, MissionScoring]
  stars: 0 | 1 | 2 | 3        // 0 = not yet computed
}

export function createInitialScoring(): SessionScoring {
  return {
    missions: [
      { missionId: 1, completed: false, hintLevelUsed: 0, objectErrors: 0, answerErrors: 0, firstAttemptCorrect: true },
      { missionId: 2, completed: false, hintLevelUsed: 0, objectErrors: 0, answerErrors: 0, firstAttemptCorrect: true },
      { missionId: 3, completed: false, hintLevelUsed: 0, objectErrors: 0, answerErrors: 0, firstAttemptCorrect: true },
    ],
    stars: 0,
  }
}

/**
 * Calculate star rating:
 * 3 stars: All missions complete, no hints, all first attempts correct
 * 2 stars: All missions complete, only Arah hints or limited errors, no Hitung Bersama
 * 1 star: All missions complete with any level of help
 */
export function calculateStars(scoring: SessionScoring): 0 | 1 | 2 | 3 {
  const allComplete = scoring.missions.every(m => m.completed)
  if (!allComplete) return 0
  
  const maxHint = Math.max(...scoring.missions.map(m => m.hintLevelUsed))
  const totalObjectErrors = scoring.missions.reduce((sum, m) => sum + m.objectErrors, 0)
  const totalAnswerErrors = scoring.missions.reduce((sum, m) => sum + m.answerErrors, 0)
  const allFirstAttempt = scoring.missions.every(m => m.firstAttemptCorrect)
  
  // 3 stars: No hints, no errors
  if (maxHint === 0 && allFirstAttempt && totalObjectErrors === 0 && totalAnswerErrors === 0) {
    return 3
  }
  
  // 2 stars: Only Arah hints or limited errors, no Hitung Bersama
  if (maxHint <= 1 && totalObjectErrors + totalAnswerErrors <= 3) {
    return 2
  }
  
  // 1 star: Completed with any amount of help
  return 1
}

// ──────────────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────────────

export const TEACHER_NAME = 'Pak Bambang'
export const TOTAL_STUDENTS = 15

// ──────────────────────────────────────────────────────
// DIALOG SEQUENCES
// ──────────────────────────────────────────────────────

export const BRIEFING_DIALOGS: DialogLine[] = [
  {
    speaker: 'teacher',
    speakerName: TEACHER_NAME,
    text: 'Halo Stevunt! Selamat datang di lapangan sekolah. Sore ini cuaca sangat bagus untuk agenda pengukuran lemparan siswa kelas VII-B.',
  },
  {
    speaker: 'player',
    speakerName: 'Stevunt',
    text: 'Halo Pak Bambang! Senang bisa membantu. Apa tugas investigasi kita di lapangan hari ini, Pak?',
  },
  {
    speaker: 'teacher',
    speakerName: TEACHER_NAME,
    text: 'Bapak butuh bantuanmu mencatat dan mengukur jarak lemparan dari 15 siswa yang akan melempar satu per satu menggunakan meteran lapangan.',
  },
  {
    speaker: 'player',
    speakerName: 'Stevunt',
    text: 'Siap Pak! Setelah ke-15 data terkumpul, apa misi statistika yang harus kita selesaikan?',
  },
  {
    speaker: 'teacher',
    speakerName: TEACHER_NAME,
    text: 'Kita akan menganalisis data asli lapangan tersebut: menemukan Jangkauan (Range), membagi Kuartil (Q1, Q2, Q3), serta menghitung Jangkauan Interkuartil (IQR)!',
  },
  {
    speaker: 'dira',
    speakerName: 'DiRA',
    text: 'Hai Stevunt! Aku DiRA, asisten analitikmu. Aku akan memandumu memahami konsep dan memvalidasi setiap perhitunganmu!',
  },
  {
    speaker: 'teacher',
    speakerName: TEACHER_NAME,
    text: 'Bagus sekali! Sekarang, tiup peluit dan ajak 15 siswa berkumpul di pinggir lapangan untuk mulai melempar!',
  },
]

export const DIRA_BRIEFING: DialogLine = {
  speaker: 'dira',
  speakerName: 'DiRA',
  text: 'Aku akan membantumu mengumpulkan data dan menyelesaikan setiap misi. Perhatikan posisi bendera dan catat hasil pengukuran dengan teliti, karena semua jawaban nanti dihitung dari data yang kamu kumpulkan sendiri!',
}

export const DATA_COMPLETE_DIALOG: DialogLine = {
  speaker: 'system',
  speakerName: 'Sistem',
  text: '🔔 Semua 15 data lemparan telah terkumpul! Misi statistika akan segera dimulai.',
}

export const MISSION1_INTRO: DialogLine = {
  speaker: 'teacher',
  speakerName: TEACHER_NAME,
  text: 'Misi pertama! Temukan bendera dengan jarak terdekat dan terjauh, lalu hitung Jangkauan (Range) — yaitu selisih antara nilai terbesar dan terkecil.',
}

export const MISSION2_INTRO: DialogLine = {
  speaker: 'teacher',
  speakerName: TEACHER_NAME,
  text: 'Misi kedua! Urutkan 15 siswa berdasarkan jarak lemparannya, dari terdekat ke terjauh. Kemudian tentukan posisi Q1, Q2, dan Q3.',
}

export const MISSION3_INTRO: DialogLine = {
  speaker: 'teacher',
  speakerName: TEACHER_NAME,
  text: 'Misi terakhir! Pasang pita hijau dari tiang Q1 ke Q3 dan hitung Jangkauan Kuartil (IQR) — selisih antara kuartil atas dan kuartil bawah.',
}

// ──────────────────────────────────────────────────────
// FINAL REPORT NARRATIVE
// ──────────────────────────────────────────────────────

export function generateReportNarrative(stats: {
  min: number; max: number; range: number;
  q1: number; q2: number; q3: number; iqr: number;
}): string {
  return `Kamu berhasil mengumpulkan 15 data lemparan. Lemparan terpendek adalah ${stats.min.toFixed(2)} meter dan terjauh adalah ${stats.max.toFixed(2)} meter. Jangkauannya sebesar ${stats.range.toFixed(2)} meter, artinya selisih antara hasil terjauh dan terdekat adalah ${stats.range.toFixed(2)} meter. Setelah semua data diurutkan, Q1 adalah ${stats.q1.toFixed(2)} meter, Q2 adalah ${stats.q2.toFixed(2)} meter, dan Q3 adalah ${stats.q3.toFixed(2)} meter. Jangkauan kuartilnya sebesar ${stats.iqr.toFixed(2)} meter, yang menunjukkan jarak antara kuartil bawah dan kuartil atas.`
}

export function getDiraClosing(stars: number): string {
  if (stars === 3) {
    return 'Sempurna! Kamu menyelesaikan semua misi tanpa bantuan dan tanpa kesalahan. Kamu benar-benar memahami konsep statistika ini!'
  }
  if (stars === 2) {
    return 'Bagus sekali! Kamu berhasil mengumpulkan data sendiri dan memahami jangkauan, kuartil, serta jangkauan kuartil dengan baik.'
  }
  return 'Kerja bagus! Kamu sudah menyelesaikan semua misi. Ingat, statistika membantu kita memahami kumpulan data, bukan sekadar menghafal rumus. Terus berlatih!'
}
