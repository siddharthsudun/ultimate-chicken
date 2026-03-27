import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ultimate Chicken™ — Real Food. Real Protein.',
  description: 'India\'s first sous vide, ready-to-eat high-protein chicken. 27g protein, 150 calories, zero preservatives. Launching first at BITS Pilani.',
  keywords: ['high protein food', 'ready to eat chicken', 'sous vide chicken', 'protein food india', 'healthy food BITS Pilani', 'Korean BBQ chicken', 'zero preservatives'],
  openGraph: {
    title: 'Ultimate Chicken™ — Real Food. Real Protein.',
    description: 'India\'s first sous vide RTE high-protein chicken. Launching at BITS Pilani.',
    type: 'website',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ultimate Chicken™',
    description: 'Real Food. Real Protein. Launching at BITS Pilani.',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
