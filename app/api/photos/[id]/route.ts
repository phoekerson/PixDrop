import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forcer l'utilisation du runtime Node.js (nécessaire pour Prisma avec PostgreSQL)
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const photo = await prisma.photo.findUnique({
      where: { id },
      include: {
        auteur: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        types: {
          include: {
            type: true,
          },
        },
        comments: {
          include: {
            auteur: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            replies: {
              include: {
                auteur: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo non trouvée' },
        { status: 404 }
      )
    }

    // Incrémenter les vues
    await prisma.photo.update({
      where: { id },
      data: {
        vues: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({ photo })
  } catch (error) {
    console.error('Error fetching photo:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la photo' },
      { status: 500 }
    )
  }
}

