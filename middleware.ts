import { clerkMiddleware } from '@clerk/nextjs/server';

// Le middleware s'exécute dans le runtime Edge et ne peut pas utiliser Prisma
// La synchronisation se fait automatiquement via :
// 1. Le composant UserSync dans app/layout.tsx
// 2. Les routes API qui appellent syncUser() avant chaque action
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};