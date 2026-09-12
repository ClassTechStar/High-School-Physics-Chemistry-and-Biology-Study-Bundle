/**
 * static-bug-scan.mjs — 项目静态缺陷扫描
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, '1.2');
const NODE = process.execPath;

const issues = [];
function issue(sev, where, msg) {
  issues.push({ sev, where, msg });
}

/* 1. JS syntax via node --check */
function checkJsSyntax() {
  const dirs = [join(APP, 'js')];
  const files = [];
  for (const d of dirs) {
    for (const f of readdirSync(d)) {
      if (f.endsWith('.js')) files.push(join(d, f));
    }
  }
  files.push(join(APP, 'sw.js'));
  for (const f of readdirSync(join(ROOT, 'scripts'))) {
    if (f.endsWith('.mjs') || f.endsWith('.js')) files.push(join(ROOT, 'scripts', f));
  }
  for (const f of files) {
    try {
      execFileSync(NODE, ['--check', f], { stdio: 'pipe' });
    } catch (e) {
      const msg = (e.stderr || e.stdout || e.message).toString();
      issue('error', relative(ROOT, f), '语法错误: ' + msg.split('\n').filter(Boolean).slice(0, 3).join(' | '));
    }
  }
}

/* 2. index.html script src exists */
function checkScriptRefs() {
  const html = readFileSync(join(APP, 'index.html'), 'utf8');
  const re = /<script\s+src="([^"]+)"/g;
  let m;
  let n = 0;
  while ((m = re.exec(html))) {
    n += 1;
    const p = join(APP, m[1]);
    if (!existsSync(p)) issue('error', 'index.html', `script 不存在: ${m[1]}`);
  }
  if (n === 0) issue('error', 'index.html', '未找到任何外部 script');
  // progress.js should be early
  const pi = html.indexOf('js/progress.js');
  const ci = html.indexOf('js/common-utils.js');
  if (pi < 0) issue('error', 'index.html', '缺少 progress.js');
  else if (ci >= 0 && pi < ci) issue('warn', 'index.html', 'progress.js 在 common-utils 之前');
}

/* 3. CSS refs */
function checkCssRefs() {
  const html = readFileSync(join(APP, 'index.html'), 'utf8');
  const re = /<link[^>]+href="([^"]+\.css)"/g;
  let m;
  while ((m = re.exec(html))) {
    const p = join(APP, m[1]);
    if (!existsSync(p)) issue('error', 'index.html', `CSS 不存在: ${m[1]}`);
  }
}

/* 4. duplicate element ids in index.html */
function checkDuplicateIds() {
  const html = readFileSync(join(APP, 'index.html'), 'utf8');
  // strip scripts/styles to reduce false positives from strings? still many ids in templates.
  // Only scan body markup outside script tags roughly
  const stripped = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const re = /\sid="([^"]+)"/g;
  const counts = new Map();
  let m;
  while ((m = re.exec(stripped))) {
    counts.set(m[1], (counts.get(m[1]) || 0) + 1);
  }
  const dups = [...counts.entries()].filter(([, c]) => c > 1);
  for (const [id, c] of dups) {
    issue('warn', 'index.html', `重复 id="${id}" × ${c}`);
  }
}

/* 5. data-tool buttons vs section handlers - list data-tool without matching section id */
function checkToolSections() {
  const html = readFileSync(join(APP, 'index.html'), 'utf8');
  const tools = new Set();
  const re = /data-tool="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) tools.add(m[1]);
  const sections = new Set();
  const re2 = /id="([a-z0-9-]+)-section"/g;
  while ((m = re2.exec(html))) sections.add(m[1]);
  // Many tools map to tool-section dynamically. Check common pattern tool-section or <tool>-section
  const missing = [];
  for (const t of tools) {
    if (sections.has(t)) continue;
    // also ok if handled only in JS with a generic section
    missing.push(t);
  }
  // Only report if neither tool-specific section nor tool-section exists
  if (!sections.has('tool') && missing.length) {
    issue('info', 'index.html', `data-tool 共 ${tools.size} 个；无 tool-section 通用容器时需确认路由: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? '…' : ''}`);
  } else {
    // verify tool section exists
    if (!sections.has('tool') && !html.includes('id="tool-section"')) {
      // check for tool app container
      if (!html.includes('id="tool-app"') && !html.includes('tool-section')) {
        issue('warn', 'index.html', '未发现通用 tool 容器，data-tool 路由可能依赖 JS 注入');
      }
    }
  }
  return { toolCount: tools.size, sectionCount: sections.size };
}

/* 6. manifest start_url and icons */
function checkManifest() {
  const p = join(APP, 'manifest.json');
  if (!existsSync(p)) return issue('error', 'manifest.json', '不存在');
  try {
    const m = JSON.parse(readFileSync(p, 'utf8'));
    if (!m.name) issue('warn', 'manifest.json', '缺少 name');
    if (!m.start_url) issue('warn', 'manifest.json', '缺少 start_url');
    else if (!existsSync(join(APP, m.start_url))) issue('error', 'manifest.json', `start_url 不存在: ${m.start_url}`);
    if (!Array.isArray(m.icons) || !m.icons.length) issue('warn', 'manifest.json', '缺少 icons');
    // shortcuts
    for (const s of m.shortcuts || []) {
      if (s.url && s.url.includes('subject=') && !existsSync(join(APP, 'index.html'))) {
        issue('error', 'manifest.json', 'shortcut 指向缺失');
      }
    }
    // missing chinese/english shortcuts is product gap not bug
  } catch (e) {
    issue('error', 'manifest.json', 'JSON 无效: ' + e.message);
  }
}

/* 7. JSON data parse */
function checkAllJson() {
  const dataDir = join(APP, 'data');
  const walk = (dir) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (f.endsWith('.json')) {
        try {
          JSON.parse(readFileSync(p, 'utf8'));
        } catch (e) {
          issue('error', relative(ROOT, p), 'JSON 解析失败: ' + e.message);
        }
      }
    }
  };
  walk(dataDir);
  for (const f of ['manifest.json']) {
    try { JSON.parse(readFileSync(join(APP, f), 'utf8')); } catch (e) {
      issue('error', f, e.message);
    }
  }
}

/* 8. Common footguns in JS: triple-backtick inside template, unclosed template literal heuristics */
function checkTemplateFootguns() {
  const jsDir = join(APP, 'js');
  for (const f of readdirSync(jsDir)) {
    if (!f.endsWith('.js')) continue;
    const src = readFileSync(join(jsDir, f), 'utf8');
    // backtick + semicolon anomaly already caught by syntax check
    // look for innerHTML = without closing
    if (/innerHTML\s*=\s*$/.test(src.split('\n').slice(0, -1).join('\n')) ) {
      issue('warn', `js/${f}`, '存在疑似截断的 innerHTML 赋值');
    }
  }
}

/* 9. fetch() paths in JS relative to 1.2 */
function checkFetchPaths() {
  const jsDir = join(APP, 'js');
  const dataFiles = new Set();
  const walk = (dir) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else dataFiles.add(relative(APP, p).replace(/\\/g, '/'));
    }
  };
  walk(join(APP, 'data'));
  for (const f of readdirSync(jsDir)) {
    if (!f.endsWith('.js')) continue;
    const src = readFileSync(join(jsDir, f), 'utf8');
    const re = /(?:fetch|loadJson)\(\s*['"`](data\/[^'"`]+)['"`]/g;
    let m;
    while ((m = re.exec(src))) {
      const path = m[1];
      if (!dataFiles.has(path) && !existsSync(join(APP, path))) {
        issue('error', `js/${f}`, `fetch 目标不存在: ${path}`);
      }
    }
  }
}

/* 10. BOM / encoding */
function checkBom() {
  const html = readFileSync(join(APP, 'index.html'));
  if (html[0] === 0xef && html[1] === 0xbb && html[2] === 0xbf) {
    issue('info', 'index.html', '存在 UTF-8 BOM（一般可接受）');
  }
  // app.js BOM known
  for (const f of readdirSync(join(APP, 'js'))) {
    const buf = readFileSync(join(APP, 'js', f));
    if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
      issue('info', `js/${f}`, 'UTF-8 BOM');
    }
  }
}

/* 11. HTML: unclosed subject-cards already covered; broader: count section tags */
function checkHtmlSections() {
  const html = readFileSync(join(APP, 'index.html'), 'utf8');
  const open = (html.match(/<section\b/g) || []).length;
  const close = (html.match(/<\/section>/g) || []).length;
  if (open !== close) issue('error', 'index.html', `section 开闭不等: open=${open} close=${close}`);
  const divOpen = (html.match(/<div\b/g) || []).length;
  const divClose = (html.match(/<\/div>/g) || []).length;
  // large file may have intentional imbalance in strings; only warn if big gap
  if (Math.abs(divOpen - divClose) > 0) {
    issue('info', 'index.html', `div 开闭计数差 ${divOpen - divClose}（含 JS 字符串时可能假阳性）`);
  }
}

checkJsSyntax();
checkScriptRefs();
checkCssRefs();
checkDuplicateIds();
const toolInfo = checkToolSections();
checkManifest();
checkAllJson();
checkTemplateFootguns();
checkFetchPaths();
checkBom();
checkHtmlSections();

const errors = issues.filter((i) => i.sev === 'error');
const warns = issues.filter((i) => i.sev === 'warn');
const infos = issues.filter((i) => i.sev === 'info');

console.log('=== 静态扫描报告 ===');
console.log(`data-tool=${toolInfo.toolCount} sections=${toolInfo.sectionCount}`);
console.log(`ERRORS: ${errors.length}  WARNS: ${warns.length}  INFOS: ${infos.length}`);
console.log('');
for (const group of [['ERROR', errors], ['WARN', warns], ['INFO', infos]]) {
  if (!group[1].length) continue;
  console.log(`--- ${group[0]} ---`);
  for (const i of group[1]) {
    console.log(`  [${i.sev}] ${i.where}: ${i.msg}`);
  }
  console.log('');
}
process.exit(errors.length ? 1 : 0);
