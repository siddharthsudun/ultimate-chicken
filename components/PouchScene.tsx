'use client'

import { useEffect, useRef, useState } from 'react'

const flavors = [
  {
    name: 'Korean BBQ',
    lines: ['KOREAN', 'BBQ'],
    primary: '#CC0000',
    secondary: '#8B0000',
    accent: '#FFD700',
    glow: 'rgba(255,0,85,0.35)',
    rotate: -8,
  },
  {
    name: 'Spicy Peri Peri',
    lines: ['SPICY', 'PERI PERI'],
    primary: '#CC2200',
    secondary: '#7A1000',
    accent: '#FFB347',
    glow: 'rgba(255,61,0,0.35)',
    rotate: 3,
  },
  {
    name: 'Lemon Herb',
    lines: ['LEMON', 'HERB'],
    primary: '#007A75',
    secondary: '#004D4A',
    accent: '#CBFF00',
    glow: 'rgba(0,181,173,0.35)',
    rotate: -4,
  },
]

// Generate a pouch image via canvas and return a data URL
function buildPouchDataUrl(flavorIndex: number, width = 320, height = 480): string {
  const f = flavors[flavorIndex]
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, height)
  bg.addColorStop(0, f.primary)
  bg.addColorStop(0.55, f.secondary)
  bg.addColorStop(1, f.primary)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  // Diagonal lines texture
  ctx.save()
  ctx.globalAlpha = 0.06
  for (let i = -height; i < width + height; i += 14) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + height, height)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1
    ctx.stroke()
  }
  ctx.restore()

  // Header bar
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fillRect(0, 0, width, 36)
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = `bold ${Math.floor(width * 0.028)}px Arial`
  ctx.textAlign = 'center'
  ctx.fillText('ZERO PRESERVATIVES · NO ADDITIVES', width / 2, 22)

  // Brand name
  ctx.shadowColor = 'rgba(0,0,0,0.7)'
  ctx.shadowBlur = 8
  ctx.fillStyle = f.accent
  const brandSize = Math.floor(width * 0.13)
  ctx.font = `bold ${brandSize}px Arial`
  ctx.textAlign = 'left'
  ctx.fillText('ULTIMATE', 18, height * 0.2)
  ctx.fillText('CHICKEN', 18, height * 0.2 + brandSize * 1.05)
  ctx.shadowBlur = 0

  // Diagonal stripe
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.38)'
  ctx.beginPath()
  const stripeTop = height * 0.42
  ctx.moveTo(0, stripeTop)
  ctx.lineTo(width, stripeTop + height * 0.025)
  ctx.lineTo(width, stripeTop + height * 0.19)
  ctx.lineTo(0, stripeTop + height * 0.165)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // Flavor name
  ctx.shadowColor = 'rgba(0,0,0,0.9)'
  ctx.shadowBlur = 10
  ctx.fillStyle = '#FFFFFF'
  const fnSize = Math.floor(width * 0.135)
  ctx.font = `bold ${fnSize}px Arial`
  ctx.textAlign = 'left'
  f.lines.forEach((line, i) => {
    ctx.fillText(line, 18, height * 0.47 + i * fnSize * 1.1)
  })
  ctx.shadowBlur = 0

  // Protein badge
  const bx = 18, by = height * 0.78, bw = width * 0.54, bh = height * 0.16
  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.beginPath()
  const r = 10
  ctx.moveTo(bx + r, by)
  ctx.lineTo(bx + bw - r, by)
  ctx.arcTo(bx + bw, by, bx + bw, by + r, r)
  ctx.lineTo(bx + bw, by + bh - r)
  ctx.arcTo(bx + bw, by + bh, bx + bw - r, by + bh, r)
  ctx.lineTo(bx + r, by + bh)
  ctx.arcTo(bx, by + bh, bx, by + bh - r, r)
  ctx.lineTo(bx, by + r)
  ctx.arcTo(bx, by, bx + r, by, r)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = f.accent
  ctx.font = `bold ${Math.floor(bh * 0.62)}px Arial`
  ctx.textAlign = 'left'
  ctx.fillText('27g', bx + 10, by + bh * 0.66)
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = `bold ${Math.floor(bh * 0.28)}px Arial`
  ctx.fillText('PROTEIN · 150 CAL', bx + 10, by + bh * 0.9)

  // Bottom bar
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.fillRect(0, height - 28, width, 28)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = `bold ${Math.floor(width * 0.028)}px Arial`
  ctx.textAlign = 'center'
  ctx.fillText('READY TO EAT · NO ARTIFICIAL STUFF', width / 2, height - 9)

  return canvas.toDataURL('image/png')
}

// Individual CSS 3D Pouch
function CSSPouch({
  flavorIndex,
  size = 'md',
  animClass = 'pouch-float-1',
  extraRotate = 0,
}: {
  flavorIndex: number
  size?: 'sm' | 'md' | 'lg'
  animClass?: string
  extraRotate?: number
}) {
  const f = flavors[flavorIndex]
  const [imgUrl, setImgUrl] = useState<string>('')
  const dims = { sm: [160, 240], md: [220, 330], lg: [280, 420] }[size]!

  useEffect(() => {
    setImgUrl(buildPouchDataUrl(flavorIndex, dims[0] * 2, dims[1] * 2))
  }, [flavorIndex, dims[0], dims[1]])

  return (
    <div
      className={animClass}
      style={{
        width: dims[0],
        height: dims[1],
        flexShrink: 0,
        perspective: 800,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 24,
          overflow: 'hidden',
          transform: `rotateY(${f.rotate + extraRotate}deg) rotateX(6deg)`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${f.glow}`,
          background: `linear-gradient(160deg, ${f.primary} 0%, ${f.secondary} 100%)`,
          backgroundImage: imgUrl ? `url(${imgUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        {/* Plastic shine overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
          borderRadius: 24,
          pointerEvents: 'none',
        }} />
        {/* Edge highlight */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.2)',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  )
}

// Hero: all 3 pouches
function HeroPouches() {
  return (
    <div className="w-full h-full flex items-center justify-center gap-4 md:gap-6">
      <CSSPouch flavorIndex={0} size="sm" animClass="pouch-float-1" />
      <CSSPouch flavorIndex={2} size="md" animClass="pouch-float-2" />
      <CSSPouch flavorIndex={1} size="sm" animClass="pouch-float-3" />
    </div>
  )
}

// Single flavor pouch
function SingleFlavorPouch({ flavorIndex }: { flavorIndex: number }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <CSSPouch flavorIndex={flavorIndex} size="lg" animClass="pouch-float-1" />
    </div>
  )
}

export default function PouchScene({
  flavorIndex,
}: {
  flavorIndex: number
  isolated?: boolean
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center gap-4">
        {(flavorIndex === -1 ? [0, 1, 2] : [flavorIndex]).map((i) => (
          <div
            key={i}
            className="rounded-3xl animate-pulse"
            style={{
              width: flavorIndex === -1 ? 160 : 260,
              height: flavorIndex === -1 ? 240 : 390,
              background: `linear-gradient(160deg, ${flavors[i].primary}99, ${flavors[i].secondary}99)`,
            }}
          />
        ))}
      </div>
    )
  }

  return flavorIndex === -1 ? <HeroPouches /> : <SingleFlavorPouch flavorIndex={flavorIndex} />
}
