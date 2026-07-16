'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import DiRA from './DiRA'

interface InfographicReaderProps {
  studentId: string
  levelId: number
  onComplete: () => void
}

const SLIDES = [
  {
    image: '/level2/infografis-1.png',
    alt: 'Riset Digital Civility Index (Microsoft, Mei 2020): Indonesia peringkat 1 negara paling tidak sopan se-Asia Pasifik. 27% pernah mengalami hate-speech, 43% dapat hoax/penipuan, 13% diskriminasi. 48% pelaku adalah orang asing (stranger). 24% mengalami perilaku tidak sopan digital dalam kurun 1 minggu terakhir. (n = 503 responden Indonesia)',
    title: '1. Perilaku Tidak Sopan Digital',
    diraDesc: 'Wah, memprihatinkan sekali Detektif! Hasil riset Microsoft (Mei 2020) menempatkan netizen Indonesia sebagai yang paling tidak sopan se-Asia Pasifik. Bahkan, 48% pelaku dari perilaku tidak sopan digital ini adalah orang asing (stranger). Yuk, pahami statistik ini!'
  },
  {
    image: '/level2/infografis-2.png',
    alt: 'Platform tempat cyberbullying terjadi: Instagram 42%, Facebook 37%, Snapchat 31%, WhatsApp 12%, YouTube 10%, Twitter 9%.',
    title: '2. Platform Tempat Cyberbullying Terjadi',
    diraDesc: 'Cyberbullying terjadi di mana-mana! Instagram memimpin di angka 42%, disusul Facebook 37%, Snapchat 31%, hingga Twitter 9%. Perhatikan porsi masing-masing media sosial ini ya, Detektif!'
  },
  {
    image: '/level2/infografis-3.png',
    alt: 'Tren kasus cyberbullying Indonesia 2018–2023: 2018: ~800, 2019: ~1250, 2020: ~2000, 2021: ~2500, 2022: ~3100, 2023: ~3750 kasus dilaporkan.',
    title: '3. Tren Kasus Cyberbullying Indonesia (2018–2023)',
    diraDesc: 'Grafik garis ini menunjukkan kenaikan yang konsisten dari tahun ke tahun. Di tahun 2018 dilaporkan ~800 kasus, dan di tahun 2023 melonjak pesat hingga mencapai ~3750 kasus dilaporkan. Kenaikan yang sangat signifikan!'
  },
  {
    image: '/level2/infografis-4.png',
    alt: 'Jenis-jenis cyberbullying: a. Pelanggaran Privasi — 18,5% rahasia disebarluaskan; 16,6% akun diakses tanpa izin. b. Pengecualian (eksklusi) — 36,1% mengalami pengucilan; 24,5% pesan diabaikan. c. Penguntitan — 33,5% mengaku dikuntit secara online. d. Fitnah/Pencemaran nama baik — 33,5% responden mengaku pernah menyamar sebagai seseorang dan menyebarkan info palsu; 10,9% responden mengaku ada orang lain yang berpura-pura jadi mereka dan melakukan hal buruk atas nama mereka di internet. e. Pelecehan Daring — 35,8% dihina/dilecehkan; 21,9% menerima hinaan seksual saat berinteraksi online. f. Kekerasan Seksual, Ancaman & Pemerasan Online — 9,1% diancam untuk mengirim foto.',
    title: '4. Jenis-Jenis Cyberbullying',
    diraDesc: 'Ini adalah jenis-jenis perundungan siber yang biasa ditemui: mulai dari eksklusi (pengucilan), penguntitan online, pelecehan daring, hingga fitnah/pencemaran nama baik. Mari kita pelajari kategorisasinya demi keselamatan bersama.'
  }
]

export default function InfographicReader({ studentId, levelId, onComplete }: InfographicReaderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showReflection, setShowReflection] = useState(false)
  const [reflection, setReflection] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submittedStatus, setSubmittedStatus] = useState(false)
  const [showDira, setShowDira] = useState(true)
  const [diraMsg, setDiraMsg] = useState(
    'Halo Detektif! Sebelum memulai penyelidikan cyberbullying di sekolah, yuk baca infografis kasus nasional ini. Klik tombol lanjut untuk beralih slide ya! 🕵️‍♂️'
  )

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      const nextSlide = currentSlide + 1
      setCurrentSlide(nextSlide)
      setDiraMsg(SLIDES[nextSlide].diraDesc)
      setShowDira(true)
    } else {
      setShowReflection(true)
      setDiraMsg('Dari infografis yang sudah kamu baca, apa yang dapat kamu simpulkan? Ketikkan jawabanmu di kolom chat berikut. Gurumu akan membaca apa yang kamu tulis dan memberikan penilaian.')
      setShowDira(true)
    }
  }

  const handlePrev = () => {
    if (currentSlide > 0) {
      const prevSlide = currentSlide - 1
      setCurrentSlide(prevSlide)
      setDiraMsg(SLIDES[prevSlide].diraDesc)
      setShowDira(true)
    }
  }

  const handleSubmitReflection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reflection.trim() || reflection.trim().length < 10) {
      alert('Tulis jawaban refleksimu dengan jelas minimal 10 karakter ya!')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/game/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          levelId,
          content: reflection.trim(),
        }),
      })

      if (res.ok) {
        setSubmittedStatus(true)
        setDiraMsg('Refleksi berhasil terkirim! Laporanmu sedang menunggu penilaian dari gurumu. Sekarang, mari kita lanjut ke sekolah untuk menyelidiki kasus nyata di lapangan! 🚀')
        setShowDira(true)
        setTimeout(() => {
          onComplete()
        }, 3500)
      } else {
        alert('Gagal mengirim refleksi. Silakan coba kembali.')
        setSubmitting(false)
      }
    } catch (err) {
      console.error('[InfographicReader] submit error:', err)
      alert('Koneksi terputus. Gagal mengirim refleksi.')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: 'calc(100vh - 120px)', justifyContent: 'center' }}>
      <AnimatePresence mode="wait">
        {!showReflection ? (
          <motion.div
            key={`slide-${currentSlide}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="game-card game-card-accent"
            style={{
              background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Header Slide */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--game-border)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                BERKAS INFOGRAFIS NASIONAL
              </span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                {currentSlide + 1} / {SLIDES.length}
              </span>
            </div>

            {/* Infographic Image Container */}
            <div style={{
              width: '100%',
              height: '340px',
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: '#04070a',
              border: '1px solid rgba(14, 131, 136, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Image
                src={SLIDES[currentSlide].image}
                alt={SLIDES[currentSlide].alt}
                fill
                priority
                style={{
                  objectFit: 'contain',
                }}
              />
            </div>

            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {SLIDES[currentSlide].title}
            </div>

            {/* Footer Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--game-border)', paddingTop: '16px', marginTop: '8px' }}>
              <button
                type="button"
                className="game-btn game-btn-secondary"
                onClick={handlePrev}
                disabled={currentSlide === 0}
                style={{
                  padding: '10px 20px',
                  fontSize: '13px',
                  opacity: currentSlide === 0 ? 0.3 : 1,
                  cursor: currentSlide === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                ← Kembali
              </button>

              {/* Progress Dots */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {SLIDES.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: currentSlide === i ? '20px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: currentSlide === i ? 'var(--accent)' : 'var(--text-muted)',
                      transition: 'all 0.25s'
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                className="game-btn game-btn-primary"
                onClick={handleNext}
                style={{
                  padding: '10px 24px',
                  fontSize: '13px',
                }}
              >
                {currentSlide === SLIDES.length - 1 ? 'Mulai Refleksi →' : 'Lanjut →'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reflection-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="game-card game-card-accent"
            style={{
              background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                TAHAP 3: REFLEKSI INVESTIGASI
              </span>
              <h2 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: 800 }}>Tulis Refleksimu</h2>
            </div>

            <form onSubmit={handleSubmitReflection} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid var(--game-border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                fontSize: '13px',
                lineHeight: 1.6,
                color: 'var(--text-secondary)'
              }}>
                <strong>Pertanyaan Refleksi:</strong><br />
                Dari infografis yang sudah kamu baca, apa yang dapat kamu simpulkan? Tuliskan kesimpulanmu tentang kondisi digital civility dan jenis perundungan siber di kolom bawah ini.
              </div>

              {submittedStatus ? (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid #10B981',
                  borderRadius: 'var(--radius-md)',
                  color: '#10B981',
                  fontWeight: 700,
                  fontSize: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <span>✓ Refleksi Terkirim!</span>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Status: Menunggu Penilaian Guru</span>
                </div>
              ) : (
                <>
                  <textarea
                    placeholder="Ketikkan refleksimu di sini... (Minimal 10 karakter)"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    disabled={submitting}
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1.5px solid var(--game-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      color: 'var(--text-primary)',
                      fontSize: '13.5px',
                      lineHeight: 1.5,
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'var(--font-ui)',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--game-border)'}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="game-btn game-btn-secondary"
                      onClick={() => setShowReflection(false)}
                      disabled={submitting}
                      style={{ padding: '10px 20px', fontSize: '13px' }}
                    >
                      ← Kembali ke Infografis
                    </button>

                    <button
                      type="submit"
                      className="game-btn game-btn-primary"
                      disabled={submitting || !reflection.trim()}
                      style={{
                        padding: '10px 24px',
                        fontSize: '13px',
                        opacity: reflection.trim() ? 1 : 0.5,
                        cursor: reflection.trim() ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {submitting ? 'Mengirim...' : 'Kirim Refleksi & Eksplorasi →'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {showDira && (
        <DiRA message={diraMsg} onDismiss={() => setShowDira(false)} />
      )}
    </div>
  )
}
