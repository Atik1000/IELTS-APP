import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useApp } from '@/contexts/AppContext';
import type { DailyGoal } from '@/lib/storage';

const GOALS: DailyGoal[] = [10, 20, 30];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setDailyGoal } = useApp();
  const [selected, setSelected] = useState<DailyGoal | null>(null);

  const handleContinue = async () => {
    if (selected == null) return;
    await setDailyGoal(selected);
    router.replace('/(tabs)/words');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to IELTS Learn</Text>
      <Text style={styles.subtitle}>Choose your daily word goal</Text>
      <View style={styles.options}>
        {GOALS.map((goal) => (
          <Pressable
            key={goal}
            style={[styles.option, selected === goal && styles.optionSelected]}
            onPress={() => setSelected(goal)}
          >
            <Text style={[styles.optionText, selected === goal && styles.optionTextSelected]}>
              {goal} words/day
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        style={[styles.button, !selected && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!selected}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  options: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  option: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  optionSelected: {
    borderColor: '#0a7ea4',
    backgroundColor: '#e8f4f8',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  optionTextSelected: {
    color: '#0a7ea4',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    backgroundColor: '#0a7ea4',
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
