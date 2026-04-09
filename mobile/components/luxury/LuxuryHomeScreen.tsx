import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
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
import { luxuryShadow, radius, spacing } from '@/components/luxury/design';
import {
  bestsellers,
  categories,
  collections,
  heroSlides,
  recommendedProducts,
} from '@/data/luxuryHomeData';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export function LuxuryHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);
  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const mutedText = useThemeColor({}, 'mutedText');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  const headerBackground = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: ['transparent', background],
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
    <SafeAreaView edges={['left', 'right']} style={[styles.safeArea, { backgroundColor: background }]}>
      <View style={[styles.root, { backgroundColor: background }]}>
        <Animated.View
          style={[
            styles.stickyHeader,
            {
              paddingTop: insets.top + 10,
              backgroundColor: headerBackground,
              borderBottomColor: border,
              borderBottomWidth: headerBorder,
              shadowColor: text,
              shadowOpacity: headerShadow,
            },
          ]}>
          <View style={styles.headerTopRow}>
            <View style={styles.brandWrap}>
              <View
                style={[
                  styles.logoDot,
                  { backgroundColor: text, borderColor: background },
                ]}
              />
              <Text style={[styles.brand, { color: text }]}>AURELIA HOME</Text>
            </View>
            <View style={styles.iconRow}>
              <Pressable style={[styles.iconButton, { backgroundColor: card, borderColor: border }]}>
                <Feather name="heart" size={17} color={text} />
              </Pressable>
              <Pressable style={[styles.iconButton, { backgroundColor: card, borderColor: border }]}>
                <Feather name="shopping-bag" size={17} color={text} />
              </Pressable>
              <Pressable
                onPress={() => router.push('/(auth)/sign-in')}
                hitSlop={10}
                style={[styles.iconButton, { backgroundColor: card, borderColor: border }]}>
                <Feather name="user" size={17} color={text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.headerMetaRow}>
            <View
              style={[
                styles.metaPill,
                {
                  backgroundColor: card,
                  borderColor: border,
                },
              ]}>
              <Feather name="truck" size={12} color={text} />
              <Text style={[styles.metaText, { color: mutedText }]}>Express delivery in 90 mins</Text>
            </View>
            <Text style={[styles.metaLink, { color: text }]}>Curated picks</Text>
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
            paddingTop: insets.top + 142,
            paddingBottom: 110,
          }}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}>
          <RevealSection style={styles.heroWrap}>
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
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: 'transparent',
  },
  brand: {
    fontFamily: Fonts.serif,
    letterSpacing: 1,
    fontSize: 15,
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
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  metaLink: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    letterSpacing: 0.4,
    fontWeight: '600',
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
