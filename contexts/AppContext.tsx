import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  getDailyGoal,
  getCompletedWords,
  getPodcastListened,
  getQuizCompleted,
  getStreak,
  getLastActiveDate,
  setDailyGoal as saveDailyGoalLocal,
  setCompletedWords as saveCompletedWordsLocal,
  setPodcastListened as savePodcastListenedLocal,
  setQuizCompleted as saveQuizCompletedLocal,
  setStreak as saveStreakLocal,
  setLastActiveDate as saveLastActiveDateLocal,
  getTodayKey,
  type DailyGoal,
} from '@/lib/storage';
import {
  getUser,
  setUser as setUserFirestore,
  getProgress,
  setProgress as setProgressFirestore,
  getAllProgressForUser,
} from '@/lib/firestore';

import { useAuth } from '@/contexts/AuthContext';

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

function computeStreak(streak: number, lastActive: string | null): number {
  const todayKey = getTodayKey();
  if (!lastActive) return 1;
  const last = new Date(lastActive);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) return 0;
  if (diffDays === 1) return streak + 1;
  return streak;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const [state, setState] = useState<AppState>(defaultState);

  const refresh = useCallback(async () => {
    const todayKey = getTodayKey();

    if (uid) {
      try {
        const [userDoc, progressMap] = await Promise.all([
          getUser(uid),
          getAllProgressForUser(uid),
        ]);
        const goal = userDoc?.dailyGoal ?? null;
        const streak = userDoc?.streak ?? 0;
        const lastActive = userDoc?.lastActiveDate ?? null;
        const newStreak = computeStreak(streak, lastActive);

        const completedWords: Record<string, string[]> = {};
        const podcastListened: Record<string, boolean> = {};
        const quizCompleted: Record<string, boolean> = {};
        Object.entries(progressMap).forEach(([date, doc]) => {
          completedWords[date] = doc.completedWordIds ?? [];
          podcastListened[date] = doc.podcastListened ?? false;
          quizCompleted[date] = doc.quizCompleted ?? false;
        });

        setState({
          dailyGoal: goal,
          completedWords,
          podcastListened,
          quizCompleted,
          streak: newStreak,
          todayKey,
          isLoading: false,
          hasOnboarded: goal != null,
        });
      } catch (e) {
        setState((s) => ({ ...s, isLoading: false }));
      }
      return;
    }

    const [goal, completedWords, podcastListened, quizCompleted, streak, lastActive] =
      await Promise.all([
        getDailyGoal(),
        getCompletedWords(),
        getPodcastListened(),
        getQuizCompleted(),
        getStreak(),
        getLastActiveDate(),
      ]);
    const newStreak = computeStreak(streak, lastActive);
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
  }, [uid]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setDailyGoal = useCallback(
    async (goal: DailyGoal) => {
      const todayKey = getTodayKey();
      if (uid) {
        await setUserFirestore(uid, {
          dailyGoal: goal,
          streak: 1,
          lastActiveDate: todayKey,
          email: user?.email ?? null,
          displayName: user?.displayName ?? null,
          photoURL: user?.photoURL ?? null,
        });
        await setProgressFirestore(uid, todayKey, {});
      } else {
        await saveDailyGoalLocal(goal);
        await saveLastActiveDateLocal(todayKey);
        await saveStreakLocal(1);
      }
      setState((s) => ({ ...s, dailyGoal: goal, hasOnboarded: true }));
    },
    [uid, user]
  );

  const markWordLearned = useCallback(
    async (wordId: string) => {
      const todayKey = getTodayKey();
      if (uid) {
        const cur = await getProgress(uid, todayKey);
        const ids = cur?.completedWordIds ?? [];
        if (ids.includes(wordId)) return;
        const updated = [...ids, wordId];
        await setProgressFirestore(uid, todayKey, { completedWordIds: updated });
        setState((s) => ({
          ...s,
          completedWords: { ...s.completedWords, [todayKey]: updated },
        }));
        return;
      }
      const completed = await getCompletedWords();
      const today = completed[todayKey] || [];
      if (today.includes(wordId)) return;
      const updated = { ...completed, [todayKey]: [...today, wordId] };
      await saveCompletedWordsLocal(updated);
      setState((s) => ({ ...s, completedWords: updated }));
    },
    [uid]
  );

  const unmarkWordLearned = useCallback(
    async (wordId: string) => {
      const todayKey = getTodayKey();
      if (uid) {
        const cur = await getProgress(uid, todayKey);
        const ids = (cur?.completedWordIds ?? []).filter((id) => id !== wordId);
        await setProgressFirestore(uid, todayKey, { completedWordIds: ids });
        setState((s) => ({
          ...s,
          completedWords: { ...s.completedWords, [todayKey]: ids },
        }));
        return;
      }
      const completed = await getCompletedWords();
      const today = (completed[todayKey] || []).filter((id) => id !== wordId);
      const updated = { ...completed, [todayKey]: today };
      await saveCompletedWordsLocal(updated);
      setState((s) => ({ ...s, completedWords: updated }));
    },
    [uid]
  );

  const markPodcastListened = useCallback(
    async () => {
      const todayKey = getTodayKey();
      if (uid) {
        const cur = await getProgress(uid, todayKey);
        const lastActive = (await getUser(uid))?.lastActiveDate ?? null;
        let newStreak = (await getUser(uid))?.streak ?? 0;
        if (lastActive !== todayKey) {
          const last = lastActive ? new Date(lastActive) : null;
          const today = new Date();
          const diffDays = last
            ? Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
            : 1;
          newStreak = diffDays === 1 ? newStreak + 1 : 1;
          await setUserFirestore(uid, { lastActiveDate: todayKey, streak: newStreak });
        }
        await setProgressFirestore(uid, todayKey, { podcastListened: true });
        setState((s) => ({
          ...s,
          podcastListened: { ...s.podcastListened, [todayKey]: true },
          streak: newStreak,
        }));
        return;
      }
      const listened = await getPodcastListened();
      const updated = { ...listened, [todayKey]: true };
      await savePodcastListenedLocal(updated);
      await saveLastActiveDateLocal(todayKey);
      const streak = await getStreak();
      const lastActive = await getLastActiveDate();
      let newStreak = streak;
      if (lastActive !== todayKey) {
        newStreak = lastActive ? (computeStreak(streak, lastActive) === streak ? streak + 1 : 1) : 1;
        await saveStreakLocal(newStreak);
      }
      setState((s) => ({ ...s, podcastListened: updated, streak: newStreak }));
    },
    [uid]
  );

  const markQuizCompleted = useCallback(
    async () => {
      const todayKey = getTodayKey();
      if (uid) {
        const userDoc = await getUser(uid);
        const lastActive = userDoc?.lastActiveDate ?? null;
        let newStreak = userDoc?.streak ?? 0;
        if (lastActive !== todayKey) {
          const last = lastActive ? new Date(lastActive) : null;
          const today = new Date();
          const diffDays = last
            ? Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
            : 1;
          newStreak = diffDays === 1 ? newStreak + 1 : 1;
          await setUserFirestore(uid, { lastActiveDate: todayKey, streak: newStreak });
        }
        await setProgressFirestore(uid, todayKey, { quizCompleted: true });
        setState((s) => ({
          ...s,
          quizCompleted: { ...s.quizCompleted, [todayKey]: true },
          streak: newStreak,
        }));
        return;
      }
      const completed = await getQuizCompleted();
      const updated = { ...completed, [todayKey]: true };
      await saveQuizCompletedLocal(updated);
      await saveLastActiveDateLocal(todayKey);
      const streak = await getStreak();
      const lastActive = await getLastActiveDate();
      let newStreak = streak;
      if (lastActive !== todayKey) {
        newStreak = lastActive ? (computeStreak(streak, lastActive) === streak ? streak + 1 : 1) : 1;
        await saveStreakLocal(newStreak);
      }
      setState((s) => ({ ...s, quizCompleted: updated, streak: newStreak }));
    },
    [uid]
  );

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
