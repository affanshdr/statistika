export const LEVEL1_CONFIG = {
  id: 1,
  title: 'Level 1 (The Viral Myth)',
  subtitle: '',
  description: 'Sebuah postingan viral mengklaim remaja Indonesia rata-rata >8 jam/hari di media sosial. Tugasmu: selidiki kebenarannya menggunakan statistika.',
}

// Raw dataset presets: 24 siswa (Kelas VII-A: 5, VII-B: 7, VIII-A: 4, VIII-B: 8)
// Memiliki rentang min=1, max=18, K=6, P=3 dengan rata-rata terhitung bersih (5.5, 5.75, 6.0, 6.17, 6.25, 6.5)
export const LEVEL1_DATASET_PRESETS = [
  // Varian 1: Sum = 144, Mean = 6.0 (Bulat)
  [1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 10, 15, 16, 18],
  // Varian 2: Sum = 132, Mean = 5.5 (0.5)
  [1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 8, 10, 14, 18],
  // Varian 3: Sum = 156, Mean = 6.5 (0.5)
  [1, 2, 3, 3, 3, 3, 3, 3, 4, 4, 5, 5, 6, 6, 6, 6, 7, 7, 8, 8, 12, 15, 18, 18],
  // Varian 4: Sum = 138, Mean = 5.75
  [1, 1, 2, 2, 2, 2, 2, 3, 4, 4, 4, 4, 4, 4, 5, 5, 7, 7, 8, 8, 11, 14, 16, 18],
  // Varian 5: Sum = 150, Mean = 6.25, Modus = 4 (muncul 5x)
  [1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 7, 8, 8, 9, 11, 15, 18, 18],
  // Varian 6: Sum = 144, Mean = 6.0 (Variasi B), Modus = 5 (muncul 5x)
  [1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 5, 7, 7, 8, 8, 11, 13, 18, 18],
  // Varian 7: Sum = 148, Mean = 6.17 (Baseline Klasik), Modus = 3 (muncul 4x)
  [1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 9, 11, 14, 16, 18],
]

export const screenTimeData = LEVEL1_DATASET_PRESETS[0]

// Interval classes: width = 3 (1-3, 4-6, 7-9, 10-12, 13-15, 16-18)
export const CLASS_LABELS = ['1 – 3', '4 – 6', '7 – 9', '10 – 12', '13 – 15', '16 – 18']

export function getClassIndex(val: number): number {
  if (val >= 1 && val <= 3) return 0
  if (val >= 4 && val <= 6) return 1
  if (val >= 7 && val <= 9) return 2
  if (val >= 10 && val <= 12) return 3
  if (val >= 13 && val <= 15) return 4
  if (val >= 16 && val <= 18) return 5
  return -1
}

export function generateRandomLevel1Data(): number[] {
  // Pilih salah satu varian acak yang telah terverifikasi
  const randomPreset = LEVEL1_DATASET_PRESETS[Math.floor(Math.random() * LEVEL1_DATASET_PRESETS.length)]
  const copy = [...randomPreset]

  // Fisher-Yates shuffle seluruh 24 data agar urutan awal benar-benar acak
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

export function getLevel1Data(customDataset?: number[] | null) {
  const data = customDataset && customDataset.length === 24 ? customDataset : screenTimeData
  const total = data.reduce((a, b) => a + b, 0)
  const sorted = [...data].sort((a, b) => a - b)
  const n = data.length
  const min = sorted[0]
  const max = sorted[n - 1]
  const range = max - min
  const mean = Number((total / n).toFixed(2))
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)]

  const stats = {
    n,
    min,
    max,
    range,
    sum: total,
    mean,
    median,
    numClasses: 6,
    classWidth: 3,
  }

  // Dynamic Frequency Table calculation
  const rawClasses = [
    { kelas: '1 – 3', f: data.filter(v => v >= 1 && v <= 3).length },
    { kelas: '4 – 6', f: data.filter(v => v >= 4 && v <= 6).length },
    { kelas: '7 – 9', f: data.filter(v => v >= 7 && v <= 9).length },
    { kelas: '10 – 12', f: data.filter(v => v >= 10 && v <= 12).length },
    { kelas: '13 – 15', f: data.filter(v => v >= 13 && v <= 15).length },
    { kelas: '16 – 18', f: data.filter(v => v >= 16 && v <= 18).length },
  ]

  let kum = 0
  const correctTable = rawClasses.map(row => {
    kum += row.f
    return {
      kelas: row.kelas,
      f: row.f,
      fRel: Number(((row.f / n) * 100).toFixed(1)),
      fKum: kum,
    }
  })

  const maxF = Math.max(...correctTable.map(row => row.f))
  const histogramBars = correctTable.map(row => ({
    label: row.kelas,
    f: row.f,
    heightPct: maxF > 0 ? Math.round((row.f / maxF) * 100) : 0,
  }))

  const lte8 = data.filter(v => v <= 8).length
  const lte8Pct = ((lte8 / n) * 100).toFixed(1)

  const verdictExplanation = `Rata-rata screen time dari ${n} siswa adalah <strong>${mean} jam/hari</strong> — di bawah klaim "lebih dari 8 jam". Sebagian besar siswa (<strong>${lte8} dari ${n} siswa atau ${lte8Pct}%</strong>) bermain medsos <strong>8 jam atau kurang</strong> sehari. Hanya beberapa siswa (tertinggi ${sorted[n - 2]} dan ${max} jam) yang bermain sangat lama — ini merupakan <strong>outlier/pencilan</strong>. Distribusi data menunjukkan pola pencilan ke kanan (skewed to the right). Klaim tersebut bersifat <strong>MISLEADING</strong> karena menggeneralisasi dari data ekstrem yang tidak mewakili mayoritas.`

  return {
    screenTimeData: data,
    STATS: stats,
    CORRECT_TABLE: correctTable,
    HISTOGRAM_BARS: histogramBars,
    CORRECT_VERDICT: 'MISLEADING',
    VERDICT_EXPLANATION: verdictExplanation,
  }
}

// Default export fallback for backward compatibility
const defaultData = getLevel1Data(screenTimeData)
export const STATS = defaultData.STATS
export const CORRECT_TABLE = defaultData.CORRECT_TABLE
export const HISTOGRAM_BARS = defaultData.HISTOGRAM_BARS
export const CORRECT_VERDICT = 'MISLEADING'
export const VERDICT_EXPLANATION = defaultData.VERDICT_EXPLANATION

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
  DETECTIVE: { id: 'detective-histogram', icon: '🔍', name: 'Detektif Histogram', desc: 'Menyelesaikan Level 1' },
  SPEED: { id: 'speed-analyst', icon: '⚡', name: 'Speed Analyst', desc: 'Selesai < 50% waktu' },
  PERFECT: { id: 'perfect-investigator', icon: '🎯', name: 'Perfect Investigator', desc: '0 kesalahan' },
  CRITICAL: { id: 'critical-thinker', icon: '🧠', name: 'Critical Thinker', desc: 'Analisis mendalam' },
  MYTHBUST: { id: 'myth-buster', icon: '💥', name: 'Myth Buster', desc: 'Berhasil membongkar hoaks' },
}
