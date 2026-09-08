create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and is_active = true limit 1;
$$;

-- Remove the initial broad CRUD policies before replacing them with role-aware rules.
drop policy if exists "activities_authenticated_all" on public.contact_activities;
drop policy if exists "followups_authenticated_all" on public.follow_ups;
drop policy if exists "tasks_authenticated_all" on public.tasks;
drop policy if exists "registrations_authenticated_all" on public.registrations;

create policy "activities_authenticated_read" on public.contact_activities
for select to authenticated using (true);
create policy "activities_staff_write" on public.contact_activities
for insert to authenticated
with check (public.current_role() in ('admin','manager','sales','support'));
create policy "activities_staff_update" on public.contact_activities
for update to authenticated
using (public.current_role() in ('admin','manager','sales','support'))
with check (public.current_role() in ('admin','manager','sales','support'));
create policy "activities_admin_delete" on public.contact_activities
for delete to authenticated using (public.is_admin());

create policy "followups_authenticated_read" on public.follow_ups
for select to authenticated using (true);
create policy "followups_staff_write" on public.follow_ups
for insert to authenticated
with check (public.current_role() in ('admin','manager','sales','support'));
create policy "followups_staff_update" on public.follow_ups
for update to authenticated
using (public.current_role() in ('admin','manager','sales','support'))
with check (public.current_role() in ('admin','manager','sales','support'));
create policy "followups_admin_delete" on public.follow_ups
for delete to authenticated using (public.is_admin());

create policy "tasks_authenticated_read" on public.tasks
for select to authenticated using (true);
create policy "tasks_staff_write" on public.tasks
for insert to authenticated
with check (public.current_role() in ('admin','manager','sales','support'));
create policy "tasks_staff_update" on public.tasks
for update to authenticated
using (public.current_role() in ('admin','manager','sales','support'))
with check (public.current_role() in ('admin','manager','sales','support'));
create policy "tasks_admin_delete" on public.tasks
for delete to authenticated using (public.is_admin());

create policy "registrations_authenticated_read" on public.registrations
for select to authenticated using (true);
create policy "registrations_staff_write" on public.registrations
for insert to authenticated
with check (public.current_role() in ('admin','manager','sales','support'));
create policy "registrations_staff_update" on public.registrations
for update to authenticated
using (public.current_role() in ('admin','manager','sales','support'))
with check (public.current_role() in ('admin','manager','sales','support'));
create policy "registrations_admin_delete" on public.registrations
for delete to authenticated using (public.is_admin());

-- Keep updated_at accurate on mutable CRM tables.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at before update on public.contacts for each row execute procedure public.set_updated_at();
drop trigger if exists follow_ups_set_updated_at on public.follow_ups;
create trigger follow_ups_set_updated_at before update on public.follow_ups for each row execute procedure public.set_updated_at();
drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks for each row execute procedure public.set_updated_at();
drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at before update on public.courses for each row execute procedure public.set_updated_at();
drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at before update on public.payments for each row execute procedure public.set_updated_at();
