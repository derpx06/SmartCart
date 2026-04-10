import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { luxuryShadow, radius } from '@/components/luxury/design';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import type { ChatProductSummary } from '@/lib/api';

type ChatProductCardProps = {
  product: ChatProductSummary;
  onPress?: (product: ChatProductSummary) => void;
};

export function ChatProductCard({ product, onPress }: ChatProductCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(product)}
      style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }] }]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.image }} style={styles.image} contentFit="cover" />
      </View>

      <ThemedText style={styles.name} numberOfLines={2}>
        {product.name}
      </ThemedText>
      <ThemedText style={styles.category} numberOfLines={1}>
        {product.category}
      </ThemedText>
      <ThemedText style={styles.price} numberOfLines={1}>
        ${Number(product.price || 0).toFixed(2)}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 10,
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(28, 27, 31, 0.14)',
    ...luxuryShadow,
  },
  imageWrap: {
    width: '100%',
    height: 92,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 27, 31, 0.06)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontFamily: Fonts.serif,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#1C1B1F',
  },
  category: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(28, 27, 31, 0.68)',
  },
  price: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1B1F',
  },
});

