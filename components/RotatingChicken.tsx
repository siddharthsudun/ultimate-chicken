'use client'

import { useRef } from 'react'

/* A photoreal 360° turntable clip shown as a rotating 3D-style product.
   Auto-rotates on loop; drag horizontally to spin it yourself (scrubs the clip). */
export default function RotatingChicken({
  src,
  name,
  glow,
  protein,
  calories,
}: {
  src: string
  name: string
  glow: string
  protein: number
  calories: number
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const dragging = useRef(false)
  const lastX = useRef(0)

  const onDown = (e: React.PointerEvent) => {
    const v = videoRef.current
    if (!v) return
    dragging.current = true
    lastX.current = e.clientX
    v.pause()
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    const v = videoRef.current
    if (!dragging.current || !v || !v.duration) return
    const dx = e.clientX - lastX.current
    lastX.current = e.clientX
    // ~360px of drag ≈ one full spin
    let t = v.currentTime + (dx / 360) * v.duration
    t = ((t % v.duration) + v.duration) % v.duration
    v.currentTime = t
  }
  const onUp = () => {
    if (!dragging.current) return
    dragging.current = false
    videoRef.current?.play().catch(() => {})
  }

  return (
    <div className="group">
      <div
        className="relative aspect-square cursor-grab touch-none select-none overflow-hidden rounded-[2rem] active:cursor-grabbing"
        style={{ background: `radial-gradient(60% 60% at 50% 45%, ${glow}22, transparent 70%)` }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      >
        <video
          ref={videoRef}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
        <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.25em] text-cream/40 opacity-100 transition-opacity group-hover:opacity-0">
          drag to spin ↺
        </span>
      </div>
      <div className="mt-5 text-center">
        <p className="shout text-3xl md:text-4xl" style={{ color: glow }}>
          {name}
        </p>
        <p className="mt-1.5 text-[10px] uppercase tracking-widest text-cream/55 md:text-xs">
          {protein}g protein · {calories} cal · 0 preservatives
        </p>
      </div>
    </div>
  )
}
