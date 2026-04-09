import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
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
import { luxuryShadow, palette, radius, spacing } from '@/components/luxury/design';
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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1400);

    return () => clearTimeout(timer);
  }, []);

  const headerBackground = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: ['rgba(255, 249, 241, 0)', '#FFF9F1'],
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
    <SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.bgOrbOne} />
        <View style={styles.bgOrbTwo} />

        <Animated.View
          style={[
            styles.stickyHeader,
            {
              paddingTop: insets.top + 10,
              backgroundColor: headerBackground,
              borderBottomColor: '#EEDFCB',
              borderBottomWidth: headerBorder,
              shadowOpacity: headerShadow,
            },
          ]}>
          <View style={styles.headerTopRow}>
            <View style={styles.brandWrap}>
              <View style={styles.logoDot} />
              <Text style={styles.brand}>AURELIA HOME</Text>
            </View>
            <View style={styles.iconRow}>
              <Feather name="heart" size={19} color={palette.text} />
              <Feather name="shopping-bag" size={19} color={palette.text} />
              <Feather name="user" size={19} color={palette.text} />
            </View>
          </View>

          <View style={styles.searchWrap}>
            <Ionicons name="search" size={16} color="#7C7468" />
            <TextInput
              value=""
              editable={false}
              placeholder="Search cookware, furniture, decor..."
              placeholderTextColor="#8E8578"
              style={styles.searchInput}
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
    backgroundColor: palette.background,
  },
  root: {
    flex: 1,
    backgroundColor: palette.background,
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
    color: palette.text,
    fontFamily: Fonts.serif,
    letterSpacing: 1,
    fontSize: 15,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchWrap: {
    borderRadius: radius.pill,
    backgroundColor: '#FFFCF7',
    borderWidth: 1,
    borderColor: '#E9DDCC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 46,
    gap: spacing.xs,
    ...luxuryShadow,
  },
  searchInput: {
    flex: 1,
    color: '#8E8578',
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
