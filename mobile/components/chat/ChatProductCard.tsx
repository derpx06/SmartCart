import { Ionicons } from '@expo/vector-icons';
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
  const formattedPrice = Number(product.price || 0).toFixed(2);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(product)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.image }} style={styles.image} contentFit="cover" />
        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>Recommended</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.name} numberOfLines={2}>
        {product.name}
      </ThemedText>
      <ThemedText style={styles.category} numberOfLines={1}>
        {product.category}
      </ThemedText>
      <ThemedText style={styles.price} numberOfLines={1}>
        ${formattedPrice}
      </ThemedText>

      <View style={styles.ctaRow}>
        <ThemedText style={styles.ctaText}>View product</ThemedText>
        <Ionicons name="arrow-forward" size={14} color="#1C1B1F" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 176,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: 11,
    gap: 7,
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(28, 27, 31, 0.14)',
    ...luxuryShadow,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  imageWrap: {
    width: '100%',
    height: 100,
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
    fontSize: 15,
    lineHeight: 20,
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
  ctaRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: 'rgba(28, 27, 31, 0.08)',
  },
  ctaText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: '#1C1B1F',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(28, 27, 31, 0.78)',
  },
  badgeText: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});

