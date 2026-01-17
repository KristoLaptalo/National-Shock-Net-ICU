/**
 * Authentication types matching Supabase schema roles
 */

import type { Session, AuthError } from '@supabase/supabase-js';

// App roles from Supabase RLS policies
export type AppRole = 'hospital_admin' | 'clinician' | 'researcher';

// Portal type for routing
export type PortalType = 'hospital' | 'admin';

// Authenticated user info
export interface AuthUser {
  id: string;
  email: string;
  role: AppRole;
  hospitalId?: string;
  hospitalName?: string;
  name?: string;
}

// Session with user and role
export interface AuthSession {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
  portalType?: PortalType;
}

// Auth context type
export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
  hasRole: (requiredRole: AppRole) => boolean;
}
