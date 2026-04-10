import React, { memo, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import type { PropsWithChildren, StyleProp, ViewStyle } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { GlassCard } from '@/components/glass/GlassCard';
import { glassSpacing, useGlassTheme } from '@/components/glass/glassTheme';

type GlassModalProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  style?: StyleProp<ViewStyle>;
  tint?: 'light' | 'dark';
  intensity?: number;
  closeOnBackdropPress?: boolean;
}>;

function GlassModalComponent({
  visible,
  onClose,
  children,
  style,
  tint,
  intensity = 35,
  closeOnBackdropPress = true,
}: GlassModalProps) {
  const theme = useGlassTheme(tint);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, { duration: visible ? 220 : 180 });
  }, [progress, visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.92 + progress.value * 0.08 }],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { backgroundColor: theme.dimBackground }, backdropStyle]} />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closeOnBackdropPress ? onClose : undefined}
          accessibilityRole="button"
          accessibilityLabel="Close modal backdrop"
        />
        <Animated.View style={[styles.centerWrap, modalStyle]}>
          <GlassCard
            tint={theme.mode}
            intensity={intensity}
            radius={28}
            glow
            style={[styles.modalCard, style]}>
            <View style={styles.content}>{children}</View>
          </GlassCard>
        </Animated.View>
      </View>
    </Modal>
  );
}

export const GlassModal = memo(GlassModalComponent);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    padding: glassSpacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  centerWrap: {
    justifyContent: 'center',
  },
  modalCard: {
    width: '100%',
  },
  content: {
    padding: glassSpacing.lg,
    gap: glassSpacing.sm,
  },
});
