# PixDrop - Application de Partage de Photos

Application de partage de photos avec authentification Clerk, catégories, types et système de commentaires.

## Fonctionnalités

- ✅ Authentification avec Clerk synchronisée avec PostgreSQL
- ✅ Upload de photos avec validation (JPEG, PNG, WebP, max 10MB)
- ✅ Catégories et types de photos
- ✅ Système de commentaires avec réponses
- ✅ Système de likes
- ✅ Galerie publique accessible sans connexion
- ✅ Dashboard pour uploader des photos
- ✅ Page de détail avec commentaires
- ✅ Design moderne inspiré de Gumroad

## Prérequis

- Node.js 18+
- PostgreSQL
- Compte Clerk (pour l'authentification)

## Installation

1. Cloner le projet et installer les dépendances :

```bash
npm install
```

2. Configurer les variables d'environnement :

Créez un fichier `.env.local` à la racine du projet :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pixdrop?schema=public"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Webhook Clerk (optionnel, pour la synchronisation automatique)
WEBHOOK_SECRET=whsec_...
```

3. Initialiser la base de données :

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# Seed les catégories et types
npm run db:seed
```

4. Configurer le webhook Clerk (optionnel mais recommandé) :

- Allez dans votre dashboard Clerk
- Créez un webhook pointant vers : `https://votre-domaine.com/api/webhooks/clerk`
- Copiez le `WEBHOOK_SECRET` dans votre `.env.local`
- Sélectionnez les événements : `user.created`, `user.updated`, `user.deleted`

5. Lancer le serveur de développement :

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Structure du projet

```
├── app/
│   ├── api/
│   │   ├── photos/          # API pour les photos
│   │   ├── categories/      # API pour les catégories
│   │   ├── types/           # API pour les types
│   │   └── webhooks/        # Webhook Clerk
│   ├── dashboard/           # Page Dashboard (upload)
│   ├── galerie/             # Page Galerie (liste des photos)
│   ├── photo/[id]/         # Page détail photo
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Landing page
├── lib/
│   ├── prisma.ts           # Client Prisma
│   └── utils.ts            # Utilitaires
├── prisma/
│   └── schema.prisma       # Schéma de base de données
└── scripts/
    └── seed.ts             # Script de seed
```

## Technologies utilisées

- **Next.js 16** - Framework React
- **TypeScript** - Typage statique
- **Prisma** - ORM pour PostgreSQL
- **Clerk** - Authentification
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icônes

## Notes importantes

- Les photos sont stockées localement dans `public/uploads/` par défaut
- Pour la production, configurez Supabase ou un autre service de stockage cloud
- Le webhook Clerk est nécessaire pour synchroniser automatiquement les utilisateurs avec la base de données
- Assurez-vous que le dossier `public/uploads/` existe et est accessible en écriture

## License

MIT
