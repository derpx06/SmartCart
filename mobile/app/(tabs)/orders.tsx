import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { luxuryShadow, radius, spacing } from '@/components/luxury/design';
import { SkeletonBlock } from '@/components/luxury/SkeletonBlock';
import { FLOATING_TAB_BAR_HEIGHT, getFloatingTabBarBottomOffset } from '@/components/navigation/FloatingTabBar';
import { Fonts } from '@/constants/theme';
import { useOrdersStore } from '@/store/orders-store';
import type { MobileOrder } from '@/store/orders-store';

const ORDERS_MONO = {
  white: '#FFFFFF',
  soft: '#E9E9E7',
  ink: '#1C1B1F',
};

const ORDERS_COLORS = {
  screenBg: ORDERS_MONO.white,
  cardBg: ORDERS_MONO.white,
  softSurface: ORDERS_MONO.soft,
  text: ORDERS_MONO.ink,
  muted: 'rgba(28, 27, 31, 0.68)',
  border: 'rgba(28, 27, 31, 0.14)',
  orbOne: 'rgba(28, 27, 31, 0.08)',
  orbTwo: 'rgba(233, 233, 231, 0.72)',
  danger: '#c52b2b',
  statusStrongBg: 'rgba(28, 27, 31, 0.16)',
  statusNormalBg: 'rgba(28, 27, 31, 0.1)',
  statusSoftBg: 'rgba(28, 27, 31, 0.06)',
  statusText: ORDERS_MONO.ink,
};

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function shortOrderId(id: string) {
  const tail = id.replace(/[^a-f0-9]/gi, '').slice(-6).toUpperCase();
  return tail.length ? `#${tail}` : `#${id.slice(0, 8)}`;
}

function formatOrderDate(isoDate: string) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) {
    return isoDate;
  }
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusPresentation(status: string): {
  label: string;
  pillBg: string;
  pillText: string;
  icon: keyof typeof Ionicons.glyphMap;
} {
  const normalized = status.toLowerCase();
  if (normalized.includes('deliver') || normalized.includes('complete')) {
    return {
      label: status,
      pillBg: ORDERS_COLORS.statusStrongBg,
      pillText: ORDERS_COLORS.statusText,
      icon: 'checkmark-circle',
    };
  }
  if (normalized.includes('ship')) {
    return {
      label: status,
      pillBg: ORDERS_COLORS.statusNormalBg,
      pillText: ORDERS_COLORS.statusText,
      icon: 'airplane',
    };
  }
  if (normalized.includes('cancel')) {
    return {
      label: status,
      pillBg: ORDERS_COLORS.statusSoftBg,
      pillText: ORDERS_COLORS.statusText,
      icon: 'close-circle-outline',
    };
  }
  return {
    label: status,
    pillBg: ORDERS_COLORS.statusSoftBg,
    pillText: ORDERS_COLORS.statusText,
    icon: 'time-outline',
  };
}

function OrderCard({
  order,
  card,
  line,
  text,
  muted,
  softSurface,
}: {
  order: MobileOrder;
  card: string;
  line: string;
  text: string;
  muted: string;
  softSurface: string;
}) {
  const router = useRouter();
  const status = statusPresentation(order.status);

  const openProduct = (slug: string | undefined) => {
    const s = slug?.trim();
    if (!s) {
      return;
    }
    router.push(`/product/${encodeURIComponent(s)}`);
  };

  return (
    <View style={[styles.orderCard, { backgroundColor: card, borderColor: line }, luxuryShadow]}>
      <View style={styles.orderCardTop}>
        <View style={styles.orderIdBlock}>
          <ThemedText style={[styles.orderIdLabel, { color: muted }]}>Order</ThemedText>
          <ThemedText style={[styles.orderIdValue, { color: text }]}>{shortOrderId(order.id)}</ThemedText>
        </View>
        <View style={[styles.statusPill, { backgroundColor: status.pillBg }]}>
          <Ionicons name={status.icon} size={12} color={status.pillText} />
          <ThemedText style={[styles.statusPillText, { color: status.pillText }]}>{status.label}</ThemedText>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="calendar-outline" size={14} color={muted} />
        <ThemedText style={[styles.metaText, { color: muted }]}>{formatOrderDate(order.date)}</ThemedText>
        {order.customerName ? (
          <>
            <View style={[styles.metaDot, { backgroundColor: line }]} />
            <ThemedText style={[styles.metaText, { color: muted }]} numberOfLines={1}>
              {order.customerName}
            </ThemedText>
          </>
        ) : null}
      </View>

      <View style={[styles.itemsBlock, { borderTopColor: line }]}>
        <ThemedText style={[styles.itemsHeading, { color: muted }]}>Items</ThemedText>
        {order.items.map((item, index) => {
          const canOpen = Boolean(item.slug?.trim());
          return (
            <Pressable
              key={`${order.id}-${index}-${item.name}`}
              disabled={!canOpen}
              onPress={() => openProduct(item.slug)}
              accessibilityRole={canOpen ? 'button' : undefined}
              accessibilityState={{ disabled: !canOpen }}
              accessibilityLabel={canOpen ? `Open ${item.name}` : undefined}
              style={({ pressed }) => [
                styles.itemRow,
                { backgroundColor: softSurface, borderColor: line },
                canOpen && pressed ? styles.itemRowPressed : null,
              ]}>
              <ThemedText style={[styles.itemName, { color: text }]} numberOfLines={2}>
                {item.name}
              </ThemedText>
              <View style={styles.itemRowEnd}>
                <View style={[styles.qtyChip, { borderColor: line }]}>
                  <ThemedText style={[styles.qtyChipText, { color: text }]}>×{item.quantity}</ThemedText>
                </View>
                {canOpen ? (
                  <Ionicons name="chevron-forward" size={16} color={muted} style={styles.itemChevron} />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.totalRow, { borderTopColor: line }]}>
        <ThemedText style={[styles.totalLabel, { color: muted }]}>Total</ThemedText>
        <ThemedText style={[styles.totalValue, { color: text }]}>{money(order.total)}</ThemedText>
      </View>
    </View>
  );
}

export default function OrdersScreen() {
  const orders = useOrdersStore((state) => state.orders);
  const loading = useOrdersStore((state) => state.loading);
  const error = useOrdersStore((state) => state.error);
  const fetchOrders = useOrdersStore((state) => state.fetchOrders);
  const insets = useSafeAreaInsets();
  const background = ORDERS_COLORS.screenBg;
  const card = ORDERS_COLORS.cardBg;
  const text = ORDERS_COLORS.text;
  const mutedText = ORDERS_COLORS.muted;
  const danger = ORDERS_COLORS.danger;

  const [refreshing, setRefreshing] = useState(false);

  const tabBarClearance = getFloatingTabBarBottomOffset(insets.bottom) + FLOATING_TAB_BAR_HEIGHT + spacing.md;

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchOrders({ silent: true });
    } finally {
      setRefreshing(false);
    }
  }, [fetchOrders]);

  if (loading && orders.length === 0 && !error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
          showsVerticalScrollIndicator={false}
          bounces>
          <View pointerEvents="none" style={styles.atmosphereLayer}>
            <View style={[styles.orbOne, { backgroundColor: ORDERS_COLORS.orbOne }]} />
            <View style={[styles.orbTwo, { backgroundColor: ORDERS_COLORS.orbTwo }]} />
          </View>

          <View style={styles.topRow}>
            <View style={styles.topCopy}>
              <SkeletonBlock height={12} width={84} borderRadius={radius.pill} />
              <SkeletonBlock height={40} width={170} />
              <SkeletonBlock height={14} width="86%" />
            </View>
            <SkeletonBlock height={44} width={44} borderRadius={22} />
          </View>

          <View style={styles.listSection}>
            <SkeletonBlock height={11} width={58} />
            {[0, 1, 2].map((idx) => (
              <View
                key={`order-skeleton-${idx}`}
                style={[styles.orderCard, styles.skeletonOrderCard, { backgroundColor: card }, luxuryShadow]}>
                <View style={styles.orderCardTop}>
                  <View style={styles.orderIdBlock}>
                    <SkeletonBlock height={11} width={54} />
                    <SkeletonBlock height={24} width={106} />
                  </View>
                  <SkeletonBlock height={28} width={96} borderRadius={radius.pill} />
                </View>

                <View style={styles.skeletonMetaRow}>
                  <SkeletonBlock height={13} width={124} />
                  <SkeletonBlock height={13} width={82} />
                </View>

                <View style={[styles.itemsBlock, styles.skeletonItemsBlock]}>
                  <SkeletonBlock height={11} width={44} />
                  {[0, 1].map((itemIdx) => (
                    <View
                      key={`order-item-skeleton-${idx}-${itemIdx}`}
                      style={[styles.itemRow, styles.skeletonItemRow, { backgroundColor: ORDERS_COLORS.softSurface }]}>
                      <SkeletonBlock height={14} width="62%" />
                      <SkeletonBlock height={24} width={54} borderRadius={radius.pill} />
                    </View>
                  ))}
                </View>

                <View style={[styles.totalRow, styles.skeletonTotalRow]}>
                  <SkeletonBlock height={14} width={48} />
                  <SkeletonBlock height={24} width={88} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={text}
            colors={[text]}
          />
        }
        bounces>
        <View pointerEvents="none" style={styles.atmosphereLayer}>
          <View style={[styles.orbOne, { backgroundColor: ORDERS_COLORS.orbOne }]} />
          <View style={[styles.orbTwo, { backgroundColor: ORDERS_COLORS.orbTwo }]} />
        </View>

        <View style={styles.topRow}>
          <View style={styles.topCopy}>
            <ThemedText style={[styles.kicker, { color: text }]}>Account</ThemedText>
            <ThemedText style={[styles.pageTitle, { color: text }]}>Orders</ThemedText>
            <ThemedText style={[styles.topSub, { color: mutedText }]}>
              {orders.length === 0 && !error
                ? 'Your completed orders from the cart appear here.'
                : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'} on file.`}
            </ThemedText>
          </View>
          <View
            style={[
              styles.iconBadge,
              { borderColor: ORDERS_COLORS.border, backgroundColor: ORDERS_COLORS.cardBg },
            ]}>
            <Ionicons name="cube-outline" size={18} color={text} />
          </View>
        </View>

        {error ? (
          <View style={[styles.errorCard, { borderColor: danger, backgroundColor: card }]}>
            <Ionicons name="cloud-offline-outline" size={22} color={danger} />
            <View style={styles.errorCopy}>
              <ThemedText style={[styles.errorTitle, { color: text }]}>Couldn’t load orders</ThemedText>
              <ThemedText style={[styles.errorBody, { color: mutedText }]}>{error}</ThemedText>
            </View>
            <Pressable
              onPress={() => void fetchOrders()}
              style={[styles.retryButton, { borderColor: ORDERS_COLORS.border, backgroundColor: ORDERS_COLORS.softSurface }]}>
              <ThemedText style={[styles.retryText, { color: text }]}>Try again</ThemedText>
            </Pressable>
          </View>
        ) : null}

        {!error && orders.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: card, borderColor: ORDERS_COLORS.border }]}>
            <View style={[styles.emptyIconWrap, { backgroundColor: ORDERS_COLORS.softSurface }]}>
              <Ionicons name="receipt-outline" size={32} color={mutedText} />
            </View>
            <ThemedText style={[styles.emptyTitle, { color: text }]}>No orders yet</ThemedText>
            <ThemedText style={[styles.emptyBody, { color: mutedText }]}>
              Place an order from the cart tab. It will show up here right away.
            </ThemedText>
          </View>
        ) : null}

        {!error && orders.length > 0 ? (
          <View style={styles.listSection}>
            <ThemedText style={[styles.sectionLabel, { color: mutedText }]}>Recent</ThemedText>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                card={card}
                line={ORDERS_COLORS.border}
                text={text}
                muted={mutedText}
                softSurface={ORDERS_COLORS.softSurface}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  atmosphereLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  orbOne: {
    position: 'absolute',
    top: 4,
    right: -48,
    width: 160,
    height: 160,
    borderRadius: 160,
    opacity: 0.4,
  },
  orbTwo: {
    position: 'absolute',
    top: 72,
    left: -56,
    width: 168,
    height: 168,
    borderRadius: 168,
    opacity: 0.22,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  topCopy: {
    gap: 4,
    maxWidth: 280,
  },
  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  pageTitle: {
    fontFamily: Fonts.serif,
    fontSize: 36,
    fontWeight: '600',
    lineHeight: 40,
  },
  topSub: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  errorCopy: {
    flex: 1,
    minWidth: 160,
    gap: 4,
  },
  errorTitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  errorBody: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  retryText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: Fonts.serif,
    fontSize: 22,
  },
  emptyBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  listSection: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  orderCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  skeletonOrderCard: {
    borderWidth: 0,
  },
  orderCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  orderIdBlock: {
    gap: 2,
    flex: 1,
  },
  orderIdLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  orderIdValue: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    fontWeight: '600',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  statusPillText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
  },
  metaText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  skeletonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemsBlock: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  skeletonItemsBlock: {
    borderTopWidth: 0,
    paddingTop: spacing.xs,
  },
  itemsHeading: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
  },
  skeletonItemRow: {
    borderWidth: 0,
    justifyContent: 'space-between',
  },
  itemRowPressed: {
    opacity: 0.88,
  },
  itemRowEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemChevron: {
    marginLeft: 2,
  },
  itemName: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  qtyChip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtyChipText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    marginTop: 2,
  },
  skeletonTotalRow: {
    borderTopWidth: 0,
    paddingTop: spacing.xs,
  },
  totalLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  totalValue: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: '700',
  },
});
