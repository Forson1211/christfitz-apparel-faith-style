
create or replace function public.bootstrap_first_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_count int;
  uid uuid;
begin
  uid := auth.uid();
  if uid is null then
    return false;
  end if;

  select count(*) into admin_count from public.user_roles where role = 'admin';

  if admin_count = 0 then
    insert into public.user_roles (user_id, role) values (uid, 'admin')
    on conflict (user_id, role) do nothing;
    return true;
  end if;

  return false;
end;
$$;

grant execute on function public.bootstrap_first_admin() to authenticated;
