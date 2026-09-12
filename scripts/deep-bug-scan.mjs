/**
 * deeper quality checks: exam answers, knowledge schema, script order deps
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, '1.2');
const DATA = join(APP, 'data');

let errors = 0;
let warns = 0;
function E(m) { errors++; console.log('E', m); }
function W(m) { warns++; console.log('W', m); }

/* exam bank deeper */
const eb = JSON.parse(readFileSync(join(DATA, 'exam-bank.json'), 'utf8'));
const answerIssues = [];
const shortAnalysis = [];
const emptyOptionsChoice = [];
for (const subj of Object.keys(eb).filter((k) => k !== 'meta')) {
  const list = eb[subj].exams || eb[subj].questions || [];
  list.forEach((q, i) => {
    const id = q.id || `${subj}#${i}`;
    if (q.type && String(q.type).includes('选择')) {
      const opts = q.options || [];
      const a = String(q.answer || '').trim().toUpperCase();
      const letters = opts.map((_, j) => String.fromCharCode(65 + j));
      if (a && !letters.includes(a) && !/^\d+$/.test(a)) {
        answerIssues.push({ id, answer: q.answer, n: opts.length });
      }
    }
    if (q.analysis && q.analysis.length < 20) shortAnalysis.push(id);
    if (q.type && String(q.type).includes('选择') && (!q.options || q.options.length < 2)) {
      emptyOptionsChoice.push(id);
    }
    // stem mentions 如图 but no asset - known limitation
  });
}
if (answerIssues.length) E(`选择题答案不在选项域: ${answerIssues.length} 例, 例如 ${JSON.stringify(answerIssues.slice(0, 5))}`);
if (shortAnalysis.length) W(`解析过短(<20字): ${shortAnalysis.length} 例, 如 ${shortAnalysis.slice(0, 8).join(',')}`);
if (emptyOptionsChoice.length) E(`选择题选项不足: ${emptyOptionsChoice.length}`);

/* duplicate question ids */
const allIds = new Map();
for (const subj of Object.keys(eb).filter((k) => k !== 'meta')) {
  const list = eb[subj].exams || [];
  list.forEach((q) => {
    if (!q.id) return;
    if (allIds.has(q.id)) E(`题目 id 重复: ${q.id}`);
    allIds.set(q.id, subj);
  });
}

/* knowledge: keyPoints empty */
for (const s of ['physics', 'chemistry', 'biology', 'math', 'chinese', 'english']) {
  const d = JSON.parse(readFileSync(join(DATA, s, 'knowledge.json'), 'utf8'));
  for (const ch of d.chapters || []) {
    for (const t of ch.topics || []) {
      if (!t.keyPoints || !t.keyPoints.length) W(`${s} ${t.id} keyPoints 空`);
      if (!t.name) E(`${s} topic 缺 name`);
    }
  }
}

/* index.html script load order: progress before modules that might use it (optional) */
const html = readFileSync(join(APP, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
const pi = scripts.indexOf('js/progress.js');
const ci = scripts.indexOf('js/common-utils.js');
if (pi < 0) E('progress.js 未加载');
else if (ci >= 0 && pi !== ci + 1) W(`progress.js 未紧跟 common-utils (idx ${ci},${pi})`);

/* common-utils first */
if (scripts[0] !== 'js/common-utils.js') W(`首个脚本是 ${scripts[0]}`);

/* theme bootstrap present */
if (!html.includes('hspcb_theme')) W('缺少主题引导脚本');

/* SW registration */
if (!html.includes('serviceWorker')) W('未注册 Service Worker');

/* check exam-bank physics first question answer consistency */
{
  const q = eb.physics.exams[0];
  const a = q.answer.trim().toUpperCase();
  const idx = a.charCodeAt(0) - 65;
  console.log('样例 PHY_2018_01 answer=', a, 'option=', q.options[idx]?.slice(0, 40));
  if (!/6 s/.test(q.options[idx] || '')) E('PHY_2018_01 选项与解析不一致（应为 t=6s）');
}

/* padStart polyfill - progress.js uses padStart, IE11 no - but they claim ES5 */
const prog = readFileSync(join(APP, 'js/progress.js'), 'utf8');
if (prog.includes('padStart') && !prog.includes('polyfill')) {
  W('progress.js 使用 padStart（现代浏览器 OK，严格 ES5 目标需 polyfill）');
}

/* Object.assign in progress - ES6 */
if (prog.includes('Object.assign')) {
  W('progress.js 使用 Object.assign（现代浏览器 OK）');
}

console.log(`\n深层检查: ${errors} errors, ${warns} warnings`);
process.exit(errors ? 1 : 0);
