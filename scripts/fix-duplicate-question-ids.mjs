/**
 * fix duplicate question ids in exam-bank.json
 * Strategy: keep first occurrence; rename later ones with -b, -c suffix by index
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, '1.2', 'data', 'exam-bank.json');
const d = JSON.parse(readFileSync(p, 'utf8'));

let fixed = 0;
const globalSeen = new Set();

for (const subj of Object.keys(d).filter((k) => k !== 'meta')) {
  const list = d[subj].exams || d[subj].questions;
  if (!Array.isArray(list)) continue;
  const localSeen = new Set();
  list.forEach((q, i) => {
    if (!q || typeof q !== 'object') return;
    if (!q.id) {
      q.id = `${subj.toUpperCase()}_${String(i + 1).padStart(3, '0')}`;
      fixed += 1;
    }
    let id = q.id;
    if (globalSeen.has(id) || localSeen.has(id)) {
      const base = id;
      let n = 2;
      let next = `${base}_dup${n}`;
      while (globalSeen.has(next) || localSeen.has(next)) {
        n += 1;
        next = `${base}_dup${n}`;
      }
      q.id = next;
      id = next;
      fixed += 1;
    }
    globalSeen.add(id);
    localSeen.add(id);
  });
}

writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
console.log(`renamed/assigned ${fixed} question ids; unique total=${globalSeen.size}`);

// verify
const d2 = JSON.parse(readFileSync(p, 'utf8'));
const all = new Set();
let dups = 0;
for (const subj of Object.keys(d2).filter((k) => k !== 'meta')) {
  for (const q of d2[subj].exams || []) {
    if (all.has(q.id)) dups += 1;
    all.add(q.id);
  }
}
console.log('remaining dups', dups, 'unique', all.size);
