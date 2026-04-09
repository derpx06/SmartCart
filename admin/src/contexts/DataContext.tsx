/* eslint-disable react-refresh/only-export-components */
import { useEffect, type ReactNode } from 'react';

import { useAuth } from './AuthContext';
import { useAdminDataStore } from '../store/data-store';

export type { Order, OrderItem, Product } from '../types/admin';

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const refreshData = useAdminDataStore((state) => state.refreshData);
  const clearData = useAdminDataStore((state) => state.clearData);

  useEffect(() => {
    if (!isAuthenticated) {
      clearData();
      return;
    }

    void refreshData();
  }, [clearData, isAuthenticated, refreshData]);

  return children;
};

export const useData = useAdminDataStore;
