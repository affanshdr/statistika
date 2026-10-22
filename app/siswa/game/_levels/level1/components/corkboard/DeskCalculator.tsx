'use client'

import React, { useState } from 'react'
import { gameAudio } from '@/lib/utils/gameAudio'

export interface DeskCalculatorProps {
  dataset: number[]
}

export default function DeskCalculator({ dataset: _dataset }: DeskCalculatorProps) {
  const [display, setDisplay] = useState<string>('0')
  const [formula, setFormula] = useState<string>('')
  const [isResult, setIsResult] = useState<boolean>(false)

  const handleDigit = (d: string) => {
    gameAudio.playClick()
    if (isResult) {
      setDisplay(d === '.' ? '0.' : d)
      setFormula('')
      setIsResult(false)
      return
    }
    if (d === '.') {
      if (display.includes('.')) return
      setDisplay(prev => prev + '.')
      return
    }
    if (display === '0') {
      setDisplay(d)
    } else {
      if (display.length >= 12) return
      setDisplay(prev => prev + d)
    }
  }

  const handleOp = (opSymbol: string) => {
    gameAudio.playClick()
    const currentVal = display
    if (isResult) {
      setFormula(`${currentVal} ${opSymbol}`)
      setDisplay('0')
      setIsResult(false)
      return
    }
    if (formula && (display === '0' || display === '')) {
      // Replace trailing operator if user changed their mind
      setFormula(prev => prev.replace(/[+\-×÷]$/, opSymbol))
      return
    }
    setFormula(prev => (prev ? `${prev} ${currentVal} ${opSymbol}` : `${currentVal} ${opSymbol}`))
    setDisplay('0')
  }

  const handleEqual = () => {
    gameAudio.playClick()
    if (!formula && !isResult) return
    const fullExpr = formula ? `${formula} ${display}` : display
    try {
      const sanitized = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/[^0-9+\-*/.]/g, '')
      if (!sanitized) return
      // Safe arithmetic evaluation
      const res = new Function(`'use strict'; return (${sanitized})`)()
      if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
        const formatted = Number(res.toFixed(4)).toString()
        setFormula(`${fullExpr} =`)
        setDisplay(formatted)
        setIsResult(true)
      } else {
        setDisplay('Error')
        setIsResult(true)
      }
    } catch {
      setDisplay('Error')
      setIsResult(true)
    }
  }

  const handleClear = () => {
    gameAudio.playClick()
    setDisplay('0')
    setFormula('')
    setIsResult(false)
  }

  const handleBackspace = () => {
    gameAudio.playClick()
    if (isResult) {
      setDisplay('0')
      setFormula('')
      setIsResult(false)
      return
    }
    if (display.length > 1) {
      setDisplay(prev => prev.slice(0, -1))
    } else {
      setDisplay('0')
    }
  }

  return (
    <div
      data-testid="desk-calculator"
      style={{
        background: 'linear-gradient(180deg, #2A323D 0%, #1A2027 100%)',
        border: 'clamp(2px, 0.4vw, 3px) solid #475569',
        borderRadius: 'clamp(10px, 1.5vw, 16px)',
        padding: 'clamp(6px, 1.2vh, 12px) clamp(6px, 1vw, 12px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(4px, 0.8vh, 8px)',
        color: '#F8FAFC',
        width: '100%',
        boxSizing: 'border-box',
        maxHeight: '100%',
      }}
    >
      {/* Header bar: Model & Solar cell */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(3px, 0.5vw, 6px)' }}>
          <span style={{ fontSize: 'clamp(10px, 1.2vw, 13px)' }}>🧮</span>
          <span style={{ fontSize: 'clamp(8px, 1vw, 10px)', fontWeight: 900, letterSpacing: '0.8px', color: '#94A3B8' }}>
            STAT-CALC 3000
          </span>
        </div>
        {/* Fake Solar Cell Strip */}
        <div style={{
          width: 'clamp(36px, 4.5vw, 54px)',
          height: 'clamp(9px, 1.3vh, 13px)',
          background: 'linear-gradient(90deg, #382416 0%, #4D321F 50%, #382416 100%)',
          border: '1px solid #1E293B',
          borderRadius: '3px',
          display: 'flex',
          gap: '2px',
          padding: '1px 2px',
          boxSizing: 'border-box',
        }}>
          <div style={{ flex: 1, background: '#2B1A0E', borderRadius: '1px' }} />
          <div style={{ flex: 1, background: '#2B1A0E', borderRadius: '1px' }} />
          <div style={{ flex: 1, background: '#2B1A0E', borderRadius: '1px' }} />
        </div>
      </div>

      {/* LCD Screen Display */}
      <div style={{
        background: '#B8CDB8',
        border: 'clamp(1.5px, 0.3vw, 2.5px) solid #5A6D5A',
        borderRadius: 'clamp(6px, 1vw, 10px)',
        padding: 'clamp(3px, 0.6vh, 8px) clamp(6px, 1vw, 12px)',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 'clamp(38px, 7vh, 68px)',
        boxSizing: 'border-box',
      }}>
        {/* Formula / Expression top line */}
        <div style={{
          fontSize: 'clamp(8.5px, 1.1vw, 11px)',
          fontWeight: 700,
          color: '#3B4E3B',
          fontFamily: 'monospace',
          textAlign: 'right',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minHeight: 'clamp(9px, 1.4vh, 14px)',
          lineHeight: 1.1,
        }}>
          {formula || '\u00A0'}
        </div>
        {/* Main large result line */}
        <div
          data-testid="calc-display-main"
          style={{
            fontSize: 'clamp(15px, 2.5vw, 24px)',
            fontWeight: 900,
            color: '#152415',
            fontFamily: 'monospace',
            textAlign: 'right',
            letterSpacing: '0.8px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.1,
          }}
        >
          {display}
        </div>
      </div>

      {/* Calculator Keypad Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'clamp(3px, 0.5vw, 6px)',
      }}>
        {/* Row 1 */}
        <button
          onClick={handleClear}
          data-testid="calc-btn-clear"
          style={{
            padding: 'clamp(4px, 0.8vh, 10px) 2px',
            borderRadius: 'clamp(5px, 0.8vw, 8px)',
            border: '1px solid #991B1B',
            background: 'linear-gradient(180deg, #EF4444 0%, #DC2626 100%)',
            color: '#FFFFFF',
            fontSize: 'clamp(10.5px, 1.3vw, 14px)',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          C
        </button>
        <button
          onClick={handleBackspace}
          data-testid="calc-btn-backspace"
          style={{
            padding: 'clamp(4px, 0.8vh, 10px) 2px',
            borderRadius: 'clamp(5px, 0.8vw, 8px)',
            border: '1px solid #78350F',
            background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
            color: '#FFFFFF',
            fontSize: 'clamp(10.5px, 1.3vw, 14px)',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          ⌫
        </button>
        <button
          onClick={() => handleOp('÷')}
          data-testid="calc-btn-div"
          style={{
            padding: 'clamp(4px, 0.8vh, 10px) 2px',
            borderRadius: 'clamp(5px, 0.8vw, 8px)',
            border: '1px solid #1D4ED8',
            background: 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)',
            color: '#FFFFFF',
            fontSize: 'clamp(12px, 1.5vw, 16px)',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          ÷
        </button>
        <button
          onClick={() => handleOp('×')}
          data-testid="calc-btn-mul"
          style={{
            padding: 'clamp(4px, 0.8vh, 10px) 2px',
            borderRadius: 'clamp(5px, 0.8vw, 8px)',
            border: '1px solid #1D4ED8',
            background: 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)',
            color: '#FFFFFF',
            fontSize: 'clamp(12px, 1.5vw, 16px)',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          ×
        </button>

        {/* Row 2: 7, 8, 9, - */}
        {['7', '8', '9'].map(n => (
          <button
            key={n}
            onClick={() => handleDigit(n)}
            data-testid={`calc-btn-${n}`}
            style={{
              padding: 'clamp(4px, 0.8vh, 10px) 2px',
              borderRadius: 'clamp(5px, 0.8vw, 8px)',
              border: '1px solid #475569',
              background: 'linear-gradient(180deg, #334155 0%, #1E293B 100%)',
              color: '#F8FAFC',
              fontSize: 'clamp(11px, 1.4vw, 15px)',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleOp('-')}
          data-testid="calc-btn-sub"
          style={{
            padding: 'clamp(4px, 0.8vh, 10px) 2px',
            borderRadius: 'clamp(5px, 0.8vw, 8px)',
            border: '1px solid #1D4ED8',
            background: 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)',
            color: '#FFFFFF',
            fontSize: 'clamp(12px, 1.5vw, 16px)',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          −
        </button>

        {/* Row 3: 4, 5, 6, + */}
        {['4', '5', '6'].map(n => (
          <button
            key={n}
            onClick={() => handleDigit(n)}
            data-testid={`calc-btn-${n}`}
            style={{
              padding: 'clamp(4px, 0.8vh, 10px) 2px',
              borderRadius: 'clamp(5px, 0.8vw, 8px)',
              border: '1px solid #475569',
              background: 'linear-gradient(180deg, #334155 0%, #1E293B 100%)',
              color: '#F8FAFC',
              fontSize: 'clamp(11px, 1.4vw, 15px)',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleOp('+')}
          data-testid="calc-btn-add"
          style={{
            padding: 'clamp(4px, 0.8vh, 10px) 2px',
            borderRadius: 'clamp(5px, 0.8vw, 8px)',
            border: '1px solid #1D4ED8',
            background: 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)',
            color: '#FFFFFF',
            fontSize: 'clamp(12px, 1.5vw, 16px)',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          +
        </button>

        {/* Row 4: 1, 2, 3, = (Equal spans 2 rows) */}
        {['1', '2', '3'].map(n => (
          <button
            key={n}
            onClick={() => handleDigit(n)}
            data-testid={`calc-btn-${n}`}
            style={{
              padding: 'clamp(4px, 0.8vh, 10px) 2px',
              borderRadius: 'clamp(5px, 0.8vw, 8px)',
              border: '1px solid #475569',
              background: 'linear-gradient(180deg, #334155 0%, #1E293B 100%)',
              color: '#F8FAFC',
              fontSize: 'clamp(11px, 1.4vw, 15px)',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {n}
          </button>
        ))}
        <button
          onClick={handleEqual}
          data-testid="calc-btn-equal"
          style={{
            gridRow: 'span 2',
            borderRadius: 'clamp(5px, 0.8vw, 8px)',
            border: '1.5px solid #047857',
            background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            fontSize: 'clamp(14px, 1.8vw, 20px)',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.45)',
          }}
        >
          =
        </button>

        {/* Row 5: 0 (span 2 cols), . */}
        <button
          onClick={() => handleDigit('0')}
          data-testid="calc-btn-0"
          style={{
            gridColumn: 'span 2',
            padding: 'clamp(4px, 0.8vh, 10px) 2px',
            borderRadius: 'clamp(5px, 0.8vw, 8px)',
            border: '1px solid #475569',
            background: 'linear-gradient(180deg, #334155 0%, #1E293B 100%)',
            color: '#F8FAFC',
            fontSize: 'clamp(11px, 1.4vw, 15px)',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          0
        </button>
        <button
          onClick={() => handleDigit('.')}
          data-testid="calc-btn-dot"
          style={{
            padding: 'clamp(4px, 0.8vh, 10px) 2px',
            borderRadius: 'clamp(5px, 0.8vw, 8px)',
            border: '1px solid #475569',
            background: 'linear-gradient(180deg, #334155 0%, #1E293B 100%)',
            color: '#F8FAFC',
            fontSize: 'clamp(12px, 1.6vw, 18px)',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          .
        </button>
      </div>

      <div style={{
        fontSize: 'clamp(7.5px, 0.9vw, 9.5px)',
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 1.25,
        marginTop: '1px',
      }}>
        💡 Gunakan kalkulator untuk menjumlahkan data atau menghitung rata-rata (Total ÷ 24).
      </div>
    </div>
  )
}
