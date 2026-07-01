'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'model'
  content: string
  timestamp: string
  isSeen?: boolean
  isContextualStory?: boolean
  image?: string
}

type StudentProfile = {
  id: string
  name: string
  nisn: string
  geftStatus: 'not_taken' | 'completed'
  classroom: { name: string }
  diagnosticScore?: number | null
  diagnosticLevel?: string | null
  geftResult?: {
    score: number
    cognitiveStyle: 'FI' | 'FD'
  }
}

export default function FDChatbotPage() {
  const router = useRouter()
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Selamat datang di Chatbot DiRA. Ada yang bisa DIRA bantu hari ini?',
      timestamp: '09:30',
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTopic, setActiveTopic] = useState<number>(1) // 1: Mean, 2: Median, 3: Modus
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Load preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('chat-theme')
      if (savedTheme === 'dark') {
        setIsDarkMode(true)
      } else {
        setIsDarkMode(false)
      }
    }
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newTheme = !prev
      localStorage.setItem('chat-theme', newTheme ? 'dark' : 'light')
      return newTheme
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setSelectedImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Load student profile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('student')
      if (data) {
        setStudent(JSON.parse(data) as StudentProfile)
      } else {
        // Fallback for development/testing
        setStudent({
          id: 'dev-student-id',
          name: 'Affan',
          nisn: '12345678',
          geftStatus: 'completed',
          classroom: { name: 'Kelas XI A' },
          geftResult: { score: 12, cognitiveStyle: 'FD' }
        })
      }
    }
  }, [])

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Get current timestamp
  const getFormattedTime = () => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // Handle message send
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputMessage.trim()
    if (!text) return

    if (textToSend === undefined) {
      setInputMessage('')
    }

    const userTime = getFormattedTime()
    const userMsgId = Math.random().toString(36).substring(7)
    const imageAttachment = selectedImage || undefined
    const newUserMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: userTime,
      isSeen: true,
      image: imageAttachment,
    }

    // Add user message to log
    setMessages(prev => [...prev, newUserMessage])
    setIsLoading(true)
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    // Simulate flow from screenshot if exact prompts are matches
    setTimeout(async () => {
      const lowerText = text.toLowerCase()
      let botResponse = ''

      if (lowerText.includes('jelaskan tentang mean') || lowerText.includes('apa itu mean') || lowerText.includes('mean adalah')) {
        botResponse = 'Tentu! Mean atau rata-rata adalah jumlah semua nilai data dibagi dengan banyaknya data.\n\nKamu ingin lihat contoh soalnya juga?'
        setMessages(prev => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            role: 'model',
            content: botResponse,
            timestamp: getFormattedTime(),
          }
        ])
        setIsLoading(false)
      } else if (lowerText.includes('boleh') || lowerText.includes('mau') || lowerText.includes('ya') || lowerText.includes('iya')) {
        botResponse = 'Oke, ini dia contohnya. Bayangkan di kehidupan sehari-hari:'
        setMessages(prev => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            role: 'model',
            content: botResponse,
            timestamp: getFormattedTime()
          },
          {
            id: Math.random().toString(36).substring(7),
            role: 'model',
            content: 'kafe_contextual_story',
            timestamp: getFormattedTime(),
            isContextualStory: true
          }
        ])
        setIsLoading(false)
      } else {
        // Fallback to calling the real AI endpoint if API key exists or handles standard RAG response
        try {
          const apiMessages = [...messages, newUserMessage].map(m => ({
            role: m.role,
            content: m.content,
            image: m.image
          }))

          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: apiMessages,
              studentProfile: {
                name: student?.name || 'Siswa',
                cognitiveStyle: 'FD',
                currentLevel: 1
              }
            })
          })

          if (response.ok) {
            const data = await response.json()
            setMessages(prev => [
              ...prev,
              {
                id: Math.random().toString(36).substring(7),
                role: 'model',
                content: data.reply || 'Maaf, saya sedang mengalami kendala. Bisa diulangi?',
                timestamp: getFormattedTime()
              }
            ])
          } else {
            throw new Error()
          }
        } catch {
          // Standard demo reply
          const fallback = `Maaf, DIRA sedang kesulitan terhubung dengan otak pintar. Tapi tenang, kita bisa diskusikan Statistika Deskriptif kapan saja!`
          setMessages(prev => [
            ...prev,
            {
              id: Math.random().toString(36).substring(7),
              role: 'model',
              content: fallback,
              timestamp: getFormattedTime()
            }
          ])
        } finally {
          setIsLoading(false)
        }
      }
    }, 1200)
  }

  // Handle topic selection from right sidebar/drawer
  const handleSelectTopic = (index: number, name: string, promptText: string) => {
    setActiveTopic(index)
    handleSendMessage(promptText)
  }

  // Restart chat session
  const handleNewSession = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: 'Selamat datang di Chatbot DiRA. Ada yang bisa DIRA bantu hari ini?',
        timestamp: getFormattedTime(),
      },
    ])
  }

  // Helper to parse message text and render bold, formulas, or standard layout
  const renderMessageContent = (msg: Message) => {
    const text = msg.content
    if (msg.isContextualStory) {
      // Custom card renderer for the kafe contextual story example
      return (
        <div className="flex flex-col gap-4 w-full">
          {/* Header */}
          <div className="flex items-center gap-2 text-orange-600 text-xs font-bold uppercase tracking-wider">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              <path d="M6 6h10M6 10h10"/>
            </svg>
            CONTEXTUAL STORY
          </div>
          
          {/* Paragraph */}
          <p className={`m-0 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200' : '!text-slate-900 font-medium'}`}>
            Bayangkan kamu sedang bekerja di sebuah kafe. Ada 5 temanmu yang memesan kopi dengan harga berbeda-beda:{' '}
            <strong className={`font-bold ${isDarkMode ? 'text-sky-400' : 'text-sky-850'}`}>70k, 80k, 90k, 60k, dan 100k</strong>. Berapa rata-rata harga kopi yang mereka beli?
          </p>

          {/* Centered equation block */}
          <div className={`p-6 rounded-2xl flex justify-center items-center border ${
            isDarkMode ? 'bg-[#0b111e]/90 border-slate-800' : 'bg-slate-100/90 border border-slate-200'
          }`}>
            <pre className={`font-mono text-xs m-0 leading-loose text-left inline-block ${isDarkMode ? 'text-slate-300' : '!text-slate-900 font-medium'}`}>
              {`Rata-rata = (70 + 80 + 90 + 60 + 100) / 5\n`}
              {`          = 400 / 5\n`}
              <span className={isDarkMode ? 'text-sky-400' : 'text-sky-850 font-bold'}>{`          = 80`}</span>
            </pre>
          </div>

          {/* Footer paragraph */}
          <p className={`m-0 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200' : '!text-slate-900 font-medium'}`}>
            Jadi, harga rata-rata (mean) kopinya adalah <strong className={`font-bold ${isDarkMode ? 'text-sky-400' : 'text-sky-850'}`}>80k</strong>. Mudah kan kalau dibayangkan seperti ini?
          </p>

          {/* Timestamp inside bubble */}
          <div className={`flex justify-end text-[10px] mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>{msg.timestamp}</span>
          </div>
        </div>
      )
    }

    // Standard markdown parser
    const lines = text.split('\n')
    return lines.map((line, idx) => {
      let trimmed = line.trim()
      if (!trimmed) return <div key={idx} className="h-2" />

      // Equation check
      if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
        const formula = trimmed.slice(2, -2)
        return (
          <div key={idx} className={`my-3 p-3 rounded-xl text-center font-mono text-xs overflow-x-auto border ${
            isDarkMode ? 'bg-[#0c1220] border-sky-950/30 text-sky-450' : 'bg-slate-100 border-slate-200 text-sky-855 font-medium'
          }`}>
            {formula}
          </div>
        )
      }

      // Check header
      if (trimmed.startsWith('### ')) {
        return <h4 key={idx} className={`my-3 font-bold text-sm ${isDarkMode ? '!text-slate-100' : '!text-slate-950 font-extrabold'}`}>{trimmed.replace('### ', '')}</h4>
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.match(/^\d+\.\s/)) {
        const listText = trimmed.startsWith('- ') ? trimmed.replace('- ', '') : trimmed.replace(/^\d+\.\s/, '')
        const listNum = trimmed.startsWith('- ') ? '•' : trimmed.split('.')[0] + '.'
        return (
          <div key={idx} className={`flex gap-2 pl-2 my-1 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200' : '!text-slate-900 font-medium'}`}>
            <span className={isDarkMode ? 'text-sky-400' : 'text-sky-855 font-bold'}>{listNum}</span>
            <div>{parseInlineFormatting(listText)}</div>
          </div>
        )
      }

      return (
        <p key={idx} className={`my-1 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200' : '!text-slate-900'}`}>
          {parseInlineFormatting(line)}
        </p>
      )
    })
  }

  // Mini parser for bold text **
  const parseInlineFormatting = (content: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = boldRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index))
      }
      parts.push(<strong key={match.index} className={`font-bold ${isDarkMode ? 'text-white' : '!text-black'}`}>{match[1]}</strong>)
      lastIndex = boldRegex.lastIndex
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex))
    }

    return parts.length > 0 ? parts : content
  }

  return (
    <div className={`h-screen w-screen relative font-sans overflow-hidden flex flex-col items-center justify-start pt-6 pb-6 px-4 select-none transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0a0d16] text-slate-200' : 'bg-[#f8fafc] text-slate-800'
    }`}>
      
      {/* Background Radial Glow */}
      <div className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-300 ${
        isDarkMode 
          ? 'bg-[radial-gradient(circle_at_50%_35%,_#1c3354_0%,_#090d16_80%)] opacity-100' 
          : 'bg-[radial-gradient(circle_at_50%_35%,_#e0f2fe_0%,_#f8fafc_80%)] opacity-100'
      }`} />

      {/* Floating Dashboard Navigation Button */}
      <button 
        onClick={() => router.push('/siswa')}
        className={`absolute top-6 left-6 flex items-center gap-2 transition-all text-xs font-semibold px-4 py-2 rounded-full cursor-pointer z-20 shadow-sm backdrop-blur-md ${
          isDarkMode 
            ? 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800' 
            : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
        }`}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Dashboard
      </button>

      {/* Header section matches the screenshot (SKEPTIKOS Chatbot - Light Version) */}
      <div className="w-full max-w-xl text-center mt-4 mb-0 z-10 flex flex-col items-center flex-shrink-0">
        <div className={`text-3xl md:text-4xl font-black tracking-tight m-0 leading-tight transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>
          SKEPTIKOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-700 drop-shadow-[0_0_15px_rgba(6,182,212,0.15)]">Chatbot</span>
        </div>
        <p className={`text-xs mt-1 font-semibold tracking-wide max-w-md transition-colors duration-300 ${
          isDarkMode ? 'text-slate-400' : 'text-slate-800'
        }`}>
          Simply ask your AI chatbot assistant to generate!
        </p>
      </div>

      {/* Centered Chat Card matches mockup layout (responsive screen height, Light Theme) */}
      <div className={`w-full max-w-[850px] rounded-[24px] flex flex-col flex-1 min-h-0 overflow-hidden relative z-10 mt-5 mb-2 border transition-all duration-300 ${
        isDarkMode 
          ? 'bg-[#1a2536]/95 border-cyan-400/35 shadow-[0_0_50px_rgba(6,182,212,0.1),_0_20px_50px_rgba(0,0,0,0.8)]' 
          : 'bg-white border-slate-200/90 shadow-[0_0_40px_rgba(6,182,212,0.04),_0_20px_40px_rgba(15,23,42,0.06)]'
      }`}>
        
        {/* Chat Box Header */}
        <header className={`flex items-center justify-between px-6 py-4 border-b backdrop-blur-md transition-colors duration-300 ${
          isDarkMode ? 'border-slate-800/80 bg-[#141f2e]/85' : 'border-slate-200/80 bg-[#f8fafc]/90'
        }`}>
          {/* Logo on Left (Serif Font styled from screenshot) */}
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-bold tracking-tight italic select-none transition-colors duration-300 ${
              isDarkMode ? 'text-cyan-300' : 'text-cyan-800 font-extrabold'
            }`} style={{ fontFamily: 'Georgia, serif' }}>
              Logo
            </span>
            {student && (
              <span className={`text-[10px] uppercase tracking-widest font-bold font-sans transition-colors duration-300 ${
                isDarkMode ? 'text-slate-500' : '!text-slate-800'
              }`}>
                {student.name} • {student.classroom?.name || 'Siswa'}
              </span>
            )}
          </div>

          {/* Action buttons on Right */}
          <div className="flex items-center gap-2">
            {/* Dark/Light Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={isDarkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
              className={`p-1.5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                isDarkMode 
                  ? 'border-slate-700 bg-slate-900/60 text-amber-400 hover:text-amber-300 hover:border-amber-400/60 hover:bg-slate-900' 
                  : 'border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-500/50 hover:bg-slate-50'
              }`}
            >
              {isDarkMode ? (
                /* Sun Icon */
                <svg className="w-4 h-4 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
              ) : (
                /* Moon Icon */
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
              )}
            </button>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className={`flex items-center gap-1.5 border transition-all text-xs px-3.5 py-1.5 rounded-full font-bold cursor-pointer ${
                isDarkMode 
                  ? 'border-blue-900/50 bg-blue-950/20 text-blue-400 hover:border-blue-500/60 hover:text-blue-300 hover:bg-blue-950/50' 
                  : 'border-blue-200 bg-blue-50/70 text-blue-600 hover:border-blue-400/60 hover:bg-blue-100 hover:text-blue-750 shadow-sm'
              }`}
            >
              <svg className={`w-3.5 h-3.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                <path d="M6 6h10M6 10h10"/>
              </svg>
              Materi &amp; Tutor
            </button>
            <button
              onClick={handleNewSession}
              className={`border transition-all text-xs px-4 py-1.5 rounded-full font-bold cursor-pointer ${
                isDarkMode 
                  ? 'border-rose-950/50 bg-rose-950/10 text-rose-450 hover:border-rose-500/60 hover:text-rose-300 hover:bg-rose-950/30' 
                  : 'border-red-200 bg-red-50/70 text-red-600 hover:border-red-400/60 hover:bg-red-100 hover:text-red-750 shadow-sm'
              }`}
            >
              Clear chat
            </button>
          </div>
        </header>

        {/* Message Log Area */}
        <div className={`flex-1 overflow-y-auto p-6 space-y-6 flex flex-col scroll-smooth transition-colors duration-300 relative ${
          isDarkMode ? 'bg-[#162130]/50' : 'bg-slate-50/50'
        }`}>
          
          {/* Centered Watermark/Placeholder when chat is empty (no user messages yet) */}
          {messages.length <= 1 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 select-none px-6">
              {/* Soft Radial Backlight */}
              <div className={`absolute w-72 h-72 rounded-full filter blur-3xl opacity-20 transition-colors duration-300 ${
                isDarkMode ? 'bg-sky-500/10' : 'bg-sky-400/30'
              }`} />
              
              {/* Floating Graph/Stats Graphic */}
              <div className={`w-24 h-24 rounded-full border flex items-center justify-center mb-5 transition-all duration-300 z-10 ${
                isDarkMode 
                  ? 'bg-slate-900/40 border-slate-800 text-sky-455/45 shadow-[0_0_30px_rgba(56,189,248,0.03)]' 
                  : 'bg-white border-slate-200/80 text-sky-500/50 shadow-[0_8px_30px_rgba(15,23,42,0.04)]'
              }`}>
                <svg className="w-11 h-11 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ animationDuration: '3s' }}>
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                  <path d="M3 18 L6 14 L12 4 L18 10 L21 7" strokeWidth="2" className={isDarkMode ? 'text-cyan-400/30' : 'text-cyan-600/40'}/>
                </svg>
              </div>

              <div className={`text-base font-bold tracking-tight z-10 transition-colors duration-300 ${
                isDarkMode ? 'text-slate-650' : 'text-slate-400 font-extrabold'
              }`}>
                DIRA Statistika AI
              </div>
              <div className={`text-[11px] text-center mt-2 max-w-[280px] z-10 transition-colors duration-300 leading-relaxed font-semibold ${
                isDarkMode ? 'text-slate-700' : 'text-slate-450'
              }`}>
                Silakan ketik pertanyaanmu di kolom bawah untuk memulai pembelajaran interaktif.
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isModel = msg.role === 'model'
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 items-start max-w-[85%] ${
                  isModel ? 'self-start' : 'self-end flex-row-reverse'
                }`}
              >
                {/* Avatar Icon */}
                {isModel ? (
                  /* Robot Avatar Icon */
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    isDarkMode 
                      ? 'bg-sky-500/10 border-sky-400/20 text-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.15)]' 
                      : 'bg-sky-500/10 border-sky-400/20 text-sky-600 shadow-[0_0_8px_rgba(56,189,248,0.1)]'
                  }`}>
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="12" x="3" y="8" rx="2" ry="2"/>
                      <path d="M12 2v6M12 8v2M8 12h.01M16 12h.01"/>
                    </svg>
                  </div>
                ) : (
                  /* User Avatar Icon */
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm transition-colors ${
                    isDarkMode 
                      ? 'bg-slate-200 border-slate-300 text-slate-700' 
                      : 'bg-slate-200 border-slate-300 text-slate-600'
                  }`}>
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`flex flex-col ${isModel ? 'items-start' : 'items-end'}`}>
                  <div className={`text-sm px-4 py-3 rounded-[16px] shadow-sm border transition-all duration-300 ${
                    isModel 
                      ? msg.isContextualStory 
                        ? isDarkMode 
                          ? 'bg-[#1b2b41]/90 border-orange-400/30 border-l-4 border-l-orange-500/80 p-5 rounded-tl-sm w-full shadow-sm text-slate-200'
                          : 'bg-[#fffbeb] border-amber-250 border-l-4 border-l-orange-500 p-5 rounded-tl-sm w-full shadow-sm text-slate-900 font-medium'
                        : isDarkMode 
                          ? 'bg-[#223247] border-slate-700/30 rounded-tl-sm text-slate-200'
                          : 'bg-[#f0f9ff] border-sky-100/70 rounded-tl-sm text-slate-900 font-medium'
                      : isDarkMode 
                        ? 'bg-[#2b3f5c] border-slate-700/40 rounded-tr-sm text-slate-200'
                        : 'bg-[#f1f5f9] border-slate-200/75 rounded-tr-sm text-slate-950 font-medium'
                  }`}>
                    {msg.image && (
                      <div className={`mb-2 max-w-xs rounded-lg overflow-hidden border ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={msg.image} alt="Attachment" className="max-h-48 object-cover w-full" />
                      </div>
                    )}
                    {renderMessageContent(msg)}
                    
                    {!msg.isContextualStory && (
                      <div className={`flex items-center justify-end gap-1 text-[10px] mt-2 select-none ${
                        isDarkMode ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        <span>{msg.timestamp}</span>
                        {!isModel && msg.isSeen && (
                          <svg className={`w-3 h-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6 7 17l-5-5"/>
                            <path d="m22 10-7.5 7.5L13 16"/>
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Loading bubble */}
          {isLoading && (
            <div className="flex gap-3.5 items-center self-start">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                isDarkMode 
                  ? 'bg-sky-500/10 border-sky-400/20 text-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.15)]' 
                  : 'bg-sky-500/10 border-sky-400/20 text-sky-600 shadow-[0_0_8px_rgba(56,189,248,0.1)]'
              }`}>
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="12" x="3" y="8" rx="2" ry="2"/>
                </svg>
              </div>
              <div className={`border px-4 py-3.5 rounded-2xl rounded-tl-sm flex gap-1.5 items-center ${
                isDarkMode ? 'bg-[#223247] border-slate-700/30' : 'bg-[#f0f9ff] border-sky-100/60'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDarkMode ? 'bg-slate-400' : 'bg-slate-500'}`} style={{ animationDelay: '0ms' }}/>
                <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDarkMode ? 'bg-slate-400' : 'bg-slate-500'}`} style={{ animationDelay: '150ms' }}/>
                <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDarkMode ? 'bg-slate-400' : 'bg-slate-500'}`} style={{ animationDelay: '300ms' }}/>
              </div>
            </div>
          )}


          
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar Section Matches Image (Enter Your Message...) */}
        <footer className={`p-6 pt-0 border-t flex-shrink-0 flex flex-col gap-2 transition-colors duration-300 ${
          isDarkMode ? 'bg-[#1a2536] border-slate-700/80' : 'bg-slate-50 border-slate-100'
        }`}>
          {selectedImage && (
            <div className={`relative self-start mt-3 p-1 rounded-xl flex items-center gap-2 shadow-sm ${
              isDarkMode ? 'bg-[#111926] border border-slate-600/60' : 'bg-white border border-slate-200/60'
            }`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedImage} alt="Preview" className="h-14 w-14 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer border-none outline-none"
              >
                ✕
              </button>
            </div>
          )}

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage() }}
            className={`flex items-center rounded-full px-5 py-2.5 gap-3.5 transition-all duration-200 mt-4 w-full ${
              isDarkMode 
                ? 'bg-[#111926] border border-slate-600/60 focus-within:border-cyan-400/40 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                : 'bg-white border border-slate-300/80 focus-within:border-cyan-400/40 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.06)]'
            }`}
          >
            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            {/* Visual clip attachment icon */}
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-transparent border-none text-slate-500 hover:text-slate-300 cursor-pointer p-0.5 flex items-center transition-colors duration-200 outline-none"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>

            {/* Input Message field */}
            <input
              type="text"
              placeholder="Enter Your Message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className={`flex-1 bg-transparent border-none outline-none text-sm py-1 transition-colors ${
                isDarkMode ? 'text-slate-100 placeholder-slate-500' : 'text-slate-900 placeholder-slate-500 font-medium'
              }`}
            />

            {/* Send circular button with plane icon */}
            <button
              type="submit"
              className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center justify-center transition-all duration-200 shadow-[0_0_10px_rgba(6,182,212,0.2)] hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0 border-none outline-none"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(45deg) translate(-1px, 1px)' }}>
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </footer>

        {/* Sliding drawer panel for DIRA Statistika resources (Light Theme) */}
        <div 
          className={`absolute top-0 bottom-0 right-0 w-80 z-50 flex flex-col p-6 transition-all duration-300 ease-in-out border-l ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          } ${
            isDarkMode 
              ? 'bg-[#0c121e]/98 border-slate-800 shadow-[-10px_0_30px_rgba(0,0,0,0.55)]' 
              : 'bg-white border-slate-200 shadow-[-10px_0_30px_rgba(15,23,42,0.05)]'
          }`}
        >
          {/* Drawer Header */}
          <div className={`flex items-center justify-between pb-4 border-b mb-6 ${
            isDarkMode ? 'border-slate-800/80' : 'border-slate-100'
          }`}>
            <div className={`flex items-center gap-2 font-bold text-sm ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}>
              <svg className={`w-4.5 h-4.5 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              </svg>
              <span>Materi &amp; Tutor</span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer transition-colors p-1 border-none bg-transparent"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-1 select-none">
            {/* Section 1: Topics */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pilih Materi</h4>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    handleSelectTopic(1, 'Mean', 'Bisa jelaskan tentang mean?')
                    setIsDrawerOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    activeTopic === 1 
                      ? isDarkMode 
                        ? 'bg-sky-950/45 border-sky-500/50 text-white shadow-sm shadow-sky-500/5' 
                        : 'bg-sky-50 border-sky-200 text-sky-700 shadow-sm shadow-sky-500/5' 
                      : isDarkMode 
                        ? 'bg-transparent border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        : 'bg-transparent border-slate-200/60 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      activeTopic === 1 
                        ? isDarkMode ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-500/10 text-sky-600'
                        : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'
                    }`}>1</span>
                    Mean (Rata-rata)
                  </span>
                  {activeTopic === 1 && <span className={`${isDarkMode ? 'text-sky-400' : 'text-sky-600'} text-xs`}>✓</span>}
                </button>

                <button
                  onClick={() => {
                    handleSelectTopic(2, 'Median', 'Bisa jelaskan tentang median?')
                    setIsDrawerOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    activeTopic === 2 
                      ? isDarkMode 
                        ? 'bg-sky-950/45 border-sky-500/50 text-white shadow-sm shadow-sky-500/5'
                        : 'bg-sky-50 border-sky-200 text-sky-700 shadow-sm shadow-sky-500/5'
                      : isDarkMode 
                        ? 'bg-transparent border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        : 'bg-transparent border-slate-200/60 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      activeTopic === 2 
                        ? isDarkMode ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-500/10 text-sky-600'
                        : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'
                    }`}>2</span>
                    Median (Nilai Tengah)
                  </span>
                  {activeTopic === 2 && <span className={`${isDarkMode ? 'text-sky-400' : 'text-sky-600'} text-xs`}>✓</span>}
                </button>

                <button
                  onClick={() => {
                    handleSelectTopic(3, 'Modus', 'Bisa jelaskan tentang modus?')
                    setIsDrawerOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    activeTopic === 3 
                      ? isDarkMode 
                        ? 'bg-sky-950/45 border-sky-500/50 text-white shadow-sm shadow-sky-500/5'
                        : 'bg-sky-50 border-sky-200 text-sky-700 shadow-sm shadow-sky-500/5'
                      : isDarkMode 
                        ? 'bg-transparent border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        : 'bg-transparent border-slate-200/60 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      activeTopic === 3 
                        ? isDarkMode ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-500/10 text-sky-600'
                        : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'
                    }`}>3</span>
                    Modus (Sering Muncul)
                  </span>
                  {activeTopic === 3 && <span className={`${isDarkMode ? 'text-sky-400' : 'text-sky-600'} text-xs`}>✓</span>}
                </button>
              </div>
            </div>

            {/* Section 2: Tutor Card (DIRA) */}
            <div className={`border rounded-2xl p-4 space-y-3.5 shadow-sm transition-colors duration-300 ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-11 h-11 rounded-lg border flex items-center justify-center shadow-sm transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-sky-500/10 border-sky-400/20 text-sky-400' 
                      : 'bg-sky-500/10 border-sky-400/20 text-sky-600'
                  }`}>
                    <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="18" height="12" x="3" y="8" rx="2" ry="2"/>
                      <path d="M12 2v6M12 8v2M8 12h.01M16 12h.01"/>
                    </svg>
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 ${
                    isDarkMode ? 'border-[#0a0d16]' : 'border-slate-50'
                  }`} />
                </div>
                <div>
                  <h5 className={`text-sm font-bold leading-none ${isDarkMode ? 'text-white' : '!text-slate-950 font-extrabold'}`}>DIRA</h5>
                  <span className={`text-[10px] font-bold tracking-wide block mt-1 ${
                    isDarkMode ? 'text-sky-400' : 'text-sky-800'
                  }`}>Asisten AI Tutor</span>
                </div>
              </div>
              <button
                onClick={() => {
                  handleSendMessage('DIRA, boleh minta bantuan untuk menjelaskan konsep statistika ini?')
                  setIsDrawerOpen(false)
                }}
                className={`w-full text-center py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border-none outline-none ${
                  isDarkMode 
                    ? 'bg-orange-400 text-slate-950 hover:bg-orange-300' 
                    : 'bg-sky-500 text-white hover:bg-sky-600'
                }`}
              >
                Minta Bantuan DIRA
              </button>
            </div>

            {/* Section 3: Real World Examples */}
            <div className={`border rounded-2xl p-4 space-y-2 transition-colors duration-300 ${
              isDarkMode ? 'bg-[#121a28]/60 border-cyan-500/10' : 'bg-sky-50/50 border-sky-100'
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest block ${
                isDarkMode ? 'text-cyan-400' : 'text-sky-700'
              }`}>Contoh Dunia Nyata</span>
              <p className={`text-xs italic leading-relaxed m-0 ${
                isDarkMode ? 'text-slate-400' : '!text-slate-800 font-medium'
              }`}>
                {activeTopic === 1 && `"Mean sering digunakan atlet untuk menghitung rata-rata kecepatan lari mereka selama satu musim kompetisi."`}
                {activeTopic === 2 && `"Median digunakan untuk membagi data pendapatan rumah tangga menjadi dua kelompok setara, guna melihat tingkat kesejahteraan masyarakat tanpa terpengaruh nilai ekstrem (outlier)."`}
                {activeTopic === 3 && `"Modus digunakan oleh pemilik toko pakaian untuk menentukan stok baju ukuran tertentu (misalnya M atau L) yang paling laris dibeli oleh pelanggan."`}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Bounce keyframe CSS for typing loading */}
      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce {
          animation: bounce 0.6s infinite ease-in-out;
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 8s infinite linear;
        }
      `}</style>
    </div>
  )
}
