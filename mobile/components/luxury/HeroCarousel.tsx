import { Image } from 'expo-image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { AnimatedPressable } from '@/components/luxury/AnimatedPressable';
import { radius, spacing } from '@/components/luxury/design';
import { SkeletonBlock } from '@/components/luxury/SkeletonBlock';
import { HeroSlide } from '@/data/luxuryHomeData';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type HeroCarouselProps = {
  slides: HeroSlide[];
  loading?: boolean;
};

export function HeroCarousel({ slides, loading = false }: HeroCarouselProps) {
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const { width } = useWindowDimensions();
  const slideGap = spacing.md;
  const cardWidth = useMemo(() => width - spacing.lg * 2, [width]);
  const snapInterval = useMemo(() => cardWidth + slideGap, [cardWidth, slideGap]);
  const listRef = useRef<FlatList<HeroSlide>>(null);
  const activeRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (loading || slides.length < 2) {
      return;
    }

    const timer = setInterval(() => {
      const nextIndex = (activeRef.current + 1) % slides.length;
      listRef.current?.scrollToOffset({
        offset: nextIndex * snapInterval,
        animated: true,
      });
      activeRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }, 5200);

    return () => clearInterval(timer);
  }, [loading, slides.length, snapInterval]);

  if (loading) {
    return (
      <View style={styles.skeletonWrap}>
        <SkeletonBlock height={350} borderRadius={radius.xl} />
      </View>
    );
  }

  const renderSlide: ListRenderItem<HeroSlide> = ({ item, index }) => (
    <View
      style={[
        styles.slideWrap,
        {
          width: cardWidth,
          backgroundColor: card,
          marginRight: index === slides.length - 1 ? 0 : slideGap,
        },
      ]}>
      <Image source={{ uri: item.image }} style={styles.heroImage} contentFit="cover" transition={700} />
      <View style={[styles.overlay, { backgroundColor: text, opacity: 0.34 }]} />
      <View style={styles.copyWrap}>
        <Text style={[styles.title, { color: '#FFF9F2' }]}>{item.title}</Text>
        <Text style={[styles.subtitle, { color: '#F2E8DD' }]}>{item.subtitle}</Text>
        <AnimatedPressable containerStyle={styles.ctaWrap}>
          <View
            style={[
              styles.ctaButton,
              {
                backgroundColor: card,
                borderColor: border,
              },
            ]}>
            <Text style={[styles.ctaText, { color: '#221F1A' }]}>{item.ctaLabel}</Text>
          </View>
        </AnimatedPressable>
      </View>
    </View>
  );

  return (
    <View>
      <FlatList
        ref={listRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: snapInterval,
          offset: snapInterval * index,
          index,
        })}
        onMomentumScrollEnd={(event) => {
          const next = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
          activeRef.current = next;
          setActiveIndex(next);
        }}
      />
      <View style={styles.pagination}>
        {slides.map((slide, index) => (
          <View
            key={slide.id}
            style={[
              styles.dot,
              {
                width: activeIndex === index ? 24 : 8,
                backgroundColor: activeIndex === index ? text : border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  slideWrap: {
    height: 350,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  copyWrap: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 35,
    lineHeight: 42,
    letterSpacing: 0.4,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    maxWidth: '90%',
  },
  ctaWrap: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  ctaButton: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
  },
  ctaText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 99,
  },
});
