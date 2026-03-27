'use client'

import { Component, ReactNode, Suspense, useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Environment } from '@react-three/drei'
import * as THREE from 'three'

// ─── Manual rounded rect (ctx.roundRect not available in all browsers) ───────
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

const flavorData = [
  {
    name: 'Korean BBQ',
    shortName: ['KOREAN', 'BBQ'],
    primary: '#CC0000',
    secondary: '#8B0000',
    logo: '#FFD700',
    proteinColor: '#FFD700',
    emissive: '#330000',
    stripe: '#FFD700',
  },
  {
    name: 'Spicy Peri Peri',
    shortName: ['SPICY', 'PERI PERI'],
    primary: '#CC2200',
    secondary: '#7A1000',
    logo: '#FFB347',
    proteinColor: '#FFB347',
    emissive: '#220500',
    stripe: '#FF8C00',
  },
  {
    name: 'Lemon Herb',
    shortName: ['LEMON', 'HERB'],
    primary: '#007A75',
    secondary: '#004D4A',
    logo: '#CBFF00',
    proteinColor: '#CBFF00',
    emissive: '#001A18',
    stripe: '#CBFF00',
  },
]

function createPouchTexture(flavorIndex: number): THREE.CanvasTexture {
  const flavor = flavorData[flavorIndex]
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 768
  const ctx = canvas.getContext('2d')!

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, 768)
  bg.addColorStop(0, flavor.primary)
  bg.addColorStop(0.6, flavor.secondary)
  bg.addColorStop(1, flavor.primary)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 512, 768)

  // Subtle diagonal lines
  ctx.save()
  ctx.globalAlpha = 0.07
  for (let i = -768; i < 1100; i += 18) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + 768, 768)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1
    ctx.stroke()
  }
  ctx.restore()

  // Header bar
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fillRect(0, 0, 512, 56)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = 'bold 12px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('ZERO PRESERVATIVES  ·  ZERO OIL  ·  ZERO ADDITIVES', 256, 33)

  // Brand name
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = 8
  ctx.fillStyle = flavor.logo
  ctx.font = 'bold 60px Arial'
  ctx.textAlign = 'left'
  ctx.fillText('ULTIMATE', 28, 140)
  ctx.fillText('CHICKEN', 28, 205)
  ctx.shadowBlur = 0

  // Diagonal stripe behind flavor name
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.38)'
  ctx.beginPath()
  ctx.moveTo(0, 232)
  ctx.lineTo(512, 252)
  ctx.lineTo(512, 368)
  ctx.lineTo(0, 348)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // Flavor name
  ctx.shadowColor = 'rgba(0,0,0,0.9)'
  ctx.shadowBlur = 12
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 60px Arial'
  ctx.textAlign = 'left'
  flavor.shortName.forEach((line, i) => {
    ctx.fillText(line, 28, 286 + i * 68)
  })
  ctx.shadowBlur = 0

  // Protein badge (manual rounded rect)
  const bx = 28, by = 618, bw = 196, bh = 96
  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  drawRoundedRect(ctx, bx, by, bw, bh, 12)
  ctx.fill()

  ctx.fillStyle = flavor.proteinColor
  ctx.font = 'bold 54px Arial'
  ctx.textAlign = 'left'
  ctx.fillText('27g', bx + 14, by + 62)

  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = 'bold 17px Arial'
  ctx.fillText('PROTEIN', bx + 14, by + 83)

  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = 'bold 14px Arial'
  ctx.fillText('150 CAL', bx + 115, by + 83)

  // FSSAI badge
  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.beginPath()
  ctx.arc(460, 650, 28, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.font = 'bold 9px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('FSSAI', 460, 647)
  ctx.fillText('CERT.', 460, 659)
  ctx.restore()

  // Bottom bar
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.fillRect(0, 724, 512, 44)
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.font = 'bold 12px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('READY TO EAT  ·  NO ARTIFICIAL STUFF', 256, 750)

  return new THREE.CanvasTexture(canvas)
}

// ─── Single 3D Pouch ──────────────────────────────────────────────────────────
function SinglePouch({
  flavorIndex,
  position,
  rotation,
  scale = 1,
}: {
  flavorIndex: number
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useMemo(() => createPouchTexture(flavorIndex), [flavorIndex])
  const flavor = flavorData[flavorIndex]
  const offset = flavorIndex * 2.1

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime + offset
    meshRef.current.position.y = position[1] + Math.sin(t * 0.55) * 0.11
    meshRef.current.rotation.y = (rotation?.[1] ?? 0) + Math.sin(t * 0.28) * 0.14
    meshRef.current.rotation.z = (rotation?.[2] ?? 0) + Math.sin(t * 0.38) * 0.035
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation ?? [0.05, -0.2, 0.04]} scale={scale} castShadow>
      <boxGeometry args={[1.1, 1.65, 0.17]} />
      <meshPhysicalMaterial
        map={texture}
        metalness={0.12}
        roughness={0.28}
        clearcoat={0.55}
        clearcoatRoughness={0.12}
        emissive={new THREE.Color(flavor.emissive)}
        emissiveIntensity={0.25}
      />
    </mesh>
  )
}

// ─── Hero scene: all 3 pouches ────────────────────────────────────────────────
function HeroScene() {
  const { viewport } = useThree()
  const s = Math.min(viewport.width / 4.2, 1.15)
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1.6} />
      <directionalLight position={[-3, 2, -4]} intensity={0.35} color="#CBFF00" />
      <pointLight position={[0, -3, 3]} intensity={0.45} />
      <Float speed={1.4} rotationIntensity={0.28} floatIntensity={0.45}>
        <SinglePouch flavorIndex={0} position={[-1.35 * s, 0.4, 0]} rotation={[0.05, 0.42, -0.07]} scale={s * 0.87} />
      </Float>
      <Float speed={1.1} rotationIntensity={0.22} floatIntensity={0.38}>
        <SinglePouch flavorIndex={2} position={[0, 0, 0.3]} rotation={[0.0, -0.06, 0.04]} scale={s} />
      </Float>
      <Float speed={1.7} rotationIntensity={0.32} floatIntensity={0.55}>
        <SinglePouch flavorIndex={1} position={[1.35 * s, -0.3, -0.2]} rotation={[0.05, -0.46, 0.06]} scale={s * 0.87} />
      </Float>
    </>
  )
}

// ─── Single flavor scene ──────────────────────────────────────────────────────
function IsolatedScene({ flavorIndex }: { flavorIndex: number }) {
  const { viewport } = useThree()
  const s = Math.min(viewport.width / 3.2, 1.55)
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 4]} intensity={2} />
      <pointLight position={[-4, 0, 4]} intensity={0.7} color={flavorData[flavorIndex].stripe} />
      <Float speed={1.3} rotationIntensity={0.38} floatIntensity={0.55}>
        <SinglePouch flavorIndex={flavorIndex} position={[0, 0, 0]} rotation={[0.05, -0.2, 0.04]} scale={s} />
      </Float>
    </>
  )
}

// ─── Error boundary ───────────────────────────────────────────────────────────
class PouchErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

// ─── CSS fallback pouches (shown when WebGL unavailable) ──────────────────────
function CSSPouch({ flavorIndex, className = '' }: { flavorIndex: number; className?: string }) {
  const f = flavorData[flavorIndex]
  return (
    <div
      className={`relative rounded-3xl overflow-hidden shadow-2xl ${className}`}
      style={{
        background: `linear-gradient(160deg, ${f.primary} 0%, ${f.secondary} 100%)`,
        width: 160,
        height: 240,
        flexShrink: 0,
      }}
    >
      <div className="absolute inset-0 flex flex-col items-start justify-between p-4">
        <div>
          <div className="font-display font-black text-xs leading-tight" style={{ color: f.logo }}>
            ULTIMATE<br />CHICKEN
          </div>
        </div>
        <div>
          <div className="font-display font-black text-xl text-white leading-none">
            {f.shortName.join('\n')}
          </div>
        </div>
        <div className="bg-black/30 rounded-xl px-3 py-2 text-center">
          <div className="font-black text-xl" style={{ color: f.proteinColor }}>27g</div>
          <div className="text-white/70 text-xs font-bold">PROTEIN</div>
        </div>
      </div>
    </div>
  )
}

function HeroFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center gap-4 md:gap-6">
      {[0, 2, 1].map((i) => (
        <CSSPouch
          key={i}
          flavorIndex={i}
          className={`pouch-float-${i + 1} ${i === 2 ? 'hidden md:block' : ''}`}
        />
      ))}
    </div>
  )
}

function IsolatedFallback({ flavorIndex }: { flavorIndex: number }) {
  const f = flavorData[flavorIndex]
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="pouch-float-1 relative rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: `linear-gradient(160deg, ${f.primary} 0%, ${f.secondary} 100%)`, width: 220, height: 330 }}
      >
        <div className="absolute inset-0 flex flex-col items-start justify-between p-6">
          <div className="font-display font-black text-sm leading-tight" style={{ color: f.logo }}>ULTIMATE<br />CHICKEN</div>
          <div className="font-display font-black text-3xl text-white leading-none">{f.shortName.join('\n')}</div>
          <div className="bg-black/30 rounded-xl px-4 py-3">
            <div className="font-black text-3xl" style={{ color: f.proteinColor }}>27g</div>
            <div className="text-white/70 text-xs font-bold">PROTEIN</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function PouchScene({
  flavorIndex,
}: {
  flavorIndex: number
  isolated?: boolean
}) {
  const [mounted, setMounted] = useState(false)
  const [webglOk, setWebglOk] = useState(true)

  useEffect(() => {
    setMounted(true)
    // Quick WebGL check
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) setWebglOk(false)
    } catch {
      setWebglOk(false)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-32 h-48 bg-white/10 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!webglOk) {
    return flavorIndex === -1
      ? <HeroFallback />
      : <IsolatedFallback flavorIndex={flavorIndex} />
  }

  const fallback = flavorIndex === -1
    ? <HeroFallback />
    : <IsolatedFallback flavorIndex={flavorIndex} />

  return (
    <PouchErrorBoundary fallback={fallback}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{ antialias: true, alpha: true, failIfMajorPerformanceCaveat: false }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
      >
        <Suspense fallback={null}>
          {flavorIndex === -1 ? <HeroScene /> : <IsolatedScene flavorIndex={flavorIndex} />}
        </Suspense>
      </Canvas>
    </PouchErrorBoundary>
  )
}
