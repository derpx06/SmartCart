import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, PressableProps, StyleSheet, Text, View } from 'react-native';

import { authRadius } from '@/components/auth/auth-theme';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type Provider = 'google' | 'apple';

type SocialAuthButtonProps = {
  provider: Provider;
  disabled?: boolean;
  onPress?: PressableProps['onPress'];
};

export function SocialAuthButton({ provider, disabled = false, onPress }: SocialAuthButtonProps) {
  const isGoogle = provider === 'google';
  const iconName = isGoogle ? 'logo-google' : 'logo-apple';
  const label = isGoogle ? 'Continue with Google' : 'Continue with Apple';
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const mutedText = useThemeColor({}, 'mutedText');
  const iconColor = card;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: card, borderColor: border },
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: border }]}>
        <Ionicons name={iconName} size={17} color={iconColor} />
      </View>
      <Text style={[styles.label, { color: text }, disabled && styles.labelDisabled, disabled && { color: mutedText }]}>
        {label}
      </Text>
      {disabled ? <Text style={[styles.disabledTag, { color: mutedText }]}>iOS only</Text> : <View style={styles.placeholder} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: authRadius.button,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.66,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontWeight: '600',
    fontSize: 14,
  },
  labelDisabled: {
    opacity: 0.8,
  },
  disabledTag: {
    fontSize: 11,
    fontFamily: Fonts.sans,
  },
  placeholder: {
    width: 42,
  },
});
