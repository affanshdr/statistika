'use client'

import Image from 'next/image'

// Custom SVG Icons for socials
const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
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

const YoutubeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="10 15 15 12 10 9" />
  </svg>
)

const DiscordIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18.5 4h-13A2.5 2.5 0 0 0 3 6.5v11A2.5 2.5 0 0 0 5.5 20h13a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 18.5 4z" />
    <path d="M7 10.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0zm7 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0z" />
    <path d="M8 15c1.8 1.5 4.2 1.5 6 0" />
  </svg>
)

export default function Footer() {
  return (
    <footer className="relative bg-[#050b12] py-12 px-4 sm:px-6 lg:px-8 border-t border-[#c9a961]/10">
      <div className="max-w-[95rem] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 overflow-hidden rounded-md border border-[#c9a961]/30 bg-[#101c2c] p-1 flex items-center justify-center">
            <Image
              src="/images/logo-icon.png"
              alt="Skeptikos Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-[family-name:var(--font-cinzel)] font-bold text-base tracking-wider text-[#c9a961]">
              Skeptikos
            </span>
            <span className="text-[9px] font-sans tracking-[0.25em] text-[#4a90d9] uppercase -mt-1 font-bold">
              Investigasi Data
            </span>
          </div>
        </div>

        {/* Center: Copyright */}
        <div className="text-xs text-[#8b7e6a] font-medium">
          © 2026 Skeptikos. All rights reserved.
        </div>

        {/* Right: Social Icons */}
        <div className="flex items-center gap-3">
          <a
            href="https://instagram.com/skeptikos.id"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full border border-[#8b7e6a]/20 hover:border-[#d4af37] flex items-center justify-center text-[#8b7e6a] hover:text-[#d4af37] transition-all bg-[#0a1420]/40"
            aria-label="Instagram"
          >
            <InstagramIcon />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full border border-[#8b7e6a]/20 hover:border-[#d4af37] flex items-center justify-center text-[#8b7e6a] hover:text-[#d4af37] transition-all bg-[#0a1420]/40"
            aria-label="YouTube"
          >
            <YoutubeIcon />
          </a>
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full border border-[#8b7e6a]/20 hover:border-[#d4af37] flex items-center justify-center text-[#8b7e6a] hover:text-[#d4af37] transition-all bg-[#0a1420]/40"
            aria-label="Discord"
          >
            <DiscordIcon />
          </a>
        </div>

      </div>
    </footer>
  )
}
