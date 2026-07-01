'use client'

import {
  Trophy,
  Lock,
  Satellite,
  Rocket,
  User,
  ChevronDown,
  GraduationCap,
  Microscope,
  Brain,
  BookOpen,
} from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'

const STEPS = [
  { label: 'LOGIN', active: true },
  { label: 'DIAGNOSTIK', active: false },
  { label: 'GEFT', active: false },
  { label: 'INVESTIGASI', active: false },
]

export default function HeroSection() {
  const { scrollY } = useScroll()
  
  // Parallax, scale, fade and blur animations bound to page scroll coordinates
  const bgOpacity = useTransform(scrollY, [0, 500], [1, 0])
  const bgScale = useTransform(scrollY, [0, 500], [1, 1.05])
  const bgY = useTransform(scrollY, [0, 500], [0, 80])
  const bgBlur = useTransform(scrollY, [0, 500], ["blur(0px)", "blur(6px)"])

  return (
    <section className="min-h-screen px-6 sm:px-12 lg:px-20 pt-16 pb-12 flex flex-col justify-center relative overflow-hidden bg-transparent">
      {/* Scroll-driven parallax background wrapper */}
      <motion.div 
        style={{ 
          opacity: bgOpacity, 
          scale: bgScale, 
          y: bgY, 
          filter: bgBlur,
          backgroundImage: "url('/background.png')" 
        }}
        className="absolute inset-0 bg-cover bg-top bg-no-repeat pointer-events-none z-0"
      />
      
      {/* Dark overlay for extra readability */}
      <div className="absolute inset-0 bg-[#060D1F]/10 pointer-events-none z-0" />

      <div className="mx-auto w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[480px_1fr_380px] gap-8 items-center min-h-[calc(100vh-140px)] lg:-mt-12 relative z-10">
        {/* ═══════ KOLOM KIRI ═══════ */}
        <div className="flex flex-col gap-6 lg:py-2">
          <div className="flex flex-col gap-4">
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0 }}
              className="inline-flex items-center gap-2 self-start rounded-md border border-[rgba(255,215,0,0.3)] bg-[rgba(255,215,0,0.1)] px-3 py-1.5"
            >
              <Trophy size={14} className="text-sk-gold" />
              <span className="font-mono text-xs text-sk-gold">LIDM IPDP 2026</span>
            </motion.div>

            {/* Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-[800] leading-[1.12] tracking-tight text-white"
            >
              Jadi Detektif Data,
              <br />
              Ungkap Klaim <span className="text-sk-cyan">Viral</span>
              <br />
              dengan <span className="text-sk-cyan">Statistika!</span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm text-slate-200 leading-relaxed mt-1 font-medium"
            >
              Platform game edukasi adaptif yang menggabungkan profil kognitif{' '}
              <span className="text-sk-cyan font-bold">FI/FD</span>, investigasi data nyata,
              dan visualisasi histogram interaktif untuk pembelajaran statistika SMA yang menyenangkan.
            </motion.p>
          </div>

          {/* 2x2 Feature Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {/* Card 1 */}
            <div className="rounded-xl border border-white/10 bg-[#121620]/90 backdrop-blur-md p-4 flex flex-col gap-2 shadow-lg shadow-black/30">
              <Microscope className="text-sk-cyan shrink-0" size={20} />
              <div>
                <div className="text-xs font-bold text-white">Tes Diagnostik Awal</div>
                <div className="text-[11px] text-slate-300 mt-1 leading-normal">
                  Ukur kemampuan statistika awal untuk jalur belajar yang dipersonalisasi.
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-xl border border-white/10 bg-[#121620]/90 backdrop-blur-md p-4 flex flex-col gap-2 shadow-lg shadow-black/30">
              <Brain className="text-[#EC4899] shrink-0" size={20} />
              <div>
                <div className="text-xs font-bold text-white">Gaya Kognitif FI / FD</div>
                <div className="text-[11px] text-slate-300 mt-1 leading-normal">
                  Profil Field Independent & Field Dependent via tes GEFT terintegrasi.
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-xl border border-white/10 bg-[#121620]/90 backdrop-blur-md p-4 flex flex-col gap-2 shadow-lg shadow-black/30">
              <span className="text-lg shrink-0 select-none">🕵️‍♂️</span>
              <div>
                <div className="text-xs font-bold text-white">Game Investigasi Data</div>
                <div className="text-[11px] text-slate-300 mt-1 leading-normal">
                  Selesaikan misi detektif: ungkap klaim viral menggunakan histogram & statistika.
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="rounded-xl border border-white/10 bg-[#121620]/90 backdrop-blur-md p-4 flex flex-col gap-2 shadow-lg shadow-black/30">
              <BookOpen className="text-sk-cyan shrink-0" size={20} />
              <div>
                <div className="text-xs font-bold text-white">Buku Saku Detektif</div>
                <div className="text-[11px] text-slate-300 mt-1 leading-normal">
                  Pelajari distribusi, outlier, dan mean vs median lewat animasi interaktif.
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom Mini Stats Row */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-6 sm:gap-10 mt-2 border-t border-white/5 pt-4"
          >
            <div>
              <div className="text-2xl font-black text-sk-cyan tracking-tight font-mono">15 soal</div>
              <div className="text-[10px] text-white/60 font-semibold mt-0.5 uppercase tracking-wider">Tes Diagnostik</div>
            </div>
            <div>
              <div className="text-2xl font-black text-sk-cyan tracking-tight font-mono">35 data</div>
              <div className="text-[10px] text-white/60 font-semibold mt-0.5 uppercase tracking-wider">Dataset Nyata</div>
            </div>
            <div>
              <div className="text-2xl font-black text-sk-cyan tracking-tight font-mono">3 materi</div>
              <div className="text-[10px] text-white/60 font-semibold mt-0.5 uppercase tracking-wider">Buku Saku</div>
            </div>
          </motion.div>
        </div>

        {/* ═══════ KOLOM TENGAH (Spacer untuk Karakter Background) ═══════ */}
        <div className="hidden lg:block w-full h-[500px]" />

        {/* ═══════ KOLOM KANAN — Login Card ═══════ */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full lg:w-[380px] lg:min-w-[380px] lg:max-w-[380px] shrink-0 flex flex-col gap-5 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#121620] p-6 h-fit relative shadow-xl shadow-black/40"
        >
          {/* Lock icon absolute at top right */}
          <div className="absolute top-6 right-6 text-white/40">
            <Lock size={20} />
          </div>

          {/* Header */}
          <div className="flex flex-col gap-1">
            <div className="text-lg font-bold text-white">Masuk ke Markas</div>
            <div className="text-xs text-white/40">
              Identifikasi dirimu, Detektif!
            </div>
          </div>

          {/* Mission banner */}
          <div className="flex gap-2.5 rounded-lg border border-white/5 bg-[#0B0F17] px-3.5 py-2.5">
            <Satellite size={16} className="text-[#94A3B8] mt-0.5 shrink-0" />
            <div>
              <div className="font-mono text-[9px] tracking-[0.15em] text-[#94A3B8] uppercase">
                MISI AKTIF
              </div>
              <div className="text-xs text-white/80 mt-0.5">
                Ungkap Klaim Viral Screen Time Remaja
              </div>
            </div>
          </div>

          {/* Input: Nama */}
          <div className="flex flex-col gap-1.5">
            <label className="block font-mono text-[10px] tracking-[0.15em] uppercase text-white/40">
              NAMA DETEKTIF
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Masukkan nama lengkapmu..."
                className="w-full rounded-lg border border-white/10 bg-[#090D14] pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-sk-cyan/40 transition-colors"
              />
            </div>
          </div>

          {/* Select: Kelas */}
          <div className="flex flex-col gap-1.5">
            <label className="block font-mono text-[10px] tracking-[0.15em] uppercase text-white/40">
              UNIT / KELAS
            </label>
            <div className="relative">
              <GraduationCap size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <select 
                defaultValue=""
                className="w-full appearance-none rounded-lg border border-white/10 bg-[#090D14] pl-10 pr-10 py-3 text-sm text-white outline-none focus:border-sk-cyan/40 transition-colors [&>option]:bg-[#121620]"
              >
                <option value="" disabled>
                  — Pilih Unit —
                </option>
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>
          </div>

          {/* Submit button */}
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00E5FF] px-4 py-3.5 text-sm font-bold text-[#060D1F] transition-all hover:bg-[#00B4D8] cursor-pointer shadow-lg shadow-[#00E5FF]/20 hover:shadow-[#00B4D8]/30">
            <Rocket size={16} />
            Mulai Investigasi
          </button>

          {/* Divider */}
          <div className="h-px bg-white/5" />

          {/* Alur misi */}
          <div>
            <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-white/40 mb-3">
              ALUR MISI
            </div>
            <div className="flex items-start">
              {STEPS.map((step, i) => (
                <div key={step.label} className="flex items-start flex-1">
                  {/* Node + label */}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        step.active
                          ? 'bg-[#00B4D8] text-[#060D1F]'
                          : 'border border-white/10 text-white/30 bg-[#090D14]'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span
                      className={`font-mono text-[9px] tracking-wider ${
                        step.active ? 'text-sk-cyan font-bold' : 'text-white/30'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px bg-white/5 mt-3.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-60 text-white select-none pointer-events-none">
        <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center p-1">
          <motion.div 
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 bg-sk-cyan rounded-full"
          />
        </div>
        <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-white/40">
          Scroll untuk mulai petualanganmu
        </span>
      </div>
    </section>
  )
}
