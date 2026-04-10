import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { radius, spacing } from '@/components/luxury/design';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ARBtn({ modelUrl }: { modelUrl?: string }) {
  const router = useRouter();
  const text = useThemeColor({}, 'text');
  const mutedText = useThemeColor({}, 'mutedText');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => router.push({
          pathname: '/ar',
          params: { modelUrl }
        })}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: card,
            borderColor: border,
            opacity: pressed ? 0.86 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          },
        ]}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="camera-outline" size={18} color={text} />
        </View>
        <View style={styles.copyWrap}>
          <ThemedText style={[styles.title, { color: text }]}>Open AR Camera</ThemedText>
          <ThemedText style={[styles.subtitle, { color: mutedText }]}>
            See this product in your space
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={mutedText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
});
