'use client'

import {
  Gamepad2,
  Gem,
  BarChart3,
  Trophy,
  ArrowUpRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import FadeIn from '@/components/landing/FadeIn'

const CARDS = [
  {
    icon: Gamepad2,
    iconBg: 'bg-[#00B4D8]/10',
    iconColor: 'text-[#00B4D8]',
    hoverBorder: 'hover:border-[#00B4D8]',
    title: 'Misi Interaktif',
    desc: 'Selesaikan misi seru dengan tantangan statistika nyata!',
    accentHover: 'group-hover:text-[#00B4D8]',
  },
  {
    icon: Gem,
    iconBg: 'bg-[#A855F7]/10',
    iconColor: 'text-[#A855F7]',
    hoverBorder: 'hover:border-[#A855F7]',
    title: 'Poin & Reward',
    desc: 'Kumpulkan poin, dapatkan badge, dan tingkatkan levelmu!',
    accentHover: 'group-hover:text-[#A855F7]',
  },
  {
    icon: BarChart3,
    iconBg: 'bg-[#00B4D8]/10',
    iconColor: 'text-[#00B4D8]',
    hoverBorder: 'hover:border-[#00B4D8]',
    title: 'Visualisasi Keren',
    desc: 'Pahami data dengan grafik interaktif dan visual yang menarik!',
    accentHover: 'group-hover:text-[#00B4D8]',
  },
  {
    icon: Trophy,
    iconBg: 'bg-[#FFD700]/10',
    iconColor: 'text-[#FFD700]',
    hoverBorder: 'hover:border-[#FFD700]',
    title: 'Leaderboard',
    desc: 'Bersaing dengan teman-temanmu dan jadi top Data Explorer!',
    accentHover: 'group-hover:text-[#FFD700]',
  },
] as const

const DELAYS = [0.05, 0.12, 0.19, 0.26]

export default function FeatureSection() {
  return (
    <section className="py-[60px] px-6 sm:px-12 lg:px-20">
      <div className="mx-auto w-full max-w-6xl">
        {/* ── Header Row ── */}
        <FadeIn delay={0}>
          <div className="flex items-center gap-4 mb-[40px]">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#00B4D8]" />
            <span className="font-mono font-bold text-white tracking-[0.2em] text-sm whitespace-nowrap px-4">
              FITUR GAME EDUKASI
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#00B4D8]" />
          </div>
        </FadeIn>

        {/* ── Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CARDS.map((card, i) => (
            <FadeIn key={card.title} delay={DELAYS[i]}>
              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`bg-white/3 border border-white/7 rounded-2xl p-6 flex flex-col gap-4 group cursor-pointer transition-all duration-200 ${card.hoverBorder}`}
              >
                {/* Icon Box */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${card.iconBg}`}>
                  <card.icon size={24} className={card.iconColor} />
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white">{card.title}</h3>

                {/* Description */}
                <p className="text-sm text-white/50 leading-relaxed flex-1">
                  {card.desc}
                </p>

                {/* Bottom Icon */}
                <div className="flex justify-end">
                  <ArrowUpRight size={16} className={`text-white/20 ${card.accentHover} transition-colors`} />
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
