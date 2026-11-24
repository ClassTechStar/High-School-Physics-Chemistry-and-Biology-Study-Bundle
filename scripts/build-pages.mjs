/**
 * build-pages.mjs — Pages 发布期压缩（v1.8 P2）
 * 把 1.2/ 复制到 dist-pages/ 并对 .js/.css 做发布期压缩（esbuild，devDependency）：
 *   · 只压产物，仓库始终保持源码形态（diff 可读、门禁可扫）
 *   · 非 bundle 的 transform 压缩不改名顶层标识符，跨脚本的 window 导出与全局函数引用安全
 *   · 压缩后逐文件 node --check 语法校验 + 抽查关键导出仍在，防压缩破坏运行时
 * 用法：node scripts/build-pages.mjs     （CI 里由 pages.yml 调用）
 */
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, dirname, resolve, relative, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, '1.2');
const OUT = join(ROOT, 'dist-pages');

function walk(dir, base = dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, base, out);
    else out.push(relative(base, full).split(sep).join('/'));
  }
  return out;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(SRC, OUT, { recursive: true });

const files = walk(SRC);
let jsN = 0, cssN = 0, jsBefore = 0, jsAfter = 0, cssBefore = 0, cssAfter = 0;

for (const rel of files) {
  const abs = join(OUT, rel);
  const ext = extname(rel).toLowerCase();
  // 只按 UTF-8 读取需要压缩的文本文件。字体/图片等二进制按 utf8 读会生成
  // 大量替换字符，8MB 的 ttf 在 CI 的 Node 20 上足以把 deploy 拖到失败。
  if (ext !== '.js' && ext !== '.mjs' && ext !== '.css') continue;
  const raw = readFileSync(abs, 'utf8');

  if (ext === '.js' || ext === '.mjs') {
    // charset 必须 utf8：默认 ascii 会把中文字符串转成 \uXXXX 转义（3 字节→12 字节），压缩反而变大
    const out = await transform(raw, { loader: 'js', minify: true, target: 'es2018', charset: 'utf8', legalComments: 'none' });
    writeFileSync(abs, out.code);
    jsN++; jsBefore += Buffer.byteLength(raw); jsAfter += Buffer.byteLength(out.code);
    // 语法校验：压缩产物必须可解析
    try { execFileSync(process.execPath, ['--check', abs], { stdio: 'pipe' }); }
    catch (e) { console.error(`  ✗ 压缩产物语法损坏: ${rel}`); process.exit(1); }
  } else if (ext === '.css') {
    const out = await transform(raw, { loader: 'css', minify: true, charset: 'utf8', legalComments: 'none' });
    writeFileSync(abs, out.code);
    cssN++; cssBefore += Buffer.byteLength(raw); cssAfter += Buffer.byteLength(out.code);
  }
}

// 抽查：顶层导出/跨脚本引用的标识符未被改名（非 bundle 压缩应保留顶层名）
const probes = [
  ['dist-pages/js/app.js', 'function loadModuleContent'],
  ['dist-pages/js/main-nav.js', 'window.navigateToolPage'],
  ['dist-pages/js/progress.js', 'HSPCBProgress'],
  ['dist-pages/sw.js', 'CACHE_NAME'],
];
for (const [p, needle] of probes) {
  if (!readFileSync(join(ROOT, p), 'utf8').includes(needle)) {
    console.error(`  ✗ 压缩丢失关键标识符: ${p} 缺 "${needle}"`);
    process.exit(1);
  }
}

// SW 缓存版本自动生成（§5）：对 CORE_ASSETS 的实际内容求哈希，写进发布产物的
// CACHE_NAME。收益：不再依赖人手记得「发布时必须递增」，只要核心资源有变化，
// 新版本号必然不同 → 旧缓存自动清理；内容没变则版本不变 → 用户不会被迫重下。
const distSwPath = join(OUT, 'sw.js');
let swCode = readFileSync(distSwPath, 'utf8');
const coreMatch = swCode.match(/CORE_ASSETS\s*=\s*\[([\s\S]*?)\]/);
if (!coreMatch) {
  console.error('  ✗ 无法从 sw.js 解析 CORE_ASSETS，无法自动生成缓存版本');
  process.exit(1);
}
const coreNames = [...coreMatch[1].matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
const swHash = createHash('sha256');
for (const rel of coreNames) {
  try {
    swHash.update(rel).update(readFileSync(join(OUT, rel)));
  } catch {
    swHash.update(rel).update('missing'); // 清单里有但产物缺失：计入哈希，避免静默通过
  }
}
const swVersion = 'hspcb-' + swHash.digest('hex').slice(0, 12);
swCode = swCode.replace(/CACHE_NAME\s*=\s*["'][^"']+["']/, `CACHE_NAME = '${swVersion}'`);
writeFileSync(distSwPath, swCode);
console.log(`  ✓ SW 缓存版本自动生成: ${swVersion}（覆盖 ${coreNames.length} 个核心资源）`);

const pct = (before, after) => before ? ((1 - after / before) * 100).toFixed(1) : '0';
console.log(`  ✓ JS  压缩 ${jsN} 个: ${jsBefore} → ${jsAfter} B（−${pct(jsBefore, jsAfter)}%）`);
console.log(`  ✓ CSS 压缩 ${cssN} 个: ${cssBefore} → ${cssAfter} B（−${pct(cssBefore, cssAfter)}%）`);
console.log(`  ✓ 产物目录 dist-pages/ 就绪（${files.length} 个文件）`);
