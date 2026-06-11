'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CutsceneProps {
  onComplete: () => void
}

const NARASI = [
  'Sebuah postingan viral mengklaim: "Remaja Indonesia rata-rata menghabiskan lebih dari 8 jam sehari di media sosial!"',
  'Postingan itu dibagikan jutaan kali. Komentar membanjiri: "Pantesan nilai turun!", "Generasi kecanduan HP!", "Harus dibatasi pemerintah!"',
  'Data screen time 40 siswa tersedia untuk dianalisis. Tugasmu: buat histogram, lihat distribusinya, dan tentukan apakah klaim tersebut benar-benar didukung data.',
  'Berpikirlah kritis sebelum menerima generalisasi. Gunakan statistika untuk menemukan kebenaran — jangan terbawa viral!',
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
        setTimeout(onDone, 800)
      }
    }, 30)
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
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Hentikan audio sebelumnya jika sedang berjalan
    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audioUrl = `/audio/cutscene_${paraIndex + 1}.mp3`
    const audio = new Audio(audioUrl)
    audio.muted = isMuted
    audioRef.current = audio

    audio.play().catch(err => {
      // Abaikan error jika file audio belum digenerate atau autoplay diblokir browser
      console.log('Audio autoplay blocked or file not found:', err)
    })

    return () => {
      audio.pause()
    }
  }, [paraIndex])

  // Sync mute state saat user menekan tombol volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted
    }
  }, [isMuted])

  const handleParaDone = () => {
    if (paraIndex < NARASI.length - 1) {
      setTimeout(() => setParaIndex(p => p + 1), 400)
    } else {
      setDone(true)
    }
  }

  return (
    <motion.div
      className="cutscene-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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

      {/* Animated logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ marginBottom: '48px', textAlign: 'center' }}
      >
        <div style={{ fontSize: '64px', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>📱</div>
        <div style={{
          fontSize: '11px', fontWeight: 800, letterSpacing: '3px',
          color: 'var(--accent)', opacity: 0.8
        }}>DIGITAL TRUTH SQUAD</div>
      </motion.div>

      {/* Narration text area */}
      <div style={{
        background: 'rgba(0,255,136,0.04)',
        border: '1px solid var(--game-border-accent)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '680px',
        width: '100%',
        minHeight: '160px',
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
            style={{ margin: 0, color: i < paraIndex ? 'rgba(255,255,255,0.4)' : '#fff' }}
          >
            {i < paraIndex ? text : (
              <TypewriterText text={text} onDone={handleParaDone} />
            )}
          </motion.p>
        ))}
      </div>

      {/* Continue button when done */}
      <AnimatePresence>
        {done && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="game-btn game-btn-primary"
            style={{ marginTop: '32px', fontSize: '16px', padding: '16px 40px' }}
            onClick={onComplete}
          >
            Mulai Investigasi →
          </motion.button>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
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
