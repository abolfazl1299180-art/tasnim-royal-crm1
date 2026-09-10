-- Event-driven automation triggers.

create unique index if not exists automation_runs_success_unique
on public.automation_runs(rule_id, contact_id)
where status = 'success' and rule_id is not null and contact_id is not null;

create or replace function public.fire_contact_creation_automations()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  days_offset integer;
  title_text text;
begin
  for r in select * from public.automation_rules where is_active and event_type='contact_created' and (condition_stage is null or condition_stage=NEW.sales_stage) loop
    if not exists (select 1 from public.automation_runs where rule_id=r.id and contact_id=NEW.id and status='success') then
      days_offset := greatest(0, coalesce((r.action_config->>'days')::integer, 1));
      title_text := coalesce(r.action_config->>'title', r.name);
      begin
        if r.action_type='create_followup' then
          insert into public.follow_ups(contact_id,title,due_at,notes)
          values(NEW.id,title_text,now()+make_interval(days=>days_offset),coalesce(r.action_config->>'notes','ایجادشده توسط خودکارسازی'));
        else
          insert into public.tasks(title,description,due_at,priority)
          values(title_text,concat('مخاطب: ',NEW.first_name,' ',NEW.last_name),now()+make_interval(days=>days_offset),coalesce((r.action_config->>'priority')::smallint,2));
        end if;
        insert into public.automation_runs(rule_id,contact_id,status,message) values(r.id,NEW.id,'success','اجرای خودکار هنگام ایجاد مخاطب');
      exception when others then
        insert into public.automation_runs(rule_id,contact_id,status,message) values(r.id,NEW.id,'error',sqlerrm);
      end;
    end if;
  end loop;
  return NEW;
end;
$$;

drop trigger if exists contacts_event_automations on public.contacts;
create trigger contacts_event_automations
after insert on public.contacts
for each row execute procedure public.fire_contact_creation_automations();

create or replace function public.fire_payment_automations()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  target_contact uuid;
  days_offset integer;
  title_text text;
begin
  if NEW.status <> 'paid' or NEW.contact_id is null then return NEW; end if;
  target_contact := NEW.contact_id;
  for r in select * from public.automation_rules where is_active and event_type='payment_received' loop
    days_offset := greatest(0, coalesce((r.action_config->>'days')::integer, 1));
    title_text := coalesce(r.action_config->>'title', r.name);
    begin
      if r.action_type='create_followup' then
        insert into public.follow_ups(contact_id,title,due_at,notes)
        values(target_contact,title_text,now()+make_interval(days=>days_offset),'پیگیری پس از ثبت پرداخت');
      else
        insert into public.tasks(title,description,due_at,priority)
        values(title_text,'اقدام پس از دریافت پرداخت',now()+make_interval(days=>days_offset),coalesce((r.action_config->>'priority')::smallint,2));
      end if;
      insert into public.automation_runs(rule_id,contact_id,status,message) values(r.id,target_contact,'success','اجرای خودکار پس از پرداخت');
    exception when others then
      insert into public.automation_runs(rule_id,contact_id,status,message) values(r.id,target_contact,'error',sqlerrm);
    end;
  end loop;
  return NEW;
end;
$$;

drop trigger if exists payments_event_automations on public.payments;
create trigger payments_event_automations
after insert or update of status on public.payments
for each row execute procedure public.fire_payment_automations();
