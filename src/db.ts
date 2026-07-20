import Dexie, { type Table } from 'dexie'; import type { AppSettings, DailySession, SpellingAttempt, Word } from './types';
class WordDB extends Dexie { words!: Table<Word, number>; sessions!: Table<DailySession, string>; attempts!: Table<SpellingAttempt, number>; settings!: Table<AppSettings, string>; constructor(){ super('daily-word-cycle'); this.version(1).stores({ words:'++id,text,status', sessions:'date', attempts:'++id,date,wordId', settings:'id' }); } }
export const db = new WordDB();
export async function getSettings() { return (await db.settings.get('settings')) ?? { id:'settings', rate:0.85, volume:1, theme:'light' as const }; }
