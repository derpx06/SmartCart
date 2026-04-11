import { Redirect, Tabs } from 'expo-router';
import React, { useCallback } from 'react';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { FloatingTabBar } from '@/components/navigation/FloatingTabBar';
import { useAuth } from '@/context/AuthContext';

export default function TabLayout() {
  const { isAuthenticated, isHydrated } = useAuth();
  const renderTabBar = useCallback((props: BottomTabBarProps) => <FloatingTabBar {...props} />, []);

  if (!isHydrated) return null;
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Mount each tab on first visit so inactive tabs do not run effects or subscribe until opened.
        lazy: true,
        // `shift` can flash empty/black frames while scenes move; `freezeOnBlur` can leave a tab blank after refocus.
        freezeOnBlur: false,
        animation: 'fade',
      }}
      tabBar={renderTabBar}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="recipe"
        options={{ title: 'Recipe' }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: 'AI' }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: 'Orders' }}
      />
      <Tabs.Screen
        name="cart"
        options={{ title: 'Cart' }}
      />
      <Tabs.Screen
        name="registry"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="search"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ href: null }}
      />
    </Tabs>
  );
}
