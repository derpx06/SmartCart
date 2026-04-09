import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { radius, spacing } from '@/components/luxury/design';
import { Fonts } from '@/constants/theme';
import { ProductDetail } from '@/data/product/productDetails';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/lib/api';
import { useSmartCartStore } from '@/store/smart-cart-store';

type ProductDetailScreenProps = {
  product: ProductDetail;
};

const starArray = [1, 2, 3, 4, 5];

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

export function ProductDetailScreen({ product }: ProductDetailScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'mutedText');
  const border = useThemeColor({}, 'border');

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColorId, setSelectedColorId] = useState(product.selectedColorId);
  const [selectedSize, setSelectedSize] = useState(product.selectedSize);
  const [quantity, setQuantity] = useState(1);
  const [saving, setSaving] = useState(false);

  const savingPercent = useMemo(() => {
    if (!product.originalPrice || product.originalPrice <= product.price) {
      return null;
    }
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }, [product.originalPrice, product.price]);

  const selectedColorName = product.colors.find((c) => c.id === selectedColorId)?.name ?? product.colors[0]?.name;

  const handleAddToCart = async () => {
    if (!product.id) {
      Alert.alert('Unavailable', 'This product is not synced with the backend yet.');
      return;
    }

    try {
      setSaving(true);
      await api.addToCart(product.id, quantity);
      await useSmartCartStore.getState().refresh();
      router.push('/(tabs)/cart');
    } catch (err: any) {
      Alert.alert('Cart update failed', err.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product.id) {
      return;
    }

    try {
      await api.addToWishlist(product.id);
      Alert.alert('Saved', 'Added to wishlist.');
    } catch (err: any) {
      Alert.alert('Wishlist update failed', err.message || 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.root, { backgroundColor: background }]}> 
        <View style={[styles.header, { backgroundColor: card, borderBottomColor: border }]}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={22} color={text} />
          </Pressable>
          <ThemedText numberOfLines={1} style={styles.brandText}>{product.brand}</ThemedText>
          <Pressable onPress={() => router.push('/(tabs)/cart')} style={styles.headerButton}>
            <Ionicons name="bag-outline" size={22} color={text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingTop: 62, paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
          <View style={[styles.heroWrap, { backgroundColor: card }]}>
            <Image source={{ uri: product.images[activeImageIndex] }} style={styles.heroImage} contentFit="cover" />

            <View style={[styles.badgeWrap, { backgroundColor: text }]}>
              <ThemedText style={[styles.badgeText, { color: background }]}>{product.badge}</ThemedText>
            </View>

            <Pressable onPress={handleAddToWishlist} style={[styles.wishlistButton, { backgroundColor: card, borderColor: border }]}>
              <Ionicons name="heart" size={20} color={text} />
            </Pressable>

            <View style={styles.dotWrap}>
              {product.images.map((img, idx) => (
                <Pressable
                  key={img}
                  onPress={() => setActiveImageIndex(idx)}
                  style={[styles.dot, { backgroundColor: idx === activeImageIndex ? text : muted }]}
                />
              ))}
            </View>
          </View>

          <View style={styles.sectionPad}>
            <View style={styles.ratingRow}>
              {starArray.map((num) => (
                <Ionicons
                  key={num}
                  name={num <= Math.floor(product.rating) ? 'star' : 'star-half'}
                  size={13}
                  color={muted}
                />
              ))}
              <ThemedText style={[styles.ratingText, { color: muted }]}>
                {product.rating.toFixed(1)} ({product.reviewCount} Reviews)
              </ThemedText>
            </View>

            <ThemedText style={styles.title}>{product.name}</ThemedText>

            <View style={styles.priceRow}>
              <ThemedText style={styles.price}>{money(product.price)}</ThemedText>
              {product.originalPrice ? (
                <ThemedText style={[styles.originalPrice, { color: muted }]}>{money(product.originalPrice)}</ThemedText>
              ) : null}
              {savingPercent ? (
                <View style={[styles.savePill, { borderColor: border, backgroundColor: card }]}>
                  <ThemedText style={styles.saveText}>SAVE {savingPercent}%</ThemedText>
                </View>
              ) : null}
            </View>

            <View style={styles.optionGroup}>
              <ThemedText style={[styles.optionLabel, { color: muted }]}>Color - {selectedColorName}</ThemedText>
              <View style={styles.colorRow}>
                {product.colors.map((color) => {
                  const active = color.id === selectedColorId;
                  return (
                    <Pressable
                      key={color.id}
                      onPress={() => setSelectedColorId(color.id)}
                      style={[styles.colorOuter, { borderColor: active ? text : border }]}
                    >
                      <View style={[styles.colorInner, { backgroundColor: color.hex }]} />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.optionGroup}>
              <ThemedText style={[styles.optionLabel, { color: muted }]}>Size</ThemedText>
              <View style={styles.sizeGrid}>
                {product.sizes.map((size) => {
                  const active = size === selectedSize;
                  return (
                    <Pressable
                      key={size}
                      onPress={() => setSelectedSize(size)}
                      style={[
                        styles.sizeButton,
                        {
                          borderColor: border,
                          backgroundColor: active ? text : card,
                        },
                      ]}
                    >
                      <ThemedText style={[styles.sizeButtonText, active && { color: background }]}>{size}</ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={[styles.shipCard, { backgroundColor: card, borderColor: border }]}> 
            <Ionicons name="car-outline" size={18} color={text} />
            <View style={styles.shipTextWrap}>
              <ThemedText style={styles.shipTitle}>{product.shippingLine}</ThemedText>
              <ThemedText style={[styles.shipSub, { color: muted }]}>{product.shippingEta}</ThemedText>
            </View>
          </View>

          <View style={styles.sectionPad}>
            <View style={[styles.separator, { borderColor: border }]} />
            <ThemedText style={styles.sectionTitle}>Artisan Craftsmanship</ThemedText>
            <ThemedText style={[styles.description, { color: muted }]}>{product.description}</ThemedText>

            <View style={styles.featureList}>
              {product.features.map((feature) => (
                <View key={feature} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={18} color={text} />
                  <ThemedText style={styles.featureText}>{feature}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.relatedSection}>
            <ThemedText style={[styles.sectionTitle, styles.sectionPadHorizontal]}>Complete Your Collection</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroller}>
              {product.related.map((related) => (
                <Pressable
                  key={related.id}
                  style={styles.relatedCard}
                  onPress={() => related.slug && router.push(`/product/${related.slug}`)}>
                  <Image source={{ uri: related.image }} style={styles.relatedImage} contentFit="cover" />
                  <ThemedText style={styles.relatedName}>{related.name}</ThemedText>
                  <ThemedText style={[styles.relatedPrice, { color: muted }]}>{related.price}</ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={[styles.sectionPad, { paddingTop: spacing.lg }]}> 
            <View style={styles.reviewHeader}>
              <ThemedText style={styles.sectionTitle}>Reviews</ThemedText>
              <ThemedText style={[styles.writeReview, { color: muted }]}>Write Review</ThemedText>
            </View>

            {product.reviews.map((review) => (
              <View key={review.id} style={[styles.reviewCard, { borderColor: border }]}>
                <View style={styles.reviewTop}>
                  <View style={styles.reviewStars}>
                    {starArray.map((num) => (
                      <Ionicons key={num} name="star" size={12} color={num <= review.rating ? text : border} />
                    ))}
                  </View>
                  {review.verified ? <ThemedText style={[styles.verified, { color: muted }]}>Verified Buyer</ThemedText> : null}
                </View>
                <ThemedText style={styles.reviewTitle}>{review.title}</ThemedText>
                <ThemedText style={[styles.reviewBody, { color: muted }]}>{review.body}</ThemedText>
                <ThemedText style={[styles.reviewAuthor, { color: muted }]}>- {review.author}, {review.date}</ThemedText>
              </View>
            ))}
          </View>
        </ScrollView>

        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: card,
              borderTopColor: border,
              paddingBottom: Math.max(insets.bottom, 10),
            },
          ]}>
          <View style={styles.bottomRow}>
            <View style={[styles.qtyWrap, { borderColor: border }]}> 
              <Pressable style={styles.qtyAction} onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
                <Ionicons name="remove" size={18} color={text} />
              </Pressable>
              <ThemedText style={styles.qtyValue}>{quantity}</ThemedText>
              <Pressable style={styles.qtyAction} onPress={() => setQuantity((q) => q + 1)}>
                <Ionicons name="add" size={18} color={text} />
              </Pressable>
            </View>

            <Pressable onPress={handleAddToCart} style={[styles.addToCartButton, { backgroundColor: text }]}>
              <ThemedText style={[styles.addToCartText, { color: background }]}>
                {saving ? 'ADDING...' : `Add to Cart - ${money(product.price)}`}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  root: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    height: 62,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  brandText: { fontFamily: Fonts.serif, fontSize: 14, letterSpacing: 1.5, fontWeight: '700', textTransform: 'uppercase', flex: 1, textAlign: 'center' },
  heroWrap: { position: 'relative' },
  heroImage: { width: '100%', aspectRatio: 4 / 5 },
  badgeWrap: { position: 'absolute', top: spacing.md, left: 0, paddingHorizontal: 14, paddingVertical: 7 },
  badgeText: { fontFamily: Fonts.sans, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.1, fontWeight: '700' },
  wishlistButton: { position: 'absolute', top: spacing.md, right: spacing.md, width: 46, height: 46, borderRadius: 46, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dotWrap: { position: 'absolute', bottom: spacing.md, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 7 },
  sectionPad: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: spacing.xs },
  ratingText: { marginLeft: 8, fontFamily: Fonts.sans, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '700' },
  title: { fontFamily: Fonts.serif, fontSize: 32, lineHeight: 38, fontWeight: '700', letterSpacing: 0.2, marginBottom: spacing.md },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: spacing.lg },
  price: { fontFamily: Fonts.serif, fontSize: 30, fontWeight: '700' },
  originalPrice: { fontFamily: Fonts.serif, fontSize: 20, textDecorationLine: 'line-through' },
  savePill: { marginLeft: 'auto', borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  saveText: { fontFamily: Fonts.sans, fontSize: 11, fontWeight: '700' },
  optionGroup: { marginTop: spacing.sm },
  optionLabel: { fontFamily: Fonts.sans, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', fontWeight: '700', marginBottom: spacing.sm },
  colorRow: { flexDirection: 'row', gap: spacing.xs },
  colorOuter: { width: 34, height: 34, borderRadius: 34, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  colorInner: { width: 24, height: 24, borderRadius: 24 },
  sizeGrid: { flexDirection: 'row', gap: spacing.xs },
  sizeButton: { flex: 1, height: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sizeButtonText: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  shipCard: { marginHorizontal: spacing.lg, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  shipTextWrap: { flex: 1 },
  shipTitle: { fontFamily: Fonts.sans, fontSize: 13, fontWeight: '700' },
  shipSub: { fontFamily: Fonts.sans, fontSize: 13, marginTop: 4 },
  separator: { borderTopWidth: 1, marginBottom: spacing.lg },
  sectionTitle: { fontFamily: Fonts.serif, fontSize: 24, fontWeight: '700', marginBottom: spacing.sm },
  description: { fontFamily: Fonts.sans, fontSize: 15, lineHeight: 24 },
  featureList: { marginTop: spacing.md, gap: spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600' },
  relatedSection: { paddingVertical: spacing.lg },
  sectionPadHorizontal: { paddingHorizontal: spacing.lg },
  relatedScroller: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  relatedCard: { width: 168 },
  relatedImage: { width: '100%', aspectRatio: 1, borderRadius: radius.md, marginBottom: 10 },
  relatedName: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  relatedPrice: { fontFamily: Fonts.serif, fontSize: 14, fontWeight: '700' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  writeReview: { fontFamily: Fonts.sans, fontSize: 11, textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.8 },
  reviewCard: { borderBottomWidth: 1, paddingVertical: spacing.md },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reviewStars: { flexDirection: 'row', gap: 2 },
  verified: { fontFamily: Fonts.sans, fontSize: 10, textTransform: 'uppercase', fontWeight: '700' },
  reviewTitle: { fontFamily: Fonts.serif, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  reviewBody: { fontFamily: Fonts.sans, fontSize: 13, lineHeight: 21 },
  reviewAuthor: { marginTop: 10, fontFamily: Fonts.sans, fontSize: 11, fontWeight: '500' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, paddingTop: 12, paddingHorizontal: spacing.lg },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  qtyWrap: { width: 108, height: 56, borderWidth: 1, borderRadius: radius.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  qtyAction: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyValue: { fontFamily: Fonts.serif, fontSize: 20, fontWeight: '700' },
  addToCartButton: { flex: 1, height: 56, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  addToCartText: { fontFamily: Fonts.sans, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: '700' },
});
