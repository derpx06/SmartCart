import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type CartItem = {
  id: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  delivery: string;
  lowStock?: string;
  image: string;
};

const CART_ITEMS: CartItem[] = [
  {
    id: '1',
    name: 'All-Clad d5 Stainless-Steel 10-Piece Cookware Set',
    variant: 'Silver',
    price: 899.95,
    quantity: 1,
    delivery: 'Delivery Sun',
    lowStock: 'Only 2 left',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDZDWyFYxatuz0G9J0-2dUZKhv3-pnqsJlXq7JWhLM5MGhccAjrSz97kkPmYAg-9EHN78uBX2Fkc5njoEEoICEHrZoBQmDk8y3NZGyrTWTeyfmkpC1htrICy1GxACIVHxJ3LHtlGKrD-4Dsvek25wypnTw6k1o-N010Sltj3NMo5zV5vU7TeucTgv5Lm62_yamxF6m4F_f6zjM7EMNQ_laUXupeoFB8HLliuLKxOCMmLf_-bbmZr56Yw4QnIkbfcNTZTObYxM4zxZw',
  },
  {
    id: '2',
    name: 'Le Creuset Signature Enamel Dutch Oven, 5.5-Qt.',
    variant: 'Artichaut',
    price: 420.0,
    quantity: 1,
    delivery: 'Delivery Sun',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAvlufiYxQKbho4gNP5x4n8HblxZNu4ETHCm60hkVxOEhcxvgG-nbEFz5GSDN2uRVPoW4AJz2XZdcLdfvoJxIiVqqfZznp0ybF5pYlFth-Gp8aFJcFHCrKc4PzuIdOILAHGOrBTx_H7UZHvYwrweV7iPhU9dRE5RJOWaJHaQJRCD9QT2mtI1obD4hN0dPFlT2yMpUYeEl0Jnm-P2sTD2A5V-V7dD9DSULJ_sdKiWmxj7NS8vyCWf-ZHhuUxc3C3vGbMi_bKwxd6as0',
  },
  {
    id: '3',
    name: 'Williams Sonoma Goldtouch Pro Muffin Tin',
    variant: 'Standard 12-Cup',
    price: 34.95,
    quantity: 1,
    delivery: 'Delivery Sat',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBAYk5RqGKL1kQmO_8oIowmZAhlyZaAcZIK0H4KIysdMxkb0aaWhNvnDxmU7OzNfeHqt7EZLyRy5306ItVvWFnQxAjDkNrPm9h2YtrQvzgSHsZsD-4OrpNvkrR35NRLyoneMFXjYomOwpsW9Eg2VANKRgpQjW7vniZMHxY0lYis4pTFdU6O5pAcFK1RV9WZ01DwiTtrWVTVkwjHv62QAX3-DXdfc-tUs5Usj9KSS_dR7itSwJU2hd8AYPYhyhMGaOf2NzaZzkzbsvg',
  },
];

import { useSmartCartState } from '@/hooks/use-smart-cart-state';

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function CartScreen() {
  const { state, loading, error } = useSmartCartState();
  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'mutedText');
  const border = useThemeColor({}, 'border');

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: background, justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText>Loading your SmartCart...</ThemedText>
      </SafeAreaView>
    );
  }

  const items = state?.cart.items || [];
  const subtotal = state?.cart.totalValue || 0;
  const discount = subtotal * 0.1;
  const total = subtotal - discount;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <View style={styles.topRow}>
          <ThemedText style={styles.pageTitle}>Cart</ThemedText>
          <Ionicons name="bag-outline" size={22} color={text} />
        </View>

        <View style={styles.heroHeader}>
          <ThemedText style={[styles.kicker, { color: muted }]}>
            {items.length} items - {money(subtotal)}
          </ThemedText>
          <ThemedText style={styles.mainHeading}>Your Selection</ThemedText>
          {state?.session.behavior === 'slow' && (
            <View style={[styles.perkPill, { borderColor: border, backgroundColor: '#fffbe6' }]}>
              <Ionicons name="bulb-outline" size={14} color="#856404" />
              <ThemedText style={[styles.perkText, { color: '#856404' }]}>
                Take your time. We've saved your progress.
              </ThemedText>
            </View>
          )}
          <View style={[styles.perkPill, { borderColor: border }]}>
            <Ionicons name="sparkles-outline" size={14} color={text} />
            <ThemedText style={[styles.perkText, { color: text }]}>
              Complimentary white-glove delivery
            </ThemedText>
          </View>
        </View>

        <View style={styles.itemsWrap}>
          {items.map((item) => (
            <View key={item.productId} style={[styles.itemCard, { backgroundColor: card, borderColor: border }]}>
              {/* Note: In a real app we'd fetch the actual image URL from the product model if not in the state bundle */}
              <View style={[styles.itemImage, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="cart-outline" size={40} color={muted} />
              </View>
              <View style={styles.itemBody}>
                <View style={styles.itemTopLine}>
                  <ThemedText numberOfLines={2} style={styles.itemName}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={styles.itemPrice}>{money(item.price)}</ThemedText>
                </View>
                <ThemedText style={[styles.variant, { color: muted }]}>{item.category}</ThemedText>
                <View style={styles.itemBottom}>
                  <View style={[styles.qtyPill, { borderColor: border }]}>
                    <Pressable style={styles.qtyBtn}>
                      <Ionicons name="remove" size={14} color={text} />
                    </Pressable>
                    <ThemedText style={styles.qtyText}>{item.quantity}</ThemedText>
                    <Pressable style={styles.qtyBtn}>
                      <Ionicons name="add" size={14} color={text} />
                    </Pressable>
                  </View>
                  <View style={styles.metaWrap}>
                    {state?.inventory[item.productId] === 'OUT_OF_STOCK' ? (
                      <View style={styles.metaRow}>
                        <Ionicons name="alert-circle-outline" size={12} color="#c52b2b" />
                        <ThemedText style={styles.lowStock}>Out of Stock</ThemedText>
                      </View>
                    ) : (
                      <View style={styles.metaRow}>
                        <Ionicons name="checkmark-circle-outline" size={12} color="green" />
                        <ThemedText style={[styles.delivery, { color: 'green' }]}>In Stock</ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.summaryCard, { backgroundColor: card, borderColor: border }]}>
          <ThemedText style={styles.summaryTitle}>Order Summary</ThemedText>
          <View style={styles.row}>
            <ThemedText style={[styles.rowLabel, { color: muted }]}>Subtotal</ThemedText>
            <ThemedText style={styles.rowValue}>{money(subtotal)}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText style={[styles.rowLabel, { color: muted }]}>Shipping</ThemedText>
            <ThemedText style={styles.rowValue}>Free</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText style={[styles.rowLabel, { color: muted }]}>Promo (HERITAGE10)</ThemedText>
            <ThemedText style={styles.rowValue}>-{money(discount)}</ThemedText>
          </View>
          {state?.session.confidence < 0.5 && (
            <ThemedText style={{ fontSize: 11, color: '#c52b2b', marginTop: 4 }}>
              * Check if you missed something? Our AI noticed some removals.
            </ThemedText>
          )}
          <View style={[styles.totalRow, { borderColor: border }]}>
            <ThemedText style={styles.totalLabel}>Total</ThemedText>
            <ThemedText style={styles.totalValue}>{money(total)}</ThemedText>
          </View>
        </View>
      </ScrollView>

      <View style={styles.checkoutWrap}>
        <Pressable style={[styles.checkoutButton, { backgroundColor: text }]}>
          <ThemedText lightColor={background} darkColor={background} style={styles.checkoutText}>
            Proceed to Checkout
          </ThemedText>
          <Ionicons name="arrow-forward" size={18} color={background} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 170,
    gap: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    fontFamily: Fonts.serif,
    fontSize: 27,
    fontWeight: '600',
  },
  heroHeader: {
    gap: 8,
  },
  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  mainHeading: {
    fontFamily: Fonts.serif,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: 0.2,
  },
  perkPill: {
    marginTop: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  perkText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '500',
  },
  itemsWrap: {
    gap: 12,
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  itemImage: {
    width: 92,
    height: 92,
    borderRadius: 10,
  },
  itemBody: {
    flex: 1,
    gap: 4,
  },
  itemTopLine: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  itemName: {
    flex: 1,
    fontFamily: Fonts.serif,
    fontSize: 14,
    lineHeight: 18,
  },
  itemPrice: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  variant: {
    fontFamily: Fonts.sans,
    fontSize: 11,
  },
  itemBottom: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  qtyPill: {
    borderWidth: 1,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  qtyBtn: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontFamily: Fonts.sans,
    fontWeight: '600',
    fontSize: 12,
    paddingHorizontal: 8,
  },
  metaWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lowStock: {
    color: '#c52b2b',
    fontSize: 10,
    fontFamily: Fonts.sans,
    fontWeight: '700',
  },
  delivery: {
    fontSize: 10,
    fontFamily: Fonts.sans,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    gap: 10,
    marginTop: 8,
  },
  summaryTitle: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  rowValue: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: Fonts.serif,
    fontSize: 24,
  },
  totalValue: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    fontWeight: '700',
  },
  checkoutWrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 106,
  },
  checkoutButton: {
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 8,
  },
  checkoutText: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
  },
});
