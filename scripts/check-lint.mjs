/**
 * check-lint.mjs — 代码卫生门禁（的自动化检测）
 *
 * 设计原则（对齐 DEV-PLAN 的 R4）：
 * 门禁对「基线内的存量技术债」只提示不失败，对「新增违规」立即失败。
 * 这样门禁既有真实失败能力（不会像修复前的 check-global-collisions 那样永远 exit 0），
 * 又不会因为 552 条历史副本这类存量问题而永久变红。基线每条必须带 issue 号。
 *
 * 覆盖：
 * L1 裸 localStorage 调用（应走 HSPCBStore / HSPCBProgress）—— 
 * L2 escapeHtml 的重复实现应收敛为 1 份 —— 
 * L3 index.html 内联硬编码色值 / 缺失设计令牌 —— 
 * L4 innerHTML 赋值处的转义覆盖率统计 —— 
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, '1.2');

const BASELINE = JSON.parse(readFileSync(join(ROOT, 'scripts', 'lint-baseline.json'), 'utf8'));

let pass = 0, fail = 0, noted = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓', msg); }
  else { fail++; console.error('  ✗', msg); }
}
function baseline(msg) { noted++; console.log('  [基线]', msg); }

const jsFiles = readdirSync(join(APP, 'js')).filter((f) => f.endsWith('.js'));
const read = (f) => readFileSync(join(APP, 'js', f), 'utf8');
const html = readFileSync(join(APP, 'index.html'), 'utf8');
const tokens = readFileSync(join(APP, 'css/tokens.css'), 'utf8');

// ---------------------------------------------------------------- L1 裸 localStorage
console.log('=== L1. 裸 localStorage 调用（P1-4 存储三轨收敛） ===');
{
  const baselineFiles = new Set((BASELINE.lint['L1-bare-localStorage'] || []).map((b) => b.file));

  // file -> [行号...]
  const fileHits = new Map();
  for (const f of jsFiles) {
    read(f).split('\n').forEach((line, i) => {
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return; // 注释行
      if (/localStorage\s*\.\s*(getItem|setItem|removeItem)\s*\(/.test(line)) {
        if (!fileHits.has(f)) fileHits.set(f, []);
        fileHits.get(f).push(i + 1);
      }
    });
  }

  const fresh = [...fileHits].filter(([f]) => !baselineFiles.has(f));
  ok(fresh.length === 0,
    fresh.length === 0
      ? `裸 localStorage 调用仅出现在已登记的 ${fileHits.size} 个文件内`
      : `新增 ${fresh.length} 个文件的裸 localStorage 调用（应收敛到 HSPCBStore/HSPCBProgress）:\n      ${fresh.map(([f, ls]) => `${f} → ${ls.length} 处`).join('\n      ')}`);

  const total = [...fileHits.values()].reduce((a, v) => a + v.length, 0);
  baseline(`裸 localStorage 共 ${total} 处 / ${fileHits.size} 个文件，待 T2-3 收敛：${[...fileHits.keys()].join(', ')}`);
}

// ---------------------------------------------------------------- L2 escapeHtml 重复实现
console.log('=== L2. escapeHtml 实现收敛（P2-1） ===');
{
  const authoritative = (BASELINE.lint['L2-escapeHtml-duplicates'] || []).map((b) => b.file);
  const defs = [];
  for (const f of jsFiles) {
    read(f).split('\n').forEach((line, i) => {
      if (/function\s+escapeHtml\s*\(/.test(line)) defs.push({ file: f, line: i + 1 });
      else if (/(?:const|let|var)\s+escapeHtml\s*=/.test(line)) defs.push({ file: f, line: i + 1 });
      else if (/^\s*escapeHtml\s*:\s*function\s*\(/.test(line)) defs.push({ file: f, line: i + 1 });
    });
  }

  ok(defs.filter((d) => d.file === 'common-utils.js').length === 1,
    'common-utils.js 有且仅有 1 份权威 escapeHtml 实现');

  // 区分「真·重复实现」与「已委托到权威实现」。
  // 判定依据：抓取定义处之后 12 行函数体，只要出现 CommonUtils.escapeHtml 调用
  // 即认定为委托（旧实现都改成了转发），不再计入重复。
  const bodyOf = (d) => {
    const arr = read(d.file).split(/\r?\n/);
    return arr.slice(d.line - 1, d.line + 11).join('\n');
  };
  const isDelegating = (d) => /CommonUtils\.escapeHtml/.test(bodyOf(d));

  const realDups = defs.filter((d) => d.file !== 'common-utils.js' && !isDelegating(d));
  const fresh = realDups.filter((d) => !authoritative.includes(d.file));

  ok(realDups.length === 0,
    realDups.length === 0
      ? `escapeHtml 已收敛为 1 份权威实现（其余 ${defs.length - 1} 处均为转发委托）`
      : `${realDups.length} 处 escapeHtml 仍是独立重复实现:\n      ${realDups.map((d) => `${d.file}:${d.line}`).join('\n      ')}`);

  ok(fresh.length === 0,
    fresh.length === 0
      ? '无新增 escapeHtml 重复实现'
      : `新增 ${fresh.length} 份 escapeHtml 重复实现:\n      ${fresh.map((d) => `${d.file}:${d.line}`).join('\n      ')}`);

  if (realDups.length) {
    baseline(`escapeHtml 独立重复实现 ${realDups.length} 处：${realDups.map((d) => `${d.file}:${d.line}`).join(', ')} → T1-5`);
  }
}

// ---------------------------------------------------------------- L3 内联色值 / 令牌
console.log('=== L3. 设计令牌闭环（P1-11 / P1-12） ===');
{
  const colorHits = [];
  html.split('\n').forEach((line, i) => {
    if (/border-left\s*:\s*\d+px\s+solid\s+#[0-9a-fA-F]{3,8}/.test(line)) colorHits.push(i + 1);
  });

  // 基线按**条数**登记而非行号 —— 行号会随任何一次编辑漂移，按行号登记等于没有基线。
  const b = (BASELINE.lint['L3-inline-hardcoded-color'] || []).find((x) => x.baselineCount !== undefined);
  const allowed = b ? b.baselineCount : 0;
  ok(colorHits.length <= allowed,
    colorHits.length <= allowed
      ? `index.html 内联 border-left 硬编码色值 ${colorHits.length} 处（基线 ${allowed}，随 T3-1 递减）`
      : `内联硬编码色值从基线 ${allowed} 增至 ${colorHits.length}（新增 ${colorHits.length - allowed} 处应改用 tokens.css 令牌类）`);
  if (colorHits.length) {
    baseline(`index.html 内联硬编码色值 ${colorHits.length} 处（6 学科卡中 3 张 + platform 区块）→ T3-1，每修一处请下调 lint-baseline.json 的 baselineCount`);
  }

  // 学科色相必须互不相同，否则卡片无法区分
  const tokenOf = (n) => {
    const m = new RegExp(`--${n}\\s*:\\s*([^;]+);`).exec(tokens);
    return m ? m[1].trim() : null;
  };
  const subjects = ['physics', 'chemistry', 'biology', 'chinese', 'math', 'english'];
  const values = subjects.map((s) => [s, tokenOf(s)]);

  const hasEnglish = values.find(([s]) => s === 'english')[1] !== null;
  ok(hasEnglish || (BASELINE.lint['L3-missing-token'] || []).some((b) => b.token.includes('--english')),
    hasEnglish ? '--english 令牌已定义' : '[基线] --english 令牌缺失（英语无主题色）→ T3-1 补齐');

  const missing = values.filter(([, v]) => v === null).map(([s]) => s);
  ok(missing.length === 0 || missing.every((s) => ['english'].includes(s)),
    missing.length === 0 ? '六科学科色令牌齐全' : `缺令牌: ${missing.join(', ')}`);

  // 重复色相检测（当前 --math 与 --physics 同为 #3b82f6）
  const seen = new Map();
  const dupColors = [];
  for (const [s, v] of values) {
    if (!v) continue;
    if (seen.has(v)) dupColors.push(`${seen.get(v)} 与 ${s} 同为 ${v}`);
    else seen.set(v, s);
  }
  const dupBaselined = (BASELINE.lint['L3-missing-token'] || []).some((b) => b.token.includes('--math'));
  ok(dupColors.length === 0 || dupBaselined,
    dupColors.length === 0 ? '六科主题色相互不相同' : `[基线] 学科色相重复: ${dupColors.join('; ')} → T3-1 换色相`);
}

// ---------------------------------------------------------------- L4 innerHTML 转义覆盖
console.log('=== L4. innerHTML 赋值处的转义覆盖率（P0-5） ===');
{
  const rows = [];
  for (const f of jsFiles) {
    const lines = read(f).split('\n');
    let assigns = 0, escaped = 0;
    lines.forEach((line) => {
      if (/\.innerHTML\s*\+?=/.test(line)) {
        assigns++;
        if (/_esc\(|escapeHtml\(|\besc\(|sanitize/i.test(line)) escaped++;
      }
    });
    if (assigns > 0) rows.push({ file: f, assigns, escaped });
  }
  const totalAssigns = rows.reduce((a, r) => a + r.assigns, 0);
  const totalEscaped = rows.reduce((a, r) => a + r.escaped, 0);

  console.log(`  [统计] innerHTML 赋值 ${totalAssigns} 处（分布于 ${rows.length} 个文件），赋值同行含转义调用 ${totalEscaped} 处`);
  console.log('  [说明] 多数渲染路径在模板上游对变量转义，故同行率是**下限估计**；');
  console.log('         转义的实际完整性由 check-content.mjs 的 C8「尖括号题可显示」规则交叉验证。');
  const zeroEscape = rows.filter((r) => r.escaped === 0 && r.assigns >= 10).map((r) => r.file);
  console.log(`  [统计] innerHTML ≥10 处且零转义调用的文件 ${zeroEscape.length} 个：${zeroEscape.slice(0, 8).join(', ')}${zeroEscape.length > 8 ? ' …' : ''}`);
  pass++; // 统计项，本身不作为门禁
}

console.log(`\nL1-L4 结果: ${pass} passed, ${noted} 项基线内技术债, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);