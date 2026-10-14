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

export const CLASS_DOORS: QuizDoor[] = [
  // Pintu 1 (Sayap Kiri Depan) - Kelas VII-A
  {
    id: 'A1', roomId: 'A', label: 'Kelas VII-A', x: 135, y: 475, color: '#818cf8',
    image: '/Assets/Building/Ruang VII-A/VII-A.webp',
    quizQ: 'Data screen time 5 siswa: 2, 4, 3, 6, 1 jam. Berapa rentang datanya?',
    quizA: 5, choices: [3, 4, 5, 6],
    fdContext: '💡 Ingat: rentang = nilai terbesar − nilai terkecil',
    hint: 'Kurangkan nilai terbesar (6) dengan nilai terkecil (1) untuk mendapatkan rentang.', count: 5
  },

  // Pintu 2 (Sayap Kiri Dalam) - Kelas VII-B
  {
    id: 'A2', roomId: 'A', label: 'Kelas VII-B', x: 250, y: 385, color: '#6366f1',
    image: '/Assets/Building/Ruang VII-B/VII-B.webp',
    quizQ: 'Tepi bawah kelas interval 4–6 adalah?',
    quizA: 3.5, choices: [3, 3.5, 4, 4.5],
    fdContext: '💡 Ingat: tepi bawah = batas bawah − 0.5',
    hint: 'Kurangi batas bawah kelas (4) dengan 0.5.', count: 7
  },

  // Pintu 3 (Gedung Tengah / Pintu Utama) - Ruang Guru (Pak Sutrisno)
  {
    id: 'RG', roomId: 'RG', label: 'Ruang Guru', x: 625, y: 345, color: '#F59E0B',
    image: '/Assets/Building/Ruang Guru/Ruang Guru.webp',
    quizQ: 'Ruang Guru dan Kantor Kedisiplinan Pak Sutrisno.',
    quizA: 0,
    hint: 'Kumpulkan data dari 4 kelas terlebih dahulu untuk menemui Pak Sutrisno!', count: 0
  },

  // Pintu 4 (Sayap Kanan Dalam) - Kelas VIII-A
  {
    id: 'B1', roomId: 'B', label: 'Kelas VIII-A', x: 985, y: 385, color: '#00ADB5',
    image: '/Assets/Building/Ruang VIII-A/VIII-A.webp',
    quizQ: 'Kamu menerima berita viral yang belum terverifikasi. Tindakan paling etis adalah?',
    quizA: 'Verifikasi dulu', choices: ['Langsung share', 'Verifikasi dulu', 'Screenshot & sebar', 'Abaikan saja'],
    fdContext: '💡 Pikirkan dampaknya terhadap orang lain',
    hint: 'Cari tindakan yang memastikan kebenaran informasi sebelum membagikannya.', count: 4
  },

  // Pintu 5 (Sayap Kanan Depan) - Kelas VIII-B
  {
    id: 'B2', roomId: 'B', label: 'Kelas VIII-B', x: 1100, y: 475, color: '#0e8388',
    image: '/Assets/Building/Ruang VIII-B/VIII-B.webp',
    quizQ: 'Seseorang memposting foto orang lain tanpa izin untuk konten viral. Ini termasuk pelanggaran?',
    quizA: 'Kedua-duanya', choices: ['Privasi', 'Hak cipta', 'Kedua-duanya', 'Bukan pelanggaran'],
    fdContext: '💡 Pikirkan mengenai kepemilikan dan privasi hak orang lain',
    hint: 'Memposting foto orang lain melanggar ranah pribadi sekaligus kepemilikan ciptaan.', count: 8
  },
]

export const CLASS_STUDENTS: Record<string, { teacher: string; comment: string; image?: string; students: { name: string; time: number }[] }> = {
  A1: {
    teacher: 'Bu Sari (Wali Kelas VII-A)',
    comment: 'Selamat datang di Kelas VII-A! Ini adalah sampel 5 data screen time siswa kami.',
    image: '/Assets/Building/Ruang VII-A/VII-A.webp',
    students: [
      { name: 'Adit', time: 2 },
      { name: 'Budi', time: 3 },
      { name: 'Cici', time: 4 },
      { name: 'Deni', time: 5 },
      { name: 'Evi', time: 6 }
    ]
  },
  A2: {
    teacher: 'Pak Bambang (Wali Kelas VII-B)',
    comment: 'Ini data 7 siswa Kelas VII-B. Mari kita gabungkan dengan data kelas lainnya!',
    image: '/Assets/Building/Ruang VII-B/VII-B.webp',
    students: [
      { name: 'Fani', time: 1 },
      { name: 'Gita', time: 2 },
      { name: 'Hadi', time: 3 },
      { name: 'Indra', time: 4 },
      { name: 'Joko', time: 5 },
      { name: 'Kiki', time: 7 },
      { name: 'Lia', time: 8 }
    ]
  },
  B1: {
    teacher: 'Bu Rina (Wali Kelas VIII-A)',
    comment: 'Siswa Kelas VIII-A cukup teratur dalam menggunakan gawai. Ini 4 sampel datanya!',
    image: '/Assets/Building/Ruang VIII-A/VIII-A.webp',
    students: [
      { name: 'Mira', time: 3 },
      { name: 'Niko', time: 4 },
      { name: 'Oki', time: 6 },
      { name: 'Putri', time: 9 }
    ]
  },
  B2: {
    teacher: 'Pak Setiawan (Wali Kelas VIII-B)',
    comment: 'Di Kelas VIII-B ada beberapa siswa dengan waktu layar cukup tinggi hingga 18 jam! Ini 8 sampel datanya.',
    image: '/Assets/Building/Ruang VIII-B/VIII-B.webp',
    students: [
      { name: 'Rian', time: 2 },
      { name: 'Santi', time: 3 },
      { name: 'Tono', time: 5 },
      { name: 'Umar', time: 7 },
      { name: 'Vina', time: 11 },
      { name: 'Wawan', time: 14 },
      { name: 'Xena', time: 16 },
      { name: 'Zaki', time: 18 }
    ]
  },
  RG: {
    teacher: 'Pak Sutrisno (Guru BK & Kedisiplinan)',
    comment: 'Bagus sekali Stevunt! Seluruh 24 data screen time dari 4 kelas sudah terkumpul lengkap.',
    image: '/Assets/Building/Ruang Guru/Ruang Guru.webp',
    students: []
  }
}

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
