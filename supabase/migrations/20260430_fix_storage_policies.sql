-- Ensure the bucket itself is marked as public so getPublicUrl works
update storage.buckets set public = true where id = 'site-assets';
insert into storage.buckets (id, name, public) 
  select 'site-assets', 'site-assets', true 
  where not exists (select 1 from storage.buckets where id = 'site-assets');

-- Drop existing restrictive storage policies
drop policy if exists "Admins upload site-assets" on storage.objects;
drop policy if exists "Admins update site-assets" on storage.objects;
drop policy if exists "Admins delete site-assets" on storage.objects;
drop policy if exists "Public read site-assets" on storage.objects;

-- Recreate with simpler, working policies
-- Allow anyone to read public assets
create policy "Public read site-assets"
  on storage.objects for select
  using (bucket_id = 'site-assets');

-- Allow any authenticated user to upload (simpler check to avoid 08P01)
create policy "Authenticated upload site-assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-assets');

-- Allow any authenticated user to update
create policy "Authenticated update site-assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-assets');

-- Allow any authenticated user to delete
create policy "Authenticated delete site-assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-assets');
