# Vercel deployment (frontend + API)

This repo deploys as **one Vercel project**: static React app from `fe/` and Express API from `be-node/` via `api/index.js`.

## Vercel project settings

| Setting | Value |
|---------|-------|
| Root Directory | `.` (repository root) |
| Framework Preset | Other |
| Build Command | `npm run build` (from `vercel.json`) |
| Output Directory | `fe/dist` (from `vercel.json`) |
| Install Command | `npm install` (from `vercel.json`) |

`vercel.json` at the repo root owns routing:

- `/api/*` and `/health` → Express serverless function
- everything else → static files from `fe/dist` (SPA fallback handled by Vercel)

## Required environment variables

Set these on the Vercel project:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g. Neon) |

Optional:

| Variable | Description |
|----------|-------------|
| `CORS_ORIGINS` | Extra comma-separated origins (always includes `http://localhost:5173` for local Vite) |

## Local development

```bash
# From repo root (installs fe + be-node workspaces)
npm install

# Terminal 1 — API on :8081
npm run dev:be

# Terminal 2 — Vite on :5173 (proxies /api and /health to :8081)
npm run dev:fe
```

The frontend uses same-origin paths (`/api/...`). Vite proxies them to the local API.

To point the frontend at a remote API while running Vite locally, create `fe/.env.local`:

```env
VITE_API_BASE_URL=https://your-old-api.vercel.app
```

## Notes

- Migrations run automatically on first API cold start (`be-node` bootstrap).
- Large ZIP imports may hit Vercel request body limits.
- Deploy from the **repository root**, not `be-node/` alone.

## Caching (why production can look “stale”)

Vercel’s CDN caches **hashed** files under `/assets/*` for a long time (that is correct). The **HTML shell** (`index.html`) must stay fresh so it points at the latest JS hashes.

`vercel.json` sets `Cache-Control: no-cache` on `/index.html` and long cache on `/assets/*`.

If the live site still looks old after a deploy:

1. Hard refresh or open in a private window.
2. In DevTools → Network, confirm the main `index-*.js` filename changed after deploy.
3. Redeploy from the latest commit on the branch Vercel builds (not an old preview URL).
