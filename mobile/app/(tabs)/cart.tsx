import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { luxuryShadow, radius, spacing } from '@/components/luxury/design';
import { SkeletonBlock } from '@/components/luxury/SkeletonBlock';
import { FLOATING_TAB_BAR_HEIGHT, getFloatingTabBarBottomOffset } from '@/components/navigation/FloatingTabBar';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useHomeStore } from '@/store/home-store';
import { useSmartCartState } from '@/hooks/use-smart-cart-state';
import { useOrdersStore } from '@/store/orders-store';
import { useSmartCartStore } from '@/store/smart-cart-store';
import { RecommendationSection } from '@/components/RecommendationSection';
import { CartIntelligencePanel } from '@/components/CartIntelligencePanel';
import { SmartBundleSection } from '@/components/SmartBundleSection';
import type { SmartCartItem } from '@/types/smart-cart';

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

function normalizeKey(value?: string) {
  return (value || '').trim().toLowerCase();
}

function titleCaseLabel(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Categories with this many separate cart lines become a collapsible folder with their own checkout. */
const FOLDER_LINE_THRESHOLD = 3;

type CartDisplayGroup =
  | { kind: 'folder'; categoryKey: string; categoryLabel: string; items: SmartCartItem[] }
  | { kind: 'line'; item: SmartCartItem };

function buildCartDisplayGroups(cartItems: SmartCartItem[]): CartDisplayGroup[] {
  if (!cartItems.length) return [];
  const byCat = new Map<string, SmartCartItem[]>();
  for (const item of cartItems) {
    const key = normalizeKey(item.category) || '__uncategorized';
    if (!byCat.has(key)) byCat.set(key, []);
    byCat.get(key)!.push(item);
  }
  const categoryOrder: string[] = [];
  for (const item of cartItems) {
    const key = normalizeKey(item.category) || '__uncategorized';
    if (!categoryOrder.includes(key)) {
      categoryOrder.push(key);
    }
  }
  const groups: CartDisplayGroup[] = [];
  for (const key of categoryOrder) {
    const list = byCat.get(key)!;
    const label =
      titleCaseLabel((list[0]?.category || '').trim() || (key === '__uncategorized' ? 'Other' : key));
    if (list.length >= FOLDER_LINE_THRESHOLD) {
      groups.push({ kind: 'folder', categoryKey: key, categoryLabel: label, items: list });
    } else {
      for (const line of list) {
        groups.push({ kind: 'line', item: line });
      }
    }
  }
  return groups;
}

function folderSubtotal(lines: SmartCartItem[]) {
  return lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
  const [placingOrder, setPlacingOrder] = useState(false);
  /** `key` omitted or true = expanded; false = collapsed */
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const insets = useSafeAreaInsets();
  const tabBarClearance = getFloatingTabBarBottomOffset(insets.bottom) + FLOATING_TAB_BAR_HEIGHT + spacing.xs;
  const background = CART_COLORS.screenBg;
  const card = CART_COLORS.cardBg;
  const text = CART_COLORS.text;
  const muted = CART_COLORS.muted;
  const danger = CART_COLORS.danger;
  const accent = CART_COLORS.text;
  const softSurface = CART_COLORS.sectionSoftBg;
  const softSurfaceAlt = CART_COLORS.sectionSoftBg;
  const allItems = state?.cart.items || [];
  const cartSearch = cartSearchQuery.trim().toLowerCase();
  const items = cartSearch
    ? allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(cartSearch) ||
        (item.category && item.category.toLowerCase().includes(cartSearch)),
    )
    : allItems;
  const displayGroups = useMemo(() => buildCartDisplayGroups(items), [items]);
  const hasCartItems = allItems.length > 0;
  const subtotal = state?.cart.totalValue || 0;
  const discount = subtotal * 0.1;
  const total = subtotal - discount;

  const handleQuantityChange = async (productId: string, quantity: number) => {
    try {
      await updateCartQuantity(productId, quantity);
    } catch (err: any) {
      Alert.alert('Cart update failed', err.message || 'Please try again.');
    }
  };

  const handleAddRecommendation = async (productId: string) => {
    try {
      await addToCart(productId, 1);
    } catch (err: any) {
      const message = err?.message || 'Please try again.';
      if (typeof message === 'string' && message.toLowerCase().includes('unauthorized')) {
        Alert.alert('Session expired', 'Please sign in again to add items to your cart.');
        return;
      }
      Alert.alert('Could not add item', message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance + 92 }]}
          showsVerticalScrollIndicator={false}>
          <View pointerEvents="none" style={styles.atmosphereLayer}>
            <View style={[styles.orbOne, { backgroundColor: CART_COLORS.orbOne }]} />
            <View style={[styles.orbTwo, { backgroundColor: CART_COLORS.orbTwo }]} />
          </View>

          <View style={styles.headerBlock}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerTopFlex} />
              <SkeletonBlock height={36} width={100} borderRadius={radius.pill} />
              <SkeletonBlock height={44} width={44} borderRadius={22} style={styles.skeletonHeaderIconGap} />
            </View>
            <View style={styles.topCopy}>
              <SkeletonBlock height={12} width={120} borderRadius={radius.pill} />
              <SkeletonBlock height={36} width={200} borderRadius={radius.md} />
              <SkeletonBlock height={14} width="92%" />
            </View>
          </View>

          <View style={[styles.cartSearchWrap, styles.skeletonSearchWrap, { backgroundColor: CART_COLORS.cardBg }]}>
            <SkeletonBlock height={16} width={16} borderRadius={8} />
            <SkeletonBlock height={14} width="75%" />
          </View>

          <View style={styles.skeletonItemsWrap}>
            {[0, 1].map((idx) => (
              <View
                key={`cart-skeleton-${idx}`}
                style={[
                  styles.itemCard,
                  styles.skeletonItemCard,
                  { backgroundColor: CART_COLORS.cardBg },
                ]}>
                <View style={styles.itemPressableMain}>
                  <SkeletonBlock height={118} width={96} borderRadius={radius.lg} />
                  <View style={styles.skeletonItemBody}>
                    <SkeletonBlock height={11} width="34%" />
                    <SkeletonBlock height={20} width="92%" />
                    <SkeletonBlock height={17} width="48%" />
                  </View>
                </View>
                <View style={styles.itemBottom}>
                  <SkeletonBlock height={36} width={108} borderRadius={radius.pill} />
                  <SkeletonBlock height={12} width={84} />
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.summaryCard, styles.skeletonSummaryCard, { backgroundColor: card }]}>
            <SkeletonBlock height={12} width={100} />
            <SkeletonBlock height={30} width={130} />
            <SkeletonBlock height={16} width="100%" />
            <SkeletonBlock height={16} width="100%" />
            <SkeletonBlock height={16} width="100%" />
            <SkeletonBlock height={46} width="100%" borderRadius={radius.md} />
            <SkeletonBlock height={1} width="100%" />
            <SkeletonBlock height={34} width="58%" />
          </View>
        </ScrollView>

        <View
          style={[
            styles.checkoutWrap,
            styles.skeletonCheckoutWrap,
            { bottom: tabBarClearance },
            { backgroundColor: CART_COLORS.cardBg },
            luxuryShadow,
          ]}>
          <SkeletonBlock height={20} width={110} />
          <SkeletonBlock height={38} width={128} borderRadius={radius.pill} />
        </View>
      </SafeAreaView>
    );
  }

  const isFolderExpanded = (categoryKey: string) => expandedFolders[categoryKey] !== false;

  const toggleFolder = (categoryKey: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [categoryKey]: !((prev[categoryKey] ?? true)),
    }));
  };

  const runCheckout = async (productIds: string[] | undefined, orderLabel: string) => {
    setPlacingOrder(true);
    await new Promise((resolve) => setTimeout(resolve, 1600));
    try {
      await checkout(productIds);
      await fetchOrders();
      Alert.alert(
        'Order placed successfully!',
        productIds?.length
          ? `Your ${orderLabel} order was saved and payment was processed. Remaining bag items stay in your cart.`
          : 'Your order has been saved and your payment was processed.',
      );
    } catch (err: any) {
      Alert.alert('Could not process payment', err?.message || 'Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const confirmAndCheckout = (productIds: string[] | undefined, orderLabel: string, message: string) => {
    Alert.alert('Place order', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Place order',
        onPress: () => {
          void runCheckout(productIds, orderLabel);
        },
      },
    ]);
  };

  const handleOpenPayment = () => {
    if (!hasCartItems) return;
    confirmAndCheckout(
      undefined,
      'full bag',
      `Confirm order for all ${allItems.length} ${allItems.length === 1 ? 'item' : 'items'} (${money(total)} estimated total)?`,
    );
  };

  const handleFolderPlaceOrder = (folderItems: SmartCartItem[], categoryLabel: string) => {
    const ids = folderItems.map((line) => line.productId);
    const folderTotal = folderSubtotal(folderItems);
    const folderDiscount = folderTotal * 0.1;
    const folderGrand = folderTotal - folderDiscount;
    confirmAndCheckout(
      ids,
      categoryLabel,
      `Order only your ${categoryLabel} folder (${folderItems.length} ${folderItems.length === 1 ? 'line' : 'lines'}, about ${money(folderGrand)} after the same preferred adjustment as the full bag)?`,
    );
  };

  const renderCartLineItem = (item: SmartCartItem, index: number, nested?: boolean) => {
    const isOutOfStock = state?.inventory[item.productId] === 'OUT_OF_STOCK';
    const slug = item.slug?.trim();
    const canOpenProduct = Boolean(slug);

    const allProducts = [
      ...(homeData?.bestsellers || []),
      ...(homeData?.recommendedProducts || []),
      ...(homeData?.collections || []),
    ];
    const normalizedItemId = normalizeKey(item.productId);
    const normalizedItemSlug = normalizeKey(item.slug);
    const normalizedItemName = normalizeKey(item.name);

    const matchingProduct = allProducts.find((p) => {
      const pAny = p as any;
      const productId = normalizeKey(pAny.productId || pAny.id);
      const productSlug = normalizeKey(pAny.slug);
      const productName = normalizeKey(pAny.name || pAny.title);
      return (
        (normalizedItemId && productId === normalizedItemId) ||
        (normalizedItemSlug && productSlug === normalizedItemSlug) ||
        (normalizedItemName && productName === normalizedItemName)
      );
    });

    const rankedMatch = (state?.ranked || []).find((p: any) => {
      const productId = normalizeKey(p.productId || p.id);
      const productSlug = normalizeKey(p.slug);
      const productName = normalizeKey(p.name);
      return (
        (normalizedItemId && productId === normalizedItemId) ||
        (normalizedItemSlug && productSlug === normalizedItemSlug) ||
        (normalizedItemName && productName === normalizedItemName)
      );
    });

    const imageUrl =
      (item as any).image ||
      (item as any).imageUrl ||
      matchingProduct?.image ||
      rankedMatch?.image;

    const lineTotal = item.price * item.quantity;

    return (
      <View
        key={`${item.productId}-${item.slug ?? 'noslug'}-${index}`}
        style={[
          styles.itemCard,
          nested ? styles.itemCardNested : null,
          { backgroundColor: card, borderColor: CART_COLORS.border },
          nested ? null : luxuryShadow,
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
              <ThemedText style={[styles.itemMonogram, { color: text }]}>{initials(item.name)}</ThemedText>
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
              <View style={styles.itemPriceCol}>
                <ThemedText style={[styles.itemLineTotal, { color: text }]}>{money(lineTotal)}</ThemedText>
                {item.quantity > 1 ? (
                  <ThemedText style={[styles.itemUnitMeta, { color: muted }]}>{money(item.price)} each</ThemedText>
                ) : null}
              </View>
            </View>
          </View>

          {canOpenProduct ? <Ionicons name="chevron-forward" size={18} color={muted} /> : null}
        </Pressable>

        <View style={styles.itemBottom}>
          <View
            style={[styles.qtyPill, { borderColor: CART_COLORS.border, backgroundColor: softSurface }]}>
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
              <ThemedText style={[styles.stockText, { color: isOutOfStock ? danger : muted }]}>
                {isOutOfStock ? 'Out of stock' : 'Ready to ship'}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    );
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

        <View style={styles.headerBlock}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTopFlex} />
            {hasCartItems ? (
              <View
                style={[
                  styles.headerCountPill,
                  { backgroundColor: softSurface, borderColor: CART_COLORS.border },
                ]}>
                <Ionicons name="bag-handle-outline" size={14} color={text} />
                <ThemedText style={[styles.headerCountText, { color: text }]}>
                  {allItems.length} {allItems.length === 1 ? 'item' : 'items'}
                </ThemedText>
              </View>
            ) : null}
            <View
              style={[
                styles.iconBadge,
                { borderColor: CART_COLORS.border, backgroundColor: CART_COLORS.cardBg },
                hasCartItems ? styles.iconBadgeWithGap : null,
              ]}>
              <Ionicons name="bag-outline" size={18} color={text} />
            </View>
          </View>
          <View style={styles.topCopy}>
            <ThemedText style={[styles.kicker, { color: muted }]}>Shopping bag</ThemedText>
            <ThemedText style={[styles.pageTitle, { color: text }]}>Cart</ThemedText>
            <ThemedText style={[styles.topSub, { color: muted }]}>
              Review quantities, then place your order when the total feels right.
            </ThemedText>
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
          <View style={[styles.emptyCard, { backgroundColor: card, borderColor: CART_COLORS.border }, luxuryShadow]}>
            <View style={[styles.emptyIconWrap, { backgroundColor: softSurface }]}>
              <Ionicons name={cartSearch ? 'search-outline' : 'bag-handle-outline'} size={28} color={muted} />
            </View>
            <ThemedText style={[styles.emptyTitle, { color: text }]}>
              {cartSearch ? 'No matching items' : 'Your cart is empty'}
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: muted }]}>
              {cartSearch
                ? 'Try a different search term to find items in your cart.'
                : 'Add pieces to begin a more considered checkout experience.'}
            </ThemedText>
            {!cartSearch ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/(tabs)/search')}
                style={[styles.emptyBrowseButton, { backgroundColor: CART_COLORS.checkoutBtnBg }]}>
                <Ionicons name="sparkles-outline" size={14} color={CART_COLORS.checkoutBtnText} />
                <ThemedText style={[styles.emptyBrowseText, { color: CART_COLORS.checkoutBtnText }]}>
                  Explore products
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={styles.itemsWrap}>
            {displayGroups.map((group, groupIndex) => {
              if (group.kind === 'line') {
                return renderCartLineItem(group.item, groupIndex, false);
              }

              const folderTotal = folderSubtotal(group.items);
              const folderDiscount = folderTotal * 0.1;
              const folderGrand = folderTotal - folderDiscount;
              const expanded = isFolderExpanded(group.categoryKey);

              return (
                <View
                  key={`folder-${group.categoryKey}-${groupIndex}`}
                  style={[
                    styles.folderCard,
                    { backgroundColor: card, borderColor: CART_COLORS.border },
                    luxuryShadow,
                  ]}>
                  <Pressable
                    onPress={() => toggleFolder(group.categoryKey)}
                    style={[styles.folderHeader, { borderBottomColor: CART_COLORS.border, backgroundColor: softSurface }]}>
                    <View style={styles.folderHeaderTop}>
                      <View style={[styles.folderIconWrap, { backgroundColor: card, borderColor: CART_COLORS.border }]}>
                        <Ionicons name="folder-open-outline" size={18} color={text} />
                      </View>
                      <View style={styles.folderHeaderText}>
                        <View style={styles.folderTitleRow}>
                          <ThemedText numberOfLines={1} style={[styles.folderTitle, { color: text }]}>
                            {group.categoryLabel}
                          </ThemedText>
                          <View style={[styles.folderCountPill, { borderColor: CART_COLORS.border, backgroundColor: card }]}>
                            <ThemedText style={[styles.folderCountText, { color: text }]}>
                              {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                            </ThemedText>
                          </View>
                        </View>
                        <ThemedText style={[styles.folderSubtitle, { color: muted }]}>
                          Curated together for a quicker category checkout.
                        </ThemedText>
                      </View>
                      <View style={[styles.folderChevronWrap, { borderColor: CART_COLORS.border, backgroundColor: card }]}>
                        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={muted} />
                      </View>
                    </View>
                    <View style={styles.folderMetricsRow}>
                      <View style={styles.folderMetric}>
                        <ThemedText style={[styles.folderMetricLabel, { color: muted }]}>Folder total</ThemedText>
                        <ThemedText style={[styles.folderMetricValue, { color: text }]}>{money(folderGrand)}</ThemedText>
                      </View>
                      <View style={[styles.folderMetricDivider, { backgroundColor: CART_COLORS.border }]} />
                      <View style={styles.folderMetric}>
                        <ThemedText style={[styles.folderMetricLabel, { color: muted }]}>Adjustment</ThemedText>
                        <ThemedText style={[styles.folderMetricValue, { color: text }]}>-{money(folderDiscount)}</ThemedText>
                      </View>
                      {!expanded ? (
                        <>
                          <View style={[styles.folderMetricDivider, { backgroundColor: CART_COLORS.border }]} />
                          <View style={styles.folderMetric}>
                            <ThemedText style={[styles.folderMetricLabel, { color: muted }]}>State</ThemedText>
                            <ThemedText style={[styles.folderMetricValue, { color: text }]}>Collapsed</ThemedText>
                          </View>
                        </>
                      ) : null}
                    </View>
                  </Pressable>

                  {expanded ? (
                    <View style={styles.folderLines}>
                      {group.items.map((line, lineIndex) => renderCartLineItem(line, lineIndex, true))}
                    </View>
                  ) : null}

                  <View style={[styles.folderFooter, { borderTopColor: CART_COLORS.border }]}>
                    <View style={styles.folderFooterTop}>
                      <View style={styles.folderFooterLeft}>
                        <ThemedText style={[styles.folderTotalCaption, { color: muted }]}>Ready for checkout</ThemedText>
                        <ThemedText style={[styles.folderTotalValue, { color: text }]}>{money(folderGrand)}</ThemedText>
                        <ThemedText style={[styles.folderTotalHint, { color: muted }]}>
                          {money(folderTotal)} subtotal before preferred pricing
                        </ThemedText>
                      </View>
                      <View style={[styles.folderMiniBadge, { borderColor: CART_COLORS.border, backgroundColor: softSurface }]}>
                        <Ionicons name="sparkles-outline" size={13} color={text} />
                        <ThemedText style={[styles.folderMiniBadgeText, { color: text }]}>1 tap</ThemedText>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => handleFolderPlaceOrder(group.items, group.categoryLabel)}
                      disabled={placingOrder}
                      style={[
                        styles.folderPlaceOrderBtn,
                        {
                          backgroundColor: placingOrder ? CART_COLORS.checkoutBtnDisabledBg : CART_COLORS.checkoutBtnBg,
                        },
                      ]}>
                      {placingOrder ? (
                        <ActivityIndicator size="small" color={CART_COLORS.checkoutBtnDisabledText} />
                      ) : (
                        <Ionicons name="bag-check-outline" size={16} color={CART_COLORS.checkoutBtnText} />
                      )}
                      <ThemedText
                        style={[
                          styles.folderPlaceOrderText,
                          {
                            color: placingOrder ? CART_COLORS.checkoutBtnDisabledText : CART_COLORS.checkoutBtnText,
                          },
                        ]}>
                        {placingOrder ? 'Placing…' : 'Place folder order'}
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {state?.smartBundles && state.smartBundles.length > 0 && (
          <SmartBundleSection
            bundles={state.smartBundles}
            onAdd={handleAddRecommendation}
          />
        )}

        {(!state?.smartBundles || state.smartBundles.length === 0) && state?.ranked && state.ranked.length > 0 && (
          <RecommendationSection
            ranked={state.ranked}
            onAdd={handleAddRecommendation}
          />
        )}

        {hasCartItems ? (
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: card, borderColor: CART_COLORS.border },
              luxuryShadow,
            ]}>
            <View style={styles.summaryHeader}>
              <View
                style={[
                  styles.summaryIconWrap,
                  { backgroundColor: softSurface, borderColor: CART_COLORS.border },
                ]}>
                <Ionicons name="receipt-outline" size={16} color={text} />
              </View>
              <View style={styles.summaryHeaderCopy}>
                <ThemedText style={[styles.collectionLabel, { color: muted }]}>Order summary</ThemedText>
                <ThemedText style={[styles.summaryTitle, { color: text }]}>Totals</ThemedText>
              </View>
            </View>

            <View style={[styles.summaryDivider, { backgroundColor: CART_COLORS.border }]} />

            <View style={styles.summaryRowPad}>
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
            </View>

            <View
              style={[
                styles.savingsRow,
                { backgroundColor: softSurface, borderColor: CART_COLORS.border },
              ]}>
              <Ionicons name="diamond-outline" size={14} color={accent} />
              <ThemedText style={[styles.savingsRowLabel, { color: muted }]} numberOfLines={2}>
                Preferred pricing applied
              </ThemedText>
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
        ) : null}
      </ScrollView>

      {hasCartItems ? (
        <View
          style={[
            styles.checkoutWrap,
            { bottom: tabBarClearance },
            { borderColor: CART_COLORS.border, backgroundColor: CART_COLORS.cardBg },
            luxuryShadow,
          ]}>
          <View style={styles.checkoutLeft}>
            <ThemedText style={[styles.checkoutCaption, { color: muted }]}>Estimated total</ThemedText>
            <ThemedText style={[styles.checkoutAmount, { color: text }]}>{money(total)}</ThemedText>
          </View>

          <Pressable
            onPress={handleOpenPayment}
            disabled={placingOrder}
            style={[
              styles.billButtonInline,
              {
                borderColor: 'transparent',
                backgroundColor: placingOrder ? CART_COLORS.checkoutBtnDisabledBg : CART_COLORS.checkoutBtnBg,
              },
            ]}>
            {placingOrder ? (
              <ActivityIndicator size="small" color={CART_COLORS.checkoutBtnDisabledText} />
            ) : (
              <Ionicons name="bag-check-outline" size={17} color={CART_COLORS.checkoutBtnText} />
            )}
            <ThemedText
              style={[
                styles.billText,
                {
                  color: placingOrder ? CART_COLORS.checkoutBtnDisabledText : CART_COLORS.checkoutBtnText,
                },
              ]}>
              {placingOrder ? 'Placing…' : 'Place order'}
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
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
  headerBlock: {
    gap: spacing.md,
    marginBottom: spacing.xxs,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerTopFlex: {
    flex: 1,
  },
  headerCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  headerCountText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  topCopy: {
    gap: 6,
    paddingRight: spacing.xxs,
  },
  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  pageTitle: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 38,
    letterSpacing: 0.2,
  },
  topSub: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 2,
  },
  cartSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.xs,
    ...luxuryShadow,
    shadowOpacity: 0.06,
    elevation: 2,
  },
  skeletonSearchWrap: {
    borderWidth: 0,
  },
  cartSearchInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 15,
    letterSpacing: 0.05,
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
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    ...luxuryShadow,
    shadowOpacity: 0.08,
  },
  iconBadgeWithGap: {
    marginLeft: spacing.xs,
  },
  skeletonHeaderIconGap: {
    marginLeft: spacing.xs,
  },
  errorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    ...luxuryShadow,
    shadowOpacity: 0.04,
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
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    shadowOpacity: 0.06,
    elevation: 2,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
  },
  emptyTitle: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    fontWeight: '600',
  },
  emptyText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyBrowseButton: {
    marginTop: spacing.sm,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyBrowseText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  itemsWrap: {
    gap: spacing.md,
  },
  folderCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowOpacity: 0.06,
    elevation: 2,
  },
  folderHeader: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  folderHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  folderIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderHeaderText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  folderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  folderTitle: {
    flexShrink: 1,
    fontFamily: Fonts.serif,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  folderCountPill: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  folderCountText: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  folderSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  folderChevronWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  folderMetricsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  folderMetric: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  folderMetricLabel: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  folderMetricValue: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.15,
  },
  folderMetricDivider: {
    width: 1,
    alignSelf: 'stretch',
  },
  folderLines: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  folderFooter: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  folderFooterTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  folderFooterLeft: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  folderTotalCaption: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.85,
    fontWeight: '600',
  },
  folderTotalValue: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: '700',
  },
  folderTotalHint: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    marginTop: 2,
  },
  folderMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  folderMiniBadgeText: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  folderPlaceOrderBtn: {
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...luxuryShadow,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  folderPlaceOrderText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  itemCardNested: {
    shadowOpacity: 0,
    elevation: 0,
  },
  skeletonItemsWrap: {
    gap: spacing.md,
  },
  itemCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    shadowOpacity: 0.06,
    elevation: 2,
  },
  skeletonItemCard: {
    borderWidth: 0,
    ...luxuryShadow,
  },
  skeletonItemBody: {
    flex: 1,
    gap: spacing.xs,
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
    width: 96,
    height: 118,
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
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
  },
  itemPriceCol: {
    alignItems: 'flex-end',
    gap: 2,
    maxWidth: '42%',
  },
  itemLineTotal: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.15,
  },
  itemUnitMeta: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '500',
  },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  qtyPill: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
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
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    shadowOpacity: 0.06,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    marginVertical: spacing.xs,
  },
  summaryRowPad: {
    gap: 10,
  },
  skeletonSummaryCard: {
    borderWidth: 0,
    ...luxuryShadow,
  },
  summaryTitle: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
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
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savingsRowLabel: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    marginRight: spacing.xs,
  },
  savingsValue: {
    marginLeft: 'auto',
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: '600',
  },
  totalValue: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    fontWeight: '700',
  },
  taxNote: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 17,
  },
  checkoutWrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    shadowOpacity: 0.12,
    elevation: 8,
  },
  skeletonCheckoutWrap: {
    borderWidth: 0,
    justifyContent: 'space-between',
  },
  checkoutLeft: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  checkoutCaption: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.85,
    fontWeight: '600',
  },
  checkoutAmount: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    fontWeight: '700',
  },
  billButtonInline: {
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...luxuryShadow,
    shadowOpacity: 0.14,
    elevation: 3,
  },
  billText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
