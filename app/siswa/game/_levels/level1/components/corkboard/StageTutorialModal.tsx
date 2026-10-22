'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { STAGE_TUTORIALS, TutorialExampleItem } from './corkboardData'

export interface StageTutorialModalProps {
  stage: 'sort' | 'modus' | 'median' | 'mean'
  onClose: () => void
}

export default function StageTutorialModal({ stage, onClose }: StageTutorialModalProps) {
  const tutorial = STAGE_TUTORIALS[stage]
  if (!tutorial) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 800,
        background: 'rgba(15, 8, 4, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(10px, 2vh, 20px) clamp(12px, 2vw, 24px)',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 16 }}
        transition={{ type: 'spring', damping: 24, stiffness: 340 }}
        data-testid="stage-tutorial-modal"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 'clamp(360px, 60vw, 640px)',
          maxHeight: '92vh',
          background: 'linear-gradient(180deg, #FFFDF8 0%, #FAF3E6 100%)',
          border: '2.5px solid #8C6239',
          borderRadius: 'clamp(12px, 1.8vw, 18px)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.3) inset',
          display: 'flex',
          flexDirection: 'column',
          color: '#1E1B18',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* Push Pin Hiasan */}
        <div style={{ position: 'absolute', top: '10px', left: '16px', zIndex: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.68629 2 6 4.68629 6 8C6 11.5 10.5 17 12 18.5C13.5 17 18 11.5 18 8C18 4.68629 15.3137 2 12 2Z" fill="#B45309" />
            <circle cx="12" cy="8" r="3" fill="#FDE68A" />
            <line x1="12" y1="18.5" x2="12" y2="23" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Header Modal */}
        <div style={{
          padding: 'clamp(12px, 1.8vh, 18px) clamp(16px, 2.2vw, 24px) clamp(8px, 1.2vh, 12px) clamp(44px, 5vw, 56px)',
          borderBottom: '1.5px solid rgba(140, 98, 57, 0.25)',
          background: 'rgba(140, 98, 57, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          position: 'relative',
        }}>
          {/* Tombol Tutup Silang */}
          <button
            data-testid="btn-close-tutorial"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '14px',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: '1.5px solid rgba(140, 98, 57, 0.35)',
              background: '#FFFDF7',
              color: '#78350F',
              fontSize: '15px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              transition: 'all 0.15s ease',
            }}
            title="Tutup panduan materi"
          >
            ✕
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 'clamp(8.5px, 1vw, 10px)',
              fontWeight: 900,
              color: '#FFFFFF',
              background: '#362014',
              padding: '2px 8px',
              borderRadius: '999px',
              letterSpacing: '0.5px',
            }}>
              TAHAP {tutorial.stepNum} DARI 4
            </span>
            <span style={{
              fontSize: 'clamp(8.5px, 1vw, 10px)',
              fontWeight: 900,
              color: tutorial.badgeColor,
              background: 'rgba(255, 255, 255, 0.9)',
              border: `1.5px solid ${tutorial.badgeColor}`,
              padding: '1.5px 8px',
              borderRadius: '999px',
            }}>
              {tutorial.tag.toUpperCase()}
            </span>
          </div>

          <h3 style={{
            margin: '4px 0 0',
            fontSize: 'clamp(14px, 1.8vw, 18px)',
            fontWeight: 900,
            color: '#27150B',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>{tutorial.icon}</span>
            <span>{tutorial.title}</span>
          </h3>
        </div>

        {/* Scrollable Body Modal */}
        <div
          data-testid="stage-tutorial-body"
          className="corkboard-scroll-area"
          style={{
            padding: 'clamp(12px, 1.8vh, 18px) clamp(16px, 2.2vw, 24px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(10px, 1.5vh, 14px)',
            overflowY: 'auto',
            maxHeight: 'calc(92vh - 130px)',
            boxSizing: 'border-box',
          }}
        >
          {/* Card 1: Konsep Inti */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid rgba(140, 98, 57, 0.28)',
            borderRadius: '10px',
            padding: 'clamp(10px, 1.5vh, 14px)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          }}>
            <h4 style={{
              margin: '0 0 6px',
              fontSize: 'clamp(11px, 1.3vw, 13px)',
              fontWeight: 900,
              color: '#362014',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>📖</span>
              <span>{tutorial.conceptHeading}</span>
            </h4>
            <p style={{
              margin: 0,
              fontSize: 'clamp(9.5px, 1.15vw, 12px)',
              color: '#475569',
              lineHeight: 1.5,
            }}>
              {tutorial.conceptText}
            </p>
          </div>

          {/* Card 2: Rumus / Prinsip Matematis (jika ada) */}
          {tutorial.formula && (
            <div style={{
              background: 'linear-gradient(180deg, #1E1B18 0%, #2A2420 100%)',
              border: '2px solid #B48C50',
              borderRadius: '10px',
              padding: 'clamp(10px, 1.5vh, 14px)',
              color: '#FEF3C7',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            }}>
              <div style={{
                fontSize: 'clamp(8.5px, 1vw, 10.5px)',
                fontWeight: 900,
                color: '#FDE68A',
                letterSpacing: '0.5px',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}>
                <span>📐</span>
                <span>{tutorial.formula.title}</span>
              </div>
              <div style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px dashed rgba(253, 230, 138, 0.4)',
                borderRadius: '6px',
                padding: 'clamp(6px, 1vh, 8px) 12px',
                fontFamily: 'monospace',
                fontSize: 'clamp(11.5px, 1.4vw, 14.5px)',
                fontWeight: 900,
                color: '#86EFAC',
                textAlign: 'center',
                margin: '6px 0',
                letterSpacing: '0.4px',
              }}>
                {tutorial.formula.equation}
              </div>
              <p style={{
                margin: 0,
                fontSize: 'clamp(9px, 1.1vw, 11px)',
                color: '#E2E8F0',
                lineHeight: 1.4,
              }}>
                {tutorial.formula.explanation}
              </p>
            </div>
          )}

          {/* Card 3: Contoh Langsung */}
          {(() => {
            const exampleList: TutorialExampleItem[] = tutorial.examples && tutorial.examples.length > 0
              ? tutorial.examples
              : tutorial.example
              ? [tutorial.example]
              : []

            if (exampleList.length === 0) return null

            return (
              <div style={{
                background: 'linear-gradient(180deg, #FFFDF8 0%, #FAF3E6 100%)',
                border: '1.5px solid rgba(140, 98, 57, 0.45)',
                borderRadius: '10px',
                padding: 'clamp(10px, 1.5vh, 14px)',
                boxShadow: '0 3px 10px rgba(54, 32, 20, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                <div style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontWeight: 900,
                  color: '#362014',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>💡</span>
                    <span>Simulasi Investigasi ({exampleList.length > 1 ? `${exampleList.length} Kasus: Data Ganjil & Genap` : 'Sampel Terurut'}):</span>
                  </div>
                  {exampleList.length > 1 && (
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 900,
                      color: '#78350F',
                      background: '#FEF3C7',
                      border: '1px solid #D97706',
                      padding: '1px 8px',
                      borderRadius: '999px',
                      letterSpacing: '0.4px',
                    }}>
                      LENGKAP
                    </span>
                  )}
                </div>

                {exampleList.map((ex, exIdx) => (
                  <div key={exIdx} style={{
                    background: '#FFFDF9',
                    border: '1.5px solid rgba(140, 98, 57, 0.35)',
                    borderRadius: '8px',
                    padding: 'clamp(8px, 1.2vh, 12px) clamp(10px, 1.4vw, 14px)',
                    boxShadow: '0 2px 6px rgba(54, 32, 20, 0.05)',
                  }}>
                    {/* Sub-card Title */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                      flexWrap: 'wrap',
                      gap: '4px',
                    }}>
                      <span style={{
                        fontSize: 'clamp(10.5px, 1.25vw, 12.5px)',
                        fontWeight: 900,
                        color: '#27150B',
                      }}>
                        {ex.title}
                      </span>
                      {ex.badgeNote && (
                        <span style={{
                          fontSize: '8.5px',
                          fontWeight: 900,
                          color: '#FEF3C7',
                          background: '#362014',
                          border: '1px solid #8C6239',
                          padding: '1px 7px',
                          borderRadius: '4px',
                          letterSpacing: '0.3px',
                        }}>
                          {ex.badgeNote}
                        </span>
                      )}
                    </div>

                    {/* Visualisasi Angka */}
                    {ex.visualNumbers && ex.visualNumbers.length > 0 ? (
                      <div style={{
                        background: 'rgba(54, 32, 20, 0.08)',
                        border: '1.5px dashed rgba(140, 98, 57, 0.5)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        margin: '6px 0 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: 'inset 0 1px 3px rgba(54, 32, 20, 0.1)',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 'clamp(6px, 1vw, 10px)',
                          flexWrap: 'wrap',
                        }}>
                          {ex.visualNumbers.map((num, nIdx) => (
                            <div key={nIdx} style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '3px',
                            }}>
                              <div style={{
                                width: 'clamp(26px, 3.2vw, 32px)',
                                height: 'clamp(26px, 3.2vw, 32px)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 'clamp(11px, 1.3vw, 13.5px)',
                                fontWeight: 900,
                                fontFamily: 'var(--font-data)',
                                background: num.isCenter
                                  ? 'radial-gradient(circle at 35% 30%, #FEF08A 0%, #F59E0B 100%)'
                                  : num.isMode
                                  ? 'radial-gradient(circle at 35% 30%, #BAE6FD 0%, #0284C7 100%)'
                                  : 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #F5EFE6 75%, #E2D5C1 100%)',
                                color: num.isCenter ? '#451A03' : num.isMode ? '#FFFFFF' : '#1E1B18',
                                border: num.isCenter
                                  ? '2px solid #B45309'
                                  : num.isMode
                                  ? '2px solid #0369A1'
                                  : '2px solid #5C4033',
                                boxShadow: num.isCenter
                                  ? '0 0 10px rgba(245, 158, 11, 0.75), 0 2px 4px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.9)'
                                  : num.isMode
                                  ? '0 0 10px rgba(2, 132, 199, 0.65), 0 2px 4px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.9)'
                                  : '0 2px 4px rgba(0,0,0,0.22), inset 0 1px 1px rgba(255,255,255,0.85)',
                                transform: (num.isCenter || num.isMode) ? 'scale(1.12)' : 'scale(1)',
                                transition: 'all 0.15s ease',
                              }}>
                                {num.val}
                              </div>
                              {num.subLabel && (
                                <span style={{
                                  fontSize: 'clamp(7px, 0.85vw, 8.5px)',
                                  fontWeight: 900,
                                  color: '#FEF3C7',
                                  background: num.isCenter ? '#78350F' : num.isMode ? '#075985' : '#475569',
                                  padding: '0px 4px',
                                  borderRadius: '3px',
                                  textAlign: 'center',
                                  whiteSpace: 'nowrap',
                                  lineHeight: 1.2,
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                }}>
                                  {num.subLabel}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {ex.bracketNote && (
                          <div style={{
                            fontSize: 'clamp(8px, 1vw, 9.5px)',
                            fontWeight: 800,
                            color: '#78350F',
                            background: '#FEF3C7',
                            padding: '2px 10px',
                            borderRadius: '999px',
                            marginTop: '2px',
                            border: '1px solid #F59E0B',
                            textAlign: 'center',
                          }}>
                            {ex.bracketNote.centerLabel || `${ex.bracketNote.leftCount} data kiri ➔ ${ex.bracketNote.rightCount} data kanan`}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{
                        background: '#FDF6E2',
                        border: '1px solid #D97706',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: 'clamp(9px, 1.1vw, 11px)',
                        fontWeight: 800,
                        color: '#78350F',
                        fontFamily: 'monospace',
                        marginBottom: '6px',
                        display: 'inline-block',
                      }}>
                        {ex.sampleData}
                      </div>
                    )}

                    {/* Langkah-langkah Analisis */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', margin: '5px 0 8px' }}>
                      {ex.steps.map((st, sIdx) => (
                        <div key={sIdx} style={{
                          fontSize: 'clamp(8.5px, 1.05vw, 11px)',
                          color: '#334155',
                          lineHeight: 1.45,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '6px',
                        }}>
                          <span style={{ color: '#B45309', fontWeight: 900, flexShrink: 0 }}>▸</span>
                          <span>{st}</span>
                        </div>
                      ))}
                    </div>

                    {/* Hasil Akhir Putusan Detektif */}
                    <div style={{
                      background: 'linear-gradient(135deg, #2D1A12 0%, #1A0D08 100%)',
                      border: '1.5px solid #8C6239',
                      color: '#FEF3C7',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: 'clamp(9px, 1.1vw, 11.5px)',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 6px rgba(45, 26, 18, 0.35)',
                    }}>
                      <span>🎖️</span>
                      <span style={{ color: '#FDE68A' }}>{ex.resultHighlight}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Card 4: Cara Pengerjaan di Game */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid rgba(140, 98, 57, 0.28)',
            borderRadius: '10px',
            padding: 'clamp(10px, 1.5vh, 14px)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          }}>
            <h4 style={{
              margin: '0 0 8px',
              fontSize: 'clamp(11px, 1.3vw, 13px)',
              fontWeight: 900,
              color: '#362014',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>🎮</span>
              <span>Langkah Pengerjaan di Game:</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {tutorial.howToSteps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#362014',
                    color: '#FEF3C7',
                    fontSize: '10px',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{
                    fontSize: 'clamp(9.5px, 1.15vw, 12px)',
                    color: '#334155',
                    lineHeight: 1.45,
                  }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Detektif Statistik */}
          <div style={{
            background: 'linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%)',
            border: '1.5px solid #F59E0B',
            borderRadius: '10px',
            padding: 'clamp(8px, 1.3vh, 12px) 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)',
          }}>
            <span style={{ fontSize: 'clamp(16px, 2vw, 20px)', flexShrink: 0, marginTop: '1px' }}>💡</span>
            <div>
              <div style={{ fontSize: 'clamp(9px, 1.1vw, 11px)', fontWeight: 900, color: '#92400E', marginBottom: '2px' }}>
                TIPS DETEKTIF STATISTIK:
              </div>
              <p style={{ margin: 0, fontSize: 'clamp(9px, 1.1vw, 11px)', color: '#78350F', lineHeight: 1.4, fontWeight: 600 }}>
                {tutorial.proTip}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Modal: Tombol Paham / Mulai */}
        <div style={{
          padding: 'clamp(10px, 1.5vh, 14px) clamp(16px, 2.2vw, 24px)',
          borderTop: '1.5px solid rgba(140, 98, 57, 0.25)',
          background: 'rgba(140, 98, 57, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 'clamp(8.5px, 1vw, 10.5px)', color: '#78350F', fontWeight: 700 }}>
            Kamu bisa membuka panduan ini lagi kapan saja via tombol 💡 di atas.
          </span>
          <button
            data-testid="btn-confirm-tutorial"
            onClick={onClose}
            style={{
              padding: 'clamp(8px, 1.2vh, 12px) clamp(16px, 2.2vw, 24px)',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              border: '1.5px solid #34D399',
              color: '#FFFFFF',
              fontSize: 'clamp(11px, 1.3vw, 13px)',
              fontWeight: 900,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span>🚀</span>
            <span>Paham, Mulai Mengerjakan!</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
