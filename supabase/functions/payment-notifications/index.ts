import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info, x-payment-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function respond(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function secureEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function paymentEmail(event: string, payment: Record<string, unknown>, language: string) {
  const period = String(payment.billing_period).slice(0, 7);
  const dueDate = String(payment.due_date);
  const amount = `${Number(payment.amount).toFixed(2)} ${payment.currency}`;
  const paidDate = payment.paid_at ? new Date(String(payment.paid_at)).toISOString().slice(0, 10) : '';
  const messages = {
    fr: {
      receipt: {
        subject: `Confirmation de paiement — ${period}`,
        text: `Votre paiement pour la période ${period} a été confirmé.\nMontant : ${amount}\nDate de paiement : ${paidDate}\n\nCe message confirme l’enregistrement du paiement; il ne constitue pas une facture fiscale.`,
      },
      late_reminder: {
        subject: `Rappel : échéance de paiement en retard — ${period}`,
        text: `L’échéance de paiement pour la période ${period} est en retard.\nMontant : ${amount}\nDate d’échéance : ${dueDate}\n\nSi vous avez déjà payé, contactez le propriétaire ou un administrateur délégué afin qu’il confirme le paiement.`,
      },
      receipt_void: {
        subject: `Correction : confirmation de paiement annulée — ${period}`,
        text: `La confirmation de paiement enregistrée pour la période ${period} a été annulée par un administrateur.\nMontant concerné : ${amount}\n\nVeuillez contacter le propriétaire ou un administrateur délégué pour toute question.`,
      },
    },
    en: {
      receipt: {
        subject: `Payment confirmation — ${period}`,
        text: `Your payment for period ${period} has been confirmed.\nAmount: ${amount}\nPayment date: ${paidDate}\n\nThis message confirms the recorded payment; it is not a tax invoice.`,
      },
      late_reminder: {
        subject: `Reminder: overdue payment — ${period}`,
        text: `The payment due for period ${period} is overdue.\nAmount: ${amount}\nDue date: ${dueDate}\n\nIf you have already paid, contact the owner or a delegated administrator so they can confirm the payment.`,
      },
      receipt_void: {
        subject: `Correction: payment confirmation cancelled — ${period}`,
        text: `The payment confirmation recorded for period ${period} has been cancelled by an administrator.\nAmount concerned: ${amount}\n\nContact the owner or a delegated administrator if you have questions.`,
      },
    },
    ru: {
      receipt: {
        subject: `Подтверждение платежа — ${period}`,
        text: `Ваш платеж за период ${period} подтвержден.\nСумма: ${amount}\nДата платежа: ${paidDate}\n\nЭто сообщение подтверждает регистрацию платежа, но не является налоговым счетом.`,
      },
      late_reminder: {
        subject: `Напоминание: просрочен платеж — ${period}`,
        text: `Срок оплаты за период ${period} истек.\nСумма: ${amount}\nСрок оплаты: ${dueDate}\n\nЕсли вы уже оплатили, свяжитесь с владельцем или назначенным администратором, чтобы он подтвердил платеж.`,
      },
      receipt_void: {
        subject: `Исправление: подтверждение платежа отменено — ${period}`,
        text: `Подтверждение платежа за период ${period} отменено администратором.\nСумма: ${amount}\n\nЕсли у вас есть вопросы, свяжитесь с владельцем или назначенным администратором.`,
      },
    },
  };
  const type = event as keyof typeof messages.fr;
  return messages[language as keyof typeof messages][type];
}

async function completeOutboxItem(
  adminClient: ReturnType<typeof createClient>,
  id: string,
  status: 'sent' | 'pending' | 'skipped',
  error?: string,
) {
  const { error: completionError } = await adminClient.rpc('profili_a4_complete_payment_email', {
    p_id: id,
    p_status: status,
    p_error: error ?? null,
  });
  if (completionError) throw new Error('Could not update payment email delivery status');
}

async function processOutbox(adminClient: ReturnType<typeof createClient>) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const resendFrom = Deno.env.get('RESEND_FROM');
  if (!resendApiKey || !resendFrom) {
    return respond({ error: 'Email service configuration is incomplete' }, 503);
  }

  const { error: queueError } = await adminClient.rpc('profili_a4_enqueue_payment_reminders');
  if (queueError) return respond({ error: 'Could not queue overdue payment reminders' }, 500);

  const { data: items, error: claimError } = await adminClient.rpc('profili_a4_claim_payment_emails', {
    p_limit: 50,
  });
  if (claimError) return respond({ error: 'Could not claim payment email jobs' }, 500);

  let sent = 0;
  let skipped = 0;
  let retried = 0;
  for (const item of items ?? []) {
    const { data: payment, error: paymentError } = await adminClient.from('account_payment_dues')
      .select('id,user_id,billing_period,amount,currency,due_date,status,paid_at')
      .eq('id', item.payment_id).maybeSingle();
    if (paymentError || !payment) {
      await completeOutboxItem(adminClient, item.id, 'pending', 'Could not load the payment record');
      retried++;
      continue;
    }

    const requiredStatus = item.event_type === 'receipt'
      ? 'paid'
      : item.event_type === 'receipt_void' ? 'cancelled' : 'due';
    if (payment.status !== requiredStatus
        || item.event_type === 'late_reminder' && payment.due_date !== item.due_date) {
      await completeOutboxItem(adminClient, item.id, 'skipped');
      skipped++;
      continue;
    }

    const { data: userResult, error: userError } = await adminClient.auth.admin.getUserById(payment.user_id);
    const email = userResult.user?.email;
    if (userError || !email) {
      await completeOutboxItem(adminClient, item.id, 'pending', 'Recipient email is unavailable');
      retried++;
      continue;
    }

    const preferredLanguage = userResult.user.user_metadata?.application_language;
    const language = ['fr', 'en', 'ru'].includes(preferredLanguage) ? preferredLanguage : 'fr';
    const message = paymentEmail(item.event_type, payment, language);
    if (!message) {
      await completeOutboxItem(adminClient, item.id, 'pending', 'Unsupported email template');
      retried++;
      continue;
    }

    let response: Response;
    try {
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': item.id,
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [email],
          subject: message.subject,
          text: message.text,
        }),
      });
    } catch {
      await completeOutboxItem(adminClient, item.id, 'pending', 'Could not connect to Resend');
      retried++;
      continue;
    }

    if (!response.ok) {
      await completeOutboxItem(adminClient, item.id, 'pending', `Resend returned HTTP ${response.status}`);
      retried++;
      continue;
    }
    await completeOutboxItem(adminClient, item.id, 'sent');
    sent++;
  }

  return respond({ queued: items?.length ?? 0, sent, skipped, retried }, retried ? 502 : 200);
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return respond({ error: 'Method not allowed' }, 405);

  const projectUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!projectUrl || !anonKey || !serviceRoleKey) {
    return respond({ error: 'Server configuration is incomplete' }, 503);
  }

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return respond({ error: 'Invalid JSON body' }, 400);
  }
  if (!isRecord(parsedBody)) return respond({ error: 'A JSON object is required' }, 400);
  const body = parsedBody;

  const adminClient = createClient(projectUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  if (body.action === 'process_outbox') {
    const expectedSecret = Deno.env.get('PAYMENT_NOTIFICATIONS_CRON_SECRET');
    const suppliedSecret = request.headers.get('x-payment-cron-secret') ?? '';
    if (!expectedSecret || !secureEqual(suppliedSecret, expectedSecret)) {
      return respond({ error: 'Invalid scheduled-job credentials' }, 401);
    }
    return await processOutbox(adminClient);
  }

  const authorization = request.headers.get('Authorization');
  const token = authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return respond({ error: 'Authentication required' }, 401);
  const userClient = createClient(projectUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userResult, error: authError } = await userClient.auth.getUser(token);
  if (authError || !userResult.user) return respond({ error: 'Invalid session' }, 401);
  const actor = userResult.user;

  const { data: role, error: roleError } = await adminClient.from('account_admins')
    .select('role').eq('user_id', actor.id).maybeSingle();
  if (roleError) return respond({ error: 'Could not verify administrator access' }, 500);
  if (!role || !['owner', 'moderator'].includes(role.role)) {
    return respond({ error: 'Administrator access required' }, 403);
  }
  const { data: actorUsable, error: usableError } = await adminClient.rpc('profili_a4_account_is_usable', {
    p_user_id: actor.id,
  });
  if (usableError || actorUsable !== true) {
    return respond({ error: 'Administrator account is not permitted to manage payments' }, 403);
  }

  if (body.action === 'list') {
    if (!isUuid(body.targetId)) return respond({ error: 'Invalid target account' }, 400);
    const { data: payments, error: paymentError } = await adminClient.from('account_payment_dues')
      .select('id,user_id,billing_period,amount,currency,due_date,status,paid_at,created_at,updated_at')
      .eq('user_id', body.targetId).order('billing_period', { ascending: false });
    if (paymentError) return respond({ error: 'Could not load payment records' }, 500);
    const paymentIds = (payments ?? []).map(payment => payment.id);
    let audit: unknown[] = [];
    let emails: unknown[] = [];
    if (paymentIds.length) {
      const [{ data: auditRows, error: auditError }, { data: emailRows, error: emailError }] =
        await Promise.all([
          adminClient.from('account_payment_audit')
            .select('payment_id,action,reason,before_data,after_data,created_at')
            .in('payment_id', paymentIds).order('created_at', { ascending: false }).limit(100),
          adminClient.from('account_payment_email_outbox')
            .select('payment_id,event_type,status,attempts,last_error,sent_at,created_at')
            .in('payment_id', paymentIds).order('created_at', { ascending: false }).limit(100),
        ]);
      if (auditError || emailError) return respond({ error: 'Could not load payment history' }, 500);
      audit = auditRows ?? [];
      emails = emailRows ?? [];
    }
    return respond({ payments: payments ?? [], audit, emails });
  }

  if (body.action === 'save_due') {
    if (!isUuid(body.targetId)) return respond({ error: 'Invalid target account' }, 400);
    if (typeof body.period !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(body.period)) {
      return respond({ error: 'A billing month is required' }, 400);
    }
    const amount = body.amount;
    if (typeof amount !== 'number') {
      return respond({ error: 'Enter a valid amount' }, 400);
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > 9999999999.99) {
      return respond({ error: 'Enter a valid amount' }, 400);
    }
    if (typeof body.currency !== 'string' || !/^[A-Z]{3}$/.test(body.currency)) {
      return respond({ error: 'Enter a three-letter uppercase currency code' }, 400);
    }
    try {
      new Intl.NumberFormat('en', { style: 'currency', currency: body.currency }).format(0);
    } catch {
      return respond({ error: 'Enter a supported currency code' }, 400);
    }
    if (!isIsoDate(body.dueDate)) {
      return respond({ error: 'Enter a valid due date' }, 400);
    }
    if (typeof body.reason !== 'string' || !body.reason.trim() || body.reason.length > 2000) {
      return respond({ error: 'A reason of up to 2000 characters is required' }, 400);
    }
    const { data, error } = await adminClient.rpc('profili_a4_record_payment_due', {
      p_actor: actor.id,
      p_target: body.targetId,
      p_period: `${body.period}-01`,
      p_amount: amount,
      p_currency: body.currency,
      p_due_date: body.dueDate,
      p_reason: body.reason.trim(),
    });
    if (error) return respond({ error: error.message }, 400);
    return respond({ paymentId: data });
  }

  if (body.action === 'mark_paid' || body.action === 'cancel_due') {
    if (!isUuid(body.paymentId)) return respond({ error: 'Invalid payment record' }, 400);
    if (typeof body.reason !== 'string' || !body.reason.trim() || body.reason.length > 2000) {
      return respond({ error: 'A reason of up to 2000 characters is required' }, 400);
    }
    const procedure = body.action === 'mark_paid'
      ? 'profili_a4_mark_payment_paid'
      : 'profili_a4_cancel_payment_due';
    const { data, error } = await adminClient.rpc(procedure, {
      p_actor: actor.id,
      p_payment_id: body.paymentId,
      p_reason: body.reason.trim(),
    });
    if (error) return respond({ error: error.message }, 400);
    return respond({ result: data, emailQueued: body.action === 'mark_paid' || data === 'paid' });
  }

  return respond({ error: 'Unknown action' }, 400);
});
