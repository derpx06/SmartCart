import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/luxury/AnimatedPressable';
import { luxuryShadow, palette, radius, spacing } from '@/components/luxury/design';
import { SectionTitle } from '@/components/luxury/SectionTitle';
import { SkeletonBlock } from '@/components/luxury/SkeletonBlock';
import { CollectionItem } from '@/data/luxuryHomeData';
import { Fonts } from '@/constants/theme';

type EditorialCollectionsProps = {
  collections: CollectionItem[];
  loading?: boolean;
};

export function EditorialCollections({ collections, loading = false }: EditorialCollectionsProps) {
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
          <View style={styles.leadCard}>
            <Image source={{ uri: lead.image }} style={styles.leadImage} contentFit="cover" transition={700} />
            <View style={styles.overlay} />
            <View style={styles.copyWrap}>
              <Text style={styles.leadTitle}>{lead.title}</Text>
              <Text style={styles.subtitle}>{lead.subtitle}</Text>
            </View>
          </View>
        </AnimatedPressable>
      ) : null}

      <View style={styles.secondaryRow}>
        {secondary.slice(0, 2).map((item) => (
          <AnimatedPressable key={item.id} containerStyle={styles.secondaryWrap}>
            <View style={styles.secondaryCard}>
              <Image source={{ uri: item.image }} style={styles.secondaryImage} contentFit="cover" transition={550} />
              <View style={styles.secondaryTint} />
              <View style={styles.secondaryCopy}>
                <Text style={styles.secondaryTitle}>{item.title}</Text>
                <Text style={styles.secondarySubtitle} numberOfLines={2}>
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
    marginBottom: spacing.sm,
  },
  leadCard: {
    height: 220,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: palette.beige,
    ...luxuryShadow,
  },
  leadImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.34)',
  },
  copyWrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    gap: 8,
  },
  leadTitle: {
    color: '#fff',
    fontFamily: Fonts.serif,
    fontSize: 30,
    lineHeight: 34,
  },
  subtitle: {
    color: '#fff',
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    maxWidth: '90%',
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryWrap: {
    width: '48.5%',
  },
  secondaryCard: {
    height: 165,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: palette.beige,
    ...luxuryShadow,
  },
  secondaryImage: {
    width: '100%',
    height: '100%',
  },
  secondaryTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  secondaryCopy: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    gap: 5,
  },
  secondaryTitle: {
    color: '#fff',
    fontFamily: Fonts.serif,
    fontSize: 20,
    lineHeight: 23,
  },
  secondarySubtitle: {
    color: '#fff',
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
  },
});
