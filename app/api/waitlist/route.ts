import { NextRequest, NextResponse } from 'next/server'
import { addToWaitlist, initSheet } from '@/lib/sheets'
import { sendWelcomeEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name } = body

    // Basic validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    // Init sheet headers if needed
    try {
      await initSheet()
    } catch {
      // Non-fatal
    }

    // Add to Google Sheets
    const result = await addToWaitlist(email.trim(), name?.trim())

    if (result.isDuplicate) {
      return NextResponse.json({
        message: "You're already on the list! We'll hit you up when we launch. 🔥",
        isDuplicate: true,
      })
    }

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email.trim(), name?.trim()).catch(console.error)

    return NextResponse.json({
      success: true,
      message: "You're on the list! Check your email for confirmation. See you at BITS. 🔥",
    })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
