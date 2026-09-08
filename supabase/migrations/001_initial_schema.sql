create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'manager', 'sales', 'support', 'viewer');
create type public.contact_status as enum ('lead', 'active', 'inactive', 'customer');
create type public.follow_up_status as enum ('pending', 'done', 'cancelled');
create type public.task_status as enum ('todo', 'in_progress', 'done', 'cancelled');
create type public.registration_status as enum ('pending', 'active', 'completed', 'cancelled');
create type public.payment_status as enum ('pending', 'partial', 'paid', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text not null default '',
  role public.app_role not null default 'viewer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null default '',
  phone text,
  email text,
  birth_date date,
  status public.contact_status not null default 'lead',
  source text,
  notes text,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_activities (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  activity_type text not null,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  title text not null,
  due_at timestamptz not null,
  status public.follow_up_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assigned_to uuid references public.profiles(id) on delete set null,
  due_at timestamptz,
  status public.task_status not null default 'todo',
  priority smallint not null default 2 check (priority between 1 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_date date,
  end_date date,
  capacity integer check (capacity is null or capacity > 0),
  price numeric(14,2) not null default 0 check (price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  status public.registration_status not null default 'pending',
  registered_at timestamptz not null default now(),
  notes text,
  unique(course_id, contact_id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete set null,
  registration_id uuid references public.registrations(id) on delete set null,
  amount numeric(14,2) not null check (amount > 0),
  status public.payment_status not null default 'pending',
  paid_at timestamptz,
  method text,
  reference text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contacts_phone_idx on public.contacts(phone);
create index contacts_status_idx on public.contacts(status);
create index contacts_owner_idx on public.contacts(owner_id);
create index follow_ups_due_idx on public.follow_ups(due_at, status);
create index tasks_due_idx on public.tasks(due_at, status);
create index payments_status_idx on public.payments(status);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when not exists (select 1 from public.profiles) then 'admin'::public.app_role else 'viewer'::public.app_role end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.contact_activities enable row level security;
alter table public.follow_ups enable row level security;
alter table public.tasks enable row level security;
alter table public.courses enable row level security;
alter table public.registrations enable row level security;
alter table public.payments enable row level security;

create policy "profiles_self_read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles_admin_all" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "contacts_authenticated_read" on public.contacts for select to authenticated using (true);
create policy "contacts_staff_write" on public.contacts for insert to authenticated with check (not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'viewer'));
create policy "contacts_staff_update" on public.contacts for update to authenticated using (not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'viewer')) with check (not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'viewer'));
create policy "contacts_admin_delete" on public.contacts for delete to authenticated using (public.is_admin());

create policy "activities_authenticated_all" on public.contact_activities for all to authenticated using (true) with check (true);
create policy "followups_authenticated_all" on public.follow_ups for all to authenticated using (true) with check (true);
create policy "tasks_authenticated_all" on public.tasks for all to authenticated using (true) with check (true);
create policy "courses_authenticated_read" on public.courses for select to authenticated using (true);
create policy "courses_manager_write" on public.courses for all to authenticated using (public.is_admin() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'manager')) with check (public.is_admin() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'manager'));
create policy "registrations_authenticated_all" on public.registrations for all to authenticated using (true) with check (true);
create policy "payments_authenticated_read" on public.payments for select to authenticated using (true);
create policy "payments_manager_write" on public.payments for insert to authenticated with check (public.is_admin() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'manager'));
create policy "payments_manager_update" on public.payments for update to authenticated using (public.is_admin() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'manager')) with check (public.is_admin() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'manager'));
create policy "payments_admin_delete" on public.payments for delete to authenticated using (public.is_admin());
