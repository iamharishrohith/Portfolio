import { createClient } from '@supabase/supabase-js'
import { safeStorage } from './safe-storage'

// These will be populated by environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        storage: safeStorage,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
})
