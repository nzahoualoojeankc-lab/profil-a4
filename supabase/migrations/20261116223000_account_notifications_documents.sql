begin;

create table public.account_notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null check (category in ('moderation', 'payments')),
  event_type text not null check (event_type in (
    'suspended', 'reactivated', 'moderator_granted', 'moderator_revoked',
    'payment_due_created', 'payment_due_updated', 'payment_due_cancelled',
    'payment_receipt', 'payment_reminder', 'payment_correction'
  )),
  details jsonb not null default '{}'::jsonb
    check (jsonb_typeof(details) = 'object' and pg_column_size(details) <= 8192),
  source_type text not null check (source_type in ('moderation_audit', 'payment_audit', 'payment_email')),
  source_id text not null check (length(source_id) between 1 and 100),
  email_status text not null default 'not_applicable'
    check (email_status in ('not_applicable', 'queued', 'retrying', 'accepted', 'skipped')),
  email_error text,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique (source_type, source_id)
);

create index account_notifications_user_created_idx
  on public.account_notifications (user_id, created_at desc);
create index account_notifications_unread_idx
  on public.account_notifications (user_id, created_at desc)
  where read_at is null;

create table public.account_document_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null check (category in (
    'payroll_report', 'payroll_check', 'event_badge', 'event_ticket'
  )),
  name text not null check (length(trim(name)) between 1 and 120),
  design jsonb not null
    check (jsonb_typeof(design) = 'object' and pg_column_size(design) <= 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index account_document_templates_user_updated_idx
  on public.account_document_templates (user_id, updated_at desc);

create table public.account_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null check (category in (
    'payroll_report', 'payroll_check', 'event_badge', 'event_ticket'
  )),
  title text not null check (length(trim(title)) between 1 and 160),
  payload jsonb not null
    check (jsonb_typeof(payload) = 'object' and pg_column_size(payload) <= 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index account_documents_user_updated_idx
  on public.account_documents (user_id, updated_at desc);

alter table public.account_notifications enable row level security;
alter table public.account_document_templates enable row level security;
alter table public.account_documents enable row level security;

revoke all on table public.account_notifications from public, anon, authenticated;
revoke all on table public.account_document_templates from public, anon, authenticated;
revoke all on table public.account_documents from public, anon, authenticated;
grant select, update (read_at) on table public.account_notifications to authenticated;
grant select, insert, update, delete on table public.account_document_templates to authenticated;
grant select, insert, update, delete on table public.account_documents to authenticated;
grant all on table public.account_notifications to service_role;
grant all on table public.account_document_templates to service_role;
grant all on table public.account_documents to service_role;
grant usage, select on sequence public.account_notifications_id_seq to service_role;

create policy "profili_a4_notifications_select"
  on public.account_notifications for select to authenticated
  using (
    user_id = (select auth.uid())
    and (select public.profili_a4_current_account_can_use())
  );

create policy "profili_a4_notifications_update_read"
  on public.account_notifications for update to authenticated
  using (
    user_id = (select auth.uid())
    and (select public.profili_a4_current_account_can_use())
  )
  with check (
    user_id = (select auth.uid())
    and (select public.profili_a4_current_account_can_use())
  );

create policy "profili_a4_document_templates_select"
  on public.account_document_templates for select to authenticated
  using (
    user_id = (select auth.uid())
    and (select public.profili_a4_current_account_can_use())
  );
create policy "profili_a4_document_templates_insert"
  on public.account_document_templates for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select public.profili_a4_current_account_can_use())
  );
create policy "profili_a4_document_templates_update"
  on public.account_document_templates for update to authenticated
  using (
    user_id = (select auth.uid())
    and (select public.profili_a4_current_account_can_use())
  )
  with check (
    user_id = (select auth.uid())
    and (select public.profili_a4_current_account_can_use())
  );
create policy "profili_a4_document_templates_delete"
  on public.account_document_templates for delete to authenticated
  using (
    user_id = (select auth.uid())
    and (select public.profili_a4_current_account_can_use())
  );

create policy "profili_a4_documents_select"
  on public.account_documents for select to authenticated
  using (
    user_id = (select auth.uid())
    and (select public.profili_a4_current_account_can_use())
  );
create policy "profili_a4_documents_insert"
  on public.account_documents for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select public.profili_a4_current_account_can_use())
  );
create policy "profili_a4_documents_update"
  on public.account_documents for update to authenticated
  using (
    user_id = (select auth.uid())
    and (select public.profili_a4_current_account_can_use())
  )
  with check (
    user_id = (select auth.uid())
    and (select public.profili_a4_current_account_can_use())
  );
create policy "profili_a4_documents_delete"
  on public.account_documents for delete to authenticated
  using (
    user_id = (select auth.uid())
    and (select public.profili_a4_current_account_can_use())
  );

create trigger profili_a4_document_templates_touch_updated_at
  before update on public.account_document_templates
  for each row execute function public.profili_a4_touch_profile_updated_at();
create trigger profili_a4_documents_touch_updated_at
  before update on public.account_documents
  for each row execute function public.profili_a4_touch_profile_updated_at();

create function public.profili_a4_notify_moderation_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.target_id is not null then
    insert into public.account_notifications (
      user_id, category, event_type, details, source_type, source_id
    ) values (
      new.target_id,
      'moderation',
      new.action,
      jsonb_build_object(
        'reason', new.reason,
        'old_status', new.old_status,
        'new_status', new.new_status
      ),
      'moderation_audit',
      new.id::text
    ) on conflict (source_type, source_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger profili_a4_moderation_notification
  after insert on public.account_moderation_audit
  for each row execute function public.profili_a4_notify_moderation_event();

create function public.profili_a4_notify_payment_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  notification_type text;
begin
  notification_type := case
    when new.action = 'created' then 'payment_due_created'
    when new.action = 'updated' then 'payment_due_updated'
    when new.action = 'cancelled'
      and coalesce(new.before_data ->> 'status', '') <> 'paid' then 'payment_due_cancelled'
    else null
  end;
  if notification_type is not null then
    insert into public.account_notifications (
      user_id, category, event_type, details, source_type, source_id
    )
    select payment.user_id,
      'payments',
      notification_type,
      jsonb_build_object(
        'period', payment.billing_period,
        'amount', payment.amount,
        'currency', payment.currency,
        'due_date', payment.due_date,
        'reason', new.reason
      ),
      'payment_audit',
      new.id::text
    from public.account_payment_dues as payment
    where payment.id = new.payment_id
    on conflict (source_type, source_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger profili_a4_payment_audit_notification
  after insert on public.account_payment_audit
  for each row execute function public.profili_a4_notify_payment_audit();

create function public.profili_a4_notify_payment_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  notification_type text;
begin
  notification_type := case new.event_type
    when 'receipt' then 'payment_receipt'
    when 'late_reminder' then 'payment_reminder'
    when 'receipt_void' then 'payment_correction'
  end;

  insert into public.account_notifications (
    user_id, category, event_type, details, source_type, source_id, email_status
  )
  select payment.user_id,
    'payments',
    notification_type,
    jsonb_build_object(
      'period', payment.billing_period,
      'amount', payment.amount,
      'currency', payment.currency,
      'due_date', payment.due_date,
      'paid_at', payment.paid_at,
      'reminder_number', new.reminder_number
    ),
    'payment_email',
    new.id::text,
    'queued'
  from public.account_payment_dues as payment
  where payment.id = new.payment_id
  on conflict (source_type, source_id) do nothing;
  return new;
end;
$$;

create trigger profili_a4_payment_email_notification
  after insert on public.account_payment_email_outbox
  for each row execute function public.profili_a4_notify_payment_email();

create function public.profili_a4_sync_payment_email_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.account_notifications
  set email_status = case
        when new.status = 'sent' then 'accepted'
        when new.status = 'skipped' then 'skipped'
        when new.last_error is not null then 'retrying'
        else 'queued'
      end,
      email_error = case when new.status = 'pending' then new.last_error else null end
  where source_type = 'payment_email'
    and source_id = new.id::text;
  return new;
end;
$$;

create trigger profili_a4_sync_payment_email_notification
  after update of status, last_error on public.account_payment_email_outbox
  for each row execute function public.profili_a4_sync_payment_email_notification();

insert into public.account_notifications (
  user_id, category, event_type, details, source_type, source_id
)
select audit.target_id,
  'moderation',
  audit.action,
  jsonb_build_object(
    'reason', audit.reason,
    'old_status', audit.old_status,
    'new_status', audit.new_status
  ),
  'moderation_audit',
  audit.id::text
from public.account_moderation_audit as audit
where audit.target_id is not null
on conflict (source_type, source_id) do nothing;

insert into public.account_notifications (
  user_id, category, event_type, details, source_type, source_id
)
select payment.user_id,
  'payments',
  case
    when audit.action = 'created' then 'payment_due_created'
    when audit.action = 'updated' then 'payment_due_updated'
    else 'payment_due_cancelled'
  end,
  jsonb_build_object(
    'period', payment.billing_period,
    'amount', payment.amount,
    'currency', payment.currency,
    'due_date', payment.due_date,
    'reason', audit.reason
  ),
  'payment_audit',
  audit.id::text
from public.account_payment_audit as audit
join public.account_payment_dues as payment on payment.id = audit.payment_id
where audit.action in ('created', 'updated')
   or (audit.action = 'cancelled' and coalesce(audit.before_data ->> 'status', '') <> 'paid')
on conflict (source_type, source_id) do nothing;

insert into public.account_notifications (
  user_id, category, event_type, details, source_type, source_id, email_status, email_error
)
select payment.user_id,
  'payments',
  case outbox.event_type
    when 'receipt' then 'payment_receipt'
    when 'late_reminder' then 'payment_reminder'
    when 'receipt_void' then 'payment_correction'
  end,
  jsonb_build_object(
    'period', payment.billing_period,
    'amount', payment.amount,
    'currency', payment.currency,
    'due_date', payment.due_date,
    'paid_at', payment.paid_at,
    'reminder_number', outbox.reminder_number
  ),
  'payment_email',
  outbox.id::text,
  case
    when outbox.status = 'sent' then 'accepted'
    when outbox.status = 'skipped' then 'skipped'
    when outbox.last_error is not null then 'retrying'
    else 'queued'
  end,
  case when outbox.status = 'pending' then outbox.last_error else null end
from public.account_payment_email_outbox as outbox
join public.account_payment_dues as payment on payment.id = outbox.payment_id
on conflict (source_type, source_id) do nothing;

revoke all on function public.profili_a4_notify_moderation_event() from public, anon, authenticated;
revoke all on function public.profili_a4_notify_payment_audit() from public, anon, authenticated;
revoke all on function public.profili_a4_notify_payment_email() from public, anon, authenticated;
revoke all on function public.profili_a4_sync_payment_email_notification() from public, anon, authenticated;

do $$
declare
  table_name text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach table_name in array array[
      'account_notifications',
      'account_document_templates',
      'account_documents'
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

commit;
