/**
 * balance-answers.mjs — T8: 选择题答案分布均衡化
 * 原理：A/B 过多时，把正确选项「内容」与低频槽位的选项内容整体互换，
 *       答案字母随之改变。选项内容集合不变，仅位置变化，正确性不变。
 * 安全规则（不满足则跳过该题）：
 *   - 恰好 4 个字符串选项且互不相同、答案为单字母 A-D
 *   - 任何选项/题干/解析不含位置引用词（以上、同上、ABCD 项等）
 * 用法：node scripts/balance-answers.mjs [--apply]   （默认 dry-run）
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const APPLY = process.argv.includes('--apply');
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BANK = resolve(ROOT, '1.2/data/exam-bank.json');

const POSITION_REF =
  /以上|之下|都对|都不对|都正确|全(部|都)|均(不|对|正)|同左|同上|同[A-D]|如上|上述|[ABCD]\s*[项]|选项\s*[ABCD]|[ABCD]\s*(错误|不对|正确|符合)|[ABCD][．.、]/;
const BAN_IN_QUESTION = /[ABCD]\s*(项|球|板|管|点|处)|选项\s*[ABCD]/;

const data = JSON.parse(readFileSync(BANK, 'utf8'));
const dist = { A: 0, B: 0, C: 0, D: 0 };
const eligible = [];
let skippedMulti = 0;

for (const [subj, node] of Object.entries(data)) {
  if (subj === 'meta' || !node || typeof node !== 'object') continue;
  const list = node.questions || node.exams || [];
  for (const q of list) {
    if (typeof q.answer !== 'string' || !/^[A-D]$/.test(q.answer)) { if (typeof q.answer === 'string' && q.answer.length > 1) skippedMulti++; continue; }
    if (!Array.isArray(q.options) || q.options.length !== 4) continue;
    if (dist[q.answer] !== undefined) dist[q.answer]++; // 全量分布用于设定目标
    if (!q.options.every((o) => typeof o === 'string' && o.length > 0) || new Set(q.options).size !== 4) continue;
    if (q.options.some((o) => POSITION_REF.test(o))) continue;
    if (POSITION_REF.test(q.analysis || '') || BAN_IN_QUESTION.test(q.question || '')) continue;
    eligible.push({ subj, q });
  }
}

console.log('全量分布:', JSON.stringify(dist), `可换位 ${eligible.length} 题，多选/非单字母跳过 ${skippedMulti}`);

const total = dist.A + dist.B + dist.C + dist.D;
const target = Math.round(total / 4);
const supply = { A: Math.max(0, dist.A - target), B: Math.max(0, dist.B - target) };
const need = { C: Math.max(0, target - dist.C), D: Math.max(0, target - dist.D) };

const moves = [];
for (const from of ['A', 'B']) {
  for (const to of ['D', 'C']) {
    const n = Math.min(supply[from], need[to]);
    if (n > 0) { moves.push({ from, to, n }); supply[from] -= n; need[to] -= n; }
  }
}

const SWAP = { 'A>D': [0, 3], 'A>C': [0, 2], 'B>D': [1, 3], 'B>C': [1, 2] };
const counters = { 'A>D': 0, 'A>C': 0, 'B>D': 0, 'B>C': 0 };
const changed = [];
const quota = new Map(moves.map((m) => [`${m.from}>${m.to}`, m.n]));

for (const { subj, q } of eligible) {
  const key = `${q.answer}>`;
  for (const k of Object.keys(SWAP)) {
    if (!k.startsWith(key)) continue;
    if ((counters[k] || 0) >= (quota.get(k) || 0)) continue;
    counters[k] = (counters[k] || 0) + 1;
    const [i, j] = SWAP[k];
    const oldLetter = q.answer, newLetter = String.fromCharCode(65 + j);
    const movedContent = q.options[i];
    q.options[i] = q.options[j];
    q.options[j] = movedContent;
    // 自检：答案字母必须仍指向原正确内容
    if (q.options[j] !== movedContent || q.answer !== oldLetter) throw new Error('swap invariant broken');
    q.answer = newLetter;
    if (q.options[q.answer.charCodeAt(0) - 65] !== movedContent) throw new Error('answer mapping broken');
    changed.push(`${subj}/${q.id} ${oldLetter}->${newLetter}`);
    break;
  }
}

const after = { A: 0, B: 0, C: 0, D: 0 };
for (const [subj, node] of Object.entries(data)) {
  if (subj === 'meta' || !node || typeof node !== 'object') continue;
  for (const q of node.questions || node.exams || []) {
    if (typeof q.answer === 'string' && /^[A-D]$/.test(q.answer) && Array.isArray(q.options) && q.options.length === 4) after[q.answer]++;
  }
}
console.log('计划:', JSON.stringify(quota.getObject ? quota : Object.fromEntries(quota)));
console.log('执行:', JSON.stringify(counters), `共 ${changed.length} 题`);
console.log('均衡后分布:', JSON.stringify(after));
if (changed.length) console.log('样例:', changed.slice(0, 8).join(', '), changed.length > 8 ? '...' : '');

if (APPLY && changed.length) {
  writeFileSync(BANK, JSON.stringify(data, null, 2) + '\n');
  console.log('已写入', BANK);
} else {
  console.log('(dry-run，未写入。加 --apply 生效)');
}
