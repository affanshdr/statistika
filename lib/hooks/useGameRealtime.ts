'use client'

import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Represents a player's real-time presence state.
 * Positions (x, y) are used in the maze.
 * `sub` tracks which formula sub-screen they're on.
 * `step` tracks which game step they're on.
 */
export interface PlayerPresence {
  studentId: string
  name: string
  color: string    // assigned color per player index
  x?: number       // maze position
  y?: number       // maze position
  sub?: string     // 'intro' | 'rentang' | 'banyak-kelas' | 'panjang-kelas'
  step?: number    // game step (0, 1, 1.5, 2)
}

// Fixed colors for up to 3 players
const PLAYER_COLORS = ['#D97706', '#3B82F6', '#10B981']

type PresenceMap = Record<string, PlayerPresence>

/**
 * useGameRealtime
 *
 * Connects to a Supabase Broadcast channel `game:{teamId}`.
 * - Broadcasts player presence/position updates instantly (WebSocket, ~50ms)
 * - No database writes for ephemeral data (positions, current sub-screen)
 * - Returns `players` map of all OTHER players' presence state
 *
 * Usage:
 *   const { players, broadcastPos, broadcastSub, broadcastStep } =
 *     useGameRealtime(teamId, studentId, studentName)
 */
export function useGameRealtime(
  teamId: string | null | undefined,
  studentId: string | undefined,
  studentName: string | undefined,
  onPlayersChange?: (players: PresenceMap) => void,
) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const playersRef = useRef<PresenceMap>({})
  const myColorRef = useRef<string>(PLAYER_COLORS[0])
  const onChangeRef = useRef(onPlayersChange)
  onChangeRef.current = onPlayersChange

  useEffect(() => {
    if (!teamId || !studentId || !studentName) return

    const channelName = `game:${teamId}`
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } }, // don't echo own events back
    })

    channel
      .on('broadcast', { event: 'player_update' }, ({ payload }: { payload: PlayerPresence }) => {
        if (!payload?.studentId || payload.studentId === studentId) return

        playersRef.current = {
          ...playersRef.current,
          [payload.studentId]: payload,
        }
        onChangeRef.current?.({ ...playersRef.current })
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Announce presence immediately on join
          channel.send({
            type: 'broadcast',
            event: 'player_update',
            payload: {
              studentId,
              name: studentName,
              color: myColorRef.current,
            } satisfies PlayerPresence,
          })
        }
      })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
      playersRef.current = {}
    }
  }, [teamId, studentId, studentName])

  // Assign my color based on studentId deterministically
  useEffect(() => {
    if (!studentId) return
    // Simple hash to pick color index
    let hash = 0
    for (const c of studentId) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff
    myColorRef.current = PLAYER_COLORS[hash % PLAYER_COLORS.length]
  }, [studentId])

  /** Broadcast maze position (throttled externally) */
  const broadcastPos = useCallback((x: number, y: number) => {
    if (!channelRef.current || !studentId || !studentName) return
    channelRef.current.send({
      type: 'broadcast',
      event: 'player_update',
      payload: {
        studentId,
        name: studentName,
        color: myColorRef.current,
        x,
        y,
      } satisfies PlayerPresence,
    })
  }, [studentId, studentName])

  /** Broadcast which formula sub-screen the player is on */
  const broadcastSub = useCallback((sub: string) => {
    if (!channelRef.current || !studentId || !studentName) return
    channelRef.current.send({
      type: 'broadcast',
      event: 'player_update',
      payload: {
        studentId,
        name: studentName,
        color: myColorRef.current,
        sub,
      } satisfies PlayerPresence,
    })
  }, [studentId, studentName])

  /** Broadcast which game step the player is on */
  const broadcastStep = useCallback((step: number) => {
    if (!channelRef.current || !studentId || !studentName) return
    channelRef.current.send({
      type: 'broadcast',
      event: 'player_update',
      payload: {
        studentId,
        name: studentName,
        color: myColorRef.current,
        step,
      } satisfies PlayerPresence,
    })
  }, [studentId, studentName])

  return { broadcastPos, broadcastSub, broadcastStep }
}
