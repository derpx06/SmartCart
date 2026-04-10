import { StyleSheet } from 'react-native';

import { Fonts } from '@/constants/theme';

type FloatingTabBarColors = {
  text: string;
  mutedText: string;
};

export function createFloatingTabBarStyles(
  bottomOffset: number,
  colors: FloatingTabBarColors,
  barHeight: number = 76,
  androidOnlyCapsule: boolean = false
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
      paddingHorizontal: 8,
      paddingVertical: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    barGlass: {
      borderRadius: 999,
      ...(androidOnlyCapsule
        ? {
            backgroundColor: 'rgba(8, 8, 10, 0.94)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.12)',
            shadowColor: '#000',
            shadowOpacity: 0.28,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 8 },
            elevation: 10,
          }
        : {}),
    },
    tabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      minWidth: 0,
      minHeight: 58,
      paddingHorizontal: 4,
      gap: 1,
      zIndex: 1,
    },
    tabButtonActive: {
      ...(androidOnlyCapsule
        ? {
            backgroundColor: 'rgba(255, 255, 255, 0.14)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.22)',
          }
        : {}),
    },
    label: {
      color: colors.mutedText,
      fontFamily: Fonts.sans,
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      includeFontPadding: false,
    },
    labelActive: {
      color: colors.text,
      fontWeight: '700',
    },
  });
}
