-- Version 1.0 is translated without changing its acceptance version.
begin;

alter table public.account_terms_versions
  add column translations jsonb not null default '{}'::jsonb;

update public.account_terms_versions
set translations = jsonb_build_object(
  'fr',
  content,
  'en',
  'By creating or using your account, you agree to follow the application’s rules and any payment obligations you have agreed to. The application owner or administrators appointed by the owner may temporarily suspend access to your account if you breach the agreement, including for overdue payments, fraud, or ethical misconduct. Suspension preserves your data, states a reason, and lets you appeal. This version does not govern permanent account deletion, and this feature will not permanently delete your account.',
  'ru',
  'Создавая аккаунт или пользуясь им, вы соглашаетесь соблюдать правила использования приложения и принятые на себя обязательства по оплате. Владелец приложения или назначенные им администраторы могут временно приостановить доступ к вашей учётной записи при нарушении соглашения, в том числе из-за просроченного платежа, мошенничества или неэтичного поведения. Приостановка сохраняет ваши данные, указывает причину и позволяет подать апелляцию. Эта версия не регулирует окончательное удаление аккаунта, и данная функция не удаляет аккаунт окончательно.'
)
where version = '1.0';

alter table public.account_terms_acceptances
  add column accepted_language text not null default 'fr'
  check (accepted_language in ('fr', 'en', 'ru'));

drop function public.profili_a4_accept_terms(uuid, text);

create function public.profili_a4_accept_terms(
  p_actor uuid,
  p_version text,
  p_language text
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  acceptance_time timestamptz;
begin
  if p_language is null or p_language not in ('fr', 'en', 'ru') then
    raise exception 'Unsupported terms language' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.account_terms_versions
    where version = p_version and is_current
  ) then
    raise exception 'Terms version is not current' using errcode = '22023';
  end if;

  insert into public.account_terms_acceptances (user_id, terms_version, accepted_language)
  values (p_actor, p_version, p_language)
  on conflict (user_id, terms_version)
  do update set
    accepted_language = excluded.accepted_language,
    accepted_at = now()
  returning accepted_at into acceptance_time;

  return acceptance_time;
end;
$$;

revoke all on function public.profili_a4_accept_terms(uuid, text, text) from public, anon, authenticated;
grant execute on function public.profili_a4_accept_terms(uuid, text, text) to service_role;

commit;
