'use client'

import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import ProgressSection from '@/components/landing/ProgressSection'
import FeatureSection from '@/components/landing/FeatureSection'
import StatsSection from '@/components/landing/StatsSection'
import CTASection from '@/components/landing/CTASection'
import FooterSection from '@/components/landing/FooterSection'

export default function LandingPage() {
  return (
    <main className="bg-[#060D1F] min-h-screen overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <ProgressSection />
      <FeatureSection />
      <StatsSection />
      <CTASection />
      <FooterSection />
    </main>
  )
}
