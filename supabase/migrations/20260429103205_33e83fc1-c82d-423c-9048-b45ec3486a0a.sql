
-- =========================
-- ROLES
-- =========================
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can view their own roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins can view all roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert roles"
  on public.user_roles for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete roles"
  on public.user_roles for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- =========================
-- SITE SETTINGS (key/value)
-- =========================
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "Anyone can read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "Admins can insert site settings"
  on public.site_settings for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update site settings"
  on public.site_settings for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete site settings"
  on public.site_settings for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- =========================
-- NAV LINKS
-- =========================
create table public.nav_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  position int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.nav_links enable row level security;

create policy "Anyone can read nav links"
  on public.nav_links for select to anon, authenticated using (true);
create policy "Admins manage nav links insert"
  on public.nav_links for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage nav links update"
  on public.nav_links for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage nav links delete"
  on public.nav_links for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- =========================
-- CATEGORIES
-- =========================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Anyone can read categories"
  on public.categories for select to anon, authenticated using (true);
create policy "Admins insert categories"
  on public.categories for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update categories"
  on public.categories for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete categories"
  on public.categories for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- =========================
-- PRODUCTS
-- =========================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null,
  category text not null,
  image_url text not null,
  description text,
  details jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  rating numeric(2,1) not null default 5.0,
  reviews int not null default 0,
  verse text,
  position int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can read products"
  on public.products for select to anon, authenticated using (true);
create policy "Admins insert products"
  on public.products for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update products"
  on public.products for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete products"
  on public.products for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- =========================
-- STORAGE BUCKET
-- =========================
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true);

create policy "Public read site-assets"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-assets');

create policy "Admins upload site-assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-assets' and public.has_role(auth.uid(), 'admin'));

create policy "Admins update site-assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-assets' and public.has_role(auth.uid(), 'admin'));

create policy "Admins delete site-assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-assets' and public.has_role(auth.uid(), 'admin'));

-- =========================
-- SEED DATA
-- =========================
insert into public.site_settings (key, value) values
  ('brand', '{"name":"ChristFitz","tagline":"Premium Christian Streetwear"}'::jsonb),
  ('colors', '{"cocoa":"#3B2418","coffee":"#6B4A3A","cream":"#F8F4EF","gold":"#C9A96E"}'::jsonb),
  ('logo', '{"url":"","symbol":"✝"}'::jsonb),
  ('favicon', '{"url":""}'::jsonb),
  ('hero', '{"eyebrow":"Faith · Fashion · Freedom","title":"Wear Your Faith.","titleAccent":"Boldly.","subtitle":"Premium streetwear designed for the modern believer. Crafted with intention. Worn with conviction.","primaryCta":"Shop Collection","secondaryCta":"Our Story"}'::jsonb),
  ('about', '{"eyebrow":"Our Story","title":"Built on faith. Crafted with intention.","body":"ChristFitz Apparel was born from a simple conviction — that faith and fashion were never meant to be separate. Every piece we create is a reminder that style can carry meaning, and that what you wear can speak before you do."}'::jsonb),
  ('footer', '{"text":"Premium streetwear for the modern believer. Crafted with intention.","copyright":"© 2026 ChristFitz Apparel. All rights reserved."}'::jsonb);

insert into public.nav_links (label, href, position) values
  ('Home', '/', 0),
  ('Shop', '/products', 1),
  ('Collections', '/categories', 2),
  ('About', '/about', 3),
  ('Contact', '/contact', 4);

insert into public.categories (name, slug, description, position) values
  ('T-Shirts', 't-shirts', 'Heavyweight oversized tees crafted for everyday devotion.', 0),
  ('Hoodies', 'hoodies', 'Premium fleece hoodies for warmth that lasts.', 1),
  ('Accessories', 'accessories', 'Hand-finished pieces designed in small batches.', 2);

insert into public.products (name, price, category, image_url, description, details, sizes, rating, reviews, verse, position) values
  ('Grace Oversized Tee', 68, 'T-Shirts', '/src/assets/p1.jpg',
   'A heavyweight oversized tee built for everyday devotion. Soft on the skin, bold on the spirit.',
   '["240 GSM heavyweight 100% organic cotton","Oversized boxy fit · drop shoulder","Pre-shrunk · garment-dyed for soft hand feel","Embroidered scripture detail at hem"]'::jsonb,
   '["XS","S","M","L","XL","XXL"]'::jsonb, 4.9, 128, 'Ephesians 2:8', 0),
  ('Cocoa Cross Hoodie', 142, 'Hoodies', '/src/assets/p2.jpg',
   'Our signature cocoa hoodie with embroidered cross. Premium fleece for warmth that lasts.',
   '["450 GSM brushed fleece interior","Relaxed streetwear silhouette","Reinforced double-stitched seams","YKK metal hardware · ribbed cuffs"]'::jsonb,
   '["S","M","L","XL","XXL"]'::jsonb, 5.0, 214, 'Galatians 2:20', 1),
  ('Faith Knit Beanie', 38, 'Accessories', '/src/assets/p3.jpg',
   'A finely knit beanie in warm tones. Subtle. Spiritual. Always in season.',
   '["Premium hand-finished construction","Designed in-house · made in small batches","Engraved ChristFitz signature mark","Comes in branded gift packaging"]'::jsonb,
   '["One Size"]'::jsonb, 4.8, 76, 'Hebrews 11:1', 2),
  ('Salvation Crewneck', 118, 'Hoodies', '/src/assets/p4.jpg',
   'Clean-cut crewneck made for layering. Heavyweight comfort, minimalist soul.',
   '["450 GSM brushed fleece interior","Relaxed streetwear silhouette","Reinforced double-stitched seams","YKK metal hardware · ribbed cuffs"]'::jsonb,
   '["S","M","L","XL","XXL"]'::jsonb, 4.9, 167, 'Romans 10:9', 3),
  ('Believer Graphic Tee', 72, 'T-Shirts', '/src/assets/p5.jpg',
   'Statement graphic tee with hand-drawn typography. Wear your conviction loud.',
   '["240 GSM heavyweight 100% organic cotton","Oversized boxy fit · drop shoulder","Pre-shrunk · garment-dyed for soft hand feel","Embroidered scripture detail at hem"]'::jsonb,
   '["XS","S","M","L","XL","XXL"]'::jsonb, 4.7, 92, 'Mark 9:23', 4),
  ('Eternity Zip Hoodie', 156, 'Hoodies', '/src/assets/p6.jpg',
   'Full-zip hoodie engineered for movement. Luxe weight, eternal style.',
   '["450 GSM brushed fleece interior","Relaxed streetwear silhouette","Reinforced double-stitched seams","YKK metal hardware · ribbed cuffs"]'::jsonb,
   '["S","M","L","XL","XXL"]'::jsonb, 4.9, 188, 'John 3:16', 5),
  ('Gold Cross Chain', 89, 'Accessories', '/src/assets/p7.jpg',
   'An 18k gold-plated cross pendant on a refined cuban link chain.',
   '["Premium hand-finished construction","Designed in-house · made in small batches","Engraved ChristFitz signature mark","Comes in branded gift packaging"]'::jsonb,
   '["One Size"]'::jsonb, 5.0, 244, '1 Corinthians 1:18', 6),
  ('Pilgrim Tote Bag', 54, 'Accessories', '/src/assets/p8.jpg',
   'Heavyweight canvas tote built to carry your essentials and your faith.',
   '["Premium hand-finished construction","Designed in-house · made in small batches","Engraved ChristFitz signature mark","Comes in branded gift packaging"]'::jsonb,
   '["One Size"]'::jsonb, 4.8, 61, 'Hebrews 11:13', 7);
