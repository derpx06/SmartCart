import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { radius, spacing } from '@/components/luxury/design';
import { Fonts } from '@/constants/theme';

type DemoItem = {
  title: string;
  detail: string;
};

type TabDemoScreenProps = {
  tabName: string;
  description: string;
  items: DemoItem[];
  iconName: keyof typeof Ionicons.glyphMap;
};

export function TabDemoScreen({ tabName, description, items, iconName }: TabDemoScreenProps) {
  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const mutedText = useThemeColor({}, 'mutedText');
  const text = useThemeColor({}, 'text');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerCard, { borderColor: border, backgroundColor: card }]}>
          <View style={[styles.iconWrap, { backgroundColor: border }]}>
            <Ionicons name={iconName} size={24} color={text} />
          </View>
          <ThemedText style={styles.title}>{tabName}</ThemedText>
          <ThemedText style={[styles.description, { color: mutedText }]}>{description}</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: mutedText }]}>Demo Modules</ThemedText>
          {items.map((item) => (
            <View key={item.title} style={[styles.itemCard, { borderColor: border, backgroundColor: card }]}>
              <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
              <ThemedText style={[styles.itemDetail, { color: mutedText }]}>{item.detail}</ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  headerCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: spacing.xxs,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 26,
    letterSpacing: 0.3,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  itemCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    padding: spacing.md,
    gap: spacing.xxs,
  },
  itemTitle: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
  },
  itemDetail: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
});
