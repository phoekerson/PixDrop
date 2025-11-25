import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncUser } from '@/lib/sync-user'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Forcer l'utilisation du runtime Node.js (nécessaire pour Prisma avec PostgreSQL)
export const runtime = 'nodejs'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')
    const typeId = searchParams.get('typeId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const where: any = {
      isPublic: true,
      isActive: true,
    }

    if (categoryId) {
      where.categories = {
        some: {
          categoryId,
        },
      }
    }

    if (typeId) {
      where.types = {
        some: {
          typeId,
        },
      }
    }

    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        where,
        include: {
          auteur: {
            select: {
              id: true,
              username: true,
              avatar: true,
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
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.photo.count({ where }),
    ])

    return NextResponse.json({
      photos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des photos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Synchroniser l'utilisateur avec la base de données (créer ou mettre à jour)
    const user = await syncUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Erreur lors de la synchronisation de l\'utilisateur' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const titre = formData.get('titre') as string
    const description = formData.get('description') as string
    const categoryIds = formData.get('categoryIds') as string
    const typeIds = formData.get('typeIds') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    if (!titre || titre.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le titre est requis' },
        { status: 400 }
      )
    }

    // Valider le type de fichier
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format de fichier non supporté. Utilisez JPEG, PNG ou WebP' },
        { status: 400 }
      )
    }

    // Valider la taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Taille maximale: 10MB' },
        { status: 400 }
      )
    }

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // URL publique de l'image
    const imageUrl = `/uploads/${fileName}`

    // Parser les catégories et types
    const parsedCategoryIds = categoryIds ? JSON.parse(categoryIds) : []
    const parsedTypeIds = typeIds ? JSON.parse(typeIds) : []

    // Créer la photo dans la base de données
    const photo = await prisma.photo.create({
      data: {
        titre: titre.trim(),
        description: description?.trim() || null,
        supabaseBucketUrl: imageUrl, // Pour l'instant on utilise l'URL locale
        imageKey: fileName,
        format: fileExtension?.toLowerCase(),
        size: file.size,
        auteurId: userId,
        categories: {
          create: parsedCategoryIds.map((catId: string) => ({
            categoryId: catId,
          })),
        },
        types: {
          create: parsedTypeIds.map((typeId: string) => ({
            typeId: typeId,
          })),
        },
      },
      include: {
        auteur: {
          select: {
            id: true,
            username: true,
            avatar: true,
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
      },
    })

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error) {
    console.error('Error uploading photo:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload de la photo' },
      { status: 500 }
    )
  }
}

