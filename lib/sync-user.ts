import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

/**
 * Synchronise l'utilisateur Clerk avec la base de données
 * Crée l'utilisateur s'il n'existe pas, le met à jour sinon
 * @param userId - ID de l'utilisateur Clerk (optionnel, récupéré via auth() si non fourni)
 */
export async function syncUser(userId?: string) {
  try {
    // Si userId n'est pas fourni, le récupérer via auth()
    if (!userId) {
      const authResult = await auth()
      userId = authResult.userId || undefined
    }
    
    if (!userId) {
      console.log('[syncUser] No userId found')
      return null
    }

    console.log('[syncUser] Syncing user:', userId)

    // Utiliser currentUser() pour récupérer les informations de l'utilisateur
    // currentUser() fonctionne mieux dans les routes API que clerkClient()
    const clerkUser = await currentUser()

    if (!clerkUser) {
      console.log('[syncUser] Clerk user not found for userId:', userId)
      // Si currentUser() ne fonctionne pas, essayer de récupérer l'utilisateur depuis la DB
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      })
      if (existingUser) {
        console.log('[syncUser] User exists in DB, returning existing user')
        return existingUser
      }
      return null
    }

    // Vérifier que l'ID correspond
    if (clerkUser.id !== userId) {
      console.log('[syncUser] User ID mismatch, using provided userId')
      // Utiliser les données de clerkUser mais avec le userId fourni
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress || ''
    let username = clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] || `user_${userId.substring(0, 8)}`
    const firstName = clerkUser.firstName || null
    const lastName = clerkUser.lastName || null
    const imageUrl = clerkUser.imageUrl || null

    console.log('[syncUser] User data:', { email, username, firstName, lastName })

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (existingUser) {
      console.log('[syncUser] Updating existing user')
      // Mettre à jour l'utilisateur existant
      try {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: {
            email,
            username,
            nom: lastName || undefined,
            prenom: firstName || undefined,
            avatar: imageUrl || undefined,
          },
        })
        console.log('[syncUser] User updated successfully')
        return updated
      } catch (updateError: any) {
        console.error('[syncUser] Error updating user:', updateError)
        // Si erreur de contrainte unique, essayer de mettre à jour avec les valeurs existantes
        if (updateError.code === 'P2002') {
          console.log('[syncUser] Unique constraint violation, keeping existing values')
          return existingUser
        }
        throw updateError
      }
    } else {
      console.log('[syncUser] Creating new user')
      // Vérifier si l'email ou username existe déjà avec un autre ID
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      })
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      })

      if (existingEmail && existingEmail.id !== userId) {
        console.error('[syncUser] Email already exists for another user:', existingEmail.id)
        // Générer un username unique
        username = `${username}_${userId.substring(0, 8)}`
      }

      if (existingUsername && existingUsername.id !== userId) {
        console.error('[syncUser] Username already exists for another user:', existingUsername.id)
        // Générer un username unique
        username = `${username}_${userId.substring(0, 8)}`
      }

      // Créer un nouvel utilisateur
      try {
        const created = await prisma.user.create({
          data: {
            id: userId,
            email,
            username,
            password: '', // Pas de mot de passe car on utilise Clerk
            nom: lastName || null,
            prenom: firstName || null,
            avatar: imageUrl || null,
          },
        })
        console.log('[syncUser] User created successfully:', created.id)
        return created
      } catch (createError: any) {
        console.error('[syncUser] Error creating user:', createError)
        if (createError.code === 'P2002') {
          // Si contrainte unique violée, essayer de récupérer l'utilisateur existant
          console.log('[syncUser] Unique constraint violation, trying to fetch existing user')
          const existing = await prisma.user.findUnique({
            where: { id: userId },
          })
          if (existing) {
            console.log('[syncUser] Found existing user after constraint violation')
            return existing
          }
        }
        throw createError
      }
    }
  } catch (error) {
    console.error('[syncUser] Error syncing user:', error)
    if (error instanceof Error) {
      console.error('[syncUser] Error message:', error.message)
      console.error('[syncUser] Error stack:', error.stack)
    }
    return null
  }
}

