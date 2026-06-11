export type Flavour = {
  slug: string
  name: string
  shortName: string
  protein: number
  calories: number
  weight: string
  heat: 1 | 2 | 3
  tagline: string
  description: string
  flavourNotes: string[]
  ingredients: string[]
  allergens: string[]
  // visual system
  primary: string
  glow: string
  deep: string
  image: string
  imageAlt: string
}

export const FLAVOURS: Flavour[] = [
  {
    slug: 'korean-gochugaru',
    name: 'Korean Gochugaru',
    shortName: 'Gochugaru',
    protein: 27,
    calories: 180,
    weight: '120g cooked',
    heat: 3,
    tagline: 'Fermented chili. Smoky-sweet. The loud one.',
    description:
      'Gochugaru and fermented chili paste, slow-cooked into the breast. Bold, umami-forward heat that actually builds. Our heaviest hitter.',
    flavourNotes: ['Fermented chili', 'Smoky-sweet glaze', 'Umami heavy'],
    ingredients: ['Chicken breast', 'Gochugaru chili powder', 'Soy sauce', 'Sesame oil', 'Salt', 'Garlic powder', 'Stevia'],
    allergens: ['Sesame', 'Soy'],
    primary: '#E8253D',
    glow: '#FF5C4D',
    deep: '#26060C',
    image: '/products/korean-gochugaru.jpg',
    imageAlt: 'Korean Gochugaru sous vide chicken breast in vacuum pouch',
  },
  {
    slug: 'soy-chili-garlic',
    name: 'Soy Chili Garlic',
    shortName: 'Soy Chili Garlic',
    protein: 27,
    calories: 160,
    weight: '120g cooked',
    heat: 2,
    tagline: 'Dark soy. Toasted garlic. Slow burn.',
    description:
      'Deep soy glaze with toasted garlic and a controlled chili burn. Savoury, dark, dangerously easy to finish in one sitting.',
    flavourNotes: ['Dark soy glaze', 'Toasted garlic', 'Controlled burn'],
    ingredients: ['Chicken breast', 'Soy sauce', 'Honey', 'Sesame oil', 'Garlic powder', 'Chili flakes', 'Pepper'],
    allergens: ['Soy', 'Sesame'],
    primary: '#E8920C',
    glow: '#FFB347',
    deep: '#1D1104',
    image: '/products/soy-chili-garlic.jpg',
    imageAlt: 'Soy Chili Garlic sous vide chicken breast in vacuum pouch',
  },
  {
    slug: 'peri-peri',
    name: 'Peri-Peri',
    shortName: 'Peri-Peri',
    protein: 27,
    calories: 140,
    weight: '120g cooked',
    heat: 3,
    tagline: "African bird's eye chili. Bright. Relentless.",
    description:
      "Bird's eye chili, citrus and paprika. Bright, sharp heat with the leanest macros in the lineup. The gym-rat default.",
    flavourNotes: ["Bird's eye chili", 'Citrus + paprika', 'Leanest macros'],
    ingredients: ['Chicken breast', 'Peri-peri', 'Salt', 'Garlic powder', 'Pepper'],
    allergens: [],
    primary: '#FF4D00',
    glow: '#FF8A3D',
    deep: '#220D02',
    image: '/products/peri-peri.jpg',
    imageAlt: 'Peri-Peri sous vide chicken breast in vacuum pouch',
  },
]

export function getFlavour(slug: string): Flavour | undefined {
  return FLAVOURS.find((f) => f.slug === slug)
}
