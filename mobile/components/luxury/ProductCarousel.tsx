import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/luxury/AnimatedPressable';
import { luxuryShadow, radius, spacing } from '@/components/luxury/design';
import { SectionTitle } from '@/components/luxury/SectionTitle';
import { SkeletonBlock } from '@/components/luxury/SkeletonBlock';
import { ProductItem } from '@/data/luxuryHomeData';
import { Fonts } from '@/constants/theme';

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
};

export function ProductCarousel({
  title,
  caption,
  products,
  loading = false,
  onPressProduct,
}: ProductCarouselProps) {
  return (
    <View>
      <SectionTitle title={title} caption={caption} />

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
              <SkeletonBlock height={145} borderRadius={radius.md} />
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
          {products.map((product) => (
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
                  luxuryShadow,
                ]}>
                <View style={styles.imageWrap}>
                  <Image
                    source={{ uri: product.image }}
                    style={styles.image}
                    contentFit="cover"
                    transition={450}
                  />
                  <View style={[styles.featureChip, { backgroundColor: PRODUCT_COLORS.featureBg }]}>
                    <Text style={[styles.featureText, { color: PRODUCT_COLORS.featureText }]}>NEW</Text>
                  </View>
                  <View
                    style={[
                      styles.wishlistChip,
                      {
                        backgroundColor: PRODUCT_COLORS.wishlistBg,
                        borderColor: PRODUCT_COLORS.line,
                      },
                    ]}>
                    <Ionicons name="heart-outline" size={16} color={PRODUCT_COLORS.text} />
                  </View>
                </View>
                <View style={styles.content}>
                  <Text style={[styles.name, { color: PRODUCT_COLORS.text }]} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={[styles.price, { color: PRODUCT_COLORS.text }]}>{product.price}</Text>
                  <View style={[styles.ratingRow, { backgroundColor: PRODUCT_COLORS.softSurface, borderColor: PRODUCT_COLORS.line }]}>
                    <Ionicons name="star" size={13} color={PRODUCT_COLORS.star} />
                    <Text style={[styles.rating, { color: PRODUCT_COLORS.muted }]}>
                      {product.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </AnimatedPressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonRow: {
    paddingRight: spacing.xl,
  },
  skeletonCard: {
    width: 188,
    marginRight: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  skeletonLine: {
    marginTop: spacing.xs,
  },
  scrollContent: {
    paddingRight: spacing.xl,
  },
  cardWrap: {
    width: 188,
    marginRight: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
    backgroundColor: 'transparent',
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  imageWrap: {
    height: 145,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  featureChip: {
    position: 'absolute',
    left: spacing.xs,
    top: spacing.xs,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  featureText: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    letterSpacing: 0.8,
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
    width: 30,
    height: 30,
    borderRadius: 30,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginTop: spacing.sm,
    gap: 8,
  },
  name: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 40,
  },
  price: {
    fontFamily: Fonts.sans,
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  rating: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
  },
});
