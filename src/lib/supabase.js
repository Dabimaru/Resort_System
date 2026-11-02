import { createClient } from '@supabase/supabase-js';

const url =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  'https://placeholder.supabase.co';

const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  'placeholder-key';

const isConfigured = Boolean(url && key && !url.includes('placeholder'));

export const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const supabaseReady = isConfigured;

export const getSupabaseStatus = () => ({
  configured: isConfigured,
  url,
  keyPresent: Boolean(key && key !== 'placeholder-key'),
});
