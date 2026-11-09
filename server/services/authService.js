import crypto from 'crypto';
import { supabaseAdmin, supabaseStatus } from '../config/supabase.js';
import {
  authTokens,
  createToken,
  ensureDefaultAdmin,
  getUserPermissions,
  hashPassword,
  mockUsers,
} from '../data/mockStore.js';
import {
  findStoredStaffAccount,
  findStoredStaffAccountByIdentifier,
  isLiveStaffStorage,
} from './staffRepository.js';
import {
  createPersistentSession,
  findPersistentSession,
  revokePersistentSession,
} from './sessionRepository.js';

const issueSession = async (user, accountType) => {
  const token = createToken();
  if (supabaseStatus.liveMode) {
    await createPersistentSession({ token, accountId: user.id, accountType });
  } else {
    authTokens.set(token, user.id);
  }
  return token;
};

const getPasswordAliases = (user) => {
  const aliases = new Set();
  const identifier = (user?.email || user?.username || '').toLowerCase();

  if (identifier === 'admin@azurecove.com' || identifier === 'admin') {
    aliases.add('admin');
    aliases.add('AdminPass123!');
  }

  if (identifier === 'frontdesk@azurecove.com' || identifier === 'frontdesk') {
    aliases.add('frontdesk');
    aliases.add('FrontDesk123!');
  }

  if (identifier === 'guest@example.com' || identifier === 'guest') {
    aliases.add('guest');
    aliases.add('guest123');
    aliases.add('GuestPass123!');
  }

  return [...aliases];
};

const passwordMatches = (user, plainPassword) => {
  const providedHash = hashPassword(plainPassword);
  if (user.passwordHash === providedHash) {
    return true;
  }

  const aliases = getPasswordAliases(user);
  return aliases.some((alias) => user.passwordHash === hashPassword(alias));
};

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  username: user.username || null,
  email: user.email,
  role: user.role,
  roles: user.roles || [user.role],
  permissions: user.permissions || getUserPermissions(user),
  isStaff: Boolean(user.isStaff),
  isActive: user.isActive !== false,
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt || null,
});

const readCustomerByEmail = async (email) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  if (supabaseStatus.liveMode) {
    const { data, error } = await supabaseAdmin
      .from('customer_accounts')
      .select('*')
      .eq('email', normalizedEmail)
      .limit(1);

    if (!error && data && data.length > 0) {
      const row = data[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        passwordHash: row.password_hash,
        role: 'customer',
        roles: ['customer'],
        permissions: ['customer.read'],
        isStaff: false,
        isActive: row.is_active !== false,
        createdAt: row.created_at,
        lastLoginAt: row.last_login_at || null,
      };
    }
  }

  return mockUsers.find((user) => user.email === normalizedEmail && !user.isStaff) || null;
};

export const registerUser = async ({ name, email, password, role = 'customer' }) => {
  if (!name || !email || !password) {
    const error = new Error('Name, email, and password are required.');
    error.status = 400;
    throw error;
  }

  const selectedRole = ['customer', 'admin', 'frontdesk'].includes(role) ? role : 'customer';
  const normalizedEmail = String(email).trim().toLowerCase();

  if (supabaseStatus.liveMode) {
    const { data: existingRows, error: existingError } = await supabaseAdmin
      .from('customer_accounts')
      .select('id')
      .eq('email', normalizedEmail)
      .limit(1);

    if (!existingError && existingRows && existingRows.length > 0) {
      const error = new Error('A user with this email already exists.');
      error.status = 409;
      throw error;
    }

    const { data, error } = await supabaseAdmin
      .from('customer_accounts')
      .insert({
        name: String(name).trim(),
        email: normalizedEmail,
        password_hash: hashPassword(password),
        role: selectedRole,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      user: sanitizeUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: selectedRole,
        roles: ['customer'],
        permissions: ['customer.read'],
        isStaff: false,
        isActive: data.is_active !== false,
        createdAt: data.created_at,
        lastLoginAt: null,
      }),
    };
  }

  const existingUser = mockUsers.find((user) => user.email === normalizedEmail && !user.isStaff);

  if (existingUser) {
    const error = new Error('A user with this email already exists.');
    error.status = 409;
    throw error;
  }

  const user = {
    id: crypto.randomUUID(),
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    role: selectedRole,
    roles: [selectedRole === 'admin' ? 'super-admin' : selectedRole === 'frontdesk' ? 'receptionist' : 'customer'],
    permissions: getUserPermissions({ role: selectedRole, roles: [selectedRole === 'admin' ? 'super-admin' : selectedRole === 'frontdesk' ? 'receptionist' : 'customer'] }),
    isStaff: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };

  mockUsers.push(user);
  return { user: sanitizeUser(user) };
};

export const loginUser = async ({ email, username, password }) => {
  if ((!email && !username) || !password) {
    const error = new Error('Email or username and password are required.');
    error.status = 400;
    throw error;
  }

  const identifier = String(email || username || '').trim().toLowerCase();

  if (supabaseStatus.liveMode) {
    const { data, error } = await supabaseAdmin
      .from('customer_accounts')
      .select('*')
      .eq('email', identifier)
      .limit(1);

    const row = data && data.length > 0 ? data[0] : null;
    if (row && row.password_hash === hashPassword(password)) {
      if (row.is_active === false) {
        const error = new Error('This account is inactive. Please contact the administrator.');
        error.status = 403;
        throw error;
      }

      const token = await issueSession({ id: row.id }, 'customer');

      return {
        token,
        user: sanitizeUser({
          id: row.id,
          name: row.name,
          email: row.email,
          role: 'customer',
          roles: ['customer'],
          permissions: ['customer.read'],
          isStaff: false,
          isActive: row.is_active !== false,
          createdAt: row.created_at,
          lastLoginAt: row.last_login_at || null,
        }),
      };
    }
  }

  const matches = mockUsers.filter((entry) => {
    const matchesEmail = entry.email && entry.email.toLowerCase() === identifier;
    const matchesUsername = entry.username && entry.username.toLowerCase() === identifier;
    return matchesEmail || matchesUsername;
  });

  const user = matches.find((entry) => passwordMatches(entry, password)) || null;

  if (!user) {
    const error = new Error('Invalid credentials.');
    error.status = 401;
    throw error;
  }

  if (user.isActive === false) {
    const error = new Error('This account is inactive. Please contact the administrator.');
    error.status = 403;
    throw error;
  }

  const token = await issueSession(user, 'mock');
  user.lastLoginAt = new Date().toISOString();

  return {
    token,
    user: sanitizeUser(user),
  };
};

export const loginAdminUser = async ({ username, email, password }) => {
  ensureDefaultAdmin();

  if ((!username && !email) || !password) {
    const error = new Error('Username or email and password are required.');
    error.status = 400;
    throw error;
  }

  const identifier = String(username || email || '').trim().toLowerCase();
  if (isLiveStaffStorage()) {
    const storedUser = await findStoredStaffAccountByIdentifier(identifier);
    if (storedUser && passwordMatches(storedUser, password)) {
      if (!storedUser.isActive) {
        const error = new Error('This administrator account is inactive.');
        error.status = 403;
        throw error;
      }

      const token = await issueSession(storedUser, 'staff');
      return {
        token,
        user: sanitizeUser(storedUser),
      };
    }
  }

  const matches = mockUsers.filter((entry) => {
    const matchesUsername = entry.username && entry.username.toLowerCase() === identifier;
    const matchesEmail = entry.email && entry.email.toLowerCase() === identifier;
    return (matchesUsername || matchesEmail) && entry.isStaff;
  });

  const user = matches.find((entry) => passwordMatches(entry, password)) || null;

  if (!user) {
    const error = new Error('Invalid administrator credentials.');
    error.status = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('This administrator account is inactive.');
    error.status = 403;
    throw error;
  }

  const token = await issueSession(user, 'mock');
  user.lastLoginAt = new Date().toISOString();

  return {
    token,
    user: sanitizeUser(user),
  };
};

export const getUserByToken = async (token) => {
  if (!token) {
    return null;
  }

  if (supabaseStatus.liveMode) {
    const session = await findPersistentSession(token);
    if (!session) return null;

    if (session.account_type === 'mock') {
      const mockUser = mockUsers.find((entry) => entry.id === session.account_id);
      if (!mockUser || mockUser.isActive === false) return null;
      return sanitizeUser(mockUser);
    }

    if (session.account_type === 'staff') {
      const staffUser = await findStoredStaffAccount(session.account_id);
      if (!staffUser || !staffUser.isActive) return null;
      return sanitizeUser(staffUser);
    }

    if (session.account_type === 'customer') {
      const { data, error } = await supabaseAdmin
        .from('customer_accounts')
        .select('*')
        .eq('id', session.account_id)
        .maybeSingle();
      if (error) {
        const wrapped = new Error(`Unable to validate the customer account: ${error.message}`);
        wrapped.status = 503;
        throw wrapped;
      }
      if (!data || data.is_active === false) return null;
      return sanitizeUser({
        id: data.id,
        name: data.name,
        username: data.username || null,
        email: data.email,
        role: data.role || 'customer',
        roles: data.roles || [data.role || 'customer'],
        permissions: data.permissions || ['customer.read'],
        isStaff: Boolean(data.is_staff || data.isStaff || false),
        isActive: data.is_active !== false,
        createdAt: data.created_at,
        lastLoginAt: data.last_login_at || null,
      });
    }

    return null;
  }

  const userId = authTokens.get(token);
  if (!userId) {
    return null;
  }

  const localUser = mockUsers.find((entry) => entry.id === userId);
  if (localUser) {
    return sanitizeUser(localUser);
  }

  if (isLiveStaffStorage()) {
    const storedStaff = await findStoredStaffAccount(userId);
    if (storedStaff?.isActive) return sanitizeUser(storedStaff);
  }

  return null;
};

export const logoutUser = async (token) => {
  if (!token) return;
  if (supabaseStatus.liveMode) {
    await revokePersistentSession(token);
  }
  authTokens.delete(token);
};
