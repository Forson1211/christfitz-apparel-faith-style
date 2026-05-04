-- Create testimonials table
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  text text not null,
  rating int not null default 5,
  avatar_url text,
  position int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.testimonials enable row level security;

-- Policies
create policy "Anyone can read testimonials"
  on public.testimonials for select to anon, authenticated using (true);

create policy "Admins manage testimonials"
  on public.testimonials for all to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Seed data based on existing testimonials
insert into public.testimonials (name, role, text, rating, position) values
  ('Sarah Chen', 'Student', 'Soft, oversized, perfect drape. ChristFitz is now 80% of my closet — and I''m not sorry.', 5, 0),
  ('Marcus Bell', 'Youth Pastor', 'Wearing my faith has never felt this fresh. The cocoa hoodie is a 10/10.', 5, 1),
  ('Kojo Mensah', 'Software Architect', 'The MTN MoMo integration is a game-changer for my local clients in Ghana. Fast and reliable.', 5, 2),
  ('Sarah Smith', 'Content Creator', 'Beautiful templates that actually match my brand. My clients are always impressed.', 5, 3),
  ('Maya Johnson', 'Worship Leader', 'The quality is unreal. I get compliments every single time I wear my hoodie. Feels like wearing a prayer.', 5, 4);
