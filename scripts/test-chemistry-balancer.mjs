/**
 * test-chemistry-balancer.mjs — 化学配平器纯函数单测（v1.9 §7.2）
 *
 * 只加载 app-chemistry.js 里的 chemistryBalancer 对象（文件其余部分是 DOM 工具），
 * 通过 vm + 最小 DOM stub 取到顶层 `const chemistryBalancer`。
 * 覆盖：括号/嵌套/结晶水解析、常见反应配平、原子守恒自检。
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

/** 最小 DOM stub：只为让 app-chemistry.js 顶层代码不抛错 */
function stubEl() {
  const el = {
    style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    children: [], innerHTML: '', textContent: '', value: '',
    appendChild(c) { this.children.push(c); return c; },
    insertBefore(c) { this.children.push(c); return c; },
    removeChild() {}, remove() {}, setAttribute() {}, getAttribute: () => null,
    addEventListener() {}, removeEventListener() {}, querySelector: () => stubEl(),
    querySelectorAll: () => [], closest: () => null, focus() {}, click() {},
    getBoundingClientRect: () => ({ width: 300, height: 150, top: 0, left: 0 }),
    getContext: () => ({
      clearRect() {}, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
      fill() {}, arc() {}, closePath() {}, save() {}, restore() {}, translate() {}, rotate() {},
      scale() {}, setTransform() {}, fillText() {}, measureText: () => ({ width: 10 }),
      createLinearGradient: () => ({ addColorStop() {} }), drawImage() {}, setLineDash() {},
    }),
    width: 300, height: 150, offsetWidth: 300, offsetHeight: 150,
  };
  return el;
}

function boot() {
  const documentStub = {
    readyState: 'complete',
    addEventListener() {}, removeEventListener() {},
    createElement: () => stubEl(),
    createElementNS: () => stubEl(),
    createTextNode: () => stubEl(),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    body: stubEl(),
    documentElement: stubEl(),
    head: stubEl(),
  };
  const sandbox = {
    console, document: documentStub, window: {},
    navigator: { userAgent: 'node', language: 'zh-CN', maxTouchPoints: 0 },
    location: { search: '', href: 'http://x/', pathname: '/' },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {}, key: () => null, length: 0 },
    setTimeout, clearTimeout, setInterval, clearInterval, requestAnimationFrame: (f) => setTimeout(f, 0),
    Date, Math, JSON, Promise, Number, String, Array, Object, RegExp, parseInt, parseFloat, isNaN,
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
    alert() {}, confirm: () => true,
    CustomEvent: class {}, Event: class {},
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  // 先装载配平器依赖的存储/工具层（提供 HSPCBStore / CommonUtils 等全局）
  for (const dep of ['js/common-utils.js', 'js/progress.js']) {
    vm.runInContext(readFileSync(join(APP, dep), 'utf8'), sandbox, { filename: dep });
  }
  const code = readFileSync(join(APP, 'js', 'app-chemistry.js'), 'utf8');
  vm.runInContext(code, sandbox, { filename: 'app-chemistry.js' });
  // 顶层 const 不会挂到 window，用同一 context 求值取引用
  return vm.runInContext('typeof chemistryBalancer === "undefined" ? null : chemistryBalancer', sandbox);
}

const B = boot();
ok(!!B, 'chemistryBalancer 可从 app-chemistry.js 取到');

if (B) {
  // 解析：括号 / 嵌套 / 结晶水
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  ok(eq(B.parseFormula('Ca(OH)2'), { Ca: 1, O: 2, H: 2 }), 'Ca(OH)2 → Ca1 O2 H2（括号展开）');
  ok(eq(B.parseFormula('(NH4)2SO4'), { N: 2, H: 8, S: 1, O: 4 }), '(NH4)2SO4 → N2 H8 S1 O4（嵌套外倍数）');
  ok(eq(B.parseFormula('Al2(SO4)3'), { Al: 2, S: 3, O: 12 }), 'Al2(SO4)3 → Al2 S3 O12');
  ok(eq(B.parseFormula('H2O'), { H: 2, O: 1 }), 'H2O → H2 O1');

  // 配平：返回系数数组，且原子守恒
  function atomsOf(formula, coeff) {
    const a = B.parseFormula(formula);
    const out = {};
    for (const k in a) out[k] = a[k] * coeff;
    return out;
  }
  function conserved(reactants, products, coeffs) {
    const left = {}, right = {};
    reactants.forEach((f, i) => {
      const a = atomsOf(f, coeffs[i]);
      for (const k in a) left[k] = (left[k] || 0) + a[k];
    });
    products.forEach((f, i) => {
      const a = atomsOf(f, coeffs[reactants.length + i]);
      for (const k in a) right[k] = (right[k] || 0) + a[k];
    });
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    for (const k of keys) if ((left[k] || 0) !== (right[k] || 0)) return false;
    return true;
  }

  const cases = [
    [['Fe', 'O2'], ['Fe2O3'], 'Fe + O2 → Fe2O3'],
    [['H2', 'O2'], ['H2O'], 'H2 + O2 → H2O'],
    [['Al', 'HCl'], ['AlCl3', 'H2'], 'Al + HCl → AlCl3 + H2'],
    [['Ca(OH)2', 'HCl'], ['CaCl2', 'H2O'], 'Ca(OH)2 + HCl → CaCl2 + H2O'],
  ];
  for (const [r, p, label] of cases) {
    const coeffs = B.balanceEquation(r, p);
    ok(Array.isArray(coeffs) && coeffs.length === r.length + p.length, `配平返回系数数组：${label}`);
    ok(conserved(r, p, coeffs), `原子守恒：${label} → [${coeffs.join(',')}]`);
    ok(coeffs.every((c) => Number.isInteger(c) && c >= 1), `系数为正整数：${label}`);
  }
}

console.log(`\nchemistryBalancer 单测: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
