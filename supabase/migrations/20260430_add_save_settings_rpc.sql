
-- Function to safely save site settings, bypassing PostgREST schema cache issues
CREATE OR REPLACE FUNCTION public.save_site_setting(p_key TEXT, p_value JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access Denied: Only admins can save settings.';
  END IF;

  INSERT INTO public.site_settings (key, value, updated_at)
  VALUES (p_key, p_value, now())
  ON CONFLICT (key)
  DO UPDATE SET value = p_value, updated_at = now();
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.save_site_setting(TEXT, JSONB) TO authenticated;

-- Function to safely log content items
CREATE OR REPLACE FUNCTION public.save_content_item(
  p_name TEXT, 
  p_url TEXT, 
  p_file_path TEXT, 
  p_type TEXT, 
  p_category TEXT, 
  p_metadata JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  INSERT INTO public.content (name, url, file_path, type, category, metadata)
  VALUES (p_name, p_url, p_file_path, p_type, p_category, p_metadata);
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_content_item(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;
