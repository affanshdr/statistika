'use client'

import React, { useState } from 'react'
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
          maxWidth: 480,
          background: 'linear-gradient(145deg, #2D1A12 0%, #170E08 100%)',
          border: '2.5px solid #F59E0B',
          borderRadius: 24,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
          padding: '26px 24px',
          color: '#FEF3C7',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          position: 'relative',
        }}
      >
        {/* Decorative Viewfinder Brackets */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '3px 0 0 0' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 3px 0 0' }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '0 0 0 3px' }} />
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 0 3px 0' }} />

        {/* Header with Cat Avatar & Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Animated Cat Avatar Box */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.06)',
              border: isReward ? '2px solid #059669' : '2px solid #F59E0B',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
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
                  fontSize: 10.5,
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: isReward ? '#059669' : '#B45309',
                  color: '#FFFFFF',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                }}
              >
                {isReward ? 'Misi Selesai 🎉' : 'Misi Rahasia 🐾'}
              </span>
              <span style={{ fontSize: 11.5, color: '#38BDF8', fontWeight: 800 }}>
                Depan {classLabel}
              </span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#FEF3C7', marginTop: 3 }}>
              {isReward ? 'Mimi & Mochi Reunited!' : 'Induk Kucing (Mimi)'}
            </div>
          </div>
        </div>

        {/* Dialogue Body */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1.5px solid #B48C50',
            borderRadius: 16,
            padding: '16px 18px',
            fontSize: 13.5,
            lineHeight: 1.6,
            color: '#FEF3C7',
            boxShadow: 'inset 0 2px 5px rgba(140, 98, 57, 0.1), 0 2px 6px rgba(0,0,0,0.04)',
          }}
        >
          {isAsk && (
            <>
              <strong style={{ color: '#FCD34D' }}>"Meooww...!</strong> Stevunt, syukurlah kamu lewat sini! Anak kecilku si <strong style={{ color: '#38BDF8' }}>Mochi</strong> tadi bermain mengejar kupu-kupu dan masuk ke dalam kardus mainannya...
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
              <strong style={{ color: '#059669' }}>"Purrrr... Meooww!</strong> Kamu menemukan Mochi! Lihat, dia langsung mendengkur tenang saat kembali ke dekatku.
              <br /><br />
              Terima kasih banyak ya Stevunt! Kamu siswa yang sangat teliti, peduli, dan berhati hangat!"
            </>
          )}
        </div>

        {/* Reward Badge Display when completed */}
        {isReward && (
          <div
            style={{
              background: '#ECFDF5',
              border: '1.5px dashed #059669',
              borderRadius: 14,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 28 }}>🏅</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#065F46' }}>
                PENCAPAIAN DIBUKA: Sahabat Kucing SMP!
              </div>
              <div style={{ fontSize: 11.5, color: '#047857', fontWeight: 600 }}>
                Kamu berhasil menyelamatkan Mochi dan membawanya pulang ke induknya.
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          {isAsk ? (
            <button
              className="game-btn game-btn-primary"
              onClick={() => {
                gameAudio.playCatMeow()
                if (onAccept) onAccept()
                onClose()
              }}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: 14,
                fontSize: 14.5,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                boxShadow: '0 6px 20px rgba(14, 131, 136, 0.35)',
                cursor: 'pointer',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                color: '#FFFFFF',
              }}
            >
              🐾 Tentu, Aku Bantu Cari Mochi!
            </button>
          ) : (
            <button
              className="game-btn game-btn-primary"
              onClick={() => {
                if (isReward) gameAudio.playCatPurr()
                onClose()
              }}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 900,
                background: isReward
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                boxShadow: '0 6px 20px rgba(14, 131, 136, 0.35)',
                cursor: 'pointer',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
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

export interface CatMathQuiz {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export const CAT_MATH_QUIZZES: CatMathQuiz[] = [
  {
    question: 'Di samping kardus ada catatan jatah makan: Jika Mimi makan 4 ikan dan Mochi makan 3 ikan setiap hari, berapa total ikan yang mereka habiskan dalam 2 hari?',
    options: ['10 ekor', '12 ekor', '14 ekor', '16 ekor'],
    correctIndex: 2, // (4 + 3) * 2 = 14
    explanation: '(4 + 3) × 2 hari = 7 × 2 = 14 ekor ikan!',
  },
  {
    question: 'Tali simpul kardus memiliki pola angka: 3, 6, 9, 12, ... Angka berapakah selanjutnya untuk membuka simpul kardus?',
    options: ['14', '15', '16', '18'],
    correctIndex: 1, // Pola kelipatan 3
    explanation: 'Pola kelipatan 3: 12 + 3 = 15!',
  },
  {
    question: 'Mochi mengumpulkan bola mainan: 4 bola merah, 5 bola biru, dan 6 bola kuning. Berapakah total semua bola mainan Mochi?',
    options: ['13 bola', '14 bola', '15 bola', '16 bola'],
    correctIndex: 2, // 4 + 5 + 6 = 15
    explanation: '4 + 5 + 6 = 15 bola mainan!',
  },
  {
    question: 'Mimi membagi 18 biskuit ikan sama rata ke dalam 3 mangkuk makan Mochi. Berapa isi biskuit di setiap mangkuk?',
    options: ['4 biskuit', '5 biskuit', '6 biskuit', '7 biskuit'],
    correctIndex: 2, // 18 / 3 = 6
    explanation: '18 ÷ 3 mangkuk = 6 biskuit per mangkuk!',
  },
  {
    question: 'Mochi tidur 9 jam di siang hari dan 7 jam di malam hari. Berapa jam total waktu tidur Mochi dalam sehari?',
    options: ['14 jam', '15 jam', '16 jam', '18 jam'],
    correctIndex: 2, // 9 + 7 = 16
    explanation: '9 jam + 7 jam = 16 jam tidur!',
  },
]

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
  const [quiz] = useState<CatMathQuiz>(() => {
    const idx = Math.floor(Math.random() * CAT_MATH_QUIZZES.length)
    return CAT_MATH_QUIZZES[idx]
  })
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [wrongShake, setWrongShake] = useState(false)
  const [feedbackText, setFeedbackText] = useState<string | null>(null)

  const handleSelectOption = (idx: number) => {
    if (isCorrect) return
    setSelectedOption(idx)

    if (idx === quiz.correctIndex) {
      setIsCorrect(true)
      setFeedbackText(`🎉 Tepat sekali! Simpul pita kardus terbuka! (${quiz.explanation})`)
      gameAudio.playSuccess()
      gameAudio.playCatMeow()
    } else {
      setWrongShake(true)
      setFeedbackText('❌ Oops, hitunganmu belum tepat! Coba hitung lagi ya 🐾')
      gameAudio.playError()
      setTimeout(() => setWrongShake(false), 500)
    }
  }

  const OPTION_LABELS = ['A', 'B', 'C', 'D']

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
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          x: wrongShake ? [0, -8, 8, -6, 6, 0] : 0,
        }}
        exit={{ opacity: 0, scale: 0.88, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '94vh',
          overflowY: 'auto',
          background: 'linear-gradient(145deg, #2D1A12 0%, #170E08 100%)',
          border: '2.5px solid #F59E0B',
          borderRadius: 24,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), inset 0 0 25px rgba(180, 140, 80, 0.25)',
          padding: '24px 22px',
          color: '#FEF3C7',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 14,
          position: 'relative',
        }}
      >
        {/* Decorative Viewfinder Brackets */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '3px 0 0 0' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 3px 0 0' }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '0 0 0 3px' }} />
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 0 3px 0' }} />

        {/* Top Header: Kitten Avatar & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left' }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.06)',
              border: isCorrect ? '2px solid #10B981' : '2px solid #F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: isCorrect ? '0 0 15px rgba(16, 185, 129, 0.35)' : '0 2px 8px rgba(0,0,0,0.2)',
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
                transform: 'scale(1.8)',
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
                  background: isCorrect ? '#059669' : '#D97706',
                  color: '#FFFFFF',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                }}
              >
                {isCorrect ? 'Simpul Terbuka 🔓' : 'Kardus Terkunci 🔒'}
              </span>
              <span style={{ fontSize: 11, color: '#38BDF8', fontWeight: 800 }}>
                📍 {locationLabel}
              </span>
            </div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#FEF3C7', marginTop: 2 }}>
              Mochi di Dalam Kardus!
            </div>
          </div>
        </div>

        {/* Kitten Dialogue / Context */}
        <div
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: isCorrect ? '1.5px solid #10B981' : '1.5px solid #8C6239',
            borderRadius: 14,
            padding: '12px 14px',
            fontSize: 12.5,
            lineHeight: 1.55,
            color: '#FEF3C7',
            textAlign: 'left',
            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.2)',
          }}
        >
          {isCorrect ? (
            <div>
              <strong style={{ color: '#34D399' }}>"Purrrr... Meoww! ❤️"</strong>
              <div style={{ marginTop: 2 }}>
                Simpul pita terlepas! Mochi melompat gembira dan siap kamu bawa pulang ke induknya Mimi.
              </div>
            </div>
          ) : (
            <div>
              <strong style={{ color: '#FBBF24' }}>"Mewww... 🐾"</strong>
              <div style={{ marginTop: 2 }}>
                Kardus Mochi terikat simpul pita bertuliskan teka-teki. Selesaikan soal hitungan di bawah ini untuk membuka ikatannya!
              </div>
            </div>
          )}
        </div>

        {/* Quiz Container */}
        <div
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, rgba(38, 22, 14, 0.8) 0%, rgba(20, 10, 6, 0.9) 100%)',
            border: isCorrect ? '1.5px solid #10B981' : '1.5px solid #D97706',
            borderRadius: 16,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Quiz Header Tag */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: '#FBBF24', letterSpacing: '1px' }}>
              🧮 TEKA-TEKI GEMBOK KARDUS
            </span>
            <span style={{ fontSize: 10, fontWeight: 800, color: isCorrect ? '#34D399' : '#D1B89D' }}>
              {isCorrect ? '✓ TERPECAHKAN' : 'PILIH JAWABAN TEPAT'}
            </span>
          </div>

          {/* Question Text */}
          <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFDF7', lineHeight: 1.5, textAlign: 'left' }}>
            {quiz.question}
          </div>

          {/* Options Grid (2x2) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
            {quiz.options.map((option, idx) => {
              const isThisSelected = selectedOption === idx
              const isThisCorrect = isCorrect && idx === quiz.correctIndex

              let btnBg = 'rgba(255, 255, 255, 0.06)'
              let btnBorder = '1.5px solid rgba(245, 158, 11, 0.35)'
              let btnColor = '#FEF3C7'

              if (isThisCorrect) {
                btnBg = 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                btnBorder = '1.5px solid #34D399'
                btnColor = '#FFFFFF'
              } else if (isThisSelected && !isCorrect) {
                btnBg = 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)'
                btnBorder = '1.5px solid #F87171'
                btnColor = '#FFFFFF'
              }

              return (
                <motion.button
                  key={idx}
                  whileHover={!isCorrect ? { scale: 1.03 } : {}}
                  whileTap={!isCorrect ? { scale: 0.97 } : {}}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isCorrect}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: btnBg,
                    border: btnBorder,
                    color: btnColor,
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: isCorrect ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: isThisCorrect ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      background: isThisCorrect ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)',
                      color: isThisCorrect ? '#FFFFFF' : '#FBBF24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    {isThisCorrect ? '✓' : OPTION_LABELS[idx]}
                  </span>
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {option}
                  </span>
                </motion.button>
              )
            })}
          </div>

          {/* Feedback message */}
          {feedbackText && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                color: isCorrect ? '#34D399' : '#F87171',
                padding: '6px 10px',
                borderRadius: 8,
                background: isCorrect ? 'rgba(5, 150, 105, 0.15)' : 'rgba(220, 38, 38, 0.15)',
                border: isCorrect ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(248, 113, 113, 0.3)',
                textAlign: 'left',
              }}
            >
              {feedbackText}
            </motion.div>
          )}
        </div>

        {/* Action Button */}
        {isCorrect ? (
          <motion.button
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              gameAudio.playCatMeow()
              onRescue()
              onClose()
            }}
            style={{
              width: '100%',
              padding: '13px 20px',
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 900,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
              cursor: 'pointer',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <span>🐾 Gendong Mochi & Bawa ke Induknya!</span>
          </motion.button>
        ) : (
          <div
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: 14,
              fontSize: 13,
              fontWeight: 800,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              color: '#D1B89D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              userSelect: 'none',
            }}
          >
            <span>🔒 Jawab teka-teki di atas untuk membuka kardus</span>
          </div>
        )}
      </motion.div>
    </div>
  )
}
