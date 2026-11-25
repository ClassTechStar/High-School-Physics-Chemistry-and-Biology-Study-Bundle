/**
 * test-datasync.mjs — 数据快照（data-sync.js）逻辑单测（v1.9 §3.3 / v1.10 T15）
 * 覆盖：快照构建、结构校验、merge/replace/force 语义、键级时间戳冲突检测、
 * 进度主档合并、凭据配置读写、设备标识。不发起网络（WebDAV 走 fetch，另由 e2e/手测）。
 */
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, '1.2');

const NOW = Date.now();
const MIN = 60000;

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓', msg); }
  else { fail++; console.error('  ✗', msg); }
}

function boot(initialStore, opts) {
  opts = opts || {};
  const mem = Object.assign({}, initialStore || {});
  const metaMem = Object.assign({}, opts.meta || {});
  const lsMem = {};
  let purged = 0;
  const progressCalls = [];
  let progressData = opts.progress || null;

  const HSPCBStore = {
    get: (k) => (k in mem ? mem[k] : null),
    set: (k, v) => { mem[k] = String(v); metaMem[k] = Date.now(); return true; },
    dump: () => Object.assign({}, mem),
    metaDump: () => Object.assign({}, metaMem),
    touchMeta: (k, ts) => { metaMem[k] = ts || Date.now(); },
    restore: (obj, meta) => {
      let n = 0;
      for (const k of Object.keys(obj)) {
        if (typeof obj[k] === 'string') {
          mem[k] = obj[k];
          n++;
          if (meta && Number(meta[k]) > 0) metaMem[k] = Number(meta[k]);
        }
      }
      return n;
    },
    purgeAll: () => {
      purged++;
      for (const k of Object.keys(mem)) delete mem[k];
      for (const k of Object.keys(metaMem)) delete metaMem[k];
    },
    _mem: mem,
    _meta: metaMem,
    _purged: () => purged,
  };

  const HSPCBProgress = {
    exportData: () => (progressData ? JSON.parse(JSON.stringify(progressData)) : { meta: {} }),
    importData: (payload, mode) => {
      progressCalls.push({ payload: JSON.parse(JSON.stringify(payload)), mode });
      progressData = JSON.parse(JSON.stringify(payload));
      return { ok: true, mode };
    },
    _calls: progressCalls,
    _data: () => progressData,
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
    localStorage: {
      getItem: (k) => (k in lsMem ? lsMem[k] : null),
      setItem: (k, v) => { lsMem[k] = String(v); },
      removeItem: (k) => { delete lsMem[k]; },
    },
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.HSPCBStore = HSPCBStore;
  sandbox.HSPCBProgress = HSPCBProgress;
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(join(APP, 'js', 'data-sync.js'), 'utf8'), sandbox, { filename: 'data-sync.js' });
  return { DS: sandbox.window.HSPCBDatasync, store: HSPCBStore, progress: HSPCBProgress };
}

/** 构造快照：exportedAt/时间戳都以毫秒时间点传入，便于构造"新旧"关系。 */
function bundle(store, opts) {
  opts = opts || {};
  const b = {
    app: 'hspcb-datasync',
    version: 2,
    store: store || {},
    meta: opts.meta || {},
  };
  if (opts.exportedAt) b.exportedAt = new Date(opts.exportedAt).toISOString();
  if (opts.progress) b.progress = opts.progress;
  if (opts.deviceId) b.deviceId = opts.deviceId;
  return b;
}

// ---------- 构建快照 ----------
{
  const { DS } = boot({ progress: '{"a":1}', 'backup.0': '{"b":2}', 'datasync.config': '{"pass":"secret"}' });
  const b = DS.buildBundle();
  ok(b.app === 'hspcb-datasync' && b.version === 2, '快照带应用标识与版本 2');
  ok(b.store.progress === '{"a":1}' && b.store['backup.0'] === '{"b":2}', '快照包含 Store 全量键值');
  ok(!('datasync.config' in b.store), 'WebDAV 凭据不进入快照（密码不外泄）');
  ok(typeof b.exportedAt === 'string' && /^\d{4}-/.test(b.exportedAt), '快照带导出时间戳');
  ok(typeof b.progress === 'object' && b.progress !== null, '快照包含学习进度主档');
  ok(typeof b.deviceId === 'string' && b.deviceId.indexOf('dev-') === 0, '快照带本机设备标识');
  ok(DS.buildBundle().deviceId === b.deviceId, '设备标识在同一设备上稳定');
}

// ---------- 结构校验 ----------
{
  const { DS } = boot();
  ok(DS.parseBundle('not json').ok === false, '非法 JSON 被拒');
  ok(DS.parseBundle(JSON.stringify({ app: 'other', version: 2, store: {} })).ok === false, '异应用快照被拒');
  ok(DS.parseBundle(JSON.stringify({ app: 'hspcb-datasync', version: 99, store: {} })).ok === false, '更高版本快照被拒');
  ok(DS.parseBundle(JSON.stringify({ app: 'hspcb-datasync', version: 2 })).ok === false, '缺 store 被拒');
  ok(DS.parseBundle(JSON.stringify({ app: 'hspcb-datasync', version: 1, store: { k: 'v' } })).ok === true, 'v1 旧快照仍可解析');
  ok(DS.parseBundle(JSON.stringify({ app: 'hspcb-datasync', version: 2, store: {}, progress: 'x' })).ok === false, 'progress 格式错误被拒');
}

// ---------- merge / replace 基础语义 ----------
{
  const { DS, store } = boot({ a: 'old', b: 'keep' });
  // 双方都无时间戳 → 保持旧行为：导入优先
  const r = DS.applyBundle(bundle({ a: 'new' }), 'merge');
  ok(r.ok && r.written === 1, 'merge 写入 1 项');
  ok(store._mem.a === 'new' && store._mem.b === 'keep', 'merge 只覆盖同名键，保留其余数据');
  ok(store._purged() === 0, 'merge 不清空存储');
}
{
  const { DS, store } = boot({ a: 'old', b: 'old2' });
  const r = DS.applyBundle(bundle({ a: 'new' }), 'replace');
  ok(r.ok && r.written === 1, 'replace 写入 1 项');
  ok(store._purged() === 1, 'replace 先清空命名空间');
  ok(store._mem.a === 'new' && !('b' in store._mem), 'replace 后仅保留快照内数据');
}

// ---------- T15：键级时间戳冲突检测 ----------
{
  const { DS, store } = boot({ a: 'local-new' }, { meta: { a: NOW - 10 * MIN } });
  const r = DS.applyBundle(bundle({ a: 'remote-old' }, { meta: { a: NOW - 60 * MIN }, exportedAt: NOW - 60 * MIN }), 'merge');
  ok(r.ok && r.written === 0, '远端较旧：不写入');
  ok(store._mem.a === 'local-new', '远端较旧：本机数据保持不变');
  ok(r.stale.indexOf('a') >= 0, '远端较旧：键进入 stale 清单');
}
{
  const { DS, store } = boot({ a: 'local-old' }, { meta: { a: NOW - 60 * MIN } });
  const r = DS.applyBundle(bundle({ a: 'remote-new' }, { meta: { a: NOW }, exportedAt: NOW }), 'merge');
  ok(r.ok && r.written === 1 && store._mem.a === 'remote-new', '远端较新：覆盖本机');
  ok(r.stale.length === 0 && r.conflicts.length === 0, '远端较新：无 stale/conflict');
}
{
  const { DS, store } = boot({ a: 'local' }, { meta: { a: NOW - MIN } });
  const r = DS.applyBundle(bundle({ a: 'remote' }, { meta: { a: NOW }, exportedAt: NOW }), 'merge');
  ok(r.written === 0 && store._mem.a === 'local', '5 分钟内冲突：默认保留本机');
  ok(r.conflicts.indexOf('a') >= 0, '5 分钟内冲突：键进入 conflicts 清单');

  const forced = DS.applyBundle(bundle({ a: 'remote' }, { meta: { a: NOW }, exportedAt: NOW }),
    'merge', { forceKeys: ['a'] });
  ok(forced.ok && forced.written === 1 && store._mem.a === 'remote', 'forceKeys：指定键用远端覆盖');
}
{
  const { DS, store } = boot({ a: 'local-new' }, { meta: { a: NOW } });
  const r = DS.applyBundle(bundle({ a: 'legacy' }, { exportedAt: NOW - 2 * 24 * 60 * MIN }), 'merge');
  ok(r.written === 0 && store._mem.a === 'local-new' && r.stale.indexOf('a') >= 0,
    '旧格式快照（无键时间戳）不覆盖本机有明确时间的数据');
}
{
  const { DS } = boot({ a: 'same' }, { meta: { a: NOW } });
  const r = DS.applyBundle(bundle({ a: 'same' }, { meta: { a: NOW } }), 'merge');
  ok(r.written === 0 && r.conflicts.length === 0 && r.stale.length === 0, '值相同不产生冲突');
}

// ---------- T15：学习进度主档 ----------
{
  const { DS, progress } = boot({}, {
    progress: { meta: { updatedAt: new Date(NOW - 60 * MIN).toISOString() }, wrongQuestions: [] }
  });
  const incoming = { meta: { updatedAt: new Date(NOW).toISOString() }, wrongQuestions: [{ id: 'q1' }] };
  const r = DS.applyBundle(bundle({}, { exportedAt: NOW, progress: incoming }), 'merge');
  ok(r.ok && r.progress === 'merged', '远端进度较新：合并进度主档');
  ok(progress._calls.length === 1 && progress._calls[0].mode === 'merge', '进度合并走 HSPCBProgress.importData(merge)');
}
{
  const { DS, progress } = boot({}, {
    progress: { meta: { updatedAt: new Date(NOW).toISOString() }, wrongQuestions: [{ id: 'local' }] }
  });
  const incoming = { meta: { updatedAt: new Date(NOW - 60 * MIN).toISOString() }, wrongQuestions: [] };
  const r = DS.applyBundle(bundle({}, { exportedAt: NOW - 60 * MIN, progress: incoming }), 'merge');
  ok(r.progress === 'skipped' && r.stale.indexOf('progress') >= 0, '远端进度较旧：跳过并标记 stale');
  ok(progress._calls.length === 0, '远端进度较旧：不调用 importData');
}
{
  const { DS, progress } = boot({}, {
    progress: { meta: { updatedAt: new Date(NOW - MIN).toISOString() } }
  });
  const incoming = { meta: { updatedAt: new Date(NOW).toISOString() } };
  const r = DS.applyBundle(bundle({}, { exportedAt: NOW, progress: incoming }), 'merge');
  ok(r.progress === 'conflict' && r.conflicts.indexOf('progress') >= 0, '进度同时修改：标为冲突');
  const res = DS.resolveConflicts('remote');
  ok(res.ok && progress._calls.length === 1, '冲突解决：用远端覆盖后调用 importData');
}
{
  const { DS, progress } = boot({}, { progress: null });
  const incoming = { meta: { updatedAt: new Date(NOW).toISOString() } };
  const r = DS.applyBundle(bundle({}, { exportedAt: NOW, progress: incoming }), 'replace');
  ok(r.ok && r.progress === 'applied', 'replace：进度主档按 replace 写入');
  ok(progress._calls.length === 1 && progress._calls[0].mode === 'replace', 'replace 模式传给 importData 的是 replace');
}

// ---------- 配置读写（密码只存本机） ----------
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
