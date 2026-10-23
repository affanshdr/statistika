'use client'

import { useState, useEffect } from 'react'

export interface SortToken {
  id: string
  val: number
}

// 📐 Grid Adaptif: pilih susunan kolom (12×2 / 8×3 / 6×4) yang menghasilkan bulatan terbesar
export function useFitGrid(count: number, maxSize = 88) {
  const [el, setEl] = useState<HTMLDivElement | null>(null)
  const [layout, setLayout] = useState<{ cols: number; size: number }>({ cols: 12, size: 40 })

  useEffect(() => {
    if (!el) return
    const compute = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (!w || !h) return
      let best = { cols: 12, size: 0 }
      for (const cols of [12, 8, 6]) {
        const rows = Math.ceil(count / cols)
        const gapX = Math.max(4, w * 0.012)
        const gapY = Math.max(8, h * 0.05)
        const cellW = (w - gapX * (cols - 1)) / cols
        // Sisakan ~12% ruang vertikal untuk badge nomor slot (#1, #2, ...) di bawah bulatan
        const cellH = ((h - gapY * (rows - 1)) / rows) * 0.88
        const size = Math.floor(Math.min(cellW, cellH, maxSize))
        if (size > best.size) best = { cols, size }
      }
      best.size = Math.max(22, best.size)
      setLayout(prev => (prev.cols === best.cols && prev.size === best.size ? prev : best))
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [el, count, maxSize])

  return [setEl, layout] as const
}

export interface TutorialExampleItem {
  title: string
  sampleData: string
  badgeNote?: string
  visualNumbers?: Array<{
    val: number | string
    isCenter?: boolean
    isMode?: boolean
    subLabel?: string
  }>
  bracketNote?: {
    leftCount?: number
    rightCount?: number
    centerLabel?: string
  }
  steps: string[]
  resultHighlight: string
}

export interface StageTutorialContent {
  stepNum: number
  tag: string
  title: string
  icon: string
  badgeColor: string
  conceptHeading: string
  conceptText: string
  formula?: {
    title: string
    equation: string
    explanation: string
  }
  examples?: TutorialExampleItem[]
  example?: TutorialExampleItem
  howToSteps: string[]
  proTip: string
}

export const STAGE_TUTORIALS: Record<'sort' | 'modus' | 'median' | 'mean', StageTutorialContent> = {
  sort: {
    stepNum: 1,
    tag: 'Urutkan Data',
    title: 'Tahap 1: Mengurutkan Data',
    icon: '📊',
    badgeColor: '#059669',
    conceptHeading: 'Tujuan Tahap Ini',
    conceptText:
      'Susun seluruh 24 data waktu layar mulai dari nilai terkecil hingga nilai terbesar (ascending order).',
    formula: {
      title: 'Prinsip Urutan Data:',
      equation: 'Nilai Terkecil  ➔  ...  ➔  Nilai Terbesar',
      explanation:
        'Jika terdapat angka yang sama (kembar), letakkan berdampingan pada slot berurutan.'
    },
    howToSteps: [
      'Ambil angka dari wadah atas (drag atau klik angka).',
      'Letakkan ke slot #1 sampai #24 dari yang terkecil ke terbesar, lalu tekan verifikasi.'
    ],
    proTip:
      'Mengelompokkan angka kembar di tahap ini akan mempermudahmu menemukan Modus di tahap berikutnya.'
  },
  modus: {
    stepNum: 2,
    tag: 'Modus',
    title: 'Tahap 2: Menentukan Modus',
    icon: '🎯',
    badgeColor: '#0284C7',
    conceptHeading: 'Tujuan Tahap Ini',
    conceptText:
      'Modus (Mo) adalah nilai data yang paling sering muncul (memiliki frekuensi kemunculan terbanyak).',
    formula: {
      title: 'Prinsip Modus:',
      equation: 'Mo = Angka dengan Kemunculan Terbanyak',
      explanation:
        'Cari barisan angka kembar yang paling panjang dari data yang sudah diurutkan.'
    },
    howToSteps: [
      'Perhatikan barisan angka pada 24 data terurut.',
      'Hitung angka mana yang muncul paling sering, lalu pilih jawaban yang tepat.'
    ],
    proTip:
      'Data terurut memudahkan melihat deretan angka kembar secara langsung.'
  },
  median: {
    stepNum: 3,
    tag: 'Median',
    title: 'Tahap 3: Menentukan Median',
    icon: '⚖️',
    badgeColor: '#D97706',
    conceptHeading: 'Konsep Median',
    conceptText:
      'Median (Me) adalah nilai tengah yang membagi data terurut menjadi dua kelompok sama banyak. Cara menentukan median berbeda tergantung jumlah data (n) ganjil atau genap.',
    formula: {
      title: 'Rumus Median:',
      equation: 'n Ganjil → Data ke-(n+1)/2  |  n Genap → (Data ke-n/2 + Data ke-(n/2+1)) ÷ 2',
      explanation:
        'Data ini n = 24 (GENAP) → Me = (Data ke-12 + Data ke-13) ÷ 2. Jika n = 7 (GANJIL) → Me = Data ke-4 (nilai tengah tunggal).'
    },
    examples: [
      {
        title: '① Data Ganjil (n = 7)',
        sampleData: 'Data: 3, 5, 7, 9, 12, 14, 18',
        steps: [
          'Posisi median = (7+1)/2 = ke-4',
          'Median = data ke-4 = 9',
        ],
        resultHighlight: 'Me = 9 (nilai tunggal di tengah)'
      },
      {
        title: '② Data Genap (n = 24) — Kasus Ini',
        sampleData: 'Data sudah terurut, 24 elemen (genap)',
        steps: [
          'Posisi tengah = ke-12 dan ke-13',
          'Me = (nilai slot #12 + nilai slot #13) ÷ 2',
        ],
        resultHighlight: 'Me = rata-rata dua nilai di tengah'
      }
    ],
    howToSteps: [
      'Pastikan 24 data sudah terurut (dari Tahap 1).',
      'Karena n = 24 (genap), ambil nilai pada slot #12 dan #13.',
      'Jumlahkan keduanya lalu bagi 2 → itulah Median.'
    ],
    proTip:
      'Trik cepat: median membagi data 12 kiri vs 12 kanan. Nilai #12 dan #13 adalah penjaga garis tengah tersebut.'
  },
  mean: {
    stepNum: 4,
    tag: 'Mean',
    title: 'Tahap 4: Menghitung Rata-Rata (Mean)',
    icon: '🧮',
    badgeColor: '#059669',
    conceptHeading: 'Konsep Rata-Rata (Mean)',
    conceptText:
      'Mean (x̄) adalah nilai rata-rata hitung yang mewakili keseluruhan data. Ada tiga situasi penting yang sering muncul dalam soal statistika:',
    formula: {
      title: 'Rumus Rata-Rata (Mean):',
      equation: 'x̄ = Total Jumlah Nilai (∑x) ÷ n',
      explanation:
        'Bagi total jumlah seluruh nilai data (∑x) dengan banyaknya data (n). Untuk data ini: jumlahkan sendiri 24 angka, lalu bagi 24.'
    },
    examples: [
      {
        title: '① Koreksi Kesalahan Input Data',
        sampleData: 'Mean awal = 78, n = 30. Nilai 64 harusnya 46, nilai 89 harusnya 98.',
        steps: [
          '1. Hitung total awal: ∑x = 78 × 30 = 2.340',
          '2. Koreksi: kurangi nilai salah, tambah nilai benar.',
          '   2.340 − 64 + 46 − 89 + 98 = 2.331',
          '3. Mean baru = 2.331 ÷ 30 = 77,7'
        ],
        resultHighlight: 'Jika ada koreksi data, hitung ulang ∑x baru lalu bagi n.'
      },
      {
        title: '② Rata-Rata Gabungan (Weighted Mean)',
        sampleData: 'Grup A: 15 siswa, mean = 70. Grup B: 25 siswa, mean = 80.',
        steps: [
          '1. Total nilai A = 15 × 70 = 1.050',
          '2. Total nilai B = 25 × 80 = 2.000',
          '3. Gabungkan: (1.050 + 2.000) ÷ (15 + 25) = 3.050 ÷ 40 = 76,25',
        ],
        resultHighlight: 'x̄ gabungan = (n₁×x̄₁ + n₂×x̄₂) ÷ (n₁ + n₂)'
      },
      {
        title: '③ Mencari Nilai Unknown dari Mean & Median',
        sampleData: 'Data: 3, 5, 7, x, y, 12, 14 — median = 9, mean = 9.',
        steps: [
          '1. Median data ganjil ke-4 (dari 7) = x → x = 9',
          '2. Mean: (3+5+7+9+y+12+14) ÷ 7 = 9',
          '3. 50 + y = 63 → y = 13',
          '4. y − x = 13 − 9 = 4'
        ],
        resultHighlight: 'Gunakan syarat median untuk temukan x, lalu syarat mean untuk temukan y.'
      }
    ],
    howToSteps: [
      'Lihat total penjumlahan nilai data (∑x) yang tertera di papan.',
      'Bagi dengan 24 (banyak data) untuk menemukan nilai rata-rata.',
      'Ingat: jika ada koreksi data, hitung ulang ∑x baru sebelum dibagi n.',
      'Untuk dua kelompok, gunakan rumus rata-rata gabungan (weighted mean).'
    ],
    proTip:
      'Rata-rata SANGAT sensitif terhadap perubahan data. Satu nilai yang salah atau ekstrem dapat menggeser mean secara signifikan — itulah mengapa verifikasi data selalu penting!'
  }
}
