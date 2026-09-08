-- CRM growth layer: sales pipeline, tags, audit log and automatic interaction history.

alter table public.contacts
  add column if not exists sales_stage text not null default 'new';

alter table public.contacts
  drop constraint if exists contacts_sales_stage_check;

alter table public.contacts
  add constraint contacts_sales_stage_check
  check (sales_stage in ('new','contacted','qualified','proposal','won','lost'));

create index if not exists contacts_sales_stage_idx on public.contacts(sales_stage);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#64748b',
  created_at timestamptz not null default now()
);

create table if not exists public.contact_tags (
  contact_id uuid not null references public.contacts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (contact_id, tag_id)
);

create index if not exists contact_tags_tag_idx on public.contact_tags(tag_id);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  table_name text not null,
  record_id uuid,
  action text not null check (action in ('insert','update','delete')),
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_record_idx on public.audit_logs(table_name, record_id);

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs(user_id, table_name, record_id, action, old_data, new_data)
  values (
    auth.uid(),
    TG_TABLE_NAME,
    coalesce(NEW.id, OLD.id),
    lower(TG_OP),
    case when TG_OP in ('UPDATE','DELETE') then to_jsonb(OLD) else null end,
    case when TG_OP in ('INSERT','UPDATE') then to_jsonb(NEW) else null end
  );
  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists contacts_audit_log on public.contacts;
create trigger contacts_audit_log after insert or update or delete on public.contacts
for each row execute procedure public.write_audit_log();

drop trigger if exists followups_audit_log on public.follow_ups;
create trigger followups_audit_log after insert or update or delete on public.follow_ups
for each row execute procedure public.write_audit_log();

drop trigger if exists tasks_audit_log on public.tasks;
create trigger tasks_audit_log after insert or update or delete on public.tasks
for each row execute procedure public.write_audit_log();

drop trigger if exists registrations_audit_log on public.registrations;
create trigger registrations_audit_log after insert or update or delete on public.registrations
for each row execute procedure public.write_audit_log();

drop trigger if exists payments_audit_log on public.payments;
create trigger payments_audit_log after insert or update or delete on public.payments
for each row execute procedure public.write_audit_log();

create or replace function public.write_contact_activity_from_contact()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.contact_activities(contact_id, user_id, activity_type, title, description)
    values (NEW.id, auth.uid(), 'system', 'ایجاد پرونده', 'پرونده مخاطب در CRM ایجاد شد.');
  elsif TG_OP = 'UPDATE' and (
    NEW.status is distinct from OLD.status or
    NEW.sales_stage is distinct from OLD.sales_stage or
    NEW.owner_id is distinct from OLD.owner_id
  ) then
    insert into public.contact_activities(contact_id, user_id, activity_type, title, description)
    values (
      NEW.id,
      auth.uid(),
      'system',
      'به‌روزرسانی پرونده',
      concat(
        case when NEW.status is distinct from OLD.status then 'وضعیت تغییر کرد. ' else '' end,
        case when NEW.sales_stage is distinct from OLD.sales_stage then 'مرحله فروش تغییر کرد. ' else '' end,
        case when NEW.owner_id is distinct from OLD.owner_id then 'مسئول پرونده تغییر کرد.' else '' end
      )
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists contacts_activity_history on public.contacts;
create trigger contacts_activity_history after insert or update on public.contacts
for each row execute procedure public.write_contact_activity_from_contact();

alter table public.tags enable row level security;
alter table public.contact_tags enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "tags_authenticated_read" on public.tags;
create policy "tags_authenticated_read" on public.tags
for select to authenticated using (true);

drop policy if exists "tags_staff_write" on public.tags;
create policy "tags_staff_write" on public.tags
for all to authenticated using (public.current_role() in ('admin','manager','sales','support'))
with check (public.current_role() in ('admin','manager','sales','support'));

drop policy if exists "contact_tags_authenticated_read" on public.contact_tags;
create policy "contact_tags_authenticated_read" on public.contact_tags
for select to authenticated using (true);

drop policy if exists "contact_tags_staff_write" on public.contact_tags;
create policy "contact_tags_staff_write" on public.contact_tags
for all to authenticated using (public.current_role() in ('admin','manager','sales','support'))
with check (public.current_role() in ('admin','manager','sales','support'));

drop policy if exists "audit_logs_staff_read" on public.audit_logs;
create policy "audit_logs_staff_read" on public.audit_logs
for select to authenticated using (public.current_role() in ('admin','manager','sales','support','viewer'));
