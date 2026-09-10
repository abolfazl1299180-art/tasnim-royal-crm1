-- Advanced CRM layer: automation, granular permissions, duplicate merge, integrations and reminders.

create table if not exists public.role_permissions (
  role public.app_role not null,
  module text not null,
  can_read boolean not null default true,
  can_create boolean not null default false,
  can_update boolean not null default false,
  can_delete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (role, module)
);

create table if not exists public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_type text not null check (event_type in ('contact_created','stage_changed','followup_overdue','payment_received')),
  condition_stage text,
  action_type text not null check (action_type in ('create_followup','create_task')),
  action_config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid references public.automation_rules(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  status text not null check (status in ('success','error','skipped')),
  message text,
  created_at timestamptz not null default now()
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  name text not null,
  is_enabled boolean not null default false,
  public_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, name)
);

create index if not exists automation_rules_event_idx on public.automation_rules(event_type, is_active);
create index if not exists automation_runs_created_idx on public.automation_runs(created_at desc);
create index if not exists integrations_provider_idx on public.integrations(provider);

insert into public.role_permissions(role,module,can_read,can_create,can_update,can_delete) values
('admin','contacts',true,true,true,true),
('admin','followups',true,true,true,true),
('admin','tasks',true,true,true,true),
('admin','registrations',true,true,true,true),
('admin','payments',true,true,true,true),
('admin','courses',true,true,true,true),
('admin','reports',true,false,false,false),
('admin','settings',true,true,true,true),
('manager','contacts',true,true,true,false),
('manager','followups',true,true,true,false),
('manager','tasks',true,true,true,false),
('manager','registrations',true,true,true,false),
('manager','payments',true,true,true,false),
('manager','courses',true,true,true,false),
('manager','reports',true,false,false,false),
('sales','contacts',true,true,true,false),
('sales','followups',true,true,true,false),
('sales','tasks',true,true,true,false),
('sales','registrations',true,true,true,false),
('sales','payments',true,false,false,false),
('sales','courses',true,false,false,false),
('sales','reports',true,false,false,false),
('support','contacts',true,true,true,false),
('support','followups',true,true,true,false),
('support','tasks',true,true,true,false),
('support','registrations',true,true,true,false),
('support','payments',true,false,false,false),
('support','courses',true,false,false,false),
('support','reports',true,false,false,false),
('viewer','contacts',true,false,false,false),
('viewer','followups',true,false,false,false),
('viewer','tasks',true,false,false,false),
('viewer','registrations',true,false,false,false),
('viewer','payments',true,false,false,false),
('viewer','courses',true,false,false,false),
('viewer','reports',true,false,false,false)
on conflict (role,module) do nothing;

create or replace function public.has_permission(target_module text, action_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case action_name
    when 'read' then coalesce((select can_read from public.role_permissions where role = public.current_role() and module = target_module), false)
    when 'create' then coalesce((select can_create from public.role_permissions where role = public.current_role() and module = target_module), false)
    when 'update' then coalesce((select can_update from public.role_permissions where role = public.current_role() and module = target_module), false)
    when 'delete' then coalesce((select can_delete from public.role_permissions where role = public.current_role() and module = target_module), false)
    else false
  end;
$$;

alter table public.role_permissions enable row level security;
alter table public.automation_rules enable row level security;
alter table public.automation_runs enable row level security;
alter table public.integrations enable row level security;

drop policy if exists role_permissions_admin_all on public.role_permissions;
create policy role_permissions_admin_all on public.role_permissions
for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists role_permissions_staff_read on public.role_permissions;
create policy role_permissions_staff_read on public.role_permissions
for select to authenticated using (public.current_role() is not null);

drop policy if exists automation_rules_staff_read on public.automation_rules;
create policy automation_rules_staff_read on public.automation_rules
for select to authenticated using (public.current_role() in ('admin','manager','sales','support'));
drop policy if exists automation_rules_manager_write on public.automation_rules;
create policy automation_rules_manager_write on public.automation_rules
for all to authenticated using (public.current_role() in ('admin','manager')) with check (public.current_role() in ('admin','manager'));

drop policy if exists automation_runs_staff_read on public.automation_runs;
create policy automation_runs_staff_read on public.automation_runs
for select to authenticated using (public.current_role() in ('admin','manager','sales','support'));
drop policy if exists automation_runs_manager_write on public.automation_runs;
create policy automation_runs_manager_write on public.automation_runs
for insert to authenticated with check (public.current_role() in ('admin','manager'));

drop policy if exists integrations_admin_all on public.integrations;
create policy integrations_admin_all on public.integrations
for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists integrations_staff_read on public.integrations;
create policy integrations_staff_read on public.integrations
for select to authenticated using (public.current_role() in ('admin','manager','sales','support'));

-- Replace the old fixed write policies with permission-aware policies.
drop policy if exists contacts_staff_write on public.contacts;
drop policy if exists contacts_staff_update on public.contacts;
drop policy if exists contacts_admin_delete on public.contacts;
create policy contacts_permission_insert on public.contacts for insert to authenticated with check (public.has_permission('contacts','create'));
create policy contacts_permission_update on public.contacts for update to authenticated using (public.has_permission('contacts','update')) with check (public.has_permission('contacts','update'));
create policy contacts_permission_delete on public.contacts for delete to authenticated using (public.has_permission('contacts','delete'));

drop policy if exists followups_staff_write on public.follow_ups;
drop policy if exists followups_staff_update on public.follow_ups;
drop policy if exists followups_admin_delete on public.follow_ups;
create policy followups_permission_insert on public.follow_ups for insert to authenticated with check (public.has_permission('followups','create'));
create policy followups_permission_update on public.follow_ups for update to authenticated using (public.has_permission('followups','update')) with check (public.has_permission('followups','update'));
create policy followups_permission_delete on public.follow_ups for delete to authenticated using (public.has_permission('followups','delete'));

drop policy if exists tasks_staff_write on public.tasks;
drop policy if exists tasks_staff_update on public.tasks;
drop policy if exists tasks_admin_delete on public.tasks;
create policy tasks_permission_insert on public.tasks for insert to authenticated with check (public.has_permission('tasks','create'));
create policy tasks_permission_update on public.tasks for update to authenticated using (public.has_permission('tasks','update')) with check (public.has_permission('tasks','update'));
create policy tasks_permission_delete on public.tasks for delete to authenticated using (public.has_permission('tasks','delete'));

-- Registration write policies become permission-aware.
drop policy if exists registrations_staff_write on public.registrations;
drop policy if exists registrations_staff_update on public.registrations;
drop policy if exists registrations_admin_delete on public.registrations;
create policy registrations_permission_insert on public.registrations for insert to authenticated with check (public.has_permission('registrations','create'));
create policy registrations_permission_update on public.registrations for update to authenticated using (public.has_permission('registrations','update')) with check (public.has_permission('registrations','update'));
create policy registrations_permission_delete on public.registrations for delete to authenticated using (public.has_permission('registrations','delete'));

-- Payment write policies become permission-aware.
drop policy if exists payments_manager_write on public.payments;
drop policy if exists payments_manager_update on public.payments;
drop policy if exists payments_admin_delete on public.payments;
create policy payments_permission_insert on public.payments for insert to authenticated with check (public.has_permission('payments','create'));
create policy payments_permission_update on public.payments for update to authenticated using (public.has_permission('payments','update')) with check (public.has_permission('payments','update'));
create policy payments_permission_delete on public.payments for delete to authenticated using (public.has_permission('payments','delete'));

-- Course writes become permission-aware.
drop policy if exists courses_manager_write on public.courses;
create policy courses_permission_all on public.courses for all to authenticated using (public.has_permission('courses','create') or public.has_permission('courses','update') or public.has_permission('courses','delete')) with check (public.has_permission('courses','create') or public.has_permission('courses','update'));

create or replace function public.merge_contacts(primary_id uuid, duplicate_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_permission('contacts','delete') then
    raise exception 'insufficient_permission';
  end if;
  if primary_id = duplicate_id then
    raise exception 'same_contact';
  end if;
  update public.contact_activities set contact_id = primary_id where contact_id = duplicate_id;
  update public.follow_ups set contact_id = primary_id where contact_id = duplicate_id;
  update public.registrations set contact_id = primary_id where contact_id = duplicate_id;
  update public.payments set contact_id = primary_id where contact_id = duplicate_id;
  insert into public.contact_activities(contact_id, user_id, activity_type, title, description)
  values (primary_id, auth.uid(), 'system', 'ادغام پرونده', concat('پرونده تکراری با شناسه ', duplicate_id::text, ' با این پرونده ادغام شد.'));
  delete from public.contact_tags where contact_id = duplicate_id;
  delete from public.contacts where id = duplicate_id;
end;
$$;

grant execute on function public.merge_contacts(uuid, uuid) to authenticated;

create or replace function public.run_contact_automations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  c record;
  r record;
  created_count integer := 0;
  action_title text;
  days_offset integer;
begin
  if public.current_role() not in ('admin','manager') then
    raise exception 'insufficient_permission';
  end if;
  for c in select id, first_name, last_name, sales_stage from public.contacts order by created_at desc limit 500 loop
    for r in select * from public.automation_rules where is_active = true and event_type = 'contact_created' and (condition_stage is null or condition_stage = c.sales_stage) loop
      action_title := coalesce(r.action_config->>'title', r.name);
      days_offset := greatest(0, coalesce((r.action_config->>'days')::integer, 1));
      begin
        if r.action_type = 'create_followup' then
          insert into public.follow_ups(contact_id,title,due_at,notes)
          values (c.id, action_title, now() + make_interval(days => days_offset), coalesce(r.action_config->>'notes','ایجادشده توسط خودکارسازی'));
        else
          insert into public.tasks(title,description,due_at,priority)
          values (action_title, concat('مخاطب: ', c.first_name, ' ', c.last_name), now() + make_interval(days => days_offset), coalesce((r.action_config->>'priority')::smallint, 2));
        end if;
        insert into public.automation_runs(rule_id,contact_id,status,message) values (r.id,c.id,'success','اجرا شد');
        created_count := created_count + 1;
      exception when others then
        insert into public.automation_runs(rule_id,contact_id,status,message) values (r.id,c.id,'error',sqlerrm);
      end;
    end loop;
  end loop;
  return created_count;
end;
$$;

grant execute on function public.run_contact_automations() to authenticated;

insert into public.automation_rules(name,event_type,condition_stage,action_type,action_config,is_active)
select 'پیگیری اولیه سرنخ','contact_created','new','create_followup','{"title":"تماس اولیه با سرنخ","days":1,"notes":"پیگیری خودکار سرنخ جدید"}'::jsonb,true
where not exists (select 1 from public.automation_rules where name='پیگیری اولیه سرنخ');

insert into public.integrations(provider,name,is_enabled,public_config)
select 'calendar','تقویم داخلی',true,'{"mode":"crm"}'::jsonb
where not exists (select 1 from public.integrations where provider='calendar' and name='تقویم داخلی');
insert into public.integrations(provider,name,is_enabled,public_config)
select 'messaging','اتصال پیام‌رسان',false,'{}'::jsonb
where not exists (select 1 from public.integrations where provider='messaging' and name='اتصال پیام‌رسان');
insert into public.integrations(provider,name,is_enabled,public_config)
select 'ai','دستیار هوشمند',false,'{"provider":"external","api_key":""}'::jsonb
where not exists (select 1 from public.integrations where provider='ai' and name='دستیار هوشمند');
