import { create } from 'zustand';

import { api } from '@/lib/api';

type AuthState = {
  token: string | null;
  userId: string | null;
  name: string | null;
  isAuthenticated: boolean;
  authError: string;
  submitting: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  completeSocialAuth: () => void;
  logout: () => void;
  clearError: () => void;
};

export const useMobileAuthStore = create<AuthState>((set) => ({
  token: api.getToken(),
  userId: null,
  name: null,
  isAuthenticated: Boolean(api.getToken()),
  authError: '',
  submitting: false,
  signIn: async (email, password) => {
    try {
      set({ authError: '', submitting: true });
      const payload = await api.login(email, password);
      api.setToken(payload.token);
      set({
        token: payload.token,
        userId: payload.userId,
        name: payload.name,
        isAuthenticated: true,
        authError: '',
        submitting: false,
      });
    } catch (error: any) {
      set({
        authError: error?.message || 'Authentication failed',
        submitting: false,
        isAuthenticated: false,
      });
    }
  },
  signUp: async (name, email, password) => {
    try {
      set({ authError: '', submitting: true });
      const payload = await api.register(name, email, password);
      api.setToken(payload.token);
      set({
        token: payload.token,
        userId: payload.userId,
        name: payload.name,
        isAuthenticated: true,
        authError: '',
        submitting: false,
      });
    } catch (error: any) {
      set({
        authError: error?.message || 'Authentication failed',
        submitting: false,
        isAuthenticated: false,
      });
    }
  },
  completeSocialAuth: () => {
    set({ authError: '' });
  },
  logout: () => {
    api.setToken(null);
    set({
      token: null,
      userId: null,
      name: null,
      isAuthenticated: false,
      authError: '',
      submitting: false,
    });
  },
  clearError: () => {
    set({ authError: '' });
  },
}));
