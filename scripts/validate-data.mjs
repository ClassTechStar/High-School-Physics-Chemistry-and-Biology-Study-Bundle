#!/usr/bin/env node
/**
 * validate-data.mjs — HSPCB 数据层校验与题库质检
 *
 * 用法:
 *   node scripts/validate-data.mjs
 *   node scripts/validate-data.mjs --json          # 机器可读输出
 *   node scripts/validate-data.mjs --sample 50     # 题库抽样质检条数
 *
 * 退出码: 0=通过(可有 warning); 1=存在 error
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA = join(ROOT, '1.2', 'data');
const SUBJECTS = ['physics', 'chemistry', 'biology', 'math', 'chinese', 'english'];
const SUBJECT_LABEL = {
  physics: '物理', chemistry: '化学', biology: '生物',
  math: '数学', chinese: '语文', english: '英语',
};

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const sampleIdx = args.indexOf('--sample');
const SAMPLE_N = sampleIdx >= 0 ? Number(args[sampleIdx + 1]) || 50 : 50;

/** @type {{level:'error'|'warn', file:string, msg:string, id?:string}[]} */
const findings = [];

function error(file, msg, id) {
  findings.push({ level: 'error', file, msg, id });
}
function warn(file, msg, id) {
  findings.push({ level: 'warn', file, msg, id });
}

function readJson(rel) {
  const abs = join(DATA, rel);
  if (!existsSync(abs)) {
    error(rel, '文件不存在');
    return null;
  }
  try {
    return JSON.parse(readFileSync(abs, 'utf8'));
  } catch (e) {
    error(rel, `JSON 解析失败: ${e.message}`);
    return null;
  }
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isStringArray(v) {
  return Array.isArray(v) && v.every((x) => isNonEmptyString(x));
}

/* ───────────────────────── knowledge ───────────────────────── */

function validateKnowledge(subject) {
  const rel = `${subject}/knowledge.json`;
  const data = readJson(rel);
  if (!data) return null;

  if (!data.subject) error(rel, '缺少 subject 字段');
  if (!Array.isArray(data.chapters) || data.chapters.length === 0) {
    error(rel, 'chapters 必须为非空数组');
    return null;
  }

  const topicIds = new Set();
  const topicNames = new Set();
  let topicCount = 0;

  data.chapters.forEach((ch, ci) => {
    const ctag = `chapters[${ci}]`;
    if (!isNonEmptyString(ch.id)) error(rel, `${ctag}.id 缺失`);
    if (!isNonEmptyString(ch.name)) error(rel, `${ctag}.name 缺失`);
    if (!Array.isArray(ch.topics)) {
      error(rel, `${ctag}.topics 必须为数组`);
      return;
    }
    ch.topics.forEach((tp, ti) => {
      const ttag = `${ctag}.topics[${ti}]`;
      topicCount += 1;
      if (!isNonEmptyString(tp.id)) error(rel, `${ttag}.id 缺失`);
      else if (topicIds.has(tp.id)) error(rel, `${ttag}.id 重复: ${tp.id}`, tp.id);
      else topicIds.add(tp.id);

      if (!isNonEmptyString(tp.name)) error(rel, `${ttag}.name 缺失`);
      else topicNames.add(tp.name.trim());

      for (const field of ['keyPoints', 'commonMistakes']) {
        if (!isStringArray(tp[field]) || tp[field].length === 0) {
          warn(rel, `${ttag}.${field} 为空或非字符串数组`, tp.id);
        }
      }
      if (tp.formulas != null && !isStringArray(tp.formulas)) {
        warn(rel, `${ttag}.formulas 应为字符串数组`, tp.id);
      }
      if (tp.examTips != null && !isStringArray(tp.examTips)) {
        warn(rel, `${ttag}.examTips 应为字符串数组`, tp.id);
      }
    });
  });

  if (!Array.isArray(data.experiments)) warn(rel, 'experiments 缺失或非数组');
  {
    const tp = data.testPapers;
    const okArray = Array.isArray(tp);
    const okObject = tp && typeof tp === 'object' && Object.values(tp).some((v) => Array.isArray(v));
    if (!okArray && !okObject) {
      warn(rel, 'testPapers 缺失或结构无法识别（应为数组或 {level: 题[]}）');
    }
  }

  return { topicIds, topicNames, topicCount, chapters: data.chapters.length };
}

/* ───────────────────────── thesaurus ───────────────────────── */

function validateThesaurus(knowledgeIndex) {
  const rel = 'knowledgePoints-thesaurus.json';
  const data = readJson(rel);
  if (!data || !data.subjects) return;

  for (const subject of SUBJECTS) {
    const kn = knowledgeIndex[subject];
    const th = data.subjects[subject];
    if (!th) {
      warn(rel, `缺少学科 ${subject}`);
      continue;
    }
    // thesaurus 结构: subjects.<subj>.{canonical, aliases} 或 topics 映射
    const entries = th.topics || th.canonical || th;
    if (!entries || typeof entries !== 'object') {
      warn(rel, `${subject} 结构无法识别，跳过对齐`);
      continue;
    }
    if (!kn) continue;

    // 宽松校验: 若存在 name 数组/对象，检查是否覆盖 knowledge topic 名
    const names = Array.isArray(entries)
      ? entries.map((e) => (typeof e === 'string' ? e : e.name)).filter(Boolean)
      : Object.keys(entries);

    if (!names.length) continue;

    let matched = 0;
    for (const name of names) {
      if (kn.topicNames.has(String(name).trim())) matched += 1;
    }
    const ratio = matched / names.length;
    if (ratio < 0.5) {
      warn(rel, `${subject}: 词表与 knowledge topic 名重合率仅 ${(ratio * 100).toFixed(0)}% (${matched}/${names.length})`);
    }
  }
}

/* ───────────────────────── exam bank ───────────────────────── */

const INTERNAL_NOTE_PATTERNS = [
  /修正后/,
  /此处原题/,
  /\bTODO\b/i,
  /\bFIXME\b/i,
  /待改/,
  /待补/,
  /xxx/i,
  /占位/,
  /placeholder/i,
  /原题数据需调整/,
];

const CHOICE_TYPES = ['选择题', '选择', '单选', '多选', 'choice'];

function isChoiceType(t) {
  if (!t) return false;
  return CHOICE_TYPES.some((k) => String(t).includes(k));
}

function validateQuestion(q, subject, index, stats) {
  const id = q.id || `${subject}#${index}`;
  const tag = `exam-bank.${subject}[${index}](${id})`;

  if (!isNonEmptyString(q.id)) error('exam-bank.json', `${tag}: 缺少 id`, id);
  if (!isNonEmptyString(q.question)) error('exam-bank.json', `${tag}: 题干为空`, id);
  if (!isNonEmptyString(q.answer) && !(Array.isArray(q.answer) && q.answer.length)) {
    error('exam-bank.json', `${tag}: answer 缺失`, id);
  }

  const opts = q.options;
  if (opts != null) {
    if (!Array.isArray(opts)) {
      error('exam-bank.json', `${tag}: options 必须为数组`, id);
    } else if (isChoiceType(q.type)) {
      if (opts.length < 2 || opts.length > 6) {
        error('exam-bank.json', `${tag}: 选择题 options 数量异常 (${opts.length})`, id);
      }
      if (isNonEmptyString(q.answer)) {
        const a = q.answer.trim().toUpperCase();
        const letters = opts.map((_, i) => String.fromCharCode(65 + i));
        if (!letters.includes(a) && !/^[0-9]+$/.test(a)) {
          error('exam-bank.json', `${tag}: 选择题答案 "${q.answer}" 不在选项域 ${letters.join('/')}`, id);
        }
        if (/^[0-9]+$/.test(a)) {
          const idx = Number(a);
          if (idx < 0 || idx >= opts.length) {
            error('exam-bank.json', `${tag}: 答案下标 ${a} 越界`, id);
          }
        }
      }
      stats.choice += 1;
    }
  }

  if (q.analysis != null && isNonEmptyString(q.analysis)) {
    for (const re of INTERNAL_NOTE_PATTERNS) {
      if (re.test(q.analysis)) {
        error('exam-bank.json', `${tag}: 解析含内部备注模式 ${re}`, id);
        stats.internalNote += 1;
        break;
      }
    }
  }

  if (q.year != null) {
    const y = Number(q.year);
    if (!Number.isFinite(y) || y < 2000 || y > 2100) {
      warn('exam-bank.json', `${tag}: year 异常 (${q.year})`, id);
    }
  }

  if (q.difficulty != null) {
    const d = String(q.difficulty).toLowerCase();
    const ok = ['easy', 'medium', 'hard', '基础', '中等', '较难', '困难', '1', '2', '3'];
    if (!ok.some((k) => d.includes(k) || d === k)) {
      warn('exam-bank.json', `${tag}: difficulty 非常规值 "${q.difficulty}"`, id);
    }
  }

  if (q.knowledgePoints != null && !Array.isArray(q.knowledgePoints)) {
    warn('exam-bank.json', `${tag}: knowledgePoints 应为数组`, id);
  }

  stats.total += 1;
}

function validateExamBank() {
  const rel = 'exam-bank.json';
  const data = readJson(rel);
  if (!data) return null;

  if (!data.meta) warn(rel, '缺少 meta');
  if (!Array.isArray(data.meta?.subjects)) warn(rel, 'meta.subjects 缺失');

  const stats = { total: 0, choice: 0, internalNote: 0, bySubject: {}, dupIds: 0 };
  let metaClaimed = null;
  const seenIds = new Set();

  // 兼容: exams 数组实为题目列表（现状），或 questions 字段
  for (const subject of SUBJECTS) {
    const node = data[subject];
    if (!node) {
      error(rel, `缺少学科节点 ${subject}`);
      continue;
    }
    const list = node.questions || node.exams || [];
    if (!Array.isArray(list) || list.length === 0) {
      error(rel, `${subject}: 题目列表为空`);
      continue;
    }

    if (node.total != null && Number(node.total) !== list.length) {
      warn(rel, `${subject}: total=${node.total} 与实际条数 ${list.length} 不一致`);
    }

    // 全量结构校验（轻量字段），质检逻辑对全部题跑
    const before = stats.total;
    list.forEach((q, i) => {
      if (q && typeof q === 'object') {
        if (q.id) {
          if (seenIds.has(q.id)) {
            stats.dupIds += 1;
            error(rel, `${subject}[${i}]: 题目 id 重复 ${q.id}`, q.id);
          } else {
            seenIds.add(q.id);
          }
        }
        validateQuestion(q, subject, i, stats);
      } else error(rel, `${subject}[${i}]: 非对象`);
    });
    stats.bySubject[subject] = { count: list.length, sampleChecked: list.length };

    // 抽样再强调一遍完整性质检（与全量相同，SAMPLE_N 仅用于报告摘要）
    void before;
  }

  metaClaimed = data.meta?.totalQuestions;
  if (metaClaimed != null && Number(metaClaimed) !== stats.total) {
    warn(rel, `meta.totalQuestions=${metaClaimed} 与实际统计 ${stats.total} 不一致`);
  }

  // 命名诚实性提示
  const physics = data.physics;
  if (physics && Array.isArray(physics.exams) && !physics.questions) {
    warn(rel, '字段名 exams 实际存放题目列表，建议 schema v2 改为 questions（本脚本已兼容）');
  }

  return stats;
}

/* ───────────────────────── extended banks ───────────────────────── */

const EXTENDED = [
  { file: 'situational.json', listKeys: ['questions', 'items', 'categories'] },
  { file: 'framework-questions.json', listKeys: ['questions'] },
  { file: 'variation-bank.json', listKeys: ['questions', 'items'] },
  { file: 'cross-subject.json', listKeys: ['topics', 'questions', 'items'] },
  { file: 'tech-frontiers.json', listKeys: ['items'] },
  { file: 'answer-templates.json', listKeys: ['subjects'] },
];

function validateExtended() {
  for (const { file, listKeys } of EXTENDED) {
    const abs = join(DATA, file);
    if (!existsSync(abs)) {
      warn(file, '文件不存在，跳过');
      continue;
    }
    let data;
    try {
      data = JSON.parse(readFileSync(abs, 'utf8'));
    } catch (e) {
      error(file, `JSON 解析失败: ${e.message}`);
      continue;
    }
    if (!data || typeof data !== 'object') {
      error(file, '根节点必须为对象');
      continue;
    }
    const found = listKeys.filter((k) => data[k] != null);
    if (!found.length) {
      warn(file, `未找到预期列表字段 ${listKeys.join('/')}`);
    }
  }
}

/* ───────────────────────── SW 清单一致性 ───────────────────────── */

function validateServiceWorkerAssets() {
  const swPath = join(ROOT, '1.2', 'sw.js');
  if (!existsSync(swPath)) {
    warn('sw.js', '不存在');
    return;
  }
  const sw = readFileSync(swPath, 'utf8');
  const assetRe = /['"]([^'"]+\.(?:js|css|json|html))['"]/g;
  const assets = new Set();
  let m;
  while ((m = assetRe.exec(sw))) assets.add(m[1]);

  let missing = 0;
  for (const asset of assets) {
    // 跳过明显非相对路径
    if (asset.startsWith('http') || asset.startsWith('//')) continue;
    const abs = join(ROOT, '1.2', asset);
    if (!existsSync(abs)) {
      error('sw.js', `缓存清单引用不存在的资源: ${asset}`, asset);
      missing += 1;
    }
  }
  // 变式题库 / 词典是否进 DATA_ASSETS
  for (const optional of ['data/variation-bank.json', 'data/knowledgePoints-thesaurus.json']) {
    if (!sw.includes(optional)) {
      warn('sw.js', `离线清单未包含 ${optional}（文档 P2-4）`);
    }
  }
  return { assetCount: assets.size, missing };
}

/* ───────────────────────── HTML 结构冒烟 ───────────────────────── */

function validateSubjectCardsHtml() {
  const htmlPath = join(ROOT, '1.2', 'index.html');
  if (!existsSync(htmlPath)) {
    error('index.html', '不存在');
    return;
  }
  const html = readFileSync(htmlPath, 'utf8');
  const start = html.indexOf('<div class="subject-cards">');
  const end = html.indexOf('<div class="quick-access">');
  if (start < 0 || end < 0 || end <= start) {
    error('index.html', '未找到 subject-cards / quick-access 边界');
    return;
  }
  const block = html.slice(start, end);
  let depth = 0;
  let cardsAtDepth1 = 0;
  const voidTags = new Set();
  // 简化: 只数 div 开闭
  const re = /<\/?div\b/g;
  let mm;
  while ((mm = re.exec(block))) {
    if (mm[0].startsWith('</')) {
      depth -= 1;
      if (depth < 0) {
        error('index.html', 'subject-cards 区块出现多余 </div>');
        depth = 0;
      }
    } else {
      if (depth === 1) {
        const snippet = block.slice(mm.index, mm.index + 40);
        if (snippet.includes('subject-card') && !snippet.includes('subject-cards')) {
          cardsAtDepth1 += 1;
        }
      }
      depth += 1;
    }
  }
  if (depth !== 0) {
    error('index.html', `subject-cards 区块 div 未闭合 (残留 depth=${depth})`);
  }
  if (cardsAtDepth1 !== 6) {
    error('index.html', `期望 6 个平级 subject-card，实际 depth=1 处有 ${cardsAtDepth1} 个`);
  }
  void voidTags;
}

/* ───────────────────────── main ───────────────────────── */

function main() {
  const knowledgeIndex = {};
  for (const s of SUBJECTS) {
    knowledgeIndex[s] = validateKnowledge(s);
  }

  validateThesaurus(knowledgeIndex);
  const examStats = validateExamBank();
  validateExtended();
  const swStats = validateServiceWorkerAssets();
  validateSubjectCardsHtml();

  const errors = findings.filter((f) => f.level === 'error');
  const warns = findings.filter((f) => f.level === 'warn');

  // 抽样摘要（质检实际已全量跑，这里展示 sample 规模说明）
  const sampleNote = examStats
    ? `题库结构校验: 全量 ${examStats.total} 题 (选择题 ${examStats.choice}); 内部备注命中 ${examStats.internalNote}`
    : '题库未加载';

  if (asJson) {
    console.log(JSON.stringify({
      ok: errors.length === 0,
      errorCount: errors.length,
      warnCount: warns.length,
      examStats,
      swStats,
      knowledge: Object.fromEntries(
        Object.entries(knowledgeIndex).map(([k, v]) => [k, v && { topics: v.topicCount, chapters: v.chapters }])
      ),
      findings,
    }, null, 2));
  } else {
    console.log('=== HSPCB 数据校验 ===');
    console.log(`数据目录: ${DATA}`);
    console.log('');
    console.log('— 知识点 —');
    for (const s of SUBJECTS) {
      const kn = knowledgeIndex[s];
      if (kn) console.log(`  ${SUBJECT_LABEL[s]}: ${kn.chapters} 章 / ${kn.topicCount} topics`);
      else console.log(`  ${SUBJECT_LABEL[s]}: 加载失败`);
    }
    console.log('');
    console.log('— 题库 —');
    console.log(`  ${sampleNote}`);
    if (examStats?.bySubject) {
      for (const [s, v] of Object.entries(examStats.bySubject)) {
        console.log(`  ${SUBJECT_LABEL[s]}: ${v.count} 题`);
      }
    }
    console.log('');
    console.log('— SW —');
    if (swStats) console.log(`  清单资源 ${swStats.assetCount} 个, 缺失 ${swStats.missing}`);
    console.log('');
    if (errors.length) {
      console.log(`— ERRORS (${errors.length}) —`);
      for (const e of errors.slice(0, 80)) {
        console.log(`  [E] ${e.file}${e.id ? ` (${e.id})` : ''}: ${e.msg}`);
      }
      if (errors.length > 80) console.log(`  ... 另有 ${errors.length - 80} 条`);
      console.log('');
    }
    if (warns.length) {
      console.log(`— WARNINGS (${warns.length}) —`);
      for (const w of warns.slice(0, 40)) {
        console.log(`  [W] ${w.file}${w.id ? ` (${w.id})` : ''}: ${w.msg}`);
      }
      if (warns.length > 40) console.log(`  ... 另有 ${warns.length - 40} 条`);
      console.log('');
    }
    console.log(errors.length === 0
      ? `结果: PASS (${warns.length} warnings)`
      : `结果: FAIL (${errors.length} errors, ${warns.length} warnings)`);
    void SAMPLE_N;
  }

  process.exit(errors.length === 0 ? 0 : 1);
}

main();
