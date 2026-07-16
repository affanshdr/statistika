'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-[#0a1420]/95 backdrop-blur-md border-b border-[#c9a961]/20 shadow-[0_4px_30px_rgba(10,20,32,0.5)] py-3'
        : 'bg-transparent border-b border-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 overflow-hidden rounded-md border border-[#c9a961]/30 bg-[#101c2c] p-1 flex items-center justify-center transition-all duration-300 group-hover:border-[#d4af37] group-hover:shadow-[0_0_10px_rgba(212,169,97,0.3)]">
              <Image
                src="/images/logo-icon.png"
                alt="Skeptikos Logo"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-[family-name:var(--font-cinzel)] font-bold text-lg tracking-wider text-[#c9a961] group-hover:text-[#d4af37] transition-colors">
                Skeptikos
              </span>
              <span className="text-[9px] font-sans tracking-[0.25em] text-[#8b7e6a] uppercase -mt-1 font-bold">
                Investigasi Data
              </span>
            </div>
          </Link>

          {/* Desktop Menu - Removed as requested */}
          <div className="hidden md:flex items-center gap-8">
            {/* Empty space */}
          </div>

          {/* Right Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-[11px] font-mono font-bold tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              ONLINE
            </div>

            {/* Portal Guru Link */}
            <Link
              href="/guru"
              className="text-xs font-bold text-[#e8dcc8] hover:text-[#d4af37] px-4 py-2.5 rounded-md border border-[#c9a961]/25 hover:border-[#d4af37]/50 bg-[#101c2c]/40 hover:bg-[#1a2c42]/60 transition-all duration-200"
            >
              Portal Guru
            </Link>

            {/* Login Link */}
            <Link
              href="/"
              className="text-xs font-bold text-[#0a1420] px-5 py-2.5 rounded-md bg-gradient-to-r from-[#c9a961] to-[#d4af37] hover:from-[#d4af37] hover:to-[#e8c56a] transition-all duration-300 shadow-[0_2px_15px_rgba(212,169,97,0.25)] hover:shadow-[0_4px_20px_rgba(212,169,97,0.4)]"
            >
              Login
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-[10px] font-mono font-bold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
              </span>
              ONLINE
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#e8dcc8] hover:text-[#d4af37] p-1.5 rounded-md focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a1420] border-b border-[#c9a961]/20 px-4 pt-2 pb-6 space-y-4 shadow-xl">
          {/* Menu links removed as requested */}
          <div className="flex flex-col gap-3 pt-3">
            <Link
              href="/guru"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center text-sm font-bold text-[#e8dcc8] hover:text-[#d4af37] py-2.5 rounded-md border border-[#c9a961]/25 hover:border-[#d4af37]/50 bg-[#101c2c] transition-colors"
            >
              Portal Guru
            </Link>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center text-sm font-bold text-[#0a1420] py-2.5 rounded-md bg-gradient-to-r from-[#c9a961] to-[#d4af37] transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
