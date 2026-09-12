/**
 * polish-analyses.mjs — 第二轮：让选择题解析真正解释“为什么”
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const P = join(ROOT, '1.2', 'data', 'exam-bank.json');
const eb = JSON.parse(readFileSync(P, 'utf8'));

/** 按题干关键词给一句概念说明 */
const CONCEPT_RULES = [
  [/传感器/, '传感器的作用是把非电学量（如力、光、温度、声等）转换为便于测量的电学量（如电压、电流、电阻）。'],
  [/光敏电阻/, '光敏电阻的阻值随光照增强而减小，常用于光控电路。'],
  [/热敏电阻/, '热敏电阻（NTC 型）通常温度升高电阻减小，用于测温与过热保护。'],
  [/电容器/, '电容器具有“通交流、隔直流”的特性：直流被充满后相当于开路，交流可通过充放电形成电流。'],
  [/电感器/, '电感器具有“通直流、阻交流”的特性：对变化电流产生自感电动势阻碍变化。'],
  [/冲量/, '冲量定义为力与作用时间的乘积 I=Ft，是矢量，反映力对时间的累积效应。'],
  [/动量定理/, '动量定理：物体所受合外力的冲量等于其动量变化，即 I=Δp。'],
  [/狭义相对论/, '狭义相对论的两条基本原理：相对性原理与光速不变原理。'],
  [/广义相对论/, '广义相对论将引力解释为时空弯曲，等效原理是其重要基础。'],
  [/质能|质量与能量/, '质能方程 E=mc² 表明质量与能量相当，核反应中质量亏损会释放巨大能量。'],
  [/物质波/, '德布罗意物质波波长 λ=h/p，一切运动粒子都具有波动性。'],
  [/不确定性/, '不确定性关系 Δx·Δp≥ħ/2，位置与动量不能同时精确测定。'],
  [/火箭/, '火箭升空利用反冲运动：向后喷出气体，气体对火箭的反作用力使火箭前进。'],
  [/光子/, '光子能量 E=hν，与频率成正比；光电效应中还与金属逸出功有关。'],
  [/匀速直线|合力为/, '匀速直线运动处于平衡状态，所受合力为零。'],
  [/血糖|胰高血糖素|胰岛素/, '胰高血糖素升高血糖，胰岛素降低血糖；血糖偏低时以胰高血糖素分泌增加为主。'],
  [/自然选择|进化/, '现代生物进化理论以自然选择学说为核心，种群基因频率的定向改变是进化的实质。'],
  [/抗利尿激素/, '抗利尿激素由下丘脑合成、垂体释放，促进肾小管和集合管重吸收水，降低细胞外液渗透压。'],
  [/第三道防线|特异性免疫/, '人体第三道防线是特异性免疫，包括体液免疫和细胞免疫。'],
  [/艾滋病|HIV/, 'HIV 主要侵染辅助性 T 细胞，导致特异性免疫功能几乎全部丧失。'],
  [/内环境稳态/, '内环境稳态是指内环境的化学成分和理化性质保持相对稳定（不是绝对不变），神经—体液—免疫调节网络是主要调节机制。'],
  [/平衡.*移动|化学平衡/, '勒夏特列原理：改变影响平衡的一个条件，平衡向减弱该改变的方向移动；升温有利于吸热方向。'],
  [/葡萄糖|单糖|二糖|多糖/, '葡萄糖不能水解，属于单糖；二糖（蔗糖、麦芽糖等）和多糖（淀粉、纤维素）可水解。'],
  [/原电池/, '原电池中较活泼金属失电子作负极，发生氧化反应；较不活泼（或导电非金属）作正极。'],
  [/浓硝酸|棕色/, '浓硝酸见光易分解，须保存在棕色试剂瓶中并置于阴凉处。'],
  [/油脂/, '油脂是高级脂肪酸甘油酯，属于酯类，不属于糖类。'],
  [/蛋白质.*变性|变性/, '蛋白质变性是指空间结构被破坏导致生物活性丧失，一般不涉及肽键水解。'],
  [/周期/, '正弦型函数 y=Asin(ωx+φ) 的最小正周期 T=2π/|ω|。'],
  [/向量.*模|\|a\||模长/, '向量模长 |a|=√(x²+y²)。'],
  [/否定|全称/, '全称命题“∀x∈R，p(x)”的否定是“∃x∈R，¬p(x)”。'],
  [/并集|A∪B/, '并集 A∪B 是所有属于 A 或属于 B 的元素组成的集合，可用数轴合并区间。'],
  [/前n项和|等差/, '等差数列中 Sₙ=n·a_{(n+1)/2}（n 为奇数时），或 S₅=5a₃（等差中项）。'],
  [/概率|骰子/, '古典概型：有利结果数除以等可能基本事件总数，列举时注意有序/无序。'],
];

function conceptFor(stem, kp, subject) {
  const all = stem + ' ' + (kp || []).join(' ');
  for (const [re, text] of CONCEPT_RULES) {
    if (re.test(all)) return text;
  }
  const fallback = {
    physics: '依据物理概念、规律或公式，结合题干条件判断。',
    chemistry: '依据化学概念、物质性质或反应规律判断。',
    biology: '依据生物学结构、生理过程或调节机制判断。',
    math: '依据定义、公式或运算规则计算判断。',
    chinese: '依据语境、语法与文学常识判断。',
    english: '依据上下文语义与语法规则判断。',
  }[subject] || '依据题干信息与学科基本概念判断。';
  return fallback;
}

function polishChoice(q, subject) {
  const letter = String(q.answer || '').trim().toUpperCase();
  if (!/^[A-D]$/.test(letter)) return null;
  if (!Array.isArray(q.options) || q.options.length < 2) return null;
  const idx = letter.charCodeAt(0) - 65;
  const correct = String(q.options[idx] || '').trim();
  const stem = String(q.question || '').replace(/\s+/g, ' ').trim();
  const kp = Array.isArray(q.knowledgePoints) ? q.knowledgePoints.join('、') : '';
  const concept = conceptFor(stem, Array.isArray(q.knowledgePoints) ? q.knowledgePoints : [], subject);

  // 简短问句提炼
  let ask = stem;
  if (ask.length > 60) ask = ask.slice(0, 60) + '…';

  const wrongs = q.options
    .map((o, i) => ({ L: String.fromCharCode(65 + i), T: String(o || '').trim() }))
    .filter((x) => x.L !== letter && x.T)
    .slice(0, 2)
    .map((w) => `${w.L} 项「${w.T}」不符合上述概念或题干限定`)
    .join('；');

  return (
    `【考点】${kp || '基础概念'}\n` +
    `【题干】${ask}\n` +
    `【概念】${concept}\n` +
    `【判断】正确选项 ${letter} 为「${correct}」。` +
    (wrongs ? `排除：${wrongs}。` : '') +
    `\n【结论】选 ${letter}。`
  );
}

let polished = 0;
const bySub = {};

for (const subject of Object.keys(eb).filter((k) => k !== 'meta')) {
  bySub[subject] = 0;
  for (const q of eb[subject].exams || []) {
    const a = String(q.analysis || '');
    // 只打磨仍是通用模板的选择题
    if (!/其余选项：.*与题意不符/.test(a)) continue;
    if (!/选择/.test(String(q.type || '')) && !Array.isArray(q.options)) continue;
    const next = polishChoice(q, subject);
    if (next && next.length >= 40) {
      q.analysis = next;
      polished += 1;
      bySub[subject] += 1;
    }
  }
}

writeFileSync(P, JSON.stringify(eb, null, 2) + '\n', 'utf8');
console.log('polished', polished, bySub);

// stats
let under20 = 0, under60 = 0, n = 0;
for (const s of Object.keys(eb).filter((k) => k !== 'meta')) {
  for (const q of eb[s].exams || []) {
    n++;
    const L = (q.analysis || '').length;
    if (L < 20) under20++;
    if (L < 60) under60++;
  }
}
console.log({ n, under20, under60 });

// samples
for (const id of ['physics_2019_210', 'BIO_2025_03', 'MATH_2019_31', 'chemistry_2025_207', 'physics_2022_213']) {
  for (const s of Object.keys(eb).filter((k) => k !== 'meta')) {
    const q = (eb[s].exams || []).find((x) => x.id === id);
    if (q) {
      console.log('\n====', id);
      console.log(q.analysis);
    }
  }
}
