/**
 * smoke-app.mjs — 功能冒烟：静态服务 + 关键模块装载 + 核心 API
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';
import http from 'node:http';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, '1.2');
const NODE = process.execPath;

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓', msg); }
  else { fail++; console.error('  ✗', msg); }
}

console.log('=== 1. JS 语法 ===');
{
  let err = 0;
  for (const f of readdirSync(join(APP, 'js'))) {
    if (!f.endsWith('.js')) continue;
    try { execFileSync(NODE, ['--check', join(APP, 'js', f)], { stdio: 'pipe' }); }
    catch (e) { err++; console.error('  syntax', f); }
  }
  try { execFileSync(NODE, ['--check', join(APP, 'sw.js')], { stdio: 'pipe' }); }
  catch { err++; console.error('  syntax sw.js'); }
  ok(err === 0, `全部 JS 可解析 (err=${err})`);
}

console.log('=== 2. 关键资源存在 ===');
for (const p of [
  'index.html', 'manifest.json', 'sw.js',
  'css/tokens.css', 'css/style.css', 'css/theme-dark.css',
  'js/progress.js', 'js/app.js', 'js/enhanced-tools.js',
  'data/exam-bank.json', 'data/physics/knowledge.json',
]) {
  ok(existsSync(join(APP, p)), `存在 ${p}`);
}

console.log('=== 3. index 关键接线 ===');
{
  const html = readFileSync(join(APP, 'index.html'), 'utf8');
  ok(html.includes('css/theme-dark.css'), '引入 theme-dark.css');
  ok(html.includes('js/progress.js'), '引入 progress.js');
  ok(html.includes('window.toggleTheme'), '统一 toggleTheme');
  ok(html.includes('data-theme'), 'data-theme 主题属性');
  ok(html.includes('serviceWorker'), '注册 SW');
  // subject cards
  const start = html.indexOf('<div class="subject-cards">');
  const end = html.indexOf('<div class="quick-access">');
  const block = html.slice(start, end);
  let depth = 0, cards = 0;
  for (const m of block.matchAll(/<\/?div\b/g)) {
    if (m[0].startsWith('</')) depth--;
    else {
      if (depth === 1) {
        const sn = block.slice(m.index, m.index + 40);
        if (sn.includes('subject-card') && !sn.includes('subject-cards')) cards++;
      }
      depth++;
    }
  }
  ok(cards === 6 && depth === 0, `六科卡片平级 (cards=${cards}, depth=${depth})`);
}

console.log('=== 4. 模拟 DOM 装载核心脚本 ===');
{
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
  function makeEl(tag) {
    const el = {
      tagName: (tag || 'div').toUpperCase(),
      style: {},
      classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
      children: [],
      attributes: {},
      innerHTML: '',
      textContent: '',
      setAttribute(k, v) { this.attributes[k] = v; },
      getAttribute(k) { return this.attributes[k] ?? null; },
      hasAttribute(k) { return k in this.attributes; },
      appendChild(c) { this.children.push(c); return c; },
      removeChild() {},
      addEventListener() {},
      removeEventListener() {},
      querySelector() { return null; },
      querySelectorAll() { return []; },
      closest() { return null; },
      click() {},
      focus() {},
    };
    return el;
  }
  const document = {
    readyState: 'complete',
    documentElement: makeEl('html'),
    head: makeEl('head'),
    body: makeEl('body'),
    createElement: makeEl,
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    removeEventListener() {},
  };
  document.documentElement.setAttribute('data-theme', 'light');

  const sandbox = {
    console,
    document,
    localStorage: makeLocalStorage(),
    window: {},
    navigator: { serviceWorker: undefined },
    location: { href: 'http://127.0.0.1:8765/', pathname: '/' },
    setTimeout, clearTimeout, setInterval, clearInterval,
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} },
    Blob: class { constructor(p) { this.parts = p; } },
    fetch: async () => ({ ok: true, json: async () => ({}), status: 200 }),
    requestAnimationFrame: (fn) => setTimeout(fn, 0),
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
    performance: { now: () => Date.now() },
    alert() {}, confirm: () => true,
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);

  const loadOrder = [
    'js/common-utils.js',
    'js/progress.js',
    'js/app.js',
    'js/app-chemistry.js',
    'js/app-physics.js',
    'js/app-biology.js',
    'js/app-exam.js',
    'js/enhanced-tools.js',
    'js/platform-system.js',
    'js/gamification-system.js',
    'js/error-notebook.js',
    'js/global-search.js',
    'js/mock-exam.js',
  ];
  let loadErr = 0;
  for (const rel of loadOrder) {
    const p = join(APP, rel);
    try {
      const code = readFileSync(p, 'utf8');
      vm.runInContext(code, sandbox, { filename: rel });
    } catch (e) {
      loadErr++;
      console.error('  load fail', rel, e.message.slice(0, 120));
    }
  }
  ok(loadErr === 0, `关键 ${loadOrder.length} 个脚本装载成功 (err=${loadErr})`);

  ok(typeof sandbox.HSPCBProgress === 'object' && typeof sandbox.HSPCBProgress.get === 'function', 'HSPCBProgress API');
  ok(typeof sandbox.navigateTo === 'function' || typeof sandbox.window.navigateTo === 'function', 'navigateTo');
  ok(typeof sandbox.loadModuleContent === 'function', 'loadModuleContent');
  ok(typeof sandbox.registerModule === 'function', 'registerModule');
  ok(typeof sandbox.PlatformSystem === 'object', 'PlatformSystem');
  ok(typeof sandbox.darkModeToggle === 'object', 'darkModeToggle 委托实现');
  ok(typeof sandbox.CommonUtils === 'object', 'CommonUtils');

  // enhanced-tools exports after syntax fix
  ok(typeof sandbox.chemistryProcessAnalyzerEnhanced === 'object', 'chemistryProcessAnalyzerEnhanced');
  ok(typeof sandbox.photosynthesisTrainerEnhanced === 'object', 'photosynthesisTrainerEnhanced');
  ok(typeof sandbox.photosynthesisTrainerEnhanced._render === 'function', 'photosynthesisTrainerEnhanced._render');

  // progress migrate
  sandbox.localStorage.setItem('hspcb_error_notebook', JSON.stringify([{ id: 'e1' }]));
  sandbox.HSPCBProgress._resetForTest();
  sandbox.HSPCBProgress.migrateFromV1({ force: true });
  const wrongs = sandbox.HSPCBProgress.get('wrongQuestions') || [];
  ok(wrongs.some((w) => w.id === 'e1'), 'Progress 迁移错题本');
}

console.log('=== 5. 数据与题库抽样 ===');
{
  const eb = JSON.parse(readFileSync(join(APP, 'data/exam-bank.json'), 'utf8'));
  const allIds = new Set();
  let dups = 0, n = 0;
  for (const s of Object.keys(eb).filter((k) => k !== 'meta')) {
    for (const q of eb[s].exams || []) {
      n++;
      if (allIds.has(q.id)) dups++;
      allIds.add(q.id);
    }
  }
  ok(dups === 0 && n === 1718, `题库 ${n} 题 id 唯一 (dups=${dups})`);
  const q0 = eb.physics.exams[0];
  ok(/6 s/.test(q0.options[q0.answer.charCodeAt(0) - 65] || ''), 'PHY_2018_01 选项与解析一致');
  ok(!/修正后/.test(q0.analysis || ''), 'PHY_2018_01 无内部备注');

  // knowledge topic ids unique
  for (const s of ['math', 'chinese', 'english']) {
    const d = JSON.parse(readFileSync(join(APP, 'data', s, 'knowledge.json'), 'utf8'));
    const ids = new Set();
    let dupT = 0;
    for (const ch of d.chapters || []) for (const t of ch.topics || []) {
      if (ids.has(t.id)) dupT++;
      ids.add(t.id);
    }
    ok(dupT === 0, `${s} topic id 唯一 (dup=${dupT})`);
  }
}

console.log('=== 6. HTTP 服务资源 ===');
{
  // inline mini server check via child
  const py = process.env.MIMO_PYTHON || 'python';
  // use node http static instead to avoid extra process complexity
  const server = http.createServer((req, res) => {
    let p = join(APP, decodeURIComponent((req.url || '/').split('?')[0]));
    if (p.endsWith('/')) p += 'index.html';
    try {
      const buf = readFileSync(p);
      res.writeHead(200); res.end(buf);
    } catch {
      res.writeHead(404); res.end('no');
    }
  });
  await new Promise((r) => server.listen(8767, '127.0.0.1', r));
  const paths = ['/index.html', '/js/progress.js', '/js/enhanced-tools.js', '/data/exam-bank.json', '/css/theme-dark.css', '/sw.js', '/manifest.json'];
  for (const path of paths) {
    const body = await new Promise((resolve2, reject) => {
      http.get('http://127.0.0.1:8767' + path, (res) => {
        let c = '';
        res.on('data', (d) => (c += d));
        res.on('end', () => resolve2({ status: res.statusCode, len: c.length }));
      }).on('error', reject);
    });
    ok(body.status === 200 && body.len > 0, `HTTP ${path} → ${body.status} (${body.len}B)`);
  }
  server.close();
}

console.log(`\n冒烟结果: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
