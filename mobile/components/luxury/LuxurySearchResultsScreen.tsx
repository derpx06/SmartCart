import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
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

const SEARCH_COLORS = {
  background: '#FFFFFF',
  cardBg: '#FFFFFF',
  soft: '#E9E9E7',
  text: '#1C1B1F',
  muted: 'rgba(28, 27, 31, 0.68)',
  line: 'rgba(28, 27, 31, 0.14)',
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

  useEffect(() => {
    void loadHome();
  }, [loadHome]);

  useEffect(() => {
    setSearchQuery(paramQuery);
    setActiveFilter(paramCategory);
  }, [paramCategory, paramQuery]);

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

  const openSearch = (nextQuery: string, nextFilter: string) => {
    const trimmed = nextQuery.trim();
    const paramsToPass: Record<string, string> = {};
    if (trimmed) paramsToPass.q = trimmed;
    if (nextFilter !== 'All Product') paramsToPass.category = nextFilter;

    router.replace({
      pathname: '/(tabs)/search',
      params: paramsToPass,
    });
  };

  const handleSubmitSearch = () => {
    openSearch(searchQuery, activeFilter);
  };

  const handleSelectFilter = (filter: string) => {
    setActiveFilter(filter);
    openSearch(searchQuery, filter);
  };

  const openProduct = (product: ProductItem) => {
    router.push(`/product/${product.slug || 'signature-enameled-cast-iron-dutch-oven'}`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: SEARCH_COLORS.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={18} color={SEARCH_COLORS.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.headerTitle, { color: SEARCH_COLORS.text }]}>Products</Text>
          <Text style={[styles.headerSub, { color: SEARCH_COLORS.muted }]}>
            {loading ? 'Loading...' : `${results.length} result${results.length === 1 ? '' : 's'}`}
          </Text>
        </View>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: SEARCH_COLORS.cardBg, borderColor: SEARCH_COLORS.line }]}>
        <Pressable onPress={handleSubmitSearch} style={styles.searchSubmitBtn}>
          <Ionicons name="search" size={16} color={SEARCH_COLORS.muted} />
        </Pressable>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products..."
          placeholderTextColor={SEARCH_COLORS.muted}
          autoCorrect={false}
          autoCapitalize="none"
          spellCheck={false}
          returnKeyType="go"
          onSubmitEditing={handleSubmitSearch}
          style={[styles.searchInput, { color: SEARCH_COLORS.text }]}
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Ionicons name="close" size={14} color={SEARCH_COLORS.text} />
          </Pressable>
        ) : null}
      </View>

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
                  backgroundColor: isActive ? SEARCH_COLORS.text : SEARCH_COLORS.soft,
                  borderColor: SEARCH_COLORS.line,
                },
              ]}>
              <Text style={[styles.filterChipText, { color: isActive ? '#FFFFFF' : SEARCH_COLORS.text }]}>
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.resultsScroll}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}>
        {!loading && results.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: SEARCH_COLORS.soft, borderColor: SEARCH_COLORS.line }]}>
            <Ionicons name="search-outline" size={18} color={SEARCH_COLORS.text} />
            <Text style={[styles.emptyText, { color: SEARCH_COLORS.text }]}>
              No products found. Try a different search or category.
            </Text>
          </View>
        ) : null}

        {results.map((product) => (
          <Pressable
            key={product.id}
            onPress={() => openProduct(product)}
            style={[styles.resultCard, { backgroundColor: SEARCH_COLORS.cardBg, borderColor: SEARCH_COLORS.line }, luxuryShadow]}>
            <Image source={{ uri: product.image }} style={styles.resultImage} contentFit="cover" transition={300} />
            <View style={styles.resultBody}>
              <Text style={[styles.resultName, { color: SEARCH_COLORS.text }]} numberOfLines={2}>
                {product.name}
              </Text>
              <Text style={[styles.resultPrice, { color: SEARCH_COLORS.text }]}>{product.price}</Text>
              <View style={[styles.ratingPill, { backgroundColor: SEARCH_COLORS.soft, borderColor: SEARCH_COLORS.line }]}>
                <Ionicons name="star" size={12} color={SEARCH_COLORS.text} />
                <Text style={[styles.ratingText, { color: SEARCH_COLORS.muted }]}>{product.rating.toFixed(1)}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9E9E7',
  },
  headerCopy: {
    gap: 2,
  },
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    lineHeight: 32,
  },
  headerSub: {
    fontFamily: Fonts.sans,
    fontSize: 12,
  },
  searchWrap: {
    marginTop: spacing.sm,
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
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(28, 27, 31, 0.1)',
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  resultsScroll: {
    flex: 1,
    marginTop: spacing.md,
  },
  resultsContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
    gap: spacing.sm,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyText: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  resultImage: {
    width: 104,
    height: 104,
    borderRadius: radius.md,
  },
  resultBody: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  resultName: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 21,
  },
  resultPrice: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '700',
  },
  ratingPill: {
    borderWidth: 1,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  ratingText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
  },
});

