#!/usr/bin/env node
/**
 * merge-contrib.mjs — 把校验通过的投稿题目并入题库（v1.9）
 *
 * 用法：node scripts/merge-contrib.mjs <投稿文件> [更多文件...]
 * 前置：先跑 `node scripts/validate-contrib.mjs`（本脚本会再复核 id 唯一性）。
 * 动作：写入 1.2/data/exam/{subject}.json → 同步该科 total 与 index.json 的
 *      meta.totalQuestions → 投稿文件移入 contrib/merged/ 留档。
 * 合并后必须重跑 `npm run verify`（check:data 会三处交叉核对题量）。
 */
import { readFileSync, writeFileSync, mkdirSync, renameSync, existsSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXAM_SUBJECTS } from './lib/exam-bank.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, '1.2');
const EXAM_DIR = join(APP, 'data', 'exam');
const MERGED_DIR = join(ROOT, 'contrib', 'merged');

const files = process.argv.slice(2).filter((a) => !a.startsWith('-'));
if (!files.length) {
  console.error('用法: node scripts/merge-contrib.mjs <投稿文件> [...]');
  process.exit(1);
}

const index = JSON.parse(readFileSync(join(EXAM_DIR, 'index.json'), 'utf8'));
const bank = {};
for (const s of EXAM_SUBJECTS) {
  bank[s] = JSON.parse(readFileSync(join(EXAM_DIR, `${s}.json`), 'utf8'));
}

const seen = new Set();
for (const s of EXAM_SUBJECTS) for (const q of bank[s].questions || []) if (q.id) seen.add(q.id);

let merged = 0;
mkdirSync(MERGED_DIR, { recursive: true });
for (const f of files) {
  const src = resolve(f);
  if (!existsSync(src)) {
    console.error(`  ✗ 文件不存在: ${src}`);
    process.exitCode = 1;
    continue;
  }
  const q = JSON.parse(readFileSync(src, 'utf8'));
  const subject = q.subject;
  if (!EXAM_SUBJECTS.includes(subject)) {
    console.error(`  ✗ ${basename(src)}: subject "${subject}" 非法`);
    process.exitCode = 1;
    continue;
  }
  if (seen.has(q.id)) {
    console.error(`  ✗ ${basename(src)}: id "${q.id}" 已存在，拒绝覆盖`);
    process.exitCode = 1;
    continue;
  }
  delete q.subject; // 题库按科分文件，题目对象内不重复存 subject
  bank[subject].questions.push(q);
  seen.add(q.id);
  merged += 1;

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  renameSync(src, join(MERGED_DIR, `${stamp}__${basename(src)}`));
  console.log(`  ✓ ${basename(src)} → ${subject}.json`);
}

if (!merged) {
  console.log('\n未合并任何题目。');
  process.exit(process.exitCode || 0);
}

let total = 0;
for (const s of EXAM_SUBJECTS) {
  const n = bank[s].questions.length;
  bank[s].total = n;
  if (index[s]) index[s].total = n;
  total += n;
  writeFileSync(join(EXAM_DIR, `${s}.json`), JSON.stringify(bank[s], null, 2) + '\n');
}
index.meta.totalQuestions = total;
writeFileSync(join(EXAM_DIR, 'index.json'), JSON.stringify(index, null, 2) + '\n');

console.log(`\n已合并 ${merged} 题；题库总量 ${total}。`);
console.log('下一步必须重跑：npm run verify（check:data 会交叉核对三处题量）');
