import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forcer l'utilisation du runtime Node.js (nécessaire pour Prisma avec PostgreSQL)
export const runtime = 'nodejs'

export async function GET() {
  try {
    const types = await prisma.type.findMany({
      orderBy: {
        nom: 'asc',
      },
    })

    return NextResponse.json({ types })
  } catch (error) {
    console.error('Error fetching types:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des types' },
      { status: 500 }
    )
  }
}

