import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/components/luxury/AnimatedPressable';
import { luxuryShadow, radius, spacing } from '@/components/luxury/design';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { bestsellers, recommendedProducts } from '@/data/luxuryHomeData';
import { mockRecipes } from '@/data/recipesData';

const RECIPE_COLORS = {
  background: '#FAF9F7',
  surface: '#FFFFFF',
  text: '#1C1B1F',
  mutedText: 'rgba(28, 27, 31, 0.68)',
  accent: '#7D7365',
  border: 'rgba(28, 27, 31, 0.08)',
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
        {/* Hero Image */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: recipe.image }} style={styles.heroImage} contentFit="cover" />
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
          {/* Header Info */}
          <View style={styles.headerArea}>
            <View style={styles.metaRow}>
              <ThemedText style={styles.difficultyTag}>{recipe.difficulty}</ThemedText>
              <View style={styles.metaDot} />
              <Ionicons name="time-outline" size={14} color={RECIPE_COLORS.accent} />
              <ThemedText style={styles.timeText}>{recipe.time}</ThemedText>
            </View>
            <ThemedText style={styles.title}>{recipe.title}</ThemedText>
            <ThemedText style={styles.description}>{recipe.description}</ThemedText>
          </View>

          {/* Equipment Needed (Shoppable) */}
          {requiredProducts.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Equipment Needed</ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollArea}>
                {requiredProducts.map((product) => (
                  <AnimatedPressable
                    key={product!.id}
                    onPress={() => router.push(`/product/${product!.slug || product!.id}` as any)}
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
                ))}
              </ScrollView>
            </View>
          )}

          {/* Ingredients */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Ingredients</ThemedText>
            <View style={styles.listWrap}>
              {recipe.ingredients.map((ing, idx) => (
                <View key={idx} style={styles.listItem}>
                  <View style={styles.bullet} />
                  <ThemedText style={styles.listText}>{ing}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Instructions</ThemedText>
            <View style={styles.listWrap}>
              {recipe.instructions.map((inst, idx) => (
                <View key={idx} style={styles.instructItem}>
                  <ThemedText style={styles.stepNum}>{idx + 1}</ThemedText>
                  <ThemedText style={styles.listText}>{inst}</ThemedText>
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
    height: 380,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...luxuryShadow,
  },
  contentPad: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    backgroundColor: RECIPE_COLORS.background,
    marginTop: -radius.xl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  headerArea: {
    marginBottom: spacing.xxl,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  difficultyTag: {
    fontSize: 11,
    fontFamily: Fonts.sans,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: RECIPE_COLORS.accent,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: RECIPE_COLORS.mutedText,
    marginHorizontal: spacing.sm,
  },
  timeText: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: RECIPE_COLORS.accent,
    marginLeft: 4,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.serif,
    color: RECIPE_COLORS.text,
    lineHeight: 38,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 15,
    fontFamily: Fonts.sans,
    color: RECIPE_COLORS.mutedText,
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.serif,
    color: RECIPE_COLORS.text,
    marginBottom: spacing.lg,
  },
  horizontalScrollArea: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  productCard: {
    width: 140,
    backgroundColor: RECIPE_COLORS.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...luxuryShadow,
  },
  productImageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E9E9E7',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: spacing.sm,
  },
  productName: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: RECIPE_COLORS.text,
    lineHeight: 16,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    fontFamily: Fonts.sans,
    color: RECIPE_COLORS.text,
  },
  listWrap: {
    gap: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: RECIPE_COLORS.accent,
    marginTop: 8,
    marginRight: spacing.sm,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.sans,
    color: RECIPE_COLORS.text,
    lineHeight: 22,
  },
  instructItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNum: {
    fontSize: 13,
    fontFamily: Fonts.sans,
    color: RECIPE_COLORS.accent,
    width: 24,
    marginTop: 2,
  },
});
