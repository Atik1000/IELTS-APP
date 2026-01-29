import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  getDailyGoal,
  getCompletedWords,
  getPodcastListened,
  getQuizCompleted,
  getStreak,
  getLastActiveDate,
  setDailyGoal as saveDailyGoal,
  setCompletedWords as saveCompletedWords,
  setPodcastListened as savePodcastListened,
  setQuizCompleted as saveQuizCompleted,
  setStreak as saveStreak,
  setLastActiveDate as saveLastActiveDate,
  getTodayKey,
  type DailyGoal,
} from '@/lib/storage';

type AppState = {
  dailyGoal: DailyGoal | null;
  completedWords: Record<string, string[]>;
  podcastListened: Record<string, boolean>;
  quizCompleted: Record<string, boolean>;
  streak: number;
  todayKey: string;
  isLoading: boolean;
  hasOnboarded: boolean;
};

type AppContextType = AppState & {
  setDailyGoal: (goal: DailyGoal) => Promise<void>;
  markWordLearned: (wordId: string) => Promise<void>;
  unmarkWordLearned: (wordId: string) => Promise<void>;
  markPodcastListened: () => Promise<void>;
  markQuizCompleted: () => Promise<void>;
  refresh: () => Promise<void>;
};

const defaultState: AppState = {
  dailyGoal: null,
  completedWords: {},
  podcastListened: {},
  quizCompleted: {},
  streak: 0,
  todayKey: getTodayKey(),
  isLoading: true,
  hasOnboarded: false,
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  const refresh = useCallback(async () => {
    const todayKey = getTodayKey();
    const [goal, completedWords, podcastListened, quizCompleted, streak, lastActive] = await Promise.all([
      getDailyGoal(),
      getCompletedWords(),
      getPodcastListened(),
      getQuizCompleted(),
      getStreak(),
      getLastActiveDate(),
    ]);

    let newStreak = streak;
    if (lastActive) {
      const last = new Date(lastActive);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 1) newStreak = 0;
      else if (diffDays === 1) newStreak = streak + 1;
    } else {
      newStreak = 1;
    }

    setState({
      dailyGoal: goal,
      completedWords: completedWords || {},
      podcastListened: podcastListened || {},
      quizCompleted: quizCompleted || {},
      streak: newStreak,
      todayKey,
      isLoading: false,
      hasOnboarded: goal != null,
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setDailyGoal = useCallback(async (goal: DailyGoal) => {
    await saveDailyGoal(goal);
    await saveLastActiveDate(getTodayKey());
    await saveStreak(1);
    setState((s) => ({ ...s, dailyGoal: goal, hasOnboarded: true }));
  }, []);

  const markWordLearned = useCallback(async (wordId: string) => {
    const todayKey = getTodayKey();
    const completed = await getCompletedWords();
    const today = completed[todayKey] || [];
    if (today.includes(wordId)) return;
    const updated = { ...completed, [todayKey]: [...today, wordId] };
    await saveCompletedWords(updated);
    setState((s) => ({
      ...s,
      completedWords: updated,
    }));
  }, []);

  const unmarkWordLearned = useCallback(async (wordId: string) => {
    const todayKey = getTodayKey();
    const completed = await getCompletedWords();
    const today = (completed[todayKey] || []).filter((id) => id !== wordId);
    const updated = { ...completed, [todayKey]: today };
    await saveCompletedWords(updated);
    setState((s) => ({ ...s, completedWords: updated }));
  }, []);

  const markPodcastListened = useCallback(async () => {
    const todayKey = getTodayKey();
    const listened = await getPodcastListened();
    const updated = { ...listened, [todayKey]: true };
    await savePodcastListened(updated);
    await saveLastActiveDate(todayKey);
    const streak = await getStreak();
    const lastActive = await getLastActiveDate();
    let newStreak = streak;
    if (lastActive !== todayKey) {
      if (lastActive) {
        const last = new Date(lastActive);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        newStreak = diffDays === 1 ? streak + 1 : 1;
      } else newStreak = 1;
      await saveStreak(newStreak);
    }
    setState((s) => ({ ...s, podcastListened: updated, streak: newStreak }));
  }, []);

  const markQuizCompleted = useCallback(async () => {
    const todayKey = getTodayKey();
    const completed = await getQuizCompleted();
    const updated = { ...completed, [todayKey]: true };
    await saveQuizCompleted(updated);
    await saveLastActiveDate(todayKey);
    const streak = await getStreak();
    const lastActive = await getLastActiveDate();
    let newStreak = streak;
    if (lastActive !== todayKey) {
      if (lastActive) {
        const last = new Date(lastActive);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        newStreak = diffDays === 1 ? streak + 1 : 1;
      } else newStreak = 1;
      await saveStreak(newStreak);
    }
    setState((s) => ({ ...s, quizCompleted: updated, streak: newStreak }));
  }, []);

  const value: AppContextType = {
    ...state,
    setDailyGoal,
    markWordLearned,
    unmarkWordLearned,
    markPodcastListened,
    markQuizCompleted,
    refresh,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
