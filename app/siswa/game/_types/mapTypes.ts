export interface CameraConfig {
  mode: 'follow' | 'fixed'
  vw: number
  vh: number
  preserveAspectRatio?: string
}

export interface CharacterConfig {
  baseSize: number
  depthFactor: number
  speed: number
}

export interface MapConfig {
  id: string
  name: string
  type: 'hallway' | 'classroom' | 'special'
  bgImage: string
  camera: CameraConfig
  character: CharacterConfig
  spawn: { x: number; y: number }
  teacher?: {
    name: string
    x: number
    y: number
    hotspotW: number
    hotspotH: number
  }
  isWalkable: (x: number, y: number, unlocked: Set<string>) => boolean
}
