begin;

create table if not exists public.profiles (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id bigint not null check (id between 1 and 9007199254740991),
  data jsonb not null check (jsonb_typeof(data) = 'object' and pg_column_size(data) <= 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists profiles_user_updated_idx
  on public.profiles (user_id, updated_at desc);

alter table public.profiles enable row level security;

do $$
begin
  if to_regprocedure('public.profili_a4_current_account_can_use()') is not null
     and exists (
       select 1
       from unnest(array[
         'profili_a4_profiles_select',
         'profili_a4_profiles_insert',
         'profili_a4_profiles_update',
         'profili_a4_profiles_delete'
       ]) as policy_names(policyname)
       where not exists (
         select 1 from pg_policies
         where schemaname = 'public'
           and tablename = 'profiles'
           and policyname = policy_names.policyname
       )
     ) then
    raise exception 'Account access policies are incomplete; repair them before rerunning this migration';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'profili_a4_profiles_select'
  ) then
    execute $policy$
      create policy "profili_a4_profiles_select"
        on public.profiles for select to authenticated
        using ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'profili_a4_profiles_insert'
  ) then
    execute $policy$
      create policy "profili_a4_profiles_insert"
        on public.profiles for insert to authenticated
        with check ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'profili_a4_profiles_update'
  ) then
    execute $policy$
      create policy "profili_a4_profiles_update"
        on public.profiles for update to authenticated
        using ((select auth.uid()) = user_id)
        with check ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'profili_a4_profiles_delete'
  ) then
    execute $policy$
      create policy "profili_a4_profiles_delete"
        on public.profiles for delete to authenticated
        using ((select auth.uid()) = user_id)
    $policy$;
  end if;
end
$$;

revoke all on table public.profiles from public, anon, authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;

do $$
begin
  if to_regprocedure('public.profili_a4_enforce_profile_limit()') is null then
    execute $function$
      create function public.profili_a4_enforce_profile_limit()
      returns trigger
      language plpgsql
      security definer
      set search_path = ''
      as $body$
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

        if new.data ->> 'archivedAt' is null then
          select count(*) into profile_count
            from public.profiles as p
            where p.user_id = new.user_id
              and p.data ->> 'archivedAt' is null
              and (tg_op = 'INSERT' or p.id <> new.id);

          if profile_count >= 300 then
            raise exception 'A maximum of 300 active profiles is allowed per account'
              using errcode = '23514';
          end if;
        end if;

        return new;
      end;
      $body$
    $function$;
  end if;
end
$$;

revoke all on function public.profili_a4_enforce_profile_limit() from public, anon, authenticated;

do $$
begin
  if to_regprocedure('public.profili_a4_current_account_can_use()') is not null
     and exists (
       select 1
       from unnest(array[
         'profili_a4_photos_select',
         'profili_a4_photos_insert',
         'profili_a4_photos_delete'
       ]) as policy_names(policyname)
       where not exists (
         select 1 from pg_policies
         where schemaname = 'storage'
           and tablename = 'objects'
           and policyname = policy_names.policyname
       )
     ) then
    raise exception 'Account photo policies are incomplete; repair them before rerunning this migration';
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.profiles'::regclass
      and tgname = 'profili_a4_profiles_enforce_limit'
      and not tgisinternal
  ) then
    execute 'create trigger profili_a4_profiles_enforce_limit
      before insert or update on public.profiles
      for each row execute function public.profili_a4_enforce_profile_limit()';
  end if;
end
$$;

do $$
begin
  if to_regprocedure('public.profili_a4_touch_profile_updated_at()') is null then
    execute $function$
      create function public.profili_a4_touch_profile_updated_at()
      returns trigger
      language plpgsql
      set search_path = ''
      as $body$
      begin
        new.updated_at = now();
        return new;
      end;
      $body$
    $function$;
  end if;
end
$$;

revoke all on function public.profili_a4_touch_profile_updated_at() from public, anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.profiles'::regclass
      and tgname = 'profili_a4_profiles_touch_updated_at'
      and not tgisinternal
  ) then
    execute 'create trigger profili_a4_profiles_touch_updated_at
      before update on public.profiles
      for each row execute function public.profili_a4_touch_profile_updated_at()';
  end if;
end
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profili-a4-profile-photos',
  'Profili A4 profile photos',
  false,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'profili_a4_photos_select'
  ) then
    execute $policy$
      create policy "profili_a4_photos_select"
        on storage.objects for select to authenticated
        using (
          bucket_id = 'profili-a4-profile-photos'
          and (storage.foldername(name))[1] = (select auth.uid()::text)
        )
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'profili_a4_photos_insert'
  ) then
    execute $policy$
      create policy "profili_a4_photos_insert"
        on storage.objects for insert to authenticated
        with check (
          bucket_id = 'profili-a4-profile-photos'
          and (storage.foldername(name))[1] = (select auth.uid()::text)
          and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
        )
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'profili_a4_photos_delete'
  ) then
    execute $policy$
      create policy "profili_a4_photos_delete"
        on storage.objects for delete to authenticated
        using (
          bucket_id = 'profili-a4-profile-photos'
          and (storage.foldername(name))[1] = (select auth.uid()::text)
        )
    $policy$;
  end if;
end
$$;

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

commit;