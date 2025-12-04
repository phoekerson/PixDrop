import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import { UserSync } from '@/components/user-sync'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://pixdrop.vercel.app'),
  title: {
    default: 'PixDrop - Partage de photos et Galerie en ligne',
    template: '%s | PixDrop',
  },
  description: 'PixDrop est la meilleure plateforme pour partager vos photos, créer des galeries magnifiques et organiser vos souvenirs. Simple, rapide et élégant.',
  keywords: [
    'partage photos',
    'galerie photo',
    'pixdrop',
    'caleb mintoumba',
    'phoekerson',
    'portfolio',
    'stockage photos',
    'album en ligne',
    'photographie',
    'nextjs',
    'react',
    'Lomé Business School'
  ],
  authors: [{ name: 'Caleb Mintoumba', url: 'https://pixdrop.vercel.app' }],
  creator: 'Caleb Mintoumba',
  publisher: 'Caleb Mintoumba',
  openGraph: {
    title: 'PixDrop - Partage de photos et Galerie en ligne',
    description: 'Partagez vos photos avec description, catégories et types. Créez votre galerie en quelques minutes avec PixDrop.',
    url: 'https://pixdrop.vercel.app',
    siteName: 'PixDrop',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PixDrop - Partage de photos et Galerie en ligne',
    description: 'Partagez vos photos avec description, catégories et types. Créez votre galerie en quelques minutes.',
    creator: '@calebmintoumba', // Assuming this handle, can be updated if needed
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  
  // Si la clé n'est pas définie, afficher un avertissement mais permettre le build
  if (!publishableKey) {
    console.warn('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Clerk authentication will not work.')
  }
  
  return (
    <ClerkProvider publishableKey={publishableKey || ''}>
      <html lang="fr">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <UserSync />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}