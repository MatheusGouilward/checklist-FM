import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from './auth-store';

const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      getUser: mockGetUser,
    },
    from: () => ({
      select: (...args: unknown[]) => {
        mockSelect(...args);
        return {
          eq: (...eqArgs: unknown[]) => {
            mockEq(...eqArgs);
            return { single: mockSingle };
          },
        };
      },
    }),
  }),
}));

const mockProfile = {
  id: 'user-1',
  full_name: 'Carlos Silva',
  company_id: 'comp-1',
  role: 'technician' as const,
};

describe('auth-store', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isLoading: false, error: null });
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('sets user on successful login', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });
      mockSingle.mockResolvedValue({ data: mockProfile, error: null });

      await useAuthStore.getState().login('carlos@test.com', 'pass123');

      const state = useAuthStore.getState();
      expect(state.user).toEqual({
        id: 'user-1',
        fullName: 'Carlos Silva',
        companyId: 'comp-1',
        role: 'technician',
      });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('sets error on invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(
        useAuthStore.getState().login('wrong@test.com', 'wrong')
      ).rejects.toThrow('Email ou senha incorretos');

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Email ou senha incorretos');
    });

    it('sets error when profile not found', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(
        useAuthStore.getState().login('carlos@test.com', 'pass123')
      ).rejects.toThrow('Perfil não encontrado');

      expect(useAuthStore.getState().user).toBeNull();
    });

    it('sets isLoading during login', async () => {
      let resolveLogin: (value: unknown) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      mockSignInWithPassword.mockReturnValue(loginPromise);

      const promise = useAuthStore.getState().login('a@b.com', 'pass');
      expect(useAuthStore.getState().isLoading).toBe(true);

      resolveLogin!({
        data: { user: { id: 'user-1' } },
        error: null,
      });
      mockSingle.mockResolvedValue({ data: mockProfile, error: null });

      await promise;
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears user and calls signOut', async () => {
      useAuthStore.setState({
        user: {
          id: 'user-1',
          fullName: 'Carlos',
          companyId: 'comp-1',
          role: 'technician',
        },
      });
      mockSignOut.mockResolvedValue({ error: null });

      await useAuthStore.getState().logout();

      expect(mockSignOut).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('loadSession', () => {
    it('loads user from existing session', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });
      mockSingle.mockResolvedValue({ data: mockProfile, error: null });

      await useAuthStore.getState().loadSession();

      expect(useAuthStore.getState().user).toEqual({
        id: 'user-1',
        fullName: 'Carlos Silva',
        companyId: 'comp-1',
        role: 'technician',
      });
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('sets user to null when no session', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
      });

      await useAuthStore.getState().loadSession();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('sets user to null on error', async () => {
      mockGetUser.mockRejectedValue(new Error('Network error'));

      await useAuthStore.getState().loadSession();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
