-- Require a valid active CRM role for contact writes.

drop policy if exists "contacts_staff_write" on public.contacts;
drop policy if exists "contacts_staff_update" on public.contacts;

create policy "contacts_staff_write" on public.contacts
for insert to authenticated
with check (public.current_role() in ('admin','manager','sales','support'));

create policy "contacts_staff_update" on public.contacts
for update to authenticated
using (public.current_role() in ('admin','manager','sales','support'))
with check (public.current_role() in ('admin','manager','sales','support'));
