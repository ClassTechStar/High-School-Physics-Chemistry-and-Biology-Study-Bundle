/**
 * runtime-defer-check.mjs — 在 Node 里按浏览器真实语义复现 index.html 的脚本执行顺序，
 * 并验证「defer 时序类」缺陷是否已修复。
 *
 * 背景（P0-10 / P0-11 / P0-13）：
 *   内联 <script>（无 defer）在**解析期**执行，<script defer> 在**解析完成后**按 DOM 顺序执行。
 *   因此解析期读 window.SomeDeferredModule 必然得到 undefined。
 *   本脚本用 jsdom 之外的极简实现（避免新增依赖）复现该顺序，并断言：
 *     1. index.html 内联脚本中不再有解析期捕获 defer 模块的写法
 *     2. 所有 defer 模块在最后一个内联脚本之后都能被读到
 *     3. chineseSearch / loadModuleContent / render*Experiments 等确实挂到了 window
 */
import { readFileSync, readdirSync } from 'node:fs';
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
  // 非 defer 的外部脚本 + 内联脚本 = 解析期执行集合
  const parseTimeFiles = [...inlineScripts.map(() => null), ...plainScripts.map((s) => s.src)];

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
  for (const seg of inlineScripts) {
    if (!seg.code) continue;
    const clean = stripComments(seg.code);
    clean.split('\n').forEach((line, i) => {
      if (/^[ \t]/.test(line)) return; // 缩进 = 在函数/块内
      const m = /\b(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*window\.([A-Za-z_$][\w$]*)/.exec(line);
      if (!m) return;
      const sym = m[2];
      if (deferredSymbols.has(sym)) {
        violations.push(`顶层 var ${m[1]} = window.${sym}（${deferredSymbols.get(sym)} 为 defer 模块）@inline#${i + 1}`);
      }
    });
  }
  ok(violations.length === 0,
    violations.length === 0
      ? '内联脚本无解析期捕获 defer 模块的写法'
      : `发现 ${violations.length} 处解析期捕获：\n      - ${violations.join('\n      - ')}`);

  // 内联脚本里不应再有「解析期必然为假的 typeof 守卫」
  // 顶层 `typeof X !== 'undefined'` 且 X 由 defer 模块提供 → 解析期必然为假，守卫失效。
  // 函数体内的 typeof 守卫是正确写法（调用时 defer 已就绪），不报。
  const bogusGuards = [];
  for (const seg of inlineScripts) {
    if (!seg.code) continue;
    stripComments(seg.code).split('\n').forEach((line, i) => {
      if (/^[ \t]/.test(line)) return;
      const m = /typeof\s+([A-Za-z_$][\w$]*)\s*!==?\s*['"]undefined['"]/.exec(line);
      if (m && deferredSymbols.has(m[1])) bogusGuards.push(`${m[1]}@inline#${i + 1}`);
    });
  }
  ok(bogusGuards.length === 0,
    bogusGuards.length === 0
      ? '内联脚本顶层无依赖解析期时序的 typeof 守卫'
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
// 沙箱无 fetch，init() 拿不到题库；手动注入真实数据供 T0-8 渲染断言使用
{
  const sys = sandbox.examPracticeSystem;
  if (sys) {
    const bank = JSON.parse(readFileSync(join(APP, 'data/exam-bank.json'), 'utf8'));
    sys.examData = bank;
    sys.loadStats = () => {};
    sys.saveStats = () => {};
    sys.refreshStats = () => {};
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
ok(!html.includes('toggleNav'), 'P0-13 toggleNav 引用已全部移除');
ok(!html.includes("window.ComprehensiveData = CD"), 'P0-10 不再用失效捕获值覆写全局');

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

// P0-19: 计分必须读用户实际选择（container.dataset.picked），不能读 style.background
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

  // 内置题库的答案键必须与解析自洽（P1-45）
  const start = src.indexOf('this.quizEngine={');
  if (start >= 0) {
    // 找到与之配对的 "        };"（buildQuizEngine 内层对象的闭合）
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

// P0-15: 化学式解析必须支持括号（否则方程式配平给出错误答案）
{
  const chem = sandbox.chemistryBalancer;
  const parseFormula = chem && typeof chem.parseFormula === 'function' ? chem.parseFormula.bind(chem) : null;
  if (!parseFormula) {
    ok(false, 'P0-15 找不到 parseFormula（chemistryBalancer.parseFormula）');
  } else {
    const norm = (o) => JSON.stringify(Object.fromEntries(Object.entries(o).sort((a, b) => (a[0] < b[0] ? -1 : 1))));
    const CASES = [
      ['H2O', { H: 2, O: 1 }],
      ['Ca(OH)2', { Ca: 1, O: 2, H: 2 }],       // 报告 P0-15 的核心用例
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

// P0-14: 所有 navigateTo('xxx') 调用的目标必须真实存在（或已在别名表中登记）
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

// T0-8 / P0-12: 无选项题（245 道）不得崩溃；材料与主观题作答区必须渲染
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

console.log(`\n结果: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);