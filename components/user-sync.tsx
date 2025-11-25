"use client";

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'

/**
 * Composant qui synchronise automatiquement l'utilisateur Clerk avec la base de données
 * Appelé une fois lors du chargement de la page si l'utilisateur est connecté
 */
export function UserSync() {
  const { userId, isLoaded } = useAuth()
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    if (isLoaded && userId && !synced) {
      console.log('[UserSync] Syncing user:', userId)
      
      // Synchroniser l'utilisateur avec la base de données
      fetch('/api/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(async (res) => {
          try {
            const data = await res.json()
            if (res.ok && data.success) {
              console.log('[UserSync] User synced successfully:', data)
              setSynced(true)
            } else {
              // Si l'utilisateur existe déjà, ce n'est pas vraiment une erreur
              if (data.error && data.error.includes('déjà')) {
                console.log('[UserSync] User already exists, marking as synced')
                setSynced(true)
              } else {
                console.warn('[UserSync] Sync response:', { status: res.status, data })
                // Ne pas bloquer si l'utilisateur existe déjà dans la DB
                // La synchronisation peut avoir réussi même si la réponse n'est pas parfaite
                setSynced(true)
              }
            }
          } catch (jsonError) {
            // Si la réponse n'est pas du JSON valide
            const text = await res.text()
            console.warn('[UserSync] Non-JSON response:', { status: res.status, text })
            // Si le statut est 200, considérer comme succès
            if (res.ok) {
              setSynced(true)
            }
          }
        })
        .catch((error) => {
          console.error('[UserSync] Error syncing user:', error)
          // Ne pas bloquer l'application si la synchronisation échoue
          // L'utilisateur sera synchronisé lors de la prochaine action
        })
    }
  }, [isLoaded, userId, synced])

  return null // Ce composant ne rend rien
}

