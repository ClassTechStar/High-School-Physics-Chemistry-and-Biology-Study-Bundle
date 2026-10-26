/**
 * check-theme-tokens.mjs — 暗色主题令牌化门禁
 *
 * 背景（DEV-PLAN ）：theme-dark.css 原为「补丁式覆写层」，声明值里 199 处
 * 硬编码 hex（81 个唯一色值），另有 158 个补丁层 !important 与 99 个重映射层
 * !important。a 已把声明 hex 全部收拢为 91 个语义令牌（外观经
 * computed-style 回归 harness 逐元素验证零变化）；b 已把补丁层 !important
 * 从 158 削减到 6。
 *
 * 本门禁的指标口径（度量修正后，见 DEV-PLAN 「与验收标准的偏差」）：
 * T1 声明体 hex 数 = 0 —— 排除令牌定义行与 [style*=] 选择器字符串
 * （属性选择器匹配的是字面文本，不可令牌化，
 * 330 处选择器 hex 是匹配条件不是颜色）
 * T2 补丁层 !important < 30 —— 排除重映射层；重映射层的 99 个 !important 是
 * 压过 JS 生成内联样式的承重墙，不可削减
 * T3 重映射层 !important = 99 —— 承重墙防侵蚀（数量变化须有人工评审）
 * T4 令牌定义 ≥ 91、var(--dm-*) 引用 ≥ 266 —— 防回退到硬编码
 * T5 无令牌自引用定义（--X: var(--X)）
 * T6 无悬空 var() 引用（theme-dark.css 内引用必须在同文件有定义）
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// 可选命令行参数指定被检文件（默认仓库内 theme-dark.css）；
// 便于对篡改副本做反向验证（门禁必须能抓住回退）
const FILE = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(ROOT, '1.2/css/theme-dark.css');

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓', msg); }
  else { fail++; console.error('  ✗', msg); }
}

const css = readFileSync(FILE, 'utf8');

// ---------------------------------------------------------------- 结构扫描
// 注释/字符串感知的逐字符扫描：区分「规则体」与「选择器/令牌定义行」
const declHex = [];          // 声明体 hex（T1 指标）
const selectorHex = [];      // 选择器字符串内 hex（匹配条件，不计入）
const definedTokens = new Set();
const referencedTokens = new Set();
const selfRefs = [];
const varRefCount = { n: 0 };
const ruleBodies = [];       // { selector, body }

{
  let i = 0, inBody = false, inString = false, bodyStart = -1, selStart = 0;
  const hexRe = /#[0-9a-fA-F]{3,8}\b/g;
  while (i < css.length) {
    if (!inString && css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i + 2);
      i = end === -1 ? css.length : end + 2;
      continue;
    }
    const ch = css[i];
    if (!inString && (ch === '"' || ch === "'")) {
      inString = ch; i++;
      while (i < css.length && css[i] !== inString) {
        if (css[i] === '\\') { i += 2; continue; }
        i++;
      }
      i++;
      inString = false;
      continue;
    }
    if (ch === '{') {
      inBody = true;
      bodyStart = i + 1;
      selStart = css.lastIndexOf('}', i) + 1;
      // 选择器部分（上一个 } 到 { 之间）的 hex = 匹配条件
      const selPart = css.slice(selStart, i);
      for (const h of selPart.match(hexRe) || []) selectorHex.push(h);
      i++;
      continue;
    }
    if (ch === '}') {
      if (inBody) ruleBodies.push({ selector: css.slice(selStart, bodyStart - 1).trim(), body: css.slice(bodyStart, i) });
      inBody = false;
      i++;
      continue;
    }
    if (inBody) {
      if (ch === '#') {
        hexRe.lastIndex = i;
        const m = hexRe.exec(css);
        if (m && m.index === i) {
          const lineStart = css.lastIndexOf('\n', i) + 1;
          const lineHead = css.slice(lineStart, i);
          // 定义行判定：行首（去空白）为 --name: 即自定义属性定义行。
          // 注意不能用「冒号后必须行止」的老正则——多值定义（如
          // --dm-body-bg: linear-gradient(... #0b1120 ...)）会被误判成声明行。
          const defM = lineHead.match(/^\s*(--[a-z0-9-]+)\s*:/);
          if (!defM) declHex.push(m[0]);
          else definedTokens.add(defM[1]);
          i += m[0].length;
          continue;
        }
      }
      if (css.startsWith('var(', i)) {
        const m = css.slice(i).match(/^var\(\s*(--[\w-]+)\s*[,)]/);
        if (m) { referencedTokens.add(m[1]); varRefCount.n++; i += m[0].length - 1; continue; }
      }
    }
    i++;
  }
}

// ---------------------------------------------------------------- 指标计算
const remapBodies = ruleBodies.filter((r) => r.selector.includes('style*='));
const patchBodies = ruleBodies.filter((r) => r.selector && !r.selector.includes('style*='));
const countImp = (bodies) => bodies.reduce((a, r) => a + (r.body.match(/!important/gi) || []).length, 0);
const remapImp = countImp(remapBodies);
const patchImp = countImp(patchBodies);

for (const name of definedTokens) {
  // 自引用：--X: var(--X)
  const re = new RegExp(`^\\s*${name.replace(/[-]/g, '\\-')}\\s*:\\s*var\\(\\s*${name.replace(/[-]/g, '\\-')}\\s*\\)`, 'm');
  if (re.test(css)) selfRefs.push(name);
}
const dangling = [...referencedTokens].filter((t) => !definedTokens.has(t));

const dmDefs = [...definedTokens].filter((t) => /^--dm-/.test(t)).length;
const namedDefs = [...definedTokens].filter((t) => /^--(physics|chemistry|biology|exam|platform|chinese|math|english|primary|secondary|accent|danger)$/.test(t)).length;

// ---------------------------------------------------------------- 断言
console.log('=== T3-3 暗色主题令牌化门禁 ===');
console.log(`[信息] 规则总数 ${ruleBodies.length}（重映射层 ${remapBodies.length} / 补丁层 ${patchBodies.length}）`);
console.log(`[信息] 选择器字符串 hex ${selectorHex.length} 处（[style*=] 匹配条件，不可令牌化，不计入 T1）`);

ok(declHex.length === 0,
  declHex.length === 0
    ? 'T1 声明体 hex = 0（199 处已全部收拢为令牌）'
    : `T1 声明体仍有 ${declHex.length} 处 hex: ${[...new Set(declHex)].slice(0, 10).join(', ')}`);

ok(patchImp < 30,
  `T2 补丁层 !important = ${patchImp} < 30（158 → ${patchImp}；剩余为 harness 实证必需的规则）`);

ok(remapImp === 99,
  remapImp === 99
    ? 'T3 重映射层 !important = 99（承重墙完整）'
    : `T3 重映射层 !important = ${remapImp} ≠ 99——压过 JS 内联样式的承重墙被改动，须人工评审`);

ok(dmDefs + namedDefs >= 91 && varRefCount.n >= 266,
  `T4 令牌定义 ${dmDefs + namedDefs} ≥ 91、var() 引用 ${varRefCount.n} ≥ 266（其中 var(--dm-*) ${(css.match(/var\(--dm-/g) || []).length} 处，引用 ${referencedTokens.size} 个不同令牌）`);

ok(selfRefs.length === 0,
  selfRefs.length === 0
    ? 'T5 无令牌自引用定义'
    : `T5 发现自引用定义: ${selfRefs.join(', ')}`);

ok(dangling.length === 0,
  dangling.length === 0
    ? 'T6 无悬空 var() 引用'
    : `T6 悬空引用: ${dangling.join(', ')}`);

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
if (fail > 0) process.exit(1);
