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

create unique index if not exists contacts_phone_normalized_uidx
  on public.contacts(phone_normalized)
  where phone_normalized is not null;

create index if not exists contacts_phone_normalized_idx
  on public.contacts(phone_normalized);
