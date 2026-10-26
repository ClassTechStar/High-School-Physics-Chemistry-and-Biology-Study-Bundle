/**
 * runtime-defer-check.mjs — 在 Node 里按浏览器真实语义复现 index.html 的脚本执行顺序，
 * 并验证「defer 时序类」缺陷是否已修复。
 *
 * 背景（）：
 * 内联 <script>（无 defer）与非 defer 外链 <script> 在**解析期**按文档序执行，
 * <script defer> 在**解析完成后**按 DOM 顺序执行。
 * 因此解析期读 window.SomeDeferredModule 必然得到 undefined。
 * 本脚本用 jsdom 之外的极简实现（避免新增依赖）复现该顺序，并断言：
 * 1. 解析期脚本（e 起全部为外部 js，含 js/main-inline.js）中不再有
 * 解析期捕获 defer 模块的写法
 * 2. 所有 defer 模块在最后一个解析期脚本之后都能被读到
 * 3. chineseSearch / loadModuleContent / render*Experiments 等确实挂到了 window
 *
 * e 结构变化：index.html 原 6 个内联脚本块全部外置为 js/ 外部脚本——
 * error-fallback.js / theme-bootstrap.js（head，非 defer）、main-inline.js
 * （body 原位，非 defer，2290 行主逻辑）、home-collapse.js / theme-toggle.js /
 * sw-register.js（defer，置于 app.js 之前）。解析期执行序与 defer 执行序
 * 与外置前完全一致，本节静态检查面随之覆盖全部解析期脚本。
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, '1.2');

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓', msg); }
  else { fail++; console.error('  ✗', msg); }
}

// ---------------------------------------------------------- 解析 index.html
const html = readFileSync(join(APP, 'index.html'), 'utf8');

/** @type {{src?:string, code?:string, defer:boolean, pos:number}[]} */
const scripts = [];
const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/g;
for (const m of html.matchAll(scriptRe)) {
  const attrs = m[1] || '';
  const srcM = /\bsrc\s*=\s*["']([^"']+)["']/.exec(attrs);
  scripts.push({
    src: srcM ? srcM[1] : null,
    code: srcM ? null : m[2],
    defer: /\bdefer\b/.test(attrs),
    pos: m.index
  });
}

const inlineScripts = scripts.filter((s) => !s.src);
const deferScripts = scripts.filter((s) => s.src && s.defer);
const plainScripts = scripts.filter((s) => s.src && !s.defer);

console.log(`=== 1. 脚本构成 ===`);
console.log(`  内联 ${inlineScripts.length} · defer ${deferScripts.length} · 非 defer 外部 ${plainScripts.length}`);
ok(scripts.length > 0, `解析出 ${scripts.length} 个 <script>`);

// ------------------------------------------- 2. 静态检查：解析期不得捕获 defer 模块
console.log('=== 2. 解析期捕获检查（静态） ===');
{
  // 解析期执行集合 = 内联脚本 + 非 defer 外链脚本（e 起原 6 个内联块已全部外置为
  // js/ 外部脚本，其中 #3 主逻辑 2290 行为 js/main-inline.js，仍以非 defer 方式在解析期执行，
  // 因此本节的静态检查面必须覆盖全部解析期脚本，而非仅 index.html 内联块）
 /** @type {{label:string, code:string}[]} */
  const parseTimeSegs = [
    ...inlineScripts.map((s, i) => ({ label: `inline#${i + 1}`, code: s.code || '' })),
    ...plainScripts.map((s) => ({
      label: s.src,
      code: (() => { try { return readFileSync(join(APP, s.src.replace(/^\//, '')), 'utf8'); } catch { return ''; } })(),
    })),
  ];

  // 收集每个 defer 脚本会挂到 window 的符号
 /** @type {Map<string, string>} symbol -> src */
  const deferredSymbols = new Map();
  for (const s of deferScripts) {
    if (!s.src.endsWith('.js')) continue;
    const p = join(APP, s.src.replace(/^\//, ''));
    let code;
    try { code = readFileSync(p, 'utf8'); }
    catch { fail++; console.error('  ✗ 找不到 defer 脚本', s.src); continue; }
    // window.X = / window.X.Y = / window['X']
    for (const m of code.matchAll(/\bwindow\.([A-Za-z_$][\w$]*)\s*=/g)) {
      deferredSymbols.set(m[1], s.src);
    }
    // 顶层 var/const/let/function/class 名（这些在 vm 里也会成为 sandbox 属性）
    for (const m of code.matchAll(/^(?:const|let|var|class|function)\s+([A-Za-z_$][\w$]*)/gm)) {
      deferredSymbols.set(m[1], s.src);
    }
  }
  console.log(`  defer 脚本导出符号 ${deferredSymbols.size} 个`);

  // 只看**顶层**（行首无缩进）且不在注释里的赋值 —— 函数体内的赋值在调用时才求值，是安全的
  const stripComments = (code) => code
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(m.length - p1.length));

  const violations = [];
  for (const seg of parseTimeSegs) {
    if (!seg.code) continue;
    const clean = stripComments(seg.code);
    clean.split('\n').forEach((line, i) => {
      if (/^[ \t]/.test(line)) return; // 缩进 = 在函数/块内
      const m = /\b(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*window\.([A-Za-z_$][\w$]*)/.exec(line);
      if (!m) return;
      const sym = m[2];
      if (deferredSymbols.has(sym)) {
        violations.push(`顶层 var ${m[1]} = window.${sym}（${deferredSymbols.get(sym)} 为 defer 模块）@${seg.label}:${i + 1}`);
      }
    });
  }
  ok(violations.length === 0,
    violations.length === 0
      ? '解析期脚本（内联 + 非 defer 外链）无捕获 defer 模块的写法'
      : `发现 ${violations.length} 处解析期捕获：\n      - ${violations.join('\n      - ')}`);

  // 解析期脚本里不应再有「解析期必然为假的 typeof 守卫」
  // 顶层 `typeof X !== 'undefined'` 且 X 由 defer 模块提供 → 解析期必然为假，守卫失效。
  // 函数体内的 typeof 守卫是正确写法（调用时 defer 已就绪），不报。
  const bogusGuards = [];
  for (const seg of parseTimeSegs) {
    if (!seg.code) continue;
    stripComments(seg.code).split('\n').forEach((line, i) => {
      if (/^[ \t]/.test(line)) return;
      const m = /typeof\s+([A-Za-z_$][\w$]*)\s*!==?\s*['"]undefined['"]/.exec(line);
      if (m && deferredSymbols.has(m[1])) bogusGuards.push(`${m[1]}@${seg.label}:${i + 1}`);
    });
  }
  ok(bogusGuards.length === 0,
    bogusGuards.length === 0
      ? '解析期脚本顶层无依赖解析期时序的 typeof 守卫'
      : `发现 ${bogusGuards.length} 处顶层失效 typeof 守卫: ${[...new Set(bogusGuards)].join(', ')}`);
}

// ------------------------------------------------ 3. 假 DOM（带 id 注册表）
console.log('=== 3. 运行时复现 ===');

/** 从 index.html 抽出所有静态 id，供 getElementById 命中 */
const idRegistry = new Set();
for (const m of html.matchAll(/\sid\s*=\s*["']([^"']+)["']/g)) idRegistry.add(m[1]);

function makeEl(tag = 'div', id = '') {
  const el = {
    tagName: String(tag).toUpperCase(), id,
    style: new Proxy({}, { get: () => '', set: () => true }),
    dataset: {},
    children: [], childNodes: [],
    _html: '', _text: '',
    classList: { _s: new Set(), add(...c) { c.forEach((x) => this._s.add(x)); }, remove(...c) { c.forEach((x) => this._s.delete(x)); }, contains(c) { return this._s.has(c); }, toggle() {} },
    // 浏览器里 innerHTML 会生成真实子元素（其 id 随后可被 getElementById 命中）；
    // 假 DOM 必须显式登记，否则动态渲染出的面板 id 会被误判为"不存在"
    get innerHTML() { return this._html; },
    set innerHTML(v) {
      this._html = String(v == null ? '' : v);
      for (const m of this._html.matchAll(/\sid\s*=\s*["']([^"']+)["']/g)) {
        idRegistry.add(m[1]);
        if (!elCache.has(m[1])) elCache.set(m[1], makeEl('div', m[1]));
      }
    },
    textContent: '', value: '', disabled: false,
    setAttribute(k, v) { this[k] = v; }, getAttribute(k) { return this[k] ?? null; }, removeAttribute(k) { delete this[k]; },
    appendChild(c) { this.children.push(c); return c; }, removeChild(c) { this.children = this.children.filter((x) => x !== c); return c; },
    insertBefore(c) { this.children.push(c); return c; },
    addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    closest() { return null; }, contains() { return false; }, remove() {},
    cloneNode() { return makeEl(tag, id); }, focus() {}, blur() {}, click() {}, scrollIntoView() {},
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 }; },
    offsetWidth: 100, offsetHeight: 100, scrollHeight: 100, scrollWidth: 100,
    insertRow() { return makeEl('tr'); }, insertCell() { return makeEl('td'); }, deleteRow() {},
  };
  return el;
}

const elCache = new Map();
const missingIds = new Set();
const document = {
  documentElement: makeEl('html'),
  head: makeEl('head'),
  body: makeEl('body'),
  readyState: 'loading',
  createElement: (t) => makeEl(t),
  createElementNS: (_ns, t) => makeEl(t),
  createTextNode: (t) => ({ nodeType: 3, textContent: t }),
  createDocumentFragment: () => makeEl('fragment'),
  createEvent: () => ({ initEvent() {} }),
  getElementById(id) {
    if (idRegistry.has(id)) {
      if (!elCache.has(id)) elCache.set(id, makeEl('div', id));
      return elCache.get(id);
    }
    missingIds.add(id);
    return null;
  },
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementsByClassName: () => [],
  getElementsByTagName: () => [],
  addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
  cookie: '',
};

// 事件监听登记表：用于事后手动触发 DOMContentLoaded
const listeners = new Map();
document.addEventListener = function (type, fn) {
  if (!listeners.has(type)) listeners.set(type, []);
  listeners.get(type).push(fn);
};

// 深链行为断言需要认出导航按钮集合 —— 从 index.html 静态 HTML 抽取
// .nav-btn[data-subject]（假 DOM 的 querySelectorAll 默认恒返回 []，
// 这里只对这一个是给真实集合，其余选择器行为不变）。
const navBtnSubjects = [...html.matchAll(/<button[^>]*class="nav-btn[^"]*"[^>]*\bdata-subject="([^"]+)"/g)].map((m) => m[1]);
document.querySelectorAll = function (sel) {
  if (sel === '.nav-btn[data-subject]') {
    return navBtnSubjects.map((s) => { const el = makeEl('button'); el.dataset.subject = s; return el; });
  }
  return [];
};

function makeLocalStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
    key: (i) => [...m.keys()][i] ?? null,
    get length() { return m.size; },
  };
}

const sandbox = {
  console,
  document,
  localStorage: makeLocalStorage(),
  navigator: { serviceWorker: { register: async () => ({ scope: '/' }) }, userAgent: 'node', language: 'zh-CN' },
  location: { href: 'http://127.0.0.1/', pathname: '/', search: '', hash: '' },
  history: { pushState() {}, replaceState() {} },
  setTimeout, clearTimeout, setInterval, clearInterval,
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
  cancelAnimationFrame: (id) => clearTimeout(id),
  URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} },
  Blob: class { constructor(p) { this.parts = p; } },
  FileReader: class { readAsText() {} readAsDataURL() {} addEventListener() {} },
  fetch: async () => ({ ok: true, status: 200, json: async () => ({}), text: async () => '' }),
  matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {}, removeListener() {} }),
  performance: { now: () => Date.now() },
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
  MutationObserver: class { observe() {} disconnect() {} },
  IntersectionObserver: class { observe() {} disconnect() {} },
  ResizeObserver: class { observe() {} disconnect() {} },
  CustomEvent: class { constructor(t, o) { this.type = t; this.detail = o?.detail; } },
  Event: class { constructor(t) { this.type = t; } },
  Image: class { set src(v) {} },
  Audio: class { play() {} pause() {} },
  alert() {}, confirm: () => true, prompt: () => null,
  addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
  atob: (s) => Buffer.from(s, 'base64').toString('binary'),
  btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
  TextEncoder, TextDecoder,
  URLSearchParams,
  crypto: { getRandomValues: (a) => a },
};
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.globalThis = sandbox;
sandbox.top = sandbox;
sandbox.parent = sandbox;
sandbox.frames = sandbox;
sandbox.devicePixelRatio = 1;
sandbox.innerWidth = 1280;
sandbox.innerHeight = 800;
sandbox.scrollTo = () => {};

const vm = await import('node:vm');
vm.createContext(sandbox);

// --- 按浏览器真实顺序执行：解析期脚本（非 defer） → defer 脚本（DOM 顺序）
const parseTimeErrors = [];
for (const s of scripts) {
  if (s.defer) continue; // defer 稍后
  const code = s.src ? readFileSync(join(APP, s.src.replace(/^\//, '')), 'utf8') : s.code;
  try { vm.runInContext(code, sandbox, { filename: s.src || 'index.html(inline)' }); }
  catch (e) { parseTimeErrors.push(`${s.src || 'inline'} :: ${e.message.slice(0, 150)}`); }
}

const deferErrors = [];
for (const s of deferScripts) {
  if (!s.src.endsWith('.js')) continue;
  try { vm.runInContext(readFileSync(join(APP, s.src.replace(/^\//, '')), 'utf8'), sandbox, { filename: s.src }); }
  catch (e) { deferErrors.push(`${s.src} :: ${e.message.slice(0, 150)}`); }
}

ok(parseTimeErrors.length === 0,
  parseTimeErrors.length === 0
    ? `解析期 ${scripts.length - deferScripts.length} 个脚本全部执行成功`
    : `解析期 ${parseTimeErrors.length} 个脚本执行失败:\n      - ${parseTimeErrors.join('\n      - ')}`);
ok(deferErrors.length === 0,
  deferErrors.length === 0
    ? `defer 阶段 ${deferScripts.filter((s) => s.src.endsWith('.js')).length} 个脚本全部执行成功`
    : `defer 阶段 ${deferErrors.length} 个脚本执行失败:\n      - ${deferErrors.join('\n      - ')}`);

// --- 触发 DOMContentLoaded
document.readyState = 'complete';
const dclErrors = [];
for (const fn of listeners.get('DOMContentLoaded') || []) {
  try { fn(); } catch (e) { dclErrors.push(e.message.slice(0, 150)); }
}
ok(dclErrors.length === 0,
  dclErrors.length === 0
    ? `DOMContentLoaded 的 ${(listeners.get('DOMContentLoaded') || []).length} 个监听器全部执行成功`
    : `DOMContentLoaded 有 ${dclErrors.length} 个监听器抛错: ${dclErrors.join(' | ')}`);

// ------------------------------------------------- 4. 断言具体修复点
// 沙箱无 fetch，init() 拿不到题库；手动注入真实数据供 渲染断言使用
{
  const sys = sandbox.examPracticeSystem;
  if (sys) {
    const bank = JSON.parse(readFileSync(join(APP, 'data/exam-bank.json'), 'utf8'));
    sys.examData = bank;
    sys.loadStats = () => {};
    sys.saveStats = () => {};
    sys.refreshStats = () => {};
    // mock-exam 的题池依赖 window.examBank（真实浏览器由 examPracticeSystem.init 异步填充）
    sandbox.examBank = bank;
    // 模考 UI 由 renderExamDashboard 动态注入 #exam-content，页面并无静态 exam-list/exam-detail，
    // 与线上一致：必须先渲染仪表盘，后续 getElementById 才能命中
    const host = sandbox.document.getElementById('exam-content');
    if (host && typeof sys.renderExamDashboard === 'function') sys.renderExamDashboard(host);
  }
}

console.log('=== 4. 修复点断言 ===');
ok(typeof sandbox.PlatformSystem === 'object' && sandbox.PlatformSystem !== null, 'P0-10 PlatformSystem 在 defer 后可读');
ok(typeof sandbox.ComprehensiveData === 'object' && sandbox.ComprehensiveData !== null, 'P0-10 ComprehensiveData 可读');
ok(typeof sandbox.ContentEnhancer === 'object' && sandbox.ContentEnhancer !== null, 'P0-10 ContentEnhancer 可读');
ok(typeof sandbox.renderPhysicsExperiments === 'function', 'P0-11 renderPhysicsExperiments 已导出');
ok(typeof sandbox.renderChemistryExperiments === 'function', 'P0-11 renderChemistryExperiments 已导出');
ok(typeof sandbox.renderBiologyExperiments === 'function', 'P0-11 renderBiologyExperiments 已导出');
ok(typeof sandbox.handleModuleTabClick === 'function', 'P0-11 handleModuleTabClick 已导出');
ok(typeof sandbox.chineseSearch === 'function', 'P0-13 chineseSearch 已挂到 window');
// e：原内联脚本外置后，字符串断言的扫描面 = index.html + 全部解析期外链脚本
const parseTimeCorpus = [html, ...plainScripts.map((s) => {
  try { return readFileSync(join(APP, s.src.replace(/^\//, '')), 'utf8'); } catch { return ''; }
})].join('\n');
ok(!parseTimeCorpus.includes('toggleNav'), 'P0-13 toggleNav 引用已全部移除');
ok(!parseTimeCorpus.includes('window.ComprehensiveData = CD'), 'P0-10 不再用失效捕获值覆写全局');

// concepts→knowledge 映射真的生效？
if (typeof sandbox.loadModuleContent === 'function' && sandbox.subjectContent) {
  const known = sandbox.subjectContent.physics.knowledge;
  sandbox.document.getElementById('physics-content').innerHTML = '';
  try { sandbox.loadModuleContent('physics', 'concepts'); } catch (e) { /* 记录在下面 */ }
  const rendered = sandbox.document.getElementById('physics-content').innerHTML;
  ok(rendered === known && rendered.length > 200,
    `P0-11 concepts→knowledge 映射生效（渲染 ${rendered.length} 字节，非占位串）`);
} else {
  ok(false, 'P0-11 无法验证：loadModuleContent/subjectContent 未就绪');
}

// + 模块渲染统一走 MODULE_REGISTRY 正式注册通道，
// 不再有 loadModuleContent 猴补丁链（app.js 权威定义 + 两个后加载补丁互相覆写）
{
  const reg = sandbox.MODULE_REGISTRY;
  ok(!!reg && typeof reg === 'object', 'T2-4 MODULE_REGISTRY 已挂到 window');

  const registered = reg ? Object.keys(reg) : [];
  ok(registered.length >= 10,
    `T2-4 注册表有 ${registered.length} 个真实注册项（P1-3「定义后零调用」空壳已由 P0-11 修复消除）`);

  const MUST_HAVE = ['experiments', 'round1', 'round2', 'bank', 'experiment-center',
    'tools', 'methodology', 'models', 'hotspot', 'errors', 'graph', 'checklist', 'exam', 'quiz'];
  const missing = MUST_HAVE.filter((k) => !registered.includes(k));
  ok(missing.length === 0,
    missing.length === 0
      ? `T2-4 ${MUST_HAVE.length} 个关键模块全部经 registerModule 正式注册`
      : `T2-4 模块未注册: ${missing.join(', ')}`);

  // 静态：window.loadModuleContent 只允许 app.js 一处赋值
  // 注意 (?!=)：`typeof window.loadModuleContent === 'function'` 是合法读取，
  // 朴素正则会把它误判为赋值（e 外置 main-inline.js 后暴露过该误报）
  const assignSites = [];
  for (const f of readdirSync(join(APP, 'js'))) {
    if (!f.endsWith('.js')) continue;
    const src = readFileSync(join(APP, 'js', f), 'utf8');
    const codeOnly = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
    for (const _m of codeOnly.matchAll(/window\.loadModuleContent\s*=(?!=)/g)) assignSites.push(f);
  }
  ok(assignSites.length === 1 && assignSites[0] === 'app.js',
    assignSites.length === 1
      ? 'T2-4 loadModuleContent 仅 app.js 一处赋值（权威定义，无猴补丁链）'
      : `T2-4 loadModuleContent 存在多处赋值: ${assignSites.join(', ')}（P1-1 猴补丁链复发）`);

  // 路由探针：每个注册模块都能经 loadModuleContent 真实命中（而非落空走默认分支）
  if (typeof sandbox.loadModuleContent === 'function' && reg) {
    const missed = [];
    for (const key of registered) {
      const orig = reg[key];
      let hit = false;
      reg[key] = function (el, subject, mod) { hit = true; return orig.apply(this, arguments); };
      try { sandbox.loadModuleContent('physics', key); } catch (e) { /* 渲染异常不计入路由未命中 */ }
      reg[key] = orig;
      if (!hit) missed.push(key);
    }
    ok(missed.length === 0,
      missed.length === 0
        ? `T2-4 ${registered.length} 个注册模块全部可经 loadModuleContent 命中`
        : `T2-4 路由未命中: ${missed.join(', ')}`);
  } else {
    ok(false, 'T2-4 无法验证路由：loadModuleContent 未挂到 window');
  }
}

// 计分必须读用户实际选择（container.dataset.picked），不能读 style.background
{
  const src = readFileSync(join(APP, 'js/exam-review-system.js'), 'utf8');
  const recordsPick = /checkAnswer[\s\S]{0,1200}?dataset\.picked\s*=/.test(src);
  const scoresByPick = /updateScore[\s\S]{0,1200}?dataset\.picked/.test(src);
  const scoresByBackground = /updateScore[\s\S]{0,1200}?style\.background\s*===/.test(src);

  ok(recordsPick, 'P0-19 checkAnswer 记录 container.dataset.picked');
  ok(scoresByPick && !scoresByBackground,
    scoresByPick && !scoresByBackground
      ? 'P0-19 updateScore 按 dataset.picked 判分（不再读背景色）'
      : scoresByBackground
        ? 'P0-19 updateScore 仍在读 style.background 反推用户选择 → 成绩会恒为 100%'
        : 'P0-19 updateScore 未使用 dataset.picked 判分');

  // 内置题库的答案键必须与解析自洽（）
  const start = src.indexOf('this.quizEngine={');
  if (start >= 0) {
    // 找到与之配对的 " };"（buildQuizEngine 内层对象的闭合）
    const endMark = src.indexOf('\n        };', start);
    const block = src.slice(start, endMark > start ? endMark : start + 20000);
    const bad = [];
    const re = /options\s*:\s*\[([^\]]+)\]\s*,\s*answer\s*:\s*(\d+)\s*,\s*explanation\s*:\s*'([^']*)'/g;
    let m;
    let scanned = 0;
    while ((m = re.exec(block)) !== null) {
      scanned++;
      const opts = m[1].split(',').map((x) => x.trim().replace(/^['"]|['"]$/g, ''));
      const ansIdx = Number(m[2]);
      const expl = m[3];
      const answerVal = opts[ansIdx];

      // 只对「形如 1/n 或 n/m」的选项做一致性检查（比例型答案才可能自相矛盾）。
      // 判定方式：正确答案的值必须**在解析中出现过**。
      // 注意不能只看「解析里出现的第一个分数」—— 解析常含中间量
      // （如「Aa自交→1/4AA+1/2Aa+1/4aa，Aa占1/2；…AaBb=1/4」），
      // 只匹配首个分数会产生大量假阳性。
      if (!/^\d+\/\d+$/.test(String(answerVal))) continue;

      const valsInExpl = new Set((expl.match(/\d+\/\d+/g) || []));
      if (valsInExpl.has(answerVal)) continue; // 解析确实算出了该值 —— 自洽

      // 解析里出现了其他比例值，且恰好是某个**错误选项**的值 → 答案键指错
      const wrongHit = [...valsInExpl].filter((v) => opts.indexOf(v) >= 0 && opts.indexOf(v) !== ansIdx);
      if (wrongHit.length) {
        bad.push(`答案键指向 options[${ansIdx}]="${answerVal}"，但解析算出 ${wrongHit.join('/')}（对应 options[${opts.indexOf(wrongHit[0])}]）`);
      }
    }
    ok(scanned > 0 && bad.length === 0,
      scanned === 0
        ? '[warn] 未扫描到内置互动题（P1-45 检查跳过）'
        : bad.length === 0
          ? `P1-45 内置互动题库 ${scanned} 题的答案键与解析自洽`
          : `${bad.length} 道内置题答案键与解析矛盾: ${bad.join('; ')}`);
  }
}

// 化学式解析必须支持括号（否则方程式配平给出错误答案）
{
  const chem = sandbox.chemistryBalancer;
  const parseFormula = chem && typeof chem.parseFormula === 'function' ? chem.parseFormula.bind(chem) : null;
  if (!parseFormula) {
    ok(false, 'P0-15 找不到 parseFormula（chemistryBalancer.parseFormula）');
  } else {
    const norm = (o) => JSON.stringify(Object.fromEntries(Object.entries(o).sort((a, b) => (a[0] < b[0] ? -1 : 1))));
    const CASES = [
      ['H2O', { H: 2, O: 1 }],
      ['Ca(OH)2', { Ca: 1, O: 2, H: 2 }],       // 化学式解析的典型用例
      ['(NH4)2SO4', { N: 2, H: 8, S: 1, O: 4 }],
      ['Al2(SO4)3', { Al: 2, S: 3, O: 12 }],
      ['Cu(NO3)2', { Cu: 1, N: 2, O: 6 }],
      ['K4[Fe(CN)6]', { K: 4, Fe: 1, C: 6, N: 6 }], // 嵌套方括号
      ['CuSO4·5H2O', { Cu: 1, S: 1, O: 9, H: 10 }],  // 结晶水
      ['Ca3(PO4)2', { Ca: 3, P: 2, O: 8 }]
    ];
    const bad = [];
    for (const [f, expect] of CASES) {
      let got;
      try { got = parseFormula(f); } catch (e) { got = { __err: e.message }; }
      if (norm(got) !== norm(expect)) bad.push(`${f} → ${JSON.stringify(got)}（应为 ${JSON.stringify(expect)}）`);
    }
    ok(bad.length === 0,
      bad.length === 0
        ? `P0-15 化学式解析正确处理括号/嵌套/结晶水（${CASES.length} 个用例）`
        : `${bad.length} 个化学式解析错误:\n      ${bad.join('\n      ')}`);
  }
}

// 所有 navigateTo('xxx') 调用的目标必须真实存在（或已在别名表中登记）
{
  const aliasSrc = readFileSync(join(APP, 'js/app.js'), 'utf8');
  const aliasBlock = /SECTION_ID_ALIAS\s*=\s*\{([\s\S]*?)\n\};/.exec(aliasSrc);
  const aliases = new Map();
  if (aliasBlock) {
    for (const m of aliasBlock[1].matchAll(/'([^']+)'\s*:\s*'([^']+)'/g)) aliases.set(m[1], m[2]);
  }
  const sectionIds = new Set([...html.matchAll(/id="([a-z0-9-]+-section)"/g)].map((m) => m[1]));

  const calls = [];
  for (const f of readdirSync(join(APP, 'js'))) {
    if (!f.endsWith('.js')) continue;
    const src = readFileSync(join(APP, 'js', f), 'utf8');
    src.split('\n').forEach((line, i) => {
      for (const m of line.matchAll(/navigateTo\(\s*'([^']+)'\s*\)/g)) calls.push({ file: f, line: i + 1, id: m[1] });
    });
  }
  const broken = calls.filter((c) => {
    const resolved = aliases.get(c.id) || c.id;
    return !sectionIds.has(resolved + '-section');
  });
  ok(broken.length === 0,
    broken.length === 0
      ? `${calls.length} 处 navigateTo 调用的目标 section 全部存在（含 ${aliases.size} 条别名）`
      : `${broken.length} 处 navigateTo 目标不存在（P0-14 整页空白）:\n      ${broken.map((b) => `${b.file}:${b.line} navigateTo('${b.id}')`).join('\n      ')}`);
}

// 无未定义的内联事件处理器符号
{
  const handlerSyms = new Set();
  for (const m of html.matchAll(/\son(?:click|change|input|keyup|keydown|submit)\s*=\s*["']([A-Za-z_$][\w$]*)\s*\(/g)) {
    handlerSyms.add(m[1]);
  }
  const unresolved = [];
  for (const sym of handlerSyms) {
    if (sandbox[sym] !== undefined) continue;
    // 允许：浏览器内建 / 元素 id 隐式全局
    if (/^(alert|confirm|prompt|print|open|close|focus|blur|submit|reset|scroll|stop|parseInt|parseFloat|isNaN|String|Number|Boolean|Math|JSON|Object|Array|String)$/.test(sym)) continue;
    unresolved.push(sym);
  }
  ok(unresolved.length === 0,
    unresolved.length === 0
      ? `${handlerSyms.size} 个内联事件处理器符号全部可解析`
      : `${unresolved.length} 个内联事件处理器符号未定义: ${unresolved.join(', ')}`);
}

// 未命中的 getElementById 采样（供人工判断 DOM id 是否漂移）
console.log(`\n  [info] getElementById 未命中 ${missingIds.size} 个（假 DOM 仅有静态 id，属正常）`);
if (missingIds.size && missingIds.size < 25) console.log('         ', [...missingIds].slice(0, 25).join(', '));

// 无选项题（245 道）不得崩溃；材料与主观题作答区必须渲染
{
  const sys = sandbox.examPracticeSystem;
  ok(!!sys, 'examPracticeSystem 已挂到 window');
  if (sys && typeof sys.showExamDetail === 'function') {
    const bank = JSON.parse(readFileSync(join(APP, 'data/exam-bank.json'), 'utf8'));
    const all = [];
    for (const k of ['physics', 'chemistry', 'biology', 'math', 'chinese', 'english']) {
      for (const q of (bank[k] && bank[k].questions) || []) all.push(Object.assign({ subject: k }, q));
    }
    const noOpt = all.filter((q) => !Array.isArray(q.options) || q.options.filter((o) => String(o || '').trim() !== '').length < 2);

    // 逐题渲染全部无选项题，任何 TypeError 都会被捕获
    const detailEl = sandbox.document.getElementById('exam-detail');
    const readDetail = () => String((detailEl && detailEl.innerHTML) || '');
    // 主观题作答区是 showExamDetail 动态插入的，静态 id 注册表里没有，手工登记
    sandbox.document.getElementById('exam-subjective-input');
    const crashes = [];
    let passageRendered = 0;
    let subjectiveRendered = 0;
    for (const q of noOpt) {
      try {
        sys.showExamDetail(q.id);
        const html = readDetail();
        if (/subjective-box/.test(html)) subjectiveRendered++;
        if (/question-passage-box/.test(html)) passageRendered++;
      } catch (e) {
        crashes.push(`${q.id}(${q.subject}/${q.type || '空'}): ${e.message}`);
      }
    }
    ok(crashes.length === 0,
      crashes.length === 0
        ? `T0-8 ${noOpt.length} 道无选项题全部渲染成功，主观题作答区命中 ${subjectiveRendered}/${noOpt.length}`
        : `T0-8 ${crashes.length}/${noOpt.length} 道无选项题渲染崩溃:\n      ${crashes.slice(0, 8).join('\n      ')}`);
    ok(noOpt.length === 0 || subjectiveRendered === noOpt.length,
      `T0-8 每道无选项题都有作答区（实际 ${subjectiveRendered}/${noOpt.length}）`);

    // 带 passage 的题必须先渲染材料
    const withPassage = all.filter((q) => q.passage);
    const missingPassage = withPassage.filter((q) => {
      try {
        detailEl.innerHTML = '';
        sys.showExamDetail(q.id);
        return !/question-passage-box/.test(readDetail());
      } catch { return true; }
    });
    ok(missingPassage.length === 0,
      missingPassage.length === 0
        ? `T0-8 ${withPassage.length} 道带 passage 的题均先渲染阅读材料`
        : `T0-8 ${missingPassage.length}/${withPassage.length} 道带 passage 的题未渲染材料: ${missingPassage.slice(0, 5).map((q) => q.id).join(', ')}`);

    // 选择题回归：确认原有 4 选项渲染未被破坏
    try {
      const sample = all.find((q) => Array.isArray(q.options) && q.options.length === 4);
      detailEl.innerHTML = '';
      sys.showExamDetail(sample.id);
      const labels = (readDetail().match(/option-label/g) || []).length;
      ok(labels === 4, `T0-8 选择题选项渲染回归正常（${sample.id} → ${labels} 个选项）`);
    } catch (e) {
      ok(false, `T0-8 选择题渲染回归崩溃: ${e.message}`);
    }

    // submitAnswer 主观题模式不得预先判对
    const subj = noOpt[0];
    if (subj) {
      const before = sys.stats.totalAnswered;
      const r = sys.submitAnswer(subj.id, '任意作答文本', { selfAssess: true });
      ok(r && r.answerMode === 'subjective' && r.isCorrect === false && r.pending === true,
        'T0-8 主观题提交走自评模式（不自动判对，pending 待自评）');
      ok(sys.stats.totalAnswered === before + 1, 'T0-8 主观题提交仍计入答题总数（进度不失真）');
    }
  }
}

// 打卡 key schema 冲突 + "清除数据复活"
{
  const store = sandbox.HSPCBStore;
  ok(!!store, 'HSPCBStore 门面已挂到 window');
  if (store) {
    const ls = sandbox.localStorage;
    const KEY = 'hspcb_daily_checkin';

    // A) 归一化：数组结构 → 对象 map
    const arrNorm = store.normalizeCheckin(['2027-06-05', { date: '2027-06-06' }, null, 123]);
    ok(arrNorm['2027-06-05'] === true && arrNorm['2027-06-06'] === true && Object.keys(arrNorm).length === 2,
      `T0-17 数组形态打卡归一为对象 map（${JSON.stringify(arrNorm)}）`);

    // B) 归一化：对象 map 原样保留，false 值不计入
    const objNorm = store.normalizeCheckin({ '2027-06-07': true, '2027-06-08': false });
    ok(objNorm['2027-06-07'] === true && objNorm['2027-06-08'] === undefined,
      'T0-17 对象 map 中 value=false 的日期不计入打卡');

    // C) 写入 → 读回一致（learning-tools 与 gamification 双写双读同 key 不再冲突）
    ls.removeItem(KEY); ls.removeItem(store.NS + KEY);
    store.markCheckin('2027-06-07');
    store.markCheckin('2027-06-09');
    const days = store.checkinDays();
    ok(days.length === 2 && days[0] === '2027-06-07' && days[1] === '2027-06-09',
      `T0-17 markCheckin/checkinDays 往返一致（${days.join(',')}）`);

    // D) 历史数组结构也能被门面读取（存量用户数据不丢）
    ls.setItem(KEY, JSON.stringify(['2027-05-01', '2027-05-02']));
    ls.removeItem(store.NS + KEY);
    const migrated = store.checkinDays();
    ok(migrated.length === 2 && migrated.includes('2027-05-01'),
      `T0-17 旧裸 key 中的数组结构被自动搬迁并归一（${migrated.join(',')}）`);

    // E) 清除数据复活：remove 后再读不得拿回旧值
    store.remove(KEY);
    const afterClear = store.checkinDays();
    const bareStillThere = ls.getItem(KEY);
    ok(afterClear.length === 0 && bareStillThere === null,
      bareStillThere === null
        ? 'T0-17 remove 同时清除旧裸 key，清除后数据不复活'
        : `T0-17 remove 未清旧裸 key（仍有 ${bareStillThere}）→ 点"清除数据"后 get() 会把它搬回来`);

    // F) unmark 单日撤销
    store.markCheckin('2027-06-10');
    store.unmarkCheckin('2027-06-09');
    ok(store.checkinDays().length === 1 && store.checkinDays()[0] === '2027-06-10',
      'T0-17 unmarkCheckin 可撤销单日打卡');

    // G) 两个消费方必须走归一化 API，不得再各自判定结构
    const lsrc = readFileSync(join(APP, 'js/learning-tools.js'), 'utf8');
    const gsrc = readFileSync(join(APP, 'js/gamification-system.js'), 'utf8');
    ok(/HSPCBStore\.getCheckin/.test(lsrc) && /HSPCBStore\.markCheckin/.test(lsrc),
      'T0-17 learning-tools 读写均走归一化 API');
    ok(!/safeParse\(HSPCBStore\.getItem\('hspcb_daily_checkin'\)/.test(gsrc),
      'T0-17 gamification-system 不再对打卡 key 做 Array.isArray 结构判定');
  }
}

// 模考题型映射 + 主观题判分 + 搜索路由
{
  const me = sandbox.mockExam;
  ok(!!me, 'mockExam 模块已挂到 window');
  if (me && me.__test) {
    const T = me.__test;

    // 1) 题型映射：卷面题型必须能命中题库候选，否则全靠 fallback 随机抽题
    let mappedSlots = 0;
    let totalSlots = 0;
    const unmapped = [];
    for (const subj of Object.keys(T.EXAM_CONFIG)) {
      for (const slot of T.EXAM_CONFIG[subj].structure) {
        totalSlots++;
        const pool = T.getQuestionPool(subj);
        const groups = T.groupByType(pool, slot.type);
        if ((groups[slot.type] || []).length > 0) mappedSlots++;
        else unmapped.push(`${subj}/${slot.type}`);
      }
    }
    ok(unmapped.length === 0,
      unmapped.length === 0
        ? `T0-18 组卷题型映射 ${mappedSlots}/${totalSlots} 个槽位全部命中题库候选`
        : `T0-18 ${unmapped.length}/${totalSlots} 个卷面题型映射未命中（退化为随机兜底）: ${unmapped.join(', ')}`);

    // 2) 实际组卷：题数必须填满，且不得有重复题
    for (const subj of Object.keys(T.EXAM_CONFIG)) {
      const built = T.buildExam(subj);
      const expect = T.EXAM_CONFIG[subj].structure.reduce((a, s) => a + s.count, 0);
      const got = built.questions.length;
      const ids = new Set(built.questions.map((q) => q.id));
      ok(got === expect && ids.size === got,
        `T0-18 ${subj} 组卷题数正确且无重复（${got}/${expect}，唯一 ${ids.size}）`);
      ok(built.slotSummary.every((s) => !s.includes('映射未命中')),
        `T0-18 ${subj} 组卷无未命中槽位（${built.slotSummary.join(' | ')}）`);
    }

    // 3) 判分模式：卷面标注「作文」的题必须是 essay 模式；无选项题绝不能是 single
    const cn = T.buildExam('chinese');
    const essayQ = cn.questions.find((q) => q.type === '作文');
    ok(essayQ && essayQ.answerMode === 'essay' && essayQ.isEssay === true,
      essayQ ? `T0-18 语文作文槽判分模式为 essay（${essayQ.id}）` : 'T0-18 语文卷未抽出作文题');

    let badMode = 0;
    let subjective = 0;
    for (const subj of Object.keys(T.EXAM_CONFIG)) {
      for (const q of T.buildExam(subj).questions) {
        if (q.answerMode === 'subjective' || q.answerMode === 'essay') subjective++;
        // 标注为客观题却抽到无选项题 → 判分必错
        if ((q.answerMode === 'single' || q.answerMode === 'multi') && !T.hasOptions(q)) badMode++;
      }
    }
    ok(badMode === 0,
      badMode === 0
        ? `T0-18 无"标注客观题却无选项"的错配（主观题 ${subjective} 道）`
        : `T0-18 ${badMode} 道题被标注为客观题但实际无选项，判分必然错误`);

    // 4) pickModeFor 覆盖：作文槽即便抽到有选项的题也必须是 essay
    ok(T.pickModeFor('作文', { options: ['A', 'B'], answer: 'A' }) === 'essay',
      'T0-18 作文槽强制 essay 模式（不因抽到选项而变客观）');
    ok(T.pickModeFor('单选', { options: null, answer: 'x' }) === 'subjective',
      'T0-18 单选槽抽到无选项题时降级为 subjective（而非错误地按字母判分）');
  }

  // 5) 搜索路由：非 section 型工具必须有专门路由，不能落进 navigateTo 死路
  {
    const gsrc = readFileSync(join(APP, 'js/global-search.js'), 'utf8');
    const html = readFileSync(join(APP, 'index.html'), 'utf8');
    const toolIds = new Set([...html.matchAll(/data-tool="([^"]+)"/g)].map((m) => m[1]));
    const noSection = [...toolIds].filter((t) => !html.includes(`id="${t}-section"`));
    const routed = noSection.filter((t) => new RegExp(`'${t}'\\s*:`).test(gsrc));
    ok(noSection.length === 0 || routed.length === noSection.length,
      noSection.length === 0
        ? `T0-18 ${toolIds.size} 个工具全部有对应 section`
        : `T0-18 ${routed.length}/${noSection.length} 个非 section 工具已专门路由（${routed.join(', ')}）`);

    const unmappedRoute = [...routed].filter((t) => {
      const m = gsrc.match(new RegExp(`'${t}'\\s*:\\s*function`));
      return !m;
    });
    ok(unmappedRoute.length === 0,
      unmappedRoute.length === 0
        ? 'T0-18 专门路由均为可调用函数（非占位）'
        : `T0-18 路由未指向函数: ${unmappedRoute.join(', ')}`);

    // 路由目标必须真的存在于 window
    // e：原内联主逻辑外置为 js/main-inline.js（仍为非 defer 解析期执行），
    // 导出语句随之外移，静态断言改读该文件
    const mainSrc = readFileSync(join(APP, 'js', 'main-inline.js'), 'utf8');
    ok(/window\.handlePlatformTab\s*=\s*handlePlatformTab/.test(mainSrc),
      'T0-18 handlePlatformTab 已导出到 window（搜索路由目标可解析）');
    ok(typeof sandbox.handlePlatformTab === 'function',
      'T0-18 handlePlatformTab 在运行时可解析');
    ok(typeof sandbox.showSection === 'function' && typeof sandbox.setActiveNav === 'function',
      'T0-18 showSection/setActiveNav 在运行时可解析');
  }
}

// 工具模块 P0 与静默失败
{
  const R = (f) => readFileSync(join(APP, 'js', f), 'utf8');

  // --- 计时器摧毁 UI ---
  {
    const src = R('content-deep-v3.js');
    ok(/id="ct-timer"/.test(src), 'T0-13 计时器节点带 id="ct-timer"（可精确定位）');
    // 禁止用 innerHTML 覆写祖先节点来刷新计时文字
    const badOverwrite = /querySelectorAll\('#choice-tricks-app div'\)[\s\S]{0,400}?\.innerHTML\s*=\s*'已用时/.test(src);
    ok(!badOverwrite,
      badOverwrite
        ? 'T0-13 计时器仍用 innerHTML 覆写匹配到的 div → 可能把整个秒杀技巧库 UI 替换掉'
        : 'T0-13 计时器不再用 innerHTML 覆写祖先容器');
    ok(/getElementById\('ct-timer'\)[\s\S]{0,200}?textContent\s*=/.test(src),
      'T0-13 计时器只改叶子节点 textContent');
  }

  // --- 计时训练 ---
  {
    const src = R('missing-tools-part2.js');
    // .bind(this) 用在 map 回调里会让返回值变成函数
    ok(!/\.map\(function\s*\([^)]*\)\s*\{[^}]*return[^}]*\}\s*\)\.bind\(/.test(src),
      'T0-13 map 回调不再误用 .bind(this)（否则 pool 全是函数）');

    const tq = sandbox.timedQuiz;
    ok(!!tq, 'timedQuiz 已挂到 window');

    if (tq && typeof tq.__probe === 'function') {
      const r = tq.__probe();
      ok(r.poolAllSubjects > 0 && r.allEntriesAreObjects,
        `T0-13 「全科综合」题池可用（${r.poolAllSubjects} 题，全部为题目对象）`);
      ok(r.startedWithoutDom && r.retryOk,
        r.retryOk ? 'T0-13 设置页 DOM 缺席时 _start 可用，且 _retry 能重建题组' : 'T0-13 _retry 仍依赖已卸载的设置页 DOM → 结果页「再来一组」必崩');
    } else {
      // 无 probe 钩子时退回静态断言
      ok(/_start\(opts\)/.test(src) && /opts \|\| \{\}/.test(src),
        'T0-13 _start 接受可选配置对象（供 _retry 复用）');
      ok(/subject:\s*this\.state\.subject/.test(src),
        'T0-13 _retry 用 state 记忆的 subject/time/count 重建题池');
    }
  }

  // --- 静默失败 ---
  {
    // 数据路径必须相对 index.html，不能用 ../data/
    const ce2 = R('content-enhanced-v2.js');
    const badUrls = [...ce2.matchAll(/_dataUrl:\s*'([^']+)'/g)].map((m) => m[1]).filter((u) => u.startsWith('../'));
    ok(badUrls.length === 0,
      badUrls.length === 0
        ? "T0-14 content-enhanced-v2 数据路径不再用 '../data/'（原为永久 404）"
        : `T0-14 仍使用会 404 的路径: ${badUrls.join(', ')}`);

    // 引用的数据文件必须真实存在
    const urls = [...ce2.matchAll(/_dataUrl:\s*'([^']+)'/g)].map((m) => m[1]);
    const missing = urls.filter((u) => !existsSync(join(APP, u)));
    ok(missing.length === 0,
      missing.length === 0
        ? `T0-14 引用的 ${urls.length} 个数据文件均存在`
        : `T0-14 数据文件缺失: ${missing.join(', ')}`);

    // #main-content 不存在，必须回退到 <main>
    const cEnh = R('content-enhancement.js');
    ok(!/getElementById\('main-content'\)\s*;\s*\n\s*if\(!mainContent\)\s*return;/.test(cEnh),
      'T0-14 addNewSections 不再因 #main-content 不存在而直接 return');
    ok(/getElementById\('main-content'\)[\s\S]{0,120}?querySelector\('main'\)/.test(cEnh),
      "T0-14 addNewSections 回退到真实容器 <main>");

    // 容器修正后，被创建的 section 必须真的能被 navigateTo 命中
    const cEnhObj = sandbox.contentEnhancement || sandbox.ContentEnhancer;
    const hasHook = cEnhObj && typeof cEnhObj.addNewSections === 'function';
    ok(!hasHook || /periodic-table-section/.test(R('content-enhancement.js')),
      hasHook
        ? 'T0-14 动态创建的 section（含 periodic-table-section）代码在位'
        : 'T0-14 contentEnhancement 挂载情况需人工确认');

    // 打卡契约冲突已由 解决，这里做交叉确认
    ok(/getCheckin|checkinDays/.test(R('gamification-system.js')),
      'T0-14 打卡契约冲突已消解（gamification 走归一化 API）');
  }

// 仪表盘数据源必须是**真实写入方**，不得读无写入方的裸 key
{
  const dash = sandbox.studyDashboard;
  ok(!!dash, 'studyDashboard 已挂到 window');
  if (dash) {
    // 无写入方的裸 key（历史上导致仪表盘恒空）
    const ORPHAN_KEYS = ['hspcb_game_scores', 'hspcb_recitation_scores'];
    const src = readFileSync(join(APP, 'js', 'study-dashboard.js'), 'utf8');
    // 剥离注释后再匹配，避免注释里的历史说明造成误报
    const codeOnly = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
    const stillReading = ORPHAN_KEYS.filter((k) => codeOnly.includes(k));
    ok(stillReading.length === 0,
      stillReading.length === 0
        ? '仪表盘不再读取无写入方的裸 key（hspcb_game_scores / hspcb_recitation_scores）'
        : `仪表盘仍在读无写入方的裸 key: ${stillReading.join(', ')}`);

    // gatherData 在空 localStorage 下应返回结构完整、不抛错
    if (typeof dash.gatherData === 'function') {
      let d = null, threw = null;
      try { d = dash.gatherData(); } catch (e) { threw = e.message; }
      ok(!threw && d && Array.isArray(d.examHistory) && Array.isArray(d.gameScores)
        && Array.isArray(d.recitationScores) && Array.isArray(d.errorNotebook),
        threw ? `gatherData 抛错: ${threw}` : 'gatherData 返回结构完整（4 个数组均就绪）');
    }
  }
}
}

// 归档宣传页（promo/presentation）的工具数量必须与 index.html 的
// data-tool 注册表一致，且页面内部自洽（分科之和 = 总数，无重复计数）。
// 期望值从 1.1/index.html 实时推导，避免门禁与事实漂移。
{
  const ARCH = join(ROOT, '1.1');
  const idxHtml = readFileSync(join(ARCH, 'index.html'), 'utf8');
  const tools = [...new Set([...idxHtml.matchAll(/data-tool="([^"]+)"/g)].map((m) => m[1]))];
  // 按主标签归类（secondary-conclusions 为物化共用，按其 tool-tag=physics 归物理，只计一次）
  const subjectOf = (t) =>
    t.startsWith('physics-') || t === 'secondary-conclusions' ? 'physics'
      : t.startsWith('chemistry-') || t === 'valence-atlas' ? 'chemistry'
        : t.startsWith('biology-') ? 'biology' : 'platform';
  const counts = { physics: 0, chemistry: 0, biology: 0, platform: 0 };
  for (const t of tools) counts[subjectOf(t)]++;
  const total = tools.length;
  ok(total === 32,
    `1.1 data-tool 注册表共 ${total} 个工具（物理 ${counts.physics} / 化学 ${counts.chemistry} / 生物 ${counts.biology} / 平台 ${counts.platform}）`);
  ok(counts.physics + counts.chemistry + counts.biology + counts.platform === total,
    '分科数量之和等于总数（共用工具只计一次）');

  const promo = readFileSync(join(ARCH, 'promo.html'), 'utf8');
  const pres = readFileSync(join(ARCH, 'presentation.html'), 'utf8');
  // 早期只允许以「首期18款」里程碑形态存在于路线图 slide
  const withoutMilestone = (s) => s.replace(/首期18款核心工具开发完成/g, '');
  ok(!/18款|27款/.test(withoutMilestone(promo)),
    'promo.html 不再出现旧口径「18款/27款」');
  ok(!/18款|27款/.test(withoutMilestone(pres)),
    'presentation.html 除「首期18款」里程碑外不再出现旧口径「18款/27款」');

  const N = { total, ...counts };
  // 只锁「数字与注册表一致」，不锁营销措辞。措辞已去营销腔（「款交互式学习工具」→「个工具入口」），
  // 若继续用字面量匹配，改一次文案就要改一次门禁，门禁反而在保护旧话术。
  const num = (n) => new RegExp(`(?<![\\d.])${n}(?![\\d.])`);
  const inTag = (s, tag, n) => new RegExp(`<${tag}[^>]*>\\s*${n}(?![\\d.])`).test(s);
  const near = (s, n, ...ctx) => ctx.every((c) => num(n).test(c) && num(n).test(s));

  ok(num(N.total).test(promo.match(/<p class="hero-subtitle">([^<]*)</)?.[1] || '')
    && inTag(promo, 'span class="hero-stat-num"', N.total)
    && inTag(promo, 'span class="stats-value"', N.total),
    `promo.html 总量三处（hero 副标题/hero 数字/统计卡）均为 ${N.total}`);
  ok([N.physics, N.chemistry, N.biology, N.platform].every((n) =>
      new RegExp(`<span class="stats-value">\\s*${n}\\b`).test(promo)),
    `promo.html 统计卡分科数量与注册表一致（${N.physics}/${N.chemistry}/${N.biology}/${N.platform}）`);
  ok([N.physics, N.chemistry, N.biology].every((n) =>
      new RegExp(`<p class="section-desc">\\s*${n}\\b[^<]*</p>`).test(promo)),
    `promo.html 分科 section-desc 与注册表一致（${N.physics}/${N.chemistry}/${N.biology}）`);

  ok(num(N.total).test(pres.match(/<p class="subtitle">([^<]*)</)?.[1] || '')
    && pres.includes(`data-count="${N.total}"`)
    && num(N.total).test(pres.match(/<p class="intro-text-large">([\s\S]*?)<\/p>/)?.[1] || '')
    && num(N.total).test(pres.match(/<p class="promo-text">([^<]*)</)?.[1] || '')
    && inTag(pres, 'span class="fs-num"', N.total),
    `presentation.html 总量六处（副标题/计数动画/简介/价值卡/结尾口号/尾页统计）均为 ${N.total}`);
  ok([N.physics, N.chemistry, N.biology].every((n) =>
      new RegExp(`<span class="tool-count">\\s*${n}\\b`).test(pres)),
    `presentation.html 分科角标与注册表一致（${N.physics}/${N.chemistry}/${N.biology}）`);
}

// 设计令牌一致性 —— 六科卡片必须走令牌类，明暗两套色板各自互异，
// 且暗色下学科色条不被通用补丁拍平。
{
  const SUBJECT_TOKENS = ['physics', 'chemistry', 'biology', 'chinese', 'math', 'english'];
  const tokens = readFileSync(join(APP, 'css', 'tokens.css'), 'utf8');
  const dark = readFileSync(join(APP, 'css', 'theme-dark.css'), 'utf8');
  const style = readFileSync(join(APP, 'css', 'style.css'), 'utf8');

  // 取 :root 块 / [data-theme="dark"] 块里的 --xxx: #hex
  const palette = (css, blockRe) => {
    const m = blockRe.exec(css);
    const map = {};
    if (m) for (const t of m[0].matchAll(/--([a-z-]+)\s*:\s*([^;]+);/g)) map[t[1]] = t[2].trim();
    return map;
  };
  const light = palette(tokens, /:root\s*\{[\s\S]*?\n\}/);
  const darkPal = palette(dark, /\[data-theme="dark"\]\s*\{[\s\S]*?\n\}/);

  for (const [name, pal] of [['浅色', light], ['暗色', darkPal]]) {
    const missing = SUBJECT_TOKENS.filter((s) => !pal[s]);
    ok(missing.length === 0,
      missing.length === 0
        ? `T3-1 ${name}色板六科学科令牌齐全`
        : `T3-1 ${name}色板缺少学科令牌: ${missing.join(', ')}`);
    const vals = SUBJECT_TOKENS.map((s) => pal[s]).filter(Boolean);
    const dup = vals.filter((v, i) => vals.indexOf(v) !== i);
    ok(dup.length === 0,
      dup.length === 0
        ? `T3-1 ${name}色板六科色相互不相同（${SUBJECT_TOKENS.map((s) => pal[s]).join(' / ')}）`
        : `T3-1 ${name}色板存在重复色相: ${[...new Set(dup)].join(', ')}`);
  }

  // 静态 HTML 中的 subject-card 不得带内联样式（JS 生成的知识卡颜色属内容级，归 ）
  const idxHtml2 = readFileSync(join(APP, 'index.html'), 'utf8');
  const staticHtml = idxHtml2.replace(/<script[\s\S]*?<\/script>/g, '');
  const inlineCards = [...staticHtml.matchAll(/<div class="subject-card[^"]*"[^>]*style="([^"]*)"/g)];
  ok(inlineCards.length === 0,
    inlineCards.length === 0
      ? 'T3-1 六张学科卡全部走令牌类，静态 HTML 无内联 border-left'
      : `T3-1 仍有学科卡使用内联样式: ${inlineCards.map((m) => m[1]).join(' | ')}`);
  for (const s of SUBJECT_TOKENS) {
    ok(new RegExp(`<div class="subject-card ${s}">`).test(staticHtml),
      `T3-1 首页存在 .subject-card.${s} 卡片`);
  }

  // style.css 必须有 english 的卡片与导航规则；暗色必须保留学科色条
  ok(/\.subject-card\.english\s*\{[^}]*border-left:\s*4px solid var\(--english\)/.test(style),
    'T3-1 style.css 定义 .subject-card.english（border-left 走 --english 令牌）');
  ok(/\.nav-btn-english\.active\s*\{[^}]*var\(--english\)/.test(style),
    'T3-1 style.css 补齐 .nav-btn-english.active（此前英语导航按钮无高亮规则）');
  const darkBorderKept = SUBJECT_TOKENS.filter((s) =>
    new RegExp(`\\[data-theme="dark"\\] \\.subject-card\\.${s}\\s*\\{[^}]*border-left-color:\\s*var\\(--${s}\\)`).test(dark));
  ok(darkBorderKept.length === SUBJECT_TOKENS.length,
    darkBorderKept.length === SUBJECT_TOKENS.length
      ? 'T3-1 暗色下六科学科色条均保留（不被 border-color 通用补丁拍平）'
      : `T3-1 暗色下学科色条被拍平: ${SUBJECT_TOKENS.filter((s) => !darkBorderKept.includes(s)).join(', ')}`);
}

// PWA manifest 修正：真实图标文件 + 名称统一 + 六科 shortcuts + 深链完整。
// 背景（DEV-PLAN ）：原 manifest 用 4 个 data: URI 图标（Chrome 安装不支持）、
// name 缺「英」、short_name 是内部代号 HSPCB、shortcuts 缺语文/英语；
// 且 shortcuts 声明的 index.html?subject=X 此前全仓无消费方（深链是坏的，点击只打开首页）。
{
  const manifest = JSON.parse(readFileSync(join(APP, 'manifest.json'), 'utf8'));
  ok(manifest.name === '高中物化生语数英学习大礼包',
    `T3-2 manifest.name 覆盖六科（当前: ${manifest.name}）`);
  ok(manifest.short_name === '高考备考' && !/HSPCB/i.test(manifest.short_name),
    `T3-2 manifest.short_name 为「高考备考」而非内部代号（当前: ${manifest.short_name}）`);

  const icons = manifest.icons || [];
  ok(icons.length > 0 && icons.every((i) => !/^data:/.test(i.src)),
    'T3-2 manifest 图标全部为真实文件（无 data: URI，Chrome 安装要求）');
  const iconSrcs = icons.map((i) => i.src);
  const missingFiles = iconSrcs.filter((src) => !existsSync(join(APP, src)));
  ok(missingFiles.length === 0,
    missingFiles.length === 0
      ? `T3-2 manifest 图标文件全部存在（${iconSrcs.join(', ')}）`
      : `T3-2 manifest 图标文件缺失: ${missingFiles.join(', ')}`);
  ok(icons.some((i) => i.sizes === '192x192') && icons.some((i) => i.sizes === '512x512'),
    'T3-2 manifest 含 192x192 与 512x512 图标');
  ok(icons.some((i) => i.purpose === 'maskable' && i.sizes === '512x512'),
    'T3-2 manifest 含 512x512 maskable 图标');
  ok(icons.some((i) => i.type === 'image/svg+xml'),
    'T3-2 manifest 含 SVG 矢量图标');

  const SUBJECT_KEYS = ['physics', 'chemistry', 'biology', 'math', 'chinese', 'english'];
  const shortcuts = manifest.shortcuts || [];
  const shortcutUrls = shortcuts.map((s) => s.url);
  const missingShortcuts = SUBJECT_KEYS.filter((k) => !shortcutUrls.includes(`index.html?subject=${k}`));
  ok(missingShortcuts.length === 0,
    missingShortcuts.length === 0
      ? `T3-2 shortcuts 覆盖六科（${shortcuts.length} 个）`
      : `T3-2 shortcuts 缺少学科: ${missingShortcuts.join(', ')}`);
  ok(shortcuts.length > 0 && shortcuts.every((s) => /^index\.html\?subject=[a-z]+$/.test(s.url)),
    'T3-2 shortcuts URL 均为 index.html?subject=<key> 形态');

  const sw = readFileSync(join(APP, 'sw.js'), 'utf8');
  const swIcons = ['icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'];
  const missingSw = swIcons.filter((i) => !sw.includes(`'${i}'`));
  ok(missingSw.length === 0,
    missingSw.length === 0
      ? 'T3-2 sw.js CORE_ASSETS 预缓存全部 4 个图标文件'
      : `T3-2 sw.js 未预缓存图标: ${missingSw.join(', ')}`);

  const idxHtml3 = readFileSync(join(APP, 'index.html'), 'utf8');
  ok(/<link rel="icon" href="icons\/icon\.svg"/.test(idxHtml3),
    'T3-2 index.html 声明 rel="icon" → icons/icon.svg');
  ok(/<link rel="apple-touch-icon" href="icons\/icon-192\.png"/.test(idxHtml3),
    'T3-2 index.html 声明 apple-touch-icon → icons/icon-192.png');

  // 深链完整性：shortcuts 的 ?subject= 必须有消费方，且白名单从页面导航实时推导
  const appJs = readFileSync(join(APP, 'js', 'app.js'), 'utf8');
  ok(/URLSearchParams\(window\.location\.search\)/.test(appJs) && /\.get\('subject'\)/.test(appJs),
    'T3-2 app.js 消费 ?subject= URL 参数（shortcuts 深链可用）');
  ok(/querySelectorAll\('\.nav-btn\[data-subject\]'\)/.test(appJs),
    'T3-2 深链白名单从 .nav-btn[data-subject] 实时推导（不写死集合）');
  ok(/navigateTo\(subject\)/.test(appJs),
    'T3-2 深链复用 navigateTo 完成跳转');

  // 行为级验证：给沙箱 location 带上 ?subject= 后重放 DOMContentLoaded，
  // 断言对应 section 被激活；非法参数不得导航到任何 section。
  // （块位于本脚本末尾，重放副作用不影响后续断言。）
  const dclFns = listeners.get('DOMContentLoaded') || [];
  const replayDcl = (search) => {
    sandbox.location.search = search;
    for (const fn of dclFns) { try { fn(); } catch (e) { /* 重放异常不影响断言目标 */ } }
  };
  const engSec = document.getElementById('english-section');
  const mathSec = document.getElementById('math-section');
  ok(engSec !== null && mathSec !== null,
    'T3-2 行为前置: english-section / math-section 均在首页静态 id 注册表');
  if (engSec && mathSec) {
    engSec.classList.remove('active');
    replayDcl('?subject=english');
    ok(engSec.classList.contains('active'),
      'T3-2 行为验证: index.html?subject=english 重放后 english-section 被激活');
    mathSec.classList.remove('active');
    replayDcl('?subject=not-a-real-subject');
    ok(!mathSec.classList.contains('active'),
      'T3-2 行为验证: 非法 subject 参数被白名单拦截，不触发导航');
    replayDcl('');
  }
}

console.log(`\n结果: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);