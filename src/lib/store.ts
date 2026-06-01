// In-memory store that persists during Vercel serverless warm instances
// For production persistence, swap this with Vercel KV / PlanetScale / Supabase

export type SiteStatus = 'online' | 'degraded' | 'down'

export interface Site {
  id: string
  name: string
  status: SiteStatus
  pingMs: number | null
  uptime24h: number // percentage 0-100
  location?: string
  notes?: string
  updatedAt: string
  history: number[] // last 60 ping samples for sparkline
}

const SITE_NAMES = [
  'Amazon Mall',
  'Golf Floras Sales Office',
  'Golf Floras Project Site',
  'Imarat Downtown',
  'IR 1',
  'IR 2',
  'G11 CYBM',
  'Florence Galleria',
  'Builders Mall',
  'Bavylon Multan',
  'GRO Lahore',
  'Warehouse',
  'Record Room',
  'Printing Press',
  'Sialkot Office',
  'Beverly',
  'GRO RWP',
  'Bahria Phase 7',
  'Peshawar Graana',
  'Multan Office',
  'GRO Karachi',
  'Quetta Office',
  'Agency21 Blue Area',
  'Civic Center',
  'Peshawar Agency21',
  'Mardan Office',
  'Site Office GT Road',
  'Faisalabad Office',
  'DHA E Block',
]

function generateHistory(basePing: number, status: SiteStatus): number[] {
  const arr: number[] = []
  for (let i = 0; i < 60; i++) {
    if (status === 'down') {
      arr.push(0)
    } else if (status === 'degraded') {
      const v = basePing + Math.random() * 180 - 20
      arr.push(Math.max(10, Math.round(v)))
    } else {
      const jitter = (Math.random() - 0.5) * 8
      arr.push(Math.max(5, Math.round(basePing + jitter)))
    }
  }
  return arr
}

function makeDefaultSites(): Site[] {
  const basePings = [12, 18, 16, 20, 15, 22, 23, 14, 17, 19, 21, 16, 13, 25, 11, 18, 14, 20, 24, 16, 22, 15, 13, 17, 19, 21, 18, 14, 16]
  return SITE_NAMES.map((name, i) => {
    const ping = basePings[i] ?? 18
    return {
      id: `site-${i + 1}`,
      name,
      status: 'online',
      pingMs: ping,
      uptime24h: 99 + Math.random() * 0.99,
      location: '',
      notes: '',
      updatedAt: new Date().toISOString(),
      history: generateHistory(ping, 'online'),
    }
  })
}

// Global singleton — survives warm Vercel invocations
declare global {
  // eslint-disable-next-line no-var
  var __imaratSites: Site[] | undefined
}

export function getSites(): Site[] {
  if (!global.__imaratSites) {
    global.__imaratSites = makeDefaultSites()
  }
  return global.__imaratSites
}

export function getSiteById(id: string): Site | undefined {
  return getSites().find((s) => s.id === id)
}

export function updateSite(id: string, patch: Partial<Site>): Site | null {
  const sites = getSites()
  const idx = sites.findIndex((s) => s.id === id)
  if (idx === -1) return null
  const updated: Site = {
    ...sites[idx],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  }
  // Rebuild history if status changed
  if (patch.status && patch.status !== sites[idx].status) {
    const ping = patch.pingMs ?? updated.pingMs ?? 15
    updated.history = generateHistory(ping, patch.status)
    if (patch.status === 'down') {
      updated.pingMs = null
      updated.uptime24h = 0
    } else if (patch.status === 'degraded') {
      updated.pingMs = patch.pingMs ?? Math.round(150 + Math.random() * 150)
      updated.uptime24h = patch.uptime24h ?? Math.round(70 + Math.random() * 20)
    } else {
      updated.pingMs = patch.pingMs ?? sites[idx].pingMs ?? 15
      updated.uptime24h = patch.uptime24h ?? 99 + Math.random() * 0.99
    }
  }
  sites[idx] = updated
  global.__imaratSites = sites
  return updated
}

export function addSite(data: { name: string; location?: string; notes?: string }): Site {
  const sites = getSites()
  const ping = Math.round(10 + Math.random() * 20)
  const site: Site = {
    id: `site-${Date.now()}`,
    name: data.name,
    status: 'online',
    pingMs: ping,
    uptime24h: 99 + Math.random() * 0.99,
    location: data.location ?? '',
    notes: data.notes ?? '',
    updatedAt: new Date().toISOString(),
    history: generateHistory(ping, 'online'),
  }
  sites.push(site)
  global.__imaratSites = sites
  return site
}

export function deleteSite(id: string): boolean {
  const sites = getSites()
  const idx = sites.findIndex((s) => s.id === id)
  if (idx === -1) return false
  sites.splice(idx, 1)
  global.__imaratSites = sites
  return true
}

// Tick random jitter for "live" feel — called by API polling
export function tickSites(): void {
  const sites = getSites()
  for (const site of sites) {
    if (site.status === 'online' && site.pingMs !== null) {
      const jitter = (Math.random() - 0.5) * 6
      const newPing = Math.max(5, Math.round(site.pingMs + jitter))
      site.pingMs = newPing
      site.history = [...site.history.slice(1), newPing]
      // Uptime stays 99.x%
      site.uptime24h = Math.min(100, site.uptime24h + (Math.random() - 0.3) * 0.005)
    } else if (site.status === 'degraded' && site.pingMs !== null) {
      const v = site.pingMs + (Math.random() - 0.5) * 40
      const newPing = Math.max(80, Math.round(v))
      site.pingMs = newPing
      site.history = [...site.history.slice(1), newPing]
    }
  }
  global.__imaratSites = sites
}
