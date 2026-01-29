import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useApp } from '@/contexts/AppContext';

export default function ProgressScreen() {
  const { dailyGoal, completedWords, podcastListened, quizCompleted, streak, todayKey } = useApp();

  const todayLearned = (completedWords[todayKey] ?? []).length;
  const wordGoal = dailyGoal ?? 10;
  const wordsProgress = Math.min(100, (todayLearned / wordGoal) * 100);
  const podcastDone = podcastListened[todayKey] ?? false;
  const quizDone = quizCompleted[todayKey] ?? false;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.streakRow}>
          <Ionicons name="flame" size={48} color="#f97316" />
          <View>
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Today's progress</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Words learned</Text>
        <Text style={styles.cardValue}>
          {todayLearned} / {wordGoal}
        </Text>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${wordsProgress}%` }]} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily podcast</Text>
        <View style={styles.row}>
          <Text style={styles.cardValue}>{podcastDone ? 'Listened' : 'Not listened'}</Text>
          {podcastDone && <Ionicons name="checkmark-circle" size={24} color="#28a745" />}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily quiz</Text>
        <View style={styles.row}>
          <Text style={styles.cardValue}>{quizDone ? 'Completed' : 'Not completed'}</Text>
          {quizDone && <Ionicons name="checkmark-circle" size={24} color="#28a745" />}
        </View>
      </View>

      <View style={styles.tip}>
        <Text style={styles.tipText}>
          Come back every day to keep your streak and reach your word goal!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  streakLabel: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barBg: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#0a7ea4',
    borderRadius: 5,
  },
  tip: {
    backgroundColor: '#e8f4f8',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0a7ea4',
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
});
