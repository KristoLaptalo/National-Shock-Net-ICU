/**
 * Supabase client singleton
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig, validateSupabaseConfig } from '../../config/supabase';

// Validate config on module load
validateSupabaseConfig();

// Create Supabase client singleton
export const supabase: SupabaseClient = createClient(
  supabaseConfig.url || 'http://localhost:54321', // Fallback for development
  supabaseConfig.anonKey || 'development-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
);

// Export for use in hooks and services
export default supabase;
