import { describe, expect, it } from 'vitest';
import { appendImportedWords, createSession, dedupeImport, ensureSessionQueue, recordAnswer, restoreForLearning, taskWords } from '../src/logic';
import type { DailySession, Word } from '../src/types';
const word=(id:number,status:Word['status']='learning'):Word=>({id,text:'Apple',meaning:'苹果',phonetic:'',status,streak:0,correctCount:0,wrongCount:0,createdAt:''});
const answer=(s:DailySession, value='apple')=>recordAnswer(s,s.queue[s.currentIndex],value,'Apple');
describe('学习规则',()=>{
 it('第一、二、三轮答对分别累计 1、2、3，第三轮掌握',()=>{let s=createSession('2026-01-01',[word(1)]);s=answer(s);expect(s.progresses[1].streak).toBe(1);s=answer(s);expect(s.progresses[1].streak).toBe(2);s=answer(s);expect(s.progresses[1].streak).toBe(3);expect(s.masteredIds).toEqual([1]);expect(s.completed).toBe(true)});
 it('连续两轮后答错清零，重新连续三轮才掌握',()=>{let s=createSession('2026-01-01',[word(1)]);s=answer(answer(s));s=answer(s,'pear');expect(s.progresses[1].streak).toBe(0);s=answer(answer(answer(s)));expect(s.completed).toBe(true)});
 it('同一轮中单词只出现一次，掌握的单词不会进入下一轮',()=>{let s=createSession('2026-01-01',[word(1),word(2)]);expect(new Set(s.queue).size).toBe(s.queue.length);s=answer(s);s=answer(s);expect(s.round).toBe(2);expect(s.queue).toHaveLength(2);});
 it('已掌握词不会创建任务，恢复学习时连续轮数归零',()=>{expect(taskWords([word(1,'mastered'),word(2)])).toHaveLength(1);expect(restoreForLearning({...word(1,'mastered'),streak:3})).toMatchObject({status:'learning',streak:0})});
 it('会保留可持久化的当前轮次、队列、位置和统计',()=>{let s=createSession('2026-01-01',[word(1),word(2)]);s=answer(s);const restored=structuredClone(s);expect(restored).toMatchObject({round:1,currentIndex:1,correct:1});expect(restored.queue).toEqual(s.queue)});
 it('新导入单词只在下一轮加入，不插入当前队列',()=>{let s=createSession('2026-01-01',[word(1)]);const queue=[...s.queue];s=appendImportedWords(s,[2]);expect(s.queue).toEqual(queue);s=answer(s);expect(s.round).toBe(2);expect(s.queue).toContain(2)});
 it('会修复有未掌握单词但队列为空或已耗尽的会话',()=>{const initial=createSession('2026-01-01',[word(1),word(2)]);const repaired=ensureSessionQueue({...initial,queue:[],currentIndex:0,completed:true});expect(repaired.queue).toHaveLength(2);expect(repaired.currentIndex).toBe(0);expect(repaired.completed).toBe(false);const exhausted=ensureSessionQueue({...initial,currentIndex:initial.queue.length});expect(exhausted.round).toBe(2);expect(exhausted.currentIndex).toBe(0)});
 it('空词库创建的会话导入单词后可立即建立队列',()=>{let s=createSession('2026-01-01',[]);s=appendImportedWords(s,[1]);expect(s.completed).toBe(false);expect(s.queue).toEqual([1]);expect(s.currentIndex).toBe(0)});
 it('导入按大小写和首尾空格去重',()=>{const x=dedupeImport([{word:' Apple '},{word:'apple'},{word:''}],['PEAR']);expect(x.added).toHaveLength(1);expect(x.duplicate).toBe(1);expect(x.invalid).toBe(1)});
 it('浏览模式不影响轮数与掌握进度',()=>{const s=createSession('2026-01-01',[word(1)]);expect(s).toMatchObject({phase:'browse',round:1,currentIndex:0});expect(s.progresses[1].streak).toBe(0)});
});
