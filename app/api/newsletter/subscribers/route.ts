import { NextRequest, NextResponse } from 'next/server'
import { getAllSubscribers, getSubscriberCount } from '@/lib/contacts'

function checkAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return false
  return authHeader.replace('Bearer ', '') === process.env.DASHBOARD_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [subscribers, count] = await Promise.all([
      getAllSubscribers(),
      getSubscriberCount(),
    ])
    return NextResponse.json({ subscribers, count })
  } catch (err) {
    console.error('Subscribers fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }
}
