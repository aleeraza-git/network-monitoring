'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import type { Site } from '@/lib/store'

function Spark({ data, status, idx }: { data: number[]; status: string; idx: number }) {
  const W = 100, H = 32
  const vals = (data || []).slice(-35)
  if (vals.length < 2) return <div style={{ width: W, height: H }} />
  const max = Math.max(...vals.filter(function(v) { return v > 0 }), 1)
  const color = status === 'online' ? '#16a34a' : status === 'degraded' ? '#d97706' : '#dc2626'
  const pts = vals.map(function(v, i) { return ((i / (vals.length - 1)) * W).toFixed(1) + ',' + (H - ((v / max) * (H - 6)) - 3).toFixed(1) }).join(' ')
  const gid = 'g' + idx + status[0]
  return (
    <svg width={W} height={H} viewBox={'0 0 ' + W + ' ' + H} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={'0,' + H + ' ' + pts + ' ' + W + ',' + H} fill={'url(#' + gid + ')'} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function Dot({ status, size }: { status: string; size?: number }) {
  const sz = size || 9
  const col = status === 'online' ? '#16a34a' : status === 'degraded' ? '#d97706' : '#dc2626'
  return (
    <span className={'pulse-dot pulse-' + status} style={{ width: sz, height: sz, flexShrink: 0 }}>
      <span style={{ width: sz, height: sz, background: col, display: 'block', borderRadius: '50%', boxShadow: '0 0 ' + sz + 'px ' + col + '66', position: 'relative', zIndex: 1 }} />
    </span>
  )
}

function Badge({ status }: { status: string }) {
  const label = status === 'online' ? 'Online' : status === 'degraded' ? 'Degraded' : 'Down'
  return (
    <span className={'status-' + status + ' inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mono'} style={{ fontSize: '0.68rem', fontWeight: 700 }}>
      <Dot status={status} size={5} />{label}
    </span>
  )
}

function UptimeBar({ uptime, status }: { uptime: number; status: string }) {
  const n = 36, on = Math.round((uptime / 100) * n)
  const hs = [65,78,60,85,70,80,58,88,72,82,64,87,68,83,62,90,74,80,66,85,70,78,62,88,72,84,64,86,70,80,65,88,72,82,66,84]
  return (
    <div className="flex gap-[2px] items-end" style={{ height: 20 }}>
      {Array.from({ length: n }).map(function(_, i) {
        const bg = i >= on ? '#fecaca' : status === 'degraded' && i >= on - 4 ? '#fde68a' : '#bbf7d0'
        return <div key={i} className="flex-1 rounded-sm" style={{ height: (hs[i] || 70) + '%', background: bg }} />
      })}
    </div>
  )
}

function Clock() {
  const [t, setT] = useState(''), [d, setD] = useState('')
  useEffect(function() {
    function tick() {
      const n = new Date(), p = function(x: number) { return String(x).padStart(2,'0') }
      setT(p(n.getHours()) + ':' + p(n.getMinutes()) + ':' + p(n.getSeconds()))
      const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      setD(days[n.getDay()] + ' ' + n.getDate() + ' ' + months[n.getMonth()] + ' ' + n.getFullYear())
    }
    tick(); const iv = setInterval(tick, 1000); return function() { clearInterval(iv) }
  }, [])
  if (!t) return <div style={{ width: 120 }} />
  return (
    <div className="text-right">
      <div className="mono" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1 }}>{t}</div>
      <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--text3)', marginTop: 3 }}>{d}</div>
    </div>
  )
}

function Loader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0), [step, setStep] = useState(0)
  const doneRef = useRef(onDone); doneRef.current = onDone
  const steps = ['Initializing systems...','Loading site data...','Connecting to nodes...','Verifying telemetry...','Launching dashboard...']
  useEffect(function() {
    const targets = [18,40,62,85,100]; let idx = 0
    const go = function() {
      if (idx < targets.length) {
        setStep(idx); const target = targets[idx]; idx++
        const inc = function() {
          setPct(function(p) {
            if (p >= target) { if (idx < targets.length) setTimeout(go, 180); else setTimeout(function() { doneRef.current() }, 300); return target }
            setTimeout(inc, 18); return Math.min(p + 2, target)
          })
        }; inc()
      }
    }; setTimeout(go, 200)
  }, [])
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'radial-gradient(ellipse at center, #fffdf5 0%, #f5f0e8 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(184,134,11,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: 420, width: '100%' }}>
        <div className="anim-scaleIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
          <div className="anim-float" style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, #c9a84c, #e8c060)', boxShadow: '0 12px 40px rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><path d="M6 28L18 8L30 28H6Z" fill="rgba(255,255,255,0.95)" /><path d="M11 28L18 16L25 28H11Z" fill="rgba(201,168,76,0.6)" /></svg>
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.7rem', color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 6 }}>Imarat Group</div>
          <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>Network Operations Center</div>
        </div>
        <div className="anim-fadeIn" style={{ animationDelay: '300ms' }}>
          <div style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(184,134,11,0.15)', borderRadius: 12, padding: '14px 18px', marginBottom: 16, minHeight: 46 }}>
            <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--gold)' }}>{steps[Math.min(step, steps.length - 1)]}</div>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #c9a84c, #e8c060)', borderRadius: 99, width: pct + '%', transition: 'width 0.15s ease', boxShadow: '0 0 12px rgba(201,168,76,0.4)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--text3)' }}>Loading infrastructure data</span>
            <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--gold)', fontWeight: 600 }}>{pct}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const [sites, setSites] = useState<Site[]>([])
  const [ready, setReady] = useState(false)
  const [showLoader, setShowLoader] = useState(true)
  const [updated, setUpdated] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [search, setSearch] = useState('')
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async function() {
    try {
      const r = await fetch('/api/sites', { cache: 'no-store' })
      if (r.ok) {
        setSites(await r.json())
        const n = new Date(), p = function(x: number) { return String(x).padStart(2,'0') }
        setUpdated(p(n.getHours()) + ':' + p(n.getMinutes()) + ':' + p(n.getSeconds()))
      }
    } catch(e) { /* silent */ }
  }, [])

  const onDone = useCallback(function() {
    load().then(function() {
      setReady(true); setTimeout(function() { setShowLoader(false) }, 600)
      timer.current = setInterval(load, 5000)
    })
  }, [load])

  useEffect(function() { return function() { if (timer.current) clearInterval(timer.current) } }, [])

  const online = sites.filter(function(s) { return s.status === 'online' }).length
  const degraded = sites.filter(function(s) { return s.status === 'degraded' }).length
  const down = sites.filter(function(s) { return s.status === 'down' }).length
  const avg = sites.length ? sites.reduce(function(a, s) { return a + s.uptime24h }, 0) / sites.length : 100
  const allOK = degraded === 0 && down === 0
  const filtered = sites.filter(function(s) { return s.name.toLowerCase().includes(search.toLowerCase()) })
  const shown = showAll ? filtered : filtered.slice(0, 12)

  return (
    <>
      {showLoader && (
        <div style={{ opacity: ready ? 0 : 1, transition: 'opacity 0.6s ease', pointerEvents: ready ? 'none' : 'auto', position: 'fixed', inset: 0, zIndex: 50 }}>
          <Loader onDone={onDone} />
        </div>
      )}
      <div style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.7s ease 0.1s', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, #c9a84c, #e8c060, #c9a84c, transparent)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }} />
        <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid var(--border)', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0 }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #c9a84c, #e8c060)', boxShadow: '0 4px 12px rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 16L10 4L18 16H2Z" fill="white" fillOpacity="0.95" /><path d="M5.5 16L10 9L14.5 16H5.5Z" fill="rgba(201,168,76,0.5)" /></svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>Imarat Group</div>
                <div className="mono" style={{ fontSize: '0.55rem', color: 'var(--text3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>Network Operations Center</div>
              </div>
            </div>
            <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 99, background: allOK ? 'var(--green2)' : 'var(--amber2)', border: '1px solid ' + (allOK ? 'var(--green3)' : 'var(--amber3)') }}>
              <Dot status={allOK ? 'online' : 'degraded'} size={7} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: allOK ? 'var(--green)' : 'var(--amber)' }}>
                {allOK ? 'All Systems Operational' : (degraded + down) + ' issue' + (degraded + down > 1 ? 's' : '') + ' detected'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {updated && (
                <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulseGlow 2s ease-in-out infinite' }} />
                  <span className="mono" style={{ fontSize: '0.63rem', color: 'var(--text3)' }}>Updated {updated}</span>
                </div>
              )}
              <Clock />
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px 48px' }}>
          <div className="anim-fadeUp" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Online',      val: online,              color: 'var(--green)', bg: 'var(--green2)', border: 'var(--green3)', delay: 0 },
              { label: 'Degraded',    val: degraded,            color: 'var(--amber)', bg: 'var(--amber2)', border: 'var(--amber3)', delay: 60 },
              { label: 'Down',        val: down,                color: 'var(--red)',   bg: 'var(--red2)',   border: 'var(--red3)',   delay: 120 },
              { label: 'Total Sites', val: sites.length,        color: 'var(--blue)',  bg: 'var(--blue2)',  border: '#bfdbfe',       delay: 180 },
              { label: 'Avg Uptime',  val: avg.toFixed(1) + '%', color: 'var(--gold)', bg: 'var(--gold4)', border: 'var(--gold3)',   delay: 240 },
            ].map(function(c) {
              return (
                <div key={c.label} className="card card-lift anim-fadeUp" style={{ padding: '18px 20px', animationDelay: c.delay + 'ms', borderLeft: '3px solid ' + c.border }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{c.label}</div>
                  <div style={{ fontWeight: 800, fontSize: '2.2rem', color: c.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{c.val}</div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 18, alignItems: 'start' }}>
            <div className="hide-mobile anim-fadeUp" style={{ animationDelay: '80ms' }}>
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{sites.length} Facilities</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {online > 0 && <span style={{ fontSize: '0.6rem', background: 'var(--green2)', color: 'var(--green)', border: '1px solid var(--green3)', borderRadius: 6, padding: '1px 6px', fontWeight: 700 }}>{online}</span>}
                    {degraded > 0 && <span style={{ fontSize: '0.6rem', background: 'var(--amber2)', color: 'var(--amber)', border: '1px solid var(--amber3)', borderRadius: 6, padding: '1px 6px', fontWeight: 700 }}>{degraded}</span>}
                    {down > 0 && <span style={{ fontSize: '0.6rem', background: 'var(--red2)', color: 'var(--red)', border: '1px solid var(--red3)', borderRadius: 6, padding: '1px 6px', fontWeight: 700 }}>{down}</span>}
                  </div>
                </div>
                <div style={{ maxHeight: 520, overflowY: 'auto' }}>
                  {sites.map(function(s) {
                    return (
                      <div key={s.id} className="site-row" style={{ padding: '9px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <Dot status={s.status} size={7} />
                          <span style={{ fontSize: '0.77rem', color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                        </div>
                        <span className="mono" style={{ fontSize: '0.68rem', color: s.status === 'down' ? 'var(--red)' : s.status === 'degraded' ? 'var(--amber)' : 'var(--text3)', fontWeight: 600, flexShrink: 0 }}>
                          {s.status === 'down' ? 'DOWN' : s.pingMs ? s.pingMs + 'ms' : '-'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="card anim-fadeUp" style={{ padding: '20px 22px', animationDelay: '50ms' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Overall Uptime - Last 24 Hours</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: '2.4rem', letterSpacing: '-0.04em', lineHeight: 1, color: avg >= 99 ? 'var(--green)' : avg >= 90 ? 'var(--amber)' : 'var(--red)' }}>{avg.toFixed(2)}%</span>
                      <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{online}/{sites.length} nominal</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 14 }}>
                    {[['#16a34a','Operational'],['#d97706','Degraded'],['#dc2626','Outage']].map(function(item) {
                      return <div key={String(item[1])} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', color: 'var(--text3)' }}><div style={{ width: 8, height: 8, borderRadius: 2, background: String(item[0]) }} />{item[1]}</div>
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 56 }}>
                  {[82,90,78,95,88,92,75,98,85,91,79,94,87,93,76,99,83,89,77,96,86,90,80,97,84,92,78,95,83,91,77,98,85,89,79,94,88,93,76,100,82,90,78,95,87,91,75,98].map(function(h, i) {
                    const ratio = sites.length ? sites.filter(function(s) { return s.status === 'online' }).length / sites.length : 1
                    const v = ratio * (h / 100), col = v > 0.97 ? '#bbf7d0' : v > 0.85 ? '#fde68a' : '#fecaca'
                    return <div key={i} style={{ flex: 1, borderRadius: 3, background: col, height: Math.max(4, Math.round(v * 56)) }} />
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  {['12 AM','4 AM','8 AM','12 PM','4 PM','8 PM','Now'].map(function(t) { return <span key={t} className="mono" style={{ fontSize: '0.58rem', color: 'var(--text4)' }}>{t}</span> })}
                </div>
              </div>

              <div className="card anim-fadeUp" style={{ overflow: 'hidden', animationDelay: '120ms' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)', letterSpacing: '-0.01em' }}>Facility Status and Live Monitoring</h2>
                    <p className="mono" style={{ fontSize: '0.62rem', color: 'var(--text3)', marginTop: 3 }}>Real-time data - refreshes every 5 seconds</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ position: 'relative' }}>
                      <input value={search} onChange={function(e) { setSearch(e.target.value) }} placeholder="Search sites..." className="inp" style={{ padding: '7px 10px 7px 32px', fontSize: '0.78rem', width: 180 }} />
                      <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)', pointerEvents: 'none' }} width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'var(--green2)', border: '1px solid var(--green3)' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulseGlow 2s ease-in-out infinite' }} />
                      <span className="mono" style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--green)' }}>LIVE</span>
                    </div>
                  </div>
                </div>
                <div className="hide-mobile" style={{ display: 'grid', gridTemplateColumns: '2fr 110px 115px 100px 120px', padding: '10px 20px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                  {['Facility','Status','Response','24H Uptime','Live Graph'].map(function(h) { return <div key={h} className="mono" style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div> })}
                </div>
                {shown.map(function(site, idx) {
                  const pingColor = site.status === 'down' ? 'var(--red)' : site.status === 'degraded' ? 'var(--amber)' : 'var(--green)'
                  const upColor = site.uptime24h >= 99 ? 'var(--green)' : site.uptime24h >= 85 ? 'var(--amber)' : 'var(--red)'
                  return (
                    <div key={site.id} className="trow anim-fadeUp" style={{ display: 'grid', gridTemplateColumns: '2fr 110px 115px 100px 120px', padding: '12px 20px', alignItems: 'center', animationDelay: (idx * 20) + 'ms' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text)' }}>{site.name}</div>
                        {site.location ? <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--text3)', marginTop: 2 }}>{site.location}</div> : null}
                      </div>
                      <div><Badge status={site.status} /></div>
                      <div className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: pingColor }}>{site.status === 'down' ? 'Unreachable' : site.pingMs ? site.pingMs + ' ms' : '-'}</div>
                      <div>
                        <div className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: upColor, marginBottom: 5 }}>{site.status === 'down' ? '0.00%' : site.uptime24h.toFixed(2) + '%'}</div>
                        <UptimeBar uptime={site.status === 'down' ? 0 : site.uptime24h} status={site.status} />
                      </div>
                      <div className="hide-mobile"><Spark data={site.history} status={site.status} idx={idx} /></div>
                    </div>
                  )
                })}
                {filtered.length > 12 && (
                  <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', textAlign: 'center', background: 'var(--surface2)' }}>
                    <button onClick={function() { setShowAll(!showAll) }} className="btn btn-outline" style={{ padding: '7px 20px', fontSize: '0.78rem' }}>
                      {showAll ? 'Show less' : 'View all ' + filtered.length + ' facilities'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text4)' }}>{new Date().getFullYear()} Imarat Group of Companies - Network Operations Center</div>
            <a href="/admin/login" className="mono" style={{ fontSize: '0.65rem', color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>Admin Portal</a>
          </div>
        </main>
      </div>
    </>
  )
}
