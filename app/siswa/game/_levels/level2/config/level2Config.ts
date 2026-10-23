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
  | 'HALLWAY_EXPLORATION'
  | 'CLASSROOM_PROLOGUE'
  | 'TRANSITION_TO_FIELD'
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
  | 'KETUA_KELAS_ENTRANCE'
  | 'KETUA_KELAS_SORTING'
  | 'SORTING_SUCCESS_ANIMATION'
  | 'MISSION_RANGE'
  | 'MISSION_QUARTILES'
  | 'MISSION_IQR'
  | 'MISSION_QD'
  | 'FINAL_EVALUATION'
  | 'FINAL_REPORT'
  | 'LEVEL_COMPLETE'

// ──────────────────────────────────────────────────────
// MISSION SUB-STATES
// ──────────────────────────────────────────────────────

export type MissionSortPhase = 'GATHERING_FLAGS' | 'SORTING_GAME' | 'ANIMATING_SUCCESS' | 'COMPLETE'
export type MissionRangePhase = 'SELECT_FLAGS' | 'CALCULATE_RANGE' | 'COMPLETE'
export type MissionQuartilePhase = 'PLACE_POSTS' | 'FILL_VALUES' | 'COMPLETE'
export type MissionIQRPhase = 'PLACE_RIBBON' | 'CALCULATE_IQR' | 'CONCEPT_QUIZ' | 'COMPLETE'
export type MissionQDPhase = 'CALCULATE_QD' | 'CONCEPT_QUIZ' | 'COMPLETE'

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
  missionId: 0 | 1 | 2 | 3 | 4 // 0=Sorting, 1=Range, 2=Quartiles, 3=IQR, 4=QD
  completed: boolean
  hintLevelUsed: HintLevel     // highest hint level used
  objectErrors: number         // wrong flag/post selections
  answerErrors: number         // wrong numeric answers
  firstAttemptCorrect: boolean // all answers correct on first try
}

export interface SessionScoring {
  missions: MissionScoring[]
  stars: 0 | 1 | 2 | 3        // 0 = not yet computed
}

export function createInitialScoring(): SessionScoring {
  return {
    missions: [
      { missionId: 0, completed: false, hintLevelUsed: 0, objectErrors: 0, answerErrors: 0, firstAttemptCorrect: true },
      { missionId: 1, completed: false, hintLevelUsed: 0, objectErrors: 0, answerErrors: 0, firstAttemptCorrect: true },
      { missionId: 2, completed: false, hintLevelUsed: 0, objectErrors: 0, answerErrors: 0, firstAttemptCorrect: true },
      { missionId: 3, completed: false, hintLevelUsed: 0, objectErrors: 0, answerErrors: 0, firstAttemptCorrect: true },
      { missionId: 4, completed: false, hintLevelUsed: 0, objectErrors: 0, answerErrors: 0, firstAttemptCorrect: true },
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
  if (maxHint <= 1 && totalObjectErrors + totalAnswerErrors <= 4) {
    return 2
  }
  
  // 1 star: Completed with any amount of help
  return 1
}

// ──────────────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────────────

export const TEACHER_NAME = 'Pak Bambang'

// ──────────────────────────────────────────────────────
// AUDIO SYNTH HELPER
// ──────────────────────────────────────────────────────
export function playSound(type: 'chime' | 'throw' | 'whistle' | 'error' | 'pop') {
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
export const TOTAL_STUDENTS = 10

// ──────────────────────────────────────────────────────
// DIALOG SEQUENCES
// ──────────────────────────────────────────────────────

export const CLASSROOM_DIALOGS: DialogLine[] = [
  {
    speaker: 'teacher',
    speakerName: TEACHER_NAME,
    text: 'Selamat siang anak-anak kelas VII-B! Sebelum kita berpanas-panasan, Bapak mau tanya dulu nih. Masih ingat kan materi mean (rata-rata) yang kemarin kita bahas?',
  },
  {
    speaker: 'player',
    speakerName: 'Stevunt',
    text: 'Masih ingat, Pak! Rata-rata itu jumlah seluruh nilai data dibagi dengan banyaknya data!',
  },
  {
    speaker: 'teacher',
    speakerName: TEACHER_NAME,
    text: 'Tepat! Nah, sekarang coba bayangkan: ada dua tim atlet lempar lembing, Tim Garuda dan Tim Rajawali. Keduanya punya rata-rata lemparan yang sama persis, yaitu 20 meter. Menurut kalian, apakah kemampuan kedua tim itu sama?',
  },
  {
    speaker: 'player',
    speakerName: 'Stevunt',
    text: 'Hmm... kalau rata-ratanya sama-sama 20 meter, mestinya kekuatan dan performanya seimbang dong, Pak?',
  },
  {
    speaker: 'teacher',
    speakerName: TEACHER_NAME,
    text: 'Hahaha, belum tentu! Di Tim Garuda, semua atletnya konsisten melempar di kisaran 19 sampai 21 meter. Tapi di Tim Rajawali, ada yang cuma sanggup lempar 6 meter, dan ada yang melesat sampai 34 meter! Tingkat kestabilan dan sebaran nilainya sangat berbeda.',
  },
  {
    speaker: 'teacher',
    speakerName: TEACHER_NAME,
    text: 'Untuk melihat seberapa menyebar atau konsistennya data, kita membutuhkan Ukuran Penyebaran Data: Jangkauan (Range), Tiga Kuartil (Q1, Q2, Q3), Jangkauan Kuartil (IQR), dan Simpangan Kuartil (Qd)!',
  },
  {
    speaker: 'player',
    speakerName: 'Stevunt',
    text: 'Wah, masuk akal sekali, Pak! Jadi kita harus tahu lemparan terdekat, terjauh, dan sebaran 50% data di bagian tengahnya ya?',
  },
  {
    speaker: 'teacher',
    speakerName: TEACHER_NAME,
    text: 'Persis, Stevunt! Nah, daripada cuma mencatat rumus di papan tulis yang bikin ngantuk, bagaimana kalau kita langsung buktikan dengan lemparan kelas kita sendiri di lapangan?',
  },
  {
    speaker: 'player',
    speakerName: 'Stevunt',
    text: 'Setuju banget, Pak! Praktik langsung pasti jauh lebih seru dan nyata!',
  },
  {
    speaker: 'teacher',
    speakerName: TEACHER_NAME,
    text: 'Mantap! Ayo rapikan buku kalian, ganti sepatu olahraga, dan bawa meteran lapangan. Kita kumpul di lapangan sekolah sekarang juga! 🏃‍♂️💨',
  },
]

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
    text: 'Bapak butuh bantuanmu mencatat dan mengukur jarak lemparan dari 10 siswa yang akan melempar satu per satu menggunakan meteran lapangan.',
  },
  {
    speaker: 'player',
    speakerName: 'Stevunt',
    text: 'Siap Pak! Setelah ke-10 data terkumpul, apa misi statistika yang harus kita selesaikan?',
  },
  {
    speaker: 'teacher',
    speakerName: TEACHER_NAME,
    text: 'Kita akan menganalisis data asli lapangan tersebut: menemukan Jangkauan (Range), membagi Kuartil (Q1, Q2, Q3), serta menghitung Jangkauan Interkuartil (IQR)!',
  },
  {
    speaker: 'teacher',
    speakerName: TEACHER_NAME,
    text: 'Bagus sekali! Sekarang, tiup peluit dan ajak 10 siswa berkumpul di pinggir lapangan untuk mulai melempar!',
  },
]

export const DIRA_BRIEFING: DialogLine = {
  speaker: 'dira',
  speakerName: 'DiRA',
  text: 'Aku akan membantumu mengumpulkan data dan menyelesaikan setiap misi. Perhatikan posisi bendera dan catat hasil pengukuran dengan teliti, karena semua jawaban nanti dihitung dari data yang kamu kumpulkan sendiri!',
}

export const KETUA_KELAS_NAME = 'Aditya (Ketua Kelas)'

export const DATA_COMPLETE_DIALOG: DialogLine = {
  speaker: 'system',
  speakerName: 'Sistem',
  text: '🔔 Semua 10 bola lemparan telah mendarat di lapangan! Mari cari jangkauan lemparan terdekat dan terjauh.',
}

export const MISSION1_INTRO: DialogLine = {
  speaker: 'teacher',
  speakerName: TEACHER_NAME,
  text: 'Misi 1: Jangkauan (Range)! Gerakkan karaktermu menuju bendera terdekat lalu bawa ke Kotak Min di atas. Setelah itu, ambil bendera terjauh dan masukkan ke Kotak Max!',
}

export const KETUA_KELAS_CALL_DIALOG: DialogLine = {
  speaker: 'teacher',
  speakerName: TEACHER_NAME,
  text: 'Bagus sekali! Jangkauan lemparan telah didapat. Sekarang, sebelum kita mencari Kuartil dan Median, kita harus merapikan dan mengurutkan seluruh 10 bendera ke dalam Kotak 1 s/d 10 di bagian atas lapangan dari nilai terkecil ke terbesar!',
}

export const KETUA_KELAS_SORT_INTRO: DialogLine = {
  speaker: 'player',
  speakerName: 'Stevunt',
  text: 'Siap, Pak Bambang! Saya akan dekati bendera di lapangan, tekan [SPASI] untuk mengambilnya, lalu bawa dan masukkan ke kotak-kotak di bagian atas secara terurut!',
}

export const SORTING_SUCCESS_DIALOG: DialogLine = {
  speaker: 'dira',
  speakerName: 'DiRA',
  text: '🎉 Luar biasa! Seluruh 10 bendera berhasil dimasukkan ke kotak di atas dengan terurut dari nilai terkecil hingga terbesar! Data siap dianalisis untuk Kuartil.',
}

export const MISSION2_INTRO: DialogLine = {
  speaker: 'teacher',
  speakerName: TEACHER_NAME,
  text: 'Misi 2: Kuartil (Q1, Q2, Q3)! Seluruh 10 bendera kini berbaris sejajar di tengah lapangan. Gerakkan Stevunt untuk menentukan letak Tiang Q1, Q2 (Median), dan Q3!',
}

export const MISSION3_INTRO: DialogLine = {
  speaker: 'dira',
  speakerName: 'DiRA',
  text: 'Misi 3: Jangkauan Kuartil (IQR)! Pasang pita merah dari tiang Q1 ke Q3, lalu cari rentang 50% data di bagian tengah!',
}

export const MISSION4_QD_INTRO: DialogLine = {
  speaker: 'teacher',
  speakerName: TEACHER_NAME,
  text: 'Misi 4: Simpangan Kuartil (Qd)! Simpangan kuartil bernilai setengah dari jangkauan kuartil: Qd = ½(Q3 − Q1). Mari kita hitung nilainya!',
}

// ──────────────────────────────────────────────────────
// FINAL REPORT NARRATIVE
// ──────────────────────────────────────────────────────

export function generateReportNarrative(stats: {
  min: number; max: number; range: number;
  q1: number; q2: number; q3: number; iqr: number; qd?: number;
  }): string {
  const qdVal = stats.qd !== undefined ? stats.qd : parseFloat(((stats.q3 - stats.q1) / 2).toFixed(1))
  return `Kamu berhasil mengumpulkan 10 data lemparan. Lemparan terpendek adalah ${stats.min.toFixed(0)} meter dan terjauh adalah ${stats.max.toFixed(0)} meter. Jangkauannya sebesar ${stats.range.toFixed(0)} meter. Setelah semua data diurutkan ke dalam kotak, diperoleh Q1 = ${stats.q1.toFixed(0)} meter, Q2 (Median) = ${stats.q2.toFixed(1)} meter, dan Q3 = ${stats.q3.toFixed(0)} meter. Jangkauan kuartilnya (IQR = Q3 − Q1) sebesar ${stats.iqr.toFixed(1)} meter, serta Simpangan Kuartilnya (Qd = ½(Q3 − Q1)) sebesar ${qdVal} meter.`
}

export function getDiraClosing(stars: number): string {
  if (stars === 3) {
    return 'Sempurna! Kamu menyelesaikan semua misi: Jangkauan, Tiga Kuartil, Jangkauan Kuartil, dan Simpangan Kuartil dengan tepat!'
  }
  if (stars === 2) {
    return 'Bagus sekali! Kamu memahami cara menghitung jangkauan, kuartil, dan simpangan kuartil dengan baik.'
  }
  return 'Kerja bagus! Kamu sudah menyelesaikan semua misi ukuran penyebaran data. Ingat, statistika membantu kita membaca pola penyebaran data nyata. Terus berlatih!'
}
