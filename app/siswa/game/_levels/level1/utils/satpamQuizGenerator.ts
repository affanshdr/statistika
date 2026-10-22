export type SatpamChatStage =
  | 'idle'
  | 'pak_stop_1'
  | 'player_excuse_1'
  | 'pak_stop_2'
  | 'pak_quiz'
  | 'pak_wrong'
  | 'pak_pass_1'
  | 'pak_pass_2'
  | 'player_thanks'

export interface SatpamTimeQuiz {
  templateIdx: number
  pakGreeting: string
  questionText: string
  options: string[]
  correctIndex: number
  explanation: string
}

export const SATPAM_WRONG_TEASES = [
  'Walah le, masih ngantuk berat ya?! Masak hitungan jam segampang itu meleset. Coba cuci muka terus hitung soal baru ini!',
  'Eits, salah hitung kamu! Jangan-jangan semalam begadang main HP ya?! Ayo fokus, coba pecahkan teka-teki waktu yang baru ini!',
  'Aduh le, lari sih kencang tapi hitungannya selip! Tenang dulu napasnya, coba hitung ulang soal baru di bawah ini!',
  'Tetot! Kurang tepat le! Kalau ngitung jam aja salah, gimana mau ngumpulin data statistik buat Pak Sutrisno? Coba lagi yang ini!'
]

export function generateSatpamTimeQuiz(prevTemplateIdx?: number): SatpamTimeQuiz {
  const availableTemplates = [0, 1, 2, 3, 4].filter(idx => idx !== prevTemplateIdx)
  const templateIdx = availableTemplates[Math.floor(Math.random() * availableTemplates.length)]
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

  let pakGreeting = ''
  let questionText = ''
  let correctStr = ''
  let distractorStrs: string[] = []
  let explanation = ''

  if (templateIdx === 0) {
    // Variasi A: Selisih Keterlambatan dari Bel Masuk (07.00)
    const M = pick([12, 14, 16, 17, 18, 19, 21, 22, 23, 24, 26, 27, 28, 29, 32, 34])
    const timeStr = `07.${String(M).padStart(2, '0')}`
    pakGreeting = `"Eits, berhenti dulu le! Mau nyelonong aja kamu?! Jam segini baru nongol di gerbang, dari mana aja?!"`
    questionText = `Bel masuk sekolah berbunyi tepat pukul 07.00. Sekarang jam di Pos Satpam menunjukkan pukul ${timeStr}. Berapa menit kamu terlambat pagi ini?`
    correctStr = `${M} Menit`
    distractorStrs = [`${M - 4} Menit`, `${M + 4} Menit`, `${M + 8} Menit`]
    explanation = `Dari pukul 07.00 ke pukul ${timeStr} selisihnya tepat ${M} menit.`
  } else if (templateIdx === 1) {
    // Variasi B: Waktu Keberangkatan dari Rumah
    const T = pick([12, 15, 18, 20, 22, 25])
    const D = pick([6, 8, 9, 11, 13, 14, 16])
    const A = D + T
    const arrStr = `07.${String(A).padStart(2, '0')}`
    const depStr = `07.${String(D).padStart(2, '0')}`
    pakGreeting = `"Walah le, napasmu sampai ngos-ngosan begitu kayak habis lari maraton dari rumah!"`
    questionText = `Kalau perjalanan dari rumahmu ke sekolah memakan waktu ${T} menit, dan kamu baru tiba di gerbang pukul ${arrStr}, pukul berapa tadi kamu berangkat dari rumah?`
    correctStr = `Pukul ${depStr}`
    distractorStrs = [
      `Pukul 07.${String(D - 3).padStart(2, '0')}`,
      `Pukul 07.${String(D + 4).padStart(2, '0')}`,
      `Pukul 07.${String(D + 8).padStart(2, '0')}`
    ]
    explanation = `Waktu tiba (${arrStr}) dikurangi lama perjalanan (${T} menit) = pukul ${depStr}.`
  } else if (templateIdx === 2) {
    // Variasi C: Sisa Waktu Sebelum Absen Kelas Ditutup
    const targetMin = pick([30, 35, 40, 45])
    const R = pick([7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19])
    const C = targetMin - R
    const currStr = `07.${String(C).padStart(2, '0')}`
    const targetStr = `07.${String(targetMin).padStart(2, '0')}`
    pakGreeting = `"Hayo, kenapa telat lagi?! Untung saja buku absen piket di dalam belum ditutup!"`
    questionText = `Batas akhir toleransi absen kelas adalah pukul ${targetStr}. Sekarang jam tangan Pak Joko menunjukkan pukul ${currStr}. Berapa menit sisa waktumu untuk lari ke dalam?`
    correctStr = `${R} Menit`
    distractorStrs = [`${R - 3} Menit`, `${R + 3} Menit`, `${R + 7} Menit`]
    explanation = `Dari pukul ${currStr} menuju pukul ${targetStr} tersisa ${targetMin} - ${C} = ${R} menit.`
  } else if (templateIdx === 3) {
    // Variasi D: Durasi Sejak Gerbang Ditutup (Melintasi Pukul 06.XX ke 07.XX)
    const startM = pick([40, 45, 50])
    const arrM = pick([11, 13, 14, 16, 18, 19, 21, 23])
    const L = (60 - startM) + arrM
    const startStr = `06.${String(startM).padStart(2, '0')}`
    const arrStr = `07.${String(arrM).padStart(2, '0')}`
    pakGreeting = `"Aduh le! Teman-temanmu sudah baris apel pagi sejak tadi, kamu baru kelihatan batang hidungnya!"`
    questionText = `Pintu gerbang mulai dirapatkan sejak apel pagi pukul ${startStr}, dan kamu baru sampai pukul ${arrStr}. Sudah berapa menit kamu tertinggal sejak apel dimulai?`
    correctStr = `${L} Menit`
    distractorStrs = [`${L - 5} Menit`, `${L + 5} Menit`, `${arrM} Menit`]
    explanation = `Dari ${startStr} ke 07.00 adalah ${60 - startM} menit, ditambah ${arrM} menit = ${L} menit.`
  } else {
    // Variasi E: Estimasi Waktu Tiba di Kelas
    const arrM = pick([12, 14, 16, 17, 19, 21, 23, 24])
    const walkM = pick([4, 6, 7, 8, 9])
    const totalM = arrM + walkM
    const arrStr = `07.${String(arrM).padStart(2, '0')}`
    const totalStr = `07.${String(totalM).padStart(2, '0')}`
    pakGreeting = `"Tahan dulu langkahmu le! Pak Joko mau ngetes kefokusanmu pagi ini biar nggak ngelindur di lapangan!"`
    questionText = `Sekarang pukul ${arrStr}. Jika kamu butuh waktu ${walkM} menit lagi untuk melapor ke Pak Sutrisno dan jalan menuju kelas, pukul berapa kamu baru sampai di kelas?`
    correctStr = `Pukul ${totalStr}`
    distractorStrs = [
      `Pukul 07.${String(totalM - 3).padStart(2, '0')}`,
      `Pukul 07.${String(totalM + 3).padStart(2, '0')}`,
      `Pukul 07.${String(totalM + 6).padStart(2, '0')}`
    ]
    explanation = `Pukul ${arrStr} ditambah ${walkM} menit perjalanan = pukul ${totalStr}.`
  }

  // Shuffle options
  const rawOptions = [
    { text: correctStr, isCorrect: true },
    ...distractorStrs.map(text => ({ text, isCorrect: false }))
  ]
  for (let i = rawOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = rawOptions[i]
    rawOptions[i] = rawOptions[j]
    rawOptions[j] = temp
  }

  return {
    templateIdx,
    pakGreeting,
    questionText,
    options: rawOptions.map(o => o.text),
    correctIndex: rawOptions.findIndex(o => o.isCorrect),
    explanation
  }
}
