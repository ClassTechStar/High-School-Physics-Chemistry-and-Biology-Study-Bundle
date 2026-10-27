/**
 * test-schedule.mjs — schedule-engine 纯计算单测（v1.5 / T6）
 * 用 vm 沙箱装载浏览器 IIFE（与 test-progress.mjs 同模式），调用 _pure 导出。
 * 日期一律由 startDate 推导（周几/周序随真实日历变化仍保持断言稳健）。
 */
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, '1.2');

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ok  ', msg); }
  else { fail++; console.error('  ✗', msg); }
}

const sandbox = { console, window: {}, Date, Math, JSON, isNaN, parseInt, parseFloat };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(readFileSync(join(APP, 'js', 'schedule-engine.js'), 'utf8'), sandbox, { filename: 'schedule-engine.js' });

const S = sandbox.window.HSPCBSchedule;
ok(!!S && !!S._pure, 'HSPCBSchedule 装载并导出 _pure');
const P = S._pure;

// parseHM
ok(P.parseHM('19:00') === 1140, 'parseHM 19:00 → 1140');
ok(P.parseHM('0:05') === 5, 'parseHM 0:05 → 5');
ok(isNaN(P.parseHM('24:00')), 'parseHM 拒绝 24:00');
ok(isNaN(P.parseHM('19:5')), 'parseHM 拒绝 19:5');

// weekNumber（以 2026-09-01 为学期起点）
const START = '2026-09-01';
const START_DATE = new Date(START + 'T12:00:00');
const weekdayOfStart = START_DATE.getDay() === 0 ? 7 : START_DATE.getDay(); // 1-7
function plusDays(n) {
  const d = new Date(START_DATE.getTime());
  d.setDate(d.getDate() + n);
  return d;
}
ok(P.weekNumber(START, START_DATE) === 1, '开学当天为第 1 周');
ok(P.weekNumber(START, plusDays(14)) === 3, '两周后为第 3 周');
ok(P.weekNumber(START, plusDays(7)) === 2, '一周后为第 2 周');
ok(P.weekNumber(START, plusDays(-15)) < 0, '开学两周前为负周');

// weekRuleMatches
ok(P.weekRuleMatches('all', 5) === true, 'all 恒真');
ok(P.weekRuleMatches('odd', 3) && !P.weekRuleMatches('odd', 4), 'odd 奇周');
ok(P.weekRuleMatches('even', 4) && !P.weekRuleMatches('even', 3), 'even 偶周');
ok(P.weekRuleMatches({ cycle: 4, week: 2 }, 6) === true, 'cycle4 第2周 → 周6命中');
ok(P.weekRuleMatches({ cycle: 4, week: 2 }, 5) === false, 'cycle4 第2周 → 周5不命中');
ok(P.weekRuleMatches([2, 7], 7) === true && P.weekRuleMatches([2, 7], 3) === false, '绝对周数组');
ok(P.weekRuleMatches('odd', -1) === false, '负周不参与单双周');

// buildDayEntries：周规则 + 特异性合并 + overrides（日期全部由 START 推导）
const data = {
  meta: { name: 't', startDate: START },
  days: [
    { dayOfWeek: weekdayOfStart, weeks: 'all', entries: [{ type: 'study', start: '09:00', end: '10:00', title: '常规' }] },
    { dayOfWeek: weekdayOfStart, weeks: 'odd', entries: [{ type: 'study', start: '09:00', end: '10:00', title: '单周加练' }] },
    { dayOfWeek: (weekdayOfStart % 7) + 1, weeks: 'all', entries: [{ type: 'study', start: '19:00', end: '20:00', title: '另一天' }] }
  ],
  overrides: {}
};
const ovDate1 = plusDays(28); // 第 5 周（奇），同 weekday → 命中单周规则
const ovKey1 = P.dateKey(ovDate1);
data.overrides[ovKey1] = { entries: [{ type: 'activity', start: '10:00', end: '11:00', title: '假期' }] };
const ovDate2 = plusDays(29); // 次日映射到无规则的 weekday → 无命中
const ovKey2 = P.dateKey(ovDate2);
data.overrides[ovKey2] = { dayOfWeek: ((weekdayOfStart + 1) % 7) + 1 };

// 第 1 周（奇）：特异规则覆盖常规
const w1 = P.buildDayEntries(data, START_DATE);
ok(w1.week === 1 && w1.entries.length === 1 && w1.entries[0].title === '单周加练', '第 1 周：特异性规则胜出');
// 第 3 周（奇）：同样命中
const w3 = P.buildDayEntries(data, plusDays(14));
ok(w3.week === 3 && w3.entries[0].title === '单周加练', '第 3 周仍命中单周规则');
// 第 2 周（偶）：只剩常规规则
const w2 = P.buildDayEntries(data, plusDays(7));
ok(w2.week === 2 && w2.entries.length === 1 && w2.entries[0].title === '常规', '第 2 周仅常规规则命中');
// override 整日替换
const ov1 = P.buildDayEntries(data, ovDate1);
ok(ov1.fromOverride === true && ov1.entries[0].title === '假期', 'override 整日替换');
// override weekday 映射 → 无命中
const ov2 = P.buildDayEntries(data, ovDate2);
ok(ov2.fromOverride === false && ov2.entries.length === 0, 'override dayOfWeek 映射生效');

// computeStatus
const entries = [
  { type: 'study', start: '19:00', end: '20:00', title: 'A' },
  { type: 'break', start: '20:00', end: '20:15', title: 'B' },
  { type: 'study', start: '20:15', end: '21:30', title: 'C' }
];
ok(P.computeStatus(entries, 19 * 60 + 30, 10).state === 'study' &&
   P.computeStatus(entries, 19 * 60 + 30, 10).remainingMinutes === 30, '进行中：study 剩 30 分钟');
ok(P.computeStatus(entries, 19 * 60 - 5, 10).state === 'preparation' &&
   P.computeStatus(entries, 19 * 60 - 5, 10).next.title === 'A', '课前 5 分钟 → preparation');
ok(P.computeStatus(entries, 19 * 60 + 55, 10).state === 'study', '19:55 仍属 A 时段');
ok(P.computeStatus(entries, 20 * 60 + 5, 10).state === 'break', '休息时段');
ok(P.computeStatus(entries, 15 * 60, 10).state === 'free' &&
   P.computeStatus(entries, 15 * 60, 10).next.title === 'A', '空闲且给出下一项');
ok(P.computeStatus(entries, 22 * 60, 10).state === 'free' &&
   P.computeStatus(entries, 22 * 60, 10).next === null, '当日结束 → free 无下一项');

// validate
ok(S.validate(data) === null, 'validate：合法数据通过');
ok(typeof S.validate({ meta: {} }) === 'string', 'validate：缺 days 报错');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
