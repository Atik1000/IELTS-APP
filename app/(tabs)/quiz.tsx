import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AnimatedEnter, AnimatedPressable, AnimatedProgressBar } from '@/components/animations';
import { useApp } from '@/contexts/AppContext';
import { getQuizQuestions, PLACEHOLDER_WORDS } from '@/lib/data';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function DailyQuizScreen() {
  const { dailyGoal, todayKey, quizCompleted, markQuizCompleted } = useApp();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  const wordCount = dailyGoal ?? 10;
  const todayWords = useMemo(() => PLACEHOLDER_WORDS.slice(0, wordCount), [wordCount]);
  const questions = useMemo(() => getQuizQuestions(todayWords, 5), [todayWords]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[currentIndex];

  const handleSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedIndex(index);
    setShowFeedback(true);
    if (index === q.correctIndex) setCorrectCount((n) => n + 1);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
      markQuizCompleted();
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedIndex(null);
      setShowFeedback(false);
    }
  };

  if (questions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.emptyTitle, { color: c.text }]}>No quiz today</Text>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>
            Complete your daily words first.
          </Text>
        </View>
      </View>
    );
  }

  if (finished) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.resultTitle, { color: c.text }]}>Quiz complete!</Text>
          <Text style={[styles.resultScore, { color: c.tint }]}>
            {correctCount} / {questions.length} correct
          </Text>
          <Text style={[styles.resultSub, { color: c.textSecondary }]}>
            {correctCount === questions.length
              ? 'Perfect! Well done.'
              : 'Keep practicing your vocabulary.'}
          </Text>
          <AnimatedPressable
            style={[styles.restartBtn, { backgroundColor: c.tint }]}
            onPress={() => {
              setCurrentIndex(0);
              setSelectedIndex(null);
              setShowFeedback(false);
              setCorrectCount(0);
              setFinished(false);
            }}
            scaleDown={0.96}
          >
            <Text style={styles.restartBtnText}>Try again</Text>
          </AnimatedPressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.progressBar, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.progressText, { color: c.textSecondary }]}>
          Question {currentIndex + 1} of {questions.length}
        </Text>
        <AnimatedProgressBar
          progress={(currentIndex + 1) / questions.length}
          height={10}
          backgroundColor={c.border}
          fillColor={c.tint}
          borderRadius={5}
        />
      </View>

      <AnimatedEnter key={currentIndex} delay={0} duration={300} offsetY={16}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.question, { color: c.text }]}>{q.question}</Text>
          <View style={styles.options}>
            {q.options.map((option, index) => {
              const isSelected = selectedIndex === index;
              const isCorrect = index === q.correctIndex;
              const showCorrect = showFeedback && isCorrect;
              const showWrong = showFeedback && isSelected && !isCorrect;
              return (
                <AnimatedPressable
                  key={index}
                  style={[
                    styles.option,
                    { backgroundColor: `${c.border}40` },
                    showCorrect && styles.optionCorrect,
                    showWrong && styles.optionWrong,
                  ]}
                  onPress={() => handleSelect(index)}
                  disabled={showFeedback}
                  scaleDown={0.98}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: c.text },
                      showCorrect && styles.optionTextCorrect,
                      showWrong && styles.optionTextWrong,
                    ]}
                  >
                    {option}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          {showFeedback && (
            <View style={[styles.feedback, { borderTopColor: c.border }]}>
              <Text style={[styles.feedbackText, { color: c.text }]}>
                {selectedIndex === q.correctIndex
                  ? 'Correct!'
                  : `Correct answer: ${q.options[q.correctIndex]}`}
              </Text>
              <AnimatedPressable style={[styles.nextBtn, { backgroundColor: c.tint }]} onPress={handleNext} scaleDown={0.96}>
                <Text style={styles.nextBtnText}>
                  {currentIndex + 1 >= questions.length ? 'Finish' : 'Next'}
                </Text>
              </AnimatedPressable>
            </View>
          )}
        </View>
      </AnimatedEnter>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  progressBar: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10 }
      : { elevation: 3 }),
  },
  progressText: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  barBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  card: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10 }
      : { elevation: 3 }),
  },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  emptyText: { fontSize: 16 },
  question: { fontSize: 20, fontWeight: '700', marginBottom: 24, lineHeight: 28 },
  options: { gap: 12 },
  option: { padding: 16, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  optionCorrect: { backgroundColor: '#d1fae5', borderColor: '#10b981' },
  optionWrong: { backgroundColor: '#fee2e2', borderColor: '#ef4444' },
  optionText: { fontSize: 16 },
  optionTextCorrect: { color: '#065f46' },
  optionTextWrong: { color: '#991b1b' },
  feedback: { marginTop: 24, paddingTop: 24, borderTopWidth: 1 },
  feedbackText: { fontSize: 16, marginBottom: 16 },
  nextBtn: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, alignSelf: 'flex-start' },
  nextBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  resultTitle: { fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  resultScore: { fontSize: 32, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  resultSub: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
  restartBtn: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, alignSelf: 'center' },
  restartBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
