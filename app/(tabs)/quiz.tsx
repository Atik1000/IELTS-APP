import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useApp } from '@/contexts/AppContext';
import { getQuizQuestions, PLACEHOLDER_WORDS } from '@/lib/data';
import type { QuizQuestion } from '@/lib/data';

export default function DailyQuizScreen() {
  const { dailyGoal, todayKey, quizCompleted, markQuizCompleted } = useApp();
  const wordCount = dailyGoal ?? 10;
  const todayWords = useMemo(
    () => PLACEHOLDER_WORDS.slice(0, wordCount),
    [wordCount]
  );
  const questions = useMemo(() => getQuizQuestions(todayWords, 5), [todayWords]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const completed = quizCompleted[todayKey] ?? false;
  const q = questions[currentIndex];

  const handleSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedIndex(index);
    setShowFeedback(true);
    if (index === q.correctIndex) {
      setCorrectCount((c) => c + 1);
    }
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
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emptyTitle}>No quiz today</Text>
          <Text style={styles.emptyText}>Complete your daily words first.</Text>
        </View>
      </View>
    );
  }

  if (finished) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.resultTitle}>Quiz complete!</Text>
          <Text style={styles.resultScore}>
            {correctCount} / {questions.length} correct
          </Text>
          <Text style={styles.resultSub}>
            {correctCount === questions.length
              ? 'Perfect! Well done.'
              : 'Keep practicing your vocabulary.'}
          </Text>
          <Pressable
            style={styles.restartBtn}
            onPress={() => {
              setCurrentIndex(0);
              setSelectedIndex(null);
              setShowFeedback(false);
              setCorrectCount(0);
              setFinished(false);
            }}
          >
            <Text style={styles.restartBtnText}>Try again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.progressBar}>
        <Text style={styles.progressText}>
          Question {currentIndex + 1} of {questions.length}
        </Text>
        <View style={styles.barBg}>
          <View
            style={[
              styles.barFill,
              { width: `${((currentIndex + 1) / questions.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.question}>{q.question}</Text>
        <View style={styles.options}>
          {q.options.map((option, index) => {
            const isSelected = selectedIndex === index;
            const isCorrect = index === q.correctIndex;
            const showCorrect = showFeedback && isCorrect;
            const showWrong = showFeedback && isSelected && !isCorrect;
            return (
              <Pressable
                key={index}
                style={[
                  styles.option,
                  showCorrect && styles.optionCorrect,
                  showWrong && styles.optionWrong,
                ]}
                onPress={() => handleSelect(index)}
                disabled={showFeedback}
              >
                <Text
                  style={[
                    styles.optionText,
                    showCorrect && styles.optionTextCorrect,
                    showWrong && styles.optionTextWrong,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {showFeedback && (
          <View style={styles.feedback}>
            <Text style={styles.feedbackText}>
              {selectedIndex === q.correctIndex
                ? 'Correct!'
                : `Correct answer: ${q.options[q.correctIndex]}`}
            </Text>
            <Pressable style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>
                {currentIndex + 1 >= questions.length ? 'Finish' : 'Next'}
              </Text>
            </Pressable>
          </View>
        )}
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
  progressBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  question: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 24,
    lineHeight: 28,
  },
  options: {
    gap: 12,
  },
  option: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCorrect: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  optionWrong: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextCorrect: {
    color: '#155724',
  },
  optionTextWrong: {
    color: '#721c24',
  },
  feedback: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  feedbackText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  nextBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#0a7ea4',
    alignSelf: 'flex-start',
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultScore: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0a7ea4',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultSub: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  restartBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#0a7ea4',
    alignSelf: 'center',
  },
  restartBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
