/**
 * Minimal unit test for progress.js migration (Node, mock localStorage)
 */
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(ROOT, '1.2', 'js', 'progress.js'), 'utf8');

function makeLocalStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(String(k), String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
    get length() { return map.size; },
    key: (i) => [...map.keys()][i] ?? null,
  };
}

function boot(seed) {
  const localStorage = makeLocalStorage();
  for (const [k, v] of Object.entries(seed || {})) {
    localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
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
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return { sandbox, localStorage, Progress: sandbox.HSPCBProgress, Store: sandbox.HSPCBStore };
}

let passed = 0;
let failed = 0;
function assert(cond, msg) {
  if (cond) {
    passed += 1;
    console.log('  ok  ', msg);
  } else {
    failed += 1;
    console.error('  FAIL', msg);
  }
}

console.log('progress.js tests');

// 1. empty seed → defaults + migrate no-op-ish
{
  const { Progress } = boot({});
  Progress._resetForTest();
  const r = Progress.init();
  assert(Progress.get('wrongQuestions') !== undefined, 'defaults present');
  assert(Progress.get('meta').schemaVersion === 2, 'schemaVersion=2');
  assert(r.merged !== undefined, 'init returns result');
}

// 2. migrate v1 keys
{
  const { Progress, localStorage } = boot({
    hspcb_theme: 'dark',
    hspcb_error_notebook: JSON.stringify([{ id: 'q1', note: 'a' }]),
    hspcb_wrong_records: JSON.stringify([{ id: 'q2' }, { id: 'q1' }]),
    wrongPhotosynthesis: JSON.stringify([{ id: 'q3' }]),
    mockExamHistory: JSON.stringify([{ id: 'm1', score: 80 }]),
    hspcb_exam_history: JSON.stringify([{ id: 'm1', score: 80 }]),
    genetics_score: JSON.stringify({ best: 10 }),
  });
  Progress._resetForTest();
  // re-seed after reset would wipe - so seed again then migrate without reset
  // Actually _resetForTest clears v2 only... wait it removes MIGRATED_FLAG and progress.
  // v1 keys remain. Good.
  const r = Progress.migrateFromV1({ force: true });
  assert(r.migrated === true, 'migrated true');
  assert(Progress.get('theme') === 'dark', 'theme dark migrated');
  const wrongs = Progress.get('wrongQuestions');
  assert(Array.isArray(wrongs) && wrongs.length >= 3, 'wrongQuestions merged >=3, got ' + wrongs.length);
  const ids = wrongs.map((w) => w.id);
  assert(ids.includes('q1') && ids.includes('q2') && ids.includes('q3'), 'merged unique ids');
  assert(Progress.get('examHistory').length >= 1, 'examHistory present');
  assert(Progress.get('moduleStats.genetics.score').best === 10, 'nested moduleStats migrated');
  // idempotent
  const r2 = Progress.migrateFromV1();
  assert(r2.migrated === false, 'second migrate is no-op');
}

// 3. append + export/import merge
{
  const { Progress } = boot({});
  Progress._resetForTest();
  Progress.init({ force: true });
  Progress.append('wrongQuestions', { id: 'x1', at: 't' });
  const payload = Progress.exportData();
  assert(payload.__export && payload.__export.schemaVersion === 2, 'export has meta');
  const { Progress: P2 } = boot({});
  P2._resetForTest();
  P2.init({ force: true });
  P2.importData(payload, 'merge');
  assert(P2.get('wrongQuestions').some((w) => w.id === 'x1'), 'import merge works');
}

// ── 「清除学习数据」必须真正清除，刷新后不得复活 ──

// 4. remove 同时清两处存储；清除后 get 不再把旧数据搬回来
{
  const { Progress, Store, localStorage } = boot({
    hspcb_wrong_records: JSON.stringify([{ id: 'w1' }]),
  });
  Progress._resetForTest();
  Store.set('hspcb_wrong_records', JSON.stringify([{ id: 'w1' }]));
  assert(Store.get('hspcb_wrong_records') !== null, 'set/get roundtrip');
  Store.remove('hspcb_wrong_records');
  assert(localStorage.getItem('hspcb.st.hspcb_wrong_records') === null, 'remove 清掉 hspcb.st.* 轨');
  assert(localStorage.getItem('hspcb_wrong_records') === null, 'remove 清掉 v1 裸 key 轨');
  assert(Store.get('hspcb_wrong_records') === null, '清除后 get 返回 null（无透明搬迁复活）');
}

// 5. purgeAll 覆盖全部散装轨 + 全部已知 v1 裸 key
{
  const { Progress, Store, localStorage } = boot({
    hspcb_wrong_records: JSON.stringify([{ id: 'w1' }]),
    hspcb_game_scores: JSON.stringify({ concept: 5 }),
    mockExamHistory: JSON.stringify([{ id: 'm1' }]),
    hspcb_manual_mastery: JSON.stringify({ a: 1 }),
  });
  Progress._resetForTest();
  // 先写一批 hspcb.st.* 轨数据
  Store.set('hspcb_quiz_records', JSON.stringify([{ id: 'q1' }]));
  Store.set('hspcb_manual_mastery', JSON.stringify({ a: 1 }));
  const before = Store.keys();
  assert(before.length >= 2, 'purgeAll 前散装轨有数据, got ' + before.length);

  const r = Store.purgeAll();
  assert(r.failed.length === 0, 'purgeAll 无失败项');
  assert(r.removed.length >= 4, 'purgeAll 清除了多轨 key, got ' + r.removed.length);
  assert(Store.keys().length === 0, 'purgeAll 后 hspcb.st.* 为空');
  const legacyLeft = Store.legacyKeys().filter((k) => localStorage.getItem(k) !== null);
  assert(legacyLeft.length === 0, 'purgeAll 后无 v1 裸 key 残留: ' + legacyLeft.join(','));
  assert(Store.get('hspcb_wrong_records') === null, 'purgeAll 后 get 不复活');
}

// 6. 权威进度轨 resetAll：examHistory / gameScores 等一并消失
{
  const { Progress, localStorage } = boot({});
  Progress._resetForTest();
  Progress.init({ force: true });
  Progress.append('examHistory', { id: 'm1', score: 90 });
  Progress.append('wrongQuestions', { id: 'w1' });
  Progress.set('gameScores', { concept: 3 });
  assert(Progress.get('examHistory').length === 1, 'resetAll 前 examHistory 有数据');
  Progress.resetAll();
  assert(Progress.get('examHistory').length === 0, 'resetAll 清空 examHistory');
  assert(Progress.get('wrongQuestions').length === 0, 'resetAll 清空 wrongQuestions');
  assert(Object.keys(Progress.get('gameScores')).length === 0, 'resetAll 清空 gameScores');
  assert(localStorage.getItem('hspcb.v2.progress') === null, 'resetAll 删除 localStorage 中的 progress');
  assert(localStorage.getItem('hspcb.v2.migratedFromV1') === null, 'resetAll 删除迁移标记');
}

// 7. migrateFromV1({ removeLegacy: true }) 搬迁后删除旧裸 key
{
  const { Progress, localStorage } = boot({
    hspcb_wrong_records: JSON.stringify([{ id: 'w1' }]),
    hspcb_exam_history: JSON.stringify([{ id: 'm1' }]),
  });
  Progress._resetForTest();
  const r = Progress.migrateFromV1({ force: true, removeLegacy: true });
  assert(r.migrated === true, 'removeLegacy 搬迁成功');
  assert(Array.isArray(r.removedLegacy) && r.removedLegacy.length >= 2,
    'removedLegacy 记录了删除的旧 key, got ' + JSON.stringify(r.removedLegacy));
  assert(localStorage.getItem('hspcb_wrong_records') === null, '旧 key hspcb_wrong_records 已删除');
  assert(localStorage.getItem('hspcb_exam_history') === null, '旧 key hspcb_exam_history 已删除');
  assert(Progress.get('wrongQuestions').length === 1, '数据已安全落入 v2 轨');
}

// 8. configure({removeLegacyAfterMigrate:true}) 让透明搬迁也清理旧 key
{
  const { Progress, Store, localStorage } = boot({
    hspcb_wrong_records: JSON.stringify([{ id: 'w1' }]),
  });
  Progress._resetForTest();
  Store.configure({ removeLegacyAfterMigrate: true });
  const v = Store.get('hspcb_wrong_records');
  assert(v !== null, '透明搬迁读到数据');
  assert(localStorage.getItem('hspcb_wrong_records') === null, '透明搬迁后旧裸 key 被删除');
  assert(localStorage.getItem('hspcb.st.hspcb_wrong_records') !== null, '数据在 hspcb.st.* 轨');
}

// 9. 默认配置下透明搬迁保留旧 key（回滚友好），但与 remove/purgeAll 不冲突
{
  const { Progress, Store, localStorage } = boot({
    hspcb_wrong_records: JSON.stringify([{ id: 'w1' }]),
  });
  Progress._resetForTest();
  const v = Store.get('hspcb_wrong_records');
  assert(v !== null, '默认配置透明搬迁正常');
  assert(localStorage.getItem('hspcb_wrong_records') !== null, '默认保留旧 key（可回滚）');
  Store.remove('hspcb_wrong_records');
  assert(Store.get('hspcb_wrong_records') === null, '默认配置下 remove 依然双清');
}

// 10. 导入净化：危险键 / 未知键 / 类型不符全部拦截（v1.4 安全加固）
{
  const { Progress, localStorage } = boot({});
  const evil = JSON.parse('{"__proto__":{"polluted":true},"evilKey":"x","theme":"red","wrongQuestions":"not-array","notes":[{"k":"' + 'A'.repeat(9000) + '"}],"gameScores":{"math":123}}');
  Progress.importData(evil, 'merge');
  const snap = JSON.parse(localStorage.getItem('hspcb.v2.progress') || '{}');
  assert(snap.theme !== 'red', '非法 theme 被拒');
  assert(!('evilKey' in snap), '未知键被丢弃');
  assert(!Array.isArray(snap.wrongQuestions) || snap.wrongQuestions.length === 0, 'wrongQuestions 类型不符被丢弃');
  assert(!({}).polluted, '__proto__ 未污染对象原型');
  if (Array.isArray(snap.notes)) {
    assert(snap.notes.length === 0 || String(snap.notes[0].k).length <= 4000, '超长字符串被截断');
  }
  assert(snap.gameScores && snap.gameScores.math === 123, '合法对象数据正常导入');
}

// 11. 导入净化：合法数据不受影响
{
  const { Progress } = boot({});
  const ok = Progress.importData({ wrongQuestions: [{ id: 'q1', subject: 'physics' }], theme: 'dark' }, 'merge');
  assert(ok.ok, '合法导入返回 ok');
  assert(Progress.get('wrongQuestions').some((w) => w.id === 'q1'), '合法错题入库');
  assert(Progress.get('theme') === 'dark', '合法 theme 入库');
}

// 12. 全恶载荷：净化后为空则拒绝
{
  const { Progress } = boot({});
  const r = Progress.importData({ hack: 1 }, 'merge');
  assert(r.ok === false, '净化后为空的载荷被拒绝');
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
