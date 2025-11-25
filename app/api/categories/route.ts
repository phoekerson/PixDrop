import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forcer l'utilisation du runtime Node.js (nécessaire pour Prisma avec PostgreSQL)
export const runtime = 'nodejs'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        nom: 'asc',
      },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    )
  }
}

