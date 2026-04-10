import { useFocusEffect } from '@react-navigation/native';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SkeletonBlock } from '@/components/luxury/SkeletonBlock';
import { luxuryShadow, radius, spacing } from '@/components/luxury/design';
import { ProductDetailScreen } from '@/components/product/ProductDetailScreen';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useProductStore } from '@/store/product-store';

function ProductDetailSkeleton({ background }: { background: string }) {
  return (
    <View style={[styles.skeletonRoot, { backgroundColor: background }]}>
      <View style={styles.skeletonHeaderRow}>
        <SkeletonBlock height={44} width={44} borderRadius={22} />
        <View style={styles.skeletonHeaderActions}>
          <SkeletonBlock height={40} width={40} borderRadius={20} />
          <SkeletonBlock height={40} width={40} borderRadius={20} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.skeletonContent}
      >
        <View style={styles.skeletonHeroCard}>
          <SkeletonBlock height={360} borderRadius={radius.xl} />
        </View>

        <View style={styles.skeletonDetailsCard}>
          <SkeletonBlock height={12} width={88} />
          <SkeletonBlock height={32} width="72%" />
          <SkeletonBlock height={24} width={148} />
          <SkeletonBlock height={14} width="100%" />
          <SkeletonBlock height={14} width="78%" />
          <SkeletonBlock height={52} width="100%" borderRadius={radius.md} />
          <SkeletonBlock height={52} width="62%" borderRadius={radius.pill} />
        </View>
      </ScrollView>

      <View style={[styles.skeletonBottomBar, luxuryShadow]}>
        <SkeletonBlock height={16} width={120} />
        <SkeletonBlock height={46} width="44%" borderRadius={radius.pill} />
      </View>
    </View>
  );
}

export default function ProductDetailRoute() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const resolvedSlug = Array.isArray(slug) ? slug[0] : slug;
  const product = useProductStore((state) => state.product);
  const loading = useProductStore((state) => state.loading);
  const error = useProductStore((state) => state.error);
  const loadProduct = useProductStore((state) => state.loadProduct);
  const resetProduct = useProductStore((state) => state.resetProduct);
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'mutedText');
  const border = useThemeColor({}, 'border');

  useFocusEffect(
    useCallback(() => {
      void loadProduct(resolvedSlug);
      return () => {
        resetProduct();
      };
    }, [loadProduct, resetProduct, resolvedSlug]),
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {loading ? (
        <ProductDetailSkeleton background={background} />
      ) : error || !product ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: background,
            paddingHorizontal: 24,
            gap: 12,
          }}>
          <ThemedText style={{ color: text, fontSize: 18, fontWeight: '700' }}>Product unavailable</ThemedText>
          <ThemedText style={{ color: muted, textAlign: 'center' }}>
            {error || 'We could not load this product from the backend.'}
          </ThemedText>
          <Pressable
            onPress={() => {
              void loadProduct(resolvedSlug);
            }}
            style={{
              borderWidth: 1,
              borderColor: border,
              borderRadius: 10,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}>
            <ThemedText style={{ color: text, fontWeight: '600' }}>Try again</ThemedText>
          </Pressable>
        </View>
      ) : (
        <ProductDetailScreen product={product} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  skeletonRoot: {
    flex: 1,
  },
  skeletonHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  skeletonHeaderActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  skeletonContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 170,
    gap: spacing.sm,
  },
  skeletonHeroCard: {
    borderRadius: radius.xl,
    padding: spacing.xs,
  },
  skeletonDetailsCard: {
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
  },
  skeletonBottomBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.md,
    borderRadius: radius.xl,
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
