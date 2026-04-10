import React, { memo } from 'react';
import type { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { BlurView } from '@sbaiahmed1/react-native-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { useGlassTheme } from '@/components/glass/glassTheme';

type GlassCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'light' | 'dark';
  radius?: number;
  glow?: boolean;
}>;

function GlassCardComponent({
  children,
  style,
  intensity = 28,
  tint,
  radius = 24,
  glow = false,
}: GlassCardProps) {
  const theme = useGlassTheme(tint);

  return (
    <View
      style={[
        styles.shadowWrap,
        {
          borderRadius: radius,
        },
        style,
      ]}>
      <BlurView
        blurType={theme.blurType}
        blurAmount={Math.max(0, Math.min(intensity, 100))}
        reducedTransparencyFallbackColor={theme.cardBackground}
        style={[
          styles.card,
          {
            borderRadius: radius,
            borderColor: theme.cardBorder,
            backgroundColor: theme.cardBackground,
          },
        ]}>
        {glow ? <LinearGradient colors={theme.glow} style={styles.glow} pointerEvents="none" /> : null}
        <View style={styles.content}>{children}</View>
      </BlurView>
    </View>
  );
}

export const GlassCard = memo(GlassCardComponent);

const styles = StyleSheet.create({
  shadowWrap: {
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 18,
      },
      android: {
        elevation: 9,
      },
      default: {},
    }),
  },
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    zIndex: 2,
  },
});
