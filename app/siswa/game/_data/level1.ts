// Level 1 — "Kasus: Postingan Viral Screen Time"

export const LEVEL1_CONFIG = {
  id: 1,
  title: 'Kasus: Postingan Viral Screen Time',
  subtitle: 'Digital Truth Squad Investigation',
  description: 'Sebuah postingan viral mengklaim remaja Indonesia rata-rata >8 jam/hari di media sosial. Tugasmu: selidiki kebenarannya menggunakan statistika.',
}

// Raw dataset: screen time (jam/hari) dari 35 siswa — diacak agar menantang
export const screenTimeData = [4, 3, 5, 2, 1, 16, 4, 3, 6, 2, 5, 4, 3, 11, 4,
  2, 3, 5, 1, 4, 3, 7, 5, 4, 2, 3, 6, 4, 3, 5, 2, 4, 8, 3, 4]

// Interval classes: width = 4 (1-4, 5-8, 9-12, 13-16)
// Frequencies: [1-4]:25, [5-8]:8, [9-12]:1, [13-16]:1
export const CLASS_LABELS = ['1 – 4', '5 – 8', '9 – 12', '13 – 16']

export function getClassIndex(val: number): number {
  if (val >= 1 && val <= 4) return 0
  if (val >= 5 && val <= 8) return 1
  if (val >= 9 && val <= 12) return 2
  if (val >= 13 && val <= 16) return 3
  return -1
}

// Computed statistics
const total = screenTimeData.reduce((a, b) => a + b, 0)
const sorted = [...screenTimeData].sort((a, b) => a - b)
const median = sorted.length % 2 === 0
  ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
  : sorted[Math.floor(sorted.length / 2)]

export const STATS = {
  n: 35,
  min: 1,
  max: 16,
  range: 15,
  mean: Number((total / 35).toFixed(2)), // ~4.23
  median,
  numClasses: 4,
  classWidth: 4,
}

// Correct answer: frequency distribution table
export const CORRECT_TABLE = [
  { kelas: '1 – 4',   f: 25, fRel: 71.4, fKum: 25 },
  { kelas: '5 – 8',   f: 8,  fRel: 22.9, fKum: 33 },
  { kelas: '9 – 12',  f: 1,  fRel: 2.9,  fKum: 34 },
  { kelas: '13 – 16', f: 1,  fRel: 2.9,  fKum: 35 },
]

// Bar heights as percentage of max frequency (25)
export const HISTOGRAM_BARS = CORRECT_TABLE.map(row => ({
  label: row.kelas,
  f: row.f,
  heightPct: Math.round((row.f / 25) * 100),
}))

// Correct verdict
export const CORRECT_VERDICT = 'MISLEADING'

// Verdict explanation
export const VERDICT_EXPLANATION = `Rata-rata screen time dari 35 siswa adalah <strong>${STATS.mean} jam/hari</strong> — jauh di bawah klaim "lebih dari 8 jam". Mayoritas siswa (<strong>25 dari 35 siswa atau 71.4%</strong>) hanya bermain medsos <strong>1–4 jam/hari</strong>. Hanya 2 siswa (yang punya screen time 11 dan 16 jam) yang jauh di atas rata-rata — ini disebut <strong>outlier/pencilan</strong>. Distribusi data menunjukkan pola <strong>skewed kanan (menceng kanan)</strong> karena data menumpuk di kiri dan ada ekor panjang ke kanan. Klaim tersebut bersifat <strong>MISLEADING</strong> karena menggeneralisasi dari data ekstrem yang tidak mewakili mayoritas.`

// Keyword checker for FI text analysis (Tahap B)
export const CRITICAL_KEYWORDS_POSITIVE = [
  'tidak valid', 'tidak benar', 'salah', 'misleading', 'tidak didukung',
  'tidak terbukti', 'hoaks', 'menyesatkan',
]
export const CRITICAL_KEYWORDS_EVIDENCE = [
  'mayoritas', 'outlier', 'pencilan', 'menceng', 'skewed', 'grafik', 'distribusi',
  'histogram', '25', '71', 'kiri', 'ekor', 'ekstrem', 'data',
]

// FD: Multiple choice questions for Tahap B
export const FD_MC_QUESTIONS = [
  {
    id: 'mc1',
    question: 'Berdasarkan histogram, kelas interval dengan frekuensi TERTINGGI adalah?',
    options: ['1 – 4 jam (f = 25)', '5 – 8 jam (f = 8)', '9 – 12 jam (f = 1)', '13 – 16 jam (f = 1)'],
    correct: 0,
    hint: 'Lihat batang mana yang paling tinggi di histogram yang baru kamu buat!',
  },
  {
    id: 'mc2',
    question: 'Berapa persen siswa yang memiliki screen time di ATAS 8 jam/hari?',
    options: ['71.4%', '22.9%', '5.7%', '2.9%'],
    correct: 2,
    hint: 'Siswa dengan screen time >8 jam: yang masuk kelas 9-12 (1 siswa) + kelas 13-16 (1 siswa) = 2 siswa. 2/35 × 100% ≈ 5.7%',
  },
  {
    id: 'mc3',
    question: 'Pola distribusi data screen time ini berbentuk...',
    options: ['Simetris / Normal', 'Skewed kiri (menceng kiri)', 'Skewed kanan (menceng kanan)', 'Uniform (merata)'],
    correct: 2,
    hint: 'Data menumpuk di nilai rendah (1-4) tapi ada "ekor" panjang ke nilai tinggi (11, 16). Ini ciri khas distribusi menceng kanan!',
  },
  {
    id: 'mc4',
    question: 'Apakah klaim "remaja rata-rata >8 jam/hari" didukung oleh data histogram ini?',
    options: [
      'Ya, karena ada siswa yang main 16 jam',
      'Tidak, karena mayoritas (71.4%) hanya 1-4 jam/hari',
      'Ya, karena mean = 8 jam',
      'Tidak bisa ditentukan dari histogram',
    ],
    correct: 1,
    hint: 'Lihat frekuensi kelas 1-4 jam: ada 25 siswa atau 71.4% dari total. Klaim ">8 jam rata-rata" jelas tidak sesuai fakta!',
  },
]

// Badges
export const BADGES = {
  DETECTIVE: { id: 'detective-histogram', icon: '🔍', name: 'Detektif Histogram',     desc: 'Menyelesaikan Level 1' },
  SPEED:     { id: 'speed-analyst',       icon: '⚡', name: 'Speed Analyst',           desc: 'Selesai < 50% waktu' },
  PERFECT:   { id: 'perfect-investigator',icon: '🎯', name: 'Perfect Investigator',    desc: '0 kesalahan' },
  CRITICAL:  { id: 'critical-thinker',    icon: '🧠', name: 'Critical Thinker',        desc: 'Analisis mendalam' },
  MYTHBUST:  { id: 'myth-buster',         icon: '💥', name: 'Myth Buster',             desc: 'Berhasil membongkar hoaks' },
}
