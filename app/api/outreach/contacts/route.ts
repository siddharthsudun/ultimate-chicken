import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'outreach', 'contacts_web.json')

export interface Contact {
  id: string
  name: string
  email: string
  company: string
  role: string
  category: 'VC' | 'QSR' | 'DISTRIBUTOR' | 'QUICKCOMMERCE'
  city: string
  notes: string
  bitsian: boolean
  status: 'new' | 'drafted' | 'sent'
  draft?: { subject: string; body: string }
  sentAt?: string
}

function load(): Contact[] {
  if (!fs.existsSync(DATA_FILE)) return []
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) } catch { return [] }
}

function save(contacts: Contact[]) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(contacts, null, 2))
}

export async function GET() {
  return NextResponse.json(load())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const contacts = load()

  if (body.action === 'add') {
    const contact: Contact = {
      id: Date.now().toString(),
      name: body.name,
      email: body.email,
      company: body.company,
      role: body.role,
      category: body.category,
      city: body.city || 'Hyderabad',
      notes: body.notes || '',
      bitsian: body.bitsian || false,
      status: 'new',
    }
    contacts.push(contact)
    save(contacts)
    return NextResponse.json(contact)
  }

  if (body.action === 'update') {
    const idx = contacts.findIndex(c => c.id === body.id)
    if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 })
    contacts[idx] = { ...contacts[idx], ...body.data }
    save(contacts)
    return NextResponse.json(contacts[idx])
  }

  if (body.action === 'delete') {
    const filtered = contacts.filter(c => c.id !== body.id)
    save(filtered)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
