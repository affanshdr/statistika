'use client'

import React from 'react'
import { motion } from 'framer-motion'

export interface PakSanctionModalProps {
  onAccept: () => void
}

export default function PakSanctionModal({ onAccept }: PakSanctionModalProps) {
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
          SAYA SIAP TERIMA SANKSI & INVESTIGASI DATA ➔
        </button>
      </motion.div>
    </div>
  )
}
