'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CutsceneProps {
  onComplete: () => void
}

const NARASI = [
  'Sebuah postingan viral meledak di Instagram: "BREAKING: Remaja Indonesia rata-rata habiskan >8 jam sehari di medsos! Generasi cemas kecanduan HP!"',
  'Kolom komentar meledak dengan kemarahan dan kekhawatiran netizen dari berbagai penjuru Indonesia...',
]

const CUTSCENE_COMMENTS = [
  { user: '@yyu', text: 'Pantesan nilai TKA jeblok!' },
  { user: '@t1ki', text: 'Pemerintah harus sita HP' },
  { user: '@Rakyat_Skeptis', text: 'Pantesan nilai rapor anak zaman sekarang jeblok semua. Isinya cuma joget-joget di TikTok doang!' },
  { user: '@Bunda_Khawatir99', text: 'Zaman dulu remaja sibuk OSIS sama belajar, zaman sekarang dari bangun tidur sampai merem lagi matanya lengket sama layar. Miris 😢' },
  { user: '@Dedy_Brader', text: '8 jam? Itu mah minimal. Malah ada yang sampai begadang demi nge-game sama scroll feed gak jelas. Generasi cemas kecanduan gadget!' },
  { user: '@Andi_Tech_Savy', text: 'Efek dopamin instan. Otak remaja sekarang udah rusak sama algoritma video pendek.' },
  { user: '@Fitri_Zzz', text: 'Wkwk pantesan kalau diajak ngomong langsung gak nyambung, fokusnya cuma bertahan 5 detik gara-gara keseringan nonton short video.' },
]

function TypewriterText({ text, onDone }: { text: string; onDone: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)
  const onDoneRef = useRef(onDone)

  // Update ref when onDone changes without triggering the typewriter effect
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    setDisplayed('')
    indexRef.current = 0
    const id = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1))
        indexRef.current++
      } else {
        clearInterval(id)
        setTimeout(() => {
          onDoneRef.current()
        }, 200)
      }
    }, 22)
    return () => clearInterval(id)
  }, [text])

  return (
    <span>{displayed}<span style={{ animation: 'blink 1s infinite', color: 'var(--accent)' }}>|</span></span>
  )
}

export default function Cutscene({ onComplete }: CutsceneProps) {
  const [paraIndex, setParaIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [audioDone, setAudioDone] = useState(false)
  const [typingDone, setTypingDone] = useState(false)
  const [showComments, setShowComments] = useState(true)

  // Track window size for responsiveness
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 680)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    setAudioDone(false)
    setTypingDone(false)

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audioUrl = `/audio/cutscene_${paraIndex + 1}.mp3`
    const audio = new Audio(audioUrl)
    audio.muted = isMuted
    audioRef.current = audio

    const handleEnded = () => { setAudioDone(true) }
    const handleError = () => { setAudioDone(true) }

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    audio.play().catch(() => { setAudioDone(true) })

    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.pause()
    }
  }, [paraIndex])

  // Sync mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted
    }
  }, [isMuted])

  // Advance or complete
  useEffect(() => {
    if (typingDone && audioDone) {
      if (paraIndex < NARASI.length - 1) {
        const timer = setTimeout(() => {
          setParaIndex(p => p + 1)
        }, 1000)
        return () => clearTimeout(timer)
      } else {
        setDone(true)
      }
    }
  }, [typingDone, audioDone, paraIndex])

  // Determine if we're on the mentor slide (last slide)
  const isMentorSlide = paraIndex === NARASI.length - 1

  return (
    <motion.div
      className="cutscene-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header controls (Mute) */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '12px', zIndex: 210 }}>
        <button
          className="game-btn game-btn-secondary"
          style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setIsMuted(prev => !prev)}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>


      {/* Main Grid Layout */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '32px',
        alignItems: isMobile ? 'center' : 'stretch',
        justifyContent: 'center',
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        zIndex: 10
      }}>

        {/* Left Column: Instagram/Social Media Mockup Card */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            flex: 0.8,
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}
        >
          <div className="instagram-card" style={{
            width: '100%',
            maxWidth: '340px',
            maxHeight: '480px',
            overflowY: 'auto',
            background: '#000',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            color: '#fff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              position: 'sticky',
              top: 0,
              background: '#000',
              zIndex: 5
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Gradient avatar ring */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '12px',
                    color: '#000'
                  }}>
                    P
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>pinterpolitik</span>
                  {/* Verified Badge */}
                  <svg viewBox="0 0 24 24" width="12" height="12" style={{ fill: '#3897f0', marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }}>
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
              </div>
              <div style={{ color: '#fff', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>•••</div>
            </div>

            {/* Post Image Body */}
            <motion.div
              style={{
                background: '#fff',
                position: 'relative',
                height: '300px',
                overflow: 'hidden',
                display: 'flex',
                color: '#000',
              }}
              animate={paraIndex === 0 ? {
                boxShadow: ['inset 0 0 0px rgba(239,68,68,0)', 'inset 0 0 20px rgba(239,68,68,0.7)', 'inset 0 0 0px rgba(239,68,68,0)'],
              } : {}}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              {/* Left Text */}
              <div style={{
                flex: 1,
                padding: '24px 0px 24px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                zIndex: 2,
                lineHeight: 1.1,
              }}>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: '#c90000',
                  fontFamily: 'Impact, "Arial Black", sans-serif',
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                }}>
                  BREAKING:
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#000',
                  fontFamily: '"Arial Narrow", Arial, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.5px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}>
                  <span>Remaja Indonesia</span>
                  <span>rata-rata</span>
                  <span>habiskan</span>
                  <span style={{ color: '#c90000' }}>&gt;8 jam</span>
                  <span style={{ color: '#c90000' }}>sehari di</span>
                  <span style={{ color: '#c90000' }}>medsos!</span>
                  <span style={{ marginTop: '6px', fontSize: '15px', fontWeight: 800 }}>Generasi cemas</span>
                  <span style={{ fontSize: '15px', fontWeight: 800 }}>kecanduan HP!</span>
                </div>
              </div>

              {/* Right Silhouette Image */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60%',
                height: '100%',
                zIndex: 1,
              }}>
                <img
                  src="/teen_silhouette.png"
                  alt="Teen Silhouette"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
              </div>
            </motion.div>

            {/* Actions Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 14px 8px',
            }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span style={{ cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ❤️ <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff' }}>12,9rb</span>
                </span>
                <span 
                  onClick={() => setShowComments(prev => !prev)}
                  style={{
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    animation: (!showComments && paraIndex >= 1) ? 'pulse-comment 1.5s infinite' : 'none',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: showComments ? 'rgba(255,255,255,0.08)' : 'transparent',
                    border: showComments ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  💬 <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff' }}>1.134</span>
                </span>
                <span style={{ cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ✈️ <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff' }}>3.560</span>
                </span>
              </div>
              <span style={{ cursor: 'pointer', fontSize: '16px' }}>🔖</span>
            </div>

            {/* Caption Info */}
            <div style={{
              padding: '0 14px 14px',
              fontSize: '12px',
              lineHeight: 1.4,
              color: '#fff',
            }}>
              <div style={{ marginBottom: '6px', color: '#fff' }}>
                Disukai oleh <strong>edukasi.kompas</strong> dan <strong>lainnya</strong>
              </div>
              <div>
                <strong>pinterpolitik</strong> Sebuah studi terbaru mengungkap fakta mencengangkan: remaja Indonesia rata-rata menghabiskan lebih dari 8 jam sehari di media sosial!... <span style={{ color: '#fff', cursor: 'pointer' }}>selengkapnya</span>
              </div>
              
              <div 
                onClick={() => setShowComments(prev => !prev)}
                style={{
                  color: showComments ? '#3897f0' : '#fff',
                  marginTop: '6px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: showComments ? 700 : 500,
                  display: 'inline-block',
                  transition: 'all 0.2s',
                }}
              >
                {showComments ? 'Sembunyikan komentar' : 'Lihat semua komentar'}
              </div>
            </div>

            {/* Comments list - only displays when showComments is true */}
            {showComments && (
              <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                {CUTSCENE_COMMENTS.map((c, i) => (
                  <motion.div
                    key={i}
                    className="tiktok-comment"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    style={{
                      background: 'rgba(255,255,255,0.01)',
                      color: '#fff',
                      padding: '8px 14px',
                      fontSize: '11.5px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <span style={{ color: '#3897f0', fontWeight: 700, marginRight: '6px' }}>{c.user}</span>
                    <span style={{ color: '#fff' }}>{c.text}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column: Narration Card & Mentor Card & Action button */}
        <div style={{
          flex: 1.2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          width: '100%',
        }}>
          {/* Narration box (hidden when Dira dialog is active) */}
          {!isMentorSlide && (
            <div style={{
              background: 'rgba(0,255,136,0.04)',
              border: '1px solid var(--game-border-accent)',
              borderRadius: '20px',
              padding: '30px',
              width: '100%',
              minHeight: '220px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {NARASI.slice(0, paraIndex + 1).map((text, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="cutscene-text"
                  style={{ margin: 0, color: '#fff', textAlign: 'left' }}
                >
                  {i < paraIndex ? text : (
                    <TypewriterText text={text} onDone={() => setTypingDone(true)} />
                  )}
                </motion.p>
              ))}
            </div>
          )}

          {/* Dira Appears on last slide */}
          <AnimatePresence>
            {isMentorSlide && (
              <motion.div
                key="mentor-slide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  marginTop: '0px', width: '100%',
                  display: 'flex', gap: '16px', alignItems: 'flex-start',
                  padding: '24px 28px', borderRadius: '20px',
                  background: 'rgba(0,255,136,0.06)',
                  border: '1px solid rgba(0,255,136,0.3)',
                  boxShadow: '0 4px 20px rgba(0, 255, 136, 0.05)',
                  minHeight: '220px',
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <img
                    src="/dira-avatar.png"
                    alt="Dira"
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      border: '2px solid var(--accent)',
                      boxShadow: 'var(--accent-glow)',
                      objectFit: 'cover',
                      animation: 'float 2.5s ease-in-out infinite',
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '8px' }}>
                    ASISTEN DIRA:
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                    &quot;
                    {typingDone ? (
                      <span>
                        Tunggu dulu... Benar nggak sih klaim ini? Jangan langsung kemakan emosi netizen. Kita punya data screen time dari sampel 35 siswa acak.{' '}
                        <strong style={{ color: '#00FF88' }}>Yuk, kita uji validitasnya!</strong>
                      </span>
                    ) : (
                      <TypewriterText 
                        text="Tunggu dulu... Benar nggak sih klaim ini? Jangan langsung kemakan emosi netizen. Kita punya data screen time dari sampel 35 siswa acak. Yuk, kita uji validitasnya!" 
                        onDone={() => setTypingDone(true)} 
                      />
                    )}
                    &quot;
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Continue button when done */}
          <AnimatePresence>
            {done && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="game-btn game-btn-primary"
                style={{ marginTop: '24px', fontSize: '16px', padding: '16px 40px', zIndex: 20, alignSelf: 'center' }}
                onClick={onComplete}
              >
                Mulai Investigasi →
              </motion.button>
            )}
          </AnimatePresence>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px', zIndex: 20, alignSelf: 'center' }}>
            {NARASI.map((_, i) => (
              <div key={i} style={{
                width: i === paraIndex ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i <= paraIndex ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>
      </div>



      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulse-comment {
          0%, 100% { border-color: rgba(0, 255, 136, 0.2); background: rgba(0, 255, 136, 0); }
          50% { border-color: rgba(0, 255, 136, 0.8); background: rgba(0, 255, 136, 0.15); box-shadow: 0 0 10px rgba(0, 255, 136, 0.3); }
        }
      `}</style>
    </motion.div>
  )
}
