/**
 * test-import-transaction.mjs — 备份/导入的事务安全
 *
 * 覆盖 progress.js 的 importData(merge/replace) 与 restoreSnapshot：
 * 本地存储写入失败（配额满）时必须返回 ok:false 且回滚内存态，
 * 不能出现「提示恢复成功、实际没写进去」或半覆盖的脏数据。
 *
 * 故障注入方式：只让 'hspcb.v2.progress' 这个 key 的 setItem 抛错，
 * storageAvailable() 的 __probe 探测保持正常，模拟「空间刚好写不下主数据」。
 */
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(ROOT, '1.2', 'js', 'progress.js'), 'utf8');

const MAIN_KEY = 'hspcb.v2.progress';

function makeLocalStorage(failMainKey) {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      if (failMainKey && k === MAIN_KEY) {
        const err = new Error('QuotaExceededError');
        err.name = 'QuotaExceededError';
        throw err;
      }
      map.set(String(k), String(v));
    },
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
    get length() { return map.size; },
    key: (i) => [...map.keys()][i] ?? null,
    _raw: map,
  };
}

function boot(seed, opts) {
  const failMainKey = !!(opts && opts.failMainKey);
  const localStorage = makeLocalStorage(failMainKey);
  // 种子直接写底层 Map：即使开了「主键写入失败」，历史数据也能先就位
  for (const [k, v] of Object.entries(seed || {})) {
    localStorage._raw.set(String(k), typeof v === 'string' ? v : JSON.stringify(v));
  }
  const sandbox = {
    localStorage,
    console,
    window: {},
    document: {
      readyState: 'complete',
      addEventListener() {},
      createElement: () => ({ click() {}, style: {} }),
      body: { appendChild() {}, removeChild() {} },
    },
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} },
    Blob: class {},
    setTimeout, clearTimeout,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return { sandbox, localStorage, Progress: sandbox.HSPCBProgress };
}

let passed = 0;
let failed = 0;
function assert(cond, msg) {
  if (cond) { passed += 1; console.log('  ok  ', msg); }
  else { failed += 1; console.error('  FAIL', msg); }
}

console.log('import/restore 事务安全测试');

// ── 1. 正常 replace 导入：应成功且数据落盘 ──
{
  const { Progress, localStorage } = boot({});
  Progress._resetForTest();
  Progress.init({ force: true });
  const res = Progress.importData({ wrongQuestions: [{ id: 'n1' }] }, 'replace');
  assert(res.ok === true, 'replace 正常导入返回 ok');
  assert(Progress.get('wrongQuestions').some((w) => w.id === 'n1'), 'replace 正常导入数据生效');
  assert((localStorage.getItem(MAIN_KEY) || '').includes('n1'), 'replace 正常导入已落盘');
}

// ── 2. replace 写入失败：必须 ok:false 且原数据不变 ──
{
  const { Progress } = boot({});
  Progress._resetForTest();
  Progress.init({ force: true });
  Progress.append('wrongQuestions', { id: 'keep-me' });
  const before = JSON.stringify(Progress.get('wrongQuestions'));

  // 重新 boot 一个「主键写入会失败」的实例，但要保留 before 的数据
  const b2 = boot({ [MAIN_KEY]: Progress.exportData() }, { failMainKey: true });
  b2.Progress._resetForTest();
  // _resetForTest 会清掉刚写的数据，所以直接构造已加载状态
  const res = b2.Progress.importData({ wrongQuestions: [{ id: 'should-not-land' }] }, 'replace');
  assert(res.ok === false, 'replace 写入失败返回 ok:false');
  assert(res.error === 'storage-full', 'replace 写入失败 error=storage-full');
  const after = b2.Progress.get('wrongQuestions');
  assert(!after.some((w) => w.id === 'should-not-land'),
    'replace 写入失败未污染内存态（回滚生效）');
}

// ── 3. 正常 merge 导入：应成功 ──
{
  const { Progress } = boot({});
  Progress._resetForTest();
  Progress.init({ force: true });
  const res = Progress.importData({ wrongQuestions: [{ id: 'm1' }] }, 'merge');
  assert(res.ok === true, 'merge 正常导入返回 ok');
  assert(Progress.get('wrongQuestions').some((w) => w.id === 'm1'), 'merge 正常导入数据生效');
}

// ── 4. merge 写入失败：必须 ok:false 且内存态回滚 ──
{
  const b = boot({}, { failMainKey: true });
  b.Progress._resetForTest();
  b.Progress.init({ force: true });
  // init 期间 saveAll 也会失败，但不应抛错
  const res = b.Progress.importData({ wrongQuestions: [{ id: 'm-fail' }] }, 'merge');
  assert(res.ok === false, 'merge 写入失败返回 ok:false');
  assert(res.error === 'storage-full', 'merge 写入失败 error=storage-full');
  const after = b.Progress.get('wrongQuestions') || [];
  assert(!after.some((w) => w.id === 'm-fail'), 'merge 写入失败已回滚，未留下脏数据');
}

// ── 5. restoreSnapshot：写入失败不得假成功 ──
{
  const b = boot({}, { failMainKey: true });
  b.Progress._resetForTest();
  // 手工塞一个快照（快照 key 不受故障开关影响）
  const snap = JSON.stringify({ date: '2026-01-01', count: 1, data: { wrongQuestions: [{ id: 'snap1' }] } });
  b.localStorage.setItem('hspcb.st.backup.0', snap);
  const res = b.Progress.restoreSnapshot('backup.0');
  assert(res.ok === false, 'restoreSnapshot 写入失败返回 ok:false（不假成功）');
  assert(res.error === 'storage-full', 'restoreSnapshot 失败原因是 storage-full（实测: ' + JSON.stringify(res) + '）');
}

// ── 6. restoreSnapshot：损坏快照明确报 corrupt ──
{
  const b = boot({});
  b.Progress._resetForTest();
  b.localStorage.setItem('hspcb.st.backup.1', '{not json');
  const res = b.Progress.restoreSnapshot('backup.1');
  assert(res.ok === false, '损坏快照返回 ok:false');
  assert(res.error === 'corrupt', '损坏快照 error=corrupt');
}

// ── 7. restoreSnapshot：不存在槽位报 no-snapshot ──
{
  const b = boot({});
  b.Progress._resetForTest();
  const res = b.Progress.restoreSnapshot('backup.9');
  assert(res.ok === false, '空槽位返回 ok:false');
  assert(res.error === 'no-snapshot', '空槽位 error=no-snapshot');
}

console.log(`\n事务安全: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
