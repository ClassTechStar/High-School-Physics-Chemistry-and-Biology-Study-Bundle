#!/usr/bin/env node
/**
 * check-anchors.mjs — 链接完整性门禁
 *
 * 灵感来源：whk-wiki 的 `onBrokenLinks: 'throw'`——把「链接指向不存在的位置」
 * 从「上线后用户点空」变成「提交前就失败」。
 *
 * 目标项目是单页应用 + 静态宣传页混排，链接分两类，各自失效方式都很隐蔽：
 *   1. 页内锚点 href="#x" —— 内容改版（合并/删减 section）后锚点不会自动跟着改，
 *      点了滚不到任何地方，控制台也不报错。
 *      实证：本门禁首次运行即发现 index.html 2 处、promo.html 3 处失效锚点。
 *   2. 跨页深链 href="index.html?goto=x" —— goto 的值由 js/deep-link.js 的
 *      路由表解析，路由改名后这些链接静默失效（页面能打开，但停在首页）。
 *      这里直接读 deep-link.js 的 SECTIONS 键集合做交叉校验。
 *
 * 退出码：0 = 全部有效；1 = 存在失效链接。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WEB = join(ROOT, '1.2');
const read = (p) => readFileSync(join(WEB, p), 'utf8');

const problems = [];
const fail = (msg) => problems.push(msg);

// ---------- 1. deep-link 路由表（跨页 goto 的合法取值） ----------
// 从 SECTIONS 对象字面量里取键，避免门禁自己维护一份会和实现漂移的副本。
const deepLinkSrc = read('js/deep-link.js');
const sectionsBlock = (deepLinkSrc.match(/var SECTIONS = \{([\s\S]*?)\};/) || [])[1] || '';
const gotoKeys = new Set(
  [...sectionsBlock.matchAll(/^\s*([a-z][\w-]*)\s*:/gm)].map((m) => m[1])
);
// deep-link 里除 SECTIONS 外还有 settings 与 tool: 两个特殊路由
gotoKeys.add('settings');
if (!gotoKeys.size) {
  fail('无法从 js/deep-link.js 解析出 SECTIONS 路由表（门禁自身失效，需人工核对）');
}

// ---------- 2. 逐页校验 ----------
const pages = readdirSync(WEB).filter((f) => f.endsWith('.html')).sort();

let anchorTotal = 0;
let gotoTotal = 0;

for (const page of pages) {
  const html = read(page);

  // id 全集（本文件内可作为锚点落点的元素）
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));

  // 2a. 页内锚点
  const anchors = [...new Set(
    [...html.matchAll(/href="#([^"]*)"/g)].map((m) => m[1]).filter(Boolean)
  )];
  anchorTotal += anchors.length;
  for (const a of anchors) {
    if (!ids.has(a)) {
      fail(`${page} 锚点 #${a} 无对应 id（点了不会滚动，控制台也不报错）`);
    }
  }

  // 2b. 跨页 goto 深链
  const gotos = [...new Set(
    [...html.matchAll(/href="[\w.-]*\.html\?goto=([^"&]+)/g)].map((m) => decodeURIComponent(m[1]))
  )];
  gotoTotal += gotos.length;
  for (const g of gotos) {
    // tool:<id> 形态由工具注册表管，这里只校验学科/设置这类固定路由
    if (g.startsWith('tool:')) continue;
    if (!gotoKeys.has(g)) {
      fail(`${page} 深链 ?goto=${g} 不在 js/deep-link.js 路由表内（会停在首页）`);
    }
  }
}

// ---------- 输出 ----------
if (problems.length) {
  for (const p of problems) console.error(`  ✗ ${p}`);
  console.error('check-anchors: 修正链接目标，或补齐缺失的 id / 路由后再试');
  process.exit(1);
}
console.log(`  ✓ 链接完整：${pages.length} 个页面 · ${anchorTotal} 个页内锚点 · ${gotoTotal} 个跨页深链，0 失效`);
