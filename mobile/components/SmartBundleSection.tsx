import React from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import type { SmartBundle } from '@/types/smart-cart';

export function SmartBundleSection({
  bundles,
  onAdd,
}: {
  bundles: SmartBundle[];
  onAdd: (productId: string) => void;
}) {
  if (!bundles?.length) return null;
  return (
    <View style={styles.root}>
      <ThemedText style={styles.kicker}>AI powered kits</ThemedText>
      <ThemedText style={styles.title}>Split by goals</ThemedText>
      {bundles.map((bundle) => (
        <View key={bundle.kitId} style={styles.bundleCard}>
          <ThemedText style={styles.bundleTitle}>
            {bundle.title} ({bundle.completionPercent}%)
          </ThemedText>
          <ThemedText style={styles.bundleSub}>{bundle.subtitle}</ThemedText>
          <ThemedText style={styles.metaLine}>
            You have {bundle.have.length} item{bundle.have.length === 1 ? '' : 's'} in this kit. {bundle.cta}.
          </ThemedText>
          {!!bundle.missing.length && (
            <ThemedText style={styles.missing}>
              Missing: {bundle.missing.map((m) => m.keyword).slice(0, 4).join(', ')}
            </ThemedText>
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
            {bundle.recommendations.map((item) => (
              <View key={`${bundle.kitId}-${item.productId}`} style={styles.productCard}>
                <View style={styles.imageWrap}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
                  ) : (
                    <Ionicons name="sparkles-outline" size={20} color="#1c1b1f" />
                  )}
                </View>
                <ThemedText numberOfLines={2} style={styles.productName}>{item.name}</ThemedText>
                <ThemedText style={styles.productPrice}>${item.price.toFixed(2)}</ThemedText>
                <Pressable style={styles.addBtn} onPress={() => onAdd(item.productId)}>
                  <ThemedText style={styles.addText}>Add</ThemedText>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 10, marginTop: 12 },
  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    color: '#1c1b1f',
  },
  title: { fontFamily: Fonts.serif, fontSize: 24, color: '#1c1b1f' },
  bundleCard: {
    borderWidth: 1,
    borderColor: 'rgba(28,27,31,0.14)',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    gap: 8,
  },
  bundleTitle: { fontFamily: Fonts.serif, fontSize: 18, color: '#1c1b1f' },
  bundleSub: { fontFamily: Fonts.sans, fontSize: 12, color: 'rgba(28,27,31,0.7)' },
  metaLine: { fontFamily: Fonts.sans, fontSize: 12, color: 'rgba(28,27,31,0.78)' },
  missing: { fontFamily: Fonts.sans, fontSize: 12, color: 'rgba(28,27,31,0.75)' },
  rail: { gap: 10, paddingVertical: 4 },
  productCard: {
    width: 145,
    borderWidth: 1,
    borderColor: 'rgba(28,27,31,0.14)',
    borderRadius: 14,
    padding: 8,
    gap: 4,
    backgroundColor: '#fff',
  },
  imageWrap: {
    height: 84,
    borderRadius: 10,
    backgroundColor: '#e9e9e7',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  productName: { fontFamily: Fonts.sans, fontSize: 12, color: '#1c1b1f' },
  productPrice: { fontFamily: Fonts.sans, fontWeight: '700', fontSize: 12, color: '#1c1b1f' },
  addBtn: {
    borderRadius: 999,
    backgroundColor: '#1c1b1f',
    alignItems: 'center',
    paddingVertical: 7,
    marginTop: 4,
  },
  addText: { color: '#fff', fontFamily: Fonts.sans, fontSize: 12, fontWeight: '700' },
});

