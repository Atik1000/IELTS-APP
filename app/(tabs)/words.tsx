import React, { useMemo } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { AnimatedEnter, AnimatedPressable, AnimatedProgressBar } from '@/components/animations';
import { useApp } from '@/contexts/AppContext';
import { PLACEHOLDER_WORDS } from '@/lib/data';
import type { WordItem } from '@/lib/data';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function WordCard({
  item,
  learned,
  onToggle,
  c,
}: {
  item: WordItem;
  learned: boolean;
  onToggle: () => void;
  c: (typeof Colors)['light'];
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border },
        learned && { borderColor: c.tint, backgroundColor: `${c.tint}12` },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.word, { color: c.text }]}>{item.word}</Text>
        <AnimatedPressable
          onPress={onToggle}
          scaleDown={0.92}
          style={[styles.learnedBtn, learned && { backgroundColor: c.tint }]}
        >
          <Text style={[styles.learnedBtnText, learned && styles.learnedBtnTextActive]}>
            {learned ? '✓ Learned' : 'Mark learned'}
          </Text>
        </AnimatedPressable>
      </View>
      <Text style={[styles.meaning, { color: c.textSecondary }]}>{item.meaning}</Text>
      <Text style={[styles.label, { color: c.textSecondary }]}>Synonyms:</Text>
      <Text style={[styles.synonyms, { color: c.textSecondary }]}>{item.synonyms.join(', ')}</Text>
      <Text style={[styles.label, { color: c.textSecondary }]}>Example:</Text>
      <Text style={[styles.example, { color: c.textSecondary }]}>"{item.example}"</Text>
    </View>
  );
}

export default function DailyWordsScreen() {
  const { dailyGoal, completedWords, todayKey, markWordLearned, unmarkWordLearned } = useApp();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  const todayLearned = completedWords[todayKey] ?? [];
  const wordCount = dailyGoal ?? 10;
  const todayWords = useMemo(
    () => PLACEHOLDER_WORDS.slice(0, wordCount),
    [wordCount]
  );
  const learnedSet = useMemo(() => new Set(todayLearned), [todayLearned]);
  const progress = wordCount > 0 ? todayLearned.length / wordCount : 0;

  const handleToggle = (item: WordItem) => {
    if (learnedSet.has(item.id)) unmarkWordLearned(item.id);
    else markWordLearned(item.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.progressBar, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.progressText, { color: c.textSecondary }]}>
          {todayLearned.length} / {wordCount} words learned today
        </Text>
        <AnimatedProgressBar
          progress={progress}
          height={10}
          backgroundColor={c.border}
          fillColor={c.tint}
          borderRadius={5}
        />
      </View>
      <FlatList
        data={todayWords}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <AnimatedEnter delay={index * 50} offsetY={24} duration={350}>
            <WordCard
              item={item}
              learned={learnedSet.has(item.id)}
              onToggle={() => handleToggle(item)}
              c={c}
            />
          </AnimatedEnter>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressBar: {
    padding: 18,
    borderBottomWidth: 1,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10 }
      : { elevation: 3 }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  word: {
    fontSize: 20,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  learnedBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnedBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  learnedBtnTextActive: {
    color: '#fff',
  },
  meaning: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 2,
  },
  synonyms: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  example: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
