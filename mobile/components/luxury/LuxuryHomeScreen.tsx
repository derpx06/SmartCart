import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { HomeRowRail } from '@/components/home/HomeRowRail';
import { ProductItem } from '@/data/luxuryHomeData';
import { Fonts } from '@/constants/theme';
import { useHomeStore } from '@/store/home-store';
import { useWishlistStore } from '@/store/wishlist-store';

const promoMessages = [
  'Save 10% off full-price items*',
  'Free delivery on orders above $99',
  'New spring arrivals just dropped',
];

const quickFilters = ['All Product', 'Living Room', 'Bedroom', 'Kitchen'];
type HeroDisplaySlide = {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  image: string;
};

const FILTER_HERO_SLIDES: Record<string, HeroDisplaySlide[]> = {
  'All Product': [
    {
      id: 'all-1',
      title: "Find Furniture You'll Love.",
      subtitle: 'Delivered to your door with curated picks for every room.',
      ctaLabel: 'Shop featured picks',
      image:
        'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1400&q=80',
    },
    {
      id: 'all-2',
      title: 'Timeless Pieces For Every Space.',
      subtitle: 'Elevated essentials made for hosting, lounging, and daily living.',
      ctaLabel: 'Browse home edit',
      image:
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
    },
    {
      id: 'all-3',
      title: 'Designed To Feel Like Home.',
      subtitle: 'Warm textures and refined finishes to complete your signature style.',
      ctaLabel: 'Explore new arrivals',
      image:
        'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1400&q=80',
    },
  ],
  'Living Room': [
    {
      id: 'living-1',
      title: 'Curated Comfort For Living Rooms.',
      subtitle: 'Layered seating, soft lighting, and statement accents that feel effortless.',
      ctaLabel: 'Shop living room',
      image:
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80',
    },
    {
      id: 'living-2',
      title: 'Host In Style, Every Evening.',
      subtitle: 'Sophisticated furniture for conversations, coffee, and calm weekends.',
      ctaLabel: 'View lounge picks',
      image:
        'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1400&q=80',
    },
    {
      id: 'living-3',
      title: 'Statement Sofas. Soft Details.',
      subtitle: 'Bring depth and character to your main space with premium textures.',
      ctaLabel: 'Refresh your space',
      image:
        'https://images.unsplash.com/photo-1616593969747-4797dc75033e?auto=format&fit=crop&w=1400&q=80',
    },
  ],
  Bedroom: [
    {
      id: 'bedroom-1',
      title: 'Bedroom Calm, Perfected.',
      subtitle: 'Luxury linens, natural woods, and soft silhouettes for restful nights.',
      ctaLabel: 'Shop bedroom',
      image:
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
    },
    {
      id: 'bedroom-2',
      title: 'Wake Up In A Better Space.',
      subtitle: 'Thoughtful essentials that make mornings lighter and evenings slower.',
      ctaLabel: 'Discover sleep edit',
      image:
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1400&q=80',
    },
    {
      id: 'bedroom-3',
      title: 'Soft Layers, Strong Character.',
      subtitle: 'From bedding to decor, build a room that feels personal and serene.',
      ctaLabel: 'See bedroom trends',
      image:
        'https://images.unsplash.com/photo-1616594039964-3ad06f1b8fd1?auto=format&fit=crop&w=1400&q=80',
    },
  ],
  Kitchen: [
    {
      id: 'kitchen-1',
      title: 'Cook Beautifully, Every Day.',
      subtitle: 'Pro-grade cookware and tools crafted for your everyday rituals.',
      ctaLabel: 'Shop kitchen',
      image:
        'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1400&q=80',
    },
    {
      id: 'kitchen-2',
      title: 'Make Every Meal Feel Special.',
      subtitle: 'Performance essentials designed for prep, serve, and savor.',
      ctaLabel: 'Explore cookware',
      image:
        'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1400&q=80',
    },
    {
      id: 'kitchen-3',
      title: 'Where Craft Meets Everyday Use.',
      subtitle: 'Elevate your countertop with timeless forms and lasting materials.',
      ctaLabel: 'Discover kitchen edit',
      image:
        'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&w=1400&q=80',
    },
  ],
};

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
  overlayBottom: 'rgba(28, 27, 31, 0.58)',
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
  const homeRows = useHomeStore((state) => state.homeRows);
  const loadHome = useHomeStore((state) => state.loadHome);
  const refreshHome = useHomeStore((state) => state.refreshHome);
  const wishlistItemsCount = useWishlistStore((state) => state.items.length);
  const wishlistLoaded = useWishlistStore((state) => state.hasLoaded);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  const background = HOME_COLORS.background;
  const [activeFilter, setActiveFilter] = useState<string | null>(quickFilters[0] ?? null);
  const [activeHeroSlideIndex, setActiveHeroSlideIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnreadNotifications] = useState(true);
  const [isFilterTransitioning, setIsFilterTransitioning] = useState(false);
  const filterContentAnim = useRef(new Animated.Value(1)).current;
  const heroFadeAnim = useRef(new Animated.Value(1)).current;
  const filterUnderlineX = useRef(new Animated.Value(0)).current;
  const filterUnderlineWidth = useRef(new Animated.Value(0)).current;
  const [filterLayouts, setFilterLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const [focusSkeleton, setFocusSkeleton] = useState(false);
  const homeFirstFocusRef = useRef(true);
  const showInitialSkeleton = loading && !hasFetched;
  const showHomeSkeleton = showInitialSkeleton || focusSkeleton;

  useEffect(() => {
    if (!hasFetched) {
      void loadHome();
    }
  }, [hasFetched, loadHome]);

  useEffect(() => {
    if (wishlistLoaded) return;
    void fetchWishlist({ silent: true });
  }, [wishlistLoaded, fetchWishlist]);

  const normalizeFilter = (filter: string | null) =>
    filter && filter !== 'All Product' ? filter : undefined;

  useFocusEffect(
    useCallback(() => {
      if (homeFirstFocusRef.current) {
        homeFirstFocusRef.current = false;
        return undefined;
      }
      if (!hasFetched) {
        return undefined;
      }
      let active = true;
      setFocusSkeleton(true);
      void refreshHome(normalizeFilter(activeFilter), { silent: true }).finally(() => {
        if (active) {
          setFocusSkeleton(false);
        }
      });
      return () => {
        active = false;
        setFocusSkeleton(false);
      };
    }, [hasFetched, activeFilter, refreshHome]),
  );

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

  const activeHeroSlides = FILTER_HERO_SLIDES[activeFilter ?? 'All Product'] ?? FILTER_HERO_SLIDES['All Product'];
  const activeHeroSlide = activeHeroSlides[activeHeroSlideIndex] ?? activeHeroSlides[0];

  useEffect(() => {
    setActiveHeroSlideIndex(0);
    heroFadeAnim.setValue(1);
  }, [activeFilter, heroFadeAnim]);

  useEffect(() => {
    if (activeHeroSlides.length <= 1) return;
    const interval = setInterval(() => {
      Animated.timing(heroFadeAnim, {
        toValue: 0.2,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setActiveHeroSlideIndex((prev) => (prev + 1) % activeHeroSlides.length);
        Animated.timing(heroFadeAnim, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    }, 4800);

    return () => clearInterval(interval);
  }, [activeHeroSlides, heroFadeAnim]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: background }]}>
      <View style={[styles.root, { backgroundColor: background }]}>
        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          stickyHeaderIndices={[0]}
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
          <View style={[styles.stickyHeaderContainer, { backgroundColor: background }]}>
            <View style={styles.homeHeaderRow}>
              <View style={styles.homeHeaderCopy}>
                <ThemedText style={styles.homeHeaderEyebrow}>Welcome back</ThemedText>
                <ThemedText type="title" style={styles.homeHeaderTitle}>
                  Williams Sonoma
                </ThemedText>
              </View>
              <View style={styles.homeHeaderActionsWrap}>
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
                  accessibilityLabel="Wishlist"
                  onPress={() => router.push('/(tabs)/wishlist')}>
                  <Ionicons name="heart-outline" size={18} color={HOME_COLORS.text} />
                  {wishlistItemsCount > 0 ? (
                    <View style={styles.wishlistCountBadge}>
                      <Text style={styles.wishlistCountText}>{wishlistItemsCount > 99 ? '99+' : wishlistItemsCount}</Text>
                    </View>
                  ) : null}
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
            </View>
          </View>
          {showHomeSkeleton ? (
            <HomeLoadingSkeleton />
          ) : (
            <>
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

                <View
                  style={[styles.heroCard, { backgroundColor: HOME_COLORS.elevated, borderColor: HOME_COLORS.line }]}>
                  <Animated.View style={[styles.heroSlideLayer, { opacity: heroFadeAnim }]}>
                    <Image
                      source={{
                        uri:
                          activeHeroSlide?.image ||
                          'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1400&q=80',
                      }}
                      style={styles.heroImage}
                      contentFit="cover"
                      transition={0}
                    />
                    <View style={[styles.heroShadeTop, { backgroundColor: HOME_COLORS.overlayTop }]} />
                    <View style={[styles.heroShadeBottom, { backgroundColor: HOME_COLORS.overlayBottom }]} />

                    <View style={[styles.heroBadge, { backgroundColor: HOME_COLORS.chipBg }]}>
                      <Ionicons name="cube-outline" size={12} color={HOME_COLORS.text} />
                      <Text style={[styles.heroBadgeText, { color: HOME_COLORS.text }]}>NEW ARRIVALS</Text>
                    </View>

                    <View
                      style={[
                        styles.heroCopyWrap,
                        { backgroundColor: HOME_COLORS.panelBg, borderColor: HOME_COLORS.panelBorder },
                      ]}>
                      <Text style={styles.heroTitle}>{activeHeroSlide?.title ?? "Find Furniture You'll Love."}</Text>
                      <Text style={styles.heroSubTitle}>
                        {activeHeroSlide?.subtitle ?? 'Delivered to your door with curated picks for every room.'}
                      </Text>
                      <View style={styles.heroCtaRow}>
                        <Text style={styles.heroCtaText}>{activeHeroSlide?.ctaLabel ?? 'Shop featured picks'}</Text>
                        <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                      </View>
                    </View>
                  </Animated.View>
                  <View style={styles.heroPaginationRow}>
                    {activeHeroSlides.map((slide, index) => (
                      <View
                        key={slide.id}
                        style={[
                          styles.heroPaginationDot,
                          index === activeHeroSlideIndex && styles.heroPaginationDotActive,
                        ]}
                      />
                    ))}
                  </View>
                </View>

                <View
                  style={[styles.searchWrap, { backgroundColor: HOME_COLORS.elevated, borderColor: HOME_COLORS.line }]}>
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
              </Animated.View>

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

                {homeRows.map((row) => (
                  <View key={row.id} style={styles.sectionWrap}>
                    <HomeRowRail row={row} loading={false} onPressProduct={openProduct} />
                  </View>
                ))}

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
  stickyHeaderContainer: {
    paddingBottom: spacing.xs,
    zIndex: 2,
  },
  homeHeaderRow: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  homeHeaderCopy: {
    flex: 1,
    paddingTop: 2,
  },
  homeHeaderEyebrow: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    color: HOME_COLORS.mutedText,
  },
  homeHeaderTitle: {
    fontFamily: Fonts.serif,
    marginTop: 1,
    fontSize: 20,
    lineHeight: 24,
    color: HOME_COLORS.text,
    fontWeight: '700',
  },
  homeHeaderActionsWrap: {
    borderWidth: 1,
    borderColor: HOME_COLORS.line,
    backgroundColor: HOME_COLORS.elevated,
    borderRadius: radius.pill,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  homeHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF5A5F',
  },
  wishlistCountBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D14862',
  },
  wishlistCountText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sans,
    fontSize: 8,
    fontWeight: '700',
    lineHeight: 10,
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
  heroSlideLayer: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroShadeTop: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    bottom: '42%',
  },
  heroShadeBottom: {
    ...StyleSheet.absoluteFillObject,
    top: '38%',
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
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  heroSubTitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    maxWidth: '94%',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
  heroPaginationRow: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroPaginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  heroPaginationDotActive: {
    width: 16,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
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
