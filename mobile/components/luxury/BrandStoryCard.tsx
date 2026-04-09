import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/luxury/AnimatedPressable';
import { luxuryShadow, radius, spacing, useLuxuryPalette } from '@/components/luxury/design';
import { SkeletonBlock } from '@/components/luxury/SkeletonBlock';
import { Fonts } from '@/constants/theme';

type BrandStoryCardProps = {
  loading?: boolean;
};

export function BrandStoryCard({ loading = false }: BrandStoryCardProps) {
  const luxuryPalette = useLuxuryPalette();

  if (loading) {
    return <SkeletonBlock height={180} borderRadius={radius.xl} />;
  }

  return (
    <AnimatedPressable>
      <View
        style={[
          styles.card,
          {
            backgroundColor: luxuryPalette.elevated,
            borderColor: luxuryPalette.line,
          },
        ]}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1506372023823-741c83b836fe?auto=format&fit=crop&w=900&q=80',
          }}
          style={styles.image}
          contentFit="cover"
          transition={500}
        />
        <View style={styles.copyWrap}>
          <Text style={[styles.title, { color: luxuryPalette.text }]}>Crafted For A Lifetime</Text>
          <Text style={[styles.copy, { color: luxuryPalette.mutedText }]}>
            Every material is selected for performance, touch, and longevity. Our pieces are built to
            age beautifully in modern homes.
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000',
    ...luxuryShadow,
  },
  image: {
    width: '100%',
    height: 110,
  },
  copyWrap: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: 8,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    lineHeight: 28,
  },
  copy: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
});
