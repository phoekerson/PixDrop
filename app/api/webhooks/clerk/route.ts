import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// Forcer l'utilisation du runtime Node.js (nécessaire pour Prisma avec PostgreSQL)
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.warn('WEBHOOK_SECRET not configured. Webhook will not work. Users will be synced on first login instead.')
    return new Response('Webhook secret not configured', { status: 500 })
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, username, first_name, last_name, image_url } = evt.data

    console.log('[Webhook] Creating user:', id)

    try {
      const email = email_addresses[0]?.email_address || ''
      const userUsername = username || email_addresses[0]?.email_address?.split('@')[0] || `user_${(id as string).substring(0, 8)}`
      
      // Vérifier si l'utilisateur existe déjà
      const existing = await prisma.user.findUnique({
        where: { id: id as string },
      })

      if (existing) {
        console.log('[Webhook] User already exists, skipping creation')
        return new Response('User already exists', { status: 200 })
      }

      const user = await prisma.user.create({
        data: {
          id: id as string,
          email,
          username: userUsername,
          password: '', // Pas de mot de passe car on utilise Clerk
          nom: last_name || null,
          prenom: first_name || null,
          avatar: image_url || null,
        },
      })

      console.log('[Webhook] User created successfully:', user.id)
      return new Response('User created', { status: 200 })
    } catch (error: any) {
      console.error('[Webhook] Error creating user:', error)
      if (error.code === 'P2002') {
        console.log('[Webhook] Unique constraint violation, user might already exist')
        return new Response('User might already exist', { status: 200 })
      }
      return new Response('Error creating user: ' + (error.message || 'Unknown error'), { status: 500 })
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, username, first_name, last_name, image_url } = evt.data

    try {
      await prisma.user.update({
        where: { id: id as string },
        data: {
          email: email_addresses[0]?.email_address || '',
          username: username || undefined,
          nom: last_name || undefined,
          prenom: first_name || undefined,
          avatar: image_url || undefined,
        },
      })
    } catch (error) {
      console.error('Error updating user:', error)
      return new Response('Error updating user', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try {
      await prisma.user.delete({
        where: { id: id as string },
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      return new Response('Error deleting user', { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}

