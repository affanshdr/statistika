'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PlayerCharacter from '@/app/siswa/game/_components/PlayerCharacter'

// ─── Classroom World Map dimensions ───────────────────────────────────────────
const WORLD_VW = 1200
const WORLD_VH = 750
const VIEW_VW = 640
const VIEW_VH = 360
const SPEED = 1.0
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

const DOORS: readonly { id: string; x: number; y: number; label: string; color: string; quizQ: string; quizA: number | string; hint: string; count: number }[] = []

const CLASS_DOORS = [
  // Pintu 1 (Sayap Kiri) - Kelas VII-A
  {
    id: 'A1', roomId: 'A' as DoorId, label: 'Kelas VII-A', x: 340, y: 495, color: '#818cf8',
    quizQ: 'Data screen time 5 siswa: 2, 4, 3, 8, 1 jam. Berapa rentang datanya?',
    quizA: 7, choices: [5, 6, 7, 8] as const,
    fdContext: '💡 Ingat: rentang = nilai terbesar − nilai terkecil',
    hint: 'Kurangkan nilai terbesar (8) dengan nilai terkecil (1) untuk mendapatkan rentang.', count: 7
  },

  // Pintu 2 (Lorong Kiri) - Kelas VII-B
  {
    id: 'A2', roomId: 'A' as DoorId, label: 'Kelas VII-B', x: 440, y: 495, color: '#6366f1',
    quizQ: 'Tepi bawah kelas interval 4–6 adalah?',
    quizA: 3.5, choices: [3, 3.5, 4, 4.5] as const,
    fdContext: '💡 Ingat: tepi bawah = batas bawah − 0.5',
    hint: 'Kurangi batas bawah kelas (4) dengan 0.5.', count: 7
  },

  // Pintu 3 (Gedung Tengah / Pintu Ganda) - Kelas VIII-A
  {
    id: 'B1', roomId: 'B' as DoorId, label: 'Kelas VIII-A', x: 720, y: 495, color: '#00ADB5',
    quizQ: 'Kamu menerima berita viral yang belum terverifikasi. Tindakan paling etis adalah?',
    quizA: 'Verifikasi dulu', choices: ['Langsung share', 'Verifikasi dulu', 'Screenshot & sebar', 'Abaikan saja'] as const,
    fdContext: '💡 Pikirkan dampaknya terhadap orang lain',
    hint: 'Cari tindakan yang memastikan kebenaran informasi sebelum membagikannya.', count: 7
  },

  // Pintu 4 (Lorong Kanan) - Kelas VIII-B
  {
    id: 'B2', roomId: 'B' as DoorId, label: 'Kelas VIII-B', x: 890, y: 495, color: '#0e8388',
    quizQ: 'Seseorang memposting foto orang lain tanpa izin untuk konten viral. Ini termasuk pelanggaran?',
    quizA: 'Kedua-duanya', choices: ['Privasi', 'Hak cipta', 'Kedua-duanya', 'Bukan pelanggaran'] as const,
    fdContext: '💡 Pikirkan mengenai kepemilikan dan privasi hak orang lain',
    hint: 'Memposting foto orang lain melanggar ranah pribadi sekaligus kepemilikan ciptaan.', count: 7
  },

  // Pintu 5 (Sayap Kanan) - Kelas IX
  {
    id: 'C1', roomId: 'C' as DoorId, label: 'Kelas IX', x: 1050, y: 525, color: '#f472b6',
    quizQ: 'Ciri utama berita hoax yang paling umum meupakan?',
    quizA: 'Sumber tidak jelas', choices: ['Sumber tidak jelas', 'Ada foto', 'Ada tanggal', 'Ditulis wartawan'] as const,
    fdContext: '💡 Perhatikan kredibilitas pembuat informasi',
    hint: 'Berita bohong biasanya tidak menyebutkan asal-usul kredibel atau pihak penanggung jawab.', count: 7
  },
] as const

const DATA_CIRCLES = [
  // Zone A - Ruang A (total 14)
  { id: 'a1', d: 'A', classId: 'A1', x: 40, y: 70 },
  { id: 'a2', d: 'A', classId: 'A1', x: 60, y: 70 },
  { id: 'a3', d: 'A', classId: 'A1', x: 50, y: 95 },
  { id: 'a4', d: 'A', classId: 'A1', x: 120, y: 70 },
  { id: 'a5', d: 'A', classId: 'A1', x: 140, y: 70 },
  { id: 'a6', d: 'A', classId: 'A1', x: 130, y: 95 },
  { id: 'a7', d: 'A', classId: 'A1', x: 200, y: 70 },

  { id: 'a8', d: 'A', classId: 'A2', x: 220, y: 70 },
  { id: 'a9', d: 'A', classId: 'A2', x: 210, y: 95 },
  { id: 'a10', d: 'A', classId: 'A2', x: 250, y: 70 },
  { id: 'a11', d: 'A', classId: 'A2', x: 270, y: 70 },
  { id: 'a12', d: 'A', classId: 'A2', x: 260, y: 95 },
  { id: 'a13', d: 'A', classId: 'A2', x: 290, y: 70 },
  { id: 'a14', d: 'A', classId: 'A2', x: 300, y: 95 },

  // Zone B - Ruang B (total 14)
  { id: 'b1', d: 'B', classId: 'B1', x: 330, y: 60 },
  { id: 'b2', d: 'B', classId: 'B1', x: 350, y: 60 },
  { id: 'b3', d: 'B', classId: 'B1', x: 340, y: 80 },
  { id: 'b4', d: 'B', classId: 'B1', x: 330, y: 100 },
  { id: 'b5', d: 'B', classId: 'B1', x: 350, y: 100 },
  { id: 'b6', d: 'B', classId: 'B1', x: 380, y: 60 },
  { id: 'b7', d: 'B', classId: 'B1', x: 400, y: 60 },

  { id: 'b8', d: 'B', classId: 'B2', x: 420, y: 80 },
  { id: 'b9', d: 'B', classId: 'B2', x: 410, y: 100 },
  { id: 'b10', d: 'B', classId: 'B2', x: 430, y: 100 },
  { id: 'b11', d: 'B', classId: 'B2', x: 460, y: 60 },
  { id: 'b12', d: 'B', classId: 'B2', x: 480, y: 60 },
  { id: 'b13', d: 'B', classId: 'B2', x: 470, y: 80 },
  { id: 'b14', d: 'B', classId: 'B2', x: 460, y: 100 },

  // Zone C - Ruang C (total 7)
  { id: 'c1', d: 'C', classId: 'C1', x: 560, y: 70 },
  { id: 'c2', d: 'C', classId: 'C1', x: 580, y: 70 },
  { id: 'c3', d: 'C', classId: 'C1', x: 570, y: 95 },
  { id: 'c4', d: 'C', classId: 'C1', x: 570, y: 115 },
  { id: 'c5', d: 'C', classId: 'C1', x: 640, y: 70 },
  { id: 'c6', d: 'C', classId: 'C1', x: 660, y: 70 },
  { id: 'c7', d: 'C', classId: 'C1', x: 650, y: 95 },
]

const AMBIENT_PARTICLES = [
  { cx: 50, cy: 60, r: 1.2, className: 'particle-drift-1', color: '#818cf8' },
  { cx: 180, cy: 90, r: 0.8, className: 'particle-drift-2', color: '#818cf8' },
  { cx: 340, cy: 290, r: 1.3, className: 'particle-drift-3', color: '#00ADB5' },
  { cx: 460, cy: 320, r: 0.9, className: 'particle-drift-1', color: '#00ADB5' },
  { cx: 580, cy: 280, r: 1.4, className: 'particle-drift-2', color: '#00ADB5' },
  { cx: 700, cy: 300, r: 0.7, className: 'particle-drift-3', color: '#00ADB5' },
] as const;

const CLASS_STUDENTS: Record<string, { teacher: string; comment: string; students: { name: string; time: number }[] }> = {
  A1: {
    teacher: 'Bu Sari (Wali Kelas VII-A)',
    comment: 'Selamat datang di Kelas VII-A! Ini adalah sampel 7 data screen time siswa kami.',
    students: [
      { name: 'Adit', time: 3 }, { name: 'Budi', time: 2 }, { name: 'Cici', time: 4 },
      { name: 'Deni', time: 5 }, { name: 'Evi', time: 3 }, { name: 'Fani', time: 2 },
      { name: 'Gita', time: 4 }
    ]
  },
  A2: {
    teacher: 'Pak Bambang (Wali Kelas VII-B)',
    comment: 'Ini data 7 siswa Kelas VII-B. Mari kita gabungkan dengan data VII-A!',
    students: [
      { name: 'Hadi', time: 3 }, { name: 'Indra', time: 4 }, { name: 'Joko', time: 5 },
      { name: 'Kiki', time: 4 }, { name: 'Lia', time: 6 }, { name: 'Mira', time: 3 },
      { name: 'Niko', time: 5 }
    ]
  },
  B1: {
    teacher: 'Bu Rina (Wali Kelas VIII-A)',
    comment: 'Siswa Kelas VIII-A sangat disiplin membatasi waktu layar HP mereka!',
    students: [
      { name: 'Oki', time: 4 }, { name: 'Putri', time: 5 }, { name: 'Rian', time: 3 },
      { name: 'Santi', time: 4 }, { name: 'Tono', time: 6 }, { name: 'Umar', time: 5 },
      { name: 'Vina', time: 4 }
    ]
  },
  B2: {
    teacher: 'Pak Setiawan (Wali Kelas VIII-B)',
    comment: 'Data 7 siswa Kelas VIII-B siap dianalisis untuk tabel distribusi frekuensi!',
    students: [
      { name: 'Wawan', time: 3 }, { name: 'Xena', time: 5 }, { name: 'Yayan', time: 4 },
      { name: 'Zaki', time: 6 }, { name: 'Alma', time: 5 }, { name: 'Bimo', time: 4 },
      { name: 'Dian', time: 5 }
    ]
  },
  C1: {
    teacher: 'Pak Joko (Wali Kelas IX)',
    comment: 'Lengkap! 7 sampel siswa Kelas IX melengkapi 35 data sampel eksplorasi kita!',
    students: [
      { name: 'Elga', time: 4 }, { name: 'Farhan', time: 6 }, { name: 'Gani', time: 5 },
      { name: 'Hana', time: 4 }, { name: 'Irfan', time: 5 }, { name: 'Jihan', time: 4 },
      { name: 'Koko', time: 3 }
    ]
  },
}

// 📌 TITIK CUSTOM GARIS MERAH COLLISION (Silakan edit nilai Y untuk tiap koordinat X di sini!)
export const RED_LINE_POINTS = [
  { x: 120, y: 580 },
  { x: 280, y: 580 }, // Tepi Bangku & Tanaman Kiri
  { x: 430, y: 485 }, // Ambang Pintu 2 (Kelas VII-B)
  { x: 810, y: 485 }, // Tembok Tengah Gedung (Pintu 3 & 4)
  { x: 1110, y: 520 }, // Ambang Pintu 5 (Kelas IX)
  { x: 1110, y: 550 }, // Ambang Pintu 5 (Kelas IX)
]

// Fungsi otomatis interpolasi Y garis merah berdasarkan titik-titik sudut terurut RED_LINE_POINTS
function getRedLineY(x: number): number {
  const sortedPoints = [...RED_LINE_POINTS].sort((a, b) => a.x - b.x)
  if (x <= sortedPoints[0].x) return sortedPoints[0].y
  const last = sortedPoints[sortedPoints.length - 1]
  if (x >= last.x) return last.y

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

// Walkability: check if character feet base (center, left shoe, right shoe) is strictly inside green area
function isWalkable(x: number, y: number, unlocked: Set<string>): boolean {
  const feetRadiusX = 16.0 // Width radius of player shoes/feet

  // Outer Courtyard Pavement Bounds
  if (y > 640) return false // bottom dirt curb boundary
  if (x < 120 + feetRadiusX || x > 1110 - feetRadiusX) return false // outer side garden boundaries

  // Check that Center, Left Shoe, and Right Shoe are ALL below the Red Line!
  const redLineYCenter = getRedLineY(x)
  const redLineYLeft = getRedLineY(x - feetRadiusX)
  const redLineYRight = getRedLineY(x + feetRadiusX)

  if (y < redLineYCenter || y < redLineYLeft || y < redLineYRight) {
    return false // If ANY part of player shoes penetrates the red line, reject!
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
  const [charPos, setCharPos] = useState({ x: 650, y: 550 })
  const [unlocked, setUnlocked] = useState<Set<string>>(() => {
    return demoMode ? new Set(['A', 'B', 'C', 'A1', 'A2', 'A3', 'B1']) : new Set(['A', 'B', 'C'])
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
  const [moveDir, setMoveDir] = useState({ x: 0, y: 0 })

  const charPosRef = useRef({ x: 650, y: 550 })

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
  if (charPos.x < 500) currentRoomId = 'A'
  else if (charPos.x <= 800) currentRoomId = 'B'
  else currentRoomId = 'C'

  // Trigger Dira dialog popup when entering a room for the first time
  useEffect(() => {
    if (currentRoomId && !visitedRooms.has(currentRoomId)) {
      setVisitedRooms(prev => new Set([...prev, currentRoomId!]))
      if (currentRoomId === 'A') {
        setDiraMessageText("Halo Detektif! Di Zona VII ini terdapat beberapa kelompok meja yang menyimpan data screen time. Datangi & periksa tiap titik data untuk mengumpulkan datanya! 🕵️‍♂️")
      } else if (currentRoomId === 'B') {
        setDiraMessageText("Keren! Di Zona VIII, datamu tersimpan di papan tulis & meja belajar. Jawab tantangannya untuk membuka seluruh data!")
      } else if (currentRoomId === 'C') {
        setDiraMessageText("Hampir lengkap! Di Zona IX, periksa meja & mading kelas untuk melengkapi seluruh data screen time siswa!")
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
      if (dist < 50 && dist < minDist) {
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
      if (dist < 50 && dist < minDist) {
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

  // Auto-clamp player Y position if ever above RED_LINE_POINTS (e.g. after user edits RED_LINE_POINTS)
  useEffect(() => {
    const redLineY = getRedLineY(charPos.x)
    if (charPos.y < redLineY) {
      setCharPos(prev => ({ ...prev, y: redLineY }))
    }
  }, [charPos.x, charPos.y])

  // Main game tick: movement animation loop
  useEffect(() => {
    const tick = () => {
      if (!activeDoor && !activeClass && !diraMessageText && !showWaliKelasPopup) {
        const { x: dx, y: dy } = dirRef.current
        if (dx || dy) {
          setCharPos(p => {
            const currentRedLineY = getRedLineY(p.x)
            const safeY = Math.max(p.y, currentRedLineY)

            const nx = Math.max(10, Math.min(WORLD_VW - 10, p.x + dx * SPEED))
            const ny = Math.max(10, Math.min(WORLD_VH - 10, safeY + dy * SPEED))

            if (isWalkable(nx, ny, unlockedR.current)) return { x: nx, y: ny }
            if (isWalkable(nx, safeY, unlockedR.current)) return { x: nx, y: safeY }
            if (isWalkable(p.x, ny, unlockedR.current)) return { x: p.x, y: ny }
            return { x: p.x, y: safeY }
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
      const nextDir = len > 0 ? { x: nx / len, y: ny / len } : { x: 0, y: 0 }
      dirRef.current = nextDir
      setMoveDir(nextDir)
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
      setMoveDir({ x: 0, y: 0 })
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Main Game Viewport Container */}
      <div style={{ flex: 1, width: '100%', minHeight: 0, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 16, overflow: 'hidden', background: '#04070a', border: '1px solid rgba(14, 131, 136, 0.25)' }}>

        {/* Floating Glassmorphism Game HUD Overlay inside Viewport */}
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          pointerEvents: 'none'
        }}>
          {/* Left: Quest Title & Data Counter Card */}
          <div style={{
            background: 'rgba(11, 30, 44, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(0, 173, 181, 0.35)',
            borderRadius: 12,
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
            pointerEvents: 'auto'
          }}>
            <div style={{ fontSize: '15px' }}>🕵️‍♂️</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#F8FAFC', letterSpacing: '0.3px' }}>Eksplorasi Ruangan</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#00ADB5', fontFamily: 'monospace' }}>
                DATA: <span style={{ color: '#FFFFFF' }}>{n} / {TOTAL_N}</span>
              </span>
            </div>
          </div>

          {/* Center: Scrollable Raw Data Badges Bar (Only when data collected) */}
          {collectedStudents.length > 0 && (
            <div
              ref={scrollRef}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                overflowX: 'auto',
                padding: '4px 8px',
                background: 'rgba(11, 30, 44, 0.8)',
                backdropFilter: 'blur(8px)',
                borderRadius: '10px',
                border: '1px solid rgba(0, 173, 181, 0.25)',
                pointerEvents: 'auto',
                scrollbarWidth: 'none',
                maxWidth: '45%'
              }}
              className="scrollbar-hidden"
            >
              <style>{`
                .scrollbar-hidden::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {collectedStudents.map((st, idx) => (
                <motion.div
                  key={`${st.classId}-${st.name}-${idx}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'rgba(0, 173, 181, 0.25)',
                    border: '1.5px solid #00ADB5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '9.5px',
                    fontFamily: 'var(--font-data)',
                    flexShrink: 0
                  }}
                  title={`${st.name}: ${st.time} jam`}
                >
                  {st.time}
                </motion.div>
              ))}
            </div>
          )}

          {/* Right: Room Breakdown & Step Indicator */}
          <div style={{
            background: 'rgba(11, 30, 44, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 12,
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
            pointerEvents: 'auto'
          }}>
            <div style={{ display: 'flex', gap: 6, fontSize: '9.5px', fontWeight: 800, fontFamily: 'monospace' }}>
              <span style={{ color: unlocked.has('A1') ? '#10B981' : '#818cf8' }}>VII-A: {unlocked.has('A1') ? '✓' : '0/1'}</span>
              <span style={{ color: unlocked.has('A2') ? '#10B981' : '#6366f1' }}>VII-B: {unlocked.has('A2') ? '✓' : '0/1'}</span>
              <span style={{ color: unlocked.has('B1') ? '#10B981' : '#00ADB5' }}>VIII-A: {unlocked.has('B1') ? '✓' : '0/1'}</span>
              <span style={{ color: unlocked.has('B2') ? '#10B981' : '#0e8388' }}>VIII-B: {unlocked.has('B2') ? '✓' : '0/1'}</span>
              <span style={{ color: unlocked.has('C1') ? '#10B981' : '#f472b6' }}>IX: {unlocked.has('C1') ? '✓' : '0/1'}</span>
            </div>
            <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.15)' }} />
            <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Langkah 1/3</span>
          </div>
        </div>

        <div style={{ flex: 1, width: '100%', minHeight: 0, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {(() => {
            const camX = Math.max(0, Math.min(WORLD_VW - VIEW_VW, charPos.x - VIEW_VW / 2))
            const camY = Math.max(0, Math.min(WORLD_VH - VIEW_VH, charPos.y - VIEW_VH * 0.65))
            return (
              <svg viewBox={`${camX} ${camY} ${VIEW_VW} ${VIEW_VH}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxHeight: '100%', aspectRatio: `${VIEW_VW}/${VIEW_VH}`, display: 'block' }}>
                <defs>
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

                {/* Main Classroom Background Image with reduced opacity (0.45) for collision inspection */}
                <image
                  href="/Assets/Building/Kelas.jpg"
                  x={0}
                  y={0}
                  width={WORLD_VW}
                  height={WORLD_VH}
                  preserveAspectRatio="none"
                  opacity={0.45}
                />

                {/* Dark Vignette Tint Overlay for Game Mood */}
                <rect x={0} y={0} width={WORLD_VW} height={WORLD_VH} fill="rgba(4, 7, 10, 0.15)" />

                {/* ─── VISUAL COLLISION DEBUGGER OVERLAY (Inspect Collision Geometry) ─── */}
                {/* 1. Walkable Area Polygon (Neon Green Mesh - Fill Otomatis dari RED_LINE_POINTS) */}
                <polygon
                  points={[
                    ...RED_LINE_POINTS.map(p => `${p.x},${p.y}`),
                    `${RED_LINE_POINTS[RED_LINE_POINTS.length - 1].x},640`,
                    `${RED_LINE_POINTS[0].x},640`
                  ].join(' ')}
                  fill="rgba(16, 185, 129, 0.18)"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="6,6"
                />

                {/* 2. Red Line Wall Base Boundary (User's Exact Red Line Wall Base) */}
                <polyline
                  points={RED_LINE_POINTS.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth={3.5}
                />

                {/* 3. Obstacle Collision: Bangku & Pot Tanaman Kiri */}
                <rect x={120} y={510} width={160} height={100} fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth={1.5} />
                <text x={200} y={560} textAnchor="middle" fill="#ef4444" fontSize={10} fontWeight="bold">⛔ TEMBOK BANGBKU & POT</text>

                {/* 4. Player Feet Ground Collision Base Line (Garis Pijakan Telapak Sepatu) */}
                <ellipse cx={charPos.x} cy={charPos.y} rx={22} ry={6} fill="rgba(244, 63, 94, 0.4)" stroke="#f43f5e" strokeWidth={2} />
                <line x1={charPos.x - 24} y1={charPos.y} x2={charPos.x + 24} y2={charPos.y} stroke="#f43f5e" strokeWidth={2.5} />
                <text x={charPos.x} y={charPos.y + 18} textAnchor="middle" fill="#f43f5e" fontSize={9} fontWeight="bold">
                  ({Math.round(charPos.x)}, {Math.round(charPos.y)})
                </text>

                {/* 5. VISUAL NODE DECORATORS FOR RED_LINE_POINTS (Visual Badges P1, P2, P3...) */}
                {RED_LINE_POINTS.map((pt, idx) => (
                  <g key={`red-node-${idx}`}>
                    {/* Outer Glowing Ring */}
                    <circle cx={pt.x} cy={pt.y} r={7} fill="rgba(239, 68, 68, 0.4)" stroke="#ef4444" strokeWidth={1.5} />
                    {/* Inner White Node Dot */}
                    <circle cx={pt.x} cy={pt.y} r={3} fill="#ffffff" />
                    {/* Node Tag Badge */}
                    <rect
                      x={pt.x - 30}
                      y={pt.y - 23}
                      width={60}
                      height={15}
                      rx={4}
                      fill="rgba(15, 23, 42, 0.92)"
                      stroke="#ef4444"
                      strokeWidth={1}
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 12}
                      textAnchor="middle"
                      fill="#f87171"
                      fontSize={8.5}
                      fontWeight="900"
                      fontFamily="monospace"
                    >
                      P{idx + 1}: {pt.x},{pt.y}
                    </text>
                  </g>
                ))}

                {/* Zone Boundary Grid Lines */}
                <line x1={450} y1={410} x2={450} y2={680} stroke="rgba(129, 140, 248, 0.25)" strokeWidth={1.5} strokeDasharray="6,6" />
                <line x1={800} y1={410} x2={800} y2={680} stroke="rgba(0, 173, 181, 0.25)" strokeWidth={1.5} strokeDasharray="6,6" />

                {/* Class & Furniture Data Hotspots (CLASS_DOORS) */}
                {CLASS_DOORS.map(door => {
                  const open = unlocked.has(door.id)
                  const near = nearClass?.id === door.id && !open
                  const isJustCompleted = justCompletedClassId === door.id

                  return (
                    <g
                      key={door.id}
                      style={{ cursor: open ? 'default' : 'pointer' }}
                      onClick={e => { e.stopPropagation(); if (!open && !activeClass && !activeDoor) setActiveClass(door) }}
                    >
                      {/* Interactive Pulse Radar Glow */}
                      {!open || isJustCompleted ? (
                        <motion.circle
                          cx={door.x}
                          cy={door.y}
                          r={20}
                          fill={`${door.color}22`}
                          animate={isJustCompleted
                            ? { scale: [1, 1.8, 1], fill: [`${door.color}33`, '#10B981', `${door.color}22`] }
                            : near
                              ? { scale: [1, 1.4, 1], fill: [`${door.color}33`, `${door.color}77`, `${door.color}33`] }
                              : { scale: [0.95, 1.15, 0.95] }
                          }
                          transition={{ duration: isJustCompleted ? 1.2 : 1.5, repeat: isJustCompleted ? 0 : Infinity, ease: 'easeInOut' }}
                        />
                      ) : (
                        <circle cx={door.x} cy={door.y} r={12} fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth={1} />
                      )}

                      {/* Hotspot Icon Badge */}
                      <circle
                        cx={door.x}
                        cy={door.y}
                        r={12}
                        fill={open ? '#10b981' : 'rgba(15, 23, 42, 0.88)'}
                        stroke={near ? '#FFFFFF' : door.color}
                        strokeWidth={near ? 2 : 1.5}
                      />
                      <text
                        x={door.x}
                        y={door.y + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={10}
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                      >
                        {open ? '✓' : '📍'}
                      </text>

                      {/* Hotspot Title Card */}
                      <rect
                        x={door.x - 45}
                        y={door.y - 36}
                        width={90}
                        height={20}
                        rx={6}
                        fill="rgba(15, 23, 42, 0.9)"
                        stroke={near ? '#FFFFFF' : open ? '#10b981' : `${door.color}88`}
                        strokeWidth={near ? 1.5 : 1}
                      />
                      <text
                        x={door.x}
                        y={door.y - 23}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize={9.5}
                        fontWeight="bold"
                        fontFamily="var(--font-ui)"
                      >
                        {door.label}
                      </text>
                    </g>
                  )
                })}

                {/* Dynamic Perspective Depth Scaling Calculation */}
                {(() => {
                  const depthRatio = Math.max(0, Math.min(1, (charPos.y - 410) / (650 - 410)))
                  const charSize = 145 + depthRatio * 65
                  const btnY = charPos.y - charSize * 0.95
                  const btnTextY = btnY + 14

                  return (
                    <>
                      {/* Player Character */}
                      <PlayerCharacter
                        x={charPos.x}
                        y={charPos.y}
                        dir={moveDir}
                        size={charSize}
                        label="Kamu"
                      />

                      {/* Floating Interactive Prompt Buttons */}
                      <AnimatePresence>
                        {nearClass && !unlocked.has(nearClass.id) && !activeClass && !nearDoor && (() => {
                          const buttonW = 150
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
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
                                y={btnY}
                                width={buttonW}
                                height={26}
                                rx={13}
                                fill="rgba(15, 23, 42, 0.95)"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#ffffff"
                                fontSize={11}
                                fontWeight="bold"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)' }}
                              >
                                📍 Periksa {nearClass.label}
                              </text>
                            </motion.g>
                          )
                        })()}
                      </AnimatePresence>
                    </>
                  )
                })()}
              </svg>
            )
          })()}

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
            <Joystick onDir={(x, y) => { const nextDir = { x, y }; dirRef.current = nextDir; setMoveDir(nextDir); }} />
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
