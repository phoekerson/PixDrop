"use client";

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Upload, X, Loader2, Check } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  nom: string
  slug: string
  couleur?: string
}

interface Type {
  id: string
  nom: string
  slug: string
}

export default function DashboardPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [types, setTypes] = useState<Type[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/')
    }
  }, [isLoaded, userId, router])

  useEffect(() => {
    fetchCategories()
    fetchTypes()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchTypes = async () => {
    try {
      const res = await fetch('/api/types')
      const data = await res.json()
      setTypes(data.types || [])
    } catch (error) {
      console.error('Error fetching types:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Valider le type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Format non supporté. Utilisez JPEG, PNG ou WebP.')
      return
    }

    // Valider la taille (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Fichier trop volumineux. Taille maximale: 10MB.')
      return
    }

    setSelectedFile(file)
    setError(null)

    // Créer une preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !titre.trim()) {
      setError('Veuillez sélectionner un fichier et entrer un titre.')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('titre', titre)
      formData.append('description', description)
      formData.append('categoryIds', JSON.stringify(selectedCategories))
      formData.append('typeIds', JSON.stringify(selectedTypes))

      const res = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de l\'upload')
      }

      setUploadSuccess(true)
      // Reset form
      setSelectedFile(null)
      setPreview(null)
      setTitre('')
      setDescription('')
      setSelectedCategories([])
      setSelectedTypes([])

      setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'upload')
    } finally {
      setIsUploading(false)
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
    <div className="min-h-screen bg-[#fcf7ff] text-[#0b0b0b]">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-black text-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-full bg-white px-4 py-2 text-xl font-bold text-black">
              PIXDROP
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-pink-200">
              BETA
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-semibold">
            <Link href="/galerie" className="transition hover:text-pink-200">
              Galerie
            </Link>
            <Link href="/" className="transition hover:text-pink-200">
              Accueil
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:p-12"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-semibold tracking-tight">
              Uploader une photo
            </h1>
            <p className="mt-2 text-lg text-black/70">
              Partagez votre création avec la communauté PixDrop
            </p>
          </div>

          {uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 rounded-2xl bg-green-50 border border-green-200 p-4 flex items-center gap-3"
            >
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-semibold">
                Photo uploadée avec succès !
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4"
            >
              <p className="text-red-800 font-semibold">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Upload de fichier */}
            <div>
              <label className="block text-sm font-semibold uppercase tracking-[0.25em] text-black/60 mb-3">
                Photo
              </label>
              {!preview ? (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-black/20 rounded-3xl cursor-pointer hover:border-pink-500 transition-colors bg-[#fcf7ff]">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 mb-4 text-black/40" />
                    <p className="mb-2 text-sm font-semibold text-black/70">
                      Cliquez pour uploader
                    </p>
                    <p className="text-xs text-black/50">
                      JPEG, PNG ou WebP (max. 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileSelect}
                  />
                </label>
              ) : (
                <div className="relative rounded-3xl overflow-hidden border border-black/10">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-contain bg-[#fcf7ff]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null)
                      setPreview(null)
                    }}
                    className="absolute top-4 right-4 p-2 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-semibold uppercase tracking-[0.25em] text-black/60 mb-3">
                Titre *
              </label>
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex: Lever de soleil sur la plage"
                className="w-full px-6 py-4 rounded-2xl border border-black/10 bg-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold uppercase tracking-[0.25em] text-black/60 mb-3">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre photo, le contexte, l'inspiration..."
                rows={5}
                className="w-full px-6 py-4 rounded-2xl border border-black/10 bg-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Catégories */}
            <div>
              <label className="block text-sm font-semibold uppercase tracking-[0.25em] text-black/60 mb-3">
                Catégories
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`px-4 py-3 rounded-2xl border text-sm font-semibold transition-all ${
                      selectedCategories.includes(category.id)
                        ? 'bg-pink-500 text-black border-pink-500'
                        : 'bg-white border-black/10 text-black/70 hover:border-pink-500'
                    }`}
                  >
                    {category.nom}
                  </button>
                ))}
              </div>
            </div>

            {/* Types */}
            <div>
              <label className="block text-sm font-semibold uppercase tracking-[0.25em] text-black/60 mb-3">
                Types de photo
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {types.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleTypeToggle(type.id)}
                    className={`px-4 py-3 rounded-2xl border text-sm font-semibold transition-all ${
                      selectedTypes.includes(type.id)
                        ? 'bg-pink-500 text-black border-pink-500'
                        : 'bg-white border-black/10 text-black/70 hover:border-pink-500'
                    }`}
                  >
                    {type.nom}
                  </button>
                ))}
              </div>
            </div>

            {/* Bouton submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isUploading || !selectedFile || !titre.trim()}
                className="flex-1 rounded-full bg-pink-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-pink-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  'Publier la photo'
                )}
              </button>
              <Link
                href="/galerie"
                className="rounded-full border border-black px-8 py-4 text-lg font-semibold transition hover:bg-black hover:text-white"
              >
                Annuler
              </Link>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  )
}

