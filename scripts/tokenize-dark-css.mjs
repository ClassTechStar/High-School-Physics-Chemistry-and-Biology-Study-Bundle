/**
 * tokenize-dark-css.mjs — T3-3: theme-dark.css 色值令牌化（外观零变化）
 *
 * 背景：theme-dark.css 原是「补丁式覆写层」——声明值里 199 处硬编码 hex
 * （81 个唯一色值），另有约 330 处 hex 位于 [style*="..."] 属性选择器字符串中
 * （用于把 JS 生成的内联浅色重映射为深色，属匹配条件而非颜色，不可令牌化）。
 *
 * 本脚本把**声明值**中的 hex 全部替换为 var(--token) 引用：
 *   - 只替换规则体（{...} 内）的 hex；选择器部分、注释、令牌定义行一律不动
 *     （属性选择器匹配的是字面文本，写 var() 会直接失效）
 *   - body 的五段线性渐变整体收拢为 --dm-body-bg 一个令牌
 *   - 新令牌按语义族分组追加到 [data-theme="dark"] 令牌块末尾
 *
 * 运行：node scripts/tokenize-dark-css.mjs          （dry-run，只报告）
 *       node scripts/tokenize-dark-css.mjs --apply  （写入文件）
 *
 * 验证方式（外观零变化）：
 *   1. 机械等价——每个 var() 都解析回原 hex（令牌定义即原值），由
 *      computed-style 回归 harness 在真实浏览器中逐元素比对证实；
 *   2. 脚本自检——替换后声明体 hex 必须为 0、大括号配平、令牌/引用数符合预期。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const APPLY = process.argv.includes('--apply');
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = resolve(ROOT, '1.2/css/theme-dark.css');

const css = readFileSync(FILE, 'utf8');
const NL = '\r\n';

// ---------------------------------------------------------------- 令牌映射
// 既有令牌（theme-dark.css 0. 深色基础令牌块已定义，同值时优先复用）
const EXISTING = {
  '--physics': '#a78bfa', '--chemistry': '#60a5fa', '--biology': '#34d399',
  '--exam': '#fbbf24', '--platform': '#818cf8', '--chinese': '#38bdf8',
  '--math': '#f9a8d4', '--english': '#fca5a5',
  '--primary': '#7b93fa', '--secondary': '#34d399', '--accent': '#fbbf24',
  '--danger': '#f87171',
  '--dm-bg': '#0f172a', '--dm-surface-1': '#1e293b', '--dm-surface-2': '#334155',
  '--dm-border': '#475569', '--dm-border-soft': '#334155',
  '--dm-text': '#e2e8f0', '--dm-text-2': '#cbd5e1', '--dm-text-3': '#94a3b8',
};

// T3-3 新增令牌（值为原声明 hex，按语义族分组）
const NEW_TOKENS = [
  ['中性阶梯', [
    ['--dm-bg-deep', '#0b1120'],
    ['--dm-bg-raised', '#131c31'],
    ['--dm-text-dim', '#64748b'],
    ['--dm-text-high', '#f1f5f9'],
    ['--dm-text-on-accent', '#ffffff'],
    ['--dm-code-text', '#a5d6ff'],
  ]],
  ['info 天蓝/青（提示框）', [
    ['--dm-info-bg-deep', '#0c2d48'],
    ['--dm-info-bg', '#164e63'],
    ['--dm-info-bg-hi', '#075985'],
    ['--dm-info-bg-hi-2', '#0369a1'],
    ['--dm-info-border', '#0ea5e9'],
    ['--dm-info-text', '#7dd3fc'],
    ['--dm-info-text-2', '#a5f3fc'],
    ['--dm-info-text-3', '#67e8f9'],
  ]],
  ['success 绿（正确/通过）', [
    ['--dm-success-bg-deep', '#022c22'],
    ['--dm-success-bg', '#052e16'],
    ['--dm-success-bg-2', '#065f46'],
    ['--dm-success-bg-3', '#143a24'],
    ['--dm-success-bg-4', '#14532d'],
    ['--dm-success-bg-hi', '#059669'],
    ['--dm-success-bg-hi-2', '#047857'],
    ['--dm-success-border', '#10b981'],
    ['--dm-success-border-2', '#22c55e'],
    ['--dm-success-text', '#6ee7b7'],
    ['--dm-success-text-2', '#86efac'],
    ['--dm-success-text-3', '#4ade80'],
  ]],
  ['warning 琥珀/橙（注意/易错）', [
    ['--dm-warning-bg-deep', '#422c15'],
    ['--dm-warning-bg', '#78350f'],
    ['--dm-warning-bg-2', '#3d2a12'],
    ['--dm-warning-bg-3', '#33280f'],
    ['--dm-warning-border-2', '#f59e0b'],
    ['--dm-warning-text', '#fcd34d'],
    ['--dm-warning-text-2', '#fde68a'],
    ['--dm-warning-text-3', '#fdba74'],
    ['--dm-warning-text-4', '#fde047'],
    ['--dm-warning-text-5', '#facc15'],
  ]],
  ['danger 红（错误/警示）', [
    ['--dm-danger-bg-deep', '#450a0a'],
    ['--dm-danger-bg', '#7f1d1d'],
    ['--dm-danger-bg-2', '#431407'],
    ['--dm-danger-bg-3', '#3d2118'],
    ['--dm-danger-border', '#ef4444'],
    ['--dm-danger-border-2', '#f97316'],
    ['--dm-danger-text-2', '#fecaca'],
    ['--dm-danger-text-4', '#fb7185'],
    ['--dm-danger-text-5', '#fda4af'],
  ]],
  ['primary 靛蓝（强调/提示）', [
    ['--dm-primary-bg', '#172554'],
    ['--dm-primary-bg-2', '#1e1b4b'],
    ['--dm-primary-bg-3', '#232946'],
    ['--dm-primary-border', '#1e40af'],
    ['--dm-primary-text', '#dbeafe'],
    ['--dm-primary-text-2', '#93c5fd'],
    ['--dm-primary-text-3', '#a5b4fc'],
  ]],
  ['violet 紫（物理/紫色框）', [
    ['--dm-violet-bg', '#4c1d95'],
    ['--dm-violet-bg-2', '#2e1a3d'],
    ['--dm-violet-bg-3', '#251a3d'],
    ['--dm-violet-border', '#a855f7'],
    ['--dm-violet-text-2', '#c4b5fd'],
    ['--dm-violet-text-3', '#c084fc'],
  ]],
  ['pink 粉（数学）', [
    ['--dm-pink-bg', '#4a1030'],
    ['--dm-pink-bg-2', '#3d1a2a'],
    ['--dm-pink-text-2', '#e879f9'],
  ]],
  ['teal / lime / cyan（其余语义族）', [
    ['--dm-teal-bg', '#0d3b45'],
    ['--dm-teal-text', '#5eead4'],
    ['--dm-teal-text-2', '#2dd4bf'],
    ['--dm-lime-bg', '#1e3311'],
    ['--dm-lime-text', '#a3e635'],
    ['--dm-lime-text-2', '#bef264'],
    ['--dm-cyan-text', '#22d3ee'],
  ]],
  ['material 灰（内联重映射底色）', [
    ['--dm-bluegrey-bg', '#263238'],
    ['--dm-browngrey-bg', '#2f2620'],
  ]],
];

// hex(小写) → 令牌名；既有令牌优先（同值时复用既有名，不新增）
const hexToToken = new Map();
for (const [name, hex] of Object.entries(EXISTING)) {
  if (!hexToToken.has(hex)) hexToToken.set(hex, name);
}
const newTokenLines = [`    --dm-body-bg: linear-gradient(135deg, #0b1120 0%, #131c31 25%, #0d1a17 50%, #171308 75%, #141031 100%);`];
for (const [group, defs] of NEW_TOKENS) {
  newTokenLines.push(`    /* ${group} */`);
  for (const [name, hex] of defs) {
    if (EXISTING[name] && EXISTING[name] !== hex) {
      console.error(`令牌名冲突: ${name} 既有值 ${EXISTING[name]} ≠ 新值 ${hex}`);
      process.exit(1);
    }
    if (hexToToken.has(hex)) continue; // 同值已有令牌，跳过新增
    hexToToken.set(hex, name);
    newTokenLines.push(`    ${name}: ${hex};`);
  }
}

// ------------------------------------------- 预处理：body 五段渐变整体令牌化
const GRAD_RE = /background:\s*linear-gradient\(135deg,\s*#0b1120 0%,\s*#131c31 25%,\s*#0d1a17 50%,\s*#171308 75%,\s*#141031 100%\)/;
const gradMatches = css.match(new RegExp(GRAD_RE.source, 'g')) || [];
if (gradMatches.length !== 1) {
  console.error(`body 渐变预处理: 期望匹配 1 处，实际 ${gradMatches.length}，文件结构可能已变，中止`);
  process.exit(1);
}
const work = css.replace(GRAD_RE, 'background: var(--dm-body-bg)');

// ---------------------------------------------------------------- 逐字符替换
// 只在规则体（{...} 内）替换 hex；选择器、注释、字符串、令牌定义行不动。
let out = '';
let i = 0;
let inComment = false;
let inBody = false;
let inString = false;
let replaced = 0;
const hexRe = /#[0-9a-fA-F]{3,8}\b/g;

while (i < work.length) {
  const ch = work[i];
  if (!inString && work.startsWith('/*', i)) {
    const end = work.indexOf('*/', i + 2);
    out += work.slice(i, end === -1 ? work.length : end + 2);
    i = end === -1 ? work.length : end + 2;
    continue;
  }
  if (!inComment && (ch === '"' || ch === "'")) {
    inString = ch;
    out += ch; i++;
    while (i < work.length && work[i] !== inString) {
      if (work[i] === '\\') { out += work.slice(i, i + 2); i += 2; continue; }
      out += work[i]; i++;
    }
    if (i < work.length) { out += inString; i++; }
    inString = false;
    continue;
  }
  if (ch === '{') { inBody = true; out += ch; i++; continue; }
  if (ch === '}') { inBody = false; out += ch; i++; continue; }

  if (inBody && ch === '#') {
    hexRe.lastIndex = i;
    const m = hexRe.exec(work);
    if (m && m.index === i) {
      // 回看本行：令牌定义行（行首即 --name:）不动
      // 注意：曾误写为 lineHead + '#'，导致 '    --danger: #' 永远匹配不上定义行正则，
      // 令牌定义被替换成 var(--danger) 自引用（由下方锚点检查拦截，未写入）。
      // 也不能要求「冒号后必须行止」——多值定义（--dm-body-bg: linear-gradient(...)）
      // 会被误判成声明行。行首为 --name: 即定义行，其中的 hex 是令牌自身的值。
      const lineStart = work.lastIndexOf('\n', i) + 1;
      const lineHead = work.slice(lineStart, i);
      if (!/^\s*--[a-z0-9-]+\s*:/.test(lineHead)) {
        const name = hexToToken.get(m[0].toLowerCase());
        if (name) { out += `var(${name})`; replaced++; i += m[0].length; continue; }
      }
    }
  }
  out += ch; i++;
}

// ---------------------------------------------------------------- 插入新令牌
const ANCHOR = `    --danger: #f87171;${NL}}`;
if (!out.includes(ANCHOR)) {
  console.error('未找到令牌块插入锚点（--danger 行 + 块收尾}），文件结构可能已变，中止');
  process.exit(1);
}
const finalCss = out.replace(ANCHOR,
  `    --danger: #f87171;${NL}${NL}    /* ---------- T3-3 新增：语义色令牌（原声明 hex 原值收拢） ---------- */${NL}${newTokenLines.join(NL)}${NL}}`);

// ---------------------------------------------------------------- 自检
const noComments = finalCss.replace(/\/\*[\s\S]*?\*\//g, '');
let brace = 0;
for (const c of finalCss) { if (c === '{') brace++; if (c === '}') brace--; }
const declHexLeft = [];
{
  const rules = [...noComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  for (const r of rules) {
    for (const d of r[2].split(';')) {
      const m = d.match(/^\s*([a-z-]+)\s*:\s*(.*)/);
      if (!m || m[1].startsWith('--')) continue;
      for (const h of m[2].match(/#[0-9a-fA-F]{3,8}\b/g) || []) declHexLeft.push(h);
    }
  }
}
const defCount = (finalCss.match(/^\s*--dm-[a-z0-9-]+\s*:/gm) || []).length
  + (finalCss.match(/^\s*--(?:physics|chemistry|biology|exam|platform|chinese|math|english|primary|secondary|accent|danger)\s*:/gm) || []).length;
const varRefs = (finalCss.match(/var\(--dm-/g) || []).length;
// 令牌定义行不得自引用（--X: var(--X) 会令该令牌失效）；
// 合法的跨令牌别名（如 --text-primary: var(--dm-text)）不受影响
const selfRefDefs = [];
for (const m of finalCss.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*var\(\s*(--[a-z0-9-]+)\s*\)/gm)) {
  if (m[1] === m[2]) selfRefDefs.push(m[0].trim());
}

console.log(`渐变整体令牌化: 1 处；逐字符替换 var() 引用: ${replaced} 处（合计 ${replaced + 5}）`);
console.log(`新增令牌: ${newTokenLines.filter((l) => l.trim().startsWith('--')).length} 个`);
console.log(`自检: 声明体剩余 hex = ${declHexLeft.length}${declHexLeft.length ? ' → ' + declHexLeft.join(',') : ''}`);
console.log(`自检: 大括号配平 = ${brace === 0 ? 'OK' : '失衡 ' + brace}`);
console.log(`自检: 令牌定义总数 = ${defCount}，var(--dm-*) 引用 = ${varRefs}`);
console.log(`自检: 令牌定义行自引用 var() = ${selfRefDefs.length}${selfRefDefs.length ? ' → ' + selfRefDefs.join(' | ') : ''}`);

if (declHexLeft.length > 0 || brace !== 0 || selfRefDefs.length > 0) {
  console.error('自检未过，不写入');
  process.exit(1);
}

if (APPLY) {
  writeFileSync(FILE, finalCss);
  console.log('已写入', FILE);
} else {
  console.log('(dry-run，加 --apply 生效)');
}
