'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { DialogLine } from '../config/level2Config'

// ──────────────────────────────────────────────────────
// TEACHER DIALOG PANEL
// ──────────────────────────────────────────────────────

interface TeacherDialogProps {
  dialog: DialogLine
  onNext: () => void
  isLast?: boolean
}

export function TeacherDialog({ dialog, onNext, isLast = false }: TeacherDialogProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        right: '24px',
        zIndex: 501,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      {/* Name tag */}
      <div style={{
        alignSelf: 'flex-start',
        background: 'rgba(10, 20, 15, 0.95)',
        borderTop: '2px solid rgba(251, 191, 36, 0.4)',
        borderLeft: '2px solid rgba(251, 191, 36, 0.4)',
        borderRight: '2px solid rgba(251, 191, 36, 0.4)',
        borderBottom: 'none',
        borderRadius: '6px 14px 0 0',
        padding: '4px 16px',
        color: '#FBBF24',
        fontSize: '13px',
        fontWeight: 800,
        letterSpacing: '1px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '-2px',
        zIndex: 2,
      }}>
        <span style={{ fontSize: '14px' }}>👨‍🏫</span>
        <span>{dialog.speakerName}</span>
      </div>

      {/* Dialog box */}
      <div style={{
        background: 'rgba(10, 20, 18, 0.95)',
        border: '2px solid rgba(251, 191, 36, 0.35)',
        borderRadius: '0px 14px 14px 14px',
        padding: '20px 24px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <p style={{
          margin: 0,
          fontSize: '15px',
          color: '#F8FAFC',
          fontWeight: 600,
          lineHeight: 1.65,
        }}>
          {dialog.text}
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          borderTop: '1px solid rgba(251, 191, 36, 0.12)',
          paddingTop: '10px',
        }}>
          <motion.button
            className="game-btn game-btn-primary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            style={{
              fontSize: '13px',
              padding: '8px 22px',
              borderRadius: '7px',
              fontWeight: 800,
              background: '#FBBF24',
              color: '#1C1917',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isLast ? 'Lanjut →' : 'Lanjut →'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ──────────────────────────────────────────────────────
// CHOICE BUTTONS (Bersedia / Tidak Bersedia)
// ──────────────────────────────────────────────────────

interface ChoicePanelProps {
  onAccept: () => void
  onDecline: () => void
  disabled?: boolean
}

export function ChoicePanel({ onAccept, onDecline, disabled = false }: ChoicePanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{
        background: '#0F2338',
        border: '1px solid rgba(14, 131, 136, 0.35)',
        borderRadius: '24px',
        padding: '32px',
        maxWidth: '420px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800, color: '#F8FAFC' }}>
          Seleksi Olimpiade Matematika
        </h3>
        <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#94A3B8', lineHeight: 1.6 }}>
          Apakah kamu bersedia mengikuti seleksi untuk menjadi perwakilan sekolah dalam olimpiade matematika?
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAccept}
            disabled={disabled}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '14px',
              border: '2px solid #10B981',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10B981',
              fontSize: '15px',
              fontWeight: 800,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
          >
            ✅ Bersedia
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDecline}
            disabled={disabled}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '14px',
              border: '2px solid #EF4444',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#EF4444',
              fontSize: '15px',
              fontWeight: 800,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
          >
            ❌ Tidak Bersedia
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ──────────────────────────────────────────────────────
// CLASSROOM SCENE BACKGROUND
// ──────────────────────────────────────────────────────

interface ClassroomSceneProps {
  children: React.ReactNode
  showBlackboard?: boolean
  blackboardContent?: React.ReactNode
}

export function ClassroomScene({ children, showBlackboard, blackboardContent }: ClassroomSceneProps) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #0A1420 0%, #0F2338 50%, #162C46 100%)',
    }}>
      {/* Classroom background image */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url("/Assets/Building/Kelas.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.35,
        filter: 'blur(1px)',
      }} />

      {/* Blackboard panel */}
      {showBlackboard && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'relative',
            zIndex: 10,
            margin: '16px auto',
            padding: '20px 28px',
            background: 'linear-gradient(135deg, #1a472a 0%, #2d5a3f 50%, #1a472a 100%)',
            border: '4px solid #8B6914',
            borderRadius: '8px',
            maxWidth: '700px',
            width: '90%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.5)',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            📋 PAPAN TULIS
          </div>
          {blackboardContent}
        </motion.div>
      )}

      {/* Main content area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 5,
      }}>
        {children}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────
// DATA DISPLAY PANEL (on blackboard)
// ──────────────────────────────────────────────────────

interface DataDisplayProps {
  values: number[]
  label?: string
}

export function DataDisplay({ values, label = 'Data Seleksi Olimpiade' }: DataDisplayProps) {
  return (
    <div>
      <div style={{
        fontSize: '13px',
        fontWeight: 700,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: '10px',
      }}>
        {label}
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent: 'center',
      }}>
        {values.map((val, idx) => (
          <div
            key={idx}
            style={{
              padding: '8px 14px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#FCD34D',
              fontSize: '16px',
              fontWeight: 800,
              fontFamily: 'var(--font-data)',
              minWidth: '36px',
              textAlign: 'center',
            }}
          >
            {val}
          </div>
        ))}
      </div>
      <div style={{
        fontSize: '11px',
        color: 'rgba(255, 255, 255, 0.4)',
        marginTop: '8px',
        textAlign: 'right',
      }}>
        n = {values.length} data
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────
// CANDIDATE STATUS CARDS
// ──────────────────────────────────────────────────────

interface CandidateStatusProps {
  playerScore: number
  candidate1Score: number
  candidate2Score: number
  showScores?: boolean
}

export function CandidateStatus({ playerScore, candidate1Score, candidate2Score, showScores = false }: CandidateStatusProps) {
  const candidates = [
    { name: 'Kamu (Pemain)', score: playerScore, color: '#00ADB5', icon: '🧑‍🎓' },
    { name: 'Kandidat 1 (Rina)', score: candidate1Score, color: '#FB7185', icon: '👩‍🎓' },
    { name: 'Kandidat 2 (Budi)', score: candidate2Score, color: '#FBBF24', icon: '👨‍🎓' },
  ]

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      flexWrap: 'wrap',
    }}>
      {candidates.map((c, i) => (
        <div
          key={i}
          style={{
            padding: '12px 16px',
            background: 'rgba(15, 35, 56, 0.8)',
            border: `1.5px solid ${c.color}40`,
            borderRadius: '14px',
            textAlign: 'center',
            minWidth: '120px',
          }}
        >
          <div style={{ fontSize: '28px', marginBottom: '4px' }}>{c.icon}</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: c.color }}>{c.name}</div>
          {showScores && (
            <div style={{
              fontSize: '20px',
              fontWeight: 900,
              color: '#F8FAFC',
              marginTop: '4px',
              fontFamily: 'var(--font-data)',
            }}>
              {c.score}/4
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
