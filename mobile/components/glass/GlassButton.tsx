import React, { memo, useCallback } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import type { PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native';

import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/glass/GlassCard';
import { glassSpacing, useGlassTheme } from '@/components/glass/glassTheme';

const AnimatedView = Animated.createAnimatedComponent(View);

type GlassButtonProps = Omit<PressableProps, 'style'> & {
  label?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  tint?: 'light' | 'dark';
  intensity?: number;
  glow?: boolean;
};

function GlassButtonComponent({
  label,
  children,
  style,
  contentStyle,
  labelStyle,
  tint,
  intensity = 30,
  glow = true,
  onPressIn,
  onPressOut,
  disabled,
  ...pressableProps
}: GlassButtonProps) {
  const pressed = useSharedValue(0);
  const theme = useGlassTheme(tint);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: 1 - pressed.value * 0.03 }],
      opacity: 1 - pressed.value * 0.08,
    };
  }, []);

  const handlePressIn: PressableProps['onPressIn'] = useCallback(
    (event) => {
      pressed.value = withTiming(1, { duration: 120 });
      onPressIn?.(event);
    },
    [onPressIn, pressed],
  );

  const handlePressOut: PressableProps['onPressOut'] = useCallback(
    (event) => {
      pressed.value = withTiming(0, { duration: 180 });
      onPressOut?.(event);
    },
    [onPressOut, pressed],
  );

  return (
    <AnimatedView style={[styles.wrapper, animatedStyle, disabled ? styles.disabled : undefined, style]}>
      <Pressable
        {...pressableProps}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{
          color: 'rgba(255,255,255,0.16)',
          foreground: true,
          borderless: false,
        }}>
        {({ pressed: isPressed }) => (
          <GlassCard
            glow={glow}
            tint={theme.mode}
            intensity={intensity}
            radius={20}
            style={[styles.card, isPressed ? styles.pressedState : undefined]}>
            <View style={[styles.content, contentStyle]}>
              {label ? (
                <ThemedText
                  style={[styles.label, { color: theme.textPrimary }, labelStyle]}
                  type="defaultSemiBold">
                  {label}
                </ThemedText>
              ) : null}
              {children}
            </View>
          </GlassCard>
        )}
      </Pressable>
    </AnimatedView>
  );
}

export const GlassButton = memo(GlassButtonComponent);

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    minHeight: 52,
  },
  pressedState: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  content: {
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: glassSpacing.md,
    paddingVertical: glassSpacing.sm,
    gap: glassSpacing.xs,
  },
  label: {
    fontSize: 16,
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: Platform.OS === 'ios' ? 0.55 : 0.65,
  },
});
