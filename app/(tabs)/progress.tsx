import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AnimatedEnter, AnimatedProgressBar, FadeIn } from '@/components/animations';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProgressScreen() {
  const { dailyGoal, completedWords, podcastListened, quizCompleted, streak, todayKey } = useApp();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  const todayLearned = (completedWords[todayKey] ?? []).length;
  const wordGoal = dailyGoal ?? 10;
  const wordsProgress = Math.min(100, (todayLearned / wordGoal) * 100);
  const podcastDone = podcastListened[todayKey] ?? false;
  const quizDone = quizCompleted[todayKey] ?? false;

  const wordsProgressPercent = wordGoal > 0 ? todayLearned / wordGoal : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      <FadeIn duration={450}>
        <LinearGradient
          colors={colorScheme === 'dark' ? ['#312e81', '#1e1b4b'] : ['#6366f1', '#22d3ee']}
          style={styles.streakCard}
        >
          <View style={styles.streakRow}>
            <View style={styles.streakIconWrap}>
              <Ionicons name="flame" size={40} color="#fff" />
            </View>
            <View>
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>day streak</Text>
            </View>
          </View>
          {user && (
            <Text style={styles.userEmail} numberOfLines={1}>
              {user.email}
            </Text>
          )}
        </LinearGradient>
      </FadeIn>

      <Text style={[styles.sectionTitle, { color: c.text }]}>Today's progress</Text>

      <AnimatedEnter delay={80} duration={350}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.cardTitle, { color: c.textSecondary }]}>Words learned</Text>
          <Text style={[styles.cardValue, { color: c.text }]}>
            {todayLearned} / {wordGoal}
          </Text>
          <AnimatedProgressBar
            progress={wordsProgressPercent}
            height={10}
            backgroundColor={c.border}
            fillColor={c.tint}
            borderRadius={5}
          />
        </View>
      </AnimatedEnter>

      <AnimatedEnter delay={120} duration={350}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.cardTitle, { color: c.textSecondary }]}>Daily podcast</Text>
          <View style={styles.row}>
            <Text style={[styles.cardValue, { color: c.text }]}>
              {podcastDone ? 'Listened' : 'Not listened'}
            </Text>
            {podcastDone && <Ionicons name="checkmark-circle" size={26} color={c.success} />}
          </View>
        </View>
      </AnimatedEnter>

      <AnimatedEnter delay={160} duration={350}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.cardTitle, { color: c.textSecondary }]}>Daily quiz</Text>
          <View style={styles.row}>
            <Text style={[styles.cardValue, { color: c.text }]}>
              {quizDone ? 'Completed' : 'Not completed'}
            </Text>
            {quizDone && <Ionicons name="checkmark-circle" size={26} color={c.success} />}
          </View>
        </View>
      </AnimatedEnter>

      <AnimatedEnter delay={200} duration={350}>
        <View style={[styles.tip, { backgroundColor: `${c.tint}18`, borderLeftColor: c.tint }]}>
          <Text style={[styles.tipText, { color: c.text }]}>
            Come back every day to keep your streak and reach your word goal!
          </Text>
        </View>
      </AnimatedEnter>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  streakCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16 }
      : { elevation: 8 }),
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
  },
  streakLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10 }
      : { elevation: 3 }),
  },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  cardValue: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tip: {
    borderRadius: 14,
    padding: 18,
    borderLeftWidth: 4,
  },
  tipText: { fontSize: 14, lineHeight: 22 },
});
