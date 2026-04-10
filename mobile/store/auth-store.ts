import { create } from 'zustand';
import { Buffer } from 'buffer';
import { Platform } from 'react-native';

import { api } from '@/lib/api';

const AUTH_STORAGE_KEY = 'mobile.auth.session.v1';
let inMemorySession: string | null = null;

type SecureStoreLike = {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
};

type AuthSession = {
  token: string;
  userId: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
  phone: string | null;
};

type AuthState = {
  token: string | null;
  userId: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
  phone: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  authError: string;
  submitting: boolean;
  hydrateSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

function parseJwtExpiry(token: string): number | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payloadBase64.padEnd(Math.ceil(payloadBase64.length / 4) * 4, '=');
    const decoded = Buffer.from(padded, 'base64').toString('utf8');
    const payload = JSON.parse(decoded) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const exp = parseJwtExpiry(token);
  if (!exp) return false;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return exp <= nowSeconds;
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payloadBase64.padEnd(Math.ceil(payloadBase64.length / 4) * 4, '=');
    const decoded = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function toNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function extractSessionDetails(payload: {
  token: string;
  userId?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  phone?: string | null;
}): AuthSession {
  const jwt = parseJwtPayload(payload.token);

  const userId =
    payload.userId ??
    toNullableString(jwt?.sub) ??
    toNullableString(jwt?.userId) ??
    toNullableString(jwt?.id) ??
    null;
  const name =
    payload.name ??
    toNullableString(jwt?.name) ??
    toNullableString(jwt?.fullName) ??
    toNullableString(jwt?.preferred_username) ??
    null;
  const email = payload.email ?? toNullableString(jwt?.email) ?? null;
  const role = payload.role ?? toNullableString(jwt?.role) ?? toNullableString(jwt?.userRole) ?? null;
  const phone = payload.phone ?? toNullableString(jwt?.phone) ?? toNullableString(jwt?.phone_number) ?? null;

  return { token: payload.token, userId, name, email, role, phone };
}

async function persistSession(session: AuthSession | null) {
  const secureStore = await getSecureStore();
  const webStorage = getWebStorage();

  if (!session) {
    if (secureStore) {
      await secureStore.deleteItemAsync(AUTH_STORAGE_KEY);
    }
    if (webStorage) {
      webStorage.removeItem(AUTH_STORAGE_KEY);
    }
    inMemorySession = null;
    return;
  }

  const serialized = JSON.stringify(session);
  if (secureStore) {
    await secureStore.setItemAsync(AUTH_STORAGE_KEY, serialized);
  }
  if (webStorage) {
    webStorage.setItem(AUTH_STORAGE_KEY, serialized);
  }
  inMemorySession = serialized;
}

let secureStoreCache: SecureStoreLike | null | undefined;

async function getSecureStore(): Promise<SecureStoreLike | null> {
  if (secureStoreCache !== undefined) {
    return secureStoreCache;
  }

  if (Platform.OS === 'web') {
    secureStoreCache = null;
    return null;
  }

  try {
    const module = await import('expo-secure-store');
    const candidate = (module?.default ?? module) as Partial<SecureStoreLike> | undefined;
    if (
      candidate &&
      typeof candidate.getItemAsync === 'function' &&
      typeof candidate.setItemAsync === 'function' &&
      typeof candidate.deleteItemAsync === 'function'
    ) {
      secureStoreCache = candidate as SecureStoreLike;
      return secureStoreCache;
    }
    secureStoreCache = null;
    return null;
  } catch {
    secureStoreCache = null;
    return null;
  }
}

function getWebStorage(): Storage | null {
  if (Platform.OS !== 'web') {
    return null;
  }

  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      return globalThis.localStorage;
    }
  } catch {
    // ignore storage access failures
  }
  return null;
}

export const useMobileAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  name: null,
  email: null,
  role: null,
  phone: null,
  isAuthenticated: false,
  isHydrated: false,
  authError: '',
  submitting: false,
  hydrateSession: async () => {
    try {
      const secureStore = await getSecureStore();
      const webStorage = getWebStorage();
      const raw = secureStore
        ? await secureStore.getItemAsync(AUTH_STORAGE_KEY)
        : webStorage?.getItem(AUTH_STORAGE_KEY) ?? inMemorySession;
      if (!raw) {
        api.setToken(null);
        set({
          token: null,
          userId: null,
          name: null,
          email: null,
          role: null,
          phone: null,
          isAuthenticated: false,
          isHydrated: true,
        });
        return;
      }

      const parsed = JSON.parse(raw) as AuthSession;
      if (!parsed?.token || isTokenExpired(parsed.token)) {
        await persistSession(null);
        api.setToken(null);
        set({
          token: null,
          userId: null,
          name: null,
          email: null,
          role: null,
          phone: null,
          isAuthenticated: false,
          isHydrated: true,
        });
        return;
      }

      const normalized = extractSessionDetails(parsed);
      api.setToken(normalized.token);
      set({
        token: normalized.token,
        userId: normalized.userId,
        name: normalized.name,
        email: normalized.email,
        role: normalized.role,
        phone: normalized.phone,
        isAuthenticated: true,
        authError: '',
        isHydrated: true,
      });
    } catch {
      api.setToken(null);
      set({
        token: null,
        userId: null,
        name: null,
        email: null,
        role: null,
        phone: null,
        isAuthenticated: false,
        isHydrated: true,
      });
    }
  },
  signIn: async (email, password) => {
    try {
      set({ authError: '', submitting: true });
      const payload = await api.login(email, password);
      const session = extractSessionDetails(payload);
      api.setToken(session.token);
      await persistSession(session);
      set({
        token: session.token,
        userId: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
        phone: session.phone,
        isAuthenticated: true,
        authError: '',
        submitting: false,
      });
    } catch (error: any) {
      api.setToken(null);
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
      const session = extractSessionDetails(payload);
      api.setToken(session.token);
      await persistSession(session);
      set({
        token: session.token,
        userId: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
        phone: session.phone,
        isAuthenticated: true,
        authError: '',
        submitting: false,
      });
    } catch (error: any) {
      api.setToken(null);
      set({
        authError: error?.message || 'Authentication failed',
        submitting: false,
        isAuthenticated: false,
      });
    }
  },
  logout: async () => {
    await persistSession(null);
    api.setToken(null);
    set({
      token: null,
      userId: null,
      name: null,
      email: null,
      role: null,
      phone: null,
      isAuthenticated: false,
      authError: '',
      submitting: false,
    });
  },
  clearError: () => {
    set({ authError: '' });
  },
}));
