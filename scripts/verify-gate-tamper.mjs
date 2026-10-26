#!/usr/bin/env node
/**
 * verify-gate-tamper.mjs — 门禁反向验证（一次性执行，留档审计）
 *
 * 对 check-theme-tokens.mjs 的六项断言逐一构造「应被抓住」的篡改副本，
 * 确认门禁不是永远通过的摆设。全部用例必须 FAIL（退出码非 0）才算有效。
 * v1.4 结项时执行结果：6/6 全部抓住（见 DEV-PLAN 执行记录）。
 */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, '1.2/css/theme-dark.css');
const GATE = resolve(ROOT, 'scripts/check-theme-tokens.mjs');
const css = readFileSync(SRC, 'utf8');
const NL = css.includes('\r\n') ? '\r\n' : '\n';

const cases = [
  {
    name: 'T1 声明体注入 hex',
    mutate: (s) => s.replace('[data-theme="dark"] hr {', '[data-theme="dark"] hr { border-color: #123456;'),
    expect: 'T1',
  },
  {
    name: 'T2 补丁层新增 !important（越过 30 上限）',
    mutate: (s) => s + NL + '[data-theme="dark"] .tamper-a { color: red !important; }' + NL
      + '[data-theme="dark"] .tamper-b { color: red !important; }' + NL
      + '[data-theme="dark"] .tamper-c { color: red !important; }' + NL
      + '[data-theme="dark"] .tamper-d { color: red !important; }' + NL
      + '[data-theme="dark"] .tamper-e { color: red !important; }' + NL
      + '[data-theme="dark"] .tamper-f { color: red !important; }' + NL
      + '[data-theme="dark"] .tamper-g { color: red !important; }' + NL
      + '[data-theme="dark"] .tamper-h { color: red !important; }' + NL
      + '[data-theme="dark"] .tamper-i { color: red !important; }' + NL,
    expect: 'T2',
  },
  {
    name: 'T3 重映射层被侵蚀（去掉一个 !important）',
    mutate: (s) => s.replace('background-color: var(--dm-surface-1) !important;',
      'background-color: var(--dm-surface-1);'),
    expect: 'T3',
  },
  {
    name: 'T4 令牌定义被删',
    mutate: (s) => s.replace('    --dm-surface-2: #334155;', ''),
    expect: 'T4',
  },
  {
    name: 'T5 令牌自引用定义',
    mutate: (s) => s.replace('[data-theme="dark"] {', '[data-theme="dark"] {' + NL + '    --dm-tamper: var(--dm-tamper);'),
    expect: 'T5',
  },
  {
    name: 'T6 悬空 var() 引用',
    mutate: (s) => s.replace('[data-theme="dark"] hr {', '[data-theme="dark"] hr { color: var(--dm-does-not-exist);'),
    expect: 'T6',
  },
];

const dir = mkdtempSync(resolve(tmpdir(), 't33-tamper-'));
let allGood = true;

for (const c of cases) {
  const f = resolve(dir, `case-${c.expect}.css`);
  writeFileSync(f, c.mutate(css));
  let failed = false;
  let out = '';
  try {
    out = execFileSync(process.execPath, [GATE, f], { encoding: 'utf8', stdio: 'pipe' });
  } catch (e) {
    failed = true;
    out = (e.stdout || '') + (e.stderr || '');
  }
  const caught = failed && out.includes('✗');
  const target = out.includes(`✗`) && new RegExp(`${c.expect}\\b`).test(out);
  console.log(`${caught && target ? '✅' : '❌'} ${c.name}`);
  if (!caught || !target) {
    allGood = false;
    console.log('    门禁输出片段: ' + out.split('\n').filter((l) => l.includes('✗')).join(' | ').slice(0, 300));
  }
}

console.log(allGood ? '\n全部篡改用例均被门禁抓住（退出码非 0 + 命中目标断言）' : '\n存在未被抓住的篡改，门禁有漏洞');
process.exit(allGood ? 0 : 1);
