export type QuestionType = 'multiple-choice' | 'essay'

export interface PostTestQuestion {
  id: number
  type?: QuestionType        // default: 'multiple-choice' jika tidak diisi
  text: string
  hint?: string              // petunjuk opsional untuk soal isian
  // ── Pilihan Ganda ──────────────────────────────────
  options?: string[]         // wajib jika type = 'multiple-choice'
  correct?: number           // 0-based index jawaban benar
  // ── Isian Singkat (Essay) ──────────────────────────
  answerKeywords?: string[]  // semua kata kunci ini harus ada di jawaban siswa
  correctAnswerLabel?: string // label jawaban benar yang ditampilkan setelah submit
  // ── Tabel (Opsional) ───────────────────────────────
  tableData?: {
    headers: string[]
    rows: string[][]
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Ganti soal-soal di bawah ini sesuai kebutuhan
// ─────────────────────────────────────────────────────────────────────────────
export const POST_TEST_QUESTIONS: PostTestQuestion[] = [
  {
    id: 1,
    type: 'essay',
    text: 'Tepi bawah dan tepi atas pada kelas keempat adalah ....',
    tableData: {
      headers: ['Berat Badan (kg)', 'Frekuensi'],
      rows: [
        ['35 – 41', '3'],
        ['42 – 48', '8'],
        ['49 – 55', '6'],
        ['56 – 62', '12'],
        ['63 – 69', '9'],
        ['70 – 76', '2'],
      ],
    },
    answerKeywords: ['55,5', '62,5'],
    correctAnswerLabel: '55,5 dan 62,5',
  },
  {
    id: 2,
    type: 'essay',
    text: 'Selisih banyak siswa yang berat badannya kurang dari 56 dan lebih dari 62 adalah ... orang.',
    tableData: {
      headers: ['Berat Badan (kg)', 'Frekuensi'],
      rows: [
        ['35 – 41', '3'],
        ['42 – 48', '8'],
        ['49 – 55', '6'],
        ['56 – 62', '12'],
        ['63 – 69', '9'],
        ['70 – 76', '2'],
      ],
    },
    answerKeywords: ['6'],
    correctAnswerLabel: '6',
  },
  {
    id: 3,
    type: 'essay',
    text: 'Dari hasil sensus tahun 2017 di sebuah desa terpencil, didapatkan data jumlah penduduk 80 orang dengan usia termuda 1 tahun dan usia tertua 57 tahun. Jika data tersebut dibuat daftar distribusi frekuensi kelompok dengan menggunakan aturan Sturges, panjang kelas yang mungkin adalah ....',
    hint: 'log 80 = 1,9',
    answerKeywords: ['8'],
    correctAnswerLabel: '8',
  },
  {
    id: 4,
    type: 'multiple-choice',
    text: 'Di era digital, setiap orang bisa menjadi pembuat sekaligus penyebar informasi (produsen data). Mengapa pemahaman yang baik tentang cara membaca rentang interval kelas pada tabel data kelompok sangat penting bagi seorang remaja?',
    options: [
      'Agar bisa memenangkan setiap perdebatan di kolom komentar media sosial dengan kata-kata yang rumit.',
      'Agar mampu menyaring informasi secara kritis dan tidak mudah terprovokasi oleh kesimpulan sepihak yang dibuat konten kreator.',
      'Agar bisa mendapatkan penghasilan tambahan sebagai komentator statistik di internet.',
      'Agar akun media sosialnya terhindar dari pemblokiran atau peretasan oleh pihak lain.',
    ],
    correct: 1,
  },
  {
    id: 5,
    type: 'multiple-choice',
    text: 'Di media sosial, jika ada seseorang membagikan histogram hasil game yang bentuk batangnya sengaja dibuat sangat lebar untuk satu kelompok tertentu agar terlihat paling banyak, kemampuan digital apa yang kita gunakan jika kita berhasil menyadari kesalahan rentang kelas tersebut?',
    options: [
      'Literasi data dan media digital',
      'Keamanan sandi digital',
      'Etika berkomentar di internet',
      'Desain grafis modern',
    ],
    correct: 0,
  },
]
