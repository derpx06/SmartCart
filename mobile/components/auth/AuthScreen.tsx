import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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
  const [error, setError] = useState('');

  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const mutedText = useThemeColor({}, 'mutedText');

  const validate = () => {
    if (!isSignIn && !name.trim()) return 'Please enter your name.';
    if (!email.trim()) return 'Please enter your email.';
    if (!password.trim()) return 'Please enter your password.';
    return '';
  };

  const onSubmit = () => {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    setError('');
    router.replace('/(tabs)');
  };

  const onSocial = () => {
    setError('');
    router.replace('/(tabs)');
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
              <ThemedText style={styles.title}>{isSignIn ? 'Welcome Back' : 'Create Account'}</ThemedText>
              <ThemedText style={[styles.subtitle, { color: mutedText }]}>
                {isSignIn
                  ? 'Enter your credentials to access your curated collection.'
                  : 'Enter your details to create your curated account.'}
              </ThemedText>
            </View>

            {!isSignIn ? (
              <View style={styles.fieldWrap}>
                <ThemedText style={[styles.label, { color: mutedText }]}>NAME</ThemedText>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={[styles.input, { borderBottomColor: border, color: text }]}
                  placeholder="your full name"
                  placeholderTextColor={mutedText}
                  autoCapitalize="words"
                />
              </View>
            ) : null}

            <View style={styles.fieldWrap}>
              <ThemedText style={[styles.label, { color: mutedText }]}>EMAIL ADDRESS</ThemedText>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={[styles.input, { borderBottomColor: border, color: text }]}
                placeholder="chef@atelier.com"
                placeholderTextColor={mutedText}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldWrap}>
              <View style={styles.labelRow}>
                <ThemedText style={[styles.label, { color: mutedText }]}>PASSWORD</ThemedText>
                {isSignIn ? <ThemedText style={[styles.forgot, { color: mutedText }]}>FORGOT PASSWORD?</ThemedText> : null}
              </View>
              <View style={[styles.passwordWrap, { borderBottomColor: border }]}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  style={[styles.input, styles.passwordInput, { borderBottomWidth: 0, color: text }]}
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

            {error ? <ThemedText style={[styles.error, { color: text }]}>{error}</ThemedText> : null}

            <Pressable onPress={onSubmit} style={[styles.signInButton, { backgroundColor: text }]}>
              <ThemedText style={[styles.signInText, { color: background }]}>{isSignIn ? 'SIGN IN' : 'CREATE ACCOUNT'}</ThemedText>
              <Ionicons name="arrow-forward" size={14} color={background} />
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: border }]} />
              <ThemedText style={[styles.dividerText, { color: mutedText }]}>OR CONTINUE WITH</ThemedText>
              <View style={[styles.divider, { backgroundColor: border }]} />
            </View>

            <View style={styles.socialRow}>
              <Pressable onPress={onSocial} style={[styles.socialButton, { backgroundColor: card, borderColor: border }]}>
                <Image
                  source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' }}
                  style={styles.googleLogo}
                  contentFit="contain"
                />
                <ThemedText style={styles.socialText}>GOOGLE</ThemedText>
              </Pressable>
              <Pressable onPress={onSocial} style={[styles.socialButton, { backgroundColor: card, borderColor: border }]}>
                <Ionicons name="logo-apple" size={18} color={text} />
                <ThemedText style={styles.socialText}>APPLE</ThemedText>
              </Pressable>
            </View>

            <View style={styles.inviteRow}>
              <ThemedText style={[styles.small, { color: mutedText }]}>
                {isSignIn ? 'New to the Atelier?' : 'Already with us?'}
              </ThemedText>
              <Link href={isSignIn ? '/(auth)/sign-up' : '/(auth)/sign-in'} asChild>
                <Pressable>
                  <ThemedText style={styles.inviteAction}>{isSignIn ? 'Request Invitation' : 'Sign In'}</ThemedText>
                </Pressable>
              </Link>
            </View>

            <Pressable onPress={() => router.replace('/(tabs)')} style={styles.backRow}>
              <Ionicons name="arrow-back" size={12} color={mutedText} />
              <ThemedText style={[styles.backText, { color: mutedText }]}>BACK TO HOME</ThemedText>
            </Pressable>
          </View>

          <View style={[styles.footer, { backgroundColor: card, borderTopColor: border }]}> 
            <ThemedText style={styles.footerBrand}>THE CULINARY ATELIER</ThemedText>
            <View style={styles.footerLinks}>
              <ThemedText style={[styles.footerLink, { color: mutedText }]}>PRIVACY</ThemedText>
              <ThemedText style={[styles.footerLink, { color: mutedText }]}>TERMS</ThemedText>
              <ThemedText style={[styles.footerLink, { color: mutedText }]}>SUPPORT</ThemedText>
            </View>
            <ThemedText style={[styles.footerCopy, { color: mutedText }]}>
              © 2024 THE CULINARY ATELIER. CRAFTED FOR THE MODERN KITCHEN.
            </ThemedText>
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
  title: {
    fontFamily: Fonts.serif,
    fontSize: 40,
    lineHeight: 44,
    marginBottom: 12,
    fontWeight: '700',
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 24,
  },
  fieldWrap: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontWeight: '700',
  },
  forgot: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  input: {
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontFamily: Fonts.sans,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '300',
  },
  passwordWrap: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dividerRow: {
    marginTop: 28,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  divider: { flex: 1, height: 1 },
  dividerText: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 52,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  socialText: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  googleLogo: {
    width: 18,
    height: 18,
  },
  inviteRow: {
    marginTop: 30,
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
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 10,
  },
  footerBrand: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 22,
  },
  footerLink: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  footerCopy: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 16,
  },
});
