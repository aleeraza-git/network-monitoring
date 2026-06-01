'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [showPass, setShowPass] = useState(false)

  useEffect(function() {
    fetch('/api/auth/me').then(function(r) {
      if (r.ok) router.replace('/admin')
      else setChecking(false)
    }).catch(function() { setChecking(false) })
  }, [router])

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim().toLowerCase(), password }) })
      if (r.ok) router.push('/admin')
      else { const d = await r.json(); setError(d.error || 'Invalid credentials') }
    } catch(e) { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="anim-spin" style={{ width: 28, height: 28, border: '3px solid var(--border2)', borderTopColor: 'var(--gold)', borderRadius: '50%' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 60% 40%, #fffdf5 0%, #f5f0e0 60%, #eeeade 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '10%', right: '8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,163,74,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(184,134,11,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #c9a84c, #e8c060, #c9a84c, transparent)', zIndex: 10 }} />
      <div className="anim-scaleIn" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 24, padding: '40px 36px', boxShadow: '0 24px 80px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div className="anim-float" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #c9a84c, #e8c060)', boxShadow: '0 8px 28px rgba(201,168,76,0.35)', marginBottom: 16 }}>
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><path d="M3 24L15 5L27 24H3Z" fill="white" fillOpacity="0.95" /><path d="M8 24L15 12L22 24H8Z" fill="rgba(201,168,76,0.5)" /></svg>
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.35rem', color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 5 }}>Imarat Group</div>
            <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--text3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Administrator Portal</div>
          </div>
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--gold2), transparent)', marginBottom: 28 }} />
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="mono" style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>Email Address</label>
              <input type="email" value={email} onChange={function(e) { setEmail(e.target.value) }} placeholder="admin@imarat.com.pk" required className="inp" style={{ padding: '11px 14px', fontSize: '0.88rem' }} />
            </div>
            <div>
              <label className="mono" style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={function(e) { setPassword(e.target.value) }} placeholder="Enter your password" required className="inp" style={{ padding: '11px 42px 11px 14px', fontSize: '0.88rem' }} />
                <button type="button" onClick={function() { setShowPass(!showPass) }} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 4, display: 'flex' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    {showPass ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                  </svg>
                </button>
              </div>
            </div>
            {error && (
              <div style={{ background: 'var(--red2)', border: '1px solid var(--red3)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" fill="none" stroke="var(--red)" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                <span style={{ fontSize: '0.8rem', color: 'var(--red)', fontWeight: 500 }}>{error}</span>
              </div>
            )}
            <button type="submit" disabled={loading} className="btn btn-gold" style={{ padding: '13px', fontSize: '0.9rem', borderRadius: 12, marginTop: 4 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="anim-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
                  Signing in...
                </span>
              ) : 'Sign In to Admin Panel'}
            </button>
          </form>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="/" className="mono" style={{ fontSize: '0.68rem', color: 'var(--text3)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Status Page
            </a>
            <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text4)' }}>Secure Session</span>
          </div>
        </div>
      </div>
    </div>
  )
}
