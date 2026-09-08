-- Protect the CRM from accidentally locking out the admin account.

create or replace function public.guard_profile_admin_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  active_admins integer;
begin
  if auth.uid() = old.id and (new.role <> old.role or new.is_active <> old.is_active) then
    raise exception using
      errcode = '42501',
      message = 'حساب مدیری که با آن وارد شده‌اید قابل تغییر نقش یا غیرفعال‌سازی نیست.';
  end if;

  if old.role = 'admin' and (new.role <> 'admin' or new.is_active = false) then
    select count(*) into active_admins
    from public.profiles
    where role = 'admin'
      and is_active = true
      and id <> old.id;

    if active_admins = 0 then
      raise exception using
        errcode = 'check_violation',
        message = 'حداقل یک مدیر فعال باید در سیستم باقی بماند.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_admin_guard on public.profiles;
create trigger profiles_admin_guard
before update on public.profiles
for each row execute procedure public.guard_profile_admin_changes();

create or replace function public.prevent_admin_profile_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  active_admins integer;
begin
  if old.id = auth.uid() then
    raise exception using
      errcode = '42501',
      message = 'حذف حساب کاربری فعلی مجاز نیست.';
  end if;

  if old.role = 'admin' and old.is_active then
    select count(*) into active_admins
    from public.profiles
    where role = 'admin'
      and is_active = true
      and id <> old.id;

    if active_admins = 0 then
      raise exception using
        errcode = 'check_violation',
        message = 'حداقل یک مدیر فعال باید در سیستم باقی بماند.';
    end if;
  end if;

  return old;
end;
$$;

drop trigger if exists profiles_admin_delete_guard on public.profiles;
create trigger profiles_admin_delete_guard
before delete on public.profiles
for each row execute procedure public.prevent_admin_profile_delete();
