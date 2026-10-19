/**
 * reduce-important-dark-css.mjs — T3-3b: theme-dark.css 普通补丁层 !important 削减
 *
 * 背景：补丁层 114 条规则带 158 个 !important，其中大量是无差别防御性写法——
 *   `[data-theme="dark"] .foo` 的特异性（属性+类 = 0,2,0）本就压过 style.css 的
 *   同类单类规则（0,1,0），!important 属冗余。
 *
 * 保留（KEEP 列表）两类规则不动：
 *   1. 与 style.css 自带 !important 的规则正面竞争的——.quiz-option.correct/wrong
 *      （style.css:2184-2185 三条声明均带 !important，补丁层去掉 important 会被反胜）
 *   2. computed-style 回归 harness 实证发现「去掉就变样」的规则（迭代追加，
 *      每条附 harness 证据）
 *
 * 结构性拆分（T3-3b 手工执行，先于本脚本）：
 *   原 27 选器通用规则（.exp-card/.knowledge-card/.info-box/…）整条 !important，
 *   其中只有 .knowledge-card 与 JS 生成的内联样式正面竞争（拆分后保留专则
 *   !important）；其余 26 个选择器的 !important 属冗余——.chinese-knowledge
 *   .info-box.red 等专属规则特异性更高，通用规则去掉 important 后由特异性裁决，
 *   外观不变（harness before/after 逐元素比对实证）。
 *
 * 重映射层（99 条 [style*=] 规则，99 个 !important）整体不动——那是压过 JS 生成的
 * 内联样式的承重墙，属架构性必要，见 DEV-PLAN T3-3 度量修正。
 *
 * 验证：harness before/after 逐元素 computed-style 比对（明暗双态 × 九科 ×
 *       force-states 状态强制模式），零差异方可提交。
 *
 * 运行：node scripts/reduce-important-dark-css.mjs          （dry-run）
 *       node scripts/reduce-important-dark-css.mjs --apply  （写入）
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const APPLY = process.argv.includes('--apply');
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = resolve(ROOT, '1.2/css/theme-dark.css');

/**
 * 保留 !important 的规则。match 为规则选择器列表中的某一个完整选择器
 * （按逗号切分后精确相等，避免 `.nav-item` 误伤 `.nav-item-title`）。
 * 两类来源：
 *   1. 与 style.css 自带 !important 的规则正面竞争的——.quiz-option.correct/wrong
 *      （style.css:2184-2185 三条声明均带 !important，补丁层去掉 important 会被反胜）
 *   2. computed-style 回归 harness 实证发现「去掉就变样」的规则，
 *      每条附 harness 证据（明暗双态 × 九科 × force-states 逐元素比对）
 */
const KEEP = [
  {
    match: '[data-theme="dark"] .quiz-option.correct',
    reason: 'style.css:2184 `.quiz-option.correct` 三条声明自带 !important；补丁层去掉 important 会被基样式反胜（级联数学可证）',
  },
  {
    match: '[data-theme="dark"] .quiz-option.wrong',
    reason: 'style.css:2185 `.quiz-option.wrong` 同上',
  },
  {
    match: '[data-theme="dark"] input',
    reason: 'harness 实证：calc-step/textbook-fill 的 input#cs-input / input#tb-input 带 JS 内联 border:1px solid #cbd5e1，去掉 important 后四边边框色 rgb(71,85,105)→rgb(203,213,225)',
  },
  {
    match: '[data-theme="dark"] code',
    reason: 'harness 实证：8 处 kbd 带 JS 内联 background/border/color（rgb(42,42,74)/rgb(85,85,85)/rgb(124,179,66)），内联非 important 压过所有非 important 作者规则',
  },
  {
    match: '[data-theme="dark"] .knowledge-card',
    reason: 'harness 实证：platform/content-enhancement/exam-review 生成的 knowledge-card 自带内联 background:linear-gradient+border，内联非 important 压过作者规则；T3-3b 已将该选择器从 27 选器的通用规则拆出为专则（拆分本身不改变级联结果）',
  },
  {
    match: '[data-theme="dark"] .chinese-knowledge .nav-item',
    reason: 'harness 实证：chinese 侧栏最后一项 matches(:last-child)，style.css `.nav-item:last-child{border-bottom:none}` 竞争 border-bottom-color（style none 不绘制故不可见，仍按严格 parity 保留）',
  },
  {
    match: '[data-theme="dark"] .chinese-knowledge .search-box input',
    reason: 'harness 实证（明暗双态）：通用 input 规则保留 !important 后，此条同带 important 才能压过它；否则搜索框 bg rgb(11,17,32)→rgb(15,23,42)、边框 rgb(22,78,99)→rgb(71,85,105)',
  },
  {
    match: '[data-theme="dark"] .chinese-knowledge .search-box input:focus',
    reason: 'harness 实证（force-states 真实 focus）：focus 边框色 --chinese rgb(56,189,248) 被通用 input 规则的 important 反胜为 rgb(71,85,105)，须同带 important',
  },
];

const css = readFileSync(FILE, 'utf8');
const NL = '\r\n';

// ---------------------------------------------------------------- 规则切分与替换
// 用 replace 回调逐规则处理，规则外内容（注释/空行）原样保留
let strippedCount = 0;
const kept = [];
let remapImpAfter = 0;
let patchImpAfter = 0;

const out = css.replace(/([^{}]+)\{([^{}]*)\}/g, (full, selector, body) => {
  const sel = selector.trim();
  const impInBody = (body.match(/!important/gi) || []).length;

  if (sel.includes('style*=')) {
    remapImpAfter += impInBody; // 重映射层：承重墙，原样保留
    return full;
  }
  // 精确匹配：先剥除选择器前的注释（注释不属于选择器，且可能含逗号），
  // 再按逗号切分去空白，任一完整选择器与 KEEP.match 相等才保留
  const selClean = sel.replace(/\/\*[\s\S]*?\*\//g, '');
  const selParts = selClean.split(',').map((s) => s.trim());
  const keepHit = KEEP.find((k) => selParts.includes(k.match));
  if (keepHit) {
    patchImpAfter += impInBody;
    kept.push({ sel: selClean.replace(/\s+/g, ' '), n: impInBody, reason: keepHit.reason });
    return full;
  }
  if (impInBody === 0) return full;

  const newBody = body.replace(/\s*!important/gi, '');
  strippedCount += impInBody;
  patchImpAfter += 0;
  return selector + '{' + newBody + '}';
});

// ---------------------------------------------------------------- 自检
const noComments = out.replace(/\/\*[\s\S]*?\*\//g, '');
let brace = 0;
for (const c of out) { if (c === '{') brace++; if (c === '}') brace--; }
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
// 令牌定义与 var() 引用数应与 T3-3a 令牌化后一致（本脚本不应触碰它们）
const defCount = (out.match(/^\s*--dm-[a-z0-9-]+\s*:/gm) || []).length
  + (out.match(/^\s*--(?:physics|chemistry|biology|exam|platform|chinese|math|english|primary|secondary|accent|danger)\s*:/gm) || []).length;
const varRefs = (out.match(/var\(--dm-/g) || []).length;

console.log(`剥离 !important: ${strippedCount} 个`);
console.log(`保留（KEEP）: ${kept.reduce((a, k) => a + k.n, 0)} 个 / ${kept.length} 条规则`);
for (const k of kept) console.log(`    [${k.n}] ${k.sel.slice(0, 80)}\n        理由: ${k.reason}`);
console.log(`自检: 重映射层 !important = ${remapImpAfter}（应 = 99，承重墙不可侵蚀）`);
console.log(`自检: 补丁层剩余 !important = ${patchImpAfter}（目标 < 30）`);
console.log(`自检: 声明体剩余 hex = ${declHexLeft.length}（应 = 0，T3-3a 成果不可回退）`);
console.log(`自检: 大括号配平 = ${brace === 0 ? 'OK' : '失衡 ' + brace}`);
console.log(`自检: 令牌定义 = ${defCount}（应 = 91），var(--dm-*) 引用 = ${varRefs}（应 ≥ 266，T3-3b 拆分 .knowledge-card 专则后 +3）`);

const problems = [];
if (remapImpAfter !== 99) problems.push(`重映射层 !important 应为 99，实际 ${remapImpAfter}`);
if (patchImpAfter >= 30) problems.push(`补丁层剩余 !important ${patchImpAfter} ≥ 30，未达目标`);
if (declHexLeft.length > 0) problems.push(`声明体出现 hex ${declHexLeft.length} 处（T3-3a 回退）`);
if (brace !== 0) problems.push('大括号失衡');
if (defCount !== 91) problems.push(`令牌定义数 ${defCount} ≠ 91`);
if (varRefs < 266) problems.push(`var(--dm-*) 引用数 ${varRefs} < 266（T3-3a 成果回退）`);

if (problems.length > 0) {
  console.error('自检未过，不写入:');
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}

if (APPLY) {
  writeFileSync(FILE, out);
  console.log('已写入', FILE);
} else {
  console.log('(dry-run，加 --apply 生效)');
}
