/**
 * T2-5 / P1-2: cross-subject.json 接线回归测试
 *
 * 背景：data/cross-subject.json（22 条）曾被 Service Worker 预缓存、README 宣传，
 * 却无任何运行时消费方——跨学科专题功能实际跑的是 visual-enhanced.js 内置的 8 条。
 * v1.4 起改为运行时 fetch JSON 并适配为内置同构结构，加载失败回退内置数据。
 *
 * 本测试锁死：
 *   1. 适配器把 22 条 JSON 全部转换为渲染所需结构（无字段缺失）
 *   2. 答案字母（A/B/C/D）正确转为数字索引（_answer 按索引判题）
 *   3. 学科学科码（physics/...）转为中文名
 *   4. 内置回退数据仍在（8 条）且结构同构
 *   5. JSON 文件本身质量达标（防止接线后渲染出空壳条目）
 */
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, '1.2');
const JS = readFileSync(join(APP, 'js', 'visual-enhanced.js'), 'utf8');
const RAW = JSON.parse(readFileSync(join(APP, 'data', 'cross-subject.json'), 'utf8'));

const sandbox = {
  console: { warn() {}, error() {}, log() {}, info() {} },
  window: {},
  document: { getElementById: () => null, addEventListener() {}, createElement: () => ({ style: {} }) },
};
sandbox.window = sandbox;
sandbox.top = sandbox;
sandbox.parent = sandbox;
vm.createContext(sandbox);
vm.runInContext(JS, sandbox, { filename: 'visual-enhanced.js' });

const cst = sandbox.crossSubjectTopics;

let passed = 0;
let failed = 0;
function assert(cond, msg) {
  if (cond) { passed += 1; console.log('  ok  ', msg); }
  else { failed += 1; console.error('  FAIL', msg); }
}

console.log('cross-subject.json 接线测试（T2-5 / P1-2）');

assert(!!cst, 'crossSubjectTopics 已挂到 window');
assert(typeof cst._adapt === 'function', '_adapt 适配器存在');
assert(typeof cst.loadData === 'function', 'loadData 存在');
assert(Array.isArray(cst._fallbackData) && cst._fallbackData.length === 8,
  `内置回退数据 8 条（got ${cst._fallbackData.length}）`);

// 1. 适配器全量转换
const adapted = cst._adapt(RAW);
assert(adapted.length === RAW.topics.length,
  `适配条数 ${adapted.length} == JSON 条数 ${RAW.topics.length}`);

const missingFields = adapted.filter((t) =>
  !t.id || !t.title || !t.icon || !t.color || !t.subjects || !t.subjects.length
  || !t.principle || !Array.isArray(t.keyPoints) || t.keyPoints.length === 0
  || !t.trend || !t.example || !t.example.question || !t.example.options
  || t.example.options.length === 0 || !t.example.analysis);
assert(missingFields.length === 0,
  missingFields.length === 0
    ? '22 条适配后字段全部完整'
    : `字段缺失: ${missingFields.map((t) => t.id).join(', ')}`);

// 2. 答案字母 → 数字索引
const badAnswer = adapted.filter((t) =>
  typeof t.example.answer !== 'number' || t.example.answer < 0 || t.example.answer > 3);
assert(badAnswer.length === 0,
  badAnswer.length === 0
    ? '答案全部转为 0-3 数字索引'
    : `答案索引异常: ${badAnswer.map((t) => `${t.id}=${t.example.answer}`).join(', ')}`);
const letterOk = RAW.topics.every((raw, i) => {
  const expect = { A: 0, B: 1, C: 2, D: 3 }[String(raw.example.answer).toUpperCase()];
  return expect === undefined || adapted[i].example.answer === expect;
});
assert(letterOk, '字母→索引映射逐条正确（A=0/B=1/C=2/D=3）');

// 3. 学科码 → 中文
const CN = { physics: '物理', chemistry: '化学', biology: '生物', math: '数学', chinese: '语文', english: '英语' };
const subjectOk = RAW.topics.every((raw, i) => {
  const expect = raw.subjects.map((s) => CN[s] || s);
  return expect.length === adapted[i].subjects.length
    && expect.every((v, k) => adapted[i].subjects[k] === v);
});
assert(subjectOk, '学科学科码逐条转为中文名');
assert(adapted.every((t) => t.subjects.every((s) => /^[\u4e00-\u9fa5]+$/.test(s))),
  '适配后无裸露英文学科码');

// 4. 回退数据同构
const fb = cst._fallbackData;
assert(fb.every((t) => typeof t.example.answer === 'number'),
  '回退数据 answer 同为数字索引（判题口径一致）');
assert(fb.every((t) => t.id && t.title && t.icon && t.color && t.principle
  && Array.isArray(t.keyPoints) && t.keyPoints.length && t.trend && t.example.analysis),
  '回退数据字段完整');

// 5. JSON 源质量（防接线后渲染空壳）
const lowQuality = RAW.topics.filter((t) =>
  !t.principle || t.principle.length < 50
  || !t.keyPoints || !t.keyPoints.length
  || !t.example || !t.example.analysis || t.example.analysis.length < 50
  || !t.example.options || t.example.options.length < 2);
assert(lowQuality.length === 0,
  lowQuality.length === 0
    ? 'JSON 源 22 条质量达标'
    : `JSON 源质量不达标: ${lowQuality.map((t) => t.id).join(', ')}`);

// 6. 接线事实：visual-enhanced.js 必须引用该 JSON
assert(JS.includes("fetch('data/cross-subject.json')"), '渲染器已 fetch data/cross-subject.json');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
