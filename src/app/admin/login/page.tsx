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
  const [showPass, setShowPass] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (r.ok) router.replace('/admin')
      else setChecking(false)
    }).catch(() => setChecking(false))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      if (r.ok) router.push('/admin')
      else {
        const d = await r.json()
        setError(d.error ?? 'Authentication failed')
      }
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="w-8 h-8 rounded-full animate-spin-fast"
        style={{ border: '2px solid var(--border-dim)', borderTopColor: 'var(--accent-cyan)' }} />
    </div>
  )

  return (
    <div className="min-h-screen dot-grid flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}>
      {/* Ambient blobs */}
      <div className="absolute pointer-events-none" style={{
        top: '20%', left: '15%', width: 500, height: 500,
        background: 'radial-gradient(circle,rgba(0,212,255,0.05) 0%,transparent 70%)',
        filter: 'blur(60px)' }} />
      <div className="absolute pointer-events-none" style={{
        bottom: '20%', right: '15%', width: 400, height: 400,
        background: 'radial-gradient(circle,rgba(0,255,136,0.04) 0%,transparent 70%)',
        filter: 'blur(60px)' }} />

      {/* Top accent */}
      <div className="top-accent fixed top-0 left-0 right-0" style={{ height: 2 }} />

      <div className="relative w-full max-w-md animate-fadeUp">
        {/* Card */}
        <div className="glass-elevated rounded-2xl p-8 relative overflow-hidden"
          style={{ border: '1px solid var(--border-med)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
          {/* Inner glow */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{ background: 'radial-gradient(ellipse at 50% 0%,rgba(0,212,255,0.05),transparent 60%)' }} />

          <div className="relative z-10">
            {/* Logo + brand */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg,rgba(0,212,255,0.12),rgba(0,255,136,0.06))',
                  border: '1px solid rgba(0,212,255,0.3)',
                  boxShadow: '0 0 40px rgba(0,212,255,0.12), inset 0 1px 0 rgba(0,212,255,0.2)' }}>
                <span style={{ fontFamily: 'Geist,sans-serif', fontWeight: 900, fontSize: '1.5rem', color: 'var(--accent-cyan)' }}>IG</span>
              </div>
              <h1 style={{ fontFamily: 'Geist,sans-serif', fontWeight: 800, fontSize: '1.35rem',
                letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
                Network Admin
              </h1>
              <p className="font-mono text-center" style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)',
                letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Imarat Group Operations Center
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email field */}
              <div>
                <label className="font-mono" style={{ display: 'block', fontSize: '0.62rem',
                  color: focused === 'email' ? 'var(--accent-cyan)' : 'var(--text-tertiary)',
                  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
                  transition: 'color 0.2s' }}>
                  Email Address
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  placeholder="admin@imarat.com.pk" required
                  className="input-field w-full px-4 py-3 rounded-xl"
                  style={{ fontSize: '0.88rem' }}
                />
              </div>

              {/* Password field */}
              <div>
                <label className="font-mono" style={{ display: 'block', fontSize: '0.62rem',
                  color: focused === 'pass' ? 'var(--accent-cyan)' : 'var(--text-tertiary)',
                  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
                  transition: 'color 0.2s' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)}
                    placeholder="••••••••••" required
                    className="input-field w-full px-4 py-3 rounded-xl pr-12"
                    style={{ fontSize: '0.88rem' }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-tertiary)', fontSize: '0.8rem', padding: '4px' }}>
                    {showPass ? '◉' : '◎'}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <span style={{ color: '#ef4444', fontSize: '1rem' }}>✕</span>
                  <span style={{ fontSize: '0.8rem', color: '#f87171' }}>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3.5 rounded-xl cursor-pointer mt-1"
                style={{ fontSize: '0.9rem', fontFamily: 'Geist,sans-serif', letterSpacing: '-0.01em',
                  opacity: loading ? 0.7 : 1 }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-4 h-4 rounded-full animate-spin-fast"
                      style={{ border: '2px solid rgba(0,0,0,0.2)', borderTopColor: 'rgba(0,0,0,0.8)' }} />
                    Authenticating…
                  </span>
                ) : 'Sign In →'}
              </button>
            </form>

            <div className="mt-6 pt-5 flex justify-between items-center"
              style={{ borderTop: '1px solid var(--border-dim)' }}>
              <a href="/" className="font-mono transition-colors"
                style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', textDecoration: 'none' }}>
                ← Status Page
              </a>
              <span className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>
                Secure Session
              </span>
            </div>
          </div>
        </div>

        {/* Below card hint */}
        <div className="mt-4 text-center font-mono" style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>
          Protected by HTTP-only JWT · 8h session
        </div>
      </div>
    </div>
  )
}
