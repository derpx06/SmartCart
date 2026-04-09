import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, spacing } from '@/components/luxury/design';
import { Fonts } from '@/constants/theme';

type SectionTitleProps = {
  title: string;
  caption?: string;
};

export function SectionTitle({ title, caption }: SectionTitleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    color: palette.text,
    fontSize: 28,
    fontFamily: Fonts.serif,
    letterSpacing: 0.3,
  },
  caption: {
    color: palette.mutedText,
    fontSize: 14,
    fontFamily: Fonts.sans,
    lineHeight: 22,
  },
});
