/**
 * check-global-collisions.mjs — 扫描 1.2 前端脚本的跨文件顶层声明重名 + window.* 覆写
 *
 * 为什么需要严格规则：
 *   1. `const/let/class/var/function` 同名 → 浏览器全局作用域 SyntaxError，整个文件静默失效（硬错误）
 *   2. `window.X = ...` 覆写            → 不抛错，但后执行者静默夺权（软告警，需显式登记）
 *
 * 顶层判定采用「列 0 缩进」为主信号：
 *   这些都是 classic script（非 ES module），浏览器全局作用域下的顶层声明一律顶格书写；
 *   函数体/块内的声明必然带缩进。因此「行首无空白」等价于「顶层」，且不会像
 *   花括号深度追踪那样被字符串/模板字面量/正则里的括号带偏（实测 47 个文件中有
 *   多个文件的裸括号计数无法收敛，深度追踪会永久漂移）。
 *   若某文件括号收支平衡可用，则额外用 depth===0 做交叉校验。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, '1.2');

// 已显式登记的合法 window 覆写（同一文件内自赋值、或刻意的聚合导出）
const ALLOWED_WINDOW_WRITES = new Set([
  'window.loadModuleContent', // 历史猴补丁残留（T2-4 处置）
]);

const decls = new Map();     // name -> [{file, kind, line}]
const winWrites = new Map(); // name -> [{file, line}]

const DECL_RE = /^(?:export\s+)?(?:(const|let|var|class|function)\s+\*?\s*([A-Za-z_$][\w$]*)|(async\s+function)\s+\*?\s*([A-Za-z_$][\w$]*))/;

function scanFile(file, src) {
  const lines = src.split('\n');

  // 交叉校验用：净括号深度（仅在收支平衡时有意义）
  const rawOpen = (src.match(/\{/g) || []).length;
  const rawClose = (src.match(/\}/g) || []).length;
  const depthUsable = rawOpen === rawClose;

  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const topLevel = line.length > 0 && !/^[ \t]/.test(line) && (depth === 0 || !depthUsable);

    if (topLevel) {
      const m = DECL_RE.exec(line);
      if (m) {
        const kind = (m[1] || m[3]).replace(/\s+/g, ' ');
        const name = m[2] || m[4];
        if (name) {
          if (!decls.has(name)) decls.set(name, []);
          decls.get(name).push({ file, kind, line: i + 1 });
        }
      }

      const wm = /\bwindow\.([A-Za-z_$][\w$]*)\s*=(?!=)/.exec(line);
      if (wm) {
        if (!winWrites.has(wm[1])) winWrites.set(wm[1], []);
        winWrites.get(wm[1]).push({ file, line: i + 1 });
      }
    }

    for (const ch of line) {
      if (ch === '{') depth++;
      else if (ch === '}') depth = Math.max(0, depth - 1);
    }
  }
}

let fileCount = 0;
for (const f of readdirSync(join(APP, 'js'))) {
  if (!f.endsWith('.js')) continue;
  scanFile(f, readFileSync(join(APP, 'js', f), 'utf8'));
  fileCount++;
}

// index.html 的内联脚本与 js/ 共享同一全局作用域，必须一起扫
const html = readFileSync(join(APP, 'index.html'), 'utf8');
let inlineCount = 0;
for (const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
  scanFile('index.html(inline)', m[1]);
  inlineCount++;
}

// ---------------------------------------------------------------- 报告
let errors = 0;
let warns = 0;

for (const [sym, entries] of [...decls].sort((a, b) => a[0].localeCompare(b[0]))) {
  const files = [...new Set(entries.map((e) => e.file))];
  if (files.length <= 1) continue; // 同文件内重复声明属合法的块级 shadow
  errors++;
  const detail = entries.map((e) => `${e.file}:${e.line}[${e.kind}]`).join(', ');
  console.log(`ERROR DUP-TOPLEVEL ${sym}: ${detail}`);
}

for (const [sym, entries] of [...winWrites].sort((a, b) => a[0].localeCompare(b[0]))) {
  const files = [...new Set(entries.map((e) => e.file))];
  if (files.length <= 1) continue;
  const key = `window.${sym}`;
  if (ALLOWED_WINDOW_WRITES.has(key)) {
    console.log(`WARN  window-override(已登记) ${key}: ${files.join(', ')}`);
    continue;
  }
  warns++;
  console.log(`WARN  window-override ${key}: ${files.join(', ')}  ← 后执行者静默夺权，需显式登记或收敛`);
}

const total = errors + warns;
if (total === 0) {
  console.log(
    `OK: 无跨文件顶层声明重名，无未登记的 window.* 覆写\n` +
    `    扫描 ${fileCount} 个 js 文件 + ${inlineCount} 个内联脚本块，共 ${decls.size} 个顶层符号`
  );
} else {
  console.log(`\n合计: ${errors} 个硬错误（导致 SyntaxError / 文件静默失效）, ${warns} 个软告警`);
}
process.exit(errors > 0 ? 1 : 0);