BEGIN;

-- The existing map records trips together. Legacy inserts also represent shared trips.
ALTER TABLE public.visited_countries
  ADD COLUMN raph boolean NOT NULL DEFAULT true,
  ADD COLUMN elena boolean NOT NULL DEFAULT true,
  ADD COLUMN together boolean NOT NULL DEFAULT true,
  ADD CONSTRAINT together_requires_both_visitors CHECK (NOT together OR (raph AND elena));

CREATE FUNCTION public.set_country_visit(
  country_id text,
  country_alpha3 text,
  country_name text,
  visit_group text,
  checked boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  saved public.visited_countries;
BEGIN
  IF visit_group IS NULL OR visit_group NOT IN ('raph', 'elena', 'together') OR checked IS NULL THEN
    RAISE EXCEPTION 'Invalid visit' USING ERRCODE = '22023';
  END IF;

  -- Merge against the current row so edits to different groups do not overwrite each other.
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
  RETURNING existing.* INTO saved;

  IF NOT (saved.raph OR saved.elena OR saved.together) THEN
    DELETE FROM public.visited_countries WHERE iso_numeric = country_id;
  END IF;

  RETURN jsonb_build_object('raph', saved.raph, 'elena', saved.elena, 'together', saved.together);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_country_visit(text, text, text, text, boolean) FROM PUBLIC, anonymous;
GRANT EXECUTE ON FUNCTION public.set_country_visit(text, text, text, text, boolean) TO authenticated;

COMMIT;
