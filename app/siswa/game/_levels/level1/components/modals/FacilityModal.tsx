'use client'

import React from 'react'
import { motion } from 'framer-motion'

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

export function FacilityModal({ facility, onClose }: { facility: FacilityDoor; onClose: () => void }) {
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
            Lanjut Eksplorasi ➔
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export function LibraryBookModal({ onClose }: { onClose: () => void }) {
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
            Jumlah semua nilai data dibagi banyak sampel (∑x ÷ n). Mean sangat <em>sensitif</em> terhadap nilai ekstrem (outlier).
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
            Tutup Buku ➔
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export function LabTerminalModal({ onClose }: { onClose: () => void }) {
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
            Tutup Terminal ➔
          </button>
        </div>
      </motion.div>
    </div>
  )
}
