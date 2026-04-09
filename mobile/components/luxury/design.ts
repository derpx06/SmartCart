import { Platform } from 'react-native';

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
