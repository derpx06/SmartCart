import { Redirect, Tabs } from 'expo-router';
import React from 'react';

import { FloatingTabBar } from '@/components/navigation/FloatingTabBar';
import { useAuth } from '@/context/AuthContext';

export default function TabLayout() {
  const { isAuthenticated, isHydrated } = useAuth();

  if (!isHydrated) return null;
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: false,
        detachInactiveScreens: false,
        freezeOnBlur: true,
        animation: 'shift',
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}>
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
        name="notifications"
        options={{ href: null }}
      />
    </Tabs>
  );
}
