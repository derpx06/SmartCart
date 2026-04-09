import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandStoryCard } from '@/components/luxury/BrandStoryCard';
import { CategoryScroller } from '@/components/luxury/CategoryScroller';
import { EditorialCollections } from '@/components/luxury/EditorialCollections';
import { HeroCarousel } from '@/components/luxury/HeroCarousel';
import { ProductCarousel } from '@/components/luxury/ProductCarousel';
import { RevealSection } from '@/components/luxury/RevealSection';
import { SeasonalBanner } from '@/components/luxury/SeasonalBanner';
import { ThemedText } from '@/components/themed-text';
import { luxuryShadow, palette, radius, spacing } from '@/components/luxury/design';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  bestsellers,
  categories,
  collections,
  heroSlides,
  recommendedProducts,
} from '@/data/luxuryHomeData';
import { Fonts } from '@/constants/theme';

export function LuxuryHomeScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);
  const background = useThemeColor({}, 'background');
  const border = useThemeColor({}, 'border');
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const mutedText = useThemeColor({}, 'mutedText');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1400);

    return () => clearTimeout(timer);
  }, []);

  const headerBackground = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: ['rgba(0,0,0,0)', background],
    extrapolate: 'clamp',
  });

  const headerBorder = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerShadow = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: [0, 0.15],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView edges={["left", "right"]} style={[styles.safeArea, { backgroundColor: background }]}>
      <View style={[styles.root, { backgroundColor: background }]}>
        <View style={styles.bgOrbOne} />
        <View style={styles.bgOrbTwo} />

        <Animated.View
          style={[
            styles.stickyHeader,
            {
              paddingTop: insets.top + 10,
              backgroundColor: headerBackground,
              borderBottomColor: border,
              borderBottomWidth: headerBorder,
              shadowOpacity: headerShadow,
            },
          ]}>
          <View style={styles.headerTopRow}>
            <View style={styles.brandWrap}>
              <View style={styles.logoDot} />
              <ThemedText style={styles.brand}>AURELIA HOME</ThemedText>
            </View>
            <View style={styles.iconRow}>
              <Feather name="heart" size={19} color={text} />
              <Feather name="shopping-bag" size={19} color={text} />
              <Feather name="user" size={19} color={text} />
            </View>
          </View>

          <View style={[styles.searchWrap, { backgroundColor: card, borderColor: border }]}>
            <Ionicons name="search" size={16} color={mutedText} />
            <TextInput
              value=""
              editable={false}
              placeholder="Search cookware, furniture, decor..."
              placeholderTextColor={mutedText}
              style={[styles.searchInput, { color: mutedText }]}
            />
          </View>
        </Animated.View>

        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={{
            paddingTop: insets.top + 126,
            paddingBottom: 110,
          }}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}>
          <RevealSection>
            <HeroCarousel slides={heroSlides} loading={loading} />
          </RevealSection>

          <RevealSection style={styles.sectionWrap} delay={70}>
            <CategoryScroller categories={categories} loading={loading} />
          </RevealSection>

          <RevealSection style={styles.sectionWrap} delay={140}>
            <EditorialCollections collections={collections} loading={loading} />
          </RevealSection>

          <RevealSection style={styles.sectionWrap} delay={210}>
            <ProductCarousel
              title="Bestsellers"
              caption="Most loved by modern hosts and home chefs."
              products={bestsellers}
              loading={loading}
            />
          </RevealSection>

          <RevealSection style={styles.sectionWrap} delay={280}>
            <SeasonalBanner loading={loading} />
          </RevealSection>

          <RevealSection style={styles.sectionWrap} delay={340}>
            <ProductCarousel
              title="For Your Kitchen"
              caption="Personalized picks based on your taste and recent browsing."
              products={recommendedProducts}
              loading={loading}
            />
          </RevealSection>

          <RevealSection style={styles.sectionWrap} delay={400}>
            <BrandStoryCard loading={loading} />
          </RevealSection>
        </Animated.ScrollView>
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
  bgOrbOne: {
    position: 'absolute',
    top: -120,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: '#F3E7D6',
    opacity: 0.46,
  },
  bgOrbTwo: {
    position: 'absolute',
    top: 290,
    left: -120,
    width: 250,
    height: 250,
    borderRadius: 250,
    backgroundColor: '#F7EEDF',
    opacity: 0.37,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 0,
    shadowColor: '#1E1914',
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 18,
    elevation: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoDot: {
    width: 16,
    height: 16,
    borderRadius: 16,
    backgroundColor: palette.gold,
    borderWidth: 4,
    borderColor: '#EADCC6',
  },
  brand: {
    fontFamily: Fonts.sans,
    letterSpacing: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchWrap: {
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 46,
    gap: spacing.xs,
    ...luxuryShadow,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
  },
  sectionWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },
});
