/**
 * test-sm2.mjs — 简化 SM-2 间隔重复调度单测（v1.8 P3）
 * 覆盖 1.2/js/spaced-repetition.js 的纯调度计算：初始态、递增间隔、
 * 忘记重排、ease 下限、到期判定与函数不变性。
 */
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(ROOT, '1.2', 'js', 'spaced-repetition.js'), 'utf8');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: 'spaced-repetition.js' });

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓', msg); }
  else { fail++; console.error('  ✗', msg); }
}

const SR = sandbox.window.HSPCBSpacedRepetition;
ok(!!SR, 'HSPCBSpacedRepetition 已挂到 window');

const T0 = 1700000000000;
const DAY = SR.DAY;

// 初始态
const c0 = SR.initCard(T0);
ok(c0.ease === 2.5 && c0.interval === 0 && c0.due === T0 && c0.reps === 0, 'initCard 初始态（ease 2.5 / 间隔 0 / 立即到期）');

// 记住：1 → 3 → ×ease
const c1 = SR.schedule(c0, true, T0);
ok(c1.reps === 1 && c1.interval === 1 && c1.due === T0 + DAY, '第 1 次记住 → 间隔 1 天');
const c2 = SR.schedule(c1, true, c1.due);
ok(c2.reps === 2 && c2.interval === 3 && c2.due === c1.due + 3 * DAY, '第 2 次记住 → 间隔 3 天');
const c3 = SR.schedule(c2, true, c2.due);
ok(c3.reps === 3 && c3.interval === Math.round(3 * 2.5) && c3.due === c2.due + c3.interval * DAY, '第 3 次记住 → 间隔 ×ease（3×2.5=8 天）');

// 忘记：重排 + ease 下调 + 10 分钟重试
const f1 = SR.schedule(c3, false, c3.due);
ok(f1.reps === 0 && f1.interval === 0, '忘记 → reps/间隔归零');
ok(Math.abs(f1.ease - 2.3) < 1e-9, '忘记 → ease −0.2（2.5→2.3）');
ok(f1.due === c3.due + 10 * 60000, '忘记 → 10 分钟后重试');
const f2 = SR.schedule({ ease: 1.4, interval: 2, due: 0, reps: 1 }, false, T0);
ok(f2.ease === 1.3, 'ease 下限 1.3 不再下降');

// 到期判定
ok(SR.isDue(c0, T0 + 1) === true, '到期判定：due<=now 为真');
ok(SR.isDue(c1, T0) === false, '未到期判定：due>now 为假');
ok(SR.isDue(null, T0) === true && SR.isDue(undefined, T0) === true, '旧条目无调度信息一律视为待复习');

// 文案
ok(SR.dueLabel(c0, T0 + 1) === '今天应复习', 'dueLabel 到期文案');
ok(SR.dueLabel(c1, T0) === '1 天后复习', 'dueLabel 未来文案');

// 不变性：schedule 不修改原卡片对象
const orig = { ease: 2.5, interval: 3, due: 1, reps: 2 };
SR.schedule(orig, true, T0);
ok(orig.due === 1 && orig.reps === 2 && orig.interval === 3, 'schedule 不修改原卡片对象（返回新对象）');

console.log(`\nsm2 单测: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
