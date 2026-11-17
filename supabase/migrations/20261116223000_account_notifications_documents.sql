select 'table' as type, x.name as objet,
       to_regclass(format('public.%I', x.name)) is not null as present
from (values
  ('account_notifications'),
  ('account_document_templates'),
  ('account_documents'),
  ('account_payment_dues'),
  ('account_payment_audit'),
  ('account_payment_email_outbox'),
  ('account_moderation_audit')
) as x(name)

union all

select 'policy', x.name,
       exists (
         select 1 from pg_policies
         where schemaname = 'public' and policyname = x.name
       )
from (values
  ('profili_a4_notifications_select'),
  ('profili_a4_notifications_update_read'),
  ('profili_a4_document_templates_select'),
  ('profili_a4_document_templates_insert'),
  ('profili_a4_document_templates_update'),
  ('profili_a4_document_templates_delete'),
  ('profili_a4_documents_select'),
  ('profili_a4_documents_insert'),
  ('profili_a4_documents_update'),
  ('profili_a4_documents_delete')
) as x(name)

union all

select 'trigger', x.name,
       exists (
         select 1
         from pg_trigger t
         join pg_class c on c.oid = t.tgrelid
         join pg_namespace n on n.oid = c.relnamespace
         where n.nspname = 'public'
           and t.tgname = x.name
           and not t.tgisinternal
       )
from (values
  ('profili_a4_document_templates_touch_updated_at'),
  ('profili_a4_documents_touch_updated_at'),
  ('profili_a4_moderation_notification'),
  ('profili_a4_payment_audit_notification'),
  ('profili_a4_payment_email_notification'),
  ('profili_a4_sync_payment_email_notification')
) as x(name)

union all

select 'function', x.name,
       to_regprocedure('public.' || x.name || '()') is not null
from (values
  ('profili_a4_notify_moderation_event'),
  ('profili_a4_notify_payment_audit'),
  ('profili_a4_notify_payment_email'),
  ('profili_a4_sync_payment_email_notification')
) as x(name)
order by 1, 2;