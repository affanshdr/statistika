'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { gameAudio } from '@/lib/utils/gameAudio'

export interface MotherCatModalProps {
  stage: 'ask_help' | 'reminder' | 'reward'
  classLabel?: string
  playerName?: string
  onAccept?: () => void
  onClose: () => void
}

export function MotherCatModal({
  stage,
  classLabel = 'kelas',
  playerName = 'Kamu',
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
      onClick={() => {
        if (isAsk && onAccept) onAccept()
        onClose()
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'linear-gradient(145deg, #2D1A12 0%, #170E08 100%)',
          border: '2.5px solid #F59E0B',
          borderRadius: 20,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
          padding: '20px 22px',
          color: '#FEF3C7',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          position: 'relative',
        }}
      >
        {/* Decorative Viewfinder Brackets */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2.5px solid #F59E0B', borderLeft: '2.5px solid #F59E0B', borderRadius: '3px 0 0 0', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2.5px solid #F59E0B', borderRight: '2.5px solid #F59E0B', borderRadius: '0 3px 0 0', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2.5px solid #F59E0B', borderLeft: '2.5px solid #F59E0B', borderRadius: '0 0 0 3px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2.5px solid #F59E0B', borderRight: '2.5px solid #F59E0B', borderRadius: '0 0 3px 0', pointerEvents: 'none' }} />

        {/* Header with Cat Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.06)',
              border: isReward ? '2px solid #059669' : '2px solid #F59E0B',
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
                transform: 'scale(1.4)',
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  padding: '2px 7px',
                  borderRadius: 6,
                  background: isReward ? '#059669' : '#B45309',
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                }}
              >
                {isReward ? 'Misi Selesai 🎉' : 'Misi Kucing 🐾'}
              </span>
              <span style={{ fontSize: 11, color: '#38BDF8', fontWeight: 800 }}>
                Depan {classLabel}
              </span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#FEF3C7', marginTop: 2 }}>
              {isReward ? 'Mimi & Mochi' : 'Induk Kucing (Mimi)'}
            </div>
          </div>
        </div>

        {/* Concise Dialogue Body (Zero-Noise) */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1.5px solid #8C6239',
            borderRadius: 12,
            padding: '12px 14px',
            fontSize: 12.5,
            lineHeight: 1.5,
            color: '#FEF3C7',
          }}
        >
          {isAsk && (
            <span>
              <strong style={{ color: '#FCD34D' }}>"Meoww! 🐾 </strong>
              {playerName}, tolong bantu temukan anakku <strong style={{ color: '#38BDF8' }}>Mochi</strong> yang bersembunyi di dalam kardus mainannya!
            </span>
          )}

          {stage === 'reminder' && (
            <span>
              <strong style={{ color: '#FCD34D' }}>"Meoww? </strong>
              Mochi belum ketemu? Coba periksa kardus di area fasilitas (Perpustakaan, Lab, atau Kantin)!
            </span>
          )}

          {isReward && (
            <span>
              <strong style={{ color: '#34D399' }}>"Purrrr... Meow! ❤️ </strong>
              Terima kasih banyak {playerName}, kamu sudah menemukan dan menyelamatkan Mochi!
            </span>
          )}
        </div>

        {/* Action Button */}
        <div style={{ marginTop: 2 }}>
          {isAsk ? (
            <button
              onClick={() => {
                gameAudio.playCatMeow()
                if (onAccept) onAccept()
                onClose()
              }}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                boxShadow: '0 4px 14px rgba(14, 131, 136, 0.35)',
                cursor: 'pointer',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                transition: 'all 0.15s ease',
              }}
            >
              🐾 Tentu, Aku Bantu Cari Mochi!
            </button>
          ) : (
            <button
              onClick={() => {
                if (isReward) gameAudio.playCatPurr()
                onClose()
              }}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: 900,
                background: isReward
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                boxShadow: '0 4px 14px rgba(14, 131, 136, 0.35)',
                cursor: 'pointer',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                transition: 'all 0.15s ease',
              }}
            >
              {isReward ? '❤️ Sama-sama, Mimi & Mochi!' : '🔍 Siap, Aku Lanjut Cari!'}
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
  const handleTriggerRescue = () => {
    try {
      gameAudio.playSuccess()
      gameAudio.playCatMeow()
    } catch {}
    if (onRescue) onRescue()
    if (onClose) onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 12, 24, 0.82)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
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
          maxWidth: 420,
          background: 'linear-gradient(145deg, #2D1A12 0%, #170E08 100%)',
          border: '2.5px solid #F59E0B',
          borderRadius: 20,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), inset 0 0 25px rgba(180, 140, 80, 0.25)',
          padding: '20px 22px',
          color: '#FEF3C7',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 12,
          position: 'relative',
        }}
      >
        {/* Decorative Viewfinder Brackets */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2.5px solid #F59E0B', borderLeft: '2.5px solid #F59E0B', borderRadius: '3px 0 0 0', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2.5px solid #F59E0B', borderRight: '2.5px solid #F59E0B', borderRadius: '0 3px 0 0', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2.5px solid #F59E0B', borderLeft: '2.5px solid #F59E0B', borderRadius: '0 0 0 3px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2.5px solid #F59E0B', borderRight: '2.5px solid #F59E0B', borderRadius: '0 0 3px 0', pointerEvents: 'none' }} />

        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '2px solid #F59E0B',
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
                backgroundImage: "url('/Assets/CatPack/Box3.png')",
                backgroundRepeat: 'no-repeat',
                backgroundSize: '128px 32px',
                imageRendering: 'pixelated',
                transform: 'scale(1.6)',
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  padding: '2px 7px',
                  borderRadius: 6,
                  background: '#D97706',
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                }}
              >
                Kardus Mainan 📦
              </span>
              <span style={{ fontSize: 11, color: '#38BDF8', fontWeight: 800 }}>
                📍 {locationLabel}
              </span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#FEF3C7', marginTop: 2 }}>
              Mochi di Dalam Kardus!
            </div>
          </div>
        </div>

        {/* Short, direct prompt (No Noise) */}
        <div
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1.5px solid #8C6239',
            borderRadius: 12,
            padding: '12px 14px',
            fontSize: 12.5,
            lineHeight: 1.5,
            color: '#FEF3C7',
            textAlign: 'left',
          }}
        >
          <strong style={{ color: '#FBBF24' }}>"Mewww... 🐾"</strong>
          <div style={{ marginTop: 2 }}>
            Mochi bersembunyi di dalam kardus ini. Buka kardusnya untuk membawanya kembali ke induknya!
          </div>
        </div>

        {/* 1-Click Direct Rescue Button */}
        <button
          type="button"
          onClick={handleTriggerRescue}
          style={{
            width: '100%',
            padding: '12px 18px',
            borderRadius: 12,
            fontSize: 13.5,
            fontWeight: 900,
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
            cursor: 'pointer',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <span>📦 Buka Kardus &amp; Selamatkan Mochi ➔</span>
        </button>
      </motion.div>
    </div>
  )
}
