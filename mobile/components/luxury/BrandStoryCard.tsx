import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/luxury/AnimatedPressable';
import { luxuryShadow, palette, radius, spacing } from '@/components/luxury/design';
import { SkeletonBlock } from '@/components/luxury/SkeletonBlock';
import { Fonts } from '@/constants/theme';

type BrandStoryCardProps = {
  loading?: boolean;
};

export function BrandStoryCard({ loading = false }: BrandStoryCardProps) {
  if (loading) {
    return <SkeletonBlock height={180} borderRadius={radius.xl} />;
  }

  return (
    <AnimatedPressable>
      <View style={styles.card}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1506372023823-741c83b836fe?auto=format&fit=crop&w=900&q=80',
          }}
          style={styles.image}
          contentFit="cover"
          transition={500}
        />
        <View style={styles.copyWrap}>
          <Text style={styles.title}>Crafted For A Lifetime</Text>
          <Text style={styles.copy}>
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
    backgroundColor: palette.elevated,
    borderWidth: 1,
    borderColor: '#EFE3D5',
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
    color: palette.text,
    fontFamily: Fonts.serif,
    fontSize: 24,
    lineHeight: 28,
  },
  copy: {
    color: palette.mutedText,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
});
