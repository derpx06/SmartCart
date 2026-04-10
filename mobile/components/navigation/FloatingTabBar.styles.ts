import { StyleSheet } from 'react-native';

import { Fonts } from '@/constants/theme';

type FloatingTabBarColors = {
  text: string;
  mutedText: string;
};

export function createFloatingTabBarStyles(
  bottomOffset: number,
  colors: FloatingTabBarColors,
  barHeight: number = 76
) {
  return StyleSheet.create({
    root: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: bottomOffset,
    },
    bar: {
      height: barHeight,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 9,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    barGlass: {
      borderRadius: 999,
    },
    tabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 18,
      minWidth: 0,
      minHeight: 56,
      paddingHorizontal: 2,
      gap: 2,
      zIndex: 1,
    },
    label: {
      color: colors.mutedText,
      fontFamily: Fonts.sans,
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.7,
      textTransform: 'uppercase',
      includeFontPadding: false,
    },
    labelActive: {
      color: colors.text,
      fontWeight: '700',
    },
  });
}
