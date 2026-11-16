-- Keep schema, access policies, and server routines in one transaction.
begin;

create table public.account_terms_versions (
  version text primary key,
  content text not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index account_terms_one_current_version
  on public.account_terms_versions (is_current)
  where is_current;

insert into public.account_terms_versions (version, content, is_current)
values (
  '1.0',
  'En créant ou en utilisant votre compte, vous vous engagez à respecter les règles d’utilisation de l’application et vos obligations de paiement lorsqu’elles sont convenues. Le propriétaire de l’application ou les administrateurs qu’il a désignés peuvent suspendre temporairement l’accès à votre compte en cas de non-respect du contrat, notamment en cas d’échéance impayée, de fraude ou de manquement éthique. La suspension conserve vos données, indique un motif et vous permet de présenter un recours. La suppression définitive du compte n’est pas régie par cette version et ne sera pas effectuée par cette fonctionnalité.',
  true
);

create table public.account_terms_acceptances (
  user_id uuid not null references auth.users (id) on delete cascade,
  terms_version text not null references public.account_terms_versions (version),
  accepted_at timestamptz not null default now(),
  primary key (user_id, terms_version)
);

create table public.account_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'moderator')),
  granted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index account_admins_single_owner
  on public.account_admins (role)
  where role = 'owner';

create table public.account_moderation_status (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null check (status in ('active', 'suspended')),
  reason text,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  check (
    (status = 'suspended' and reason is not null and length(trim(reason)) between 1 and 2000)
    or (status = 'active' and reason is null)
  )
);

create table public.account_moderation_audit (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id) on delete set null,
  target_id uuid references auth.users (id) on delete set null,
  action text not null check (action in (
    'suspended', 'reactivated', 'moderator_granted', 'moderator_revoked'
  )),
  reason text not null check (length(trim(reason)) between 1 and 2000),
  old_status text,
  new_status text,
  created_at timestamptz not null default now()
);

alter table public.account_terms_versions enable row level security;
alter table public.account_terms_acceptances enable row level security;
alter table public.account_admins enable row level security;
alter table public.account_moderation_status enable row level security;
alter table public.account_moderation_audit enable row level security;

revoke all on table public.account_terms_versions from public, anon, authenticated;
revoke all on table public.account_terms_acceptances from public, anon, authenticated;
revoke all on table public.account_admins from public, anon, authenticated;
revoke all on table public.account_moderation_status from public, anon, authenticated;
revoke all on table public.account_moderation_audit from public, anon, authenticated;
grant all on table public.account_terms_versions to service_role;
grant all on table public.account_terms_acceptances to service_role;
grant all on table public.account_admins to service_role;
grant all on table public.account_moderation_status to service_role;
grant all on table public.account_moderation_audit to service_role;
grant usage, select on sequence public.account_moderation_audit_id_seq to service_role;

create function public.profili_a4_current_account_can_use()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.account_terms_versions as terms
      join public.account_terms_acceptances as accepted
        on accepted.terms_version = terms.version
      where terms.is_current
        and accepted.user_id = auth.uid()
    )
    and not exists (
      select 1
      from public.account_moderation_status as moderation
      where moderation.user_id = auth.uid()
        and moderation.status = 'suspended'
    );
$$;

revoke all on function public.profili_a4_current_account_can_use() from public, anon;
grant execute on function public.profili_a4_current_account_can_use() to authenticated, service_role;

create function public.profili_a4_account_is_usable(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
      select 1
      from public.account_terms_versions as terms
      join public.account_terms_acceptances as accepted
        on accepted.terms_version = terms.version
      where terms.is_current and accepted.user_id = p_user_id
    )
    and not exists (
      select 1
      from public.account_moderation_status as moderation
      where moderation.user_id = p_user_id
        and moderation.status = 'suspended'
    );
$$;

revoke all on function public.profili_a4_account_is_usable(uuid) from public, anon, authenticated;
grant execute on function public.profili_a4_account_is_usable(uuid) to service_role;

drop policy "profili_a4_profiles_select" on public.profiles;
drop policy "profili_a4_profiles_insert" on public.profiles;
drop policy "profili_a4_profiles_update" on public.profiles;
drop policy "profili_a4_profiles_delete" on public.profiles;

create policy "profili_a4_profiles_select"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = user_id and (select public.profili_a4_current_account_can_use()));

create policy "profili_a4_profiles_insert"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = user_id and (select public.profili_a4_current_account_can_use()));

create policy "profili_a4_profiles_update"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id and (select public.profili_a4_current_account_can_use()))
  with check ((select auth.uid()) = user_id and (select public.profili_a4_current_account_can_use()));

create policy "profili_a4_profiles_delete"
  on public.profiles for delete to authenticated
  using ((select auth.uid()) = user_id and (select public.profili_a4_current_account_can_use()));

drop policy "profili_a4_photos_select" on storage.objects;
drop policy "profili_a4_photos_insert" on storage.objects;
drop policy "profili_a4_photos_delete" on storage.objects;

create policy "profili_a4_photos_select"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'profili-a4-profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and (select public.profili_a4_current_account_can_use())
  );

create policy "profili_a4_photos_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'profili-a4-profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
    and (select public.profili_a4_current_account_can_use())
  );

create policy "profili_a4_photos_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'profili-a4-profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and (select public.profili_a4_current_account_can_use())
  );

create function public.profili_a4_bootstrap_owner(p_actor uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext('profili_a4_owner_bootstrap'));
  if not exists (select 1 from auth.users where id = p_actor) then
    raise exception 'Account not found' using errcode = 'P0002';
  end if;

  if exists (select 1 from public.account_admins where role = 'owner') then
    return false;
  end if;

  insert into public.account_admins (user_id, role)
  values (p_actor, 'owner');
  return true;
end;
$$;

create function public.profili_a4_accept_terms(p_actor uuid, p_version text)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  acceptance_time timestamptz;
begin
  if not exists (
    select 1 from public.account_terms_versions
    where version = p_version and is_current
  ) then
    raise exception 'Terms version is not current' using errcode = '22023';
  end if;

  insert into public.account_terms_acceptances (user_id, terms_version)
  values (p_actor, p_version)
  on conflict (user_id, terms_version)
  do update set accepted_at = excluded.accepted_at
  returning accepted_at into acceptance_time;

  return acceptance_time;
end;
$$;

create function public.profili_a4_admin_search_accounts(p_actor uuid, p_query text)
returns table (user_id uuid, email text, created_at timestamptz, status text, role text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.account_admins
    where account_admins.user_id = p_actor
      and account_admins.role in ('owner', 'moderator')
  ) or not public.profili_a4_account_is_usable(p_actor) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if length(trim(coalesce(p_query, ''))) < 3 then
    raise exception 'Enter at least 3 characters to search' using errcode = '22023';
  end if;

  return query
    select u.id, u.email::text, u.created_at,
      coalesce(m.status, 'active')::text, a.role
    from auth.users as u
    left join public.account_moderation_status as m on m.user_id = u.id
    left join public.account_admins as a on a.user_id = u.id
    where u.email ilike ('%' || trim(p_query) || '%')
    order by u.created_at desc
    limit 20;
end;
$$;

create function public.profili_a4_moderate_account(
  p_actor uuid,
  p_target uuid,
  p_action text,
  p_reason text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_state text;
  new_state text;
begin
  if not exists (
    select 1 from public.account_admins
    where user_id = p_actor and account_admins.role in ('owner', 'moderator')
  ) or not public.profili_a4_account_is_usable(p_actor) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_actor = p_target then
    raise exception 'You cannot moderate your own account' using errcode = '42501';
  end if;
  if p_action is null or p_action not in ('suspend', 'reactivate') then
    raise exception 'Invalid moderation action' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_reason, ''))) = 0 or length(p_reason) > 2000 then
    raise exception 'A reason of up to 2000 characters is required' using errcode = '22023';
  end if;
  if not exists (select 1 from auth.users where id = p_target) then
    raise exception 'Account not found' using errcode = 'P0002';
  end if;
  perform 1 from auth.users where id = p_target for update;
  if exists (
    select 1 from public.account_admins
    where user_id = p_target and role = 'owner'
  ) then
    raise exception 'The owner account cannot be moderated' using errcode = '42501';
  end if;

  select coalesce(status, 'active') into old_state
  from public.account_moderation_status
  where user_id = p_target;
  old_state := coalesce(old_state, 'active');
  new_state := case when p_action = 'suspend' then 'suspended' else 'active' end;

  if old_state = new_state then
    raise exception 'Account already has this status' using errcode = '22023';
  end if;

  if new_state = 'suspended' then
    insert into public.account_moderation_status (user_id, status, reason, updated_by, updated_at)
    values (p_target, new_state, trim(p_reason), p_actor, now())
    on conflict (user_id) do update
      set status = excluded.status,
          reason = excluded.reason,
          updated_by = excluded.updated_by,
          updated_at = excluded.updated_at;
  else
    update public.account_moderation_status
      set status = new_state, reason = null, updated_by = p_actor, updated_at = now()
      where user_id = p_target;
  end if;

  insert into public.account_moderation_audit (
    actor_id, target_id, action, reason, old_status, new_status
  ) values (
    p_actor, p_target,
    case when new_state = 'suspended' then 'suspended' else 'reactivated' end,
    trim(p_reason), old_state, new_state
  );
  return new_state;
end;
$$;

create function public.profili_a4_manage_moderator(
  p_actor uuid,
  p_target uuid,
  p_action text,
  p_reason text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_role text;
begin
  if not exists (
    select 1 from public.account_admins
    where user_id = p_actor and account_admins.role = 'owner'
  ) or not public.profili_a4_account_is_usable(p_actor) then
    raise exception 'Only the owner can manage delegates' using errcode = '42501';
  end if;
  if p_actor = p_target then
    raise exception 'The owner cannot delegate their own account' using errcode = '22023';
  end if;
  if p_action is null or p_action not in ('grant', 'revoke') then
    raise exception 'Invalid delegation action' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_reason, ''))) = 0 or length(p_reason) > 2000 then
    raise exception 'A reason of up to 2000 characters is required' using errcode = '22023';
  end if;
  if not exists (
    select 1 from auth.users
    where id = p_target and email_confirmed_at is not null
  ) then
    raise exception 'Account not found' using errcode = 'P0002';
  end if;

  select role into target_role
  from public.account_admins where user_id = p_target;
  if target_role = 'owner' then
    raise exception 'The owner role cannot be changed' using errcode = '42501';
  end if;

  if p_action = 'grant' then
    if target_role = 'moderator' then
      raise exception 'Account is already a delegate' using errcode = '22023';
    end if;
    insert into public.account_admins (user_id, role, granted_by)
      values (p_target, 'moderator', p_actor);
    insert into public.account_moderation_audit (actor_id, target_id, action, reason)
      values (p_actor, p_target, 'moderator_granted', trim(p_reason));
    return true;
  end if;

  if target_role is distinct from 'moderator' then
    raise exception 'Account is not a delegate' using errcode = '22023';
  end if;
  delete from public.account_admins where user_id = p_target;
  insert into public.account_moderation_audit (actor_id, target_id, action, reason)
    values (p_actor, p_target, 'moderator_revoked', trim(p_reason));
  return true;
end;
$$;

create function public.profili_a4_admin_audit(p_actor uuid)
returns table (
  action text,
  actor_email text,
  target_email text,
  reason text,
  old_status text,
  new_status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.account_admins
    where user_id = p_actor and account_admins.role in ('owner', 'moderator')
  ) or not public.profili_a4_account_is_usable(p_actor) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  return query
    select audit.action, actor.email::text, target.email::text,
      audit.reason, audit.old_status, audit.new_status, audit.created_at
    from public.account_moderation_audit as audit
    left join auth.users as actor on actor.id = audit.actor_id
    left join auth.users as target on target.id = audit.target_id
    order by audit.created_at desc
    limit 100;
end;
$$;

create function public.profili_a4_account_notices(p_actor uuid)
returns table (
  action text,
  reason text,
  old_status text,
  new_status text,
  created_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select audit.action, audit.reason, audit.old_status, audit.new_status, audit.created_at
  from public.account_moderation_audit as audit
  where audit.target_id = p_actor
  order by audit.created_at desc
  limit 20;
$$;

revoke all on function public.profili_a4_bootstrap_owner(uuid) from public, anon, authenticated;
revoke all on function public.profili_a4_accept_terms(uuid, text) from public, anon, authenticated;
revoke all on function public.profili_a4_admin_search_accounts(uuid, text) from public, anon, authenticated;
revoke all on function public.profili_a4_moderate_account(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.profili_a4_manage_moderator(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.profili_a4_admin_audit(uuid) from public, anon, authenticated;
revoke all on function public.profili_a4_account_notices(uuid) from public, anon, authenticated;
grant execute on function public.profili_a4_bootstrap_owner(uuid) to service_role;
grant execute on function public.profili_a4_accept_terms(uuid, text) to service_role;
grant execute on function public.profili_a4_admin_search_accounts(uuid, text) to service_role;
grant execute on function public.profili_a4_moderate_account(uuid, uuid, text, text) to service_role;
grant execute on function public.profili_a4_manage_moderator(uuid, uuid, text, text) to service_role;
grant execute on function public.profili_a4_admin_audit(uuid) to service_role;
grant execute on function public.profili_a4_account_notices(uuid) to service_role;

commit;
