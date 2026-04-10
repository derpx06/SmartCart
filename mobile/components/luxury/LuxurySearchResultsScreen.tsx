import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { luxuryShadow, radius, spacing } from '@/components/luxury/design';
import type { ProductItem } from '@/data/luxuryHomeData';
import { Fonts } from '@/constants/theme';
import { useHomeStore } from '@/store/home-store';

const quickFilters = ['All Product', 'Living Room', 'Bedroom', 'Kitchen'] as const;

const trendingSearches = ['Dutch Oven', 'Sofa', 'Espresso', 'Nightstand', 'Lamp'];

const CARD_GAP = 12;
const GRID_PADDING = spacing.lg;

const SEARCH_COLORS = {
  background: '#FAF9F7',
  cardBg: '#FFFFFF',
  soft: '#EEECEA',
  text: '#1C1B1F',
  muted: 'rgba(28, 27, 31, 0.52)',
  line: 'rgba(28, 27, 31, 0.08)',
  accent: '#1C1B1F',
  accentSoft: 'rgba(28, 27, 31, 0.06)',
  star: '#D4A853',
  wishlist: 'rgba(28, 27, 31, 0.38)',
  searchBg: '#FFFFFF',
  searchBorder: 'rgba(28, 27, 31, 0.10)',
  chipActiveBg: '#1C1B1F',
  chipActiveText: '#FFFFFF',
  chipBg: '#FFFFFF',
  chipText: '#1C1B1F',
  chipBorder: 'rgba(28, 27, 31, 0.10)',
  trending: 'rgba(28, 27, 31, 0.06)',
  trendingText: '#1C1B1F',
};

function normalizeFilter(raw: string | undefined) {
  if (!raw) return 'All Product';
  const found = quickFilters.find((filter) => filter.toLowerCase() === raw.toLowerCase());
  return found ?? 'All Product';
}

function matchesCategory(product: ProductItem, category: string) {
  if (category === 'All Product') return true;
  const name = product.name.toLowerCase();

  const categoryKeywords: Record<string, string[]> = {
    'Living Room': ['living', 'sofa', 'furniture', 'coffee', 'table', 'tray', 'decor', 'lamp'],
    Bedroom: ['bed', 'bedroom', 'bedding', 'nightstand', 'dresser', 'wardrobe'],
    Kitchen: ['kitchen', 'pan', 'cook', 'oven', 'plate', 'espresso', 'flatware', 'board', 'dutch'],
  };

  return (categoryKeywords[category] ?? []).some((token) => name.includes(token));
}

/* ─── Animated Product Card ─── */
function ProductCard({
  product,
  index,
  onPress,
}: {
  product: ProductItem;
  index: number;
  onPress: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(28)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = index * 80;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 420,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, index, translateY]);

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const isLeftColumn = index % 2 === 0;

  return (
    <Animated.View
      style={[
        styles.gridCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY }, { scale: scaleAnim }],
          marginTop: isLeftColumn ? 0 : index === 1 ? 24 : 0,
        },
      ]}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <View style={styles.gridImageWrap}>
          <Image
            source={{ uri: product.image }}
            style={styles.gridImage}
            contentFit="cover"
            transition={350}
          />
          {/* Wishlist icon */}
          <View style={styles.wishlistBtn}>
            <Ionicons name="heart-outline" size={16} color={SEARCH_COLORS.wishlist} />
          </View>
        </View>
        <View style={styles.gridBody}>
          <Text style={styles.gridName} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.gridPriceRow}>
            <Text style={styles.gridPrice}>{product.price}</Text>
            <View style={styles.gridRating}>
              <Ionicons name="star" size={10} color={SEARCH_COLORS.star} />
              <Text style={styles.gridRatingText}>{product.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* ─── Main Screen ─── */
export function LuxurySearchResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; category?: string }>();
  const homeData = useHomeStore((state) => state.homeData);
  const loading = useHomeStore((state) => state.loading);
  const loadHome = useHomeStore((state) => state.loadHome);

  const paramQuery = typeof params.q === 'string' ? params.q : '';
  const paramCategory = normalizeFilter(typeof params.category === 'string' ? params.category : undefined);

  const [searchQuery, setSearchQuery] = useState(paramQuery);
  const [activeFilter, setActiveFilter] = useState<string>(paramCategory);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;
  const searchBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    void loadHome();
  }, [loadHome]);

  useEffect(() => {
    setSearchQuery(paramQuery);
    setActiveFilter(paramCategory);
  }, [paramCategory, paramQuery]);

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(searchBarAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerFade, searchBarAnim]);

  const allProducts = useMemo(() => {
    const merged = [...homeData.bestsellers, ...homeData.recommendedProducts];
    const uniqueById = new Map(merged.map((product) => [product.id, product]));
    return Array.from(uniqueById.values());
  }, [homeData.bestsellers, homeData.recommendedProducts]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const results = useMemo(() => {
    return allProducts.filter((product) => {
      const byCategory = matchesCategory(product, activeFilter);
      if (!byCategory) return false;
      if (!normalizedQuery) return true;

      return (
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.price.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [activeFilter, allProducts, normalizedQuery]);

  const openSearch = useCallback(
    (nextQuery: string, nextFilter: string) => {
      const trimmed = nextQuery.trim();
      const paramsToPass: Record<string, string> = {};
      if (trimmed) paramsToPass.q = trimmed;
      if (nextFilter !== 'All Product') paramsToPass.category = nextFilter;

      router.replace({
        pathname: '/(tabs)/search',
        params: paramsToPass,
      });
    },
    [router],
  );

  const handleSubmitSearch = () => {
    openSearch(searchQuery, activeFilter);
  };

  const handleSelectFilter = (filter: string) => {
    setActiveFilter(filter);
    openSearch(searchQuery, filter);
  };

  const handleTrendingPress = (term: string) => {
    setSearchQuery(term);
    openSearch(term, activeFilter);
  };

  const openProduct = (product: ProductItem) => {
    router.push(`/product/${product.slug || 'signature-enameled-cast-iron-dutch-oven'}`);
  };

  /* Build the 2-column layout */
  const leftColumn: { product: ProductItem; index: number }[] = [];
  const rightColumn: { product: ProductItem; index: number }[] = [];
  results.forEach((product, i) => {
    if (i % 2 === 0) leftColumn.push({ product, index: i });
    else rightColumn.push({ product, index: i });
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* ── Header ── */}
      <Animated.View style={[styles.header, { opacity: headerFade }]}>  
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={18} color={SEARCH_COLORS.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Discover</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="options-outline" size={18} color={SEARCH_COLORS.text} />
          </Pressable>
        </View>
      </Animated.View>

      {/* ── Search Bar ── */}
      <Animated.View
        style={[
          styles.searchWrap,
          {
            opacity: searchBarAnim,
            transform: [
              {
                translateY: searchBarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
            borderColor: isSearchFocused ? 'rgba(28,27,31,0.22)' : SEARCH_COLORS.searchBorder,
          },
        ]}>
        <Ionicons name="search" size={16} color={SEARCH_COLORS.muted} style={{ marginLeft: 2 }} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products, brands..."
          placeholderTextColor={SEARCH_COLORS.muted}
          autoCorrect={false}
          autoCapitalize="none"
          spellCheck={false}
          returnKeyType="search"
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onSubmitEditing={handleSubmitSearch}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 ? (
          <Pressable
            onPress={() => setSearchQuery('')}
            style={styles.clearBtn}>
            <Ionicons name="close" size={13} color={SEARCH_COLORS.text} />
          </Pressable>
        ) : (
          <Pressable onPress={handleSubmitSearch} style={styles.searchActionBtn}>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </Pressable>
        )}
      </Animated.View>

      {/* ── Filter Chips ── */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.filterRow}>
          {quickFilters.map((filter) => {
            const isActive = filter === activeFilter;
            return (
              <Pressable
                key={filter}
                onPress={() => handleSelectFilter(filter)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? SEARCH_COLORS.chipActiveBg : SEARCH_COLORS.chipBg,
                    borderColor: isActive ? SEARCH_COLORS.chipActiveBg : SEARCH_COLORS.chipBorder,
                  },
                ]}>
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isActive ? SEARCH_COLORS.chipActiveText : SEARCH_COLORS.chipText },
                  ]}>
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Results ── */}
      <ScrollView
        style={styles.resultsScroll}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}>
        {/* Result count */}
        {!loading && results.length > 0 && (
          <View style={styles.resultCountRow}>
            <Text style={styles.resultCountText}>
              {results.length} product{results.length === 1 ? '' : 's'} found
            </Text>
            <Pressable style={styles.sortBtn}>
              <Ionicons name="swap-vertical-outline" size={14} color={SEARCH_COLORS.muted} />
              <Text style={styles.sortText}>Sort</Text>
            </Pressable>
          </View>
        )}

        {/* Trending searches (shown when no query) */}
        {!normalizedQuery && !loading && (
          <View style={styles.trendingSection}>
            <View style={styles.trendingHeader}>
              <Ionicons name="trending-up" size={14} color={SEARCH_COLORS.muted} />
              <Text style={styles.trendingLabel}>Trending searches</Text>
            </View>
            <View style={styles.trendingRow}>
              {trendingSearches.map((term) => (
                <Pressable
                  key={term}
                  onPress={() => handleTrendingPress(term)}
                  style={styles.trendingChip}>
                  <Text style={styles.trendingChipText}>{term}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Empty state */}
        {!loading && results.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="search-outline" size={28} color={SEARCH_COLORS.muted} />
            </View>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or explore a different category.
            </Text>
            <Pressable
              onPress={() => {
                setSearchQuery('');
                setActiveFilter('All Product');
              }}
              style={styles.emptyResetBtn}>
              <Text style={styles.emptyResetText}>Clear filters</Text>
            </Pressable>
          </View>
        ) : null}

        {/* 2-column masonry grid */}
        {results.length > 0 && (
          <View style={styles.gridWrap}>
            <View style={styles.gridColumn}>
              {leftColumn.map(({ product, index }) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onPress={() => openProduct(product)}
                />
              ))}
            </View>
            <View style={styles.gridColumn}>
              {rightColumn.map(({ product, index }) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onPress={() => openProduct(product)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SEARCH_COLORS.background,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SEARCH_COLORS.soft,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: '700',
    color: SEARCH_COLORS.text,
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 38,
    alignItems: 'flex-end',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SEARCH_COLORS.soft,
  },

  /* ── Search Bar ── */
  searchWrap: {
    marginTop: spacing.xs,
    marginHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    backgroundColor: SEARCH_COLORS.searchBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.sm,
    paddingRight: 5,
    height: 48,
    gap: spacing.xs,
    ...luxuryShadow,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: SEARCH_COLORS.text,
    letterSpacing: -0.1,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SEARCH_COLORS.soft,
  },
  searchActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SEARCH_COLORS.accent,
  },

  /* ── Filters ── */
  filterContainer: {
    height: 52,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: 8,
    alignItems: 'center' as const,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignSelf: 'center' as const,
  },
  filterChipText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  /* ── Results scroll ── */
  resultsScroll: {
    flex: 1,
  },
  resultsContent: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 130,
    paddingTop: spacing.xs,
  },

  /* ── Result count row ── */
  resultCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  resultCountText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: SEARCH_COLORS.muted,
    letterSpacing: 0.2,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: SEARCH_COLORS.soft,
  },
  sortText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: SEARCH_COLORS.muted,
  },

  /* ── Trending ── */
  trendingSection: {
    marginBottom: spacing.md,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  trendingLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: SEARCH_COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  trendingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingChip: {
    backgroundColor: SEARCH_COLORS.trending,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: SEARCH_COLORS.line,
  },
  trendingChipText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '500',
    color: SEARCH_COLORS.trendingText,
  },

  /* ── Empty State ── */
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: SEARCH_COLORS.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    fontWeight: '700',
    color: SEARCH_COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: SEARCH_COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  emptyResetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: SEARCH_COLORS.accent,
  },
  emptyResetText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* ── Grid ── */
  gridWrap: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  gridColumn: {
    flex: 1,
    gap: CARD_GAP,
  },
  gridCard: {
    backgroundColor: SEARCH_COLORS.cardBg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: SEARCH_COLORS.line,
    ...luxuryShadow,
  },
  gridImageWrap: {
    width: '100%',
    aspectRatio: 0.85,
    backgroundColor: SEARCH_COLORS.soft,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBody: {
    padding: spacing.xs,
    gap: 6,
  },
  gridName: {
    fontFamily: Fonts.serif,
    fontSize: 13,
    lineHeight: 18,
    color: SEARCH_COLORS.text,
    fontWeight: '600',
  },
  gridPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridPrice: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '800',
    color: SEARCH_COLORS.text,
    letterSpacing: -0.3,
  },
  gridRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  gridRatingText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: SEARCH_COLORS.muted,
  },
});
