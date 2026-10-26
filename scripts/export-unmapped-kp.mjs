#!/usr/bin/env node
/**
 * export-unmapped-kp.mjs — 考点映射待办清单导出
 *
 * 用途：把题库中「无法解析到 knowledge.json topic」的考点导出成清单，
 * 供内容贡献者逐条补齐（这是**内容工作**，不是代码工作）。
 *
 * 输出：docs/TODO-knowledge-points.md
 * - 按学科分组，按出现频次降序
 * - 标注考点类型：模块名 / 元数据标签 / 真实知识点未收录
 * - 给出示例题目 id，便于定位
 *
 * 判定口径：
 * 1. 精确命中 topic.name → 已解析
 * 2. 命中 thesaurus 的 aliases → 已解析
 * 3. 归一化后相等 → 已解析
 * 4. 归一化后双向包含 → 已解析
 * 5. 否则视为未解析，并按以下规则归类：
 * - 值等于该学科某个 chapter.name → 模块名（粒度太粗，无法归因）
 * - 值为「综合应用/高频考点/基础概念/…」→ 元数据标签（本就不是知识点）
 * - 其余 → 真实知识点未收录（需人工映射）
 *
 * 用法：node scripts/export-unmapped-kp.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const APP = join(ROOT, '1.2');
const BANK = join(APP, 'data', 'exam-bank.json');
const THES = join(APP, 'data', 'knowledgePoints-thesaurus.json');

const SUBJECTS = ['physics', 'chemistry', 'biology', 'math', 'chinese', 'english'];

// 元数据标签（描述题目特征，不是知识点）
const META_TAGS = new Set([
    '综合应用', '高频考点', '基础概念', '基本概念', '综合', '实验',
    '易错题', '常考题', '重点', '难点', '基础', '提高', '压轴'
]);

/**
 * 归一化用于等价比较：
 * - 去空白；统一全角/半角；去常见标点和"（）"内的补充说明
 * - 「xx定律的应用」→「xx定律」
 */
const norm = (x) => String(x == null ? '' : x)
    .replace(/[（）()\[\]【】]/g, '')
    .replace(/[\s,，.。:：;；、·\-—_]/g, '')
    .replace(/(定律|定理|公式|规律|法则)(的)?(应用|综合|计算|分析|判断|理解)?$/g, '$1')
    .toLowerCase();

function collectTopics(kj) {
    const topics = new Set();
    const chapters = new Set();
    const walkChapters = (list) => {
        for (const ch of list || []) {
            if (ch.name) chapters.add(String(ch.name).trim());
            // 章节下直接挂 topics
            for (const t of ch.topics || []) if (t.name) topics.add(String(t.name).trim());
            // 兼容嵌套 chapters
            if (ch.chapters) walkChapters(ch.chapters);
        }
    };
    walkChapters(kj.chapters || []);
    for (const t of kj.topics || []) if (t.name) topics.add(String(t.name).trim());
    return { topics, chapters };
}

function main() {
    if (!existsSync(BANK) || !existsSync(THES)) {
        console.error('缺少题库或同义词表');
        process.exit(1);
    }
    const bank = JSON.parse(readFileSync(BANK, 'utf8'));
    const th = JSON.parse(readFileSync(THES, 'utf8'));

    const lines = [];
    lines.push('# 考点映射待办清单（T1-4 / P0-3）');
    lines.push('');
    lines.push('> 本文件由 `scripts/export-unmapped-kp.mjs` **自动生成**，请勿手工编辑。');
    lines.push('> 重新生成：`node scripts/export-unmapped-kp.mjs`');
    lines.push('');
    lines.push('## 背景');
    lines.push('');
    lines.push('题库 `exam-bank.json` 的 `knowledgePoints` 字段与 `data/{subject}/knowledge.json` 的');
    lines.push('`chapters[].topics[].name` 无法一一对应，导致错题无法归因到具体知识点，');
    lines.push('「学习路径推荐」拿不到复习条目。');
    lines.push('');
    lines.push('## 三类成因');
    lines.push('');
    lines.push('| 类型 | 说明 | 处理方式 |');
    lines.push('| --- | --- | --- |');
    lines.push('| 模块名 | 值等于某个 chapter.name（如「光学与原子物理」「反应原理」） | 粒度太粗，**需拆成具体 topic** |');
    lines.push('| 元数据标签 | 「综合应用」「高频考点」「基础概念」等描述题目特征 | 本就不是知识点，**应从 knowledgePoints 移出** |');
    lines.push('| 真实知识点未收录 | 确为知识点但 canonical 表里没有 | **在 thesaurus 的 aliases 里补映射** |');
    lines.push('');

    let grandUnmapped = 0;
    let grandTotal = 0;
    const summary = [];

    for (const k of SUBJECTS) {
        const kj = JSON.parse(readFileSync(join(APP, 'data', k, 'knowledge.json'), 'utf8'));
        const { topics, chapters } = collectTopics(kj);
        const canon = new Set((th.subjects[k] && th.subjects[k].canonical) || []);
        const alias = (th.subjects[k] && th.subjects[k].aliases) || {};

        const counter = new Map();
        const sample = new Map();
        let total = 0;
        for (const q of (bank[k] || {}).questions || []) {
            for (const p of q.knowledgePoints || []) {
                if (!p) continue;
                total++;
                counter.set(p, (counter.get(p) || 0) + 1);
                if (!sample.has(p)) sample.set(p, q.id);
            }
        }

        const resolve = (kp) => {
            if (topics.has(kp) || canon.has(kp)) return true;
            if (alias[kp]) return true;
            const n = norm(kp);
            for (const t of topics) if (norm(t) === n) return true;
            for (const t of topics) {
                const nt = norm(t);
                if (nt && n && (nt.includes(n) || n.includes(nt))) return true;
            }
            return false;
        };

        const unmapped = [...counter.keys()].filter((p) => !resolve(p));
        const byKind = { module: [], meta: [], real: [] };
        for (const p of unmapped) {
            if (chapters.has(p)) byKind.module.push(p);
            else if (META_TAGS.has(p)) byKind.meta.push(p);
            else byKind.real.push(p);
        }
        for (const key of Object.keys(byKind)) {
            byKind[key].sort((a, b) => (counter.get(b) || 0) - (counter.get(a) || 0));
        }

        const pct = total ? ((total - unmapped.reduce((a, p) => a + (counter.get(p) || 0), 0)) / total) * 100 : 0;
        grandTotal += total;
        grandUnmapped += unmapped.reduce((a, p) => a + (counter.get(p) || 0), 0);
        summary.push({ k, total, unmapped: byKind, pct });

        lines.push(`## ${k}`);
        lines.push('');
        lines.push(`考点总数 ${total}，未解析 ${unmapped.reduce((a, p) => a + (counter.get(p) || 0), 0)}，解析率 ${pct.toFixed(1)}%`);
        lines.push('');
        lines.push('### 模块名（粒度太粗，需拆成具体 topic）');
        lines.push('');
        if (!byKind.module.length) lines.push('  （无）');
        byKind.module.forEach((p) => lines.push(`- \`${p}\` ×${counter.get(p)}`));
        lines.push('');
        lines.push('### 元数据标签（应从 knowledgePoints 移出）');
        lines.push('');
        if (!byKind.meta.length) lines.push('  （无）');
        byKind.meta.forEach((p) => lines.push(`- \`${p}\` ×${counter.get(p)}`));
        lines.push('');
        lines.push('### 真实知识点未收录（需在 aliases 补映射）');
        lines.push('');
        if (!byKind.real.length) lines.push('  （无）');
        byKind.real.slice(0, 40).forEach((p) => lines.push(`- \`${p}\` ×${counter.get(p)}（例：${sample.get(p)}）`));
        if (byKind.real.length > 40) lines.push(`- …… 另有 ${byKind.real.length - 40} 条`);
        lines.push('');
    }

    console.log(`全库考点解析率: ${((grandTotal - grandUnmapped) / grandTotal * 100).toFixed(1)}%（${grandTotal - grandUnmapped}/${grandTotal}）`);
    console.log('明细:');
    summary.forEach((s) => {
        const u = s.unmapped.module.length + s.unmapped.meta.length + s.unmapped.real.length;
        console.log(`  ${s.k.padEnd(10)} 唯一未解析考点 ${u}（模块 ${s.unmapped.module.length} / 标签 ${s.unmapped.meta.length} / 真实 ${s.unmapped.real.length}）`);
    });

    const outPath = join(ROOT, 'docs', 'TODO-knowledge-points.md');
    writeFileSync(outPath, lines.join('\n'), 'utf8');
    console.log('\n已生成:', outPath);
}

main();
