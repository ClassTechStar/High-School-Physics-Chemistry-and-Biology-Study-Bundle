/**
 * one-shot: fix Phase A data defects
 * - exam-bank PHY_2018_01 analysis/options
 * - duplicate topic ids in math/chinese/english knowledge
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, '1.2', 'data');

// ── exam bank ──
{
  const p = join(DATA, 'exam-bank.json');
  const d = JSON.parse(readFileSync(p, 'utf8'));
  const list = d.physics.exams || d.physics.questions;
  const q = list[0];
  if (q.id === 'PHY_2018_01') {
    q.options = [
      'a = 3 m/s²，t = 6 s',
      'a = 4 m/s²，t = 2 s',
      'a = 5 m/s²，t = 2.5 s',
      'a = 3 m/s²，t = 2 s',
    ];
    q.answer = 'A';
    q.analysis =
      '由牛顿第二定律：F - μmg = ma\n' +
      '10 - 0.2×2×10 = 2a ⇒ a = 3 m/s²\n' +
      '4s 末速度 v = at = 3×4 = 12 m/s\n' +
      '撤去 F 后只受摩擦力：a′ = μg = 2 m/s²\n' +
      '减速到停：t′ = v/a′ = 12/2 = 6 s\n' +
      '故 a = 3 m/s²，t = 6 s，选 A。';
    writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
    console.log('fixed PHY_2018_01');
  }
}

// ── knowledge topic ids ──
for (const subject of ['math', 'chinese', 'english']) {
  const p = join(DATA, subject, 'knowledge.json');
  const d = JSON.parse(readFileSync(p, 'utf8'));
  const seen = new Set();
  let fixed = 0;
  for (const ch of d.chapters || []) {
    const chId = ch.id || 'ch';
    for (const tp of ch.topics || []) {
      const old = tp.id;
      let next = old;
      if (!old || seen.has(old)) {
        next = `${chId}-${old || 't'}`;
        // still unique?
        let n = 2;
        while (seen.has(next)) {
          next = `${chId}-${old || 't'}-${n++}`;
        }
        tp.id = next;
        fixed += 1;
      }
      seen.add(tp.id);
    }
  }
  writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
  console.log(`${subject}: remapped ${fixed} topic ids, total unique ${seen.size}`);
}
