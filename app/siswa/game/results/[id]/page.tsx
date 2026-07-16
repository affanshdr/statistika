'use client'

import { use, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'
import * as Level1Data from '../../_data/level1'
import * as Level2Data from '../../_data/level2'
import '../../game.css'
import LkpdWorksheet from '../../_components/LkpdWorksheet'

import dynamic from 'next/dynamic'
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false })

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const levelId = parseInt(id) || 1
  const isLevel2 = levelId === 2
  
  const levelData = isLevel2 ? Level2Data : Level1Data
  const config = isLevel2 ? Level2Data.LEVEL2_CONFIG : Level1Data.LEVEL1_CONFIG
  const correctVerdict = levelData.CORRECT_VERDICT
  const verdictExplanation = levelData.VERDICT_EXPLANATION
  const badgesDef = Object.values(levelData.BADGES)

  const router = useRouter()
  const store = useGameStore()
  const savedRef = useRef(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [confetti, setConfetti] = useState(false)
  const [showContent, setShowContent] = useState(false)
  
  const [studentInfo, setStudentInfo] = useState<any>(null)
  const [lkpdCompleted, setLkpdCompleted] = useState(false)
  const [checkingLkpd, setCheckingLkpd] = useState(true)

  const [hasViewedBukuSaku, setHasViewedBukuSaku] = useState(false)
  const [showBukuSakuModal, setShowBukuSakuModal] = useState(false)

  const isCorrect = store.verdictAnswer === correctVerdict

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('student')
        if (raw) {
          const s = JSON.parse(raw)
          setStudentInfo(s)
          
          // Check if LKPD is already completed
          fetch(`/api/game/lkpd?studentId=${s.id}&levelId=${levelId}`)
            .then((res) => {
              if (res.ok) {
                setLkpdCompleted(true)
                setShowContent(true)
              }
            })
            .catch(console.error)
            .finally(() => setCheckingLkpd(false))
        } else {
          setCheckingLkpd(false)
        }
      } catch (e) {
        setCheckingLkpd(false)
      }
    }
  }, [levelId])

  const handleLkpdSubmit = async (answers: any) => {
    if (!studentInfo?.id) return

    try {
      const res = await fetch('/api/game/lkpd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentInfo.id,
          levelId,
          answers,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.xpAdded) {
          store.addXP(data.xpAdded, 'Mengisi LKPD Level 1', 10)
        }
        setLkpdCompleted(true)
        if (isCorrect) setConfetti(true)
        setTimeout(() => {
          setConfetti(false)
          setShowContent(true)
        }, 2500)
      } else {
        alert('Gagal mengirim LKPD. Silakan coba lagi.')
      }
    } catch (e) {
      console.error(e)
      alert('Terjadi kesalahan saat mengirim LKPD.')
    }
  }

  // Save session to DB + update leaderboard once
  useEffect(() => {
    if (savedRef.current) return
    savedRef.current = true

    const student = JSON.parse(localStorage.getItem('student') ?? '{}')
    if (!student.id) return

    const elapsed = store.sessionStartTime
      ? Math.floor((Date.now() - store.sessionStartTime) / 1000)
      : 0

    fetch('/api/game/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        levelId: levelId,
        cognitiveStyle: store.cognitiveStyle,
        xpEarned: store.xp,
        livesRemaining: store.lives,
        timeTaken: elapsed,
        verdictAnswer: store.verdictAnswer ?? '',
        isCorrect,
      }),
    }).catch(console.error)

    fetch('/api/game/leaderboard', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        username: student.name,
        xpToAdd: store.xp,
        newBadges: store.badges,
      }),
    }).catch(console.error)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const newBadges = store.badges
    .map(badgeId => badgesDef.find(b => b.id === badgeId))
    .filter(Boolean)

  const handleDownloadBukuSaku = async () => {
    try {
      const url = 'https://tmdbqikqflbeqaqllxge.supabase.co/storage/v1/object/public/Asset/Buku%20Saku.jpeg'
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `Buku Saku Level ${levelId}.jpeg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      // Fallback: open in new tab
      window.open('https://tmdbqikqflbeqaqllxge.supabase.co/storage/v1/object/public/Asset/Buku%20Saku.jpeg', '_blank')
    }
  }

  if (checkingLkpd) {
    return (
      <div className="game-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '12px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>Memuat data LKPD...</p>
      </div>
    )
  }

  if (!lkpdCompleted) {
    return (
      <div className="game-root" style={{ minHeight: '100vh', padding: '32px 16px', overflowY: 'auto' }}>
        {confetti && (
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            colors={['#D97706', '#EA580C', '#FFD700', '#FF6B35', '#fff']}
            numberOfPieces={200}
            gravity={0.15}
          />
        )}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#F8FAFC', margin: '0 0 6px' }}>
            Investigasi Selesai!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Lengkapi LKPD di bawah ini untuk merangkum penyelidikanmu sebelum melihat lencana investigasi.
          </p>
        </div>
        <LkpdWorksheet
          studentName={studentInfo?.name}
          studentClass={studentInfo?.classroom?.name || 'X'}
          onSubmit={handleLkpdSubmit}
        />
      </div>
    )
  }

  return (
    <div className="game-root" style={{ minHeight: '100vh' }}>
      {confetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          colors={['#D97706', '#EA580C', '#FFD700', '#FF6B35', '#fff']}
          numberOfPieces={200}
          gravity={0.15}
        />
      )}

      {/* Header */}
      <header style={{
        padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(11, 30, 44, 0.95)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
        color: '#F8FAFC',
      }}>
        <div style={{ fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <motion.img
            src="/dira-avatar.png"
            alt="DiRA"
            style={{ height: '32px', objectFit: 'contain' }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          />
          Mission Report
        </div>
        <button
          className="game-btn game-btn-secondary"
          style={{ fontSize: '13px', padding: '8px 16px' }}
          onClick={() => router.push('/siswa')}
        >
          ← Dashboard
        </button>
      </header>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px 48px', position: 'relative', zIndex: 1 }}>

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '36px' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
            style={{ fontSize: '72px', marginBottom: '12px', lineHeight: 1 }}
          >
            {isCorrect ? '🏆' : '📋'}
          </motion.div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px' }}>
            {isCorrect ? 'Investigasi Selesai!' : 'Level Selesai'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 4px' }}>
            {config.title}
          </p>
        </motion.div>

        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >

              {/* ── Badge yang diperoleh ── */}
              {newBadges.length > 0 && (
                <motion.div
                  className="game-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '16px' }}>
                    🏅 BADGE YANG DIPEROLEH
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {newBadges.map((badge, i) => badge && (
                      <motion.div
                        key={badge.id}
                        initial={{ scale: 0, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 300 }}
                        style={{
                          textAlign: 'center', padding: '16px 20px',
                          background: 'var(--accent-dim)',
                          border: '1px solid var(--game-border-accent)',
                          borderRadius: '16px', minWidth: '110px',
                          flex: '1 1 110px', maxWidth: '160px',
                        }}
                      >
                        <div style={{ fontSize: '34px', marginBottom: '6px' }}>{badge.icon}</div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)' }}>{badge.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.4 }}>{badge.desc}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Analisis Verdict ── */}
              <motion.div
                className="game-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '4px' }}>
                  🔍 ANALISIS VERDICT
                </div>
                <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
                  <strong style={{ color: '#CBD5E1' }}>Verdict</strong> adalah kesimpulan akhir dari analisis data — apakah klaim berita bisa dipercaya, menyesatkan, atau hoaks berdasarkan bukti statistik yang kamu temukan.
                </p>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  {/* Verdictmu */}
                  <div style={{
                    flex: 1, padding: '12px 16px',
                    background: isCorrect ? 'rgba(217,119,6,0.06)' : 'rgba(239,68,68,0.06)',
                    border: `1px solid ${isCorrect ? 'rgba(217,119,6,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    borderRadius: '12px', minWidth: '130px',
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>VERDICTMU</div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: isCorrect ? 'var(--accent)' : 'var(--danger)' }}>
                      {store.verdictAnswer ?? '—'} {isCorrect ? '✅' : '❌'}
                    </div>
                  </div>
                  {/* Verdict benar */}
                  <div style={{
                    flex: 1, padding: '12px 16px',
                    background: 'rgba(217,119,6,0.06)',
                    border: '1px solid rgba(217,119,6,0.25)',
                    borderRadius: '12px', minWidth: '130px',
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>VERDICT BENAR</div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--accent)' }}>
                      {isLevel2 ? 'SERIOUS_PROBLEM ⚠️' : 'MISLEADING ⚠️'}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '14px', background: 'rgba(217,119,6,0.06)',
                  border: '1px solid var(--game-border-accent)', borderRadius: '10px',
                  fontSize: '13px', lineHeight: 1.7, color: '#F8FAFC',
                }}
                  dangerouslySetInnerHTML={{ __html: `<strong>Penjelasan:</strong> ${verdictExplanation}` }}
                />
              </motion.div>

              {/* ── Ringkasan Investigasi ── */}
              <motion.div
                className="game-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '12px' }}>
                  📌 RINGKASAN INVESTIGASI
                </div>
                {!isLevel2 ? (
                  <>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', lineHeight: 1.75, color: '#F1F5F9' }}>
                      Dalam investigasi ini, kamu menganalisis data <em>screen time</em> dari <strong>35 siswa</strong> untuk memverifikasi klaim viral:{' '}
                      <em>&quot;Remaja Indonesia rata-rata habiskan &gt;8 jam/hari di medsos.&quot;</em>
                    </p>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', lineHeight: 1.75, color: '#F1F5F9' }}>
                      Setelah menyusun <strong>histogram distribusi frekuensi</strong> dan menghitung statistik dasar, ditemukan bahwa nilai mean sebenarnya jauh di bawah 8 jam. Klaim tersebut terbukti{' '}
                      <strong style={{ color: 'var(--warning)' }}>MISLEADING</strong> — angka yang digunakan dalam berita distorsi oleh data ekstrem (outlier).
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.75, color: '#F1F5F9' }}>
                      Ini adalah contoh nyata <strong>sampling bias</strong> dan manipulasi statistik dalam berita viral. Kemampuan membaca data seperti ini adalah senjata utama seorang detektif literasi digital!
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', lineHeight: 1.75, color: '#F1F5F9' }}>
                      Dalam investigasi ini, kamu mengumpulkan data kasus cyberbullying dari <strong>30 korban</strong> di berbagai lokasi sekolah untuk memahami penyebaran masalah perundungan siber.
                    </p>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', lineHeight: 1.75, color: '#F1F5F9' }}>
                      Setelah menghitung nilai Mean (8.3), Median (8.5), dan Modus (4), disimpulkan bahwa cyberbullying di sekolah adalah <strong style={{ color: 'var(--warning)' }}>MASALAH SERIUS (SERIOUS PROBLEM)</strong> yang menyebar luas, karena mayoritas korban mengalami tingkat perundungan yang tinggi meskipun nilai paling umumnya (modus) bernilai rendah.
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.75, color: '#F1F5F9' }}>
                      Penyelidikan ini memberikan bimbingan bagi pelaku dan kesadaran pentingnya etika media sosial serta literasi digital untuk menghentikan mata rantai cyberbullying di sekolah.
                    </p>
                  </>
                )}
              </motion.div>

              {/* ── Download Buku Saku ── */}
              <motion.div
                className="game-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(217,119,6,0.06) 0%, rgba(0,180,200,0.06) 100%)',
                  border: '1px solid rgba(217,119,6,0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '6px' }}>
                      📖 BUKU SAKU DETEKTIF
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>
                      Simpan rangkuman konsep statistika, rumus kunci, dan tips membaca data sebagai referensimu!
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setShowBukuSakuModal(true)
                        setHasViewedBukuSaku(true)
                      }}
                      style={{
                        padding: '12px 22px',
                        borderRadius: '12px',
                        border: '1px solid var(--accent)',
                        background: 'rgba(14, 131, 136, 0.1)',
                        color: 'var(--accent)',
                        fontSize: '13px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      👁️ Lihat
                    </motion.button>

                    <motion.button
                      whileHover={hasViewedBukuSaku ? { scale: 1.04 } : {}}
                      whileTap={hasViewedBukuSaku ? { scale: 0.96 } : {}}
                      onClick={hasViewedBukuSaku ? handleDownloadBukuSaku : undefined}
                      disabled={!hasViewedBukuSaku}
                      style={{
                        padding: '12px 22px',
                        borderRadius: '12px',
                        border: 'none',
                        background: hasViewedBukuSaku 
                          ? 'linear-gradient(90deg, #D97706, #EA580C)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        color: hasViewedBukuSaku ? '#fff' : 'var(--text-muted)',
                        fontSize: '13px',
                        fontWeight: 800,
                        cursor: hasViewedBukuSaku ? 'pointer' : 'not-allowed',
                        boxShadow: hasViewedBukuSaku ? '0 4px 20px rgba(217,119,6,0.35)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: hasViewedBukuSaku ? 1 : 0.5,
                        transition: 'all 0.2s',
                      }}
                    >
                      ⬇️ Download PNG
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* ── Action — Kembali ke Lobby / Post Test ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', paddingTop: '8px' }}
              >
                {!store.completedPostTests?.includes(levelId) ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push(`/siswa/game/posttest/${levelId}`)}
                    style={{
                      padding: '14px 40px',
                      fontSize: '15px',
                      fontWeight: 800,
                      borderRadius: '14px',
                      border: 'none',
                      background: 'linear-gradient(90deg, #D97706, #EA580C)',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(217,119,6,0.35)',
                    }}
                  >
                    Mulai Post Test →
                  </motion.button>
                ) : (
                  <motion.button
                    className="game-btn game-btn-primary"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push('/')}
                    style={{ padding: '14px 40px', fontSize: '15px', fontWeight: 800, borderRadius: '14px' }}
                  >
                    ← Kembali ke Beranda
                  </motion.button>
                )}
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Buku Saku Modal Overlay */}
      {showBukuSakuModal && (
        <div 
          onClick={() => setShowBukuSakuModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(11, 30, 44, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '600px',
              width: '100%',
              background: '#0F2338',
              border: '2px solid rgba(14, 131, 136, 0.4)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), var(--accent-glow)',
              borderRadius: '24px',
              padding: '24px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            {/* Modal Header */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--accent)' }}>
                📖 Buku Saku Detektif
              </h3>
              <button 
                onClick={() => setShowBukuSakuModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '20px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Image */}
            <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://tmdbqikqflbeqaqllxge.supabase.co/storage/v1/object/public/Asset/Buku%20Saku.jpeg" 
                alt="Buku Saku" 
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button
                onClick={() => setShowBukuSakuModal(false)}
                className="game-btn game-btn-secondary"
                style={{ flex: 1, padding: '12px' }}
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  handleDownloadBukuSaku()
                }}
                className="game-btn game-btn-primary"
                style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                ⬇️ Download PNG
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
