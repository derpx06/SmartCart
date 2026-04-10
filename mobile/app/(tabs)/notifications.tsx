import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

const items = [
  {
    id: 'n1',
    title: 'Your order has shipped',
    body: 'Order #WS-20391 is on the way and should arrive by Tuesday.',
    time: '2h ago',
  },
  {
    id: 'n2',
    title: 'New arrivals in kitchen',
    body: 'Fresh Williams Sonoma exclusives just landed in cookware.',
    time: 'Yesterday',
  },
  {
    id: 'n3',
    title: 'Price drop alert',
    body: 'An item in your wishlist is now 15% off for a limited time.',
    time: '2d ago',
  },
];

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.title}>Notifications</ThemedText>
        <ThemedText style={styles.subtitle}>Stay up to date with your orders and offers</ThemedText>

        {items.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}>
                <Ionicons name="notifications-outline" size={14} color="#1C1B1F" />
              </View>
              <ThemedText style={styles.time}>{item.time}</ThemedText>
            </View>
            <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
            <ThemedText style={styles.cardBody}>{item.body}</ThemedText>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  subtitle: { marginTop: 6, marginBottom: 16, fontSize: 14, color: 'rgba(28,27,31,0.68)' },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(28,27,31,0.14)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFEFED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: { fontSize: 11, color: 'rgba(28,27,31,0.52)' },
  cardTitle: { marginTop: 10, fontSize: 15, fontWeight: '700' },
  cardBody: { marginTop: 4, fontSize: 13, lineHeight: 19, color: 'rgba(28,27,31,0.75)' },
});
