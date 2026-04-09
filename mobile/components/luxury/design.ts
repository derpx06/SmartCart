import { Platform } from 'react-native';
import { useMemo } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const palette = {
  background: '#FFF9F1',
  surface: '#FFFCF8',
  elevated: '#FFFFFF',
  beige: '#EFE5D7',
  champagne: '#E8DCC8',
  gold: '#B7925B',
  text: '#2B2A28',
  mutedText: '#6E675E',
  line: '#ECE1D3',
  overlay: 'rgba(25, 21, 16, 0.34)',
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
    shadowColor: '#2B2620',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  android: {
    elevation: 8,
  },
  default: {},
});

export function useLuxuryPalette() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return useMemo(
    () => ({
      isDark,
      background: isDark ? '#121416' : '#FFF9F1',
      surface: isDark ? '#1A1E22' : '#FFFCF8',
      elevated: isDark ? '#1F252B' : '#FFFFFF',
      beige: isDark ? '#2A3138' : '#EFE5D7',
      champagne: isDark ? '#323A43' : '#E8DCC8',
      gold: isDark ? '#C7A06A' : '#B7925B',
      text: isDark ? '#ECE6DD' : '#2B2A28',
      mutedText: isDark ? '#B0A79C' : '#6E675E',
      line: isDark ? '#353C45' : '#ECE1D3',
      overlay: isDark ? 'rgba(8, 11, 14, 0.5)' : 'rgba(25, 21, 16, 0.34)',
      orbOne: isDark ? '#1D2329' : '#F3E7D6',
      orbTwo: isDark ? '#1B2127' : '#F7EEDF',
      heroTitle: '#FFFBF5',
      heroSubtitle: isDark ? '#DED7CD' : '#F3EDE4',
      heroCtaBg: isDark ? '#ECE2D4' : '#FBF5EA',
      heroCtaText: '#28241F',
      categoryTint: isDark ? 'rgba(12, 14, 17, 0.38)' : 'rgba(27, 21, 16, 0.26)',
      categoryLabel: '#FFF8EE',
      collectionOverlay: isDark ? 'rgba(7, 10, 13, 0.52)' : 'rgba(31, 24, 18, 0.34)',
      collectionSecondaryOverlay: isDark ? 'rgba(7, 10, 13, 0.58)' : 'rgba(29, 23, 17, 0.35)',
      seasonalBg: isDark ? '#1D232A' : '#F4EADC',
      seasonalBorder: isDark ? '#363E48' : '#E9DBC7',
      navBg: isDark ? '#1A1F24' : '#FFFDF9',
      navBorder: isDark ? '#323A43' : '#ECE1D2',
      navActiveBg: isDark ? '#2B323A' : '#F4EBDC',
      navText: isDark ? '#AFA69B' : '#6F685E',
      navTextActive: isDark ? '#EFE8DE' : '#201C17',
      wishlistChip: isDark ? '#242B32' : '#FFF8EE',
      skeleton: isDark ? '#2C343C' : '#EFE5D7',
    }),
    [isDark],
  );
}
