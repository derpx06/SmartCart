import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { luxuryShadow, radius, spacing, useLuxuryPalette } from '@/components/luxury/design';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { ProductDetail } from '@/data/product/productDetails';
import { api } from '@/lib/api';
import { useSmartCartStore } from '@/store/smart-cart-store';
import { useProductRecommendations } from '@/hooks/use-product-recommendations';

type ProductDetailScreenProps = {
  product: ProductDetail;
};

const starArray = [1, 2, 3, 4, 5];

function money(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getStarIconName(index: number, rating: number): 'star' | 'star-half' | 'star-outline' {
  if (index <= Math.floor(rating)) {
    return 'star';
  }

  if (index - rating <= 0.5) {
    return 'star-half';
  }

  return 'star-outline';
}

export function ProductDetailScreen({ product }: ProductDetailScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const palette = useLuxuryPalette();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColorId, setSelectedColorId] = useState(product.selectedColorId);
  const [selectedSize, setSelectedSize] = useState(product.selectedSize);
  const [quantity, setQuantity] = useState(1);
  const [saving, setSaving] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  const { ranked, loading: recsLoading } = useProductRecommendations(product.id);
  const addToCart = useSmartCartStore((s) => s.addToCart);

  const handleAddRelated = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      Alert.alert('Selection updated', 'A thoughtfully paired item has been added.');
    } catch (err: any) {
      Alert.alert('Update failed', err.message || 'Please try again.');
    }
  };

  const selectedColor = product.colors.find((color) => color.id === selectedColorId);
  const selectedColorName = selectedColor?.name ?? product.colors[0]?.name ?? '';

  const savingPercent = useMemo(() => {
    if (!product.originalPrice || product.originalPrice <= product.price) {
      return null;
    }

    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }, [product.originalPrice, product.price]);

  const total = quantity * product.price;

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

  const handleWishlistToggle = async () => {
    const next = !isWishlisted;
    setIsWishlisted(next);

    if (!next || !product.id) {
      return;
    }

    try {
      await api.addToWishlist(product.id);
      Alert.alert('Saved', 'Added to wishlist.');
    } catch (err: any) {
      setIsWishlisted(false);
      Alert.alert('Wishlist update failed', err.message || 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['left', 'right']}>
      <View style={[styles.root, { backgroundColor: palette.background }]}>
        <View pointerEvents="none" style={styles.atmosphereLayer}>
          <View style={[styles.orbOne, { backgroundColor: palette.orbOne }]} />
          <View style={[styles.orbTwo, { backgroundColor: palette.orbTwo }]} />
        </View>

        <View style={[styles.headerRow, { top: insets.top + spacing.xs }]}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.headerButton,
              styles.headerButtonLarge,
              { backgroundColor: palette.elevated, borderColor: palette.line },
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={palette.text} />
          </Pressable>

          <View style={styles.headerActions}>
            <Pressable style={[styles.headerButton, { backgroundColor: palette.elevated, borderColor: palette.line }]}>
              <Ionicons name="share-social-outline" size={18} color={palette.text} />
            </Pressable>
            <Pressable
              onPress={() => {
                void handleWishlistToggle();
              }}
              style={[styles.headerButton, { backgroundColor: palette.elevated, borderColor: palette.line }]}
            >
              <Ionicons
                name={isWishlisted ? 'heart' : 'heart-outline'}
                size={18}
                color={isWishlisted ? '#D14862' : palette.text}
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: insets.top + 68,
            paddingBottom: Math.max(insets.bottom + 144, 176),
          }}
        >
          <View style={styles.heroSection}>
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.line,
                },
              ]}
            >
              <Pressable onPress={() => setIsImagePreviewOpen(true)} style={styles.heroImagePressable}>
                <Image source={{ uri: product.images[activeImageIndex] }} style={styles.heroImage} contentFit="cover" />
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRail}>
              {product.images.map((img, idx) => {
                const active = idx === activeImageIndex;

                return (
                  <Pressable
                    key={img}
                    onPress={() => setActiveImageIndex(idx)}
                    style={[
                      styles.thumbButton,
                      {
                        borderColor: active ? palette.gold : palette.line,
                        backgroundColor: active ? palette.champagne : palette.elevated,
                      },
                    ]}
                  >
                    <Image source={{ uri: img }} style={styles.thumbImage} contentFit="cover" />
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View
            style={[
              styles.detailsCard,
              {
                backgroundColor: palette.elevated,
                borderColor: palette.line,
              },
            ]}
          >
            <ThemedText style={[styles.brand, { color: palette.mutedText }]}>{product.brand}</ThemedText>
            <ThemedText style={[styles.title, { color: palette.text }]}>{product.name}</ThemedText>

            <View style={styles.metaRibbon}>
              <View style={[styles.ratingChip, { backgroundColor: palette.surface, borderColor: palette.line }]}>
                <View style={styles.ratingStars}>
                  {starArray.map((num) => (
                    <Ionicons key={num} name={getStarIconName(num, product.rating)} size={11} color={palette.gold} />
                  ))}
                </View>
                <ThemedText style={[styles.ratingValue, { color: palette.text }]}>{product.rating.toFixed(1)}</ThemedText>
                <ThemedText style={[styles.ratingCount, { color: palette.mutedText }]}>({product.reviewCount})</ThemedText>
              </View>

              <View style={[styles.stockChip, { backgroundColor: palette.subtleGlow }]}>
                <View style={[styles.stockDot, { backgroundColor: '#4CA47A' }]} />
                <ThemedText style={[styles.stockText, { color: palette.text }]}>In stock</ThemedText>
              </View>
            </View>

            <View style={styles.priceRow}>
              <ThemedText style={[styles.price, { color: palette.text }]}>{money(product.price)}</ThemedText>
              {product.originalPrice ? (
                <ThemedText style={[styles.originalPrice, { color: palette.mutedText }]}>{money(product.originalPrice)}</ThemedText>
              ) : null}
              {savingPercent ? (
                <View style={[styles.savePill, { backgroundColor: palette.surface, borderColor: palette.line }]}>
                  <ThemedText style={[styles.saveText, { color: palette.text }]}>SAVE {savingPercent}%</ThemedText>
                </View>
              ) : null}
            </View>

            <ThemedText style={[styles.description, { color: palette.mutedText }]}>{product.description}</ThemedText>

            <View style={[styles.trustGrid, { borderTopColor: palette.line, borderBottomColor: palette.line }]}>
              <View style={styles.trustItem}>
                <Ionicons name="shield-checkmark-outline" size={16} color={palette.gold} />
                <ThemedText style={[styles.trustText, { color: palette.text }]}>Authentic craft</ThemedText>
              </View>
              <View style={styles.trustItem}>
                <Ionicons name="refresh-outline" size={16} color={palette.gold} />
                <ThemedText style={[styles.trustText, { color: palette.text }]}>Easy returns</ThemedText>
              </View>
              <View style={styles.trustItem}>
                <Ionicons name="card-outline" size={16} color={palette.gold} />
                <ThemedText style={[styles.trustText, { color: palette.text }]}>Secure checkout</ThemedText>
              </View>
            </View>

            <View style={styles.optionBlock}>
              <View style={styles.optionHeaderRow}>
                <ThemedText style={[styles.optionTitle, { color: palette.mutedText }]}>Color</ThemedText>
                <ThemedText style={[styles.optionSelected, { color: palette.text }]}>{selectedColorName}</ThemedText>
              </View>

              <View style={styles.colorRow}>
                {product.colors.map((color) => {
                  const active = color.id === selectedColorId;

                  return (
                    <Pressable
                      key={color.id}
                      onPress={() => setSelectedColorId(color.id)}
                      style={[
                        styles.colorOuter,
                        {
                          borderColor: active ? palette.text : palette.line,
                          backgroundColor: palette.surface,
                        },
                      ]}
                    >
                      <View style={[styles.colorInner, { backgroundColor: color.hex }]} />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.optionBlock}>
              <View style={styles.optionHeaderRow}>
                <ThemedText style={[styles.optionTitle, { color: palette.mutedText }]}>Size</ThemedText>
                <ThemedText style={[styles.optionSelected, { color: palette.text }]}>{selectedSize}</ThemedText>
              </View>

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
                          backgroundColor: active ? palette.text : palette.surface,
                          borderColor: active ? palette.text : palette.line,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.sizeText,
                          {
                            color: active ? palette.elevated : palette.text,
                          },
                        ]}
                      >
                        {size}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.sectionWrap}>
            <View
              style={[
                styles.shippingCard,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.line,
                },
              ]}
            >
              <View style={[styles.shippingIconWrap, { backgroundColor: palette.elevated, borderColor: palette.line }]}>
                <Ionicons name="car-sport-outline" size={18} color={palette.text} />
              </View>
              <View style={styles.shippingCopy}>
                <ThemedText style={[styles.shippingTitle, { color: palette.text }]}>{product.shippingLine}</ThemedText>
                <ThemedText style={[styles.shippingSub, { color: palette.mutedText }]}>{product.shippingEta}</ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.sectionWrap}>
            <ThemedText style={[styles.sectionHeading, { color: palette.text }]}>Highlights</ThemedText>
            <View
              style={[
                styles.featureCard,
                {
                  backgroundColor: palette.elevated,
                  borderColor: palette.line,
                },
              ]}
            >
              {product.features.map((feature, index) => (
                <View
                  key={feature}
                  style={[
                    styles.featureRow,
                    {
                      borderBottomColor: index === product.features.length - 1 ? 'transparent' : palette.line,
                    },
                  ]}
                >
                  <View style={[styles.featureIcon, { backgroundColor: palette.subtleGlow }]}>
                    <Ionicons name="checkmark" size={13} color={palette.gold} />
                  </View>
                  <ThemedText style={[styles.featureText, { color: palette.text }]}>{feature}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionWrap}>
            <View style={styles.rowHeader}>
              <ThemedText style={[styles.sectionHeading, styles.sectionHeadingNoMargin, { color: palette.text }]}>Reviews</ThemedText>
              <ThemedText style={[styles.linkText, { color: palette.mutedText }]}>Write review</ThemedText>
            </View>

            {product.reviews.map((review) => (
              <View
                key={review.id}
                style={[
                  styles.reviewCard,
                  {
                    backgroundColor: palette.elevated,
                    borderColor: palette.line,
                  },
                ]}
              >
                <View style={styles.reviewTopRow}>
                  <View style={styles.starsWrap}>
                    {starArray.map((num) => (
                      <Ionicons key={num} name={getStarIconName(num, review.rating)} size={13} color={palette.gold} />
                    ))}
                  </View>
                  {review.verified ? (
                    <ThemedText style={[styles.verifiedTag, { color: palette.mutedText }]}>Verified buyer</ThemedText>
                  ) : null}
                </View>

                <ThemedText style={[styles.reviewTitle, { color: palette.text }]}>{review.title}</ThemedText>
                <ThemedText style={[styles.reviewBody, { color: palette.mutedText }]}>{review.body}</ThemedText>
                <ThemedText style={[styles.reviewAuthor, { color: palette.mutedText }]}>
                  {review.author} - {review.date}
                </ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.sectionWrap}>
            <ThemedText style={[styles.sectionHeading, { color: palette.text }]}>You may also like</ThemedText>
            {recsLoading ? (
              <View style={{ height: 180, justifyContent: 'center' }}>
                <ActivityIndicator color={palette.gold} />
              </View>
            ) : ranked.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedRail}>
                {ranked.map((related) => (
                  <View key={related.productId} style={styles.relatedCardContainer}>
                    <Pressable
                      style={[
                        styles.relatedCard,
                        {
                          backgroundColor: palette.elevated,
                          borderColor: palette.line,
                        },
                      ]}
                      onPress={() => {
                        // Assuming valid products have a predictable slug or ID pattern
                        // For now, we'll try to find if the ID works for navigation
                        router.push(`/product/${related.productId}`);
                      }}
                    >
                      <View style={[styles.relatedImagePlaceholder, { backgroundColor: palette.beige }]}>
                        <Ionicons name="sparkles-outline" size={24} color={palette.gold} />
                        {related.reasons.length > 0 && (
                          <View style={styles.miniBadge}>
                            <ThemedText style={styles.miniBadgeText}>{related.reasons[0]}</ThemedText>
                          </View>
                        )}
                      </View>
                      <ThemedText style={[styles.relatedName, { color: palette.text }]} numberOfLines={2}>
                        {related.name}
                      </ThemedText>
                      <ThemedText style={[styles.relatedPrice, { color: palette.gold }]}>
                        ${related.price.toFixed(2)}
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={() => handleAddRelated(related.productId)}
                      style={[styles.miniAddBtn, { backgroundColor: palette.text }]}
                    >
                      <Ionicons name="add" size={16} color={palette.elevated} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <ThemedText style={[styles.description, { color: palette.mutedText, textAlign: 'center' }]}>
                No recommendations found for this item yet.
              </ThemedText>
            )}
          </View>
        </ScrollView>

        <Modal
          visible={isImagePreviewOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsImagePreviewOpen(false)}
        >
          <View style={[styles.imageModalBackdrop, { backgroundColor: 'rgba(9, 8, 7, 0.74)' }]}>
            <Pressable style={styles.imageModalDismissLayer} onPress={() => setIsImagePreviewOpen(false)} />

            <View style={[styles.imageModalCard, { backgroundColor: palette.surface, borderColor: palette.line }]}>
              <Image source={{ uri: product.images[activeImageIndex] }} style={styles.imageModalImage} contentFit="contain" />
              <Pressable
                onPress={() => setIsImagePreviewOpen(false)}
                style={[styles.imageModalCloseButton, { backgroundColor: palette.elevated, borderColor: palette.line }]}
              >
                <Ionicons name="close" size={20} color={palette.text} />
              </Pressable>
            </View>
          </View>
        </Modal>

        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: palette.elevated,
              borderTopColor: palette.line,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <View style={styles.bottomSummaryRow}>
            <View>
              <ThemedText style={[styles.totalLabel, { color: palette.mutedText }]}>Total</ThemedText>
              <ThemedText style={[styles.totalValue, { color: palette.text }]}>{money(total)}</ThemedText>
            </View>
            <ThemedText style={[styles.totalLabel, { color: palette.mutedText }]}>Qty {quantity}</ThemedText>
          </View>

          <View style={styles.bottomRow}>
            <View style={[styles.qtyCard, { borderColor: palette.line, backgroundColor: palette.surface }]}>
              <Pressable style={styles.qtyButton} onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
                <Ionicons name="remove" size={18} color={palette.text} />
              </Pressable>
              <ThemedText style={[styles.qtyValue, { color: palette.text }]}>{quantity}</ThemedText>
              <Pressable style={styles.qtyButton} onPress={() => setQuantity((q) => q + 1)}>
                <Ionicons name="add" size={18} color={palette.text} />
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                void handleAddToCart();
              }}
              disabled={saving}
              style={[styles.addButton, { backgroundColor: palette.text, opacity: saving ? 0.75 : 1 }]}
            >
              <Ionicons name="bag-add-outline" size={16} color={palette.elevated} />
              <ThemedText style={[styles.addButtonText, { color: palette.elevated }]}>
                {saving ? 'Adding...' : 'Add to cart'}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  atmosphereLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 360,
  },
  orbOne: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 300,
    left: -122,
    top: 32,
    opacity: 0.56,
  },
  orbTwo: {
    position: 'absolute',
    width: 244,
    height: 244,
    borderRadius: 244,
    right: -90,
    top: 170,
    opacity: 0.5,
  },
  headerRow: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...luxuryShadow,
  },
  headerButtonLarge: {
    width: 44,
    height: 44,
  },
  heroSection: {
    paddingHorizontal: spacing.lg,
  },
  heroCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...luxuryShadow,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 1.07,
  },
  heroImagePressable: {
    width: '100%',
  },
  imageModalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  imageModalDismissLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  imageModalCard: {
    width: '100%',
    maxWidth: 460,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  imageModalImage: {
    width: '100%',
    aspectRatio: 1,
  },
  imageModalCloseButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...luxuryShadow,
  },
  thumbRail: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
    paddingBottom: 2,
  },
  thumbButton: {
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: 4,
  },
  thumbImage: {
    width: 62,
    height: 62,
    borderRadius: 8,
  },
  detailsCard: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...luxuryShadow,
  },
  brand: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
  },
  metaRibbon: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ratingChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingValue: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  ratingCount: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  stockChip: {
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
  },
  stockText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: spacing.md,
  },
  price: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    fontWeight: '700',
  },
  originalPrice: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    textDecorationLine: 'line-through',
  },
  savePill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 'auto',
  },
  saveText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    fontWeight: '700',
  },
  description: {
    marginTop: spacing.md,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
  },
  trustGrid: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
    gap: 10,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  optionBlock: {
    marginTop: spacing.md,
  },
  optionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  optionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  optionSelected: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  colorOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  sizeGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  sizeButton: {
    minWidth: 86,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  sizeText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionWrap: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  shippingCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  shippingIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shippingCopy: {
    flex: 1,
  },
  shippingTitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  shippingSub: {
    marginTop: 2,
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  sectionHeading: {
    fontFamily: Fonts.serif,
    fontSize: 23,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  sectionHeadingNoMargin: {
    marginBottom: 0,
  },
  featureCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  featureIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  linkText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    fontWeight: '700',
  },
  reviewCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  reviewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verifiedTag: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  reviewTitle: {
    fontFamily: Fonts.serif,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  reviewBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
  },
  reviewAuthor: {
    marginTop: spacing.sm,
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  relatedRail: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  relatedCardContainer: {
    width: 160,
    position: 'relative',
  },
  relatedCard: {
    width: 160,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  relatedImagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#00000080',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  miniBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontFamily: Fonts.sans,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  relatedName: {
    fontFamily: Fonts.serif,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  relatedPrice: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  miniAddBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: spacing.lg,
  },
  bottomSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  totalValue: {
    marginTop: 1,
    fontFamily: Fonts.serif,
    fontSize: 21,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  qtyCard: {
    width: 110,
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  qtyButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    fontWeight: '700',
  },
  addButton: {
    flex: 1,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  addButtonText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
});
