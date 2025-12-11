import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

/**
 * Génère des métadonnées Open Graph/Twitter pour chaque photo individuelle.
 * Cela permet d'avoir un aperçu riche (image + description) lors du partage
 * d'un lien vers une photo (ex: WhatsApp, réseaux sociaux, etc.).
 */
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const id = params.id

  // Si l'id est manquant ou manifestement invalide, ne pas indexer
  if (!id) {
    return {
      title: 'Photo introuvable',
      description: 'Cette photo est introuvable.',
      robots: { index: false },
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
    }
  }

  const title = `${photo.titre} | PixDrop`
  const description =
    photo.description ||
    `Découvrez "${photo.titre}" partagé sur PixDrop.` +
    (photo.auteur?.username ? ` Par ${photo.auteur.username}.` : '')

  const imageUrl = photo.supabaseBucketUrl

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
      canonical: `/photo/${id}`,
    },
  }
}

