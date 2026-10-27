#!/usr/bin/env node
/**
 * check-schedule.mjs — 作息表数据校验（v1.5 / T6 门禁）
 * 校验 1.2/data/schedules/*.json 的 schema：时间格式、时段类型、周规则、overrides。
 * 退出码：0 = 全部通过；1 = 存在失败。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, '1.2', 'data', 'schedules');

const HM = /^([01]\d|2[0-3]):[0-5]\d$/;
const TYPES = new Set(['study', 'break', 'activity']);
let fail = 0;

function ruleErr(weeks) {
  if (weeks == null || weeks === 'all' || weeks === 'odd' || weeks === 'even') return null;
  if (Array.isArray(weeks)) return weeks.every((n) => Number.isInteger(n)) ? null : '周序号数组须为整数';
  if (weeks && typeof weeks === 'object' && Number.isInteger(weeks.cycle) && weeks.cycle >= 2) {
    return (weeks.week == null || (Number.isInteger(weeks.week) && weeks.week >= 1 && weeks.week <= weeks.cycle))
      ? null : 'cycle.week 越界';
  }
  return 'weeks 不合法';
}

let files = [];
try { files = readdirSync(DIR).filter((f) => f.endsWith('.json')); } catch { files = []; }
if (!files.length) {
  console.log('  [check-schedule] 无作息表数据文件（目录为空），跳过');
  process.exit(0);
}

for (const f of files) {
  const rel = `data/schedules/${f}`;
  let data;
  try { data = JSON.parse(readFileSync(join(DIR, f), 'utf8')); }
  catch (e) { console.error(`  ✗ ${rel}: JSON 解析失败 ${e.message}`); fail++; continue; }

  const errs = [];
  if (!data.meta || typeof data.meta.name !== 'string') errs.push('meta.name 缺失');
  if (!Array.isArray(data.days)) errs.push('days 必须是数组');
  (data.days || []).forEach((r, i) => {
    if (!(r.dayOfWeek >= 1 && r.dayOfWeek <= 7)) errs.push(`days[${i}].dayOfWeek 越界`);
    const wErr = ruleErr(r.weeks);
    if (wErr) errs.push(`days[${i}].weeks: ${wErr}`);
    (r.entries || []).forEach((e, j) => {
      if (!TYPES.has(e.type)) errs.push(`days[${i}].entries[${j}].type 不合法: ${e.type}`);
      if (!HM.test(e.start) || !HM.test(e.end)) errs.push(`days[${i}].entries[${j}] 时间格式须为 HH:MM`);
      else if (e.start >= e.end) errs.push(`days[${i}].entries[${j}] start 必须早于 end`);
      if (e.title != null && typeof e.title !== 'string') errs.push(`days[${i}].entries[${j}].title 须为字符串`);
    });
  });
  if (data.overrides) {
    for (const [k, v] of Object.entries(data.overrides)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) errs.push(`overrides 键须为 YYYY-MM-DD: ${k}`);
      else if (!v || (!Array.isArray(v.entries) && !v.dayOfWeek)) errs.push(`overrides[${k}] 需含 entries 或 dayOfWeek`);
    }
  }

  if (errs.length) {
    fail++;
    errs.slice(0, 8).forEach((e) => console.error(`  ✗ ${rel}: ${e}`));
    if (errs.length > 8) console.error(`  ... 以及另外 ${errs.length - 8} 条`);
  } else {
    console.log(`  ✓ ${rel}（${(data.days || []).length} 条日规则）`);
  }
}

console.log(fail === 0 ? 'check-schedule: PASS' : `check-schedule: FAIL（${fail} 个文件）`);
process.exit(fail ? 1 : 0);
