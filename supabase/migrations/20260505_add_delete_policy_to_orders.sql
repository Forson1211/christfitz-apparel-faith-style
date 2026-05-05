-- Add delete policy for admins on orders table
create policy "Admins can delete orders"
  on public.orders for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Add delete policy for admins on profiles table
create policy "Admins can delete profiles"
  on public.profiles for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Note: user_roles already has a delete policy for admins in the generated migration.
-- Note: testimonials already has a delete policy for admins in its own migration.
