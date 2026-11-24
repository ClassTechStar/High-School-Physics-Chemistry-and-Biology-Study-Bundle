#!/usr/bin/env node
/**
 * test-esm-module.mjs —— 首个 ES Module 单测（v1.9 §3.2-B）
 *
 * 仓库根 package.json 为 "type": "module"，1.2/js/modules/*.js 可被 Node
 * 直接按 ESM 解析 —— 本测试同时证明该文件不依赖任何浏览器专属全局。
 */
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, '1.2', 'js', 'modules', 'time-format.js');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.error(`  ✗ ${name}`); }
}

const mod = await import(pathToFileURL(SRC).href);

console.log('=== time-format.js（ESM）===');
ok(typeof mod.formatStamp === 'function', '导出 formatStamp 函数');
ok(mod.formatStamp('2026-11-25T10:05:00') === '2026-11-25 10:05', '格式化本地时间串');
ok(mod.formatStamp('2026-01-02T03:04:05') === '2026-01-02 03:04', '个位数月/日/时/分补零');
ok(mod.formatStamp('') === '', '空输入返回空串');
ok(mod.formatStamp(null) === '', 'null 输入返回空串');
ok(mod.formatStamp('not-a-date') === 'not-a-date', '非法输入原样返回（不抛错）');
const d = new Date(2026, 10, 25, 9, 8);
ok(mod.formatStamp(d) === '2026-11-25 09:08', 'Date 实例输入');

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
