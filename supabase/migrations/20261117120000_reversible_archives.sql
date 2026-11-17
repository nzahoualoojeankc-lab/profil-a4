begin;

alter table public.account_documents
  add column archived_at timestamptz;

alter table public.account_document_templates
  add column archived_at timestamptz;

create index account_documents_user_archive_updated_idx
  on public.account_documents (user_id, archived_at, updated_at desc);

create index account_document_templates_user_archive_updated_idx
  on public.account_document_templates (user_id, archived_at, updated_at desc);

create or replace function public.profili_a4_enforce_profile_limit()
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
$$;

commit;
