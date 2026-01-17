/**
 * Supabase configuration
 * Environment variables are loaded from .env.local
 */
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL as string,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
} as const;

// Validate configuration at runtime
export function validateSupabaseConfig(): void {
  if (!supabaseConfig.url) {
    console.warn('VITE_SUPABASE_URL is not set. Supabase features will not work.');
  }
  if (!supabaseConfig.anonKey) {
    console.warn('VITE_SUPABASE_ANON_KEY is not set. Supabase features will not work.');
  }
}
