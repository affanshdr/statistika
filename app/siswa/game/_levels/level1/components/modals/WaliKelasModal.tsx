'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CLASS_STUDENTS, getClassStudents, QuizDoor } from '@/app/siswa/game/_levels/level1/data/level1Data'
import { useGameStore } from '@/lib/store/gameStore'
import { gameAudio } from '@/lib/utils/gameAudio'
import MarbleBowlsChallenge from './MarbleBowlsChallenge'

interface WaliKelasModalProps {
  door: QuizDoor
  studentsData?: Record<string, { teacher: string; comment: string; image?: string; students: { name: string; time: number }[] }>
  onCollectData: () => void
  onClose: () => void
}

interface QuizData {
  conceptTag: string
  introQuote: string
  questionText: string
  hintText: string
  correctAnswer: number
  unit: string
  options: number[]
  explanation: string
}

function generatePreLearningQuiz(doorId: string, students: { name: string; time: number }[]): QuizData {
  const times = students.map(s => s.time)

  if (doorId === 'A1') {
    // ─── KELAS VII-A: Tantangan Mangkuk Kelereng (Fair Share / Rata-Rata Intuitif) ───
    return {
      conceptTag: 'PRE-PEMBELAJARAN 1: Logika Pemerataan (Fair Share / Rata-Rata)',
      introQuote: 'Selesaikan tantangan teka-teki kelereng ini dengan tepat untuk membuka data screen time kelas!',
      questionText: 'Setarakan isi ke-4 mangkuk dengan memindahkan kelereng (drag and drop) hingga semua mangkuk sama banyak!',
      correctAnswer: 11,
      unit: 'kelereng',
      options: [9, 10, 11, 12],
      hintText: 'Pindahkan 4 butir dari Mangkuk A ke B, dan 7 butir dari Mangkuk C ke D sampai semuanya seimbang!',
      explanation: 'Tepat sekali! Setiap mangkuk akhirnya berisi 11 kelereng. Konsep meratakan isi seperti ini adalah fondasi intuitif dari Rata-Rata (Mean / Fair Share) dalam statistika!',
    }
  }

  if (doorId === 'A2') {
    // ── KELAS VII-B (7 Siswa): Memilah Data & Frekuensi Kriteria (> cutoff) ──
    let cutoff = 4
    let matching = students.filter(s => s.time > cutoff).length
    if (matching < 2 || matching > 5) {
      cutoff = 3
      matching = students.filter(s => s.time > cutoff).length
    }

    const pool = new Set<number>([matching])
    const candidateOffsets = [1, -1, 2, -2, 3]
    for (const offset of candidateOffsets) {
      if (pool.size >= 4) break
      const cand = matching + offset
      if (cand >= 1 && cand <= 7 && !pool.has(cand)) pool.add(cand)
    }

    return {
      conceptTag: 'PRE-PEMBELAJARAN 2: Menghitung Frekuensi Data (f)',
      introQuote: 'Eits, anak yang telat harus kena uji ketelitian dulu! Jawab ini baru Bapak berikan datanya.',
      questionText: `Dari 7 siswa di kelas ini, ada berapa banyak siswa yang waktu layarnya LEBIH DARI ${cutoff} jam sehari?`,
      correctAnswer: matching,
      unit: 'siswa',
      options: Array.from(pool).sort((a, b) => a - b),
      hintText: `Amati kartu siswa di atas. Hitung berapa banyak siswa yang memiliki waktu layar > ${cutoff} jam.`,
      explanation: `Benar! Ada ${matching} siswa dengan waktu layar > ${cutoff} jam. Menghitung banyaknya data seperti ini disebut menentukan Frekuensi (f).`,
    }
  }

  if (doorId === 'B1') {
    // ── KELAS VIII-A (4 Siswa): Menjumlahkan Seluruh Nilai Data (Sigma / Σx) ──
    const sum = times.reduce((a, b) => a + b, 0)
    const formulaStr = times.join(' + ')

    const pool = new Set<number>([sum])
    const candidateOffsets = [2, -2, 3, -3, 4]
    for (const offset of candidateOffsets) {
      if (pool.size >= 4) break
      const cand = sum + offset
      if (cand > 0 && !pool.has(cand)) pool.add(cand)
    }

    return {
      conceptTag: 'PRE-PEMBELAJARAN 3: Jumlah Seluruh Data (Sigma / Σx)',
      introQuote: 'Bagus sudah datang, tapi selesaikan dulu teka-teki Ibu sebelum membawa data ini!',
      questionText: `Karena sampel di kelas ini hanya 4 siswa, berapa jumlah total waktu layar jika ke-4 siswa digabungkan? (${formulaStr} = ?)`,
      correctAnswer: sum,
      unit: 'jam',
      options: Array.from(pool).sort((a, b) => a - b),
      hintText: `Jumlahkan keempat angka jam waktu layar siswa: ${formulaStr}.`,
      explanation: `Luar biasa! Total seluruh nilai data (Σx) adalah ${sum} jam. Nilai total ini adalah modal penting sebelum kita mempelajari rata-rata!`,
    }
  }

  // ── KELAS VIII-B (8 Siswa): Deteksi Nilai Pencilan (Outlier) & Selisih Ekstrem ──
  const sorted = [...students].sort((a, b) => b.time - a.time)
  const outlier = sorted[0]
  const secondHighest = sorted[1]
  const diff = outlier.time - secondHighest.time
  const targetVal = diff > 0 ? diff : outlier.time

  const pool = new Set<number>([targetVal])
  const candidateOffsets = [2, -2, 3, -3, 4]
  for (const offset of candidateOffsets) {
    if (pool.size >= 4) break
    const cand = targetVal + offset
    if (cand > 0 && !pool.has(cand)) pool.add(cand)
  }

  return {
    conceptTag: 'PRE-PEMBELAJARAN 4: Deteksi Nilai Pencilan (Outlier)',
    introQuote: 'Hukuman karena terlambat! Perhatikan baik-baik data 8 siswa ini sebelum mengambilnya.',
    questionText: `Ada 1 siswa bernama ${outlier.name} dengan waktu layar melonjak ekstrem (${outlier.time} jam) dibanding teman lainnya. Berapa selisih waktu ${outlier.name} dengan siswa tertinggi kedua (${secondHighest.name}: ${secondHighest.time} jam)?`,
    correctAnswer: targetVal,
    unit: 'jam',
    options: Array.from(pool).sort((a, b) => a - b),
    hintText: `Kurangkan angka pencilan ${outlier.name} (${outlier.time} jam) dengan ${secondHighest.name} (${secondHighest.time} jam). Rumus: ${outlier.time} − ${secondHighest.time}.`,
      explanation: `Tepat sekali! Selisihnya ${targetVal} jam. Nilai ${outlier.time} jam yang melonjak sangat jauh dari kelompok data ini disebut Pencilan (Outlier).`,
    }
}

export default function WaliKelasModal({ door, studentsData, onCollectData, onClose }: WaliKelasModalProps) {
  const level1Dataset = useGameStore(s => s.level1Dataset)
  const currentStudents = studentsData || getClassStudents(level1Dataset)
  const info = currentStudents[door.id] || CLASS_STUDENTS[door.id]

  const quiz = useMemo(() => {
    if (!info?.students) return null
    return generatePreLearningQuiz(door.id, info.students)
  }, [door.id, info])

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [shake, setShake] = useState<number>(0)
  const [currentOptions, setCurrentOptions] = useState<number[]>([])
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0)
  const [wrongAttempts, setWrongAttempts] = useState<number>(0)

  // Initialize and reshuffle options when quiz loads
  useEffect(() => {
    if (quiz) {
      setCurrentOptions([...quiz.options].sort(() => Math.random() - 0.5))
      setSelectedAnswer(null)
      setIsCorrect(null)
      setIsLocked(false)
      setCooldownRemaining(0)
      setWrongAttempts(0)
    }
  }, [quiz])

  const handleSelectOption = useCallback((choice: number) => {
    if (!quiz || isCorrect === true || isLocked) return
    setSelectedAnswer(choice)

    if (choice === quiz.correctAnswer) {
      setIsCorrect(true)
      setIsLocked(false)
      gameAudio.playSuccess()
    } else {
      setIsCorrect(false)
      setIsLocked(true)
      setShake(prev => prev + 1)
      setWrongAttempts(prev => prev + 1)
      gameAudio.playError()

      // Anti-spam 2-second cooldown penalty
      setCooldownRemaining(2)
      const timer = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            setIsLocked(false)
            // Reshuffle options so the player cannot blindly click the same spot or in order
            setCurrentOptions(opts => [...opts].sort(() => Math.random() - 0.5))
            setSelectedAnswer(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }, [quiz, isCorrect, isLocked])

  const handleDevPass = useCallback(() => {
    if (!quiz) return
    setSelectedAnswer(quiz.correctAnswer)
    setIsCorrect(true)
    gameAudio.playSuccess()
  }, [quiz])

  // Hotkey [U] or [0] to auto pass question (Dev & testing - commented out for player)
  /*
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'u' || e.key === 'U' || e.key === '0') {
        handleDevPass()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleDevPass])
  */

  if (!info || !quiz) return null

  return (
    <div
      data-testid="wali-kelas-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 550,
        background: 'rgba(8, 16, 26, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(8px, 2vh, 20px)',
        boxSizing: 'border-box',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 16 }}
        transition={{ type: 'spring', damping: 24, stiffness: 350 }}
        data-testid="wali-kelas-modal-content"
        style={{
          maxWidth: door.id === 'A1' ? 620 : 540,
          width: '100%',
          maxHeight: '94vh',
          overflowY: 'auto',
          position: 'relative',
          background: door.id === 'A1'
            ? 'linear-gradient(160deg, #143522 0%, #0F271A 60%, #091A11 100%)'
            : 'linear-gradient(145deg, #2D1A12 0%, #170E08 100%)',
          border: door.id === 'A1'
            ? '3px solid #8D5428'
            : '2.5px solid #F59E0B',
          borderRadius: 'clamp(14px, 2vw, 22px)',
          padding: 'clamp(14px, 2vh, 22px) clamp(16px, 2.5vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(10px, 1.4vh, 14px)',
          boxShadow: door.id === 'A1'
            ? '0 24px 60px rgba(0, 0, 0, 0.85), inset 0 0 35px rgba(0, 0, 0, 0.7), inset 0 0 0 2px rgba(141, 84, 40, 0.35)'
            : '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
          boxSizing: 'border-box',
          color: '#FEF3C7',
        }}
      >
        {/* Decorative Viewfinder Brackets */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '3px 0 0 0' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 3px 0 0' }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '0 0 0 3px' }} />
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 0 3px 0' }} />

        {/* Header: Class Label + Dev Pass (Tulisan Bu Sari dihilangkan di Kelas VII-A) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {door.id !== 'A1' ? (
              <span style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1.5px solid #F59E0B',
                borderRadius: '999px',
                padding: '3px 12px',
                fontSize: 'clamp(11.5px, 1.3vw, 13.5px)',
                fontWeight: 900,
                color: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
              }}>
                <span>👩‍🏫</span>
                <span>{info.teacher}</span>
              </span>
            ) : (
              <span style={{
                fontSize: 'clamp(11.5px, 1.3vw, 13px)',
                fontWeight: 900,
                color: '#FDE047',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1.5px solid #F59E0B',
                padding: '4px 14px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span>🏫</span>
                <span>{door.label}</span>
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {door.id !== 'A1' && (
              <span style={{
                fontSize: 'clamp(10px, 1.2vw, 11.5px)',
                fontWeight: 800,
                color: '#0369A1',
                background: 'rgba(2, 132, 199, 0.12)',
                border: '1.5px solid rgba(2, 132, 199, 0.35)',
                padding: '3px 10px',
                borderRadius: '8px',
              }}>
                {door.label}
              </span>
            )}

            {/* Discreet Dev Pass Button (Commented out so player cannot see it) */}
            {/*
            <button
              data-testid="btn-dev-pass-wali-quiz"
              onClick={handleDevPass}
              style={{
                background: 'rgba(180, 83, 9, 0.1)',
                border: '1px solid #B45309',
                borderRadius: '6px',
                color: '#92400E',
                fontSize: '9.5px',
                fontWeight: 800,
                padding: '3px 8px',
                cursor: 'pointer',
              }}
              title="Shortcut Dev: Langsung selesaikan tantangan guru ini (Hotkey: [U])"
            >
              ⚡ Pass
            </button>
            */}
          </div>
        </div>

        {/* 1. Preview Tabel Data Siswa Kelas (Disembunyikan pada Kelas VII-A karena kuis kelereng mandiri) */}
        {door.id !== 'A1' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1.5px solid #F59E0B',
          borderRadius: '14px',
          padding: 'clamp(10px, 1.3vh, 14px)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35), inset 0 1px 2px rgba(251, 191, 36, 0.2)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
            fontSize: 'clamp(9.5px, 1.1vw, 11px)',
            color: '#FBBF24',
            fontWeight: 900,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
          }}>
            <span>📋 SAMPEL LEMBAR SURVEI KELAS ({info.students.length} SISWA)</span>
            <span style={{ color: '#38BDF8', fontWeight: 800 }}>SATUAN: JAM/HARI</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: info.students.length > 5 ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
            gap: 'clamp(6px, 0.8vw, 10px)',
          }}>
            {info.students.map((st, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '8px',
                  padding: 'clamp(4px, 0.6vh, 6px) clamp(6px, 0.8vw, 8px)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 'clamp(10px, 1.2vw, 12px)',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                }}
              >
                <span style={{ color: '#FEF3C7', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {st.name}
                </span>
                <span style={{
                  fontWeight: 900,
                  color: '#FDE047',
                  background: 'rgba(245, 158, 11, 0.22)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  border: '1px solid #F59E0B',
                  marginLeft: '4px',
                  whiteSpace: 'nowrap',
                  fontSize: 'clamp(9.5px, 1.05vw, 11px)',
                  flexShrink: 0,
                }}>
                  {st.time} jam
                </span>
              </div>
            ))}
          </div>
        </div>

        
        )}

        {/* 2. Kartu Tantangan Pre-Pembelajaran Guru ("Karena Kamu Telat...") */}
        <div style={{
          background: door.id === 'A1'
            ? 'linear-gradient(160deg, rgba(14, 38, 26, 0.92) 0%, rgba(8, 22, 15, 0.96) 100%)'
            : 'linear-gradient(145deg, rgba(35, 18, 12, 0.95) 0%, rgba(20, 10, 5, 0.98) 100%)',
          border: '1.8px solid #F59E0B',
          borderRadius: '14px',
          padding: 'clamp(10px, 1.4vh, 14px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(6px, 1vh, 10px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(251, 191, 36, 0.25)',
        }}>
          {/* Concept Header Badge (Disembunyikan pada Kelas VII-A agar modal minimalis tanpa noise) */}
          {door.id !== 'A1' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
              <span style={{
                fontSize: 'clamp(8.5px, 1vw, 10px)',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #B45309 0%, #D97706 100%)',
                border: '1px solid #F59E0B',
                color: '#FFFFFF',
                padding: '2px 10px',
                borderRadius: '999px',
                letterSpacing: '0.5px',
              }}>
                {quiz.conceptTag}
              </span>
            </div>
          )}

          {door.id === 'A1' ? (
            <MarbleBowlsChallenge
              onSuccess={() => {
                setIsCorrect(true)
                setSelectedAnswer(11)
                setIsLocked(false)
              }}
              isSolved={isCorrect === true}
            />
          ) : (
            <>
              {/* Teacher Dialogue & Prompt */}
              <div>
                <p style={{
                  margin: '0 0 6px',
                  fontSize: 'clamp(10px, 1.1vw, 11.5px)',
                  color: '#FDE68A',
                  fontWeight: 800,
                  fontStyle: 'italic',
                }}>
                  &ldquo;{quiz.introQuote}&rdquo;
                </p>
                <h4 style={{
                  margin: 0,
                  fontSize: 'clamp(12px, 1.4vw, 14px)',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  lineHeight: 1.4,
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
                }}>
                  {quiz.questionText}
                </h4>
              </div>

              {/* Options Grid (4 Pilihan Ganda) dengan Anti-Spam Protection */}
              <motion.div
                key={shake}
                animate={isCorrect === false ? { x: [-6, 6, -5, 5, 0] } : {}}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 'clamp(4px, 0.8vw, 8px)',
                }}
              >
                {currentOptions.map(opt => {
                  const isSelected = selectedAnswer === opt
                  const isSelectedCorrect = isSelected && isCorrect === true
                  const isSelectedWrong = isSelected && isCorrect === false
                  return (
                    <button
                      key={opt}
                      data-testid={`wali-quiz-option-${opt}`}
                      disabled={isCorrect === true || isLocked}
                      onClick={() => handleSelectOption(opt)}
                      style={{
                        padding: 'clamp(7px, 1vh, 11px) 4px',
                        borderRadius: '8px',
                        fontSize: 'clamp(11.5px, 1.3vw, 13.5px)',
                        fontWeight: 900,
                        cursor: (isCorrect === true || isLocked) ? 'not-allowed' : 'pointer',
                        opacity: isLocked ? 0.5 : 1,
                        border: isSelectedCorrect
                          ? '2px solid #10B981'
                          : isSelectedWrong
                          ? '2px solid #EF4444'
                          : '1.5px solid #F59E0B',
                        background: isSelectedCorrect
                          ? 'linear-gradient(180deg, #059669 0%, #047857 100%)'
                          : isSelectedWrong
                          ? 'linear-gradient(180deg, #DC2626 0%, #B91C1C 100%)'
                          : 'rgba(255, 255, 255, 0.08)',
                        color: isSelectedCorrect ? '#FFFFFF' : isSelectedWrong ? '#FFFFFF' : '#FEF3C7',
                        boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.4)' : '0 2px 5px rgba(0,0,0,0.2)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {opt} {quiz.unit} {isSelectedCorrect ? '✓' : isSelectedWrong ? '✕' : ''}
                    </button>
                  )
                })}
              </motion.div>
            </>
          )}

          {/* Cooldown Timer Bar when Locked (Anti-Spam) */}
          <AnimatePresence>
            {isLocked && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(239, 68, 68, 0.25)',
                  border: '1.5px solid #EF4444',
                  borderRadius: '8px',
                  padding: 'clamp(6px, 0.8vh, 9px) 12px',
                  color: '#FECACA',
                  fontSize: 'clamp(10px, 1.1vw, 12px)',
                  fontWeight: 800,
                }}
              >
                <span>⏳ Waktu berpikir: <strong style={{ color: '#FCD34D', fontSize: '13px' }}>{cooldownRemaining}s</strong></span>
                <span style={{ color: '#FEF3C7', opacity: 0.9 }}>• Perhatikan data dengan cermat sebelum menjawab!</span>
              </motion.div>
            )}

            {isCorrect === false && !isLocked && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1.5px solid #EF4444',
                  borderRadius: '8px',
                  padding: 'clamp(6px, 0.8vh, 9px) clamp(8px, 1vw, 12px)',
                  fontSize: 'clamp(10px, 1.1vw, 12px)',
                  color: '#FECACA',
                  fontWeight: 800,
                }}
              >
                <div>❌ Jawabanmu sebelumnya kurang tepat!</div>
                <div style={{ marginTop: '3px', color: '#FDE047', fontWeight: 700 }}>
                  💡 {quiz.hintText}
                </div>
              </motion.div>
            )}

            {isCorrect === true && door.id !== 'A1' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1.5px solid #10B981',
                  borderRadius: '8px',
                  padding: 'clamp(6px, 0.8vh, 10px) clamp(10px, 1.2vw, 14px)',
                  fontSize: 'clamp(10px, 1.1vw, 12px)',
                  color: '#A7F3D0',
                  fontWeight: 800,
                  lineHeight: 1.4,
                }}
              >
                🎉 {quiz.explanation}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
          <button
            data-testid="btn-close-wali-kelas"
            onClick={onClose}
            style={{
              flex: 1,
              padding: 'clamp(8px, 1.2vh, 12px) 14px',
              borderRadius: '12px',
              border: '1.5px solid #F59E0B',
              background: '#3D2419',
              color: '#FEF3C7',
              fontSize: 'clamp(10.5px, 1.2vw, 12.5px)',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            ← Batal
          </button>

          <button
            data-testid="btn-collect-wali-data"
            disabled={isCorrect !== true}
            onClick={() => {
              if (isCorrect !== true) return
              gameAudio.playItemCollect()
              onCollectData()
              onClose()
            }}
            style={{
              flex: 1.8,
              padding: 'clamp(8px, 1.2vh, 12px) 16px',
              borderRadius: '12px',
              border: isCorrect === true ? '1.5px solid #34D399' : '1.5px solid rgba(245, 158, 11, 0.25)',
              background: isCorrect === true
                ? 'linear-gradient(135deg, #059669 0%, #0284C7 100%)'
                : 'rgba(255, 255, 255, 0.05)',
              color: isCorrect === true ? '#FFFFFF' : '#A8A29E',
              fontSize: 'clamp(11px, 1.2vw, 13px)',
              fontWeight: 900,
              cursor: isCorrect === true ? 'pointer' : 'not-allowed',
              boxShadow: isCorrect === true ? '0 6px 20px rgba(5, 150, 105, 0.4)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>{isCorrect === true ? '📥' : '🔒'}</span>
            <span>{isCorrect === true ? 'Simpan Data ke Misi ➔' : 'Jawab Tantangan untuk Membuka Data'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
