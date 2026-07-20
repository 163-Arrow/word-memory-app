export type WordStatus = 'learning' | 'mastered' | 'paused';
export interface Word { id?: number; text: string; meaning: string; phonetic: string; status: WordStatus; streak: number; correctCount: number; wrongCount: number; createdAt: string; }
export interface DailyWordProgress { wordId: number; streak: number; qualified: boolean; correct: number; wrong: number; }
export interface SpellingAttempt { id?: number; date: string; wordId: number; round: number; answer: string; correct: boolean; createdAt: string; }
export interface DailySession { date: string; wordIds: number[]; progresses: Record<number, DailyWordProgress>; phase: 'browse' | 'spell'; round: number; queue: number[]; currentIndex: number; correct: number; wrong: number; completed: boolean; masteredIds: number[]; }
export interface AppSettings { id: 'settings'; rate: number; volume: number; theme: 'light' | 'dark'; }
export type ImportRow = { word: string; meaning?: string; phonetic?: string };
