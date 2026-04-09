import { Platform } from 'react-native';

export const palette = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  elevated: '#FFFFFF',
  beige: '#FFFFFF',
  champagne: '#FFFFFF',
  gold: '#000000',
  text: '#000000',
  mutedText: '#000000',
  line: '#000000',
  overlay: 'rgba(0, 0, 0, 0.34)',
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  android: {
    elevation: 8,
  },
  default: {},
});
