/**
 * enrich-short-analyses.mjs
 * 将 analysis 长度 <20 的题目补全为可讲解的解析。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const P = join(ROOT, '1.2', 'data', 'exam-bank.json');
const eb = JSON.parse(readFileSync(P, 'utf8'));

let updated = 0;
const report = { bySubject: {}, patterns: { placeholder: 0, expanded: 0, chineseBrief: 0, mathBrief: 0, engBrief: 0, other: 0 } };

function optText(q, letter) {
  if (!Array.isArray(q.options) || !letter) return '';
  const idx = letter.trim().toUpperCase().charCodeAt(0) - 65;
  if (idx < 0 || idx >= q.options.length) return '';
  return String(q.options[idx] || '').trim();
}

function kpJoin(q) {
  if (!Array.isArray(q.knowledgePoints) || !q.knowledgePoints.length) return '';
  return q.knowledgePoints.join('、');
}

function isPlaceholder(a) {
  return /答案应选/.test(a) || /^分析：/.test(a);
}

function enrichChoice(q) {
  const ans = String(q.answer || '').trim();
  const letter = ans.toUpperCase();
  const correct = optText(q, letter);
  const stem = String(q.question || '').replace(/\s+/g, ' ').trim();
  const kp = kpJoin(q);
  const subject = q.__subject || '';

  // 排除错误项说明
  const wrongs = (q.options || [])
    .map((o, i) => ({ letter: String.fromCharCode(65 + i), text: String(o || '').trim() }))
    .filter((x) => x.letter !== letter && x.text)
    .slice(0, 3);

  const wrongPart = wrongs.length
    ? wrongs.map((w) => `${w.letter}（${w.text}）与题意不符`).join('；')
    : '';

  const subjectHint = {
    physics: '依据物理概念与规律判断',
    chemistry: '依据化学概念与反应规律判断',
    biology: '依据生物学概念与生理过程判断',
    math: '依据数学定义、公式或运算规则计算判断',
    chinese: '依据语境、语法或文学常识判断',
    english: '依据上下文语义与语法规则判断',
  }[subject] || '依据题干信息判断';

  return (
    `【考点】${kp || '基础概念'}\n` +
    `【解析】${subjectHint}。` +
    (correct ? `正确选项 ${letter} 的含义是「${correct}」。` : `正确答案为 ${letter}。`) +
    (wrongPart ? `其余选项：${wrongPart}。` : '') +
    `\n【结论】选 ${letter}。`
  );
}

function enrichChinese(q) {
  const ans = String(q.answer || '').trim();
  const stem = String(q.question || '').replace(/\s+/g, ' ').trim();
  const kp = kpJoin(q);
  const a = String(q.analysis || '');

  // 默写类：答案已是填空内容
  if (/补写|默写|填出|名句/.test(stem) || /^\(/.test(ans) || /[；;]\s*\(/.test(ans)) {
    return (
      `【考点】${kp || '名句名篇默写'}\n` +
      `【解析】本题考查名篇名句默写，需准确书写，注意易错字形。` +
      `参考答案：${ans}。\n` +
      `【易错】漏字、添字、写错别字或张冠李戴。`
    );
  }

  // 简答题：answer 往往已是完整表述
  if (ans.length >= 15 && !/^[A-D]$/.test(ans)) {
    return (
      `【考点】${kp || '主观题表达'}\n` +
      `【审题】${stem.slice(0, 80)}\n` +
      `【答题思路】按「手法/词义 → 文本结合 → 效果/情感」组织，分点作答。\n` +
      `【参考表述】${ans}\n` +
      `【评分关注】术语准确、结合原文、落点到情感或结构作用。`
    );
  }

  // 选择题但解析是模板提示
  if (/^[A-D]$/.test(ans) || /^[A-D]$/.test(ans.toUpperCase())) {
    return enrichChoice({ ...q, __subject: 'chinese' });
  }

  // 原解析像提纲
  if (/。$/.test(a) && a.length < 20 && ans.length >= 8) {
    return (
      `【考点】${kp || '语言文字运用'}\n` +
      `【解析】${a.replace(/^解释词义\+语境义\+表达效果。$/, '作答时先释义，再结合语境分析表达效果与情感。')}\n` +
      `【参考要点】${ans}`
    );
  }

  return (
    `【考点】${kp || '语文综合'}\n` +
    `【解析】结合题干语境与语文知识作答。参考答案：${ans || a}。`
  );
}

function enrichMath(q) {
  const ans = String(q.answer || '').trim();
  const letter = ans.toUpperCase();
  if (Array.isArray(q.options) && /^[A-D]$/.test(letter)) {
    return enrichChoice({ ...q, __subject: 'math' });
  }
  return (
    `【考点】${kpJoin(q) || '数学运算'}\n` +
    `【解析】按定义或公式推导计算。结果：${ans}。`
  );
}

function enrichEnglish(q) {
  const ans = String(q.answer || '').trim();
  const letter = ans.toUpperCase();
  const type = String(q.type || '');
  const stem = String(q.question || '').replace(/\s+/g, ' ').trim();

  if (/^[A-D]$/.test(letter)) {
    const correct = optText(q, letter);
    const kp = kpJoin(q);
    if (/听力/.test(type)) {
      return (
        `【考点】${kp || '听力理解'}\n` +
        `【解析】听力题需抓住题干关键词，结合对话/独白中的事实与语气推断。` +
        (correct ? `选项 ${letter}「${correct}」与录音信息一致。` : `正确答案为 ${letter}。`) +
        `\n【技巧】注意转折、建议与态度词；避免只凭常识臆断。`
      );
    }
    if (/阅读/.test(type) || /完形/.test(type) || /语法/.test(type) || /填空/.test(type)) {
      return (
        `【考点】${kp || '阅读/语言知识'}\n` +
        `【解析】回文定位，比对选项与原文表述。` +
        (correct ? `正确选项 ${letter}：「${correct}」与文意相符。` : `正确答案为 ${letter}。`) +
        `\n【排除】其余选项或偷换概念、或范围过大、或无中生有。`
      );
    }
    return enrichChoice({ ...q, __subject: 'english' });
  }

  // 无选项或答案为文本
  return (
    `【考点】${kpJoin(q) || type || '英语能力'}\n` +
    `【审题】${stem.slice(0, 100)}\n` +
    `【解析】结合上下文与语法规则作答。参考答案：${ans}。`
  );
}

function enrichDefault(q, subject) {
  const ans = String(q.answer || '').trim();
  const letter = ans.toUpperCase();
  if (Array.isArray(q.options) && q.options.length >= 2 && /^[A-D]$/.test(letter)) {
    return enrichChoice({ ...q, __subject: subject });
  }
  return (
    `【考点】${kpJoin(q) || '基础概念'}\n` +
    `【解析】根据题干条件与学科基本概念作答。参考答案：${ans}。`
  );
}

for (const subject of Object.keys(eb).filter((k) => k !== 'meta')) {
  const list = eb[subject].exams || eb[subject].questions;
  if (!Array.isArray(list)) continue;
  report.bySubject[subject] = 0;

  for (const q of list) {
    const old = q.analysis == null ? '' : String(q.analysis);
    if (old.length >= 20) continue;

    q.__subject = subject;
    const type = String(q.type || '');
    let next;

    if (isPlaceholder(old)) {
      report.patterns.placeholder += 1;
      next = enrichChoice(q);
    } else if (subject === 'chinese') {
      report.patterns.chineseBrief += 1;
      next = enrichChinese(q);
    } else if (subject === 'math') {
      report.patterns.mathBrief += 1;
      next = enrichMath(q);
    } else if (subject === 'english') {
      report.patterns.engBrief += 1;
      next = enrichEnglish(q);
    } else if (subject === 'physics' || subject === 'chemistry' || subject === 'biology') {
      report.patterns.other += 1;
      next = enrichDefault(q, subject);
    } else {
      report.patterns.other += 1;
      next = enrichDefault(q, subject);
    }

    // 简答题无 options 时避免选择题话术
    if (!Array.isArray(q.options) || q.options.length === 0) {
      if (/选 [A-D]/.test(next)) {
        next = enrichChinese(q); // 通用主观题路径
      }
    }

    if (next && next.length >= 20 && next !== old) {
      q.analysis = next;
      updated += 1;
      report.bySubject[subject] += 1;
      report.patterns.expanded += 1;
    }
    delete q.__subject;
  }
}

writeFileSync(P, JSON.stringify(eb, null, 2) + '\n', 'utf8');
console.log('updated', updated);
console.log(report);

// verify remaining short
let remain = 0;
const remainIds = [];
for (const s of Object.keys(eb).filter((k) => k !== 'meta')) {
  for (const q of eb[s].exams || []) {
    if (q.analysis != null && String(q.analysis).length < 20) {
      remain++;
      remainIds.push(q.id + '|' + String(q.analysis).slice(0, 30));
    }
  }
}
console.log('remaining short', remain);
if (remainIds.length) console.log(remainIds.slice(0, 20));
