'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface CounterResultProps {
  totalN?: number
  onDone: () => void
}

export default function CounterResult({ totalN = 24, onDone }: CounterResultProps) {
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)
  const [btn, setBtn] = useState(false)

  useEffect(() => {
    let c = 0
    const id = setInterval(() => {
      c++
      setCount(c)
      if (c >= totalN) {
        clearInterval(id)
        setTimeout(() => setDone(true), 300)
        setTimeout(() => setBtn(true), 1100)
      }
    }, 45)
    return () => clearInterval(id)
  }, [totalN])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(20, 10, 5, 0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{
            maxWidth: 460,
            width: '100%',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
            position: 'relative',
            background: 'linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%)',
            border: '2.5px solid #F59E0B',
            borderRadius: 26,
            padding: '26px 22px',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            color: '#FEF3C7'
          }}
        >
          {/* Decorative Viewfinder Brackets */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '3px 0 0 0' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '14px', height: '14px', borderTop: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 3px 0 0' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderLeft: '3px solid #F59E0B', borderRadius: '0 0 0 3px' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '14px', height: '14px', borderBottom: '3px solid #F59E0B', borderRight: '3px solid #F59E0B', borderRadius: '0 0 3px 0' }} />

          <div>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '2px', color: '#9A3412', textTransform: 'uppercase', marginBottom: 6 }}>⚙️ MESIN PENGHITUNG DATA</div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#FEF3C7' }}>Mengagregasikan total sampel...</h3>
          </div>
          <div style={{ background: '#3D2419', border: '2.5px solid #F59E0B', borderRadius: 20, padding: '24px 20px', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 12, color: '#9A3412', fontWeight: 900, marginBottom: 8, letterSpacing: '1px', textTransform: 'uppercase' }}>JUMLAH SAMPEL (n)</div>
            <motion.div style={{ fontSize: 84, fontWeight: 900, color: '#0284C7', fontFamily: 'var(--font-data)', lineHeight: 1 }}
              animate={done ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.6 }}>{count}</motion.div>
          </div>
          <AnimatePresence>{done && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '16px 20px', borderRadius: 16, background: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid #F59E0B', fontSize: 14.5, fontWeight: 600, color: '#FEF3C7', lineHeight: 1.7, textAlign: 'left', boxShadow: 'inset 0 2px 5px rgba(140, 98, 57, 0.1)' }}>
                Kamu telah mengumpulkan seluruh data dari 4 kelas (VII-A, VII-B, VIII-A, VIII-B).<br />
                Ukuran sampel yang terkumpul adalah <strong style={{ color: '#0369A1', fontSize: 18, fontWeight: 900 }}>n = {totalN}</strong>.
              </div>
              {btn && (
                <button
                  className="game-btn game-btn-primary"
                  style={{
                    width: '100%',
                    fontSize: 15,
                    fontWeight: 900,
                    padding: '14px 20px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                    boxShadow: '0 6px 20px rgba(14, 131, 136, 0.35)',
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                    color: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                  onClick={onDone}
                >
                  Lanjut ke Perhitungan Rentang (R) ➔
                </button>
              )}
            </motion.div>
          )}</AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
