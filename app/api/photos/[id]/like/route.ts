import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncUser } from '@/lib/sync-user'

// Forcer l'utilisation du runtime Node.js (nécessaire pour Prisma avec PostgreSQL)
export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Synchroniser l'utilisateur avec la base de données
    const user = await syncUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Erreur lors de la synchronisation de l\'utilisateur' },
        { status: 500 }
      )
    }

    // Vérifier si le like existe déjà
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_photoId: {
          userId,
          photoId: id,
        },
      },
    })

    if (existingLike) {
      // Retirer le like
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      })

      return NextResponse.json({ liked: false })
    } else {
      // Ajouter le like
      await prisma.like.create({
        data: {
          userId,
          photoId: id,
        },
      })

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout/retrait du like' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ liked: false })
    }

    const like = await prisma.like.findUnique({
      where: {
        userId_photoId: {
          userId,
          photoId: id,
        },
      },
    })

    return NextResponse.json({ liked: !!like })
  } catch (error) {
    console.error('Error checking like:', error)
    return NextResponse.json({ liked: false })
  }
}

