import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'MEMBER' | 'MODERATOR' | 'ADMIN' | null;

interface UserInfo {
  userId: number;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: UserInfo) => void;
  clearTokens: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setTokens: (access, refresh) => {
        set({ accessToken: access, refreshToken: refresh });
      },

      setUser: (user) => {
        set({ user });
        // Sync role to cookie for Next.js Middleware
        if (typeof document !== 'undefined') {
          document.cookie = `ecc_role=${user.role}; path=/; max-age=86400; SameSite=Lax`;
        }
      },

      clearTokens: () => {
        set({ accessToken: null, refreshToken: null, user: null });
        if (typeof document !== 'undefined') {
          document.cookie = "ecc_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
      },

      isAuthenticated: () => {
        return !!get().accessToken;
      },

      hasRole: (role) => {
        return get().user?.role === role;
      },
    }),
    {
      name: 'ecc-auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);