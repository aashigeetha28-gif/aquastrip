import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-jjm-supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-jjm-anon-key-phase1';

export const isSupabaseLive = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
    !import.meta.env.VITE_SUPABASE_URL.includes('your-project') &&
    !import.meta.env.VITE_SUPABASE_URL.includes('mock-')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
