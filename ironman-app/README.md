# Ironman Trainer

14-week Ironman training plan app for Ash. Structured workouts, progress tracking, race pacing — built as a mobile-first PWA.

**Race:** July 12, 2026 · **Goal:** 12:00–13:00 · **Athlete:** 29M, 78kg

## Quick start (local)

```bash
npm install
npm run dev
```

The app works immediately with localStorage — no database needed for local use.

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project → Select the repo
3. Vercel auto-detects Vite — no config needed
4. Click Deploy

### Add Supabase (optional, for persistent storage)

Without Supabase, data lives in the browser (localStorage). With Supabase, completed workouts and metrics sync to a database so they persist across devices and browser clears.

1. Go to [supabase.com](https://supabase.com) → Create a new project
2. Open the SQL Editor → paste the contents of `supabase/schema.sql` → Run
3. Go to Settings → API → copy your **Project URL** and **anon public** key
4. In Vercel: Settings → Environment Variables → add:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
5. Redeploy

### Add to iPhone home screen

Once deployed:
1. Open the URL in Safari on iPhone
2. Tap the Share button (square with arrow)
3. Tap "Add to Home Screen"
4. It now works like a native app — full screen, offline capable, purple icon

## Project structure

```
src/
  App.jsx          — The entire app (plan, dashboard, progress, zones)
  lib/
    supabase.js    — Supabase client
    storage.js     — Storage abstraction (Supabase + localStorage fallback)
  main.jsx         — Entry point + service worker registration
public/
  manifest.json    — PWA manifest
  sw.js            — Service worker for offline caching
  icon-192.png     — Home screen icon
  icon-512.png     — Splash screen icon
supabase/
  schema.sql       — Database schema (run in Supabase SQL editor)
```

## Tech stack

- **React 19** + **Vite 8** — fast dev and build
- **Recharts** — charts (volume, distance, compliance)
- **Supabase** — Postgres database + API (optional)
- **PWA** — offline support, home screen install on iPhone
