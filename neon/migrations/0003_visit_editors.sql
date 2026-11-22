BEGIN;

CREATE SCHEMA travelmap_private;
REVOKE ALL ON SCHEMA travelmap_private FROM PUBLIC, anonymous, authenticated;

CREATE TABLE travelmap_private.visit_editors (
  user_id text PRIMARY KEY,
  scope text NOT NULL UNIQUE CHECK (scope IN ('owner', 'elena'))
);

INSERT INTO travelmap_private.visit_editors (user_id, scope) VALUES (:'editor_id', 'owner');

CREATE FUNCTION public.get_visit_editor_scope()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT scope FROM travelmap_private.visit_editors WHERE user_id = (SELECT auth.user_id());
$$;

REVOKE EXECUTE ON FUNCTION public.get_visit_editor_scope() FROM PUBLIC, anonymous;
GRANT EXECUTE ON FUNCTION public.get_visit_editor_scope() TO authenticated;

-- Keep direct table writes subject to the existing owner-only RLS policies.
CREATE OR REPLACE FUNCTION public.set_country_visit(
  country_id text,
  country_alpha3 text,
  country_name text,
  visit_group text,
  checked boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  editor_scope text := public.get_visit_editor_scope();
  saved public.visited_countries;
BEGIN
  IF visit_group IS NULL OR visit_group NOT IN ('raph', 'elena', 'together') OR checked IS NULL THEN
    RAISE EXCEPTION 'Invalid visit' USING ERRCODE = '22023';
  END IF;

  IF editor_scope IS NULL OR (editor_scope = 'elena' AND visit_group <> 'elena') THEN
    RAISE EXCEPTION 'You cannot edit these visits.' USING ERRCODE = '42501';
  END IF;

  -- Merge against the current row and protect shared trips under the same row lock.
  INSERT INTO public.visited_countries AS existing (iso_numeric, iso_alpha3, name, raph, elena, together)
  VALUES (
    country_id,
    country_alpha3,
    country_name,
    checked AND visit_group IN ('raph', 'together'),
    checked AND visit_group IN ('elena', 'together'),
    checked AND visit_group = 'together'
  )
  ON CONFLICT (iso_numeric) DO UPDATE SET
    raph = CASE
      WHEN visit_group = 'raph' THEN checked
      WHEN visit_group = 'together' AND checked THEN true
      ELSE existing.raph
    END,
    elena = CASE
      WHEN visit_group = 'elena' THEN checked
      WHEN visit_group = 'together' AND checked THEN true
      ELSE existing.elena
    END,
    together = CASE
      WHEN visit_group = 'together' THEN checked
      WHEN NOT checked THEN false
      ELSE existing.together
    END
  WHERE editor_scope = 'owner' OR checked OR NOT existing.together
  RETURNING existing.* INTO saved;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only Raph can change a shared trip.' USING ERRCODE = '42501';
  END IF;

  IF NOT (saved.raph OR saved.elena OR saved.together) THEN
    DELETE FROM public.visited_countries WHERE iso_numeric = country_id;
  END IF;

  RETURN jsonb_build_object('raph', saved.raph, 'elena', saved.elena, 'together', saved.together);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_country_visit(text, text, text, text, boolean) FROM PUBLIC, anonymous;
GRANT EXECUTE ON FUNCTION public.set_country_visit(text, text, text, text, boolean) TO authenticated;

COMMIT;
