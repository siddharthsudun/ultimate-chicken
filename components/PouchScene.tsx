'use client'

import { Suspense, useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float, MeshDistortMaterial, Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'

const flavorData = [
  {
    name: 'Korean BBQ',
    shortName: 'KOREAN\nBBQ',
    primary: '#CC0000',
    secondary: '#8B0000',
    stripe: '#FFD700',
    logo: '#FFD700',
    protein: '27g',
    proteinColor: '#FFD700',
    emissive: '#440000',
    badgeColor: '#FF0055',
  },
  {
    name: 'Spicy Peri Peri',
    shortName: 'SPICY\nPERI PERI',
    primary: '#CC2200',
    secondary: '#7A1000',
    stripe: '#FF8C00',
    logo: '#FFB347',
    protein: '27g',
    proteinColor: '#FFB347',
    emissive: '#330800',
    badgeColor: '#FF3D00',
  },
  {
    name: 'Lemon Herb',
    shortName: 'LEMON\nHERB',
    primary: '#007A75',
    secondary: '#004D4A',
    stripe: '#CBFF00',
    logo: '#CBFF00',
    protein: '27g',
    proteinColor: '#CBFF00',
    emissive: '#002220',
    badgeColor: '#00B5AD',
  },
]

// Creates a canvas texture for the pouch label
function createPouchTexture(flavorIndex: number): THREE.CanvasTexture {
  const flavor = flavorData[flavorIndex]
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 768
  const ctx = canvas.getContext('2d')!

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 512, 768)
  bgGrad.addColorStop(0, flavor.primary)
  bgGrad.addColorStop(0.5, flavor.secondary)
  bgGrad.addColorStop(1, flavor.primary)
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 512, 768)

  // Subtle diagonal lines (packaging texture)
  ctx.save()
  ctx.globalAlpha = 0.08
  for (let i = -768; i < 1024; i += 20) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + 768, 768)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    ctx.stroke()
  }
  ctx.restore()

  // Top header bar
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fillRect(0, 0, 512, 60)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = 'bold 13px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('ZERO PRESERVATIVES  ·  ZERO OIL  ·  ZERO ADDITIVES', 256, 36)

  // Logo area - "ULTIMATE" in brand font style
  ctx.fillStyle = flavor.logo
  ctx.font = 'bold 62px Arial'
  ctx.textAlign = 'left'
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = 8
  ctx.fillText('ULTIMATE', 28, 145)

  ctx.fillStyle = flavor.logo
  ctx.font = 'black 62px Arial'
  ctx.fillText('CHICKEN', 28, 210)
  ctx.shadowBlur = 0

  // Flavor diagonal stripe
  ctx.save()
  ctx.globalAlpha = 1
  const stripeGrad = ctx.createLinearGradient(0, 230, 512, 380)
  stripeGrad.addColorStop(0, 'rgba(0,0,0,0.4)')
  stripeGrad.addColorStop(0.5, 'rgba(0,0,0,0.25)')
  stripeGrad.addColorStop(1, 'rgba(0,0,0,0.4)')
  ctx.fillStyle = stripeGrad
  ctx.beginPath()
  ctx.moveTo(0, 235)
  ctx.lineTo(512, 255)
  ctx.lineTo(512, 370)
  ctx.lineTo(0, 350)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // Flavor name
  const flavorLines = flavor.shortName.split('\n')
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 58px Arial'
  ctx.textAlign = 'left'
  ctx.shadowColor = 'rgba(0,0,0,0.8)'
  ctx.shadowBlur = 10
  flavorLines.forEach((line, i) => {
    ctx.fillText(line, 28, 285 + i * 68)
  })
  ctx.shadowBlur = 0

  // Chicken illustration area (simplified silhouette)
  ctx.save()
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.ellipse(280, 500, 120, 80, 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Protein badge
  const badgeX = 28
  const badgeY = 610
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.beginPath()
  ctx.roundRect(badgeX, badgeY, 200, 100, 12)
  ctx.fill()

  ctx.fillStyle = flavor.proteinColor
  ctx.font = 'bold 52px Arial'
  ctx.textAlign = 'left'
  ctx.fillText('27g', badgeX + 12, badgeY + 62)

  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = 'bold 18px Arial'
  ctx.fillText('PROTEIN', badgeX + 12, badgeY + 85)

  // Calories
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = 'bold 18px Arial'
  ctx.fillText('150 CAL', badgeX + 120, badgeY + 85)

  // Bottom bar
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.fillRect(0, 720, 512, 48)
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = 'bold 13px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('READY TO EAT  ·  NO ARTIFICIAL STUFF', 256, 749)

  // FSSAI badge circle
  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.beginPath()
  ctx.arc(460, 650, 30, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = 'bold 9px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('FSSAI', 460, 648)
  ctx.fillText('CERT.', 460, 660)
  ctx.restore()

  return new THREE.CanvasTexture(canvas)
}

function SinglePouch({ flavorIndex, position, rotation, scale = 1 }: {
  flavorIndex: number
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useMemo(() => createPouchTexture(flavorIndex), [flavorIndex])
  const flavor = flavorData[flavorIndex]
  const timeOffset = flavorIndex * 2.1

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime + timeOffset
    meshRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.12
    meshRef.current.rotation.y = (rotation?.[1] ?? 0) + Math.sin(t * 0.3) * 0.15
    meshRef.current.rotation.z = (rotation?.[2] ?? 0) + Math.sin(t * 0.4) * 0.04
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation ?? [0.05, -0.2, 0.05]}
      scale={scale}
      castShadow
    >
      {/* Main pouch body */}
      <boxGeometry args={[1.1, 1.65, 0.18, 4, 4, 1]} />
      <meshPhysicalMaterial
        map={texture}
        metalness={0.15}
        roughness={0.25}
        clearcoat={0.6}
        clearcoatRoughness={0.1}
        envMapIntensity={0.8}
        emissive={new THREE.Color(flavor.emissive)}
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}

// The hero scene with all 3 pouches
function HeroScene() {
  const { viewport } = useThree()
  const scale = Math.min(viewport.width / 4, 1.2)

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-3, 2, -5]} intensity={0.4} color="#CBFF00" />
      <pointLight position={[0, -3, 3]} intensity={0.5} color="#ffffff" />

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <SinglePouch
          flavorIndex={0}
          position={[-1.4 * scale, 0.4, 0]}
          rotation={[0.05, 0.4, -0.08]}
          scale={scale * 0.88}
        />
      </Float>

      <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.4}>
        <SinglePouch
          flavorIndex={2}
          position={[0, 0, 0.3]}
          rotation={[0.0, -0.05, 0.04]}
          scale={scale}
        />
      </Float>

      <Float speed={1.8} rotationIntensity={0.35} floatIntensity={0.6}>
        <SinglePouch
          flavorIndex={1}
          position={[1.4 * scale, -0.3, -0.2]}
          rotation={[0.05, -0.45, 0.06]}
          scale={scale * 0.88}
        />
      </Float>

      <Environment preset="city" />
    </>
  )
}

// A single isolated flavor scene
function IsolatedFlavorScene({ flavorIndex }: { flavorIndex: number }) {
  const { viewport } = useThree()
  const scale = Math.min(viewport.width / 3, 1.6)

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 4]} intensity={2} castShadow />
      <pointLight position={[-4, 0, 4]} intensity={0.8} color={flavorData[flavorIndex].stripe} />
      <pointLight position={[4, -2, 2]} intensity={0.4} />

      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
        <group rotation={[0, 0, 0]}>
          <SinglePouch
            flavorIndex={flavorIndex}
            position={[0, 0, 0]}
            rotation={[0.05, -0.2, 0.04]}
            scale={scale}
          />
        </group>
      </Float>

      <Environment preset="city" />
    </>
  )
}

interface PouchSceneProps {
  flavorIndex: number // -1 for hero (all 3)
  isolated?: boolean
}

export default function PouchScene({ flavorIndex, isolated = false }: PouchSceneProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-32 h-48 bg-white/10 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        {flavorIndex === -1 ? (
          <HeroScene />
        ) : (
          <IsolatedFlavorScene flavorIndex={flavorIndex} />
        )}
      </Suspense>
    </Canvas>
  )
}
