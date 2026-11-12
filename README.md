# Lena and Raph’s travel map

World map of countries visited, with a percentage tracker. React + Vite + TypeScript, data in Supabase.

## Setup
1. Create a free project at supabase.com.
2. In the SQL editor, copy `supabase/migrations/0001_visited_countries.sql.example` to `0001_visited_countries.sql` (git-ignored), set your email in it, and run it.
3. Authentication → Providers: make sure Email (magic link) is enabled. Under URL Configuration add your site URL (e.g. `http://localhost:5173`).
4. `cp .env.example .env.local` and fill in the project URL + anon key (Project Settings → API).
5. `npm install && npm run dev`

Anyone can view the map; only the owner email in the migration can edit (enforced by Row Level Security, not just the UI).

## Notes
- Denominator is 195: 193 UN members + Vatican City + Palestine (`npm run gen:countries` regenerates `src/data/countries.json`).
- Tuvalu is missing from the 50m map geometry; tick it in the list below the map.

## Pages
- `/` read-only map and percentage.
- `/edit` sign in (magic link) and tick countries. Static hosts need a rewrite of all paths to `index.html` so `/edit` works on refresh (Vercel/Netlify/Cloudflare Pages: SPA fallback).
