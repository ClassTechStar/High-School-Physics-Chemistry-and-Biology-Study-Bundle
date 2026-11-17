#!/usr/bin/env node
/**
 * fix-answer-analysis-mismatch.mjs — 修复「解析中声明的答案字母」与 q.answer 不一致
 *
 * 背景（v1.3 回归）：
 * 提交 ee3b550 (T8 答案分布均衡化) 把正确选项「内容」在 A/B/C/D 之间整体互换，
 * 并同步修改了 q.answer，但**没有同步修改 analysis 里以自然语言写死的字母**
 * （如 "故 a = 3 m/s²，t = 6 s，选 A。" / "正确答案为A"）。
 * 结果：1718 题中有 161 题的学生端呈现自相矛盾 —— 判卷按 q.answer，
 * 解析却指向另一个字母。
 *
 * 修复原理：
 * 用 git 取回「换位前」的 exam-bank.json（默认 816bf4c，即 T8 之前），
 * 对每道题建立 旧字母 → 旧选项内容 → 新字母 的映射，
 * 把 analysis 里的旧字母引用替换为新字母；
 * 若映射结果与 q.answer 不一致（说明数据被多次改动过），则跳过并列入人工复核清单。
 *
 * 用法：
 * node scripts/fix-answer-analysis-mismatch.mjs # dry-run，只报告
 * node scripts/fix-answer-analysis-mismatch.mjs --apply # 写回 exam-bank.json
 * node scripts/fix-answer-analysis-mismatch.mjs --base 816bf4c
 * node scripts/fix-answer-analysis-mismatch.mjs --report out.json
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BANK = join(ROOT, '1.2/data/exam-bank.json');
const SUBJECTS = ['physics', 'chemistry', 'biology', 'math', 'chinese', 'english'];

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const baseIdx = argv.indexOf('--base');
const BASE_COMMIT = baseIdx >= 0 ? (argv[baseIdx + 1] || '816bf4c') : '816bf4c';
const reportIdx = argv.indexOf('--report');
const REPORT = reportIdx >= 0 ? argv[reportIdx + 1] : null;

/** 解析中显式引用答案字母的写法 */
const LETTER_REF =
  /(故?选(?:正确(?:选项|答案))?|答案(?:是|为)?|正确选项(?:是|为)?|应选)\s*[:：]?\s*([A-D])\b/gi;

function loadBank(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * 人工复核后的答案键订正表。
 * 这些题不是 T8 换位回归，而是换位之前就存在的「答案键本身错误」——
 * 解析正文已推导出正确结论，但 answer 字段未同步。
 * 每条都必须写明推导依据，便于复核。
 */
const MANUAL_OVERRIDES = {
  // X~B(10,0.4): E(X)=np=4, D(X)=np(1-p)=2.4, E+D=6.4 → 选项 B(6.4)
  // 原 answer='D'(2.4) 只给了 D(X)，漏加 E(X)。解析正文已自行指出该矛盾。
  'math/MATH_2025_15': { answer: 'B', reason: 'E(X)+D(X)=4+2.4=6.4，对应选项 B；原键 D(2.4) 漏加 E(X)' },
};

function loadBankAtCommit(commit) {
  try {
    const out = execFileSync('git', ['-C', ROOT, 'show', `${commit}:1.2/data/exam-bank.json`], {
      maxBuffer: 64 * 1024 * 1024,
    });
    return JSON.parse(out.toString('utf8'));
  } catch (e) {
    console.error(`无法从 git 读取 ${commit} 的 exam-bank.json: ${e.message}`);
    process.exit(2);
  }
}

const cur = loadBank(BANK);
const old = loadBankAtCommit(BASE_COMMIT);

/** 保留原文件的行尾风格（本仓库统一 CRLF；core.autocrlf=true 时 Git 会按 CRLF 检出） */
const EOL = (() => {
  const raw = readFileSync(BANK, 'utf8');
  const crlf = (raw.match(/\r\n/g) || []).length;
  const lf = (raw.match(/\n/g) || []).length;
  return crlf > lf / 2 ? '\r\n' : '\n';
})();

console.log(`基准提交(换位前): ${BASE_COMMIT}`);
console.log(`当前题库: ${BANK}`);
console.log(`行尾风格: ${EOL === '\r\n' ? 'CRLF' : 'LF'}\n`);

let fixed = 0;
let skipped = 0;
let alreadyOk = 0;
const bySubject = {};
const manualReview = [];
const changes = [];

for (const subj of SUBJECTS) {
  const curList = cur[subj]?.questions || cur[subj]?.exams;
  const oldList = old[subj]?.questions || old[subj]?.exams;
  if (!Array.isArray(curList)) continue;
  bySubject[subj] = { fixed: 0, manual: 0 };
  const oldById = new Map();
  if (Array.isArray(oldList)) for (const q of oldList) if (q && q.id) oldById.set(q.id, q);

  for (const q of curList) {
    if (!q || typeof q !== 'object') continue;
    const ans = String(q.answer || '').trim().toUpperCase();
    if (!/^[A-D]$/.test(ans)) continue;
    const analysis = String(q.analysis || '');
    if (!analysis) continue;

    // 解析里引用了哪些字母
    LETTER_REF.lastIndex = 0;
    const refs = [...analysis.matchAll(LETTER_REF)].map((m) => ({
      full: m[0],
      letter: m[2].toUpperCase(),
      start: m.index,
      end: m.index + m[0].length,
    }));
    if (!refs.length) continue;

    const wrong = refs.filter((r) => r.letter !== ans);
    if (!wrong.length) { alreadyOk++; continue; }

    // 需要旧布局来把「旧字母」映射到「新字母」
    const oq = oldById.get(q.id);
    const oldOpts = oq && Array.isArray(oq.options) ? oq.options : null;
    const curOpts = Array.isArray(q.options) ? q.options : null;
    if (!oldOpts || !curOpts) {
      skipped++;
      bySubject[subj].manual++;
      manualReview.push({ subject: subj, id: q.id, reason: '缺少旧布局或当前 options', analysis: analysis.slice(0, 120) });
      continue;
    }

    // 建立 旧字母 → 旧内容 → 新字母
    const oldLetterOfContent = new Map();
    oldOpts.forEach((o, i) => oldLetterOfContent.set(String(o), String.fromCharCode(65 + i)));
    const newLetterOfContent = new Map();
    curOpts.forEach((o, i) => newLetterOfContent.set(String(o), String.fromCharCode(65 + i)));

    // 收集需要重写的 (旧字母 → 新字母)
    const remap = new Map();
    for (const r of wrong) {
      const content = oldOpts[r.letter.charCodeAt(0) - 65];
      if (content == null) continue;
      const newLetter = newLetterOfContent.get(String(content));
      if (newLetter) remap.set(r.letter, newLetter);
    }

    // 校验：映射出的新字母必须等于 q.answer
    const targets = [...remap.values()];
    if (!targets.length || !targets.every((t) => t === ans)) {
      // 命中人工订正表：答案键本身错误，解析正文才是对的
      const key = `${subj}/${q.id}`;
      const ov = MANUAL_OVERRIDES[key];
      if (ov) {
        const from = q.answer;
        q.answer = ov.answer;
        let outText = analysis;
        const ordered2 = [...refs].sort((a, b) => b.start - a.start);
        for (const r of ordered2) {
          if (r.letter === ans) continue;
          outText = outText.slice(0, r.start) + r.full.replace(/([A-D])\s*$/, ov.answer) + outText.slice(r.end);
        }
        q.analysis = outText;
        changes.push({ subject: subj, id: q.id, from: `answer ${from}→${ov.answer}｜${analysis.slice(-55)}`, to: `${ov.answer}｜${outText.slice(-55)}` });
        fixed++;
        bySubject[subj].fixed++;
        continue;
      }
      skipped++;
      bySubject[subj].manual++;
      manualReview.push({
        subject: subj, id: q.id,
        reason: `映射结果 ${targets.join('/') || '(无)'} 与 answer=${ans} 不一致`,
        analysis: analysis.slice(0, 120),
      });
      continue;
    }

    // 执行替换：从后往前替换，避免偏移错乱
    let outText = analysis;
    const ordered = [...refs].sort((a, b) => b.start - a.start);
    for (const r of ordered) {
      const target = remap.get(r.letter);
      if (!target) continue;
      outText = outText.slice(0, r.start) + r.full.replace(/([A-D])\s*$/, target) + outText.slice(r.end);
    }
    if (outText !== analysis) {
      changes.push({ subject: subj, id: q.id, from: analysis.slice(-70), to: outText.slice(-70) });
      q.analysis = outText;
      fixed++;
      bySubject[subj].fixed++;
    }
  }
}

console.log('=== 处理结果 ===');
console.log(`  已修复（解析字母重映射）: ${fixed}`);
console.log(`  解析字母与 answer 本就一致: ${alreadyOk}`);
console.log(`  需人工复核: ${manualReview.length}`);
for (const [s, v] of Object.entries(bySubject)) {
  console.log(`    ${s}: 修复 ${v.fixed}, 人工复核 ${v.manual}`);
}
if (changes.length) {
  console.log('\n=== 变更样例 ===');
  for (const c of changes.slice(0, 8)) {
    console.log(`  [${c.subject}/${c.id}]`);
    console.log(`    前: ...${c.from.replace(/\n/g, ' ⏎ ')}`);
    console.log(`    后: ...${c.to.replace(/\n/g, ' ⏎ ')}`);
  }
}
if (manualReview.length) {
  console.log('\n=== 人工复核清单 ===');
  for (const m of manualReview.slice(0, 30)) {
    console.log(`  [${m.subject}/${m.id}] ${m.reason}`);
  }
  if (manualReview.length > 30) console.log(`  ... 另有 ${manualReview.length - 30} 条`);
}

if (REPORT) {
  writeFileSync(REPORT, JSON.stringify({ fixed, manualReview, changes }, null, 2), 'utf8');
  console.log(`\n报告已写入: ${REPORT}`);
}

if (APPLY) {
  writeFileSync(BANK, JSON.stringify(cur, null, 2).replace(/\n/g, EOL) + EOL, 'utf8');
  console.log(`\n已写回 ${BANK}（修复 ${fixed} 题）`);
} else {
  console.log('\n(dry-run，未写入。加 --apply 生效)');
}
process.exit(0);
