/**
 * normalize examTips string -> string[] for chinese/english knowledge
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, '1.2', 'data');

for (const subject of ['chinese', 'english', 'math', 'physics', 'chemistry', 'biology']) {
  const p = join(DATA, subject, 'knowledge.json');
  const d = JSON.parse(readFileSync(p, 'utf8'));
  let n = 0;
  for (const ch of d.chapters || []) {
    for (const tp of ch.topics || []) {
      const v = tp.examTips;
      if (typeof v === 'string') {
        tp.examTips = v.trim() ? [v.trim()] : [];
        n += 1;
      }
    }
  }
  writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
  console.log(`${subject}: normalized ${n} examTips`);
}
