/**
 * one-shot: fix Phase A data defects
 * - exam-bank PHY_2018_01 analysis/options
 * - duplicate topic ids in math/chinese/english knowledge
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

// ── 熔断保护（T0-4 / P1-9）───────────────────────────────────────────────
// 本脚本是一次性数据修复脚本，会重写 1MB 的 exam-bank.json。
// 修复目标已被 npm run verify 门禁固化；重跑会把已修好的数据改回错误状态
// （fix-phase-a-data 尤其会覆盖 PHY_2018_01 的已修答案键）。
// 不带 --apply 时只打印摘要，不写任何文件。详见 ./README.md
import { guard as __legacyGuard } from './legacy-guard.mjs';
if (!__legacyGuard('fix-phase-a-data.mjs')) { /* dry-run：到此为止 */ } else {
const DATA = join(ROOT, '1.2', 'data');

// ── exam bank ──
{
  const p = join(DATA, 'exam-bank.json');
  const d = JSON.parse(readFileSync(p, 'utf8'));
  const list = d.physics.questions || d.physics.exams;
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
}
