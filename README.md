# Imarat Group — Network Status Monitor

A real-time network monitoring dashboard for Imarat Group of Companies. Built with Next.js 15, deployable to Vercel in one click.

## Features
- Public live status page with sparklines, uptime bars, animated loading screen
- Admin panel: add/edit/delete sites, bulk update statuses, live clock
- Changes in admin reflect on public page within 5 seconds
- Realistic ping jitter simulation for online sites
- Search + filter in admin
- JWT auth via HTTP-only cookies

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/imarat-nms.git
cd imarat-nms
npm install
cp .env.example .env.local
# Edit .env.local and set JWT_SECRET
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Import repo at vercel.com
3. Add environment variable: `JWT_SECRET` = a 32+ character random string
4. Deploy

Generate a secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Environment Variables

| Variable | Description |
|---|---|
| `JWT_SECRET` | JWT signing key (required) |

## Pages
- `/` — Public status page
- `/admin` — Admin dashboard  
- `/admin/login` — Admin login

## Notes
- Data is in-memory; resets on Vercel cold starts. Integrate Vercel KV for persistence.
- Admin credentials live in `src/lib/auth.ts` — move to env vars for production hardening.
