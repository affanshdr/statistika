'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Vertical Hallway dimensions ──────────────────────────────────────────────
const VW = 800
const VH = 350
const SPEED = 1.35
const TOTAL_N = 35

type DoorId = 'A' | 'B' | 'C'

interface QuizDoor {
  id: string
  label: string
  color: string
  quizQ: string
  quizA: number | string
  hint: string
  count: number
  choices?: readonly (number | string)[]
  fdContext?: string
}

const DOORS = [
  { id: 'A' as DoorId, label: 'Pintu A (Kiri)', x: 175, y: 220,
    color: '#818cf8', quizQ: '3 × 3 = ?', quizA: 9, hint: '3 dikali 3 sama dengan 9', count: 9 },
  { id: 'B' as DoorId, label: 'Pintu B (Tengah)', x: 400, y: 180,
    color: '#00ADB5', quizQ: '3 × 5 = ?', quizA: 15, hint: '3 dikali 5 sama dengan 15', count: 15 },
  { id: 'C' as DoorId, label: 'Pintu C (Kanan)', x: 625, y: 220,
    color: '#f472b6', quizQ: '8 + 3 = ?', quizA: 11, hint: '8 ditambah 3 sama dengan 11', count: 11 },
] as const

const CLASS_DOORS = [
  // Room A (total 9) - Topik: Statistika (Bloom Level 2: Memahami)
  { 
    id: 'A1', roomId: 'A' as DoorId, label: 'Kelas VII-1', x: 52.5, y: 213, color: '#818cf8', 
    quizQ: 'Data screen time 5 siswa: 2, 4, 3, 8, 1 jam. Berapa rentang datanya?', 
    quizA: 7, choices: [5, 6, 7, 8] as const,
    fdContext: '💡 Ingat: rentang = nilai terbesar − nilai terkecil',
    hint: 'Kurangkan nilai terbesar (8) dengan nilai terkecil (1) untuk mendapatkan rentang.', count: 3 
  },
  { 
    id: 'A2', roomId: 'A' as DoorId, label: 'Kelas VII-2', x: 140, y: 186, color: '#818cf8', 
    quizQ: 'Tepi bawah kelas interval 4–6 adalah?', 
    quizA: 3.5, choices: [3, 3.5, 4, 4.5] as const,
    fdContext: '💡 Ingat: tepi bawah = batas bawah − 0.5',
    hint: 'Kurangi batas bawah kelas (4) dengan 0.5.', count: 3 
  },
  { 
    id: 'A3', roomId: 'A' as DoorId, label: 'Kelas VII-3', x: 227.5, y: 160, color: '#818cf8', 
    quizQ: 'Rentang = 17, Banyak Kelas = 6. Panjang kelas interval dibulatkan ke atas adalah?', 
    quizA: 3, choices: [2, 3, 4, 5] as const,
    fdContext: '💡 Ingat: panjang kelas = rentang ÷ banyak kelas, bulatkan ke atas.',
    hint: 'Bagi nilai rentang dengan banyak kelas, lalu bulatkan hasilnya ke atas.', count: 3 
  },

  // Room B (total 15) - Topik: Etika Media Sosial (Bloom Level 4: Menganalisis)
  { 
    id: 'B1', roomId: 'B' as DoorId, label: 'Kelas VIII-1', x: 320, y: 145, color: '#00ADB5', 
    quizQ: 'Kamu menerima berita viral yang belum terverifikasi. Tindakan paling etis adalah?', 
    quizA: 'Verifikasi dulu', choices: ['Langsung share', 'Verifikasi dulu', 'Screenshot & sebar', 'Abaikan saja'] as const,
    fdContext: '💡 Pikirkan dampaknya terhadap orang lain',
    hint: 'Cari tindakan yang memastikan kebenaran informasi sebelum membagikannya.', count: 5 
  },
  { 
    id: 'B2', roomId: 'B' as DoorId, label: 'Kelas VIII-2', x: 400, y: 145, color: '#00ADB5', 
    quizQ: 'Seseorang memposting foto orang lain tanpa izin untuk konten viral. Ini termasuk pelanggaran?', 
    quizA: 'Kedua-duanya', choices: ['Privasi', 'Hak cipta', 'Kedua-duanya', 'Bukan pelanggaran'] as const,
    fdContext: '💡 Pikirkan mengenai kepemilikan dan privasi hak orang lain',
    hint: 'Memposting foto orang lain melanggar ranah pribadi sekaligus kepemilikan ciptaan.', count: 5 
  },
  { 
    id: 'B3', roomId: 'B' as DoorId, label: 'Kelas VIII-3', x: 480, y: 145, color: '#00ADB5', 
    quizQ: 'Konten yang sengaja dibuat untuk memancing emosi negatif di media sosial disebut?', 
    quizA: 'Clickbait', choices: ['Clickbait', 'Hoax', 'Meme', 'Spam'] as const,
    fdContext: '💡 Pikirkan tujuan pembuat konten yang ingin menarik perhatian emosional secara instan',
    hint: 'Istilah ini merujuk pada pancingan tautan atau umpan klik untuk memicu reaksi emosi cepat.', count: 5 
  },

  // Room C (total 11) - Topik: Literasi Digital (Bloom Level 3-4: Mengaplikasikan & Menganalisis)
  { 
    id: 'C1', roomId: 'C' as DoorId, label: 'Kelas IX-1', x: 572.5, y: 160, color: '#f472b6', 
    quizQ: 'Ciri utama berita hoax yang paling umum adalah?', 
    quizA: 'Sumber tidak jelas', choices: ['Sumber tidak jelas', 'Ada foto', 'Ada tanggal', 'Ditulis wartawan'] as const,
    fdContext: '💡 Perhatikan kredibilitas pembuat informasi',
    hint: 'Berita bohong biasanya tidak menyebutkan asal-usul kredibel atau pihak penanggung jawab.', count: 4 
  },
  { 
    id: 'C2', roomId: 'C' as DoorId, label: 'Kelas IX-2', x: 660, y: 186, color: '#f472b6', 
    quizQ: 'Langkah pertama yang benar saat menemukan informasi mencurigakan di internet adalah?', 
    quizA: 'Cek sumber asli', choices: ['Cek sumber asli', 'Tanya teman', 'Langsung percaya', 'Share ke grup'] as const,
    fdContext: '💡 Telusuri keaslian data sebelum bertindak',
    hint: 'Selalu lakukan konfirmasi kebenaran ke situs atau pihak pertama yang merilis informasi.', count: 4 
  },
  { 
    id: 'C3', roomId: 'C' as DoorId, label: 'Kelas IX-3', x: 747.5, y: 213, color: '#f472b6', 
    quizQ: 'Jika tepi bawah kelas pertama 0.5 dan panjang kelas 3, tepi atas kelas pertama adalah?', 
    quizA: 3.5, choices: [3.5, 3, 4, 4.5] as const,
    fdContext: '💡 Ingat: tepi atas = tepi bawah + panjang kelas',
    hint: 'Jumlahkan tepi bawah kelas pertama dengan panjang kelasnya.', count: 3 
  },
] as const

const DATA_CIRCLES = [
  // Zone A - Ruang A (total 9)
  { id: 'a1', d: 'A', classId: 'A1', x: 40, y: 70 },
  { id: 'a2', d: 'A', classId: 'A1', x: 60, y: 70 },
  { id: 'a3', d: 'A', classId: 'A1', x: 50, y: 95 },
  
  { id: 'a4', d: 'A', classId: 'A2', x: 120, y: 70 },
  { id: 'a5', d: 'A', classId: 'A2', x: 140, y: 70 },
  { id: 'a6', d: 'A', classId: 'A2', x: 130, y: 95 },
  
  { id: 'a7', d: 'A', classId: 'A3', x: 200, y: 70 },
  { id: 'a8', d: 'A', classId: 'A3', x: 220, y: 70 },
  { id: 'a9', d: 'A', classId: 'A3', x: 210, y: 95 },

  // Zone B - Ruang B (total 15)
  { id: 'b1', d: 'B', classId: 'B1', x: 310, y: 60 },
  { id: 'b2', d: 'B', classId: 'B1', x: 330, y: 60 },
  { id: 'b3', d: 'B', classId: 'B1', x: 320, y: 80 },
  { id: 'b4', d: 'B', classId: 'B1', x: 310, y: 100 },
  { id: 'b5', d: 'B', classId: 'B1', x: 330, y: 100 },
  
  { id: 'b6', d: 'B', classId: 'B2', x: 390, y: 60 },
  { id: 'b7', d: 'B', classId: 'B2', x: 410, y: 60 },
  { id: 'b8', d: 'B', classId: 'B2', x: 400, y: 80 },
  { id: 'b9', d: 'B', classId: 'B2', x: 390, y: 100 },
  { id: 'b10', d: 'B', classId: 'B2', x: 410, y: 100 },
  
  { id: 'b11', d: 'B', classId: 'B3', x: 470, y: 60 },
  { id: 'b12', d: 'B', classId: 'B3', x: 490, y: 60 },
  { id: 'b13', d: 'B', classId: 'B3', x: 480, y: 80 },
  { id: 'b14', d: 'B', classId: 'B3', x: 470, y: 100 },
  { id: 'b15', d: 'B', classId: 'B3', x: 490, y: 100 },

  // Zone C - Ruang C (total 11)
  { id: 'c1', d: 'C', classId: 'C1', x: 560, y: 70 },
  { id: 'c2', d: 'C', classId: 'C1', x: 580, y: 70 },
  { id: 'c3', d: 'C', classId: 'C1', x: 570, y: 95 },
  { id: 'c4', d: 'C', classId: 'C1', x: 570, y: 115 },
  
  { id: 'c5', d: 'C', classId: 'C2', x: 640, y: 70 },
  { id: 'c6', d: 'C', classId: 'C2', x: 660, y: 70 },
  { id: 'c7', d: 'C', classId: 'C2', x: 650, y: 95 },
  { id: 'c8', d: 'C', classId: 'C2', x: 650, y: 115 },
  
  { id: 'c9', d: 'C', classId: 'C3', x: 720, y: 70 },
  { id: 'c10', d: 'C', classId: 'C3', x: 740, y: 70 },
  { id: 'c11', d: 'C', classId: 'C3', x: 730, y: 95 },
]

const AMBIENT_PARTICLES = [
  { cx: 50, cy: 60, r: 1.2, className: 'particle-drift-1', color: '#818cf8' },
  { cx: 120, cy: 110, r: 0.8, className: 'particle-drift-2', color: '#818cf8' },
  { cx: 180, cy: 50, r: 1.5, className: 'particle-drift-3', color: '#818cf8' },
  { cx: 220, cy: 120, r: 1.0, className: 'particle-drift-1', color: '#818cf8' },
  { cx: 90, cy: 150, r: 0.7, className: 'particle-drift-2', color: '#818cf8' },
  { cx: 260, cy: 90, r: 1.1, className: 'particle-drift-3', color: '#818cf8' },

  { cx: 310, cy: 70, r: 1.3, className: 'particle-drift-2', color: '#00ADB5' },
  { cx: 350, cy: 120, r: 0.9, className: 'particle-drift-3', color: '#00ADB5' },
  { cx: 400, cy: 50, r: 1.6, className: 'particle-drift-1', color: '#00ADB5' },
  { cx: 450, cy: 110, r: 0.8, className: 'particle-drift-2', color: '#00ADB5' },
  { cx: 490, cy: 60, r: 1.2, className: 'particle-drift-3', color: '#00ADB5' },

  { cx: 550, cy: 120, r: 1.0, className: 'particle-drift-3', color: '#f472b6' },
  { cx: 600, cy: 50, r: 1.4, className: 'particle-drift-1', color: '#f472b6' },
  { cx: 650, cy: 110, r: 0.8, className: 'particle-drift-2', color: '#f472b6' },
  { cx: 700, cy: 60, r: 1.5, className: 'particle-drift-3', color: '#f472b6' },
  { cx: 750, cy: 130, r: 1.1, className: 'particle-drift-1', color: '#f472b6' },
  { cx: 580, cy: 90, r: 0.7, className: 'particle-drift-2', color: '#f472b6' },
  { cx: 680, cy: 150, r: 1.2, className: 'particle-drift-3', color: '#f472b6' },

  { cx: 100, cy: 280, r: 1.0, className: 'particle-drift-1', color: '#00ADB5' },
  { cx: 220, cy: 310, r: 0.8, className: 'particle-drift-2', color: '#00ADB5' },
  { cx: 340, cy: 290, r: 1.3, className: 'particle-drift-3', color: '#00ADB5' },
  { cx: 460, cy: 320, r: 0.9, className: 'particle-drift-1', color: '#00ADB5' },
  { cx: 580, cy: 280, r: 1.4, className: 'particle-drift-2', color: '#00ADB5' },
  { cx: 700, cy: 300, r: 0.7, className: 'particle-drift-3', color: '#00ADB5' },
] as const;

const CLASS_STUDENTS: Record<string, { teacher: string; comment: string; students: { name: string; time: number }[] }> = {
  A1: {
    teacher: 'Bu Sari',
    comment: 'Wah, Budi ini rajin belajar ya, screen time-nya paling rendah di kelas!',
    students: [
      { name: 'Adit', time: 3 },
      { name: 'Budi', time: 2 },
      { name: 'Cici', time: 4 },
    ]
  },
  A2: {
    teacher: 'Pak Bambang',
    comment: 'Deni ini sepertinya perlu dikurangi nih main HP-nya agar matanya tidak cepat lelah.',
    students: [
      { name: 'Deni', time: 5 },
      { name: 'Evi', time: 3 },
      { name: 'Fani', time: 2 },
    ]
  },
  A3: {
    teacher: 'Bu Tina',
    comment: 'Secara umum, rata-rata screen time siswa di kelas VII-3 ini adalah sekitar 3,6 jam per hari.',
    students: [
      { name: 'Gita', time: 4 },
      { name: 'Hadi', time: 3 },
      { name: 'Indra', time: 4 },
    ]
  },
  B1: {
    teacher: 'Bu Rina',
    comment: 'Hebat sekali, Mira sangat disiplin membatasi penggunaan HP-nya hanya 3 jam sehari!',
    students: [
      { name: 'Joko', time: 5 },
      { name: 'Kiki', time: 4 },
      { name: 'Lia', time: 6 },
      { name: 'Mira', time: 3 },
      { name: 'Niko', time: 5 },
    ]
  },
  B2: {
    teacher: 'Pak Setiawan',
    comment: 'Aduh, Tono sepertinya perlu lebih bijak menggunakan HP-nya agar tidak kecanduan game.',
    students: [
      { name: 'Oki', time: 4 },
      { name: 'Putri', time: 5 },
      { name: 'Rian', time: 3 },
      { name: 'Santi', time: 4 },
      { name: 'Tono', time: 6 },
    ]
  },
  B3: {
    teacher: 'Bu Yuli',
    comment: 'Rata-rata screen time di kelas VIII-3 ini berkisar 4,2 jam, masih cukup wajar untuk remaja.',
    students: [
      { name: 'Umar', time: 5 },
      { name: 'Vina', time: 4 },
      { name: 'Wawan', time: 3 },
      { name: 'Xena', time: 5 },
      { name: 'Yayan', time: 4 },
    ]
  },
  C1: {
    teacher: 'Pak Joko',
    comment: 'Zaki perlu membagi waktu lebih baik karena screen time-nya mencapai 6 jam per hari.',
    students: [
      { name: 'Zaki', time: 6 },
      { name: 'Alma', time: 5 },
      { name: 'Bimo', time: 4 },
      { name: 'Dian', time: 5 },
    ]
  },
  C2: {
    teacher: 'Bu Endang',
    comment: 'Wah, Elga dan Hana rajin belajar ya, screen time mereka paling rendah di kelas IX-2!',
    students: [
      { name: 'Elga', time: 4 },
      { name: 'Farhan', time: 6 },
      { name: 'Gani', time: 5 },
      { name: 'Hana', time: 4 },
    ]
  },
  C3: {
    teacher: 'Bu Sri',
    comment: 'Secara keseluruhan, rata-rata screen time di kelas IX-3 adalah 4 jam per hari.',
    students: [
      { name: 'Irfan', time: 5 },
      { name: 'Jihan', time: 4 },
      { name: 'Koko', time: 3 },
    ]
  },
}

function checkClassCollision(
  x: number,
  y: number,
  door: typeof CLASS_DOORS[number],
  unlocked: Set<string>,
  hallwayY: number,
  startX: number,
  endX: number,
  R: number
): boolean {
  if (x >= startX - R && x <= endX + R) {
    if (startX > 15 && x > startX - R && x < startX + R && y < hallwayY) return false
    if (endX < 780 && x > endX - R && x < endX + R && y < hallwayY) return false

    if (x >= startX && x <= endX) {
      const insideGap = x >= door.x - 15 && x <= door.x + 15
      const crossingWall = y > hallwayY - R && y < hallwayY + R
      if (crossingWall) {
        if (!unlocked.has(door.id) || !insideGap) {
          return false
        }
      }
    }
  }
  return true
}

// Walkability: check if character is inside the vertical hallway or unlocked rooms
function isWalkable(x: number, y: number, unlocked: Set<string>): boolean {
  const R = 6.0 // player radius padding for landscape map

  if (x < 10 + R || x > 790 - R || y < 30 + R || y > 330 - R) return false

  const leftDiagY = 260 - (x - 10) * (8/27)
  const rightDiagY = 180 + (x - 520) * (8/27)

  if (x < 280 && y < leftDiagY) {
    if (!unlocked.has('A')) return false
    if (x > 280 - R) return false
    const atDoorA = x >= 160 && x <= 190
    if (!atDoorA && y > leftDiagY - R) return false

    if (!checkClassCollision(x, y, CLASS_DOORS[0], unlocked, leftDiagY - 35, 10, 95, R)) return false
    if (!checkClassCollision(x, y, CLASS_DOORS[1], unlocked, leftDiagY - 35, 95, 185, R)) return false
    if (!checkClassCollision(x, y, CLASS_DOORS[2], unlocked, leftDiagY - 35, 185, 280, R)) return false

    return true
  }

  if (x > 520 && y < rightDiagY) {
    if (!unlocked.has('C')) return false
    if (x < 520 + R) return false
    const atDoorC = x >= 610 && x <= 640
    if (!atDoorC && y > rightDiagY - R) return false

    if (!checkClassCollision(x, y, CLASS_DOORS[6], unlocked, rightDiagY - 35, 520, 610, R)) return false
    if (!checkClassCollision(x, y, CLASS_DOORS[7], unlocked, rightDiagY - 35, 610, 700, R)) return false
    if (!checkClassCollision(x, y, CLASS_DOORS[8], unlocked, rightDiagY - 35, 700, 790, R)) return false

    return true
  }

  if (x >= 280 && x <= 520 && y < 180) {
    if (!unlocked.has('B')) return false
    if (x < 280 + R || x > 520 - R) return false
    const atDoorB = x >= 385 && x <= 415
    if (!atDoorB && y > 180 - R) return false

    if (!checkClassCollision(x, y, CLASS_DOORS[3], unlocked, 145, 280, 360, R)) return false
    if (!checkClassCollision(x, y, CLASS_DOORS[4], unlocked, 145, 360, 440, R)) return false
    if (!checkClassCollision(x, y, CLASS_DOORS[5], unlocked, 145, 440, 520, R)) return false

    return true
  }

  if (x < 280) {
    const atDoorA = unlocked.has('A') && x >= 160 && x <= 190
    if (!atDoorA && y < leftDiagY + R) return false
  } else if (x > 520) {
    const atDoorC = unlocked.has('C') && x >= 610 && x <= 640
    if (!atDoorC && y < rightDiagY + R) return false
  } else {
    const atDoorB = unlocked.has('B') && x >= 385 && x <= 415
    if (!atDoorB && y < 180 + R) return false
  }

  return true
}

// ─── Joystick ─────────────────────────────────────────────────────────────────
function Joystick({ onDir }: { onDir: (x: number, y: number) => void }) {
  const outer = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const on = useRef(false)
  const R = 34

  const compute = (cx: number, cy: number) => {
    const el = outer.current; if (!el) return
    const b = el.getBoundingClientRect()
    const dx = cx - (b.left + b.width / 2)
    const dy = cy - (b.top + b.height / 2)
    const d = Math.sqrt(dx * dx + dy * dy)
    onDir(Math.max(-1, Math.min(1, d > 0 ? dx / Math.max(d, R) : 0)), Math.max(-1, Math.min(1, d > 0 ? dy / Math.max(d, R) : 0)))
    if (knob.current) knob.current.style.transform =
      `translate(calc(-50% + ${(dx / Math.max(d, 1)) * Math.min(d, R)}px),calc(-50% + ${(dy / Math.max(d, 1)) * Math.min(d, R)}px))`
  }

  const reset = () => { on.current = false; onDir(0, 0); if (knob.current) knob.current.style.transform = 'translate(-50%,-50%)' }

  return (
    <div style={{ width: R * 2, height: R * 2, borderRadius: '50%', background: 'rgba(14, 131, 136, 0.12)', border: '2px solid rgba(255,255,255,0.15)', position: 'relative', touchAction: 'none', userSelect: 'none' }}
      ref={outer}
      onPointerDown={e => { on.current = true; outer.current?.setPointerCapture(e.pointerId); compute(e.clientX, e.clientY) }}
      onPointerMove={e => { if (on.current) compute(e.clientX, e.clientY) }}
      onPointerUp={reset} onPointerCancel={reset}>
      <div ref={knob} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#00ADB5 0%,#818cf8 100%)', boxShadow: '0 0 8px #00ADB5', pointerEvents: 'none' }} />
    </div>
  )
}

// Helper to generate choice pool for answers
function generateAnswerPool(correctAnswer: number): number[] {
  const pool = new Set<number>()
  pool.add(correctAnswer)
  
  // Distractors must be within range ±2 to ±3 from correctAnswer
  const candidates: number[] = []
  for (let offset = -3; offset <= 3; offset++) {
    if (offset === 0) continue
    if (Math.abs(offset) < 2) continue // Only allow ±2 and ±3
    const val = correctAnswer + offset
    if (val > 0) { // must be positive (greater than 0)
      candidates.push(val)
    }
  }
  
  // If we don't have enough candidates (e.g. correctAnswer is very small like 1 or 2), let's expand candidate range to ±1, +4, +5 but always positive.
  if (candidates.length < 3) {
    for (let offset = -3; offset <= 5; offset++) {
      if (offset === 0) continue
      const val = correctAnswer + offset
      if (val > 0 && val !== correctAnswer && !candidates.includes(val)) {
        candidates.push(val)
      }
    }
  }
  
  // Shuffle candidates and pick 3 distractors so that total pool size is 4
  const shuffledCandidates = [...candidates].sort(() => Math.random() - 0.5)
  const numDistractors = Math.min(3, shuffledCandidates.length)
  for (let i = 0; i < numDistractors; i++) {
    pool.add(shuffledCandidates[i])
  }
  
  // Fallback: if we still don't have 4 choices, add more positive numbers close by
  let offset = 4
  while (pool.size < 4) {
    const val = correctAnswer + offset
    if (val > 0 && !pool.has(val)) {
      pool.add(val)
    }
    const val2 = correctAnswer - offset
    if (val2 > 0 && !pool.has(val2)) {
      pool.add(val2)
    }
    offset++
  }
  
  // Convert to array and shuffle
  return Array.from(pool).sort(() => Math.random() - 0.5)
}

// Helper to get dynamic hint focusing on process
function getProcessHint(quizQ: string): string {
  const isWordProblem = /[a-zA-Z]{3,}/.test(quizQ) && quizQ.length > 15;
  
  if (isWordProblem) {
    return "Baca ulang soalnya pelan-pelan, angka mana yang perlu dihitung? 🤔";
  }
  
  const hasMult = quizQ.includes('×') || quizQ.includes('*');
  const hasAddSub = quizQ.includes('+') || quizQ.includes('-');
  if (hasMult && hasAddSub) {
    return "Selesaikan perkalian/pembagian terlebih dahulu, baru lakukan penjumlahan/pengurangan 🤔";
  }
  
  if (hasMult) {
    return "Ingat, a × b berarti a dijumlahkan sebanyak b kali 🤔";
  }
  if (quizQ.includes('-')) {
    return "Bayangkan kamu punya sejumlah sesuatu, lalu dikurangi 🤔";
  }
  if (quizQ.includes('+')) {
    return "Coba jumlahkan kedua angka satu per satu 🤔";
  }
  
  return "Coba hitung kembali dengan teliti ya 🤔";
}

interface VisualHintModalProps {
  door: QuizDoor
  onClose: () => void
}

function VisualHintModal({ door, onClose }: VisualHintModalProps) {
  const [hintStep, setHintStep] = useState<1 | 2 | 3>(1)

  const renderIllustration = () => {
    switch (door.id) {
      case 'A': // Room A door (3 × 3 = 9)
      case 'B': // Room B door (3 × 5 = 15)
        {
          const rows = door.id === 'A' ? 3 : 5
          const cols = 3
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              {Array.from({ length: rows }).map((_, rIdx) => (
                <div key={rIdx} style={{ display: 'flex', gap: 8 }}>
                  {Array.from({ length: cols }).map((_, cIdx) => {
                    const idx = rIdx * cols + cIdx + 1
                    return (
                      <div key={cIdx} style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: hintStep >= 2 ? 'rgba(0, 173, 181, 0.2)' : 'rgba(0, 173, 181, 0.05)',
                        border: '1.5px solid #00ADB5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#FFFFFF', fontWeight: 900, fontSize: 13,
                        boxShadow: hintStep >= 2 ? '0 0 8px rgba(0, 173, 181, 0.4)' : 'none',
                        transition: 'all 0.3s'
                      }}>
                        {hintStep >= 2 ? idx : ''}
                      </div>
                    )
                  })}
                </div>
              ))}
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8, textAlign: 'center', fontWeight: 600 }}>
                {hintStep === 1 ? `${rows} baris, masing-masing berisi ${cols} objek.` : 'Hitung jumlah seluruh objek satu per satu:'}
              </div>
            </div>
          )
        }

      case 'C': // Room C door (8 + 3 = 11)
        {
          const leftCount = 8
          const rightCount = 3
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                {/* Left Group */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 120, justifyContent: 'center' }}>
                  {Array.from({ length: leftCount }).map((_, i) => (
                    <div key={i} style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: hintStep >= 2 ? 'rgba(129, 140, 248, 0.25)' : 'rgba(129, 140, 248, 0.08)',
                      border: '1.5px solid #818cf8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFFFFF', fontWeight: 900, fontSize: 11,
                      boxShadow: hintStep >= 2 ? '0 0 6px rgba(129, 140, 248, 0.4)' : 'none',
                      transition: 'all 0.3s'
                    }}>
                      {hintStep >= 2 ? i + 1 : ''}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: door.color }}>+</div>
                {/* Right Group */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 120, justifyContent: 'center' }}>
                  {Array.from({ length: rightCount }).map((_, i) => (
                    <div key={i} style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: hintStep >= 2 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.08)',
                      border: '1.5px solid #10b981',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFFFFF', fontWeight: 900, fontSize: 11,
                      boxShadow: hintStep >= 2 ? '0 0 6px rgba(16, 185, 129, 0.4)' : 'none',
                      transition: 'all 0.3s'
                    }}>
                      {hintStep >= 2 ? leftCount + i + 1 : ''}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, textAlign: 'center', fontWeight: 600 }}>
                {hintStep === 1 ? `Gabungkan grup kiri (${leftCount} objek) dan grup kanan (${rightCount} objek).` : 'Hitung total gabungan objek:'}
              </div>
            </div>
          )
        }

      case 'A1': // VII-1: Rentang dari data [2, 4, 3, 8, 1] (Jwb: 7)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)', border: '1.5px solid #EF4444', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#EF4444', fontWeight: 800, marginBottom: 4 }}>TERKECIL</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF' }}>1</div>
              </div>
              <div style={{ fontSize: 20, color: '#94A3B8', fontWeight: 'bold' }}>sampai</div>
              <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid #10b981', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#10b981', fontWeight: 800, marginBottom: 4 }}>TERBESAR</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF' }}>8</div>
              </div>
            </div>
            {hintStep >= 2 && (
              <div style={{ fontSize: 16, fontWeight: 800, color: '#00ADB5', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10, width: '100%', textAlign: 'center' }}>
                Rentang = 8 − 1 = 7
              </div>
            )}
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Rentang dihitung dengan mencari selisih antara nilai terbesar (8) dan terkecil (1).' : 'Kurangkan nilai terbesar dengan nilai terkecil.'}
            </div>
          </div>
        )

      case 'A2': // VII-2: Tepi bawah dari kelas 4-6? (Jwb: 3.5)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 800, marginBottom: 4 }}>BATAS BAWAH</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF' }}>4</div>
              </div>
              <div style={{ fontSize: 20, color: '#00ADB5', fontWeight: 'bold' }}>− 0.5</div>
              {hintStep >= 2 && (
                <div style={{ padding: '10px 14px', background: 'rgba(0,173,181,0.1)', border: '1.5px solid #00ADB5', borderRadius: 12, textAlign: 'center', boxShadow: '0 0 10px rgba(0,173,181,0.3)' }}>
                  <div style={{ fontSize: 10, color: '#00ADB5', fontWeight: 800, marginBottom: 4 }}>TEPI BAWAH</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#00ADB5' }}>3.5</div>
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Tepi bawah diperoleh dengan mengurangkan batas bawah kelas dengan 0.5.' : 'Kurangkan batas bawah (4) dengan 0.5 untuk memperoleh tepi bawah: 4 − 0.5 = 3.5.'}
            </div>
          </div>
        )

      case 'A3': // VII-3: Rentang = 17, banyak kelas = 6. Panjang kelas dibulatkan ke atas? (Jwb: 3)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', width: '100%' }}>
            <div style={{ padding: '12px 16px', background: 'rgba(0,173,181,0.06)', border: '1px solid rgba(0,173,181,0.2)', borderRadius: 12, width: '90%', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 800, marginBottom: 6 }}>RUMUS PANJANG KELAS</div>
              <div style={{ fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'monospace' }}>
                Panjang Kelas = Rentang ÷ Banyak Kelas
              </div>
              {hintStep >= 2 && (
                <div style={{ fontSize: 15, fontWeight: 'bold', color: '#00ADB5', fontFamily: 'monospace', marginTop: 8, borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 8 }}>
                  17 ÷ 6 = 2.83... → Bulatkan ke atas = 3
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Bagi rentang data dengan banyak kelas sesuai rumus.' : 'Hasil pembagian adalah 2.83. Dibulatkan ke atas menjadi bilangan bulat terdekat yaitu 3.'}
            </div>
          </div>
        )

      case 'B1': // VIII-1: Tindakan paling etis atas berita belum terverifikasi (Jwb: Verifikasi dulu)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '90%' }}>
              <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, textAlign: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 'bold', color: '#E2E8F0' }}>Penerimaan Berita Baru 📰</span>
              </div>
              {hintStep >= 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ padding: '8px 10px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, fontSize: 11, color: '#EF4444' }}>
                    ❌ Langsung Share / Sebar ➡️ Potensi hoax & fitnah!
                  </div>
                  <div style={{ padding: '8px 10px', background: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid #10b981', borderRadius: 8, fontSize: 11, color: '#10B981', fontWeight: 'bold', boxShadow: '0 0 6px rgba(16, 185, 129, 0.2)' }}>
                    ✅ Verifikasi ➡️ Cek fakta agar aman & bermanfaat!
                  </div>
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Mendapat berita viral membutuhkan penyaringan yang ketat sebelum dibagikan.' : 'Prioritaskan tindakan yang memverifikasi kebenaran berita terlebih dahulu.'}
            </div>
          </div>
        )

      case 'B2': // VIII-2: Posting foto tanpa izin (Jwb: Kedua-duanya)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', width: '90%' }}>
              <div style={{ flex: 1, padding: 10, background: 'rgba(0,173,181,0.05)', border: '1px solid #00ADB5', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 18 }}>🔒</div>
                <div style={{ fontSize: 11, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 }}>Hak Privasi</div>
                <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>Kebebasan individu</div>
              </div>
              <div style={{ flex: 1, padding: 10, background: 'rgba(0,173,181,0.05)', border: '1px solid #00ADB5', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 18 }}>🎨</div>
                <div style={{ fontSize: 11, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 }}>Hak Cipta</div>
                <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>Kepemilikan karya</div>
              </div>
            </div>
            {hintStep >= 2 && (
              <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid #10b981', borderRadius: 8, width: '90%', textAlign: 'center', fontSize: 12, color: '#10B981', fontWeight: 'bold' }}>
                Kedua hak tersebut dilanggar sekaligus!
              </div>
            )}
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Mempublikasikan foto potret seseorang menyangkut ranah pribadi dan kepemilikan visual.' : 'Karena melanggar kebebasan pribadi dan kepemilikan karya, maka pilihan yang tepat adalah kedua-duanya.'}
            </div>
          </div>
        )

      case 'B3': // VIII-3: Konten memancing emosi negatif (Jwb: Clickbait)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', width: '100%' }}>
            <div style={{ padding: '12px 16px', background: 'rgba(217, 119, 6, 0.06)', border: '1px solid #d97706', borderRadius: 12, width: '90%', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#ffb060', fontWeight: 800, marginBottom: 4, letterSpacing: '1px' }}>DEFINISI KUNCI</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' }}>
                "Umpan klik" / Clickbait 🎣
              </div>
              {hintStep >= 2 && (
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6, borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 6 }}>
                  Konten provokatif sengaja didesain untuk memicu amarah/emosi instan pembaca agar mengeklik tautan tersebut.
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Istilah ini menggambarkan pancingan judul atau umpan visual yang memicu respons emosional.' : 'Pancingan semacam ini dikenal secara umum dengan sebutan Clickbait.'}
            </div>
          </div>
        )

      case 'C1': // IX-1: Ciri hoax yang paling umum (Jwb: Sumber tidak jelas)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%' }}>
            <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 10, width: '90%' }}>
              <div style={{ fontSize: 10, color: '#EF4444', fontWeight: 800, marginBottom: 4 }}>CHECKLIST HOAX:</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11.5, color: '#E2E8F0', display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left' }}>
                <li>Informasi bombastis & berlebihan</li>
                <li style={{ color: hintStep >= 2 ? '#EF4444' : '#E2E8F0', fontWeight: hintStep >= 2 ? 'bold' : 'normal' }}>
                  Tidak memiliki sumber rujukan yang jelas/kredibel
                </li>
                <li>Meminta informasi disebarkan secara instan</li>
              </ul>
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Ciri utama berita palsu yang paling mencolok terletak pada asal-usul kredibilitas beritanya.' : 'Ciri paling umum adalah sumber informasinya tidak jelas atau tidak dapat dipertanggungjawabkan.'}
            </div>
          </div>
        )

      case 'C2': // IX-2: Langkah pertama saat menemukan info mencurigakan (Jwb: Cek sumber asli)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '90%' }}>
              <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, textAlign: 'center' }}>
                <span style={{ fontSize: 12, color: '#E2E8F0', fontWeight: 'bold' }}>🔎 Menemukan Info Mencurigakan</span>
              </div>
              {hintStep >= 2 && (
                <div style={{ padding: '10px 12px', background: 'rgba(0,173,181,0.08)', border: '1.5px solid #00ADB5', borderRadius: 8, textAlign: 'center', fontSize: 12, color: '#00ADB5', fontWeight: 'bold' }}>
                  Langkah 1: Menelusuri & Cek Sumber Aslinya!
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Sebelum mempercayai atau membagikan, langkah pertama adalah melakukan penelusuran fakta.' : 'Tindakan awal yang benar adalah memverifikasi langsung ke sumber rujukan orisinalnya.'}
            </div>
          </div>
        )

      case 'C3': // IX-3: Platform verifikasi berita di Indonesia (Jwb: TurnBackHoax)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', width: '100%' }}>
            <div style={{ padding: '12px 16px', background: 'rgba(0,173,181,0.06)', border: '1px solid rgba(0,173,181,0.2)', borderRadius: 12, width: '90%', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#00ADB5', fontWeight: 800, marginBottom: 4 }}>DATABASE RUJUKAN CEK FAKTA</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'monospace' }}>
                🌐 Mafindo (TurnBackHoax)
              </div>
              {hintStep >= 2 && (
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 6 }}>
                  Situs independen cek fakta yang mengarsipkan berbagai klarifikasi hoaks secara resmi di Indonesia.
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Pilihlah portal cek fakta komunitas anti-fitnah resmi yang terdaftar di Indonesia.' : 'Platform cek fakta Indonesia yang terpopuler dan terakreditasi adalah TurnBackHoax.'}
            </div>
          </div>
        )

      default:
        return <div style={{ color: '#E2E8F0', fontSize: 13 }}>Ilustrasi bantuan tidak tersedia 🤔</div>
    }
  }

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 600,
        background: 'rgba(4, 7, 10, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 15 }}
        style={{
          maxWidth: 400,
          width: '100%',
          background: 'rgba(15, 35, 56, 0.98)',
          border: '2px solid #00ADB5',
          boxShadow: '0 0 25px rgba(0, 173, 181, 0.35)',
          borderRadius: 24,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
        onClick={e => e.stopPropagation()}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#00ADB5', letterSpacing: '2px', marginBottom: 4 }}>🧠 BANTUAN VISUAL STEP-BY-STEP</div>
          <h3 style={{ margin: 0, fontSize: 16, color: '#FFFFFF', fontWeight: 800 }}>Teka-teki: {door.label}</h3>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {[1, 2, 3].map(st => (
            <div key={st} style={{
              flex: 1, height: 6, borderRadius: 3,
              background: hintStep === st ? '#00ADB5' : hintStep > st ? 'rgba(0,173,181,0.3)' : 'rgba(255,255,255,0.06)',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        {/* Teks Soal Aktif */}
        <div style={{ 
          background: 'rgba(0, 173, 181, 0.06)', 
          border: '1.5px solid rgba(0, 173, 181, 0.25)', 
          borderRadius: 14, 
          padding: '10px 14px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            SOAL AKTIF
          </div>
          <div style={{ 
            fontSize: door.quizQ.length > 30 ? '13px' : '16px', 
            fontWeight: 900, 
            color: '#FFFFFF', 
            fontFamily: 'var(--font-data)', 
            lineHeight: 1.4 
          }}>
            {door.quizQ}
          </div>
        </div>

        {/* Illustration Canvas Area */}
        <div style={{
          minHeight: 180,
          background: 'rgba(4, 7, 10, 0.4)',
          border: '1px solid rgba(14, 131, 136, 0.15)',
          borderRadius: 16,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {hintStep === 3 ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🤔</div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.5 }}>
                Jadi totalnya berapa?<br />
                <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>Tutup bantuan ini lalu seret jawaban yang tepat!</span>
              </p>
            </div>
          ) : (
            renderIllustration()
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="game-btn game-btn-secondary" style={{ flex: 1, padding: '10px 14px', fontSize: 13, background: 'rgba(239, 68, 68, 0.08)', border: '1.5px solid #EF4444', color: '#EF4444' }} onClick={onClose}>Tutup</button>
          {hintStep < 3 && (
            <button className="game-btn game-btn-primary" style={{ flex: 1.5, padding: '10px 14px', fontSize: 13 }} onClick={() => setHintStep(curr => (curr + 1) as any)}>
              Lanjut →
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Quiz popup ───────────────────────────────────────────────────────────────
function QuizPopup({ door, isFD, onCorrect, onClose }:
  { door: QuizDoor; isFD: boolean; onCorrect: () => void; onClose: () => void }) {
  const [shake, setShake] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [openVisualModal, setOpenVisualModal] = useState(false)
  const [choices, setChoices] = useState<(number | string)[]>([])
  const [placedChoice, setPlacedChoice] = useState<number | string | null>(null)
  const [resetKeys, setResetKeys] = useState<Record<string, number>>({})
  const [isCorrect, setIsCorrect] = useState(false)
  const [isWrong, setIsWrong] = useState(false)

  useEffect(() => {
    if (door.choices) {
      setChoices([...door.choices].sort(() => Math.random() - 0.5))
    } else {
      setChoices(generateAnswerPool(Number(door.quizA)))
    }
    setPlacedChoice(null)
    setIsCorrect(false)
    setIsWrong(false)
    setWrongCount(0)
    setOpenVisualModal(false)
  }, [door])

  // Automatically open the visual modal when the threshold is hit
  useEffect(() => {
    const needsVisual = isFD ? (wrongCount >= 2) : (wrongCount >= 3)
    if (needsVisual) {
      setOpenVisualModal(true)
    }
  }, [wrongCount, isFD])

  const handlePlaceAnswer = (val: number | string) => {
    if (val === door.quizA) {
      setPlacedChoice(val)
      setIsCorrect(true)
      setIsWrong(false)
    } else {
      setPlacedChoice(val)
      setIsWrong(true)
      setIsCorrect(false)
      setShake(k => k + 1)
      setWrongCount(prev => prev + 1)
      // Snap it back after a short red animation
      setTimeout(() => {
        setPlacedChoice(null)
        setIsWrong(false)
        setResetKeys(prev => ({ ...prev, [val]: (prev[val] ?? 0) + 1 }))
      }, 800)
    }
  }

  const submit = () => {
    if (isCorrect) {
      onCorrect()
    }
  }

  const showTextHint = isFD ? (wrongCount >= 1) : (wrongCount >= 2)
  const showVisualHint = isFD ? (wrongCount >= 2) : (wrongCount >= 3)

  const isTextQuestion = typeof door.quizA === 'string'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(11, 30, 44, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.88, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 18 }}
          transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          style={{
            maxWidth: 420,
            width: '100%',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
            background: 'rgba(15, 35, 56, 0.95)',
            border: `2.5px solid ${door.color}66`,
            borderRadius: 24,
            padding: '24px 20px',
            boxShadow: '0 10px 35px rgba(14, 131, 136, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '2px', color: door.color, marginBottom: 8 }}>🔐 {door.label} — Jawab untuk membuka!</div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#E2E8F0', lineHeight: 1.6 }}>Di dalam pintu ini tersimpan data screen time. Jawab soal berikut untuk membuka pintu:</p>
          </div>
          <div style={{ background: `${door.color}11`, border: `1.5px solid ${door.color}33`, borderRadius: 16, padding: '16px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: door.quizQ.length > 20 ? (door.quizQ.length > 50 ? 14 : 16) : 22, fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-data)', lineHeight: 1.4 }}>{door.quizQ}</div>
            
            {/* FD Context Hint */}
            {isFD && door.fdContext && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#ffb060', fontWeight: 600, lineHeight: 1.5, background: 'rgba(217, 119, 6, 0.08)', border: '1px dashed rgba(217, 119, 6, 0.3)', borderRadius: '8px', padding: '6px 8px' }}>
                {door.fdContext}
              </div>
            )}
          </div>

          {/* Target Answer Slot */}
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Drop Jawaban di Sini
            </div>
            <div
              data-answer-slot="true"
              style={{
                width: isTextQuestion ? '85%' : 72,
                height: isTextQuestion ? 46 : 72,
                borderRadius: isTextQuestion ? 12 : 16,
                border: isCorrect
                  ? '2px solid #00ADB5'
                  : isWrong
                    ? '2px dashed #EF4444'
                    : '2px dashed rgba(14, 131, 136, 0.4)',
                background: isCorrect
                  ? 'rgba(0, 173, 181, 0.15)'
                  : isWrong
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'rgba(14, 131, 136, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                boxShadow: isCorrect ? '0 0 15px rgba(0, 173, 181, 0.25)' : 'none',
                transition: 'all 0.25s ease',
              }}
            >
              {placedChoice !== null ? (
                <div
                  style={{
                    width: isTextQuestion ? '90%' : 48,
                    height: isTextQuestion ? 32 : 48,
                    borderRadius: isTextQuestion ? 8 : '50%',
                    background: isCorrect
                      ? 'linear-gradient(135deg, #00ADB5 0%, #008891 100%)'
                      : 'linear-gradient(135deg, #EF4444 0%, #C53030 100%)',
                    border: '1.5px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: isTextQuestion ? '12px' : (placedChoice.toString().length > 2 ? '14px' : '18px'),
                    fontFamily: isTextQuestion ? 'var(--font-ui)' : 'var(--font-data)',
                    padding: isTextQuestion ? '0 8px' : '0',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {placedChoice}
                </div>
              ) : (
                <span style={{ fontSize: 22, opacity: 0.2, color: door.color, fontFamily: 'monospace' }}>?</span>
              )}
            </div>
          </div>

          {/* Choices Pool */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '10px 0', flexWrap: 'wrap', minHeight: '60px', alignItems: 'center' }}>
            {choices.map((val) => {
              const isPlaced = placedChoice === val && isCorrect
              if (isPlaced) {
                return (
                  <div
                    key={`placeholder-${val}`}
                    style={{
                      width: isTextQuestion ? undefined : 48,
                      height: isTextQuestion ? 34 : 48,
                      padding: isTextQuestion ? '8px 14px' : undefined,
                      minWidth: isTextQuestion ? 80 : undefined,
                      borderRadius: isTextQuestion ? 10 : '50%',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px dashed rgba(255, 255, 255, 0.08)',
                    }}
                  />
                )
              }

              const key = `${val}-${resetKeys[val] ?? 0}`
              return (
                <motion.div
                  key={key}
                  id={`choice-${val}`}
                  drag
                  dragMomentum={false}
                  dragElastic={0.08}
                  onDragStart={() => {
                    setIsWrong(false)
                  }}
                  onDragEnd={(event) => {
                    let clientX: number, clientY: number
                    if ('changedTouches' in event && event.changedTouches.length > 0) {
                      clientX = event.changedTouches[0].clientX
                      clientY = event.changedTouches[0].clientY
                    } else {
                      clientX = (event as MouseEvent | PointerEvent).clientX
                      clientY = (event as MouseEvent | PointerEvent).clientY
                    }

                    const dragEl = document.getElementById(`choice-${val}`)
                    const savedPE = dragEl?.style.pointerEvents ?? ''
                    if (dragEl) dragEl.style.pointerEvents = 'none'
                    const elem = document.elementFromPoint(clientX, clientY)
                    if (dragEl) dragEl.style.pointerEvents = savedPE

                    let placed = false
                    if (elem) {
                      const slotEl = elem.closest('[data-answer-slot]')
                      if (slotEl) {
                        placed = true
                        handlePlaceAnswer(val)
                      }
                    }

                    if (!placed) {
                      setResetKeys(prev => ({ ...prev, [val]: (prev[val] ?? 0) + 1 }))
                    }
                  }}
                  whileHover={{ scale: 1.08 }}
                  whileDrag={{ scale: 1.15, zIndex: 9999, cursor: 'grabbing', boxShadow: `0 8px 24px ${door.color}66, 0 0 0 2px ${door.color}` }}
                  style={{
                    width: isTextQuestion ? undefined : 48,
                    height: isTextQuestion ? 34 : 48,
                    borderRadius: isTextQuestion ? 10 : '50%',
                    background: `linear-gradient(135deg, ${door.color}dd 0%, ${door.color}88 100%)`,
                    border: `1.5px solid ${door.color}55`,
                    boxShadow: '0 3px 8px rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: isTextQuestion ? '12px' : (val.toString().length > 2 ? '14px' : '18px'),
                    fontFamily: isTextQuestion ? 'var(--font-ui)' : 'var(--font-data)',
                    padding: isTextQuestion ? '8px 14px' : '0',
                    cursor: 'grab',
                    userSelect: 'none',
                    touchAction: 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {val}
                </motion.div>
              )
            })}
          </div>

          <motion.div key={shake} animate={shake > 0 ? { x: [-8, 8, -5, 5, 0] } : {}} transition={{ duration: 0.35 }}>
            <AnimatePresence>
              {showTextHint && <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)', fontSize: 15, fontWeight: 600, color: '#ffb060', lineHeight: 1.6 }}>
                💡 {door.hint}
              </motion.div>}
            </AnimatePresence>
          </motion.div>

          {/* Bantuan Visual Button */}
          {showVisualHint && (
            <button
              className="game-btn game-btn-secondary"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '6px 12px',
                alignSelf: 'center',
                color: '#00ADB5',
                borderColor: 'rgba(0, 173, 181, 0.3)',
                background: 'rgba(0, 173, 181, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                margin: '4px auto 0 auto',
                borderRadius: '8px'
              }}
              onClick={() => setOpenVisualModal(true)}
            >
              💡 Buka Bantuan Visual Step-by-Step
            </button>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="game-btn game-btn-secondary" style={{ flex: 1, fontSize: 15, fontWeight: 800, padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)', border: '1.5px solid #EF4444', color: '#EF4444' }} onClick={onClose}>Kembali</button>
            <button
              className="game-btn game-btn-primary"
              style={{
                flex: 2,
                fontSize: 15,
                fontWeight: 800,
                padding: '10px 14px',
                opacity: isCorrect ? 1 : 0.45,
                cursor: isCorrect ? 'pointer' : 'not-allowed'
              }}
              onClick={submit}
              disabled={!isCorrect}
            >
              Buka Pintu →
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {openVisualModal && (
          <VisualHintModal 
            door={door} 
            onClose={() => setOpenVisualModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Counter overlay ──────────────────────────────────────────────────────────
function CounterResult({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)
  const [btn, setBtn] = useState(false)

  useEffect(() => {
    let c = 0
    const id = setInterval(() => {
      c++
      setCount(c)
      if (c >= TOTAL_N) {
        clearInterval(id)
        setTimeout(() => setDone(true), 300)
        setTimeout(() => setBtn(true), 1100)
      }
    }, 45)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(11, 30, 44, 0.92)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{
            maxWidth: 460,
            width: '100%',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
            background: 'rgba(15, 35, 56, 0.95)',
            border: '2px solid rgba(14, 131, 136, 0.5)',
            borderRadius: 26,
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: '0 10px 35px rgba(14, 131, 136, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '2px', color: '#00ADB5', marginBottom: 8 }}>⚙️ MESIN PENGHITUNG DATA</div>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#FFFFFF' }}>Mengagregasikan total sampel...</h3>
          </div>
          <div style={{ background: 'rgba(14, 131, 136, 0.06)', border: '2px solid rgba(14, 131, 136, 0.3)', borderRadius: 20, padding: '28px 20px' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 800, marginBottom: 10, letterSpacing: '0.8px' }}>JUMLAH SAMPEL (n)</div>
            <motion.div style={{ fontSize: 84, fontWeight: 900, color: '#00ADB5', fontFamily: 'var(--font-data)', lineHeight: 1 }}
              animate={done ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.6 }}>{count}</motion.div>
          </div>
          <AnimatePresence>{done && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '16px 20px', borderRadius: 16, background: 'rgba(14, 131, 136, 0.04)', border: '1px solid rgba(14, 131, 136, 0.2)', fontSize: 15, fontWeight: 600, color: '#E2E8F0', lineHeight: 1.7, textAlign: 'left' }}>
                Kamu telah mengumpulkan seluruh data dari 3 ruangan.<br />
                Ukuran sampel yang terkumpul adalah <strong style={{ color: '#00ADB5', fontSize: 19 }}>n = {TOTAL_N}</strong>.
              </div>
              {btn && <button className="game-btn game-btn-primary" style={{ width: '100%', fontSize: 16, fontWeight: 800, padding: '12px 18px' }} onClick={onDone}>Lanjut ke Perhitungan Rentang (R) →</button>}
            </motion.div>
          )}</AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default function NPath({ onComplete, isFD = true, demoMode = false }: { onComplete: () => void; isFD?: boolean; demoMode?: boolean }) {
  const [charPos, setCharPos] = useState({ x: 400, y: 310 })
  const [unlocked, setUnlocked] = useState<Set<string>>(() => {
    return demoMode ? new Set(['A', 'A1', 'A2', 'A3', 'B1']) : new Set()
  })
  const [justCompletedClassId, setJustCompletedClassId] = useState<string | null>(null)
  const [activeDoor, setActiveDoor] = useState<typeof DOORS[number] | null>(null)
  const [nearDoor, setNearDoor] = useState<typeof DOORS[number] | null>(null)
  const [activeClass, setActiveClass] = useState<typeof CLASS_DOORS[number] | null>(null)
  const [nearClass, setNearClass] = useState<typeof CLASS_DOORS[number] | null>(null)
  const [visitedRooms, setVisitedRooms] = useState<Set<DoorId>>(new Set())
  const [diraMessageText, setDiraMessageText] = useState<string | null>(null)
  const [showWaliKelasPopup, setShowWaliKelasPopup] = useState<typeof CLASS_DOORS[number] | null>(null)
  const [collected, setCollected] = useState<Set<string>>(() => {
    if (demoMode) {
      const initialSet = new Set<string>()
      const demoClassIds = ['A1', 'A2', 'A3', 'B1']
      const classCircles = DATA_CIRCLES.filter(c => demoClassIds.includes(c.classId))
      classCircles.forEach(c => initialSet.add(c.id))
      return initialSet
    }
    return new Set()
  })
  const [showCounter, setShowCounter] = useState(demoMode ? true : false)
  const [roomMilestoneText, setRoomMilestoneText] = useState<string | null>(null)
  const [milestoneGlow, setMilestoneGlow] = useState<'50%' | '100%' | null>(null)

  const charPosRef = useRef({ x: 400, y: 310 })

  const dirRef = useRef({ x: 0, y: 0 })
  const animRef = useRef<number | null>(null)
  const unlockedR = useRef(unlocked); unlockedR.current = unlocked
  const activeDoorR = useRef(activeDoor); activeDoorR.current = activeDoor
  const nearDoorR = useRef(nearDoor); nearDoorR.current = nearDoor
  const activeClassR = useRef(activeClass); activeClassR.current = activeClass
  const nearClassR = useRef(nearClass); nearClassR.current = nearClass
  const showWaliKelasPopupR = useRef(showWaliKelasPopup); showWaliKelasPopupR.current = showWaliKelasPopup

  // Sync charPosRef with charPos
  useEffect(() => {
    charPosRef.current = charPos
  }, [charPos])

  // Compute current room based on position reactively
  let currentRoomId: DoorId | null = null
  const leftDiagY = 260 - (charPos.x - 10) * (8/27)
  const rightDiagY = 180 + (charPos.x - 520) * (8/27)

  if (unlocked.has('A') && charPos.x < 280 && charPos.y < leftDiagY) currentRoomId = 'A'
  if (unlocked.has('B') && charPos.x >= 280 && charPos.x <= 520 && charPos.y < 180) currentRoomId = 'B'
  if (unlocked.has('C') && charPos.x > 520 && charPos.y < rightDiagY) currentRoomId = 'C'

  // Trigger Dira dialog popup when entering a room for the first time
  useEffect(() => {
    if (currentRoomId && !visitedRooms.has(currentRoomId)) {
      setVisitedRooms(prev => new Set([...prev, currentRoomId!]))
      if (currentRoomId === 'A') {
        setDiraMessageText("Halo Detektif! Di Ruang A ini terdapat beberapa kelas (VII-1, VII-2, dan VII-3) yang menyimpan data screen time. Yuk, datangi dan buka gembok tiap kelas satu per satu untuk mengumpulkan datanya! 🕵️‍♂️")
      } else if (currentRoomId === 'B') {
        setDiraMessageText("Keren! Di Ruang B, datamu tersimpan di kelas VIII-1, VIII-2, dan VIII-3. Selesaikan teka-teki gembok tiap kelas untuk memindai semua data di ruangan ini!")
      } else if (currentRoomId === 'C') {
        setDiraMessageText("Hampir lengkap! Di Ruang C, kunjungi kelas IX-1, IX-2, dan IX-3. Pecahkan teka-teki di masing-masing pintu kelas untuk melengkapi seluruh data screen time siswa!")
      }
    }
  }, [currentRoomId, visitedRooms])

  // Proximity to doors (calculated smoothly from player position)
  useEffect(() => {
    const { x: cx, y: cy } = charPos
    let closest: typeof DOORS[number] | null = null
    let minDist = Infinity
    for (const d of DOORS) {
      if (unlockedR.current.has(d.id)) continue
      const dist = Math.hypot(d.x - cx, d.y - cy)
      if (dist < 26 && dist < minDist) {
        minDist = dist
        closest = d
      }
    }
    setNearDoor(closest)
  }, [charPos])

  // Proximity to class doors (calculated smoothly from player position)
  useEffect(() => {
    const { x: cx, y: cy } = charPos
    let closest: typeof CLASS_DOORS[number] | null = null
    let minDist = Infinity
    for (const d of CLASS_DOORS) {
      if (!unlockedR.current.has(d.roomId)) continue
      if (unlockedR.current.has(d.id)) continue
      const dist = Math.hypot(d.x - cx, d.y - cy)
      if (dist < 26 && dist < minDist) {
        minDist = dist
        closest = d
      }
    }
    setNearClass(closest)
  }, [charPos])

  // Finish trigger once all 35 data points are collected
  useEffect(() => {
    if (collected.size >= TOTAL_N && !showCounter) {
      setTimeout(() => setShowCounter(true), 600)
    }
  }, [collected.size, showCounter])

  // Main game tick: movement animation loop
  useEffect(() => {
    const tick = () => {
      if (!activeDoor && !activeClass && !diraMessageText && !showWaliKelasPopup) {
        const { x: dx, y: dy } = dirRef.current
        if (dx || dy) {
          setCharPos(p => {
            const nx = Math.max(10, Math.min(VW - 10, p.x + dx * SPEED))
            const ny = Math.max(10, Math.min(VH - 10, p.y + dy * SPEED))
            if (isWalkable(nx, ny, unlockedR.current)) return { x: nx, y: ny }
            if (isWalkable(nx, p.y, unlockedR.current)) return { x: nx, y: p.y }
            if (isWalkable(p.x, ny, unlockedR.current)) return { x: p.x, y: ny }
            return p
          })
        }
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [activeDoor, activeClass, diraMessageText, showWaliKelasPopup])

  // Keyboard navigation listeners
  useEffect(() => {
    const KEY_MAP: Record<string, { x: number; y: number }> = {
      ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
    }
    const pressedKeys = new Set<string>()

    const updateDir = () => {
      let nx = 0, ny = 0
      pressedKeys.forEach(k => {
        const d = KEY_MAP[k]
        if (d) { nx += d.x; ny += d.y }
      })
      const len = Math.sqrt(nx * nx + ny * ny)
      dirRef.current = len > 0 ? { x: nx / len, y: ny / len } : { x: 0, y: 0 }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const activeDoorVal = activeDoorR.current
      const activeClassVal = activeClassR.current
      const nearDoorVal = nearDoorR.current
      const nearClassVal = nearClassR.current
      
      if (activeDoorVal || activeClassVal || diraMessageText || showWaliKelasPopupR.current) {
        if (e.key === 'Escape') { 
          e.preventDefault()
          setActiveDoor(null)
          setActiveClass(null)
        }
        return
      }
      if (KEY_MAP[e.key]) {
        e.preventDefault()
        pressedKeys.add(e.key)
        updateDir()
      }
      if ((e.key === 'Enter' || e.key === ' ') && nearDoorVal && !unlockedR.current.has(nearDoorVal.id)) {
        e.preventDefault()
        setUnlocked(p => new Set([...p, nearDoorVal.id]))
      } else if ((e.key === 'Enter' || e.key === ' ') && nearClassVal && !unlockedR.current.has(nearClassVal.id)) {
        e.preventDefault()
        setActiveClass(nearClassVal)
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      pressedKeys.delete(e.key)
      updateDir()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      dirRef.current = { x: 0, y: 0 }
    }
  }, [diraMessageText])

  const handleCorrect = useCallback(() => {
    if (!activeDoor) return
    setUnlocked(p => new Set([...p, activeDoor.id]))
    setActiveDoor(null)
  }, [activeDoor])

  const handleClassCorrect = useCallback(() => {
    if (!activeClass) return
    setShowWaliKelasPopup(activeClass)
    setActiveClass(null)
  }, [activeClass])

  const handleCloseWaliKelas = useCallback(() => {
    if (!showWaliKelasPopup) return
    const cid = showWaliKelasPopup.id
    const roomId = showWaliKelasPopup.roomId
    
    // 1. Add class ID to unlocked & check room completion
    setUnlocked(prev => {
      const next = new Set(prev)
      next.add(cid)
      
      const roomClasses = CLASS_DOORS.filter(cd => cd.roomId === roomId)
      const completed = roomClasses.every(cd => next.has(cd.id))
      if (completed) {
        setRoomMilestoneText(`RUANG ${roomId} SELESAI! 🚀`)
        setTimeout(() => {
          setRoomMilestoneText(null)
        }, 2200)
      }
      
      return next
    })
    
    // 2. Add class data circles to collected & check total milestones
    const classCircles = DATA_CIRCLES.filter(c => c.classId === cid)
    setCollected(prev => {
      const next = new Set(prev)
      classCircles.forEach(c => next.add(c.id))
      
      const oldSize = prev.size
      const newSize = next.size
      
      if (oldSize < 18 && newSize >= 18) {
        setMilestoneGlow('50%')
        setTimeout(() => setMilestoneGlow(null), 1800)
      } else if (oldSize < 35 && newSize >= 35) {
        setMilestoneGlow('100%')
        setTimeout(() => setMilestoneGlow(null), 2500)
      }
      
      return next
    })
    
    setJustCompletedClassId(cid)
    setTimeout(() => {
      setJustCompletedClassId(null)
    }, 1500)

    setShowWaliKelasPopup(null)
  }, [showWaliKelasPopup])

  const n = collected.size
  const isRoomACompleted = CLASS_DOORS.filter(cd => cd.roomId === 'A').every(cd => unlocked.has(cd.id))
  const isRoomBCompleted = CLASS_DOORS.filter(cd => cd.roomId === 'B').every(cd => unlocked.has(cd.id))
  const isRoomCCompleted = CLASS_DOORS.filter(cd => cd.roomId === 'C').every(cd => unlocked.has(cd.id))

  const collectedStudents = CLASS_DOORS
    .filter(cd => unlocked.has(cd.id))
    .flatMap(cd => {
      const info = CLASS_STUDENTS[cd.id]
      return info ? info.students.map(s => ({ classId: cd.id, name: s.name, time: s.time })) : []
    })

  const scrollRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: 'smooth'
      })
    }
  }, [unlocked, collectedStudents.length])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, minHeight: 0 }}>
      {/* Top Header info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.8vh, 16px)', flexShrink: 0, paddingBottom: '4px' }}>
        <div style={{
          width: 'clamp(32px, 5.5vh, 46px)', height: 'clamp(32px, 5.5vh, 46px)', borderRadius: '50%', flexShrink: 0,
          background: 'rgba(99, 102, 241, 0.2)', border: '1.5px solid rgba(99, 102, 241, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'clamp(14px, 2.2vh, 18px)', fontWeight: 900, color: '#a5b4fc',
        }}>1</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'clamp(16px, 2.8vh, 22px)', fontWeight: 800, color: '#F8FAFC' }}>Eksplorasi Ruangan 🕵️‍♂️</div>
          <div style={{ fontSize: 'clamp(11px, 1.8vh, 14px)', color: '#A8A29E', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Langkah 1 dari 3</div>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                width: i === 1 ? 20 : 8,
                height: 'clamp(6px, 1.2vh, 9px)',
                borderRadius: '3px',
                background: i === 1 ? '#a5b4fc' : 'rgba(217,119,6,0.15)',
                transition: 'width 0.3s, background 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 16, border: '1px solid rgba(14, 131, 136, 0.08)', minHeight: 0, position: 'relative', background: '#04070a' }}>
        
        {/* Top Integrated Progress Header Bar */}
        <div style={{
          background: 'rgba(11, 30, 44, 0.95)',
          borderBottom: '1px solid rgba(14, 131, 136, 0.25)',
          padding: '8px 16px',
          color: '#F8FAFC',
          fontFamily: 'monospace',
          fontSize: '11px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0
        }}>
          {/* Row 1: Consolidated Header & Stats */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontWeight: 'bold', color: '#00ADB5', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📊</span> <span>PROGRESS INVESTIGASI</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700 }}>
              <span style={{ color: '#94A3B8' }}>DATA TERKUMPUL:</span>
              <motion.span
                animate={milestoneGlow ? {
                  scale: [1, 1.15, 1],
                  color: ['#00ADB5', '#FFFFFF', '#00ADB5'],
                } : {}}
                transition={{ duration: 1.2 }}
                style={{ color: '#00ADB5', display: 'inline-flex', alignItems: 'center', gap: 10 }}
              >
                <span style={{ fontSize: '13px' }}>{n} / {TOTAL_N}</span>
                <span style={{ color: '#334155', fontWeight: 'normal' }}>|</span>
                {(() => {
                  const getCount = (rId: string) => CLASS_DOORS.filter(cd => cd.roomId === rId && unlocked.has(cd.id)).length
                  return (
                    <span style={{ display: 'flex', gap: 10, fontSize: '10px' }}>
                      <span style={{ color: '#818cf8', opacity: currentRoomId === 'A' ? 1 : 0.65 }}>VII: {getCount('A')}/3</span>
                      <span style={{ color: '#00ADB5', opacity: currentRoomId === 'B' ? 1 : 0.65 }}>VIII: {getCount('B')}/3</span>
                      <span style={{ color: '#f472b6', opacity: currentRoomId === 'C' ? 1 : 0.65 }}>IX: {getCount('C')}/3</span>
                    </span>
                  )
                })()}
              </motion.span>
            </div>
          </div>

          {/* Row 2: Horizontal Scrollable Raw Data Preview */}
          <div 
            ref={scrollRef}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              overflowX: 'auto', 
              padding: '6px 4px', 
              width: '100%',
              minHeight: '38px',
              background: 'rgba(4, 7, 10, 0.4)',
              borderRadius: '8px',
              border: '1px solid rgba(14, 131, 136, 0.1)',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none' // IE/Edge
            }}
            className="scrollbar-hidden"
          >
            {/* Scrollbar hide styling for Chrome/Safari */}
            <style>{`
              .scrollbar-hidden::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {collectedStudents.length === 0 ? (
              <span style={{ color: '#64748B', fontStyle: 'italic', fontSize: '11px', paddingLeft: '4px' }}>
                Belum ada data terkumpul. Buka gembok kelas untuk mengumpulkan data screen time.
              </span>
            ) : (
              collectedStudents.map((st, idx) => (
                <motion.div
                  key={`${st.classId}-${st.name}-${idx}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'rgba(0, 173, 181, 0.12)',
                    border: '1.5px solid #00ADB5',
                    boxShadow: '0 0 10px rgba(0, 173, 181, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '11px',
                    fontFamily: 'var(--font-data)',
                    flexShrink: 0
                  }}
                  title={`${st.name} (${st.classId}): ${st.time} jam`}
                >
                  {st.time}
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div style={{ flex: 1, width: '100%', minHeight: 0, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxHeight: '100%', aspectRatio: `${VW}/${VH}`, display: 'block' }}>

            {/* Grid Pattern & Room Gradient Defs */}
            <defs>
              <pattern id="grid-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="rgba(0, 173, 181, 0.02)" />
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(0, 173, 181, 0.012)" strokeWidth="0.5" />
              </pattern>

              {/* Room Gradients (Depth & Diferensiasi) */}
              <radialGradient id="room-a-grad" cx="20%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#0e152d" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#04070a" stopOpacity="1" />
              </radialGradient>
              <radialGradient id="room-b-grad" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#071d1f" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#04070a" stopOpacity="1" />
              </radialGradient>
              <radialGradient id="room-c-grad" cx="80%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#200a1b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#04070a" stopOpacity="1" />
              </radialGradient>

              {/* Avatar super glow filter */}
              <filter id="avatar-super-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComponentTransfer in="blur" result="boost">
                  <feFuncA type="linear" slope="1.5" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode in="boost" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <style>{`
              @keyframes drift1 {
                0% { transform: translate(0px, 0px); opacity: 0.12; }
                50% { transform: translate(14px, -20px); opacity: 0.38; }
                100% { transform: translate(0px, 0px); opacity: 0.12; }
              }
              @keyframes drift2 {
                0% { transform: translate(0px, 0px); opacity: 0.12; }
                50% { transform: translate(-18px, 14px); opacity: 0.38; }
                100% { transform: translate(0px, 0px); opacity: 0.12; }
              }
              @keyframes drift3 {
                0% { transform: translate(0px, 0px); opacity: 0.12; }
                50% { transform: translate(10px, 18px); opacity: 0.32; }
                100% { transform: translate(0px, 0px); opacity: 0.12; }
              }
              .particle-drift-1 { animation: drift1 9s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
              .particle-drift-2 { animation: drift2 11s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
              .particle-drift-3 { animation: drift3 13s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
            `}</style>

            {/* Room background overlays (desaturated/dim completed rooms, styled gradients for uncompleted rooms) */}
            <polygon points="10,30 280,30 280,180 10,260" fill={isRoomACompleted ? "rgba(4, 7, 10, 0.65)" : "url(#room-a-grad)"} />
            <polygon points="280,30 520,30 520,180 280,180" fill={isRoomBCompleted ? "rgba(4, 7, 10, 0.65)" : "url(#room-b-grad)"} />
            <polygon points="520,30 790,30 790,260 520,180" fill={isRoomCCompleted ? "rgba(4, 7, 10, 0.65)" : "url(#room-c-grad)"} />

            {/* Ambient floating data particles */}
            {AMBIENT_PARTICLES.map((p, idx) => (
              <circle
                key={`p-${idx}`}
                cx={p.cx}
                cy={p.cy}
                r={p.r}
                fill={p.color}
                className={p.className}
                pointerEvents="none"
                opacity={0.08}
              />
            ))}

            {/* Starting hallway hub subtle decorative grid pattern */}
            <polygon points="10,260 280,180 520,180 790,260 790,330 10,330" fill="url(#grid-pattern)" />

            {/* Facility Outer boundary */}
            <rect x={10} y={30} width={780} height={300} fill="none" stroke="#334155" strokeWidth={0.8} rx={12} />

            {/* Room completion glow effect on the dividing walls */}
            {isRoomACompleted && (
              <>
                <motion.line x1={10} y1={260} x2={280} y2={180} stroke="#818cf8" strokeWidth={3} opacity={0.6} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
                <motion.line x1={280} y1={30} x2={280} y2={180} stroke="#818cf8" strokeWidth={3} opacity={0.6} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
              </>
            )}
            {isRoomBCompleted && (
              <>
                <motion.line x1={280} y1={180} x2={520} y2={180} stroke="#00ADB5" strokeWidth={3} opacity={0.6} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
                <motion.line x1={280} y1={30} x2={280} y2={180} stroke="#00ADB5" strokeWidth={3} opacity={0.6} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
                <motion.line x1={520} y1={30} x2={520} y2={180} stroke="#00ADB5" strokeWidth={3} opacity={0.6} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
              </>
            )}
            {isRoomCCompleted && (
              <>
                <motion.line x1={520} y1={180} x2={790} y2={260} stroke="#f472b6" strokeWidth={3} opacity={0.6} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
                <motion.line x1={520} y1={30} x2={520} y2={180} stroke="#f472b6" strokeWidth={3} opacity={0.6} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
              </>
            )}

            {/* Glowing lines for wall boundaries */}
            {/* Left diagonal wall */}
            <line x1={10} y1={260} x2={280} y2={180} stroke="#334155" strokeWidth={0.8} />
            {/* Right diagonal wall */}
            <line x1={520} y1={180} x2={790} y2={260} stroke="#334155" strokeWidth={0.8} />
            {/* Center horizontal wall */}
            <line x1={280} y1={180} x2={520} y2={180} stroke="#334155" strokeWidth={0.8} />
            {/* Left vertical hallway wall */}
            <line x1={280} y1={30} x2={280} y2={180} stroke="#334155" strokeWidth={0.8} />
            {/* Right vertical hallway wall */}
            <line x1={520} y1={30} x2={520} y2={180} stroke="#334155" strokeWidth={0.8} />

            {/* Room A Classroom dividers */}
            {unlocked.has('A') && (
              <>
                {/* Vertical Wall A1/A2 */}
                <line x1={95} y1={30} x2={95} y2={260 - 85 * (8/27) - 35} stroke="#334155" strokeWidth={0.8} />
                {/* Vertical Wall A2/A3 */}
                <line x1={185} y1={30} x2={185} y2={260 - 175 * (8/27) - 35} stroke="#334155" strokeWidth={0.8} />

                {/* Horizontal walls with gaps */}
                <line x1={10} y1={225} x2={37.5} y2={225 - 27.5 * (8/27)} stroke="#334155" strokeWidth={0.8} />
                <line x1={67.5} y1={225 - 57.5 * (8/27)} x2={95} y2={260 - 85 * (8/27) - 35} stroke="#334155" strokeWidth={0.8} />
                {!unlocked.has('A1') && <line x1={37.5} y1={225 - 27.5 * (8/27)} x2={67.5} y2={225 - 57.5 * (8/27)} stroke="#334155" strokeWidth={0.8} />}

                <line x1={95} y1={260 - 85 * (8/27) - 35} x2={125} y2={225 - 115 * (8/27)} stroke="#334155" strokeWidth={0.8} />
                <line x1={155} y1={225 - 145 * (8/27)} x2={185} y2={260 - 175 * (8/27) - 35} stroke="#334155" strokeWidth={0.8} />
                {!unlocked.has('A2') && <line x1={125} y1={225 - 115 * (8/27)} x2={155} y2={225 - 145 * (8/27)} stroke="#334155" strokeWidth={0.8} />}

                <line x1={185} y1={260 - 175 * (8/27) - 35} x2={212.5} y2={225 - 202.5 * (8/27)} stroke="#334155" strokeWidth={0.8} />
                <line x1={242.5} y1={225 - 232.5 * (8/27)} x2={280} y2={145} stroke="#334155" strokeWidth={0.8} />
                {!unlocked.has('A3') && <line x1={212.5} y1={225 - 202.5 * (8/27)} x2={242.5} y2={225 - 232.5 * (8/27)} stroke="#334155" strokeWidth={0.8} />}
              </>
            )}

            {/* Room B Classroom dividers */}
            {unlocked.has('B') && (
              <>
                <line x1={360} y1={30} x2={360} y2={145} stroke="#334155" strokeWidth={0.8} />
                <line x1={440} y1={30} x2={440} y2={145} stroke="#334155" strokeWidth={0.8} />

                <line x1={280} y1={145} x2={305} y2={145} stroke="#334155" strokeWidth={0.8} />
                <line x1={335} y1={145} x2={360} y2={145} stroke="#334155" strokeWidth={0.8} />
                {!unlocked.has('B1') && <line x1={305} y1={145} x2={335} y2={145} stroke="#334155" strokeWidth={0.8} />}

                <line x1={360} y1={145} x2={385} y2={145} stroke="#334155" strokeWidth={0.8} />
                <line x1={415} y1={145} x2={440} y2={145} stroke="#334155" strokeWidth={0.8} />
                {!unlocked.has('B2') && <line x1={385} y1={145} x2={415} y2={145} stroke="#334155" strokeWidth={0.8} />}

                <line x1={440} y1={145} x2={465} y2={145} stroke="#334155" strokeWidth={0.8} />
                <line x1={495} y1={145} x2={520} y2={145} stroke="#334155" strokeWidth={0.8} />
                {!unlocked.has('B3') && <line x1={465} y1={145} x2={495} y2={145} stroke="#334155" strokeWidth={0.8} />}
              </>
            )}

            {/* Room C Classroom dividers */}
            {unlocked.has('C') && (
              <>
                <line x1={610} y1={30} x2={610} y2={145 + 90 * (8/27)} stroke="#334155" strokeWidth={0.8} />
                <line x1={700} y1={30} x2={700} y2={145 + 180 * (8/27)} stroke="#334155" strokeWidth={0.8} />

                <line x1={520} y1={145} x2={557.5} y2={145 + 37.5 * (8/27)} stroke="#334155" strokeWidth={0.8} />
                <line x1={587.5} y1={145 + 67.5 * (8/27)} x2={610} y2={145 + 90 * (8/27)} stroke="#334155" strokeWidth={0.8} />
                {!unlocked.has('C1') && <line x1={557.5} y1={145 + 37.5 * (8/27)} x2={587.5} y2={145 + 67.5 * (8/27)} stroke="#334155" strokeWidth={0.8} />}

                <line x1={610} y1={145 + 90 * (8/27)} x2={645} y2={145 + 125 * (8/27)} stroke="#334155" strokeWidth={0.8} />
                <line x1={675} y1={145 + 155 * (8/27)} x2={700} y2={145 + 180 * (8/27)} stroke="#334155" strokeWidth={0.8} />
                {!unlocked.has('C2') && <line x1={645} y1={145 + 125 * (8/27)} x2={675} y2={145 + 155 * (8/27)} stroke="#334155" strokeWidth={0.8} />}

                <line x1={700} y1={145 + 180 * (8/27)} x2={732.5} y2={145 + 212.5 * (8/27)} stroke="#334155" strokeWidth={0.8} />
                <line x1={762.5} y1={145 + 242.5 * (8/27)} x2={790} y2={225} stroke="#334155" strokeWidth={0.8} />
                {!unlocked.has('C3') && <line x1={732.5} y1={145 + 212.5 * (8/27)} x2={762.5} y2={145 + 242.5 * (8/27)} stroke="#334155" strokeWidth={0.8} />}
              </>
            )}

            {/* Start Pad */}
            <circle cx={400} cy={310} r={20} fill="rgba(14, 131, 136, 0.08)" stroke="rgba(14, 131, 136, 0.3)" strokeWidth={1} />
            <text x={400} y={313.5} textAnchor="middle" fill="#00ADB5" fontSize={9.5} fontWeight="900" fontFamily="monospace">MULAI</text>

            {/* Connecting doors */}
            {DOORS.map(door => {
              const open = unlocked.has(door.id)
              const near = nearDoor?.id === door.id && !open
              const rx = door.x - 21
              const ry = door.y - 13

              return (
                <g key={door.id} style={{ cursor: open ? 'default' : 'pointer' }}
                  onClick={e => { e.stopPropagation(); if (!open) setUnlocked(p => new Set([...p, door.id])) }}>
                  {near && <circle cx={door.x} cy={door.y} r={22} fill="rgba(245, 158, 11, 0.15)" stroke="rgba(245, 158, 11, 0.44)" strokeWidth={0.6} />}
                  <rect x={rx} y={ry} width={42} height={26} rx={6}
                    fill={open ? `${door.color}25` : '#111827'} stroke={near ? '#FFFFFF' : open ? door.color : '#f59e0b'} strokeWidth={1} />
                  <text x={door.x} y={door.y + 1.5} textAnchor="middle" dominantBaseline="middle" fontSize={16}>{open ? '🔓' : '🔒'}</text>
                  <text x={door.x} y={door.y - 20} textAnchor="middle" fontSize={11.5} fontWeight="bold" fill={open ? door.color : '#f59e0b'} fontFamily="monospace">{door.label}</text>
                </g>
              )
            })}

            {/* Class doors (rendered inside rooms once unlocked in a small Card layout) */}
            {CLASS_DOORS.map(door => {
              if (!unlocked.has(door.roomId)) return null
              const open = unlocked.has(door.id)
              const near = nearClass?.id === door.id && !open
              const isJustCompleted = justCompletedClassId === door.id
              const cardW = 56
              const cardH = 38
              const cardY = door.roomId === 'B' ? 70 : 80
              const rx = door.x - cardW / 2
              const ry = cardY - cardH / 2

              return (
                <g key={door.id} style={{ cursor: open ? 'default' : 'pointer' }}
                  onClick={e => { e.stopPropagation(); if (!open && !activeClass && !activeDoor) setActiveClass(door) }}>
                  
                  {/* Subtle techy dotted connector line from card to door lock */}
                  <line 
                    x1={door.x} 
                    y1={cardY + cardH / 2} 
                    x2={door.x} 
                    y2={door.y - 8} 
                    stroke={open && !isJustCompleted ? '#475569' : '#f59e0b'} 
                    strokeWidth={1} 
                    strokeDasharray="2,3" 
                    opacity={isJustCompleted ? 0.4 : open ? 0.08 : 0.4} 
                    style={{ transition: 'opacity 0.3s, stroke 0.3s' }}
                  />

                  {/* Pulsing glow aura at the physical door gap position */}
                  {!open || isJustCompleted ? (
                    <motion.circle
                      cx={door.x}
                      cy={door.y}
                      r={12}
                      fill="rgba(245, 158, 11, 0.12)"
                      animate={isJustCompleted 
                        ? { scale: [1, 1.6, 1], fill: ['rgba(245, 158, 11, 0.25)', '#10B981', 'rgba(245, 158, 11, 0.15)'] } 
                        : near 
                          ? { scale: [1, 1.4, 1], fill: ['rgba(245, 158, 11, 0.22)', 'rgba(245, 158, 11, 0.66)', 'rgba(245, 158, 11, 0.22)'] } 
                          : { scale: [0.95, 1.05, 0.95], fill: ['rgba(245, 158, 11, 0.1)', 'rgba(245, 158, 11, 0.22)', 'rgba(245, 158, 11, 0.10)'] }
                      }
                      transition={{ duration: isJustCompleted ? 1.2 : 1.5, repeat: isJustCompleted ? 0 : Infinity, ease: 'easeInOut' }}
                    />
                  ) : (
                    // Faint static dot background for completed locks
                    <circle
                      cx={door.x}
                      cy={door.y}
                      r={10}
                      fill="rgba(16, 185, 129, 0.02)"
                      stroke="none"
                    />
                  )}

                  {/* Scatter Particles on Completion Reward */}
                  {isJustCompleted && (
                    <>
                      {[
                        { dx: -18, dy: -10 },
                        { dx: 18, dy: -12 },
                        { dx: -8, dy: -20 },
                        { dx: 8, dy: -20 },
                        { dx: 0, dy: -24 },
                      ].map((offset, i) => (
                        <motion.circle
                          key={`reward-part-${door.id}-${i}`}
                          cx={door.x}
                          cy={door.y}
                          r={2.2}
                          fill="#10B981"
                          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                          animate={{
                            x: offset.dx,
                            y: offset.dy,
                            opacity: 0,
                            scale: 0.5,
                          }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                        />
                      ))}
                    </>
                  )}

                  {/* Physical door status lock dot */}
                  <motion.g
                    animate={isJustCompleted ? { scale: [1, 1.4, 1], y: [0, -4, 0] } : {}}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ transformOrigin: `${door.x}px ${door.y}px` }}
                  >
                    <circle
                      cx={door.x}
                      cy={door.y}
                      r={7.5}
                      fill={isJustCompleted ? '#10b981' : open ? 'rgba(100, 116, 139, 0.15)' : '#0f2338'}
                      stroke={isJustCompleted ? '#FFFFFF' : near ? '#FFFFFF' : open ? 'rgba(16, 185, 129, 0.25)' : '#f59e0b'}
                      strokeWidth={near ? 1.5 : 1}
                      opacity={open && !isJustCompleted ? 0.65 : 1}
                      style={{ transition: 'all 0.3s' }}
                    />
                    <text
                      x={door.x}
                      y={door.y + 0.5}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={8.5}
                      opacity={open && !isJustCompleted ? 0.6 : 1}
                      style={{ userSelect: 'none', pointerEvents: 'none', transition: 'all 0.3s' }}
                    >
                      {open ? '🔓' : '🔒'}
                    </text>
                  </motion.g>

                  {/* Classroom Card (positioned higher up, out of the avatar path) */}
                  {near && (
                    <rect 
                      x={rx - 2.5} 
                      y={ry - 2.5} 
                      width={cardW + 5} 
                      height={cardH + 5} 
                      rx={8} 
                      fill="none" 
                      stroke="rgba(245, 158, 11, 0.4)" 
                      strokeWidth={1.2} 
                    />
                  )}
                  <motion.rect 
                    x={rx} 
                    y={ry} 
                    width={cardW} 
                    height={cardH} 
                    rx={6}
                    animate={isJustCompleted ? {
                      fill: ['rgba(17, 24, 39, 0.85)', 'rgba(16, 185, 129, 0.95)', 'rgba(15, 35, 56, 0.65)'],
                      stroke: ['#f59e0b', '#FFFFFF', 'rgba(16, 185, 129, 0.45)'],
                      scale: [1, 1.08, 1],
                    } : {}}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    style={{ transformOrigin: `${door.x}px ${cardY}px` }}
                    fill={open && !isJustCompleted ? 'rgba(15, 23, 42, 0.4)' : 'rgba(17, 24, 39, 0.85)'}
                    stroke={near ? '#FFFFFF' : open && !isJustCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.45)'}
                    strokeWidth={near ? 1.5 : 1}
                    opacity={open && !isJustCompleted ? 0.55 : 1}
                  />
                  <text 
                    x={door.x} 
                    y={cardY - 6} 
                    textAnchor="middle" 
                    fontSize={7.5} 
                    fontWeight="bold" 
                    fill={isJustCompleted ? '#FFFFFF' : open ? '#64748B' : '#F8FAFC'} 
                    fontFamily="var(--font-ui)"
                    opacity={open && !isJustCompleted ? 0.7 : 1}
                    style={{ transition: 'all 0.3s' }}
                  >
                    {door.label}
                  </text>
                  <text 
                    x={door.x} 
                    y={cardY + 8} 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    fontSize={6.5} 
                    fontWeight="bold" 
                    fill={isJustCompleted ? '#FFFFFF' : open ? '#475569' : '#f59e0b'} 
                    fontFamily="var(--font-data)" 
                    letterSpacing="0.4px"
                    opacity={open && !isJustCompleted ? 0.6 : 1}
                    style={{ transition: 'all 0.3s' }}
                  >
                    {open ? '✓ SELESAI' : 'LOCK'}
                  </text>
                </g>
              )
            })}

            {/* Player Character */}
            <defs>
              <radialGradient id="char-grad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#00ADB5" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </radialGradient>
            </defs>

            {/* Pulsing outer glow aura for the avatar */}
            <motion.circle
              cx={charPos.x}
              cy={charPos.y}
              r={14}
              fill="rgba(0, 240, 255, 0.22)"
              animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              pointerEvents="none"
            />

            <circle cx={charPos.x} cy={charPos.y} r={7.0} fill="url(#char-grad)" filter="url(#avatar-super-glow)" />
            <text x={charPos.x} y={charPos.y - 11} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#ffffff" fontFamily="var(--font-ui)" style={{ letterSpacing: '0.5px', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))' }}>Kamu</text>

            {/* Quick Click floating helper buttons rendered directly inside the SVG */}
            <AnimatePresence>
              {nearDoor && !unlocked.has(nearDoor.id) && !activeDoor && (() => {
                const buttonW = 110
                const buttonLeft = Math.max(10, Math.min(VW - 10 - buttonW, charPos.x - buttonW / 2))
                const textX = buttonLeft + buttonW / 2
                return (
                  <motion.g
                    key={`btn-door-${nearDoor.id}`}
                    initial={{ opacity: 0, scale: 0.8, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 5 }}
                    onClick={() => setUnlocked(p => new Set([...p, nearDoor.id]))}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect
                      x={buttonLeft}
                      y={charPos.y - 38}
                      width={buttonW}
                      height={22}
                      rx={11}
                      fill="rgba(15, 23, 42, 0.95)"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.5))' }}
                    />
                    <text
                      x={textX}
                      y={charPos.y - 27}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontSize={10}
                      fontWeight="bold"
                      style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)' }}
                    >
                      🔓 Buka {nearDoor.id}
                    </text>
                  </motion.g>
                )
              })()}
              {nearClass && !unlocked.has(nearClass.id) && !activeClass && !nearDoor && (() => {
                const buttonW = 130
                const buttonLeft = Math.max(10, Math.min(VW - 10 - buttonW, charPos.x - buttonW / 2))
                const textX = buttonLeft + buttonW / 2
                return (
                  <motion.g
                    key={`btn-class-${nearClass.id}`}
                    initial={{ opacity: 0, scale: 0.8, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 5 }}
                    onClick={() => setActiveClass(nearClass)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect
                      x={buttonLeft}
                      y={charPos.y - 38}
                      width={buttonW}
                      height={22}
                      rx={11}
                      fill="rgba(15, 23, 42, 0.95)"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.5))' }}
                    />
                    <text
                      x={textX}
                      y={charPos.y - 27}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontSize={10}
                      fontWeight="bold"
                      style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)' }}
                    >
                      🔓 Buka {nearClass.label}
                    </text>
                  </motion.g>
                )
              })()}
            </AnimatePresence>

          </svg>

          {/* Vignette Overlay (Revisi 5) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            boxShadow: 'inset 0 0 35px rgba(0, 0, 0, 0.82)',
            borderRadius: '12px',
            zIndex: 30,
          }} />

          {/* Joystick */}
          <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 20 }}>
            <Joystick onDir={(x, y) => { dirRef.current = { x, y } }} />
          </div>
        </div>
      </div>

      {/* Control instruction banner */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textAlign: 'center', flexShrink: 0, lineHeight: 1.5 }}>
        Tekan WASD / Arrow Keys / Joystick untuk menggerakkan detektif.<br />
        Buka gembok di pintu tiap kelas untuk mengumpulkan data screen time siswa.
      </div>

      <AnimatePresence>
        {activeDoor && <QuizPopup door={activeDoor} isFD={isFD} onCorrect={handleCorrect} onClose={() => setActiveDoor(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {activeClass && <QuizPopup door={activeClass} isFD={isFD} onCorrect={handleClassCorrect} onClose={() => setActiveClass(null)} />}
      </AnimatePresence>

      {/* Wali Kelas Data Table Popup */}
      <AnimatePresence>
        {showWaliKelasPopup && (() => {
          const info = CLASS_STUDENTS[showWaliKelasPopup.id]
          if (!info) return null
          return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(11, 30, 44, 0.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 15 }}
                style={{
                  maxWidth: 440,
                  width: '100%',
                  maxHeight: 'calc(100vh - 40px)',
                  overflowY: 'auto',
                  background: 'rgba(15, 35, 56, 0.95)',
                  border: `2px solid ${showWaliKelasPopup.color}`,
                  borderRadius: 24,
                  padding: '24px 20px',
                  boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px ${showWaliKelasPopup.color}22`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '2px', color: showWaliKelasPopup.color, marginBottom: 8 }}>📋 DATA SCREEN TIME KELAS</div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 24 }}>👩‍🏫</span> {info.teacher} — Wali {showWaliKelasPopup.label}
                  </h3>
                  {/* Console diagnostic */}
                  {(() => {
                    console.log("Rendering popup for:", showWaliKelasPopup.id, "info:", info);
                    return null;
                  })()}
                </div>

                <div style={{ background: 'rgba(11, 30, 44, 0.6)', border: `1px solid ${showWaliKelasPopup.color}33`, borderRadius: 16, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left', fontFamily: 'monospace' }}>
                    <thead>
                      <tr style={{ background: `${showWaliKelasPopup.color}15`, borderBottom: `1px solid ${showWaliKelasPopup.color}22` }}>
                        <th style={{ padding: '10px 12px', color: '#94A3B8', fontWeight: 800 }}>NAMA SISWA</th>
                        <th style={{ padding: '10px 12px', color: '#94A3B8', fontWeight: 800 }}>SCREEN TIME</th>
                      </tr>
                    </thead>
                    <tbody>
                      {info.students.map((st, idx) => (
                        <tr key={idx} style={{ borderBottom: idx < info.students.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                          <td style={{ padding: '10px 12px', color: '#FFFFFF', fontWeight: 600 }}>{st.name}</td>
                          <td style={{ padding: '10px 12px', color: showWaliKelasPopup.color, fontWeight: 800 }}>{st.time} jam/hari</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Speech Bubble / Comment Box */}
                <div style={{ padding: '12px 14px', borderRadius: 14, background: `${showWaliKelasPopup.color}08`, border: `1px dashed ${showWaliKelasPopup.color}55`, position: 'relative' }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: showWaliKelasPopup.color, marginBottom: 4, letterSpacing: '0.5px' }}>💬 CATATAN GURU:</div>
                  <div style={{ fontSize: 13, color: '#E2E8F0', fontStyle: 'italic', fontWeight: 600, lineHeight: 1.5 }}>
                    "{info.comment}"
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: 11, color: '#64748B', lineHeight: 1.4, fontWeight: 500, textAlign: 'center' }}>
                  Wali kelas telah membagikan data screen time di atas. Data ini akan digabungkan ke dalam total sampel eksplorasi.
                </p>

                <button className="game-btn game-btn-primary" style={{ width: '100%', fontSize: 14, fontWeight: 800, padding: '10px 14px', background: showWaliKelasPopup.color, boxShadow: `0 0 10px ${showWaliKelasPopup.color}33`, color: '#FFFFFF', border: 'none' }} onClick={handleCloseWaliKelas}>
                  Lanjut & Simpan Data
                </button>
              </motion.div>
            </div>
          )
        })()}
      </AnimatePresence>

      {/* Dira Guide Overlay */}
      <AnimatePresence>
        {diraMessageText && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 30, 44, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 650,
            padding: 20
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                maxWidth: 420,
                width: '100%',
                background: 'rgba(15, 35, 56, 0.95)',
                border: '2px solid rgba(14, 131, 136, 0.5)',
                borderRadius: 24,
                padding: '24px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start'
              }}
            >
              <img src="/dira-avatar.png" alt="Dira" style={{ width: 64, height: 64, objectFit: 'contain', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#00ADB5', letterSpacing: '1px' }}>🗣️ ASISTEN DIRA</div>
                <p style={{ margin: 0, fontSize: 14, color: '#F8FAFC', lineHeight: 1.6, fontWeight: 600 }}>{diraMessageText}</p>
                <button
                  className="game-btn game-btn-primary"
                  style={{ alignSelf: 'flex-end', fontSize: 12, padding: '8px 16px', fontWeight: 800, borderRadius: 8 }}
                  onClick={() => setDiraMessageText('')}
                >
                  Siap, Dira!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Room Milestone Overlay */}
      <AnimatePresence>
        {roomMilestoneText && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, pointerEvents: 'none' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              style={{
                maxWidth: 360,
                width: '100%',
                background: 'rgba(4, 7, 10, 0.9)',
                border: '2px solid #00ADB5',
                boxShadow: '0 0 25px rgba(0, 173, 181, 0.5)',
                borderRadius: 20,
                padding: '24px 20px',
                textAlign: 'center'
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontSize: '20px', fontWeight: 900, color: '#00ADB5', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: 8 }}
              >
                {roomMilestoneText}
              </motion.div>
              <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
                Semua kelas di ruangan ini telah dibuka!
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showCounter && <CounterResult onDone={onComplete} />}
    </div>
  )
}
