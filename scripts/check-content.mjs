/**
 * check-content.mjs — 内容语义门禁（T0-3）
 *
 * 与 validate-data.mjs 的分工：
 *   validate-data.mjs = 结构校验（字段存在性、类型、可选项完整性）
 *   check-content.mjs = **语义校验**（内容对不对、能不能被学生使用）
 *
 * 规则集（每条对应 ERRATA-REPORT 的具体缺陷）：
 *   C1 同题干重复（P0-4）—— validate-data.mjs 只查 id 唯一性，查不出内容重复
 *   C2 考点可解析率（P0-3）—— 错题归因链路是否走得通
 *   C3 分科答案分布偏斜（P0-2）—— 全局均衡 ≠ 学生实际体验的均衡
 *   C4 options 缺失/为空（P0-12）—— 74 题崩溃 + 171 题作答区为空
 *   C5 knowledgePoints 字段名不一致（P1-5）
 *   C6 非常规字段残留（P1-6）—— 内部备注 / 调试字段随生产数据发布
 *   C7 模板化解析（P1-7）—— 复述题干 + 报答案字母，无实质讲解
 *   C8 尖括号内容的渲染安全（P0-5）
 *   C9 meta.totalQuestions 与实际一致（文档漂移）
 *  C10 解析声明的答案字母与 answer 一致（P0-1，与 validate-data 互为交叉验证）
 *
 * 与 check-lint 同样采用「基线内只提示、基线外立即失败」策略。
 */
import { readFileSync, existsSync } from 'node:fs';
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
const baseCount = (key) => {
  const e = (BASELINE.content || {})[key] || [];
  const c = e.find((x) => x.baselineCount !== undefined);
  return c ? c.baselineCount : 0;
};

// ---------------------------------------------------------------- 载入题库
const bank = JSON.parse(readFileSync(join(APP, 'data', 'exam-bank.json'), 'utf8'));
const SUBJECTS = Object.keys(bank).filter((k) => k !== 'meta');
const allQs = [];
for (const s of SUBJECTS) {
  for (const q of (bank[s].questions || bank[s].exams || [])) allQs.push({ subject: s, q });
}
console.log(`题库载入：${SUBJECTS.length} 学科 / ${allQs.length} 题\n`);

// ------------------------------------------------- 去重视图（全脚本共用）
// C1 的核心发现是「按学科+题干」存在 552 条冗余。副本与正本内容完全相同，
// 若后续规则（考点解析率、答案分布）仍用全量 1718 题统计，指标会被副本放大而失真。
// 因此 C2/C3 统一在去重视图上计算，口径为「学生实际会遇到的题目」。
const C1_DEDUPED = [];
{
  const seen = new Set();
  for (const item of allQs) {
    const stem = String(item.q.question || '').trim().replace(/\s+/g, ' ').slice(0, 200);
    const opts = Array.isArray(item.q.options) ? item.q.options.join('|') : '';
    const passage = String(item.q.passage || '').trim().replace(/\s+/g, ' ').slice(0, 200);
    // 必须与 dedupe-by-content.mjs 同口径：题干 + 选项集 + 材料。
    // 少了 passage 会把英语语法填空/短文改错的 5 道不同题误判为副本。
    const key = item.subject + '||' + stem + '||' + opts + '||' + passage;
    if (seen.has(key)) continue;
    seen.add(key);
    C1_DEDUPED.push(item);
  }
}

// ---------------------------------------------------------------- C1 同题干重复
console.log('=== C1. 同题干重复（P0-4） ===');
{
  // 与 C2/C3 共用同一去重视图：学科 + 题干 + 选项集 + 材料（passage）。
  // 只按题干会误伤「同题干不同材料」的独立题（英语语法填空/短文改错共 135 道）。
  const groups = new Map();
  for (const { subject, q } of allQs) {
    const stem = String(q.question || '').trim().replace(/\s+/g, ' ').slice(0, 200);
    if (!stem) continue;
    const opts = Array.isArray(q.options) ? q.options.join('|') : '';
    const passage = String(q.passage || '').trim().replace(/\s+/g, ' ').slice(0, 200);
    const key = subject + '||' + stem + '||' + opts + '||' + passage;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(q.id);
  }
  const dups = [...groups].filter(([, ids]) => ids.length > 1);
  const redundant = dups.reduce((a, [, ids]) => a + ids.length - 1, 0);
  const uniq = allQs.length - redundant;

  const allowed = baseCount('C1-duplicate-stem');
  ok(redundant <= allowed,
    redundant <= allowed
      ? `题干重复冗余 ${redundant} 条（基线 ${allowed}，T1-2 去重后递减）；真实唯一题量 ${uniq}`
      : `题干重复冗余从基线 ${allowed} 增至 ${redundant}：${dups.length} 组新增重复`);

  const perSubject = {};
  for (const [key, ids] of dups) {
    const s = key.split('||')[0];
    perSubject[s] = (perSubject[s] || 0) + ids.length - 1;
  }
  baseline(`重复冗余分布：${SUBJECTS.map((s) => `${s} ${perSubject[s] || 0}`).join(' / ')}；真实唯一题量 ${uniq}（README 宣称 1718）→ T1-2`);
}

// ---------------------------------------------------------------- C2 考点可解析率
console.log('=== C2. 考点 → 知识点可解析率（P0-3 错题归因链路） ===');
{
  // 从 learning-path-recommender.js 抽出真实的别名表，保持与运行时一致
  const recSrc = readFileSync(join(APP, 'js', 'learning-path-recommender.js'), 'utf8');
  const aliasBlock = /TOPIC_ALIAS_MAP\s*=\s*\{([\s\S]*?)\n\};/.exec(recSrc);
  const aliases = new Map();
  if (aliasBlock) {
    const body = aliasBlock[1];
    for (const m of body.matchAll(/^\s*'([^']+)'\s*:\s*'([^']+)'/gm)) aliases.set(m[1], m[2]);
    for (const m of body.matchAll(/^\s*'([^']+)'\s*:\s*\[([^\]]*)\]/gm)) {
      aliases.set(m[1], m[2].split(',').map((x) => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean).join('|'));
    }
  }

  // knowledge topic 名集合
  const topicNames = new Set();
  for (const s of SUBJECTS) {
    const p = join(APP, 'data', s, 'knowledge.json');
    if (!existsSync(p)) continue;
    const k = JSON.parse(readFileSync(p, 'utf8'));
    for (const ch of k.chapters || []) for (const t of ch.topics || []) {
      topicNames.add(String(t.name || '').trim());
      topicNames.add(String(t.title || '').trim());
    }
  }
  const norm = (x) => String(x).trim().toLowerCase().replace(/[\s（）()、,，.。:：]/g, '');

  const resolveTopic = (kp) => {
    if (!kp) return null;
    // 1) 别名表精确命中
    const aliasHit = aliases.get(kp);
    if (aliasHit) {
      for (const cand of aliasHit.split('|')) {
        if (topicNames.has(cand)) return cand;
      }
    }
    // 2) 原值
    if (topicNames.has(kp)) return kp;
    // 3) 归一化匹配
    const n = norm(kp);
    for (const t of topicNames) if (norm(t) === n) return t;
    // 4) 双向包含
    for (const t of topicNames) {
      const nt = norm(t);
      if (nt && n && (nt.includes(n) || n.includes(nt))) return t;
    }
    return null;
  };

  const THRESHOLD = { physics: 85, chemistry: 70, biology: 70, math: 70, chinese: 70, english: 70 };
  const report = [];
  const unresolvedBySubject = {};
  // 复用脚本顶部的共享去重视图（学科+题干+选项集+材料），避免两处口径漂移。
  // 早期版本在此处按「学科+题干」单独去重，会把 135 道「同题干不同 passage」
  // 的合法独立题误判为副本，指标被压低。
  const deduped = C1_DEDUPED;
  console.log(`  [口径] 去重后 ${deduped.length} 题参与统计（全库 ${allQs.length} 题）`);
  for (const s of SUBJECTS) {
    let kps = 0, hit = 0, unresolvedQ = 0;
    for (const { subject, q } of deduped) {
      if (subject !== s) continue;
      const list = q.knowledgePoints || q.知识要点;
      if (!Array.isArray(list) || list.length === 0) continue;
      let anyHit = false;
      for (const kp of list) {
        kps++;
        if (resolveTopic(kp)) { hit++; anyHit = true; }
      }
      if (!anyHit) unresolvedQ++;
    }
    const rate = kps ? (hit / kps) * 100 : 100;
    report.push({ s, rate, kps, hit, unresolvedQ, total: deduped.filter((x) => x.subject === s).length });
    unresolvedBySubject[s] = unresolvedQ;
  }

  console.log('  学科     考点数  命中   解析率   无法归因题目');
  for (const r of report) {
    const flag = r.rate >= (THRESHOLD[r.s] ?? 70) ? '✓' : '⚠';
    console.log(`  ${flag} ${r.s.padEnd(8)} ${String(r.kps).padStart(5)} ${String(r.hit).padStart(6)} ${(r.rate.toFixed(1) + '%').padStart(8)}   ${r.unresolvedQ}/${r.total}`);
  }

  const totalKps = report.reduce((a, r) => a + r.kps, 0);
  const totalHit = report.reduce((a, r) => a + r.hit, 0);
  const overall = ((totalHit / totalKps) * 100).toFixed(1);
  const allowed = baseCount('C2-knowledgePoints-unresolvable');
  const curUnresolved = Object.values(unresolvedBySubject).reduce((a, v) => a + v, 0);

  ok(curUnresolved <= allowed,
    curUnresolved <= allowed
      ? `考点解析率 ${overall}%（基线：${allowed} 道题无法归因，T1-4 扩表后递减）`
      : `无法归因题目从基线 ${allowed} 增至 ${curUnresolved}`);
  baseline(`考点解析率仅 ${overall}%（${totalHit}/${totalKps}），化学/数学/语文/英语最差 → T1-4：别名表抽到 knowledgePoints-thesaurus.json 并扩表`);
}

// ---------------------------------------------------------------- C3 分科答案偏斜
console.log('=== C3. 分科答案分布偏斜（P0-2） ===');
{
  const MAX_SHARE = 32;
  const rows = [];
  for (const s of SUBJECTS) {
    const dist = { A: 0, B: 0, C: 0, D: 0 };
    let n = 0;
    for (const { subject, q } of C1_DEDUPED) {
      if (subject !== s) continue;
      const a = String(q.answer || '').toUpperCase();
      if (!/^[A-D]$/.test(a) || !Array.isArray(q.options) || q.options.length !== 4) continue;
      dist[a]++; n++;
    }
    if (!n) continue;
    const worst = Object.entries(dist).sort((a, b) => b[1] - a[1])[0];
    rows.push({ s, dist, n, worst, share: (worst[1] / n) * 100 });
  }

  console.log('  学科      A    B    C    D   最大占比');
  for (const r of rows) {
    const flag = r.share <= MAX_SHARE ? '✓' : '⚠';
    console.log(`  ${flag} ${r.s.padEnd(8)} ${String(r.dist.A).padStart(4)} ${String(r.dist.B).padStart(4)} ${String(r.dist.C).padStart(4)} ${String(r.dist.D).padStart(4)}   ${r.worst[0]} ${r.share.toFixed(1)}%`);
  }

  const skewed = rows.filter((r) => r.share > MAX_SHARE);
  const allowed = baseCount('C3-subject-answer-skew');
  ok(skewed.length <= allowed,
    skewed.length <= allowed
      ? `${rows.length - skewed.length}/${rows.length} 学科分科均衡达标（任一字母 ≤ ${MAX_SHARE}%）`
      : `新增 ${skewed.length - allowed} 个学科答案偏斜超 ${MAX_SHARE}%：${skewed.map((r) => `${r.s}(${r.worst[0]} ${r.share.toFixed(0)}%)`).join(', ')}`);
  if (skewed.length) {
    baseline(`答案偏斜学科 ${skewed.length}/${rows.length}：${skewed.map((r) => `${r.s} ${r.worst[0]}=${r.share.toFixed(0)}%`).join(', ')} → T1-3：balance-answers.mjs 改按学科分桶，且必须先补「解析含答案字母则不换位」规则`);
  }
}

// ---------------------------------------------------------------- C4 options 缺失/为空
console.log('=== C4. options 缺失或为空（P0-12） ===');
{
  const missing = [];   // 无 options 字段
  const empty = [];     // options 为空数组
  for (const { subject, q } of allQs) {
    if (!('options' in q)) missing.push({ id: q.id, subject, type: q.type });
    else if (Array.isArray(q.options) && q.options.length === 0) empty.push({ id: q.id, subject, type: q.type });
  }
  const typeCount = (arr) => {
    const m = {};
    for (const x of arr) m[x.type || '?'] = (m[x.type || '?'] || 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}×${v}`).join(', ');
  };

  console.log(`  options 字段缺失: ${missing.length} 题`);
  if (missing.length) console.log(`    题型分布: ${typeCount(missing)}`);
  console.log(`  options 为空数组: ${empty.length} 题`);
  if (empty.length) console.log(`    题型分布: ${typeCount(empty)}`);

  const allowed = baseCount('C4-missing-options');
  ok(missing.length <= allowed,
    missing.length <= allowed
      ? `options 缺失 ${missing.length} 题（基线 ${allowed}）`
      : `options 缺失题数从基线 ${allowed} 增至 ${missing.length}，app-exam.js:547 会崩`);

  // 字母答案必须有对应选项（真实崩溃点）
  const badLetter = allQs.filter(({ q }) => {
    const a = String(q.answer || '').toUpperCase();
    return /^[A-D]$/.test(a) && (!Array.isArray(q.options) || q.options.length === 0);
  });
  ok(badLetter.length === 0,
    badLetter.length === 0
      ? '不存在「字母答案但无有效 options」的题（否则 app-exam.js 必崩）'
      : `${badLetter.length} 题有字母答案却无 options，详情页必崩：${badLetter.slice(0, 8).map((x) => x.q.id).join(', ')}`);

  if (missing.length || empty.length) {
    baseline(`缺失 ${missing.length}（英语为主）+ 空 ${empty.length}（主观题为主）→ T0-8：补主观题输入分支与 passage 材料渲染`);
  }
}

// ---------------------------------------------------------------- C5 字段名不一致
console.log('=== C5. knowledgePoints 字段名一致性（P1-5） ===');
{
  const STANDARD = ['id', 'subject', 'type', 'year', 'question', 'options', 'answer', 'analysis',
    'difficulty', 'knowledgePoints', 'passage', 'points', 'source', 'chapter'];
  const wrongNames = [];
  for (const { subject, q } of allQs) {
    for (const k of Object.keys(q)) {
      if (STANDARD.includes(k)) continue;
      if (!/[\u4e00-\u9fa5]/.test(k)) continue;          // 非常规字段名
      if (/ignored|_debug|_tmp/i.test(k)) continue;        // 调试字段归 C6 管
      wrongNames.push({ id: q.id, subject, key: k });
    }
  }
  const allowed = baseCount('C5-inconsistent-field-name');
  ok(wrongNames.length <= allowed,
    wrongNames.length <= allowed
      ? `非常规中文字段名 ${wrongNames.length} 处（基线 ${allowed}）`
      : `新增 ${wrongNames.length} 处中文字段名：${wrongNames.slice(0, 5).map((w) => `${w.id}.${w.key}`).join(', ')}`);
  if (wrongNames.length) baseline(`字段名异常：${wrongNames.map((w) => `${w.id}.${w.key}`).join(', ')} → T1-3`);
}

// ---------------------------------------------------------------- C6 内部字段残留
console.log('=== C6. 调试/内部字段残留（P1-6） ===');
{
  const hits = [];
  for (const { subject, q } of allQs) {
    for (const k of Object.keys(q)) {
      if (/ignored|_debug|_tmp|internal|note$/i.test(k)) hits.push(`${q.id}.${k}`);
    }
  }
  const allowed = baseCount('C6-internal-field');
  ok(hits.length <= allowed,
    hits.length <= allowed
      ? `内部字段 ${hits.length} 处（基线 ${allowed}）`
      : `新增 ${hits.length} 处内部字段：${hits.join(', ')}`);
  if (hits.length) baseline(`内部字段残留：${hits.join(', ')} → 清理`);
}

// ---------------------------------------------------------------- C7 模板化解析
console.log('=== C7. 模板化解析（P1-7 解析质量） ===');
{
  const template = [];
  for (const { q } of allQs) {
    const a = String(q.analysis || '');
    if (!a) continue;
    const stem = String(q.question || '').trim();
    // 模板特征：复述题干 + 报答案字母 + 套话
    const restates = stem.length > 12 && a.includes(stem.slice(0, Math.min(24, stem.length)));
    const boiler = /相关知识点涉及|相关知识点|正确答案为|答案为[ABCD]/.test(a) && a.length < 130;
    if (restates && boiler) template.push(q.id);
  }
  const allowed = baseCount('C7-template-analysis');
  ok(template.length <= allowed,
    template.length <= allowed
      ? `模板化解析 ${template.length} 道（基线 ${allowed}，T1-6 内容治理后递减）`
      : `模板化解析从基线 ${allowed} 增至 ${template.length}`);
  if (template.length) baseline(`模板化解析 ${template.length} 道（复述题干+报答案字母+套话）→ T1-6 人工重写，属内容工作`);
}

// ---------------------------------------------------------------- C8 尖括号渲染安全
console.log('=== C8. 含尖括号内容的题目（P0-5） ===');
{
  const risky = [];
  for (const { subject, q } of allQs) {
    const inOptions = Array.isArray(q.options) && q.options.some((o) => /[<>]/.test(String(o)));
    const inQuestion = /[<>]/.test(String(q.question || ''));
    if (inOptions || inQuestion) risky.push({ id: q.id, subject, inOptions, inQuestion, type: q.type, question: String(q.question || '') });
  }
  const optRisky = risky.filter((r) => r.inOptions);
  console.log(`  含 < 或 > 的题: ${risky.length} 道（其中选项含尖括号、点开答题即显示错乱: ${optRisky.length} 道）`);
  if (optRisky.length) {
    const bySub = {};
    for (const r of optRisky) bySub[r.subject] = (bySub[r.subject] || 0) + 1;
    console.log(`    选项尖括号分布: ${Object.entries(bySub).map(([k, v]) => `${k}×${v}`).join(', ')}`);
    for (const r of optRisky.slice(0, 6)) console.log(`      ${r.id}: ${r.question.slice(0, 46)}`);
  }
  // 这不是门禁失败项，而是 T1-5 的输入清单；此处只统计
  pass++;
  if (risky.length) baseline(`含尖括号题目 ${risky.length} 道（选项含尖括号 ${optRisky.length} 道）→ T1-5：13 条渲染路径统一 escapeHtml`);
}

// ---------------------------------------------------------------- C9 meta 一致性
console.log('=== C9. meta.totalQuestions 与实际一致（文档漂移） ===');
{
  const declared = bank.meta && bank.meta.totalQuestions;
  const subjectTotals = {};
  for (const s of SUBJECTS) {
    subjectTotals[s] = bank[s].total ?? (bank[s].questions || bank[s].exams || []).length;
  }
  const actual = allQs.length;
  const mismatchedSubjects = SUBJECTS.filter((s) => {
    const real = (bank[s].questions || bank[s].exams || []).length;
    return bank[s].total !== undefined && bank[s].total !== real;
  });
  console.log(`  meta.totalQuestions = ${declared}，实际 = ${actual}`);
  console.log(`  各科 total 字段: ${SUBJECTS.map((s) => `${s}=${subjectTotals[s]}`).join(' ')}`);
  const totalDrift = declared !== undefined && declared !== actual;
  ok(!totalDrift || baseCount('C9-meta-mismatch') > 0,
    !totalDrift
      ? 'meta.totalQuestions 与实际题量一致'
      : `[基线] meta.totalQuestions=${declared} 与实际 ${actual} 不符（差 ${declared - actual}）→ T1-2 去重后重算并同步 README/CHANGELOG/manifest`);
  if (totalDrift) baseline(`meta.totalQuestions 声明 ${declared}，实际 ${actual}（差 ${declared - actual}）→ T1-2`);
  if (mismatchedSubjects.length) {
    baseline(`各科 total 字段与实际不符: ${mismatchedSubjects.map((s) => `${s}(声明 ${bank[s].total}/实际 ${(bank[s].questions || bank[s].exams || []).length})`).join(', ')}`);
  }
}

// ---------------------------------------------------------------- C10 解析/答案交叉验证
console.log('=== C10. 解析声明的答案字母 == answer（P0-1，与 validate-data 交叉验证） ===');
{
  let conflict = 0;
  const samples = [];
  for (const { subject, q } of allQs) {
    const a = String(q.answer || '').toUpperCase();
    if (!/^[A-D]$/.test(a)) continue;
    const an = q.analysis || '';
    // 解析里显式声明的答案字母。
    // 必须要求「选/应选/故选…」+ 独立字母，且字母前不能是汉字（否则
    // "效应B细胞" 会把 "应" 当成判断词、"B" 当成答案字母，产生假阳性）。
    const DECL = /(?:故|所以|因此|综上|可见|答案)?\s*(?:应选|选择|选)\s*[为是]?\s*[（(]?\s*([A-D])(?![A-Za-z0-9一-龥])/g;
    let m;
    while ((m = DECL.exec(an)) !== null) {
      if (m[1] !== a) { conflict++; if (samples.length < 5) samples.push(`${q.id}(解析${m[1]}≠答案${a})`); }
    }
  }
  ok(conflict === 0,
    conflict === 0
      ? '解析声明的答案字母与 answer 全部一致（P0-1 保持修复状态）'
      : `${conflict} 道题解析声明字母与 answer 矛盾：${samples.join(', ')}`);
}

// ---------------------------------------------------------------- C11 标签式解析
console.log('=== C11. 标签式解析（【】机器壳） ===');
{
  // 批量生成脚本产出的「【考点】…【题干】…【概念】…【判断】…【结论】选 X」结构：
  // 复述题干 + 空泛排除话术（"不符合上述概念或题干限定"）同句复用数百次。
  // 与 C7 互补：C7 抓「复述题干 + 报答案字母」，C11 抓「【】标签壳 + 填空式排除」。
  const LABEL_SHELL = /【(考点|题干|概念|判断|结论|审题|答题思路|参考表述|评分关注|易错|技巧|排除)】/;
  const FILLER = /不符合上述概念或题干限定|与题意不符|按「手法\/词义|依据物理概念、规律或公式|依据化学概念、物质性质|依据生物学结构、生理过程|依据定义、公式或运算规则|依据语境、语法与文学常识|依据上下文语义与语法规则/;
  // 第二类变体：前半句带正确选项内容，后半句是批量填充的空话
  //   「…，正确答案为C（动能）。本题考查力学相关知识，需准确理解其基本概念与规律，由力学的基本原理可判断…」
  const BOILER_TAIL = /本题考查[^。]{0,40}需?要?准确(理解|掌握)/;
  const TAIL_FORMULA = /的(基本)?原理可判断/;
  const hits = [];
  for (const { subject, q } of allQs) {
    const a = String(q.analysis || '');
    if (!a) continue;
    const labeled = LABEL_SHELL.test(a) && FILLER.test(a);
    const tail = BOILER_TAIL.test(a) && TAIL_FORMULA.test(a);
    if (labeled || tail) hits.push({ id: q.id, subject });
  }
  const allowed = baseCount('C11-labeled-shell-analysis');
  const bySub = {};
  for (const h of hits) bySub[h.subject] = (bySub[h.subject] || 0) + 1;
  ok(hits.length <= allowed,
    hits.length <= allowed
      ? `标签式解析 ${hits.length} 道（基线 ${allowed}）`
      : `标签式解析从基线 ${allowed} 增至 ${hits.length}`);
  if (hits.length) {
    baseline(`标签式解析 ${hits.length} 道：${Object.entries(bySub).map(([k, v]) => `${k} ${v}`).join(' / ')} → 内容治理：去标签壳并逐项写明错因`);
  }
}

// ---------------------------------------------------------------- C12 营销腔残留
console.log('=== C12. 营销腔/自造概念残留（文案层） ===');
{
  // 这些词要么是营销套话，要么是代码里并不存在的自造概念。
  // 例：「六维标签体系」在代码里并不存在（题目只有考点/难度/题型/分值/年份/章节 6 个真实维度，
  // 但其中「情境类型」「能力要求」「地区特色」三个维度从未实现）。
  const PHRASES = [
    '一站式', '智能备考平台', '精准提分', '一体化备考', '赋能素养', '全方位置能',
    '六维标签体系', '智能命题引擎', '七维能力标签', '群体学情预警', '一体两翼',
    '省级教学比赛', '比赛级输出', '诊断-推送-巩固', '能力跃升',
  ];
  const SURFACES = [
    'index.html', 'presentation.html', 'promo.html', 'manifest.json',
    'js/platform-system.js', 'js/content-enhancement.js', 'js/gamification-system.js',
    'js/global-search.js', 'js/onboarding.js',
  ];
  const hits = [];
  for (const rel of SURFACES) {
    const p = join(APP, rel);
    if (!existsSync(p)) continue;
    const src = readFileSync(p, 'utf8');
    for (const w of PHRASES) {
      const n = src.split(w).length - 1;
      if (n > 0) hits.push({ file: rel, phrase: w, n });
    }
  }
  const allowed = baseCount('C12-marketing-copy');
  const total = hits.reduce((a, h) => a + h.n, 0);
  ok(total <= allowed,
    total <= allowed
      ? `营销腔残留 ${total} 处（基线 ${allowed}）`
      : `营销腔残留从基线 ${allowed} 增至 ${total}`);
  if (hits.length) {
    baseline(`营销腔 ${total} 处：${hits.map((h) => `${h.file}:${h.phrase}×${h.n}`).join(' / ')}`);
  }
}

console.log(`\nC1-C12 结果: ${pass} passed, ${noted} 项基线内技术债, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);