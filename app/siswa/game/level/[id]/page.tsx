'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '@/lib/store/gameStore'
import GameHeader from '../../_components/GameHeader'
import Cutscene from '../../_components/Cutscene'
import FIPath from './_fi/FIPath'
import FDPath from './_fd/FDPath'
import '../../game.css'

export default function LevelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { cognitiveStyle, currentLevel } = useGameStore()
  const [showCutscene, setShowCutscene] = useState(true)
  const [timerRunning, setTimerRunning] = useState(false)

  // Guard: if no cognitive style → back to lobby
  useEffect(() => {
    if (!cognitiveStyle) router.replace('/siswa/game/lobby')
  }, [cognitiveStyle, router])

  // Only Level 1 exists
  if (id !== '1') {
    return (
      <div className="game-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>🚧</div>
        <h2>Level {id} belum tersedia</h2>
        <button className="game-btn game-btn-primary" onClick={() => router.push('/siswa/game/lobby')}>
          Kembali ke Lobby
        </button>
      </div>
    )
  }

  return (
    <div className="game-root">
      {/* Cutscene overlay */}
      <AnimatePresence>
        {showCutscene && (
          <Cutscene onComplete={() => { setShowCutscene(false); setTimerRunning(true) }} />
        )}
      </AnimatePresence>

      {/* Game UI */}
      {!showCutscene && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <GameHeader timerRunning={timerRunning} />

          {cognitiveStyle === 'FI' ? <FIPath /> : <FDPath />}
        </motion.div>
      )}
    </div>
  )
}
