import { supabaseAdmin, supabaseStatus } from '../config/supabase.js';
import { mockUsers } from '../data/mockStore.js';

const isLive = () => Boolean(supabaseStatus.liveMode);

const mapStaffAccount = (row) => ({
  id: row.id,
  name: row.full_name,
  fullName: row.full_name,
  username: row.username,
  email: row.email,
  contactNumber: row.contact_number || '',
  passwordHash: row.password_hash,
  role: row.role_key,
  roles: row.roles || [row.role_key],
  permissions: row.permissions || [],
  isStaff: true,
  isActive: row.is_active !== false,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  lastLoginAt: row.last_login_at || null,
});

const requireServiceRoleKey = () => {
  if (isLive() && !supabaseStatus.hasServiceRoleKey) {
    const error = new Error('SUPABASE_SERVICE_ROLE_KEY is required to manage staff accounts securely.');
    error.status = 503;
    throw error;
  }
};

const throwDatabaseError = (action, error) => {
  const wrapped = new Error(`Unable to ${action}${error?.message ? `: ${error.message}` : ''}`);
  wrapped.status = error?.code === '23505' ? 409 : 500;
  if (error?.code === '23505') {
    wrapped.message = 'An account with this email or username already exists.';
  }
  throw wrapped;
};

export const isLiveStaffStorage = isLive;

export const listStoredStaffAccounts = async () => {
  if (!isLive()) return [];
  requireServiceRoleKey();

  const { data, error } = await supabaseAdmin
    .from('staff_accounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throwDatabaseError('load staff accounts', error);
  return (data || []).map(mapStaffAccount);
};

export const findStoredStaffAccount = async (id) => {
  if (!isLive()) return null;
  requireServiceRoleKey();

  const { data, error } = await supabaseAdmin
    .from('staff_accounts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throwDatabaseError('load the staff account', error);
  return data ? mapStaffAccount(data) : null;
};

export const findStoredStaffAccountByIdentifier = async (identifier) => {
  if (!isLive()) return null;
  requireServiceRoleKey();

  const normalized = String(identifier || '').trim().toLowerCase();
  const { data: emailMatch, error: emailError } = await supabaseAdmin
    .from('staff_accounts')
    .select('*')
    .eq('email', normalized)
    .limit(1);
  if (emailError) throwDatabaseError('find the staff account', emailError);
  if (emailMatch?.[0]) return mapStaffAccount(emailMatch[0]);

  const { data: usernameMatch, error: usernameError } = await supabaseAdmin
    .from('staff_accounts')
    .select('*')
    .eq('username', normalized)
    .limit(1);
  if (usernameError) throwDatabaseError('find the staff account', usernameError);
  return usernameMatch?.[0] ? mapStaffAccount(usernameMatch[0]) : null;
};

export const createStoredStaffAccount = async (account) => {
  if (!isLive()) {
    mockUsers.push(account);
    return account;
  }
  requireServiceRoleKey();

  const { data: duplicateEmail, error: emailLookupError } = await supabaseAdmin
    .from('staff_accounts')
    .select('id')
    .eq('email', account.email)
    .limit(1);
  if (emailLookupError) throwDatabaseError('check for duplicate staff accounts', emailLookupError);
  const { data: duplicateUsername, error: usernameLookupError } = await supabaseAdmin
    .from('staff_accounts')
    .select('id')
    .eq('username', account.username)
    .limit(1);
  if (usernameLookupError) throwDatabaseError('check for duplicate staff accounts', usernameLookupError);
  if (duplicateEmail?.length || duplicateUsername?.length) {
    const error = new Error('An account with this email or username already exists.');
    error.status = 409;
    throw error;
  }

  const { data: duplicateCustomer, error: customerLookupError } = await supabaseAdmin
    .from('customer_accounts')
    .select('id')
    .eq('email', account.email)
    .limit(1);
  if (customerLookupError) throwDatabaseError('check for duplicate email addresses', customerLookupError);
  if (duplicateCustomer?.length) {
    const error = new Error('An account with this email or username already exists.');
    error.status = 409;
    throw error;
  }

  const { data, error } = await supabaseAdmin
    .from('staff_accounts')
    .insert({
      id: account.id,
      full_name: account.name,
      username: account.username,
      email: account.email,
      contact_number: account.contactNumber,
      password_hash: account.passwordHash,
      role_key: account.role,
      roles: account.roles,
      permissions: account.permissions,
      is_active: account.isActive,
      created_at: account.createdAt,
      updated_at: account.createdAt,
    })
    .select('*')
    .single();

  if (error) throwDatabaseError('create the staff account', error);
  return mapStaffAccount(data);
};

export const updateStoredStaffAccount = async (id, patch) => {
  if (!isLive()) {
    const account = mockUsers.find((entry) => entry.id === id && entry.isStaff);
    if (!account) return null;
    Object.assign(account, patch, { updatedAt: new Date().toISOString() });
    return account;
  }
  requireServiceRoleKey();

  const row = {};
  if (patch.name !== undefined) row.full_name = patch.name;
  if (patch.username !== undefined) row.username = patch.username;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.contactNumber !== undefined) row.contact_number = patch.contactNumber;
  if (patch.role !== undefined) row.role_key = patch.role;
  if (patch.roles !== undefined) row.roles = patch.roles;
  if (patch.permissions !== undefined) row.permissions = patch.permissions;
  if (patch.isActive !== undefined) row.is_active = patch.isActive;
  row.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('staff_accounts')
    .update(row)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) throwDatabaseError('update the staff account', error);
  return data ? mapStaffAccount(data) : null;
};
