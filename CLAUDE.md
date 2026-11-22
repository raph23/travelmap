# Travel Map

Lena and Raph's travel map highlights visited countries and shows the percentage of the world's countries visited. React + Vite + TypeScript, data in Neon, hosting on Vercel.

## Commands
- `npm run dev`: dev server at http://localhost:5173
- `npm run build`: type-check (`tsc --noEmit`) then production build
- `npm run gen:countries`: regenerate `src/data/countries.json` from `world-countries`

## Structure
- `src/pages/HomePage.tsx`: read-only map + stats at `/`
- `src/pages/EditPage.tsx`: admin page at `/edit` (magic-link sign-in + country checklist). Intentionally not linked from the home page.
- `src/App.tsx`: tiny pathname router (no router library); exports `navigate()`
- `src/hooks/useVisited.ts`: loads the visited set and updates the checkboxes optimistically with rollback on failure
- `src/lib/neon.ts`: browser client for Managed Better Auth and the Data API
- `src/components/WorldMap.tsx`: `react-simple-maps` with `world-atlas` 50m TopoJSON
- `src/data/countries.ts` / `.json`: the 195-country denominator (193 UN members + Vatican City + Palestine)
- `neon/migrations/`: active SQL schema and RLS policies

## Conventions and gotchas
- Countries are keyed by ISO 3166-1 numeric code (string, zero-padded), which matches `world-atlas` feature ids. Tuvalu has no geometry in the atlas, so it is only tickable in the list.
- Percentage = visited countries in the 195 list / 195. Atlas features outside the list are drawn but not counted.
- A shared trip counts for Raph and Elena individually and in Together. Independent visits to the same country have no effect on the Together total. Use `set_country_visit` for edits so simultaneous updates to different groups merge against the current row.
- Neon RLS reserves direct table writes for the owner. The `set_country_visit` RPC checks Neon user IDs in `travelmap_private.visit_editors`. Elena can edit her own visits outside shared trips. Raph can edit all visits. The UI uses `get_visit_editor_scope` to show the matching controls.
- Vite inlines `VITE_NEON_AUTH_URL` and `VITE_NEON_DATA_API_URL` at build time. Use the public HTTPS endpoints from Neon. Keep database connection strings and SMTP credentials out of browser configuration and Git.
- Magic links redirect to `/edit` on the origin that requested them. Add that origin to Neon's trusted domains.
- The Supabase migration template is useful for recovering or comparing the original database during the cutover.
- Fonts are self-hosted via `@fontsource-variable/dm-sans`; avoid external font CDNs.
- Hosting on Vercel needs `vercel.json` (SPA rewrite) so `/edit` works on refresh.
