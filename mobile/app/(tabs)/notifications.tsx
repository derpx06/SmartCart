import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { luxuryShadow, radius, spacing } from '@/components/luxury/design';
import { FLOATING_TAB_BAR_HEIGHT, getFloatingTabBarBottomOffset } from '@/components/navigation/FloatingTabBar';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';

const NOTIFICATION_COLORS = {
  background: '#FFFFFF',
  card: '#FFFFFF',
  soft: '#E9E9E7',
  text: '#1C1B1F',
  muted: 'rgba(28, 27, 31, 0.68)',
  line: 'rgba(28, 27, 31, 0.14)',
  orbOne: 'rgba(28, 27, 31, 0.08)',
  orbTwo: 'rgba(233, 233, 231, 0.72)',
};

const items = [
  {
    id: 'n1',
    title: 'Your order has shipped',
    body: 'Order #WS-20391 is on the way and should arrive by Tuesday.',
    time: '2h ago',
    icon: 'cube-outline' as const,
  },
  {
    id: 'n2',
    title: 'New arrivals in kitchen',
    body: 'Fresh Williams Sonoma exclusives just landed in cookware.',
    time: 'Yesterday',
    icon: 'restaurant-outline' as const,
  },
  {
    id: 'n3',
    title: 'Price drop alert',
    body: 'An item in your wishlist is now 15% off for a limited time.',
    time: '2d ago',
    icon: 'pricetag-outline' as const,
  },
];

function NotificationCard({
  title,
  body,
  time,
  icon,
}: {
  title: string;
  body: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: NOTIFICATION_COLORS.card, borderColor: NOTIFICATION_COLORS.line },
        luxuryShadow,
      ]}>
      <View style={styles.cardTop}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: NOTIFICATION_COLORS.soft, borderColor: NOTIFICATION_COLORS.line },
          ]}>
          <Ionicons name={icon} size={15} color={NOTIFICATION_COLORS.text} />
        </View>
        <View style={[styles.timePill, { backgroundColor: NOTIFICATION_COLORS.soft, borderColor: NOTIFICATION_COLORS.line }]}>
          <ThemedText style={[styles.time, { color: NOTIFICATION_COLORS.muted }]}>{time}</ThemedText>
        </View>
      </View>
      <ThemedText style={[styles.cardTitle, { color: NOTIFICATION_COLORS.text }]}>{title}</ThemedText>
      <ThemedText style={[styles.cardBody, { color: NOTIFICATION_COLORS.muted }]}>{body}</ThemedText>
    </View>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarClearance = getFloatingTabBarBottomOffset(insets.bottom) + FLOATING_TAB_BAR_HEIGHT + spacing.md;

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: NOTIFICATION_COLORS.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: tabBarClearance }]}
        showsVerticalScrollIndicator={false}
        bounces>
        <View pointerEvents="none" style={styles.atmosphereLayer}>
          <View style={[styles.orbOne, { backgroundColor: NOTIFICATION_COLORS.orbOne }]} />
          <View style={[styles.orbTwo, { backgroundColor: NOTIFICATION_COLORS.orbTwo }]} />
        </View>

        <View style={styles.headerBlock}>
          <View style={styles.headerTopRow}>
            <Pressable
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={[
                styles.backButton,
                { backgroundColor: NOTIFICATION_COLORS.card, borderColor: NOTIFICATION_COLORS.line },
              ]}>
              <Ionicons name="chevron-back" size={22} color={NOTIFICATION_COLORS.text} />
            </Pressable>
            <View style={[styles.countPill, { backgroundColor: NOTIFICATION_COLORS.soft, borderColor: NOTIFICATION_COLORS.line }]}>
              <ThemedText style={[styles.countPillText, { color: NOTIFICATION_COLORS.text }]}>
                {items.length} {items.length === 1 ? 'update' : 'updates'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.headerCopy}>
            <ThemedText style={[styles.kicker, { color: NOTIFICATION_COLORS.muted }]}>Alerts & offers</ThemedText>
            <ThemedText style={[styles.title, { color: NOTIFICATION_COLORS.text }]}>Notifications</ThemedText>
            <ThemedText style={[styles.subtitle, { color: NOTIFICATION_COLORS.muted }]}>
              Orders, drops, and curated picks worth a quick glance.
            </ThemedText>
          </View>
        </View>

        <View style={styles.listWrap}>
          {items.map((item) => (
            <NotificationCard
              key={item.id}
              title={item.title}
              body={item.body}
              time={item.time}
              icon={item.icon}
            />
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
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  atmosphereLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  orbOne: {
    position: 'absolute',
    top: 8,
    right: -58,
    width: 168,
    height: 168,
    borderRadius: 168,
    opacity: 0.42,
  },
  orbTwo: {
    position: 'absolute',
    top: 84,
    left: -62,
    width: 176,
    height: 176,
    borderRadius: 176,
    opacity: 0.24,
  },
  headerBlock: {
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    ...luxuryShadow,
    shadowOpacity: 0.08,
  },
  countPill: {
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  countPillText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerCopy: {
    gap: 6,
    paddingRight: spacing.xs,
  },
  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 38,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 2,
  },
  listWrap: {
    gap: spacing.md,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePill: {
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  time: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontFamily: Fonts.serif,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
  },
  cardBody: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
});
