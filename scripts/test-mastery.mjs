#!/usr/bin/env node
/**
 * test-mastery.mjs — 掌握度纯函数单测（v1.10 T16）
 * 直接 import 1.2/js/modules/mastery.js（仓库根 package.json 为 type: module）。
 */
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, '1.2', 'js', 'modules', 'mastery.js');
const M = await import(pathToFileURL(SRC).href);

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓', msg); }
  else { fail++; console.error('  ✗', msg); }
}
const DAY = 86400000;
const NOW = Date.now();
const near = (a, b, eps) => Math.abs(a - b) <= (eps || 1e-6);

console.log('=== mastery.js ===');
ok(near(M.computeMastery(null, NOW), 0), '空记录 → 0');
ok(near(M.computeMastery({ attempts: 0, correct: 0 }, NOW), 0), '0 次作答 → 0');
ok(near(M.computeMastery({ attempts: 10, correct: 10, lastAt: NOW }, NOW), 0.8, 1e-9),
  '全对且无复习质量：1×0.6 + 0.5×0.4 = 0.8');
ok(near(M.computeMastery({ attempts: 10, correct: 5, lastAt: NOW }, NOW), 0.5, 1e-9),
  '一半正确：0.5×0.6 + 0.5×0.4 = 0.5');
ok(near(M.computeMastery({ attempts: 10, correct: 10, qualitySum: 20, qualityCount: 5, lastAt: NOW }, NOW), 0.92, 1e-9),
  '复习质量满分：0.6 + 0.4×(20/5/5) = 0.92');
ok(near(M.computeMastery({ attempts: 10, correct: 10, lastAt: NOW - 14 * DAY }, NOW), 0.4, 1e-6),
  '14 天未练：0.8 × 0.5 = 0.4');
ok(near(M.computeMastery({ attempts: 10, correct: 10, lastAt: NOW - 28 * DAY }, NOW), 0.2, 1e-6),
  '28 天未练：0.8 × 0.25 = 0.2');

ok(M.levelOf(0) === '未练' && M.levelOf(0.2) === '薄弱' && M.levelOf(0.5) === '一般'
  && M.levelOf(0.7) === '熟练' && M.levelOf(0.9) === '掌握', '等级阈值（0/薄弱/一般/熟练/掌握）');

const records = {
  'physics::牛顿定律': { attempts: 10, correct: 9, lastAt: NOW },
  'physics::电磁感应': { attempts: 10, correct: 2, lastAt: NOW },
  'chemistry::氧化还原': { attempts: 10, correct: 5, lastAt: NOW },
  'biology::细胞分裂': { attempts: 0, correct: 0, lastAt: 0 }
};
const sum = M.summarize(records, NOW);
ok(sum.count === 4 && near(sum.avg, (0.74 + 0.32 + 0.5 + 0) / 4, 1e-6), '汇总平均掌握度正确（含未练 0）');
ok(sum.points[0].key === 'biology::细胞分裂', '薄弱点按掌握度升序（未练排最前）');
ok(sum.levels['薄弱'] === 1 && sum.levels['未练'] === 1, '等级计数正确');

const q = M.buildQueue(records, 3, NOW, 5);
ok(q.due === 3 && q.total === 3 + q.weakCount, '队列总数 = 到期 + 薄弱');
ok(q.weak.length === 1 && q.weak[0].key === 'physics::电磁感应', '薄弱点仅含 0<score<0.4，且按分数升序');
ok(M.buildQueue(records, 0, NOW, 1).weakCount === 1, 'limit 生效');

console.log(`\nmastery 单测: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
