import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { luxuryShadow, radius, spacing, useLuxuryPalette } from '@/components/luxury/design';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSmartCartState } from '@/hooks/use-smart-cart-state';
import { useSmartCartStore } from '@/store/smart-cart-store';
import { RecommendationSection } from '@/components/RecommendationSection';

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
  const { state, loading, error, refresh } = useSmartCartState();
  const updateCartQuantity = useSmartCartStore((store) => store.updateCartQuantity);
  const addToCart = useSmartCartStore((store) => store.addToCart);
  const checkout = useSmartCartStore((store) => store.checkout);
  const scrollRef = useRef<ScrollView>(null);
  const [billSectionY, setBillSectionY] = useState(0);
  const insets = useSafeAreaInsets();
  const luxuryPalette = useLuxuryPalette();
  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'mutedText');
  const danger = useThemeColor({ light: '#c52b2b', dark: '#ff8b8b' }, 'text');
  const accent = luxuryPalette.gold;
  const softSurface = luxuryPalette.surface;
  const softSurfaceAlt = luxuryPalette.beige;

  const handleQuantityChange = async (productId: string, quantity: number) => {
    try {
      await updateCartQuantity(productId, quantity);
    } catch (err: any) {
      Alert.alert('Cart update failed', err.message || 'Please try again.');
    }
  };

  const handleCheckout = async () => {
    if (!(state?.cart.items?.length ?? 0)) {
      Alert.alert('Your cart is empty', 'Add products to proceed with payment.');
      return;
    }

    try {
      await checkout();
      await refresh();
      Alert.alert('Order placed', 'Your order has been submitted successfully.');
    } catch (err: any) {
      Alert.alert('Checkout failed', err.message || 'Please try again.');
    }
  };

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
  const footerOffset = Math.max(insets.bottom, 10);

  const handleJumpToBill = () => {
    scrollRef.current?.scrollTo({
      y: Math.max(billSectionY - spacing.md, 0),
      animated: true,
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingBottom: 212 + footerOffset }]}
        showsVerticalScrollIndicator={false}
        bounces>
        <View pointerEvents="none" style={styles.atmosphereLayer}>
          <View style={[styles.orbOne, { backgroundColor: luxuryPalette.orbOne }]} />
          <View style={[styles.orbTwo, { backgroundColor: luxuryPalette.orbTwo }]} />
        </View>

        <View style={styles.topRow}>
          <View style={styles.topCopy}>
            <ThemedText style={[styles.kicker, { color: accent }]}>Private checkout</ThemedText>
            <ThemedText style={[styles.pageTitle, { color: text }]}>Your selection</ThemedText>
            <ThemedText style={[styles.topSub, { color: muted }]}>
              Reserved for dispatch once you approve payment.
            </ThemedText>
          </View>
          <View
            style={[
              styles.iconBadge,
              { borderColor: luxuryPalette.line, backgroundColor: luxuryPalette.elevated },
            ]}>
            <Ionicons name="bag-outline" size={18} color={text} />
          </View>
        </View>

        {error ? (
          <View style={[styles.errorPill, { borderColor: danger, backgroundColor: card }]}>
            <Ionicons name="alert-circle-outline" size={14} color={danger} />
            <ThemedText style={[styles.errorText, { color: danger }]}>
              Could not refresh cart. Showing the latest saved selection.
            </ThemedText>
          </View>
        ) : null}

        {state?.semantic && (
          <View style={[styles.semanticAlert, { backgroundColor: luxuryPalette.gold + '15', borderColor: luxuryPalette.gold }]}>
            <View style={styles.semanticHeader}>
              <Ionicons name="sparkles" size={16} color={luxuryPalette.gold} />
              <ThemedText style={[styles.semanticKicker, { color: luxuryPalette.gold }]}>
                {state.semantic.primary_intent} intelligence
              </ThemedText>
            </View>
            <ThemedText style={[styles.semanticSummary, { color: text }]}>
              {state.semantic.summary}
            </ThemedText>
            <View style={styles.needsRow}>
              {state.semantic.needs.slice(0, 3).map((need, idx) => (
                <View key={idx} style={[styles.needTag, { backgroundColor: luxuryPalette.beige }]}>
                  <ThemedText style={[styles.needText, { color: text }]}>+{need}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {!items.length ? (
          <View style={[styles.emptyCard, { backgroundColor: card, borderColor: luxuryPalette.line }]}>
            <Ionicons name="bag-handle-outline" size={30} color={muted} />
            <ThemedText style={[styles.emptyTitle, { color: text }]}>Your cart is empty</ThemedText>
            <ThemedText style={[styles.emptyText, { color: muted }]}>
              Add pieces to begin a more considered checkout experience.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.itemsWrap}>
            {items.map((item) => {
              const isOutOfStock = state?.inventory[item.productId] === 'OUT_OF_STOCK';
              return (
                <View
                  key={item.productId}
                  style={[
                    styles.itemCard,
                    { backgroundColor: card, borderColor: luxuryPalette.line },
                  ]}>
                  <View style={[styles.itemImage, { backgroundColor: softSurfaceAlt }]}>
                    <ThemedText style={[styles.itemMonogram, { color: text }]}>
                      {initials(item.name)}
                    </ThemedText>
                  </View>

                  <View style={styles.itemBody}>
                    <ThemedText numberOfLines={1} style={[styles.itemCategoryMeta, { color: muted }]}>
                      {item.category}
                    </ThemedText>

                    <View style={styles.itemTopLine}>
                      <ThemedText numberOfLines={2} style={[styles.itemName, { color: text }]}>
                        {item.name}
                      </ThemedText>
                      <ThemedText style={[styles.itemPrice, { color: text }]}>
                        {money(item.price)}
                      </ThemedText>
                    </View>

                    <View style={styles.itemBottom}>
                      <View
                        style={[
                          styles.qtyPill,
                          { borderColor: luxuryPalette.line, backgroundColor: softSurface },
                        ]}>
                        <Pressable
                          style={styles.qtyBtn}
                          onPress={() => handleQuantityChange(item.productId, item.quantity - 1)}>
                          <Ionicons name="remove" size={14} color={text} />
                        </Pressable>
                        <ThemedText style={[styles.qtyText, { color: text }]}>{item.quantity}</ThemedText>
                        <Pressable
                          style={styles.qtyBtn}
                          onPress={() => handleQuantityChange(item.productId, item.quantity + 1)}>
                          <Ionicons name="add" size={14} color={text} />
                        </Pressable>
                      </View>

                      <View style={styles.metaWrap}>
                        <View style={styles.metaRow}>
                          <Ionicons
                            name={isOutOfStock ? 'alert-circle-outline' : 'ellipse'}
                            size={isOutOfStock ? 13 : 9}
                            color={isOutOfStock ? danger : accent}
                          />
                          <ThemedText
                            style={[styles.stockText, { color: isOutOfStock ? danger : muted }]}>
                            {isOutOfStock ? 'Out of stock' : 'Ready to ship'}
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

        {state?.ranked && state.ranked.length > 0 && (
          <RecommendationSection
            ranked={state.ranked}
            onAdd={(pid) => addToCart(pid, 1)}
          />
        )}

        <View
          onLayout={(event) => setBillSectionY(event.nativeEvent.layout.y)}
          style={[styles.summaryCard, { backgroundColor: card, borderColor: luxuryPalette.line }]}>
          <ThemedText style={[styles.collectionLabel, { color: accent }]}>Order summary</ThemedText>
          <ThemedText style={[styles.summaryTitle, { color: text }]}>Payment overview</ThemedText>

          <View style={styles.row}>
            <ThemedText style={[styles.rowLabel, { color: muted }]}>Subtotal</ThemedText>
            <ThemedText style={[styles.rowValue, { color: text }]}>{money(subtotal)}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText style={[styles.rowLabel, { color: muted }]}>Delivery</ThemedText>
            <ThemedText style={[styles.rowValue, { color: text }]}>Included</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText style={[styles.rowLabel, { color: muted }]}>Private client adjustment</ThemedText>
            <ThemedText style={[styles.savingsValue, { color: accent }]}>-{money(discount)}</ThemedText>
          </View>

          <View
            style={[
              styles.savingsRow,
              { backgroundColor: softSurface, borderColor: luxuryPalette.line },
            ]}>
            <Ionicons name="diamond-outline" size={14} color={accent} />
            <ThemedText style={[styles.rowLabel, { color: muted }]}>Preferred pricing applied</ThemedText>
            <ThemedText style={[styles.savingsValue, { color: accent }]}>{money(discount)}</ThemedText>
          </View>

          {(state?.session.confidence ?? 1) < 0.5 && (
            <ThemedText style={[styles.errorText, { color: muted }]}>
              Review your selection before payment to ensure nothing essential has been removed.
            </ThemedText>
          )}

          <View style={[styles.totalRow, { borderColor: luxuryPalette.line }]}>
            <ThemedText style={[styles.totalLabel, { color: text }]}>Total</ThemedText>
            <ThemedText style={[styles.totalValue, { color: text }]}>{money(total)}</ThemedText>
          </View>
          <ThemedText style={[styles.taxNote, { color: muted }]}>
            Taxes and final delivery timing are confirmed at payment.
          </ThemedText>
        </View>
      </ScrollView>

      <View
        style={[
          styles.checkoutWrap,
          { bottom: footerOffset },
          { borderColor: luxuryPalette.line, backgroundColor: luxuryPalette.elevated },
        ]}>
        <View style={styles.checkoutMeta}>
          <ThemedText style={[styles.checkoutCaption, { color: muted }]}>Total</ThemedText>
          <ThemedText style={[styles.checkoutAmount, { color: text }]}>{money(total)}</ThemedText>
        </View>

        <Pressable onPress={handleJumpToBill} style={[styles.billButton, { borderColor: luxuryPalette.line }]}>
          <Ionicons name="receipt-outline" size={16} color={text} />
          <ThemedText style={[styles.billText, { color: text }]}>Go to Bill</ThemedText>
        </Pressable>

        <Pressable onPress={handleCheckout} style={[styles.checkoutButton, { backgroundColor: text }, luxuryShadow]}>
          <ThemedText lightColor={background} darkColor={background} style={styles.checkoutText}>
            Pay Now
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 176,
    gap: spacing.md,
  },
  atmosphereLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
  },
  orbOne: {
    position: 'absolute',
    top: 6,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 180,
    opacity: 0.42,
  },
  orbTwo: {
    position: 'absolute',
    top: 96,
    left: -72,
    width: 188,
    height: 188,
    borderRadius: 188,
    opacity: 0.24,
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
  errorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 18,
  },
  collectionLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: Fonts.serif,
    fontSize: 24,
  },
  emptyText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  itemsWrap: {
    gap: spacing.md,
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
  },
  itemImage: {
    width: 92,
    height: 112,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemMonogram: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    letterSpacing: 0.8,
  },
  itemBody: {
    flex: 1,
    gap: spacing.xs,
  },
  itemCategoryMeta: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  itemTopLine: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  itemName: {
    flex: 1,
    fontFamily: Fonts.serif,
    fontSize: 18,
    lineHeight: 24,
  },
  itemPrice: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '600',
  },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  qtyPill: {
    borderWidth: 1,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontFamily: Fonts.sans,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 10,
  },
  metaWrap: {
    alignItems: 'flex-end',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stockText: {
    fontSize: 11,
    fontFamily: Fonts.sans,
    letterSpacing: 0.4,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  summaryTitle: {
    fontFamily: Fonts.serif,
    fontSize: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  rowValue: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
  },
  savingsRow: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    marginTop: spacing.xs,
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
    lineHeight: 17,
  },
  checkoutWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: 12,
    alignItems: 'stretch',
    gap: 12,
  },
  checkoutMeta: {
    alignItems: 'center',
    gap: 2,
  },
  checkoutCaption: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  checkoutAmount: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    fontWeight: '700',
  },
  billButton: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  billText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 8,
  },
  checkoutText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  semanticAlert: {
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: 8,
    marginBottom: spacing.sm,
  },
  semanticHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  semanticKicker: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  semanticSummary: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  needsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  needTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  needText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
  },
});
