import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { luxuryShadow, radius, spacing } from '@/components/luxury/design';
import { FLOATING_TAB_BAR_HEIGHT, getFloatingTabBarBottomOffset } from '@/components/navigation/FloatingTabBar';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useWishlistStore, type WishlistItem } from '@/store/wishlist-store';

const WISHLIST_COLORS = {
  background: '#FFFFFF',
  card: '#FFFFFF',
  soft: '#E9E9E7',
  text: '#1C1B1F',
  muted: 'rgba(28, 27, 31, 0.68)',
  line: 'rgba(28, 27, 31, 0.14)',
  danger: '#c52b2b',
  orbOne: 'rgba(28, 27, 31, 0.08)',
  orbTwo: 'rgba(233, 233, 231, 0.72)',
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

function formatAddedAt(date?: string) {
  if (!date) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';

  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function WishlistCard({
  item,
  syncing,
  onRemove,
  onOpen,
}: {
  item: WishlistItem;
  syncing: boolean;
  onRemove: (productId: string) => void;
  onOpen: (item: WishlistItem) => void;
}) {
  const canOpen = Boolean(item.slug?.trim());
  const addedText = formatAddedAt(item.addedAt);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: WISHLIST_COLORS.card, borderColor: WISHLIST_COLORS.line },
        luxuryShadow,
      ]}>
      <Pressable
        disabled={!canOpen}
        onPress={() => onOpen(item)}
        style={({ pressed }) => [styles.cardMain, canOpen && pressed ? styles.cardPressed : null]}>
        <View style={[styles.imageWrap, { backgroundColor: WISHLIST_COLORS.soft }]}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
          ) : (
            <ThemedText style={styles.imageFallbackText}>{initials(item.name)}</ThemedText>
          )}
        </View>

        <View style={styles.cardBody}>
          <ThemedText numberOfLines={1} style={[styles.category, { color: WISHLIST_COLORS.muted }]}>
            {item.category || 'Saved item'}
          </ThemedText>
          <ThemedText numberOfLines={2} style={[styles.name, { color: WISHLIST_COLORS.text }]}>
            {item.name}
          </ThemedText>
          <View style={styles.cardMetaRow}>
            <ThemedText style={[styles.price, { color: WISHLIST_COLORS.text }]}>{money(item.price)}</ThemedText>
            {addedText ? (
              <ThemedText style={[styles.addedAt, { color: WISHLIST_COLORS.muted }]}>{addedText}</ThemedText>
            ) : null}
          </View>
        </View>
      </Pressable>

      <Pressable
        onPress={() => onRemove(item.productId)}
        disabled={syncing}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.name} from wishlist`}
        style={({ pressed }) => [
          styles.removeIconButton,
          { backgroundColor: WISHLIST_COLORS.soft, borderColor: WISHLIST_COLORS.line },
          pressed ? styles.removeIconButtonPressed : null,
          syncing ? styles.removeIconButtonDisabled : null,
        ]}>
        {syncing ? (
          <ActivityIndicator size="small" color={WISHLIST_COLORS.text} />
        ) : (
          <Ionicons name="close" size={18} color={WISHLIST_COLORS.muted} />
        )}
      </Pressable>
    </View>
  );
}

export default function WishlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items = useWishlistStore((state) => state.items);
  const loading = useWishlistStore((state) => state.loading);
  const hasLoaded = useWishlistStore((state) => state.hasLoaded);
  const error = useWishlistStore((state) => state.error);
  const syncingIds = useWishlistStore((state) => state.syncingIds);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  const removeWishlistItem = useWishlistStore((state) => state.removeWishlistItem);
  const [refreshing, setRefreshing] = useState(false);

  const tabBarClearance = getFloatingTabBarBottomOffset(insets.bottom) + FLOATING_TAB_BAR_HEIGHT + spacing.md;

  useEffect(() => {
    if (hasLoaded) return;
    void fetchWishlist();
  }, [hasLoaded, fetchWishlist]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchWishlist({ silent: true });
    } finally {
      setRefreshing(false);
    }
  }, [fetchWishlist]);

  const handleOpenItem = (item: WishlistItem) => {
    const slug = item.slug?.trim();
    if (!slug) return;
    router.push(`/product/${encodeURIComponent(slug)}`);
  };

  const handleRemove = (productId: string) => {
    void removeWishlistItem(productId);
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)');
    }
  };

  const showLoading = !hasLoaded || (loading && items.length === 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: WISHLIST_COLORS.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={WISHLIST_COLORS.text}
            colors={[WISHLIST_COLORS.text]}
          />
        }
        bounces>
        <View pointerEvents="none" style={styles.atmosphereLayer}>
          <View style={[styles.orbOne, { backgroundColor: WISHLIST_COLORS.orbOne }]} />
          <View style={[styles.orbTwo, { backgroundColor: WISHLIST_COLORS.orbTwo }]} />
        </View>

        <View style={styles.headerBlock}>
          <View style={styles.headerTopRow}>
            <Pressable
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={[
                styles.backButton,
                { backgroundColor: WISHLIST_COLORS.card, borderColor: WISHLIST_COLORS.line },
              ]}>
              <Ionicons name="chevron-back" size={22} color={WISHLIST_COLORS.text} />
            </Pressable>
            {items.length > 0 ? (
              <View style={[styles.countPill, { backgroundColor: WISHLIST_COLORS.soft, borderColor: WISHLIST_COLORS.line }]}>
                <ThemedText style={[styles.countPillText, { color: WISHLIST_COLORS.text }]}>
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </ThemedText>
              </View>
            ) : (
              <View style={styles.headerTopSpacer} />
            )}
          </View>

          <View style={styles.headerCopy}>
            <ThemedText style={[styles.kicker, { color: WISHLIST_COLORS.muted }]}>Saved for later</ThemedText>
            <ThemedText style={[styles.title, { color: WISHLIST_COLORS.text }]}>Wishlist</ThemedText>
            <ThemedText style={[styles.subtitle, { color: WISHLIST_COLORS.muted }]}>
              {items.length === 0
                ? 'Heart products while you browse and open them here anytime.'
                : 'Tap a card to view details, or remove pieces you are no longer considering.'}
            </ThemedText>
          </View>
        </View>

        {error ? (
          <View style={[styles.errorCard, { borderColor: WISHLIST_COLORS.danger, backgroundColor: WISHLIST_COLORS.card }]}>
            <Ionicons name="alert-circle-outline" size={18} color={WISHLIST_COLORS.danger} />
            <ThemedText style={[styles.errorText, { color: WISHLIST_COLORS.danger }]}>{error}</ThemedText>
            <Pressable
              onPress={() => void fetchWishlist()}
              style={[styles.retryButton, { borderColor: WISHLIST_COLORS.line, backgroundColor: WISHLIST_COLORS.soft }]}>
              <ThemedText style={[styles.retryText, { color: WISHLIST_COLORS.text }]}>Retry</ThemedText>
            </Pressable>
          </View>
        ) : null}

        {showLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={WISHLIST_COLORS.text} />
            <ThemedText style={[styles.loadingText, { color: WISHLIST_COLORS.muted }]}>Loading your wishlist…</ThemedText>
          </View>
        ) : null}

        {!showLoading && !error && items.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: WISHLIST_COLORS.card, borderColor: WISHLIST_COLORS.line }]}>
            <View style={[styles.emptyIconWrap, { backgroundColor: WISHLIST_COLORS.soft }]}>
              <Ionicons name="heart-outline" size={28} color={WISHLIST_COLORS.muted} />
            </View>
            <ThemedText style={[styles.emptyTitle, { color: WISHLIST_COLORS.text }]}>No saved products yet</ThemedText>
            <ThemedText style={[styles.emptyBody, { color: WISHLIST_COLORS.muted }]}>
              Tap the heart on any product to add it to your wishlist.
            </ThemedText>
          </View>
        ) : null}

        {!showLoading && items.length > 0 ? (
          <View style={styles.listWrap}>
            {items.map((item) => (
              <WishlistCard
                key={item.productId}
                item={item}
                syncing={syncingIds.includes(item.productId)}
                onRemove={handleRemove}
                onOpen={handleOpenItem}
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
    paddingTop: spacing.sm,
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
    top: 8,
    right: -58,
    width: 168,
    height: 168,
    borderRadius: 168,
    opacity: 0.42,
  },
  orbTwo: {
    position: 'absolute',
    top: 84,
    left: -62,
    width: 176,
    height: 176,
    borderRadius: 176,
    opacity: 0.24,
  },
  headerBlock: {
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTopSpacer: {
    width: 44,
    height: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    ...luxuryShadow,
    shadowOpacity: 0.08,
  },
  countPill: {
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  countPillText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerCopy: {
    gap: 6,
    paddingRight: spacing.xs,
  },
  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 38,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 2,
  },
  errorCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.sm,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  errorText: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  retryText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  loadingWrap: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: Fonts.serif,
    fontSize: 24,
  },
  emptyBody: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  listWrap: {
    gap: spacing.md,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.xl,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minWidth: 0,
  },
  cardPressed: {
    opacity: 0.9,
  },
  imageWrap: {
    width: 96,
    height: 118,
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallbackText: {
    fontFamily: Fonts.serif,
    fontSize: 23,
    color: WISHLIST_COLORS.text,
  },
  cardBody: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
    minWidth: 0,
    paddingVertical: 4,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  category: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.85,
    fontWeight: '700',
  },
  name: {
    fontFamily: Fonts.serif,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
  },
  price: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  addedAt: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '500',
  },
  removeIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIconButtonPressed: {
    opacity: 0.88,
  },
  removeIconButtonDisabled: {
    opacity: 0.55,
  },
});
