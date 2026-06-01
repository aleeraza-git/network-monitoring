import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, ADMIN_PASSWORD, signToken, COOKIE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { email, password } = body as { email?: string; password?: string }

  if (email?.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await signToken(email)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })
  return res
}
