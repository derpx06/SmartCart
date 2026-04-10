import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View, Modal, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { luxuryShadow, radius, spacing } from '@/components/luxury/design';
import { FLOATING_TAB_BAR_HEIGHT, getFloatingTabBarBottomOffset } from '@/components/navigation/FloatingTabBar';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useHomeStore } from '@/store/home-store';
import { useSmartCartState } from '@/hooks/use-smart-cart-state';
import { useOrdersStore } from '@/store/orders-store';
import { useSmartCartStore } from '@/store/smart-cart-store';
import { RecommendationSection } from '@/components/RecommendationSection';

const CART_MONO = {
  white: '#FFFFFF',
  soft: '#E9E9E7',
  ink: '#1C1B1F',
};

const CART_COLORS = {
  screenBg: CART_MONO.white,
  cardBg: CART_MONO.white,
  sectionSoftBg: CART_MONO.soft,
  text: CART_MONO.ink,
  muted: 'rgba(28, 27, 31, 0.68)',
  border: 'rgba(28, 27, 31, 0.14)',
  orbOne: 'rgba(28, 27, 31, 0.08)',
  orbTwo: 'rgba(233, 233, 231, 0.72)',
  danger: '#c52b2b',
  checkoutBtnBg: CART_MONO.ink,
  checkoutBtnText: CART_MONO.white,
  checkoutBtnDisabledBg: CART_MONO.soft,
  checkoutBtnDisabledText: 'rgba(28, 27, 31, 0.42)',
};

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
  const router = useRouter();
  const { state, loading, error } = useSmartCartState();
  const updateCartQuantity = useSmartCartStore((store) => store.updateCartQuantity);
  const addToCart = useSmartCartStore((store) => store.addToCart);
  const checkout = useSmartCartStore((store) => store.checkout);
  const fetchOrders = useOrdersStore((store) => store.fetchOrders);
  const homeData = useHomeStore((state) => state.homeData);
  const scrollRef = useRef<ScrollView>(null);
  
  const [cartSearchQuery, setCartSearchQuery] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'loading' | 'form' | 'processing' | 'success'>('loading');
  const [placingOrder, setPlacingOrder] = useState(false);
  const insets = useSafeAreaInsets();
  const background = CART_COLORS.screenBg;
  const card = CART_COLORS.cardBg;
  const text = CART_COLORS.text;
  const muted = CART_COLORS.muted;
  const danger = CART_COLORS.danger;
  const accent = CART_COLORS.text;
  const softSurface = CART_COLORS.sectionSoftBg;
  const softSurfaceAlt = CART_COLORS.sectionSoftBg;

  const handleQuantityChange = async (productId: string, quantity: number) => {
    try {
      await updateCartQuantity(productId, quantity);
    } catch (err: any) {
      Alert.alert('Cart update failed', err.message || 'Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: background, justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText>Loading your SmartCart...</ThemedText>
      </SafeAreaView>
    );
  }

  const allItems = state?.cart.items || [];
  const cartSearch = cartSearchQuery.trim().toLowerCase();
  const items = cartSearch
    ? allItems.filter(
        (item) =>
          item.name.toLowerCase().includes(cartSearch) ||
          (item.category && item.category.toLowerCase().includes(cartSearch)),
      )
    : allItems;
  const subtotal = state?.cart.totalValue || 0;
  const discount = subtotal * 0.1;
  const total = subtotal - discount;
  const tabBarClearance = getFloatingTabBarBottomOffset(insets.bottom) + FLOATING_TAB_BAR_HEIGHT + spacing.xs;

  const handleOpenPayment = () => {
    if (!items.length) return;
    setShowPaymentModal(true);
    setPaymentStep('loading');
    setTimeout(() => {
      setPaymentStep('form');
    }, 1200);
  };

  const handleProcessPayment = async () => {
    setPaymentStep('processing');
    setPlacingOrder(true);
    
    // Simulate network delay for payment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      await checkout();
      await fetchOrders();
      setPaymentStep('success');
      setTimeout(() => {
        setShowPaymentModal(false);
        setPlacingOrder(false);
        Alert.alert(
          'Order placed successfully!',
          'Your order has been saved and your payment was processed.'
        );
      }, 1500);
    } catch (err: any) {
      setPlacingOrder(false);
      setShowPaymentModal(false);
      Alert.alert('Could not process payment', err?.message || 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance + 92 }]}
        showsVerticalScrollIndicator={false}
        bounces>
        <View pointerEvents="none" style={styles.atmosphereLayer}>
          <View style={[styles.orbOne, { backgroundColor: CART_COLORS.orbOne }]} />
          <View style={[styles.orbTwo, { backgroundColor: CART_COLORS.orbTwo }]} />
        </View>

        <View style={styles.topRow}>
          <View style={styles.topCopy}>
            <ThemedText style={[styles.kicker, { color: accent }]}>Your cart</ThemedText>
            <ThemedText style={[styles.pageTitle, { color: text }]}>Your selection</ThemedText>
            <ThemedText style={[styles.topSub, { color: muted }]}>
              Review items and place your order — it is completed on our side with no payment screen.
            </ThemedText>
          </View>
          <View
            style={[
              styles.iconBadge,
              { borderColor: CART_COLORS.border, backgroundColor: CART_COLORS.cardBg },
            ]}>
            <Ionicons name="bag-outline" size={18} color={text} />
          </View>
        </View>

        {/* ── Search bar ── */}
        <View style={[styles.cartSearchWrap, { backgroundColor: CART_COLORS.cardBg, borderColor: CART_COLORS.border }]}>
          <Ionicons name="search" size={16} color={muted} />
          <TextInput
            value={cartSearchQuery}
            onChangeText={setCartSearchQuery}
            placeholder="Search your cart..."
            placeholderTextColor={muted}
            autoCorrect={false}
            autoCapitalize="none"
            spellCheck={false}
            returnKeyType="search"
            style={[styles.cartSearchInput, { color: text }]}
          />
          {cartSearchQuery.length > 0 ? (
            <Pressable onPress={() => setCartSearchQuery('')} style={[styles.cartSearchClear, { backgroundColor: softSurface }]}>
              <Ionicons name="close" size={13} color={text} />
            </Pressable>
          ) : null}
        </View>

        {error ? (
          <View style={[styles.errorPill, { borderColor: danger, backgroundColor: card }]}>
            <Ionicons name="alert-circle-outline" size={14} color={danger} />
            <ThemedText style={[styles.errorText, { color: danger }]}>
              Could not refresh cart. Showing the latest saved selection.
            </ThemedText>
          </View>
        ) : null}

        {!items.length ? (
          <View style={[styles.emptyCard, { backgroundColor: card, borderColor: CART_COLORS.border }]}>
            <Ionicons name={cartSearch ? 'search-outline' : 'bag-handle-outline'} size={30} color={muted} />
            <ThemedText style={[styles.emptyTitle, { color: text }]}>
              {cartSearch ? 'No matching items' : 'Your cart is empty'}
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: muted }]}>
              {cartSearch
                ? 'Try a different search term to find items in your cart.'
                : 'Add pieces to begin a more considered checkout experience.'}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.itemsWrap}>
            {items.map((item) => {
              const isOutOfStock = state?.inventory[item.productId] === 'OUT_OF_STOCK';
              const slug = item.slug?.trim();
              const canOpenProduct = Boolean(slug);
              
              const allProducts = [...(homeData?.bestsellers || []), ...(homeData?.recommendedProducts || [])];
              const matchingProduct = allProducts.find(p => p.id === item.productId || p.slug === item.slug);
              const imageUrl = matchingProduct?.image;

              return (
                <View
                  key={item.productId}
                  style={[
                    styles.itemCard,
                    { backgroundColor: card, borderColor: CART_COLORS.border },
                  ]}>
                  <Pressable
                    disabled={!canOpenProduct}
                    onPress={() => slug && router.push(`/product/${encodeURIComponent(slug)}`)}
                    style={({ pressed }) => [
                      styles.itemPressableMain,
                      canOpenProduct && pressed ? styles.itemPressablePressed : null,
                    ]}
                    accessibilityRole={canOpenProduct ? 'button' : undefined}
                    accessibilityLabel={canOpenProduct ? `Open ${item.name}` : undefined}>
                    <View style={[styles.itemImage, { backgroundColor: softSurfaceAlt, overflow: 'hidden' }]}>
                      {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                      ) : (
                        <ThemedText style={[styles.itemMonogram, { color: text }]}>
                          {initials(item.name)}
                        </ThemedText>
                      )}
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
                    </View>

                    {canOpenProduct ? (
                      <Ionicons name="chevron-forward" size={18} color={muted} />
                    ) : null}
                  </Pressable>

                  <View style={styles.itemBottom}>
                    <View
                      style={[
                        styles.qtyPill,
                        { borderColor: CART_COLORS.border, backgroundColor: softSurface },
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
                          color={isOutOfStock ? danger : CART_COLORS.text}
                        />
                        <ThemedText
                          style={[styles.stockText, { color: isOutOfStock ? danger : muted }]}>
                          {isOutOfStock ? 'Out of stock' : 'Ready to ship'}
                        </ThemedText>
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

        <View style={[styles.summaryCard, { backgroundColor: card, borderColor: CART_COLORS.border }]}>
          <ThemedText style={[styles.collectionLabel, { color: accent }]}>Order summary</ThemedText>
          <ThemedText style={[styles.summaryTitle, { color: text }]}>Totals</ThemedText>

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
              { backgroundColor: softSurface, borderColor: CART_COLORS.border },
            ]}>
            <Ionicons name="diamond-outline" size={14} color={accent} />
            <ThemedText style={[styles.rowLabel, { color: muted }]}>Preferred pricing applied</ThemedText>
            <ThemedText style={[styles.savingsValue, { color: accent }]}>{money(discount)}</ThemedText>
          </View>

          {(state?.session.confidence ?? 1) < 0.5 && (
            <ThemedText style={[styles.errorText, { color: muted }]}>
              Review your selection before placing the order to ensure nothing essential has been removed.
            </ThemedText>
          )}

          <View style={[styles.totalRow, { borderColor: CART_COLORS.border }]}>
            <ThemedText style={[styles.totalLabel, { color: text }]}>Total</ThemedText>
            <ThemedText style={[styles.totalValue, { color: text }]}>{money(total)}</ThemedText>
          </View>
          <ThemedText style={[styles.taxNote, { color: muted }]}>
            Delivery timing and any taxes are illustrative in this demo.
          </ThemedText>
        </View>
      </ScrollView>

      <View
        style={[
          styles.checkoutWrap,
          { bottom: tabBarClearance },
          { borderColor: CART_COLORS.border, backgroundColor: CART_COLORS.cardBg },
          luxuryShadow,
        ]}>
        <View style={styles.checkoutMetaInline}>
          <ThemedText style={[styles.checkoutCaption, { color: muted }]}>Total</ThemedText>
          <ThemedText style={[styles.checkoutAmount, { color: text }]}>{money(total)}</ThemedText>
        </View>

        <Pressable
          onPress={handleOpenPayment}
          disabled={!items.length || placingOrder || showPaymentModal}
          style={[
            styles.billButtonInline,
            {
              borderColor: CART_COLORS.border,
              backgroundColor:
                !items.length || placingOrder ? CART_COLORS.checkoutBtnDisabledBg : CART_COLORS.checkoutBtnBg,
            },
          ]}>
          {placingOrder ? (
            <ActivityIndicator size="small" color={CART_COLORS.checkoutBtnDisabledText} />
          ) : (
            <Ionicons
              name="bag-check-outline"
              size={16}
              color={!items.length ? CART_COLORS.checkoutBtnDisabledText : CART_COLORS.checkoutBtnText}
            />
          )}
          <ThemedText
            style={[
              styles.billText,
              {
                color:
                  !items.length || placingOrder ? CART_COLORS.checkoutBtnDisabledText : CART_COLORS.checkoutBtnText,
              },
            ]}>
            {placingOrder ? 'Placing…' : 'Place order'}
          </ThemedText>
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
  cartSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    height: 46,
    gap: spacing.xs,
    ...luxuryShadow,
  },
  cartSearchInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    letterSpacing: -0.1,
  },
  cartSearchClear: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: spacing.sm,
  },
  itemPressableMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  itemPressablePressed: {
    opacity: 0.88,
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  checkoutMetaInline: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  checkoutCaption: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  checkoutAmount: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: '700',
  },
  billButtonInline: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  billText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
