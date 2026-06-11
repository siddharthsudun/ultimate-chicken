import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import FlavourStory from '@/components/FlavourStory'
import { FLAVOURS, getFlavour } from '@/lib/flavours'

export function generateStaticParams() {
  return FLAVOURS.map((f) => ({ slug: f.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const flavour = getFlavour(slug)
  if (!flavour) return {}
  return {
    title: `${flavour.name} — ${flavour.protein}g Protein, ${flavour.calories} Cal | Ultimate Chicken™`,
    description: `${flavour.tagline} Ready-to-eat sous vide chicken. ${flavour.protein}g protein, ${flavour.calories} calories, zero preservatives. Eat it cold or 60 seconds in the microwave.`,
    openGraph: {
      title: `Ultimate Chicken ${flavour.name}`,
      description: `${flavour.protein}g protein · ${flavour.calories} cal · 0 preservatives. Ready to eat.`,
      images: [flavour.image],
    },
  }
}

export default async function FlavourPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const flavour = getFlavour(slug)
  if (!flavour) notFound()
  return <FlavourStory flavour={flavour} />
}
