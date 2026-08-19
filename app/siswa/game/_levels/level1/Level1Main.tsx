'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Cutscene from './components/Cutscene'
import PregameFormula from './components/PregameFormula'
import NPath from './components/NPath'
import FIPath from './fi/FIPath'
import FDPath from './fd/FDPath'

interface Level1MainProps {
  cognitiveStyle: 'FI' | 'FD'
  studentId?: string
  studentName?: string
  demoMode?: boolean
  demoStep?: string | null
  onHeaderSkip?: () => void
}

export default function Level1Main({
  cognitiveStyle,
  studentId,
  studentName,
  demoMode = false,
  demoStep = null,
}: Level1MainProps) {
  const [phase, setPhase] = useState<'cutscene' | 'formula' | 'game'>(
    demoMode ? (demoStep === 'interval' || demoStep === 'histogram' ? 'game' : 'formula') : 'cutscene'
  )
  const [pregameStep, setPregameStep] = useState<'exploration' | 'minmax' | 'panjangkelas'>(
    demoMode ? (demoStep === 'minmax' ? 'minmax' : 'exploration') : 'exploration'
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Phase 1: Cutscene */}
      <AnimatePresence>
        {phase === 'cutscene' && (
          <Cutscene
            teamId={null}
            studentId={studentId}
            onComplete={() => setPhase('formula')}
          />
        )}
      </AnimatePresence>

      {/* Phase 1.5: Pregame Formula */}
      {phase === 'formula' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            background: 'var(--game-bg)', color: 'var(--text-primary)',
            padding: '16px 20px', height: '100%', overflow: pregameStep === 'exploration' ? 'hidden' : 'auto',
          }}
        >
          {pregameStep === 'exploration' && (
            <NPath
              isFD={cognitiveStyle === 'FD'}
              onComplete={() => setPregameStep('minmax')}
              demoMode={demoMode}
            />
          )}

          {pregameStep === 'minmax' && (
            <PregameFormula
              teamId={null}
              studentId={studentId}
              initialSub={demoMode && demoStep === 'rentang' ? 'rentang' : 'intro'}
              onComplete={() => setPregameStep('panjangkelas')}
            />
          )}

          {pregameStep === 'panjangkelas' && (
            <PregameFormula
              teamId={null}
              studentId={studentId}
              initialSub="panjang-kelas"
              onComplete={async () => {
                setPhase('game')
              }}
            />
          )}
        </motion.div>
      )}

      {/* Phase 2: Game UI */}
      {phase === 'game' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          {cognitiveStyle === 'FI' ? (
            <FIPath demoMode={demoMode} demoStep={demoStep} />
          ) : (
            <FDPath teamId={null} studentId={studentId} studentName={studentName} />
          )}
        </motion.div>
      )}
    </div>
  )
}
