import { Platform } from 'react-native';
import { useMemo } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const palette = {
  background: '#FFFFFF',
  surface: '#E9E9E7',
  elevated: '#FFFFFF',
  beige: '#E9E9E7',
  champagne: '#E9E9E7',
  gold: '#1C1B1F',
  text: '#1C1B1F',
  mutedText: 'rgba(28, 27, 31, 0.68)',
  line: 'rgba(28, 27, 31, 0.14)',
  overlay: 'rgba(28, 27, 31, 0.42)',
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const spacing = {
  xxs: 6,
  xs: 10,
  sm: 14,
  md: 18,
  lg: 24,
  xl: 30,
  xxl: 38,
};

export const luxuryShadow = Platform.select({
  ios: {
    shadowColor: '#1C1B1F',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  android: {
    elevation: 6,
  },
  default: {},
});

export function useLuxuryPalette() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return useMemo(
    () => ({
      isDark,
      background: '#FFFFFF',
      surface: '#E9E9E7',
      elevated: '#FFFFFF',
      beige: '#E9E9E7',
      champagne: '#E9E9E7',
      gold: '#1C1B1F',
      text: '#1C1B1F',
      mutedText: 'rgba(28, 27, 31, 0.68)',
      line: 'rgba(28, 27, 31, 0.14)',
      overlay: 'rgba(28, 27, 31, 0.42)',
      orbOne: 'rgba(28, 27, 31, 0.08)',
      orbTwo: 'rgba(233, 233, 231, 0.72)',
      heroTitle: '#FFFFFF',
      heroSubtitle: 'rgba(255, 255, 255, 0.9)',
      heroCtaBg: '#FFFFFF',
      heroCtaText: '#1C1B1F',
      heroTopShade: 'rgba(28, 27, 31, 0.16)',
      heroBottomShade: 'rgba(28, 27, 31, 0.6)',
      categoryTint: 'rgba(28, 27, 31, 0.34)',
      categoryLabel: '#FFFFFF',
      collectionOverlay: 'rgba(28, 27, 31, 0.46)',
      collectionSecondaryOverlay: 'rgba(28, 27, 31, 0.5)',
      seasonalBg: '#E9E9E7',
      seasonalBorder: 'rgba(28, 27, 31, 0.14)',
      navBg: '#FFFFFF',
      navBorder: 'rgba(28, 27, 31, 0.14)',
      navActiveBg: '#1C1B1F',
      navText: 'rgba(28, 27, 31, 0.68)',
      navTextActive: '#FFFFFF',
      wishlistChip: '#FFFFFF',
      skeleton: 'rgba(28, 27, 31, 0.12)',
      chipText: '#1C1B1F',
      subtleGlow: 'rgba(28, 27, 31, 0.12)',
      subtleOverlay: 'rgba(255, 255, 255, 0.32)',
    }),
    [isDark],
  );
}
