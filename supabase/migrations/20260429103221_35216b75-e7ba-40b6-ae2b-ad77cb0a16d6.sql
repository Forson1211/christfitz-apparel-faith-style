
-- Restrict listing of site-assets (objects can still be fetched by direct public URL)
drop policy if exists "Public read site-assets" on storage.objects;

create policy "Authenticated can list site-assets"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'site-assets');

-- Lock down has_role: only callable by the database internals (RLS policies)
revoke execute on function public.has_role(uuid, public.app_role) from anon, authenticated, public;
