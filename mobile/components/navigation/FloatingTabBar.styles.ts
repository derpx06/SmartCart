import { StyleSheet } from 'react-native';

import { Fonts } from '@/constants/theme';

export function createFloatingTabBarStyles(bottomOffset: number) {
  return StyleSheet.create({
    root: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: bottomOffset,
    },
    bar: {
      height: 76,
      borderRadius: 34,
      backgroundColor: '#F6F1EB',
      borderWidth: 1,
      borderColor: '#E7DED4',
      paddingHorizontal: 10,
      paddingVertical: 9,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#2B2320',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.11,
      shadowRadius: 16,
      elevation: 8,
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
    },
    iconPill: {
      position: 'absolute',
      top: 1,
      minWidth: 40,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    iconPillActive: {
      backgroundColor: '#ECE5DC',
    },
    label: {
      color: '#8E8E93',
      fontFamily: Fonts.sans,
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.7,
      textTransform: 'uppercase',
      includeFontPadding: false,
    },
    labelActive: {
      color: '#1C1C1E',
      fontWeight: '700',
    },
  });
}
