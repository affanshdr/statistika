'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { gameAudio } from '@/lib/utils/gameAudio'

export interface MotherCatModalProps {
  stage: 'ask_help' | 'reminder' | 'reward'
  classLabel?: string
  onAccept?: () => void
  onClose: () => void
}

export function MotherCatModal({
  stage,
  classLabel = 'kelas',
  onAccept,
  onClose
}: MotherCatModalProps) {
  const isReward = stage === 'reward'
  const isAsk = stage === 'ask_help'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 12, 24, 0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'linear-gradient(145deg, #0e1e32 0%, #091322 100%)',
          border: isReward ? '2px solid #10B981' : '2px solid #F59E0B',
          borderRadius: 20,
          boxShadow: isReward
            ? '0 16px 40px rgba(16, 185, 129, 0.35), 0 0 25px rgba(16, 185, 129, 0.2)'
            : '0 16px 40px rgba(245, 158, 11, 0.35), 0 0 25px rgba(245, 158, 11, 0.2)',
          padding: '24px 22px',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          position: 'relative',
        }}
      >
        {/* Header with Cat Avatar & Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Animated Cat Avatar Box */}
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: isReward ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              border: isReward ? '1.5px solid #10B981' : '1.5px solid #F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                backgroundImage: isReward ? "url('/Assets/CatPack/Box3.png')" : "url('/Assets/CatPack/Idle.png')",
                backgroundRepeat: 'no-repeat',
                backgroundSize: isReward ? '128px 32px' : '320px 32px',
                imageRendering: 'pixelated',
                transform: 'scale(1.5)',
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: isReward ? '#10B981' : '#F59E0B',
                  color: '#091322',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                }}
              >
                {isReward ? 'Misi Selesai 🎉' : 'Misi Rahasia 🐾'}
              </span>
              <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
                Depan {classLabel}
              </span>
            </div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#FFFFFF', marginTop: 3 }}>
              {isReward ? 'Mimi & Mochi Reunited!' : 'Induk Kucing (Mimi)'}
            </div>
          </div>
        </div>

        {/* Dialogue Body */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 14,
            padding: '14px 16px',
            fontSize: 13.5,
            lineHeight: 1.6,
            color: '#E2E8F0',
          }}
        >
          {isAsk && (
            <>
              <strong style={{ color: '#FCD34D' }}>"Meooww...!</strong> Stevunt, syukurlah kamu keluar kelas! Anak kecilku si <strong style={{ color: '#38BDF8' }}>Mochi</strong> tadi bermain mengejar kupu-kupu dan masuk ke dalam kardus mainannya...
              <br /><br />
              Sekarang dia tersesat di salah satu area fasilitas atau halaman sekolah! Maukah kamu membantuku mencarinya?"
            </>
          )}

          {stage === 'reminder' && (
            <>
              <strong style={{ color: '#FCD34D' }}>"Meoww...?</strong> Mochi masih belum ketemu ya?
              <br /><br />
              Coba telusuri <strong style={{ color: '#38BDF8' }}>Perpustakaan</strong>, <strong style={{ color: '#38BDF8' }}>Lab Komputer</strong>, <strong style={{ color: '#38BDF8' }}>Kantin</strong>, atau <strong style={{ color: '#38BDF8' }}>Halaman Lapangan</strong>... Biasanya dia suka bersembunyi di dalam kardus di sudut yang tenang!"
            </>
          )}

          {isReward && (
            <>
              <strong style={{ color: '#34D399' }}>"Purrrr... Meooww!</strong> Kamu menemukan Mochi! Lihat, dia langsung mendengkur tenang saat kembali ke dekatku.
              <br /><br />
              Terima kasih banyak ya Stevunt! Kamu siswa yang sangat teliti, peduli, dan berhati hangat!"
            </>
          )}
        </div>

        {/* Reward Badge Display when completed */}
        {isReward && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1.5px dashed #10B981',
              borderRadius: 14,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 28 }}>🏅</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#34D399' }}>
                PENCAPAIAN DIBUKA: Sahabat Kucing SMP!
              </div>
              <div style={{ fontSize: 11, color: '#A7F3D0' }}>
                Kamu berhasil menyelamatkan Mochi dan membawanya pulang ke induknya.
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          {isAsk ? (
            <>
              <button
                className="game-btn game-btn-primary"
                onClick={() => {
                  gameAudio.playCatMeow()
                  if (onAccept) onAccept()
                  onClose()
                }}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: 12,
                  fontSize: 13.5,
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
                  cursor: 'pointer',
                  border: 'none',
                  color: '#FFFFFF',
                }}
              >
                🐾 Tentu, Aku Bantu Cari Mochi!
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '11px 16px',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 800,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#CBD5E1',
                  cursor: 'pointer',
                }}
              >
                Nanti Dulu
              </button>
            </>
          ) : (
            <button
              className="game-btn game-btn-primary"
              onClick={() => {
                if (isReward) gameAudio.playCatPurr()
                onClose()
              }}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: 900,
                background: isReward
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
                boxShadow: isReward
                  ? '0 0 15px rgba(16, 185, 129, 0.4)'
                  : '0 0 15px rgba(56, 189, 248, 0.4)',
                cursor: 'pointer',
                border: 'none',
                color: '#FFFFFF',
              }}
            >
              {isReward ? '❤️ Sama-sama, Mimi & Mochi!' : '🔍 Siap, Aku Lanjutkan Mencari!'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export interface KittenRescueModalProps {
  locationLabel: string
  onRescue: () => void
  onClose: () => void
}

export function KittenRescueModal({
  locationLabel,
  onRescue,
  onClose
}: KittenRescueModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 12, 24, 0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'linear-gradient(145deg, #0e1e32 0%, #091322 100%)',
          border: '2px solid #10B981',
          borderRadius: 20,
          boxShadow: '0 16px 40px rgba(16, 185, 129, 0.35), 0 0 25px rgba(16, 185, 129, 0.2)',
          padding: '24px 22px',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 16,
          position: 'relative',
        }}
      >
        {/* Animated Kitten in Box */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid #10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              backgroundImage: "url('/Assets/CatPack/Box3.png')",
              backgroundRepeat: 'no-repeat',
              backgroundSize: '128px 32px',
              imageRendering: 'pixelated',
              transform: 'scale(2.2)',
            }}
          />
        </div>

        <div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 900,
              padding: '2px 8px',
              borderRadius: 6,
              background: '#10B981',
              color: '#091322',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
            }}
          >
            Anak Kucing Ditemukan! 📦
          </span>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF', marginTop: 6 }}>
            Kamu Menemukan Mochi!
          </div>
          <div style={{ fontSize: 11.5, color: '#38BDF8', fontWeight: 600, marginTop: 2 }}>
            Lokasi: {locationLabel}
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 14,
            padding: '12px 14px',
            fontSize: 13,
            lineHeight: 1.55,
            color: '#E2E8F0',
          }}
        >
          <strong style={{ color: '#FCD34D' }}>"Mewww...!"</strong>
          <br />
          Mochi mendongak dari dalam kardus dan mengibaskan ekornya dengan ceria saat melihatmu! Dia melompat ke pelukanmu dan siap dibawa kembali ke induknya.
        </div>

        <button
          className="game-btn game-btn-primary"
          onClick={() => {
            gameAudio.playCatMeow()
            onRescue()
            onClose()
          }}
          style={{
            width: '100%',
            padding: '12px 18px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 900,
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.45)',
            cursor: 'pointer',
            border: 'none',
            color: '#FFFFFF',
          }}
        >
          🐾 Gendong Mochi & Bawa ke Induknya!
        </button>
      </motion.div>
    </div>
  )
}
