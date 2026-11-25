// sm2.js — 简化 SM-2 间隔重复（v1.10 T19，ESM 单一来源）
//
// 逻辑与 js/spaced-repetition.js 完全一致（该 IIFE 保留同实现并在启动后
// 动态 import 本模块覆盖同名方法）；两份由 test-esm-batch2.mjs 对拍。
//
// 卡片 = { ease: 难度系数(≥1.3), interval: 间隔天数, due: 下次复习时间戳, reps: 连对次数 }

export var DAY = 86400000;

export function initCard(now) {
  return { ease: 2.5, interval: 0, due: now || Date.now(), reps: 0 };
}

export function schedule(card, remembered, now) {
  var n = now || Date.now();
  var c = {
    ease: (card && typeof card.ease === 'number') ? card.ease : 2.5,
    interval: (card && card.interval) || 0,
    due: (card && card.due) || n,
    reps: (card && card.reps) || 0
  };
  if (remembered) {
    c.reps += 1;
    c.interval = c.reps === 1 ? 1 : (c.reps === 2 ? 3 : Math.max(1, Math.round(c.interval * c.ease)));
    c.due = n + c.interval * DAY;
  } else {
    c.reps = 0;
    c.interval = 0;
    c.ease = Math.max(1.3, c.ease - 0.2);
    c.due = n + 10 * 60000;
  }
  return c;
}

export function isDue(card, now) {
  if (!card || typeof card.due !== 'number') return true;
  return card.due <= (now || Date.now());
}

export function dueLabel(card, now) {
  if (isDue(card, now)) return '今天应复习';
  var days = Math.ceil((card.due - (now || Date.now())) / DAY);
  return days + ' 天后复习';
}
