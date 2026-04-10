import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
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
import { useWishlistStore } from '@/store/wishlist-store';

const trendingSearches = ['Dutch Oven', 'Sofa', 'Espresso', 'Nightstand', 'Lamp'];
const PRICE_BANDS = ['all', 'under_100', '100_250', '250_500', '500_plus', 'custom'] as const;
const RATING_OPTIONS = [0, 4, 4.5];
const SORT_OPTIONS = ['relevance', 'price_low_high', 'price_high_low', 'rating_high_low'] as const;
type PriceBand = (typeof PRICE_BANDS)[number];
type SortOption = (typeof SORT_OPTIONS)[number];

const CARD_GAP = 12;
const GRID_PADDING = spacing.lg;
const ITEMS_PER_PAGE = 10;

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

function parseProductPrice(price: string) {
  const normalized = price.replace(/[^0-9.]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseInputNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function getPriceRange(priceBand: PriceBand, minInput: string, maxInput: string): { min: number | null; max: number | null } {
  if (priceBand === 'under_100') return { min: null, max: 100 };
  if (priceBand === '100_250') return { min: 100, max: 250 };
  if (priceBand === '250_500') return { min: 250, max: 500 };
  if (priceBand === '500_plus') return { min: 500, max: null };
  if (priceBand !== 'custom') return { min: null, max: null };

  const min = parseInputNumber(minInput);
  const max = parseInputNumber(maxInput);
  if (min != null && max != null && min > max) {
    return { min: max, max: min };
  }
  return { min, max };
}

function getSortLabel(sortBy: SortOption) {
  if (sortBy === 'price_low_high') return 'Price: Low to High';
  if (sortBy === 'price_high_low') return 'Price: High to Low';
  if (sortBy === 'rating_high_low') return 'Rating';
  return 'Sort';
}

function getPriceBandLabel(priceBand: PriceBand) {
  if (priceBand === 'under_100') return 'Under $100';
  if (priceBand === '100_250') return '$100 to $250';
  if (priceBand === '250_500') return '$250 to $500';
  if (priceBand === '500_plus') return '$500 & Above';
  if (priceBand === 'custom') return 'Custom Price';
  return 'All Prices';
}

/* ─── Animated Product Card ─── */
function ProductCard({
  product,
  index,
  onPress,
  isWishlisted,
  wishlistSyncing,
  onToggleWishlist,
}: {
  product: ProductItem;
  index: number;
  onPress: () => void;
  isWishlisted: boolean;
  wishlistSyncing: boolean;
  onToggleWishlist: (productId: string) => void;
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
          <Pressable
            style={[
              styles.wishlistBtn,
              isWishlisted ? styles.wishlistBtnActive : null,
              wishlistSyncing ? styles.wishlistBtnDisabled : null,
            ]}
            onPress={(event) => {
              event.stopPropagation();
              onToggleWishlist(product.id);
            }}
            disabled={wishlistSyncing}
            accessibilityRole="button"
            accessibilityLabel={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}>
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={16}
              color={isWishlisted ? '#D14862' : SEARCH_COLORS.wishlist}
            />
          </Pressable>
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
  const params = useLocalSearchParams<{ q?: string }>();
  const homeData = useHomeStore((state) => state.homeData);
  const loading = useHomeStore((state) => state.loading);
  const loadHome = useHomeStore((state) => state.loadHome);
  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistLoaded = useWishlistStore((state) => state.hasLoaded);
  const syncingIds = useWishlistStore((state) => state.syncingIds);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  const toggleWishlistItem = useWishlistStore((state) => state.toggleWishlistItem);

  const paramQuery = typeof params.q === 'string' ? params.q : '';

  const [searchQuery, setSearchQuery] = useState(paramQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [priceBand, setPriceBand] = useState<PriceBand>('all');
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [minRating, setMinRating] = useState(0);

  const [draftSortBy, setDraftSortBy] = useState<SortOption>('relevance');
  const [draftPriceBand, setDraftPriceBand] = useState<PriceBand>('all');
  const [draftMinPriceInput, setDraftMinPriceInput] = useState('');
  const [draftMaxPriceInput, setDraftMaxPriceInput] = useState('');
  const [draftMinRating, setDraftMinRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const headerFade = useRef(new Animated.Value(0)).current;
  const searchBarAnim = useRef(new Animated.Value(0)).current;
  const resultsScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    void loadHome();
  }, [loadHome]);

  useEffect(() => {
    if (wishlistLoaded) return;
    void fetchWishlist({ silent: true });
  }, [wishlistLoaded, fetchWishlist]);

  useEffect(() => {
    setSearchQuery(paramQuery);
  }, [paramQuery]);

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
  const wishlistIdSet = useMemo(() => new Set(wishlistItems.map((item) => item.productId)), [wishlistItems]);
  const appliedPriceRange = useMemo(
    () => getPriceRange(priceBand, minPriceInput, maxPriceInput),
    [priceBand, minPriceInput, maxPriceInput],
  );

  const results = useMemo(() => {
    const filtered = allProducts.filter((product) => {
      const priceValue = parseProductPrice(product.price);
      if (appliedPriceRange.min != null && priceValue < appliedPriceRange.min) return false;
      if (appliedPriceRange.max != null && priceValue > appliedPriceRange.max) return false;

      if (minRating > 0 && product.rating < minRating) return false;

      if (!normalizedQuery) return true;

      return (
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.price.toLowerCase().includes(normalizedQuery)
      );
    });

    if (sortBy === 'relevance') {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === 'price_low_high') {
        return parseProductPrice(a.price) - parseProductPrice(b.price);
      }
      if (sortBy === 'price_high_low') {
        return parseProductPrice(b.price) - parseProductPrice(a.price);
      }
      if (sortBy === 'rating_high_low') {
        return b.rating - a.rating;
      }
      return 0;
    });
  }, [allProducts, normalizedQuery, appliedPriceRange, minRating, sortBy]);

  const activeFiltersCount =
    (priceBand !== 'all' ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (sortBy !== 'relevance' ? 1 : 0);
  const sortLabel = getSortLabel(sortBy);
  const totalPages = Math.max(1, Math.ceil(results.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedResults = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return results.slice(start, start + ITEMS_PER_PAGE);
  }, [results, safeCurrentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedQuery, sortBy, priceBand, minPriceInput, maxPriceInput, minRating]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const openSearch = useCallback(
    (nextQuery: string) => {
      const trimmed = nextQuery.trim();
      const paramsToPass: Record<string, string> = {};
      if (trimmed) paramsToPass.q = trimmed;

      router.replace({
        pathname: '/(tabs)/search',
        params: paramsToPass,
      });
    },
    [router],
  );

  const handleSubmitSearch = () => {
    openSearch(searchQuery);
  };

  const handleTrendingPress = (term: string) => {
    setSearchQuery(term);
    openSearch(term);
  };

  const openProduct = (product: ProductItem) => {
    router.push(`/product/${product.slug || 'signature-enameled-cast-iron-dutch-oven'}`);
  };

  const openFilterModal = useCallback(() => {
    setDraftSortBy(sortBy);
    setDraftPriceBand(priceBand);
    setDraftMinPriceInput(minPriceInput);
    setDraftMaxPriceInput(maxPriceInput);
    setDraftMinRating(minRating);
    setIsFilterModalVisible(true);
  }, [sortBy, priceBand, minPriceInput, maxPriceInput, minRating]);

  const applyFilters = () => {
    setSortBy(draftSortBy);
    setPriceBand(draftPriceBand);
    setMinPriceInput(draftMinPriceInput);
    setMaxPriceInput(draftMaxPriceInput);
    setMinRating(draftMinRating);
    setIsFilterModalVisible(false);
  };

  const resetDraftFilters = () => {
    setDraftSortBy('relevance');
    setDraftPriceBand('all');
    setDraftMinPriceInput('');
    setDraftMaxPriceInput('');
    setDraftMinRating(0);
  };

  const resetAppliedFilters = () => {
    setSortBy('relevance');
    setPriceBand('all');
    setMinPriceInput('');
    setMaxPriceInput('');
    setMinRating(0);
  };

  const handleToggleWishlist = useCallback(
    (productId: string) => {
      if (!productId) return;
      void toggleWishlistItem(productId);
    },
    [toggleWishlistItem],
  );

  const handleChangePage = useCallback((nextPage: number) => {
    setCurrentPage(nextPage);
    resultsScrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  /* Build the 2-column layout */
  const leftColumn: { product: ProductItem; index: number }[] = [];
  const rightColumn: { product: ProductItem; index: number }[] = [];
  paginatedResults.forEach((product, i) => {
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
          <Pressable style={styles.iconBtn} onPress={openFilterModal}>
            <Ionicons name="options-outline" size={18} color={SEARCH_COLORS.text} />
            {activeFiltersCount > 0 ? (
              <View style={styles.filtersBadge}>
                <Text style={styles.filtersBadgeText}>{activeFiltersCount}</Text>
              </View>
            ) : null}
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


      {activeFiltersCount > 0 ? (
        <View style={styles.activeFiltersRow}>
          {priceBand !== 'all' ? (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterChipText}>{getPriceBandLabel(priceBand)}</Text>
            </View>
          ) : null}
          {minRating > 0 ? (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterChipText}>{minRating}+ ★</Text>
            </View>
          ) : null}
          {sortBy !== 'relevance' ? (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterChipText}>{sortLabel}</Text>
            </View>
          ) : null}
          <Pressable onPress={resetAppliedFilters} style={styles.clearFiltersInlineBtn}>
            <Text style={styles.clearFiltersInlineText}>Clear</Text>
          </Pressable>
        </View>
      ) : null}

      {/* ── Results ── */}
      <ScrollView
        ref={resultsScrollRef}
        style={styles.resultsScroll}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}>
        {/* Result count */}
        {!loading && results.length > 0 && (
          <View style={styles.resultCountRow}>
            <Text style={styles.resultCountText}>
              {results.length} product{results.length === 1 ? '' : 's'} found
              {results.length > 0
                ? ` • Showing ${(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(
                    safeCurrentPage * ITEMS_PER_PAGE,
                    results.length,
                  )}`
                : ''}
            </Text>
            <Pressable style={styles.sortBtn} onPress={openFilterModal}>
              <Ionicons name="swap-vertical-outline" size={14} color={SEARCH_COLORS.muted} />
              <Text style={styles.sortText}>{sortLabel}</Text>
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
              Try adjusting your search term or filter settings.
            </Text>
            <Pressable
              onPress={() => {
                setSearchQuery('');
                resetAppliedFilters();
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
                  isWishlisted={wishlistIdSet.has(product.id)}
                  wishlistSyncing={syncingIds.includes(product.id)}
                  onToggleWishlist={handleToggleWishlist}
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
                  isWishlisted={wishlistIdSet.has(product.id)}
                  wishlistSyncing={syncingIds.includes(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </View>
          </View>
        )}

        {results.length > 0 && totalPages > 1 ? (
          <View style={styles.paginationWrap}>
            <Pressable
              onPress={() => handleChangePage(Math.max(1, safeCurrentPage - 1))}
              disabled={safeCurrentPage === 1}
              style={[styles.pageNavBtn, safeCurrentPage === 1 ? styles.pageNavBtnDisabled : null]}>
              <Text style={[styles.pageNavText, safeCurrentPage === 1 ? styles.pageNavTextDisabled : null]}>
                Prev
              </Text>
            </Pressable>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pageNumbersRow}>
              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                const isActive = page === safeCurrentPage;
                return (
                  <Pressable
                    key={`page-${page}`}
                    onPress={() => handleChangePage(page)}
                    style={[styles.pageNumberBtn, isActive ? styles.pageNumberBtnActive : null]}>
                    <Text style={[styles.pageNumberText, isActive ? styles.pageNumberTextActive : null]}>{page}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              onPress={() => handleChangePage(Math.min(totalPages, safeCurrentPage + 1))}
              disabled={safeCurrentPage === totalPages}
              style={[styles.pageNavBtn, safeCurrentPage === totalPages ? styles.pageNavBtnDisabled : null]}>
              <Text
                style={[styles.pageNavText, safeCurrentPage === totalPages ? styles.pageNavTextDisabled : null]}>
                Next
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFilterModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismissLayer} onPress={() => setIsFilterModalVisible(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter & Sort</Text>
              <Pressable onPress={() => setIsFilterModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={16} color={SEARCH_COLORS.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Sort by</Text>
                <View style={styles.optionList}>
                  {SORT_OPTIONS.map((option) => {
                    const active = draftSortBy === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setDraftSortBy(option)}
                        style={[styles.optionRow, active ? styles.optionRowActive : null]}>
                        <Text style={[styles.optionRowText, active ? styles.optionRowTextActive : null]}>
                          {getSortLabel(option)}
                        </Text>
                        {active ? <Ionicons name="checkmark-circle" size={16} color={SEARCH_COLORS.accent} /> : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Price</Text>
                <View style={styles.bandGrid}>
                  {PRICE_BANDS.map((band) => {
                    const active = draftPriceBand === band;
                    return (
                      <Pressable
                        key={band}
                        onPress={() => setDraftPriceBand(band)}
                        style={[styles.bandChip, active ? styles.bandChipActive : null]}>
                        <Text style={[styles.bandChipText, active ? styles.bandChipTextActive : null]}>
                          {getPriceBandLabel(band)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {draftPriceBand === 'custom' ? (
                  <View style={styles.customPriceRow}>
                    <TextInput
                      value={draftMinPriceInput}
                      onChangeText={setDraftMinPriceInput}
                      placeholder="Min"
                      keyboardType="numeric"
                      style={styles.customPriceInput}
                      placeholderTextColor={SEARCH_COLORS.muted}
                    />
                    <Text style={styles.customPriceDash}>-</Text>
                    <TextInput
                      value={draftMaxPriceInput}
                      onChangeText={setDraftMaxPriceInput}
                      placeholder="Max"
                      keyboardType="numeric"
                      style={styles.customPriceInput}
                      placeholderTextColor={SEARCH_COLORS.muted}
                    />
                  </View>
                ) : null}
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Customer rating</Text>
                <View style={styles.ratingChipsRow}>
                  {RATING_OPTIONS.map((rating) => {
                    const active = draftMinRating === rating;
                    const label = rating === 0 ? 'All' : `${rating}+ ★`;
                    return (
                      <Pressable
                        key={label}
                        onPress={() => setDraftMinRating(rating)}
                        style={[styles.ratingChip, active ? styles.ratingChipActive : null]}>
                        <Text style={[styles.ratingChipText, active ? styles.ratingChipTextActive : null]}>
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable onPress={resetDraftFilters} style={styles.resetBtn}>
                <Text style={styles.resetBtnText}>Reset</Text>
              </Pressable>
              <Pressable onPress={applyFilters} style={styles.applyBtn}>
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  filtersBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SEARCH_COLORS.accent,
  },
  filtersBadgeText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sans,
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
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
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  activeFilterChip: {
    borderRadius: radius.pill,
    backgroundColor: SEARCH_COLORS.soft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: SEARCH_COLORS.line,
  },
  activeFilterChipText: {
    color: SEARCH_COLORS.text,
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
  },
  clearFiltersInlineBtn: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: SEARCH_COLORS.line,
    backgroundColor: '#FFFFFF',
  },
  clearFiltersInlineText: {
    color: SEARCH_COLORS.muted,
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
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

  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalDismissLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: '#FFFFFF',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    maxHeight: '78%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    color: SEARCH_COLORS.text,
    fontFamily: Fonts.serif,
    fontSize: 24,
    fontWeight: '700',
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SEARCH_COLORS.soft,
  },
  modalContent: {
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  filterSection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: SEARCH_COLORS.text,
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionList: {
    gap: 8,
  },
  optionRow: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: SEARCH_COLORS.line,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionRowActive: {
    borderColor: SEARCH_COLORS.accent,
    backgroundColor: SEARCH_COLORS.accentSoft,
  },
  optionRowText: {
    color: SEARCH_COLORS.text,
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  optionRowTextActive: {
    fontWeight: '700',
  },
  bandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bandChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: SEARCH_COLORS.line,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bandChipActive: {
    borderColor: SEARCH_COLORS.accent,
    backgroundColor: SEARCH_COLORS.accentSoft,
  },
  bandChipText: {
    color: SEARCH_COLORS.text,
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '500',
  },
  bandChipTextActive: {
    fontWeight: '700',
  },
  customPriceRow: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customPriceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: SEARCH_COLORS.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: SEARCH_COLORS.text,
    backgroundColor: '#FFFFFF',
  },
  customPriceDash: {
    color: SEARCH_COLORS.muted,
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  ratingChipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  ratingChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: SEARCH_COLORS.line,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ratingChipActive: {
    borderColor: SEARCH_COLORS.accent,
    backgroundColor: SEARCH_COLORS.accentSoft,
  },
  ratingChipText: {
    color: SEARCH_COLORS.text,
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  ratingChipTextActive: {
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: SEARCH_COLORS.line,
    marginTop: spacing.xs,
  },
  resetBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: SEARCH_COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  resetBtnText: {
    color: SEARCH_COLORS.text,
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 1.4,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SEARCH_COLORS.accent,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
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
  wishlistBtnActive: {
    backgroundColor: 'rgba(255, 240, 244, 0.95)',
  },
  wishlistBtnDisabled: {
    opacity: 0.6,
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
  paginationWrap: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageNavBtn: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: SEARCH_COLORS.line,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNavBtnDisabled: {
    opacity: 0.45,
  },
  pageNavText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    color: SEARCH_COLORS.text,
  },
  pageNavTextDisabled: {
    color: SEARCH_COLORS.muted,
  },
  pageNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
  },
  pageNumberBtn: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: SEARCH_COLORS.line,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  pageNumberBtnActive: {
    backgroundColor: SEARCH_COLORS.accent,
    borderColor: SEARCH_COLORS.accent,
  },
  pageNumberText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    color: SEARCH_COLORS.text,
  },
  pageNumberTextActive: {
    color: '#FFFFFF',
  },
});
