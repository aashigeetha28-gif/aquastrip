import { createClient } from '@supabase/supabase-js';

// Load Supabase credentials from Expo public environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mock-jjm-supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'mock-jjm-anon-key-phase1';

export const isSupabaseConfigured = Boolean(
  process.env.EXPO_PUBLIC_SUPABASE_URL &&
    !process.env.EXPO_PUBLIC_SUPABASE_URL.includes('your-project') &&
    !process.env.EXPO_PUBLIC_SUPABASE_URL.includes('mock-')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
