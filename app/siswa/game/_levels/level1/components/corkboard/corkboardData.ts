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
    tag: 'Fondasi Statistika',
    title: 'Tahap 1: Mengurutkan Data (Data Terurut)',
    icon: '📊',
    badgeColor: '#059669',
    conceptHeading: 'Mengapa Data Harus Diurutkan Terlebih Dahulu?',
    conceptText:
      'Dalam statistika, mengurutkan data dari nilai terkecil ke terbesar (ascending order) adalah langkah awal paling mendasar. Dengan data terurut, pola sebaran langsung terbaca, angka kembar berkumpul, serta kita bisa menemukan nilai tengah (median) dan nilai terbanyak (modus) secara cepat dan akurat.',
    formula: {
      title: 'Prinsip Mengurutkan Data:',
      equation: 'Nilai Terkecil  ➔  ...  ➔  Nilai Terbesar',
      explanation:
        'Susun semua angka mulai dari yang bernilai paling kecil. Jika terdapat angka kembar (nilai sama), letakkan berdampingan pada slot berurutan.'
    },
    examples: [
      {
        title: 'Contoh Mengurutkan Data (Sampel 5 Angka Acak):',
        sampleData: 'Data Acak: [ 6, 2, 4, 2, 5 ]',
        visualNumbers: [
          { val: 2, subLabel: 'Slot #1' },
          { val: 2, subLabel: 'Slot #2' },
          { val: 4, subLabel: 'Slot #3' },
          { val: 5, subLabel: 'Slot #4' },
          { val: 6, subLabel: 'Slot #5' },
        ],
        steps: [
          'Cari nilai paling kecil: angka 2 (ada 2 buah) ➔ letakkan di awal: 2, 2',
          'Cari nilai berikutnya yang lebih besar: angka 4, lalu angka 5',
          'Terakhir, letakkan nilai paling besar: angka 6 di slot paling akhir'
        ],
        resultHighlight: 'Hasil Data Terurut: [ 2, 2, 4, 5, 6 ]'
      }
    ],
    howToSteps: [
      'Ambil bulatan angka dari wadah atas (Drag & Drop atau klik angka untuk mengambil ke tangan).',
      'Letakkan angka ke slot bernomor urut #1 sampai #24 di wadah bawah, dimulai dari nilai terkecil ke terbesar.',
      'Jika ada angka yang bernilai sama, susun berdampingan pada slot yang berurutan.',
      'Setelah semua 24 slot terisi, tekan tombol "Periksa Urutan Data" untuk memverifikasi!'
    ],
    proTip:
      'Perhatikan angka kembar sebelum menaruh! Mengelompokkan angka yang sama akan langsung membantumu menjawab Tahap 2 (Modus) dengan mudah.'
  },
  modus: {
    stepNum: 2,
    tag: 'Ukuran Pemusatan Data',
    title: 'Tahap 2: Menentukan Modus (Mode / Nilai Terbanyak)',
    icon: '🎯',
    badgeColor: '#0284C7',
    conceptHeading: 'Apa itu Modus dalam Statistika?',
    conceptText:
      'Modus (Mo) adalah nilai data yang paling sering muncul atau memiliki frekuensi kemunculan tertinggi di dalam sekumpulan data. Modus berguna untuk mengetahui kebiasaan atau tren mayoritas dari kelompok yang kita amati.',
    formula: {
      title: 'Prinsip Menemukan Modus:',
      equation: 'Mo = Nilai data dengan Frekuensi (f) Terbanyak',
      explanation:
        'Karena data sudah diurutkan di Tahap 1, angka yang sama kini berjejer rapat berdampingan. Kamu cukup mencari barisan angka kembar yang paling panjang! Prinsip modus berlaku sama pada data ganjil maupun data genap.'
    },
    examples: [
      {
        title: 'Contoh 1: Data Berjumlah Ganjil (n = 5 data):',
        badgeNote: 'n = 5 (Ganjil)',
        sampleData: 'Data Terurut: [ 3, 4, 4, 4, 7 ]',
        visualNumbers: [
          { val: 3, subLabel: 'f = 1' },
          { val: 4, isMode: true, subLabel: 'f = 3 👑' },
          { val: 4, isMode: true, subLabel: 'Modus' },
          { val: 4, isMode: true, subLabel: 'Terbanyak' },
          { val: 7, subLabel: 'f = 1' },
        ],
        steps: [
          'Nilai 3 muncul 1 kali (f = 1)',
          'Nilai 4 muncul 3 kali (f = 3) ➔ frekuensi kemunculan terbanyak!',
          'Nilai 7 muncul 1 kali (f = 1)'
        ],
        resultHighlight: 'Modus (Mo) = 4 (karena angka 4 muncul paling banyak, yaitu 3 kali)'
      },
      {
        title: 'Contoh 2: Data Berjumlah Genap (n = 6 data):',
        badgeNote: 'n = 6 (Genap)',
        sampleData: 'Data Terurut: [ 2, 3, 5, 5, 5, 8 ]',
        visualNumbers: [
          { val: 2, subLabel: 'f = 1' },
          { val: 3, subLabel: 'f = 1' },
          { val: 5, isMode: true, subLabel: 'f = 3 👑' },
          { val: 5, isMode: true, subLabel: 'Modus' },
          { val: 5, isMode: true, subLabel: 'Terbanyak' },
          { val: 8, subLabel: 'f = 1' },
        ],
        steps: [
          'Nilai 2 muncul 1 kali, nilai 3 muncul 1 kali',
          'Nilai 5 muncul 3 kali (f = 3) ➔ frekuensi kemunculan terbanyak!',
          'Nilai 8 muncul 1 kali'
        ],
        resultHighlight: 'Modus (Mo) = 5 (Baik data ganjil maupun genap, modus selalu nilai dengan frekuensi terbanyak!)'
      }
    ],
    howToSteps: [
      'Amati 24 data terurut dengan nomor urut #1 sampai #24 di bagian atas.',
      'Hitung frekuensi (berapa kali suatu angka muncul) untuk setiap deretan angka yang ada.',
      'Cari nilai yang memiliki barisan kemunculan paling panjang, lalu pilih opsi jawaban yang tepat.'
    ],
    proTip:
      'Sebuah kumpulan data bisa memiliki satu modus (unimodal), dua modus (bimodal), atau bahkan tidak ada modus jika semua angka muncul sama banyaknya.'
  },
  median: {
    stepNum: 3,
    tag: 'Ukuran Pemusatan Data',
    title: 'Tahap 3: Menentukan Median (Nilai Tengah Data Terurut)',
    icon: '⚖️',
    badgeColor: '#D97706',
    conceptHeading: 'Apa itu Median dan Bagaimana Cara Menghitungnya?',
    conceptText:
      'Median (Me) adalah nilai tengah yang membagi sekumpulan data menjadi dua kelompok sama banyak (50% data di sebelah kiri dan 50% data di sebelah kanan) setelah data diurutkan dari terkecil ke terbesar.',
    formula: {
      title: 'Rumus Median (Perbedaan Data Ganjil vs Data Genap):',
      equation: 'Ganjil: Me = Data ke-((n+1)/2)  |  Genap: Me = (Data ke-(n/2) + Data ke-(n/2+1)) ÷ 2',
      explanation:
        'Pada data GANJIL, posisi tengah adalah tepat 1 angka tunggal. Pada data GENAP (seperti game ini n = 24), posisi tengah ada 2 angka di tengah (data ke-12 dan ke-13) yang harus dijumlahkan lalu dibagi 2.'
    },
    examples: [
      {
        title: 'Contoh 1: Data Berjumlah Ganjil (n = 5, Nilai Tengah Tunggal):',
        badgeNote: 'n = 5 (Ganjil)',
        sampleData: 'Data Terurut: [ 2, 3, 5, 7, 8 ]',
        visualNumbers: [
          { val: 2, subLabel: 'Data #1' },
          { val: 3, subLabel: 'Data #2' },
          { val: 5, isCenter: true, subLabel: '🎯 NILAI TENGAH' },
          { val: 7, subLabel: 'Data #4' },
          { val: 8, subLabel: 'Data #5' },
        ],
        bracketNote: {
          leftCount: 2,
          rightCount: 2,
          centerLabel: '2 data di kiri ➔ [ Nilai Tengah: 5 ] ➔ 2 data di kanan',
        },
        steps: [
          'Karena n = 5 (ganjil), posisi tengah berada di data ke-(5 + 1) ÷ 2 = data ke-3.',
          'Data ke-3 bernilai 5. Ada tepat 2 angka di sebelah kiri (2, 3) dan 2 angka di sebelah kanan (7, 8).',
          'Nilai tengah tunggal langsung diambil tanpa perlu dibagi apa pun!'
        ],
        resultHighlight: 'Median (Me) = 5 (Tepat berada di tengah data terurut)'
      },
      {
        title: 'Contoh 2: Data Berjumlah Genap (n = 6, Dua Nilai Tengah Dirata-ratakan):',
        badgeNote: 'n = 6 (Genap)',
        sampleData: 'Data Terurut: [ 2, 3, 4, 6, 7, 9 ]',
        visualNumbers: [
          { val: 2, subLabel: 'Data #1' },
          { val: 3, subLabel: 'Data #2' },
          { val: 4, isCenter: true, subLabel: '🎯 Tengah 1 (#3)' },
          { val: 6, isCenter: true, subLabel: '🎯 Tengah 2 (#4)' },
          { val: 7, subLabel: 'Data #5' },
          { val: 9, subLabel: 'Data #6' },
        ],
        bracketNote: {
          leftCount: 2,
          rightCount: 2,
          centerLabel: '2 data kiri ➔ Dua Nilai Tengah: (4 + 6) ÷ 2 = 5 ➔ 2 data kanan',
        },
        steps: [
          'Karena n = 6 (genap), posisi tengah berada di antara data ke-(6/2) = data ke-3 dan data ke-(6/2 + 1) = data ke-4.',
          'Data ke-3 adalah 4, dan data ke-4 adalah 6.',
          'Hitung rata-rata kedua nilai tengah: Me = (4 + 6) ÷ 2 = 10 ÷ 2 = 5.',
          'Sama persis seperti data game (n = 24 genap), kamu merata-ratakan data ke-12 dan ke-13!'
        ],
        resultHighlight: 'Median (Me) = 5 (Dua nilai tengah dirata-ratakan, membagi rata 3 data kiri & 3 data kanan)'
      }
    ],
    howToSteps: [
      'Amati 24 data terurut dengan nomor urut #1 sampai #24 di bagian atas.',
      'Karena jumlah data genap (n = 24), cari dua data di posisi tengah: data ke-12 dan data ke-13.',
      'Gunakan kalkulator di sebelah kanan untuk menghitung nilai tengahnya: (Nilai #12 + Nilai #13) ÷ 2.',
      'Pilih salah satu dari 4 pilihan jawaban yang sesuai.'
    ],
    proTip:
      'Median sangat tangguh terhadap nilai ekstrem (pencilan / outlier). Berapa pun besarnya angka di ujung kanan atau kiri, nilai Median tetap stabil di tengah!'
  },
  mean: {
    stepNum: 4,
    tag: 'Ukuran Pemusatan Data',
    title: 'Tahap 4: Menghitung Rata-Rata (Mean / Nilai Representatif)',
    icon: '🧮',
    badgeColor: '#059669',
    conceptHeading: 'Apa itu Mean (Rata-Rata Hitung)?',
    conceptText:
      'Mean (x̄ atau dibaca "x-bar") adalah nilai rata-rata hitung yang mewakili keseluruhan data. Nilai ini diperoleh dengan menjumlahkan seluruh nilai data kemudian membaginya secara merata dengan total banyaknya data.',
    formula: {
      title: 'Rumus Resmi Mean (Statistika SMP):',
      equation: 'x̄ = ∑x ÷ n = (Jumlah seluruh nilai data) ÷ (Banyaknya data)',
      explanation:
        '∑x (dibaca "sigma x") adalah hasil penjumlahan seluruh 24 data waktu layar. n adalah banyaknya data (24 siswa).'
    },
    examples: [
      {
        title: 'Contoh Menghitung Rata-Rata (Sampel 5 Siswa):',
        sampleData: 'Data Waktu Layar: [ 2, 3, 4, 5, 6 ] jam  (n = 5 siswa)',
        visualNumbers: [
          { val: '2h', subLabel: 'Siswa 1' },
          { val: '3h', subLabel: 'Siswa 2' },
          { val: '4h', subLabel: 'Siswa 3' },
          { val: '5h', subLabel: 'Siswa 4' },
          { val: '6h', subLabel: 'Siswa 5' },
        ],
        bracketNote: {
          centerLabel: 'Total ∑x = 2 + 3 + 4 + 5 + 6 = 20 jam  ÷  5 siswa  =  4 jam/siswa',
        },
        steps: [
          'Hitung total jumlah nilai (∑x): 2 + 3 + 4 + 5 + 6 = 20 jam',
          'Hitung banyaknya siswa: n = 5 siswa',
          'Bagikan secara merata: x̄ = 20 ÷ 5 = 4 jam'
        ],
        resultHighlight: 'Mean (Rata-rata Waktu Layar) = 4 jam per siswa'
      }
    ],
    howToSteps: [
      'Gunakan total jumlah nilai data (∑x) yang sudah disediakan atau hitung menggunakan kalkulator.',
      'Bagi nilai total ∑x tersebut dengan banyaknya data (n = 24): x̄ = ∑x ÷ 24.',
      'Kalkulator di sebelah kanan siap membantumu melakukan operasi pembagian ini.',
      'Pilih jawaban yang tepat dari pilihan yang tersedia.'
    ],
    proTip:
      'Mean sangat dipengaruhi oleh angka ekstrem! Jika ada siswa yang waktu layarnya sangat tinggi (misal 15 jam), rata-rata akan ikut tertarik naik. Fenomena inilah yang akan kita selidiki di level berikutnya!'
  }
}
