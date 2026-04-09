import { create } from 'zustand';

import { adminApi, setAdminToken } from '../lib/api';

type AuthState = {
  isAuthenticated: boolean;
  authError: string;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: Boolean(adminApi.getStoredToken()),
  authError: '',
  login: async (email, pass) => {
    try {
      set({ authError: '' });
      const response = await adminApi.login(email, pass);
      setAdminToken(response.token);
      set({ isAuthenticated: true, authError: '' });
    } catch (error: unknown) {
      set({
        authError: getErrorMessage(error, 'Login failed'),
        isAuthenticated: false,
      });
    }
  },
  logout: () => {
    setAdminToken(null);
    set({ isAuthenticated: false, authError: '' });
  },
}));
