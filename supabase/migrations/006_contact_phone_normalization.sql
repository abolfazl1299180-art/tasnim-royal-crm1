-- Normalize Iranian mobile numbers and prevent duplicate contacts across 09 / +98 formats.
-- Canonical form is +989XXXXXXXXX.

alter table public.contacts
  add column if not exists phone_normalized text
  generated always as (
    case
      when phone is null or btrim(phone) = '' then null
      else case
        when regexp_replace(phone, '[^0-9+]', '', 'g') like '0098%' then
          '+98' || substr(regexp_replace(phone, '[^0-9+]', '', 'g'), 5)
        when regexp_replace(phone, '[^0-9+]', '', 'g') like '+98%' then
          regexp_replace(phone, '[^0-9+]', '', 'g')
        when regexp_replace(phone, '[^0-9+]', '', 'g') like '98%' then
          '+' || regexp_replace(phone, '[^0-9+]', '', 'g')
        when regexp_replace(phone, '[^0-9+]', '', 'g') like '09%' then
          '+98' || substr(regexp_replace(phone, '[^0-9+]', '', 'g'), 2)
        else
          regexp_replace(phone, '[^0-9+]', '', 'g')
      end
    end
  ) stored;

create or replace function public.prevent_duplicate_contact_phone()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.phone_normalized is not null and new.phone_normalized <> '' then
    if exists (
      select 1 from public.contacts c
      where c.phone_normalized = new.phone_normalized
        and c.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) then
      raise exception 'duplicate_contact_phone' using errcode = '23505';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists contacts_prevent_duplicate_phone on public.contacts;
create trigger contacts_prevent_duplicate_phone
before insert or update of phone on public.contacts
for each row execute procedure public.prevent_duplicate_contact_phone();

create index if not exists contacts_phone_normalized_idx
  on public.contacts(phone_normalized)
  where phone_normalized is not null;
