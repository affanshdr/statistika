'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useGameStore } from '@/lib/store/gameStore'

interface Message {
  id: string
  sender: 'user' | 'dira'
  text: string
  timestamp: string
}

const QUICK_QUESTIONS = [
  { label: '📊 Hitung Mean', query: 'Bagaimana cara mencari Mean data kelompok?' },
  { label: '📐 Hitung Median', query: 'Bagaimana cara mencari Median data kelompok?' },
  { label: '🎯 Hitung Modus', query: 'Bagaimana cara mencari Modus data kelompok?' },
  { label: '🔍 Apa itu Outlier?', query: 'Apa itu outlier dan apa pengaruhnya?' },
  { label: '💡 Tips Level 1', query: 'Berikan panduan untuk menyelesaikan Level 1 game Skeptikos' }
]

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Connect with game store for metadata
  const gameStore = useGameStore()

  // Listen to open/close events from hamburger menu
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true)
      setHasNewMessage(false)
    }
    const handleClose = () => setIsOpen(false)
    window.addEventListener('open-dira-chat', handleOpen)
    window.addEventListener('close-dira-chat', handleClose)
    return () => {
      window.removeEventListener('open-dira-chat', handleOpen)
      window.removeEventListener('close-dira-chat', handleClose)
    }
  }, [])

  // Load chat history from sessionStorage on mount
  useEffect(() => {
    const history = sessionStorage.getItem('dira_chat_history')
    if (history) {
      try {
        setMessages(JSON.parse(history))
      } catch (e) {
        console.error('Error loading chat history:', e)
      }
    } else {
      // First-time welcome message
      const welcomeMsg: Message = {
        id: 'welcome',
        sender: 'dira',
        text: 'Halo! Aku **DiRA**, asisten belajarmu. Ada yang bisa kubantu seputar materi **statistika deskriptif** (Mean, Median, Modus) atau tentang **game Skeptikos**? 😊',
        timestamp: new Date().toISOString()
      }
      setMessages([welcomeMsg])
      sessionStorage.setItem('dira_chat_history', JSON.stringify([welcomeMsg]))
    }
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // Save messages to session storage on change
  const saveHistory = (newMsgs: Message[]) => {
    setMessages(newMsgs)
    sessionStorage.setItem('dira_chat_history', JSON.stringify(newMsgs))
  }

  // Handle message send
  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return

    // Create user message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toISOString()
    }

    const updatedMsgs = [...messages, userMsg]
    saveHistory(updatedMsgs)
    setInput('')
    setLoading(true)

    // Retrieve current student profile details
    let studentProfile = null
    const studentData = localStorage.getItem('student')
    if (studentData) {
      try {
        const parsed = JSON.parse(studentData)
        studentProfile = {
          name: parsed.name,
          cognitiveStyle: gameStore.cognitiveStyle || parsed.geftResult?.cognitiveStyle || 'FD',
          currentLevel: gameStore.currentLevel || 1,
          lives: gameStore.lives,
          xp: gameStore.xp,
          currentStep: gameStore.currentStep,
          mistakeCount: gameStore.mistakeCount
        }
      } catch (e) {
        console.error('Error parsing student profile:', e)
      }
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMsgs.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text
          })),
          studentProfile
        })
      })

      // Parse body first (regardless of status) to get error details
      let data: any
      try {
        data = await res.json()
      } catch {
        throw new Error(`Server returned status ${res.status} with non-JSON body`)
      }

      if (!res.ok) {
        const serverMsg = data?.error || data?.details || `Status ${res.status}`
        throw new Error(serverMsg)
      }

      const diraMsg: Message = {
        id: Math.random().toString(),
        sender: 'dira',
        text: data.content,
        timestamp: new Date().toISOString()
      }
      
      saveHistory([...updatedMsgs, diraMsg])
      if (!isOpen) {
        setHasNewMessage(true)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: 'dira',
        text: 'Maaf, sepertinya aku sedang mengalami kendala teknis. Coba ulangi pertanyaannya sebentar lagi ya! 🌐',
        timestamp: new Date().toISOString()
      }
      saveHistory([...updatedMsgs, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  // Toggle Chat window
  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setHasNewMessage(false)
    }
  }

  // Custom Formatter to render basic markdown structures beautifully in dark theme
  const renderMessageContent = (text: string) => {
    // 1. Handle code/formula blocks: $$ ... $$
    const blockRegex = /\$\$([\s\S]+?)\$\$/g
    const inlineRegex = /\$([\s\S]+?)\$/g
    const boldRegex = /\*\*([\s\S]+?)\*\*/g

    let formattedText: React.ReactNode[] = []
    let lastIndex = 0

    // Simplistic line breaks rendering
    const paragraphs = text.split('\n')
    
    return paragraphs.map((p, pIdx) => {
      if (!p.trim()) return <div key={pIdx} style={{ height: '8px' }} />

      // Process inline formatting (bold, inline formulas)
      let parts: React.ReactNode[] = []
      let tempText = p

      // Replace block formula display
      if (p.startsWith('$$') && p.endsWith('$$')) {
        const formula = p.substring(2, p.length - 2)
        return (
          <div 
            key={pIdx} 
            style={{ 
              background: 'rgba(0, 255, 136, 0.05)', 
              border: '1px dashed rgba(0, 255, 136, 0.2)',
              borderRadius: '8px',
              padding: '10px',
              margin: '8px 0',
              fontFamily: "'Geist Mono', monospace",
              fontSize: '12.5px',
              color: '#00ff88',
              textAlign: 'center',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {formula}
          </div>
        )
      }

      // Safe parse for bold (**) and inline formula ($)
      let currentString = tempText
      let idx = 0
      
      // Tokenize formatting elements
      const tokens: { type: 'text' | 'bold' | 'math'; content: string }[] = []
      
      const formatRegex = /(\*\*([^*]+)\*\*|\$([^$]+)\$)/g
      let match
      let lastMatchEnd = 0

      while ((match = formatRegex.exec(currentString)) !== null) {
        // Text before match
        if (match.index > lastMatchEnd) {
          tokens.push({ type: 'text', content: currentString.substring(lastMatchEnd, match.index) })
        }
        
        if (match[0].startsWith('**')) {
          tokens.push({ type: 'bold', content: match[2] })
        } else if (match[0].startsWith('$')) {
          tokens.push({ type: 'math', content: match[3] })
        }
        
        lastMatchEnd = formatRegex.lastIndex
      }
      
      if (lastMatchEnd < currentString.length) {
        tokens.push({ type: 'text', content: currentString.substring(lastMatchEnd) })
      }

      const elements = tokens.map((token, tIdx) => {
        if (token.type === 'bold') {
          return <strong key={tIdx} style={{ color: '#fff', fontWeight: 800 }}>{token.content}</strong>
        }
        if (token.type === 'math') {
          return (
            <code 
              key={tIdx} 
              style={{ 
                background: 'rgba(255, 255, 255, 0.06)', 
                padding: '2px 6px', 
                borderRadius: '4px',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '12px',
                color: '#3b82f6',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              {token.content}
            </code>
          )
        }
        return token.content
      })

      return (
        <p key={pIdx} style={{ margin: '0 0 6px 0', fontSize: '13px', lineHeight: 1.55 }}>
          {elements}
        </p>
      )
    })
  }

  const isFI = gameStore.cognitiveStyle === 'FI'
  const accentColor = isFI ? '#3b82f6' : '#00FF88'
  const glowColor = isFI ? 'rgba(59,130,246,0.35)' : 'rgba(0,255,136,0.25)'

  return (
    <div style={{ zIndex: 9999, position: 'fixed' }}>

      {/* Slide-Up Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            style={{
              position: 'fixed',
              bottom: '92px',
              right: '24px',
              width: '380px',
              height: '520px',
              maxHeight: 'calc(100vh - 120px)',
              background: 'rgba(10, 15, 30, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid rgba(255, 255, 255, 0.08)`,
              borderRadius: '24px',
              boxShadow: `0 12px 40px rgba(0, 0, 0, 0.7), 0 0 25px ${glowColor}`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Ambient interior glow */}
            <div style={{
              position: 'absolute',
              top: '-150px',
              right: '-150px',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
              filter: 'blur(40px)',
              pointerEvents: 'none',
              zIndex: 0
            }} />

            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.2)',
              zIndex: 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative', width: '34px', height: '34px' }}>
                  <Image
                    src="/dira-avatar.png"
                    alt="DiRA"
                    fill
                    sizes="34px"
                    style={{ objectFit: 'cover', borderRadius: '50%', border: `1px solid ${accentColor}` }}
                  />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    DiRA
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '50px', background: `${accentColor}15`, color: accentColor, border: `0.5px solid ${accentColor}30` }}>
                      AI TUTOR
                    </span>
                  </h3>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', display: 'inline-block' }} />
                    Siap membantu 
                  </span>
                </div>
              </div>
              
              <button
                onClick={toggleChat}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >
                ✕
              </button>
            </div>

            {/* Chat Body & Scroll Area */}
            <div className="modal-scrollbar" style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              zIndex: 1
            }}>
              {messages.map((msg) => {
                const isDira = msg.sender === 'dira'
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isDira ? 'flex-start' : 'flex-end',
                      alignItems: 'flex-start',
                      gap: '10px',
                    }}
                  >
                    {isDira && (
                      <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0, marginTop: '2px' }}>
                        <Image
                          src="/dira-avatar.png"
                          alt="Dira"
                          fill
                          sizes="28px"
                          style={{ objectFit: 'cover', borderRadius: '50%' }}
                        />
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '12px 16px',
                        borderRadius: isDira ? '0 16px 16px 16px' : '16px 0 16px 16px',
                        background: isDira 
                          ? 'rgba(255, 255, 255, 0.03)' 
                          : `linear-gradient(135deg, ${accentColor}15, ${accentColor}06)`,
                        border: `1px solid ${isDira ? 'rgba(255, 255, 255, 0.05)' : `${accentColor}25`}`,
                        boxShadow: isDira ? 'none' : `0 4px 12px ${accentColor}05`,
                        color: isDira ? '#d1d5db' : '#f3f4f6',
                      }}
                    >
                      {renderMessageContent(msg.text)}
                      <span style={{
                        display: 'block',
                        fontSize: '8.5px',
                        color: 'rgba(255,255,255,0.25)',
                        textAlign: 'right',
                        marginTop: '4px',
                        fontWeight: 500,
                        fontFamily: 'monospace'
                      }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )
              })}

              {/* Bouncing Dots Loading Indicator */}
              {loading && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
                    <Image
                      src="/dira-avatar.png"
                      alt="Dira"
                      fill
                      sizes="28px"
                      style={{ objectFit: 'cover', borderRadius: '50%' }}
                    />
                  </div>
                  <div style={{
                    padding: '12px 18px',
                    borderRadius: '0 16px 16px 16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    height: '38px',
                  }}>
                    <style>{`
                      .dot { width: 6px; height: 6px; background: ${accentColor}; border-radius: 50%; display: inline-block; animation: bounce 1.4s infinite ease-in-out both; }
                      .dot1 { animation-delay: -0.32s; }
                      .dot2 { animation-delay: -0.16s; }
                      @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
                    `}</style>
                    <span className="dot dot1" />
                    <span className="dot dot2" />
                    <span className="dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies suggested questions */}
            {messages.length < 5 && !loading && (
              <div style={{
                padding: '0 16px 10px',
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                zIndex: 1
              }}>
                <style>{`
                  .quick-chip::-webkit-scrollbar { display: none; }
                `}</style>
                <div className="quick-chip" style={{ display: 'flex', gap: '8px' }}>
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q.query)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '50px',
                        border: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(255,255,255,0.02)',
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: 'none',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = `${accentColor}10`
                        e.currentTarget.style.borderColor = `${accentColor}40`
                        e.currentTarget.style.color = '#fff'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                      }}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Input Area */}
            <div style={{
              padding: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              background: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              zIndex: 1
            }}>
              <input
                type="text"
                placeholder="Tanyakan statistika / game..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: 'inherit'
                }}
                onFocus={e => e.target.style.borderColor = accentColor}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={loading || !input.trim()}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  border: 'none',
                  background: input.trim() && !loading
                    ? `linear-gradient(135deg, ${accentColor} 0%, ${isFI ? '#1d4ed8' : '#059669'} 100%)`
                    : 'rgba(255,255,255,0.05)',
                  color: input.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.2)',
                  fontSize: '16px',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: input.trim() && !loading ? `0 4px 14px ${glowColor}` : 'none'
                }}
              >
                🚀
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile support animation styles */}
      <style>{`
        @media (max-width: 480px) {
          div[style*="width: 380px"] {
            width: calc(100vw - 32px) !important;
            right: 16px !important;
            left: 16px !important;
            bottom: 86px !important;
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>

    </div>
  )
}
