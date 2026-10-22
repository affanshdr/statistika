/**
 * Level 2 — Throw Measurement Statistics Engine
 * 
 * Generates random throw distances for 10 students per session.
 * Computes statistics based on actual measured data:
 * 1. Jangkauan (Range) = max - min
 * 2. Kuartil (Q1, Q2, Q3) — positional for n=10: Q1=3rd, Q2=average of 5th & 6th, Q3=8th
 * 3. Jangkauan Kuartil (IQR) = Q3 - Q1
 * 4. Simpangan Kuartil (Qd) = 1/2 * (Q3 - Q1)
 * 
 * All answers are validated against the session's actual data.
 * No static answer keys.
 */

// ──────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────

export interface StudentThrowData {
  studentId: number          // 1-10
  studentLabel: string       // "👦 Siswa 01", "👧 Siswi 02", etc. (tanpa nama pribadi)
  studentName?: string
  gender?: 'male' | 'female'
  avatarUrl?: string         // Face portrait avatar icon
  spriteUrl?: string         // Full-body pixel-art sprite
  distance: number           // meters, 2 decimal places
  measured: boolean          // true after measurement interaction
  sortedPosition?: number    // 1-10 after sorting (assigned during missions)
}

export interface ThrowSessionData {
  sessionId: string
  students: StudentThrowData[]
  measuredCount: number
  isComplete: boolean        // true when all 10 measured
}

export interface ComputedStats {
  sortedDistances: number[]  // all 10 distances sorted ascending
  sortedStudents: StudentThrowData[]  // students sorted by distance
  n: number                  // always 10
  min: number
  max: number
  range: number
  q1: number                 // value at position 3 (1-indexed)
  q2: number                 // average of 5th and 6th value (median)
  q3: number                 // value at position 8
  iqr: number                // Q3 - Q1 (Jangkauan Kuartil)
  qd: number                 // 1/2 * (Q3 - Q1) (Simpangan Kuartil)
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
 * Round to integer consistently (e.g. throw distances and calculations)
 */
export function roundToInteger(value: number): number {
  return Math.round(value)
}

/** @deprecated Use roundToInteger instead */
export const roundTo2 = roundToInteger

/**
 * Generate 10 unique throw distances for a new session as clean integers (bilangan bulat).
 * Range: 16m to 82m (realistic school field throws)
 * Ensures no two distances are exactly the same.
 */
export function generateThrowDistances(): number[] {
  // Generate 10 clean integers between 16m and 82m
  // Guaranteed minimum separation >= 4.5m between any two values so no two flags collide or overlap on the field
  const minGap = 4
  const n = 10
  const minVal = 16
  const maxVal = 82

  let valid = false
  let sorted: number[] = []

  while (!valid) {
    sorted = []
    let current = minVal + Math.floor(Math.random() * 4) // 16..19
    sorted.push(current)
    for (let i = 1; i < n; i++) {
      const remainingSlots = n - 1 - i
      const maxAllowed = maxVal - remainingSlots * minGap
      const step = minGap + Math.floor(Math.random() * Math.max(1, (maxAllowed - current) / (remainingSlots + 1.5)))
      current += step
      sorted.push(current)
    }
    if (sorted[n - 1] <= maxVal && sorted[n - 1] >= 65) {
      valid = true
    }
  }

  // Shuffle across 10 students so the throw order remains exciting and unpredictable
  const shuffled = [...sorted]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

export interface StudentProfile {
  name: string
  gender: 'male' | 'female'
  avatarUrl: string
  spriteUrl: string
}

export const DEFAULT_STUDENT_PROFILES: StudentProfile[] = [
  {
    name: 'Andi',
    gender: 'male',
    avatarUrl: '/Assets/Building/field/avatars/face_siswa_default.png',
    spriteUrl: '/Assets/Building/field/avatars/siswa_default.png',
  },
  {
    name: 'Siti',
    gender: 'female',
    avatarUrl: '/Assets/Building/field/avatars/face_siswi_hijab.png',
    spriteUrl: '/Assets/Building/field/avatars/siswi_hijab.png',
  },
  {
    name: 'Budi',
    gender: 'male',
    avatarUrl: '/Assets/Building/field/avatars/face_siswa_curly.png',
    spriteUrl: '/Assets/Building/field/avatars/siswa_curly.png',
  },
  {
    name: 'Dewi',
    gender: 'female',
    avatarUrl: '/Assets/Building/field/avatars/face_siswi_ponytail.png',
    spriteUrl: '/Assets/Building/field/avatars/siswi_ponytail.png',
  },
  {
    name: 'Eko',
    gender: 'male',
    avatarUrl: '/Assets/Building/field/avatars/face_siswa_glasses.png',
    spriteUrl: '/Assets/Building/field/avatars/siswa_glasses.png',
  },
  {
    name: 'Fani',
    gender: 'female',
    avatarUrl: '/Assets/Building/field/avatars/face_siswi_bob.png',
    spriteUrl: '/Assets/Building/field/avatars/siswi_bob.png',
  },
  {
    name: 'Gilang',
    gender: 'male',
    avatarUrl: '/Assets/Building/field/avatars/face_siswa_default.png',
    spriteUrl: '/Assets/Building/field/avatars/siswa_default.png',
  },
  {
    name: 'Hana',
    gender: 'female',
    avatarUrl: '/Assets/Building/field/avatars/face_siswi_ponytail.png',
    spriteUrl: '/Assets/Building/field/avatars/siswi_ponytail.png',
  },
  {
    name: 'Irfan',
    gender: 'male',
    avatarUrl: '/Assets/Building/field/avatars/face_siswa_curly.png',
    spriteUrl: '/Assets/Building/field/avatars/siswa_curly.png',
  },
  {
    name: 'Jihan',
    gender: 'female',
    avatarUrl: '/Assets/Building/field/avatars/face_siswi_hijab.png',
    spriteUrl: '/Assets/Building/field/avatars/siswi_hijab.png',
  },
]

/**
 * Create a new throw session with 10 students
 */
export function createThrowSession(): ThrowSessionData {
  const distances = generateThrowDistances()
  
  const students: StudentThrowData[] = distances.map((dist, idx) => {
    const profile = DEFAULT_STUDENT_PROFILES[idx % DEFAULT_STUDENT_PROFILES.length]
    const icon = profile.gender === 'female' ? '👧' : '👦'
    const role = profile.gender === 'female' ? 'Siswi' : 'Siswa'
    return {
      studentId: idx + 1,
      studentName: profile.name,
      studentLabel: `${icon} ${role} ${String(idx + 1).padStart(2, '0')}`, // Hapus nama siswa dari bendera
      gender: profile.gender,
      avatarUrl: profile.avatarUrl,
      spriteUrl: profile.spriteUrl,
      distance: dist,
      measured: false,
    }
  })
  
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
 * Uses positional quartiles for n=10 (Indonesian SMP standard / Tukey two-halves):
 *   Q1 = 3rd value (1-indexed)
 *   Q2 = Average of 5th and 6th value (median)
 *   Q3 = 8th value
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
  
  const sortedDistances = sorted.map(s => Math.round(s.distance))
  const n = sortedDistances.length
  
  const min = sortedDistances[0] ?? 0
  const max = sortedDistances[n - 1] ?? 0
  const range = max - min
  
  // Positional quartiles for n=10:
  // Q1 = 3rd value (index 2)
  // Q2 = average of 5th and 6th value (indices 4 and 5)
  // Q3 = 8th value (index 7)
  const q1 = n >= 3 ? sortedDistances[2] : 0
  const q2 = n >= 6 ? parseFloat(((sortedDistances[4] + sortedDistances[5]) / 2).toFixed(2)) : (sortedDistances[4] ?? 0)
  const q3 = n >= 8 ? sortedDistances[7] : 0
  const iqr = parseFloat((q3 - q1).toFixed(2))
  const qd = parseFloat(((q3 - q1) / 2).toFixed(2))

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
    qd,
    minStudentId: sorted[0]?.studentId ?? 0,
    maxStudentId: sorted[n - 1]?.studentId ?? 0,
    q1StudentId: sorted[2]?.studentId ?? 0,
    q2StudentId: sorted[4]?.studentId ?? 0,
    q3StudentId: sorted[7]?.studentId ?? 0,
  }
}

/**
 * Extract a clean numeric value from user input string, ignoring units (e.g. 'm', 'meter', 'm.', spaces)
 */
export function extractNumber(input: string | number): number | null {
  if (typeof input === 'number') return isNaN(input) ? null : input
  if (!input) return null
  const cleaned = String(input).trim().replace(',', '.')
  const match = cleaned.match(/-?\d+(?:\.\d+)?/)
  if (!match) return null
  const num = parseFloat(match[0])
  return isNaN(num) ? null : num
}

/**
 * Validate a numeric answer with tolerance, accepting units like 'm' or 'meter'
 */
export function validateAnswer(playerAnswer: string | number, correctAnswer: number, tolerance: number = 0.75): boolean {
  const parsed = extractNumber(playerAnswer)
  if (parsed === null) return false
  return Math.abs(parsed - correctAnswer) <= tolerance
}

/**
 * Format distance as clean integer (bilangan bulat)
 */
export function formatDistance(dist: number): string {
  return String(Math.round(dist))
}
