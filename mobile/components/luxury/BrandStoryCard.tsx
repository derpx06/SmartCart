import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/luxury/AnimatedPressable';
import { luxuryShadow, radius, spacing } from '@/components/luxury/design';
import { SkeletonBlock } from '@/components/luxury/SkeletonBlock';
import { Fonts } from '@/constants/theme';

type BrandStoryCardProps = {
  loading?: boolean;
};

const STORY_COLORS = {
  cardBg: '#FFFFFF',
  border: 'rgba(28, 27, 31, 0.14)',
  imageOverlay: 'rgba(28, 27, 31, 0.42)',
  kickerBg: '#FFFFFF',
  kickerText: '#1C1B1F',
  text: '#1C1B1F',
  muted: 'rgba(28, 27, 31, 0.68)',
  ctaBorder: 'rgba(28, 27, 31, 0.14)',
};

export function BrandStoryCard({ loading = false }: BrandStoryCardProps) {
  if (loading) {
    return <SkeletonBlock height={180} borderRadius={radius.xl} />;
  }

  return (
    <AnimatedPressable>
      <View
        style={[
          styles.card,
          {
            backgroundColor: STORY_COLORS.cardBg,
            borderColor: STORY_COLORS.border,
          },
          luxuryShadow,
        ]}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1506372023823-741c83b836fe?auto=format&fit=crop&w=900&q=80',
          }}
          style={styles.image}
          contentFit="cover"
          transition={500}
        />
        <View style={[styles.imageOverlay, { backgroundColor: STORY_COLORS.imageOverlay }]} />
        <View style={[styles.kickerWrap, { backgroundColor: STORY_COLORS.kickerBg }]}>
          <Text style={[styles.kicker, { color: STORY_COLORS.kickerText }]}>OUR PHILOSOPHY</Text>
        </View>
        <View style={styles.copyWrap}>
          <Text style={[styles.title, { color: STORY_COLORS.text }]}>Crafted For A Lifetime</Text>
          <Text style={[styles.copy, { color: STORY_COLORS.muted }]}>
            Every material is selected for performance, touch, and longevity. Our pieces are built to
            age beautifully in modern homes.
          </Text>
          <View style={[styles.ctaRow, { borderTopColor: STORY_COLORS.ctaBorder }]}>
            <Text style={[styles.ctaText, { color: STORY_COLORS.text }]}>Discover our craftsmanship</Text>
            <Text style={[styles.ctaArrow, { color: STORY_COLORS.text }]}>{'->'}</Text>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  image: {
    width: '100%',
    height: 132,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    height: 132,
    backgroundColor: 'transparent',
  },
  kickerWrap: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'transparent',
  },
  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  copyWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: 10,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    lineHeight: 31,
  },
  copy: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 21,
  },
  ctaRow: {
    marginTop: 2,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.25,
  },
  ctaArrow: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    lineHeight: 18,
  },
});
