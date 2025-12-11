"use client";

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Loader2, Check, X } from 'lucide-react'

export default function TestSyncPage() {
  const { userId, isLoaded } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSync = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await res.json()

      if (res.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Erreur inconnue')
      }
    } catch (err: any) {
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
    return (
      <div className="min-h-screen bg-[#fcf7ff] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Non connecté</h1>
          <p className="text-black/60">Veuillez vous connecter pour tester la synchronisation</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcf7ff] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-semibold mb-8">Test de synchronisation</h1>

        <div className="bg-white rounded-3xl border border-black/10 p-8 mb-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-black/60 mb-2">
              User ID Clerk
            </p>
            <p className="text-lg font-mono bg-[#fcf7ff] p-3 rounded-xl">{userId}</p>
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
              'Synchroniser l\'utilisateur'
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
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Check className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Synchronisation réussie</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700 mb-1">
                  ID
                </p>
                <p className="font-mono text-green-800">{result.user?.id}</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700 mb-1">
                  Email
                </p>
                <p className="text-green-800">{result.user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700 mb-1">
                  Username
                </p>
                <p className="text-green-800">{result.user?.username}</p>
              </div>
              {result.user?.prenom && (
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700 mb-1">
                    Prénom
                  </p>
                  <p className="text-green-800">{result.user.prenom}</p>
                </div>
              )}
              {result.user?.nom && (
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700 mb-1">
                    Nom
                  </p>
                  <p className="text-green-800">{result.user.nom}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 bg-white rounded-3xl border border-black/10 p-6">
          <h3 className="font-semibold mb-4">Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-black/70">
            <li>Cliquez sur le bouton "Synchroniser l'utilisateur"</li>
            <li>Vérifiez les logs dans la console du serveur (terminal)</li>
            <li>Vérifiez les logs dans la console du navigateur (F12)</li>
            <li>Vérifiez dans votre base de données : <code className="bg-[#fcf7ff] px-2 py-1 rounded">SELECT * FROM users WHERE id = '{userId}';</code></li>
          </ol>
        </div>
      </div>
    </div>
  )
}





