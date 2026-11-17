/**
 * exam-bank.mjs — 拆分后题库的开发期读取工具（v1.8）
 * 题库自 v1.8 起按学科拆分存放：
 *   1.2/data/exam/index.json      元信息 + 各科 {name,total,categories}（约 2 KB）
 *   1.2/data/exam/{subject}.json  单科题目（运行时按科懒加载，见 app-exam.js）
 * 质检/冒烟等开发期脚本需要整库视角，用本模块合并为
 * {meta, <subject>: {name,total,categories,questions}} 形状（与拆分前一致）。
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const EXAM_SUBJECTS = ['physics', 'chemistry', 'biology', 'math', 'chinese', 'english'];

/** 读取 data/exam/ 全部文件并合并为拆分前的整库形状 */
export function loadExamBank(appDir) {
  const read = (p) => JSON.parse(readFileSync(join(appDir, 'data', 'exam', p), 'utf8'));
  const index = read('index.json');
  const bank = { meta: index.meta };
  for (const subject of EXAM_SUBJECTS) {
    bank[subject] = read(`${subject}.json`);
  }
  return bank;
}
