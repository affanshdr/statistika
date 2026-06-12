'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CutsceneProps {
  onComplete: () => void
}

const NARASI = [
  'Sebuah postingan viral meledak di TikTok dan X: "BREAKING: Remaja Indonesia rata-rata habiskan >8 jam sehari di medsos! Generasi cemas kecanduan HP!"',
  'Postingan itu dibagikan jutaan kali. Kolom komentar meledak dengan kemarahan dan kekhawatiran netizen dari berbagai penjuru Indonesia...',
  'Data screen time dari 35 siswa tersedia untuk dianalisis. Tugasmu: buat histogram, lihat distribusinya, dan tentukan apakah klaim tersebut benar-benar didukung data.',
  'Ingat pesan mentormu: "Jangan terbawa viral! Gunakan statistika untuk menemukan kebenaran. Berpikir kritis adalah senjata terkuatmu."',
]

const CUTSCENE_COMMENTS = [
  { user: '@yyu', text: 'Pantesan nilai TKA jeblok! 😤📚' },
  { user: '@t1ki', text: 'Pemerintah harus sita HP sekarang! 😡' },
  { user: '@Rakyat_Skeptis', text: 'Pantesan nilai rapor anak zaman sekarang jeblok semua. Isinya cuma joget-joget di TikTok doang!' },
  { user: '@Bunda_Khawatir99', text: 'Zaman dulu remaja sibuk OSIS sama belajar, sekarang dari bangun tidur sampai merem lagi matanya lengket sama layar. Miris 😢' },
  { user: '@Dedy_Brader', text: '8 jam? Itu mah minimal. Malah ada yang sampai begadang demi nge-game sama scroll feed gak jelas. Generasi cemas kecanduan gadget!' },
  { user: '@Andi_Tech_Savy', text: 'Efek dopamin instan. Otak remaja sekarang udah rusak sama algoritma video pendek.' },
  { user: '@Fitri_Zzz', text: 'Wkwk pantesan kalau diajak ngomong langsung gak nyambung, fokusnya cuma bertahan 5 detik gara-gara keseringan nonton short video.' },
]


function TypewriterText({ text, onDone }: { text: string; onDone: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)

  useEffect(() => {
    setDisplayed('')
    indexRef.current = 0
    const id = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1))
        indexRef.current++
      } else {
        clearInterval(id)
        setTimeout(onDone, 200)
      }
    }, 25)
    return () => clearInterval(id)
  }, [text, onDone])

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

  // Track window size for responsiveness
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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

    const handleEnded = () => {
      setAudioDone(true)
    }

    const handleError = () => {
      setAudioDone(true)
    }

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    audio.play().catch(err => {
      console.log('Audio autoplay blocked or file not found:', err)
      setAudioDone(true)
    })

    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.pause()
    }
  }, [paraIndex])

  // Sync mute state when user toggles volume button
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted
    }
  }, [isMuted])

  // Sync transition to next slide
  useEffect(() => {
    if (typingDone && audioDone) {
      if (paraIndex < NARASI.length - 1) {
        const timer = setTimeout(() => {
          setParaIndex(p => p + 1)
        }, 1200) // Small pause before next slide
        return () => clearTimeout(timer)
      } else {
        setDone(true)
      }
    }
  }, [typingDone, audioDone, paraIndex])

  return (
    <motion.div
      className="cutscene-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ overflowY: 'auto', padding: '40px 20px' }}
    >
      {/* Header controls (Mute & Skip) */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '12px', zIndex: 210 }}>
        <button
          className="game-btn game-btn-secondary"
          style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setIsMuted(prev => !prev)}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        <button className="game-btn game-btn-secondary" onClick={onComplete}>
          Skip ›
        </button>
      </div>

      {/* Main Grid Layout */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '32px',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '1000px',
        width: '100%',
        margin: 'auto',
        zIndex: 10
      }}>
        {/* Left Column: Logo & Narration Card */}
        <div style={{
          flex: 1.2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}>
          {/* Animated logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ marginBottom: '24px', textAlign: 'center' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '8px', animation: 'float 3s ease-in-out infinite' }}>📱</div>
            <div style={{
              fontSize: '11px', fontWeight: 800, letterSpacing: '3px',
              color: 'var(--accent)', opacity: 0.8
            }}>DIGITAL TRUTH SQUAD</div>
          </motion.div>

          {/* Narration box */}
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
                style={{ margin: 0, color: i < paraIndex ? 'rgba(255,255,255,0.4)' : '#fff', textAlign: 'left' }}
              >
                {i < paraIndex ? text : (
                  <TypewriterText text={text} onDone={() => setTypingDone(true)} />
                )}
              </motion.p>
            ))}
          </div>
        </div>

        {/* Right Column: TikTok Mockup Card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            flex: 0.8,
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}
        >
          <div className="tiktok-card" style={{ width: '100%', maxWidth: '320px' }}>
            <div className="tiktok-video">
              <div>
                <div style={{ fontSize: '32px', textAlign: 'center' }}>📱🔥</div>
                <div style={{ fontSize: '11px', color: '#ff0050', textAlign: 'center', fontWeight: 800, marginTop: '6px', letterSpacing: '1px' }}>
                  BREAKING NEWS
                </div>
                <div style={{ fontSize: '13px', color: '#eee', textAlign: 'center', marginTop: '8px', lineHeight: 1.5 }}>
                  Remaja Indonesia rata-rata habiskan <strong style={{ color: '#ff0050' }}>&gt;8 jam/hari</strong> di medsos! Generasi cemas kecanduan HP! 😱
                </div>
              </div>
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#ff0050', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                VIRAL 🔥
              </div>
            </div>
            <div className="tiktok-caption">
              <strong>@faktaviral.id</strong> BREAKING! Rata-rata &gt;8 jam/hari medsos! Nilai turun, kecanduan HP! Generasi cemas! #viral #screentime #generasiZ #breaking
            </div>

            
            {/* Comments list - only displays for Slide 2 (index 1) onwards */}
            {paraIndex >= 1 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {CUTSCENE_COMMENTS.map((c, i) => (
                  <motion.div
                    key={i}
                    className="tiktok-comment"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.4 }}
                    style={{ background: 'rgba(255,255,255,0.02)', color: '#eee', padding: '8px 14px' }}
                  >
                    <span style={{ color: 'var(--accent)', fontWeight: 700, marginRight: '6px' }}>{c.user}</span>
                    <span>{c.text}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Continue button when done */}
      <AnimatePresence>
        {done && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="game-btn game-btn-primary"
            style={{ marginTop: '32px', fontSize: '16px', padding: '16px 40px', zIndex: 20 }}
            onClick={onComplete}
          >
            Mulai Investigasi →
          </motion.button>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '24px', zIndex: 20 }}>
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

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </motion.div>
  )
}
