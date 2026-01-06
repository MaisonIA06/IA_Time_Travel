/**
 * Hook pour le polling de données
 */

import { useEffect, useRef, useCallback } from 'react'

interface UsePollingOptions {
  interval?: number
  enabled?: boolean
}

export function usePolling(
  callback: () => Promise<void> | void,
  options: UsePollingOptions = {}
) {
  const { interval = 3000, enabled = true } = options
  const savedCallback = useRef(callback)

  // Mettre à jour la callback sauvegardée
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Fonction de polling stable
  const poll = useCallback(async () => {
    await savedCallback.current()
  }, [])

  // Démarrer le polling
  useEffect(() => {
    if (!enabled) return

    // Premier appel immédiat
    poll()

    // Puis intervalles réguliers
    const id = setInterval(poll, interval)

    return () => clearInterval(id)
  }, [poll, interval, enabled])
}

