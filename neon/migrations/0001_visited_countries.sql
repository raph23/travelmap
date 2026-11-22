-- Run after enabling Neon Data API. Pass the verified owner's Neon ID with psql -v editor_id=….
BEGIN;

CREATE TABLE public.visited_countries (
  iso_numeric text PRIMARY KEY,
  iso_alpha3 text NOT NULL,
  name text NOT NULL,
  visited_on date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.visited_countries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.visited_countries FROM PUBLIC, anonymous, authenticated;
GRANT USAGE ON SCHEMA public TO anonymous, authenticated;
GRANT SELECT ON TABLE public.visited_countries TO anonymous, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.visited_countries TO authenticated;

CREATE POLICY "public read" ON public.visited_countries
  FOR SELECT TO anonymous, authenticated USING (true);

CREATE POLICY "owner insert" ON public.visited_countries
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.user_id()) = :'editor_id');

CREATE POLICY "owner update" ON public.visited_countries
  FOR UPDATE TO authenticated
  USING ((SELECT auth.user_id()) = :'editor_id')
  WITH CHECK ((SELECT auth.user_id()) = :'editor_id');

CREATE POLICY "owner delete" ON public.visited_countries
  FOR DELETE TO authenticated USING ((SELECT auth.user_id()) = :'editor_id');

COMMIT;
