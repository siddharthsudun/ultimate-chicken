import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  const { to, subject, body, fromName } = await req.json()

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY not set in .env.local' },
      { status: 500 }
    )
  }

  const resend = new Resend(apiKey)
  const from = `"${fromName || 'Siddharth Sudunagunta'}" <siddharth@ultimatechicken.in>`

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      text: body,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
