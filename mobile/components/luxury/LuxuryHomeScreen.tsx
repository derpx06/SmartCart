import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
import { EditorialCollections } from '@/components/luxury/EditorialCollections';
import { ProductCarousel } from '@/components/luxury/ProductCarousel';
import { SkeletonBlock } from '@/components/luxury/SkeletonBlock';
import { SeasonalBanner } from '@/components/luxury/SeasonalBanner';
import { luxuryShadow, radius, spacing } from '@/components/luxury/design';
import { ThemedText } from '@/components/themed-text';
import { ProductItem } from '@/data/luxuryHomeData';
import { Fonts } from '@/constants/theme';
import { useHomeStore } from '@/store/home-store';

const promoMessages = [
  'Save 10% off full-price items*',
  'Free delivery on orders above $99',
  'New spring arrivals just dropped',
];

const quickFilters = ['All Product', 'Living Room', 'Bedroom', 'Kitchen'];

const HOME_MONO = {
  white: '#FFFFFF',
  soft: '#E9E9E7',
  ink: '#1C1B1F',
};

const HOME_COLORS = {
  background: HOME_MONO.white,
  surface: HOME_MONO.soft,
  elevated: HOME_MONO.white,
  text: HOME_MONO.ink,
  mutedText: 'rgba(28, 27, 31, 0.68)',
  line: 'rgba(28, 27, 31, 0.14)',
  overlayTop: 'rgba(28, 27, 31, 0.16)',
  overlayBottom: 'transparent',
  panelBg: 'transparent',
  panelBorder: 'transparent',
  chipBg: 'rgba(255, 255, 255, 0.9)',
  skeleton: 'rgba(28, 27, 31, 0.12)',
};

function HomeLoadingSkeleton() {
  return (
    <View>
      <View style={[styles.promoRow, styles.skeletonNoBorder, { marginTop: spacing.sm }]}>
        <View style={styles.promoSkeletonInner}>
          <SkeletonBlock width="88%" height={14} borderRadius={8} />
        </View>
      </View>

      <View style={[styles.heroCard, styles.skeletonNoBorder]}>
        <SkeletonBlock height={336} borderRadius={radius.xl} />
      </View>

      <View style={[styles.searchWrap, styles.skeletonNoBorder]}>
        <SkeletonBlock width="100%" height={46} borderRadius={radius.pill} />
      </View>

      <View style={styles.filterRow}>
        <SkeletonBlock width={90} height={14} borderRadius={6} style={styles.filterSkeletonItem} />
        <SkeletonBlock width={96} height={14} borderRadius={6} style={styles.filterSkeletonItem} />
        <SkeletonBlock width={84} height={14} borderRadius={6} style={styles.filterSkeletonItem} />
      </View>

      <View style={[styles.sectionWrap, styles.firstSectionWrap]}>
        <SkeletonBlock width="100%" height={230} borderRadius={radius.xl} />
      </View>
      <View style={styles.sectionWrap}>
        <SkeletonBlock width="100%" height={210} borderRadius={radius.xl} />
      </View>
      <View style={styles.sectionWrap}>
        <SkeletonBlock width="100%" height={180} borderRadius={radius.xl} />
      </View>
    </View>
  );
}

export function LuxuryHomeScreen() {
  const router = useRouter();
  const loading = useHomeStore((state) => state.loading);
  const hasFetched = useHomeStore((state) => state.hasFetched);
  const refreshing = useHomeStore((state) => state.refreshing);
  const homeData = useHomeStore((state) => state.homeData);
  const loadHome = useHomeStore((state) => state.loadHome);
  const refreshHome = useHomeStore((state) => state.refreshHome);
  const background = HOME_COLORS.background;
  const [activeFilter, setActiveFilter] = useState<string | null>(quickFilters[0] ?? null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnreadNotifications] = useState(true);
  const [isFilterTransitioning, setIsFilterTransitioning] = useState(false);
  const filterContentAnim = useRef(new Animated.Value(1)).current;
  const filterUnderlineX = useRef(new Animated.Value(0)).current;
  const filterUnderlineWidth = useRef(new Animated.Value(0)).current;
  const [filterLayouts, setFilterLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const showInitialSkeleton = loading && !hasFetched;

  useEffect(() => {
    if (!hasFetched) {
      void loadHome();
    }
  }, [hasFetched, loadHome]);

  const normalizeFilter = (filter: string | null) =>
    filter && filter !== 'All Product' ? filter : undefined;

  const onRefresh = async () => {
    await refreshHome(normalizeFilter(activeFilter));
  };

  const openProduct = (product: ProductItem) => {
    router.push(`/product/${product.slug || 'signature-enameled-cast-iron-dutch-oven'}`);
  };

  const openSearchResults = (query: string, filter: string | null) => {
    const trimmedQuery = query.trim();
    const normalizedFilter = filter && filter !== 'All Product' ? filter : undefined;
    const params: Record<string, string> = {};

    if (trimmedQuery) {
      params.q = trimmedQuery;
    }
    if (normalizedFilter) {
      params.category = normalizedFilter;
    }

    router.push({
      pathname: '/(tabs)/search',
      params,
    });
  };

  const handleSubmitSearch = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setActiveFilter(quickFilters[0] ?? null);
    openSearchResults(trimmed, null);
  };

  const runFilterContentAnimation = (toValue: number, duration: number) =>
    new Promise<void>((resolve) => {
      Animated.timing(filterContentAnim, {
        toValue,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => resolve());
    });

  const handleSelectFilter = async (filter: string) => {
    if (isFilterTransitioning || filter === activeFilter) return;
    setIsFilterTransitioning(true);

    await runFilterContentAnimation(0, 140);
    setActiveFilter(filter);
    await loadHome(normalizeFilter(filter));
    await runFilterContentAnimation(1, 220);
    setIsFilterTransitioning(false);
  };

  useEffect(() => {
    if (!activeFilter) return;
    const activeLayout = filterLayouts[activeFilter];
    if (!activeLayout) return;

    Animated.parallel([
      Animated.timing(filterUnderlineX, {
        toValue: activeLayout.x,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(filterUnderlineWidth, {
        toValue: activeLayout.width,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [activeFilter, filterLayouts, filterUnderlineWidth, filterUnderlineX]);

  const heroImage = homeData.heroSlides[0]?.image;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: background }]}>
      <View style={[styles.root, { backgroundColor: background }]}>
        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            paddingBottom: 110,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={HOME_COLORS.text}
              colors={[HOME_COLORS.text]}
            />
          }>
          <View style={styles.homeHeaderRow}>
            <View>
              <ThemedText style={styles.homeHeaderEyebrow}>Welcome back</ThemedText>
              <ThemedText type="title" style={styles.homeHeaderTitle}>
                Williams Sonoma
              </ThemedText>
            </View>
            <View style={styles.homeHeaderActions}>
              <Pressable
                style={styles.headerIconButton}
                accessibilityRole="button"
                accessibilityLabel="Profile"
                onPress={() => router.push('/(tabs)/profile')}>
                <Ionicons name="person-outline" size={18} color={HOME_COLORS.text} />
              </Pressable>
              <Pressable
                style={styles.headerIconButton}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                onPress={() => router.push('/(tabs)/notifications')}>
                <Ionicons name="notifications-outline" size={18} color={HOME_COLORS.text} />
                {hasUnreadNotifications ? <View style={styles.notificationDot} /> : null}
              </Pressable>
            </View>
          </View>
          {showInitialSkeleton ? (
            <HomeLoadingSkeleton />
          ) : (
            <>
              <View
                style={[
                  styles.promoRow,
                  {
                    marginTop: spacing.sm,
                    backgroundColor: HOME_COLORS.surface,
                    borderColor: HOME_COLORS.line,
                  },
                ]}>
                <ScrollView
                  horizontal
                  keyboardShouldPersistTaps="always"
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.promoScroll}>
                  {promoMessages.map((message, index) => (
                    <View key={message} style={styles.promoItem}>
                      <View style={styles.promoIconWrap}>
                        <Ionicons name="sparkles-outline" size={11} color={HOME_COLORS.text} />
                      </View>
                      <Text style={[styles.promoText, { color: HOME_COLORS.text }]} numberOfLines={1}>
                        {message}
                      </Text>
                      {index < promoMessages.length - 1 ? (
                        <View style={[styles.promoDot, { backgroundColor: HOME_COLORS.mutedText }]} />
                      ) : null}
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View style={[styles.heroCard, { backgroundColor: HOME_COLORS.elevated, borderColor: HOME_COLORS.line }]}>
                <Image
                  source={{
                    uri:
                      heroImage ||
                      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1400&q=80',
                  }}
                  style={styles.heroImage}
                  contentFit="cover"
                  transition={0}
                />
                <View style={[styles.heroShadeTop, { backgroundColor: HOME_COLORS.overlayTop }]} />

                <View style={[styles.heroBadge, { backgroundColor: HOME_COLORS.chipBg }]}>
                  <Ionicons name="cube-outline" size={12} color={HOME_COLORS.text} />
                  <Text style={[styles.heroBadgeText, { color: HOME_COLORS.text }]}>NEW ARRIVALS</Text>
                </View>

                <View
                  style={[
                    styles.heroCopyWrap,
                    { backgroundColor: HOME_COLORS.panelBg, borderColor: HOME_COLORS.panelBorder },
                  ]}>
                  <Text style={styles.heroTitle}>Find Furniture You&apos;ll Love.</Text>
                  <Text style={styles.heroSubTitle}>Delivered to your door with curated picks for every room.</Text>
                  <View style={styles.heroCtaRow}>
                    <Text style={styles.heroCtaText}>Shop featured picks</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                  </View>
                </View>
              </View>

              <View style={[styles.searchWrap, { backgroundColor: HOME_COLORS.elevated, borderColor: HOME_COLORS.line }]}>
                <Pressable onPress={handleSubmitSearch} style={styles.searchSubmitBtn}>
                  <Ionicons name="search" size={16} color={HOME_COLORS.mutedText} />
                </Pressable>
                <TextInput
                  value={searchQuery}
                  editable
                  autoCorrect={false}
                  autoCapitalize="none"
                  spellCheck={false}
                  returnKeyType="go"
                  placeholder="Search anything..."
                  placeholderTextColor={HOME_COLORS.mutedText}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSubmitSearch}
                  style={[styles.searchInput, { color: HOME_COLORS.text }]}
                />
                {searchQuery.length > 0 ? (
                  <Pressable onPress={() => setSearchQuery('')} style={styles.searchClearBtn}>
                    <Ionicons name="close" size={14} color={HOME_COLORS.text} />
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.filterTabsContainer}>
                {quickFilters.map((filter) => {
                  const isActive = filter === activeFilter;
                  return (
                    <Pressable
                      key={filter}
                      onPress={() => handleSelectFilter(filter)}
                      disabled={isFilterTransitioning}
                      onLayout={(event) => {
                        const { x, width } = event.nativeEvent.layout;
                        setFilterLayouts((prev) => {
                          const existing = prev[filter];
                          if (existing && existing.x === x && existing.width === width) {
                            return prev;
                          }
                          return { ...prev, [filter]: { x, width } };
                        });
                      }}
                      style={styles.filterItem}>
                      <Text
                        style={[
                          styles.filterText,
                          {
                            color: isActive ? HOME_COLORS.text : HOME_COLORS.mutedText,
                            fontWeight: isActive ? '700' : '500',
                          },
                        ]}>
                        {filter}
                      </Text>
                    </Pressable>
                  );
                })}
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.filterUnderline,
                    {
                      backgroundColor: HOME_COLORS.text,
                      transform: [{ translateX: filterUnderlineX }],
                      width: filterUnderlineWidth,
                    },
                  ]}
                />
              </View>

              <Animated.View
                style={[
                  styles.filterContentWrap,
                  {
                    opacity: filterContentAnim,
                    transform: [
                      {
                        translateY: filterContentAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0],
                        }),
                      },
                    ],
                  },
                ]}>
                <View style={[styles.sectionWrap, styles.firstSectionWrap]}>
                  <EditorialCollections collections={homeData.collections} loading={false} />
                </View>

                <View style={styles.sectionWrap}>
                  <ProductCarousel
                    title="Bestsellers"
                    caption="Most loved by modern hosts and home chefs."
                    products={homeData.bestsellers}
                    loading={false}
                    onPressProduct={openProduct}
                  />
                </View>

                <View style={styles.sectionWrap}>
                  <SeasonalBanner loading={false} />
                </View>

                <View style={styles.sectionWrap}>
                  <ProductCarousel
                    title={`For Your ${activeFilter && activeFilter !== 'All Product' ? activeFilter : 'Kitchen'}`}
                    caption="Personalized picks based on your taste and recent browsing."
                    products={homeData.recommendedProducts}
                    loading={false}
                    onPressProduct={openProduct}
                  />
                </View>

                <View style={styles.sectionWrap}>
                  <BrandStoryCard loading={false} />
                </View>
              </Animated.View>
            </>
          )}
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
  homeHeaderRow: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  homeHeaderEyebrow: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: HOME_COLORS.mutedText,
  },
  homeHeaderTitle: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    lineHeight: 30,
    color: HOME_COLORS.text,
    fontWeight: '700',
  },
  homeHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: HOME_COLORS.line,
    backgroundColor: HOME_COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5A5F',
  },
  promoRow: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 42,
    justifyContent: 'center',
  },
  promoScroll: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    alignItems: 'center',
  },
  promoSkeletonInner: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
  },
  skeletonNoBorder: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  promoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  promoIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    height: 336,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    ...luxuryShadow,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroShadeTop: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    bottom: '46%',
  },
  heroShadeBottom: {
    ...StyleSheet.absoluteFillObject,
    top: '34%',
  },
  heroBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBadgeText: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroCopyWrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 8,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: Fonts.serif,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '700',
  },
  heroSubTitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    maxWidth: '94%',
  },
  heroCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    paddingTop: spacing.xs,
    marginTop: 2,
  },
  heroCtaText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sans,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
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
  searchSubmitBtn: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingBottom: spacing.xxs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterSkeletonItem: {
    marginRight: spacing.md,
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
  filterTabsContainer: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingBottom: spacing.xxs,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  filterUnderline: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 2,
    borderRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  searchClearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(28, 27, 31, 0.1)',
  },
  scrollView: {
    flex: 1,
  },
  filterContentWrap: {
    width: '100%',
  },
  sectionWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: 44,
  },
  firstSectionWrap: {
    marginTop: spacing.md,
  },
});
