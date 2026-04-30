-- ============================================================
-- ENABLE REALTIME ON content TABLE
-- ============================================================
-- This allows Supabase Realtime to broadcast INSERT/UPDATE/DELETE
-- events to all subscribed clients (admin + website).
ALTER TABLE public.content REPLICA IDENTITY FULL;

-- Add content table to the realtime publication
-- (Safe to run even if already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND tablename = 'content'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.content;
  END IF;
END $$;


-- ============================================================
-- UPDATE save_content_item TO RETURN THE INSERTED ROW
-- ============================================================
-- The original function returned VOID. We change it to return
-- the full content row so the frontend can update state instantly
-- without a separate fetch.

-- Must drop the function first since we are changing its return type
DROP FUNCTION IF EXISTS public.save_content_item(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB);

CREATE OR REPLACE FUNCTION public.save_content_item(
  p_name     TEXT,
  p_url      TEXT,
  p_file_path TEXT,
  p_type     TEXT,
  p_category TEXT,
  p_metadata JSONB
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

  INSERT INTO public.content (name, url, file_path, type, category, metadata)
  VALUES (p_name, p_url, p_file_path, p_type, p_category, p_metadata)
  RETURNING * INTO inserted;

  RETURN NEXT inserted;
  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_content_item(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;


-- ============================================================
-- FIX RLS: Ensure admins can DELETE content rows they created
-- (required for the delete sync to work correctly)
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage content" ON public.content;

CREATE POLICY "Admins can manage content"
  ON public.content FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
