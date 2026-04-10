import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useOrdersStore } from '@/store/orders-store';

export default function ProfileScreen() {
  const router = useRouter();
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
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={26} color="#1C1B1F" />
            </View>
            <View style={styles.headerCopy}>
              <ThemedText style={styles.title}>{name || 'Guest'}</ThemedText>
              <ThemedText style={styles.subtitle}>Manage your Williams Sonoma account</ThemedText>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statTile}>
              <ThemedText style={styles.statValue}>{profileStats.totalOrders}</ThemedText>
              <ThemedText style={styles.statLabel}>Total Orders</ThemedText>
            </View>
            <View style={styles.statTile}>
              <ThemedText style={styles.statValue}>{profileStats.activeOrders}</ThemedText>
              <ThemedText style={styles.statLabel}>Active</ThemedText>
            </View>
            <View style={styles.statTile}>
              <ThemedText style={styles.statValue}>${profileStats.totalSpent.toFixed(0)}</ThemedText>
              <ThemedText style={styles.statLabel}>Spent</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Personal details</ThemedText>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={16} color="rgba(28,27,31,0.6)" />
            <View style={styles.infoTextWrap}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <ThemedText style={styles.value}>{email || 'Not available'}</ThemedText>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color="rgba(28,27,31,0.6)" />
            <View style={styles.infoTextWrap}>
              <ThemedText style={styles.label}>Phone</ThemedText>
              <ThemedText style={styles.value}>{phone || 'Not available'}</ThemedText>
            </View>
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

        <View style={styles.actionsRow}>
          <Pressable style={styles.secondaryButton} onPress={() => router.push('/(tabs)/orders')}>
            <Ionicons name="receipt-outline" size={16} color="#1C1B1F" />
            <ThemedText style={styles.secondaryButtonText}>My Orders</ThemedText>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => router.push('/(tabs)/wishlist')}>
            <Ionicons name="heart-outline" size={16} color="#1C1B1F" />
            <ThemedText style={styles.secondaryButtonText}>Wishlist</ThemedText>
          </Pressable>
        </View>

        <Pressable style={styles.logoutButton} onPress={() => void logout()}>
          <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
          <ThemedText style={styles.logoutText}>Log out</ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF',paddingBottom: 60

   },
  container: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 32 },
  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(28,27,31,0.1)',
    backgroundColor: '#F5F5F2',
    padding: 16,
    marginBottom: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  headerCopy: { flex: 1 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EFEFED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: { fontFamily: Fonts.serif, fontSize: 24, lineHeight: 30, fontWeight: '700' },
  subtitle: { marginTop: 2, fontFamily: Fonts.sans, fontSize: 13, color: 'rgba(28,27,31,0.68)' },
  statsRow: { marginTop: 14, flexDirection: 'row', gap: 8 },
  statTile: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(28,27,31,0.08)',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: { fontFamily: Fonts.sans, fontSize: 15, fontWeight: '700', color: '#1C1B1F' },
  statLabel: { marginTop: 3, fontFamily: Fonts.sans, fontSize: 11, color: 'rgba(28,27,31,0.58)' },
  card: {
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(28,27,31,0.14)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(28,27,31,0.78)',
    marginBottom: 4,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 8 },
  infoTextWrap: { flex: 1 },
  row: { paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontFamily: Fonts.sans, fontSize: 12, color: 'rgba(28,27,31,0.58)' },
  value: { marginTop: 3, fontFamily: Fonts.sans, fontSize: 15, fontWeight: '600', color: '#1C1B1F' },
  divider: { height: 1, backgroundColor: 'rgba(28,27,31,0.10)' },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  secondaryButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(28,27,31,0.14)',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: { fontFamily: Fonts.sans, fontSize: 13, fontWeight: '600', color: '#1C1B1F' },
  logoutButton: {
    marginTop: 12,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1C1B1F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: { color: '#FFFFFF', fontFamily: Fonts.sans, fontSize: 14, fontWeight: '700' },
});
