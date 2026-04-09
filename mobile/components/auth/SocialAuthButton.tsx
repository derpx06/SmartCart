import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { authPalette, authRadius } from '@/components/auth/auth-theme';
import { Fonts } from '@/constants/theme';

type Provider = 'google' | 'apple';

type SocialAuthButtonProps = {
  provider: Provider;
  disabled?: boolean;
};

export function SocialAuthButton({ provider, disabled = false }: SocialAuthButtonProps) {
  const isGoogle = provider === 'google';
  const iconName = isGoogle ? 'logo-google' : 'logo-apple';
  const label = isGoogle ? 'Continue with Google' : 'Continue with Apple';

  return (
    <Pressable style={[styles.button, disabled && styles.buttonDisabled]}>
      <View style={[styles.iconWrap, !isGoogle && styles.iconWrapApple]}>
        <Ionicons name={iconName} size={17} color={isGoogle ? '#6D5A3B' : '#1F1D1A'} />
      </View>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      {disabled ? <Text style={styles.disabledTag}>iOS only</Text> : <View style={styles.placeholder} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: authRadius.button,
    backgroundColor: authPalette.card,
    borderWidth: 1,
    borderColor: authPalette.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.66,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 28,
    backgroundColor: '#F4E8D7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconWrapApple: {
    backgroundColor: '#ECE6DE',
  },
  label: {
    flex: 1,
    color: authPalette.text,
    fontFamily: Fonts.sans,
    fontWeight: '600',
    fontSize: 14,
  },
  labelDisabled: {
    color: '#8D867A',
  },
  disabledTag: {
    color: authPalette.muted,
    fontSize: 11,
    fontFamily: Fonts.sans,
  },
  placeholder: {
    width: 42,
  },
});
