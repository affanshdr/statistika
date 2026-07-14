'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  useScroll,
  useSpring,
  useInView,
} from 'framer-motion'
import dynamic from 'next/dynamic'

// Dynamic import agar tidak SSR
const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false })
const MagneticButton = dynamic(() => import('@/components/MagneticButton'), { ssr: false })

type Classroom = {
  id: string
  name: string
  grade: string
  major: string
}

// ── Animated particle (teal dot)
function Particle({ x, y, delay }: { x: string; y: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 0.7, 0], scale: [0, 1, 0] }}
      transition={{ repeat: Infinity, duration: 4, delay, ease: 'easeInOut' }}
      style={{
        position: 'absolute', top: y, left: x,
        width: '5px', height: '5px', borderRadius: '50%',
        background: '#00ADB5',
        boxShadow: '0 0 8px rgba(0, 173, 181, 0.5)',
        pointerEvents: 'none',
      }}
    />
  )
}

const PARTICLES = [
  { x: '12%', y: '20%', delay: 0 }, { x: '78%', y: '15%', delay: 0.8 },
  { x: '35%', y: '72%', delay: 1.6 }, { x: '88%', y: '55%', delay: 2.4 },
  { x: '55%', y: '30%', delay: 0.4 }, { x: '20%', y: '60%', delay: 1.2 },
  { x: '65%', y: '80%', delay: 2.0 }, { x: '42%', y: '45%', delay: 0.6 },
  { x: '90%', y: '30%', delay: 1.8 }, { x: '8%', y: '75%', delay: 3.0 },
]

// ── CountUp triggered on viewport entry
function CountUp({
  target,
  suffix = '',
  duration = 1500,
  inView,
}: {
  target: number
  suffix?: string
  duration?: number
  inView: boolean
}) {
  const [val, setVal] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true
    let active = true
    let frameId: number
    const start = Date.now()
    const tick = () => {
      if (!active) return
      const t = Math.min((Date.now() - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(ease * target))
      if (t < 1) frameId = requestAnimationFrame(tick)
    }
    const timer = setTimeout(tick, 200)
    return () => {
      active = false
      clearTimeout(timer)
      cancelAnimationFrame(frameId)
    }
  }, [inView, target, duration])

  return <>{val}{suffix}</>
}

// ── Staggered word reveal animation
function WordReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.25em' }}>
          <motion.span
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{
              delay: delay + i * 0.1,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ display: 'inline-block' }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </>
  )
}

// ── Feature card with scroll-triggered animation
function FeatureCard({
  icon,
  label,
  desc,
  index,
}: {
  icon: string
  label: string
  desc: string
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px 0px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        delay: index * 0.15,
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        padding: '14px 16px', borderRadius: '14px',
        background: 'rgba(13, 27, 42, 0.7)',
        border: '1px solid rgba(14, 131, 136, 0.2)',
        boxShadow: '0 2px 8px rgba(14, 131, 136, 0.06)',
        transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
      whileHover={{
        borderColor: 'rgba(0,173,181,0.5)',
        background: 'rgba(13, 27, 42, 0.9)',
        boxShadow: '0 4px 16px rgba(0,173,181,0.15)',
      }}
    >
      <div style={{ fontSize: '22px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.5 }}>{desc}</div>
    </motion.div>
  )
}

// ── Stats row with inView counter
function StatsRow() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px 0px' })
  const stats = [
    { val: 15, suffix: ' soal', label: 'Tes Diagnostik' },
    { val: 35, suffix: ' data', label: 'Dataset Nyata' },
    { val: 3, suffix: ' materi', label: 'Buku Saku' },
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        display: 'flex', gap: '28px', paddingTop: '8px',
        borderTop: '1px solid rgba(14, 131, 136, 0.15)',
      }}
    >
      {stats.map(({ val, suffix, label }) => (
        <div key={label}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#00ADB5', fontFamily: "'Geist Mono', monospace" }}>
            <CountUp target={val} suffix={suffix} inView={inView} />
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, marginTop: '2px' }}>{label}</div>
        </div>
      ))}
    </motion.div>
  )
}

// ── Parallax background wrapper
function ParallaxBg({ scrollY }: { scrollY: ReturnType<typeof useSpring> }) {
  const y = useTransform(scrollY, (v) => v * -0.35)
  return (
    <motion.div
      style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
        y,
        willChange: 'transform',
      }}
    >
      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(14, 131, 136, 0.15) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Glow blobs */}
      <div style={{ position: 'absolute', top: '-5%', left: '-8%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0, 173, 181, 0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', bottom: '5%', right: '-8%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14, 131, 136, 0.06) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0, 240, 255, 0.04) 0%, transparent 60%)', filter: 'blur(80px)' }} />

      {/* Extra mid-page glow */}
      <div style={{ position: 'absolute', top: '70%', left: '20%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,173,181,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      {/* Floating particles */}
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
    </motion.div>
  )
}

// ── Noise/grain overlay (cinematic texture)
function NoiseOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5,
        pointerEvents: 'none',
        opacity: 0.032,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
        mixBlendMode: 'overlay',
      }}
    />
  )
}

export default function HomePage() {
  const router = useRouter()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [name, setName] = useState('')
  const [classroomId, setClassroomId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingClass, setLoadingClass] = useState(true)
  const [nameFocus, setNameFocus] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [lenisDone, setLenisDone] = useState(false)

  // Card tilt on mouse
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-100, 100], [4, -4])
  const rotateY = useTransform(mouseX, [-100, 100], [-4, 4])
  const cardRef = useRef<HTMLDivElement>(null)

  // Parallax scroll
  const { scrollY: rawScrollY } = useScroll()
  const scrollY = useSpring(rawScrollY, { stiffness: 60, damping: 20, mass: 0.2 })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }, [mouseX, mouseY])

  const handleMouseLeave = useCallback(() => { mouseX.set(0); mouseY.set(0) }, [mouseX, mouseY])

  // Scroll detection for sticky header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lenis smooth scroll (only on landing page)
  useEffect(() => {
    let lenis: import('lenis').default | null = null

    import('lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      })

      const raf = (time: number) => {
        lenis!.raf(time)
        requestAnimationFrame(raf)
      }
      requestAnimationFrame(raf)
      setLenisDone(true)
    })

    return () => {
      lenis?.destroy()
    }
  }, [])

  // Check existing session
  useEffect(() => {
    const data = localStorage.getItem('student')
    if (data) {
      try {
        const student = JSON.parse(data)
        if (student.geftStatus !== 'completed') {
          router.push('/siswa/geft')
        } else {
          router.push('/siswa')
        }
      } catch (e) {
        console.error('Error parsing student data:', e)
      }
    }
  }, [router])

  useEffect(() => {
    fetch('/api/classrooms')
      .then(r => r.json())
      .then(data => {
        setClassrooms(data)
        if (data?.length === 1) setClassroomId(data[0].id)
      })
      .finally(() => setLoadingClass(false))
  }, [])

  async function handleMulaiBelajar() {
    setError('')
    if (!name.trim()) return setError('Nama lengkap wajib diisi.')
    if (!classroomId) return setError('Pilih kelas terlebih dahulu.')
    setLoading(true)
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), classroomId }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Terjadi kesalahan.')
      localStorage.setItem('student', JSON.stringify(data))
      if (data.geftStatus !== 'completed') {
        router.push('/siswa/geft')
      } else {
        router.push('/siswa')
      }
    } catch {
      setError('Gagal terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }

  const FEATURES = [
    { icon: '🔬', label: 'Tes Diagnostik Awal', desc: 'Ukur kemampuan statistika awal untuk jalur belajar yang dipersonalisasi.' },
    { icon: '🧠', label: 'Gaya Kognitif FI / FD', desc: 'Profil Field Independent & Field Dependent via tes GEFT terintegrasi.' },
    { icon: '🕵️', label: 'Game Investigasi Data', desc: 'Selesaikan misi detektif: ungkap klaim viral menggunakan histogram & statistika.' },
    { icon: '📖', label: 'Buku Saku Detektif', desc: 'Pelajari distribusi, outlier, dan mean vs median lewat animasi interaktif.' },
  ]

  // Suppress unused warning
  void lenisDone

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0B1E2C',
        color: '#F8FAFC',
        position: 'relative',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        // Hide default cursor on desktop
        cursor: 'none',
      }}
    >
      {/* Custom cursor — desktop only */}
      <CustomCursor />

      {/* Noise/grain cinematic overlay */}
      <NoiseOverlay />

      {/* Parallax background */}
      <ParallaxBg scrollY={scrollY} />

      {/* ── Navbar — sticky ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'rgba(6, 21, 32, 0.98)' : 'rgba(6, 21, 32, 0.8)',
        backdropFilter: 'blur(24px)',
        borderBottom: scrolled ? '1px solid rgba(14, 131, 136, 0.2)' : '1px solid rgba(14, 131, 136, 0.08)',
        boxShadow: scrolled ? '0 4px 24px rgba(14, 131, 136, 0.08)' : 'none',
        transition: 'background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        cursor: 'none',
      }}>
        <style>{`
          .nav-inner {
            max-width: 1200px; margin: 0 auto;
            padding: 12px 20px;
            display: flex; justify-content: space-between; align-items: center;
          }
          .nav-subtitle { display: block; }
          .nav-badge { display: flex; }
          .nav-btn-full { display: inline; }
          .nav-btn-short { display: none; }
          @media (max-width: 480px) {
            .nav-inner { padding: 10px 16px; }
            .nav-subtitle { display: none; }
            .nav-badge { display: none; }
            .nav-btn-full { display: none; }
            .nav-btn-short { display: inline; }
          }
          /* Restore cursor on mobile/touch */
          @media (hover: none) {
            * { cursor: auto !important; }
          }
        `}</style>
        <div className="nav-inner">
          {/* Logo */}
          <div
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'none' }}
          >
            <motion.div
              animate={{ filter: ['drop-shadow(0 0 4px rgba(0,173,181,0.5))', 'drop-shadow(0 0 10px rgba(0,173,181,0.8))', 'drop-shadow(0 0 4px rgba(0,173,181,0.5))'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ fontSize: '24px', lineHeight: 1 }}
            >
              🕵️
            </motion.div>
            <div>
              <div style={{
                fontWeight: 900, fontSize: '16px', letterSpacing: '0.5px',
                background: 'linear-gradient(90deg, #00ADB5, #00F0FF)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                whiteSpace: 'nowrap',
              }}>
                Skeptikos
              </div>
              <div className="nav-subtitle" style={{ fontSize: '9px', color: 'rgba(0,173,181,0.5)', letterSpacing: '2px', fontWeight: 700, marginTop: '1px' }}>
                INVESTIGASI DATA
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="nav-badge" style={{
              padding: '4px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 700,
              border: '1px solid rgba(14,131,136,0.25)', background: 'rgba(14,131,136,0.08)',
              color: '#00ADB5', letterSpacing: '0.5px', alignItems: 'center', gap: '6px',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ADB5', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
              ONLINE
            </div>
            <button
              onClick={() => router.push('/guru')}
              style={{
                padding: '7px 14px', borderRadius: '10px',
                border: '1px solid rgba(14,131,136,0.2)',
                background: 'rgba(14,131,136,0.06)',
                color: '#E2E8F0', fontSize: '13px',
                fontWeight: 600, cursor: 'none', transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(14,131,136,0.12)'; e.currentTarget.style.color = '#FFF' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(14,131,136,0.06)'; e.currentTarget.style.color = '#E2E8F0' }}
            >
              <span className="nav-btn-full">🧑‍🏫 Portal Guru</span>
              <span className="nav-btn-short">Portal Guru</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '64px 24px 80px' }}>
        <div className="hero-layout" style={{ display: 'flex', gap: '56px', alignItems: 'center', flexWrap: 'wrap' }}>

          {/* ── LEFT: Hero Copy ── */}
          <div style={{ flex: 1.2, minWidth: 'min(320px, 100%)', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Mission badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                display: 'inline-flex', alignSelf: 'flex-start',
                alignItems: 'center', gap: '8px',
                padding: '7px 16px', borderRadius: '50px',
                border: '1px solid rgba(14, 131, 136, 0.3)',
                background: 'rgba(14, 131, 136, 0.08)',
                fontSize: '11px', fontWeight: 800, color: '#00ADB5', letterSpacing: '2px',
              }}
            >
              <span style={{ fontSize: '16px' }}>🏆</span>
              LIDM IPDP 2026
            </motion.div>

            {/* ── Headline with word-by-word reveal ── */}
            <h1
              className="hero-h1"
              style={{ margin: 0, fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.5px' }}
            >
              {/* Line 1 */}
              <span style={{ display: 'block', fontSize: 'clamp(32px, 5vw, 54px)', color: '#FFFFFF', overflow: 'hidden' }}>
                <WordReveal text="Jadi Detektif Data," delay={0.05} />
              </span>
              {/* Line 2 */}
              <span style={{ display: 'block', fontSize: 'clamp(32px, 5vw, 54px)', color: '#FFFFFF' }}>
                <WordReveal text="Ungkap Klaim" delay={0.25} />
                {' '}
                <span style={{ display: 'inline-block', overflow: 'hidden' }}>
                  <motion.span
                    style={{
                      display: 'inline-block',
                      background: 'linear-gradient(90deg, #00ADB5 0%, #00F0FF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    Viral
                  </motion.span>
                </span>
                {' '}
                <span style={{ display: 'inline-block', overflow: 'hidden' }}>
                  <motion.span
                    style={{ display: 'inline-block' }}
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ delay: 0.65, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    dengan
                  </motion.span>
                </span>
              </span>
              {/* Line 3 */}
              <span style={{ display: 'block', fontSize: 'clamp(32px, 5vw, 54px)', color: '#FFFFFF', overflow: 'hidden' }}>
                <motion.span
                  style={{
                    display: 'inline-block',
                    background: 'linear-gradient(90deg, #00ADB5 0%, #00F0FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ delay: 0.75, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  Statistika!
                </motion.span>
              </span>
            </h1>

            {/* Subtitle — fade in after headline */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6, ease: 'easeOut' }}
              style={{ margin: 0, fontSize: '16px', color: '#94A3B8', lineHeight: 1.7, maxWidth: '480px' }}
            >
              Platform game edukasi adaptif yang menggabungkan profil kognitif <strong style={{ color: '#00ADB5' }}>FI/FD</strong>, investigasi data nyata, dan visualisasi histogram interaktif untuk pembelajaran statistika SMA yang menyenangkan.
            </motion.p>

            {/* Features grid — scroll triggered */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.4 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
            >
              {FEATURES.map((f, i) => (
                <FeatureCard key={i} {...f} index={i} />
              ))}
            </motion.div>

            {/* Stats row — viewport-triggered counter */}
            <StatsRow />
          </div>

          {/* ── RIGHT: Login Card ── */}
          <div className="login-card-container" style={{ flex: 0.85, minWidth: '320px', display: 'flex', justifyContent: 'center', perspective: '1000px' }}>
            <motion.div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ rotateX, rotateY, width: '100%', maxWidth: '420px' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, type: 'spring', stiffness: 100 }}
            >
              {/* Glow border ring */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(14,131,136,0.4) 0%, rgba(0,173,181,0.2) 50%, rgba(0,240,255,0.15) 100%)',
                padding: '1px', borderRadius: '28px',
                boxShadow: '0 4px 24px rgba(14,131,136,0.12)',
              }}>
                <div style={{
                  background: '#FFFFFF',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '27px',
                  padding: '36px 30px',
                }}>

                  {/* Card Header */}
                  <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: 'rgba(14,131,136,0.1)', border: '1px solid rgba(14,131,136,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                        boxShadow: '0 0 16px rgba(14,131,136,0.12)',
                      }}>
                        🔐
                      </div>
                      <div>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#104f55' }}>
                          Masuk ke Markas
                        </h2>
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#557A82', fontWeight: 600 }}>
                          Identifikasi dirimu, Detektif!
                        </p>
                      </div>
                    </div>

                    {/* Mission briefing ticker */}
                    <div style={{
                      padding: '8px 12px', borderRadius: '10px',
                      background: 'rgba(14,131,136,0.06)', border: '1px solid rgba(14,131,136,0.2)',
                      fontSize: '11px', color: '#0F4C5C', fontWeight: 700, letterSpacing: '0.5px',
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      <span style={{ animation: 'blink 1.2s infinite' }}>📡</span>
                      MISI AKTIF: Ungkap Klaim Viral Screen Time Remaja
                    </div>
                  </div>

                  {/* Form */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                    {/* Nama */}
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#557A82', letterSpacing: '2px', marginBottom: '8px' }}>
                        NAMA DETEKTIF
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          id="student-name"
                          placeholder="Masukkan nama lengkapmu..."
                          value={name}
                          onChange={e => setName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleMulaiBelajar()}
                          onFocus={() => setNameFocus(true)}
                          onBlur={() => setNameFocus(false)}
                          style={{
                            width: '100%', boxSizing: 'border-box',
                            padding: '14px 16px', borderRadius: '12px',
                            background: nameFocus ? '#FFFFFF' : '#FAFCFC',
                            border: `1px solid ${nameFocus ? 'rgba(14,131,136,0.5)' : 'rgba(14,131,136,0.25)'}`,
                            color: '#1C1917', fontSize: '14px', outline: 'none',
                            transition: 'all 0.2s', fontFamily: 'inherit',
                            boxShadow: nameFocus ? '0 0 0 3px rgba(14,131,136,0.1)' : 'none',
                            cursor: 'text',
                          }}
                        />
                      </div>
                    </div>

                    {/* Kelas */}
                    {loadingClass ? (
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#557A82', letterSpacing: '2px', marginBottom: '8px' }}>
                          UNIT / KELAS
                        </label>
                        <div style={{
                          padding: '14px 16px', borderRadius: '12px',
                          background: '#FAFCFC',
                          border: '1px solid rgba(14,131,136,0.25)',
                          display: 'flex', alignItems: 'center', gap: '10px',
                          position: 'relative',
                        }}>
                          <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            style={{ fontSize: '13px', color: '#557A82' }}
                          >
                            Memuat daftar kelas...
                          </motion.span>
                        </div>
                      </div>
                    ) : classrooms.length > 1 ? (
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#557A82', letterSpacing: '2px', marginBottom: '8px' }}>
                          UNIT / KELAS
                        </label>
                        <div style={{ position: 'relative' }}>
                          <select
                            id="classroom-select"
                            value={classroomId}
                            onChange={e => setClassroomId(e.target.value)}
                            style={{
                              width: '100%', boxSizing: 'border-box',
                              padding: '14px 16px', borderRadius: '12px',
                              background: '#FAFCFC',
                              border: '1px solid rgba(14,131,136,0.25)',
                              color: classroomId ? '#1C1917' : '#78716C',
                              fontSize: '14px', outline: 'none', cursor: 'pointer',
                              appearance: 'none', transition: 'all 0.2s',
                            }}
                            onFocus={e => e.target.style.borderColor = 'rgba(14,131,136,0.5)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(14,131,136,0.25)'}
                          >
                            <option value="">— Pilih Unit —</option>
                            {classrooms.map(c => (
                              <option key={c.id} value={c.id} style={{ background: '#FAFCFC', color: '#1C1917' }}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#557A82', fontSize: '12px', pointerEvents: 'none' }}>
                            ▼
                          </span>
                        </div>
                      </div>
                    ) : classrooms.length === 1 ? (
                      <div style={{
                        padding: '12px 16px', borderRadius: '12px',
                        background: 'rgba(14,131,136,0.06)', border: '1px solid rgba(14,131,136,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '18px' }}>🏛️</span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '9px', fontWeight: 800, color: '#557A82', letterSpacing: '1px' }}>UNIT / KELAS</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917' }}>{classrooms[0].name}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', color: '#0F4C5C', fontWeight: 800 }}>AUTO-SELECT</span>
                      </div>
                    ) : (
                      <div style={{
                        padding: '12px 16px', borderRadius: '12px',
                        background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)',
                        fontSize: '13px', color: '#f87171',
                        display: 'flex', alignItems: 'center', gap: '8px',
                      }}>
                        ⚠️ Tidak ada kelas tersedia. Hubungi guru.
                      </div>
                    )}

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          style={{
                            padding: '10px 14px', borderRadius: '10px',
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                            color: '#f87171', fontSize: '13px', lineHeight: 1.5,
                          }}
                        >
                          ⚠️ {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit — Magnetic Button */}
                    <MagneticButton
                      id="btn-mulai-investigasi"
                      onClick={handleMulaiBelajar}
                      disabled={loading || loadingClass}
                      style={{
                        width: '100%', padding: '16px',
                        borderRadius: '14px', border: 'none',
                        background: loading || loadingClass
                          ? 'rgba(14, 131, 136, 0.3)'
                          : 'linear-gradient(90deg, #0E8388 0%, #00ADB5 100%)',
                        color: '#ffffff', fontSize: '15px', fontWeight: 900,
                        cursor: loading || loadingClass ? 'not-allowed' : 'none',
                        letterSpacing: '0.5px',
                        boxShadow: loading || loadingClass ? 'none' : '0 4px 20px rgba(14,131,136,0.3)',
                        transition: 'background 0.2s',
                        marginTop: '4px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        position: 'relative',
                      }}
                    >
                      {loading ? (
                        <>
                          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⏳</motion.span>
                          Verifikasi Identitas...
                        </>
                      ) : (
                        <>🚀 Mulai Investigasi</>
                      )}
                    </MagneticButton>
                  </div>

                  {/* Flow steps hint */}
                  <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(14,131,136,0.12)' }}>
                    <div style={{ fontSize: '10px', color: '#557A82', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '12px' }}>
                      ALUR MISI
                    </div>
                    <div style={{ display: 'flex', gap: '0', alignItems: 'center' }}>
                      {['Login', 'Diagnostik', 'GEFT', 'Investigasi'].map((step, i, arr) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? 1 : 'none' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: i === 0 ? 'rgba(14,131,136,0.15)' : 'rgba(14,131,136,0.07)',
                              border: `1px solid ${i === 0 ? 'rgba(14,131,136,0.5)' : 'rgba(14,131,136,0.15)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', fontWeight: 800,
                              color: i === 0 ? '#0E8388' : '#78716C',
                            }}>
                              {i + 1}
                            </div>
                            <span style={{ fontSize: '9px', color: i === 0 ? '#0E8388' : '#557A82', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {step}
                            </span>
                          </div>
                          {i < arr.length - 1 && (
                            <div style={{ flex: 1, height: '1px', background: 'rgba(14,131,136,0.15)', margin: '0 4px', marginBottom: '14px' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(87,83,78,0.4); }
        select { appearance: none; }
        input, select, button { cursor: inherit; }

        @media (min-width: 901px) {
          .login-card-container {
            position: sticky !important;
            top: 100px !important;
            align-self: flex-start !important;
          }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        @media (max-width: 900px) {
          .hero-layout {
            flex-direction: column-reverse !important;
            gap: 40px !important;
            padding-top: 40px !important;
          }
          .hero-layout > div {
            min-width: 100% !important;
            width: 100% !important;
          }
          .hero-h1 span { font-size: 30px !important; }
        }
        @media (max-width: 480px) {
          .hero-h1 span { font-size: 26px !important; }
        }

        /* Mobile: restore default cursor & disable cursor:none */
        @media (hover: none), (pointer: coarse) {
          * { cursor: auto !important; }
        }
      `}</style>
    </main>
  )
}