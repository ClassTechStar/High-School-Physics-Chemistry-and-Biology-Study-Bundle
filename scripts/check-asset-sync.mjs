#!/usr/bin/env node
/**
 * check-asset-sync.mjs — 安卓资产同步门禁（v1.7.1）
 * 对比 1.2/ 与 android/app/assets/web/ 的文件清单与内容哈希，防止 Web 更新后
 * 忘记同步安卓端拷贝导致 APK 内容陈旧。例外：本脚本自身、.gitignore 不参与。
 * 退出码：0 = 一致；1 = 存在漂移。
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, '1.2');
const DST = join(ROOT, 'android', 'app', 'assets', 'web');

function walk(dir, base = dir, out = new Map()) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, base, out);
    else {
      const rel = relative(base, full).split(sep).join('/');
      out.set(rel, createHash('md5').update(readFileSync(full)).digest('hex'));
    }
  }
  return out;
}

const src = walk(SRC);
const dst = walk(DST);

const missing = [];   // 1.2 有、assets 无
const extra = [];     // assets 有、1.2 无
const changed = [];   // 双方都有但内容不同

for (const [rel, hash] of src) {
  if (!dst.has(rel)) missing.push(rel);
  else if (dst.get(rel) !== hash) changed.push(rel);
}
for (const rel of dst.keys()) if (!src.has(rel)) extra.push(rel);

let fail = 0;
if (missing.length) { fail = 1; console.error(`  ✗ 安卓资产缺文件 ${missing.length} 个: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ' …' : ''}`); }
if (changed.length) { fail = 1; console.error(`  ✗ 安卓资产内容漂移 ${changed.length} 个: ${changed.slice(0, 5).join(', ')}${changed.length > 5 ? ' …' : ''}`); }
if (extra.length) { fail = 1; console.error(`  ✗ 安卓资产多出文件 ${extra.length} 个: ${extra.slice(0, 5).join(', ')}${extra.length > 5 ? ' …' : ''}`); }

console.log(fail === 0
  ? `  ✓ android/app/assets/web 与 1.2/ 完全同步（${src.size} 个文件）`
  : 'check-asset-sync: 修复方式 = 重跑 bash android/build-apk.sh（第 0 步会重新同步）');
process.exit(fail);
