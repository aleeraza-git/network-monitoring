'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { Site } from '@/lib/store'

// ─── Sparkline component ──────────────────────────────────────────────────────
function Sparkline({ data, status }: { data: number[]; status: string }) {
  const w = 120, h = 32
  if (!data || data.length < 2) return <div style={{ width: w, height: h }} />

  const vals = data.slice(-40)
  const max = Math.max(...vals.filter(v => v > 0), 1)
  const min = 0

  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w
    const y = h - ((v - min) / (max - min)) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')

  const color = status === 'online' ? '#22c55e' : status === 'degraded' ? '#f59e0b' : '#ef4444'

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${status}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <polygon
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`url(#sg-${status})`}
      />
      {/* Line */}
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Uptime bar (24-hour blocks) ──────────────────────────────────────────────
function UptimeBar({ uptime, status }: { uptime: number; status: string }) {
  const blocks = 24
  const onlineCount = Math.round((uptime / 100) * blocks)
  return (
    <div className="flex gap-[2px] items-end">
      {Array.from({ length: blocks }).map((_, i) => {
        const isOn = i < onlineCount
        const color = !isOn
          ? 'bg-red-500/70'
          : status === 'degraded' && i === onlineCount - 1
          ? 'bg-amber-400/70'
          : 'bg-emerald-400/70'
        return (
          <div
            key={i}
            className={`w-[3px] rounded-sm ${color}`}
            style={{ height: `${8 + Math.random() * 6}px` }}
          />
        )
      })}
    </div>
  )
}

// ─── Loading screen ───────────────────────────────────────────────────────────
function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState('Initializing systems…')

  useEffect(() => {
    const phases = [
      { p: 20, t: 'Connecting to network nodes…' },
      { p: 45, t: 'Authenticating telemetry…' },
      { p: 70, t: 'Loading site data…' },
      { p: 90, t: 'Rendering dashboard…' },
      { p: 100, t: 'Ready.' },
    ]
    let i = 0
    const iv = setInterval(() => {
      if (i < phases.length) {
        setProgress(phases[i].p)
        setPhase(phases[i].t)
        i++
      } else {
        clearInterval(iv)
      }
    }, 320)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 grid-bg"
      style={{ background: 'var(--ig-dark)' }}>
      {/* Glow orb */}
      <div className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #c9a84c 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col items-center gap-8 animate-fadeIn">
        {/* Logo mark */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 animate-glow rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #c9a84c22, #c9a84c44)', border: '1px solid rgba(201,168,76,0.4)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: '#c9a84c' }}>IG</span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
              Imarat Group
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(201,168,76,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Network Status
            </div>
          </div>
        </div>

        {/* Spinner ring */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full animate-spin-slow"
            style={{ border: '2px solid transparent', borderTopColor: '#c9a84c', borderRightColor: 'rgba(201,168,76,0.3)' }} />
          <div className="absolute inset-2 rounded-full animate-spin-slow"
            style={{ border: '1px solid transparent', borderTopColor: 'rgba(201,168,76,0.5)', animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>

        {/* Progress bar */}
        <div className="w-64">
          <div className="h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #c9a84c, #e8c87a)' }}
            />
          </div>
          <div className="mt-3 text-center" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(201,168,76,0.6)' }}>
            {phase}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Live clock ───────────────────────────────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  const date = now.toLocaleDateString('en-PK', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
  const time = now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="text-right">
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: '#e2e8f0', letterSpacing: '0.05em' }}>{time}</div>
      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>{date}</div>
    </div>
  )
}

// ─── Status dot ───────────────────────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: '#22c55e',
    degraded: '#f59e0b',
    down: '#ef4444',
  }
  const c = colors[status] ?? '#64748b'
  return (
    <span className="relative inline-flex w-2.5 h-2.5">
      <span className="absolute inset-0 rounded-full dot-blink" style={{ background: c, opacity: 0.4, transform: 'scale(1.6)' }} />
      <span className="relative rounded-full w-full h-full" style={{ background: c }} />
    </span>
  )
}

// ─── Uptime chart (bar chart last 24h) ───────────────────────────────────────
function UptimeChart({ sites }: { sites: Site[] }) {
  // Simulated 24-hour bar data
  const bars = Array.from({ length: 48 }, (_, i) => {
    const totalOn = sites.filter(s => s.status === 'online').length
    const total = sites.length || 1
    const base = totalOn / total
    const noise = (Math.random() - 0.5) * 0.05
    return Math.max(0.7, Math.min(1, base + noise))
  })

  const avgUptime = sites.length
    ? sites.reduce((a, s) => a + s.uptime24h, 0) / sites.length
    : 100

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--ig-dark3)', border: '1px solid var(--ig-border)' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Overall Uptime</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#22c55e', letterSpacing: '-0.03em' }}>
            {avgUptime.toFixed(2)}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>(Last 24 Hours)</div>
        </div>
        <div className="text-right flex gap-4" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>
          {['10:00 AM', '02:00 PM', '06:00 PM', '10:00 PM', '02:00 AM', '06:00 AM', 'Now'].map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-[2px] h-12 relative overflow-hidden">
        {bars.map((v, i) => {
          const h = Math.round(v * 48)
          const color = v > 0.98 ? '#22c55e' : v > 0.9 ? '#f59e0b' : '#ef4444'
          return (
            <div
              key={i}
              className="flex-1 rounded-sm sparkline-bar"
              style={{ height: h, background: color, opacity: 0.85, animationDelay: `${i * 8}ms` }}
            />
          )
        })}
      </div>
      <div className="flex justify-between mt-2" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>
        <span>24 hours ago</span>
        <span>Now</span>
      </div>
    </div>
  )
}

// ─── Main public page ─────────────────────────────────────────────────────────
export default function StatusPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [showLoader, setShowLoader] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [showAll, setShowAll] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchSites = useCallback(async () => {
    try {
      const res = await fetch('/api/sites', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setSites(data)
        setLastUpdated(new Date())
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    // Show loader for 2s then fetch
    const t = setTimeout(async () => {
      await fetchSites()
      setLoading(false)
      setTimeout(() => setShowLoader(false), 400)
    }, 1800)

    // Poll every 5 seconds
    intervalRef.current = setInterval(fetchSites, 5000)

    return () => {
      clearTimeout(t)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchSites])

  const online = sites.filter(s => s.status === 'online').length
  const degraded = sites.filter(s => s.status === 'degraded').length
  const down = sites.filter(s => s.status === 'down').length
  const total = sites.length

  const allOperational = degraded === 0 && down === 0
  const displaySites = showAll ? sites : sites.slice(0, 8)

  return (
    <>
      {/* Loading screen */}
      {showLoader && (
        <div style={{ opacity: loading ? 1 : 0, transition: 'opacity 0.4s ease', pointerEvents: loading ? 'auto' : 'none' }}
          className="fixed inset-0 z-50">
          <LoadingScreen />
        </div>
      )}

      <div className="min-h-screen grid-bg" style={{ background: 'var(--ig-dark)', opacity: loading ? 0 : 1, transition: 'opacity 0.5s ease' }}>
        {/* Top gradient */}
        <div className="fixed top-0 left-0 right-0 h-1 z-10"
          style={{ background: 'linear-gradient(90deg, #c9a84c, #e8c87a, #c9a84c)' }} />

        {/* Header */}
        <header className="sticky top-1 z-10 backdrop-blur-xl"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.12)', background: 'rgba(10,15,30,0.85)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.4))', border: '1px solid rgba(201,168,76,0.4)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color: '#c9a84c' }}>IG</span>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: '#fff', letterSpacing: '-0.01em', lineHeight: 1 }}>
                  Imarat Group
                </div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(201,168,76,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Network Status
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                Last updated: {lastUpdated.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                <button onClick={fetchSites} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">↻</button>
              </div>
              <LiveClock />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn">

          {/* All Systems Banner */}
          <div className="mb-6 rounded-xl px-5 py-3 flex items-center gap-3"
            style={{
              background: allOperational ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
              border: `1px solid ${allOperational ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
            }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: allOperational ? '#22c55e' : '#f59e0b' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.85rem', color: allOperational ? '#4ade80' : '#fbbf24' }}>
              {allOperational ? 'All Systems Operational' : `${degraded + down} site${degraded + down !== 1 ? 's' : ''} with issues`}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
              {total} facilities monitored
            </span>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Online', value: online, icon: '✓', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
              { label: 'Degraded', value: degraded, icon: '⚡', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
              { label: 'Down', value: down, icon: '✕', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
              { label: 'Total Facilities', value: total, icon: '◎', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
            ].map(card => (
              <div key={card.label} className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: card.bg, border: `1px solid ${card.border}` }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: card.bg, border: `1px solid ${card.border}`, color: card.color }}>
                  {card.icon}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: card.color, lineHeight: 1, letterSpacing: '-0.03em' }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{card.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Layout: sidebar + main */}
          <div className="flex gap-5 flex-col lg:flex-row">

            {/* Sidebar — quick list */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="rounded-xl overflow-hidden" style={{ background: 'var(--ig-dark3)', border: '1px solid var(--ig-border)' }}>
                <div className="px-4 py-3 flex items-center justify-between"
                  style={{ borderBottom: '1px solid var(--ig-border)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {total} Facilities
                  </span>
                </div>
                <div className="divide-y divide-white/5">
                  {displaySites.map(site => (
                    <div key={site.id} className="site-row px-4 py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <StatusDot status={site.status} />
                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {site.name}
                        </span>
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        whiteSpace: 'nowrap',
                        color: site.status === 'down' ? '#ef4444' : site.status === 'degraded' ? '#f59e0b' : 'rgba(255,255,255,0.35)'
                      }}>
                        {site.status === 'down' ? 'Down' : site.pingMs ? `${site.pingMs} ms` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
                {!showAll && sites.length > 8 && (
                  <button
                    onClick={() => setShowAll(true)}
                    className="w-full py-3 text-center transition-all"
                    style={{
                      fontSize: '0.72rem', color: 'rgba(201,168,76,0.7)',
                      borderTop: '1px solid var(--ig-border)',
                      background: 'transparent',
                      cursor: 'pointer',
                    }}>
                    View all {total} facilities ↓
                  </button>
                )}
                {showAll && (
                  <button
                    onClick={() => setShowAll(false)}
                    className="w-full py-3 text-center"
                    style={{ fontSize: '0.72rem', color: 'rgba(201,168,76,0.7)', borderTop: '1px solid var(--ig-border)', background: 'transparent', cursor: 'pointer' }}>
                    Show less ↑
                  </button>
                )}
              </div>
            </div>

            {/* Main panel */}
            <div className="flex-1 min-w-0 flex flex-col gap-5">
              {/* Uptime chart */}
              <UptimeChart sites={sites} />

              {/* Facility table */}
              <div className="rounded-xl overflow-hidden" style={{ background: 'var(--ig-dark3)', border: '1px solid var(--ig-border)' }}>
                <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--ig-border)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                    Facility Status &amp; Live Monitoring
                  </span>
                </div>

                {/* Table header */}
                <div className="grid px-5 py-2.5"
                  style={{ gridTemplateColumns: '2fr 100px 120px 100px 140px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {['Facility', 'Status', 'Response Time', '24H Uptime', 'Live Graph (Last 1 Hour)'].map(h => (
                    <div key={h} style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>
                  ))}
                </div>

                {/* Rows */}
                <div>
                  {sites.map((site, idx) => (
                    <div
                      key={site.id}
                      className="site-row grid px-5 py-3 items-center"
                      style={{
                        gridTemplateColumns: '2fr 100px 120px 100px 140px',
                        borderBottom: idx < sites.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        animationDelay: `${idx * 30}ms`,
                      }}>
                      {/* Name */}
                      <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                        {site.name}
                      </div>

                      {/* Status badge */}
                      <div>
                        <span className={`status-${site.status} inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md`}
                          style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                          <span className="w-1.5 h-1.5 rounded-full"
                            style={{ background: site.status === 'online' ? '#22c55e' : site.status === 'degraded' ? '#f59e0b' : '#ef4444' }} />
                          {site.status === 'online' ? 'Online' : site.status === 'degraded' ? 'Degraded' : 'Down'}
                        </span>
                      </div>

                      {/* Response time */}
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        color: site.status === 'down' ? '#ef4444' : site.status === 'degraded' ? '#f59e0b' : '#4ade80',
                        fontWeight: 500,
                      }}>
                        {site.status === 'down' ? '—' : site.pingMs ? `${site.pingMs} ms` : '—'}
                      </div>

                      {/* Uptime */}
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        color: site.uptime24h >= 99 ? '#4ade80' : site.uptime24h >= 80 ? '#fbbf24' : '#f87171',
                        fontWeight: 500,
                      }}>
                        {site.status === 'down' ? '0%' : `${site.uptime24h.toFixed(2)}%`}
                      </div>

                      {/* Sparkline */}
                      <div>
                        <Sparkline data={site.history} status={site.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-10 pb-6 flex items-center justify-between flex-wrap gap-3">
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>
              © {new Date().getFullYear()} Imarat Group of Companies. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <a href="/admin" style={{ fontSize: '0.7rem', color: 'rgba(201,168,76,0.5)', textDecoration: 'none' }}
                className="hover:text-amber-400 transition-colors">
                Admin Portal
              </a>
            </div>
          </footer>
        </main>
      </div>
    </>
  )
}
