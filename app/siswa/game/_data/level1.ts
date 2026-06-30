export const LEVEL1_CONFIG = {
  id: 1,
  title: 'Level 1 (The Viral Myth)',
  subtitle: '',
  description: 'Sebuah postingan viral mengklaim remaja Indonesia rata-rata >8 jam/hari di media sosial. Tugasmu: selidiki kebenarannya menggunakan statistika.',
}

// Raw dataset: screen time (jam/hari) dari 35 siswa — diacak agar menantang
export const screenTimeData = [1, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 7, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

// Interval classes: width = 3 (1-3, 4-6, 7-9, 10-12, 13-15, 16-18)
export const CLASS_LABELS = ['1 – 3', '4 – 6', '7 – 9', '10 – 12', '13 – 15', '16 – 18']

export function getClassIndex(val: number): number {
  if (val >= 1  && val <= 3)  return 0
  if (val >= 4  && val <= 6)  return 1
  if (val >= 7  && val <= 9)  return 2
  if (val >= 10 && val <= 12) return 3
  if (val >= 13 && val <= 15) return 4
  if (val >= 16 && val <= 18) return 5
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
  max: 18,
  range: 17,
  mean: Number((total / 35).toFixed(2)), // ~7.06
  median,
  numClasses: 6,
  classWidth: 3,
}

// Correct answer: frequency distribution table
export const CORRECT_TABLE = [
  { kelas: '1 – 3',   f: 9,  fRel: 25.7, fKum: 9  },
  { kelas: '4 – 6',   f: 11, fRel: 31.4, fKum: 20 },
  { kelas: '7 – 9',   f: 6,  fRel: 17.1, fKum: 26 },
  { kelas: '10 – 12', f: 3,  fRel:  8.6, fKum: 29 },
  { kelas: '13 – 15', f: 3,  fRel:  8.6, fKum: 32 },
  { kelas: '16 – 18', f: 3,  fRel:  8.6, fKum: 35 },
]

// Bar heights as percentage of max frequency (13)
const maxF = Math.max(...CORRECT_TABLE.map(row => row.f))
export const HISTOGRAM_BARS = CORRECT_TABLE.map(row => ({
  label: row.kelas,
  f: row.f,
  heightPct: Math.round((row.f / maxF) * 100),
}))

// Correct verdict
export const CORRECT_VERDICT = 'MISLEADING'

// Verdict explanation
export const VERDICT_EXPLANATION = `Rata-rata screen time dari 35 siswa adalah <strong>${STATS.mean} jam/hari</strong> (7.06 jam) — di bawah klaim "lebih dari 8 jam". Sebagian besar siswa (<strong>25 dari 35 siswa atau 71.4%</strong>) bermain medsos <strong>8 jam atau kurang</strong> sehari. Hanya beberapa siswa (tertinggi 17 dan 18 jam) yang bermain sangat lama — ini merupakan <strong>outlier/pencilan</strong>. Distribusi data menunjukkan pola pencilan ke kanan (skewed to the right). Klaim tersebut bersifat <strong>MISLEADING</strong> karena menggeneralisasi dari data ekstrem yang tidak mewakili mayoritas.`

// ─────────────────────────────────────────────────────────────────────────────
// Keyword checker for TEXT ANALYSIS (Tahap B) — dipakai KEDUA path FI & FD
// ─────────────────────────────────────────────────────────────────────────────
export const CRITICAL_KEYWORDS_POSITIVE = [
  'tidak valid', 'tidak benar', 'salah', 'misleading', 'tidak didukung',
  'tidak terbukti', 'hoaks', 'menyesatkan',
]

export const CRITICAL_KEYWORDS_EVIDENCE = [
  'mayoritas', 'outlier', 'pencilan', 'menceng', 'skewed', 'grafik', 'distribusi',
  'histogram', '24', '68', '68.6', 'kiri', 'ekor', 'ekstrem', 'data',
  '13', '37', '37.1', '25', '71', '71.4',
]

export const FD_CRITICAL_KEYWORDS_EVIDENCE = [
  'mayoritas', 'outlier', 'pencilan', 'menceng', 'skewed', 'grafik', 'distribusi',
  'histogram', '24', '68', '68.6', 'kiri', 'ekor', 'ekstrem', 'data',
  'kebanyakan', 'banyak', 'sedikit', 'jarang', 'tidak sesuai', 'tidak cocok',
  '13', '37', '37.1', '25', '71', '71.4',
]

// Mentor dialog setelah MYTH BUSTED
export const MENTOR_DIALOG_AFTER_MYTHBUST = `Luar biasa, Detektif! 🎉 Kamu baru saja menyelamatkan linimasa dari hoaks! Analisismu membuktikan bahwa mata kita sering ditipu oleh angka rata-rata yang dimanipulasi oleh data ekstrem (outlier).

Tapi, tahukah kamu apa nama ilmiah dari bentuk grafik yang kamu buat tadi? Dan bagaimana outlier bisa merusak nilai rata-rata (mean) secara matematis?

Sebelum kita lanjut ke Kasus Level 2, kamu wajib membuka "Buku Saku Detektif" di bawah ini untuk memperkuat senjata analisismu!`

// Badges
export const BADGES = {
  DETECTIVE: { id: 'detective-histogram', icon: '🔍', name: 'Detektif Histogram',     desc: 'Menyelesaikan Level 1' },
  SPEED:     { id: 'speed-analyst',       icon: '⚡', name: 'Speed Analyst',           desc: 'Selesai < 50% waktu' },
  PERFECT:   { id: 'perfect-investigator',icon: '🎯', name: 'Perfect Investigator',    desc: '0 kesalahan' },
  CRITICAL:  { id: 'critical-thinker',    icon: '🧠', name: 'Critical Thinker',        desc: 'Analisis mendalam' },
  MYTHBUST:  { id: 'myth-buster',         icon: '💥', name: 'Myth Buster',             desc: 'Berhasil membongkar hoaks' },
}
