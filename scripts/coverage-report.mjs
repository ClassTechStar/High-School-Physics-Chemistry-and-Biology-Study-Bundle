#!/usr/bin/env node
/**
 * coverage-report.mjs — 题库 × 知识点覆盖度报告（v1.10 T17）
 *
 * 回答「哪一章缺题」：把 data/{subject}/knowledge.json 的 chapters[].topics[]
 * 与 data/exam/{subject}.json 的 knowledgePoints 交叉统计。
 * 匹配规则：知识点名与题目 knowledgePoints 归一化后互相包含即算命中
 * （题目用词常比主题名更具体，如「牛顿第二定律」对应主题「牛顿运动定律」）。
 *
 * 用法：
 *   node scripts/coverage-report.mjs            # 控制台表格
 *   node scripts/coverage-report.mjs --json     # 输出 JSON（供页面/CI 消费）
 *   node scripts/coverage-report.mjs --strict   # 存在 0 题主题时退出码 1
 *
 * 说明：默认不失败。存量数据先以报告模式暴露缺口，补齐后再在 verify 里切 --strict。
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, '1.2');
const SUBJECTS = ['physics', 'chemistry', 'biology', 'math', 'chinese', 'english'];
const SUBJECT_NAMES = { physics: '物理', chemistry: '化学', biology: '生物', math: '数学', chinese: '语文', english: '英语' };
const WEAK_THRESHOLD = 3;

const norm = (s) => String(s == null ? '' : s)
  .replace(/[\s·、，,。.;；:：()（）【】\[\]"'“”‘’《》]/g, '')
  .toLowerCase();

function topicsOf(subject) {
  const p = join(APP, 'data', subject, 'knowledge.json');
  if (!existsSync(p)) return [];
  try {
    const data = JSON.parse(readFileSync(p, 'utf8'));
    const out = [];
    for (const ch of data.chapters || []) {
      for (const t of ch.topics || []) {
        if (t && t.name) out.push({ chapter: ch.name || '', name: t.name });
      }
    }
    return out;
  } catch (e) {
    return [];
  }
}

const report = { generatedAt: new Date().toISOString(), subjects: {}, totals: { questions: 0, topics: 0, uncovered: 0, weak: 0 } };

for (const subject of SUBJECTS) {
  const examPath = join(APP, 'data', 'exam', `${subject}.json`);
  if (!existsSync(examPath)) continue;
  const bank = JSON.parse(readFileSync(examPath, 'utf8'));
  const questions = Array.isArray(bank.questions) ? bank.questions : [];

  const kpCount = new Map();
  for (const q of questions) {
    const points = Array.isArray(q.knowledgePoints) ? q.knowledgePoints : [];
    for (const kp of points) {
      const k = norm(kp);
      if (!k) continue;
      kpCount.set(k, (kpCount.get(k) || 0) + 1);
    }
  }

  const topics = topicsOf(subject).map((t) => {
    const nt = norm(t.name);
    let count = 0;
    const matched = [];
    for (const [kp, n] of kpCount) {
      if (!nt || !kp) continue;
      if (kp.includes(nt) || nt.includes(kp)) {
        count += n;
        matched.push(kp);
      }
    }
    return { chapter: t.chapter, name: t.name, count: count, matched: matched.slice(0, 5) };
  });

  topics.sort((a, b) => a.count - b.count || a.name.localeCompare(b.name, 'zh'));
  const uncovered = topics.filter((t) => t.count === 0);
  const weak = topics.filter((t) => t.count > 0 && t.count < WEAK_THRESHOLD);
  const covered = topics.length - uncovered.length;

  report.subjects[subject] = {
    name: SUBJECT_NAMES[subject],
    questions: questions.length,
    topics: topics.length,
    covered: covered,
    uncovered: uncovered.map((t) => ({ chapter: t.chapter, name: t.name })),
    weak: weak.map((t) => ({ chapter: t.chapter, name: t.name, count: t.count })),
    least: topics.slice(0, 8)
  };
  report.totals.questions += questions.length;
  report.totals.topics += topics.length;
  report.totals.uncovered += uncovered.length;
  report.totals.weak += weak.length;
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('=== 题库 × 知识点覆盖度 ===');
  for (const subject of SUBJECTS) {
    const r = report.subjects[subject];
    if (!r) continue;
    const rate = r.topics ? Math.round((r.covered / r.topics) * 100) : 0;
    console.log(`\n${r.name}：${r.questions} 题 / ${r.topics} 个主题（覆盖 ${r.covered}，${rate}%）`);
    if (r.uncovered.length) {
      console.log(`  未覆盖 ${r.uncovered.length}：` + r.uncovered.slice(0, 6).map((t) => t.name).join('、'));
    }
    if (r.weak.length) {
      console.log(`  薄弱(${WEAK_THRESHOLD} 题以下) ${r.weak.length}：` + r.weak.slice(0, 6).map((t) => `${t.name}(${t.count})`).join('、'));
    }
    if (!r.uncovered.length && !r.weak.length) console.log('  无缺口');
  }
  console.log(`\n合计：${report.totals.questions} 题 / ${report.totals.topics} 个主题，未覆盖 ${report.totals.uncovered}，薄弱 ${report.totals.weak}`);
}

if (process.argv.includes('--strict') && (report.totals.uncovered > 0 || report.totals.weak > 0)) {
  console.error('\n覆盖度严格模式：存在未覆盖或薄弱主题（见上）');
  process.exit(1);
}
