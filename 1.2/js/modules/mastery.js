// mastery.js — 知识点掌握度（v1.10 T16，ESM 纯函数）
//
// 可解释公式（不引入黑箱模型，界面只显示等级与曲线，不展示伪精确小数）：
//   掌握度 = (正确率 × 0.6 + SM-2 复习质量 × 0.4) × 时间衰减
//   时间衰减 = 0.5 ^ (距上次练习天数 / 14)
// 未练过 = 0；主观题待自评不计入正确率（由调用方过滤 pending）。
//
// 记录结构（由 mastery-tracker.js 持久化到 HSPCBStore('mastery.records')）：
//   { attempts, correct, qualitySum, qualityCount, lastAt }
// 本文件不碰 DOM / 存储，Node 可直接 import 单测。

export var DAY_MS = 86400000;
export var DECAY_DAYS = 14;

/** SM-2 质量分（0-5）→ 0-1；无数据时用中性 0.5，避免"只做对一题就满分"。 */
export function qualityUnit(qualitySum, qualityCount) {
  var n = Number(qualityCount) || 0;
  if (!n) return 0.5;
  var avg = (Number(qualitySum) || 0) / n;
  return Math.max(0, Math.min(1, avg / 5));
}

/** 单知识点掌握度 0-1（含 14 天半衰）。 */
export function computeMastery(rec, now) {
  if (!rec) return 0;
  var attempts = Number(rec.attempts) || 0;
  if (attempts <= 0) return 0;
  var correct = Math.max(0, Math.min(attempts, Number(rec.correct) || 0));
  var accuracy = correct / attempts;
  var quality = qualityUnit(rec.qualitySum, rec.qualityCount);
  var raw = accuracy * 0.6 + quality * 0.4;
  var lastAt = Number(rec.lastAt) || 0;
  var days = lastAt ? Math.max(0, ((Number(now) || Date.now()) - lastAt) / DAY_MS) : 0;
  var decay = Math.pow(0.5, days / DECAY_DAYS);
  return Math.max(0, Math.min(1, raw * decay));
}

/** 等级：未练 / 薄弱 / 一般 / 熟练 / 掌握。 */
export function levelOf(score) {
  var s = Number(score) || 0;
  if (s <= 0) return '未练';
  if (s < 0.4) return '薄弱';
  if (s < 0.6) return '一般';
  if (s < 0.8) return '熟练';
  return '掌握';
}

/**
 * 汇总：返回平均掌握度（0-1）、练过的知识点数、各等级计数。
 * records 形如 { 'physics::牛顿定律': {...}, ... }
 */
export function summarize(records, now) {
  var out = { avg: 0, count: 0, levels: { '未练': 0, '薄弱': 0, '一般': 0, '熟练': 0, '掌握': 0 }, points: [] };
  if (!records || typeof records !== 'object') return out;
  var sum = 0, n = 0;
  for (var key in records) {
    if (!Object.prototype.hasOwnProperty.call(records, key)) continue;
    var score = computeMastery(records[key], now);
    var lv = levelOf(score);
    out.levels[lv] = (out.levels[lv] || 0) + 1;
    out.points.push({ key: key, score: score, level: lv });
    sum += score;
    n++;
  }
  out.count = n;
  out.avg = n ? sum / n : 0;
  out.points.sort(function (a, b) { return a.score - b.score; });
  return out;
}

/**
 * 统一复习队列：SM-2 到期错题优先，其次薄弱知识点（掌握度低到高）。
 * @param {object} records 掌握度记录
 * @param {number} dueCount 到期错题数（由调用方从错题本取）
 * @param {number} now
 * @param {number} [limit] 薄弱知识点最多取几条
 */
export function buildQueue(records, dueCount, now, limit) {
  var cap = Number(limit) > 0 ? Number(limit) : 5;
  var sum = summarize(records, now);
  var weak = sum.points.filter(function (p) {
    return p.score > 0 && p.score < 0.4;
  }).slice(0, cap);
  var due = Math.max(0, Number(dueCount) || 0);
  return {
    due: due,
    weak: weak,
    weakCount: weak.length,
    total: due + weak.length,
    avg: sum.avg,
    count: sum.count
  };
}
