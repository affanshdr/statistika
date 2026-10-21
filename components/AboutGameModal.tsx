'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AboutGameModalProps {
  isOpen: boolean
  onClose: () => void
}

type TabType = 'peta-konsep' | 'tujuan' | 'pemantik' | 'kata-kunci'

export default function AboutGameModal({ isOpen, onClose }: AboutGameModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('peta-konsep')
  const [isImageZoomed, setIsImageZoomed] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isImageZoomed) {
          setIsImageZoomed(false)
        } else {
          onClose()
        }
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isImageZoomed, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          background: 'rgba(20, 10, 5, 0.65)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '760px',
            maxHeight: '92vh',
            background: 'linear-gradient(135deg, #FDF8EC 0%, #F5E8C7 100%)',
            border: '3px solid #8C6239',
            borderRadius: '24px',
            padding: '24px 24px 20px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), inset 0 0 30px rgba(180, 140, 80, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            color: '#2C1A10',
            fontFamily: "'Outfit', 'Inter', sans-serif",
            overflow: 'hidden',
          }}
        >
          {/* Decorative Corner Viewfinder Brackets */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '16px', height: '16px', borderTop: '3px solid #8C6239', borderLeft: '3px solid #8C6239', borderRadius: '3px 0 0 0', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '16px', height: '16px', borderTop: '3px solid #8C6239', borderRight: '3px solid #8C6239', borderRadius: '0 3px 0 0', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '16px', height: '16px', borderBottom: '3px solid #8C6239', borderLeft: '3px solid #8C6239', borderRadius: '0 0 0 3px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '16px', height: '16px', borderBottom: '3px solid #8C6239', borderRight: '3px solid #8C6239', borderRadius: '0 0 3px 0', pointerEvents: 'none' }} />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Tutup Modal"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(140, 98, 57, 0.12)',
              border: '1.5px solid rgba(140, 98, 57, 0.35)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              color: '#6B4226',
              fontSize: '15px',
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
              e.currentTarget.style.background = 'rgba(140, 98, 57, 0.25)'
              e.currentTarget.style.transform = 'scale(1.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#6B4226'
              e.currentTarget.style.borderColor = 'rgba(140, 98, 57, 0.35)'
              e.currentTarget.style.background = 'rgba(140, 98, 57, 0.12)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            ✕
          </button>

          {/* Modal Header */}
          <div style={{ paddingRight: '40px', marginBottom: '14px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(14, 131, 136, 0.12)',
                border: '1px solid rgba(14, 131, 136, 0.35)',
                borderRadius: '999px',
                padding: '3px 12px',
                fontSize: '11px',
                fontWeight: 900,
                color: '#0E8388',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              <span>📘</span> KURIKULUM & MATERI PEMBELAJARAN
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(20px, 3vw, 25px)',
                fontWeight: 900,
                color: '#362014',
                fontFamily: "'Outfit', sans-serif",
                lineHeight: 1.2,
              }}
            >
              Tentang Casecode
            </h2>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '13px',
                color: '#5C4330',
                fontWeight: 600,
              }}
            >
              Media Pembelajaran Interaktif Statistika SMP Berbasis Investigasi Kasus Lingkungan Sekolah
            </p>
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              background: 'rgba(140, 98, 57, 0.1)',
              padding: '4px',
              borderRadius: '14px',
              marginBottom: '16px',
              border: '1px solid rgba(140, 98, 57, 0.2)',
              overflowX: 'auto',
              flexShrink: 0,
            }}
          >
            {[
              { id: 'peta-konsep', label: '🗺️ Peta Konsep' },
              { id: 'tujuan', label: '🎯 Tujuan Pembelajaran' },
              { id: 'pemantik', label: '💡 Pertanyaan Pemantik' },
              { id: 'kata-kunci', label: '🔑 Kata Kunci' },
            ].map(tab => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  style={{
                    flex: '1 1 auto',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isActive ? '#FFFFFF' : 'transparent',
                    color: isActive ? '#0E8388' : '#6B4226',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 2px 8px rgba(140, 98, 57, 0.2)' : 'none',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Modal Scrollable Body */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              paddingRight: '6px',
              marginRight: '-6px',
            }}
          >
            {/* ── TAB 1: PETA KONSEP ── */}
            {activeTab === 'peta-konsep' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                {/* Introduction banner */}
                <div
                  style={{
                    background: '#FFFDF7',
                    border: '1.5px solid #B48C50',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: 'inset 0 2px 5px rgba(140, 98, 57, 0.08)',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>🧭</span>
                  <div style={{ fontSize: '13px', lineHeight: 1.5, color: '#362014' }}>
                    <strong style={{ color: '#0E8388' }}>Alur Konsep Statistika:</strong> Diagram ini menunjukkan struktur materi Statistika SMP mulai dari Pengukuran Data yang terbagi menjadi Ukuran Pemusatan dan Ukuran Penyebaran Data.
                  </div>
                </div>

                {/* Concept Map Image Container */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '2px solid #B48C50',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 6px 18px rgba(140, 98, 57, 0.15)',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      maxHeight: '380px',
                      overflow: 'hidden',
                      borderRadius: '10px',
                      cursor: 'zoom-in',
                      display: 'flex',
                      justifyContent: 'center',
                      background: '#FFFFFF',
                    }}
                    onClick={() => setIsImageZoomed(true)}
                    title="Klik untuk memperbesar gambar peta konsep"
                  >
                    <img
                      src="/Assets/UI/peta-konsep.jpeg"
                      alt="Peta Konsep Statistika"
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        maxHeight: '380px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        transition: 'transform 0.2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.02)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    />
                  </div>

                  {/* Caption & Zoom Button */}
                  <div
                    style={{
                      marginTop: '10px',
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '4px 8px',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#6B4226', fontWeight: 600 }}>
                      🔍 Klik gambar untuk tampilan layar penuh
                    </span>
                    <button
                      onClick={() => setIsImageZoomed(true)}
                      style={{
                        background: '#0E8388',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#0284C7'}
                      onMouseLeave={e => e.currentTarget.style.background = '#0E8388'}
                    >
                      <span>🔍 Perbesar</span>
                    </button>
                  </div>
                </div>

                {/* Structured Breakdown Summary */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      background: '#FFFDF7',
                      border: '1.5px solid #0284C7',
                      borderRadius: '12px',
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#0369A1', fontSize: '13px', marginBottom: '4px' }}>
                      📊 Ukuran Pemusatan Data
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: 1.4 }}>
                      Terdiri dari <strong>Modus</strong>, <strong>Median</strong>, dan <strong>Rata-Rata (Mean)</strong>. Difokuskan pada penyelidikan Level 1 di ruang kelas dan fasilitas sekolah.
                    </p>
                  </div>

                  <div
                    style={{
                      background: '#FFFDF7',
                      border: '1.5px solid #D97706',
                      borderRadius: '12px',
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#B45309', fontSize: '13px', marginBottom: '4px' }}>
                      🎯 Ukuran Penyebaran Data
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: 1.4 }}>
                      Terdiri dari <strong>Jangkauan (Range)</strong>, <strong>Kuartil</strong>, dan <strong>Simpangan Kuartil</strong>. Difokuskan pada aktivitas pengukuran di Level 2 lapangan sekolah.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TAB 2: TUJUAN PEMBELAJARAN ── */}
            {activeTab === 'tujuan' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div
                  style={{
                    background: '#FFFDF7',
                    border: '1.5px solid #B48C50',
                    borderRadius: '16px',
                    padding: '14px 18px',
                    boxShadow: 'inset 0 2px 5px rgba(140, 98, 57, 0.08)',
                  }}
                >
                  <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 900, color: '#362014' }}>
                    Setelah mempelajari Bab ini diharapkan kalian dapat:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      {
                        title: 'Menentukan ukuran pemusatan data',
                        detail: 'Menghitung dan menginterpretasikan nilai modus, median, dan rata-rata (mean) dari data tunggal dan berbobot.',
                        tag: 'Pemusatan Data',
                        color: '#0284C7',
                      },
                      {
                        title: 'Menentukan ukuran penyebaran data',
                        detail: 'Menghitung jangkauan (range), kuartil bawah (Q1), kuartil tengah (Q2), kuartil atas (Q3), serta simpangan kuartil.',
                        tag: 'Penyebaran Data',
                        color: '#0D9488',
                      },
                      {
                        title: 'Menyelesaikan masalah sehari-hari yang berkaitan dengan ukuran pemusatan',
                        detail: 'Menganalisis fenomena kehidupan nyata (seperti screen time siswa SMP) secara objektif dan berbasis bukti statistik.',
                        tag: 'Aplikasi Nyata',
                        color: '#E11D48',
                      },
                      {
                        title: 'Menyelesaikan masalah sehari-hari yang berkaitan dengan ukuran penyebaran',
                        detail: 'Mengevaluasi variasi hasil dan stabilitas sebaran data (seperti jarak lemparan atletik siswa di lapangan).',
                        tag: 'Aplikasi Nyata',
                        color: '#D97706',
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid rgba(140, 98, 57, 0.25)',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: '#0E8388',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: '13px',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        >
                          ✓
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#2C1A10' }}>
                              {item.title}
                            </div>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                color: item.color,
                                background: `${item.color}15`,
                                border: `1px solid ${item.color}35`,
                                padding: '2px 8px',
                                borderRadius: '999px',
                              }}
                            >
                              {item.tag}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#555', marginTop: '4px', lineHeight: 1.45 }}>
                            {item.detail}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TAB 3: PERTANYAAN PEMANTIK ── */}
            {activeTab === 'pemantik' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <div
                  style={{
                    background: '#FFFDF7',
                    border: '1.5px solid #B48C50',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    marginBottom: '4px',
                    fontSize: '13px',
                    color: '#362014',
                    lineHeight: 1.5,
                  }}
                >
                  💡 <strong>Pertanyaan Pemantik</strong> dirancang untuk menumbuhkan rasa ingin tahu dan mendorong pola pikir analitis detektif sebelum menyelidiki data:
                </div>

                {[
                  {
                    no: '01',
                    q: 'Bagaimana menentukan modus dari suatu data?',
                    clue: 'Perhatikan data atau peristiwa yang terjadi paling sering atau paling banyak berulang di antara sekumpulan pengamatan.',
                    icon: '🎯',
                  },
                  {
                    no: '02',
                    q: 'Bagaimana menentukan median dari suatu data?',
                    clue: 'Urutkan data terlebih dahulu dari nilai terkecil hingga terbesar, lalu temukan posisi titik tengah yang membagi data menjadi dua.',
                    icon: '⚖️',
                  },
                  {
                    no: '03',
                    q: 'Bagaimana menentukan rata-rata dari suatu data?',
                    clue: 'Jumlahkan seluruh nilai pengamatan lalu bagi dengan banyaknya frekuensi data yang dikumpulkan.',
                    icon: '➗',
                  },
                  {
                    no: '04',
                    q: 'Bagaimana menentukan jangkauan dari suatu data?',
                    clue: 'Hitung selisih antara nilai tertinggi (maksimum) dan nilai terendah (minimum) untuk mengetahui rentang sebaran data.',
                    icon: '📏',
                  },
                  {
                    no: '05',
                    q: 'Bagaimana menentukan kuartil dan simpangan kuartil dari suatu data?',
                    clue: 'Bagi data terurut menjadi empat bagian sama besar untuk menemukan Q1, Q2, dan Q3, lalu cari setengah selisih antara Q3 dan Q1.',
                    icon: '📊',
                  },
                ].map(item => (
                  <div
                    key={item.no}
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #B48C50',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'flex-start',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                        color: '#FFFFFF',
                        borderRadius: '10px',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '13px',
                        flexShrink: 0,
                      }}
                    >
                      {item.no}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#1E293B', marginBottom: '4px' }}>
                        {item.q}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.45 }}>
                        <span style={{ color: '#0E8388', fontWeight: 700 }}>Petunjuk:</span> {item.clue}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ── TAB 4: KATA KUNCI ── */}
            {activeTab === 'kata-kunci' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div
                  style={{
                    background: '#FFFDF7',
                    border: '1.5px solid #B48C50',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#362014',
                    lineHeight: 1.5,
                  }}
                >
                  🔑 <strong>Kata Kunci Pokok</strong> yang wajib dikuasai siswa selama petualangan:
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '10px',
                  }}
                >
                  {[
                    {
                      term: 'Modus',
                      category: 'Ukuran Pemusatan',
                      desc: 'Nilai yang paling sering muncul atau memiliki frekuensi tertinggi dalam suatu kumpulan data.',
                      symbol: 'Mo',
                      color: '#0284C7',
                    },
                    {
                      term: 'Median',
                      category: 'Ukuran Pemusatan',
                      desc: 'Nilai tengah dari sekumpulan data yang telah diurutkan mulai dari nilai terkecil hingga terbesar.',
                      symbol: 'Me / Q2',
                      color: '#0284C7',
                    },
                    {
                      term: 'Rata-rata (Mean)',
                      category: 'Ukuran Pemusatan',
                      desc: 'Nilai perwakilan yang dihitung dengan membagi jumlah seluruh nilai data dengan total banyaknya data.',
                      symbol: 'x̄',
                      color: '#0284C7',
                    },
                    {
                      term: 'Jangkauan (Range)',
                      category: 'Ukuran Penyebaran',
                      desc: 'Selisih antara nilai tertinggi (maksimum) dengan nilai terendah (minimum) dari suatu kumpulan data.',
                      symbol: 'R = Xmax - Xmin',
                      color: '#D97706',
                    },
                    {
                      term: 'Kuartil',
                      category: 'Ukuran Penyebaran',
                      desc: 'Nilai pembagi sekumpulan data berurutan menjadi 4 bagian yang sama besar: Q1 (bawah), Q2 (tengah), dan Q3 (atas).',
                      symbol: 'Q1, Q2, Q3',
                      color: '#D97706',
                    },
                    {
                      term: 'Simpangan Kuartil',
                      category: 'Ukuran Penyebaran',
                      desc: 'Setengah dari jangkauan antarkuartil (Qd = 1/2 × [Q3 - Q1]), menunjukkan derajat persebaran data dari pusat.',
                      symbol: 'Qd',
                      color: '#D97706',
                    },
                  ].map((kw, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#FFFFFF',
                        border: '1.5px solid #B48C50',
                        borderRadius: '14px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '15px', fontWeight: 900, color: '#1E293B' }}>
                          🏷️ {kw.term}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            color: kw.color,
                            background: `${kw.color}15`,
                            border: `1px solid ${kw.color}35`,
                          }}
                        >
                          {kw.category}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.45 }}>
                        {kw.desc}
                      </p>
                      <div
                        style={{
                          marginTop: '4px',
                          padding: '4px 8px',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: '#0E8388',
                          width: 'fit-content',
                        }}
                      >
                        Rumus / Notasi: {kw.symbol}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Modal Footer */}
          <div
            style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1.5px solid rgba(140, 98, 57, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: '12px', color: '#6B4226', fontWeight: 600 }}>
              💡 Sumber: Silabus & Capaian Pembelajaran Statistika SMP
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '8px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0E8388 0%, #0284C7 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: '13px',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(14, 131, 136, 0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              Tutup
            </button>
          </div>
        </motion.div>

        {/* Fullscreen Lightbox for Concept Map Image */}
        <AnimatePresence>
          {isImageZoomed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImageZoomed(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1100,
                background: 'rgba(0, 0, 0, 0.92)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
              }}
            >
              <motion.div
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.85 }}
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'relative',
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <button
                  onClick={() => setIsImageZoomed(false)}
                  style={{
                    position: 'absolute',
                    top: '-14px',
                    right: '-14px',
                    background: '#EF4444',
                    color: '#FFFFFF',
                    border: '2px solid #FFFFFF',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    fontSize: '16px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  }}
                >
                  ✕
                </button>
                <img
                  src="/Assets/UI/peta-konsep.jpeg"
                  alt="Peta Konsep Statistika Fullscreen"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '80vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                  }}
                />
                <div style={{ marginTop: '10px', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  Peta Konsep Statistika SMP — Klik di luar gambar atau tombol ✕ untuk kembali
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
