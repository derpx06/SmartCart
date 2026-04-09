import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';

import { radius, spacing, useLuxuryPalette, luxuryShadow } from './luxury/design';
import { ThemedText } from './themed-text';
import { Fonts } from '@/constants/theme';
import { RankedItem } from '@/types/smart-cart';

interface RecommendationSectionProps {
    ranked: RankedItem[];
    onAdd: (productId: string) => void;
}

export function RecommendationSection({ ranked, onAdd }: RecommendationSectionProps) {
    const palette = useLuxuryPalette();

    if (!ranked || ranked.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={[styles.kicker, { color: palette.gold }]}>Suggested for you</ThemedText>
                <ThemedText style={[styles.title, { color: palette.text }]}>Selected complementary pieces</ThemedText>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                snapToInterval={280 + spacing.md}
                decelerationRate="fast"
            >
                {ranked.map((item) => (
                    <View
                        key={item.productId}
                        style={[
                            styles.card,
                            { backgroundColor: palette.elevated, borderColor: palette.line },
                            luxuryShadow,
                        ]}
                    >
                        <View style={[styles.imagePlaceholder, { backgroundColor: palette.beige }]}>
                            <Ionicons name="sparkles-outline" size={32} color={palette.gold} />

                            <View style={styles.badgeContainer}>
                                {item.reasons.slice(0, 2).map((reason, idx) => (
                                    <View
                                        key={idx}
                                        style={[styles.reasonBadge, { backgroundColor: palette.gold }]}
                                    >
                                        <ThemedText style={styles.reasonText}>{reason}</ThemedText>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.cardBody}>
                            <ThemedText numberOfLines={1} style={[styles.productName, { color: palette.text }]}>
                                {item.name || 'Fine Selection'}
                            </ThemedText>

                            <ThemedText style={[styles.productPrice, { color: palette.gold }]}>
                                {item.price ? `$${item.price.toFixed(2)}` : 'Inquire for price'}
                            </ThemedText>

                            <Pressable
                                onPress={() => onAdd(item.productId)}
                                style={[styles.addButton, { backgroundColor: palette.text }]}
                            >
                                <ThemedText style={{ color: palette.elevated, fontWeight: '700', fontSize: 12 }}>
                                    Add to selection
                                </ThemedText>
                                <Ionicons name="add" size={16} color={palette.elevated} />
                            </Pressable>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: spacing.lg,
    },
    header: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
        gap: 4,
    },
    kicker: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1.4,
    },
    title: {
        fontFamily: Fonts.serif,
        fontSize: 22,
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        gap: spacing.md,
    },
    card: {
        width: 280,
        borderRadius: radius.xl,
        borderWidth: 1,
        overflow: 'hidden',
    },
    imagePlaceholder: {
        width: '100%',
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeContainer: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    reasonBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radius.pill,
    },
    reasonText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardBody: {
        padding: spacing.md,
        gap: 8,
    },
    productName: {
        fontFamily: Fonts.serif,
        fontSize: 18,
        fontWeight: '600',
    },
    productPrice: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        fontWeight: '700',
        marginTop: -4,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: radius.lg,
        gap: 8,
        marginTop: 4,
    },
});
