'use client'

import { useState } from 'react'

export default function WaitlistForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || status === 'loading') return
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setStatus('done')
      setMessage(data.message || "You're in. We'll hit you up at launch.")
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-2xl bg-lime-brand px-8 py-6 text-center">
        <p className="shout text-3xl text-green-deep">You&apos;re on the list.</p>
        <p className="mt-2 text-sm font-medium text-green-deep/80">{message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="input-pill flex-1"
        aria-label="Email address"
      />
      <button type="submit" className="btn-lime" disabled={status === 'loading'}>
        {status === 'loading' ? 'Joining…' : 'Join the Waitlist'}
      </button>
      {status === 'error' && (
        <p className={`text-sm font-medium ${dark ? 'text-red-300' : 'text-red-600'} sm:absolute sm:mt-16`}>{message}</p>
      )}
    </form>
  )
}
