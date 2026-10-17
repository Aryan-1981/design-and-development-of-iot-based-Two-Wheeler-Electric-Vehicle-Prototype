import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getInitialUrl = (): string => {
  return (
    import.meta.env.VITE_SUPABASE_URL ||
    (typeof window !== 'undefined' ? localStorage.getItem('ev_supabase_url') || '' : '')
  );
};

const getInitialAnonKey = (): string => {
  return (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    (typeof window !== 'undefined' ? localStorage.getItem('ev_supabase_key') || '' : '')
  );
};

export const defaultSupabaseUrl = getInitialUrl();
export const defaultSupabaseAnonKey = getInitialAnonKey();

export let supabase: SupabaseClient | null = null;

if (defaultSupabaseUrl && defaultSupabaseAnonKey) {
  try {
    supabase = createClient(defaultSupabaseUrl, defaultSupabaseAnonKey);
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
  }
}

export function initSupabase(url: string, anonKey: string): SupabaseClient {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ev_supabase_url', url);
    localStorage.setItem('ev_supabase_key', anonKey);
  }
  supabase = createClient(url, anonKey);
  return supabase;
}

