-- Business rules that must hold at database level, not only in the UI.

create or replace function public.enforce_registration_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  course_capacity integer;
  current_enrollment integer;
begin
  -- Serialize registrations for the same course to prevent races at the capacity boundary.
  select capacity into course_capacity
  from public.courses
  where id = new.course_id
  for update;

  if course_capacity is null then
    return new;
  end if;

  select count(*) into current_enrollment
  from public.registrations
  where course_id = new.course_id
    and status in ('pending', 'active')
    and (TG_OP = 'INSERT' or id <> new.id);

  if current_enrollment >= course_capacity and new.status in ('pending', 'active') then
    raise exception using
      errcode = 'check_violation',
      message = 'ظرفیت این دوره تکمیل شده است.';
  end if;

  return new;
end;
$$;

drop trigger if exists registrations_capacity_guard on public.registrations;
create trigger registrations_capacity_guard
before insert or update of course_id, status on public.registrations
for each row execute procedure public.enforce_registration_rules();

create or replace function public.sync_payment_registration_contact()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  registration_contact uuid;
begin
  if new.registration_id is null then
    return new;
  end if;

  select contact_id into registration_contact
  from public.registrations
  where id = new.registration_id;

  if registration_contact is null then
    raise exception using
      errcode = 'foreign_key_violation',
      message = 'ثبت‌نام انتخاب‌شده معتبر نیست.';
  end if;

  if new.contact_id is null then
    new.contact_id = registration_contact;
  elsif new.contact_id <> registration_contact then
    raise exception using
      errcode = 'check_violation',
      message = 'مخاطب پرداخت با مخاطب ثبت‌نام یکسان نیست.';
  end if;

  return new;
end;
$$;

drop trigger if exists payments_registration_consistency on public.payments;
create trigger payments_registration_consistency
before insert or update of registration_id, contact_id on public.payments
for each row execute procedure public.sync_payment_registration_contact();

-- Do not allow the admin dashboard to create/delete arbitrary profile rows.
-- Auth user creation remains the source of truth; this table only manages role/status.
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_update" on public.profiles
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.protect_admin_profile_lockout()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  active_admins integer;
begin
  if TG_OP = 'DELETE' then
    raise exception using
      errcode = 'restrict_violation',
      message = 'حذف پروفایل از داخل CRM مجاز نیست.';
  end if;

  if OLD.id = auth.uid() and (NEW.is_active = false or NEW.role <> 'admin') then
    raise exception using
      errcode = 'restrict_violation',
      message = 'مدیر فعلی نمی‌تواند حساب خودش را غیرفعال یا تنزل نقش دهد.';
  end if;

  if OLD.role = 'admin' and (NEW.role <> 'admin' or NEW.is_active = false) then
    select count(*) into active_admins
    from public.profiles
    where role = 'admin' and is_active = true and id <> OLD.id;

    if active_admins = 0 then
      raise exception using
        errcode = 'restrict_violation',
        message = 'حداقل یک مدیر فعال باید در سیستم باقی بماند.';
    end if;
  end if;

  return NEW;
end;
$$;

drop trigger if exists profiles_admin_lockout_guard on public.profiles;
create trigger profiles_admin_lockout_guard
before update or delete on public.profiles
for each row execute procedure public.protect_admin_profile_lockout();
