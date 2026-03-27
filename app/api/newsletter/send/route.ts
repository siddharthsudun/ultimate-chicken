import { NextRequest, NextResponse } from 'next/server'
import { getAllEmails } from '@/lib/contacts'
import { sendNewsletter } from '@/lib/resend'

function checkAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return false
  return authHeader.replace('Bearer ', '') === process.env.DASHBOARD_PASSWORD
}

const TEMPLATES: Record<string, { subject: string; html: string }> = {
  'protein-101': {
    subject: 'The Truth About Protein Nobody Tells You 🧬',
    html: `
      <h2>PROTEIN 101: THE TRUTH NOBODY TELLS YOU</h2>
      <p>Let's cut through the noise.</p>
      <p>80% of Indians are protein deficient — not because they don't care about nutrition, but because the industry has made it unnecessarily complicated.</p>
      <p><strong>Here's what you actually need to know:</strong></p>
      <ul>
        <li>Your body needs ~0.8-1g of protein per kg of bodyweight daily</li>
        <li>For active people (gym-goers, athletes), that's closer to 1.6-2.2g/kg</li>
        <li>Protein from real food (chicken, eggs, dairy) has a PDCAAS score close to 1.0</li>
        <li>Plant protein? You're absorbing maybe 60-80% of what's on the label</li>
      </ul>
      <p><strong>The problem isn't willpower. It's access.</strong></p>
      <p>Cooking chicken breast takes 45+ minutes. A protein bar has 15g protein, 30g sugar, and tastes like cardboard.</p>
      <p>That's the gap we're filling. 27g of real protein, from real sous vide chicken, ready to eat straight from the wrapper. No cooking. No mess. Just results.</p>
      <p>— Siddharth & Mithielesh<br><em>Founders, Ultimate Chicken</em></p>
    `,
  },
  'fitness-is-hot': {
    subject: 'Fitness Is Hot — And We Mean That Literally 🔥',
    html: `
      <h2>FITNESS IS HOT. WE MEAN THAT.</h2>
      <p>There's a cultural shift happening. The gym is no longer just a health decision — it's a lifestyle statement.</p>
      <p>Gen Z gets it. You don't go to the gym to "get healthy." You go because you respect yourself enough to show up every single day.</p>
      <p><strong>And your nutrition should match that energy.</strong></p>
      <ul>
        <li>Real food, not synthetic supplements</li>
        <li>Clean labels you can actually read</li>
        <li>High protein, not high marketing</li>
        <li>Convenience that doesn't compromise quality</li>
      </ul>
      <p>We built Ultimate Chicken for this generation. 27g protein. 150 calories. Sous vide. Zero additives. Eat from the wrapper.</p>
      <p><strong>That's the move. Coming to BITS Pilani soon.</strong></p>
    `,
  },
  'sous-vide-science': {
    subject: 'Why Michelin-Star Chefs Cook Their Protein This Way 👨‍🍳',
    html: `
      <h2>THE MICHELIN-STAR SECRET</h2>
      <p>The best restaurants in the world use the exact same cooking technique that goes into every Ultimate Chicken.</p>
      <p><strong>It's called sous vide.</strong> Here's how it works:</p>
      <ul>
        <li>Food is vacuum-sealed in a bag</li>
        <li>Cooked in a precisely temperature-controlled water bath at 63°C</li>
        <li>Result: perfectly cooked protein, every single time</li>
      </ul>
      <p>Traditional cooking hits chicken with high heat — this drives out moisture and destroys nutrients. Sous vide is gentle, precise, consistent. The result is the juiciest, most nutrient-dense chicken you've ever had.</p>
      <p><em>Ready to eat. Straight from the wrapper. This is the future of protein convenience.</em></p>
    `,
  },
  'microplastics': {
    subject: 'We Counted Every Microplastic In Our Product 🔬',
    html: `
      <h2>WE NEED TO TALK ABOUT MICROPLASTICS.</h2>
      <p>Nobody in the food industry wants to have this conversation. We're having it anyway.</p>
      <p><strong>Microplastic particles per serving:</strong></p>
      <ul>
        <li>Water Bottle: 110,000 - 370,000 particles</li>
        <li>Table Salt: 150 - 5,500 particles</li>
        <li>Most Protein Powders: Thousands of particles</li>
        <li><strong>Ultimate Chicken: 8-10 particles</strong></li>
      </ul>
      <p>Our packaging is PP, PE, and PA. No BPA. No PVC. Every batch is tested by Eurofins — a third-party, independent lab. We don't self-certify. We show receipts.</p>
      <p><em>Because real food comes with real transparency.</em></p>
    `,
  },
  'launch-hype': {
    subject: "BITS Pilani — We're Coming 🚀",
    html: `
      <h2>WE'RE COMING TO BITS.</h2>
      <p>You're on the list. That means you're first.</p>
      <p>Ultimate Chicken is launching at BITS Pilani — and we're building the protein culture this campus deserves.</p>
      <p><strong>What you're getting:</strong></p>
      <ul>
        <li>27g protein per pack</li>
        <li>150 calories</li>
        <li>Zero preservatives, zero oil, zero additives</li>
        <li>Sous vide cooked — Michelin-star technique</li>
        <li>Eat straight from the wrapper</li>
      </ul>
      <p>Three flavors: Korean BBQ, Spicy Peri Peri, Lemon Herb.</p>
      <p><strong>Stay ready. Drop incoming.</strong></p>
      <p>— Siddharth & Mithielesh</p>
    `,
  },
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { templateId, subject: customSubject, html: customHtml, testEmail } = body

    let subject: string
    let html: string

    if (templateId && TEMPLATES[templateId]) {
      subject = TEMPLATES[templateId].subject
      html = TEMPLATES[templateId].html
    } else if (customSubject && customHtml) {
      subject = customSubject
      html = customHtml
    } else {
      return NextResponse.json({ error: 'Provide templateId or subject+html' }, { status: 400 })
    }

    if (testEmail) {
      const { sent, failed } = await sendNewsletter([testEmail], `[TEST] ${subject}`, html)
      return NextResponse.json({ success: true, sent, failed, mode: 'test' })
    }

    const emails = await getAllEmails()
    if (emails.length === 0) {
      return NextResponse.json({ error: 'No subscribers yet' }, { status: 400 })
    }

    const { sent, failed } = await sendNewsletter(emails, subject, html)

    return NextResponse.json({ success: true, sent, failed, total: emails.length })
  } catch (err) {
    console.error('Newsletter send error:', err)
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    templates: Object.entries(TEMPLATES).map(([id, t]) => ({
      id,
      subject: t.subject,
      preview: t.html.replace(/<[^>]*>/g, '').trim().slice(0, 120) + '...',
    })),
  })
}
