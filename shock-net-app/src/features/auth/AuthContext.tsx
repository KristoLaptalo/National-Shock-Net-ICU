/**
 * Authentication Context
 * Manages user session state with Supabase
 */

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase/client';
import type { AppRole, AuthContextType, AuthUser, LoginCredentials } from '../../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials for testing without Supabase
const DEMO_USERS: Record<string, { password: string; user: AuthUser }> = {
  'demo@hospital.com': {
    password: 'demo123',
    user: {
      id: 'demo-hospital-user',
      email: 'demo@hospital.com',
      role: 'clinician',
      hospitalId: 'demo-hospital-001',
      hospitalName: 'Demo General Hospital',
      name: 'Dr. Demo User',
    },
  },
  'admin@shocknet.com': {
    password: 'admin123',
    user: {
      id: 'demo-admin-user',
      email: 'admin@shocknet.com',
      role: 'hospital_admin',
      name: 'Admin User',
    },
  },
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const mapSupabaseUser = (supabaseUser: User): AuthUser => {
    const metadata = supabaseUser.user_metadata || {};
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      role: (metadata.role as AppRole) || 'clinician',
      hospitalId: metadata.hospital_id,
      name: metadata.name || supabaseUser.email?.split('@')[0] || 'User',
    };
  };

  const login = async (credentials: LoginCredentials): Promise<{ error: AuthError | null }> => {
    setIsLoading(true);

    // Check for demo credentials first
    const demoUser = DEMO_USERS[credentials.email.toLowerCase()];
    if (demoUser && demoUser.password === credentials.password) {
      // Demo login - bypass Supabase
      setUser(demoUser.user);
      setSession({ user: { id: demoUser.user.id, email: demoUser.user.email } } as Session);
      setIsLoading(false);
      return { error: null };
    }

    // Try Supabase auth for non-demo credentials
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    setIsLoading(false);
    return { error };
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const hasRole = (requiredRole: AppRole): boolean => {
    if (!user) return false;

    // Role hierarchy: hospital_admin > clinician > researcher
    const roleHierarchy: Record<AppRole, number> = {
      hospital_admin: 3,
      clinician: 2,
      researcher: 1,
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    login,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
