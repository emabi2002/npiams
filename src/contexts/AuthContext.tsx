"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, User } from '@/lib/supabase';
import type { AuthSession } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile(userId: string) {
      try {
        // Fetch user profile from database
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          // If no profile exists, create a default one for demo
          const defaultProfile: User = {
            id: userId,
            email: session?.user?.email || 'admin@npi.edu.pg',
            role: 'admin',
            full_name: 'System Administrator',
            created_at: new Date().toISOString()
          };
          setUser(defaultProfile);
        } else {
          setUser(profile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to default admin user for demo
        const defaultProfile: User = {
          id: userId,
          email: session?.user?.email || 'admin@npi.edu.pg',
          role: 'admin',
          full_name: 'System Administrator',
          created_at: new Date().toISOString()
        };
        setUser(defaultProfile);
      } finally {
        setLoading(false);
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [session?.user?.email]);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function signUp(email: string, password: string, fullName: string, role: string) {
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (authError) throw authError;

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          full_name: fullName,
          role: role as 'admin' | 'staff' | 'instructor' | 'student',
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't throw error here as the auth user was created successfully
      }
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
