import { Feather, Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useMobileAuthStore } from '@/store/auth-store';

type AuthMode = 'sign-in' | 'sign-up';

type AuthScreenProps = {
  mode: AuthMode;
};

export function AuthScreen({ mode }: AuthScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isSignIn = mode === 'sign-in';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const authError = useMobileAuthStore((state) => state.authError);
  const submitting = useMobileAuthStore((state) => state.submitting);
  const signIn = useMobileAuthStore((state) => state.signIn);
  const signUp = useMobileAuthStore((state) => state.signUp);
  const clearError = useMobileAuthStore((state) => state.clearError);

  const background = useThemeColor({}, 'background');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const mutedText = useThemeColor({}, 'mutedText');

  const validate = () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!isSignIn && !name.trim()) return 'Please enter your name.';
    if (!normalizedEmail) return 'Please enter your email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return 'Please enter a valid email address.';
    if (!password.trim()) return 'Please enter your password.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    return '';
  };

  const onSubmit = async () => {
    const message = validate();
    if (message) {
      setLocalError(message);
      clearError();
      return;
    }

    setLocalError('');
    if (isSignIn) {
      await signIn(email.trim().toLowerCase(), password);
    } else {
      await signUp(name.trim(), email.trim().toLowerCase(), password);
    }

    if (!useMobileAuthStore.getState().authError) {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 18, 24) }}>
          <View style={styles.content}>
            <View style={styles.headerBlock}>
              <ThemedText style={[styles.brand, { color: mutedText }]}>WILLIAMS SONOMA</ThemedText>
              <ThemedText style={styles.title}>{isSignIn ? 'Welcome back' : 'Create account'}</ThemedText>
              <ThemedText style={[styles.subtitle, { color: mutedText }]}>
                {isSignIn ? 'Sign in with your email and password.' : 'Create your Williams Sonoma account.'}
              </ThemedText>
            </View>

            {!isSignIn ? (
              <View style={styles.fieldWrap}>
                <ThemedText style={[styles.label, { color: mutedText }]}>Name</ThemedText>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={[styles.input, { borderColor: border, color: text }]}
                  placeholder="Your full name"
                  placeholderTextColor={mutedText}
                  autoCapitalize="words"
                />
              </View>
            ) : null}

            <View style={styles.fieldWrap}>
              <ThemedText style={[styles.label, { color: mutedText }]}>Email</ThemedText>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={[styles.input, { borderColor: border, color: text }]}
                placeholder="you@example.com"
                placeholderTextColor={mutedText}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldWrap}>
              <View style={styles.labelRow}>
                <ThemedText style={[styles.label, { color: mutedText }]}>Password</ThemedText>
                {isSignIn ? <ThemedText style={[styles.forgot, { color: mutedText }]}>Forgot?</ThemedText> : null}
              </View>
              <View style={[styles.passwordWrap, { borderColor: border }]}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  style={[styles.input, styles.passwordInput, { borderWidth: 0, color: text }]}
                  placeholder="••••••••"
                  placeholderTextColor={mutedText}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={17} color={mutedText} />
                </Pressable>
              </View>
            </View>

            {localError || authError ? (
              <ThemedText style={[styles.error, { color: '#C0392B' }]}>{localError || authError}</ThemedText>
            ) : null}

            <Pressable onPress={onSubmit} style={[styles.signInButton, { backgroundColor: text }]}>
              <ThemedText style={[styles.signInText, { color: background }]}>
                {submitting ? 'Please wait' : isSignIn ? 'Sign in' : 'Create account'}
              </ThemedText>
              <Ionicons name="arrow-forward" size={14} color={background} />
            </Pressable>

            <View style={styles.inviteRow}>
              <ThemedText style={[styles.small, { color: mutedText }]}>
                {isSignIn ? "Don't have an account?" : 'Already have an account?'}
              </ThemedText>
              <Link href={isSignIn ? '/(auth)/sign-up' : '/(auth)/sign-in'} asChild>
                <Pressable>
                  <ThemedText style={[styles.inviteAction, { color: text }]}>{isSignIn ? 'Sign up' : 'Sign in'}</ThemedText>
                </Pressable>
              </Link>
            </View>

            <Pressable onPress={() => router.replace('/(tabs)')} style={styles.backRow}>
              <Ionicons name="arrow-back" size={12} color={mutedText} />
              <ThemedText style={[styles.backText, { color: mutedText }]}>Back to home</ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  root: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  headerBlock: { marginBottom: 26 },
  brand: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 32,
    lineHeight: 38,
    marginBottom: 8,
    fontWeight: '700',
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  fieldWrap: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
  },
  forgot: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  passwordWrap: {
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  passwordInput: { flex: 1 },
  error: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    marginBottom: 10,
  },
  signInButton: {
    height: 58,
    borderRadius: 6,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signInText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  inviteRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    alignItems: 'center',
  },
  small: {
    fontFamily: Fonts.sans,
    fontSize: 11,
  },
  inviteAction: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
  },
  backRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 30,
  },
  backText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '500',
  },
});
