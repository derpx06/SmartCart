/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';

import { useAuthStore } from '../store/auth-store';

export const AuthProvider = ({ children }: { children: ReactNode }) => children;

export const useAuth = useAuthStore;
