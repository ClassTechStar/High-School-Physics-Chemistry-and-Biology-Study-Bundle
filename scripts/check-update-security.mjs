#!/usr/bin/env node
/**
 * check-update-security.mjs — 更新链安全门禁（v1.9 P0）
 *
 * 背景：安卓自动更新曾在无任何完整性校验的情况下下载 APK 并唤起安装器
 * （通道劫持 = 任意 APK 静默覆盖安装）。修复由三部分组成，缺一即失效：
 *   1. 发布侧：Release 必须同时产出 checksums.sha256（与 APK 同源）；
 *   2. 客户端：下载后必须校验 SHA-256，不匹配/缺期望值一律拒绝安装；
 *   3. 通道侧：Gitee 整仓镜像默认不参与检查链，仅设置里显式开启。
 * 本门禁对这三件事做静态断言，防止后续改动把安全校验"顺手删掉"。
 * 退出码：0 = 通过；1 = 存在缺失。
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓', msg); }
  else { fail++; console.error('  ✗', msg); }
}

// ---------- 1. 发布侧：checksums.sha256 与 APK 同源 ----------
const wf = read('.github/workflows/apk-release.yml');
ok(/sha256sum \*\.apk > checksums\.sha256/.test(wf), 'CI 发布时生成 checksums.sha256');
ok(/checksums\.sha256/.test(wf) && /gh release upload[\s\S]{0,200}checksums\.sha256/.test(wf),
  'CI 将 checksums.sha256 与 APK 一起上传 Release');

const py = read('scripts/publish-release.py');
ok(/def cmd_checksums/.test(py), 'publish-release.py 提供 checksums 子命令');
ok(/hashlib\.sha256/.test(py), 'publish-release.py 使用 SHA-256 计算摘要');
ok(/def cmd_publish/.test(py) && /cmd_checksums\(apk_path, tmp\)/.test(py),
  'publish 子命令一步完成 create + upload APK + upload checksums');

// ---------- 2. 客户端：下载后强制校验 ----------
const um = read('android/app/java/com/classtechstar/hspcb/UpdateManager.java');
ok(/MessageDigest\.getInstance\("SHA-256"\)/.test(um), 'UpdateManager 下载中计算 SHA-256');
ok(/constantTimeEquals/.test(um), 'UpdateManager 使用常量时间比较哈希');
ok(/校验失败[\s\S]{0,80}已删除下载文件/.test(um), '哈希不匹配时删除文件并提示');
ok(/expectedSha == null \|\| expectedSha\.trim\(\)\.isEmpty\(\)/.test(um),
  '缺少期望哈希时拒绝下载安装（安全默认）');
ok(/checksums\.sha256/.test(um), 'UpdateManager 从 Release 附件读取校验清单');
// 关键反向断言：安装动作必须发生在校验之后
const verifyIdx = um.indexOf('constantTimeEquals(actual, expected)');
const installIdx = um.indexOf('install(activity, out);');
ok(verifyIdx > 0 && installIdx > verifyIdx, '安装调用位于哈希校验之后（顺序不可颠倒）');

// ---------- 3. 通道：Gitee 默认关闭 ----------
const uc = read('1.2/js/update-check.js');
ok(/function allowGitee\(\)/.test(uc), 'update-check.js 提供 Gitee 开关判定');
ok(/if \(allowGitee\(\)\)/.test(uc), 'Gitee 源仅在显式开启时参与检查链');
ok(/jsdelivr/.test(uc), '默认链含 jsDelivr 镜像回退');
ok(/s\.update\.allowGitee/.test(uc), 'Gitee 开关持久化到设置');
const giteeDefaultPos = uc.indexOf('var chain = Promise.resolve()');
const giteeGatePos = uc.indexOf('if (allowGitee())');
ok(giteeDefaultPos > 0 && giteeGatePos > giteeDefaultPos,
  '默认链构造先于 Gitee 追加（即默认不含 Gitee）');

// ---------- 4. CSP 放行镜像域 ----------
const html = read('1.2/index.html');
ok(/connect-src[^;]*cdn\.jsdelivr\.net/.test(html), 'CSP connect-src 放行 cdn.jsdelivr.net');

console.log(`\nupdate-security 门禁: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
