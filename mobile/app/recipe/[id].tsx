import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/components/luxury/AnimatedPressable';
import { luxuryShadow, palette, radius, spacing } from '@/components/luxury/design';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { bestsellers, recommendedProducts } from '@/data/luxuryHomeData';
import { mockRecipes } from '@/data/recipesData';

const RECIPE_COLORS = {
  background: palette.background,
  surface: palette.elevated,
  text: palette.text,
  mutedText: palette.mutedText,
  accent: palette.gold,
  accentSoft: palette.line,
  border: palette.line,
  overlay: palette.overlay,
};

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const recipe = mockRecipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centerAll]}>
        <Stack.Screen options={{ title: 'Not Found', headerShown: false }} />
        <ThemedText style={styles.errorText}>Recipe not found.</ThemedText>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ThemedText style={styles.backBtnText}>Go Back</ThemedText>
        </Pressable>
      </SafeAreaView>
    );
  }

  const allProducts = [...bestsellers, ...recommendedProducts];
  const requiredProducts = recipe.requiredProductIds
    .map((productId) => allProducts.find((p) => p.id === productId))
    .filter(Boolean);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
        <View style={styles.heroWrapper}>
          <Image source={{ uri: recipe.image }} style={styles.heroImage} contentFit="cover" />
          <View style={styles.heroShade} />
          <View style={[styles.navOverlay, { paddingTop: insets.top || spacing.md }]}>
            <Pressable onPress={() => router.back()} style={styles.circleBtn}>
              <Ionicons name="arrow-back" size={20} color={RECIPE_COLORS.text} />
            </Pressable>
            <Pressable style={styles.circleBtn}>
              <Ionicons name="bookmark-outline" size={20} color={RECIPE_COLORS.text} />
            </Pressable>
          </View>
        </View>

        <View style={styles.contentPad}>
          <View style={styles.headerArea}>
            <View style={styles.metaRow}>
              <View style={styles.accentChip}>
                <ThemedText style={styles.accentChipText}>{recipe.difficulty}</ThemedText>
              </View>
              <View style={styles.infoChip}>
                <Ionicons name="time-outline" size={13} color={RECIPE_COLORS.accent} />
                <ThemedText style={styles.infoChipText}>{recipe.time}</ThemedText>
              </View>
              <View style={styles.infoChip}>
                <Ionicons name="people-outline" size={13} color={RECIPE_COLORS.accent} />
                <ThemedText style={styles.infoChipText}>{recipe.servings}</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.title}>{recipe.title}</ThemedText>
            <ThemedText style={styles.description}>{recipe.description}</ThemedText>
          </View>

          {requiredProducts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionIntro}>
                <ThemedText style={styles.sectionTitle}>Goods you&apos;ll need</ThemedText>
                <ThemedText style={styles.sectionHint}>Tap a card to open the product.</ThemedText>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollArea}>
                {requiredProducts.map((product) => {
                  const slug =
                    product?.slug ||
                    (product?.id && !/^rec-|^prod-/i.test(product.id) ? product.id : null) ||
                    'signature-enameled-cast-iron-dutch-oven';

                  return (
                    <AnimatedPressable
                      key={product!.id}
                      onPress={() => router.push(`/product/${slug}` as any)}
                      style={styles.productCard}>
                    <View style={styles.productImageWrap}>
                      <Image source={{ uri: product!.image }} style={styles.productImage} contentFit="cover" />
                    </View>
                    <View style={styles.productInfo}>
                      <ThemedText style={styles.productName} numberOfLines={2}>
                        {product!.name}
                      </ThemedText>
                      <ThemedText style={styles.productPrice}>{product!.price}</ThemedText>
                    </View>
                    </AnimatedPressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeadRow}>
              <ThemedText style={[styles.sectionTitle, styles.sectionTitleFlex]}>Ingredients</ThemedText>
              <View style={styles.sectionCountPill}>
                <ThemedText style={styles.sectionCount}>{recipe.ingredients.length} items</ThemedText>
              </View>
            </View>
            <View style={styles.listCard}>
              {recipe.ingredients.map((ing, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.ingredientRow,
                    idx < recipe.ingredients.length - 1 ? styles.ingredientRowDivider : null,
                  ]}>
                  <View style={styles.bulletWrap}>
                    <View style={styles.bullet} />
                  </View>
                  <ThemedText style={styles.listText}>{ing}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeadRow}>
              <ThemedText style={[styles.sectionTitle, styles.sectionTitleFlex]}>Instructions</ThemedText>
              <View style={styles.sectionCountPill}>
                <ThemedText style={styles.sectionCount}>{recipe.instructions.length} steps</ThemedText>
              </View>
            </View>
            <View style={styles.stepsWrap}>
              {recipe.instructions.map((inst, idx) => (
                <View key={idx} style={styles.stepCard}>
                  <View style={styles.stepBadge}>
                    <ThemedText style={styles.stepNum}>{idx + 1}</ThemedText>
                  </View>
                  <ThemedText style={[styles.listText, styles.stepBodyText]}>{inst}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: RECIPE_COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: RECIPE_COLORS.background,
  },
  centerAll: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: Fonts.sans,
    color: RECIPE_COLORS.mutedText,
    marginBottom: spacing.md,
  },
  backBtn: {
    padding: spacing.md,
    backgroundColor: RECIPE_COLORS.surface,
    borderRadius: radius.md,
    ...luxuryShadow,
  },
  backBtnText: {
    fontFamily: Fonts.sans,
    color: RECIPE_COLORS.text,
  },
  heroWrapper: {
    width: '100%',
    height: 390,
    position: 'relative',
    backgroundColor: palette.surface,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: RECIPE_COLORS.overlay,
  },
  navOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...luxuryShadow,
  },
  contentPad: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: RECIPE_COLORS.background,
    marginTop: -radius.xl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
  },
  headerArea: {
    marginBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    rowGap: spacing.xs,
    columnGap: spacing.xs,
  },
  accentChip: {
    borderRadius: radius.pill,
    backgroundColor: RECIPE_COLORS.accentSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  accentChipText: {
    fontSize: 11,
    fontFamily: Fonts.sans,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    color: RECIPE_COLORS.accent,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: RECIPE_COLORS.border,
    backgroundColor: RECIPE_COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  infoChipText: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    fontWeight: '600',
    color: RECIPE_COLORS.text,
  },
  title: {
    fontSize: 30,
    fontFamily: Fonts.serif,
    fontWeight: '600',
    color: RECIPE_COLORS.text,
    lineHeight: 36,
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 15,
    fontFamily: Fonts.sans,
    color: RECIPE_COLORS.mutedText,
    lineHeight: 23,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionIntro: {
    marginBottom: spacing.md,
    gap: 6,
  },
  sectionHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: Fonts.serif,
    fontWeight: '600',
    color: RECIPE_COLORS.text,
    lineHeight: 28,
  },
  sectionTitleFlex: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.xs,
  },
  sectionHint: {
    color: RECIPE_COLORS.mutedText,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
  sectionCountPill: {
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: RECIPE_COLORS.border,
    backgroundColor: RECIPE_COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  sectionCount: {
    fontSize: 11,
    fontFamily: Fonts.sans,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: RECIPE_COLORS.text,
  },
  horizontalScrollArea: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.xs,
    paddingRight: spacing.lg,
  },
  productCard: {
    width: 156,
    backgroundColor: RECIPE_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: RECIPE_COLORS.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...luxuryShadow,
    shadowOpacity: 0.06,
  },
  productImageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: palette.surface,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    minHeight: 72,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 13,
    fontFamily: Fonts.sans,
    fontWeight: '600',
    color: RECIPE_COLORS.text,
    lineHeight: 18,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    fontWeight: '700',
    color: RECIPE_COLORS.text,
    letterSpacing: 0.2,
  },
  listCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: RECIPE_COLORS.border,
    backgroundColor: RECIPE_COLORS.surface,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  ingredientRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: RECIPE_COLORS.border,
  },
  bulletWrap: {
    width: 22,
    alignItems: 'center',
    paddingTop: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: RECIPE_COLORS.text,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.sans,
    color: RECIPE_COLORS.text,
    lineHeight: 23,
  },
  stepsWrap: {
    gap: spacing.md,
  },
  stepCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: RECIPE_COLORS.border,
    backgroundColor: RECIPE_COLORS.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: RECIPE_COLORS.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    fontWeight: '700',
    color: RECIPE_COLORS.text,
  },
  stepBodyText: {
    paddingTop: 4,
  },
});
