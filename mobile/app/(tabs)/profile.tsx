import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';
import { useOrdersStore } from '@/store/orders-store';

export default function ProfileScreen() {
  const { name, email, phone, logout } = useAuth();
  const orders = useOrdersStore((state) => state.orders);
  const fetchOrders = useOrdersStore((state) => state.fetchOrders);

  useEffect(() => {
    if (orders.length === 0) {
      void fetchOrders({ silent: true });
    }
  }, [fetchOrders, orders.length]);

  const profileStats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (Number.isFinite(order.total) ? order.total : 0), 0);
    const activeOrders = orders.filter((order) => {
      const s = order.status.toLowerCase();
      return !s.includes('deliver') && !s.includes('complete') && !s.includes('cancel');
    }).length;

    const latestTimestamp = orders.reduce((latest, order) => {
      const ts = Date.parse(order.date);
      return Number.isNaN(ts) ? latest : Math.max(latest, ts);
    }, 0);

    const latestOrderDate =
      latestTimestamp > 0
        ? new Date(latestTimestamp).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'No orders yet';

    return {
      totalOrders,
      totalSpent,
      activeOrders,
      latestOrderDate,
    };
  }, [orders]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={26} color="#1C1B1F" />
          </View>
          <ThemedText style={styles.title}>Profile</ThemedText>
          <ThemedText style={styles.subtitle}>Manage your Williams Sonoma account</ThemedText>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <ThemedText style={styles.label}>Name</ThemedText>
            <ThemedText style={styles.value}>{name || 'Guest'}</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <ThemedText style={styles.value}>{email || 'Not available'}</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <ThemedText style={styles.label}>Phone</ThemedText>
            <ThemedText style={styles.value}>{phone || 'Not available'}</ThemedText>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Order details</ThemedText>
          <View style={styles.row}>
            <ThemedText style={styles.label}>Total orders</ThemedText>
            <ThemedText style={styles.value}>{profileStats.totalOrders}</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <ThemedText style={styles.label}>Active orders</ThemedText>
            <ThemedText style={styles.value}>{profileStats.activeOrders}</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <ThemedText style={styles.label}>Total spent</ThemedText>
            <ThemedText style={styles.value}>${profileStats.totalSpent.toFixed(2)}</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <ThemedText style={styles.label}>Last order</ThemedText>
            <ThemedText style={styles.value}>{profileStats.latestOrderDate}</ThemedText>
          </View>
        </View>

        <Pressable style={styles.logoutButton} onPress={() => void logout()}>
          <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
          <ThemedText style={styles.logoutText}>Log out</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  header: { marginBottom: 20 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EFEFED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  subtitle: { marginTop: 6, fontSize: 14, color: 'rgba(28,27,31,0.68)' },
  card: {
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(28,27,31,0.14)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: 'rgba(28,27,31,0.78)', marginBottom: 2 },
  row: { paddingVertical: 12 },
  label: { fontSize: 12, color: 'rgba(28,27,31,0.58)' },
  value: { marginTop: 4, fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(28,27,31,0.10)' },
  logoutButton: {
    marginTop: 18,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1C1B1F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
