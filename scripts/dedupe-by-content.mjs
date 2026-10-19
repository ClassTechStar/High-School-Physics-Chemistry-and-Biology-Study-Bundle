#!/usr/bin/env node
/**
 * dedupe-by-content.mjs — P0-4 题库内容去重
 *
 * 背景：
 *   exam-bank.json 名义 1718 题，但存在大量**同一道题的副本**。经实测：
 *     - 按「学科+题干」分组        → 1163 唯一 / 555 冗余
 *     - 按「学科+题干+选项集」分组 → 1292 唯一 / 426 冗余
 *   两者相差 129 道题，是「同题干、不同选项编排」的**独立题目**，
 *   说明**不能只按题干去重**，否则会误删合法题目。
 *
 *   更重要的一处：英语语法填空/短文改错题的 `question` 字段是**完全相同的模板句**
 *   （"Fill in the blank with the correct form of the verb in brackets."），
 *   真正的题目内容在 `passage` 字段里。若 key 不含 passage，这 5 道不同的题
 *   会被误判为重复，进而误删 4 道。
 *
 * 去重口径（key）：学科 + 规范化题干 + 规范化选项集 + 规范化材料（passage）
 * 保留策略：组内按「解析质量分」降序取第一；同分取出现更早的。
 * 副本去向：归档到 1.2/data/_archive/duplicates-<date>.json（归档而非删除，可追溯回滚）
 *
 * 用法：
 *   node scripts/dedupe-by-content.mjs            # dry-run，只报告不改文件
 *   node scripts/dedupe-by-content.mjs --apply    # 实际写入
 *   node scripts/dedupe-by-content.mjs --apply --keep-newest   # 保留策略反转
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BANK = join(ROOT, '1.2', 'data', 'exam-bank.json');
const ARCHIVE_DIR = join(ROOT, '1.2', 'data', '_archive');

const SUBJECTS = ['physics', 'chemistry', 'biology', 'math', 'chinese', 'english'];

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const KEEP_NEWEST = argv.includes('--keep-newest');

/** 规范化：去空白与常见标点，消除肉眼等价但字节不同的差异 */
function norm(s) {
    return String(s == null ? '' : s)
        .replace(/\s+/g, '')
        .replace(/[，。；：？！、""''（）()·,.;:?!]/g, '')
        .trim();
}

/** 生成去重键：必须含 passage，否则英语模板题干会被误判为重复 */
function dedupeKey(subject, q) {
    const opts = Array.isArray(q.options)
        ? q.options.map((o) => norm(o)).join('|')
        : '';
    return [subject, norm(q.question), opts, norm(q.passage)].join('§§');
}

/**
 * 解析质量评分 —— 决定组内保留哪一份。
 * 越高越好：有考点、解析长、非模板、有年份。
 */
const TEMPLATE_HINTS = [
    '相关知识点涉及',
    '本题考查',
    '需准确理解其',
    '的基本原理可判断',
    '为正确选项。',
];

function qualityScore(q) {
    let score = 0;
    const analysis = String(q.analysis || '');
    const kp = Array.isArray(q.knowledgePoints) ? q.knowledgePoints : [];

    // 解析长度（封顶，避免长篇灌水压倒其他信号）
    score += Math.min(analysis.length, 220) / 10;

    // 有考点
    if (kp.length > 0) score += 15;

    // 模板化解析扣分
    for (const h of TEMPLATE_HINTS) if (analysis.includes(h)) score -= 12;

    // 题干复述扣分（"分析：{题干}。" 形态）
    if (/^分析[:：]/.test(analysis)) score -= 20;

    // 有年份
    if (q.year) score += 5;

    return score;
}

function main() {
    if (!existsSync(BANK)) {
        console.error('找不到题库:', BANK);
        process.exit(1);
    }

    const raw = readFileSync(BANK, 'utf8');
    const data = JSON.parse(raw);
    const shaBefore = createHash('sha256').update(raw).digest('hex').slice(0, 12);

    // ---- 1. 收集所有题目（保留顺序与来源学科）
    const flat = [];
    for (const subject of SUBJECTS) {
        const list = (data[subject] && data[subject].questions) || [];
        list.forEach((q, idx) => flat.push({ subject, idx, q }));
    }
    const totalBefore = flat.length;

    // ---- 2. 分组
    const groups = new Map();
    for (const item of flat) {
        const key = dedupeKey(item.subject, item.q);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
    }

    // ---- 3. 组内裁决
    const keep = new Set();
    const dups = [];
    const perSubjectDup = {};
    const perSubjectKeep = {};

    for (const [, arr] of groups) {
        if (arr.length === 1) {
            keep.add(arr[0]);
            continue;
        }
        // 排序：质量分降序，同分按原序（KEEP_NEWEST 时反转原序）
        const ranked = arr.slice().sort((a, b) => {
            const sa = qualityScore(a.q);
            const sb = qualityScore(b.q);
            if (sb !== sa) return sb - sa;
            const ord = KEEP_NEWEST ? -1 : 1;
            return ord * (a.idx - b.idx);
        });
        keep.add(ranked[0]);
        for (let i = 1; i < ranked.length; i++) dups.push(ranked[i]);
    }

    for (const item of keep) perSubjectKeep[item.subject] = (perSubjectKeep[item.subject] || 0) + 1;
    for (const item of dups) perSubjectDup[item.subject] = (perSubjectDup[item.subject] || 0) + 1;

    // ---- 4. 报告
    console.log('=== P0-4 题库内容去重 ===');
    console.log(`模式: ${APPLY ? 'APPLY（会写文件）' : 'dry-run（只读）'}`);
    console.log(`题库: ${BANK}`);
    console.log(`sha256(前12位): ${shaBefore}\n`);
    console.log(`原有题量: ${totalBefore}`);
    console.log(`唯一题量: ${keep.size}`);
    console.log(`冗余副本: ${dups.length}（将归档，非删除）\n`);
    console.log('  学科        保留   冗余');
    for (const subject of SUBJECTS) {
        const k = perSubjectKeep[subject] || 0;
        const d = perSubjectDup[subject] || 0;
        console.log(`  ${subject.padEnd(10)} ${String(k).padStart(5)} ${String(d).padStart(5)}`);
    }

    if (dups.length === 0) {
        console.log('\n✓ 无重复题，无需处理');
        process.exit(0);
    }

    // 样例展示
    const byKey = new Map();
    for (const item of flat) {
        const key = dedupeKey(item.subject, item.q);
        if (!byKey.has(key)) byKey.set(key, []);
        byKey.get(key).push(item);
    }
    let shown = 0;
    console.log('\n  重复样例（前 5 组）:');
    for (const [, arr] of byKey) {
        if (arr.length < 2 || shown >= 5) continue;
        shown++;
        console.log(`    题干「${String(arr[0].q.question).slice(0, 34)}…」共 ${arr.length} 份:`);
        arr.forEach((x) => {
            console.log(`      - ${x.q.id} (y=${x.q.year}, pts=${x.q.points}, 解析${String(x.q.analysis || '').length}字)`);
        });
    }

    if (!APPLY) {
        console.log('\n[dry-run] 未写入任何文件。确认无误后加 --apply 执行。');
        process.exit(0);
    }

    // ---- 5. 写回：按原学科分组，保持原有顺序
    const keptBySubject = {};
    for (const subject of SUBJECTS) keptBySubject[subject] = [];
    for (const item of flat) if (keep.has(item)) keptBySubject[item.subject].push(item.q);

    for (const subject of SUBJECTS) {
        if (!data[subject]) continue;
        data[subject].questions = keptBySubject[subject];
        const declared = data[subject].total;
        if (declared !== keptBySubject[subject].length) {
            console.log(`  [fix] ${subject}.total: ${declared} → ${keptBySubject[subject].length}`);
            data[subject].total = keptBySubject[subject].length;
        }
    }
    const totalAfter = SUBJECTS.reduce((a, s) => a + keptBySubject[s].length, 0);
    if (data.meta) {
        if (data.meta.totalQuestions !== totalAfter) {
            console.log(`  [fix] meta.totalQuestions: ${data.meta.totalQuestions} → ${totalAfter}`);
            data.meta.totalQuestions = totalAfter;
        }
        data.meta.dedupedAt = new Date().toISOString().slice(0, 10);
        data.meta.duplicatesArchived = dups.length;
    }

    writeFileSync(BANK, JSON.stringify(data, null, 2), 'utf8');

    // ---- 6. 归档副本
    if (!existsSync(ARCHIVE_DIR)) mkdirSync(ARCHIVE_DIR, { recursive: true });
    const stamp = new Date().toISOString().slice(0, 10);
    const archFile = join(ARCHIVE_DIR, `duplicates-${stamp}.json`);
    writeFileSync(archFile, JSON.stringify({
        meta: {
            createdAt: new Date().toISOString(),
            source: '1.2/data/exam-bank.json',
            sourceSha256Prefix: shaBefore,
            count: dups.length,
            note: '以下为按「学科+题干+选项集+材料」判定为完全重复的副本，已从主题库移出并归档'
        },
        duplicates: dups.map((x) => ({ subject: x.subject, originalIndex: x.idx, question: x.q }))
    }, null, 2), 'utf8');

    console.log(`\n✓ 已写入 ${BANK}`);
    console.log(`✓ 副本已归档至 ${archFile}`);
    console.log(`  题量: ${totalBefore} → ${totalAfter}`);
}

main();
