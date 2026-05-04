
-- ============================================================
-- UPDATE save_content_item TO SUPPORT POSITION
-- ============================================================

-- Drop the old version first
DROP FUNCTION IF EXISTS public.save_content_item(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB);

CREATE OR REPLACE FUNCTION public.save_content_item(
  p_name     TEXT,
  p_url      TEXT,
  p_file_path TEXT,
  p_type     TEXT,
  p_category TEXT,
  p_metadata JSONB,
  p_position INTEGER DEFAULT 0
)
RETURNS SETOF public.content
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  inserted public.content;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  INSERT INTO public.content (name, url, file_path, type, category, metadata, position)
  VALUES (p_name, p_url, p_file_path, p_type, p_category, p_metadata, p_position)
  RETURNING * INTO inserted;

  RETURN NEXT inserted;
  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_content_item(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, INTEGER) TO authenticated;
