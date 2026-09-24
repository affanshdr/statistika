export type DoorId = 'A' | 'B' | 'C'

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
  // Pintu 1 (Sayap Kiri) - Kelas VII-A
  {
    id: 'A1', roomId: 'A', label: 'Kelas VII-A', x: 310, y: 564, color: '#818cf8',
    image: '/Assets/Building/Ruang VII-A/VII-A_custom.png',
    quizQ: 'Data screen time 5 siswa: 2, 4, 3, 8, 1 jam. Berapa rentang datanya?',
    quizA: 7, choices: [5, 6, 7, 8],
    fdContext: '💡 Ingat: rentang = nilai terbesar − nilai terkecil',
    hint: 'Kurangkan nilai terbesar (8) dengan nilai terkecil (1) untuk mendapatkan rentang.', count: 7
  },

  // Pintu 2 (Lorong Kiri) - Kelas VII-B
  {
    id: 'A2', roomId: 'A', label: 'Kelas VII-B', x: 431, y: 495, color: '#6366f1',
    image: '/Assets/Building/Kelas.jpg',
    quizQ: 'Tepi bawah kelas interval 4–6 adalah?',
    quizA: 3.5, choices: [3, 3.5, 4, 4.5],
    fdContext: '💡 Ingat: tepi bawah = batas bawah − 0.5',
    hint: 'Kurangi batas bawah kelas (4) dengan 0.5.', count: 7
  },

  // Pintu 3 (Gedung Tengah / Pintu Ganda) - Kelas VIII-A
  {
    id: 'B1', roomId: 'B', label: 'Kelas VIII-A', x: 632, y: 485, color: '#00ADB5',
    image: '/Assets/Building/Kelas.jpg',
    quizQ: 'Kamu menerima berita viral yang belum terverifikasi. Tindakan paling etis adalah?',
    quizA: 'Verifikasi dulu', choices: ['Langsung share', 'Verifikasi dulu', 'Screenshot & sebar', 'Abaikan saja'],
    fdContext: '💡 Pikirkan dampaknya terhadap orang lain',
    hint: 'Cari tindakan yang memastikan kebenaran informasi sebelum membagikannya.', count: 7
  },

  // Pintu 4 (Lorong Kanan) - Kelas VIII-B
  {
    id: 'B2', roomId: 'B', label: 'Kelas VIII-B', x: 830, y: 485, color: '#0e8388',
    image: '/Assets/Building/Kelas.jpg',
    quizQ: 'Seseorang memposting foto orang lain tanpa izin untuk konten viral. Ini termasuk pelanggaran?',
    quizA: 'Kedua-duanya', choices: ['Privasi', 'Hak cipta', 'Kedua-duanya', 'Bukan pelanggaran'],
    fdContext: '💡 Pikirkan mengenai kepemilikan dan privasi hak orang lain',
    hint: 'Memposting foto orang lain melanggar ranah pribadi sekaligus kepemilikan ciptaan.', count: 7
  },

  // Pintu 5 (Sayap Kanan) - Kelas IX
  {
    id: 'C1', roomId: 'C', label: 'Kelas IX', x: 944, y: 561, color: '#f472b6',
    image: '/Assets/Building/Kelas.jpg',
    quizQ: 'Ciri utama berita hoax yang paling umum meupakan?',
    quizA: 'Sumber tidak jelas', choices: ['Sumber tidak jelas', 'Ada foto', 'Ada tanggal', 'Ditulis wartawan'],
    fdContext: '💡 Perhatikan kredibilitas pembuat informasi',
    hint: 'Berita bohong biasanya tidak menyebutkan asal-usul kredibel atau pihak penanggung jawab.', count: 7
  },
]

export const CLASS_STUDENTS: Record<string, { teacher: string; comment: string; image?: string; students: { name: string; time: number }[] }> = {
  A1: {
    teacher: 'Bu Sari (Wali Kelas VII-A)',
    comment: 'Selamat datang di Kelas VII-A! Ini adalah sampel 7 data screen time siswa kami.',
    image: '/Assets/Building/Ruang VII-A/VII-A_custom.png',
    students: [
      { name: 'Adit', time: 3 }, { name: 'Budi', time: 2 }, { name: 'Cici', time: 4 },
      { name: 'Deni', time: 5 }, { name: 'Evi', time: 3 }, { name: 'Fani', time: 2 },
      { name: 'Gita', time: 4 }
    ]
  },
  A2: {
    teacher: 'Pak Bambang (Wali Kelas VII-B)',
    comment: 'Ini data 7 siswa Kelas VII-B. Mari kita gabungkan dengan data VII-A!',
    image: '/Assets/Building/Kelas.jpg',
    students: [
      { name: 'Hadi', time: 3 }, { name: 'Indra', time: 4 }, { name: 'Joko', time: 5 },
      { name: 'Kiki', time: 4 }, { name: 'Lia', time: 6 }, { name: 'Mira', time: 3 },
      { name: 'Niko', time: 5 }
    ]
  },
  B1: {
    teacher: 'Bu Rina (Wali Kelas VIII-A)',
    comment: 'Siswa Kelas VIII-A sangat disiplin membatasi waktu layar HP mereka!',
    image: '/Assets/Building/Kelas.jpg',
    students: [
      { name: 'Oki', time: 4 }, { name: 'Putri', time: 5 }, { name: 'Rian', time: 3 },
      { name: 'Santi', time: 4 }, { name: 'Tono', time: 6 }, { name: 'Umar', time: 5 },
      { name: 'Vina', time: 4 }
    ]
  },
  B2: {
    teacher: 'Pak Setiawan (Wali Kelas VIII-B)',
    comment: 'Data 7 siswa Kelas VIII-B siap dianalisis untuk tabel distribusi frekuensi!',
    image: '/Assets/Building/Kelas.jpg',
    students: [
      { name: 'Wawan', time: 3 }, { name: 'Xena', time: 5 }, { name: 'Yayan', time: 4 },
      { name: 'Zaki', time: 6 }, { name: 'Alma', time: 5 }, { name: 'Bimo', time: 4 },
      { name: 'Dian', time: 5 }
    ]
  },
  C1: {
    teacher: 'Pak Joko (Wali Kelas IX)',
    comment: 'Lengkap! 7 sampel siswa Kelas IX melengkapi 35 data sampel eksplorasi kita!',
    image: '/Assets/Building/Kelas.jpg',
    students: [
      { name: 'Elga', time: 4 }, { name: 'Farhan', time: 6 }, { name: 'Gani', time: 5 },
      { name: 'Hana', time: 4 }, { name: 'Irfan', time: 5 }, { name: 'Jihan', time: 4 },
      { name: 'Koko', time: 3 }
    ]
  },
}

export const DATA_CIRCLES = [
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
  { id: 'c1', d: 'C', classId: 'C1', x: 560, y: 70 },
  { id: 'c2', d: 'C', classId: 'C1', x: 580, y: 70 },
  { id: 'c3', d: 'C', classId: 'C1', x: 570, y: 95 },
  { id: 'c4', d: 'C', classId: 'C1', x: 570, y: 115 },
  { id: 'c5', d: 'C', classId: 'C1', x: 640, y: 70 },
  { id: 'c6', d: 'C', classId: 'C1', x: 660, y: 70 },
  { id: 'c7', d: 'C', classId: 'C1', x: 650, y: 95 },
]

export const AMBIENT_PARTICLES = [
  { cx: 50, cy: 60, r: 1.2, className: 'particle-drift-1', color: '#818cf8' },
  { cx: 180, cy: 90, r: 0.8, className: 'particle-drift-2', color: '#818cf8' },
  { cx: 340, cy: 290, r: 1.3, className: 'particle-drift-3', color: '#00ADB5' },
  { cx: 460, cy: 320, r: 0.9, className: 'particle-drift-1', color: '#00ADB5' },
  { cx: 580, cy: 280, r: 1.4, className: 'particle-drift-2', color: '#00ADB5' },
  { cx: 700, cy: 300, r: 0.7, className: 'particle-drift-3', color: '#00ADB5' },
] as const
