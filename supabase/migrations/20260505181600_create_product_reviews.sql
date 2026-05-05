create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(product_id, user_id)
);

alter table public.product_reviews enable row level security;

create policy "Product reviews are viewable by everyone."
  on public.product_reviews for select
  using ( true );

create policy "Authenticated users can insert reviews."
  on public.product_reviews for insert
  to authenticated
  with check ( auth.uid() = user_id );

create policy "Users can update their own reviews."
  on public.product_reviews for update
  to authenticated
  using ( auth.uid() = user_id );

create policy "Users can delete their own reviews."
  on public.product_reviews for delete
  to authenticated
  using ( auth.uid() = user_id );

-- Trigger to update products rating and reviews count
create or replace function public.update_product_rating()
returns trigger
language plpgsql
security definer
as $$
declare
  v_avg_rating numeric;
  v_review_count integer;
  v_product_id uuid;
begin
  if TG_OP = 'DELETE' then
    v_product_id := OLD.product_id;
  else
    v_product_id := NEW.product_id;
  end if;

  select count(*), coalesce(avg(rating), 0)
  into v_review_count, v_avg_rating
  from public.product_reviews
  where product_id = v_product_id;

  update public.products
  set 
    rating = v_avg_rating,
    reviews = v_review_count
  where id = v_product_id;

  return null;
end;
$$;

drop trigger if exists update_product_rating_trigger on public.product_reviews;
create trigger update_product_rating_trigger
after insert or update or delete
on public.product_reviews
for each row
execute function public.update_product_rating();
