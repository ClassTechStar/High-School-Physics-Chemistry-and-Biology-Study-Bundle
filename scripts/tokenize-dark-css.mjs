/**
 * tokenize-dark-css.mjs — T6: theme-dark.css 硬编码色值令牌化（外观零变化）
 * 将正文中与既有 --dm-* 令牌同值的 hex 替换为 var() 引用；令牌定义行跳过。
 * 运行：node scripts/tokenize-dark-css.mjs [--apply]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const APPLY = process.argv.includes('--apply');
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = resolve(ROOT, '1.2/css/theme-dark.css');

const css = readFileSync(FILE, 'utf8');

// 1. 收集令牌定义: --dm-x: #hex
const tokenDefs = [];
for (const m of css.matchAll(/(--dm-[a-z0-9-]+):\s*(#[0-9a-fA-F]{3,6})\b/g)) {
  tokenDefs.push({ name: m[1], hex: m[2].toLowerCase() });
}
// 同值多令牌时优先使用出现次数语义最明确的（text > surface > border > bg）
const PRIORITY = ['--dm-text', '--dm-text-2', '--dm-text-3', '--dm-surface-1', '--dm-surface-2', '--dm-border-soft', '--dm-border', '--dm-bg'];
const hexToToken = new Map();
for (const t of tokenDefs.sort((a, b) => PRIORITY.indexOf(a.name) - PRIORITY.indexOf(b.name))) {
  if (!hexToToken.has(t.hex)) hexToToken.set(t.hex, t.name);
}

// 2. 逐行替换（跳过令牌定义行与注释头）
const lines = css.split('\n');
let replaced = 0;
const out = lines.map((line) => {
  if (/^\s*--dm-[a-z0-9-]+\s*:/.test(line)) return line; // 定义行不动
  return line.replace(/#[0-9a-fA-F]{6}\b/g, (hex) => {
    const name = hexToToken.get(hex.toLowerCase());
    if (!name) return hex;
    replaced++;
    return `var(${name})`;
  });
});

const result = out.join('\n');
console.log(`令牌定义 ${tokenDefs.length} 个，映射 ${hexToToken.size} 种 hex；替换引用 ${replaced} 处`);
if (APPLY && replaced) {
  writeFileSync(FILE, result);
  console.log('已写入', FILE);
} else {
  console.log('(dry-run，加 --apply 生效)');
}
