'use client'

import { useState, useEffect } from 'react'
import { flushOfflineSyncQueue } from '@/lib/utils/playerSync'

export type NetworkStatus = 'online' | 'offline' | 'reconnected'

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>('online')

  useEffect(() => {
    // Set initial status
    setStatus(navigator.onLine ? 'online' : 'offline')

    const handleOffline = () => {
      setStatus('offline')
    }

    const handleOnline = () => {
      // Brief "reconnected" flash, then back to online
      setStatus('reconnected')
      // Auto-flush pending offline saves
      flushOfflineSyncQueue().catch(console.error)

      const t = setTimeout(() => setStatus('online'), 4000)
      return () => clearTimeout(t)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return status
}
