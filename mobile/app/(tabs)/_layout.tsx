import { Tabs } from 'expo-router';
import React from 'react';

import { FloatingTabBar } from '@/components/navigation/FloatingTabBar';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
        name="explore"
        options={{ href: null }}
      />
    </Tabs>
  );
}
