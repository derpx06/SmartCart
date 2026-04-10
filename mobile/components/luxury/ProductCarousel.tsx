import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/luxury/AnimatedPressable';
import { luxuryShadow, radius, spacing } from '@/components/luxury/design';
import { SkeletonBlock } from '@/components/luxury/SkeletonBlock';
import { ProductItem } from '@/data/luxuryHomeData';
import { Fonts } from '@/constants/theme';
import { useWishlistStore } from '@/store/wishlist-store';

type ProductCarouselProps = {
  title: string;
  caption?: string;
  products: ProductItem[];
  loading?: boolean;
  onPressProduct?: (product: ProductItem) => void;
};

const PRODUCT_COLORS = {
  cardBg: '#FFFFFF',
  line: 'rgba(28, 27, 31, 0.14)',
  text: '#1C1B1F',
  muted: 'rgba(28, 27, 31, 0.68)',
  softSurface: '#E9E9E7',
  featureBg: '#1C1B1F',
  featureText: '#FFFFFF',
  wishlistBg: '#FFFFFF',
  star: '#1C1B1F',
  imageOverlay: 'rgba(28, 27, 31, 0.06)',
};

function normalizeRowKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
}

function getRowPresentation(title: string, caption?: string) {
  const key = normalizeRowKey(title);
  let icon: keyof typeof Ionicons.glyphMap = 'sparkles-outline';
  let badge: string | null = null;
  let fallbackCaption = '';

  if (key.includes('bestseller')) {
    icon = 'trophy-outline';
    badge = 'Most loved';
    fallbackCaption = 'Customer favorites that are moving quickly right now.';
  } else if (key.includes('kitchen')) {
    icon = 'restaurant-outline';
    badge = 'Curated';
    fallbackCaption = 'Pieces that pair with how you cook, prep, and host.';
  } else if (key.includes('premium')) {
    icon = 'diamond-outline';
    badge = 'Premium';
    fallbackCaption = 'Elevated essentials chosen for standout quality.';
  } else if (key.includes('fast delivery')) {
    icon = 'flash-outline';
    badge = 'Quick ship';
    fallbackCaption = 'In-stock picks that can head out on a faster timeline.';
  } else if (key.includes('complete setup') || key.includes('complete your setup')) {
    icon = 'layers-outline';
    badge = 'Room-ready';
    fallbackCaption = 'Coordinated add-ons to finish the look.';
  }

  const effectiveCaption = caption?.trim() || fallbackCaption;
  return { icon, badge, effectiveCaption };
}

export function ProductCarousel({
  title,
  caption,
  products,
  loading = false,
  onPressProduct,
}: ProductCarouselProps) {
  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistLoaded = useWishlistStore((state) => state.hasLoaded);
  const syncingIds = useWishlistStore((state) => state.syncingIds);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  const toggleWishlistItem = useWishlistStore((state) => state.toggleWishlistItem);

  const { icon: rowIcon, badge: rowBadge, effectiveCaption } = getRowPresentation(title, caption);

  useEffect(() => {
    if (wishlistLoaded) return;
    void fetchWishlist({ silent: true });
  }, [wishlistLoaded, fetchWishlist]);

  return (
    <View>
      <View
        style={[
          styles.rowHeaderCard,
          {
            backgroundColor: PRODUCT_COLORS.cardBg,
            borderColor: PRODUCT_COLORS.line,
          },
        ]}>
        <View style={styles.rowHeadingTop}>
          <View
            style={[
              styles.rowIconWrap,
              { backgroundColor: PRODUCT_COLORS.softSurface, borderColor: PRODUCT_COLORS.line },
            ]}>
            <Ionicons name={rowIcon} size={15} color={PRODUCT_COLORS.text} />
          </View>
          {rowBadge ? (
            <View
              style={[
                styles.rowBadge,
                { backgroundColor: PRODUCT_COLORS.softSurface, borderColor: PRODUCT_COLORS.line },
              ]}>
              <Text style={[styles.rowBadgeText, { color: PRODUCT_COLORS.text }]}>{rowBadge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.rowTitle, { color: PRODUCT_COLORS.text }]}>{title}</Text>
        {effectiveCaption ? (
          <Text style={[styles.rowSubtitle, { color: PRODUCT_COLORS.muted }]}>{effectiveCaption}</Text>
        ) : null}
      </View>

      {loading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.skeletonRow}>
          {[1, 2].map((item) => (
            <View
              key={item}
              style={[
                styles.skeletonCard,
                {
                  backgroundColor: PRODUCT_COLORS.cardBg,
                  borderColor: PRODUCT_COLORS.line,
                },
              ]}>
              <SkeletonBlock height={126} borderRadius={radius.md} />
              <SkeletonBlock height={16} width="80%" style={styles.skeletonLine} />
              <SkeletonBlock height={16} width="42%" style={styles.skeletonLine} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {products.map((product) => {
            const wishlisted = wishlistItems.some((item) => item.productId === product.id);
            const syncing = syncingIds.includes(product.id);

            return (
              <AnimatedPressable
                key={product.id}
                containerStyle={styles.cardWrap}
                onPress={() => onPressProduct?.(product)}>
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: PRODUCT_COLORS.cardBg,
                      borderColor: PRODUCT_COLORS.line,
                    },
                  ]}>
                  <View style={[styles.imageWrap, { backgroundColor: PRODUCT_COLORS.softSurface }]}>
                    <Image
                      source={{ uri: product.image }}
                      style={styles.image}
                      contentFit="cover"
                      transition={450}
                    />
                    <View style={[styles.imageOverlay, { backgroundColor: PRODUCT_COLORS.imageOverlay }]} />
                    <View style={[styles.featureChip, { backgroundColor: PRODUCT_COLORS.featureBg }]}>
                      <Text style={[styles.featureText, { color: PRODUCT_COLORS.featureText }]}>NEW</Text>
                    </View>
                    <Pressable
                      style={[
                        styles.wishlistChip,
                        {
                          backgroundColor: PRODUCT_COLORS.wishlistBg,
                          borderColor: PRODUCT_COLORS.line,
                        },
                        syncing ? styles.wishlistChipDisabled : null,
                      ]}
                      onPress={(event) => {
                        event.stopPropagation();
                        void toggleWishlistItem(product.id);
                      }}
                      disabled={syncing}
                      accessibilityRole="button"
                      accessibilityLabel={
                        wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`
                      }>
                      <Ionicons
                        name={wishlisted ? 'heart' : 'heart-outline'}
                        size={16}
                        color={wishlisted ? '#D14862' : PRODUCT_COLORS.text}
                      />
                    </Pressable>
                  </View>
                  <View style={styles.content}>
                    <Text style={[styles.name, { color: PRODUCT_COLORS.text }]} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={[styles.price, { color: PRODUCT_COLORS.text }]}>{product.price}</Text>
                    <View
                      style={[
                        styles.ratingRow,
                        { backgroundColor: PRODUCT_COLORS.softSurface, borderColor: PRODUCT_COLORS.line },
                      ]}>
                      <Ionicons name="star" size={12} color={PRODUCT_COLORS.star} />
                      <Text style={[styles.rating, { color: PRODUCT_COLORS.muted }]}>
                        {product.rating.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              </AnimatedPressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rowHeaderCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    gap: 6,
  },
  rowHeadingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBadge: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rowBadgeText: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.65,
  },
  rowTitle: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
  },
  rowSubtitle: {
    marginTop: 2,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
  skeletonRow: {
    paddingLeft: 0,
    paddingRight: spacing.xl,
    gap: spacing.md,
  },
  skeletonCard: {
    width: 174,
    marginRight: spacing.md,
    padding: 11,
    borderRadius: radius.lg,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  skeletonLine: {
    marginTop: spacing.xs,
  },
  scrollContent: {
    paddingLeft: 0,
    paddingRight: spacing.xl,
    gap: spacing.md,
  },
  cardWrap: {
    width: 174,
    marginRight: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
    backgroundColor: 'transparent',
    padding: 11,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 9,
    ...luxuryShadow,
    shadowOpacity: 0.05,
    elevation: 2,
  },
  imageWrap: {
    height: 126,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  featureChip: {
    position: 'absolute',
    left: spacing.xs,
    top: spacing.xs,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  featureText: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    letterSpacing: 0.9,
    fontWeight: '700',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistChip: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    ...luxuryShadow,
    shadowOpacity: 0.12,
    elevation: 3,
  },
  wishlistChipDisabled: {
    opacity: 0.6,
  },
  content: {
    gap: 6,
  },
  name: {
    fontFamily: Fonts.serif,
    fontSize: 15,
    lineHeight: 19,
    minHeight: 38,
    fontWeight: '600',
  },
  price: {
    fontFamily: Fonts.sans,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
  },
  rating: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
  },
});
