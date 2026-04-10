import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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
    <View style={[styles.card, { backgroundColor: WISHLIST_COLORS.card, borderColor: WISHLIST_COLORS.line }, luxuryShadow]}>
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
          <ThemedText style={[styles.price, { color: WISHLIST_COLORS.text }]}>{money(item.price)}</ThemedText>
          {addedText ? (
            <ThemedText style={[styles.addedAt, { color: WISHLIST_COLORS.muted }]}>Saved {addedText}</ThemedText>
          ) : null}
        </View>
      </Pressable>

      <Pressable
        onPress={() => onRemove(item.productId)}
        disabled={syncing}
        style={({ pressed }) => [
          styles.removeButton,
          { backgroundColor: WISHLIST_COLORS.soft, borderColor: WISHLIST_COLORS.line },
          pressed ? styles.removeButtonPressed : null,
          syncing ? styles.removeButtonDisabled : null,
        ]}>
        <Ionicons name="heart" size={15} color="#D14862" />
        <ThemedText style={[styles.removeText, { color: WISHLIST_COLORS.text }]}>Saved</ThemedText>
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

        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <ThemedText style={[styles.kicker, { color: WISHLIST_COLORS.text }]}>Account</ThemedText>
            <ThemedText style={[styles.title, { color: WISHLIST_COLORS.text }]}>Wishlist</ThemedText>
            <ThemedText style={[styles.subtitle, { color: WISHLIST_COLORS.muted }]}>
              {items.length === 0 ? 'Save products you love and revisit them anytime.' : `${items.length} saved ${items.length === 1 ? 'item' : 'items'}.`}
            </ThemedText>
          </View>
          <View style={[styles.iconBadge, { borderColor: WISHLIST_COLORS.line, backgroundColor: WISHLIST_COLORS.card }]}>
            <Ionicons name="heart-outline" size={18} color={WISHLIST_COLORS.text} />
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
            <ThemedText style={[styles.loadingText, { color: WISHLIST_COLORS.muted }]}>Loading your wishlist...</ThemedText>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerCopy: {
    maxWidth: 280,
    gap: 4,
  },
  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 36,
    fontWeight: '600',
    lineHeight: 40,
  },
  subtitle: {
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
    gap: spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  cardMain: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cardPressed: {
    opacity: 0.9,
  },
  imageWrap: {
    width: 88,
    height: 108,
    borderRadius: radius.md,
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
    gap: 5,
    justifyContent: 'center',
  },
  category: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  name: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    lineHeight: 24,
  },
  price: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '600',
  },
  addedAt: {
    fontFamily: Fonts.sans,
    fontSize: 11,
  },
  removeButton: {
    borderWidth: 1,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    gap: 6,
  },
  removeButtonPressed: {
    opacity: 0.85,
  },
  removeButtonDisabled: {
    opacity: 0.6,
  },
  removeText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
