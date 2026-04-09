import { Platform } from 'react-native';
import { useMemo } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const palette = {
  background: '#FFFFFF',
  surface: '#FCF7F0',
  elevated: '#FFFFFF',
  beige: '#ECE1D2',
  champagne: '#E4D3B8',
  gold: '#B58A53',
  text: '#21180F',
  mutedText: '#6B5F53',
  line: '#E6D8C6',
  overlay: 'rgba(21, 15, 10, 0.42)',
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
    shadowColor: '#1A1208',
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
      background: isDark ? '#000000' : '#FFFFFF',
      surface: isDark ? '#1D2126' : '#FCF7F0',
      elevated: isDark ? '#242932' : '#FFFFFF',
      beige: isDark ? '#2F3640' : '#ECE1D2',
      champagne: isDark ? '#39414C' : '#E4D3B8',
      gold: isDark ? '#C9A26D' : '#B58A53',
      text: isDark ? '#EEE6DC' : '#21180F',
      mutedText: isDark ? '#B6AA9D' : '#6B5F53',
      line: isDark ? '#3A424D' : '#E6D8C6',
      overlay: isDark ? 'rgba(8, 10, 13, 0.52)' : 'rgba(21, 15, 10, 0.42)',
      orbOne: isDark ? '#20262D' : '#EFE1CD',
      orbTwo: isDark ? '#242A31' : '#E8D7BF',
      heroTitle: '#FFFBF5',
      heroSubtitle: isDark ? '#DED7CD' : '#F2E5D6',
      heroCtaBg: isDark ? '#EFE3D4' : '#FFF6EA',
      heroCtaText: '#2A2119',
      heroTopShade: isDark ? 'rgba(7, 8, 10, 0.2)' : 'rgba(20, 14, 9, 0.16)',
      heroBottomShade: isDark ? 'rgba(6, 7, 9, 0.62)' : 'rgba(16, 11, 7, 0.6)',
      categoryTint: isDark ? 'rgba(10, 12, 15, 0.46)' : 'rgba(18, 14, 10, 0.36)',
      categoryLabel: '#FFF8EE',
      collectionOverlay: isDark ? 'rgba(7, 9, 12, 0.6)' : 'rgba(17, 12, 8, 0.44)',
      collectionSecondaryOverlay: isDark ? 'rgba(7, 9, 12, 0.66)' : 'rgba(15, 11, 8, 0.48)',
      seasonalBg: isDark ? '#252C34' : '#F2E6D5',
      seasonalBorder: isDark ? '#3A434E' : '#E3D2BC',
      navBg: isDark ? '#1F252C' : '#FFFAF3',
      navBorder: isDark ? '#353D47' : '#E8D9C6',
      navActiveBg: isDark ? '#C9A26D' : '#251B12',
      navText: isDark ? '#B7ACA0' : '#6A5D4F',
      navTextActive: isDark ? '#1C140D' : '#FFF7ED',
      wishlistChip: isDark ? '#2B323B' : '#FFF5E8',
      skeleton: isDark ? '#303843' : '#ECDFCF',
      chipText: isDark ? '#231A11' : '#2A2119',
      subtleGlow: isDark ? 'rgba(201, 161, 107, 0.12)' : 'rgba(181, 138, 83, 0.16)',
      subtleOverlay: isDark ? 'rgba(5, 6, 8, 0.3)' : 'rgba(255, 252, 246, 0.32)',
    }),
    [isDark],
  );
}
