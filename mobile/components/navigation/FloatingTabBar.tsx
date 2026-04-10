import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { createFloatingTabBarStyles } from '@/components/navigation/FloatingTabBar.styles';
import { useThemeColor } from '@/hooks/use-theme-color';

type TabRouteName = 'index' | 'recipe' | 'orders' | 'cart' | 'chat';

type TabMeta = {
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
};

const TAB_META: Record<TabRouteName, TabMeta> = {
  index: { label: 'HOME', activeIcon: 'home', inactiveIcon: 'home-outline' },
  recipe: { label: 'RECIPE', activeIcon: 'restaurant', inactiveIcon: 'restaurant-outline' },
  orders: { label: 'ORDERS', activeIcon: 'cube', inactiveIcon: 'cube-outline' },
  cart: { label: 'CART', activeIcon: 'cart', inactiveIcon: 'cart-outline' },
  chat: { label: 'AI', activeIcon: 'sparkles', inactiveIcon: 'sparkles-outline' },
};

export const FLOATING_TAB_BAR_HEIGHT = 76;
const FLOATING_TAB_BAR_MIN_BOTTOM_INSET = 8;
const FLOATING_TAB_BAR_GAP = 10;

export function getFloatingTabBarBottomOffset(insetBottom: number) {
  return Math.max(insetBottom, FLOATING_TAB_BAR_MIN_BOTTOM_INSET) + FLOATING_TAB_BAR_GAP;
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = getFloatingTabBarBottomOffset(insets.bottom);
  const text = useThemeColor({}, 'text');
  const mutedText = useThemeColor({}, 'mutedText');
  const styles = useMemo(
    () => createFloatingTabBarStyles(bottomOffset, { text, mutedText }, FLOATING_TAB_BAR_HEIGHT),
    [bottomOffset, text, mutedText]
  );

  const animationState = useRef<Record<string, Animated.Value>>({});
  const pressState = useRef<Record<string, Animated.Value>>({});

  const visibleRoutes = state.routes.filter((route) => route.name in TAB_META);

  useEffect(() => {
    visibleRoutes.forEach((route) => {
      if (!animationState.current[route.key]) {
        animationState.current[route.key] = new Animated.Value(0);
      }
      if (!pressState.current[route.key]) {
        pressState.current[route.key] = new Animated.Value(1);
      }
    });
  }, [visibleRoutes]);

  useEffect(() => {
    visibleRoutes.forEach((route) => {
      const routeIndex = state.routes.findIndex((tabRoute) => tabRoute.key === route.key);
      const active = state.index === routeIndex;

      Animated.timing(animationState.current[route.key], {
        toValue: active ? 1 : 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  }, [state.index, state.routes, visibleRoutes]);

  return (
    <View pointerEvents="box-none" style={styles.root}>
      {/*
      <GlassCard
        style={styles.barGlass}
        radius={FLOATING_TAB_BAR_HEIGHT / 2}
        intensity={32}
        tint="light"
        glow
      >
      */}
      <View style={styles.barGlass}>
        <View style={styles.bar}>
          {visibleRoutes.map((route) => {
          const routeName = route.name as TabRouteName;
          const meta = TAB_META[routeName];
          const routeIndex = state.routes.findIndex((tabRoute) => tabRoute.key === route.key);
          const isFocused = state.index === routeIndex;

          if (!animationState.current[route.key]) {
            animationState.current[route.key] = new Animated.Value(isFocused ? 1 : 0);
          }
          if (!pressState.current[route.key]) {
            pressState.current[route.key] = new Animated.Value(1);
          }

          const activeAnim = animationState.current[route.key];
          const pressAnim = pressState.current[route.key];
          const iconScale = Animated.multiply(
            pressAnim,
            activeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.02],
            }),
          );
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const onPressIn = () => {
            if (process.env.EXPO_OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            Animated.spring(pressState.current[route.key], {
              toValue: 0.95,
              speed: 24,
              bounciness: 5,
              useNativeDriver: true,
            }).start();
          };

          const onPressOut = () => {
            Animated.spring(pressState.current[route.key], {
              toValue: 1,
              speed: 20,
              bounciness: 7,
              useNativeDriver: true,
            }).start();
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
              testID={descriptors[route.key].options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              style={styles.tabButton}>
              <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                <Ionicons
                  name={isFocused ? meta.activeIcon : meta.inactiveIcon}
                  size={24}
                  color={isFocused ? text : mutedText}
                />
              </Animated.View>
              <ThemedText style={[styles.label, isFocused && styles.labelActive]}>{meta.label}</ThemedText>
            </Pressable>
          );
          })}
        </View>
      </View>
    </View>
  );
}
