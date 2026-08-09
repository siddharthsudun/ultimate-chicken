'use client'

import { useState, useEffect, useCallback } from 'react'

interface Subscriber {
  email: string
  name: string
  joinedAt: string
  source: string
}

interface Template {
  id: string
  subject: string
  preview: string
}

type Tab = 'overview' | 'compose' | 'templates'
type SendStatus = 'idle' | 'sending' | 'success' | 'error'

const TEMPLATE_TOPICS = [
  { id: 'protein-101', label: 'Protein 101', emoji: '🧬', desc: 'The truth about protein nobody tells you' },
  { id: 'fitness-is-hot', label: 'Fitness Is Hot', emoji: '🔥', desc: 'The culture shift — fitness as lifestyle' },
  { id: 'sous-vide-science', label: 'Sous Vide Science', emoji: '👨‍🍳', desc: 'Why Michelin chefs cook this way' },
  { id: 'microplastics', label: 'Microplastics', emoji: '🔬', desc: 'Transparency about what\'s really in food' },
]

export default function Dashboard() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle')
  const [sendResult, setSendResult] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [customSubject, setCustomSubject] = useState('')
  const [customHtml, setCustomHtml] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [agentPrompt, setAgentPrompt] = useState('')
  const [agentResult, setAgentResult] = useState('')
  const [agentLoading, setAgentLoading] = useState(false)

  const authHeader = { Authorization: `Bearer ${password}` }

  const fetchData = useCallback(async () => {
    if (!authed) return
    setLoading(true)
    try {
      const [subsRes, tmplRes] = await Promise.all([
        fetch('/api/newsletter/subscribers', { headers: authHeader }),
        fetch('/api/newsletter/send', { headers: authHeader }),
      ])
      if (subsRes.ok) {
        const d = await subsRes.json()
        setSubscribers(d.subscribers || [])
      }
      if (tmplRes.ok) {
        const d = await tmplRes.json()
        setTemplates(d.templates || [])
      }
    } catch {
      // ignore
    }
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return
    // We'll verify by making a real API call
    fetch('/api/newsletter/subscribers', { headers: { Authorization: `Bearer ${password}` } }).then((r) => {
      if (r.ok) {
        setAuthed(true)
        setAuthError('')
      } else {
        setAuthError('Wrong password. Try again.')
      }
    }).catch(() => setAuthError('Connection error.'))
  }

  const sendTemplate = async (templateId: string, test = false) => {
    setSendStatus('sending')
    setSendResult('')
    try {
      const body: Record<string, string> = { templateId }
      if (test && testEmail) body.testEmail = testEmail
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(body),
      })
      const d = await res.json()
      if (res.ok) {
        setSendStatus('success')
        setSendResult(test ? `Test sent to ${testEmail}! ✓` : `Sent to ${d.sent} subscribers! (${d.failed} failed)`)
      } else {
        setSendStatus('error')
        setSendResult(d.error || 'Send failed')
      }
    } catch {
      setSendStatus('error')
      setSendResult('Network error')
    }
    setTimeout(() => setSendStatus('idle'), 4000)
  }

  const sendCustom = async (test = false) => {
    if (!customSubject || !customHtml) return
    setSendStatus('sending')
    try {
      const body: Record<string, string> = { subject: customSubject, html: customHtml }
      if (test && testEmail) body.testEmail = testEmail
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(body),
      })
      const d = await res.json()
      if (res.ok) {
        setSendStatus('success')
        setSendResult(test ? `Test sent! ✓` : `Blasted to ${d.sent} people!`)
      } else {
        setSendStatus('error')
        setSendResult(d.error || 'Failed')
      }
    } catch {
      setSendStatus('error')
      setSendResult('Error')
    }
    setTimeout(() => setSendStatus('idle'), 4000)
  }

  // AI Agent: Generate newsletter content from a prompt
  const runAgent = async () => {
    if (!agentPrompt) return
    setAgentLoading(true)
    setAgentResult('')
    // In production, this would call Claude API. For now, we generate templates based on topic.
    await new Promise(r => setTimeout(r, 1500)) // simulate
    const suggestion = generateFromPrompt(agentPrompt)
    setCustomSubject(suggestion.subject)
    setCustomHtml(suggestion.html)
    setAgentResult('✓ Content generated! Review and edit below, then send.')
    setTab('compose')
    setAgentLoading(false)
  }

  function generateFromPrompt(prompt: string): { subject: string; html: string } {
    const lower = prompt.toLowerCase()
    if (lower.includes('gym') || lower.includes('workout') || lower.includes('train')) {
      return {
        subject: `Your Gym Session Needs This 💪`,
        html: `<h2>YOUR GYM SESSION NEEDS THIS</h2><p>${prompt}</p><p>At Ultimate Chicken, we believe your nutrition should be as serious as your training. 27g protein. 150 calories. Zero additives. Ready to eat in seconds.</p><p>This isn't a supplement. This is food. Real food.</p><p><strong>Coming to BITS Pilani soon. You're first.</strong></p>`,
      }
    }
    if (lower.includes('protein') || lower.includes('muscle')) {
      return {
        subject: `The Protein Hit Your Body Needs 🧬`,
        html: `<h2>THE PROTEIN HIT YOUR BODY NEEDS</h2><p>${prompt}</p><p>27g of real protein from sous vide chicken. No fillers. No powder. No compromise. Just the cleanest protein source available — in your hands, ready to eat.</p><p><strong>Real food. Real protein. Coming soon.</strong></p>`,
      }
    }
    if (lower.includes('health') || lower.includes('clean') || lower.includes('natural')) {
      return {
        subject: `Clean Eating, Finally Made Easy 🌿`,
        html: `<h2>CLEAN EATING, FINALLY EASY</h2><p>${prompt}</p><p>Zero preservatives. Zero sugar. Zero additives. Just chicken, marinade, and sous vide science. This is what clean actually means.</p><p>We test every batch at Eurofins. BPA-free packaging. 8-10 microplastic particles per serving — vs 110,000+ in a plastic water bottle.</p>`,
      }
    }
    // Generic
    return {
      subject: `From Ultimate Chicken: ${prompt.slice(0, 50)}`,
      html: `<h2>${prompt.toUpperCase()}</h2><p>At Ultimate Chicken, we think about this every day. Real food for real athletes. 27g protein. 150 calories. Sous vide. Zero compromise.</p><p>Coming to BITS Pilani. You're on the list. Stay ready.</p>`,
    }
  }

  // Login Screen
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="font-display font-black text-4xl text-[#CBFF00] mb-2 uppercase">ULTIMATE CHICKEN™</div>
            <div className="text-white/40 text-sm">Newsletter Dashboard</div>
          </div>
          <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4">
            <div>
              <label className="text-white/60 text-sm font-semibold uppercase tracking-widest block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:border-[#CBFF00] transition-colors"
                placeholder="Enter dashboard password"
              />
              {authError && <p className="text-red-400 text-sm mt-2">{authError}</p>}
            </div>
            <button type="submit" className="w-full btn-primary btn-lime py-4 text-center">
              Enter Dashboard →
            </button>
          </form>
          <p className="text-white/20 text-xs text-center mt-4">Set DASHBOARD_PASSWORD in your .env.local file</p>
        </div>
      </div>
    )
  }

  const recentSubs = subscribers.slice(-10).reverse()

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 md:px-10 py-5 flex items-center justify-between sticky top-0 z-50" style={{ background: 'rgba(6,6,6,0.95)', backdropFilter: 'blur(20px)' }}>
        <div>
          <div className="font-display font-black text-xl text-[#CBFF00] uppercase">UC™ Newsletter Dashboard</div>
          <div className="text-white/30 text-xs">{subscribers.length} total subscribers</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#CBFF00]/10 border border-[#CBFF00]/30 rounded-full text-[#CBFF00] text-xs font-bold">
            {subscribers.length} subscribers
          </div>
          <button onClick={() => setAuthed(false)} className="text-white/30 text-sm hover:text-white transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
          {[
            { id: 'overview' as Tab, label: 'Overview', emoji: '📊' },
            { id: 'templates' as Tab, label: 'Send Template', emoji: '⚡' },
            { id: 'compose' as Tab, label: 'Compose', emoji: '✍️' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: tab === t.id ? '#CBFF00' : 'rgba(255,255,255,0.05)',
                color: tab === t.id ? '#0D2B1E' : 'rgba(255,255,255,0.6)',
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* STATUS BANNER */}
        {sendStatus !== 'idle' && (
          <div
            className="mb-6 px-6 py-4 rounded-2xl text-center font-semibold text-sm"
            style={{
              background: sendStatus === 'success' ? 'rgba(203,255,0,0.15)' : sendStatus === 'error' ? 'rgba(255,50,50,0.15)' : 'rgba(255,255,255,0.05)',
              color: sendStatus === 'success' ? '#CBFF00' : sendStatus === 'error' ? '#FF6060' : 'white',
              border: `1px solid ${sendStatus === 'success' ? '#CBFF0030' : sendStatus === 'error' ? '#FF606030' : '#ffffff10'}`,
            }}
          >
            {sendStatus === 'sending' && '⏳ Sending...'}
            {sendStatus === 'success' && `✅ ${sendResult}`}
            {sendStatus === 'error' && `❌ ${sendResult}`}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Subscribers', value: subscribers.length, color: '#CBFF00' },
                { label: 'Today', value: subscribers.filter(s => s.joinedAt && new Date(s.joinedAt).toDateString() === new Date().toDateString()).length, color: '#00B5AD' },
                { label: 'This Week', value: subscribers.filter(s => { const d = new Date(s.joinedAt); const now = new Date(); return (now.getTime() - d.getTime()) < 7 * 86400000 }).length, color: '#FF0055' },
                { label: 'BITS Launch', value: 'Soon™', color: '#FF3D00' },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="font-display font-black text-3xl" style={{ color: s.color }}>
                    {loading ? '—' : s.value}
                  </div>
                  <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* AI Agent */}
            <div className="bg-gradient-to-br from-[#CBFF00]/10 to-transparent border border-[#CBFF00]/20 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#CBFF00] flex items-center justify-center text-[#0D2B1E] text-lg">🤖</div>
                <div>
                  <div className="text-white font-bold">Newsletter Agent</div>
                  <div className="text-white/40 text-xs">Tell me your idea and I&apos;ll write the email</div>
                </div>
              </div>
              <div className="flex gap-3">
                <textarea
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  placeholder="E.g. 'Write about why eating protein in the morning is crucial for muscle growth' or 'Create hype about our Korean BBQ launch at BITS'"
                  className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-[#CBFF00]/50 transition-colors resize-none"
                  rows={3}
                />
                <button
                  onClick={runAgent}
                  disabled={agentLoading || !agentPrompt}
                  className="btn-primary btn-lime self-stretch px-6 flex items-center"
                >
                  {agentLoading ? '⏳' : '⚡ Generate'}
                </button>
              </div>
              {agentResult && (
                <p className="text-[#CBFF00] text-sm mt-3 font-medium">{agentResult}</p>
              )}
            </div>

            {/* Recent Subscribers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-lg">Recent Subscribers</h2>
                <button onClick={fetchData} className="text-[#CBFF00] text-sm hover:opacity-70 transition-opacity">
                  ↻ Refresh
                </button>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center text-white/30">Loading...</div>
                ) : recentSubs.length === 0 ? (
                  <div className="p-8 text-center text-white/30">
                    No subscribers yet. Share the waitlist link!
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-5 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">Email</th>
                        <th className="text-left px-5 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Name</th>
                        <th className="text-left px-5 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Joined</th>
                        <th className="text-left px-5 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSubs.map((s, i) => (
                        <tr key={s.email} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-5 py-3 text-white text-sm font-medium">{s.email}</td>
                          <td className="px-5 py-3 text-white/50 text-sm hidden md:table-cell">{s.name || '—'}</td>
                          <td className="px-5 py-3 text-white/50 text-sm hidden md:table-cell">
                            {s.joinedAt ? new Date(s.joinedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-0.5 bg-[#CBFF00]/10 text-[#CBFF00] text-xs rounded-full font-medium">
                              {s.source || 'website'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {subscribers.length > 10 && (
                <p className="text-white/30 text-xs text-center mt-3">Showing 10 most recent of {subscribers.length} total</p>
              )}
            </div>
          </div>
        )}

        {/* TEMPLATES TAB */}
        {tab === 'templates' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-white font-bold text-lg">Pre-Built Newsletter Templates</h2>
              <p className="text-white/40 text-sm mt-1">Curated content on fitness, protein, and health. One click to send.</p>
            </div>

            {/* Test Email */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-2">Test Email (optional — sends preview to this address before blasting all)</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full md:w-96 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#CBFF00] transition-colors"
              />
            </div>

            {/* Templates */}
            <div className="grid md:grid-cols-2 gap-4">
              {TEMPLATE_TOPICS.map((t) => (
                <div key={t.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-[#CBFF00]/30 transition-colors group">
                  <div className="text-3xl mb-3">{t.emoji}</div>
                  <h3 className="text-white font-bold text-lg">{t.label}</h3>
                  <p className="text-white/40 text-sm mt-1 mb-5">{t.desc}</p>
                  <div className="flex gap-3">
                    {testEmail && (
                      <button
                        onClick={() => sendTemplate(t.id, true)}
                        disabled={sendStatus === 'sending'}
                        className="flex-1 py-2.5 border border-[#CBFF00]/30 text-[#CBFF00] text-sm font-semibold rounded-xl hover:bg-[#CBFF00]/10 transition-colors disabled:opacity-50"
                      >
                        Test Send
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm(`Send "${t.label}" to all ${subscribers.length} subscribers?`)) {
                          sendTemplate(t.id, false)
                        }
                      }}
                      disabled={sendStatus === 'sending'}
                      className="flex-1 btn-primary btn-lime py-2.5 text-sm disabled:opacity-50"
                    >
                      Send to All ({subscribers.length})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPOSE TAB */}
        {tab === 'compose' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-white font-bold text-lg">Compose Custom Newsletter</h2>
              <p className="text-white/40 text-sm mt-1">Write your own email. HTML supported.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-2">Subject Line</label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Your fire subject line..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:border-[#CBFF00] transition-colors"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-2">Email Body (HTML)</label>
                <textarea
                  value={customHtml}
                  onChange={(e) => setCustomHtml(e.target.value)}
                  placeholder="<h2>YOUR HEADLINE</h2><p>Your content...</p>"
                  rows={14}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-sm outline-none focus:border-[#CBFF00] transition-colors resize-y"
                />
                <p className="text-white/30 text-xs mt-1">Tip: Use &lt;h2&gt; for headlines, &lt;p&gt; for paragraphs, &lt;ul&gt;&lt;li&gt; for lists, &lt;strong&gt; for bold</p>
              </div>
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-2">Test Email</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Send test to this email first"
                  className="w-full md:w-80 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#CBFF00] transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                {testEmail && (
                  <button
                    onClick={() => sendCustom(true)}
                    disabled={sendStatus === 'sending' || !customSubject || !customHtml}
                    className="px-6 py-3 border border-[#CBFF00]/30 text-[#CBFF00] font-semibold rounded-xl hover:bg-[#CBFF00]/10 transition-colors disabled:opacity-50"
                  >
                    Send Test →
                  </button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm(`Blast to all ${subscribers.length} subscribers?`)) {
                      sendCustom(false)
                    }
                  }}
                  disabled={sendStatus === 'sending' || !customSubject || !customHtml}
                  className="btn-primary btn-lime disabled:opacity-50"
                >
                  {sendStatus === 'sending' ? 'Sending...' : `Blast to ${subscribers.length} Subscribers 🚀`}
                </button>
              </div>
            </div>

            {/* AI generation shortcut */}
            <div className="bg-[#CBFF00]/5 border border-[#CBFF00]/15 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3 text-[#CBFF00] font-bold text-sm">
                🤖 Need inspiration? Use the Agent (Overview tab)
              </div>
              <p className="text-white/40 text-sm">Go to Overview → Newsletter Agent → Describe your idea → The agent will auto-fill this form.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
