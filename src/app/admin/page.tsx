'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Site, SiteStatus } from '@/lib/store'

function Clock() {
  const [t, setT] = useState('')
  useEffect(function() {
    function tick() {
      const n = new Date(), p = function(x: number) { return String(x).padStart(2,'0') }
      const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      setT(days[n.getDay()] + ' ' + n.getDate() + ' ' + months[n.getMonth()] + ' ' + p(n.getHours()) + ':' + p(n.getMinutes()) + ':' + p(n.getSeconds()))
    }
    tick(); const iv = setInterval(tick, 1000); return function() { clearInterval(iv) }
  }, [])
  return <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{t}</span>
}

function SBadge({ status }: { status: SiteStatus }) {
  const label = status === 'online' ? 'Online' : status === 'degraded' ? 'Degraded' : 'Down'
  return (
    <span className={'status-' + status + ' inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mono'} style={{ fontSize: '0.68rem', fontWeight: 700 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: status === 'online' ? 'var(--green)' : status === 'degraded' ? 'var(--amber)' : 'var(--red)', display: 'inline-block', flexShrink: 0 }} />
      {label}
    </span>
  )
}

function EditModal({ site, onClose, onSave }: { site: Site; onClose: () => void; onSave: (id: string, p: Partial<Site>) => Promise<void> }) {
  const [name, setName] = useState(site.name)
  const [status, setStatus] = useState<SiteStatus>(site.status)
  const [ping, setPing] = useState(site.pingMs ? String(site.pingMs) : '')
  const [uptime, setUptime] = useState(site.uptime24h.toFixed(2))
  const [location, setLocation] = useState(site.location || '')
  const [notes, setNotes] = useState(site.notes || '')
  const [saving, setSaving] = useState(false)
  async function save() {
    setSaving(true)
    const patch: Partial<Site> = { name: name.trim(), status, location, notes }
    if (status === 'down') { patch.pingMs = null; patch.uptime24h = 0 }
    else { if (ping) patch.pingMs = parseInt(ping) || null; if (uptime) patch.uptime24h = Math.min(100, Math.max(0, parseFloat(uptime))) }
    await onSave(site.id, patch); setSaving(false); onClose()
  }
  const sOpts: { v: SiteStatus; label: string; color: string; bg: string; border: string }[] = [
    { v: 'online',   label: 'Online',   color: 'var(--green)', bg: 'var(--green2)', border: 'var(--green3)' },
    { v: 'degraded', label: 'Degraded', color: 'var(--amber)', bg: 'var(--amber2)', border: 'var(--amber3)' },
    { v: 'down',     label: 'Down',     color: 'var(--red)',   bg: 'var(--red2)',   border: 'var(--red3)' },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(13,17,23,0.4)', backdropFilter: 'blur(8px)' }} onClick={function(e) { if (e.target === e.currentTarget) onClose() }}>
      <div className="anim-scaleIn" style={{ background: 'var(--surface)', borderRadius: 20, padding: '28px 30px', width: '100%', maxWidth: 460, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div><h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>Edit Site</h2><p className="mono" style={{ fontSize: '0.62rem', color: 'var(--text4)', marginTop: 2 }}>{site.id}</p></div>
          <button onClick={onClose} className="btn btn-outline" style={{ width: 32, height: 32, padding: 0, borderRadius: 8 }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label className="mono" style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Site Name</label><input value={name} onChange={function(e) { setName(e.target.value) }} className="inp" style={{ padding: '9px 12px', fontSize: '0.88rem' }} /></div>
          <div>
            <label className="mono" style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Status</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {sOpts.map(function(o) {
                const active = status === o.v
                return <button key={o.v} onClick={function() { setStatus(o.v) }} className="btn" style={{ padding: '10px 8px', fontSize: '0.78rem', background: active ? o.bg : 'var(--surface2)', border: '1.5px solid ' + (active ? o.border : 'var(--border)'), color: active ? o.color : 'var(--text3)', fontWeight: 700, borderRadius: 10 }}>{o.label}</button>
              })}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label className="mono" style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, opacity: status === 'down' ? 0.4 : 1 }}>Ping (ms)</label><input type="number" value={status === 'down' ? '' : ping} onChange={function(e) { setPing(e.target.value) }} disabled={status === 'down'} placeholder="e.g. 14" className="inp mono" style={{ padding: '9px 12px', fontSize: '0.88rem', opacity: status === 'down' ? 0.4 : 1 }} /></div>
            <div><label className="mono" style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, opacity: status === 'down' ? 0.4 : 1 }}>Uptime %</label><input type="number" min="0" max="100" step="0.01" value={status === 'down' ? '0' : uptime} onChange={function(e) { setUptime(e.target.value) }} disabled={status === 'down'} className="inp mono" style={{ padding: '9px 12px', fontSize: '0.88rem', opacity: status === 'down' ? 0.4 : 1 }} /></div>
          </div>
          <div><label className="mono" style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Location</label><input value={location} onChange={function(e) { setLocation(e.target.value) }} placeholder="e.g. Islamabad" className="inp" style={{ padding: '9px 12px', fontSize: '0.88rem' }} /></div>
          <div><label className="mono" style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Notes</label><textarea value={notes} onChange={function(e) { setNotes(e.target.value) }} rows={2} placeholder="Internal notes" className="inp" style={{ padding: '9px 12px', fontSize: '0.84rem', resize: 'none' }} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1, padding: '11px', fontSize: '0.84rem', borderRadius: 10 }}>Cancel</button>
          <button onClick={save} disabled={saving} className="btn btn-gold" style={{ flex: 1, padding: '11px', fontSize: '0.88rem', borderRadius: 10, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  )
}

function AddModal({ onClose, onAdd }: { onClose: () => void; onAdd: (d: { name: string; location?: string; notes?: string }) => Promise<void> }) {
  const [name, setName] = useState(''), [location, setLocation] = useState(''), [notes, setNotes] = useState(''), [saving, setSaving] = useState(false)
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(13,17,23,0.4)', backdropFilter: 'blur(8px)' }} onClick={function(e) { if (e.target === e.currentTarget) onClose() }}>
      <div className="anim-scaleIn" style={{ background: 'var(--surface)', borderRadius: 20, padding: '28px 30px', width: '100%', maxWidth: 400, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>Add New Site</h2>
          <button onClick={onClose} className="btn btn-outline" style={{ width: 32, height: 32, padding: 0, borderRadius: 8 }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label className="mono" style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Site Name *</label><input value={name} onChange={function(e) { setName(e.target.value) }} placeholder="e.g. New Branch Office" className="inp" style={{ padding: '9px 12px', fontSize: '0.88rem' }} /></div>
          <div><label className="mono" style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Location</label><input value={location} onChange={function(e) { setLocation(e.target.value) }} placeholder="e.g. Islamabad" className="inp" style={{ padding: '9px 12px', fontSize: '0.88rem' }} /></div>
          <div><label className="mono" style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Notes</label><textarea value={notes} onChange={function(e) { setNotes(e.target.value) }} rows={2} className="inp" style={{ padding: '9px 12px', fontSize: '0.84rem', resize: 'none' }} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1, padding: '11px', fontSize: '0.84rem', borderRadius: 10 }}>Cancel</button>
          <button onClick={async function() { if (!name.trim()) return; setSaving(true); await onAdd({ name: name.trim(), location, notes }); setSaving(false); onClose() }} disabled={saving || !name.trim()} className="btn btn-success" style={{ flex: 1, padding: '11px', fontSize: '0.84rem', borderRadius: 10, opacity: !name.trim() ? 0.5 : 1, fontWeight: 700 }}>{saving ? 'Adding...' : '+ Add Site'}</button>
        </div>
      </div>
    </div>
  )
}

function DelModal({ site, onClose, onConfirm }: { site: Site; onClose: () => void; onConfirm: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(13,17,23,0.4)', backdropFilter: 'blur(8px)' }}>
      <div className="anim-scaleIn" style={{ background: 'var(--surface)', borderRadius: 20, padding: '28px 30px', width: '100%', maxWidth: 380, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--red3)' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--red2)', border: '1px solid var(--red3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg width="20" height="20" fill="none" stroke="var(--red)" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
        </div>
        <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', marginBottom: 8 }}>Delete Site</h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text2)', marginBottom: 22, lineHeight: 1.65 }}>Remove <strong style={{ color: 'var(--text)' }}>{site.name}</strong> permanently? This cannot be undone.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1, padding: '11px', fontSize: '0.84rem', borderRadius: 10 }}>Cancel</button>
          <button onClick={onConfirm} className="btn btn-danger" style={{ flex: 1, padding: '11px', fontSize: '0.84rem', borderRadius: 10, fontWeight: 700 }}>Delete</button>
        </div>
      </div>
    </div>
  )
}

function BulkModal({ count, onClose, onBulk }: { count: number; onClose: () => void; onBulk: (s: SiteStatus) => void }) {
  const opts: { v: SiteStatus; label: string; desc: string; color: string; bg: string; border: string }[] = [
    { v: 'online',   label: 'Set Online',   desc: 'Mark as fully operational',    color: 'var(--green)', bg: 'var(--green2)', border: 'var(--green3)' },
    { v: 'degraded', label: 'Set Degraded', desc: 'Mark as high latency/partial', color: 'var(--amber)', bg: 'var(--amber2)', border: 'var(--amber3)' },
    { v: 'down',     label: 'Set Down',     desc: 'Mark as completely offline',   color: 'var(--red)',   bg: 'var(--red2)',   border: 'var(--red3)' },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(13,17,23,0.4)', backdropFilter: 'blur(8px)' }}>
      <div className="anim-scaleIn" style={{ background: 'var(--surface)', borderRadius: 20, padding: '28px 30px', width: '100%', maxWidth: 380, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', marginBottom: 6 }}>Bulk Update</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text3)', marginBottom: 18 }}>Update <strong style={{ color: 'var(--gold)' }}>{count}</strong> selected site{count !== 1 ? 's' : ''}:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {opts.map(function(o) {
            return (
              <button key={o.v} onClick={function() { onBulk(o.v); onClose() }} className="btn" style={{ padding: '12px 16px', justifyContent: 'flex-start', background: o.bg, border: '1.5px solid ' + o.border, color: o.color, borderRadius: 12, gap: 12, fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: o.color, flexShrink: 0 }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>{o.label}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: 400, marginTop: 1 }}>{o.desc}</div>
                </div>
              </button>
            )
          })}
        </div>
        <button onClick={onClose} className="btn btn-outline" style={{ width: '100%', padding: '10px', fontSize: '0.84rem', borderRadius: 10 }}>Cancel</button>
      </div>
    </div>
  )
}

export default function Admin() {
  const router = useRouter()
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [edit, setEdit] = useState<Site | null>(null)
  const [del, setDel] = useState<Site | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [synced, setSynced] = useState('')
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function notify(msg: string, ok = true) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ msg, ok }); toastTimer.current = setTimeout(function() { setToast(null) }, 3000)
  }

  useEffect(function() {
    fetch('/api/auth/me').then(function(r) {
      if (!r.ok) router.replace('/admin/login')
      else r.json().then(function(d) { setEmail(d.email) })
    })
  }, [router])

  const fetch_ = useCallback(async function() {
    const r = await fetch('/api/sites', { cache: 'no-store' })
    if (r.ok) {
      setSites(await r.json()); setLoading(false)
      const n = new Date(), p = function(x: number) { return String(x).padStart(2,'0') }
      setSynced(p(n.getHours()) + ':' + p(n.getMinutes()) + ':' + p(n.getSeconds()))
    }
  }, [])

  useEffect(function() { fetch_(); timer.current = setInterval(fetch_, 4000); return function() { if (timer.current) clearInterval(timer.current) } }, [fetch_])

  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/admin/login') }
  async function save_(id: string, patch: Partial<Site>) { const r = await fetch('/api/sites/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) }); if (r.ok) { await fetch_(); notify('Site updated') } else notify('Failed to update', false) }
  async function del_(id: string) { const r = await fetch('/api/sites/' + id, { method: 'DELETE' }); if (r.ok) { setDel(null); await fetch_(); notify('Site deleted') } else notify('Failed to delete', false) }
  async function add_(data: { name: string; location?: string; notes?: string }) { const r = await fetch('/api/sites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); if (r.ok) { await fetch_(); notify('Site added') } else notify('Failed to add', false) }
  async function bulk_(status: SiteStatus) {
    await Promise.all([...selected].map(function(id) { return fetch('/api/sites/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }) }))
    const count = selected.size; setSelected(new Set()); await fetch_(); notify(count + ' sites updated to ' + status)
  }

  function toggleSel(id: string) { setSelected(function(p) { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n }) }
  const filtered = sites.filter(function(s) { return s.name.toLowerCase().includes(search.toLowerCase()) && (filter === 'all' || s.status === filter) })
  function toggleAll() { setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(function(s) { return s.id }))) }

  const online = sites.filter(function(s) { return s.status === 'online' }).length
  const degraded = sites.filter(function(s) { return s.status === 'degraded' }).length
  const down = sites.filter(function(s) { return s.status === 'down' }).length

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div className="anim-spin" style={{ width: 36, height: 36, border: '3px solid var(--border2)', borderTopColor: 'var(--gold)', borderRadius: '50%' }} />
        <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>Loading admin panel...</span>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, #c9a84c, #e8c060, #c9a84c, transparent)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }} />
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #c9a84c, #e8c060)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M2 16L10 4L18 16H2Z" fill="white" fillOpacity="0.95" /><path d="M5.5 16L10 9L14.5 16H5.5Z" fill="rgba(201,168,76,0.5)" /></svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>Imarat Group</div>
              <div className="mono" style={{ fontSize: '0.54rem', color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>Admin Panel</div>
            </div>
            <div style={{ padding: '3px 8px', borderRadius: 6, background: 'var(--gold4)', border: '1px solid var(--gold3)' }}>
              <span className="mono" style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.1em' }}>NMS v2</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Clock />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 7, background: 'var(--green2)', border: '1px solid var(--green3)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulseGlow 2s ease-in-out infinite' }} />
              <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--green)', fontWeight: 700 }}>{email.split('@')[0]}</span>
            </div>
            <a href="/" target="_blank" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.72rem', borderRadius: 8, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a1 1 0 011-1h6M15 3h6v6M10 14L21 3"/></svg>Status Page
            </a>
            <button onClick={logout} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.72rem', borderRadius: 8 }}>Sign Out</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 22 }}>
          {[{ label: 'Total', val: sites.length, color: 'var(--blue)', border: '#bfdbfe' },{ label: 'Online', val: online, color: 'var(--green)', border: 'var(--green3)' },{ label: 'Degraded', val: degraded, color: 'var(--amber)', border: 'var(--amber3)' },{ label: 'Down', val: down, color: 'var(--red)', border: 'var(--red3)' }].map(function(c) {
            return (
              <div key={c.label} className="card" style={{ padding: '14px 16px', borderLeft: '3px solid ' + c.border }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{c.label}</div>
                <div style={{ fontWeight: 800, fontSize: '1.9rem', color: c.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{c.val}</div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <input value={search} onChange={function(e) { setSearch(e.target.value) }} placeholder="Search sites..." className="inp" style={{ padding: '9px 12px 9px 36px', fontSize: '0.82rem' }} />
            <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)', pointerEvents: 'none' }} width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <select value={filter} onChange={function(e) { setFilter(e.target.value) }} className="inp" style={{ padding: '9px 12px', fontSize: '0.82rem', width: 'auto', cursor: 'pointer' }}>
            <option value="all">All Statuses</option><option value="online">Online</option><option value="degraded">Degraded</option><option value="down">Down</option>
          </select>
          {selected.size > 0 && <button onClick={function() { setBulkOpen(true) }} className="btn btn-outline" style={{ padding: '9px 14px', fontSize: '0.78rem', borderRadius: 8, borderColor: 'var(--gold)', color: 'var(--gold)', fontWeight: 700 }}>Bulk Update ({selected.size})</button>}
          {synced && <span className="mono" style={{ fontSize: '0.63rem', color: 'var(--text4)' }}>Synced {synced}</span>}
          <button onClick={function() { setAddOpen(true) }} className="btn btn-gold" style={{ padding: '9px 18px', fontSize: '0.82rem', borderRadius: 9, marginLeft: 'auto' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Add Site
          </button>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 2fr 115px 100px 90px 120px 1fr 120px', padding: '10px 18px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
            <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ accentColor: 'var(--gold)', cursor: 'pointer' }} />
            {['Site Name','Status','Ping','24H Up','Location','Notes','Actions'].map(function(h) { return <div key={h} className="mono" style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div> })}
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)' }}>
              <div className="mono" style={{ fontSize: '0.8rem' }}>No sites match your filter</div>
            </div>
          ) : filtered.map(function(site, idx) {
            const pingColor = site.status === 'down' ? 'var(--red)' : site.status === 'degraded' ? 'var(--amber)' : 'var(--green)'
            const upColor = site.uptime24h >= 99 ? 'var(--green)' : site.uptime24h >= 80 ? 'var(--amber)' : 'var(--red)'
            return (
              <div key={site.id} className="trow anim-fadeUp" style={{ display: 'grid', gridTemplateColumns: '40px 2fr 115px 100px 90px 120px 1fr 120px', padding: '12px 18px', alignItems: 'center', animationDelay: (idx * 15) + 'ms', background: selected.has(site.id) ? 'var(--gold4)' : undefined }}>
                <input type="checkbox" checked={selected.has(site.id)} onChange={function() { toggleSel(site.id) }} style={{ accentColor: 'var(--gold)', cursor: 'pointer' }} />
                <div><div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text)' }}>{site.name}</div><div className="mono" style={{ fontSize: '0.6rem', color: 'var(--text4)', marginTop: 2 }}>{site.id}</div></div>
                <div><SBadge status={site.status} /></div>
                <div className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: pingColor }}>{site.status === 'down' ? '-' : site.pingMs ? site.pingMs + ' ms' : '-'}</div>
                <div className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: upColor }}>{site.status === 'down' ? '0%' : site.uptime24h.toFixed(1) + '%'}</div>
                <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{site.location || '-'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{site.notes || '-'}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={function() { setEdit(site) }} className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '0.72rem', borderRadius: 7, fontWeight: 700 }}>Edit</button>
                  <button onClick={function() { setDel(site) }} className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '0.72rem', borderRadius: 7, fontWeight: 700 }}>Del</button>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
          <span className="mono" style={{ fontSize: '0.63rem', color: 'var(--text4)' }}>{filtered.length} of {sites.length} sites</span>
          <span className="mono" style={{ fontSize: '0.63rem', color: 'var(--text4)' }}>Auto-syncs every 4s</span>
        </div>
      </main>

      {edit && <EditModal site={edit} onClose={function() { setEdit(null) }} onSave={save_} />}
      {del && <DelModal site={del} onClose={function() { setDel(null) }} onConfirm={function() { del_(del.id) }} />}
      {addOpen && <AddModal onClose={function() { setAddOpen(false) }} onAdd={add_} />}
      {bulkOpen && <BulkModal count={selected.size} onClose={function() { setBulkOpen(false) }} onBulk={bulk_} />}
      {toast && (
        <div className="anim-slideDown" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, padding: '12px 18px', borderRadius: 12, background: toast.ok ? 'var(--green2)' : 'var(--red2)', border: '1px solid ' + (toast.ok ? 'var(--green3)' : 'var(--red3)'), color: toast.ok ? 'var(--green)' : 'var(--red)', fontSize: '0.82rem', fontWeight: 600, boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">{toast.ok ? <path d="M20 6L9 17l-5-5"/> : <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>}</svg>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
