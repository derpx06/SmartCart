import { Feather, Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SocialAuthButton } from '@/components/auth/SocialAuthButton';
import { authRadius } from '@/components/auth/auth-theme';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type AuthMode = 'sign-in' | 'sign-up';

type AuthScreenProps = {
  mode: AuthMode;
};

export function AuthScreen({ mode }: AuthScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isSignIn = mode === 'sign-in';
  const isCompact = width < 360;
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const mutedText = useThemeColor({}, 'mutedText');

  const titleSize = useMemo(() => (isCompact ? 29 : 33), [isCompact]);
  const titleLineHeight = useMemo(() => (isCompact ? 34 : 38), [isCompact]);
  const horizontalPadding = isCompact ? 14 : 22;
  const cardPadding = isCompact ? 16 : 20;

  const validate = () => {
    if (!isSignIn && !name.trim()) {
      return 'Please enter your name.';
    }

    if (!email.trim()) {
      return 'Please enter your email.';
    }

    if (!password.trim()) {
      return 'Please enter your password.';
    }

    return '';
  };

  const handlePrimaryAction = () => {
    const message = validate();

    if (message) {
      setError(message);
      return;
    }

    setError('');
    router.replace('/(tabs)');
  };

  const handleSocialAuth = () => {
    setError('');
    router.replace('/(tabs)');
  };

  const handleBackHome = () => {
    setError('');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <View style={[styles.orbOne, { backgroundColor: text }]} />
        <View style={[styles.orbTwo, { backgroundColor: text }]} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: Math.max(insets.bottom + 16, 24),
            },
          ]}>
          <View style={styles.logoRow}>
            <View style={[styles.logoDot, { backgroundColor: text, borderColor: background }]} />
            <Text style={[styles.brand, { color: text }]}>AURELIA HOME</Text>
          </View>

          <View style={[styles.card, { padding: cardPadding, backgroundColor: card, borderColor: border }]}>
            <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleLineHeight, color: text }]}>
              {isSignIn ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={[styles.subtitle, { color: mutedText }]}>
              {isSignIn
                ? 'Sign in to continue your curated kitchen and home journey.'
                : 'Join to save favorites, track orders, and unlock personalized edits.'}
            </Text>

            {!isSignIn ? (
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: text }]}>Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={[styles.input, { backgroundColor: card, borderColor: border, color: text }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={mutedText}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            ) : null}

            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: text }]}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={[styles.input, { backgroundColor: card, borderColor: border, color: text }]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Enter your email"
                placeholderTextColor={mutedText}
                returnKeyType="next"
                textContentType="emailAddress"
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: text }]}>Password</Text>
              <View style={[styles.passwordWrap, { backgroundColor: card, borderColor: border }]}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  style={[styles.passwordInput, { color: text }]}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={mutedText}
                  returnKeyType="done"
                  textContentType="password"
                />
                <Pressable onPress={() => setShowPassword((prev) => !prev)} hitSlop={10}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={mutedText} />
                </Pressable>
              </View>
            </View>

            {isSignIn ? (
              <Pressable>
                <Text style={[styles.forgotPassword, { color: mutedText }]}>Forgot password?</Text>
              </Pressable>
            ) : null}

            {error ? <Text style={[styles.errorText, { color: text }]}>{error}</Text> : null}

            <Pressable
              onPress={handlePrimaryAction}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: text, borderColor: border },
                pressed && styles.primaryButtonPressed,
              ]}>
              <Text style={[styles.primaryButtonText, { color: background }]}>
                {isSignIn ? 'Sign In' : 'Create Account'}
              </Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: border }]} />
              <Text style={[styles.dividerText, { color: mutedText }]}>or continue with</Text>
              <View style={[styles.dividerLine, { backgroundColor: border }]} />
            </View>

            <SocialAuthButton provider="google" onPress={handleSocialAuth} />
            <SocialAuthButton provider="apple" disabled={Platform.OS !== 'ios'} onPress={handleSocialAuth} />

            <View style={styles.switchRow}>
              <Text style={[styles.switchText, { color: mutedText }]}>
                {isSignIn ? "Don't have an account?" : 'Already have an account?'}
              </Text>
              <Link href={isSignIn ? '/(auth)/sign-up' : '/(auth)/sign-in'} asChild>
                <Pressable>
                  <Text style={[styles.switchAction, { color: text }]}>{isSignIn ? 'Sign Up' : 'Sign In'}</Text>
                </Pressable>
              </Link>
            </View>
          </View>

          <Pressable onPress={handleBackHome} style={styles.backHome}>
            <Ionicons name="chevron-back" size={16} color={mutedText} />
            <Text style={[styles.backHomeText, { color: mutedText }]}>Back to Home</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  orbOne: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 260,
    top: -120,
    right: -80,
    opacity: 0.06,
  },
  orbTwo: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 200,
    bottom: 30,
    left: -110,
    opacity: 0.05,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 24,
    gap: 8,
  },
  logoDot: {
    width: 15,
    height: 15,
    borderRadius: 15,
    borderWidth: 3,
  },
  brand: {
    fontFamily: Fonts.serif,
    fontSize: 16,
    letterSpacing: 1,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: authRadius.card,
  },
  title: {
    fontFamily: Fonts.serif,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  fieldWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderRadius: authRadius.field,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  passwordWrap: {
    height: 50,
    borderRadius: authRadius.field,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    fontFamily: Fonts.sans,
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 12,
  },
  errorText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    marginBottom: 10,
  },
  primaryButton: {
    height: 52,
    borderRadius: authRadius.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  primaryButtonPressed: {
    opacity: 0.88,
  },
  primaryButtonText: {
    fontFamily: Fonts.sans,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 2,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
  },
  switchRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  switchText: {
    fontSize: 13,
    fontFamily: Fonts.sans,
  },
  switchAction: {
    fontSize: 13,
    fontFamily: Fonts.sans,
    fontWeight: '700',
  },
  backHome: {
    marginTop: 18,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backHomeText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
});
