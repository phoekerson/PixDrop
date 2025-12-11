import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

// Forcer la génération dynamique pour que chaque partage récupère la dernière version
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const dynamicParams = true

/**
 * Génère des métadonnées Open Graph/Twitter pour chaque photo individuelle.
 * Cela permet d'avoir un aperçu riche (image + description) lors du partage
 * d'un lien vers une photo (ex: WhatsApp, réseaux sociaux, etc.).
 */
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const id = params.id
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pix-drop-six.vercel.app'

  // Si l'id est manquant ou manifestement invalide, ne pas indexer
  if (!id) {
    return {
      title: 'Photo introuvable',
      description: 'Cette photo est introuvable.',
      robots: { index: false },
      openGraph: {
        title: 'Photo introuvable',
        description: 'Cette photo est introuvable.',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Photo introuvable',
        description: 'Cette photo est introuvable.',
      },
    }
  }

  const photo = await prisma.photo.findUnique({
    where: { id },
    select: {
      titre: true,
      description: true,
      supabaseBucketUrl: true,
      auteur: {
        select: {
          username: true,
        },
      },
    },
  })

  if (!photo) {
    return {
      title: 'Photo introuvable',
      description: 'Cette photo est introuvable.',
      robots: { index: false },
      openGraph: {
        title: 'Photo introuvable',
        description: 'Cette photo est introuvable.',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Photo introuvable',
        description: 'Cette photo est introuvable.',
      },
    }
  }

  const title = `${photo.titre} | PixDrop`
  const description =
    photo.description ||
    `Découvrez "${photo.titre}" partagé sur PixDrop.` +
    (photo.auteur?.username ? ` Par ${photo.auteur.username}.` : '')

  // Assurer une URL absolue pour les plateformes sociales
  const imageUrl = photo.supabaseBucketUrl?.startsWith('http')
    ? photo.supabaseBucketUrl
    : `${siteUrl}${photo.supabaseBucketUrl || ''}`

  // Canonical absolu
  const canonical = `${siteUrl}/photo/${id}`

  const images = imageUrl
    ? [
        {
          url: imageUrl,
        },
      ]
    : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

