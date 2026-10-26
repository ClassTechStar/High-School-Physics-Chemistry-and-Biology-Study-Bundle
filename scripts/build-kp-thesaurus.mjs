#!/usr/bin/env node
/**
 * build-kp-thesaurus.mjs — 把 TOPIC_ALIAS_MAP 从代码抽到数据文件
 *
 * 背景（）：
 * `1.2/data/knowledgePoints-thesaurus.json` 早已存在，但**没有任何代码读取它**
 * ——只在 `promo.html` 里被宣传、在 `sw.js` 里被预缓存。别名仍硬编码在
 * `learning-path-recommender.js` 的 `TOPIC_ALIAS_MAP` 里。
 *
 * 本脚本做的事：
 * 1. 从 `learning-path-recommender.js` 抽出硬编码的 TOPIC_ALIAS_MAP（保持权威来源）
 * 2. 合并「人工整理的高频考点映射」（针对实测未命中的真实知识点）
 * 3. 校验：每个别名的目标必须真实存在于对应 subject 的 knowledge.json topic 名里
 * ——防止别名越修越错
 * 4. 写回 knowledgePoints-thesaurus.json 的 subjects.<subject>.aliases
 *
 * 用法：node scripts/build-kp-thesaurus.mjs [--apply] （默认 dry-run）
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const APP = join(ROOT, '1.2');
const THES = join(APP, 'data', 'knowledgePoints-thesaurus.json');
const REC = join(APP, 'js', 'learning-path-recommender.js');

const APPLY = process.argv.includes('--apply');
const SUBJECTS = ['physics', 'chemistry', 'biology', 'math', 'chinese', 'english'];

/** 从 recommender 源码里抽出 TOPIC_ALIAS_MAP 字面量并求值 */
function extractAliasMap(src) {
    const m = /TOPIC_ALIAS_MAP\s*=\s*(\{[\s\S]*?\n    \});/.exec(src);
    if (!m) return null;
    // 用 Function 在受限作用域内求值字面量（内容为本仓库自有源码，无外部输入）
    return Function('"use strict";return (' + m[1] + ');')();
}

/**
 * 人工整理的补充映射：key 为题库里出现的考点写法，value 为 canonical topic 名。
 * 仅收录能**明确判定**归属的；模棱两可的（如"综合应用"这种元数据标签）不收录，
 * 因为强行归类会制造错误归因。
 */
const MANUAL_ALIASES = {
    physics: {
        '闭合电路欧姆定律': '直流电路', '欧姆定律': '直流电路',
        '正弦式交变电流': '电磁感应', '交变电流有效值': '电磁感应',
        '机械能守恒定律': '机械能', '动能': '机械能',
        '矢量与标量': '运动的描述', '惯性': '牛顿运动定律',
        '失重': '牛顿运动定律', '二力平衡': '相互作用与力',
        '弹性碰撞': '动量', '双缝干涉': '波动光学',
        '光的本性': '波动光学', '光子': '光电效应',
        '自由落体': '匀变速直线运动', '物态变化': '气体实验定律',
        '万有引力': '万有引力与航天', '安培定则': '磁场',
        '动生电动势': '电磁感应', '法拉第定律': '电磁感应',
        '玻尔理论': '原子结构与玻尔理论', '核反应方程': '原子核与核反应',
        '打点计时器使用': '匀变速直线运动'
    },
    chemistry: {
        '化学变化': '化学用语与物质分类',
        '纯净物与混合物': '化学用语与物质分类',
        '元素分类': '化学用语与物质分类',
        '同素异形体': '化学用语与物质分类',
        '化学用语': '化学用语与物质分类',
        '化学键': '化学键与分子结构',
        '化学计算': '物质的量',
        '控制变量法': '基本实验操作',
        '溶液配制': '溶液浓度计算',
        '气体的干燥': '物质的分离与提纯',
        '气体干燥': '物质的分离与提纯',
        '物质分离提纯': '物质的分离与提纯',
        '工业流程分析': '物质的分离与提纯',
        '活化分子理论': '化学反应速率与化学平衡',
        '硫代硫酸钠分解反应': '化学反应速率与化学平衡',
        '化学平衡': '化学反应速率与化学平衡',
        '化学平衡移动': '化学反应速率与化学平衡',
        '有机物结构推断': '烃的衍生物',
        '官能团性质': '烃的衍生物',
        '官能团转化': '烃的衍生物',
        '有机合成路线推断': '烃的衍生物',
        '卤代烃消去反应': '烃的衍生物',
        '缩聚反应': '烃的衍生物',
        '醛基': '烃的衍生物',
        '银镜反应': '烃的衍生物',
        '催化氧化': '烃的衍生物',
        '同分异构体书写': '有机物基础',
        '核磁共振氢谱': '有机物基础',
        '糖类': '生物大分子（糖类、油脂、蛋白质）',
        '氯气的性质': '氯及其化合物',
        '苯的性质': '烃',
        '金属冶炼': '氧化还原反应',
        '硫酸工业制法': '硫及其化合物',
        '浓硫酸': '硫及其化合物',
        '电解原理': '电化学',
        '电解规律': '电化学',
        '离子共存': '离子反应',
        '弱电解质电离': '电解质溶液',
        '弱电解质电离平衡': '电解质溶液',
        '电离平衡': '电解质溶液',
        '稀释规律': '电解质溶液',
        '沉淀溶解平衡': '电解质溶液',
        'pH计算': '电解质溶液'
    },
    biology: {
        '生命调节': '动物生命活动调节',
        '细胞与分子': '细胞的基本结构',

        '代谢调节': '细胞代谢',
        '概率计算': '孟德尔遗传定律',
        '基因型概率计算': '孟德尔遗传定律',
        '自由交配配子法': '孟德尔遗传定律',
        '生长素的两重性': '植物激素调节',
        '血糖调节': '血糖与水盐平衡调节',
        '酶的特性（温度敏感性）': '细胞代谢',




        '系谱图判读': '伴性遗传',
        '伴X染色体隐性遗传': '伴性遗传',
        '种群数量变化': '种群与群落',
        'S型增长曲线': '种群与群落',
        'J型曲线': '种群与群落',
        '环境保护措施': '生态系统',
        '生物富集': '生态系统',
        '细胞呼吸': '细胞代谢',
        '有氧呼吸': '细胞代谢',
        '细胞结构': '细胞的基本结构',
        '细胞膜结构': '细胞的基本结构',
        '流动镶嵌模型': '细胞的基本结构',
        '细胞器': '细胞的基本结构',
        '线粒体': '细胞的基本结构',
        '酶': '细胞代谢',
        '催化特性': '细胞代谢',
        '光反应': '细胞代谢',
        '暗反应': '细胞代谢',
        '影响光合作用的环境因素': '细胞代谢',
        '光补偿点与光饱和点': '细胞代谢',
        '渗透作用': '物质跨膜运输方式',
        '原核生物与真核生物': '原核细胞与真核细胞',
        'DNA结构': 'DNA与基因',
        '碱基互补配对': 'DNA与基因',
        '基因的概念': 'DNA与基因',
        '转录翻译': 'DNA与基因',
        '密码子': 'DNA与基因',
        '同源染色体': '细胞分裂',
        '染色体组': '生物变异',
        '染色体变化': '细胞分裂',
        '单倍体': '生物变异',
        '有丝分裂间期': '细胞分裂',
        '胰岛素': '体液调节与激素'
    },
    math: {},
    chinese: {},
    english: {}
};

function collectTopics(kj) {
    const topics = new Set();
    const walk = (list) => {
        for (const ch of list || []) {
            for (const t of ch.topics || []) if (t.name) topics.add(String(t.name).trim());
            if (ch.chapters) walk(ch.chapters);
        }
    };
    walk(kj.chapters || []);
    for (const t of kj.topics || []) if (t.name) topics.add(String(t.name).trim());
    return topics;
}

function main() {
    if (!existsSync(REC) || !existsSync(THES)) {
        console.error('缺少 recommender 或 thesaurus 文件');
        process.exit(1);
    }
    const recSrc = readFileSync(REC, 'utf8');
    const th = JSON.parse(readFileSync(THES, 'utf8'));

    const hardcoded = extractAliasMap(recSrc) || {};
    let added = 0;
    let invalid = 0;
    const invalidList = [];

    for (const s of SUBJECTS) {
        const kj = JSON.parse(readFileSync(join(APP, 'data', s, 'knowledge.json'), 'utf8'));
        const topics = collectTopics(kj);
        const canon = new Set(((th.subjects[s] || {}).canonical) || []);

        th.subjects = th.subjects || {};
        th.subjects[s] = th.subjects[s] || {};
        const alias = th.subjects[s].aliases || {};

        // 1) 硬编码表合并进数据文件
        for (const k of Object.keys(hardcoded[s] || {})) {
            if (alias[k] === undefined) { alias[k] = hardcoded[s][k]; added++; }
        }
        // 2) 人工补充映射
        for (const k of Object.keys(MANUAL_ALIASES[s] || {})) {
            if (alias[k] === undefined) { alias[k] = MANUAL_ALIASES[s][k]; added++; }
        }

        // 3) 校验目标存在性
        for (const k of Object.keys(alias)) {
            const target = alias[k];
            if (!topics.has(target) && !canon.has(target)) {
                invalid++;
                invalidList.push(`${s}: ${k} → ${target}`);
            }
        }
        th.subjects[s].aliases = alias;
    }

    console.log('=== T1-4 别名表外部化 ===');
    console.log(`模式: ${APPLY ? 'APPLY' : 'dry-run'}`);
    console.log(`合并别条目数: ${added}`);
    if (invalid) {
        console.log(`\n✗ ${invalid} 条别名目标在 knowledge.json 中不存在:`);
        invalidList.slice(0, 15).forEach((x) => console.log('   ' + x));
        process.exit(1);
    }
    console.log('✓ 所有别名目标均存在于 knowledge.json');

    if (!APPLY) {
        console.log('\n[dry-run] 未写入。确认无误后加 --apply。');
        return;
    }
    writeFileSync(THES, JSON.stringify(th, null, 2), 'utf8');
    console.log('\n✓ 已写入', THES);
}

main();
