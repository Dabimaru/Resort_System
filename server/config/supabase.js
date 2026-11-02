import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://placeholder.supabase.co';

const anonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'placeholder-key';

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const isConfigured = Boolean(supabaseUrl && anonKey && !supabaseUrl.includes('placeholder'));
const isTestEnvironment = process.env.NODE_ENV === 'test';
const liveModeEnabled = isConfigured && !isTestEnvironment;

export const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : supabase;

if (!isConfigured) {
  console.warn('Supabase environment variables are not configured. Falling back to local mock data.');
}

export const supabase = createClient(supabaseUrl, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const supabaseStatus = {
  configured: isConfigured,
  liveMode: liveModeEnabled,
  url: supabaseUrl,
  hasAnonKey: Boolean(anonKey && anonKey !== 'placeholder-key'),
  hasServiceRoleKey: Boolean(serviceRoleKey),
};

export const getSupabaseHealth = async () => {
  if (!supabaseStatus.configured) {
    return {
      configured: false,
      schemaReady: false,
      url: supabaseUrl,
      hasAnonKey: false,
      hasServiceRoleKey: false,
      mode: 'local-fallback',
      reason: 'Supabase variables are not configured.',
    };
  }

  try {
    const { error } = await supabase.from('properties').select('id').limit(1);
    if (error) {
      throw error;
    }

    return {
      configured: true,
      schemaReady: true,
      url: supabaseUrl,
      hasAnonKey: supabaseStatus.hasAnonKey,
      hasServiceRoleKey: supabaseStatus.hasServiceRoleKey,
      mode: 'live-supabase',
      reason: 'Supabase project is reachable and schema is available.',
    };
  } catch (error) {
    return {
      configured: true,
      schemaReady: false,
      url: supabaseUrl,
      hasAnonKey: supabaseStatus.hasAnonKey,
      hasServiceRoleKey: supabaseStatus.hasServiceRoleKey,
      mode: 'schema-missing',
      reason: 'Supabase project is reachable but the database schema has not been created yet. Add SUPABASE_SERVICE_ROLE_KEY and run the schema bootstrap to enable live database-backed data.',
    };
  }
};

export const getSupabaseServiceRoleKey = () => serviceRoleKey;
