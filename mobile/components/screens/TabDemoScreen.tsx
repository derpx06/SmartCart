import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, radius, spacing } from '@/components/luxury/design';
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
  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.iconWrap}>
            <Ionicons name={iconName} size={24} color={palette.text} />
          </View>
          <Text style={styles.title}>{tabName}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demo Modules</Text>
          {items.map((item) => (
            <View key={item.title} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDetail}>{item.detail}</Text>
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
    backgroundColor: palette.background,
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
    borderColor: '#E9DECE',
    backgroundColor: palette.surface,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFE3D3',
    marginBottom: spacing.xxs,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    color: palette.text,
    letterSpacing: 0.3,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: palette.mutedText,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: '#7A6D5F',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  itemCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#EBDDCA',
    backgroundColor: '#FFFDF9',
    padding: spacing.md,
    gap: spacing.xxs,
  },
  itemTitle: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: palette.text,
    fontWeight: '700',
  },
  itemDetail: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: palette.mutedText,
  },
});
