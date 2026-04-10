import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { GlassButton, GlassCard, GlassHeader, GlassModal, glassSpacing, useGlassTheme } from '@/components/glass';
import { ThemedText } from '@/components/themed-text';

type GlassMode = 'light' | 'dark';

export default function GlassShowcaseScreen() {
  const [glassMode, setGlassMode] = useState<GlassMode>('dark');
  const [modalOpen, setModalOpen] = useState(false);
  const theme = useGlassTheme(glassMode);

  const quickActions = useMemo(
    () => [
      { icon: 'sparkles-outline', label: 'Refine search' },
      { icon: 'flash-outline', label: 'Priority checkout' },
      { icon: 'heart-outline', label: 'Save favorites' },
    ],
    [],
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={theme.screenGradient} style={styles.gradient} />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <GlassHeader
          title="Liquid Glass System"
          tint={glassMode}
          leftAction={
            <Pressable accessibilityRole="button" style={styles.headerAction}>
              <Ionicons name="chevron-back" size={20} color={theme.textPrimary} />
            </Pressable>
          }
          rightAction={
            <Pressable accessibilityRole="button" style={styles.headerAction}>
              <Ionicons name="settings-outline" size={20} color={theme.textPrimary} />
            </Pressable>
          }
        />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <GlassCard glow tint={glassMode} intensity={30} style={styles.heroCard}>
            <View style={styles.heroBlock}>
              <ThemedText type="title" style={[styles.heroTitle, { color: theme.textPrimary }]}>
                Premium glass components
              </ThemedText>
              <ThemedText style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
                Reusable primitives tuned for smooth animations, blur depth, and production-grade
                performance.
              </ThemedText>
            </View>
          </GlassCard>

          <GlassCard tint={glassMode} style={styles.controlCard}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabelWrap}>
                <ThemedText type="defaultSemiBold" style={[styles.cardTitle, { color: theme.textPrimary }]}>
                  Appearance mode
                </ThemedText>
                <ThemedText style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                  Toggle to preview component behavior in both glass modes.
                </ThemedText>
              </View>
              <Switch value={glassMode === 'dark'} onValueChange={(value) => setGlassMode(value ? 'dark' : 'light')} />
            </View>
          </GlassCard>

          <View style={styles.buttonRow}>
            <GlassButton
              style={styles.flexButton}
              tint={glassMode}
              label="Primary Action"
              onPress={() => setModalOpen(true)}
            />
            <GlassButton style={styles.flexButton} tint={glassMode} label="Secondary" glow={false} />
          </View>

          <GlassCard tint={glassMode} style={styles.listCard}>
            <View style={styles.listHeader}>
              <ThemedText type="defaultSemiBold" style={[styles.cardTitle, { color: theme.textPrimary }]}>
                Quick actions
              </ThemedText>
            </View>
            <View style={styles.listBody}>
              {quickActions.map((item) => (
                <View key={item.label} style={styles.listItem}>
                  <View style={styles.listIconWrap}>
                    <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={18} color={theme.textPrimary} />
                  </View>
                  <ThemedText style={[styles.listItemLabel, { color: theme.textPrimary }]}>{item.label}</ThemedText>
                </View>
              ))}
            </View>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>

      <GlassModal visible={modalOpen} onClose={() => setModalOpen(false)} tint={glassMode}>
        <ThemedText type="subtitle" style={[styles.modalTitle, { color: theme.textPrimary }]}>
          Checkout summary
        </ThemedText>
        <ThemedText style={[styles.modalBody, { color: theme.textSecondary }]}>
          Your glass UI primitives are ready to be reused across cards, headers, CTAs, and overlays.
        </ThemedText>
        <View style={styles.modalActions}>
          <GlassButton tint={glassMode} label="Close" onPress={() => setModalOpen(false)} />
        </View>
      </GlassModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingTop: 116,
    paddingHorizontal: glassSpacing.md,
    paddingBottom: glassSpacing.xl,
    gap: glassSpacing.md,
  },
  heroCard: {
    minHeight: 180,
  },
  heroBlock: {
    padding: glassSpacing.lg,
    gap: glassSpacing.sm,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  controlCard: {
    padding: glassSpacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassSpacing.sm,
  },
  switchLabelWrap: {
    flex: 1,
    gap: glassSpacing.xs,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: glassSpacing.sm,
  },
  flexButton: {
    flex: 1,
  },
  listCard: {
    padding: glassSpacing.md,
    gap: glassSpacing.sm,
  },
  listHeader: {
    marginBottom: glassSpacing.xs,
  },
  listBody: {
    gap: glassSpacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassSpacing.sm,
  },
  listIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  listItemLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  modalTitle: {
    fontWeight: '600',
    fontSize: 22,
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalActions: {
    marginTop: glassSpacing.xs,
  },
});
