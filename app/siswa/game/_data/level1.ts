// Level 1 — "Kasus: Postingan Viral Screen Time"

export const LEVEL1_CONFIG = {
  id: 1,
  title: 'Kasus: Postingan Viral Screen Time',
  subtitle: 'Digital Truth Squad Investigation',
  description: 'Sebuah postingan viral mengklaim remaja Indonesia rata-rata 8+ jam/hari di media sosial. Tugasmu: selidiki kebenarannya menggunakan statistika.',
}

// Raw dataset: screen time (jam/hari) dari 10 siswa
// Verified frequencies: [3.5–4.4]:2, [4.5–5.4]:2, [5.5–6.4]:3, [6.5–7.4]:1, [7.5–8.4]:1, [8.5–9.4]:1
export const screenTimeData = [
  5.8, 4.5, 6.4, 3.7, 7.2, 5.1, 4.0, 6.1, 7.7, 8.8
]

// Computed statistics
export const STATS = {
  n: 10,
  min: 3.7,
  max: 8.8,
  range: 5.1,
  mean: Number((screenTimeData.reduce((a, b) => a + b, 0) / 10).toFixed(2)), // 5.93
  median: 5.95,
  numClasses: 6,
  classWidth: 1.0,
}

// Correct answer: frequency distribution table
export const CORRECT_TABLE = [
  { kelas: '3.5 – 4.4', f: 2,  fRel: 20.0, fKum: 2  },
  { kelas: '4.5 – 5.4', f: 2,  fRel: 20.0, fKum: 4  },
  { kelas: '5.5 – 6.4', f: 3,  fRel: 30.0, fKum: 7  },
  { kelas: '6.5 – 7.4', f: 1,  fRel: 10.0, fKum: 8  },
  { kelas: '7.5 – 8.4', f: 1,  fRel: 10.0, fKum: 9  },
  { kelas: '8.5 – 9.4', f: 1,  fRel: 10.0, fKum: 10 },
]

// Bar heights as percentage of max frequency (3)
export const HISTOGRAM_BARS = CORRECT_TABLE.map(row => ({
  label: row.kelas,
  f: row.f,
  heightPct: Math.round((row.f / 3) * 100),
}))

// Correct verdict
export const CORRECT_VERDICT = 'MISLEADING'

// Verdict explanation
export const VERDICT_EXPLANATION = `Rata-rata screen time dari 10 siswa adalah <strong>5.93 jam/hari</strong> — jauh di bawah klaim "lebih dari 8 jam". Hanya <strong>1 dari 10 siswa (10.0%)</strong> yang memiliki screen time ≥ 8 jam. Distribusi data menunjukkan pola <strong>skewed kanan</strong> dengan puncak di kelas 5.5–6.4 jam. Klaim tersebut bersifat <strong>MISLEADING</strong> karena menggeneralisasi dari angka yang tidak sesuai dengan rata-rata sebenarnya — ini adalah bentuk <strong>generalisasi berlebihan</strong>.`

// FI: keywords for critical analysis (step 5)
export const CRITICAL_KEYWORDS = [
  'distribusi', 'frekuensi', 'mean', 'rata-rata', 'klaim',
  'tidak mewakili', 'misleading', 'tidak valid',
  'screen time', 'generalisasi', 'bias', 'data',
]

// FD: Multiple choice questions (step 5)
export const FD_MC_QUESTIONS = [
  {
    id: 'mc1',
    question: 'Kelas interval dengan frekuensi tertinggi adalah?',
    options: ['3.5 – 4.4', '4.5 – 5.4', '5.5 – 6.4', '6.5 – 7.4'],
    correct: 2, // '5.5 – 6.4', f=3
  },
  {
    id: 'mc2',
    question: 'Berapa persen siswa yang memiliki screen time di atas 6.4 jam?',
    options: ['17.5%', '20.0%', '25.0%', '30.0%'],
    correct: 3, // kelas 6.5+ → f: 1+1+1 = 3 → 3/10 × 100 = 30.0%
  },
  {
    id: 'mc3',
    question: 'Pola distribusi data screen time ini paling mendekati?',
    options: ['Skewed kiri', 'Skewed kanan', 'Simetris / Normal', 'Uniform'],
    correct: 1, // 'Skewed kanan'
  },
]

// Badges
export const BADGES = {
  DETECTIVE: { id: 'detective-histogram', icon: '🔍', name: 'Detektif Histogram',    desc: 'Menyelesaikan Level 1' },
  SPEED:     { id: 'speed-analyst',       icon: '⚡', name: 'Speed Analyst',          desc: 'Selesai < 50% waktu' },
  PERFECT:   { id: 'perfect-investigator',icon: '🎯', name: 'Perfect Investigator',   desc: '0 kesalahan' },
  CRITICAL:  { id: 'critical-thinker',    icon: '🧠', name: 'Critical Thinker',       desc: 'Analisis mendalam' },
}
