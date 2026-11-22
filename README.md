# Lena and Raph’s travel map

React, Vite, and TypeScript map of visited countries, backed by Neon Postgres. Anyone can view `/`. The owner signs in at `/edit` with an email link to add and remove countries.

## Set up Neon and run locally

1. Create a Neon project. Open **Postgres database → Data API**, enable it with **Managed Better Auth**, and leave the broad public-schema grant unchecked. The migration grants the app roles access to its table.
2. In **Settings → Better Auth**, enable **Magic Link** and temporarily allow new magic-link users. Turn off email/password signup and sign-in and configure your production SMTP sender under **Email provider**. Add the exact preview and production origins under **Domains**. Enable **Allow Localhost** during local setup.
3. Copy `.env.example` to `.env.local`. Set `VITE_NEON_AUTH_URL` to the Auth base URL and `VITE_NEON_DATA_API_URL` to the Data API URL. Copy both HTTPS endpoints from the Neon console. Keep database connection strings and SMTP credentials out of `VITE_` variables.
4. Run `npm ci` and `npm run dev`. Open `http://localhost:5173/edit`, send a sign-in link to the owner email, and open it. In **Better Auth → Users**, copy the new owner's user ID. Turn off new magic-link registrations. Add the ID as `VITE_NEON_EDITOR_ID` in `.env.local` and restart Vite. The editor ID is public configuration. Postgres enforces authorization independently of the UI.
5. From the repository root, apply the schema using your direct database connection and the same owner ID. Keep the connection string in a private shell session or PostgreSQL service configuration.

   ```sh
   psql -X "$NEON_DB_URL" -v ON_ERROR_STOP=1 -v editor_id="$NEON_EDITOR_ID" \
     -f neon/migrations/0001_visited_countries.sql
   ```

6. In Neon’s **Data API** tab, click **Refresh schema cache**. Open both pages locally. Run `npm run build` before deploying.

## Copy the existing Supabase data

1. Open the Supabase project and resume it if needed. In **Connect**, copy the **Session pooler** connection details. Set `SUPABASE_DB_URL` and `NEON_DB_URL` in a private shell. Use PostgreSQL client tools at least as new as the source server. Choose a private path outside the repository for `TRAVELMAP_BACKUP`.
2. Ask the owner to pause edits on the Supabase version. Export the six-column `visited_countries` table. Restore into the empty Neon table after applying the schema.

   ```sh
   pg_dump --dbname="$SUPABASE_DB_URL" --data-only --table=public.visited_countries \
     --format=custom --file="$TRAVELMAP_BACKUP"
   pg_restore --dbname="$NEON_DB_URL" --single-transaction --no-owner --no-acl "$TRAVELMAP_BACKUP"
   ```

3. Run the query below on both providers. Match the count and sorted row digest before deploying. It covers the country identifiers, name, dates, notes, and creation timestamp. Keep the backup for rollback.

   ```sql
   SET TIME ZONE 'UTC';
   SELECT count(*) AS row_count,
          md5(coalesce(jsonb_agg(to_jsonb(v) ORDER BY v.iso_numeric)::text, '[]')) AS row_digest
   FROM public.visited_countries AS v;
   ```

   A dashboard-only export is also possible. In Supabase SQL Editor, run `SELECT to_jsonb(v)::text AS snapshot_row FROM public.visited_countries AS v ORDER BY iso_numeric` and export the result. Preserve each JSON row during import so that PostgreSQL can reconstruct text identifiers, nulls, and timestamp precision. Verify the same count and digest.

## Deploy and verify

1. Set the three `VITE_NEON_` variables in Vercel for Preview. Build the preview and add its exact HTTPS origin under Neon's trusted domains. The SPA rewrite in `vercel.json` serves `/edit` on direct navigation and refresh.
2. In a signed-out browser, verify the map and percentage against the Supabase version. Repeat after the Neon compute goes idle. Verify that the owner's email link returns to `/edit`, the session survives a reload, and a test country can be added, reloaded, and removed. Verify that the original data digest is restored after the test.
3. Check that both a signed-out visitor and a signed-in non-owner can read the table but cannot change it through the Data API. Use a temporary non-owner test account when needed, with country edits blocked by the owner-ID policy. Confirm retained rows and the same count after denied writes. A filtered delete can succeed with zero rows changed.
4. Set the three variables for Production and deploy to the existing domain. Repeat the map and owner sign-in checks on that domain before resuming edits. Turn off **Allow Localhost** for the production Neon branch when finished testing. Keep the previous Vercel deployment and Supabase backup for rollback. If the new site has accepted edits, reconcile them before rolling back to Supabase.

## Map data

- The denominator is 195, covering 193 UN members, Vatican City, and Palestine. Run `npm run gen:countries` to regenerate `src/data/countries.json`.
- Tuvalu is absent from the 50m map geometry. Use the checklist at `/edit` to mark it visited.
