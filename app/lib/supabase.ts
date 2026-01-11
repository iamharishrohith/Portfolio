import { createClient } from '@supabase/supabase-js';

// Use Anon Key for App Access (Enforces RLS)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase] Missing environment variables! Check .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
