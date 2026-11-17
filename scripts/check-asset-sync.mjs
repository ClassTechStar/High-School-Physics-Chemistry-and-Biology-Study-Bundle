#!/usr/bin/env node
/**
 * check-asset-sync.mjs — 安卓资产同步门禁（v1.8 同步演练版）
 *
 * v1.7.1 时代 android/app/assets/web/ 整份副本入库，本脚本直接比对两目录；
 * 但副本靠「记得重跑 build-apk.sh 第 0 步」人工保持一致，门禁只能报警不能防事故。
 * v1.8 起资产副本不再入库（见 .gitignore），本门禁改为「同步演练」：
 *   按 build-apk.sh 第 0 步的语义把 1.2/ 同步到临时目录，再逐文件哈希比对，
 *   保证同步机制本身产出字节一致的拷贝 —— CI 无需 Android SDK 即可验证。
 * 另外：若本地存在 android/app/assets/web/（跑过 build-apk.sh 的开发机），
 * 则一并做真实比对并输出提示 —— 但副本是构建产物（build-apk.sh 第 0 步必先
 * 重新同步），Web 侧继续开发后副本暂时陈旧属正常状态，故仅告警不红灯。
 * 退出码：0 = 同步演练通过；1 = 演练失败（同步机制有 bug）。
 */
import { createHash } from 'node:crypto';
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
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

function diff(src, dst) {
  const missing = [];   // src 有、dst 无
  const extra = [];     // dst 有、src 无
  const changed = [];   // 双方都有但内容不同
  for (const [rel, hash] of src) {
    if (!dst.has(rel)) missing.push(rel);
    else if (dst.get(rel) !== hash) changed.push(rel);
  }
  for (const rel of dst.keys()) if (!src.has(rel)) extra.push(rel);
  return { missing, extra, changed };
}

function report(label, { missing, extra, changed }, hint) {
  let fail = 0;
  if (missing.length) { fail = 1; console.error(`  ✗ ${label} 缺文件 ${missing.length} 个: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ' …' : ''}`); }
  if (changed.length) { fail = 1; console.error(`  ✗ ${label} 内容漂移 ${changed.length} 个: ${changed.slice(0, 5).join(', ')}${changed.length > 5 ? ' …' : ''}`); }
  if (extra.length) { fail = 1; console.error(`  ✗ ${label} 多出文件 ${extra.length} 个: ${extra.slice(0, 5).join(', ')}${extra.length > 5 ? ' …' : ''}`); }
  if (fail && hint) console.error(hint);
  return fail;
}

const src = walk(SRC);
let fail = 0;

// ---------- 同步演练：按 build-apk.sh 第 0 步语义拷贝到临时目录再比对 ----------
const tmp = mkdtempSync(join(tmpdir(), 'hspcb-asset-drill-'));
try {
  // 与 build-apk.sh 一致：rm -rf 目标后 cp -r 1.2/. → 目标
  cpSync(SRC, tmp, { recursive: true });
  const drilled = walk(tmp);
  fail |= report('同步演练（1.2/ → 临时目录）', diff(src, drilled),
    'check-asset-sync: 演练失败说明同步机制本身有 bug（build-apk.sh 第 0 步与本脚本拷贝语义不一致）');
  if (!fail) console.log(`  ✓ 同步演练通过：${src.size} 个文件字节一致`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

// ---------- 本地真实比对（仅开发机存在 assets/web/ 副本时，仅告警） ----------
try {
  statSync(DST);
  const dst = walk(DST);
  const drift = diff(src, dst);
  const stale = drift.missing.length + drift.changed.length + drift.extra.length;
  if (stale === 0) {
    console.log(`  ✓ android/app/assets/web 与 1.2/ 完全同步（${src.size} 个文件）`);
  } else {
    console.warn(`  ⚠ android/app/assets/web 已陈旧（${stale} 个文件漂移）—— 构建时 build-apk.sh 第 0 步会自动重新同步，仅提示不拦截`);
  }
} catch {
  console.log('  ✓ android/app/assets/web 未生成（正常，构建时由 build-apk.sh 第 0 步同步）');
}

process.exit(fail);
