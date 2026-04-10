import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/components/luxury/AnimatedPressable';
import { luxuryShadow, palette, radius, spacing } from '@/components/luxury/design';
import { FLOATING_TAB_BAR_HEIGHT, getFloatingTabBarBottomOffset } from '@/components/navigation/FloatingTabBar';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { mockRecipes } from '@/data/recipesData';

const RECIPE_COLORS = {
  background: palette.background,
  card: palette.elevated,
  text: palette.text,
  muted: palette.mutedText,
  accent: palette.gold,
  accentSoft: palette.line,
  border: palette.line,
  overlay: palette.overlay,
};

export default function RecipeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [featuredRecipe, ...remainingRecipes] = mockRecipes;

  const tabBarClearance = getFloatingTabBarBottomOffset(insets.bottom) + FLOATING_TAB_BAR_HEIGHT + spacing.md;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <ThemedText style={styles.kicker}>Recipe Journal</ThemedText>
        <ThemedText style={styles.title}>Cook Better At Home</ThemedText>
        <ThemedText style={styles.subtitle}>{mockRecipes.length} curated recipes with matching goods and tools.</ThemedText>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        showsVerticalScrollIndicator={false}>
        {featuredRecipe && (
          <AnimatedPressable
            onPress={() => router.push(`/recipe/${featuredRecipe.id}` as any)}
            style={styles.featuredCard}>
            <View style={styles.featuredImageWrap}>
              <Image
                source={{ uri: featuredRecipe.image }}
                style={styles.featuredImage}
                contentFit="cover"
                transition={300}
              />
              <View style={styles.featuredShade} />
              <View style={styles.featuredTopMeta}>
                <View style={styles.featuredPill}>
                  <Ionicons name="sparkles-outline" size={12} color="#FFFFFF" />
                  <ThemedText style={styles.featuredPillText}>Featured</ThemedText>
                </View>
                <View style={styles.featuredPill}>
                  <Ionicons name="time-outline" size={12} color="#FFFFFF" />
                  <ThemedText style={styles.featuredPillText}>{featuredRecipe.time}</ThemedText>
                </View>
              </View>
              <View style={styles.featuredBottomMeta}>
                <ThemedText style={styles.featuredTitle}>{featuredRecipe.title}</ThemedText>
                <ThemedText style={styles.featuredDesc} numberOfLines={2}>
                  {featuredRecipe.description}
                </ThemedText>
              </View>
            </View>
          </AnimatedPressable>
        )}

        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionTitle}>All Recipes</ThemedText>
          <View style={styles.countChip}>
            <ThemedText style={styles.countChipText}>{mockRecipes.length}</ThemedText>
          </View>
        </View>

        {(remainingRecipes.length > 0 ? remainingRecipes : mockRecipes).map((recipe) => (
          <AnimatedPressable
            key={recipe.id}
            onPress={() => router.push(`/recipe/${recipe.id}` as any)}
            style={styles.recipeCard}>
            <View style={styles.thumbWrap}>
              <Image
                source={{ uri: recipe.image }}
                style={styles.thumbImage}
                contentFit="cover"
                transition={300}
              />
            </View>

            <View style={styles.cardContent}>
              <View style={styles.metaRowTop}>
                <View style={styles.difficultyChip}>
                  <ThemedText style={styles.difficultyText}>{recipe.difficulty}</ThemedText>
                </View>
                <View style={styles.inlineTime}>
                  <Ionicons name="time-outline" size={13} color={RECIPE_COLORS.accent} />
                  <ThemedText style={styles.timeText}>{recipe.time}</ThemedText>
                </View>
              </View>

              <ThemedText style={styles.recipeTitle} numberOfLines={2}>
                {recipe.title}
              </ThemedText>

              <ThemedText style={styles.recipeDescription} numberOfLines={2}>
                {recipe.description}
              </ThemedText>

              <View style={styles.bottomMetaRow}>
                <View style={styles.softChip}>
                  <Ionicons name="people-outline" size={12} color={RECIPE_COLORS.accent} />
                  <ThemedText style={styles.softChipText}>{recipe.servings}</ThemedText>
                </View>
                <View style={styles.softChip}>
                  <Ionicons name="list-outline" size={12} color={RECIPE_COLORS.accent} />
                  <ThemedText style={styles.softChipText}>{recipe.ingredients.length} ingredients</ThemedText>
                </View>
                <Ionicons name="arrow-forward" size={16} color={RECIPE_COLORS.accent} />
              </View>
            </View>
          </AnimatedPressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: RECIPE_COLORS.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  kicker: {
    fontSize: 11,
    fontFamily: Fonts.sans,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: RECIPE_COLORS.accent,
    marginBottom: spacing.xxs,
  },
  title: {
    fontSize: 31,
    fontFamily: Fonts.serif,
    color: RECIPE_COLORS.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: Fonts.sans,
    color: RECIPE_COLORS.muted,
    lineHeight: 19,
  },
  content: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  featuredCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...luxuryShadow,
  },
  featuredImageWrap: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: palette.surface,
    position: 'relative',
    justifyContent: 'space-between',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  featuredShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: RECIPE_COLORS.overlay,
  },
  featuredTopMeta: {
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  featuredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  featuredPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: Fonts.sans,
    letterSpacing: 0.2,
  },
  featuredBottomMeta: {
    zIndex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  featuredTitle: {
    fontSize: 24,
    fontFamily: Fonts.serif,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  featuredDesc: {
    fontSize: 13,
    fontFamily: Fonts.sans,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 19,
    paddingRight: spacing.md,
  },
  sectionHeaderRow: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 19,
    fontFamily: Fonts.serif,
    color: RECIPE_COLORS.text,
  },
  countChip: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: RECIPE_COLORS.card,
    borderWidth: 1,
    borderColor: RECIPE_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countChipText: {
    fontSize: 12,
    color: RECIPE_COLORS.accent,
    fontFamily: Fonts.sans,
  },
  recipeCard: {
    backgroundColor: RECIPE_COLORS.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: RECIPE_COLORS.border,
    overflow: 'hidden',
    flexDirection: 'row',
    ...luxuryShadow,
  },
  thumbWrap: {
    width: 118,
    backgroundColor: palette.surface,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    minHeight: 158,
  },
  cardContent: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  metaRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: RECIPE_COLORS.accentSoft,
  },
  difficultyText: {
    fontSize: 10,
    fontFamily: Fonts.sans,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    color: RECIPE_COLORS.accent,
  },
  inlineTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: RECIPE_COLORS.accent,
  },
  recipeTitle: {
    fontSize: 20,
    fontFamily: Fonts.serif,
    color: RECIPE_COLORS.text,
    lineHeight: 25,
  },
  recipeDescription: {
    fontSize: 13,
    fontFamily: Fonts.sans,
    color: RECIPE_COLORS.muted,
    lineHeight: 18,
  },
  bottomMetaRow: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  softChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.surface,
  },
  softChipText: {
    fontSize: 11,
    fontFamily: Fonts.sans,
    color: RECIPE_COLORS.accent,
  },
});
