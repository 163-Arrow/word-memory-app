import type { DailySession, DailyWordProgress, ImportRow, Word } from './types';
export const localDate = () => { const d = new Date(); const off = d.getTimezoneOffset(); return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10); };
export const normalize = (s: string) => s.trim().toLocaleLowerCase('en-US');
export function dedupeImport(rows: ImportRow[], existing: string[] = []) { const seen = new Set(existing.map(normalize)); let added: ImportRow[] = [], duplicate = 0, invalid = 0; for (const row of rows) { const word = row.word?.trim(); if (!word || !/[a-z]/i.test(word)) { invalid++; continue; } const key = normalize(word); if (seen.has(key)) { duplicate++; continue; } seen.add(key); added.push({ word, meaning: row.meaning?.trim() || '', phonetic: row.phonetic?.trim() || '' }); } return { added, duplicate, invalid }; }
export function taskWords(words: Word[]) { return words.filter(w => w.status === 'learning' && w.id !== undefined); }
export function createSession(date: string, words: Word[]): DailySession { const ids = taskWords(words).map(w => w.id!); const p: Record<number, DailyWordProgress> = {}; ids.forEach(wordId => p[wordId] = { wordId, streak: 0, qualified: false, correct: 0, wrong: 0 }); return { date, wordIds: ids, progresses: p, phase: 'browse', round: 1, queue: shuffle(ids), currentIndex: 0, correct: 0, wrong: 0, completed: ids.length === 0, masteredIds: [] }; }
export function shuffle<T>(items: T[]) { const copy = [...items]; for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; }
export function recordAnswer(session: DailySession, wordId: number, answer: string, expected: string): DailySession { const next = structuredClone(session); const p = next.progresses[wordId]; const correct = normalize(answer) === normalize(expected); if (correct) { p.streak++; p.correct++; next.correct++; if (p.streak >= 3) { p.qualified = true; if (!next.masteredIds.includes(wordId)) next.masteredIds.push(wordId); } } else { p.streak = 0; p.wrong++; next.wrong++; }
 next.currentIndex++;
 return ensureSessionQueue(next);
}

/**
 * Repairs a persisted session whose round has been exhausted. This also covers
 * sessions that were created before any words were imported.
 */
export function ensureSessionQueue(session: DailySession): DailySession {
 const next = structuredClone(session);
 const remaining = next.wordIds.filter(id => !next.progresses[id]?.qualified);
 if (!remaining.length) {
  next.completed = next.wordIds.length > 0;
  return next;
 }
 if (next.currentIndex < next.queue.length) return next;

 // An empty first session has no round to finish yet; every other exhausted
 // queue starts the following round.
 if (next.queue.length > 0 || next.currentIndex > 0) next.round++;
 next.queue = shuffle(remaining);
 next.currentIndex = 0;
 next.completed = false;
 return next;
}

/** Adds imported words to today's session without changing the active round queue. */
export function appendImportedWords(session: DailySession, wordIds: number[]): DailySession {
 const next = structuredClone(session); for (const wordId of wordIds) { if (!next.wordIds.includes(wordId)) { next.wordIds.push(wordId); next.progresses[wordId] = { wordId, streak: 0, qualified: false, correct: 0, wrong: 0 }; next.completed = false; } } return ensureSessionQueue(next);
}
export function restoreForLearning(word: Word): Word { return { ...word, status: 'learning', streak: 0 }; }
