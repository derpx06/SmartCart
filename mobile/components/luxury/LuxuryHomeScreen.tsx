import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  RefreshControl,
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
import { luxuryShadow, radius, spacing, useLuxuryPalette } from '@/components/luxury/design';
import { ProductItem } from '@/data/luxuryHomeData';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useHomeStore } from '@/store/home-store';

export function LuxuryHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const loading = useHomeStore((state) => state.loading);
  const refreshing = useHomeStore((state) => state.refreshing);
  const homeData = useHomeStore((state) => state.homeData);
  const loadHome = useHomeStore((state) => state.loadHome);
  const refreshHome = useHomeStore((state) => state.refreshHome);
  const background = useThemeColor({}, 'background');
  const palette = useLuxuryPalette();

  useEffect(() => {
    void loadHome();
  }, [loadHome]);

  const onRefresh = async () => {
    await refreshHome();
  };

  const headerBorder = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: [0, 0.9],
    extrapolate: 'clamp',
  });

  const headerShadow = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: [0, 0.18],
    extrapolate: 'clamp',
  });

  const openProduct = (product: ProductItem) => {
    router.push(`/product/${product.slug || 'signature-enameled-cast-iron-dutch-oven'}`);
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={[styles.safeArea, { backgroundColor: background }]}>
      <View style={[styles.root, { backgroundColor: background }]}>
        <Animated.View
          style={[
            styles.stickyHeader,
            {
              paddingTop: insets.top + 10,
              shadowColor: '#140E08',
              shadowOpacity: headerShadow,
            },
          ]}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.headerBackdrop,
              {
                backgroundColor: palette.surface,
                borderBottomColor: palette.line,
                borderBottomWidth: headerBorder,
                opacity: 1,
              },
            ]}
          />

          <View style={styles.headerTopRow}>
            <View style={styles.brandWrap}>
              <View
                style={[
                  styles.logoDot,
                  { backgroundColor: palette.gold, borderColor: palette.surface },
                ]}
              />
              <View>
                <Text style={[styles.brandEyebrow, { color: palette.mutedText }]}>AURELIA ATELIER</Text>
                <Text style={[styles.brand, { color: palette.text }]}>Luxury Home</Text>
              </View>
            </View>
            <View style={styles.iconRow}>
              <Pressable
                style={[
                  styles.iconButton,
                  { backgroundColor: palette.elevated, borderColor: palette.line },
                ]}>
                <Feather name="heart" size={17} color={palette.text} />
              </Pressable>
              <Pressable
                style={[
                  styles.iconButton,
                  { backgroundColor: palette.elevated, borderColor: palette.line },
                ]}>
                <Feather name="shopping-bag" size={17} color={palette.text} />
              </Pressable>
              <Pressable
                onPress={() => router.push('/(auth)/sign-in')}
                hitSlop={10}
                style={[
                  styles.iconButton,
                  { backgroundColor: palette.elevated, borderColor: palette.line },
                ]}>
                <Feather name="user" size={17} color={palette.text} />
              </Pressable>
            </View>
          </View>

          <View style={[styles.searchWrap, { backgroundColor: palette.elevated, borderColor: palette.line }]}>
            <Ionicons name="search" size={16} color={palette.mutedText} />
            <TextInput
              value=""
              editable={false}
              placeholder="Search cookware, furniture, decor..."
              placeholderTextColor={palette.mutedText}
              style={[styles.searchInput, { color: palette.text }]}
            />
          </View>
        </Animated.View>

        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={{
            paddingTop: insets.top + 116,
            paddingBottom: 110,
          }}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={palette.text}
              colors={[palette.text]}
            />
          }>
          <View pointerEvents="none" style={styles.atmosphereLayer}>
            <View style={[styles.orbOne, { backgroundColor: palette.orbOne }]} />
            <View style={[styles.orbTwo, { backgroundColor: palette.orbTwo }]} />
          </View>

          <RevealSection style={styles.heroWrap}>
            <HeroCarousel slides={homeData.heroSlides} loading={loading} />
          </RevealSection>

          <RevealSection style={styles.sectionWrap} delay={70}>
            <CategoryScroller categories={homeData.categories} loading={loading} />
          </RevealSection>

          <RevealSection style={styles.sectionWrap} delay={140}>
            <EditorialCollections collections={homeData.collections} loading={loading} />
          </RevealSection>

          <RevealSection style={styles.sectionWrap} delay={210}>
            <ProductCarousel
              title="Bestsellers"
              caption="Most loved by modern hosts and home chefs."
              products={homeData.bestsellers}
              loading={loading}
              onPressProduct={openProduct}
            />
          </RevealSection>

          <RevealSection style={styles.sectionWrap} delay={280}>
            <SeasonalBanner loading={loading} />
          </RevealSection>

          <RevealSection style={styles.sectionWrap} delay={340}>
            <ProductCarousel
              title="For Your Kitchen"
              caption="Personalized picks based on your taste and recent browsing."
              products={homeData.recommendedProducts}
              loading={loading}
              onPressProduct={openProduct}
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
  atmosphereLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 340,
  },
  orbOne: {
    position: 'absolute',
    width: 290,
    height: 290,
    borderRadius: 290,
    left: -118,
    top: 28,
    opacity: 0.56,
  },
  orbTwo: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 240,
    right: -94,
    top: 138,
    opacity: 0.48,
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
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 18,
    elevation: 10,
  },
  headerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    borderBottomWidth: 0,
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
  brandEyebrow: {
    fontFamily: Fonts.sans,
    letterSpacing: 1.2,
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 2,
    fontWeight: '700',
  },
  logoDot: {
    width: 16,
    height: 16,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: 'transparent',
  },
  brand: {
    fontFamily: Fonts.serif,
    letterSpacing: 0.5,
    fontSize: 16,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    borderRadius: 999,
    borderWidth: 1,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 44,
  },
  heroWrap: {
    marginTop: spacing.lg,
  },
});
