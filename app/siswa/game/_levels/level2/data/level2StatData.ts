/**
 * Level 2 — Throw Measurement Statistics Engine
 * 
 * Generates random throw distances for 15 students per session.
 * Computes statistics based on actual measured data:
 * 1. Jangkauan (Range) = max - min
 * 2. Kuartil (Q1, Q2, Q3) — positional for n=15: Q1=4th, Q2=8th, Q3=12th
 * 3. Jangkauan Kuartil (IQR) = Q3 - Q1
 * 
 * All answers are validated against the session's actual data.
 * No static answer keys.
 */

// ──────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────

export interface StudentThrowData {
  studentId: number          // 1-15
  studentLabel: string       // "Siswa 01" .. "Siswa 15"
  distance: number           // meters, 2 decimal places
  measured: boolean          // true after measurement interaction
  sortedPosition?: number    // 1-15 after sorting (assigned during missions)
}

export interface ThrowSessionData {
  sessionId: string
  students: StudentThrowData[]
  measuredCount: number
  isComplete: boolean        // true when all 15 measured
}

export interface ComputedStats {
  sortedDistances: number[]  // all 15 distances sorted ascending
  sortedStudents: StudentThrowData[]  // students sorted by distance
  n: number                  // always 15
  min: number
  max: number
  range: number
  q1: number                 // value at position 4 (1-indexed)
  q2: number                 // value at position 8
  q3: number                 // value at position 12
  iqr: number                // Q3 - Q1
  minStudentId: number       // student ID with min distance
  maxStudentId: number       // student ID with max distance
  q1StudentId: number        // student ID at Q1 position
  q2StudentId: number        // student ID at Q2 position
  q3StudentId: number        // student ID at Q3 position
}

// ──────────────────────────────────────────────────────
// DISTANCE GENERATION
// ──────────────────────────────────────────────────────

/**
 * Round to 2 decimal places consistently
 */
export function roundTo2(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Generate 15 unique throw distances for a new session.
 * Range: 5.00m to 25.00m (realistic school field throws)
 * Ensures no two distances are exactly the same.
 */
export function generateThrowDistances(): number[] {
  const distances: number[] = []
  const usedSet = new Set<number>()
  
  for (let i = 0; i < 15; i++) {
    let dist: number
    let attempts = 0
    do {
      // Generate between 5.00 and 25.00 meters
      dist = roundTo2(5 + Math.random() * 20)
      attempts++
      // Safety: after many attempts, adjust slightly
      if (attempts > 100) {
        dist = roundTo2(dist + 0.01 * attempts)
      }
    } while (usedSet.has(dist))
    
    usedSet.add(dist)
    distances.push(dist)
  }
  
  return distances
}

/**
 * Create a new throw session with 15 students
 */
export function createThrowSession(): ThrowSessionData {
  const distances = generateThrowDistances()
  
  const students: StudentThrowData[] = distances.map((dist, idx) => ({
    studentId: idx + 1,
    studentLabel: `Siswa ${String(idx + 1).padStart(2, '0')}`,
    distance: dist,
    measured: false,
  }))
  
  return {
    sessionId: `throw-${Date.now()}`,
    students,
    measuredCount: 0,
    isComplete: false,
  }
}

// ──────────────────────────────────────────────────────
// STATISTICS COMPUTATION
// ──────────────────────────────────────────────────────

/**
 * Compute all statistics from measured throw data.
 * Uses positional quartiles for n=15:
 *   Q1 = 4th value (1-indexed)
 *   Q2 = 8th value (median)
 *   Q3 = 12th value
 * 
 * Tie-breaking for equal distances: lower student ID comes first.
 */
export function computeStats(session: ThrowSessionData): ComputedStats {
  const measuredStudents = session.students.filter(s => s.measured)
  
  // Sort by distance ascending; tie-break by student ID
  const sorted = [...measuredStudents].sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance
    return a.studentId - b.studentId
  })
  
  // Assign sorted positions
  sorted.forEach((s, idx) => {
    s.sortedPosition = idx + 1
  })
  
  const sortedDistances = sorted.map(s => s.distance)
  const n = sortedDistances.length
  
  const min = sortedDistances[0]
  const max = sortedDistances[n - 1]
  const range = roundTo2(max - min)
  
  // Positional quartiles (1-indexed): Q1=4th, Q2=8th, Q3=12th
  const q1 = n >= 4 ? sortedDistances[3] : 0     // index 3 = position 4
  const q2 = n >= 8 ? sortedDistances[7] : 0     // index 7 = position 8
  const q3 = n >= 12 ? sortedDistances[11] : 0   // index 11 = position 12
  const iqr = roundTo2(q3 - q1)
  
  return {
    sortedDistances,
    sortedStudents: sorted,
    n,
    min,
    max,
    range,
    q1,
    q2,
    q3,
    iqr,
    minStudentId: sorted[0]?.studentId ?? 0,
    maxStudentId: sorted[n - 1]?.studentId ?? 0,
    q1StudentId: sorted[3]?.studentId ?? 0,
    q2StudentId: sorted[7]?.studentId ?? 0,
    q3StudentId: sorted[11]?.studentId ?? 0,
  }
}

/**
 * Validate a numeric answer with tolerance
 */
export function validateAnswer(playerAnswer: string, correctAnswer: number, tolerance: number = 0.01): boolean {
  const cleaned = playerAnswer.trim().replace(',', '.')
  if (cleaned === '' || isNaN(Number(cleaned))) return false
  const parsed = parseFloat(cleaned)
  return Math.abs(parsed - correctAnswer) <= tolerance
}

/**
 * Format distance with consistent 2 decimal places
 */
export function formatDistance(dist: number): string {
  return dist.toFixed(2)
}
