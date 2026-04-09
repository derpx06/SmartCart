import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

import { useSmartCartState } from '@/hooks/use-smart-cart-state';

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function CartScreen() {
  const { state, loading, error } = useSmartCartState();
  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'mutedText');
  const border = useThemeColor({}, 'border');
  const softSurface = useThemeColor({ light: '#f7f3ee', dark: '#111111' }, 'card');
  const softSurfaceAlt = useThemeColor({ light: '#efe7dc', dark: '#1a1a1a' }, 'card');
  const danger = useThemeColor({ light: '#c52b2b', dark: '#ff8b8b' }, 'text');
  const success = useThemeColor({ light: '#1d7d44', dark: '#7de39f' }, 'text');

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: background, justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText>Loading your SmartCart...</ThemedText>
      </SafeAreaView>
    );
  }

  const items = state?.cart.items || [];
  const subtotal = state?.cart.totalValue || 0;
  const discount = subtotal * 0.1;
  const total = subtotal - discount;
  const itemLabel = items.length === 1 ? 'item' : 'items';
  const outOfStockCount = items.filter((item) => state?.inventory[item.productId] === 'OUT_OF_STOCK').length;
  const deliveryProgress = Math.min(subtotal / 500, 1);
  const deliveryMessage =
    subtotal >= 500
      ? 'You unlocked complimentary premium delivery.'
      : `Add ${money(500 - subtotal)} to unlock complimentary premium delivery.`;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <View style={styles.topRow}>
          <View style={styles.topCopy}>
            <ThemedText style={[styles.pageTitle, { color: text }]}>Cart</ThemedText>
            <ThemedText style={[styles.topSub, { color: muted }]}>Ready for checkout</ThemedText>
          </View>
          <View style={[styles.iconBadge, { borderColor: border, backgroundColor: softSurface }]}>
            <Ionicons name="bag-outline" size={18} color={text} />
          </View>
        </View>

        {error ? (
          <View style={[styles.errorPill, { borderColor: danger }]}>
            <Ionicons name="alert-circle-outline" size={14} color={danger} />
            <ThemedText style={[styles.errorText, { color: danger }]}>Could not refresh cart. Showing latest cached state.</ThemedText>
          </View>
        ) : null}

        <View style={[styles.heroHeader, { backgroundColor: softSurface, borderColor: border }]}>
          <ThemedText style={[styles.kicker, { color: muted }]}>
            {items.length} {itemLabel} - {money(subtotal)}
          </ThemedText>
          <ThemedText style={[styles.mainHeading, { color: text }]}>Your curated selection</ThemedText>
          <View style={[styles.progressTrack, { backgroundColor: softSurfaceAlt }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: text,
                  width: `${Math.max(deliveryProgress * 100, 6)}%`,
                },
              ]}
            />
          </View>
          <ThemedText style={[styles.progressNote, { color: muted }]}>{deliveryMessage}</ThemedText>
          <View style={styles.pillRow}>
            <View style={[styles.perkPill, { borderColor: border, backgroundColor: card }]}>
              <Ionicons name="sparkles-outline" size={14} color={text} />
              <ThemedText style={[styles.perkText, { color: text }]}>
                Complimentary white-glove handling
              </ThemedText>
            </View>
            <View style={[styles.perkPill, { borderColor: border, backgroundColor: card }]}>
              <Ionicons name="shield-checkmark-outline" size={14} color={text} />
              <ThemedText style={[styles.perkText, { color: text }]}>Secure checkout</ThemedText>
            </View>
          </View>
          {state?.session.behavior === 'slow' && (
            <View style={[styles.perkPill, { borderColor: border, backgroundColor: '#fffbe6' }]}>
              <Ionicons name="bulb-outline" size={14} color="#856404" />
              <ThemedText style={[styles.perkText, { color: '#856404' }]}>
                Take your time. We've saved your progress.
              </ThemedText>
            </View>
          )}
          {outOfStockCount > 0 && (
            <View style={[styles.perkPill, { borderColor: danger, backgroundColor: card }]}>
              <Ionicons name="alert-circle-outline" size={14} color={danger} />
              <ThemedText style={[styles.perkText, { color: danger }]}>
                {outOfStockCount} {outOfStockCount === 1 ? 'item is' : 'items are'} currently out of stock.
              </ThemedText>
            </View>
          )}
        </View>

        {!items.length ? (
          <View style={[styles.emptyCard, { backgroundColor: card, borderColor: border }]}>
            <Ionicons name="bag-handle-outline" size={30} color={muted} />
            <ThemedText style={[styles.emptyTitle, { color: text }]}>Your cart is empty</ThemedText>
            <ThemedText style={[styles.emptyText, { color: muted }]}>
              Add products to see personalized savings and checkout recommendations.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.itemsWrap}>
            {items.map((item) => {
              const isOutOfStock = state?.inventory[item.productId] === 'OUT_OF_STOCK';
              return (
                <View key={item.productId} style={[styles.itemCard, { backgroundColor: card, borderColor: border }]}>
                  <View style={[styles.itemImage, { backgroundColor: softSurfaceAlt }]}>
                    <ThemedText style={[styles.itemMonogram, { color: text }]}>{initials(item.name)}</ThemedText>
                  </View>
                  <View style={styles.itemBody}>
                    <View style={styles.itemTopLine}>
                      <ThemedText numberOfLines={2} style={[styles.itemName, { color: text }]}>
                        {item.name}
                      </ThemedText>
                      <ThemedText style={[styles.itemPrice, { color: text }]}>{money(item.price)}</ThemedText>
                    </View>
                    <View style={styles.itemMetaRow}>
                      <View style={[styles.categoryChip, { backgroundColor: softSurface, borderColor: border }]}>
                        <ThemedText numberOfLines={1} style={[styles.categoryText, { color: muted }]}>
                          {item.category}
                        </ThemedText>
                      </View>
                    </View>
                    <View style={styles.itemBottom}>
                      <View style={[styles.qtyPill, { borderColor: border, backgroundColor: softSurface }]}>
                        <Pressable style={styles.qtyBtn}>
                          <Ionicons name="remove" size={14} color={text} />
                        </Pressable>
                        <ThemedText style={[styles.qtyText, { color: text }]}>{item.quantity}</ThemedText>
                        <Pressable style={styles.qtyBtn}>
                          <Ionicons name="add" size={14} color={text} />
                        </Pressable>
                      </View>
                      <View style={styles.metaWrap}>
                        <View style={styles.metaRow}>
                          <Ionicons
                            name={isOutOfStock ? 'alert-circle-outline' : 'checkmark-circle-outline'}
                            size={13}
                            color={isOutOfStock ? danger : success}
                          />
                          <ThemedText style={[styles.stockText, { color: isOutOfStock ? danger : success }]}>
                            {isOutOfStock ? 'Out of stock' : 'In stock'}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={[styles.summaryCard, { backgroundColor: card, borderColor: border }]}>
          <ThemedText style={[styles.summaryTitle, { color: text }]}>Order Summary</ThemedText>
          <View style={styles.row}>
            <ThemedText style={[styles.rowLabel, { color: muted }]}>Subtotal</ThemedText>
            <ThemedText style={[styles.rowValue, { color: text }]}>{money(subtotal)}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText style={[styles.rowLabel, { color: muted }]}>Shipping</ThemedText>
            <ThemedText style={[styles.rowValue, { color: text }]}>Free</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText style={[styles.rowLabel, { color: muted }]}>Promo (HERITAGE10)</ThemedText>
            <ThemedText style={[styles.savingsValue, { color: success }]}>-{money(discount)}</ThemedText>
          </View>
          <View style={[styles.savingsRow, { backgroundColor: softSurface, borderColor: border }]}>
            <Ionicons name="pricetag-outline" size={14} color={success} />
            <ThemedText style={[styles.rowLabel, { color: muted }]}>Savings this order</ThemedText>
            <ThemedText style={[styles.savingsValue, { color: success }]}>{money(discount)}</ThemedText>
          </View>
          {(state?.session.confidence ?? 1) < 0.5 && (
            <ThemedText style={[styles.errorText, { color: danger }]}>
              AI note: you recently removed items. Review to avoid missing essentials.
            </ThemedText>
          )}
          <View style={[styles.totalRow, { borderColor: border }]}>
            <ThemedText style={[styles.totalLabel, { color: text }]}>Total</ThemedText>
            <ThemedText style={[styles.totalValue, { color: text }]}>{money(total)}</ThemedText>
          </View>
          <ThemedText style={[styles.taxNote, { color: muted }]}>Estimated taxes calculated at checkout.</ThemedText>
        </View>
      </ScrollView>

      <View style={[styles.checkoutWrap, { borderColor: border, backgroundColor: card }]}>
        <View style={styles.checkoutMeta}>
          <ThemedText style={[styles.checkoutCaption, { color: muted }]}>Pay now</ThemedText>
          <ThemedText style={[styles.checkoutAmount, { color: text }]}>{money(total)}</ThemedText>
        </View>
        <Pressable style={[styles.checkoutButton, { backgroundColor: text }]}>
          <ThemedText lightColor={background} darkColor={background} style={styles.checkoutText}>
            Checkout
          </ThemedText>
          <Ionicons name="arrow-forward" size={18} color={background} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 176,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topCopy: {
    gap: 2,
  },
  pageTitle: {
    fontFamily: Fonts.serif,
    fontSize: 30,
    fontWeight: '600',
    lineHeight: 34,
  },
  topSub: {
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
  },
  heroHeader: {
    gap: 8,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  mainHeading: {
    fontFamily: Fonts.serif,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: 0.2,
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressNote: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  perkPill: {
    marginTop: 2,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  perkText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '500',
  },
  itemsWrap: {
    gap: 12,
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  itemImage: {
    width: 84,
    height: 94,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemMonogram: {
    fontFamily: Fonts.serif,
    fontSize: 23,
    letterSpacing: 0.8,
  },
  itemBody: {
    flex: 1,
    gap: 8,
  },
  itemTopLine: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  itemName: {
    flex: 1,
    fontFamily: Fonts.serif,
    fontSize: 15,
    lineHeight: 20,
  },
  itemPrice: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: '82%',
  },
  categoryText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
  },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  qtyPill: {
    borderWidth: 1,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontFamily: Fonts.sans,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 8,
  },
  metaWrap: {
    alignItems: 'flex-end',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockText: {
    fontSize: 11,
    fontFamily: Fonts.sans,
    fontWeight: '600',
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 10,
    marginTop: 4,
  },
  summaryTitle: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  rowValue: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
  },
  savingsRow: {
    marginTop: 2,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savingsValue: {
    marginLeft: 'auto',
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  totalRow: {
    marginTop: 2,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: Fonts.serif,
    fontSize: 24,
  },
  totalValue: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    fontWeight: '700',
  },
  taxNote: {
    fontFamily: Fonts.sans,
    fontSize: 11,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: Fonts.serif,
    fontSize: 24,
  },
  emptyText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 260,
  },
  checkoutWrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 98,
    borderWidth: 1,
    borderRadius: 18,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkoutMeta: {
    flex: 1,
    paddingLeft: 6,
  },
  checkoutCaption: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  checkoutAmount: {
    fontFamily: Fonts.serif,
    fontSize: 23,
    lineHeight: 28,
  },
  checkoutButton: {
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 8,
  },
  checkoutText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
  },
});

