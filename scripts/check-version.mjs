#!/usr/bin/env node
/**
 * check-version.mjs — 版本一致性门禁（v1.8）
 * 单一事实源：package.json "version"。此前版本号要在 package.json / PWA manifest /
 * AndroidManifest / Gradle 四处手工同步，靠「记得改」，漏改即发出版本错乱的产物。
 * 本门禁把这些字面量全部锁死：
 *   1. 1.2/manifest.json 的 "version" 字段
 *   2. android/app/AndroidManifest.xml 的 android:versionName
 *   3. android/app/build.gradle.kts 的 versionName
 *   4. 以上三处的 versionCode / versionCode 两两一致
 *   5. CHANGELOG.md 含当前版本条目（改版本必须写日志）
 *   6. 1.2/sw.js CACHE_NAME 形如 hspcb-v<N>，且与文件头注释一致
 *      （缓存版本是独立递增的整数线，不随语义化版本走，只锁格式与自洽）
 * 退出码：0 = 一致；1 = 存在不一致。
 */
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

const problems = [];
const fail = (msg) => problems.push(msg);

// ---------- 1. 单一事实源 ----------
const pkg = JSON.parse(read('package.json'));
const version = pkg.version;
if (!/^\d+\.\d+\.\d+$/.test(version || '')) {
  fail(`package.json version 不是 x.y.z 形式: "${version}"`);
}

// ---------- 2. PWA manifest ----------
try {
  const manifest = JSON.parse(read('1.2/manifest.json'));
  if (manifest.version !== version) {
    fail(`1.2/manifest.json version "${manifest.version}" ≠ package.json "${version}"`);
  }
} catch (e) {
  fail(`1.2/manifest.json 解析失败: ${e.message}`);
}

// ---------- 3/4. 安卓两处版本 + versionCode ----------
const manifestXml = read('android/app/AndroidManifest.xml');
const gradle = read('android/app/build.gradle.kts');

const xmlName = (manifestXml.match(/android:versionName="([^"]+)"/) || [])[1];
const xmlCode = (manifestXml.match(/android:versionCode="(\d+)"/) || [])[1];
const gradleName = (gradle.match(/versionName\s*=\s*"([^"]+)"/) || [])[1];
const gradleCode = (gradle.match(/versionCode\s*=\s*(\d+)/) || [])[1];

if (xmlName !== version) fail(`AndroidManifest versionName "${xmlName}" ≠ package.json "${version}"`);
if (gradleName !== version) fail(`build.gradle.kts versionName "${gradleName}" ≠ package.json "${version}"`);
if (!xmlCode) fail('AndroidManifest 缺少 android:versionCode');
if (!gradleCode) fail('build.gradle.kts 缺少 versionCode');
if (xmlCode && gradleCode && xmlCode !== gradleCode) {
  fail(`versionCode 不一致: AndroidManifest ${xmlCode} vs build.gradle.kts ${gradleCode}`);
}

// ---------- 5. CHANGELOG 必须有当前版本条目 ----------
const changelog = read('CHANGELOG.md');
if (!changelog.includes(`v${version}`)) {
  fail(`CHANGELOG.md 找不到 v${version} 条目 —— 改版本必须同步写更新日志`);
}

// ---------- 6. sw.js 缓存版本线 ----------
const sw = read('1.2/sw.js');
const cacheName = (sw.match(/var CACHE_NAME = '([^']+)'/) || [])[1];
const cacheComment = (sw.match(/\/\/ 版本: (hspcb-v\d+)/) || [])[1];
if (!cacheName || !/^hspcb-v\d+$/.test(cacheName)) {
  fail(`1.2/sw.js CACHE_NAME "${cacheName}" 不符合 hspcb-v<N> 形式`);
}
if (cacheComment && cacheName && cacheComment !== cacheName) {
  fail(`1.2/sw.js 头注释版本 "${cacheComment}" 与 CACHE_NAME "${cacheName}" 不一致`);
}

// ---------- 输出 ----------
if (problems.length) {
  for (const p of problems) console.error(`  ✗ ${p}`);
  console.error('check-version: 以 package.json "version" 为准统一各处字面量后重试');
  process.exit(1);
}
console.log(`  ✓ 版本一致：v${version}（manifest / AndroidManifest / Gradle / CHANGELOG 对齐，CACHE_NAME=${cacheName}）`);
