#!/usr/bin/env node
/**
 * check-csp-inline.mjs —— T3-4c / T12：内联三分类清点与门禁
 *
 * 背景：DEV-PLAN T3-4 记载「先把 index.html 的 32 处内联 onclick 改为事件委托，
 * 才能移除 unsafe-inline」。v1.4 勘察实测该数字与现状不符，本脚本以实测口径为准，
 * 并把「静态 HTML 不得出现内联事件属性」固化为可回归的门禁断言。
 *
 * 三分类口径（务必区分，否则会得出错误工作量结论）：
 *   A. 静态 HTML 内联事件属性  —— index.html 中真实写在标签上的 on* 属性，
 *      由浏览器在解析时编译，受 script-src 'unsafe-inline' 管辖。
 *      ★ 必须先清零，这是移除 script-src 'unsafe-inline' 的必要条件。
 *   B. 内联 <script> 块         —— index.html 内的 <script>（无 src），
 *      受 script-src 'unsafe-inline' 管辖，与 A 独立。
 *   C. JS 生成的内联事件属性     —— js/*.js 里的字符串模板 `onclick="..."`
 *      以及 HTML 内联脚本里的字符串模板，运行时拼成真实 DOM 属性，
 *      同样受 script-src 'unsafe-inline' 管辖，但工作量在 js/ 侧而非 index.html。
 *
 * 另含 D. 内联样式：静态 HTML style 属性 + 内联 <style> 块 + JS 写入 style，
 * 受 style-src 'unsafe-inline' 管辖（本阶段只清点，不设门禁阈值）。
 *
 * 用法：node scripts/check-csp-inline.mjs [--json]
 * 退出码：0 = 全部门禁通过；1 = 有断言失败。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = resolve(ROOT, '1.2');
const INDEX = resolve(APP, 'index.html');

const asJson = process.argv.includes('--json');

/** 剥离所有 <script>...</script>（含外链）后的 HTML 正文，用于隔离「静态 HTML」口径。 */
function stripScripts(html) {
  const spans = [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi)].map((m) => [m.index, m.index + m[0].length]);
  const out = [];
  let pos = 0;
  for (const [a, b] of spans) {
    out.push(html.slice(pos, a));
    pos = b;
  }
  out.push(html.slice(pos));
  return out.join('').replace(/<!--[\s\S]*?-->/g, '');
}

/** 取出所有内联（无 src）script 块的代码。 */
function inlineScriptCodes(html) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((m) => !/\bsrc\s*=/.test(m[1]))
    .map((m) => m[2]);
}

const html = readFileSync(INDEX, 'utf8');
const staticHtml = stripScripts(html);
const codes = inlineScriptCodes(html);

/* ---------------- A. 静态 HTML 内联事件属性 ---------------- */
const EVENT_ATTR = /\son([a-z]+)\s*=\s*["']/gi;
const staticEventHits = [...staticHtml.matchAll(EVENT_ATTR)].map((m) => m[1].toLowerCase());

/* ---------------- B. 内联 <script> 块 ---------------- */
const scriptBlocks = codes.map((c) => ({
  lines: c.split('\n').length,
  chars: c.length,
  head: c.trim().slice(0, 48).replace(/\s+/g, ' '),
}));

/* ---------------- C. JS 生成的内联事件属性 ---------------- */
const jsFiles = readdirSync(resolve(APP, 'js')).filter((f) => f.endsWith('.js'));
const genByEvent = new Map();
let genTotal = 0;
for (const f of jsFiles) {
  const src = readFileSync(resolve(APP, 'js', f), 'utf8');
  for (const m of src.matchAll(/\son([a-z]+)\s*=\\?["']/gi)) {
    const k = m[1].toLowerCase();
    genByEvent.set(k, (genByEvent.get(k) || 0) + 1);
    genTotal++;
  }
}
// index.html 内联脚本里的字符串模板（同样会生成真实 DOM 属性）
const inlineGenByEvent = new Map();
for (const c of codes) {
  for (const m of c.matchAll(/\son([a-z]+)\s*=\\?["']/gi)) {
    const k = m[1].toLowerCase();
    inlineGenByEvent.set(k, (inlineGenByEvent.get(k) || 0) + 1);
  }
}

/* ---------------- D. 内联样式（只清点） ---------------- */
const staticStyleAttrs = (staticHtml.match(/\sstyle\s*=\s*["']/gi) || []).length;
const styleBlocks = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1].split('\n').length);
let jsStyleWrites = 0;
let jsCssText = 0;
for (const f of jsFiles) {
  const src = readFileSync(resolve(APP, 'js', f), 'utf8');
  jsStyleWrites += (src.match(/\sstyle\s*=\s*["'`]/gi) || []).length;
  jsStyleWrites += (src.match(/\.style\.[a-zA-Z]+\s*=/g) || []).length;
  jsCssText += (src.match(/cssText/g) || []).length;
}

/* ---------------- 门禁断言 ---------------- */
const checks = [
  {
    id: 'A1',
    name: '静态 HTML 内联事件属性清零',
    got: staticEventHits.length,
    want: 0,
    pass: staticEventHits.length === 0,
    detail: staticEventHits.length ? `残留：${staticEventHits.join(', ')}` : 'index.html 标签上无任何 on* 属性',
  },
  {
    id: 'A2',
    name: 'data-action 委托标记存在（toggle-theme / chinese-search）',
    got: (staticHtml.match(/data-action="toggle-theme"/g) || []).length + (staticHtml.match(/data-action="chinese-search"/g) || []).length,
    want: 2,
    pass: (staticHtml.match(/data-action="toggle-theme"/g) || []).length === 1
        && (staticHtml.match(/data-action="chinese-search"/g) || []).length === 1,
    detail: '两处内联属性已改为 data-action 约定，须各有且仅有一处标记',
  },
  {
    id: 'A3',
    name: 'window.toggleTheme 仍导出（js/*.js 的 319 处 onclick 仍依赖）',
    got: (html.match(/window\.toggleTheme\s*=/g) || []).length,
    want: 1,
    pass: (html.match(/window\.toggleTheme\s*=/g) || []).length === 1,
    detail: '清零内联属性不等于删除全局 API，js/ 侧生成的事件属性仍引用它',
  },
];

/* ---------------- 输出 ---------------- */
const report = {
  A_staticHtmlEventAttrs: { count: staticEventHits.length, kinds: staticEventHits },
  B_inlineScriptBlocks: { count: scriptBlocks.length, blocks: scriptBlocks },
  C_generatedEventAttrs: {
    inJsFiles: { total: genTotal, byEvent: Object.fromEntries(genByEvent) },
    inIndexInlineScripts: { total: [...inlineGenByEvent.values()].reduce((a, b) => a + b, 0), byEvent: Object.fromEntries(inlineGenByEvent) },
  },
  D_inlineStyles: {
    staticStyleAttrs,
    styleBlocks: { count: styleBlocks.length, lines: styleBlocks },
    jsStyleWrites,
    jsCssText,
  },
  checks,
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('══ T12 内联三分类清点 ══\n');
  console.log('A. 静态 HTML 内联事件属性（受 script-src 管辖，必须先清零）');
  console.log(`   数量：${report.A_staticHtmlEventAttrs.count}${staticEventHits.length ? ' → ' + staticEventHits.join(', ') : ' ✓'}`);

  console.log('\nB. 内联 <script> 块（受 script-src 管辖）');
  console.log(`   数量：${scriptBlocks.length} 块，合计 ${scriptBlocks.reduce((a, b) => a + b.lines, 0)} 行`);
  scriptBlocks.forEach((b, i) => console.log(`     #${i + 1}  ${String(b.lines).padStart(4)} 行  ${b.head}...`));

  console.log('\nC. JS 生成的内联事件属性（运行时拼成 DOM 属性，同受 script-src 管辖）');
  console.log(`   js/*.js：${report.C_generatedEventAttrs.inJsFiles.total} 处  ${JSON.stringify(report.C_generatedEventAttrs.inJsFiles.byEvent)}`);
  console.log(`   index.html 内联脚本内：${report.C_generatedEventAttrs.inIndexInlineScripts.total} 处  ${JSON.stringify(report.C_generatedEventAttrs.inIndexInlineScripts.byEvent)}`);

  console.log('\nD. 内联样式（受 style-src 管辖，本阶段只清点）');
  console.log(`   静态 style 属性：${staticStyleAttrs}   <style> 块：${styleBlocks.length} 块（${styleBlocks.join(' + ')} 行）`);
  console.log(`   JS 样式写入：${jsStyleWrites} 处   cssText：${jsCssText} 处`);

  console.log('\n══ 门禁断言 ══');
  let allPass = true;
  for (const c of checks) {
    if (!c.pass) allPass = false;
    console.log(` ${c.pass ? '✓' : '✗'} ${c.id} ${c.name}  [期望 ${c.want} / 实测 ${c.got}]`);
    console.log(`     ${c.detail}`);
  }
  console.log(`\n结果：${allPass ? '全部通过' : '存在失败项'}（${checks.filter((c) => c.pass).length}/${checks.length}）`);
}

process.exit(checks.every((c) => c.pass) ? 0 : 1);
