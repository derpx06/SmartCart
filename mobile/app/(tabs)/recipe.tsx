import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/components/luxury/AnimatedPressable';
import { luxuryShadow, radius, spacing } from '@/components/luxury/design';
import { FLOATING_TAB_BAR_HEIGHT, getFloatingTabBarBottomOffset } from '@/components/navigation/FloatingTabBar';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { mockRecipes } from '@/data/recipesData';

const RECIPE_COLORS = {
  background: '#FAF9F7',
  card: '#FFFFFF',
  text: '#1C1B1F',
  muted: 'rgba(28, 27, 31, 0.68)',
  accent: '#7D7365', // warmer accent
  line: 'rgba(28, 27, 31, 0.08)',
};

export default function RecipeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const tabBarClearance = getFloatingTabBarBottomOffset(insets.bottom) + FLOATING_TAB_BAR_HEIGHT + spacing.md;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <ThemedText style={styles.kicker}>Inspiration</ThemedText>
        <ThemedText style={styles.title}>Culinary Journal</ThemedText>
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        showsVerticalScrollIndicator={false}>
        {mockRecipes.map((recipe) => (
          <AnimatedPressable
            key={recipe.id}
            onPress={() => router.push(`/recipe/${recipe.id}` as any)}
            style={styles.recipeCard}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: recipe.image }}
                style={styles.image}
                contentFit="cover"
                transition={300}
              />
              <View style={styles.timeTag}>
                <Ionicons name="time-outline" size={14} color="#1C1B1F" />
                <ThemedText style={styles.timeText}>{recipe.time}</ThemedText>
              </View>
            </View>
            <View style={styles.cardContent}>
              <ThemedText style={styles.difficultyTag}>{recipe.difficulty}</ThemedText>
              <ThemedText style={styles.recipeTitle}>{recipe.title}</ThemedText>
              <ThemedText style={styles.recipeDescription} numberOfLines={2}>
                {recipe.description}
              </ThemedText>
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
    paddingBottom: spacing.md,
  },
  kicker: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: RECIPE_COLORS.accent,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.serif,
    color: RECIPE_COLORS.text,
  },
  content: {
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  recipeCard: {
    backgroundColor: RECIPE_COLORS.card,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...luxuryShadow,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#E9E9E7',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  timeTag: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: '#1C1B1F',
  },
  cardContent: {
    padding: spacing.md,
  },
  difficultyTag: {
    fontSize: 11,
    fontFamily: Fonts.sans,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: RECIPE_COLORS.accent,
    marginBottom: spacing.xs,
  },
  recipeTitle: {
    fontSize: 22,
    fontFamily: Fonts.serif,
    color: RECIPE_COLORS.text,
    marginBottom: spacing.xs,
  },
  recipeDescription: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    color: RECIPE_COLORS.muted,
    lineHeight: 20,
  },
});
