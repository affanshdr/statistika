// Level 1 — "Kasus: Video Viral yang Mencurigakan"

export const LEVEL1_CONFIG = {
  id: 1,
  title: 'Kasus: Video Viral yang Mencurigakan',
  subtitle: 'Digital Truth Squad Investigation',
  description: 'Sebuah video klaim viral di TikTok. Tugasmu: selidiki kebenarannya menggunakan statistika.',
}

// Raw dataset: jumlah share per jam selama 30 jam
export const shareData = [
  12, 45, 67, 23, 89, 34, 56, 78, 90, 43,
  21, 65, 87, 32, 54, 76, 98, 41, 63, 85,
  19, 47, 69, 28, 72, 38, 59, 81, 94, 36,
]

// Computed statistics
export const STATS = {
  n: 30,
  min: 12,
  max: 98,
  range: 86,
  mean: Number((shareData.reduce((a, b) => a + b, 0) / 30).toFixed(1)), // 56.9
  median: 56.5,
  numClasses: 6,  // Sturges: 1 + 3.3 * log10(30) ≈ 5.87 → 6
  classWidth: 15,
}

// Correct answer: frequency distribution table
export const CORRECT_TABLE = [
  { kelas: '12 – 26',  f: 4, fRel: 13.3, fKum: 4  },
  { kelas: '27 – 41',  f: 6, fRel: 20.0, fKum: 10 },
  { kelas: '42 – 56',  f: 7, fRel: 23.3, fKum: 17 },
  { kelas: '57 – 71',  f: 6, fRel: 20.0, fKum: 23 },
  { kelas: '72 – 86',  f: 4, fRel: 13.3, fKum: 27 },
  { kelas: '87 – 101', f: 3, fRel: 10.0, fKum: 30 },
]

// Bar heights as percentage of max frequency (7)
export const HISTOGRAM_BARS = CORRECT_TABLE.map(row => ({
  label: row.kelas,
  f: row.f,
  heightPct: Math.round((row.f / 7) * 100),
}))

// Correct verdict
export const CORRECT_VERDICT = 'MISLEADING'

// Verdict explanation
export const VERDICT_EXPLANATION = `Data yang kamu analisis adalah jumlah <strong>share per jam</strong> — bukan data <strong>opini siswa</strong>. Banyaknya share tidak membuktikan bahwa 95% siswa setuju sekolah diliburkan. Ini adalah <strong>sampling bias</strong>: video viral ≠ survei representatif. Klaim tersebut bersifat MISLEADING karena menggunakan data yang tidak relevan untuk mendukung pernyataan statistik.`

// FI: keywords for critical analysis (step 5)
export const CRITICAL_KEYWORDS = [
  'distribusi', 'frekuensi', 'sampel', 'klaim',
  'tidak mewakili', 'misleading', 'tidak valid',
  'share', 'opini', 'bias',
]

// FD: Multiple choice questions (step 5)
export const FD_MC_QUESTIONS = [
  {
    id: 'mc1',
    question: 'Kelas interval dengan frekuensi tertinggi adalah?',
    options: ['12 – 26', '42 – 56', '72 – 86', '87 – 101'],
    correct: 1, // index 1 → '42 – 56'
  },
  {
    id: 'mc2',
    question: 'Berapa persen data yang berada di atas nilai 56?',
    options: ['33.3%', '43.3%', '50%', '56.7%'],
    correct: 1, // '43.3%' — frekuensi kumulatif di atas 57: 6+4+3 = 13 → 13/30 = 43.3%
  },
  {
    id: 'mc3',
    question: 'Pola distribusi data ini paling mendekati?',
    options: ['Skewed kiri', 'Skewed kanan', 'Simetris / Normal', 'Uniform'],
    correct: 2, // 'Simetris / Normal'
  },
]

// Badges
export const BADGES = {
  DETECTIVE: { id: 'detective-histogram', icon: '🔍', name: 'Detektif Histogram', desc: 'Menyelesaikan Level 1' },
  SPEED:     { id: 'speed-analyst',      icon: '⚡', name: 'Speed Analyst',      desc: 'Selesai < 50% waktu' },
  PERFECT:   { id: 'perfect-investigator', icon: '🎯', name: 'Perfect Investigator', desc: '0 kesalahan' },
  CRITICAL:  { id: 'critical-thinker',   icon: '🧠', name: 'Critical Thinker',   desc: 'Analisis mendalam' },
}
