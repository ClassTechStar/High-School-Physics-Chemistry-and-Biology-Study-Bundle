#!/usr/bin/env node
/**
 * balance-answers.mjs — T1-3 / P0-2 选择题答案分布均衡化
 *
 * 原理：某字母占比过高时，把正确选项的内容与低频槽位的选项内容整体互换。
 *       选项内容集合不变、仅位置变化，正确性不变，答案字母随之改变。
 *
 * 相对初版的三处关键修正：
 *   1. 配额按**学科分桶**（target = round(该科可换位题数/4)），不再全库统一。
 *      全库口径会掩盖单科内部偏斜（实测英语 B 占 45.2%，而全库看似均衡）。
 *   2. 收紧「位置引用词」正则。初版把 `以上`（"综上所述"）`ABCD点号` 等
 *      中文高频写法也算作位置依赖，把可换位题量从 1053 误砍到 127。
 *   3. 换位时**同步改写解析中的字母引用**（"正确答案为D"→"正确答案为A"、
 *      "A错…B对" 跟着映射走），换位后重跑一致性校验。
 *      —— DEV-PLAN 要求：换位 = 内容正确性风险，必须有冲突规则兜底。
 *
 * 不参与换位的题（保守跳过）：
 *   - 选项不是恰好 4 个非空互异字符串，或答案不是单字母 A-D
 *   - 任一选项文本含位置引用（"以上都不对" / "all of the above" / …）
 *   - 解析中出现无法安全归类的字母（如 "A球" "B点"，属物理实体而非选项）
 *
 * 用法：
 *   node scripts/balance-answers.mjs              # dry-run，只报告
 *   node scripts/balance-answers.mjs --apply      # 实际写入
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const APPLY = process.argv.includes('--apply');
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BANK = resolve(ROOT, '1.2/data/exam-bank.json');

const SUBJECTS = ['physics', 'chemistry', 'biology', 'math', 'chinese', 'english'];

/**
 * 位置引用：选项内容依赖自身所处位置，换位即错。
 * 必须是"组合式"表述，单独的「以上」「上述」不算（"综上所述"太常见）。
 */
const POSITION_REF = new RegExp([
    '(?:以上|上述|下列|选项中)[^。；]{0,8}(?:都|均|全)(?:不)?(?:正确|对|符合|错误|不对)?',
    '(?:都|均|全)(?:不)?(?:正确|对|符合|错误|不对)',
    '同(?:上|左|右)',
    'all\\s+of\\s+the\\s+above',
    'none\\s+of\\s+the\\s+above',
    'both\\s+A\\s+and\\s+B',
    'either\\s+A\\s+or\\s+B',
    'all\\s+above',
].join('|'), 'i');

/** 选项字母引用：解析中指向某个选项位置，换位时必须同步重写 */
const OPTION_LETTER_REF = /(?:^|[^A-Za-z0-9])([A-D])(?=\s*(?:错|对|正确|错误|符合|不符合|项|选项|是|为))/gi;
const ANSWER_DECL = /((?:正确答案|答案|应选|选择|选)\s*[为是]?\s*[（(]?\s*)([A-D])(?![A-Za-z0-9一-龥])/gi;

/** 歧义模式：字母作为物理实体/变量名出现，不可安全改写 */
const AMBIGUOUS = /[（(]?[A-D][）)]?\s*(?:球|板|管|点|处|端|物|球|棒|线|极|面|环|球)/;

function isEligible(q) {
    if (typeof q.answer !== 'string' || !/^[A-D]$/.test(q.answer)) return false;
    if (!Array.isArray(q.options) || q.options.length !== 4) return false;
    if (!q.options.every((o) => typeof o === 'string' && o.length > 0)) return false;
    if (new Set(q.options).size !== 4) return false;
    // 选项文本本身含位置引用 → 换位后语义错乱
    if (q.options.some((o) => POSITION_REF.test(o))) return false;
    // 解析里出现无法安全归类的字母 → 保守跳过
    if (AMBIGUOUS.test(String(q.analysis || ''))) return false;
    return true;
}

/** 把解析中旧的选项字母引用重写为新字母 */
function rewriteAnalysisLetters(analysis, map) {
    if (!analysis) return analysis;
    let out = String(analysis);
    // 1) 答案声明（"正确答案为D"）优先处理，避免被后续规则二次改写
    out = out.replace(ANSWER_DECL, (m, prefix, letter) => {
        const up = letter.toUpperCase();
        return prefix + (map[up] || up);
    });
    // 2) 其余选项字母引用（X错 / X项 / X对 …）
    out = out.replace(OPTION_LETTER_REF, (m, letter) => {
        const up = letter.toUpperCase();
        return m.replace(letter, map[up] || up);
    });
    return out;
}

/** 换位：把正确项从索引 i 移到索引 j，同步更新 answer 与解析引用 */
function moveCorrectOption(q, newLetter) {
    const i = q.answer.charCodeAt(0) - 65;
    const j = newLetter.charCodeAt(0) - 65;
    if (i === j) return false;

    const content = q.options[i];
    q.options[i] = q.options[j];
    q.options[j] = content;

    // 位置互换只影响 i 与 j 两个字母，其余不变
    const map = {};
    map[String.fromCharCode(65 + i)] = String.fromCharCode(65 + j);
    map[String.fromCharCode(65 + j)] = String.fromCharCode(65 + i);
    const newAnalysis = rewriteAnalysisLetters(q.analysis, map);

    q.answer = newLetter;
    q.analysis = newAnalysis;

    // 不变量自检：答案字母必须仍指向原正确内容
    if (q.options[j] !== content) throw new Error('swap invariant broken: ' + q.id);
    if (q.options[q.answer.charCodeAt(0) - 65] !== content) throw new Error('answer mapping broken: ' + q.id);
    return true;
}

/** 统计某组题的答案字母分布 */
function letterDist(list) {
    const d = { A: 0, B: 0, C: 0, D: 0 };
    for (const q of list) if (typeof q.answer === 'string' && /^[A-D]$/.test(q.answer) && d[q.answer] !== undefined) d[q.answer]++;
    return d;
}

function balance(list, target) {
    const dist = letterDist(list);
    const dev = {};
    for (const L of 'ABCD') dev[L] = dist[L] - target;

    const surplus = 'ABCD'.split('').filter((L) => dev[L] > 0);
    const deficit = 'ABCD'.split('').filter((L) => dev[L] < 0);
    const touched = new Set();
    let changed = 0;

    for (const to of deficit) {
        for (const from of surplus) {
            // 两个方向都要留余量：目标尚未补齐，且来源仍有富余。
            // 只判 need 会让首个 surplus 字母被超额搬空（曾把 C 搬走 37 道、D 一道没动）。
            if (dev[to] >= 0 || dev[from] <= 0) break;
            for (const q of list) {
                // 两个方向都要留余量：目标尚未补齐，且来源仍有富余。
            // 只判 need 会让首个 surplus 字母被超额搬空（曾把 C 搬走 37 道、D 一道没动）。
            if (dev[to] >= 0 || dev[from] <= 0) break;
                if (q.answer !== from || touched.has(q)) continue;
                if (moveCorrectOption(q, to)) { touched.add(q); changed++; dev[from]--; dev[to]++; }
            }
        }
    }
    return { changed, after: letterDist(list) };
}

function main() {
    const data = JSON.parse(readFileSync(BANK, 'utf8'));
    const subjects = SUBJECTS.filter((s) => data[s]);

    console.log('=== T1-3 / P0-2 选择题答案分布均衡（按学科分桶）===');
    console.log(`模式: ${APPLY ? 'APPLY（会写文件）' : 'dry-run（只读）'}\n`);
    console.log('  学科        可换位  换位  均衡后分布             最大占比');

    let grand = 0;
    for (const subj of subjects) {
        const list = data[subj].questions || data[subj].exams || [];
        const eligible = list.filter(isEligible);
        const n = eligible.length;
        const target = Math.round(n / 4);
        const before = letterDist(eligible);
        const { changed, after } = balance(eligible, target);
        grand += changed;

        const maxPct = n ? ((Math.max(after.A, after.B, after.C, after.D) / n) * 100) : 0;
        console.log(`  ${subj.padEnd(10)} ${String(n).padStart(6)} ${String(changed).padStart(5)}   ${JSON.stringify(after).padEnd(30)} ${maxPct.toFixed(1)}%`);
        if (!APPLY && n) {
            console.log(`             （换位前 ${JSON.stringify(before)} → 目标 ${target}）`);
        }
    }

    console.log('');
    if (!APPLY) {
        console.log(`[dry-run] 计划换位 ${grand} 题，未写入任何文件。确认无误后加 --apply 执行。`);
        return;
    }
    if (!grand) {
        console.log('✓ 分布已均衡，无需换位');
        return;
    }
    // 换位后同步各科 total（题量未变，仅兜底）
    for (const subj of subjects) {
        const list = data[subj].questions || data[subj].exams || [];
        if (Number(data[subj].total) !== list.length) data[subj].total = list.length;
    }
    writeFileSync(BANK, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✓ 已写入 ${BANK}（共换位 ${grand} 题）`);
}

main();
