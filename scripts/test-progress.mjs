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
  return { sandbox, localStorage, Progress: sandbox.HSPCBProgress };
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

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
