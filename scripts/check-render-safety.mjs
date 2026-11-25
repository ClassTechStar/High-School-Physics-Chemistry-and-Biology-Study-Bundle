#!/usr/bin/env node
/**
 * check-render-safety.mjs — 用户数据渲染安全门禁（v1.10 T18）
 *
 * 背景：CSP 挡不住「应用自己把用户输入拼进 innerHTML」造成的 DOM XSS。
 * 存量视图层有大量字符串模板，全量迁移不现实（§3.2-C 为长期项），
 * 本门禁只守一条硬线：**innerHTML / insertAdjacentHTML 的拼接里不得出现用户数据变量**。
 *
 * 判定：
 *   · 命中 = 同一行出现 innerHTML/insertAdjacentHTML 赋值，且拼接内容含
 *     userAnswer / userNote / userText / remark / comment / nickname / displayName / note 等字段；
 *   · 行尾注释含 `render-safety:ok` 视为已人工审计（必须写明理由）；
 *   · 纯静态文案（不含上述变量）不报。
 *
 * 用法：node scripts/check-render-safety.mjs [--json]
 * 退出码：0 = 通过；1 = 存在未审计的用户数据拼接。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const JS_DIR = join(ROOT, '1.2', 'js');

const USER_FIELDS = /\b(userAnswer|userNote|userText|userInput|remark|comments?|nickname|displayName|noteText|note)\b/i;
const SINK = /(innerHTML\s*=|insertAdjacentHTML\s*\()/;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.js')) out.push(p);
  }
  return out;
}

const files = walk(JS_DIR);
const violations = [];
const exempted = [];
let scannedLines = 0;

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    scannedLines++;
    if (!SINK.test(line)) return;
    const code = line.replace(/^\s*\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '');
    if (!code.trim()) return; // 纯注释
    if (!USER_FIELDS.test(code)) return;
    const rel = relative(ROOT, file) + ':' + (i + 1);
    if (/render-safety:ok/.test(line)) exempted.push(rel);
    else violations.push(rel + '  ' + line.trim().slice(0, 140));
  });
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ files: files.length, scannedLines, violations, exempted }, null, 2));
} else {
  console.log(`  扫描 ${files.length} 个 JS 文件 / ${scannedLines} 行`);
  if (exempted.length) console.log(`  已审计豁免 ${exempted.length} 处: ${exempted.join(', ')}`);
  if (violations.length) {
    for (const v of violations) console.error(`  ✗ ${v}`);
    console.error(`\nrender-safety: ${violations.length} 处用户数据拼接 innerHTML。改用 createElement + textContent，`);
    console.error('或经审计后在行尾加 `render-safety:ok` 并写明理由。');
    process.exit(1);
  }
  console.log('  ✓ 无「用户数据 + innerHTML」拼接');
}
