'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface Checkpoint {
  id: number
  title: string
  subtitle: string
  description: string
  coords: { left: string; top: string }
}

const CHECKPOINTS: Checkpoint[] = [
  {
    id: 1,
    title: 'Login',
    subtitle: 'Mulai Perjalanan',
    description: 'Masuk ke markas detektif untuk memulai investigasi data kasus screen time.',
    coords: { left: '6.15%', top: '60.3%' },
  },
  {
    id: 2,
    title: 'Game 1',
    subtitle: 'Distribusi Frekuensi',
    description: 'Pelajari distribusi frekuensi, selesaikan kuis gerbang, dan buat histogram.',
    coords: { left: '27.4%', top: '46.1%' },
  },
  {
    id: 3,
    title: 'Game 2',
    subtitle: 'Mean, Median, & Modus',
    description: 'Investigasi nilai pusat data untuk menganalisis kebiasaan screen time.',
    coords: { left: '49.9%', top: '51.0%' },
  },
  {
    id: 4,
    title: 'Game 3',
    subtitle: 'Kurva & Distribusi',
    description: 'Bandingkan grafik distribusi frekuensi dengan kurva teoritis normal.',
    coords: { left: '69.9%', top: '48.1%' },
  },
  {
    id: 5,
    title: 'Finish',
    subtitle: 'Selesai & Verdict',
    description: 'Kumpulkan semua barang bukti untuk menarik verdict akhir dan dapatkan lencana.',
    coords: { left: '86.15%', top: '37.0%' },
  },
]

// Street lamp lanterns coordinates overlay mapping
interface StreetLamp {
  id: number
  left: string
  top: string
  animation: string
  delay: string
}

const STREET_LAMPS: StreetLamp[] = [
  { id: 1, left: '12.8%', top: '45.0%', animation: 'lamp-pulse 4s infinite ease-in-out', delay: '0s' },
  { id: 2, left: '34.8%', top: '34.0%', animation: 'lamp-flicker 5s infinite ease-in-out', delay: '1.2s' },
  { id: 3, left: '58.7%', top: '33.5%', animation: 'lamp-pulse 3s infinite ease-in-out', delay: '0.4s' },
  { id: 4, left: '77.0%', top: '35.5%', animation: 'lamp-pulse 4.5s infinite ease-in-out', delay: '2.1s' },
  { id: 5, left: '93.6%', top: '24.5%', animation: 'lamp-flicker 6s infinite ease-in-out', delay: '0.8s' },
]

export default function JourneyMap() {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [activePoint, setActivePoint] = useState<number | null>(1) // Show CP 1 tooltip initially

  // Animation path state (Only animateCoords triggers render)
  const [avatarCoords, setAvatarCoords] = useState({ x: 9.17, y: 66.39 }) // Start position (M176 597.5)
  const [isPausing, setIsPausing] = useState(true) // Start paused at CP 1
  const [isAvatarVisible, setIsAvatarVisible] = useState(true)

  const progressRef = useRef(0)
  const lastCheckpointPausedRef = useRef<number>(1) // Mark CP 1 as paused initially
  const pathRef = useRef<SVGPathElement>(null)

  // On mount: Wait 2 seconds showing Misi 1 popup, then start walking
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPausing(false)
      setActivePoint(null)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // 60FPS animation loop along the SVG path
  useEffect(() => {
    let animFrameId: number

    const updatePosition = () => {
      if (isPausing) {
        animFrameId = requestAnimationFrame(updatePosition)
        return
      }

      if (pathRef.current) {
        const totalLength = pathRef.current.getTotalLength()
        const prev = progressRef.current

        // Increment progress: 0.0008 per frame (~21 seconds for a complete loop)
        let next = prev + 0.0008
        if (next >= 1.0) {
          next = 1.0
        }

        progressRef.current = next

        // Sample coordinate along the path length
        const currentLength = totalLength * next
        const point = pathRef.current.getPointAtLength(currentLength)

        setAvatarCoords({
          x: (point.x / 1920) * 100,
          y: (point.y / 900) * 100,
        })

        // Checkpoint progress percentage thresholds along the SVG path (ID 1 is handled in teleport/mount)
        const checkpointsList = [
          { id: 2, val: 0.235 },   // Checkpoint 2 (575 442)
          { id: 3, val: 0.485 },   // Checkpoint 3 (1018.5 520)
          { id: 4, val: 0.745 },   // Checkpoint 4 (1402.5 464)
          { id: 5, val: 0.998 },   // Finish Checkpoint 5 (1708 349)
        ]

        // Trigger pausing when avatar crosses a checkpoint threshold
        for (const cp of checkpointsList) {
          if (prev < cp.val && next >= cp.val && lastCheckpointPausedRef.current !== cp.id) {
            setIsPausing(true)
            lastCheckpointPausedRef.current = cp.id
            setActivePoint(cp.id)

            if (cp.id === 5) {
              // Checkpoint 5: Pause 2 seconds showing tooltip, disappear, wait 1s, teleport back to Misi 1
              setTimeout(() => {
                setIsAvatarVisible(false)
                setActivePoint(null)

                // Wait 1 second while invisible
                setTimeout(() => {
                  progressRef.current = 0
                  setAvatarCoords({ x: 9.17, y: 66.39 })
                  lastCheckpointPausedRef.current = 1
                  setIsAvatarVisible(true)
                  setActivePoint(1) // Show Misi 1 tooltip immediately upon reappearing

                  // Pause at Misi 1 for 2 seconds, then start walking again
                  setTimeout(() => {
                    setActivePoint(null)
                    setIsPausing(false)
                  }, 2000)

                }, 1000)
              }, 2000)
            } else {
              // Checkpoints 2, 3, 4: Pause for 2 seconds showing tooltip, then continue
              setTimeout(() => {
                setIsPausing(false)
                setActivePoint(null)
              }, 2000)
            }
            break // Exit loop once triggered
          }
        }
      }

      animFrameId = requestAnimationFrame(updatePosition)
    }

    animFrameId = requestAnimationFrame(updatePosition)
    return () => cancelAnimationFrame(animFrameId)
  }, [isPausing])

  return (
    <section id="misi" className="relative py-16 bg-[#050b12] px-4 sm:px-6 lg:px-8">
      {/* Inline styles for flickering noir street lamps */}
      <style>{`
        @keyframes lamp-pulse {
          0%, 100% { opacity: 0.7; transform: scale(0.95); }
          50% { opacity: 1.0; transform: scale(1.05); }
        }
        @keyframes lamp-flicker {
          0%, 100% { opacity: 0.75; transform: scale(0.98); }
          45% { opacity: 0.8; transform: scale(1.0); }
          47% { opacity: 0.25; transform: scale(0.85); }
          49% { opacity: 0.95; transform: scale(1.08); }
          51% { opacity: 0.4; transform: scale(0.9); }
          53% { opacity: 0.85; transform: scale(1.0); }
          80% { opacity: 0.75; transform: scale(0.98); }
        }
      `}</style>

      {/* ── DESKTOP VIEW: Full-Map Card Frame (roadmapnew fills the container completely) ── */}
      <div className="hidden lg:block max-w-[80rem] mx-auto border border-[#c9a961]/20 rounded-3xl bg-[#0a1420]/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden aspect-[2.13/1]">

        {/* Background Map filling the card wrapper */}
        <Image
          src="/images/roadmapnew.png"
          alt="Peta Perjalanan Investigasi"
          fill
          sizes="(max-width: 1024px) 100vw, 1280px"
          className="object-cover pointer-events-none select-none z-0"
          priority
        />

        {/* Ambient Dark Gradient overlay for top header readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/20 z-10 pointer-events-none"></div>

        {/* Invisible Dash Trail Path from SVG (keeps coordinates functional but removes visual lines) */}
        <svg
          viewBox="0 0 1920 900"
          className="absolute inset-0 w-full h-full z-15 pointer-events-none opacity-0"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            ref={pathRef}
            d="M176 597.5C243.94 614.985 308 628.5 383.5 561C459 493.5 492.156 460.496 575 442C661 431 775.5 555 834 561C892.5 567 1018.5 520 1018.5 520C1018.5 520 1172.5 421 1220.5 405C1268.5 389 1372.5 438 1402.5 464C1432.5 490 1543.5 532 1616.5 501.5C1689.5 471 1734.5 422 1708 349"
            stroke="transparent"
            strokeWidth="3.5"
            strokeDasharray="8 8"
            className="opacity-0"
            strokeLinecap="round"
          />
        </svg>

        {/* Glowing street lamp overlays */}
        {STREET_LAMPS.map((lamp) => (
          <div
            key={lamp.id}
            className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              left: lamp.left,
              top: lamp.top,
              width: '4%',
              height: '8.5%',
            }}
          >
            {/* Core golden light bulb */}
            <div
              className="w-full h-full rounded-full blur-[3px] mix-blend-screen"
              style={{
                background: 'radial-gradient(circle, rgba(254, 243, 199, 1) 0%, rgba(234, 179, 8, 0.7) 40%, rgba(234, 179, 8, 0) 70%)',
                animation: lamp.animation,
                animationDelay: lamp.delay
              }}
            />
            {/* Wider ambient halo light */}
            <div
              className="absolute inset-[-120%] rounded-full blur-[8px] mix-blend-screen"
              style={{
                background: 'radial-gradient(circle, rgba(234, 179, 8, 0.28) 0%, rgba(234, 179, 8, 0.08) 50%, rgba(234, 179, 8, 0) 80%)',
                animation: lamp.animation,
                animationDelay: lamp.delay
              }}
            />
          </div>
        ))}

        {/* Corner Gold Frame Ornaments */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#c9a961]/30 rounded-tl-2xl z-20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#c9a961]/30 rounded-tr-2xl z-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#c9a961]/30 rounded-bl-2xl z-20 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#c9a961]/30 rounded-br-2xl z-20 pointer-events-none"></div>

        {/* Section Header Overlapping on top of the Background */}
        <div className="absolute top-6 left-0 right-0 text-center z-20 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#d4af37] uppercase mb-1"
          >
            Peta Pembelajaran
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-[family-name:var(--font-cinzel)] text-xl sm:text-2xl lg:text-3xl font-black text-[#c9a961] tracking-wide"
          >
            PERJALANAN INVESTIGASI
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] sm:text-xs text-[#8b7e6a] mt-1 font-semibold max-w-xl mx-auto"
          >
            Selesaikan setiap misi secara berurutan untuk menjadi Detektif Data sejati!
          </motion.p>
        </div>

        {/* ── AUTOMATED SLIDING AVATAR ── */}
        <div
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-[92%] w-24 h-24 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] transition-all duration-75"
          style={{
            left: `${avatarCoords.x}%`,
            top: `${avatarCoords.y}%`,
            opacity: isAvatarVisible ? 1 : 0,
            visibility: isAvatarVisible ? 'visible' : 'hidden',
          }}
        >
          {/* Glowing pedestal path helper under the avatar */}
          <span className="absolute left-1/2 bottom-0 -translate-x-1/2 w-10 h-2 bg-[#c9a961]/45 rounded-full blur-[2px] animate-pulse"></span>

          <Image
            src="/images/avatar.png"
            alt="Detektif Avatar"
            width={96}
            height={96}
            className="object-contain"
            priority
          />

          {/* Active Tooltip Pop-up directly above the Avatar's Head */}
          <AnimatePresence>
            {activePoint && (() => {
              const cp = CHECKPOINTS.find((c) => c.id === activePoint)
              if (!cp) return null

              return (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 25,
                    scale: 0.8,
                    x: cp.id === 1 ? '15%' : cp.id === 5 ? '-75%' : '-50%'
                  }}
                  animate={{
                    opacity: 1,
                    y: [25, -20, 8, -4, 0], // Hop/bounce animation sequence on mount
                    scale: 1,
                    x: cp.id === 1 ? '15%' : cp.id === 5 ? '-75%' : '-50%'
                  }}
                  exit={{
                    opacity: 0,
                    y: 15,
                    scale: 0.8,
                    x: cp.id === 1 ? '15%' : cp.id === 5 ? '-75%' : '-50%'
                  }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                  className={`absolute bottom-[115%] z-30 w-[260px] bg-[#0a1420]/95 border border-[#c9a961]/40 rounded-xl p-4 shadow-[0_0_25px_rgba(201,169,97,0.4),_0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md text-left pointer-events-auto ${cp.id === 1
                    ? 'left-0'
                    : cp.id === 5
                      ? 'right-0 left-auto'
                      : 'left-1/2'
                    }`}
                >
                  {/* Top Little Tip Pointer Arrow pointing down to the avatar */}
                  <div className={`absolute top-full border-8 border-transparent border-t-[#c9a961]/40 ${cp.id === 1
                    ? 'left-[16px] translate-x-0'
                    : cp.id === 5
                      ? 'right-[16px] left-auto translate-x-0'
                      : 'left-1/2 -translate-x-1/2'
                    }`}></div>
                  <div className={`absolute top-full border-7 border-transparent border-t-[#0a1420] ${cp.id === 1
                    ? 'left-[17px] translate-x-0'
                    : cp.id === 5
                      ? 'right-[17px] left-auto translate-x-0'
                      : 'left-1/2 -translate-x-1/2'
                    }`}></div>

                  {/* Checkpoint Badge Number */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono tracking-widest font-black text-[#d4af37] bg-[#c9a961]/10 px-2 py-0.5 rounded border border-[#c9a961]/35">
                      MISI 0{cp.id}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4a90d9]" />
                  </div>

                  {/* Title */}
                  <h4 className="font-[family-name:var(--font-cinzel)] font-bold text-xs text-[#e8dcc8] leading-tight mb-1">
                    {cp.title}
                  </h4>
                  <span className="text-[10px] font-sans font-bold text-[#8b7e6a] uppercase tracking-wide block mb-2">
                    {cp.subtitle}
                  </span>

                  {/* Description */}
                  <p className="text-[10px] text-[#8b7e6a] leading-relaxed font-medium">
                    {cp.description}
                  </p>
                </motion.div>
              )
            })()}
          </AnimatePresence>
        </div>

        {/* Overlapping interactive trigger zones */}
        {CHECKPOINTS.map((cp) => {
          const isHovered = hoveredPoint === cp.id

          return (
            <div
              key={cp.id}
              className="absolute z-20 group"
              style={{
                left: cp.coords.left,
                top: cp.coords.top,
                width: '5.2%',
                height: '10%',
              }}
              onMouseEnter={() => setHoveredPoint(cp.id)}
              onMouseLeave={() => setHoveredPoint(null)}
              onClick={() => setHoveredPoint(isHovered ? null : cp.id)}
            >
              <div className="relative w-full h-full cursor-pointer">

                {/* Dynamic Tooltip Info Card (Only shown for manual hover/clicks) */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 35,
                        scale: 0.8,
                        x: cp.id === 1 ? '0%' : cp.id === 5 ? '0%' : '-50%'
                      }}
                      animate={{
                        opacity: 1,
                        y: [35, -20, 8, -4, 0], // Hop/bounce animation sequence on mount
                        scale: 1,
                        x: cp.id === 1 ? '0%' : cp.id === 5 ? '0%' : '-50%'
                      }}
                      exit={{
                        opacity: 0,
                        y: 15,
                        scale: 0.8,
                        x: cp.id === 1 ? '0%' : cp.id === 5 ? '0%' : '-50%'
                      }}
                      transition={{ duration: 0.65, ease: 'easeOut' }}
                      className={`absolute bottom-[115%] z-30 w-[260px] bg-[#0a1420]/95 border border-[#c9a961]/40 rounded-xl p-4 shadow-[0_0_25px_rgba(201,169,97,0.4),_0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md text-left ${cp.id === 1
                        ? 'left-0'
                        : cp.id === 5
                          ? 'right-0 left-auto'
                          : 'left-1/2'
                        }`}
                    >
                      {/* Top Little Tip Pointer Arrow */}
                      <div className={`absolute top-full border-8 border-transparent border-t-[#c9a961]/40 ${cp.id === 1
                        ? 'left-[16px] translate-x-0'
                        : cp.id === 5
                          ? 'right-[16px] left-auto translate-x-0'
                          : 'left-1/2 -translate-x-1/2'
                        }`}></div>
                      <div className={`absolute top-full border-7 border-transparent border-t-[#0a1420] ${cp.id === 1
                        ? 'left-[17px] translate-x-0'
                        : cp.id === 5
                          ? 'right-[17px] left-auto translate-x-0'
                          : 'left-1/2 -translate-x-1/2'
                        }`}></div>

                      {/* Checkpoint Badge Number */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono tracking-widest font-black text-[#d4af37] bg-[#c9a961]/10 px-2 py-0.5 rounded border border-[#c9a961]/35">
                          MISI 0{cp.id}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4a90d9]" />
                      </div>

                      {/* Title */}
                      <h4 className="font-[family-name:var(--font-cinzel)] font-bold text-xs text-[#e8dcc8] leading-tight mb-1">
                        {cp.title}
                      </h4>
                      <span className="text-[10px] font-sans font-bold text-[#8b7e6a] uppercase tracking-wide block mb-2">
                        {cp.subtitle}
                      </span>

                      {/* Description */}
                      <p className="text-[10px] text-[#8b7e6a] leading-relaxed font-medium">
                        {cp.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          )
        })}

      </div>

      {/* ── MOBILE VIEW: Vertical Roadmap Timeline (Renders inside a container frame) ── */}
      <div className="block lg:hidden max-w-md mx-auto relative px-2 border border-[#c9a961]/20 rounded-3xl p-6 bg-[#0a1420]/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md overflow-hidden">

        {/* Corner Gold Frame Ornaments */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#c9a961]/30 rounded-tl-2xl z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#c9a961]/30 rounded-tr-2xl z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-[#c9a961]/30 rounded-bl-2xl z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#c9a961]/30 rounded-br-2xl z-10 pointer-events-none"></div>

        {/* Mobile Section Header */}
        <div className="text-center mb-8">
          <span className="text-[9px] font-sans font-bold tracking-[0.2em] text-[#d4af37] uppercase block mb-1">
            Peta Pembelajaran
          </span>
          <h2 className="font-[family-name:var(--font-cinzel)] text-lg font-black text-[#c9a961] tracking-wide">
            PERJALANAN INVESTIGASI
          </h2>
        </div>

        {/* Vertical Connecting Line */}
        <div className="absolute left-[51px] top-28 bottom-12 w-0.5 bg-gradient-to-b from-[#c9a961]/60 via-[#c9a961]/30 to-[#4a90d9]/40 z-0"></div>

        <div className="flex flex-col gap-6 relative z-10">
          {CHECKPOINTS.map((cp) => (
            <motion.div
              key={cp.id}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex gap-4 items-start"
            >
              {/* Circular Number Indicator Badge */}
              <div className="w-10 h-10 rounded-full border border-[#c9a961]/40 bg-[#0a1420] flex items-center justify-center font-[family-name:var(--font-cinzel)] font-black text-xs text-[#c9a961] shadow-[0_0_12px_rgba(201,169,97,0.15)] flex-shrink-0 relative">
                <div className="absolute inset-0.5 rounded-full border border-dashed border-[#c9a961]/25"></div>
                {cp.id}
              </div>

              {/* Card Content Box */}
              <div className="flex-1 bg-[#050b12]/90 border border-[#c9a961]/15 rounded-xl p-4 shadow-md text-left">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-[family-name:var(--font-cinzel)] font-bold text-xs text-[#e8dcc8]">
                    {cp.title}
                  </h4>
                  <span className="text-[8px] font-mono font-bold tracking-widest text-[#d4af37]">
                    MISI 0{cp.id}
                  </span>
                </div>
                <span className="text-[9px] font-sans font-bold text-[#8b7e6a] uppercase tracking-wider block mb-2">
                  {cp.subtitle}
                </span>
                <p className="text-[10px] text-[#8b7e6a] leading-relaxed">
                  {cp.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </section>
  )
}
