import type { Metadata } from 'next'
import Script from 'next/script'
import { Barlow_Condensed, DM_Sans } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/lib/cart'
import CartDrawer from '@/components/CartDrawer'

const META_PIXEL_ID = '2870241750010538'

const barlow = Barlow_Condensed({
  weight: ['600', '700', '800', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-barlow',
  display: 'swap',
})

const dmSans = DM_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-dm',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ultimatechicken.in'),
  title: 'Ultimate Chicken™ — Ready-To-Eat Sous Vide Chicken. 27g Protein.',
  description:
    "India's first ready-to-eat sous vide chicken. Lives in your fridge. Tear the pouch, eat it cold or microwave 60 seconds. 27g protein, zero preservatives.",
  keywords: [
    'ready to eat chicken',
    'sous vide chicken india',
    'high protein food',
    'protein snack india',
    'eat from wrapper chicken',
    'zero preservatives chicken',
    'BITS Pilani startup',
    'Korean Gochugaru chicken',
    'Peri Peri chicken protein',
  ],
  openGraph: {
    title: 'Ultimate Chicken™ — Chicken That Actually Does The Work For You.',
    description:
      'Ready-to-eat sous vide chicken. Straight from the fridge: tear, push up, bite. Or 60 seconds in the microwave. 27g protein. Zero preservatives.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ultimate Chicken™',
    description: 'Real Food. Real Protein. Ready to eat, straight from the pouch.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${barlow.variable} ${dmSans.variable}`}>
      <body suppressHydrationWarning>
        {/* Meta Pixel — loads on every page, fires PageView */}
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}</Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: 'none' }} alt=""
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} />
        </noscript>

        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
