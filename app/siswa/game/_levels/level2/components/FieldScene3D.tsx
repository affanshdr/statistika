'use client'

import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture, Sky } from '@react-three/drei'
import * as THREE from 'three'

// ──────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────

export interface Flag3DData {
  studentId: number
  studentLabel: string
  distance: number
  x: number // world X
  z: number // world Z (depth into field)
  color: string
  isMin?: boolean
  isMax?: boolean
  isLockedMin?: boolean
  isLockedMax?: boolean
  isQ1?: boolean
  isQ2?: boolean
  isQ3?: boolean
}

export interface BallFlight3D {
  startX: number
  startZ: number
  endX: number
  endZ: number
  progress: number // 0-1
}

export interface Player3DPos {
  x: number
  z: number
  dirX: number
  dirZ: number
}

export interface FieldScene3DProps {
  cameraMode: 'normal' | 'overhead'
  flags: Flag3DData[]
  ballFlight: BallFlight3D | null
  playerPos: Player3DPos | null
  showPlayer: boolean
  teacherPos: { x: number; z: number }
  showTeacher: boolean
  ribbonLine: { startX: number; startZ: number; endX: number; endZ: number; color: string } | null
  greenRibbon: { startX: number; startZ: number; endX: number; endZ: number } | null
  throwLineZ: number
  onFieldClick?: (worldX: number, worldZ: number) => void
}

// ──────────────────────────────────────────────────────
// COORDINATE MAPPING
// SVG was 1024x576. Field area roughly x:200-820, y:250-440
// We'll map to 3D world: field = 60m wide x 40m deep
// Center at origin, field extends from z=-20 (far) to z=+20 (near)
// ──────────────────────────────────────────────────────

const FIELD_WIDTH = 62  // X axis
const FIELD_DEPTH = 40  // Z axis (into screen)
const FIELD_HALF_W = FIELD_WIDTH / 2
const FIELD_HALF_D = FIELD_DEPTH / 2
const GREEN_EXTEND = 80 // How far green plains extend beyond field

// ──────────────────────────────────────────────────────
// GROUND PLANE WITH FIELD TEXTURE
// ──────────────────────────────────────────────────────

function FieldGround() {
  const texture = useTexture('/backgrounds/lapangan_level2.jpg')

  useEffect(() => {
    if (texture) {
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.colorSpace = THREE.SRGBColorSpace
      texture.needsUpdate = true
    }
  }, [texture])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
      <planeGeometry args={[FIELD_WIDTH, FIELD_DEPTH]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.85}
        metalness={0.05}
      />
    </mesh>
  )
}

// ──────────────────────────────────────────────────────
// GREEN PLAINS (surrounding area)
// ──────────────────────────────────────────────────────

function GreenPlains() {
  const grassColor = useMemo(() => new THREE.Color('#2d5a1e'), [])
  const grassColorLight = useMemo(() => new THREE.Color('#3a7a28'), [])

  return (
    <>
      {/* Main ground plane beneath everything */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[FIELD_WIDTH + GREEN_EXTEND * 2, FIELD_DEPTH + GREEN_EXTEND * 2]} />
        <meshStandardMaterial color={grassColor} roughness={0.95} metalness={0} />
      </mesh>

      {/* Grass patches for visual variety */}
      {Array.from({ length: 40 }, (_, i) => {
        const angle = (i / 40) * Math.PI * 2
        const radius = FIELD_HALF_W + 8 + Math.random() * 30
        const px = Math.cos(angle) * radius
        const pz = Math.sin(angle) * radius * 0.7
        const scale = 0.3 + Math.random() * 0.6

        return (
          <mesh
            key={`grass-${i}`}
            rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}
            position={[px, 0.005, pz]}
          >
            <circleGeometry args={[scale, 8]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? grassColorLight : grassColor}
              roughness={0.9}
              transparent
              opacity={0.6}
            />
          </mesh>
        )
      })}
    </>
  )
}

// ──────────────────────────────────────────────────────
// FIELD DISTANCE LINES (10m, 20m, ... 100m)
// ──────────────────────────────────────────────────────

function FieldLines({ throwLineZ }: { throwLineZ: number }) {
  const lineColor = useMemo(() => new THREE.Color('#FFFFFF'), [])

  const lines = useMemo(() => {
    const result: { z: number; label: string }[] = []
    for (let d = 10; d <= 100; d += 10) {
      const normDist = d / 100
      const z = throwLineZ - normDist * (FIELD_DEPTH - 4)
      result.push({ z, label: `${d} m` })
    }
    return result
  }, [throwLineZ])

  return (
    <group>
      {/* Throw line */}
      <mesh position={[0, 0.03, throwLineZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[FIELD_WIDTH * 0.85, 0.15]} />
        <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={0.3} />
      </mesh>

      {/* Distance lines */}
      {lines.map((line, i) => (
        <group key={i}>
          <mesh position={[0, 0.025, line.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[FIELD_WIDTH * 0.75, 0.08]} />
            <meshStandardMaterial
              color={lineColor}
              transparent
              opacity={0.45}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ──────────────────────────────────────────────────────
// 3D FLAG (planted in field at landing point)
// ──────────────────────────────────────────────────────

function Flag3D({ flag }: { flag: Flag3DData }) {
  const meshRef = useRef<THREE.Group>(null!)
  const flagColor = useMemo(() => new THREE.Color(flag.color), [flag.color])
  const glowIntensity = flag.isMin || flag.isMax || flag.isLockedMin || flag.isLockedMax || flag.isQ1 || flag.isQ2 || flag.isQ3

  // Create triangle geometry programmatically
  const triangleGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const vertices = new Float32Array([
      -0.35, 0.2, 0,
       0.35, 0.1, 0,
      -0.35, -0.15, 0,
    ])
    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    geom.computeVertexNormals()
    return geom
  }, [])

  useFrame(() => {
    if (meshRef.current && glowIntensity) {
      const scale = 1 + Math.sin(Date.now() * 0.004) * 0.08
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group ref={meshRef} position={[flag.x, 0, flag.z]}>
      {/* Shadow ellipse */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.3, 12]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      {/* Pole */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.3, 8]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Flag triangle */}
      <mesh position={[0.35, 1.1, 0]} geometry={triangleGeom}>
        <meshStandardMaterial
          color={flagColor}
          emissive={flagColor}
          emissiveIntensity={glowIntensity ? 0.4 : 0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Label background */}
      <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 6, 0, 0]}>
        <planeGeometry args={[1.4, 0.35]} />
        <meshStandardMaterial
          color="#0F172A"
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// ──────────────────────────────────────────────────────
// ANIMATED BALL
// ──────────────────────────────────────────────────────

function AnimatedBall({ flight }: { flight: BallFlight3D }) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame(() => {
    if (!groupRef.current) return
    const p = flight.progress
    const x = flight.startX + (flight.endX - flight.startX) * p
    const z = flight.startZ + (flight.endZ - flight.startZ) * p
    const arcHeight = Math.sin(p * Math.PI) * 8
    const y = arcHeight

    groupRef.current.position.set(x, y, z)
    groupRef.current.rotation.x += 0.15
    groupRef.current.rotation.z += 0.08
  })

  return (
    <group ref={groupRef} castShadow>
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.2} />
      </mesh>
      {/* Red seam lines */}
      <mesh>
        <torusGeometry args={[0.2, 0.02, 4, 16]} />
        <meshStandardMaterial color="#EF4444" />
      </mesh>
    </group>
  )
}

// ──────────────────────────────────────────────────────
// RIBBON LINE (Range or IQR)
// ──────────────────────────────────────────────────────

function RibbonLine3D({ start, end, color, yOffset = 1.0 }: {
  start: { x: number; z: number }
  end: { x: number; z: number }
  color: string
  yOffset?: number
}) {
  const ribbonColor = useMemo(() => new THREE.Color(color), [color])
  const ref = useRef<THREE.Mesh>(null!)

  const { midX, midZ, length, angle } = useMemo(() => {
    const dx = end.x - start.x
    const dz = end.z - start.z
    return {
      midX: (start.x + end.x) / 2,
      midZ: (start.z + end.z) / 2,
      length: Math.sqrt(dx * dx + dz * dz),
      angle: Math.atan2(dz, dx),
    }
  }, [start, end])

  useFrame(() => {
    if (ref.current) {
      const pulse = 0.8 + Math.sin(Date.now() * 0.003) * 0.2
      ;(ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse
    }
  })

  return (
    <group>
      <mesh
        ref={ref}
        position={[midX, yOffset, midZ]}
        rotation={[0, -angle, 0]}
      >
        <boxGeometry args={[length, 0.06, 0.12]} />
        <meshStandardMaterial
          color={ribbonColor}
          emissive={ribbonColor}
          emissiveIntensity={0.6}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Start/End markers */}
      <mesh position={[start.x, yOffset, start.z]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={ribbonColor} emissive={ribbonColor} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[end.x, yOffset, end.z]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={ribbonColor} emissive={ribbonColor} emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

// ──────────────────────────────────────────────────────
// FLAG POLE (Tiang Bendera Indonesia)
// ──────────────────────────────────────────────────────

function FlagPole() {
  return (
    <group position={[0, 0, FIELD_HALF_D - 2]}>
      {/* Base pedestal */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.2, 0.5, 1.2]} />
        <meshStandardMaterial color="#9CA3AF" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.9, 0.1, 0.9]} />
        <meshStandardMaterial color="#D1D5DB" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Pole */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 7, 12]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Top knob */}
      <mesh position={[0, 7.6, 0]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Indonesia flag - Red stripe */}
      <mesh position={[0.8, 7, 0]}>
        <planeGeometry args={[1.5, 0.5]} />
        <meshStandardMaterial color="#EF4444" side={THREE.DoubleSide} />
      </mesh>
      {/* White stripe */}
      <mesh position={[0.8, 6.5, 0]}>
        <planeGeometry args={[1.5, 0.5]} />
        <meshStandardMaterial color="#FFFFFF" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// ──────────────────────────────────────────────────────
// GOAL POST (simple)
// ──────────────────────────────────────────────────────

function GoalPost({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Left post */}
      <mesh position={[-1.8, 1.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 2.4, 8]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Right post */}
      <mesh position={[1.8, 1.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 2.4, 8]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, 2.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 3.6, 8]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Net (simplified as plane) */}
      <mesh position={[0, 1.2, -0.5]}>
        <planeGeometry args={[3.6, 2.4]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.15} side={THREE.DoubleSide} wireframe />
      </mesh>
    </group>
  )
}

// ──────────────────────────────────────────────────────
// BASKETBALL HOOP (simple)
// ──────────────────────────────────────────────────────

function BasketballHoop({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 4, 8]} />
        <meshStandardMaterial color="#6B7280" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Backboard */}
      <mesh position={[0, 3.8, 0.3]}>
        <boxGeometry args={[1.2, 0.8, 0.05]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.9} />
      </mesh>
      {/* Rim */}
      <mesh position={[0, 3.4, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.02, 8, 16]} />
        <meshStandardMaterial color="#EF4444" metalness={0.4} />
      </mesh>
    </group>
  )
}

// ──────────────────────────────────────────────────────
// SIMPLE TREES (surrounding area)
// ──────────────────────────────────────────────────────

function Trees() {
  const treePositions = useMemo(() => {
    const positions: { x: number; z: number; scale: number; type: 'regular' | 'palm' }[] = []

    // Trees along edges
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2
      const radius = FIELD_HALF_W + 6 + Math.random() * 12
      positions.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius * 0.65,
        scale: 0.7 + Math.random() * 0.6,
        type: Math.random() > 0.5 ? 'palm' : 'regular',
      })
    }

    // Additional background trees
    for (let i = 0; i < 12; i++) {
      const x = -FIELD_HALF_W - 5 + Math.random() * (FIELD_WIDTH + 10)
      const z = -FIELD_HALF_D - 8 - Math.random() * 15
      positions.push({
        x,
        z,
        scale: 0.5 + Math.random() * 0.5,
        type: Math.random() > 0.4 ? 'palm' : 'regular',
      })
    }

    return positions
  }, [])

  return (
    <group>
      {treePositions.map((tree, i) => (
        tree.type === 'palm' ? (
          <PalmTree key={i} position={[tree.x, 0, tree.z]} scale={tree.scale} />
        ) : (
          <RegularTree key={i} position={[tree.x, 0, tree.z]} scale={tree.scale} />
        )
      ))}
    </group>
  )
}

function PalmTree({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.12, 0.2, 6, 8]} />
        <meshStandardMaterial color="#8B6914" roughness={0.9} />
      </mesh>
      {/* Fronds */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((angle * Math.PI) / 180) * 1.5,
            5.5,
            Math.sin((angle * Math.PI) / 180) * 1.5,
          ]}
          rotation={[0.5, (angle * Math.PI) / 180, 0.3]}
        >
          <planeGeometry args={[3, 0.8]} />
          <meshStandardMaterial color="#1a6e1a" side={THREE.DoubleSide} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  )
}

function RegularTree({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 3, 8]} />
        <meshStandardMaterial color="#5C4033" roughness={0.9} />
      </mesh>
      {/* Canopy layers */}
      <mesh position={[0, 3.5, 0]}>
        <sphereGeometry args={[1.8, 8, 8]} />
        <meshStandardMaterial color="#1e6b1e" roughness={0.8} />
      </mesh>
      <mesh position={[0.5, 4.2, 0.3]}>
        <sphereGeometry args={[1.2, 8, 8]} />
        <meshStandardMaterial color="#2a8a2a" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ──────────────────────────────────────────────────────
// CAMERA CONTROLLER
// ──────────────────────────────────────────────────────

function CameraController({ mode, playerPos }: { mode: 'normal' | 'overhead'; playerPos: Player3DPos | null }) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const smoothSpeed = 2.5

    if (mode === 'overhead') {
      targetPos.current.set(0, 35, 5)
      targetLookAt.current.set(0, 0, -5)
    } else {
      // Normal mode: behind and above player
      const px = playerPos?.x ?? 0
      const pz = playerPos?.z ?? FIELD_HALF_D - 2
      targetPos.current.set(px * 0.3, 18, pz + 22)
      targetLookAt.current.set(0, 0, -5)
    }

    camera.position.lerp(targetPos.current, delta * smoothSpeed)

    // Smooth look-at
    const currentLookAt = new THREE.Vector3()
    camera.getWorldDirection(currentLookAt)
    const currentTarget = camera.position.clone().add(currentLookAt.multiplyScalar(30))
    currentTarget.lerp(targetLookAt.current, delta * smoothSpeed)
    camera.lookAt(targetLookAt.current)
  })

  return null
}

// ──────────────────────────────────────────────────────
// SUNSET LIGHTING
// ──────────────────────────────────────────────────────

function SunsetLighting() {
  return (
    <>
      {/* Warm ambient light */}
      <ambientLight intensity={0.4} color="#FFE4B5" />

      {/* Main sun directional (sunset angle) */}
      <directionalLight
        position={[30, 15, -20]}
        intensity={1.2}
        color="#FF8C42"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />

      {/* Fill light from opposite side */}
      <directionalLight
        position={[-20, 10, 15]}
        intensity={0.3}
        color="#87CEEB"
      />

      {/* Soft hemisphere */}
      <hemisphereLight
        args={['#FF9966', '#2d5a1e', 0.5]}
      />
    </>
  )
}

// ──────────────────────────────────────────────────────
// CLICK HANDLER PLANE (invisible)
// ──────────────────────────────────────────────────────

function ClickPlane({ onFieldClick }: { onFieldClick?: (x: number, z: number) => void }) {
  const handleClick = useCallback((e: any) => {
    if (!onFieldClick) return
    e.stopPropagation()
    const point = e.point
    onFieldClick(point.x, point.z)
  }, [onFieldClick])

  if (!onFieldClick) return null

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={handleClick}
      visible={false}
    >
      <planeGeometry args={[FIELD_WIDTH, FIELD_DEPTH]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}

// ──────────────────────────────────────────────────────
// MAIN SCENE (internal, rendered inside Canvas)
// ──────────────────────────────────────────────────────

function Scene({
  cameraMode,
  flags,
  ballFlight,
  playerPos,
  showPlayer,
  teacherPos,
  showTeacher,
  ribbonLine,
  greenRibbon,
  throwLineZ,
  onFieldClick,
}: FieldScene3DProps) {
  return (
    <>
      {/* Camera */}
      <CameraController mode={cameraMode} playerPos={playerPos} />

      {/* Lighting */}
      <SunsetLighting />

      {/* Sky */}
      <Sky
        distance={450000}
        sunPosition={[50, 8, -30]}
        inclination={0.52}
        azimuth={0.25}
        rayleigh={0.5}
        turbidity={8}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* Green surrounding plains */}
      <GreenPlains />

      {/* Field ground with texture */}
      <FieldGround />

      {/* Field distance lines */}
      <FieldLines throwLineZ={throwLineZ} />

      {/* Flag pole (tiang bendera Indonesia) */}
      <FlagPole />

      {/* Goal post (left side of field) */}
      <GoalPost position={[-FIELD_HALF_W + 1, 0, -FIELD_HALF_D + 5]} rotation={Math.PI / 2} />

      {/* Basketball hoop (right side) */}
      <BasketballHoop position={[FIELD_HALF_W - 1, 0, 5]} />

      {/* Trees surrounding the field */}
      <Trees />

      {/* Planted flags for measured students */}
      {flags.map(flag => (
        <Flag3D key={flag.studentId} flag={flag} />
      ))}

      {/* Flying ball */}
      {ballFlight && ballFlight.progress < 1 && (
        <AnimatedBall flight={ballFlight} />
      )}

      {/* Red ribbon (Range) */}
      {ribbonLine && (
        <RibbonLine3D
          start={{ x: ribbonLine.startX, z: ribbonLine.startZ }}
          end={{ x: ribbonLine.endX, z: ribbonLine.endZ }}
          color={ribbonLine.color}
        />
      )}

      {/* Green ribbon (IQR) */}
      {greenRibbon && (
        <RibbonLine3D
          start={{ x: greenRibbon.startX, z: greenRibbon.startZ }}
          end={{ x: greenRibbon.endX, z: greenRibbon.endZ }}
          color="#10B981"
          yOffset={1.4}
        />
      )}

      {/* Click handler */}
      <ClickPlane onFieldClick={onFieldClick} />
    </>
  )
}

// ──────────────────────────────────────────────────────
// EXPORTED COMPONENT
// ──────────────────────────────────────────────────────

export default function FieldScene3D(props: FieldScene3DProps) {
  const [ready, setReady] = useState(false)

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        background: '#0a0f1a',
      }}
    >
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{
          fov: 55,
          near: 0.1,
          far: 500,
          position: [0, 18, 25],
        }}
        onCreated={() => setReady(true)}
        style={{
          width: '100%',
          height: '100%',
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}
      >
        <Scene {...props} />
      </Canvas>

      {/* Loading overlay */}
      {!ready && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10, 15, 26, 0.95)',
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏟️</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#FBBF24' }}>
              Memuat Lapangan 3D...
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────
// COORDINATE CONVERSION UTILITIES
// Export these so Level2Main can convert SVG coords → 3D world
// ──────────────────────────────────────────────────────

/**
 * Convert a throw distance (10-100m game units) to 3D world coordinates
 * @param distance - throw distance in game meters (10-100)
 * @param studentId - used for lane spread calculation
 * @param throwLineZ - the Z position of the throw line in 3D space
 * @returns { x, z } in 3D world coordinates
 */
export function distanceTo3DCoord(
  distance: number,
  studentId: number,
  throwLineZ: number = FIELD_HALF_D - 4,
): { x: number; z: number } {
  const normDist = Math.max(10, Math.min(100, distance)) / 100
  const z = throwLineZ - normDist * (FIELD_DEPTH - 6)

  // Spread across field width based on student lane
  const laneIndex = (studentId * 3) % 8
  const laneSpread = ((laneIndex / 7) - 0.5) * (FIELD_WIDTH * 0.6)
  const x = laneSpread + normDist * 2

  return { x, z }
}

/**
 * Convert SVG player position (x: 120-900, y: 410-545) to 3D world coords
 */
export function svgPlayerTo3D(
  svgX: number,
  svgY: number,
): { x: number; z: number } {
  // SVG X: 120-900 → 3D X: -FIELD_HALF_W to +FIELD_HALF_W
  const normX = (svgX - 510) / 390
  const x = normX * FIELD_HALF_W

  // SVG Y: 410-545 → 3D Z: near side of field
  const normZ = (svgY - 410) / (545 - 410)
  const z = FIELD_HALF_D - 4 + normZ * 8

  return { x, z }
}

// Export constants
export { FIELD_WIDTH, FIELD_DEPTH, FIELD_HALF_W, FIELD_HALF_D }
