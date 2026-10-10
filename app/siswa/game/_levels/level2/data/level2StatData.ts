/**
 * Level 2 — Statistics Data Bank & Computation Engine
 * 
 * Contains validated datasets and calculation functions for:
 * 1. Jangkauan (Range)
 * 2. Kuartil (Q1, Q2, Q3) — using inclusive (Method 1) quartile convention
 * 3. Jangkauan Kuartil (IQR = Q3 - Q1)
 * 4. Simpangan Baku Populasi (Population Standard Deviation)
 * 
 * Quartile Convention: Inclusive method (include median in both halves for odd n)
 * Standard Deviation: Population (σ), not sample (s)
 */

export interface DataSet {
  id: string
  values: number[]
}

export interface ComputedStats {
  sortedValues: number[]
  n: number
  min: number
  max: number
  range: number
  mean: number
  q1: number
  q2: number // median
  q3: number
  iqr: number
  stdDev: number // population std dev
}

export interface QuestionConfig {
  id: number
  topic: string
  topicLabel: string
  questionText: string
  answerKey: number
  tolerance: number // for floating point comparison
  decimalPlaces: number
}

// ──────────────────────────────────────────────────────
// VALIDATED DATA SETS
// Each set has been tested to produce clean, valid results
// for all four statistical measures.
// ──────────────────────────────────────────────────────

const DATA_BANK: DataSet[] = [
  { id: 'DS-A', values: [3, 5, 7, 8, 10, 12, 14, 15, 18, 20] },
  { id: 'DS-B', values: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20] },
  { id: 'DS-C', values: [5, 8, 10, 12, 15, 17, 20, 22, 25, 28] },
  { id: 'DS-D', values: [4, 6, 9, 11, 13, 16, 18, 21, 24, 27] },
  { id: 'DS-E', values: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19] },
  { id: 'DS-F', values: [6, 9, 12, 14, 16, 19, 21, 23, 26, 30] },
  { id: 'DS-G', values: [2, 5, 8, 11, 13, 15, 18, 20, 23, 26] },
  { id: 'DS-H', values: [3, 7, 10, 13, 16, 18, 21, 24, 27, 30] },
]

// ──────────────────────────────────────────────────────
// CALCULATION FUNCTIONS
// ──────────────────────────────────────────────────────

/**
 * Calculates median of an array of sorted numbers
 */
function calcMedian(sorted: number[]): number {
  const n = sorted.length
  if (n === 0) return 0
  if (n % 2 === 0) {
    return (sorted[n / 2 - 1] + sorted[n / 2]) / 2
  }
  return sorted[Math.floor(n / 2)]
}

/**
 * Quartile Calculation — Inclusive Method
 * 
 * For even n (e.g., 10):
 *   Lower half = first n/2 elements
 *   Upper half = last n/2 elements
 *   Q1 = median of lower half
 *   Q3 = median of upper half
 * 
 * For odd n:
 *   Lower half = first ceil(n/2) elements (include median)
 *   Upper half = last ceil(n/2) elements (include median)
 *   Q1 = median of lower half
 *   Q3 = median of upper half
 */
function calcQuartiles(sorted: number[]): { q1: number; q2: number; q3: number } {
  const n = sorted.length
  const q2 = calcMedian(sorted)

  let lowerHalf: number[]
  let upperHalf: number[]

  if (n % 2 === 0) {
    lowerHalf = sorted.slice(0, n / 2)
    upperHalf = sorted.slice(n / 2)
  } else {
    const mid = Math.floor(n / 2)
    lowerHalf = sorted.slice(0, mid + 1) // include median
    upperHalf = sorted.slice(mid)          // include median
  }

  return {
    q1: calcMedian(lowerHalf),
    q2,
    q3: calcMedian(upperHalf),
  }
}

/**
 * Population Standard Deviation (σ)
 * σ = √(Σ(xᵢ − μ)² / N)
 */
function calcPopulationStdDev(values: number[], mean: number): number {
  const n = values.length
  const sumSquaredDiffs = values.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0)
  return Math.sqrt(sumSquaredDiffs / n)
}

/**
 * Round to specific decimal places
 */
function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

// ──────────────────────────────────────────────────────
// MAIN PUBLIC API
// ──────────────────────────────────────────────────────

/**
 * Compute all statistics for a given dataset
 */
export function computeStats(data: DataSet): ComputedStats {
  const sorted = [...data.values].sort((a, b) => a - b)
  const n = sorted.length
  const min = sorted[0]
  const max = sorted[n - 1]
  const range = max - min
  const total = sorted.reduce((a, b) => a + b, 0)
  const mean = roundTo(total / n, 2)
  const { q1, q2, q3 } = calcQuartiles(sorted)
  const iqr = q3 - q1
  const stdDev = roundTo(calcPopulationStdDev(sorted, total / n), 2)

  return { sortedValues: sorted, n, min, max, range, mean, q1, q2, q3, iqr, stdDev }
}

/**
 * Generate the 4 questions based on computed stats
 */
export function generateQuestions(stats: ComputedStats, sortedValues: number[]): QuestionConfig[] {
  const dataStr = sortedValues.join(', ')
  
  return [
    {
      id: 1,
      topic: 'range',
      topicLabel: 'Jangkauan (Range)',
      questionText: `Dari data berikut:\n${dataStr}\n\nHitunglah jangkauan (range) dari data tersebut!`,
      answerKey: stats.range,
      tolerance: 0,
      decimalPlaces: 0,
    },
    {
      id: 2,
      topic: 'quartile',
      topicLabel: 'Kuartil (Q1, Q2, Q3)',
      questionText: `Dari data berikut:\n${dataStr}\n\nTentukan nilai Kuartil Bawah (Q1) dari data tersebut!`,
      answerKey: stats.q1,
      tolerance: 0.01,
      decimalPlaces: 2,
    },
    {
      id: 3,
      topic: 'iqr',
      topicLabel: 'Jangkauan Kuartil (IQR)',
      questionText: `Dari data berikut:\n${dataStr}\n\nHitunglah Jangkauan Interkuartil (IQR = Q3 − Q1) dari data tersebut!`,
      answerKey: stats.iqr,
      tolerance: 0.01,
      decimalPlaces: 2,
    },
    {
      id: 4,
      topic: 'stddev',
      topicLabel: 'Simpangan Baku Populasi (σ)',
      questionText: `Dari data berikut:\n${dataStr}\n\nHitunglah simpangan baku populasi (σ) dari data tersebut!\n(Bulatkan ke 2 angka desimal)`,
      answerKey: stats.stdDev,
      tolerance: 0.05,
      decimalPlaces: 2,
    },
  ]
}

/**
 * Validate a player's answer against the answer key
 */
export function validateAnswer(playerAnswer: string, answerKey: number, tolerance: number): boolean {
  const cleaned = playerAnswer.trim().replace(',', '.')
  if (cleaned === '' || isNaN(Number(cleaned))) return false
  const parsed = parseFloat(cleaned)
  return Math.abs(parsed - answerKey) <= tolerance
}

/**
 * Pick a random dataset from the bank, optionally excluding a specific ID
 */
export function pickRandomDataSet(excludeId?: string): DataSet {
  const available = excludeId
    ? DATA_BANK.filter(ds => ds.id !== excludeId)
    : DATA_BANK
  const idx = Math.floor(Math.random() * available.length)
  return { ...available[idx], values: [...available[idx].values] }
}

/**
 * Calculate adaptive candidate scores based on player's final score
 * 
 * Rules:
 * - If player scores 4/4: Candidate1 = 3, Candidate2 = 2 (base scores)
 * - If player scores < 4: At least one candidate must score higher than player
 */
export function calculateCandidateScores(playerScore: number): { candidate1Score: number; candidate2Score: number } {
  if (playerScore === 4) {
    return { candidate1Score: 3, candidate2Score: 2 }
  }

  // Adaptive: ensure at least one candidate beats the player
  let c1 = 3
  let c2 = 2

  // If base scores don't beat player, adjust
  if (c1 <= playerScore && c2 <= playerScore) {
    c1 = Math.min(4, playerScore + 1)
  }
  
  // Ensure c1 > playerScore
  if (c1 <= playerScore) {
    c1 = Math.min(4, playerScore + 1)
  }

  return { candidate1Score: c1, candidate2Score: c2 }
}

// ──────────────────────────────────────────────────────
// DIRA LEARNING MATERIALS
// ──────────────────────────────────────────────────────

export interface LearningMaterial {
  topic: string
  title: string
  concept: string
  formula: string
  example: (stats: ComputedStats) => string
}

export function getLearningMaterials(stats: ComputedStats): LearningMaterial[] {
  return [
    {
      topic: 'range',
      title: 'Jangkauan (Range)',
      concept: 'Jangkauan adalah selisih antara nilai terbesar (maksimum) dan nilai terkecil (minimum) dalam suatu kumpulan data. Jangkauan menunjukkan seberapa lebar sebaran data secara keseluruhan.',
      formula: 'Jangkauan = Nilai Maksimum − Nilai Minimum',
      example: (s) =>
        `Dari data kita:\n• Nilai Maksimum = ${s.max}\n• Nilai Minimum = ${s.min}\n• Jangkauan = ${s.max} − ${s.min} = ${s.range}`,
    },
    {
      topic: 'quartile',
      title: 'Kuartil (Q1, Q2, Q3)',
      concept: 'Kuartil membagi data yang telah diurutkan menjadi empat bagian sama besar.\n\n• Q1 (Kuartil Bawah): Nilai yang membatasi 25% data terbawah\n• Q2 (Median): Nilai tengah data, membagi data menjadi dua bagian sama besar\n• Q3 (Kuartil Atas): Nilai yang membatasi 75% data terbawah',
      formula: 'Urutkan data → Bagi menjadi dua bagian → Q1 = Median bagian bawah, Q3 = Median bagian atas',
      example: (s) =>
        `Dari data kita (${s.n} data yang sudah diurutkan):\n• Q1 = ${s.q1}\n• Q2 (Median) = ${s.q2}\n• Q3 = ${s.q3}`,
    },
    {
      topic: 'iqr',
      title: 'Jangkauan Kuartil (IQR)',
      concept: 'Jangkauan Interkuartil (IQR) mengukur sebaran 50% bagian tengah data. IQR memberikan gambaran penyebaran data tanpa dipengaruhi oleh nilai-nilai ekstrem di ujung data.',
      formula: 'IQR = Q3 − Q1',
      example: (s) =>
        `Dari data kita:\n• Q3 = ${s.q3}\n• Q1 = ${s.q1}\n• IQR = ${s.q3} − ${s.q1} = ${s.iqr}`,
    },
    {
      topic: 'stddev',
      title: 'Simpangan Baku Populasi (σ)',
      concept: 'Simpangan baku mengukur seberapa jauh nilai-nilai data menyebar dari nilai rata-ratanya (mean). Semakin besar simpangan baku, semakin bervariasi data tersebut.\n\nKita menggunakan simpangan baku populasi karena data dianggap sebagai keseluruhan kumpulan yang dianalisis.',
      formula: 'σ = √(Σ(xᵢ − μ)² / N)\n\nKeterangan:\n• xᵢ = setiap nilai data\n• μ = rata-rata seluruh data\n• N = jumlah data\n• σ = simpangan baku populasi',
      example: (s) =>
        `Dari data kita:\n• Rata-rata (μ) = ${s.mean}\n• Jumlah data (N) = ${s.n}\n• σ = ${s.stdDev}`,
    },
  ]
}
