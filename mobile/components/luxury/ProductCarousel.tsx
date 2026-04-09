import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/luxury/AnimatedPressable';
import { luxuryShadow, radius, spacing, useLuxuryPalette } from '@/components/luxury/design';
import { SectionTitle } from '@/components/luxury/SectionTitle';
import { SkeletonBlock } from '@/components/luxury/SkeletonBlock';
import { ProductItem } from '@/data/luxuryHomeData';
import { Fonts } from '@/constants/theme';

type ProductCarouselProps = {
  title: string;
  caption?: string;
  products: ProductItem[];
  loading?: boolean;
};

export function ProductCarousel({
  title,
  caption,
  products,
  loading = false,
}: ProductCarouselProps) {
  const luxuryPalette = useLuxuryPalette();

  return (
    <View>
      <SectionTitle title={title} caption={caption} />

      {loading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.skeletonRow}>
          {[1, 2].map((item) => (
            <View key={item} style={[styles.skeletonCard, { backgroundColor: luxuryPalette.elevated }]}>
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
            <AnimatedPressable key={product.id} containerStyle={styles.cardWrap}>
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: luxuryPalette.elevated,
                    borderColor: luxuryPalette.line,
                  },
                ]}>
                <View style={styles.imageWrap}>
                  <Image
                    source={{ uri: product.image }}
                    style={styles.image}
                    contentFit="cover"
                    transition={450}
                  />
                  <View style={[styles.wishlistChip, { backgroundColor: luxuryPalette.wishlistChip }]}>
                    <Ionicons name="heart-outline" size={16} color={luxuryPalette.text} />
                  </View>
                </View>
                <View style={styles.content}>
                  <Text style={[styles.name, { color: luxuryPalette.text }]} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={[styles.price, { color: luxuryPalette.text }]}>{product.price}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color={luxuryPalette.gold} />
                    <Text style={[styles.rating, { color: luxuryPalette.mutedText }]}>
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
    paddingRight: spacing.lg,
  },
  skeletonCard: {
    width: 188,
    marginRight: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
  },
  skeletonLine: {
    marginTop: spacing.xs,
  },
  scrollContent: {
    paddingRight: spacing.lg,
  },
  cardWrap: {
    width: 188,
    marginRight: spacing.sm,
  },
  card: {
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#F0E5D8',
    ...luxuryShadow,
  },
  imageWrap: {
    height: 145,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
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
    backgroundColor: '#FFF8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginTop: spacing.sm,
    gap: 6,
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
  },
  rating: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
  },
});
