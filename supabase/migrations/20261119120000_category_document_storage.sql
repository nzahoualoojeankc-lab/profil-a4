begin;

create table public.account_payroll_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null default 'payroll_report' check (category = 'payroll_report'),
  title text not null check (length(trim(title)) between 1 and 160),
  payload jsonb not null
    check (jsonb_typeof(payload) = 'object' and pg_column_size(payload) <= 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.account_payroll_report_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null default 'payroll_report' check (category = 'payroll_report'),
  name text not null check (length(trim(name)) between 1 and 120),
  design jsonb not null
    check (jsonb_typeof(design) = 'object' and pg_column_size(design) <= 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.account_payroll_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null default 'payroll_check' check (category = 'payroll_check'),
  title text not null check (length(trim(title)) between 1 and 160),
  payload jsonb not null
    check (jsonb_typeof(payload) = 'object' and pg_column_size(payload) <= 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.account_payroll_check_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null default 'payroll_check' check (category = 'payroll_check'),
  name text not null check (length(trim(name)) between 1 and 120),
  design jsonb not null
    check (jsonb_typeof(design) = 'object' and pg_column_size(design) <= 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.account_event_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null default 'event_badge' check (category = 'event_badge'),
  title text not null check (length(trim(title)) between 1 and 160),
  payload jsonb not null
    check (jsonb_typeof(payload) = 'object' and pg_column_size(payload) <= 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.account_event_badge_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null default 'event_badge' check (category = 'event_badge'),
  name text not null check (length(trim(name)) between 1 and 120),
  design jsonb not null
    check (jsonb_typeof(design) = 'object' and pg_column_size(design) <= 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.account_event_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null default 'event_ticket' check (category = 'event_ticket'),
  title text not null check (length(trim(title)) between 1 and 160),
  payload jsonb not null
    check (jsonb_typeof(payload) = 'object' and pg_column_size(payload) <= 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.account_event_ticket_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null default 'event_ticket' check (category = 'event_ticket'),
  name text not null check (length(trim(name)) between 1 and 120),
  design jsonb not null
    check (jsonb_typeof(design) = 'object' and pg_column_size(design) <= 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

do $$
declare
  table_name text;
  category_name text;
begin
  for table_name, category_name in
    select * from (values
      ('account_payroll_reports', 'payroll_report'),
      ('account_payroll_report_templates', 'payroll_report'),
      ('account_payroll_checks', 'payroll_check'),
      ('account_payroll_check_templates', 'payroll_check'),
      ('account_event_badges', 'event_badge'),
      ('account_event_badge_templates', 'event_badge'),
      ('account_event_tickets', 'event_ticket'),
      ('account_event_ticket_templates', 'event_ticket')
    ) as category_tables(table_name, category_name)
  loop
    execute format('create index %I on public.%I (user_id, archived_at, updated_at desc)',
      table_name || '_user_archive_updated_idx', table_name);
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from public, anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);
    execute format('grant all on table public.%I to service_role', table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using (user_id = (select auth.uid()) and (select public.profili_a4_current_account_can_use()))',
      'profili_a4_' || table_name || '_select', table_name);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (user_id = (select auth.uid()) and category = %L and (select public.profili_a4_current_account_can_use()))',
      'profili_a4_' || table_name || '_insert', table_name, category_name);
    execute format(
      'create policy %I on public.%I for update to authenticated using (user_id = (select auth.uid()) and (select public.profili_a4_current_account_can_use())) with check (user_id = (select auth.uid()) and category = %L and (select public.profili_a4_current_account_can_use()))',
      'profili_a4_' || table_name || '_update', table_name, category_name);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (user_id = (select auth.uid()) and (select public.profili_a4_current_account_can_use()))',
      'profili_a4_' || table_name || '_delete', table_name);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.profili_a4_touch_profile_updated_at()',
      'profili_a4_' || table_name || '_touch_updated_at', table_name);
  end loop;
end
$$;

insert into public.account_payroll_reports
  (id, user_id, category, title, payload, created_at, updated_at, archived_at)
select id, user_id, category, title, payload, created_at, updated_at, archived_at
from public.account_documents where category = 'payroll_report'
on conflict (id) do nothing;

insert into public.account_payroll_report_templates
  (id, user_id, category, name, design, created_at, updated_at, archived_at)
select id, user_id, category, name, design, created_at, updated_at, archived_at
from public.account_document_templates where category = 'payroll_report'
on conflict (id) do nothing;

insert into public.account_payroll_checks
  (id, user_id, category, title, payload, created_at, updated_at, archived_at)
select id, user_id, category, title, payload, created_at, updated_at, archived_at
from public.account_documents where category = 'payroll_check'
on conflict (id) do nothing;

insert into public.account_payroll_check_templates
  (id, user_id, category, name, design, created_at, updated_at, archived_at)
select id, user_id, category, name, design, created_at, updated_at, archived_at
from public.account_document_templates where category = 'payroll_check'
on conflict (id) do nothing;

insert into public.account_event_badges
  (id, user_id, category, title, payload, created_at, updated_at, archived_at)
select id, user_id, category, title, payload, created_at, updated_at, archived_at
from public.account_documents where category = 'event_badge'
on conflict (id) do nothing;

insert into public.account_event_badge_templates
  (id, user_id, category, name, design, created_at, updated_at, archived_at)
select id, user_id, category, name, design, created_at, updated_at, archived_at
from public.account_document_templates where category = 'event_badge'
on conflict (id) do nothing;

insert into public.account_event_tickets
  (id, user_id, category, title, payload, created_at, updated_at, archived_at)
select id, user_id, category, title, payload, created_at, updated_at, archived_at
from public.account_documents where category = 'event_ticket'
on conflict (id) do nothing;

insert into public.account_event_ticket_templates
  (id, user_id, category, name, design, created_at, updated_at, archived_at)
select id, user_id, category, name, design, created_at, updated_at, archived_at
from public.account_document_templates where category = 'event_ticket'
on conflict (id) do nothing;

do $$
declare
  table_name text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach table_name in array array[
      'account_payroll_reports',
      'account_payroll_report_templates',
      'account_payroll_checks',
      'account_payroll_check_templates',
      'account_event_badges',
      'account_event_badge_templates',
      'account_event_tickets',
      'account_event_ticket_templates'
    ] loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = table_name
      ) then
        execute format('alter publication supabase_realtime add table public.%I', table_name);
      end if;
    end loop;
  end if;
end
$$;

create or replace function public.profili_a4_create_profile_verification(
  p_source_type text,
  p_source_id text,
  p_valid_until date default null,
  p_placement text default 'footer'
)
returns table (
  serial_number text,
  source_type text,
  source_id text,
  source_category text,
  source_title text,
  event_name text,
  valid_until date,
  placement text,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_id uuid := auth.uid();
  v_category text;
  v_title text;
  v_event_name text;
  v_serial text := 'PA4-' || upper(replace(gen_random_uuid()::text, '-', ''));
begin
  if v_owner_id is null or not public.profili_a4_current_account_can_use() then
    raise exception 'An active account is required'
      using errcode = '42501';
  end if;
  if p_source_type not in ('profile', 'document')
     or p_source_id is null
     or length(p_source_id) not between 1 and 80
     or p_placement not in ('header', 'footer', 'none')
     or (p_valid_until is not null and p_valid_until < current_date) then
    raise exception 'Invalid verification settings'
      using errcode = '22023';
  end if;

  if p_source_type = 'profile' then
    if p_source_id !~ '^[1-9][0-9]{0,15}$' then
      raise exception 'Invalid profile identifier'
        using errcode = '22023';
    end if;

    select coalesce(nullif(left(p.data ->> 'category', 60), ''), 'payroll_report'),
           coalesce(nullif(left(p.data ->> 'name', 160), ''), 'Profil A4')
      into v_category, v_title
      from public.profiles as p
      where p.user_id = v_owner_id
        and p.id = p_source_id::bigint
        and p.data ->> 'archivedAt' is null;
    if not found then
      raise exception 'Active profile not found'
        using errcode = 'P0002';
    end if;
  else
    if p_source_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'Invalid document identifier'
        using errcode = '22023';
    end if;

    select d.category, d.title, nullif(left(d.payload #>> '{values,event}', 160), '')
      into v_category, v_title, v_event_name
      from (
        select id, user_id, category, title, payload, archived_at from public.account_payroll_reports
        union all
        select id, user_id, category, title, payload, archived_at from public.account_payroll_checks
        union all
        select id, user_id, category, title, payload, archived_at from public.account_event_badges
        union all
        select id, user_id, category, title, payload, archived_at from public.account_event_tickets
      ) as d
      where d.user_id = v_owner_id
        and d.id = p_source_id::uuid
        and d.archived_at is null;
    if not found then
      raise exception 'Active document not found'
        using errcode = 'P0002';
    end if;
  end if;

  return query
    insert into public.profile_verifications as verification (
      owner_id, source_type, source_id, source_category, source_title,
      event_name, serial_number, valid_until, placement, status
    ) values (
      v_owner_id, p_source_type, p_source_id, v_category, v_title,
      v_event_name, v_serial, p_valid_until, p_placement, 'active'
    )
    on conflict (owner_id, source_type, source_id) do update
      set source_category = excluded.source_category,
          source_title = excluded.source_title,
          event_name = excluded.event_name,
          serial_number = excluded.serial_number,
          valid_until = excluded.valid_until,
          placement = excluded.placement,
          status = 'active',
          created_at = now()
    returning verification.serial_number, verification.source_type,
      verification.source_id, verification.source_category,
      verification.source_title, verification.event_name,
      verification.valid_until, verification.placement, verification.status,
      verification.created_at;
end;
$$;

revoke all on function public.profili_a4_create_profile_verification(text, text, date, text)
  from public, anon;
grant execute on function public.profili_a4_create_profile_verification(text, text, date, text)
  to authenticated;

commit;
