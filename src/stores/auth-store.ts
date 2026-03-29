'use client';

import { create } from 'zustand';
import { DEMO_MODE } from '@/lib/demo/config';
import { DEMO_USER } from '@/lib/demo/mock-data';

export interface AuthUser {
  id: string;
  fullName: string;
  companyId: string;
  role: 'technician' | 'manager';
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    // Demo mode: accept any credentials, return mock user
    if (DEMO_MODE) {
      // Small delay to simulate network
      await new Promise((r) => setTimeout(r, 400));
      set({ user: DEMO_USER, isLoading: false, error: null });
      return;
    }

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(
          error.message === 'Invalid login credentials'
            ? 'Email ou senha incorretos'
            : error.message
        );
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, company_id, role')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Perfil não encontrado');
      }

      set({
        user: {
          id: profile.id,
          fullName: profile.full_name,
          companyId: profile.company_id,
          role: profile.role,
        },
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({
        user: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Erro ao fazer login',
      });
      throw err;
    }
  },

  logout: async () => {
    if (!DEMO_MODE) {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    set({ user: null, error: null });
  },

  loadSession: async () => {
    set({ isLoading: true });

    // Demo mode: check if user was previously "logged in" via session flag
    if (DEMO_MODE) {
      const wasLoggedIn =
        typeof window !== 'undefined' &&
        sessionStorage.getItem('vobi-demo-session') === 'true';
      set({
        user: wasLoggedIn ? DEMO_USER : null,
        isLoading: false,
      });
      return;
    }

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        set({ user: null, isLoading: false });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, company_id, role')
        .eq('id', user.id)
        .single();

      if (!profile) {
        set({ user: null, isLoading: false });
        return;
      }

      set({
        user: {
          id: profile.id,
          fullName: profile.full_name,
          companyId: profile.company_id,
          role: profile.role,
        },
        isLoading: false,
        error: null,
      });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
