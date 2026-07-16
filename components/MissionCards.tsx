'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'

interface Mission {
  tag: string
  title: string
  description: string
  image: string
  href: string
  buttonText: string
  isFeedback?: boolean
}

const MISSIONS: Mission[] = [
  {
    tag: 'GAME 1',
    title: 'Distribusi Frekuensi, Histogram, & Analisis Krisis',
    description: 'Kelola dan analisis data untuk memahami distribusi serta mengidentifikasi potensi krisis.',
    image: '/images/card-distribusi.png',
    href: '/siswa/game/level/1',
    buttonText: 'Mulai Misi',
  },
  {
    tag: 'GAME 2',
    title: 'Mean, Median, & Modus',
    description: 'Temukan nilai pusat data dan jadilah ahli dalam mengukur kecenderungan data.',
    image: '/images/card-mean.png',
    href: '/siswa/game/level/2',
    buttonText: 'Mulai Misi',
  },
  {
    tag: 'GAME 3',
    title: 'Kurva & Distribusi',
    description: 'Jelajahi berbagai kurva distribusi dan pahami pola di balik data.',
    image: '/images/card-histogram.png',
    href: '/siswa/game/level/3',
    buttonText: 'Isi Saran',
    isFeedback: true,
  },
]

export default function MissionCards() {
  return (
    <section id="misi" className="relative py-16 bg-[#050b12] px-4 sm:px-6 lg:px-8">
      {/* Large Outer Border Frame Container wrapping the entire section */}
      <div className="max-w-[95rem] mx-auto border border-[#c9a961]/20 rounded-3xl p-6 sm:p-8 bg-[#0a1420]/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden">

        {/* Corner Gold Frame Ornaments */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#c9a961]/30 rounded-tl-2xl"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#c9a961]/30 rounded-tr-2xl"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#c9a961]/30 rounded-bl-2xl"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#c9a961]/30 rounded-br-2xl"></div>

        {/* Section Header */}
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-[family-name:var(--font-cinzel)] text-2xl sm:text-3xl font-black text-[#c9a961] tracking-wide"
          >
            Misi Investigasi
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-xs sm:text-sm text-[#8b7e6a] mt-2 font-medium"
          >
            Pilih misimu dan asah kemampuan statistikamu!
          </motion.p>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MISSIONS.map((m, idx) => (
            <motion.div
              key={m.tag}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col bg-[#050b12] border border-[#c9a961]/15 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:border-[#c9a961]/40"
            >
              {/* Card Image Header */}
              <div className="relative h-56 w-full overflow-hidden border-b border-[#c9a961]/10 bg-[#050b12]">
                <Image
                  src={m.image}
                  alt={m.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover opacity-85 transition-transform duration-500 hover:scale-103"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050b12] to-transparent"></div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1 gap-4 text-left">
                {/* Pill Tag */}
                <div>
                  <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-wider rounded-md bg-[#0f2a3a] text-[#4a90d9] border border-[#4a90d9]/25">
                    {m.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-[family-name:var(--font-cinzel)] font-bold text-base text-[#e8dcc8] leading-snug tracking-wide min-h-[48px] hover:text-[#d4af37] transition-colors duration-200">
                  {m.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-[#8b7e6a] leading-relaxed flex-1 font-medium">
                  {m.description}
                </p>

                {/* Button Action */}
                <div className="pt-2">
                  <Link
                    href={m.href}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-sans text-xs font-bold tracking-wider text-center text-[#e8dcc8] bg-[#0c1c28] border border-[#c9a961]/25 hover:border-[#c9a961]/60 hover:bg-[#0f2838] transition-all duration-300"
                  >
                    {m.isFeedback && <Send size={12} className="text-[#c9a961]" />}
                    <span>{m.buttonText}</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
