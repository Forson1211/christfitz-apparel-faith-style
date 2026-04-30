-- =============================================
-- ORDERS TABLE
-- =============================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  status text not null default 'pending' check (status in ('pending','processing','fulfilled','cancelled','refunded')),
  total numeric(10,2) not null default 0,
  items jsonb not null default '[]'::jsonb,
  shipping_address jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Admins can read all orders
create policy "Admins read all orders"
  on public.orders for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Anyone can insert orders (Checkout process)
create policy "Anyone can insert orders"
  on public.orders for insert
  to anon, authenticated
  with check (true);

-- Admins can update orders
create policy "Admins update orders"
  on public.orders for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Users can read their own orders
create policy "Users read own orders"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid());

-- =============================================
-- PROFILES: allow admins to read all profiles
-- =============================================
create policy "Admins can view all profiles"
  on public.profiles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Allow users to insert their own profile (needed for trigger / manual insert)
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- =============================================
-- SEED: sample orders for testing
-- =============================================
insert into public.orders (customer_name, customer_email, status, total, items, created_at) values
  ('Michael Chen',  'michael.c@example.com', 'fulfilled',  142.00, '[{"name":"Cocoa Cross Hoodie","qty":1,"price":142}]'::jsonb, now() - interval '1 day'),
  ('Sarah Jenkins', 'sarah.j@example.com',   'processing', 210.00, '[{"name":"Grace Oversized Tee","qty":2,"price":68},{"name":"Faith Knit Beanie","qty":1,"price":38},{"name":"Believer Graphic Tee","qty":1,"price":36}]'::jsonb, now() - interval '2 days'),
  ('David Ampofo',  'david.a@example.com',   'fulfilled',   68.00, '[{"name":"Grace Oversized Tee","qty":1,"price":68}]'::jsonb, now() - interval '3 days'),
  ('Abigail K.',    'abigail.k@example.com', 'cancelled',  118.00, '[{"name":"Salvation Crewneck","qty":1,"price":118}]'::jsonb, now() - interval '3 days'),
  ('Emmanuel Osei', 'emma.o@example.com',    'fulfilled',  426.00, '[{"name":"Eternity Zip Hoodie","qty":2,"price":156},{"name":"Gold Cross Chain","qty":1,"price":89},{"name":"Pilgrim Tote Bag","qty":1,"price":25}]'::jsonb, now() - interval '5 days'),
  ('Jessica T.',    'jess.t@example.com',    'fulfilled',   89.00, '[{"name":"Gold Cross Chain","qty":1,"price":89}]'::jsonb, now() - interval '6 days');
