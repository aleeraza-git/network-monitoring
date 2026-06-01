'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import type { Site } from '@/lib/store'

function Sparkline({ data, status, idx }: { data: number[]; status: string; idx: number }) {
  const W = 110, H = 28
  const vals = (data || []).slice(-40)
  if (vals.length < 2) return <div style={{ width: W, height: H }} />
  const max = Math.max(...vals.filter(function(v) { return v > 0 }), 1)
  const color = status === 'online' ? '#10b981' : status === 'degraded' ? '#f59e0b' : '#ef4444'
  const pts = vals.map(function(v, i) {
    return ((i / (vals.length - 1)) * W).toFixed(2) + ',' + (H - (v / max) * (H - 4) - 2).toFixed(2)
  }).join(' ')
  const gid = 'sg-' + idx + '-' + status
  return (
    <svg width={W} height={H} viewBox={'0 0 ' + W + ' ' + H}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={'0,' + H + ' ' + pts + ' ' + W + ',' + H} fill={'url(#' + gid + ')'} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function StatusDot({ status, size }: { status: string; size?: number }) {
  const sz = size || 8
  const col = status === 'online' ? '#10b981' : status === 'degraded' ? '#f59e0b' : '#ef4444'
  return (
    <span className="relative inline-flex items-center justify-center flex-shrink-0" style={{ width: sz, height: sz }}>
      {status !== 'down' && (
        <span className="absolute rounded-full animate-ping"
          style={{ width: sz * 2.2, height: sz * 2.2, background: col, opacity: 0.18, animationDuration: '2s' }} />
      )}
      <span className="relative rounded-full" style={{ width: sz, height: sz, background: col }} />
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const label = status === 'online' ? 'Online' : status === 'degraded' ? 'Degraded' : 'Down'
  const cls = status === 'online' ? 'badge-online' : status === 'degraded' ? 'badge-degraded' : 'badge-down'
  return (
    <span className={cls + ' inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono'}
      style={{ fontSize: '0.68rem', fontWeight: 600 }}>
      <StatusDot status={status} size={5} />
      {label}
    </span>
  )
}

function UptimeBlocks({ uptime, status }: { uptime: number; status: string }) {
  const total = 30
  const on = Math.round((uptime / 100) * total)
  const heights = [60,72,58,80,65,75,55,70,62,78,68,72,60,74,58,80,66,70,62,76,64,72,58,78,68,74,60,76,62,70]
  return (
    <div className="flex gap-[2px] items-end" style={{ height: 18 }}>
      {Array.from({ length: total }).map(function(_, i) {
        const isOn = i < on
        const bg = !isOn ? 'rgba(239,68,68,0.45)' : status === 'degraded' && i >= on - 3 ? 'rgba(245,158,11,0.65)' : 'rgba(16,185,129,0.6)'
        return <div key={i} className="uptime-segment flex-1 rounded-sm" style={{ height: (heights[i] || 65) + '%', background: bg }} />
      })}
    </div>
  )
}

function MacroChart({ sites }: { sites: Site[] }) {
  const barH = [82,90,78,95,88,92,75,98,85,91,79,94,87,93,76,99,83,89,77,96,86,90,80,97,84,92,78,95,83,91,77,98,85,89,79,94,88,93,76,100,82,90,78,95,87,91,75,98]
  const avg = sites.length ? sites.reduce(function(a, s) { return a + s.uptime24h }, 0) / sites.length : 100
  const ratio = sites.length ? sites.filter(function(s) { return s.status === 'online' }).length / sites.length : 1
  const times = ['12 AM','3 AM','6 AM','9 AM','12 PM','3 PM','6 PM','9 PM','Now']
  const avgColor = avg >= 99 ? '#10b981' : avg >= 90 ? '#f59e0b' : '#ef4444'
  return (
    <div className="glass rounded-xl p-5 scan-effect">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="font-mono mb-2" style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Overall Uptime - Last 24 Hours
          </p>
          <div className="flex items-baseline gap-3">
            <span style={{ fontFamily: 'Geist,sans-serif', fontSize: '2.6rem', fontWeight: 800, color: avgColor, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {avg.toFixed(2)}%
            </span>
            <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              {sites.filter(function(s) { return s.status === 'online' }).length}/{sites.length} nominal
            </span>
          </div>
        </div>
        <div className="flex gap-4 mt-1">
          {[['#10b981','Operational'],['#f59e0b','Degraded'],['#ef4444','Outage']].map(function(item) {
            return (
              <div key={String(item[1])} className="flex items-center gap-1.5 font-mono" style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>
                <div className="w-2 h-2 rounded-sm" style={{ background: String(item[0]) }} />{item[1]}
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex items-end gap-[2px]" style={{ height: 52 }}>
        {barH.map(function(h, i) {
          const v = ratio * (h / 100)
          const col = v > 0.95 ? 'rgba(16,185,129,0.7)' : v > 0.8 ? 'rgba(245,158,11,0.65)' : 'rgba(239,68,68,0.6)'
          return <div key={i} className="flex-1 rounded-sm" style={{ height: (Math.round(v * 52) || 4), background: col }} />
        })}
      </div>
      <div className="flex justify-between mt-2">
        {times.map(function(t) {
          return <span key={t} className="font-mono" style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)' }}>{t}</span>
        })}
      </div>
    </div>
  )
}

function BootScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [lines, setLines] = useState<string[]>([])
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  const LINES = [
    '[ SYS ] Imarat Group Network Operations Center v2.1',
    '[ OK  ] Kernel modules loaded successfully',
    '[ OK  ] Cryptographic certificates verified',
    '[ OK  ] Establishing secure channel to 29 nodes...',
    '[ OK  ] ICMP telemetry pipeline active',
    '[ OK  ] Real-time monitoring engine started',
    '[ OK  ] Dashboard render complete - welcome',
  ]
  useEffect(function() {
    let i = 0
    const iv = setInterval(function() {
      if (i < LINES.length) {
        const line = LINES[i]
        setLines(function(p) { return p.concat([line]) })
        setProgress(Math.round(((i + 1) / LINES.length) * 100))
        i++
      } else {
        clearInterval(iv)
        setTimeout(function() { doneRef.current() }, 500)
      }
    }, 260)
    return function() { clearInterval(iv) }
  }, [])
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center dot-grid" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,212,255,0.05) 0%, transparent 70%)' }} />
      <div className="relative z-10 w-full max-w-lg px-8 animate-fadeIn">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-breathe"
            style={{ background: 'linear-gradient(135deg,rgba(0,212,255,0.12),rgba(0,255,136,0.06))', border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 0 40px rgba(0,212,255,0.15)' }}>
            <span style={{ fontFamily: 'Geist,sans-serif', fontWeight: 900, fontSize: '1.5rem', color: 'var(--accent-cyan)' }}>IG</span>
          </div>
          <div>
            <div style={{ fontFamily: 'Geist,sans-serif', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.03em', color: '#fff', lineHeight: 1 }}>Imarat Group</div>
            <div className="font-mono mt-1" style={{ fontSize: '0.62rem', color: 'var(--accent-cyan)', opacity: 0.65, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Network Operations Center</div>
          </div>
        </div>
        <div className="mb-6 rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,212,255,0.1)', minHeight: 168 }}>
          {lines.map(function(l, i) {
            const lc = l.startsWith('[ OK') ? 'rgba(0,255,136,0.7)' : l.startsWith('[ SYS') ? 'rgba(0,212,255,0.8)' : 'rgba(0,212,255,0.45)'
            return <div key={i} className="boot-line font-mono" style={{ fontSize: '0.67rem', lineHeight: 1.9, color: lc }}>{l}</div>
          })}
          {lines.length < LINES.length && <span className="font-mono animate-pulse" style={{ fontSize: '0.67rem', color: 'rgba(0,212,255,0.4)' }}>&#9608;</span>}
        </div>
        <div className="h-[2px] rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: progress + '%', background: 'linear-gradient(90deg,#00d4ff,#00ff88)' }} />
        </div>
        <div className="flex justify-between font-mono" style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>
          <span>BOOT SEQUENCE</span>
          <span style={{ color: 'var(--accent-cyan)', opacity: 0.7 }}>{progress}%</span>
        </div>
      </div>
    </div>
  )
}

function LiveClock() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  useEffect(function() {
    function update() {
      const now = new Date()
      const p = function(n: number) { return String(n).padStart(2, '0') }
      setTime(p(now.getHours()) + ':' + p(now.getMinutes()) + ':' + p(now.getSeconds()))
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      setDate(days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear())
    }
    update()
    const iv = setInterval(update, 1000)
    return function() { clearInterval(iv) }
  }, [])
  if (!time) return <div style={{ width: 140, height: 36 }} />
  return (
    <div className="text-right">
      <div className="font-mono" style={{ fontSize: '1.05rem', color: 'var(--text-primary)', letterSpacing: '0.05em', lineHeight: 1 }}>{time}</div>
      <div className="font-mono mt-0.5" style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>{date}</div>
    </div>
  )
}

export default function StatusPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [booted, setBooted] = useState(false)
  const [showBoot, setShowBoot] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('')
  const [showAll, setShowAll] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchSites = useCallback(async function() {
    try {
      const r = await fetch('/api/sites', { cache: 'no-store' })
      if (r.ok) {
        setSites(await r.json())
        const now = new Date()
        const p = function(n: number) { return String(n).padStart(2, '0') }
        setLastUpdated(p(now.getHours()) + ':' + p(now.getMinutes()) + ':' + p(now.getSeconds()))
      }
    } catch(e) { /* silent */ }
  }, [])

  const handleBootDone = useCallback(function() {
    fetchSites().then(function() {
      setBooted(true)
      setTimeout(function() { setShowBoot(false) }, 500)
      timerRef.current = setInterval(fetchSites, 5000)
    })
  }, [fetchSites])

  useEffect(function() {
    return function() { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const online = sites.filter(function(s) { return s.status === 'online' }).length
  const degraded = sites.filter(function(s) { return s.status === 'degraded' }).length
  const down = sites.filter(function(s) { return s.status === 'down' }).length
  const allOK = degraded === 0 && down === 0
  const displaySites = showAll ? sites : sites.slice(0, 10)

  const statCards = [
    { label: 'Online',      value: online,       color: '#10b981', glow: 'stat-glow-green', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.14)', icon: '+', sub: 'nominal' },
    { label: 'Degraded',    value: degraded,     color: '#f59e0b', glow: 'stat-glow-amber', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.14)', icon: '~', sub: 'high latency' },
    { label: 'Down',        value: down,         color: '#ef4444', glow: 'stat-glow-red',   bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.14)',  icon: 'x', sub: 'unreachable' },
    { label: 'Total Sites', value: sites.length, color: '#00d4ff', glow: 'stat-glow-cyan',  bg: 'rgba(0,212,255,0.04)', border: 'rgba(0,212,255,0.12)',  icon: '#', sub: 'monitored' },
  ]

  return (
    <>
      {showBoot && (
        <div style={{ opacity: booted ? 0 : 1, transition: 'opacity 0.5s ease', pointerEvents: booted ? 'none' : 'auto', position: 'fixed', inset: 0, zIndex: 50 }}>
          <BootScreen onDone={handleBootDone} />
        </div>
      )}
      <div style={{ opacity: booted ? 1 : 0, transition: 'opacity 0.6s ease 0.1s', minHeight: '100vh' }}>
        <div className="top-accent fixed top-0 left-0 right-0 z-20" style={{ height: 2 }} />
        <header className="sticky top-0 z-10" style={{ background: 'rgba(6,9,16,0.88)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--border-dim)' }}>
          <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,rgba(0,212,255,0.12),rgba(0,255,136,0.06))', border: '1px solid rgba(0,212,255,0.22)' }}>
                <span style={{ fontFamily: 'Geist,sans-serif', fontWeight: 900, fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>IG</span>
              </div>
              <div>
                <div style={{ fontFamily: 'Geist,sans-serif', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.02em', lineHeight: 1 }}>Imarat Group</div>
                <div className="font-mono" style={{ fontSize: '0.56rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>Network Operations Center</div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full" style={{ background: allOK ? 'rgba(16,185,129,0.07)' : 'rgba(245,158,11,0.07)', border: '1px solid ' + (allOK ? 'rgba(16,185,129,0.18)' : 'rgba(245,158,11,0.18)') }}>
              <StatusDot status={allOK ? 'online' : 'degraded'} size={7} />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: allOK ? '#34d399' : '#fbbf24' }}>
                {allOK ? 'All Systems Operational' : (degraded + down) + ' site' + (degraded + down !== 1 ? 's' : '') + ' need attention'}
              </span>
            </div>
            <div className="flex items-center gap-5">
              {lastUpdated !== '' && (
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent-cyan)' }} />
                  <span className="font-mono" style={{ fontSize: '0.66rem', color: 'var(--text-tertiary)' }}>{lastUpdated}</span>
                </div>
              )}
              <LiveClock />
            </div>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7 animate-fadeUp">
            {statCards.map(function(c, i) {
              return (
                <div key={c.label} className={'rounded-xl p-5 ' + c.glow + ' row-enter'} style={{ background: c.bg, border: '1px solid ' + c.border, animationDelay: (i * 60) + 'ms' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ fontSize: '0.63rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.label}</span>
                    <span className="font-mono w-7 h-7 rounded-lg flex items-center justify-center" style={{ fontSize: '0.82rem', background: c.border, color: c.color }}>{c.icon}</span>
                  </div>
                  <div style={{ fontFamily: 'Geist,sans-serif', fontSize: '2.6rem', fontWeight: 800, color: c.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{c.value}</div>
                  <div className="font-mono mt-1" style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{c.sub}</div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-5 flex-col xl:flex-row items-start">
            <div className="xl:w-72 flex-shrink-0 w-full animate-fadeUp" style={{ animationDelay: '100ms' }}>
              <div className="glass rounded-xl overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-dim)' }}>
                  <span style={{ fontSize: '0.63rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{sites.length} Facilities</span>
                  <div className="flex gap-1">
                    {([[online,'#10b981'],[degraded,'#f59e0b'],[down,'#ef4444']] as [number,string][]).map(function(item, i) {
                      if (item[0] === 0) return null
                      return <span key={i} className="font-mono px-1.5 py-0.5 rounded" style={{ fontSize: '0.58rem', background: item[1] + '18', color: item[1], border: '1px solid ' + item[1] + '33' }}>{item[0]}</span>
                    })}
                  </div>
                </div>
                <div>
                  {displaySites.map(function(site) {
                    return (
                      <div key={site.id} className="table-row px-4 py-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <StatusDot status={site.status} size={6} />
                          <span style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.82)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{site.name}</span>
                        </div>
                        <span className="font-mono flex-shrink-0" style={{ fontSize: '0.68rem', color: site.status === 'down' ? '#ef4444' : site.status === 'degraded' ? '#f59e0b' : 'var(--text-tertiary)' }}>
                          {site.status === 'down' ? 'DOWN' : site.pingMs ? site.pingMs + 'ms' : '-'}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {sites.length > 10 && (
                  <button onClick={function() { setShowAll(!showAll) }} className="w-full py-3 font-mono" style={{ borderTop: '1px solid var(--border-dim)', background: 'transparent', fontSize: '0.7rem', color: 'var(--accent-cyan)', opacity: 0.7, cursor: 'pointer' }}>
                    {showAll ? 'Show less' : 'View all ' + sites.length + ' facilities'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 w-full flex flex-col gap-5">
              <div className="animate-fadeUp" style={{ animationDelay: '70ms' }}><MacroChart sites={sites} /></div>
              <div className="glass rounded-xl overflow-hidden animate-fadeUp" style={{ animationDelay: '130ms' }}>
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-dim)' }}>
                  <div>
                    <h2 style={{ fontFamily: 'Geist,sans-serif', fontSize: '0.9rem', fontWeight: 700 }}>Facility Status and Live Monitoring</h2>
                    <p className="font-mono mt-0.5" style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Real-time ping and uptime - auto-refreshes every 5s</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent-cyan)' }} />
                    <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)', opacity: 0.8 }}>LIVE</span>
                  </div>
                </div>
                <div className="grid px-5 py-2.5" style={{ gridTemplateColumns: '1.8fr 110px 115px 100px 130px', borderBottom: '1px solid var(--border-dim)', background: 'rgba(255,255,255,0.012)' }}>
                  {['Facility','Status','Response','24H Uptime','Live Graph'].map(function(h) {
                    return <div key={h} className="font-mono" style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
                  })}
                </div>
                {sites.map(function(site, idx) {
                  const pingColor = site.status === 'down' ? '#ef4444' : site.status === 'degraded' ? '#f59e0b' : '#34d399'
                  const uptimeColor = site.uptime24h >= 99 ? '#34d399' : site.uptime24h >= 80 ? '#fbbf24' : '#f87171'
                  return (
                    <div key={site.id} className="table-row row-enter grid px-5 items-center" style={{ gridTemplateColumns: '1.8fr 110px 115px 100px 130px', paddingTop: 11, paddingBottom: 11, animationDelay: (idx * 22) + 'ms' }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'rgba(255,255,255,0.88)' }}>{site.name}</div>
                        {site.location ? <div className="font-mono mt-0.5" style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{site.location}</div> : null}
                      </div>
                      <div><StatusBadge status={site.status} /></div>
                      <div className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 600, color: pingColor }}>
                        {site.status === 'down' ? 'Unreachable' : site.pingMs ? site.pingMs + ' ms' : '-'}
                      </div>
                      <div>
                        <div className="font-mono mb-1" style={{ fontSize: '0.72rem', fontWeight: 600, color: uptimeColor }}>
                          {site.status === 'down' ? '0.00%' : site.uptime24h.toFixed(2) + '%'}
                        </div>
                        <UptimeBlocks uptime={site.status === 'down' ? 0 : site.uptime24h} status={site.status} />
                      </div>
                      <div><Sparkline data={site.history} status={site.status} idx={idx} /></div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <footer className="mt-10 pb-6 pt-6 flex items-center justify-between flex-wrap gap-3" style={{ borderTop: '1px solid var(--border-dim)' }}>
            <div className="font-mono" style={{ fontSize: '0.63rem', color: 'var(--text-tertiary)' }}>
              2024 Imarat Group of Companies - Network Operations Center
            </div>
            <a href="/admin/login" className="font-mono" style={{ fontSize: '0.63rem', color: 'var(--text-tertiary)', textDecoration: 'none' }}>Admin Portal</a>
          </footer>
        </main>
      </div>
    </>
  )
}
