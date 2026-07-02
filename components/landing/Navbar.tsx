'use client'

import { Shield, User } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full h-16 bg-[#060D1F] border-b border-[rgba(0,180,216,0.15)] px-6 flex items-center justify-between"
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5">
        <Shield className="text-sk-cyan" size={24} />
        <div className="flex flex-col leading-tight">
          <span className="text-white font-bold text-base">Skeptikos</span>
          <span className="text-sk-cyan text-[10px] font-semibold tracking-[0.2em]">
            INVESTIGASI DATA
          </span>
        </div>
      </div>

      {/* ── Right actions ── */}
      <div className="flex items-center gap-3">
        {/* Online badge */}
        <div className="flex items-center gap-1.5 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] rounded-full px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
          </span>
          <span className="font-mono text-xs text-[#22C55E]">ONLINE</span>
        </div>

        {/* Portal Guru button */}
        <Link href="/guru" className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[rgba(255,255,255,0.15)] bg-transparent text-white text-sm cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.05)] no-underline">
          <User size={16} />
          Portal Guru
        </Link>
      </div>
    </motion.nav>
  )
}
