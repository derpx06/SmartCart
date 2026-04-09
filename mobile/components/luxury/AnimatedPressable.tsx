import React, { ReactNode, useRef } from 'react';
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

type AnimatedPressableProps = PressableProps & {
  children: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  activeScale?: number;
};

export function AnimatedPressable({
  children,
  containerStyle,
  activeScale = 0.97,
  onPressIn,
  onPressOut,
  ...pressableProps
}: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn: PressableProps['onPressIn'] = (event) => {
    Animated.spring(scale, {
      toValue: activeScale,
      useNativeDriver: true,
      speed: 18,
      bounciness: 4,
    }).start();

    onPressIn?.(event);
  };

  const handlePressOut: PressableProps['onPressOut'] = (event) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 18,
      bounciness: 5,
    }).start();

    onPressOut?.(event);
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, containerStyle]}>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} {...pressableProps}>
        {children}
      </Pressable>
    </Animated.View>
  );
}
