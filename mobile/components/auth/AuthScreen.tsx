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
import { authPalette, authRadius } from '@/components/auth/auth-theme';
import { Fonts } from '@/constants/theme';

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
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <View style={styles.orbOne} />
        <View style={styles.orbTwo} />

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
            <View style={styles.logoDot} />
            <Text style={styles.brand}>AURELIA HOME</Text>
          </View>

          <View style={[styles.card, { padding: cardPadding }]}>
            <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleLineHeight }]}>
              {isSignIn ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignIn
                ? 'Sign in to continue your curated kitchen and home journey.'
                : 'Join to save favorites, track orders, and unlock personalized edits.'}
            </Text>

            {!isSignIn ? (
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#938A7D"
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            ) : null}

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Enter your email"
                placeholderTextColor="#938A7D"
                returnKeyType="next"
                textContentType="emailAddress"
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  style={styles.passwordInput}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#938A7D"
                  returnKeyType="done"
                  textContentType="password"
                />
                <Pressable onPress={() => setShowPassword((prev) => !prev)} hitSlop={10}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color="#7E776C" />
                </Pressable>
              </View>
            </View>

            {isSignIn ? (
              <Pressable>
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </Pressable>
            ) : null}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              onPress={handlePrimaryAction}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
              <Text style={styles.primaryButtonText}>{isSignIn ? 'Sign In' : 'Create Account'}</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <SocialAuthButton provider="google" onPress={handleSocialAuth} />
            <SocialAuthButton
              provider="apple"
              disabled={Platform.OS !== 'ios'}
              onPress={handleSocialAuth}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {isSignIn ? "Don't have an account?" : 'Already have an account?'}
              </Text>
              <Link href={isSignIn ? '/(auth)/sign-up' : '/(auth)/sign-in'} asChild>
                <Pressable>
                  <Text style={styles.switchAction}>{isSignIn ? 'Sign Up' : 'Sign In'}</Text>
                </Pressable>
              </Link>
            </View>
          </View>

          <Pressable onPress={handleBackHome} style={styles.backHome}>
            <Ionicons name="chevron-back" size={16} color={authPalette.muted} />
            <Text style={styles.backHomeText}>Back to Home</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: authPalette.background,
  },
  root: {
    flex: 1,
    backgroundColor: authPalette.background,
  },
  orbOne: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: '#F2E7D7',
    top: -120,
    right: -80,
    opacity: 0.55,
  },
  orbTwo: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 200,
    backgroundColor: '#F6EEE2',
    bottom: 30,
    left: -110,
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
    backgroundColor: authPalette.gold,
    borderWidth: 3,
    borderColor: '#EADCC7',
  },
  brand: {
    fontFamily: Fonts.serif,
    fontSize: 16,
    letterSpacing: 1,
    color: authPalette.text,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    backgroundColor: authPalette.card,
    borderWidth: 1,
    borderColor: authPalette.border,
    borderRadius: authRadius.card,
  },
  title: {
    fontFamily: Fonts.serif,
    color: authPalette.text,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: authPalette.muted,
    marginBottom: 20,
  },
  fieldWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: authPalette.text,
    fontFamily: Fonts.sans,
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderRadius: authRadius.field,
    backgroundColor: authPalette.field,
    borderWidth: 1,
    borderColor: '#E5DAC9',
    paddingHorizontal: 14,
    color: authPalette.text,
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  passwordWrap: {
    height: 50,
    borderRadius: authRadius.field,
    backgroundColor: authPalette.field,
    borderWidth: 1,
    borderColor: '#E5DAC9',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    color: authPalette.text,
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    color: '#6E665A',
    fontFamily: Fonts.sans,
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#9C4B3B',
    fontFamily: Fonts.sans,
    fontSize: 12,
    marginBottom: 10,
  },
  primaryButton: {
    height: 52,
    borderRadius: authRadius.button,
    backgroundColor: authPalette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  primaryButtonPressed: {
    opacity: 0.88,
  },
  primaryButtonText: {
    color: authPalette.primaryText,
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
    backgroundColor: '#E7DDCF',
  },
  dividerText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: authPalette.muted,
  },
  switchRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  switchText: {
    color: authPalette.muted,
    fontSize: 13,
    fontFamily: Fonts.sans,
  },
  switchAction: {
    color: authPalette.text,
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
    color: authPalette.muted,
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
});
