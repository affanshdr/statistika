import {
  Shield,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'

export default function FooterSection() {
  const SOCIAL_LINKS = [
    {
      icon: (
        <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      href: '#'
    },
    {
      icon: (
        <svg className="w-[18px] h-[18px] stroke-current fill-none stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      ),
      href: '#'
    },
    {
      icon: (
        <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      href: '#'
    },
    {
      icon: <MessageSquare size={18} />,
      href: '#'
    }
  ]

  return (
    <footer className="bg-[rgba(0,0,0,0.3)] border-t border-[rgba(255,255,255,0.05)] py-12 px-6">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* ── Column 1: Info ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Shield className="text-sk-cyan" size={28} />
            <span className="font-bold text-white text-lg tracking-wider">STATISTIKA</span>
          </div>
          <p className="text-[13px] leading-relaxed text-white/50">
            Platform edukasi interaktif berbasis game detektif untuk membantu siswa SMA menguasai konsep statistika secara mandiri dan kritis.
          </p>
          <div className="flex gap-2">
            {SOCIAL_LINKS.map((soc, i) => (
              <a
                key={i}
                href={soc.href}
                className="bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-white/40 hover:text-white/70 rounded-lg p-2 transition-colors duration-200"
              >
                {soc.icon}
              </a>
            ))}
          </div>
        </div>

        {/* ── Column 2: Navigasi ── */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Navigasi</h4>
          <ul className="flex flex-col gap-2">
            {['Beranda', 'Materi', 'Latihan', 'Leaderboard', 'Tentang'].map((link) => (
              <li key={link}>
                <Link
                  href="#"
                  className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Column 3: Bantuan ── */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Bantuan</h4>
          <ul className="flex flex-col gap-2">
            {[
              'FAQ',
              'Panduan',
              'Kontak',
              'Syarat & Ketentuan',
              'Kebijakan Privasi',
            ].map((link) => (
              <li key={link}>
                <Link
                  href="#"
                  className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Column 4: Newsletter ── */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Tetap Update!</h4>
          <p className="text-[13px] text-sk-text-muted leading-relaxed">
            Dapatkan tips dan info terbaru seputar statistika.
          </p>
          <div className="flex">
            <input
              type="email"
              placeholder="Email Anda"
              className="flex-1 bg-[rgba(255,255,255,0.05)] border border-r-0 border-[rgba(255,255,255,0.1)] rounded-l-lg px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none focus:border-sk-cyan transition-colors"
            />
            <button className="bg-sk-cyan hover:bg-[#0EA5E9] text-[#060D1F] font-bold px-4 py-2.5 rounded-r-lg text-sm transition-colors cursor-pointer">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="mx-auto max-w-6xl border-t border-[rgba(255,255,255,0.05)] mt-10 pt-5 flex items-center justify-between">
        <span className="text-[13px] text-[#475569]">
          © 2024 Skeptikos. All rights reserved.
        </span>
        <Shield size={16} className="text-[#475569]" />
      </div>
    </footer>
  )
}
