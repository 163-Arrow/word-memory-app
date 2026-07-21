import { describe, expect, it } from 'vitest';
import { appendImportedWords, createSession, dedupeImport, ensureSpellingQueue, recordAnswer, remainingInRound, restoreForLearning, taskWords } from '../src/logic';
import { dictationKeyAction } from '../src/keyboard';
import { selectXlsxSheet } from '../src/importer';
import type { DailySession, Word } from '../src/types';
const word=(id:number,status:Word['status']='learning'):Word=>({id,text:'Apple',meaning:'苹果',phonetic:'',status,streak:0,correctCount:0,wrongCount:0,createdAt:''});
const answer=(s:DailySession, value='apple')=>recordAnswer(s,s.queue[s.currentIndex],value,'Apple');
describe('学习规则',()=>{
 it('第一、二、三轮答对分别累计 1、2、3，第三轮掌握',()=>{let s=createSession('2026-01-01',[word(1)]);s=answer(s);expect(s.progresses[1].streak).toBe(1);s=answer(s);expect(s.progresses[1].streak).toBe(2);s=answer(s);expect(s.progresses[1].streak).toBe(3);expect(s.masteredIds).toEqual([1]);expect(s.completed).toBe(true)});
 it('连续两轮后答错清零，重新连续三轮才掌握',()=>{let s=createSession('2026-01-01',[word(1)]);s=answer(answer(s));s=answer(s,'pear');expect(s.progresses[1].streak).toBe(0);s=answer(answer(answer(s)));expect(s.completed).toBe(true)});
 it('同一轮中单词只出现一次，掌握的单词不会进入下一轮',()=>{let s=createSession('2026-01-01',[word(1),word(2)]);expect(new Set(s.queue).size).toBe(s.queue.length);s=answer(s);s=answer(s);expect(s.round).toBe(2);expect(s.queue).toHaveLength(2)});
 it('已掌握词不会创建任务，恢复学习时连续轮数归零',()=>{expect(taskWords([word(1,'mastered'),word(2)])).toHaveLength(1);expect(restoreForLearning({...word(1,'mastered'),streak:3})).toMatchObject({status:'learning',streak:0})});
 it('会保留可持久化的当前轮次、队列、位置和统计',()=>{let s=createSession('2026-01-01',[word(1),word(2)]);s=answer(s);const restored=structuredClone(s);expect(restored).toMatchObject({round:1,currentIndex:1,correct:1});expect(restored.queue).toEqual(s.queue)});
 it('空 session 首次导入单词后立即生成第一轮 queue',()=>{let s=createSession('2026-01-01',[]);s=appendImportedWords(s,[1,2,3,4,5]);expect(s.queue).toHaveLength(5);expect(remainingInRound(s)).toBe(5);expect(s.round).toBe(1);expect(s.currentIndex).toBe(0)});
 it('进行中的轮次导入不会改变当前 queue，新词下一轮出现',()=>{let s=createSession('2026-01-01',[word(1)]);const queue=[...s.queue];s.phase='spell';s=appendImportedWords(s,[2]);expect(s.queue).toEqual(queue);s=answer(s);expect(s.round).toBe(2);expect(s.queue).toContain(2)});
 it('有未掌握词但 queue 为空时能在开始听写前修复 queue',()=>{let s=createSession('2026-01-01',[]);s.wordIds=[1,2];s.progresses={1:{wordId:1,streak:0,qualified:false,correct:0,wrong:0},2:{wordId:2,streak:0,qualified:false,correct:0,wrong:0}};s.completed=false;s=ensureSpellingQueue(s);expect(s.queue).toHaveLength(2);expect(remainingInRound(s)).toBe(2)});
 it('耗尽的 queue 导入新词后重建下一轮 queue',()=>{let s=createSession('2026-01-01',[word(1)]);s.currentIndex=s.queue.length;s.completed=true;s=appendImportedWords(s,[2]);expect(s.round).toBe(2);expect(s.currentIndex).toBe(0);expect(s.queue).toEqual(expect.arrayContaining([1,2]));expect(remainingInRound(s)).toBe(2)});
 it('XLSX 工作表可列出并按名称读取',()=>{const parsed=selectXlsxSheet([{sheet:'词表 A',data:[['word','meaning'],['apple','苹果']]},{sheet:'词表 B',data:[['word'],['pear']]}],'词表 B');expect(parsed.sheets).toEqual(['词表 A','词表 B']);expect(parsed.rows).toEqual([['word'],['pear']])});
 it('导入按大小写和首尾空格去重',()=>{const x=dedupeImport([{word:' Apple '},{word:'apple'},{word:''}],['PEAR']);expect(x.added).toHaveLength(1);expect(x.duplicate).toBe(1);expect(x.invalid).toBe(1)});
 it('浏览模式不影响轮数与掌握进度',()=>{const s=createSession('2026-01-01',[word(1)]);expect(s).toMatchObject({phase:'browse',round:1,currentIndex:0});expect(s.progresses[1].streak).toBe(0)});
});
describe('听写键盘操作',()=>{
 it('Space 只执行重播动作，Enter 只执行一次提交动作',()=>{expect(dictationKeyAction(' ','Space',null)).toBe('replay');expect(dictationKeyAction('Enter','Enter',null)).toBe('submit')});
 it('错误反馈时 Enter 确认下一题，正确反馈不重复提交',()=>{expect(dictationKeyAction('Enter','Enter','bad')).toBe('next');expect(dictationKeyAction('Enter','Enter','ok')).toBe('none')});
});
