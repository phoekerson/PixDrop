"use client";

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, ArrowLeft, Loader2, Send } from 'lucide-react'
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

interface Comment {
  id: string
  contenu: string
  createdAt: string
  auteur: {
    id: string
    username: string
    avatar: string | null
  }
  replies: Comment[]
}

interface Photo {
  id: string
  titre: string
  description: string | null
  supabaseBucketUrl: string
  createdAt: string
  vues: number
  auteur: {
    id: string
    username: string
    avatar: string | null
    bio: string | null
  }
  categories: {
    category: Category
  }[]
  types: {
    type: Type
  }[]
  comments: Comment[]
  _count: {
    likes: number
    comments: number
  }
}

export default function PhotoDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { userId, isLoaded } = useAuth()
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    if (id) {
      fetchPhoto()
      if (userId) {
        checkLike()
      }
    }
  }, [id, userId])

  const fetchPhoto = async () => {
    try {
      const res = await fetch(`/api/photos/${id}`)
      const data = await res.json()
      setPhoto(data.photo)
      setLikeCount(data.photo._count.likes)
    } catch (error) {
      console.error('Error fetching photo:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkLike = async () => {
    try {
      const res = await fetch(`/api/photos/${id}/like`)
      const data = await res.json()
      setLiked(data.liked)
    } catch (error) {
      console.error('Error checking like:', error)
    }
  }

  const handleLike = async () => {
    if (!userId) {
      router.push('/sign-in')
      return
    }

    try {
      const res = await fetch(`/api/photos/${id}/like`, {
        method: 'POST',
      })
      const data = await res.json()
      setLiked(data.liked)
      setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1))
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      router.push('/sign-in')
      return
    }

    if (!commentText.trim()) return

    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/photos/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contenu: commentText,
          parentId: replyingTo,
        }),
      })

      if (res.ok) {
        setCommentText('')
        setReplyingTo(null)
        fetchPhoto() // Rafraîchir les commentaires
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleReplySubmit = async (parentId: string) => {
    if (!userId) {
      router.push('/sign-in')
      return
    }

    if (!replyText.trim()) return

    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/photos/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contenu: replyText,
          parentId,
        }),
      })

      if (res.ok) {
        setReplyText('')
        setReplyingTo(null)
        fetchPhoto()
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf7ff] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  if (!photo) {
    return (
      <div className="min-h-screen bg-[#fcf7ff] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Photo non trouvée</h1>
          <Link
            href="/galerie"
            className="rounded-full bg-pink-500 px-6 py-3 text-white font-semibold hover:bg-pink-400 transition"
          >
            Retour à la galerie
          </Link>
        </div>
      </div>
    )
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

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <Link
          href="/galerie"
          className="inline-flex items-center gap-2 text-black/60 hover:text-black mb-8 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Retour à la galerie</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-black/10 bg-white overflow-hidden"
          >
            <div className="relative aspect-square bg-[#fcf7ff]">
              <Image
                src={photo.supabaseBucketUrl}
                alt={photo.titre}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </motion.div>

          {/* Informations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-4xl font-semibold tracking-tight mb-4">
                {photo.titre}
              </h1>
              {photo.description && (
                <p className="text-lg text-black/70 leading-relaxed">
                  {photo.description}
                </p>
              )}
            </div>

            {/* Auteur */}
            <div className="flex items-center gap-4 p-6 rounded-2xl border border-black/10 bg-white">
              {photo.auteur.avatar ? (
                <Image
                  src={photo.auteur.avatar}
                  alt={photo.auteur.username}
                  width={56}
                  height={56}
                  className="rounded-full"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-pink-500 flex items-center justify-center text-white text-xl font-semibold">
                  {photo.auteur.username[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-lg">{photo.auteur.username}</p>
                {photo.auteur.bio && (
                  <p className="text-sm text-black/60">{photo.auteur.bio}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 p-6 rounded-2xl border border-black/10 bg-white">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition ${
                  liked
                    ? 'bg-pink-500 text-black'
                    : 'bg-white border border-black/10 text-black/70 hover:border-pink-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                {likeCount}
              </button>
              <div className="flex items-center gap-2 text-black/70">
                <MessageCircle className="w-5 h-5" />
                {photo._count.comments} commentaires
              </div>
              <div className="text-sm text-black/50">
                {photo.vues} vues
              </div>
            </div>

            {/* Catégories et types */}
            {photo.categories.length > 0 && (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-black/60 mb-3">
                  Catégories
                </p>
                <div className="flex flex-wrap gap-2">
                  {photo.categories.map((pc) => (
                    <span
                      key={pc.category.id}
                      className="px-4 py-2 rounded-full bg-[#f6f1ff] text-sm font-semibold"
                    >
                      {pc.category.nom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {photo.types.length > 0 && (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-black/60 mb-3">
                  Types
                </p>
                <div className="flex flex-wrap gap-2">
                  {photo.types.map((pt) => (
                    <span
                      key={pt.type.id}
                      className="px-4 py-2 rounded-full bg-white border border-black/10 text-sm font-semibold"
                    >
                      {pt.type.nom}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Commentaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-black/10 bg-white p-8"
        >
          <h2 className="text-2xl font-semibold mb-6">
            Commentaires ({photo.comments.length})
          </h2>

          {/* Formulaire de commentaire */}
          {userId && (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 px-6 py-4 rounded-2xl border border-black/10 bg-white text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="px-6 py-4 rounded-2xl bg-pink-500 text-black font-semibold hover:bg-pink-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submittingComment ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Liste des commentaires */}
          <div className="space-y-6">
            {photo.comments.length === 0 ? (
              <p className="text-center text-black/60 py-8">
                Aucun commentaire pour le moment. Soyez le premier à commenter !
              </p>
            ) : (
              photo.comments.map((comment) => (
                <div key={comment.id} className="border-b border-black/10 pb-6 last:border-0">
                  <div className="flex gap-4">
                    {comment.auteur.avatar ? (
                      <Image
                        src={comment.auteur.avatar}
                        alt={comment.auteur.username}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {comment.auteur.username[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{comment.auteur.username}</span>
                        <span className="text-sm text-black/40">
                          {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-black/80 mb-3">{comment.contenu}</p>
                      {userId && (
                        <button
                          onClick={() => {
                            setReplyingTo(replyingTo === comment.id ? null : comment.id)
                            setReplyText('')
                          }}
                          className="text-sm text-pink-500 font-semibold hover:text-pink-600"
                        >
                          {replyingTo === comment.id ? 'Annuler' : 'Répondre'}
                        </button>
                      )}
                      {replyingTo === comment.id && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleReplySubmit(comment.id)
                          }}
                          className="mt-3 flex gap-2"
                        >
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Écrire une réponse..."
                            className="flex-1 px-4 py-2 rounded-xl border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                          <button
                            type="submit"
                            disabled={submittingComment || !replyText.trim()}
                            className="px-4 py-2 rounded-xl bg-pink-500 text-black text-sm font-semibold hover:bg-pink-400 transition disabled:opacity-50"
                          >
                            Envoyer
                          </button>
                        </form>
                      )}
                      {comment.replies.length > 0 && (
                        <div className="mt-4 ml-6 space-y-4 border-l-2 border-black/10 pl-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              {reply.auteur.avatar ? (
                                <Image
                                  src={reply.auteur.avatar}
                                  alt={reply.auteur.username}
                                  width={32}
                                  height={32}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                  {reply.auteur.username[0].toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">
                                    {reply.auteur.username}
                                  </span>
                                  <span className="text-xs text-black/40">
                                    {new Date(reply.createdAt).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                                <p className="text-sm text-black/70">{reply.contenu}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

