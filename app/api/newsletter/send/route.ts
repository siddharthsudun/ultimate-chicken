import { NextRequest, NextResponse } from 'next/server'
import { getAllEmails, logNewsletterSend } from '@/lib/sheets'
import { sendNewsletter } from '@/lib/resend'

function checkAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
  return token === process.env.DASHBOARD_PASSWORD
}

// Pre-built newsletter templates for different topics
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
        <li>Protein from real food (meat, eggs, dairy) has a PDCAAS score close to 1.0</li>
        <li>Plant protein? You're absorbing maybe 60-80% of what's on the label</li>
      </ul>
      <p><strong>The problem isn't willpower. It's access.</strong></p>
      <p>Cooking 150g of chicken breast takes 45+ minutes. A protein bar has 15g protein, 30g sugar, and tastes like cardboard soaked in guilt.</p>
      <p>That's the gap we're filling. 27g of real protein, from real sous vide chicken, ready to eat straight from the wrapper.</p>
      <p>No cooking. No mess. Just results.</p>
      <p>— Siddharth & Mithielesh<br><em>Founders, Ultimate Chicken</em></p>
    `,
  },
  'fitness-is-hot': {
    subject: 'Fitness Is Hot — And We Mean That Literally 🔥',
    html: `
      <h2>FITNESS IS HOT. WE MEAN THAT.</h2>
      <p>There's a cultural shift happening.</p>
      <p>The gym is no longer just a health decision — it's a lifestyle statement. It's showing up. It's discipline made visible.</p>
      <p>Gen Z gets it. You don't go to the gym to "get healthy." You go because you respect yourself enough to show up for yourself every single day.</p>
      <p><strong>And your nutrition should match that energy.</strong></p>
      <p>That means:</p>
      <ul>
        <li>Real food, not synthetic supplements</li>
        <li>Clean labels you can actually read</li>
        <li>High protein, not high marketing</li>
        <li>Convenience that doesn't compromise quality</li>
      </ul>
      <p>We built Ultimate Chicken for this generation. The ones who train hard, eat smart, and refuse to compromise.</p>
      <p>27g protein. 150 calories. Sous vide. Zero additives. Eat from the wrapper.</p>
      <p><strong>That's the move.</strong></p>
      <p>We're launching at BITS Pilani soon. You're on the list. Stay ready.</p>
    `,
  },
  'sous-vide-science': {
    subject: 'Why Michelin-Star Chefs Cook Their Protein This Way 👨‍🍳',
    html: `
      <h2>THE MICHELIN-STAR SECRET</h2>
      <p>What if we told you that the best restaurants in the world — the ones with 3 Michelin stars — use the exact same cooking technique that goes into every Ultimate Chicken?</p>
      <p><strong>It's called sous vide.</strong></p>
      <p>Pronounced "soo-veed." Literally means "under vacuum" in French. Here's how it works:</p>
      <ul>
        <li>Food is vacuum-sealed in a bag</li>
        <li>Placed in a precisely temperature-controlled water bath</li>
        <li>Cooked at a specific temperature — 63°C for chicken — for an extended period</li>
        <li>The result: perfectly cooked protein, every single time, with zero variance</li>
      </ul>
      <p><strong>Why does this matter for you?</strong></p>
      <p>Traditional cooking methods hit chicken with high heat — pan, oven, grill. This denatures proteins unevenly, drives out moisture, and often destroys nutrients in the process.</p>
      <p>Sous vide is gentle, precise, and consistent. The chicken is cooked to exactly the safe temperature — no more, no less. The result is the juiciest, most nutrient-dense chicken you've ever had.</p>
      <p><em>And it's ready to eat. Straight from the wrapper. No heating needed.</em></p>
      <p>This isn't a gimmick. It's science. And it's exactly what you deserve in your protein.</p>
    `,
  },
  'microplastics': {
    subject: 'We Found Microplastics In Your Protein Bar (And Counted Them) 🔬',
    html: `
      <h2>WE NEED TO TALK ABOUT MICROPLASTICS.</h2>
      <p>Nobody in the food industry wants to have this conversation. We're having it anyway.</p>
      <p>Microplastics are microscopic plastic particles that end up in our food through packaging, processing, and the environment. And the numbers are... not good.</p>
      <p><strong>Here's what independent research shows (particles per serving):</strong></p>
      <ul>
        <li>Water Bottle: 110,000 - 370,000 particles</li>
        <li>Table Salt: 150 - 5,500 particles</li>
        <li>Most Protein Powders: Thousands of particles (often from packaging)</li>
        <li><strong>Ultimate Chicken: 8-10 particles</strong></li>
      </ul>
      <p>How? Our packaging is PP (polypropylene), PE (polyethylene), and PA (polyamide). No BPA. No PVC. These are the food-grade plastics with the lowest microplastic leach rates at any temperature.</p>
      <p>Every batch is tested by Eurofins — a third-party, independent lab. We don't self-certify. We show receipts.</p>
      <p><em>Because real food comes with real transparency.</em></p>
      <p>This is what "clean" actually means. Not marketing-clean. Science-clean.</p>
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

    // Test mode: send to single email
    if (testEmail) {
      const { sent, failed } = await sendNewsletter([testEmail], `[TEST] ${subject}`, html)
      return NextResponse.json({ success: true, sent, failed, mode: 'test' })
    }

    // Get all subscribers
    const emails = await getAllEmails()
    if (emails.length === 0) {
      return NextResponse.json({ error: 'No subscribers yet' }, { status: 400 })
    }

    // Send to all
    const { sent, failed } = await sendNewsletter(emails, subject, html)

    // Log the send
    await logNewsletterSend(subject, sent, 'dashboard').catch(console.error)

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: emails.length,
    })
  } catch (err) {
    console.error('Newsletter send error:', err)
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 })
  }
}

// GET to retrieve available templates
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    templates: Object.entries(TEMPLATES).map(([id, t]) => ({
      id,
      subject: t.subject,
      preview: t.html.replace(/<[^>]*>/g, '').slice(0, 120) + '...',
    })),
  })
}
