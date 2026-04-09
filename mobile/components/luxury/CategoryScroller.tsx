import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/luxury/AnimatedPressable';
import { radius, spacing } from '@/components/luxury/design';
import { SectionTitle } from '@/components/luxury/SectionTitle';
import { SkeletonBlock } from '@/components/luxury/SkeletonBlock';
import { CategoryItem } from '@/data/luxuryHomeData';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type CategoryScrollerProps = {
  categories: CategoryItem[];
  loading?: boolean;
};

export function CategoryScroller({ categories, loading = false }: CategoryScrollerProps) {
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const background = useThemeColor({}, 'background');

  return (
    <View>
      <SectionTitle title="Shop By Category" caption="Curated essentials for the heart of your home." />

      {loading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.loadingRow}>
          {[1, 2, 3].map((item) => (
            <SkeletonBlock key={item} width={130} height={156} borderRadius={radius.lg} />
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {categories.map((category) => (
            <AnimatedPressable key={category.id} containerStyle={styles.cardWrap}>
              <View style={[styles.card, { backgroundColor: card }]}>
                <Image source={{ uri: category.image }} style={styles.image} contentFit="cover" transition={450} />
                <View style={[styles.tint, { backgroundColor: background, opacity: 0.2 }]} />
                <Text style={[styles.label, { color: text }]}>{category.title}</Text>
              </View>
            </AnimatedPressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  scrollContent: {
    paddingRight: spacing.lg,
  },
  cardWrap: {
    marginRight: spacing.sm,
  },
  card: {
    width: 130,
    height: 156,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
  },
  label: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
