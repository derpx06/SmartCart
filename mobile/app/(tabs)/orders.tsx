import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { radius, spacing } from '@/components/luxury/design';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useOrdersStore } from '@/store/orders-store';

export default function OrdersScreen() {
  const orders = useOrdersStore((state) => state.orders);
  const loading = useOrdersStore((state) => state.loading);
  const fetchOrders = useOrdersStore((state) => state.fetchOrders);
  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const mutedText = useThemeColor({}, 'mutedText');

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerCard, { borderColor: border, backgroundColor: card }]}>
          <View style={[styles.iconWrap, { backgroundColor: border }]}>
            <Ionicons name="car-outline" size={24} color={text} />
          </View>
          <ThemedText style={styles.title}>Orders</ThemedText>
          <ThemedText style={[styles.description, { color: mutedText }]}>
            Track shipments, returns, and recent order activity.
          </ThemedText>
        </View>

        {loading ? (
          <ThemedText style={[styles.description, { color: mutedText }]}>Loading orders...</ThemedText>
        ) : orders.length === 0 ? (
          <View style={[styles.itemCard, { borderColor: border, backgroundColor: card }]}>
            <ThemedText style={styles.itemTitle}>No orders yet</ThemedText>
            <ThemedText style={[styles.itemDetail, { color: mutedText }]}>
              Complete checkout from the cart to create your first order.
            </ThemedText>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={[styles.itemCard, { borderColor: border, backgroundColor: card }]}>
              <ThemedText style={styles.itemTitle}>{order.id}</ThemedText>
              <ThemedText style={[styles.itemDetail, { color: mutedText }]}>
                {order.date} • {order.status} • ${order.total.toFixed(2)}
              </ThemedText>
              <ThemedText style={[styles.itemDetail, { color: mutedText }]}>
                {order.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}
              </ThemedText>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  headerCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.xs },
  iconWrap: { width: 44, height: 44, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xxs },
  title: { fontFamily: Fonts.sans, fontSize: 26, letterSpacing: 0.3 },
  description: { fontFamily: Fonts.sans, fontSize: 14, lineHeight: 21 },
  itemCard: { borderRadius: radius.md, borderWidth: 1, padding: spacing.md, gap: spacing.xxs },
  itemTitle: { fontFamily: Fonts.sans, fontSize: 16, fontWeight: '700' },
  itemDetail: { fontFamily: Fonts.sans, fontSize: 14, lineHeight: 20 },
});
