"use client";

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Loader2, Check, X, RefreshCw } from 'lucide-react'

export default function ForceSyncPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded) {
      if (!userId) {
        router.push('/')
        return
      }
      // Synchroniser automatiquement au chargement
      handleSync()
    }
  }, [isLoaded, userId])

  const handleSync = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('[ForceSync] Starting sync for userId:', userId)
      const res = await fetch('/api/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await res.json()
      console.log('[ForceSync] Response:', data)

      if (res.ok) {
        setResult(data)
        // Vérifier dans la DB après 1 seconde
        setTimeout(() => {
          alert('Synchronisation réussie ! Vérifiez maintenant dans votre base de données PostgreSQL avec : SELECT * FROM users WHERE id = \'' + userId + '\';')
        }, 1000)
      } else {
        setError(data.error || 'Erreur inconnue')
      }
    } catch (err: any) {
      console.error('[ForceSync] Error:', err)
      setError(err.message || 'Erreur lors de la synchronisation')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#fcf7ff] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  if (!userId) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#fcf7ff] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-semibold mb-8">Synchronisation forcée</h1>

        <div className="bg-white rounded-3xl border border-black/10 p-8 mb-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-black/60 mb-2">
              User ID Clerk
            </p>
            <p className="text-lg font-mono bg-[#fcf7ff] p-3 rounded-xl break-all">{userId}</p>
          </div>

          <button
            onClick={handleSync}
            disabled={loading}
            className="w-full rounded-full bg-pink-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-pink-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Synchronisation en cours...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Forcer la synchronisation
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <X className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-800">Erreur</h3>
            </div>
            <p className="text-red-700">{error}</p>
            <p className="text-sm text-red-600 mt-2">
              Vérifiez les logs dans le terminal du serveur pour plus de détails.
            </p>
          </div>
        )}

        {result && result.user && (
          <div className="bg-green-50 border border-green-200 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Check className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Synchronisation réussie !</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700 mb-1">
                  ID
                </p>
                <p className="font-mono text-green-800 break-all">{result.user.id}</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700 mb-1">
                  Email
                </p>
                <p className="text-green-800">{result.user.email}</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700 mb-1">
                  Username
                </p>
                <p className="text-green-800">{result.user.username}</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-green-100 rounded-xl">
              <p className="text-sm font-semibold text-green-800 mb-2">
                ✅ L'utilisateur a été créé dans PostgreSQL !
              </p>
              <p className="text-xs text-green-700">
                Vérifiez avec : <code className="bg-white px-2 py-1 rounded">SELECT * FROM users WHERE id = '{result.user.id}';</code>
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white rounded-3xl border border-black/10 p-6">
          <h3 className="font-semibold mb-4">Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-black/70">
            <li>La synchronisation se fait automatiquement au chargement de cette page</li>
            <li>Si elle échoue, cliquez sur "Forcer la synchronisation"</li>
            <li>Vérifiez les logs dans le terminal du serveur</li>
            <li>Vérifiez dans PostgreSQL : <code className="bg-[#fcf7ff] px-2 py-1 rounded text-xs">SELECT * FROM users;</code></li>
          </ol>
        </div>
      </div>
    </div>
  )
}

