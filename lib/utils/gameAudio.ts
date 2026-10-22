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
  private bgmAudio: HTMLAudioElement | null = null
  private sfxBuffers: Map<string, AudioBuffer> = new Map()
  private sfxLoading: Set<string> = new Set()
  private lastClickTime: number = 0
  private globalClickAttached: boolean = false

  private isUnlocked: boolean = false

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
      this.initBgmAudio()
      this.attachAutoUnlock()
      this.initGlobalClickListener()
      ;(window as unknown as { gameAudio: GameAudioService }).gameAudio = this
    }
  }

  public getBgmAudio(): HTMLAudioElement | null {
    return this.bgmAudio
  }

  public getCurrentTrack(): BgmTrack {
    return this.currentTrack
  }

  private async loadSfx(name: string, url: string) {
    if (typeof window === 'undefined' || this.sfxBuffers.has(name) || this.sfxLoading.has(name)) return
    this.sfxLoading.add(name)
    try {
      const resp = await fetch(url)
      const arrayBuffer = await resp.arrayBuffer()
      const ctx = this.getContext()
      if (ctx) {
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
        this.sfxBuffers.set(name, audioBuffer)
      }
    } catch {
      // ignore
    } finally {
      this.sfxLoading.delete(name)
    }
  }

  public preloadAllSfx() {
    if (typeof window === 'undefined') return
    this.loadSfx('click', '/audio/sfx_click.mp3')
    this.loadSfx('confirm', '/audio/sfx_confirm.mp3')
    this.loadSfx('cancel', '/audio/sfx_cancel.mp3')
    this.loadSfx('hover', '/audio/sfx_hover.mp3')
  }

  private playBuffer(name: string, volume = 0.5): boolean {
    if (this.isMuted) return false
    const buffer = this.sfxBuffers.get(name)
    const ctx = this.getContext()
    if (ctx && buffer) {
      try {
        const source = ctx.createBufferSource()
        source.buffer = buffer
        const gain = ctx.createGain()
        gain.gain.setValueAtTime(volume, ctx.currentTime)
        source.connect(gain)
        gain.connect(ctx.destination)
        source.start(0)
        return true
      } catch {
        return false
      }
    }
    return false
  }

  private initGlobalClickListener() {
    if (this.globalClickAttached || typeof window === 'undefined') return
    this.globalClickAttached = true

    document.addEventListener('pointerdown', (e) => {
      const target = e.target as HTMLElement | null
      if (!target) return

      // Preload SFX buffers on first pointerdown if not done yet
      if (this.sfxBuffers.size === 0) {
        this.preloadAllSfx()
      }

      // Check if clicked element or any ancestor is a button / interactive element
      const clickable = target.closest?.(
        'button, [role="button"], a, input[type="submit"], input[type="button"], .clickable, [data-clickable="true"], g[style*="cursor: pointer"]'
      )
      if (clickable) {
        if (clickable.getAttribute?.('data-no-sound') === 'true') return
        const soundType = clickable.getAttribute?.('data-sound')
        if (soundType === 'confirm') {
          this.playConfirm()
        } else if (soundType === 'cancel') {
          this.playCancel()
        } else {
          this.playClick()
        }
      }
    }, { capture: true, passive: true })
  }

  private initBgmAudio() {
    if (typeof window === 'undefined') return
    if (!this.bgmAudio) {
      try {
        this.bgmAudio = new Audio('/audio/game_bgm.mp3')
        this.bgmAudio.loop = true
        this.bgmAudio.volume = 0.45
        this.bgmAudio.preload = 'auto'
        this.bgmAudio.muted = this.isMuted
      } catch {
        // ignore audio constructor errors
      }
    }
  }

  private attachAutoUnlock() {
    if (this.unlockListenerAttached || typeof window === 'undefined') return
    this.unlockListenerAttached = true

    const unlock = () => {
      this.isUnlocked = true

      // 1. Resume real audio BGM if active
      if (!this.isMuted && (this.currentTrack === 'menu' || this.currentTrack === 'level1')) {
        this.initBgmAudio()
        if (this.bgmAudio && this.bgmAudio.paused) {
          this.bgmAudio.muted = false
          this.bgmAudio.play().catch(() => {})
        }
      }
      // 2. Resume Web Audio API context for synth & SFX
      if (!this.isMuted && (!this.ctx || this.ctx.state === 'suspended')) {
        const ctx = this.getContext()
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {})
        }
        if (ctx && ctx.state === 'running' && this.currentTrack && !this.bgmTimer) {
          this.scheduleNextNote()
        }
      }
    }

    // Attach in capture phase on multiple events so ANY click or touch on the screen unlocks immediately
    const opts = { capture: true, passive: true }
    window.addEventListener('pointerdown', unlock, opts)
    window.addEventListener('click', unlock, opts)
    window.addEventListener('touchstart', unlock, opts)
    window.addEventListener('keydown', unlock, opts)
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
      if (this.bgmAudio) {
        this.bgmAudio.pause()
      }
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
  // BACKGROUND MUSIC (BGM) SEQUENCER & HIGH-FIDELITY SOUNDTRACK
  // ──────────────────────────────────────────────────────
  public playBGM(track: BgmTrack) {
    if (this.currentTrack === track) {
      if ((track === 'menu' || track === 'level1') && this.bgmAudio && !this.bgmAudio.paused) return
      if (this.bgmTimer) return
    }
    this.currentTrack = track
    this.noteIndex = 0
    this.stopBgmTimer()

    if (!track || this.isMuted) {
      if (this.bgmAudio) {
        this.bgmAudio.pause()
      }
      return
    }
    this.startBgmLoop()
  }

  public stopBGM() {
    this.currentTrack = null
    this.stopBgmTimer()
    if (this.bgmAudio) {
      this.bgmAudio.pause()
      this.bgmAudio.currentTime = 0
    }
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

    // If track is menu or level1, play the master soundtrack!
    if (this.currentTrack === 'menu' || this.currentTrack === 'level1') {
      this.initBgmAudio()
      if (this.bgmAudio) {
        this.bgmAudio.play().catch(() => {
          // Autoplay blocked by browser until user gesture; unlock handler will resume it
        })
      }
      return
    }

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

  // 3. UI Button Tap (Gentle Warm Tactile Tap - No Laser Sweep)
  public playClick() {
    const now = Date.now()
    if (now - this.lastClickTime < 35) return // debounce redundant triggers
    this.lastClickTime = now

    if (this.playBuffer('click', 0.38)) return

    // Fallback synthesizer: Gentle warm wooden tap at 520Hz (C5)
    const ctx = this.getContext()
    if (!ctx) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(520, t)
    gain.gain.setValueAtTime(0.065, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.038)
  }

  // 3B. Confirmation / Action Submit (2-Tone Soft Chime)
  public playConfirm() {
    if (this.playBuffer('confirm', 0.45)) return
    this.playSuccess()
  }

  // 3C. Cancel / Back Button (Soft Descending Tap)
  public playCancel() {
    if (this.playBuffer('cancel', 0.35)) return
    this.playClick()
  }

  // 3D. Subtle Button Hover Tick
  public playHover() {
    this.playBuffer('hover', 0.18)
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
    try {
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
    } catch (e) {
      console.warn('Audio playCatMeow error:', e)
    }
  }

  // 9. Happy Cat Purr Jingle
  public playCatPurr() {
    try {
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
    } catch (e) {
      console.warn('Audio playCatPurr error:', e)
    }
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
