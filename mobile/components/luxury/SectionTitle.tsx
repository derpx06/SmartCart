import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/components/luxury/design';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type SectionTitleProps = {
  title: string;
  caption?: string;
};

export function SectionTitle({ title, caption }: SectionTitleProps) {
  const text = useThemeColor({}, 'text');
  const mutedText = useThemeColor({}, 'mutedText');

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: text }]}>{title}</Text>
      {caption ? <Text style={[styles.caption, { color: mutedText }]}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.serif,
    letterSpacing: 0.3,
  },
  caption: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    lineHeight: 22,
  },
});
