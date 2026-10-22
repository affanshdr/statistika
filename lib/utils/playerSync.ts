import { useGameStore } from '@/lib/store/gameStore'

export interface SaveProgressPayload {
  levelId: number
  stars: number
  xpEarned: number
  durationSeconds?: number
  livesRemaining?: number
  mistakeCount?: number
  verdictAnswer?: string
  isCorrect?: boolean
  details?: Record<string, unknown>
}

export interface PlayerSession {
  id: string
  username: string
  displayName: string
  avatarId?: string
}

export function getActivePlayer(): PlayerSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('player')
    if (raw) return JSON.parse(raw) as PlayerSession
    const rawStudent = localStorage.getItem('student')
    if (rawStudent) {
      const parsed = JSON.parse(rawStudent)
      return {
        id: parsed.id || 'guest',
        username: parsed.username || parsed.name || 'guest',
        displayName: parsed.name || 'Pemain',
      }
    }
  } catch (e) {
    console.error('Failed to get active player:', e)
  }
  return null
}

/**
 * Menyimpan progres level, bintang, dan XP ke Local Storage & Cloud Database (Supabase)
 */
export async function savePlayerProgressToCloud(payload: SaveProgressPayload): Promise<boolean> {
  const player = getActivePlayer()

  // 1. Simpan segera di Zustand store & player_progress lokal
  try {
    const store = useGameStore.getState()
    if (payload.levelId !== undefined) {
      if (payload.stars !== undefined && payload.stars > 0) {
        store.setLevelStars(payload.levelId, payload.stars)
      }
      store.completeLevel(payload.levelId)
    }

    if (typeof window !== 'undefined') {
      const rawProg = localStorage.getItem('player_progress')
      const progObj = rawProg ? JSON.parse(rawProg) : {}
      
      const currentStars = { ...(progObj.levelStars || {}) }
      if (payload.levelId !== undefined && payload.stars !== undefined) {
        currentStars[String(payload.levelId)] = Math.max(currentStars[String(payload.levelId)] || 0, payload.stars)
      }
      progObj.levelStars = currentStars
      progObj.totalXp = (progObj.totalXp || 0) + (payload.xpEarned || 0)

      const curUnlocked = new Set<number>((progObj.unlockedLevels || [1]).map(Number))
      if (payload.levelId !== undefined) {
        curUnlocked.add(Number(payload.levelId))
        if (payload.isCorrect) curUnlocked.add(Number(payload.levelId) + 1)
      }
      progObj.unlockedLevels = Array.from(curUnlocked).sort((a, b) => a - b)

      localStorage.setItem('player_progress', JSON.stringify(progObj))
      // Pastikan key lama tidak tersisa
      localStorage.removeItem('stat_casecode_level_stars')
    }
  } catch (err) {
    console.warn('[PlayerSync] Error updating local state immediately:', err)
  }

  // 2. Sinkronkan ke Cloud Supabase jika pemain aktif terdaftar
  if (!player || !player.id) {
    console.warn('[PlayerSync] No active registered player found. Saved locally.')
    return true
  }

  try {
    const res = await fetch('/api/player/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: player.id,
        ...payload,
      }),
    })

    if (!res.ok) {
      console.error('[PlayerSync] Failed to save progress to cloud:', await res.text())
      enqueueOfflineProgress(player.id, payload)
      return false
    }

    const data = await res.json()
    if (data.progress && typeof window !== 'undefined') {
      localStorage.setItem('player_progress', JSON.stringify(data.progress))
    }

    return true
  } catch (err) {
    console.error('[PlayerSync] Network error while saving progress:', err)
    enqueueOfflineProgress(player.id, payload)
    return false
  }
}

/**
 * Menyimpan antrean payload yang gagal dikirim saat offline (terikat ke playerId)
 */
export function enqueueOfflineProgress(playerId: string, payload: SaveProgressPayload): void {
  if (typeof window === 'undefined' || !playerId) return
  try {
    const queueKey = `stat_casecode_offline_queue_${playerId}`
    const raw = localStorage.getItem(queueKey)
    const queue: SaveProgressPayload[] = raw ? JSON.parse(raw) : []
    const existingIdx = queue.findIndex((item) => item.levelId === payload.levelId)
    if (existingIdx >= 0) {
      queue[existingIdx] = {
        ...queue[existingIdx],
        ...payload,
        stars: Math.max(queue[existingIdx].stars || 0, payload.stars || 0),
        xpEarned: Math.max(queue[existingIdx].xpEarned || 0, payload.xpEarned || 0),
      }
    } else {
      queue.push(payload)
    }
    localStorage.setItem(queueKey, JSON.stringify(queue))
  } catch (e) {
    console.warn('[PlayerSync] Failed to enqueue offline progress:', e)
  }
}

/**
 * Mengirim antrean progres offline ke database begitu online
 */
export async function flushOfflineSyncQueue(targetPlayerId?: string): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const playerIds: string[] = []
  if (targetPlayerId) {
    playerIds.push(targetPlayerId)
  } else {
    const activeId = getActivePlayer()?.id
    if (activeId) playerIds.push(activeId)

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('stat_casecode_offline_queue_')) {
          const id = key.replace('stat_casecode_offline_queue_', '')
          if (id && !playerIds.includes(id)) {
            playerIds.push(id)
          }
        }
      }
    } catch (e) {
      console.warn('[PlayerSync] Error reading offline queue keys:', e)
    }
  }

  if (playerIds.length === 0) return true

  let allSuccess = true

  for (const playerId of playerIds) {
    try {
      const queueKey = `stat_casecode_offline_queue_${playerId}`
      const raw = localStorage.getItem(queueKey)
      if (!raw) continue
      const queue: SaveProgressPayload[] = JSON.parse(raw)
      if (!Array.isArray(queue) || queue.length === 0) {
        localStorage.removeItem(queueKey)
        continue
      }

      const remainingQueue: SaveProgressPayload[] = []

      for (const item of queue) {
        try {
          const res = await fetch('/api/player/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playerId,
              ...item,
            }),
          })
          if (!res.ok) {
            remainingQueue.push(item)
          }
        } catch {
          remainingQueue.push(item)
        }
      }

      if (remainingQueue.length > 0) {
        localStorage.setItem(queueKey, JSON.stringify(remainingQueue))
        allSuccess = false
      } else {
        localStorage.removeItem(queueKey)
      }
    } catch (e) {
      console.error(`[PlayerSync] Error flushing offline queue for player ${playerId}:`, e)
      allSuccess = false
    }
  }

  return allSuccess
}

/**
 * Mengambil progres terbaru pemain dari Cloud Database (Supabase)
 */
export async function syncPlayerProgressFromCloud(): Promise<unknown | null> {
  const player = getActivePlayer()
  if (!player || !player.id) return null

  // Flush data offline pemain ini
  await flushOfflineSyncQueue(player.id)

  try {
    const res = await fetch(`/api/player/progress?playerId=${encodeURIComponent(player.id)}`)
    if (!res.ok) return null

    const progress = await res.json()
    if (progress && typeof window !== 'undefined') {
      // Data murni dari cloud untuk akun ini, simpan ke player_progress
      localStorage.setItem('player_progress', JSON.stringify(progress))
      localStorage.removeItem('stat_casecode_level_stars')
      return progress
    }
  } catch (err) {
    console.warn('[PlayerSync] Network error fetching cloud progress:', err)
  }
  return null
}
