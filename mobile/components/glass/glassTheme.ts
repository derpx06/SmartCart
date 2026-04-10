import { useMemo } from 'react';
import type { ColorValue } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

export type GlassMode = 'light' | 'dark';

export type GlassTheme = {
  mode: GlassMode;
  blurType: 'light' | 'dark' | 'systemMaterialLight' | 'systemMaterialDark';
  cardBackground: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  dimBackground: string;
  glow: [ColorValue, ColorValue, ColorValue];
  screenGradient: [ColorValue, ColorValue, ColorValue];
};

type GlassThemeOverrides = Partial<
  Pick<GlassTheme, 'cardBackground' | 'cardBorder' | 'textPrimary' | 'textSecondary' | 'dimBackground'>
>;

const GLASS_THEME = {
  light: {
    mode: 'light',
    blurType: 'systemMaterialLight',
    cardBackground: 'rgba(255, 255, 255, 0.14)',
    cardBorder: 'rgba(255, 255, 255, 0.24)',
    textPrimary: '#0A0A0A',
    textSecondary: 'rgba(10, 10, 10, 0.72)',
    dimBackground: 'rgba(0, 0, 0, 0.4)',
    glow: ['rgba(255, 255, 255, 0.34)', 'rgba(255, 255, 255, 0.13)', 'rgba(255, 255, 255, 0)'],
    screenGradient: ['#1A2030', '#111622', '#080B12'],
  },
  dark: {
    mode: 'dark',
    blurType: 'systemMaterialDark',
    cardBackground: 'rgba(255, 255, 255, 0.1)',
    cardBorder: 'rgba(255, 255, 255, 0.2)',
    textPrimary: '#F3F6FF',
    textSecondary: 'rgba(243, 246, 255, 0.75)',
    dimBackground: 'rgba(0, 0, 0, 0.4)',
    glow: ['rgba(189, 215, 255, 0.28)', 'rgba(136, 168, 255, 0.12)', 'rgba(136, 168, 255, 0)'],
    screenGradient: ['#12192B', '#0C1020', '#080B14'],
  },
} as const satisfies Record<GlassMode, GlassTheme>;

export const glassSpacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export function useGlassTheme(forcedMode?: GlassMode, overrides?: GlassThemeOverrides) {
  const colorScheme = useColorScheme();

  return useMemo(() => {
    const mode: GlassMode = forcedMode ?? (colorScheme === 'light' ? 'light' : 'dark');
    const baseTheme = GLASS_THEME[mode];

    return {
      ...baseTheme,
      ...overrides,
    };
  }, [colorScheme, forcedMode, overrides]);
}
