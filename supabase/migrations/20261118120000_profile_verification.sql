begin;

create table if not exists public.profile_verifications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  source_type text not null check (source_type in ('profile', 'document')),
  source_id text not null check (length(source_id) between 1 and 80),
  source_category text not null check (length(source_category) between 1 and 60),
  source_title text not null check (length(source_title) between 1 and 160),
  event_name text,
  serial_number text not null unique
    default ('PA4-' || upper(replace(gen_random_uuid()::text, '-', ''))),
  valid_until date,
  placement text not null default 'footer'
    check (placement in ('header', 'footer', 'none')),
  status text not null default 'active'
    check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  unique (owner_id, source_type, source_id)
);

create index if not exists profile_verifications_owner_created_idx
  on public.profile_verifications (owner_id, created_at desc);

create or replace function public.profili_a4_is_account_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.account_admins as admins
    where admins.user_id = auth.uid()
  );
$$;

revoke all on function public.profili_a4_is_account_admin() from public, anon;
grant execute on function public.profili_a4_is_account_admin() to authenticated, service_role;

alter table public.profile_verifications enable row level security;
revoke all on table public.profile_verifications from public, anon, authenticated;
grant select on table public.profile_verifications to authenticated;
grant all on table public.profile_verifications to service_role;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profile_verifications'
      and policyname = 'profili_a4_profile_verifications_select'
  ) then
    execute $policy$
      create policy "profili_a4_profile_verifications_select"
        on public.profile_verifications for select to authenticated
        using (
          (select public.profili_a4_current_account_can_use())
          and (
            owner_id = (select auth.uid())
            or (select public.profili_a4_is_account_admin())
          )
        )
    $policy$;
  end if;
end
$$;

do $$
declare
  category_tables_present integer;
begin
  select count(*) into category_tables_present
  from unnest(array[
    'account_payroll_reports',
    'account_payroll_checks',
    'account_event_badges',
    'account_event_tickets'
  ]) as category_tables(table_name)
  where to_regclass('public.' || category_tables.table_name) is not null;

  if category_tables_present = 0 then
    execute $function$
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
      as $body$
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

    select d.category,
           d.title,
           nullif(left(d.payload #>> '{values,event}', 160), '')
      into v_category, v_title, v_event_name
      from public.account_documents as d
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
$body$;
    $function$;
  elsif category_tables_present < 4 then
    raise exception 'Category document tables are incomplete; repair that migration before rerunning verification setup';
  elsif to_regprocedure('public.profili_a4_create_profile_verification(text, text, date, text)') is null then
    raise exception 'The category-aware verification function is missing; rerun the category storage migration';
  end if;
end
$$;

revoke all on function public.profili_a4_create_profile_verification(text, text, date, text)
  from public, anon;
grant execute on function public.profili_a4_create_profile_verification(text, text, date, text)
  to authenticated;

create or replace function public.profili_a4_verify_profile(p_serial_number text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_verification public.profile_verifications%rowtype;
  v_status text;
  v_result jsonb;
  v_can_view_details boolean;
  v_creator_label text;
begin
  if auth.uid() is null or not public.profili_a4_current_account_can_use() then
    raise exception 'An active account is required'
      using errcode = '42501';
  end if;
  if p_serial_number is null
     or length(trim(p_serial_number)) not between 4 and 40
     or trim(p_serial_number) !~* '^PA4-[0-9A-F]{32}$' then
    raise exception 'Invalid serial number format'
      using errcode = '22023';
  end if;

  select verification.*
    into v_verification
    from public.profile_verifications as verification
    where verification.serial_number = upper(trim(p_serial_number));

  if not found then
    return jsonb_build_object('found', false, 'status', 'unknown');
  end if;

  v_status := case
    when v_verification.status = 'revoked' then 'revoked'
    when v_verification.valid_until is not null
      and v_verification.valid_until < current_date then 'expired'
    else 'valid'
  end;
  v_result := jsonb_build_object(
    'found', true,
    'status', v_status,
    'valid_until', v_verification.valid_until
  );
  v_can_view_details := v_verification.owner_id = auth.uid()
    or public.profili_a4_is_account_admin();
  if v_can_view_details then
    select coalesce(nullif(user_record.raw_user_meta_data ->> 'full_name', ''), user_record.email)
      into v_creator_label
      from auth.users as user_record
      where user_record.id = v_verification.owner_id;
    v_result := v_result || jsonb_build_object(
      'details', jsonb_build_object(
        'creator_id', v_verification.owner_id,
        'creator', v_creator_label,
        'source_type', v_verification.source_type,
        'source_id', v_verification.source_id,
        'category', v_verification.source_category,
        'title', v_verification.source_title,
        'event_name', v_verification.event_name,
        'created_at', v_verification.created_at
      )
    );
  end if;
  return v_result;
end;
$$;

revoke all on function public.profili_a4_verify_profile(text) from public, anon;
grant execute on function public.profili_a4_verify_profile(text) to authenticated;

create or replace function public.profili_a4_revoke_profile_verification(p_serial_number text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.profili_a4_current_account_can_use() then
    raise exception 'An active account is required'
      using errcode = '42501';
  end if;

  update public.profile_verifications as verification
    set status = 'revoked'
    where verification.serial_number = upper(trim(p_serial_number))
      and (
        verification.owner_id = auth.uid()
        or public.profili_a4_is_account_admin()
      );
  if not found then
    raise exception 'Verification not found or access denied'
      using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.profili_a4_revoke_profile_verification(text) from public, anon;
grant execute on function public.profili_a4_revoke_profile_verification(text) to authenticated;

commit;
