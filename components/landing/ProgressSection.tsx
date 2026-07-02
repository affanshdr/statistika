'use client'

import React from 'react'
import {
  ChevronRight,
  FolderOpen,
  Fingerprint,
  BarChart3,
  Lock,
} from 'lucide-react'
import { motion } from 'framer-motion'
import FadeIn from '@/components/landing/FadeIn'

type StatusState = 'done' | 'active' | 'pending' | 'locked'

const STEPS = [
  {
    num: '1',
    icon: FolderOpen,
    label: 'Pemula',
    status: 'Selesai',
    state: 'done' as StatusState,
  },
  {
    num: '2',
    icon: Fingerprint,
    label: 'Dasar Statistika',
    status: 'Sedang Berlangsung',
    state: 'active' as StatusState,
  },
  {
    num: '3',
    icon: BarChart3,
    label: 'Distribusi Data',
    status: 'Belum Dimulai',
    state: 'pending' as StatusState,
  },
  {
    num: '4',
    icon: Lock,
    label: 'Uji Hipotesis',
    status: 'Terkunci',
    state: 'locked' as StatusState,
  },
  {
    num: '5',
    icon: Lock,
    label: 'Regresi & Korelasi',
    status: 'Terkunci',
    state: 'locked' as StatusState,
  },
]

export default function ProgressSection() {
  return (
    <section className="bg-[rgba(255,255,255,0.01)] border-y border-[rgba(255,255,255,0.05)] py-[60px] px-6 sm:px-12 lg:px-20">
      <div className="mx-auto w-full max-w-6xl">
        {/* ── Header Row ── */}
        <FadeIn delay={0}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-[40px]">
            <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#00B4D8] hidden sm:block" />
              <span className="font-mono font-bold text-white tracking-[0.2em] text-sm whitespace-nowrap px-4 w-full text-center sm:text-left">
                PROGRES PETUALANGANMU
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#00B4D8] hidden lg:block" />
            </div>
            
            <button className="border border-white/10 text-white/60 text-xs px-4 py-2 rounded-lg flex items-center gap-2 hover:border-white/20 transition-all cursor-pointer w-full sm:w-auto justify-center">
              Lihat Peta Misi
              <ChevronRight size={14} />
            </button>
          </div>
        </FadeIn>

        {/* ── Steps Flow ── */}
        <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-6 lg:gap-0">
          {STEPS.map((step, i) => {
            const isDone = step.state === 'done'
            const isActive = step.state === 'active'
            const isPending = step.state === 'pending'
            
            // Icon component
            const StepIcon = step.icon

            // Styling variables based on status
            let numCircleBorder = 'border-white/10 text-white/30'
            let cardStyle = 'bg-white/3 border-white/10 text-white/20'
            let labelColor = 'text-white/30'
            let statusColor = 'text-white/20'
            let iconColor = 'text-white/20'

            if (isDone) {
              numCircleBorder = 'border-[#22C55E] text-[#22C55E]'
              cardStyle = 'bg-[#22C55E]/10 border-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.1)]'
              labelColor = 'text-white'
              statusColor = 'text-[#22C55E]'
              iconColor = 'text-[#22C55E]'
            } else if (isActive) {
              numCircleBorder = 'border-[#00B4D8] text-[#00B4D8]'
              cardStyle = 'bg-[#00B4D8]/10 border-[#00B4D8] shadow-[0_0_15px_rgba(0,180,216,0.15)]'
              labelColor = 'text-white'
              statusColor = 'text-[#00B4D8]'
              iconColor = 'text-[#00B4D8]'
            } else if (isPending) {
              numCircleBorder = 'border-white/20 text-white/40'
              cardStyle = 'bg-white/5 border-white/20 text-white/40'
              labelColor = 'text-white/60'
              statusColor = 'text-white/40'
              iconColor = 'text-white/40'
            }

            // Connection line color
            let lineColor = 'border-white/5'
            if (i === 0) {
              lineColor = 'border-[#22C55E]/50'
            } else if (i === 1) {
              lineColor = 'border-[#00B4D8]/30'
            }

            return (
              <React.Fragment key={step.label}>
                {/* Node Card */}
                <FadeIn delay={i * 0.12}>
                  <div className="flex flex-col items-center gap-4 flex-shrink-0 relative">
                    
                    {/* Glowing rounded square card container */}
                    <div className={`w-16 h-16 border-2 rounded-2xl flex items-center justify-center relative ${cardStyle}`}>
                      {/* Status Number circle absolute positioned on top */}
                      <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border bg-[#060D1F] flex items-center justify-center text-[10px] font-mono font-bold ${numCircleBorder}`}>
                        {step.num}
                      </div>

                      <StepIcon size={22} className={iconColor} />
                    </div>

                    {/* Node Labels below */}
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-sm font-bold ${labelColor} text-center`}>
                        {step.label}
                      </span>
                      <span className={`text-xs font-mono font-medium ${statusColor}`}>
                        {step.status}
                      </span>
                    </div>
                  </div>
                </FadeIn>

                {/* Line connector */}
                {i < STEPS.length - 1 && (
                  <>
                    {/* Desktop horizontal connector */}
                    <motion.div 
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.4, delay: i * 0.12 + 0.1 }}
                      style={{ originX: 0 }}
                      className={`hidden lg:block flex-1 border-t-2 border-dashed mb-10 ${lineColor}`}
                    />
                    
                    {/* Mobile vertical connector */}
                    <motion.div 
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.4, delay: i * 0.12 + 0.1 }}
                      style={{ originY: 0 }}
                      className={`lg:hidden w-px h-8 border-l-2 border-dashed my-2 ${lineColor}`}
                    />
                  </>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </section>
  )
}
