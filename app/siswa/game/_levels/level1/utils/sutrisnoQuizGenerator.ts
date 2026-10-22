export interface SutrisnoClaimQuiz {
  actualMean: number
  claimThreshold: number
  isClaimTrue: boolean
  questionText: string
  options: { label: string; text: string; isCorrect: boolean }[]
  explanation: string
}

export function generatePakSutrisnoClaimQuiz(dataset: number[]): SutrisnoClaimQuiz {
  const validData = dataset && dataset.length > 0 ? dataset : [3, 4, 5, 4, 5, 6, 4, 3, 5, 4, 4, 5, 4, 3, 5, 4, 5, 6, 3, 4, 5, 4, 5, 4]
  const sum = validData.reduce((a, b) => a + b, 0)
  const actualMean = Number((sum / validData.length).toFixed(1))

  // Pick random claim type: true (claim threshold < actualMean) or false (claim threshold > actualMean)
  const isClaimTrue = Math.random() < 0.5

  let claimThreshold = 0
  let correctText = ''
  let distractor1 = ''
  let distractor2 = ''
  let distractor3 = ''

  if (isClaimTrue) {
    const lowPool = [2.5, 2.8, 3.0, 3.2, 3.5].filter(v => v < actualMean)
    claimThreshold = lowPool[Math.floor(Math.random() * lowPool.length)] || 3.0
    correctText = `Benar, karena rata-rata siswa (${actualMean} jam) melebihi ${claimThreshold} jam/hari`
    distractor1 = `Salah, rata-rata siswa tidak mencapai ${claimThreshold} jam/hari`
    distractor2 = `Salah, karena kesimpulan rata-rata hanya berlaku untuk kelas VII saja`
    distractor3 = `Tidak dapat disimpulkan dari ukuran pemusatan data`
  } else {
    const highPool = [6.0, 6.5, 7.0, 7.5, 8.0].filter(v => v > actualMean)
    claimThreshold = highPool[Math.floor(Math.random() * highPool.length)] || 7.0
    correctText = `Salah, rata-rata siswa sebenarnya hanya ${actualMean} jam/hari`
    distractor1 = `Benar, rata-rata siswa terbukti lebih dari ${claimThreshold} jam/hari`
    distractor2 = `Benar, karena nilai modus siswa melebihi ${claimThreshold} jam/hari`
    distractor3 = `Tidak dapat disimpulkan dari ukuran pemusatan data`
  }

  const rawOptions = [
    { text: correctText, isCorrect: true },
    { text: distractor1, isCorrect: false },
    { text: distractor2, isCorrect: false },
    { text: distractor3, isCorrect: false },
  ]

  for (let i = rawOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = rawOptions[i]
    rawOptions[i] = rawOptions[j]
    rawOptions[j] = temp
  }

  const labels = ['A', 'B', 'C', 'D']
  const options = rawOptions.map((opt, i) => ({
    label: labels[i],
    text: opt.text,
    isCorrect: opt.isCorrect,
  }))

  return {
    actualMean,
    claimThreshold,
    isClaimTrue,
    questionText: `Dari rata-rata yang kamu dapat (${actualMean} jam), apakah klaim bahwa rata-rata screen time siswa kita > ${claimThreshold} jam/hari itu benar?`,
    options,
    explanation: isClaimTrue
      ? `Rata-rata sebenarnya adalah ${actualMean} jam, sehingga klaim > ${claimThreshold} jam bernilai BENAR.`
      : `Rata-rata sebenarnya hanya ${actualMean} jam, sehingga klaim > ${claimThreshold} jam bernilai SALAH.`,
  }
}
