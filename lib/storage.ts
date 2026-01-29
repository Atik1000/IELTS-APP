import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  DAILY_GOAL: '@ielts/daily_goal',
  COMPLETED_WORDS: '@ielts/completed_words',
  PODCAST_LISTENED: '@ielts/podcast_listened',
  QUIZ_COMPLETED: '@ielts/quiz_completed',
  LAST_ACTIVE_DATE: '@ielts/last_active_date',
  STREAK: '@ielts/streak',
  ONBOARDING_DONE: '@ielts/onboarding_done',
} as const;

export type DailyGoal = 10 | 20 | 30;

export async function getDailyGoal(): Promise<DailyGoal | null> {
  const v = await AsyncStorage.getItem(KEYS.DAILY_GOAL);
  return v ? (Number(v) as DailyGoal) : null;
}

export async function setDailyGoal(goal: DailyGoal): Promise<void> {
  await AsyncStorage.setItem(KEYS.DAILY_GOAL, String(goal));
}

export async function getCompletedWords(): Promise<Record<string, string[]>> {
  const v = await AsyncStorage.getItem(KEYS.COMPLETED_WORDS);
  return v ? JSON.parse(v) : {};
}

export async function setCompletedWords(data: Record<string, string[]>): Promise<void> {
  await AsyncStorage.setItem(KEYS.COMPLETED_WORDS, JSON.stringify(data));
}

export async function getPodcastListened(): Promise<Record<string, boolean>> {
  const v = await AsyncStorage.getItem(KEYS.PODCAST_LISTENED);
  return v ? JSON.parse(v) : {};
}

export async function setPodcastListened(data: Record<string, boolean>): Promise<void> {
  await AsyncStorage.setItem(KEYS.PODCAST_LISTENED, JSON.stringify(data));
}

export async function getQuizCompleted(): Promise<Record<string, boolean>> {
  const v = await AsyncStorage.getItem(KEYS.QUIZ_COMPLETED);
  return v ? JSON.parse(v) : {};
}

export async function setQuizCompleted(data: Record<string, boolean>): Promise<void> {
  await AsyncStorage.setItem(KEYS.QUIZ_COMPLETED, JSON.stringify(data));
}

export async function getLastActiveDate(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.LAST_ACTIVE_DATE);
}

export async function setLastActiveDate(date: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.LAST_ACTIVE_DATE, date);
}

export async function getStreak(): Promise<number> {
  const v = await AsyncStorage.getItem(KEYS.STREAK);
  return v ? Number(v) : 0;
}

export async function setStreak(count: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.STREAK, String(count));
}

export async function getOnboardingDone(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE);
  return v === 'true';
}

export async function setOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, 'true');
}

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
