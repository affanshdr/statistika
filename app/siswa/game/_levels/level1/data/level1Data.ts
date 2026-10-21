export type DoorId = 'A' | 'B' | 'RG'

export interface QuizDoor {
  id: string
  roomId: DoorId
  label: string
  x: number
  y: number
  color: string
  image?: string
  quizQ: string
  quizA: number | string
  hint: string
  count: number
  choices?: readonly (number | string)[]
  fdContext?: string
}

import { screenTimeData } from '@/app/siswa/game/_data/level1'

export function getClassDoors(customDataset?: number[] | null): QuizDoor[] {
  const data = customDataset && customDataset.length === 24 ? customDataset : screenTimeData

  // 1. Kelas VII-A (5 Siswa): Jangkauan Data (Range = Max - Min)
  const a1Data = data.slice(0, 5)
  const minA1 = Math.min(...a1Data)
  const maxA1 = Math.max(...a1Data)
  const rangeA1 = maxA1 - minA1
  const choiceSetA1 = new Set<number>([rangeA1])
  for (const offset of [-2, -1, 1, 2, 3]) {
    const val = rangeA1 + offset
    if (val > 0) choiceSetA1.add(val)
  }
  const choicesA1 = Array.from(choiceSetA1).slice(0, 4).sort((a, b) => a - b)

  // 2. Kelas VII-B (7 Siswa): Frekuensi Data Kriteria (f dengan waktu > 4 jam)
  const a2Data = data.slice(5, 12)
  const cutoffA2 = 4
  let countA2 = a2Data.filter(v => v > cutoffA2).length
  if (countA2 < 2 || countA2 > 5) {
    countA2 = a2Data.filter(v => v > 3).length
  }
  const choiceSetA2 = new Set<number>([countA2])
  for (const offset of [-2, -1, 1, 2, 3]) {
    const val = countA2 + offset
    if (val >= 1 && val <= 7) choiceSetA2.add(val)
  }
  const choicesA2 = Array.from(choiceSetA2).slice(0, 4).sort((a, b) => a - b)

  // 4. Kelas VIII-A (4 Siswa): Jumlah Seluruh Nilai Data (Sigma / Σx)
  const b1Data = data.slice(12, 16)
  const sumB1 = b1Data.reduce((a, b) => a + b, 0)
  const choiceSetB1 = new Set<number>([sumB1])
  for (const offset of [-3, -2, 2, 3, 4]) {
    const val = sumB1 + offset
    if (val > 0) choiceSetB1.add(val)
  }
  const choicesB1 = Array.from(choiceSetB1).slice(0, 4).sort((a, b) => a - b)

  // 5. Kelas VIII-B (8 Siswa): Selisih Pencilan (Outlier) Ekstrem
  const b2Data = data.slice(16, 24)
  const sortedB2 = [...b2Data].sort((a, b) => b - a)
  const outlierB2 = sortedB2[0]
  const secondB2 = sortedB2[1]
  const diffB2 = outlierB2 - secondB2
  const choiceSetB2 = new Set<number>([diffB2])
  for (const offset of [-3, -2, 2, 3, 4]) {
    const val = diffB2 + offset
    if (val > 0) choiceSetB2.add(val)
  }
  const choicesB2 = Array.from(choiceSetB2).slice(0, 4).sort((a, b) => a - b)

  return [
    // Pintu 1 - Kelas VII-A
    {
      id: 'A1', roomId: 'A', label: 'Kelas VII-A', x: 166, y: 355, color: '#818cf8',
      image: '/Assets/Building/Ruang VII-A/VII-A.webp',
      quizQ: `Data screen time 5 siswa: ${a1Data.join(', ')} jam. Berapa rentang (selisih max − min) datanya?`,
      quizA: rangeA1,
      choices: choicesA1,
      fdContext: '💡 Rentang (Range) = Nilai Terbesar − Nilai Terkecil',
      hint: `Kurangkan nilai terbesar (${maxA1}) dengan nilai terkecil (${minA1}).`, count: 5
    },

    // Pintu 2 - Kelas VII-B
    {
      id: 'A2', roomId: 'A', label: 'Kelas VII-B', x: 390, y: 355, color: '#6366f1',
      image: '/Assets/Building/Ruang VII-B/VII-B.webp',
      quizQ: `Data 7 siswa Kelas VII-B: ${a2Data.join(', ')} jam. Berapa banyak siswa yang waktu layarnya > 4 jam?`,
      quizA: countA2,
      choices: choicesA2,
      fdContext: '💡 Frekuensi (f) = Banyaknya kemunculan data yang memenuhi kriteria',
      hint: 'Hitung berapa banyak angka pada data di atas yang nilainya lebih besar dari 4.', count: 7
    },

    // Pintu 3 (Gedung Tengah / Pintu Utama) - Ruang Guru (Pak Sutrisno)
    {
      id: 'RG', roomId: 'RG', label: 'Ruang Guru', x: 618, y: 355, color: '#F59E0B',
      image: '/Assets/Building/Ruang Guru/Ruang Guru.webp',
      quizQ: 'Ruang Guru dan Kantor Kedisiplinan Pak Sutrisno.',
      quizA: 0,
      hint: 'Kumpulkan data dari 4 kelas terlebih dahulu untuk menemui Pak Sutrisno!', count: 0
    },

    // Pintu 4 - Kelas VIII-A
    {
      id: 'B1', roomId: 'B', label: 'Kelas VIII-A', x: 839, y: 355, color: '#00ADB5',
      image: '/Assets/Building/Ruang VIII-A/VIII-A.webp',
      quizQ: `Data 4 siswa Kelas VIII-A: ${b1Data.join(', ')} jam. Berapa total jam seluruh siswa (${b1Data.join(' + ')} = ?)?`,
      quizA: sumB1,
      choices: choicesB1,
      fdContext: '💡 Sigma (Σx) = Jumlah penjumlahan seluruh nilai data',
      hint: `Jumlahkan keempat angka jam waktu layar: ${b1Data.join(' + ')}.`, count: 4
    },

    // Pintu 5 - Kelas VIII-B
    {
      id: 'B2', roomId: 'B', label: 'Kelas VIII-B', x: 1064, y: 355, color: '#0e8388',
      image: '/Assets/Building/Ruang VIII-B/VIII-B.webp',
      quizQ: `Di Kelas VIII-B ada data pencilan (${outlierB2} jam) dibanding angka tertinggi kedua (${secondB2} jam). Berapa selisihnya?`,
      quizA: diffB2,
      choices: choicesB2,
      fdContext: '💡 Pencilan (Outlier) = Nilai yang menyimpang jauh dari kelompok data',
      hint: `Kurangkan nilai pencilan tertinggi (${outlierB2}) dengan angka tertinggi berikutnya (${secondB2}).`, count: 8
    },
  ]
}

export function getClassStudents(customDataset?: number[] | null): Record<string, { teacher: string; comment: string; image?: string; students: { name: string; time: number }[] }> {
  const data = customDataset && customDataset.length === 24 ? customDataset : screenTimeData
  const a1 = data.slice(0, 5)
  const a2 = data.slice(5, 12)
  const b1 = data.slice(12, 16)
  const b2 = data.slice(16, 24)

  return {
    A1: {
      teacher: 'Bu Sari (Wali Kelas VII-A)',
      comment: 'Selamat datang di Kelas VII-A! Ini adalah sampel 5 data screen time siswa kami.',
      image: '/Assets/Building/Ruang VII-A/VII-A.webp',
      students: [
        { name: 'Adit', time: a1[0] },
        { name: 'Budi', time: a1[1] },
        { name: 'Cici', time: a1[2] },
        { name: 'Deni', time: a1[3] },
        { name: 'Evi', time: a1[4] }
      ]
    },
    A2: {
      teacher: 'Pak Bambang (Wali Kelas VII-B)',
      comment: 'Ini data 7 siswa Kelas VII-B. Mari kita gabungkan dengan data kelas lainnya!',
      image: '/Assets/Building/Ruang VII-B/VII-B.webp',
      students: [
        { name: 'Fani', time: a2[0] },
        { name: 'Gita', time: a2[1] },
        { name: 'Hadi', time: a2[2] },
        { name: 'Indra', time: a2[3] },
        { name: 'Joko', time: a2[4] },
        { name: 'Kiki', time: a2[5] },
        { name: 'Lia', time: a2[6] }
      ]
    },
    B1: {
      teacher: 'Bu Rina (Wali Kelas VIII-A)',
      comment: 'Siswa Kelas VIII-A cukup teratur dalam menggunakan gawai. Ini 4 sampel datanya!',
      image: '/Assets/Building/Ruang VIII-A/VIII-A.webp',
      students: [
        { name: 'Mira', time: b1[0] },
        { name: 'Niko', time: b1[1] },
        { name: 'Oki', time: b1[2] },
        { name: 'Putri', time: b1[3] }
      ]
    },
    B2: {
      teacher: 'Pak Setiawan (Wali Kelas VIII-B)',
      comment: 'Di Kelas VIII-B ada beberapa siswa dengan waktu layar cukup tinggi hingga 18 jam! Ini 8 sampel datanya.',
      image: '/Assets/Building/Ruang VIII-B/VIII-B.webp',
      students: [
        { name: 'Rian', time: b2[0] },
        { name: 'Santi', time: b2[1] },
        { name: 'Tono', time: b2[2] },
        { name: 'Umar', time: b2[3] },
        { name: 'Vina', time: b2[4] },
        { name: 'Wawan', time: b2[5] },
        { name: 'Xena', time: b2[6] },
        { name: 'Zaki', time: b2[7] }
      ]
    },
    RG: {
      teacher: 'Pak Sutrisno (Guru BK & Kedisiplinan)',
      comment: 'Bagus sekali Stevunt! Seluruh 24 data screen time dari 4 kelas sudah terkumpul lengkap.',
      image: '/Assets/Building/Ruang Guru/Ruang Guru.webp',
      students: []
    }
  }
}

export const CLASS_DOORS = getClassDoors()
export const CLASS_STUDENTS = getClassStudents()

export const DATA_CIRCLES = [
  // VII-A (5 data)
  { id: 'a1', d: 'A', classId: 'A1', x: 40, y: 70 },
  { id: 'a2', d: 'A', classId: 'A1', x: 60, y: 70 },
  { id: 'a3', d: 'A', classId: 'A1', x: 50, y: 95 },
  { id: 'a4', d: 'A', classId: 'A1', x: 120, y: 70 },
  { id: 'a5', d: 'A', classId: 'A1', x: 140, y: 70 },

  // VII-B (7 data)
  { id: 'a6', d: 'A', classId: 'A2', x: 200, y: 70 },
  { id: 'a7', d: 'A', classId: 'A2', x: 220, y: 70 },
  { id: 'a8', d: 'A', classId: 'A2', x: 210, y: 95 },
  { id: 'a9', d: 'A', classId: 'A2', x: 250, y: 70 },
  { id: 'a10', d: 'A', classId: 'A2', x: 270, y: 70 },
  { id: 'a11', d: 'A', classId: 'A2', x: 260, y: 95 },
  { id: 'a12', d: 'A', classId: 'A2', x: 290, y: 70 },

  // VIII-A (4 data)
  { id: 'b1', d: 'B', classId: 'B1', x: 330, y: 60 },
  { id: 'b2', d: 'B', classId: 'B1', x: 350, y: 60 },
  { id: 'b3', d: 'B', classId: 'B1', x: 340, y: 80 },
  { id: 'b4', d: 'B', classId: 'B1', x: 330, y: 100 },

  // VIII-B (8 data)
  { id: 'b5', d: 'B', classId: 'B2', x: 400, y: 60 },
  { id: 'b6', d: 'B', classId: 'B2', x: 420, y: 80 },
  { id: 'b7', d: 'B', classId: 'B2', x: 410, y: 100 },
  { id: 'b8', d: 'B', classId: 'B2', x: 430, y: 100 },
  { id: 'b9', d: 'B', classId: 'B2', x: 460, y: 60 },
  { id: 'b10', d: 'B', classId: 'B2', x: 480, y: 60 },
  { id: 'b11', d: 'B', classId: 'B2', x: 470, y: 80 },
  { id: 'b12', d: 'B', classId: 'B2', x: 460, y: 100 },
]

export const AMBIENT_PARTICLES = [
  { cx: 50, cy: 60, r: 1.2, className: 'particle-drift-1', color: '#818cf8' },
  { cx: 180, cy: 90, r: 0.8, className: 'particle-drift-2', color: '#818cf8' },
  { cx: 340, cy: 290, r: 1.3, className: 'particle-drift-3', color: '#00ADB5' },
  { cx: 460, cy: 320, r: 0.9, className: 'particle-drift-1', color: '#00ADB5' },
  { cx: 580, cy: 280, r: 1.4, className: 'particle-drift-2', color: '#00ADB5' },
  { cx: 700, cy: 300, r: 0.7, className: 'particle-drift-3', color: '#00ADB5' },
] as const
