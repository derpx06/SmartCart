import { useFocusEffect } from '@react-navigation/native';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { ProductDetailScreen } from '@/components/product/ProductDetailScreen';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useProductStore } from '@/store/product-store';

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
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: background }}>
          <ActivityIndicator />
        </View>
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
