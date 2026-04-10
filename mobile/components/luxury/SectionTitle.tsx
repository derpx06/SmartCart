import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/components/luxury/design';
import { Fonts } from '@/constants/theme';

type SectionTitleProps = {
  title: string;
  caption?: string;
};

const SECTION_COLORS = {
  text: '#1C1B1F',
  muted: 'rgba(28, 27, 31, 0.68)',
};

export function SectionTitle({ title, caption }: SectionTitleProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: SECTION_COLORS.text }]}>{title}</Text>
      {caption ? <Text style={[styles.caption, { color: SECTION_COLORS.muted }]}>{caption}</Text> : null}
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
