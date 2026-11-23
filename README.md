# Travel Map

React, Vite, and TypeScript map of visited countries, backed by Neon Postgres. Anyone can view the map and percentages for individual and shared trips. Editors sign in at `/edit` with email links. The owner can edit every group, and the limited editor can edit their own individual visits.

## Set up Neon and run locally

1. Create a Neon project. Open **Postgres database → Data API**, enable it with **Managed Better Auth**, and leave the broad public-schema grant unchecked. The migration grants the app roles access to its table.
2. In **Settings → Better Auth**, enable **Magic Link** and temporarily allow new magic-link users. Turn off email/password signup and sign-in. TravelMap uses Neon's shared email sender. Dedicated SMTP is optional. Add the exact preview and production origins under **Domains**. Enable **Allow Localhost** during local setup.
3. Copy `.env.example` to `.env.local`. Set `VITE_NEON_AUTH_URL` to the Auth base URL and `VITE_NEON_DATA_API_URL` to the Data API URL. Copy both HTTPS endpoints from the Neon console. Keep database connection strings and SMTP credentials out of `VITE_` variables.
4. Run `npm ci` and `npm run dev`. Open `http://localhost:5173/edit`, send a sign-in link to the owner email, and open it. In **Better Auth → Users**, copy the new owner's user ID. Turn off new magic-link registrations. Set `NEON_EDITOR_ID` in your migration shell. Postgres uses that ID to authorize the owner.
5. From the repository root, apply the schema using your direct database connection and the same owner ID. Keep the connection string in a private shell session or PostgreSQL service configuration.

   ```sh
   psql -X "$NEON_DB_URL" -v ON_ERROR_STOP=1 -v editor_id="$NEON_EDITOR_ID" \
     -f neon/migrations/0001_visited_countries.sql
   psql -X "$NEON_DB_URL" -v ON_ERROR_STOP=1 -f neon/migrations/0002_visit_groups.sql
   psql -X "$NEON_DB_URL" -v ON_ERROR_STOP=1 -v editor_id="$NEON_EDITOR_ID" \
     -f neon/migrations/0003_visit_editors.sql
   ```

6. In Neon’s **Data API** tab, click **Refresh schema cache**. Open both pages locally. Run `npm run build` before deploying.

## Add a limited editor

1. In **Better Auth**, create an app user or look up the editor’s existing account. Copy the Neon user ID. Keep new magic-link registrations disabled.
2. Set `NEON_LIMITED_EDITOR_ID` to the user ID and `NEON_EDITOR_SCOPE` to the limited scope defined in the [editor migration](neon/migrations/0003_visit_editors.sql#L8). Register the account in the private editor table.

   ```sh
   psql -X "$NEON_DB_URL" -v ON_ERROR_STOP=1 \
     -v editor_id="$NEON_LIMITED_EDITOR_ID" -v editor_scope="$NEON_EDITOR_SCOPE" <<'SQL'
   INSERT INTO travelmap_private.visit_editors (user_id, scope) VALUES (:'editor_id', :'editor_scope');
   SQL
   ```

3. The editor can request a sign-in link at `/edit`.

## Deploy and verify

1. Set the two `VITE_NEON_` endpoint variables in Vercel for Preview. Build the preview and add its exact HTTPS origin under Neon's trusted domains. The SPA rewrite in `vercel.json` serves `/edit` on direct navigation and refresh.
2. In a signed-out browser, verify the counts and map highlights for all three groups. Repeat after the Neon compute goes idle. Verify that the owner's email link returns to `/edit`, the session survives a reload, and an individual visit and a shared trip persist with the right totals. Restore the original data after testing.
3. Verify that signed-out visitors and accounts outside the editor table have read-only access. Confirm the limited editor can save their individual visits and that Postgres denies attempts to change the owner’s individual visits or shared trips.
4. Set the endpoint variables for Production and deploy to the existing domain. Repeat the map and sign-in checks on that domain before resuming edits. Turn off **Allow Localhost** for the production Neon branch when finished testing.

## Map data

- Select one of the three percentages to highlight its countries on the map. Together means a shared trip and counts toward both individual totals. Independent visits to the same country count individually.
- On an existing Neon database, apply `0002_visit_groups.sql` and refresh the Data API schema cache before deploying the updated app. The migration marks existing countries as trips together.
- The denominator is 195, covering 193 UN members, Vatican City, and Palestine. Run `npm run gen:countries` to regenerate `src/data/countries.json`.
- Tuvalu is absent from the 50m map geometry. Use the checklist at `/edit` to mark it visited.
