import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'imarat-nms-secret-key-change-in-production-32chars'
)
const COOKIE = 'imarat_admin_token'

// Single hardcoded admin — add DB layer if needed
export const ADMIN_EMAIL = 'ali.raza@imarat.com.pk'
export const ADMIN_PASSWORD = 'Pakistan@2005'

export async function signToken(email: string): Promise<string> {
  return new SignJWT({ email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<{ email: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as { email: string; role: string }
  } catch {
    return null
  }
}

export async function getSession(): Promise<{ email: string; role: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

export { COOKIE }
