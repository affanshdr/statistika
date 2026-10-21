import { MapConfig } from '@/app/siswa/game/_types/mapTypes'

export const WORLD_VW = 1235
export const WORLD_VH = 650

// Ground boundary line nodes for the outdoor hallway
export const RED_LINE_POINTS = [
  { x: 50, y: 335 },
  { x: 166, y: 335 },
  { x: 390, y: 335 },
  { x: 618, y: 335 },
  { x: 839, y: 335 },
  { x: 1064, y: 335 },
  { x: 1185, y: 335 },
] as const

// Position coordinates for Pak Sutrisno NPC in the hallway / lapangan
export const PAK_SUTRISNO_POS = { x: 740, y: 470 }

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
  const minX = RED_LINE_POINTS[0].x
  const maxX = RED_LINE_POINTS[RED_LINE_POINTS.length - 1].x

  if (y > 640) return false
  if (x < minX || x > maxX) return false

  const redLineY = getRedLineY(x)
  if (y < redLineY) {
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

export function checkRuangGuruWalkable(x: number, y: number): boolean {
  // Left wall / doorway and right plant limits
  if (x < 100 || x > 860) return false
  // Left entryway near door (x: 100-240)
  if (x < 240) {
    if (y < 530 || y > 625) return false
    return true
  }
  // Foreground open walkable floor in front of desks and rolling chairs
  if (y < 575 || y > 625) return false
  return true
}

// Facility Courtyard Walkable Bounds logic (Kantin, Lab Komputer, Perpustakaan)
export function checkFacilityWalkable(x: number, y: number): boolean {
  if (x < 60 || x > WORLD_VW - 60) return false
  if (y < 380 || y > 640) return false
  return true
}

// Lab Komputer Walkable & Obstacle Bounds logic (Central Aisle & Open Lower Floor, Blocking Desks)
export function checkLabKomputerWalkable(x: number, y: number): boolean {
  // Outer boundaries
  if (x < 60 || x > 1150) return false
  if (y > 630) return false

  // Doorway spawn area (bottom right) vs right wall
  if (y < 510 && x > 1020) return false

  // 1. Left computer desks cluster (tables, PCs, chairs)
  if (x >= 60 && x <= 530 && y <= 510) return false

  // 2. Right computer desks cluster (tables, PCs, chairs)
  if (x >= 715 && x <= 1020 && y <= 510) return false

  // 3. Front wall / whiteboard in central aisle
  if (y < 405) return false

  return true
}

// Perpustakaan Walkable & Obstacle Bounds logic (Central Aisle & Open Lower Floor, Blocking Reading Table & Bookshelves)
export function checkPerpustakaanWalkable(x: number, y: number): boolean {
  // Outer boundaries
  if (x < 60 || x > 1150) return false
  if (y > 630) return false

  // Entrance door area vs right wall
  if (y < 510 && x > 1070) return false

  // 1. Left reading table with wooden chairs (x: 200 - 620)
  if (x >= 200 && x <= 620 && y <= 490) return false

  // 2. Left window wall base / radiator
  if (x < 200 && y <= 480) return false

  // 3. Librarian desk counter with PC (x: 750 - 915)
  if (x >= 750 && x <= 915 && y <= 490) return false

  // 4. Right tall bookshelves (x: 915 - 1070)
  if (x >= 915 && x <= 1070 && y <= 500) return false

  // 5. Back wall / shelf in central aisle
  if (y < 415) return false

  return true
}

// School Front Gate Walkable Bounds logic (Street, Sidewalk & Open Gate Opening)
export function checkGateWalkable(x: number, y: number): boolean {
  if (x < 60 || x > WORLD_VW - 60) return false
  if (y > 630 || y < 330) return false

  // In the entrance driveway leading through the open gate:
  if (x >= 490 && x <= 745) {
    return y >= 330
  }

  // Outside the gate (sidewalk & street in front of fence/satpam):
  return y >= 445
}

// Level 1 Map Config Registry
export const LEVEL1_MAPS: Record<string, MapConfig> = {
  gate: {
    id: 'gate',
    name: 'Depan Gerbang SMP',
    type: 'hallway',
    bgImage: '/Assets/Building/Gerbang.jpg',
    camera: {
      mode: 'follow',
      vw: 380,
      vh: 380,
      preserveAspectRatio: 'none'
    },
    character: {
      baseSize: 145,
      depthFactor: 65,
      speed: 3.5
    },
    spawn: { x: 615, y: 575 },
    isWalkable: (x, y) => checkGateWalkable(x, y)
  },

  hallway: {
    id: 'hallway',
    name: 'Lorong Sekolah',
    type: 'hallway',
    bgImage: '/Assets/Building/Kelas.webp',
    camera: {
      mode: 'follow',
      vw: 380,
      vh: 380,
      preserveAspectRatio: 'none'
    },
    character: {
      baseSize: 145,
      depthFactor: 65,
      speed: 3.5 // Reduced by 10% from 3.9 (originally 5.2) for smoother, controlled exploration
    },
    spawn: { x: 625, y: 520 },
    isWalkable: (x, y) => checkHallwayWalkable(x, y)
  },

  facility_courtyard: {
    id: 'facility_courtyard',
    name: 'Halaman Fasilitas',
    type: 'hallway',
    bgImage: '/Assets/Building/Fasilitas.webp',
    camera: {
      mode: 'follow',
      vw: 380,
      vh: 380,
      preserveAspectRatio: 'none'
    },
    character: {
      baseSize: 145,
      depthFactor: 65,
      speed: 3.5
    },
    spawn: { x: 625, y: 550 },
    isWalkable: (x, y) => checkFacilityWalkable(x, y)
  },

  Perpustakaan: {
    id: 'Perpustakaan',
    name: 'Perpustakaan Sekolah',
    type: 'classroom',
    bgImage: '/Assets/Building/Perpustakaan/Perpustakaan.webp',
    camera: {
      mode: 'fixed',
      vw: WORLD_VW,
      vh: WORLD_VH,
      preserveAspectRatio: 'xMidYMid meet'
    },
    character: {
      baseSize: 375,
      depthFactor: 60,
      speed: 3.8
    },
    spawn: { x: 940, y: 540 },
    isWalkable: (x, y) => checkPerpustakaanWalkable(x, y)
  },

  LabKomputer: {
    id: 'LabKomputer',
    name: 'Laboratorium Komputer',
    type: 'classroom',
    bgImage: '/Assets/Building/Lab Komputer/Lab.webp',
    camera: {
      mode: 'fixed',
      vw: WORLD_VW,
      vh: WORLD_VH,
      preserveAspectRatio: 'xMidYMid meet'
    },
    character: {
      baseSize: 375,
      depthFactor: 60,
      speed: 3.8
    },
    spawn: { x: 940, y: 550 },
    isWalkable: (x, y) => checkLabKomputerWalkable(x, y)
  },

  A1: {
    id: 'A1',
    name: 'Ruang VII-A',
    type: 'classroom',
    bgImage: '/Assets/Building/Ruang VII-A/VII-A.webp',
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
    spawn: { x: 940, y: 540 },
    teacher: {
      name: 'Bu Sari (Wali Kelas VII-A)',
      x: 620,
      y: 380,
      size: 280,
      spriteUrl: '/Assets/Building/Ruang VII-A/Bu Sari.webp',
      cols: 5,
      rows: 5,
      totalFrames: 24,
      pingPong: false,
      speedMs: 90,
      showGlow: false,
      hotspotW: 140,
      hotspotH: 220
    },
    isWalkable: (x, y) => checkClassroomWalkable(x, y)
  },

  A2: {
    id: 'A2',
    name: 'Ruang VII-B',
    type: 'classroom',
    bgImage: '/Assets/Building/Ruang VII-B/VII-B.webp',
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
    spawn: { x: 920, y: 540 },
    teacher: {
      name: 'Pak Bambang (Wali Kelas VII-B)',
      x: 680,
      y: 350,
      size: 120,
      aspectRatio: 2.068,
      spriteUrl: '/Assets/Building/Ruang VII-B/Pak Bambang.png',
      cols: 1,
      rows: 1,
      totalFrames: 1,
      hotspotW: 140,
      hotspotH: 260
    },
    isWalkable: (x, y) => checkClassroomWalkable(x, y)
  },

  RG: {
    id: 'RG',
    name: 'Ruang Guru',
    type: 'classroom',
    bgImage: '/Assets/Building/Ruang Guru/Ruang Guru.webp',
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
    spawn: { x: 260, y: 595 },
    teacher: {
      name: 'Pak Sutrisno (Guru BK & Kedisiplinan)',
      x: 520,
      y: 595,
      size: 260,
      flipX: true,
      spriteUrl: '/Assets/Character/pak Sutrisno-iso_idle_right-trimmed.png',
      cols: 5,
      rows: 4,
      totalFrames: 20,
      pingPong: false,
      speedMs: 120,
      hotspotW: 140,
      hotspotH: 260
    },
    isWalkable: (x, y) => checkRuangGuruWalkable(x, y)
  },

  B1: {
    id: 'B1',
    name: 'Ruang VIII-A',
    type: 'classroom',
    bgImage: '/Assets/Building/Ruang VIII-A/VIII-A.webp',
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
    spawn: { x: 930, y: 540 },
    teacher: {
      name: 'Bu Rina (Wali Kelas VIII-A)',
      x: 620,
      y: 348,
      size: 120,
      aspectRatio: 2.068,
      spriteUrl: '/Assets/Building/Ruang VIII-A/Bu Rina.webp',
      cols: 1,
      rows: 1,
      totalFrames: 1,
      hotspotW: 140,
      hotspotH: 260
    },
    isWalkable: (x, y) => checkClassroomWalkable(x, y)
  },

  B2: {
    id: 'B2',
    name: 'Ruang VIII-B',
    type: 'classroom',
    bgImage: '/Assets/Building/Ruang VIII-B/VIII-B.webp',
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
    spawn: { x: 930, y: 540 },
    teacher: {
      name: 'Pak Setiawan (Wali Kelas VIII-B)',
      x: 615,
      y: 345,
      size: 120,
      aspectRatio: 2.068,
      spriteUrl: '/Assets/Building/Ruang VIII-B/Pak Setiawan.webp',
      cols: 1,
      rows: 1,
      totalFrames: 1,
      hotspotW: 140,
      hotspotH: 260
    },
    isWalkable: (x, y) => checkClassroomWalkable(x, y)
  },

  C1: {
    id: 'C1',
    name: 'Ruang IX',
    type: 'classroom',
    bgImage: '/Assets/Building/Ruang IX/IX.webp',
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
    spawn: { x: 930, y: 540 },
    teacher: {
      name: 'Pak Joko (Wali Kelas IX)',
      x: 617,
      y: 415,
      size: 130,
      aspectRatio: 2.068,
      spriteUrl: '/Assets/Building/Ruang IX/Pak Joko.webp',
      cols: 1,
      rows: 1,
      totalFrames: 1,
      hotspotW: 140,
      hotspotH: 260
    },
    isWalkable: (x, y) => checkClassroomWalkable(x, y)
  }
}
