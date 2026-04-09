import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/luxury/AnimatedPressable';
import { luxuryShadow, radius, spacing, useLuxuryPalette } from '@/components/luxury/design';
import { SkeletonBlock } from '@/components/luxury/SkeletonBlock';
import { Fonts } from '@/constants/theme';

type SeasonalBannerProps = {
  loading?: boolean;
};

export function SeasonalBanner({ loading = false }: SeasonalBannerProps) {
  const luxuryPalette = useLuxuryPalette();

  if (loading) {
    return <SkeletonBlock height={148} borderRadius={radius.xl} />;
  }

  return (
    <AnimatedPressable>
      <View
        style={[
          styles.banner,
          {
            backgroundColor: luxuryPalette.seasonalBg,
            borderColor: luxuryPalette.seasonalBorder,
          },
        ]}>
        <View style={styles.copyWrap}>
          <Text style={[styles.eyebrow, { color: luxuryPalette.gold }]}>Seasonal Atelier</Text>
          <Text style={[styles.title, { color: luxuryPalette.text }]}>Spring Entertaining Curations</Text>
          <Text style={[styles.subtitle, { color: luxuryPalette.mutedText }]}>
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
    backgroundColor: '#F4EADC',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#E9DBC7',
    ...luxuryShadow,
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
