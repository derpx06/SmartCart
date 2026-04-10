import React, { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import type { ReactNode, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/glass/GlassCard';
import { glassSpacing, useGlassTheme } from '@/components/glass/glassTheme';

type GlassHeaderProps = {
  title?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  tint?: 'light' | 'dark';
  intensity?: number;
};

function GlassHeaderComponent({
  title,
  leftAction,
  rightAction,
  style,
  titleStyle,
  tint,
  intensity = 28,
}: GlassHeaderProps) {
  const insets = useSafeAreaInsets();
  const theme = useGlassTheme(tint);

  return (
    <View style={[styles.stickyWrap, { paddingTop: insets.top + glassSpacing.xs }, style]}>
      <GlassCard tint={theme.mode} intensity={intensity} radius={22} style={styles.headerCard}>
        <View style={styles.row}>
          <View style={styles.sideSlot}>{leftAction}</View>
          <View style={styles.centerSlot}>
            {title ? (
              <ThemedText type="defaultSemiBold" style={[styles.title, { color: theme.textPrimary }, titleStyle]}>
                {title}
              </ThemedText>
            ) : null}
          </View>
          <View style={styles.sideSlot}>{rightAction}</View>
        </View>
      </GlassCard>
    </View>
  );
}

export const GlassHeader = memo(GlassHeaderComponent);

const styles = StyleSheet.create({
  stickyWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: glassSpacing.md,
  },
  headerCard: {
    minHeight: 56,
    ...Platform.select({
      android: {
        elevation: 7,
      },
      default: {},
    }),
  },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: glassSpacing.sm,
  },
  sideSlot: {
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: glassSpacing.sm,
  },
  title: {
    fontSize: 17,
    letterSpacing: 0.2,
    fontWeight: '600',
  },
});
