import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing, useLuxuryPalette } from '@/components/luxury/design';
import { Fonts } from '@/constants/theme';

type SectionTitleProps = {
  title: string;
  caption?: string;
};

export function SectionTitle({ title, caption }: SectionTitleProps) {
  const palette = useLuxuryPalette();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      {caption ? <Text style={[styles.caption, { color: palette.mutedText }]}>{caption}</Text> : null}
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
