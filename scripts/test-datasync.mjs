/**
 * test-datasync.mjs — 数据快照（data-sync.js）逻辑单测（v1.9 §3.3）
 * 覆盖：快照构建、结构校验（app/版本/store）、merge 与 replace 语义、
 * 凭据配置读写。不发起网络（WebDAV 走 fetch，另由 e2e/手工验证）。
 */
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, '1.2');

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓', msg); }
  else { fail++; console.error('  ✗', msg); }
}

function boot(initialStore) {
  const mem = Object.assign({}, initialStore || {});
  let purged = 0;
  const HSPCBStore = {
    get: (k) => (k in mem ? mem[k] : null),
    set: (k, v) => { mem[k] = String(v); return true; },
    dump: () => Object.assign({}, mem),
    restore: (obj) => {
      let n = 0;
      for (const k of Object.keys(obj)) {
        if (typeof obj[k] === 'string') { mem[k] = obj[k]; n++; }
      }
      return n;
    },
    purgeAll: () => { purged++; for (const k of Object.keys(mem)) delete mem[k]; },
    _mem: mem,
    _purged: () => purged,
  };
  const documentStub = {
    readyState: 'complete',
    addEventListener() {},
    documentElement: { getAttribute: () => '1.9.0' },
    createElement: () => ({ className: '', style: {}, appendChild() {}, setAttribute() {}, click() {} }),
    body: { appendChild() {}, removeChild() {} },
    querySelector: () => null,
    querySelectorAll: () => [],
  };
  const sandbox = {
    console, window: {}, document: documentStub,
    Date, Math, JSON, Promise, Blob: class {}, URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} },
    FileReader: class {},
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    fetch: () => Promise.reject(new Error('no network in test')),
    setTimeout, clearTimeout,
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.HSPCBStore = HSPCBStore;
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(join(APP, 'js', 'data-sync.js'), 'utf8'), sandbox, { filename: 'data-sync.js' });
  return { DS: sandbox.window.HSPCBDatasync, store: HSPCBStore };
}

// 构建快照
{
  const { DS } = boot({ progress: '{"a":1}', 'backup.0': '{"b":2}' });
  const b = DS.buildBundle();
  ok(b.app === 'hspcb-datasync' && b.version === 1, '快照带应用标识与版本');
  ok(b.store.progress === '{"a":1}' && b.store['backup.0'] === '{"b":2}', '快照包含存储全量键值');
  ok(typeof b.exportedAt === 'string' && /^\d{4}-/.test(b.exportedAt), '快照带导出时间戳');
}

// 校验
{
  const { DS } = boot();
  ok(DS.parseBundle('not json').ok === false, '非法 JSON 被拒');
  ok(DS.parseBundle(JSON.stringify({ app: 'other', version: 1, store: {} })).ok === false, '异应用快照被拒');
  ok(DS.parseBundle(JSON.stringify({ app: 'hspcb-datasync', version: 99, store: {} })).ok === false, '更高版本快照被拒');
  ok(DS.parseBundle(JSON.stringify({ app: 'hspcb-datasync', version: 1 })).ok === false, '缺 store 被拒');
  ok(DS.parseBundle(JSON.stringify({ app: 'hspcb-datasync', version: 1, store: { k: 'v' } })).ok === true, '合法快照通过');
}

// merge / replace
{
  const { DS, store } = boot({ a: 'old', b: 'keep' });
  const r = DS.applyBundle({ app: 'hspcb-datasync', version: 1, store: { a: 'new' } }, 'merge');
  ok(r.ok && r.written === 1, 'merge 写入 1 项');
  ok(store._mem.a === 'new' && store._mem.b === 'keep', 'merge 只覆盖同名键，保留其余数据');
  ok(store._purged() === 0, 'merge 不清空存储');
}
{
  const { DS, store } = boot({ a: 'old', b: 'old2' });
  const r = DS.applyBundle({ app: 'hspcb-datasync', version: 1, store: { a: 'new' } }, 'replace');
  ok(r.ok && r.written === 1, 'replace 写入 1 项');
  ok(store._purged() === 1, 'replace 先清空命名空间');
  ok(store._mem.a === 'new' && !('b' in store._mem), 'replace 后仅保留快照内数据');
}

// 配置读写（密码只存本机）
{
  const { DS } = boot();
  const cfg = DS.saveConfig({ url: 'https://dav.example.com/dav/', user: 'u', pass: 'p', file: '/x.json' });
  ok(cfg.url === 'https://dav.example.com/dav/' && cfg.file === 'x.json', '配置保存并规范化文件名');
  const back = DS.getConfig();
  ok(back.user === 'u' && back.pass === 'p', '配置可读回');
  const def = DS.getConfig();
  ok(typeof def.file === 'string' && def.file.length > 0, '默认远端文件名存在');
}

console.log(`\ndatasync 单测: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
