/**
 * test-update-check.mjs — update-check.js 逻辑单测（v1.8.1）
 * stub XMLHttpRequest 按 URL 路由 fixture，验证：多源回退顺序、Release asset
 * 选择（多附件时优先文件名含 tag 版本串且最后上传者）、版本比较边界。
 * 不发起真实网络请求。
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

/** 按 URL 前缀返回的 fixture 表：{ prefix, body|status } */
function boot(fixtures) {
  const routes = fixtures.map((f) => ({ ...f, prefix: f.prefix }));
  const classList = { add() {}, remove() {}, contains: () => false };
  const documentStub = {
    readyState: 'complete',
    addEventListener() {},
    documentElement: { getAttribute: () => '1.8.1', classList: classList, setAttribute() {} },
    body: { appendChild() {} },
    createElement: () => ({ setAttribute() {}, appendChild() {}, style: {}, addEventListener() {} }),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
  };
  const sandbox = {
    console,
    window: {},
    document: documentStub,
    Date, Math, JSON, isNaN, parseInt, parseFloat, Promise,
    setTimeout, clearTimeout, setInterval, clearInterval,
    CustomEvent: class { constructor(type, opts) { this.type = type; this.detail = opts && opts.detail; } },
    XMLHttpRequest: class {
      constructor() { this.status = 0; this.responseText = ''; this.timeout = 0; }
      open(m, url) { this._url = url; }
      send() {
        const hit = routes.find((r) => this._url.indexOf(r.prefix) === 0);
        if (!hit || hit.status) {
          this.status = (hit && hit.status) || 404;
          setTimeout(() => this.onerror && this.onerror(), 0);
        } else {
          this.status = 200;
          this.responseText = typeof hit.body === 'string' ? hit.body : JSON.stringify(hit.body);
          setTimeout(() => this.onload && this.onload(), 0);
        }
      }
    },
    location: { search: '' },
    navigator: {},
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(join(APP, 'js', 'update-check.js'), 'utf8'), sandbox, { filename: 'update-check.js' });
  return sandbox.window.HSPCBUpdate;
}

const REL = (tag, assets) => ({
  tag_name: tag,
  body: 'notes ' + tag,
  html_url: 'https://github.com/x/y/releases/tag/' + tag,
  assets: (assets || []).map((n) => ({ name: n, browser_download_url: 'https://dl/' + n })),
});

// ---- isNewer 边界 ----
{
  const U = boot([{ prefix: 'https://api.github.com', body: REL('v1.3') }]);
  ok(U.isNewer('v1.9.0', '1.8.1') === true, 'isNewer: 1.9.0 > 1.8.1');
  ok(U.isNewer('1.8.2-beta', '1.8.1') === true, 'isNewer: 1.8.2-beta > 1.8.1（后缀忽略）');
  ok(U.isNewer('v1.3', '1.8.1') === false, 'isNewer: 远端 v1.3 < 本地 1.8.1');
  ok(U.isNewer('1.8.1', '1.8.1') === false, 'isNewer: 相等不算更新');
}

// ---- 多源回退：GH API 命中（当前真实状态：latest=v1.3 无附件） ----
{
  const U = boot([{ prefix: 'https://api.github.com', body: REL('v1.3') }]);
  const r = await U.check(false);
  ok(r.ok !== false && r.version === 'v1.3' && r.source === 'github-release', '源1 GH API 命中（latest=v1.3）');
  ok(r.hasUpdate === false, '本地 1.8.1 > 远端 v1.3：无更新');
}

// ---- GH API 404 → Gitee 404 → GH raw 清单兜底 ----
{
  const U = boot([
    { prefix: 'https://api.github.com', status: 404 },
    { prefix: 'https://gitee.com/api', status: 404 },
    { prefix: 'https://raw.githubusercontent.com', body: { version: '1.8.1', notes: 'manifest', apk: 'HSPCB-v1.8.1-debug.apk' } },
  ]);
  const r = await U.check(false);
  ok(r.source === 'github-manifest' && r.version === '1.8.1', '回退到 GH raw 清单');
  ok(r.apkUrl === 'https://github.com/x/y/releases/download/v1.8.1/HSPCB-v1.8.1-debug.apk'
     || (r.apkUrl || '').indexOf('HSPCB-v1.8.1-debug.apk') >= 0, 'manifest 的 apk 拼接下载地址');
  ok(r.hasUpdate === false, '1.8.1 == 1.8.1 无更新');
}

// ---- 全源失败 ----
{
  const U = boot([
    { prefix: 'https://api.github.com', status: 404 },
    { prefix: 'https://gitee.com', status: 404 },
    { prefix: 'https://raw.githubusercontent.com', status: 404 },
  ]);
  const r = await U.check(false);
  ok(r.hasUpdate === false && (r.error || r.source === undefined || r.ok === false), '全源失败返回失败结果');
}

// ---- asset 选择：多附件优先匹配 tag 版本串 ----
{
  const U = boot([{ prefix: 'https://api.github.com', body: REL('v1.8.1', ['HSPCB-v1.8.0-debug.apk', 'HSPCB-v1.8.1-debug.apk']) }]);
  const r = await U.check(false);
  ok((r.apkUrl || '').indexOf('HSPCB-v1.8.1-debug.apk') >= 0, '多附件：选含 tag 版本串的 APK');
}
{
  // beta 场景：tag=v1.8.2-beta，CI 附件名是旧版本串、人工附件名含 1.8.2-beta
  const U = boot([{ prefix: 'https://api.github.com', body: REL('v1.8.2-beta', ['HSPCB-v1.8.1-debug.apk', 'HSPCB-v1.8.2-beta.apk']) }]);
  const r = await U.check(false);
  ok((r.apkUrl || '').indexOf('HSPCB-v1.8.2-beta.apk') >= 0, 'beta 场景：选含 1.8.2-beta 的附件');
  ok(r.hasUpdate === true, 'beta 1.8.2 > 本地 1.8.1：有更新');
}

// ---- Gitee API 命中（GH 404） ----
{
  const U = boot([
    { prefix: 'https://api.github.com', status: 404 },
    { prefix: 'https://gitee.com/api', body: REL('v1.8.1') },
    { prefix: 'https://raw.githubusercontent.com', status: 404 },
  ]);
  const r = await U.check(false);
  ok(r.source === 'gitee-release' && r.version === 'v1.8.1', '源2 Gitee API 回退命中');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
