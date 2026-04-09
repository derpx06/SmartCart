import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/components/luxury/AnimatedPressable';
import { luxuryShadow, radius, spacing } from '@/components/luxury/design';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const items = [
  { key: 'home', icon: 'home-outline', label: 'Home' },
  { key: 'categories', icon: 'grid-outline', label: 'Categories' },
  { key: 'wishlist', icon: 'heart-outline', label: 'Wishlist' },
  { key: 'cart', icon: 'bag-handle-outline', label: 'Cart' },
  { key: 'profile', icon: 'person-outline', label: 'Profile' },
] as const;

type FloatingBottomNavProps = {
  activeKey?: (typeof items)[number]['key'];
};

export function FloatingBottomNav({ activeKey = 'home' }: FloatingBottomNavProps) {
  const insets = useSafeAreaInsets();
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const mutedText = useThemeColor({}, 'mutedText');

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom + 8, 18) }]} pointerEvents="box-none">
      <View
        style={[
          styles.nav,
          {
            backgroundColor: card,
            borderColor: border,
          },
          luxuryShadow,
        ]}>
        {items.map((item) => {
          const active = item.key === activeKey;

          return (
            <AnimatedPressable key={item.key} containerStyle={styles.itemWrap}>
              <View
                style={[
                  styles.item,
                  active && styles.itemActive,
                  active && { backgroundColor: border },
                ]}>
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={active ? card : mutedText}
                />
                <Text
                  style={[
                    styles.label,
                    active && styles.labelActive,
                    { color: active ? card : mutedText },
                  ]}>
                  {item.label}
                </Text>
              </View>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
  },
  nav: {
    borderRadius: radius.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemWrap: {
    flex: 1,
  },
  item: {
    borderRadius: radius.md,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  itemActive: {
    backgroundColor: 'transparent',
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '600',
  },
  labelActive: {
  },
});
