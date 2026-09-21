export interface DaySession {
  day: number;
  title: string;
  readingMinutes: number;
  paragraphs: string[];
  prompt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  theme: string;
  description: string;
  accent: string;
  days: DaySession[];
}

export interface BookProgress {
  completedDays: number[];
  lastOpenedDay: number;
  lastOpenedAt: string;
}

export type ProgressStore = Record<string, BookProgress>;
