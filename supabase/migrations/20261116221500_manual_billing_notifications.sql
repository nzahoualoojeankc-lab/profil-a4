-- Manual monthly dues and transactional email outbox, separate from moderation.
begin;

create table public.account_payment_dues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete restrict,
  billing_period date not null check (billing_period = date_trunc('month', billing_period)::date),
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  due_date date not null,
  status text not null default 'due' check (status in ('due', 'paid', 'cancelled')),
  paid_at timestamptz,
  paid_by uuid references auth.users (id) on delete set null,
  created_by uuid not null references auth.users (id) on delete restrict,
  updated_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'paid' and paid_at is not null)
    or (status = 'due' and paid_at is null)
    or status = 'cancelled'
  )
);

create unique index account_payment_one_active_period
  on public.account_payment_dues (user_id, billing_period)
  where status <> 'cancelled';

create index account_payment_due_date_idx
  on public.account_payment_dues (due_date)
  where status = 'due';

create table public.account_payment_audit (
  id bigint generated always as identity primary key,
  payment_id uuid not null references public.account_payment_dues (id) on delete restrict,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null check (action in ('created', 'updated', 'paid', 'cancelled')),
  reason text not null check (length(trim(reason)) between 1 and 2000),
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create table public.account_payment_email_outbox (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.account_payment_dues (id) on delete restrict,
  event_type text not null check (event_type in ('receipt', 'late_reminder', 'receipt_void')),
  reminder_number integer not null default 0 check (reminder_number >= 0),
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'skipped')),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  unique (payment_id, event_type, due_date, reminder_number)
);

alter table public.account_payment_dues enable row level security;
alter table public.account_payment_audit enable row level security;
alter table public.account_payment_email_outbox enable row level security;

revoke all on table public.account_payment_dues from public, anon, authenticated;
revoke all on table public.account_payment_audit from public, anon, authenticated;
revoke all on table public.account_payment_email_outbox from public, anon, authenticated;
grant all on table public.account_payment_dues to service_role;
grant all on table public.account_payment_audit to service_role;
grant all on table public.account_payment_email_outbox to service_role;
grant usage, select on sequence public.account_payment_audit_id_seq to service_role;

create function public.profili_a4_payment_actor_can_manage(p_actor uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.account_admins
    where user_id = p_actor and role in ('owner', 'moderator')
  ) and public.profili_a4_account_is_usable(p_actor);
$$;

create function public.profili_a4_record_payment_due(
  p_actor uuid,
  p_target uuid,
  p_period date,
  p_amount numeric,
  p_currency text,
  p_due_date date,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  due_row public.account_payment_dues%rowtype;
  before_value jsonb;
  action_name text;
begin
  if not public.profili_a4_payment_actor_can_manage(p_actor) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if p_period is null or date_trunc('month', p_period)::date <> p_period then
    raise exception 'Billing period must be the first day of a month' using errcode = '22023';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be greater than zero' using errcode = '22023';
  end if;
  if p_amount <> round(p_amount, 2) then
    raise exception 'Amount cannot have more than two decimal places' using errcode = '22023';
  end if;
  if p_currency is null or p_currency !~ '^[A-Z]{3}$' then
    raise exception 'Currency must be a three-letter uppercase code' using errcode = '22023';
  end if;
  if p_due_date is null then
    raise exception 'Due date is required' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_reason, ''))) not between 1 and 2000 then
    raise exception 'A reason of up to 2000 characters is required' using errcode = '22023';
  end if;
  if not exists (
    select 1 from auth.users
    where id = p_target and email_confirmed_at is not null and email is not null
  ) then
    raise exception 'A confirmed account email is required' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_target::text), hashtext(p_period::text));
  select * into due_row
  from public.account_payment_dues
  where user_id = p_target
    and billing_period = p_period
    and status <> 'cancelled'
  for update;

  if found then
    if due_row.status <> 'due' then
      raise exception 'A confirmed payment cannot be edited; cancel it with an audit reason first' using errcode = '22023';
    end if;
    before_value := to_jsonb(due_row);
    action_name := 'updated';
    update public.account_payment_dues
    set amount = p_amount,
        currency = p_currency,
        due_date = p_due_date,
        updated_by = p_actor,
        updated_at = now()
    where id = due_row.id
    returning * into due_row;
  else
    action_name := 'created';
    insert into public.account_payment_dues (
      user_id, billing_period, amount, currency, due_date, created_by, updated_by
    ) values (
      p_target, p_period, p_amount, p_currency, p_due_date, p_actor, p_actor
    )
    returning * into due_row;
  end if;

  insert into public.account_payment_audit (
    payment_id, actor_id, action, reason, before_data, after_data
  ) values (
    due_row.id, p_actor, action_name, trim(p_reason), before_value, to_jsonb(due_row)
  );
  return due_row.id;
end;
$$;

create function public.profili_a4_mark_payment_paid(
  p_actor uuid,
  p_payment_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  due_row public.account_payment_dues%rowtype;
  before_value jsonb;
begin
  if not public.profili_a4_payment_actor_can_manage(p_actor) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if length(trim(coalesce(p_reason, ''))) not between 1 and 2000 then
    raise exception 'A reason of up to 2000 characters is required' using errcode = '22023';
  end if;

  select * into due_row
  from public.account_payment_dues
  where id = p_payment_id
  for update;
  if not found then
    raise exception 'Payment due not found' using errcode = 'P0002';
  end if;
  if due_row.status <> 'due' then
    raise exception 'Only an unpaid due can be marked paid' using errcode = '22023';
  end if;

  before_value := to_jsonb(due_row);
  update public.account_payment_dues
  set status = 'paid', paid_at = now(), paid_by = p_actor,
      updated_by = p_actor, updated_at = now()
  where id = p_payment_id
  returning * into due_row;

  insert into public.account_payment_audit (
    payment_id, actor_id, action, reason, before_data, after_data
  ) values (
    due_row.id, p_actor, 'paid', trim(p_reason), before_value, to_jsonb(due_row)
  );
  insert into public.account_payment_email_outbox (
    payment_id, event_type, due_date
  ) values (
    due_row.id, 'receipt', due_row.due_date
  ) on conflict do nothing;
  return due_row.id;
end;
$$;

create function public.profili_a4_cancel_payment_due(
  p_actor uuid,
  p_payment_id uuid,
  p_reason text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  due_row public.account_payment_dues%rowtype;
  before_value jsonb;
  previous_status text;
begin
  if not public.profili_a4_payment_actor_can_manage(p_actor) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if length(trim(coalesce(p_reason, ''))) not between 1 and 2000 then
    raise exception 'A reason of up to 2000 characters is required' using errcode = '22023';
  end if;

  select * into due_row
  from public.account_payment_dues
  where id = p_payment_id
  for update;
  if not found then
    raise exception 'Payment due not found' using errcode = 'P0002';
  end if;
  if due_row.status = 'cancelled' then
    raise exception 'Payment due is already cancelled' using errcode = '22023';
  end if;

  before_value := to_jsonb(due_row);
  previous_status := due_row.status;
  update public.account_payment_dues
  set status = 'cancelled', updated_by = p_actor, updated_at = now()
  where id = p_payment_id
  returning * into due_row;

  insert into public.account_payment_audit (
    payment_id, actor_id, action, reason, before_data, after_data
  ) values (
    due_row.id, p_actor, 'cancelled', trim(p_reason), before_value, to_jsonb(due_row)
  );
  if previous_status = 'paid' then
    insert into public.account_payment_email_outbox (
      payment_id, event_type, due_date
    ) values (
      due_row.id, 'receipt_void', due_row.due_date
    ) on conflict do nothing;
  end if;
  return previous_status;
end;
$$;

create function public.profili_a4_enqueue_payment_reminders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  queued_count integer;
begin
  insert into public.account_payment_email_outbox (
    payment_id, event_type, reminder_number, due_date
  )
  select payment.id,
         'late_reminder',
         floor((current_date - payment.due_date - 3) / 3.0)::integer + 1,
         payment.due_date
  from public.account_payment_dues as payment
  where payment.status = 'due'
    and current_date >= payment.due_date + 3
  on conflict do nothing;

  get diagnostics queued_count = row_count;
  return queued_count;
end;
$$;

create function public.profili_a4_claim_payment_emails(p_limit integer default 50)
returns table (
  id uuid,
  payment_id uuid,
  event_type text,
  reminder_number integer,
  due_date date
)
language sql
security definer
set search_path = ''
as $$
  with ready as (
    select outbox.id
    from public.account_payment_email_outbox as outbox
    where (outbox.status = 'pending' and outbox.available_at <= now())
       or (outbox.status = 'sending' and outbox.locked_at < now() - interval '15 minutes')
    order by outbox.created_at
    for update skip locked
    limit least(greatest(coalesce(p_limit, 50), 1), 100)
  )
  update public.account_payment_email_outbox as outbox
  set status = 'sending',
      attempts = outbox.attempts + 1,
      locked_at = now()
  from ready
  where outbox.id = ready.id
  returning outbox.id, outbox.payment_id, outbox.event_type,
    outbox.reminder_number, outbox.due_date;
$$;

create function public.profili_a4_complete_payment_email(
  p_id uuid,
  p_status text,
  p_error text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('sent', 'pending', 'skipped') then
    raise exception 'Invalid email outbox status' using errcode = '22023';
  end if;

  update public.account_payment_email_outbox
  set status = p_status,
      locked_at = null,
      sent_at = case when p_status = 'sent' then now() else sent_at end,
      available_at = case
        when p_status = 'pending' then now() + least(60, power(2, least(attempts, 6))::integer) * interval '1 minute'
        else available_at
      end,
      last_error = case when p_status = 'pending' then left(coalesce(p_error, 'Delivery failed'), 2000) else null end
  where id = p_id;
  if not found then
    raise exception 'Email outbox item not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.profili_a4_payment_actor_can_manage(uuid) from public, anon, authenticated;
revoke all on function public.profili_a4_record_payment_due(uuid, uuid, date, numeric, text, date, text) from public, anon, authenticated;
revoke all on function public.profili_a4_mark_payment_paid(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.profili_a4_cancel_payment_due(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.profili_a4_enqueue_payment_reminders() from public, anon, authenticated;
revoke all on function public.profili_a4_claim_payment_emails(integer) from public, anon, authenticated;
revoke all on function public.profili_a4_complete_payment_email(uuid, text, text) from public, anon, authenticated;
grant execute on function public.profili_a4_payment_actor_can_manage(uuid) to service_role;
grant execute on function public.profili_a4_record_payment_due(uuid, uuid, date, numeric, text, date, text) to service_role;
grant execute on function public.profili_a4_mark_payment_paid(uuid, uuid, text) to service_role;
grant execute on function public.profili_a4_cancel_payment_due(uuid, uuid, text) to service_role;
grant execute on function public.profili_a4_enqueue_payment_reminders() to service_role;
grant execute on function public.profili_a4_claim_payment_emails(integer) to service_role;
grant execute on function public.profili_a4_complete_payment_email(uuid, text, text) to service_role;

commit;
