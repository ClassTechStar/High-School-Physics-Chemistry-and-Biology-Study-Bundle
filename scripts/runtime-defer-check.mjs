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
    innerHTML: '', textContent: '', value: '', disabled: false,
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

console.log(`\n结果: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);