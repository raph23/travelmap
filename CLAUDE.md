# Travel Map

Lena and Raph's travel map: a world map highlighting visited countries, with the percentage of the world's countries visited. React + Vite + TypeScript, data in Supabase, planned hosting on Vercel.

## Commands
- `npm run dev`: dev server at http://localhost:5173
- `npm run build`: type-check (`tsc --noEmit`) then production build
- `npm run gen:countries`: regenerate `src/data/countries.json` from `world-countries`

## Structure
- `src/pages/HomePage.tsx`: read-only map + stats at `/`
- `src/pages/EditPage.tsx`: admin page at `/edit` (magic-link sign-in + country checklist). Intentionally not linked from the home page.
- `src/App.tsx`: tiny pathname router (no router library); exports `navigate()`
- `src/hooks/useVisited.ts`: `useSession()` and `useVisited(canEdit)` (loads visited set, optimistic toggle with rollback)
- `src/components/WorldMap.tsx`: `react-simple-maps` with `world-atlas` 50m TopoJSON
- `src/data/countries.ts` / `.json`: the 195-country denominator (193 UN members + Vatican City + Palestine)
- `supabase/migrations/`: SQL schema and RLS policies

## Conventions and gotchas
- Countries are keyed by ISO 3166-1 numeric code (string, zero-padded), which matches `world-atlas` feature ids. Tuvalu has no geometry in the atlas, so it is only tickable in the list.
- Percentage = visited countries in the 195 list / 195. Atlas features outside the list are drawn but not counted.
- Only the owner's email can write; this is enforced by Supabase RLS, not the UI. The UI just hides editing.
- `supabase/migrations/0001_visited_countries.sql` is git-ignored because it contains the owner's email. The committed template is `0001_visited_countries.sql.example`. Never commit the real file or `.env.local`.
- The Supabase anon key is public by design; never use the service_role key in this app.
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (see `.env.example`). Vite inlines them at build time.
- Auth magic links redirect to `<origin>/edit`; the origin must be in Supabase's Redirect URLs.
- Fonts are self-hosted via `@fontsource-variable/dm-sans`; avoid external font CDNs.
- Hosting on Vercel needs `vercel.json` (SPA rewrite) so `/edit` works on refresh.
