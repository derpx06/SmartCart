import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import type { CartIntelligencePanel as CartIntelligencePanelType } from '@/types/smart-cart';

function riskTone(risk: CartIntelligencePanelType['riskLevel']): string {
  if (risk === 'high') return '#c52b2b';
  if (risk === 'medium') return '#8a5f16';
  return '#1c1b1f';
}

export function CartIntelligencePanel({ panel }: { panel?: CartIntelligencePanelType }) {
  if (!panel) return null;
  const width = `${Math.max(0, Math.min(100, panel.completionPercent))}%`;
  const tone = riskTone(panel.riskLevel);

  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.kicker}>AI cart brain</ThemedText>
      <ThemedText style={styles.title}>
        {panel.intentLabel}: {panel.completionPercent}% complete
      </ThemedText>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width }]} />
      </View>
      <ThemedText style={styles.message}>{panel.message}</ThemedText>
      {!!panel.missingItems?.length && (
        <ThemedText style={styles.missing}>Missing: {panel.missingItems.slice(0, 4).join(', ')}</ThemedText>
      )}
      <ThemedText style={[styles.risk, { color: tone }]}>Risk: {panel.riskLevel}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: 'rgba(28,27,31,0.14)',
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#fff',
    gap: 6,
  },
  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    color: '#1c1b1f',
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 19,
    color: '#1c1b1f',
  },
  barTrack: {
    height: 8,
    backgroundColor: '#e9e9e7',
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#1c1b1f',
  },
  message: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(28,27,31,0.8)',
  },
  missing: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(28,27,31,0.72)',
  },
  risk: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});

