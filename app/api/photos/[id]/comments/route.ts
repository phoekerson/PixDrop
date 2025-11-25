import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncUser } from '@/lib/sync-user'

// Forcer l'utilisation du runtime Node.js (nécessaire pour Prisma avec PostgreSQL)
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const comments = await prisma.comment.findMany({
      where: {
        photoId: id,
        parentId: null, // Seulement les commentaires de premier niveau
      },
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
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commentaires' },
      { status: 500 }
    )
  }
}

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
    const { contenu, parentId } = await request.json()

    if (!contenu || contenu.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le contenu du commentaire est requis' },
        { status: 400 }
      )
    }

    // Synchroniser l'utilisateur avec la base de données
    const user = await syncUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Erreur lors de la synchronisation de l\'utilisateur' },
        { status: 500 }
      )
    }

    // Vérifier que la photo existe
    const photo = await prisma.photo.findUnique({
      where: { id },
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo non trouvée' },
        { status: 404 }
      )
    }

    // Si c'est une réponse, vérifier que le commentaire parent existe
    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
      })

      if (!parent) {
        return NextResponse.json(
          { error: 'Commentaire parent non trouvé' },
          { status: 404 }
        )
      }
    }

    const comment = await prisma.comment.create({
      data: {
        contenu: contenu.trim(),
        auteurId: userId,
        photoId: id,
        parentId: parentId || null,
      },
      include: {
        auteur: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du commentaire' },
      { status: 500 }
    )
  }
}

