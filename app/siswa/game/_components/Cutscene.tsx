'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Animated game background ─── */
function GameBackground() {
  const particles = useMemo(() => {
    return Array.from({ length: 38 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 18 + 10,
      delay: Math.random() * 12,
      opacity: Math.random() * 0.55 + 0.15,
      color: ['#818cf8','#c084fc','#38bdf8','#34d399','#fb7185'][Math.floor(Math.random() * 5)],
    }))
  }, [])

  const bokeh = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: [8, 18, 35, 52, 68, 80, 90, 95][i],
      y: [15, 72, 30, 82, 20, 60, 40, 78][i],
      size: [120, 90, 160, 70, 140, 110, 85, 130][i],
      color: ['rgba(129,140,248,0.12)','rgba(192,132,252,0.1)','rgba(56,189,248,0.09)','rgba(52,211,153,0.08)','rgba(251,113,133,0.1)','rgba(129,140,248,0.08)','rgba(192,132,252,0.12)','rgba(56,189,248,0.1)'][i],
      duration: [8,11,9,13,7,10,12,8][i],
    }))
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {/* Base gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, #0d0221 0%, #0a0f2e 25%, #0d1b3e 50%, #0a1628 75%, #07091c 100%)',
      }} />

      {/* Neon grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage:
          'linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px)',
        backgroundSize: '52px 52px',
        animation: 'grid-drift 30s linear infinite',
      }} />

      {/* Radial spotlight at center-top */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 65% 50% at 50% 0%, rgba(129,140,248,0.18) 0%, transparent 70%)',
      }} />
      {/* Bottom glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 90% 30% at 50% 100%, rgba(30,27,75,0.9) 0%, transparent 70%)',
      }} />

      {/* Bokeh blobs */}
      {bokeh.map(b => (
        <div
          key={b.id}
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            borderRadius: '50%',
            background: b.color,
            filter: 'blur(40px)',
            animation: `bokeh-drift ${b.duration}s ease-in-out infinite alternate`,
            animationDelay: `${b.id * 1.3}s`,
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animation: `particle-float ${p.duration}s ease-in-out infinite`,
            animationDelay: `-${p.delay}s`,
          }}
        />
      ))}

      {/* Cityscape silhouette */}
      <svg
        viewBox="0 0 1440 220"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '220px',
          opacity: 0.55,
        }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="cityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        {/* Back buildings */}
        <path d="M0,180 L0,220 L1440,220 L1440,160 L1380,160 L1380,80 L1360,80 L1360,160 L1300,160 L1300,50 L1270,50 L1270,160 L1220,160 L1220,100 L1200,100 L1200,160 L1150,160 L1150,70 L1120,70 L1120,40 L1100,40 L1100,160 L1050,160 L1050,90 L1030,90 L1030,160 L980,160 L980,60 L950,60 L950,160 L900,160 L900,110 L880,110 L880,160 L820,160 L820,45 L800,45 L800,160 L760,160 L760,80 L740,80 L740,160 L690,160 L690,55 L660,55 L660,160 L610,160 L610,95 L590,95 L590,160 L540,160 L540,65 L510,65 L510,160 L460,160 L460,85 L440,85 L440,160 L380,160 L380,50 L360,50 L360,160 L300,160 L300,75 L280,75 L280,160 L220,160 L220,40 L200,40 L200,160 L140,160 L140,90 L120,90 L120,160 L60,160 L60,65 L40,65 L40,160 L0,160 Z" fill="url(#cityGrad)" />
        {/* Window lights */}
        {[120,125,128,200,205,208,285,290,365,370,450,455,515,520,595,600,665,670,750,755,810,815,960,965,1105,1110,1225,1230,1285,1290,1305,1310].map((wx, i) => (
          <rect
            key={i}
            x={wx}
            y={[95,105,118,48,60,72,82,95,58,75,92,108,72,85,102,115,62,78,88,100,52,65,68,82,48,58,78,92,58,68,48,62][i] || 60}
            width="6"
            height="5"
            fill={['#818cf8','#c084fc','#38bdf8','#34d399'][i % 4]}
            opacity={0.7}
            style={{ animation: `win-blink ${2 + (i % 3)}s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }}
          />
        ))}
        {/* Neon horizon line */}
        <line x1="0" y1="160" x2="1440" y2="160" stroke="rgba(99,102,241,0.4)" strokeWidth="1" />
      </svg>

      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
        pointerEvents: 'none',
      }} />

      {/* Top vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(7,9,28,0.6) 0%, transparent 20%, transparent 70%, rgba(7,9,28,0.8) 100%)',
      }} />
    </div>
  )
}

interface CutsceneProps {
  onComplete: () => void
  onPhaseChange?: (phase: 'comments' | 'mentor') => void
}

const CUTSCENE_COMMENTS = [
  { user: '@yyu', text: 'Pantesan nilai TKA jeblok!' },
  { user: '@t1ki', text: 'Pemerintah harus sita HP!' },
  { user: '@Rakyat_Skeptis', text: 'Pantesan nilai rapor anak zaman sekarang jeblok semua. Isinya cuma joget-joget di TikTok doang!' },
  { user: '@Bunda_Khawatir99', text: 'Zaman dulu remaja sibuk OSIS sama belajar, zaman sekarang dari bangun tidur sampai merem lagi matanya lengket sama layar. Miris 😢' },
  { user: '@Dedy_Brader', text: '8 jam? Itu mah minimal. Malah ada yang sampai begadang demi nge-game sama scroll feed gak jelas. Generasi cemas kecanduan gadget!' },
  { user: '@Fitri_Zzz', text: 'Wkwk pantesan kalau diajak ngomong langsung gak nyambung, fokusnya cuma bertahan 5 detik!' },
]

const COMMENT_COLORS = [
  '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f97316'
]

/* ─── Typewriter for comment text ─── */
function CommentTypewriter({ text, speed = 28, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const idxRef = useRef(0)
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone }, [onDone])

  useEffect(() => {
    setDisplayed('')
    idxRef.current = 0
    const id = setInterval(() => {
      if (idxRef.current < text.length) {
        setDisplayed(text.slice(0, idxRef.current + 1))
        idxRef.current++
      } else {
        clearInterval(id)
        onDoneRef.current?.()
      }
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span style={{ animation: 'cur-blink 0.7s infinite', color: '#94a3b8' }}>|</span>
      )}
    </span>
  )
}

/* ─── Typewriter for mentor dialog ─── */
function TypewriterText({ text, onDone }: { text: string; onDone: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone }, [onDone])
  useEffect(() => {
    setDisplayed('')
    indexRef.current = 0
    const id = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1))
        indexRef.current++
      } else {
        clearInterval(id)
        setTimeout(() => onDoneRef.current(), 200)
      }
    }, 22)
    return () => clearInterval(id)
  }, [text])
  return (
    <span>{displayed}<span style={{ animation: 'blink 1s infinite', color: 'var(--accent)' }}>|</span></span>
  )
}

/* ─── Hot news ticker ─── */
function HotNewsTicker() {
  const items = [
    '🔥 BERITA HOT: Remaja Indonesia habiskan >8 jam di medsos!',
    '📊 1.134 Komentar dalam 2 jam pertama',
    '❤️ 12.900 Likes dan terus bertambah',
    '✈️ Dibagikan 3.560 kali dalam 24 jam',
    '⚠️ Benarkah klaim ini? Selidiki bersama Dira!',
  ]
  const text = items.join('   •   ')

  return (
    <div style={{
      background: 'linear-gradient(90deg, #c90000 0%, #7f1d1d 100%)',
      color: '#fff',
      fontSize: '12px',
      fontWeight: 700,
      letterSpacing: '0.3px',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      height: '32px',
      flexShrink: 0,
      borderRadius: '10px 10px 0 0',
    }}>
      <div style={{
        background: '#7f1d1d',
        padding: '0 12px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexShrink: 0,
        fontSize: '11px',
        fontWeight: 900,
        borderRight: '2px solid rgba(255,255,255,0.2)',
        letterSpacing: '1px',
      }}>
        <span style={{ animation: 'pulse-live 1.5s infinite', display: 'inline-block' }}>🔴</span> LIVE
      </div>
      <div style={{ overflow: 'hidden', flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
        <div style={{
          animation: 'ticker-scroll 28s linear infinite',
          whiteSpace: 'nowrap',
          paddingLeft: '100%',
        }}>
          {text}
        </div>
      </div>
    </div>
  )
}

/* ─── Instagram post card ─── */
function InstagramPost() {
  return (
    <div style={{
      background: '#000',
      border: '1px solid rgba(255,255,255,0.14)',
      borderRadius: '0 0 16px 16px',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
    }}>
      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
            padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%', background: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '13px', color: '#fff',
            }}>P</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>pinterpolitik</span>
            <svg viewBox="0 0 24 24" width="13" height="13" style={{ fill: '#3897f0', flexShrink: 0 }}>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '20px', letterSpacing: '2px', lineHeight: 1 }}>•••</span>
      </div>

      {/* Post image body */}
      <div style={{
        position: 'relative',
        background: '#fff',
        overflow: 'hidden',
        height: '210px',
        flexShrink: 0,
        display: 'flex',
      }}>
        {/* Left text */}
        <div style={{
          flex: 1, padding: '18px 0 18px 18px', display: 'flex',
          flexDirection: 'column', justifyContent: 'center', zIndex: 2, lineHeight: 1.15,
        }}>
          <div style={{
            fontSize: '26px', fontWeight: 900, color: '#c90000',
            fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '0.5px', marginBottom: '4px',
          }}>BREAKING:</div>
          <div style={{
            fontSize: '16px', fontWeight: 800, color: '#000',
            fontFamily: '"Arial Narrow", Arial, sans-serif', textTransform: 'uppercase',
            letterSpacing: '-0.5px', display: 'flex', flexDirection: 'column', gap: '1px',
          }}>
            <span>Remaja Indonesia</span>
            <span>rata-rata habiskan</span>
            <span style={{ color: '#c90000', fontSize: '20px' }}>&gt;8 JAM</span>
            <span style={{ color: '#c90000' }}>sehari di medsos!</span>
            <span style={{ marginTop: '6px', fontSize: '13px' }}>Generasi cemas</span>
            <span style={{ fontSize: '13px' }}>kecanduan HP!</span>
          </div>
        </div>
        {/* Silhouette */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '55%', height: '100%', zIndex: 1 }}>
          <img
            src="/teen_silhouette.png"
            alt="Teen Silhouette"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '10px 14px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>❤️ <span style={{ fontSize: '11px', fontWeight: 600 }}>12,9rb</span></span>
          <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>💬 <span style={{ fontSize: '11px', fontWeight: 600 }}>1.134</span></span>
          <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>✈️ <span style={{ fontSize: '11px', fontWeight: 600 }}>3.560</span></span>
        </div>
        <span style={{ fontSize: '14px' }}>🔖</span>
      </div>
      {/* Caption */}
      <div style={{ padding: '0 14px 14px', fontSize: '12px', lineHeight: 1.5, color: 'rgba(255,255,255,0.85)' }}>
        <span style={{ fontWeight: 700 }}>pinterpolitik</span>{' '}Studi terbaru ungkap fakta mengejutkan: remaja Indonesia rata-rata habiskan lebih dari 8 jam sehari di medsos!{' '}
        <span style={{ color: '#3897f0' }}>selengkapnya</span>
      </div>
    </div>
  )
}

const playCommentPopSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(320, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.14)
  } catch (_) {}
}

export default function Cutscene({ onComplete, onPhaseChange }: CutsceneProps) {
  const [phase, setPhase] = useState<'intro' | 'comments' | 'mentor'>('intro')
  const [visibleComments, setVisibleComments] = useState(0)
  const [typingIdx, setTypingIdx] = useState<number | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mentorTypingDone, setMentorTypingDone] = useState(false)
  const commentsEndRef = useRef<HTMLDivElement | null>(null)

  // Responsive
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Notify parent
  useEffect(() => {
    if (phase !== 'intro') onPhaseChange?.(phase as 'comments' | 'mentor')
  }, [phase, onPhaseChange])

  // Intro camera animation: after 2.2s transition to comments phase
  useEffect(() => {
    if (phase === 'intro') {
      const t = setTimeout(() => setPhase('comments'), 2200)
      return () => clearTimeout(t)
    }
  }, [phase])

  // Scroll to bottom when new comment appears
  useEffect(() => {
    if (visibleComments > 0) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [visibleComments])

  // Reveal comments one-by-one with typing
  // Each comment: wait 700ms after previous done → show typing → after typing done → wait 900ms → next
  useEffect(() => {
    if (phase !== 'comments') return
    if (typingIdx !== null) return // currently typing

    if (visibleComments < CUTSCENE_COMMENTS.length) {
      const delay = visibleComments === 0 ? 600 : 1200
      const t = setTimeout(() => {
        setTypingIdx(visibleComments)
      }, delay)
      return () => clearTimeout(t)
    }
  }, [phase, visibleComments, typingIdx])

  const handleCommentTypingDone = () => {
    setTypingIdx(null)
    setVisibleComments(prev => prev + 1)
    if (!isMuted) playCommentPopSound()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? 'auto' : 'calc(100vh - 68px)',
        minHeight: isMobile ? 'calc(100vh - 68px)' : 'none',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '16px' : '24px',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* ─── Rich game background ─── */}
      <GameBackground />

      {/* Mute button */}
      <div style={{ position: 'absolute', top: '18px', right: '18px', zIndex: 300 }}>
        <button
          className="game-btn game-btn-secondary"
          style={{ padding: '8px 14px', fontSize: '16px', backdropFilter: 'blur(8px)' }}
          onClick={() => setIsMuted(p => !p)}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* ─── Main scene: cinematic intro camera pan ─── */}
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ scale: 0.45, x: '-28vw', opacity: 0.5 }}
            animate={{ scale: 1, x: 0, opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.9, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              transformOrigin: 'center center',
            }}
          >
            {/* Spotlight vignette */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 55% 55% at 50% 50%, transparent 30%, rgba(0,0,0,0.72) 100%)',
              pointerEvents: 'none',
            }} />
            {/* Center: just the post card preview */}
            <motion.div
              initial={{ filter: 'brightness(0.3) blur(4px)' }}
              animate={{ filter: 'brightness(1) blur(0px)' }}
              transition={{ duration: 1.5, delay: 0.4, ease: 'easeOut' }}
              style={{
                width: '300px',
                boxShadow: '0 30px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.06)',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              <HotNewsTicker />
              <InstagramPost />
            </motion.div>
            {/* "KASUS BARU" flash text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -10] }}
              transition={{ duration: 1.8, times: [0, 0.2, 0.75, 1], ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: isMobile ? '14px' : '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontFamily: '"Impact", "Arial Black", sans-serif',
                fontSize: isMobile ? '22px' : '32px',
                fontWeight: 900,
                letterSpacing: '5px',
                color: '#c90000',
                textShadow: '0 0 30px rgba(201,0,0,0.8)',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              ⚠ KASUS BARU DIBUKA
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main layout: Post + Comments ─── */}
      <AnimatePresence>
        {(phase === 'comments' || phase === 'mentor') && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '16px' : '28px',
              alignItems: isMobile ? 'center' : 'stretch',
              justifyContent: 'center',
              maxWidth: '940px',
              width: '100%',
              height: isMobile ? 'auto' : '100%',
              maxHeight: isMobile ? 'none' : '510px',
              margin: '0 auto',
              zIndex: 10,
              filter: phase === 'mentor' ? 'blur(8px)' : 'none',
              pointerEvents: phase === 'mentor' ? 'none' : 'auto',
              transition: 'filter 0.5s ease',
            }}
          >
            {/* ── Left: Instagram Post ── */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              style={{
                flex: '0 0 auto',
                width: isMobile ? '100%' : '300px',
                maxWidth: '320px',
                display: 'flex',
                flexDirection: 'column',
                height: isMobile ? 'auto' : '100%',
              }}
            >
              <HotNewsTicker />
              <InstagramPost />
            </motion.div>

            {/* ── Right: Comments Feed ── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                maxWidth: isMobile ? '100%' : '500px',
                width: '100%',
                height: isMobile ? 'auto' : '100%',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '16px',
                padding: isMobile ? '16px' : '20px 22px',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                boxSizing: 'border-box',
                justifyContent: 'space-between',
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '14px',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: '18px' }}>💬</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff', letterSpacing: '0.3px' }}>
                  Komentar Netizen
                </span>
                <span style={{
                  marginLeft: 'auto',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 900,
                  padding: '2px 9px',
                  borderRadius: '12px',
                  animation: 'pulse-live 1.5s infinite',
                  letterSpacing: '0.5px',
                }}>LIVE</span>
              </div>

              {/* Comments list */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                overflowY: 'auto',
                flex: 1,
                paddingRight: '4px',
              }}>
                {/* Rendered (finished typing) comments */}
                {CUTSCENE_COMMENTS.slice(0, visibleComments).map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '11px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%',
                        background: COMMENT_COLORS[i % COMMENT_COLORS.length],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '9px', fontWeight: 900, color: '#fff', flexShrink: 0,
                      }}>
                        {c.user[1]?.toUpperCase() || 'U'}
                      </div>
                      <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: '12px' }}>{c.user}</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: '13px', lineHeight: 1.5 }}>
                      {c.text}
                    </span>
                  </motion.div>
                ))}

                {/* Currently typing comment */}
                {typingIdx !== null && typingIdx < CUTSCENE_COMMENTS.length && (
                  <motion.div
                    key={`typing-${typingIdx}`}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(96,165,250,0.2)',
                      borderRadius: '12px',
                      padding: '11px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      boxShadow: '0 0 10px rgba(96,165,250,0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%',
                        background: COMMENT_COLORS[typingIdx % COMMENT_COLORS.length],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '9px', fontWeight: 900, color: '#fff', flexShrink: 0,
                      }}>
                        {CUTSCENE_COMMENTS[typingIdx].user[1]?.toUpperCase() || 'U'}
                      </div>
                      <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: '12px' }}>
                        {CUTSCENE_COMMENTS[typingIdx].user}
                      </span>
                      {/* "sedang mengetik..." */}
                      <span style={{
                        fontSize: '10px', color: 'rgba(255,255,255,0.35)',
                        fontStyle: 'italic', marginLeft: '2px',
                        animation: 'fade-typing 1s infinite alternate',
                      }}>mengetik...</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: '13px', lineHeight: 1.5 }}>
                      <CommentTypewriter
                        text={CUTSCENE_COMMENTS[typingIdx].text}
                        speed={32}
                        onDone={handleCommentTypingDone}
                      />
                    </span>
                  </motion.div>
                )}
                <div ref={commentsEndRef} />
              </div>

              {/* Selanjutnya button */}
              <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'flex-end', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  className="game-btn game-btn-primary"
                  style={{ fontSize: '13px', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '7px' }}
                  onClick={() => setPhase('mentor')}
                >
                  Selanjutnya <span>→</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Mentor Dialogue Overlay ─── */}
      <AnimatePresence>
        {phase === 'mentor' && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 150, padding: '20px',
          }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                position: 'absolute',
                bottom: isMobile ? '12px' : '24px',
                left: isMobile ? '12px' : '24px',
                right: isMobile ? '12px' : '24px',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '800px',
                width: 'calc(100% - 48px)',
                margin: '0 auto',
              }}
            >
              {/* Name tag */}
              <div style={{
                alignSelf: 'flex-start',
                background: 'rgba(10,20,15,0.95)',
                borderTop: '2px solid rgba(0,255,136,0.3)',
                borderLeft: '2px solid rgba(0,255,136,0.3)',
                borderRight: '2px solid rgba(0,255,136,0.3)',
                borderBottom: 'none',
                borderRadius: '6px 14px 0 0',
                padding: '4px 16px',
                color: 'var(--accent)',
                fontSize: isMobile ? '11px' : '13px',
                fontWeight: 800,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span style={{ fontSize: '13px' }}>👤</span>
                <span>ASISTEN DIRA</span>
              </div>

              {/* Dialog box */}
              <div style={{
                background: 'rgba(10,20,18,0.95)',
                border: '2px solid rgba(0,255,136,0.4)',
                borderRadius: '0px 14px 14px 14px',
                padding: isMobile ? '14px 18px' : '20px 24px',
                boxShadow: '0 10px 25px rgba(0,255,136,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: isMobile ? '95px' : '115px',
                boxSizing: 'border-box',
                position: 'relative',
              }}>
                {/* Agent sprite */}
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(100% - 2px)',
                  right: isMobile ? '8px' : '24px',
                  height: isMobile ? '120px' : '190px',
                  zIndex: 5,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  pointerEvents: 'none',
                }}>
                  <motion.img
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                    src="https://tmdbqikqflbeqaqllxge.supabase.co/storage/v1/object/public/Asset/Agent.png"
                    onError={(e) => { e.currentTarget.src = '/dira-avatar.png' }}
                    alt="Agent"
                    style={{ height: '100%', objectFit: 'contain' }}
                  />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    style={{
                      position: 'absolute', top: '5%', right: isMobile ? '-25px' : '-35px',
                      background: 'rgba(10,20,15,0.95)',
                      border: '2px solid var(--accent)',
                      borderRadius: '50%',
                      padding: isMobile ? '4px 8px' : '6px 12px',
                      fontWeight: 900, fontSize: isMobile ? '12px' : '15px',
                      color: 'var(--accent)', transform: 'rotate(12deg)',
                      boxShadow: '3px 3px 0px rgba(0,255,136,0.3)',
                      fontFamily: '"Impact","Arial Black",sans-serif',
                      animation: 'pulse-go 1s infinite alternate',
                      zIndex: 6,
                    }}
                  >Go!</motion.div>
                </div>

                <p style={{
                  margin: 0, fontSize: isMobile ? '13px' : '15px',
                  color: 'rgba(255,255,255,0.9)', fontWeight: 600, lineHeight: 1.6,
                  fontFamily: 'var(--font-ui)',
                }}>
                  <TypewriterText
                    text="Tunggu dulu... Benar nggak sih klaim ini? Jangan langsung kemakan emosi netizen. Kita punya data screen time dari sampel 35 siswa acak. Yuk, kita uji validitasnya!"
                    onDone={() => setMentorTypingDone(true)}
                  />
                </p>

                {/* Footer buttons */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px',
                }}>
                  <button
                    className="game-btn game-btn-secondary"
                    style={{ fontSize: isMobile ? '10px' : '11px', padding: '6px 12px', borderRadius: '6px', fontWeight: 800, minHeight: 'auto' }}
                    onClick={() => { setMentorTypingDone(false); setPhase('comments') }}
                  >KEMBALI</button>
                  <button
                    className="game-btn game-btn-primary"
                    disabled={!mentorTypingDone}
                    style={{
                      fontSize: isMobile ? '11px' : '12px',
                      padding: isMobile ? '6px 16px' : '8px 24px',
                      borderRadius: '6px', fontWeight: 800,
                      display: 'flex', alignItems: 'center', gap: '6px',
                      cursor: mentorTypingDone ? 'pointer' : 'not-allowed',
                      minHeight: 'auto', opacity: mentorTypingDone ? 1 : 0.5,
                      boxShadow: mentorTypingDone ? 'var(--accent-glow)' : 'none',
                    }}
                    onClick={onComplete}
                  >MULAI INVESTIGASI</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes blink {
          0%,100% { opacity:1; } 50% { opacity:0; }
        }
        @keyframes cur-blink {
          0%,100% { opacity:1; } 50% { opacity:0; }
        }
        @keyframes pulse-live {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.55; transform:scale(0.92); }
        }
        @keyframes pulse-go {
          0%,100% { transform:rotate(12deg) scale(1); }
          50% { transform:rotate(12deg) scale(1.12); }
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fade-typing {
          0% { opacity:0.35; } 100% { opacity:0.7; }
        }
        @keyframes particle-float {
          0%   { transform: translateY(0px) translateX(0px); opacity: var(--op, 0.4); }
          33%  { transform: translateY(-22px) translateX(8px); }
          66%  { transform: translateY(-10px) translateX(-8px); }
          100% { transform: translateY(0px) translateX(0px); opacity: var(--op, 0.4); }
        }
        @keyframes bokeh-drift {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(20px, -15px) scale(1.15); }
        }
        @keyframes grid-drift {
          0%   { backgroundPosition: 0 0; }
          100% { backgroundPosition: 52px 52px; }
        }
        @keyframes win-blink {
          0%,80%,100% { opacity:0.7; }
          90% { opacity:0.1; }
        }
      `}</style>
    </motion.div>
  )
}
