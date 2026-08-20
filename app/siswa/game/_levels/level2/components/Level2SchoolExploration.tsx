'use client'

import { useState, useEffect, useRef } from 'react'
import PlayerCharacter from '@/app/siswa/game/_components/PlayerCharacter'

// ─── Classroom World Map dimensions ───────
const WORLD_VW_KELAS = 1200
const WORLD_VW_JALAN = 3000 // Expanded panorama width for Jalan.jpg
const WORLD_VH = 750
const BOTTOM_Y_LIMIT = WORLD_VH - 20 // 730px - allow character to walk down to bottom edge
const SPEED = 1.8

// Red line points per map
const RED_LINE_POINTS_KELAS = [
  { x: 0, y: 570 },
  { x: 280, y: 570 },
  { x: 450, y: 470 },
  { x: 820, y: 470 },
  { x: 980, y: 570 },
  { x: 1200, y: 540 },
]

const RED_LINE_POINTS_JALAN = [
  { x: 0, y: 580 },
  { x: 3000, y: 580 },
]

// Linear Interpolation helper: calculates exact min Y boundary at any given X coordinate
function getRedLineY(x: number, points: { x: number; y: number }[]): number {
  if (x <= points[0].x) return points[0].y
  const lastPt = points[points.length - 1]
  if (x >= lastPt.x) return lastPt.y

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    if (x >= p1.x && x <= p2.x) {
      const t = (x - p1.x) / (p2.x - p1.x || 1)
      return p1.y + t * (p2.y - p1.y)
    }
  }
  return 570
}

interface VictimData {
  txt: string
  val: number
}

interface LocationMeta {
  id: string
  name: string
  icon: string
  color: string
  x: number
  y: number
  victims: VictimData[]
}

interface Level2SchoolExplorationProps {
  cognitiveStyle: 'FI' | 'FD'
  visitedLocations: string[]
  victimsVisited: Record<string, number[]>
  collectedCount: number
  locations: LocationMeta[]
  onSelectLocation: (locId: string) => void
  onRecordVictim: (locId: string, idx: number) => void
  onStartInterrogation: () => void
}

export default function Level2SchoolExploration({
  cognitiveStyle,
  visitedLocations = [],
  victimsVisited = {},
  collectedCount = 0,
  locations = [],
  onSelectLocation,
  onRecordVictim,
  onStartInterrogation,
}: Level2SchoolExplorationProps) {
  const accentColor = cognitiveStyle === 'FD' ? '#00ADB5' : '#38BDF8'

  // Map state: 'kelas' (Kelas.jpg) vs 'jalan' (Jalan.jpg)
  const [activeMap, setActiveMap] = useState<'kelas' | 'jalan'>('kelas')

  // Dynamic world width and red line boundary points based on active map
  const worldVW = activeMap === 'jalan' ? WORLD_VW_JALAN : WORLD_VW_KELAS
  const redLinePoints = activeMap === 'jalan' ? RED_LINE_POINTS_JALAN : RED_LINE_POINTS_KELAS

  // Player position & movement states
  const [charPos, setCharPos] = useState({ x: 580, y: 540 })
  const [moveDir, setMoveDir] = useState({ x: 0, y: 0 })
  const dirRef = useRef({ x: 0, y: 0 })
  const animRef = useRef<number | null>(null)

  // Portal Hotspots per map
  const mapPortals = activeMap === 'kelas' ? [
    { id: 'to_jalan', name: 'Lorong Sekolah (Jalan)', icon: '🏫', color: '#FB7185', x: 1150, y: 630 }
  ] : [
    { id: 'to_kelas', name: 'Gedung Utama (Kelas)', icon: '🏫', color: '#38BDF8', x: 50, y: 630 }
  ]

  // Nearby Portal Proximity Check
  const nearbyPortal = mapPortals.find(portal => {
    const dist = Math.hypot(charPos.x - portal.x, charPos.y - portal.y)
    return dist < 85
  })

  // Switch Map Handler
  const handleToggleMap = () => {
    if (activeMap === 'kelas') {
      setActiveMap('jalan')
      setCharPos({ x: 70, y: 630 })
    } else {
      setActiveMap('kelas')
      setCharPos({ x: 1100, y: 630 })
    }
  }

  // Keyboard interaction listener (Key 'E' or 'Enter' to switch map when near portal)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
        if (nearbyPortal) {
          handleToggleMap()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [nearbyPortal, activeMap])

  // Joystick states
  const joystickOuterRef = useRef<HTMLDivElement>(null)
  const joystickKnobRef = useRef<HTMLDivElement>(null)
  const joystickActive = useRef(false)
  const JOYSTICK_R = 36

  // Auto-clamp player Y position if ever above redLinePoints
  useEffect(() => {
    const currentRedLineY = getRedLineY(charPos.x, redLinePoints)
    if (charPos.y < currentRedLineY) {
      setCharPos(prev => ({ ...prev, y: currentRedLineY }))
    }
  }, [charPos.x, charPos.y, activeMap])

  // ── 1. Main Game Movement Loop with Dynamic Wall Collision ──────
  useEffect(() => {
    const tick = () => {
      const { x: dx, y: dy } = dirRef.current
      if (dx || dy) {
        setCharPos(p => {
          const nx = Math.max(10, Math.min(worldVW - 10, p.x + dx * SPEED))

          // Calculate exact Y wall limit at target X position
          const minYAtTargetX = getRedLineY(nx, redLinePoints)

          // Character can NEVER walk above the red line boundary!
          const ny = Math.max(minYAtTargetX, Math.min(BOTTOM_Y_LIMIT, p.y + dy * SPEED))
          return { x: nx, y: ny }
        })
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [activeMap, redLinePoints, worldVW])

  // ── 2. Keyboard Control Listener ─────────────
  useEffect(() => {
    const KEY_MAP: Record<string, { x: number; y: number }> = {
      ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
    }
    const pressedKeys = new Set<string>()

    const updateDir = () => {
      let nx = 0, ny = 0
      pressedKeys.forEach(k => {
        const d = KEY_MAP[k]
        if (d) { nx += d.x; ny += d.y }
      })
      const len = Math.sqrt(nx * nx + ny * ny)
      const nextDir = len > 0 ? { x: nx / len, y: ny / len } : { x: 0, y: 0 }
      dirRef.current = nextDir
      setMoveDir(nextDir)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (KEY_MAP[e.key]) {
        e.preventDefault()
        pressedKeys.add(e.key)
        updateDir()
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (KEY_MAP[e.key]) {
        pressedKeys.delete(e.key)
        updateDir()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      dirRef.current = { x: 0, y: 0 }
      setMoveDir({ x: 0, y: 0 })
    }
  }, [])

  // Joystick Compute
  const computeJoystick = (clientX: number, clientY: number) => {
    const outer = joystickOuterRef.current
    if (!outer) return
    const rect = outer.getBoundingClientRect()
    const dx = clientX - (rect.left + rect.width / 2)
    const dy = clientY - (rect.top + rect.height / 2)
    const dist = Math.sqrt(dx * dx + dy * dy)
    const nx = Math.max(-1, Math.min(1, dist > 0 ? dx / Math.max(dist, JOYSTICK_R) : 0))
    const ny = Math.max(-1, Math.min(1, dist > 0 ? dy / Math.max(dist, JOYSTICK_R) : 0))

    const nextDir = { x: nx, y: ny }
    dirRef.current = nextDir
    setMoveDir(nextDir)

    if (joystickKnobRef.current) {
      const clampX = (dx / Math.max(dist, 1)) * Math.min(dist, JOYSTICK_R)
      const clampY = (dy / Math.max(dist, 1)) * Math.min(dist, JOYSTICK_R)
      joystickKnobRef.current.style.transform = `translate(calc(-50% + ${clampX}px), calc(-50% + ${clampY}px))`
    }
  }

  const resetJoystick = () => {
    joystickActive.current = false
    dirRef.current = { x: 0, y: 0 }
    setMoveDir({ x: 0, y: 0 })
    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = 'translate(-50%, -50%)'
    }
  }

  // Dynamic Container ResizeObserver for 100% Edge-to-Edge Responsive Viewport
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerDim, setContainerDim] = useState({ w: 720, h: 405 })

  useEffect(() => {
    if (!containerRef.current) return
    const updateDim = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current
        if (clientWidth > 0 && clientHeight > 0) {
          setContainerDim({ w: clientWidth, h: clientHeight })
        }
      }
    }
    updateDim()
    const ro = new ResizeObserver(updateDim)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Calculate dynamic camera viewport dimensions based on container aspect ratio
  const BASE_VIEW_VH = 420
  const aspect = containerDim.w / Math.max(containerDim.h, 1)

  let viewVH = BASE_VIEW_VH
  let viewVW = BASE_VIEW_VH * aspect

  // Clamp viewVW to worldVW if screen is ultra-wide
  if (viewVW > worldVW) {
    viewVW = worldVW
    viewVH = worldVW / aspect
  }

  // Camera viewport calculation with smooth scrolling across full worldVW
  const camX = Math.max(0, Math.min(worldVW - viewVW, charPos.x - viewVW / 2))
  const camY = Math.max(0, Math.min(WORLD_VH - viewVH, charPos.y - viewVH * 0.65))

  // Depth-based character sizing
  const depthRatio = Math.max(0, Math.min(1, (charPos.y - 10) / (BOTTOM_Y_LIMIT - 10)))
  const charSize = 100 + depthRatio * 60

  // Visual Debug Bounds Mode State
  const [showDebug, setShowDebug] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Viewport Container */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          width: '100%',
          minHeight: 0,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 16,
          overflow: 'hidden',
          background: 'var(--game-bg, #0b1e2c)',
          border: '1px solid rgba(14, 131, 136, 0.25)',
        }}
      >

        {/* Floating Glassmorphism HUD Overlay */}
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          pointerEvents: 'none'
        }}>
          <div style={{
            background: 'rgba(11, 30, 44, 0.85)',
            backdropFilter: 'blur(12px)',
            border: `1.5px solid ${accentColor}35`,
            borderRadius: 12,
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
            pointerEvents: 'auto'
          }}>
            <div style={{ fontSize: '15px' }}>🕵️‍♂️</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#F8FAFC', letterSpacing: '0.3px' }}>
                Peta: {activeMap === 'kelas' ? 'Sekolah / Kelas' : 'Lorong / Jalan (Panorama)'} Level 2
              </span>
            </div>
          </div>

          {/* Visual Debug HUD Button */}
          <button
            onClick={() => setShowDebug(p => !p)}
            style={{
              background: showDebug ? 'rgba(239, 68, 68, 0.9)' : 'rgba(15, 23, 42, 0.85)',
              color: '#FFFFFF',
              border: '1.5px solid rgba(255,255,255,0.3)',
              borderRadius: 10,
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              transition: 'all 0.2s',
            }}
          >
            <span>🛠️ Debug Visual Bounds: {showDebug ? 'ON' : 'OFF'}</span>
            <span style={{ opacity: 0.8 }}>({Math.round(charPos.x)}, {Math.round(charPos.y)})</span>
          </button>
        </div>

        {/* Dynamic SVG Camera Canvas */}
        <svg
          viewBox={`${camX} ${camY} ${viewVW} ${viewVH}`}
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        >
          {/* Background Image: Dynamic width per map */}
          <image
            href={activeMap === 'jalan' ? '/Assets/Building/Jalan.jpg' : '/Assets/Building/Kelas.jpg'}
            x={0}
            y={0}
            width={worldVW}
            height={WORLD_VH}
            preserveAspectRatio="none"
            opacity={0.95}
          />

          {/* Dark Vignette Overlay */}
          <rect x={0} y={0} width={worldVW} height={WORLD_VH} fill="rgba(4, 7, 10, 0.15)" />

          {/* Interactive Map Location Portals / Hotspots */}
          {mapPortals.map((portal) => {
            const dist = Math.hypot(charPos.x - portal.x, charPos.y - portal.y)
            const isClose = dist < 85

            return (
              <g
                key={portal.id}
                style={{ cursor: 'pointer' }}
                onClick={handleToggleMap}
              >
                {/* Outer Glow Ring */}
                <circle
                  cx={portal.x}
                  cy={portal.y}
                  r={isClose ? 36 : 28}
                  fill={`${portal.color}25`}
                  stroke={portal.color}
                  strokeWidth={isClose ? 3 : 2}
                />
                {/* Pulse Ring when close */}
                {isClose && (
                  <circle
                    cx={portal.x}
                    cy={portal.y}
                    r={46}
                    fill="none"
                    stroke={portal.color}
                    strokeWidth={1.5}
                    opacity={0.6}
                  />
                )}
                {/* Center Icon Circle */}
                <circle
                  cx={portal.x}
                  cy={portal.y}
                  r={18}
                  fill="#0F172A"
                  stroke={portal.color}
                  strokeWidth={2}
                />
                <text
                  x={portal.x}
                  y={portal.y + 6}
                  textAnchor="middle"
                  fontSize={16}
                >
                  {portal.icon}
                </text>

                {/* Label Box */}
                <rect
                  x={portal.x - 65}
                  y={portal.y - 48}
                  width={130}
                  height={22}
                  rx={6}
                  fill="rgba(15, 23, 42, 0.9)"
                  stroke={isClose ? '#38BDF8' : portal.color}
                  strokeWidth={1.5}
                />
                <text
                  x={portal.x}
                  y={portal.y - 33}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize={11}
                  fontWeight="800"
                >
                  {portal.name}
                </text>

                {/* Interaction Hint Tag above Label when player is close */}
                {isClose && (
                  <g>
                    <rect
                      x={portal.x - 55}
                      y={portal.y - 74}
                      width={110}
                      height={20}
                      rx={5}
                      fill={portal.color}
                    />
                    <text
                      x={portal.x}
                      y={portal.y - 60}
                      textAnchor="middle"
                      fill="#0F172A"
                      fontSize={10}
                      fontWeight="900"
                    >
                      [ Tekan E / Tap ]
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* VISUAL DEBUG OVERLAY LAYERS */}
          {showDebug && (
            <g style={{ pointerEvents: 'none' }}>
              {/* 1. Walkable Area Polygon */}
              <polygon
                points={[
                  ...redLinePoints.map(p => `${p.x},${p.y}`),
                  `${redLinePoints[redLinePoints.length - 1].x},${BOTTOM_Y_LIMIT}`,
                  `${redLinePoints[0].x},${BOTTOM_Y_LIMIT}`
                ].join(' ')}
                fill="rgba(16, 185, 129, 0.15)"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="6 6"
              />

              {/* 2. Red Line Wall Base Boundary Line */}
              <polyline
                points={redLinePoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#EF4444"
                strokeWidth={4}
              />

              {/* 3. Grid Lines */}
              {Array.from({ length: Math.ceil(worldVW / 100) + 1 }).map((_, i) => (
                <g key={`grid-x-${i}`}>
                  <line x1={i * 100} y1={0} x2={i * 100} y2={WORLD_VH} stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray="4 4" />
                  <text x={i * 100 + 4} y={15} fill="rgba(255,255,255,0.4)" fontSize={10} fontFamily="monospace">X:{i * 100}</text>
                </g>
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <g key={`grid-y-${i}`}>
                  <line x1={0} y1={i * 100} x2={worldVW} y2={i * 100} stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray="4 4" />
                  <text x={4} y={i * 100 + 12} fill="rgba(255,255,255,0.4)" fontSize={10} fontFamily="monospace">Y:{i * 100}</text>
                </g>
              ))}

              {/* 4. VISUAL NODE DECORATORS FOR redLinePoints */}
              {redLinePoints.map((pt, idx) => (
                <g key={`red-node-${idx}`}>
                  <circle cx={pt.x} cy={pt.y} r={8} fill="rgba(239, 68, 68, 0.4)" stroke="#EF4444" strokeWidth={2} />
                  <circle cx={pt.x} cy={pt.y} r={3} fill="#FFFFFF" />
                  <rect
                    x={pt.x - 32}
                    y={pt.y - 25}
                    width={64}
                    height={16}
                    rx={4}
                    fill="rgba(15, 23, 42, 0.95)"
                    stroke="#EF4444"
                    strokeWidth={1.2}
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 13}
                    textAnchor="middle"
                    fill="#F87171"
                    fontSize={9}
                    fontWeight="900"
                    fontFamily="monospace"
                  >
                    P{idx + 1}: {pt.x},{pt.y}
                  </text>
                </g>
              ))}

              {/* 5. Realtime Character Position Crosshair & Label */}
              <circle cx={charPos.x} cy={charPos.y} r={7} fill="#F59E0B" stroke="#FFFFFF" strokeWidth={2} />
              <text x={charPos.x} y={charPos.y + 24} textAnchor="middle" fill="#F59E0B" fontSize={12} fontWeight="bold" fontFamily="monospace" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.9))' }}>
                📍 ({Math.round(charPos.x)}, {Math.round(charPos.y)})
              </text>
            </g>
          )}

          {/* Player Character */}
          <PlayerCharacter
            x={charPos.x}
            y={charPos.y}
            dir={moveDir}
            size={charSize}
            label="Kamu"
          />
        </svg>

        {/* Floating Nearby Location Interaction Button */}
        {nearbyPortal && (
          <button
            onClick={handleToggleMap}
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 45,
              background: `linear-gradient(135deg, ${nearbyPortal.color} 0%, #0F172A 100%)`,
              color: '#FFFFFF',
              border: `2px solid ${nearbyPortal.color}`,
              borderRadius: 14,
              padding: '10px 22px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: `0 4px 20px ${nearbyPortal.color}80`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              pointerEvents: 'auto',
            }}
          >
            <span style={{ fontSize: '18px' }}>{nearbyPortal.icon}</span>
            <span>Masuk ke {nearbyPortal.name} (Tekan E / Klik)</span>
          </button>
        )}

        {/* Virtual Joystick */}
        <div
          ref={joystickOuterRef}
          style={{
            position: 'absolute',
            bottom: '14px',
            left: '14px',
            width: `${JOYSTICK_R * 2}px`,
            height: `${JOYSTICK_R * 2}px`,
            borderRadius: '50%',
            background: 'rgba(14, 131, 136, 0.15)',
            border: '2px solid rgba(255,255,255,0.2)',
            touchAction: 'none',
            zIndex: 30,
          }}
          onPointerDown={(e) => {
            joystickActive.current = true
            joystickOuterRef.current?.setPointerCapture(e.pointerId)
            computeJoystick(e.clientX, e.clientY)
          }}
          onPointerMove={(e) => {
            if (joystickActive.current) computeJoystick(e.clientX, e.clientY)
          }}
          onPointerUp={resetJoystick}
          onPointerCancel={resetJoystick}
        >
          <div
            ref={joystickKnobRef}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${accentColor} 0%, #38BDF8 100%)`,
              boxShadow: `0 0 10px ${accentColor}`,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </div>
  )
}
