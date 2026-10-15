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
  { zone: 'Perpustakaan', x: 820, y: 460, label: 'Pojok Tenang Perpustakaan' },
  { zone: 'LabKomputer', x: 850, y: 470, label: 'Meja Server Lab Komputer' },
  { zone: 'facility_courtyard', x: 270, y: 460, label: 'Dekat Meja Santai Kantin' },
  { zone: 'hallway', x: 880, y: 530, label: 'Taman Halaman Sekolah' },
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
  id: 'KANTIN' | 'LAB_KOMPUTER' | 'PERPUSTAKAAN'
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
    id: 'KANTIN',
    label: 'Kantin Sekolah',
    subLabel: 'Tempat jajan & istirahat siswa',
    characterName: 'Bu Endang',
    characterRole: 'Pengelola Kantin Sekolah',
    x: 260,
    y: 395,
    color: '#F59E0B',
    icon: '🥪',
    dialogue: {
      greeting: '"Halo Stevunt! Mau beli es teh atau camilan segar?"',
      body: 'Tadi pas jam istirahat, banyak anak kelas 7 dan 8 kumpul di sini sambil mabar game online. Ada yang bilang kalau tidak ikut main bersama, rasanya ketinggalan obrolan tongkrongan!',
      tip: '💡 Fakta Lapangan: Siswa sering menghabiskan screen time bersama saat istirahat untuk interaksi sosial, namun penting menjaga batasan waktu agar tidak terlambat masuk kelas.'
    }
  },
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 650, background: 'rgba(4, 7, 10, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
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
          background: 'rgba(15, 35, 56, 0.98)',
          border: `2px solid ${facility.color}`,
          boxShadow: `0 0 35px ${facility.color}33`,
          borderRadius: 24,
          padding: '24px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 14 }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: 16,
            background: `${facility.color}22`,
            border: `2px solid ${facility.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            boxShadow: `0 0 16px ${facility.color}44`,
            flexShrink: 0
          }}>
            {facility.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: facility.color, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              📍 {facility.label.toUpperCase()} — {facility.subLabel}
            </div>
            <h3 style={{ margin: 0, fontSize: 17, color: '#FFFFFF', fontWeight: 900 }}>
              {facility.characterName} <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>({facility.characterRole})</span>
            </h3>
          </div>
        </div>

        {/* Dialogue Card */}
        <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: `1.5px solid ${facility.color}44`, borderRadius: 16, padding: '16px' }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: facility.color, marginBottom: 8 }}>
            {facility.dialogue.greeting}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#E2E8F0', lineHeight: 1.6, fontWeight: 500 }}>
            {facility.dialogue.body}
          </p>
        </div>

        {/* Tip Box */}
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 14, padding: '12px 14px' }}>
          <div style={{ fontSize: 11.5, color: '#34D399', fontWeight: 700, lineHeight: 1.5 }}>
            {facility.dialogue.tip}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            className="game-btn game-btn-primary"
            style={{
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 800,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${facility.color} 0%, #00ADB5 100%)`,
              color: '#FFFFFF',
              boxShadow: `0 4px 14px ${facility.color}44`,
              cursor: 'pointer'
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

function SatpamModal({ onEnterSchool, onClose }: { onEnterSchool: () => void; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 650, background: 'rgba(4, 7, 10, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 16 }}
        transition={{ type: 'spring', damping: 24, stiffness: 350 }}
        style={{
          maxWidth: 480,
          width: '100%',
          background: 'rgba(15, 35, 56, 0.98)',
          border: '2px solid #F59E0B',
          boxShadow: '0 0 35px rgba(245, 158, 11, 0.35)',
          borderRadius: 24,
          padding: '24px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(245, 158, 11, 0.15)', border: '2px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
            👮
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: '#F59E0B', letterSpacing: '1px' }}>POS KEAMANAN SEKOLAH</div>
            <h3 style={{ margin: 0, fontSize: 17, color: '#FFFFFF', fontWeight: 900 }}>Pak Joko (Satpam Sekolah)</h3>
          </div>
        </div>
        <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 14, padding: '14px 16px', fontSize: 13.5, color: '#E2E8F0', lineHeight: 1.6 }}>
          <strong style={{ color: '#FCD34D' }}>"Lho, Stevunt!</strong> Kok baru sampai jam segini?! Bel sekolah sudah berbunyi dari tadi!
          <br /><br />
          Ayo lekas lari masuk lewat gerbang ke lapangan, itu <strong style={{ color: '#EF4444' }}>Pak Sutrisno</strong> sudah berdiri memantau siswa yang terlambat!"
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="game-btn game-btn-primary"
            style={{
              flex: 1,
              padding: '12px 18px',
              borderRadius: 12,
              fontSize: 13.5,
              fontWeight: 900,
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#FFFFFF',
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)',
              cursor: 'pointer',
              border: 'none'
            }}
            onClick={() => {
              onClose()
              onEnterSchool()
            }}
          >
            🏃 Lari Masuk Gerbang Sekarang!
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 800,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#CBD5E1',
              cursor: 'pointer'
            }}
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function LibraryBookModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 650, background: 'rgba(4, 7, 10, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
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
          background: 'rgba(15, 35, 56, 0.98)',
          border: '2px solid #10B981',
          boxShadow: '0 0 35px rgba(16, 185, 129, 0.3)',
          borderRadius: 24,
          padding: '24px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 14 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(16, 185, 129, 0.15)', border: '2px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
            📖
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: '#10B981', letterSpacing: '1px' }}>POJOK BACA STATISTIKA SMP</div>
            <h3 style={{ margin: 0, fontSize: 17, color: '#FFFFFF', fontWeight: 900 }}>Buku Pintar: Analisis Data &amp; Pencilan</h3>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#E2E8F0', lineHeight: 1.5 }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontWeight: 800, color: '#34D399', marginBottom: 4 }}>1. Rata-Rata (Mean / x̄)</div>
            Jumlah semua nilai data dibagi banyak sampel (Σx ÷ n). Mean sangat <em>sensitif</em> terhadap nilai ekstrem (outlier).
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontWeight: 800, color: '#38BDF8', marginBottom: 4 }}>2. Nilai Tengah (Median / Me)</div>
            Nilai yang tepat berada di posisi tengah data terurut. Median <em>resisten</em> (kebal) terhadap outlier.
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontWeight: 800, color: '#FCD34D', marginBottom: 4 }}>3. Outlier (Nilai Pencilan) &amp; Rentang (R)</div>
            Data yang nilainya melonjak jauh dari mayoritas siswa (misal: 18 jam saat rata-rata teman hanya 3-6 jam). Rentang R = Nilai Maksimal − Nilai Minimal.
          </div>
        </div>

        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px dashed #10B981', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#6EE7B7' }}>
          💡 <strong>Pesan Bu Widya:</strong> "Ketika membaca berita viral di internet, jangan hanya melihat angka rata-rata! Tanyakan apakah ada pencilan yang membiaskan klaim tersebut."
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            className="game-btn game-btn-primary"
            style={{ padding: '9px 18px', fontSize: 13, fontWeight: 800, borderRadius: 12, background: 'linear-gradient(135deg, #10B981 0%, #00ADB5 100%)', color: '#FFFFFF', cursor: 'pointer' }}
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 650, background: 'rgba(4, 7, 10, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
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
          background: 'rgba(15, 35, 56, 0.98)',
          border: '2px solid #38BDF8',
          boxShadow: '0 0 35px rgba(56, 189, 248, 0.3)',
          borderRadius: 24,
          padding: '24px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 14 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(56, 189, 248, 0.15)', border: '2px solid #38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
            💻
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: '#38BDF8', letterSpacing: '1px' }}>LAB TIK — PUSAT ANALISIS DIGITAL</div>
            <h3 style={{ margin: 0, fontSize: 17, color: '#FFFFFF', fontWeight: 900 }}>Terminal Literasi &amp; Verifikasi Data</h3>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#E2E8F0', lineHeight: 1.5 }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontWeight: 800, color: '#38BDF8', marginBottom: 4 }}>1. Active Creation vs Passive Consumption</div>
            Waktu layar (screen time) produktif mencakup belajar coding, riset, dan membuat konten edukatif. Konsumsi pasif adalah scrolling media sosial tanpa tujuan.
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontWeight: 800, color: '#FCD34D', marginBottom: 4 }}>2. Algoritma Sensasionalisme Media Sosial</div>
            Postingan provokatif ("Semua Siswa Kecanduan!") sengaja dibuat viral untuk memancing amarah dan mengejar views (clickbait).
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontWeight: 800, color: '#34D399', marginBottom: 4 }}>3. Menyelidiki Fakta dengan Sampel Representatif</div>
            Sebuah klaim tidak dapat dibuktikan hanya dari satu atau dua siswa ekstrem. Perlu sampel acak yang cukup (seperti 24 siswa dari 4 kelas) untuk mendapatkan kesimpulan objektif.
          </div>
        </div>

        <div style={{ background: 'rgba(56,189,248,0.1)', border: '1px dashed #38BDF8', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#7DD3FC' }}>
          💡 <strong>Pesan Pak Hendra:</strong> "Gunakan teknologi sebagai instrumen pencari kebenaran, bukan sekadar mempercayai apa yang viral di beranda ponselmu!"
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            className="game-btn game-btn-primary"
            style={{ padding: '9px 18px', fontSize: 13, fontWeight: 800, borderRadius: 12, background: 'linear-gradient(135deg, #38BDF8 0%, #00ADB5 100%)', color: '#FFFFFF', cursor: 'pointer' }}
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
        background: 'rgba(4, 7, 10, 0.8)',
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
          maxWidth: 400,
          width: '100%',
          background: 'rgba(15, 35, 56, 0.98)',
          border: '2px solid #00ADB5',
          boxShadow: '0 0 25px rgba(0, 173, 181, 0.35)',
          borderRadius: 24,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
        onClick={e => e.stopPropagation()}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#00ADB5', letterSpacing: '2px', marginBottom: 4 }}>🧠 BANTUAN VISUAL STEP-BY-STEP</div>
          <h3 style={{ margin: 0, fontSize: 16, color: '#FFFFFF', fontWeight: 800 }}>Teka-teki: {door.label}</h3>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {[1, 2, 3].map(st => (
            <div key={st} style={{
              flex: 1, height: 6, borderRadius: 3,
              background: hintStep === st ? '#00ADB5' : hintStep > st ? 'rgba(0,173,181,0.3)' : 'rgba(255,255,255,0.06)',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        {/* Teks Soal Aktif */}
        <div style={{
          background: 'rgba(0, 173, 181, 0.06)',
          border: '1.5px solid rgba(0, 173, 181, 0.25)',
          borderRadius: 14,
          padding: '10px 14px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            SOAL AKTIF
          </div>
          <div style={{
            fontSize: door.quizQ.length > 30 ? '13px' : '16px',
            fontWeight: 900,
            color: '#FFFFFF',
            fontFamily: 'var(--font-data)',
            lineHeight: 1.4
          }}>
            {door.quizQ}
          </div>
        </div>

        {/* Illustration Canvas Area */}
        <div style={{
          minHeight: 180,
          background: 'rgba(4, 7, 10, 0.4)',
          border: '1px solid rgba(14, 131, 136, 0.15)',
          borderRadius: 16,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {hintStep === 3 ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🤔</div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.5 }}>
                Jadi totalnya berapa?<br />
                <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>Tutup bantuan ini lalu seret jawaban yang tepat!</span>
              </p>
            </div>
          ) : (
            renderIllustration()
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="game-btn game-btn-secondary" style={{ flex: 1, padding: '10px 14px', fontSize: 13, background: 'rgba(239, 68, 68, 0.08)', border: '1.5px solid #EF4444', color: '#EF4444' }} onClick={onClose}>Tutup</button>
          {hintStep < 3 && (
            <button className="game-btn game-btn-primary" style={{ flex: 1.5, padding: '10px 14px', fontSize: 13 }} onClick={() => setHintStep(curr => (curr + 1) as any)}>
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(11, 30, 44, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.88, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 18 }}
          transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          style={{
            maxWidth: 420,
            width: '100%',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
            background: 'rgba(15, 35, 56, 0.95)',
            border: `2.5px solid ${door.color}66`,
            borderRadius: 24,
            padding: '24px 20px',
            boxShadow: '0 10px 35px rgba(14, 131, 136, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '2px', color: door.color, marginBottom: 8 }}>🔐 {door.label} — Jawab untuk membuka!</div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#E2E8F0', lineHeight: 1.6 }}>Di dalam pintu ini tersimpan data screen time. Jawab soal berikut untuk membuka pintu:</p>
          </div>

          {(door.image || CLASS_STUDENTS[door.id]?.image) && (
            <div style={{
              width: '100%',
              height: 130,
              borderRadius: 16,
              overflow: 'hidden',
              position: 'relative',
              border: `1.5px solid ${door.color}66`,
              boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
            }}>
              <img
                src={door.image || CLASS_STUDENTS[door.id]?.image}
                alt={door.label}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 20%, rgba(15, 35, 56, 0.9) 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '8px 12px'
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
                  🏫 Ruangan {door.label}
                </span>
              </div>
            </div>
          )}
          <div style={{ background: `${door.color}11`, border: `1.5px solid ${door.color}33`, borderRadius: 16, padding: '16px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: door.quizQ.length > 20 ? (door.quizQ.length > 50 ? 14 : 16) : 22, fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-data)', lineHeight: 1.4 }}>{door.quizQ}</div>

            {/* FD Context Hint */}
            {isFD && door.fdContext && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#ffb060', fontWeight: 600, lineHeight: 1.5, background: 'rgba(217, 119, 6, 0.08)', border: '1px dashed rgba(217, 119, 6, 0.3)', borderRadius: '8px', padding: '6px 8px' }}>
                {door.fdContext}
              </div>
            )}
          </div>

          {/* Target Answer Slot */}
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Drop Jawaban di Sini
            </div>
            <div
              data-answer-slot="true"
              style={{
                width: isTextQuestion ? '85%' : 72,
                height: isTextQuestion ? 46 : 72,
                borderRadius: isTextQuestion ? 12 : 16,
                border: isCorrect
                  ? '2px solid #00ADB5'
                  : isWrong
                    ? '2px dashed #EF4444'
                    : '2px dashed rgba(14, 131, 136, 0.4)',
                background: isCorrect
                  ? 'rgba(0, 173, 181, 0.15)'
                  : isWrong
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'rgba(14, 131, 136, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                boxShadow: isCorrect ? '0 0 15px rgba(0, 173, 181, 0.25)' : 'none',
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
                      ? 'linear-gradient(135deg, #00ADB5 0%, #008891 100%)'
                      : 'linear-gradient(135deg, #EF4444 0%, #C53030 100%)',
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
                <span style={{ fontSize: 22, opacity: 0.2, color: door.color, fontFamily: 'monospace' }}>?</span>
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
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px dashed rgba(255, 255, 255, 0.08)',
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
                  whileDrag={{ scale: 1.15, zIndex: 9999, cursor: 'grabbing', boxShadow: `0 8px 24px ${door.color}66, 0 0 0 2px ${door.color}` }}
                  style={{
                    width: isTextQuestion ? undefined : 48,
                    height: isTextQuestion ? 34 : 48,
                    borderRadius: isTextQuestion ? 10 : '50%',
                    background: `linear-gradient(135deg, ${door.color}dd 0%, ${door.color}88 100%)`,
                    border: `1.5px solid ${door.color}55`,
                    boxShadow: '0 3px 8px rgba(0,0,0,0.4)',
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
                style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)', fontSize: 15, fontWeight: 600, color: '#ffb060', lineHeight: 1.6 }}>
                💡 {door.hint}
              </motion.div>}
            </AnimatePresence>
          </motion.div>

          {/* Bantuan Visual Button */}
          {showVisualHint && (
            <button
              className="game-btn game-btn-secondary"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '6px 12px',
                alignSelf: 'center',
                color: '#00ADB5',
                borderColor: 'rgba(0, 173, 181, 0.3)',
                background: 'rgba(0, 173, 181, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                margin: '4px auto 0 auto',
                borderRadius: '8px'
              }}
              onClick={() => setOpenVisualModal(true)}
            >
              💡 Buka Bantuan Visual Step-by-Step
            </button>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="game-btn game-btn-secondary" style={{ flex: 1, fontSize: 15, fontWeight: 800, padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)', border: '1.5px solid #EF4444', color: '#EF4444' }} onClick={onClose}>Kembali</button>
            <button
              className="game-btn game-btn-primary"
              style={{
                flex: 2,
                fontSize: 15,
                fontWeight: 800,
                padding: '10px 14px',
                opacity: isCorrect ? 1 : 0.45,
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(11, 30, 44, 0.92)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{
            maxWidth: 460,
            width: '100%',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
            background: 'rgba(15, 35, 56, 0.95)',
            border: '2px solid rgba(14, 131, 136, 0.5)',
            borderRadius: 26,
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: '0 10px 35px rgba(14, 131, 136, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '2px', color: '#00ADB5', marginBottom: 8 }}>⚙️ MESIN PENGHITUNG DATA</div>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#FFFFFF' }}>Mengagregasikan total sampel...</h3>
          </div>
          <div style={{ background: 'rgba(14, 131, 136, 0.06)', border: '2px solid rgba(14, 131, 136, 0.3)', borderRadius: 20, padding: '28px 20px' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 800, marginBottom: 10, letterSpacing: '0.8px' }}>JUMLAH SAMPEL (n)</div>
            <motion.div style={{ fontSize: 84, fontWeight: 900, color: '#00ADB5', fontFamily: 'var(--font-data)', lineHeight: 1 }}
              animate={done ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.6 }}>{count}</motion.div>
          </div>
          <AnimatePresence>{done && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '16px 20px', borderRadius: 16, background: 'rgba(14, 131, 136, 0.04)', border: '1px solid rgba(14, 131, 136, 0.2)', fontSize: 15, fontWeight: 600, color: '#E2E8F0', lineHeight: 1.7, textAlign: 'left' }}>
                Kamu telah mengumpulkan seluruh data dari 4 kelas (VII-A, VII-B, VIII-A, VIII-B).<br />
                Ukuran sampel yang terkumpul adalah <strong style={{ color: '#00ADB5', fontSize: 19 }}>n = {TOTAL_N}</strong>.
              </div>
              {btn && <button className="game-btn game-btn-primary" style={{ width: '100%', fontSize: 16, fontWeight: 800, padding: '12px 18px' }} onClick={onDone}>Lanjut ke Perhitungan Rentang (R) →</button>}
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 650, background: 'rgba(4, 7, 10, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{
          maxWidth: 460,
          width: '100%',
          background: 'rgba(15, 35, 56, 0.96)',
          border: '2px solid #38BDF8',
          boxShadow: '0 0 35px rgba(56, 189, 248, 0.35)',
          borderRadius: 24,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', border: '2px solid #38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
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
            <div style={{ fontSize: 10, fontWeight: 900, color: '#38BDF8', letterSpacing: '1.5px', textTransform: 'uppercase' }}>👨‍🏫 GURU KEDISIPLINAN SEKOLAH</div>
            <h3 style={{ margin: 0, fontSize: 17, color: '#FFFFFF', fontWeight: 900 }}>Pak Sutrisno</h3>
          </div>
        </div>

        <div style={{ background: 'rgba(56, 189, 248, 0.06)', border: '1.5px solid rgba(56, 189, 248, 0.25)', borderRadius: 16, padding: '16px 14px' }}>
          <p style={{ margin: 0, fontSize: 13.5, color: '#E2E8F0', fontWeight: 600, lineHeight: 1.65 }}>
            "Kamu terlambat lagi! Bel sekolah sudah lama berbunyi dan kamu baru saja melangkah di lapangan ini.<br /><br />
            Sebagai sanksi kedisiplinan, kamu <strong style={{ color: '#F87171' }}>TIDAK BOLEH masuk kelas</strong> sebelum menyelesaikan tugas ini:<br />
            <strong style={{ color: '#38BDF8' }}>Kelilingi lorong sekolah dan kumpulkan 24 sampel data screen time dari 4 kelas (VII-A, VII-B, VIII-A, VIII-B)!</strong>"
          </p>
        </div>

        <button
          className="game-btn game-btn-primary"
          style={{ padding: '12px 18px', fontSize: 14, fontWeight: 900, width: '100%', borderRadius: 14, background: 'linear-gradient(135deg, #00ADB5 0%, #38BDF8 100%)', boxShadow: '0 0 15px rgba(0, 173, 181, 0.4)', cursor: 'pointer' }}
          onClick={onAccept}
        >
          SAYA SIAP TERIMA SANKSI & INVESTIGASI DATA →
        </button>
      </motion.div>
    </div>
  )
}

// ─── Pak Sutrisno Report & Mean Analysis Modal ──────────────────────────────
function PakReportModal({ dataset, onProceed }: { dataset: number[]; onProceed: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedMean, setSelectedMean] = useState<number | null>(null)
  const [meanIsCorrect, setMeanIsCorrect] = useState<boolean | null>(null)
  const [selectedClaim, setSelectedClaim] = useState<'misleading' | 'true' | null>(null)
  const [claimIsCorrect, setClaimIsCorrect] = useState<boolean | null>(null)
  const [shakeStep, setShakeStep] = useState<number>(0)

  const { STATS } = getLevel1Data(dataset)
  const totalSum = STATS.sum
  const meanVal = STATS.mean
  const lte8Count = dataset.filter(x => x <= 8).length

  // Subtotals per classroom
  const a1Data = dataset.slice(0, 5)
  const a2Data = dataset.slice(5, 12)
  const b1Data = dataset.slice(12, 16)
  const b2Data = dataset.slice(16, 24)

  const sumA1 = a1Data.reduce((a, b) => a + b, 0)
  const sumA2 = a2Data.reduce((a, b) => a + b, 0)
  const sumB1 = b1Data.reduce((a, b) => a + b, 0)
  const sumB2 = b2Data.reduce((a, b) => a + b, 0)

  // 4 Multiple choice options for mean (1 correct, 3 distractors)
  const meanChoices = useMemo(() => {
    const pool = new Set<number>([meanVal])
    const candidateOffsets = [-1.0, 1.2, -0.5, 1.5, 2.0, -1.5]
    for (const off of candidateOffsets) {
      if (pool.size >= 4) break
      const cand = Number((meanVal + off).toFixed(1))
      if (cand > 0 && !pool.has(cand)) {
        pool.add(cand)
      }
    }
    return Array.from(pool).sort((a, b) => a - b)
  }, [meanVal])

  const handleChooseMean = (val: number) => {
    setSelectedMean(val)
    if (Math.abs(val - meanVal) < 0.05) {
      setMeanIsCorrect(true)
      gameAudio.playSuccess()
    } else {
      setMeanIsCorrect(false)
      setShakeStep(prev => prev + 1)
      gameAudio.playError()
    }
  }

  const handleChooseClaim = (claim: 'misleading' | 'true') => {
    setSelectedClaim(claim)
    if (claim === 'misleading') {
      setClaimIsCorrect(true)
      gameAudio.playSuccess()
    } else {
      setClaimIsCorrect(false)
      setShakeStep(prev => prev + 1)
      gameAudio.playError()
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 650, background: 'rgba(4, 7, 10, 0.88)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <motion.div
        key={`step-${step}`}
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: 'spring', damping: 24, stiffness: 350 }}
        style={{
          maxWidth: 580,
          width: '100%',
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          background: 'rgba(15, 35, 56, 0.98)',
          border: '2px solid #00ADB5',
          boxShadow: '0 0 40px rgba(0, 173, 181, 0.35)',
          borderRadius: 24,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxSizing: 'border-box'
        }}
      >
        {/* Modal Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 14 }}>
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0, 173, 181, 0.15)', border: '2px solid #00ADB5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}
          >
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
          </motion.div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: '#38BDF8', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              👨‍🏫 RUANG GURU — EVALUASI &amp; VERIFIKASI SANKSI
            </div>
            <h3 style={{ margin: 0, fontSize: 17, color: '#FFFFFF', fontWeight: 900 }}>Pak Sutrisno (Guru Kedisiplinan)</h3>
          </div>
        </div>

        {/* Quest Step Tabs */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(0,0,0,0.3)', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { s: 1, label: '1. Rekap Data' },
            { s: 2, label: '2. Hitung Rata-Rata (x̄)' },
            { s: 3, label: '3. Uji Klaim Viral' }
          ].map(item => (
            <div
              key={item.s}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '6px 4px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 800,
                background: step === item.s ? 'rgba(0, 173, 181, 0.25)' : 'transparent',
                color: step === item.s ? '#38BDF8' : step > item.s ? '#10B981' : '#64748B',
                border: step === item.s ? '1px solid rgba(0, 173, 181, 0.5)' : '1px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              {step > item.s ? '✓ ' : ''}{item.label}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Rekap 24 Data ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'rgba(0, 173, 181, 0.06)', border: '1.5px solid rgba(0, 173, 181, 0.25)', borderRadius: 16, padding: '14px 14px' }}>
              <p style={{ margin: 0, fontSize: 13.5, color: '#E2E8F0', fontWeight: 600, lineHeight: 1.6 }}>
                "Bagus sekali Stevunt! Kamu sudah berkeliling ke 4 ruang kelas dan sukses mengumpulkan seluruh <strong style={{ color: '#38BDF8' }}>24 sampel data screen time siswa</strong>.<br />
                Berikut adalah rangkuman data yang telah kamu kumpulkan:"
              </p>
            </div>

            {/* Classrooms Breakdown Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {/* VII-A */}
              <div style={{ background: 'rgba(129, 140, 248, 0.08)', border: '1px solid rgba(129, 140, 248, 0.25)', borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#818cf8' }}>🏫 KELAS VII-A (5 Siswa)</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8' }}>Σ = {sumA1} jam</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {a1Data.map((t, idx) => (
                    <span key={idx} style={{ background: 'rgba(129, 140, 248, 0.2)', border: '1px solid rgba(129, 140, 248, 0.4)', borderRadius: 6, padding: '2px 7px', fontSize: 11, fontWeight: 800, color: '#FFFFFF' }}>{t}h</span>
                  ))}
                </div>
              </div>

              {/* VII-B */}
              <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#6366f1' }}>🏫 KELAS VII-B (7 Siswa)</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8' }}>Σ = {sumA2} jam</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {a2Data.map((t, idx) => (
                    <span key={idx} style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: 6, padding: '2px 7px', fontSize: 11, fontWeight: 800, color: '#FFFFFF' }}>{t}h</span>
                  ))}
                </div>
              </div>

              {/* VIII-A */}
              <div style={{ background: 'rgba(0, 173, 181, 0.08)', border: '1px solid rgba(0, 173, 181, 0.25)', borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#00ADB5' }}>🏫 KELAS VIII-A (4 Siswa)</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8' }}>Σ = {sumB1} jam</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {b1Data.map((t, idx) => (
                    <span key={idx} style={{ background: 'rgba(0, 173, 181, 0.2)', border: '1px solid rgba(0, 173, 181, 0.4)', borderRadius: 6, padding: '2px 7px', fontSize: 11, fontWeight: 800, color: '#FFFFFF' }}>{t}h</span>
                  ))}
                </div>
              </div>

              {/* VIII-B */}
              <div style={{ background: 'rgba(14, 131, 136, 0.08)', border: '1px solid rgba(14, 131, 136, 0.25)', borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#2DD4BF' }}>🏫 KELAS VIII-B (8 Siswa)</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8' }}>Σ = {sumB2} jam</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {b2Data.map((t, idx) => (
                    <span key={idx} style={{ background: 'rgba(14, 131, 136, 0.2)', border: '1px solid rgba(14, 131, 136, 0.4)', borderRadius: 6, padding: '2px 7px', fontSize: 11, fontWeight: 800, color: '#FFFFFF' }}>{t}h</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Summary Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 12, padding: '10px 16px' }}>
              <div>
                <div style={{ fontSize: 10.5, color: '#94A3B8', fontWeight: 700 }}>JUMLAH SAMPEL (n)</div>
                <div style={{ fontSize: 18, color: '#10B981', fontWeight: 900 }}>24 Siswa</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10.5, color: '#94A3B8', fontWeight: 700 }}>TOTAL WAKTU LAYAR (Σx)</div>
                <div style={{ fontSize: 18, color: '#38BDF8', fontWeight: 900 }}>{totalSum} Jam</div>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: 13, color: '#CBD5E1', lineHeight: 1.5 }}>
              "Sebagai tugas penentu untuk menuntaskan sanksimu: <strong style={{ color: '#FCD34D' }}>Hitunglah nilai rata-rata (mean / x̄)</strong> screen time dari 24 siswa ini!"
            </p>

            <button
              className="game-btn game-btn-primary"
              style={{ padding: '12px 18px', fontSize: 14, fontWeight: 900, width: '100%', borderRadius: 14, background: 'linear-gradient(135deg, #00ADB5 0%, #38BDF8 100%)', boxShadow: '0 0 15px rgba(0, 173, 181, 0.4)', cursor: 'pointer' }}
              onClick={() => setStep(2)}
            >
              LANJUT: HITUNG NILAI RATA-RATA (x̄) →
            </button>
          </div>
        )}

        {/* ── STEP 2: Hitung Rata-Rata (x̄) ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Formula Card */}
            <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1.5px solid rgba(56, 189, 248, 0.3)', borderRadius: 16, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#38BDF8', letterSpacing: '1px', marginBottom: 6 }}>RUMUS RATA-RATA (MEAN)</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-data)' }}>
                x̄ = Σx ÷ n = {totalSum} ÷ 24
              </div>
              <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 4 }}>
                Bagi total screen time ({totalSum} jam) dengan banyaknya siswa (24 siswa).
              </div>
            </div>

            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#E2E8F0' }}>
              Berapakah nilai rata-rata (<span style={{ color: '#38BDF8' }}>x̄</span>) screen time 24 siswa kita?
            </div>

            {/* 4 Choices */}
            <motion.div
              key={shakeStep}
              animate={meanIsCorrect === false ? { x: [-8, 8, -6, 6, 0] } : {}}
              transition={{ duration: 0.35 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}
            >
              {meanChoices.map((choice) => {
                const isSelected = selectedMean === choice
                const isCorrect = Math.abs(choice - meanVal) < 0.05
                const isSelectedCorrect = isSelected && meanIsCorrect === true
                const isSelectedWrong = isSelected && meanIsCorrect === false

                return (
                  <button
                    key={choice}
                    disabled={meanIsCorrect === true}
                    onClick={() => handleChooseMean(choice)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 14,
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: meanIsCorrect === true ? 'default' : 'pointer',
                      border: isSelectedCorrect
                        ? '2px solid #10B981'
                        : isSelectedWrong
                        ? '2px solid #EF4444'
                        : isSelected
                        ? '2px solid #38BDF8'
                        : '1.5px solid rgba(255,255,255,0.12)',
                      background: isSelectedCorrect
                        ? 'rgba(16, 185, 129, 0.2)'
                        : isSelectedWrong
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(255,255,255,0.04)',
                      color: isSelectedCorrect ? '#10B981' : isSelectedWrong ? '#EF4444' : '#FFFFFF',
                      boxShadow: isSelectedCorrect ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <span>{choice} jam/hari</span>
                    {isSelectedCorrect && <span>✓</span>}
                    {isSelectedWrong && <span>✕</span>}
                  </button>
                )
              })}
            </motion.div>

            {/* Feedback notification */}
            {meanIsCorrect === false && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 12, padding: '10px 14px', fontSize: 12.5, color: '#FCA5A5', fontWeight: 600 }}>
                💡 Kurang tepat! Coba bagi {totalSum} dengan 24. Berapa hasil dari {totalSum} ÷ 24? Hitung kembali dengan teliti.
              </div>
            )}

            {meanIsCorrect === true && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1.5px solid #10B981', borderRadius: 14, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10B981', fontWeight: 900, fontSize: 13.5 }}>
                  <span>🎉 TEPAT SEKALI!</span>
                </div>
                <div style={{ fontSize: 13, color: '#E2E8F0', lineHeight: 1.5 }}>
                  Nilai rata-rata screen time dari 24 siswa adalah <strong style={{ color: '#10B981' }}>{meanVal} jam/hari</strong> ({totalSum} ÷ 24).<br />
                  Sekarang, mari kita bandingkan angka ini dengan postingan yang sedang viral di linimasa!
                </div>
              </motion.div>
            )}

            {meanIsCorrect === true && (
              <button
                className="game-btn game-btn-primary"
                style={{ padding: '12px 18px', fontSize: 14, fontWeight: 900, width: '100%', borderRadius: 14, background: 'linear-gradient(135deg, #10B981 0%, #38BDF8 100%)', boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)', cursor: 'pointer' }}
                onClick={() => setStep(3)}
              >
                LANJUT: EVALUASI KLAIM VIRAL MEDSOS →
              </button>
            )}
          </div>
        )}

        {/* ── STEP 3: Uji Klaim Viral ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#E2E8F0', lineHeight: 1.5 }}>
              "Perhatikan postingan yang sedang viral dan menuai kekhawatiran masyarakat berikut ini:"
            </p>

            {/* Social Media Viral Card */}
            <div style={{
              background: '#0B132B',
              border: '1.5px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 16,
              padding: '14px 16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #EF4444 0%, #F59E0B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                    📱
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 4 }}>
                      @faktaviral.id <span style={{ color: '#38BDF8', fontSize: 11 }}>☑️</span>
                    </div>
                    <div style={{ fontSize: 9.5, color: '#64748B' }}>3 jam lalu • Publik</div>
                  </div>
                </div>
                <span style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#F87171', fontSize: 9.5, fontWeight: 900, padding: '2px 8px', borderRadius: 20 }}>
                  🔥 TRENDING #1
                </span>
              </div>

              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.45 }}>
                "SURVEI VIRAL: Remaja Indonesia rata-rata habiskan <span style={{ color: '#F87171', background: 'rgba(239, 68, 68, 0.2)', padding: '1px 6px', borderRadius: 4 }}>&gt; 8 jam per hari</span> di media sosial! Generasi muda cemas dan kecanduan layar!"
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#94A3B8', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
                <span>❤️ 128.4K suka</span>
                <span>💬 4.9K komentar</span>
                <span>🔄 28.1K dibagikan</span>
              </div>
            </div>

            {/* Pak Sutrisno prompt */}
            <div style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 600, lineHeight: 1.5 }}>
              Pak Sutrisno: "Berdasarkan hasil investigasi data 24 siswa kita dengan rata-rata <strong style={{ color: '#38BDF8' }}>{meanVal} jam/hari</strong>, apakah klaim postingan viral bahwa <em>'rata-rata remaja &gt; 8 jam/hari'</em> ini terbukti BENAR atau SALAH / MISLEADING?"
            </div>

            {/* 2 Verdict Cards */}
            <motion.div
              key={shakeStep}
              animate={claimIsCorrect === false ? { x: [-8, 8, -6, 6, 0] } : {}}
              transition={{ duration: 0.35 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {/* Option A: MISLEADING */}
              <button
                disabled={claimIsCorrect === true}
                onClick={() => handleChooseClaim('misleading')}
                style={{
                  padding: '12px 16px',
                  borderRadius: 14,
                  textAlign: 'left',
                  cursor: claimIsCorrect === true ? 'default' : 'pointer',
                  border: selectedClaim === 'misleading'
                    ? '2px solid #10B981'
                    : '1.5px solid rgba(255,255,255,0.12)',
                  background: selectedClaim === 'misleading'
                    ? 'rgba(16, 185, 129, 0.16)'
                    : 'rgba(255,255,255,0.03)',
                  color: '#FFFFFF',
                  transition: 'all 0.2s',
                  boxShadow: selectedClaim === 'misleading' ? '0 0 15px rgba(16, 185, 129, 0.25)' : 'none'
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 900, color: '#10B981', marginBottom: 3 }}>
                  🚨 KLAIM SALAH / MISLEADING (Tidak Terbukti)
                </div>
                <div style={{ fontSize: 12, color: '#CBD5E1', lineHeight: 1.45 }}>
                  Rata-rata nyata siswa kita adalah <strong>{meanVal} jam/hari</strong> (jauh di bawah 8 jam), dan mayoritas siswa ({lte8Count} dari 24 siswa) bermain gawai ≤ 8 jam.
                </div>
              </button>

              {/* Option B: TRUE */}
              <button
                disabled={claimIsCorrect === true}
                onClick={() => handleChooseClaim('true')}
                style={{
                  padding: '12px 16px',
                  borderRadius: 14,
                  textAlign: 'left',
                  cursor: claimIsCorrect === true ? 'default' : 'pointer',
                  border: selectedClaim === 'true'
                    ? '2px solid #EF4444'
                    : '1.5px solid rgba(255,255,255,0.12)',
                  background: selectedClaim === 'true'
                    ? 'rgba(239, 68, 68, 0.16)'
                    : 'rgba(255,255,255,0.03)',
                  color: '#FFFFFF',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 900, color: '#F87171', marginBottom: 3 }}>
                  ✅ KLAIM BENAR (Terbukti)
                </div>
                <div style={{ fontSize: 12, color: '#CBD5E1', lineHeight: 1.45 }}>
                  Remaja memang rata-rata bermain gawai lebih dari 8 jam per hari sesuai klaim postingan viral.
                </div>
              </button>
            </motion.div>

            {claimIsCorrect === false && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 12, padding: '10px 14px', fontSize: 12.5, color: '#FCA5A5', fontWeight: 600 }}>
                💡 Tunggu dulu! Nilai rata-rata yang baru saja kamu hitung adalah {meanVal} jam/hari. Angka {meanVal} jam itu LEBIH KECIL dari 8 jam! Jadi klaim bahwa rata-rata &gt; 8 jam tidak sesuai data nyata!
              </div>
            )}

            {claimIsCorrect === true && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1.5px solid #10B981', borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#10B981' }}>
                    🎯 ANALISIS KRITIS TEPAT SEKALI!
                  </div>
                  <div style={{ fontSize: 13, color: '#E2E8F0', lineHeight: 1.6 }}>
                    "Luar biasa, Stevunt! Kamu berhasil membuktikan secara objektif bahwa postingan tersebut melebih-lebihkan fakta!<br /><br />
                    Data empiris kita menunjukkan rata-rata screen time hanya <strong style={{ color: '#38BDF8' }}>{meanVal} jam/hari</strong>. Sebagian besar siswa ({lte8Count} dari 24) bermain secara normal. Angka tinggi pada postingan terjadi karena ada beberapa siswa dengan waktu layar sangat tinggi (hingga 18 jam) yang kita sebut <strong style={{ color: '#FCD34D' }}>OUTLIER (pencilan)</strong>!<br /><br />
                    Coba uji interaktif simulator di bawah untuk melihat perbedaan drastis pada Mean vs Median saat data pencilan ini disaring!"
                  </div>
                </motion.div>

                <OutlierSimulator dataset={dataset} />

                <button
                  className="game-btn game-btn-primary"
                  style={{ padding: '13px 18px', fontSize: 14.5, fontWeight: 900, width: '100%', borderRadius: 14, background: 'linear-gradient(135deg, #10B981 0%, #38BDF8 100%)', boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)', cursor: 'pointer' }}
                  onClick={onProceed}
                >
                  MULAI ANALISIS DISTRIBUSI FREKUENSI (RENTANG R) →
                </button>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function NPath({ onComplete, isFD = true, demoMode = false, demoStep = null }: { onComplete: () => void; isFD?: boolean; demoMode?: boolean; demoStep?: string | null }) {
  const level1Dataset = useGameStore(s => s.level1Dataset)

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

  const [isLoadingAssets, setIsLoadingAssets] = useState(true)
  const isDemoExploration = demoMode && (demoStep === 'exploration' || demoStep === 'interval' || demoStep === 'histogram')
  const [charPos, setCharPos] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('zone') === 'gate') return { x: 615, y: 575 }
    }
    return isDemoExploration ? { x: 180, y: 585 } : { x: 615, y: 575 }
  })
  const [cinematicStage, setCinematicStage] = useState<'gate_intro' | 'player_intro' | 'panning_to_pak' | 'pak_shouting' | 'pak_shouting_2' | 'panning_to_player' | 'quest_meet_pak' | 'pak_sanction_1' | 'pak_sanction_2' | 'pak_sanction_3' | 'player_reply_pak' | 'sanction_received'>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
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
      : isDemoExploration ? { x: 180, y: 585 } : { x: 615, y: 575 }
  )
  const [unlocked, setUnlocked] = useState<Set<string>>(() => {
    return new Set(['A', 'B', 'RG', 'A1', 'A2', 'B1', 'B2'])
  })
  const [savedClasses, setSavedClasses] = useState<Set<string>>(() => new Set())
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
  const [teacherCutsceneStage, setTeacherCutsceneStage] = useState<'anim_wait' | 'teacher_ask' | 'player_explain' | 'teacher_reply' | null>(null)
  const teacherCutsceneStageRef = useRef(teacherCutsceneStage)
  teacherCutsceneStageRef.current = teacherCutsceneStage
  const teacherTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ── Multi-Zone State (Zona 0: Gerbang, Zona 1: Kelas, Zona 2: Fasilitas) ──
  const [currentZone, setCurrentZone] = useState<'gate' | 'main' | 'facility'>(() => {
    return isDemoExploration ? 'main' : 'gate'
  })
  const currentZoneR = useRef(currentZone); currentZoneR.current = currentZone
  const [gateBubbleStep, setGateBubbleStep] = useState(0)
  const [showSatpamModal, setShowSatpamModal] = useState(false)
  const showSatpamModalR = useRef(showSatpamModal); showSatpamModalR.current = showSatpamModal
  const [activeFacility, setActiveFacility] = useState<FacilityDoor | null>(null)
  const activeFacilityR = useRef(activeFacility); activeFacilityR.current = activeFacility
  const [nearFacility, setNearFacility] = useState<FacilityDoor | null>(null)
  const nearFacilityR = useRef(nearFacility); nearFacilityR.current = nearFacility
  const [zoneTransitionPrompt, setZoneTransitionPrompt] = useState<'to_facility' | 'to_main' | null>(null)

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
  const [catQuestStage, setCatQuestStage] = useState<CatQuestStage>('untriggered')
  const catQuestStageR = useRef(catQuestStage); catQuestStageR.current = catQuestStage
  const [motherCatPos, setMotherCatPos] = useState<{ x: number; y: number; classLabel: string }>({ x: 380, y: 550, classLabel: 'VII-A' })
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
    setMoveDir({ x: 0, y: 0 })
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

  const goToFacilityZone = useCallback(() => {
    gameAudio.playDoorOpen()
    resetMovement()
    setCurrentZone('facility')
    setCharPos({ x: 625, y: 550 })
    smoothCamPos.current = { x: 625, y: 550 }
    setZoneTransitionPrompt(null)
  }, [resetMovement])

  const goToMainZone = useCallback(() => {
    gameAudio.playDoorOpen()
    resetMovement()
    setCurrentZone('main')
    setCharPos({ x: 625, y: 575 })
    smoothCamPos.current = { x: 625, y: 575 }
    setZoneTransitionPrompt(null)
  }, [resetMovement])

  const enterSchoolFromGate = useCallback(() => {
    gameAudio.playDoorOpen()
    resetMovement()
    setCurrentZone('main')
    setCharPos({ x: 180, y: 585 })
    smoothCamPos.current = { x: 180, y: 585 }
    setCinematicStage('panning_to_pak')
  }, [resetMovement])

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
        const { clientWidth, clientHeight } = containerRef.current
        if (clientWidth > 0 && clientHeight > 0) {
          setContainerDim(prev => (prev.w === clientWidth && prev.h === clientHeight ? prev : { w: clientWidth, h: clientHeight }))
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
  }, [charPos])

  // Proximity to doors (calculated smoothly from player position)
  useEffect(() => {
    const { x: cx, y: cy } = charPos
    let closest: typeof DOORS[number] | null = null
    let minDist = Infinity
    for (const d of DOORS) {
      if (unlockedR.current.has(d.id)) continue
      const dist = Math.hypot(d.x - cx, d.y - cy)
      if (dist < 50 && dist < minDist) {
        minDist = dist
        closest = d
      }
    }
    setNearDoor(prev => (prev?.id === closest?.id ? prev : closest))
  }, [charPos])

  // Proximity to class doors (calculated smoothly from player position, only in main zone)
  useEffect(() => {
    if (currentZone !== 'main' || insideRoom) {
      setNearClass(null)
      return
    }
    const { x: cx, y: cy } = charPos
    let closest: QuizDoor | null = null
    let minDist = Infinity
    for (const d of doors) {
      if (d.roomId !== 'RG' && !unlockedR.current.has(d.roomId)) continue
      const dist = Math.hypot(d.x - cx, d.y - cy)
      const threshold = d.roomId === 'RG' ? 85 : 60
      if (dist < threshold && dist < minDist) {
        minDist = dist
        closest = d
      }
    }
    setNearClass(prev => (prev?.id === closest?.id ? prev : closest))
  }, [charPos, doors, currentZone, insideRoom])

  // Proximity to facility doors (when in facility zone)
  useEffect(() => {
    if (currentZone !== 'facility' || insideRoom) {
      setNearFacility(null)
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
  }, [charPos, currentZone, insideRoom])

  // Proximity to facility room learning stations (Bookshelf in Perpustakaan, Terminal in Lab Komputer)
  useEffect(() => {
    if (!insideRoom) {
      setNearLibraryShelf(false)
      setNearLabTerminal(false)
      return
    }
    if (insideRoom.id === 'Perpustakaan') {
      const dist = Math.hypot(charPos.x - 280, charPos.y - 440)
      setNearLibraryShelf(dist < 90)
      setNearLabTerminal(false)
    } else if (insideRoom.id === 'LabKomputer') {
      const dist = Math.hypot(charPos.x - 300, charPos.y - 440)
      setNearLabTerminal(dist < 90)
      setNearLibraryShelf(false)
    } else {
      setNearLibraryShelf(false)
      setNearLabTerminal(false)
    }
  }, [charPos, insideRoom])

  // Proximity to Mother Cat (only in main hallway)
  useEffect(() => {
    if (insideRoom || currentZone !== 'main' || catQuestStage === 'untriggered') {
      setNearMotherCat(false)
      return
    }
    const dist = Math.hypot(charPos.x - motherCatPos.x, charPos.y - motherCatPos.y)
    setNearMotherCat(dist < 75)
  }, [charPos, insideRoom, currentZone, catQuestStage, motherCatPos])

  // Proximity to Kitten in Box
  useEffect(() => {
    if (catQuestStage !== 'quest_active') {
      setNearKitten(false)
      return
    }
    const isPlayerInKittenZone =
      (kittenLocation.zone === 'Perpustakaan' && insideRoom?.id === 'Perpustakaan') ||
      (kittenLocation.zone === 'LabKomputer' && insideRoom?.id === 'LabKomputer') ||
      (kittenLocation.zone === 'facility_courtyard' && currentZone === 'facility' && !insideRoom) ||
      (kittenLocation.zone === 'hallway' && currentZone === 'main' && !insideRoom)

    if (!isPlayerInKittenZone) {
      setNearKitten(false)
      return
    }

    const dist = Math.hypot(charPos.x - kittenLocation.x, charPos.y - kittenLocation.y)
    setNearKitten(dist < 75)
  }, [charPos, catQuestStage, kittenLocation, insideRoom, currentZone])

  // Proximity to Zone Transition Gateway & Auto-step transition
  useEffect(() => {
    if (insideRoom) {
      setZoneTransitionPrompt(null)
      return
    }
    const isAtGateway = charPos.y >= 590 && Math.abs(charPos.x - 625) < 220
    if (isAtGateway) {
      setZoneTransitionPrompt(currentZone === 'main' ? 'to_facility' : 'to_main')
    } else {
      setZoneTransitionPrompt(null)
    }

    // Auto-step transition when walking to the very edge (y >= 635)
    if (charPos.y >= 635 && Math.abs(charPos.x - 625) < 220) {
      if (currentZone === 'main') {
        goToFacilityZone()
      } else {
        goToMainZone()
      }
    }
  }, [charPos.x, charPos.y, currentZone, insideRoom, goToFacilityZone, goToMainZone])

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
      if (charPos.y < 380) {
        setCharPos(prev => (prev.y < 380 ? { ...prev, y: 380 } : prev))
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

      if (!isInside && currentZoneR.current === 'main' && (cinematicStageRef.current === 'panning_to_pak' || cinematicStageRef.current === 'pak_shouting' || cinematicStageRef.current === 'pak_shouting_2')) {
        targetFocusX = PAK_SUTRISNO_POS.x
        targetFocusY = PAK_SUTRISNO_POS.y
      }

      // Smooth camera lerp
      smoothCamPos.current.x += (targetFocusX - smoothCamPos.current.x) * 0.075
      smoothCamPos.current.y += (targetFocusY - smoothCamPos.current.y) * 0.075

      // Automatic transitions for camera pan
      if (cinematicStageRef.current === 'panning_to_pak') {
        const distToPak = Math.hypot(smoothCamPos.current.x - PAK_SUTRISNO_POS.x, smoothCamPos.current.y - PAK_SUTRISNO_POS.y)
        if (distToPak < 35) {
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

      if (!activeDoor && !activeClass && !showWaliKelasPopup && !activeFacilityR.current && !showLibraryBookModalR.current && !showLabTerminalModalR.current && !isCinematicActive) {
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

            // Auto-transition into school when walking through open gate
            if (isGate && targetY <= 365 && targetX >= 490 && targetX <= 745) {
              setTimeout(() => {
                enterSchoolFromGate()
              }, 10)
              return { x: targetX, y: targetY }
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
    gameAudio.playDoorOpen()
    resetMovement()
    if (teacherTimerRef.current) clearTimeout(teacherTimerRef.current)
    setTeacherCutsceneStage(null)
    setInsideRoom(null)
    setCharPos(lastHallwayPosRef.current || { x: 650, y: 550 })
  }, [resetMovement])

  const enterClassroom = useCallback((room: QuizDoor) => {
    gameAudio.playDoorOpen()
    resetMovement()
    lastHallwayPosRef.current = { x: room.x, y: room.y + 20 }
    setInsideRoom(room)
    setCharPos(LEVEL1_MAPS[room.id]?.spawn || { x: 1050, y: 510 })

    if (savedClassesR.current.has(room.id)) return

    const mapConfig = LEVEL1_MAPS[room.id]
    if (teacherTimerRef.current) clearTimeout(teacherTimerRef.current)

    if (mapConfig?.teacher?.spriteUrl) {
      setTeacherCutsceneStage('anim_wait')
      const animDuration = (mapConfig.teacher.totalFrames || 24) * (mapConfig.teacher.speedMs || 90)
      teacherTimerRef.current = setTimeout(() => {
        setTeacherCutsceneStage('teacher_ask')
      }, animDuration)
    } else {
      // Auto-trigger teacher dialogue bubble 500ms after entering room (same auto-start experience as VII-A)
      teacherTimerRef.current = setTimeout(() => {
        setTeacherCutsceneStage('teacher_ask')
      }, 500)
    }
  }, [resetMovement])

  const handleClassCorrect = useCallback(() => {
    if (!activeClass) return
    const roomToEnter = activeClass
    setUnlocked(p => new Set([...p, roomToEnter.id]))
    setActiveClass(null)
    enterClassroom(roomToEnter)
  }, [activeClass, enterClassroom])

  const handleInteractTeacher = useCallback((room: QuizDoor) => {
    if (room.id === 'Perpustakaan') {
      const fac = FACILITY_DOORS.find(f => f.id === 'PERPUSTAKAAN')
      if (fac) setActiveFacility(fac)
      return
    }
    if (room.id === 'LabKomputer') {
      const fac = FACILITY_DOORS.find(f => f.id === 'LAB_KOMPUTER')
      if (fac) setActiveFacility(fac)
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
    }
  }, [])

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
        if (e.key === 'Escape') {
          e.preventDefault()
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

      if (showSatpamModalR.current) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setShowSatpamModal(false)
          resetMovement()
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
        setInsideRoom(null)
        resetMovement()
        setCharPos(lastHallwayPosRef.current || { x: 650, y: 550 })
        return
      }

      const keyNormalized = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (KEY_MAP[keyNormalized]) {
        e.preventDefault()
        pressedKeysRef.current.add(keyNormalized)
        updateDir()
      }

      // ── Gate Zone Entry or Satpam Interaction via Key ──
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && !insideRoomR.current && currentZoneR.current === 'gate') {
        const isNearSatpam = Math.hypot(charPosRef.current.x - 950, charPosRef.current.y - 480) < 85
        if (isNearSatpam) {
          e.preventDefault()
          gameAudio.playDoorOpen()
          setShowSatpamModal(true)
          resetMovement()
          return
        }
        const isNearGateOpening = charPosRef.current.y <= 425 && charPosRef.current.x >= 490 && charPosRef.current.x <= 745
        if (isNearGateOpening) {
          e.preventDefault()
          enterSchoolFromGate()
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
          const isRGUnlocked = collectedR.current.size >= TOTAL_N || savedClassesR.current.size >= 4
          if (isRGUnlocked) {
            enterClassroom(nearClassVal)
          } else {
            setRgLockedToast(`🔒 Ruang Guru Terkunci! Kumpulkan seluruh data dari 4 kelas terlebih dahulu (${collectedR.current.size}/${TOTAL_N}).`)
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
        const distToTeacher = Math.hypot(charPosRef.current.x - teacherX, charPosRef.current.y - teacherY)
        if (distToTeacher < 350 || teacherCutsceneStageRef.current) {
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
  }, [resetMovement, goToFacilityZone, goToMainZone, enterClassroom, enterFacilityRoom, handleInteractTeacher])

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

    setSavedClasses(prev => new Set([...prev, cid]))

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
        setRoomMilestoneText('DATA TERKUMPUL 24/24! 🎉 RUANG GURU TERBUKA!')
        setTimeout(() => {
          setMilestoneGlow(null)
          setRoomMilestoneText(null)
        }, 3000)
      } else {
        gameAudio.playItemCollect()
      }

      return next
    })

    setJustCompletedClassId(cid)
    setTimeout(() => {
      setJustCompletedClassId(null)
    }, 1500)

    // Cat Quest: Random Mother Cat Spawn upon exiting classroom after collecting data
    if (catQuestStageR.current === 'untriggered') {
      const classDoor = doors.find(d => d.id === cid) || showWaliKelasPopup
      const spawnX = classDoor.x + 35
      const spawnY = Math.min(620, Math.max(getRedLineY(spawnX) + 15, classDoor.y + 35))
      const randomSpot = KITTEN_SPAWN_SPOTS[Math.floor(Math.random() * KITTEN_SPAWN_SPOTS.length)]

      setMotherCatPos({ x: spawnX, y: spawnY, classLabel: classDoor.label })
      setKittenLocation(randomSpot)
      setCatQuestStage('cat_spawned')
      setTimeout(() => {
        gameAudio.playCatMeow()
      }, 500)
    }

    setShowWaliKelasPopup(null)
    handleExitClassroom()
  }, [showWaliKelasPopup, doors, handleExitClassroom])

  const n = collected.size
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

        {/* Floating Glassmorphism Game HUD Overlay inside Viewport */}
        <div style={{
          position: 'absolute',
          top: 'clamp(6px, 1.5vh, 12px)',
          left: 'clamp(95px, 12vw, 120px)',
          right: 'clamp(8px, 1.5vw, 14px)',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'clamp(4px, 1vw, 10px)',
          pointerEvents: 'none'
        }}>
          {/* Left: Quest Title & Data Counter Card */}
          <div style={{
            background: 'rgba(11, 30, 44, 0.94)',
            border: n >= TOTAL_N ? '1.5px solid #10B981' : '1.5px solid rgba(0, 173, 181, 0.35)',
            borderRadius: 12,
            padding: 'clamp(4px, 0.7vw, 6px) clamp(8px, 1vw, 12px)',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(6px, 1vw, 10px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.55)',
            pointerEvents: 'auto',
            willChange: 'transform'
          }}>
            <div style={{ fontSize: 'clamp(13px, 1.5vw, 15px)' }}>📜</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 0.8vw, 8px)' }}>
              <span style={{ fontSize: 'clamp(10.5px, 1.1vw, 12.5px)', fontWeight: 900, color: '#F8FAFC', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
                {n >= TOTAL_N ? 'Misi: Temui Pak Sutrisno di Ruang Guru!' : (cinematicStage === 'sanction_received' || demoMode) ? 'Misi: Kumpulkan Data' : 'Misi: Jumpai Pak Sutrisno'}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
              <span style={{ fontSize: 'clamp(9.5px, 1vw, 11.5px)', fontWeight: 800, color: n >= TOTAL_N ? '#10B981' : '#00ADB5', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                DATA: <span style={{ color: '#FFFFFF' }}>{n} / {TOTAL_N}</span>
              </span>
            </div>
          </div>

          {/* Right: Step Indicator & Debug Area Toggle Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowDebug(prev => !prev)}
              style={{
                background: showDebug ? 'rgba(16, 185, 129, 0.25)' : 'rgba(11, 30, 44, 0.94)',
                border: showDebug ? '1.5px solid #10b981' : '1.5px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 12,
                padding: 'clamp(4px, 0.7vw, 6px) clamp(8px, 1vw, 12px)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: showDebug ? '0 0 12px rgba(16, 185, 129, 0.4)' : '0 4px 16px rgba(0, 0, 0, 0.55)',
                pointerEvents: 'auto',
                cursor: 'pointer',
                color: showDebug ? '#10b981' : '#F8FAFC',
                fontWeight: 800,
                fontSize: 'clamp(9.5px, 1vw, 11.5px)',
                transition: 'all 0.2s',
                willChange: 'transform'
              }}
              title="Klik untuk tampilkan/sembunyikan area berjalan hijau"
            >
              <span>🟩</span>
              <span>{showDebug ? 'Area Hijau: ON' : 'Area Hijau: OFF'}</span>
            </button>

            <div style={{
              background: 'rgba(11, 30, 44, 0.94)',
              border: '1.5px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 12,
              padding: 'clamp(4px, 0.7vw, 6px) clamp(8px, 1.1vw, 14px)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.55)',
              pointerEvents: 'auto',
              willChange: 'transform'
            }}>
              <span style={{ fontSize: 'clamp(10px, 1vw, 11.5px)', color: '#00ADB5', fontWeight: 800 }}>📌</span>
              <span style={{ fontSize: 'clamp(9.5px, 1vw, 11.5px)', color: '#F8FAFC', fontWeight: 800, letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Langkah 1 dari 3</span>
            </div>

            {/* Zone Location Pill */}
            {!insideRoom && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (currentZone === 'gate') {
                    enterSchoolFromGate()
                  } else if (currentZone === 'main') {
                    goToFacilityZone()
                  } else {
                    goToMainZone()
                  }
                }}
                style={{
                  background: currentZone === 'gate' ? 'rgba(6, 78, 59, 0.94)' : currentZone === 'main' ? 'rgba(15, 35, 56, 0.94)' : 'rgba(30, 27, 75, 0.94)',
                  border: currentZone === 'gate' ? '1.5px solid rgba(16, 185, 129, 0.45)' : currentZone === 'main' ? '1.5px solid rgba(56, 189, 248, 0.45)' : '1.5px solid rgba(245, 158, 11, 0.45)',
                  borderRadius: 12,
                  padding: 'clamp(4px, 0.7vw, 6px) clamp(8px, 1.1vw, 14px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.55)',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  transition: 'all 0.2s'
                }}
                title="Klik untuk berpindah area sekolah"
              >
                <span style={{ fontSize: 'clamp(11px, 1.1vw, 13px)' }}>
                  {currentZone === 'gate' ? '🚪' : currentZone === 'main' ? '🏫' : '☕'}
                </span>
                <span style={{ fontSize: 'clamp(9.5px, 1vw, 11px)', color: currentZone === 'gate' ? '#34D399' : currentZone === 'main' ? '#38BDF8' : '#F59E0B', fontWeight: 900, whiteSpace: 'nowrap' }}>
                  {currentZone === 'gate' ? 'Zona 0: Depan Gerbang' : currentZone === 'main' ? 'Zona 1: Halaman Kelas' : 'Zona 2: Area Fasilitas'}
                </span>
                <span style={{ fontSize: '10px', color: '#94A3B8', marginLeft: 2 }}>⇄</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Floating Vertical RPG Quest Button (Right Side) */}
        <motion.button
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
              ? 'linear-gradient(180deg, rgba(6, 78, 59, 0.95) 0%, rgba(11, 30, 44, 0.95) 100%)' 
              : 'linear-gradient(180deg, rgba(15, 35, 56, 0.95) 0%, rgba(11, 30, 44, 0.96) 100%)',
            border: n >= TOTAL_N ? '2px solid #10B981' : '1.5px solid #00ADB5',
            borderRadius: 16,
            padding: 'clamp(6px, 1vw, 10px) clamp(4px, 0.8vw, 8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            width: 'clamp(48px, 5.2vw, 60px)',
            cursor: 'pointer',
            boxShadow: n >= TOTAL_N ? '0 6px 20px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.4)' : '0 6px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 173, 181, 0.3)',
            pointerEvents: 'auto',
            transition: 'all 0.2s',
          }}
        >
          {/* Icon Container with Floating Badge */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 'clamp(18px, 2.2vw, 24px)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>📜</span>
            {/* Counter Mini Badge */}
            <span style={{
              position: 'absolute',
              top: -6,
              right: -12,
              background: n >= TOTAL_N ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' : 'linear-gradient(135deg, #00ADB5 0%, #38BDF8 100%)',
              color: '#04070a',
              borderRadius: 10,
              padding: '1px 5px',
              fontSize: 'clamp(8px, 0.8vw, 9px)',
              fontWeight: 900,
              fontFamily: 'var(--font-data)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
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
            color: n >= TOTAL_N ? '#34D399' : '#F8FAFC',
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
              camX = Math.max(0, Math.min(WORLD_VW - viewVW, smoothCamPos.current.x - viewVW / 2))
              camY = Math.max(0, Math.min(WORLD_VH - viewVH, smoothCamPos.current.y - viewVH * 0.65))
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

                        {/* 3. Obstacle Collision: Bangku & Pot Tanaman Kiri */}
                        <rect x={120} y={510} width={160} height={100} fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth={1.5} />
                        <text x={200} y={560} textAnchor="middle" fill="#ef4444" fontSize={10} fontWeight="bold">⛔ TEMBOK BANGKU & POT</text>

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
                  const isCompleted = unlocked.has(insideRoom.id)
                  const bubbleY = teacherY - (teacherConfig?.spriteUrl ? 220 : 50)

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
                              rx={6}
                              fill="rgba(15, 23, 42, 0.92)"
                              stroke={isCompleted ? '#10B981' : insideRoom.color}
                              strokeWidth={2}
                              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }}
                            />
                            <polygon
                              points={`${teacherX - 7},${bubbleY - 10} ${teacherX + 7},${bubbleY - 10} ${teacherX},${bubbleY}`}
                              fill="rgba(15, 23, 42, 0.92)"
                              stroke={isCompleted ? '#10B981' : insideRoom.color}
                              strokeWidth={2}
                              strokeLinejoin="round"
                            />
                            <rect
                              x={teacherX - 8}
                              y={bubbleY - 12}
                              width={16}
                              height={4}
                              fill="rgba(15, 23, 42, 0.92)"
                            />
                            <text
                              x={teacherX}
                              y={bubbleY - 34}
                              textAnchor="middle"
                              fill="#FFFFFF"
                              fontSize={11}
                              fontWeight="800"
                              fontFamily="var(--font-ui)"
                              style={{ letterSpacing: '0.3px' }}
                            >
                              {(insideRoom.id === 'LabKomputer' ? '👨‍🏫 ' : '👩‍🏫 ') + teacherName}
                            </text>
                            <text
                              x={teacherX}
                              y={bubbleY - 19}
                              textAnchor="middle"
                              fill={isCompleted ? '#6EE7B7' : '#FCD34D'}
                              fontSize={9}
                              fontWeight="700"
                              fontFamily="var(--font-ui)"
                            >
                              {insideRoom.id === 'Perpustakaan' || insideRoom.id === 'LabKomputer'
                                ? '💬 Klik / Tekan E untuk Berdiskusi'
                                : isCompleted ? '✓ Data Screen Time Saved' : '💬 Klik / Tekan E untuk Bicara'}
                            </text>
                          </motion.g>
                        </g>
                      )}

                      {/* 2. Teacher Animation Waiting Stage ('anim_wait') */}
                      {teacherCutsceneStage === 'anim_wait' && (
                        <g>
                          <motion.g
                            initial={{ opacity: 0, scale: 0.9, y: 5 }}
                            animate={{ opacity: 1, scale: [1, 1.04, 1], y: 0 }}
                            transition={{ scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' } }}
                          >
                            <rect
                              x={teacherX - 110}
                              y={bubbleY - 48}
                              width={220}
                              height={40}
                              rx={10}
                              fill="rgba(15, 35, 56, 0.96)"
                              stroke="#F59E0B"
                              style={{ filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.7))' }}
                            />
                            <polygon
                              points={`${teacherX - 8},${bubbleY - 8} ${teacherX + 8},${bubbleY - 8} ${teacherX},${bubbleY + 2}`}
                              fill="rgba(15, 35, 56, 0.96)"
                              stroke="#F59E0B"
                              strokeWidth={1}
                            />
                            <text x={teacherX} y={bubbleY - 24} textAnchor="middle" fill="#FCD34D" fontSize={11} fontWeight="900" fontFamily="var(--font-ui)">
                              👩‍🏫 Bu Sari sedang menyapa...
                            </text>
                          </motion.g>
                        </g>
                      )}

                      {/* 3. Teacher Question Speech Bubble ('teacher_ask') */}
                      {teacherCutsceneStage === 'teacher_ask' && (() => {
                        const bW = 340
                        const bH = 82
                        const bX = teacherX - bW / 2
                        const bY = bubbleY - bH - 12
                        return (
                          <g style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); handleInteractTeacher(insideRoom); }}>
                            <foreignObject x={bX} y={bY} width={bW} height={bH} style={{ overflow: 'visible' }}>
                              <div style={{
                                width: '100%',
                                height: '100%',
                                boxSizing: 'border-box',
                                padding: '8px 14px 6px 14px',
                                background: 'rgba(15, 35, 56, 0.96)',
                                border: '2px solid #38BDF8',
                                borderRadius: '14px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.75)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                userSelect: 'none',
                              }}>
                                <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#38BDF8', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                  {teacherName}
                                </div>
                                <div style={{
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  color: '#FFFFFF',
                                  fontFamily: 'var(--font-ui)',
                                  textAlign: 'center',
                                  lineHeight: 1.35,
                                  margin: '2px 0',
                                }}>
                                  {insideRoom.id === 'RG' ? (
                                    <>
                                      <span style={{ color: '#10B981', fontWeight: 900 }}>"Stevunt! Bagaimana perkembangan tugasmu?"</span>
                                      <br />
                                      "Apakah 24 sampel data screen time dari 4 kelas sudah siap?"
                                    </>
                                  ) : insideRoom.id === 'A2' ? (
                                    <>
                                      <span style={{ color: '#FCD34D', fontWeight: 900 }}>"LOH?! {playerName.toUpperCase()}?! Kamu kan murid kelas ini!"</span>
                                      <br />
                                      "Kenapa jam pelajaran malah keluyuran di luar?!"
                                    </>
                                  ) : (
                                    `"Halo! Ada perlu apa kamu datang ke ${insideRoom.label}?"`
                                  )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                  <span style={{ fontSize: '9.5px', fontWeight: 900, color: '#38BDF8', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                    [ Klik / Tap ▶ ]
                                  </span>
                                </div>
                              </div>
                            </foreignObject>
                            <polygon
                              points={`${teacherX - 8},${bY + bH} ${teacherX + 8},${bY + bH} ${teacherX},${bubbleY + 2}`}
                              fill="rgba(15, 35, 56, 0.96)"
                              stroke="#38BDF8"
                              strokeWidth={1}
                            />
                          </g>
                        )
                      })()}

                      {/* 4. Player Explanation Speech Bubble ('player_explain') */}
                      {teacherCutsceneStage === 'player_explain' && (() => {
                        const pW = 350
                        const pH = 84
                        const pLeft = Math.max(20, Math.min(WORLD_VW - pW - 170, charPos.x - pW * 0.75))
                        const headTopY = charPos.y - 250 * 0.85
                        const pY = headTopY - pH - 15
                        const pointerX = Math.max(pLeft + 30, Math.min(pLeft + pW - 30, charPos.x))
                        const classStudentCount = currentClassStudents[insideRoom.id]?.students?.length || 0

                        return (
                          <g style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); handleInteractTeacher(insideRoom); }}>
                            <foreignObject x={pLeft} y={pY} width={pW} height={pH} style={{ overflow: 'visible' }}>
                              <div style={{
                                width: '100%',
                                height: '100%',
                                boxSizing: 'border-box',
                                padding: '8px 14px 6px 14px',
                                background: 'rgba(15, 35, 56, 0.96)',
                                border: '2px solid #38BDF8',
                                borderRadius: '14px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.75)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                userSelect: 'none',
                              }}>
                                <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#38BDF8', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                  Kamu
                                </div>
                                <div style={{
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  color: '#FFFFFF',
                                  fontFamily: 'var(--font-ui)',
                                  textAlign: 'center',
                                  lineHeight: 1.35,
                                  margin: '2px 0',
                                }}>
                                  {insideRoom.id === 'RG' ? (
                                    <>
                                      "Sudah lengkap, Pak Sutrisno! Seluruh 24 data sampel"
                                      <br />
                                      "screen time dari Kelas VII-A, VII-B, VIII-A, dan VIII-B sudah saya kumpulkan!"
                                    </>
                                  ) : insideRoom.id === 'A2' ? (
                                    <>
                                      "A-ampun Pak Bambang! Saya tadi kena sanksi Pak Sutrisno"
                                      <br />
                                      "untuk ngumpulin 24 data screen time sekolah, Pak!"
                                    </>
                                  ) : (
                                    <>
                                      "Saya sedang menjalankan tugas sanksi Pak Sutrisno untuk"
                                      <br />
                                      {`mengumpulkan sampel data ${classStudentCount} siswa di kelas ini!`}
                                    </>
                                  )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                  <span style={{ fontSize: '9.5px', fontWeight: 900, color: '#38BDF8', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                    [ Klik / Tap ▶ ]
                                  </span>
                                </div>
                              </div>
                            </foreignObject>
                            <polygon
                              points={`${pointerX - 10},${pY + pH} ${pointerX + 10},${pY + pH} ${Math.min(charPos.x, pointerX + 15)},${headTopY + 25}`}
                              fill="rgba(15, 35, 56, 0.96)"
                              stroke="#38BDF8"
                              strokeWidth={1}
                            />
                          </g>
                        )
                      })()}

                      {/* 5. Teacher Reply Speech Bubble ('teacher_reply') */}
                      {teacherCutsceneStage === 'teacher_reply' && (() => {
                        const bW = 340
                        const bH = 82
                        const bX = teacherX - bW / 2
                        const bY = bubbleY - bH - 12
                        const classStudentCount = CLASS_STUDENTS[insideRoom.id]?.students?.length || 0
                        return (
                          <g style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); handleInteractTeacher(insideRoom); }}>
                            <foreignObject x={bX} y={bY} width={bW} height={bH} style={{ overflow: 'visible' }}>
                              <div style={{
                                width: '100%',
                                height: '100%',
                                boxSizing: 'border-box',
                                padding: '8px 14px 6px 14px',
                                background: 'rgba(15, 35, 56, 0.96)',
                                border: '2px solid #10B981',
                                borderRadius: '14px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.75)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                userSelect: 'none',
                              }}>
                                <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                  {teacherName}
                                </div>
                                <div style={{
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  color: '#FFFFFF',
                                  fontFamily: 'var(--font-ui)',
                                  textAlign: 'center',
                                  lineHeight: 1.35,
                                  margin: '2px 0',
                                }}>
                                  {insideRoom.id === 'RG' ? (
                                    <>
                                      <span style={{ color: '#10B981', fontWeight: 900 }}>"Kerja luar biasa, Stevunt!"</span>
                                      <br />
                                      "Mari kita bawa data ini ke meja analisis untuk memeriksa klaim viral tersebut!"
                                    </>
                                  ) : insideRoom.id === 'A2' ? (
                                    <>
                                      "Oalah Sutrisno... Ya sudah, ini data 7 teman sekelasmu."
                                      <br />
                                      <span style={{ color: '#FCD34D' }}>"Pelajari dengan teliti untuk bahan analisismu nanti ya!"</span>
                                    </>
                                  ) : (
                                    <>
                                      "Oh begitu! Baiklah, ini sampel data"
                                      <br />
                                      {`screen time ${classStudentCount} siswa dari ${insideRoom.label}.`}
                                    </>
                                  )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                  <span style={{ fontSize: '9.5px', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                    {insideRoom.id === 'RG' ? '[ Buka Meja Analisis ▶ ]' : '[ Ambil Data ▶ ]'}
                                  </span>
                                </div>
                              </div>
                            </foreignObject>
                            <polygon
                              points={`${teacherX - 8},${bY + bH} ${teacherX + 8},${bY + bH} ${teacherX},${bubbleY + 2}`}
                              fill="rgba(15, 35, 56, 0.96)"
                              stroke="#10B981"
                              strokeWidth={1}
                            />
                          </g>
                        )
                      })()}
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
                          fill="rgba(15, 23, 42, 0.92)"
                          stroke={nearLibraryShelf ? '#FFFFFF' : '#10B981'}
                          strokeWidth={nearLibraryShelf ? 2 : 1}
                          style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))' }}
                        />
                        <text
                          x={280}
                          y={440 - 27}
                          textAnchor="middle"
                          fill="#FFFFFF"
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
                        <circle cx={300} cy={440} r={14} fill="#38BDF8" stroke="#FFFFFF" strokeWidth={1.5} />
                        <text x={300} y={444} textAnchor="middle" fontSize={11} style={{ userSelect: 'none', pointerEvents: 'none' }}>
                          💻
                        </text>
                        <rect
                          x={300 - 80}
                          y={440 - 42}
                          width={160}
                          height={22}
                          rx={6}
                          fill="rgba(15, 23, 42, 0.92)"
                          stroke={nearLabTerminal ? '#FFFFFF' : '#38BDF8'}
                          strokeWidth={nearLabTerminal ? 2 : 1}
                          style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))' }}
                        />
                        <text
                          x={300}
                          y={440 - 27}
                          textAnchor="middle"
                          fill="#FFFFFF"
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
                        {/* Interactive Pulse Radar Glow */}
                        <motion.circle
                          cx={fac.x}
                          cy={fac.y}
                          r={22}
                          fill={`${fac.color}22`}
                          animate={isNear
                            ? { scale: [1, 1.45, 1], fill: [`${fac.color}33`, `${fac.color}77`, `${fac.color}33`] }
                            : { scale: [0.95, 1.15, 0.95] }
                          }
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        />

                        {/* Hotspot Icon Badge */}
                        <circle
                          cx={fac.x}
                          cy={fac.y}
                          r={14}
                          fill="rgba(15, 23, 42, 0.92)"
                          stroke={isNear ? '#FFFFFF' : fac.color}
                          strokeWidth={isNear ? 2.5 : 1.5}
                          style={{ filter: `drop-shadow(0 0 8px ${fac.color}66)` }}
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
                          fill="rgba(15, 23, 42, 0.95)"
                          stroke={isNear ? '#FFFFFF' : `${fac.color}99`}
                          strokeWidth={isNear ? 1.5 : 1}
                          style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.7))' }}
                        />
                        <text
                          x={fac.x}
                          y={fac.y - 24}
                          textAnchor="middle"
                          fill={fac.color}
                          fontSize={10}
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
                  const isRGUnlocked = isRG && (collected.size >= TOTAL_N || savedClasses.size >= 4)
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
                            setRgLockedToast(`🔒 Ruang Guru Terkunci! Kumpulkan seluruh data dari 4 kelas terlebih dahulu (${collected.size}/${TOTAL_N}).`)
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
                        fill={isRG ? (isRGUnlocked ? '#10B981' : '#B45309') : isSaved ? '#10b981' : open ? '#00ADB5' : 'rgba(15, 23, 42, 0.88)'}
                        stroke={near ? '#FFFFFF' : isRG ? (isRGUnlocked ? '#10B981' : '#F59E0B') : isSaved ? '#10b981' : door.color}
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
                        fill="rgba(15, 23, 42, 0.9)"
                        stroke={near ? '#FFFFFF' : isRG ? (isRGUnlocked ? '#10B981' : '#F59E0B88') : isSaved ? '#10b981' : open ? '#00ADB5' : `${door.color}88`}
                        strokeWidth={near ? 1.5 : 1}
                      />
                      <text
                        x={door.x}
                        y={door.y - 23}
                        textAnchor="middle"
                        fill={isRG ? (isRGUnlocked ? '#10B981' : '#F59E0B') : isSaved ? '#10b981' : '#FFFFFF'}
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
                {!insideRoom && currentZone !== 'gate' && (
                  <g
                    key={`gateway-${currentZone}`}
                    style={{ cursor: 'pointer' }}
                    onClick={currentZone === 'main' ? goToFacilityZone : goToMainZone}
                  >
                    {/* Ground pulsing elliptical carpet */}
                    <motion.ellipse
                      cx={625}
                      cy={628}
                      rx={125}
                      ry={16}
                      fill={currentZone === 'main' ? 'rgba(56, 189, 248, 0.16)' : 'rgba(16, 185, 129, 0.16)'}
                      stroke={currentZone === 'main' ? '#38BDF8' : '#10B981'}
                      strokeWidth={1.5}
                      strokeDasharray="6,4"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <rect
                      x={625 - 145}
                      y={608}
                      width={290}
                      height={26}
                      rx={13}
                      fill="rgba(11, 23, 38, 0.94)"
                      stroke={currentZone === 'main' ? '#38BDF8' : '#10B981'}
                      strokeWidth={1.5}
                      style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.75))' }}
                    />
                    <text
                      x={625}
                      y={624}
                      textAnchor="middle"
                      fill={currentZone === 'main' ? '#38BDF8' : '#10B981'}
                      fontSize={10}
                      fontWeight="900"
                      fontFamily="var(--font-ui)"
                      style={{ userSelect: 'none', pointerEvents: 'none', letterSpacing: '0.4px' }}
                    >
                      {currentZone === 'main' ? '🚶‍♂️ ▼ KE AREA FASILITAS (Kantin, Lab, Perpus)' : '🚶‍♂️ ▲ KE HALAMAN UTAMA (Kelas & Ruang Guru)'}
                    </text>
                  </g>
                )}

                {/* Gate Entry Gateway Marker & Pos Satpam Hotspot (When in Gate Zone) */}
                {!insideRoom && currentZone === 'gate' && (
                  <>
                    <g
                      key="gateway-gate"
                      style={{ cursor: 'pointer' }}
                      onClick={enterSchoolFromGate}
                    >
                      <motion.ellipse
                        cx={617}
                        cy={370}
                        rx={85}
                        ry={16}
                        fill="rgba(16, 185, 129, 0.2)"
                        stroke="#10B981"
                        strokeWidth={1.5}
                        strokeDasharray="6,4"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <rect
                        x={617 - 120}
                        y={370 - 32}
                        width={240}
                        height={24}
                        rx={12}
                        fill="rgba(11, 23, 38, 0.94)"
                        stroke="#10B981"
                        strokeWidth={1.5}
                        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.75))' }}
                      />
                      <text
                        x={617}
                        y={370 - 16}
                        textAnchor="middle"
                        fill="#34D399"
                        fontSize={10}
                        fontWeight="900"
                        fontFamily="var(--font-ui)"
                        style={{ userSelect: 'none', pointerEvents: 'none', letterSpacing: '0.4px' }}
                      >
                        ▲ MASUK PINTU GERBANG SEKOLAH
                      </text>
                    </g>

                    <g
                      key="pos-satpam-hotspot"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        gameAudio.playDoorOpen()
                        setShowSatpamModal(true)
                      }}
                    >
                      <rect
                        x={890}
                        y={435}
                        width={125}
                        height={22}
                        rx={11}
                        fill="rgba(15, 23, 42, 0.92)"
                        stroke="#F59E0B"
                        strokeWidth={1.5}
                        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }}
                      />
                      <text
                        x={952}
                        y={450}
                        textAnchor="middle"
                        fill="#FCD34D"
                        fontSize={9.5}
                        fontWeight="900"
                        fontFamily="var(--font-ui)"
                      >
                        👮 Pos Satpam (Pak Joko)
                      </text>
                    </g>
                  </>
                )}

                {/* Dynamic Perspective Depth Scaling Calculation */}
                {(() => {
                  const depthRatio = Math.max(0, Math.min(1, (charPos.y - 410) / (650 - 410)))
                  // Proper proportioned character size when inside classroom (2x size inside room)
                  const baseCharSize = insideRoom ? (170 + depthRatio * 60) * 2 : 145 + depthRatio * 65
                  const charSize = baseCharSize
                  const btnY = charPos.y - charSize * 0.95
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
                          const bubbleW = isSanctionStage ? 340 : 270
                          const bubbleH = isSanctionStage ? 82 : 66
                          const bubbleLeft = pakX - bubbleW / 2
                          const bubbleTop = pakY - bubbleH - 122

                          return (
                            <g
                              key="pak-shout-bubble"
                              style={{ cursor: 'pointer' }}
                              onClick={handleTalkToPak}
                            >
                              <foreignObject x={bubbleLeft} y={bubbleTop} width={bubbleW} height={bubbleH} style={{ overflow: 'visible' }}>
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  boxSizing: 'border-box',
                                  padding: '8px 14px 6px 14px',
                                  background: 'rgba(15, 35, 56, 0.96)',
                                  border: '2px solid #38BDF8',
                                  borderRadius: '14px',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  userSelect: 'none',
                                }}>
                                  <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#38BDF8', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                    Pak Sutrisno
                                  </div>
                                  <div style={{
                                    fontSize: '10.5px',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                    margin: '2px 0',
                                  }}>
                                    {cinematicStage === 'pak_shouting' && '"Hey kamu! Baru jam segini sampai sekolah?!"'}
                                    {cinematicStage === 'pak_shouting_2' && '"Kamu kesini!"'}
                                    {cinematicStage === 'pak_sanction_1' && (
                                      <>
                                        "Kamu terlambat lagi! Bel sekolah sudah lama berbunyi
                                        <br />
                                        dan kamu baru saja melangkah di lapangan ini."
                                      </>
                                    )}
                                    {cinematicStage === 'pak_sanction_2' && (
                                      <>
                                        "Sebagai sanksi kedisiplinan, kamu <span style={{ color: '#EF4444', fontWeight: 900 }}>TIDAK BOLEH</span>"
                                        <br />
                                        "masuk kelas sebelum menyelesaikan tugas ini!"
                                      </>
                                    )}
                                    {cinematicStage === 'pak_sanction_3' && (
                                      <>
                                        "Kelilingi lorong sekolah dan kumpulkan <span style={{ color: '#38BDF8', fontWeight: 900 }}>24 sampel data</span>"
                                        <br />
                                        "screen time dari 4 kelas (VII-A, VII-B, VIII-A, VIII-B)!"
                                      </>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9.5px', fontWeight: 900, color: '#38BDF8', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                      [ Klik / Tap ▶ ]
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                              <polygon
                                points={`${pakX - 8},${bubbleTop + bubbleH} ${pakX + 8},${bubbleTop + bubbleH} ${pakX},${pakY - 110}`}
                                fill="rgba(15, 35, 56, 0.96)"
                                stroke="#38BDF8"
                                strokeWidth={1}
                              />
                            </g>
                          )
                        })()

                        {/* Player Opening Monologue Speech Bubble */}
                        const renderPlayerIntroBubble = cinematicStage === 'player_intro' && (() => {
                          const pW = 250
                          const pH = 66
                          const pLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - pW - 10, charPos.x - pW / 2))
                          const pY = btnY - pH - 10
                          return (
                            <g
                              key="player-intro-bubble"
                              style={{ cursor: 'pointer' }}
                              onClick={handleTalkToPak}
                            >
                              <foreignObject x={pLeft} y={pY} width={pW} height={pH} style={{ overflow: 'visible' }}>
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  boxSizing: 'border-box',
                                  padding: '8px 12px 6px 12px',
                                  background: 'rgba(15, 35, 56, 0.96)',
                                  border: '2px solid #38BDF8',
                                  borderRadius: '14px',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  userSelect: 'none',
                                }}>
                                  <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#38BDF8', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                    Kamu
                                  </div>
                                  <div style={{
                                    fontSize: '10.5px',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                  }}>
                                    "Duh... aku terlambat lagi ke sekolah!"
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#38BDF8', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                      [ Klik / Tap ▶ ]
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                              <polygon
                                points={`${charPos.x - 8},${pY + pH} ${charPos.x + 8},${pY + pH} ${charPos.x},${btnY + 22}`}
                                fill="rgba(15, 35, 56, 0.96)"
                                stroke="#38BDF8"
                                strokeWidth={1}
                              />
                            </g>
                          )
                        })()

                        {/* Player Reply Speech Bubble */}
                        const renderPlayerReplyBubble = cinematicStage === 'player_reply_pak' && (() => {
                          const pW = 270
                          const pH = 66
                          const pLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - pW - 10, charPos.x - pW / 2))
                          const pY = btnY - pH - 10
                          return (
                            <g
                              key="player-reply-bubble"
                              style={{ cursor: 'pointer' }}
                              onClick={handleTalkToPak}
                            >
                              <foreignObject x={pLeft} y={pY} width={pW} height={pH} style={{ overflow: 'visible' }}>
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  boxSizing: 'border-box',
                                  padding: '8px 12px 6px 12px',
                                  background: 'rgba(15, 35, 56, 0.96)',
                                  border: '2px solid #10B981',
                                  borderRadius: '14px',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  userSelect: 'none',
                                }}>
                                  <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                    Kamu
                                  </div>
                                  <div style={{
                                    fontSize: '10.5px',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                  }}>
                                    "Baik Pak Sutrisno! Saya akan kumpulkan 24 data screen time sekarang!"
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                      [ 📝 Mulai Investigasi ▶ ]
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                              <polygon
                                points={`${charPos.x - 8},${pY + pH} ${charPos.x + 8},${pY + pH} ${charPos.x},${btnY + 22}`}
                                fill="rgba(15, 35, 56, 0.96)"
                                stroke="#10B981"
                                strokeWidth={1}
                              />
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
                              fill="rgba(15, 23, 42, 0.95)"
                              stroke="#38BDF8"
                              strokeWidth={2}
                              style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.6))' }}
                            />
                            <text
                              x={textX}
                              y={btnTextY}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="#ffffff"
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
                            fill="#10B981"
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
                            fill="rgba(15, 23, 42, 0.95)"
                            stroke="#10B981"
                            strokeWidth={1.5}
                          />
                          <text
                            x={625}
                            y={254}
                            textAnchor="middle"
                            fill="#10B981"
                            fontSize={9.5}
                            fontWeight="900"
                            fontFamily="var(--font-ui)"
                          >
                            ✨ Temui Pak Sutrisno di Ruang Guru!
                          </text>
                        </g>
                      )}

                      {/* ── Cat Quest: Mother Cat (Mimi) in Main Hallway ── */}
                      {!insideRoom && currentZone === 'main' && catQuestStage !== 'untriggered' && (
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
                              fill="rgba(15, 23, 42, 0.92)"
                              stroke={catQuestStage === 'completed' ? '#10B981' : '#F59E0B'}
                              strokeWidth={1.5}
                              style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }}
                            />
                            <text
                              x={motherCatPos.x}
                              y={motherCatPos.y - 34}
                              textAnchor="middle"
                              fill="#FFFFFF"
                              fontSize={9.5}
                              fontWeight="900"
                              fontFamily="var(--font-ui)"
                            >
                              {catQuestStage === 'completed' ? '🐾 Mimi & Mochi' : '🐱 Mimi'}
                            </text>
                          </g>
                        </g>
                      )}

                      {/* ── Cat Quest: Kitten in Box (Mochi) in Spawn Spot ── */}
                      {catQuestStage === 'quest_active' && (() => {
                        const isKittenVisible =
                          (kittenLocation.zone === 'Perpustakaan' && insideRoom?.id === 'Perpustakaan') ||
                          (kittenLocation.zone === 'LabKomputer' && insideRoom?.id === 'LabKomputer') ||
                          (kittenLocation.zone === 'facility_courtyard' && currentZone === 'facility' && !insideRoom) ||
                          (kittenLocation.zone === 'hallway' && currentZone === 'main' && !insideRoom)

                        if (!isKittenVisible) return null
                        return (
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
                                fill="rgba(15, 23, 42, 0.94)"
                                stroke="#10B981"
                                strokeWidth={1.5}
                                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={kittenLocation.x}
                                y={kittenLocation.y - 39}
                                textAnchor="middle"
                                fill="#34D399"
                                fontSize={9.5}
                                fontWeight="900"
                                fontFamily="var(--font-ui)"
                              >
                                📦 Mochi (Kucing dlm Kardus)
                              </text>
                            </motion.g>
                          </g>
                        )
                      })()}

                      {/* Player Character */}
                      <PlayerCharacter
                        x={charPos.x}
                        y={charPos.y}
                        dir={moveDir}
                        size={charSize}
                      />

                      {/* Floating Interactive Prompt Buttons */}
                      <AnimatePresence>
                        {/* 0A. Gate Player Monologue Speech Bubble */}
                        {currentZone === 'gate' && cinematicStage === 'gate_intro' && gateBubbleStep < 2 && (() => {
                          const pW = 270
                          const pH = 68
                          const pLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - pW - 10, charPos.x - pW / 2))
                          const pY = btnY - pH - 8
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
                              <foreignObject x={pLeft} y={pY} width={pW} height={pH} style={{ overflow: 'visible' }}>
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  boxSizing: 'border-box',
                                  padding: '8px 12px 6px 12px',
                                  background: 'rgba(15, 35, 56, 0.96)',
                                  border: '2px solid #38BDF8',
                                  borderRadius: '14px',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  userSelect: 'none',
                                }}>
                                  <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#38BDF8', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                    Stevunt
                                  </div>
                                  <div style={{
                                    fontSize: '10.5px',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    fontFamily: 'var(--font-ui)',
                                    textAlign: 'center',
                                    lineHeight: 1.35,
                                  }}>
                                    {bubbleText}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#38BDF8', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
                                      {gateBubbleStep === 0 ? '[ Klik / Spasi ▶ ]' : '[ 🏃 Ayo Masuk! ▶ ]'}
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                              <polygon
                                points={`${charPos.x - 8},${pY + pH} ${charPos.x + 8},${pY + pH} ${charPos.x},${btnY + 22}`}
                                fill="rgba(15, 35, 56, 0.96)"
                                stroke="#38BDF8"
                                strokeWidth={1}
                              />
                            </motion.g>
                          )
                        })()}

                        {/* 0B. Gate Action / Interaction Prompt Button */}
                        {currentZone === 'gate' && !insideRoom && (() => {
                          const isNearSatpam = Math.hypot(charPos.x - 950, charPos.y - 480) < 95
                          const isNearGateOpening = charPos.y <= 435 && charPos.x >= 490 && charPos.x <= 745

                          const buttonW = isNearSatpam ? 220 : 230
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2

                          const handleClick = () => {
                            if (isNearSatpam) {
                              gameAudio.playDoorOpen()
                              setShowSatpamModal(true)
                            } else {
                              enterSchoolFromGate()
                            }
                          }

                          return (
                            <motion.g
                              key={`btn-gate-${isNearSatpam ? 'satpam' : isNearGateOpening ? 'gate-enter' : 'gate-walk'}`}
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={handleClick}
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
                                fill="#0B1726"
                                stroke={isNearSatpam ? '#F59E0B' : '#10B981'}
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.85))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={isNearSatpam ? '#FCD34D' : '#34D399'}
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                {isNearSatpam
                                  ? '[ E ] 👮 Bicara dgn Pak Joko (Satpam)'
                                  : isNearGateOpening
                                  ? '[ E ] 🏫 Masuk ke Halaman Sekolah ▲'
                                  : '[ W / ⬆ ] Masuk Lewat Pintu Gerbang'}
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
                                  <rect x={buttonLeft - 10} y={btnY} width={buttonW + 20} height={28} rx={6} fill="#0B1726" stroke="#10B981" strokeWidth={2} style={{ filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.85))' }} />
                                  <text x={textX} y={btnTextY + 2} textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize={10.5} fontWeight="900" style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}>
                                    [ E ] 📖 Baca Buku Statistika
                                  </text>
                                </motion.g>
                              )
                            }
                            const distToTeacher = Math.hypot(charPos.x - 617, charPos.y - 415)
                            if (distToTeacher < 160 && !activeFacility) {
                              const buttonW = 210
                              const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                              const textX = buttonLeft + buttonW / 2
                              return (
                                <motion.g
                                  key="btn-teacher-widya"
                                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, y: 5 }}
                                  onClick={() => {
                                    const fac = FACILITY_DOORS.find(f => f.id === 'PERPUSTAKAAN')
                                    if (fac) setActiveFacility(fac)
                                  }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <rect x={buttonLeft - 10} y={btnY} width={buttonW + 20} height={28} rx={6} fill="#0B1726" stroke="#10B981" strokeWidth={2} style={{ filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.85))' }} />
                                  <text x={textX} y={btnTextY + 2} textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize={10.5} fontWeight="900" style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}>
                                    [ E ] 💬 Diskusi dgn Bu Widya
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
                                  <rect x={buttonLeft - 10} y={btnY} width={buttonW + 20} height={28} rx={6} fill="#0B1726" stroke="#38BDF8" strokeWidth={2} style={{ filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.85))' }} />
                                  <text x={textX} y={btnTextY + 2} textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize={10.5} fontWeight="900" style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}>
                                    [ E ] 💻 Buka Terminal Digital
                                  </text>
                                </motion.g>
                              )
                            }
                            const distToTeacher = Math.hypot(charPos.x - 617, charPos.y - 415)
                            if (distToTeacher < 160 && !activeFacility) {
                              const buttonW = 210
                              const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                              const textX = buttonLeft + buttonW / 2
                              return (
                                <motion.g
                                  key="btn-teacher-hendra"
                                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, y: 5 }}
                                  onClick={() => {
                                    const fac = FACILITY_DOORS.find(f => f.id === 'LAB_KOMPUTER')
                                    if (fac) setActiveFacility(fac)
                                  }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <rect x={buttonLeft - 10} y={btnY} width={buttonW + 20} height={28} rx={6} fill="#0B1726" stroke="#38BDF8" strokeWidth={2} style={{ filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.85))' }} />
                                  <text x={textX} y={btnTextY + 2} textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize={10.5} fontWeight="900" style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}>
                                    [ E ] 💬 Diskusi dgn Pak Hendra
                                  </text>
                                </motion.g>
                              )
                            }
                            return null
                          }

                          const teacherX = 580
                          const teacherY = 490
                          const distToTeacher = Math.hypot(charPos.x - teacherX, charPos.y - teacherY)
                          if (distToTeacher >= 150 || showWaliKelasPopup) return null

                          const buttonW = 170
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2

                          return (
                            <motion.g
                              key={`btn-talk-${insideRoom.id}`}
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={() => setShowWaliKelasPopup(insideRoom)}
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
                                fill="rgba(15, 23, 42, 0.95)"
                                stroke={insideRoom.color}
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#ffffff"
                                fontSize={10.5}
                                fontWeight="bold"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)' }}
                              >
                                🗣️ Bicara & Minta Data
                              </text>
                            </motion.g>
                          )
                        })()}

                        {/* 2. Hallway Door Interaction Prompt (Locked door -> Kuis; Unlocked door -> Masuk Kelas; Saved -> Completed) */}
                        {!insideRoom && currentZone === 'main' && nearClass && !activeClass && !nearDoor && (cinematicStage === 'sanction_received' || demoMode) && (() => {
                          const isRG = nearClass.id === 'RG'
                          const isRGUnlocked = isRG && (collected.size >= TOTAL_N || savedClasses.size >= 4)
                          const isSaved = !isRG && savedClasses.has(nearClass.id)
                          const isUnlocked = isRG ? isRGUnlocked : unlocked.has(nearClass.id)
                          const buttonW = isRG ? (isRGUnlocked ? 220 : 210) : isSaved ? 180 : 160
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
                                    setRgLockedToast(`🔒 Ruang Guru Terkunci! Kumpulkan seluruh data dari 4 kelas terlebih dahulu (${Math.max(collected.size, savedClasses.size * 6)}/${TOTAL_N}).`)
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
                                fill="#0B1726"
                                stroke={isRG ? (isRGUnlocked ? '#10B981' : '#F59E0B') : isSaved ? '#10B981' : '#38BDF8'}
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.85))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={isRG ? (isRGUnlocked ? '#10B981' : '#F59E0B') : isSaved ? '#10B981' : '#FFFFFF'}
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                {isRG
                                  ? isRGUnlocked
                                    ? `[ E ] ✨ Masuk ke Ruang Guru ►`
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
                                fill="#0B1726"
                                stroke={nearFacility.color}
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.85))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#FFFFFF"
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
                                fill="#0B1726"
                                stroke={isToFacility ? '#38BDF8' : '#10B981'}
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.85))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={isToFacility ? '#38BDF8' : '#10B981'}
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
                                fill="#0B1726"
                                stroke={catQuestStage === 'completed' || catQuestStage === 'kitten_rescued' ? '#10B981' : '#F59E0B'}
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.85))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#FFFFFF"
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
                                fill="#0B1726"
                                stroke="#10B981"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.85))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#34D399"
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                📦 [ E ] Buka Kardus & Selamatkan Mochi!
                              </text>
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

          {/* Joystick */}
          <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 50, touchAction: 'none' }}>
            <Joystick onDir={(x, y) => { const nextDir = { x, y }; dirRef.current = nextDir; setMoveDir(nextDir); }} />
          </div>
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
              onComplete()
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
            onClose={() => setShowWaliKelasPopup(null)}
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
              setCatQuestStage('quest_active')
            }}
            onClose={() => {
              if (catQuestStage === 'kitten_rescued') {
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

      {/* Satpam (Pak Joko) Dialogue Modal */}
      <AnimatePresence>
        {showSatpamModal && (
          <SatpamModal
            onEnterSchool={enterSchoolFromGate}
            onClose={() => setShowSatpamModal(false)}
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
                maxWidth: 360,
                width: '100%',
                background: 'rgba(4, 7, 10, 0.9)',
                border: '2px solid #00ADB5',
                boxShadow: '0 0 25px rgba(0, 173, 181, 0.5)',
                borderRadius: 20,
                padding: '24px 20px',
                textAlign: 'center'
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontSize: '20px', fontWeight: 900, color: '#00ADB5', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: 8 }}
              >
                {roomMilestoneText}
              </motion.div>
              <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
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
                background: 'rgba(15, 23, 42, 0.96)',
                border: '1.5px solid #F59E0B',
                boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)',
                borderRadius: 14,
                padding: '10px 18px',
                color: '#FFFFFF',
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
              background: 'rgba(4, 7, 10, 0.75)',
              backdropFilter: 'blur(8px)',
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
                background: 'rgba(15, 35, 56, 0.98)',
                borderLeft: '2px solid #00ADB5',
                boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 173, 181, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 20px',
                gap: 16,
                overflowY: 'auto'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: '#00ADB5', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    📜 QUEST LOG • LEVEL 1
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span>📜</span> Misi Investigasi
                  </h3>
                </div>
                <button
                  id="quest-log-close-btn"
                  onClick={() => setIsInventoryOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#94A3B8',
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

                let badgeColor = '#38BDF8'
                let badgeText = '📍 MISI UTAMA'
                let questTitle = 'Jumpai Pak Sutrisno'
                let questDesc = 'Kamu datang terlambat ke sekolah! Cari dan bicara dengan Pak Sutrisno di depan Ruang Guru Lorong Utama untuk melapor.'

                if (isAllCollected) {
                  badgeColor = '#10B981'
                  badgeText = '⚡ SELESAI — SIAP DILAPORKAN'
                  questTitle = 'Laporkan 24 Data ke Pak Sutrisno di Ruang Guru'
                  questDesc = 'Semua 24 sampel data screen time siswa telah berhasil terkumpul dari 4 kelas! Masuklah ke Ruang Guru di Gedung Tengah untuk menyerahkan data kepada Pak Sutrisno.'
                } else if (isTaskGiven) {
                  badgeColor = '#00ADB5'
                  badgeText = '🟢 SEDANG BERLANGSUNG'
                  questTitle = 'Kumpulkan 24 Data Screen Time Siswa'
                  questDesc = 'Kunjungi Wali-Wali Kelas di Ruang VII-A, VII-B, VIII-A, dan VIII-B. Bicara dengan guru di setiap kelas untuk mengumpulkan sampel data screen time.'
                } else if (cinematicStage === 'gate_intro') {
                  badgeColor = '#F59E0B'
                  badgeText = '🏃 MASUK GERBANG'
                  questTitle = 'Waduh, Telat Masuk Sekolah!'
                  questDesc = 'Bel sekolah sudah berbunyi! Segera lari masuk melewati pintu gerbang sekolah sebelum dikunci oleh Pak Joko (Satpam).'
                }

                return (
                  <div style={{
                    background: `linear-gradient(135deg, ${badgeColor}18 0%, rgba(15, 23, 42, 0.6) 100%)`,
                    border: `1.5px solid ${badgeColor}55`,
                    borderRadius: 16,
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    boxShadow: `0 4px 20px rgba(0,0,0,0.3)`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 900,
                        color: badgeColor,
                        background: `${badgeColor}22`,
                        border: `1px solid ${badgeColor}44`,
                        borderRadius: 20,
                        padding: '3px 10px',
                        letterSpacing: '0.8px'
                      }}>
                        {badgeText}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8' }}>
                        Target: 24 Sampel Data
                      </span>
                    </div>

                    <div>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#FFFFFF' }}>
                        {questTitle}
                      </h4>
                      <p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>
                        {questDesc}
                      </p>
                    </div>

                    {/* Progress Bar Component */}
                    <div style={{ marginTop: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#CBD5E1' }}>Progress Pengumpulkan Data</span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: badgeColor, fontFamily: 'var(--font-data)' }}>
                          {n} / {TOTAL_N} Siswa ({Math.round((n / TOTAL_N) * 100)}%)
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: 14,
                        background: 'rgba(0, 0, 0, 0.4)',
                        borderRadius: 10,
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: 2
                      }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (n / TOTAL_N) * 100)}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          style={{
                            height: '100%',
                            background: isAllCollected
                              ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                              : 'linear-gradient(90deg, #00ADB5 0%, #38BDF8 100%)',
                            borderRadius: 8,
                            boxShadow: `0 0 10px ${badgeColor}88`
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
                  background: catQuestStage === 'completed'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.6) 100%)'
                    : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.6) 100%)',
                  border: catQuestStage === 'completed'
                    ? '1.5px solid rgba(16, 185, 129, 0.5)'
                    : '1.5px solid rgba(245, 158, 11, 0.5)',
                  borderRadius: 16,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 900,
                      color: catQuestStage === 'completed' ? '#34D399' : '#FCD34D',
                      background: catQuestStage === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      border: catQuestStage === 'completed' ? '1px solid #10B981' : '1px solid #F59E0B',
                      borderRadius: 20,
                      padding: '2px 8px',
                      letterSpacing: '0.6px',
                    }}>
                      {catQuestStage === 'completed' ? '🎉 MISI SELESAI' : '🐾 MISI SAMPINGAN'}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>
                      Depan {motherCatPos.classLabel}
                    </span>
                  </div>

                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#FFFFFF' }}>
                      {catQuestStage === 'cat_spawned' && '🐱 Kucing Mimi Mengeong Memanggilmu'}
                      {catQuestStage === 'quest_active' && '📦 Cari Anak Kucing Mochi di Dalam Kardus'}
                      {catQuestStage === 'kitten_rescued' && '❤️ Bawa Pulang Mochi ke Induknya (Mimi)'}
                      {catQuestStage === 'completed' && '🏅 Sahabat Kucing SMP (Tuntas)'}
                    </h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#CBD5E1', lineHeight: 1.5 }}>
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
                <div style={{ marginTop: 8, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 14 }}>
                  <button
                    onClick={() => setShowStudentDetails(prev => !prev)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: showStudentDetails ? 'rgba(0, 173, 181, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(0, 173, 181, 0.3)',
                      color: '#00ADB5',
                      fontSize: 11.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s'
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
                          { id: 'A1', label: 'VII-A', color: '#818cf8' },
                          { id: 'A2', label: 'VII-B', color: '#6366f1' },
                          { id: 'B1', label: 'VIII-A', color: '#00ADB5' },
                          { id: 'B2', label: 'VIII-B', color: '#0e8388' },
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
                                border: active ? `1.5px solid ${tab.color || '#00ADB5'}` : '1px solid rgba(255,255,255,0.1)',
                                background: active ? (tab.color ? `${tab.color}33` : 'rgba(0, 173, 181, 0.25)') : 'rgba(255,255,255,0.04)',
                                color: active ? (tab.color || '#00ADB5') : '#94A3B8',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
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
                            const themeColor = doorMeta?.color || '#00ADB5'
                            return (
                              <div
                                key={`${st.classId}-${st.name}-${idx}`}
                                style={{
                                  background: 'rgba(11, 30, 44, 0.6)',
                                  border: `1px solid ${themeColor}44`,
                                  borderRadius: 10,
                                  padding: '8px 10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                }}
                              >
                                <div style={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: '50%',
                                  background: `${themeColor}22`,
                                  border: `1px solid ${themeColor}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 12,
                                  flexShrink: 0
                                }}>
                                  👤
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ fontSize: 11, fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {st.name}
                                  </div>
                                  <div style={{ fontSize: 9.5, color: themeColor, fontWeight: 700, marginTop: 1 }}>
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
