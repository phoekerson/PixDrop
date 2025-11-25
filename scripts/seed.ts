import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Créer les catégories
  const categories = [
    { nom: 'Voyage & Aventure', slug: 'voyage-aventure', couleur: '#FF6B6B' },
    { nom: 'Mode & Portraits', slug: 'mode-portraits', couleur: '#4ECDC4' },
    { nom: 'Art Urbain', slug: 'art-urbain', couleur: '#45B7D1' },
    { nom: 'Nature & Macro', slug: 'nature-macro', couleur: '#96CEB4' },
    { nom: 'Architecture', slug: 'architecture', couleur: '#FFEAA7' },
    { nom: 'Lifestyle', slug: 'lifestyle', couleur: '#DDA0DD' },
    { nom: 'Street Photo', slug: 'street-photo', couleur: '#F39C12' },
    { nom: 'Paysage', slug: 'paysage', couleur: '#1ABC9C' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }

  console.log('✅ Categories created')

  // Créer les types
  const types = [
    { nom: 'RAW', slug: 'raw' },
    { nom: 'Film 35mm', slug: 'film-35mm' },
    { nom: 'Film 120', slug: 'film-120' },
    { nom: 'Drone', slug: 'drone' },
    { nom: 'Macro', slug: 'macro' },
    { nom: 'Portrait', slug: 'portrait' },
    { nom: 'Paysage', slug: 'paysage' },
    { nom: 'Street', slug: 'street' },
    { nom: 'Architecture', slug: 'architecture' },
    { nom: 'Documentaire', slug: 'documentaire' },
  ]

  for (const type of types) {
    await prisma.type.upsert({
      where: { slug: type.slug },
      update: {},
      create: type,
    })
  }

  console.log('✅ Types created')
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

