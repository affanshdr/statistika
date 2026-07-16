'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, MapPin, Send, Cpu, BarChart3, LineChart } from 'lucide-react'

// Custom SVGs for Socials
const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

export default function AboutSection() {
  const [suggestion, setSuggestion] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!suggestion.trim()) return

    setStatus('submitting')
    setTimeout(() => {
      console.log('Suggestion submitted:', suggestion)
      setStatus('success')
      setSuggestion('')
      setTimeout(() => setStatus('idle'), 3000)
    }, 1000)
  }

  return (
    <section id="tentang" className="relative py-16 bg-[#050b12] px-4 sm:px-6 lg:px-8">
      {/* Large Outer Border Frame Container wrapping the entire section */}
      <div className="max-w-[95rem] mx-auto border border-[#c9a961]/20 rounded-3xl p-8 sm:p-12 bg-[#0a1420]/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden">

        {/* Corner Gold Frame Ornaments */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#c9a961]/30 rounded-tl-2xl"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#c9a961]/30 rounded-tr-2xl"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#c9a961]/30 rounded-bl-2xl"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#c9a961]/30 rounded-br-2xl"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-stretch">

          {/* ── Column 1: Tentang Kami ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="flex flex-col text-left gap-6"
          >
            <h3 className="font-[family-name:var(--font-cinzel)] font-bold text-xl text-[#e8dcc8] tracking-wide">
              Tentang Kami
            </h3>
            <p className="text-xs text-[#8b7e6a] leading-relaxed">
              Skeptikos adalah platform game edukasi statistik untuk siswa SMA yang dirancang agar belajar data menjadi petualangan detektif yang seru dan bermanka.
            </p>

            {/* Feature List */}
            <div className="flex flex-col gap-5 mt-2">
              {/* Feature 1 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#0c1a28] border border-[#c9a961]/20 flex items-center justify-center text-[#4a90d9] flex-shrink-0">
                  <Cpu size={18} />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-xs text-[#c9a961]">
                    Pembelajaran Adaptif
                  </h4>
                  <p className="text-[11px] text-[#8b7e6a] mt-0.5 leading-normal">
                    Disesuaikan dengan profil kognitif FI/FD.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#0c1a28] border border-[#c9a961]/20 flex items-center justify-center text-[#4a90d9] flex-shrink-0">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-xs text-[#c9a961]">
                    Data Nyata
                  </h4>
                  <p className="text-[11px] text-[#8b7e6a] mt-0.5 leading-normal">
                    Studi kasus dan data dari dunia nyata.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#0c1a28] border border-[#c9a961]/20 flex items-center justify-center text-[#4a90d9] flex-shrink-0">
                  <LineChart size={18} />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-xs text-[#c9a961]">
                    Visualisasi Interaktif
                  </h4>
                  <p className="text-[11px] text-[#8b7e6a] mt-0.5 leading-normal">
                    Belajar statistik jadi lebih mudah dipahami.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Column 2: Hubungi Kami ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="flex flex-col text-left gap-6 border-t lg:border-t-0 lg:border-x border-[#c9a961]/15 pt-8 lg:pt-0 lg:px-12"
          >
            <div>
              <h3 className="font-[family-name:var(--font-cinzel)] font-bold text-xl text-[#e8dcc8] tracking-wide">
                Hubungi Kami
              </h3>
              <p className="text-xs text-[#8b7e6a] mt-1 font-medium">
                Kami siap membantu!
              </p>
            </div>

            {/* Contact Items */}
            <div className="flex flex-col gap-6 mt-2">
              <a href="mailto:hello@skeptikos.id" className="flex items-center gap-4 group">
                <div className="text-[#4a90d9] group-hover:text-[#d4af37] transition-colors"><Mail size={18} /></div>
                <span className="text-xs font-semibold text-[#8b7e6a] group-hover:text-[#e8dcc8] transition-colors">
                  hello@skeptikos.id
                </span>
              </a>

              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                <div className="text-[#4a90d9] group-hover:text-[#d4af37] transition-colors"><Phone size={18} /></div>
                <span className="text-xs font-semibold text-[#8b7e6a] group-hover:text-[#e8dcc8] transition-colors">
                  +62 812-3456-7890
                </span>
              </a>

              <a href="https://instagram.com/skeptikos.id" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                <div className="text-[#4a90d9] group-hover:text-[#d4af37] transition-colors"><InstagramIcon size={18} /></div>
                <span className="text-xs font-semibold text-[#8b7e6a] group-hover:text-[#e8dcc8] transition-colors">
                  @skeptikos.id
                </span>
              </a>

              <div className="flex items-center gap-4">
                <div className="text-[#4a90d9]"><MapPin size={18} /></div>
                <span className="text-xs font-semibold text-[#8b7e6a]">
                  Banda Aceh, Indonesia
                </span>
              </div>
            </div>
          </motion.div>

          {/* ── Column 3: Kirim Saranmu ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
            className="flex flex-col text-left gap-6 pt-8 lg:pt-0"
          >
            <div>
              <h3 className="font-[family-name:var(--font-cinzel)] font-bold text-xl text-[#e8dcc8] tracking-wide">
                Kirim Saranmu
              </h3>
              <p className="text-xs text-[#8b7e6a] mt-1 font-medium">
                Bantu kami jadi lebih baik!
              </p>
            </div>

            {/* Simple feedback form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <textarea
                  required
                  rows={4}
                  placeholder="Tulis saranmu di sini..."
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  disabled={status === 'submitting'}
                  className="w-full rounded-lg border border-[#c9a961]/25 bg-[#050b12]/60 px-4 py-3 text-xs text-[#e8dcc8] placeholder-[#8b7e6a]/40 outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all resize-none font-medium"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={status === 'submitting' || !suggestion.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#0c2a3a] border border-[#c9a961]/25 hover:border-[#c9a961]/60 hover:bg-[#0f3448] text-[#e8dcc8] text-xs font-bold tracking-wider uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Kirim Saran</span>
                  <Send size={12} className="text-[#c9a961]" />
                </button>
              </div>

              {/* Status display */}
              <AnimatePresence>
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-green-400 text-[11px] font-bold text-center mt-1"
                  >
                    ✓ Saran berhasil terkirim!
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
