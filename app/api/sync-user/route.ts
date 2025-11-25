import { syncUser } from '@/lib/sync-user'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Forcer l'utilisation du runtime Node.js (nécessaire pour Prisma avec PostgreSQL)
export const runtime = 'nodejs'

export async function POST() {
  try {
    console.log('[sync-user API] Starting sync...')
    
    const { userId } = await auth()
    
    if (!userId) {
      console.log('[sync-user API] No userId - user not authenticated')
      return NextResponse.json(
        { error: 'Utilisateur non authentifié', userId: null },
        { status: 401 }
      )
    }

    console.log('[sync-user API] User authenticated:', userId)
    
    const user = await syncUser()
    
    if (!user) {
      console.log('[sync-user API] syncUser returned null')
      // Vérifier si l'utilisateur existe déjà dans la DB
      const { prisma } = await import('@/lib/prisma')
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      })
      
      if (existingUser) {
        console.log('[sync-user API] User already exists in DB')
        return NextResponse.json({ user: existingUser, success: true, alreadyExists: true })
      }
      
      return NextResponse.json(
        { error: 'Erreur lors de la synchronisation de l\'utilisateur', userId },
        { status: 500 }
      )
    }

    console.log('[sync-user API] User synced successfully:', user.id)
    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        nom: user.nom,
        prenom: user.prenom,
        avatar: user.avatar,
      }, 
      success: true 
    })
  } catch (error) {
    console.error('[sync-user API] Error:', error)
    if (error instanceof Error) {
      console.error('[sync-user API] Error message:', error.message)
      console.error('[sync-user API] Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

