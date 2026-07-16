'use client'

import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import JourneyMap from '@/components/JourneyMap'
import MissionCards from '@/components/MissionCards'
import AboutSection from '@/components/AboutSection'
import Footer from '@/components/Footer'

export default function LandingPage() {
  return (
    <main className="bg-[#0a1420] min-h-screen overflow-x-hidden text-[#e8dcc8] font-sans selection:bg-[#c9a961]/30 selection:text-white">
      {/* ── Sticky Navigation Bar ── */}
      <Navbar />

      {/* ── Hero Section ── */}
      <Hero />

      {/* ── Perjalanan Investigasi (Journey Map) ── */}
      <JourneyMap />

      {/* ── Misi Investigasi (Mission Cards) ── */}
      <MissionCards />

      {/* ── Tentang Kami & Kritik/Saran (Combined Section 4) ── */}
      <AboutSection />

      {/* ── Footer ── */}
      <Footer />
    </main>
  )
}
