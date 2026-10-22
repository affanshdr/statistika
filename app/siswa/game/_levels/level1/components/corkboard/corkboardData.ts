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
    conceptHeading: 'Tujuan Tahap Ini',
    conceptText:
      'Median (Me) adalah nilai tengah yang membagi data terurut menjadi dua kelompok sama banyak.',
    formula: {
      title: 'Rumus Median Data Genap (n = 24):',
      equation: 'Me = (Data ke-12 + Data ke-13) ÷ 2',
      explanation:
        'Karena total 24 data genap, ambil dua angka tepat di posisi tengah (slot #12 dan #13), lalu cari nilai tengahnya.'
    },
    howToSteps: [
      'Cari nilai angka pada slot #12 dan #13.',
      'Hitung rata-ratanya: jumlahkan kedua angka tersebut lalu bagi 2.'
    ],
    proTip:
      'Median membagi data menjadi 12 data di sisi kiri dan 12 data di sisi kanan.'
  },
  mean: {
    stepNum: 4,
    tag: 'Mean',
    title: 'Tahap 4: Menghitung Rata-Rata (Mean)',
    icon: '🧮',
    badgeColor: '#059669',
    conceptHeading: 'Tujuan Tahap Ini',
    conceptText:
      'Mean (x̄) adalah nilai rata-rata hitung yang mewakili keseluruhan data.',
    formula: {
      title: 'Rumus Rata-Rata (Mean):',
      equation: 'x̄ = Total Jumlah Nilai (∑x) ÷ 24',
      explanation:
        'Bagi total jumlah seluruh jam waktu layar (∑x) dengan total banyaknya siswa (24).'
    },
    howToSteps: [
      'Gunakan total penjumlahan nilai data (∑x) yang tertera.',
      'Bagi dengan 24 menggunakan bantuan kalkulator di sebelah kanan.'
    ],
    proTip:
      'Nilai mean meratakan total waktu layar ke setiap siswa secara adil.'
  }
}
