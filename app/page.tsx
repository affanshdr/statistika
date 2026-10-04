'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import OrientationGuard from './siswa/game/_components/OrientationGuard'
import './siswa/game/game.css'

type Student = {
  id: string
  name: string
  nisn: string
  classroom: { name: string }
}

export default function RootHomePage() {
  const router = useRouter()
  const [studentName, setStudentName] = useState('')
  const [isStarting, setIsStarting] = useState(false)
  const [isNameModalOpen, setIsNameModalOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check if student data exists in localStorage
    const data = localStorage.getItem('student')
    if (data) {
      try {
        const parsed = JSON.parse(data) as Student
        if (parsed?.name && parsed.name !== 'Detektif') {
          setStudentName(parsed.name)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  useEffect(() => {
    if (isNameModalOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isNameModalOpen])

  const handleOpenPlayModal = () => {
    setIsNameModalOpen(true)
  }

  const handleStartGame = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const finalName = studentName.trim()
    if (!finalName) return
    setIsStarting(true)

    let studentData = {
      id: 'detektif-guest',
      name: finalName,
      nisn: '-',
      classroom: { name: 'Kelas XII' }
    }

    try {
      const classRes = await fetch('/api/classrooms')
      if (classRes.ok) {
        const classrooms = await classRes.json()
        const defaultClass = classrooms[0]
        if (defaultClass?.id) {
          const studentRes = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: finalName, classroomId: defaultClass.id }),
          })
          if (studentRes.ok) {
            const dbStudent = await studentRes.json()
            if (dbStudent?.id) {
              studentData = dbStudent
            }
          }
        }
      }
    } catch (err) {
      console.warn('DB Sync fallback to local guest session:', err)
    }

    localStorage.setItem('student', JSON.stringify(studentData))

    setTimeout(() => {
      // Direct launch into Siswa Corkboard Dashboard
      router.push('/siswa')
    }, 400)
  }



  return (
    <OrientationGuard lockScreen={true}>
      <main
        style={{
          minHeight: '100dvh',
          height: '100dvh',
          width: '100vw',
          overflow: 'hidden',
          position: 'relative',
          backgroundImage: 'url("/Assets/Building/Splash Screen/Splash Screen.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: '0',
          color: '#F8FAFC',
          fontFamily: "'Outfit', 'Inter', sans-serif",
          userSelect: 'none',
        }}
      >
        {/* Dark Ambient Vignette Overlay - Protects eyes from glare & enhances button contrast */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, rgba(7, 19, 30, 0.12) 0%, rgba(7, 19, 30, 0.42) 100%)',
            pointerEvents: 'none',
          }}
        />



        {/* ── MAIN ACTION BUTTON (PLAY BUTTON) ── */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '320px',
            padding: '12px',
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 45px rgba(0, 173, 181, 0.8), 0 8px 30px rgba(0,0,0,0.7)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenPlayModal}
            style={{
              width: '100%',
              padding: '18px 36px',
              fontSize: '24px',
              fontWeight: 900,
              letterSpacing: '4px',
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #00ADB5 0%, #2563EB 100%)',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '20px',
              cursor: 'pointer',
              boxShadow: '0 0 35px rgba(0, 173, 181, 0.6), 0 8px 24px rgba(0,0,0,0.6)',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <span style={{ fontSize: '22px' }}>▶</span> PLAY
          </motion.button>
        </motion.div>

        {/* ── POPUP MODAL (WARM DETECTIVE CREAM / CORKBOARD PAPER THEME) ── */}
        <AnimatePresence>
          {isNameModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isStarting && setIsNameModalOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                background: 'rgba(7, 19, 30, 0.82)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '390px',
                  background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
                  border: '2.5px solid #8C6239',
                  borderRadius: '24px',
                  padding: '30px 24px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), inset 0 0 25px rgba(180, 140, 80, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                {/* Decorative Viewfinder Brackets */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', width: '14px', height: '14px', borderTop: '3px solid #8C6239', borderLeft: '3px solid #8C6239', borderRadius: '3px 0 0 0' }} />
                <div style={{ position: 'absolute', top: '10px', right: '10px', width: '14px', height: '14px', borderTop: '3px solid #8C6239', borderRight: '3px solid #8C6239', borderRadius: '0 3px 0 0' }} />
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '14px', height: '14px', borderBottom: '3px solid #8C6239', borderLeft: '3px solid #8C6239', borderRadius: '0 0 0 3px' }} />
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '14px', height: '14px', borderBottom: '3px solid #8C6239', borderRight: '3px solid #8C6239', borderRadius: '0 0 3px 0' }} />

                {/* Close Button */}
                <button
                  onClick={() => setIsNameModalOpen(false)}
                  disabled={isStarting}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(140, 98, 57, 0.1)',
                    border: '1px solid rgba(140, 98, 57, 0.3)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    color: '#6B4226',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    zIndex: 10,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#362014'
                    e.currentTarget.style.borderColor = '#8C6239'
                    e.currentTarget.style.background = 'rgba(140, 98, 57, 0.2)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#6B4226'
                    e.currentTarget.style.borderColor = 'rgba(140, 98, 57, 0.3)'
                    e.currentTarget.style.background = 'rgba(140, 98, 57, 0.1)'
                  }}
                >
                  ✕
                </button>

                {/* Title & Description */}
                <h3
                  style={{
                    margin: '0 0 6px 0',
                    fontSize: '22px',
                    fontWeight: 900,
                    letterSpacing: '0.5px',
                    color: '#362014',
                    textAlign: 'center',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  Identitas Siswa
                </h3>
                <p
                  style={{
                    margin: '0 0 22px 0',
                    fontSize: '13px',
                    color: '#524336',
                    textAlign: 'center',
                    lineHeight: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Masukkan nama panggilanmu untuk mencatat sesi investigasi dan progres permainan.
                </p>

                {/* Form Input */}
                <form onSubmit={handleStartGame} style={{ width: '100%' }}>
                  <div style={{ marginBottom: '22px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 900,
                        color: '#9A3412',
                        letterSpacing: '1.5px',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                      }}
                    >
                      NAMA LENGKAP / PANGGILAN
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Contoh: Stevunt"
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      disabled={isStarting}
                      required
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '14px 18px',
                        borderRadius: '16px',
                        background: '#FFFDF7',
                        border: '2px solid #B48C50',
                        color: '#2C1A10',
                        fontSize: '15px',
                        textAlign: 'center',
                        outline: 'none',
                        fontWeight: 800,
                        transition: 'all 0.2s',
                        boxShadow: 'inset 0 2px 5px rgba(140, 98, 57, 0.15), 0 2px 6px rgba(0,0,0,0.04)',
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = '#0E8388'
                        e.currentTarget.style.boxShadow = '0 0 16px rgba(14, 131, 136, 0.35)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = '#B48C50'
                        e.currentTarget.style.boxShadow = 'inset 0 2px 5px rgba(140, 98, 57, 0.15), 0 2px 6px rgba(0,0,0,0.04)'
                      }}
                    />
                  </div>

                  {/* Confirm & Start Button */}
                  <motion.button
                    whileHover={studentName.trim() && !isStarting ? { scale: 1.02, boxShadow: '0 8px 25px rgba(14, 131, 136, 0.45)' } : {}}
                    whileTap={studentName.trim() && !isStarting ? { scale: 0.97 } : {}}
                    type="submit"
                    disabled={isStarting || !studentName.trim()}
                    style={{
                      width: '100%',
                      padding: '15px 24px',
                      fontSize: '16px',
                      fontWeight: 900,
                      letterSpacing: '2px',
                      color: '#FFFFFF',
                      background: studentName.trim() && !isStarting
                        ? 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)'
                        : 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
                      border: '1.5px solid rgba(255, 255, 255, 0.4)',
                      borderRadius: '16px',
                      cursor: isStarting || !studentName.trim() ? 'not-allowed' : 'pointer',
                      opacity: isStarting || !studentName.trim() ? 0.7 : 1,
                      boxShadow: studentName.trim() && !isStarting ? '0 6px 20px rgba(14, 131, 136, 0.35)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isStarting ? (
                      <>
                        <span className="spinner" style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙️</span> MEMUAT...
                      </>
                    ) : (
                      <>
                        MULAI PETUALANGAN ▶
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </OrientationGuard>
  )
}