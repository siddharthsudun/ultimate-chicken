import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { Contact } from '../contacts/route'

// client is created per-request so missing key returns a clean error

const BRAND = `
You are drafting cold outreach emails for Ultimate Chicken, a startup founded by
Siddharth Sudunagunta, 2nd-year ECE at BITS Pilani (Batch of '27).

About Ultimate Chicken:
- Ready-to-eat sous vide high-protein chicken pouches — 27g protein, 150 calories, zero additives
- 3 flavors: Korean BBQ, Spicy Peri Peri, Lemon Herb
- Sous vide cooked (Michelin-star technique): vacuum-sealed, precise temperature, juiciest chicken possible
- Eat straight from the wrapper — no cooking, no mess, pure protein
- Zero preservatives, zero artificial additives
- 8-10 microplastic particles per serving (vs 110,000+ in a water bottle) — third-party Eurofins tested
- Targeting Gen Z fitness culture at Indian colleges, starting with BITS Pilani
- Company: Ultimate Protein Foods LLP, BITS Pilani
`

const CATEGORY_PROMPTS: Record<string, string> = {
  VC: `
Cold VC email. Under 180 words. Goal: 15-min call.
Include: 1-line what we do (ready-to-eat protein convenience for India's fitness boom),
market angle (India's ₹80,000cr+ packaged food market, protein snack segment growing 30%+ YoY),
our edge (sous vide tech, Eurofins-tested clean label, premium D2C brand targeting Gen Z),
founder traction (launched at BITS Pilani, building waitlist),
clear ask (15-min call to share full pitch).
Punchy subject. Confident tone. No buzzwords.`,

  QSR: `
Cold B2B email to QSR/cloud kitchen/restaurant. Under 160 words.
Goal: explore supplying or stocking Ultimate Chicken pouches.
Include: ready-to-eat sous vide chicken as a menu shortcut (no cooking needed),
premium protein product their customers are asking for,
27g protein 150 cal clean label — premium upsell opportunity,
offer a sample pack to try.
Peer-to-peer tone, not salesy.`,

  DISTRIBUTOR: `
B2B email to distributor/procurement head. Under 160 words.
Goal: explore distribution partnership for Ultimate Chicken pouches.
Include: premium ready-to-eat protein pouch (sous vide, clean label, Gen Z brand),
fast-growing fitness food segment, high margin premium SKU,
looking for distribution across college campuses and fitness outlets.
Ask for brief call on volumes + margins.`,

  QUICKCOMMERCE: `
Email to Blinkit/Zepto/Swiggy Instamart category manager. Under 160 words.
Goal: get Ultimate Chicken pouches onboarded on their platform.
Specific: premium ready-to-eat sous vide chicken pouch, 27g protein, clean label,
shelf-stable, perfect for quick-commerce (no cold chain needed),
Gen Z fitness audience — high repeat purchase potential.
Fresh protein / ready-to-eat is their fastest-growing category.
Ask for seller onboarding process or intro call.`,
}

export async function POST(req: NextRequest) {
  const contact: Contact = await req.json()

  const bitsianHint = contact.bitsian
    ? '\nIMPORTANT: This person is a BITSian. Add a natural, brief BITS connection mention — not sycophantic, just warm. E.g. "(fellow BITSian here)" woven naturally into the email.'
    : ''

  const prompt = `${BRAND}

Contact:
- Name: ${contact.name}
- Role: ${contact.role}
- Company: ${contact.company}
- City: ${contact.city}
- Notes: ${contact.notes}

Category instructions:
${CATEGORY_PROMPTS[contact.category] || CATEGORY_PROMPTS.QSR}
${bitsianHint}

Output EXACTLY this format, nothing else:
SUBJECT: <subject line>
---
<email body>

Rules:
- Sign off as: Siddharth Sudunagunta, Founder — Ultimate Chicken | BITS Pilani '27
- First name only for recipient (use "${contact.name.split(' ')[0]}")
- No placeholders like [X%] or [your name]
- Sound like a confident founder, not a sales bot
- Plain text only
`

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not set in .env.local — add it and restart the dev server' },
      { status: 500 }
    )
  }

  const client = new Anthropic({ apiKey })

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (response.content[0] as { text: string }).text.trim()
    const match = raw.match(/^SUBJECT:\s*(.+)\n---\n?([\s\S]+)$/i)

    if (match) {
      return NextResponse.json({ subject: match[1].trim(), body: match[2].trim() })
    }

    // fallback parse
    const lines = raw.split('\n')
    const subject = lines[0].replace(/^subject:\s*/i, '').trim()
    const body = lines.slice(1).join('\n').replace(/^---\n/, '').trim()
    return NextResponse.json({ subject, body })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
