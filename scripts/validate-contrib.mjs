#!/usr/bin/env node
/**
 * validate-contrib.mjs — 投稿题目校验（v1.9，社区投稿通道）
 *
 * 三层检查：
 *   1. 结构：按 contrib/schema/question.schema.json 校验（内置最小 Schema 子集
 *      解释器，零依赖；支持本 Schema 用到的 type/required/enum/pattern/minLength/
 *      maxLength/minimum/maximum/minItems/maxItems/items/properties/allOf/if/then）
 *   2. 去重：与现有题库交叉核对 id 唯一 + 题干完全相同（归一化后）即判重
 *   3. 自洽：有选项时 answer 必须在选项域内；解析禁止草稿标记
 * 用法：node scripts/validate-contrib.mjs [file...]   （缺省扫描 submissions/）
 * 退出码：0 = 全部通过；1 = 存在不合格投稿。
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadExamBank, EXAM_SUBJECTS } from './lib/exam-bank.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, '1.2');
const CONTRIB = join(ROOT, 'contrib');
const SCHEMA = JSON.parse(readFileSync(join(CONTRIB, 'schema', 'question.schema.json'), 'utf8'));

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓', msg); }
  else { fail++; console.error('  ✗', msg); }
}

/* ---------------- 最小 JSON Schema 子集解释器 ---------------- */
function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (Number.isInteger(v)) return 'integer';
  return typeof v;
}
function validateSchema(value, schema, path, errors) {
  if (!schema || typeof schema !== 'object') return;

  if (schema.type) {
    const t = typeOf(value);
    const want = Array.isArray(schema.type) ? schema.type : [schema.type];
    const match = want.some((w) => w === t || (w === 'number' && t === 'integer'));
    if (!match) {
      errors.push(`${path || '$'}: 类型应为 ${want.join('/')}，实际 ${t}`);
      return;
    }
  }
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${path}: 取值 "${value}" 不在允许集合 ${JSON.stringify(schema.enum)}`);
  }
  if (typeof value === 'string') {
    if (schema.minLength != null && value.length < schema.minLength) {
      errors.push(`${path}: 长度 ${value.length} < 最小 ${schema.minLength}`);
    }
    if (schema.maxLength != null && value.length > schema.maxLength) {
      errors.push(`${path}: 长度 ${value.length} > 最大 ${schema.maxLength}`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${path}: 不符合格式 ${schema.pattern}`);
    }
  }
  if (typeof value === 'number') {
    if (schema.minimum != null && value < schema.minimum) errors.push(`${path}: ${value} < 最小值 ${schema.minimum}`);
    if (schema.maximum != null && value > schema.maximum) errors.push(`${path}: ${value} > 最大值 ${schema.maximum}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems != null && value.length < schema.minItems) {
      errors.push(`${path}: 数组长度 ${value.length} < 最小 ${schema.minItems}`);
    }
    if (schema.maxItems != null && value.length > schema.maxItems) {
      errors.push(`${path}: 数组长度 ${value.length} > 最大 ${schema.maxItems}`);
    }
    if (schema.items) {
      value.forEach((v, i) => validateSchema(v, schema.items, `${path}[${i}]`, errors));
    }
  }
  if (typeOf(value) === 'object' && value !== null) {
    for (const req of schema.required || []) {
      if (!(req in value)) errors.push(`${path || '$'}: 缺少必填字段 ${req}`);
    }
    for (const [k, sub] of Object.entries(schema.properties || {})) {
      if (k in value) validateSchema(value[k], sub, `${path}.${k}`, errors);
    }
  }
  for (const sub of schema.allOf || []) {
    if (sub.if) {
      const probe = [];
      validateSchema(value, sub.if, path, probe);
      if (probe.length === 0 && sub.then) validateSchema(value, sub.then, path, errors);
    } else {
      validateSchema(value, sub, path, errors);
    }
  }
}

/* ---------------- 题库交叉视图 ---------------- */
const bank = loadExamBank(APP);
const existingIds = new Set();
const existingStems = new Set();
const normStem = (s) => String(s == null ? '' : s).replace(/\s+/g, '').slice(0, 200);
for (const s of EXAM_SUBJECTS) {
  for (const q of (bank[s] && bank[s].questions) || []) {
    if (q.id) existingIds.add(q.id);
    existingStems.add(normStem(q.question));
  }
}

const DRAFT_MARKERS = [/修正后/, /\bTODO\b/, /待补充/, /草稿/];

/* ---------------- 主流程 ---------------- */
function collectFiles() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  if (args.length) return args.map((p) => resolve(p));
  const dir = join(CONTRIB, 'submissions');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => n.toLowerCase().endsWith('.json'))
    .map((n) => join(dir, n));
}

const files = collectFiles();
ok(files.length > 0, `发现 ${files.length} 份投稿文件`);

for (const file of files) {
  const name = basename(file);
  let q;
  try {
    q = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    fail++;
    console.error(`  ✗ ${name}: JSON 解析失败 ${e.message}`);
    continue;
  }

  // 1. Schema
  const errors = [];
  validateSchema(q, SCHEMA, '$', errors);
  ok(errors.length === 0, `${name}: 结构符合 Schema${errors.length ? ' → ' + errors.slice(0, 3).join('; ') : ''}`);

  // 2. 去重
  if (q.id) {
    ok(!existingIds.has(q.id), `${name}: id "${q.id}" 未与现有 ${existingIds.size} 题重复`);
  }
  if (q.question) {
    ok(!existingStems.has(normStem(q.question)), `${name}: 题干未与现有题库重复`);
  }

  // 3. 自洽
  if (Array.isArray(q.options) && q.options.length >= 2 && typeof q.answer === 'string') {
    const letters = q.options.map((_, i) => String.fromCharCode(65 + i));
    ok(letters.includes(q.answer.toUpperCase()), `${name}: answer "${q.answer}" 在选项域 ${letters.join('/')} 内`);
  }
  if (q.analysis) {
    const hit = DRAFT_MARKERS.find((re) => re.test(q.analysis));
    ok(!hit, `${name}: 解析无草稿标记`);
  }
  if (q.subject && !EXAM_SUBJECTS.includes(q.subject)) {
    fail++;
    console.error(`  ✗ ${name}: subject "${q.subject}" 不在 ${EXAM_SUBJECTS.join('/')}`);
  }
}

console.log(`\n投稿校验: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
