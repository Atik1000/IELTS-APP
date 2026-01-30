import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { AnimatedEnter, AnimatedPressable, FadeIn } from '@/components/animations';
import { useApp } from '@/contexts/AppContext';
import type { DailyGoal } from '@/lib/storage';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const GOALS: DailyGoal[] = [10, 20, 30];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setDailyGoal } = useApp();
  const [selected, setSelected] = useState<DailyGoal | null>(null);
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  const handleContinue = async () => {
    if (selected == null) return;
    await setDailyGoal(selected);
    router.replace('/(tabs)/words');
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FadeIn duration={450}>
        <LinearGradient
          colors={colorScheme === 'dark' ? ['#312e81', '#1e1b4b'] : ['#6366f1', '#22d3ee']}
          style={styles.gradient}
        >
          <Text style={styles.title}>Set your goal</Text>
          <Text style={styles.subtitle}>How many words do you want to learn per day?</Text>
        </LinearGradient>
      </FadeIn>

      <View style={styles.content}>
        <View style={styles.options}>
          {GOALS.map((goal, index) => (
            <AnimatedEnter key={goal} delay={index * 80} duration={350} offsetY={16}>
              <AnimatedPressable
                style={[
                  styles.option,
                  { backgroundColor: c.surface, borderColor: c.border },
                  selected === goal && { borderColor: c.tint, backgroundColor: `${c.tint}18` },
                ]}
                onPress={() => setSelected(goal)}
                scaleDown={0.98}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: c.text },
                    selected === goal && { color: c.tint, fontWeight: '700' },
                  ]}
                >
                  {goal} words/day
                </Text>
              </AnimatedPressable>
            </AnimatedEnter>
          ))}
        </View>
        <AnimatedEnter delay={280} duration={350}>
          <AnimatedPressable
            style={[styles.button, { backgroundColor: c.tint }, !selected && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!selected}
            scaleDown={0.97}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </AnimatedPressable>
        </AnimatedEnter>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    paddingTop: 80,
    paddingBottom: 48,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  options: {
    gap: 14,
    marginBottom: 32,
  },
  option: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 }
      : { elevation: 3 }),
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 14,
    alignItems: 'center',
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }
      : { elevation: 4 }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
