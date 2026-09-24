import { MapConfig } from '@/app/siswa/game/_types/mapTypes'

export const WORLD_VW = 1235
export const WORLD_VH = 650

// Ground boundary line nodes for the outdoor hallway
export const RED_LINE_POINTS = [
  { x: 120, y: 550 },
  { x: 310, y: 564 },
  { x: 431, y: 495 },
  { x: 632, y: 485 },
  { x: 830, y: 485 },
  { x: 944, y: 561 },
  { x: 1110, y: 550 }
] as const

export function getRedLineY(x: number): number {
  const sortedPoints = [...RED_LINE_POINTS].sort((a, b) => a.x - b.x)
  if (x <= sortedPoints[0].x) return sortedPoints[0].y
  if (x >= sortedPoints[sortedPoints.length - 1].x) return sortedPoints[sortedPoints.length - 1].y

  for (let i = 0; i < sortedPoints.length - 1; i++) {
    const p1 = sortedPoints[i]
    const p2 = sortedPoints[i + 1]
    if (x >= p1.x && x <= p2.x) {
      const dx = p2.x - p1.x
      if (dx === 0) return p2.y
      const t = (x - p1.x) / dx
      return p1.y + t * (p2.y - p1.y)
    }
  }
  return 520
}

// Hallway Walkable Bounds logic
export function checkHallwayWalkable(x: number, y: number): boolean {
  const feetRadiusX = 16.0
  if (y > 640) return false
  if (x < 120 + feetRadiusX || x > 1110 - feetRadiusX) return false

  const redLineYCenter = getRedLineY(x)
  const redLineYLeft = getRedLineY(x - feetRadiusX)
  const redLineYRight = getRedLineY(x + feetRadiusX)

  if (y < redLineYCenter || y < redLineYLeft || y < redLineYRight) {
    return false
  }
  return true
}

// Classroom Walkable Bounds logic (spacious center aisle and lower room)
export function checkClassroomWalkable(x: number, y: number): boolean {
  if (x < 50 || x > WORLD_VW - 50) return false
  if (y < 380 || y > WORLD_VH - 40) return false
  return true
}

// Level 1 Map Config Registry
export const LEVEL1_MAPS: Record<string, MapConfig> = {
  hallway: {
    id: 'hallway',
    name: 'Lorong Sekolah',
    type: 'hallway',
    bgImage: '/Assets/Building/N-Path.png',
    camera: {
      mode: 'follow',
      vw: 380,
      vh: 380,
      preserveAspectRatio: 'none'
    },
    character: {
      baseSize: 145,
      depthFactor: 65,
      speed: 3.9 // Reduced by 25% from 5.2 for smoother exploration
    },
    spawn: { x: 650, y: 550 },
    isWalkable: (x, y) => checkHallwayWalkable(x, y)
  },

  A1: {
    id: 'A1',
    name: 'Ruang VII-A',
    type: 'classroom',
    bgImage: '/Assets/Building/Ruang VII-A/VII-A.png',
    camera: {
      mode: 'fixed',
      vw: WORLD_VW,
      vh: WORLD_VH,
      preserveAspectRatio: 'xMidYMid meet'
    },
    character: {
      baseSize: 340,
      depthFactor: 60,
      speed: 3.8 // Precise movement inside classroom
    },
    spawn: { x: 600, y: 580 },
    teacher: {
      name: 'Bu Sari (Wali Kelas VII-A)',
      x: 710,
      y: 220,
      hotspotW: 140,
      hotspotH: 220
    },
    isWalkable: (x, y) => checkClassroomWalkable(x, y)
  },

  A2: {
    id: 'A2',
    name: 'Ruang VII-B',
    type: 'classroom',
    bgImage: '/Assets/Building/Kelas.jpg',
    camera: {
      mode: 'fixed',
      vw: WORLD_VW,
      vh: WORLD_VH,
      preserveAspectRatio: 'xMidYMid meet'
    },
    character: {
      baseSize: 340,
      depthFactor: 60,
      speed: 3.8
    },
    spawn: { x: 600, y: 580 },
    teacher: {
      name: 'Pak Bambang (Wali Kelas VII-B)',
      x: 600,
      y: 250,
      hotspotW: 140,
      hotspotH: 220
    },
    isWalkable: (x, y) => checkClassroomWalkable(x, y)
  },

  B1: {
    id: 'B1',
    name: 'Ruang VIII-A',
    type: 'classroom',
    bgImage: '/Assets/Building/Kelas.jpg',
    camera: {
      mode: 'fixed',
      vw: WORLD_VW,
      vh: WORLD_VH,
      preserveAspectRatio: 'xMidYMid meet'
    },
    character: {
      baseSize: 340,
      depthFactor: 60,
      speed: 3.8
    },
    spawn: { x: 600, y: 580 },
    teacher: {
      name: 'Bu Rina (Wali Kelas VIII-A)',
      x: 600,
      y: 250,
      hotspotW: 140,
      hotspotH: 220
    },
    isWalkable: (x, y) => checkClassroomWalkable(x, y)
  },

  B2: {
    id: 'B2',
    name: 'Ruang VIII-B',
    type: 'classroom',
    bgImage: '/Assets/Building/Kelas.jpg',
    camera: {
      mode: 'fixed',
      vw: WORLD_VW,
      vh: WORLD_VH,
      preserveAspectRatio: 'xMidYMid meet'
    },
    character: {
      baseSize: 340,
      depthFactor: 60,
      speed: 3.8
    },
    spawn: { x: 600, y: 580 },
    teacher: {
      name: 'Pak Setiawan (Wali Kelas VIII-B)',
      x: 600,
      y: 250,
      hotspotW: 140,
      hotspotH: 220
    },
    isWalkable: (x, y) => checkClassroomWalkable(x, y)
  },

  C1: {
    id: 'C1',
    name: 'Ruang IX',
    type: 'classroom',
    bgImage: '/Assets/Building/Kelas.jpg',
    camera: {
      mode: 'fixed',
      vw: WORLD_VW,
      vh: WORLD_VH,
      preserveAspectRatio: 'xMidYMid meet'
    },
    character: {
      baseSize: 340,
      depthFactor: 60,
      speed: 3.8
    },
    spawn: { x: 600, y: 580 },
    teacher: {
      name: 'Pak Joko (Wali Kelas IX)',
      x: 600,
      y: 250,
      hotspotW: 140,
      hotspotH: 220
    },
    isWalkable: (x, y) => checkClassroomWalkable(x, y)
  }
}
