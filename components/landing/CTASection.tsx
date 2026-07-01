'use client'

import { Rocket } from 'lucide-react'
import { motion } from 'framer-motion'
import FadeIn from '@/components/landing/FadeIn'

export default function CTASection() {
  return (
    <section className="relative overflow-hidden py-20 px-6 sm:px-12 lg:px-20 text-center border-y border-[#00B4D8]/10 bg-gradient-to-b from-[#060D1F] via-[#00B4D8]/5 to-[#060D1F]">
      {/* ── Decorative Detective Desk Gradients ── */}
      <div 
        className="absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 w-[280px] h-[200px] blur-[1px] opacity-30 pointer-events-none rounded-lg hidden md:block"
        style={{
          background: 'radial-gradient(circle at top left, #5c3826 0%, #2b170c 40%, #060d1f 90%)',
        }}
      />
      <div 
        className="absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 w-[280px] h-[200px] blur-[1px] opacity-30 pointer-events-none rounded-lg hidden md:block"
        style={{
          background: 'radial-gradient(circle at top right, #5c3826 0%, #2b170c 40%, #060d1f 90%)',
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-4xl flex flex-col items-center gap-3">
        <FadeIn direction="up" delay={0}>
          <h2 className="text-4xl font-black text-white tracking-tight">
            SIAP JADI MASTER STATISTIKA?
          </h2>
        </FadeIn>
        
        <FadeIn direction="up" delay={0.1}>
          <p className="text-base text-white/50 mb-8 max-w-xl leading-relaxed">
            Mulai petualanganmu sekarang dan ungkap rahasia di balik data!
          </p>
        </FadeIn>

        <FadeIn direction="up" delay={0.2}>
          <motion.button 
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center justify-center gap-2 rounded-[10px] bg-sk-cyan px-10 py-4 text-base font-bold text-[#060D1F] transition-colors hover:bg-[#0EA5E9] cursor-pointer shadow-lg shadow-[rgba(0,180,216,0.2)] mx-auto"
          >
            <Rocket size={18} />
            Mulai Sekarang
          </motion.button>
        </FadeIn>
      </div>
    </section>
  )
}
