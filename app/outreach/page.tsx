'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ─────────────────────────────────────────────────────────────────────

type Category = 'VC' | 'QSR' | 'DISTRIBUTOR' | 'QUICKCOMMERCE'
type Status = 'new' | 'drafted' | 'sent'

interface Contact {
  id: string
  name: string
  email: string
  company: string
  role: string
  category: Category
  city: string
  notes: string
  bitsian: boolean
  status: Status
  draft?: { subject: string; body: string }
  sentAt?: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CAT_META: Record<Category, { label: string; emoji: string; xp: number; color: string; bg: string }> = {
  VC:            { label: 'VC',            emoji: '🏦', xp: 100, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  QUICKCOMMERCE: { label: 'Quick Commerce',emoji: '⚡', xp: 80,  color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/30' },
  QSR:           { label: 'QSR',           emoji: '🍗', xp: 60,  color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30' },
  DISTRIBUTOR:   { label: 'Distributor',   emoji: '📦', xp: 40,  color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30' },
}

const ACHIEVEMENTS = [
  { id: 'first_blood',   label: 'First Blood',   desc: 'Sent your first email',           threshold: (s: Contact[]) => s.length >= 1 },
  { id: 'vc_hunter',     label: 'VC Hunter',     desc: 'Sent 3 VC emails',                threshold: (s: Contact[]) => s.filter(c=>c.category==='VC').length >= 3 },
  { id: 'bits_network',  label: 'BITS Network',  desc: 'Reached out to a BITSian',        threshold: (s: Contact[]) => s.some(c=>c.bitsian) },
  { id: 'qsr_blitz',    label: 'QSR Blitz',     desc: '5 QSR partners contacted',         threshold: (s: Contact[]) => s.filter(c=>c.category==='QSR').length >= 5 },
  { id: 'speed_run',    label: 'Speed Run',     desc: '10 emails sent',                   threshold: (s: Contact[]) => s.length >= 10 },
  { id: 'quick_strike', label: 'Quick Strike',  desc: 'Blinkit or Zepto reached',         threshold: (s: Contact[]) => s.some(c=>c.category==='QUICKCOMMERCE') },
]

const DAILY_GOAL = 5

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcXP(sent: Contact[]) {
  return sent.reduce((sum, c) => sum + CAT_META[c.category].xp + (c.bitsian ? 25 : 0), 0)
}

function getStreak(sent: Contact[]): number {
  if (!sent.length) return 0
  const days = new Set(sent.map(c => c.sentAt?.slice(0, 10)).filter(Boolean))
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (days.has(d.toISOString().slice(0, 10))) streak++
    else break
  }
  return streak
}

function todaySent(sent: Contact[]) {
  const today = new Date().toISOString().slice(0, 10)
  return sent.filter(c => c.sentAt?.startsWith(today)).length
}

// ── Password Gate ─────────────────────────────────────────────────────────────

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)
  const check = () => {
    if (pw === 'uc2025') { onAuth() }
    else { setErr(true); setTimeout(() => setErr(false), 800) }
  }
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        animate={err ? { x: [-8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="text-4xl">🐔</div>
        <p className="text-white/50 text-sm font-mono">outreach.ultimatechicken.in</p>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && check()}
          placeholder="password"
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-white/30 w-48 text-center font-mono"
          autoFocus
        />
        <button onClick={check} className="text-xs text-white/30 hover:text-white/60 transition-colors">
          enter →
        </button>
      </motion.div>
    </div>
  )
}

// ── Add Contact Modal ─────────────────────────────────────────────────────────

function AddModal({ onClose, onAdd }: { onClose: () => void; onAdd: (c: Partial<Contact>) => void }) {
  const [form, setForm] = useState<Partial<Contact>>({
    category: 'QSR', city: 'Hyderabad', bitsian: false,
  })
  const set = (k: keyof Contact, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
      >
        <h2 className="text-white font-semibold mb-4">Add Target</h2>
        <div className="flex flex-col gap-3">
          {(['name','email','company','role','city','notes'] as const).map(field => (
            <div key={field}>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">{field}</label>
              <input
                value={(form[field] as string) || ''}
                onChange={e => set(field, e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-white/30"
              />
            </div>
          ))}
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Category</label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
            >
              {(Object.keys(CAT_META) as Category[]).map(c => (
                <option key={c} value={c}>{CAT_META[c].emoji} {CAT_META[c].label} (+{CAT_META[c].xp} XP)</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!form.bitsian} onChange={e => set('bitsian', e.target.checked)} />
            <span className="text-white/60 text-sm">🎓 BITSian (+25 XP bonus)</span>
          </label>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onAdd(form); onClose() }}
            className="flex-1 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            Add Target
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Draft Modal ───────────────────────────────────────────────────────────────

function DraftModal({
  contact,
  onClose,
  onSend,
  onSaveDraft,
}: {
  contact: Contact
  onClose: () => void
  onSend: (subject: string, body: string) => void
  onSaveDraft: (subject: string, body: string) => void
}) {
  const [subject, setSubject] = useState(contact.draft?.subject || '')
  const [body, setBody] = useState(contact.draft?.body || '')
  const [drafting, setDrafting] = useState(!contact.draft)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!contact.draft) {
      setDrafting(true)
      fetch('/api/outreach/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      })
        .then(r => r.json())
        .then(d => {
          if (d.error) { setError(d.error); setDrafting(false); return }
          setSubject(d.subject)
          setBody(d.body)
          onSaveDraft(d.subject, d.body)
          setDrafting(false)
        })
        .catch(e => { setError(String(e)); setDrafting(false) })
    }
  }, []) // eslint-disable-line

  const handleSend = async () => {
    setSending(true)
    try {
      const r = await fetch('/api/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: contact.email, subject, body }),
      })
      const d = await r.json()
      if (d.error) { setError(d.error); setSending(false); return }
      onSend(subject, body)
    } catch (e) {
      setError(String(e))
      setSending(false)
    }
  }

  const cat = CAT_META[contact.category]

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{cat.emoji}</span>
              <h2 className="text-white font-semibold">{contact.name}</h2>
              {contact.bitsian && <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">🎓 BITSian</span>}
            </div>
            <p className="text-white/40 text-sm">{contact.role} @ {contact.company}</p>
          </div>
          <div className={`text-xs px-2 py-1 rounded-full border ${cat.bg} ${cat.color} font-mono`}>
            +{cat.xp + (contact.bitsian ? 25 : 0)} XP
          </div>
        </div>

        {drafting ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full"
            />
            <p className="text-white/40 text-sm">Claude is drafting your email...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">TO</label>
              <p className="text-white/60 text-sm font-mono">{contact.email}</p>
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">SUBJECT</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-white/30 font-medium"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">BODY</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={12}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-white/30 resize-none font-mono leading-relaxed"
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => { setSubject(''); setBody(''); setDrafting(true); const c = {...contact, draft: undefined}; /* re-trigger */ fetch('/api/outreach/draft', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(c) }).then(r=>r.json()).then(d=>{setSubject(d.subject);setBody(d.body);onSaveDraft(d.subject,d.body);setDrafting(false)}) }}
                className="py-2 px-4 rounded-lg border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors"
              >
                ↺ Regenerate
              </button>
              <button onClick={onClose} className="py-2 px-4 rounded-lg border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors">
                Save Draft
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !subject || !body}
                className="flex-1 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : `🚀 Send (+${cat.xp + (contact.bitsian ? 25 : 0)} XP)`}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// ── Contact Card ──────────────────────────────────────────────────────────────

function ContactCard({
  contact,
  onClick,
  onDelete,
}: {
  contact: Contact
  onClick: () => void
  onDelete: () => void
}) {
  const cat = CAT_META[contact.category]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`border rounded-xl p-3 cursor-pointer hover:border-white/20 transition-all group ${
        contact.status === 'sent'
          ? 'border-white/5 bg-white/2 opacity-60'
          : 'border-white/10 bg-white/3 hover:bg-white/5'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm">{cat.emoji}</span>
            <p className="text-white text-sm font-medium truncate">{contact.name}</p>
            {contact.bitsian && <span className="text-xs">🎓</span>}
            {contact.status === 'sent' && <span className="text-xs">✅</span>}
            {contact.status === 'drafted' && <span className="text-xs">📝</span>}
          </div>
          <p className="text-white/40 text-xs truncate">{contact.role}</p>
          <p className="text-white/30 text-xs truncate">{contact.company}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs ${cat.color} font-mono`}>+{cat.xp + (contact.bitsian ? 25 : 0)}</span>
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="text-white/0 group-hover:text-white/30 hover:!text-red-400 text-xs transition-colors"
          >×</button>
        </div>
      </div>
    </motion.div>
  )
}

// ── XP Pop ────────────────────────────────────────────────────────────────────

function XPPop({ xp, onDone }: { xp: number; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.8 }}
      animate={{ opacity: 1, y: -60, scale: 1 }}
      exit={{ opacity: 0, y: -100, scale: 0.8 }}
      onAnimationComplete={onDone}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
    >
      <div className="bg-white text-black px-6 py-3 rounded-full font-bold text-xl shadow-2xl">
        +{xp} XP ⚡
      </div>
    </motion.div>
  )
}

// ── Achievement Toast ─────────────────────────────────────────────────────────

function AchievementToast({ label, desc, onDone }: { label: string; desc: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t) }, [onDone])
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
      className="fixed top-6 right-6 z-[100] bg-zinc-900 border border-yellow-400/40 rounded-xl p-4 shadow-2xl max-w-xs"
    >
      <p className="text-yellow-400 text-xs font-mono uppercase tracking-wider mb-1">🏆 Achievement Unlocked</p>
      <p className="text-white font-semibold">{label}</p>
      <p className="text-white/50 text-xs">{desc}</p>
    </motion.div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function OutreachPage() {
  const [authed, setAuthed] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<Contact | null>(null)
  const [xpPop, setXpPop] = useState<number | null>(null)
  const [toast, setToast] = useState<{ label: string; desc: string } | null>(null)
  const [filter, setFilter] = useState<Category | 'ALL'>('ALL')
  const unlockedRef = useRef<Set<string>>(new Set())

  // Load contacts
  const reload = async () => {
    const r = await fetch('/api/outreach/contacts')
    setContacts(await r.json())
  }

  useEffect(() => { if (authed) reload() }, [authed])

  // Check achievements
  const sent = contacts.filter(c => c.status === 'sent')
  useEffect(() => {
    for (const a of ACHIEVEMENTS) {
      if (!unlockedRef.current.has(a.id) && a.threshold(sent)) {
        unlockedRef.current.add(a.id)
        setToast({ label: a.label, desc: a.desc })
      }
    }
  }, [sent.length]) // eslint-disable-line

  const totalXP = calcXP(sent)
  const streak = getStreak(sent)
  const todayCount = todaySent(sent)
  const dailyPct = Math.min(100, (todayCount / DAILY_GOAL) * 100)

  const apiAction = async (action: string, data: object) => {
    const r = await fetch('/api/outreach/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data }),
    })
    return r.json()
  }

  const addContact = async (data: Partial<Contact>) => {
    await apiAction('add', data)
    reload()
  }

  const deleteContact = async (id: string) => {
    await apiAction('delete', { id })
    setContacts(c => c.filter(x => x.id !== id))
  }

  const saveDraft = async (id: string, subject: string, body: string) => {
    await apiAction('update', { id, data: { status: 'drafted', draft: { subject, body } } })
    setContacts(c => c.map(x => x.id === id ? { ...x, status: 'drafted', draft: { subject, body } } : x))
  }

  const markSent = async (id: string, subject: string, body: string) => {
    const xp = CAT_META[contacts.find(c=>c.id===id)!.category].xp + (contacts.find(c=>c.id===id)!.bitsian ? 25 : 0)
    await apiAction('update', { id, data: { status: 'sent', draft: { subject, body }, sentAt: new Date().toISOString() } })
    setContacts(c => c.map(x => x.id === id ? { ...x, status: 'sent', draft: { subject, body }, sentAt: new Date().toISOString() } : x))
    setSelected(null)
    setXpPop(xp)
  }

  const filtered = filter === 'ALL' ? contacts : contacts.filter(c => c.category === filter)
  const cols: Record<Status, Contact[]> = {
    new: filtered.filter(c => c.status === 'new'),
    drafted: filtered.filter(c => c.status === 'drafted'),
    sent: filtered.filter(c => c.status === 'sent'),
  }

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐔</span>
            <div>
              <h1 className="font-semibold text-white leading-none">Outreach Mission Control</h1>
              <p className="text-white/30 text-xs">Ultimate Chicken</p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-6">
            {/* XP */}
            <div className="text-center">
              <motion.p key={totalXP} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-yellow-400 font-bold text-lg leading-none font-mono">
                {totalXP.toLocaleString()}
              </motion.p>
              <p className="text-white/30 text-xs">XP</p>
            </div>
            {/* Streak */}
            <div className="text-center">
              <p className="text-orange-400 font-bold text-lg leading-none">{streak > 0 ? `🔥${streak}` : '—'}</p>
              <p className="text-white/30 text-xs">streak</p>
            </div>
            {/* Today */}
            <div className="text-center">
              <p className="text-white font-bold text-lg leading-none">{todayCount}/{DAILY_GOAL}</p>
              <p className="text-white/30 text-xs">today</p>
            </div>
            {/* Daily progress */}
            <div className="w-24">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${dailyPct}%` }}
                  transition={{ type: 'spring', stiffness: 80 }}
                />
              </div>
              <p className="text-white/30 text-xs mt-1 text-center">daily goal</p>
            </div>

            <button
              onClick={() => setShowAdd(true)}
              className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
            >
              + Add Target
            </button>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="border-b border-white/10 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${filter === 'ALL' ? 'border-white/30 bg-white/10 text-white' : 'border-white/10 text-white/40 hover:text-white/60'}`}
          >
            All ({contacts.length})
          </button>
          {(Object.keys(CAT_META) as Category[]).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${filter === cat ? `border-white/30 bg-white/10 ${CAT_META[cat].color}` : 'border-white/10 text-white/40 hover:text-white/60'}`}
            >
              {CAT_META[cat].emoji} {CAT_META[cat].label} ({contacts.filter(c=>c.category===cat).length})
            </button>
          ))}

          {/* Achievements */}
          <div className="ml-auto flex gap-1">
            {ACHIEVEMENTS.map(a => (
              <div
                key={a.id}
                title={`${a.label}: ${a.desc}`}
                className={`text-base transition-all ${a.threshold(sent) ? 'grayscale-0' : 'grayscale opacity-20'}`}
              >
                🏆
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-4">
          {([
            { key: 'new',     label: 'To Contact', icon: '🎯', desc: 'Click to draft + send' },
            { key: 'drafted', label: 'Drafted',    icon: '📝', desc: 'Review and send' },
            { key: 'sent',    label: 'Sent',       icon: '✅', desc: 'Mission complete' },
          ] as const).map(col => (
            <div key={col.key} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{col.icon}</span>
                  <span className="text-white/70 text-sm font-medium">{col.label}</span>
                  <span className="text-white/30 text-xs bg-white/5 rounded-full px-2">{cols[col.key].length}</span>
                </div>
                <p className="text-white/20 text-xs">{col.desc}</p>
              </div>

              <div className="flex flex-col gap-2 min-h-[200px]">
                <AnimatePresence mode="popLayout">
                  {cols[col.key].map(contact => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onClick={() => setSelected(contact)}
                      onDelete={() => deleteContact(contact.id)}
                    />
                  ))}
                </AnimatePresence>
                {cols[col.key].length === 0 && (
                  <div className="border border-dashed border-white/5 rounded-xl h-24 flex items-center justify-center">
                    <p className="text-white/20 text-xs">
                      {col.key === 'new' ? '+ Add a target above' : 'Nothing here yet'}
                    </p>
                  </div>
                )}
              </div>

              {col.key === 'sent' && cols.sent.length > 0 && (
                <div className="bg-white/3 border border-white/5 rounded-xl p-3">
                  <p className="text-white/40 text-xs mb-2">XP breakdown</p>
                  {(Object.keys(CAT_META) as Category[]).map(cat => {
                    const catSent = cols.sent.filter(c => c.category === cat)
                    if (!catSent.length) return null
                    return (
                      <div key={cat} className="flex items-center justify-between text-xs mb-1">
                        <span className="text-white/50">{CAT_META[cat].emoji} {catSent.length}×</span>
                        <span className={CAT_META[cat].color}>
                          {catSent.reduce((s,c) => s + CAT_META[cat].xp + (c.bitsian ? 25 : 0), 0)} XP
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Achievements panel */}
        {sent.length > 0 && (
          <div className="mt-8 border border-white/10 rounded-2xl p-5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Achievements</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {ACHIEVEMENTS.map(a => {
                const done = a.threshold(sent)
                return (
                  <div key={a.id} className={`flex flex-col items-center gap-1 p-3 rounded-xl border ${done ? 'border-yellow-400/30 bg-yellow-400/5' : 'border-white/5 opacity-40'}`}>
                    <span className="text-2xl">{done ? '🏆' : '🔒'}</span>
                    <p className="text-xs text-center text-white/70 font-medium">{a.label}</p>
                    <p className="text-xs text-center text-white/30 leading-tight">{a.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdd={addContact} />}

        {selected && (
          <DraftModal
            key={selected.id}
            contact={selected}
            onClose={() => setSelected(null)}
            onSaveDraft={(subject, body) => saveDraft(selected.id, subject, body)}
            onSend={(subject, body) => markSent(selected.id, subject, body)}
          />
        )}

        {xpPop !== null && <XPPop xp={xpPop} onDone={() => setXpPop(null)} />}
        {toast && <AchievementToast label={toast.label} desc={toast.desc} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  )
}
