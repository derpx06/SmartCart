import React, { createContext, useContext, useEffect, useMemo } from 'react';

import { useMobileAuthStore } from '@/store/auth-store';

type AuthContextValue = {
  isAuthenticated: boolean;
  isHydrated: boolean;
  userId: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
  phone: string | null;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useMobileAuthStore((state) => state.isAuthenticated);
  const isHydrated = useMobileAuthStore((state) => state.isHydrated);
  const userId = useMobileAuthStore((state) => state.userId);
  const name = useMobileAuthStore((state) => state.name);
  const email = useMobileAuthStore((state) => state.email);
  const role = useMobileAuthStore((state) => state.role);
  const phone = useMobileAuthStore((state) => state.phone);
  const logout = useMobileAuthStore((state) => state.logout);
  const hydrateSession = useMobileAuthStore((state) => state.hydrateSession);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  const value = useMemo(
    () => ({ isAuthenticated, isHydrated, userId, name, email, role, phone, logout }),
    [isAuthenticated, isHydrated, userId, name, email, role, phone, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
