import { NextRequest, NextResponse } from 'next/server'
import { getSites, addSite, tickSites } from '@/lib/store'
import { getSession } from '@/lib/auth'

// GET /api/sites — public, returns all sites + ticks random jitter
export async function GET() {
  tickSites()
  const sites = getSites()
  return NextResponse.json(sites, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

// POST /api/sites — admin only, add new site
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { name, location, notes } = body as { name?: string; location?: string; notes?: string }
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const site = addSite({ name: name.trim(), location, notes })
  return NextResponse.json(site, { status: 201 })
}
