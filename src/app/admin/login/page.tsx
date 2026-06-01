'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // Redirect if already logged in
  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (r.ok) router.replace('/admin')
      else setChecking(false)
    }).catch(() => setChecking(false))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      if (res.ok) {
        router.push('/admin')
      } else {
        const data = await res.json()
        setError(data.error ?? 'Login failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ig-dark)' }}>
        <div className="w-8 h-8 rounded-full animate-spin-slow" style={{ border: '2px solid transparent', borderTopColor: '#c9a84c' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-4" style={{ background: 'var(--ig-dark)' }}>
      {/* Background glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #c9a84c, transparent)' }} />

      <div className="relative w-full max-w-md animate-slideUp">
        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: 'var(--ig-dark3)', border: '1px solid rgba(201,168,76,0.15)' }}>
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.3))', border: '1px solid rgba(201,168,76,0.4)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: '#c9a84c' }}>IG</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
              Admin Portal
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Imarat Group Network Management
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@imarat.com.pk"
                required
                className="focus-ring w-full px-4 py-3 rounded-xl text-white placeholder-white/20 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="focus-ring w-full px-4 py-3 rounded-xl text-white placeholder-white/20 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.8rem', color: '#f87171' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold transition-all"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.9rem',
                background: loading ? 'rgba(201,168,76,0.3)' : 'linear-gradient(135deg, #c9a84c, #e8c87a)',
                color: loading ? 'rgba(255,255,255,0.5)' : '#0a0f1e',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.02em',
              }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 pt-5 flex justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <a href="/" style={{ fontSize: '0.72rem', color: 'rgba(201,168,76,0.5)', textDecoration: 'none' }}
              className="hover:text-amber-400 transition-colors">
              ← Back to Status Page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
