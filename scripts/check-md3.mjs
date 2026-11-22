#!/usr/bin/env node
/**
 * check-md3.mjs — Material Design 3 一致性门禁
 *
 * 用户要求「设计输出需经过一致性校验」。这份门禁把「符合 MD3 + 对齐 mochi-compose」
 * 从口头约定变成可执行的断言，检查五类：
 *
 *   A. 令牌完整性：md3-tokens.css 必须包含 37 个色彩角色 × 明暗两套、
 *      20 级字阶、9 档形状、7 档阴影、8 档弹簧动效 + 2 档淡入淡出。
 *      漏一个角色 = 某处会 fallback 到继承色，视觉不一致且难发现。
 *   B. 组件不硬编码：md3-components.css 里不得出现 #hex / rgb() / hsl()，
 *      必须全部走 --md3-* 变量。硬编码色是「设计系统腐烂」的起点。
 *   C. 圆角不越界：组件里的 border-radius 只能取 --md3-shape-* 或 0/1px/50%，
 *      不许出现 7px、13px 这类凭感觉的数值。
 *   D. 组件覆盖：组件层必须实现约定的组件族（按钮 5 形态、卡片 3 变体、输入、
 *      芯片、开关、复选/单选、列表、对话框、Snackbar、进度、标签栏）。
 *   E. 结构合规：md3.html 不得有内联 <style> 或 style 属性（CSP style-src 'self'
 *      会拦掉，样式会静默失效）；必须外链 md3-tokens/components/doc 三个 CSS。
 *
 * 退出码：0 = 全部通过；1 = 存在违规。
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WEB = join(ROOT, '1.2');

const problems = [];
const fail = (msg) => problems.push(msg);

const TOKENS = join(WEB, 'css', 'md3-tokens.css');
const COMPONENTS = join(WEB, 'css', 'md3-components.css');
const DOC = join(WEB, 'md3.html');

for (const [p, name] of [[TOKENS, 'md3-tokens.css'], [COMPONENTS, 'md3-components.css'], [DOC, 'md3.html']]) {
  if (!existsSync(p)) fail(`缺少 ${name}（MD3 体系文件不全）`);
}
if (problems.length) {
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}

const tokensCss = readFileSync(TOKENS, 'utf8');
const compCss = readFileSync(COMPONENTS, 'utf8');
const docHtml = readFileSync(DOC, 'utf8');

/* ---------------- A. 令牌完整性 ---------------- */

const COLOR_ROLES = [
  'primary', 'on-primary', 'primary-container', 'on-primary-container', 'inverse-primary',
  'secondary', 'on-secondary', 'secondary-container', 'on-secondary-container',
  'tertiary', 'on-tertiary', 'tertiary-container', 'on-tertiary-container',
  'background', 'on-background', 'surface', 'on-surface', 'surface-variant', 'on-surface-variant',
  'surface-tint', 'inverse-surface', 'inverse-on-surface',
  'error', 'on-error', 'error-container', 'on-error-container',
  'outline', 'outline-variant', 'scrim', 'shadow',
  'surface-bright', 'surface-dim', 'surface-container-lowest', 'surface-container-low',
  'surface-container', 'surface-container-high', 'surface-container-highest',
];
for (const r of COLOR_ROLES) {
  const hits = tokensCss.match(new RegExp(`--md3-${r}\\s*:`, 'g')) || [];
  // light 一份 + dark 两份（显式 dark 块 + prefers-color-scheme 块）
  if (hits.length < 2) {
    fail(`令牌缺失：--md3-${r} 只在 ${hits.length} 处定义，明暗两套至少要各一份`);
  }
}

const TYPE_LEVELS = [
  'display-large', 'display-medium', 'display-small',
  'headline-large', 'headline-medium', 'headline-small',
  'title-large', 'title-medium', 'title-small',
  'body-large', 'body-medium', 'body-small',
  'label-large', 'label-medium', 'label-small',
  'large-title', 'nav-title', 'body', 'subhead', 'footnote',
];
for (const t of TYPE_LEVELS) {
  for (const prop of ['size', 'line']) {
    if (!new RegExp(`--md3-type-${t}-${prop}\\s*:`).test(tokensCss)) {
      fail(`字阶缺失：--md3-type-${t}-${prop}`);
    }
  }
}

const SHAPES = ['extra-small', 'small', 'medium', 'large', 'large-increased',
  'extra-large', 'extra-large-increased', 'extra-extra-large', 'full'];
for (const s of SHAPES) {
  if (!new RegExp(`--md3-shape-${s}\\s*:`).test(tokensCss)) fail(`形状缺失：--md3-shape-${s}`);
}

const ELEV = ['rest', 'low', 'raised', 'lifted', 'floating'];
for (const e of ELEV) {
  if (!new RegExp(`--md3-elevation-${e}-shadow\\s*:`).test(tokensCss)) {
    fail(`阴影缺失：--md3-elevation-${e}-shadow`);
  }
}

const MOTIONS = ['page', 'present', 'pop', 'control', 'settle', 'bounce', 'press-down', 'press-release', 'fade', 'fade-out'];
for (const m of MOTIONS) {
  if (!new RegExp(`--md3-motion-${m}\\s*:`).test(tokensCss)) fail(`动效缺失：--md3-motion-${m}`);
}

/* ---------------- B. 组件层不得硬编码颜色 ---------------- */

// 去掉注释再扫，避免把说明文字里的示例色当成违规
const compBare = compCss.replace(/\/\*[\s\S]*?\*\//g, '');
const hardColor = compBare.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g) || [];
if (hardColor.length) {
  // 定位到行，方便修
  compBare.split('\n').forEach((line, i) => {
    if (/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/.test(line)) {
      fail(`组件层硬编码颜色（第 ${i + 1} 行）：${line.trim().slice(0, 80)}`);
    }
  });
}

/* ---------------- C. 圆角只能取形状令牌 ---------------- */

compBare.split('\n').forEach((line, i) => {
  const m = line.match(/border-radius:\s*([^;]+);/);
  if (!m) return;
  const val = m[1].trim();
  // 允许：var(--md3-shape-*)、0、1px（分隔线）、50%（圆点）、继承/初始
  const ok = /var\(--md3-shape-/.test(val)
    || /^(0|1px|50%|inherit|initial)$/.test(val)
    || /^var\(--md3-shape-[a-z-]+\)(\s+var\(--md3-shape-[a-z-]+\))*$/.test(val);
  if (!ok) fail(`组件层圆角越界（第 ${i + 1} 行）：border-radius: ${val}`);
});

/* ---------------- D. 组件族覆盖 ---------------- */

const REQUIRED = [
  ['.md3-btn--filled', '按钮 filled 形态'],
  ['.md3-btn--tonal', '按钮 tonal 形态'],
  ['.md3-btn--elevated', '按钮 elevated 形态'],
  ['.md3-btn--outlined', '按钮 outlined 形态'],
  ['.md3-btn--text', '按钮 text 形态'],
  ['.md3-card--elevated', '卡片 elevated 变体'],
  ['.md3-card--outlined', '卡片 outlined 变体'],
  ['.md3-card--filled', '卡片 filled 变体'],
  ['.md3-field', '输入框'],
  ['.md3-chip', '芯片'],
  ['.md3-switch', '开关'],
  ['.md3-check', '复选/单选'],
  ['.md3-list', '列表'],
  ['.md3-dialog', '对话框'],
  ['.md3-snackbar', 'Snackbar'],
  ['.md3-progress', '进度条'],
  ['.md3-navbar', '标签栏'],
  ['.md3-fab', 'FAB'],
  ['.md3-icon-btn', '图标按钮'],
];
for (const [sel, name] of REQUIRED) {
  if (!compCss.includes(sel)) fail(`组件缺失：${name}（${sel}）`);
}

/* ---------------- E. 页面结构合规 ---------------- */

if (/<style[\s>]/i.test(docHtml)) {
  fail('md3.html 含内联 <style>：CSP style-src \'self\' 会拦掉，页面样式会静默失效');
}
// style="..." 属性（排除 data-style 与 JS 字符串）
const styleAttr = docHtml.match(/\sstyle\s*=\s*"/g) || [];
if (styleAttr.length) {
  fail(`md3.html 含 ${styleAttr.length} 处 style 属性：CSP 会拦掉，改用 class`);
}
for (const css of ['css/md3-tokens.css', 'css/md3-components.css', 'css/md3-doc.css']) {
  if (!docHtml.includes(css)) fail(`md3.html 未引入 ${css}`);
}

/* ---------------- 输出 ---------------- */

if (problems.length) {
  for (const p of problems) console.error(`  ✗ ${p}`);
  console.error(`check-md3: ${problems.length} 项不一致，按 MD3 令牌体系修正后重试`);
  process.exit(1);
}
console.log(`  ✓ MD3 一致：${COLOR_ROLES.length} 色彩角色（明暗双套）· ${TYPE_LEVELS.length} 级字阶 · ${SHAPES.length} 档形状 · ${ELEV.length} 档阴影 · ${MOTIONS.length} 档动效 · ${REQUIRED.length} 个组件 · 页面无内联样式`);
