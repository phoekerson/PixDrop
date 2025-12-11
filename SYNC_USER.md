# Synchronisation des utilisateurs Clerk avec la base de données

## Comment ça fonctionne

L'application utilise **deux méthodes** pour synchroniser les utilisateurs Clerk avec PostgreSQL :

### 1. Webhook Clerk (Recommandé pour la production)

Le webhook est configuré dans `app/api/webhooks/clerk/route.ts` et s'exécute automatiquement quand :
- Un utilisateur s'inscrit (`user.created`)
- Un utilisateur met à jour son profil (`user.updated`)
- Un utilisateur supprime son compte (`user.deleted`)

**Configuration :**
1. Allez dans votre dashboard Clerk
2. Créez un webhook pointant vers : `https://votre-domaine.com/api/webhooks/clerk`
3. Copiez le `WEBHOOK_SECRET` dans votre `.env.local`
4. Sélectionnez les événements : `user.created`, `user.updated`, `user.deleted`

**Note :** Le webhook ne fonctionne pas en développement local (localhost) car Clerk ne peut pas accéder à votre machine locale. Utilisez un service comme [ngrok](https://ngrok.com/) pour tester en local.

### 2. Synchronisation automatique (Fallback)

Si le webhook n'est pas configuré ou ne fonctionne pas, l'application synchronise automatiquement l'utilisateur :

1. **Lors du chargement de la page** : Le composant `<UserSync />` dans `app/layout.tsx` appelle automatiquement `/api/sync-user` quand un utilisateur est connecté.

2. **Lors des actions utilisateur** : Toutes les API routes qui nécessitent un utilisateur (upload de photo, commentaires, likes) synchronisent automatiquement l'utilisateur avant d'exécuter l'action.

**Fonction utilitaire :** `lib/sync-user.ts`
- Vérifie si l'utilisateur existe dans la base de données
- Si oui, met à jour ses informations
- Si non, crée un nouvel utilisateur

## Test de la synchronisation

1. **Inscrivez-vous** avec Clerk
2. **Vérifiez dans la base de données** :
   ```sql
   SELECT * FROM users WHERE email = 'votre-email@example.com';
   ```

Si l'utilisateur n'apparaît pas immédiatement :
- Attendez quelques secondes (le composant UserSync se charge)
- Ou naviguez vers une page qui nécessite l'utilisateur (Dashboard, etc.)
- Ou appelez manuellement : `POST /api/sync-user`

## Dépannage

### L'utilisateur n'est pas synchronisé

1. Vérifiez que `DATABASE_URL` est correct dans `.env.local`
2. Vérifiez les logs du serveur pour des erreurs
3. Vérifiez que Prisma est bien configuré : `npx prisma generate`
4. Testez manuellement : `POST /api/sync-user` avec un utilisateur connecté

### Le webhook ne fonctionne pas

- En développement local, c'est normal. Utilisez la synchronisation automatique.
- En production, vérifiez que :
  - L'URL du webhook est accessible publiquement
  - Le `WEBHOOK_SECRET` est correct
  - Les événements sont bien sélectionnés dans Clerk

## Avantages de chaque méthode

**Webhook :**
- ✅ Synchronisation immédiate à l'inscription
- ✅ Fonctionne même si l'utilisateur ne visite pas certaines pages
- ✅ Meilleur pour la production

**Synchronisation automatique :**
- ✅ Fonctionne en développement local
- ✅ Pas besoin de configuration supplémentaire
- ✅ Synchronisation à la demande (lazy)

Les deux méthodes peuvent coexister sans problème.





