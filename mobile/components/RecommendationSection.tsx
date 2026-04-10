import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';

import { radius, spacing, luxuryShadow } from './luxury/design';
import { ThemedText } from './themed-text';
import { Fonts } from '@/constants/theme';
import { RankedItem } from '@/types/smart-cart';

interface RecommendationSectionProps {
    ranked: RankedItem[];
    onAdd: (productId: string) => void;
}

const REC_MONO = {
    white: '#FFFFFF',
    soft: '#E9E9E7',
    ink: '#1C1B1F',
};

const REC_COLORS = {
    cardBg: REC_MONO.white,
    imageBg: REC_MONO.soft,
    border: 'rgba(28, 27, 31, 0.14)',
    text: REC_MONO.ink,
    badgeBg: REC_MONO.ink,
    badgeText: REC_MONO.white,
    buttonBg: REC_MONO.ink,
    buttonText: REC_MONO.white,
};

export function RecommendationSection({ ranked, onAdd }: RecommendationSectionProps) {
    if (!ranked || ranked.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={[styles.kicker, { color: REC_COLORS.text }]}>Suggested for you</ThemedText>
                <ThemedText style={[styles.title, { color: REC_COLORS.text }]}>Selected complementary pieces</ThemedText>
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
                            { backgroundColor: REC_COLORS.cardBg, borderColor: REC_COLORS.border },
                            luxuryShadow,
                        ]}
                    >
                        <View style={[styles.imagePlaceholder, { backgroundColor: REC_COLORS.imageBg }]}>
                            <Ionicons name="sparkles-outline" size={32} color={REC_COLORS.text} />

                            <View style={styles.badgeContainer}>
                                {item.reasons.slice(0, 2).map((reason, idx) => (
                                    <View
                                        key={idx}
                                        style={[styles.reasonBadge, { backgroundColor: REC_COLORS.badgeBg }]}
                                    >
                                        <ThemedText style={styles.reasonText}>{reason}</ThemedText>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.cardBody}>
                            <ThemedText numberOfLines={1} style={[styles.productName, { color: REC_COLORS.text }]}>
                                {item.name || 'Fine Selection'}
                            </ThemedText>

                            <ThemedText style={[styles.productPrice, { color: REC_COLORS.text }]}>
                                {item.price ? `$${item.price.toFixed(2)}` : 'Inquire for price'}
                            </ThemedText>

                            <Pressable
                                onPress={() => onAdd(item.productId)}
                                style={[styles.addButton, { backgroundColor: REC_COLORS.buttonBg }]}
                            >
                                <ThemedText style={{ color: REC_COLORS.buttonText, fontWeight: '700', fontSize: 12 }}>
                                    Add to selection
                                </ThemedText>
                                <Ionicons name="add" size={16} color={REC_COLORS.buttonText} />
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
        color: REC_COLORS.badgeText,
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
