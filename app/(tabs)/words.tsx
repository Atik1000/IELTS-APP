import React, { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useApp } from '@/contexts/AppContext';
import { PLACEHOLDER_WORDS } from '@/lib/data';
import type { WordItem } from '@/lib/data';

function WordCard({
  item,
  learned,
  onToggle,
}: {
  item: WordItem;
  learned: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={[styles.card, learned && styles.cardLearned]}>
      <View style={styles.cardHeader}>
        <Text style={styles.word}>{item.word}</Text>
        <Pressable
          style={[styles.learnedBtn, learned && styles.learnedBtnActive]}
          onPress={onToggle}
        >
          <Text style={[styles.learnedBtnText, learned && styles.learnedBtnTextActive]}>
            {learned ? '✓ Learned' : 'Mark learned'}
          </Text>
        </Pressable>
      </View>
      <Text style={styles.meaning}>{item.meaning}</Text>
      <Text style={styles.label}>Synonyms:</Text>
      <Text style={styles.synonyms}>{item.synonyms.join(', ')}</Text>
      <Text style={styles.label}>Example:</Text>
      <Text style={styles.example}>"{item.example}"</Text>
    </View>
  );
}

export default function DailyWordsScreen() {
  const { dailyGoal, completedWords, todayKey, markWordLearned, unmarkWordLearned } = useApp();

  const todayLearned = completedWords[todayKey] ?? [];
  const wordCount = dailyGoal ?? 10;
  const todayWords = useMemo(
    () => PLACEHOLDER_WORDS.slice(0, wordCount),
    [wordCount]
  );

  const learnedSet = useMemo(() => new Set(todayLearned), [todayLearned]);

  const handleToggle = (item: WordItem) => {
    if (learnedSet.has(item.id)) {
      unmarkWordLearned(item.id);
    } else {
      markWordLearned(item.id);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <Text style={styles.progressText}>
          {todayLearned.length} / {wordCount} words learned today
        </Text>
        <View style={styles.barBg}>
          <View
            style={[
              styles.barFill,
              { width: `${(todayLearned.length / wordCount) * 100}%` },
            ]}
          />
        </View>
      </View>
      <FlatList
        data={todayWords}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <WordCard
            item={item}
            learned={learnedSet.has(item.id)}
            onToggle={() => handleToggle(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  progressBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  barBg: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#0a7ea4',
    borderRadius: 4,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardLearned: {
    borderColor: '#0a7ea4',
    backgroundColor: '#e8f4f8',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  word: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textTransform: 'capitalize',
  },
  learnedBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  learnedBtnActive: {
    backgroundColor: '#0a7ea4',
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
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 4,
    marginBottom: 2,
  },
  synonyms: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  example: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
