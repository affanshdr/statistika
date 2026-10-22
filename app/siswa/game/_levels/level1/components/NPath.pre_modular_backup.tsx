'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PlayerCharacter from '@/app/siswa/game/_components/PlayerCharacter'
import NPCCharacter from '@/app/siswa/game/_components/NPCCharacter'
import GamePreloader from '@/app/siswa/game/_components/GamePreloader'
import {
  LEVEL1_MAPS,
  WORLD_VW,
  WORLD_VH,
  RED_LINE_POINTS,
  PAK_SUTRISNO_POS,
  getRedLineY,
  checkHallwayWalkable,
  checkClassroomWalkable,
  checkFacilityWalkable,
  checkGateWalkable
} from '@/app/siswa/game/_levels/level1/config/level1MapConfig'
import Level1HUD from '@/app/siswa/game/_levels/level1/components/Level1HUD'
import QuizModal from '@/app/siswa/game/_levels/level1/components/modals/QuizModal'
import WaliKelasModal from '@/app/siswa/game/_levels/level1/components/modals/WaliKelasModal'
import OutlierSimulator from './OutlierSimulator'
import { gameAudio } from '@/lib/utils/gameAudio'
import { MotherCatModal, KittenRescueModal } from '@/app/siswa/game/_levels/level1/components/modals/CatQuestModal'

export const KITTEN_SPAWN_SPOTS = [
  { zone: 'Perpustakaan', x: 800, y: 535, label: 'Pojok Depan Rak Perpustakaan' },
  { zone: 'LabKomputer', x: 620, y: 460, label: 'Lorong Meja Lab Komputer' },
  { zone: 'facility_courtyard', x: 270, y: 460, label: 'Halaman Depan Fasilitas' },
  { zone: 'hallway', x: 880, y: 530, label: 'Halaman Depan Kelas VIII' },
] as const

export type CatQuestStage = 'untriggered' | 'cat_spawned' | 'quest_active' | 'kitten_rescued' | 'completed'

const VIEW_VW = 640
const VIEW_VH = 360
const SPEED = 1.0
const TOTAL_N = 24

import {
  CLASS_DOORS,
  CLASS_STUDENTS,
  getClassDoors,
  getClassStudents,
  DATA_CIRCLES,
  AMBIENT_PARTICLES,
  QuizDoor
} from '@/app/siswa/game/_levels/level1/data/level1Data'
import { getLevel1Data, generateRandomLevel1Data, screenTimeData } from '@/app/siswa/game/_data/level1'
import { useGameStore } from '@/lib/store/gameStore'

import { DoorId } from '@/app/siswa/game/_levels/level1/data/level1Data'

const DOORS: readonly QuizDoor[] = []

export interface FacilityDoor {
  id: 'LAB_KOMPUTER' | 'PERPUSTAKAAN'
  label: string
  subLabel: string
  characterName: string
  characterRole: string
  x: number
  y: number
  color: string
  icon: string
  roomId?: 'Perpustakaan' | 'LabKomputer'
  dialogue: {
    greeting: string
    body: string
    tip: string
  }
}

export const FACILITY_DOORS: readonly FacilityDoor[] = [
  {
    id: 'LAB_KOMPUTER',
    label: 'Lab Komputer',
    subLabel: 'Ruang TIK & Praktikum Digital',
    characterName: 'Pak Hendra',
    characterRole: 'Guru Informatika & Pembina OSIS',
    x: 620,
    y: 390,
    color: '#38BDF8',
    icon: '💻',
    roomId: 'LabKomputer',
    dialogue: {
      greeting: '"Halo Stevunt! Sedang mengumpulkan data screen time ya?"',
      body: 'Di era literasi digital sekarang, teknologi itu pisau bermata dua. Kalau dipakai belajar coding atau riset ilmiah, waktu layar tinggi sangat produktif. Tapi kalau sampai larut malam hanya untuk scrolling medsos tanpa henti, itu yang membahayakan kesehatan!',
      tip: '💡 Tips Literasi Digital: Tidak semua waktu layar bernilai sama — pisahkan antara "Active Creation" (belajar & berkreasi) dan "Passive Consumption" (scrolling tanpa tujuan).'
    }
  },
  {
    id: 'PERPUSTAKAAN',
    label: 'Perpustakaan',
    subLabel: 'Pusat Literasi & Ruang Baca',
    characterName: 'Bu Widya',
    characterRole: 'Pustakawati SMP',
    x: 985,
    y: 395,
    color: '#10B981',
    icon: '📚',
    roomId: 'Perpustakaan',
    dialogue: {
      greeting: '"Selamat datang di perpustakaan, Stevunt!"',
      body: 'Ibu dengar kamu sedang memverifikasi kebenaran berita viral memakai statistika? Bagus sekali! Literasi informasi itu kuncinya membaca data secara objektif. Jangan mudah terhasut judul bombastis sebelum memeriksa sampel datanya!',
      tip: '💡 Kunci Berpikir Kritis: Selalu tanyakan: "Berapa ukuran sampelnya (n)?" dan "Apakah ada nilai pencilan (outlier) yang membiaskan nilai rata-rata?"'
    }
  }
]

function FacilityModal({ facility, onClose }: { facility: FacilityDoor; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 650, background: 'rgba(20, 10, 5, 0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 16 }}
        transition={{ type: 'spring', damping: 24, stiffness: 350 }}
        style={{
          maxWidth: 520,
          width: '100%',
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          position: 'relative',
          background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
          border: '2.5px solid #F59E0B',
          borderRadius: 24,
          padding: '26px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
          boxSizing: 'border-box',
          color: '#FEF3C7',
        }}
      >
        {/* Decorative Viewfinder Brackets */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '3px 0 0 0' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 3px 0 0' }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '0 0 0 3px' }} />
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 0 3px 0' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1.5px solid rgba(245, 158, 11, 0.3)', paddingBottom: 14 }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: 16,
            background: '#3D2419',
            border: '2.5px solid #F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            flexShrink: 0
          }}>
            {facility.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: '#9A3412', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              📍 {facility.label.toUpperCase()} — {facility.subLabel}
            </div>
            <h3 style={{ margin: 0, fontSize: 18, color: '#FEF3C7', fontWeight: 900 }}>
              {facility.characterName} <span style={{ fontSize: 12.5, color: '#0369A1', fontWeight: 700 }}>({facility.characterRole})</span>
            </h3>
          </div>
        </div>

        {/* Dialogue Card */}
        <div style={{ background: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid #F59E0B', borderRadius: 16, padding: '16px 18px', boxShadow: 'inset 0 2px 5px rgba(140, 98, 57, 0.1), 0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#92400E', marginBottom: 8 }}>
            {facility.dialogue.greeting}
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: '#FEF3C7', lineHeight: 1.6, fontWeight: 600 }}>
            {facility.dialogue.body}
          </p>
        </div>

        {/* Tip Box */}
        <div style={{ background: '#ECFDF5', border: '1.5px dashed #059669', borderRadius: 14, padding: '12px 14px' }}>
          <div style={{ fontSize: 12, color: '#065F46', fontWeight: 800, lineHeight: 1.5 }}>
            {facility.dialogue.tip}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            className="game-btn game-btn-primary"
            style={{
              padding: '12px 22px',
              fontSize: 13.5,
              fontWeight: 900,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
              color: '#FFFFFF',
              boxShadow: '0 6px 20px rgba(14, 131, 136, 0.35)',
              cursor: 'pointer',
              border: '1.5px solid rgba(255, 255, 255, 0.4)'
            }}
            onClick={onClose}
          >
            Lanjut Eksplorasi →
          </button>
        </div>
      </motion.div>
    </div>
  )
}

interface SatpamTimeQuiz {
  templateIdx: number
  pakGreeting: string
  questionText: string
  options: string[]
  correctIndex: number
  explanation: string
}

const SATPAM_WRONG_TEASES = [
  'Walah le, masih ngantuk berat ya?! Masak hitungan jam segampang itu meleset. Coba cuci muka terus hitung soal baru ini!',
  'Eits, salah hitung kamu! Jangan-jangan semalam begadang main HP ya?! Ayo fokus, coba pecahkan teka-teki waktu yang baru ini!',
  'Aduh Stevunt, lari sih kencang tapi hitungannya selip! Tenang dulu napasnya, coba hitung ulang soal baru di bawah ini!',
  'Tetot! Kurang tepat le! Kalau ngitung jam aja salah, gimana mau ngumpulin data statistik buat Pak Sutrisno? Coba lagi yang ini!'
]

function generateSatpamTimeQuiz(prevTemplateIdx?: number): SatpamTimeQuiz {
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
    pakGreeting = `"Walah Stevunt, napasmu sampai ngos-ngosan begitu kayak habis lari maraton dari rumah!"`
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

function LibraryBookModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 650, background: 'rgba(20, 10, 5, 0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 16 }}
        transition={{ type: 'spring', damping: 24, stiffness: 350 }}
        style={{
          maxWidth: 560,
          width: '100%',
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          position: 'relative',
          background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
          border: '2.5px solid #F59E0B',
          borderRadius: 24,
          padding: '26px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
          boxSizing: 'border-box',
          color: '#FEF3C7',
        }}
      >
        {/* Decorative Viewfinder Brackets */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '3px 0 0 0' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 3px 0 0' }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '0 0 0 3px' }} />
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 0 3px 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1.5px solid rgba(245, 158, 11, 0.3)', paddingBottom: 14 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: '#3D2419', border: '2.5px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
            📖
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: '#9A3412', letterSpacing: '1px', textTransform: 'uppercase' }}>POJOK BACA STATISTIKA SMP</div>
            <h3 style={{ margin: 0, fontSize: 18, color: '#FEF3C7', fontWeight: 900 }}>Buku Pintar: Analisis Data &amp; Pencilan</h3>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5, color: '#FEF3C7', lineHeight: 1.55 }}>
          <div style={{ background: '#FFFDF7', border: '1.5px solid #059669', borderRadius: 14, padding: '12px 16px', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 900, color: '#065F46', marginBottom: 4 }}>1. Rata-Rata (Mean / x̄)</div>
            Jumlah semua nilai data dibagi banyak sampel (Σx ÷ n). Mean sangat <em>sensitif</em> terhadap nilai ekstrem (outlier).
          </div>
          <div style={{ background: '#FFFDF7', border: '1.5px solid #0284C7', borderRadius: 14, padding: '12px 16px', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 900, color: '#0369A1', marginBottom: 4 }}>2. Nilai Tengah (Median / Me)</div>
            Nilai yang tepat berada di posisi tengah data terurut. Median <em>resisten</em> (kebal) terhadap outlier.
          </div>
          <div style={{ background: '#FFFDF7', border: '1.5px solid #D97706', borderRadius: 14, padding: '12px 16px', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 900, color: '#92400E', marginBottom: 4 }}>3. Outlier (Nilai Pencilan) &amp; Rentang (R)</div>
            Data yang nilainya melonjak jauh dari mayoritas siswa (misal: 18 jam saat rata-rata teman hanya 3-6 jam). Rentang R = Nilai Maksimal − Nilai Minimal.
          </div>
        </div>

        <div style={{ background: '#ECFDF5', border: '1.5px dashed #059669', borderRadius: 14, padding: '12px 16px', fontSize: 12.5, color: '#065F46' }}>
          💡 <strong>Pesan Bu Widya:</strong> "Ketika membaca berita viral di internet, jangan hanya melihat angka rata-rata! Tanyakan apakah ada pencilan yang membiaskan klaim tersebut."
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            className="game-btn game-btn-primary"
            style={{
              padding: '11px 22px',
              fontSize: 13.5,
              fontWeight: 900,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
              color: '#FFFFFF',
              boxShadow: '0 6px 20px rgba(14, 131, 136, 0.35)',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              cursor: 'pointer'
            }}
            onClick={onClose}
          >
            Tutup Buku →
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function LabTerminalModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 650, background: 'rgba(20, 10, 5, 0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 16 }}
        transition={{ type: 'spring', damping: 24, stiffness: 350 }}
        style={{
          maxWidth: 560,
          width: '100%',
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          position: 'relative',
          background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
          border: '2.5px solid #F59E0B',
          borderRadius: 24,
          padding: '26px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
          boxSizing: 'border-box',
          color: '#FEF3C7',
        }}
      >
        {/* Decorative Viewfinder Brackets */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '3px 0 0 0' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 3px 0 0' }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '0 0 0 3px' }} />
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 0 3px 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1.5px solid rgba(245, 158, 11, 0.3)', paddingBottom: 14 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: '#3D2419', border: '2.5px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
            💻
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: '#9A3412', letterSpacing: '1px', textTransform: 'uppercase' }}>LAB TIK — PUSAT ANALISIS DIGITAL</div>
            <h3 style={{ margin: 0, fontSize: 18, color: '#FEF3C7', fontWeight: 900 }}>Terminal Literasi &amp; Verifikasi Data</h3>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5, color: '#FEF3C7', lineHeight: 1.55 }}>
          <div style={{ background: '#FFFDF7', border: '1.5px solid #0284C7', borderRadius: 14, padding: '12px 16px', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 900, color: '#0369A1', marginBottom: 4 }}>1. Active Creation vs Passive Consumption</div>
            Waktu layar (screen time) produktif mencakup belajar coding, riset, dan membuat konten edukatif. Konsumsi pasif adalah scrolling media sosial tanpa tujuan.
          </div>
          <div style={{ background: '#FFFDF7', border: '1.5px solid #D97706', borderRadius: 14, padding: '12px 16px', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 900, color: '#92400E', marginBottom: 4 }}>2. Algoritma Sensasionalisme Media Sosial</div>
            Postingan provokatif ("Semua Siswa Kecanduan!") sengaja dibuat viral untuk memancing amarah dan mengejar views (clickbait).
          </div>
          <div style={{ background: '#FFFDF7', border: '1.5px solid #059669', borderRadius: 14, padding: '12px 16px', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 900, color: '#065F46', marginBottom: 4 }}>3. Menyelidiki Fakta dengan Sampel Representatif</div>
            Sebuah klaim tidak dapat dibuktikan hanya dari satu atau dua siswa ekstrem. Perlu sampel acak yang cukup (seperti 24 siswa dari 4 kelas) untuk mendapatkan kesimpulan objektif.
          </div>
        </div>

        <div style={{ background: '#F0F9FF', border: '1.5px dashed #0284C7', borderRadius: 14, padding: '12px 16px', fontSize: 12.5, color: '#0369A1' }}>
          💡 <strong>Pesan Pak Hendra:</strong> "Gunakan teknologi sebagai instrumen pencari kebenaran, bukan sekadar mempercayai apa yang viral di beranda ponselmu!"
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            className="game-btn game-btn-primary"
            style={{
              padding: '11px 22px',
              fontSize: 13.5,
              fontWeight: 900,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
              color: '#FFFFFF',
              boxShadow: '0 6px 20px rgba(14, 131, 136, 0.35)',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              cursor: 'pointer'
            }}
            onClick={onClose}
          >
            Tutup Terminal →
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Joystick ─────────────────────────────────────────────────────────────────
function Joystick({ onDir }: { onDir: (x: number, y: number) => void }) {
  const outer = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const on = useRef(false)

  const compute = (cx: number, cy: number) => {
    const el = outer.current; if (!el) return
    const b = el.getBoundingClientRect()
    const R = b.width / 2
    const dx = cx - (b.left + R)
    const dy = cy - (b.top + R)
    const d = Math.sqrt(dx * dx + dy * dy)
    onDir(Math.max(-1, Math.min(1, d > 0 ? dx / Math.max(d, R) : 0)), Math.max(-1, Math.min(1, d > 0 ? dy / Math.max(d, R) : 0)))
    if (knob.current) knob.current.style.transform =
      `translate(calc(-50% + ${(dx / Math.max(d, 1)) * Math.min(d, R)}px),calc(-50% + ${(dy / Math.max(d, 1)) * Math.min(d, R)}px))`
  }

  const reset = () => { on.current = false; onDir(0, 0); if (knob.current) knob.current.style.transform = 'translate(-50%,-50%)' }

  return (
    <div
      style={{
        width: 'clamp(60px, 9vw, 84px)',
        height: 'clamp(60px, 9vw, 84px)',
        borderRadius: '50%',
        background: 'rgba(14, 131, 136, 0.22)',
        border: '2.5px solid rgba(0, 173, 181, 0.45)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4), 0 0 10px rgba(0, 173, 181, 0.2)',
        position: 'relative',
        touchAction: 'none',
        userSelect: 'none',
        backdropFilter: 'blur(4px)',
        transition: 'opacity 0.3s, transform 0.2s',
      }}
      ref={outer}
      onPointerDown={e => { on.current = true; outer.current?.setPointerCapture(e.pointerId); compute(e.clientX, e.clientY) }}
      onPointerMove={e => { if (on.current) compute(e.clientX, e.clientY) }}
      onPointerUp={reset} onPointerCancel={reset}>
      <div ref={knob} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '36%', height: '36%', borderRadius: '50%', background: 'linear-gradient(135deg,#00ADB5 0%,#818cf8 100%)', boxShadow: '0 0 12px #00ADB5', pointerEvents: 'none' }} />
    </div>
  )
}

/**
 * Generates an unbroken, single SVG path for a rounded comic speech bubble
 * with a seamless pointer tail connecting directly to the speaker's head.
 */
function getSpeechBubblePath(
  x: number,          // Left X
  y: number,          // Top Y
  w: number,          // Width
  h: number,          // Height
  r: number,          // Corner radius
  tailTipX: number,   // Speaker head X (tip of pointer)
  tailTipY: number,   // Speaker head Y (tip of pointer)
  tailWidth = 24      // Base width of tail on bubble edge
): string {
  const halfTail = tailWidth / 2
  const minBaseX = x + r + halfTail + 4
  const maxBaseX = x + w - r - halfTail - 4
  const baseX = Math.max(minBaseX, Math.min(maxBaseX, tailTipX))

  if (tailTipY >= y + h) {
    // Normal: Bubble is ABOVE the speaker, tail points DOWNWARD to head
    const tipY = Math.max(y + h + 8, tailTipY)
    return `M ${x + r} ${y} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} V ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${baseX + halfTail} L ${tailTipX} ${tipY} L ${baseX - halfTail} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`.replace(/\s+/g, ' ').trim()
  } else {
    // Inverted: Bubble is BELOW the speaker, tail points UPWARD to head
    const tipY = Math.min(y - 8, tailTipY)
    return `M ${x + r} ${y} H ${baseX - halfTail} L ${tailTipX} ${tipY} L ${baseX + halfTail} ${y} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} V ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`.replace(/\s+/g, ' ').trim()
  }
}

// Helper to generate choice pool for answers
function generateAnswerPool(correctAnswer: number): number[] {
  const pool = new Set<number>()
  pool.add(correctAnswer)

  // Distractors must be within range ±2 to ±3 from correctAnswer
  const candidates: number[] = []
  for (let offset = -3; offset <= 3; offset++) {
    if (offset === 0) continue
    if (Math.abs(offset) < 2) continue // Only allow ±2 and ±3
    const val = correctAnswer + offset
    if (val > 0) { // must be positive (greater than 0)
      candidates.push(val)
    }
  }

  // If we don't have enough candidates (e.g. correctAnswer is very small like 1 or 2), let's expand candidate range to ±1, +4, +5 but always positive.
  if (candidates.length < 3) {
    for (let offset = -3; offset <= 5; offset++) {
      if (offset === 0) continue
      const val = correctAnswer + offset
      if (val > 0 && val !== correctAnswer && !candidates.includes(val)) {
        candidates.push(val)
      }
    }
  }

  // Shuffle candidates and pick 3 distractors so that total pool size is 4
  const shuffledCandidates = [...candidates].sort(() => Math.random() - 0.5)
  const numDistractors = Math.min(3, shuffledCandidates.length)
  for (let i = 0; i < numDistractors; i++) {
    pool.add(shuffledCandidates[i])
  }

  // Fallback: if we still don't have 4 choices, add more positive numbers close by
  let offset = 4
  while (pool.size < 4) {
    const val = correctAnswer + offset
    if (val > 0 && !pool.has(val)) {
      pool.add(val)
    }
    const val2 = correctAnswer - offset
    if (val2 > 0 && !pool.has(val2)) {
      pool.add(val2)
    }
    offset++
  }

  // Convert to array and shuffle
  return Array.from(pool).sort(() => Math.random() - 0.5)
}

// Helper to get dynamic hint focusing on process
function getProcessHint(quizQ: string): string {
  const isWordProblem = /[a-zA-Z]{3,}/.test(quizQ) && quizQ.length > 15;

  if (isWordProblem) {
    return "Baca ulang soalnya pelan-pelan, angka mana yang perlu dihitung? 🤔";
  }

  const hasMult = quizQ.includes('×') || quizQ.includes('*');
  const hasAddSub = quizQ.includes('+') || quizQ.includes('-');
  if (hasMult && hasAddSub) {
    return "Selesaikan perkalian/pembagian terlebih dahulu, baru lakukan penjumlahan/pengurangan 🤔";
  }

  if (hasMult) {
    return "Ingat, a × b berarti a dijumlahkan sebanyak b kali 🤔";
  }
  if (quizQ.includes('-')) {
    return "Bayangkan kamu punya sejumlah sesuatu, lalu dikurangi 🤔";
  }
  if (quizQ.includes('+')) {
    return "Coba jumlahkan kedua angka satu per satu 🤔";
  }

  return "Coba hitung kembali dengan teliti ya 🤔";
}

interface VisualHintModalProps {
  door: QuizDoor
  onClose: () => void
}

function VisualHintModal({ door, onClose }: VisualHintModalProps) {
  const [hintStep, setHintStep] = useState<1 | 2 | 3>(1)

  const renderIllustration = () => {
    switch (door.id) {
      case 'A': // Room A door (3 × 3 = 9)
      case 'B': // Room B door (3 × 5 = 15)
        {
          const rows = door.id === 'A' ? 3 : 5
          const cols = 3
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              {Array.from({ length: rows }).map((_, rIdx) => (
                <div key={rIdx} style={{ display: 'flex', gap: 8 }}>
                  {Array.from({ length: cols }).map((_, cIdx) => {
                    const idx = rIdx * cols + cIdx + 1
                    return (
                      <div key={cIdx} style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: hintStep >= 2 ? 'rgba(0, 173, 181, 0.2)' : 'rgba(0, 173, 181, 0.05)',
                        border: '1.5px solid #00ADB5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#FFFFFF', fontWeight: 900, fontSize: 13,
                        boxShadow: hintStep >= 2 ? '0 0 8px rgba(0, 173, 181, 0.4)' : 'none',
                        transition: 'all 0.3s'
                      }}>
                        {hintStep >= 2 ? idx : ''}
                      </div>
                    )
                  })}
                </div>
              ))}
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8, textAlign: 'center', fontWeight: 600 }}>
                {hintStep === 1 ? `${rows} baris, masing-masing berisi ${cols} objek.` : 'Hitung jumlah seluruh objek satu per satu:'}
              </div>
            </div>
          )
        }

      case 'C': // Room C door (8 + 3 = 11)
        {
          const leftCount = 8
          const rightCount = 3
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                {/* Left Group */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 120, justifyContent: 'center' }}>
                  {Array.from({ length: leftCount }).map((_, i) => (
                    <div key={i} style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: hintStep >= 2 ? 'rgba(129, 140, 248, 0.25)' : 'rgba(129, 140, 248, 0.08)',
                      border: '1.5px solid #818cf8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFFFFF', fontWeight: 900, fontSize: 11,
                      boxShadow: hintStep >= 2 ? '0 0 6px rgba(129, 140, 248, 0.4)' : 'none',
                      transition: 'all 0.3s'
                    }}>
                      {hintStep >= 2 ? i + 1 : ''}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: door.color }}>+</div>
                {/* Right Group */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 120, justifyContent: 'center' }}>
                  {Array.from({ length: rightCount }).map((_, i) => (
                    <div key={i} style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: hintStep >= 2 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.08)',
                      border: '1.5px solid #10b981',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFFFFF', fontWeight: 900, fontSize: 11,
                      boxShadow: hintStep >= 2 ? '0 0 6px rgba(16, 185, 129, 0.4)' : 'none',
                      transition: 'all 0.3s'
                    }}>
                      {hintStep >= 2 ? leftCount + i + 1 : ''}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, textAlign: 'center', fontWeight: 600 }}>
                {hintStep === 1 ? `Gabungkan grup kiri (${leftCount} objek) dan grup kanan (${rightCount} objek).` : 'Hitung total gabungan objek:'}
              </div>
            </div>
          )
        }

      case 'A1': // VII-1: Rentang dari data [2, 4, 3, 8, 1] (Jwb: 7)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)', border: '1.5px solid #EF4444', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#EF4444', fontWeight: 800, marginBottom: 4 }}>TERKECIL</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF' }}>1</div>
              </div>
              <div style={{ fontSize: 20, color: '#94A3B8', fontWeight: 'bold' }}>sampai</div>
              <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid #10b981', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#10b981', fontWeight: 800, marginBottom: 4 }}>TERBESAR</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF' }}>8</div>
              </div>
            </div>
            {hintStep >= 2 && (
              <div style={{ fontSize: 16, fontWeight: 800, color: '#00ADB5', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10, width: '100%', textAlign: 'center' }}>
                Rentang = 8 − 1 = 7
              </div>
            )}
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Rentang dihitung dengan mencari selisih antara nilai terbesar (8) dan terkecil (1).' : 'Kurangkan nilai terbesar dengan nilai terkecil.'}
            </div>
          </div>
        )

      case 'A2': // VII-2: Tepi bawah dari kelas 4-6? (Jwb: 3.5)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 800, marginBottom: 4 }}>BATAS BAWAH</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF' }}>4</div>
              </div>
              <div style={{ fontSize: 20, color: '#00ADB5', fontWeight: 'bold' }}>− 0.5</div>
              {hintStep >= 2 && (
                <div style={{ padding: '10px 14px', background: 'rgba(0,173,181,0.1)', border: '1.5px solid #00ADB5', borderRadius: 12, textAlign: 'center', boxShadow: '0 0 10px rgba(0,173,181,0.3)' }}>
                  <div style={{ fontSize: 10, color: '#00ADB5', fontWeight: 800, marginBottom: 4 }}>TEPI BAWAH</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#00ADB5' }}>3.5</div>
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Tepi bawah diperoleh dengan mengurangkan batas bawah kelas dengan 0.5.' : 'Kurangkan batas bawah (4) dengan 0.5 untuk memperoleh tepi bawah: 4 − 0.5 = 3.5.'}
            </div>
          </div>
        )

      case 'A3': // VII-3: Rentang = 17, banyak kelas = 6. Panjang kelas dibulatkan ke atas? (Jwb: 3)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', width: '100%' }}>
            <div style={{ padding: '12px 16px', background: 'rgba(0,173,181,0.06)', border: '1px solid rgba(0,173,181,0.2)', borderRadius: 12, width: '90%', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 800, marginBottom: 6 }}>RUMUS PANJANG KELAS</div>
              <div style={{ fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'monospace' }}>
                Panjang Kelas = Rentang ÷ Banyak Kelas
              </div>
              {hintStep >= 2 && (
                <div style={{ fontSize: 15, fontWeight: 'bold', color: '#00ADB5', fontFamily: 'monospace', marginTop: 8, borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 8 }}>
                  17 ÷ 6 = 2.83... → Bulatkan ke atas = 3
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Bagi rentang data dengan banyak kelas sesuai rumus.' : 'Hasil pembagian adalah 2.83. Dibulatkan ke atas menjadi bilangan bulat terdekat yaitu 3.'}
            </div>
          </div>
        )

      case 'B1': // VIII-1: Tindakan paling etis atas berita belum terverifikasi (Jwb: Verifikasi dulu)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '90%' }}>
              <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, textAlign: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 'bold', color: '#E2E8F0' }}>Penerimaan Berita Baru 📰</span>
              </div>
              {hintStep >= 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ padding: '8px 10px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, fontSize: 11, color: '#EF4444' }}>
                    ❌ Langsung Share / Sebar ➡️ Potensi hoax & fitnah!
                  </div>
                  <div style={{ padding: '8px 10px', background: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid #10b981', borderRadius: 8, fontSize: 11, color: '#10B981', fontWeight: 'bold', boxShadow: '0 0 6px rgba(16, 185, 129, 0.2)' }}>
                    ✅ Verifikasi ➡️ Cek fakta agar aman & bermanfaat!
                  </div>
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Mendapat berita viral membutuhkan penyaringan yang ketat sebelum dibagikan.' : 'Prioritaskan tindakan yang memverifikasi kebenaran berita terlebih dahulu.'}
            </div>
          </div>
        )

      case 'B2': // VIII-2: Posting foto tanpa izin (Jwb: Kedua-duanya)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', width: '90%' }}>
              <div style={{ flex: 1, padding: 10, background: 'rgba(0,173,181,0.05)', border: '1px solid #00ADB5', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 18 }}>🔒</div>
                <div style={{ fontSize: 11, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 }}>Hak Privasi</div>
                <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>Kebebasan individu</div>
              </div>
              <div style={{ flex: 1, padding: 10, background: 'rgba(0,173,181,0.05)', border: '1px solid #00ADB5', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 18 }}>🎨</div>
                <div style={{ fontSize: 11, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 }}>Hak Cipta</div>
                <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>Kepemilikan karya</div>
              </div>
            </div>
            {hintStep >= 2 && (
              <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid #10b981', borderRadius: 8, width: '90%', textAlign: 'center', fontSize: 12, color: '#10B981', fontWeight: 'bold' }}>
                Kedua hak tersebut dilanggar sekaligus!
              </div>
            )}
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Mempublikasikan foto potret seseorang menyangkut ranah pribadi dan kepemilikan visual.' : 'Karena melanggar kebebasan pribadi dan kepemilikan karya, maka pilihan yang tepat adalah kedua-duanya.'}
            </div>
          </div>
        )

      case 'B3': // VIII-3: Konten memancing emosi negatif (Jwb: Clickbait)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', width: '100%' }}>
            <div style={{ padding: '12px 16px', background: 'rgba(217, 119, 6, 0.06)', border: '1px solid #d97706', borderRadius: 12, width: '90%', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#ffb060', fontWeight: 800, marginBottom: 4, letterSpacing: '1px' }}>DEFINISI KUNCI</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' }}>
                "Umpan klik" / Clickbait 🎣
              </div>
              {hintStep >= 2 && (
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6, borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 6 }}>
                  Konten provokatif sengaja didesain untuk memicu amarah/emosi instan pembaca agar mengeklik tautan tersebut.
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Istilah ini menggambarkan pancingan judul atau umpan visual yang memicu respons emosional.' : 'Pancingan semacam ini dikenal secara umum dengan sebutan Clickbait.'}
            </div>
          </div>
        )

      case 'C1': // IX-1: Ciri hoax yang paling umum (Jwb: Sumber tidak jelas)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%' }}>
            <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 10, width: '90%' }}>
              <div style={{ fontSize: 10, color: '#EF4444', fontWeight: 800, marginBottom: 4 }}>CHECKLIST HOAX:</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11.5, color: '#E2E8F0', display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left' }}>
                <li>Informasi bombastis & berlebihan</li>
                <li style={{ color: hintStep >= 2 ? '#EF4444' : '#E2E8F0', fontWeight: hintStep >= 2 ? 'bold' : 'normal' }}>
                  Tidak memiliki sumber rujukan yang jelas/kredibel
                </li>
                <li>Meminta informasi disebarkan secara instan</li>
              </ul>
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Ciri utama berita palsu yang paling mencolok terletak pada asal-usul kredibilitas beritanya.' : 'Ciri paling umum adalah sumber informasinya tidak jelas atau tidak dapat dipertanggungjawabkan.'}
            </div>
          </div>
        )

      case 'C2': // IX-2: Langkah pertama saat menemukan info mencurigakan (Jwb: Cek sumber asli)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '90%' }}>
              <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, textAlign: 'center' }}>
                <span style={{ fontSize: 12, color: '#E2E8F0', fontWeight: 'bold' }}>🔎 Menemukan Info Mencurigakan</span>
              </div>
              {hintStep >= 2 && (
                <div style={{ padding: '10px 12px', background: 'rgba(0,173,181,0.08)', border: '1.5px solid #00ADB5', borderRadius: 8, textAlign: 'center', fontSize: 12, color: '#00ADB5', fontWeight: 'bold' }}>
                  Langkah 1: Menelusuri & Cek Sumber Aslinya!
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Sebelum mempercayai atau membagikan, langkah pertama adalah melakukan penelusuran fakta.' : 'Tindakan awal yang benar adalah memverifikasi langsung ke sumber rujukan orisinalnya.'}
            </div>
          </div>
        )

      case 'C3': // IX-3: Platform verifikasi berita di Indonesia (Jwb: TurnBackHoax)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', width: '100%' }}>
            <div style={{ padding: '12px 16px', background: 'rgba(0,173,181,0.06)', border: '1px solid rgba(0,173,181,0.2)', borderRadius: 12, width: '90%', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#00ADB5', fontWeight: 800, marginBottom: 4 }}>DATABASE RUJUKAN CEK FAKTA</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'monospace' }}>
                🌐 Mafindo (TurnBackHoax)
              </div>
              {hintStep >= 2 && (
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 6 }}>
                  Situs independen cek fakta yang mengarsipkan berbagai klarifikasi hoaks secara resmi di Indonesia.
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Pilihlah portal cek fakta komunitas anti-fitnah resmi yang terdaftar di Indonesia.' : 'Platform cek fakta Indonesia yang terpopuler dan terakreditasi adalah TurnBackHoax.'}
            </div>
          </div>
        )

      default:
        return <div style={{ color: '#E2E8F0', fontSize: 13 }}>Ilustrasi bantuan tidak tersedia 🤔</div>
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 600,
        background: 'rgba(20, 10, 5, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 15 }}
        style={{
          maxWidth: 420,
          width: '100%',
          position: 'relative',
          background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
          border: '2.5px solid #F59E0B',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
          borderRadius: 24,
          padding: '26px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          color: '#FEF3C7'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative Viewfinder Brackets */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '3px 0 0 0' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 3px 0 0' }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '0 0 0 3px' }} />
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 0 3px 0' }} />

        <div>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#9A3412', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 4 }}>🧠 BANTUAN VISUAL STEP-BY-STEP</div>
          <h3 style={{ margin: 0, fontSize: 17, color: '#FEF3C7', fontWeight: 900 }}>Teka-teki: {door.label}</h3>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {[1, 2, 3].map(st => (
            <div key={st} style={{
              flex: 1, height: 6, borderRadius: 3,
              background: hintStep === st ? '#0284C7' : hintStep > st ? 'rgba(2, 132, 199, 0.4)' : '#CBD5E1',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        {/* Teks Soal Aktif */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid #F59E0B',
          borderRadius: 14,
          padding: '12px 14px',
          textAlign: 'center',
          boxShadow: 'inset 0 2px 5px rgba(140, 98, 57, 0.1), 0 2px 6px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#9A3412', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            SOAL AKTIF
          </div>
          <div style={{
            fontSize: door.quizQ.length > 30 ? '13.5px' : '16px',
            fontWeight: 900,
            color: '#FEF3C7',
            fontFamily: 'var(--font-data)',
            lineHeight: 1.4
          }}>
            {door.quizQ}
          </div>
        </div>

        {/* Illustration Canvas Area */}
        <div style={{
          minHeight: 180,
          background: '#FFFDF7',
          border: '1.5px solid #CBD5E1',
          borderRadius: 16,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.04)'
        }}>
          {hintStep === 3 ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🤔</div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#FEF3C7', lineHeight: 1.5 }}>
                Jadi totalnya berapa?<br />
                <span style={{ fontSize: 12.5, color: '#64748B', fontWeight: 600 }}>Tutup bantuan ini lalu seret jawaban yang tepat!</span>
              </p>
            </div>
          ) : (
            renderIllustration()
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 14px',
              fontSize: 13,
              fontWeight: 800,
              borderRadius: 12,
              background: '#F5E8C7',
              border: '1.5px solid #8C6239',
              color: '#FEF3C7',
              cursor: 'pointer'
            }}
          >
            Tutup
          </button>
          {hintStep < 3 && (
            <button
              onClick={() => setHintStep(curr => (curr + 1) as any)}
              style={{
                flex: 1.5,
                padding: '12px 14px',
                fontSize: 13.5,
                fontWeight: 900,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                color: '#FFFFFF',
                boxShadow: '0 6px 20px rgba(14, 131, 136, 0.35)',
                cursor: 'pointer'
              }}
            >
              Lanjut →
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Quiz popup ───────────────────────────────────────────────────────────────
function QuizPopup({ door, isFD, onCorrect, onClose }:
  { door: QuizDoor; isFD: boolean; onCorrect: () => void; onClose: () => void }) {
  const [shake, setShake] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [openVisualModal, setOpenVisualModal] = useState(false)
  const [choices, setChoices] = useState<(number | string)[]>([])
  const [placedChoice, setPlacedChoice] = useState<number | string | null>(null)
  const [resetKeys, setResetKeys] = useState<Record<string, number>>({})
  const [isCorrect, setIsCorrect] = useState(false)
  const [isWrong, setIsWrong] = useState(false)

  useEffect(() => {
    if (door.choices) {
      setChoices([...door.choices].sort(() => Math.random() - 0.5))
    } else {
      setChoices(generateAnswerPool(Number(door.quizA)))
    }
    setPlacedChoice(null)
    setIsCorrect(false)
    setIsWrong(false)
    setWrongCount(0)
    setOpenVisualModal(false)
  }, [door])

  // Automatically open the visual modal when the threshold is hit
  useEffect(() => {
    const needsVisual = isFD ? (wrongCount >= 2) : (wrongCount >= 3)
    if (needsVisual) {
      setOpenVisualModal(true)
    }
  }, [wrongCount, isFD])

  const handlePlaceAnswer = (val: number | string) => {
    if (val === door.quizA) {
      setPlacedChoice(val)
      setIsCorrect(true)
      setIsWrong(false)
    } else {
      setPlacedChoice(val)
      setIsWrong(true)
      setIsCorrect(false)
      setShake(k => k + 1)
      setWrongCount(prev => prev + 1)
      // Snap it back after a short red animation
      setTimeout(() => {
        setPlacedChoice(null)
        setIsWrong(false)
        setResetKeys(prev => ({ ...prev, [val]: (prev[val] ?? 0) + 1 }))
      }, 800)
    }
  }

  const submit = () => {
    if (isCorrect) {
      onCorrect()
    }
  }

  const showTextHint = isFD ? (wrongCount >= 1) : (wrongCount >= 2)
  const showVisualHint = isFD ? (wrongCount >= 2) : (wrongCount >= 3)

  const isTextQuestion = typeof door.quizA === 'string'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(20, 10, 5, 0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.88, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 18 }}
          transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          style={{
            maxWidth: 440,
            width: '100%',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
            position: 'relative',
            background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
            border: '2.5px solid #F59E0B',
            borderRadius: 24,
            padding: '26px 22px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            color: '#FEF3C7'
          }}
        >
          {/* Decorative Viewfinder Brackets */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '3px 0 0 0' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 3px 0 0' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '0 0 0 3px' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 0 3px 0' }} />

          <div>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '1.5px', color: '#9A3412', textTransform: 'uppercase', marginBottom: 6 }}>🔐 {door.label} — Jawab untuk membuka!</div>
            <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: '#451A03', lineHeight: 1.6 }}>Di dalam pintu ini tersimpan data screen time. Jawab soal berikut untuk membuka pintu:</p>
          </div>

          {(door.image || CLASS_STUDENTS[door.id]?.image) && (
            <div style={{
              width: '100%',
              height: 130,
              borderRadius: 16,
              overflow: 'hidden',
              position: 'relative',
              border: '2.5px solid #F59E0B',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            }}>
              <img
                src={door.image || CLASS_STUDENTS[door.id]?.image}
                alt={door.label}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 30%, rgba(54, 32, 20, 0.85) 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '8px 12px'
              }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
                  🏫 Ruangan {door.label}
                </span>
              </div>
            </div>
          )}
          <div style={{ background: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid #F59E0B', borderRadius: 16, padding: '16px 14px', textAlign: 'center', boxShadow: 'inset 0 2px 5px rgba(140, 98, 57, 0.1), 0 2px 6px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: door.quizQ.length > 20 ? (door.quizQ.length > 50 ? 14 : 16) : 22, fontWeight: 900, color: '#FEF3C7', fontFamily: 'var(--font-data)', lineHeight: 1.4 }}>{door.quizQ}</div>

            {/* FD Context Hint */}
            {isFD && door.fdContext && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#92400E', fontWeight: 600, lineHeight: 1.5, background: '#FEF3C7', border: '1px dashed #D97706', borderRadius: '8px', padding: '6px 8px' }}>
                {door.fdContext}
              </div>
            )}
          </div>

          {/* Target Answer Slot */}
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#9A3412', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Drop Jawaban di Sini
            </div>
            <div
              data-answer-slot="true"
              style={{
                width: isTextQuestion ? '85%' : 72,
                height: isTextQuestion ? 46 : 72,
                borderRadius: isTextQuestion ? 12 : 16,
                border: isCorrect
                  ? '2px solid #059669'
                  : isWrong
                    ? '2px dashed #DC2626'
                    : '2px dashed #8C6239',
                background: isCorrect
                  ? '#ECFDF5'
                  : isWrong
                    ? '#FEE2E2'
                    : '#FFFDF7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                boxShadow: isCorrect ? '0 0 15px rgba(5, 150, 105, 0.25)' : 'none',
                transition: 'all 0.25s ease',
              }}
            >
              {placedChoice !== null ? (
                <div
                  style={{
                    width: isTextQuestion ? '90%' : 48,
                    height: isTextQuestion ? 32 : 48,
                    borderRadius: isTextQuestion ? 8 : '50%',
                    background: isCorrect
                      ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                      : 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                    border: '1.5px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: isTextQuestion ? '12px' : (placedChoice.toString().length > 2 ? '14px' : '18px'),
                    fontFamily: isTextQuestion ? 'var(--font-ui)' : 'var(--font-data)',
                    padding: isTextQuestion ? '0 8px' : '0',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {placedChoice}
                </div>
              ) : (
                <span style={{ fontSize: 24, opacity: 0.35, color: '#8C6239', fontFamily: 'monospace' }}>?</span>
              )}
            </div>
          </div>

          {/* Choices Pool */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '10px 0', flexWrap: 'wrap', minHeight: '60px', alignItems: 'center' }}>
            {choices.map((val) => {
              const isPlaced = placedChoice === val && isCorrect
              if (isPlaced) {
                return (
                  <div
                    key={`placeholder-${val}`}
                    style={{
                      width: isTextQuestion ? undefined : 48,
                      height: isTextQuestion ? 34 : 48,
                      padding: isTextQuestion ? '8px 14px' : undefined,
                      minWidth: isTextQuestion ? 80 : undefined,
                      borderRadius: isTextQuestion ? 10 : '50%',
                      background: 'rgba(140, 98, 57, 0.08)',
                      border: '1.5px dashed rgba(140, 98, 57, 0.3)',
                    }}
                  />
                )
              }

              const key = `${val}-${resetKeys[val] ?? 0}`
              return (
                <motion.div
                  key={key}
                  id={`choice-${val}`}
                  drag
                  dragMomentum={false}
                  dragElastic={0.08}
                  onDragStart={() => {
                    setIsWrong(false)
                  }}
                  onDragEnd={(event) => {
                    let clientX: number, clientY: number
                    if ('changedTouches' in event && event.changedTouches.length > 0) {
                      clientX = event.changedTouches[0].clientX
                      clientY = event.changedTouches[0].clientY
                    } else {
                      clientX = (event as MouseEvent | PointerEvent).clientX
                      clientY = (event as MouseEvent | PointerEvent).clientY
                    }

                    const dragEl = document.getElementById(`choice-${val}`)
                    const savedPE = dragEl?.style.pointerEvents ?? ''
                    if (dragEl) dragEl.style.pointerEvents = 'none'
                    const elem = document.elementFromPoint(clientX, clientY)
                    if (dragEl) dragEl.style.pointerEvents = savedPE

                    let placed = false
                    if (elem) {
                      const slotEl = elem.closest('[data-answer-slot]')
                      if (slotEl) {
                        placed = true
                        handlePlaceAnswer(val)
                      }
                    }

                    if (!placed) {
                      setResetKeys(prev => ({ ...prev, [val]: (prev[val] ?? 0) + 1 }))
                    }
                  }}
                  whileHover={{ scale: 1.08 }}
                  whileDrag={{ scale: 1.15, zIndex: 9999, cursor: 'grabbing', boxShadow: '0 8px 24px rgba(14, 131, 136, 0.45)' }}
                  style={{
                    width: isTextQuestion ? undefined : 48,
                    height: isTextQuestion ? 34 : 48,
                    borderRadius: isTextQuestion ? 10 : '50%',
                    background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: isTextQuestion ? '12px' : (val.toString().length > 2 ? '14px' : '18px'),
                    fontFamily: isTextQuestion ? 'var(--font-ui)' : 'var(--font-data)',
                    padding: isTextQuestion ? '8px 14px' : '0',
                    cursor: 'grab',
                    userSelect: 'none',
                    touchAction: 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {val}
                </motion.div>
              )
            })}
          </div>

          <motion.div key={shake} animate={shake > 0 ? { x: [-8, 8, -5, 5, 0] } : {}} transition={{ duration: 0.35 }}>
            <AnimatePresence>
              {showTextHint && <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: '12px 16px', borderRadius: 12, background: '#FEF3C7', border: '1.5px solid #D97706', fontSize: 14, fontWeight: 700, color: '#92400E', lineHeight: 1.6 }}>
                💡 {door.hint}
              </motion.div>}
            </AnimatePresence>
          </motion.div>

          {/* Bantuan Visual Button */}
          {showVisualHint && (
            <button
              style={{
                fontSize: '11.5px',
                fontWeight: 800,
                padding: '8px 14px',
                alignSelf: 'center',
                color: '#0284C7',
                border: '1.5px solid #0284C7',
                background: 'rgba(2, 132, 199, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                margin: '4px auto 0 auto',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={() => setOpenVisualModal(true)}
            >
              💡 Buka Bantuan Visual Step-by-Step
            </button>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: 800,
                padding: '12px 14px',
                background: '#F5E8C7',
                border: '1.5px solid #8C6239',
                color: '#FEF3C7',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              Kembali
            </button>
            <button
              style={{
                flex: 2,
                fontSize: 14.5,
                fontWeight: 900,
                padding: '12px 14px',
                borderRadius: '12px',
                border: isCorrect ? '1.5px solid rgba(255, 255, 255, 0.4)' : '1.5px solid #CBD5E1',
                background: isCorrect ? 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)' : '#E2E8F0',
                color: isCorrect ? '#FFFFFF' : '#94A3B8',
                boxShadow: isCorrect ? '0 6px 20px rgba(14, 131, 136, 0.35)' : 'none',
                opacity: isCorrect ? 1 : 0.65,
                cursor: isCorrect ? 'pointer' : 'not-allowed'
              }}
              onClick={submit}
              disabled={!isCorrect}
            >
              Buka Pintu →
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {openVisualModal && (
          <VisualHintModal
            door={door}
            onClose={() => setOpenVisualModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Counter overlay ──────────────────────────────────────────────────────────
function CounterResult({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)
  const [btn, setBtn] = useState(false)

  useEffect(() => {
    let c = 0
    const id = setInterval(() => {
      c++
      setCount(c)
      if (c >= TOTAL_N) {
        clearInterval(id)
        setTimeout(() => setDone(true), 300)
        setTimeout(() => setBtn(true), 1100)
      }
    }, 45)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(20, 10, 5, 0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{
            maxWidth: 460,
            width: '100%',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
            position: 'relative',
            background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
            border: '2.5px solid #F59E0B',
            borderRadius: 26,
            padding: '26px 22px',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            color: '#FEF3C7'
          }}
        >
          {/* Decorative Viewfinder Brackets */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '3px 0 0 0' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 3px 0 0' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '0 0 0 3px' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 0 3px 0' }} />

          <div>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '2px', color: '#9A3412', textTransform: 'uppercase', marginBottom: 6 }}>⚙️ MESIN PENGHITUNG DATA</div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#FEF3C7' }}>Mengagregasikan total sampel...</h3>
          </div>
          <div style={{ background: '#3D2419', border: '2.5px solid #F59E0B', borderRadius: 20, padding: '24px 20px', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 12, color: '#9A3412', fontWeight: 900, marginBottom: 8, letterSpacing: '1px', textTransform: 'uppercase' }}>JUMLAH SAMPEL (n)</div>
            <motion.div style={{ fontSize: 84, fontWeight: 900, color: '#0284C7', fontFamily: 'var(--font-data)', lineHeight: 1 }}
              animate={done ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.6 }}>{count}</motion.div>
          </div>
          <AnimatePresence>{done && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '16px 20px', borderRadius: 16, background: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid #F59E0B', fontSize: 14.5, fontWeight: 600, color: '#FEF3C7', lineHeight: 1.7, textAlign: 'left', boxShadow: 'inset 0 2px 5px rgba(140, 98, 57, 0.1)' }}>
                Kamu telah mengumpulkan seluruh data dari 4 kelas (VII-A, VII-B, VIII-A, VIII-B).<br />
                Ukuran sampel yang terkumpul adalah <strong style={{ color: '#0369A1', fontSize: 18, fontWeight: 900 }}>n = {TOTAL_N}</strong>.
              </div>
              {btn && (
                <button
                  className="game-btn game-btn-primary"
                  style={{
                    width: '100%',
                    fontSize: 15,
                    fontWeight: 900,
                    padding: '14px 20px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                    boxShadow: '0 6px 20px rgba(14, 131, 136, 0.35)',
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                    color: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                  onClick={onDone}
                >
                  Lanjut ke Perhitungan Rentang (R) →
                </button>
              )}
            </motion.div>
          )}</AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Pak Sutrisno Sanction Modal ───────────────────────────────────────────────
function PakSanctionModal({ onAccept }: { onAccept: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 650, background: 'rgba(20, 10, 5, 0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{
          maxWidth: 460,
          width: '100%',
          position: 'relative',
          background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
          border: '2.5px solid #F59E0B',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
          borderRadius: 24,
          padding: '26px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          color: '#FEF3C7'
        }}
      >
        {/* Decorative Viewfinder Brackets */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '3px 0 0 0' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 3px 0 0' }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '0 0 0 3px' }} />
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 0 3px 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1.5px solid rgba(245, 158, 11, 0.3)', paddingBottom: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#3D2419', border: '2.5px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url("/Assets/Character/pak Sutrisno-iso_idle_right-trimmed.png")`,
              backgroundSize: '450% 380%',
              backgroundPosition: '10% 5%',
              backgroundRepeat: 'no-repeat',
              transform: 'scaleX(-1) scale(1.35)',
              imageRendering: 'pixelated'
            }} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: '#9A3412', letterSpacing: '1.5px', textTransform: 'uppercase' }}>👨‍🏫 GURU KEDISIPLINAN SEKOLAH</div>
            <h3 style={{ margin: 0, fontSize: 18, color: '#FEF3C7', fontWeight: 900 }}>Pak Sutrisno</h3>
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid #F59E0B', borderRadius: 16, padding: '16px 18px', boxShadow: 'inset 0 2px 5px rgba(140, 98, 57, 0.1), 0 2px 6px rgba(0,0,0,0.04)' }}>
          <p style={{ margin: 0, fontSize: 13.5, color: '#FEF3C7', fontWeight: 600, lineHeight: 1.65 }}>
            "Kamu terlambat lagi! Bel sekolah sudah lama berbunyi dan kamu baru saja melangkah di halaman ini.<br /><br />
            Sebagai sanksi kedisiplinan, kamu <strong style={{ color: '#DC2626' }}>TIDAK BOLEH masuk kelas</strong> sebelum menyelesaikan tugas ini:<br />
            <strong style={{ color: '#0369A1' }}>Kelilingi lorong sekolah dan kumpulkan 24 sampel data screen time dari 4 kelas (VII-A, VII-B, VIII-A, VIII-B)!</strong>"
          </p>
        </div>

        <button
          className="game-btn game-btn-primary"
          style={{
            padding: '14px 20px',
            fontSize: 14,
            fontWeight: 900,
            width: '100%',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
            boxShadow: '0 6px 20px rgba(14, 131, 136, 0.35)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            color: '#FFFFFF',
            cursor: 'pointer'
          }}
          onClick={onAccept}
        >
          SAYA SIAP TERIMA SANKSI & INVESTIGASI DATA →
        </button>
      </motion.div>
    </div>
  )
}

// ─── Desk Calculator Component for Pak Sutrisno's Board ───────────
function DeskCalculator({ dataset }: { dataset: number[] }) {
  const [display, setDisplay] = useState<string>('0')
  const [formula, setFormula] = useState<string>('')
  const [isResult, setIsResult] = useState<boolean>(false)

  const handleDigit = (d: string) => {
    gameAudio.playClick()
    if (isResult) {
      setDisplay(d === '.' ? '0.' : d)
      setFormula('')
      setIsResult(false)
      return
    }
    if (d === '.') {
      if (display.includes('.')) return
      setDisplay(prev => prev + '.')
      return
    }
    if (display === '0') {
      setDisplay(d)
    } else {
      if (display.length >= 12) return
      setDisplay(prev => prev + d)
    }
  }

  const handleOp = (opSymbol: string) => {
    gameAudio.playClick()
    const currentVal = display
    if (isResult) {
      setFormula(`${currentVal} ${opSymbol}`)
      setDisplay('0')
      setIsResult(false)
      return
    }
    if (formula && (display === '0' || display === '')) {
      // Replace trailing operator if user changed their mind
      setFormula(prev => prev.replace(/[+\-×÷]$/, opSymbol))
      return
    }
    setFormula(prev => (prev ? `${prev} ${currentVal} ${opSymbol}` : `${currentVal} ${opSymbol}`))
    setDisplay('0')
  }

  const handleEqual = () => {
    gameAudio.playClick()
    if (!formula && !isResult) return
    const fullExpr = formula ? `${formula} ${display}` : display
    try {
      const sanitized = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/[^0-9+\-*/.]/g, '')
      if (!sanitized) return
      // Safe arithmetic evaluation
      const res = new Function(`'use strict'; return (${sanitized})`)()
      if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
        const formatted = Number(res.toFixed(4)).toString()
        setFormula(`${fullExpr} =`)
        setDisplay(formatted)
        setIsResult(true)
      } else {
        setDisplay('Error')
        setIsResult(true)
      }
    } catch {
      setDisplay('Error')
      setIsResult(true)
    }
  }

  const handleClear = () => {
    gameAudio.playClick()
    setDisplay('0')
    setFormula('')
    setIsResult(false)
  }

  const handleBackspace = () => {
    gameAudio.playClick()
    if (isResult) {
      setDisplay('0')
      setFormula('')
      setIsResult(false)
      return
    }
    if (display.length > 1) {
      setDisplay(prev => prev.slice(0, -1))
    } else {
      setDisplay('0')
    }
  }

  return (
    <div
      data-testid="desk-calculator"
      style={{
        background: 'linear-gradient(180deg, #2A323D 0%, #1A2027 100%)',
        border: 'clamp(2px, 0.4vw, 3px) solid #475569',
        borderRadius: 'clamp(10px, 1.5vw, 16px)',
        padding: 'clamp(6px, 1.2vh, 12px) clamp(6px, 1vw, 12px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(4px, 0.8vh, 8px)',
        color: '#F8FAFC',
        width: '100%',
        boxSizing: 'border-box',
        maxHeight: '100%',
      }}
    >
      {/* Header bar: Model & Solar cell */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(3px, 0.5vw, 6px)' }}>
          <span style={{ fontSize: 'clamp(10px, 1.2vw, 13px)' }}>🧮</span>
          <span style={{ fontSize: 'clamp(8px, 1vw, 10px)', fontWeight: 900, letterSpacing: '0.8px', color: '#94A3B8' }}>
            STAT-CALC 3000
          </span>
        </div>
        {/* Fake Solar Cell Strip */}
        <div style={{
          width: 'clamp(36px, 4.5vw, 54px)',
          height: 'clamp(9px, 1.3vh, 13px)',
          background: 'linear-gradient(90deg, #382416 0%, #4D321F 50%, #382416 100%)',
          border: '1px solid #1E293B',
          borderRadius: '3px',
          display: 'flex',
          gap: '2px',
          padding: '1px 2px',
          boxSizing: 'border-box',
        }}>
          <div style={{ flex: 1, background: '#2B1A0E', borderRadius: '1px' }} />
          <div style={{ flex: 1, background: '#2B1A0E', borderRadius: '1px' }} />
          <div style={{ flex: 1, background: '#2B1A0E', borderRadius: '1px' }} />
        </div>
      </div>

      {/* LCD Screen Display */}
      <div style={{
        background: '#B8CDB8',
        border: 'clamp(1.5px, 0.3vw, 2.5px) solid #5A6D5A',
        borderRadius: 'clamp(6px, 1vw, 10px)',
        padding: 'clamp(3px, 0.6vh, 8px) clamp(6px, 1vw, 12px)',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 'clamp(38px, 7vh, 68px)',
        boxSizing: 'border-box',
      }}>
        {/* Formula / Expression top line */}
        <div style={{
          fontSize: 'clamp(8.5px, 1.1vw, 11px)',
          fontWeight: 700,
          color: '#3B4E3B',
          fontFamily: 'monospace',
          textAlign: 'right',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minHeight: 'clamp(9px, 1.4vh, 14px)',
          lineHeight: 1.1,
        }}>
          {formula || '\u00A0'}
        </div>
        {/* Main large result line */}
        <div
          data-testid="calc-display-main"
          style={{
            fontSize: 'clamp(15px, 2.5vw, 24px)',
            fontWeight: 900,
            color: '#152415',
            fontFamily: 'monospace',
            textAlign: 'right',
            letterSpacing: '0.8px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.1,
          }}
        >
          {display}
        </div>
      </div>

      {/* Calculator Keypad Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'clamp(3px, 0.5vw, 6px)',
      }}>
        {/* Row 1 */}
        <button
          onClick={handleClear}
          data-testid="calc-btn-clear"
          style={{
            padding: 'clamp(4px, 0.8vh, 10px) 2px',
            borderRadius: 'clamp(5px, 0.8vw, 8px)',
            border: '1px solid #991B1B',
            background: 'linear-gradient(180deg, #EF4444 0%, #DC2626 100%)',
            color: '#FFFFFF',
            fontSize: 'clamp(10.5px, 1.3vw, 14px)',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          C
        </button>
        <button
          onClick={handleBackspace}
          data-testid="calc-btn-backspace"
          style={{
            padding: 'clamp(4px, 0.8vh, 10px) 2px',
            borderRadius: 'clamp(5px, 0.8vw, 8px)',
            border: '1px solid #78350F',
            background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
            color: '#FFFFFF',
            fontSize: 'clamp(10.5px, 1.3vw, 14px)',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          ⌫
        </button>
        <button
          onClick={() => handleOp('÷')}
          data-testid="calc-btn-div"
          style={{
            padding: 'clamp(4px, 0.8vh, 10px) 2px',
            borderRadius: 'clamp(5px, 0.8vw, 8px)',
            border: '1px solid #1D4ED8',
            background: 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)',
            color: '#FFFFFF',
            fontSize: 'clamp(12px, 1.5vw, 16px)',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          ÷
        </button>
        <button
          onClick={() => handleOp('×')}
          data-testid="calc-btn-mul"
          style={{
            padding: 'clamp(4px, 0.8vh, 10px) 2px',
            borderRadius: 'clamp(5px, 0.8vw, 8px)',
            border: '1px solid #1D4ED8',
            background: 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)',
            color: '#FFFFFF',
            fontSize: 'clamp(12px, 1.5vw, 16px)',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          ×
        </button>

        {/* Row 2: 7, 8, 9, - */}
        {['7', '8', '9'].map(n => (
          <button
            key={n}
            onClick={() => handleDigit(n)}
            data-testid={`calc-btn-${n}`}
            style={{
              padding: 'clamp(4px, 0.8vh, 10px) 2px',
              borderRadius: 'clamp(5px, 0.8vw, 8px)',
              border: '1px solid #475569',
              background: 'linear-gradient(180deg, #334155 0%, #1E293B 100%)',
              color: '#F8FAFC',
              fontSize: 'clamp(11px, 1.4vw, 15px)',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleOp('-')}
          data-testid="calc-btn-sub"
          style={{
            padding: 'clamp(4px, 0.8vh, 10px) 2px',
            borderRadius: 'clamp(5px, 0.8vw, 8px)',
            border: '1px solid #1D4ED8',
            background: 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)',
            color: '#FFFFFF',
            fontSize: 'clamp(12px, 1.5vw, 16px)',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          −
        </button>

        {/* Row 3: 4, 5, 6, + */}
        {['4', '5', '6'].map(n => (
          <button
            key={n}
            onClick={() => handleDigit(n)}
            data-testid={`calc-btn-${n}`}
            style={{
              padding: 'clamp(4px, 0.8vh, 10px) 2px',
              borderRadius: 'clamp(5px, 0.8vw, 8px)',
              border: '1px solid #475569',
              background: 'linear-gradient(180deg, #334155 0%, #1E293B 100%)',
              color: '#F8FAFC',
              fontSize: 'clamp(11px, 1.4vw, 15px)',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleOp('+')}
          data-testid="calc-btn-add"
          style={{
            padding: 'clamp(4px, 0.8vh, 10px) 2px',
            borderRadius: 'clamp(5px, 0.8vw, 8px)',
            border: '1px solid #1D4ED8',
            background: 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)',
            color: '#FFFFFF',
            fontSize: 'clamp(12px, 1.5vw, 16px)',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          +
        </button>

        {/* Row 4: 1, 2, 3, = (Equal spans 2 rows) */}
        {['1', '2', '3'].map(n => (
          <button
            key={n}
            onClick={() => handleDigit(n)}
            data-testid={`calc-btn-${n}`}
            style={{
              padding: 'clamp(4px, 0.8vh, 10px) 2px',
              borderRadius: 'clamp(5px, 0.8vw, 8px)',
              border: '1px solid #475569',
              background: 'linear-gradient(180deg, #334155 0%, #1E293B 100%)',
              color: '#F8FAFC',
              fontSize: 'clamp(11px, 1.4vw, 15px)',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {n}
          </button>
        ))}
        <button
          onClick={handleEqual}
          data-testid="calc-btn-equal"
          style={{
            gridRow: 'span 2',
            borderRadius: 'clamp(5px, 0.8vw, 8px)',
            border: '1.5px solid #047857',
            background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            fontSize: 'clamp(14px, 1.8vw, 20px)',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.45)',
          }}
        >
          =
        </button>

        {/* Row 5: 0 (span 2 cols), . */}
        <button
          onClick={() => handleDigit('0')}
          data-testid="calc-btn-0"
          style={{
            gridColumn: 'span 2',
            padding: 'clamp(4px, 0.8vh, 10px) 2px',
            borderRadius: 'clamp(5px, 0.8vw, 8px)',
            border: '1px solid #475569',
            background: 'linear-gradient(180deg, #334155 0%, #1E293B 100%)',
            color: '#F8FAFC',
            fontSize: 'clamp(11px, 1.4vw, 15px)',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          0
        </button>
        <button
          onClick={() => handleDigit('.')}
          data-testid="calc-btn-dot"
          style={{
            padding: 'clamp(4px, 0.8vh, 10px) 2px',
            borderRadius: 'clamp(5px, 0.8vw, 8px)',
            border: '1px solid #475569',
            background: 'linear-gradient(180deg, #334155 0%, #1E293B 100%)',
            color: '#F8FAFC',
            fontSize: 'clamp(12px, 1.6vw, 18px)',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          .
        </button>
      </div>

      <div style={{
        fontSize: 'clamp(7.5px, 0.9vw, 9.5px)',
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 1.25,
        marginTop: '1px',
      }}>
        💡 Gunakan kalkulator untuk menjumlahkan data atau menghitung rata-rata (Total ÷ 24).
      </div>
    </div>
  )
}

interface SortToken {
  id: string
  val: number
}

// ─── Grid Adaptif: pilih susunan kolom (12×2 / 8×3 / 6×4) yang menghasilkan bulatan terbesar ───
// Ukuran bulatan dihitung dari lebar DAN tinggi panel sebenarnya, sehingga panel selalu terisi penuh.
function useFitGrid(count: number, maxSize = 88) {
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


interface TutorialExampleItem {
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

interface StageTutorialContent {
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

const STAGE_TUTORIALS: Record<'sort' | 'modus' | 'median' | 'mean', StageTutorialContent> = {
  sort: {
    stepNum: 1,
    tag: 'Fondasi Statistika',
    title: 'Tahap 1: Mengurutkan Data (Data Terurut)',
    icon: '🔢',
    badgeColor: '#059669',
    conceptHeading: 'Mengapa Data Harus Diurutkan Terlebih Dahulu?',
    conceptText:
      'Dalam statistika, mengurutkan data dari nilai terkecil ke terbesar (ascending order) adalah langkah awal paling mendasar. Dengan data terurut, pola sebaran langsung terbaca, angka kembar berkumpul, serta kita bisa menemukan nilai tengah (median) dan nilai terbanyak (modus) secara cepat dan akurat.',
    formula: {
      title: 'Prinsip Mengurutkan Data:',
      equation: 'Nilai Terkecil  →  ...  →  Nilai Terbesar',
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
          'Cari nilai paling kecil: angka 2 (ada 2 buah) → letakkan di awal: 2, 2',
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
    icon: '📊',
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
          { val: 4, isMode: true, subLabel: 'f = 3 ⭐' },
          { val: 4, isMode: true, subLabel: 'Modus' },
          { val: 4, isMode: true, subLabel: 'Terbanyak' },
          { val: 7, subLabel: 'f = 1' },
        ],
        steps: [
          'Nilai 3 muncul 1 kali (f = 1)',
          'Nilai 4 muncul 3 kali (f = 3) ⭐ frekuensi kemunculan terbanyak!',
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
          { val: 5, isMode: true, subLabel: 'f = 3 ⭐' },
          { val: 5, isMode: true, subLabel: 'Modus' },
          { val: 5, isMode: true, subLabel: 'Terbanyak' },
          { val: 8, subLabel: 'f = 1' },
        ],
        steps: [
          'Nilai 2 muncul 1 kali, nilai 3 muncul 1 kali',
          'Nilai 5 muncul 3 kali (f = 3) ⭐ frekuensi kemunculan terbanyak!',
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
          { val: 5, isCenter: true, subLabel: '👉 NILAI TENGAH' },
          { val: 7, subLabel: 'Data #4' },
          { val: 8, subLabel: 'Data #5' },
        ],
        bracketNote: {
          leftCount: 2,
          rightCount: 2,
          centerLabel: '2 data di kiri ↔ [ Nilai Tengah: 5 ] ↔ 2 data di kanan',
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
          { val: 4, isCenter: true, subLabel: '👉 Tengah 1 (#3)' },
          { val: 6, isCenter: true, subLabel: '👉 Tengah 2 (#4)' },
          { val: 7, subLabel: 'Data #5' },
          { val: 9, subLabel: 'Data #6' },
        ],
        bracketNote: {
          leftCount: 2,
          rightCount: 2,
          centerLabel: '2 data kiri ↔ Dua Nilai Tengah: (4 + 6) ÷ 2 = 5 ↔ 2 data kanan',
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
      equation: 'x̄ = Σx ÷ n = (Jumlah seluruh nilai data) ÷ (Banyaknya data)',
      explanation:
        'Σx (dibaca "sigma x") adalah hasil penjumlahan seluruh 24 data waktu layar. n adalah banyaknya data (24 siswa).'
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
          centerLabel: 'Total Σx = 2 + 3 + 4 + 5 + 6 = 20 jam  ÷  5 siswa  =  4 jam/siswa',
        },
        steps: [
          'Hitung total jumlah nilai (Σx): 2 + 3 + 4 + 5 + 6 = 20 jam',
          'Hitung banyaknya siswa: n = 5 siswa',
          'Bagikan secara merata: x̄ = 20 ÷ 5 = 4 jam'
        ],
        resultHighlight: 'Mean (Rata-rata Waktu Layar) = 4 jam per siswa'
      }
    ],
    howToSteps: [
      'Gunakan total jumlah nilai data (Σx) yang sudah disediakan atau hitung menggunakan kalkulator.',
      'Bagi nilai total Σx tersebut dengan banyaknya data (n = 24): x̄ = Σx ÷ 24.',
      'Kalkulator di sebelah kanan siap membantumu melakukan operasi pembagian ini.',
      'Pilih jawaban yang tepat dari pilihan yang tersedia.'
    ],
    proTip:
      'Mean sangat dipengaruhi oleh angka ekstrem! Jika ada siswa yang waktu layarnya sangat tinggi (misal 15 jam), rata-rata akan ikut tertarik naik. Fenomena inilah yang akan kita selidiki di level berikutnya!'
  }
}

// Pak Sutrisno Papan Analisis Data (Full Layar 3:1 Split + Kalkulator)
function PakReportModal({ dataset, onProceed }: { dataset: number[]; onProceed: () => void }) {
  const [stage, setStage] = useState<'sort' | 'modus' | 'median' | 'mean'>('sort')
  const [isSorted, setIsSorted] = useState<boolean>(false)
  const [seenTutorials, setSeenTutorials] = useState<Record<string, boolean>>({})
  const [showTutorialModal, setShowTutorialModal] = useState<boolean>(true)

  // Otomatis tampilkan tutorial saat masuk tahap baru jika belum pernah dilihat
  useEffect(() => {
    if (!seenTutorials[stage]) {
      setShowTutorialModal(true)
    }
  }, [stage])

  const handleCloseTutorial = () => {
    setSeenTutorials(prev => ({ ...prev, [stage]: true }))
    setShowTutorialModal(false)
    gameAudio.playClick()
  }

  // Grid adaptif untuk pool data acak, slot target, dan data terurut (tahap 2–4)
  const [poolGridRef, poolGrid] = useFitGrid(24)
  const [slotGridRef, slotGrid] = useFitGrid(24)
  const [sortedGridRef, sortedGrid] = useFitGrid(24)

  const sortedDataset = useMemo(() => [...dataset].sort((a, b) => a - b), [dataset])
  const unsortedDataset = useMemo(() => {
    // Jika dataset kebetulan sudah terurut, acak deterministik agar puzzle urutkan data berfungsi
    const isAlreadySorted = dataset.every((v, i, arr) => i === 0 || arr[i - 1] <= v)
    if (!isAlreadySorted) return dataset
    const perm = [7, 19, 2, 14, 22, 0, 11, 17, 5, 20, 9, 3, 15, 23, 6, 12, 1, 18, 10, 4, 21, 8, 16, 13]
    return perm.map(idx => dataset[idx] ?? dataset[0])
  }, [dataset])

  // ── Tahap 1: Urutkan Data State ──
  const initialTokens: SortToken[] = useMemo(() => {
    return unsortedDataset.map((val, idx) => ({
      id: `tok-${idx}`,
      val,
    }))
  }, [unsortedDataset])

  interface HeldTokenInfo {
    token: SortToken
    sourceSlotIdx: number | null
  }

  const [placedSlots, setPlacedSlots] = useState<(SortToken | null)[]>(() => Array(24).fill(null))
  const [heldToken, setHeldToken] = useState<HeldTokenInfo | null>(null)
  const [sortIsCorrect, setSortIsCorrect] = useState<boolean | null>(null)
  const [wrongSlots, setWrongSlots] = useState<Set<number>>(new Set())
  const [draggedTokenInfo, setDraggedTokenInfo] = useState<{
    tokenId: string
    sourceSlotIdx: number | null
  } | null>(null)
  const [draggedTokenId, setDraggedTokenId] = useState<string | null>(null)
  const [dragOverSlotIdx, setDragOverSlotIdx] = useState<number | null>(null)

  const placedTokenIds = useMemo(() => {
    const ids = new Set<string>()
    placedSlots.forEach(s => {
      if (s) ids.add(s.id)
    })
    return ids
  }, [placedSlots])

  const validateSlots = (currentSlots = placedSlots) => {
    const filledCount = currentSlots.filter(s => s !== null).length
    if (filledCount < 24) {
      setSortIsCorrect(false)
      gameAudio.playError()
      return
    }

    const wrong = new Set<number>()
    let correct = true
    for (let i = 0; i < 24; i++) {
      if (currentSlots[i]?.val !== sortedDataset[i]) {
        wrong.add(i)
        correct = false
      }
    }

    setWrongSlots(wrong)
    if (correct) {
      setSortIsCorrect(true)
      setIsSorted(true)
      gameAudio.playSuccess()
    } else {
      setSortIsCorrect(false)
      gameAudio.playError()
    }
  }

  // ── Mekanisme Hold & Switch (Tap / Click untuk Mobile & Desktop) ──
  const handleTokenClick = (token: SortToken) => {
    if (placedTokenIds.has(token.id)) return

    if (heldToken) {
      if (heldToken.token.id === token.id) {
        // Klik token yang sama dengan yang dipegang: lepas hold
        handleCancelHold()
      } else {
        // Klik token lain di pool: ganti token yang dipegang
        setHeldToken({ token, sourceSlotIdx: null })
        gameAudio.playClick()
      }
      return
    }

    // Ambil token dari pool ke tangan
    setHeldToken({ token, sourceSlotIdx: null })
    gameAudio.playClick()
  }

  const handleCancelHold = () => {
    if (!heldToken) return
    if (heldToken.sourceSlotIdx !== null && placedSlots[heldToken.sourceSlotIdx] === null) {
      const next = [...placedSlots]
      next[heldToken.sourceSlotIdx] = heldToken.token
      setPlacedSlots(next)
    }
    setHeldToken(null)
    gameAudio.playClick()
  }

  const handleSlotClick = (slotIdx: number) => {
    const currentSlotToken = placedSlots[slotIdx]

    if (heldToken) {
      // Sedang memegang angka di tangan
      const next = [...placedSlots]

      if (currentSlotToken) {
        // ── MEKANISME SWITCH: Meletakkan angka yang di-hold & mengambil angka yang posisinya sudah ada ke tangan ──
        next[slotIdx] = heldToken.token
        setPlacedSlots(next)
        setHeldToken({ token: currentSlotToken, sourceSlotIdx: slotIdx })
        setSortIsCorrect(null)
        setWrongSlots(new Set())
        gameAudio.playClick()
      } else {
        // Slot kosong: letakkan angka yang di-hold
        next[slotIdx] = heldToken.token
        setPlacedSlots(next)
        setHeldToken(null)
        setSortIsCorrect(null)
        setWrongSlots(new Set())
        gameAudio.playClick()
      }

      if (next.every(s => s !== null)) {
        validateSlots(next)
      }
    } else {
      // Belum memegang angka: klik slot yang terisi untuk mengangkatnya ke tangan (slot jadi kosong)
      if (currentSlotToken) {
        const next = [...placedSlots]
        next[slotIdx] = null
        setPlacedSlots(next)
        setHeldToken({ token: currentSlotToken, sourceSlotIdx: slotIdx })
        setSortIsCorrect(null)
        setWrongSlots(new Set())
        gameAudio.playClick()
      }
    }
  }

  // ── Mekanisme Drag & Drop (Mouse & Re-positioning) ──
  const handleDragStartFromPool = (e: React.DragEvent, tokenId: string) => {
    e.dataTransfer.setData('text/plain', tokenId)
    try {
      e.dataTransfer.setData('application/json', JSON.stringify({ tokenId, sourceSlotIdx: null }))
    } catch {}
    setDraggedTokenId(tokenId)
    setDraggedTokenInfo({ tokenId, sourceSlotIdx: null })
  }

  const handleDragStartFromSlot = (e: React.DragEvent, slotIdx: number, tokenId: string) => {
    e.dataTransfer.setData('text/plain', tokenId)
    try {
      e.dataTransfer.setData('application/json', JSON.stringify({ tokenId, sourceSlotIdx: slotIdx }))
    } catch {}
    setDraggedTokenId(tokenId)
    setDraggedTokenInfo({ tokenId, sourceSlotIdx: slotIdx })
  }

  const handleDropOnSlot = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault()
    setDragOverSlotIdx(null)

    let tokenId = draggedTokenInfo?.tokenId || draggedTokenId
    let sourceSlotIdx = draggedTokenInfo?.sourceSlotIdx ?? null

    try {
      const raw = e.dataTransfer.getData('application/json')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.tokenId) {
          tokenId = parsed.tokenId
          sourceSlotIdx = parsed.sourceSlotIdx ?? null
        }
      } else {
        const plain = e.dataTransfer.getData('text/plain')
        if (plain) {
          tokenId = plain
          const foundIdx = placedSlots.findIndex(s => s?.id === plain)
          if (foundIdx !== -1) sourceSlotIdx = foundIdx
        }
      }
    } catch {
      // fallback
    }

    if (!tokenId) return
    const token = initialTokens.find(t => t.id === tokenId)
    if (!token) return

    const next = [...placedSlots]

    if (sourceSlotIdx !== null && sourceSlotIdx >= 0) {
      if (sourceSlotIdx === targetIdx) return
      // SWAP / TUKAR posisi kedua slot jika targetIdx terisi, atau pindahkan jika kosong
      const targetToken = next[targetIdx]
      next[targetIdx] = next[sourceSlotIdx]
      next[sourceSlotIdx] = targetToken
    } else {
      // Dari Pool ke Slot
      next[targetIdx] = token
    }

    if (heldToken?.token.id === tokenId) {
      setHeldToken(null)
    }

    setPlacedSlots(next)
    setSortIsCorrect(null)
    setWrongSlots(new Set())
    setDraggedTokenInfo(null)
    setDraggedTokenId(null)
    gameAudio.playClick()

    if (next.every(s => s !== null)) {
      validateSlots(next)
    }
  }

  const handleDropOnPool = (e: React.DragEvent) => {
    e.preventDefault()
    let sourceSlotIdx = draggedTokenInfo?.sourceSlotIdx ?? null
    const tokenId = draggedTokenInfo?.tokenId || e.dataTransfer.getData('text/plain')
    if (sourceSlotIdx === null && tokenId) {
      const foundIdx = placedSlots.findIndex(s => s?.id === tokenId)
      if (foundIdx !== -1) sourceSlotIdx = foundIdx
    }

    if (sourceSlotIdx !== null && sourceSlotIdx >= 0) {
      const next = [...placedSlots]
      next[sourceSlotIdx] = null
      setPlacedSlots(next)
      setSortIsCorrect(null)
      setWrongSlots(new Set())
      setDraggedTokenInfo(null)
      setDraggedTokenId(null)
      if (heldToken?.sourceSlotIdx === sourceSlotIdx) {
        setHeldToken(null)
      }
      gameAudio.playClick()
    }
  }

  const handleAutoSort = useCallback(() => {
    const sortedTokens = [...initialTokens].sort((a, b) => a.val - b.val)
    setPlacedSlots(sortedTokens)
    setSortIsCorrect(true)
    setWrongSlots(new Set())
    setIsSorted(true)
    setHeldToken(null)
    setDraggedTokenInfo(null)
    setDraggedTokenId(null)
    gameAudio.playSuccess()
  }, [initialTokens])

  const handleResetSort = () => {
    setPlacedSlots(Array(24).fill(null))
    setSortIsCorrect(null)
    setWrongSlots(new Set())
    setIsSorted(false)
    setHeldToken(null)
    setDraggedTokenInfo(null)
    setDraggedTokenId(null)
    gameAudio.playClick()
  }

  const handleReset = () => {
    if (stage === 'sort') {
      handleResetSort()
    } else if (stage === 'modus') {
      setSelectedMode(null)
      setModeIsCorrect(null)
      gameAudio.playClick()
    } else if (stage === 'median') {
      setSelectedMedian(null)
      setMedianIsCorrect(null)
      gameAudio.playClick()
    } else if (stage === 'mean') {
      setSelectedMean(null)
      setMeanIsCorrect(null)
      gameAudio.playClick()
    }
  }

  // Stage 2: Modus state
  const [selectedMode, setSelectedMode] = useState<number | null>(null)
  const [modeIsCorrect, setModeIsCorrect] = useState<boolean | null>(null)
  const [shakeMode, setShakeMode] = useState<number>(0)

  // Stage 3: Median state
  const [selectedMedian, setSelectedMedian] = useState<number | null>(null)
  const [medianIsCorrect, setMedianIsCorrect] = useState<boolean | null>(null)
  const [shakeMedian, setShakeMedian] = useState<number>(0)

  // Stage 4: Mean state
  const [selectedMean, setSelectedMean] = useState<number | null>(null)
  const [meanIsCorrect, setMeanIsCorrect] = useState<boolean | null>(null)
  const [shakeMean, setShakeMean] = useState<number>(0)

  // Dev Tool State
  const [showDevTools, setShowDevTools] = useState<boolean>(false)

  const { STATS } = getLevel1Data(dataset)
  const totalSum = STATS.sum
  const meanVal = STATS.mean
  const medianVal = STATS.median

  const displayedData = isSorted ? sortedDataset : unsortedDataset
  const mid1Val = sortedDataset[11]
  const mid2Val = sortedDataset[12]

  const { modeVal, modeCount } = useMemo(() => {
    const counts: Record<number, number> = {}
    let maxCount = 0
    let bestVal = dataset[0] || 3
    for (const v of dataset) {
      counts[v] = (counts[v] || 0) + 1
      if (counts[v] > maxCount) {
        maxCount = counts[v]
        bestVal = v
      }
    }
    return { modeVal: bestVal, modeCount: maxCount }
  }, [dataset])

  // Multiple choice options for Modus
  const modeChoices = useMemo(() => {
    const pool = new Set<number>([modeVal])
    const candidates = [modeVal - 1, modeVal + 1, modeVal + 2, modeVal - 2, 6, 7]
    for (const c of candidates) {
      if (pool.size >= 4) break
      if (c >= 1 && !pool.has(c)) pool.add(c)
    }
    return Array.from(pool).sort((a, b) => a - b)
  }, [modeVal])

  // Multiple choice options for Median
  const medianChoices = useMemo(() => {
    const pool = new Set<number>([medianVal])
    const offsets = [-1, -0.5, 0.5, 1, 1.5, -1.5]
    for (const off of offsets) {
      if (pool.size >= 4) break
      const cand = Number((medianVal + off).toFixed(2))
      if (cand >= 1 && !pool.has(cand)) pool.add(cand)
    }
    return Array.from(pool).sort((a, b) => a - b)
  }, [medianVal])

  // Multiple choice options for Mean
  const meanChoices = useMemo(() => {
    const pool = new Set<number>([meanVal])
    const candidateOffsets = [-1.0, 0.5, -0.5, 1.2, 1.5, -1.5]
    for (const off of candidateOffsets) {
      if (pool.size >= 4) break
      const cand = Number((meanVal + off).toFixed(2))
      if (cand > 0 && !pool.has(cand)) pool.add(cand)
    }
    return Array.from(pool).sort((a, b) => a - b)
  }, [meanVal])

  const handleChooseMode = (val: number) => {
    setSelectedMode(val)
    if (val === modeVal) {
      setModeIsCorrect(true)
      gameAudio.playSuccess()
    } else {
      setModeIsCorrect(false)
      setShakeMode(prev => prev + 1)
      gameAudio.playError()
    }
  }

  const handleChooseMedian = (val: number) => {
    setSelectedMedian(val)
    if (Math.abs(val - medianVal) < 0.05) {
      setMedianIsCorrect(true)
      gameAudio.playSuccess()
    } else {
      setMedianIsCorrect(false)
      setShakeMedian(prev => prev + 1)
      gameAudio.playError()
    }
  }

  const handleChooseMean = (val: number) => {
    setSelectedMean(val)
    if (Math.abs(val - meanVal) < 0.05) {
      setMeanIsCorrect(true)
      gameAudio.playSuccess()
    } else {
      setMeanIsCorrect(false)
      setShakeMean(prev => prev + 1)
      gameAudio.playError()
    }
  }

  // ─── DEV TOOLS: SKIP STEP & SHORTCUTS ─────────────────────────────────────────
  const handleSkipToStage = useCallback((targetStage: 'sort' | 'modus' | 'median' | 'mean') => {
    const sortedTokens = [...initialTokens].sort((a, b) => a.val - b.val)
    if (targetStage === 'sort') {
      setStage('sort')
    } else if (targetStage === 'modus') {
      setPlacedSlots(sortedTokens)
      setSortIsCorrect(true)
      setWrongSlots(new Set())
      setIsSorted(true)
      setHeldToken(null)
      setDraggedTokenInfo(null)
      setDraggedTokenId(null)
      setStage('modus')
    } else if (targetStage === 'median') {
      setPlacedSlots(sortedTokens)
      setSortIsCorrect(true)
      setWrongSlots(new Set())
      setIsSorted(true)
      setHeldToken(null)
      setDraggedTokenInfo(null)
      setDraggedTokenId(null)
      setSelectedMode(modeVal)
      setModeIsCorrect(true)
      setStage('median')
    } else if (targetStage === 'mean') {
      setPlacedSlots(sortedTokens)
      setSortIsCorrect(true)
      setWrongSlots(new Set())
      setIsSorted(true)
      setHeldToken(null)
      setDraggedTokenInfo(null)
      setDraggedTokenId(null)
      setSelectedMode(modeVal)
      setModeIsCorrect(true)
      setSelectedMedian(medianVal)
      setMedianIsCorrect(true)
      setStage('mean')
    }
    gameAudio.playClick()
  }, [initialTokens, modeVal, medianVal])

  const handleAutoCompleteAll = useCallback(() => {
    const sortedTokens = [...initialTokens].sort((a, b) => a.val - b.val)
    setPlacedSlots(sortedTokens)
    setSortIsCorrect(true)
    setWrongSlots(new Set())
    setIsSorted(true)
    setHeldToken(null)
    setDraggedTokenInfo(null)
    setDraggedTokenId(null)
    setSelectedMode(modeVal)
    setModeIsCorrect(true)
    setSelectedMedian(medianVal)
    setMedianIsCorrect(true)
    setSelectedMean(meanVal)
    setMeanIsCorrect(true)
    setStage('mean')
    gameAudio.playSuccess()
  }, [initialTokens, modeVal, medianVal, meanVal])

  const handleResetAllStages = useCallback(() => {
    setPlacedSlots(Array(24).fill(null))
    setSortIsCorrect(null)
    setWrongSlots(new Set())
    setIsSorted(false)
    setHeldToken(null)
    setDraggedTokenInfo(null)
    setDraggedTokenId(null)
    setSelectedMode(null)
    setModeIsCorrect(null)
    setSelectedMedian(null)
    setMedianIsCorrect(null)
    setSelectedMean(null)
    setMeanIsCorrect(null)
    setStage('sort')
    gameAudio.playClick()
  }, [])

  // Keyboard Shortcuts: [1-4] untuk lompat tahap, [U] auto-sort, [0] atau [W] auto-complete all
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase()
      if (activeTag === 'input' || activeTag === 'textarea') return

      if (e.key === 'u' || e.key === 'U') {
        if (stage === 'sort') handleAutoSort()
      } else if (e.key === '1') {
        handleSkipToStage('sort')
      } else if (e.key === '2') {
        handleSkipToStage('modus')
      } else if (e.key === '3') {
        handleSkipToStage('median')
      } else if (e.key === '4') {
        handleSkipToStage('mean')
      } else if (e.key === '0' || e.key.toLowerCase() === 'w') {
        handleAutoCompleteAll()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [stage, handleAutoSort, handleSkipToStage, handleAutoCompleteAll])

  const renderPushPin = (color: string) => (
    <div style={{
      position: 'absolute',
      top: 'clamp(-16px, -2.5vh, -12px)',
      left: '50%',
      transform: 'translateX(-50%) rotate(8deg)',
      zIndex: 12,
      filter: 'drop-shadow(0px 3px 3px rgba(0,0,0,0.35))',
      pointerEvents: 'none',
    }}>
      <svg width="28" height="34" viewBox="0 0 24 28" fill="none" style={{ width: 'clamp(22px, 3vw, 32px)', height: 'clamp(26px, 3.5vh, 38px)' }}>
        <ellipse cx="10" cy="22" rx="4" ry="2" fill="rgba(0,0,0,0.22)" transform="rotate(-15 10 22)" />
        <path d="M12 14L10 24" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M6 6C6 4.89543 6.89543 4 8 4H16C17.1046 4 18 4.89543 18 6V11C18 11.85 17.3 12.5 16.5 12.8L12.5 14.5L8.5 12.8C7.7 12.5 7 11.8 7 11V6Z" fill={color} />
        <path d="M9 5H15V6H9V5Z" fill="rgba(255,255,255,0.35)" />
        <circle cx="10" cy="8" r="1.5" fill="rgba(255,255,255,0.45)" />
      </svg>
    </div>
  )

  const renderCornerBrackets = () => (
    <>
      <div style={{ position: 'absolute', top: '4px', left: '4px', width: 'clamp(7px, 1vw, 10px)', height: 'clamp(7px, 1vw, 10px)', borderTop: '2px solid #5C4033', borderLeft: '2px solid #5C4033', borderTopLeftRadius: '2px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '4px', right: '4px', width: 'clamp(7px, 1vw, 10px)', height: 'clamp(7px, 1vw, 10px)', borderTop: '2px solid #5C4033', borderRight: '2px solid #5C4033', borderTopRightRadius: '2px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '4px', left: '4px', width: 'clamp(7px, 1vw, 10px)', height: 'clamp(7px, 1vw, 10px)', borderBottom: '2px solid #5C4033', borderLeft: '2px solid #5C4033', borderBottomLeftRadius: '2px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: 'clamp(7px, 1vw, 10px)', height: 'clamp(7px, 1vw, 10px)', borderBottom: '2px solid #5C4033', borderRight: '2px solid #5C4033', borderBottomRightRadius: '2px', pointerEvents: 'none' }} />
    </>
  )

  const currentStageSolved =
    (stage === 'sort' && sortIsCorrect === true) ||
    (stage === 'modus' && modeIsCorrect === true) ||
    (stage === 'median' && medianIsCorrect === true) ||
    (stage === 'mean' && meanIsCorrect === true)

  return (
    <div
      data-testid="pak-report-corkboard"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 650,
        background: '#1A0F08',
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        userSelect: 'none',
        boxSizing: 'border-box',
        border: 'clamp(6px, 1.2vw, 14px) solid #5a3825',
        outline: 'clamp(1.5px, 0.3vw, 3px) solid #362014',
        outlineOffset: 'calc(-1 * clamp(7px, 1.5vw, 17px))',
        boxShadow: 'inset 0 8px 24px rgba(0,0,0,0.65), inset 0 -8px 24px rgba(0,0,0,0.65)',
        padding: 'clamp(7px, 1.2vh, 14px) clamp(8px, 1.6vw, 18px) clamp(6px, 1.2vh, 12px)',
      }}
    >
      <style>{`
        .corkboard-scroll-area::-webkit-scrollbar {
          width: 5px;
        }
        .corkboard-scroll-area::-webkit-scrollbar-track {
          background: rgba(54, 32, 20, 0.15);
          border-radius: 999px;
        }
        .corkboard-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(140, 98, 57, 0.5);
          border-radius: 999px;
        }
        .corkboard-scroll-area::-webkit-scrollbar-thumb:hover {
          background: rgba(140, 98, 57, 0.8);
        }
      `}</style>

      {/* Corkboard SVG Texture Defs */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <pattern id="rgCorkTexture" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="#C9A876" />
            <circle cx="8" cy="6" r="1.2" fill="#A8895F" opacity="0.5" />
            <circle cx="22" cy="14" r="0.9" fill="#8A6E45" opacity="0.4" />
            <circle cx="34" cy="4" r="1.4" fill="#B5966B" opacity="0.5" />
            <circle cx="15" cy="24" r="1.1" fill="#8A6E45" opacity="0.4" />
            <circle cx="30" cy="28" r="0.8" fill="#A8895F" opacity="0.5" />
            <circle cx="4" cy="33" r="1.3" fill="#8A6E45" opacity="0.4" />
            <circle cx="38" cy="20" r="1.0" fill="#B5966B" opacity="0.5" />
            <circle cx="19" cy="37" r="0.9" fill="#A8895F" opacity="0.4" />
          </pattern>
          <radialGradient id="rgBoardSpotlight" cx="50%" cy="35%" r="72%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.38" />
          </radialGradient>
        </defs>
      </svg>

      {/* Background Cork Texture & Spotlight */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        <rect width="100%" height="100%" fill="url(#rgCorkTexture)" />
        <rect width="100%" height="100%" fill="url(#rgBoardSpotlight)" />
      </svg>

      {/* Warm Lamp Highlight */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 20% 15%, rgba(254, 240, 138, 0.22) 0%, rgba(254, 240, 138, 0.05) 45%, rgba(254, 240, 138, 0) 75%)',
        pointerEvents: 'none',
        zIndex: 1,
        mixBlendMode: 'screen',
      }} />

      {/* ── TOP HEADER BAR: STEPPER & DEV TOOLS ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          flexShrink: 0,
          position: 'relative',
          zIndex: 30,
          marginBottom: 'clamp(3px, 0.6vh, 7px)',
          gap: 'clamp(4px, 0.8vw, 10px)',
        }}
      >
        {/* Kiri: Tombol Toggle Dev Tool Skip Step */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <button
            data-testid="btn-dev-tools-toggle"
            onClick={() => {
              setShowDevTools(prev => !prev)
              gameAudio.playClick()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 'clamp(2.5px, 0.4vh, 5px) clamp(6px, 0.8vw, 11px)',
              borderRadius: '999px',
              fontSize: 'clamp(8px, 1vw, 10.5px)',
              fontWeight: 900,
              cursor: 'pointer',
              border: showDevTools ? '1.5px solid #F59E0B' : '1.5px solid rgba(245, 158, 11, 0.45)',
              background: showDevTools
                ? 'linear-gradient(180deg, #92400E 0%, #78350F 100%)'
                : 'linear-gradient(180deg, rgba(60, 25, 5, 0.85) 0%, rgba(30, 12, 2, 0.95) 100%)',
              color: '#FDE68A',
              boxShadow: '0 2px 8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            title="Buka / Tutup Dev Tool Skip Step untuk kemudahan debugging"
          >
            <span>🛠️</span>
            <span>DEV SKIP</span>
            <span style={{ fontSize: '9px', opacity: 0.85 }}>{showDevTools ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Tengah: Stepper 4 Tahap (Klik tab mana saja untuk langsung lompat ke tahap tersebut) */}
        <div
          data-testid="corkboard-stage-stepper"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(4px, 0.7vw, 8px)',
            flexShrink: 0,
            flexWrap: 'nowrap',
            overflowX: 'auto',
            alignSelf: 'center',
            background: 'linear-gradient(180deg, #3E2415 0%, #27150B 100%)',
            border: '1.5px solid #B48C50',
            borderRadius: '999px',
            padding: 'clamp(2px, 0.35vh, 5px) clamp(8px, 1.2vw, 16px)',
            boxShadow: '0 3px 10px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          {[
            { id: 'sort', num: 1, label: '1. Urutkan Data', done: sortIsCorrect === true },
            { id: 'modus', num: 2, label: '2. Modus', done: modeIsCorrect === true },
            { id: 'median', num: 3, label: '3. Median', done: medianIsCorrect === true },
            { id: 'mean', num: 4, label: '4. Rata-Rata', done: meanIsCorrect === true },
          ].map((st, i) => {
            const isActive = stage === st.id
            return (
              <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(2px, 0.4vw, 5px)', flexShrink: 0 }}>
                <div
                  data-testid={`stepper-tab-${st.id}`}
                  onClick={() => handleSkipToStage(st.id as any)}
                  style={{
                    padding: 'clamp(2px, 0.4vh, 4px) clamp(6px, 0.9vw, 11px)',
                    borderRadius: '999px',
                    fontSize: 'clamp(8.5px, 1.1vw, 11px)',
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    background: st.done
                      ? '#059669'
                      : isActive
                      ? '#5a3825'
                      : 'rgba(255, 255, 255, 0.08)',
                    color: st.done || isActive ? '#FFFDF9' : '#D1B89D',
                    border: isActive
                      ? '2px solid #FDE68A'
                      : st.done
                      ? '1.5px solid #34D399'
                      : '1.5px solid rgba(180, 140, 80, 0.35)',
                    boxShadow: isActive ? '0 0 8px rgba(253, 230, 138, 0.4)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                  title={`Klik untuk langsung lompat ke ${st.label} (Dev Skip)`}
                >
                  <span>{st.done ? '✓' : ''}</span>
                  <span>{st.label}</span>
                </div>
                {i < 3 && (
                  <span style={{ color: '#FDE68A', fontWeight: 900, fontSize: 'clamp(9px, 1.1vw, 11px)' }}>→</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Kanan: Tombol Cepat Auto Win (Selesaikan Semua 4 Tahap) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 0.7vw, 8px)', flexShrink: 0 }}>
          {/* Tombol Panduan Materi / Tutorial untuk Tahap Aktif */}
          <button
            data-testid="btn-open-tutorial-header"
            onClick={() => {
              setShowTutorialModal(true)
              gameAudio.playClick()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 'clamp(2.5px, 0.4vh, 5px) clamp(7px, 1vw, 12px)',
              borderRadius: '999px',
              fontSize: 'clamp(8px, 1vw, 10.5px)',
              fontWeight: 900,
              cursor: 'pointer',
              border: '1.5px solid #60A5FA',
              background: 'linear-gradient(180deg, #1E3A8A 0%, #172554 100%)',
              color: '#EFF6FF',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            title="Buka Panel Panduan & Tutorial Konsep Belajar"
          >
            <span style={{ fontSize: 'clamp(9px, 1.1vw, 12px)' }}>💡</span>
            <span>Panduan Materi</span>
          </button>

          <button
            data-testid="btn-dev-instant-win"
            onClick={handleAutoCompleteAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 'clamp(2.5px, 0.4vh, 5px) clamp(6px, 0.8vw, 11px)',
              borderRadius: '999px',
              fontSize: 'clamp(8px, 1vw, 10.5px)',
              fontWeight: 900,
              cursor: 'pointer',
              border: '1.5px solid #10B981',
              background: 'linear-gradient(180deg, #059669 0%, #047857 100%)',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            title="Selesaikan semua 4 tahap secara instan (Auto Win / Dev)"
          >
            <span>⚡</span>
            <span>Auto Win</span>
          </button>
        </div>
      </div>

      {/* ── COLLAPSIBLE DEV TOOLBAR (EXPANDED KETIKA showDevTools === TRUE) ── */}
      <AnimatePresence>
        {showDevTools && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 'clamp(3px, 0.6vw, 6px)',
              background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
              border: '1.5px solid #8C6239',
              borderRadius: '8px',
              padding: 'clamp(3px, 0.5vh, 6px) clamp(6px, 1vw, 12px)',
              marginBottom: 'clamp(4px, 0.6vh, 8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6)',
              position: 'relative',
              zIndex: 35,
              alignSelf: 'center',
              overflow: 'hidden',
            }}
          >
            <span style={{
              fontSize: 'clamp(8px, 1vw, 10.5px)',
              fontWeight: 900,
              color: '#9A3412',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              marginRight: '2px',
            }}>
              🛠️ SKIP:
            </span>

            <button
              data-testid="dev-btn-stage-1"
              onClick={() => handleSkipToStage('sort')}
              style={{
                padding: 'clamp(2px, 0.35vh, 4px) clamp(5px, 0.7vw, 9px)',
                borderRadius: '5px',
                border: stage === 'sort' ? '1.5px solid #78350F' : '1px solid #8C6239',
                background: stage === 'sort' ? '#B45309' : '#FFFDF7',
                color: stage === 'sort' ? '#FFFFFF' : '#362014',
                fontSize: 'clamp(8px, 0.95vw, 10px)',
                fontWeight: 800,
                cursor: 'pointer',
              }}
              title="Lompat ke Tahap 1 (Urutkan Data)"
            >
              [1] Urutkan
            </button>

            <button
              data-testid="dev-btn-stage-2"
              onClick={() => handleSkipToStage('modus')}
              style={{
                padding: 'clamp(2px, 0.35vh, 4px) clamp(5px, 0.7vw, 9px)',
                borderRadius: '5px',
                border: stage === 'modus' ? '1.5px solid #78350F' : '1px solid #8C6239',
                background: stage === 'modus' ? '#B45309' : '#FFFDF7',
                color: stage === 'modus' ? '#FFFFFF' : '#362014',
                fontSize: 'clamp(8px, 0.95vw, 10px)',
                fontWeight: 800,
                cursor: 'pointer',
              }}
              title="Lompat ke Tahap 2 (Modus) + Auto-Sort"
            >
              [2] Modus
            </button>

            <button
              data-testid="dev-btn-stage-3"
              onClick={() => handleSkipToStage('median')}
              style={{
                padding: 'clamp(2px, 0.35vh, 4px) clamp(5px, 0.7vw, 9px)',
                borderRadius: '5px',
                border: stage === 'median' ? '1.5px solid #78350F' : '1px solid #8C6239',
                background: stage === 'median' ? '#B45309' : '#FFFDF7',
                color: stage === 'median' ? '#FFFFFF' : '#362014',
                fontSize: 'clamp(8px, 0.95vw, 10px)',
                fontWeight: 800,
                cursor: 'pointer',
              }}
              title="Lompat ke Tahap 3 (Median) + Auto-Modus"
            >
              [3] Median
            </button>

            <button
              data-testid="dev-btn-stage-4"
              onClick={() => handleSkipToStage('mean')}
              style={{
                padding: 'clamp(2px, 0.35vh, 4px) clamp(5px, 0.7vw, 9px)',
                borderRadius: '5px',
                border: stage === 'mean' ? '1.5px solid #78350F' : '1px solid #8C6239',
                background: stage === 'mean' ? '#B45309' : '#FFFDF7',
                color: stage === 'mean' ? '#FFFFFF' : '#362014',
                fontSize: 'clamp(8px, 0.95vw, 10px)',
                fontWeight: 800,
                cursor: 'pointer',
              }}
              title="Lompat ke Tahap 4 (Rata-Rata) + Auto-Median"
            >
              [4] Rata-Rata
            </button>

            <button
              data-testid="dev-btn-auto-all"
              onClick={handleAutoCompleteAll}
              style={{
                padding: 'clamp(2px, 0.35vh, 4px) clamp(5px, 0.7vw, 9px)',
                borderRadius: '5px',
                border: '1.5px solid #065F46',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#FFFFFF',
                fontSize: 'clamp(8px, 0.95vw, 10px)',
                fontWeight: 900,
                cursor: 'pointer',
              }}
              title="Selesaikan semua 4 tahap sekaligus"
            >
              ⚡ Selesai Semua
            </button>

            <button
              data-testid="dev-btn-reset-all"
              onClick={handleResetAllStages}
              style={{
                padding: 'clamp(2px, 0.35vh, 4px) clamp(5px, 0.7vw, 9px)',
                borderRadius: '5px',
                border: '1px solid #DC2626',
                background: '#FEE2E2',
                color: '#991B1B',
                fontSize: 'clamp(8px, 0.95vw, 10px)',
                fontWeight: 800,
                cursor: 'pointer',
              }}
              title="Reset seluruh progres papan ke awal"
            >
              🔄 Reset Semua
            </button>

            <span style={{
              fontSize: 'clamp(7px, 0.85vw, 9px)',
              color: '#78350F',
              fontWeight: 700,
              marginLeft: '2px',
            }}>
              (Hotkey: [1-4], [U], [0])
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT AREA: 3:1 SPLIT (KIRI: ANALISIS, KANAN: KALKULATOR) ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 'clamp(8px, 1.2vw, 16px)',
        flex: 1,
        minHeight: 0,
        position: 'relative',
        zIndex: 5,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
      }}>

        {/* ── BAGIAN KIRI (RASIO 3): DATA 24 BULATAN + INDIKATOR + KARTU TAHAP ── */}
        <div
          className="corkboard-scroll-area"
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(3px, 0.6vh, 6px)',
            minHeight: 0,
            height: '100%',
            overflowY: 'auto',
            paddingRight: '2px',
            paddingBottom: '2px',
            boxSizing: 'border-box',
          }}
        >

          {/* ── TAHAP 1: URUTKAN DATA (50% ATAS / 50% BAWAH) ── */}
          {stage === 'sort' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(4px, 0.7vh, 8px)',
              flex: '1 1 0',
              minHeight: 0,
              height: '100%',
            }}>
              
              {/* BAGIAN ATAS (50%): 24 DATA ACAK POOL */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleDropOnPool}
                style={{
                  flex: '1 1 0',
                  minHeight: 0,
                  position: 'relative',
                  background: 'rgba(54, 32, 20, 0.35)',
                  border: '1.5px dashed rgba(90, 56, 37, 0.65)',
                  borderRadius: 'clamp(8px, 1.2vw, 12px)',
                  padding: 'clamp(4px, 0.7vh, 8px) clamp(8px, 1.2vw, 12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                }}
              >
                {/* Indikator Memegang Angka (Hanya muncul jika sedang hold angka) */}
                {heldToken && (
                  <div
                    data-testid="held-token-banner"
                    style={{
                      position: 'absolute',
                      top: 'clamp(3px, 0.6vh, 6px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'clamp(4px, 0.7vw, 8px)',
                      background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
                      border: '1.5px solid #8C6239',
                      borderRadius: '999px',
                      padding: '1px clamp(8px, 1vw, 12px) 1px 6px',
                      boxShadow: '0 2px 8px rgba(140, 98, 57, 0.35)',
                      whiteSpace: 'nowrap',
                      zIndex: 10,
                    }}
                  >
                    <span style={{ fontSize: 'clamp(11px, 1.3vw, 13px)' }}>✋</span>
                    <span style={{ fontSize: 'clamp(8px, 0.95vw, 10px)', fontWeight: 900, color: '#FEF3C7' }}>
                      Memegang:
                    </span>
                    <div style={{
                      width: 'clamp(18px, 2.2vw, 24px)',
                      height: 'clamp(18px, 2.2vw, 24px)',
                      borderRadius: '50%',
                      background: '#FFFDF7',
                      border: '1.5px solid #8C6239',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'clamp(9.5px, 1.2vw, 12px)',
                      fontWeight: 900,
                      color: '#FEF3C7',
                    }}>
                      {heldToken.token.val}
                    </div>
                    <button
                      data-testid="btn-cancel-hold"
                      onClick={handleCancelHold}
                      style={{
                        padding: '1px 5px',
                        borderRadius: '4px',
                        fontSize: 'clamp(7.5px, 0.85vw, 9px)',
                        fontWeight: 800,
                        cursor: 'pointer',
                        border: '1px solid #8C6239',
                        background: '#F5E8C7',
                        color: '#FEF3C7',
                      }}
                    >
                      ✕ Batal
                    </button>
                  </div>
                )}

                {/* Grid 24 Bulatan Acak (2 baris x 12) - Fills 50% Top cleanly */}
                <div ref={poolGridRef} style={{
                  flex: 1,
                  minHeight: 0,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${poolGrid.cols}, minmax(0, 1fr))`,
                  columnGap: 'clamp(4px, 1.2%, 12px)',
                  justifyItems: 'center',
                  alignItems: 'center',
                  alignContent: 'space-evenly',
                  padding: '2px 0',
                }}>
                  {initialTokens.map((token, idx) => {
                    const isHeld = heldToken?.token.id === token.id
                    const isPlaced = placedTokenIds.has(token.id) && !isHeld
                    return (
                      <div
                        key={token.id}
                        data-testid={`pool-token-${idx}`}
                        draggable={!isPlaced && !isHeld}
                        onDragStart={e => handleDragStartFromPool(e, token.id)}
                        onClick={() => handleTokenClick(token)}
                        style={{
                          position: 'relative',
                          width: poolGrid.size,
                          height: poolGrid.size,
                          maxWidth: '100%',
                          borderRadius: '50%',
                          background: isHeld
                            ? 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #FEF3C7 70%, #FDE68A 100%)'
                            : isPlaced
                            ? 'rgba(0,0,0,0.06)'
                            : 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #F5EFE6 75%, #E2D5C1 100%)',
                          border: isHeld
                            ? '2.5px solid #F59E0B'
                            : isPlaced
                            ? '1.5px dashed rgba(90, 56, 37, 0.35)'
                            : '2px solid #5C4033',
                          boxShadow: isHeld
                            ? '0 0 10px rgba(245, 158, 11, 0.9), 0 2px 4px rgba(0,0,0,0.25)'
                            : isPlaced
                            ? 'none'
                            : '0 2px 4px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: Math.round(poolGrid.size * 0.42),
                          fontWeight: 900,
                          color: isHeld ? '#78350F' : isPlaced ? 'rgba(62, 36, 21, 0.25)' : '#1E1B18',
                          fontFamily: 'var(--font-data)',
                          cursor: isPlaced ? 'default' : isHeld ? 'pointer' : 'grab',
                          transition: 'all 0.15s',
                          transform: isHeld ? 'scale(1.12)' : 'scale(1)',
                          zIndex: isHeld ? 2 : 1,
                        }}
                      >
                        {isPlaced ? '·' : token.val}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* BAGIAN BAWAH (50%): 24 TARGET SLOT URUTAN */}
              <div style={{
                flex: '1 1 0',
                minHeight: 0,
                position: 'relative',
                background: '#FFFDF9',
                border: '1.5px solid rgba(140, 98, 57, 0.45)',
                borderRadius: 'clamp(8px, 1.2vw, 12px)',
                padding: 'clamp(4px, 0.7vh, 8px) clamp(10px, 1.4vw, 16px)',
                boxShadow: '0 6px 18px rgba(0,0,0,0.28)',
                color: '#1E293B',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 'clamp(2px, 0.4vh, 4px)',
                boxSizing: 'border-box',
              }}>
                {renderPushPin(sortIsCorrect ? '#059669' : '#DC2626')}
                {renderCornerBrackets()}

                {/* Fallback hidden check button for automated test suites */}
                <button
                  data-testid="btn-check-sort"
                  onClick={() => validateSlots()}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'auto', width: 1, height: 1, zIndex: -1 }}
                  aria-hidden="true"
                />

                {/* Grid 24 Target Slots (2 baris x 12) - Fills 50% Bottom cleanly */}
                <div ref={slotGridRef} style={{
                  flex: 1,
                  minHeight: 0,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${slotGrid.cols}, minmax(0, 1fr))`,
                  columnGap: 'clamp(4px, 1.2%, 12px)',
                  justifyItems: 'center',
                  alignItems: 'center',
                  alignContent: 'space-evenly',
                  padding: '2px 0',
                }}>
                  {placedSlots.map((token, idx) => {
                    const isOccupied = !!token
                    const isWrong = wrongSlots.has(idx)
                    const isOver = dragOverSlotIdx === idx
                    const isSwitchCandidate = heldToken !== null && isOccupied

                    return (
                      <div
                        key={`slot-${idx}`}
                        data-testid={`target-slot-${idx}`}
                        draggable={isOccupied}
                        onDragStart={e => {
                          if (isOccupied && token) {
                            handleDragStartFromSlot(e, idx, token.id)
                          }
                        }}
                        onDragOver={e => {
                          e.preventDefault()
                          setDragOverSlotIdx(idx)
                        }}
                        onDragLeave={() => {
                          if (dragOverSlotIdx === idx) setDragOverSlotIdx(null)
                        }}
                        onDrop={e => handleDropOnSlot(e, idx)}
                        onClick={() => handleSlotClick(idx)}
                        style={{
                          position: 'relative',
                          width: slotGrid.size,
                          height: slotGrid.size,
                          maxWidth: '100%',
                          borderRadius: '50%',
                          background: isOccupied
                            ? isWrong
                              ? 'radial-gradient(circle at 35% 30%, #FEE2E2 0%, #EF4444 100%)'
                              : sortIsCorrect
                              ? 'radial-gradient(circle at 35% 30%, #A7F3D0 0%, #10B981 100%)'
                              : 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #F5EFE6 75%, #E2D5C1 100%)'
                            : isOver
                            ? 'rgba(56, 189, 248, 0.25)'
                            : heldToken
                            ? 'rgba(254, 240, 138, 0.2)'
                            : 'rgba(241, 245, 249, 0.7)',
                          border: isOccupied
                            ? isWrong
                              ? '2px solid #DC2626'
                              : sortIsCorrect
                              ? '2px solid #047857'
                              : isOver
                              ? '2.5px solid #0284C7'
                              : isSwitchCandidate
                              ? '2px dashed #D97706'
                              : '2px solid #5C4033'
                            : isOver
                            ? '2.5px solid #0284C7'
                            : heldToken
                            ? '1.5px dashed #D97706'
                            : '1.5px dashed #CBD5E1',
                          boxShadow: isOccupied
                            ? isSwitchCandidate
                              ? '0 0 8px rgba(217, 119, 6, 0.6)'
                              : '0 2px 4px rgba(0,0,0,0.2)'
                            : isOver
                            ? '0 0 8px rgba(2, 132, 199, 0.5)'
                            : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: isOccupied ? Math.round(slotGrid.size * 0.42) : Math.round(slotGrid.size * 0.27),
                          fontWeight: 900,
                          color: isOccupied
                            ? isWrong
                              ? '#FFFFFF'
                              : sortIsCorrect
                              ? '#064E3B'
                              : '#1E1B18'
                            : '#94A3B8',
                          fontFamily: 'var(--font-data)',
                          cursor: isOccupied ? 'grab' : heldToken ? 'pointer' : 'default',
                          transition: 'all 0.15s',
                        }}
                      >
                        {isOccupied ? token.val : `#${idx + 1}`}
                        {isOccupied && (
                          <span style={{
                            position: 'absolute',
                            bottom: '-4px',
                            background: isSwitchCandidate
                              ? '#B45309'
                              : isWrong
                              ? '#991B1B'
                              : sortIsCorrect
                              ? '#065F46'
                              : '#475569',
                            color: '#FFFFFF',
                            fontSize: Math.max(7, Math.round(slotGrid.size * 0.17)),
                            fontWeight: 900,
                            padding: '0px 3px',
                            borderRadius: '3px',
                            lineHeight: 1.1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1px',
                          }}>
                            {isSwitchCandidate ? '⇄' : `#${idx + 1}`}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Feedback Error jika belum benar */}

                {sortIsCorrect === false && (
                  <motion.div
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: '#FEF2F2',
                      border: '1.5px solid #EF4444',
                      borderRadius: '5px',
                      padding: 'clamp(2px, 0.4vh, 4px) clamp(6px, 1vw, 10px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 'clamp(10px, 1.2vw, 13px)' }}>⚠️</span>
                    <span style={{ fontSize: 'clamp(8px, 0.95vw, 10px)', fontWeight: 800, color: '#991B1B' }}>
                      {placedTokenIds.size < 24
                        ? 'Isi semua 24 slot terlebih dahulu sebelum diperiksa!'
                        : 'Urutan belum tepat! Periksa angka bertanda merah atau klik untuk switch/tukar.'}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* ── TAHAP 2, 3, 4: DATA TERURUT (50%) & KARTU PENGERJAAN (50%) ── */}
          {stage !== 'sort' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(4px, 0.7vh, 8px)',
              flex: '1 1 0',
              minHeight: 0,
              height: '100%',
            }}>
              {/* BAGIAN ATAS (50%): 24 Bulatan Angka Data Terurut */}
              <div style={{
                flex: '1 1 0',
                minHeight: 0,
                background: 'rgba(54, 32, 20, 0.28)',
                border: '1.5px dashed rgba(90, 56, 37, 0.6)',
                borderRadius: 'clamp(8px, 1.2vw, 12px)',
                padding: 'clamp(4px, 0.7vh, 8px) clamp(8px, 1.2vw, 12px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}>
                {/* 24 Circular Data Tokens Grid - Fills 50% Top cleanly */}
                <div ref={sortedGridRef} style={{
                  flex: 1,
                  minHeight: 0,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${sortedGrid.cols}, minmax(0, 1fr))`,
                  columnGap: 'clamp(4px, 1.2%, 12px)',
                  justifyItems: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                  padding: '2px 0',
                }}>
                  {sortedDataset.map((val, idx) => {
                    const isModeHighlight = stage === 'modus' && modeIsCorrect === true && val === modeVal
                    // Jangan beri tahu nilai tengah sebelum dijawab! Hanya sorot setelah jawaban terkonfirmasi benar
                    const isMedianHighlight = stage === 'median' && medianIsCorrect === true && (idx === 11 || idx === 12)
                    return (
                      <motion.div
                        key={`sorted-${idx}`}
                        layout
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.18, delay: idx * 0.008 }}
                        style={{
                          position: 'relative',
                          width: sortedGrid.size,
                          height: sortedGrid.size,
                          maxWidth: '100%',
                          borderRadius: '50%',
                          background: isModeHighlight
                            ? 'radial-gradient(circle at 35% 30%, #A7F3D0 0%, #10B981 100%)'
                            : isMedianHighlight
                            ? 'radial-gradient(circle at 35% 30%, #FEF08A 0%, #F59E0B 100%)'
                            : 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #F5EFE6 75%, #E2D5C1 100%)',
                          border: isModeHighlight
                            ? '2px solid #047857'
                            : isMedianHighlight
                            ? '2px solid #B45309'
                            : '2px solid #5C4033',
                          boxShadow: (isModeHighlight || isMedianHighlight)
                            ? '0 0 8px rgba(245, 158, 11, 0.6), 0 2px 4px rgba(0,0,0,0.2)'
                            : '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: Math.round(sortedGrid.size * 0.42),
                          fontWeight: 900,
                          color: isModeHighlight ? '#064E3B' : isMedianHighlight ? '#451A03' : '#1E1B18',
                          fontFamily: 'var(--font-data)',
                        }}
                      >
                        {val}
                        {/* Label nomor urut #1 sampai #24 di bawah setiap bulatan data */}
                        <span style={{
                          position: 'absolute',
                          bottom: '-5px',
                          background: isMedianHighlight
                            ? '#B45309'
                            : isModeHighlight
                            ? '#065F46'
                            : 'rgba(54, 32, 20, 0.88)',
                          border: '1px solid rgba(140, 98, 57, 0.55)',
                          color: '#FEF3C7',
                          fontSize: Math.max(7, Math.round(sortedGrid.size * 0.17)),
                          fontWeight: 900,
                          padding: '0px 3px',
                          borderRadius: '3px',
                          lineHeight: 1.1,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                        }}>
                          #{idx + 1}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* BAGIAN BAWAH (50%): Kartu Kertas Tahap Aktif (Modus, Median, Mean) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    flex: '1 1 0',
                    minHeight: 0,
                    position: 'relative',
                    background: '#FFFDF9',
                    border: '1.5px solid rgba(140, 98, 57, 0.45)',
                    borderRadius: 'clamp(8px, 1.2vw, 10px)',
                    padding: 'clamp(5px, 0.8vh, 10px) clamp(10px, 1.4vw, 16px)',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.28)',
                    color: '#1E293B',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 'clamp(3px, 0.5vh, 6px)',
                    boxSizing: 'border-box',
                  }}
                >
                  {renderPushPin(currentStageSolved ? '#059669' : '#DC2626')}
                  {renderCornerBrackets()}

                  {/* TAHAP 2: MODUS */}
                  {stage === 'modus' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(5px, 0.8vh, 8px)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 900, fontFamily: 'monospace', color: '#FFFFFF', background: '#362014', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                            TAHAP 2 DARI 4
                          </span>
                          <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 800, color: '#0284C7', background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.3)', padding: '1px 6px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                            MODUS (NILAI TERBANYAK)
                          </span>
                        </div>
                        <button
                          data-testid="btn-open-tutorial-modus"
                          onClick={() => {
                            setShowTutorialModal(true)
                            gameAudio.playClick()
                          }}
                          style={{
                            background: 'rgba(2, 132, 199, 0.1)',
                            border: '1px solid rgba(2, 132, 199, 0.35)',
                            color: '#0284C7',
                            fontSize: 'clamp(8px, 1vw, 9.5px)',
                            fontWeight: 800,
                            cursor: 'pointer',
                            borderRadius: '4px',
                            padding: '1px 7px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <span>💡 Panduan Materi</span>
                        </button>
                      </div>

                      <div>
                        <h4 style={{ margin: '0 0 2px', fontSize: 'clamp(12px, 1.5vw, 14.5px)', fontWeight: 900, color: '#1E1B18' }}>
                          🎯 Tentukan Modus dari 24 Data Terurut di Atas
                        </h4>
                        <p style={{ margin: 0, fontSize: 'clamp(9px, 1.1vw, 11px)', color: '#475569', lineHeight: 1.3 }}>
                          <strong>Modus</strong> adalah nilai yang paling sering muncul. Karena data sudah kamu urutkan dari terkecil ke terbesar, deretan angka yang sama kini berjejer rapat. Perhatikan label nomor urut di bawah setiap angka untuk membantumu menghitung frekuensi. Pilih angka yang paling sering muncul!
                        </p>
                      </div>

                      <motion.div
                        key={shakeMode}
                        animate={modeIsCorrect === false ? { x: [-5, 5, -4, 4, 0] } : {}}
                        transition={{ duration: 0.3 }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'clamp(4px, 0.8vw, 8px)' }}
                      >
                        {modeChoices.map(choice => {
                          const isSelected = selectedMode === choice
                          const isSelectedCorrect = isSelected && modeIsCorrect === true
                          const isSelectedWrong = isSelected && modeIsCorrect === false
                          return (
                            <button
                              key={choice}
                              data-testid={`modus-choice-${choice}`}
                              disabled={modeIsCorrect === true}
                              onClick={() => handleChooseMode(choice)}
                              style={{
                                padding: 'clamp(5px, 0.8vh, 8px) clamp(4px, 0.6vw, 8px)',
                                borderRadius: 'clamp(5px, 0.8vw, 7px)',
                                fontSize: 'clamp(11px, 1.3vw, 13px)',
                                fontWeight: 900,
                                cursor: modeIsCorrect === true ? 'default' : 'pointer',
                                border: isSelectedCorrect
                                  ? '2px solid #059669'
                                  : isSelectedWrong
                                  ? '2px solid #DC2626'
                                  : '1.5px solid #CBD5E1',
                                background: isSelectedCorrect
                                  ? '#D1FAE5'
                                  : isSelectedWrong
                                  ? '#FEE2E2'
                                  : '#F8FAFC',
                                color: isSelectedCorrect ? '#065F46' : isSelectedWrong ? '#991B1B' : '#1E293B',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                transition: 'all 0.15s',
                              }}
                            >
                              Angka {choice} {isSelectedCorrect ? '✓' : isSelectedWrong ? '✕' : ''}
                            </button>
                          )
                        })}
                      </motion.div>

                      {modeIsCorrect === false && (
                        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '5px', padding: 'clamp(4px, 0.6vh, 6px) clamp(6px, 1vw, 10px)', fontSize: 'clamp(9px, 1.1vw, 10.5px)', color: '#991B1B', fontWeight: 700 }}>
                          💡 Belum tepat! Perhatikan deretan data di atas dan hitung angka mana yang kelompoknya paling panjang.
                        </div>
                      )}

                      {modeIsCorrect === true && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: '#D1FAE5', border: '1.5px solid #059669', borderRadius: '6px', padding: 'clamp(4px, 0.7vh, 7px) clamp(8px, 1.2vw, 12px)', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 'clamp(9.5px, 1.1vw, 11.5px)', fontWeight: 900, color: '#065F46' }}>
                            ✓ Benar! Modus data adalah {modeVal} (muncul sebanyak {modeCount} kali).
                          </span>
                          <button
                            data-testid="btn-next-to-median"
                            onClick={() => {
                              setStage('median')
                              gameAudio.playClick()
                            }}
                            style={{
                              padding: 'clamp(4px, 0.7vh, 6px) clamp(10px, 1.4vw, 14px)',
                              borderRadius: '5px',
                              border: 'none',
                              background: '#059669',
                              color: '#FFFFFF',
                              fontSize: 'clamp(10px, 1.2vw, 11.5px)',
                              fontWeight: 900,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.35)',
                            }}
                          >
                            Lanjut ke Tahap 3: Median →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAHAP 3: MEDIAN */}
                  {stage === 'median' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(5px, 0.8vh, 8px)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 900, fontFamily: 'monospace', color: '#FFFFFF', background: '#362014', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                            TAHAP 3 DARI 4
                          </span>
                          <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 800, color: '#D97706', background: 'rgba(217, 119, 6, 0.12)', border: '1px solid rgba(217, 119, 6, 0.35)', padding: '1px 6px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                            MEDIAN (NILAI TENGAH)
                          </span>
                        </div>
                        <button
                          data-testid="btn-open-tutorial-median"
                          onClick={() => {
                            setShowTutorialModal(true)
                            gameAudio.playClick()
                          }}
                          style={{
                            background: 'rgba(217, 119, 6, 0.1)',
                            border: '1px solid rgba(217, 119, 6, 0.35)',
                            color: '#B45309',
                            fontSize: 'clamp(8px, 1vw, 9.5px)',
                            fontWeight: 800,
                            cursor: 'pointer',
                            borderRadius: '4px',
                            padding: '1px 7px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <span>💡 Panduan Materi</span>
                        </button>
                      </div>

                      <div>
                        <h4 style={{ margin: '0 0 2px', fontSize: 'clamp(12px, 1.5vw, 14.5px)', fontWeight: 900, color: '#1E1B18' }}>
                          ⚖️ Tentukan Median dari 24 Data Terurut
                        </h4>
                        <p style={{ margin: 0, fontSize: 'clamp(9px, 1.1vw, 11px)', color: '#475569', lineHeight: 1.3 }}>
                          <strong>Median</strong> adalah nilai tengah dari data yang telah diurutkan. Karena ada <strong>24 data (genap)</strong>, temukan dua nilai tengah pada nomor urut <strong>#12</strong> dan <strong>#13</strong> dengan bantuan label urutan di bawah bulatan, lalu hitung nilai rata-ratanya. Kamu juga bisa memakai kalkulator di sebelah kanan!
                        </p>
                      </div>

                      <motion.div
                        key={shakeMedian}
                        animate={medianIsCorrect === false ? { x: [-5, 5, -4, 4, 0] } : {}}
                        transition={{ duration: 0.3 }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'clamp(4px, 0.8vw, 8px)' }}
                      >
                        {medianChoices.map(choice => {
                          const isSelected = selectedMedian === choice
                          const isSelectedCorrect = isSelected && medianIsCorrect === true
                          const isSelectedWrong = isSelected && medianIsCorrect === false
                          return (
                            <button
                              key={choice}
                              data-testid={`median-choice-${choice}`}
                              disabled={medianIsCorrect === true}
                              onClick={() => handleChooseMedian(choice)}
                              style={{
                                padding: 'clamp(5px, 0.8vh, 8px) clamp(4px, 0.6vw, 8px)',
                                borderRadius: 'clamp(5px, 0.8vw, 7px)',
                                fontSize: 'clamp(11px, 1.3vw, 13px)',
                                fontWeight: 900,
                                cursor: medianIsCorrect === true ? 'default' : 'pointer',
                                border: isSelectedCorrect
                                  ? '2px solid #059669'
                                  : isSelectedWrong
                                  ? '2px solid #DC2626'
                                  : '1.5px solid #CBD5E1',
                                background: isSelectedCorrect
                                  ? '#D1FAE5'
                                  : isSelectedWrong
                                  ? '#FEE2E2'
                                  : '#F8FAFC',
                                color: isSelectedCorrect ? '#065F46' : isSelectedWrong ? '#991B1B' : '#1E293B',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                transition: 'all 0.15s',
                              }}
                            >
                              {choice} {isSelectedCorrect ? '✓' : isSelectedWrong ? '✕' : ''}
                            </button>
                          )
                        })}
                      </motion.div>

                      {medianIsCorrect === false && (
                        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '5px', padding: 'clamp(4px, 0.6vh, 6px) clamp(6px, 1vw, 10px)', fontSize: 'clamp(9px, 1.1vw, 10.5px)', color: '#991B1B', fontWeight: 700 }}>
                          💡 Belum tepat. Cek angka pada bulatan berlabel urutan #12 dan #13, lalu jumlahkan kedua angka tersebut dan bagi 2.
                        </div>
                      )}

                      {medianIsCorrect === true && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: '#D1FAE5', border: '1.5px solid #059669', borderRadius: '6px', padding: 'clamp(4px, 0.7vh, 7px) clamp(8px, 1.2vw, 12px)', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 'clamp(9.5px, 1.1vw, 11.5px)', fontWeight: 900, color: '#065F46' }}>
                            ✓ Tepat! Median data adalah ({mid1Val} + {mid2Val}) ÷ 2 = {medianVal}.
                          </span>
                          <button
                            data-testid="btn-next-to-mean"
                            onClick={() => {
                              setStage('mean')
                              gameAudio.playClick()
                            }}
                            style={{
                              padding: 'clamp(4px, 0.7vh, 6px) clamp(10px, 1.4vw, 14px)',
                              borderRadius: '5px',
                              border: 'none',
                              background: '#059669',
                              color: '#FFFFFF',
                              fontSize: 'clamp(10px, 1.2vw, 11.5px)',
                              fontWeight: 900,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.35)',
                            }}
                          >
                            Lanjut ke Tahap 4: Rata-Rata →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAHAP 4: RATA-RATA */}
                  {stage === 'mean' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(5px, 0.8vh, 8px)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 900, fontFamily: 'monospace', color: '#FFFFFF', background: '#362014', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                            TAHAP 4 DARI 4
                          </span>
                          <span style={{ fontSize: 'clamp(8px, 1vw, 9px)', fontWeight: 800, color: '#059669', background: 'rgba(5, 150, 105, 0.12)', border: '1px solid rgba(5, 150, 105, 0.35)', padding: '1px 6px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                            RATA-RATA (MEAN)
                          </span>
                        </div>
                        <button
                          data-testid="btn-open-tutorial-mean"
                          onClick={() => {
                            setShowTutorialModal(true)
                            gameAudio.playClick()
                          }}
                          style={{
                            background: 'rgba(5, 150, 105, 0.1)',
                            border: '1px solid rgba(5, 150, 105, 0.35)',
                            color: '#059669',
                            fontSize: 'clamp(8px, 1vw, 9.5px)',
                            fontWeight: 800,
                            cursor: 'pointer',
                            borderRadius: '4px',
                            padding: '1px 7px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <span>💡 Panduan Materi</span>
                        </button>
                      </div>

                      <div>
                        <h4 style={{ margin: '0 0 2px', fontSize: 'clamp(12px, 1.5vw, 14.5px)', fontWeight: 900, color: '#1E1B18' }}>
                          🧮 Hitung Rata-Rata (Mean) dari 24 Data
                        </h4>
                        <p style={{ margin: 0, fontSize: 'clamp(9px, 1.1vw, 11px)', color: '#475569', lineHeight: 1.3 }}>
                          Jumlah seluruh 24 bulatan angka di atas adalah <strong>Σx = {totalSum}</strong>. Bagi jumlah tersebut dengan banyaknya data (<strong>n = 24</strong>): <strong>x̄ = {totalSum} ÷ 24 = ?</strong> Gunakan kalkulator di samping jika perlu!
                        </p>
                      </div>

                      <motion.div
                        key={shakeMean}
                        animate={meanIsCorrect === false ? { x: [-5, 5, -4, 4, 0] } : {}}
                        transition={{ duration: 0.3 }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'clamp(4px, 0.8vw, 8px)' }}
                      >
                        {meanChoices.map(choice => {
                          const isSelected = selectedMean === choice
                          const isSelectedCorrect = isSelected && meanIsCorrect === true
                          const isSelectedWrong = isSelected && meanIsCorrect === false
                          return (
                            <button
                              key={choice}
                              data-testid={`mean-choice-${choice}`}
                              disabled={meanIsCorrect === true}
                              onClick={() => handleChooseMean(choice)}
                              style={{
                                padding: 'clamp(5px, 0.8vh, 8px) clamp(4px, 0.6vw, 8px)',
                                borderRadius: 'clamp(5px, 0.8vw, 7px)',
                                fontSize: 'clamp(11px, 1.3vw, 13px)',
                                fontWeight: 900,
                                cursor: meanIsCorrect === true ? 'default' : 'pointer',
                                border: isSelectedCorrect
                                  ? '2px solid #059669'
                                  : isSelectedWrong
                                  ? '2px solid #DC2626'
                                  : '1.5px solid #CBD5E1',
                                background: isSelectedCorrect
                                  ? '#D1FAE5'
                                  : isSelectedWrong
                                  ? '#FEE2E2'
                                  : '#F8FAFC',
                                color: isSelectedCorrect ? '#065F46' : isSelectedWrong ? '#991B1B' : '#1E293B',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                transition: 'all 0.15s',
                              }}
                            >
                              {choice} {isSelectedCorrect ? '✓' : isSelectedWrong ? '✕' : ''}
                            </button>
                          )
                        })}
                      </motion.div>

                      {meanIsCorrect === false && (
                        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '5px', padding: 'clamp(4px, 0.6vh, 6px) clamp(6px, 1vw, 10px)', fontSize: 'clamp(9px, 1.1vw, 10.5px)', color: '#991B1B', fontWeight: 700 }}>
                          💡 Kurang tepat! Coba hitung {totalSum} ÷ 24 pada kalkulator di sebelah kanan.
                        </div>
                      )}

                      {meanIsCorrect === true && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: '#D1FAE5', border: '1.5px solid #059669', borderRadius: '6px', padding: 'clamp(4px, 0.7vh, 7px) clamp(8px, 1.2vw, 12px)', flexWrap: 'wrap' }}>
                          <div style={{ fontSize: 'clamp(9.5px, 1.1vw, 11.5px)', fontWeight: 900, color: '#065F46' }}>
                            ✓ Lengkap! Modus = {modeVal} • Median = {medianVal} • Rata-rata = {meanVal}
                          </div>
                          <button
                            data-testid="btn-finish-level1-board"
                            onClick={onProceed}
                            style={{
                              padding: 'clamp(4px, 0.7vh, 7px) clamp(10px, 1.4vw, 15px)',
                              borderRadius: '5px',
                              border: 'none',
                              background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                              color: '#FFFFFF',
                              fontSize: 'clamp(10px, 1.2vw, 11.5px)',
                              fontWeight: 900,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.4)',
                            }}
                          >
                            🏆 SELESAIKAN KASUS #01 →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── BAGIAN KANAN (RASIO 1): TOOLBAR (RESET + INFORMASI) + KALKULATOR MEJA ── */}
        <div style={{
          flex: '0 0 clamp(165px, 24vw, 290px)',
          width: 'clamp(165px, 24vw, 290px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'stretch',
          height: '100%',
          minHeight: 0,
          gap: 'clamp(6px, 1.2vh, 12px)',
        }}>
          {/* Top Bar Di Atas Kalkulator: [🔄 Reset Urutan / Reset Jawaban] */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            flexShrink: 0,
          }}>
            <button
              data-testid="btn-reset-sort"
              onClick={handleReset}
              style={{
                width: '100%',
                padding: 'clamp(3px, 0.5vh, 6px) clamp(8px, 1vw, 12px)',
                borderRadius: '6px',
                fontSize: 'clamp(8.5px, 1.1vw, 11px)',
                fontWeight: 800,
                cursor: 'pointer',
                border: '1.5px solid #CBD5E1',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
              }}
              title="Reset pilihan atau susunan pada tahapan ini"
            >
              <span>🔄</span>
              <span>Reset {stage === 'sort' ? 'Urutan Data' : 'Jawaban'}</span>
            </button>
          </div>

          <DeskCalculator dataset={dataset} />
        </div>

      </div>

      {/* ── POPUP SELESAI TAHAP 1: URUTKAN DATA (POPUP DI TENGAH) ── */}
      <AnimatePresence>
        {stage === 'sort' && sortIsCorrect === true && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 750,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'clamp(16px, 3vw, 28px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              data-testid="sort-success-popup"
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 'clamp(320px, 45vw, 460px)',
                background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
                border: '2.5px solid #F59E0B',
                borderRadius: 'clamp(14px, 2vw, 22px)',
                padding: 'clamp(20px, 3vh, 28px) clamp(18px, 2.5vw, 26px)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 'clamp(10px, 1.8vh, 16px)',
                color: '#FEF3C7',
                boxSizing: 'border-box',
              }}
            >
              {/* Decorative Viewfinder Brackets */}
              <div style={{ position: 'absolute', top: '8px', left: '8px', width: '12px', height: '12px', borderTop: '2.5px solid #F59E0B', borderLeft: '2.5px solid #F59E0B', borderRadius: '2px 0 0 0' }} />
              <div style={{ position: 'absolute', top: '8px', right: '8px', width: '12px', height: '12px', borderTop: '2.5px solid #F59E0B', borderRight: '2.5px solid #F59E0B', borderRadius: '0 2px 0 0' }} />
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '12px', height: '12px', borderBottom: '2.5px solid #F59E0B', borderLeft: '2.5px solid #F59E0B', borderRadius: '0 0 0 2px' }} />
              <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '12px', height: '12px', borderBottom: '2.5px solid #F59E0B', borderRight: '2.5px solid #F59E0B', borderRadius: '0 0 2px 0' }} />

              <button
                data-testid="btn-close-sort-success"
                onClick={() => setSortIsCorrect(null)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '12px',
                  background: 'rgba(140, 98, 57, 0.1)',
                  border: '1px solid rgba(140, 98, 57, 0.3)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  color: '#FEF3C7',
                  fontSize: 'clamp(12px, 1.5vw, 15px)',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  transition: 'all 0.15s',
                }}
                title="Tutup popup untuk melihat hasil urutan"
              >
                ✕
              </button>
              <div style={{
                width: 'clamp(50px, 6vw, 64px)',
                height: 'clamp(50px, 6vw, 64px)',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #FEF08A 0%, #F59E0B 100%)',
                border: '2px solid #B45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(26px, 3.2vw, 34px)',
                boxShadow: '0 4px 14px rgba(180, 83, 9, 0.3)',
              }}>
                🎉
              </div>

              <div>
                <div style={{ fontSize: 'clamp(10px, 1.2vw, 11px)', color: '#9A3412', fontWeight: 900, letterSpacing: '1.5px', marginBottom: '4px', textTransform: 'uppercase' }}>
                  URUTAN DATA SELESAI
                </div>
                <h3 style={{
                  margin: '0 0 6px 0',
                  fontSize: 'clamp(18px, 2.4vw, 24px)',
                  fontWeight: 900,
                  color: '#FEF3C7',
                  letterSpacing: '0.3px',
                }}>
                  Hebat Sekali!
                </h3>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid #F59E0B',
                  borderRadius: '12px',
                  padding: 'clamp(10px, 1.5vh, 14px) clamp(12px, 2vw, 16px)',
                  boxShadow: 'inset 0 1px 3px rgba(140, 98, 57, 0.08)',
                  marginTop: '8px',
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: 'clamp(11.5px, 1.35vw, 13.5px)',
                    color: '#FEF3C7',
                    lineHeight: 1.55,
                  }}>
                    Semua <b>24 data</b> berhasil diurutkan dengan benar dari nilai terkecil ke terbesar (<span style={{ color: '#065F46', fontWeight: 800 }}>{sortedDataset[0]}</span> ➔ <span style={{ color: '#065F46', fontWeight: 800 }}>{sortedDataset[23]}</span>).
                  </p>
                </div>
              </div>

              <button
                data-testid="btn-next-to-modus"
                onClick={() => {
                  setStage('modus')
                  gameAudio.playClick()
                }}
                style={{
                  width: '100%',
                  padding: 'clamp(10px, 1.6vh, 14px) clamp(16px, 2vw, 24px)',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: 'clamp(12px, 1.4vw, 15px)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(14, 131, 136, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span>Lanjut ke Tahap 2: Modus</span>
                <span style={{ fontSize: '1.1em' }}>➔</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📘 MODAL PANDUAN TUTORIAL EDUKASI PER TAHAP */}
      <AnimatePresence>
        {showTutorialModal && STAGE_TUTORIALS[stage] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 800,
              background: 'rgba(15, 8, 4, 0.75)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'clamp(10px, 2vh, 20px) clamp(12px, 2vw, 24px)',
              boxSizing: 'border-box',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseTutorial()
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 24, stiffness: 340 }}
              data-testid="stage-tutorial-modal"
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 'clamp(360px, 60vw, 640px)',
                maxHeight: '92vh',
                background: 'linear-gradient(180deg, #FFFDF8 0%, #FAF3E6 100%)',
                border: '2.5px solid #8C6239',
                borderRadius: 'clamp(12px, 1.8vw, 18px)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.3) inset',
                display: 'flex',
                flexDirection: 'column',
                color: '#1E1B18',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              {/* Push Pin Hiasan */}
              <div style={{ position: 'absolute', top: '10px', left: '16px', zIndex: 10 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.68629 2 6 4.68629 6 8C6 11.5 10.5 17 12 18.5C13.5 17 18 11.5 18 8C18 4.68629 15.3137 2 12 2Z" fill="#B45309" />
                  <circle cx="12" cy="8" r="3" fill="#FDE68A" />
                  <line x1="12" y1="18.5" x2="12" y2="23" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Header Modal */}
              <div style={{
                padding: 'clamp(12px, 1.8vh, 18px) clamp(16px, 2.2vw, 24px) clamp(8px, 1.2vh, 12px) clamp(44px, 5vw, 56px)',
                borderBottom: '1.5px solid rgba(140, 98, 57, 0.25)',
                background: 'rgba(140, 98, 57, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                position: 'relative',
              }}>
                {/* Tombol Tutup Silang */}
                <button
                  data-testid="btn-close-tutorial"
                  onClick={handleCloseTutorial}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '14px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    border: '1.5px solid rgba(140, 98, 57, 0.35)',
                    background: '#FFFDF7',
                    color: '#78350F',
                    fontSize: '15px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    transition: 'all 0.15s ease',
                  }}
                  title="Tutup panduan materi"
                >
                  ✕
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 'clamp(8.5px, 1vw, 10px)',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    background: '#362014',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    letterSpacing: '0.5px',
                  }}>
                    TAHAP {STAGE_TUTORIALS[stage].stepNum} DARI 4
                  </span>
                  <span style={{
                    fontSize: 'clamp(8.5px, 1vw, 10px)',
                    fontWeight: 900,
                    color: STAGE_TUTORIALS[stage].badgeColor,
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: `1.5px solid ${STAGE_TUTORIALS[stage].badgeColor}`,
                    padding: '1.5px 8px',
                    borderRadius: '999px',
                  }}>
                    {STAGE_TUTORIALS[stage].tag.toUpperCase()}
                  </span>
                </div>

                <h3 style={{
                  margin: '4px 0 0',
                  fontSize: 'clamp(14px, 1.8vw, 18px)',
                  fontWeight: 900,
                  color: '#27150B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span>{STAGE_TUTORIALS[stage].icon}</span>
                  <span>{STAGE_TUTORIALS[stage].title}</span>
                </h3>
              </div>

              {/* Scrollable Body Modal */}
              <div
                data-testid="stage-tutorial-body"
                className="corkboard-scroll-area"
                style={{
                  padding: 'clamp(12px, 1.8vh, 18px) clamp(16px, 2.2vw, 24px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(10px, 1.5vh, 14px)',
                  overflowY: 'auto',
                  maxHeight: 'calc(92vh - 130px)',
                  boxSizing: 'border-box',
                }}
              >
                {/* Card 1: Konsep Inti */}
                <div style={{
                  background: '#FFFFFF',
                  border: '1.5px solid rgba(140, 98, 57, 0.28)',
                  borderRadius: '10px',
                  padding: 'clamp(10px, 1.5vh, 14px)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}>
                  <h4 style={{
                    margin: '0 0 6px',
                    fontSize: 'clamp(11px, 1.3vw, 13px)',
                    fontWeight: 900,
                    color: '#362014',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <span>📖</span>
                    <span>{STAGE_TUTORIALS[stage].conceptHeading}</span>
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: 'clamp(9.5px, 1.15vw, 12px)',
                    color: '#475569',
                    lineHeight: 1.5,
                  }}>
                    {STAGE_TUTORIALS[stage].conceptText}
                  </p>
                </div>

                {/* Card 2: Rumus / Prinsip Matematis (jika ada) */}
                {STAGE_TUTORIALS[stage].formula && (
                  <div style={{
                    background: 'linear-gradient(180deg, #1E1B18 0%, #2A2420 100%)',
                    border: '2px solid #B48C50',
                    borderRadius: '10px',
                    padding: 'clamp(10px, 1.5vh, 14px)',
                    color: '#FEF3C7',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  }}>
                    <div style={{
                      fontSize: 'clamp(8.5px, 1vw, 10.5px)',
                      fontWeight: 900,
                      color: '#FDE68A',
                      letterSpacing: '0.5px',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}>
                      <span>📐</span>
                      <span>{STAGE_TUTORIALS[stage].formula.title}</span>
                    </div>
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: '1px dashed rgba(253, 230, 138, 0.4)',
                      borderRadius: '6px',
                      padding: 'clamp(6px, 1vh, 8px) 12px',
                      fontFamily: 'monospace',
                      fontSize: 'clamp(11.5px, 1.4vw, 14.5px)',
                      fontWeight: 900,
                      color: '#86EFAC',
                      textAlign: 'center',
                      margin: '6px 0',
                      letterSpacing: '0.4px',
                    }}>
                      {STAGE_TUTORIALS[stage].formula.equation}
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: 'clamp(9px, 1.1vw, 11px)',
                      color: '#E2E8F0',
                      lineHeight: 1.4,
                    }}>
                      {STAGE_TUTORIALS[stage].formula.explanation}
                    </p>
                  </div>
                )}

                {/* Card 3: Contoh Langsung (Format Papan Tugas Utama Investigasi) */}
                {(() => {
                  const currentStage = STAGE_TUTORIALS[stage]
                  const exampleList: TutorialExampleItem[] = currentStage.examples && currentStage.examples.length > 0
                    ? currentStage.examples
                    : currentStage.example
                    ? [currentStage.example]
                    : []

                  if (exampleList.length === 0) return null

                  return (
                    <div style={{
                      background: 'linear-gradient(180deg, #FFFDF8 0%, #FAF3E6 100%)',
                      border: '1.5px solid rgba(140, 98, 57, 0.45)',
                      borderRadius: '10px',
                      padding: 'clamp(10px, 1.5vh, 14px)',
                      boxShadow: '0 3px 10px rgba(54, 32, 20, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}>
                      <div style={{
                        fontSize: 'clamp(11px, 1.3vw, 13px)',
                        fontWeight: 900,
                        color: '#362014',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>💡</span>
                          <span>Simulasi Investigasi ({exampleList.length > 1 ? `${exampleList.length} Kasus: Data Ganjil & Genap` : 'Sampel Terurut'}):</span>
                        </div>
                        {exampleList.length > 1 && (
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 900,
                            color: '#78350F',
                            background: '#FEF3C7',
                            border: '1px solid #D97706',
                            padding: '1px 8px',
                            borderRadius: '999px',
                            letterSpacing: '0.4px',
                          }}>
                            LENGKAP
                          </span>
                        )}
                      </div>

                      {exampleList.map((ex, exIdx) => (
                        <div key={exIdx} style={{
                          background: '#FFFDF9',
                          border: '1.5px solid rgba(140, 98, 57, 0.35)',
                          borderRadius: '8px',
                          padding: 'clamp(8px, 1.2vh, 12px) clamp(10px, 1.4vw, 14px)',
                          boxShadow: '0 2px 6px rgba(54, 32, 20, 0.05)',
                        }}>
                          {/* Sub-card Title */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '6px',
                            flexWrap: 'wrap',
                            gap: '4px',
                          }}>
                            <span style={{
                              fontSize: 'clamp(10.5px, 1.25vw, 12.5px)',
                              fontWeight: 900,
                              color: '#27150B',
                            }}>
                              {ex.title}
                            </span>
                            {ex.badgeNote && (
                              <span style={{
                                fontSize: '8.5px',
                                fontWeight: 900,
                                color: '#FEF3C7',
                                background: '#362014',
                                border: '1px solid #8C6239',
                                padding: '1px 7px',
                                borderRadius: '4px',
                                letterSpacing: '0.3px',
                              }}>
                                {ex.badgeNote}
                              </span>
                            )}
                          </div>

                          {/* Visualisasi Angka: Persis Format Koin Token Bulat di Tugas Utama */}
                          {ex.visualNumbers && ex.visualNumbers.length > 0 ? (
                            <div style={{
                              background: 'rgba(54, 32, 20, 0.08)',
                              border: '1.5px dashed rgba(140, 98, 57, 0.5)',
                              borderRadius: '8px',
                              padding: '8px 10px',
                              margin: '6px 0 8px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: 'inset 0 1px 3px rgba(54, 32, 20, 0.1)',
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 'clamp(6px, 1vw, 10px)',
                                flexWrap: 'wrap',
                              }}>
                                {ex.visualNumbers.map((num, nIdx) => (
                                  <div key={nIdx} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '3px',
                                  }}>
                                    {/* Koin Bulat 3D Persis Data Tugas Utama Game */}
                                    <div style={{
                                      width: 'clamp(26px, 3.2vw, 32px)',
                                      height: 'clamp(26px, 3.2vw, 32px)',
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: 'clamp(11px, 1.3vw, 13.5px)',
                                      fontWeight: 900,
                                      fontFamily: 'var(--font-data)',
                                      background: num.isCenter
                                        ? 'radial-gradient(circle at 35% 30%, #FEF08A 0%, #F59E0B 100%)'
                                        : num.isMode
                                        ? 'radial-gradient(circle at 35% 30%, #BAE6FD 0%, #0284C7 100%)'
                                        : 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #F5EFE6 75%, #E2D5C1 100%)',
                                      color: num.isCenter ? '#451A03' : num.isMode ? '#FFFFFF' : '#1E1B18',
                                      border: num.isCenter
                                        ? '2px solid #B45309'
                                        : num.isMode
                                        ? '2px solid #0369A1'
                                        : '2px solid #5C4033',
                                      boxShadow: num.isCenter
                                        ? '0 0 10px rgba(245, 158, 11, 0.75), 0 2px 4px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.9)'
                                        : num.isMode
                                        ? '0 0 10px rgba(2, 132, 199, 0.65), 0 2px 4px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.9)'
                                        : '0 2px 4px rgba(0,0,0,0.22), inset 0 1px 1px rgba(255,255,255,0.85)',
                                      transform: (num.isCenter || num.isMode) ? 'scale(1.12)' : 'scale(1)',
                                      transition: 'all 0.15s ease',
                                    }}>
                                      {num.val}
                                    </div>
                                    {/* Badge Indikator Posisi / Frekuensi (Mirip label #12 & #13 di tugas utama) */}
                                    {num.subLabel && (
                                      <span style={{
                                        fontSize: 'clamp(7px, 0.85vw, 8.5px)',
                                        fontWeight: 900,
                                        color: '#FEF3C7',
                                        background: num.isCenter ? '#78350F' : num.isMode ? '#075985' : '#475569',
                                        padding: '0px 4px',
                                        borderRadius: '3px',
                                        textAlign: 'center',
                                        whiteSpace: 'nowrap',
                                        lineHeight: 1.2,
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                      }}>
                                        {num.subLabel}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {ex.bracketNote && (
                                <div style={{
                                  fontSize: 'clamp(8px, 1vw, 9.5px)',
                                  fontWeight: 800,
                                  color: '#78350F',
                                  background: '#FEF3C7',
                                  padding: '2px 10px',
                                  borderRadius: '999px',
                                  marginTop: '2px',
                                  border: '1px solid #F59E0B',
                                  textAlign: 'center',
                                }}>
                                  {ex.bracketNote.centerLabel || `${ex.bracketNote.leftCount} data kiri ↔ ${ex.bracketNote.rightCount} data kanan`}
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Fallback Sampel Data Text */
                            <div style={{
                              background: '#FDF6E2',
                              border: '1px solid #D97706',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: 'clamp(9px, 1.1vw, 11px)',
                              fontWeight: 800,
                              color: '#78350F',
                              fontFamily: 'monospace',
                              marginBottom: '6px',
                              display: 'inline-block',
                            }}>
                              {ex.sampleData}
                            </div>
                          )}

                          {/* Langkah-langkah Analisis */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', margin: '5px 0 8px' }}>
                            {ex.steps.map((st, sIdx) => (
                              <div key={sIdx} style={{
                                fontSize: 'clamp(8.5px, 1.05vw, 11px)',
                                color: '#334155',
                                lineHeight: 1.45,
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '6px',
                              }}>
                                <span style={{ color: '#B45309', fontWeight: 900, flexShrink: 0 }}>•</span>
                                <span>{st}</span>
                              </div>
                            ))}
                          </div>

                          {/* Hasil Akhir Putusan Detektif */}
                          <div style={{
                            background: 'linear-gradient(135deg, #2D1A12 0%, #1A0D08 100%)',
                            border: '1.5px solid #8C6239',
                            color: '#FEF3C7',
                            padding: '5px 12px',
                            borderRadius: '6px',
                            fontSize: 'clamp(9px, 1.1vw, 11.5px)',
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(45, 26, 18, 0.35)',
                          }}>
                            <span>🎯</span>
                            <span style={{ color: '#FDE68A' }}>{ex.resultHighlight}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}

                {/* Card 4: Cara Pengerjaan di Game */}
                <div style={{
                  background: '#FFFFFF',
                  border: '1.5px solid rgba(140, 98, 57, 0.28)',
                  borderRadius: '10px',
                  padding: 'clamp(10px, 1.5vh, 14px)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}>
                  <h4 style={{
                    margin: '0 0 8px',
                    fontSize: 'clamp(11px, 1.3vw, 13px)',
                    fontWeight: 900,
                    color: '#362014',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <span>🎮</span>
                    <span>Langkah Pengerjaan di Game:</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {STAGE_TUTORIALS[stage].howToSteps.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#362014',
                          color: '#FEF3C7',
                          fontSize: '10px',
                          fontWeight: 900,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '1px',
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{
                          fontSize: 'clamp(9.5px, 1.15vw, 12px)',
                          color: '#334155',
                          lineHeight: 1.45,
                        }}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 4: Tips Detektif Statistik */}
                <div style={{
                  background: 'linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%)',
                  border: '1.5px solid #F59E0B',
                  borderRadius: '10px',
                  padding: 'clamp(8px, 1.3vh, 12px) 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)',
                }}>
                  <span style={{ fontSize: 'clamp(16px, 2vw, 20px)', flexShrink: 0, marginTop: '1px' }}>💡</span>
                  <div>
                    <div style={{ fontSize: 'clamp(9px, 1.1vw, 11px)', fontWeight: 900, color: '#92400E', marginBottom: '2px' }}>
                      TIPS DETEKTIF STATISTIK:
                    </div>
                    <p style={{ margin: 0, fontSize: 'clamp(9px, 1.1vw, 11px)', color: '#78350F', lineHeight: 1.4, fontWeight: 600 }}>
                      {STAGE_TUTORIALS[stage].proTip}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Modal: Tombol Paham / Mulai */}
              <div style={{
                padding: 'clamp(10px, 1.5vh, 14px) clamp(16px, 2.2vw, 24px)',
                borderTop: '1.5px solid rgba(140, 98, 57, 0.25)',
                background: 'rgba(140, 98, 57, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 'clamp(8.5px, 1vw, 10.5px)', color: '#78350F', fontWeight: 700 }}>
                  Kamu bisa membuka panduan ini lagi kapan saja via tombol 💡 di atas.
                </span>
                <button
                  data-testid="btn-confirm-tutorial"
                  onClick={handleCloseTutorial}
                  style={{
                    padding: 'clamp(8px, 1.2vh, 12px) clamp(16px, 2.2vw, 24px)',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    border: '1.5px solid #34D399',
                    color: '#FFFFFF',
                    fontSize: 'clamp(11px, 1.3vw, 13px)',
                    fontWeight: 900,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'transform 0.1s, box-shadow 0.1s',
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span>🚀</span>
                  <span>Paham, Mulai Mengerjakan!</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}


// ── MODAL POPUP MISI SELESAI (BINTANG 1-3 BERDASARKAN DURASI & PERFORMA) ──
function MissionCompleteModal({
  stars,
  elapsedSeconds,
  mistakeCount: _mistakeCount,
  onFinish,
}: {
  stars: number
  elapsedSeconds: number
  mistakeCount?: number
  onFinish: () => void
}) {
  const minutes = Math.floor(elapsedSeconds / 60)
  const seconds = elapsedSeconds % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const ratingInfo = useMemo(() => {
    if (stars === 3) {
      return {
        title: '⭐⭐⭐ Detektif Elit!',
        subtitle: 'Luar biasa! Analisis statistik tuntas sangat cepat dalam durasi < 6 menit.',
        color: '#D97706',
        badgeBg: 'rgba(245, 158, 11, 0.15)',
        badgeBorder: 'rgba(245, 158, 11, 0.4)',
      }
    }
    if (stars === 2) {
      return {
        title: '⭐⭐ Detektif Terlatih!',
        subtitle: 'Bagus sekali! Investigasi selesai dengan cermat & tepat sasaran (durasi 6 - 10 menit).',
        color: '#2563EB',
        badgeBg: 'rgba(37, 99, 235, 0.12)',
        badgeBorder: 'rgba(37, 99, 235, 0.35)',
      }
    }
    return {
      title: '⭐ Detektif Pemula!',
      subtitle: 'Misi terselesaikan! Terus berlatih untuk mempercepat analisis datamu (> 10 menit).',
      color: '#059669',
      badgeBg: 'rgba(5, 150, 105, 0.12)',
      badgeBorder: 'rgba(5, 150, 105, 0.35)',
    }
  }, [stars])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(10, 20, 30, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        userSelect: 'none',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -15 }}
        transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'linear-gradient(180deg, #FFFDF8 0%, #FDF7EA 100%)',
          border: '2.5px solid #8C6239',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
          padding: 'clamp(20px, 3vh, 28px) clamp(18px, 2.5vw, 26px)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          color: '#2D1A12',
          fontFamily: 'var(--font-ui, sans-serif)',
        }}
      >
        {/* Ornate Brass Corners */}
        <div style={{ position: 'absolute', top: 6, left: 6, width: 14, height: 14, borderTop: '2.5px solid #8C6239', borderLeft: '2.5px solid #8C6239', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 6, right: 6, width: 14, height: 14, borderTop: '2.5px solid #8C6239', borderRight: '2.5px solid #8C6239', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 6, left: 6, width: 14, height: 14, borderBottom: '2.5px solid #8C6239', borderLeft: '2.5px solid #8C6239', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 6, right: 6, width: 14, height: 14, borderBottom: '2.5px solid #8C6239', borderRight: '2.5px solid #8C6239', pointerEvents: 'none' }} />

        {/* Top Tag */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '50px', padding: '3px 14px', fontSize: '11px', fontWeight: 900, color: '#B45309', letterSpacing: '0.5px', marginBottom: '8px' }}>
          <span>🏆</span>
          <span>MISI LEVEL 1 SELESAI</span>
        </div>

        {/* Modal Title */}
        <h2 style={{ margin: '4px 0 2px', fontSize: 'clamp(24px, 3.5vh, 28px)', fontWeight: 900, color: '#3E2723', letterSpacing: '-0.5px' }}>
          Misi Selesai
        </h2>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#78350F', marginBottom: '14px' }}>
          Analisis Ukuran Pemusatan Data • SMP Negeri
        </div>

        {/* 3 Large Animated Stars Container */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          margin: '10px 0 12px',
          padding: '10px 0',
          background: 'radial-gradient(ellipse at center, rgba(254, 243, 199, 0.7) 0%, rgba(254, 243, 199, 0) 70%)',
        }}>
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stars
            return (
              <motion.div
                key={starIdx}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.15 + starIdx * 0.18,
                  type: 'spring',
                  stiffness: 450,
                  damping: 18,
                }}
                style={{
                  fontSize: starIdx === 2 ? 'clamp(52px, 7.5vh, 60px)' : 'clamp(42px, 6vh, 48px)',
                  lineHeight: 1,
                  filter: isEarned ? 'drop-shadow(0 4px 10px rgba(245, 158, 11, 0.6))' : 'none',
                  color: isEarned ? '#F59E0B' : 'rgba(140, 98, 57, 0.22)',
                  transition: 'all 0.2s ease',
                }}
              >
                ★
              </motion.div>
            )
          })}
        </div>

        {/* Star Rating Info Pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{
            background: ratingInfo.badgeBg,
            border: `1.5px solid ${ratingInfo.badgeBorder}`,
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 900, color: ratingInfo.color, marginBottom: '3px' }}>
            {ratingInfo.title}
          </div>
          <div style={{ fontSize: '11.5px', color: '#573016', lineHeight: 1.4, fontWeight: 600 }}>
            {ratingInfo.subtitle}
          </div>
        </motion.div>

        {/* Performance Statistic: Waktu Penyelesaian */}
        <div style={{
          background: '#FFFDF9',
          border: '1.5px solid #D6C29E',
          borderRadius: '12px',
          padding: '11px 18px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 6px rgba(140, 98, 57, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
            <span style={{ fontSize: '24px' }}>⏱️</span>
            <div>
              <div style={{ fontSize: '10.5px', color: '#8C6239', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Waktu Penyelesaian
              </div>
              <div style={{ fontSize: '11px', color: '#92400E', fontWeight: 700 }}>
                {stars === 3 ? 'Kategori Cepat (< 06:00)' : stars === 2 ? 'Kategori Standar (06:00 - 10:00)' : 'Kategori Santai (> 10:00)'}
              </div>
            </div>
          </div>
          <div style={{
            fontSize: '22px',
            fontWeight: 900,
            color: '#3E2723',
            fontFamily: 'var(--font-mono, monospace)',
            background: 'rgba(245, 158, 11, 0.12)',
            padding: '4px 14px',
            borderRadius: '8px',
            border: '1.5px solid rgba(245, 158, 11, 0.35)',
          }}>
            {formattedTime}
          </div>
        </div>

        {/* Result Status Badge */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1.5px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '10px',
          padding: '8px 12px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          <span style={{ fontSize: '14px', color: '#059669' }}>✓</span>
          <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#065F46' }}>
            HASIL: Perhitungan Median, Modus, dan Rata-rata <strong>Lengkap & Siap Digunakan</strong>
          </span>
        </div>

        {/* Primary Action Button: Selesai */}
        <button
          data-testid="btn-mission-complete-finish"
          onClick={() => {
            gameAudio.playClick()
            onFinish()
          }}
          style={{
            width: '100%',
            padding: '13px 24px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(180deg, #059669 0%, #047857 100%)',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)' }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          <span>Selesai</span>
          <span style={{ fontSize: '16px' }}>→</span>
        </button>
      </motion.div>
    </div>
  )
}

export default function NPath({ onComplete, isFD = true, demoMode = false, demoStep = null }: { onComplete: (starsEarned?: number) => void; isFD?: boolean; demoMode?: boolean; demoStep?: string | null }) {
  const level1Dataset = useGameStore(s => s.level1Dataset)
  const sessionStartTime = useGameStore(s => s.sessionStartTime)
  const mistakeCount = useGameStore(s => s.mistakeCount)
  const incrementMistake = useGameStore(s => s.incrementMistake)
  const [showMissionCompleteModal, setShowMissionCompleteModal] = useState(false)
  const [earnedStarsState, setEarnedStarsState] = useState(3)
  const [elapsedSecondsState, setElapsedSecondsState] = useState(0)

  useEffect(() => {
    if (!level1Dataset || level1Dataset.length !== 24) {
      useGameStore.setState({ level1Dataset: generateRandomLevel1Data() })
    }
  }, [level1Dataset])

  const activeDataset = useMemo(() => {
    return (level1Dataset && level1Dataset.length === 24) ? level1Dataset : screenTimeData
  }, [level1Dataset])

  const doors = useMemo(() => getClassDoors(activeDataset), [activeDataset])
  const currentClassStudents = useMemo(() => getClassStudents(activeDataset), [activeDataset])

  const [isLoadingAssets, setIsLoadingAssets] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('preloaded') === 'true') return false
    }
    return true
  })
  const isDemoExploration = demoMode && (demoStep === 'exploration' || demoStep === 'interval' || demoStep === 'histogram')
  const [charPos, setCharPos] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('zone') === 'gate') return { x: 615, y: 575 }
      if (p.get('spawn') === 'rg') return { x: 618, y: 400 }
    }
    return isDemoExploration ? { x: 180, y: 585 } : { x: 615, y: 575 }
  })
  const [cinematicStage, setCinematicStage] = useState<'gate_intro' | 'player_intro' | 'panning_to_pak' | 'pak_shouting' | 'pak_shouting_2' | 'panning_to_player' | 'quest_meet_pak' | 'pak_sanction_1' | 'pak_sanction_2' | 'pak_sanction_3' | 'player_reply_pak' | 'sanction_received'>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      const forcedCinematic = p.get('cinematic')
      if (forcedCinematic) return forcedCinematic as any
      if (p.get('zone') === 'gate') return 'gate_intro'
    }
    return isDemoExploration ? 'sanction_received' : 'gate_intro'
  })
  const cinematicStageRef = useRef(cinematicStage)
  cinematicStageRef.current = cinematicStage

  const [showPakSanctionModal, setShowPakSanctionModal] = useState(false)
  const [showPakReportModal, setShowPakReportModal] = useState(false)
  const smoothCamPos = useRef(
    (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('zone') === 'gate')
      ? { x: 615, y: 575 }
      : (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('spawn') === 'rg')
      ? { x: 618, y: 400 }
      : isDemoExploration ? { x: 180, y: 585 } : { x: 615, y: 575 }
  )
  const [unlocked, setUnlocked] = useState<Set<string>>(() => {
    return new Set(['A', 'B', 'RG', 'A1', 'A2', 'B1', 'B2'])
  })
  const [savedClasses, setSavedClasses] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('demoData') === 'full') {
        return new Set(['A1', 'A2', 'B1', 'B2'])
      }
    }
    return new Set()
  })
  const [justCompletedClassId, setJustCompletedClassId] = useState<string | null>(null)
  const [activeDoor, setActiveDoor] = useState<typeof DOORS[number] | null>(null)
  const [nearDoor, setNearDoor] = useState<typeof DOORS[number] | null>(null)
  const [activeClass, setActiveClass] = useState<QuizDoor | null>(null)
  const [nearClass, setNearClass] = useState<QuizDoor | null>(null)
  const [insideRoom, setInsideRoom] = useState<QuizDoor | null>(null)
  const insideRoomR = useRef(insideRoom); insideRoomR.current = insideRoom
  const lastHallwayPosRef = useRef<{ x: number; y: number }>({ x: 650, y: 550 })
  const [visitedRooms, setVisitedRooms] = useState<Set<DoorId>>(new Set())
  const [showWaliKelasPopup, setShowWaliKelasPopup] = useState<QuizDoor | null>(null)
  const [teacherCutsceneStage, setTeacherCutsceneStage] = useState<'anim_wait' | 'teacher_ask' | 'player_explain' | 'teacher_reply' | 'post_stevunt_report' | 'post_pak_thanks' | 'post_pak_quiz' | 'post_conclusion' | null>(null)
  const [sutrisnoQuiz, setSutrisnoQuiz] = useState<SutrisnoClaimQuiz | null>(null)
  const [sutrisnoQuizWrong, setSutrisnoQuizWrong] = useState(false)
  const [sutrisnoWrongCount, setSutrisnoWrongCount] = useState(0)
  const teacherCutsceneStageRef = useRef(teacherCutsceneStage)
  teacherCutsceneStageRef.current = teacherCutsceneStage
  const teacherTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ── Multi-Zone State (Zona 0: Gerbang, Zona 1: Kelas, Zona 2: Fasilitas) ──
  const [currentZone, setCurrentZone] = useState<'gate' | 'main' | 'facility'>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      const forcedZone = p.get('zone')
      if (forcedZone === 'main' || forcedZone === 'facility' || forcedZone === 'gate') return forcedZone
    }
    return isDemoExploration ? 'main' : 'gate'
  })
  const currentZoneR = useRef(currentZone); currentZoneR.current = currentZone
  const [gateBubbleStep, setGateBubbleStep] = useState(0)
  const [satpamChatStage, setSatpamChatStage] = useState<SatpamChatStage>('idle')
  const satpamChatStageR = useRef(satpamChatStage); satpamChatStageR.current = satpamChatStage
  const [satpamQuiz, setSatpamQuiz] = useState<SatpamTimeQuiz>(() => generateSatpamTimeQuiz())
  const satpamQuizR = useRef(satpamQuiz); satpamQuizR.current = satpamQuiz
  const [satpamWrongCount, setSatpamWrongCount] = useState(0)
  const [satpamTeaseText, setSatpamTeaseText] = useState<string>(SATPAM_WRONG_TEASES[0])
  const [hasPassedSatpamQuiz, setHasPassedSatpamQuiz] = useState(false)
  const hasPassedSatpamQuizR = useRef(hasPassedSatpamQuiz); hasPassedSatpamQuizR.current = hasPassedSatpamQuiz
  const [activeFacility, setActiveFacility] = useState<FacilityDoor | null>(null)
  const activeFacilityR = useRef(activeFacility); activeFacilityR.current = activeFacility
  const [nearFacility, setNearFacility] = useState<FacilityDoor | null>(null)
  const nearFacilityR = useRef(nearFacility); nearFacilityR.current = nearFacility
  const [zoneTransitionPrompt, setZoneTransitionPrompt] = useState<'to_facility' | 'to_main' | null>(null)

  // ── Screen Fade Transition State (Layar Gelap -> Jeda -> Terang Kembali) ──
  const [screenFade, setScreenFade] = useState<'idle' | 'out' | 'blackout' | 'in'>('idle')
  const isTransitioningRef = useRef(false)

  // Facility Room Learning Hotspot Modals & Proximity States
  const [showLibraryBookModal, setShowLibraryBookModal] = useState(false)
  const showLibraryBookModalR = useRef(showLibraryBookModal); showLibraryBookModalR.current = showLibraryBookModal
  const [showLabTerminalModal, setShowLabTerminalModal] = useState(false)
  const showLabTerminalModalR = useRef(showLabTerminalModal); showLabTerminalModalR.current = showLabTerminalModal
  const [nearLibraryShelf, setNearLibraryShelf] = useState(false)
  const nearLibraryShelfR = useRef(nearLibraryShelf); nearLibraryShelfR.current = nearLibraryShelf
  const [nearLabTerminal, setNearLabTerminal] = useState(false)
  const nearLabTerminalR = useRef(nearLabTerminal); nearLabTerminalR.current = nearLabTerminal

  // ── Cat Quest Mini-Game States ──
  const [catTargetClassId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      const forced = p.get('catClass')
      if (forced && ['A1', 'A2', 'B1', 'B2'].includes(forced)) return forced
    }
    const eligibleIds = ['A1', 'A2', 'B1', 'B2']
    return eligibleIds[Math.floor(Math.random() * eligibleIds.length)]
  })
  const catTargetClassIdR = useRef(catTargetClassId); catTargetClassIdR.current = catTargetClassId
  const [catQuestStage, setCatQuestStage] = useState<CatQuestStage>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      const stageParam = p.get('catStage') as CatQuestStage
      if (['untriggered', 'cat_spawned', 'quest_active', 'kitten_rescued', 'completed'].includes(stageParam)) {
        return stageParam
      }
    }
    return 'untriggered'
  })
  const catQuestStageR = useRef(catQuestStage); catQuestStageR.current = catQuestStage
  const [motherCatPos, setMotherCatPos] = useState<{ x: number; y: number; classLabel: string; classId?: string }>({ x: 380, y: 550, classLabel: 'Kelas VII-A', classId: 'A1' })
  const motherCatPosR = useRef(motherCatPos); motherCatPosR.current = motherCatPos
  const [kittenLocation, setKittenLocation] = useState<{ zone: string; x: number; y: number; label: string }>(KITTEN_SPAWN_SPOTS[0])
  const kittenLocationR = useRef(kittenLocation); kittenLocationR.current = kittenLocation
  const [nearMotherCat, setNearMotherCat] = useState(false)
  const nearMotherCatR = useRef(nearMotherCat); nearMotherCatR.current = nearMotherCat
  const [nearKitten, setNearKitten] = useState(false)
  const nearKittenR = useRef(nearKitten); nearKittenR.current = nearKitten
  const [showMotherCatModal, setShowMotherCatModal] = useState(false)
  const showMotherCatModalR = useRef(showMotherCatModal); showMotherCatModalR.current = showMotherCatModal
  const [showKittenRescueModal, setShowKittenRescueModal] = useState(false)
  const showKittenRescueModalR = useRef(showKittenRescueModal); showKittenRescueModalR.current = showKittenRescueModal

  const dirRef = useRef({ x: 0, y: 0 })
  const pressedKeysRef = useRef<Set<string>>(new Set())

  const resetMovement = useCallback(() => {
    pressedKeysRef.current.clear()
    dirRef.current = { x: 0, y: 0 }
    setMoveDir(prev => (prev.x === 0 && prev.y === 0 ? prev : { x: 0, y: 0 }))
  }, [])

  const enterFacilityRoom = useCallback((fac: FacilityDoor) => {
    if (!fac.roomId) return
    gameAudio.playDoorOpen()
    resetMovement()
    lastHallwayPosRef.current = { x: fac.x, y: fac.y + 20 }
    setInsideRoom({
      id: fac.roomId,
      label: fac.label,
      color: fac.color,
      x: fac.x,
      y: fac.y,
      roomId: fac.roomId as any,
      quizQ: '',
      quizA: '',
      hint: '',
      count: 0
    })
    setCharPos(LEVEL1_MAPS[fac.roomId]?.spawn || { x: 1050, y: 510 })
  }, [resetMovement])

  const triggerFadeTransition = useCallback((onMidpoint: () => void, onComplete?: () => void) => {
    if (isTransitioningRef.current) return
    isTransitioningRef.current = true
    resetMovement()
    setScreenFade('out')

    setTimeout(() => {
      setScreenFade('blackout')
      onMidpoint()

      // Jeda di layar gelap (250ms) sebelum terang kembali
      setTimeout(() => {
        setScreenFade('in')

        setTimeout(() => {
          setScreenFade('idle')
          isTransitioningRef.current = false
          if (onComplete) onComplete()
        }, 400)
      }, 250)
    }, 400)
  }, [resetMovement])

  const goToFacilityZone = useCallback(() => {
    const isTaskGiven = cinematicStageRef.current === 'sanction_received' || demoMode || collectedR.current.size > 0 || savedClassesR.current.size > 0
    if (currentZoneR.current === 'main' && !isTaskGiven) {
      gameAudio.playError()
      setRgLockedToast('🔒 Area Fasilitas belum dibuka! Jumpai Pak Sutrisno di depan Ruang Guru terlebih dahulu untuk melapor.')
      setTimeout(() => setRgLockedToast(null), 2500)
      return
    }
    triggerFadeTransition(() => {
      gameAudio.playDoorOpen()
      resetMovement()
      setCurrentZone('facility')
      setCharPos({ x: 625, y: 550 })
      smoothCamPos.current = { x: 625, y: 550 }
      setZoneTransitionPrompt(null)
    })
  }, [triggerFadeTransition, resetMovement, demoMode])

  const goToMainZone = useCallback(() => {
    triggerFadeTransition(() => {
      gameAudio.playDoorOpen()
      resetMovement()
      setCurrentZone('main')
      setCharPos({ x: 625, y: 575 })
      smoothCamPos.current = { x: 625, y: 575 }
      setZoneTransitionPrompt(null)
    })
  }, [triggerFadeTransition, resetMovement])

  const enterSchoolFromGate = useCallback(() => {
    triggerFadeTransition(() => {
      gameAudio.playDoorOpen()
      resetMovement()
      setSatpamChatStage('idle')
      satpamChatStageR.current = 'idle'
      setCurrentZone('main')
      // Stevunt tiba di halaman utama depan gerbang dalam
      const spawnX = 480
      const spawnY = 560
      setCharPos({ x: spawnX, y: spawnY })
      smoothCamPos.current = { x: spawnX, y: spawnY }
      if (cinematicStageRef.current === 'gate_intro') {
        setCinematicStage('player_intro')
      }
    })
  }, [triggerFadeTransition, resetMovement])

  const attemptEnterSchoolFromGate = useCallback(() => {
    if (!hasPassedSatpamQuizR.current) {
      resetMovement()
      setGateBubbleStep(prev => (prev === 2 ? prev : 2))
      if (satpamChatStageR.current === 'idle') {
        satpamChatStageR.current = 'pak_stop_1'
        gameAudio.playDoorOpen()
        setSatpamChatStage('pak_stop_1')
      }
      return
    }
    enterSchoolFromGate()
  }, [enterSchoolFromGate, resetMovement])

  const advanceSatpamChat = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const st = satpamChatStageR.current
    if (st === 'pak_stop_1') {
      satpamChatStageR.current = 'player_excuse_1'
      setSatpamChatStage('player_excuse_1')
    } else if (st === 'player_excuse_1') {
      satpamChatStageR.current = 'pak_stop_2'
      setSatpamChatStage('pak_stop_2')
    } else if (st === 'pak_stop_2') {
      satpamChatStageR.current = 'pak_quiz'
      setSatpamChatStage('pak_quiz')
    } else if (st === 'pak_wrong') {
      setSatpamQuiz(prev => {
        const nextQ = generateSatpamTimeQuiz(prev.templateIdx)
        satpamQuizR.current = nextQ
        return nextQ
      })
      satpamChatStageR.current = 'pak_quiz'
      setSatpamChatStage('pak_quiz')
    } else if (st === 'pak_pass_1') {
      satpamChatStageR.current = 'pak_pass_2'
      setSatpamChatStage('pak_pass_2')
    } else if (st === 'pak_pass_2') {
      satpamChatStageR.current = 'player_thanks'
      setSatpamChatStage('player_thanks')
    } else if (st === 'player_thanks') {
      satpamChatStageR.current = 'idle'
      setSatpamChatStage('idle')
      enterSchoolFromGate()
    }
  }, [enterSchoolFromGate])

  const handleSelectSatpamOption = useCallback((idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (satpamChatStageR.current !== 'pak_quiz') return
    if (idx === satpamQuizR.current.correctIndex) {
      gameAudio.playSuccess()
      setHasPassedSatpamQuiz(true)
      hasPassedSatpamQuizR.current = true
      satpamChatStageR.current = 'pak_pass_1'
      setSatpamChatStage('pak_pass_1')
    } else {
      gameAudio.playError()
      setSatpamWrongCount(prev => {
        const next = prev + 1
        setSatpamTeaseText(SATPAM_WRONG_TEASES[(next - 1) % SATPAM_WRONG_TEASES.length])
        return next
      })
      satpamChatStageR.current = 'pak_wrong'
      setSatpamChatStage('pak_wrong')
    }
  }, [])

  const [playerName, setPlayerName] = useState('kamu')
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('student')
      if (localData) {
        try {
          const parsed = JSON.parse(localData)
          if (parsed?.name && parsed.name !== 'Detektif') {
            setPlayerName(parsed.name)
          }
        } catch (e) {}
      }
    }
  }, [])
  const isGateZone = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('zone') === 'gate'
  const [collected, setCollected] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('demoData') === 'full') {
        const fullSet = new Set<string>()
        const demoClassIds = ['A1', 'A2', 'B1', 'B2']
        const classCircles = DATA_CIRCLES.filter(c => demoClassIds.includes(c.classId))
        classCircles.forEach(c => fullSet.add(c.id))
        return fullSet
      }
    }
    if (demoMode && demoStep !== 'exploration' && !isGateZone) {
      const initialSet = new Set<string>()
      const demoClassIds = ['A1', 'A2', 'B1', 'B2']
      const classCircles = DATA_CIRCLES.filter(c => demoClassIds.includes(c.classId))
      classCircles.forEach(c => initialSet.add(c.id))
      return initialSet
    }
    return new Set()
  })
  const [showCounter, setShowCounter] = useState(demoMode && demoStep !== 'exploration' && !isGateZone ? true : false)
  const [roomMilestoneText, setRoomMilestoneText] = useState<string | null>(null)
  const [rgLockedToast, setRgLockedToast] = useState<string | null>(null)
  const [milestoneGlow, setMilestoneGlow] = useState<'50%' | '100%' | null>(null)
  const [moveDir, setMoveDir] = useState({ x: 0, y: 0 })
  const [showDebug, setShowDebug] = useState(false)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [showStudentDetails, setShowStudentDetails] = useState(false)
  const [inventoryTab, setInventoryTab] = useState<'ALL' | 'A1' | 'A2' | 'B1' | 'B2'>('ALL')

  const charPosRef = useRef({ x: 650, y: 550 })

  // Dynamic Container ResizeObserver for 100% Edge-to-Edge Responsive Viewport
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerDim, setContainerDim] = useState({ w: 640, h: 360 })

  useEffect(() => {
    if (!containerRef.current) return
    const updateDim = () => {
      if (containerRef.current) {
        const clientWidth = Math.round(containerRef.current.clientWidth)
        const clientHeight = Math.round(containerRef.current.clientHeight)
        if (clientWidth > 0 && clientHeight > 0) {
          setContainerDim(prev => (Math.abs(prev.w - clientWidth) <= 1 && Math.abs(prev.h - clientHeight) <= 1 ? prev : { w: clientWidth, h: clientHeight }))
        }
      }
    }
    updateDim()
    const ro = new ResizeObserver(updateDim)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const animRef = useRef<number | null>(null)
  const unlockedR = useRef(unlocked); unlockedR.current = unlocked
  const savedClassesR = useRef(savedClasses); savedClassesR.current = savedClasses
  const collectedR = useRef(collected); collectedR.current = collected
  const activeDoorR = useRef(activeDoor); activeDoorR.current = activeDoor
  const nearDoorR = useRef(nearDoor); nearDoorR.current = nearDoor
  const activeClassR = useRef(activeClass); activeClassR.current = activeClass
  const nearClassR = useRef(nearClass); nearClassR.current = nearClass
  const showWaliKelasPopupR = useRef(showWaliKelasPopup); showWaliKelasPopupR.current = showWaliKelasPopup

  // Sync charPosRef with charPos
  useEffect(() => {
    charPosRef.current = charPos
  }, [charPos.x, charPos.y])

  // Proximity to class doors (calculated smoothly from player position, only in main zone)
  useEffect(() => {
    if (currentZone !== 'main' || insideRoom) {
      setNearClass(prev => (prev === null ? prev : null))
      return
    }
    const { x: cx, y: cy } = charPos
    let closest: QuizDoor | null = null
    let minDist = Infinity
    for (const d of doors) {
      if (d.roomId !== 'RG' && !unlockedR.current.has(d.roomId)) continue
      const dist = Math.hypot(d.x - cx, d.y - cy)
      const threshold = d.roomId === 'RG' ? 95 : 85
      if (dist < threshold && dist < minDist) {
        minDist = dist
        closest = d
      }
    }
    setNearClass(prev => (prev?.id === closest?.id ? prev : closest))
  }, [charPos.x, charPos.y, doors, currentZone, insideRoom])

  // Proximity to facility doors (when in facility zone)
  useEffect(() => {
    if (currentZone !== 'facility' || insideRoom) {
      setNearFacility(prev => (prev === null ? prev : null))
      return
    }
    const { x: cx, y: cy } = charPos
    let closest: FacilityDoor | null = null
    let minDist = Infinity
    for (const fac of FACILITY_DOORS) {
      const dist = Math.hypot(fac.x - cx, fac.y - cy)
      if (dist < 75 && dist < minDist) {
        minDist = dist
        closest = fac
      }
    }
    setNearFacility(prev => (prev?.id === closest?.id ? prev : closest))
  }, [charPos.x, charPos.y, currentZone, insideRoom])

  // Proximity to facility room learning stations (Bookshelf in Perpustakaan, Terminal in Lab Komputer)
  useEffect(() => {
    if (!insideRoom) {
      setNearLibraryShelf(prev => (!prev ? prev : false))
      setNearLabTerminal(prev => (!prev ? prev : false))
      return
    }
    if (insideRoom.id === 'Perpustakaan') {
      const isNear = Math.hypot(charPos.x - 280, charPos.y - 440) < 90
      setNearLibraryShelf(prev => (prev === isNear ? prev : isNear))
      setNearLabTerminal(prev => (!prev ? prev : false))
    } else if (insideRoom.id === 'LabKomputer') {
      const isNear = Math.hypot(charPos.x - 300, charPos.y - 440) < 90
      setNearLabTerminal(prev => (prev === isNear ? prev : isNear))
      setNearLibraryShelf(prev => (!prev ? prev : false))
    } else {
      setNearLibraryShelf(prev => (!prev ? prev : false))
      setNearLabTerminal(prev => (!prev ? prev : false))
    }
  }, [charPos.x, charPos.y, insideRoom])

  // Proximity to Mother Cat & Direct Interaction
  useEffect(() => {
    if (insideRoom || currentZone !== 'main' || catQuestStage === 'untriggered') {
      setNearMotherCat(prev => (!prev ? prev : false))
      return
    }
    const dist = Math.hypot(charPos.x - motherCatPos.x, charPos.y - motherCatPos.y)
    const isNear = dist < 80
    setNearMotherCat(prev => (prev === isNear ? prev : isNear))

    // Trigger reunion modal when returning near Mother Cat with rescued kitten Mochi
    if (isNear && catQuestStage === 'kitten_rescued' && !showMotherCatModalR.current) {
      gameAudio.playCatMeow()
      setShowMotherCatModal(true)
    }
  }, [charPos.x, charPos.y, insideRoom, currentZone, catQuestStage, motherCatPos])

  // Proximity to Kitten in Box & Unavoidable Direct Rescue (Cannot ignore)
  useEffect(() => {
    if (catQuestStage !== 'quest_active') {
      setNearKitten(prev => (!prev ? prev : false))
      return
    }
    const isPlayerInKittenZone =
      (kittenLocation.zone === 'Perpustakaan' && insideRoom?.id === 'Perpustakaan') ||
      (kittenLocation.zone === 'LabKomputer' && insideRoom?.id === 'LabKomputer') ||
      (kittenLocation.zone === 'facility_courtyard' && currentZone === 'facility' && !insideRoom) ||
      (kittenLocation.zone === 'hallway' && currentZone === 'main' && !insideRoom)

    if (!isPlayerInKittenZone) {
      setNearKitten(prev => (!prev ? prev : false))
      return
    }

    const dist = Math.hypot(charPos.x - kittenLocation.x, charPos.y - kittenLocation.y)
    const isNear = dist < 80
    setNearKitten(prev => (prev === isNear ? prev : isNear))

    // Directly trigger rescue when reaching Mochi's box
    if (isNear && !showKittenRescueModalR.current) {
      resetMovement()
      gameAudio.playCatMeow()
      setShowKittenRescueModal(true)
    }
  }, [charPos.x, charPos.y, catQuestStage, kittenLocation, insideRoom, currentZone, resetMovement])

  // Proximity to Zone Transition Gateway & Auto-step transition
  useEffect(() => {
    if (insideRoom) {
      setZoneTransitionPrompt(prev => (prev === null ? prev : null))
      return
    }

    // Auto-step transition or Satpam interception when walking through open school front gate
    if (currentZone === 'gate' && charPos.y <= 468 && charPos.x >= 480 && charPos.x <= 755) {
      if (!hasPassedSatpamQuiz) {
        attemptEnterSchoolFromGate()
        return
      }
      if (charPos.y <= 425) {
        enterSchoolFromGate()
        return
      }
    }

    const isTaskGiven = cinematicStageRef.current === 'sanction_received' || demoMode || collectedR.current.size > 0 || savedClassesR.current.size > 0
    const isAtGateway = charPos.y >= 590 && Math.abs(charPos.x - 625) < 220
    const targetPrompt = isAtGateway ? (currentZone === 'main' && !isTaskGiven ? null : currentZone === 'main' ? 'to_facility' : 'to_main') : null
    setZoneTransitionPrompt(prev => (prev === targetPrompt ? prev : targetPrompt))

    // Auto-step transition when walking to the very edge (y >= 635)
    if (charPos.y >= 635 && Math.abs(charPos.x - 625) < 220) {
      if (currentZone === 'main') {
        if (!isTaskGiven) {
          setCharPos(p => (p.y >= 635 ? { ...p, y: 628 } : p))
          gameAudio.playError()
          setRgLockedToast('🔒 Area Fasilitas belum dibuka! Jumpai Pak Sutrisno di depan Ruang Guru terlebih dahulu untuk melapor.')
          setTimeout(() => setRgLockedToast(null), 2500)
        } else {
          goToFacilityZone()
        }
      } else {
        goToMainZone()
      }
    }
  }, [charPos.x, charPos.y, currentZone, insideRoom, hasPassedSatpamQuiz, goToFacilityZone, goToMainZone, enterSchoolFromGate, attemptEnterSchoolFromGate, demoMode])

  // Preload background image of classroom dynamically when player approaches its door
  useEffect(() => {
    if (!nearClass) return
    const bgUrl = LEVEL1_MAPS[nearClass.id]?.bgImage
    if (bgUrl) {
      const img = new Image()
      img.src = bgUrl
    }
  }, [nearClass])

  // Finish trigger once all 24 data points are collected
  useEffect(() => {
    if (collected.size >= TOTAL_N && !showCounter && !showPakReportModal) {
      // Waypoint arrow points to Pak Sutrisno to report back
    }
  }, [collected.size, showCounter, showPakReportModal])

  // Auto-clamp player Y position if ever above boundaries
  useEffect(() => {
    if (insideRoom) return
    if (currentZone === 'gate') {
      const minGateY = (charPos.x >= 490 && charPos.x <= 745) ? 330 : 445
      if (charPos.y < minGateY - 1) {
        setCharPos(prev => (prev.y < minGateY - 1 ? { ...prev, y: minGateY } : prev))
      }
    } else if (currentZone === 'facility') {
      if (charPos.y < 380 - 1) {
        setCharPos(prev => (prev.y < 380 - 1 ? { ...prev, y: 380 } : prev))
      }
    } else {
      const redLineY = getRedLineY(charPos.x)
      if (charPos.y < redLineY - 1) {
        setCharPos(prev => (prev.y < redLineY - 1 ? { ...prev, y: redLineY } : prev))
      }
    }
  }, [charPos.x, charPos.y, insideRoom, currentZone])

  const lastTimeRef = useRef<number>(0)

  // Main game tick: movement animation loop with delta-time smoothing & camera lerp
  useEffect(() => {
    lastTimeRef.current = performance.now()
    const tick = () => {
      const now = performance.now()
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = now

      const isInside = !!insideRoomR.current
      let targetFocusX = isInside ? 600 : charPosRef.current.x
      let targetFocusY = isInside ? 580 : charPosRef.current.y

      if (!isInside && currentZoneR.current === 'main') {
        if (cinematicStageRef.current === 'panning_to_pak' || cinematicStageRef.current === 'pak_shouting' || cinematicStageRef.current === 'pak_shouting_2') {
          targetFocusX = PAK_SUTRISNO_POS.x
          targetFocusY = PAK_SUTRISNO_POS.y - 45
        } else if (['pak_sanction_1', 'pak_sanction_2', 'pak_sanction_3', 'player_reply_pak'].includes(cinematicStageRef.current)) {
          targetFocusX = (PAK_SUTRISNO_POS.x + charPosRef.current.x) / 2
          targetFocusY = PAK_SUTRISNO_POS.y - 45
        }
      } else if (!isInside && currentZoneR.current === 'gate' && satpamChatStageR.current !== 'idle') {
        if (satpamChatStageR.current === 'player_excuse_1' || satpamChatStageR.current === 'player_thanks') {
          targetFocusX = charPosRef.current.x
          targetFocusY = charPosRef.current.y
        } else {
          targetFocusX = 820
          targetFocusY = satpamChatStageR.current === 'pak_quiz' ? 392 : 440
        }
      }

      // Smooth camera lerp
      smoothCamPos.current.x += (targetFocusX - smoothCamPos.current.x) * 0.075
      smoothCamPos.current.y += (targetFocusY - smoothCamPos.current.y) * 0.075

      // Automatic transitions for camera pan
      if (cinematicStageRef.current === 'panning_to_pak') {
        const distToPak = Math.hypot(smoothCamPos.current.x - PAK_SUTRISNO_POS.x, smoothCamPos.current.y - (PAK_SUTRISNO_POS.y - 45))
        if (distToPak < 40) {
          setCinematicStage('pak_shouting')
        }
      } else if (cinematicStageRef.current === 'panning_to_player') {
        const distToPlayer = Math.hypot(smoothCamPos.current.x - charPosRef.current.x, smoothCamPos.current.y - charPosRef.current.y)
        if (distToPlayer < 35) {
          setCinematicStage('quest_meet_pak')
        }
      } else if (cinematicStageRef.current === 'quest_meet_pak') {
        const distToPak = Math.hypot(charPosRef.current.x - PAK_SUTRISNO_POS.x, charPosRef.current.y - PAK_SUTRISNO_POS.y)
        if (distToPak < 110) {
          setCinematicStage('pak_sanction_1')
        }
      }

      const isCinematicActive = cinematicStageRef.current === 'player_intro' ||
                                cinematicStageRef.current === 'panning_to_pak' || 
                                cinematicStageRef.current === 'pak_shouting' || 
                                cinematicStageRef.current === 'pak_shouting_2' || 
                                cinematicStageRef.current === 'panning_to_player' ||
                                cinematicStageRef.current === 'pak_sanction_1' ||
                                cinematicStageRef.current === 'pak_sanction_2' ||
                                cinematicStageRef.current === 'pak_sanction_3' ||
                                cinematicStageRef.current === 'player_reply_pak'

      const isClassroomConversation = !!(insideRoomR.current && ['A1', 'A2', 'B1', 'B2'].includes(insideRoomR.current.id))

      if (
        !activeDoor &&
        !activeClass &&
        !showWaliKelasPopup &&
        !activeFacilityR.current &&
        !showLibraryBookModalR.current &&
        !showLabTerminalModalR.current &&
        satpamChatStageR.current === 'idle' &&
        !isCinematicActive &&
        !isTransitioningRef.current &&
        !isClassroomConversation
      ) {
        const { x: dx, y: dy } = dirRef.current
        if (dx || dy) {
          const currentMapKey = insideRoomR.current?.id || (currentZoneR.current === 'gate' ? 'gate' : currentZoneR.current === 'facility' ? 'facility_courtyard' : 'hallway')
          const activeMap = LEVEL1_MAPS[currentMapKey] || LEVEL1_MAPS['hallway']
          const moveSpeed = activeMap.character.speed * 40
          const dist = moveSpeed * dt

          setCharPos(p => {
            const isInsideClass = !!insideRoomR.current
            const isFacility = currentZoneR.current === 'facility'
            const isGate = currentZoneR.current === 'gate'

            let minX = 70
            let maxX = 1165
            let maxY = 640

            if (isInsideClass) {
              minX = 50
              maxX = WORLD_VW - 50
              maxY = WORLD_VH - 40 // 610
            } else if (isFacility) {
              minX = 60
              maxX = WORLD_VW - 60
              maxY = 640
            } else if (isGate) {
              minX = 60
              maxX = WORLD_VW - 60
              maxY = 630
            }

            // 1. Sanitize current position p so it is NEVER outside valid bounds
            const clampedX = Math.max(minX, Math.min(maxX, p.x))
            const currentMinY = isInsideClass ? 380 : isFacility ? 380 : isGate ? (clampedX >= 490 && clampedX <= 745 ? 330 : 445) : getRedLineY(clampedX)
            const clampedY = Math.max(currentMinY, Math.min(maxY, p.y))

            // Desired target coordinates
            const targetX = Math.max(minX, Math.min(maxX, clampedX + dx * dist))
            const targetMinY = isInsideClass ? 380 : isFacility ? 380 : isGate ? (targetX >= 490 && targetX <= 745 ? 330 : 445) : getRedLineY(targetX)
            const targetY = Math.max(targetMinY, Math.min(maxY, clampedY + dy * dist))

            // Clamp at y=468 when approaching gate before passing Satpam quiz (useEffect will trigger interception)
            if (isGate && targetY <= 468 && targetX >= 480 && targetX <= 755 && !hasPassedSatpamQuizR.current) {
              return { x: targetX, y: 468 }
            }

            // Option A: Direct diagonal move
            if (activeMap.isWalkable(targetX, targetY, unlockedR.current)) {
              return { x: targetX, y: targetY }
            }

            // Option B: Slide horizontally (with slope adaptation for hallway)
            if (!isInsideClass && !isFacility && !isGate) {
              const slopeY = Math.max(getRedLineY(targetX), clampedY)
              if (slopeY <= maxY && activeMap.isWalkable(targetX, slopeY, unlockedR.current)) {
                return { x: targetX, y: slopeY }
              }
            } else {
              if (activeMap.isWalkable(targetX, clampedY, unlockedR.current)) {
                return { x: targetX, y: clampedY }
              }
            }

            // Option C: Slide vertically
            if (activeMap.isWalkable(clampedX, targetY, unlockedR.current)) {
              return { x: clampedX, y: targetY }
            }

            // Option D: Fallback to sanitized position (prevents out-of-bounds trap)
            return { x: clampedX, y: clampedY }
          })
        }
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [activeDoor, activeClass, showWaliKelasPopup, activeFacility])

  const handleExitClassroom = useCallback(() => {
    const exitingRoom = insideRoomR.current
    gameAudio.playDoorOpen()
    resetMovement()
    if (teacherTimerRef.current) clearTimeout(teacherTimerRef.current)
    setTeacherCutsceneStage(null)
    insideRoomR.current = null
    setInsideRoom(null)
    const fallbackExitY = exitingRoom && ['A1', 'A2', 'B1', 'B2', 'RG'].includes(exitingRoom.id) ? 480 : 550
    const exitPos = lastHallwayPosRef.current
      ? {
          x: lastHallwayPosRef.current.x,
          y: Math.max(450, Math.min(580, lastHallwayPosRef.current.y)),
        }
      : { x: 650, y: fallbackExitY }
    setCharPos(exitPos)
    charPosRef.current = exitPos
    smoothCamPos.current = { ...exitPos }

    // Cat Quest: Spawn Mother Cat (Mimi) upon exiting the randomly chosen classroom (VII-A, VII-B, VIII-A, or VIII-B), right in front of the player
    if (
      exitingRoom &&
      ['A1', 'A2', 'B1', 'B2'].includes(exitingRoom.id) &&
      catQuestStageR.current === 'untriggered' &&
      (exitingRoom.id === catTargetClassIdR.current || savedClassesR.current.size >= 4)
    ) {
      const classDoor = doors.find(d => d.id === exitingRoom.id) || exitingRoom
      const spawnX = exitPos.x + 38
      const spawnY = Math.min(610, Math.max(getRedLineY(spawnX) + 15, exitPos.y + 25))
      let randomSpot: { zone: string; x: number; y: number; label: string } =
        KITTEN_SPAWN_SPOTS[Math.floor(Math.random() * KITTEN_SPAWN_SPOTS.length)]
      if ((exitingRoom.id === 'B1' || exitingRoom.id === 'B2') && randomSpot.zone === 'hallway') {
        randomSpot = { zone: 'hallway', x: 280, y: 530, label: 'Halaman Depan Kelas VII' }
      }

      const nextMotherPos = { x: spawnX, y: spawnY, classLabel: classDoor.label, classId: classDoor.id }
      motherCatPosR.current = nextMotherPos
      setMotherCatPos(nextMotherPos)
      kittenLocationR.current = randomSpot
      setKittenLocation(randomSpot)
      catQuestStageR.current = 'cat_spawned'
      setCatQuestStage('cat_spawned')
      setTimeout(() => {
        gameAudio.playCatMeow()
        setShowMotherCatModal(true)
      }, 450)
    }
  }, [resetMovement, doors])

  const enterClassroom = useCallback((room: QuizDoor) => {
    const isTaskGiven = cinematicStageRef.current === 'sanction_received' || demoMode || collectedR.current.size > 0 || savedClassesR.current.size > 0
    if (!isTaskGiven && room.id !== 'RG') {
      gameAudio.playError()
      setRgLockedToast('🔒 Temui Pak Sutrisno terlebih dahulu untuk melapor dan menerima tugas!')
      setTimeout(() => setRgLockedToast(null), 2500)
      return
    }

    // Intercept if entering the room where Mother Cat is stationed before talking to the cat
    if (catQuestStageR.current === 'cat_spawned' && room.id === motherCatPosR.current.classId) {
      resetMovement()
      gameAudio.playCatMeow()
      setShowMotherCatModal(true)
      return
    }

    gameAudio.playDoorOpen()
    resetMovement()
    lastHallwayPosRef.current = {
      x: room.x,
      y: Math.max(460, Math.min(580, charPosRef.current.y || 480)),
    }
    const isClassroom = ['A1', 'A2', 'B1', 'B2'].includes(room.id)
    const spawnPos = LEVEL1_MAPS[room.id]?.spawn || (isClassroom ? { x: 930, y: 540 } : { x: 1050, y: 510 })
    setInsideRoom(room)
    insideRoomR.current = room
    setCharPos(spawnPos)
    charPosRef.current = spawnPos
    

    if (savedClassesR.current.has(room.id)) return

    const mapConfig = LEVEL1_MAPS[room.id]
    if (teacherTimerRef.current) clearTimeout(teacherTimerRef.current)

    // Snappy 400ms auto cutscene in conversation mode
    teacherTimerRef.current = setTimeout(() => {
      setTeacherCutsceneStage('teacher_ask')
    }, 400)
  }, [resetMovement])

  const teleportToPakSutrisno = useCallback(() => {
    // 1. Lengkapi 24 data (4 kelas)
    const fullSet = new Set<string>()
    DATA_CIRCLES.forEach(c => fullSet.add(c.id))
    collectedR.current = fullSet
    setCollected(fullSet)

    const fullSaved = new Set(['A1', 'A2', 'B1', 'B2'])
    savedClassesR.current = fullSaved
    setSavedClasses(fullSaved)

    // 2. Tandai misi kucing selesai & buka akses Ruang Guru
    catQuestStageR.current = 'completed'
    setCatQuestStage('completed')
    unlockedR.current = new Set([...unlockedR.current, 'A', 'B', 'RG', 'A1', 'A2', 'B1', 'B2'])
    setUnlocked(prev => new Set([...prev, 'A', 'B', 'RG', 'A1', 'A2', 'B1', 'B2']))
    hasPassedSatpamQuizR.current = true
    setHasPassedSatpamQuiz(true)
    cinematicStageRef.current = 'sanction_received'
    setCinematicStage('sanction_received')

    // 3. Teleportasi ke dalam Ruang Guru tepat di hadapan Pak Sutrisno
    currentZoneR.current = 'main'
    setCurrentZone('main')

    const rgDoor = doors.find(d => d.id === 'RG') || {
      id: 'RG',
      roomId: 'RG',
      label: 'Ruang Guru',
      x: 618,
      y: 355,
      color: '#F59E0B',
      image: '/Assets/Building/Ruang Guru/Ruang Guru.webp'
    } as QuizDoor

    insideRoomR.current = rgDoor
    setInsideRoom(rgDoor)
    const rgSpawn = LEVEL1_MAPS['RG']?.spawn || { x: 260, y: 595 }
    setCharPos(rgSpawn)
    charPosRef.current = rgSpawn
    resetMovement()

    // 4. Langsung buka Papan Analisis Data (PakReportModal)
    setShowPakReportModal(true)
    gameAudio.playUnlockJingle()
  }, [resetMovement, doors])

  const teleportToPakSutrisnoRef = useRef(teleportToPakSutrisno)
  teleportToPakSutrisnoRef.current = teleportToPakSutrisno

  const handleClassCorrect = useCallback(() => {
    if (!activeClass) return
    const roomToEnter = activeClass
    setUnlocked(p => new Set([...p, roomToEnter.id]))
    setActiveClass(null)
    enterClassroom(roomToEnter)
  }, [activeClass, enterClassroom])

  const handleInteractTeacher = useCallback((room: QuizDoor) => {
    if (room.id === 'Perpustakaan' || room.id === 'LabKomputer') {
      return
    }

    const mapConfig = LEVEL1_MAPS[room.id]
    const hasTeacherSprite = !!mapConfig?.teacher?.spriteUrl

    const currentStage = teacherCutsceneStageRef.current
    if (!currentStage) {
      if (room.id === 'RG') {
        setShowPakReportModal(true)
        return
      }
      if (hasTeacherSprite) {
        if (teacherTimerRef.current) clearTimeout(teacherTimerRef.current)
        setTeacherCutsceneStage('anim_wait')
        const animDuration = (mapConfig.teacher?.totalFrames || 24) * (mapConfig.teacher?.speedMs || 90)
        teacherTimerRef.current = setTimeout(() => {
          setTeacherCutsceneStage('teacher_ask')
        }, animDuration)
      } else {
        setTeacherCutsceneStage('teacher_ask')
      }
    } else if (currentStage === 'anim_wait') {
      if (teacherTimerRef.current) clearTimeout(teacherTimerRef.current)
      setTeacherCutsceneStage('teacher_ask')
    } else if (currentStage === 'teacher_ask') {
      setTeacherCutsceneStage('player_explain')
    } else if (currentStage === 'player_explain') {
      setTeacherCutsceneStage('teacher_reply')
    } else if (currentStage === 'teacher_reply') {
      setTeacherCutsceneStage(null)
      if (room.id === 'RG') {
        setShowPakReportModal(true)
      } else {
        setShowWaliKelasPopup(room)
      }
    } else if (currentStage === 'post_stevunt_report') {
      gameAudio.playClick()
      setTeacherCutsceneStage('post_pak_thanks')
    } else if (currentStage === 'post_pak_thanks') {
      gameAudio.playClick()
      // Generate randomized claim quiz from active dataset
      const quiz = generatePakSutrisnoClaimQuiz(activeDataset)
      setSutrisnoQuiz(quiz)
      setSutrisnoQuizWrong(false)
      setTeacherCutsceneStage('post_pak_quiz')
    } else if (currentStage === 'post_pak_quiz') {
      // During quiz stage, clicking bubble does not advance; student must click option button
      return
    } else if (currentStage === 'post_conclusion') {
      gameAudio.playUnlockJingle()
      setTeacherCutsceneStage(null)
      const latestStartTime = useGameStore.getState().sessionStartTime || sessionStartTime || (Date.now() - 240000)
      const elapsed = Math.max(1, Math.floor((Date.now() - latestStartTime) / 1000))
      const stars = elapsed <= 360 ? 3 : elapsed <= 600 ? 2 : 1
      setElapsedSecondsState(elapsed)
      setEarnedStarsState(stars)
      setShowMissionCompleteModal(true)
    }
  }, [activeDataset])

  const handleSelectSutrisnoQuizOption = useCallback((isCorrect: boolean, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isCorrect) {
      gameAudio.playUnlockJingle()
      setTeacherCutsceneStage(null)
      const latestStartTime = useGameStore.getState().sessionStartTime || sessionStartTime || (Date.now() - 240000)
      const elapsed = Math.max(1, Math.floor((Date.now() - latestStartTime) / 1000))
      const stars = elapsed <= 360 ? 3 : elapsed <= 600 ? 2 : 1
      setElapsedSecondsState(elapsed)
      setEarnedStarsState(stars)
      setShowMissionCompleteModal(true)
    } else {
      gameAudio.playError()
      setSutrisnoQuizWrong(true)
      setSutrisnoWrongCount(prev => prev + 1)
      incrementMistake()
    }
  }, [sessionStartTime, incrementMistake])

  // Keyboard navigation listeners
  useEffect(() => {
    const KEY_MAP: Record<string, { x: number; y: number }> = {
      ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
    }

    const updateDir = () => {
      let nx = 0, ny = 0
      pressedKeysRef.current.forEach(k => {
        const d = KEY_MAP[k]
        if (d) { nx += d.x; ny += d.y }
      })
      const len = Math.sqrt(nx * nx + ny * ny)
      const nextDir = len > 0 ? { x: nx / len, y: ny / len } : { x: 0, y: 0 }
      dirRef.current = nextDir
      setMoveDir(nextDir)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const activeDoorVal = activeDoorR.current
      const activeClassVal = activeClassR.current
      const nearDoorVal = nearDoorR.current
      const nearClassVal = nearClassR.current
      const activeFacilityVal = activeFacilityR.current
      const nearFacilityVal = nearFacilityR.current
      if (showMotherCatModalR.current) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
          e.preventDefault()
          if (catQuestStageR.current === 'cat_spawned') {
            setCatQuestStage('quest_active')
          } else if (catQuestStageR.current === 'kitten_rescued') {
            setCatQuestStage('completed')
          }
          setShowMotherCatModal(false)
          resetMovement()
        }
        return
      }

      if (showKittenRescueModalR.current) {
        if (e.key === 'Escape') {
          e.preventDefault()
          setShowKittenRescueModal(false)
          resetMovement()
        }
        return
      }

      if (showLibraryBookModalR.current) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setShowLibraryBookModal(false)
          resetMovement()
        }
        return
      }

      if (showLabTerminalModalR.current) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setShowLabTerminalModal(false)
          resetMovement()
        }
        return
      }

      if (activeFacilityVal) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setActiveFacility(null)
          resetMovement()
        }
        return
      }

      if (satpamChatStageR.current !== 'idle') {
        resetMovement()
        if (e.key === 'Escape') {
          e.preventDefault()
          satpamChatStageR.current = 'idle'
          setSatpamChatStage('idle')
          if (!hasPassedSatpamQuizR.current) {
            setCharPos(prev => (prev.y <= 445 ? { ...prev, y: 455 } : prev))
          }
          return
        }
        if (satpamChatStageR.current === 'pak_quiz') {
          if (e.key === '1' || e.key === 'a' || e.key === 'A') {
            e.preventDefault()
            handleSelectSatpamOption(0)
          } else if (e.key === '2' || e.key === 'b' || e.key === 'B') {
            e.preventDefault()
            handleSelectSatpamOption(1)
          } else if (e.key === '3' || e.key === 'c' || e.key === 'C') {
            e.preventDefault()
            handleSelectSatpamOption(2)
          } else if (e.key === '4' || e.key === 'd' || e.key === 'D') {
            e.preventDefault()
            handleSelectSatpamOption(3)
          }
          return
        }
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
          e.preventDefault()
          advanceSatpamChat()
        }
        return
      }

      if (activeDoorVal || activeClassVal || showWaliKelasPopupR.current) {
        if (e.key === 'Escape') {
          e.preventDefault()
          setActiveDoor(null)
          setActiveClass(null)
          resetMovement()
        }
        return
      }
      if (insideRoomR.current && e.key === 'Escape') {
        e.preventDefault()
        handleExitClassroom()
        return
      }

      const keyNormalized = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (KEY_MAP[keyNormalized]) {
        e.preventDefault()
        if (insideRoomR.current && ['A1', 'A2', 'B1', 'B2'].includes(insideRoomR.current.id)) {
          // Strictly conversation mode inside classrooms: player cannot walk around
          return
        }
        pressedKeysRef.current.add(keyNormalized)
        updateDir()
      }

      // ── Quick Teleport to Pak Sutrisno via 'T' Key ──
      if (keyNormalized === 't' && !showPakReportModal) {
        e.preventDefault()
        teleportToPakSutrisnoRef.current()
        return
      }

      // ── Quick Enter Classroom VII-A via 'K' Key (Dev & Testing) ──
      if (keyNormalized === 'k' && !showPakReportModal) {
        e.preventDefault()
        const roomA1 = doors.find(d => d.id === 'A1')
        if (roomA1) {
          currentZoneR.current = 'main'
          setCurrentZone('main')
          cinematicStageRef.current = 'sanction_received'
          setCinematicStage('sanction_received')
          insideRoomR.current = roomA1
          setInsideRoom(roomA1)
          setShowWaliKelasPopup(roomA1)
        }
        return
      }

      // ── Gate Zone Entry or Satpam Interaction via Key ──
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && !insideRoomR.current && currentZoneR.current === 'gate') {
        // Pak Joko is only triggered when attempting to enter the gate
        const isNearGateOpening = charPosRef.current.y <= 490 && charPosRef.current.x >= 450 && charPosRef.current.x <= 780
        if (isNearGateOpening) {
          e.preventDefault()
          attemptEnterSchoolFromGate()
          return
        }
        if (cinematicStageRef.current === 'gate_intro') {
          setGateBubbleStep(p => p + 1)
        }
      }

      // ── Gateway Zone Transition via Key ──
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && !insideRoomR.current && currentZoneR.current !== 'gate') {
        const isAtGateway = charPosRef.current.y >= 590 && Math.abs(charPosRef.current.x - 625) < 220
        if (isAtGateway) {
          e.preventDefault()
          if (currentZoneR.current === 'main') {
            goToFacilityZone()
          } else {
            goToMainZone()
          }
          return
        }
      }

      // ── Cat Quest Interaction via Key ──
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E')) {
        if (nearMotherCatR.current && !insideRoomR.current && currentZoneR.current === 'main') {
          e.preventDefault()
          gameAudio.playCatMeow()
          setShowMotherCatModal(true)
          resetMovement()
          return
        }
        if (nearKittenR.current && catQuestStageR.current === 'quest_active') {
          e.preventDefault()
          gameAudio.playCatMeow()
          setShowKittenRescueModal(true)
          resetMovement()
          return
        }
      }

      // ── Facility Interaction via Key ──
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && currentZoneR.current === 'facility' && nearFacilityVal && !insideRoomR.current) {
        e.preventDefault()
        if (nearFacilityVal.roomId) {
          enterFacilityRoom(nearFacilityVal)
        } else {
          setActiveFacility(nearFacilityVal)
          resetMovement()
          gameAudio.playDoorOpen()
        }
        return
      }

      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && nearDoorVal && !unlockedR.current.has(nearDoorVal.id)) {
        e.preventDefault()
        setUnlocked(p => new Set([...p, nearDoorVal.id]))
      } else if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && nearClassVal) {
        e.preventDefault()
        if (nearClassVal.id === 'RG') {
          const isDataComplete = collectedR.current.size >= TOTAL_N || savedClassesR.current.size >= 4
          const isKittenFound = catQuestStageR.current === 'kitten_rescued' || catQuestStageR.current === 'completed'
          const isRGUnlocked = isDataComplete && isKittenFound
          if (isRGUnlocked) {
            enterClassroom(nearClassVal)
          } else {
            gameAudio.playError()
            if (!isDataComplete && !isKittenFound) {
              setRgLockedToast(`🔒 Ruang Guru Terkunci! Kumpulkan data 4 kelas (${collectedR.current.size}/${TOTAL_N}) dan temukan anak kucing yang hilang terlebih dahulu!`)
            } else if (!isKittenFound) {
              setRgLockedToast(`🔒 Ruang Guru Terkunci! Kamu harus menemukan anak kucing yang hilang terlebih dahulu sebelum melapor ke Pak Sutrisno!`)
            } else {
              setRgLockedToast(`🔒 Ruang Guru Terkunci! Kumpulkan seluruh data dari 4 kelas terlebih dahulu (${collectedR.current.size}/${TOTAL_N}).`)
            }
            setTimeout(() => setRgLockedToast(null), 2500)
          }
          return
        }
        if (savedClassesR.current.has(nearClassVal.id)) {
          return
        }
        enterClassroom(nearClassVal)
      } else if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && insideRoomR.current) {
        if (insideRoomR.current.id === 'Perpustakaan' && nearLibraryShelfR.current) {
          e.preventDefault()
          setShowLibraryBookModal(true)
          resetMovement()
          return
        }
        if (insideRoomR.current.id === 'LabKomputer' && nearLabTerminalR.current) {
          e.preventDefault()
          setShowLabTerminalModal(true)
          resetMovement()
          return
        }

        const currentMap = LEVEL1_MAPS[insideRoomR.current.id]
        const teacherX = currentMap?.teacher?.x ?? 617
        const teacherY = currentMap?.teacher?.y ?? 415
        const isClass = ['A1', 'A2', 'B1', 'B2'].includes(insideRoomR.current.id)
        const distToTeacher = Math.hypot(charPosRef.current.x - teacherX, charPosRef.current.y - teacherY)
        if (isClass || distToTeacher < 350 || teacherCutsceneStageRef.current) {
          if (teacherCutsceneStageRef.current === 'post_pak_quiz') {
            return
          }
          e.preventDefault()
          handleInteractTeacher(insideRoomR.current)
        }
      } else if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && !insideRoomR.current && cinematicStageRef.current !== 'sanction_received') {
        if (cinematicStageRef.current === 'player_intro') {
          e.preventDefault()
          setCinematicStage('panning_to_pak')
          return
        } else if (cinematicStageRef.current === 'pak_shouting') {
          e.preventDefault()
          setCinematicStage('pak_shouting_2')
          return
        } else if (cinematicStageRef.current === 'pak_shouting_2') {
          e.preventDefault()
          setCinematicStage('panning_to_player')
          return
        }

        const pakX = PAK_SUTRISNO_POS.x
        const pakY = PAK_SUTRISNO_POS.y
        const distToPak = Math.hypot(charPosRef.current.x - pakX, charPosRef.current.y - pakY)
        if (distToPak < 135) {
          e.preventDefault()
          if (cinematicStageRef.current === 'quest_meet_pak') {
            setCinematicStage('pak_sanction_1')
          } else if (cinematicStageRef.current === 'pak_sanction_1') {
            setCinematicStage('pak_sanction_2')
          } else if (cinematicStageRef.current === 'pak_sanction_2') {
            setCinematicStage('pak_sanction_3')
          } else if (cinematicStageRef.current === 'pak_sanction_3') {
            setCinematicStage('player_reply_pak')
          } else if (cinematicStageRef.current === 'player_reply_pak') {
            setCinematicStage('sanction_received')
            gameAudio.playUnlockJingle()
            setRoomMilestoneText('TUGAS DITERIMA! 📋 AREA FASILITAS & KELAS TERBUKA!')
            setTimeout(() => setRoomMilestoneText(null), 3000)
          }
        }
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      const keyNormalized = e.key.length === 1 ? e.key.toLowerCase() : e.key
      pressedKeysRef.current.delete(keyNormalized)
      updateDir()
    }

    const onBlur = () => {
      resetMovement()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      resetMovement()
    }
  }, [resetMovement, goToFacilityZone, goToMainZone, enterClassroom, enterFacilityRoom, handleInteractTeacher, handleExitClassroom])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__DEV_ENTER_ROOM__ = (targetId: string) => {
        cinematicStageRef.current = 'sanction_received'
        setCinematicStage('sanction_received')
        currentZoneR.current = 'main'
        setCurrentZone('main')
        const classDoor = doors.find(d => d.id === targetId)
        if (classDoor) {
          enterClassroom(classDoor)
          return
        }
        const facDoor = FACILITY_DOORS.find(f => f.id === targetId || f.roomId === targetId)
        if (facDoor) {
          enterFacilityRoom(facDoor)
          return
        }
      }
      (window as any).__DEV_OPEN_WALI__ = (id: any) => {
        const r = doors.find(d => d.id === id);
        if (r) { insideRoomR.current = r; setInsideRoom(r); setShowWaliKelasPopup(r); }
      };
      (window as any).__DEV_EXIT_ROOM__ = () => {
        handleExitClassroom()
      }
      // Dev/test helper: teleport Stevunt to a world position
      ;(window as any).__DEV_SET_POS__ = (x: number, y: number) => {
        const p = { x, y }
        charPosRef.current = p
        setCharPos(p)
      }
      ;(window as any).__DEV_SET_SESSION_TIME__ = (secondsAgo: number) => {
        useGameStore.setState({ sessionStartTime: Date.now() - (secondsAgo * 1000) })
      }
      ;(window as any).__DEV_SET_CINEMATIC__ = (stage: any) => {
        cinematicStageRef.current = stage
        setCinematicStage(stage)
      }
      ;(window as any).__DEV_SET_ZONE__ = (z: any) => {
        currentZoneR.current = z
        setCurrentZone(z)
      }
      ;(window as any).__DEV_GET_STATE__ = () => ({
        insideRoom: insideRoomR.current,
        insideRoomState: insideRoom,
        catStage: catQuestStageR.current,
        pos: charPosRef.current,
        dir: dirRef.current,
        nearClass: nearClassR.current,
        isCinematic: cinematicStageRef.current,
        pressedKeys: Array.from(pressedKeysRef.current),
        showWaliKelasPopup: !!showWaliKelasPopup,
        activeClass: !!activeClass,
        activeDoor: !!activeDoor,
        animFrameRunning: !!animRef.current,
      })
    }
  }, [doors, enterClassroom, enterFacilityRoom, handleExitClassroom])

  const handleCorrect = useCallback(() => {
    if (!activeDoor) return
    gameAudio.playSuccess()
    setUnlocked(p => new Set([...p, activeDoor.id]))
    setActiveDoor(null)
  }, [activeDoor])

  const handleCloseWaliKelas = useCallback(() => {
    if (!showWaliKelasPopup) return
    const cid = showWaliKelasPopup.id
    const roomId = showWaliKelasPopup.roomId

    const nextSaved = new Set([...savedClassesR.current, cid])
    savedClassesR.current = nextSaved
    setSavedClasses(nextSaved)

    // 1. Add class ID to unlocked & check room completion
    setUnlocked(prev => {
      const next = new Set(prev)
      next.add(cid)

      const roomClasses = doors.filter(cd => cd.roomId === roomId)
      const completed = roomClasses.every(cd => next.has(cd.id))
      if (completed) {
        setRoomMilestoneText(`RUANG ${roomId} SELESAI! 🚀`)
        setTimeout(() => {
          setRoomMilestoneText(null)
        }, 2200)
      }

      return next
    })

    // 2. Add class data circles to collected & check total milestones
    const classCircles = DATA_CIRCLES.filter(c => c.classId === cid)
    setCollected(prev => {
      const next = new Set(prev)
      classCircles.forEach(c => next.add(c.id))

      const oldSize = prev.size
      const newSize = next.size

      if (oldSize < 12 && newSize >= 12) {
        gameAudio.playItemCollect()
        setMilestoneGlow('50%')
        setTimeout(() => setMilestoneGlow(null), 1800)
      } else if (oldSize < 24 && newSize >= 24) {
        gameAudio.playUnlockJingle()
        setMilestoneGlow('100%')
        setRoomMilestoneText('DATA TERKUMPUL 24/24! 🎉 TELEPORTASI KE PAK SUTRISNO...')
        setTimeout(() => {
          setMilestoneGlow(null)
          setRoomMilestoneText(null)
          teleportToPakSutrisnoRef.current()
        }, 1600)
      } else {
        gameAudio.playItemCollect()
      }

      return next
    })

    setJustCompletedClassId(cid)
    setTimeout(() => {
      setJustCompletedClassId(null)
    }, 1500)

    setShowWaliKelasPopup(null)
    handleExitClassroom()
  }, [showWaliKelasPopup, handleExitClassroom])

  const n = collected.size
  const isTaskGiven = cinematicStage === 'sanction_received' || demoMode || collected.size > 0 || savedClasses.size > 0
  const isRoomACompleted = doors.filter(cd => cd.roomId === 'A').every(cd => unlocked.has(cd.id))
  const isRoomBCompleted = doors.filter(cd => cd.roomId === 'B').every(cd => unlocked.has(cd.id))

  const collectedStudents = doors
    .filter(cd => unlocked.has(cd.id))
    .flatMap(cd => {
      const info = currentClassStudents[cd.id]
      return info ? info.students.map(s => ({ classId: cd.id, name: s.name, time: s.time })) : []
    })

  const scrollRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: 'smooth'
      })
    }
  }, [unlocked, collectedStudents.length])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Main Game Viewport Container */}
      <div
        ref={containerRef}
        style={{ flex: 1, width: '100%', minHeight: 0, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 0, overflow: 'hidden', background: '#04070a', border: 'none' }}
      >

        {/* Floating Top Game HUD Overlay inside Viewport (Shortcut Teleport) */}
        <div style={{
          position: 'absolute',
          top: 'clamp(6px, 1.5vh, 12px)',
          right: 'clamp(8px, 1.5vw, 14px)',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          pointerEvents: 'none'
        }}>

          {/* Right: Shortcut Teleport ke Pak Sutrisno */}
          <motion.button
            data-testid="btn-teleport-pak-sutrisno"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={teleportToPakSutrisno}
            title="Klik atau tekan [T] di keyboard untuk langsung teleportasi ke Pak Sutrisno dengan data terkumpul lengkap"
            style={{
              pointerEvents: 'auto',
              background: n >= TOTAL_N
                ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.95) 0%, rgba(4, 120, 87, 0.98) 100%)'
                : 'linear-gradient(135deg, rgba(217, 119, 6, 0.95) 0%, rgba(180, 83, 9, 0.98) 100%)',
              border: n >= TOTAL_N ? '1.5px solid #34D399' : '1.5px solid #FCD34D',
              borderRadius: 12,
              padding: 'clamp(4px, 0.6vw, 6px) clamp(8px, 1vw, 14px)',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: 'clamp(10px, 1vw, 12px)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(4px, 0.6vw, 8px)',
              boxShadow: n >= TOTAL_N
                ? '0 4px 16px rgba(16, 185, 129, 0.45)'
                : '0 4px 16px rgba(245, 158, 11, 0.4)',
              transition: 'all 0.2s',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '13px' }}>⚡</span>
            <span>{n >= TOTAL_N ? 'Lapor ke Pak Sutrisno' : 'Teleport ke Pak Sutrisno'}</span>
            <span style={{
              background: 'rgba(0, 0, 0, 0.3)',
              color: '#FEF08A',
              fontSize: '9px',
              padding: '1px 5px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontWeight: 900,
              letterSpacing: '0.5px',
            }}>
              [T]
            </span>
          </motion.button>
        </div>

        {/* Floating Vertical RPG Quest Button (Right Side) */}
        <motion.button
          data-testid="quest-log-trigger"
          whileHover={{ scale: 1.08, boxShadow: n >= TOTAL_N ? '0 0 25px rgba(16, 185, 129, 0.65)' : '0 0 25px rgba(0, 173, 181, 0.55)' }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsInventoryOpen(true)}
          style={{
            position: 'absolute',
            right: 'clamp(8px, 1.2vw, 14px)',
            top: '42%',
            transform: 'translateY(-50%)',
            zIndex: 45,
            background: n >= TOTAL_N 
              ? 'linear-gradient(180deg, #064E3B 0%, #022C22 100%)' 
              : 'linear-gradient(180deg, rgba(45, 26, 18, 0.95) 0%, rgba(26, 13, 8, 0.98) 100%)',
            border: n >= TOTAL_N ? '2.5px solid #10B981' : '2.5px solid #F59E0B',
            borderRadius: 16,
            padding: 'clamp(6px, 1vw, 10px) clamp(4px, 0.8vw, 8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            width: 'clamp(48px, 5.2vw, 60px)',
            cursor: 'pointer',
            boxShadow: n >= TOTAL_N ? '0 6px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(16, 185, 129, 0.35)' : '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(251, 191, 36, 0.35)',
            pointerEvents: 'auto',
            transition: 'all 0.2s',
          }}
        >
          {/* Icon Container with Floating Badge */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 'clamp(18px, 2.2vw, 24px)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}>📜</span>
            {/* Counter Mini Badge */}
            <span style={{
              position: 'absolute',
              top: -6,
              right: -12,
              background: n >= TOTAL_N ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: n >= TOTAL_N ? '#FFFFFF' : '#1F130B',
              borderRadius: 10,
              padding: '1px 5px',
              fontSize: 'clamp(8px, 0.8vw, 9px)',
              fontWeight: 900,
              fontFamily: 'var(--font-data)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              lineHeight: 1.2,
              whiteSpace: 'nowrap'
            }}>
              {n >= TOTAL_N ? '⚡ 24/24' : (cinematicStage === 'sanction_received' || demoMode) ? `${n}/${TOTAL_N}` : 'Temui Pak'}
            </span>
          </div>
          {/* Vertical Label */}
          <span style={{
            fontSize: 'clamp(8px, 0.85vw, 9.5px)',
            fontWeight: 900,
            color: n >= TOTAL_N ? '#34D399' : '#FDE047',
            marginTop: 2
          }}>
            Misi
          </span>
        </motion.button>

        <div style={{ flex: 1, width: '100%', minHeight: 0, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {(() => {
            const aspect = containerDim.w / Math.max(containerDim.h, 1)
            let viewVH: number, viewVW: number, camX: number, camY: number

            if (insideRoom) {
              // Full-screen fixed camera for classroom view
              viewVW = WORLD_VW
              viewVH = WORLD_VH
              camX = 0
              camY = 0
            } else {
              // Scrolling follow-camera for hallway
              viewVH = 380
              viewVW = 380 * aspect
              if (viewVW > WORLD_VW) {
                viewVW = WORLD_VW
                viewVH = WORLD_VW / aspect
              }
              if (currentZone === 'gate' && satpamChatStage !== 'idle') {
                camX = Math.max(0, Math.min(WORLD_VW - viewVW, 770 - viewVW / 2))
                camY = 162
              } else {
                const camCenterX = currentZone === 'gate' ? Math.max(smoothCamPos.current.x, (smoothCamPos.current.x + 840) / 2) : smoothCamPos.current.x
                camX = Math.max(0, Math.min(WORLD_VW - viewVW, camCenterX - viewVW / 2))
                camY = Math.max(0, Math.min(WORLD_VH - viewVH, smoothCamPos.current.y - viewVH * 0.65))
              }
            }
            return (
              <svg viewBox={`${camX} ${camY} ${viewVW} ${viewVH}`} preserveAspectRatio={insideRoom ? "xMidYMid meet" : "none"} style={{ width: '100%', height: '100%', display: 'block', willChange: 'transform' }}>
                <defs>
                  <filter id="avatar-super-glow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComponentTransfer in="blur" result="boost">
                      <feFuncA type="linear" slope="1.5" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode in="boost" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Main Classroom / Map Background Image */}
                <image
                  href={encodeURI(
                    insideRoom 
                      ? (LEVEL1_MAPS[insideRoom.id]?.bgImage || (insideRoom as any).image || currentClassStudents[insideRoom.id]?.image || '/Assets/Building/Kelas.webp')
                      : (currentZone === 'gate' ? '/Assets/Building/Gerbang.jpg' : currentZone === 'facility' ? '/Assets/Building/Fasilitas.webp' : (LEVEL1_MAPS['hallway']?.bgImage || '/Assets/Building/Kelas.webp'))
                  )}
                  x={0}
                  y={0}
                  width={WORLD_VW}
                  height={WORLD_VH}
                  preserveAspectRatio="none"
                  opacity={showDebug ? 0.45 : 1}
                />

                {/* Atmospheric Classroom Overlay */}
                {insideRoom && (
                  <g style={{ pointerEvents: 'none' }}>
                    {/* Warm ambient tint */}
                    <rect x={0} y={0} width={WORLD_VW} height={WORLD_VH} fill="rgba(255, 200, 100, 0.04)" />

                    {/* Cinematic vignette effect */}
                    <defs>
                      <radialGradient id="classroom-vignette" cx="50%" cy="45%" r="65%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="85%" stopColor="rgba(10, 5, 2, 0.15)" />
                        <stop offset="100%" stopColor="rgba(10, 5, 2, 0.35)" />
                      </radialGradient>
                      <linearGradient id="light-ray-1" x1="0.2" y1="0" x2="0.35" y2="1">
                        <stop offset="0%" stopColor="rgba(255, 240, 200, 0.12)" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    <rect x={0} y={0} width={WORLD_VW} height={WORLD_VH} fill="url(#classroom-vignette)" />

                    {/* Subtle window light ray */}
                    <polygon
                      points="0,0 280,0 420,750 100,750"
                      fill="url(#light-ray-1)"
                      opacity={0.6}
                    />
                  </g>
                )}

                {/* Dark Vignette Tint Overlay for Hallway */}
                {!insideRoom && <rect x={0} y={0} width={WORLD_VW} height={WORLD_VH} fill="rgba(4, 7, 10, 0.15)" />}

                {/* ─── VISUAL COLLISION DEBUGGER OVERLAY (Only visible when showDebug === true) ─── */}
                {showDebug && (
                  <g style={{ pointerEvents: 'none' }}>
                    {insideRoom ? (
                      /* ── Inside Classroom Walkable Area Highlight (Green) ── */
                      <g>
                        <rect
                          x={50}
                          y={380}
                          width={WORLD_VW - 100}
                          height={WORLD_VH - 420}
                          fill="rgba(16, 185, 129, 0.35)"
                          stroke="#10b981"
                          strokeWidth={3}
                          strokeDasharray="6,6"
                        />
                        <rect
                          x={WORLD_VW / 2 - 180}
                          y={390}
                          width={360}
                          height={28}
                          rx={8}
                          fill="rgba(15, 23, 42, 0.9)"
                          stroke="#10b981"
                          strokeWidth={1.5}
                        />
                        <text
                          x={WORLD_VW / 2}
                          y={409}
                          textAnchor="middle"
                          fill="#34d399"
                          fontSize={12}
                          fontWeight="900"
                          fontFamily="sans-serif"
                        >
                          🟢 AREA BERJALAN KELAS ({insideRoom.label || insideRoom.id})
                        </text>
                      </g>
                    ) : (
                      /* ── Outdoor / Hallway Walkable Area Highlight (Green) ── */
                      <g>
                        {/* 1. Walkable Area Polygon */}
                        <polygon
                          points={[
                            ...RED_LINE_POINTS.map(p => `${p.x},${p.y}`),
                            `${RED_LINE_POINTS[RED_LINE_POINTS.length - 1].x},640`,
                            `${RED_LINE_POINTS[0].x},640`
                          ].join(' ')}
                          fill="rgba(16, 185, 129, 0.32)"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          strokeDasharray="6,6"
                        />

                        {/* 2. Red Line Wall Base Boundary */}
                        <polyline
                          points={RED_LINE_POINTS.map(p => `${p.x},${p.y}`).join(' ')}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth={3.5}
                        />

                        {/* 5. VISUAL NODE DECORATORS FOR RED_LINE_POINTS */}
                        {RED_LINE_POINTS.map((pt, idx) => (
                          <g key={`red-node-${idx}`}>
                            <circle cx={pt.x} cy={pt.y} r={7} fill="rgba(239, 68, 68, 0.4)" stroke="#ef4444" strokeWidth={1.5} />
                            <circle cx={pt.x} cy={pt.y} r={3} fill="#ffffff" />
                            <rect
                              x={pt.x - 30}
                              y={pt.y - 23}
                              width={60}
                              height={15}
                              rx={4}
                              fill="rgba(15, 23, 42, 0.92)"
                              stroke="#ef4444"
                              strokeWidth={1}
                            />
                            <text
                              x={pt.x}
                              y={pt.y - 12}
                              textAnchor="middle"
                              fill="#f87171"
                              fontSize={8.5}
                              fontWeight="900"
                              fontFamily="monospace"
                            >
                              P{idx + 1}: {pt.x},{pt.y}
                            </text>
                          </g>
                        ))}

                        {/* Zone Boundary Grid Lines */}
                        <line x1={450} y1={410} x2={450} y2={680} stroke="rgba(129, 140, 248, 0.25)" strokeWidth={1.5} strokeDasharray="6,6" />
                        <line x1={800} y1={410} x2={800} y2={680} stroke="rgba(0, 173, 181, 0.25)" strokeWidth={1.5} strokeDasharray="6,6" />
                      </g>
                    )}

                    {/* Player Feet Ground Collision Base Line */}
                    <ellipse cx={charPos.x} cy={charPos.y} rx={22} ry={6} fill="rgba(244, 63, 94, 0.4)" stroke="#f43f5e" strokeWidth={2} />
                    <line x1={charPos.x - 24} y1={charPos.y} x2={charPos.x + 24} y2={charPos.y} stroke="#f43f5e" strokeWidth={2.5} />
                    <text x={charPos.x} y={charPos.y + 18} textAnchor="middle" fill="#f43f5e" fontSize={9} fontWeight="bold">
                      ({Math.round(charPos.x)}, {Math.round(charPos.y)})
                    </text>
                  </g>
                )}

                {/* Map Hotspots: Render Teacher NPC inside room OR Class Doors in hallway */}
                {insideRoom ? (() => {
                  const info = currentClassStudents[insideRoom.id]
                  const teacherName = info?.teacher || LEVEL1_MAPS[insideRoom.id]?.teacher?.name || 'Wali Kelas'
                  const currentMap = LEVEL1_MAPS[insideRoom.id]
                  const teacherConfig = currentMap?.teacher
                  const teacherX = teacherConfig?.x ?? 617
                  const teacherY = teacherConfig?.y ?? 415
                  const hotspotW = teacherConfig?.hotspotW || 140
                  const hotspotH = teacherConfig?.hotspotH || 220
                  const isCompleted = savedClasses.has(insideRoom.id)

                  // Computer Vision & Aspect Ratio accurate character head anchoring
                  const teacherHeight = teacherConfig?.size
                    ? (teacherConfig.size * ((teacherConfig as any).aspectRatio ?? (teacherConfig.cols === 1 ? 2.0 : 1)))
                    : 160
                  const teacherHeadY = teacherConfig?.spriteUrl
                    ? (teacherConfig.cols === 1 ? teacherY - teacherHeight * 0.85 : teacherY - (teacherConfig?.size ? teacherConfig.size * 0.65 : 160))
                    : teacherY - 60
                  const bubbleY = teacherHeadY - 4

                  return (
                    <g key={`room-objects-${insideRoom.id}`}>
                      <g
                        key={`teacher-${insideRoom.id}`}
                        style={{ cursor: 'pointer' }}
                        onClick={e => {
                          e.stopPropagation()
                          handleInteractTeacher(insideRoom)
                        }}
                      >
                      {teacherConfig?.spriteUrl ? (
                        <NPCCharacter
                          key={`teacher-sprite-${insideRoom.id}`}
                          x={teacherX}
                          y={teacherY}
                          size={teacherConfig.size || 250}
                          aspectRatio={(teacherConfig as any)?.aspectRatio}
                          label=""
                          spriteUrl={teacherConfig.spriteUrl}
                          cols={teacherConfig.cols || 5}
                          rows={teacherConfig.rows || 5}
                          totalFrames={teacherConfig.totalFrames || 24}
                          pingPong={teacherConfig.pingPong ?? false}
                          speedMs={teacherConfig.speedMs || 90}
                          glowColor={isCompleted ? "#10B981" : "#F59E0B"}
                          showGlow={teacherConfig.showGlow ?? true}
                          flipX={(teacherConfig as any)?.flipX ?? false}
                          loop={false}
                          onClick={() => handleInteractTeacher(insideRoom)}
                        />
                      ) : (
                        <rect
                          x={teacherX - hotspotW / 2}
                          y={teacherY - hotspotH / 2}
                          width={hotspotW}
                          height={hotspotH}
                          fill="transparent"
                          stroke={showDebug ? '#ff0' : 'none'}
                          strokeWidth={showDebug ? 2 : 0}
                        />
                      )}

                      {/* 1. Default Hover/Interaction Prompt (when no cutscene is active) */}
                      {!teacherCutsceneStage && (
                        <g>
                          <motion.g
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: [0, -4, 0] }}
                            transition={{ y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.3 } }}
                          >
                            <rect
                              x={teacherX - 90}
                              y={bubbleY - 48}
                              width={180}
                              height={38}
                              rx={8}
                              fill="#2D1A12"
                              stroke={isCompleted ? '#10B981' : '#F59E0B'}
                              strokeWidth={2}
                              style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6))' }}
                            />
                            <polygon
                              points={`${teacherX - 7},${bubbleY - 10} ${teacherX + 7},${bubbleY - 10} ${teacherX},${bubbleY}`}
                              fill="#2D1A12"
                              stroke={isCompleted ? '#10B981' : '#F59E0B'}
                              strokeWidth={2}
                              strokeLinejoin="round"
                            />
                            <rect
                              x={teacherX - 8}
                              y={bubbleY - 12}
                              width={16}
                              height={4}
                              fill="#2D1A12"
                            />
                            <text
                              x={teacherX}
                              y={bubbleY - 34}
                              textAnchor="middle"
                              fill="#FDE047"
                              fontSize={11}
                              fontWeight="900"
                              fontFamily="var(--font-ui)"
                              style={{ letterSpacing: '0.3px' }}
                            >
                              {(teacherName.startsWith('Bu') ? '👩‍🏫 ' : '👨‍🏫 ') + teacherName}
                            </text>
                            <text
                              x={teacherX}
                              y={bubbleY - 19}
                              textAnchor="middle"
                              fill={isCompleted ? '#34D399' : '#FBBF24'}
                              fontSize={9}
                              fontWeight="800"
                              fontFamily="var(--font-ui)"
                            >
                              {insideRoom.id === 'Perpustakaan' || insideRoom.id === 'LabKomputer'
                                ? '💬 Klik / Tekan E untuk Berdiskusi'
                                : isCompleted ? '✓ Data Telah Diperoleh' : '💬 Klik / Tekan E untuk Bicara'}
                            </text>
                          </motion.g>
                        </g>
                      )}

                      {/* (Classroom dialogue speech bubbles rendered in top-level Dialogue Overlay Layer below for correct z-index) */}

                    </g>

                    {/* Perpustakaan Bookshelf Learning Station Hotspot */}
                    {insideRoom.id === 'Perpustakaan' && (
                      <g
                        key="library-bookshelf-hotspot"
                        id="hotspot-library-bookshelf"
                        style={{ cursor: 'pointer' }}
                        onClick={e => {
                          e.stopPropagation()
                          setShowLibraryBookModal(true)
                        }}
                      >
                        {/* Interactive Click Hitbox */}
                        <rect
                          x={280 - 80}
                          y={440 - 50}
                          width={160}
                          height={100}
                          fill="transparent"
                          pointerEvents="all"
                        />
                        <motion.circle
                          cx={280}
                          cy={440}
                          r={24}
                          fill="rgba(16, 185, 129, 0.2)"
                          animate={{ scale: [1, 1.4, 1], fill: ['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.45)', 'rgba(16, 185, 129, 0.2)'] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <circle cx={280} cy={440} r={14} fill="#10B981" stroke="#FFFFFF" strokeWidth={1.5} />
                        <text x={280} y={444} textAnchor="middle" fontSize={11} style={{ userSelect: 'none', pointerEvents: 'none' }}>
                          📖
                        </text>
                        <rect
                          x={280 - 75}
                          y={440 - 42}
                          width={150}
                          height={22}
                          rx={6}
                          fill="#2D1A12"
                          stroke={nearLibraryShelf ? '#059669' : '#8C6239'}
                          strokeWidth={nearLibraryShelf ? 2 : 1.5}
                          style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
                        />
                        <text
                          x={280}
                          y={440 - 27}
                          textAnchor="middle"
                          fill="#362014"
                          fontSize={9.5}
                          fontWeight="900"
                          fontFamily="var(--font-ui)"
                        >
                          {nearLibraryShelf ? '[ E ] 📖 Baca Buku Statistika' : '📖 Rak Buku Statistika'}
                        </text>
                      </g>
                    )}

                    {/* Lab Komputer Terminal Learning Station Hotspot */}
                    {insideRoom.id === 'LabKomputer' && (
                      <g
                        key="lab-terminal-hotspot"
                        id="hotspot-lab-terminal"
                        style={{ cursor: 'pointer' }}
                        onClick={e => {
                          e.stopPropagation()
                          setShowLabTerminalModal(true)
                        }}
                      >
                        {/* Interactive Click Hitbox */}
                        <rect
                          x={300 - 85}
                          y={440 - 50}
                          width={170}
                          height={100}
                          fill="transparent"
                          pointerEvents="all"
                        />
                        <motion.circle
                          cx={300}
                          cy={440}
                          r={24}
                          fill="rgba(56, 189, 248, 0.2)"
                          animate={{ scale: [1, 1.4, 1], fill: ['rgba(56, 189, 248, 0.2)', 'rgba(56, 189, 248, 0.45)', 'rgba(56, 189, 248, 0.2)'] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <circle cx={300} cy={440} r={14} fill="#0284C7" stroke="#F59E0B" strokeWidth={1.5} />
                        <text x={300} y={444} textAnchor="middle" fontSize={11} style={{ userSelect: 'none', pointerEvents: 'none' }}>
                          💻
                        </text>
                        <rect
                          x={300 - 80}
                          y={440 - 42}
                          width={160}
                          height={22}
                          rx={6}
                          fill="#2D1A12"
                          stroke={nearLabTerminal ? '#0284C7' : '#8C6239'}
                          strokeWidth={nearLabTerminal ? 2 : 1.5}
                          style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
                        />
                        <text
                          x={300}
                          y={440 - 27}
                          textAnchor="middle"
                          fill="#362014"
                          fontSize={9.5}
                          fontWeight="900"
                          fontFamily="var(--font-ui)"
                        >
                          {nearLabTerminal ? '[ E ] 💻 Buka Terminal Digital' : '💻 Terminal Literasi Digital'}
                        </text>
                      </g>
                    )}
                  </g>
                )
              })() : currentZone === 'facility' ? (
                FACILITY_DOORS.map(fac => {
                  const isNear = nearFacility?.id === fac.id
                  return (
                    <g
                      key={fac.id}
                      id={`facility-door-${fac.id}`}
                      style={{ cursor: 'pointer' }}
                      onClick={e => {
                        e.stopPropagation()
                        if (fac.roomId) {
                          enterFacilityRoom(fac)
                        } else {
                          setActiveFacility(fac)
                          gameAudio.playDoorOpen()
                        }
                      }}
                    >
                        {/* Non-interactive guard post scenery */}

                        {/* Hotspot Icon Badge */}
                        <circle
                          cx={fac.x}
                          cy={fac.y}
                          r={14}
                          fill="#FFFDF7"
                          stroke={isNear ? '#8C6239' : fac.color}
                          strokeWidth={isNear ? 2.5 : 1.5}
                          style={{ filter: `drop-shadow(0 2px 6px rgba(0,0,0,0.25))` }}
                        />
                        <text
                          x={fac.x}
                          y={fac.y + 1}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={12}
                          style={{ userSelect: 'none', pointerEvents: 'none' }}
                        >
                          {fac.icon}
                        </text>

                        {/* Hotspot Title Card */}
                        <rect
                          x={fac.x - 65}
                          y={fac.y - 38}
                          width={130}
                          height={22}
                          rx={6}
                          fill="#2D1A12"
                          stroke={isNear ? '#B45309' : '#8C6239'}
                          strokeWidth={isNear ? 2 : 1.5}
                          style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
                        />
                        <text
                          x={fac.x}
                          y={fac.y - 24}
                          textAnchor="middle"
                          fill="#FEF3C7" fontSize={10}
                          fontWeight="bold"
                          fontFamily="var(--font-ui)"
                        >
                          {fac.label}
                        </text>
                      </g>
                    )
                  })
                ) : ((cinematicStage === 'sanction_received' || demoMode) ? doors.map(door => {
                  const isRG = door.id === 'RG'
                  const isDataComplete = collected.size >= TOTAL_N || savedClasses.size >= 4
                  const isKittenFound = catQuestStage === 'kitten_rescued' || catQuestStage === 'completed'
                  const isRGUnlocked = isRG && isDataComplete && isKittenFound
                  const isSaved = !isRG && savedClasses.has(door.id)
                  const open = isRG ? isRGUnlocked : unlocked.has(door.id)
                  const near = nearClass?.id === door.id
                  const isJustCompleted = justCompletedClassId === door.id

                  return (
                    <g
                      key={door.id}
                      id={`class-door-${door.id}`}
                      style={{ cursor: isSaved ? 'default' : 'pointer' }}
                      onClick={e => {
                        e.stopPropagation()
                        if (isRG) {
                          if (isRGUnlocked) {
                            enterClassroom(door)
                          } else {
                            gameAudio.playError()
                            if (!isDataComplete && !isKittenFound) {
                              setRgLockedToast(`🔒 Ruang Guru Terkunci! Kumpulkan data 4 kelas (${collected.size}/${TOTAL_N}) dan temukan anak kucing yang hilang terlebih dahulu!`)
                            } else if (!isKittenFound) {
                              setRgLockedToast(`🔒 Ruang Guru Terkunci! Kamu harus menemukan anak kucing yang hilang terlebih dahulu sebelum melapor ke Pak Sutrisno!`)
                            } else {
                              setRgLockedToast(`🔒 Ruang Guru Terkunci! Kumpulkan seluruh data dari 4 kelas terlebih dahulu (${collected.size}/${TOTAL_N}).`)
                            }
                            setTimeout(() => setRgLockedToast(null), 2500)
                          }
                          return
                        }
                        if (isSaved) return
                                                enterClassroom(door)
                      }}
                    >
                      {/* Interactive Pulse Radar Glow */}
                      {isRG ? (
                        isRGUnlocked ? (
                          <motion.circle
                            cx={door.x}
                            cy={door.y}
                            r={24}
                            fill="#10B98133"
                            animate={{ scale: [1, 1.45, 1], fill: ['#10B98133', '#10B98177', '#10B98133'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        ) : (
                          <circle cx={door.x} cy={door.y} r={14} fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth={1} />
                        )
                      ) : !isSaved && (!open || isJustCompleted) ? (
                        <motion.circle
                          cx={door.x}
                          cy={door.y}
                          r={20}
                          fill={`${door.color}22`}
                          animate={isJustCompleted
                            ? { scale: [1, 1.8, 1], fill: [`${door.color}33`, '#10B981', `${door.color}22`] }
                            : near
                              ? { scale: [1, 1.4, 1], fill: [`${door.color}33`, `${door.color}77`, `${door.color}33`] }
                              : { scale: [0.95, 1.15, 0.95] }
                          }
                          transition={{ duration: isJustCompleted ? 1.2 : 1.5, repeat: isJustCompleted ? 0 : Infinity, ease: 'easeInOut' }}
                        />
                      ) : (
                        <circle cx={door.x} cy={door.y} r={12} fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth={1} />
                      )}

                      {/* Hotspot Icon Badge */}
                      <circle
                        cx={door.x}
                        cy={door.y}
                        r={12}
                        fill={isRG ? (isRGUnlocked ? '#059669' : '#B45309') : isSaved ? '#059669' : open ? '#0284C7' : '#8C6239'}
                        stroke={near ? '#FEF3C7' : '#8C6239'}
                        strokeWidth={near ? 2 : 1.5}
                      />
                      <text
                        x={door.x}
                        y={door.y + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={10}
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                      >
                        {isRG ? (isRGUnlocked ? '🔓' : '🔒') : isSaved ? '✓' : open ? '🔓' : '📍'}
                      </text>

                      {/* Hotspot Title Card */}
                      <rect
                        x={door.x - (isRG ? 52 : 45)}
                        y={door.y - 36}
                        width={isRG ? 104 : 90}
                        height={20}
                        rx={6}
                        fill="#2D1A12"
                        stroke={near ? '#B45309' : isRG ? (isRGUnlocked ? '#059669' : '#B45309') : isSaved ? '#059669' : '#8C6239'}
                        strokeWidth={near ? 2 : 1.5}
                        style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
                      />
                      <text
                        x={door.x}
                        y={door.y - 23}
                        textAnchor="middle"
                        fill={isRG ? (isRGUnlocked ? '#34D399' : '#FBBF24') : isSaved ? '#34D399' : '#FEF3C7'}
                        fontSize={9.5}
                        fontWeight="bold"
                        fontFamily="var(--font-ui)"
                      >
                        {isRG ? (isRGUnlocked ? 'Ruang Guru (Buka)' : 'Ruang Guru 🔒') : isSaved ? `${door.label} (Selesai)` : door.label}
                      </text>
                    </g>
                  )
                }) : null)}

                {/* Zone Transition Gateway Marker (Rendered in outdoor courtyard in both zones) */}
                {!insideRoom && currentZone !== 'gate' && (() => {
                  const isMainLocked = currentZone === 'main' && !isTaskGiven
                  const markerColor = isMainLocked ? '#F59E0B' : currentZone === 'main' ? '#38BDF8' : '#10B981'
                  const markerBg = isMainLocked ? 'rgba(245, 158, 11, 0.12)' : currentZone === 'main' ? 'rgba(56, 189, 248, 0.16)' : 'rgba(16, 185, 129, 0.16)'
                  const markerText = isMainLocked
                    ? '🔒 AREA FASILITAS TERKUNCI (Lapor ke Pak Sutrisno Dahulu)'
                    : currentZone === 'main'
                    ? '🚶‍♂️ ▼ KE AREA FASILITAS (Kantin, Lab, Perpus)'
                    : '🚶‍♂️ ▲ KE HALAMAN UTAMA (Kelas & Ruang Guru)'
                  const boxWidth = isMainLocked ? 336 : 290
                  // Realistic interaction: marker is only a signpost until Stevunt walks near the bottom edge
                  const isNearGateway = charPos.y >= 590 && Math.abs(charPos.x - 625) < 220

                  return (
                    <g
                      key={`gateway-${currentZone}`}
                      id={`gateway-${currentZone}`}
                      data-testid="gateway-marker"
                      data-near={isNearGateway ? 'true' : 'false'}
                      style={{
                        cursor: isNearGateway ? 'pointer' : 'default',
                        pointerEvents: isNearGateway ? 'auto' : 'none',
                        opacity: isNearGateway ? 1 : 0.7,
                        transition: 'opacity 0.25s ease',
                      }}
                      onClick={isNearGateway ? (currentZone === 'main' ? goToFacilityZone : goToMainZone) : undefined}
                    >
                      {/* Ground pulsing elliptical carpet */}
                      <motion.ellipse
                        cx={625}
                        cy={628}
                        rx={isMainLocked ? 140 : 125}
                        ry={16}
                        fill={markerBg}
                        stroke={markerColor}
                        strokeWidth={1.5}
                        strokeDasharray={isMainLocked ? "4,4" : "6,4"}
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <rect
                        x={625 - boxWidth / 2}
                        y={608}
                        width={boxWidth}
                        height={26}
                        rx={13}
                        fill="#2D1A12"
                        stroke={isMainLocked ? '#F59E0B' : '#F59E0B'}
                        strokeWidth={1.5}
                        style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.3))' }}
                      />
                      <text
                        x={625}
                        y={624}
                        textAnchor="middle"
                        fill={isMainLocked ? '#FBBF24' : '#FEF3C7'}
                        fontSize={9.6}
                        fontWeight="900"
                        fontFamily="var(--font-ui)"
                        style={{ userSelect: 'none', pointerEvents: 'none', letterSpacing: '0.4px' }}
                      >
                        {markerText}
                      </text>
                    </g>
                  )
                })()}

                {/* Gate Entry Gateway Marker & Pos Satpam Hotspot (When in Gate Zone) */}
                {!insideRoom && currentZone === 'gate' && (
                  <>
                    <g
                      key="gateway-gate"
                      style={{ cursor: 'pointer' }}
                      onClick={attemptEnterSchoolFromGate}
                    >
                      {/* Subtle ground guide ellipse on the open driveway */}
                      <motion.ellipse
                        cx={617}
                        cy={410}
                        rx={75}
                        ry={12}
                        fill="rgba(16, 185, 129, 0.12)"
                        stroke="#10B981"
                        strokeWidth={1.2}
                        strokeDasharray="4,4"
                        animate={{ opacity: [0.35, 0.75, 0.35] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </g>

                    {/* Pak Joko (Satpam Sekolah) Standing NPC */}
                    <g
                    key="pak-joko-npc"
                    style={{ pointerEvents: 'none' }}
                  >
                      {/* Character ground shadow */}
                      <ellipse cx={930} cy={475} rx={22} ry={8} fill="rgba(0, 0, 0, 0.45)" />

                      {/* Interactive Pulse Radar Glow */}
                      {/* Pak Joko Full-Body Sprite */}
                      <image
                        href="/Assets/Character/pak-joko-satpam.png"
                        x={930 - 43}
                        y={475 - 138}
                        width={86}
                        height={138}
                        preserveAspectRatio="xMidYMid meet"
                        style={{ imageRendering: 'pixelated', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}
                      />

                      
                    </g>
                  </>
                )}

                {/* Dynamic Perspective Depth Scaling Calculation */}
                {(() => {
                  const depthRatio = Math.max(0, Math.min(1, (charPos.y - 410) / (650 - 410)))
                  // Proportional character size: when inside rooms, student Stevunt scales ~310px-430px (visual height ~195px-270px) matching classroom perspective
                  const baseCharSize = insideRoom ? (310 + depthRatio * 120) : 145 + depthRatio * 65
                  const charSize = baseCharSize
                  const btnY = charPos.y - (insideRoom ? charSize * 0.72 : charSize * 0.95)
                  const btnTextY = btnY + 14

                  return (
                    <>
                      {/* Pak Sutrisno NPC (Only in Hallway / Lapangan BEFORE sanction_received AND in main zone) */}
                      {!insideRoom && currentZone === 'main' && cinematicStage !== 'sanction_received' && (() => {
                        const pakX = PAK_SUTRISNO_POS.x
                        const pakY = PAK_SUTRISNO_POS.y
                        const pakDepth = Math.max(0, Math.min(1, (pakY - 410) / (650 - 410)))
                        const pakSize = 145 + pakDepth * 65
                        const distToPak = Math.hypot(charPos.x - pakX, charPos.y - pakY)
                        const isNearPak = distToPak < 135

                        const handleTalkToPak = (e?: React.MouseEvent) => {
                          if (e) e.stopPropagation()
                          if (cinematicStage === 'player_intro') {
                            setCinematicStage('panning_to_pak')
                          } else if (cinematicStage === 'pak_shouting') {
                            setCinematicStage('pak_shouting_2')
                          } else if (cinematicStage === 'pak_shouting_2') {
                            setCinematicStage('panning_to_player')
                          } else if (cinematicStage === 'quest_meet_pak' || cinematicStage === 'pak_sanction_1') {
                            setCinematicStage('pak_sanction_2')
                          } else if (cinematicStage === 'pak_sanction_2') {
                            setCinematicStage('pak_sanction_3')
                          } else if (cinematicStage === 'pak_sanction_3') {
                            setCinematicStage('player_reply_pak')
                          } else if (cinematicStage === 'player_reply_pak') {
                            setCinematicStage('sanction_received')
                            gameAudio.playUnlockJingle()
                            setRoomMilestoneText('TUGAS DITERIMA! 📋 AREA FASILITAS & KELAS TERBUKA!')
                            setTimeout(() => setRoomMilestoneText(null), 3000)
                          }
                        }

                        const renderPak = (
                          <NPCCharacter
                            key="pak-sutrisno-npc"
                            x={pakX}
                            y={pakY}
                            size={pakSize}
                            label=""
                            spriteUrl="/Assets/Character/pak Sutrisno-iso_idle_right-trimmed.png"
                            cols={5}
                            rows={4}
                            flipX={true}
                            glowColor="#38BDF8"
                            onClick={handleTalkToPak}
                          />
                        )

                        const isSpeechActive = ['pak_shouting', 'pak_shouting_2', 'pak_sanction_1', 'pak_sanction_2', 'pak_sanction_3', 'player_reply_pak'].includes(cinematicStage)
                        const isSanctionStage = ['pak_sanction_1', 'pak_sanction_2', 'pak_sanction_3'].includes(cinematicStage)

                        {/* Speech bubble for Pak Sutrisno */}
                        const renderShoutBubble = isSpeechActive && cinematicStage !== 'player_reply_pak' && (() => {
                          const isSanctionStage = ['pak_sanction_1', 'pak_sanction_2', 'pak_sanction_3'].includes(cinematicStage)
                          const bubbleW = isSanctionStage ? 390 : 260
                          const bubbleH = isSanctionStage ? 88 : 58
                          const pakHeadTop = pakY - pakSize * 0.78
                          const bBottomY = pakHeadTop - 12
                          const bubbleLeft = Math.max(camX + 12, Math.min(camX + VIEW_VW - bubbleW - 24, pakX - bubbleW / 2))
                          const bubbleTop = Math.max(camY + 8, bBottomY - bubbleH)
                          const tailTipY = pakHeadTop + 2

                          const bubblePath = getSpeechBubblePath(bubbleLeft, bubbleTop, bubbleW, bubbleH, 14, pakX, tailTipY, 22)

                          return (
                            <g
                              key="pak-shout-bubble"
                              style={{ cursor: 'pointer' }}
                              onClick={handleTalkToPak}
                            >
                              {/* 1. Seamless Comic Vector Balloon (Body + Pointer Tail) */}
                              <path
                                d={bubblePath}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                style={{ filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.75))' }}
                              />

                              {/* 2. Text Content inside ForeignObject */}
                              <foreignObject x={bubbleLeft} y={bubbleTop} width={bubbleW} height={bubbleH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  boxSizing: 'border-box',
                                  padding: '8px 14px 6px 14px',
                                  background: 'transparent',
                                  border: 'none',
                                  boxShadow: 'none',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  userSelect: 'none',
                                }}>
                                  <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#FDE047', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                    Pak Sutrisno
                                  </div>
                                  <div style={{
                                    fontSize: '10.2px',
                                    fontWeight: 800,
                                    color: '#FEF3C7',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.34,
                                    margin: '2px 0',
                                  }}>
                                    {cinematicStage === 'pak_shouting' && '"Hey kamu! Baru jam segini sampai sekolah?!"'}
                                    {cinematicStage === 'pak_shouting_2' && '"Kamu kesini!"'}
                                    {cinematicStage === 'pak_sanction_1' && (
                                      <>
                                        "Kamu terlambat lagi! Bel sekolah sudah lama berbunyi,"
                                        <br />
                                        "dan kamu baru nongol di lapangan sekarang!"
                                        <br />
                                        <span style={{ color: '#FDE68A' }}>"Pasti semalam keasyikan mantengin layar HP sampai lupa waktu, kan?!"</span>
                                      </>
                                    )}
                                    {cinematicStage === 'pak_sanction_2' && (
                                      <>
                                        "Tapi pas sekali! Pak Guru sedang memimpin <span style={{ color: '#38BDF8', fontWeight: 900 }}>proyek riset penelitian</span>"
                                        <br />
                                        "tentang <span style={{ color: '#F59E0B', fontWeight: 900 }}>durasi screen time siswa SMP</span> untuk menguji isu viral di media!"
                                      </>
                                    )}
                                    {cinematicStage === 'pak_sanction_3' && (
                                      <>
                                        "Sebagai sanksinya, kamu jadi <span style={{ color: '#34D399', fontWeight: 900 }}>asisten peneliti dadakan</span>!"
                                        <br />
                                        "Kumpulkan <span style={{ color: '#38BDF8', fontWeight: 900 }}>24 sampel data</span> dari Wali Kelas VII-A, VII-B, VIII-A, &amp; VIII-B,"
                                        <br />
                                        "lalu bawa ke <span style={{ color: '#F59E0B', fontWeight: 900 }}>Ruang Guru</span> untuk kita analisis bersama!"
                                      </>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9.5px', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                      [ Klik / Tap ▶ ]
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                            </g>
                          )
                        })()

                        {/* Player Opening Monologue Speech Bubble */}
                        const renderPlayerIntroBubble = cinematicStage === 'player_intro' && (() => {
                          const pW = 250
                          const pH = 64
                          const playerHeadTop = charPos.y - charSize * 0.78
                          const pBottomY = playerHeadTop - 12
                          const pY = Math.max(camY + 8, pBottomY - pH)
                          const pLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - pW - 10, charPos.x - pW / 2))
                          const playerBubblePath = getSpeechBubblePath(pLeft, pY, pW, pH, 14, charPos.x, playerHeadTop + 2, 20)

                          return (
                            <g
                              key="player-intro-bubble"
                              style={{ cursor: 'pointer' }}
                              onClick={handleTalkToPak}
                            >
                              <path
                                d={playerBubblePath}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                style={{ filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.75))' }}
                              />
                              <foreignObject x={pLeft} y={pY} width={pW} height={pH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  boxSizing: 'border-box',
                                  padding: '8px 12px 6px 12px',
                                  background: 'transparent',
                                  border: 'none',
                                  boxShadow: 'none',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  userSelect: 'none',
                                }}>
                                  <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#FDE047', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                    Kamu
                                  </div>
                                  <div style={{
                                    fontSize: '10.5px',
                                    fontWeight: 800,
                                    color: '#FEF3C7',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                  }}>
                                    "Duh... aku terlambat lagi ke sekolah!"
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                      [ Klik / Tap ▶ ]
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                            </g>
                          )
                        })()

                        {/* Player Reply Speech Bubble */}
                        const renderPlayerReplyBubble = cinematicStage === 'player_reply_pak' && (() => {
                          const pW = 320
                          const pH = 74
                          const playerHeadTop = charPos.y - charSize * 0.78
                          const pBottomY = playerHeadTop - 12
                          const pY = Math.max(camY + 8, pBottomY - pH)
                          const pLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - pW - 10, charPos.x - pW / 2))
                          const playerBubblePath = getSpeechBubblePath(pLeft, pY, pW, pH, 14, charPos.x, playerHeadTop + 2, 20)

                          return (
                            <g
                              key="player-reply-bubble"
                              style={{ cursor: 'pointer' }}
                              onClick={handleTalkToPak}
                            >
                              <path
                                d={playerBubblePath}
                                fill="#2D1A12"
                                stroke="#10B981"
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                style={{ filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.75))' }}
                              />
                              <foreignObject x={pLeft} y={pY} width={pW} height={pH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  boxSizing: 'border-box',
                                  padding: '8px 12px 6px 12px',
                                  background: 'transparent',
                                  border: 'none',
                                  boxShadow: 'none',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  userSelect: 'none',
                                }}>
                                  <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#34D399', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                                    Kamu
                                  </div>
                                  <div style={{
                                    fontSize: '10.5px',
                                    fontWeight: 800,
                                    color: '#FEF3C7',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                  }}>
                                    "Siap Pak Sutrisno! Demi proyek riset ini, saya keliling kumpulkan 24 data sekarang juga!"
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#34D399', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                      [ 📝 Mulai Investigasi ▶ ]
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                            </g>
                          )
                        })()

                        {/* Glowing Waypoint Arrow towards Pak Sutrisno during intro quest */}
                        const renderWaypointArrow = (cinematicStage === 'quest_meet_pak' && !isNearPak) && (
                          <g key="waypoint-arrow" style={{ pointerEvents: 'none' }}>
                            <circle cx={pakX} cy={pakY - 120} r={16} fill="rgba(56, 189, 248, 0.2)" stroke="#38BDF8" strokeWidth={2} />
                            <text x={pakX} y={pakY - 115} textAnchor="middle" fill="#38BDF8" fontSize={18} fontWeight="900">
                              ↓
                            </text>
                          </g>
                        )

                        const buttonW = 200
                        const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                        const textX = buttonLeft + buttonW / 2

                        const renderPrompt = isNearPak && !isSpeechActive && (
                          <motion.g
                            key="btn-talk-pak-sutrisno"
                            initial={{ opacity: 0, scale: 0.8, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 5 }}
                            onClick={handleTalkToPak}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ cursor: 'pointer' }}
                          >
                            <rect
                                x={buttonLeft}
                                y={btnY}
                                width={buttonW}
                                height={26}
                                rx={13}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#FEF3C7"
                              fontSize={10}
                              fontWeight="bold"
                              fontFamily="var(--font-ui)"
                            >
                              💬 Bicara dengan Pak Sutrisno
                            </text>
                          </motion.g>
                        )

                        return (
                          <g key="pak-sutrisno-group">
                            {renderPak}
                            {renderShoutBubble}
                            {renderPlayerIntroBubble}
                            {renderPlayerReplyBubble}
                            {renderWaypointArrow}
                            {renderPrompt}
                          </g>
                        )
                      })()}

                      {/* Glowing Waypoint Arrow pointing to Ruang Guru when all 24 data points collected */}
                      {(collected.size >= TOTAL_N || savedClasses.size >= 4) && !insideRoom && currentZone === 'main' && (
                        <g key="waypoint-arrow-rg" style={{ pointerEvents: 'none' }}>
                          <motion.circle
                            cx={625}
                            cy={280}
                            r={16}
                            fill="rgba(16, 185, 129, 0.25)"
                            stroke="#10B981"
                            strokeWidth={2}
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                          />
                          <motion.text
                            x={625}
                            y={285}
                            textAnchor="middle"
                            fill="#059669"
                            fontSize={18}
                            fontWeight="900"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            ↓
                          </motion.text>
                          <rect
                            x={625 - 75}
                            y={240}
                            width={150}
                            height={22}
                            rx={6}
                            fill="#2D1A12"
                            stroke="#059669"
                            strokeWidth={2}
                            style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
                          />
                          <text
                            x={625}
                            y={254}
                            textAnchor="middle"
                            fill="#059669"
                            fontSize={9.5}
                            fontWeight="900"
                            fontFamily="var(--font-ui)"
                          >
                            ✨ Temui Pak Sutrisno di Ruang Guru!
                          </text>
                        </g>
                      )}

                      {/* ── Player Character & Cat Quest Depth-Sorted Rendering ── */}
                      {(() => {
                        const renderMotherCat = !insideRoom && currentZone === 'main' && catQuestStage !== 'untriggered' ? (
                          <g
                            key="mother-cat-group"
                            id="mother-cat-group"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              if (catQuestStage === 'completed') {
                                gameAudio.playCatPurr()
                              } else {
                                gameAudio.playCatMeow()
                              }
                              setShowMotherCatModal(true)
                            }}
                          >
                            <NPCCharacter
                              key="mother-cat-npc"
                              x={motherCatPos.x}
                              y={motherCatPos.y}
                              size={52}
                              label=""
                              spriteUrl="/Assets/CatPack/Idle.png"
                              cols={10}
                              rows={1}
                              totalFrames={10}
                              speedMs={140}
                              pingPong={true}
                              glowColor={catQuestStage === 'completed' ? '#10B981' : '#F59E0B'}
                              onClick={() => {
                                gameAudio.playCatMeow()
                                setShowMotherCatModal(true)
                              }}
                            />
                            {/* If quest completed, Kitten Mochi is reunited happily beside Mimi */}
                            {catQuestStage === 'completed' && (
                              <NPCCharacter
                                key="reunited-kitten-npc"
                                x={motherCatPos.x + 36}
                                y={motherCatPos.y + 4}
                                size={46}
                                label=""
                                spriteUrl="/Assets/CatPack/Box3.png"
                                cols={4}
                                rows={1}
                                totalFrames={4}
                                speedMs={180}
                                pingPong={true}
                                glowColor="#10B981"
                                onClick={() => {
                                  gameAudio.playCatPurr()
                                  setShowMotherCatModal(true)
                                }}
                              />
                            )}
                            {/* Name Tag */}
                            <g
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                gameAudio.playCatMeow()
                                setShowMotherCatModal(true)
                              }}
                            >
                              <rect
                                x={motherCatPos.x - 45}
                                y={motherCatPos.y - 48}
                                width={90}
                                height={20}
                                rx={10}
                                fill="#2D1A12"
                                stroke={catQuestStage === 'completed' ? '#10B981' : '#F59E0B'}
                                strokeWidth={1.5}
                                style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
                              />
                              <text
                                x={motherCatPos.x}
                                y={motherCatPos.y - 34}
                                textAnchor="middle"
                                fill={catQuestStage === 'completed' ? '#34D399' : '#FEF3C7'}
                                fontSize={9.5}
                                fontWeight="900"
                                fontFamily="var(--font-ui)"
                              >
                                {catQuestStage === 'completed' ? '🐾 Mimi & Mochi' : '🐱 Mimi'}
                              </text>

                              {/* Bouncing Quest Indicator */}
                              {catQuestStage === 'cat_spawned' && (
                                <g style={{ pointerEvents: 'none' }}>
                                  <circle cx={motherCatPos.x} cy={motherCatPos.y - 62} r={9} fill="#F59E0B" stroke="#FFFFFF" strokeWidth={1.5} />
                                  <text x={motherCatPos.x} y={motherCatPos.y - 58.5} textAnchor="middle" fill="#091322" fontSize={11} fontWeight="900" fontFamily="var(--font-ui)">!</text>
                                </g>
                              )}
                              {catQuestStage === 'kitten_rescued' && (
                                <g style={{ pointerEvents: 'none' }}>
                                  <circle cx={motherCatPos.x} cy={motherCatPos.y - 62} r={9} fill="#10B981" stroke="#FFFFFF" strokeWidth={1.5} />
                                  <text x={motherCatPos.x} y={motherCatPos.y - 59} textAnchor="middle" fill="#FFFFFF" fontSize={9} fontWeight="900">❤️</text>
                                </g>
                              )}
                            </g>
                          </g>
                        ) : null

                        const isKittenVisible =
                          catQuestStage === 'quest_active' && (
                            (kittenLocation.zone === 'Perpustakaan' && insideRoom?.id === 'Perpustakaan') ||
                            (kittenLocation.zone === 'LabKomputer' && insideRoom?.id === 'LabKomputer') ||
                            (kittenLocation.zone === 'facility_courtyard' && currentZone === 'facility' && !insideRoom) ||
                            (kittenLocation.zone === 'hallway' && currentZone === 'main' && !insideRoom)
                          )

                        const renderKittenBox = isKittenVisible ? (
                          <g
                            key="kitten-in-box-group"
                            id="kitten-in-box-group"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              gameAudio.playCatMeow()
                              setShowKittenRescueModal(true)
                            }}
                          >
                            <NPCCharacter
                              key="kitten-box-npc"
                              x={kittenLocation.x}
                              y={kittenLocation.y}
                              size={60}
                              label=""
                              spriteUrl="/Assets/CatPack/Box3.png"
                              cols={4}
                              rows={1}
                              totalFrames={4}
                              speedMs={180}
                              pingPong={true}
                              glowColor="#10B981"
                              onClick={() => {
                                gameAudio.playCatMeow()
                                setShowKittenRescueModal(true)
                              }}
                            />
                            {/* Animated Rescue Indicator */}
                            <motion.g
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                gameAudio.playCatMeow()
                                setShowKittenRescueModal(true)
                              }}
                            >
                              <rect
                                x={kittenLocation.x - 60}
                                y={kittenLocation.y - 54}
                                width={120}
                                height={22}
                                rx={11}
                                fill="#2D1A12"
                                stroke="#059669"
                                strokeWidth={1.5}
                                style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
                              />
                              <text
                                x={kittenLocation.x}
                                y={kittenLocation.y - 39}
                                textAnchor="middle"
                                fill="#059669"
                                fontSize={9.5}
                                fontWeight="900"
                                fontFamily="var(--font-ui)"
                              >
                                📦 Mochi (Kucing dlm Kardus)
                              </text>
                            </motion.g>
                          </g>
                        ) : null

                        return (
                          <>
                            {motherCatPos.y < charPos.y && renderMotherCat}
                            {kittenLocation.y < charPos.y && renderKittenBox}
                            <PlayerCharacter
                              x={charPos.x}
                              y={charPos.y}
                              dir={moveDir}
                              size={charSize}
                              facing={insideRoom && ['A1', 'A2', 'B1', 'B2'].includes(insideRoom.id) ? 'left' : (insideRoom?.id === 'RG' ? 'right' : undefined)}
                            />
                            {motherCatPos.y >= charPos.y && renderMotherCat}
                            {kittenLocation.y >= charPos.y && renderKittenBox}
                          </>
                        )
                      })()}

                      {/* Floating Interactive Prompt Buttons */}
                      <AnimatePresence>
                        {/* 0A. Gate Player Monologue Speech Bubble */}
                        {currentZone === 'gate' && cinematicStage === 'gate_intro' && gateBubbleStep < 2 && satpamChatStage === 'idle' && (() => {
                          const pW = 270
                          const pH = 68
                          const playerHeadTop = charPos.y - charSize * 0.78
                          const pBottomY = playerHeadTop - 12
                          const pY = Math.max(camY + 8, pBottomY - pH)
                          const pLeft = Math.max(camX + 10, Math.min(camX + viewVW - pW - 10, charPos.x - pW / 2))
                          const bubblePath = getSpeechBubblePath(pLeft, pY, pW, pH, 14, charPos.x, playerHeadTop + 2, 20)
                          const bubbleText = gateBubbleStep === 0
                            ? '"Waduh, gawat! Bel sekolah udah bunyi dari tadi, aku telat nih!"'
                            : '"Harus cepat lari masuk sebelum gerbang dikunci!"'

                          return (
                            <motion.g
                              key={`gate-intro-bubble-${gateBubbleStep}`}
                              id="gate-intro-bubble"
                              initial={{ opacity: 0, scale: 0.9, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 5 }}
                              style={{ cursor: 'pointer' }}
                              onClick={() => setGateBubbleStep(p => p + 1)}
                            >
                              <path
                                d={bubblePath}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                style={{ filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.75))' }}
                              />
                              <foreignObject x={pLeft} y={pY} width={pW} height={pH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  boxSizing: 'border-box',
                                  padding: '8px 12px 6px 12px',
                                  background: 'transparent',
                                  border: 'none',
                                  boxShadow: 'none',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  userSelect: 'none',
                                }}>
                                  <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#FDE047', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                    Stevunt
                                  </div>
                                  <div style={{
                                    fontSize: '10.5px',
                                    fontWeight: 800,
                                    color: '#FEF3C7',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                  }}>
                                    {bubbleText}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                      {gateBubbleStep === 0 ? '[ Klik / Spasi ▶ ]' : '[ 🏃 Ayo Masuk! ▶ ]'}
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                            </motion.g>
                          )
                        })()}

                        {/* 0A-2. Pak Joko (Satpam) Multi-Step Cloud Chat Bubbles (Like Pak Sutrisno) */}
                        {currentZone === 'gate' && !insideRoom && (
                          satpamChatStage === 'pak_stop_1' ||
                          satpamChatStage === 'pak_stop_2' ||
                          satpamChatStage === 'pak_wrong' ||
                          satpamChatStage === 'pak_pass_1' ||
                          satpamChatStage === 'pak_pass_2'
                        ) && (() => {
                          const jokoX = 930
                          const jokoHeadTop = 328
                          const bW = 345
                          const bH = 88
                          const bLeft = Math.max(camX + 10, Math.min(camX + viewVW - bW - 20, jokoX - bW * 0.58))
                          const bBottomY = jokoHeadTop - 12
                          const bTop = Math.max(camY + 8, bBottomY - bH)
                          const tailTipY = jokoHeadTop + 6
                          const bubblePath = getSpeechBubblePath(bLeft, bTop, bW, bH, 14, jokoX, tailTipY, 22)

                          const borderColor =
                            satpamChatStage === 'pak_wrong'
                              ? '#DC2626'
                              : satpamChatStage === 'pak_pass_1' || satpamChatStage === 'pak_pass_2'
                            ? '#10B981'
                            : '#F59E0B'

                          return (
                            <motion.g
                              key={`satpam-cloud-${satpamChatStage}-${satpamWrongCount}`}
                              id={`satpam-cloud-${satpamChatStage}`}
                              initial={{ opacity: 0, scale: 0.92, y: 6 }}
                              animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                x: satpamChatStage === 'pak_wrong' ? [0, -8, 8, -5, 5, 0] : 0
                              }}
                              exit={{ opacity: 0, scale: 0.92, y: 6 }}
                              transition={{ duration: 0.28 }}
                              style={{ cursor: 'pointer' }}
                              onClick={advanceSatpamChat}
                            >
                              <path
                                d={bubblePath}
                                fill="#2D1A12"
                                stroke={borderColor}
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                style={{ filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.75))' }}
                              />
                              <foreignObject x={bLeft} y={bTop} width={bW} height={bH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                <div
                                  data-testid="satpam-cloud-bubble"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    boxSizing: 'border-box',
                                    padding: '8px 14px 6px 14px',
                                    background: 'transparent',
                                    border: 'none',
                                    boxShadow: 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    userSelect: 'none',
                                  }}
                                >
                                  <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#FDE047', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                    👮 Pak Joko (Satpam)
                                  </div>
                                  <div style={{
                                    fontSize: '10.2px',
                                    fontWeight: 800,
                                    color: '#FEF3C7',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                    margin: '2px 0',
                                  }}>
                                    {satpamChatStage === 'pak_stop_1' && (
                                      <>
                                        "PRIIIT! 📢 Eits, berhenti dulu le! Mau nyelonong masuk aja kamu?!"
                                        <br />
                                        <span style={{ color: '#FDE68A' }}>"Jam segini baru nongol di gerbang, dari mana aja?!"</span>
                                      </>
                                    )}
                                    {satpamChatStage === 'pak_stop_2' && (
                                      <>
                                        {satpamQuiz.pakGreeting}
                                        <br />
                                        <span style={{ color: '#7DD3FC' }}>"Buktikan dulu otakmu sudah bangun! Jawab hitungan waktu ini!"</span>
                                      </>
                                    )}
                                    {satpamChatStage === 'pak_wrong' && (
                                      <>
                                        <span style={{ color: '#F87171', fontWeight: 900 }}>❌ "{satpamTeaseText}"</span>
                                      </>
                                    )}
                                    {satpamChatStage === 'pak_pass_1' && (
                                      <>
                                        <span style={{ color: '#34D399', fontWeight: 900 }}>🎉 "Hahaha, mantap betul! ({satpamQuiz.explanation})"</span>
                                        <br />
                                        "Otakmu ternyata masih encer walau bangun kesiangan!"
                                      </>
                                    )}
                                    {satpamChatStage === 'pak_pass_2' && (
                                      <>
                                        "Ya sudah, gerbang Pak Joko buka! Sana lekas lari ke lapangan,"
                                        <br />
                                        "itu <span style={{ color: '#F87171', fontWeight: 900 }}>Pak Sutrisno</span> sudah berdiri memantau di depan kelas!"
                                      </>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                      {satpamChatStage === 'pak_wrong'
                                        ? '[ 🔄 Coba Soal Baru ▶ ]'
                                        : satpamChatStage === 'pak_stop_2'
                                        ? '[ ⏱️ Lihat Soal ▶ ]'
                                        : '[ Klik / Tap ▶ ]'}
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                            </motion.g>
                          )
                        })()}

                        {/* 0A-3. Pak Joko Interactive Time-Math Quiz Cloud Chat Bubble */}
                        {currentZone === 'gate' && !insideRoom && satpamChatStage === 'pak_quiz' && (() => {
                          const jokoX = 930
                          const jokoHeadTop = 328
                          const bW = 390
                          const bH = 152
                          const bLeft = Math.max(camX + 10, Math.min(camX + viewVW - bW - 20, jokoX - bW * 0.62))
                          const bBottomY = jokoHeadTop - 12
                          const bTop = Math.max(camY + 8, bBottomY - bH)
                          const tailTipY = jokoHeadTop + 6
                          const bubblePath = getSpeechBubblePath(bLeft, bTop, bW, bH, 14, jokoX, tailTipY, 22)
                          const optionLabels = ['A', 'B', 'C', 'D']

                          return (
                            <motion.g
                              key={`satpam-quiz-cloud-${satpamQuiz.templateIdx}-${satpamWrongCount}`}
                              id="satpam-quiz-cloud"
                              initial={{ opacity: 0, scale: 0.92, y: 6 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.92, y: 6 }}
                              transition={{ duration: 0.25 }}
                            >
                              <path
                                d={bubblePath}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                style={{ filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.75))' }}
                              />
                              <foreignObject x={bLeft} y={bTop} width={bW} height={bH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                <div
                                  data-testid="satpam-quiz-bubble"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    boxSizing: 'border-box',
                                    padding: '8px 12px 8px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    boxShadow: 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    userSelect: 'none',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '9.5px', fontWeight: 900, color: '#FDE047', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                      👮 Pak Joko — Teka-Teki Waktu {satpamWrongCount > 0 ? `(Percobaan #${satpamWrongCount + 1})` : ''}
                                    </span>
                                    <span style={{ fontSize: '8.5px', fontWeight: 800, color: '#FDE68A', fontFamily: 'var(--font-ui)' }}>
                                      Pilih A/B/C/D
                                    </span>
                                  </div>

                                  <div
                                    data-testid="satpam-quiz-question"
                                    style={{
                                      fontSize: '9.8px',
                                      fontWeight: 800,
                                      color: '#FEF3C7',
                                      fontFamily: 'var(--font-ui)',
                                      lineHeight: 1.32,
                                      margin: '3px 0',
                                    }}
                                  >
                                    {satpamQuiz.questionText}
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', pointerEvents: 'auto' }}>
                                    {satpamQuiz.options.map((opt, idx) => (
                                      <button
                                        key={`cloud-opt-${idx}`}
                                        data-testid={`satpam-opt-${idx}`}
                                        onClick={e => handleSelectSatpamOption(idx, e)}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          padding: '4px 8px',
                                          borderRadius: '8px',
                                          background: 'rgba(255, 255, 255, 0.08)',
                                          border: '1.5px solid #F59E0B',
                                          color: '#FEF3C7',
                                          fontSize: '9.5px',
                                          fontWeight: 800,
                                          fontFamily: 'var(--font-ui)',
                                          cursor: 'pointer',
                                          textAlign: 'left',
                                          boxShadow: '0 1px 3px rgba(140, 98, 57, 0.1)',
                                        }}
                                      >
                                        <span style={{
                                          width: '16px',
                                          height: '16px',
                                          borderRadius: '4px',
                                          background: '#F59E0B',
                                          border: '1px solid #FDE047',
                                          color: '#1F130B',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '8.5px',
                                          fontWeight: 900,
                                          flexShrink: 0,
                                        }}>
                                          {optionLabels[idx]}
                                        </span>
                                        <span data-testid={`satpam-opt-text-${idx}`}>{opt}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </foreignObject>
                            </motion.g>
                          )
                        })()}

                        {/* 0A-4. Stevunt Reply Cloud Chat Bubbles to Pak Joko */}
                        {currentZone === 'gate' && !insideRoom && (
                          satpamChatStage === 'player_excuse_1' ||
                          satpamChatStage === 'player_thanks'
                        ) && (() => {
                          const pW = 300
                          const pH = 78
                          const playerHeadTop = charPos.y - charSize * 0.78
                          const pBottomY = playerHeadTop - 12
                          const pY = Math.max(camY + 8, pBottomY - pH)
                          const pLeft = Math.max(camX + 10, Math.min(camX + viewVW - pW - 10, charPos.x - pW / 2))
                          const borderColor = satpamChatStage === 'player_thanks' ? '#10B981' : '#F59E0B'
                          const bubblePath = getSpeechBubblePath(pLeft, pY, pW, pH, 14, charPos.x, playerHeadTop + 2, 20)

                          return (
                            <motion.g
                              key={`player-satpam-cloud-${satpamChatStage}`}
                              id={`player-satpam-cloud-${satpamChatStage}`}
                              initial={{ opacity: 0, scale: 0.92, y: 6 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.92, y: 6 }}
                              transition={{ duration: 0.25 }}
                              style={{ cursor: 'pointer' }}
                              onClick={advanceSatpamChat}
                            >
                              <path
                                d={bubblePath}
                                fill="#2D1A12"
                                stroke={borderColor}
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                style={{ filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.75))' }}
                              />
                              <foreignObject x={pLeft} y={pY} width={pW} height={pH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                <div
                                  data-testid="player-satpam-cloud-bubble"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    boxSizing: 'border-box',
                                    padding: '8px 12px 6px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    boxShadow: 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    userSelect: 'none',
                                  }}
                                >
                                  <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#FDE047', fontFamily: 'var(--font-ui)', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                    Kamu
                                  </div>
                                  <div style={{
                                    fontSize: '10.2px',
                                    fontWeight: 800,
                                    color: '#FEF3C7',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                  }}>
                                    {satpamChatStage === 'player_excuse_1'
                                      ? '"Eh, pagi Pak Joko! Ampun Pak, tadi alarm HP saya gak bunyi... Jangan dikunci dulu Pak gerbangnya!"'
                                      : '"Siap, terima kasih banyak Pak Joko! Saya lari masuk ke halaman sekarang!"'}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                      {satpamChatStage === 'player_thanks' ? '[ 🏃 Masuk Gerbang ▶ ]' : '[ Klik / Tap ▶ ]'}
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                            </motion.g>
                          )
                        })()}

                        {/* 0B. Gate Entrance Prompt Button (Shown only when approaching open school gate) */}
                        {currentZone === 'gate' && !insideRoom && satpamChatStage === 'idle' && (() => {
                          const isNearGate = charPos.y <= 490 && charPos.x >= 450 && charPos.x <= 780
                          if (!isNearGate) return null

                          const buttonW = 200
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + viewVW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2

                          return (
                            <motion.g
                              key="btn-gate-enter"
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={attemptEnterSchoolFromGate}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ cursor: 'pointer' }}
                            >
                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#FEF3C7"
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                [ E ] 🏫 Masuk Gerbang Sekolah
                              </text>
                            </motion.g>
                          )
                        })()}

                        {/* 1. Inside Room Teacher Interaction Prompt */}
                        {insideRoom && (() => {
                          if (insideRoom.id === 'Perpustakaan') {
                            if (nearLibraryShelf && !showLibraryBookModal) {
                              const buttonW = 210
                              const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                              const textX = buttonLeft + buttonW / 2
                              return (
                                <motion.g
                                  key="btn-shelf-perpustakaan"
                                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, y: 5 }}
                                  onClick={() => setShowLibraryBookModal(true)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <rect x={buttonLeft - 10} y={btnY} width={buttonW + 20} height={28} rx={6} fill="#2D1A12" stroke="#059669" strokeWidth={2} style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.25))' }} />
                                  <text x={textX} y={btnTextY + 2} textAnchor="middle" dominantBaseline="middle" fill="#059669" fontSize={10.5} fontWeight="900" style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}>
                                    [ E ] 📖 Baca Buku Statistika
                                  </text>
                                </motion.g>
                              )
                            }
                            return null
                          }

                          if (insideRoom.id === 'LabKomputer') {
                            if (nearLabTerminal && !showLabTerminalModal) {
                              const buttonW = 210
                              const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                              const textX = buttonLeft + buttonW / 2
                              return (
                                <motion.g
                                  key="btn-terminal-lab"
                                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, y: 5 }}
                                  onClick={() => setShowLabTerminalModal(true)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <rect x={buttonLeft - 10} y={btnY} width={buttonW + 20} height={28} rx={6} fill="#2D1A12" stroke="#0284C7" strokeWidth={2} style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.25))' }} />
                                  <text x={textX} y={btnTextY + 2} textAnchor="middle" dominantBaseline="middle" fill="#0284C7" fontSize={10.5} fontWeight="900" style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}>
                                    [ E ] 💻 Buka Terminal Digital
                                  </text>
                                </motion.g>
                              )
                            }
                            return null
                          }

                                                    if (showWaliKelasPopup || teacherCutsceneStage !== null) return null
                          const isSaved = savedClasses.has(insideRoom.id)
                          const buttonW = 200
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2

                          return (
                            <motion.g
                              key={`btn-talk-${insideRoom.id}`}
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={() => {
                                if (isSaved) {
                                  setShowWaliKelasPopup(insideRoom)
                                } else {
                                  handleInteractTeacher(insideRoom)
                                }
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ cursor: 'pointer' }}
                            >
                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke={isSaved ? '#10B981' : '#F59E0B'}
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={isSaved ? '#34D399' : '#FEF3C7'}
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                {isSaved ? `✓ Buka Data ${insideRoom.label}` : `[ E ] 🗣️ Bicara dgn Wali Kelas`}
                              </text>
                            </motion.g>
                          )
                        })()}

                        {/* 2. Hallway Door Interaction Prompt (Locked door -> Kuis; Unlocked door -> Masuk Kelas; Saved -> Completed) */}
                        {!insideRoom && currentZone === 'main' && nearClass && !activeClass && !nearDoor && (cinematicStage === 'sanction_received' || demoMode) && (() => {
                          const isRG = nearClass.id === 'RG'
                          const isDataComplete = collected.size >= TOTAL_N || savedClasses.size >= 4
                          const isKittenFound = catQuestStage === 'kitten_rescued' || catQuestStage === 'completed'
                          const isRGUnlocked = isRG && isDataComplete && isKittenFound
                          const isSaved = !isRG && savedClasses.has(nearClass.id)
                          const isUnlocked = isRG ? isRGUnlocked : unlocked.has(nearClass.id)
                          const buttonW = isRG ? (isRGUnlocked ? 220 : 260) : isSaved ? 180 : 160
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2
                          return (
                            <motion.g
                              key={`btn-class-${nearClass.id}`}
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={() => {
                                if (isRG) {
                                  if (isRGUnlocked) {
                                    enterClassroom(nearClass)
                                  } else {
                                    gameAudio.playError()
                                    if (!isDataComplete && !isKittenFound) {
                                      setRgLockedToast(`🔒 Ruang Guru Terkunci! Kumpulkan data 4 kelas (${Math.max(collected.size, savedClasses.size * 6)}/${TOTAL_N}) dan temukan anak kucing yang hilang terlebih dahulu!`)
                                    } else if (!isKittenFound) {
                                      setRgLockedToast(`🔒 Ruang Guru Terkunci! Kamu harus menemukan anak kucing yang hilang terlebih dahulu sebelum melapor ke Pak Sutrisno!`)
                                    } else {
                                      setRgLockedToast(`🔒 Ruang Guru Terkunci! Kumpulkan seluruh data dari 4 kelas terlebih dahulu (${Math.max(collected.size, savedClasses.size * 6)}/${TOTAL_N}).`)
                                    }
                                    setTimeout(() => setRgLockedToast(null), 2500)
                                  }
                                  return
                                }
                                if (isSaved) return
                                enterClassroom(nearClass)
                              }}
                              whileHover={{ scale: isSaved ? 1 : 1.05 }}
                              whileTap={{ scale: isSaved ? 1 : 0.95 }}
                              style={{ cursor: isSaved ? 'default' : 'pointer' }}
                            >
                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke={isRG ? (isRGUnlocked ? '#10B981' : '#F59E0B') : isSaved ? '#10B981' : '#F59E0B'}
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.25))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={isRG ? (isRGUnlocked ? '#34D399' : '#FBBF24') : isSaved ? '#34D399' : '#FEF3C7'}
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                {isRG
                                  ? isRGUnlocked
                                    ? `[ E ] ✨ Masuk ke Ruang Guru ►`
                                    : !isDataComplete && !isKittenFound
                                      ? `[ E ] 🔒 Kumpulkan Data & Temukan Kucing`
                                      : !isKittenFound
                                        ? `[ E ] 🔒 Temukan Anak Kucing Terlebih Dahulu`
                                        : `[ E ] 🔒 Ruang Guru Terkunci (${Math.max(collected.size, savedClasses.size * 6)}/${TOTAL_N})`
                                  : isSaved
                                    ? `✓ Data ${nearClass.label} Selesai`
                                    : `[ E ] 🚪 Masuk ke ${nearClass.label} ►`}
                              </text>
                            </motion.g>
                          )
                        })()}

                        {/* 3. Facility Interaction Prompt (In Facility Zone) */}
                        {!insideRoom && currentZone === 'facility' && nearFacility && !activeFacility && (() => {
                          const buttonW = nearFacility.roomId ? 210 : 230
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2
                          return (
                            <motion.g
                              key={`btn-facility-${nearFacility.id}`}
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={() => {
                                if (nearFacility.roomId) {
                                  enterFacilityRoom(nearFacility)
                                } else {
                                  setActiveFacility(nearFacility)
                                  gameAudio.playDoorOpen()
                                }
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ cursor: 'pointer' }}
                            >
                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#FEF3C7"
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                {nearFacility.roomId ? `[ E ] 🚪 Masuk ke ${nearFacility.label} ►` : `[ E ] 💬 Bicara di ${nearFacility.label} ►`}
                              </text>
                            </motion.g>
                          )
                        })()}

                        {/* 4. Zone Transition Gateway Prompt */}
                        {!insideRoom && zoneTransitionPrompt && !nearFacility && !nearClass && (() => {
                          const isToFacility = zoneTransitionPrompt === 'to_facility'
                          const buttonW = 260
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2
                          return (
                            <motion.g
                              key="btn-zone-transition"
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={isToFacility ? goToFacilityZone : goToMainZone}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ cursor: 'pointer' }}
                            >
                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#FEF3C7"
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                {isToFacility ? '[ E ] 🚶‍♂️ Ke Area Fasilitas (Kantin/Lab) ▼' : '[ E ] 🚶‍♂️ Ke Halaman Kelas & Ruang Guru ▲'}
                              </text>
                            </motion.g>
                          )
                        })()}

                        {/* 5. Cat Quest: Mother Cat Prompt */}
                        {nearMotherCat && !insideRoom && currentZone === 'main' && (() => {
                          const buttonW = catQuestStage === 'completed' ? 220 : catQuestStage === 'kitten_rescued' ? 230 : 210
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2
                          return (
                            <motion.g
                              key="btn-mother-cat-interact"
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={() => {
                                gameAudio.playCatMeow()
                                setShowMotherCatModal(true)
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ cursor: 'pointer' }}
                            >
                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke={catQuestStage === 'completed' || catQuestStage === 'kitten_rescued' ? '#059669' : '#8C6239'}
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.25))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={catQuestStage === 'completed' || catQuestStage === 'kitten_rescued' ? '#059669' : '#362014'}
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                {catQuestStage === 'completed'
                                  ? '🐾 [ E ] Bicara dgn Mimi & Mochi'
                                  : catQuestStage === 'kitten_rescued'
                                  ? '❤️ [ E ] Serahkan Mochi ke Mimi!'
                                  : '🐱 [ E ] Meoow? (Bicara dgn Mimi)'}
                              </text>
                            </motion.g>
                          )
                        })()}

                        {/* 6. Cat Quest: Kitten Rescue Prompt */}
                        {nearKitten && catQuestStage === 'quest_active' && (() => {
                          const buttonW = 250
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2
                          return (
                            <motion.g
                              key="btn-kitten-box-rescue"
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={() => {
                                gameAudio.playCatMeow()
                                setShowKittenRescueModal(true)
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ cursor: 'pointer' }}
                            >
                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#2D1A12"
                                stroke="#059669"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.25))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#059669"
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                📦 [ E ] Buka Kardus & Selamatkan Mochi!
                              </text>
                            </motion.g>
                          )
                        })()}

                        {/* 1B. Unified Comic Speech Bubble (Cutscenes for Teacher & Player inside Classroom) */}
                        {insideRoom && teacherCutsceneStage && (() => {
                          const currentMap = LEVEL1_MAPS[insideRoom.id]
                          const teacherConfig = currentMap?.teacher
                          const teacherX = teacherConfig?.x ?? 617
                          const teacherY = teacherConfig?.y ?? 415
                          const teacherName = currentClassStudents[insideRoom.id]?.teacher || teacherConfig?.name || 'Wali Kelas'
                          const classStudentCount = currentClassStudents[insideRoom.id]?.students?.length || 0

                          // Accurate visual head position of the Teacher
                          const teacherAspect = (teacherConfig as any)?.aspectRatio ?? (teacherConfig?.cols === 1 && teacherConfig?.rows === 1 ? 2.0 : 1)
                          const teacherHeight = teacherConfig?.size ? (teacherConfig.size * teacherAspect) : 160
                          // NPCCharacter renders with posY = teacherY - teacherHeight * 0.85
                          // Visual top of head is ~78% of height above feet
                          const teacherHeadTop = teacherConfig?.spriteUrl
                            ? (teacherConfig.cols === 1 && teacherConfig.rows === 1 ? teacherY - teacherHeight * 0.78 : teacherY - (teacherConfig.size || 160) * 0.78)
                            : teacherY - 60

                          // Accurate visual head position of the Player (Stevunt)
                          const playerHeadTop = charPos.y - charSize * 0.65
                          const playerHeadX = charPos.x

                          const isPlayerSpeaking = teacherCutsceneStage === 'player_explain' || teacherCutsceneStage === 'post_stevunt_report'
                          const speakerX = isPlayerSpeaking ? playerHeadX : teacherX
                          const speakerHeadTop = isPlayerSpeaking ? playerHeadTop : teacherHeadTop

                          // Bubble dimensions based on content
                          let bW = 380
                          let bH = 88
                          let borderColor = '#F59E0B'
                          let speakerTitle = ''
                          let speakerBadgeColor = '#FDE047'
                          let dialogueText: React.ReactNode = null
                          let actionText = '[ Klik / Spasi ▶ ]'
                          let actionColor = '#FBBF24'

                          if (teacherCutsceneStage === 'anim_wait') {
                            bW = 240
                            bH = 46
                            speakerTitle = `${insideRoom.id === 'LabKomputer' ? '👨‍🏫 ' : '👩‍🏫 '}${teacherName}`
                            dialogueText = <span style={{ color: '#FDE68A', fontWeight: 800 }}>Sedang menyapa...</span>
                            actionText = '...'
                          } else if (teacherCutsceneStage === 'teacher_ask') {
                            bW = 380
                            bH = 90
                            speakerTitle = `${insideRoom.id === 'LabKomputer' ? '👨‍🏫 ' : '👩‍🏫 '}${teacherName}`
                            speakerBadgeColor = '#FDE047'
                            if (insideRoom.id === 'RG') {
                              dialogueText = (
                                <>
                                  <span style={{ color: '#34D399', fontWeight: 900 }}>"Stevunt! Bagaimana perkembangan tugasmu?"</span>
                                  <br />
                                  "Apakah 24 sampel data screen time dari 4 kelas sudah siap?"
                                </>
                              )
                            } else if (insideRoom.id === 'A2') {
                              dialogueText = (
                                <>
                                  <span style={{ color: '#F87171', fontWeight: 900 }}>"LOH?! ${playerName.toUpperCase()}?! Kamu kan murid kelas ini!"</span>
                                  <br />
                                  "Kenapa jam pelajaran malah keluyuran di luar?!"
                                </>
                              )
                            } else {
                              dialogueText = `"Halo! Ada perlu apa kamu datang ke ${insideRoom.label}?"`
                            }
                          } else if (teacherCutsceneStage === 'player_explain') {
                            bW = 400
                            bH = 92
                            speakerTitle = `🎒 Kamu (${playerName})`
                            speakerBadgeColor = '#38BDF8'
                            if (insideRoom.id === 'RG') {
                              dialogueText = (
                                <>
                                  "Sudah lengkap, Pak Sutrisno! Seluruh 24 data sampel"
                                  <br />
                                  "screen time dari Kelas VII-A, VII-B, VIII-A, dan VIII-B sudah saya kumpulkan!"
                                </>
                              )
                            } else if (insideRoom.id === 'A2') {
                              dialogueText = (
                                <>
                                  "A-ampun Pak Bambang! Saya tadi kena sanksi Pak Sutrisno"
                                  <br />
                                  "untuk ngumpulin 24 data screen time sekolah, Pak!"
                                </>
                              )
                            } else {
                              dialogueText = (
                                <>
                                  "Saya sedang menjalankan tugas sanksi Pak Sutrisno untuk"
                                  <br />
                                  {`mengumpulkan sampel data ${classStudentCount} siswa di kelas ini!`}
                                </>
                              )
                            }
                          } else if (teacherCutsceneStage === 'teacher_reply') {
                            bW = 390
                            bH = 96
                            borderColor = '#10B981'
                            speakerTitle = `${insideRoom.id === 'LabKomputer' ? '👨‍🏫 ' : '👩‍🏫 '}${teacherName}`
                            speakerBadgeColor = '#34D399'
                            actionColor = '#34D399'
                            actionText = insideRoom.id === 'RG' ? '[ Buka Papan Analisis ▶ ]' : '[ Ambil Data ▶ ]'
                            if (insideRoom.id === 'RG') {
                              dialogueText = (
                                <>
                                  <span style={{ color: '#34D399', fontWeight: 900 }}>"Kerja luar biasa, Stevunt!"</span>
                                  <br />
                                  "Mari kita olah seluruh data ini di Papan Analisis untuk memeriksa klaim viral tersebut!"
                                </>
                              )
                            } else if (insideRoom.id === 'A2') {
                              dialogueText = (
                                <>
                                  "Oalah Sutrisno... Ya sudah, ini data 7 teman sekelasmu."
                                  <br />
                                  <span style={{ color: '#93C5FD', fontWeight: 800 }}>"Pelajari dengan teliti untuk bahan analisismu nanti ya!"</span>
                                </>
                              )
                            } else {
                              dialogueText = (
                                <>
                                  "Oh begitu! Baiklah, ini sampel data"
                                  <br />
                                  {`screen time ${classStudentCount} siswa dari ${insideRoom.label}.`}
                                </>
                              )
                            }
                          } else if (teacherCutsceneStage === 'post_stevunt_report') {
                            bW = 415
                            bH = 92
                            borderColor = '#38BDF8'
                            speakerTitle = `🎒 Stevunt (Detektif Siswa)`
                            speakerBadgeColor = '#38BDF8'
                            actionColor = '#38BDF8'
                            actionText = '[ Dengarkan Pak Sutrisno ▶ ]'
                            dialogueText = (
                              <>
                                <span style={{ color: '#38BDF8', fontWeight: 900 }}>"Ini Pak, saya sudah mencari median, modus, dan rata-ratanya."</span>
                                <br />
                                "Semua perhitungannya sudah siap digunakan!"
                              </>
                            )
                          } else if (teacherCutsceneStage === 'post_pak_thanks') {
                            bW = 430
                            bH = 96
                            borderColor = '#10B981'
                            speakerTitle = `👨‍🏫 Pak Sutrisno (Guru BK)`
                            speakerBadgeColor = '#34D399'
                            actionColor = '#34D399'
                            actionText = '[ Mulai Kuis Evaluasi 🎯 ]'
                            dialogueText = (
                              <>
                                <span style={{ color: '#34D399', fontWeight: 900 }}>"Wah, terima kasih banyak ya Stevunt sudah membantu Bapak!"</span>
                                <br />
                                "Sebelum selesai, coba jawab satu pertanyaan evaluasi klaim ini ya."
                              </>
                            )
                          } else if (teacherCutsceneStage === 'post_pak_quiz' && sutrisnoQuiz) {
                            bW = 470
                            bH = sutrisnoQuizWrong ? 165 : 150
                            borderColor = sutrisnoQuizWrong ? '#EF4444' : '#F59E0B'
                            speakerTitle = `👨‍🏫 Pak Sutrisno (Guru BK)`
                            speakerBadgeColor = '#FDE047'
                          } else if (teacherCutsceneStage === 'post_conclusion') {
                            bW = 425
                            bH = 96
                            borderColor = '#10B981'
                            speakerTitle = `👨‍🏫 Pak Sutrisno (Guru BK)`
                            speakerBadgeColor = '#34D399'
                            actionColor = '#34D399'
                            actionText = '[ Selesai & Buka Hasil Misi 🏆 ]'
                            dialogueText = (
                              <>
                                <span style={{ color: '#34D399', fontWeight: 900 }}>"Wah, terima kasih banyak ya Stevunt sudah membantu Bapak!"</span>
                                <br />
                                "Hasil analisismu sangat rapi dan teliti. Kerja bagus sekali, Nak!"
                              </>
                            )
                          }

                          // Anchor bubble cleanly centered horizontally above the speaker's head
                          const bX = Math.max(20, Math.min(WORLD_VW - bW - 20, speakerX - bW / 2))
                          const bBottomY = speakerHeadTop - 14
                          const bY = Math.max(16, bBottomY - bH)
                          const tailTipY = speakerHeadTop + 2

                          const bubblePath = getSpeechBubblePath(bX, bY, bW, bH, 14, speakerX, tailTipY, 22)

                          return (
                            <motion.g
                              key={`room-cutscene-bubble-${teacherCutsceneStage}-${insideRoom.id}`}
                              id={`room-cutscene-bubble-${teacherCutsceneStage}`}
                              initial={{ opacity: 0, scale: 0.94, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.94, y: 5 }}
                              transition={{ duration: 0.22, ease: 'easeOut' }}
                              style={{ cursor: 'pointer' }}
                              onClick={e => {
                                e.stopPropagation()
                                if (teacherCutsceneStage === 'post_pak_quiz') return
                                handleInteractTeacher(insideRoom)
                              }}
                            >
                              {/* 1. Single Seamless Comic Speech Bubble Shape (Body + Tail) */}
                              <path
                                d={bubblePath}
                                fill="#2D1A12"
                                stroke={borderColor}
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                style={{ filter: 'drop-shadow(0 12px 30px rgba(0, 0, 0, 0.75))' }}
                              />

                              {/* 2. Text and Interactive Elements inside ForeignObject */}
                              <foreignObject x={bX} y={bY} width={bW} height={bH} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                {teacherCutsceneStage === 'post_pak_quiz' && sutrisnoQuiz ? (
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    boxSizing: 'border-box',
                                    padding: '8px 12px 6px 12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    userSelect: 'none',
                                    pointerEvents: 'auto',
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '10px', fontWeight: 900, color: '#FDE047', fontFamily: 'var(--font-ui)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        👨‍🏫 Pak Sutrisno — Uji Klaim Rata-Rata
                                      </span>
                                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#FDE68A', fontFamily: 'var(--font-ui)' }}>
                                        Pilih A / B / C / D
                                      </span>
                                    </div>

                                    <div
                                      data-testid="sutrisno-quiz-question"
                                      style={{
                                        fontSize: '10.2px',
                                        fontWeight: 800,
                                        color: '#FEF3C7',
                                        fontFamily: 'var(--font-ui)',
                                        lineHeight: 1.32,
                                        margin: '2px 0',
                                        textAlign: 'left',
                                      }}
                                    >
                                      "{sutrisnoQuiz.questionText}"
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', pointerEvents: 'auto' }}>
                                      {sutrisnoQuiz.options.map((opt, idx) => (
                                        <button
                                          key={`sutrisno-opt-${idx}`}
                                          data-testid={`sutrisno-opt-${idx}`}
                                          onClick={(e) => handleSelectSutrisnoQuizOption(opt.isCorrect, e)}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            padding: '4px 7px',
                                            borderRadius: '7px',
                                            background: 'rgba(255, 255, 255, 0.08)',
                                            border: '1.5px solid #F59E0B',
                                            color: '#FEF3C7',
                                            fontSize: '9px',
                                            fontWeight: 800,
                                            fontFamily: 'var(--font-ui)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            boxShadow: '0 1px 3px rgba(140, 98, 57, 0.1)',
                                            transition: 'all 0.15s ease',
                                          }}
                                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.25)' }}
                                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)' }}
                                        >
                                          <span style={{
                                            width: '15px',
                                            height: '15px',
                                            borderRadius: '4px',
                                            background: '#F59E0B',
                                            border: '1px solid #FDE047',
                                            color: '#1F130B',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '8.5px',
                                            fontWeight: 900,
                                            flexShrink: 0,
                                          }}>
                                            {opt.label}
                                          </span>
                                          <span style={{ flex: 1, lineHeight: 1.2 }}>{opt.text}</span>
                                        </button>
                                      ))}
                                    </div>

                                    {sutrisnoQuizWrong && (
                                      <div style={{ fontSize: '8.5px', fontWeight: 800, color: '#FCA5A5', textAlign: 'center', marginTop: '1px' }}>
                                        ⚠️ Kurang tepat! Bandingkan rata-rata {sutrisnoQuiz.actualMean} jam dengan klaim &gt; {sutrisnoQuiz.claimThreshold} jam ya.
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    boxSizing: 'border-box',
                                    padding: '8px 14px 6px 14px',
                                    background: 'transparent',
                                    border: 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    userSelect: 'none',
                                    pointerEvents: 'auto',
                                  }}>
                                    <div style={{
                                      fontSize: '11px',
                                      fontWeight: 900,
                                      color: speakerBadgeColor,
                                      fontFamily: 'var(--font-ui)',
                                      letterSpacing: '0.5px',
                                      textTransform: 'uppercase',
                                      textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                    }}>
                                      {speakerTitle}
                                    </div>

                                    <div style={{
                                      fontSize: '10.8px',
                                      fontWeight: 800,
                                      color: '#FEF3C7',
                                      fontFamily: 'var(--font-ui)',
                                      textAlign: 'center',
                                      lineHeight: 1.35,
                                      textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                                      margin: '2px 0',
                                    }}>
                                      {dialogueText}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                      <span style={{
                                        fontSize: '9.5px',
                                        fontWeight: 900,
                                        color: actionColor,
                                        fontFamily: 'var(--font-ui)',
                                        letterSpacing: '0.3px',
                                        background: 'rgba(0, 0, 0, 0.4)',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        border: `1px solid ${actionColor}55`,
                                      }}>
                                        {actionText}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </foreignObject>
                            </motion.g>
                          )
                        })()}
                      </AnimatePresence>
                    </>
                  )
                })()}
              </svg>
            )
          })()}

          {/* Vignette Overlay (Revisi 5) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            boxShadow: 'inset 0 0 35px rgba(0, 0, 0, 0.82)',
            borderRadius: 0,
            zIndex: 30,
          }} />

          {/* Floating Exit Button at Bottom Right inside Room */}
          <AnimatePresence>
            {insideRoom && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                whileHover={{ scale: 1.06, boxShadow: '0 0 25px rgba(239, 68, 68, 0.6)' }}
                whileTap={{ scale: 0.94 }}
                onClick={handleExitClassroom}
                style={{
                  position: 'absolute',
                  bottom: 'clamp(14px, 3vh, 22px)',
                  right: 'clamp(14px, 3vw, 22px)',
                  zIndex: 55,
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(185, 28, 28, 0.98) 100%)',
                  backdropFilter: 'blur(12px)',
                  border: '1.5px solid #FCA5A5',
                  borderRadius: 14,
                  padding: 'clamp(8px, 1vw, 10px) clamp(14px, 1.5vw, 18px)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: 'clamp(11.5px, 1.1vw, 13px)',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(239, 68, 68, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  pointerEvents: 'auto',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '16px' }}>🚪</span>
                <span>Keluar Ruang {insideRoom.label}</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Joystick (Hidden when inside classrooms for conversation mode) */}
          {(!insideRoom || !['A1', 'A2', 'B1', 'B2'].includes(insideRoom.id)) && (
            <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 50, touchAction: 'none' }}>
              <Joystick onDir={(x, y) => { const nextDir = { x, y }; dirRef.current = nextDir; setMoveDir(nextDir); }} />
            </div>
          )}

          {/* Blackout Screen Fade Transition Overlay (Jeda Transisi Layar Gelap -> Terang) */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#04070A',
              pointerEvents: screenFade !== 'idle' ? 'all' : 'none',
              zIndex: 999,
            }}
            initial={false}
            animate={{ opacity: (screenFade === 'out' || screenFade === 'blackout') ? 1 : 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
      </div>

      <AnimatePresence>
        {activeDoor && (
          <QuizModal
            door={activeDoor}
            isFD={isFD}
            onCorrect={handleCorrect}
            onClose={() => setActiveDoor(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeClass && (
          <QuizModal
            door={activeClass}
            isFD={isFD}
            onCorrect={handleClassCorrect}
            onClose={() => setActiveClass(null)}
          />
        )}
      </AnimatePresence>

      {/* Pak Sutrisno Report Modal */}
      <AnimatePresence>
        {showPakReportModal && (
          <PakReportModal
            dataset={activeDataset}
            onProceed={() => {
              setShowPakReportModal(false)
              gameAudio.playUnlockJingle()
              // Alur kembali ke chit-chat dengan Pak Sutrisno di Ruang Guru
              setTimeout(() => {
                setTeacherCutsceneStage('post_stevunt_report')
              }, 300)
            }}
          />
        )}
      </AnimatePresence>

      
      {/* Misi Selesai Modal (Popup Bintang 1-3 & Hasil Investigasi) */}
      <AnimatePresence>
        {showMissionCompleteModal && (
          <MissionCompleteModal
            stars={earnedStarsState}
            elapsedSeconds={elapsedSecondsState}
            mistakeCount={mistakeCount}
            onFinish={() => {
              setShowMissionCompleteModal(false)
              if (onComplete) {
                onComplete(earnedStarsState)
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Wali Kelas Data Dialogue Modal */}
      <AnimatePresence>
        {showWaliKelasPopup && (
          <WaliKelasModal
            door={showWaliKelasPopup}
            studentsData={currentClassStudents}
            onCollectData={handleCloseWaliKelas}
            onClose={() => {
              setShowWaliKelasPopup(null)
              handleExitClassroom()
            }}
          />
        )}
      </AnimatePresence>

      {/* Facility Dialogue Modal (Kantin, Lab Komputer, Perpustakaan) */}
      <AnimatePresence>
        {activeFacility && (
          <FacilityModal
            facility={activeFacility}
            onClose={() => setActiveFacility(null)}
          />
        )}
      </AnimatePresence>

      {/* Library Bookshelf Learning Modal (Pojok Baca Statistika SMP) */}
      <AnimatePresence>
        {showLibraryBookModal && (
          <LibraryBookModal onClose={() => setShowLibraryBookModal(false)} />
        )}
      </AnimatePresence>

      {/* Lab Terminal Learning Modal (Terminal Literasi & Analisis Digital) */}
      <AnimatePresence>
        {showLabTerminalModal && (
          <LabTerminalModal onClose={() => setShowLabTerminalModal(false)} />
        )}
      </AnimatePresence>

      {/* Cat Quest: Mother Cat Dialogue Modal */}
      <AnimatePresence>
        {showMotherCatModal && (
          <MotherCatModal
            stage={
              catQuestStage === 'cat_spawned'
                ? 'ask_help'
                : catQuestStage === 'kitten_rescued' || catQuestStage === 'completed'
                ? 'reward'
                : 'reminder'
            }
            classLabel={motherCatPos.classLabel}
            onAccept={() => {
              if (catQuestStage === 'cat_spawned') {
                setCatQuestStage('quest_active')
                gameAudio.playCatPurr()
              } else if (catQuestStage === 'kitten_rescued') {
                setCatQuestStage('completed')
                gameAudio.playCatPurr()
              }
              setShowMotherCatModal(false)
            }}
            onClose={() => {
              if (catQuestStage === 'cat_spawned') {
                setCatQuestStage('quest_active')
              } else if (catQuestStage === 'kitten_rescued') {
                setCatQuestStage('completed')
                gameAudio.playCatPurr()
              }
              setShowMotherCatModal(false)
            }}
          />
        )}
      </AnimatePresence>

      {/* Cat Quest: Kitten Rescue Modal */}
      <AnimatePresence>
        {showKittenRescueModal && (
          <KittenRescueModal
            locationLabel={kittenLocation.label}
            onRescue={() => {
              setCatQuestStage('kitten_rescued')
              setShowKittenRescueModal(false)
              gameAudio.playCatPurr()
            }}
            onClose={() => setShowKittenRescueModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Room Milestone Overlay */}
      <AnimatePresence>
        {roomMilestoneText && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, pointerEvents: 'none' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              style={{
                position: 'relative',
                maxWidth: 380,
                width: '100%',
                background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
                border: '2.5px solid #F59E0B',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
                borderRadius: 22,
                padding: '24px 22px',
                textAlign: 'center'
              }}
            >
              {/* Corner brackets */}
              <div style={{ position: 'absolute', top: '8px', left: '8px', width: '12px', height: '12px', borderTop: '2.5px solid #F59E0B', borderLeft: '2.5px solid #F59E0B', borderRadius: '2px 0 0 0' }} />
              <div style={{ position: 'absolute', top: '8px', right: '8px', width: '12px', height: '12px', borderTop: '2.5px solid #F59E0B', borderRight: '2.5px solid #F59E0B', borderRadius: '0 2px 0 0' }} />
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '12px', height: '12px', borderBottom: '2.5px solid #F59E0B', borderLeft: '2.5px solid #F59E0B', borderRadius: '0 0 0 2px' }} />
              <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '12px', height: '12px', borderBottom: '2.5px solid #F59E0B', borderRight: '2.5px solid #F59E0B', borderRadius: '0 0 2px 0' }} />

              <div style={{ fontSize: '11px', color: '#9A3412', fontWeight: 900, letterSpacing: '1.5px', marginBottom: 6, textTransform: 'uppercase' }}>
                ⭐ PENCAPAIAN RUANGAN ⭐
              </div>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontSize: '20px', fontWeight: 900, color: '#FEF3C7', letterSpacing: '1px', marginBottom: 8 }}
              >
                {roomMilestoneText}
              </motion.div>
              <div style={{ fontSize: '12.5px', color: '#FEF3C7', fontWeight: 700 }}>
                Semua kelas di ruangan ini telah dibuka!
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ruang Guru Locked Toast Overlay */}
      <AnimatePresence>
        {rgLockedToast && (
          <div style={{ position: 'fixed', top: 'clamp(55px, 8vh, 75px)', left: '50%', transform: 'translateX(-50%)', zIndex: 750, pointerEvents: 'none' }}>
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              style={{
                position: 'relative',
                background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
                border: '2.5px solid #F59E0B',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4), inset 0 0 16px rgba(180, 140, 80, 0.2)',
                borderRadius: 16,
                padding: '10px 18px',
                color: '#FEF3C7',
                fontSize: '12.5px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                backdropFilter: 'blur(8px)',
              }}
            >
              <span style={{ fontSize: 18 }}>🔒</span>
              <span>{rgLockedToast}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inventory Side Drawer Modal Overlay (Misi & Target Tugas) */}
      <AnimatePresence>
        {isInventoryOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 600,
              background: 'rgba(40, 25, 15, 0.65)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
            onClick={() => setIsInventoryOpen(false)}
          >
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                width: '100%',
                maxWidth: 450,
                height: '100%',
                background: 'linear-gradient(180deg, #2D1A12 0%, #1A0D08 100%)',
                borderLeft: '3px solid #F59E0B',
                boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7), inset 0 0 30px rgba(251, 191, 36, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 20px',
                gap: 16,
                overflowY: 'auto',
                color: '#FEF3C7',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid rgba(245, 158, 11, 0.3)', paddingBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: '#FBBF24', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    📜 QUEST LOG • LEVEL 1
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#FDE047', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span>📜</span> Misi Investigasi
                  </h3>
                </div>
                <button
                  id="quest-log-close-btn"
                  onClick={() => setIsInventoryOpen(false)}
                  style={{
                    background: 'rgba(140, 98, 57, 0.1)',
                    border: '1px solid rgba(140, 98, 57, 0.3)',
                    color: '#FEF3C7',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: 16
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Dynamic Quest Status Card */}
              {(() => {
                const isTaskGiven = cinematicStage === 'sanction_received' || demoMode
                const isAllCollected = n >= TOTAL_N || savedClasses.size >= 4
                const isKittenFound = catQuestStage === 'kitten_rescued' || catQuestStage === 'completed'

                let badgeColor = '#0E8388'
                let badgeText = '📍 MISI UTAMA'
                let questTitle = 'Jumpai Pak Sutrisno'
                let questDesc = 'Kamu datang terlambat ke sekolah! Cari dan bicara dengan Pak Sutrisno di depan Ruang Guru Lorong Utama untuk melapor.'

                if (isAllCollected && isKittenFound) {
                  badgeColor = '#059669'
                  badgeText = '⚡ SELESAI — SIAP DILAPORKAN'
                  questTitle = 'Laporkan 24 Data ke Pak Sutrisno di Ruang Guru'
                  questDesc = 'Semua 24 sampel data screen time siswa telah berhasil terkumpul dari 4 kelas dan anak kucing telah ditemukan! Masuklah ke Ruang Guru di Gedung Tengah untuk menyerahkan data kepada Pak Sutrisno.'
                } else if (isAllCollected && !isKittenFound) {
                  badgeColor = '#D97706'
                  badgeText = '🐾 MISI ANAK KUCING BELUM SELESAI'
                  questTitle = 'Data Lengkap! Temukan Anak Kucing Terlebih Dahulu'
                  questDesc = 'Semua 24 sampel data screen time siswa telah berhasil terkumpul dari 4 kelas! Namun Ruang Guru masih terkunci. Temukan anak kucing yang hilang terlebih dahulu agar kamu bisa melapor ke Pak Sutrisno.'
                } else if (isTaskGiven) {
                  badgeColor = '#0E8388'
                  badgeText = '🟢 SEDANG BERLANGSUNG'
                  questTitle = 'Proyek Riset Pak Sutrisno: Kumpulkan 24 Data'
                  questDesc = 'Pak Sutrisno sedang memimpin riset statistika tentang durasi screen time siswa SMP untuk menguji isu viral. Sebagai sanksi keterlambatan, kamu ditugaskan menjadi asisten peneliti untuk mengumpulkan 24 sampel data dari Wali Kelas VII-A, VII-B, VIII-A, dan VIII-B.'
                } else if (cinematicStage === 'gate_intro') {
                  badgeColor = '#D97706'
                  badgeText = '🏃 MASUK GERBANG'
                  questTitle = 'Waduh, Telat Masuk Sekolah!'
                  questDesc = 'Bel sekolah sudah berbunyi! Segera lari masuk melewati pintu gerbang sekolah sebelum dikunci oleh Pak Joko (Satpam).'
                }

                return (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid #F59E0B',
                    borderRadius: 16,
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    boxShadow: '0 3px 12px rgba(140, 98, 57, 0.12)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 900,
                        color: badgeColor,
                        background: '#FEF3C7',
                        border: `1.5px solid ${badgeColor}`,
                        borderRadius: 20,
                        padding: '3px 10px',
                        letterSpacing: '0.8px'
                      }}>
                        {badgeText}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#FEF3C7' }}>
                        Target: 24 Sampel Data
                      </span>
                    </div>

                    <div>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#FEF3C7' }}>
                        {questTitle}
                      </h4>
                      <p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#FEF3C7', lineHeight: 1.5 }}>
                        {questDesc}
                      </p>
                    </div>

                    {/* Progress Bar Component */}
                    <div style={{ marginTop: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#FEF3C7' }}>Progress Pengumpulan Data</span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: badgeColor, fontFamily: 'var(--font-data)' }}>
                          {n} / {TOTAL_N} Siswa ({Math.round((n / TOTAL_N) * 100)}%)
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: 14,
                        background: '#EAD6B5',
                        borderRadius: 10,
                        overflow: 'hidden',
                        border: '1.5px solid #8C6239',
                        padding: 2
                      }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (n / TOTAL_N) * 100)}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          style={{
                            height: '100%',
                            background: isAllCollected
                              ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                              : 'linear-gradient(90deg, #0E8388 0%, #0284C7 100%)',
                            borderRadius: 8,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Cat Quest Mini-Game Side Quest Log Card */}
              {catQuestStage !== 'untriggered' && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid #F59E0B',
                  borderRadius: 16,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  boxShadow: '0 3px 12px rgba(140, 98, 57, 0.12)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 900,
                      color: catQuestStage === 'completed' ? '#065F46' : '#9A3412',
                      background: catQuestStage === 'completed' ? '#D1FAE5' : '#FEF3C7',
                      border: catQuestStage === 'completed' ? '1px solid #10B981' : '1px solid #F59E0B',
                      borderRadius: 20,
                      padding: '2px 8px',
                      letterSpacing: '0.6px',
                    }}>
                      {catQuestStage === 'completed' ? '🎉 MISI SELESAI' : '🐾 MISI SAMPINGAN'}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#FEF3C7' }}>
                      Depan {motherCatPos.classLabel}
                    </span>
                  </div>

                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#FEF3C7' }}>
                      {catQuestStage === 'cat_spawned' && '🐱 Kucing Mimi Mengeong Memanggilmu'}
                      {catQuestStage === 'quest_active' && '📦 Cari Anak Kucing Mochi di Dalam Kardus'}
                      {catQuestStage === 'kitten_rescued' && '❤️ Bawa Pulang Mochi ke Induknya (Mimi)'}
                      {catQuestStage === 'completed' && '🏅 Sahabat Kucing SMP (Tuntas)'}
                    </h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#FEF3C7', lineHeight: 1.5 }}>
                      {catQuestStage === 'cat_spawned' && `Bicara dengan Induk Kucing (Mimi) di lorong depan ${motherCatPos.classLabel}.`}
                      {catQuestStage === 'quest_active' && `Mochi bersembunyi di dalam kardus! Petunjuk lokasi: ${kittenLocation.label}.`}
                      {catQuestStage === 'kitten_rescued' && `Mochi sudah aman bersamamu! Kembalikan Mochi ke Mimi di depan ${motherCatPos.classLabel}.`}
                      {catQuestStage === 'completed' && `Mimi dan Mochi kini hidup tenang bersama. Kamu mendapatkan lencana Sahabat Kucing SMP!`}
                    </p>
                  </div>
                </div>
              )}

              {/* Collapsible Student Data Details Button */}
              {collectedStudents.length > 0 && (
                <div style={{ marginTop: 8, borderTop: '1.5px solid rgba(140, 98, 57, 0.25)', paddingTop: 14 }}>
                  <button
                    onClick={() => setShowStudentDetails(prev => !prev)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: showStudentDetails ? '#3D2419' : 'rgba(255, 255, 255, 0.08)',
                      border: '1.5px solid #F59E0B',
                      color: '#FEF3C7',
                      fontSize: 11.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <span>{showStudentDetails ? '🔼 Sembunyikan' : '👁️ Tampilkan'} Detail Catatan Data Siswa ({collectedStudents.length})</span>
                  </button>

                  {showStudentDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}
                    >
                      {/* Class Filter Tabs */}
                      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }} className="scrollbar-hidden">
                        {[
                          { id: 'ALL', label: 'Semua' },
                          { id: 'A1', label: 'VII-A', color: '#B45309' },
                          { id: 'A2', label: 'VII-B', color: '#0369A1' },
                          { id: 'B1', label: 'VIII-A', color: '#0E8388' },
                          { id: 'B2', label: 'VIII-B', color: '#059669' },
                        ].map(tab => {
                          const active = inventoryTab === tab.id
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setInventoryTab(tab.id as any)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: 8,
                                fontSize: 10.5,
                                fontWeight: 800,
                                border: active ? '1.5px solid #FDE047' : '1.5px solid #F59E0B',
                                background: active ? '#F59E0B' : 'rgba(255, 255, 255, 0.08)',
                                color: active ? '#1F130B' : '#FEF3C7',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.15s',
                              }}
                            >
                              {tab.label}
                            </button>
                          )
                        })}
                      </div>

                      {/* Student Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                        {collectedStudents
                          .filter(st => inventoryTab === 'ALL' || st.classId === inventoryTab)
                          .map((st, idx) => {
                            const doorMeta = doors.find(cd => cd.id === st.classId)
                            const themeColor = doorMeta?.color || '#8C6239'
                            return (
                              <div
                                key={`${st.classId}-${st.name}-${idx}`}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid #F59E0B',
                                  borderRadius: 10,
                                  padding: '8px 10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  boxShadow: '0 2px 6px rgba(140, 98, 57, 0.08)',
                                }}
                              >
                                <div style={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: '50%',
                                  background: '#FEF3C7',
                                  border: `1.5px solid ${themeColor}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 12,
                                  flexShrink: 0
                                }}>
                                  👤
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ fontSize: 11, fontWeight: 800, color: '#FEF3C7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {st.name}
                                  </div>
                                  <div style={{ fontSize: 9.5, color: '#9A3412', fontWeight: 800, marginTop: 1 }}>
                                    ⏱️ {st.time} Jam/hari
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showCounter && <CounterResult onDone={onComplete} />}

      {isLoadingAssets && (
        <GamePreloader
          title="MEMUAT INVESTIGASI LEVEL 1"
          subtitle="Peta Lorong Sekolah & Aset Misi"
          imagesToPreload={[
            '/Assets/Building/Gerbang.jpg',
            '/Assets/Building/Kelas.webp',
            '/Assets/Building/Fasilitas.webp',
            '/Assets/Building/Perpustakaan/Perpustakaan.webp',
            '/Assets/Building/Lab Komputer/Lab.webp',
            '/Assets/Building/Ruang VII-A/VII-A.webp',
            '/Assets/Building/Ruang VII-B/VII-B.webp',
            '/Assets/Building/Ruang VIII-A/VIII-A.webp',
            '/Assets/Building/Ruang VIII-B/VIII-B.webp',
            '/Assets/Building/Ruang Guru/Ruang Guru.webp',
            '/Assets/Building/Ruang VII-B/Pak Bambang.png',
            '/Assets/Building/Ruang VII-A/Bu Sari.webp',
            '/Assets/Building/Ruang VIII-A/Bu Rina.webp',
            '/Assets/Building/Ruang VIII-B/Pak Setiawan.webp',
            '/Assets/Character/Stevunt-idle.png',
            '/Assets/Character/pak Sutrisno-iso_idle_right-trimmed.png',
            '/Assets/CatPack/Idle.png',
            '/Assets/CatPack/Box3.png'
          ]}
          minDurationMs={1200}
          onComplete={() => setIsLoadingAssets(false)}
        />
      )}
    </div>
  )
}
