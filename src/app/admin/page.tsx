'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Site, SiteStatus } from '@/lib/store'

// ─── Live clock ───────────────────────────────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
      {now.toLocaleString('en-PK', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: SiteStatus }) {
  const map: Record<SiteStatus, { label: string; bg: string; color: string; dot: string }> = {
    online: { label: 'Online', bg: 'rgba(34,197,94,0.12)', color: '#4ade80', dot: '#22c55e' },
    degraded: { label: 'Degraded', bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', dot: '#f59e0b' },
    down: { label: 'Down', bg: 'rgba(239,68,68,0.12)', color: '#f87171', dot: '#ef4444' },
  }
  const s = map[status]
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md"
      style={{ background: s.bg, color: s.color, fontSize: '0.7rem', fontWeight: 600, border: `1px solid ${s.dot}44` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  )
}

// ─── Edit modal ───────────────────────────────────────────────────────────────
function EditModal({ site, onClose, onSave }: {
  site: Site
  onClose: () => void
  onSave: (id: string, patch: Partial<Site>) => void
}) {
  const [name, setName] = useState(site.name)
  const [status, setStatus] = useState<SiteStatus>(site.status)
  const [ping, setPing] = useState<string>(site.pingMs?.toString() ?? '')
  const [uptime, setUptime] = useState<string>(site.uptime24h.toFixed(2))
  const [location, setLocation] = useState(site.location ?? '')
  const [notes, setNotes] = useState(site.notes ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const patch: Partial<Site> = {
      name: name.trim(),
      status,
      location,
      notes,
    }
    if (ping !== '') patch.pingMs = parseInt(ping) || null
    if (uptime !== '') patch.uptime24h = parseFloat(uptime)
    if (status === 'down') { patch.pingMs = null; patch.uptime24h = 0 }
    await onSave(site.id, patch)
    setSaving(false)
    onClose()
  }

  const inputClass = "w-full px-3 py-2.5 rounded-lg text-white transition-all focus-ring"
  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    fontSize: '0.84rem',
    outline: 'none',
  }
  const labelStyle = { fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl p-6 animate-slideUp"
        style={{ background: 'var(--ig-dark3)', border: '1px solid rgba(201,168,76,0.2)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
            Edit Site
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1rem' }}>
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label style={labelStyle}>Site Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Status</label>
            <div className="grid grid-cols-3 gap-2">
              {(['online', 'degraded', 'down'] as SiteStatus[]).map(s => {
                const colors: Record<SiteStatus, string> = { online: '#22c55e', degraded: '#f59e0b', down: '#ef4444' }
                const labels: Record<SiteStatus, string> = { online: '✓ Online', degraded: '⚡ Degraded', down: '✕ Down' }
                const isActive = status === s
                return (
                  <button key={s} onClick={() => setStatus(s)}
                    className="py-2 rounded-lg text-center transition-all"
                    style={{
                      fontSize: '0.78rem', fontWeight: 600,
                      background: isActive ? `${colors[s]}22` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isActive ? colors[s] + '66' : 'rgba(255,255,255,0.08)'}`,
                      color: isActive ? colors[s] : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                    }}>
                    {labels[s]}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Ping (ms) {status === 'down' && <span style={{ color: '#ef4444' }}>— auto cleared</span>}</label>
              <input
                type="number"
                value={status === 'down' ? '' : ping}
                onChange={e => setPing(e.target.value)}
                disabled={status === 'down'}
                className={inputClass}
                style={{ ...inputStyle, opacity: status === 'down' ? 0.4 : 1 }}
                placeholder="e.g. 14"
              />
            </div>
            <div>
              <label style={labelStyle}>Uptime 24h (%)</label>
              <input
                type="number"
                min={0} max={100} step={0.01}
                value={status === 'down' ? '0' : uptime}
                onChange={e => setUptime(e.target.value)}
                disabled={status === 'down'}
                className={inputClass}
                style={{ ...inputStyle, opacity: status === 'down' ? 0.4 : 1 }}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Location / Notes</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Islamabad" className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Internal Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className={inputClass}
              style={{ ...inputStyle, resize: 'none' }}
              placeholder="Optional notes visible only to admins"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.84rem' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl transition-all"
            style={{
              background: saving ? 'rgba(201,168,76,0.3)' : 'linear-gradient(135deg, #c9a84c, #e8c87a)',
              color: '#0a0f1e', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '0.84rem', border: 'none', fontFamily: 'var(--font-display)',
            }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add site modal ───────────────────────────────────────────────────────────
function AddModal({ onClose, onAdd }: {
  onClose: () => void
  onAdd: (data: { name: string; location?: string; notes?: string }) => void
}) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onAdd({ name: name.trim(), location, notes })
    setSaving(false)
    onClose()
  }

  const inputClass = "w-full px-3 py-2.5 rounded-lg text-white transition-all focus-ring"
  const inputStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.84rem', outline: 'none' }
  const labelStyle = { fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl p-6 animate-slideUp"
        style={{ background: 'var(--ig-dark3)', border: '1px solid rgba(201,168,76,0.2)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Add Site</h2>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label style={labelStyle}>Site Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. New Branch Office" className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Islamabad" className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={inputClass} style={{ ...inputStyle, resize: 'none' }} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.84rem' }}>
            Cancel
          </button>
          <button onClick={handleAdd} disabled={saving || !name.trim()} className="flex-1 py-2.5 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c87a)', color: '#0a0f1e', fontWeight: 700, cursor: 'pointer', fontSize: '0.84rem', border: 'none', fontFamily: 'var(--font-display)', opacity: !name.trim() ? 0.5 : 1 }}>
            {saving ? 'Adding…' : 'Add Site'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Confirm delete modal ─────────────────────────────────────────────────────
function ConfirmDelete({ site, onClose, onConfirm }: { site: Site; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6 animate-slideUp"
        style={{ background: 'var(--ig-dark3)', border: '1px solid rgba(239,68,68,0.3)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>Delete Site?</div>
        <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.5)', marginBottom: '20px', lineHeight: 1.6 }}>
          Remove <strong style={{ color: '#fff' }}>{site.name}</strong> from the network monitor? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.84rem' }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600 }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Bulk status modal ────────────────────────────────────────────────────────
function BulkModal({ selected, onClose, onBulk }: { selected: string[]; onClose: () => void; onBulk: (status: SiteStatus) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6 animate-slideUp"
        style={{ background: 'var(--ig-dark3)', border: '1px solid rgba(201,168,76,0.2)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Bulk Update</div>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
          Set status for {selected.length} selected site{selected.length !== 1 ? 's' : ''}:
        </p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {(['online', 'degraded', 'down'] as SiteStatus[]).map(s => {
            const colors: Record<SiteStatus, string> = { online: '#22c55e', degraded: '#f59e0b', down: '#ef4444' }
            const labels: Record<SiteStatus, string> = { online: '✓ Online', degraded: '⚡ Degraded', down: '✕ Down' }
            return (
              <button key={s} onClick={() => { onBulk(s); onClose(); }}
                className="py-2.5 rounded-xl transition-all"
                style={{ background: `${colors[s]}18`, border: `1px solid ${colors[s]}44`, color: colors[s], cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                {labels[s]}
              </button>
            )
          })}
        </div>
        <button onClick={onClose} className="w-full py-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.84rem' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Admin dashboard ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter()
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState('')
  const [editSite, setEditSite] = useState<Site | null>(null)
  const [deleteSite, setDeleteSite] = useState<Site | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Auth check
  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (!r.ok) router.replace('/admin/login')
      else r.json().then(d => setAdminEmail(d.email))
    })
  }, [router])

  const fetchSites = useCallback(async () => {
    const res = await fetch('/api/sites', { cache: 'no-store' })
    if (res.ok) {
      setSites(await res.json())
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSites()
    intervalRef.current = setInterval(fetchSites, 4000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [fetchSites])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const handleSave = async (id: string, patch: Partial<Site>) => {
    const res = await fetch(`/api/sites/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (res.ok) {
      await fetchSites()
      showToast('Site updated successfully')
    } else {
      showToast('Failed to update site', 'err')
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/sites/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setDeleteSite(null)
      await fetchSites()
      showToast('Site deleted')
    } else {
      showToast('Failed to delete', 'err')
    }
  }

  const handleAdd = async (data: { name: string; location?: string; notes?: string }) => {
    const res = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      await fetchSites()
      showToast('Site added')
    } else {
      showToast('Failed to add site', 'err')
    }
  }

  const handleBulk = async (status: SiteStatus) => {
    await Promise.all([...selected].map(id =>
      fetch(`/api/sites/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    ))
    setSelected(new Set())
    await fetchSites()
    showToast(`${selected.size} sites updated to ${status}`)
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const toggleAll = () => {
    if (selected.size === filteredSites.length) setSelected(new Set())
    else setSelected(new Set(filteredSites.map(s => s.id)))
  }

  const filteredSites = sites.filter(s => {
    const matchName = s.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || s.status === filterStatus
    return matchName && matchStatus
  })

  const online = sites.filter(s => s.status === 'online').length
  const degraded = sites.filter(s => s.status === 'degraded').length
  const down = sites.filter(s => s.status === 'down').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ig-dark)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full animate-spin-slow" style={{ border: '2px solid transparent', borderTopColor: '#c9a84c' }} />
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>Loading admin panel…</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--ig-dark)' }}>
      {/* Top accent */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-20"
        style={{ background: 'linear-gradient(90deg, #c9a84c, #e8c87a, #c9a84c)' }} />

      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl"
        style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', background: 'rgba(10,15,30,0.9)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.8rem', color: '#c9a84c' }}>IG</span>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Admin Panel</span>
            <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)' }}>NMS</span>
          </div>

          <div className="flex items-center gap-4">
            <LiveClock />
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{adminEmail}</span>
            </div>
            <a href="/" target="_blank" className="px-3 py-1.5 rounded-lg transition-all"
              style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', textDecoration: 'none' }}>
              View Status ↗
            </a>
            <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg transition-all"
              style={{ fontSize: '0.72rem', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', cursor: 'pointer' }}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Sites', value: sites.length, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
            { label: 'Online', value: online, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
            { label: 'Degraded', value: degraded, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
            { label: 'Down', value: down, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
          ].map(c => (
            <div key={c.label} className="rounded-xl p-4" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{c.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: c.color, lineHeight: 1 }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>⌕</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search sites…"
              className="w-full pl-8 pr-3 py-2 rounded-xl text-white focus-ring"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.82rem', outline: 'none' }}
            />
          </div>

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="py-2 px-3 rounded-xl focus-ring"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}>
            <option value="all">All Statuses</option>
            <option value="online">Online</option>
            <option value="degraded">Degraded</option>
            <option value="down">Down</option>
          </select>

          {/* Bulk actions */}
          {selected.size > 0 && (
            <button onClick={() => setShowBulk(true)}
              className="px-4 py-2 rounded-xl transition-all"
              style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', cursor: 'pointer', fontSize: '0.82rem' }}>
              Bulk Update ({selected.size})
            </button>
          )}

          <button onClick={() => setShowAdd(true)}
            className="ml-auto px-4 py-2 rounded-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c87a)', color: '#0a0f1e', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'var(--font-display)' }}>
            + Add Site
          </button>
        </div>

        {/* Sites table */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--ig-dark3)', border: '1px solid var(--ig-border)' }}>
          {/* Table head */}
          <div className="grid px-4 py-3 items-center"
            style={{ gridTemplateColumns: '32px 2fr 110px 110px 90px 90px 1fr 100px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <input type="checkbox" checked={selected.size === filteredSites.length && filteredSites.length > 0}
              onChange={toggleAll} className="accent-amber-400" />
            {['Site Name', 'Status', 'Ping (ms)', '24H Uptime', 'Location', 'Notes', 'Actions'].map(h => (
              <div key={h} style={{ fontSize: '0.62rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {filteredSites.length === 0 ? (
            <div className="py-16 text-center" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>
              No sites match your filter
            </div>
          ) : (
            filteredSites.map((site, idx) => (
              <div
                key={site.id}
                className="grid px-4 py-3 items-center site-row"
                style={{
                  gridTemplateColumns: '32px 2fr 110px 110px 90px 90px 1fr 100px',
                  borderBottom: idx < filteredSites.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  background: selected.has(site.id) ? 'rgba(201,168,76,0.04)' : undefined,
                }}>
                <input type="checkbox" checked={selected.has(site.id)} onChange={() => toggleSelect(site.id)} className="accent-amber-400" />

                {/* Name */}
                <div style={{ fontSize: '0.84rem', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
                  {site.name}
                </div>

                {/* Status */}
                <div><StatusBadge status={site.status} /></div>

                {/* Ping */}
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
                  color: site.status === 'down' ? '#ef4444' : site.status === 'degraded' ? '#f59e0b' : '#4ade80',
                }}>
                  {site.status === 'down' ? '—' : site.pingMs ? `${site.pingMs} ms` : '—'}
                </div>

                {/* Uptime */}
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
                  color: site.uptime24h >= 99 ? '#4ade80' : site.uptime24h >= 80 ? '#fbbf24' : '#f87171',
                }}>
                  {site.status === 'down' ? '0%' : `${site.uptime24h.toFixed(1)}%`}
                </div>

                {/* Location */}
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                  {site.location || '—'}
                </div>

                {/* Notes */}
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {site.notes || '—'}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditSite(site)}
                    className="px-3 py-1 rounded-lg transition-all"
                    style={{ fontSize: '0.72rem', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: '#c9a84c', cursor: 'pointer' }}>
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteSite(site)}
                    className="px-3 py-1 rounded-lg transition-all"
                    style={{ fontSize: '0.72rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer' }}>
                    Del
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-3 flex items-center justify-between" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>
          <span>Showing {filteredSites.length} of {sites.length} sites</span>
          <span>Auto-refreshes every 4 seconds</span>
        </div>
      </main>

      {/* Modals */}
      {editSite && <EditModal site={editSite} onClose={() => setEditSite(null)} onSave={handleSave} />}
      {deleteSite && <ConfirmDelete site={deleteSite} onClose={() => setDeleteSite(null)} onConfirm={() => handleDelete(deleteSite.id)} />}
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      {showBulk && <BulkModal selected={[...selected]} onClose={() => setShowBulk(false)} onBulk={handleBulk} />}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-5 right-5 px-4 py-3 rounded-xl shadow-xl z-50 animate-slideUp"
          style={{
            background: toast.type === 'ok' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${toast.type === 'ok' ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
            color: toast.type === 'ok' ? '#4ade80' : '#f87171',
            fontSize: '0.82rem', fontWeight: 500,
          }}>
          {toast.type === 'ok' ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}
    </div>
  )
}
