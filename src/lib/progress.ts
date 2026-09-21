import type { BookProgress, ProgressStore } from '../types';

const STORAGE_KEY = 'mindleaf:progress';

function readStore(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: ProgressStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage unavailable (private mode, quota) — progress just won't persist.
  }
}

export function getProgress(bookId: string): BookProgress {
  const store = readStore();
  return (
    store[bookId] ?? {
      completedDays: [],
      lastOpenedDay: 1,
      lastOpenedAt: new Date().toISOString(),
    }
  );
}

export function markDayOpened(bookId: string, day: number): void {
  const store = readStore();
  const existing = store[bookId] ?? { completedDays: [], lastOpenedDay: day, lastOpenedAt: '' };
  store[bookId] = {
    ...existing,
    lastOpenedDay: day,
    lastOpenedAt: new Date().toISOString(),
  };
  writeStore(store);
}

export function markDayComplete(bookId: string, day: number): void {
  const store = readStore();
  const existing = store[bookId] ?? { completedDays: [], lastOpenedDay: day, lastOpenedAt: '' };
  const completedDays = existing.completedDays.includes(day)
    ? existing.completedDays
    : [...existing.completedDays, day].sort((a, b) => a - b);
  store[bookId] = { ...existing, completedDays, lastOpenedAt: new Date().toISOString() };
  writeStore(store);
}

export function nextIncompleteDay(bookId: string, totalDays: number): number {
  const progress = getProgress(bookId);
  for (let day = 1; day <= totalDays; day++) {
    if (!progress.completedDays.includes(day)) return day;
  }
  return totalDays;
}
