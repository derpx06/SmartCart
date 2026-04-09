import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/luxury/AnimatedPressable';
import { luxuryShadow, radius, spacing, useLuxuryPalette } from '@/components/luxury/design';
import { SectionTitle } from '@/components/luxury/SectionTitle';
import { SkeletonBlock } from '@/components/luxury/SkeletonBlock';
import { CollectionItem } from '@/data/luxuryHomeData';
import { Fonts } from '@/constants/theme';

type EditorialCollectionsProps = {
  collections: CollectionItem[];
  loading?: boolean;
};

export function EditorialCollections({ collections, loading = false }: EditorialCollectionsProps) {
  const palette = useLuxuryPalette();

  if (loading) {
    return (
      <View>
        <SectionTitle title="Featured Collections" caption="Stories worth stepping into." />
        <View style={styles.skeletonColumn}>
          <SkeletonBlock height={220} borderRadius={radius.xl} />
          <View style={styles.skeletonRow}>
            <SkeletonBlock height={165} width="48.5%" borderRadius={radius.lg} />
            <SkeletonBlock height={165} width="48.5%" borderRadius={radius.lg} />
          </View>
        </View>
      </View>
    );
  }

  const [lead, ...secondary] = collections;

  return (
    <View>
      <SectionTitle title="Featured Collections" caption="Stories worth stepping into." />

      {lead ? (
        <AnimatedPressable containerStyle={styles.leadWrap}>
          <View style={[styles.leadCard, { backgroundColor: palette.elevated, borderColor: palette.line }, luxuryShadow]}>
            <Image source={{ uri: lead.image }} style={styles.leadImage} contentFit="cover" transition={700} />
            <View style={[styles.overlay, { backgroundColor: palette.collectionOverlay }]} />
            <View style={styles.copyWrap}>
              <Text style={[styles.leadTitle, { color: palette.heroTitle }]}>{lead.title}</Text>
              <Text style={[styles.subtitle, { color: palette.heroSubtitle }]}>{lead.subtitle}</Text>
            </View>
          </View>
        </AnimatedPressable>
      ) : null}

      <View style={styles.secondaryRow}>
        {secondary.slice(0, 2).map((item) => (
          <AnimatedPressable key={item.id} containerStyle={styles.secondaryWrap}>
            <View style={[styles.secondaryCard, { backgroundColor: palette.elevated, borderColor: palette.line }, luxuryShadow]}>
              <Image source={{ uri: item.image }} style={styles.secondaryImage} contentFit="cover" transition={550} />
              <View style={[styles.secondaryTint, { backgroundColor: palette.collectionSecondaryOverlay }]} />
              <View style={styles.secondaryCopy}>
                <Text style={[styles.secondaryTitle, { color: palette.heroTitle }]}>{item.title}</Text>
                <Text style={[styles.secondarySubtitle, { color: palette.heroSubtitle }]} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              </View>
            </View>
          </AnimatedPressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonColumn: {
    gap: spacing.sm,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leadWrap: {
    marginBottom: spacing.md,
  },
  leadCard: {
    height: 220,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  leadImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  copyWrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    gap: 8,
  },
  leadTitle: {
    fontFamily: Fonts.serif,
    fontSize: 30,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    maxWidth: '90%',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  secondaryWrap: {
    flex: 1,
  },
  secondaryCard: {
    height: 165,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  secondaryImage: {
    width: '100%',
    height: '100%',
  },
  secondaryTint: {
    ...StyleSheet.absoluteFillObject,
  },
  secondaryCopy: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    gap: 5,
  },
  secondaryTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    lineHeight: 23,
  },
  secondarySubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
  },
});
