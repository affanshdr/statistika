'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface DiRAProps {
  message: string
  onDismiss?: () => void
  showAvatar?: boolean
}

export default function DiRA({ message, onDismiss, showAvatar = true }: DiRAProps) {
  const [visible, setVisible] = useState(true)

  const dismiss = () => {
    setVisible(false)
    onDismiss?.()
  }

  return (
    <AnimatePresence>
      {visible && (
        <div className="dira-container">
          {/* Speech bubble */}
          <motion.div
            className="dira-bubble"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px' }}>
                  DIRA
                </span>
                <p style={{ margin: '4px 0 0', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  {message}
                </p>
              </div>
              {onDismiss && (
                <button
                  onClick={dismiss}
                  style={{ 
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1,
                    padding: '0 0 0 8px', flexShrink: 0
                  }}
                >×</button>
              )}
            </div>
          </motion.div>

          {/* Avatar */}
          {showAvatar && (
            <motion.div
              className="dira-avatar"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Image
                src="/dira-avatar.png"
                alt="Dira"
                width={60}
                height={60}
                style={{ objectFit: 'cover', borderRadius: '50%' }}
              />
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  )
}
