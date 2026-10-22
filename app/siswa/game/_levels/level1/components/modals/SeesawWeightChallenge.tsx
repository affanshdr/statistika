'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { gameAudio } from '@/lib/utils/gameAudio'
import { useGameStore } from '@/lib/store/gameStore'

interface SeesawWeightChallengeProps {
  onSuccess: () => void
  isSolved: boolean
  isCompact?: boolean
}

const QUIZ_OPTIONS = [
  { id: 'A', label: 'A. E, B, C, A, D', isCorrect: true },
  { id: 'B', label: 'B. E, C, B, A, D', isCorrect: false },
  { id: 'C', label: 'C. B, E, C, A, D', isCorrect: false },
  { id: 'D', label: 'D. E, B, A, C, D', isCorrect: false },
]

export default function SeesawWeightChallenge({ onSuccess, isSolved, isCompact: propIsCompact }: SeesawWeightChallengeProps) {
  const incrementMistake = useGameStore(s => s.incrementMistake)
  const [selectedOption, setSelectedOption] = useState<string | null>(isSolved ? 'A' : null)
  const [shake, setShake] = useState<number>(0)
  const [penaltyNotice, setPenaltyNotice] = useState<boolean>(false)
  const [isCompactState, setIsCompactState] = useState<boolean>(false)

  React.useEffect(() => {
    const check = () => setIsCompactState(typeof window !== 'undefined' && window.innerHeight <= 520)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const isCompact = propIsCompact !== undefined ? propIsCompact : isCompactState

  const handleSelectOption = (optionId: string) => {
    if (isSolved) return
    setSelectedOption(optionId)

    if (optionId === 'A') {
      gameAudio.playSuccess()
      setPenaltyNotice(false)
      onSuccess()
    } else {
      setShake(prev => prev + 1)
      gameAudio.playError()
      incrementMistake()
      setPenaltyNotice(true)
      setTimeout(() => setPenaltyNotice(false), 2200)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isCompact ? '5px' : '8px', width: '100%' }}>
      {/* 1. PERTANYAAN */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1.5px solid #F59E0B',
        borderRadius: isCompact ? '8px' : '12px',
        padding: isCompact ? '5px 10px' : '10px 14px',
        color: '#FEF3C7',
        fontSize: isCompact ? '9.5px' : '12px',
        lineHeight: isCompact ? 1.3 : 1.5,
      }}>
        <p style={{ margin: isCompact ? '0 0 3px' : '0 0 6px', fontWeight: 600 }}>
          Di sebuah wahana bermain, terdapat <strong>5 anak (A, B, C, D, dan E)</strong> yang bermain jungkit-jangkit untuk membandingkan berat badan:
        </p>
        <ul style={{ margin: isCompact ? '0 0 3px' : '0 0 6px', paddingLeft: isCompact ? '14px' : '18px', fontSize: isCompact ? '9px' : '11.5px', lineHeight: isCompact ? 1.3 : 1.45, color: '#FDE68A' }}>
          <li>Saat <strong>A dan B</strong> naik melawan <strong>C dan D</strong>, papan jungkit-jangkit seimbang sempurna.</li>
          <li>Saat <strong>A dan C</strong> bertukar posisi (sehingga <strong>A dan D</strong> melawan <strong>B dan C</strong>), sisi <strong>B dan C</strong> lebih berat sehingga turun ke bawah.</li>
          <li>Saat <strong>E</strong> naik sendirian melawan <strong>C</strong>, sisi <strong>E</strong> lebih berat.</li>
        </ul>
        <p style={{ margin: 0, fontWeight: 900, color: '#FFFFFF', fontSize: isCompact ? '9.5px' : '12px' }}>
          Jika kelima anak tersebut diurutkan dari yang paling berat ke paling ringan, manakah urutan yang pasti BENAR?
        </p>
      </div>

      {/* 2. VISUAL (3 Kondisi Jungkit-Jangkit) */}
      <div style={{
        background: 'linear-gradient(180deg, #1A0F0A 0%, #110804 100%)',
        border: '1.5px solid #8C6239',
        borderRadius: isCompact ? '8px' : '12px',
        padding: isCompact ? '4px 6px' : '8px 10px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: isCompact ? '4px' : '8px',
        boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)',
      }}>
        {/* Kondisi 1 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(140, 98, 57, 0.4)',
          borderRadius: '6px',
          padding: isCompact ? '3px 2px' : '6px 4px 6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: isCompact ? '8.5px' : '10.5px', fontWeight: 800, color: '#FDE68A', marginBottom: isCompact ? '2px' : '4px' }}>
            Kondisi 1
          </span>
          <svg viewBox="0 0 160 70" style={{ width: '100%', height: isCompact ? '44px' : '62px' }}>
            {/* Ground Line */}
            <line x1="10" y1="62" x2="150" y2="62" stroke="#78350F" strokeWidth="2" strokeDasharray="3 3" />
            {/* Fulcrum (Segitiga Tumpuan) */}
            <polygon points="80,40 72,62 88,62" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
            <circle cx="80" cy="40" r="3" fill="#FEF3C7" />
            {/* Papan Jungkit-Jangkit (Datar) */}
            <line x1="18" y1="40" x2="142" y2="40" stroke="#FDE68A" strokeWidth="4" strokeLinecap="round" />
            {/* Sisi Kiri: Anak A & B */}
            <circle cx="34" cy="27" r="9" fill="#10B981" stroke="#065F46" strokeWidth="1.5" />
            <text x="34" y="30.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900">A</text>
            <circle cx="54" cy="27" r="9" fill="#F59E0B" stroke="#92400E" strokeWidth="1.5" />
            <text x="54" y="30.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900">B</text>
            {/* Sisi Kanan: Anak C & D */}
            <circle cx="106" cy="27" r="9" fill="#0284C7" stroke="#075985" strokeWidth="1.5" />
            <text x="106" y="30.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900">C</text>
            <circle cx="126" cy="27" r="9" fill="#8B5CF6" stroke="#5B21B6" strokeWidth="1.5" />
            <text x="126" y="30.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900">D</text>
          </svg>
        </div>

        {/* Kondisi 2 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(140, 98, 57, 0.4)',
          borderRadius: '6px',
          padding: isCompact ? '3px 2px' : '6px 4px 6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: isCompact ? '8.5px' : '10.5px', fontWeight: 800, color: '#FDE68A', marginBottom: isCompact ? '2px' : '4px' }}>
            Kondisi 2
          </span>
          <svg viewBox="0 0 160 70" style={{ width: '100%', height: isCompact ? '44px' : '62px' }}>
            {/* Ground Line */}
            <line x1="10" y1="62" x2="150" y2="62" stroke="#78350F" strokeWidth="2" strokeDasharray="3 3" />
            {/* Fulcrum */}
            <polygon points="80,40 72,62 88,62" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
            <circle cx="80" cy="40" r="3" fill="#FEF3C7" />
            {/* Papan Jungkit-Jangkit (Miring: Kiri Naik, Kanan Turun) */}
            <line x1="18" y1="28" x2="142" y2="52" stroke="#FDE68A" strokeWidth="4" strokeLinecap="round" />
            {/* Sisi Kiri (Terangkat): Anak A & D */}
            <circle cx="34" cy="17" r="9" fill="#10B981" stroke="#065F46" strokeWidth="1.5" />
            <text x="34" y="20.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900">A</text>
            <circle cx="54" cy="21" r="9" fill="#8B5CF6" stroke="#5B21B6" strokeWidth="1.5" />
            <text x="54" y="24.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900">D</text>
            {/* Sisi Kanan (Turun / Berat): Anak B & C */}
            <circle cx="106" cy="35" r="9" fill="#F59E0B" stroke="#92400E" strokeWidth="1.5" />
            <text x="106" y="38.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900">B</text>
            <circle cx="126" cy="39" r="9" fill="#0284C7" stroke="#075985" strokeWidth="1.5" />
            <text x="126" y="42.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900">C</text>
          </svg>
        </div>

        {/* Kondisi 3 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(140, 98, 57, 0.4)',
          borderRadius: '6px',
          padding: isCompact ? '3px 2px' : '6px 4px 6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: isCompact ? '8.5px' : '10.5px', fontWeight: 800, color: '#FDE68A', marginBottom: isCompact ? '2px' : '4px' }}>
            Kondisi 3
          </span>
          <svg viewBox="0 0 160 70" style={{ width: '100%', height: isCompact ? '44px' : '62px' }}>
            {/* Ground Line */}
            <line x1="10" y1="62" x2="150" y2="62" stroke="#78350F" strokeWidth="2" strokeDasharray="3 3" />
            {/* Fulcrum */}
            <polygon points="80,40 72,62 88,62" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
            <circle cx="80" cy="40" r="3" fill="#FEF3C7" />
            {/* Papan Jungkit-Jangkit (Miring: Kiri Turun, Kanan Naik) */}
            <line x1="22" y1="52" x2="138" y2="28" stroke="#FDE68A" strokeWidth="4" strokeLinecap="round" />
            {/* Sisi Kiri (Turun / Berat): Anak E */}
            <circle cx="44" cy="39" r="10" fill="#E11D48" stroke="#9F1239" strokeWidth="1.5" />
            <text x="44" y="42.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900">E</text>
            {/* Sisi Kanan (Terangkat): Anak C */}
            <circle cx="116" cy="18" r="9" fill="#0284C7" stroke="#075985" strokeWidth="1.5" />
            <text x="116" y="21.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900">C</text>
          </svg>
        </div>
      </div>

      {/* 3. PILIHAN JAWABAN */}
      {penaltyNotice && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #EF4444',
            borderRadius: '6px',
            padding: isCompact ? '2px 6px' : '4px 10px',
            fontSize: isCompact ? '9.5px' : '11px',
            fontWeight: 800,
            color: '#FCA5A5',
            textAlign: 'center',
          }}
        >
          ⚠️ Jawaban Kurang Tepat! (+30 Detik Penalti Waktu)
        </motion.div>
      )}
      <motion.div
        key={shake}
        animate={shake > 0 ? { x: [-6, 6, -5, 5, 0] } : {}}
        transition={{ duration: 0.3 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: isCompact ? '5px' : '8px',
        }}
      >
        {QUIZ_OPTIONS.map(opt => {
          const isSelected = selectedOption === opt.id
          const isThisCorrect = isSolved && opt.isCorrect
          const isThisWrong = isSelected && !opt.isCorrect

          let bg = 'rgba(255, 255, 255, 0.06)'
          let border = '1.5px solid rgba(245, 158, 11, 0.4)'
          let color = '#FEF3C7'

          if (isThisCorrect) {
            bg = 'linear-gradient(135deg, #059669 0%, #047857 100%)'
            border = '1.5px solid #34D399'
            color = '#FFFFFF'
          } else if (isThisWrong) {
            bg = 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)'
            border = '1.5px solid #F87171'
            color = '#FFFFFF'
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectOption(opt.id)}
              disabled={isSolved}
              style={{
                padding: isCompact ? '4px 8px' : '10px 14px',
                borderRadius: isCompact ? '7px' : '10px',
                background: bg,
                border: border,
                color: color,
                fontSize: isCompact ? '10px' : '12.5px',
                fontWeight: 800,
                cursor: isSolved ? 'default' : 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{opt.label}</span>
              {isThisCorrect && <span>✓</span>}
              {isThisWrong && <span>✕</span>}
            </button>
          )
        })}
      </motion.div>
    </div>
  )
}
