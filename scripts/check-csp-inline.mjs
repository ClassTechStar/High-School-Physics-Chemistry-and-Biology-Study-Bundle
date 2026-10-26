#!/usr/bin/env node
/**
 * check-csp-inline.mjs —— c / f / T12：内联清点与 CSP 门禁
 *
 * 背景：DEV-PLAN 记载「先把 index.html 的 32 处内联 onclick 改为事件委托，
 * 才能移除 unsafe-inline」。v1.4 勘察实测该数字与现状不符，本脚本以实测口径为准，
 * 并把「静态 HTML 不得出现内联事件属性」固化为可回归的门禁断言。
 *
 * 进度：
 * c A 类静态属性清零 + data-action 委托
 * d C 类 js/ 侧与 index.html 内联脚本清零（委托中枢 js/csp-delegation.js）
 * e B 类 6 个内联脚本块全部外置 + meta CSP script-src 移除 'unsafe-inline'
 * f D1/D2：index.html 2 个 <style> 块外置（css/responsive.css 1159 B、
 * css/chinese-knowledge.css 8894 B，逐字节保真）、37 处静态 style 属性
 * 类化（tokens.css 的 --tag-* 与 --panel-* 令牌 + style.css 类规则 +
 * theme-dark.css 按类选择器重建暗色对等覆盖），computed-style 回归
 * harness 18/18 组合（light/dark × 9 学科）零差异；
 * D3（js/ 侧模板 style 属性，实测 3624 处 / 42 个文件 = 20 动态 +
 * 3604 静态）尚待立项决策，未开工。
 * 现行门禁断言共九条：A1/A2/A3/B1/B2/C1/C2/D1/D2。
 *
 * 口径（script-src 侧三分类 + style-src 侧精确口径，务必区分，否则会得出
 * 错误的工作量结论）：
 * A. 静态 HTML 内联事件属性 —— index.html 中真实写在标签上的 on* 属性，
 * 由浏览器在解析时编译，受 script-src 'unsafe-inline' 管辖。
 * ★ 必须先清零，这是移除 script-src 'unsafe-inline' 的必要条件。
 * B. 内联 <script> 块 —— index.html 内的 <script>（无 src），
 * 受 script-src 'unsafe-inline' 管辖，与 A 独立。
 * C. JS 生成的内联事件属性 —— js/*.js 里的字符串模板 `onclick="..."`
 * 以及 HTML 内联脚本里的字符串模板，运行时拼成真实 DOM 属性，
 * 同样受 script-src 'unsafe-inline' 管辖，但工作量在 js/ 侧而非 index.html。
 * D. 内联样式（style-src 'unsafe-inline' 的精确管辖范围，f 起分级设门禁）：
 * D1. 静态 <style> 块 —— index.html 内的 <style>，受管辖，已清零（D1 门禁）。
 * D2. 静态 style 属性 —— 标签上的 style="..."，受管辖，已清零（D2 门禁）。
 * D3. JS 模板 style 属性 —— js/*.js 字符串模板拼出的 style="..."，运行时
 * 成为真实 DOM 属性，受管辖（实测 3624 处 / 42 文件，只清点待立项）。
 * ✗ 不受管辖（旧口径误计，特此纠正）：el.style.prop= / el.style.cssText=
 * 属 CSSOM 写入，不产生 style 属性字符串，style-src 'unsafe-inline'
 * 管不到（实测 328 处 / 34 文件，其中 cssText 整体写 43 处）。旧脚本把
 * 3624 + 328 = 3952 混计为「JS 样式写入」，据此推算的 D 类工作量含
 * 328 处无效项。另：ctx.fillStyle / ctx.strokeStyle 属 Canvas API，
 * 连「样式写入」都不算；模板正则的前导空白要求已将其排除（曾以无前导
 * 空白口径误得 3929，差额 305 即此类）。
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

/** index.html 的 <script src="js/..."> 引用的外部脚本源码拼接（e 起 A3 等断言的作用域）。 */
function referencedJsSources(html) {
  const files = [...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
  const parts = [];
  for (const rel of files) {
    if (!/^js\//.test(rel)) continue;
    try {
      parts.push(readFileSync(resolve(APP, rel), 'utf8'));
    } catch {
 /* 引用不存在的文件由 runtime-defer-check / smoke 门禁负责，此处不重复报 */
    }
  }
  return parts.join('\n');
}

const html = readFileSync(INDEX, 'utf8');
const staticHtml = stripScripts(html);
const codes = inlineScriptCodes(html);
const extJs = referencedJsSources(html); // 原内联脚本搬出去之后的检查范围

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

/* ---------------- D. 内联样式（style-src 'unsafe-inline' 精确口径） ---------------- */
const staticStyleAttrs = (staticHtml.match(/\sstyle\s*=\s*["']/gi) || []).length;
const styleBlocks = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1].split('\n').length);
// D3：JS 字符串模板拼出的 style 属性——运行时成为真实 DOM 属性，受 style-src 'unsafe-inline' 管辖。
// 前导空白要求使 x.style=（CSSOM）与 ctx.fillStyle=（Canvas API）不被误计。
let jsTemplateStyleAttrs = 0;
let jsTemplateFiles = 0;
// 不受管辖：CSSOM 写入（.style.prop= / .style.cssText=），不产生 style 属性字符串。
// 以前把它跟模板属性混在一起算成「JS 样式写入 3952」，里面 328 项是不算数的。
let jsCssomWrites = 0;
let jsCssomCssText = 0;
let jsCssomFiles = 0;
let jsStyleBlocks = 0;
const jsStyleBlockFiles = [];
for (const f of jsFiles) {
  const src = readFileSync(resolve(APP, 'js', f), 'utf8');
  // 排除 JS 变量声明 `var/let/const style = "..."`（非 HTML 属性）
  const varDecls = (src.match(/\b(?:var|let|const)\s+style\s*=\s*["'`]/gi) || []).length;
  const t = (src.match(/\sstyle\s*=\s*["'`]/gi) || []).length - varDecls;
  jsTemplateStyleAttrs += Math.max(0, t);
  if (t > 0) jsTemplateFiles++;
  // D4：字符串字面量里的内联 <style> 块（注入当前文档或 window.open 弹窗文档）
  const sb = (src.match(/["'`]<style\b/gi) || []).length;
  if (sb) { jsStyleBlocks += sb; jsStyleBlockFiles.push(f + '×' + sb); }
  const w = (src.match(/\.style\.[a-zA-Z]+\s*=/g) || []).length;
  const x = (src.match(/\.style\.cssText\s*=/g) || []).length;
  jsCssomWrites += w;
  jsCssomCssText += x;
  if (w) jsCssomFiles++;
}

/* ---------------- 门禁断言 ---------------- */
const checks = [
  {
    id: 'A1',
    name: '静态 HTML 里不再有内联事件属性',
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
    name: 'window.toggleTheme 仍导出（data-action 委托和外部调用方都在用）',
    got: (html + extJs).match(/window\.toggleTheme\s*=/g)?.length || 0,
    want: 1,
    pass: ((html + extJs).match(/window\.toggleTheme\s*=/g) || []).length === 1,
    detail: '去掉内联属性不代表可以删掉全局 API。data-action="toggle-theme" 的委托和外部调用方都还在引用它，检查范围是 index.html 和它引用的 js 文件。',
  },
  {
    id: 'B1',
    name: '页面里不再有内联 <script> 块',
    got: scriptBlocks.length,
    want: 0,
    pass: scriptBlocks.length === 0,
    detail: scriptBlocks.length === 0
      ? '原来的 6 个内联块（错误兜底 / 主题引导 / 主逻辑 / 首页折叠 / 主题切换 / SW 注册）都已经挪到 js/ 外部脚本，执行顺序由 runtime-defer-check 保证'
      : `残留：${scriptBlocks.map((b) => b.head).join(' | ')}`,
  },
  {
    id: 'B2',
    name: "meta CSP 的 script-src 里没有 'unsafe-inline'",
    got: /script-src[^;]*'unsafe-inline'/.test((html.match(/<meta[^>]*Content-Security-Policy[^>]*\bcontent\s*=\s*"([^"]*)"/i) || [])[1] || '') ? 1 : 0,
    want: 0,
    pass: !/script-src[^;]*'unsafe-inline'/.test((html.match(/<meta[^>]*Content-Security-Policy[^>]*\bcontent\s*=\s*"([^"]*)"/i) || [])[1] || ''),
    detail: "script-src 只允许 'self'。前面几项都过了才能收这一步。",
  },
  {
    id: 'B3',
    name: "meta CSP 的 style-src 里没有 'unsafe-inline'",
    got: /style-src[^;]*'unsafe-inline'/.test((html.match(/<meta[^>]*Content-Security-Policy[^>]*\bcontent\s*=\s*"([^"]*)"/i) || [])[1] || '') ? 1 : 0,
    want: 0,
    pass: !/style-src[^;]*'unsafe-inline'/.test((html.match(/<meta[^>]*Content-Security-Policy[^>]*\bcontent\s*=\s*"([^"]*)"/i) || [])[1] || ''),
    detail: "style-src 已收紧为 'self'：D1（内联 <style> 块）→ 0、D2（静态 style 属性）→ 0、D3（js 模板 style 属性）→ 0、D4（js 内联 <style> 块）→ 0；运行时样式全部走 CSSOM（不受 style-src 管辖）。若回退任一条，本断言与对应 D 类断言会同时失败",
  },
  {
    id: 'C1',
    name: 'js/*.js 里不再生成内联事件属性',
    got: genTotal,
    want: 0,
    pass: genTotal === 0,
    detail: genTotal === 0
      ? 'js/ 侧字符串模板已全部改为 data-call / data-hook + js/csp-delegation.js 委托'
      : `残留：${[...genByEvent.entries()].map(([k, v]) => `${k}×${v}`).join(', ')}`,
  },
  {
    id: 'C2',
    name: 'index.html 的内联脚本里不再生成内联事件属性',
    got: [...inlineGenByEvent.values()].reduce((a, b) => a + b, 0),
    want: 0,
    pass: [...inlineGenByEvent.values()].reduce((a, b) => a + b, 0) === 0,
    detail: [...inlineGenByEvent.values()].reduce((a, b) => a + b, 0) === 0
      ? '3 个计算器按钮 / 17 个实验卡片标题 / 3 个快捷工具按钮已改为 data-call / data-hook，注释字样不再误计；T3-4e 起内联脚本已外置，本断言转为兜底（一旦回退内联即复检）'
      : `残留：${[...inlineGenByEvent.entries()].map(([k, v]) => `${k}×${v}`).join(', ')}`,
  },
  {
    id: 'D1',
    name: 'index.html 里不再有内联 <style> 块',
    got: styleBlocks.length,
    want: 0,
    pass: styleBlocks.length === 0,
    detail: styleBlocks.length === 0
      ? '原 2 个内联块（响应式补充 / 语文知识面板）已外置为 css/responsive.css（1159 B）与 css/chinese-knowledge.css（8894 B），逐字节保真；两者原位于三条 link 之后，外移后层叠地位不变；sw.js CORE_ASSETS 已同步（hspcb-v17）'
      : `残留：${styleBlocks.length} 块（${styleBlocks.join(' + ')} 行），须外置为 css/ 外部样式表并在 sw.js 登记`,
  },
  {
    id: 'D2',
    name: 'index.html 里不再有静态 style 属性',
    got: staticStyleAttrs,
    want: 0,
    pass: staticStyleAttrs === 0,
    detail: staticStyleAttrs === 0
      ? '37 处静态 style 属性已类化：工具徽标 ×16 → .tool-tag.math/.chinese/.english（tokens.css --tag-* 令牌）、区块间距 ×11 → .tools-section.mt-16/20/24（--space-4/5/6）、知识面板 ×4 → .knowledge-panel--math/--english（--panel-* 令牌）、tab-pane ×6 → .tab-pane/.is-hidden；theme-dark.css 第 6 节属性匹配型暗色专则随之失配，已按类选择器重建（无 !important，靠特异性 (0,2,0)/(0,3,0) 胜出），computed-style 回归 18/18 组合零差异'
      : `残留：${staticStyleAttrs} 处，须类化到 css/ 并同步暗色对等覆盖`,
  },
  {
    id: 'D3',
    name: 'js 模板不再生成 style 属性',
    got: jsTemplateStyleAttrs,
    want: 0,
    pass: jsTemplateStyleAttrs === 0,
    detail: jsTemplateStyleAttrs === 0
      ? 'js/ 侧 3620 处模板 style 属性已改写为 data-style，由 js/cssom-style-bridge.js 在插入 DOM 后写入 CSSOM（style-src 不管辖 CSSOM）；theme-dark.css 第 6 节 344 条覆盖选择器同步改写为 [data-style*="..."]，保留模板原文以维持暗色匹配语义；computed-style 回归 18/18 组合零差异（style-src 已收紧为 \'self\'）'
      : `残留：${jsTemplateStyleAttrs} 处 / ${jsTemplateFiles} 个文件，须改写为 data-style 并由桥接写入`,
  },
  {
    id: 'D4',
    name: 'js 里的字符串模板不再含内联 <style> 块',
    got: jsStyleBlocks,
    want: 0,
    pass: jsStyleBlocks === 0,
    detail: jsStyleBlocks === 0
      ? '原 3 处：数据分析报告弹窗 → css/print-report.css、复习计划表弹窗 → css/study-plan-print.css、知识点卡片打印弹窗 → css/knowledge-card-print.css，均改为弹窗文档内 <link> 引入；加载指示器 @keyframes ll-spin 迁入 css/style.css'
      : `残留：${jsStyleBlockFiles.join(', ')}，须外置为 css/ 并在弹窗内 <link> 引入`,
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
    jsTemplateStyleAttrs: { count: jsTemplateStyleAttrs, files: jsTemplateFiles, governedByStyleSrc: true },
    jsCssomWrites: { count: jsCssomWrites, files: jsCssomFiles, ofWhichCssText: jsCssomCssText, governedByStyleSrc: false },
    jsStyleBlocks: { count: jsStyleBlocks, files: jsStyleBlockFiles },
  },
  checks,
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('══ T12 内联清点与 CSP 门禁 ══\n');
  console.log('A. 静态 HTML 内联事件属性（受 script-src 管辖，必须先清零）');
  console.log(`   数量：${report.A_staticHtmlEventAttrs.count}${staticEventHits.length ? ' → ' + staticEventHits.join(', ') : ' ✓'}`);

  console.log('\nB. 内联 <script> 块（受 script-src 管辖）');
  console.log(`   数量：${scriptBlocks.length} 块，合计 ${scriptBlocks.reduce((a, b) => a + b.lines, 0)} 行${scriptBlocks.length ? '' : ' ✓（T3-4e 起全部外置为 js/ 外部脚本，见 B1 门禁）'}`);
  scriptBlocks.forEach((b, i) => console.log(`     #${i + 1}  ${String(b.lines).padStart(4)} 行  ${b.head}...`));

  console.log('\nC. JS 生成的内联事件属性（运行时拼成 DOM 属性，同受 script-src 管辖）');
  console.log(`   js/*.js：${report.C_generatedEventAttrs.inJsFiles.total} 处  ${JSON.stringify(report.C_generatedEventAttrs.inJsFiles.byEvent)}`);
  console.log(`   index.html 内联脚本内：${report.C_generatedEventAttrs.inIndexInlineScripts.total} 处  ${JSON.stringify(report.C_generatedEventAttrs.inIndexInlineScripts.byEvent)}`);

  console.log('\nD. 内联样式（style-src 精确口径：D1/D2 已设门禁，D3 只清点）');
  console.log(`   静态 style 属性：${staticStyleAttrs}${staticStyleAttrs ? ' ✗' : ' ✓（D2 门禁）'}   <style> 块：${styleBlocks.length}${styleBlocks.length ? ' ✗' : ' ✓（D1 门禁）'}`);
  console.log(`   D3 JS 模板 style 属性（受管辖，待立项）：${jsTemplateStyleAttrs} 处 / ${jsTemplateFiles} 个 js 文件`);
  console.log(`   不受管辖（CSSOM 写入，旧口径误计入工作量）：.style.*= ${jsCssomWrites} 处（含 cssText 整体写 ${jsCssomCssText} 处）/ ${jsCssomFiles} 个文件`);

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
