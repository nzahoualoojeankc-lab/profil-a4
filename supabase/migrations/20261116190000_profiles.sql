create table public.profiles (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id bigint not null check (id between 1 and 9007199254740991),
  data jsonb not null check (jsonb_typeof(data) = 'object' and pg_column_size(data) <= 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index profiles_user_updated_idx
  on public.profiles (user_id, updated_at desc);

alter table public.profiles enable row level security;

create policy "profili_a4_profiles_select"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "profili_a4_profiles_insert"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "profili_a4_profiles_update"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "profili_a4_profiles_delete"
  on public.profiles for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.profiles from public, anon, authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;

create function public.profili_a4_enforce_profile_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_count integer;
begin
  if auth.uid() is null or auth.uid() is distinct from new.user_id then
    raise exception 'Profile owner must match the authenticated user'
      using errcode = '42501';
  end if;

  if length(coalesce(new.data ->> 'name', '')) > 200
     or length(coalesce(new.data ->> 'phone', '')) > 100
     or length(coalesce(new.data ->> 'country', '')) > 100
     or length(coalesce(new.data ->> 'dateRange', '')) > 200
     or length(coalesce(new.data ->> 'orderQuantity', '')) > 100
     or length(coalesce(new.data ->> 'orderQuantityValue', '')) > 100
     or length(coalesce(new.data ->> 'orderSum', '')) > 100
     or length(coalesce(new.data ->> 'bonuses', '')) > 100
     or length(coalesce(new.data ->> 'fines', '')) > 100
     or length(coalesce(new.data ->> 'totalPrice', '')) > 100
     or (new.data ? 'gender' and new.data ->> 'gender' not in ('male', 'female', 'other'))
     or (new.data ? 'fontFamily' and new.data ->> 'fontFamily' not in (
       'Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New',
       'Comic Sans MS', 'Trebuchet MS', 'Arial Black'
     )) then
    raise exception 'Profile data contains an invalid field'
      using errcode = '22023';
  end if;

  perform 1
    from auth.users as u
    where u.id = new.user_id
    for update;

  if tg_op = 'INSERT' then
    select count(*) into profile_count
      from public.profiles as p
      where p.user_id = new.user_id;
  else
    select count(*) into profile_count
      from public.profiles as p
      where p.user_id = new.user_id and p.id <> new.id;
  end if;

  if profile_count >= 300 then
    raise exception 'A maximum of 300 profiles is allowed per account'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function public.profili_a4_enforce_profile_limit() from public, anon, authenticated;

create trigger profili_a4_profiles_enforce_limit
  before insert or update on public.profiles
  for each row execute function public.profili_a4_enforce_profile_limit();

create function public.profili_a4_touch_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.profili_a4_touch_profile_updated_at() from public, anon, authenticated;

create trigger profili_a4_profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.profili_a4_touch_profile_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profili-a4-profile-photos',
  'Profili A4 profile photos',
  false,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "profili_a4_photos_select"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'profili-a4-profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "profili_a4_photos_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'profili-a4-profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
  );

create policy "profili_a4_photos_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'profili-a4-profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1
       from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'profiles'
     ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
end
$$;
