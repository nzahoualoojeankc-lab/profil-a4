import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function respond(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return respond({ error: 'Method not allowed' }, 405);

  const projectUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!projectUrl || !anonKey || !serviceRoleKey) {
    return respond({ error: 'Server configuration is incomplete' }, 503);
  }

  const authorization = request.headers.get('Authorization');
  const token = authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return respond({ error: 'Authentication required' }, 401);

  const userClient = createClient(projectUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const adminClient = createClient(projectUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userResult, error: authError } = await userClient.auth.getUser(token);
  if (authError || !userResult.user) return respond({ error: 'Invalid session' }, 401);

  const actor = userResult.user;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return respond({ error: 'Invalid JSON body' }, 400);
  }
  const action = body.action;

  if (action === 'status') {
    const ownerEmail = Deno.env.get('PROFILI_A4_OWNER_EMAIL')?.trim().toLowerCase();
    if (ownerEmail && actor.email?.toLowerCase() === ownerEmail && actor.email_confirmed_at) {
      const { error: bootstrapError } = await adminClient.rpc('profili_a4_bootstrap_owner', {
        p_actor: actor.id,
      });
      if (bootstrapError) return respond({ error: 'Could not initialize owner access' }, 500);
    }

    const [{ data: terms, error: termsError }, { data: acceptance, error: acceptanceError },
      { data: moderation, error: moderationError }, { data: adminRole, error: roleError },
      { data: notices, error: noticesError }] =
      await Promise.all([
        adminClient.from('account_terms_versions').select('version,content,translations').eq('is_current', true).maybeSingle(),
        adminClient.from('account_terms_acceptances').select('terms_version,accepted_at')
          .eq('user_id', actor.id),
        adminClient.from('account_moderation_status').select('status,reason,updated_at')
          .eq('user_id', actor.id).maybeSingle(),
        adminClient.from('account_admins').select('role').eq('user_id', actor.id).maybeSingle(),
        adminClient.rpc('profili_a4_account_notices', { p_actor: actor.id }),
      ]);
    if (termsError || acceptanceError || moderationError || roleError || noticesError || !terms) {
      return respond({ error: 'Could not load account access status' }, 500);
    }
    const supportedLanguages = ['fr', 'en', 'ru'];
    const translations = terms.translations;
    if (!translations || !supportedLanguages.every(language =>
      typeof translations[language] === 'string' && translations[language].trim()
    )) {
      return respond({ error: 'Current terms translations are incomplete' }, 503);
    }

    const accepted = acceptance?.some(row => row.terms_version === terms.version) ?? false;
    return respond({
      terms: { version: terms.version, content: terms.content, translations },
      termsAccepted: accepted,
      status: moderation?.status ?? 'active',
      suspensionReason: moderation?.status === 'suspended' ? moderation.reason : null,
      statusUpdatedAt: moderation?.updated_at ?? null,
      role: adminRole?.role ?? null,
      notices: notices ?? [],
    });
  }

  if (action === 'accept_terms') {
    if (body.accepted !== true) return respond({ error: 'Explicit acceptance is required' }, 400);
    const language = body.language;
    if (typeof language !== 'string' || !['fr', 'en', 'ru'].includes(language)) {
      return respond({ error: 'A supported terms language is required' }, 400);
    }
    const { data: terms, error: termsError } = await adminClient.from('account_terms_versions')
      .select('version').eq('is_current', true).maybeSingle();
    if (termsError || !terms) return respond({ error: 'Current terms are unavailable' }, 503);
    const { error } = await adminClient.rpc('profili_a4_accept_terms', {
      p_actor: actor.id,
      p_version: terms.version,
      p_language: language,
    });
    if (error) return respond({ error: 'Could not record terms acceptance' }, 500);
    return respond({ accepted: true, version: terms.version });
  }

  const { data: role, error: roleError } = await adminClient.from('account_admins')
    .select('role').eq('user_id', actor.id).maybeSingle();
  if (roleError) return respond({ error: 'Could not verify administrator access' }, 500);
  if (!role || !['owner', 'moderator'].includes(role.role)) {
    return respond({ error: 'Administrator access required' }, 403);
  }

  if (action === 'search_accounts') {
    if (typeof body.query !== 'string' || body.query.trim().length < 3) {
      return respond({ error: 'Enter at least 3 characters to search' }, 400);
    }
    const { data, error } = await adminClient.rpc('profili_a4_admin_search_accounts', {
      p_actor: actor.id,
      p_query: body.query.trim().slice(0, 200),
    });
    if (error) return respond({ error: error.message }, 400);
    return respond({ accounts: data ?? [] });
  }

  if (action === 'moderate_account' || action === 'manage_moderator') {
    if (typeof body.targetId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.targetId)) {
      return respond({ error: 'Invalid target account' }, 400);
    }
    if (typeof body.reason !== 'string' || !body.reason.trim() || body.reason.length > 2000) {
      return respond({ error: 'A reason of up to 2000 characters is required' }, 400);
    }
    const allowedOperations = action === 'moderate_account'
      ? ['suspend', 'reactivate']
      : ['grant', 'revoke'];
    if (typeof body.operation !== 'string' || !allowedOperations.includes(body.operation)) {
      return respond({ error: 'Invalid account operation' }, 400);
    }
    if (action === 'manage_moderator' && role.role !== 'owner') {
      return respond({ error: 'Only the owner can manage delegates' }, 403);
    }
    const procedure = action === 'moderate_account'
      ? 'profili_a4_moderate_account'
      : 'profili_a4_manage_moderator';
    const { data, error } = await adminClient.rpc(procedure, {
      p_actor: actor.id,
      p_target: body.targetId,
      p_action: body.operation,
      p_reason: body.reason.trim(),
    });
    if (error) return respond({ error: error.message }, 400);
    return respond({ result: data });
  }

  if (action === 'audit') {
    const { data, error } = await adminClient.rpc('profili_a4_admin_audit', { p_actor: actor.id });
    if (error) return respond({ error: 'Could not load the moderation audit' }, 500);
    return respond({ entries: data ?? [] });
  }

  return respond({ error: 'Unknown action' }, 400);
});
