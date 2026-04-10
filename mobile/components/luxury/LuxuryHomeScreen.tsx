import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandStoryCard } from '@/components/luxury/BrandStoryCard';
import { CategoryScroller } from '@/components/luxury/CategoryScroller';
import { EditorialCollections } from '@/components/luxury/EditorialCollections';
import { ProductCarousel } from '@/components/luxury/ProductCarousel';
import { RevealSection } from '@/components/luxury/RevealSection';
import { SeasonalBanner } from '@/components/luxury/SeasonalBanner';
import { luxuryShadow, radius, spacing, useLuxuryPalette } from '@/components/luxury/design';
import { ProductItem } from '@/data/luxuryHomeData';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useHomeStore } from '@/store/home-store';

const promoMessages = [
  'Save 10% off full-price items*',
  'Free delivery on orders above $99',
  'New spring arrivals just dropped',
];

const quickFilters = ['All Product', 'Living Room', 'Bedroom', 'Kitchen'];

export function LuxuryHomeScreen() {
  const router = useRouter();
  const loading = useHomeStore((state) => state.loading);
  const refreshing = useHomeStore((state) => state.refreshing);
  const homeData = useHomeStore((state) => state.homeData);
  const loadHome = useHomeStore((state) => state.loadHome);
  const refreshHome = useHomeStore((state) => state.refreshHome);
  const background = useThemeColor({}, 'background');
  const palette = useLuxuryPalette();
  const [activeFilter, setActiveFilter] = useState(quickFilters[0]);

  useEffect(() => {
    void loadHome();
  }, [loadHome]);

  const onRefresh = async () => {
    await refreshHome();
  };

  const openProduct = (product: ProductItem) => {
    router.push(`/product/${product.slug || 'signature-enameled-cast-iron-dutch-oven'}`);
  };

  const heroImage = homeData.heroSlides[0]?.image;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: background }]}>
      <View style={[styles.root, { backgroundColor: background }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{
            paddingBottom: 110,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={palette.text}
              colors={[palette.text]}
            />
          }>
          <View
            style={[
              styles.promoRow,
              {
                marginTop: spacing.sm,
                backgroundColor: palette.champagne,
                borderColor: palette.line,
              },
            ]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promoScroll}>
              {promoMessages.map((message) => (
                <View key={message} style={styles.promoItem}>
                  <Text style={[styles.promoText, { color: palette.text }]} numberOfLines={1}>
                    {message}
                  </Text>
                  <View style={[styles.promoDot, { backgroundColor: palette.mutedText }]} />
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={[styles.heroCard, { backgroundColor: palette.elevated, borderColor: palette.line }]}>
            {loading ? (
              <View style={[styles.heroSkeleton, { backgroundColor: palette.skeleton }]} />
            ) : (
              <Image
                source={{
                  uri:
                    heroImage ||
                    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1400&q=80',
                }}
                style={styles.heroImage}
                contentFit="cover"
                transition={650}
              />
            )}
            <View style={[styles.heroShade, { backgroundColor: palette.overlay }]} />
            <Text style={styles.heroCopy}>Find Furniture You&apos;ll Love - Delivered to Your Door.</Text>
          </View>

          <View style={[styles.searchWrap, { backgroundColor: palette.elevated, borderColor: palette.line }]}>
            <Ionicons name="search" size={16} color={palette.mutedText} />
            <TextInput
              value=""
              editable={false}
              placeholder="Search anything..."
              placeholderTextColor={palette.mutedText}
              style={[styles.searchInput, { color: palette.text }]}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}>
            {quickFilters.map((filter) => {
              const isActive = filter === activeFilter;
              return (
                <Pressable
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={styles.filterItem}>
                  <Text
                    style={[
                      styles.filterText,
                      {
                        color: isActive ? palette.text : palette.mutedText,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}>
                    {filter}
                  </Text>
                  <View
                    style={[
                      styles.filterUnderline,
                      { backgroundColor: isActive ? palette.text : 'transparent' },
                    ]}
                  />
                </Pressable>
              );
            })}
          </ScrollView>

          <RevealSection style={[styles.sectionWrap, styles.firstSectionWrap]} delay={60}>
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
        </ScrollView>
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
  promoRow: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    height: 38,
    justifyContent: 'center',
  },
  promoScroll: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  promoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  promoText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  promoDot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    marginLeft: spacing.md,
    opacity: 0.55,
  },
  heroCard: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    height: 310,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    ...luxuryShadow,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroSkeleton: {
    flex: 1,
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    top: '42%',
  },
  heroCopy: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    color: '#FFF9F3',
    fontFamily: Fonts.sans,
    fontSize: 35,
    lineHeight: 42,
    fontWeight: '700',
  },
  searchWrap: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 46,
    gap: spacing.xs,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingBottom: spacing.xxs,
  },
  filterItem: {
    marginRight: spacing.lg,
    alignItems: 'center',
  },
  filterText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  filterUnderline: {
    height: 2,
    width: '100%',
    borderRadius: 2,
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
  firstSectionWrap: {
    marginTop: spacing.md,
  },
});
