// Lightweight Web Audio API Synthesizer & BGM Sequencer for Casecode
// 100% zero-latency, no external audio files required, runs seamlessly in all browsers

export type BgmTrack = 'menu' | 'level1' | 'level2' | null

interface SequencerNote {
  freq: number
  dur: number
  type?: OscillatorType
  vol?: number
  bass?: number
}

// Warm musical note frequencies (Hz)
const N = {
  REST: 0,
  // Bass octave
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  // Middle octave
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  // High octave
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50,
}

// 1. MENU / CORKBOARD DETECTIVE THEME (Cozy Lo-Fi Mystery in A Minor / C Major)
const MENU_PATTERN: SequencerNote[] = [
  { freq: N.E4, dur: 0.42, bass: N.A3, vol: 0.035 },
  { freq: N.A4, dur: 0.42, vol: 0.03 },
  { freq: N.C5, dur: 0.42, vol: 0.035 },
  { freq: N.B4, dur: 0.42, vol: 0.03 },
  { freq: N.A4, dur: 0.55, bass: N.F3, vol: 0.035 },
  { freq: N.G4, dur: 0.42, vol: 0.028 },
  { freq: N.E4, dur: 0.55, vol: 0.03 },
  { freq: N.REST, dur: 0.35, bass: N.D3 },

  { freq: N.D4, dur: 0.42, bass: N.D3, vol: 0.032 },
  { freq: N.F4, dur: 0.42, vol: 0.03 },
  { freq: N.A4, dur: 0.42, vol: 0.035 },
  { freq: N.G4, dur: 0.42, bass: N.G3, vol: 0.03 },
  { freq: N.E4, dur: 0.65, bass: N.E3, vol: 0.032 },
  { freq: N.REST, dur: 0.45 },
]

// 2. LEVEL 1: SCHOOL EXPLORATION THEME (Cheerful Cozy Pixel RPG in C Major)
const LEVEL1_PATTERN: SequencerNote[] = [
  { freq: N.G4, dur: 0.32, bass: N.C3, vol: 0.036 },
  { freq: N.E4, dur: 0.32, vol: 0.03 },
  { freq: N.A4, dur: 0.32, bass: N.C3, vol: 0.036 },
  { freq: N.G4, dur: 0.32, vol: 0.032 },
  { freq: N.C5, dur: 0.48, bass: N.F3, vol: 0.038 },
  { freq: N.B4, dur: 0.32, vol: 0.032 },
  { freq: N.A4, dur: 0.48, bass: N.F3, vol: 0.035 },
  { freq: N.G4, dur: 0.32, bass: N.G3, vol: 0.03 },

  { freq: N.E4, dur: 0.32, bass: N.A3, vol: 0.032 },
  { freq: N.G4, dur: 0.32, vol: 0.032 },
  { freq: N.A4, dur: 0.32, bass: N.F3, vol: 0.036 },
  { freq: N.F4, dur: 0.32, vol: 0.03 },
  { freq: N.D4, dur: 0.36, bass: N.G3, vol: 0.032 },
  { freq: N.E4, dur: 0.36, vol: 0.032 },
  { freq: N.C4, dur: 0.55, bass: N.C3, vol: 0.036 },
  { freq: N.REST, dur: 0.32 },
]

// 3. LEVEL 2: SPORTS FIELD THEME (Upbeat Outdoor Activity in G Major)
const LEVEL2_PATTERN: SequencerNote[] = [
  { freq: N.D4, dur: 0.28, bass: N.G3, vol: 0.036 },
  { freq: N.G4, dur: 0.28, vol: 0.036 },
  { freq: N.B4, dur: 0.28, bass: N.G3, vol: 0.038 },
  { freq: N.A4, dur: 0.28, vol: 0.034 },
  { freq: N.G4, dur: 0.38, bass: N.E3, vol: 0.036 },
  { freq: N.E4, dur: 0.28, vol: 0.032 },
  { freq: N.G4, dur: 0.38, bass: N.C3, vol: 0.035 },
  { freq: N.A4, dur: 0.34, bass: N.D3, vol: 0.036 },

  { freq: N.B4, dur: 0.28, bass: N.G3, vol: 0.038 },
  { freq: N.D5, dur: 0.38, vol: 0.038 },
  { freq: N.C5, dur: 0.28, bass: N.C3, vol: 0.035 },
  { freq: N.B4, dur: 0.28, vol: 0.034 },
  { freq: N.A4, dur: 0.34, bass: N.D3, vol: 0.034 },
  { freq: N.B4, dur: 0.28, vol: 0.034 },
  { freq: N.G4, dur: 0.52, bass: N.G3, vol: 0.038 },
  { freq: N.REST, dur: 0.28 },
]

type MuteListener = (muted: boolean) => void

class GameAudioService {
  private ctx: AudioContext | null = null
  private isMuted: boolean = false
  private currentTrack: BgmTrack = null
  private bgmTimer: ReturnType<typeof setTimeout> | null = null
  private noteIndex: number = 0
  private listeners: Set<MuteListener> = new Set()
  private unlockListenerAttached: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedMute = localStorage.getItem('casecode_audio_muted')
        if (savedMute === 'true') {
          this.isMuted = true
        }
      } catch {
        // ignore storage errors
      }
      this.attachAutoUnlock()
    }
  }

  private attachAutoUnlock() {
    if (this.unlockListenerAttached || typeof window === 'undefined') return
    this.unlockListenerAttached = true

    const unlock = () => {
      if (!this.isMuted && this.currentTrack && (!this.ctx || this.ctx.state === 'suspended')) {
        const ctx = this.getContext()
        if (ctx && ctx.state === 'running' && !this.bgmTimer) {
          this.scheduleNextNote()
        }
      }
    }

    window.addEventListener('pointerdown', unlock, { passive: true })
    window.addEventListener('keydown', unlock, { passive: true })
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null
    if (typeof window === 'undefined') return null
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (AudioCtx) {
          this.ctx = new AudioCtx()
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {})
      }
      return this.ctx
    } catch {
      return null
    }
  }

  public subscribeMute(listener: MuteListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('casecode_audio_muted', muted ? 'true' : 'false')
      } catch {
        // ignore
      }
    }
    if (muted) {
      this.stopBgmTimer()
    } else if (this.currentTrack) {
      this.playClick()
      this.startBgmLoop()
    }
    this.listeners.forEach(fn => fn(this.isMuted))
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted)
    return this.isMuted
  }

  public getMuted(): boolean {
    return this.isMuted
  }

  // ──────────────────────────────────────────────────────
  // BACKGROUND MUSIC (BGM) SEQUENCER
  // ──────────────────────────────────────────────────────
  public playBGM(track: BgmTrack) {
    if (this.currentTrack === track && this.bgmTimer) return
    this.currentTrack = track
    this.noteIndex = 0
    this.stopBgmTimer()

    if (!track || this.isMuted) return
    this.startBgmLoop()
  }

  public stopBGM() {
    this.currentTrack = null
    this.stopBgmTimer()
  }

  private stopBgmTimer() {
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer)
      this.bgmTimer = null
    }
  }

  private getPatternForTrack(track: BgmTrack): SequencerNote[] {
    if (track === 'menu') return MENU_PATTERN
    if (track === 'level1') return LEVEL1_PATTERN
    if (track === 'level2') return LEVEL2_PATTERN
    return []
  }

  private startBgmLoop() {
    this.stopBgmTimer()
    if (!this.currentTrack || this.isMuted) return
    this.scheduleNextNote()
  }

  private scheduleNextNote() {
    if (!this.currentTrack || this.isMuted) return
    const pattern = this.getPatternForTrack(this.currentTrack)
    if (pattern.length === 0) return

    const step = pattern[this.noteIndex % pattern.length]
    this.noteIndex = (this.noteIndex + 1) % pattern.length

    const ctx = this.getContext()
    if (ctx && ctx.state === 'running') {
      const now = ctx.currentTime

      // Play soft lead note
      if (step.freq > 0) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = step.type || 'triangle'
        osc.frequency.setValueAtTime(step.freq, now)

        const peakVol = step.vol ?? 0.032
        gain.gain.setValueAtTime(0.001, now)
        gain.gain.linearRampToValueAtTime(peakVol, now + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.0008, now + step.dur * 0.92)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + step.dur)
      }

      // Play warm bass accompaniment
      if (step.bass && step.bass > 0) {
        const bassOsc = ctx.createOscillator()
        const bassGain = ctx.createGain()
        bassOsc.type = 'sine'
        bassOsc.frequency.setValueAtTime(step.bass, now)

        bassGain.gain.setValueAtTime(0.001, now)
        bassGain.gain.linearRampToValueAtTime(0.025, now + 0.04)
        bassGain.gain.exponentialRampToValueAtTime(0.0008, now + step.dur * 1.4)

        bassOsc.connect(bassGain)
        bassGain.connect(ctx.destination)
        bassOsc.start(now)
        bassOsc.stop(now + step.dur * 1.45)
      }
    }

    this.bgmTimer = setTimeout(() => {
      this.scheduleNextNote()
    }, Math.max(120, Math.round(step.dur * 1000)))
  }

  // ──────────────────────────────────────────────────────
  // SOUND EFFECTS (SFX)
  // ──────────────────────────────────────────────────────

  // 1. Data circle or student sample collected
  public playItemCollect() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5 arpeggio
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.04)
      gain.gain.setValueAtTime(0.08, now + idx * 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.12)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + idx * 0.04)
      osc.stop(now + idx * 0.04 + 0.14)
    })
  }

  // 2. Door enter / room transition swoosh
  public playDoorOpen() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(180, now)
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.18)
    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.22)
  }

  // 3. UI Button Tap
  public playClick() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05)
    gain.gain.setValueAtTime(0.06, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.07)
  }

  // 4. Milestone / Ruang Guru Unlock Jingle
  public playUnlockJingle() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const notes = [440, 554.37, 659.25, 880] // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.07)
      gain.gain.setValueAtTime(0.12, now + idx * 0.07)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + idx * 0.07)
      osc.stop(now + idx * 0.07 + 0.25)
    })
  }

  // 5. Correct answer chime
  public playSuccess() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const notes = [587.33, 739.99, 880, 1174.66] // D5, F#5, A5, D6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.06)
      gain.gain.setValueAtTime(0.1, now + idx * 0.06)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + idx * 0.06)
      osc.stop(now + idx * 0.06 + 0.32)
    })
  }

  // 6. Gentle Error Buzz
  public playError() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(140, now)
    osc.frequency.setValueAtTime(110, now + 0.09)
    gain.gain.setValueAtTime(0.09, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.22)
  }

  // 7. Interactive Outlier Simulation Morph Sound
  public playOutlierMorph(isExcluding: boolean) {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    if (isExcluding) {
      osc.frequency.setValueAtTime(600, now)
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.25)
    } else {
      osc.frequency.setValueAtTime(260, now)
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.25)
    }
    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.28)
  }

  // 8. Cute Cat Meow Sound Effect
  public playCatMeow() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(460, now)
    osc.frequency.exponentialRampToValueAtTime(820, now + 0.12)
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.35)
    gain.gain.setValueAtTime(0.01, now)
    gain.gain.linearRampToValueAtTime(0.12, now + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.4)
  }

  // 9. Happy Cat Purr Jingle
  public playCatPurr() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const notes = [587.33, 659.25, 880, 1046.5] // D5, E5, A5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.06)
      gain.gain.setValueAtTime(0.09, now + idx * 0.06)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.22)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + idx * 0.06)
      osc.stop(now + idx * 0.06 + 0.24)
    })
  }

  // 10. RPG Dialog Blip
  public playDialogBlip(pitch = 540) {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(pitch + (Math.random() * 40 - 20), now)
    gain.gain.setValueAtTime(0.035, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.04)
  }
}

export const gameAudio = new GameAudioService()
