import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { luxuryShadow, radius, spacing, useLuxuryPalette } from '@/components/luxury/design';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type MessageRole = 'user' | 'assistant';

interface Message {
    id: string;
    role: MessageRole;
    text: string;
    time: string;
}

const SUGGESTIONS = [
    'What would pair well with cast iron?',
    'Find me a gift under $100',
    "What's trending in cookware?",
    'Help me build a kitchen kit',
];

function now() {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

const INITIAL_MESSAGES: Message[] = [
    {
        id: 'welcome',
        role: 'assistant',
        text: "Good morning. I'm your personal culinary concierge. Ask me anything — from pairing recommendations to curating the perfect gifting selection.",
        time: now(),
    },
];

function MessageBubble({
    msg,
    palette,
}: {
    msg: Message;
    palette: ReturnType<typeof useLuxuryPalette>;
}) {
    const isUser = msg.role === 'user';
    return (
        <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
            {!isUser && (
                <View style={[styles.avatar, { backgroundColor: palette.gold }]}>
                    <Ionicons name="sparkles" size={13} color="#FFF" />
                </View>
            )}
            <View
                style={[
                    styles.bubble,
                    isUser
                        ? [styles.bubbleUser, { backgroundColor: palette.text }]
                        : [styles.bubbleAssistant, { backgroundColor: palette.elevated, borderColor: palette.line }],
                ]}>
                <ThemedText
                    style={[styles.bubbleText, { color: isUser ? palette.background : palette.text }]}>
                    {msg.text}
                </ThemedText>
                <ThemedText
                    style={[styles.bubbleTime, { color: isUser ? palette.beige : palette.mutedText }]}>
                    {msg.time}
                </ThemedText>
            </View>
        </View>
    );
}

function TypingIndicator({ palette }: { palette: ReturnType<typeof useLuxuryPalette> }) {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        const bounce = (dot: Animated.Value, delay: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, { toValue: -5, duration: 240, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0, duration: 240, useNativeDriver: true }),
                    Animated.delay(500),
                ])
            ).start();
        bounce(dot1, 0);
        bounce(dot2, 110);
        bounce(dot3, 220);
    }, [dot1, dot2, dot3]);

    return (
        <View style={styles.bubbleRow}>
            <View style={[styles.avatar, { backgroundColor: palette.gold }]}>
                <Ionicons name="sparkles" size={13} color="#FFF" />
            </View>
            <View
                style={[
                    styles.bubble,
                    styles.bubbleAssistant,
                    { backgroundColor: palette.elevated, borderColor: palette.line },
                ]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
                    {[dot1, dot2, dot3].map((dot, i) => (
                        <Animated.View
                            key={i}
                            style={{
                                width: 7,
                                height: 7,
                                borderRadius: 4,
                                backgroundColor: palette.gold,
                                marginHorizontal: 3,
                                transform: [{ translateY: dot }],
                            }}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
}

export default function ChatScreen() {
    const palette = useLuxuryPalette();
    const muted = useThemeColor({}, 'mutedText');

    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<ScrollView>(null);

    const sendMessage = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: trimmed, time: now() };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const botMsg: Message = {
                id: `a-${Date.now()}`,
                role: 'assistant',
                text: "That's a wonderful question. Our curation experts are sourcing the finest options for you. AI-powered recommendations will be available shortly.",
                time: now(),
            };
            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
        }, 1600);

        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
            {/* Atmosphere orbs */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <View style={[styles.orb, { backgroundColor: palette.gold + '20', top: -40, right: -60, width: 220, height: 220 }]} />
                <View style={[styles.orb, { backgroundColor: palette.gold + '12', top: 150, left: -80, width: 180, height: 180 }]} />
            </View>

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: palette.line }]}>
                <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.kicker, { color: palette.gold }]}>AI Concierge</ThemedText>
                    <ThemedText style={[styles.title, { color: palette.text }]}>Your culinary guide</ThemedText>
                </View>
                <View style={[styles.badge, { backgroundColor: palette.gold + '20', borderColor: palette.gold + '55' }]}>
                    <View style={[styles.dot, { backgroundColor: palette.gold }]} />
                    <ThemedText style={[styles.badgeText, { color: palette.gold }]}>Online</ThemedText>
                </View>
            </View>

            {/* Messages + Input — flex column fills remaining height */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={100}>
                {/* Message list */}
                <ScrollView
                    ref={scrollRef}
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.messageContent}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
                    {messages.map((m) => (
                        <MessageBubble key={m.id} msg={m} palette={palette} />
                    ))}
                    {isTyping && <TypingIndicator palette={palette} />}
                </ScrollView>

                {/* Quick suggestion pills (only when fresh) */}
                {messages.length <= 1 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ flexShrink: 0 }}
                        contentContainerStyle={styles.pillsContent}>
                        {SUGGESTIONS.map((s) => (
                            <Pressable
                                key={s}
                                onPress={() => sendMessage(s)}
                                style={[styles.pill, { backgroundColor: palette.elevated, borderColor: palette.line }]}>
                                <ThemedText style={[styles.pillText, { color: palette.text }]}>{s}</ThemedText>
                            </Pressable>
                        ))}
                    </ScrollView>
                )}

                {/* Input bar — always visible at bottom */}
                <View style={[styles.inputBar, { backgroundColor: palette.elevated, borderColor: palette.line }, luxuryShadow]}>
                    <TextInput
                        style={[styles.inputField, { color: palette.text }]}
                        placeholder="Ask your culinary question…"
                        placeholderTextColor={muted}
                        value={input}
                        onChangeText={setInput}
                        onSubmitEditing={() => sendMessage(input)}
                        returnKeyType="send"
                        multiline
                        maxLength={500}
                    />
                    <Pressable
                        onPress={() => sendMessage(input)}
                        disabled={!input.trim()}
                        style={[styles.sendBtn, { backgroundColor: input.trim() ? palette.text : palette.line }]}>
                        <Ionicons
                            name="arrow-up"
                            size={18}
                            color={input.trim() ? palette.background : palette.mutedText}
                        />
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    orb: {
        position: 'absolute',
        borderRadius: 999,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        gap: 12,
    },
    kicker: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        letterSpacing: 1.4,
        textTransform: 'uppercase',
    },
    title: {
        fontFamily: Fonts.serif,
        fontSize: 26,
        fontWeight: '600',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    badgeText: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    // Messages
    messageContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        gap: spacing.sm,
    },
    bubbleRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        maxWidth: '85%',
    },
    bubbleRowUser: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
        maxWidth: '80%',
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    bubble: {
        borderRadius: radius.lg,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 4,
    },
    bubbleUser: {
        borderBottomRightRadius: 4,
    },
    bubbleAssistant: {
        borderWidth: 1,
        borderBottomLeftRadius: 4,
    },
    bubbleText: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        lineHeight: 21,
    },
    bubbleTime: {
        fontFamily: Fonts.sans,
        fontSize: 10,
        textAlign: 'right',
    },

    // Pills
    pillsContent: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs,
        gap: 8,
    },
    pill: {
        borderRadius: radius.pill,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    pillText: {
        fontFamily: Fonts.sans,
        fontSize: 13,
    },

    // Input bar
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        marginTop: spacing.xs,
        borderRadius: radius.xl,
        borderWidth: 1,
        paddingLeft: spacing.md,
        paddingRight: 8,
        paddingVertical: 8,
        gap: 8,
    },
    inputField: {
        flex: 1,
        fontFamily: Fonts.sans,
        fontSize: 14,
        lineHeight: 20,
        maxHeight: 100,
        paddingVertical: 4,
    },
    sendBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
});
