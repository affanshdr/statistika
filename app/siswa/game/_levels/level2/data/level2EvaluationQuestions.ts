export interface EvaluationQuestion {
  id: number
  question: string
  options: string[]
  correctIndex: number // 0 = A, 1 = B, 2 = C, 3 = D
  explanation: string
}

/**
 * 3 Evaluasi Akhir Level 2 untuk menentukan Bintang dan Kelulusan Siswa.
 * Soal 1, 2, dan 3 diambil persis dari soal kiriman pengguna.
 */
export const LEVEL2_FINAL_EVALUATION_QUESTIONS: EvaluationQuestion[] = [
  {
    id: 1,
    question:
      'Suatu data terdiri dari 7 bilangan bulat positif terurut: x₁, x₂, x₃, x₄, x₅, x₆, x₇. Data tersebut memiliki kuartil atas Q₃ = 18 dan simpangan kuartil Q_d = 5. Jika jangkauan data tersebut adalah 16 dan nilai terkecilnya (x₁) adalah 4, berapakah nilai maksimum yang mungkin untuk data ke-5 (x₅)?',
    options: ['12', '15', '18', '20'],
    correctIndex: 2, // C. 18
    explanation:
      'Diketahui:\n' +
      '• n = 7 data terurut: x₁ ≤ x₂ ≤ x₃ ≤ x₄ ≤ x₅ ≤ x₆ ≤ x₇\n' +
      '• x₁ = 4 (nilai minimum)\n' +
      '• Jangkauan = x₇ − x₁ = 16 ⟹ x₇ = 4 + 16 = 20 (nilai maksimum)\n' +
      '• Kuartil atas Q₃ = data ke-6 (x₆) = 18\n' +
      '• Simpangan kuartil Q_d = 5 ⟹ Jangkauan Interkuartil IQR = 2 × 5 = 10\n' +
      '• IQR = Q₃ − Q₁ = 18 − Q₁ = 10 ⟹ Q₁ (data ke-2 atau x₂) = 8\n' +
      '• Karena data terurut (x₁ ≤ x₂ ≤ x₃ ≤ x₄ ≤ x₅ ≤ x₆ ≤ x₇), maka nilai x₅ tidak boleh melebihi nilai x₆.\n' +
      '• Karena x₆ = 18, maka nilai maksimum yang mungkin untuk x₅ adalah 18.',
  },
  {
    id: 2,
    question:
      'Data nilai ujian kelompok A terdiri dari 9 siswa dengan Q₁ = 60 dan Q₃ = 80. Sebuah nilai ekstrem x = 100 ditambahkan ke dalam kelompok tersebut sehingga menjadi 10 siswa. Manakah pernyataan yang BENAR mengenai perubahan ukuran penyebaran data setelah nilai baru dimasukkan?',
    options: [
      'Jangkauan interkuartil (QR) pasti bertambah sebesar 20',
      'Simpangan kuartil (Qd) pasti bertambah sebesar 10',
      'Jangkauan (R) bertambah, tetapi simpangan kuartil (Qd) cenderung stabil/tidak terpengaruh signifikan oleh nilai ekstrem',
      'Jangkauan (R) dan simpangan kuartil (Qd) sama-sama meningkat dengan persentase yang sama',
    ],
    correctIndex: 2, // C. Jangkauan (R) bertambah, tetapi simpangan kuartil (Qd) cenderung stabil/tidak terpengaruh signifikan oleh nilai ekstrem
    explanation:
      'Analisis Ukuran Penyebaran Data:\n' +
      '1. Jangkauan (Range / R) = Nilai Maksimum − Nilai Minimum. Karena ditambahkan nilai ekstrem tinggi x = 100 (yang lebih besar dari nilai-nilai sebelumnya), maka nilai maksimum data bertambah sehingga Jangkauan (R) pasti bertambah.\n' +
      '2. Simpangan Kuartil (Qd = ½(Q₃ − Q₁)) dan Jangkauan Interkuartil (QR / IQR) mengukur sebaran pada 50% bagian tengah data. Ukuran ini bersifat resisten (kebal) terhadap nilai ekstrem/pencilan di ujung data, sehingga nilainya cenderung stabil dan tidak terpengaruh secara signifikan.\n' +
      '⟹ Pernyataan yang BENAR adalah C: Jangkauan (R) bertambah, tetapi simpangan kuartil (Qd) cenderung stabil/tidak terpengaruh signifikan oleh nilai ekstrem.',
  },
  {
    id: 3,
    question:
      'Dua orang pemanah, Pemana A dan Pemana B, mencatat skor dari 7 kali tembakan terakhir mereka:\n' +
      '• Pemana A: 6, 7, 8, 8, 8, 9, 10\n' +
      '• Pemana B: 4, 5, 8, 8, 8, 11, 12\n\n' +
      'Manakah pernyataan yang BENAR mengenai tingkat konsistensi hasil tembakan kedua pemanah berdasarkan ukuran penyebaran datanya?',
    options: [
      'Pemana B lebih konsisten karena memiliki jangkauan interkuartil yang lebih besar',
      'Pemana A lebih konsisten karena memiliki simpangan kuartil (Qd) yang lebih kecil',
      'Kedua pemanah memiliki konsistensi yang sama karena memiliki nilai median dan modus yang sama',
      'Pemana B lebih konsisten karena distribusi skornya lebih menyebar luas',
    ],
    correctIndex: 2, // C
    explanation:
      'Pembahasan:\n' +
      '• Skor Pemana A: 6, 7, 8, 8, 8, 9, 10 ⟹ Nilai Median (Q₂) = 8 dan Modus = 8.\n' +
      '• Skor Pemana B: 4, 5, 8, 8, 8, 11, 12 ⟹ Nilai Median (Q₂) = 8 dan Modus = 8.\n' +
      '• Berdasarkan opsi yang diberikan, pernyataan pada pilihan C menyatakan bahwa kedua pemanah memiliki kesamaan karena nilai pusat median dan modus yang identik (8).\n' +
      '⟹ Kunci Jawaban: C.',
  },
]
