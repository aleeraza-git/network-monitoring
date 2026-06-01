import { NextRequest, NextResponse } from 'next/server'
import { updateSite, deleteSite, getSiteById } from '@/lib/store'
import { getSession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const updated = updateSite(id, body)
  if (!updated) return NextResponse.json({ error: 'Site not found' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ok = deleteSite(id)
  if (!ok) return NextResponse.json({ error: 'Site not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const site = getSiteById(id)
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(site)
}
