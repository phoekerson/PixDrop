"use client";

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Loader2, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Category {
  id: string
  nom: string
  slug: string
}

interface Type {
  id: string
  nom: string
  slug: string
}

interface Photo {
  id: string
  titre: string
  description: string | null
  supabaseBucketUrl: string
  createdAt: string
  auteur: {
    id: string
    username: string
    avatar: string | null
  }
  categories: {
    category: Category
  }[]
  types: {
    type: Type
  }[]
  _count: {
    likes: number
    comments: number
  }
}

export default function GaleriePage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [types, setTypes] = useState<Type[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchCategories()
    fetchTypes()
  }, [])

  useEffect(() => {
    fetchPhotos()
  }, [selectedCategory, selectedType, page])

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

  const fetchPhotos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('categoryId', selectedCategory)
      if (selectedType) params.append('typeId', selectedType)
      params.append('page', page.toString())
      params.append('limit', '12')

      const res = await fetch(`/api/photos?${params.toString()}`)
      const data = await res.json()

      if (page === 1) {
        setPhotos(data.photos || [])
      } else {
        setPhotos((prev) => [...prev, ...(data.photos || [])])
      }

      setHasMore(data.pagination.page < data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId)
    setPage(1)
  }

  const handleTypeChange = (typeId: string | null) => {
    setSelectedType(typeId)
    setPage(1)
  }

  const filteredPhotos = photos.filter((photo) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      photo.titre.toLowerCase().includes(query) ||
      photo.description?.toLowerCase().includes(query) ||
      photo.auteur.username.toLowerCase().includes(query)
    )
  })

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
            <Link href="/" className="transition hover:text-pink-200">
              Accueil
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-semibold tracking-tight mb-4">
            Galerie
          </h1>
          <p className="text-lg text-black/70">
            Découvrez les créations de notre communauté
          </p>
        </motion.div>

        {/* Barre de recherche et filtres */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, description ou auteur..."
              className="w-full pl-12 pr-6 py-4 rounded-2xl border border-black/10 bg-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/10">
              <Filter className="w-4 h-4 text-black/40" />
              <span className="text-sm font-semibold text-black/60">Filtres:</span>
            </div>
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === null
                  ? 'bg-pink-500 text-black'
                  : 'bg-white border border-black/10 text-black/70 hover:border-pink-500'
              }`}
            >
              Toutes les catégories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === category.id
                    ? 'bg-pink-500 text-black'
                    : 'bg-white border border-black/10 text-black/70 hover:border-pink-500'
                }`}
              >
                {category.nom}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleTypeChange(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedType === null
                  ? 'bg-pink-500 text-black'
                  : 'bg-white border border-black/10 text-black/70 hover:border-pink-500'
              }`}
            >
              Tous les types
            </button>
            {types.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeChange(type.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedType === type.id
                    ? 'bg-pink-500 text-black'
                    : 'bg-white border border-black/10 text-black/70 hover:border-pink-500'
                }`}
              >
                {type.nom}
              </button>
            ))}
          </div>
        </div>

        {/* Grille de photos */}
        {loading && photos.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-black/10 bg-white">
            <ImageIcon className="w-16 h-16 text-black/20 mb-4" />
            <p className="text-lg font-semibold text-black/60">
              Aucune photo trouvée
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/photo/${photo.id}`}>
                    <div className="group rounded-3xl border border-black/10 bg-white overflow-hidden hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all cursor-pointer">
                      <div className="relative aspect-square bg-[#fcf7ff] overflow-hidden">
                        <Image
                          src={photo.supabaseBucketUrl}
                          alt={photo.titre}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                          {photo.titre}
                        </h3>
                        {photo.description && (
                          <p className="text-sm text-black/60 mb-4 line-clamp-2">
                            {photo.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {photo.auteur.avatar ? (
                              <Image
                                src={photo.auteur.avatar}
                                alt={photo.auteur.username}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                                {photo.auteur.username[0].toUpperCase()}
                              </div>
                            )}
                            <span className="font-semibold text-black/70">
                              {photo.auteur.username}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-black/40">
                            <span>{photo._count.likes} ♥</span>
                            <span>{photo._count.comments} 💬</span>
                          </div>
                        </div>
                        {(photo.categories.length > 0 || photo.types.length > 0) && (
                          <div className="mt-4 space-y-2">
                            {photo.categories.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {photo.categories.map((pc) => (
                                  <button
                                    key={pc.category.id}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleCategoryChange(pc.category.id)
                                    }}
                                    className="px-3 py-1 rounded-full bg-[#f6f1ff] hover:bg-pink-500 hover:text-black text-xs font-semibold text-black/70 transition-colors cursor-pointer"
                                  >
                                    {pc.category.nom}
                                  </button>
                                ))}
                              </div>
                            )}
                            {photo.types.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {photo.types.map((pt) => (
                                  <button
                                    key={pt.type.id}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleTypeChange(pt.type.id)
                                    }}
                                    className="px-3 py-1 rounded-full bg-white border border-black/10 hover:bg-pink-500 hover:text-black hover:border-pink-500 text-xs font-semibold text-black/70 transition-colors cursor-pointer"
                                  >
                                    {pt.type.nom}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {hasMore && !loading && (
              <div className="flex justify-center">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-full bg-pink-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-pink-400"
                >
                  Charger plus
                </button>
              </div>
            )}

            {loading && photos.length > 0 && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

