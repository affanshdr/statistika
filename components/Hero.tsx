'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy, Settings, Database, LineChart, Brain } from 'lucide-react'

export default function Hero() {
  return (
    <section id="beranda" className="relative min-h-screen pt-28 pb-20 flex items-center overflow-hidden bg-[#050b12]">
      {/* ── Background & Ambient Glows ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/bg-section1.png"
          alt="Noir City Background"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        {/* Soft gradient from left-to-right to ensure text readability on the left while keeping the background on the right bright */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050b12] via-[#050b12]/80 to-transparent"></div>
        {/* Dark vignette at the very bottom to blend with the next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050b12] to-transparent"></div>
        {/* Ambient gold glow on the right (matching the desk lamp) */}
        <div className="absolute bottom-[10%] right-[5%] w-[450px] h-[450px] rounded-full bg-[#c9a961]/10 blur-[130px] pointer-events-none"></div>
        {/* Ambient blue glow on the left (matching the data theme) */}
        <div className="absolute top-[25%] left-[5%] w-[350px] h-[350px] rounded-full bg-[#4a90d9]/5 blur-[110px] pointer-events-none"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Main Content Layout */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[calc(100vh-8rem)]">

          {/* ── Left Column: Headline, Description & Features ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-6 flex flex-col gap-6 text-left relative z-20 max-w-xl"
          >
            {/* National Competition Badge */}
            <div className="inline-flex items-center gap-2 self-start rounded-md border border-[#c9a961]/30 bg-[#c9a961]/10 px-3.5 py-1.5 shadow-[0_0_15px_rgba(201,169,97,0.1)]">
              <Trophy size={14} className="text-[#d4af37]" />
              <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                LIDM IPDP 2026
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-[family-name:var(--font-cinzel)] font-black text-3xl sm:text-4xl lg:text-5xl leading-[1.15] text-[#e8dcc8] tracking-tight">
              Jadi Detektif Data,<br />
              Ungkap Klaim <span className="text-[#d4af37] drop-shadow-[0_2px_10px_rgba(212,169,97,0.25)]">Viral</span><br />
              dengan <span className="text-[#4a90d9] drop-shadow-[0_2px_10px_rgba(74,144,217,0.25)]">Statistika!</span>
            </h1>

            {/* Description */}
            <p className="text-[#8b7e6a] text-sm sm:text-base leading-relaxed font-semibold">
              Platform game edukasi adaptif yang menggabungkan profil kognitif{' '}
              <span className="text-[#c9a961] font-black">FI/FD</span>, investigasi data nyata,
              dan visualisasi histogram interaktif untuk pembelajaran statistika SMA yang menyenangkan.
            </p>

            {/* CTA Button */}
            <div className="mt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-lg bg-gradient-to-r from-[#c9a961] to-[#d4af37] text-[#0a1420] font-black tracking-wider uppercase text-sm shadow-[0_4px_25px_rgba(212,169,97,0.35)] hover:shadow-[0_6px_35px_rgba(212,169,97,0.55)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>🔍</span> Mulai Investigasi
              </Link>
            </div>

            {/* 4 Feature Items */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-8 border-t border-[#c9a961]/15 pt-8 max-w-xl">
              {/* Feature 1 */}
              <div className="flex flex-col items-center lg:items-start gap-2.5 text-center lg:text-left">
                <div className="w-11 h-11 rounded-lg bg-[#050b12]/80 border border-[#c9a961]/30 flex items-center justify-center text-[#c9a961] shadow-[0_0_15px_rgba(201,169,97,0.15)]">
                  <Settings size={18} />
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-[#8b7e6a] leading-tight">
                  Pembelajaran<br />Adaptif
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center lg:items-start gap-2.5 text-center lg:text-left">
                <div className="w-11 h-11 rounded-lg bg-[#050b12]/80 border border-[#c9a961]/30 flex items-center justify-center text-[#c9a961] shadow-[0_0_15px_rgba(201,169,97,0.15)]">
                  <Database size={18} />
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-[#8b7e6a] leading-tight">
                  Data Nyata<br />& Terkini
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center lg:items-start gap-2.5 text-center lg:text-left">
                <div className="w-11 h-11 rounded-lg bg-[#050b12]/80 border border-[#c9a961]/30 flex items-center justify-center text-[#c9a961] shadow-[0_0_15px_rgba(201,169,97,0.15)]">
                  <LineChart size={18} />
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-[#8b7e6a] leading-tight">
                  Visualisasi<br />Interaktif
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col items-center lg:items-start gap-2.5 text-center lg:text-left">
                <div className="w-11 h-11 rounded-lg bg-[#050b12]/80 border border-[#c9a961]/30 flex items-center justify-center text-[#c9a961] shadow-[0_0_15px_rgba(201,169,97,0.15)]">
                  <Brain size={18} />
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-[#8b7e6a] leading-tight">
                  Belajar Statistik<br />Lebih Menyenangkan
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Empty to allow the background image elements (laptop, notebook, lamp, etc.) to show through */}
          <div className="lg:col-span-6 hidden lg:block" />

        </div>
      </div>
    </section>
  )
}
