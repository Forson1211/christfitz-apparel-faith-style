
-- ============================================================
-- FIX: GRANT EXECUTE PERMISSIONS ON has_role
-- ============================================================
-- This is critical for RLS policies to function for anonymous users.
-- Without this, any policy calling has_role will cause a 403 Forbidden
-- for the 'anon' role, even if they are only trying to read public data.

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

-- Ensure the public can also execute the save_content_item if they are authenticated
-- (The function itself checks for admin role inside, so this is safe)
GRANT EXECUTE ON FUNCTION public.save_content_item(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, INTEGER) TO anon, authenticated, service_role;
