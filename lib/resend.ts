import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import { escapeHtml } from '@/lib/security'

// Prefer Gmail (founders@ via App Password) when configured; fall back to Resend.
let gmailTransport: nodemailer.Transporter | null = null
function getGmail() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) return null
  if (!gmailTransport) {
    gmailTransport = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
  }
  return gmailTransport
}

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

export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  bcc?: string | string[]
): Promise<void> {
  const gmail = getGmail()
  try {
    if (gmail) {
      await gmail.sendMail({
        from: `Ultimate Chicken <${process.env.GMAIL_USER}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
        subject,
        html,
      })
    } else {
      await getResend().emails.send({ from: FROM, to, bcc, subject, html })
    }
  } catch (err) {
    console.error('Error sending email:', err)
  }
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://ultimatechicken.in'

// Everyone BCC'd on every order/subscription email (kept in the loop).
// Set ORDER_NOTIFY_EMAILS (comma-separated) in env; keep personal addresses out of git.
export const ORDER_NOTIFY = (process.env.ORDER_NOTIFY_EMAILS || 'founders@ultimatechicken.in')
  .split(',')
  .map((a) => a.trim())
  .filter(Boolean)
/** BCC list for an order email — everyone in ORDER_NOTIFY except the recipient. */
export function orderBcc(to: string): string[] | undefined {
  const list = ORDER_NOTIFY.filter((a) => a !== to)
  return list.length ? list : undefined
}

/** Shared branded order-email template. Pass pre-rendered item + totals table rows. */
export function orderEmailHTML(raw: {
  ref: string
  method: string
  itemsHtml: string
  totalsHtml: string
  customer: { name: string; phone: string; email: string; address: string }
  cta?: { label: string; url: string; note?: string }
}): string {
  // Escape every user-derived field. itemsHtml/totalsHtml are built by callers
  // from our own catalog + escaped coupon, so they're passed through as markup.
  const v = {
    ref: escapeHtml(raw.ref),
    method: escapeHtml(raw.method),
    itemsHtml: raw.itemsHtml,
    totalsHtml: raw.totalsHtml,
    customer: {
      name: escapeHtml(raw.customer.name),
      phone: escapeHtml(raw.customer.phone),
      email: escapeHtml(raw.customer.email),
      address: escapeHtml(raw.customer.address),
    },
  }
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F3EA;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#F4F3EA;">
    <!-- header -->
    <div style="background:#0C2419;padding:32px 40px;text-align:center;">
      <img src="${SITE}/uc-logo.png" alt="Ultimate Chicken" width="240" style="height:auto;width:240px;max-width:70%;display:inline-block;">
    </div>
    <!-- hero strip -->
    <div style="background:#CBF512;padding:22px 40px;text-align:center;">
      <div style="font-family:'Barlow Condensed',Arial,sans-serif;font-weight:900;font-size:30px;color:#0C2419;text-transform:uppercase;letter-spacing:-0.01em;">Order confirmed 🎉</div>
    </div>
    <!-- body -->
    <div style="padding:32px 40px;color:#0C2419;">
      <p style="margin:0 0 4px;font-size:14px;color:#234539;">Order reference</p>
      <p style="margin:0 0 20px;font-size:18px;font-weight:bold;">${v.ref}</p>
      <table style="width:100%;border-collapse:collapse;font-size:15px;">
        <tr><td colspan="2" style="padding:0 0 8px;font-size:13px;color:#234539;text-transform:uppercase;letter-spacing:0.08em;">Items</td></tr>
        ${v.itemsHtml}
        <tr><td colspan="2" style="padding:10px 0;"><div style="border-top:1px dashed #c9c8be;"></div></td></tr>
        ${v.totalsHtml}
      </table>

      <div style="margin-top:24px;background:#fff;border:1px solid #e6e5dc;border-radius:14px;padding:18px 20px;">
        <p style="margin:0 0 8px;font-size:13px;color:#234539;text-transform:uppercase;letter-spacing:0.08em;">Payment</p>
        <p style="margin:0;font-size:16px;font-weight:bold;">${v.method}</p>
      </div>

      <div style="margin-top:14px;background:#fff;border:1px solid #e6e5dc;border-radius:14px;padding:18px 20px;">
        <p style="margin:0 0 8px;font-size:13px;color:#234539;text-transform:uppercase;letter-spacing:0.08em;">Deliver to</p>
        <p style="margin:0;font-size:16px;font-weight:bold;">${v.customer.name}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#444;">${v.customer.phone}${v.customer.email ? ' · ' + v.customer.email : ''}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#444;line-height:1.5;">${v.customer.address}</p>
      </div>
      ${raw.cta ? `
      <div style="margin-top:24px;text-align:center;">
        <a href="${raw.cta.url}" style="display:inline-block;background:#0C2419;color:#CBF512;font-family:'Barlow Condensed',Arial,sans-serif;font-weight:900;font-size:18px;text-transform:uppercase;letter-spacing:0.03em;padding:16px 32px;border-radius:100px;text-decoration:none;">${escapeHtml(raw.cta.label)}</a>
        ${raw.cta.note ? `<p style="margin:12px 0 0;font-size:13px;color:#234539;">${escapeHtml(raw.cta.note)}</p>` : ''}
      </div>` : ''}
    </div>
    <!-- footer -->
    <div style="background:#0C2419;padding:24px 40px;text-align:center;">
      <p style="margin:0;color:#CBF512;font-family:'Barlow Condensed',Arial,sans-serif;font-weight:800;font-size:16px;text-transform:uppercase;letter-spacing:0.05em;">Real Food. Real Protein.</p>
      <p style="margin:8px 0 0;color:rgba(244,243,234,0.5);font-size:12px;">Ultimate Chicken · <a href="${SITE}" style="color:rgba(244,243,234,0.7);">ultimatechicken.in</a></p>
    </div>
  </div>
</body></html>`
}

export type OrderEmail = {
  ref: string
  method: string
  items: { name: string; qty: number; price: number }[]
  subtotal: number
  discount: number
  shipping: number
  codFee?: number
  total: number
  coupon?: string | null
  customer: { name: string; phone: string; email: string; address: string }
}

export async function sendOrderEmail(o: OrderEmail): Promise<void> {
  const itemsHtml = o.items
    .map((i) => `<tr><td style="padding:5px 0;">${Number(i.qty)}× ${escapeHtml(i.name)}</td><td align="right" style="padding:5px 0;">₹${Number(i.price * i.qty)}</td></tr>`)
    .join('')
  const totalsHtml = `
    <tr><td style="padding:3px 0;color:#555;">Subtotal</td><td align="right" style="padding:3px 0;">₹${Number(o.subtotal)}</td></tr>
    ${o.discount > 0 ? `<tr><td style="padding:3px 0;color:#555;">Coupon ${escapeHtml(o.coupon || '')}</td><td align="right" style="padding:3px 0;color:#2e7d32;">−₹${Number(o.discount)}</td></tr>` : ''}
    <tr><td style="padding:3px 0;color:#555;">Shipping</td><td align="right" style="padding:3px 0;">${o.shipping === 0 ? 'Free' : '₹' + o.shipping}</td></tr>
    ${o.codFee ? `<tr><td style="padding:3px 0;color:#555;">COD fee</td><td align="right" style="padding:3px 0;">₹${o.codFee}</td></tr>` : ''}
    <tr><td style="padding:10px 0 0;font-weight:bold;font-size:19px;">Total</td><td align="right" style="padding:10px 0 0;font-weight:bold;font-size:19px;">₹${o.total}</td></tr>`
  const html = orderEmailHTML({ ref: o.ref, method: o.method, itemsHtml, totalsHtml, customer: o.customer })
  const to = o.customer.email || ORDER_NOTIFY[0]
  await sendEmail(to, `Order ${o.ref} · ₹${o.total} · ${o.method}`, html, orderBcc(to))
}

/** Pre-delivery reminder for a weekly subscriber. `when` controls the copy:
 *  'soon' (a few days out — nudge to pause if travelling) or 'tomorrow' (final heads-up). */
export async function sendSubscriptionReminder(o: {
  to: string
  name: string
  deliveryDay: string
  deliverySlot?: string
  items?: string
  weekly?: number | string | null
  manageUrl: string
  when: 'soon' | 'tomorrow'
}): Promise<void> {
  const first = (o.name || '').split(' ')[0]
  const hero = o.when === 'tomorrow' ? 'Delivery tomorrow 🐔' : `Delivery this ${escapeHtml(o.deliveryDay)} 🐔`
  const lead = o.when === 'tomorrow'
    ? `Quick heads-up — your weekly Ultimate Chicken box arrives <b>tomorrow (${escapeHtml(o.deliveryDay)})</b>${o.deliverySlot ? `, ${escapeHtml(o.deliverySlot)}` : ''}.`
    : `Your next weekly box is scheduled for <b>${escapeHtml(o.deliveryDay)}</b>${o.deliverySlot ? `, ${escapeHtml(o.deliverySlot)}` : ''}. Travelling this week? You can pause it now — no charge while paused.`
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F3EA;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#F4F3EA;">
    <div style="background:#0C2419;padding:32px 40px;text-align:center;">
      <img src="${SITE}/uc-logo.png" alt="Ultimate Chicken" width="240" style="height:auto;width:240px;max-width:70%;display:inline-block;">
    </div>
    <div style="background:#CBF512;padding:22px 40px;text-align:center;">
      <div style="font-family:'Barlow Condensed',Arial,sans-serif;font-weight:900;font-size:30px;color:#0C2419;text-transform:uppercase;letter-spacing:-0.01em;">${hero}</div>
    </div>
    <div style="padding:32px 40px;color:#0C2419;">
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${first ? `Hi ${escapeHtml(first)}, ` : ''}${lead}</p>
      ${o.items ? `<div style="background:#fff;border:1px solid #e6e5dc;border-radius:14px;padding:18px 20px;">
        <p style="margin:0 0 8px;font-size:13px;color:#234539;text-transform:uppercase;letter-spacing:0.08em;">Your weekly box</p>
        <p style="margin:0;font-size:16px;font-weight:bold;">${escapeHtml(o.items)}</p>
        ${o.weekly ? `<p style="margin:6px 0 0;font-size:14px;color:#444;">₹${escapeHtml(String(o.weekly).replace(/[^\d]/g, ''))} / week</p>` : ''}
      </div>` : ''}
      <div style="margin-top:24px;text-align:center;">
        <a href="${o.manageUrl}" style="display:inline-block;background:#0C2419;color:#CBF512;font-family:'Barlow Condensed',Arial,sans-serif;font-weight:900;font-size:18px;text-transform:uppercase;letter-spacing:0.03em;padding:16px 32px;border-radius:100px;text-decoration:none;">Manage or pause subscription</a>
        <p style="margin:12px 0 0;font-size:13px;color:#234539;">Pause anytime — no deliveries or charges while paused. Resume when you&apos;re back.</p>
      </div>
    </div>
    <div style="background:#0C2419;padding:24px 40px;text-align:center;">
      <p style="margin:0;color:#CBF512;font-family:'Barlow Condensed',Arial,sans-serif;font-weight:800;font-size:16px;text-transform:uppercase;letter-spacing:0.05em;">Real Food. Real Protein.</p>
      <p style="margin:8px 0 0;color:rgba(244,243,234,0.5);font-size:12px;">Ultimate Chicken · <a href="${SITE}" style="color:rgba(244,243,234,0.7);">ultimatechicken.in</a></p>
    </div>
  </div>
</body></html>`
  const subject = o.when === 'tomorrow'
    ? `Reminder: your Ultimate Chicken box arrives tomorrow`
    : `Your Ultimate Chicken box is coming this ${o.deliveryDay}`
  await sendEmail(o.to, subject, html, orderBcc(o.to))
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
