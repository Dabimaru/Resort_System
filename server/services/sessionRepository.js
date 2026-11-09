import crypto from 'crypto';
import { supabaseAdmin, supabaseStatus } from '../config/supabase.js';

const SESSION_LIFETIME_DAYS = 7;

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const requireServiceRoleKey = () => {
  if (!supabaseStatus.hasServiceRoleKey) {
    const error = new Error('SUPABASE_SERVICE_ROLE_KEY is required for persistent authentication sessions.');
    error.status = 503;
    throw error;
  }
};

const throwDatabaseError = (action, error) => {
  const wrapped = new Error(`Unable to ${action}${error?.message ? `: ${error.message}` : ''}`);
  wrapped.status = 503;
  throw wrapped;
};

export const createPersistentSession = async ({ token, accountId, accountType }) => {
  requireServiceRoleKey();

  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabaseAdmin.from('auth_sessions').insert({
    token_hash: hashToken(token),
    account_id: String(accountId),
    account_type: accountType,
    expires_at: expiresAt,
  });

  if (error) throwDatabaseError('create the authentication session', error);
  return expiresAt;
};

export const findPersistentSession = async (token) => {
  requireServiceRoleKey();

  const { data, error } = await supabaseAdmin
    .from('auth_sessions')
    .select('account_id, account_type, expires_at')
    .eq('token_hash', hashToken(token))
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error) throwDatabaseError('validate the authentication session', error);
  return data || null;
};

export const revokePersistentSession = async (token) => {
  requireServiceRoleKey();

  const { error } = await supabaseAdmin
    .from('auth_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('token_hash', hashToken(token))
    .is('revoked_at', null);

  if (error) throwDatabaseError('revoke the authentication session', error);
};
