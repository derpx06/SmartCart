import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { luxuryShadow, radius, spacing } from '@/components/luxury/design';
import { ChatProductCard } from '@/components/chat/ChatProductCard';
import { FLOATING_TAB_BAR_HEIGHT, getFloatingTabBarBottomOffset } from '@/components/navigation/FloatingTabBar';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { api, type ChatProductCard as StructuredChatProductCard, type ChatProductSummary } from '@/lib/api';

type MessageRole = 'user' | 'assistant';

interface Message {
  id: string;
  role: MessageRole;
  text: string;
  time: string;
  products?: ChatProductSummary[];
  productCards?: StructuredChatProductCard[];
  intent?: string;
  needs?: string[];
  isStreaming?: boolean;
  isError?: boolean;
  actionMessage?: string;
}

const SUGGESTIONS = [
  'What pairs well with cast iron?',
  'Find a gift under $100',
  "What's trending in cookware?",
  'Build a starter kitchen kit',
];

const CHAT_MONO = {
  white: '#FFFFFF',
  soft: '#E9E9E7',
  ink: '#1C1B1F',
};

const CHAT_COLORS = {
  screenBg: CHAT_MONO.white,
  streamBg: CHAT_MONO.soft,
  streamBorder: 'rgba(28, 27, 31, 0.12)',
  dayChipBg: CHAT_MONO.white,
  dayChipBorder: 'rgba(28, 27, 31, 0.14)',
  dayChipText: 'rgba(28, 27, 31, 0.72)',
  assistantAvatarBg: CHAT_MONO.ink,
  assistantAvatarIcon: CHAT_MONO.white,
  assistantBubbleBg: CHAT_MONO.white,
  assistantBubbleBorder: 'rgba(28, 27, 31, 0.14)',
  assistantText: CHAT_MONO.ink,
  assistantRole: CHAT_MONO.ink,
  assistantTime: 'rgba(28, 27, 31, 0.68)',
  userBubbleBg: CHAT_MONO.ink,
  userBubbleBorder: CHAT_MONO.ink,
  userText: CHAT_MONO.white,
  userTime: 'rgba(255, 255, 255, 0.74)',
  orbPrimary: 'rgba(28, 27, 31, 0.06)',
  orbSecondary: 'rgba(233, 233, 231, 0.56)',
  suggestionBg: CHAT_MONO.white,
  suggestionBorder: 'rgba(28, 27, 31, 0.14)',
  suggestionIcon: CHAT_MONO.ink,
  suggestionText: CHAT_MONO.ink,
  inputBg: CHAT_MONO.white,
  inputBorder: 'rgba(28, 27, 31, 0.16)',
  inputText: CHAT_MONO.ink,
  inputPlaceholder: 'rgba(28, 27, 31, 0.52)',
  sendEnabledBg: CHAT_MONO.ink,
  sendEnabledIcon: CHAT_MONO.white,
  sendDisabledBg: CHAT_MONO.soft,
  sendDisabledIcon: 'rgba(28, 27, 31, 0.42)',
};

function now() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: "Welcome to SmartCart AI. Tell me what you're shopping for, and I'll recommend products that match your needs and budget.",
    time: now(),
  },
];

function MessageBubble({
  msg,
  onPressProduct,
}: {
  msg: Message;
  onPressProduct?: (product: ChatProductSummary) => void;
}) {
  const isUser = msg.role === 'user';
  const hasProducts = !isUser && (msg.products?.length ?? 0) > 0;
  const subtitle = useMemo(() => {
    if (isUser) return null;
    if (!msg.intent && (!msg.needs || msg.needs.length === 0)) return null;
    const intentLine = msg.intent ? `Intent: ${msg.intent.replaceAll('_', ' ')}` : '';
    const needsLine = msg.needs?.length ? `Needs: ${msg.needs.join(', ')}` : '';
    return [intentLine, needsLine].filter(Boolean).join(' • ');
  }, [isUser, msg.intent, msg.needs]);

  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: CHAT_COLORS.assistantAvatarBg }]}>
          <Ionicons name="sparkles" size={13} color={CHAT_COLORS.assistantAvatarIcon} />
        </View>
      )}
      <View style={isUser ? styles.bubbleUserWrap : styles.bubbleAssistantWrap}>
        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.bubbleUser, { backgroundColor: CHAT_COLORS.userBubbleBg, borderColor: CHAT_COLORS.userBubbleBorder }]
              : [
                  styles.bubbleAssistant,
                  { backgroundColor: CHAT_COLORS.assistantBubbleBg, borderColor: msg.isError ? 'rgba(197, 43, 43, 0.35)' : CHAT_COLORS.assistantBubbleBorder },
                ],
          ]}>
          <ThemedText style={[styles.bubbleText, { color: isUser ? CHAT_COLORS.userText : CHAT_COLORS.assistantText }]}>
            {msg.text}
          </ThemedText>
          {msg.actionMessage ? (
            <ThemedText style={[styles.bubbleActionHint, { color: CHAT_COLORS.assistantRole }]}>
              {msg.actionMessage}
            </ThemedText>
          ) : null}

          {subtitle ? (
            <ThemedText style={[styles.bubbleSubtitle, { color: CHAT_COLORS.assistantTime }]} numberOfLines={2}>
              {subtitle}
            </ThemedText>
          ) : null}

          <View style={styles.bubbleMeta}>
            {!isUser && (
              <ThemedText style={[styles.bubbleRole, { color: CHAT_COLORS.assistantRole }]}>
                {msg.isError ? 'Concierge (error)' : 'Concierge'}
              </ThemedText>
            )}
            <ThemedText style={[styles.bubbleTime, { color: isUser ? CHAT_COLORS.userTime : CHAT_COLORS.assistantTime }]}>
              {msg.isStreaming ? 'Streaming…' : msg.time}
            </ThemedText>
          </View>
        </View>

        {hasProducts ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productRail}>
            {msg.products?.map((p) => (
              <ChatProductCard key={p.id} product={p} onPress={onPressProduct} />
            ))}
          </ScrollView>
        ) : null}
      </View>
    </View>
  );
}

function TypingIndicator() {
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
      <View style={[styles.avatar, { backgroundColor: CHAT_COLORS.assistantAvatarBg }]}>
        <Ionicons name="sparkles" size={13} color={CHAT_COLORS.assistantAvatarIcon} />
      </View>
      <View
        style={[
          styles.bubble,
          styles.bubbleAssistantWrap,
          styles.bubbleAssistant,
          { backgroundColor: CHAT_COLORS.assistantBubbleBg, borderColor: CHAT_COLORS.assistantBubbleBorder },
        ]}>
        <View style={styles.typingRow}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View
              key={i}
              style={[
                styles.typingDot,
                {
                  backgroundColor: CHAT_COLORS.assistantAvatarBg,
                  transform: [{ translateY: dot }],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarClearance = getFloatingTabBarBottomOffset(insets.bottom) + FLOATING_TAB_BAR_HEIGHT + spacing.xs;

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const abortRef = useRef<null | (() => void)>(null);

  const onPressProduct = useCallback(
    (product: ChatProductSummary) => {
      if (product.slug) {
        router.push(`/product/${product.slug}`);
        return;
      }
      Alert.alert('Unavailable', 'This recommendation is missing a product slug and cannot be opened yet.');
    },
    [router]
  );

  useEffect(() => {
    return () => {
      abortRef.current?.();
      abortRef.current = null;
    };
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (isSending) return;

    abortRef.current?.();
    abortRef.current = null;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: trimmed, time: now() };
    const assistantId = `a-${Date.now()}`;
    const assistantPlaceholder: Message = {
      id: assistantId,
      role: 'assistant',
      text: '',
      time: now(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setInput('');
    setIsSending(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      const result = await api.streamChatMessage(trimmed, sessionId ?? undefined, {
        onMeta: (meta) => {
          setSessionId(meta.sessionId);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    products: meta.productCards?.length
                      ? meta.productCards.map((c) => ({
                          id: c.id,
                          slug: c.slug,
                          name: c.title,
                          category: c.subtitle,
                          price: c.price,
                          image: c.imageUrl,
                        }))
                      : meta.products,
                    productCards: meta.productCards,
                    intent: meta.intent,
                    needs: meta.needs,
                    actionMessage: meta.action?.status === 'PENDING_CONFIRMATION' ? meta.action.message : undefined,
                  }
                : m
            )
          );
        },
        onChunk: (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    text: m.text ? `${m.text} ${chunk}` : chunk,
                  }
                : m
            )
          );
        },
        onDone: () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    isStreaming: false,
                    time: now(),
                  }
                : m
            )
          );
        },
        onError: () => {
          // fallback path in api.streamChatMessage will still call onMeta/onChunk/onDone; we only surface hard errors here if needed.
        },
      });

      abortRef.current = result.abort;
      if (result.sessionId) setSessionId(result.sessionId);
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                isStreaming: false,
                isError: true,
                text: m.text || 'Something went wrong while contacting the concierge. Please try again.',
                time: now(),
              }
            : m
        )
      );
    } finally {
      setIsSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    }
  }, [isSending, sessionId]);

  const canSend = Boolean(input.trim()) && !isSending;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: CHAT_COLORS.screenBg }]} edges={['top', 'left', 'right']}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View
          style={[
            styles.orb,
            { backgroundColor: CHAT_COLORS.orbPrimary, top: -52, right: -74, width: 240, height: 240 },
          ]}
        />
        <View
          style={[
            styles.orb,
            { backgroundColor: CHAT_COLORS.orbSecondary, top: 170, left: -84, width: 186, height: 186 },
          ]}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>AI Chat</ThemedText>
          <ThemedText style={styles.headerSubtitle} numberOfLines={1}>
            Ask for recommendations, comparisons, and cart help
          </ThemedText>
        </View>

        <View style={[styles.streamWrap, { backgroundColor: CHAT_COLORS.streamBg, borderColor: CHAT_COLORS.streamBorder }]}>
          <View style={[styles.dayChip, { backgroundColor: CHAT_COLORS.dayChipBg, borderColor: CHAT_COLORS.dayChipBorder }]}>
            <ThemedText style={[styles.dayChipText, { color: CHAT_COLORS.dayChipText }]}>Today</ThemedText>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.stream}
            contentContainerStyle={styles.messageContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} onPressProduct={onPressProduct} />
            ))}
            {isSending && <TypingIndicator />}
          </ScrollView>
        </View>

        {messages.length <= 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pillsRail}
            contentContainerStyle={styles.pillsContent}>
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => sendMessage(s)}
                style={[styles.pill, { backgroundColor: CHAT_COLORS.suggestionBg, borderColor: CHAT_COLORS.suggestionBorder }]}>
                <Ionicons name="sparkles-outline" size={14} color={CHAT_COLORS.suggestionIcon} />
                <ThemedText numberOfLines={1} style={[styles.pillText, { color: CHAT_COLORS.suggestionText }]}>
                  {s}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        )}


        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: CHAT_COLORS.inputBg,
              borderColor: CHAT_COLORS.inputBorder,
              marginBottom: tabBarClearance,
            },
            luxuryShadow,
          ]}>
          <TextInput
            style={[styles.inputField, { color: CHAT_COLORS.inputText }]}
            placeholder="Type a message..."
            placeholderTextColor={CHAT_COLORS.inputPlaceholder}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
            multiline={false}
            maxLength={500}
            editable={!isSending}
          />
          <Pressable
            onPress={() => sendMessage(input)}
            disabled={!canSend}
            style={[styles.sendBtn, { backgroundColor: canSend ? CHAT_COLORS.sendEnabledBg : CHAT_COLORS.sendDisabledBg }]}>
            <Ionicons name="arrow-up" size={18} color={canSend ? CHAT_COLORS.sendEnabledIcon : CHAT_COLORS.sendDisabledIcon} />
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
  flexOne: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '700',
    color: CHAT_COLORS.ink,
  },
  headerSubtitle: {
    marginTop: 4,
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(28, 27, 31, 0.68)',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  streamWrap: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  dayChip: {
    alignSelf: 'center',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dayChipText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  stream: {
    flex: 1,
    marginTop: spacing.xs,
  },
  messageContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    width: '100%',
    maxWidth: '100%',
  },
  bubbleRowUser: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
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
    borderWidth: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  bubbleUserWrap: {
    marginLeft: 'auto',
    maxWidth: '86%',
  },
  bubbleAssistantWrap: {
    maxWidth: '78%',
  },
  bubbleUser: {
    borderBottomRightRadius: 6,
  },
  bubbleAssistant: {
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    flexShrink: 1,
  },
  bubbleSubtitle: {
    marginTop: 6,
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 16,
  },
  bubbleActionHint: {
    marginTop: 8,
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  bubbleMeta: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  bubbleRole: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  bubbleTime: {
    marginLeft: 'auto',
    fontFamily: Fonts.sans,
    fontSize: 10,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  pillsRail: {
    marginTop: spacing.sm,
    flexGrow: 0,
  },
  pillsContent: {
    paddingHorizontal: spacing.lg,
    gap: 8,
    paddingRight: spacing.xl,
  },
  pill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    maxWidth: 220,
  },
  productRail: {
    paddingTop: 10,
    paddingLeft: 38,
    paddingBottom: 2,
    gap: 10,
    paddingRight: spacing.md,
  },
  inputHint: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
    fontFamily: Fonts.sans,
    fontSize: 12,
  },
  inputBar: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingLeft: spacing.sm,
    paddingRight: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputField: {
    flex: 1,
    minWidth: 0,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    maxHeight: 110,
    paddingVertical: 5,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
