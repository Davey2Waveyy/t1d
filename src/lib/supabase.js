import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your_supabase_url') &&
  !supabaseAnonKey.includes('your_supabase_anon_key')
)

export const accountSyncUnavailable = {
  message: 'Account sync is not available in this preview. Continue as Guest to use local demo logging.',
}

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null
