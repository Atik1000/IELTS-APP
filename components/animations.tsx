/**
 * Reusable animated UI primitives using react-native-reanimated.
 */

import React, { useEffect } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const springConfig = { damping: 15, stiffness: 150 };
const timingConfig = { duration: 300, easing: Easing.out(Easing.cubic) };

// ---- Fade + slide in (for list items / cards) ----
type AnimatedEnterProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  offsetY?: number;
  style?: object;
};

export function AnimatedEnter({
  children,
  delay = 0,
  duration = 400,
  offsetY = 20,
  style,
}: AnimatedEnterProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(offsetY);

  useEffect(() => {
    const t = setTimeout(() => {
      opacity.value = withTiming(1, { duration, easing: Easing.out(Easing.cubic) });
      translateY.value = withSpring(0, springConfig);
    }, delay);
    return () => clearTimeout(t);
  }, [delay, duration, offsetY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

// ---- Animated progress bar (width animates to target) ----
type AnimatedProgressBarProps = {
  progress: number; // 0..1
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  borderRadius?: number;
  style?: object;
};

export function AnimatedProgressBar({
  progress,
  height = 10,
  backgroundColor = '#e2e8f0',
  fillColor = '#6366f1',
  borderRadius = 5,
  style,
}: AnimatedProgressBarProps) {
  const widthPercent = useSharedValue(0);

  useEffect(() => {
    widthPercent.value = withSpring(Math.min(1, Math.max(0, progress)), springConfig);
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${widthPercent.value * 100}%`,
  }));

  return (
    <Animated.View
      style={[
        {
          height,
          backgroundColor,
          borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            height,
            backgroundColor: fillColor,
            borderRadius,
          },
          fillStyle,
        ]}
      />
    </Animated.View>
  );
}

// ---- Pressable with scale feedback ----
type AnimatedPressableProps = PressableProps & {
  children: React.ReactNode;
  scaleDown?: number;
};

export function AnimatedPressable({ children, scaleDown = 0.97, style, ...props }: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(scaleDown, springConfig);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springConfig);
      }}
      style={[style]}
      {...props}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
}

// ---- Subtle pulse (e.g. play button when playing) ----
type PulsingViewProps = {
  children: React.ReactNode;
  isActive: boolean;
  style?: object;
};

export function PulsingView({ children, isActive, style }: PulsingViewProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1, timingConfig);
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}

// ---- Fade-in wrapper ----
export function FadeIn({ children, delay = 0, duration = 400, style }: { children: React.ReactNode; delay?: number; duration?: number; style?: object }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, { duration, easing: Easing.out(Easing.cubic) });
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}

// ---- Success checkmark bounce ----
export function useLearnedAnimation(learned: boolean) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (learned) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withSpring(1, springConfig)
      );
    }
  }, [learned]);

  return useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
}
