// Level 1 — "Kasus: Postingan Viral Screen Time"

export const LEVEL1_CONFIG = {
  id: 1,
  title: 'Kasus: Postingan Viral Screen Time',
  subtitle: 'Digital Truth Squad Investigation',
  description: 'Sebuah postingan viral mengklaim remaja Indonesia rata-rata 8+ jam/hari di media sosial. Tugasmu: selidiki kebenarannya menggunakan statistika.',
}

// Raw dataset: screen time (jam/hari) dari 40 siswa
// Verified frequencies: [3.5–4.4]:8, [4.5–5.4]:10, [5.5–6.4]:12, [6.5–7.4]:7, [7.5–8.4]:2, [8.5–9.4]:1
export const screenTimeData = [
  5.8, 4.5, 6.4, 3.7, 7.2, 5.1, 4.9, 6.1, 3.9, 5.6,
  4.0, 4.8, 5.9, 6.4, 4.2, 8.2, 5.3, 6.2, 4.1, 7.0,
  6.0, 5.5, 4.7, 6.8, 3.5, 5.7, 4.6, 7.6, 6.9, 5.4,
  4.3, 6.3, 5.0, 8.5, 4.4, 6.5, 5.2, 7.4, 6.7, 5.8,
]

// Computed statistics
export const STATS = {
  n: 40,
  min: 3.5,
  max: 8.5,
  range: 5.0,
  mean: Number((screenTimeData.reduce((a, b) => a + b, 0) / 40).toFixed(2)), // ≈ 5.65
  median: 5.65,
  numClasses: 6,   // Sturges: 1 + 3.3 × log10(40) ≈ 6.29 → 6
  classWidth: 1.0, // range / k = 5.0 / 6 ≈ 0.83 → dibulatkan ke 1.0
}

// Correct answer: frequency distribution table
export const CORRECT_TABLE = [
  { kelas: '3.5 – 4.4', f: 8,  fRel: 20.0, fKum: 8  },
  { kelas: '4.5 – 5.4', f: 10, fRel: 25.0, fKum: 18 },
  { kelas: '5.5 – 6.4', f: 12, fRel: 30.0, fKum: 30 },
  { kelas: '6.5 – 7.4', f: 7,  fRel: 17.5, fKum: 37 },
  { kelas: '7.5 – 8.4', f: 2,  fRel: 5.0,  fKum: 39 },
  { kelas: '8.5 – 9.4', f: 1,  fRel: 2.5,  fKum: 40 },
]

// Bar heights as percentage of max frequency (12)
export const HISTOGRAM_BARS = CORRECT_TABLE.map(row => ({
  label: row.kelas,
  f: row.f,
  heightPct: Math.round((row.f / 12) * 100),
}))

// Correct verdict
export const CORRECT_VERDICT = 'MISLEADING'

// Verdict explanation
export const VERDICT_EXPLANATION = `Rata-rata screen time dari 40 siswa adalah <strong>5.65 jam/hari</strong> — jauh di bawah klaim "lebih dari 8 jam". Hanya <strong>3 dari 40 siswa (7.5%)</strong> yang memiliki screen time ≥ 8 jam. Distribusi data menunjukkan pola <strong>skewed kanan</strong> dengan puncak di kelas 5.5–6.4 jam. Klaim tersebut bersifat <strong>MISLEADING</strong> karena menggeneralisasi dari angka yang tidak sesuai dengan rata-rata sebenarnya — ini adalah bentuk <strong>generalisasi berlebihan</strong>.`

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
    correct: 2, // '5.5 – 6.4', f=12
  },
  {
    id: 'mc2',
    question: 'Berapa persen siswa yang memiliki screen time di atas 6.4 jam?',
    options: ['17.5%', '20.0%', '25.0%', '30.0%'],
    correct: 2, // kelas 6.5+ → f: 7+2+1 = 10 → 10/40 × 100 = 25.0%
  },
  {
    id: 'mc3',
    question: 'Pola distribusi data screen time ini paling mendekati?',
    options: ['Skewed kiri', 'Skewed kanan', 'Simetris / Normal', 'Uniform'],
    correct: 1, // 'Skewed kanan' — puncak di tengah, ekor memanjang ke kanan
  },
]

// Badges
export const BADGES = {
  DETECTIVE: { id: 'detective-histogram', icon: '🔍', name: 'Detektif Histogram',    desc: 'Menyelesaikan Level 1' },
  SPEED:     { id: 'speed-analyst',       icon: '⚡', name: 'Speed Analyst',          desc: 'Selesai < 50% waktu' },
  PERFECT:   { id: 'perfect-investigator',icon: '🎯', name: 'Perfect Investigator',   desc: '0 kesalahan' },
  CRITICAL:  { id: 'critical-thinker',    icon: '🧠', name: 'Critical Thinker',       desc: 'Analisis mendalam' },
}
