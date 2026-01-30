/**
 * Firestore helpers: users, progress, podcasts.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  orderBy,
  query,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import { getTodayKey } from './storage';

export type DailyGoal = 10 | 20 | 30;

export type UserDoc = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  dailyGoal: DailyGoal;
  streak: number;
  lastActiveDate: string | null;
  createdAt: { seconds: number };
};

export type ProgressDoc = {
  date: string;
  completedWordIds: string[];
  podcastListened: boolean;
  quizCompleted: boolean;
};

export type PodcastDoc = {
  id: string;
  title: string;
  description: string;
  duration: string;
  audioUrl: string;
  order: number;
  createdAt?: { seconds: number };
};

const USERS = 'users';
const PROGRESS = 'progress';
const PODCASTS = 'podcasts';

export function userRef(uid: string) {
  return doc(db, USERS, uid);
}

export function progressRef(uid: string, date: string) {
  return doc(db, USERS, uid, PROGRESS, date);
}

export function podcastsRef() {
  return collection(db, PODCASTS);
}

export async function getUser(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

export async function setUser(
  uid: string,
  data: Partial<Omit<UserDoc, 'uid'>> & { email?: string | null; displayName?: string | null; photoURL?: string | null }
): Promise<void> {
  const ref = userRef(uid);
  await setDoc(ref, { uid, ...data }, { merge: true });
}

export async function getProgress(uid: string, date: string): Promise<ProgressDoc | null> {
  const snap = await getDoc(progressRef(uid, date));
  return snap.exists() ? (snap.data() as ProgressDoc) : null;
}

export async function setProgress(
  uid: string,
  date: string,
  data: Partial<ProgressDoc>
): Promise<void> {
  const ref = progressRef(uid, date);
  const existingSnap = await getDoc(ref);
  const existing = existingSnap.exists() ? (existingSnap.data() as ProgressDoc) : null;
  const merged: ProgressDoc = {
    date,
    completedWordIds: data.completedWordIds !== undefined ? data.completedWordIds : (existing?.completedWordIds ?? []),
    podcastListened: data.podcastListened !== undefined ? data.podcastListened : (existing?.podcastListened ?? false),
    quizCompleted: data.quizCompleted !== undefined ? data.quizCompleted : (existing?.quizCompleted ?? false),
  };
  await setDoc(ref, merged);
}

export async function getAllProgressForUser(uid: string): Promise<Record<string, ProgressDoc>> {
  const col = collection(db, USERS, uid, PROGRESS);
  const snap = await getDocs(col);
  const out: Record<string, ProgressDoc> = {};
  snap.docs.forEach((d) => {
    out[d.id] = d.data() as ProgressDoc;
  });
  return out;
}

export async function getPodcasts(): Promise<PodcastDoc[]> {
  const q = query(podcastsRef(), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PodcastDoc));
}

export async function getTodayPodcast(): Promise<PodcastDoc | null> {
  try {
    const podcasts = await getPodcasts();
    if (podcasts.length === 0) return null;
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % podcasts.length;
    return podcasts[dayIndex] ?? podcasts[0];
  } catch {
    return null;
  }
}
