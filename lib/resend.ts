import { Resend } from 'resend'

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured')
  return new Resend(process.env.RESEND_API_KEY)
}
const FROM = process.env.EMAIL_FROM || 'Ultimate Chicken <hello@ultimatechicken.in>'

function welcomeEmailHTML(name?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Ultimate Chicken</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800;900&family=Inter:wght@400;600&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Inter', Arial, sans-serif; background:#0D2B1E; }
    .container { max-width:600px; margin:0 auto; }
    .header { background:#CBFF00; padding:48px 40px 40px; }
    .logo { font-family:'Barlow Condensed',Arial,sans-serif; font-weight:900; font-size:42px; color:#0D2B1E; line-height:1; text-transform:uppercase; }
    .tagline { font-family:'Barlow Condensed',Arial,sans-serif; font-weight:800; font-size:20px; color:#0D2B1E; opacity:0.7; margin-top:6px; }
    .body { background:#0D2B1E; padding:48px 40px; }
    .headline { font-family:'Barlow Condensed',Arial,sans-serif; font-weight:900; font-size:48px; color:#CBFF00; line-height:1; text-transform:uppercase; margin-bottom:20px; }
    .text { color:rgba(255,255,255,0.7); font-size:16px; line-height:1.7; margin-bottom:20px; }
    .stats { display:flex; gap:16px; margin:32px 0; }
    .stat { flex:1; background:rgba(203,255,0,0.08); border:1px solid rgba(203,255,0,0.2); border-radius:16px; padding:20px; text-align:center; }
    .stat-num { font-family:'Barlow Condensed',Arial,sans-serif; font-weight:900; font-size:36px; color:#CBFF00; }
    .stat-label { color:rgba(255,255,255,0.5); font-size:12px; text-transform:uppercase; letter-spacing:0.1em; margin-top:4px; }
    .cta { display:inline-block; background:#CBFF00; color:#0D2B1E; font-family:'Barlow Condensed',Arial,sans-serif; font-weight:900; font-size:20px; text-transform:uppercase; padding:18px 36px; border-radius:100px; text-decoration:none; margin-top:32px; letter-spacing:0.05em; }
    .divider { height:1px; background:rgba(255,255,255,0.1); margin:32px 0; }
    .footer { background:#060606; padding:32px 40px; }
    .footer-text { color:rgba(255,255,255,0.3); font-size:12px; line-height:1.6; }
    .badge { display:inline-block; background:rgba(203,255,0,0.1); border:1px solid rgba(203,255,0,0.3); border-radius:100px; padding:4px 14px; font-size:12px; color:#CBFF00; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">ULTIMATE<br>CHICKEN™</div>
      <div class="tagline">Real Food. Real Protein.</div>
    </div>
    <div class="body">
      <div class="badge">You're on the list 🔥</div>
      <div class="headline">
        ${name ? `${name.split(' ')[0]},<br>` : ''}YOU'RE IN.
      </div>
      <p class="text">
        Welcome to Ultimate Chicken. You&apos;re now among the first to know
        when we drop at BITS Pilani. We&apos;re not just launching a food product —
        we&apos;re building the protein culture that India&apos;s fitness scene deserves.
      </p>
      <p class="text">
        <strong style="color:white;">What&apos;s coming your way:</strong><br>
        → Early access when we launch at BITS<br>
        → Weekly fire content on fitness, protein &amp; being absolutely jacked<br>
        → Exclusive drops and behind-the-scenes updates<br>
        → Honest nutrition science, no BS
      </p>
      <div style="background:rgba(203,255,0,0.05); border:1px solid rgba(203,255,0,0.15); border-radius:20px; padding:24px; margin-top:24px;">
        <div style="color:#CBFF00; font-weight:600; font-size:14px; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:12px;">What You&apos;re Getting</div>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <div class="stat" style="flex:1; min-width:100px;">
            <div class="stat-num">27g</div>
            <div class="stat-label">Protein</div>
          </div>
          <div class="stat" style="flex:1; min-width:100px;">
            <div class="stat-num">150</div>
            <div class="stat-label">Calories</div>
          </div>
          <div class="stat" style="flex:1; min-width:100px;">
            <div class="stat-num">0</div>
            <div class="stat-label">Additives</div>
          </div>
        </div>
      </div>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ultimatechicken.in'}" class="cta">
        Visit Our Website →
      </a>
    </div>
    <div class="footer">
      <div class="footer-text">
        <strong style="color:rgba(255,255,255,0.6);">Ultimate Protein Foods LLP</strong><br>
        BITS Pilani, Pilani Campus, Rajasthan 333031<br><br>
        You&apos;re receiving this because you joined our waitlist.
        We promise to only send you things worth reading.<br>
        <a href="#" style="color:#CBFF00;">Unsubscribe</a>
      </div>
    </div>
  </div>
</body>
</html>
`
}

function newsletterEmailHTML(subject: string, content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${subject}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; background:#0D2B1E; }
    .container { max-width:600px; margin:0 auto; }
    .header { background:#CBFF00; padding:32px 40px; display:flex; align-items:center; justify-content:space-between; }
    .logo { font-weight:900; font-size:28px; color:#0D2B1E; line-height:1; text-transform:uppercase; }
    .body { background:#0D2B1E; padding:48px 40px; }
    .content { color:rgba(255,255,255,0.8); font-size:16px; line-height:1.8; }
    .content h2 { color:#CBFF00; font-size:32px; font-weight:900; text-transform:uppercase; margin-bottom:16px; }
    .content p { margin-bottom:16px; }
    .content strong { color:white; }
    .content ul { padding-left:20px; margin-bottom:16px; }
    .content li { margin-bottom:8px; }
    .cta-section { margin-top:40px; text-align:center; }
    .cta { display:inline-block; background:#CBFF00; color:#0D2B1E; font-weight:900; font-size:18px; text-transform:uppercase; padding:16px 32px; border-radius:100px; text-decoration:none; letter-spacing:0.05em; }
    .divider { height:1px; background:rgba(255,255,255,0.1); margin:40px 0; }
    .footer { background:#060606; padding:24px 40px; }
    .footer-text { color:rgba(255,255,255,0.3); font-size:12px; }
    .tagline { font-size:14px; color:rgba(255,255,255,0.3); font-style:italic; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">ULTIMATE<br>CHICKEN™</div>
      <div style="font-size:13px; color:rgba(13,43,30,0.6); font-weight:600;">Real Food. Real Protein.</div>
    </div>
    <div class="body">
      <div class="content">${content}</div>
      <div class="divider"></div>
      <div class="cta-section">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ultimatechicken.in'}" class="cta">
          Join the Movement →
        </a>
      </div>
    </div>
    <div class="footer">
      <div class="footer-text">
        Ultimate Protein Foods LLP · BITS Pilani ·
        <a href="#" style="color:#CBFF00;">Unsubscribe</a>
      </div>
    </div>
  </div>
</body>
</html>
`
}

export async function sendWelcomeEmail(email: string, name?: string): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to: email,
      subject: "You're on the list 🔥 — Ultimate Chicken is coming to BITS",
      html: welcomeEmailHTML(name),
    })
  } catch (err) {
    console.error('Error sending welcome email:', err)
  }
}

export async function sendNewsletter(
  subscribers: string[],
  subject: string,
  htmlContent: string
): Promise<{ sent: number; failed: number }> {
  let sent = 0
  let failed = 0
  const fullHtml = newsletterEmailHTML(subject, htmlContent)

  // Send in batches of 50 to avoid rate limits
  const batchSize = 50
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize)
    const results = await Promise.allSettled(
      batch.map((email) =>
        getResend().emails.send({
          from: FROM,
          to: email,
          subject,
          html: fullHtml,
        })
      )
    )
    results.forEach((r) => {
      if (r.status === 'fulfilled') sent++
      else failed++
    })
    // Small delay between batches
    if (i + batchSize < subscribers.length) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  return { sent, failed }
}
