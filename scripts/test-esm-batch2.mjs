#!/usr/bin/env node
/**
 * test-esm-batch2.mjs — ESM 第二批迁移对拍（v1.10 T19）
 * 校验 js/modules/text.js、js/modules/sm2.js 与 IIFE 内置实现行为完全一致。
 */
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, '1.2');

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓', msg); }
  else { fail++; console.error('  ✗', msg); }
}

const text = await import(pathToFileURL(join(APP, 'js', 'modules', 'text.js')).href);
const sm2 = await import(pathToFileURL(join(APP, 'js', 'modules', 'sm2.js')).href);

function loadIife(file, name) {
  const sandbox = {
    console, Date, Math, JSON, setTimeout, clearTimeout,
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    document: { baseURI: 'http://localhost/', readyState: 'complete', addEventListener() {} },
    URL,
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(join(APP, 'js', file), 'utf8'), sandbox, { filename: file });
  return sandbox.window[name];
}

const CU = loadIife('common-utils.js', 'CommonUtils');
const SR = loadIife('spaced-repetition.js', 'HSPCBSpacedRepetition');

ok(CU && SR, 'IIFE 实现可加载');

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// text.js 对拍
const escCases = ['<script>alert(1)</script>', '"\'&', null, undefined, 0, '正常文本'];
ok(escCases.every((s) => CU.escapeHtml(s) === text.escapeHtml(s)), 'escapeHtml 与 IIFE 一致（含 null/引号）');
ok(CU.safeJsonParse('{"a":1}', {}) && same(CU.safeJsonParse('{"a":1}', {}), text.safeJsonParse('{"a":1}', {})),
  'safeJsonParse 合法 JSON 一致');
ok(same(CU.safeJsonParse('bad', { x: 1 }), text.safeJsonParse('bad', { x: 1 })), 'safeJsonParse 非法输入回退一致');
ok(same(CU.deepClone({ a: [1, { b: 2 }] }), text.deepClone({ a: [1, { b: 2 }] })), 'deepClone 一致');
ok(CU.todayStr() === text.todayStr(), 'todayStr 一致（同一天）');
ok(CU.formatDateCN('2026-11-25') === text.formatDateCN('2026-11-25'), 'formatDateCN 一致');
ok(CU.daysBetween('2026-11-01', '2026-11-25') === text.daysBetween('2026-11-01', '2026-11-25'), 'daysBetween 一致');
ok(CU.genId('p').split('_')[0] === text.genId('p').split('_')[0], 'genId 前缀规则一致');
ok(typeof CU.debounce === 'function' && typeof text.debounce === 'function'
  && typeof CU.throttle === 'function' && typeof text.throttle === 'function', 'debounce/throttle 两版均存在');

// sm2.js 对拍
const NOW = 1764000000000;
const cards = [
  null,
  { ease: 2.5, interval: 0, due: NOW, reps: 0 },
  { ease: 2.3, interval: 3, due: NOW - 1000, reps: 2 },
  { ease: 1.3, interval: 10, due: NOW + 86400000, reps: 5 }
];
for (const c of cards) {
  ok(same(SR.schedule(c, true, NOW), sm2.schedule(c, true, NOW)), `schedule(记住) 一致：${JSON.stringify(c)}`);
  ok(same(SR.schedule(c, false, NOW), sm2.schedule(c, false, NOW)), `schedule(忘了) 一致：${JSON.stringify(c)}`);
  ok(SR.isDue(c, NOW) === sm2.isDue(c, NOW), `isDue 一致：${JSON.stringify(c)}`);
  ok(SR.dueLabel(c, NOW) === sm2.dueLabel(c, NOW), `dueLabel 一致：${JSON.stringify(c)}`);
}
ok(SR.initCard(NOW).due === sm2.initCard(NOW).due, 'initCard 一致');

console.log(`\nESM 第二批对拍: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
