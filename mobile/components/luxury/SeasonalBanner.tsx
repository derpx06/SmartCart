import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/luxury/AnimatedPressable';
import { luxuryShadow, radius, spacing } from '@/components/luxury/design';
import { SkeletonBlock } from '@/components/luxury/SkeletonBlock';
import { Fonts } from '@/constants/theme';

type SeasonalBannerProps = {
  loading?: boolean;
};

const SEASON_COLORS = {
  bg: '#E9E9E7',
  border: 'rgba(28, 27, 31, 0.14)',
  text: '#1C1B1F',
  muted: 'rgba(28, 27, 31, 0.68)',
};

export function SeasonalBanner({ loading = false }: SeasonalBannerProps) {
  if (loading) {
    return <SkeletonBlock height={148} borderRadius={radius.xl} />;
  }

  return (
    <AnimatedPressable>
      <View
        style={[
          styles.banner,
          {
            backgroundColor: SEASON_COLORS.bg,
            borderColor: SEASON_COLORS.border,
          },
          luxuryShadow,
        ]}>
        <View style={styles.copyWrap}>
          <Text style={[styles.eyebrow, { color: SEASON_COLORS.text }]}>Seasonal Atelier</Text>
          <Text style={[styles.title, { color: SEASON_COLORS.text }]}>Spring Entertaining Curations</Text>
          <Text style={[styles.subtitle, { color: SEASON_COLORS.muted }]}>
            Quietly elegant pieces for refined hosting.
          </Text>
        </View>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=900&q=80',
          }}
          style={styles.image}
          contentFit="cover"
          transition={450}
        />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.xl,
    backgroundColor: 'transparent',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  copyWrap: {
    flex: 1,
    gap: 7,
  },
  eyebrow: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
  image: {
    width: 92,
    height: 112,
    borderRadius: radius.md,
  },
});
