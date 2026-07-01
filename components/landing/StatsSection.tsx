'use client'

import { useEffect, useRef, useState } from 'react'
import { Sword, Star, Gem, Trophy } from 'lucide-react'
import { useInView } from 'framer-motion'
import FadeIn from '@/components/landing/FadeIn'

function useCounter(end: number, duration: number = 1500, inView: boolean) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (!inView) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, end, duration])
  
  return count
}

export default function StatsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const count1 = useCounter(12450, 1500, inView)
  const count2 = useCounter(8250, 1500, inView)
  const count3 = useCounter(25300, 1500, inView)
  const count4 = useCounter(1250, 1500, inView)

  return (
    <section ref={ref} className="py-14 px-6 sm:px-12 lg:px-20 border-y border-white/5 bg-transparent">
      <div className="flex flex-col lg:flex-row items-center justify-between max-w-5xl mx-auto w-full gap-8 lg:gap-0">
        {/* Left stats row with dividers */}
        <div className="flex flex-col sm:flex-row items-center justify-around flex-1 w-full gap-8 sm:gap-0">
          <FadeIn delay={0}>
            <div className="flex flex-col items-center gap-2 text-center">
              <Sword className="text-[#FFD700]" size={28} />
              <span className="font-mono text-4xl font-black text-white">{count1.toLocaleString()}</span>
              <span className="text-sm text-white/50">Misi Diselesaikan</span>
            </div>
          </FadeIn>
          
          <div className="w-px h-16 bg-white/10 hidden sm:block" />
          
          <FadeIn delay={0.1}>
            <div className="flex flex-col items-center gap-2 text-center">
              <Star className="text-[#FFD700]" size={28} />
              <span className="font-mono text-4xl font-black text-white">{count2.toLocaleString()}</span>
              <span className="text-sm text-white/50">Pengguna Aktif</span>
            </div>
          </FadeIn>
          
          <div className="w-px h-16 bg-white/10 hidden sm:block" />
          
          <FadeIn delay={0.2}>
            <div className="flex flex-col items-center gap-2 text-center">
              <Gem className="text-[#A855F7]" size={28} />
              <span className="font-mono text-4xl font-black text-white">{count3.toLocaleString()}</span>
              <span className="text-sm text-white/50">Poin Dikumpulkan</span>
            </div>
          </FadeIn>
          
          <div className="w-px h-16 bg-white/10 hidden sm:block" />
          
          <FadeIn delay={0.3}>
            <div className="flex flex-col items-center gap-2 text-center">
              <Trophy className="text-[#FFD700]" size={28} />
              <span className="font-mono text-4xl font-black text-[#FFD700]">{'#' + count4.toLocaleString()}</span>
              <span className="text-sm text-white/50">Ranking Tertinggi</span>
            </div>
          </FadeIn>
        </div>

        {/* Right Chibi with speech bubble */}
        <FadeIn delay={0.4} className="hidden lg:flex items-center gap-4 ml-8 shrink-0">
          <div className="relative bg-white text-[#060D1F] text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg border border-slate-200">
            Kamu bisa jadi yang terbaik!
            {/* Pointer arrow pointing to the chibi on the right */}
            <div className="absolute top-1/2 -translate-y-1/2 left-full border-[6px] border-transparent border-l-white" />
          </div>
          <div className="relative w-12 h-16 overflow-hidden rounded-xl bg-gradient-to-b from-[#00B4D8]/20 to-transparent border border-sk-cyan/20">
            <img 
              src="/avatarbaru.png" 
              alt="Chibi Detektif" 
              className="object-contain object-top w-full h-full scale-[1.3] translate-y-1" 
            />
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
